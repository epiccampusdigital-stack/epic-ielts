require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('Connecting to database...');
  console.log('URL preview:', process.env.DATABASE_URL?.substring(0, 50));

  const adminHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  try {
    const admin = await prisma.student.upsert({
      where: { email: 'admin@epic.com' },
      update: {
        password: adminHash,
        role: 'ADMIN',
        name: 'Admin',
        batch: 'STAFF'
      },
      create: {
        email: 'admin@epic.com',
        password: adminHash,
        name: 'Admin',
        role: 'ADMIN',
        batch: 'STAFF'
      }
    });
    console.log('Admin account ready:', admin.email);

    const student = await prisma.student.upsert({
      where: { email: 'student@epic.com' },
      update: {
        password: studentHash,
        role: 'STUDENT',
        name: 'Test Student',
        batch: 'GENERAL'
      },
      create: {
        email: 'student@epic.com',
        password: studentHash,
        name: 'Test Student',
        role: 'STUDENT',
        batch: 'GENERAL'
      }
    });
    console.log('Student account ready:', student.email);

    const count = await prisma.student.count();
    console.log('Total students in database:', count);

    const allStudents = await prisma.student.findMany({
      select: { email: true, role: true, batch: true }
    });
    console.log('All accounts:', JSON.stringify(allStudents, null, 2));

    await prisma.paper.updateMany({ data: { status: 'ACTIVE' } });
    console.log('Papers activated');

  } catch (err) {
    console.error('Error:', err.message);
    if (err.code === 'P1001') {
      console.error('Cannot reach database - check DATABASE_URL in .env');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
