// Exam tab: class exams that stay locked until a teacher opens them.
// A paper's status is EXAM_LOCKED or EXAM_OPEN; exam papers never show in Practice (that lists ACTIVE only).
const router = require('express').Router();
const auth = require('../middleware/auth');

// Each exam is one sitting made of parts done in order.
const EXAMS = [
  { id: 'paper1', title: 'Exam Paper 1', subtitle: 'IELTS Reading and Writing · 1 hour', codes: ['EX1-R', 'EX1-W'] },
];
const STAFF = ['ADMIN', 'TEACHER', 'PROGRAM_TEACHER'];
const isStaff = req => STAFF.includes(req.user?.role);

async function build(prisma, studentId, staff) {
  const codes = EXAMS.flatMap(e => e.codes);
  const papers = await prisma.paper.findMany({
    where: { paperCode: { in: codes }, status: { startsWith: 'EXAM' } },
    select: { id: true, paperCode: true, testType: true, title: true, timeLimitMin: true, status: true },
  });
  const ids = papers.map(p => p.id);
  const attempts = ids.length ? await prisma.attempt.findMany({
    where: staff ? { paperId: { in: ids }, status: 'COMPLETED' } : { paperId: { in: ids }, studentId },
    select: { id: true, paperId: true, status: true, studentId: true }, orderBy: { id: 'desc' },
  }) : [];
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
    if (!parts.length) return null;
    const open = parts.every(p => papers.find(x => x.id === p.paperId).status === 'EXAM_OPEN');
    return { id: e.id, title: e.title, subtitle: e.subtitle, open, totalMinutes: parts.reduce((a, p) => a + p.timeLimitMin, 0), parts };
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
    if (!['open', 'lock'].includes(req.params.action)) return res.status(404).json({ error: 'Unknown action' });
    if (!isStaff(req)) return res.status(403).json({ error: 'Only teachers can open or lock an exam' });
    const exam = EXAMS.find(e => e.id === req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    const { prisma } = require('../services/programService');
    const status = req.params.action === 'open' ? 'EXAM_OPEN' : 'EXAM_LOCKED';
    const r = await prisma.paper.updateMany({ where: { paperCode: { in: exam.codes }, status: { startsWith: 'EXAM' } }, data: { status } });
    console.log(`[exams] ${exam.id} ${req.params.action} by ${req.user.id}: ${r.count} papers`);
    res.json({ ok: true, open: status === 'EXAM_OPEN', papers: r.count });
  } catch (err) {
    console.error('[exams] toggle', err.message);
    res.status(500).json({ error: 'Could not change the exam' });
  }
});

module.exports = router;
module.exports.EXAMS = EXAMS;
