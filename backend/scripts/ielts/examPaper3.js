// FINAL EXAM (Exam tab, Sun 29 Nov): three parts, each with its OWN timer. When a part's time is up (or the student
// submits), a 10-second countdown shows and the next part opens by itself.
//   Part 1 Listening (examPaper3Listening.js): 4 parts, 40 questions, 40 minutes (each recording can be played twice)
//   Part 2 Reading (below): 3 passages, 40 questions, 60 minutes
//   Part 3 Writing (below): Task 1 (line graph) + Task 2 (discussion essay), 60 minutes
// Real IELTS layout and question types; the level stays at the Midway exam's (plain words, clear answers in the text).
const { mc, tf, sc, I } = require('./kit');

const P1 = `Instant noodles are one of the most widely eaten foods on the planet. More than 100 billion servings are eaten every year, which is enough for every person in the world to have more than a dozen packets. Yet this food is less than seventy years old, and it was invented by one man working alone in a small shed behind his house.

That man was Momofuku Ando, a businessman living in Osaka, Japan. In the years after the Second World War, food was scarce in Japan, and Ando often saw long queues of hungry people waiting outside noodle stalls in the cold. He believed that a cheap, filling meal that could be prepared at home would help many families. However, his first businesses had failed, and by 1957 he had lost almost everything. With little money and no team of scientists, he began experimenting on his own, often working through the night.

For a whole year, Ando struggled to find a way to dry cooked noodles so that they could be kept for months and then made soft again in just a few minutes. The breakthrough came, according to the company's own history, when he watched his wife making tempura, a dish of vegetables or seafood fried in hot oil. He noticed that frying removed the water from the batter and left tiny holes in it. He tried the same method with noodles that had been flavoured with chicken soup. When hot water was poured over the fried noodles, it filled the holes, and the noodles became soft again in about two minutes.

Ando's product, Chicken Ramen, went on sale in 1958. At first, shopkeepers were doubtful, because it cost more than a portion of fresh noodles. But customers loved the convenience, and sales grew quickly. Within a few years, many other companies had started making their own versions.

The second big step came after a visit to the United States in 1966. Ando saw supermarket managers breaking his noodles into paper cups and eating them with forks, because they had no bowls. This gave him the idea of selling noodles in a cup that could be used for cooking, serving and eating. Cup Noodles went on sale in 1971. The cup was made of a light foam material that kept the soup hot and was easy to hold.

Today, instant noodles are eaten in more than eighty countries. China eats the most in total, but if we look at the number of servings per person, South Korea is at the top of the list, with each person eating about 80 packets a year. Many Koreans see ramyeon, the Korean name for the dish, as a comfort food, and it often appears in Korean films and dramas.

Instant noodles have also gone into space. In 2005, a Japanese astronaut took a special version to the International Space Station. The noodles were made in small balls so that they would not float away, and the soup was thicker than usual.

Not everyone is a fan, however. Nutrition experts point out that most instant noodles contain a lot of salt and fat and very few vitamins. They suggest adding vegetables or an egg to make the meal healthier. Ando himself, who lived to the age of 96, reportedly ate Chicken Ramen almost every day.`;

const P2 = `[A] The idea of a five-day working week is newer than many people think. It became common only in the twentieth century, when factory owners such as Henry Ford found that workers who had two days off were more productive and spent more money in their free time. Since then, the length of the working week has hardly changed. Today, a growing number of companies are asking whether four days might be the next step.

[B] Some of the best-known evidence comes from Iceland. Between 2015 and 2019, around 2,500 people working for the city of Reykjavik and the national government took part in trials. Their working week was cut from 40 hours to 35 or 36 hours, but their pay stayed the same. Researchers found that the amount of work done stayed the same or even improved in most workplaces, and workers said they felt less stressed and had more time for their families.

[C] In 2022, a larger trial took place in the United Kingdom. Sixty-one companies, from banks to restaurants, and around 2,900 employees reduced their hours for six months. At the end of the trial, 56 of the companies decided to continue with a shorter week, and 18 made the change permanent. The companies' income stayed roughly the same, while staff took fewer sick days and fewer people left their jobs.

[D] Supporters of the four-day week point out that it does not simply mean doing five days of work in four. Many companies in the trials changed the way they worked. They held fewer meetings and made them shorter, and some set aside quiet "focus time" when staff could not be disturbed by emails or calls. This approach is sometimes called the 100-80-100 model: workers receive 100 percent of their pay for 80 percent of the time, in return for 100 percent of the work.

[E] However, the idea is not easy for every workplace. Hospitals, schools and shops need people there every day, so they cannot simply close on Fridays. Instead, they must organise staff so that some people take Monday off and others take Friday off, which can be complicated. In some trials, workers also said they felt more pressure, because they had to do the same amount of work in less time. A few companies stopped the trial early for this reason.

[F] Some governments are now taking an interest. In 2022, Belgium passed a law that gives workers the right to ask to work their full hours in four longer days instead of five. Their total hours do not change, but they get an extra day off. Whether other countries will follow is uncertain. What seems clear is that many younger workers now see free time as just as important as pay, and employers who want to attract them may have to listen.`;

const P3 = `[A] It is widely believed that children learn languages more easily than adults. There is some truth in this belief, but it is far from the whole story. In 1967, the scientist Eric Lenneberg suggested that there is a "critical period" in childhood, ending at around puberty, when the brain is especially ready to learn language naturally. After this, he argued, learning becomes much harder. This idea has influenced language teaching for decades, and it has led many adults to believe that they are simply too old to learn.

[B] Recent research has given a more detailed picture. In 2018, a team led by Joshua Hartshorne used an online grammar quiz that was completed by nearly 670,000 people. They found that the ability to learn grammar stays strong until the late teenage years and only then begins to fall. However, they also found that people who want to speak with the grammar of a native speaker probably need to start before the age of ten. In other words, age matters for reaching a perfect level, but this does not mean that adults cannot learn a language well.

[C] In fact, adults have several advantages over children. They have better strategies for remembering new words, they can understand grammar rules when these are explained, and they already know a great deal about how language works from their first language. The researcher Carmen Muñoz studied students in Spain who began learning English at different ages. Those who started later actually made faster progress at first. Muñoz concluded that the amount and quality of practice matter more than the age at which a learner starts.

[D] The hardest thing for most adults is pronunciation. People who learn a language later in life usually keep an accent from their first language, even after many years. In my view, however, this is not a serious problem. An accent is part of who we are, and as long as other people can understand what we say, it does not stop us from communicating well. Many successful international business people, scientists and politicians speak English with a strong accent.

[E] Learning a language in adulthood may also be good for the brain. The psychologist Ellen Bialystok found that people who used two languages throughout their lives showed signs of memory loss about four years later than people who spoke only one. Another researcher, Thomas Bak, found that people who learned a second language as adults, not only as children, also had better thinking skills in old age. Learning a language, it seems, helps to keep the brain healthy.

[F] So is it ever too late to learn a language? I believe the answer is no. Age is only one of many factors, and it is not the most important one. What matters most is motivation: learners who have a clear reason to learn, such as studying or working abroad, and who practise regularly, can reach a high level at any age. Adults should stop using age as an excuse and start speaking.`;

const HEADINGS = ['A law that gives workers a choice', 'Results from a trial with many different businesses', 'Why some workplaces find the idea difficult', 'Changing the way work is organised', 'An early experiment in the public sector', 'How the working week began', 'Why workers want higher pay', 'The cost of training new staff'];
const HEAD = (a, b) => `Questions ${a} to ${b}. The passage has six paragraphs, A to F. Choose the correct heading for each paragraph from the list of headings, A to H. There are more headings than paragraphs.`;
const PEOPLE = ['Eric Lenneberg', 'Joshua Hartshorne', 'Carmen Muñoz', 'Ellen Bialystok', 'Thomas Bak'];
const WORDS = ['advantages', 'rules', 'accent', 'healthy', 'motivation', 'vocabulary', 'teachers', 'problems'];
const YNNG = (a, b) => `Questions ${a} to ${b}. Do the following statements agree with the views of the writer in the passage? Choose YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.`;
const yn = (content, answer, explanation, ev = []) => ({ type: 'MULTIPLE_CHOICE', content, options: ['YES', 'NO', 'NOT GIVEN'], answer: { YES: 'A', NO: 'B', 'NOT GIVEN': 'C' }[answer], explanation, ev });

const READING = {
  code: 'EX3-R', testType: 'READING', title: 'Final Exam · Part 2 of 3 · Reading', timeLimitMin: 60, difficulty: 4, topic: 'Final Exam',
  instructions: 'Final Exam, Part 2 of 3: Reading. Three passages and 40 questions, 60 minutes. Spend about 20 minutes on each passage. Answers must be spelled correctly. When the time is up, your answers are sent and Writing starts after a short countdown.',
  passages: [
    { title: 'The noodle that went around the world', text: P1, groups: [
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(1, 6), questions: [
        tf('Ando had a team of scientists to help him.', 'FALSE', 'He worked "with little money and no team of scientists".', ['With little money and no team of scientists']),
        tf('Ando worked on his idea for about a year before he found a solution.', 'TRUE', '"For a whole year, Ando struggled..." before the breakthrough.', ['For a whole year, Ando struggled to find a way to dry cooked noodles']),
        tf("Ando's wife helped him to design the packet for Chicken Ramen.", 'NOT GIVEN', 'His wife is mentioned only because he watched her make tempura. Nothing about the packet.'),
        tf('When it first went on sale, Chicken Ramen was more expensive than fresh noodles.', 'TRUE', '"it cost more than a portion of fresh noodles".', ['it cost more than a portion of fresh noodles']),
        tf('Ando got the idea for Cup Noodles in a Japanese supermarket.', 'FALSE', 'The idea came "after a visit to the United States in 1966".', ['The second big step came after a visit to the United States in 1966']),
        tf('China eats more instant noodles per person than any other country.', 'FALSE', 'China eats the most "in total", but per person "South Korea is at the top of the list".', ['South Korea is at the top of the list']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: 'Questions 7 to 13. Complete the notes below. Choose ONE WORD AND/OR A NUMBER from the passage for each answer.', wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
        sc('After the war, Ando saw long ________ of hungry people outside noodle stalls.', 'QUEUES', '"long queues of hungry people".', ['Ando often saw long queues of hungry people']),
        sc('He invented the noodles in a small ________ behind his house.', 'SHED', '"working alone in a small shed behind his house".', ['working alone in a small shed behind his house']),
        sc('His idea came from watching his wife make ________.', 'TEMPURA', '"he watched his wife making tempura".', ['he watched his wife making tempura']),
        sc('Hot water fills the tiny ________ in the fried noodles.', 'HOLES', '"When hot water was poured over the fried noodles, it filled the holes".', ['it filled the holes']),
        sc('Cup Noodles first went on sale in ________.', '1971', '"Cup Noodles went on sale in 1971." (1958 was Chicken Ramen; 1966 was the visit to the USA.)', ['Cup Noodles went on sale in 1971']),
        sc('Noodles for space were made in small ________.', 'BALLS', '"The noodles were made in small balls so that they would not float away".', ['The noodles were made in small balls']),
        sc('Experts suggest adding vegetables or an ________ to make the meal healthier.', 'EGG', '"adding vegetables or an egg".', ['They suggest adding vegetables or an egg']),
      ] },
    ] },
    { title: 'Is it time for a four-day week?', text: P2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: HEAD(14, 19), questions: [
        mc('Paragraph A', HEADINGS, 'F', 'Paragraph A explains how the five-day week started (Henry Ford, the twentieth century).', ['It became common only in the twentieth century']),
        mc('Paragraph B', HEADINGS, 'E', 'Iceland, 2015 to 2019: people working for the city and the government (the public sector).', ['around 2,500 people working for the city of Reykjavik and the national government took part in trials']),
        mc('Paragraph C', HEADINGS, 'B', 'The UK trial had 61 companies "from banks to restaurants".', ['Sixty-one companies, from banks to restaurants']),
        mc('Paragraph D', HEADINGS, 'D', 'Companies "changed the way they worked": fewer meetings, "focus time".', ['Many companies in the trials changed the way they worked']),
        mc('Paragraph E', HEADINGS, 'C', '"the idea is not easy for every workplace": hospitals, schools and shops.', ['the idea is not easy for every workplace']),
        mc('Paragraph F', HEADINGS, 'A', 'Belgium "passed a law that gives workers the right to ask".', ['Belgium passed a law that gives workers the right to ask']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(20, 23), questions: [
        mc('What happened to workers\' pay in the Iceland trials?', ['It was cut by 20 percent', 'It stayed the same', 'It increased slightly', 'It depended on the workplace'], 'B', '"their pay stayed the same".', ['but their pay stayed the same']),
        mc('How many UK companies decided to continue with a shorter week after the trial?', ['18', '56', '61', '2,900'], 'B', '"56 of the companies decided to continue". (18 made it permanent; 61 took part; 2,900 is the number of employees.)', ['56 of the companies decided to continue with a shorter week']),
        mc('In the 100-80-100 model, what does "80" refer to?', ['The percentage of pay', 'The percentage of time', 'The percentage of work', 'The number of companies'], 'B', '"100 percent of their pay for 80 percent of the time".', ['100 percent of their pay for 80 percent of the time']),
        mc('Why did some companies stop the trial early?', ['Customers complained', 'Staff felt more pressure', 'Income fell sharply', 'The government stopped it'], 'B', '"workers also said they felt more pressure... A few companies stopped the trial early for this reason."', ['A few companies stopped the trial early for this reason']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SC(24, 26, 'ONE WORD ONLY'), wordLimit: 'ONE WORD ONLY', questions: [
        sc('In the UK trial, staff took fewer ________ days.', 'SICK', '"staff took fewer sick days".', ['staff took fewer sick days']),
        sc('Many companies held fewer and shorter ________.', 'MEETINGS', '"They held fewer meetings and made them shorter".', ['They held fewer meetings and made them shorter']),
        sc('In Belgium, workers can ask to work their full hours in four ________ days.', 'LONGER', '"work their full hours in four longer days".', ['work their full hours in four longer days instead of five']),
      ] },
    ] },
    { title: 'Is it ever too late to learn a language?', text: P3, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: YNNG(27, 31), questions: [
        yn('The belief that children learn languages more easily is completely wrong.', 'NO', 'The writer says "There is some truth in this belief", so it is not completely wrong.', ['There is some truth in this belief']),
        yn('Adults who start learning a language cannot become good speakers.', 'NO', '"this does not mean that adults cannot learn a language well" and "can reach a high level at any age".', ['this does not mean that adults cannot learn a language well']),
        yn('Most adults give up their language classes within the first year.', 'NOT GIVEN', 'The writer never says how many adults give up classes.'),
        yn('A foreign accent is not a serious problem if people can understand you.', 'YES', '"this is not a serious problem... as long as other people can understand what we say".', ['In my view, however, this is not a serious problem']),
        yn('Schools should start teaching foreign languages at a younger age.', 'NOT GIVEN', 'Ages are discussed, but the writer gives no view on what schools should do.'),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 32 to 35. Match each statement with the correct researcher, A to E. There is one more researcher than you need.', questions: [
        mc('The amount and quality of practice matter more than the age when a learner starts.', PEOPLE, 'C', 'Muñoz "concluded that the amount and quality of practice matter more than the age".', ['the amount and quality of practice matter more than the age at which a learner starts']),
        mc('Using two languages all your life may delay memory loss.', PEOPLE, 'D', 'Bialystok: people who used two languages "showed signs of memory loss about four years later".', ['showed signs of memory loss about four years later']),
        mc('There is a time in childhood when the brain is especially ready to learn language.', PEOPLE, 'A', 'Lenneberg\'s "critical period" in childhood.', ['when the brain is especially ready to learn language naturally']),
        mc('The ability to learn grammar stays strong until the late teenage years.', PEOPLE, 'B', 'Hartshorne\'s team: "the ability to learn grammar stays strong until the late teenage years".', ['the ability to learn grammar stays strong until the late teenage years']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 36 to 40. Complete the summary using the list of words, A to H. Write the correct letter. Summary: Adults have some (36) ________ over children when they learn a language. They have better ways of remembering words, and they can understand grammar (37) ________ when someone explains them. For most adults, the most difficult thing is their (38) ________, but this does not stop them from communicating. Learning a language as an adult may also help to keep the brain (39) ________. The writer believes that (40) ________ is the most important factor of all.', questions: [
        mc('Gap 36', WORDS, 'A', '"adults have several advantages over children".', ['adults have several advantages over children']),
        mc('Gap 37', WORDS, 'B', '"they can understand grammar rules when these are explained".', ['they can understand grammar rules when these are explained']),
        mc('Gap 38', WORDS, 'C', 'The hardest thing is pronunciation: adults "usually keep an accent".', ['usually keep an accent from their first language']),
        mc('Gap 39', WORDS, 'D', '"helps to keep the brain healthy".', ['helps to keep the brain healthy']),
        mc('Gap 40', WORDS, 'E', '"What matters most is motivation".', ['What matters most is motivation']),
      ] },
    ] },
  ],
};

// Task 1: line graph, hours a week university students spent on four activities (drawn into public-media)
const GRAPH = {
  years: [2010, 2015, 2020, 2025],
  lines: {
    'Social media': [4, 9, 15, 17],
    'Studying alone': [12, 11, 8, 9],
    'Part-time work': [6, 7, 7, 10],
    'Sport and exercise': [5, 4, 3, 3],
  },
};

const WRITING = {
  code: 'EX3-W', testType: 'WRITING', title: 'Final Exam · Part 3 of 3 · Writing', timeLimitMin: 60, difficulty: 4, topic: 'Final Exam',
  instructions: 'Final Exam, Part 3 of 3: Writing. Two tasks, 60 minutes. Task 1: about 20 minutes, at least 150 words. Task 2: about 40 minutes, at least 250 words. Task 2 carries more marks. When the time is up, your writing is sent automatically.',
  tasks: [
    { taskNumber: 1, minWords: 150, timeMinutes: 20, chartImageUrl: '/media/ielts-exam3-line.png', chartDescription: 'Line graph: average hours per week that students at one university spent on social media, studying alone, part-time work, and sport and exercise, 2010 to 2025',
      prompt: 'The graph below shows the average number of hours per week that students at one university spent on four activities between 2010 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.' },
    { taskNumber: 2, minWords: 250, timeMinutes: 40,
      prompt: 'Some people believe it is better for young people to go to university in their own country. Others think that studying abroad is more valuable.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.' },
  ],
};

function checkExam3() {
  const errs = []; let n = 0;
  READING.passages.forEach(ps => ps.groups.forEach(g => g.questions.forEach(q => {
    n++;
    (q.ev || []).forEach(e => { if (!ps.text.includes(e)) errs.push(`R Q${n}: not in passage: ${e}`); });
    if (q.options && (!q.answer || q.answer.charCodeAt(0) - 65 >= q.options.length)) errs.push(`R Q${n}: bad answer`);
    if (q.type === 'TRUE_FALSE_NOT_GIVEN' && q.answer !== 'NOT GIVEN' && !(q.ev || []).length) errs.push(`R Q${n}: no evidence`);
  })));
  if (n !== 40) errs.push(`reading has ${n} questions, not 40`);
  return errs.concat(require('./examPaper3Listening').checkListening());
}

// Adds the Final Exam (all locked). The exam shows in the Exam tab only once every listening part has audio.
const AUDIO = { 1: 'ielts-exam3-listening-part1.mp3', 2: 'ielts-exam3-listening-part2.mp3', 3: 'ielts-exam3-listening-part3.mp3', 4: 'ielts-exam3-listening-part4.mp3' };
async function addExamPaper3(prisma) {
  const errs = checkExam3();
  if (errs.length) return { skipped: 'check failed', errors: errs.slice(0, 5) };
  const { LISTENING } = require('./examPaper3Listening');
  const { addIeltsPapers } = require('./kit');
  const out = { papers: await addIeltsPapers(prisma, [LISTENING, READING, WRITING], { status: 'EXAM_LOCKED' }) };
  for (const p of [LISTENING, READING, WRITING]) {
    await prisma.paper.updateMany({ where: { paperCode: p.code, testType: p.testType }, data: { title: p.title, instructions: p.instructions, timeLimitMin: p.timeLimitMin } });
  }
  const fs = require('fs'); const path = require('path');
  const lis = await prisma.paper.findFirst({ where: { paperCode: 'EX3-L', testType: 'LISTENING' }, include: { sections: true } });
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

module.exports = { READING, WRITING, GRAPH, checkExam3, addExamPaper3, AUDIO };
