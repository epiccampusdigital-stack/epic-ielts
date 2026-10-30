M = dict(folder='Mock interviews', kind='Mock scholarship interview', who='English Teacher 2')

FEEDBACK_FORM = dict(t='table', title='Interviewer feedback form', ins='One per student. Score 1 to 5 in each row. Give the form to the student after the round.',
    head=['Area', 'Score (1 to 5)', 'Comment'], rows=[
    ['Answers the question directly (point)', '', ''], ['Gives reasons (because, so)', '', ''], ['Gives real examples', '', ''],
    ['Fluency: keeps going, few long pauses', '', ''], ['Grammar and vocabulary', '', ''], ['Confidence: eye contact, voice, posture', '', ''],
    ['One thing done well', '', ''], ['One thing to practise before the next round', '', '']])

RUN = [(10, 'Set up', 'Two chairs facing each other, a table, a timer. Students wait in the IT lab and come in one at a time.'),
       (80, 'Interviews', 'About 7 minutes per student: knock, greet, sit, questions, thank you. Then 1 minute to finish the feedback form.'),
       (15, 'Group feedback', 'Everyone together: three things the group did well, three common mistakes, the best answer you heard (no names if the student prefers).')]

INTERVIEWER_TIPS = ['Be friendly but formal, like a real panel. Do not help with words during the answer.', 'Ask one follow-up question for each main answer: "Can you give me an example?" or "Why is that important to you?"',
    'Write the comment while it is fresh. Students value one clear, specific tip more than a long list.', 'Keep each student to 7 minutes so everyone gets a turn.']

LESSONS = [
dict(M, day=10, theme='Round 1 - about you', time='2:45 to 4:30', title='Mock interview round 1: about you',
 focus='Simple personal questions. The goal is to answer in full sentences with one extra detail.',
 student=[
  dict(t='note', title='Before your interview', items=['Knock, wait, then say: "Good afternoon. May I come in?"', 'Sit when you are invited. Sit straight and look at the interviewer.', 'Answer in full sentences. Add one detail: not "Galle", but "I\'m from Galle, a city on the south coast."', 'If you don\'t understand: "Sorry, could you repeat the question, please?"', 'At the end: "Thank you for your time."']),
  dict(t='lines', title='Practise these questions', ins='Write key words only, not full answers.', items=['Tell me about yourself.', 'Where are you from? What is it like?', 'Tell me about your family.', 'What do you do in your free time?', 'Why do you want to study in Korea?']),
 ],
 teacher=dict(need='Feedback forms (this paper), timer, a quiet room', aims=['Give every student their first one-to-one interview', 'Record a baseline for confidence and fluency'], steps=RUN,
  extra=[('Questions for round 1', ['Tell me about yourself.', 'Where are you from? What is it like?', 'Tell me about your family.', 'What did you do last weekend?', 'What do you do in your free time?', 'Why do you want to study in Korea?']), ('Interviewer tips', INTERVIEWER_TIPS)]),
),
dict(M, day=20, theme='Round 2 - study and plans', time='2:45 to 4:30', title='Mock interview round 2: your studies and plans',
 focus='Questions about your course and the future. Use point, reason, example.',
 student=[
  dict(t='note', title='Answer with point, reason, example', items=['**Point:** answer the question. "I want to study civil engineering."', '**Reason:** "because my village needs better roads and water systems."', '**Example:** "For example, every dry season the farmers near my home lose their crops."', 'Use your Day 19 and Day 20 writing to help you.']),
  dict(t='lines', title='Practise these questions', ins='Key words only.', items=['What do you want to study, and why?', 'Why did you choose Korea and not another country?', 'What are your plans for your first year?', 'What will you do after you graduate?', 'How will your studies help your family or your country?']),
 ],
 teacher=dict(need='Feedback forms (this paper), round 1 forms to compare, timer', aims=['Push students to use point, reason, example', 'Compare with round 1 and tell each student what improved'], steps=RUN,
  extra=[('Questions for round 2', ['What do you want to study, and why?', 'Why Korea?', 'What do you know about the university or city you are going to?', 'What are your plans for your first year?', 'What will you do after you graduate?', 'What will be the hardest thing about living in Korea? How will you deal with it?']), ('Interviewer tips', INTERVIEWER_TIPS + ['Before each interview, read that student\'s round 1 form. Tell them one thing that is better this time.'])]),
),
dict(M, day=27, theme='Round 3 - strengths and experiences', time='10:15 to 12:30', title='Mock interview round 3: strengths and experiences',
 focus='Harder questions: strengths, weaknesses and experiences. This is the closest to the real interview.',
 student=[
  dict(t='note', title='Tips for harder questions', items=['Strength: name it, then prove it with a real story.', 'Weakness: choose a real one, then say what you are doing to improve it.', 'Experience: use the past simple for the story and say what you learned.', 'It is fine to pause and think: "That\'s a good question. Let me think..."']),
  dict(t='lines', title='Practise these questions', ins='Key words only.', items=['What is your biggest strength? Give an example.', 'What is your biggest weakness?', 'Tell me about a difficult experience and what you learned.', 'Have you ever worked in a team? What was your role?', 'Why should we choose you for this scholarship?']),
 ],
 teacher=dict(need='Feedback forms (this paper), rounds 1 and 2 forms, timer', aims=['Practise the hardest interview questions', 'Give each student a clear final tip before graduation'], steps=[(10, 'Set up', 'As before. English Teacher 1 can sit in as a second interviewer if free.'), (85, 'Interviews', '7 to 8 minutes each, then the feedback form.'), (10, 'Group feedback', 'Best answers and common mistakes.')],
  extra=[('Questions for round 3', ['What is your biggest strength? Give an example.', 'What is your biggest weakness? What are you doing about it?', 'Tell me about a difficult experience and what you learned.', 'Have you ever worked in a team? What was your role?', 'Why should we choose you for this scholarship?', 'Do you have any questions for us? (A good answer is a real question about the course.)']), ('Interviewer tips', INTERVIEWER_TIPS)]),
),
dict(M, day=30, theme='Final mock interviews', time='3:00 to 4:30', title='Final mock interviews: the full interview',
 focus='A complete interview from knock to goodbye, including a short Korean self-introduction.',
 student=[
  dict(t='note', title='Your final interview', items=['About 8 minutes. Questions can come from all three rounds.', 'Start with a 30-second self-introduction in English, and a short one in Korean if asked.', 'Use point, reason, example. Smile. Thank the interviewer at the end.']),
  dict(t='lines', title='My three best answers', ins='Write the key words for your three strongest answers so you remember them for the real interview.', items=['', '', '']),
 ],
 teacher=dict(need='Feedback forms (this paper), all earlier forms, timer', aims=['A full practice interview for every student', 'Give each student their interview feedback pack (all four forms) to keep'], steps=[(5, 'Set up', 'As before.'), (80, 'Interviews', '8 minutes each.'), (5, 'Hand back', 'Give each student all four of their feedback forms in an envelope.')],
  extra=[('Questions (mix from all rounds)', ['Tell me about yourself.', 'Why this course and why Korea?', 'What is your biggest strength? Give an example.', 'Tell me about a difficult experience.', 'What will you do after you graduate?', 'Please introduce yourself in Korean.']), ('Interviewer tips', INTERVIEWER_TIPS)]),
),
]
for L in LESSONS:
    L['student'] = L['student'] + [dict(t='pagebreak'), FEEDBACK_FORM]

E = dict(folder='Evenings', kind='Evening activity (staff-run)', who='Campus staff', time='6:30 to 7:30 PM')
def ev(day, theme, title, focus, plan, student, notes):
    return dict(E, day=day, theme=theme, title=title, focus=focus, student=student,
                teacher=dict(need='Room with chairs in a circle or rows, a timer, a bell', aims=None, steps=plan, extra=[('Notes for the host', notes)]))

TALK_TIPS = dict(t='note', title='Tips', items=['Notes with key words only, not full sentences.', 'Look at the audience. Speak slowly. Smile.', 'Practise once with a friend before tonight.'])
PRES_PLAN = [(5, 'Welcome', 'Explain the rules: 2 minutes each, a bell at 1:45, then one question from the audience.'), (45, 'Talks', 'About 10 students x 4 minutes (talk + question).'), (10, 'Vote and close', 'Everyone votes for "best story" and "best voice". Small prize. Photos.')]
DEB_PLAN = [(5, 'Welcome and teams', 'Draw sides from a hat. Each team has 5 speakers.'), (10, 'Prepare', 'Teams agree three points and who says what.'),
            (30, 'Debate', 'Each speaker 1 minute, alternating teams. Then 5 minutes of open questions.'), (10, 'Vote', 'Audience (staff and Korean teachers) votes for the most convincing team and the best speaker.'), (5, 'Close', 'Thank everyone.')]
DEB_LANG = dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[['give your opinion', 'I believe... / In my opinion...'], ['give a reason', 'This is because... / The main reason is...'], ['give an example', 'For example... / In my village...'], ['disagree politely', 'I understand your point, but... / I\'m not sure that\'s true because...'], ['finish', 'So, to sum up...']])

LESSONS += [
ev(1, 'Welcome night', 'Welcome night and icebreakers', 'Get to know each other. No English test, just fun.',
   [(10, 'Welcome', 'A short welcome from the campus. Explain the next 30 days in two minutes.'), (20, 'Find someone who', 'Use the sheet. Students must talk to everyone.'), (20, 'Two truths and a lie', 'Each student says three facts; the group guesses the lie.'), (10, 'Close', 'Group photo. Remind them: breakfast and class at 8:30.')],
   [dict(t='table', title='Find someone who...', ins='Ask "Do you...? / Have you ever...?" Write a name.', head=['Find someone who...', 'Name'], rows=[['has been to Colombo this year', ''], ['can sing a song in Korean', ''], ['has more than three cousins', ''], ['likes cricket', ''], ['can cook a curry', ''], ['wants to study engineering', ''], ['gets up before 6', ''], ['has a pet', '']])],
   ['Keep it light. Mix students from different towns in pairs.', 'Note any student who is very quiet and tell the English teachers tomorrow.']),
ev(5, 'Presentation night 1', 'Presentation night #1: "This is me"', 'Two minutes each about yourself: who you are, your day, your hobbies and your dream.', PRES_PLAN,
   [dict(t='table', title='Plan your talk', head=['Part', 'Key words'], rows=[['Hello: name, age, hometown', ''], ['My family', ''], ['My day', ''], ['My free time', ''], ['My dream in Korea', '']]), TALK_TIPS],
   ['Clap after every talk. Be kind: this is the first time many of them speak English in public.', 'Short questions only, e.g. "What is your favourite food?"']),
ev(11, 'Debate night 1', 'Debate night #1: City life or village life?', 'Two teams. Which is better: living in a city or in a village?', DEB_PLAN,
   [DEB_LANG, dict(t='table', title='Ideas', head=['City life', 'Village life'], rows=[['jobs, universities, shopping', 'fresh air, quiet, cheaper'], ['transport, hospitals', 'family nearby, safe'], ['', ''], ['', '']])],
   ['Keep time strictly. Students may switch to Sinhala when excited: gently say "In English, please!"']),
ev(17, 'Presentation night 2', 'Presentation night #2: "My best memory"', 'Two minutes each: a story from your life, told in the past.', PRES_PLAN,
   [dict(t='table', title='Plan your story', head=['Part', 'Key words'], rows=[['When and where', ''], ['Who was there', ''], ['First...', ''], ['Then / suddenly...', ''], ['In the end...', ''], ['How I felt', '']]), TALK_TIPS],
   ['Students prepared this in the Day 17 lessons. Encourage photos on a phone.', 'Listen for past simple; praise good stories, not perfect grammar.']),
ev(23, 'Debate night 2', 'Debate night #2: Is studying abroad worth it?', 'Two teams. Is it worth leaving home to study in another country?', DEB_PLAN,
   [DEB_LANG, dict(t='table', title='Ideas', head=['Worth it', 'Not worth it'], rows=[['better universities, careers', 'expensive, far from family'], ['new language and friends', 'homesick, culture shock'], ['', ''], ['', '']])],
   ['Students may feel strongly: they are about to go abroad. Keep it positive and end with a "best reason to go" round.']),
ev(30, 'Graduation', 'Graduation ceremony and certificates', 'The end of the programme: certificates, short speeches and photos.',
   [(10, 'Welcome', 'Welcome guests and families.'), (20, 'Speeches', 'Two student speeches (English and Korean, 2 minutes each) and a word from each teacher.'), (20, 'Certificates', 'Call each student. Read their final English level.'), (10, 'Photos', 'Group and family photos.')],
   [dict(t='note', title='Running order', items=['Welcome', 'Student speech in English', 'Student speech in Korean', 'Teachers', 'Certificates', 'Photos']), dict(t='lines', title='My thank-you note to a teacher', items=[''])],
   ['Print certificates by Day 29 evening with each student\'s final level from the final test.', 'Invite all teachers; send a WhatsApp reminder from the tracker.']),
]
