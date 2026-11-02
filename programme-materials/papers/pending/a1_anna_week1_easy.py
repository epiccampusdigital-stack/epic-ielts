# Anna week 1: everything is done seated. Short steps. Each step says what to DO and what to SAY.
F = dict(folder='Activity morning', kind='Activity morning', who='English Teacher 1 (Anna)', time='9:00 to 1:00 (tea break 10:30 to 10:45, computer hour 12:00 to 1:00)')
COMP6 = "Log in. Click **Learn**. Open **Week 1: Me and my world**. Do Day 1, Day 2 and Day 3."
COMP7 = "Log in. Click **Practice**. Open **Course paper 1: Writing, my home and my town** (40 minutes). Submit one time only. Then Learn, Week 1, Day 4."
COMP9 = "Log in. Click **Practice**. Open **Course paper 1: Reading, home, town and food** (30 minutes). Then the **Week 1 Quiz** (20 minutes)."
LESSONS = [
# ============================================================ DAY 6
dict(F, day=6, theme='Activity morning 1 - Meet and greet', title='Activity morning 1: who are you?',
 focus='Students say who they are, interview the person next to them and introduce them. All seated.',
 student=[
  dict(t='note', title='Say these sentences', items=['My name is ___. I\'m from ___. I live in ___.', 'I\'m ___ years old. I like ___.', 'Can you repeat that, please? How do you spell that?']),
  dict(t='table', title='Task 1: Interview your partner', ins='Ask your partner each question. Write the answer.', head=['Question', 'My partner\'s answer'], rows=[
   ['What is your name?', ''], ['Where are you from?', ''], ['What do you like?', ''], ['Why do you want to study in Korea?', '']]),
  dict(t='write', title='Task 2: Introduce your partner', ins='Write 3 sentences. Example: This is Nimal. He is from Matara. He likes cricket.', n=3),
  dict(t='table', title='Task 3: Two truths and a lie', ins='Write 3 sentences about you: two true, one lie. Your group guesses the lie.', head=['My sentence', 'True or lie?'], rows=[['', ''], ['', '']]),
  dict(t='note', title='Computer hour (12:00 to 1:00)', items=[COMP6]),
 ],
 teacher=dict(need='This sheet. Nothing else. Everyone stays seated.', aims=['Students introduce themselves and a partner'],
  steps=[
   (10, '1. Say your name', '**Say:** "Each student says: My name is ___. I like ___." Go round the room. The next student says the same, then adds: This is ___, she likes ___."'),
   (15, '2. The sentences', '**Do:** Read the box on the sheet, one line at a time. **Say:** "Repeat after me." Students repeat each line twice.'),
   (35, '3. Interview', '**Do:** Students sit in pairs. **Say:** "Ask your partner the 5 questions in Task 1. Write the answers. Then swap." Walk round and listen.'),
   (15, 'Tea break', ''),
   (40, '4. Introduce your partner', '**Do:** Students write Task 2 (3 sentences). **Say:** "Now read it to a group of 4: This is Nimal. He is from Matara." Pick 3 students to read to the whole class.'),
   (30, '5. Two truths and a lie', '**Do:** Groups of 4 at the same table. **Say:** "Write 3 sentences about you. Two true, one lie. Read them. Your group says which is the lie." One point for each correct guess.'),
   (35, '6. Quick quiz', '**Say:** "Who is from Matara? Who likes cricket? Where is Nimal from?" Two teams, one point per answer. Sir sits in and helps.'),
   (60, '7. Computer hour', '**Do:** Go to the IT lab. **Say:** "Log in. Click Learn. Open Week 1: Me and my world. Do Day 1, 2 and 3." Do not give answers.')],
  answers=['Students\' own answers.'],
  tips=['Students talk, you listen. Do not correct while they speak. Write 3 or 4 mistakes on the board at the end.'], homework='')) ,

# ============================================================ DAY 7
dict(F, day=7, theme='Activity morning 2 - Home and town', title='Activity morning 2: my home and my town',
 focus='Students say where things are, complete a town map with a partner and describe their own street. All seated.',
 student=[
  dict(t='note', title='Say these sentences', items=['There is a ___. There are two ___.', 'It\'s next to / opposite / behind / between ___.', 'Excuse me, where\'s the ___? Go straight. Turn left / right.']),
  dict(t='html', title='Task 1: Town map', ins='__MAPINS__', html='__MAP__'),
  dict(t='html', title='Task 2: My street', ins='Draw your street or village. Draw 4 places. Then tell your partner where they are.', html='<div style="border:1.5px solid #9aa7bd;border-radius:3mm;height:22mm"></div>'),
  dict(t='note', title='Computer hour (12:00 to 1:00)', items=[COMP7]),
 ],
 teacher=dict(need='This sheet (A and B pages), pencils. Everyone stays seated.', aims=['Students say where things are'],
  steps=[
   (15, '1. Point and say', '**Do:** Point to things in the room. **Say:** "What can you see? There is a clock. The clock is next to the door." Students say 5 sentences.'),
   (15, '2. The sentences', '**Do:** Read the box on the sheet. **Say:** "Repeat after me." Students repeat each line twice.'),
   (35, '3. Describe and draw', '**Do:** Pairs. **Say:** "Student A: tell your partner about your room. There is a bed. It\'s next to the window. Student B: draw what you hear on paper. Then swap." Compare.'),
   (15, 'Tea break', ''),
   (40, '4. Town map', '**Do:** Each pair gets map A and map B (page 2 of the student copy). They sit back to back. **Say:** "Your map has empty boxes with ?. Your partner knows the names. Ask: Where\'s the hospital? Your partner says: It\'s opposite the cafe. Write the name in the box. Do not look at your partner\'s map." **Check:** show the answer map (next page).'),
   (35, '5. My street', '**Do:** Students draw their street (Task 2) and describe it to a partner. **Say:** "Draw 4 places. Tell your partner: There is a shop next to my house."'),
   (40, '6. Quick quiz', '**Say:** "Where\'s the bank? Where\'s the bus stop?" (use the answer map). Then fix mistakes: "There is two chairs." Sir sits in and helps.'),
   (60, '7. Computer hour', '**Do:** Go to the IT lab. **Say:** "Log in. Click Practice. Open Course paper 1: Writing. 40 minutes. Submit one time only. Then Learn, Week 1, Day 4." Do not help with words.')],
  answers=['**Town map (see answer map):** North side of Main Road, left to right: Bank, Post office, Cafe. South side: Bus stop (opposite the bank), Park (opposite the post office), Hospital (opposite the cafe). The school is behind the hospital.'],
  tips=['Sir teaches prepositions on Day 10. Today only use the sentences in the box.'], homework='')) ,

# ============================================================ DAY 9
dict(F, day=9, theme='Activity morning 3 - Food and shopping', title='Activity morning 3: cafe, market and menu',
 focus='Students order food, ask about prices and design a small menu. Role plays at the desks.',
 student=[
  dict(t='note', title='Say these sentences', items=['Can I have a ___, please? / I\'d like ___.', 'How much is this? It\'s Rs. ___.', 'Anything else? That\'s Rs. ___.']),
  dict(t='dialogue', title='Task 1: At the cafe (read it, then act it)', lines=[('Waiter', 'Hi! What would you like?'), ('Customer', 'Can I have a rice and curry, please?'), ('Waiter', 'Anything to drink?'), ('Customer', 'A tea. How much is that?'), ('Waiter', 'That\'s Rs. 550.')]),
  dict(t='table', title='Menu', head=['Item', 'Price (Rs.)'], rows=[['Rice and curry', '450'], ['Kottu', '600'], ['Tea', '100']]),
  dict(t='table', title='Task 3: Your team\'s cafe', ins='Your team opens a cafe. Write 3 foods or drinks and the prices. Then tell the class about your cafe (1 minute).', head=['Item', 'Price (Rs.)'], rows=[['', ''], ['', ''], ['', '']]),
  dict(t='note', title='Computer hour (12:00 to 1:00)', items=[COMP9]),
 ],
 teacher=dict(need='This sheet and the market cards page. Everyone stays seated.', aims=['Students order food and ask about prices'],
  steps=[
   (20, '1. Food bingo', '**Do:** Students draw a 3 by 3 grid and write 9 foods. **Say:** "When you hear a food, cross it out. First line shouts Bingo." Call foods: rice, tea, kottu, egg, banana...'),
   (15, '2. The sentences', '**Do:** Read the box. **Say:** "Repeat after me: Can I have a tea, please? How much is this?" Say a price (four fifty), students write 450.'),
   (30, '3. Cafe role play', '**Do:** Pairs. **Say:** "One is the waiter, one is the customer. Read the dialogue. Then change the food. Use the menu. Then swap."'),
   (15, 'Tea break', ''),
   (40, '4. Market role play', '**Do:** Give half the class a Shopper card and half a Shopkeeper card (market cards page). Pairs sit facing each other. **Say:** "Shopper: ask the price and buy. Shopkeeper: say the price. Then swap cards."'),
   (35, '5. Team cafe', '**Do:** Groups of 4 at the same table. **Say:** "Write 3 foods and prices. Choose a name. Tell the class: Welcome to our cafe." Class votes.'),
   (25, '6. Quick quiz', '**Say:** "Six hundred and fifty. Seventy-five." Students write the number. Sir sits in and helps.'),
   (60, '7. Computer hour', '**Do:** Go to the IT lab. **Say:** "Log in. Click Practice. Open Course paper 1: Reading. 30 minutes. Submit one time only. Then the Week 1 Quiz."')],
  answers=['Students\' own work.'],
  tips=['Do not stop to explain "a, an, some". Use only the sentences in the box.'], homework='')) ,
]
