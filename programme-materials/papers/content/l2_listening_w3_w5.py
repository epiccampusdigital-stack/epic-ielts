L = dict(folder='Listening', kind='Listening', time='1:15 to 2:45', who='English Teacher 3')

LESSONS = [
dict(L, day=16, theme='School & education', title='Students talk about school',
 focus='Listening to opinions about school and university. Identifying speakers and reasons.',
 student=[
  dict(t='words', title='Words you will hear', items=['strict', 'stressful', 'tuition', 'favourite subject', 'campus', 'group project', 'presentation', 'freedom']),
  dict(t='match', title='Part 1: who says it?', ins='Listen to three students. Match each person with their opinion.', left=['Sanduni', 'Min-seo', 'Arjun'],
    right=['University gives me more freedom than school.', 'Tuition classes made me tired but helped me pass.', 'Group projects are difficult but I learn a lot.']),
  dict(t='mcq', title='Part 1: details', items=[('What was Sanduni\'s favourite subject?', ['biology', 'maths', 'English']), ('How many hours did Min-seo study at hagwon?', ['two', 'four', 'six']), ('Arjun\'s university is in...', ['India', 'Korea', 'Sri Lanka']), ('What is hard for Arjun in group projects?', ['the language', 'the time', 'the teacher'])]),
  dict(t='table', title='Part 2: a lecture announcement', ins='Complete the notes.', head=['', ''], rows=[['Lecture topic', ''], ['Day and time', ''], ['Room', ''], ['Bring', ''], ['Assignment due', '']]),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Identify speakers\' opinions and reasons', 'Note practical details from an announcement'],
  steps=[
   (10, 'Opinion line', 'Stand on a line from "School was great" to "School was terrible". Explain why.'),
   (5, 'Words', 'Word box.'),
   (25, 'Part 1', 'Read twice. Match, then details.'),
   (15, 'Part 2', 'Read twice.'),
   (30, 'Discussion', 'Groups: Was school stressful for you? Would you like more freedom? Use reasons.'),
   (5, 'Check', 'Answers.'),
  ],
  script=dict(head='Part 1: three students', lines=[
   ('Sanduni', 'I\'m from Kandy. At A/L I studied biology, chemistry and physics, and biology was my favourite. School was OK, but the tuition classes every evening and weekend were exhausting. I was always tired. But honestly, they helped me pass my exams.'),
   ('Min-seo', 'In Korea, high school is very stressful. After school I went to a hagwon for four hours every day. Now at university it\'s different. I choose my classes and my timetable. I have much more freedom, and I love it.'),
   ('Arjun', 'I\'m from India, but I study engineering in Korea. Here we do a lot of group projects with Korean students. It\'s difficult because they speak Korean fast and I miss things. But I learn a lot, about engineering and about teamwork.'),
   ('', '— Part 2: announcement —'),
   ('Professor', 'Good morning, everyone. Next week\'s lecture is on renewable energy. It\'s on Tuesday at ten o\'clock, not Monday. We\'ll be in room 305 in the Science Building. Please bring your laptop. And remember, your first assignment is due on Friday the twentieth. No late assignments, please!')]),
  answers=['**Match:** Sanduni: tuition classes made me tired but helped me pass. Min-seo: university gives me more freedom. Arjun: group projects are difficult but I learn a lot.',
   '**Details:** 1 biology, 2 four, 3 Korea, 4 the language',
   '**Part 2:** renewable energy; Tuesday 10:00; room 305, Science Building; laptop; Friday 20th'],
  homework='IT lab today: Day 16 lesson. Homework: write 4 sentences about your school days: one good thing, one bad thing.'
 )),

dict(L, day=18, theme='Week 3 review + health', title='Week 3 listening review: at the clinic',
 focus='Listening at a clinic and a pharmacy. Reviewing past tense listening from Week 3.',
 student=[
  dict(t='table', title='Part 1: at the clinic', ins='Listen to a student and a doctor. Complete the patient card.', head=['Patient card', ''], rows=[['Name', 'Pasindu Gamage'], ['Problem', ''], ['Started', ''], ['Temperature', ''], ['Medicine', ''], ['Take it', ''], ['Come back if', '']]),
  dict(t='mcq', title='Part 2: at the pharmacy', items=[('What does the customer want?', ['something for a cough', 'something for a headache', 'plasters']), ('How many tablets can he take in a day?', ['two', 'four', 'six']), ('What must he NOT do?', ['drink water', 'take them on an empty stomach', 'sleep']), ('How much does it cost?', ['₩3,500', '₩5,300', '₩3,000'])]),
  dict(t='gap', title='Part 3: Week 3 review, what happened?', ins='Listen to the short story and complete each sentence with one past verb.', items=['Last Friday, Kasun ___ his phone on the bus.', 'He ___ to the bus company.', 'A kind woman ___ it.', 'She ___ the phone to the office.', 'Kasun ___ her with a box of chocolates.']),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Understand medical instructions', 'Catch numbers and times in a health context', 'Review past simple listening'],
  steps=[
   (10, 'What\'s the matter?', 'Mime illnesses; students say "You have a..." and give advice.'),
   (20, 'Part 1', 'Read twice.'),
   (15, 'Part 2', 'Read twice.'),
   (15, 'Part 3', 'Read twice.'),
   (25, 'Doctor role-play', 'Pairs: patient and doctor. Use the patient card. Then pharmacy.'),
   (5, 'Check', 'Week 3 quiz in the IT lab.'),
  ],
  script=dict(head='Part 1: at the clinic', lines=[
   ('Doctor', 'Hello, Pasindu. What\'s the problem?'), ('Pasindu', 'I have a sore throat and a fever. I feel terrible.'), ('Doctor', 'When did it start?'), ('Pasindu', 'Two days ago, on Wednesday night.'),
   ('Doctor', 'Let me check your temperature... It\'s thirty-eight point five. You have an infection. I\'ll give you some antibiotics.'), ('Pasindu', 'How do I take them?'),
   ('Doctor', 'Three times a day, after meals, for five days. Drink a lot of water and rest. Come back if you still have a fever after three days.'),
   ('', '— Part 2: at the pharmacy —'),
   ('Customer', 'Hi, do you have something for a headache?'), ('Pharmacist', 'Yes, these tablets are good. Take one or two, up to four times a day, so no more than... let me see, no more than six in a day.'),
   ('Customer', 'OK.'), ('Pharmacist', 'Don\'t take them on an empty stomach. Eat something first.'), ('Customer', 'How much are they?'), ('Pharmacist', 'Three thousand five hundred won.'),
   ('', '— Part 3: a short story —'),
   ('Narrator', 'Last Friday, Kasun lost his phone on the bus. He was very worried. He called the bus company and explained the problem. Luckily, a kind woman found the phone under a seat. She took it to the bus company office. The next day Kasun collected his phone, and he thanked the woman with a box of chocolates.')]),
  answers=['**Part 1:** sore throat and fever; two days ago (Wednesday night); 38.5; antibiotics; three times a day after meals for five days; still a fever after three days',
   '**Part 2:** 1 something for a headache, 2 six, 3 take them on an empty stomach, 4 ₩3,500',
   '**Part 3:** 1 lost, 2 called (explained), 3 found, 4 took, 5 thanked'],
  tips=['Item 2 has a distractor ("up to four times a day"). Ask students to explain why the answer is six.'],
  homework='IT lab today: Week 3 quiz. Homework: learn the patient card questions.'
 )),

dict(L, day=22, theme='Life in Korea', title='Advice for a new student',
 focus='Listening to advice from senior students. Should, must, have to in real speech.',
 student=[
  dict(t='table', title='Part 1: three pieces of advice', ins='Listen to three senior students. Complete the table.', head=['Speaker', 'Topic', 'Advice', 'Why'], rows=[['Thilini', '', '', ''], ['Do-hyun', '', '', ''], ['Ahmed', '', '', '']]),
  dict(t='tf', title='Part 2: the dormitory rules', ins='Listen to the dormitory manager. True or false?', items=['Students must be back by 11 pm.', 'Visitors can stay overnight.', 'You have to separate food waste.', 'Cooking in your room is allowed.', 'The laundry room is open 24 hours.', 'Students should tell the office if they travel.']),
  dict(t='write', title='Your advice', ins='Write 3 pieces of advice for a Korean student coming to Sri Lanka. Use should / must / don\'t have to.', n=5),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Understand advice and rules in natural speech', 'Note reasons behind advice'],
  steps=[
   (10, 'Advice chain', '"If you go to Korea, you should..." Each student adds one.'),
   (25, 'Part 1', 'Read twice.'),
   (20, 'Part 2', 'Read twice.'),
   (25, 'Your advice', 'Exercise 3; then pairs role-play a Korean visitor asking for advice about Sri Lanka.'),
   (10, 'Check', 'Answers.'),
  ],
  script=dict(head='Part 1: senior students', lines=[
   ('Thilini', 'My advice is about money. You should open a Korean bank account in your first week, because many shops prefer cards, and you need an account for your part-time job salary.'),
   ('Do-hyun', 'I\'m Korean, and I help international students. My advice: join a club. You don\'t have to be good at sports or music. It\'s the best way to make Korean friends and practise speaking.'),
   ('Ahmed', 'My advice is about food. Learn to cook simple Korean dishes. Eating out every day is expensive, and the dormitory kitchen is free. Also, you must check for pork in food if you don\'t eat it; it\'s in a lot of dishes.'),
   ('', '— Part 2: dormitory manager —'),
   ('Manager', 'Welcome to International House. A few rules. The front door closes at midnight, so you must be back by twelve. Visitors are welcome until ten pm, but they cannot stay overnight. You have to separate your rubbish: general, recycling and food waste. Please don\'t cook in your room; use the kitchen on your floor. The laundry room is open from seven am to eleven pm. And if you travel for more than one night, you should tell the office, just for safety.')]),
  answers=['**Part 1:** Thilini: money; open a bank account in week one; shops prefer cards and you need it for your salary. Do-hyun: friends / clubs; join a club; best way to make Korean friends and practise. Ahmed: food; learn to cook simple Korean dishes (check for pork); eating out is expensive, the kitchen is free.',
   '**Part 2:** 1 F (by midnight), 2 F, 3 T, 4 F, 5 F (7 am to 11 pm), 6 T'],
  homework='IT lab today: Day 22 lesson. Homework: write 5 rules for a good roommate.'
 )),

dict(L, day=24, theme='Week 4 review + phone calls', title='Week 4 listening review: phone calls and appointments',
 focus='Making and understanding appointments on the phone. Reviewing future forms.',
 student=[
  dict(t='table', title='Part 1: booking an appointment', ins='Listen to a student call the international office. Complete the notes.', head=['', ''], rows=[['Reason for the call', ''], ['Day', ''], ['Time', ''], ['Person to see', ''], ['Bring', ''], ['Office location', '']]),
  dict(t='mcq', title='Part 2: four short calls', items=[('Call 1: The student is going to...', ['cancel a class', 'change an appointment', 'ask about a fee']), ('Call 2: The bank will be closed on...', ['Monday', 'Wednesday', 'Saturday']), ('Call 3: The delivery will arrive...', ['this afternoon', 'tomorrow morning', 'tomorrow evening']), ('Call 4: The friend can\'t come because...', ['she is ill', 'she has an exam', 'she is working'])]),
  dict(t='table', title='Phone language', ins='Listen again and write the phrases you hear for...', head=['...starting a call', '...asking to repeat', '...ending a call'], rows=[['', '', ''], ['', '', '']]),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Follow a phone call and note appointment details', 'Recognise useful phone phrases', 'Review will and going to in listening'],
  steps=[
   (10, 'Phone warm-up', 'Back-to-back phone calls (students sit back to back so they can\'t see faces).'),
   (20, 'Part 1', 'Read twice.'),
   (20, 'Part 2', 'Read twice.'),
   (10, 'Phrases', 'Exercise 3.'),
   (25, 'Role-play', 'Back to back again: students make appointments (doctor, bank, office) and write the details.'),
   (5, 'Check', 'Week 4 quiz in the IT lab.'),
  ],
  script=dict(head='Part 1: the international office', lines=[
   ('Officer', 'Good morning, International Office, this is Ji-yeon speaking. How can I help you?'), ('Student', 'Hello, my name is Ravindu Silva. I\'d like to make an appointment to apply for my ARC.'),
   ('Officer', 'Of course. How about Thursday?'), ('Student', 'Sorry, could you repeat that?'), ('Officer', 'Thursday, this Thursday.'), ('Student', 'Yes, Thursday is fine. What time?'),
   ('Officer', 'Two thirty in the afternoon. You\'ll see Mr Choi. Please bring your passport, two photos and your student certificate.'), ('Student', 'Where is the office?'),
   ('Officer', 'Room 104, on the first floor of the Student Centre.'), ('Student', 'Great, thank you. See you on Thursday.'), ('Officer', 'You\'re welcome. Goodbye!'),
   ('', '— Part 2: four short calls —'),
   ('1', 'Hi, it\'s Amaya. I\'m going to be late for my appointment with Professor Kim tomorrow. Could I change it to Friday?'),
   ('2', 'This is a message from Hana Bank. Please note we will be closed on Wednesday for a national holiday. We are open as normal on Monday and Saturday.'),
   ('3', 'Hello, your parcel is on the way. It won\'t arrive this afternoon, sorry. It will arrive tomorrow morning between nine and twelve.'),
   ('4', 'Hey, it\'s Sachini. I\'m really sorry, I can\'t come to dinner tonight. I\'m not ill, but I have a big exam tomorrow and I need to study. Next week?')]),
  answers=['**Part 1:** apply for the ARC; Thursday; 2:30 pm; Mr Choi; passport, two photos, student certificate; Room 104, first floor, Student Centre',
   '**Part 2:** 1 change an appointment, 2 Wednesday, 3 tomorrow morning, 4 she has an exam',
   '**Phrases:** start: "Good morning, International Office, this is... speaking. How can I help you?" / "Hello, my name is..." Repeat: "Sorry, could you repeat that?" End: "See you on Thursday." / "You\'re welcome. Goodbye!"'],
  homework='IT lab today: Week 4 quiz. Homework: call a friend and practise making a plan in English.'
 )),

dict(L, day=26, theme='Strengths & goals', title='Students describe their goals',
 focus='Listening for goals, reasons and plans. Understanding longer answers.',
 student=[
  dict(t='table', title='Part 1: three students, three goals', ins='Listen and complete.', head=['Name', 'Wants to study', 'Goal after graduation', 'Strength they mention'], rows=[['Nethmi', '', '', ''], ['Lakshan', '', '', ''], ['Yasodha', '', '', '']]),
  dict(t='mcq', title='Part 2: details', items=[('Why did Nethmi choose IT?', ['her brother works in IT', 'she built an app', 'it pays well']), ('What problem does Lakshan want to solve?', ['traffic', 'water for farmers', 'pollution']), ('Where does Yasodha want to work?', ['in a hotel in Korea', 'in a hospital', 'at an airport in Sri Lanka']), ('Which student mentions a weakness?', ['Nethmi', 'Lakshan', 'Yasodha'])]),
  dict(t='list', title='Discuss', items=['Which student has the clearest goal? Why?', 'What is your goal after graduation? What strength will help you?']),
 ],
 teacher=dict(
  need='Student worksheet, this script',
  aims=['Follow longer turns and pick out key information', 'Notice good interview-answer structure in others'],
  steps=[
   (10, 'Goal talk', 'Students tell a partner one goal for next year.'),
   (30, 'Part 1', 'Read twice. Students may need a third listen for the table.'),
   (15, 'Part 2', 'Answer from memory, then check with one more reading.'),
   (25, 'Discuss', 'Exercise 3. Link to tomorrow\'s mock interview round 3.'),
   (10, 'Check', 'Answers.'),
  ],
  script=dict(head='Three students', lines=[
   ('Nethmi', 'I want to study computer science. When I was seventeen, I built a small app for my mother\'s bakery so customers could order cakes online. That\'s when I fell in love with IT. After graduation, my goal is to work for a Korean tech company for a few years and then start my own company in Sri Lanka. My strength is that I\'m very creative.'),
   ('Lakshan', 'I\'m going to study civil engineering. My village has a big problem with water. In the dry season, the farmers don\'t have enough water for their fields. I want to learn how to build better irrigation systems and come home to solve this problem. I\'m a good problem-solver. My weakness is public speaking, but I\'m practising every day here.'),
   ('Yasodha', 'I want to study hospitality and tourism management. I love meeting people, and I speak English, Sinhala and a little Tamil, and now I\'m learning Korean. My goal is to work as a manager in a big hotel in Korea, maybe in Jeju, and later bring that experience back to Sri Lanka. My strength is communication.')]),
  answers=['**Part 1:** Nethmi: computer science; work for a Korean tech company, then start her own company in Sri Lanka; creative. Lakshan: civil engineering; build irrigation systems and solve his village\'s water problem; problem-solving. Yasodha: hospitality and tourism management; hotel manager in Korea (maybe Jeju), later bring experience back; communication.',
   '**Part 2:** 1 she built an app, 2 water for farmers, 3 in a hotel in Korea, 4 Lakshan'],
  homework='IT lab today: Day 26 lesson. Homework: prepare for mock interview round 3 tomorrow afternoon.'
 )),

dict(L, day=28, theme='Personal statement', title='Feedback on personal statements',
 focus='Listening to a teacher give feedback on statements. Understanding advice and applying it.',
 student=[
  dict(t='table', title='Part 1: feedback on two statements', ins='Listen to a teacher giving feedback. Write what is good and what to improve.', head=['Statement', 'Good', 'Improve'], rows=[['Kasun\'s statement', '', ''], ['Hiruni\'s statement', '', '']]),
  dict(t='tf', title='Part 2: general tips', ins='Listen to the end of the talk. True or false?', items=['A statement should be about 300 words.', 'You should give real examples.', 'It\'s OK to copy a statement from the internet.', 'You should ask someone to check your grammar.', 'The last sentence should talk about your future.']),
  dict(t='write', title='Improve your statement', ins='Write two changes you will make to your own statement after today\'s feedback.', n=5),
 ],
 teacher=dict(
  need='Student worksheet, this script, students\' statement drafts (homework from this morning)',
  aims=['Understand spoken feedback', 'Apply feedback to their own personal statement'],
  steps=[
   (10, 'Swap', 'Students swap statement drafts; partner underlines the best sentence.'),
   (25, 'Part 1', 'Read twice.'),
   (15, 'Part 2', 'Read twice.'),
   (30, 'Improve', 'Students revise their statement with the feedback; you give each student one comment.'),
   (10, 'Final test briefing', 'Tomorrow is the final test. Explain timing and what to bring.'),
  ],
  script=dict(head='Teacher feedback', lines=[
   ('Teacher', 'Let\'s look at Kasun\'s statement first. Kasun, the best thing is your story about helping at your uncle\'s garage. It shows why you want mechanical engineering, and it\'s real. But you only wrote eighty words. You need more detail: what you learned, and your goals. Also, check your past tenses; you wrote "I help my uncle" but it should be "I helped".'),
   ('Teacher', 'Now Hiruni. Your statement is well organised, with clear paragraphs, and your vocabulary is excellent. However, the beginning is very general: "Korea is a beautiful country with a rich culture." Everyone writes that! Start with something about you. And please remove the paragraph about your favourite K-dramas. It isn\'t relevant.'),
   ('Teacher', 'Some general tips. Your statement should be around one hundred and fifty words, not three hundred. Give real examples, because examples prove what you say. Never copy from the internet; universities check, and they can tell. Ask a teacher or friend to check your grammar. And finally, end with your future goal, so the reader remembers where you are going.')]),
  answers=['**Part 1:** Kasun: good: a real story (uncle\'s garage) that shows why he wants engineering; improve: too short (80 words), add what he learned and his goals, check past tenses. Hiruni: good: well organised, clear paragraphs, excellent vocabulary; improve: general beginning, start with something about her; remove the K-drama paragraph (not relevant).',
   '**Part 2:** 1 F (about 150), 2 T, 3 F, 4 T, 5 T'],
  homework='IT lab today: Day 28 lesson. Homework: write the final version of your personal statement.'
 )),
]
