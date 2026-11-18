// GE Reading 012 (GE-C12R), Part 2: one worker's story, from Sri Lanka to a Korean factory (questions 15 to 30).
// Part 1 ("A country running out of workers", questions 1 to 14) stays as it is.
// Used in two ways: hardPapers.js includes it when the paper is created from scratch, and
// upgradePaper12() adds it to the existing live paper (once) without touching Part 1.
// All content is original. `ev` lists the exact words in the text that give each answer.

const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const tf = (content, answer, explanation, ev) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });
const PARA = ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F'];

const TEXT = `[A] Six years ago, Kasun Perera was working in a small garage in Kurunegala, repairing motorbikes for about forty thousand rupees a month. Today he operates machines in a car parts factory near the city of Daegu, in the south-east of South Korea. "When I left Sri Lanka, I could only say hello and thank you in Korean," he says. "Now I explain the machines to new workers."

[B] Kasun's journey began in a Korean language class in Colombo. For eight months he studied every evening after work, often until midnight, because he knew that only applicants with good test scores would be chosen. He failed the test the first time by just a few points. "I was very disappointed," he remembers, "but my teacher told me that many people pass on their second try." Four months later, he passed with a much higher score.

[C] His first winter in Korea was the hardest part. He had never seen snow, and the temperature sometimes fell to minus ten degrees. The work was also tiring: he stood beside a machine for ten hours a day, and at first he did not understand the instructions his supervisor shouted across the noisy factory floor. In the evenings he felt lonely, and he called his mother almost every night.

[D] Things slowly became easier. A Korean colleague, Mr Park, began to teach him useful words during lunch breaks, and in return Kasun taught him how to cook a simple Sri Lankan curry. He also joined a cricket team of Sri Lankan and Nepali workers, which played every Sunday in a park near the factory. "Cricket made Korea feel like home," Kasun says.

[E] The money has changed his family's life. Every month, Kasun sends most of his salary home. His younger sister is now studying nursing at a private college, and his parents have added two rooms to their house. He saves the rest, because he has a clear plan: when he returns, he wants to open his own car repair business, using the skills he has learned in Korea.

[F] Kasun's advice to young Sri Lankans who want to follow him is simple. "Learn the language properly before you come, not after," he says. "Korean helps you at work, but it also helps you make friends and stay safe." He also warns that the first year is difficult for almost everyone. "Be patient. If you are honest and work hard, people will respect you."`;

const PART2 = {
  title: 'From a garage in Kurunegala to a factory in Korea',
  text: TEXT,
  groups: [
    { type: 'MULTIPLE_CHOICE', instruction: 'Questions 15 to 19. Which paragraph contains the following information? Choose the correct paragraph, A to F. You may use a letter more than once.', questions: [
      mc('An activity that helped Kasun feel at home', PARA, 'D', 'Paragraph D: "Cricket made Korea feel like home."', ['Cricket made Korea feel like home']),
      mc('How Kasun prepared for the language test', PARA, 'B', 'Paragraph B: he "studied every evening after work, often until midnight".', ['For eight months he studied every evening after work, often until midnight']),
      mc('A description of difficult weather', PARA, 'C', 'Paragraph C: "He had never seen snow, and the temperature sometimes fell to minus ten degrees."', ['the temperature sometimes fell to minus ten degrees']),
      mc('Kasun\'s job before he went to Korea', PARA, 'A', 'Paragraph A: he was "repairing motorbikes" in a small garage.', ['working in a small garage in Kurunegala, repairing motorbikes']),
      mc('A warning about the first year', PARA, 'F', 'Paragraph F: "the first year is difficult for almost everyone".', ['the first year is difficult for almost everyone']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: 'Questions 20 to 24. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questions: [
      tf('Kasun passed the Korean language test the first time he took it.', 'FALSE', '"He failed the test the first time by just a few points."', ['He failed the test the first time by just a few points']),
      tf('The factory where Kasun works makes car parts.', 'TRUE', '"he operates machines in a car parts factory"', ['he operates machines in a car parts factory']),
      tf('Kasun earns more than most Korean workers in his factory.', 'NOT GIVEN', 'The text says he sends most of his salary home, but it does not compare his pay with Korean workers.', []),
      tf('At first, Kasun found it hard to understand his supervisor.', 'TRUE', '"at first he did not understand the instructions his supervisor shouted"', ['at first he did not understand the instructions his supervisor shouted across the noisy factory floor']),
      tf('Kasun spends most of his salary in Korea.', 'FALSE', 'He "sends most of his salary home".', ['Kasun sends most of his salary home']),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: 'Questions 25 to 27. Choose the correct letter, A, B, C or D.', questions: [
      mc('What did Kasun teach Mr Park?', ['Some Sri Lankan words', 'How to play cricket', 'How to cook a Sri Lankan curry', 'How to use the machines'], 'C', '"Kasun taught him how to cook a simple Sri Lankan curry"', ['Kasun taught him how to cook a simple Sri Lankan curry']),
      mc('How has the money Kasun sends home helped his family?', ['His parents bought a new car', 'His sister is studying nursing', 'His brother started a business', 'His parents moved to Colombo'], 'B', '"His younger sister is now studying nursing at a private college"', ['His younger sister is now studying nursing at a private college']),
      mc('According to Kasun, why is it important to learn Korean before you go?', ['It helps at work, with friends and with safety', 'It is the only way to get a high salary', 'Korean companies teach no language classes', 'You cannot travel in Korea without it'], 'A', '"Korean helps you at work, but it also helps you make friends and stay safe."', ['Korean helps you at work, but it also helps you make friends and stay safe']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: 'Questions 28 to 30. Complete the sentences. Write ONE WORD from the text for each answer.', wordLimit: 'ONE WORD', questions: [
      sc('In the evenings of his first winter, Kasun felt ________.', 'LONELY', '"In the evenings he felt lonely"', ['In the evenings he felt lonely']),
      sc('Kasun\'s parents have added two ________ to their house.', 'ROOMS', '"his parents have added two rooms to their house"', ['his parents have added two rooms to their house']),
      sc('Kasun says that if you are honest and work hard, people will ________ you.', 'RESPECT', '"people will respect you"', ['people will respect you']),
    ] },
  ],
};

const NEW_TIME = 50;
const NEW_INSTRUCTIONS = 'Two texts and 30 questions. Part 1: questions 1 to 14. Part 2: questions 15 to 30. Read each text, then answer the questions.';

// Adds Part 2 to the live GE Reading 012 once. Safe to run on every start.
async function upgradePaper12(prisma) {
  const paper = await prisma.paper.findFirst({ where: { paperCode: 'GE-C12R', testType: 'READING' }, include: { passages: { select: { passageNumber: true } } } });
  if (!paper) return { skipped: 'paper not found' };
  if (paper.passages.some(p => p.passageNumber === 2)) return { skipped: 'already has part 2' };
  const last = await prisma.question.findFirst({ where: { paperId: paper.id }, orderBy: { questionNumber: 'desc' }, select: { questionNumber: true, order: true } });
  let qn = last?.questionNumber || 0; let ord = last?.order || qn;
  await prisma.$transaction(async tx => {
    const passage = await tx.passage.create({ data: { paperId: paper.id, passageNumber: 2, title: PART2.title, text: PART2.text } });
    for (const [gi, g] of PART2.groups.entries()) {
      const group = await tx.questionGroup.create({ data: { passageId: passage.id, groupType: g.type, instruction: g.instruction, wordLimit: g.wordLimit || null, order: gi } });
      for (const q of g.questions) {
        await tx.question.create({
          data: {
            paperId: paper.id, groupId: group.id, passageNumber: 2, questionNumber: ++qn, order: ++ord, questionType: q.type, content: q.content,
            ...(q.options ? { options: q.options.map((o, k) => `${'ABCDEFGH'[k]}. ${o}`) } : {}),
            correctAnswer: q.answer, explanation: q.explanation || null,
            ...(q.ev && q.ev.length ? { evidence: q.ev.join('|') } : {}),
          },
        });
      }
    }
    await tx.paper.update({ where: { id: paper.id }, data: { timeLimitMin: NEW_TIME, instructions: NEW_INSTRUCTIONS } });
  }, { timeout: 60000, maxWait: 20000 });
  return { added: qn - (last?.questionNumber || 0), from: (last?.questionNumber || 0) + 1, to: qn };
}

module.exports = { PART2, NEW_TIME, NEW_INSTRUCTIONS, upgradePaper12 };
