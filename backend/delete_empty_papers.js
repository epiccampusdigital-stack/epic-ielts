const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const codesToDelete = ['001', 'R001'];
  
  const papers = await prisma.paper.findMany({
    where: {
      paperCode: { in: codesToDelete }
    }
  });

  if (papers.length === 0) {
    console.log('No papers found with codes 001 or R001.');
    return;
  }

  for (const paper of papers) {
    // Delete related entities just in case, though they are reported as empty
    const attempts = await prisma.attempt.findMany({ where: { paperId: paper.id } });
    for (const attempt of attempts) {
      await prisma.answer.deleteMany({ where: { attemptId: attempt.id } });
      await prisma.writingSubmission.deleteMany({ where: { attemptId: attempt.id } });
      await prisma.result.deleteMany({ where: { attemptId: attempt.id } });
    }
    await prisma.attempt.deleteMany({ where: { paperId: paper.id } });
    await prisma.question.deleteMany({ where: { paperId: paper.id } });
    await prisma.writingTask.deleteMany({ where: { paperId: paper.id } });
    
    await prisma.paper.delete({ where: { id: paper.id } });
    console.log(`Successfully deleted paper: ${paper.paperCode}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
