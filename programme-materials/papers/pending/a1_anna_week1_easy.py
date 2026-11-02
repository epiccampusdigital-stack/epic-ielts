# Anna week 1, easy version. Each step says what to DO and what to SAY, in plain words.
F = dict(folder='Activity morning', kind='Activity morning', who='English Teacher 1 (Anna)', time='9:00 to 1:00 (tea break 10:30 to 10:45, computer hour 12:00 to 1:00)')
LESSONS = [
# ============================================================ DAY 6
dict(F, day=6, theme='Activity morning 1 - Meet and greet', title='Activity morning 1: who are you?',
 focus='Students say who they are, ask classmates simple questions and introduce a partner. They talk the whole morning.',
 student=[
  dict(t='note', title='Say these sentences', items=['My name is ___. I\'m from ___. I live in ___.', 'I\'m ___ years old. I like ___.', 'Can you repeat that, please? How do you spell that?']),
  dict(t='table', title='Task 1: Find someone who...', ins='Walk round the room. Ask a classmate: "Do you have a brother or sister?" If the answer is yes, write the name. Then ask someone else.', head=['Find someone who...', 'Name'], rows=[
   ['has a brother or sister', ''], ['can cook', ''], ['wants to study IT', '']]),
  dict(t='write', title='Task 2: Introduce your partner', ins='Ask your partner 4 questions. Then write 3 sentences about them. Example: This is Nimal. He is from Matara. He likes cricket.', n=2),
  dict(t='table', title='Task 3: Two truths and a lie', ins='Write 3 sentences about you. Two are true. One is a lie. Read them to your group. They guess the lie.', head=['My sentence', 'Truth or lie?'], rows=[['', ''], ['', '']]),
  dict(t='note', title='Computer hour (12:00 to 1:00)', items=['Log in. Click **Learn**. Open **Week 1: Me and my world**. Do Day 1, Day 2 and Day 3.']),
 ],
 teacher=dict(need='This sheet, a soft ball (or a rolled paper), the board, a timer (phone).', aims=['Students introduce themselves in full sentences', 'Students ask and answer simple questions', 'Students introduce a partner'],
  steps=[
   (15, '1. Name ball', '**Do:** Students stand in a circle. Throw the ball to one student.\n**Say:** "Say your name and one thing you like. Then throw the ball to someone."\n**Example:** "I\'m Anna. I like music." The next student says "This is Anna. She likes music. I\'m Nimal. I like cricket." Play two rounds.'),
   (15, '2. Teach the sentences', '**Do:** Point at the box on the student sheet. Read each sentence slowly. Students repeat.\n**Say:** "Repeat after me: My name is... I\'m from... I live in..."\n**Then:** Spelling race. Say a name. Pairs write it. The first pair to spell it correctly gets a point.'),
   (35, '3. Find someone who', '**Do:** Students walk round with Task 1. They can only speak English.\n**Say:** "Stand up. Ask: Do you have a brother or sister? If yes, write their name. Then find someone new. You have 15 minutes."\n**After:** Ask the class: "Who can cook?" Students answer in a sentence: "Amaya can cook."'),
   (15, 'Tea break', ''),
   (40, '4. Partner interview', '**Do:** Make pairs. Each pair has 5 minutes each way.\n**Say:** "Ask your partner: What\'s your name? Where are you from? What do you like? Write the answers. Then write 4 sentences about your partner."\n**Then:** Each student introduces their partner to a group of four: "This is Nimal. He is from Matara." Pick 3 volunteers to do it for the whole class.'),
   (35, '5. Two truths and a lie', '**Do:** Students write Task 3.\n**Say:** "Write 3 sentences about you. Two are true. One is a lie. Read them to your group. Your group says which one is the lie."\n**Score:** One point for each correct guess.'),
   (25, '6. Quick quiz', '**Do:** Two teams. Ask questions about the morning.\n**Say:** "Who can cook? Who likes cricket? Where is Nimal from?" Team with the most points wins. Sir sits in and helps pairs. He does not teach.'),
   (60, '7. Computer hour: Learn lessons', '**Do:** Take everyone to the IT lab. Students sit at a computer each.\n**Say:** "Log in with your own username and password. Click Learn. Open Week 1: Me and my world. Do Day 1 Hello, Day 2 Personal information and Day 3 Family. Read each lesson, then answer the questions. You have 45 minutes."\n**While they work:** Walk round. Help with log in. Do not give answers.\n**At the end (last 10 min):** "Finish the lesson you are on. Close the page. Tell your partner one new sentence you learned."')],
  answers=['Students\' own answers. Check they speak in full sentences and use the sentences in the box.'],
  tips=['Students talk about 70 percent of the time. You talk about 30 percent.', 'Do not correct a student while they are speaking. Remember 3 or 4 mistakes and write them on the board at the end.', 'Shy students: let them introduce a partner first. It is easier than talking about themselves.'], homework='Learn your three favourite sentences from the box.')),

# ============================================================ DAY 7
dict(F, day=7, theme='Activity morning 2 - Home and town', title='Activity morning 2: my home and my town',
 focus='Students learn to say where things are and to ask for directions. They draw, walk around and talk.',
 student=[
  dict(t='note', title='Say these sentences', items=['There is a ___. There are two ___.', 'It\'s next to / opposite / behind / between ___.', 'Excuse me, where\'s the ___? Go straight. Turn left / right.']),
  dict(t='html', title='Task 1: Town map', ins='__MAPINS__', html='__MAP__'),
  dict(t='list', title='Task 2: Campus walk', items=['Find the nearest shop. Write: It is ___.', 'Find something red. Write: There is a ___ on / in / behind ___.']),
  dict(t='note', title='Computer hour (12:00 to 1:00)', items=['Log in. Click **Practice**. Open **Course paper 1: Writing, my home and my town** (40 minutes). Submit one time only. Then Learn, Week 1, Day 4.']),
 ],
 teacher=dict(need='This sheet, plain paper and pencils, the board.', aims=['Students say where things are', 'Students ask and give simple directions'],
  steps=[
   (15, '1. Stand up game', '**Do:** Everyone stands. You give instructions. Students move.\n**Say:** "Stand next to the door. Stand between two people. Stand behind a chair. Stand opposite your partner."\n**Then:** Students give instructions to each other.'),
   (15, '2. Teach the sentences', '**Do:** Point to real things in the room.\n**Say:** "There is a clock. The clock is next to the door. There are two windows. The board is opposite the door." Students repeat, then say 5 sentences about the room.'),
   (35, '3. Describe and draw', '**Do:** Pairs. Student A looks at their own room in their head and tells B. B draws.\n**Say:** "A: Describe your room. Say: There is a bed. It\'s next to the window. B: Draw what you hear. Do not look at A\'s face. Then swap." Compare the drawings.'),
   (15, 'Tea break', ''),
   (40, '4. Town map', '**Do:** Make pairs. In each pair, one student gets map A and one gets map B (page 2 of the student copy has both). They sit back to back.\n**Say:** "Your map has some empty boxes with a question mark. Your partner knows the names. Ask: Where\'s the hospital? Your partner answers: It\'s opposite the cafe. Write the name in the correct box. Take turns. Do not look at your partner\'s map. When you finish, compare maps."\n**Check:** Show the answer map (teacher page).'),
   (35, '5. Campus walk', '**Do:** Teams of 3 walk round the campus with Task 2.\n**Say:** "Find the nearest shop and something red. Write the answers. Then come back and tell us about one place."'),
   (25, '6. Quick quiz', '**Do:** Say a sentence with a mistake. Teams fix it.\n**Say:** "There is two chairs." (There are two chairs.) "The bank is on the post office." (next to). Students say 3 sentences about their room to a partner. Sir sits in and helps.'),
   (60, '7. Computer hour: writing paper', '**Do:** Take everyone to the IT lab.\n**Say:** "Log in. Click Practice. Find Course paper 1, Writing: my home and my town. Click it and read the instructions. You have 40 minutes. Write about your home and your town. When you finish, click Submit one time only."\n**Then (last 20 min):** "Now click Learn, open Week 1, and do Day 4 Daily routine."\n**While they work:** Walk round. Do not help with the words. Do not let anyone submit twice.')],
  answers=['**Town map (see answer map):** North side of Main Road, left to right: Bank, Post office, Cafe. South side: Bus stop (opposite the bank), Park (opposite the post office), Hospital (opposite the cafe). The school is behind the hospital.'],
  tips=['Sir teaches prepositions on Day 10. Today only practise with the sentences in the box.', 'Fast pairs: draw a map of their own village and describe it.'], homework='Draw your house or village and write 5 sentences about it.')),

# ============================================================ DAY 9
dict(F, day=9, theme='Activity morning 3 - Food and shopping', title='Activity morning 3: cafe, market and menu',
 focus='Students order food, ask about prices and design a small menu. Role plays all morning.',
 student=[
  dict(t='note', title='Say these sentences', items=['Can I have a ___, please? / I\'d like ___.', 'How much is this? It\'s Rs. ___.', 'Anything else? That\'s Rs. ___.']),
  dict(t='dialogue', title='Task 1: At the cafe (read it, then act it)', lines=[('Waiter', 'Hi! What would you like?'), ('Customer', 'Can I have a rice and curry, please?'), ('Waiter', 'Anything to drink?'), ('Customer', 'A tea. How much is that?'), ('Waiter', 'That\'s Rs. 550.')]),
  dict(t='table', title='Menu (use it for the role play)', head=['Item', 'Price (Rs.)'], rows=[['Rice and curry', '450'], ['Kottu', '600'], ['Tea', '100']]),
  dict(t='table', title='Task 3: Your team\'s cafe', ins='Your team opens a cafe. Write 3 foods or drinks and the prices. Then tell the class about your cafe (1 minute).', head=['Item', 'Price (Rs.)'], rows=[['', ''], ['', ''], ['', '']]),
  dict(t='note', title='Computer hour (12:00 to 1:00)', items=['Log in. Click **Practice**. Open **Course paper 1: Reading, home, town and food** (30 minutes). Then the **Week 1 Quiz** (20 minutes).']),
 ],
 teacher=dict(need='This sheet, play money or paper notes (optional), the board.', aims=['Students order politely', 'Students ask about prices', 'Students give a short talk'],
  steps=[
   (20, '1. Food bingo', '**Do:** Students draw a 3 by 3 grid and write 9 foods in it.\n**Say:** "Listen. When you hear a food in your grid, cross it out. First to get a line shouts: Bingo!" Call foods: rice, tea, kottu, fried rice, egg, banana...'),
   (15, '2. Teach the sentences', '**Do:** Read the sentences in the box. Students repeat.\n**Say:** "Can I have a tea, please? How much is this? It\'s Rs. 100." Then practise numbers: say "four fifty", students write 450.'),
   (30, '3. Cafe role play', '**Do:** Pairs. One is the waiter. One is the customer.\n**Say:** "Read the dialogue. Then change the food and the price. Use the menu. Then swap roles." Pick two pairs to act it for the class.'),
   (15, 'Tea break', ''),
   (40, '4. Market role play', '**Do:** Half the class are shopkeepers. Half are shoppers.\n**Say:** "Shoppers: you have Rs. 1,000. You need rice, eggs and tomatoes. Ask: How much is this? Shopkeepers: say the price. Say: Anything else? Then swap. Who has the most money left?"\n**Prices:** rice Rs. 250 a kilo, eggs Rs. 50 each, tomatoes Rs. 120 a kilo.'),
   (35, '5. Team cafe', '**Do:** Teams of 4 design a cafe with 4 items (Task 3).\n**Say:** "Write 4 foods and prices. Decide the name of your cafe. Tell the class in 1 minute: Welcome to our cafe. We have ... " The class votes for the best cafe.'),
   (25, '6. Quick quiz', '**Do:** Say prices aloud. Teams write the number.\n**Say:** "Six hundred and fifty. Seventy-five. One thousand two hundred." Then give a prize or a round of applause. Sir sits in and helps.'),
   (60, '7. Computer hour: reading paper and quiz', '**Do:** Take everyone to the IT lab.\n**Say:** "Log in. Click Practice. Find Course paper 1, Reading: home, town and food. You have 30 minutes. Read the text, then answer the questions. Click Submit one time only."\n**Then (next 20 min):** "Now open the Week 1 Quiz: Me and my world. Answer all the questions and submit."\n**Last 10 min:** Tell students to open Results to see their score.')],
  answers=['Role plays and menus are the students\' own work. Listen for: Can I have, I\'d like, How much is.'],
  tips=['Do not stop to explain "a, an, some". The students only use them in the sentences in the box.', 'Shy students: let them be the shopkeeper. They have a script.'], homework='Write a short cafe dialogue between a customer and a waiter.')),
]
