// EXAM PAPER 2 (halfway mock, Exam tab), Part 1: LISTENING. 4 parts, 40 questions, IELTS style.
// Difficulty about 5.5 out of 10: everyday accents and speed, with the usual IELTS traps (a speaker corrects
// himself, a plan that changed, a number that is mentioned but is not the answer). Part 1 has the IELTS example.
// The scripts are written for recording: each line starts with the speaker; [PAUSE n] = n seconds of silence.
const { mc, sc } = require('./kit');

const FORM = (a, b, limit) => `Questions ${a} to ${b}. Complete the form below. Write ${limit} for each answer.`;
const MC3 = (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B or C.`;
const NOTES = (a, b, limit) => `Questions ${a} to ${b}. Complete the notes below. Write ${limit} for each answer.`;

// Speakers and the voice to use for each (Google voices, British English unless stated)
const VOICES = {
  NARRATOR: 'en-GB, male, slow and neutral (e.g. en-GB-Neural2-B)',
  RECEPTIONIST: 'en-GB, female (e.g. en-GB-Neural2-A)',
  DILAN: 'en-GB, male, young (e.g. en-GB-Neural2-D)',
  'JI-HO': 'en-AU, male (e.g. en-AU-Neural2-B)',
  TUTOR: 'en-GB, female, older (e.g. en-GB-Neural2-F)',
  NIMAL: 'en-GB, male (e.g. en-GB-Neural2-D)',
  SARA: 'en-US, female (e.g. en-US-Neural2-F)',
  LECTURER: 'en-GB, female (e.g. en-GB-Neural2-C)',
};

const S1 = `NARRATOR: Part 1. You will hear a conversation between a receptionist at a sports centre and a student who wants to become a member. First, you have some time to look at questions 1 to 10.
[PAUSE 30]
NARRATOR: You will see that there is an example that has been done for you. On this occasion only, the conversation relating to this will be played first.
RECEPTIONIST: Good afternoon, Harbour Sports Centre. How can I help you?
DILAN: Hi. I'd like to join the centre. I'm a student at the university, so I was hoping I could get the cheaper membership.
RECEPTIONIST: Yes, of course. We have a student membership for that.
NARRATOR: The man wants a student membership, so "student" has been written in the space. Now we shall begin. You should answer the questions as you listen, because you will not hear the recording a second time. Listen carefully and answer questions 1 to 10.
RECEPTIONIST: Good afternoon, Harbour Sports Centre. How can I help you?
DILAN: Hi. I'd like to join the centre. I'm a student at the university, so I was hoping I could get the cheaper membership.
RECEPTIONIST: Yes, of course. We have a student membership for that. Can I take your name, please?
DILAN: It's Dilan Jayasekara.
RECEPTIONIST: Could you spell your family name for me?
DILAN: Sure. J, A, Y, A, S, E, K, A, R, A.
RECEPTIONIST: Thank you. And what's your address here in Busan?
DILAN: I'm in the student dormitory. It's number 58, Ocean Road. Oh, sorry, no, it's Ocean View Road. Ocean Road is the one behind it.
RECEPTIONIST: 58 Ocean View Road. That's fine. And a phone number?
DILAN: It's 010 4729 8813.
RECEPTIONIST: 010 4729 8813.
DILAN: Wait, I'm sorry, the last part is 8831, not 8813. I always get that wrong.
RECEPTIONIST: No problem. 010 4729 8831. Now, what kind of activities are you interested in? We have a gym, a swimming pool and courts for different sports.
DILAN: Well, I'll probably use the gym now and then, but what I really want to do is play badminton. I played for my school team in Sri Lanka.
RECEPTIONIST: Great. We have a badminton club that meets twice a week, on Mondays and Thursdays.
DILAN: Oh. I have lectures on Monday evenings, unfortunately.
RECEPTIONIST: That's OK. You can just come on Thursdays, then. Lots of people do that.
DILAN: Perfect. And how much is the student membership?
RECEPTIONIST: The normal adult price is fifty thousand won a month, but for students it's thirty-five thousand.
DILAN: That's good. Can I pay by card?
RECEPTIONIST: Usually yes, but I'm afraid our card machine isn't working this week. So for now, it'll have to be a bank transfer. I'll give you our account details.
DILAN: OK, no problem.
RECEPTIONIST: When you come in for the first time, please bring your student card and a photo, so we can make your membership card.
DILAN: A passport photo?
RECEPTIONIST: Any small photo is fine. Oh, and new members also get one free session with a personal trainer. They'll show you how to use all the machines safely.
DILAN: That sounds useful. Is there somewhere to keep my things?
RECEPTIONIST: Yes, you can rent a locker. A large locker is five thousand won a month, and a small one is three thousand.
DILAN: I'll just need a small one. I only bring a bag and my racket.
RECEPTIONIST: Lovely. I'll add that to your form.
NARRATOR: That is the end of Part 1. You now have half a minute to check your answers.
[PAUSE 30]`;

const S2 = `NARRATOR: Part 2. You will hear a tour guide talking to a group of students about a day trip to the city of Gyeongju. First, you have some time to look at questions 11 to 15.
[PAUSE 30]
NARRATOR: Now listen carefully and answer questions 11 to 15.
JI-HO: Good morning, everyone. My name's Ji-ho, and I'll be your guide on Saturday's trip to Gyeongju, which was the capital of the old kingdom of Silla for almost a thousand years. Let me tell you how the day will work.
First, the times. In your information sheet, it says the bus leaves at seven thirty, but the driver has asked us to change that. The bus will now leave at seven forty-five from the main gate. Please don't be late, because we won't be able to wait for anyone.
Our first stop will be Bulguksa Temple. Some people ask why we don't start with the museum, because it's closer to the motorway. The reason is simple: the temple gets very busy after ten o'clock, so if we arrive early, you'll be able to enjoy it before the big tour groups arrive.
Now, what should you bring? You don't need any money for tickets, because all the entrance fees are paid by the programme, and you won't need your student card either. But the weather forecast says it will rain in the afternoon, so please bring an umbrella.
For lunch, we had planned to take you to a Korean barbecue restaurant, but unfortunately it has closed for repairs. So instead we'll be having bibimbap, which is rice with vegetables. There's a vegetarian version too, so just tell me if you need it.
At the end of the day, we wanted to go cycling around the lake, but in November it gets dark too early for that. So instead, we'll spend an hour at the night market before we head home.
NARRATOR: Before you hear the rest of the talk, you have some time to look at questions 16 to 20.
[PAUSE 30]
NARRATOR: Now listen and answer questions 16 to 20.
JI-HO: Now let me tell you a little about each place we'll visit. At Bulguksa Temple, entrance is not usually free, but as I said, the programme has paid for it. The temple is quite large, so you might like to join the free guided tour in English, which leaves from the main gate at ten o'clock.
After that, we'll go up the mountain to Seokguram Grotto. People often think there's a long, steep climb, but don't worry, the bus takes us almost to the top, so the walk is short and easy. Inside the grotto there's a famous stone Buddha. It's behind glass, and you're not allowed to take photos inside, so please put your phones away.
In the afternoon, we'll visit the Gyeongju National Museum. Entry to the museum is free for everyone, so if you enjoy it, you can come back another time without paying.
Next, we'll walk to the Daereungwon tombs. These are large grass hills where the kings and queens of Silla were buried. You can't climb on them, but you can go inside one of them, which is called Cheonmachong, and see how the tomb was built.
Our last stop before the market is Woljeong Bridge. It's a beautiful wooden bridge with a roof, and it looks very old, but in fact it was rebuilt and opened only a few years ago. You may have seen photos of it lit up at night, but honestly, it looks just as good in daylight, and that's when we'll see it.
NARRATOR: That is the end of Part 2. You now have half a minute to check your answers.
[PAUSE 30]`;

const S3 = `NARRATOR: Part 3. You will hear two students, Nimal and Sara, talking to their tutor about a presentation on food waste. First, you have some time to look at questions 21 to 25.
[PAUSE 30]
NARRATOR: Now listen carefully and answer questions 21 to 25.
TUTOR: Come in, Nimal, Sara. So, how's the presentation on food waste going?
SARA: Quite well, I think. We've decided to focus on the dormitory canteen, because that's where most students eat.
TUTOR: Good. Why did you choose the canteen rather than food waste in general?
NIMAL: At first we wanted to look at supermarkets, but it was hard to get information from them. The canteen manager was very happy to help us, so it was much easier to collect real data.
TUTOR: That makes sense. And how did you collect the data?
SARA: We thought about giving students a questionnaire, but people don't always tell the truth about how much food they throw away. So in the end, we weighed the food left on the plates after lunch every day for two weeks.
TUTOR: Excellent. That's much more reliable. What did you find?
NIMAL: The amount was bigger than we expected. On average, about a quarter of the food on each plate was thrown away. The worst day was Friday, when it was almost a third.
TUTOR: Why do you think that was?
SARA: We thought it might be because the Friday menu is less popular, but the manager told us the menu is the same as on other days. Actually, a lot of students go home on Friday afternoons, so they eat quickly and leave food behind.
TUTOR: Interesting. And what do you plan to recommend?
NIMAL: Our main idea is to let students choose a smaller portion. At the moment everyone gets the same amount of rice, even if they're not very hungry.
TUTOR: I think the canteen would like that. It would save them money too.
NARRATOR: Before you hear the rest of the conversation, you have some time to look at questions 26 to 30.
[PAUSE 30]
NARRATOR: Now listen and answer questions 26 to 30.
TUTOR: So, have you decided who's going to do each part of the presentation?
SARA: Mostly. I'll do the introduction, because I wrote the first part of the report.
TUTOR: And the charts?
NIMAL: I made the charts in the report, so I'll explain them.
SARA: For the part about our method, the weighing, we'll both do that, because we did it together every day.
TUTOR: Fine. What about the recommendations?
NIMAL: Sara had the idea about smaller portions, so she should present that.
SARA: OK. And the questions at the end, we'll answer those together.
TUTOR: Good. One more thing: who's going to contact the canteen manager to thank him?
NIMAL: I'll do that. I see him every morning at breakfast anyway.
TUTOR: Perfect. I'm looking forward to it.
NARRATOR: That is the end of Part 3. You now have half a minute to check your answers.
[PAUSE 30]`;

const S4 = `NARRATOR: Part 4. You will hear part of a lecture about urban heat islands. First, you have some time to look at questions 31 to 40.
[PAUSE 45]
NARRATOR: Now listen carefully and answer questions 31 to 40.
LECTURER: Good morning. Today I'm going to talk about something that affects millions of people who live in cities: the urban heat island effect. This simply means that a city is warmer than the countryside around it. In a large city, the difference can be as much as seven degrees, and it is usually greatest at night, not during the day, which surprises many people.
So, what causes it? The first cause is the materials that cities are built from. Concrete and dark roads absorb heat from the sun during the day and then release it slowly at night, so the city cannot cool down.
The second cause is the lack of plants. In the countryside, trees and fields lose water through their leaves, and this has a cooling effect, a bit like sweating. In cities, there is much less green space, so there is less of this natural cooling.
A third cause is the heat produced by people themselves: cars, factories and, especially, air conditioners, which push hot air out into the street. Ironically, the hotter a city becomes, the more air conditioners people use, and the hotter the street gets.
Why does this matter? Above all, it is a danger to health. During heatwaves, more people die in cities than in rural areas, and older people are at the greatest risk. Heat islands also increase the demand for electricity, and they can make air pollution worse.
Fortunately, there are several solutions. One of the simplest is to paint roofs white. A white roof reflects most of the sunlight instead of absorbing it, and the building below can be several degrees cooler. Another solution is the green roof, where plants are grown on top of buildings. These are more expensive, but they also help to reduce flooding, because they hold rain water.
Planting trees along streets is probably the most effective solution of all, because trees provide shade as well as cooling the air. The city of Medellin in Colombia created thirty green corridors, which are roads and rivers lined with trees and plants, and temperatures along them fell by around two degrees.
Finally, some cities are changing the materials they use for roads and pavements. In Los Angeles, for example, some streets have been covered with a light grey coating, which keeps the surface cooler. However, researchers found that this coating reflected heat onto people walking nearby, so it is not a perfect answer.
In the next lecture, we'll look at how architects are designing buildings to stay cool without air conditioning.
NARRATOR: That is the end of Part 4. You now have half a minute to check your answers.
[PAUSE 30]
NARRATOR: That is the end of the listening test.`;

const LISTENING = {
  code: 'EX2-L', testType: 'LISTENING', title: 'Exam Paper 2 · Part 1 of 3 · Listening', timeLimitMin: 35, difficulty: 3, topic: 'Exam Paper 2',
  instructions: 'Exam Paper 2 (halfway mock), Part 1 of 3. Four parts and 40 questions, about 35 minutes. You will hear each recording ONCE only. Read the questions before each part starts. When you submit, Part 2 (Reading) starts.',
  audioScript: JSON.stringify({ 1: S1, 2: S2, 3: S3, 4: S4 }),
  sections: [
    { number: 1, description: 'Joining a sports centre', groups: [
      { type: 'SENTENCE_COMPLETION', instruction: FORM(1, 10, 'NO MORE THAN TWO WORDS AND/OR A NUMBER') + ' Example: Type of membership: student', wordLimit: 'NO MORE THAN TWO WORDS AND/OR A NUMBER', questions: [
        sc('Family name: ________', 'JAYASEKARA', 'He spells it: J, A, Y, A, S, E, K, A, R, A.', ['J, A, Y, A, S, E, K, A, R, A']),
        sc('Address: 58 ________ Road', 'OCEAN VIEW', 'He corrects himself: "Oh, sorry, no, it\'s Ocean View Road." (Ocean Road is the trap.)', ["Oh, sorry, no, it's Ocean View Road"]),
        sc('Phone number: 010 4729 ________', '8831', 'He corrects the last part: "8831, not 8813".', ['the last part is 8831, not 8813']),
        sc('Main activity: ________', 'BADMINTON', '"what I really want to do is play badminton". (The gym is only "now and then".)', ['what I really want to do is play badminton']),
        sc('Will come to the club on: ________', 'THURSDAYS|THURSDAY', '"You can just come on Thursdays" (he has lectures on Mondays).', ['You can just come on Thursdays, then']),
        sc('Cost per month: ________ won', '35,000|35000|35 000|THIRTY-FIVE THOUSAND|THIRTY FIVE THOUSAND', '"for students it\'s thirty-five thousand". (50,000 is the adult price.)', ["but for students it's thirty-five thousand"]),
        sc('Payment this week: by ________', 'BANK TRANSFER|TRANSFER', 'The card machine isn\'t working, so "it\'ll have to be a bank transfer".', ["it'll have to be a bank transfer"]),
        sc('First visit: bring student card and a ________', 'PHOTO|PHOTOGRAPH', '"please bring your student card and a photo".', ['please bring your student card and a photo']),
        sc('Free: one session with a ________', 'PERSONAL TRAINER|TRAINER', '"one free session with a personal trainer".', ['one free session with a personal trainer']),
        sc('Small locker: ________ won a month', '3,000|3000|3 000|THREE THOUSAND', 'He wants a small one: "a small one is three thousand". (5,000 is the large locker.)', ['a small one is three thousand']),
      ] },
    ] },
    { number: 2, description: 'A day trip to Gyeongju', groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC3(11, 15), questions: [
        mc('What time will the bus leave?', ['7:30', '7:45', '8:00'], 'B', 'The time changed: "The bus will now leave at seven forty-five". (7:30 was the old time.)', ['The bus will now leave at seven forty-five']),
        mc('Why will the group visit Bulguksa Temple first?', ['It is the nearest place to the motorway', 'It is less crowded early in the day', 'The guide wants to finish at the museum'], 'B', '"the temple gets very busy after ten o\'clock". (The museum is the one near the motorway.)', ['the temple gets very busy after ten o\'clock']),
        mc('What should students bring?', ['An umbrella', 'Their student card', 'Money for tickets'], 'A', '"it will rain in the afternoon, so please bring an umbrella". Tickets are paid and the card is not needed.', ['so please bring an umbrella']),
        mc('What will the group have for lunch?', ['Korean barbecue', 'Bibimbap', 'Noodles'], 'B', 'The barbecue restaurant is closed, "So instead we\'ll be having bibimbap".', ["So instead we'll be having bibimbap"]),
        mc('What will students do at the end of the day?', ['Go cycling around the lake', 'Visit a night market', 'Watch a performance'], 'B', 'Cycling is not possible in November: "we\'ll spend an hour at the night market".', ["we'll spend an hour at the night market"]),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 16 to 20. What does the guide say about each place? Choose FIVE answers from the list, A to G.', questions: [
        mc('Bulguksa Temple', ['Photos are not allowed inside', 'There is a steep walk', 'It is best seen at night', 'Visitors can go inside one of them', 'A free guided tour in English is available', 'It was rebuilt recently', 'Entry is free'], 'E', '"the free guided tour in English, which leaves from the main gate". (Entry is NOT usually free here.)', ['you might like to join the free guided tour in English']),
        mc('Seokguram Grotto', ['Photos are not allowed inside', 'There is a steep walk', 'It is best seen at night', 'Visitors can go inside one of them', 'A free guided tour in English is available', 'It was rebuilt recently', 'Entry is free'], 'A', '"you\'re not allowed to take photos inside". (The walk is "short and easy", not steep.)', ["you're not allowed to take photos inside"]),
        mc('Gyeongju National Museum', ['Photos are not allowed inside', 'There is a steep walk', 'It is best seen at night', 'Visitors can go inside one of them', 'A free guided tour in English is available', 'It was rebuilt recently', 'Entry is free'], 'G', '"Entry to the museum is free for everyone".', ['Entry to the museum is free for everyone']),
        mc('Daereungwon tombs', ['Photos are not allowed inside', 'There is a steep walk', 'It is best seen at night', 'Visitors can go inside one of them', 'A free guided tour in English is available', 'It was rebuilt recently', 'Entry is free'], 'D', '"you can go inside one of them, which is called Cheonmachong".', ['but you can go inside one of them']),
        mc('Woljeong Bridge', ['Photos are not allowed inside', 'There is a steep walk', 'It is best seen at night', 'Visitors can go inside one of them', 'A free guided tour in English is available', 'It was rebuilt recently', 'Entry is free'], 'F', '"it was rebuilt and opened only a few years ago". (The guide says it looks just as good in daylight, so not C.)', ['in fact it was rebuilt and opened only a few years ago']),
      ] },
    ] },
    { number: 3, description: 'A presentation on food waste', groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC3(21, 25), questions: [
        mc('Why did the students stop studying supermarkets?', ['Supermarkets waste very little food', 'It was difficult to get information from them', 'Their tutor told them to change'], 'B', '"it was hard to get information from them".', ['it was hard to get information from them']),
        mc('How did they collect their data?', ['By giving students a questionnaire', 'By weighing food left on plates', 'By interviewing the canteen staff'], 'B', '"we weighed the food left on the plates after lunch". (They only thought about a questionnaire.)', ['we weighed the food left on the plates after lunch every day for two weeks']),
        mc('On average, how much of the food on each plate was thrown away?', ['About a quarter', 'About a third', 'About half'], 'A', '"On average, about a quarter". (Almost a third was only on Fridays.)', ['On average, about a quarter of the food on each plate was thrown away']),
        mc('Why was more food wasted on Fridays?', ['The menu was less popular', 'Many students were in a hurry to go home', 'The canteen served bigger portions'], 'B', '"a lot of students go home on Friday afternoons, so they eat quickly". (The menu is the same as other days.)', ['a lot of students go home on Friday afternoons, so they eat quickly and leave food behind']),
        mc('What is the students\' main recommendation?', ['Students should be able to choose a smaller portion', 'The canteen should change the Friday menu', 'Students should pay for the food they waste'], 'A', '"Our main idea is to let students choose a smaller portion".', ['Our main idea is to let students choose a smaller portion']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: 'Questions 26 to 30. Who will do each of the following? Choose A (Nimal), B (Sara) or C (both of them).', questions: [
        mc('The introduction', ['Nimal', 'Sara', 'Both of them'], 'B', 'Sara: "I\'ll do the introduction".', ["I'll do the introduction"]),
        mc('Explaining the charts', ['Nimal', 'Sara', 'Both of them'], 'A', 'Nimal: "I made the charts in the report, so I\'ll explain them".', ["I made the charts in the report, so I'll explain them"]),
        mc('Describing the method', ['Nimal', 'Sara', 'Both of them'], 'C', '"we\'ll both do that, because we did it together".', ["we'll both do that, because we did it together every day"]),
        mc('Presenting the recommendations', ['Nimal', 'Sara', 'Both of them'], 'B', 'Nimal: "Sara had the idea about smaller portions, so she should present that".', ['Sara had the idea about smaller portions, so she should present that']),
        mc('Thanking the canteen manager', ['Nimal', 'Sara', 'Both of them'], 'A', 'Nimal: "I\'ll do that. I see him every morning".', ["I'll do that. I see him every morning at breakfast anyway"]),
      ] },
    ] },
    { number: 4, description: 'A lecture on urban heat islands', groups: [
      { type: 'SENTENCE_COMPLETION', instruction: NOTES(31, 40, 'ONE WORD ONLY'), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Urban heat islands: the difference in temperature is usually greatest at ________.', 'NIGHT', '"it is usually greatest at night, not during the day".', ['it is usually greatest at night, not during the day']),
        sc('Cause 1: concrete and dark roads ________ heat during the day.', 'ABSORB', '"Concrete and dark roads absorb heat from the sun".', ['Concrete and dark roads absorb heat from the sun during the day']),
        sc('Cause 2: there is less green ________ in cities.', 'SPACE', '"there is much less green space".', ['there is much less green space']),
        sc('Cause 3: heat from cars, factories and especially air ________.', 'CONDITIONERS', '"and, especially, air conditioners".', ['and, especially, air conditioners']),
        sc('Effects: in heatwaves, ________ people are at the greatest risk.', 'OLDER|OLD', '"older people are at the greatest risk".', ['older people are at the greatest risk']),
        sc('Effects: more demand for ________.', 'ELECTRICITY', '"Heat islands also increase the demand for electricity".', ['Heat islands also increase the demand for electricity']),
        sc('Solution: paint roofs ________, so they reflect sunlight.', 'WHITE', '"One of the simplest is to paint roofs white".', ['One of the simplest is to paint roofs white']),
        sc('Green roofs cost more but also reduce ________.', 'FLOODING|FLOODS', '"they also help to reduce flooding".', ['they also help to reduce flooding']),
        sc('Trees are the most effective solution because they give ________ and cool the air.', 'SHADE', '"because trees provide shade as well as cooling the air".', ['because trees provide shade as well as cooling the air']),
        sc('Los Angeles: a light grey coating reflected heat onto people who were ________ nearby.', 'WALKING', '"reflected heat onto people walking nearby".', ['this coating reflected heat onto people walking nearby']),
      ] },
    ] },
  ],
};

function checkListening() {
  const errs = []; let n = 0;
  const scripts = JSON.parse(LISTENING.audioScript);
  LISTENING.sections.forEach(s => s.groups.forEach(g => g.questions.forEach(q => {
    n++;
    (q.ev || []).forEach(e => { if (!scripts[s.number].includes(e)) errs.push(`Q${n}: not in script: ${e}`); });
    if (q.options && q.answer.charCodeAt(0) - 65 >= q.options.length) errs.push(`Q${n}: answer outside options`);
  })));
  if (n !== 40) errs.push(`listening has ${n} questions, not 40`);
  return errs;
}

module.exports = { LISTENING, VOICES, checkListening };
