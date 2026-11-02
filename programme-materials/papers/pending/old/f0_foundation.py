# Grammar foundation, part 1: parts of speech (Day 4), sentence patterns (Day 8), pronouns and prepositions (Day 10).
# Tenses and conjunctions are in f1_tenses_conjunctions.py, one lesson per tense / group of joining words.
F = dict(folder='Grammar foundation', kind='Grammar foundation')

LESSONS = [
# ---------------------------------------------------------------- F1
dict(F, day=4, theme='Foundation 1 - Parts of speech', time='10:30 to 11:30 (after the placement test)', who='English Teacher 2 (Sir)',
 title='Foundation 1: the parts of speech',
 focus='Every English word has a job. Learn the 8 jobs (parts of speech) so you can understand and build any sentence.',
 student=[
  dict(t='table', title='The 8 parts of speech', head=['Part of speech', 'Its job', 'Examples'], rows=[
   ['**Noun**', 'a person, place, thing or idea', 'teacher, Galle, book, rice, love'],
   ['**Pronoun**', 'takes the place of a noun', 'I, you, he, she, it, we, they, me, him'],
   ['**Verb**', 'an action or a state', 'eat, study, go, is, have, like'],
   ['**Adjective**', 'describes a noun', 'big, happy, red, new, beautiful'],
   ['**Adverb**', 'describes a verb (how, when, how often)', 'quickly, slowly, always, very, today'],
   ['**Preposition**', 'shows place or time', 'in, on, at, under, next to, before'],
   ['**Conjunction**', 'joins words or sentences', 'and, but, or, so, because'],
   ['**Interjection**', 'shows a feeling', 'Oh! Wow! Hey! Oops!']]),
  dict(t='note', title='One sentence, many parts', items=[
   '**Wow!** (interjection) **My** (pronoun) **young** (adjective) **brother** (noun) **plays** (verb) **cricket** (noun) **very** (adverb) **well** (adverb) **in** (preposition) **Galle** (noun) **and** (conjunction) **he** (pronoun) **loves** (verb) **it** (pronoun).',
   'Tip: ask "What job does this word do here?" The same word can change job: I **work** hard (verb). My **work** is hard (noun).']),
  dict(t='words', title='Sort the words', ins='Write each word in the correct box below.', items=['Colombo', 'run', 'happy', 'quickly', 'she', 'under', 'and', 'wow', 'teacher', 'eat', 'beautiful', 'slowly', 'they', 'on', 'but', 'oh', 'water', 'write', 'tall', 'always', 'him', 'between', 'because', 'hey']),
  dict(t='table', head=['Noun', 'Pronoun', 'Verb', 'Adjective'], rows=[['', '', '', ''], ['', '', '', ''], ['', '', '', '']]),
  dict(t='table', head=['Adverb', 'Preposition', 'Conjunction', 'Interjection'], rows=[['', '', '', ''], ['', '', '', ''], ['', '', '', '']]),
  dict(t='gap', title='What job does the word in bold do?', ins='Write noun, pronoun, verb, adjective, adverb, preposition, conjunction or interjection.', items=[
   'My **sister** works in a hospital. ___', 'We **study** English every day. ___', 'The test was **easy**. ___', 'Please speak **slowly**. ___',
   'The phone is **on** the table. ___', 'I like tea **but** I don\'t like coffee. ___', '**They** live in Matara. ___', '**Oops!** I dropped my pen. ___',
   'Korea is a **cold** country in winter. ___', 'He **always** gets up at five. ___', 'I am tired **because** I didn\'t sleep. ___', 'The cat is sleeping **under** the bed. ___']),
  dict(t='pagebreak'),
  dict(t='note', title='Nouns: one and many', items=[
   'Most nouns add **-s**: book → book**s**, student → student**s**.',
   'After s, sh, ch, x add **-es**: bus → bus**es**, box → box**es**, watch → watch**es**.',
   'Consonant + y → **-ies**: city → cit**ies**, baby → bab**ies**. (But day → days.)',
   'Some nouns are irregular: man → **men**, woman → **women**, child → **children**, person → **people**, tooth → **teeth**, foot → **feet**.']),
  dict(t='table', title='Write the plural', head=['One', 'Many', 'One', 'Many'], rows=[
   ['book', '', 'child', ''], ['bus', '', 'woman', ''], ['city', '', 'person', ''], ['box', '', 'tooth', ''], ['day', '', 'family', '']]),
  dict(t='note', title='Adjective or adverb?', items=[
   'An **adjective** describes a noun: She is a **careful** driver.',
   'An **adverb** describes a verb, and often ends in **-ly**: She drives **carefully**.',
   'Irregular: good → **well**, fast → **fast**, hard → **hard**.',
   'Adjectives come **before** the noun in English: a **big** house (not a house big).']),
  dict(t='mcq', title='Choose the correct word', items=[
   ('She sings ___.', ['beautiful', 'beautifully', 'beauty']),
   ('He is a ___ student.', ['good', 'well', 'goodly']),
   ('Please walk ___. The baby is sleeping.', ['quiet', 'quietly', 'quietness']),
   ('This is a ___ question.', ['difficult', 'difficultly', 'difficulty']),
   ('My brother speaks English very ___.', ['good', 'well', 'nice']),
   ('I have a ___.', ['car red', 'red car', 'reds car']),
   ('They work very ___ in the paddy field.', ['hard', 'hardly', 'hards']),
   ('The bus is ___ today.', ['late', 'lately', 'latest'])]),
  dict(t='write', title='Your turn', ins='Write 5 sentences about yourself, your family or your village. In each sentence, underline one noun, circle one verb and put a box around one adjective.', n=7),
  dict(t='lines', title='Quick check', items=['Name the 8 parts of speech.', 'Which part of speech is "quickly"? Why?', 'Write one sentence with a conjunction in it.']),
 ],
 teacher=dict(
  need='Student worksheet, board, 8 sheets of paper with one part of speech written on each (for the warm-up)',
  aims=['Name the 8 parts of speech and say what each one does', 'Recognise the part of speech of a word in a sentence', 'Use plural nouns and choose between adjectives and adverbs'],
  steps=[
   (5, 'Warm-up', 'Write "My happy students study English in Galle." on the board. Ask: which words are people or places? Which word is an action? Which word describes? Lead in to "every word has a job".'),
   (15, 'The 8 parts', 'Go through the table. For each part, students give one more example from their own life. Read the "one sentence, many parts" note together.'),
   (20, 'Sort the words', 'Pairs sort the 24 words. Check on the board. Stick the 8 papers on the walls; call out a word and students point to the right paper.'),
   (20, 'What job?', 'Students do the 12 sentences alone, then compare. Check and ask "why?" for each one. Only 60 minutes today after the placement test: plurals and adjective or adverb are done as homework and checked at the start of Day 8.'),
  ],
  answers=[
   '**Sort the words:** Noun: Colombo, teacher, water. Pronoun: she, they, him. Verb: run, eat, write. Adjective: happy, beautiful, tall. Adverb: quickly, slowly, always. Preposition: under, on, between. Conjunction: and, but, because. Interjection: wow, oh, hey.',
   '**What job:** 1 noun, 2 verb, 3 adjective, 4 adverb, 5 preposition, 6 conjunction, 7 pronoun, 8 interjection, 9 adjective, 10 adverb, 11 conjunction, 12 preposition.',
   '**Plurals:** books, buses, cities, boxes, days; children, women, people, teeth, families.',
   '**Choose:** 1 beautifully, 2 good, 3 quietly, 4 difficult, 5 well, 6 red car, 7 hard, 8 late.',
   '**Quick check:** 1 noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection. 2 adverb, because it tells us how someone does an action. 3 Students\' own answers.'],
  tips=['Sinhala puts the verb at the end and has postpositions, not prepositions, so students may not "see" prepositions. Point them out every time.', 'Expect "goodly" and "very good English he speaks". Keep pointing back to the adjective/adverb note.', 'Do not teach every exception today. The goal is to name the jobs; we use them all week.'],
  homework='Homework: do "Nouns: one and many", "Adjective or adverb?" and "Your turn" in the workbook. Check them together at the start of Day 8. Also find 10 words on a sign, poster or packet and write their part of speech.',
 )),

# ---------------------------------------------------------------- F2
dict(F, day=8, theme='Foundation 2 - Sentence patterns', time='8:30 to 11:30 (tea break 10:00 to 10:15)', who='English Teacher 2 (Sir)',
 title='Foundation 2: how to build an English sentence',
 focus='The basic sentence patterns, English word order, and how to make negatives and questions with be and do.',
 student=[
  dict(t='table', title='The basic patterns', head=['Pattern', 'Example'], rows=[
   ['Subject + Verb', 'Birds **fly**. The baby **is sleeping**.'],
   ['Subject + Verb + Object', 'I **eat** rice. My father **drives** a bus.'],
   ['Subject + be + Noun / Adjective', 'She **is** a nurse. We **are** tired.'],
   ['Subject + Verb + Place / Time', 'We **live** in Galle. The class **starts** at 8:30.'],
   ['Subject + Verb + Person + Thing', 'My mother **gave** me a bag. He **sent** her a message.']]),
  dict(t='note', title='Word order rules', items=[
   'Every sentence needs a **subject** and a **verb**: **It** is hot today. (not "Is hot today.")',
   'The verb comes **after** the subject, and the object comes **after** the verb: I **eat** rice. (not "I rice eat.")',
   'Order: **Subject → Verb → Object → Place → Time**: I study English in the classroom every morning.',
   'Adjectives go before the noun: a **new** phone. Words like always / usually / never go before the main verb: I **always** drink tea.']),
  dict(t='gap', title='Find the parts', ins='Write S over the subject, V over the verb and O over the object (if there is one).', items=[
   'Kasun plays cricket.', 'My sister is a teacher.', 'We study Korean every afternoon.', 'The students are happy.',
   'I drink tea in the morning.', 'Dilini sent me a photo.', 'The bus leaves at six.', 'They like spicy food.']),
  dict(t='gap', title='Put the words in order', items=[
   'rice / eat / I / every day ___', 'is / my / a / brother / driver ___', 'English / we / in the classroom / study ___',
   'at seven / gets up / she ___', 'drinks / my father / tea / always ___', 'Korea / to / next month / go / they / will ___',
   'a / bag / bought / me / my mother ___', 'very / is / today / hot / it ___']),
  dict(t='pagebreak'),
  dict(t='note', title='Negatives and questions: be', items=[
   'Positive: She **is** a student. They **are** at home.',
   'Negative: add **not**: She **is not (isn\'t)** a student. They **aren\'t** at home. I **am not (I\'m not)** tired.',
   'Question: put be **first**: **Is** she a student? **Are** they at home? Short answers: Yes, she is. / No, they aren\'t.']),
  dict(t='note', title='Negatives and questions: other verbs (do / does)', items=[
   'Positive: I **work** in Galle. He **works** in Galle.',
   'Negative: I **don\'t work** in Galle. He **doesn\'t work** in Galle. (not "He doesn\'t works")',
   'Question: **Do** you **work** in Galle? **Does** he **work** in Galle? Yes, he does. / No, he doesn\'t.',
   'Wh- questions: Question word + do / does + subject + verb: **Where do** you live? **What does** she study?']),
  dict(t='gap', title='Find the mistake', ins='Each sentence has one mistake. Write it correctly.', items=[
   'Is very hot today. ___', 'I rice eat every day. ___', 'She go to school by bus. ___', 'I am like Korean food. ___',
   'He doesn\'t plays cricket. ___', 'Where you live? ___', 'My brother he is a driver. ___', 'They are come from Matara. ___']),
  dict(t='table', title='Make it negative, then make a question', head=['Positive', 'Negative', 'Question'], rows=[
   ['She is from Kandy.', '', ''], ['They are students.', '', ''], ['You like rice.', '', ''],
   ['He works in a shop.', '', ''], ['We study every day.', '', ''], ['It is cold in Korea.', '', '']]),
  dict(t='cards', title='Sentence builder (speaking, in groups)', ins='Take one card from each box and make a correct sentence. Then make it negative and a question. Your group checks it.', items=[
   ('Subject', ['I', 'My mother', 'The students', 'Our teacher', 'We', 'My best friend']),
   ('Verb', ['like / likes', 'study / studies', 'cook / cooks', 'watch / watches', 'speak / speaks', 'buy / buys']),
   ('Object', ['rice and curry', 'Korean', 'TV', 'English', 'new clothes', 'fish']),
   ('Place / time', ['at home', 'every evening', 'in the classroom', 'on Sundays', 'in Galle', 'after lunch'])]),
  dict(t='write', title='My day in 8 sentences', ins='Write 8 sentences about your day. Use Subject → Verb → Object → Place → Time. Make 2 of them negative and finish with 2 questions for a friend.', n=10),
 ],
 teacher=dict(
  need='Student worksheet, board, the sentence-builder cards cut up (or students copy them onto small papers)',
  aims=['Build correct sentences with the 5 basic patterns', 'Keep English word order (subject, verb, object, place, time)', 'Make negatives and questions with be and with do / does'],
  steps=[
   (10, 'Warm-up', 'Write "I rice eat every day." Ask: is this correct English? Why do we say it like this in Sinhala? Show the English order.'),
   (25, 'Patterns', 'Go through the 5 patterns and word order rules. Students give one more example for each pattern from their own life.'),
   (25, 'Find the parts', 'Students mark S, V, O in the 8 sentences, then check in pairs. Check on the board.'),
   (30, 'Word order', 'Students put the 8 groups of words in order. Two students write answers on the board; the class corrects.'),
   (15, 'Tea break', ''),
   (20, 'Be and do', 'Teach both notes. Drill: you say a positive sentence, students say the negative and the question.'),
   (20, 'Mistakes + table', 'Find the mistake (8), then the negative / question table. Check together.'),
   (20, 'Sentence builder', 'Groups of 3 or 4 with the cards. Each student makes 4 sentences, then the negative and question. Groups score a point for each correct sentence.'),
   (15, 'Writing', 'Students write "My day in 8 sentences". Collect it; mark only word order and do / does today.'),
  ],
  answers=[
   '**Find the parts:** 1 Kasun (S) plays (V) cricket (O). 2 My sister (S) is (V), a teacher is a complement, no object. 3 We (S) study (V) Korean (O). 4 The students (S) are (V), no object. 5 I (S) drink (V) tea (O). 6 Dilini (S) sent (V) me / a photo (O). 7 The bus (S) leaves (V), no object. 8 They (S) like (V) spicy food (O).',
   '**Word order:** 1 I eat rice every day. 2 My brother is a driver. 3 We study English in the classroom. 4 She gets up at seven. 5 My father always drinks tea. 6 They will go to Korea next month. 7 My mother bought me a bag. 8 It is very hot today.',
   '**Find the mistake:** 1 It is very hot today. 2 I eat rice every day. 3 She goes to school by bus. 4 I like Korean food. 5 He doesn\'t play cricket. 6 Where do you live? 7 My brother is a driver. 8 They come from Matara.',
   '**Table:** She isn\'t from Kandy. / Is she from Kandy? · They aren\'t students. / Are they students? · You don\'t like rice. / Do you like rice? · He doesn\'t work in a shop. / Does he work in a shop? · We don\'t study every day. / Do we study every day? · It isn\'t cold in Korea. / Is it cold in Korea?'],
  tips=['The two biggest problems for Sinhala speakers: the verb at the end ("I rice eat") and a missing subject ("Is hot"). Correct these every time you hear them this week.', '"I am like" and "They are come" come from mixing be with other verbs. Keep the rule simple: be OR do, not both.', 'Keep the cards: we use them again on Day 5 with tenses.'],
  homework='IT lab today: General English > Learn, sentence basics. Homework: write 5 sentences about your family, then make each one a question.',
 )),

# ---------------------------------------------------------------- F3
dict(F, day=10, theme='Foundation 3 - Pronouns and prepositions', time='8:30 to 11:30 (tea break 10:00 to 10:15)', who='English Teacher 2 (Sir)',
 title='Foundation 3: pronouns and prepositions',
 focus='I / me / my / mine, this / that / these / those, and the small words for time and place: at, on, in, under, next to, between.',
 student=[
  dict(t='table', title='Pronouns', head=['Subject', 'Object', 'Possessive adjective', 'Possessive pronoun'], rows=[
   ['I', 'me', 'my', 'mine'], ['you', 'you', 'your', 'yours'], ['he', 'him', 'his', 'his'], ['she', 'her', 'her', 'hers'],
   ['it', 'it', 'its', '-'], ['we', 'us', 'our', 'ours'], ['they', 'them', 'their', 'theirs']]),
  dict(t='note', title='How to use them', items=[
   'Subject (before the verb): **She** likes music.',
   'Object (after the verb or a preposition): I like **her**. Come with **us**.',
   'Possessive adjective + noun: This is **my** bag. Possessive pronoun alone: This bag is **mine**.',
   '**this / these** = near me. **that / those** = far from me. this book, these books; that man, those men.']),
  dict(t='gap', title='Choose the correct word', items=[
   '(I / Me) am from Galle.', 'Please help (we / us).', 'This is Nimal. (His / Him) sister is a nurse.', 'Is this pen (your / yours)?',
   'The dog is eating (its / it\'s) food.', 'My parents love (they / their) garden.', 'Can you call (she / her) tonight?', '(This / These) shoes are new.',
   'Look at (that / those) bird in the tree.', 'That house is (our / ours).']),
  dict(t='gap', title='Use pronouns', ins='Rewrite the paragraph. Change the underlined names to pronouns so it does not repeat.', items=[
   'Sanduni is my friend. Sanduni lives in Hikkaduwa. Sanduni\'s house is near the sea. I visit Sanduni every Sunday. Sanduni and I go to the beach. Sanduni\'s mother makes lunch for Sanduni and me.']),
  dict(t='write', n=4),
  dict(t='table', title='Prepositions of time', head=['at', 'on', 'in'], rows=[
   ['times: at 8:30, at noon', 'days: on Monday, on Sunday', 'months: in November'],
   ['at night, at the weekend', 'dates: on 30 October', 'years: in 2026'],
   ['at lunchtime, at Vesak', 'on my birthday', 'in the morning / afternoon / evening']]),
  dict(t='gap', title='at, on or in?', items=[
   'The class starts ___ 8:30.', 'We go to Korea ___ March.', 'My birthday is ___ 12 June.', 'I don\'t work ___ Sundays.',
   'She was born ___ 2004.', 'I drink tea ___ the morning.', 'We sleep ___ night.', 'The test is ___ Friday.',
   'It is cold in Korea ___ winter.', 'Let\'s meet ___ lunchtime.']),
  dict(t='pagebreak'),
  dict(t='note', title='Prepositions of place', items=[
   '**in** a box, in the room, in Galle · **on** the table, on the wall · **under** the bed',
   '**next to** the door · **between** the bank and the shop · **behind** the house · **in front of** the school · **opposite** the temple']),
  dict(t='table', title='Look at the shelf', ins='This is a shelf with two rows. Use it to complete the sentences below.', head=['Left', 'Middle', 'Right'], rows=[
   ['a dictionary', 'a clock', 'a cup'], ['a phone', 'a box', 'a pen']]),
  dict(t='gap', items=[
   'The clock is ___ the dictionary and the cup.', 'The box is ___ the clock.', 'The cup is ___ the clock.', 'The phone is ___ the dictionary.',
   'The clock is ___ the box.', 'The box is ___ the phone and the pen.']),
  dict(t='cards', title='Speaking: where and when?', items=[
   ('Ask your partner', ['Where is your bag?', 'Where is the door?', 'Where is your phone now?', 'Where is your village?']),
   ('Then ask', ['When is your birthday?', 'What time do you get up?', 'What do you do on Saturdays?', 'When do you go to Korea?'])]),
  dict(t='write', title='My room and my week', ins='Write 6 sentences: 3 about where things are in your room (in, on, under, next to, between), and 3 about your week (at, on, in).', n=7),
 ],
 teacher=dict(
  need='Student worksheet, board, a few objects for the place prepositions (bag, book, phone, box)',
  aims=['Use subject, object and possessive pronouns correctly', 'Use at / on / in for time', 'Describe where things are with prepositions of place'],
  steps=[
   (10, 'Warm-up', 'Hold up a student\'s pen: "Whose is this? It\'s Kasun\'s. It\'s his pen. It\'s his." Do it with 4 or 5 objects.'),
   (20, 'Pronouns', 'Go through the table and the note. Point at people in the room: he / him / his. Drill this / that / these / those with near and far objects.'),
   (30, 'Practice', 'Choose the word (10), then the paragraph. Two students read their paragraph aloud.'),
   (30, 'Time', 'Teach at / on / in with the table. Students do the 10 gaps, then ask each other "When is your birthday?" "What time do you get up?"'),
   (15, 'Short break', ''),
   (20, 'Place', 'Use real objects on the desk: in, on, under, next to, between, behind, in front of. Students do the shelf exercise.'),
   (25, 'Speaking + writing', 'Pairs ask the card questions. Then start "My room and my week". Finish it in the IT lab.'),
  ],
  answers=[
   '**Choose:** 1 I, 2 us, 3 His, 4 yours, 5 its, 6 their, 7 her, 8 These, 9 that, 10 ours.',
   '**Paragraph (model):** Sanduni is my friend. She lives in Hikkaduwa. Her house is near the sea. I visit her every Sunday. She and I (We) go to the beach. Her mother makes lunch for us.',
   '**at / on / in:** 1 at, 2 in, 3 on, 4 on, 5 in, 6 in, 7 at, 8 on, 9 in, 10 at.',
   '**Shelf:** 1 between, 2 under, 3 next to, 4 under, 5 on (above is also fine), 6 between.'],
  tips=['he / she mix-ups are very common; correct gently and every time.', '"it\'s" = it is; "its" = belongs to it. Many students will write "it\'s food".', 'In / on / at for time is learned by use, not rules alone. Use these questions every morning this week.'],
  homework='IT lab 3:30 to 4:30: finish "My room and my week", then General English > Learn. Homework: write 5 sentences about where things are in the dormitory.',
 )),
]
