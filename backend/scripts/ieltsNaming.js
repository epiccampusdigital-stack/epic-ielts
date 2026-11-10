// IELTS practice papers are named "IELTS Reading 001", "IELTS Listening 001", "IELTS Writing 001", "IELTS Speaking 001".
// A paper with a number code (001, 2, 03 ...) keeps that number, so the name matches its code.
// Other papers get the next free number.
const TYPES = { READING: 'Reading', WRITING: 'Writing', LISTENING: 'Listening', SPEAKING: 'Speaking' };
const NAMED = /^IELTS (Reading|Writing|Listening|Speaking) (\d{3})$/;
const label = (type, n) => `IELTS ${TYPES[type]} ${String(n).padStart(3, '0')}`;

async function renameIeltsPapers(prisma) {
  const out = {};
  for (const type of Object.keys(TYPES)) {
    const papers = await prisma.paper.findMany({
      where: { track: 'IELTS', testType: type },
      select: { id: true, paperCode: true, title: true, order: true },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
    const used = new Set();
    papers.forEach(p => { const m = String(p.title || '').match(NAMED); if (m && TYPES[type] === m[1]) used.add(parseInt(m[2], 10)); });
    const numeric = p => { const c = String(p.paperCode || '').trim(); return /^\d{1,3}$/.test(c) ? parseInt(c, 10) : null; };
    // first the papers whose code is a number, so "001" becomes "IELTS Reading 001"
    for (const p of papers) {
      const n = numeric(p);
      if (n == null || n < 1) continue;
      const want = label(type, n);
      if (p.title === want) { used.add(n); continue; }
      if (used.has(n) && !NAMED.test(String(p.title || ''))) continue; // number taken by another paper; numbered below
      await prisma.paper.update({ where: { id: p.id }, data: { title: want } });
      used.add(n); out[`${type}:${p.paperCode}`] = want;
    }
    // then any paper still without a proper name
    let n = 1;
    for (const p of papers) {
      const fresh = out[`${type}:${p.paperCode}`];
      if (fresh || NAMED.test(String(p.title || ''))) continue;
      while (used.has(n)) n++;
      used.add(n);
      const title = label(type, n);
      await prisma.paper.update({ where: { id: p.id }, data: { title } });
      out[`${type}:${p.paperCode}`] = title;
    }
  }
  return out;
}

module.exports = { renameIeltsPapers, ieltsLabel: label };
