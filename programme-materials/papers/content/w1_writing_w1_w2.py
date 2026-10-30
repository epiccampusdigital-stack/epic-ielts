W = dict(folder='Writing', kind='Grammar & writing', time='9:00 to 10:30', who='English Teacher 1')

LESSONS = [
dict(W, day=3, theme='Family & people', title='My family',
 focus='have / has, possessive \'s and my / your / his / her. Writing a paragraph about your family.',
 student=[
  dict(t='note', title='Grammar: have / has', items=['I / you / we / they **have**: I **have** two sisters.', 'he / she / it **has**: My brother **has** a motorbike.', 'Negative: I **don\'t have** a car. She **doesn\'t have** a job.', 'Question: **Do** you **have** any brothers? **Does** he **have** children?']),
  dict(t='note', title='Grammar: possessives', items=['**my, your, his, her, our, their**: This is **my** father. **His** name is Sunil.', 'Name + **\'s**: **Sunil\'s** wife = the wife of Sunil. My **parents\'** house (plural: s\').', 'Don\'t confuse **his** (a man\'s) and **her** (a woman\'s): My mother loves **her** garden.']),
  dict(t='gap', title='Choose the correct word', items=['My sister (have / has) two children.', 'We (have / has) a small house in Kegalle.', 'My uncle (don\'t / doesn\'t) have a car.', '(Do / Does) your parents have a shop?', 'This is my brother. (His / Her) name is Kasun.', 'My grandmother lives with (our / we).', 'That is (Amaya / Amaya\'s) bag.', 'My parents are farmers. (Their / There) farm is near Anuradhapura.']),
  dict(t='gap', title='Correct the mistakes', ins='Each sentence has one mistake. Write it correctly.', items=['My father have a small shop. ___', 'She name is Dilini. ___', 'I has three brothers. ___', 'This is my brother car. ___', 'Do she have a job? ___']),
  dict(t='passage', title='Read the model', head='My family, by Sachini',
    text="""There are five people in my family: my father, my mother, my two younger brothers and me. We live in a small house in Kurunegala.

My father's name is Ajith. He is fifty years old and he has a small grocery shop in our village. He is kind and hard-working. My mother's name is Nirmala. She is a teacher at a primary school. She loves cooking and her fish curry is the best in the world!

My brothers are Kavindu and Lahiru. Kavindu is sixteen and Lahiru is twelve. They are both crazy about cricket.

My grandmother also lives near us. She is seventy-eight but she is very active. I love my family very much and I will miss them in Korea."""),
  dict(t='list', title='Plan your paragraph', items=['How many people are in your family? Where do you live?', 'Person 1: name, age, job, one adjective, one detail', 'Person 2: name, age, job, one adjective, one detail', 'Other people (brothers, sisters, grandparents)', 'A final sentence: how you feel about your family']),
  dict(t='write', title='Write about your family', ins='Write 80 to 100 words. Use have / has and possessives. Check with the list below when you finish.', n=11),
  dict(t='table', title='Check your writing', head=['Did you...', '✓'], rows=[['use has with he / she?', ''], ['use his for men and her for women?', ''], ['write names with capital letters?', ''], ['give an adjective and a detail for each person?', ''], ['finish with a final sentence?', '']]),
 ],
 teacher=dict(
  need='Student worksheet, board. Optional: ask students to bring a family photo on their phone.',
  aims=['Use have / has correctly with all persons', 'Use possessive adjectives and \'s', 'Write a clear 80 to 100 word paragraph about family'],
  steps=[
   (10, 'Photo talk', 'Show a photo of your family (or draw a family tree). Students ask you questions: "Do you have...?"'),
   (15, 'Grammar', 'Go through both notes. Board drill: "I have... my brother has..." round the class.'),
   (15, 'Practice', 'Exercises 3 and 4 alone, then check in pairs. Board the answers.'),
   (10, 'Model', 'Read Sachini\'s paragraph. Ask: How many paragraphs? What details does she give for each person? Underline has / her / his.'),
   (30, 'Writing', 'Exercise 5 plan, then exercise 6. Circulate. Fast finishers draw a family tree with labels.'),
   (10, 'Check and share', 'Students use the checklist, swap with a partner and find one thing to fix. Collect the writing.'),
  ],
  answers=['**3:** 1 has, 2 have, 3 doesn\'t, 4 Do, 5 His, 6 us, 7 Amaya\'s, 8 Their',
   '**4:** 1 My father has a small shop. 2 Her name is Dilini. 3 I have three brothers. 4 This is my brother\'s car. 5 Does she have a job?'],
  tips=['Sinhala does not mark his/her the same way, so expect many "his mother... she" mix-ups. Correct gently and consistently.', 'Mark the writing with a simple code: G (grammar), Sp (spelling), WW (wrong word). Hand back on Day 5.'],
  homework='IT lab today: Day 3 lesson on epicielts.live. Homework: finish your family paragraph and learn 5 family words.'
 )),

dict(W, day=5, theme='Free time & likes', title='What I love doing',
 focus='Present simple with he / she / it. like / love / hate + -ing. Writing about a friend\'s hobbies.',
 student=[
  dict(t='note', title='Grammar: he / she / it + -s', items=['I play → she play**s**. I watch → he watch**es**. I study → she stud**ies**. I have → he **has**. I go → she go**es**.', 'Negative: he **doesn\'t** play (not doesn\'t plays).', 'Question: **Does** she like music? Yes, she **does**. / No, she **doesn\'t**.']),
  dict(t='note', title='like / love / hate + -ing', items=['I **love** sing**ing**. He **likes** play**ing** cricket. She **hates** get**ting** up early.', 'Scale: love ♥♥ > like ♥ > don\'t mind > don\'t like ✗ > hate ✗✗', 'Spelling: dance → danc**ing**, swim → swi**mm**ing, run → ru**nn**ing.']),
  dict(t='gap', title='Write the correct form', items=['My brother ___ (watch) football every night.', 'She ___ (study) Korean on Sundays.', 'He ___ (not like) spicy food.', '___ your friend ___ (play) any sports?', 'My mother ___ (go) to the temple on Poya days.', 'Kasun ___ (have) a guitar.']),
  dict(t='gap', title='Complete with -ing', items=['I love ___ (dance).', 'She hates ___ (swim) in the sea.', 'He likes ___ (take) photos.', 'Do you like ___ (run)?', 'My father doesn\'t mind ___ (cook).']),
  dict(t='passage', title='Read the model', head='My friend Ishan',
    text="""My best friend is Ishan. He lives in Ambalangoda, near the beach. He is twenty and he works in his uncle's restaurant.

Ishan loves surfing. He goes to the beach every morning at six and he surfs for an hour before work. He also likes taking photos of the sea and he has a great camera. In the evenings he plays the guitar and sings old baila songs.

He doesn't like watching TV and he hates getting up late on his day off! On Sundays he often teaches young children to swim.

Ishan is a very active person and I always feel happy when I'm with him."""),
  dict(t='table', title='Interview a partner', ins='Ask: "What do you love doing? What do you hate doing? What do you do on Sundays?"', head=['Question', 'My partner\'s answer'], rows=[['loves...', ''], ['likes...', ''], ['doesn\'t like...', ''], ['hates...', ''], ['every week, he / she...', '']]),
  dict(t='write', title='Write about your partner', ins='Write 80 to 100 words about your partner. Use he / she + -s and like / love / hate + -ing.', n=11),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use the -s ending with he / she / it', 'Use like / love / hate + -ing', 'Write about another person\'s free time (good practice for tonight\'s presentation night)'],
  steps=[
   (10, 'Hobby guess', 'Describe a student\'s hobbies in the third person without the name. Class guesses who.'),
   (15, 'Grammar', 'Both notes. Spelling rules for -es / -ies and -ing on the board.'),
   (15, 'Practice', 'Exercises 3 and 4.'),
   (10, 'Model', 'Read about Ishan. Students circle every verb with -s.'),
   (15, 'Interview', 'Exercise 6 in pairs.'),
   (20, 'Writing', 'Exercise 7. Partner checks every he/she verb has -s.'),
   (5, 'Presentation night', 'Remind: tonight at 7:30 is Presentation night #1, "This is me", 2 minutes each. They can use Day 3 and today\'s writing.'),
  ],
  answers=['**3:** 1 watches, 2 studies, 3 doesn\'t like, 4 Does... play, 5 goes, 6 has',
   '**4:** 1 dancing, 2 swimming, 3 taking, 4 running, 5 cooking'],
  tips=['The third person -s is the most common error at this level. Keep a tally on the board for the rest of the week and celebrate when it drops.'],
  homework='IT lab today: Day 5 lesson. Prepare your 2-minute "This is me" talk for tonight.'
 )),

dict(W, day=7, theme='Home & rooms', title='Describing my home',
 focus='there is / there are and prepositions of place. Writing a description of your home.',
 student=[
  dict(t='note', title='Grammar: there is / there are', items=['**There is** (there\'s) **a** sofa in the living room.  **There are** two bedrooms.', 'Negative: **There isn\'t a** garden. **There aren\'t any** chairs.', 'Question: **Is there a** fridge? **Are there any** windows?']),
  dict(t='note', title='Prepositions of place', items=['**in** the box, **on** the table, **under** the bed, **next to** the door, **between** the bed and the desk, **in front of** the TV, **behind** the curtain, **above** the sink']),
  dict(t='words', title='Rooms and furniture', items=['living room', 'kitchen', 'bedroom', 'bathroom', 'garden', 'sofa', 'wardrobe', 'shelf', 'fridge', 'cooker', 'mirror', 'fan', 'curtains', 'mat']),
  dict(t='gap', title='Complete with is, are, isn\'t or aren\'t', items=['There ___ a big tree in our garden. ✓', 'There ___ any pictures on the wall. ✗', 'There ___ three chairs in the kitchen. ✓', '___ there a fan in your room?', '___ there any shops near your house?', 'There ___ a TV in my bedroom. ✗']),
  dict(t='gap', title='Look at your classroom', ins='Write true sentences with a preposition.', items=['The board is ___.', 'My bag is ___.', 'The door is ___.', 'The teacher\'s desk is ___.']),
  dict(t='passage', title='Read the model', head='My home in Hambantota',
    text="""I live in a one-storey house in Hambantota with my parents and my sister. It isn't very big, but it's comfortable.

When you come in, there is a living room with a sofa, two chairs and a TV. On the wall above the TV, there are photos of my grandparents. The kitchen is behind the living room. There is a gas cooker, a fridge and a big table where we eat together.

There are two bedrooms. I share a room with my sister. There are two beds and a wardrobe between them. My desk is next to the window, so I can see the garden when I study.

Outside, there is a small garden with a mango tree. My favourite place is under the mango tree in the afternoon."""),
  dict(t='write', title='Write about your home', ins='Write 90 to 110 words. Describe 3 rooms. Use there is / there are and at least 5 prepositions. End with your favourite place.', n=12),
 ],
 teacher=dict(
  need='Student worksheet, board, a few classroom objects for preposition demos',
  aims=['Use there is / are in positive, negative and questions', 'Use 8 prepositions of place', 'Write a description of a home with clear organisation'],
  steps=[
   (10, 'Where\'s the pen?', 'Put a pen in, on, under, next to things. Students say where it is.'),
   (15, 'Grammar and words', 'Notes and word box. Students draw a quick plan of their home.'),
   (15, 'Practice', 'Exercises 4 and 5.'),
   (10, 'Model', 'Read the model. Students draw the house from the description, then compare drawings.'),
   (30, 'Writing', 'Exercise 6. Tell them to describe rooms in order, like walking through the house.'),
   (10, 'Share', 'Partner reads a description and draws it. Was the description clear?'),
  ],
  answers=['**4:** 1 is, 2 aren\'t, 3 are, 4 Is, 5 Are, 6 isn\'t',
   '**5:** Open answers. Check the preposition fits the classroom.'],
  homework='IT lab today: Day 7 lesson. Homework: describe your dormitory room here at Epic Campus in 5 sentences.'
 )),

dict(W, day=9, theme='Food & drink', title='Food, menus and a food blog',
 focus='Countable and uncountable nouns, some / any, a lot of. Writing about a favourite meal.',
 student=[
  dict(t='note', title='Countable and uncountable', items=['**Countable**: you can count them. an apple, two eggs, three bananas.', '**Uncountable**: you can\'t count them. rice, water, sugar, milk, bread, money.', 'Use **some** in positive sentences: I need **some** rice and **some** eggs.', 'Use **any** in negatives and questions: We don\'t have **any** milk. Do you have **any** chillies?', '**How many** + countable (How many eggs?). **How much** + uncountable (How much rice?).', 'With uncountable, use containers: **a cup of** tea, **a bottle of** water, **a kilo of** rice, **a plate of** noodles.']),
  dict(t='table', title='Countable or uncountable?', ins='Put the words in the right column: egg, rice, onion, milk, coconut, salt, banana, tea, chilli, flour', head=['Countable', 'Uncountable'], rows=[['', ''], ['', ''], ['', ''], ['', ''], ['', '']]),
  dict(t='gap', title='some, any, much or many?', items=['I\'d like ___ water, please.', 'There aren\'t ___ eggs in the fridge.', 'How ___ sugar do you take in your tea?', 'Do we have ___ onions?', 'How ___ people are coming for dinner?', 'Can I have ___ bananas?']),
  dict(t='passage', title='Read the model', head='My favourite meal: kottu roti',
    text="""My favourite meal is chicken kottu. It's a famous Sri Lankan street food and you can hear the sound of it from far away: the cook chops it on a hot iron plate with two metal blades. Clack, clack, clack!

To make kottu, you need some godamba roti, some chicken curry, a lot of vegetables (cabbage, carrots, leeks and onions), two eggs and some spices. You cut the roti into small pieces and fry everything together.

I usually eat kottu on Friday nights with my friends at a small shop near the bus stand. One plate costs about 1,200 rupees. It is hot, spicy and delicious.

In Korea I want to try bibimbap. It is rice with vegetables, meat, an egg and red pepper paste. I think I will love it!"""),
  dict(t='list', title='Plan', items=['What is your favourite meal? What is it like?', 'What do you need to make it? (use some, a lot of, two...)', 'When, where and with who do you eat it? How much does it cost?', 'A Korean food you want to try']),
  dict(t='write', title='Write about your favourite meal', ins='Write 90 to 110 words. Use some, any, a lot of and at least 6 food words.', n=12),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Tell countable from uncountable nouns', 'Use some / any / much / many correctly', 'Write a descriptive paragraph about food'],
  steps=[
   (10, 'Breakfast survey', 'What did you eat for breakfast? Board the food words and sort them.'),
   (15, 'Grammar', 'The note. Students find more examples from today\'s lunch menu.'),
   (15, 'Practice', 'Exercises 2 and 3.'),
   (10, 'Model', 'Read about kottu. Underline some / a lot of / quantities.'),
   (30, 'Writing', 'Plan and write. Encourage sensory words: hot, spicy, sweet, crispy.'),
   (10, 'Share', 'Read aloud; the class guesses the dish if the name is hidden. Next, after the break: ordering in a café role-play.'),
  ],
  answers=['**2:** Countable: egg, onion, coconut, banana, chilli. Uncountable: rice, milk, salt, tea, flour.',
   '**3:** 1 some, 2 any, 3 much, 4 any, 5 many, 6 some'],
  tips=['Some words are both (a chicken / some chicken; a coffee / some coffee). Mention it only if students ask.'],
  homework='IT lab today: Day 9 lesson. Homework: write a shopping list for your favourite meal with quantities.'
 )),

dict(W, day=11, theme='What\'s happening now?', title='Right now: describing a scene',
 focus='Present continuous vs present simple. Writing a description of a photo.',
 student=[
  dict(t='note', title='Present continuous', items=['am / is / are + verb-**ing**: I **am studying**. She **is cooking**. They **are playing**.', 'Use it for actions happening **now** or **around now**: Look! It**\'s raining**. I**\'m learning** Korean this month.', 'Negative: He **isn\'t working** today. Question: **Are** you **listening**?']),
  dict(t='note', title='Present simple or continuous?', items=['Present simple = habits and facts: I **drink** tea every morning. Water **boils** at 100°C.', 'Present continuous = now: I**\'m drinking** coffee right now.', 'Signal words: **usually, every day, often, never** → simple. **now, right now, at the moment, today, Look!** → continuous.', 'Some verbs are not used in continuous: like, love, want, know, need, understand. (I **want** tea, not I am wanting tea.)']),
  dict(t='gap', title='Choose the correct form', items=['Shh! The baby (sleeps / is sleeping).', 'I usually (walk / am walking) to school.', 'Look! Those boys (play / are playing) cricket in the rain.', 'She (doesn\'t eat / isn\'t eating) meat. She\'s vegetarian.', 'What (do you do / are you doing) right now?', 'I (want / am wanting) a cup of tea.', 'My father (works / is working) in Dubai this year.', 'Every Poya day we (go / are going) to the temple.']),
  dict(t='passage', title='Read the model', head='A picture of Galle Face Green',
    text="""This photo shows Galle Face Green in Colombo on a Sunday evening. The sun is setting over the sea and the sky is orange and pink.

In the front of the picture, a family is sitting on a mat. The father is eating isso wade and the two children are laughing. On the right, a man is selling kites. Some of the kites are flying high above the people.

In the background, a lot of people are walking along the sea wall. A young couple is taking a selfie, and some boys are playing football on the grass.

Galle Face is always busy on weekends. People come here to relax, eat street food and enjoy the sea breeze."""),
  dict(t='list', title='Useful phrases for describing a picture', items=['This photo shows...', 'In the front / in the background...', 'On the left / on the right / in the middle...', 'It looks like... / I think they are...']),
  dict(t='write', title='Describe a photo', ins='Choose a photo on your phone (a place, a festival, your family). Write 90 to 110 words about what is happening. Use the present continuous at least 5 times and one sentence in the present simple.', n=12),
 ],
 teacher=dict(
  need='Student worksheet, board, one large photo to show (projector or printed)',
  aims=['Form and use the present continuous', 'Choose between present simple and continuous', 'Describe a picture in an organised way (also needed for the speaking lesson after the break)'],
  steps=[
   (10, 'Mime chain', 'A student mimes; the class says "He\'s brushing his teeth!" Then swap.'),
   (15, 'Grammar', 'Both notes. Highlight the non-continuous verbs.'),
   (15, 'Practice', 'Exercise 3. Students explain why for each answer.'),
   (10, 'Model', 'Read about Galle Face. Students mark the picture phrases (front, background, on the right).'),
   (30, 'Writing', 'Exercise 6. Students who have no photo can describe the view from the classroom window.'),
   (10, 'Wrap-up', 'Tonight: Debate night #1 "City life or village life?" Ask each student to note 2 reasons for their side.'),
  ],
  answers=['**3:** 1 is sleeping, 2 walk, 3 are playing, 4 doesn\'t eat, 5 are you doing, 6 want, 7 is working (temporary, this year), 8 go'],
  homework='IT lab today: Day 11 lesson. Homework: prepare 3 reasons for tonight\'s debate.'
 )),

dict(W, day=13, theme='Yesterday', title='Where were you yesterday?',
 focus='Past simple of be (was / were) and time expressions. Writing a short diary entry.',
 student=[
  dict(t='note', title='was / were', items=['I / he / she / it **was**. You / we / they **were**.', 'Negative: I **wasn\'t** at home. They **weren\'t** tired.', 'Question: **Were** you at the party? Yes, I **was**. / No, I **wasn\'t**. **Where was** he yesterday?', 'Time words: **yesterday**, **last** night / week / year, three days **ago**, **in** 2020, **on** Monday.']),
  dict(t='gap', title='was, were, wasn\'t or weren\'t?', items=['I ___ in Kandy last week.', 'My parents ___ at home yesterday. ✗', 'The food ___ delicious.', '___ you tired after the bus journey?', 'It ___ cold last night. ✗', 'Where ___ your brothers on Sunday?']),
  dict(t='gap', title='Put the time expression in order', items=['ago / two / days →', 'week / last →', 'yesterday / morning →', '2023 / in →']),
  dict(t='passage', title='Read the model', head='My diary: Wednesday',
    text="""Wednesday 11 November

Today was a long day. In the morning I was in class from 8:30 to 12:15. The English lesson was about the past and it was easy. The Korean lesson was hard because there were a lot of new words.

At lunch I was very hungry. The rice and curry were good, but there wasn't any dessert!

The IT lab in the afternoon was fun. My score on the listening quiz was 8 out of 10. My friend Pasindu wasn't happy because his score was 5.

Last night I was on the phone with my mother for an hour. She was worried about the cold in Korea. Tonight I am tired but happy."""),
  dict(t='write', title='Your diary', ins='Write a diary entry about yesterday (80 to 100 words). Use was / were at least 6 times and 3 time expressions. Include how you felt.', n=11),
  dict(t='table', title='Find someone who...', ins='Ask: "Were you... ?" Write a name.', head=['...was at the beach last month', '...was in Colombo last year', '...was tired this morning', '...was born in January'], rows=[['', '', '', '']]),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use was / were in all forms', 'Use time expressions with the past', 'Write a short diary entry'],
  steps=[
   (10, 'Memory test', 'Ask: Where were you at 8 pm yesterday? Who was next to you at lunch?'),
   (15, 'Grammar', 'The note. Drill short answers.'),
   (15, 'Practice', 'Exercises 2 and 3, then exercise 6 as a mingle.'),
   (10, 'Model', 'Read the diary. Find all was / were / wasn\'t / weren\'t.'),
   (30, 'Writing', 'Exercise 5.'),
   (10, 'Wrap-up', 'Two diaries read aloud. Introduce the idea of a diary for the whole programme: one entry a day helps writing grow.'),
  ],
  answers=['**2:** 1 was, 2 weren\'t, 3 was, 4 Were, 5 wasn\'t, 6 were',
   '**3:** two days ago, last week, yesterday morning, in 2023'],
  homework='IT lab today: Day 13 lesson. Homework: start an English diary. Write 3 sentences every night.'
 )),
]
