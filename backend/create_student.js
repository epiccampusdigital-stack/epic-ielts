const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('student123', 10);
  const user = await prisma.student.upsert({
    where: { email: 'student@epic.com' },
    update: {
      name: 'Test Student',
      password,
      batch: 'BATCH-A',
      role: 'STUDENT',
    },
    create: {
      email: 'student@epic.com',
      name: 'Test Student',
      password,
      batch: 'BATCH-A',
      role: 'STUDENT',
    },
  });
  console.log('Student created:', user.email);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
