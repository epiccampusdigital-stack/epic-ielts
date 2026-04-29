const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const paperId = 42; // The ID of 006-3474
  console.log('--- DELETING DUPLICATE PAPER 42 (006-3474) ---');

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete Student Responses & Attempts
      await tx.answer.deleteMany({ where: { question: { paperId } } });
      await tx.result.deleteMany({ where: { attempt: { paperId } } });
      await tx.writingSubmission.deleteMany({ where: { attempt: { paperId } } });
      await tx.speakingSubmission.deleteMany({ where: { attempt: { paperId } } });
      await tx.attempt.deleteMany({ where: { paperId } });

      // 2. Delete Paper Structure
      await tx.question.deleteMany({ where: { paperId } });
      await tx.questionGroup.deleteMany({
        where: {
          OR: [
            { section: { paperId } },
            { passage: { paperId } }
          ]
        }
      });
      await tx.passage.deleteMany({ where: { paperId } });
      await tx.section.deleteMany({ where: { paperId } });
      await tx.writingTask.deleteMany({ where: { paperId } });

      // 3. Finally delete the Paper itself
      await tx.paper.delete({ where: { id: paperId } });
    });

    console.log('--- DUPLICATE PAPER DELETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('DELETE ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
