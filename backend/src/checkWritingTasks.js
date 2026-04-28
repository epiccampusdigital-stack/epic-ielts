const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const papers = await prisma.paper.findMany({
    where: { testType: 'WRITING' },
    include: { writingTasks: true },
    orderBy: { paperCode: 'asc' }
  });

  console.log('--- WRITING PAPERS AND TASKS ---');
  papers.forEach(p => {
    console.log(`Paper: ${p.paperCode} (ID: ${p.id}) - ${p.title}`);
    p.writingTasks.forEach(t => {
      console.log(`  Task ${t.taskNumber}: ${t.chartImageUrl ? t.chartImageUrl : 'NO IMAGE'} - ${t.prompt.substring(0, 50)}...`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
