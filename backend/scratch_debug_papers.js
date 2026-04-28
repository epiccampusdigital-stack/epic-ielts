const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const papers = await prisma.paper.findMany({
    orderBy: { id: 'asc' }
  });
  console.log('--- PAPERS ---');
  papers.forEach(p => {
    console.log(`ID: ${p.id}, Code: ${p.paperCode}, Type: ${p.testType}, Title: ${p.title}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
