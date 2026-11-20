// EXAM PAPER 1 (Exam tab): one hour, IELTS Academic style, in two parts done back to back.
// Part 1 Reading: 2 passages, 26 questions, 40 minutes. Part 2 Writing: Task 1 (two pie charts), 20 minutes.
// Pitched a little above the class level: the words are normal, but many questions have a tempting wrong answer
// (a NOT GIVEN that looks TRUE, an option that repeats words from the wrong paragraph, a heading that sounds right).
// Codes start "EX1-" so the naming script keeps the titles. Locked (EXAM_LOCKED) until a teacher unlocks it.
const { mc, tf, sc, I } = require('./kit');

const P1 = `[A] Mangroves are trees and shrubs that grow along tropical and subtropical coastlines, in the narrow zone where the land meets the sea. Twice a day the tide covers their roots with salt water and then leaves them exposed to the air again. Very few plants could survive such conditions, yet more than seventy species of mangrove have adapted to them. They are found in over 120 countries, and together they cover roughly 147,000 square kilometres, an area slightly larger than Bangladesh. Indonesia alone contains around a fifth of the world's total.

[B] Life in salt water creates two main problems for a plant: too much salt, and too little oxygen in the mud. Mangroves deal with salt in different ways. Some species, such as the red mangrove, block most of it at the roots, while others take it in and then push it out through their leaves, which are often covered in tiny salt crystals. To solve the oxygen problem, many mangroves grow special roots that stick up out of the mud like pencils. These breathing roots, known as pneumatophores, take in air at low tide.

[C] For a long time, mangrove forests were regarded as useless swamps. In many countries they were cut down to make room for rice fields, salt pans and, from the 1980s onwards, shrimp farms. Between 1980 and 2000, it is estimated that about 35 percent of the world's mangroves disappeared. Shrimp farming was responsible for the largest share of this loss in Asia, although in Africa and South America the main causes were different: the growth of cities and the collection of wood for fuel.

[D] Scientists now understand that mangroves provide services worth far more than the land they occupy. Their tangled roots slow down waves and hold the soil in place, which protects coastal villages from storms and erosion. After the Indian Ocean tsunami of 2004, a study in Sri Lanka found that villages behind healthy mangrove forests generally suffered less damage than those where the trees had been removed, although the researchers stressed that no forest could stop the very largest waves. Mangroves also act as nurseries for young fish. Many species that are later caught far out at sea spend the first months of their lives sheltering among the roots.

[E] Perhaps the most surprising discovery concerns carbon. Although mangroves cover less than one percent of the world's tropical forest area, they can store up to four times more carbon per hectare than a rainforest. Most of this carbon is not in the trees themselves but in the thick, wet mud beneath them, where it can remain for thousands of years because the lack of oxygen prevents it from breaking down. When a mangrove forest is cleared, however, this mud is exposed to the air, and the stored carbon is released.

[F] Efforts to replant mangroves have had mixed results. In some projects, millions of seedlings were planted in places where mangroves had never naturally grown, such as mudflats that stay underwater for too long each day, and most of the young trees died. Experts now argue that it is usually more effective to restore the natural flow of water to an area and allow mangroves to return by themselves. Sri Lanka has been widely praised for becoming, in 2015, the first country to promise legal protection for all of its remaining mangrove forests. Since then, local communities, many of them led by women, have been paid to look after the forests and to replant damaged areas.`;

const P2 = `[A] Most people think of memory as a kind of video recorder. We experience an event, the brain stores a copy, and later we press "play" to watch it again. This picture is comforting, but psychologists have shown again and again that it is wrong. Remembering is not like replaying a recording; it is more like rebuilding a house from a few remaining bricks. Each time we recall an event, we put it together again, filling the gaps with what we expect, what we have heard from others and what we know now. As a result, memories can change over time without us noticing.

[B] One of the first scientists to study this was the British psychologist Frederic Bartlett. In the 1930s he asked students at Cambridge to read a Native American folk tale called "The War of the Ghosts" and then to retell it several times over the following months. The story contained details that seemed strange to the English students, and with each retelling, these details tended to disappear or change. A canoe, for example, often became a boat, and parts of the story that the students found confusing were simply left out. Bartlett concluded that people do not remember exactly what happened, but rather a version that fits their own culture and expectations.

[C] Decades later, in the 1970s, the American researcher Elizabeth Loftus showed how easily memory can be influenced by the words of other people. In one famous experiment, people watched a film of a car accident and were then asked how fast the cars were going when they "hit" each other. Others were asked the same question with a different verb, such as "smashed" or "contacted". Those who heard "smashed" gave an average estimate of about 41 miles per hour, while those who heard "contacted" guessed around 32. A week later, the participants were asked whether they had seen any broken glass. There had been none in the film, yet people who had heard "smashed" were more than twice as likely to say that they had seen some as those who had heard "hit".

[D] Loftus later went further, showing that it is possible to create memories of events that never happened at all. In a study in the 1990s, adults were given short descriptions of four events from their childhood, supposedly provided by their relatives. Three of the events were real, but one, being lost in a shopping centre at the age of five, was invented. After being asked to think about the events over several interviews, about a quarter of the participants said that they remembered the false event, and some even added details of their own, such as what the person who found them looked like.

[E] It might be expected that memories of shocking or emotional events would be more reliable. Such events often produce what are called "flashbulb memories", which feel extremely clear, as though a photograph had been taken at that moment. However, research suggests that this clarity can be misleading. The day after the American space shuttle Challenger exploded in 1986, the psychologist Ulric Neisser asked his students to write down how they had heard the news. When the same students were questioned again about two and a half years later, many of their accounts had changed significantly, and some were completely different. Surprisingly, many students were highly confident that their later version was correct, and a few refused to believe the notes in their own handwriting.

[F] None of this means that our memories are generally useless. For most everyday purposes they serve us well, and the ability to combine and update information may even be an advantage, helping us to imagine the future and solve new problems. The research does, however, have serious practical consequences. In many countries, courts have traditionally given great weight to eyewitnesses, and studies of people later proven innocent by DNA evidence have found that mistaken eyewitness memory played a part in a large proportion of the original convictions. Partly as a result, police in a number of countries have changed the way they interview witnesses, avoiding questions that suggest a particular answer.`;

const HEADINGS = [
  'How one word can change what people recall',
  'Why emotional events are remembered perfectly',
  'Remembering as a process of rebuilding',
  'Changing a story to fit your own culture',
  'Practical consequences of imperfect memory',
  'Simple ways to improve your everyday memory',
  'Confident, but wrong',
  'Remembering something that never happened',
];

const READING = {
  code: 'EX1-R', testType: 'READING', title: 'Exam Paper 1 · Part 1 of 2 · Reading', timeLimitMin: 40, difficulty: 4, topic: 'Exam Paper 1',
  instructions: 'Exam Paper 1, Part 1 of 2. Two passages and 26 questions, 40 minutes. Passage 1: questions 1 to 13. Passage 2: questions 14 to 26. Read each question carefully: some answers that look right are not. When you submit, Part 2 (Writing) starts straight away.',
  passages: [
    { title: 'Guardians of the coast', text: P1, groups: [
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(1, 6), questions: [
        tf('Mangroves can only grow in tropical regions.', 'FALSE', 'Paragraph A says "tropical and subtropical coastlines", so not only tropical.', ['grow along tropical and subtropical coastlines']),
        tf('Indonesia has more mangrove forest than any other country.', 'NOT GIVEN', 'The passage says Indonesia has "around a fifth of the world\'s total", but it never compares Indonesia with other countries. A fifth is a lot, but the passage does not say it is the most.'),
        tf('All species of mangrove remove salt through their leaves.', 'FALSE', '"Some species, such as the red mangrove, block most of it at the roots" — so not all of them use their leaves.', ['Some species, such as the red mangrove, block most of it at the roots']),
        tf('Shrimp farming was the main cause of mangrove loss on every continent.', 'FALSE', 'Shrimp farming was the main cause in Asia only; "in Africa and South America the main causes were different".', ['in Africa and South America the main causes were different']),
        tf('The Sri Lankan study found that mangroves could protect villages from even the largest waves.', 'FALSE', '"the researchers stressed that no forest could stop the very largest waves".', ['no forest could stop the very largest waves']),
        tf('Mangrove wood is often used to build fishing boats.', 'NOT GIVEN', 'The passage mentions collecting wood "for fuel", but says nothing about boats.'),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SC(7, 10), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Mangrove roots slow down ________ and hold the soil in place.', 'WAVES', '"Their tangled roots slow down waves and hold the soil in place". (Not "storms": the roots slow the waves, which protects villages from storms.)', ['Their tangled roots slow down waves and hold the soil in place']),
        sc('Many fish that are caught at sea spend their early life sheltering among mangrove ________.', 'ROOTS', '"spend the first months of their lives sheltering among the roots".', ['spend the first months of their lives sheltering among the roots']),
        sc('Most of the carbon in a mangrove forest is stored in the ________ under the trees.', 'MUD', '"Most of this carbon is not in the trees themselves but in the thick, wet mud beneath them". (Not "trees": the passage says the opposite.)', ['Most of this carbon is not in the trees themselves but in the thick, wet mud beneath them']),
        sc('The carbon can stay there for thousands of years because there is not enough ________.', 'OXYGEN', '"because the lack of oxygen prevents it from breaking down".', ['because the lack of oxygen prevents it from breaking down']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(11, 13), questions: [
        mc('What is the main job of pneumatophores?', ['To remove salt from the tree', 'To take in air', 'To hold the tree firmly in the mud', 'To collect fresh water'], 'B', '"These breathing roots, known as pneumatophores, take in air at low tide." Salt is in the same paragraph, but it is dealt with in other ways.', ['These breathing roots, known as pneumatophores, take in air at low tide']),
        mc('According to paragraph F, why did many replanting projects fail?', ['There were not enough seedlings', 'Seedlings were planted where mangroves do not grow naturally', 'Local people were not paid to look after them', 'The sea water was too salty for young trees'], 'B', '"seedlings were planted in places where mangroves had never naturally grown… and most of the young trees died".', ['millions of seedlings were planted in places where mangroves had never naturally grown']),
        mc('What was special about Sri Lanka in 2015?', ['It was the first country to protect all its mangroves by law', 'It planted more mangroves than any other country', 'It was the first country to pay women to protect forests', 'It closed all of its shrimp farms'], 'A', '"the first country to promise legal protection for all of its remaining mangrove forests". Women and payments are mentioned, but not as a "first".', ['the first country to promise legal protection for all of its remaining mangrove forests']),
      ] },
    ] },
    { title: 'Why memory plays tricks', text: P2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 14 to 19. The passage has six paragraphs, A to F. Choose the correct heading for each paragraph from the list of headings, A to H. There are two more headings than you need.', questions: [
        mc('Paragraph A', HEADINGS, 'C', 'Paragraph A: remembering "is more like rebuilding a house from a few remaining bricks".', ['it is more like rebuilding a house from a few remaining bricks']),
        mc('Paragraph B', HEADINGS, 'D', 'Bartlett found people remember "a version that fits their own culture and expectations".', ['a version that fits their own culture and expectations']),
        mc('Paragraph C', HEADINGS, 'A', 'One verb ("smashed" or "contacted") changed the speed people remembered.', ['Those who heard "smashed" gave an average estimate of about 41 miles per hour']),
        mc('Paragraph D', HEADINGS, 'H', 'A quarter of people "remembered" being lost in a shopping centre, which never happened.', ['it is possible to create memories of events that never happened at all']),
        mc('Paragraph E', HEADINGS, 'G', 'Students were "highly confident" but their memories had changed. Heading B is the trap: the paragraph says emotional memories are NOT perfect.', ['many students were highly confident that their later version was correct']),
        mc('Paragraph F', HEADINGS, 'E', 'Paragraph F is about courts, eyewitnesses and police: "serious practical consequences". Heading F is the trap: the paragraph does not give tips to improve memory.', ['The research does, however, have serious practical consequences']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 20 to 23. Match each finding with the correct researcher, A, B or C. You may use a letter more than once.', questions: [
        mc('People can come to remember an event that did not happen.', ['Frederic Bartlett', 'Elizabeth Loftus', 'Ulric Neisser'], 'B', 'Loftus, the shopping centre study (paragraph D).', ['it is possible to create memories of events that never happened at all']),
        mc('Details of a story that seem unfamiliar are often changed or forgotten.', ['Frederic Bartlett', 'Elizabeth Loftus', 'Ulric Neisser'], 'A', 'Bartlett: "these details tended to disappear or change".', ['these details tended to disappear or change']),
        mc('Accounts were written down the day after a real news event.', ['Frederic Bartlett', 'Elizabeth Loftus', 'Ulric Neisser'], 'C', 'Neisser asked his students "The day after the American space shuttle Challenger exploded".', ['The day after the American space shuttle Challenger exploded in 1986']),
        mc('The words used in a question can change the answer people give.', ['Frederic Bartlett', 'Elizabeth Loftus', 'Ulric Neisser'], 'B', 'Loftus: the verb in the question changed the speed people remembered.', ['showed how easily memory can be influenced by the words of other people']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SA(24, 26), wordLimit: 'NO MORE THAN TWO WORDS', questions: [
        sc('In Bartlett\'s study, what did a canoe often become?', 'BOAT|A BOAT', '"A canoe, for example, often became a boat".', ['A canoe, for example, often became a boat']),
        sc('What did some people wrongly say they had seen in the accident film?', 'BROKEN GLASS', '"There had been none in the film" but people said they had seen broken glass.', ['whether they had seen any broken glass']),
        sc('Which group of people have courts traditionally relied on heavily?', 'EYEWITNESSES|EYEWITNESS|EYE WITNESSES', '"courts have traditionally given great weight to eyewitnesses". (Not "police": police are mentioned later, for a different point.)', ['courts have traditionally given great weight to eyewitnesses']),
      ] },
    ] },
  ],
};

const WRITING = {
  code: 'EX1-W', testType: 'WRITING', title: 'Exam Paper 1 · Part 2 of 2 · Writing', timeLimitMin: 20, difficulty: 4, topic: 'Exam Paper 1',
  instructions: 'Exam Paper 1, Part 2 of 2. Writing Task 1, 20 minutes, at least 150 words.',
  tasks: [
    { taskNumber: 1, minWords: 150, timeMinutes: 20, chartImageUrl: '/media/ielts-exam1-pie.png', chartDescription: 'How the average family in one country spent its money in 2000 and 2025: housing, food, transport, education, entertainment and other',
      prompt: 'The pie charts below show how the average family in one country spent its money in 2000 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.' },
  ],
};

const PAPERS = [READING, WRITING];

function checkExam1() {
  const errs = []; let n = 0;
  READING.passages.forEach(ps => ps.groups.forEach(g => g.questions.forEach(q => {
    n++;
    (q.ev || []).forEach(e => { if (!ps.text.includes(e)) errs.push(`Q${n}: evidence not in passage: ${e}`); });
    if (q.options && q.answer.charCodeAt(0) - 65 >= q.options.length) errs.push(`Q${n}: answer outside options`);
    if (q.type === 'TRUE_FALSE_NOT_GIVEN' && q.answer !== 'NOT GIVEN' && !(q.ev || []).length) errs.push(`Q${n}: no evidence`);
  })));
  if (n !== 26) errs.push(`reading has ${n} questions, not 26`);
  return errs;
}

async function addExamPaper1(prisma) {
  const errs = checkExam1();
  if (errs.length) return { skipped: 'check failed', errors: errs.slice(0, 5) };
  const { addIeltsPapers } = require('./kit');
  return addIeltsPapers(prisma, PAPERS, { status: 'EXAM_LOCKED' });
}

module.exports = { PAPERS, checkExam1, addExamPaper1 };
