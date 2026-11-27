// IELTS Writing Task 1 Training Paper (Practice papers, Writing): nine Task 1 questions in five parts.
// A bar + line, B pie + table, C map + process, D mixed chart + email, E letter. About 2.5 hours for all five.
// Each part is a "two reports, no essay" writing paper (taskNumber 1 and 3), so the marker uses Task 1 criteria
// for both answers. Part E has one task only. The charts are images made in ChatGPT and saved in public-media;
// each image is attached once its file is there.
const fs = require('fs');
const path = require('path');

const IMG = {
  bar: 'ielts-wt1-bar.png', line: 'ielts-wt1-line.png', pie: 'ielts-wt1-pie.png',
  map: 'ielts-wt1-map.png', process: 'ielts-wt1-process.png', mixed: 'ielts-wt1-mixed.png',
};
const FILES = Object.values(IMG);
const has = f => fs.existsSync(path.join(__dirname, '../../public-media', f));
const img = k => (has(IMG[k]) ? `/media/${IMG[k]}` : null);

const SUM = 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.';
const T = (taskNumber, key, desc, prompt) => ({ taskNumber, minWords: 150, timeMinutes: 17, key, chartDescription: desc, prompt });

const PARTS = [
  {
    code: 'WT1-A', title: 'Writing Task 1 Training · Part A · Bar chart and line graph',
    tasks: [
      T(1, 'bar', 'Bar chart: how students travel to Greenfield University, 2005 and 2025 (%). 2005: bus 35, car 30, bicycle 10, walking 25. 2025: bus 28, car 18, bicycle 22, walking 32.',
        `The bar chart below shows the percentage of students who used four types of transport to travel to Greenfield University in 2005 and 2025.\n\n${SUM}`),
      T(3, 'line', 'Line graph: visitors to three museums in Riverton, 2016-2026 (millions). Science: 2.0, 2.6, 1.2, 2.9, 3.4, 3.8. Art: 3.5, 3.3, 1.0, 2.6, 2.8, 3.0. History: 1.5, 1.6, 0.8, 1.9, 2.5, 3.6 (years 2016, 2018, 2020, 2022, 2024, 2026).',
        `The line graph below shows the number of visitors to three museums in Riverton between 2016 and 2026.\n\n${SUM}`),
    ],
  },
  {
    code: 'WT1-B', title: 'Writing Task 1 Training · Part B · Pie charts and table',
    tasks: [
      T(1, 'pie', 'Two pie charts: average household spending in one country, 2000 and 2025. 2000: housing 25%, food 30%, transport 15%, entertainment 10%, technology 5%, other 15%. 2025: housing 34%, food 22%, transport 14%, entertainment 8%, technology 12%, other 10%.',
        `The pie charts below show how households in one country spent their money in 2000 and 2025.\n\n${SUM}`),
      T(3, null, 'Table: average daily screen time (hours) by age group, 2015 and 2025, phone and TV.',
        'The table below shows the average number of hours per day that people in five age groups spent looking at a phone and watching TV in 2015 and 2025.\n\n' +
        'Age group | Phone 2015 | Phone 2025 | TV 2015 | TV 2025\n' +
        '10-15 | 2.1 | 4.3 | 2.5 | 1.0\n' +
        '16-24 | 3.4 | 5.1 | 1.8 | 0.7\n' +
        '25-44 | 2.6 | 3.9 | 2.2 | 1.5\n' +
        '45-64 | 1.2 | 2.8 | 3.1 | 2.6\n' +
        '65+ | 0.4 | 1.6 | 4.2 | 4.4\n\n' + SUM),
    ],
  },
  {
    code: 'WT1-C', title: 'Writing Task 1 Training · Part C · Maps and process',
    tasks: [
      T(1, 'map', 'Two maps: the village of Ashford in 2000 and today. North-west farmland became a housing estate; the school was enlarged with a sports field; the shop became a supermarket with a car park; the woodland became a park; a bridge was built on the main road across the river; a cycle path runs along the river; the north-east farmland and the south-west houses are unchanged.',
        'The maps below show the village of Ashford in 2000 and today.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.'),
      T(3, 'process', 'Process diagram: how glass bottles are recycled, 8 stages in a cycle: collected from bins, taken by truck to the plant, sorted by colour, washed, crushed into cullet, melted at 1,500°C, moulded into new bottles, filled and delivered to shops.',
        'The diagram below shows how glass bottles are recycled.\n\nSummarise the information by selecting and reporting the main features.\n\nWrite at least 150 words.'),
    ],
  },
  {
    code: 'WT1-D', title: 'Writing Task 1 Training · Part D · Mixed chart and email',
    tasks: [
      T(1, 'mixed', 'Bar and line chart: international students (thousands, bars) and average yearly fee (US$ thousands, line) in one country, 2015-2025. Students: 60, 75, 90, 70, 110, 140. Fee: 6.0, 6.5, 7.2, 7.0, 8.1, 9.0 (years 2015, 2017, 2019, 2021, 2023, 2025).',
        `The chart below shows the number of international students in one country and the average yearly fee they paid between 2015 and 2025.\n\n${SUM}`),
      T(3, null, 'Formal email (General Training Task 1 style): complaint about a damaged laptop bought online.',
        'You recently bought a laptop from an online shop. When it arrived, it was damaged.\n\nWrite an email to the company. In your email:\n- say what you bought and when\n- describe the damage and how it affects you\n- explain what you would like the company to do\n\nWrite at least 150 words. You do NOT need to write any addresses.\n\nBegin your email as follows:\nDear Sir or Madam,'),
    ],
  },
  {
    code: 'WT1-E', title: 'Writing Task 1 Training · Part E · Letter',
    tasks: [
      T(1, null, 'Informal letter (General Training Task 1 style) to a friend who is visiting Sri Lanka.',
        'A friend from another country is planning to visit Sri Lanka for two weeks next year and has asked for your advice.\n\nWrite a letter to your friend. In your letter:\n- suggest the best time of year to come and say why\n- recommend two places your friend should visit\n- give some advice about what to bring\n\nWrite at least 150 words. You do NOT need to write any addresses.\n\nBegin your letter as follows:\nDear ...,'),
    ],
  },
];

// ONE paper (27 Nov): all nine questions in a single 2.5-hour paper, code WT1. Task numbers 1, 3, 4 ... 10
// (2 is kept for essays). The five part papers from the day before are hidden (DRAFT), not deleted.
const NUMS = [1, 3, 4, 5, 6, 7, 8, 9, 10];
const ONE = {
  code: 'WT1', title: 'IELTS Writing Task 1 Training Paper (2.5 hours)', timeLimitMin: 150,
  instructions: 'IELTS Writing Task 1 Training Paper: nine Task 1 questions in one sitting, 2 hours 30 minutes. ' +
    'Questions 1 to 7 are Academic reports (bar chart, line graph, pie charts, table, maps, process, mixed chart); questions 8 and 9 are an email and a letter. ' +
    'Spend about 17 minutes on each question and write at least 150 words. Use the Task buttons to move between questions. When the time is up, all your answers are sent automatically.',
};
function papers() {
  const all = PARTS.flatMap(p => p.tasks);
  return [{
    code: ONE.code, testType: 'WRITING', title: ONE.title, timeLimitMin: ONE.timeLimitMin, difficulty: 3, topic: 'Writing Task 1 Training',
    instructions: ONE.instructions,
    tasks: all.map((t, i) => ({ taskNumber: NUMS[i], minWords: t.minWords, timeMinutes: t.timeMinutes, prompt: t.prompt, chartDescription: t.chartDescription, ...(t.key && img(t.key) ? { chartImageUrl: img(t.key) } : {}) })),
  }];
}

// Adds the one 2.5-hour paper (ACTIVE, practice papers), hides the old five parts and attaches each chart image. Safe to run on every start.
async function addWritingT1Training(prisma) {
  const { addIeltsPapers } = require('./kit');
  const out = { papers: await addIeltsPapers(prisma, papers(), { status: 'ACTIVE' }) };
  await prisma.paper.updateMany({ where: { paperCode: ONE.code, testType: 'WRITING' }, data: { title: ONE.title, instructions: ONE.instructions, timeLimitMin: ONE.timeLimitMin } });
  const hidden = await prisma.paper.updateMany({ where: { paperCode: { in: PARTS.map(p => p.code) }, testType: 'WRITING', status: { not: 'DRAFT' } }, data: { status: 'DRAFT' } });
  if (hidden.count) out.hidden = `${hidden.count} old parts hidden`;
  let attached = 0;
  const paper = await prisma.paper.findFirst({ where: { paperCode: ONE.code, testType: 'WRITING' }, include: { writingTasks: true } });
  const all = PARTS.flatMap(p => p.tasks);
  if (paper) {
    for (let i = 0; i < all.length; i++) {
      const url = all[i].key ? img(all[i].key) : null;
      const row = paper.writingTasks.find(w => w.taskNumber === NUMS[i]);
      if (row && url && row.chartImageUrl !== url) { await prisma.writingTask.update({ where: { id: row.id }, data: { chartImageUrl: url } }); attached++; }
    }
  }
  out.images = `${FILES.filter(has).length} of ${FILES.length} ready${attached ? `, attached ${attached}` : ''}`;
  return out;
}

module.exports = { addWritingT1Training, PARTS, FILES, IMG };
