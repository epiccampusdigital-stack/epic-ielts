// IELTS Reading (Academic style), mid-easy: 3 passages, 40 questions, 60 minutes.
// Passage 1: sleep. Passage 2: trees in cities. Passage 3: learning from failure.
// All content is original. `ev` lists the exact words in the text that give each answer.

const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const tf = (content, answer, explanation, ev) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });
const TF = (a, b) => `Questions ${a} to ${b}. Do the following statements agree with the information in the passage? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.`;
const MC = (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B, C or D.`;
const SC = (a, b) => `Questions ${a} to ${b}. Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.`;
const PARA = ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F'];

// ───────────── PASSAGE 1 ─────────────
const P1 = `[A] For a long time, sleep was seen as wasted time. Busy people were proud of sleeping only five hours a night, and many believed that the body simply "switched off" until morning. Today, scientists know that this is far from the truth. Sleep is an active process, and it is essential for both the body and the brain.

[B] While we sleep, the body is busy repairing itself. Muscles recover after exercise, and the immune system, which protects us from illness, becomes stronger. In one study, people who slept fewer than six hours a night were four times more likely to catch a cold than people who slept seven hours or more. Sleep also controls the hormones that tell us when we are hungry, which may explain why tired people often eat more sugary food.

[C] The brain is also working hard at night. During sleep, it sorts the information collected during the day and stores the important parts as long-term memories. This is why students who sleep well after studying usually remember more than those who stay up late. Scientists have also discovered that the brain uses sleep to clean itself. A special system washes away waste products that build up while we are awake.

[D] Most adults need between seven and nine hours of sleep each night, while teenagers need even more. However, surveys suggest that around one third of adults regularly sleep less than they should. The effects of being sleep-deprived are serious. Tired people find it harder to concentrate, make more mistakes and feel more stressed. Driving after a night without sleep can be as dangerous as driving after drinking alcohol.

[E] Modern life is one of the main reasons people do not get enough rest. Phones, computers and televisions give off blue light, which tells the brain that it is still daytime. As a result, the body produces less melatonin, the hormone that makes us feel sleepy. Long working hours, noisy streets and drinks containing caffeine, such as coffee and tea, can also keep people awake.

[F] The good news is that small changes can make a big difference. Experts recommend going to bed and getting up at the same time every day, even at weekends. A regular routine helps the body's natural clock. They also suggest keeping the bedroom cool, dark and quiet, and putting phones away at least an hour before bed. As one sleep doctor says, "Sleep is not a luxury. It is the cheapest medicine there is."`;

const passage1 = {
  title: 'Why we need sleep',
  text: P1,
  groups: [
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(1, 6), questions: [
      tf('In the past, many people thought that sleep was a waste of time.', 'TRUE', 'Paragraph A: "For a long time, sleep was seen as wasted time."', ['For a long time, sleep was seen as wasted time']),
      tf('People who sleep less than six hours are more likely to catch a cold.', 'TRUE', 'Paragraph B: they "were four times more likely to catch a cold".', ['were four times more likely to catch a cold']),
      tf('Tired people usually choose healthy food.', 'FALSE', 'Paragraph B says tired people "often eat more sugary food".', ['tired people often eat more sugary food']),
      tf('Teenagers need less sleep than adults.', 'FALSE', 'Paragraph D: "teenagers need even more".', ['while teenagers need even more']),
      tf('Women generally sleep longer than men.', 'NOT GIVEN', 'The passage does not compare men and women.', []),
      tf('Experts say people should get up at the same time at weekends too.', 'TRUE', 'Paragraph F: "at the same time every day, even at weekends".', ['going to bed and getting up at the same time every day, even at weekends']),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(7, 9), questions: [
      mc('What does the brain do with information during sleep?', ['It deletes most of it', 'It stores the important parts as memories', 'It sends it to the muscles', 'It turns it into dreams'], 'B', 'Paragraph C: the brain "stores the important parts as long-term memories".', ['stores the important parts as long-term memories']),
      mc('About how many adults regularly do not get enough sleep?', ['One in ten', 'One in five', 'One in three', 'One in two'], 'C', 'Paragraph D: "around one third of adults regularly sleep less than they should".', ['around one third of adults regularly sleep less than they should']),
      mc('Why does blue light from phones make it harder to sleep?', ['It hurts the eyes', 'It makes the room too warm', 'It tells the brain that it is still daytime', 'It is very noisy'], 'C', 'Paragraph E: blue light "tells the brain that it is still daytime".', ['which tells the brain that it is still daytime']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(10, 13), wordLimit: 'ONE WORD ONLY', questions: [
      sc('While we sleep, muscles ________ after exercise.', 'RECOVER', 'Paragraph B: "Muscles recover after exercise".', ['Muscles recover after exercise']),
      sc('At night, a special system washes away ________ products from the brain.', 'WASTE', 'Paragraph C: "washes away waste products".', ['A special system washes away waste products']),
      sc('The hormone that makes us feel sleepy is called ________.', 'MELATONIN', 'Paragraph E: "melatonin, the hormone that makes us feel sleepy".', ['melatonin, the hormone that makes us feel sleepy']),
      sc('A regular ________ helps the body\'s natural clock.', 'ROUTINE', 'Paragraph F: "A regular routine helps the body\'s natural clock."', ["A regular routine helps the body's natural clock"]),
    ] },
  ],
};

// ───────────── PASSAGE 2 ─────────────
const P2 = `[A] In cities around the world, local governments are planting millions of new trees. Melbourne in Australia plans to cover 40% of the city with trees by 2040, and Paris has promised to plant 170,000 more. For many years, trees in cities were seen mainly as decoration. Now, they are increasingly treated as an important part of a city's infrastructure, just like roads, pipes and power lines.

[B] One of the main reasons for planting trees is heat. Cities are usually warmer than the countryside around them, because concrete and asphalt absorb heat during the day and release it at night. This is known as the "urban heat island" effect. Trees help in two ways. Their leaves provide shade, and they also release water into the air, which cools the surrounding area. Studies show that streets with plenty of trees can be up to 5°C cooler on a hot summer afternoon.

[C] Trees also improve the quality of the air. Their leaves trap dust and absorb some harmful gases produced by traffic. In addition, trees reduce the risk of flooding. When heavy rain falls on roads and roofs, the water runs quickly into drains, which can overflow. Tree roots, however, help the soil absorb water, so less of it reaches the drains at the same time.

[D] There are benefits for people's health and wellbeing too. Researchers have found that people who live near green spaces report feeling less stressed and are more likely to walk or exercise outside. In one well-known study, hospital patients whose windows looked out onto trees recovered more quickly and needed less medicine than patients who could only see a brick wall. Trees may even help communities: streets with more greenery are often places where neighbours stop and talk.

[E] However, planting trees in cities is not as simple as it sounds. Young trees need regular watering and care for their first few years, and many die because nobody looks after them. Choosing the right type of tree is also important. Some species grow too large for narrow streets, while others drop fruit that makes pavements dangerously slippery. Tree roots can also damage pipes and lift the surface of footpaths.

[F] For these reasons, experts say that cities should plan carefully. Instead of simply counting how many trees they plant, they should measure how many survive and grow. Some cities now involve local residents, who agree to water the trees outside their homes. Others use online maps where people can see every tree in the city and report problems. As one city planner explains, "Planting a tree takes an hour. Looking after it takes years."`;

const passage2 = {
  title: 'Green cities: why trees matter',
  text: P2,
  groups: [
    { type: 'MULTIPLE_CHOICE', instruction: 'Questions 14 to 18. The passage has six paragraphs, A to F. Which paragraph contains the following information? Choose the correct paragraph, A to F.', questions: [
      mc('Problems that tree roots can cause', PARA, 'E', 'Paragraph E: "Tree roots can also damage pipes and lift the surface of footpaths."', ['Tree roots can also damage pipes and lift the surface of footpaths']),
      mc('An explanation of why cities are hotter than the countryside', PARA, 'B', 'Paragraph B describes the "urban heat island" effect.', ['This is known as the "urban heat island" effect']),
      mc('A study of hospital patients', PARA, 'D', 'Paragraph D: "hospital patients whose windows looked out onto trees recovered more quickly".', ['hospital patients whose windows looked out onto trees recovered more quickly']),
      mc('Examples of cities with big tree-planting plans', PARA, 'A', 'Paragraph A: Melbourne and Paris.', ['Melbourne in Australia plans to cover 40% of the city with trees by 2040']),
      mc('A way that local people can help look after trees', PARA, 'F', 'Paragraph F: residents "agree to water the trees outside their homes".', ['Some cities now involve local residents, who agree to water the trees outside their homes']),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(19, 22), questions: [
      mc('How much cooler can streets with many trees be on a hot afternoon?', ['Up to 2°C', 'Up to 5°C', 'Up to 10°C', 'Up to 40°C'], 'B', 'Paragraph B: "up to 5°C cooler".', ['can be up to 5°C cooler on a hot summer afternoon']),
      mc('How do trees reduce the risk of flooding?', ['They block the drains', 'Their roots help the soil absorb water', 'They stop rain from falling', 'They make roads wider'], 'B', 'Paragraph C: "Tree roots, however, help the soil absorb water".', ['Tree roots, however, help the soil absorb water']),
      mc('According to the passage, people who live near green spaces', ['earn more money.', 'feel less stressed.', 'sleep for longer.', 'move house less often.'], 'B', 'Paragraph D: they "report feeling less stressed".', ['report feeling less stressed']),
      mc('What do experts say cities should measure?', ['How much the trees cost', 'How tall the trees are', 'How many trees survive and grow', 'How many people like trees'], 'C', 'Paragraph F: "they should measure how many survive and grow".', ['they should measure how many survive and grow']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(23, 26), wordLimit: 'ONE WORD ONLY', questions: [
      sc('Today, trees are seen as part of a city\'s ________, like roads and pipes.', 'INFRASTRUCTURE', 'Paragraph A: "an important part of a city\'s infrastructure".', ["an important part of a city's infrastructure"]),
      sc('The leaves of trees provide ________, which keeps streets cooler.', 'SHADE', 'Paragraph B: "Their leaves provide shade".', ['Their leaves provide shade']),
      sc('Tree leaves can trap ________ and absorb harmful gases.', 'DUST', 'Paragraph C: "Their leaves trap dust".', ['Their leaves trap dust']),
      sc('Some trees drop fruit that makes pavements ________.', 'SLIPPERY', 'Paragraph E: "makes pavements dangerously slippery".', ['drop fruit that makes pavements dangerously slippery']),
    ] },
  ],
};

// ───────────── PASSAGE 3 ─────────────
const P3 = `[A] Most of us are taught from an early age that failure is something to avoid. At school, a wrong answer means losing marks, and at work, a mistake can lead to criticism. As a result, many people become afraid of failing and prefer to stay with tasks they already know they can do. Yet a growing number of psychologists argue that failure, when it is handled well, is one of the most powerful ways to learn.

[B] Much of this research is based on the work of the American psychologist Carol Dweck. She found that people tend to have one of two attitudes towards their abilities. People with a "fixed mindset" believe that intelligence and talent cannot change: you are either good at something or you are not. People with a "growth mindset", on the other hand, believe that abilities can be developed through effort and practice. For them, a setback is not proof that they are not clever enough, but a sign that they need to try a different approach.

[C] These attitudes can affect how people behave. In one experiment, children were given a set of puzzles. Some were praised for being "smart", while others were praised for "working hard". When they were later offered a choice between an easy puzzle and a difficult one, most of the children praised for intelligence chose the easy option. In contrast, the majority of those praised for effort chose the more challenging puzzle, and they also enjoyed it more.

[D] The business world has also started to value failure. Many successful companies encourage their employees to experiment, knowing that most new ideas will not work. Some technology firms even hold meetings where teams share their mistakes so that others can avoid repeating them. The inventor of the bagless vacuum cleaner, James Dyson, famously built more than 5,000 prototypes before he produced one that worked. He later said that each failed version taught him something new.

[E] However, experts are careful to point out that failure on its own does not lead to success. What matters is what people do next. Learning from a mistake involves three steps: accepting that something went wrong, understanding why it happened, and changing the way you do things. Feedback from teachers, colleagues or friends can be extremely useful at this stage, as other people often notice problems that we cannot see ourselves.

[F] So how can we become more comfortable with failure? Psychologists suggest a few simple habits. One is to replace the words "I can't do this" with "I can't do this yet". Another is to set goals that are slightly too difficult, so that progress requires effort. Finally, it helps to remember that almost every expert was once a beginner. As the saying goes, "The master has failed more times than the beginner has even tried." Persistence, rather than talent alone, is often the real key to achievement.`;

const passage3 = {
  title: 'Learning from failure',
  text: P3,
  groups: [
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(27, 31), questions: [
      tf('Many people prefer to do tasks they already know they can do.', 'TRUE', 'Paragraph A: they "prefer to stay with tasks they already know they can do".', ['prefer to stay with tasks they already know they can do']),
      tf('People with a fixed mindset believe that abilities can be developed.', 'FALSE', 'Paragraph B: people with a fixed mindset "believe that intelligence and talent cannot change".', ['believe that intelligence and talent cannot change']),
      tf('Carol Dweck first studied mindsets in Japanese schools.', 'NOT GIVEN', 'The passage does not say where Dweck did her research.', []),
      tf('Children praised for effort enjoyed the difficult puzzle more.', 'TRUE', 'Paragraph C: they "chose the more challenging puzzle, and they also enjoyed it more".', ['chose the more challenging puzzle, and they also enjoyed it more']),
      tf('James Dyson gave up after his first few prototypes failed.', 'FALSE', 'Paragraph D: he "built more than 5,000 prototypes before he produced one that worked".', ['built more than 5,000 prototypes before he produced one that worked']),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(32, 35), questions: [
      mc('For people with a growth mindset, a setback is', ['proof that they are not clever.', 'a reason to give up.', 'a sign to try a different approach.', 'something to hide from others.'], 'C', 'Paragraph B: "a sign that they need to try a different approach".', ['a sign that they need to try a different approach']),
      mc('Most children who were praised for being "smart"', ['chose the easy puzzle.', 'chose the difficult puzzle.', 'refused to choose.', 'asked for help.'], 'A', 'Paragraph C: "most of the children praised for intelligence chose the easy option".', ['most of the children praised for intelligence chose the easy option']),
      mc('Why do some technology firms hold meetings about mistakes?', ['To punish their staff', 'So that others can avoid repeating them', 'To choose a new manager', 'To save money on research'], 'B', 'Paragraph D: "so that others can avoid repeating them".', ['teams share their mistakes so that others can avoid repeating them']),
      mc('According to the writer, what is often the real key to achievement?', ['Talent', 'Luck', 'Money', 'Persistence'], 'D', 'Paragraph F: "Persistence, rather than talent alone, is often the real key to achievement."', ['Persistence, rather than talent alone, is often the real key to achievement']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(36, 40), wordLimit: 'ONE WORD ONLY', questions: [
      sc('At work, a mistake can lead to ________.', 'CRITICISM', 'Paragraph A: "a mistake can lead to criticism".', ['a mistake can lead to criticism']),
      sc('People with a growth mindset believe abilities improve through effort and ________.', 'PRACTICE', 'Paragraph B: "through effort and practice".', ['abilities can be developed through effort and practice']),
      sc('Many companies encourage employees to ________, knowing most new ideas will not work.', 'EXPERIMENT', 'Paragraph D: "encourage their employees to experiment".', ['encourage their employees to experiment']),
      sc('________ from teachers, colleagues or friends can help us learn from mistakes.', 'FEEDBACK', 'Paragraph E: "Feedback from teachers, colleagues or friends can be extremely useful".', ['Feedback from teachers, colleagues or friends can be extremely useful']),
      sc('Psychologists suggest adding the word "________" to "I can\'t do this".', 'YET', 'Paragraph F: "I can\'t do this yet".', ["I can't do this yet"]),
    ] },
  ],
};

const PAPER = {
  code: 'IR-SLEEP-TREES', testType: 'READING', title: 'IELTS Reading (new)', timeLimitMin: 60, difficulty: 2, topic: 'Health, environment and psychology',
  instructions: 'Three passages and 40 questions. Passage 1: questions 1 to 13. Passage 2: questions 14 to 26. Passage 3: questions 27 to 40. You have 60 minutes.',
  passages: [passage1, passage2, passage3],
};

// Key words for the lesson and the teacher guide
const KEY_WORDS = {
  1: ['essential', 'recover', 'immune system', 'long-term memory', 'sleep-deprived', 'concentrate', 'routine', 'luxury'],
  2: ['infrastructure', 'absorb', 'release', 'shade', 'reduce', 'wellbeing', 'species', 'residents'],
  3: ['criticism', 'attitude', 'mindset', 'setback', 'approach', 'experiment', 'feedback', 'persistence'],
};

// Adds the paper once (by code). Safe to run on every start; never rebuilds a paper students have taken.
async function addSleepTreesReading(prisma) {
  const have = await prisma.paper.findFirst({ where: { paperCode: PAPER.code, testType: 'READING' }, select: { id: true } });
  if (have) return { skipped: 'already there' };
  const { seedPaperList } = require('../generalEnglish/placement');
  const last = await prisma.paper.findFirst({ where: { track: 'IELTS', testType: 'READING' }, orderBy: { order: 'desc' }, select: { order: true } });
  const n = await seedPaperList(prisma, [PAPER], (last?.order || 0) + 1, { track: 'IELTS' });
  return { added: n };
}

module.exports = { PAPER, KEY_WORDS, addSleepTreesReading };
