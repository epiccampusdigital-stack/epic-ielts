S = dict(folder='Speaking', kind='Speaking', time='1:15 to 2:45', who='English Teacher 2')

LESSONS = [
dict(S, day=13, theme='Yesterday', title='Where were you yesterday?',
 focus='Asking and answering about the past with was / were. A detective game.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['ask where', 'Where were you at 8 o\'clock last night?'], ['ask who', 'Who were you with? / Was anyone with you?'], ['ask how', 'How was the food? / Were you tired?'],
    ['answer', 'I was in the library. / I was with Kasun. / It was great.'], ['not sure', 'I think I was... / I\'m not sure. Maybe I was...']]),
  dict(t='note', title='Pronunciation', items=['**was** is weak in sentences: I /wəz/ at home. Strong in short answers: Yes, I **/wɒz/**.', '**weren\'t** = /wɜːnt/, one syllable.']),
  dict(t='cards', title='The detective game: the missing cake', ins='Someone ate the birthday cake from the staff room between 7 and 9 pm last night! Two students are suspects. They go outside and agree on a story. Detectives ask questions to each one separately. If their answers are different, they are guilty!', items=[
    ('Detectives: ask about', ['Where were you at 7? at 8? at 9?', 'Who were you with?', 'What was on TV? / What was the weather like?', 'What did you eat for dinner?', 'Was the door open or closed?']),
    ('Suspects: agree on', ['Where you were, minute by minute', 'Who was with you', 'What you saw and heard', 'What you ate', 'Small details (colours, times)'])]),
  dict(t='table', title='My yesterday', ins='Ask a partner about yesterday and write short answers.', head=['Time', 'Where were you?', 'Who with?', 'How was it?'], rows=[['7 am', '', '', ''], ['12 pm', '', '', ''], ['5 pm', '', '', ''], ['9 pm', '', '', '']]),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Ask and answer questions with was / were fluently', 'Use weak and strong forms of was', 'Ask detailed follow-up questions'],
  steps=[
   (10, 'Where was I?', 'Students guess where you were yesterday at different times. Answer yes / no only.'),
   (10, 'Useful language', 'The table and pronunciation.'),
   (15, 'My yesterday', 'Exercise 4 in pairs.'),
   (40, 'Detective game', 'Run 2 rounds. Suspects get 5 minutes outside to agree on a story. Detectives prepare 10 questions. Interview each suspect separately (3 minutes). Class votes: guilty or not?'),
   (15, 'Feedback', 'Good questions you heard; common was / were errors.'),
  ],
  homework='IT lab today: Day 13 lesson. Homework: diary entry (3 sentences) with was / were.'
 )),

dict(S, day=17, theme='Travel stories', title='Telling a short travel story',
 focus='Telling a story with sequencing and feelings. Listening and reacting. Preparing for Presentation night #2.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['start', 'Let me tell you about... / This happened last year when...'], ['order events', 'First... Then... After that... Suddenly... In the end...'], ['say how you felt', 'I was so nervous / excited / scared / relieved.'],
    ['end', 'It was the best day ever. / I\'ll never forget it.'], ['react (listener)', 'Really? / Oh no! / What happened next? / That\'s amazing!']]),
  dict(t='cards', title='Story ideas', items=[('A trip', ['The first time you went somewhere new', 'A school trip', 'A pilgrimage or a long bus journey']), ('A problem', ['You got lost', 'You missed a bus or train', 'It rained on a special day']),
    ('A surprise', ['A surprise party', 'Meeting someone unexpected', 'Good news you received']), ('A first time', ['The first time you cooked for your family', 'Your first job', 'Your first exam result'])]),
  dict(t='table', title='Story plan', head=['Part', 'Key words only'], rows=[['When and where', ''], ['Who', ''], ['First', ''], ['Then / Suddenly (the problem)', ''], ['In the end', ''], ['How I felt / what I learned', '']]),
  dict(t='note', title='Presentation night #2 tonight: "My best memory"', items=['2 minutes each.', 'Bring a photo if you have one.', 'Use your plan, but don\'t read.', 'Listeners: ask one question after each talk.']),
 ],
 teacher=dict(
  need='Student worksheet, board, timer',
  aims=['Tell a 2-minute story in the past with clear order', 'Show feelings and react to others\' stories', 'Rehearse tonight\'s presentation'],
  steps=[
   (10, 'Teacher story', 'Tell a short true story using the phrases. Students note the sequencing words they hear.'),
   (10, 'Useful language', 'The table. Practise reactions with a "story ping-pong": one sentence, one reaction.'),
   (15, 'Plan', 'Exercise 2 and 3. Key words only.'),
   (30, 'Story circles', 'Groups of 3. Each tells their story; listeners must react at least 3 times and ask 2 questions. Change groups and tell it again (it gets better the second time).'),
   (20, 'Rehearse', 'Time each student: 2 minutes. Give one tip each.'),
   (5, 'Tonight', 'Running order for Presentation night #2.'),
  ],
  homework='IT lab today: Day 17 lesson. Presentation night at 7:30 pm.'
 )),

dict(S, day=19, theme='My plans', title='Talking about plans',
 focus='Plans and arrangements with going to. Inviting, accepting and refusing.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['ask about plans', 'What are you going to do this weekend / after the programme?'], ['talk about plans', 'I\'m going to... / I\'m planning to... / I\'m hoping to...'], ['invite', 'Would you like to...? / Do you want to...? / Why don\'t we...?'],
    ['accept', 'Sure, I\'d love to! / Sounds great! What time?'], ['refuse politely', 'Sorry, I can\'t. I\'m going to... / I\'d love to, but...'], ['agree a time', 'How about Saturday at 3? / Let\'s meet at the main gate.']]),
  dict(t='table', title='My week in Korea', ins='Fill in 4 plans. Leave 3 spaces free. Then invite classmates to do things and agree times.', head=['', 'Morning', 'Afternoon', 'Evening'], rows=[['Saturday', '', '', ''], ['Sunday', '', '', ''], ['Monday', '', '', '']]),
  dict(t='cards', title='Invitation ideas', items=[('In Seoul', ['visit Gyeongbokgung Palace', 'go shopping in Myeongdong', 'see the Han River at night']), ('At university', ['join the badminton club', 'study together for TOPIK', 'go to the international student party']),
    ('Food', ['try Korean BBQ', 'cook Sri Lankan food in the dorm kitchen', 'go to a night market']), ('Other', ['watch a K-league football match', 'go to a noraebang (karaoke)', 'visit the beach in Busan'])]),
  dict(t='lines', title='Talk about your future', ins='Prepare an answer for each question (key words). Then ask a partner.', items=['What are you going to do in your first week in Korea?', 'What are you going to study and why?', 'Where are you going to live?', 'What are you going to do after you graduate?']),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Talk about plans fluently with going to', 'Invite, accept and refuse politely', 'Answer interview-style questions about the future'],
  steps=[
   (10, 'Weekend chat', 'Ask several students about their plans for Sunday.'),
   (10, 'Useful language', 'The table; practise polite refusals (never just "No").'),
   (30, 'My week in Korea', 'Exercise 2 mingle. Students must fill all free spaces by inviting others and agreeing times. Report: "On Saturday afternoon I\'m going to visit the palace with Kavindi."'),
   (25, 'Future questions', 'Exercise 4 in pairs, then switch partners. Partner asks one follow-up question each time.'),
   (15, 'Feedback', 'Focus on natural invitations and on "I\'m going to go to..." (fine) vs "I going to" (error).'),
  ],
  homework='IT lab today: Day 19 lesson. Homework: send a voice message (in English) inviting a classmate to do something this Sunday.'
 )),

dict(S, day=21, theme='Studying abroad', title='Comparing countries and universities',
 focus='Comparing and giving opinions. Small-group discussion skills.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['compare', 'Korea is colder than Sri Lanka. / Seoul is the biggest city.'], ['give an opinion', 'In my opinion... / I think... / For me, the most important thing is...'], ['agree', 'I agree. / That\'s true. / Exactly!'],
    ['disagree politely', 'I see your point, but... / I\'m not sure. I think...'], ['ask others', 'What do you think? / Do you agree?']]),
  dict(t='cards', title='Discussion cards', items=[('Card 1', ['Is it better to study in a big city or a small city? Why?']), ('Card 2', ['What is more important: a famous university or a cheap one?']),
    ('Card 3', ['Compare life in Sri Lanka and life in Korea: food, weather, transport, people.']), ('Card 4', ['What is the hardest thing about studying abroad? What is the best thing?'])]),
  dict(t='table', title='Rank the factors', ins='Rank these from 1 (most important) to 6 when choosing a university. Then agree a group ranking.', head=['Factor', 'Me', 'My group'], rows=[['Cost', '', ''], ['Ranking / reputation', '', ''], ['Location', '', ''], ['Part-time jobs nearby', '', ''], ['Number of international students', '', ''], ['Scholarship available', '', '']]),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Compare using comparatives and superlatives in speech', 'Give and justify opinions', 'Agree and disagree politely in a group'],
  steps=[
   (10, 'This or that?', 'Quick opinions: tea or coffee, beach or mountains, Seoul or Busan. Students stand on two sides of the room.'),
   (10, 'Useful language', 'The table. Practise polite disagreement.'),
   (35, 'Discussion', 'Groups of 3 or 4 with discussion cards, 8 minutes per card. One student is the "chair" who asks everyone and keeps time. Rotate the chair.'),
   (20, 'Rank the factors', 'Exercise 3. Groups present their ranking and reasons.'),
   (15, 'Feedback', 'Praise good opinion language. Correct "more cheaper" / "most biggest".'),
  ],
  homework='IT lab today: Day 21 lesson. Homework: find 3 facts comparing Sri Lanka and Korea (population, size, weather) and be ready to share.'
 )),

dict(S, day=23, theme='Writing emails', title='Polite requests',
 focus='Making polite requests on the phone and in person, and responding to them.',
 student=[
  dict(t='table', title='Useful language: from direct to polite', head=['Direct (can sound rude)', 'Polite'], rows=[
    ['Give me the form.', 'Could you give me the form, please?'], ['I want to change my room.', 'Would it be possible to change my room?'], ['Help me.', 'Could you help me, please?'], ['Say it again.', 'Sorry, could you say that again, please?'],
    ['Speak slowly.', 'Could you speak a bit more slowly, please?'], ['Where is the office?', 'Excuse me, could you tell me where the office is?']]),
  dict(t='table', title='Responding', head=['Yes', 'No (politely)'], rows=[['Sure. / Of course. / No problem.', 'I\'m sorry, I\'m afraid I can\'t...'], ['Certainly. Here you are.', 'Sorry, that\'s not possible, but you could...']]),
  dict(t='cards', title='Role-plays at the university', items=[('1. International office', ['Student: you lost your student card. Ask for a new one.', 'Staff: ask for their name, student number and a photo. It costs ₩5,000.']),
    ('2. Dormitory', ['Student: your room heater is broken and it\'s very cold. Ask for help.', 'Staff: a technician can come tomorrow at 10. Offer an extra blanket tonight.']),
    ('3. Professor', ['Student: you were sick and missed the test. Ask to take it later.', 'Professor: ask for a doctor\'s note. Offer next Tuesday.']),
    ('4. Bank', ['Student: you want to open an account. Ask what documents you need.', 'Staff: passport, ARC, student card, Korean phone number.'])]),
  dict(t='note', title='Debate night #2 tonight: Is studying abroad worth it?', items=['Think about: cost, family, career, language, culture shock, independence.', 'Prepare 2 points for and 2 against. You will find out your side at the start!']),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Turn direct requests into polite ones', 'Respond politely, including saying no', 'Handle real situations at a Korean university'],
  steps=[
   (10, 'Rude or polite?', 'Say requests in a rude and a polite tone; students judge. Tone matters as much as words.'),
   (15, 'Useful language', 'Both tables. Practise intonation.'),
   (40, 'Role-plays', 'Pairs do each card, then swap roles. Pick two pairs to perform for the class.'),
   (15, 'Debate prep', 'Students prepare points for both sides (the side is drawn tonight).'),
   (10, 'Feedback', 'Highlight "Could you tell me where the office is?" (no question order after "tell me").'),
  ],
  homework='IT lab today: Day 23 lesson. Debate night at 7:30 pm.'
 )),

dict(S, day=25, theme='Talking about experiences', title='Have you ever...?',
 focus='Asking about life experiences and giving details. Interview practice.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['ask', 'Have you ever...? / What\'s the most... you\'ve ever...?'], ['answer yes', 'Yes, I have. I... (past simple detail)'], ['answer no', 'No, I haven\'t. / No, never. But I\'d love to.'],
    ['ask for details', 'When was that? / What was it like? / How did you feel?']]),
  dict(t='table', title='Find someone who has...', ins='Ask "Have you ever...?" If yes, ask one follow-up question and note the answer.', head=['Has ever...', 'Name', 'Detail'], rows=[
    ['been to Jaffna', '', ''], ['won a prize', '', ''], ['cooked for more than 10 people', '', ''], ['met a foreigner', '', ''], ['worked in a shop', '', ''], ['eaten Korean food', '', ''], ['given a speech', '', ''], ['helped as a volunteer', '', '']]),
  dict(t='cards', title='Interview questions about experience', items=[('Question 1', ['Tell me about an experience that changed you.']), ('Question 2', ['Have you ever worked in a team? What did you learn?']),
    ('Question 3', ['Have you ever had a difficult problem? How did you solve it?']), ('Question 4', ['What is the most difficult thing you have ever done?'])]),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Ask and answer "Have you ever...?" with past simple details', 'Keep a conversation going with follow-up questions', 'Answer experience questions in interview style (mock interview 3 is on Day 27)'],
  steps=[
   (10, 'Two truths and a lie', 'Say 3 experiences, one false. Students ask questions to find the lie.'),
   (10, 'Useful language', 'The table.'),
   (25, 'Find someone who', 'Exercise 2 mingle. Report back.'),
   (35, 'Interview practice', 'Pairs with the question cards. Answer in PRE (point, reason, example) style. Swap after each card. Then 2 students do it in front of the class.'),
   (10, 'Feedback', 'Strong examples you heard. Remind students to use real stories, not invented ones.'),
  ],
  homework='IT lab today: Day 25 lesson. Homework: prepare answers to the 4 interview questions.'
 )),
]
