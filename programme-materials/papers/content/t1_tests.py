T = dict(folder='Tests', who='English Teacher 1')

SPEAK_RUBRIC = [
    'Score each area from 0 to 5. Total out of 20.',
    '**Fluency:** 5 keeps going with few pauses and links ideas; 3 pauses often but finishes answers; 1 only single words.',
    '**Vocabulary:** 5 uses topic words correctly and some new words; 3 enough basic words; 1 very few words.',
    '**Grammar:** 5 mostly correct, uses past and future; 3 simple sentences with errors that don\'t stop meaning; 1 errors stop meaning.',
    '**Pronunciation:** 5 easy to understand all the time; 3 understood with some effort; 1 hard to understand.',
]
WRITE_RUBRIC = [
    'Score each area from 0 to 5. Total out of 20.',
    '**Task:** 5 answers every point with detail and the right length; 3 misses one point or is short; 1 off topic.',
    '**Organisation:** 5 clear greeting, paragraphs, linking words and ending; 3 some order; 1 no clear order.',
    '**Vocabulary:** 5 good range for the level, few spelling mistakes; 3 basic but clear; 1 very limited.',
    '**Grammar:** 5 mostly accurate with some range; 3 frequent errors but meaning is clear; 1 errors stop meaning.',
]
LEVELS = 'Total out of 100: 90+ B2, 75 to 89 B1, 50 to 74 A2, 25 to 49 A1, 0 to 24 Pre-A1. Enter each student\'s total in the tracker notes for the session.'

LESSONS = [
dict(T, day=15, kind='Mid-programme test, part A', theme='Mid-programme test A - language, reading, writing', time='8:30 to 10:30',
 title='Mid-programme test: language, reading and writing', focus='Parts 1 to 3. 110 minutes. Write your answers on this paper.',
 student=[
  dict(t='note', title='Instructions', items=['Answer every question. There is no penalty for a wrong answer.', 'Part 1: 30 minutes. Part 2: 35 minutes. Part 3: 45 minutes.', 'Write clearly. Use a pen.']),
  dict(t='gap', title='Part 1: Language (20 marks)', ins='Circle the correct answer.', items=[
    'My sister (is / are / am) a nurse.', 'Where (do / does / is) your father work?', 'We (has / have / having) two cats.', 'He (get / gets / getting) up at six every day.',
    'I love (play / playing / to playing) badminton.', 'There (is / are / be) three bedrooms in our house.', 'Is there (some / any / a) milk in the fridge?',
    'How (many / much / lot) money do you have?', 'Look! The children (play / are playing / plays) in the rain.', 'I (was / were / am) at home yesterday.',
    'They (was / were / did) very tired after the trip.', 'We (visit / visited / visiting) our grandmother last Sunday.', 'Kasun (doesn\'t / don\'t / isn\'t) like spicy food.',
    'Turn (left / leave / lift) at the bank.', 'This is (Ravi / Ravi\'s / Ravis) bag.', 'Can I (have / having / has) a cup of tea, please?',
    'The bank is (between / next / opposite to) the post office and the café.', 'She (studied / studyed / studies) for three hours last night.', '(Did / Do / Were) you watch the match?', 'These shoes are too small. Do you have them in a (big / bigger / biggest) size?']),
  dict(t='pagebreak'),
  dict(t='passage', title='Part 2: Reading (20 marks)', head='A new life in Daegu',
    text="""Hasini arrived in Daegu, South Korea, three weeks ago. She is twenty and she is studying nursing on a scholarship. Before she left Sri Lanka, she studied English and Korean for one month at a language school in Galle.

Her first week was difficult. It was very cold, and she didn't have a warm jacket, so she bought one at a market near the university. It was 45,000 won. She also opened a bank account and got a Korean phone number. Her Korean was not very good, so a student volunteer called Min-ji helped her.

Now Hasini has a routine. She gets up at seven, has breakfast in the dormitory and walks to her classes. In the morning she has Korean language classes, and in the afternoon she studies biology and English. She likes biology, but she finds Korean grammar hard.

At the weekends she cooks rice and curry for her roommate, Thu from Vietnam, and they watch films together. Last Saturday they went to a festival in the city centre. There were lanterns everywhere and a lot of street food. Hasini tried tteokbokki for the first time. It was very spicy, but she loved it.

Hasini misses her family. She calls her mother every Sunday evening. "I'm happy here," she says, "but I miss my mother's cooking!\""""),
  dict(t='tf', title='', ins='Questions 1 to 5: circle T (true) or F (false).', items=['Hasini is studying nursing.', 'She studied in Galle for one year before she left.', 'Her jacket cost 45,000 won.', 'She has biology classes in the morning.', 'Thu is from Vietnam.']),
  dict(t='lines', title='', ins='Questions 6 to 10: answer in a few words.', items=['Who helped Hasini in her first week?', 'What time does she get up?', 'What does she find difficult?', 'What did she see at the festival? (two things)', 'When does she call her mother?']),
  dict(t='pagebreak'),
  dict(t='write', title='Part 3: Writing (20 marks)', ins='Your friend is coming to stay at Epic Campus next month. Write an email to your friend (80 to 100 words). Tell them: what your room is like; what you do on a normal day here; what food you eat; and one thing they should bring.', n=14),
 ],
 teacher=dict(
  need='Student papers, a clock on the board, spare pens. Room set out for a test.',
  aims=['Check progress at the halfway point', 'Give each student a score out of 100 (with part B) and a level', 'Find the topics to revise in Weeks 4 and 5'],
  steps=[(10, 'Settle and explain', 'Phones away. Read the instructions aloud. Write the end time of each part on the board.'), (30, 'Part 1', 'Language. Collect nothing yet.'), (35, 'Part 2', 'Reading.'), (45, 'Part 3', 'Writing. Give a 10-minute warning.')],
  answers=['**Part 1 (1 mark each):** 1 is, 2 does, 3 have, 4 gets, 5 playing, 6 are, 7 any, 8 much, 9 are playing, 10 was, 11 were, 12 visited, 13 doesn\'t, 14 left, 15 Ravi\'s, 16 have, 17 between, 18 studied, 19 Did, 20 bigger',
   '**Part 2 (2 marks each):** 1 T, 2 F (one month), 3 T, 4 F (afternoon), 5 T, 6 Min-ji (a student volunteer), 7 at seven, 8 Korean grammar, 9 lanterns and street food, 10 every Sunday evening',
   '**Part 3 (20 marks):** use the writing rubric below.'],
  extra=[('Writing rubric', WRITE_RUBRIC), ('Scoring the whole test', ['Part A: language 20 + reading 20 + writing 20 = 60. Part B: listening 20 + speaking 20 = 40.', LEVELS])],
  tips=['Mark Parts 1 and 2 at lunch with the answer key. Writing can be marked by two teachers for fairness: average the two scores.'],
 )),

dict(T, day=15, kind='Mid-programme test, part B', theme='Mid-programme test B - listening, speaking', time='10:45 to 12:30',
 title='Mid-programme test: listening and speaking', focus='Part 4 (listening, all together) then Part 5 (speaking, one by one).',
 student=[
  dict(t='mcq', title='Part 4: Listening (20 marks)', ins='Section 1: you will hear a phone call to a language school. Listen twice. Choose the correct answer.', items=[
    ('What is the caller\'s surname?', ['Fernando', 'Fonseka', 'Fernandez']), ('Which course does she want?', ['Korean', 'English', 'Japanese']), ('What day do classes start?', ['Monday', 'Tuesday', 'Saturday']),
    ('How much is the course?', ['Rs 15,000', 'Rs 50,000', 'Rs 5,000']), ('What must she bring?', ['two photos', 'her passport', 'a laptop'])]),
  dict(t='gap', title='', ins='Section 2: you will hear a student talk about her weekend. Listen twice. Write ONE word or a number.', items=['On Saturday morning she ___ her room.', 'She took the bus to ___.', 'The bus journey was ___ hours.', 'She ate lunch at her ___\'s house.', 'On Sunday it ___ all day.']),
  dict(t='note', title='Part 5: Speaking (20 marks)', items=['You will talk with the teacher for about 5 minutes, one by one.', 'Part 1: questions about you. Part 2: describe a picture or a place. Part 3: talk about your future.', 'While you wait, sit quietly and revise. Do not talk to students who have finished.']),
 ],
 teacher=dict(
  need='Listening script (below), the speaking questions, a timer, a quiet second room for speaking',
  aims=['Score listening and speaking out of 20 each', 'Hear every student speak one to one'],
  steps=[(5, 'Listening setup', 'Read instructions; give 1 minute to read the questions.'), (20, 'Listening', 'Read each section twice at a natural, slow pace.'), (75, 'Speaking', 'One by one, 5 minutes each plus 2 minutes to note scores. Other students revise in the IT lab.'), (5, 'Close', 'Collect papers. Thank everyone.')],
  script=dict(head='Section 1: phone call (then Section 2)', lines=[
    ('Receptionist', 'Good morning, Galle Language School.'), ('Caller', 'Hello. I\'d like to join a course, please.'), ('Receptionist', 'Of course. What\'s your name?'),
    ('Caller', 'Nadeesha Fonseka. That\'s F-O-N-S-E-K-A.'), ('Receptionist', 'Thank you. Which course: English, Korean or Japanese?'), ('Caller', 'Korean, please. I want to study in Korea next year.'),
    ('Receptionist', 'Great. The new class starts on Tuesday, not Monday, at nine o\'clock.'), ('Caller', 'How much is it?'), ('Receptionist', 'It\'s fifteen thousand rupees for the month.'),
    ('Caller', 'OK. Do I need to bring anything?'), ('Receptionist', 'Just two passport photos for your student card. You don\'t need your passport.'), ('Caller', 'Thank you very much!'),
    ('', '— Section 2 —'),
    ('Student', 'Last weekend was busy. On Saturday morning I cleaned my room, because it was very messy! Then I took the bus to Matara. The journey was two hours. I had lunch at my aunt\'s house; she made fish curry. On Sunday it rained all day, so I stayed in and watched a film with my cousins.')]),
  answers=['**Section 1 (2 marks each):** 1 Fonseka, 2 Korean, 3 Tuesday, 4 Rs 15,000, 5 two photos', '**Section 2 (2 marks each):** 1 cleaned, 2 Matara, 3 two (2), 4 aunt, 5 rained'],
  extra=[('Speaking questions', ['**Part 1 (1 minute):** What\'s your full name? Where are you from? Tell me about your family. What do you do in your free time?',
     '**Part 2 (2 minutes):** Describe your home town. Where is it? What can you see and do there? What do you like about it?',
     '**Part 3 (2 minutes):** What did you do last weekend? What are you going to study in Korea? Why?']), ('Speaking rubric', SPEAK_RUBRIC), ('Scoring', [LEVELS])],
 )),

dict(T, day=29, kind='Final test, part A', theme='Final test A - language, reading, writing', time='8:30 to 10:30',
 title='Final test: language, reading and writing', focus='Parts 1 to 3. 110 minutes. Write your answers on this paper.',
 student=[
  dict(t='note', title='Instructions', items=['Answer every question. There is no penalty for a wrong answer.', 'Part 1: 25 minutes. Part 2: 35 minutes. Part 3: 50 minutes.']),
  dict(t='gap', title='Part 1: Language (20 marks)', ins='Circle the correct answer.', items=[
    'I (went / have gone / go) to Kandy last month.', 'Have you ever (eat / ate / eaten) kimchi?', 'She has never (be / been / was) on a plane.', 'Next year I (study / am going to study / studied) engineering.',
    'I think it (will / is / does) rain tomorrow.', 'Seoul is (big / bigger / the biggest) than Busan.', 'This is the (good / better / best) day of my life!', 'You (must / mustn\'t / don\'t have to) smoke in the dormitory.',
    'You (should / shouldn\'t / must to) bring a warm jacket. It\'s cold.', '(Could / Do / Are) you tell me where the library is?', 'I\'m writing (for / to / at) ask about the dormitory.',
    'I study hard (because / so / but) I want a scholarship.', 'It was raining, (because / so / or) we stayed at home.', 'While I (walk / was walking / walked) home, I saw an accident.',
    'Dear Ms Park, ... (Love / Yours sincerely / Bye) , Kavindi Silva', 'How long (do you live / have you lived / are you living) in Galle?', 'There aren\'t (some / any / no) shops near my village.',
    'My brother is (good at / good in / well at) maths.', 'I\'m looking forward (to meet / meeting / to meeting) you.', 'If you have a fever, you (should / would / must to) see a doctor.']),
  dict(t='pagebreak'),
  dict(t='passage', title='Part 2: Reading (20 marks)', head='Scholarship students: the first year',
    text="""Every year, thousands of students from South and Southeast Asia start university in South Korea on scholarships. Most of them say that the first year is the hardest, but also the most exciting.

The first challenge is language. Most scholarship students study Korean full-time for one year before their degree. Classes are usually four hours a day, five days a week, and there is a test every month. Students who pass TOPIK level 3 can start their degree. Those who don't must study for another semester.

The second challenge is money. Scholarships usually pay for tuition and give a monthly allowance, but the allowance is not always enough in big cities like Seoul. Many students find part-time jobs in cafés or restaurants. However, they need permission from the university first, and they can only work a limited number of hours.

The third challenge is loneliness. Students are far from home, and winter is long and cold. Universities try to help: there are international student clubs, counselling centres and "buddy" programmes, where a Korean student helps a new international student for one semester.

Advice from former students is simple. "Speak Korean every day, even if you make mistakes," says Arun, an engineering graduate from Kandy. "Join a club. And call your family, but not every hour!"""),
  dict(t='mcq', title='', ins='Questions 1 to 5: choose the correct answer.', items=[
    ('How many hours a day are Korean classes?', ['four', 'five', 'three']), ('What happens if a student does not pass TOPIK 3?', ['they go home', 'they study another semester', 'they start their degree']),
    ('What do scholarships usually pay for?', ['tuition and an allowance', 'only tuition', 'flights']), ('Before working part-time, students need...', ['a car', 'permission from the university', 'TOPIK 6']),
    ('In a buddy programme...', ['students share a room', 'a Korean student helps a new student', 'students teach Korean'])]),
  dict(t='lines', title='', ins='Questions 6 to 10: answer in a few words.', items=['How often is there a Korean test?', 'Why is the allowance sometimes not enough?', 'Name two places where students work part-time.', 'What three things do universities offer to help lonely students?', 'What is Arun\'s first piece of advice?']),
  dict(t='pagebreak'),
  dict(t='write', title='Part 3: Writing (20 marks)', ins='Write your personal statement for a Korean university scholarship (120 to 150 words). Include: the course you want and why; your education; two strengths with examples; your goal for the future.', n=17),
 ],
 teacher=dict(
  need='Student papers, a clock on the board, spare pens',
  aims=['Measure progress since the placement test and the mid test', 'Give each student a final score out of 100 and a level for their certificate'],
  steps=[(10, 'Settle and explain', 'Phones away. Read the instructions aloud.'), (25, 'Part 1', 'Language.'), (35, 'Part 2', 'Reading.'), (50, 'Part 3', 'Writing. 10-minute warning.')],
  answers=['**Part 1 (1 mark each):** 1 went, 2 eaten, 3 been, 4 am going to study, 5 will, 6 bigger, 7 best, 8 mustn\'t, 9 should, 10 Could, 11 to, 12 because, 13 so, 14 was walking, 15 Yours sincerely, 16 have you lived, 17 any, 18 good at, 19 to meeting, 20 should',
   '**Part 2 (2 marks each):** 1 four, 2 they study another semester, 3 tuition and an allowance, 4 permission from the university, 5 a Korean student helps a new student, 6 every month, 7 big cities like Seoul are expensive, 8 cafés and restaurants, 9 international student clubs, counselling centres, buddy programmes, 10 speak Korean every day (even if you make mistakes)',
   '**Part 3:** writing rubric below. A strong statement names the course, has a real story and examples, and ends with a goal.'],
  extra=[('Writing rubric', WRITE_RUBRIC), ('Scoring the whole test', ['Part A 60 + Part B 40 = 100.', LEVELS, 'Compare with each student\'s placement and mid-programme scores in the tracker. Note the change on their certificate if you wish.'])],
 )),

dict(T, day=29, kind='Final test, part B', theme='Final test B - listening, speaking', time='10:45 to 12:30',
 title='Final test: listening and speaking', focus='Part 4 (listening, all together) then Part 5 (speaking, one by one, interview style).',
 student=[
  dict(t='table', title='Part 4: Listening (20 marks)', ins='Section 1: you will hear a call to a university international office. Listen twice and complete the notes.', head=['', ''], rows=[
    ['1 Student\'s name', 'Ravindu ___'], ['2 Arrival date', ''], ['3 Flight number', ''], ['4 Pick-up place', 'Gate ___'], ['5 Bring to orientation', 'passport and ___']]),
  dict(t='mcq', title='', ins='Section 2: you will hear a student describe her goals. Listen twice and choose the answer.', items=[
    ('What does Sanduni want to study?', ['medicine', 'computer science', 'hotel management']), ('Why?', ['her father is a doctor', 'she helped at a clinic', 'she likes science fiction']),
    ('Where does she want to work first?', ['in Seoul', 'in Sri Lanka', 'in Japan']), ('What is her weakness?', ['she is shy', 'she is late', 'her maths']),
    ('What does she do about it?', ['she joined a debate club', 'she reads novels', 'she takes extra maths'])]),
  dict(t='note', title='Part 5: Speaking (20 marks)', items=['A 6-minute interview like the scholarship interview. Answer with a point, a reason and an example.', 'Wait quietly in the IT lab until your name is called.']),
 ],
 teacher=dict(
  need='Listening script (below), interview questions, timer, quiet room',
  aims=['Score listening and speaking out of 20 each', 'Give students a last interview practice under test conditions'],
  steps=[(5, 'Listening setup', 'Read instructions; 1 minute to read the questions.'), (20, 'Listening', 'Read each section twice.'), (75, 'Speaking', 'One by one, 6 minutes each plus 1 minute for scores.'), (5, 'Close', 'Collect papers.')],
  script=dict(head='Section 1: call to the international office (then Section 2)', lines=[
    ('Officer', 'International Office, Hanbit University. How can I help?'), ('Student', 'Hello, my name is Ravindu Perera. P-E-R-E-R-A. I\'m a new scholarship student.'),
    ('Officer', 'Welcome, Ravindu. When are you arriving?'), ('Student', 'On the twenty-eighth of February, early in the morning.'), ('Officer', 'And your flight number?'), ('Student', 'It\'s KE four-seven-two.'),
    ('Officer', 'Thank you. Our volunteers will meet you at Gate six in Terminal one.'), ('Student', 'Gate six. And what do I need for orientation?'), ('Officer', 'Bring your passport and your original certificates, please.'),
    ('', '— Section 2 —'),
    ('Sanduni', 'I want to study medicine. My father isn\'t a doctor, he\'s a bus driver! But two years ago I helped at a village clinic every weekend, and I saw how much the doctors helped people. After I graduate, I want to work in Sri Lanka first, in my own district. My weakness is that I\'m quite shy, so last year I joined the school debate club. Now I can speak in front of a hundred people.')]),
  answers=['**Section 1 (2 marks each):** 1 Perera, 2 28 February, 3 KE 472, 4 Gate 6 (Terminal 1), 5 original certificates',
   '**Section 2 (2 marks each):** 1 medicine, 2 she helped at a clinic, 3 in Sri Lanka, 4 she is shy, 5 she joined a debate club'],
  extra=[('Interview questions (choose 5)', ['Tell me about yourself.', 'Why do you want to study in Korea?', 'Why did you choose this course?', 'What is your biggest strength? Give an example.', 'Tell me about a difficult experience and what you learned.', 'What will you do after you graduate?', 'How will you deal with homesickness?', 'Introduce yourself in Korean. (Score it for confidence only.)']),
     ('Speaking rubric', SPEAK_RUBRIC + ['Add a short note for each student: one strength and one thing to keep practising.']), ('Scoring', [LEVELS])],
 )),
]
