const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const papers = await prisma.paper.findMany();
  console.log('--- PAPERS ---');
  papers.forEach(p => console.log(`ID: ${p.id}, Code: ${p.paperCode}, Type: ${p.testType}, Title: ${p.title}`));
  
  const writingTasks = await prisma.writingTask.findMany();
  console.log('\n--- WRITING TASKS ---');
  writingTasks.forEach(t => console.log(`ID: ${t.id}, PaperID: ${t.paperId}, Task: ${t.taskNumber}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
