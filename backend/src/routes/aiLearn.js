// AI Learn: an English tutor chat for students.
// It is closed by default to save API credits. Admin or a teacher opens it for 10, 20, 30 or 60 minutes.
// The tutor sees the student's recent results so it can give practice that fixes their weak points.
const router = require('express').Router();
const auth = require('../middleware/auth');
const { prisma } = require('../services/programService');

const KEY = 'aiLearnOpenUntil';
const MODEL = process.env.AI_LEARN_MODEL || 'claude-haiku-4-5';
const PER_STUDENT_LIMIT = parseInt(process.env.AI_LEARN_LIMIT || '25', 10); // questions per student per open window
const STAFF = ['ADMIN', 'TEACHER', 'PROGRAM_TEACHER'];
const isStaff = req => STAFF.includes(req.user?.role);

let cachedUntil = null; // { at, value }
async function openUntil() {
  if (cachedUntil && Date.now() - cachedUntil.at < 5000) return cachedUntil.value;
  let value = 0;
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: KEY } });
    value = row ? parseInt(row.value, 10) || 0 : 0;
  } catch { value = 0; }
  cachedUntil = { at: Date.now(), value };
  return value;
}
async function setOpenUntil(ms) {
  await prisma.appSetting.upsert({ where: { key: KEY }, update: { value: String(ms) }, create: { key: KEY, value: String(ms) } });
  cachedUntil = { at: Date.now(), value: ms };
  usage.clear(); // a new window gives every student a fresh allowance
}
const usage = new Map(); // studentId -> count in this window

const status = async () => {
  const until = await openUntil();
  const left = Math.max(0, Math.round((until - Date.now()) / 1000));
  return { open: left > 0, openUntil: left > 0 ? until : null, secondsLeft: left };
};

router.get('/status', auth, async (req, res) => {
  res.json({ ...(await status()), limit: PER_STUDENT_LIMIT, used: usage.get(req.user.id) || 0, staff: isStaff(req) });
});

// Admin / teachers: open for N minutes, or close now
router.post('/open', auth, async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff can open AI Learn' });
  const minutes = parseInt(req.body?.minutes, 10);
  if (![5, 10, 20, 30, 45, 60].includes(minutes)) return res.status(400).json({ error: 'Choose 10, 20, 30 or 60 minutes' });
  await setOpenUntil(Date.now() + minutes * 60000);
  res.json(await status());
});
router.post('/close', auth, async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff can close AI Learn' });
  await setOpenUntil(0);
  res.json(await status());
});

// What the tutor knows about the student: recent scores and mistakes
async function studentContext(studentId) {
  const attempts = await prisma.attempt.findMany({
    where: { studentId, status: 'COMPLETED' },
    orderBy: { id: 'desc' },
    take: 12,
    include: {
      paper: { select: { title: true, testType: true, track: true, _count: { select: { questions: true } } } },
      result: { select: { rawScore: true, bandEstimate: true, weaknesses: true } },
      writingSubmission: { select: { overallBand: true, aiFeedback: true } },
      answers: {
        where: { isCorrect: false },
        take: 6,
        select: { studentAnswer: true, question: { select: { content: true, correctAnswer: true, questionType: true } } },
      },
    },
  });
  if (!attempts.length) return 'The student has not finished any papers yet.';
  const lines = attempts.map(a => {
    const p = a.paper || {};
    const total = p._count?.questions || 0;
    const score = a.result?.rawScore != null && total ? `${a.result.rawScore}/${total}` : '';
    const band = a.writingSubmission?.overallBand ?? a.result?.bandEstimate;
    let s = `- ${p.testType || ''} "${p.title || ''}" (${p.track || ''}): ${score}${band ? ` band ${band}` : ''}`;
    if (a.result?.weaknesses) s += `\n  Weak points noted: ${String(a.result.weaknesses).slice(0, 300)}`;
    if (a.writingSubmission?.aiFeedback) s += `\n  Writing feedback: ${String(a.writingSubmission.aiFeedback).replace(/\s+/g, ' ').slice(0, 400)}`;
    for (const w of a.answers) {
      s += `\n  Wrong: "${String(w.question?.content || '').slice(0, 110)}" student wrote "${String(w.studentAnswer).slice(0, 40)}", correct "${String(w.question?.correctAnswer || '').slice(0, 40)}"`;
    }
    return s;
  });
  return lines.join('\n').slice(0, 6000);
}

const SYSTEM = (name, context) => `You are "AI Learn", a friendly English tutor on the EPIC Campus learning site.
Your students are Sri Lankan, about 18 to 24 years old, at A2 to B1 level, preparing to study in Korea on a scholarship (everyday English, IELTS practice and the scholarship interview).

Rules:
- Only help with English and learning: grammar, vocabulary, meanings, pronunciation tips, reading, writing, listening, speaking, emails and messages, IELTS, study skills, and life as a student in Korea in English.
- If the question is about something else, politely say you can only help with English and learning, and suggest an English question they could ask instead.
- Use simple, clear English. Short sentences. Give examples. Use short lists when helpful.
- When you correct a sentence, show the corrected sentence and explain the rule in one line.
- When the student asks what to practise, or asks for homework or custom work, look at their results below, name 1 to 3 weak points, and give a short practice set (5 to 8 questions) with the answers at the end under "Answers".
- Never write a full essay or assignment for them to copy. Help them improve their own writing.
- Do not ask for or repeat personal details like passwords or phone numbers.

The student's name is ${name || 'the student'}.
Their recent results on the site (newest first):
${context}`;

let anthropic = null;
router.post('/ask', auth, async (req, res) => {
  try {
    const st = await status();
    if (!st.open && !isStaff(req)) return res.status(423).json({ error: 'AI Learn is closed right now. Your teacher will open it in class.', closed: true });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'AI Learn is not set up on the server.' });
    const used = usage.get(req.user.id) || 0;
    if (!isStaff(req) && used >= PER_STUDENT_LIMIT) return res.status(429).json({ error: `You have used all ${PER_STUDENT_LIMIT} questions for this session. Great work!` });

    const history = (Array.isArray(req.body?.messages) ? req.body.messages : [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
    if (!history.length || history[history.length - 1].role !== 'user') return res.status(400).json({ error: 'Type a question first' });
    while (history.length && history[0].role !== 'user') history.shift();

    const student = await prisma.student.findUnique({ where: { id: req.user.id }, select: { name: true } });
    const context = await studentContext(req.user.id);
    if (!anthropic) { const Anthropic = require('@anthropic-ai/sdk'); anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
    const r = await anthropic.messages.create({ model: MODEL, max_tokens: 1200, system: SYSTEM(student?.name, context), messages: history });
    const answer = (r.content || []).map(c => c.text || '').join('').trim();
    usage.set(req.user.id, used + 1);
    res.json({ answer, used: used + 1, limit: PER_STUDENT_LIMIT, secondsLeft: st.secondsLeft });
  } catch (e) {
    console.error('[ai-learn]', e.message);
    res.status(500).json({ error: 'AI Learn could not answer just now. Please try again.' });
  }
});

module.exports = router;
