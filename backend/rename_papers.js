const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.paper.updateMany({
    where: { paperCode: 'R-MIX-001' },
    data: { paperCode: '001' }
  });
  console.log('Updated R-MIX-001 to 001');

  await prisma.paper.updateMany({
    where: { paperCode: 'R-ADV-002' },
    data: { paperCode: '002' }
  });
  console.log('Updated R-ADV-002 to 002');
}

main().catch(console.error).finally(() => prisma.$disconnect());
