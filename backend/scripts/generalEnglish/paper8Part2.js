// GE Reading 008, Part 2: a second passage about films (questions 11 to 25).
// Used in two ways: newPapers.js includes it when the paper is created from scratch, and
// upgradePaper8() adds it to the existing live paper (once) without touching Part 1.
// All content is original.

const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const tf = (content, answer, explanation, ev) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });
const PARA = ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E'];

const TEXT = `[A] When streaming services first became popular, many people predicted the end of the cinema. Why would anyone pay for a ticket, travel across town and sit next to strangers, when thousands of films were available at home for a small monthly fee? During the pandemic, when cinemas around the world were forced to close, this prediction seemed even more likely to come true.

[B] Yet cinemas have not disappeared. In many countries, audiences have returned, especially for large action films and animated stories made for families. Cinema owners have also changed the experience. Seats that recline like beds, giant screens and powerful sound systems are now common, and some cinemas serve full meals during the film. The aim is simple: to offer something that a television in a living room cannot.

[C] Psychologists suggest there is another reason people still go to the cinema. Watching a film with a crowd is a social experience. When an audience laughs, screams or cries together, each person feels the emotion more strongly. In one experiment, viewers who watched a comedy in a full room laughed far more often than those who watched the same film alone. A dark cinema also removes distractions: there are no phones ringing and no washing to fold, so people pay closer attention to the story.

[D] Streaming, however, has clear advantages of its own. Viewers can pause a film, watch it in their own language and choose from a far wider range of titles, including films from small countries that would rarely appear in a local cinema. For people who live far from a town, or who cannot easily afford tickets, streaming has made films much more accessible. Some critics worry, though, that watching on a small phone screen is changing how films are made, with more close-ups and fewer wide, detailed scenes.

[E] Most experts now believe that the two will continue side by side. Film studios increasingly release new films in cinemas first and then make them available online a few weeks later. As one cinema manager explained, "People still cook at home, but they also go to restaurants. Films are the same. Home is convenient, but the cinema is an event."`;

const PART2 = {
  title: 'Is the cinema still worth it?',
  text: TEXT,
  groups: [
    { type: 'MULTIPLE_CHOICE', instruction: 'Questions 11 to 15. Which paragraph contains the following information? Choose the correct paragraph, A to E.', questions: [
      mc('A comparison between going to the cinema and eating at a restaurant', PARA, 'E', 'Paragraph E: "People still cook at home, but they also go to restaurants. Films are the same."', ['People still cook at home, but they also go to restaurants']),
      mc('An experiment about how often people laugh', PARA, 'C', 'Paragraph C: viewers in a full room "laughed far more often than those who watched the same film alone".', ['laughed far more often than those who watched the same film alone']),
      mc('Changes that cinemas have made to attract audiences', PARA, 'B', 'Paragraph B: reclining seats, giant screens, powerful sound and full meals.', ['Cinema owners have also changed the experience']),
      mc('A worry about how films are made for small screens', PARA, 'D', 'Paragraph D: critics worry about "more close-ups and fewer wide, detailed scenes".', ['watching on a small phone screen is changing how films are made']),
      mc('A prediction that cinemas would disappear', PARA, 'A', 'Paragraph A: "many people predicted the end of the cinema".', ['many people predicted the end of the cinema']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: 'Questions 16 to 19. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questions: [
      tf('During the pandemic, cinemas around the world had to close.', 'TRUE', '"cinemas around the world were forced to close"', ['cinemas around the world were forced to close']),
      tf('Audiences have returned to cinemas mainly for small, serious films.', 'FALSE', 'They returned "especially for large action films and animated stories made for families".', ['especially for large action films and animated stories made for families']),
      tf('Some cinemas now serve full meals during the film.', 'TRUE', '"some cinemas serve full meals during the film"', ['some cinemas serve full meals during the film']),
      tf('Most people who use streaming services watch films on their phones.', 'NOT GIVEN', 'The text mentions phone screens but does not say how most people watch.', []),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: 'Questions 20 to 22. Choose the correct letter, A, B, C or D.', questions: [
      mc('According to psychologists, why do people feel emotions more strongly in a cinema?', ['The screen is bigger', 'They watch with a crowd', 'The sound is louder', 'The films are better'], 'B', '"Watching a film with a crowd is a social experience. When an audience laughs, screams or cries together, each person feels the emotion more strongly."', ['When an audience laughs, screams or cries together, each person feels the emotion more strongly']),
      mc('Which of these is NOT given as an advantage of streaming?', ['You can pause a film', 'You can watch in your own language', 'There is a wider choice of films', 'The screen is bigger'], 'D', 'Paragraph D lists pausing, your own language and a wider range. A bigger screen is an advantage of the cinema, not streaming.', ['Viewers can pause a film, watch it in their own language and choose from a far wider range of titles']),
      mc('What do most experts believe about the future?', ['Cinemas will close', 'Streaming will end', 'Cinemas and streaming will continue together', 'New films will only be shown online'], 'C', '"the two will continue side by side"', ['the two will continue side by side']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: 'Questions 23 to 25. Complete the sentences. Write ONE WORD from the text for each answer.', wordLimit: 'ONE WORD', questions: [
      sc('A dark cinema removes ________, so people pay closer attention to the story.', 'DISTRACTIONS', '"A dark cinema also removes distractions"', ['A dark cinema also removes distractions']),
      sc('Streaming has made films much more ________ for people who live far from a town.', 'ACCESSIBLE', '"streaming has made films much more accessible"', ['streaming has made films much more accessible']),
      sc('The cinema manager said that home is convenient, but the cinema is an ________.', 'EVENT', '"the cinema is an event"', ['the cinema is an event']),
    ] },
  ],
};

const NEW_TIME = 40;
const NEW_INSTRUCTIONS = 'Two texts and 25 questions. Part 1: questions 1 to 10. Part 2: questions 11 to 25. Read each text, then answer the questions.';

// Adds Part 2 to the live GE Reading 008 once. Safe to run on every start.
async function upgradePaper8(prisma) {
  const paper = await prisma.paper.findFirst({ where: { paperCode: 'GE-C8R', testType: 'READING' }, include: { passages: { select: { passageNumber: true } } } });
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

module.exports = { PART2, NEW_TIME, NEW_INSTRUCTIONS, upgradePaper8 };
