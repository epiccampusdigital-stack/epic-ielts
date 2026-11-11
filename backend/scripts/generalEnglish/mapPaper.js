// General English reading paper with a map: a new college campus described in mixed tenses.
// 20 questions: map labelling (1-7), verb forms from the text (8-13), True/False/Not Given (14-17),
// sentence completion (18-20). The map image is backend/public-media/ge-map-greenhill-campus.png
// (drawn by mapGreenhill.py). Stars: 3 = B1. All content is original; the college is fictional.

const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const tf = (content, answer, explanation, ev) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => `Letter ${l}`);

const TEXT = `Last year, Greenhill Language College moved to a new campus on the edge of the city. The old campus was in a crowded street in the city centre. It had only one building, there was no garden, and students had to eat at small restaurants nearby. The new campus is much bigger, and most students say it has changed their daily life.

When you arrive, you enter through the main gate on Station Road. A bus stop has been added just outside the gate, on the right, so students who live in the city can travel to class easily. On the left of the main gate there is a large car park for staff and visitors.

From the gate, a wide path goes straight north to the fountain, which is in the centre of the campus. The teaching building stands directly behind the fountain. It has twenty classrooms and a language laboratory. The library is the building to the west of the fountain, opposite the cafeteria, which is to the east. The cafeteria opened in March and now serves three meals a day, so students who live on campus do not have to cook.

The two dormitory buildings are in the north-east corner of the campus, next to the river. Each room is shared by two students. A small wooden bridge across the river was built in the summer, and it leads to a walking path along the water.

In the north-west corner, there is a sports centre with a gym and a basketball court. It was finished in January, before the new term began. Between the sports centre and the library there is a garden, which the students planted themselves during their first month.

At the moment, the medical room is inside the teaching building, on the ground floor. However, the college is going to build a separate health centre next year, on the empty land beside the car park. A swimming pool will also be added in the future, although no date has been decided yet.

The college director, Ms Kim, says the move has been a great success. "Our students used to study in noisy, dark rooms. Now they have space, light and fresh air. Since we moved, the number of students has grown from two hundred to three hundred and fifty."`;

const mapPaper = {
  code: 'GE-C13R', testType: 'READING', title: 'Reading · A new campus map', timeLimitMin: 30, difficulty: 3, topic: 'Maps and places',
  instructions: 'One text, a map and 20 questions. Read the text and look at the map, then answer the questions.',
  passages: [{ title: 'Greenhill Language College: a new campus', text: TEXT, groups: [
    { type: 'MULTIPLE_CHOICE', imageUrl: '/media/ge-map-greenhill-campus.png',
      instruction: 'Questions 1 to 7. Look at the map. Which letter, A to I, shows each place? Choose the correct letter. There are two letters you will not use.',
      questions: [
        mc('The bus stop', LETTERS, 'A', 'The bus stop is "just outside the gate, on the right".', ['A bus stop has been added just outside the gate, on the right']),
        mc('The library', LETTERS, 'B', 'The library is "to the west of the fountain".', ['The library is the building to the west of the fountain']),
        mc('The cafeteria', LETTERS, 'C', 'The cafeteria is "to the east" of the fountain, opposite the library.', ['opposite the cafeteria, which is to the east']),
        mc('The dormitories', LETTERS, 'D', '"in the north-east corner of the campus, next to the river"', ['The two dormitory buildings are in the north-east corner of the campus, next to the river']),
        mc('The sports centre', LETTERS, 'F', '"In the north-west corner, there is a sports centre"', ['In the north-west corner, there is a sports centre']),
        mc('The garden', LETTERS, 'G', '"Between the sports centre and the library there is a garden"', ['Between the sports centre and the library there is a garden']),
        mc('The place where the new health centre will be built', LETTERS, 'H', '"on the empty land beside the car park"', ['on the empty land beside the car park']),
      ] },
    { type: 'MULTIPLE_CHOICE', instruction: 'Questions 8 to 13. Choose the correct verb form, A, B, C or D, to complete each sentence. Use the text to help you.', questions: [
      mc('Greenhill Language College ________ to a new campus last year.', ['moves', 'moved', 'has moved', 'will move'], 'B', 'Past simple: a finished action at a finished time ("last year").', ['Last year, Greenhill Language College moved to a new campus']),
      mc('A bus stop ________ just outside the gate.', ['has been added', 'adds', 'is adding', 'was adding'], 'A', 'Present perfect passive: something done recently, with a result now.', ['A bus stop has been added just outside the gate']),
      mc('The cafeteria ________ in March.', ['has opened', 'opens', 'opened', 'will open'], 'C', 'Past simple with a finished time ("in March").', ['The cafeteria opened in March']),
      mc('Next year, the college ________ a separate health centre.', ['built', 'has built', 'is going to build', 'builds'], 'C', 'be going to + verb: a plan for the future ("next year").', ['the college is going to build a separate health centre next year']),
      mc('Since the college moved, the number of students ________ .', ['grew', 'has grown', 'grows', 'is growing to'], 'B', 'Present perfect with "since": from a time in the past until now.', ['the number of students has grown']),
      mc('At the old campus, students ________ in noisy, dark rooms.', ['used to study', 'use to study', 'are studying', 'have studied'], 'A', 'used to + verb: a past habit or situation that is not true now.', ['Our students used to study in noisy, dark rooms']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: 'Questions 14 to 17. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questions: [
      tf('The old campus had a garden.', 'FALSE', '"there was no garden"', ['there was no garden']),
      tf('The sports centre was ready before the new term began.', 'TRUE', '"It was finished in January, before the new term began."', ['It was finished in January, before the new term began']),
      tf('The swimming pool will open next year.', 'FALSE', 'No date has been decided for the pool. It is the health centre that will be built next year.', ['although no date has been decided yet']),
      tf('Most of the teachers live on the campus.', 'NOT GIVEN', 'The text does not say where the teachers live.', []),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: 'Questions 18 to 20. Complete the sentences. Write ONE WORD from the text for each answer.', wordLimit: 'ONE WORD', questions: [
      sc('The teaching building has twenty classrooms and a language ________.', 'LABORATORY', '"It has twenty classrooms and a language laboratory."', ['It has twenty classrooms and a language laboratory']),
      sc('The students planted the garden during their first ________.', 'MONTH', '"which the students planted themselves during their first month"', ['during their first month']),
      sc('The wooden bridge leads to a walking ________ along the water.', 'PATH', '"it leads to a walking path along the water"', ['it leads to a walking path along the water']),
    ] },
  ] }],
};

module.exports = { MAP_PAPERS: [mapPaper] };
