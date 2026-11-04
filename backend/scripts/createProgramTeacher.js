// Creates (or resets) a teacher login for the programme tracker and links it to the teacher.
// Usage (run in the Render shell, from the backend folder):
//   node scripts/createProgramTeacher.js anna@epiccampus.live "THE-PASSWORD" Anna
// The third value is part of the teacher's name in the Teachers tab. The password is not saved anywhere in the code.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
(async () => {
  const [emailRaw, password, who] = process.argv.slice(2);
  const email = String(emailRaw || '').trim().toLowerCase();
  if (!email.includes('@') || !password || password.length < 6 || !who) {
    console.log('Usage: node scripts/createProgramTeacher.js <email> <password, 6+ characters> <part of the teacher name>');
    process.exit(1);
  }
  const teachers = await prisma.programTeacher.findMany({ where: { name: { contains: who, mode: 'insensitive' } } });
  if (teachers.length !== 1) {
    console.log(`Found ${teachers.length} teachers matching "${who}". Use a more exact name.`, teachers.map(t => t.name));
    process.exit(1);
  }
  const t = teachers[0];
  const hash = await bcrypt.hash(password, 10);
  let acc = await prisma.student.findUnique({ where: { email } });
  if (!acc) acc = await prisma.student.create({ data: { email, name: t.name, password: hash, role: 'PROGRAM_TEACHER', emailVerified: true } });
  else if (['PROGRAM_TEACHER', 'TEACHER'].includes(acc.role)) acc = await prisma.student.update({ where: { id: acc.id }, data: { password: hash, role: 'PROGRAM_TEACHER', emailVerified: true } });
  else { console.log('That email belongs to a student account. Use a different email.'); process.exit(1); }
  await prisma.programTeacher.update({ where: { id: t.id }, data: { accountId: acc.id, email } });
  console.log(`Done. ${t.name} can sign in as ${email} and will land on the teacher page.`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
