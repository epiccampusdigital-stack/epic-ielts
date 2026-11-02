# Anna week 1 v2: short self-intro on day 1, then system papers (CBT), then a seated group activity "Fix the mistake".
F = dict(folder='Activity morning', kind='Computer papers and group activity', who='English Teacher 1 (Anna)', time='9:00 to 1:00 (tea break 10:30 to 10:45)')
def fixsheet(title, ins, items):
    return dict(t='gap', title=title, ins=ins, items=items)
LESSONS = [
# ============================================================ DAY 6
dict(F, day=6, theme='Anna 1 - Meet Anna, reading and writing papers', title='Morning 1: meet Anna, reading and writing papers',
 focus='A short hello to Anna, then the first two papers on the computer, then a group activity: Fix the mistake.',
 student=[
  dict(t='note', title='Introduce yourself (say these)', items=['My name is ___. I\'m from ___. I live in ___.', 'I like ___. I want to study ___ in Korea.']),
  dict(t='list', title='Computer papers (log in, then follow the steps)', items=['Paper 1: Click **Practice**. Open **Course paper 1: Reading, home, town and food** (30 minutes).', 'Paper 2: Open **Course paper 1: Writing, my home and my town** (40 minutes).', 'Click **Submit one time only** at the end of each paper.', 'If you finish early: click **Learn**, open **Week 1: Me and my world**, do Day 1.']),
  fixsheet('Group activity: Fix the mistake (parts of speech)', 'Work in your group. Each sentence has one mistake. Write the correct sentence. One sentence is already correct: write OK.', [
   'She sings beautiful. ___', 'I have a car red. ___', 'The students is happy. ___', 'He speak English very good. ___', 'They live on Galle. ___', 'My sister works in a hospital. ___', 'We study English in every day. ___', 'He drives very careful. ___']),
 ],
 teacher=dict(need='This sheet. The IT lab. Everyone stays seated (at a computer or at a desk).', aims=['Students meet you and say a few sentences about themselves', 'Students do two papers on the computer'],
  steps=[
   (15, '1. Say hello', '**Say:** "Hello, I am Anna. I will teach you on Wednesday, Thursday and Saturday. Tell me about you. Say: My name is ___. I am from ___. I like ___." Each student says it, one by one, seated.'),
   (45, '2. Reading paper', '**Do:** Go to the IT lab. **Say:** "Log in with your own name and password. Click Practice. Open Course paper 1: Reading, home, town and food. 30 minutes. Read the text, answer the questions, click Submit one time only." Do not give answers.'),
   (15, 'Tea break', ''),
   (50, '3. Writing paper', '**Say:** "Open Course paper 1: Writing, my home and my town. 40 minutes. Write about your home and your town. Click Submit one time only." Do not help with words.'),
   (60, '4. Group activity: Fix the mistake', '**Do:** Back in the classroom. Groups of 4 at one table. **Say:** "Look at the sheet. Each sentence has one mistake. Talk together. Write the correct sentence." After 20 minutes read the answers (see below). Each group checks its own and counts the correct ones. The group with the most wins.'),
   (30, '5. Make your own', '**Say:** "Now write 4 sentences with one mistake each. Give them to another group. They fix them." Walk round.'),
   (25, '6. Learn lessons', '**Say:** "Go back to the computer. Click Learn. Open Week 1: Me and my world. Do Day 1." Help with log in. Do not give answers.')],
  answers=['**Fix the mistake:** 1 She sings beautifully. 2 I have a red car. 3 The students are happy. 4 He speaks English very well. 5 They live in Galle. 6 OK. 7 We study English every day. 8 He drives very carefully.'],
  tips=[], homework='')),

# ============================================================ DAY 7
dict(F, day=7, theme='Anna 2 - Listening paper and group activity', title='Morning 2: listening paper and group activity',
 focus='One listening paper on the computer, a group activity on parts of speech, and Learn lessons.',
 student=[
  dict(t='list', title='Computer papers (log in, then follow the steps)', items=['Paper 1: Click **Practice**. Open **Listening practice 1**. Use headphones. You hear the audio one time only.', 'Write your answers on the screen. Click **Submit one time only**.', 'Then: click **Learn**, open **Week 1: Me and my world**, do Day 4 and Day 5.']),
  fixsheet('Group activity: Fix the mistake (nouns, pronouns, adverbs)', 'Work in your group. Each sentence has one mistake. Write the correct sentence. One sentence is already correct: write OK.', [
   'I have two child. ___', 'She drinks a water every morning. ___', 'Him is my friend. ___', 'They are always late. ___', 'I always am happy. ___', 'We need an information. ___', 'My sister she is a nurse. ___', 'There are three bus. ___']),
 ],
 teacher=dict(need='This sheet. The IT lab with headphones. Everyone stays seated.', aims=['Students do a listening paper on the computer', 'Students fix mistakes in groups'],
  steps=[
   (10, '1. Warm-up', '**Say:** "Last time we did a reading and a writing paper. Today you do a listening paper. Put on your headphones." Check the sound works for everyone.'),
   (60, '2. Listening paper', '**Say:** "Log in. Click Practice. Open Listening practice 1. You hear the recording one time only. Write your answers. Click Submit one time only." Do not replay audio. Do not give answers.'),
   (15, 'Tea break', ''),
   (60, '3. Group activity: Fix the mistake', '**Do:** Groups of 4 at one table. **Say:** "Each sentence has one mistake. Talk together. Write the correct sentence." After 20 minutes read the answers (below). Each group counts its correct sentences.'),
   (40, '4. Make your own', '**Say:** "Write 4 sentences with a mistake: about plurals (two child), a pronoun (him is) or always. Give them to another group to fix."'),
   (55, '5. Learn lessons', '**Say:** "Go to the computer. Click Learn. Open Week 1: Me and my world. Do Day 4 and Day 5." Help with log in. Do not give answers.')],
  answers=['**Fix the mistake:** 1 I have two children. 2 She drinks water every morning. 3 He is my friend. 4 OK. 5 I am always happy. 6 We need some information. 7 My sister is a nurse. 8 There are three buses.'],
  tips=['Listening practice 1 is an IELTS-style paper. It is harder than the students\' level. Do not worry about the score.'], homework='')),

# ============================================================ DAY 9
dict(F, day=9, theme='Anna 3 - Quiz, reading paper and group activity', title='Morning 3: quiz, reading paper and group activity',
 focus='The Week 1 quiz, a second reading paper, and a group activity on sentence patterns.',
 student=[
  dict(t='list', title='Computer papers (log in, then follow the steps)', items=['Paper 1: Click **Practice**. Open the **Week 1 Quiz: Me and my world** (20 minutes).', 'Paper 2: Open **Course paper 2: Reading, a trip to the hills** (30 minutes).', 'Click **Submit one time only** at the end of each paper.', 'If you finish early: click **Learn**, open Week 1, do Day 6, the Week 1 review.']),
  fixsheet('Group activity: Fix the mistake (sentence patterns)', 'Work in your group. Each sentence has one mistake. Write the correct sentence.', [
   'I rice eat every day. ___', 'Is very hot today. ___', 'She go to school by bus. ___', 'He doesn\'t plays cricket. ___', 'Where you live? ___', 'I am like Korean food. ___', 'They are come from Matara. ___', 'Do she work in a shop? ___']),
 ],
 teacher=dict(need='This sheet. The IT lab. Everyone stays seated.', aims=['Students do the Week 1 quiz and a reading paper', 'Students fix sentence-pattern mistakes in groups'],
  steps=[
   (35, '1. Week 1 quiz', '**Say:** "Log in. Click Practice. Open the Week 1 Quiz: Me and my world. 20 minutes. Answer all the questions. Click Submit one time only." Do not give answers.'),
   (50, '2. Reading paper', '**Say:** "Now open Course paper 2: Reading, a trip to the hills. 30 minutes. Read, answer, click Submit one time only."'),
   (15, 'Tea break', ''),
   (60, '3. Group activity: Fix the mistake', '**Do:** Back in the classroom. Groups of 4 at one table. **Say:** "Each sentence has one mistake. Talk together. Write the correct sentence." After 20 minutes read the answers (below). Count points.'),
   (40, '4. Make your own', '**Say:** "Write 4 wrong sentences using the patterns from Sir\'s class: word order, be, do and does. Give them to another group."'),
   (40, '5. Learn lessons', '**Say:** "Click Learn. Open Week 1: Me and my world. Do Day 6, the Week 1 review." Help with log in.')],
  answers=['**Fix the mistake:** 1 I eat rice every day. 2 It is very hot today. 3 She goes to school by bus. 4 He doesn\'t play cricket. 5 Where do you live? 6 I like Korean food. 7 They come from Matara. 8 Does she work in a shop?'],
  tips=['These sentences come from Sir\'s Day 8 class. They already know the rules.'], homework='')),
]
