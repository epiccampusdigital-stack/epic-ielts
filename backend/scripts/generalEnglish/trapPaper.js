// General English reading paper, 4 stars (B1+): "a little harder, easy to teach".
// The words are everyday words; the difficulty is in the small things students miss:
// numbers that are mentioned but are not the answer, "not" and "only", plurals, plans that changed,
// "except", and one small sum (two hours earlier than 11 p.m.). 2 parts, 20 questions, 30 minutes.
// Part 1: an article (12 questions). Part 2: a dormitory notice (8 questions). All content is original.

const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const tf = (content, answer, explanation, ev) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });
const MC = (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B, C or D.`;
const TF = (a, b) => `Questions ${a} to ${b}. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.`;

const T1 = `Most teenagers and young adults now take their phones to bed. In a survey of 2,000 university students in South Korea, almost nine out of ten said they used their phone in the last hour before sleeping, and about half said they sometimes woke up at night to check messages. Only a small number, around one in ten, left their phone in another room.

Doctors say the problem is not only the light from the screen. It is true that blue light can make the brain think it is still daytime, but most phones now have a night mode that reduces it. The bigger problem, experts say, is what we do on the phone. Videos, games and messages keep the brain busy and excited, so it takes longer to fall asleep.

Losing sleep has clear effects. Students who sleep less than six hours a night find it harder to concentrate, and their memory is weaker. They are also more likely to feel stressed. However, one extra hour of sleep does not make a person more intelligent; it simply helps the brain to work as well as it can.

So what can people do? Sleep experts do not say that phones must be banned. Instead, they suggest a few simple changes. Stop using the phone thirty minutes before bed, not ten. Buy a cheap alarm clock so that the phone can stay outside the bedroom. And if you wake up at night, do not check the time: looking at the screen, even for a second, makes it harder to fall asleep again.

Some students who tried these changes for two weeks said that the first three nights were the hardest. After that, most of them fell asleep faster and felt less tired in the morning. Not everyone was happy, though. A few said they felt worried about missing important messages, especially from their families abroad.`;

const T2 = `SUNRISE DORMITORY: IMPORTANT CHANGES FROM MONDAY 1 DECEMBER

Dear residents,
Please read these changes carefully.

Kitchen: The shared kitchen on the ground floor will now close at 10.30 p.m. instead of 11 p.m. Please do not leave food in the fridge for more than three days. Food with no name on it will be thrown away every Friday.

Laundry: The washing machines are still free to use, but the dryers now cost 1,000 won for 40 minutes. You can pay only with a laundry card, not cash. Cards are sold at reception.

Visitors: Visitors may come between 9 a.m. and 8 p.m. every day except Sunday, when the dormitory is closed to all visitors. All visitors must show an ID card at reception.

Quiet hours: Quiet hours start at 11 p.m. and finish at 7 a.m. During the exam week (15 to 19 December), quiet hours will start two hours earlier.

Wi-Fi: The new password will be sent to you by email on 30 November. Please do not share it with visitors.

If you have any questions, please speak to Mr Lee at reception, not to the cleaning staff.

Thank you,
The Dormitory Office`;

const trapPaper = {
  code: 'GE-C14R', testType: 'READING', title: 'Reading · Phones, sleep and a dormitory notice', timeLimitMin: 30, difficulty: 4, topic: 'Daily life and health',
  instructions: 'Two parts and 20 questions, 30 minutes. Part 1: an article (questions 1 to 12). Part 2: a notice (questions 13 to 20). Read every question carefully: small words like "not", "only" and "-s" matter.',
  passages: [
    { title: 'Is your phone stealing your sleep?', text: T1, groups: [
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(1, 5), questions: [
        tf('Most of the students in the survey used their phones in the hour before sleeping.', 'TRUE', '"almost nine out of ten" is most of them.', ['almost nine out of ten said they used their phone in the last hour before sleeping']),
        tf('About half of the students left their phones in another room.', 'FALSE', 'Only "around one in ten" left the phone in another room. "About half" is the number who woke up to check messages.', ['Only a small number, around one in ten, left their phone in another room']),
        tf('Experts say blue light is the biggest problem.', 'FALSE', '"The bigger problem, experts say, is what we do on the phone."', ['The bigger problem, experts say, is what we do on the phone']),
        tf('Students who use night mode sleep better than other students.', 'NOT GIVEN', 'The text says night mode reduces blue light, but it never compares students who use it with students who do not.', []),
        tf('One extra hour of sleep makes a person more intelligent.', 'FALSE', 'The text says the opposite: it "does not make a person more intelligent".', ['one extra hour of sleep does not make a person more intelligent']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: MC(6, 9), questions: [
        mc('What do sleep experts say about phones?', ['Phones must be banned at night', 'People can make a few simple changes', 'Only night mode can solve the problem', 'Students should buy a new phone'], 'B', '"Sleep experts do not say that phones must be banned. Instead, they suggest a few simple changes." Option A is the trap: it is what they do NOT say.', ['Instead, they suggest a few simple changes']),
        mc('When should you stop using your phone?', ['Ten minutes before bed', 'Twenty minutes before bed', 'Thirty minutes before bed', 'One hour before bed'], 'C', '"Stop using the phone thirty minutes before bed, not ten." Ten is in the text, but it is the wrong number.', ['Stop using the phone thirty minutes before bed, not ten']),
        mc('Why should you not check the time if you wake up at night?', ['The clock may be wrong', 'Looking at the screen makes it harder to sleep again', 'The light may wake up other people', 'It uses the phone battery'], 'B', '"looking at the screen, even for a second, makes it harder to fall asleep again".', ['looking at the screen, even for a second, makes it harder to fall asleep again']),
        mc('Which nights were the hardest for the students who tried the changes?', ['The first night only', 'The first three nights', 'The nights after two weeks', 'The weekend nights'], 'B', '"the first three nights were the hardest". Two weeks is how long they tried the changes.', ['the first three nights were the hardest']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: 'Questions 10 to 12. Complete the sentences. Write ONE WORD from the text for each answer.', wordLimit: 'ONE WORD', questions: [
        sc('Students who sleep less than six hours find it harder to ________.', 'CONCENTRATE', '"find it harder to concentrate".', ['find it harder to concentrate']),
        sc('Experts suggest buying a cheap alarm ________ so that the phone can stay outside the bedroom.', 'CLOCK', '"Buy a cheap alarm clock".', ['Buy a cheap alarm clock']),
        sc('A few students worried about missing messages from their ________ abroad.', 'FAMILIES', '"their families abroad": plural, with -ies. "family" is not correct here.', ['especially from their families abroad']),
      ] },
    ] },
    { title: 'A notice in the dormitory', text: T2, groups: [
      { type: 'SENTENCE_COMPLETION', instruction: 'Questions 13 to 20. Complete the notes. Write ONE WORD AND/OR A NUMBER from the notice for each answer.', wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
        sc('From 1 December, the kitchen closes at ________ p.m.', '10.30|10:30|1030', '"will now close at 10.30 p.m. instead of 11 p.m." 11 is the OLD time.', ['will now close at 10.30 p.m. instead of 11 p.m']),
        sc('Food without a ________ on it is thrown away every Friday.', 'NAME', '"Food with no name on it will be thrown away every Friday."', ['Food with no name on it will be thrown away every Friday']),
        sc('The dryers cost 1,000 won for ________ minutes.', '40|FORTY', '"the dryers now cost 1,000 won for 40 minutes". (The washing machines are free.)', ['the dryers now cost 1,000 won for 40 minutes']),
        sc('You can pay for the dryers with a laundry ________ only.', 'CARD', '"You can pay only with a laundry card, not cash."', ['You can pay only with a laundry card, not cash']),
        sc('Visitors cannot come on ________.', 'SUNDAY|SUNDAYS', '"every day except Sunday, when the dormitory is closed to all visitors".', ['every day except Sunday, when the dormitory is closed to all visitors']),
        sc('During the exam week, quiet hours start at ________ p.m.', '9|9.00|9:00|NINE', 'Quiet hours normally start at 11 p.m., and in exam week they start "two hours earlier": 11 − 2 = 9 p.m. The number 9 is not written for this, so students must work it out.', ['quiet hours will start two hours earlier']),
        sc('The new Wi-Fi password will arrive by ________.', 'EMAIL|E-MAIL', '"will be sent to you by email on 30 November".', ['The new password will be sent to you by email on 30 November']),
        sc('If you have a question, you should speak to Mr ________.', 'LEE', '"please speak to Mr Lee at reception, not to the cleaning staff".', ['please speak to Mr Lee at reception, not to the cleaning staff']),
      ] },
    ] },
  ],
};

function checkTrapPaper() {
  const errs = []; let n = 0;
  trapPaper.passages.forEach(ps => ps.groups.forEach(g => g.questions.forEach(q => {
    n++;
    (q.ev || []).forEach(e => { if (!ps.text.includes(e)) errs.push(`Q${n}: not in text: ${e}`); });
    if (q.options && q.answer.charCodeAt(0) - 65 >= q.options.length) errs.push(`Q${n}: bad answer`);
  })));
  if (n !== 20) errs.push(`${n} questions, not 20`);
  return errs;
}

module.exports = { TRAP_PAPERS: [trapPaper], checkTrapPaper };
