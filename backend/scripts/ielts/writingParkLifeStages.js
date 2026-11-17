// IELTS Writing (Academic style): Task 1 = two maps of a park (2010 and today) + a pie chart; Task 2 = essay on stages of life.
// The image is served by the backend from /media (backend/public-media). All content is original.

const PAPER = {
  code: 'IW-PARK-LIFE', testType: 'WRITING', title: 'IELTS Writing (new)', timeLimitMin: 60, difficulty: 2, topic: 'Maps, charts and stages of life',
  instructions: 'Two tasks. Spend about 20 minutes on Task 1 and about 40 minutes on Task 2. Task 2 carries more marks than Task 1.',
  tasks: [
    {
      taskNumber: 1, minWords: 150, timeMinutes: 20,
      chartImageUrl: '/media/ielts-writing-riverside-park.png',
      chartDescription: 'Riverside Park in 2010 and today, and the main reason for visiting the park in 2025',
      prompt: 'The maps below show Riverside Park in 2010 and today. The pie chart shows visitors\' main reason for visiting the park in 2025.\n\n'
        + 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n'
        + 'Write at least 150 words.',
    },
    {
      taskNumber: 2, minWords: 250, timeMinutes: 40,
      prompt: 'Some people believe that the first years of life, from infancy to early childhood, are the most important stage in a person\'s development. Others think that adolescence, the teenage years, has a bigger effect on the kind of adult a person becomes.\n\n'
        + 'Discuss both these views and give your own opinion.\n\n'
        + 'Give reasons for your answer and include any relevant examples from your own knowledge or experience.\n\n'
        + 'Write at least 250 words.',
    },
  ],
};

async function addParkLifeWriting(prisma) {
  const have = await prisma.paper.findFirst({ where: { paperCode: PAPER.code, testType: 'WRITING' }, select: { id: true } });
  if (have) return { skipped: 'already there' };
  const { seedPaperList } = require('../generalEnglish/placement');
  const last = await prisma.paper.findFirst({ where: { track: 'IELTS', testType: 'WRITING' }, orderBy: { order: 'desc' }, select: { order: true } });
  const n = await seedPaperList(prisma, [PAPER], (last?.order || 0) + 1, { track: 'IELTS' });
  return { added: n };
}

module.exports = { PAPER, addParkLifeWriting };
