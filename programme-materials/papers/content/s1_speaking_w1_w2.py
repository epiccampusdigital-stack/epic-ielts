S = dict(folder='Speaking', kind='Speaking', time='1:15 to 2:45', who='English Teacher 2')

LESSONS = [
dict(S, day=1, theme='Hello! Introductions', title='Greetings and introducing yourself',
 focus='Saying hello, introducing yourself and others, spelling your name.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['greet', 'Hello! / Hi! / Good morning. / Good afternoon.'], ['introduce yourself', 'My name\'s... / I\'m... / I\'m from... / I\'m 20.'], ['ask', 'What\'s your name? / Where are you from? / How old are you?'], ['introduce someone', 'This is Amaya. She\'s from Kandy.'], ['respond', 'Nice to meet you. / Nice to meet you too.'], ['spell', 'How do you spell that? / It\'s P-E-R-E-R-A.'], ['say goodbye', 'Bye! / See you later! / Have a nice day!']]),
  dict(t='note', title='The alphabet: letters that are easy to mix', items=['**A** /eɪ/ and **E** /iː/ and **I** /aɪ/', '**G** /dʒiː/ and **J** /dʒeɪ/', '**B** and **V**, **P** and **F** (lips!)', '**W** = double-u. **Y** = /waɪ/. **Z** = zed (UK).', 'Double letters: **ee** = double E, **ss** = double S.']),
  dict(t='dialogue', title='Practise the conversation', ins='Practise with a partner. Then use your own information.', lines=[
    ('A', 'Hi! I\'m Kasun. What\'s your name?'), ('B', 'Hello, Kasun. My name\'s Hiruni.'), ('A', 'Nice to meet you, Hiruni. How do you spell that?'), ('B', 'H-I-R-U-N-I.'),
    ('A', 'Where are you from?'), ('B', 'I\'m from Matara. And you?'), ('A', 'I\'m from Kegalle. This is my friend Ravi. He\'s from Kegalle too.'), ('B', 'Nice to meet you, Ravi!')]),
  dict(t='table', title='Meet the group', ins='Talk to 6 classmates. Write their information.', head=['Name (spelling!)', 'Hometown', 'Age', 'One interesting fact'], rows=[['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']]),
  dict(t='list', title='Introduce a classmate', items=['This is...', 'He / She is from... and he / she is... years old.', 'He / She likes...', 'An interesting fact: ...']),
 ],
 teacher=dict(
  need='Student worksheet, board, name cards. This is the first lesson after the placement test, so keep the mood relaxed.',
  aims=['Greet and introduce yourself confidently', 'Spell names using the English alphabet', 'Introduce another person to the group'],
  steps=[
   (10, 'Welcome', 'Introduce yourself slowly, write your name and spell it. Students say "Nice to meet you".'),
   (15, 'Useful language', 'Go through the table. Drill with the whole class, then pairs.'),
   (15, 'Alphabet', 'Alphabet chant, then the note. Spelling game: you spell a Sri Lankan city, students guess. Then students spell for each other.'),
   (10, 'Dialogue', 'Pairs practise, then swap in their own information.'),
   (25, 'Meet the group', 'Mingle with exercise 4. Students must spell names correctly; check a few.'),
   (15, 'Introduce a classmate', 'Each student introduces one classmate to the group with exercise 5.'),
  ],
  extra=[('Notes for the teacher (use them later)', ['Write down 2 or 3 speaking points for each student today: confidence, pronunciation, vocabulary. Compare on Day 15 and Day 29.', 'Welcome night is this evening; encourage students to use the same phrases there.'])],
  homework='IT lab today: Day 1 lesson on epicielts.live. Homework: learn the names and hometowns of everyone in the group.'
 )),

dict(S, day=3, theme='Family & people', title='Talking about your family',
 focus='Describing family members: names, jobs, ages, appearance and personality.',
 student=[
  dict(t='table', title='Useful language', head=['Topic', 'Say'], rows=[
    ['family size', 'There are five people in my family. / I have two brothers and a sister.'], ['jobs', 'My father is a farmer. / My mother works in a garment factory.'],
    ['age', 'My brother is 15. / My grandmother is in her seventies.'], ['appearance', 'He\'s tall. She has long black hair. He has a beard.'], ['personality', 'She\'s kind / funny / strict / quiet / hard-working.'], ['feelings', 'I\'m very close to my sister. / I miss my mother\'s cooking.']]),
  dict(t='note', title='Pronunciation', items=['**th**: put your tongue between your teeth: **th**ree, bro**th**er, mo**th**er, fa**th**er.', 'Word stress: **BRO**ther, **GRAND**mother, **COU**sin, **DAUGH**ter.']),
  dict(t='cards', title='Questions to ask', items=[
    ('Family', ['How many people are there in your family?', 'Do you have any brothers or sisters?', 'Who do you live with?']),
    ('People', ['What does your father / mother do?', 'Who is the funniest person in your family?', 'Who are you most similar to?']),
    ('Feelings', ['Who will you miss most in Korea?', 'What do you do together as a family?', 'Is your family big or small? Do you like that?']),
    ('Extra', ['Tell me about your grandparents.', 'Do you have any cousins in other countries?', 'What is a family tradition you love?'])]),
  dict(t='write', title='Draw your family tree', ins='Draw your family tree here. Use it to talk about your family for 1 minute.', n=8),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Talk about family for one minute with details', 'Ask and answer follow-up questions', 'Pronounce "th" and family word stress'],
  steps=[
   (10, 'Your family', 'Talk about your own family for one minute (draw it on the board). Students ask you 3 questions.'),
   (15, 'Useful language', 'The table and pronunciation note. "th" practice in a mirror (phone camera works).'),
   (15, 'Family tree', 'Students draw their tree (exercise 4).'),
   (25, 'Interviews', 'Pairs use the question cards. Rule: every answer needs one extra sentence. Change partners twice.'),
   (15, 'One-minute talk', 'Each student talks for one minute using their tree. Others note one fact and ask one question.'),
   (10, 'Feedback', 'Board good sentences you heard and 3 common mistakes (has/have, his/her).'),
  ],
  tips=['Some students may have difficult family situations. Let them choose who to talk about ("people who are important to me").'],
  homework='IT lab today: Day 3 lesson. Homework: record a one-minute voice note about your family and listen to it.'
 )),

dict(S, day=5, theme='Free time & likes', title='Talking about hobbies',
 focus='Talking about free time, likes and dislikes, how often you do things. Preparing for Presentation night #1.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['say what you like', 'I love... / I really like... / I\'m into... / I\'m crazy about...'], ['say what you don\'t like', 'I\'m not a big fan of... / I don\'t really like... / I can\'t stand...'],
    ['say how often', 'every day / twice a week / at weekends / sometimes / hardly ever'], ['ask', 'What do you do in your free time? / How often do you...? / Who do you... with?'], ['react', 'Really? / That sounds fun! / Me too! / Oh, I don\'t.']]),
  dict(t='table', title='Free time survey', ins='Ask 3 classmates. Write their answers.', head=['Question', 'Name:', 'Name:', 'Name:'], rows=[
    ['What do you do in your free time?', '', '', ''], ['How often?', '', '', ''], ['Who with?', '', '', ''], ['What do you hate doing?', '', '', '']]),
  dict(t='cards', title='Plan your "This is me" talk (tonight, 2 minutes)', items=[
    ('1. Hello', ['Name, age, hometown', 'Family (one sentence)']), ('2. My day', ['A normal day at home', 'One thing I do every day']),
    ('3. My free time', ['Two things I love doing and why', 'One thing I hate']), ('4. My dream', ['What I want to study in Korea', 'Thank you for listening!'])]),
  dict(t='note', title='Tips for speaking in front of people', items=['Look at the audience, not the floor.', 'Use notes with **key words only**, not full sentences.', 'Speak slowly. Pause between parts.', 'Smile! Everyone is nervous.']),
 ],
 teacher=dict(
  need='Student worksheet, board, a timer',
  aims=['Talk about hobbies with frequency and reasons', 'React naturally in conversation', 'Prepare and rehearse the 2-minute "This is me" talk'],
  steps=[
   (10, 'Hobby bingo', 'Students write 6 hobbies in a grid. You describe hobbies; they tick. First line wins.'),
   (10, 'Useful language', 'The table. Practise reactions: one student says a fact, the class reacts.'),
   (20, 'Survey', 'Exercise 2 as a mingle. Then report: "Two people love dancing."'),
   (25, 'Plan the talk', 'Exercise 3. Students write key words only on a small card.'),
   (20, 'Rehearse', 'Groups of 3: each student gives their talk; one times it, one gives one positive comment and one tip.'),
   (5, 'Tonight', 'Explain the running order for Presentation night #1 at 7:30.'),
  ],
  homework='IT lab today: Day 5 lesson. Presentation night at 7:30 pm.'
 )),

dict(S, day=7, theme='Home & rooms', title='Describe your home',
 focus='Describing a home and asking about where someone lives. Information gap activity.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['describe the type of home', 'I live in a house / an apartment / an annexe / a hostel.'], ['describe size and rooms', 'It\'s quite small. It has two bedrooms and a big kitchen.'], ['say where things are', 'The kitchen is next to the living room. My bed is under the window.'],
    ['ask', 'What\'s your home like? / How many rooms are there? / Do you have a garden?'], ['give an opinion', 'My favourite room is... because... / I don\'t like... because...']]),
  dict(t='cards', title='Information gap: find the differences', ins='Work in pairs. Student A looks at card A, Student B at card B. Don\'t show your card! Ask questions to find 6 differences.', items=[
    ('Card A: Ji-woo\'s dormitory room', ['There is one bed next to the window.', 'There is a desk between the bed and the wardrobe.', 'There are two shelves above the desk.', 'There is a small fridge under the desk.', 'There is a mirror on the door.', 'There are blue curtains.', 'There is a lamp on the desk.', 'There isn\'t a TV.']),
    ('Card B: Ji-woo\'s dormitory room', ['There are two beds next to the window.', 'There is a desk between the bed and the wardrobe.', 'There is one shelf above the desk.', 'There is a small fridge next to the door.', 'There isn\'t a mirror.', 'There are white curtains.', 'There is a lamp on the desk.', 'There is a small TV on the wardrobe.'])]),
  dict(t='write', title='Draw your dream room in Korea', ins='Draw and label it. Then describe it to a partner. Your partner draws it from your description.', n=9),
 ],
 teacher=dict(
  need='Student worksheet (cut or fold so A and B can\'t see each other\'s card), board',
  aims=['Describe a home using there is / are and prepositions', 'Ask questions to get information', 'Give clear descriptions so a partner can draw them'],
  steps=[
   (10, 'Guess my room', 'Describe your bedroom; students draw it. Compare drawings with reality.'),
   (10, 'Useful language', 'The table.'),
   (15, 'Talk about homes', 'Pairs: what\'s your home like? Use the questions. Swap partners.'),
   (25, 'Information gap', 'Exercise 2. Students ask "Is there...? How many...? Where is...?" until they find the 6 differences.'),
   (20, 'Dream room', 'Exercise 3: describe, partner draws, compare.'),
   (10, 'Feedback', 'Common errors: "There is two..." / missing "a".'),
  ],
  answers=['**The 6 differences:** 1 beds (one / two), 2 shelves (two / one), 3 fridge (under the desk / next to the door), 4 mirror (on the door / no mirror), 5 curtains (blue / white), 6 TV (no TV / a small TV on the wardrobe). The same on both cards: the desk and the lamp.'],
  homework='IT lab today: Day 7 lesson. Homework: describe your family home to someone in English on the phone (or record it).'
 )),

dict(S, day=9, theme='Food & drink', title='At the café and restaurant',
 focus='Ordering food and drinks politely, asking about food, paying.',
 student=[
  dict(t='table', title='Useful language', head=['Customer', 'Server'], rows=[
    ['Can I see the menu, please?', 'Hello! Are you ready to order?'], ['I\'d like... / Can I have..., please?', 'What would you like to drink?'], ['Is it spicy? / Does it have meat in it?', 'Anything else?'], ['No onions, please. / I\'m vegetarian.', 'For here or to take away?'], ['Could I have the bill, please?', 'That\'s 12,500 won, please.'], ['Can I pay by card?', 'Here\'s your receipt. Enjoy your meal!']]),
  dict(t='passage', title='The menu', head='Café Hanok: menu',
    text="""**Food**
Bibimbap (rice, vegetables, egg, chilli paste) ... ₩9,000
Kimchi fried rice (spicy) ... ₩8,500
Vegetable dumplings (8 pieces) ... ₩6,000
Chicken noodle soup ... ₩8,000
Toast with egg and cheese ... ₩5,000

**Drinks**
Americano ... ₩4,000     Iced latte ... ₩4,500
Green tea ... ₩3,500     Orange juice ... ₩4,000     Water ... free

**Dessert**
Bingsu (shaved ice with red beans and fruit) ... ₩7,000"""),
  dict(t='dialogue', title='Model conversation', lines=[
    ('Server', 'Hello! Are you ready to order?'), ('Customer', 'Yes. Is the kimchi fried rice very spicy?'), ('Server', 'A little. The bibimbap is less spicy.'), ('Customer', 'OK, I\'d like the bibimbap, please. Does it have meat in it?'),
    ('Server', 'No, it\'s vegetables and an egg.'), ('Customer', 'Great. And can I have an iced latte?'), ('Server', 'Sure. For here or to take away?'), ('Customer', 'For here, please.'), ('Server', 'That\'s 13,500 won.')]),
  dict(t='cards', title='Role cards', items=[
    ('Customer 1', ['You are vegetarian.', 'You have ₩15,000.', 'You want food and a drink.']), ('Customer 2', ['You don\'t like spicy food.', 'You are with a friend.', 'Order for two people. Pay by card.']),
    ('Customer 3', ['You want something sweet.', 'Ask what bingsu is.', 'Take it away.']), ('Server', ['Be polite and helpful.', 'Recommend one dish.', 'Calculate the total.'])]),
 ],
 teacher=dict(
  need='Student worksheet, board, play money (optional), table and chairs set up like a café',
  aims=['Order food and drinks politely', 'Ask about ingredients and spice', 'Handle paying and simple problems'],
  steps=[
   (10, 'Café talk', 'What do you order at a café in Sri Lanka? What is Korean café culture like? (Very popular! Cafés everywhere.)'),
   (15, 'Useful language', 'The table. Drill polite intonation: "Can I have..., please?" (rising, friendly).'),
   (10, 'Menu', 'Read the menu. Quick maths: two Americanos and dumplings? (₩14,000)'),
   (10, 'Model', 'Read the conversation in pairs.'),
   (30, 'Café role-play', 'Set up 2 or 3 "cafés". Students rotate as servers and customers with the role cards. Add a problem: the server brings the wrong drink.'),
   (15, 'Feedback', 'Praise politeness. Fix "Give me..." (sounds rude in English).'),
  ],
  answers=['**Model conversation total:** bibimbap ₩9,000 + iced latte ₩4,500 = ₩13,500'],
  homework='IT lab today: Day 9 lesson. Homework: learn 5 Korean food names and what they are in English.'
 )),

dict(S, day=11, theme='What\'s happening now?', title='Describing a picture',
 focus='Using the present continuous to describe pictures and guess what is happening. Preparing for Debate night #1.',
 student=[
  dict(t='table', title='Useful language', head=['To...', 'Say'], rows=[
    ['say what the picture shows', 'In this picture I can see... / This is a photo of...'], ['say where', 'In the foreground / in the background / on the left / on the right / in the middle'], ['describe actions', 'A woman is carrying... / Two children are running...'],
    ['guess', 'I think they\'re... / They might be... / It looks like...'], ['feelings and opinions', 'They look happy / tired. / It seems very busy.']]),
  dict(t='cards', title='Picture talk: describe these scenes', ins='Your teacher will show the pictures. Talk for 1 minute about each one.', items=[
    ('Picture 1: a busy market', ['Who can you see?', 'What are they doing?', 'What are they buying or selling?']), ('Picture 2: a Korean classroom', ['What are the students doing?', 'How do they feel?', 'Is it like your classroom?']),
    ('Picture 3: a family at the beach', ['What is happening?', 'What is the weather like?', 'What happened before? What will happen next?']), ('Picture 4: a subway station', ['How many people are there?', 'What are they doing?', 'What time of day is it?'])]),
  dict(t='note', title='Debate night #1 tonight: City life or village life?', items=['Choose your side. Write 3 reasons with examples.', 'Useful phrases: **I think... because... / For example... / I agree with... / I\'m not sure about that because... / On the other hand...**']),
  dict(t='table', title='Debate notes', head=['City life is better because...', 'Village life is better because...'], rows=[['', ''], ['', ''], ['', '']]),
 ],
 teacher=dict(
  need='Student worksheet, 4 pictures (phone, projector or printed). Search for: Pettah market, Korean classroom, family beach, Seoul subway.',
  aims=['Describe a picture for one minute using the present continuous', 'Speculate with might / I think / it looks like', 'Prepare arguments for tonight\'s debate'],
  steps=[
   (10, 'Look and say', 'Show a picture for 10 seconds, hide it. Students say what they remember.'),
   (10, 'Useful language', 'The table.'),
   (30, 'Picture talk', 'Pairs or small groups, one picture each, 1 minute each. Rotate pictures.'),
   (10, 'Model debate language', 'The note. Demonstrate agreeing and disagreeing politely.'),
   (25, 'Debate prep', 'Split the class into two teams (City / Village). Teams prepare 3 reasons and guess the other side\'s reasons.'),
   (5, 'Tonight', 'Explain the format: opening (1 min each speaker), questions, closing, vote.'),
  ],
  homework='IT lab today: Day 11 lesson. Debate night at 7:30 pm.'
 )),
]
