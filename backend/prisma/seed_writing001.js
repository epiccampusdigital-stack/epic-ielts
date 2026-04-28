require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding WRITING 001...');

  const existing = await prisma.paper.findFirst({
    where: { paperCode: '001', testType: 'WRITING' }
  });

  let paper;
  if (existing) {
    await prisma.writingTask.deleteMany({ where: { paperId: existing.id } });
    paper = await prisma.paper.update({
      where: { id: existing.id },
      data: { status: 'ACTIVE', assignedBatches: 'ALL' }
    });
    console.log('Updated existing paper:', paper.id);
  } else {
    paper = await prisma.paper.create({
      data: {
        paperCode: '001',
        testType: 'WRITING',
        title: 'IELTS Academic Writing Test',
        timeLimitMin: 60,
        instructions: 'This test has TWO tasks. You must complete BOTH tasks. Task 1: spend about 20 minutes, write at least 150 words. Task 2: spend about 40 minutes, write at least 250 words. Your answers will be assessed on Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.',
        status: 'ACTIVE',
        assignedBatches: 'ALL'
      }
    });
    console.log('Created new paper:', paper.id);
  }

  await prisma.writingTask.create({
    data: {
      paperId: paper.id,
      taskNumber: 1,
      prompt: 'The bar chart below shows the percentage of people in three age groups who used the internet daily in four different countries in 2022. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
      chartImageUrl: '/charts/writing001-task1.svg',
      minWords: 150
    }
  });

  await prisma.writingTask.create({
    data: {
      paperId: paper.id,
      taskNumber: 2,
      prompt: 'In many countries, young people are spending increasing amounts of time using social media. Some people believe this has a negative effect on their social skills and mental health, while others think it helps them stay connected and develop new skills. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
      minWords: 250
    }
  });

  const verify = await prisma.writingTask.findMany({ where: { paperId: paper.id }, orderBy: { taskNumber: 'asc' } });
  console.log('Writing tasks created:', verify.length);
  verify.forEach(t => console.log(' - Task', t.taskNumber, '| chartImageUrl:', t.chartImageUrl || 'none'));

  await prisma.$disconnect();
  console.log('WRITING 001 ready!');
}

main().catch(e => { console.error(e); process.exit(1); });
