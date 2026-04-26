require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production database...');

  const adminPw = await bcrypt.hash('admin123', 10);
  const studentPw = await bcrypt.hash('student123', 10);

  const admin = await prisma.student.upsert({
    where: { email: 'admin@epic.com' },
    update: { password: adminPw, role: 'ADMIN' },
    create: {
      name: 'Admin',
      email: 'admin@epic.com',
      password: adminPw,
      role: 'ADMIN',
      batch: 'STAFF'
    }
  });
  console.log('Admin created:', admin.email);

  const student = await prisma.student.upsert({
    where: { email: 'student@epic.com' },
    update: { password: studentPw, role: 'STUDENT' },
    create: {
      name: 'Test Student',
      email: 'student@epic.com',
      password: studentPw,
      role: 'STUDENT',
      batch: 'GENERAL'
    }
  });
  console.log('Student created:', student.email);

  await prisma.paper.updateMany({ data: { status: 'ACTIVE' } });
  const papers = await prisma.paper.findMany();
  console.log('Papers activated:', papers.length);
  papers.forEach(p => console.log(' -', p.paperCode, p.testType, p.status));

  console.log('Production seed complete!');
}

main()
  .catch(e => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
