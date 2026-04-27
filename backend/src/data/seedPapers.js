require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const newPapers = require('./papers/index');

async function seed() {
  try {
    // Rename existing papers to include difficulty labels
    const difficulties = {
      'READING001': 'IELTS Reading Test — READING001 (Beginner)',
      'READING002': 'IELTS Reading Test — READING002 (Intermediate)',
      'READING003': 'IELTS Reading Test — READING003 (Advanced)',
      'READING004': 'IELTS Reading Test — READING004 (Upper Intermediate)'
    };
    
    for (const [code, title] of Object.entries(difficulties)) {
      await prisma.paper.updateMany({
        where: { paperCode: code },
        data: { title }
      });
      console.log(`Updated title for ${code}`);
    }

    // Insert new papers
    for (const paperData of newPapers) {
      // 1. Delete existing if any
      const existing = await prisma.paper.findFirst({
        where: { paperCode: paperData.code, testType: "READING" }
      });

      if (existing) {
        console.log(`Deleting existing paper ${existing.id}`);
        await prisma.answer.deleteMany({ where: { question: { paperId: existing.id } } });
        await prisma.question.deleteMany({ where: { paperId: existing.id } });
        await prisma.passage.deleteMany({ where: { paperId: existing.id } });
        await prisma.writingTask.deleteMany({ where: { paperId: existing.id } });
        await prisma.attempt.deleteMany({ where: { paperId: existing.id } });
        await prisma.paper.delete({ where: { id: existing.id } });
      }

      // 2. Create paper
      const paper = await prisma.paper.create({
        data: {
          paperCode: paperData.code,
          testType: "READING",
          title: paperData.title,
          timeLimitMin: paperData.timeAllowed,
          instructions: "Read the passages carefully and answer all questions.",
          status: "ACTIVE",
          assignedBatches: "ALL"
        }
      });

      console.log(`Paper created: ${paper.id}`);

      // 3. Create passages
      for (const p of paperData.passages) {
        await prisma.passage.create({
          data: {
            paperId: paper.id,
            passageNumber: p.number,
            title: p.title,
            text: p.text
          }
        });
      }

      // 4. Create questions
      for (const q of paperData.questions) {
        let optionsStr = null;
        if (q.options) {
          optionsStr = JSON.stringify(Object.entries(q.options).map(([key, val]) => `${key}. ${val}`));
        } else if (q.paragraphOptions) {
          optionsStr = JSON.stringify(q.paragraphOptions);
        }

        await prisma.question.create({
          data: {
            paperId: paper.id,
            passageNumber: q.passageNumber,
            questionNumber: q.number,
            questionType: q.type,
            content: q.text,
            options: optionsStr,
            correctAnswer: q.answer,
            explanation: q.explanation || null
          }
        });
      }

      console.log(`Seed successful for ${paperData.code}`);
    }
  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
