L = dict(folder='Listening', kind='Listening', time='1:15 to 2:45', who='English Teacher 3')

STD_STEPS = None

LESSONS = [
dict(L, day=2, theme='Personal information', title='Taking down details on a form',
 focus='Listening for names, numbers, spelling and email addresses.',
 student=[
  dict(t='note', title='Before you listen', items=['Names are often spelled out: **P-E-R-E-R-A**.', 'Listen for **double**: "double five" = 55.', 'Emails: "at" = @, "dot" = .', 'Write numbers as digits, not words.']),
  dict(t='table', title='Listening 1: the student office', ins='Listen to the conversation. Complete the form.', head=['Student registration form', ''], rows=[
    ['First name', 'Kavindi'], ['1 Surname', ''], ['2 Age', ''], ['3 Hometown', ''], ['4 Phone number', ''], ['5 Email', ''], ['6 Course', ''], ['7 Start date', '']]),
  dict(t='gap', title='Listening 2: phone messages', ins='Listen to three short voicemails. Write the missing information.', items=[
    'Message 1: Call Mr ___ back on ___.', 'Message 2: The new email for the office is ___.', 'Message 3: Meet at room ___ at ___.']),
  dict(t='table', title='Your turn: dictation', ins='Your partner reads their (or invented) details. Write them down, then check.', head=['Name', 'Phone', 'Email'], rows=[['', '', ''], ['', '', '']]),
 ],
 teacher=dict(
  need='Student worksheet, this script. Read each listening twice.',
  aims=['Catch spelled names, numbers and email addresses', 'Fill in a form from a conversation', 'Dictate and check personal details accurately'],
  steps=[
   (10, 'Spelling race', 'Spell 5 words quickly; students write them. Check.'),
   (10, 'Before you listen', 'The note. Predict: what kind of information goes in each gap?'),
   (20, 'Listening 1', 'Read script 1 twice. Students compare in pairs between readings.'),
   (15, 'Listening 2', 'Read script 2 twice.'),
   (10, 'Check', 'Students write answers on the board.'),
   (20, 'Dictation pairs', 'Exercise 4. Use invented details if students prefer privacy.'),
   (5, 'Wrap-up', 'Which was hardest: names, numbers or emails?'),
  ],
  script=dict(head='Listening 1 (then Listening 2: three voicemails)', lines=[
   ('Officer', 'Good morning. Can I have your first name, please?'), ('Kavindi', 'Kavindi.'), ('Officer', 'And your surname?'), ('Kavindi', 'Jayasinghe. J-A-Y-A-S-I-N-G-H-E.'),
   ('Officer', 'Thank you. How old are you?'), ('Kavindi', 'I\'m nineteen.'), ('Officer', 'And where are you from?'), ('Kavindi', 'I\'m from Badulla, in the hill country.'),
   ('Officer', 'What\'s your phone number?'), ('Kavindi', 'It\'s oh-seven-one, two-five-five, double eight, three-oh.'), ('Officer', 'So, 071 255 8830?'), ('Kavindi', 'That\'s right.'),
   ('Officer', 'And your email address?'), ('Kavindi', 'It\'s kavi dot j nineteen at gmail dot com. K-A-V-I.'), ('Officer', 'Great. Which course are you joining?'), ('Kavindi', 'The Korean language course.'),
   ('Officer', 'OK, that starts on the fifteenth of March.'), ('Kavindi', 'The fifteenth. Thank you!'),
   ('', '— Listening 2 —'),
   ('Message 1', 'Hello, this is a message for Nimal. Please call Mr Fonseka back. That\'s F-O-N-S-E-K-A. His number is 077 340 1962.'),
   ('Message 2', 'Hi everyone, the office has a new email address. It\'s info dot korea at epic campus dot l-k. Thanks.'),
   ('Message 3', 'Hi, it\'s Sachini. The study group meets in room 214 at half past four today. See you there!')]),
  answers=['**Listening 1:** 1 Jayasinghe, 2 19, 3 Badulla, 4 071 255 8830, 5 kavi.j19@gmail.com, 6 Korean language course, 7 15 March',
   '**Listening 2:** Message 1: Mr Fonseka, 077 340 1962. Message 2: info.korea@epiccampus.lk. Message 3: room 214, 4:30.'],
  homework='IT lab today: English practice on epicielts.live (Day 2 lesson and listening). Homework: practise saying your phone number and email fast and clearly.'
 )),

dict(L, day=4, theme='Daily routine', title='Someone\'s daily schedule',
 focus='Listening for times and activities in a description of a day.',
 student=[
  dict(t='words', title='Words you will hear', items=['shift', 'early', 'late', 'commute', 'break', 'part-time', 'gym', 'leftovers']),
  dict(t='table', title='Listening 1: Jun-ho\'s day', ins='Listen to Jun-ho, a university student in Daejeon. Complete the times.', head=['Activity', 'Time'], rows=[
    ['wakes up', ''], ['goes to the gym', ''], ['first lecture', ''], ['lunch', ''], ['starts part-time job', ''], ['gets home', ''], ['goes to bed', '']]),
  dict(t='mcq', title='Listening 1: choose the answer', items=[
    ('Where does Jun-ho work?', ['a café', 'a convenience store', 'a library']), ('How does he get to university?', ['by bus', 'by subway', 'he walks']),
    ('What does he usually eat for dinner?', ['instant noodles', 'leftovers from work', 'his mother\'s food']), ('What does he do on Sundays?', ['works', 'sleeps late', 'plays football'])]),
  dict(t='tf', title='Listening 2: two schedules', ins='Listen to Amaya and Lahiru compare their days. True or false?', items=[
    'Amaya gets up before Lahiru.', 'Lahiru has breakfast every day.', 'They both have Korean class in the afternoon.', 'Amaya studies in the library in the evening.', 'Lahiru goes to bed after midnight.']),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Catch times in natural speech', 'Follow the order of a daily routine', 'Understand comparison in a short conversation'],
  steps=[
   (10, 'Time bingo', 'Students write 6 times in a grid. Call times; they tick.'),
   (5, 'Words', 'Teach the word box.'),
   (25, 'Listening 1', 'Read twice. Table first, then multiple choice on the second reading.'),
   (20, 'Listening 2', 'Read twice. Students justify each answer.'),
   (25, 'Speaking follow-up', 'Pairs compare their own day using "I get up at... What about you?" and find 3 differences.'),
   (5, 'Wrap-up', 'Check answers.'),
  ],
  script=dict(head='Listening 1: Jun-ho', lines=[
   ('Jun-ho', 'My day starts early. I wake up at six, and at quarter past six I go to the gym near my apartment. I stay there for about forty minutes. Then I have a shower and take the subway to university. My first lecture is at nine o\'clock.'),
   ('Jun-ho', 'I have lunch at twelve thirty in the student cafeteria with my friends. In the afternoon I have two more classes. At four o\'clock I start my part-time job at a convenience store. I work until nine.'),
   ('Jun-ho', 'I get home at about half past nine. I\'m usually too tired to cook, so I eat leftovers from the convenience store, like kimbap or sandwiches. Then I study for an hour. I go to bed at midnight. On Sundays I don\'t work, so I sleep until eleven!'),
   ('', '— Listening 2 —'),
   ('Amaya', 'Lahiru, what time do you get up?'), ('Lahiru', 'Usually at seven thirty. You?'), ('Amaya', 'Six. I like to have breakfast slowly. Do you eat breakfast?'),
   ('Lahiru', 'Not really. Sometimes I have a banana on the way.'), ('Amaya', 'And your Korean class is in the morning, right?'), ('Lahiru', 'Yes, nine to twelve. Yours is in the afternoon?'),
   ('Amaya', 'That\'s right, one to four. Then I study in the library until eight.'), ('Lahiru', 'Wow. I play games in the evening, and I go to bed really late, about one o\'clock.'), ('Amaya', 'No wonder you skip breakfast!')]),
  answers=['**Table:** wakes up 6:00; gym 6:15; first lecture 9:00; lunch 12:30; starts job 4:00 pm; gets home 9:30 pm; bed 12:00 (midnight)',
   '**MCQ:** 1 a convenience store, 2 by subway, 3 leftovers from work, 4 sleeps late',
   '**Listening 2:** 1 T (6:00 vs 7:30), 2 F, 3 F (Lahiru has class in the morning), 4 T, 5 T (about 1 am)'],
  homework='IT lab today: Day 4 lesson. Homework: write your timetable for tomorrow.'
 )),

dict(L, day=6, theme='Week 1 review', title='Week 1 listening review',
 focus='Mixed listening: introductions, family, routine and hobbies.',
 student=[
  dict(t='mcq', title='Part 1: short conversations', ins='Listen to five short conversations. Choose the answer.', items=[
    ('Where is Tharaka from?', ['Kandy', 'Kurunegala', 'Kalutara']), ('How many sisters does Nadeesha have?', ['one', 'two', 'three']), ('What time does the bus leave?', ['7:15', '7:50', '6:45']),
    ('What does Ravi\'s father do?', ['he\'s a driver', 'he\'s a teacher', 'he\'s a farmer']), ('What does Hasini love doing?', ['dancing', 'drawing', 'swimming'])]),
  dict(t='gap', title='Part 2: a radio interview', ins='Listen to an interview with a young chef. Complete the notes (one or two words, or a number).', items=[
    'Name: Chef ___', 'Age: ___', 'Starts work at: ___ am', 'Favourite dish to cook: ___', 'Free time: plays ___ and watches ___', 'Dream: open a restaurant in ___']),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Review Week 1 topics through listening', 'Practise exam-style multiple choice and note completion'],
  steps=[
   (10, 'Warm-up', 'Week 1 review game: "Tell me 3 things about the person on your left."'),
   (25, 'Part 1', 'Read each conversation twice. Note the distractors (other wrong answers are also mentioned).'),
   (25, 'Part 2', 'Read twice. Students check spelling of answers.'),
   (20, 'Mini interviews', 'Pairs interview each other like the radio interview: age, work, favourite food, free time, dream.'),
   (10, 'Check', 'Go through answers and explain distractors.'),
  ],
  script=dict(head='Part 1: five conversations', lines=[
   ('1', 'A: Are you from Kandy, Tharaka? B: No, I studied in Kandy, but I\'m from Kurunegala. My cousins live in Kalutara.'),
   ('2', 'A: Do you have any sisters, Nadeesha? B: Yes, two. And one brother. So there are three of us girls in total!'),
   ('3', 'A: Does the bus leave at quarter to seven? B: No, that\'s the Sunday bus. On weekdays it leaves at seven fifteen. Don\'t be late!'),
   ('4', 'A: Is your father a teacher, Ravi? B: No, my mother is a teacher. My father is a bus driver. My grandfather was a farmer.'),
   ('5', 'A: Hasini, you\'re so good at drawing! B: Thanks, but I only draw sometimes. What I really love is dancing. I dance every evening.'),
   ('', '— Part 2: radio interview —'),
   ('Host', 'Today I\'m talking to Chef Dinusha. Dinusha, how old are you?'), ('Dinusha', 'I\'m twenty-four.'), ('Host', 'Young for a head chef! What\'s your day like?'),
   ('Dinusha', 'I start work at five am because we make fresh bread. I finish at two in the afternoon.'), ('Host', 'What\'s your favourite dish to cook?'), ('Dinusha', 'Crab curry. It\'s the dish my grandmother taught me.'),
   ('Host', 'And in your free time?'), ('Dinusha', 'I play badminton and I watch cooking shows, of course!'), ('Host', 'What\'s your dream?'), ('Dinusha', 'To open a Sri Lankan restaurant in Seoul. Korean people love spicy food, so I think they\'ll love it.')]),
  answers=['**Part 1:** 1 Kurunegala, 2 two, 3 7:15, 4 he\'s a driver, 5 dancing',
   '**Part 2:** Dinusha; 24; 5 (am); crab curry; badminton, cooking shows; Seoul'],
  homework='IT lab today: Week 1 quiz. Homework: listen to an English song or short video and write 5 words you heard.'
 )),

dict(L, day=8, theme='My town & directions', title='Following directions on a map',
 focus='Understanding directions and finding places on a map.',
 student=[
  dict(t='note', title='Direction language', items=['**Go straight on** (along Main Street). **Turn left / right** at the traffic lights.', '**Take the first / second turning** on the left.', '**Go past** the bank. **Cross** the road. It\'s **on your left / right**.', 'It\'s **at the end of** the street / **on the corner**.']),
  dict(t='table', title='The map', ins='Your teacher will draw the map on the board. Copy it here: START at the station at the bottom. Main Street goes up the middle. Park Road crosses at the first traffic lights, River Road at the second.', head=['Map'], rows=[[''], [''], [''], [''], [''], ['']]),
  dict(t='table', title='Listening 1: where are they going?', ins='Listen to four sets of directions from the station. Write the place: A, B, C or D on your map, and its name.', head=['Directions', 'Place'], rows=[['1', ''], ['2', ''], ['3', ''], ['4', '']]),
  dict(t='mcq', title='Listening 2: lost in Daejeon', items=[('Where does the student want to go?', ['the hospital', 'the international office', 'the post office']), ('Which exit should he use?', ['exit 2', 'exit 4', 'exit 5']), ('How long is the walk?', ['5 minutes', '10 minutes', '15 minutes']), ('What is next to the building?', ['a café', 'a bank', 'a park'])]),
 ],
 teacher=dict(
  need='Student worksheet, this script. Draw this map on the board: Station at the bottom. Main Street goes up. 1st traffic lights: Park Road (left/right). 2nd traffic lights: River Road. Place A: left side of Main Street, after the 1st lights, next to a bank. Place B: right at Park Road, on the right, opposite a park. Place C: end of Main Street. Place D: left at River Road, on the left, on the corner.',
  aims=['Understand direction phrases', 'Follow directions on a map', 'Give directions to a partner'],
  steps=[
   (10, 'Body directions', 'Students stand: "Turn left! Go straight on two steps!"'),
   (10, 'Language', 'The note. Draw the map on the board; students copy it.'),
   (25, 'Listening 1', 'Read each set of directions twice; students trace the route with a pen.'),
   (15, 'Listening 2', 'Read twice.'),
   (25, 'Pair practice', 'Students add 4 places to their map and give directions; partner finds them.'),
   (5, 'Check', 'Answers.'),
  ],
  script=dict(head='Listening 1: four directions from the station', lines=[
   ('1', 'Come out of the station and go straight on along Main Street. Go past the first traffic lights. It\'s on your left, next to the bank. It\'s the pharmacy.'),
   ('2', 'Go straight on to the first traffic lights and turn right into Park Road. Walk for two minutes. It\'s on your right, opposite the park. It\'s the library.'),
   ('3', 'Go straight on along Main Street. Go past both traffic lights. It\'s at the end of the street, you can\'t miss it. It\'s the hospital.'),
   ('4', 'Go straight on to the second traffic lights and turn left into River Road. It\'s on your left, on the corner. It\'s the post office.'),
   ('', '— Listening 2 —'),
   ('Student', 'Excuse me, I\'m looking for the international office. Can you help me?'), ('Woman', 'Sure. Are you at the subway station now?'), ('Student', 'Yes, I\'m at exit two.'),
   ('Woman', 'OK, go back inside and take exit five. Then walk straight on for about ten minutes. You\'ll see a big glass building. The international office is on the third floor. There\'s a café next to it, on the ground floor.'), ('Student', 'Exit five, ten minutes, glass building. Thank you so much!')]),
  answers=['**Listening 1:** 1 A, pharmacy. 2 B, library. 3 C, hospital. 4 D, post office.', '**Listening 2:** 1 the international office, 2 exit 5, 3 10 minutes, 4 a café'],
  homework='IT lab today: Day 8 lesson. Homework: write directions from the classroom to the dining hall.'
 )),

dict(L, day=12, theme='Week 2 review', title='Week 2 listening review',
 focus='Mixed listening: home, directions, food, shopping, present continuous.',
 student=[
  dict(t='mcq', title='Part 1: what are they doing?', ins='Listen to five phone calls. What is each person doing right now?', items=[
    ('Kasun', ['cooking', 'shopping', 'studying']), ('Dilini', ['waiting for a bus', 'eating lunch', 'walking in the park']), ('Mr Perera', ['driving', 'in a meeting', 'sleeping']), ('Hiruni', ['watching TV', 'doing homework', 'cleaning']), ('Nimal', ['playing football', 'watching football', 'buying a ball'])]),
  dict(t='table', title='Part 2: at the market', ins='Listen and complete the shopping list.', head=['Item', 'How much / how many', 'Price'], rows=[['onions', '', ''], ['', '2', ''], ['rice', '', ''], ['', 'a bottle', '']]),
  dict(t='lines', title='Part 3: questions', items=['What is the total?', 'How does the customer pay?', 'What does the seller give her for free?']),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Review Week 2 language through listening', 'Catch quantities and prices'],
  steps=[
   (10, 'Warm-up', 'Mime what you are doing; class guesses (present continuous).'),
   (25, 'Part 1', 'Read twice. Watch for distractors.'),
   (25, 'Parts 2 and 3', 'Read twice. Students add up the total.'),
   (25, 'Role-play', 'Market role-play with prices, using some/any and how much/many.'),
   (5, 'Check', 'Week 2 quiz in the IT lab.'),
  ],
  script=dict(head='Part 1: five phone calls', lines=[
   ('1', 'Hi, it\'s Kasun. I can\'t talk now, I\'m in the library and I\'m studying for the test. I\'ll cook later!'),
   ('2', 'Hello? Dilini here. I\'m at the bus stop. The bus is late again! I had lunch already, don\'t worry.'),
   ('3', 'Sorry, Mr Perera can\'t take your call. He\'s in a meeting until four. He\'s not driving today.'),
   ('4', 'Hiruni speaking. No, I\'m not watching TV! I\'m doing my English homework. I cleaned my room this morning.'),
   ('5', 'Nimal? He\'s at the stadium. He isn\'t playing today, he\'s hurt. He\'s watching the match with his friends.'),
   ('', '— Part 2: at the market —'),
   ('Woman', 'Good morning! I\'d like a kilo of onions, please.'), ('Seller', 'A kilo of onions, that\'s 400 rupees. Anything else?'), ('Woman', 'Two coconuts, please. How much are they?'), ('Seller', '150 each, so 300.'),
   ('Woman', 'And five kilos of rice.'), ('Seller', 'Red or white? White is 250 a kilo, so 1,250.'), ('Woman', 'White, please. Oh, and a bottle of coconut oil.'), ('Seller', 'That\'s 850. So the total is 2,800 rupees.'),
   ('Woman', 'Here\'s 3,000 in cash.'), ('Seller', 'Thank you. Here\'s your change, 200. And take some curry leaves, they\'re free!')]),
  answers=['**Part 1:** 1 studying, 2 waiting for a bus, 3 in a meeting, 4 doing homework, 5 watching football',
   '**Part 2:** onions: a kilo, Rs 400. Coconuts: 2, Rs 300. Rice: 5 kilos, Rs 1,250. Coconut oil: a bottle, Rs 850.',
   '**Part 3:** 1 Rs 2,800. 2 In cash (3,000, with 200 change). 3 Curry leaves.'],
  homework='IT lab today: Week 2 quiz. Homework: describe what 3 family members are probably doing right now.'
 )),

dict(L, day=14, theme='Last weekend', title='A weekend story',
 focus='Listening to a story in the past. Hearing -ed endings: /t/, /d/, /ɪd/.',
 student=[
  dict(t='note', title='-ed sounds', items=['/t/ after p, k, s, sh, ch, f: walk**ed**, watch**ed**, stopp**ed**', '/d/ after other sounds: play**ed**, clean**ed**, call**ed**', '/ɪd/ after t and d (an extra syllable): visit**ed**, want**ed**, need**ed**']),
  dict(t='table', title='Sort the sounds', ins='Listen to your teacher and write each verb in the right column: watched, played, visited, cooked, cleaned, waited, laughed, stayed, decided', head=['/t/', '/d/', '/ɪd/'], rows=[['', '', ''], ['', '', ''], ['', '', '']]),
  dict(t='gap', title='Listening: Lahiru\'s weekend', ins='Put the events in order (1 to 6).', items=['___ He visited his grandmother.', '___ He cleaned the car with his father.', '___ He watched a film with his sister.', '___ He played cricket.', '___ The rain started.', '___ He cooked dinner.']),
  dict(t='lines', title='Answer the questions', items=['Why did Lahiru stop playing cricket?', 'What did his grandmother give him?', 'Why was dinner a surprise?']),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Hear and say the three -ed sounds', 'Follow the order of events in a story'],
  steps=[
   (15, '-ed sounds', 'Note and exercise 2: you say each verb twice.'),
   (25, 'Listening', 'Read the story twice. Order, then questions.'),
   (25, 'Retell', 'Pairs retell the story from the pictures in their heads, then tell their own weekend story.'),
   (15, 'Mid-test preparation', 'Tomorrow is the mid-programme test. Explain the listening part format.'),
   (10, 'Check', 'Answers.'),
  ],
  script=dict(head='Lahiru\'s weekend', lines=[
   ('Lahiru', 'Last weekend was busy! On Saturday morning I played cricket with my friends at the school ground. We played for two hours, but then the rain started and we stopped. I walked home in the rain and I was completely wet!'),
   ('Lahiru', 'In the afternoon, when the rain stopped, I cleaned the car with my father. Then on Saturday evening I watched a film with my sister. It was a Korean film with English subtitles, so it was good practice.'),
   ('Lahiru', 'On Sunday I visited my grandmother in the next village. She gave me some homemade kavum, my favourite. And in the evening I cooked dinner for the whole family. That was a big surprise, because I never cook! I made rice and dhal. My mother laughed and said it was very good.')]),
  answers=['**2:** /t/ watched, cooked, laughed. /d/ played, cleaned, stayed. /ɪd/ visited, waited, decided.',
   '**Order:** 1 played cricket, 2 the rain started, 3 cleaned the car, 4 watched a film, 5 visited his grandmother, 6 cooked dinner',
   '**Questions:** 1 Because it started to rain. 2 Homemade kavum. 3 Because he never cooks.'],
  homework='IT lab today: Day 14 lesson. Revise for tomorrow\'s mid-programme test.'
 )),
]
