const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('--- DATA INTEGRITY VERIFICATION ---');
  try {
    const studentCount = await prisma.student.count();
    const paperCount = await prisma.paper.count();
    const resultCount = await prisma.result.count();

    console.log(`Students: ${studentCount}`);
    console.log(`Papers:   ${paperCount}`);
    console.log(`Results:  ${resultCount}`);

    if (studentCount >= 45 && paperCount >= 10 && resultCount >= 228) {
      console.log('\n✅ DATA IS INTACT!');
    } else {
      console.log('\n⚠️ WARNING: DATA COUNTS DO NOT MATCH EXPECTATIONS!');
      console.log('Expected: 45 Students, 10 Papers, 228 Results');
    }
  } catch (err) {
    console.error('❌ Error during verification:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
