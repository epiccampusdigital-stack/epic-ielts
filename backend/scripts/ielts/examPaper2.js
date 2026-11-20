// EXAM PAPER 2 (Midway Final Exam, Exam tab): one 2.5-hour timer for three parts done straight after each other (no breaks).
//   Part 1 Listening (examPaper2Listening.js): 3 parts, 30 questions, 25 minutes
//   Part 2 Reading (below): 2 passages, 26 questions, 45 minutes
//   Part 3 Writing (below): Task 1 (table) + Task 2 (essay), 60 minutes
// Reading is about 6.5 out of 10: real IELTS question types including YES / NO / NOT GIVEN (the writer's views),
// matching people to ideas and a summary with a word list. Words stay ordinary; the difficulty is in reading closely.
const { mc, sc, I } = require('./kit');

const P1 = `[A] Almost everyone puts things off from time to time, but for some people it is a serious problem. Surveys suggest that around one in five adults are chronic procrastinators, who delay tasks so often that it damages their work, their finances or their health. Among university students, the figure is far higher: in some studies, more than 80 percent admit that they regularly leave assignments until the last moment.

[B] For a long time, procrastination was seen simply as a problem of time management. The solution, it seemed, was to teach people to plan their days more carefully, with lists, calendars and deadlines. Yet many procrastinators are excellent planners. They know exactly what they should be doing and when; they simply do not do it. This has led psychologists to look for a different explanation.

[C] One influential idea is that procrastination is not about time at all, but about feelings. According to the psychologist Fuschia Sirois, people put off tasks that make them feel bored, anxious or unsure of themselves. Avoiding the task brings immediate relief, so the brain learns that delay is rewarding, even though the task itself does not go away. In other words, procrastination is a way of repairing our mood in the short term, at the cost of our goals in the long term.

[D] A famous study in the 1990s showed how this trade-off works. Dianne Tice and Roy Baumeister followed a group of university students through a term. At the start, the students who procrastinated reported less stress and fewer health problems than their classmates, apparently because they were not yet thinking about their work. By the end of the term, however, the situation had reversed: the procrastinators were more stressed, visited the doctor more often and received lower marks. The early benefits, the researchers concluded, were far outweighed by the later costs.

[E] Another line of research looks at how we think about our future selves. When the psychologist Hal Hershfield scanned the brains of volunteers, he found that thinking about themselves ten years in the future produced activity that was more similar to thinking about a stranger than to thinking about themselves now. If the future self feels like another person, it becomes easier to leave our problems for "him" or "her" to deal with. In later experiments, people who were shown pictures of their own faces made to look older chose to save more money for the future.

[F] So what can be done? The psychologist Timothy Pychyl argues that waiting until we "feel like" starting is a mistake, because the feeling rarely arrives. His advice is to focus only on the next small action, such as opening the document or writing one sentence, because getting started is usually the hardest part. Other researchers recommend being kinder to ourselves. In one study, students who forgave themselves for procrastinating before one exam procrastinated less before the next one, perhaps because they no longer associated studying with guilt.`;

const P2 = `[A] Over the past twenty years, the way we buy clothes has changed dramatically. Global clothing production roughly doubled between 2000 and 2014, while the average number of times each item was worn fell sharply. Retailers that once released new collections four times a year now add new designs every week, and prices have fallen so low that many shoppers think of clothes as almost disposable. This model, known as fast fashion, has made fashionable clothing available to millions of people who could not previously afford it. Its hidden costs, however, are only now becoming clear.

[B] The first of these costs is environmental. Growing cotton requires huge amounts of water: one estimate suggests that producing the cotton for a single T-shirt uses around 2,700 litres, enough drinking water for one person for more than two years. Synthetic fabrics such as polyester avoid this problem, but they are made from oil, and every time they are washed they release tiny plastic fibres that end up in rivers and oceans. Estimates of the fashion industry's share of global carbon emissions vary widely, from around two percent to as much as eight, but even the lowest figure is greater than that of many entire countries.

[C] The second cost is what happens when clothes are thrown away. Less than one percent of the material used to make clothing is recycled into new clothes. Most unwanted garments are burned or buried, and a large share of the clothes that are donated to charity are shipped abroad. In the Atacama Desert in Chile, mountains of second-hand clothing, much of it never worn, have built up in recent years because there is simply nobody to buy it. Recycling is difficult because most modern clothes are made from blends of different fibres, which are very hard to separate.

[D] The third cost falls on the workers who make the clothes. To keep prices low, brands place orders with factories in countries where wages are low, often with very short deadlines. In 2013, more than 1,100 people were killed when the Rana Plaza building in Bangladesh, which contained several clothing factories, collapsed. The disaster led to a legally binding agreement on building safety signed by many international brands, and conditions in many factories have improved since then. Nevertheless, low pay and long hours remain common in the industry.

[E] In my view, the solution does not lie mainly with shoppers. It is often said that consumers should simply buy less, and this would certainly help. But it is unrealistic to expect millions of people to change their habits while cheap clothes are advertised everywhere, and it is unfair to blame those on low incomes for choosing the cheapest option. Governments have a far more important role to play. France, for example, has banned companies from destroying unsold clothes, and several countries are considering making brands pay for the collection and recycling of the products they sell.

[F] There are, nonetheless, some encouraging signs. The market for second-hand clothing is growing quickly, especially among young people, and some brands now offer free repairs or rent clothes instead of selling them. Whether these changes will be large enough to make a real difference is still uncertain. What seems clear is that the true price of a cheap T-shirt is much higher than the figure on its label.`;

const PEOPLE = ['Fuschia Sirois', 'Dianne Tice and Roy Baumeister', 'Hal Hershfield', 'Timothy Pychyl'];
const PARA6 = ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F'];
const WORDS = ['governments', 'shoppers', 'blends', 'charity', 'wages', 'deserts', 'repairs', 'factories'];
const YNNG = (a, b) => `Questions ${a} to ${b}. Do the following statements agree with the views of the writer in the passage? Choose YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.`;
// YES / NO / NOT GIVEN: a multiple-choice question with the three answers as options
const yn = (content, answer, explanation, ev = []) => ({ type: 'MULTIPLE_CHOICE', content, options: ['YES', 'NO', 'NOT GIVEN'], answer: { YES: 'A', NO: 'B', 'NOT GIVEN': 'C' }[answer], explanation, ev });

const READING = {
  code: 'EX2-R', testType: 'READING', title: 'Exam Paper 2 · Part 2 of 3 · Reading', timeLimitMin: 45, difficulty: 4, topic: 'Exam Paper 2',
  instructions: 'Exam Paper 2 (Midway Final Exam), Part 2 of 3: Reading. Two passages and 26 questions. Suggested time: 45 minutes (about 20 minutes for each passage, plus time to check). The exam timer keeps running; when you submit, Writing opens straight away. Passage 1: questions 1 to 13. Passage 2: questions 14 to 26. Read the questions carefully: some answers that look right are not.',
  passages: [
    { title: 'Why we put things off', text: P1, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.PARA(1, 5, 'F'), questions: [
        mc('An example of a method that changed people\'s behaviour by making the future seem closer', PARA6, 'E', 'Paragraph E: people shown older pictures of their own faces "chose to save more money for the future".', ['people who were shown pictures of their own faces made to look older chose to save more money for the future']),
        mc('A reason why a traditional solution to procrastination does not always work', PARA6, 'B', 'Paragraph B: "many procrastinators are excellent planners", so time management is not the answer.', ['Yet many procrastinators are excellent planners']),
        mc('A comparison between how common procrastination is in two groups of people', PARA6, 'A', 'Paragraph A compares adults (one in five) and university students (more than 80 percent).', ['Among university students, the figure is far higher']),
        mc('A suggestion that being less hard on yourself can help', PARA6, 'F', 'Paragraph F: "Other researchers recommend being kinder to ourselves."', ['Other researchers recommend being kinder to ourselves']),
        mc('A description of how a habit of delay is learned', PARA6, 'C', 'Paragraph C: "the brain learns that delay is rewarding".', ['so the brain learns that delay is rewarding']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 6 to 9. Match each idea with the correct researcher or researchers, A to D. You may use a letter more than once.', questions: [
        mc('Delaying a task can make us feel better for a short time.', PEOPLE, 'A', 'Sirois: procrastination is "a way of repairing our mood in the short term".', ['procrastination is a way of repairing our mood in the short term']),
        mc('The disadvantages of procrastination appear later than the advantages.', PEOPLE, 'B', 'Tice and Baumeister: "The early benefits... were far outweighed by the later costs."', ['The early benefits, the researchers concluded, were far outweighed by the later costs']),
        mc('It is better to start a task without waiting to be in the right mood.', PEOPLE, 'D', 'Pychyl: waiting until we "feel like" starting is a mistake.', ['waiting until we "feel like" starting is a mistake']),
        mc('We may not think of our older selves as truly "us".', PEOPLE, 'C', 'Hershfield: the future self is like "a stranger".', ['more similar to thinking about a stranger than to thinking about themselves now']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SC(10, 13), wordLimit: 'ONE WORD ONLY', questions: [
        sc('People who delay tasks very often are described as ________ procrastinators.', 'CHRONIC', '"chronic procrastinators, who delay tasks so often..."', ['chronic procrastinators']),
        sc('At the start of the term, procrastinators had less stress and fewer ________ problems.', 'HEALTH', '"reported less stress and fewer health problems".', ['reported less stress and fewer health problems']),
        sc('At the end of the term, procrastinators visited the ________ more often.', 'DOCTOR', '"visited the doctor more often". (Not "marks": they got lower marks, which is a different point.)', ['visited the doctor more often']),
        sc('Students who forgave themselves may have stopped linking studying with ________.', 'GUILT', '"they no longer associated studying with guilt".', ['they no longer associated studying with guilt']),
      ] },
    ] },
    { title: 'The true cost of a cheap T-shirt', text: P2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: YNNG(14, 18), questions: [
        yn('Fast fashion has allowed many people to buy clothes they could not afford before.', 'YES', 'Paragraph A: it "has made fashionable clothing available to millions of people who could not previously afford it".', ['has made fashionable clothing available to millions of people who could not previously afford it']),
        yn('Polyester is a better choice for the environment than cotton.', 'NOT GIVEN', 'The writer gives a problem with each one (water for cotton, oil and plastic fibres for polyester) but never says which is better. Students often choose YES because polyester "avoids this problem".'),
        yn('Shoppers should take most of the responsibility for solving the problem.', 'NO', 'Paragraph E: "the solution does not lie mainly with shoppers". Governments are "far more important".', ['the solution does not lie mainly with shoppers']),
        yn('It is unfair to criticise people on low incomes for buying cheap clothes.', 'YES', '"it is unfair to blame those on low incomes for choosing the cheapest option".', ['it is unfair to blame those on low incomes for choosing the cheapest option']),
        yn('Renting clothes will soon become more popular than buying them.', 'NOT GIVEN', 'Paragraph F says some brands rent clothes and that the future is "still uncertain"; nothing about renting becoming more popular than buying.'),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(19, 22), questions: [
        mc('What does the writer say about estimates of the fashion industry\'s carbon emissions?', ['They are probably too high', 'Experts do not agree on the exact figure', 'They are lower than those of most countries', 'They have fallen since 2014'], 'B', '"Estimates... vary widely, from around two percent to as much as eight". (C is the opposite: even the lowest figure is greater than many countries.)', ["Estimates of the fashion industry's share of global carbon emissions vary widely"]),
        mc('Why have piles of clothing built up in the Atacama Desert?', ['Factories there produce too much', 'Charities refuse to accept old clothes', 'There is no one to buy the clothes', 'The clothes cannot be burned there'], 'C', '"because there is simply nobody to buy it".', ['because there is simply nobody to buy it']),
        mc('According to paragraph C, why is it difficult to recycle clothes?', ['Most clothes are thrown away too early', 'Many clothes contain a mix of fibres', 'Recycling machines are too expensive', 'Charities send clothes abroad'], 'B', '"most modern clothes are made from blends of different fibres, which are very hard to separate". (D is true too, but it is not the reason recycling is hard.)', ['most modern clothes are made from blends of different fibres, which are very hard to separate']),
        mc('What happened after the Rana Plaza disaster?', ['Brands moved their factories to other countries', 'Wages in the industry rose sharply', 'Many brands signed an agreement on safety', 'Long working hours were banned'], 'C', '"a legally binding agreement on building safety signed by many international brands". Low pay and long hours "remain common".', ['a legally binding agreement on building safety signed by many international brands']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: `Questions 23 to 26. Complete the summary using the list of words, A to H. Write the correct letter. Summary: Most unwanted clothes are burned or buried, and many donated to (23) ________ are sent to other countries. Clothes are hard to recycle because they are made of (24) ________ of fibres. In the writer's opinion, (25) ________ can do more than individuals, for example by stopping companies destroying unsold stock. Some brands now offer free (26) ________ to make clothes last longer.`, questions: [
        mc('Gap 23', WORDS, 'D', '"a large share of the clothes that are donated to charity are shipped abroad".', ['a large share of the clothes that are donated to charity are shipped abroad']),
        mc('Gap 24', WORDS, 'C', '"made from blends of different fibres".', ['made from blends of different fibres']),
        mc('Gap 25', WORDS, 'A', '"Governments have a far more important role to play." (Not B: the writer says the solution does NOT lie mainly with shoppers.)', ['Governments have a far more important role to play']),
        mc('Gap 26', WORDS, 'G', '"some brands now offer free repairs".', ['some brands now offer free repairs']),
      ] },
    ] },
  ],
};

const WRITING = {
  code: 'EX2-W', testType: 'WRITING', title: 'Exam Paper 2 · Part 3 of 3 · Writing', timeLimitMin: 60, difficulty: 4, topic: 'Exam Paper 2',
  instructions: 'Exam Paper 2 (Midway Final Exam), Part 3 of 3: Writing. Two tasks. Use the rest of your time (at least 60 minutes). Task 1: about 20 minutes, at least 150 words. Task 2: about 40 minutes, at least 250 words. Task 2 carries more marks.',
  tasks: [
    { taskNumber: 1, minWords: 150, timeMinutes: 20, chartImageUrl: '/media/ielts-exam2-table.png', chartDescription: 'How people travelled to work in three cities in 2005 and 2025: car, bus, train, bicycle, walking',
      prompt: 'The table below shows the percentage of workers in three cities who used different ways of travelling to work in 2005 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.' },
    { taskNumber: 2, minWords: 250, timeMinutes: 40,
      prompt: 'In many countries, people now buy far more clothes, phones and other products than they did in the past, and throw them away more quickly.\n\nWhy is this happening? What can be done to reduce the amount that people throw away?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.' },
  ],
};

// Table for Task 1 (also drawn into backend/public-media/ielts-exam2-table.png)
const TABLE = {
  cities: ['Northbridge', 'Easton', 'Riverside'],
  modes: ['Car', 'Bus', 'Train', 'Bicycle', 'Walking'],
  y2005: { Northbridge: [55, 20, 10, 5, 10], Easton: [40, 30, 15, 5, 10], Riverside: [35, 15, 30, 10, 10] },
  y2025: { Northbridge: [45, 15, 20, 10, 10], Easton: [42, 28, 15, 5, 10], Riverside: [20, 15, 35, 20, 10] },
};

function checkExam2() {
  const errs = []; let n = 0;
  READING.passages.forEach(ps => ps.groups.forEach(g => g.questions.forEach(q => {
    n++;
    (q.ev || []).forEach(e => { if (!ps.text.includes(e)) errs.push(`R Q${n}: not in passage: ${e}`); });
    if (q.options && (!q.answer || q.answer.charCodeAt(0) - 65 >= q.options.length)) errs.push(`R Q${n}: bad answer`);
    if (q.type === 'TRUE_FALSE_NOT_GIVEN' && q.answer !== 'NOT GIVEN' && !(q.ev || []).length) errs.push(`R Q${n}: no evidence`);
  })));
  if (n !== 26) errs.push(`reading has ${n} questions, not 26`);
  for (const y of ['y2005', 'y2025']) for (const c of TABLE.cities) { const t = TABLE[y][c].reduce((a, b) => a + b, 0); if (t !== 100) errs.push(`table ${y} ${c} adds to ${t}`); }
  return errs.concat(require('./examPaper2Listening').checkListening());
}

module.exports = { READING, WRITING, TABLE, checkExam2 };

// Adds Paper 2 (all locked). The listening paper saved earlier with 4 parts is replaced by the 3-part one,
// only if no student has started it. Audio files in backend/public-media are attached when they are there.
const AUDIO = { 1: 'ielts-exam2-listening-part1.mp3', 2: 'ielts-exam2-listening-part2.mp3', 3: 'ielts-exam2-listening-part3.mp3' };
async function addExamPaper2(prisma) {
  const errs = checkExam2();
  if (errs.length) return { skipped: 'check failed', errors: errs.slice(0, 5) };
  const { LISTENING } = require('./examPaper2Listening');
  const out = {};
  const old = await prisma.paper.findFirst({ where: { paperCode: 'EX2-L', testType: 'LISTENING' }, include: { sections: true, _count: { select: { attempts: true } } } });
  if (old && old.sections.length !== LISTENING.sections.length && old._count.attempts === 0) {
    await prisma.paper.delete({ where: { id: old.id } });
    out.replacedListening = true;
  }
  const { addIeltsPapers } = require('./kit');
  out.papers = await addIeltsPapers(prisma, [LISTENING, READING, WRITING], { status: 'EXAM_LOCKED' });
  // keep titles and instructions in step with this file (e.g. the rename to "Midway Final Exam")
  for (const p of [LISTENING, READING, WRITING]) {
    await prisma.paper.updateMany({ where: { paperCode: p.code, testType: p.testType }, data: { title: p.title, instructions: p.instructions } });
  }
  // attach the recorded parts
  const fs = require('fs'); const path = require('path');
  const lis = await prisma.paper.findFirst({ where: { paperCode: 'EX2-L', testType: 'LISTENING' }, include: { sections: true } });
  let attached = 0;
  for (const s of lis ? lis.sections : []) {
    const file = AUDIO[s.number];
    if (!file || !fs.existsSync(path.join(__dirname, '../../public-media', file))) continue;
    const url = `/media/${file}`;
    if (s.audioUrl !== url) { await prisma.section.update({ where: { id: s.id }, data: { audioUrl: url } }); attached++; }
  }
  out.audio = attached ? `attached ${attached}` : 'no change';
  return out;
}

module.exports.addExamPaper2 = addExamPaper2;
module.exports.AUDIO = AUDIO;
