// Exam tab: class exams that stay locked until a teacher opens them.
// A paper's status is EXAM_LOCKED or EXAM_OPEN; exam papers never show in Practice (that lists ACTIVE only).
const router = require('express').Router();
const auth = require('../middleware/auth');

// Each exam is one sitting made of parts done in order.
const EXAMS = [
  { id: 'paper1', title: 'Exam Paper 1', subtitle: 'IELTS Reading and Writing · 1 hour', codes: ['EX1-R', 'EX1-W'] },
  // Midway final exam: 25 + 45 + 60 minutes of work on one 2.5-hour timer
  // oneTimer: one clock for the whole paper; each part opens straight after the one before
  // holdResults: students see no score or answers until a teacher presses "Release results"
  { id: 'paper2', title: 'Exam Paper 2 · Midway Final Exam', subtitle: 'IELTS Listening, Reading and Writing · one timer, 2.5 hours', codes: ['EX2-L', 'EX2-R', 'EX2-W'], needsAudio: true, oneTimer: true, totalMinutes: 150 },
  // Final exam: each part keeps its OWN timer; when a part ends (time up or submitted), a 10-second countdown
  // shows and the next part opens by itself (autoNext). Results stay hidden until a teacher releases them.
  { id: 'final', title: 'Final Exam', subtitle: 'IELTS Listening (40 min), Reading (60 min) and Writing (60 min) · each part has its own timer', codes: ['EX3-L', 'EX3-R', 'EX3-W'], needsAudio: true, autoNext: true, holdResults: true },
];
const STAFF = ['ADMIN', 'TEACHER', 'PROGRAM_TEACHER'];

// ─── Results on hold: AppSetting exam.results.<id> = 'released' | 'held' (default from holdResults) ──
const resultsKey = id => `exam.results.${id}`;
let heldCache = { at: 0, ids: null };
async function heldExamIds() {
  if (heldCache.ids && Date.now() - heldCache.at < 20000) return heldCache.ids;
  const { prisma } = require('../services/programService');
  const rows = await prisma.appSetting.findMany({ where: { key: { in: EXAMS.map(e => resultsKey(e.id)) } } });
  const ids = new Set(EXAMS.filter(e => { const v = rows.find(r => r.key === resultsKey(e.id))?.value; return v ? v === 'held' : !!e.holdResults; }).map(e => e.id));
  heldCache = { at: Date.now(), ids };
  return ids;
}
async function heldPaperCodes() {
  const ids = await heldExamIds();
  return new Set(EXAMS.filter(e => ids.has(e.id)).flatMap(e => e.codes));
}
const isStaff = req => STAFF.includes(req.user?.role);

async function build(prisma, studentId, staff) {
  const codes = EXAMS.flatMap(e => e.codes);
  const papers = await prisma.paper.findMany({
    where: { paperCode: { in: codes }, status: { startsWith: 'EXAM' } },
    select: { id: true, paperCode: true, testType: true, title: true, timeLimitMin: true, status: true, sections: { select: { audioUrl: true } } },
  });
  const ids = papers.map(p => p.id);
  const attempts = ids.length ? await prisma.attempt.findMany({
    where: staff ? { paperId: { in: ids }, status: 'COMPLETED' } : { paperId: { in: ids }, studentId },
    select: { id: true, paperId: true, status: true, studentId: true }, orderBy: { id: 'desc' },
  }) : [];
  const held = await heldExamIds();
  return EXAMS.map(e => {
    const parts = e.codes.map(c => papers.find(p => p.paperCode === c)).filter(Boolean).map(p => {
      const mine = attempts.filter(a => a.paperId === p.id);
      const done = mine.find(a => a.status === 'COMPLETED');
      const going = mine.find(a => a.status === 'IN_PROGRESS');
      return {
        paperId: p.id, code: p.paperCode, testType: p.testType, title: p.title, timeLimitMin: p.timeLimitMin,
        ...(staff ? { finishedBy: new Set(mine.map(a => a.studentId)).size }
          : { done: !!done, attemptId: (done || going)?.id || null, inProgress: !done && !!going }),
      };
    });
    if (!parts.length || parts.length < e.codes.length) return null;
    // an exam with listening appears only when every listening part has its recording
    if (e.needsAudio && papers.some(p => e.codes.includes(p.paperCode) && p.testType === 'LISTENING' && (!p.sections.length || p.sections.some(s => !s.audioUrl)))) return null;
    const open = parts.every(p => papers.find(x => x.id === p.paperId).status === 'EXAM_OPEN');
    return { id: e.id, title: e.title, subtitle: e.subtitle, open, released: !held.has(e.id), oneTimer: !!e.oneTimer, autoNext: !!(e.oneTimer || e.autoNext), totalMinutes: e.totalMinutes || parts.reduce((a, p) => a + p.timeLimitMin, 0), parts };
  }).filter(Boolean);
}

router.get('/', auth, async (req, res) => {
  try {
    const { prisma } = require('../services/programService');
    res.json({ exams: await build(prisma, req.user.id, isStaff(req)) });
  } catch (err) {
    console.error('[exams] list', err.message);
    res.status(500).json({ error: 'Could not load the exams' });
  }
});

router.post('/:id/:action', auth, async (req, res) => {
  try {
    if (!['open', 'lock', 'release', 'hold'].includes(req.params.action)) return res.status(404).json({ error: 'Unknown action' });
    if (!isStaff(req)) return res.status(403).json({ error: 'Only teachers can change an exam' });
    const exam = EXAMS.find(e => e.id === req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    const { prisma } = require('../services/programService');
    if (req.params.action === 'release' || req.params.action === 'hold') {
      const value = req.params.action === 'release' ? 'released' : 'held';
      await prisma.appSetting.upsert({ where: { key: resultsKey(exam.id) }, update: { value }, create: { key: resultsKey(exam.id), value } });
      heldCache = { at: 0, ids: null };
      console.log(`[exams] ${exam.id} results ${value} by ${req.user.id}`);
      return res.json({ ok: true, released: value === 'released' });
    }
    const status = req.params.action === 'open' ? 'EXAM_OPEN' : 'EXAM_LOCKED';
    const r = await prisma.paper.updateMany({ where: { paperCode: { in: exam.codes }, status: { startsWith: 'EXAM' } }, data: { status } });
    console.log(`[exams] ${exam.id} ${req.params.action} by ${req.user.id}: ${r.count} papers`);
    res.json({ ok: true, open: status === 'EXAM_OPEN', papers: r.count });
  } catch (err) {
    console.error('[exams] toggle', err.message);
    res.status(500).json({ error: 'Could not change the exam' });
  }
});


// One results sheet for a whole exam: every part's score, band and answers, plus an overall band.
function overallBand(bands) {
  const avg = bands.reduce((a, b) => a + b, 0) / bands.length;
  const frac = avg - Math.floor(avg);
  return frac < 0.25 ? Math.floor(avg) : frac < 0.75 ? Math.floor(avg) + 0.5 : Math.ceil(avg); // IELTS rounding
}
const firstAnswer = a => String(a || '').split('|')[0];
// Short audio clips of the moment each listening answer is spoken (cut from the exam recording)
const CLIP_DIRS = { 'EX2-L': 'exam2-clips' };
function answerClip(code, n) {
  const dir = CLIP_DIRS[code];
  if (!dir) return null;
  const file = `q${String(n).padStart(2, '0')}.mp3`;
  return require('fs').existsSync(require('path').join(__dirname, '../../public-media', dir, file)) ? `/media/${dir}/${file}` : null;
}

// One student's full results sheet for an exam (used by the student page and the teacher PDF)
async function sheetFor(prisma, exam, studentId) {
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { name: true } }).catch(() => null);
    const parts = [];
    for (const code of exam.codes) {
      const paper = await prisma.paper.findFirst({ where: { paperCode: code, status: { startsWith: 'EXAM' } }, select: { id: true, testType: true, title: true } });
      if (!paper) continue;
      const attempt = await prisma.attempt.findFirst({
        where: { studentId, paperId: paper.id, status: 'COMPLETED' }, orderBy: { id: 'desc' },
        include: { result: true, writingSubmission: true, answers: true, paper: { include: { questions: { orderBy: { questionNumber: 'asc' } }, writingTasks: { orderBy: { taskNumber: 'asc' } } } } },
      });
      if (!attempt) { parts.push({ testType: paper.testType, title: paper.title, done: false }); continue; }
      if (paper.testType === 'WRITING') {
        const w = attempt.writingSubmission || {};
        let fb = {}; try { fb = JSON.parse(w.aiFeedback || '{}'); } catch { /* none */ }
        parts.push({
          testType: 'WRITING', title: paper.title, done: true, attemptId: attempt.id, marking: w.markingStatus || 'PENDING',
          band: w.overallBand ?? null, task1Band: w.task1Band ?? null, task2Band: w.task2Band ?? null,
          tasks: attempt.paper.writingTasks.map(t => ({ taskNumber: t.taskNumber, prompt: t.prompt, words: t.taskNumber === 1 ? w.task1WordCount : w.task2WordCount, feedback: (t.taskNumber === 1 ? fb.task1 : fb.task2)?.feedback || null })),
          strengths: fb.strengths || [], improvements: fb.improvements || [],
        });
        continue;
      }
      const byQ = new Map(attempt.answers.map(a => [a.questionId, a]));
      const questions = attempt.paper.questions.map(q => {
        const a = byQ.get(q.id);
        const opts = Array.isArray(q.options) ? q.options : null;
        const show = v => { const t = firstAnswer(v); if (opts && /^[A-H]$/i.test(t)) { const o = opts.find(x => String(x).toUpperCase().startsWith(t.toUpperCase() + '.')); return o || t; } return t; };
        return { n: q.questionNumber, question: q.content, yours: a?.studentAnswer ? show(a.studentAnswer) : '', correct: show(q.correctAnswer), isCorrect: !!a?.isCorrect, why: q.explanation || null, clip: answerClip(code, q.questionNumber) };
      });
      const score = questions.filter(q => q.isCorrect).length;
      parts.push({ testType: paper.testType, title: paper.title, done: true, attemptId: attempt.id, score, total: questions.length, band: attempt.result?.bandEstimate ?? null, questions });
    }
    const bands = parts.filter(p => p.done && p.band != null).map(p => Number(p.band));
    const waiting = parts.some(p => !p.done) || parts.some(p => p.testType === 'WRITING' && p.done && p.band == null);
    return {
      exam: { id: exam.id, title: exam.title }, student: student?.name || '',
      overall: bands.length ? { band: overallBand(bands), from: bands.length, complete: !waiting } : null,
      totalScore: parts.filter(p => p.total).reduce((a, p) => a + p.score, 0), totalQuestions: parts.filter(p => p.total).reduce((a, p) => a + p.total, 0),
      parts,
    };
}

// Teachers: every student's results sheet for one exam, for the class summary and the PDF
router.get('/:id/class', auth, async (req, res) => {
  try {
    if (!isStaff(req)) return res.status(403).json({ error: 'Teachers only' });
    const { prisma } = require('../services/programService');
    const exam = EXAMS.find(e => e.id === req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    const papers = await prisma.paper.findMany({ where: { paperCode: { in: exam.codes }, status: { startsWith: 'EXAM' } }, select: { id: true } });
    const done = await prisma.attempt.findMany({ where: { paperId: { in: papers.map(p => p.id) }, status: 'COMPLETED', student: { role: 'STUDENT' } }, select: { studentId: true }, distinct: ['studentId'] });
    const sheets = [];
    for (const d of done) sheets.push({ studentId: d.studentId, ...(await sheetFor(prisma, exam, d.studentId)) });
    sheets.sort((a, b) => (b.overall?.band ?? -1) - (a.overall?.band ?? -1) || a.student.localeCompare(b.student));
    res.json({ exam: { id: exam.id, title: exam.title, codes: exam.codes }, released: !(await heldExamIds()).has(exam.id), sheets });
  } catch (err) {
    console.error('[exams] class', err.message);
    res.status(500).json({ error: 'Could not load the class results' });
  }
});

// A student's journey: placement band, then each class exam's score and band (only when results are released).
// Used at the top of the Exam tab and on the dashboard.
// The General English placement test (Day 1): latest score per skill out of 100, the average and the level.
const GE_PARTS = ['READING', 'LISTENING', 'WRITING', 'SPEAKING'];
const geLevel = n => (n == null ? null : n >= 90 ? 'B2' : n >= 75 ? 'B1' : n >= 50 ? 'A2' : n >= 25 ? 'A1' : 'Pre-A1');
async function gePlacementFor(prisma, studentId) {
  const rows = await prisma.attempt.findMany({
    where: { studentId, isPlacement: true, status: 'COMPLETED', paper: { track: 'GENERAL', paperCode: { startsWith: 'GE-PT' } } },
    orderBy: { endedAt: 'desc' },
    select: { paper: { select: { testType: true, _count: { select: { questions: true } } } }, result: { select: { rawScore: true } } },
  });
  if (!rows.length) return null;
  const parts = {};
  for (const a of rows) {
    const t = a.paper.testType;
    if (t in parts) continue;
    const raw = a.result?.rawScore;
    parts[t] = raw == null ? null : (t === 'WRITING' || t === 'SPEAKING') ? Math.round(raw) : a.paper._count.questions ? Math.round((raw / a.paper._count.questions) * 100) : null;
  }
  const got = GE_PARTS.map(p => parts[p]).filter(v => v != null);
  const score = got.length ? Math.round(got.reduce((x, y) => x + y, 0) / got.length) : null;
  return { score, level: got.length === GE_PARTS.length ? geLevel(score) : null, skills: GE_PARTS.filter(p => p in parts).map(p => ({ testType: p, score: parts[p] })) };
}

router.get('/progress', auth, async (req, res) => {
  try {
    const { prisma } = require('../services/programService');
    const me = await prisma.student.findUnique({ where: { id: req.user.id }, select: { placementDone: true, placementBand: true } });
    const list = await build(prisma, req.user.id, false);
    const held = await heldExamIds();
    const exams = [];
    for (const e of list) {
      const allDone = e.parts.every(p => p.done);
      const anyDone = e.parts.some(p => p.done);
      const row = { id: e.id, title: e.title, parts: e.parts.length };
      if (!anyDone) { exams.push({ ...row, state: e.open ? 'open' : 'locked' }); continue; }
      if (!allDone) { exams.push({ ...row, state: 'in-progress' }); continue; }
      if (held.has(e.id)) { exams.push({ ...row, state: 'held' }); continue; }
      const sh = await sheetFor(prisma, EXAMS.find(x => x.id === e.id), req.user.id);
      exams.push({
        ...row, state: sh.overall?.complete ? 'ready' : 'marking',
        band: sh.overall?.complete ? sh.overall.band : null,
        score: sh.totalScore, total: sh.totalQuestions,
        skills: sh.parts.filter(p => p.done).map(p => ({ testType: p.testType, band: p.band ?? null, score: p.score ?? null, total: p.total ?? null, marking: p.testType === 'WRITING' && p.band == null })),
      });
    }
    // Programme students took the General English placement (scores out of 100); others may have an IELTS placement band
    const ge = await gePlacementFor(prisma, req.user.id);
    const placement = ge || (me?.placementDone && me.placementBand != null ? { band: Number(me.placementBand) } : null);
    if (placement && ge && me?.placementDone && me.placementBand != null) placement.band = Number(me.placementBand);
    res.json({ staff: isStaff(req), placement, exams });
  } catch (err) {
    console.error('[exams] progress', err.message);
    res.status(500).json({ error: 'Could not load your progress' });
  }
});

router.get('/:id/results', auth, async (req, res) => {
  try {
    const { prisma } = require('../services/programService');
    const exam = EXAMS.find(e => e.id === req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    if (!isStaff(req) && (await heldExamIds()).has(exam.id)) return res.status(403).json({ error: 'RESULTS_HELD', message: 'Your teacher will share the results soon.' });
    const studentId = isStaff(req) && req.query.studentId ? parseInt(req.query.studentId, 10) : req.user.id;
    res.json(await sheetFor(prisma, exam, studentId));
  } catch (err) {
    console.error('[exams] results', err.message);
    res.status(500).json({ error: 'Could not load the results' });
  }
});

// One timer for the whole exam: every part counts down from the moment the first part started.
async function oneTimer(prisma, attempt) {
  const exam = EXAMS.find(e => e.oneTimer && e.codes.includes(attempt?.paper?.paperCode));
  if (!exam) return null;
  const first = await prisma.attempt.findFirst({
    where: { studentId: attempt.studentId, paper: { paperCode: { in: exam.codes }, status: { startsWith: 'EXAM' } } },
    orderBy: { startedAt: 'asc' }, select: { startedAt: true },
  });
  return first ? { startedAt: first.startedAt, minutes: exam.totalMinutes } : null;
}

module.exports = router;
module.exports.EXAMS = EXAMS;
module.exports.oneTimer = oneTimer;
module.exports.overallBand = overallBand;
module.exports.heldPaperCodes = heldPaperCodes;
