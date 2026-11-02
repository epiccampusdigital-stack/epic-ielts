# Anna's first three mornings (Days 6, 7, 9): activity mornings. About 20 minutes of explaining,
# the rest is games, pair work and speaking. Only uses what students already met in Foundation 1 (Day 4),
# so every key sentence is given on the page as a frame.
F = dict(folder='Activity morning', kind='Activity morning', who='English Teacher 1 (Anna)', time='9:00 to 12:00 (tea break 10:30 to 10:45)')

LESSONS = [
# ---------------------------------------------------------------- Day 6
dict(F, day=6, theme='Activity morning 1 - Meet and greet', title='Activity morning 1: who are you?',
 focus='Introduce yourself, find out about classmates and introduce a partner to the room. All speaking, no grammar lecture.',
 student=[
  dict(t='note', title='Your sentence frames (use these all morning)', items=[
   'My name is ___. I\'m from ___. I live in ___.', 'I\'m ___ years old. I like ___. I don\'t like ___.',
   'In my free time I ___.', 'I want to study ___ in Korea because ___.', 'Can you repeat that, please? How do you spell that?']),
  dict(t='table', title='Find someone who...', ins='Walk round and ask: "Do you ___?" or "Can you ___?" Write the name. Ask one more question about each answer.', head=['Find someone who...', 'Name', 'One more fact'], rows=[
   ['has a brother or sister', '', ''], ['likes cricket', '', ''], ['can cook', '', ''], ['wants to study engineering or IT', '', ''],
   ['gets up before six', '', ''], ['has been on a plane', '', ''], ['likes K-pop or K-drama', '', ''], ['speaks three languages', '', '']]),
  dict(t='cards', title='Interview card', items=[
   ('Ask your partner', ['What\'s your name? How do you spell it?', 'Where are you from? Where do you live now?', 'What do you do in your free time?', 'What are you good at?', 'Why do you want to study in Korea?', 'What\'s one thing people don\'t know about you?'])]),
  dict(t='write', title='Introduce your partner', ins='Write 5 sentences. Example: This is Nimal. He is from Matara. He likes cricket and he can cook. He wants to study IT in Seoul.', n=5),
  dict(t='table', title='Two truths and a lie', ins='Write two true sentences and one lie about you. Your group guesses which one is the lie.', head=['My sentence', 'Truth or lie?'], rows=[['', ''], ['', ''], ['', '']]),
  dict(t='lines', title='Exit ticket', items=['One new thing I learned about a classmate:', 'One sentence I want to say better:']),
 ],
 teacher=dict(
  need='Student worksheet, a soft ball, board, a timer (phone), 8 small prizes or stickers (optional)',
  aims=['Introduce yourself with a full set of sentences', 'Ask and answer simple questions fluently', 'Introduce another person to a group'],
  steps=[
   (15, 'Name ball', 'Students stand in a circle. Throw the ball: say your name and one thing you like. The catcher repeats: "This is Nimal, he likes cricket" and throws again. 2 rounds.'),
   (15, 'Frames and spelling', 'Teach the frames in the box (no long explanation). Quick spelling race: say a name, pairs write the spelling, check on the board.'),
   (35, 'Find someone who', 'Students walk round with the table. Rule: speak English only, one fact per person. Finish with the report: "Amaya can cook."'),
   (15, 'Tea break', ''),
   (40, 'Interview + introduce', 'Pairs interview each other with the card (5 min each). Each student introduces their partner to a group of four, then 3 volunteers to the whole class.'),
   (35, 'Two truths and a lie', 'Students write three sentences. Groups guess the lie. Count points. Anna notes the sentences that need work, without correcting during the game.'),
   (25, 'Quiz and exit ticket', 'Quick team quiz on the names and facts from today ("Who can cook?"). Then the exit ticket. Sir sits in and helps pairs; no teaching.'),
  ],
  answers=['Answers will vary. Check that each student uses full sentences and the frames.'],
  tips=['Aim for 70 percent student talk. Do not correct mistakes while students speak; note them and give 3 to 4 on the board at the end.', 'Quiet students: let them introduce a partner rather than themselves first.'],
  homework='Learn your three favourite sentences from the frames. Tomorrow we use them again.')),

# ---------------------------------------------------------------- Day 7
dict(F, day=7, theme='Activity morning 2 - Home and town', title='Activity morning 2: my home and my town',
 focus='Describe where things are, give directions and describe your room. Learn by drawing, walking and asking.',
 student=[
  dict(t='note', title='Your sentence frames', items=[
   'There is a ___. There are two ___. There isn\'t a ___.', 'It\'s next to / opposite / behind / in front of / between ___ and ___.',
   'Excuse me, where\'s the ___? Go straight. Turn left / right. It\'s on the left / right.', 'My room has a ___, a ___ and a ___.']),
  dict(t='table', title='Describe and draw (partner A reads, partner B draws)', ins='Partner A reads the sentences below slowly. Partner B draws a quick sketch on paper. Then swap roles and use your own room.', head=['Partner A reads', 'Done'], rows=[
   ['There is a table in the middle of the room.', ''], ['There is a lamp on the table.', ''], ['There are two chairs next to the table.', ''],
   ['There is a window behind the table.', ''], ['There is a cat under the chair.', '']]),
  dict(t='table', title='Town map: Student A (you know these places)', ins='Ask your partner where the other places are. Use the sentences "Where\'s the ___?" and write the answer.', head=['Place', 'Where is it?'], rows=[
   ['bank', 'next to the post office'], ['hospital', ''], ['bus stop', 'opposite the bank'], ['cafe', ''], ['school', 'behind the hospital']]),
  dict(t='table', title='Town map: Student B (you know these places)', ins='Ask your partner where the other places are. Use the sentences "Where\'s the ___?" and write the answer.', head=['Place', 'Where is it?'], rows=[
   ['post office', 'between the bank and the cafe'], ['hospital', 'in front of the school'], ['bus stop', ''], ['cafe', 'next to the post office'], ['school', '']]),
  dict(t='list', title='Campus walk: missions', items=[
   'Find the nearest shop. Write: It is ___.', 'Find the clock. Write: It is next to / above ___.', 'Count the doors in the corridor. Write: There are ___ doors.',
   'Find something red. Write: There is a ___ on / in / behind ___.', 'Take a photo of a place on campus and describe it to the class.']),
  dict(t='write', title='My room', ins='Write 6 sentences about your room at home or here. Use there is / there are and prepositions.', n=6),
  dict(t='mcq', title='Quick quiz', items=[
   ('The bank is ___ the post office. They are side by side.', ['next to', 'on', 'at']),
   ('There ___ two chairs in the room.', ['is', 'are', 'am']),
   ('The cat is ___ the chair. You can\'t see it from above.', ['under', 'on', 'between']),
   ("___ the hospital? Go straight and turn left.", ["Where's", 'What', 'Who'])]),
 ],
 teacher=dict(
  need='Student worksheet, plain paper and pencils, board, phones for the photo mission',
  aims=['Say where things are with there is / there are and prepositions', 'Ask for and give simple directions', 'Describe a room'],
  steps=[
   (15, 'Warm-up: stand up', 'Call out sentences: "Stand next to the door." "Stand between two people." "Stand behind a chair." Students move. Then students give instructions to each other.'),
   (15, 'Frames', 'Teach the box using real objects in the classroom, no long talk. Students point and say five sentences about the room.'),
   (35, 'Describe and draw', 'Pairs do the activity twice: with the page, then with their own room. Compare drawings with the original.'),
   (15, 'Tea break', ''),
   (40, 'Town map info gap', 'Students A and B sit back to back and do the map task. Then they draw the whole town from their notes and compare. Anna walks round and listens.'),
   (35, 'Campus walk', 'Teams do the missions, taking photos. Each team presents one place using the frames.'),
   (25, 'Quiz and write', 'Quick quiz in teams, then students write 6 sentences about their room. Sir sits in and helps with spelling.'),
  ],
  answers=['**Quick quiz:** 1 next to, 2 are, 3 under, 4 Where\'s.', 'Maps: Student A and B together know every place: hospital is in front of the school, bus stop is opposite the bank, cafe is next to the post office, school is behind the hospital.'],
  tips=['Prepositions are taught formally by Sir on Day 10. Today is practice, so keep the language to the frames.', 'If a pair finishes early, they make a new map of their own village.'],
  homework='Draw your house or village and write 8 sentences about it.')),

# ---------------------------------------------------------------- Day 9
dict(F, day=9, theme='Activity morning 3 - Food and shopping', title='Activity morning 3: cafe, market and menu',
 focus='Order food, ask for prices, shop at a market and design a menu. Real situations, real talking.',
 student=[
  dict(t='note', title='Your sentence frames', items=[
   'Can I have a ___, please? / I\'d like ___. / Anything else? / That\'s Rs. ___.', 'How much is this? How much are these? It\'s Rs. ___. They\'re Rs. ___.',
   'Do you have any ___? We don\'t have any ___. I\'ll take two, please.', 'a / an for one things (an apple, a banana). some / any for more than one.']),
  dict(t='dialogue', title='At the cafe', lines=[
   ('Waiter', 'Hi! What would you like?'), ('Customer', 'Can I have a rice and curry, please?'), ('Waiter', 'Anything to drink?'),
   ('Customer', 'A tea with milk. How much is that?'), ('Waiter', 'That\'s Rs. 650.'), ('Customer', 'Here you are. Thank you!')]),
  dict(t='table', title='Menu: Student A is the waiter', ins='Student B orders. Write the order and the total.', head=['Item', 'Price (Rs.)'], rows=[
   ['Rice and curry', '450'], ['Fried rice', '550'], ['Kottu', '600'], ['Tea', '100'], ['Fresh juice', '250'], ['Ice cream', '200']]),
  dict(t='cards', title='Market role play', items=[
   ('Shopper card', ['You have Rs. 1,000.', 'You need: rice, eggs, tomatoes, bananas.', 'Ask for prices. Try to get a good price.']),
   ('Shopkeeper card', ['Rice Rs. 250 a kilo, eggs Rs. 50 each,', 'tomatoes Rs. 120 a kilo, bananas Rs. 20 each.', 'Be friendly. Ask: Anything else?'])]),
  dict(t='table', title='Team menu challenge', ins='Your team opens a Korean and Sri Lankan fusion cafe. Create 6 items with prices. Then present your cafe to the class in 1 minute.', head=['Item', 'Price (Rs.)', 'A, an or some?'], rows=[['', '', ''], ['', '', ''], ['', '', ''], ['', '', ''], ['', '', ''], ['', '', '']]),
  dict(t='write', title='Write the price', ins='Write the price in words. Example: Rs. 450 = four hundred and fifty rupees. Do: Rs. 650, Rs. 1,200, Rs. 75.', n=3),
 ],
 teacher=dict(
  need='Student worksheet, play money (paper notes), fruit or food pictures, a stopwatch, prizes (optional)',
  aims=['Order food and drinks politely', 'Ask about prices and understand numbers', 'Present a short idea to the class'],
  steps=[
   (20, 'Warm-up: food bingo', 'Students draw a 3 by 3 grid and write 9 foods. Teacher calls foods; first to complete a line shouts "Bingo". Say the foods in sentences: "I like fried rice".'),
   (15, 'Frames + numbers', 'Teach the frames quickly. Drill prices: teacher says a number, students write it. Pairs read the cafe dialogue twice.'),
   (30, 'Cafe role play', 'Pairs act the waiter and customer with the menu, then swap and change the order. Choose two pairs to act it for the class.'),
   (15, 'Tea break', ''),
   (40, 'Market role play', 'Half the class are shopkeepers with price lists, half are shoppers with Rs. 1,000. Shoppers buy everything on the list. Swap roles. Who has the most money left?'),
   (35, 'Team menu challenge', 'Teams design a menu and a short pitch. Each team presents for one minute. The class votes for the best cafe.'),
   (25, 'Write and wrap', 'Students write the three prices in words, then a quick team quiz. Sir sits in and helps teams with spelling.'),
  ],
  answers=['**Write the price:** six hundred and fifty rupees; one thousand two hundred rupees; seventy-five rupees.', 'Role plays and menus: students\' own work. Listen for polite frames: Can I have, I\'d like, How much is.'],
  tips=['Some / any and a / an are only used as frames today. Do not stop to explain countable and uncountable nouns.', 'Quiet students can be the shopkeeper, who has a script.'],
  homework='Write a short dialogue between a customer and a waiter in a cafe in Korea.')),
]
