const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const adminPw = await bcrypt.hash('admin123', 10);
  const studentPw = await bcrypt.hash('student123', 10);
  await prisma.student.upsert({
    where: { email: 'admin@epic.com' },
    update: { password: adminPw, role: 'ADMIN' },
    create: { name: 'Admin', email: 'admin@epic.com', password: adminPw, role: 'ADMIN', batch: 'STAFF' }
  });
  await prisma.student.upsert({
    where: { email: 'student@epic.com' },
    update: { password: studentPw, role: 'STUDENT' },
    create: { name: 'Test Student', email: 'student@epic.com', password: studentPw, role: 'STUDENT', batch: 'GENERAL' }
  });
  await prisma.paper.updateMany({ data: { status: 'ACTIVE' } });
  const papers = await prisma.paper.findMany();
  console.log('Papers:', papers.map(p => p.paperCode + ' - ' + p.status));
  console.log('Done!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
