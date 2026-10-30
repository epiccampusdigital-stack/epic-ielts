R = dict(folder='Reading', kind='Reading & vocabulary', time='9:00 to 10:30', who='English Teacher 1')

LESSONS = [
dict(R, day=22, theme='Life in Korea', title='Rules, culture and daily life',
 focus='Words for rules and culture. Reading a guide to everyday life in Korea.',
 student=[
  dict(t='words', title='Rules and culture', items=['bow', 'polite', 'rude', 'elder', 'take off your shoes', 'recycling', 'rubbish', 'separate', 'queue', 'quiet', 'tip (money)', 'chopsticks', 'allowed', 'not allowed', 'custom']),
  dict(t='note', title='Rules: must, have to, should', items=['**must / have to**: it is a rule. You **must** separate your rubbish. You **have to** show your student card.', '**mustn\'t**: it is not allowed. You **mustn\'t** smoke in the dormitory.', '**don\'t have to**: it is not necessary. You **don\'t have to** tip in restaurants.', '**should**: it is good advice. You **should** learn some Korean phrases.']),
  dict(t='passage', title='Read the guide', head='Ten things to know about everyday life in Korea',
    text="""1. **Age matters.** Koreans often ask your age when they meet you. It helps them choose polite language. Speak politely to older people and bow a little when you greet them.

2. **Two hands.** When you give or receive something from an older person, such as money or a gift, use two hands.

3. **Shoes off.** Take off your shoes when you enter a home, and in some restaurants and dormitory rooms.

4. **Rubbish rules.** You must separate your rubbish into general waste, food waste and recycling. In many areas you have to buy special bags for general waste. You can get a fine if you don't follow the rules.

5. **Quiet on public transport.** People don't talk loudly on the subway, and they don't eat there. Some seats are for elderly, pregnant and disabled people. Keep them free.

6. **No tipping.** You don't have to tip in restaurants or taxis.

7. **Eating together.** Wait for the oldest person to start eating. Don't stick your chopsticks straight up in a bowl of rice; it is connected to funerals.

8. **Fast internet, fast life.** Everything is quick: delivery, buses, service. Korean people say "ppalli ppalli" (hurry, hurry)!

9. **Safety.** Korea is very safe. People often leave laptops and phones on café tables. But always keep your passport and ARC safe.

10. **Learn a few words.** Even "annyeonghaseyo" (hello) and "gamsahamnida" (thank you) make people smile."""),
  dict(t='table', title='Must, mustn\'t, don\'t have to or should?', ins='Complete with the right phrase, using the guide.', head=['Situation', 'Rule'], rows=[
    ['separate your rubbish', 'You ___'], ['tip a taxi driver', 'You ___'], ['eat on the subway', 'You ___'], ['learn some Korean words', 'You ___'], ['keep your passport safe', 'You ___'], ['use two hands with elders', 'You ___']]),
  dict(t='lines', title='Answer the questions', items=['Why do Koreans ask your age?', 'Where do you take off your shoes? (two places)', 'What three kinds of rubbish are there?', 'Why shouldn\'t you put chopsticks straight up in rice?', 'What does "ppalli ppalli" mean?']),
  dict(t='table', title='Sri Lanka and Korea', ins='Write two rules or customs from Sri Lanka that are the same, and two that are different.', head=['Same', 'Different'], rows=[['', ''], ['', '']]),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use must, have to, mustn\'t, don\'t have to and should', 'Understand practical customs in Korea', 'Compare customs politely'],
  steps=[
   (10, 'Culture quiz', 'Ask 5 quick questions: Do you tip in Korea? Shoes on or off at home? Students guess, then check in the reading later.'),
   (15, 'Grammar note', 'Read the note. Pairs make one rule about the programme for each phrase ("We must be in class at 8:30").'),
   (25, 'Reading', 'Exercises 4 and 5. Each pair explains one point to the class in their own words.'),
   (15, 'Compare', 'Exercise 6, then discuss. Model polite language: "In Sri Lanka we..., but in Korea people..."'),
   (15, 'Speaking prep', 'Tomorrow\'s speaking lesson is about giving advice. Students write 3 pieces of advice for a new Korean student coming to Sri Lanka.'),
   (10, 'Wrap-up', 'Re-do the opening quiz. How many did they get right now?'),
  ],
  answers=['**4:** separate your rubbish: must / have to. Tip a taxi driver: don\'t have to. Eat on the subway: mustn\'t / shouldn\'t. Learn some Korean words: should. Keep your passport safe: should / must. Use two hands with elders: should.',
   '**5:** 1 It helps them choose polite language. 2 Homes, some restaurants, dormitory rooms (any two). 3 General waste, food waste, recycling. 4 It is connected to funerals. 5 Hurry, hurry.'],
  tips=['Accept "shouldn\'t" for eating on the subway: it is a strong custom rather than a law. Use it to show the difference.'],
  homework='IT lab today: Day 22 lesson. Homework: write 5 rules for living in the dormitory in Korea.'
 )),

dict(R, day=24, theme='Week 4 review + phone calls', title='Week 4 review: plans for Korea',
 focus='Revising future forms, comparatives, rules and email language through a longer reading.',
 student=[
  dict(t='words', title='Week 4 words', items=['going to', 'will', 'probably', 'more expensive than', 'the best', 'must', 'should', 'I\'m writing to', 'Could you', 'appointment', 'arrive', 'orientation']),
  dict(t='passage', title='Read the email', head='From: International Office, Hanbit University',
    text="""Subject: Welcome to Hanbit University! Your arrival information

Dear new international students,

Congratulations on your scholarship! We are writing to give you important information about your arrival.

**Arrival.** You will arrive at Incheon Airport. Our student volunteers will meet you at Gate 6 in Terminal 1. They are going to wear blue T-shirts with the university name. The bus to the campus takes about three hours.

**Accommodation.** You will live in International House, our newest dormitory. Rooms are for two students. It is cheaper than private housing and it is the best place to make friends. Please note: you must not cook in your room. There is a shared kitchen on each floor.

**Orientation week.** Orientation starts on Monday 2 March. You must attend all sessions. You will open a bank account, get a phone SIM card, register for health insurance and apply for your ARC (alien registration card).

**What to bring.** The weather in March is still cold (around 5°C), so you should bring a warm jacket. You should also bring passport photos (at least six), your original certificates, and some money for the first month (we suggest 500,000 won).

**Questions?** Could you please reply by 10 February to confirm your flight number and arrival time? If you have any questions, please call us on +82 42 123 4567 (Monday to Friday, 9 am to 6 pm Korea time).

We look forward to meeting you!

Ms Park Ji-yeon
International Office"""),
  dict(t='mcq', title='Choose the correct answer', items=[
    ('Where will volunteers meet the students?', ['Gate 6, Terminal 1', 'at the campus', 'Gate 1, Terminal 6']),
    ('How will students recognise the volunteers?', ['They will hold a sign.', 'They will wear blue T-shirts.', 'They will call them.']),
    ('Why is International House good?', ['It is cheaper and good for making friends.', 'Every student has a private room.', 'You can cook in your room.']),
    ('Which is NOT in orientation week?', ['opening a bank account', 'a city tour', 'applying for an ARC']),
    ('How many passport photos should students bring?', ['at least six', 'two', 'none']),
    ('What must students do by 10 February?', ['pay the fee', 'confirm their flight details', 'call the office']),
  ]),
  dict(t='gap', title='Find the language', ins='Find and write an example from the email.', items=['a future plan with going to: ___', 'a comparative: ___', 'a superlative: ___', 'a rule with must: ___', 'advice with should: ___', 'a polite request with could: ___']),
  dict(t='write', title='Reply', ins='Write a short, polite reply to Ms Park (60 to 80 words). Give your flight number (KE 472), arrival time (6:40 am, 28 February) and ask one question.', n=8),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Recycle Week 4 language in a real-world email', 'Find specific information quickly', 'Write a short polite reply (links to Day 23 email lesson)'],
  steps=[
   (10, 'What do you need?', 'Students list everything they must do in their first week in Korea. Compare with the email later.'),
   (25, 'Reading', 'Exercise 3. Time it: 12 minutes. Then check and discuss.'),
   (15, 'Language hunt', 'Exercise 4. Pairs race to find examples.'),
   (25, 'Reply', 'Exercise 5. Remind them of the email structure from yesterday: greeting, reason, details, question, closing.'),
   (15, 'Wrap-up', 'Swap replies; partner checks for the flight number, time and a question. Week 4 quiz in the IT lab today.'),
  ],
  answers=['**3:** 1 Gate 6, Terminal 1. 2 They will wear blue T-shirts. 3 It is cheaper and good for making friends. 4 a city tour. 5 at least six. 6 confirm their flight details.',
   '**4 (examples):** going to: "They are going to wear blue T-shirts". Comparative: "cheaper than private housing". Superlative: "our newest dormitory" / "the best place". Must: "you must not cook in your room" / "You must attend all sessions". Should: "you should bring a warm jacket". Could: "Could you please reply by 10 February...?"',
   '**5 model:** Dear Ms Park, Thank you for your email. I am writing to confirm my flight details. My flight number is KE 472 and I will arrive at Incheon Airport at 6:40 am on 28 February. Could you tell me if there is a bus at that time? I look forward to meeting you. Best regards, [name]'],
  homework='IT lab today: Week 4 quiz (GE-W4). Homework: finish the reply email.'
 )),

dict(R, day=26, theme='Strengths & goals', title='Personality and skills',
 focus='Words for personality and skills. Reading three short scholarship statements.',
 student=[
  dict(t='words', title='Personality and skills', items=['hard-working', 'reliable', 'patient', 'confident', 'friendly', 'organised', 'creative', 'responsible', 'a team player', 'a good listener', 'leadership', 'problem-solving', 'communication skills']),
  dict(t='match', title='Match the person and the word', left=['She never misses a deadline.', 'He stays calm when things are slow.', 'She can speak in front of 100 people.', 'He always has new ideas.', 'She plans everything in a diary.', 'He works well in a group.'],
    right=['creative', 'patient', 'a team player', 'confident', 'organised', 'reliable']),
  dict(t='passage', title='Read the statements', head='Why should we choose you? Three answers',
    text="""**Amaya (wants to study nursing).** I am patient and a good listener. When my grandmother was sick for a year, I helped care for her every day after school. I learned how to give medicine and how to stay calm. That experience is the reason I want to become a nurse. I am also hard-working: I studied Korean by myself for six months before this programme.

**Ravindu (wants to study mechanical engineering).** I love solving problems. At home, I repair bicycles and motorbikes for my neighbours, and last year I built a small water pump for our garden. I am not the most confident speaker, but I am improving. I am reliable: in two years at my part-time job, I was never late.

**Hiruni (wants to study tourism).** I am friendly and I enjoy meeting people from other countries. I worked as a volunteer guide at Galle Fort for one summer and showed visitors from Germany, China and Korea around the city. I am a team player and I was the leader of our school's English club. My goal is to bring more Korean tourists to Sri Lanka."""),
  dict(t='table', title='Complete the table', head=['Name', 'Two strengths', 'Example (proof)'], rows=[['Amaya', '', ''], ['Ravindu', '', ''], ['Hiruni', '', '']]),
  dict(t='lines', title='Answer the questions', items=['Why does Amaya want to become a nurse?', 'What weakness does Ravindu talk about?', 'What is Hiruni\'s goal?', 'Which answer is the best, in your opinion? Why?']),
  dict(t='write', title='Your strengths', ins='Write 3 strengths. For each one, give a real example from your life. Strength, then example.', n=8),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use 13 personality and skills words', 'Understand "strength + example" structure', 'Prepare true examples for the mock interview'],
  steps=[
   (10, 'Adjectives', 'Describe a famous person or a teacher with 3 adjectives. Then the word box.'),
   (10, 'Match', 'Exercise 2.'),
   (25, 'Reading', 'Exercises 4 and 5. Focus on the structure: each strength has proof. Ravindu also mentions a weakness honestly; is that good? (Yes, if he shows improvement.)'),
   (30, 'Your strengths', 'Exercise 6. Students then tell a partner, who asks "Can you give me an example?" after every strength.'),
   (15, 'Wrap-up', 'Each student says their best strength and example in 20 seconds. Tomorrow is mock interview round 3, so this is direct preparation.'),
  ],
  answers=['**2:** deadline: reliable (F). Calm: patient (B). 100 people: confident (D). New ideas: creative (A). Diary: organised (E). Group: a team player (C).',
   '**4:** Amaya: patient, good listener, hard-working (caring for her grandmother; six months of self-study). Ravindu: problem-solving, reliable (repairs bikes, built a pump; never late in two years). Hiruni: friendly, team player, leadership (volunteer guide at Galle Fort; English club leader).',
   '**5:** 1 Because she cared for her sick grandmother. 2 He is not a confident speaker (but he is improving). 3 To bring more Korean tourists to Sri Lanka. 4 Open answer, with a reason.'],
  homework='IT lab today: Day 26 lesson. Homework: learn your 3 strengths and examples for tomorrow\'s mock interview.'
 )),

dict(R, day=28, theme='Personal statement', title='Phrases for a personal statement',
 focus='Reading two model personal statements and choosing useful phrases.',
 student=[
  dict(t='words', title='Useful phrases', items=['I am applying for', 'I have always been interested in', 'This experience taught me', 'In the future, I hope to', 'I believe I am a good candidate because', 'My long-term goal is', 'I am particularly interested in', 'I would like to contribute']),
  dict(t='passage', title='Read statement A', head='Statement A: Nursing (148 words)',
    text="""I am applying for the Bachelor of Nursing at Chungbuk University because I want to help people and I am very interested in healthcare in Korea.

I have always been interested in medicine. When my grandmother was ill for a year, I helped to care for her every day. This experience taught me to be patient, calm and responsible.

I finished my A/Ls in the science stream in 2024. Since then, I have worked as an assistant at a pharmacy in Matara, where I learned how to talk to patients and explain instructions clearly.

I believe I am a good candidate because I am hard-working and I learn quickly. I studied Korean by myself for six months and I am now preparing for TOPIK I.

In the future, I hope to work in a Korean hospital. My long-term goal is to return to Sri Lanka and train young nurses."""),
  dict(t='passage', title='Read statement B', head='Statement B: Engineering (92 words)',
    text="""I want to study engineering in Korea. Korea is a very good country. It has many good companies like Samsung and Hyundai. I like engineering very much. I am a good student. My A/L results are good. I like maths and physics. I also like playing cricket and watching movies. I am friendly and I have many friends. Korea is very beautiful and I like Korean food. Please give me this scholarship. I will study very hard. Thank you very much. I hope you choose me for this scholarship."""),
  dict(t='table', title='Compare A and B', ins='Tick (✓) the statement that does each thing.', head=['Does the writer...', 'A', 'B'], rows=[
    ['name the course and the university?', '', ''], ['explain why they are interested, with a real story?', '', ''], ['give examples to prove their strengths?', '', ''], ['talk about future goals?', '', ''], ['include information that is not relevant?', '', ''], ['use paragraphs?', '', '']]),
  dict(t='lines', title='Improve statement B', ins='Rewrite these sentences from B to make them stronger.', items=['"I like engineering very much." →', '"I am a good student." →', '"Please give me this scholarship." →']),
  dict(t='write', title='Plan your statement', ins='Make notes for your own statement: course and university / why (a story) / your education / two strengths with examples / your future goal.', n=8),
 ],
 teacher=dict(
  need='Student worksheet, board. Students bring their Day 26 strengths notes.',
  aims=['Recognise the parts of a strong personal statement', 'Collect useful phrases', 'Plan their own 150-word statement (drafted for homework tonight; the listening lesson after the break gives feedback examples)'],
  steps=[
   (10, 'What do readers want?', 'Ask: "You read 500 statements. What makes one stand out?" Board ideas.'),
   (20, 'Read A and B', 'Students read both and say which is better and why.'),
   (15, 'Compare', 'Exercise 4 in pairs.'),
   (15, 'Improve B', 'Exercise 5. Share the best rewrites.'),
   (25, 'Plan', 'Exercise 6. Go round and push for real stories and specific examples, not "I am a good student".'),
   (5, 'Wrap-up', 'Tomorrow is the final test. Tell students what to expect.'),
  ],
  answers=['**4:** Name course and university: A. Real story: A. Examples for strengths: A. Future goals: A (B only says "I will study very hard"). Not relevant information: B (cricket, movies, Korean food). Paragraphs: A.',
   '**5 (examples):** "I have always been interested in how machines work. At home I repair..." / "I achieved an A in combined maths and a B in physics at my A/Ls." / "I believe I am a good candidate because..." (end with a goal, not a request).'],
  homework='IT lab today: Day 28 lesson. Homework: write the first draft of your statement (150 words) using your plan.'
 )),
]
