// Automatic daily task for chat groups that have "Daily task" switched on.
// Every morning (Sri Lanka time, DAILY_TASK_HOUR, default 8) each group gets one task, rotating:
// Reading paper → Listening paper → Video → Writing paper. Papers are chosen from what is live,
// preferring ones most students in the group have not done yet and that were not posted recently.
const { prisma } = require('./programService');

const ROTATION = ['READING', 'LISTENING', 'VIDEO', 'WRITING'];
const HOUR = parseInt(process.env.DAILY_TASK_HOUR || '8', 10);
const VZ = 'https://learnenglish.britishcouncil.org/free-resources/general/video-zone/';
const VIDEOS = [
  ['Ten cat facts', 'ten-cat-facts'],
  ['How to chop an onion', 'how-chop-onion'],
  ['How to make a 45-second ice cream', 'how-make-45-second-ice-cream'],
  ['Fire ants build a living raft', 'fire-ants-build-living-raft'],
  ['Why dogs stick their heads out of car windows', 'why-dogs-stick-their-heads-out-car-windows'],
  ['Elephants learn to work together', 'elephants-learn-work-together'],
  ['The biggest flower in the world', 'biggest-flower-world'],
  ['Kids explain art to experts', 'kids-explain-art-experts'],
  ["London's secret garden", 'londons-secret-garden'],
  ['Can eating fruit be bad for you?', 'can-eating-fruit-be-bad-you'],
  ["Why aren't babies afraid of snakes?", 'why-arent-babies-afraid-snakes'],
  ['Imagining a world without fossil fuels', 'imagining-world-without-fossil-fuels'],
  ['Lemon pavlova recipe', 'lemon-pavlova-recipe'],
  ['Amazing DIY orang-utans', 'amazing-diy-orang-utans'],
  ['Two monkeys were paid unequally', 'two-monkeys-were-paid-unequally'],
].map(([title, slug]) => ({ title, url: VZ + slug }));

// Sri Lanka date/time (UTC+5:30)
function lkNow() {
  const d = new Date(Date.now() + 5.5 * 3600000);
  return { date: d.toISOString().slice(0, 10), hour: d.getUTCHours(), dayNo: Math.floor(d.getTime() / 86400000), label: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) };
}

async function pickPaper(groupId, type) {
  const papers = await prisma.paper.findMany({
    where: { track: 'GENERAL', testType: type, status: 'ACTIVE', NOT: [{ paperCode: { startsWith: 'GE-PT' } }, { paperCode: { startsWith: 'GE-W' } }] },
    select: { id: true, title: true, difficulty: true, sections: { select: { audioUrl: true } }, audioUrl: true },
  });
  const usable = type === 'LISTENING' ? papers.filter(p => p.audioUrl || p.sections.some(s => s.audioUrl)) : papers;
  if (!usable.length) return null;
  const members = await prisma.chatMember.findMany({ where: { groupId }, select: { studentId: true } });
  const ids = members.map(m => m.studentId);
  const since = new Date(Date.now() - 21 * 86400000);
  const recent = new Set((await prisma.chatMessage.findMany({ where: { groupId, paperId: { not: null }, createdAt: { gte: since } }, select: { paperId: true } })).map(m => m.paperId));
  const doneRows = ids.length ? await prisma.attempt.groupBy({ by: ['paperId'], where: { studentId: { in: ids }, paperId: { in: usable.map(p => p.id) }, status: 'COMPLETED' }, _count: { _all: true } }) : [];
  const doneCount = new Map(doneRows.map(r => [r.paperId, r._count._all]));
  usable.sort((a, b) => (recent.has(a.id) - recent.has(b.id)) || ((doneCount.get(a.id) || 0) - (doneCount.get(b.id) || 0)) || ((a.difficulty || 3) - (b.difficulty || 3)) || a.id - b.id);
  return usable[0];
}

async function postDailyTask(groupId, { force = false } = {}) {
  const now = lkNow();
  const group = await prisma.chatGroup.findUnique({ where: { id: groupId } });
  if (!group || group.archived) return { posted: false, reason: 'Group not found' };
  if (!force) {
    // claim today's slot so it is posted only once
    const claimed = await prisma.chatGroup.updateMany({ where: { id: groupId, dailyTask: true, archived: false, OR: [{ lastAutoTaskOn: null }, { lastAutoTaskOn: { not: now.date } }] }, data: { lastAutoTaskOn: now.date } });
    if (!claimed.count) return { posted: false, reason: 'Already posted today' };
  } else {
    await prisma.chatGroup.update({ where: { id: groupId }, data: { lastAutoTaskOn: now.date } });
  }
  const posted = await prisma.chatMessage.count({ where: { groupId, senderName: 'EPIC Daily Task' } });
  let type = ROTATION[posted % ROTATION.length];
  let paper = type === 'VIDEO' ? null : await pickPaper(groupId, type);
  if (type !== 'VIDEO' && !paper) type = 'VIDEO';
  let text; let paperId = null;
  if (type === 'VIDEO') {
    const v = VIDEOS[Math.floor(posted / ROTATION.length) % VIDEOS.length];
    text = `Today's task (${now.label}): watch a short video\n\n"${v.title}"\n${v.url}\n\n1. Watch the video (you can turn on subtitles).\n2. Write 5 new words and their meanings in your notebook.\n3. Write 2 sentences about the video.\nWhen you finish, press "Mark as done".`;
  } else {
    paperId = paper.id;
    const what = { READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing' }[type];
    text = `Today's task (${now.label}): do this ${what} paper.\nFinish it today. Your teacher will see when you are done.`;
  }
  const m = await prisma.chatMessage.create({ data: { groupId, senderId: 0, senderName: 'EPIC Daily Task', senderRole: 'ADMIN', kind: paperId ? 'PAPER' : 'TEXT', text, paperId, isTask: true } });
  return { posted: true, id: m.id, type };
}

async function runDailyTasks() {
  const now = lkNow();
  if (now.hour < HOUR) return [];
  const groups = await prisma.chatGroup.findMany({ where: { dailyTask: true, archived: false, OR: [{ lastAutoTaskOn: null }, { lastAutoTaskOn: { not: now.date } }] }, select: { id: true } });
  const out = [];
  for (const g of groups) {
    try { out.push({ group: g.id, ...(await postDailyTask(g.id)) }); } catch (e) { out.push({ group: g.id, error: e.message }); }
  }
  return out;
}

function startDailyTaskTimer() {
  const tick = () => runDailyTasks().then(r => { if (r.length) console.log('[daily-task]', JSON.stringify(r)); }).catch(e => console.error('[daily-task]', e.message));
  setTimeout(tick, 60000);
  setInterval(tick, 10 * 60000);
}

module.exports = { postDailyTask, runDailyTasks, startDailyTaskTimer, VIDEOS };
