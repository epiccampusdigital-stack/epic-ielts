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
    id: g.id, name: g.name, description: g.description, onlyStaffPost: g.onlyStaffPost, archived: g.archived,
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
  res.json({
    group: { id: group.id, name: group.name, description: group.description, onlyStaffPost: group.onlyStaffPost, joinCode: isStaff(req) ? group.joinCode : undefined, archived: group.archived },
    canPost: isStaff(req) || (!group.onlyStaffPost && !!member),
    messages: rows.map(m => ({
      id: m.id, senderId: m.senderId, senderName: m.senderName, staff: STAFF.includes(m.senderRole), kind: m.kind, createdAt: m.createdAt,
      deleted: !!m.deletedAt, text: m.deletedAt ? '' : m.text, paper: m.paperId && !m.deletedAt ? (pm.get(m.paperId) || { id: m.paperId, title: 'Paper not available', missing: true }) : null,
      mine: m.senderId === req.user.id,
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
  const m = await prisma.chatMessage.create({ data: { groupId, senderId: req.user.id, senderName: me?.name || 'Someone', senderRole: me?.role || req.user.role || 'STUDENT', kind: paperId ? 'PAPER' : 'TEXT', text, paperId } });
  res.json({ id: m.id });
}));
router.delete('/messages/:id', auth, wrap(async (req, res) => {
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m) return res.status(404).json({ error: 'Message not found' });
  if (!isStaff(req) && m.senderId !== req.user.id) return res.status(403).json({ error: 'You can only delete your own messages' });
  await prisma.chatMessage.update({ where: { id: m.id }, data: { deletedAt: new Date() } });
  res.json({ ok: true });
}));

module.exports = router;
