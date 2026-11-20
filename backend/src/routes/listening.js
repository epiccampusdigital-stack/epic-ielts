// Listening practice: sentences for dictation taken from the reading papers.
// Students only get passages from reading papers they have finished, so the practice never gives away answers.
const router = require('express').Router();
const auth = require('../middleware/auth');

function sentencesOf(text) {
  const clean = String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*[A-H]\s*$/gm, ' ')          // paragraph letters on their own line
    .replace(/^\s*[A-H][.)]?\s+(?=[A-Z])/gm, '') // "A  The first..." paragraph labels
    .replace(/\s+/g, ' ')
    .trim();
  const parts = clean.split(/(?<=[.!?])\s+(?=[A-Z"'‘“])/);
  const out = [];
  for (let s of parts) {
    s = s.trim();
    const words = s.split(' ').length;
    if (words < 6 || words > 24) continue;
    if (!/[.!?]["'’”]?$/.test(s)) continue;
    if (/[;:()\[\]]/.test(s)) continue;
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

router.get('/reading-sentences', auth, async (req, res) => {
  try {
    const { prisma } = require('../services/programService');
    const staff = req.user.role === 'ADMIN' || req.user.role === 'TEACHER';
    let paperIds = null;
    if (!staff) {
      const done = await prisma.attempt.findMany({
        where: { studentId: req.user.id, status: 'COMPLETED', paper: { testType: 'READING' } },
        select: { paperId: true },
      });
      paperIds = [...new Set(done.map(a => a.paperId))];
      if (!paperIds.length) return res.json({ papers: [] });
    }
    const papers = await prisma.paper.findMany({
      where: { testType: 'READING', ...(paperIds ? { id: { in: paperIds } } : { status: { in: ['ACTIVE', 'PUBLISHED'] } }) },
      select: { id: true, title: true, track: true, passages: { select: { passageNumber: true, title: true, text: true }, orderBy: { passageNumber: 'asc' } } },
      orderBy: [{ track: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    });
    res.json({
      papers: papers.map(p => ({
        id: p.id, title: p.title, track: p.track,
        passages: p.passages.map(x => ({ number: x.passageNumber, title: x.title, sentences: sentencesOf(x.text) })).filter(x => x.sentences.length),
      })).filter(p => p.passages.length),
    });
  } catch (err) {
    console.error('[listening] reading-sentences', err.message);
    res.status(500).json({ error: 'Could not load the reading sentences' });
  }
});

module.exports = router;
module.exports.sentencesOf = sentencesOf;
