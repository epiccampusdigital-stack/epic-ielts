// Halfway mock exam (IELTS style), Saturday 21 Nov 2026: one 2-hour sitting in three parts, done back to back.
// Part 1 Listening (30 min, 20 questions) → Part 2 Reading (40 min, 20 questions) → Part 3 Writing (50 min, 2 tasks).
// Codes start "IM-" so the IELTS naming script keeps these titles. All content is original.
// Listening audio: recorded on the server with the Google voice when a key is set; otherwise the exam page reads the script aloud.
const { mc, tf, sc, I } = require('./kit');

const MC3 = (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B or C.`;
const FORM = (a, b) => `Questions ${a} to ${b}. Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.`;
const NOTES = (a, b) => `Questions ${a} to ${b}. Complete the notes below. Write ONE WORD ONLY for each answer.`;

// ─────────────── PART 1: LISTENING ───────────────
const L1 = `Narrator: Part one. You will hear a student phoning a university housing office in Korea. First, you have some time to look at questions 1 to 10. Now listen carefully and answer questions 1 to 10.
Officer: Good morning, International Housing Office. How can I help you?
Student: Hello. My name is Nimali, and I'm starting a Korean language course in March. I'd like to apply for a room in the dormitory.
Officer: Of course. Can I take your family name, please?
Student: Yes, it's Perera. P, E, R, E, R, A.
Officer: Thank you. And which country are you coming from?
Student: Sri Lanka.
Officer: Lovely. Now, we have single rooms and shared rooms. Which would you prefer?
Student: How much is a shared room?
Officer: A shared room is three hundred and twenty thousand won a month. A single room is four hundred and fifty thousand.
Student: I'll take a shared room, please. It's cheaper, and I'd like to practise Korean with a roommate.
Officer: Good idea. Do you have any special needs for food?
Student: Yes, I'm vegetarian.
Officer: No problem. The dormitory canteen has a vegetarian option every day. When will you arrive?
Student: My flight lands on the twenty-sixth of February.
Officer: Then you can move in on the twenty-seventh. The office opens at nine, so please come after that time.
Student: Great. Is there anything I need to bring?
Officer: Please bring your passport and two passport photos. We'll make your student card on the first day. Oh, and you'll need to pay a deposit of one hundred thousand won.
Student: Can I pay that by card?
Officer: Yes, by card or in cash. We don't accept cheques.
Student: And is there internet in the rooms?
Officer: Every room has free wi-fi. There's also a laundry room on the ground floor, which costs one thousand won a wash.
Student: Perfect. Can I give you my email address for the confirmation?
Officer: Please do.
Student: It's nimali dot p at mail dot com.
Officer: Thank you, Nimali. We'll send you a confirmation within three days.`;

const L2 = `Narrator: Part two. You will hear a programme coordinator talking to new students on their first day. First, you have some time to look at questions 11 to 20. Now listen carefully and answer questions 11 to 20.
Coordinator: Good morning, everyone, and welcome to Korea. I'm Mr Han, the coordinator of the international programme. I'd like to tell you about your first week.
This morning, after this talk, you will take a short placement test. It is not an exam, so please don't worry. We only use it to put you in the right class. The test takes about forty minutes, and you will do it on the computers in Room 204.
Your classes begin tomorrow, Tuesday. Every morning you have Korean language from nine o'clock until twelve thirty. Afternoons are different each day. On Tuesday and Thursday afternoons you will have culture classes, such as cooking and traditional music. On Wednesday afternoon there is a trip to the city's history museum. The bus leaves from the main gate at one thirty, so please have lunch early that day.
Friday is a special day. In the afternoon, each student will meet a Korean student volunteer, called a buddy. Your buddy can help you open a bank account, buy a phone card and find your way around the city.
A few important points. First, attendance is very important. If you miss more than three classes in a month, you may lose your scholarship. If you are ill, please send a message to the office before nine o'clock. Second, the library is open until ten o'clock at night, and it's a great quiet place to study. Finally, if you have any problems at all, my office is on the first floor, next to the student lounge. My door is always open.
Now, let's go to Room 204 for the test.`;

const LIS = {
  code: 'IM-HALF-L', testType: 'LISTENING', title: 'Halfway Mock 1 of 3 · Listening', timeLimitMin: 30, difficulty: 3, topic: 'Halfway mock exam',
  instructions: 'Halfway mock exam, Part 1 of 3. Two parts and 20 questions, 30 minutes. Read the questions before you listen. When you finish, submit and start Part 2 (Reading) straight away.',
  audioScript: JSON.stringify({ 1: L1, 2: L2 }),
  sections: [
    { number: 1, description: 'A student phones a university housing office', groups: [
      { type: 'SENTENCE_COMPLETION', instruction: FORM(1, 6), wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
        sc('Family name: ________', 'PERERA', 'She spells it: P, E, R, E, R, A.', ['it\'s Perera. P, E, R, E, R, A']),
        sc('Type of room: ________ room', 'SHARED', '"I\'ll take a shared room, please."', ["I'll take a shared room, please"]),
        sc('Cost per month: ________ won', '320,000|320000|320 000|THREE HUNDRED AND TWENTY THOUSAND', '"three hundred and twenty thousand won a month"', ['A shared room is three hundred and twenty thousand won a month']),
        sc('Food: she is ________', 'VEGETARIAN', '"I\'m vegetarian."', ["I'm vegetarian"]),
        sc('Move-in date: ________ February', '27|27TH|TWENTY-SEVENTH|TWENTY SEVENTH', '"you can move in on the twenty-seventh"', ['you can move in on the twenty-seventh']),
        sc('Bring: passport and two ________', 'PHOTOS|PHOTOGRAPHS|PASSPORT PHOTOS', '"two passport photos"', ['bring your passport and two passport photos']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: MC3(7, 10), questions: [
        mc('How much is the deposit?', ['50,000 won', '100,000 won', '450,000 won'], 'B', '"a deposit of one hundred thousand won"', ['a deposit of one hundred thousand won']),
        mc('Which way of paying is NOT accepted?', ['Card', 'Cash', 'Cheque'], 'C', '"We don\'t accept cheques."', ["We don't accept cheques"]),
        mc('Where is the laundry room?', ['On the ground floor', 'On the first floor', 'Next to the canteen'], 'A', '"a laundry room on the ground floor"', ['a laundry room on the ground floor']),
        mc('When will Nimali get her confirmation?', ['Today', 'Within three days', 'When she arrives'], 'B', '"within three days"', ["We'll send you a confirmation within three days"]),
      ] },
    ] },
    { number: 2, description: 'A coordinator welcomes new students', groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC3(11, 15), questions: [
        mc('Why do students take the placement test?', ['To win a scholarship', 'To be put in the right class', 'To get a student card'], 'B', '"We only use it to put you in the right class."', ['We only use it to put you in the right class']),
        mc('How long is the placement test?', ['About 20 minutes', 'About 40 minutes', 'About an hour'], 'B', '"The test takes about forty minutes"', ['The test takes about forty minutes']),
        mc('When do Korean classes finish each morning?', ['12:00', '12:30', '1:30'], 'B', '"from nine o\'clock until twelve thirty"', ["from nine o'clock until twelve thirty"]),
        mc('What happens on Wednesday afternoon?', ['A cooking class', 'A museum trip', 'Meeting a buddy'], 'B', '"On Wednesday afternoon there is a trip to the city\'s history museum."', ["On Wednesday afternoon there is a trip to the city's history museum"]),
        mc('What can the buddy help students do?', ['Choose their classes', 'Open a bank account', 'Pay their rent'], 'B', '"Your buddy can help you open a bank account"', ['Your buddy can help you open a bank account']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: NOTES(16, 20), wordLimit: 'ONE WORD ONLY', questions: [
        sc('The placement test is in Room ________. (number)', '204', '"on the computers in Room 204"', ['you will do it on the computers in Room 204']),
        sc('Tuesday and Thursday afternoons: ________ classes', 'CULTURE', '"you will have culture classes"', ['you will have culture classes']),
        sc('Missing more than three classes a month: students may lose their ________', 'SCHOLARSHIP', '"you may lose your scholarship"', ['you may lose your scholarship']),
        sc('If ill: send a message to the ________ before 9:00', 'OFFICE', '"send a message to the office before nine o\'clock"', ["please send a message to the office before nine o'clock"]),
        sc('Mr Han\'s office is next to the student ________', 'LOUNGE', '"next to the student lounge"', ['my office is on the first floor, next to the student lounge']),
      ] },
    ] },
  ],
};

// ─────────────── PART 2: READING ───────────────
const R1 = `[A] In the 1960s and 1970s, sleeper trains linked cities all over Europe. Passengers could board in the evening, sleep in a small cabin and wake up in another country. However, as cheap flights and fast motorways became common, many people stopped taking them. By the early 2010s, most night train services had been cancelled because they were losing money.

[B] Recently, these trains have made a surprising return. In 2016, the Austrian railway company decided to take over several routes that others had abandoned. Many experts expected the plan to fail, but the trains were often fully booked. Since then, new routes have opened between cities such as Paris and Vienna, and Amsterdam and Berlin.

[C] The main reason for this comeback is concern about the environment. A journey by train produces far less carbon dioxide than the same trip by plane, often less than a fifth. Some travellers also say that a night train saves time, because they travel while they sleep and arrive in the city centre ready for the day, rather than at an airport far outside it.

[D] Running night trains is not easy, however. The carriages are expensive to build, and each one carries far fewer passengers than a daytime train, because beds take up more space than seats. Trains also have to pay fees to use the tracks in every country they cross, and these fees can be high. As a result, tickets are often more expensive than a budget flight.

[E] Supporters believe governments should do more to help. Some suggest lowering track fees for night trains or adding a tax to short flights. France has already banned some domestic flights on routes where the same journey can be made by train in under two and a half hours. Whether night trains can grow further may depend on decisions like these.`;

const R2 = `[A] Most of us forget names, dates and the reasons we walked into a room. Forgetting can feel like a failure of the brain, but many scientists now argue that it is a normal and even useful process.

[B] The first person to study forgetting scientifically was the German psychologist Hermann Ebbinghaus, in the 1880s. He tested himself by learning lists of nonsense words and checking how many he could remember later. He found that most forgetting happens very quickly: within one day, he had lost more than half of what he had learned. This pattern became known as the "forgetting curve".

[C] Ebbinghaus also discovered how to slow forgetting down. When he reviewed the words again a short time later, and then after longer and longer gaps, he remembered them much better. Today this method is called spaced repetition, and it is used by many language-learning apps, which show learners a word just before they are likely to forget it.

[D] Modern researchers have added new ideas. Neuroscientist Dr Blake Richards argues that the brain forgets on purpose, so that old, unhelpful details do not get in the way of new learning. In his view, the goal of memory is not to store everything, but to help us make good decisions. Psychologist Dr Lisa Genova points out that most everyday forgetting, such as losing car keys, happens because we were not paying attention in the first place, so the memory was never properly made.

[E] So what can learners do? Experts agree on a few simple steps: review new material within a day, test yourself instead of only re-reading, and get enough sleep, since the brain strengthens memories at night. As Dr Genova says, "Forgetting is not a sign that something is wrong. It is a sign that your brain is choosing what matters."`;

const HEADS = ['Why the trains have become popular again', 'A golden age and a decline', 'Ideas for supporting night trains', 'The problems of running night trains', 'An unexpected success story', 'How sleeper cabins are designed'];
const PEOPLE = ['Hermann Ebbinghaus', 'Dr Blake Richards', 'Dr Lisa Genova'];

const REA = {
  code: 'IM-HALF-R', testType: 'READING', title: 'Halfway Mock 2 of 3 · Reading', timeLimitMin: 40, difficulty: 3, topic: 'Halfway mock exam',
  instructions: 'Halfway mock exam, Part 2 of 3. Two passages and 20 questions, 40 minutes. Passage 1: questions 1 to 10. Passage 2: questions 11 to 20. When you finish, submit and start Part 3 (Writing) straight away.',
  passages: [
    { title: 'The return of the night train', text: R1, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.HEAD(1, 5), questions: [
        mc('Paragraph A', HEADS, 'B', 'Paragraph A: busy in the 1960s and 70s, then most services cancelled.', ['most night train services had been cancelled because they were losing money']),
        mc('Paragraph B', HEADS, 'E', 'Paragraph B: experts expected failure, but trains were fully booked.', ['Many experts expected the plan to fail, but the trains were often fully booked']),
        mc('Paragraph C', HEADS, 'A', 'Paragraph C: "The main reason for this comeback is concern about the environment."', ['The main reason for this comeback is concern about the environment']),
        mc('Paragraph D', HEADS, 'D', 'Paragraph D: "Running night trains is not easy".', ['Running night trains is not easy, however']),
        mc('Paragraph E', HEADS, 'C', 'Paragraph E: lower track fees, a tax on short flights.', ['Supporters believe governments should do more to help']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(6, 10), questions: [
        tf('Cheap flights were one reason people stopped using night trains.', 'TRUE', '"as cheap flights and fast motorways became common, many people stopped taking them"', ['as cheap flights and fast motorways became common, many people stopped taking them']),
        tf('Most experts expected the Austrian plan to succeed.', 'FALSE', '"Many experts expected the plan to fail"', ['Many experts expected the plan to fail']),
        tf('A train journey usually produces less than half the carbon dioxide of a flight.', 'TRUE', '"often less than a fifth"', ['often less than a fifth']),
        tf('Night train carriages carry more passengers than daytime carriages.', 'FALSE', '"each one carries far fewer passengers than a daytime train"', ['each one carries far fewer passengers than a daytime train']),
        tf('Germany has banned some short domestic flights.', 'NOT GIVEN', 'The passage says France did this; it says nothing about Germany.'),
      ] },
    ] },
    { title: 'Why we forget', text: R2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.FEAT(11, 14, 'C') + ' A: Hermann Ebbinghaus. B: Dr Blake Richards. C: Dr Lisa Genova.', questions: [
        mc('Forgetting helps the brain make better decisions.', PEOPLE, 'B', 'Richards: memory is meant "to help us make good decisions".', ['the goal of memory is not to store everything, but to help us make good decisions']),
        mc('Most forgetting happens soon after learning.', PEOPLE, 'A', 'Ebbinghaus: "most forgetting happens very quickly".', ['He found that most forgetting happens very quickly']),
        mc('We often forget because we did not pay attention.', PEOPLE, 'C', 'Genova: "we were not paying attention in the first place".', ['happens because we were not paying attention in the first place']),
        mc('Reviewing at growing intervals improves memory.', PEOPLE, 'A', 'Ebbinghaus reviewed after "longer and longer gaps".', ['and then after longer and longer gaps, he remembered them much better']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(15, 17), questions: [
        mc('What did Ebbinghaus use in his experiments?', ['Real words from a dictionary', 'Lists of nonsense words', 'Names of famous people', 'Photographs'], 'B', '"learning lists of nonsense words"', ['learning lists of nonsense words']),
        mc('How much had he forgotten within one day?', ['About a quarter', 'Less than half', 'More than half', 'Almost nothing'], 'C', '"he had lost more than half of what he had learned"', ['within one day, he had lost more than half of what he had learned']),
        mc('How do language apps use spaced repetition?', ['They show a word just before you are likely to forget it', 'They show every word every day', 'They give a test once a month', 'They only show new words'], 'A', '"show learners a word just before they are likely to forget it"', ['show learners a word just before they are likely to forget it']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SUM(18, 20), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Summary: Experts advise learners to review new material within a ________.', 'DAY', '"review new material within a day"', ['review new material within a day']),
        sc('Learners should ________ themselves instead of only re-reading.', 'TEST', '"test yourself instead of only re-reading"', ['test yourself instead of only re-reading']),
        sc('Enough ________ is important because the brain strengthens memories at night.', 'SLEEP', '"get enough sleep"', ['get enough sleep, since the brain strengthens memories at night']),
      ] },
    ] },
  ],
};

// ─────────────── PART 3: WRITING ───────────────
const WRI = {
  code: 'IM-HALF-W', testType: 'WRITING', title: 'Halfway Mock 3 of 3 · Writing', timeLimitMin: 50, difficulty: 3, topic: 'Halfway mock exam',
  instructions: 'Halfway mock exam, Part 3 of 3. Two tasks, 50 minutes. Task 1: about 20 minutes, at least 150 words. Task 2: about 30 minutes, at least 250 words. Task 2 carries more marks.',
  tasks: [
    { taskNumber: 1, minWords: 150, timeMinutes: 20, chartImageUrl: '/media/ielts-mock-halfway-line.png', chartDescription: 'Sri Lankan students going abroad to study in Australia, the United Kingdom, Japan and South Korea, 2016 to 2026',
      prompt: 'The line graph below shows the number of Sri Lankan students who went to study in four countries between 2016 and 2026.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.' },
    { taskNumber: 2, minWords: 250, timeMinutes: 30,
      prompt: 'Some people think that young people should learn the language of a country before they go there to study or work. Others believe it is better to learn the language after arriving in the new country.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.' },
  ],
};

const PAPERS = [LIS, REA, WRI];

function checkMock() {
  const errs = []; let n = 0;
  REA.passages.forEach(ps => ps.groups.forEach(g => g.questions.forEach(q => { n++; (q.ev || []).forEach(e => { if (!ps.text.includes(e)) errs.push(`R Q${n}: ${e}`); }); })));
  if (n !== 20) errs.push(`reading has ${n} questions`);
  const scripts = JSON.parse(LIS.audioScript); let m = 0;
  LIS.sections.forEach(s => s.groups.forEach(g => g.questions.forEach(q => { m++; (q.ev || []).forEach(e => { if (!scripts[s.number].includes(e)) errs.push(`L Q${m}: ${e}`); }); })));
  if (m !== 20) errs.push(`listening has ${m} questions`);
  return errs;
}

// Adds the three parts once. Then records the listening audio in the background if the Google voice key is set.
async function addHalfwayMock(prisma) {
  const errs = checkMock();
  if (errs.length) return { skipped: 'check failed', errors: errs.slice(0, 5) };
  const { addIeltsPapers } = require('./kit');
  const r = await addIeltsPapers(prisma, PAPERS, { status: 'DRAFT' }); // hidden until it opens (openHalfwayMock)
  const lis = await prisma.paper.findFirst({ where: { paperCode: LIS.code, testType: 'LISTENING' }, include: { sections: true } });
  if (lis && lis.sections.some(s => !s.audioUrl)) {
    const builder = require('../../src/services/paperBuilder');
    if (builder.ttsReady()) {
      builder.recordPaperAudio(lis.id).then(n => console.log('[ielts] halfway mock audio recorded:', n)).catch(e => console.error('[ielts] halfway mock audio failed:', e.message));
      return { ...r, audio: 'recording' };
    }
    return { ...r, audio: 'no Google voice key: the exam page reads the script aloud' };
  }
  return r;
}

// Students see the mock from Saturday 21 Nov 2026, 2:15 PM Colombo time (the session starts at 2:30).
// Until then it is hidden (DRAFT); teachers can already open it in the teacher portal.
const OPENS_AT = Date.parse('2026-11-21T14:15:00+05:30');
async function openHalfwayMock(prisma) {
  if (Date.now() < OPENS_AT) return { opensAt: '2026-11-21 14:15 (Colombo)' };
  const r = await prisma.paper.updateMany({ where: { paperCode: { in: PAPERS.map(p => p.code) }, track: 'IELTS', status: 'DRAFT' }, data: { status: 'ACTIVE' } });
  return r.count ? { opened: r.count } : { open: true };
}

module.exports = { PAPERS, checkMock, addHalfwayMock, openHalfwayMock, OPENS_AT };
