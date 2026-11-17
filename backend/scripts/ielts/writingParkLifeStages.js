// IELTS Writing (Academic style), three tasks. Students see them in this order:
//   Task 1 = the park maps (taskNumber 1), Task 2 = the pie chart (taskNumber 3), Task 3 = the essay (taskNumber 2).
// The essay keeps taskNumber 2 so it is marked as the essay, and students who started the old two-task version keep their essay.
// The image is served by the backend from /media (backend/public-media). All content is original.

const MAP_IMG = '/media/ielts-writing-riverside-map.png';
const PIE_IMG = '/media/ielts-writing-riverside-pie.png';
const MAP_PROMPT_START = 'The maps below show Riverside Park in 2010 and today.\n\n';
const PIE_TASK = {
  taskNumber: 3, minWords: 150, timeMinutes: 20, chartImageUrl: PIE_IMG,
  chartDescription: 'Main reason for visiting Riverside Park, 2025',
  prompt: 'The pie chart below shows the main reason people visited Riverside Park in 2025.\n\n'
    + 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n'
    + 'Write at least 150 words.',
};

const PAPER = {
  code: 'IW-PARK-LIFE', testType: 'WRITING', title: 'IELTS Writing (new)', timeLimitMin: 90, difficulty: 2, topic: 'Maps, charts and stages of life',
  instructions: 'Three tasks. Task 1: the maps (about 20 minutes). Task 2: the pie chart (about 20 minutes). Task 3: the essay (about 40 minutes). The essay carries the most marks.',
  tasks: [
    {
      taskNumber: 1, minWords: 150, timeMinutes: 20,
      chartImageUrl: MAP_IMG,
      chartDescription: 'Riverside Park in 2010 and today',
      prompt: MAP_PROMPT_START
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
    PIE_TASK,
  ],
};

// The live paper was first made with the maps and pie chart in one task. Split it (once): maps only in Task 1,
// a separate pie chart task, and 30 more minutes. Students who refresh get the new tasks and the extra time.
async function splitParkLifeWriting(prisma) {
  const paper = await prisma.paper.findFirst({ where: { paperCode: PAPER.code, testType: 'WRITING' }, include: { writingTasks: true } });
  if (!paper) return { skipped: 'paper not found' };
  if (paper.writingTasks.some(t => t.taskNumber === 3)) return { skipped: 'already split' };
  const t1 = paper.writingTasks.find(t => t.taskNumber === 1);
  await prisma.$transaction([
    ...(t1 ? [prisma.writingTask.update({ where: { id: t1.id }, data: { chartImageUrl: MAP_IMG, chartDescription: 'Riverside Park in 2010 and today', prompt: PAPER.tasks[0].prompt } })] : []),
    prisma.writingTask.create({ data: { paperId: paper.id, taskNumber: 3, prompt: PIE_TASK.prompt, minWords: PIE_TASK.minWords, timeMinutes: PIE_TASK.timeMinutes, chartImageUrl: PIE_IMG, chartDescription: PIE_TASK.chartDescription } }),
    prisma.paper.update({ where: { id: paper.id }, data: { timeLimitMin: PAPER.timeLimitMin, instructions: PAPER.instructions } }),
  ]);
  return { split: true, timeLimitMin: PAPER.timeLimitMin };
}

async function addParkLifeWriting(prisma) {
  const have = await prisma.paper.findFirst({ where: { paperCode: PAPER.code, testType: 'WRITING' }, select: { id: true } });
  if (have) return { skipped: 'already there' };
  const { seedPaperList } = require('../generalEnglish/placement');
  const last = await prisma.paper.findFirst({ where: { track: 'IELTS', testType: 'WRITING' }, orderBy: { order: 'desc' }, select: { order: true } });
  const n = await seedPaperList(prisma, [PAPER], (last?.order || 0) + 1, { track: 'IELTS' });
  return { added: n };
}

module.exports = { PAPER, addParkLifeWriting, splitParkLifeWriting };
