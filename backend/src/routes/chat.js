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
const multer = require('multer');
const photoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (req, f, cb) => cb(null, /^image\/(jpeg|png|webp|gif|heic|heif)$/.test(f.mimetype)) });
// Only accept photo links that this server created
const fileUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 }, fileFilter: (req, f, cb) => cb(null, f.mimetype === 'application/pdf' || /\.pdf$/i.test(f.originalname || '')) });
// Only accept PDF links that this server created
const okFile = u => typeof u === 'string' && (/^https:\/\/res\.cloudinary\.com\/[^/]+\/(raw|image)\/upload\/.+\/epic-ielts\/chat-files\//.test(u) || /^\/uploads\/files\/chat_[\w.-]+\.pdf$/.test(u) || okAudio(u));
// Audio clips (teachers): mp3, m4a, wav, ogg, aac, webm, opus. Cloudinary keeps sound files as "video".
const AUDIO_EXT = /\.(mp3|m4a|wav|ogg|oga|aac|webm|opus)$/i;
const audioUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (req, f, cb) => cb(null, /^audio\//.test(f.mimetype) || AUDIO_EXT.test(f.originalname || '')) });
function okAudio(u) { return typeof u === 'string' && (/^https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/.+\/epic-ielts\/chat-audio\/chat_[\w.-]+$/.test(u) || /^\/uploads\/audio\/chat_[\w.-]+\.(mp3|m4a|wav|ogg|oga|aac|webm|opus)$/i.test(u)); }
const cleanName = n => String(n || 'document.pdf').replace(/[^\w .()-]+/g, '').trim().slice(0, 120) || 'document.pdf';
const okImage = u => typeof u === 'string' && (/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/.+\/epic-ielts\/chat\//.test(u) || /^\/uploads\/images\/chat_[\w.-]+$/.test(u));

// ---- Question sets: a teacher posts questions (with earlier photos / audio / PDFs from the chat attached),
// students answer in the chat, answers are marked automatically. Stored in ChatMessage.quiz; answers in ChatAnswer.
const qNorm = t => String(t || '').toLowerCase().replace(/[’']/g, "'").replace(/[.,!?;:"]+$/g, '').replace(/\s+/g, ' ').trim();
function cleanQuiz(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) return null;
  const items = raw.items.slice(0, 40).map(it => ({
    q: String(it?.q || '').trim().slice(0, 500),
    options: Array.isArray(it?.options) && it.options.length ? it.options.slice(0, 12).map(o => String(o).trim().slice(0, 120)).filter(Boolean) : null,
    answers: (Array.isArray(it?.answers) ? it.answers : []).slice(0, 10).map(a => String(a).trim().slice(0, 120)).filter(Boolean),
    why: String(it?.why || '').trim().slice(0, 400) || null,
  })).filter(it => it.q && it.answers.length);
  if (!items.length) return null;
  const attach = (Array.isArray(raw.attach) ? raw.attach : []).map(n => parseInt(n, 10)).filter(Number.isInteger).slice(0, 8);
  // photos / audio uploaded straight into the question set (not sent to the chat first)
  const media = (Array.isArray(raw.media) ? raw.media : []).slice(0, 8).map(x => (okImage(x?.imageUrl) ? { imageUrl: x.imageUrl }
    : okFile(x?.fileUrl) ? { fileUrl: x.fileUrl, fileName: cleanName(x.fileName || 'audio') } : null)).filter(Boolean);
  return { items, attach, media, showAnswers: raw.showAnswers !== false };
}
function markQuiz(quiz, given) {
  const answers = quiz.items.map((_, i) => String((Array.isArray(given) ? given[i] : '') || '').trim().slice(0, 200));
  const results = quiz.items.map((it, i) => !!answers[i] && it.answers.some(a => qNorm(a) === qNorm(answers[i])));
  return { answers, results, score: results.filter(Boolean).length, total: quiz.items.length };
}
function myQuizOut(quiz, row) {
  if (!row) return null;
  let d = {}; try { d = JSON.parse(row.text); } catch { d = {}; }
  return { answers: d.answers || [], results: d.results || [], score: row.score ?? 0, total: quiz.items.length, correct: quiz.items.map(it => (quiz.showAnswers || it.why ? it.answers[0] : null)), why: quiz.items.map(it => it.why || null) };
}

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

// Student: teacher questions (askAnswer) from the last 30 days with no answer from me yet, per group
async function unansweredFor(studentId, groupIds) {
  const out = {};
  if (!groupIds.length) return out;
  const qs = await prisma.chatMessage.findMany({ where: { groupId: { in: groupIds }, askAnswer: true, deletedAt: null, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } }, select: { id: true, groupId: true } });
  if (!qs.length) return out;
  const done = new Set((await prisma.chatAnswer.findMany({ where: { studentId, messageId: { in: qs.map(q => q.id) } }, select: { messageId: true } })).map(a => a.messageId));
  for (const q of qs) if (!done.has(q.id)) out[q.groupId] = (out[q.groupId] || 0) + 1;
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
  const unanswered = isStaff(req) ? {} : await unansweredFor(req.user.id, groups.map(g => g.id));
  res.json(groups.map(g => ({
    id: g.id, name: g.name, description: g.description, onlyStaffPost: g.onlyStaffPost, archived: g.archived, dailyTask: g.dailyTask,
    joinCode: isStaff(req) ? g.joinCode : undefined, members: g._count.members, unread: unread[g.id] || 0, unanswered: unanswered[g.id] || 0,
    last: g.messages[0] ? { text: (g.messages[0].text || '').trim() ? g.messages[0].text.slice(0, 80) : g.messages[0].kind === 'PAPER' ? 'Shared a paper' : g.messages[0].kind === 'LESSON' ? 'Shared a lesson' : g.messages[0].kind === 'IMAGE' ? 'Sent a photo' : g.messages[0].kind === 'FILE' ? 'Sent a PDF' : g.messages[0].kind === 'AUDIO' ? 'Sent an audio clip' : g.messages[0].kind === 'QUIZ' ? 'Sent questions' : '', by: g.messages[0].senderName, at: g.messages[0].createdAt } : null,
  })).sort((a, b) => new Date(b.last?.at || 0) - new Date(a.last?.at || 0)));
}));

// Total unread for the nav badge
router.get('/unread', auth, wrap(async (req, res) => {
  const groups = await prisma.chatGroup.findMany({ where: { archived: false, members: { some: { studentId: req.user.id } } }, include: { members: { where: { studentId: req.user.id }, select: { lastReadAt: true } } } });
  const u = await unreadFor(req.user.id, groups);
  const un = isStaff(req) ? {} : await unansweredFor(req.user.id, groups.map(g => g.id));
  res.json({ unread: Object.values(u).reduce((a, b) => a + b, 0), unanswered: Object.values(un).reduce((a, b) => a + b, 0) });
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

// Lessons staff can share
router.get('/lessons', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const mods = await prisma.learnModule.findMany({ orderBy: [{ track: 'asc' }, { order: 'asc' }], select: { id: true, title: true, track: true, lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, estimatedMin: true } } } });
  res.json(mods.flatMap(m => m.lessons.map(l => ({ id: l.id, title: l.title, estimatedMin: l.estimatedMin, moduleId: m.id, module: m.title, track: m.track }))));
}));

// Messages
router.get('/groups/:id/messages', auth, wrap(async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const { group, member } = await canSee(req, groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const after = parseInt(req.query.after, 10) || 0;
  const serverTime = new Date();
  const since = after && req.query.since && !Number.isNaN(Date.parse(req.query.since)) ? new Date(req.query.since) : null;
  let rows = await prisma.chatMessage.findMany({ where: { groupId, ...(after ? { id: { gt: after } } : {}) }, orderBy: { id: after ? 'asc' : 'desc' }, take: after ? 200 : 150 });
  if (!after) rows = rows.reverse();
  // older messages that changed (highlight, pin, unsend) since the last poll, so open chats update live
  const changed = since ? await prisma.chatMessage.findMany({ where: { groupId, id: { lte: after }, editedAt: { gt: new Date(since.getTime() - 1500) } }, orderBy: { id: 'asc' }, take: 100 }) : [];
  rows = [...rows, ...changed.filter(c => !rows.some(r => r.id === c.id))];
  const paperIds = [...new Set(rows.filter(r => r.paperId).map(r => r.paperId))];
  const papers = paperIds.length ? await prisma.paper.findMany({ where: { id: { in: paperIds } }, select: { id: true, title: true, testType: true, track: true, timeLimitMin: true, difficulty: true, status: true } }) : [];
  const pm = new Map(papers.map(p => [p.id, p]));
  const lessonIds = [...new Set(rows.filter(r => r.lessonId).map(r => r.lessonId))];
  const lessons = lessonIds.length ? await prisma.learnLesson.findMany({ where: { id: { in: lessonIds } }, select: { id: true, title: true, moduleId: true, estimatedMin: true, module: { select: { title: true } } } }) : [];
  const lm = new Map(lessons.map(l => [l.id, { id: l.id, title: l.title, moduleId: l.moduleId, module: l.module?.title, estimatedMin: l.estimatedMin }]));
  if (member) await prisma.chatMember.update({ where: { id: member.id }, data: { lastReadAt: new Date() } });
  const tracked = rows.filter(m => !m.deletedAt && (m.isTask || m.paperId || m.lessonId || HAS_LINK.test(m.text)));
  const stats = isStaff(req) ? await trackStats(groupId, tracked) : null;
  const asking = rows.filter(m => (m.askAnswer || m.quiz) && !m.deletedAt).map(m => m.id);
  const attIds = [...new Set(rows.filter(m => m.quiz && !m.deletedAt).flatMap(m => m.quiz.attach || []))];
  const attRows = attIds.length ? await prisma.chatMessage.findMany({ where: { id: { in: attIds }, groupId, deletedAt: null }, select: { id: true, kind: true, text: true, imageUrl: true, fileUrl: true, fileName: true } }) : [];
  const attMap = new Map(attRows.map(a => [a.id, { id: a.id, kind: a.kind, text: (a.text || '').slice(0, 300), imageUrl: a.imageUrl, fileUrl: a.fileUrl, fileName: a.fileName }]));
  const answerRows = asking.length ? await prisma.chatAnswer.findMany({ where: { messageId: { in: asking }, ...(isStaff(req) ? {} : { studentId: req.user.id }) } }) : [];
  const parentIds = [...new Set(rows.filter(r => r.replyToId).map(r => r.replyToId))];
  const parents = parentIds.length ? await prisma.chatMessage.findMany({ where: { id: { in: parentIds } }, select: { id: true, senderName: true, text: true, imageUrl: true, kind: true, deletedAt: true } }) : [];
  const parentMap = new Map(parents.map(p => [p.id, { id: p.id, by: p.senderName, text: p.deletedAt ? 'This message was unsent' : (p.text || '').slice(0, 160) || ({ IMAGE: 'A photo', PAPER: 'A paper', LESSON: 'A lesson', FILE: 'A PDF', AUDIO: 'An audio clip', QUIZ: 'Questions' })[p.kind] || '', imageUrl: p.deletedAt ? null : p.imageUrl }]));
  const replyCounts = rows.length ? await prisma.chatMessage.groupBy({ by: ['replyToId'], where: { replyToId: { in: rows.map(r => r.id) }, deletedAt: null }, _count: { _all: true } }) : [];
  const replyCount = new Map(replyCounts.map(c => [c.replyToId, c._count._all]));
  const pinRow = await prisma.chatMessage.findFirst({ where: { groupId, pinned: true, deletedAt: null }, orderBy: { id: 'desc' }, select: { id: true, text: true, senderName: true, kind: true } });
  // messages unsent recently, so open chats can hide them without a reload
  const unsent = after ? (await prisma.chatMessage.findMany({ where: { groupId, id: { lte: after }, deletedAt: { gte: new Date(Date.now() - 3 * 86400000) } }, select: { id: true } })).map(r => r.id) : [];
  const mine = !isStaff(req) ? await myStatus(req.user.id, tracked) : null;
  res.json({
    group: { id: group.id, name: group.name, description: group.description, onlyStaffPost: group.onlyStaffPost, joinCode: isStaff(req) ? group.joinCode : undefined, archived: group.archived, dailyTask: group.dailyTask },
    canPost: isStaff(req) || (!group.onlyStaffPost && !!member),
    unsent,
    serverTime,
    pin: pinRow ? { id: pinRow.id, by: pinRow.senderName, text: (pinRow.text || '').slice(0, 220) || ({ IMAGE: 'A photo', PAPER: 'A paper', LESSON: 'A lesson', FILE: 'A PDF', AUDIO: 'An audio clip', QUIZ: 'Questions' })[pinRow.kind] || '' } : null,
    updatedIds: changed.map(c => c.id),
    messages: rows.map(m => ({
      id: m.id, senderId: m.senderId, senderName: m.senderName, staff: STAFF.includes(m.senderRole), kind: m.kind, createdAt: m.createdAt, isTask: m.isTask,
      deleted: !!m.deletedAt, text: m.deletedAt ? '' : m.text, paper: m.paperId && !m.deletedAt ? (pm.get(m.paperId) || { id: m.paperId, title: 'Paper not available', missing: true }) : null,
      imageUrl: m.deletedAt ? null : m.imageUrl || null,
      fileUrl: m.deletedAt ? null : m.fileUrl || null, fileName: m.deletedAt ? null : m.fileName || null,
      lesson: m.lessonId && !m.deletedAt ? (lm.get(m.lessonId) || { id: m.lessonId, title: 'Lesson not available', missing: true }) : null,
      mine: m.senderId === req.user.id,
      highlights: m.deletedAt ? [] : (Array.isArray(m.highlights) ? m.highlights : []),
      pinned: !!m.pinned && !m.deletedAt, askAnswer: !!m.askAnswer,
      replyTo: m.replyToId ? parentMap.get(m.replyToId) || { id: m.replyToId, by: '', text: 'Message not found' } : null,
      replies: replyCount.get(m.id) || 0,
      answers: m.askAnswer && isStaff(req) ? { total: answerRows.filter(a => a.messageId === m.id).length, checked: answerRows.filter(a => a.messageId === m.id && a.checkedAt).length } : undefined,
      myAnswer: m.askAnswer && !isStaff(req) ? (answerRows.some(a => a.messageId === m.id) ? pickAnswer(answerRows.find(a => a.messageId === m.id)) : null) : undefined,
      quiz: m.quiz && !m.deletedAt ? {
        items: m.quiz.items.map(it => (isStaff(req) ? it : { q: it.q, options: it.options })),
        attach: [...(m.quiz.attach || []).map(id => attMap.get(id)).filter(Boolean), ...(m.quiz.media || []).map((x, i) => ({ id: `m${i}`, ...x }))],
        showAnswers: m.quiz.showAnswers !== false, total: m.quiz.items.length,
        submitted: isStaff(req) ? answerRows.filter(a => a.messageId === m.id).length : undefined,
      } : null,
      myQuiz: m.quiz && !m.deletedAt && !isStaff(req) ? myQuizOut(m.quiz, answerRows.find(a => a.messageId === m.id)) : undefined,
      stats: stats ? stats.get(m.id) || null : undefined,
      status: mine ? mine.get(m.id) || null : undefined,
    })),
  });
}));
// Upload a photo for a chat message (staff). Returns the link to send with the message.
router.post('/photo', auth, (req, res, next) => (isStaff(req) ? next() : res.status(403).json({ error: 'Only teachers can send photos.' })), (req, res) => {
  photoUpload.single('photo')(req, res, async err => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'The photo is too big (8 MB max).' : 'Could not read the photo.' });
    if (!req.file) return res.status(400).json({ error: 'Choose a photo (JPG, PNG, WebP or GIF).' });
    try {
      const { cloudinary, isLocal } = require('../config/cloudinary');
      const name = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      if (!isLocal && cloudinary) {
        const url = await new Promise((resolve, reject) => {
          const s = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'epic-ielts/chat', public_id: name, transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'jpg' }] }, (e, r) => (e ? reject(e) : resolve(r.secure_url)));
          s.end(req.file.buffer);
        });
        return res.json({ url });
      }
      const fs = require('fs'); const path = require('path');
      const dir = path.join(__dirname, '../../uploads/images'); fs.mkdirSync(dir, { recursive: true });
      const ext = ({ 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' })[req.file.mimetype] || '.jpg';
      fs.writeFileSync(path.join(dir, name + ext), req.file.buffer);
      res.json({ url: `/uploads/images/${name}${ext}` });
    } catch (e) {
      console.error('[chat] photo upload', e.message);
      res.status(500).json({ error: 'Could not upload the photo. Please try again.' });
    }
  });
});

// ─── View-only link (no login): staff make one secret link that shows every group and all messages ───
const VIEW_KEY = 'chat.viewToken';
async function viewToken() { const r = await prisma.appSetting.findUnique({ where: { key: VIEW_KEY } }).catch(() => null); return r?.value || null; }
router.get('/view-link', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only teachers can share the board.' });
  res.json({ token: await viewToken() });
}));
router.post('/view-link', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only teachers can share the board.' });
  let token = await viewToken();
  if (!token || req.body?.renew) {
    token = require('crypto').randomBytes(18).toString('base64url');
    await prisma.appSetting.upsert({ where: { key: VIEW_KEY }, update: { value: token }, create: { key: VIEW_KEY, value: token } });
  }
  res.json({ token });
}));
router.delete('/view-link', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only teachers can share the board.' });
  await prisma.appSetting.deleteMany({ where: { key: VIEW_KEY } });
  res.json({ token: null });
}));
async function checkView(req, res) {
  const t = await viewToken();
  if (!t || String(req.params.token || '') !== t) { res.status(404).json({ error: 'This link is not active. Ask the teacher for a new one.' }); return false; }
  return true;
}
router.get('/view/:token/groups', wrap(async (req, res) => {
  if (!(await checkView(req, res))) return;
  const groups = await prisma.chatGroup.findMany({ where: { archived: false }, orderBy: { id: 'asc' }, include: { _count: { select: { members: true, messages: true } }, messages: { where: { deletedAt: null }, orderBy: { id: 'desc' }, take: 1 } } });
  res.json(groups.map(g => ({ id: g.id, name: g.name, description: g.description, members: g._count.members, messages: g._count.messages,
    last: g.messages[0] ? { text: (g.messages[0].text || '').slice(0, 80) || ({ IMAGE: 'A photo', PAPER: 'A paper', LESSON: 'A lesson', FILE: 'A PDF', AUDIO: 'An audio clip', QUIZ: 'Questions' })[g.messages[0].kind] || '', by: g.messages[0].senderName, at: g.messages[0].createdAt } : null })));
}));
router.get('/view/:token/groups/:id/messages', wrap(async (req, res) => {
  if (!(await checkView(req, res))) return;
  const groupId = parseInt(req.params.id, 10);
  const group = await prisma.chatGroup.findUnique({ where: { id: groupId } });
  if (!group || group.archived) return res.status(404).json({ error: 'Group not found' });
  const before = parseInt(req.query.before, 10) || 0;
  let rows = await prisma.chatMessage.findMany({ where: { groupId, deletedAt: null, ...(before ? { id: { lt: before } } : {}) }, orderBy: { id: 'desc' }, take: 300 });
  const more = rows.length === 300;
  rows = rows.reverse();
  const papers = await prisma.paper.findMany({ where: { id: { in: [...new Set(rows.filter(r => r.paperId).map(r => r.paperId))] } }, select: { id: true, title: true, testType: true } });
  const pm = new Map(papers.map(p => [p.id, p]));
  const lessons = await prisma.learnLesson.findMany({ where: { id: { in: [...new Set(rows.filter(r => r.lessonId).map(r => r.lessonId))] } }, select: { id: true, title: true } });
  const lm = new Map(lessons.map(l => [l.id, l]));
  const tracked = rows.filter(m => m.isTask || m.paperId || m.lessonId || HAS_LINK.test(m.text));
  const stats = await trackStats(groupId, tracked);
  const asking = rows.filter(m => m.askAnswer).map(m => m.id);
  const answers = asking.length ? await prisma.chatAnswer.findMany({ where: { messageId: { in: asking } }, select: { messageId: true, checkedAt: true } }) : [];
  const parents = await prisma.chatMessage.findMany({ where: { id: { in: [...new Set(rows.filter(r => r.replyToId).map(r => r.replyToId))] } }, select: { id: true, senderName: true, text: true, kind: true } });
  const parentMap = new Map(parents.map(p => [p.id, { id: p.id, by: p.senderName, text: (p.text || '').slice(0, 160) || ({ IMAGE: 'A photo', PAPER: 'A paper', LESSON: 'A lesson', FILE: 'A PDF', AUDIO: 'An audio clip', QUIZ: 'Questions' })[p.kind] || '' }]));
  res.json({
    group: { id: group.id, name: group.name, description: group.description },
    more,
    messages: rows.map(m => ({
      id: m.id, senderName: m.senderName, staff: STAFF.includes(m.senderRole), kind: m.kind, createdAt: m.createdAt, isTask: m.isTask, askAnswer: !!m.askAnswer, pinned: !!m.pinned,
      text: m.text, imageUrl: m.imageUrl || null, fileUrl: m.fileUrl || null, fileName: m.fileName || null,
      highlights: Array.isArray(m.highlights) ? m.highlights : [],
      paper: m.paperId ? (pm.get(m.paperId) || { title: 'Paper' }) : null, lesson: m.lessonId ? (lm.get(m.lessonId) || { title: 'Lesson' }) : null,
      replyTo: m.replyToId ? parentMap.get(m.replyToId) || null : null,
      stats: stats.get(m.id) || null,
      answers: m.askAnswer ? { total: answers.filter(a => a.messageId === m.id).length, checked: answers.filter(a => a.messageId === m.id && a.checkedAt).length } : null,
    })),
  });
}));

// Upload a PDF for a chat message (staff). Returns the link and the file name to send with the message.
// Opens a chat PDF through our server. Cloudinary blocks direct PDF links on many accounts, so we fetch the
// file ourselves (with a signed download link if the plain one is refused) and show it in the browser.
// Only files in our chat folder are served; the links are long and random, like the photo links.
router.get('/pdf', async (req, res) => {
  const u = String(req.query.u || '');
  const m = u.match(/^https:\/\/res\.cloudinary\.com\/[^/]+\/raw\/upload\/(?:v\d+\/)?(epic-ielts\/chat-files\/chat_[\w.-]+\.pdf)$/);
  if (!m) return res.status(404).send('File not found');
  const name = cleanName(String(req.query.n || 'Document.pdf')).replace(/(\.pdf)?$/i, '.pdf').replace(/["\\]/g, '');
  try {
    let r = await fetch(u);
    if (!r.ok) {
      const { cloudinary } = require('../config/cloudinary');
      if (cloudinary) r = await fetch(cloudinary.utils.private_download_url(m[1], '', { resource_type: 'raw', type: 'upload' }));
    }
    if (!r.ok) { console.error('[chat] pdf fetch', r.status, m[1]); return res.status(502).send('Could not open the PDF. Please try again.'); }
    const buf = Buffer.from(await r.arrayBuffer());
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${name}"`, 'Cache-Control': 'private, max-age=3600', 'Content-Length': buf.length });
    res.send(buf);
  } catch (e) {
    console.error('[chat] pdf', e.message);
    res.status(502).send('Could not open the PDF. Please try again.');
  }
});

router.post('/audio', auth, (req, res, next) => (isStaff(req) ? next() : res.status(403).json({ error: 'Only teachers can send audio.' })), (req, res) => {
  audioUpload.single('file')(req, res, async err => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'The audio file is too big (25 MB max).' : 'Could not read the file.' });
    if (!req.file) return res.status(400).json({ error: 'Choose an audio file (mp3, m4a, wav).' });
    const ext = ((req.file.originalname || '').match(AUDIO_EXT) || [, ({ 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/ogg': 'ogg', 'audio/aac': 'aac', 'audio/webm': 'webm' })[req.file.mimetype] || 'mp3'])[1].toLowerCase();
    const fileName = cleanName(req.file.originalname || `audio.${ext}`);
    try {
      const { cloudinary, isLocal } = require('../config/cloudinary');
      const name = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      if (!isLocal && cloudinary) {
        const url = await new Promise((resolve, reject) => {
          const st = cloudinary.uploader.upload_stream({ resource_type: 'video', folder: 'epic-ielts/chat-audio', public_id: name }, (e, r) => (e ? reject(e) : resolve(r.secure_url)));
          st.end(req.file.buffer);
        });
        return res.json({ url, fileName });
      }
      const fs = require('fs'); const path = require('path');
      const dir = path.join(__dirname, '../../uploads/audio'); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${name}.${ext}`), req.file.buffer);
      res.json({ url: `/uploads/audio/${name}.${ext}`, fileName });
    } catch (e) {
      console.error('[chat] audio upload', e.message);
      res.status(500).json({ error: 'Could not upload the audio. Please try again.' });
    }
  });
});

router.post('/file', auth, (req, res, next) => (isStaff(req) ? next() : res.status(403).json({ error: 'Only teachers can send files.' })), (req, res) => {
  fileUpload.single('file')(req, res, async err => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'The PDF is too big (20 MB max).' : 'Could not read the file.' });
    if (!req.file) return res.status(400).json({ error: 'Choose a PDF file.' });
    const fileName = cleanName(req.file.originalname).replace(/(\.pdf)?$/i, '.pdf');
    try {
      const { cloudinary, isLocal } = require('../config/cloudinary');
      const name = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      if (!isLocal && cloudinary) {
        const url = await new Promise((resolve, reject) => {
          const s = cloudinary.uploader.upload_stream({ resource_type: 'raw', folder: 'epic-ielts/chat-files', public_id: `${name}.pdf` }, (e, r) => (e ? reject(e) : resolve(r.secure_url)));
          s.end(req.file.buffer);
        });
        return res.json({ url, fileName });
      }
      const fs = require('fs'); const path = require('path');
      const dir = path.join(__dirname, '../../uploads/files'); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${name}.pdf`), req.file.buffer);
      res.json({ url: `/uploads/files/${name}.pdf`, fileName });
    } catch (e) {
      console.error('[chat] file upload', e.message);
      res.status(500).json({ error: 'Could not upload the PDF. Please try again.' });
    }
  });
});

router.post('/groups/:id/messages', auth, wrap(async (req, res) => {
  const groupId = parseInt(req.params.id, 10);
  const { group, member } = await canSee(req, groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const replyToId = parseInt(req.body?.replyToId, 10) || null;
  const parent = replyToId ? await prisma.chatMessage.findUnique({ where: { id: replyToId }, select: { id: true, groupId: true, deletedAt: true } }) : null;
  if (replyToId && (!parent || parent.groupId !== groupId || parent.deletedAt)) return res.status(400).json({ error: 'That message is no longer available.' });
  // students can always reply to a message, even in groups where only teachers post
  if (!isStaff(req) && (!member || (group.onlyStaffPost && !parent))) return res.status(403).json({ error: 'Only teachers can post in this group. You can reply to a message.' });
  const text = String(req.body?.text || '').trim().slice(0, 3000);
  const paperId = isStaff(req) ? parseInt(req.body?.paperId, 10) || null : null;
  const lessonId = isStaff(req) && !paperId ? parseInt(req.body?.lessonId, 10) || null : null;
  const imageUrl = isStaff(req) && okImage(req.body?.imageUrl) ? req.body.imageUrl : null;
  const fileUrl = isStaff(req) && okFile(req.body?.fileUrl) ? req.body.fileUrl : null;
  const fileName = fileUrl ? cleanName(req.body?.fileName) : null;
  let quiz = isStaff(req) && req.body?.quiz ? cleanQuiz(req.body.quiz) : null;
  if (isStaff(req) && req.body?.quiz && !quiz) return res.status(400).json({ error: 'Add at least one question with an answer.' });
  if (quiz && quiz.attach.length) {
    const ok = await prisma.chatMessage.findMany({ where: { id: { in: quiz.attach }, groupId, deletedAt: null }, select: { id: true } });
    quiz.attach = quiz.attach.filter(id => ok.some(o => o.id === id));
  }
  if (!text && !paperId && !lessonId && !imageUrl && !fileUrl && !quiz) return res.status(400).json({ error: 'Type a message' });
  if (!isStaff(req)) {
    const last = lastPost.get(req.user.id) || 0;
    if (Date.now() - last < 2000) return res.status(429).json({ error: 'Slow down a little.' });
    lastPost.set(req.user.id, Date.now());
  }
  if (paperId && !(await prisma.paper.findUnique({ where: { id: paperId }, select: { id: true } }))) return res.status(400).json({ error: 'Paper not found' });
  if (lessonId && !(await prisma.learnLesson.findUnique({ where: { id: lessonId }, select: { id: true } }))) return res.status(400).json({ error: 'Lesson not found' });
  const me = await prisma.student.findUnique({ where: { id: req.user.id }, select: { name: true, role: true } });
  if (!member) await prisma.chatMember.upsert({ where: { groupId_studentId: { groupId, studentId: req.user.id } }, update: {}, create: { groupId, studentId: req.user.id } });
  const askAnswer = isStaff(req) && !paperId && !lessonId && !!req.body?.askAnswer;
  const isTask = isStaff(req) && (!!req.body?.isTask || !!paperId || !!lessonId || askAnswer || !!quiz);
  const m = await prisma.chatMessage.create({ data: { groupId, senderId: req.user.id, senderName: me?.name || 'Someone', senderRole: me?.role || req.user.role || 'STUDENT', kind: quiz ? 'QUIZ' : paperId ? 'PAPER' : lessonId ? 'LESSON' : imageUrl ? 'IMAGE' : fileUrl ? (okAudio(fileUrl) ? 'AUDIO' : 'FILE') : 'TEXT', text, paperId, lessonId, imageUrl, fileUrl, fileName, isTask, askAnswer, ...(quiz ? { quiz } : {}), replyToId: parent ? parent.id : null } });
  if (parent) await prisma.chatMessage.update({ where: { id: parent.id }, data: { editedAt: new Date() } }); // reply counts update live
  res.json({ id: m.id });
}));
router.delete('/messages/:id', auth, wrap(async (req, res) => {
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m) return res.status(404).json({ error: 'Message not found' });
  if (!isStaff(req) && m.senderId !== req.user.id) return res.status(403).json({ error: 'You can only delete your own messages' });
  await prisma.chatMessage.update({ where: { id: m.id }, data: { deletedAt: new Date(), editedAt: new Date(), pinned: false } });
  res.json({ ok: true });
}));
// All replies to one message (to check students' replies in one place)
router.get('/messages/:id/replies', auth, wrap(async (req, res) => {
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m) return res.status(404).json({ error: 'Message not found' });
  const { group } = await canSee(req, m.groupId);
  if (!group) return res.status(404).json({ error: 'Message not found' });
  const rows = await prisma.chatMessage.findMany({ where: { replyToId: m.id, deletedAt: null }, orderBy: { id: 'asc' }, take: 300 });
  const people = isStaff(req) ? await studentMembers(m.groupId) : [];
  const replied = new Set(rows.map(r => r.senderId));
  res.json({
    message: { id: m.id, by: m.senderName, text: m.deletedAt ? '' : m.text, imageUrl: m.deletedAt ? null : m.imageUrl },
    replies: rows.map(r => ({ id: r.id, senderId: r.senderId, senderName: r.senderName, staff: STAFF.includes(r.senderRole), text: r.text, createdAt: r.createdAt, mine: r.senderId === req.user.id })),
    notReplied: isStaff(req) ? people.filter(p => !replied.has(p.id)).map(p => p.name) : undefined,
  });
}));
// ─── Highlights and pins (staff) ─────────────────────────────────────────────
const HL_COLORS = ['yellow', 'green', 'pink', 'blue'];
router.patch('/messages/:id/highlights', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only teachers can highlight.' });
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m || m.deletedAt) return res.status(404).json({ error: 'Message not found' });
  const len = (m.text || '').length;
  const list = (Array.isArray(req.body?.highlights) ? req.body.highlights : []).slice(0, 60)
    .map(h => ({ s: Math.max(0, parseInt(h.s, 10) || 0), e: Math.min(len, parseInt(h.e, 10) || 0), c: HL_COLORS.includes(h.c) ? h.c : 'yellow' }))
    .filter(h => h.e > h.s).sort((a, b) => a.s - b.s);
  // keep ranges apart: where two overlap, the later one starts where the earlier one ends
  const merged = [];
  for (const h of list) {
    const last = merged[merged.length - 1];
    if (last && h.s < last.e) {
      if (h.c === last.c) { last.e = Math.max(last.e, h.e); continue; }
      const s = last.e; if (h.e > s) merged.push({ ...h, s });
    } else merged.push(h);
  }
  await prisma.chatMessage.update({ where: { id: m.id }, data: { highlights: merged, editedAt: new Date() } });
  res.json({ highlights: merged });
}));
router.patch('/messages/:id/pin', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only teachers can pin messages.' });
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m || m.deletedAt) return res.status(404).json({ error: 'Message not found' });
  const pin = !!req.body?.pinned;
  if (pin) await prisma.chatMessage.updateMany({ where: { groupId: m.groupId, pinned: true, id: { not: m.id } }, data: { pinned: false, editedAt: new Date() } });
  await prisma.chatMessage.update({ where: { id: m.id }, data: { pinned: pin, editedAt: new Date() } });
  res.json({ pinned: pin });
}));

// ─── Answers: students answer a teacher's question; teachers check each one ─────
function pickAnswer(a) {
  return { id: a.id, text: a.text, status: a.status, score: a.score, feedback: a.feedback, checkedBy: a.checkedBy, checkedAt: a.checkedAt, updatedAt: a.updatedAt };
}
router.post('/messages/:id/quiz', auth, wrap(async (req, res) => {
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m || m.deletedAt || !m.quiz) return res.status(404).json({ error: 'These questions are not open any more.' });
  if (isStaff(req)) return res.status(400).json({ error: 'Teachers see the answers already.' });
  const member = await prisma.chatMember.findUnique({ where: { groupId_studentId: { groupId: m.groupId, studentId: req.user.id } } });
  if (!member) return res.status(403).json({ error: 'Not in this group' });
  const old = await prisma.chatAnswer.findUnique({ where: { messageId_studentId: { messageId: m.id, studentId: req.user.id } } });
  if (old) return res.json(myQuizOut(m.quiz, old)); // one try only
  const r = markQuiz(m.quiz, req.body?.answers);
  if (!r.answers.some(Boolean)) return res.status(400).json({ error: 'Answer at least one question first.' });
  const a = await prisma.chatAnswer.create({ data: { messageId: m.id, studentId: req.user.id, text: JSON.stringify({ answers: r.answers, results: r.results }), score: r.score, status: 'AUTO', checkedBy: 'Auto' } });
  await prisma.chatClick.upsert({ where: { messageId_studentId_kind: { messageId: m.id, studentId: req.user.id, kind: 'DONE' } }, update: {}, create: { messageId: m.id, studentId: req.user.id, kind: 'DONE' } });
  await prisma.chatMessage.update({ where: { id: m.id }, data: { editedAt: new Date() } });
  res.json(myQuizOut(m.quiz, a));
}));
router.get('/messages/:id/quiz-results', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m || !m.quiz) return res.status(404).json({ error: 'Question set not found' });
  const people = await studentMembers(m.groupId);
  const rows = await prisma.chatAnswer.findMany({ where: { messageId: m.id } });
  const by = new Map(rows.map(a => [a.studentId, a]));
  const students = people.map(p => { const r = by.get(p.id); return { id: p.id, name: p.name, done: !!r, ...(r ? myQuizOut(m.quiz, r) : {}) }; })
    .sort((a, b) => (b.done - a.done) || ((b.score || 0) - (a.score || 0)) || String(a.name).localeCompare(String(b.name)));
  const perQuestion = m.quiz.items.map((it, i) => ({ q: it.q, answer: it.answers.join(' / '), right: rows.filter(r => { try { return JSON.parse(r.text).results[i]; } catch { return false; } }).length }));
  res.json({ title: m.text, total: m.quiz.items.length, submitted: rows.length, students, perQuestion });
}));
router.post('/messages/:id/answer', auth, wrap(async (req, res) => {
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m || m.deletedAt || !m.askAnswer) return res.status(404).json({ error: 'This question is not open for answers.' });
  const member = await prisma.chatMember.findUnique({ where: { groupId_studentId: { groupId: m.groupId, studentId: req.user.id } } });
  if (!member) return res.status(403).json({ error: 'Not in this group' });
  const text = String(req.body?.text || '').trim().slice(0, 6000);
  if (!text) return res.status(400).json({ error: 'Write your answer first.' });
  const old = await prisma.chatAnswer.findUnique({ where: { messageId_studentId: { messageId: m.id, studentId: req.user.id } } });
  if (old && old.status === 'GOOD') return res.status(400).json({ error: 'Your teacher has already marked this answer as good.' });
  const a = old
    ? await prisma.chatAnswer.update({ where: { id: old.id }, data: { text, status: 'SENT', checkedAt: null } })
    : await prisma.chatAnswer.create({ data: { messageId: m.id, studentId: req.user.id, text } });
  await prisma.chatClick.upsert({ where: { messageId_studentId_kind: { messageId: m.id, studentId: req.user.id, kind: 'DONE' } }, update: {}, create: { messageId: m.id, studentId: req.user.id, kind: 'DONE' } });
  await prisma.chatMessage.update({ where: { id: m.id }, data: { editedAt: new Date() } }); // teachers' answer counts update live
  res.json(pickAnswer(a));
}));
router.get('/messages/:id/answers', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const m = await prisma.chatMessage.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!m) return res.status(404).json({ error: 'Message not found' });
  const people = await studentMembers(m.groupId);
  const answers = await prisma.chatAnswer.findMany({ where: { messageId: m.id } });
  const byStudent = new Map(answers.map(a => [a.studentId, a]));
  const rank = r => (!r.answer ? 2 : r.answer.checkedAt ? 1 : 0); // waiting first, then checked, then not answered
  const rows = people.map(p => ({ id: p.id, name: p.name, email: p.email, answer: byStudent.has(p.id) ? pickAnswer(byStudent.get(p.id)) : null }))
    .sort((a, b) => rank(a) - rank(b) || String(a.name).localeCompare(String(b.name)));
  res.json({ question: m.text, imageUrl: m.imageUrl, students: rows });
}));
router.patch('/answers/:id', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const a = await prisma.chatAnswer.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!a) return res.status(404).json({ error: 'Answer not found' });
  const status = ['GOOD', 'REDO'].includes(req.body?.status) ? req.body.status : null;
  if (!status) return res.status(400).json({ error: 'Choose Good or Try again.' });
  let score = req.body?.score === '' || req.body?.score == null ? null : parseInt(req.body.score, 10);
  score = Number.isNaN(score) || score == null ? null : Math.max(0, Math.min(10, score));
  const me = await prisma.student.findUnique({ where: { id: req.user.id }, select: { name: true } });
  const u = await prisma.chatAnswer.update({ where: { id: a.id }, data: { status, score, feedback: String(req.body?.feedback || '').trim().slice(0, 3000) || null, checkedBy: me?.name || 'Teacher', checkedAt: new Date() } });
  await prisma.chatMessage.update({ where: { id: a.messageId }, data: { editedAt: new Date() } }); // the student sees the result live
  res.json(pickAnswer(u));
}));
// AI suggestion for the teacher: corrections and short feedback (the teacher edits it before saving)
router.post('/answers/:id/suggest', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(400).json({ error: 'AI is not set up on the server.' });
  const a = await prisma.chatAnswer.findUnique({ where: { id: parseInt(req.params.id, 10) } });
  if (!a) return res.status(404).json({ error: 'Answer not found' });
  const m = await prisma.chatMessage.findUnique({ where: { id: a.messageId }, select: { text: true, imageUrl: true } });
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = [
    'You help an English teacher in Sri Lanka check a student\'s answer. The students are about B1 level.',
    '',
    'Teacher\'s question:',
    '---',
    (m?.text || '').slice(0, 3000),
    '---',
    m?.imageUrl ? '(The question also had a picture, for example a chart or a map, that you cannot see. Do not guess numbers from it.)' : '',
    '',
    'Student\'s answer:',
    '---',
    a.text.slice(0, 5000),
    '---',
    '',
    'Reply with JSON only: {"good": true or false, "score": 0-10, "feedback": "2 to 4 short, kind sentences in simple English: one thing done well, then the most important things to fix", "corrections": [{"wrong": "exact words from the answer", "right": "corrected words"}]}. Give at most 6 corrections, only real mistakes.',
  ].join('\n');
  const models = [process.env.CHAT_CHECK_MODEL, 'claude-haiku-4-5', 'claude-sonnet-4-5'].filter(Boolean);
  let out = null; let lastErr = null;
  for (const model of models) {
    try {
      const r = await client.messages.create({ model, max_tokens: 900, messages: [{ role: 'user', content: prompt }] });
      const txt = r.content.map(c => c.text || '').join('');
      const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
      out = {
        good: !!j.good, score: Math.max(0, Math.min(10, parseInt(j.score, 10) || 0)), feedback: String(j.feedback || '').slice(0, 1500),
        corrections: (Array.isArray(j.corrections) ? j.corrections : []).slice(0, 6).map(c => ({ wrong: String(c.wrong || ''), right: String(c.right || '') })).filter(c => c.wrong && c.right),
      };
      break;
    } catch (e) { lastErr = e; }
  }
  if (!out) { console.error('[chat] suggest', lastErr && lastErr.message); return res.status(502).json({ error: 'AI could not check this answer. Please try again.' }); }
  res.json(out);
}));

// Student: my tasks from the last 30 days, with what I still need to do
router.get('/my-tasks', auth, wrap(async (req, res) => {
  const groups = await prisma.chatMember.findMany({ where: { studentId: req.user.id, group: { archived: false } }, select: { groupId: true, group: { select: { name: true } } } });
  if (!groups.length) return res.json([]);
  const gname = new Map(groups.map(g => [g.groupId, g.group.name]));
  const msgs = await prisma.chatMessage.findMany({ where: { groupId: { in: groups.map(g => g.groupId) }, isTask: true, deletedAt: null, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } }, orderBy: { id: 'desc' }, take: 60 });
  const status = await myStatus(req.user.id, msgs);
  const answers = await prisma.chatAnswer.findMany({ where: { studentId: req.user.id, messageId: { in: msgs.map(m => m.id) } } });
  const papers = msgs.some(m => m.paperId) ? await prisma.paper.findMany({ where: { id: { in: msgs.filter(m => m.paperId).map(m => m.paperId) } }, select: { id: true, title: true } }) : [];
  const lessons = msgs.some(m => m.lessonId) ? await prisma.learnLesson.findMany({ where: { id: { in: msgs.filter(m => m.lessonId).map(m => m.lessonId) } }, select: { id: true, title: true } }) : [];
  res.json(msgs.map(m => {
    const a = answers.find(x => x.messageId === m.id);
    const st = status.get(m.id) || {};
    const state = m.askAnswer ? (!a ? 'TODO' : a.checkedAt ? (a.status === 'GOOD' ? 'GOOD' : 'REDO') : 'SENT') : (st.done ? 'DONE' : 'TODO');
    const title = m.paperId ? (papers.find(p => p.id === m.paperId)?.title || 'A paper')
      : m.lessonId ? `Lesson: ${lessons.find(l => l.id === m.lessonId)?.title || 'a lesson'}`
      : (m.text || (m.imageUrl ? 'A photo task' : m.quiz ? 'Questions' : 'Task')).split('\n')[0].slice(0, 120);
    return { id: m.id, groupId: m.groupId, group: gname.get(m.groupId), from: m.senderName, createdAt: m.createdAt, state, title, kind: m.paperId ? 'PAPER' : m.lessonId ? 'LESSON' : m.askAnswer ? 'ANSWER' : 'TASK', score: m.askAnswer ? a?.score ?? null : null, feedback: a?.checkedAt ? a.feedback : null };
  }));
}));



// ─── My pins: each student can pin up to 5 messages or tasks for themselves ──────
// Stored per student in AppSetting (additive, no schema change).
const MAX_MY_PINS = 5;
const myPinsKey = id => `chat.mypins.${id}`;
async function readMyPins(studentId) {
  const row = await prisma.appSetting.findUnique({ where: { key: myPinsKey(studentId) } });
  try { const v = JSON.parse(row?.value || '[]'); return Array.isArray(v) ? v.filter(Number.isInteger) : []; } catch { return []; }
}
async function writeMyPins(studentId, ids) {
  const value = JSON.stringify(ids);
  await prisma.appSetting.upsert({ where: { key: myPinsKey(studentId) }, update: { value }, create: { key: myPinsKey(studentId), value } });
}
router.get('/my-pins', auth, wrap(async (req, res) => {
  const ids = await readMyPins(req.user.id);
  if (!ids.length) return res.json({ max: MAX_MY_PINS, pins: [] });
  const groups = await prisma.chatMember.findMany({ where: { studentId: req.user.id }, select: { groupId: true, group: { select: { name: true } } } });
  const gname = new Map(groups.map(g => [g.groupId, g.group.name]));
  const msgs = await prisma.chatMessage.findMany({ where: { id: { in: ids }, deletedAt: null, groupId: { in: [...gname.keys()] } } });
  const papers = msgs.some(m => m.paperId) ? await prisma.paper.findMany({ where: { id: { in: msgs.filter(m => m.paperId).map(m => m.paperId) } }, select: { id: true, title: true } }) : [];
  const pins = ids.map(id => msgs.find(m => m.id === id)).filter(Boolean).map(m => ({
    id: m.id, groupId: m.groupId, group: gname.get(m.groupId), from: m.senderName, createdAt: m.createdAt, isTask: !!m.isTask, askAnswer: !!m.askAnswer,
    title: m.paperId ? (papers.find(p => p.id === m.paperId)?.title || 'A paper') : (m.text || (m.imageUrl ? 'A photo' : m.fileName || 'A message')).split('\n')[0].slice(0, 140),
  }));
  if (pins.length !== ids.length) await writeMyPins(req.user.id, pins.map(p => p.id)); // drop unsent / left-group pins
  res.json({ max: MAX_MY_PINS, pins });
}));
router.post('/my-pins', auth, wrap(async (req, res) => {
  const id = parseInt(req.body?.messageId, 10);
  const m = Number.isInteger(id) ? await prisma.chatMessage.findUnique({ where: { id } }) : null;
  if (!m || m.deletedAt) return res.status(404).json({ error: 'Message not found' });
  const member = await prisma.chatMember.findFirst({ where: { studentId: req.user.id, groupId: m.groupId } });
  if (!member) return res.status(403).json({ error: 'You are not in this chat.' });
  const ids = await readMyPins(req.user.id);
  if (ids.includes(id)) return res.json({ pinned: true, count: ids.length });
  if (ids.length >= MAX_MY_PINS) return res.status(409).json({ error: `You can pin up to ${MAX_MY_PINS}. Unpin one first.` });
  await writeMyPins(req.user.id, [id, ...ids]);
  res.json({ pinned: true, count: ids.length + 1 });
}));
router.delete('/my-pins/:id', auth, wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ids = (await readMyPins(req.user.id)).filter(x => x !== id);
  await writeMyPins(req.user.id, ids);
  res.json({ pinned: false, count: ids.length });
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
async function lessonDone(studentIds, msgs) {
  const lessonIds = [...new Set(msgs.filter(m => m.lessonId).map(m => m.lessonId))];
  if (!studentIds.length || !lessonIds.length) return new Set();
  const rows = await prisma.learnProgress.findMany({ where: { studentId: { in: studentIds }, lessonId: { in: lessonIds } }, select: { studentId: true, lessonId: true } });
  return new Set(rows.map(r => `${r.studentId}:${r.lessonId}`));
}
async function trackStats(groupId, msgs, detail = false) {
  const out = new Map();
  if (!msgs.length) return out;
  const people = await studentMembers(groupId);
  const ids = people.map(p => p.id);
  const clicks = await prisma.chatClick.findMany({ where: { messageId: { in: msgs.map(m => m.id) }, studentId: { in: ids } } });
  const done = await doneMap(ids, [...new Set(msgs.filter(m => m.paperId).map(m => m.paperId))]);
  const learnt = await lessonDone(ids, msgs);
  for (const m of msgs) {
    const rows = people.map(p => {
      const c = clicks.filter(x => x.messageId === m.id && x.studentId === p.id);
      const att = m.paperId ? done.get(`${p.id}:${m.paperId}`) : null;
      const isDone = m.paperId ? !!att : m.lessonId ? learnt.has(`${p.id}:${m.lessonId}`) || c.some(x => x.kind === 'DONE') : c.some(x => x.kind === 'DONE');
      return {
        id: p.id, name: p.name, email: p.email,
        seen: !!p.lastReadAt && new Date(p.lastReadAt) >= new Date(m.createdAt),
        opened: c.some(x => x.kind === 'LINK' || x.kind === 'PAPER' || x.kind === 'LESSON') || isDone,
        done: isDone,
        score: att ? (att.writingSubmission?.overallBand != null ? `Band ${att.writingSubmission.overallBand}` : att.result?.rawScore != null ? String(att.result.rawScore) : null) : null,
      };
    });
    const summary = { total: rows.length, seen: rows.filter(r => r.seen || r.opened).length, opened: rows.filter(r => r.opened).length, done: rows.filter(r => r.done).length, task: m.isTask || !!m.paperId || !!m.lessonId };
    out.set(m.id, detail ? { ...summary, students: rows } : summary);
  }
  return out;
}
async function myStatus(studentId, msgs) {
  const out = new Map();
  if (!msgs.length) return out;
  const clicks = await prisma.chatClick.findMany({ where: { studentId, messageId: { in: msgs.map(m => m.id) } } });
  const done = await doneMap([studentId], [...new Set(msgs.filter(m => m.paperId).map(m => m.paperId))]);
  const learnt = await lessonDone([studentId], msgs);
  for (const m of msgs) {
    const c = clicks.filter(x => x.messageId === m.id);
    out.set(m.id, { opened: c.some(x => x.kind !== 'DONE'), done: m.paperId ? done.has(`${studentId}:${m.paperId}`) : (m.lessonId && learnt.has(`${studentId}:${m.lessonId}`)) || c.some(x => x.kind === 'DONE') });
  }
  return out;
}

// Student opened a link / paper, or pressed "Mark as done"
// ---- My notes: anyone can save any message (or their own text) as a private note ----
const MAX_NOTES = 500;
const noteOut = n => ({ id: n.id, messageId: n.messageId, groupId: n.groupId, group: n.groupName, from: n.fromName, text: n.text, imageUrl: n.imageUrl, fileUrl: n.fileUrl, fileName: n.fileName, myNote: n.myNote || '', createdAt: n.createdAt, updatedAt: n.updatedAt });
router.get('/notes', auth, wrap(async (req, res) => {
  const notes = await prisma.chatNote.findMany({ where: { userId: req.user.id }, orderBy: { id: 'desc' }, take: MAX_NOTES });
  res.json({ notes: notes.map(noteOut), savedIds: notes.filter(n => n.messageId).map(n => n.messageId) });
}));
router.post('/notes', auth, wrap(async (req, res) => {
  const count = await prisma.chatNote.count({ where: { userId: req.user.id } });
  if (count >= MAX_NOTES) return res.status(409).json({ error: `You have ${MAX_NOTES} notes. Delete some old ones first.` });
  const myNote = String(req.body?.myNote || '').slice(0, 5000).trim();
  const id = parseInt(req.body?.messageId, 10);
  if (Number.isInteger(id)) {
    const m = await prisma.chatMessage.findUnique({ where: { id }, include: { group: { select: { name: true } } } });
    if (!m || m.deletedAt) return res.status(404).json({ error: 'Message not found' });
    const ok = isStaff(req) || await prisma.chatMember.findFirst({ where: { studentId: req.user.id, groupId: m.groupId } });
    if (!ok) return res.status(403).json({ error: 'You are not in this chat.' });
    const have = await prisma.chatNote.findFirst({ where: { userId: req.user.id, messageId: id } });
    if (have) return res.json({ note: noteOut(have), already: true });
    let text = m.text || '';
    if (m.paperId) { const p = await prisma.paper.findUnique({ where: { id: m.paperId }, select: { title: true } }); text = [text, p ? `Paper: ${p.title}` : ''].filter(Boolean).join('\n'); }
    if (m.lessonId) text = text || 'A lesson shared in the chat';
    const note = await prisma.chatNote.create({ data: { userId: req.user.id, messageId: id, groupId: m.groupId, groupName: m.group?.name || null, fromName: m.senderName, text: text.slice(0, 20000), imageUrl: m.imageUrl, fileUrl: m.fileUrl, fileName: m.fileName, myNote: myNote || null } });
    return res.json({ note: noteOut(note) });
  }
  const text = String(req.body?.text || '').slice(0, 20000).trim();
  if (!text) return res.status(400).json({ error: 'Type something to save.' });
  const note = await prisma.chatNote.create({ data: { userId: req.user.id, text, myNote: myNote || null } });
  res.json({ note: noteOut(note) });
}));
router.patch('/notes/:id', auth, wrap(async (req, res) => {
  const n = await prisma.chatNote.findUnique({ where: { id: parseInt(req.params.id, 10) || 0 } });
  if (!n || n.userId !== req.user.id) return res.status(404).json({ error: 'Note not found' });
  const data = {};
  if (typeof req.body?.myNote === 'string') data.myNote = req.body.myNote.slice(0, 5000).trim() || null;
  if (typeof req.body?.text === 'string' && !n.messageId) { const t = req.body.text.slice(0, 20000).trim(); if (!t) return res.status(400).json({ error: 'A note cannot be empty.' }); data.text = t; }
  const note = await prisma.chatNote.update({ where: { id: n.id }, data });
  res.json({ note: noteOut(note) });
}));
router.delete('/notes/:id', auth, wrap(async (req, res) => {
  const n = await prisma.chatNote.findUnique({ where: { id: parseInt(req.params.id, 10) || 0 } });
  if (!n || n.userId !== req.user.id) return res.status(404).json({ error: 'Note not found' });
  await prisma.chatNote.delete({ where: { id: n.id } });
  res.json({ ok: true });
}));

router.post('/messages/:id/click', auth, wrap(async (req, res) => {
  const kind = ['LINK', 'PAPER', 'LESSON', 'DONE'].includes(req.body?.kind) ? req.body.kind : 'LINK';
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
  const fbAfter = req.query.fbAfter && !Number.isNaN(Date.parse(req.query.fbAfter)) ? new Date(req.query.fbAfter) : null;
  const feedback = fbAfter ? await prisma.chatAnswer.findMany({ where: { studentId: req.user.id, checkedAt: { gt: fbAfter } }, orderBy: { checkedAt: 'asc' }, take: 5 }) : [];
  const fbMsgs = feedback.length ? await prisma.chatMessage.findMany({ where: { id: { in: feedback.map(f => f.messageId) } }, select: { id: true, groupId: true, text: true, group: { select: { name: true } } } }) : [];
  const fb = feedback.map(f => { const mm = fbMsgs.find(x => x.id === f.messageId); return { id: f.id, messageId: f.messageId, groupId: mm?.groupId, group: mm?.group?.name || '', from: f.checkedBy || 'Teacher', status: f.status, score: f.score, feedback: f.feedback, question: (mm?.text || '').slice(0, 100), checkedAt: f.checkedAt }; });
  const serverTime = new Date();
  if (!gids.length) return res.json({ latestId: after, tasks: [], feedback: fb, serverTime });
  const latest = await prisma.chatMessage.findFirst({ where: { groupId: { in: gids }, isTask: true, deletedAt: null }, orderBy: { id: 'desc' }, select: { id: true } });
  if (!after) return res.json({ latestId: latest?.id || 0, tasks: [], feedback: fb, serverTime });
  const rows = await prisma.chatMessage.findMany({
    where: { groupId: { in: gids }, isTask: true, deletedAt: null, id: { gt: after }, senderId: { not: req.user.id } },
    orderBy: { id: 'asc' }, take: 5, include: { group: { select: { name: true } } },
  });
  const papers = rows.filter(r => r.paperId).length ? await prisma.paper.findMany({ where: { id: { in: rows.filter(r => r.paperId).map(r => r.paperId) } }, select: { id: true, title: true } }) : [];
  const pt = new Map(papers.map(p => [p.id, p.title]));
  const ls = rows.filter(r => r.lessonId).length ? await prisma.learnLesson.findMany({ where: { id: { in: rows.filter(r => r.lessonId).map(r => r.lessonId) } }, select: { id: true, title: true } }) : [];
  const lt = new Map(ls.map(l => [l.id, l.title]));
  res.json({ latestId: latest?.id || after, tasks: rows.map(r => ({ id: r.id, groupId: r.groupId, group: r.group.name, from: r.senderName, text: r.text, paper: r.paperId ? pt.get(r.paperId) || 'A paper' : r.lessonId ? `Lesson: ${lt.get(r.lessonId) || 'a lesson'}` : r.askAnswer ? 'Question: write your answer' : null, createdAt: r.createdAt })), feedback: fb, serverTime });
}));

// Staff: post today's automatic task now
router.post('/groups/:id/daily-now', auth, wrap(async (req, res) => {
  if (!isStaff(req)) return res.status(403).json({ error: 'Only staff' });
  const { postDailyTask } = require('../services/dailyTask');
  const r = await postDailyTask(parseInt(req.params.id, 10), { force: true });
  res.json(r);
}));

module.exports = router;
