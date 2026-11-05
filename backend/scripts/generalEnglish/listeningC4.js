// General English course paper: full Listening test (4 sections, 40 questions), A2-B1 level, original script.
// The site reads each script aloud twice with the device's voices (no audio file needed).
// `ev` = the words in the script that give each answer (used for the teacher answer sheet only).

const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });

const S1 = `Narrator: Section one. You will hear a woman booking a room at a guesthouse. Questions 1 to 10.
Man: Good morning, Lakeside Guesthouse. How can I help you?
Woman: Hello. I'd like to book a room for next month, please.
Man: Of course. Can I have your name?
Woman: Yes, it's Nimali Fernando. That's N, I, M, A, L, I, and Fernando is F, E, R, N, A, N, D, O.
Man: Thank you. And a contact number?
Woman: It's zero seven seven, four five two, nine eight one six.
Man: Zero seven seven, four five two, nine eight one six. Perfect. Which date would you like to arrive?
Woman: The twelfth of December.
Man: And how many nights will you stay?
Woman: Four nights, I think. Actually, can we make it five? I would like to see the lake on the last morning.
Man: Five nights is fine. Would you like a single room or a double room?
Woman: A double room, please. My sister is coming with me.
Man: Good. The double room is ten thousand five hundred rupees a night, and that includes breakfast.
Woman: That sounds fine. What time does breakfast start?
Man: Breakfast is from seven o'clock until nine thirty.
Woman: Lovely. Now, I'm coming by train to Galle station. How do we get to the guesthouse from there?
Man: It's about ten minutes by tuk-tuk. You can also take a bus, but the tuk-tuk is easier with bags.
Woman: Is there anything free for guests?
Man: Yes. We have free Wi-Fi in every room. We also have bicycles, but those are five hundred rupees a day.
Woman: Good to know. Do I need to pay anything now?
Man: Just a deposit of three thousand rupees, to keep the room. You pay the rest when you arrive.
Woman: Okay. I'll send it today. Thank you very much.
Man: Thank you, Ms Fernando. We look forward to seeing you.`;

const S2 = `Narrator: Section two. You will hear the manager of a new sports centre talking to visitors. Questions 11 to 20.
Woman: Good afternoon, everyone, and welcome to the new Hillside Sports Centre. I'm the manager, and I'm very happy to show you around.
Woman: The centre opened in March. Our plan was to have twelve hundred members by the end of the year. But so far, more than two thousand people have joined, so we are very pleased.
Woman: Let me tell you about the opening times. The swimming pool is open from seven in the morning until nine at night. On Mondays the pool closes earlier, at six o'clock. The whole centre is closed on Wednesdays, because that is the day we clean everything.
Woman: A few rules for the pool. Children under twelve must always be with an adult. This is for their safety, so please remember it.
Woman: Now, about prices. Students get a twenty percent discount on the monthly fee, but you must show your student card at the front desk. Adults over sixty get ten percent off.
Woman: If you want to play badminton, you must book a court at least two days in advance. The courts are very popular, especially in the evening.
Woman: In the changing rooms there are lockers. They cost fifty rupees each time, and you get the money back when you return the key.
Woman: On the first floor there is a small cafe. It sells sandwiches, and it also sells fresh fruit juice, which is very popular after swimming.
Woman: Finally, we have a free yoga class every Saturday at eight in the morning. It's for everyone, and you don't need to bring anything.
Woman: If you would like to join today, please go to the reception desk by the main door. Thank you, and enjoy the tour.`;

const S3 = `Narrator: Section three. You will hear two university students, Maya and Ravi, planning a presentation. Questions 21 to 30.
Woman: Hi, Ravi. Have you thought about the presentation?
Man: Yes, Maya. I think plastic bottles are a good topic. Food waste was my first idea, but there is more information about plastic.
Woman: I agree. And we need to be ready soon. Our tutor, Dr Silva, moved it from Tuesday to Thursday, so we have two extra days.
Man: That's helpful. How long is the talk again?
Woman: Fifteen minutes, and then five minutes for questions.
Man: Okay. What should we show? Posters, a short video, or something else?
Woman: Last week we did a survey about plastic bottles on campus. I think we should show the survey results. People like real numbers.
Man: Good idea. I can make the charts. I'm better with the computer than you are.
Woman: Yes, please. I'll write the introduction and start the talk.
Man: Great. And I will do the conclusion. Honestly, I'm a little worried about speaking in English in front of the whole class.
Woman: Don't worry, Ravi. Your English is good. We can practise together tomorrow.
Man: Thanks. What about photos? Pictures of rubbish near the lake would be strong.
Woman: Yes. Let's both take some photos this weekend and choose the best ones together.
Man: Perfect. Should we give the class something to take home?
Woman: A short handout is a good idea. I'll write it, because I have the best printer at home.
Man: Then I'll do the survey results, the conclusion, and the charts. You do the introduction and the handout.
Woman: And the photos are for both of us. Sounds like a plan.`;

const S4 = `Narrator: Section four. You will hear a lecture about sleep. Questions 31 to 40.
Man: Good afternoon, everyone. Today I'm going to talk about sleep, and why it is so important for students.
Man: Let's start with how much sleep we need. Most adults need between seven and nine hours each night. Teenagers need more, up to ten hours, because their bodies are still growing.
Man: What happens while we sleep? During deep sleep, the body repairs itself and produces growth hormone. This is one reason why children and teenagers need so much sleep.
Man: What happens if we don't sleep enough? The most common problem for students is that they find it difficult to concentrate in class. They also forget more easily and feel tired and unhappy.
Man: Many people have trouble falling asleep, and one big reason is the blue light from phones. Looking at your phone in bed tells your brain that it is still daytime, so it is harder to relax.
Man: So what can you do? First, think about what you drink. Coffee can stay in your body for up to six hours, so try not to drink it in the evening. Water or warm milk is a better choice.
Man: Second, try to go to bed at the same time every day, even at weekends. A regular routine is the single best habit for good sleep. Sleeping late on Sundays makes Monday morning harder.
Man: Third, if you feel sleepy in the afternoon, a short nap can help. But keep it to twenty minutes. A longer nap can make it difficult to sleep at night.
Man: Finally, your bedroom matters. The best room for sleeping is cool, dark and quiet.
Man: That's all for today. Next week, we'll look at how exercise affects sleep, so please come ready to discuss it. Thank you for listening.`;

const listening4 = {
  code: 'GE-C4L', testType: 'LISTENING', title: 'Course paper 4 · Listening: full practice test (40 questions)', timeLimitMin: 50,
  instructions: 'Full listening practice test: 4 sections and 40 questions. Press Play to hear each section. You can listen twice. Read the questions before you listen. If the sound does not work, put your hand up and your teacher will read it to you.',
  audioScript: JSON.stringify({ 1: S1, 2: S2, 3: S3, 4: S4 }),
  sections: [
    { number: 1, description: 'A woman books a room at a guesthouse', groups: [
      { type: 'SENTENCE_COMPLETION', instruction: 'Questions 1 to 7. Complete the booking form. Write ONE WORD AND/OR A NUMBER for each answer.', wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
        sc("Surname: ________", 'FERNANDO', 'She spells it: F, E, R, N, A, N, D, O.', ['Fernando is F, E, R, N, A, N, D, O']),
        sc('Contact number: ________', '0774529816|077 452 9816|077-452-9816', 'She says: zero seven seven, four five two, nine eight one six.', ['zero seven seven, four five two, nine eight one six']),
        sc('Date of arrival: ________ December', '12|12TH|TWELFTH|TWELVE', '"The twelfth of December."', ['The twelfth of December']),
        sc('Number of nights: ________', '5|FIVE', 'She changes four to five: "can we make it five?"', ['can we make it five']),
        sc('Type of room: ________', 'DOUBLE', '"A double room, please."', ['A double room, please']),
        sc('Price per night: ________ rupees', '10500|10,500|TEN THOUSAND FIVE HUNDRED', '"ten thousand five hundred rupees a night".', ['ten thousand five hundred rupees a night']),
        sc('Breakfast starts at ________ o\'clock', '7|SEVEN|7:00|7.00', '"Breakfast is from seven o\'clock until nine thirty."', ['Breakfast is from seven o\'clock']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 8 to 10. Choose the correct letter, A, B or C.', questions: [
        mc('How will she get from the station to the guesthouse?', ['On foot', 'By tuk-tuk', 'By bus'], 'B', '"It\'s about ten minutes by tuk-tuk."', ['about ten minutes by tuk-tuk']),
        mc('What is free for guests?', ['Bicycles', 'Wi-Fi', 'Airport pickup'], 'B', '"We have free Wi-Fi in every room." Bicycles cost 500 rupees a day.', ['We have free Wi-Fi in every room']),
        mc('How much is the deposit?', ['2,000 rupees', '3,000 rupees', '5,000 rupees'], 'B', '"a deposit of three thousand rupees".', ['a deposit of three thousand rupees']),
      ] },
    ] },
    { number: 2, description: 'The manager of a new sports centre talks to visitors', groups: [
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 11 to 15. Choose the correct letter, A, B or C.', questions: [
        mc('How many members has the centre had so far?', ['1,200', 'More than 2,000', 'Exactly 2,400'], 'B', '"more than two thousand people have joined". 1,200 was the plan.', ['more than two thousand people have joined']),
        mc('When is the swimming pool open on most days?', ['6 am to 8 pm', '7 am to 9 pm', '7 am to 6 pm'], 'B', '"from seven in the morning until nine at night".', ['from seven in the morning until nine at night']),
        mc('On which day is the whole centre closed?', ['Monday', 'Sunday', 'Wednesday'], 'C', '"The whole centre is closed on Wednesdays".', ['closed on Wednesdays']),
        mc('What must children under twelve do in the pool?', ['Wear a hat', 'Be with an adult', 'Pay extra'], 'B', '"Children under twelve must always be with an adult."', ['must always be with an adult']),
        mc('How much discount do students get?', ['10 percent', '20 percent', '30 percent'], 'B', '"Students get a twenty percent discount". Adults over sixty get ten.', ['Students get a twenty percent discount']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: 'Questions 16 to 20. Complete the sentences. Write ONE WORD AND/OR A NUMBER for each answer.', wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
        sc('Book a badminton court at least ________ days in advance.', '2|TWO', '"at least two days in advance".', ['at least two days in advance']),
        sc('A locker costs ________ rupees each time.', '50|FIFTY', '"They cost fifty rupees each time".', ['They cost fifty rupees each time']),
        sc('The cafe sells sandwiches and fresh fruit ________.', 'JUICE', '"fresh fruit juice".', ['fresh fruit juice']),
        sc('The free yoga class is on Saturday at ________ in the morning.', '8|EIGHT|8:00|8.00', '"every Saturday at eight in the morning".', ['every Saturday at eight in the morning']),
        sc('To join, go to the ________ desk.', 'RECEPTION', '"go to the reception desk by the main door".', ['go to the reception desk']),
      ] },
    ] },
    { number: 3, description: 'Two students plan a presentation', groups: [
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 21 to 25. Choose the correct letter, A, B or C.', questions: [
        mc('What topic do they choose?', ['Food waste', 'Plastic bottles', 'Paper use'], 'B', '"I think plastic bottles are a good topic." Food waste was the first idea only.', ['plastic bottles are a good topic']),
        mc('When is the presentation?', ['Tuesday', 'Thursday', 'Friday'], 'B', 'Dr Silva "moved it from Tuesday to Thursday".', ['moved it from Tuesday to Thursday']),
        mc('How long is the talk?', ['10 minutes', '15 minutes', '20 minutes'], 'B', '"Fifteen minutes, and then five minutes for questions."', ['Fifteen minutes']),
        mc('What will they show in the presentation?', ['A video', 'The survey results', 'Posters'], 'B', '"I think we should show the survey results."', ['we should show the survey results']),
        mc('What is Ravi worried about?', ['Time', 'Speaking English in class', 'Using the computer'], 'B', '"I\'m a little worried about speaking in English in front of the whole class."', ['worried about speaking in English']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 26 to 30. Who will do each part? Choose A for Maya, B for Ravi or C for both.', questions: [
        mc('The introduction', ['Maya', 'Ravi', 'Both of them'], 'A', 'Maya: "I\'ll write the introduction and start the talk."', ["I'll write the introduction"]),
        mc('The survey results and charts', ['Maya', 'Ravi', 'Both of them'], 'B', 'Ravi: "I can make the charts." and "I\'ll do the survey results".', ['I can make the charts']),
        mc('The photos', ['Maya', 'Ravi', 'Both of them'], 'C', '"Let\'s both take some photos".', ["Let's both take some photos"]),
        mc('The conclusion', ['Maya', 'Ravi', 'Both of them'], 'B', 'Ravi: "I will do the conclusion."', ['I will do the conclusion']),
        mc('The handout', ['Maya', 'Ravi', 'Both of them'], 'A', 'Maya: "I\'ll write it, because I have the best printer at home."', ["I'll write it, because I have the best printer"]),
      ] },
    ] },
    { number: 4, description: 'A lecture about sleep', groups: [
      { type: 'SENTENCE_COMPLETION', instruction: 'Questions 31 to 35. Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
        sc('Most adults need between ________ and nine hours of sleep.', '7|SEVEN', '"between seven and nine hours each night".', ['between seven and nine hours each night']),
        sc('Teenagers need up to ________ hours.', '10|TEN', '"up to ten hours".', ['up to ten hours']),
        sc('In deep sleep the body makes ________ hormone.', 'GROWTH', '"produces growth hormone".', ['produces growth hormone']),
        sc('Students who do not sleep enough find it hard to ________ in class.', 'CONCENTRATE|FOCUS', '"difficult to concentrate in class".', ['difficult to concentrate in class']),
        sc('Blue light from ________ makes it harder to fall asleep.', 'PHONES|PHONE|SCREENS|SCREEN', '"the blue light from phones".', ['the blue light from phones']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 36 to 40. Choose the correct letter, A, B or C.', questions: [
        mc('Which drink should students avoid in the evening?', ['Coffee', 'Warm milk', 'Water'], 'A', '"Coffee can stay in your body for up to six hours".', ['Coffee can stay in your body for up to six hours']),
        mc('What is the best habit for good sleep?', ['Sleeping late at weekends', 'Going to bed at the same time every day', 'Long afternoon naps'], 'B', '"go to bed at the same time every day".', ['go to bed at the same time every day']),
        mc('How long should an afternoon nap be?', ['20 minutes', '60 minutes', '90 minutes'], 'A', '"keep it to twenty minutes".', ['keep it to twenty minutes']),
        mc('What is the best kind of bedroom for sleeping?', ['Warm and bright', 'Cool, dark and quiet', 'Noisy but comfortable'], 'B', '"cool, dark and quiet".', ['cool, dark and quiet']),
        mc('What will next week\'s lecture be about?', ['Dreams', 'Exercise and sleep', 'Food and sleep'], 'B', '"how exercise affects sleep".', ['how exercise affects sleep']),
      ] },
    ] },
  ],
};

module.exports = { listening4 };
