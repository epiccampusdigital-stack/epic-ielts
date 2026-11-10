// "Suggested for you" on the student dashboard.
// Order: 1) papers the student started and did not finish, 2) papers a teacher sent as a task in Messages,
// 3) for each skill, weakest first, the next paper they have not done at a level that fits their scores.
const SKILLS = { GENERAL: ['READING', 'LISTENING', 'WRITING'], IELTS: ['READING', 'LISTENING', 'WRITING', 'SPEAKING'] };
const NAME = { READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing', SPEAKING: 'Speaking' };
const PAPER_SELECT = { id: true, title: true, testType: true, difficulty: true, topic: true, timeLimitMin: true, paperCode: true, order: true, audioUrl: true, sections: { select: { audioUrl: true } } };

// Score out of 100 for any finished attempt (IELTS bands are turned into a percentage of band 9)
function score100(a) {
  const band = a.writingSubmission?.overallBand ?? a.speakingSubmission?.overallBand ?? a.result?.overrideBand ?? a.result?.bandEstimate;
  const raw = a.result?.rawScore;
  if (a.paper?.track === 'IELTS' && band != null) return Math.round((Number(band) / 9) * 100);
  if (raw == null) return band != null ? Math.round((Number(band) / 9) * 100) : null;
  if (a.paper?.testType === 'WRITING' || a.paper?.testType === 'SPEAKING') return Math.round(raw);
  const total = a.paper?._count?.questions;
  return total ? Math.round((raw / total) * 100) : null;
}
// Stars that fit a score: low scores get easier papers, high scores harder ones
const targetStars = s => (s == null ? 2 : s < 45 ? 1 : s < 60 ? 2 : s < 75 ? 3 : s < 88 ? 4 : 5);

function usable(p, track) {
  const code = String(p.paperCode || '');
  if (track === 'GENERAL' && (/^GE-PT/.test(code) || /^GE-W\d/.test(code))) return false;
  if (p.testType === 'LISTENING' && !(p.audioUrl || (p.sections || []).some(s => s.audioUrl))) return false;
  return true;
}

async function suggestionsFor(prisma, studentId, track, { limit = 4 } = {}) {
  const me = await prisma.student.findUnique({ where: { id: studentId }, select: { hasFullAccess: true, isPaid: true, placementBand: true } });
  const open = p => track === 'GENERAL' || p.paperCode === '001' || me?.hasFullAccess || me?.isPaid;

  const papers = (await prisma.paper.findMany({ where: { track, status: 'ACTIVE' }, select: PAPER_SELECT, orderBy: [{ order: 'asc' }, { id: 'asc' }] }))
    .filter(p => usable(p, track));
  const byId = new Map(papers.map(p => [p.id, p]));
  const attempts = await prisma.attempt.findMany({
    where: { studentId, paper: { track } },
    select: { id: true, paperId: true, status: true, endedAt: true, startedAt: true, result: true, writingSubmission: { select: { overallBand: true } }, paper: { select: { track: true, testType: true, _count: { select: { questions: true } } } } },
    orderBy: { id: 'desc' },
  });
  const done = new Set(attempts.filter(a => a.status === 'COMPLETED').map(a => a.paperId));
  const out = []; const taken = new Set();
  const add = (p, kind, reason, extra = {}) => {
    if (!p || taken.has(p.id) || out.length >= limit) return;
    taken.add(p.id);
    out.push({ kind, reason, locked: !open(p), ...extra, paper: { id: p.id, title: p.title, testType: p.testType, difficulty: p.difficulty, topic: p.topic, timeLimitMin: p.timeLimitMin } });
  };

  // 1. unfinished
  for (const a of attempts) if (a.status === 'IN_PROGRESS' && !a.endedAt && !done.has(a.paperId)) add(byId.get(a.paperId), 'continue', 'You started this. Finish it.', { attemptId: a.id });

  // 2. sent by a teacher in Messages (last 14 days, not done yet)
  try {
    const groups = (await prisma.chatMember.findMany({ where: { studentId }, select: { groupId: true } })).map(g => g.groupId);
    if (groups.length) {
      const tasks = await prisma.chatMessage.findMany({ where: { groupId: { in: groups }, deletedAt: null, isTask: true, paperId: { not: null }, createdAt: { gte: new Date(Date.now() - 14 * 86400000) } }, orderBy: { id: 'desc' }, take: 20, select: { paperId: true, senderName: true } });
      for (const t of tasks) if (!done.has(t.paperId)) add(byId.get(t.paperId), 'teacher', t.senderName === 'EPIC Daily Task' ? "Today's task from your group" : `Sent by ${t.senderName}`);
    }
  } catch { /* messages not set up */ }

  // 3. weakest skill first, at the right level
  const skillScore = {};
  for (const s of SKILLS[track] || SKILLS.GENERAL) {
    const vals = attempts.filter(a => a.status === 'COMPLETED' && a.paper?.testType === s).map(score100).filter(v => v != null).slice(0, 3);
    skillScore[s] = vals.length ? Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) : null;
  }
  const scored = Object.values(skillScore).filter(v => v != null);
  const overall = scored.length ? scored.reduce((x, y) => x + y, 0) / scored.length : (me?.placementBand ? (me.placementBand / 9) * 100 : null);
  const order = Object.keys(skillScore).sort((a, b) => (skillScore[a] ?? (overall ?? 60) - 1) - (skillScore[b] ?? (overall ?? 60) - 1));
  const pick = s => {
    const want = targetStars(skillScore[s] ?? overall);
    const left = papers.filter(p => p.testType === s && !done.has(p.id) && !taken.has(p.id) && open(p));
    left.sort((a, b) => Math.abs((a.difficulty || 3) - want) - Math.abs((b.difficulty || 3) - want) || (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
    return left[0];
  };
  const reasonFor = (s, round) => {
    const sc = skillScore[s];
    if (sc == null) return `You have not tried ${NAME[s]} yet`;
    if (round === 0 && order[0] === s && scored.length > 1) return `${NAME[s]} is your lowest skill (${track === 'IELTS' ? `band ${(Math.round((sc * 9) / 50) / 2).toFixed(1)}` : `${sc}/100`})`;
    if (sc >= 80) return `You score well in ${NAME[s]}. A harder one`;
    return `Next ${NAME[s]} paper for your level`;
  };
  for (let round = 0; round < 2 && out.length < limit; round++) {
    for (const s of order) { const p = pick(s); if (p) add(p, 'practice', reasonFor(s, round)); }
  }
  return { suggestions: out, skillScore };
}

module.exports = { suggestionsFor, score100, targetStars };
