/**
 * One-off: mark earliest COMPLETED paper-001 attempt per skill as placement,
 * and sync Student.placementDone when all four skills have a placement attempt.
 */
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');

const SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];

async function main() {
  const prisma = new PrismaClient();
  let attemptsMarked = 0;

  try {
    const students = await prisma.student.findMany({
      select: { id: true, email: true },
      orderBy: { id: 'asc' },
    });

    for (const student of students) {
      let skillsMarked = 0;

      for (const skill of SKILLS) {
        const paper = await prisma.paper.findFirst({
          where: { paperCode: '001', testType: skill },
          select: { id: true },
        });
        if (!paper) continue;

        const earliest = await prisma.attempt.findFirst({
          where: {
            studentId: student.id,
            paperId: paper.id,
            status: 'COMPLETED',
            endedAt: { not: null },
          },
          orderBy: [{ startedAt: 'asc' }, { id: 'asc' }],
        });

        if (!earliest) continue;

        await prisma.attempt.update({
          where: { id: earliest.id },
          data: { isPlacement: true },
        });
        skillsMarked += 1;
        attemptsMarked += 1;
      }

      if (skillsMarked === 0) {
        continue;
      }

      const placementDone = skillsMarked === 4;
      await prisma.student.update({
        where: { id: student.id },
        data: { placementDone },
      });

      console.log(
        `Student #${student.id} (${student.email}): marked ${skillsMarked} of 4 skills as placement`
      );
    }

    const z = await prisma.student.count({ where: { placementDone: true } });

    console.log(
      `Total: ${students.length} students processed, ${attemptsMarked} attempts marked, ${z} students now have placementDone=true`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
