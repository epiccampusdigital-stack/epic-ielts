// FINAL EXAM (Exam tab, Sun 29 Nov), Part 1: LISTENING. Real IELTS layout: 4 parts, 40 questions.
// Same level as the Midway exam (about 5.5 out of 10): clear voices, normal speed, and the usual IELTS traps
// (a speaker corrects himself, a plan that changed, a number that is mentioned but is not the answer).
// Each recording can be played twice on the site. Scripts are written for recording in Google AI Studio:
// each line starts with the speaker; [PAUSE n] = n seconds of silence (added when the clips are joined).
const { mc, sc } = require('./kit');

const FORM = (a, b, limit) => `Questions ${a} to ${b}. Complete the form below. Write ${limit} for each answer.`;
const MC3 = (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B or C.`;
const NOTES = (a, b, limit) => `Questions ${a} to ${b}. Complete the notes below. Write ${limit} for each answer.`;

const S1 = `NARRATOR: Part 1. You will hear a conversation between a student and an office assistant at a language school. First, you have some time to look at questions 1 to 10.
[PAUSE 30]
NARRATOR: You will see that there is an example that has been done for you. On this occasion only, the conversation relating to this will be played first.
ASSISTANT: Good morning, Seoul Language Centre. How can I help?
KAVINDU: Hello. I'd like to sign up for a Korean course, please. The course for beginners.
ASSISTANT: Of course, the beginners' course.
NARRATOR: The student wants the beginners' course, so "beginners" has been written in the space. Now we shall begin. Listen carefully and answer questions 1 to 10.
ASSISTANT: Good morning, Seoul Language Centre. How can I help?
KAVINDU: Hello. I'd like to sign up for a Korean course, please. The course for beginners.
ASSISTANT: Of course, the beginners' course. Can I have your name?
KAVINDU: Yes, it's Kavindu Ranatunga.
ASSISTANT: How do you spell your surname?
KAVINDU: R, A, N, A, T, U, N, G, A.
ASSISTANT: Thank you. And a mobile number?
KAVINDU: It's 010 5582 3906. Oh, sorry, that's my old number. The new one is 010 5582 3960.
ASSISTANT: 3960. Got it. Now, you said beginners, but have you studied any Korean before?
KAVINDU: A little. I did a short course in Sri Lanka, and I can read Hangul.
ASSISTANT: Then the beginners' class might be too easy for you. I think the elementary class would be better. It starts with simple conversation, not the alphabet.
KAVINDU: OK, I'll go for elementary, then.
ASSISTANT: Now, we have morning, afternoon and evening classes. The morning class is full, I'm afraid.
KAVINDU: What about the afternoon?
ASSISTANT: The afternoon class is from two to four.
KAVINDU: Hmm, I have lectures until three on most days. So the evening class is better for me.
ASSISTANT: Fine. The evening class meets twice a week, on Tuesdays and Fridays.
KAVINDU: Tuesdays and Fridays. That's fine.
ASSISTANT: The fee for ten weeks is five hundred thousand won. But are you a scholarship student?
KAVINDU: Yes, I have a government scholarship.
ASSISTANT: Then you get a discount. For scholarship students, it's four hundred and fifty thousand.
KAVINDU: Great.
ASSISTANT: You'll need a textbook. You don't have to buy it. You can collect it from the library on the second floor.
KAVINDU: The library, OK.
ASSISTANT: And please bring your passport to the first class, so the teacher can check your visa.
KAVINDU: My passport. No problem. Who is the teacher?
ASSISTANT: Your teacher is Ms Yoon. That's Y, O, O, N.
KAVINDU: And which room is it in?
ASSISTANT: Room 241. Oh, wait, they've moved the evening classes this term. It's Room 214 now, on the same floor.
KAVINDU: 214. Thank you very much.
NARRATOR: That is the end of Part 1. You now have half a minute to check your answers.
[PAUSE 30]`;

const S2 = `NARRATOR: Part 2. You will hear a staff member talking to new students about their university dormitory. First, you have some time to look at questions 11 to 15.
[PAUSE 30]
NARRATOR: Now listen carefully and answer questions 11 to 15.
MANAGER: Hello, everyone, and welcome to Hanbit Hall. My name is Mr Choi, and I'm the dormitory manager. I'll explain a few important things about living here.
First, your room keys. The information pack says you can collect your key from my office, but that has changed. This year, keys are given out at the security desk next to the main entrance, and it's open twenty-four hours.
Now, about cleaning. Each room has a cleaning rota, and the cleaners only clean the shared areas, like the corridors and bathrooms. So you are responsible for your own room. We check every room once a month.
Some of you have asked about cooking. You can't cook in your bedroom, because of the fire risk. But there's a shared kitchen on each floor, and it's open from six in the morning until midnight.
Visitors are welcome, but only until nine in the evening, and they must sign in at the security desk. Your friends can't stay overnight, I'm afraid.
Finally, the internet. The Wi-Fi is free, and it's quite fast. But if you want to play online games or watch films, you'll get a better connection with a cable. You can borrow one from the security desk.
NARRATOR: Before you hear the rest of the talk, you have some time to look at the map for questions 16 to 20.
[PAUSE 30]
NARRATOR: Now listen and answer questions 16 to 20.
MANAGER: Now, please look at the map of the ground floor and the area around the building. We're standing at the main entrance, at the bottom of the map. The security desk is just inside the entrance, on your right.
Walk straight in until you reach the corridor that goes from left to right. If you turn left and walk to the end of that corridor, the laundry room is the last room on your right. The washing machines are free, but the dryers cost five hundred won.
Opposite the laundry room, on the other side of the corridor, is the study room. It's always quiet, and it's open all night, so it's popular during exams.
If you don't turn at the corridor, and you go straight on past the lifts, you'll come to the big room at the very back of the building. That's the common room. It has a big TV and a piano, and that's where we'll have the welcome party on Friday.
Now, the gym. Go back to the corridor and turn right. The gym is the first room on your right. Please don't go into the room opposite it, on the left. That's a storeroom, and it's locked. The gym is free, but you have to book a time online.
And finally, the bicycle shelter. Last year it was at the side of the building, next to the car park, but it's been moved. Now it's behind the building, next to the garden. It's covered, so your bike won't get wet, but it isn't locked, so bring your own lock.
NARRATOR: That is the end of Part 2. You now have half a minute to check your answers.
[PAUSE 30]`;

const S3 = `NARRATOR: Part 3. You will hear two students, Maya and Tom, talking about a survey they are planning on students' part-time jobs. First, you have some time to look at questions 21 to 25.
[PAUSE 30]
NARRATOR: Now listen carefully and answer questions 21 to 25.
MAYA: Hi Tom. Shall we finish planning the survey? We have to hand in the questions on Thursday.
TOM: Sure. First, how many students should we ask? Our tutor said at least fifty.
MAYA: I think we should aim for a hundred. Fifty isn't very many if we want to compare different subjects.
TOM: A hundred is a lot, but OK, let's try.
MAYA: And how should we give out the survey? I was thinking of handing out paper copies in the library.
TOM: That takes a long time, and lots of people say no. An online form is quicker. We can share the link in the student group chats.
MAYA: True. Let's do it online.
TOM: Now, the main question. When we started, we wanted to find out how much money students earn. But I think the more interesting question is how part-time work affects their studies.
MAYA: I agree. Our tutor said that too. Money is only one part of it.
TOM: So what did you find when you read the research?
MAYA: Well, most studies say that working a few hours a week is fine. Some even say students who work up to ten hours a week get better marks, because they manage their time better. The problems start when students work more than fifteen hours.
TOM: That's surprising. I thought any job would be bad for your marks.
MAYA: So did I. That's why it's a good topic.
NARRATOR: Before you hear the rest of the conversation, you have some time to look at questions 26 to 30.
[PAUSE 30]
NARRATOR: Now listen and answer questions 26 to 30.
TOM: OK, let's go through the question ideas on our list and decide what to do with each one. The first idea is to ask what kind of job they do.
MAYA: That's important. Let's keep that as it is.
TOM: The next one is to ask how much they earn per hour.
MAYA: Hmm, some people don't like saying how much they earn. And we decided money isn't our focus. Let's take that one out.
TOM: Fine. Then there's the question about how many hours they work each week.
MAYA: We need that one, but let's change it. Instead of asking people to write a number, we could give them choices, like zero to five hours, five to ten, and so on.
TOM: Good idea. That's easier to analyse. What about the question on their exam results?
MAYA: Some people won't want to share their grades. Let's change it to how they feel about their studies, from one to five.
TOM: OK. And the last one: why they started working.
MAYA: That's a good question. Keep it.
TOM: Great. I'll make the online form tonight.
NARRATOR: That is the end of Part 3. You now have half a minute to check your answers.
[PAUSE 30]`;

const S4 = `NARRATOR: Part 4. You will hear part of a lecture about a traditional Korean heating system called ondol. First, you have some time to look at questions 31 to 40.
[PAUSE 45]
NARRATOR: Now listen carefully and answer questions 31 to 40.
LECTURER: Good morning. Today we're looking at ondol, the traditional Korean way of heating a home. The word ondol means "warm stone", and that tells you a lot about how it works.
In a traditional house, the fire was in the kitchen, which was a little lower than the rest of the house. The fire was used for cooking, but the hot smoke didn't go straight up a chimney. Instead, it travelled through channels under the floor of the next room. These channels were covered with flat stones, and the stones were covered with clay and thick oiled paper. As the smoke passed underneath, the stones became hot, and they stayed warm for many hours, even after the fire went out. At the far end of the house, the smoke finally left through the chimney.
This system had a big effect on daily life. Because the floor was the warmest place in the room, Koreans traditionally sat, ate and slept on the floor rather than on chairs and beds. Even today, many Korean families like to sleep on a thin mattress on the floor.
There were some problems, of course. The system used a lot of wood, and in some areas this led to the loss of forests. There was also a danger from the smoke. If the floor was cracked, gas could leak into the room, and this could be deadly.
In the modern version, there is no smoke at all. Instead, hot water runs through plastic pipes under the floor. The water is heated by a boiler, usually powered by gas. Almost all apartments in Korea now have this kind of underfloor heating.
Why is ondol so efficient? The main reason is that warm air rises. With most heaters, the warm air goes up to the ceiling, so the top of the room is hot but the floor stays cold. With ondol, the heat starts at the floor, where people are, so the whole room feels comfortable at a lower temperature. And because the floor holds heat for a long time, the room stays warm.
Interestingly, underfloor heating has now become popular in other countries too, especially in northern Europe. And in 2023, ondol was officially recognised as part of Korea's national heritage.
NARRATOR: That is the end of Part 4. You now have half a minute to check your answers.
[PAUSE 30]
NARRATOR: That is the end of the listening test.`;

// Q16-20: map labelling. Fixed layout (see the map prompt): A front-left room, B back-left corner, C big room at the back centre,
// D back-right room (storeroom), E front-right room, F outside behind the building by the garden, G outside at the side by the car park, H outside in front, left of the entrance path.
const MAP_IMG = '/media/ielts-exam3-map.png';
const MAP_OPTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const MAP_INSTR = 'Questions 16 to 20. Label the map below. Choose the correct letter, A to H, for each place.';
const PLACES_OPTS = ['It is open all night', 'It costs money to use part of it', 'You must book a time', 'A party will be held there', 'It is not locked', 'It is closed at weekends', 'Staff will clean it for you'];
const DECIDE = ['Keep it as it is', 'Change it', 'Take it out'];

const LISTENING = {
  code: 'EX3-L', testType: 'LISTENING', title: 'Final Exam · Part 1 of 3 · Listening', timeLimitMin: 40, difficulty: 3, topic: 'Final Exam',
  instructions: 'Final Exam, Part 1 of 3: Listening. Four parts and 40 questions, 40 minutes. You can play the recording for each part twice: use the first play to answer and the second to check. Read the questions before you press play. When the time is up, your answers are sent and Reading starts after a short countdown.',
  audioScript: JSON.stringify({ 1: S1, 2: S2, 3: S3, 4: S4, voices: { NARRATOR: 'male:Charon', ASSISTANT: 'female:Kore', KAVINDU: 'male:Puck', MANAGER: 'male:Iapetus', MAYA: 'female:Aoede', TOM: 'male:Achird', LECTURER: 'female:Erinome' } }),
  sections: [
    { number: 1, description: 'Signing up for a Korean course', groups: [
      { type: 'SENTENCE_COMPLETION', instruction: FORM(1, 10, 'ONE WORD AND/OR A NUMBER') + " Example: Course: beginners", wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
        sc('Surname: ________', 'RANATUNGA', 'He spells it: R, A, N, A, T, U, N, G, A.', ['R, A, N, A, T, U, N, G, A']),
        sc('Mobile: 010 5582 ________', '3960', '"that\'s my old number. The new one is 010 5582 3960". (3906 is the old number.)', ['The new one is 010 5582 3960']),
        sc('Level of class: ________', 'ELEMENTARY', 'He changes from beginners: "I\'ll go for elementary, then."', ["OK, I'll go for elementary, then"]),
        sc('Time of class: ________', 'EVENING', 'Morning is full and he has lectures until three: "the evening class is better for me".', ['So the evening class is better for me']),
        sc('Class days: Tuesdays and ________', 'FRIDAYS|FRIDAY', '"on Tuesdays and Fridays".', ['on Tuesdays and Fridays']),
        sc('Fee: ________ won', '450,000|450000|450 000|FOUR HUNDRED AND FIFTY THOUSAND', 'Scholarship discount: "it\'s four hundred and fifty thousand". (500,000 is the normal fee.)', ["For scholarship students, it's four hundred and fifty thousand"]),
        sc('Collect the textbook from the ________', 'LIBRARY', '"You can collect it from the library on the second floor."', ['You can collect it from the library on the second floor']),
        sc('Bring to the first class: ________', 'PASSPORT|PASSPORTS|HIS PASSPORT', '"please bring your passport to the first class".', ['please bring your passport to the first class']),
        sc('Teacher: Ms ________', 'YOON', 'She spells it: Y, O, O, N.', ['Y, O, O, N']),
        sc('Room: ________', '214', 'The room moved: "It\'s Room 214 now". (241 is the old room.)', ["It's Room 214 now"]),
      ] },
    ] },
    { number: 2, description: 'Living in Hanbit Hall', groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC3(11, 15), questions: [
        mc('Where can students collect their room key?', ["The manager's office", 'The security desk', 'The information office'], 'B', '"This year, keys are given out at the security desk". (The office was the old plan.)', ['keys are given out at the security desk']),
        mc('Who cleans the students\' bedrooms?', ['The students', 'The cleaners', 'The dormitory manager'], 'A', 'The cleaners "only clean the shared areas", so "you are responsible for your own room".', ['you are responsible for your own room']),
        mc('Students can cook', ['in their bedrooms', 'in a kitchen on each floor', 'only until nine in the evening'], 'B', '"there\'s a shared kitchen on each floor". (Nine in the evening is the time for visitors.)', ["there's a shared kitchen on each floor"]),
        mc('What is the rule about visitors?', ['They must leave by 9 p.m.', 'They can stay one night', 'They must show an ID card'], 'A', '"only until nine in the evening". They must sign in, but an ID card is not mentioned.', ['only until nine in the evening']),
        mc('What does Mr Choi say about the internet?', ['The Wi-Fi costs extra', 'A cable gives a better connection', 'Online games are not allowed'], 'B', '"you\'ll get a better connection with a cable".', ["you'll get a better connection with a cable"]),
      ] },
      { type: 'MULTIPLE_CHOICE', imageUrl: MAP_IMG, instruction: MAP_INSTR, questions: [
        mc('Laundry room', MAP_OPTS, 'B', 'Turn left at the corridor, walk to the end: "the last room on your right". A is on the left side, opposite.', ['the laundry room is the last room on your right']),
        mc('Study room', MAP_OPTS, 'A', '"Opposite the laundry room, on the other side of the corridor".', ['Opposite the laundry room, on the other side of the corridor, is the study room']),
        mc('Common room', MAP_OPTS, 'C', 'Straight on past the lifts: "the big room at the very back of the building".', ['the big room at the very back of the building']),
        mc('Gym', MAP_OPTS, 'E', 'Turn right: "the first room on your right". D, opposite on the left, is the locked storeroom.', ['The gym is the first room on your right']),
        mc('Bicycle shelter', MAP_OPTS, 'F', 'It moved: "Now it\'s behind the building, next to the garden". G (beside the car park) was last year.', ["Now it's behind the building, next to the garden"]),
      ] },
    ] },
    { number: 3, description: 'Planning a survey on part-time jobs', groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC3(21, 25), questions: [
        mc('How many students do Maya and Tom decide to ask?', ['50', '100', '150'], 'B', 'Maya: "I think we should aim for a hundred." Tom agrees. (50 is the tutor\'s minimum.)', ["A hundred is a lot, but OK, let's try"]),
        mc('How will they give out the survey?', ['On paper in the library', 'Online', 'In lectures'], 'B', 'Tom: "An online form is quicker." Maya: "Let\'s do it online."', ["Let's do it online"]),
        mc('What is now the main focus of their survey?', ['How much money students earn', 'How work affects students\' studies', 'Why students choose part-time jobs'], 'B', '"the more interesting question is how part-time work affects their studies". (Money was the first idea.)', ['how part-time work affects their studies']),
        mc('According to the research Maya read, students who work up to ten hours a week', ['may get better marks', 'often feel tired in class', 'earn more than they need'], 'A', '"students who work up to ten hours a week get better marks".', ['students who work up to ten hours a week get better marks']),
        mc('What did Maya and Tom think before they read the research?', ['Most students had a job', 'Any job would harm students\' marks', 'Long hours were not a problem'], 'B', 'Tom: "I thought any job would be bad for your marks." Maya: "So did I."', ['I thought any job would be bad for your marks']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 26 to 30. What do Maya and Tom decide to do with each question idea? Choose A (keep it as it is), B (change it) or C (take it out).', questions: [
        mc('What kind of job they do', DECIDE, 'A', '"Let\'s keep that as it is."', ["Let's keep that as it is"]),
        mc('How much they earn per hour', DECIDE, 'C', '"Let\'s take that one out."', ["Let's take that one out"]),
        mc('How many hours they work each week', DECIDE, 'B', '"We need that one, but let\'s change it." They will give choices instead.', ["We need that one, but let's change it"]),
        mc('Their exam results', DECIDE, 'B', '"Let\'s change it to how they feel about their studies".', ["Let's change it to how they feel about their studies"]),
        mc('Why they started working', DECIDE, 'A', '"That\'s a good question. Keep it."', ["That's a good question. Keep it"]),
      ] },
    ] },
    { number: 4, description: 'Ondol: Korean floor heating', groups: [
      { type: 'SENTENCE_COMPLETION', instruction: NOTES(31, 40, 'ONE WORD ONLY'), wordLimit: 'ONE WORD ONLY', questions: [
        sc('The word ondol means "warm ________".', 'STONE', '"The word ondol means \'warm stone\'".', ['The word ondol means "warm stone"']),
        sc('The fire was in the ________, which was lower than the rest of the house.', 'KITCHEN', '"the fire was in the kitchen".', ['the fire was in the kitchen']),
        sc('Hot ________ travelled through channels under the floor.', 'SMOKE', '"the hot smoke... travelled through channels under the floor".', ['it travelled through channels under the floor']),
        sc('The stones were covered with clay and thick oiled ________.', 'PAPER', '"covered with clay and thick oiled paper".', ['the stones were covered with clay and thick oiled paper']),
        sc('People sat, ate and slept on the ________.', 'FLOOR', '"Koreans traditionally sat, ate and slept on the floor".', ['Koreans traditionally sat, ate and slept on the floor']),
        sc('Problem: the system used a lot of ________.', 'WOOD', '"The system used a lot of wood".', ['The system used a lot of wood']),
        sc('Gas could leak into the room if the floor was ________.', 'CRACKED', '"If the floor was cracked, gas could leak into the room".', ['If the floor was cracked, gas could leak into the room']),
        sc('Modern ondol: hot ________ runs through plastic pipes.', 'WATER', '"hot water runs through plastic pipes under the floor".', ['hot water runs through plastic pipes under the floor']),
        sc('With most heaters, warm air goes up to the ________.', 'CEILING', '"the warm air goes up to the ceiling".', ['the warm air goes up to the ceiling']),
        sc('Underfloor heating is now popular in northern ________.', 'EUROPE', '"especially in northern Europe".', ['especially in northern Europe']),
      ] },
    ] },
  ],
};

function checkListening() {
  const errs = []; let n = 0;
  const scripts = JSON.parse(LISTENING.audioScript);
  LISTENING.sections.forEach(s => s.groups.forEach(g => g.questions.forEach(q => {
    n++;
    (q.ev || []).forEach(e => { if (!scripts[s.number].includes(e)) errs.push(`L Q${n}: not in script: ${e}`); });
    if (q.options && q.answer.charCodeAt(0) - 65 >= q.options.length) errs.push(`L Q${n}: answer outside options`);
  })));
  if (n !== 40) errs.push(`listening has ${n} questions, not 40`);
  return errs;
}

module.exports = { MAP_IMG, MAP_OPTS, MAP_INSTR, LISTENING, checkListening, SCRIPTS: { 1: S1, 2: S2, 3: S3, 4: S4 } };
