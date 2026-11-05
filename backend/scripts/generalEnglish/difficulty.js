// Difficulty stars for General English papers: 1 star = A1, 2 = A2, 3 = B1, 4 = B1+, 5 = B2.
// Only fills papers that have no stars yet, so a teacher's change is never overwritten.
const LEVELS = {
  1: { name: 'Beginner', cefr: 'A1' },
  2: { name: 'Elementary', cefr: 'A2' },
  3: { name: 'Intermediate', cefr: 'B1' },
  4: { name: 'Upper intermediate', cefr: 'B1+' },
  5: { name: 'Advanced', cefr: 'B2' },
};
const DEFAULT_STARS = {
  'GE-C1R': 1, 'GE-C2R': 2, 'GE-C3R': 2, 'GE-C4R': 3, 'GE-C4L': 3,
  'GE-C1W': 1, 'GE-C2W': 2, 'GE-C3W': 3,
  'GE-W1': 1, 'GE-W2': 1, 'GE-W3': 2, 'GE-W4': 2, 'GE-W5': 3,
  'GE-PT1': 2, 'GE-PT2': 2, 'GE-PT3': 2, 'GE-PT4': 2,
};
async function applyGeDifficulty(prisma) {
  let set = 0;
  const papers = await prisma.paper.findMany({ where: { track: 'GENERAL', difficulty: null }, select: { id: true, paperCode: true } });
  for (const p of papers) {
    const stars = DEFAULT_STARS[p.paperCode] || (/^GE-L\d/.test(p.paperCode) ? 4 : null);
    if (stars) { await prisma.paper.update({ where: { id: p.id }, data: { difficulty: stars } }); set++; }
  }
  return { set };
}
module.exports = { LEVELS, DEFAULT_STARS, applyGeDifficulty };
