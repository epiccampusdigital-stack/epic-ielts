// General English practice papers are named "GE Reading 001", "GE Writing 001", "GE Listening 001", ...
// Weekly quizzes (GE-W1..) and placement tests (GE-PT..) keep their own names.
// A paper keeps its number once it has one; new papers get the next free number.
const TYPES = { READING: 'Reading', WRITING: 'Writing', LISTENING: 'Listening' };
const NAMED = /^GE (Reading|Writing|Listening) (\d{3})$/;
const skip = code => /^GE-W\d/.test(code) || /^GE-PT/.test(code);

// Fixed order for the papers we already have, so the first numbering matches the old names
const FIRST = {
  READING: ['GE-C1R', 'GE-C2R', 'GE-C3R', 'GE-C4R', 'GE-C5R', 'GE-C6R', 'GE-C7R', 'GE-C8R', 'GE-C9R'],
  WRITING: ['GE-C1W', 'GE-C2W', 'GE-C3W', 'GE-C4W', 'GE-C5W', 'GE-C6W', 'GE-C7W', 'GE-C8W', 'GE-C9W'],
  LISTENING: ['GE-L1', 'GE-C4L', 'GE-L2', 'GE-L3', 'GE-L4', 'GE-C5L', 'GE-C6L', 'GE-C7L', 'GE-C8L', 'GE-C9L'],
};
const label = (type, n) => `GE ${TYPES[type]} ${String(n).padStart(3, '0')}`;

async function usedNumbers(prisma, type) {
  const rows = await prisma.paper.findMany({ where: { track: 'GENERAL', testType: type }, select: { title: true } });
  const used = new Set();
  rows.forEach(r => { const m = String(r.title || '').match(NAMED); if (m) used.add(parseInt(m[2], 10)); });
  return used;
}
async function nextGeTitle(prisma, type) {
  const used = await usedNumbers(prisma, type);
  let n = 1; while (used.has(n)) n++;
  return label(type, n);
}

async function renameGePapers(prisma) {
  const out = {};
  for (const type of Object.keys(TYPES)) {
    const papers = await prisma.paper.findMany({
      where: { track: 'GENERAL', testType: type },
      select: { id: true, paperCode: true, title: true, order: true },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
    const todo = papers.filter(p => !skip(String(p.paperCode || '')) && !NAMED.test(String(p.title || '')));
    if (!todo.length) continue;
    const rank = p => { const i = FIRST[type].indexOf(p.paperCode); return i < 0 ? 1000 : i; };
    todo.sort((a, b) => rank(a) - rank(b) || (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
    const used = await usedNumbers(prisma, type);
    let n = 1;
    for (const p of todo) {
      while (used.has(n)) n++;
      used.add(n);
      const title = label(type, n);
      await prisma.paper.update({ where: { id: p.id }, data: { title } });
      out[p.paperCode] = title;
    }
  }
  return out;
}

module.exports = { renameGePapers, nextGeTitle, geLabel: label };
