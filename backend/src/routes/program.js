// Residential programme tracker API. Admins and teachers can use it; schedule-wide changes are admin only.
const router = require('express').Router();
const auth = require('../middleware/auth');
const svc = require('../services/programService');
const T = require('../services/programTime');

const prisma = svc.prisma;
const int = v => parseInt(v, 10);

function adminRoleOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Only the admin can do this' });
  next();
}

const wrap = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error('[program]', req.method, req.originalUrl, err.message);
    res.status(400).json({ error: err.message });
  }
};

function actorOf(req) {
  return req.user?.email || req.user?.name || `user ${req.user?.id}`;
}

// ─── Cron (cron-job.org) — no login, protected by CRON_SECRET ───────────────
router.all('/cron', wrap(async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || (req.query.key !== secret && req.headers['x-cron-key'] !== secret)) {
    return res.status(401).json({ error: 'Bad cron key' });
  }
  res.json({ ok: true, at: new Date().toISOString(), results: await svc.tick() });
}));

// Admins, existing teacher accounts and programme teachers can use the tracker.
// PROGRAM_TEACHER logins never pass adminOnly, so they cannot reach the rest of the admin API.
router.use(auth, (req, res, next) => {
  if (['ADMIN', 'TEACHER', 'PROGRAM_TEACHER'].includes(req.user?.role)) return next();
  return res.status(403).json({ error: 'Staff only' });
});

// Express 5 has no inline regex in paths: numeric params are checked here, anything else falls through
for (const name of ['id', 'sid', 'tid', 'psid', 'rid']) {
  router.param(name, (req, res, next, value) => (/^\d+$/.test(value) ? next() : next('route')));
}

// ─── Programmes ──────────────────────────────────────────────────────────────
router.get('/', wrap(async (req, res) => {
  const programs = await prisma.program.findMany({ orderBy: { id: 'desc' } });
  res.json({ programs, whatsappApi: svc.whatsappApiConfigured(), aiEnabled: !!process.env.ANTHROPIC_API_KEY });
}));

// Creates the Korea batch 1 plan (teachers as placeholders). Safe to call twice.
router.post('/seed/korea-batch-1', adminRoleOnly, wrap(async (req, res) => {
  const plan = require('../data/program/koreaBatch1');
  const existing = await prisma.program.findFirst({ where: { name: plan.PROGRAM.name } });
  if (existing) return res.json({ program: existing, created: false });

  const teacherIds = {};
  for (const t of plan.TEACHERS) {
    const found = await prisma.programTeacher.findFirst({ where: { name: t.name } });
    const row = found || await prisma.programTeacher.create({
      data: { name: t.name, subject: t.subject, focus: t.focus, confirmed: t.confirmed },
    });
    teacherIds[t.key] = row.id;
  }
  const program = await prisma.$transaction(async tx => {
    const p = await tx.program.create({ data: { ...plan.PROGRAM, ...(req.body?.startDate && T.isValidDate(req.body.startDate) ? { startDate: req.body.startDate } : {}) } });
    const days = plan.buildDays().map((d, i) => ({ ...d, programId: p.id, date: T.addDays(p.startDate, i) }));
    await tx.programDay.createMany({ data: days });
    const sessions = plan.buildSessions().map(({ teacher, ...s }) => ({
      ...s, programId: p.id, teacherId: teacher ? teacherIds[teacher] : null, language: s.language || null, link: s.link || null,
    }));
    await tx.programSession.createMany({ data: sessions });
    await tx.programChangeLog.create({ data: { programId: p.id, summary: 'Programme created from the 30-day plan', actor: actorOf(req) } });
    return p;
  }, { timeout: 30000 });
  res.json({ program, created: true });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = int(req.params.id);
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      days: { orderBy: { dayNumber: 'asc' } },
      students: { orderBy: { name: 'asc' } },
      changeLogs: { orderBy: { id: 'desc' }, take: 20 },
    },
  });
  if (!program) return res.status(404).json({ error: 'Programme not found' });
  const teachers = await prisma.programTeacher.findMany({ orderBy: [{ subject: 'asc' }, { name: 'asc' }] });
  const counts = await prisma.programSession.groupBy({ by: ['status'], where: { programId: id, subject: { not: 'BREAK' } }, _count: true });
  const pending = await prisma.programReminder.count({ where: { programId: id, status: 'PENDING', dueAt: { lte: new Date(Date.now() + 15 * 60000) } } });
  const today = T.todayColombo();
  const todayDay = program.days.find(d => d.date === today) || null;
  res.json({ program, teachers, counts, pendingReminders: pending, today, todayDay });
}));

// Rebuild the days and sessions from the latest 30-day plan. Keeps teachers, students and settings.
// Refused once attendance exists, so a running programme is never wiped by accident.
router.post('/:id/rebuild', adminRoleOnly, wrap(async (req, res) => {
  const programId = int(req.params.id);
  const plan = require('../data/program/koreaBatch1');
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) return res.status(404).json({ error: 'Programme not found' });
  const marked = await prisma.programAttendance.count({ where: { session: { programId } } });
  if (marked > 0) throw new Error('Attendance has already been taken, so the schedule cannot be rebuilt. Change sessions one by one instead.');
  const teacherIds = {};
  for (const t of plan.TEACHERS) {
    const found = await prisma.programTeacher.findFirst({ where: { name: t.name } });
    const row = found
      ? await prisma.programTeacher.update({ where: { id: found.id }, data: { focus: t.focus } })
      : await prisma.programTeacher.create({ data: { name: t.name, subject: t.subject, focus: t.focus, confirmed: t.confirmed } });
    teacherIds[t.key] = row.id;
  }
  await prisma.$transaction(async tx => {
    await tx.programReminder.deleteMany({ where: { programId, status: 'PENDING' } });
    await tx.programSession.deleteMany({ where: { programId } });
    await tx.programDay.deleteMany({ where: { programId } });
    const days = plan.buildDays().map((d, i) => ({ ...d, programId, date: T.addDays(program.startDate, i) }));
    await tx.programDay.createMany({ data: days });
    const sessions = plan.buildSessions().map(({ teacher, ...x }) => ({
      ...x, programId, teacherId: teacher ? teacherIds[teacher] : null, language: x.language || null, link: x.link || null,
    }));
    await tx.programSession.createMany({ data: sessions });
    await tx.program.update({ where: { id: programId }, data: { dayEndTime: plan.PROGRAM.dayEndTime } });
    await tx.programChangeLog.create({ data: { programId, summary: 'Schedule rebuilt from the latest plan (4-hour and 3-hour blocks)', actor: actorOf(req) } });
  }, { timeout: 30000 });
  res.json({ ok: true });
}));

router.put('/:id', adminRoleOnly, wrap(async (req, res) => {
  const b = req.body || {};
  const data = {};
  if (b.name) data.name = String(b.name);
  if (b.koreanSiteUrl !== undefined) data.koreanSiteUrl = b.koreanSiteUrl || null;
  if (b.adminPhone !== undefined) data.adminPhone = b.adminPhone || null;
  if (b.remindMinutes !== undefined) data.remindMinutes = Math.min(180, Math.max(5, int(b.remindMinutes) || 30));
  if (b.dayStartTime && T.isValidTime(b.dayStartTime)) data.dayStartTime = b.dayStartTime;
  if (b.dayEndTime && T.isValidTime(b.dayEndTime)) data.dayEndTime = b.dayEndTime;
  if (b.status && ['ACTIVE', 'PAUSED', 'ARCHIVED'].includes(b.status)) data.status = b.status;
  res.json(await prisma.program.update({ where: { id: int(req.params.id) }, data }));
}));

// ─── Sessions ────────────────────────────────────────────────────────────────
router.get('/:id/sessions', wrap(async (req, res) => {
  const programId = int(req.params.id);
  const where = { programId };
  if (req.query.day) where.dayNumber = int(req.query.day);
  if (req.query.teacherId) where.teacherId = int(req.query.teacherId);
  const sessions = await prisma.programSession.findMany({
    where,
    include: { teacher: { select: { id: true, name: true, phone: true } }, attendance: true },
    orderBy: [{ dayNumber: 'asc' }, { startTime: 'asc' }],
  });
  res.json(sessions);
}));

// Edits from the editor go through the same path as the assistant so teachers get told
router.post('/:id/operations', adminRoleOnly, wrap(async (req, res) => {
  res.json(await svc.applyOperations(int(req.params.id), req.body?.operations, actorOf(req)));
}));

// Teachers can mark their own session done and leave notes
router.post('/sessions/:sid/complete', wrap(async (req, res) => {
  const s = await prisma.programSession.findUnique({ where: { id: int(req.params.sid) }, include: { teacher: true } });
  if (!s) return res.status(404).json({ error: 'Session not found' });
  if (req.user.role !== 'ADMIN' && s.teacher?.accountId !== req.user.id) return res.status(403).json({ error: 'Not your session' });
  const done = req.body?.done !== false;
  const updated = await prisma.programSession.update({
    where: { id: s.id },
    data: {
      status: done ? 'DONE' : 'SCHEDULED',
      doneAt: done ? new Date() : null,
      ...(req.body?.notes !== undefined ? { notes: req.body.notes ? String(req.body.notes).slice(0, 4000) : null } : {}),
    },
  });
  res.json(updated);
}));

router.put('/sessions/:sid/notes', wrap(async (req, res) => {
  const s = await prisma.programSession.findUnique({ where: { id: int(req.params.sid) }, include: { teacher: true } });
  if (!s) return res.status(404).json({ error: 'Session not found' });
  if (req.user.role !== 'ADMIN' && s.teacher?.accountId !== req.user.id) return res.status(403).json({ error: 'Not your session' });
  res.json(await prisma.programSession.update({ where: { id: s.id }, data: { notes: req.body?.notes ? String(req.body.notes).slice(0, 4000) : null } }));
}));

router.put('/sessions/:sid/attendance', wrap(async (req, res) => {
  const sessionId = int(req.params.sid);
  const s = await prisma.programSession.findUnique({ where: { id: sessionId }, include: { teacher: true } });
  if (!s) return res.status(404).json({ error: 'Session not found' });
  if (req.user.role !== 'ADMIN' && s.teacher?.accountId !== req.user.id) return res.status(403).json({ error: 'Not your session' });
  const records = Array.isArray(req.body?.records) ? req.body.records : [];
  const allowed = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];
  for (const r of records) {
    if (!allowed.includes(r.status)) continue;
    await prisma.programAttendance.upsert({
      where: { sessionId_programStudentId: { sessionId, programStudentId: int(r.programStudentId) } },
      create: { sessionId, programStudentId: int(r.programStudentId), status: r.status },
      update: { status: r.status },
    });
  }
  res.json(await prisma.programAttendance.findMany({ where: { sessionId } }));
}));

// ─── Teacher's own view (TEACHER logins linked to a ProgramTeacher) ──────────
router.get('/my', wrap(async (req, res) => {
  const teacher = await prisma.programTeacher.findFirst({ where: { accountId: req.user.id } });
  if (!teacher) return res.json({ teacher: null, sessions: [] });
  const programs = await prisma.program.findMany({ where: { status: 'ACTIVE' }, include: { days: true } });
  const sessions = await prisma.programSession.findMany({
    where: { teacherId: teacher.id, programId: { in: programs.map(p => p.id) } },
    orderBy: [{ dayNumber: 'asc' }, { startTime: 'asc' }],
  });
  const dateOf = (pid, n) => programs.find(p => p.id === pid)?.days.find(d => d.dayNumber === n)?.date || null;
  res.json({ teacher, sessions: sessions.map(s => ({ ...s, date: dateOf(s.programId, s.dayNumber) })) });
}));

// ─── Teachers ────────────────────────────────────────────────────────────────
router.get('/teachers', wrap(async (req, res) => {
  res.json(await prisma.programTeacher.findMany({ orderBy: [{ subject: 'asc' }, { name: 'asc' }] }));
}));

function teacherData(b) {
  const data = {};
  if (b.name !== undefined) data.name = String(b.name).trim().slice(0, 120) || 'Teacher';
  if (b.phone !== undefined) data.phone = b.phone ? String(b.phone).trim() : null;
  if (b.email !== undefined) data.email = b.email ? String(b.email).trim() : null;
  if (b.subject !== undefined) data.subject = ['ENGLISH', 'KOREAN', 'IT', 'OTHER'].includes(b.subject) ? b.subject : 'OTHER';
  if (b.focus !== undefined) data.focus = b.focus || null;
  if (b.confirmed !== undefined) data.confirmed = !!b.confirmed;
  if (b.active !== undefined) data.active = !!b.active;
  if (b.notes !== undefined) data.notes = b.notes || null;
  if (b.accountId !== undefined) data.accountId = b.accountId ? int(b.accountId) : null;
  return data;
}

router.post('/teachers', adminRoleOnly, wrap(async (req, res) => {
  res.json(await prisma.programTeacher.create({ data: { name: 'New teacher', ...teacherData(req.body || {}) } }));
}));

router.put('/teachers/:tid', adminRoleOnly, wrap(async (req, res) => {
  const t = await prisma.programTeacher.update({ where: { id: int(req.params.tid) }, data: teacherData(req.body || {}) });
  // Name or phone changes affect upcoming reminder text: rebuild
  const programs = await prisma.program.findMany({ where: { status: 'ACTIVE' }, select: { id: true } });
  for (const p of programs) await svc.generateReminders(p.id);
  res.json(t);
}));

// Links a teacher to a TEACHER login by email, creating the login if needed
router.post('/teachers/:tid/login', adminRoleOnly, wrap(async (req, res) => {
  const bcrypt = require('bcryptjs');
  const t = await prisma.programTeacher.findUnique({ where: { id: int(req.params.tid) } });
  if (!t) return res.status(404).json({ error: 'Teacher not found' });
  const email = String(req.body?.email || t.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('A valid email is needed');
  let account = await prisma.student.findUnique({ where: { email } });
  let tempPassword = null;
  if (!account) {
    tempPassword = Math.random().toString(36).slice(2, 10);
    account = await prisma.student.create({
      data: { email, name: t.name, password: await bcrypt.hash(tempPassword, 10), role: 'PROGRAM_TEACHER', emailVerified: true, phone: t.phone || null },
    });
  } else if (account.role !== 'PROGRAM_TEACHER') {
    throw new Error('That email already belongs to another account. Use a different email.');
  }
  await prisma.programTeacher.update({ where: { id: t.id }, data: { accountId: account.id, email } });
  res.json({ email, tempPassword, accountId: account.id });
}));

// ─── Students ────────────────────────────────────────────────────────────────
router.post('/:id/students', adminRoleOnly, wrap(async (req, res) => {
  const programId = int(req.params.id);
  const list = Array.isArray(req.body?.students) ? req.body.students : [req.body];
  const created = [];
  for (const s of list) {
    if (!s?.name) continue;
    created.push(await prisma.programStudent.create({
      data: { programId, name: String(s.name).trim(), phone: s.phone || null, scholarship: s.scholarship || null, notes: s.notes || null },
    }));
  }
  res.json(created);
}));

router.put('/students/:psid', adminRoleOnly, wrap(async (req, res) => {
  const b = req.body || {};
  const data = {};
  for (const f of ['name', 'phone', 'scholarship', 'notes']) if (b[f] !== undefined) data[f] = b[f] || null;
  if (b.active !== undefined) data.active = !!b.active;
  if (b.studentId !== undefined) data.studentId = b.studentId ? int(b.studentId) : null;
  if (data.name === null) delete data.name;
  res.json(await prisma.programStudent.update({ where: { id: int(req.params.psid) }, data }));
}));

router.delete('/students/:psid', adminRoleOnly, wrap(async (req, res) => {
  // Soft delete keeps attendance history
  res.json(await prisma.programStudent.update({ where: { id: int(req.params.psid) }, data: { active: false } }));
}));

// ─── Progress ────────────────────────────────────────────────────────────────
router.get('/:id/stats', wrap(async (req, res) => {
  const programId = int(req.params.id);
  const students = await prisma.programStudent.findMany({ where: { programId, active: true }, include: { attendance: true } });
  const sessions = await prisma.programSession.findMany({
    where: { programId, subject: { notIn: ['BREAK'] } },
    select: { id: true, teacherId: true, status: true, dayNumber: true, language: true, startTime: true, endTime: true },
  });
  const teachers = await prisma.programTeacher.findMany();
  const byStudent = students.map(s => {
    const c = { PRESENT: 0, LATE: 0, ABSENT: 0, EXCUSED: 0 };
    s.attendance.forEach(a => { c[a.status] = (c[a.status] || 0) + 1; });
    const marked = c.PRESENT + c.LATE + c.ABSENT + c.EXCUSED;
    return { id: s.id, name: s.name, ...c, marked, rate: marked ? Math.round(((c.PRESENT + c.LATE) / marked) * 100) : null };
  });
  const byTeacher = teachers.map(t => {
    const mine = sessions.filter(s => s.teacherId === t.id);
    const mins = mine.reduce((a, s) => a + (T.minutes(s.endTime) - T.minutes(s.startTime)), 0);
    return { id: t.id, name: t.name, total: mine.length, done: mine.filter(s => s.status === 'DONE').length, cancelled: mine.filter(s => s.status === 'CANCELLED').length, hours: Math.round(mins / 6) / 10 };
  }).filter(t => t.total > 0);
  const lang = { EN: 0, KR: 0 };
  sessions.filter(s => s.status !== 'CANCELLED' && s.language).forEach(s => { lang[s.language] += T.minutes(s.endTime) - T.minutes(s.startTime); });
  res.json({ byStudent, byTeacher, hours: { english: Math.round(lang.EN / 6) / 10, korean: Math.round(lang.KR / 6) / 10 } });
}));

// ─── Day 1 placement (General English) ──────────────────────────────────────
// One row per programme student with their latest General English placement scores (out of 100) and level.
// Students are matched to site accounts by the linked account, or else by the same name.
const GE_PARTS = ['READING', 'LISTENING', 'WRITING', 'SPEAKING'];
const geLevel = n => (n == null ? null : n >= 90 ? 'B2' : n >= 75 ? 'B1' : n >= 50 ? 'A2' : n >= 25 ? 'A1' : 'Pre-A1');

router.get('/:id/placement', wrap(async (req, res) => {
  const programId = int(req.params.id);
  const students = await prisma.programStudent.findMany({ where: { programId, active: true }, orderBy: { name: 'asc' } });
  const attempts = await prisma.attempt.findMany({
    where: { isPlacement: true, status: 'COMPLETED', paper: { track: 'GENERAL', paperCode: { startsWith: 'GE-PT' } } },
    orderBy: { endedAt: 'desc' },
    select: {
      id: true, studentId: true, endedAt: true,
      student: { select: { id: true, name: true, email: true } },
      paper: { select: { testType: true, _count: { select: { questions: true } } } },
      result: { select: { rawScore: true } },
      writingSubmission: { select: { markingStatus: true } },
      speakingSubmission: { select: { markingStatus: true } },
    },
  });

  // Latest score per account and part
  const byAccount = new Map();
  for (const a of attempts) {
    const acc = byAccount.get(a.studentId) || { account: a.student, parts: {} };
    const part = a.paper.testType;
    if (!acc.parts[part]) {
      let score = null;
      let state = 'marking';
      const raw = a.result?.rawScore;
      if (part === 'WRITING' || part === 'SPEAKING') {
        const st = (part === 'WRITING' ? a.writingSubmission : a.speakingSubmission)?.markingStatus;
        if (st === 'FAILED') state = 'failed';
        else if (raw != null) { score = Math.round(raw); state = 'done'; }
      } else if (raw != null && a.paper._count.questions) {
        score = Math.round((raw / a.paper._count.questions) * 100);
        state = 'done';
      }
      acc.parts[part] = { score, state, attemptId: a.id };
    }
    byAccount.set(a.studentId, acc);
  }

  const norm = v => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const used = new Set();
  const summarise = acc => {
    const scores = GE_PARTS.map(p => acc?.parts?.[p]?.score).filter(v => v != null);
    const overall = scores.length ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length) : null;
    return { parts: acc?.parts || {}, done: scores.length, overall, level: scores.length === GE_PARTS.length ? geLevel(overall) : null };
  };
  const rows = students.map(s => {
    let accId = s.studentId && byAccount.has(s.studentId) ? s.studentId : null;
    if (!accId) {
      for (const [id, acc] of byAccount) if (!used.has(id) && norm(acc.account?.name) === norm(s.name)) { accId = id; break; }
    }
    if (accId) used.add(accId);
    const acc = accId ? byAccount.get(accId) : null;
    return { programStudentId: s.id, name: s.name, account: acc?.account || null, ...summarise(acc) };
  });
  // Accounts that took the placement but are not on the programme list (or have a different name)
  const others = [...byAccount.entries()].filter(([id]) => !used.has(id))
    .map(([, acc]) => ({ programStudentId: null, name: acc.account?.name || 'Unknown', account: acc.account, ...summarise(acc) }));
  res.json({ parts: GE_PARTS, rows, others });
}));

// ─── Reminders ───────────────────────────────────────────────────────────────
router.get('/:id/reminders', wrap(async (req, res) => {
  const programId = int(req.params.id);
  const program = await prisma.program.findUnique({ where: { id: programId } });
  const status = req.query.status || 'PENDING';
  const where = { programId };
  if (status !== 'ALL') where.status = status;
  if (req.query.dueSoon === '1') where.dueAt = { lte: new Date(Date.now() + 15 * 60000) };
  const reminders = await prisma.programReminder.findMany({
    where,
    include: { teacher: { select: { id: true, name: true, phone: true } }, session: { select: { id: true, title: true, dayNumber: true, startTime: true } } },
    orderBy: status === 'PENDING' ? { dueAt: 'asc' } : { dueAt: 'desc' },
    take: 200,
  });
  res.json(reminders.map(r => ({ ...r, waLink: r.teacher?.phone ? T.waLink(r.teacher.phone, r.message) : null, programName: program?.name })));
}));

router.post('/reminders/:rid/mark', wrap(async (req, res) => {
  const status = ['SENT', 'SKIPPED', 'PENDING'].includes(req.body?.status) ? req.body.status : 'SENT';
  res.json(await prisma.programReminder.update({
    where: { id: int(req.params.rid) },
    data: { status, sentAt: status === 'SENT' ? new Date() : null, channel: status === 'SENT' ? 'WHATSAPP_LINK' : null },
  }));
}));

router.post('/:id/reminders/custom', adminRoleOnly, wrap(async (req, res) => {
  const programId = int(req.params.id);
  const message = String(req.body?.message || '').trim();
  if (!message) throw new Error('Message is empty');
  const ids = Array.isArray(req.body?.teacherIds) ? req.body.teacherIds.map(int) : [];
  const teachers = await prisma.programTeacher.findMany({ where: ids.length ? { id: { in: ids } } : { active: true } });
  const stamp = Date.now();
  for (const t of teachers) {
    await prisma.programReminder.create({
      data: { programId, teacherId: t.id, kind: 'CUSTOM', message, dueAt: req.body?.dueAt ? new Date(req.body.dueAt) : new Date(), dedupeKey: `custom:${programId}:${t.id}:${stamp}` },
    });
  }
  res.json({ created: teachers.length });
}));

router.post('/:id/reminders/refresh', wrap(async (req, res) => {
  const programId = int(req.params.id);
  const g = await svc.generateReminders(programId);
  const d = await svc.dispatchDue(programId);
  res.json({ ...g, ...d });
}));

router.post('/:id/briefs', adminRoleOnly, wrap(async (req, res) => {
  const date = req.body?.date && T.isValidDate(req.body.date) ? req.body.date : T.todayColombo();
  res.json(await svc.generateBriefs(int(req.params.id), date, { force: !!req.body?.force }));
}));

// ─── Claude assistant ────────────────────────────────────────────────────────
router.post('/:id/assistant', adminRoleOnly, wrap(async (req, res) => {
  const message = String(req.body?.message || '').trim();
  if (!message) throw new Error('Type a message first');
  res.json(await svc.askAssistant(int(req.params.id), message, Array.isArray(req.body?.history) ? req.body.history : []));
}));

router.post('/:id/assistant/apply', adminRoleOnly, wrap(async (req, res) => {
  res.json(await svc.applyOperations(int(req.params.id), req.body?.operations, `${actorOf(req)} via assistant`));
}));

module.exports = router;
