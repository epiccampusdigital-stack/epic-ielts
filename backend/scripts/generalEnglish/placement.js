// General English placement test: four papers, graded from A1 to B1.
// Taken on Day 1 of a programme to group students. Every part is scored out of 100 with a level.

const mc = (content, options, answer, explanation) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation });
const tf = (content, answer, explanation) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation });

// ── 1. Grammar, vocabulary and reading (READING engine, auto-marked) ──
const grammar = [
  mc('She ___ a student.', ['am', 'is', 'are', 'be'], 'B', 'He / she / it takes "is".'),
  mc('They ___ from Kandy.', ['is', 'am', 'are', 'be'], 'C', 'We / you / they take "are".'),
  mc('___ you like tea?', ['Do', 'Does', 'Are', 'Is'], 'A', 'Present simple questions with "you" use "do".'),
  mc('He ___ to work every day.', ['go', 'goes', 'going', 'is go'], 'B', 'He / she / it: add -es to "go".'),
  mc('There ___ two banks in my town.', ['is', 'are', 'be', 'has'], 'B', 'Plural: "there are".'),
  mc('Be quiet, please. I ___ TV right now.', ['watch', 'am watching', 'watches', 'watched'], 'B', '"Right now" needs the present continuous.'),
  mc('My sister is ___ than me.', ['tall', 'taller', 'tallest', 'more tall'], 'B', 'Short adjective comparative: tall → taller.'),
  mc('We ___ in Galle last year.', ['live', 'lives', 'lived', 'are living'], 'C', '"Last year" needs the past simple.'),
  mc('"___ did you go yesterday?" "To the market."', ['What', 'Where', 'Who', 'Which'], 'B', 'The answer is a place, so "Where".'),
  mc('I have ___ apple and a banana.', ['a', 'an', 'the', 'some'], 'B', '"An" before a vowel sound.'),
  mc('She can ___ English very well.', ['speak', 'speaks', 'speaking', 'to speak'], 'A', 'After "can" use the base verb.'),
  mc('How ___ water do you drink every day?', ['many', 'much', 'long', 'often'], 'B', 'Water is uncountable: "how much".'),
  mc("I'm going ___ visit my grandmother tomorrow.", ['to', 'for', 'at', 'on'], 'A', '"Be going to" + verb.'),
  mc("He didn't ___ to the party.", ['come', 'came', 'comes', 'coming'], 'A', 'After "didn\'t" use the base verb.'),
  mc('This is the ___ book I have ever read.', ['good', 'better', 'best', 'most good'], 'C', 'Superlative of "good" is "the best".'),
  mc('Have you ever ___ to Korea?', ['go', 'went', 'been', 'going'], 'C', '"Have you ever been…" for experiences.'),
  mc('If it rains tomorrow, we ___ at home.', ['stay', 'will stay', 'stayed', 'would stay'], 'B', 'First conditional: if + present, will + verb.'),
  mc("You ___ smoke here. It's not allowed.", ["mustn't", "don't have to", 'needn\'t', 'can'], 'A', '"Not allowed" means "mustn\'t".'),
  mc('The letter ___ yesterday.', ['sent', 'was sent', 'is sending', 'has send'], 'B', 'Past passive: was + past participle.'),
  mc("I've lived here ___ 2019.", ['for', 'since', 'from', 'ago'], 'B', '"Since" with a point in time.'),
];

const vocabulary = [
  mc("My mother's brother is my ___.", ['cousin', 'uncle', 'nephew', 'grandfather'], 'B', 'Your parent\'s brother is your uncle.'),
  mc('You buy medicine at a ___.', ['bakery', 'pharmacy', 'library', 'post office'], 'B', 'Medicine is sold at a pharmacy.'),
  mc('The opposite of "cheap" is ___.', ['expensive', 'easy', 'small', 'early'], 'A', 'Cheap ↔ expensive.'),
  mc('I usually ___ a shower in the morning.', ['do', 'make', 'have', 'go'], 'C', 'We say "have a shower".'),
  mc('A person who flies a plane is a ___.', ['driver', 'pilot', 'sailor', 'engineer'], 'B', 'A pilot flies planes.'),
  mc('Please ___ your name at the top of the page.', ['write', 'say', 'tell', 'speak'], 'A', 'You write your name on paper.'),
  mc("It's very cold. Put on your ___.", ['sunglasses', 'jacket', 'sandals', 'shorts'], 'B', 'A jacket keeps you warm.'),
  mc("I was ___ because I didn't sleep last night.", ['tired', 'tiring', 'boring', 'excited'], 'A', '-ed adjectives describe how you feel.'),
  mc('The train was late, so we ___ the meeting.', ['lost', 'missed', 'forgot', 'left'], 'B', 'You "miss" an event when you are late.'),
  mc('She is very ___. She always helps other people.', ['lazy', 'kind', 'rude', 'shy'], 'B', 'Helping others is kind.'),
];

const READING_TEXT = `Kasun is twenty years old and comes from Matara, a city on the south coast of Sri Lanka. Last year he won a partial scholarship to study engineering at a university in Daejeon, South Korea. Before he left, he studied Korean for six months, but when he arrived he found that people spoke much faster than his teachers in Sri Lanka.

For the first semester, Kasun took a Korean language course every morning and had engineering classes in the afternoon. The scholarship paid half of his tuition fees, so he found a part-time job in a café near the university. He worked there three evenings a week. At first he was very nervous when customers spoke to him, but after two months he could take orders without any problems.

Kasun lives in a university dormitory with a student from Mongolia. They speak Korean to each other because it is the only language they share. "It was difficult at the beginning," Kasun says, "but now my Korean is much better because I have to use it every day."

In winter the temperature in Daejeon sometimes falls below zero. Kasun had never seen snow before, and he says the first snowfall was one of the best days of his life. Next year he hopes to apply for a full scholarship.`;

const readingTf = [
  tf("Kasun's home town is on the coast.", 'TRUE', 'Matara is "a city on the south coast".'),
  tf('Kasun studied Korean for a year before he went to Korea.', 'FALSE', 'He studied Korean for six months.'),
  tf("Kasun's scholarship pays all of his tuition fees.", 'FALSE', 'It pays half of his fees.'),
  tf('The café is the most popular café near the university.', 'NOT GIVEN', 'The text does not say how popular the café is.'),
  tf('Kasun saw snow for the first time in Korea.', 'TRUE', 'He "had never seen snow before".'),
];
const readingMc = [
  mc('What does Kasun study at university?', ['Korean', 'Business', 'Engineering', 'Medicine'], 'C', 'He won a scholarship "to study engineering".'),
  mc('How often does Kasun work at the café?', ['Every evening', 'Three evenings a week', 'At weekends', 'Every morning'], 'B', '"He worked there three evenings a week."'),
  mc('Why was Korean difficult for Kasun when he arrived?', ['People spoke quickly', 'His teachers were bad', 'He forgot his words', 'Nobody spoke to him'], 'A', 'People "spoke much faster than his teachers".'),
  mc('Why do Kasun and his roommate speak Korean?', ['Their teacher told them to', 'It is the only language they both know', 'They want to pass a test', "They don't like English"], 'B', '"It is the only language they share."'),
  mc('What does Kasun want to do next year?', ['Go home', 'Change university', 'Apply for a full scholarship', 'Work full-time'], 'C', 'He "hopes to apply for a full scholarship".'),
];

const readingPaper = {
  code: 'GE-PT1',
  testType: 'READING',
  title: 'Placement 1: Grammar, vocabulary and reading',
  timeLimitMin: 45,
  instructions: 'Three parts: grammar (questions 1 to 20), vocabulary (21 to 30) and reading (31 to 40). The questions get harder as you go. Answer every question; there is no penalty for a wrong answer.',
  passages: [
    { title: 'Part 1: Grammar', text: 'Choose the word or words that best complete each sentence.\n\nThe first questions are easy and they get harder. Do your best on every question, and guess if you are not sure.', groups: [{ type: 'MULTIPLE_CHOICE', instruction: 'Questions 1 to 20. Choose the correct letter, A, B, C or D.', questions: grammar }] },
    { title: 'Part 2: Vocabulary', text: 'Choose the best word for each sentence.\n\nRead the whole sentence before you choose.', groups: [{ type: 'MULTIPLE_CHOICE', instruction: 'Questions 21 to 30. Choose the correct letter, A, B, C or D.', questions: vocabulary }] },
    { title: 'Part 3: A student in Korea', text: READING_TEXT, groups: [
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: 'Questions 31 to 35. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questions: readingTf },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 36 to 40. Choose the correct letter, A, B, C or D.', questions: readingMc },
    ] },
  ],
};

// ── 2. Listening (LISTENING engine; the page reads the script aloud when there is no audio file) ──
const SCRIPT_1 = `Narrator: Section one. You will hear five short conversations. For each one, choose the correct answer. Conversation one.
Man: Excuse me, what time does the next bus to Colombo leave?
Woman: The seven fifteen bus has just gone. The next one is at seven fifty.
Man: Seven fifty? Thank you.
Narrator: Conversation two.
Man: Hello, what can I get you?
Woman: A cup of tea, please.
Man: Anything to eat? We have sandwiches and chocolate cake.
Woman: Just a piece of cake, thanks.
Narrator: Conversation three.
Woman: Excuse me, is the library near here?
Man: Yes, it is. Go straight on. It's opposite the post office, next to a small café.
Narrator: Conversation four.
Woman: How much is this bag?
Man: It's three thousand rupees, but for students it's five hundred rupees cheaper.
Woman: Great. I'm a student.
Narrator: Conversation five.
Man: Shall we go to the beach tomorrow?
Woman: I don't think so. The forecast says it's going to rain all day. Maybe on Sunday, when it's sunny again.`;

const SCRIPT_2 = `Narrator: Section two. You will hear a teacher talking to new students. Write one word or a number for each answer.
Woman: Good morning, everyone, and welcome to the Hanbit Language Centre. My name is Ms Park. That's P, A, R, K. I'll be your teacher this term. Classes start every morning at nine o'clock and finish at one o'clock, so please don't be late. On your first day, you need to bring your passport and two photos for your student card. The library is on the third floor, and it's open until eight in the evening. Our first trip is on Saturday. We're going to visit a palace in Seoul. See you tomorrow!`;

const listeningPaper = {
  code: 'GE-PT2',
  testType: 'LISTENING',
  title: 'Placement 2: Listening',
  timeLimitMin: 20,
  instructions: 'Two sections, ten questions. Press Play to hear each section. You can listen twice. If the sound does not work, put your hand up and your teacher will read it to you.',
  audioScript: JSON.stringify({ 1: SCRIPT_1, 2: SCRIPT_2 }),
  sections: [
    { number: 1, description: 'Five short conversations', groups: [{ type: 'MULTIPLE_CHOICE', instruction: 'Questions 1 to 5. Choose the correct letter, A, B or C.', questions: [
      mc('What time does the next bus leave?', ['7:15', '7:30', '7:50'], 'C', 'The 7:15 bus has gone; the next is at 7:50.'),
      mc('What does the woman order?', ['Tea and a sandwich', 'Coffee and cake', 'Tea and cake'], 'C', 'A cup of tea and a piece of cake.'),
      mc('Where is the library?', ['Next to the bank', 'Opposite the post office', 'Behind the school'], 'B', '"It\'s opposite the post office."'),
      mc('How much does the student pay for the bag?', ['1,500 rupees', '2,500 rupees', '3,000 rupees'], 'B', '3,000 minus 500 for students.'),
      mc('What will the weather be like tomorrow?', ['Sunny', 'Rainy', 'Windy'], 'B', '"It\'s going to rain all day."'),
    ] }] },
    { number: 2, description: 'A teacher welcomes new students', groups: [{ type: 'SENTENCE_COMPLETION', instruction: 'Questions 6 to 10. Write ONE WORD OR A NUMBER for each answer.', wordLimit: 'ONE WORD OR A NUMBER', questions: [
      { type: 'SENTENCE_COMPLETION', content: "The teacher's name is Ms ________.", answer: 'PARK', explanation: 'She spells it: P, A, R, K.' },
      { type: 'SENTENCE_COMPLETION', content: 'Classes finish at ________ o\'clock.', answer: '1|ONE|1:00', explanation: 'They "finish at one o\'clock".' },
      { type: 'SENTENCE_COMPLETION', content: 'On the first day, bring your passport and two ________.', answer: 'PHOTOS|PHOTOGRAPHS|PICTURES', explanation: '"Two photos for your student card."' },
      { type: 'SENTENCE_COMPLETION', content: 'The library is on the ________ floor.', answer: 'THIRD|3RD|3', explanation: '"The library is on the third floor."' },
      { type: 'SENTENCE_COMPLETION', content: 'On Saturday the class will visit a ________ in Seoul.', answer: 'PALACE', explanation: '"We\'re going to visit a palace."' },
    ] }] },
  ],
};

// ── 3. Writing (WRITING engine, marked by Claude out of 100) ──
const writingPaper = {
  code: 'GE-PT3',
  testType: 'WRITING',
  title: 'Placement 3: Writing',
  timeLimitMin: 40,
  instructions: 'Two short tasks. Write in full sentences. Spelling and grammar are part of your score, but it is more important to say what you want to say.',
  tasks: [
    { taskNumber: 1, minWords: 40, timeMinutes: 15, prompt: 'Write about yourself.\n\nInclude:\n- your name, age and home town\n- your family\n- what you do on a normal day\n- what you like doing in your free time\n\nWrite at least 40 words.' },
    { taskNumber: 2, minWords: 80, timeMinutes: 25, prompt: 'You are going to study in South Korea. Write an email to your English teacher.\n\nTell her:\n- when you are going and where you will study\n- what you want to study and why\n- one thing you are worried about, and how you will deal with it\n\nStart with "Dear Ms Silva," and write at least 80 words.' },
  ],
};

// ── 4. Speaking (SPEAKING engine, recorded, marked by Claude out of 100) ──
const speakingPaper = {
  code: 'GE-PT4',
  testType: 'SPEAKING',
  title: 'Placement 4: Speaking',
  timeLimitMin: 12,
  instructions: 'Three short parts. Speak clearly and say as much as you can. Your answers are recorded and marked out of 100.',
  sections: [
    { number: 1, description: 'About you', questions: ['What is your name, and where are you from?', 'Tell me about your family.', 'What do you do in your free time?', 'What did you do last weekend?'] },
    { number: 2, description: 'Talk for one minute', questions: ['Talk about a place you like to visit.\n\nYou should say:\n- where it is\n- how often you go there\n- what you do there\n- and why you like it.'] },
    { number: 3, description: 'Your plans', questions: ['Why do you want to study in Korea?', 'What will be difficult about living in another country?', 'What is the best way to learn a new language quickly?'] },
  ],
};

const PAPERS = [readingPaper, listeningPaper, writingPaper, speakingPaper];

// Score out of 100 → CEFR level (the same bands are used on every screen and printout)
function levelFor(score) {
  if (score == null) return null;
  if (score >= 90) return 'B2';
  if (score >= 75) return 'B1';
  if (score >= 50) return 'A2';
  if (score >= 25) return 'A1';
  return 'Pre-A1';
}

// Writes a list of General English papers (reading, listening, writing, speaking). Skips papers students have taken.
async function seedPaperList(prisma, list, orderBase) {
  let created = 0;
  for (const [pi, p] of list.entries()) {
    const existing = await prisma.paper.findFirst({ where: { paperCode: p.code, testType: p.testType } });
    if (existing) {
      // Never rebuild a paper that students have already taken
      if (await prisma.attempt.count({ where: { paperId: existing.id } })) continue;
      await prisma.paper.delete({ where: { id: existing.id } });
    }
    await prisma.$transaction(async tx => {
      const paper = await tx.paper.create({
        data: {
          paperCode: p.code, testType: p.testType, track: 'GENERAL', title: p.title, timeLimitMin: p.timeLimitMin,
          instructions: p.instructions, status: 'ACTIVE', assignedBatches: 'ALL', order: orderBase + pi,
          audioScript: p.audioScript || null,
        },
      });
      let qn = 0;
      const addQ = (data, q) => tx.question.create({
        data: {
          paperId: paper.id, questionNumber: ++qn, questionType: q.type, content: q.content,
          // Prisma rejects a plain null for a Json column, so leave options out when there are none
          ...(q.options ? { options: q.options.map((o, k) => `${'ABCD'[k]}. ${o}`) } : {}),
          correctAnswer: q.answer, explanation: q.explanation || null, order: qn, ...data,
        },
      });
      if (p.testType === 'READING') {
        for (const [i, ps] of p.passages.entries()) {
          const passage = await tx.passage.create({ data: { paperId: paper.id, passageNumber: i + 1, title: ps.title, text: ps.text } });
          for (const [gi, g] of ps.groups.entries()) {
            const group = await tx.questionGroup.create({ data: { passageId: passage.id, groupType: g.type, instruction: g.instruction, wordLimit: g.wordLimit || null, order: gi } });
            for (const q of g.questions) await addQ({ groupId: group.id, passageNumber: i + 1 }, q);
          }
        }
      } else if (p.testType === 'LISTENING') {
        for (const s of p.sections) {
          const section = await tx.section.create({ data: { paperId: paper.id, number: s.number, description: s.description, audioUrl: null, order: s.number } });
          for (const [gi, g] of s.groups.entries()) {
            const group = await tx.questionGroup.create({ data: { sectionId: section.id, groupType: g.type, instruction: g.instruction, wordLimit: g.wordLimit || null, order: gi } });
            for (const q of g.questions) await addQ({ groupId: group.id, sectionNumber: s.number }, q);
          }
        }
      } else if (p.testType === 'WRITING') {
        for (const t of p.tasks) {
          await tx.writingTask.create({ data: { paperId: paper.id, taskNumber: t.taskNumber, prompt: t.prompt, minWords: t.minWords, timeMinutes: t.timeMinutes } });
        }
      } else if (p.testType === 'SPEAKING') {
        for (const s of p.sections) {
          const section = await tx.section.create({ data: { paperId: paper.id, number: s.number, description: s.description, order: s.number } });
          const group = await tx.questionGroup.create({ data: { sectionId: section.id, groupType: 'SPEAKING', instruction: s.description, order: 0 } });
          for (const content of s.questions) {
            await tx.question.create({ data: { paperId: paper.id, groupId: group.id, sectionNumber: s.number, questionNumber: ++qn, questionType: 'SPEAKING', content, correctAnswer: '', order: qn } });
          }
        }
      }
    }, { timeout: 30000 });
    created++;
  }
  return created;
}

const seedPlacement = prisma => seedPaperList(prisma, PAPERS, 900);

module.exports = { PAPERS, seedPlacement, seedPaperList, levelFor };
