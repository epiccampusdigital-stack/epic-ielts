W = dict(folder='Writing', kind='Grammar & writing', time='9:00 to 10:30', who='English Teacher 1')

LESSONS = [
dict(W, day=17, theme='Travel stories', title='Telling a story in order',
 focus='Sequencing words: first, then, after that, finally. Past simple. Writing a short travel story.',
 student=[
  dict(t='note', title='Sequencing words', items=['Start: **First,** / **At the beginning,** / **One day,**', 'Middle: **Then,** / **After that,** / **Next,** / **Later,** / **Suddenly,**', 'End: **Finally,** / **In the end,** / **At last,**', 'Put a comma after them at the start of a sentence: **After that,** we got on the train.']),
  dict(t='note', title='Irregular past verbs you need', items=['go → **went**, take → **took**, get → **got**, see → **saw**, eat → **ate**, buy → **bought**, leave → **left**, lose → **lost**, find → **found**, come → **came**, have → **had**, feel → **felt**']),
  dict(t='gap', title='Put the story in order', ins='Number the sentences 1 to 6.', items=['___ Finally, we arrived in Ella at 6 pm, tired but happy.', '___ First, we went to Kandy station at 7 am.', '___ Then, the train left and we saw beautiful tea plantations.', '___ After that, we bought our tickets and some vadai.', '___ Suddenly, it started to rain and the train stopped for an hour.', '___ Later, the rain stopped and the train started again.']),
  dict(t='passage', title='Read the model', head='The day I got lost in Colombo',
    text="""Last year I went to Colombo for the first time to visit my aunt. I was sixteen and I was very excited.

First, I took the bus from Galle. The journey was three hours long and I slept most of the way. When I got off at Pettah, the bus stand was very crowded and noisy.

Then, I looked for my aunt, but I couldn't find her. My phone battery was dead! I felt scared. After that, I asked a shopkeeper for help. He was very kind. He let me use his phone and I called my aunt.

Finally, she came and found me thirty minutes later. We laughed about it and she bought me an ice cream. I learned an important lesson: always charge your phone before a trip!"""),
  dict(t='list', title='Plan your story', items=['When and where? Who were you with?', 'First... (the start)', 'Then / After that... (what happened, a problem?)', 'Finally... (the end)', 'How did you feel? What did you learn?']),
  dict(t='write', title='Write your story', ins='Write about a trip you remember: 100 to 120 words. Use 4 sequencing words and 5 past verbs. Tonight is Presentation night #2, "My best memory", so you can use this story!', n=13),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Order events with sequencing words', 'Use common irregular past verbs', 'Write a short narrative with a beginning, middle and end'],
  steps=[
   (10, 'Story chain', 'Start a story: "Last Saturday I went to the market..." Each student adds a sentence with Then / After that.'),
   (15, 'Language', 'Both notes. Quick irregular verb quiz (say the base, students shout the past).'),
   (10, 'Order', 'Exercise 3 in pairs.'),
   (10, 'Model', 'Read the model. Mark the sequencing words and the feeling words.'),
   (35, 'Writing', 'Plan and write. Push for a problem in the middle; it makes the story interesting.'),
   (10, 'Wrap-up', 'Tell students to practise telling their story without reading for tonight.'),
  ],
  answers=['**3:** 1 First, we went to Kandy station... 2 After that, we bought our tickets... 3 Then, the train left... 4 Suddenly, it started to rain... 5 Later, the rain stopped... 6 Finally, we arrived in Ella...'],
  homework='IT lab today: Day 17 lesson. Prepare your 2-minute "My best memory" talk.'
 )),

dict(W, day=19, theme='My plans', title='Plans for my first month in Korea',
 focus='be going to for plans, and future time expressions. Writing about plans.',
 student=[
  dict(t='note', title='be going to', items=['am / is / are + **going to** + verb: I**\'m going to** study nursing. She**\'s going to** visit Seoul.', 'Negative: We **aren\'t going to** stay in the dormitory.', 'Question: **Are** you **going to** work part-time? **What are** you **going to** do?', 'Time words: **tomorrow, next week, next month, in two weeks, this weekend, soon, after the programme**']),
  dict(t='gap', title='Write sentences with going to', items=['I / call / my mother / tonight →', 'We / not / travel / next weekend →', 'She / study / engineering →', 'you / buy / a winter jacket? →', 'They / take / the TOPIK test / in April →']),
  dict(t='passage', title='Read the model', head='My plans for my first month in Korea',
    text="""I am going to fly to Korea in February. It's going to be my first time on a plane!

In my first week, I'm going to go to the orientation at my university. I'm going to open a bank account, get a Korean SIM card and apply for my ARC. I'm also going to buy a warm jacket because it's going to be cold.

After that, I'm going to start my Korean language course. I'm going to study hard because I need TOPIK level 3 before I start my degree. I'm going to join a university club, maybe the badminton club, to make Korean friends.

I'm not going to spend a lot of money in the first month. I'm going to cook in the dormitory kitchen and send photos to my family every weekend."""),
  dict(t='table', title='Your plans', ins='Make notes.', head=['Time', 'Plan'], rows=[['Before I leave Sri Lanka', ''], ['My first week in Korea', ''], ['My first month', ''], ['Something I\'m NOT going to do', '']]),
  dict(t='write', title='Write about your plans', ins='Write 100 to 120 words about your plans for your first month in Korea. Use going to at least 6 times and 3 time expressions.', n=13),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use be going to for plans in all forms', 'Use future time expressions', 'Write about personal plans (connects to the speaking lesson after the break)'],
  steps=[
   (10, 'Weekend plans', 'Ask 5 students: "What are you going to do on Sunday?" Board the answers.'),
   (15, 'Grammar', 'The note. Pronunciation: "gonna" is common in speech, but write "going to".'),
   (15, 'Practice', 'Exercise 2.'),
   (10, 'Model', 'Read it. What is the writer going to do in week one? In the first month?'),
   (30, 'Writing', 'Exercises 4 and 5. Use real information from their scholarship offers where possible.'),
   (10, 'Share', 'Students find a classmate with one plan the same as theirs.'),
  ],
  answers=['**2:** 1 I\'m going to call my mother tonight. 2 We aren\'t going to travel next weekend. 3 She\'s going to study engineering. 4 Are you going to buy a winter jacket? 5 They\'re going to take the TOPIK test in April.'],
  homework='IT lab today: Day 19 lesson. Homework: write 5 plans for after this programme.'
 )),

dict(W, day=21, theme='Studying abroad', title='Comparing two universities',
 focus='Comparatives and superlatives. Writing a comparison paragraph.',
 student=[
  dict(t='note', title='Comparatives and superlatives', items=['Short words: cheap → cheap**er** → the cheap**est**. big → big**ger** → the big**gest**. easy → eas**ier** → the eas**iest**.', 'Long words: **more** expensive → **the most** expensive. **more** modern → **the most** modern.', 'Irregular: good → **better** → **the best**. bad → **worse** → **the worst**. far → **further** → **the furthest**.', 'Use **than**: Seoul is bigger **than** Daejeon. Use **as... as**: Busan is **as** beautiful **as** Jeju? No, it is **not as** beautiful **as** Jeju.']),
  dict(t='gap', title='Write the comparative', items=['Korea is ___ (cold) than Sri Lanka.', 'English is ___ (easy) than Korean for me.', 'The dormitory is ___ (cheap) than an apartment.', 'Seoul is ___ (expensive) than Daejeon.', 'My Korean is ___ (good) now than last month.']),
  dict(t='table', title='Compare the universities', head=['', 'University A (Seoul)', 'University B (Daejeon)'], rows=[
    ['Students', '25,000', '12,000'], ['Dormitory cost / month', '₩450,000', '₩250,000'], ['Distance to the sea', '1 hour', '2.5 hours'], ['International students', '3,000', '800'], ['Ranking in Korea', '15th', '40th'], ['Part-time jobs nearby', 'many', 'some']]),
  dict(t='gap', title='Write sentences about the table', items=['University A is ___ than University B. (big)', 'The dormitory at B is ___ . (cheap)', 'A has ___ international students. (many)', 'A is ___ to the sea. (close)', 'In the ranking, A is ___ . (high)']),
  dict(t='passage', title='Read the model', head='Which university is better for me?',
    text="""University A in Seoul and University B in Daejeon are both good choices, but they are very different.

University A is bigger and more famous than University B. It is higher in the national ranking and there are more international students, so it is easier to find friends from other countries. There are also more part-time jobs in Seoul.

However, University B is much cheaper. The dormitory costs ₩250,000 a month, which is ₩200,000 less than at University A. Daejeon is also quieter and less crowded than Seoul.

For me, University B is the best choice. I need to save money, and I think a smaller city is better for studying Korean, because fewer people speak English there."""),
  dict(t='write', title='Your comparison', ins='Compare two places you know (two cities, two schools or Sri Lanka and Korea). Write 100 to 120 words with at least 5 comparatives, 1 superlative and your opinion at the end.', n=13),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Form comparatives and superlatives', 'Use data to compare', 'Write a balanced comparison with an opinion (uses "However")'],
  steps=[
   (10, 'Which is better?', 'Rice or noodles? Galle or Kandy? Students give quick opinions with "because".'),
   (15, 'Grammar', 'The note. Spelling rules on the board.'),
   (15, 'Practice', 'Exercises 2 and 4 using the table.'),
   (10, 'Model', 'Read it. Mark "However". Discuss: which university would you choose?'),
   (30, 'Writing', 'Exercise 6.'),
   (10, 'Wrap-up', 'Debate warm-up: Seoul or a smaller city? Two minutes each side.'),
  ],
  answers=['**2:** 1 colder, 2 easier, 3 cheaper, 4 more expensive, 5 better',
   '**4:** 1 bigger, 2 cheaper, 3 more, 4 closer, 5 higher'],
  homework='IT lab today: Day 21 lesson. Homework: research your own university and write 3 facts about it.'
 )),

dict(W, day=23, theme='Writing emails', title='Writing to the university',
 focus='Formal vs informal emails. Polite request language. Writing a formal email.',
 student=[
  dict(t='table', title='Formal or informal?', head=['', 'Informal (a friend)', 'Formal (the university)'], rows=[
    ['Start', 'Hi Kasun, / Hey!', 'Dear Ms Park, / Dear Sir or Madam,'], ['Reason', 'Just a quick message about...', 'I am writing to ask about...'], ['Request', 'Can you send me...?', 'Could you please send me...? / I would be grateful if you could...'], ['Contractions', 'I\'m, don\'t, can\'t', 'I am, do not, cannot'], ['End', 'See you soon! / Take care,', 'I look forward to hearing from you. / Thank you for your help.'], ['Sign off', 'Love, / Cheers, + first name', 'Yours sincerely, / Best regards, + full name']]),
  dict(t='gap', title='Make it formal', ins='Rewrite each sentence in formal language.', items=['Hi! →', 'I wanna ask about the dorm. →', 'Send me the form. →', 'Thanks a lot! →', 'Bye, Kavi →']),
  dict(t='passage', title='Read the model', head='Formal email',
    text="""Subject: Question about accommodation, student number 2026-1182

Dear Ms Park,

I am writing to ask about accommodation for new international students. I am a new student in the Korean Language Programme, starting in March 2026.

I would like to stay in the university dormitory. Could you please tell me how much it costs per month and whether meals are included? I would also be grateful if you could send me the application form.

In addition, I would like to know if there is a kitchen in the dormitory, as I am vegetarian and would like to cook my own food.

Thank you very much for your help. I look forward to hearing from you.

Yours sincerely,
Dilini Perera"""),
  dict(t='list', title='The parts of a formal email', items=['Subject line: short and clear', 'Greeting: Dear + title + surname', 'Paragraph 1: who you are and why you are writing', 'Paragraph 2 (and 3): your questions or requests, politely', 'Closing line and sign off with your full name']),
  dict(t='write', title='Write a formal email', ins='Write to the International Office (90 to 120 words). You arrive on 28 February at 6:40 am. Ask: 1) can someone meet you at the airport, 2) what documents to bring to orientation, 3) where to buy a SIM card.', n=13),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Recognise formal and informal email language', 'Use polite request forms', 'Write a formal email with the correct structure'],
  steps=[
   (10, 'Who is it to?', 'Show two greetings ("Hey bro!" / "Dear Professor Lee,"). Ask who each email is to and why.'),
   (15, 'Formal vs informal', 'The table. Students say the formal version of informal lines.'),
   (10, 'Practice', 'Exercise 2.'),
   (10, 'Model', 'Read and label the parts using exercise 4.'),
   (35, 'Writing', 'Exercise 5. Check structure first, then grammar.'),
   (10, 'Wrap-up', 'Tonight: Debate night #2, "Is studying abroad worth it?" Students note 2 points for and 2 against.'),
  ],
  answers=['**2 (examples):** Dear Sir or Madam, / I am writing to ask about the dormitory. / Could you please send me the form? / Thank you very much for your help. / Yours sincerely, Kavindi Silva'],
  homework='IT lab today: Day 23 lesson. Homework: write an informal email to a friend about your week (60 words).'
 )),

dict(W, day=25, theme='Talking about experiences', title='Have you ever...?',
 focus='Present perfect with ever / never, and past simple for details. Writing about experiences.',
 student=[
  dict(t='note', title='Present perfect', items=['have / has + past participle: I **have visited** Kandy. She **has eaten** kimchi.', 'Experiences at any time in your life: **Have** you **ever been** on a plane? No, I**\'ve never been** on a plane.', 'Past participles: be → **been**, see → **seen**, eat → **eaten**, go → **gone/been**, do → **done**, write → **written**, meet → **met**, win → **won**', 'Give details with the **past simple**: I**\'ve been** to Jaffna. I **went** there in 2023 and I **visited** the library.']),
  dict(t='gap', title='Write the present perfect', items=['I ___ (never / see) snow.', '___ you ___ (ever / eat) sushi?', 'She ___ (visit) Sigiriya three times.', 'We ___ (never / travel) by plane.', 'He ___ (win) a prize in a singing competition.']),
  dict(t='gap', title='Present perfect or past simple?', items=['I (have been / went) to Nuwara Eliya. I (have been / went) there last December.', '(Have you ever met / Did you ever meet) a famous person?', 'Yes! I (have met / met) Kumar Sangakkara at an event in 2022.']),
  dict(t='passage', title='Read the model', head='Experiences that changed me',
    text="""I have never been abroad, but I have had some important experiences in Sri Lanka.

I have worked as a volunteer. In 2024 I helped at a school for children with disabilities in Galle every Saturday for six months. It taught me to be patient and to communicate without many words.

I have also won a prize. Last year my team won the provincial debate competition. I was nervous, but I spoke clearly and our team got the highest score.

I have never seen snow and I have never eaten Korean food in Korea. I hope these will be my next new experiences!"""),
  dict(t='table', title='Your experiences', head=['Experience (present perfect)', 'Details (past simple: when, where, what happened)'], rows=[['I have...', ''], ['I have...', ''], ['I have never...', '']]),
  dict(t='write', title='Write about your experiences', ins='Write 100 to 120 words. Two experiences with details, and one thing you have never done but want to do. Interviewers often ask "Tell me about an experience that changed you."', n=13),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use the present perfect for life experiences', 'Switch to past simple for details', 'Write about meaningful experiences for interviews'],
  steps=[
   (10, 'Never have I ever', 'Students hold up 5 fingers. Say "I have never..." statements; fold a finger if you have done it.'),
   (15, 'Grammar', 'The note. Past participle list drill.'),
   (15, 'Practice', 'Exercises 2 and 3. Focus on the switch: experience → detail.'),
   (10, 'Model', 'Read it. Underline present perfect in one colour and past simple in another.'),
   (30, 'Writing', 'Exercise 5 notes then exercise 6.'),
   (10, 'Wrap-up', 'Pairs: "Have you ever...?" interviews using their notes. Mock interview round 3 is in two days.'),
  ],
  answers=['**2:** 1 have never seen, 2 Have you ever eaten, 3 has visited, 4 have never travelled, 5 has won',
   '**3:** have been / went. Have you ever met. met (2022 is a finished time).'],
  homework='IT lab today: Day 25 lesson. Homework: list 5 experiences you could talk about in an interview.'
 )),

dict(W, day=27, theme='The scholarship interview', title='Answers with point, reason, example',
 focus='Structuring answers: point, reason, example (PRE). Linking with because, so, for example, also.',
 student=[
  dict(t='note', title='The PRE answer', items=['**Point**: answer the question directly. "I want to study nursing."', '**Reason**: say why. "**because** I enjoy helping people and healthcare is growing."', '**Example**: prove it with something real. "**For example**, I cared for my grandmother for a year..."', '**(Link back)**: "**So**, I believe nursing is the right career for me."']),
  dict(t='table', title='Useful linking words', head=['To...', 'Use'], rows=[['give a reason', 'because, as, the main reason is'], ['give a result', 'so, that is why'], ['give an example', 'for example, for instance, when I...'], ['add a point', 'also, in addition, another reason is'], ['contrast', 'but, however, although']]),
  dict(t='passage', title='Read two answers', head='Question: Why do you want to study in Korea?',
    text="""**Answer 1:** Because Korea is good. I like Korea. I like K-pop and Korean food. Korea is a developed country. I want to go.

**Answer 2:** I want to study in Korea because it is a world leader in technology and education. For example, Korean companies like Samsung and LG are famous all over the world, and Korean universities have excellent engineering programmes. Also, I have studied Korean for six months and I really enjoy learning the language. So I believe studying in Korea will give me the best start to my career."""),
  dict(t='table', title='Analyse answer 2', ins='Copy the words from answer 2.', head=['Part', 'Words from answer 2'], rows=[['Point', ''], ['Reason', ''], ['Example', ''], ['Extra point', ''], ['Link back', '']]),
  dict(t='write', title='Write PRE answers', ins='Write a PRE answer (50 to 70 words each) for two questions: A) What will you study and why? B) What is your biggest strength? Use the planning from Days 25 and 26.', n=14),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Structure answers with point, reason, example', 'Use linking words naturally', 'Prepare written answers for the mock interview round 3 after the break'],
  steps=[
   (10, 'Bad answer, good answer', 'Act out answer 1 and answer 2. Ask which is better and why.'),
   (15, 'PRE', 'Explain the note and linking words.'),
   (15, 'Analyse', 'Exercise 4 in pairs.'),
   (35, 'Writing', 'Exercise 5. Students read each answer aloud to a partner, who checks: P? R? E?'),
   (15, 'Practice', 'Quick-fire: you ask a question, a student answers in PRE in 30 seconds. Rotate.'),
  ],
  answers=['**4:** Point: "I want to study in Korea". Reason: "because it is a world leader in technology and education". Example: "For example, Korean companies like Samsung and LG... excellent engineering programmes". Extra point: "Also, I have studied Korean for six months...". Link back: "So I believe studying in Korea will give me the best start to my career."'],
  tips=['Students tend to memorise answers word for word. Encourage notes (key words), not scripts, so they sound natural.'],
  homework='IT lab today: Day 27 lesson. Homework: write PRE answers to 3 more interview questions.'
 )),
]
