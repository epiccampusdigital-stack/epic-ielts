// The Korea batch timetable as it was actually run (weeks 1 and 2) and as finalised for week 3,
// written into the programme tracker so teachers' schedules, "classes done" and reports are right.
// Runs once per version (AppSetting key below). It never deletes a session: changed sessions are updated in place
// (attendance and notes stay), sessions that did not happen are marked CANCELLED, missing ones are added.
// Past sessions that happened are marked DONE. Days 1 to 3 (30 Oct to 1 Nov) are left as they are.

const VERSION_KEY = 'program.timetable.weeks1to3';
const VERSION = 'v1-2026-11-18';

const M = ['09:00', '13:00'], A = ['14:30', '17:30'], E = ['18:30', '21:30'];
// [start, end, subject, title, teacher] — teacher is a name to look up, or 'keep' to leave the current one
const ses = (t, subject, title, teacher) => ({ start: t[0], end: t[1], subject, title, teacher });
const SP = 'Speaking & grammar (all parts of the Speaking test)';
const WL = 'Writing & listening (Task 1 and Task 2)';

const DAYS = {
  // ── Week 1: 2 to 8 Nov ──
  '2026-11-02': [ses(['08:30', '10:15'], 'ASSESSMENT', 'Placement test', null), ses(['10:30', '11:30'], 'ENGLISH', 'English: parts of speech', 'Sarath'), ses(A, 'KOREAN', 'Korean: Hangul 5', 'keep')],
  '2026-11-03': [ses(['09:00', '12:00'], 'ENGLISH', 'English: verb forms and present simple', 'Sarath'), ses(['14:00', '18:00'], 'KOREAN', 'Korean', 'keep')],
  '2026-11-04': [ses(M, 'ENGLISH', 'English: Course paper 1, group activity', 'Anna'), ses(A, 'KOREAN', 'Korean tute exam', 'keep')],
  '2026-11-05': [ses(M, 'ENGLISH', 'English: Listening practice 1, group activity', 'Anna'), ses(A, 'KOREAN', 'Korean: Hangul 6', 'keep')],
  '2026-11-06': [ses(M, 'ENGLISH', 'English: sentence patterns', 'Sarath'), ses(A, 'KOREAN', 'Korean: review Hangul 1 to 6 and writing', 'keep')],
  '2026-11-07': [ses(M, 'ENGLISH', 'English: Week 1 quiz and Course paper 2', 'Anna'), ses(A, 'KOREAN', 'Korean: Hangul 7', 'keep')],
  '2026-11-08': [ses(M, 'ENGLISH', 'English: pronouns and prepositions', 'Sarath'), ses(A, 'KOREAN', 'Korean: Hangul 8', 'keep')],
  // ── Week 2: 9 to 15 Nov (Mon morning and afternoon off, Fri afternoon off, Anna did not come on Sat 14) ──
  '2026-11-09': [ses(E, 'ENGLISH', 'Evening English', 'Sarath')],
  '2026-11-10': [ses(M, 'ENGLISH', 'English', 'Sarath'), ses(A, 'IT_LAB', 'English (system-based)', 'Yesh')],
  '2026-11-11': [ses(M, 'ENGLISH', 'English', 'Anna'), ses(A, 'IT_LAB', 'English (system-based)', 'Yesh'), ses(A, 'KOREAN', 'Korean', 'Sanka'), ses(E, 'ENGLISH', 'Evening English', 'Sarath')],
  '2026-11-12': [ses(M, 'ENGLISH', 'English', 'Anna'), ses(A, 'IT_LAB', 'English (system-based)', 'Yesh'), ses(A, 'KOREAN', 'Korean', 'Sanka')],
  '2026-11-13': [ses(M, 'ENGLISH', 'English', 'Sarath'), ses(E, 'KOREAN', 'Evening Korean', 'keep')],
  '2026-11-14': [ses(A, 'ENGLISH', 'English', 'Athapaththu')],
  '2026-11-15': [ses(M, 'ENGLISH', 'English', 'Athapaththu'), ses(A, 'ENGLISH', 'English', 'Athapaththu'), ses(E, 'ENGLISH', 'Evening English', 'Sarath')],
  // ── Week 3: 16 to 22 Nov (Geeth replaces Athapaththu on weekdays) ──
  '2026-11-16': [ses(M, 'ENGLISH', WL, 'Athapaththu'), ses(A, 'ENGLISH', SP, 'Sarath'), ses(E, 'ENGLISH', SP, 'Sarath')],
  '2026-11-17': [ses(M, 'ENGLISH', SP, 'Sarath'), ses(A, 'IT_LAB', 'English (system-based)', 'Yesh'), ses(E, 'ENGLISH', SP, 'Sarath')],
  '2026-11-18': [ses(M, 'ENGLISH', 'English', 'Anna'), ses(A, 'IT_LAB', 'English (system-based)', 'Yesh')],
  '2026-11-19': [ses(M, 'ENGLISH', 'English', 'Anna'), ses(A, 'ENGLISH', WL, 'Geeth'), ses(E, 'ENGLISH', SP, 'Sarath')],
  '2026-11-20': [ses(M, 'ENGLISH', SP, 'Sarath'), ses(A, 'IT_LAB', 'English (system-based)', 'Yesh'), ses(E, 'ENGLISH', SP, 'Sarath')],
  '2026-11-21': [ses(M, 'ENGLISH', 'English', 'Anna'), ses(['14:30', '16:30'], 'ASSESSMENT', 'Halfway mock exam (IELTS): Listening, Reading, Writing on the system', null), ses(E, 'IT_LAB', 'System session', 'Yesh')],
  '2026-11-22': [ses(M, 'ENGLISH', 'English', 'Anna'), ses(A, 'IT_LAB', 'English (system-based)', 'Yesh'), ses(E, 'ENGLISH', SP, 'Sarath')],
};
// Teachers created if they are not in the tracker yet (no phone, so no WhatsApp until the admin adds one)
const NEW_TEACHERS = { Geeth: 'ENGLISH', Yesh: 'IT', Sanka: 'KOREAN' };

const slot = t => (t < '12:30' ? 0 : t < '18:00' ? 1 : 2); // morning sessions start by 12:30, afternoons by 6 PM
const todayColombo = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const nowHM = () => new Date(Date.now() + 330 * 60000).toISOString().slice(11, 16);

async function applyProgramTimetable(prisma) {
  const done = await prisma.appSetting.findUnique({ where: { key: VERSION_KEY } });
  if (done && done.value === VERSION) return { skipped: 'already applied' };
  const program = await prisma.program.findFirst({ where: { status: 'ACTIVE', startDate: '2026-10-30' }, include: { days: true } })
    || await prisma.program.findFirst({ where: { status: 'ACTIVE' }, include: { days: true }, orderBy: { id: 'asc' } });
  if (!program) return { skipped: 'no active programme' };

  // Teachers by name
  let teachers = await prisma.programTeacher.findMany();
  const find = name => teachers.find(t => t.name.toLowerCase().includes(name.toLowerCase()));
  const made = [];
  for (const [name, subject] of Object.entries(NEW_TEACHERS)) {
    if (!find(name)) { teachers.push(await prisma.programTeacher.create({ data: { name, subject } })); made.push(name); }
  }
  const athapaththu = find('Athapaththu');

  const today = todayColombo(), hm = nowHM();
  const stats = { updated: 0, added: 0, cancelled: 0, days: 0 };
  for (const [date, want] of Object.entries(DAYS)) {
    const day = program.days.find(d => d.date === date);
    if (!day) continue;
    stats.days++;
    const have = (await prisma.programSession.findMany({ where: { programId: program.id, dayNumber: day.dayNumber }, orderBy: { startTime: 'asc' } }))
      .filter(s => s.subject !== 'BREAK');
    const used = new Set();
    for (const w of want) {
      // same slot; prefer the same subject, then the same teacher
      const cands = have.filter(s => !used.has(s.id) && slot(s.startTime) === slot(w.start));
      const teacherId = w.teacher === 'keep' ? undefined : w.teacher ? (find(w.teacher)?.id ?? null) : null;
      const pick = cands.find(s => s.subject === w.subject) || cands.find(s => teacherId && s.teacherId === teacherId) || cands[0];
      const past = date < today || (date === today && w.end <= hm);
      const data = { startTime: w.start, endTime: w.end, subject: w.subject, title: w.title, language: w.subject === 'ENGLISH' ? 'EN' : w.subject === 'KOREAN' ? 'KR' : null };
      if (teacherId !== undefined) data.teacherId = teacherId;
      // 'keep' with nothing to keep: a Korean class goes to Sanka
      if (teacherId === undefined && !pick && w.subject === 'KOREAN') data.teacherId = find('Sanka')?.id ?? null;
      if (pick) {
        used.add(pick.id);
        if (pick.status === 'CANCELLED' || (past && pick.status === 'SCHEDULED')) { data.status = past ? 'DONE' : 'SCHEDULED'; if (past && !pick.doneAt) data.doneAt = new Date(`${date}T${w.end}:00+05:30`); }
        await prisma.programSession.update({ where: { id: pick.id }, data });
        stats.updated++;
      } else {
        await prisma.programSession.create({ data: { programId: program.id, dayNumber: day.dayNumber, ...data, teacherId: data.teacherId ?? null, ...(past ? { status: 'DONE', doneAt: new Date(`${date}T${w.end}:00+05:30`) } : {}) } });
        stats.added++;
      }
    }
    // Anything else that day did not happen (or is no longer planned): cancelled, never deleted
    for (const s of have) {
      if (used.has(s.id) || s.status === 'CANCELLED') continue;
      await prisma.programSession.update({ where: { id: s.id }, data: { status: 'CANCELLED' } });
      stats.cancelled++;
    }
  }
  // Athapaththu Sir has left: no more reminders for him
  if (athapaththu && athapaththu.active) await prisma.programTeacher.update({ where: { id: athapaththu.id }, data: { active: false } });
  if (athapaththu) await prisma.programReminder.updateMany({ where: { teacherId: athapaththu.id, status: 'PENDING' }, data: { status: 'SKIPPED', error: 'Teacher left the programme' } });
  try { await require('../src/services/programService').generateReminders(program.id); } catch (e) { console.error('[program] reminders after timetable:', e.message); }
  await prisma.appSetting.upsert({ where: { key: VERSION_KEY }, update: { value: VERSION }, create: { key: VERSION_KEY, value: VERSION } });
  return { program: program.name, ...stats, newTeachers: made };
}

module.exports = { DAYS, applyProgramTimetable };
