// Five new IELTS Writing papers (Academic style): Task 1 (a picture in backend/public-media) and Task 2 (an essay).
// 60 minutes each. Task 1 at least 150 words (20 minutes), Task 2 at least 250 words (40 minutes).
// Types covered: line graph, bar chart, table, process diagram, mixed chart; and opinion, discussion,
// advantages and disadvantages, problem and solution, two-part question. All content is original.
// Model answers are in modelAnswers.js (teachers only).

const T1_END = '\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.';
const T2_END = '\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.';
const task1 = (img, alt, intro) => ({ taskNumber: 1, minWords: 150, timeMinutes: 20, chartImageUrl: `/media/${img}`, chartDescription: alt, prompt: intro + T1_END });
const task2 = text => ({ taskNumber: 2, minWords: 250, timeMinutes: 40, prompt: text + T2_END });
const INSTR = 'Two tasks. Task 1: about 20 minutes, at least 150 words. Task 2: about 40 minutes, at least 250 words. Task 2 carries more marks.';
const paper = (code, topic, t1, t2) => ({ code, testType: 'WRITING', title: 'IELTS Writing (new)', timeLimitMin: 60, difficulty: 3, topic, instructions: INSTR, tasks: [t1, t2] });

const PAPERS = [
  paper('IW-NEW-01', 'Line graph · opinion essay',
    task1('ielts-writing-new1-line.png', 'International students in Australia, Canada and South Korea, 2000 to 2025', 'The line graph below shows the number of international students in Australia, Canada and South Korea between 2000 and 2025.'),
    task2('Some people believe that students should study in their own country, while others think studying abroad is far more valuable.\n\nTo what extent do you agree or disagree that studying abroad is better than studying at home?')),
  paper('IW-NEW-02', 'Bar chart · discuss both views',
    task1('ielts-writing-new2-bar.png', 'Average hours per day spent on smartphones by age group, 2015 and 2025', 'The bar chart below shows the average number of hours people in five age groups spent on their smartphones each day in 2015 and 2025.'),
    task2('Some people think that smartphones and tablets should be used in every classroom. Others believe that they distract students and should not be allowed in schools.\n\nDiscuss both these views and give your own opinion.')),
  paper('IW-NEW-03', 'Table · advantages and disadvantages',
    task1('ielts-writing-new3-table.png', 'International tourism in Thailand, Japan, Vietnam, Sri Lanka and the Maldives, 2024', 'The table below gives information about international tourism in five Asian countries in 2024.'),
    task2('More and more people are moving from the countryside to live in large cities.\n\nDo the advantages of living in a big city outweigh the disadvantages?')),
  paper('IW-NEW-04', 'Process diagram · problem and solution',
    task1('ielts-writing-new4-process.png', 'The stages in the production of black tea', 'The diagram below shows how black tea is produced.'),
    task2('Traffic jams are becoming a serious problem in many cities around the world.\n\nWhat are the main causes of this problem, and what measures could be taken to solve it?')),
  paper('IW-NEW-05', 'Mixed chart · two-part question',
    task1('ielts-writing-new5-climate.png', 'Average monthly rainfall and temperature in a coastal city', 'The chart below shows the average monthly rainfall and temperature in a coastal city.'),
    task2('Every year, large numbers of young people leave their home country to work abroad.\n\nWhy do so many young people choose to work in another country? Is this a positive or negative development for their home country?')),
];

async function addNewIeltsWriting(prisma) {
  const { addIeltsPapers } = require('./kit');
  return addIeltsPapers(prisma, PAPERS);
}

module.exports = { PAPERS, addNewIeltsWriting };
