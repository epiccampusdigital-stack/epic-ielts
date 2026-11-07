// General English listening papers must have real audio. Remove the ones that do not.
// Kept: Listening 002 · Mock test (GE-C4L) and the placement test listening (GE-PT*).
// A paper students have already taken is hidden (ARCHIVED) instead of deleted, so their results stay.
async function removeSilentGeListening(prisma) {
  const papers = await prisma.paper.findMany({
    where: { track: 'GENERAL', testType: 'LISTENING', status: { not: 'ARCHIVED' } },
    select: { id: true, paperCode: true, title: true, audioUrl: true, sections: { select: { audioUrl: true } } },
  });
  const out = { deleted: [], hidden: [], kept: [] };
  for (const p of papers) {
    const code = String(p.paperCode || '');
    const hasAudio = !!p.audioUrl || p.sections.some(s => s.audioUrl);
    if (code === 'GE-C4L' || code.startsWith('GE-PT') || hasAudio) { out.kept.push(code); continue; }
    if (await prisma.attempt.count({ where: { paperId: p.id } })) {
      await prisma.paper.update({ where: { id: p.id }, data: { status: 'ARCHIVED' } });
      out.hidden.push(code);
    } else {
      await prisma.paper.delete({ where: { id: p.id } });
      out.deleted.push(code);
    }
  }
  return out;
}
module.exports = { removeSilentGeListening };
