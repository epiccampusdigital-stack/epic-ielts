// Group chat. Staff (admin / teachers) create groups and share a join code; students join with the code.
// Messages can be text (links become clickable on the page) or a paper card that opens the paper.
const router = require('express').Router();
const auth = require('../middleware/auth');
const { prisma } = require('../services/programService');

const STAFF = ['ADMIN', 'TEACHER', 'PROGRAM_TEACHER'];
const isStaff = req => STAFF.includes(req.user?.role);
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I
const newCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
const wrap = fn => (req, res) => fn(req, res).catch(e => { console.error('[chat]', e.message); res.status(500).json({ error: 'Something went wrong. Please try again.' }); });
const lastPost = new Map(); // studentId -> time of last message (simple flood control)

async function canSee(req, groupId) {
  const group = await prisma.chatGroup.findUnique({ where: { id: groupId } });
  if (!group) return { group: null };
  if (isStaff(req)) return { group, member: await prisma.chatMember.findUnique({ where: { groupId_studentId: { groupId, studentId: req.user.id } } }) };
  const member = await prisma.chatMember.findUnique({ where: { groupId_studentId: { groupId, studentId: req.user.id } } });
  return member && !group.archived ? { group, member } : { group: null };
}

async function unreadFor(studentId, groups) {
  const out = {};
  for (const g of groups) {
    const m = g.members?.[0];
    const since = m ? m.lastReadAt : new Date(0);
    out[g.id] = await prisma.chatMessage.count({ where: { groupId: g.id, deletedAt: null, createdAt: { gt: since }, senderId: { not: studentId } } });
  }
  return out;
}

// My groups (staff: every group)
router.get('/groups', auth, wrap(async (req, res) => {
  const where = isStaff(req) ? { archived: req.query.archived === '1' } : { archived: false, members: { some: { studentId: req.user.id } } };
  const groups = await prisma.chatGroup.findMany({
    where, orderBy: { id: 'desc' },
    include: {
      members: { where: { studentId: req.user.id }, select: { lastReadAt: true } },
      _count: { select: { members: true } },
      messages: { where: { deletedAt: null }, orderBy: { id: 'desc' }, take: 1, select: { text: true, senderName: true, createdAt: true, kind: true } },
    },
  });
  const unread = await unreadFor(req.user.id, groups);
  res.json(groups.map(g => ({
    id: g.id, name: g.name, description: g.description, onlyStaffPost: g.onlyStaffPost, archived: g.archived, dailyTask: g.dailyTask,
    joinCode: isStaff(req) ? g.joinCode : undefined, members: g._count.members, unread: unread[g.id] || 0,
    last: g.messages[0] ? { text: g.messages[0].kind === 'PAPER' ? 'Shared a paper' : g.messages[0].text.slice(0, 80), by: g.messages[0].senderName, at: g.messages[0].createdAt } : null,
  })).sort((a, b) => new Date(b.last?.at || 0) - new Date(a.last?.at || 0)));
}));

// Total unread for the nav badge
router.get('/unread', auth, wrap(async (req, res) => {
  const groups = await prisma.chatGroup.findMany({ where: { archived: false, members: { some: { studentId: req.user.id } } }, include: { members: { where: { studentId: req.user.id }, select: { lastReadAt: true } } } });
  const u = await unreadFor(req.user.id, groups);
  res.json({ unread: Object.values(u).reduce((a, b) => a + b, 0) });
}));

// Staff: create / edit groups
router.post('/groups', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff can create groups' });
  const name = String(req.body?.name || '').trim().slice(0, 80);
  if (!name) return res.status(400).json({ error: 'Give the group a name' });
  let joinCode = newCode();
  while (await prisma.chatGroup.findUnique({ where: { joinCode } })) joinCode = newCode();
  const g = await prisma.chatGroup.create({ data: { name, description: String(req.body?.description || '').trim().slice(0, 300) || null, onlyStaffPost: !!req.body?.onlyStaffPost, joinCode, createdById: req.user.id } });
  await prisma.chatMember.create({ data: { groupId: g.id, studentId: req.user.id } });
  res.json(g);
}));
router.patch('/groups/:id', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff can change groups' });
  const data = {};
  if (typeof req.body?.name === 'string' && req.body.name.trim()) data.name = req.body.name.trim().slice(0, 80);
  if (typeof req.body?.description === 'string') data.description = req.body.description.trim().slice(0, 300) || null;
  if (typeof req.body?.onlyStaffPost === 'boolean') data.onlyStaffPost = req.body.onlyStaffPost;
  if (typeof req.body?.archived === 'boolean') data.archived = req.body.archived;
  if (typeof req.body?.dailyTask === 'boolean') data.dailyTask = req.body.dailyTask;
  if (req.body?.newCode) { let c = newCode(); while (await prisma.chatGroup.findUnique({ where: { joinCode: c } })) c = newCode(); data.joinCode = c; }
  const g = await prisma.chatGroup.update({ where: { id: parseInt(req.params.id, 10) }, data });
  res.json(g);
}));

// Students join with a code
router.post('/join', auth, wrap(async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase().replace(/\s+/g, '');
  const g = await prisma.chatGroup.findUnique({ where: { joinCode: code } });
  if (!g || g.archived) return res.status(404).json({ error: 'No group with that code. Check the code with your teacher.' });
  await prisma.chatMember.upsert({ where: { groupId_studentId: { groupId: g.id, studentId: req.user.id } }, update: {}, create: { groupId: g.id, studentId: req.user.id } });
  res.json({ id: g.id, name: g.name });
}));

// Members (staff manage; anyone can leave)
router.get('/groups/:id/members', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff can see members' });
  const groupId = parseInt(req.params.id, 10);
  const ms = await prisma.chatMember.findMany({ where: { groupId }, orderBy: { joinedAt: 'asc' } });
  const people = await prisma.student.findMany({ where: { id: { in: ms.map(m => m.studentId) } }, select: { id: true, name: true, email: true, role: true } });
  const byId = new Map(people.map(p => [p.id, p]));
  res.json(ms.map(m => ({ ...(byId.get(m.studentId) || { id: m.studentId, name: 'Unknown' }), joinedAt: m.joinedAt })));
}));
router.get('/people', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const q = String(req.query.q || '').trim();
  const people = await prisma.student.findMany({
    where: { role: 'STUDENT', ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}) },
    select: { id: true, name: true, email: true, course: true }, orderBy: { id: 'desc' }, take: 60,
  });
  res.json(people);
}));
router.post('/groups/:id/members', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff can add members' });
  const groupId = parseInt(req.params.id, 10);
  const ids = (Array.isArray(req.body?.studentIds) ? req.body.studentIds : []).map(Number).filter(Boolean).slice(0, 300);
  for (const studentId of ids) await prisma.chatMember.upsert({ where: { groupId_studentId: { groupId, studentId } }, update: {}, create: { groupId, studentId } });
  res.json({ added: ids.length });
}));
router.delete('/groups/:id/members/:studentId', auth, wrap(async (req, res) => {
  const groupId = parseInt(req.params.id, 10); const studentId = parseInt(req.params.studentId, 10);
  if (!isStaff(req) && studentId !== req.user.id) return res.status(403).json({ error: 'Not allowed' });
  await prisma.chatMember.deleteMany({ where: { groupId, studentId } });
  res.json({ ok: true });
}));

// Papers staff can share
router.get('/papers', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const papers = await prisma.paper.findMany({ where: { status: 'ACTIVE' }, select: { id: true, title: true, testType: true, track: true, timeLimitMin: true, difficulty: true }, orderBy: [{ track: 'asc' }, { testType: 'asc' }, { title: 'asc' }] });
  res.json(papers);
}));

// Messages
router.get('/groups/:id/messages', auth, wrap(async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const { group, member } = await canSee(req, groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const after = parseInt(req.query.after, 10) || 0;
  let rows = await prisma.chatMessage.findMany({ where: { groupId, ...(after ? { id: { gt: after } } : {}) }, orderBy: { id: after ? 'asc' : 'desc' }, take: after ? 200 : 150 });
  if (!after) rows = rows.reverse();
  const paperIds = [...new Set(rows.filter(r => r.paperId).map(r => r.paperId))];
  const papers = paperIds.length ? await prisma.paper.findMany({ where: { id: { in: paperIds } }, select: { id: true, title: true, testType: true, track: true, timeLimitMin: true, difficulty: true, status: true } }) : [];
  const pm = new Map(papers.map(p => [p.id, p]));
  if (member) await prisma.chatMember.update({ where: { id: member.id }, data: { lastReadAt: new Date() } });
  const tracked = rows.filter(m => !m.deletedAt && (m.isTask || m.paperId || HAS_LINK.test(m.text)));
  const stats = isStaff(req) ? await trackStats(groupId, tracked) : null;
  // messages unsent recently, so open chats can hide them without a reload
  const unsent = after ? (await prisma.chatMessage.findMany({ where: { groupId, id: { lte: after }, deletedAt: { gte: new Date(Date.now() - 3 * 86400000) } }, select: { id: true } })).map(r => r.id) : [];
  const mine = !isStaff(req) ? await myStatus(req.user.id, tracked) : null;
  res.json({
    group: { id: group.id, name: group.name, description: group.description, onlyStaffPost: group.onlyStaffPost, joinCode: isStaff(req) ? group.joinCode : undefined, archived: group.archived, dailyTask: group.dailyTask },
    canPost: isStaff(req) || (!group.onlyStaffPost && !!member),
    unsent,
    messages: rows.map(m => ({
      id: m.id, senderId: m.senderId, senderName: m.senderName, staff: STAFF.includes(m.senderRole), kind: m.kind, createdAt: m.createdAt, isTask: m.isTask,
      deleted: !!m.deletedAt, text: m.deletedAt ? '' : m.text, paper: m.paperId && !m.deletedAt ? (pm.get(m.paperId) || { id: m.paperId, title: 'Paper not available', missing: true }) : null,
      mine: m.senderId === req.user.id,
      stats: stats ? stats.get(m.id) || null : undefined,
      status: mine ? mine.get(m.id) || null : undefined,
    })),
  });
}));
router.post('/groups/:id/messages', auth, wrap(async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const { group, member } = await canSee(req, groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  if (!isStaff(req) && (!member || group.onlyStaffPost)) return res.status(403).json({ error: 'Only teachers can post in this group.' });
  const text = String(req.body?.text || '').trim().slice(0, 3000);
  const paperId = isStaff(req) ? parseInt(req.body?.paperId, 10) || null : null;
  if (!text && !paperId) return res.status(400).json({ error: 'Type a message' });
  if (!isStaff(req)) {
    const last = lastPost.get(req.user.id) || 0;
    if (Date.now() - last < 2000) return res.status(429).json({ error: 'Slow down a little.' });
    lastPost.set(req.user.id, Date.now());
  }
  if (paperId && !(await prisma.paper.findUnique({ where: { id: paperId }, select: { id: true } }))) return res.status(400).json({ error: 'Paper not found' });
  const me = await prisma.student.findUnique({ where: { id: req.user.id }, select: { name: true, role: true } });
  if (!member) await prisma.chatMember.upsert({ where: { groupId_studentId: { groupId, studentId: req.user.id } }, update: {}, create: { groupId, studentId: req.user.id } });
  const isTask = isStaff(req) && (!!req.body?.isTask || !!paperId);
  const m = await prisma.chatMessage.create({ data: { groupId, senderId: req.user.id, senderName: me?.name || 'Someone', senderRole: me?.role || req.user.role || 'STUDENT', kind: paperId ? 'PAPER' : 'TEXT', text, paperId, isTask } });
  res.json({ id: m.id });
}));
router.delete('/messages/:id', auth, wrap(async (req, res) => {
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m) return res.status(404).json({ error: 'Message not found' });
  if (!isStaff(req) && m.senderId !== req.user.id) return res.status(403).json({ error: 'You can only delete your own messages' });
  await prisma.chatMessage.update({ where: { id: m.id }, data: { deletedAt: new Date() } });
  res.json({ ok: true });
}));


// ─── Tracking: who saw a message, who opened its link / paper, who did the task ──
const HAS_LINK = /https?:\/\/\S+/;
async function studentMembers(groupId) {
  const ms = await prisma.chatMember.findMany({ where: { groupId } });
  const people = await prisma.student.findMany({ where: { id: { in: ms.map(m => m.studentId) }, role: 'STUDENT' }, select: { id: true, name: true, email: true } });
  const read = new Map(ms.map(m => [m.studentId, m.lastReadAt]));
  return people.map(p => ({ ...p, lastReadAt: read.get(p.id) }));
}
async function doneMap(studentIds, paperIds) {
  if (!studentIds.length || !paperIds.length) return new Map();
  const atts = await prisma.attempt.findMany({
    where: { studentId: { in: studentIds }, paperId: { in: paperIds }, status: 'COMPLETED' },
    select: { studentId: true, paperId: true, endedAt: true, result: { select: { rawScore: true, bandEstimate: true } }, writingSubmission: { select: { overallBand: true } } },
    orderBy: { id: 'desc' },
  });
  const m = new Map();
  for (const a of atts) { const k = `${a.studentId}:${a.paperId}`; if (!m.has(k)) m.set(k, a); }
  return m;
}
async function trackStats(groupId, msgs, detail = false) {
  const out = new Map();
  if (!msgs.length) return out;
  const people = await studentMembers(groupId);
  const ids = people.map(p => p.id);
  const clicks = await prisma.chatClick.findMany({ where: { messageId: { in: msgs.map(m => m.id) }, studentId: { in: ids } } });
  const done = await doneMap(ids, [...new Set(msgs.filter(m => m.paperId).map(m => m.paperId))]);
  for (const m of msgs) {
    const rows = people.map(p => {
      const c = clicks.filter(x => x.messageId === m.id && x.studentId === p.id);
      const att = m.paperId ? done.get(`${p.id}:${m.paperId}`) : null;
      const isDone = m.paperId ? !!att : c.some(x => x.kind === 'DONE');
      return {
        id: p.id, name: p.name, email: p.email,
        seen: !!p.lastReadAt && new Date(p.lastReadAt) >= new Date(m.createdAt),
        opened: c.some(x => x.kind === 'LINK' || x.kind === 'PAPER') || isDone,
        done: isDone,
        score: att ? (att.writingSubmission?.overallBand != null ? `Band ${att.writingSubmission.overallBand}` : att.result?.rawScore != null ? String(att.result.rawScore) : null) : null,
      };
    });
    const summary = { total: rows.length, seen: rows.filter(r => r.seen || r.opened).length, opened: rows.filter(r => r.opened).length, done: rows.filter(r => r.done).length, task: m.isTask || !!m.paperId };
    out.set(m.id, detail ? { ...summary, students: rows } : summary);
  }
  return out;
}
async function myStatus(studentId, msgs) {
  const out = new Map();
  if (!msgs.length) return out;
  const clicks = await prisma.chatClick.findMany({ where: { studentId, messageId: { in: msgs.map(m => m.id) } } });
  const done = await doneMap([studentId], [...new Set(msgs.filter(m => m.paperId).map(m => m.paperId))]);
  for (const m of msgs) {
    const c = clicks.filter(x => x.messageId === m.id);
    out.set(m.id, { opened: c.some(x => x.kind !== 'DONE'), done: m.paperId ? done.has(`${studentId}:${m.paperId}`) : c.some(x => x.kind === 'DONE') });
  }
  return out;
}

// Student opened a link / paper, or pressed "Mark as done"
router.post('/messages/:id/click', auth, wrap(async (req, res) => {
  const kind = ['LINK', 'PAPER', 'DONE'].includes(req.body?.kind) ? req.body.kind : 'LINK';
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m) return res.status(404).json({ error: 'Message not found' });
  const member = await prisma.chatMember.findUnique({ where: { groupId_studentId: { groupId: m.groupId, studentId: req.user.id } } });
  if (!member) return res.status(403).json({ error: 'Not in this group' });
  await prisma.chatClick.upsert({ where: { messageId_studentId_kind: { messageId: m.id, studentId: req.user.id, kind } }, update: {}, create: { messageId: m.id, studentId: req.user.id, kind } });
  if (req.body?.undo && kind === 'DONE') await prisma.chatClick.deleteMany({ where: { messageId: m.id, studentId: req.user.id, kind: 'DONE' } });
  res.json({ ok: true });
}));

// Staff: who saw / opened / did one message
router.get('/messages/:id/stats', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m) return res.status(404).json({ error: 'Message not found' });
  const st = (await trackStats(m.groupId, [m], true)).get(m.id);
  res.json(st);
}));

// New tasks for the student's pop-up notification
router.get('/notifications', auth, wrap(async (req, res) => {
  const after = parseInt(req.query.after, 10) || 0;
  const groups = await prisma.chatMember.findMany({ where: { studentId: req.user.id, group: { archived: false } }, select: { groupId: true } });
  const gids = groups.map(g => g.groupId);
  if (!gids.length) return res.json({ latestId: after, tasks: [] });
  const latest = await prisma.chatMessage.findFirst({ where: { groupId: { in: gids }, isTask: true, deletedAt: null }, orderBy: { id: 'desc' }, select: { id: true } });
  if (!after) return res.json({ latestId: latest?.id || 0, tasks: [] });
  const rows = await prisma.chatMessage.findMany({
    where: { groupId: { in: gids }, isTask: true, deletedAt: null, id: { gt: after }, senderId: { not: req.user.id } },
    orderBy: { id: 'asc' }, take: 5, include: { group: { select: { name: true } } },
  });
  const papers = rows.filter(r => r.paperId).length ? await prisma.paper.findMany({ where: { id: { in: rows.filter(r => r.paperId).map(r => r.paperId) } }, select: { id: true, title: true } }) : [];
  const pt = new Map(papers.map(p => [p.id, p.title]));
  res.json({ latestId: latest?.id || after, tasks: rows.map(r => ({ id: r.id, groupId: r.groupId, group: r.group.name, from: r.senderName, text: r.text, paper: r.paperId ? pt.get(r.paperId) || 'A paper' : null, createdAt: r.createdAt })) });
}));

// Staff: post today's automatic task now
router.post('/groups/:id/daily-now', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const { postDailyTask } = require('../services/dailyTask');
  const r = await postDailyTask(parseInt(req.params.id, 10), { force: true });
  res.json(r);
}));

module.exports = router;
