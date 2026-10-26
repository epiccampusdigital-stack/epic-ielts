// Programme tracker: reminders, schedule changes, Claude briefs and the schedule assistant.
const { PrismaClient } = require('@prisma/client');
const T = require('./programTime');

const prisma = new PrismaClient();
const AI_MODEL = process.env.PROGRAM_AI_MODEL || 'claude-haiku-4-5';

const SUBJECTS = ['ENGLISH', 'KOREAN', 'IT_LAB', 'ACTIVITY', 'BREAK', 'ASSESSMENT', 'ADMIN'];
const SESSION_STATUSES = ['SCHEDULED', 'DONE', 'CANCELLED'];

function firstName(name) {
  return String(name || 'there').split(' ')[0];
}

function shortHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function sessionLine(s) {
  return `${T.pretty(s.startTime)} to ${T.pretty(s.endTime)}: ${s.title}`;
}

function resolveLink(link, program) {
  if (!link) return null;
  if (link === 'KOREAN_SITE') return program.koreanSiteUrl || null;
  return link;
}

// ─── Reminder bookkeeping ────────────────────────────────────────────────────

// Create a reminder once. If a newer version for the same slot exists (prefix match), older pending ones are skipped.
async function upsertReminder({ programId, teacherId, sessionId = null, kind, message, dueAt, dedupeKey, supersedePrefix }) {
  if (supersedePrefix) {
    await prisma.programReminder.updateMany({
      where: { programId, status: 'PENDING', dedupeKey: { startsWith: supersedePrefix, not: dedupeKey } },
      data: { status: 'SKIPPED', error: 'Replaced by a newer reminder after a schedule change' },
    });
  }
  const existing = await prisma.programReminder.findUnique({ where: { dedupeKey } });
  if (existing) return existing;
  return prisma.programReminder.create({
    data: { programId, teacherId, sessionId, kind, message, dueAt, dedupeKey },
  });
}

async function loadProgramContext(programId) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { days: { orderBy: { dayNumber: 'asc' } } },
  });
  if (!program) return null;
  const dayByNumber = new Map(program.days.map(d => [d.dayNumber, d]));
  const dayByDate = new Map(program.days.map(d => [d.date, d]));
  return { program, dayByNumber, dayByDate };
}

// Generate reminders for today and tomorrow. Idempotent: safe to run every few minutes.
async function generateReminders(programId, now = new Date()) {
  const ctx = await loadProgramContext(programId);
  if (!ctx || ctx.program.status !== 'ACTIVE') return { created: 0 };
  const { program, dayByDate } = ctx;
  const today = T.todayColombo(now);
  const tomorrow = T.addDays(today, 1);
  const targetDays = [today, tomorrow].map(d => dayByDate.get(d)).filter(Boolean);
  if (!targetDays.length) return { created: 0 };

  const sessions = await prisma.programSession.findMany({
    where: { programId, dayNumber: { in: targetDays.map(d => d.dayNumber) }, teacherId: { not: null } },
    include: { teacher: true },
    orderBy: [{ dayNumber: 'asc' }, { startTime: 'asc' }],
  });

  let created = 0;
  const staleCutoff = new Date(now.getTime() - 2 * 3600 * 1000);

  for (const day of targetDays) {
    const daySessions = sessions.filter(s => s.dayNumber === day.dayNumber && s.status !== 'CANCELLED');
    const byTeacher = new Map();
    for (const s of daySessions) {
      if (!s.teacher || !s.teacher.active) continue;
      if (!byTeacher.has(s.teacherId)) byTeacher.set(s.teacherId, []);
      byTeacher.get(s.teacherId).push(s);
    }

    for (const [teacherId, list] of byTeacher) {
      const teacher = list[0].teacher;
      // Night-before summary at 8:45 PM the previous evening
      const nbDue = T.toInstant(T.addDays(day.date, -1), '20:45');
      if (nbDue > staleCutoff) {
        const lines = list.map(sessionLine);
        const msg = `Hi ${firstName(teacher.name)}, tomorrow (${T.prettyDate(day.date)}, Day ${day.dayNumber}: ${day.theme || 'programme day'}) you have:\n` +
          lines.map(l => `- ${l}`).join('\n') + `\n\nThanks! Let me know tonight if anything clashes.`;
        const key = `nb:${programId}:${teacherId}:${day.date}:${shortHash(lines.join('|'))}`;
        const r = await upsertReminder({
          programId, teacherId, kind: 'NIGHT_BEFORE', message: msg, dueAt: nbDue, dedupeKey: key,
          supersedePrefix: `nb:${programId}:${teacherId}:${day.date}:`,
        });
        if (r.createdAt >= now) created++;
      }

      // Nudge before each session
      for (const s of list) {
        if (s.status !== 'SCHEDULED') continue;
        const start = T.toInstant(day.date, s.startTime);
        const due = new Date(start.getTime() - program.remindMinutes * 60000);
        if (start <= now || due <= staleCutoff) continue;
        const link = resolveLink(s.link, program);
        const msg = `Hi ${firstName(teacher.name)}, quick reminder: "${s.title}" starts at ${T.pretty(s.startTime)}` +
          (s.room ? ` in ${s.room}` : '') + '.' + (s.description ? `\n${s.description}` : '') + (link && link.startsWith('http') ? `\nLink: ${link}` : '');
        const key = `ss:${s.id}:${day.date}:${s.startTime}:${teacherId}`;
        const r = await upsertReminder({
          programId, teacherId, sessionId: s.id, kind: 'SESSION_SOON', message: msg, dueAt: due, dedupeKey: key,
          supersedePrefix: `ss:${s.id}:`,
        });
        if (r.createdAt >= now) created++;
      }
    }
  }

  // Sessions that lost their teacher or were cancelled: drop their pending nudges
  await prisma.programReminder.updateMany({
    where: { programId, status: 'PENDING', kind: 'SESSION_SOON', session: { OR: [{ status: { not: 'SCHEDULED' } }, { teacherId: null }] } },
    data: { status: 'SKIPPED', error: 'Session cancelled, done or unassigned' },
  });

  return { created };
}

// Pending reminders more than 3 hours overdue are marked as missed so the outbox stays useful
async function expireOld(programId, now = new Date()) {
  const cutoff = new Date(now.getTime() - 3 * 3600 * 1000);
  const r = await prisma.programReminder.updateMany({
    where: { programId, status: 'PENDING', dueAt: { lt: cutoff } },
    data: { status: 'SKIPPED', error: 'Expired: not sent in time' },
  });
  return r.count;
}

// ─── WhatsApp ────────────────────────────────────────────────────────────────

// Two ways to send: Meta's Cloud API directly (WHATSAPP_TOKEN + WHATSAPP_PHONE_ID), or through
// 360dialog for a number shared with the WhatsApp Business app (coexistence): WHATSAPP_360_KEY.
function whatsappApiConfigured() {
  return !!(process.env.WHATSAPP_360_KEY || (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID));
}

// With WHATSAPP_TEMPLATE set (the name of an approved utility template with one body variable {{1}}),
// every reminder goes as that template, so it is delivered even when the teacher has not messaged
// the business number in the last 24 hours. Without it, plain text is sent (only delivered inside that window).
function waBody(to, text) {
  const template = process.env.WHATSAPP_TEMPLATE;
  if (!template) return { messaging_product: 'whatsapp', to, type: 'text', text: { body: text.slice(0, 4000) } };
  // Template variables cannot contain new lines, tabs or more than four spaces in a row
  const param = text.replace(/\s*\n+\s*/g, ' · ').replace(/\t/g, ' ').replace(/ {4,}/g, '   ').trim().slice(0, 1000);
  return {
    messaging_product: 'whatsapp', to, type: 'template',
    template: { name: template, language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' }, components: [{ type: 'body', parameters: [{ type: 'text', text: param }] }] },
  };
}

// Sends through the WhatsApp Cloud API. Note: Meta only delivers free-form text inside a
// 24-hour window after the teacher last messaged the business number; outside it a template is required.
async function sendWhatsApp(phone, text) {
  const to = T.normalizePhone(phone);
  if (!to) throw new Error('No valid phone number');
  const via360 = !!process.env.WHATSAPP_360_KEY;
  const url = via360 ? 'https://waba-v2.360dialog.io/messages' : `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  const headers = via360
    ? { 'D360-API-KEY': process.env.WHATSAPP_360_KEY, 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(waBody(to, text)),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp API ${res.status}: ${body.slice(0, 300)}`);
  }
  return true;
}

async function dispatchDue(programId, now = new Date()) {
  if (!whatsappApiConfigured()) return { sent: 0, mode: 'outbox' };
  const due = await prisma.programReminder.findMany({
    where: { programId, status: 'PENDING', dueAt: { lte: now } },
    include: { teacher: true },
    take: 50,
    orderBy: { dueAt: 'asc' },
  });
  let sent = 0;
  for (const r of due) {
    try {
      if (!r.teacher?.phone) throw new Error('Teacher has no phone number');
      await sendWhatsApp(r.teacher.phone, r.message);
      await prisma.programReminder.update({ where: { id: r.id }, data: { status: 'SENT', sentAt: new Date(), channel: 'WHATSAPP_API', error: null } });
      sent++;
    } catch (err) {
      await prisma.programReminder.update({ where: { id: r.id }, data: { status: 'FAILED', error: err.message, channel: 'WHATSAPP_API' } });
    }
  }
  return { sent, mode: 'api' };
}

// ─── Daily briefs (Claude, with a plain fallback) ────────────────────────────

let anthropicClient = null;
function claude() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

async function teacherDayFacts(programId, teacherId, day) {
  const sessions = await prisma.programSession.findMany({
    where: { programId, teacherId, dayNumber: day.dayNumber, status: { not: 'CANCELLED' } },
    orderBy: { startTime: 'asc' },
  });
  // Recent absences across the programme (last 2 days) to flag who needs attention
  const recent = await prisma.programAttendance.findMany({
    where: {
      status: { in: ['ABSENT', 'LATE'] },
      session: { programId, dayNumber: { gte: Math.max(1, day.dayNumber - 2), lt: day.dayNumber } },
    },
    include: { student: { select: { name: true } } },
  });
  const flagged = {};
  recent.forEach(a => { flagged[a.student.name] = (flagged[a.student.name] || 0) + 1; });
  // Notes the teacher left on their last completed sessions
  const lastNotes = await prisma.programSession.findMany({
    where: { programId, teacherId, dayNumber: { lt: day.dayNumber }, notes: { not: null } },
    orderBy: [{ dayNumber: 'desc' }, { startTime: 'desc' }],
    take: 2,
    select: { title: true, notes: true, dayNumber: true },
  });
  return { sessions, flagged, lastNotes };
}

function fallbackBrief(teacher, day, facts) {
  const lines = facts.sessions.map(s => `- ${sessionLine(s)}${s.description ? ` (${s.description})` : ''}`);
  const flagged = Object.keys(facts.flagged);
  return `Good morning ${firstName(teacher.name)}! Day ${day.dayNumber}: ${day.theme || ''}\n` +
    lines.join('\n') +
    (flagged.length ? `\n\nKeep an eye on: ${flagged.join(', ')} (missed or late recently).` : '') +
    `\n\nPlease take attendance and add a quick note after each session.`;
}

async function writeBrief(teacher, day, facts) {
  const client = claude();
  if (!client) return fallbackBrief(teacher, day, facts);
  const prompt = {
    teacher: { name: teacher.name, focus: teacher.focus, subject: teacher.subject },
    day: { number: day.dayNumber, date: T.prettyDate(day.date), theme: day.theme, englishFocus: day.englishFocus, koreanFocus: day.koreanFocus },
    sessions: facts.sessions.map(s => ({ time: `${T.pretty(s.startTime)}-${T.pretty(s.endTime)}`, title: s.title, details: s.description })),
    studentsToWatch: facts.flagged,
    yourRecentNotes: facts.lastNotes,
  };
  try {
    const r = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      system: 'You write short WhatsApp morning briefs for teachers at a residential language programme in Sri Lanka (English and Korean, students going to Korea on scholarships). ' +
        'Casual, warm, human, plain English, no corporate tone, no emojis spam (one at most), no markdown headers. Under 90 words. ' +
        'List their sessions with times, give one practical prep tip tied to today\'s topic, mention students to watch if any. Never invent sessions or names.',
      messages: [{ role: 'user', content: JSON.stringify(prompt) }],
    });
    const text = (r.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
    return text || fallbackBrief(teacher, day, facts);
  } catch (err) {
    console.error('[program] brief AI failed:', err.message);
    return fallbackBrief(teacher, day, facts);
  }
}

// Creates one DAILY_BRIEF per teacher for the given date (default today). Due 7:00 AM.
async function generateBriefs(programId, dateStr, { force = false } = {}) {
  const ctx = await loadProgramContext(programId);
  if (!ctx) return { created: 0 };
  const day = ctx.dayByDate.get(dateStr || T.todayColombo());
  if (!day) return { created: 0, reason: 'No programme day on that date' };
  const teacherIds = await prisma.programSession.findMany({
    where: { programId, dayNumber: day.dayNumber, teacherId: { not: null }, status: { not: 'CANCELLED' } },
    distinct: ['teacherId'],
    select: { teacherId: true },
  });
  let created = 0;
  for (const { teacherId } of teacherIds) {
    const teacher = await prisma.programTeacher.findUnique({ where: { id: teacherId } });
    if (!teacher || !teacher.active) continue;
    const prefix = `db:${programId}:${teacherId}:${day.date}`;
    const key = force ? `${prefix}:${Date.now()}` : prefix;
    if (!force && await prisma.programReminder.findUnique({ where: { dedupeKey: key } })) continue;
    const facts = await teacherDayFacts(programId, teacherId, day);
    if (!facts.sessions.length) continue;
    const message = await writeBrief(teacher, day, facts);
    await upsertReminder({
      programId, teacherId, kind: 'DAILY_BRIEF', message, dueAt: T.toInstant(day.date, '07:00'), dedupeKey: key,
      supersedePrefix: force ? `${prefix}` : undefined,
    });
    created++;
  }
  return { created };
}

// ─── Change notifications ────────────────────────────────────────────────────

async function notifyChange(programId, teacherIds, text, actor) {
  const ids = [...new Set(teacherIds.filter(Boolean))];
  const stamp = Date.now();
  for (const teacherId of ids) {
    const teacher = await prisma.programTeacher.findUnique({ where: { id: teacherId } });
    if (!teacher || !teacher.active) continue;
    await prisma.programReminder.create({
      data: {
        programId, teacherId, kind: 'CHANGE', dueAt: new Date(),
        message: `Hi ${firstName(teacher.name)}, small schedule update: ${text}`,
        dedupeKey: `chg:${programId}:${teacherId}:${stamp}:${shortHash(text)}`,
      },
    });
  }
  await prisma.programChangeLog.create({ data: { programId, summary: text, actor: actor || null } });
}

// ─── Schedule operations (used by the editor and by the Claude assistant) ────

function describeSession(s, day) {
  return `${day ? `Day ${s.dayNumber} (${T.prettyDate(day.date)})` : `Day ${s.dayNumber}`} ${T.pretty(s.startTime)} "${s.title}"`;
}

// Applies a list of operations in one transaction. Returns human summaries + teachers to notify.
async function applyOperations(programId, operations, actor) {
  if (!Array.isArray(operations) || !operations.length) throw new Error('No operations to apply');
  const ctx = await loadProgramContext(programId);
  if (!ctx) throw new Error('Programme not found');
  const { program, dayByNumber } = ctx;
  const teachers = await prisma.programTeacher.findMany();
  const teacherById = new Map(teachers.map(t => [t.id, t]));
  const summaries = [];
  const notify = new Set();

  const checkTeacher = id => {
    if (id === null || id === undefined) return null;
    const t = teacherById.get(Number(id));
    if (!t) throw new Error(`Teacher ${id} not found`);
    return t.id;
  };
  const checkDay = n => {
    const day = dayByNumber.get(Number(n));
    if (!day) throw new Error(`Day ${n} is outside the programme`);
    return day;
  };

  await prisma.$transaction(async tx => {
    for (const op of operations) {
      switch (op.type) {
        case 'update_session': {
          const s = await tx.programSession.findFirst({ where: { id: Number(op.sessionId), programId } });
          if (!s) throw new Error(`Session ${op.sessionId} not found`);
          const data = {};
          if (op.startTime !== undefined) { if (!T.isValidTime(op.startTime)) throw new Error('Bad startTime'); data.startTime = op.startTime; }
          if (op.endTime !== undefined) { if (!T.isValidTime(op.endTime)) throw new Error('Bad endTime'); data.endTime = op.endTime; }
          if (op.dayNumber !== undefined) { checkDay(op.dayNumber); data.dayNumber = Number(op.dayNumber); }
          if (op.teacherId !== undefined) data.teacherId = checkTeacher(op.teacherId);
          if (op.title !== undefined) data.title = String(op.title).slice(0, 200);
          if (op.description !== undefined) data.description = op.description ? String(op.description) : null;
          if (op.room !== undefined) data.room = op.room || null;
          if (op.status !== undefined) { if (!SESSION_STATUSES.includes(op.status)) throw new Error('Bad status'); data.status = op.status; }
          const start = data.startTime || s.startTime, end = data.endTime || s.endTime;
          if (T.minutes(end) <= T.minutes(start)) throw new Error(`Session ${s.id}: end must be after start`);
          await tx.programSession.update({ where: { id: s.id }, data });
          const parts = [];
          if (data.dayNumber && data.dayNumber !== s.dayNumber) parts.push(`moved to Day ${data.dayNumber} (${T.prettyDate(checkDay(data.dayNumber).date)})`);
          if ((data.startTime && data.startTime !== s.startTime) || (data.endTime && data.endTime !== s.endTime)) parts.push(`now ${T.pretty(start)} to ${T.pretty(end)}`);
          if (data.teacherId !== undefined && data.teacherId !== s.teacherId) parts.push(`now taught by ${data.teacherId ? teacherById.get(data.teacherId).name : 'nobody yet'}`);
          if (data.status === 'CANCELLED' && s.status !== 'CANCELLED') parts.push('cancelled');
          if (data.title && data.title !== s.title) parts.push(`renamed to "${data.title}"`);
          if (parts.length) summaries.push(`${describeSession(s, dayByNumber.get(s.dayNumber))} ${parts.join(', ')}`);
          notify.add(s.teacherId); if (data.teacherId) notify.add(data.teacherId);
          break;
        }
        case 'cancel_session': {
          const s = await tx.programSession.findFirst({ where: { id: Number(op.sessionId), programId } });
          if (!s) throw new Error(`Session ${op.sessionId} not found`);
          await tx.programSession.update({ where: { id: s.id }, data: { status: 'CANCELLED' } });
          summaries.push(`${describeSession(s, dayByNumber.get(s.dayNumber))} cancelled`);
          notify.add(s.teacherId);
          break;
        }
        case 'delete_session': {
          const s = await tx.programSession.findFirst({ where: { id: Number(op.sessionId), programId } });
          if (!s) throw new Error(`Session ${op.sessionId} not found`);
          await tx.programSession.delete({ where: { id: s.id } });
          summaries.push(`${describeSession(s, dayByNumber.get(s.dayNumber))} removed`);
          notify.add(s.teacherId);
          break;
        }
        case 'add_session': {
          const day = checkDay(op.dayNumber);
          if (!T.isValidTime(op.startTime) || !T.isValidTime(op.endTime) || T.minutes(op.endTime) <= T.minutes(op.startTime)) throw new Error('Bad session times');
          const subject = SUBJECTS.includes(op.subject) ? op.subject : 'ACTIVITY';
          const teacherId = checkTeacher(op.teacherId);
          const s = await tx.programSession.create({
            data: {
              programId, dayNumber: day.dayNumber, startTime: op.startTime, endTime: op.endTime, subject,
              language: ['EN', 'KR'].includes(op.language) ? op.language : null,
              title: String(op.title || 'New session').slice(0, 200), description: op.description || null, teacherId,
              room: op.room || null, link: op.link || null,
            },
          });
          summaries.push(`new session ${describeSession(s, day)}${teacherId ? ` with ${teacherById.get(teacherId).name}` : ''}`);
          notify.add(teacherId);
          break;
        }
        case 'reassign_teacher': {
          const from = checkTeacher(op.fromTeacherId), to = checkTeacher(op.toTeacherId);
          const where = { programId, teacherId: from, status: 'SCHEDULED' };
          if (op.fromDay || op.toDay) where.dayNumber = { gte: Number(op.fromDay || 1), lte: Number(op.toDay || program.totalDays) };
          const r = await tx.programSession.updateMany({ where, data: { teacherId: to } });
          summaries.push(`${r.count} sessions moved from ${teacherById.get(from).name} to ${to ? teacherById.get(to).name : 'unassigned'}${op.fromDay ? ` (Days ${op.fromDay} to ${op.toDay || program.totalDays})` : ''}`);
          notify.add(from); notify.add(to);
          break;
        }
        case 'shift_days': {
          // Pushes Day N and every later day forward (or back) by `days` calendar days: used for off days
          const fromDay = checkDay(op.fromDay);
          const n = Number(op.days);
          if (!Number.isInteger(n) || n === 0 || Math.abs(n) > 14) throw new Error('days must be a whole number between -14 and 14');
          const affected = [...dayByNumber.values()].filter(d => d.dayNumber >= fromDay.dayNumber);
          if (n < 0) {
            const prev = dayByNumber.get(fromDay.dayNumber - 1);
            if (prev && T.addDays(fromDay.date, n) <= prev.date) throw new Error('Shifting back would overlap the previous day');
          }
          for (const d of affected) {
            await tx.programDay.update({ where: { id: d.id }, data: { date: T.addDays(d.date, n) } });
          }
          const offDate = T.prettyDate(fromDay.date);
          summaries.push(n > 0
            ? `${offDate} is now an off day. Day ${fromDay.dayNumber} onwards moves ${n} day${n > 1 ? 's' : ''} later (Day ${fromDay.dayNumber} is now ${T.prettyDate(T.addDays(fromDay.date, n))})`
            : `Day ${fromDay.dayNumber} onwards moves ${-n} day${n < -1 ? 's' : ''} earlier`);
          const tIds = await tx.programSession.findMany({ where: { programId, dayNumber: { gte: fromDay.dayNumber }, teacherId: { not: null } }, distinct: ['teacherId'], select: { teacherId: true } });
          tIds.forEach(x => notify.add(x.teacherId));
          break;
        }
        case 'update_day': {
          const day = checkDay(op.dayNumber);
          const data = {};
          for (const f of ['theme', 'englishFocus', 'koreanFocus', 'itLabTask', 'notes']) if (op[f] !== undefined) data[f] = op[f] || null;
          await tx.programDay.update({ where: { id: day.id }, data });
          summaries.push(`Day ${day.dayNumber} details updated`);
          break;
        }
        default:
          throw new Error(`Unknown operation type: ${op.type}`);
      }
    }
  });

  if (summaries.length) await notifyChange(programId, [...notify], summaries.join('. ') + '.', actor);
  // Rebuild upcoming reminders straight away so nudges match the new schedule
  await generateReminders(programId);
  return { summaries, notified: [...notify].filter(Boolean).length };
}

// ─── Claude schedule assistant ───────────────────────────────────────────────

const ASSISTANT_TOOL = {
  name: 'propose_changes',
  description: 'Propose concrete schedule changes. Nothing is applied until the admin confirms.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'One or two plain sentences describing the change for the admin.' },
      operations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['update_session', 'cancel_session', 'delete_session', 'add_session', 'reassign_teacher', 'shift_days', 'update_day'] },
            sessionId: { type: 'integer' }, dayNumber: { type: 'integer' },
            startTime: { type: 'string', description: 'HH:MM 24h' }, endTime: { type: 'string', description: 'HH:MM 24h' },
            teacherId: { type: ['integer', 'null'] }, title: { type: 'string' }, description: { type: 'string' },
            subject: { type: 'string', enum: SUBJECTS }, language: { type: 'string', enum: ['EN', 'KR'] },
            status: { type: 'string', enum: SESSION_STATUSES }, room: { type: 'string' },
            fromTeacherId: { type: 'integer' }, toTeacherId: { type: 'integer' }, fromDay: { type: 'integer' }, toDay: { type: 'integer' },
            days: { type: 'integer' }, theme: { type: 'string' }, englishFocus: { type: 'string' }, koreanFocus: { type: 'string' },
            itLabTask: { type: 'string' }, notes: { type: 'string' },
          },
          required: ['type'],
        },
      },
    },
    required: ['summary', 'operations'],
  },
};

async function assistantContext(programId) {
  const ctx = await loadProgramContext(programId);
  const teachers = await prisma.programTeacher.findMany({ where: { active: true } });
  const sessions = await prisma.programSession.findMany({
    where: { programId, subject: { not: 'BREAK' } },
    orderBy: [{ dayNumber: 'asc' }, { startTime: 'asc' }],
    select: { id: true, dayNumber: true, startTime: true, endTime: true, title: true, subject: true, teacherId: true, status: true },
  });
  return {
    today: T.todayColombo(),
    program: { name: ctx.program.name, dayStart: ctx.program.dayStartTime, dayEnd: ctx.program.dayEndTime },
    teachers: teachers.map(t => ({ id: t.id, name: t.name, subject: t.subject, focus: t.focus, confirmed: t.confirmed })),
    days: ctx.program.days.map(d => ({ day: d.dayNumber, date: d.date, theme: d.theme })),
    // compact: [id, day, start, end, title, subject, teacherId, status]
    sessions: sessions.map(s => [s.id, s.dayNumber, s.startTime, s.endTime, s.title, s.subject, s.teacherId, s.status]),
  };
}

async function askAssistant(programId, message, history = []) {
  const client = claude();
  if (!client) throw new Error('ANTHROPIC_API_KEY is not set on the server');
  const context = await assistantContext(programId);
  const system =
    'You help the admin of a 30-day residential language programme (English and Korean, Asia/Colombo time) change its schedule. ' +
    'Use ONLY ids from the context. Sessions are arrays: [id, day, start, end, title, subject, teacherId, status]. ' +
    'When the admin asks for a change, call propose_changes with exact operations; nothing is applied until they confirm. ' +
    'To make a date an off day, use shift_days with fromDay = the day currently on that date and days = 1. ' +
    'If a request is ambiguous (which session, which teacher), ask one short question instead of guessing. ' +
    'For questions (who teaches when, how many hours) answer briefly in plain English without calling the tool. ' +
    'Keep replies short and casual.\n\nCONTEXT:\n' + JSON.stringify(context);
  const msgs = [...history.slice(-8).map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '') })), { role: 'user', content: String(message) }];
  const r = await client.messages.create({ model: AI_MODEL, max_tokens: 1500, system, tools: [ASSISTANT_TOOL], messages: msgs });
  const text = (r.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
  const call = (r.content || []).find(c => c.type === 'tool_use' && c.name === 'propose_changes');
  return { reply: text || (call ? call.input.summary : 'Done.'), proposal: call ? call.input : null };
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

async function tick(now = new Date()) {
  const programs = await prisma.program.findMany({ where: { status: 'ACTIVE' }, select: { id: true } });
  const out = [];
  for (const { id } of programs) {
    try {
      const g = await generateReminders(id, now);
      // Morning briefs from 6:00 AM Colombo (once per teacher per day)
      let b = { created: 0 };
      if (T.nowTimeColombo(now) >= '06:00') b = await generateBriefs(id, T.todayColombo(now));
      const e = await expireOld(id, now);
      const d = await dispatchDue(id, now);
      out.push({ programId: id, reminders: g.created, briefs: b.created, expired: e, ...d });
    } catch (err) {
      console.error('[program] tick failed for', id, err.message);
      out.push({ programId: id, error: err.message });
    }
  }
  return out;
}

let timer = null;
function startScheduler() {
  if (timer || process.env.PROGRAM_SCHEDULER === 'off') return;
  const every = 5 * 60 * 1000;
  timer = setInterval(() => { tick().catch(err => console.error('[program] scheduler error', err.message)); }, every);
  setTimeout(() => tick().catch(() => {}), 20 * 1000);
  console.log('[program] reminder scheduler running every 5 minutes');
}

module.exports = {
  prisma, SUBJECTS, SESSION_STATUSES, generateReminders, generateBriefs, applyOperations, notifyChange,
  askAssistant, tick, startScheduler, whatsappApiConfigured, dispatchDue, expireOld, resolveLink,
};
