# Grammar foundation, part 2: one lesson per tense, then the joining words in four groups.
# Each lesson is 45 to 90 minutes. Sir teaches two a morning.
F = dict(folder='Grammar foundation', kind='Grammar foundation', who='English Teacher 2 (Sir)')

LESSONS = [
# ---------------------------------------------------------------- Tense 1: present simple
dict(F, day=11, theme='Tense 1 - Present simple', time='8:30 to 9:45', title='Tense 1: present simple',
 focus='Use the present simple for habits, routines and facts. Make the he / she / it form, negatives and questions.',
 student=[
  dict(t='note', title='When do we use it?', items=[
   '**Habits and routines:** I get up at six. We have class every morning.',
   '**Facts:** Galle is in the south. Water boils at 100 degrees.',
   '**Likes and feelings:** She likes K-pop. They love cricket.',
   'Time words: **always, usually, often, sometimes, never, every day, on Mondays.**']),
  dict(t='table', title='He / she / it takes an extra -s', head=['Rule', 'I / you / we / they', 'He / she / it'], rows=[
   ['Most verbs: add **-s**', 'work', 'work**s**'],
   ['After s, sh, ch, x, o: add **-es**', 'watch, wash, go, do', 'watch**es**, wash**es**, go**es**, do**es**'],
   ['Consonant + y: change to **-ies**', 'study, try', 'stud**ies**, tr**ies**'],
   ['Vowel + y: just add **-s**', 'play, enjoy', 'play**s**, enjoy**s**'],
   ['Special', 'have', '**has**']]),
  dict(t='gap', title='Write the he / she / it form', ins='Example: I work. He ___ → works.', items=[
   'I work. He ___', 'I watch TV. She ___ TV.', 'I study at night. He ___ at night.', 'I go to the market. She ___ to the market.',
   'I play cricket. He ___ cricket.', 'I have a phone. She ___ a phone.', 'I wash my clothes. He ___ his clothes.', 'I do my homework. She ___ her homework.']),
  dict(t='note', title='Negatives and questions', items=[
   '**I / you / we / they:** I **don\'t** eat meat. **Do** you speak Korean? Yes, I do. / No, I don\'t.',
   '**He / she / it:** She **doesn\'t** eat meat. **Does** he live in Galle? Yes, he does. / No, he doesn\'t.',
   'After **doesn\'t** and **does** the verb has no -s: She doesn\'t **work**. Does he **work**?']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('She ___ to college by bus.', ['go', 'goes', 'going']),
   ('They ___ rice for lunch.', ['eats', 'eat', 'eating']),
   ('My brother ___ like cricket.', ["don't", "doesn't", "isn't"]),
   ('___ you speak Korean?', ['Do', 'Does', 'Are']),
   ('___ he live in Galle?', ['Do', 'Does', 'Is']),
   ('The class ___ at nine.', ['start', 'starts', 'starting']),
   ('We ___ have class on Sunday afternoon.', ["don't", "doesn't", 'not']),
   ('What time ___ the shop open?', ['do', 'does', 'is'])]),
  dict(t='note', title='How often? Put the word in the right place', items=[
   'Before the main verb: I **usually** eat rice. She **never** drinks coffee.',
   'After **be** (am / is / are): He is **always** late. They are **sometimes** tired.']),
  dict(t='gap', title='Add the word', ins='Rewrite the sentence with the word in brackets.', items=[
   'She goes to bed late. (never) ___', 'I eat rice for dinner. (usually) ___', 'He is late for class. (sometimes) ___',
   'We watch films at night. (often) ___', 'They are happy. (always) ___']),
  dict(t='table', title='Ask your partner', ins='Ask: "Do you ...?" Tick yes or no, then write one sentence about your partner.', head=['Question', 'Yes', 'No'], rows=[
   ['Do you get up before six?', '', ''], ['Do you drink tea every day?', '', ''], ['Do you walk to class?', '', ''],
   ['Do you watch Korean dramas?', '', ''], ['Do you play any sport?', '', '']]),
  dict(t='write', title='About my partner', ins='Write 5 sentences. Example: Nimal usually gets up at five. He doesn\'t drink coffee.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board, a ball or paper ball for the warm-up',
  aims=['Use the present simple for habits, routines and facts', 'Make the he / she / it form correctly', 'Make negatives and questions with do / does'],
  steps=[
   (10, 'Warm-up: guess my day', 'Mime a daily habit (brushing teeth, riding a bike). Students say "You brush your teeth". Write 3 sentences on the board and ask what they have in common (habits). Then ask who in the class does the same.'),
   (10, 'When and the -s rule', 'Read the "When" note. Teach the -s table with the board; students shout the he / she / it form of each verb. Do the 8 gap sentences aloud, then write.'),
   (15, 'Negatives and questions', 'Teach the note. Drill: teacher says "I like tea", students say "She doesn\'t like tea". Then the 8 multiple choice questions.'),
   (15, 'How often?', 'Teach the placing rule with the board. Students do the 5 rewrites, then make 2 true sentences about themselves.'),
   (20, 'Ask your partner', 'Pairs ask the 5 questions. Each student writes 5 sentences about the partner, then reads 2 aloud to the class.'),
  ],
  answers=[
   '**He / she form:** works, watches, studies, goes, plays, has, washes, does.',
   '**Choose:** 1 goes, 2 eat, 3 doesn\'t, 4 Do, 5 Does, 6 starts, 7 don\'t, 8 does.',
   '**Add the word:** She never goes to bed late. I usually eat rice for dinner. He is sometimes late for class. We often watch films at night. They are always happy.',
   '**Ask your partner / write:** students\' own answers. Check -s on every he / she sentence.'],
  tips=['Most common mistakes: "She go", "He don\'t like", "Does he likes". Write them on the board and let students fix them.', 'Sinhala has no -s on verbs, so do lots of choral drilling of he / she / it.'],
  homework='Write 8 sentences about your family: what each person does every day.')),

# ---------------------------------------------------------------- Tense 2: present continuous
dict(F, day=11, theme='Tense 2 - Present continuous', time='10:00 to 11:30 (tea break 9:45 to 10:00)', title='Tense 2: present continuous',
 focus='Use am / is / are + verb-ing to say what is happening now. Know the difference from the present simple.',
 student=[
  dict(t='note', title='When do we use it?', items=[
   '**Right now:** I am writing in my book. She is talking on the phone.',
   '**Around now:** We are learning English this month.',
   'Time words: **now, at the moment, today, this week, Look! Listen!**',
   'Make it: **am / is / are + verb-ing.** I **am** study**ing**. He **is** work**ing**. They **are** play**ing**.']),
  dict(t='table', title='Spelling the -ing form', head=['Rule', 'Verb', '-ing'], rows=[
   ['Most verbs: add **-ing**', 'work, play, cook', 'working, playing, cooking'],
   ['Ends in **e**: drop the e', 'make, write, have, dance', 'making, writing, having, dancing'],
   ['One vowel + one consonant: **double** it', 'run, sit, stop, swim, get', 'running, sitting, stopping, swimming, getting'],
   ['Ends in **y**: keep the y', 'study, enjoy', 'studying, enjoying']]),
  dict(t='gap', title='Write the -ing form', items=['study → ___', 'come → ___', 'get → ___', 'cook → ___', 'dance → ___', 'plan → ___', 'sit → ___', 'write → ___']),
  dict(t='gap', title='What is happening?', ins='Complete with am, is or are and the verb in brackets.', items=[
   'Look! It ___ (rain).', 'I ___ (write) in my workbook.', 'The teacher ___ (talk) to Anna.', 'My friends ___ (play) football outside.',
   'We ___ (sit) in the classroom.', 'He ___ (not / listen).', 'She ___ (run) to the bus.', 'What ___ you ___ (do)?']),
  dict(t='note', title='Negatives and questions', items=[
   'Negative: I **am not** working. He **isn\'t** sleeping. They **aren\'t** listening.',
   'Question: **Are** you listening? **Is** she studying? What **are** you doing?',
   'Short answers: Yes, I am. / No, I\'m not. Yes, he is. / No, he isn\'t.']),
  dict(t='mcq', title='Present simple or present continuous?', items=[
   ('Look! It ___.', ['rains', 'is raining', 'rain']),
   ('I ___ up at six every day.', ['get', 'am getting', 'gets']),
   ('Be quiet! The baby ___.', ['sleeps', 'is sleeping', 'sleep']),
   ('They ___ football on Sundays.', ['play', 'are playing', 'plays']),
   ('Where is Amal? He ___ in the library now.', ['studies', 'is studying', 'study']),
   ('We ___ English at the moment.', ['learn', 'are learning', 'learns']),
   ('My mother ___ at a bank. She is a manager.', ['work', 'works', 'is working'])]),
  dict(t='write', title='Our classroom right now', ins='Write 6 sentences about what people in the room are doing. Use am / is / are + -ing.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Say what is happening now with am / is / are + -ing', 'Spell the -ing form', 'Choose between present simple and present continuous'],
  steps=[
   (15, 'Warm-up: mime game', 'One student mimes an action (swimming, texting, cooking). The class asks "Are you ...?" until someone guesses, then says "You are cooking". Write 3 of the sentences on the board.'),
   (15, 'Rule and spelling', 'Teach am / is / are + -ing from the examples. Teach the spelling table; students write the 8 -ing forms.'),
   (15, 'What is happening?', 'Students do the 8 sentences alone, then check in pairs. Teach negatives and questions with the board.'),
   (20, 'Simple or continuous?', 'Draw a timeline on the board: habit (always) vs now. Students do the 7 multiple choice questions. Ask "why?" for each.'),
   (25, 'Our classroom right now', 'Students write 6 sentences. Then one student reads one sentence without the name and the class guesses who it is.'),
  ],
  answers=[
   '**-ing forms:** studying, coming, getting, cooking, dancing, planning, sitting, writing.',
   '**What is happening:** 1 is raining, 2 am writing, 3 is talking, 4 are playing, 5 are sitting, 6 isn\'t listening, 7 is running, 8 are you doing.',
   '**Choose:** 1 is raining, 2 get, 3 is sleeping, 4 play, 5 is studying, 6 are learning, 7 works.',
   '**Classroom:** students\' own sentences.'],
  tips=['Common mistakes: "I studying", "She is go", "He is work now". Make students say the full am / is / are.', 'Stative verbs (like, know, want, have) are not used in the continuous. Mention it only if a student asks.'],
  homework='Look out of your window or sit somewhere busy for 5 minutes. Write 6 sentences about what people are doing.')),

# ---------------------------------------------------------------- Tense 3: past simple regular
dict(F, day=17, theme='Tense 3 - Past simple, regular verbs', time='8:30 to 9:45', title='Tense 3: past simple (regular verbs)',
 focus='Talk about finished actions in the past with -ed. Make negatives and questions with did.',
 student=[
  dict(t='note', title='When do we use it?', items=[
   'For something that **started and finished** in the past: I visited my grandmother yesterday.',
   'Time words: **yesterday, last night, last week, two days ago, in 2020.**',
   'Make it with **verb + -ed.** The form is the same for I, you, he, she, it, we and they.']),
  dict(t='table', title='Spelling the -ed form', head=['Rule', 'Verb', 'Past'], rows=[
   ['Most verbs: add **-ed**', 'play, work, watch', 'played, worked, watched'],
   ['Ends in **e**: add **-d**', 'like, live, dance', 'liked, lived, danced'],
   ['Consonant + y: **-ied**', 'study, try, carry, cry', 'studied, tried, carried, cried'],
   ['One vowel + one consonant: **double** it', 'stop, plan', 'stopped, planned']]),
  dict(t='gap', title='Write the past form', items=['watch → ___', 'dance → ___', 'carry → ___', 'plan → ___', 'visit → ___', 'cry → ___', 'enjoy → ___', 'stop → ___']),
  dict(t='table', title='How do we say -ed? Sort the verbs', ins='Write each verb in the right column: worked, played, wanted, watched, visited, cleaned, helped, needed.', head=['Sounds like t', 'Sounds like d', 'Sounds like id'], rows=[['', '', ''], ['', '', ''], ['', '', '']]),
  dict(t='note', title='Negatives and questions', items=[
   'Negative: **didn\'t + base verb.** I **didn\'t watch** TV. (not "didn\'t watched")',
   'Question: **Did + subject + base verb?** **Did** you **watch** the match? Yes, I did. / No, I didn\'t.']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('I ___ my grandmother yesterday.', ['visit', 'visited', 'visits']),
   ("She didn't ___ the film.", ['liked', 'like', 'likes']),
   ('___ they walk to school?', ['Do', 'Did', 'Does']),
   ('He ___ TV last night.', ['watched', 'watch', 'watching']),
   ('Did you ___ the test?', ['passed', 'pass', 'passes']),
   ('They ___ in Kandy two years ago.', ['live', 'lived', 'lives']),
   ('I ___ study yesterday. I was tired.', ["didn't", "don't", "wasn't"])]),
  dict(t='write', title='My last weekend', ins='Write 6 sentences about what you did last weekend. Use only -ed verbs and didn\'t. Example: I cleaned my room. I didn\'t cook.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use the past simple of regular verbs for finished actions', 'Spell the -ed form', 'Make negatives and questions with did'],
  steps=[
   (10, 'Warm-up: yesterday', 'Ask "What did you do yesterday?" Write 3 student answers on the board in the past. Ask which words changed.'),
   (15, 'Rule and spelling', 'Teach the -ed table. Students write the 8 past forms. Then sort the verbs by the sound of -ed (say each one clearly).'),
   (15, 'Negatives and questions', 'Teach didn\'t + base verb. Drill with a chain: teacher says "I played cricket", student says "I didn\'t play cricket".'),
   (15, 'Choose', 'Students do the 7 questions. Check and ask why the verb has no -ed after did.'),
   (20, 'My last weekend', 'Students write 6 sentences, then tell their partner. Partners ask "Did you ...?" questions.'),
  ],
  answers=[
   '**Past forms:** watched, danced, carried, planned, visited, cried, enjoyed, stopped.',
   '**Sort:** t: worked, watched, helped. d: played, cleaned. id: wanted, visited, needed.',
   '**Choose:** 1 visited, 2 like, 3 Did, 4 watched, 5 pass, 6 lived, 7 didn\'t.',
   '**Last weekend:** students\' own answers.'],
  tips=['Common mistakes: "I didn\'t went", "Did you watched". Write them on the board and correct as a class.', 'Students often skip the -ed sound when speaking. Drill the ending slowly.'],
  homework='Write 8 sentences about a day when you travelled somewhere.')),

# ---------------------------------------------------------------- Tense 4: past simple irregular
dict(F, day=17, theme='Tense 4 - Past simple, irregular verbs', time='10:00 to 11:30 (tea break 9:45 to 10:00)', title='Tense 4: past simple (irregular verbs)',
 focus='Learn the most useful irregular past forms and use them to tell a story in order.',
 student=[
  dict(t='note', title='Some verbs change completely', items=[
   'Many common verbs do not take -ed. You must learn them: go → **went**, have → **had**, see → **saw**.',
   'Negatives and questions are the same as before: I **didn\'t go**. **Did** you **go**? (base verb after did)']),
  dict(t='table', title='20 verbs to know', head=['Base', 'Past', 'Base', 'Past'], rows=[
   ['go', 'went', 'make', 'made'], ['have', 'had', 'take', 'took'], ['see', 'saw', 'write', 'wrote'], ['eat', 'ate', 'read', 'read (sounds like red)'],
   ['drink', 'drank', 'say', 'said'], ['buy', 'bought', 'tell', 'told'], ['come', 'came', 'meet', 'met'], ['do', 'did', 'leave', 'left'],
   ['get', 'got', 'speak', 'spoke'], ['give', 'gave', 'sleep', 'slept']]),
  dict(t='match', title='Match the verb to its past form', left=['buy', 'come', 'eat', 'meet', 'speak', 'sleep', 'take', 'write'], right=['wrote', 'slept', 'bought', 'took', 'met', 'came', 'spoke', 'ate']),
  dict(t='gap', title='A story: last Saturday', ins='Write the past form of the verb in brackets.', items=[
   'Last Saturday I (get) ___ up at seven.', 'I (have) ___ breakfast with my family.', 'Then I (go) ___ to the market with my brother.',
   'We (buy) ___ fruit and vegetables.', 'I (meet) ___ my friend Saman there.', 'We (speak) ___ for ten minutes.',
   'I (come) ___ home at noon and (eat) ___ lunch.', 'In the evening I (write) ___ some emails and (sleep) ___ early.']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('I ___ a film last night.', ['seen', 'saw', 'see']),
   ("She didn't ___ her homework.", ['did', 'do', 'done']),
   ('They ___ to Colombo by train.', ['went', 'goed', 'gone']),
   ('Did you ___ the news?', ['read', 'reads', 'readed']),
   ('We ___ English with Anna yesterday.', ['speaked', 'spoke', 'spoken']),
   ('He ___ a new phone last week.', ['buyed', 'bought', 'buy'])]),
  dict(t='write', title='Tell your story', ins='Write 6 to 8 sentences about a good day you had. Use first, then, after that and finally. Use at least 5 irregular verbs.', n=8),
 ],
 teacher=dict(
  need='Student worksheet, board, 20 small cards with the base verbs (optional, for the warm-up)',
  aims=['Know the past form of 20 common irregular verbs', 'Use them in a short story in order', 'Use did / didn\'t correctly with irregular verbs'],
  steps=[
   (10, 'Warm-up: verb race', 'Two teams. Teacher says a base verb, one student from each team writes the past form on the board. One point for each correct word.'),
   (15, 'The list', 'Go through the 20 verbs. Drill each pair aloud, base then past. Students do the matching exercise.'),
   (20, 'Last Saturday story', 'Students fill the 8 gaps, then read the story aloud in pairs. Ask: what did the writer do first, then, finally?'),
   (15, 'Choose', 'Students do the 6 questions. Point out "goed", "buyed" and "speaked" as common mistakes.'),
   (20, 'Tell your story', 'Students write their story, then tell it to a new partner without looking. Partner asks 2 questions with "Did you ...?".'),
  ],
  answers=[
   '**Match:** buy-bought, come-came, eat-ate, meet-met, speak-spoke, sleep-slept, take-took, write-wrote.',
   '**Story:** got, had, went, bought, met, spoke, came / ate, wrote / slept.',
   '**Choose:** 1 saw, 2 do, 3 went, 4 read, 5 spoke, 6 bought.',
   '**Tell your story:** students\' own answers.'],
  tips=['Students learn irregular verbs best in chunks and stories, not lists. Repeat the list every lesson for a week.', 'Read is the same in the past but sounds like "red". Say it on its own.'],
  homework='Learn 10 irregular verbs from the table. Tomorrow\'s warm-up is a spelling test.')),

# ---------------------------------------------------------------- Tense 5: future
dict(F, day=18, theme='Tense 5 - Future: will and going to', time='8:30 to 9:45', title='Tense 5: the future (will and going to)',
 focus='Talk about plans and predictions. Know when to use going to and when to use will.',
 student=[
  dict(t='note', title='Two ways to talk about the future', items=[
   '**be going to + verb:** plans you already made, and things you can see will happen. I **am going to** study engineering. Look at those clouds! It **is going to** rain.',
   '**will + verb:** a decision at the moment of speaking, predictions, offers and promises. The phone is ringing. I**\'ll** answer it. I think it **will** be hot.',
   'Time words: **tomorrow, next week, next year, soon, tonight, in 2028.**',
   'Negatives: **am not / isn\'t / aren\'t going to** and **won\'t** (will not). Questions: **Are you going to** study? **Will** it rain?']),
  dict(t='mcq', title='Choose the correct form', items=[
   ('I decided last year. I ___ study medicine.', ['am going to', 'will', 'going']),
   ('The phone is ringing. I ___ answer it.', ['am going to', 'will', 'go']),
   ('Look at the sky! It ___ rain.', ['will', 'is going to', 'goes']),
   ("Don't worry. I ___ help you.", ['will', 'am going to', 'help']),
   ('We have the tickets. We ___ visit Seoul next year.', ['will', 'are going to', 'visit']),
   ('I think Korea ___ be cold in winter.', ['will', 'is going', 'going to']),
   ('She is sick. She ___ come tomorrow.', ["won't", "doesn't", "isn't"]),
   ('___ you going to apply for the scholarship?', ['Are', 'Will', 'Do'])]),
  dict(t='gap', title='Make sentences', ins='Complete with the correct form of going to or will and the verb in brackets.', items=[
   'Tomorrow I ___ (visit) my aunt. I already bought the bus ticket.', 'It\'s hot in here. I ___ (open) the window.', 'Sachini ___ (not / go) to the party. She has to study.',
   'Look! That car ___ (hit) the tree!', 'Next year we ___ (live) in Korea.', '___ you ___ (help) me with my bag? (a request)']),
  dict(t='table', title='My plans: ask three classmates', head=['Question', 'Name', 'Answer'], rows=[
   ['What are you going to do this Sunday?', '', ''], ['What are you going to study in Korea?', '', ''], ['Where are you going to live in Korea?', '', ''],
   ['What are you going to do after the programme?', '', '']]),
  dict(t='write', title='My future', ins='Write 6 sentences. Three about your plans (going to) and three predictions (will). Example: I am going to study IT. I think Korea will be very cold.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use going to for plans and things we can see will happen', 'Use will for decisions, offers, promises and predictions', 'Make negatives and questions'],
  steps=[
   (10, 'Warm-up: the crystal ball', 'Students pretend to read each other\'s future: "You will be a doctor. You will have three children." Write 3 sentences on the board.'),
   (15, 'Going to or will', 'Teach the note with two timelines on the board. Do the first two multiple choice questions together, explaining why.'),
   (15, 'Choose + make sentences', 'Students finish the multiple choice and the 6 gaps. Check, and ask why for every answer.'),
   (15, 'My plans', 'Students walk round and ask three classmates the four questions. Report back: "Nimal is going to study IT in Seoul."'),
   (20, 'My future', 'Students write 6 sentences, then read two aloud to the class.'),
  ],
  answers=[
   '**Choose:** 1 am going to, 2 will, 3 is going to, 4 will, 5 are going to, 6 will, 7 won\'t, 8 Are.',
   '**Make sentences:** 1 am going to visit, 2 will open, 3 isn\'t going to go, 4 is going to hit, 5 are going to live, 6 Will you help.',
   '**My plans / my future:** students\' own answers.'],
  tips=['Many students use will for everything. Keep asking: did you decide before now, or just now?', 'In speech "going to" sounds like "gonna". Let them hear it, but write it in full.'],
  homework='Write 8 sentences about what you are going to do in Korea in your first month.')),

# ---------------------------------------------------------------- Tense 6: present perfect
dict(F, day=18, theme='Tense 6 - Present perfect (first look)', time='10:00 to 11:30 (tea break 9:45 to 10:00)', title='Tense 6: present perfect (first look)',
 focus='Talk about life experience with have / has + past participle, and use ever, never, already and yet.',
 student=[
  dict(t='note', title='When do we use it?', items=[
   'For **experiences** in your life, when we do not say when: I **have visited** Colombo. She **has seen** snow.',
   'Make it with **have / has + past participle.** The past participle of regular verbs is the same as the past form (visited, worked). Many irregular verbs change.',
   'Words: **ever** (in questions), **never** (negative meaning), **already** (before now), **yet** (in questions and negatives), **just**.',
   'If you say **when** it happened, use the past simple: I went to Kandy **last year**. (not "I have gone to Kandy last year")']),
  dict(t='table', title='Past participles to know', head=['Base', 'Past participle', 'Base', 'Past participle'], rows=[
   ['be', 'been', 'speak', 'spoken'], ['go', 'gone / been', 'take', 'taken'], ['see', 'seen', 'write', 'written'], ['eat', 'eaten', 'do', 'done'],
   ['have', 'had', 'buy', 'bought'], ['meet', 'met', 'give', 'given']]),
  dict(t='gap', title='Write the past participle', items=['go → ___', 'see → ___', 'eat → ___', 'do → ___', 'write → ___', 'take → ___', 'speak → ___', 'be → ___']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('I ___ never been to Korea.', ['have', 'has', 'am']),
   ('She ___ seen that film three times.', ['have', 'has', 'is']),
   ('Have you ever ___ kimchi?', ['eat', 'ate', 'eaten']),
   ('We ___ already finished the test.', ['has', 'have', 'are']),
   ("He hasn't done his homework ___.", ['yet', 'ever', 'never']),
   ('___ you ever met a foreigner?', ['Have', 'Has', 'Did'])]),
  dict(t='table', title='Find someone who has...', ins='Ask "Have you ever ...?" Write the name of one person for each line.', head=['Find someone who has ever...', 'Name'], rows=[
   ['been on a plane', ''], ['eaten kimchi', ''], ['spoken to a foreigner', ''], ['watched a Korean drama', ''], ['written an email in English', ''], ['met a famous person', '']]),
  dict(t='write', title='My experiences', ins='Write 3 sentences with "I have ..." and 3 with "I have never ...". Example: I have eaten sushi. I have never been to Korea.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use have / has + past participle for life experience', 'Use ever, never, already and yet', 'See the difference from the past simple'],
  steps=[
   (10, 'Warm-up: have you ever', 'Ask "Have you ever eaten Korean food?" "Have you ever been on a plane?" Students stand if yes. Write two sentences from the answers on the board.'),
   (15, 'The form', 'Teach have / has + past participle. Drill the 12 participles. Students do the 8 gap words.'),
   (15, 'Choose', 'Students do the 6 questions. Teach the past simple contrast with the "last year" example.'),
   (25, 'Find someone who', 'Students walk round and fill the table, then report: "Amaya has been on a plane."'),
   (25, 'My experiences', 'Students write 6 sentences. Read three aloud and ask "When did you do that?" to move into the past simple.'),
  ],
  answers=[
   '**Participles:** gone / been, seen, eaten, done, written, taken, spoken, been.',
   '**Choose:** 1 have, 2 has, 3 eaten, 4 have, 5 yet, 6 Have.',
   '**Find someone / experiences:** students\' own answers.'],
  tips=['This is a first look only. Aim for experience sentences, not the whole system.', 'The mistake "I have went" is very common. Give the participle table every time.'],
  homework='Write 6 questions with "Have you ever ...?" to ask your teacher tomorrow.')),

# ---------------------------------------------------------------- Conjunction group 1
dict(F, day=24, theme='Joining words 1 - and, but, or, so, because', time='8:30 to 9:45', title='Joining words 1: and, but, or, so, because',
 focus='Join two short sentences into one longer sentence with and, but, or, so and because.',
 student=[
  dict(t='table', title='The five basic joining words', head=['Word', 'What it does', 'Example'], rows=[
   ['**and**', 'adds information', 'I study English **and** I study Korean.'],
   ['**but**', 'shows a difference', 'I like tea **but** I don\'t like coffee.'],
   ['**or**', 'gives a choice', 'Do you want rice **or** noodles?'],
   ['**so**', 'gives a **result**', 'I was tired, **so** I went to bed.'],
   ['**because**', 'gives a **reason**', 'I went to bed **because** I was tired.']]),
  dict(t='note', title='Commas', items=[
   'Use a comma before **but** and **so** when they join two full sentences: It was late, **so** we went home.',
   'You can put **because** in the middle with no comma: I stayed home because it was raining.']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('I was tired, ___ I went to bed early.', ['so', 'because', 'but']),
   ('I went to bed early ___ I was tired.', ['so', 'because', 'or']),
   ("I like tea, ___ I don't like coffee.", ['and', 'but', 'so']),
   ('Do you want rice ___ noodles?', ['or', 'so', 'because']),
   ('She studies hard ___ she wants a scholarship.', ['because', 'so', 'but']),
   ('It was raining, ___ we stayed home.', ['because', 'so', 'or']),
   ('He is tall ___ strong.', ['and', 'but', 'because']),
   ('I wanted to call you, ___ my phone was dead.', ['and', 'but', 'so'])]),
  dict(t='gap', title='Join the sentences', ins='Join each pair with the word in brackets. Write the whole sentence.', items=[
   'It was cold. I wore a jacket. (so) ___', 'I wore a jacket. It was cold. (because) ___', 'He is clever. He is lazy. (but) ___',
   'You can come now. You can come later. (or) ___', 'I washed my clothes. I cleaned my room. (and) ___']),
  dict(t='lines', title='Swap it', items=['I was hungry, so I ate. Write it with because.', 'She passed because she studied. Write it with so.']),
  dict(t='write', title='Chain story', ins='Write 6 sentences about your morning. Use all five words: and, but, or, so, because.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use and, but, or, so and because to join sentences', 'Tell the difference between a result (so) and a reason (because)', 'Punctuate with commas'],
  steps=[
   (10, 'Warm-up: why?', 'Ask "Why are you here?" "Why are you learning Korean?" Write answers with "because". Then ask "So what did you do?" to elicit "so".'),
   (15, 'The five words', 'Teach the table. Students make one new sentence for each word.'),
   (15, 'Choose + join', 'Students do the 8 multiple choice questions, then the 5 joins. Check with the board.'),
   (10, 'Swap it', 'Students rewrite the two sentences. Show that so and because go in opposite directions (cause → result).'),
   (15, 'Chain story', 'Students write 6 sentences, then read their story round the room.'),
  ],
  answers=[
   '**Choose:** 1 so, 2 because, 3 but, 4 or, 5 because, 6 so, 7 and, 8 but.',
   '**Join:** It was cold, so I wore a jacket. / I wore a jacket because it was cold. / He is clever but he is lazy. / You can come now or you can come later. / I washed my clothes and I cleaned my room.',
   '**Swap it:** I ate because I was hungry. / She studied, so she passed.',
   '**Chain story:** students\' own sentences.'],
  tips=['Common mistake: "Because I was tired, so I went to bed." Show that you only need one of them.', 'Do not teach however, although or unless yet. They come in the next lessons.'],
  homework='Write 8 sentences about why you want to study in Korea. Use because and so.')),

# ---------------------------------------------------------------- Conjunction group 2
dict(F, day=24, theme='Joining words 2 - when, while, as, before, after, until', time='10:00 to 11:30 (tea break 9:45 to 10:00)', title='Joining words 2: when, while, as, before, after, until',
 focus='Say when things happen: at the same time, one after the other, and how long.',
 student=[
  dict(t='table', title='Time words', head=['Word', 'Meaning', 'Example'], rows=[
   ['**when**', 'at the time that', 'I was happy **when** I got the letter.'],
   ['**while / as**', 'at the same time (a longer action)', 'I was cooking **while** my brother watched TV. She smiled **as** she walked in.'],
   ['**before**', 'earlier than', 'Wash your hands **before** you eat.'],
   ['**after**', 'later than', '**After** I finished class, I went home.'],
   ['**until**', 'up to that time', 'Wait here **until** I come back.']]),
  dict(t='note', title='Comma rule', items=[
   'If the time part comes **first**, use a comma: **When I arrived, the class started.**',
   'If it comes **second**, no comma: The class started when I arrived.',
   'Do not use **will** after a time word. Say "When I **get** there, I will call you." (not "when I will get")']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('I was cooking ___ my brother was watching TV.', ['while', 'until', 'before']),
   ('Call me ___ you arrive.', ['when', 'while', 'until']),
   ('Wait here ___ I come back.', ['until', 'while', 'after']),
   ('Wash your hands ___ you eat.', ['before', 'after', 'until']),
   ('___ I finished class, I went home.', ['After', 'Until', 'While']),
   ('I will call you ___ I get there.', ['when', 'will', 'until'])]),
  dict(t='gap', title='Join the sentences', ins='Use the word in brackets. Write the whole sentence.', items=[
   'We study. Then we play cricket. (after) ___', 'I brush my teeth. Then I go to bed. (before) ___', 'I will stay here. You come back. (until) ___',
   'I was walking. I saw an accident. (while) ___', 'I got my visa. I called my mother. (when) ___']),
  dict(t='write', title='My routine', ins='Write 6 sentences about your day. Use before, after, when, while and until.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use when, while, as, before, after and until to say when things happen', 'Put time clauses first or second and punctuate them', 'Not use will after a time word'],
  steps=[
   (10, 'Warm-up: what happens first?', 'Say 3 pairs of actions in order. Students say the sentence with before or after: "I eat, then I wash my hands" → "I wash my hands after I eat."'),
   (15, 'The six words', 'Teach the table with a timeline for each word. Students make one example each.'),
   (15, 'Choose', 'Students do the 6 questions. Ask why for each one.'),
   (20, 'Join the sentences', 'Students do the 5 joins. Check on the board and teach the comma rule.'),
   (20, 'My routine', 'Students write 6 sentences, then read two aloud.'),
  ],
  answers=[
   '**Choose:** 1 while, 2 when, 3 until, 4 before, 5 After, 6 when.',
   '**Join:** After we study, we play cricket. / I brush my teeth before I go to bed. / I will stay here until you come back. / While I was walking, I saw an accident. / When I got my visa, I called my mother.',
   '**My routine:** students\' own sentences.'],
  tips=['Show the comma rule by writing both orders on the board and moving the time part.', 'The "will after when" mistake is very common. Correct it every time.'],
  homework='Write the steps of making tea or your favourite meal. Use first, then, before, after and until.')),

# ---------------------------------------------------------------- Conjunction group 3
dict(F, day=25, theme='Joining words 3 - although, though, even though, however', time='8:30 to 9:45', title='Joining words 3: although, though, even though, however',
 focus='Show a surprise or a difference with although, though, even though and however.',
 student=[
  dict(t='table', title='Words for "a surprise"', head=['Word', 'How to use it', 'Example'], rows=[
   ['**although**', 'joins two sentences. Use only this word, not but', '**Although** it was raining, we played cricket.'],
   ['**though**', 'same as although (more informal)', 'We played cricket **though** it was raining.'],
   ['**even though**', 'a stronger surprise', 'He passed **even though** he didn\'t study.'],
   ['**however**', 'starts a new sentence; comma after it', 'He studied hard. **However**, he failed.']]),
  dict(t='note', title='Do not use two together', items=[
   '**Wrong:** Although it was raining, but we played cricket.',
   '**Right:** Although it was raining, we played cricket. OR It was raining, but we played cricket.']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('___ it was raining, we played cricket.', ['Although', 'Because', 'So']),
   ('He studied hard. ___, he failed.', ['However', 'Although', 'Because']),
   ('I like Korean food ___ it is very spicy.', ['even though', 'however', 'so']),
   ('Although she was tired, ___ she finished.', ['but she', 'she', 'so she']),
   ('The test was easy. ___, some students made mistakes.', ['Although', 'However', 'Because']),
   ('We went out ___ it was late.', ['though', 'however', 'but'])]),
  dict(t='gap', title='Join the sentences', ins='Write one sentence with although.', items=[
   'It was cold. I went swimming. ___', 'She is shy. She speaks English very well. ___', 'He was ill. He came to class. ___',
   'The film was long. We enjoyed it. ___']),
  dict(t='lines', title='Fix the mistake', items=['Although he was tired, but he studied.', 'She was late. Although, she got the job.']),
  dict(t='write', title='Surprising facts about you', ins='Write 5 true sentences about yourself with although or even though. Example: Even though I live in Galle, I can\'t swim.', n=5),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use although, though and even though to show a surprise', 'Use however at the start of a sentence', 'Avoid although + but'],
  steps=[
   (10, 'Warm-up: surprising', 'Say surprising sentences: "I like spicy food but I can\'t eat chilli." Ask if it is a surprise or normal, then introduce "although".'),
   (15, 'The four words', 'Teach the table. Write one example for each. Teach the "not two together" rule.'),
   (15, 'Choose', 'Students do the 6 questions. Ask for the reason behind each answer.'),
   (20, 'Join + fix', 'Students join the 4 pairs and fix the 2 mistakes. Check on the board.'),
   (15, 'Surprising facts', 'Students write 5 sentences, then read them out. The class says "Really?"'),
  ],
  answers=[
   '**Choose:** 1 Although, 2 However, 3 even though, 4 she, 5 However, 6 though.',
   '**Join:** Although it was cold, I went swimming. / Although she is shy, she speaks English very well. / Although he was ill, he came to class. / Although the film was long, we enjoyed it.',
   '**Fix:** Although he was tired, he studied. / She was late. However, she got the job.',
   '**Surprising facts:** students\' own sentences.'],
  tips=['Most students say "Although..., but...". Write both and cross out but.', 'Keep however simple: a new sentence, and a comma after it.'],
  homework='Write 6 sentences about your experiences with although and however.')),

# ---------------------------------------------------------------- Conjunction group 4
dict(F, day=25, theme='Joining words 4 - if and unless', time='10:00 to 11:30 (tea break 9:45 to 10:00)', title='Joining words 4: if and unless',
 focus='Talk about possible situations and their results with if and unless. This is the language of plans and the scholarship interview.',
 student=[
  dict(t='note', title='If + present, will + verb', items=[
   'Use **if** for something that is possible in the future.',
   '**If** + present simple, **will** + verb: **If** it rains, we **will** stay at home.',
   'The if part can come first (with a comma) or second (no comma): We will stay at home **if** it rains.',
   'Do not use will in the if part: If I **get** the scholarship, I will go to Korea. (not "if I will get")',
   '**Unless** = **if not**: **Unless** you study, you will fail. = **If** you **don\'t** study, you will fail.']),
  dict(t='gap', title='Complete the sentences', ins='Write the verbs in the correct form.', items=[
   'If it (rain) ___, we (stay) ___ at home.', 'If I (get) ___ the scholarship, I (study) ___ in Seoul.', 'She (be) ___ happy if she (pass) ___ the test.',
   'If you (not / hurry) ___, you (miss) ___ the bus.', 'What (you / do) ___ if you (not / get) ___ a visa?']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('___ you study, you will fail.', ['If', 'Unless', 'When']),
   ('If I ___ time, I will call you.', ['have', 'will have', 'had']),
   ('We will go to the beach if the weather ___ good.', ['is', 'will be', 'was']),
   ("I won't go ___ you come with me.", ['if', 'unless', 'because']),
   ('If she ___ hard, she will get a good job.', ['works', 'will work', 'work']),
   ('Unless it ___, we will play cricket.', ['rains', "doesn't rain", 'will rain'])]),
  dict(t='lines', title='Say it with unless', items=['If you don\'t study, you will fail.', 'If I don\'t get a visa, I won\'t go.']),
  dict(t='table', title='Chain game', ins='Write the first half, pass the paper, and your partner writes a result. Example: If I go to Korea, I will ... meet new friends.', head=['If...', '...I will'], rows=[
   ['If I get the scholarship,', ''], ['If I speak Korean well,', ''], ['If I work hard,', ''], ['If I meet someone famous,', '']]),
  dict(t='write', title='Interview answers', ins='Write 4 answers for a scholarship interview. Use if. Example: If I study in Korea, I will learn about technology and bring it back to Sri Lanka.', n=5),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use if + present simple + will for possible situations', 'Use unless to mean if not', 'Use if in simple interview answers'],
  steps=[
   (10, 'Warm-up: what if?', 'Ask "What will you do if it rains tomorrow?" "What will you do if you get the scholarship?" Write 3 answers on the board.'),
   (15, 'The rule', 'Teach the note. Show the two orders with a comma rule. Stress "no will after if".'),
   (20, 'Gaps + choose', 'Students do the 5 gaps and the 6 questions. Check and ask why.'),
   (15, 'Unless', 'Teach unless = if not. Students do the 2 rewrites.'),
   (30, 'Chain game + interview answers', 'Pairs pass the papers. Then students write 4 interview answers and practise saying them to a partner.'),
  ],
  answers=[
   '**Complete:** 1 rains, will stay. 2 get, will study. 3 will be, passes. 4 don\'t hurry, will miss. 5 will you do, don\'t get.',
   '**Choose:** 1 Unless, 2 have, 3 is, 4 unless, 5 works, 6 rains.',
   '**Unless:** Unless you study, you will fail. / Unless I get a visa, I won\'t go.',
   '**Chain game / interview answers:** students\' own answers.'],
  tips=['Unless is hard. Practise the swap with if + negative several times before using it freely.', 'Finish by connecting to the scholarship interview: "If you give me the scholarship, I will..."'],
  homework='Write 6 sentences about what you will do in Korea. Use if in at least three.')),
]
