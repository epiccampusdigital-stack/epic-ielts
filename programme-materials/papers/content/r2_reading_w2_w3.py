R = dict(folder='Reading', kind='Reading & vocabulary', time='9:00 to 10:30', who='English Teacher 1')

LESSONS = [
dict(R, day=10, theme='Shopping & money', title='Clothes, prices and shops',
 focus='Shopping vocabulary, prices in won and rupees, reading an online shop and a sale notice.',
 student=[
  dict(t='words', title='Clothes and shopping', items=['T-shirt', 'jeans', 'jacket', 'trainers', 'scarf', 'size (S, M, L)', 'price', 'discount', 'receipt', 'cash', 'card', 'refund', 'try on', 'too big / too small']),
  dict(t='note', title='Prices', items=['**₩15,000** = fifteen thousand won. **Rs 3,500** = three thousand five hundred rupees.', '**How much is** this jacket? It\'s 45,000 won.  **How much are** these jeans? They\'re 30,000 won.', '**20% off** = the price is 20% lower. **Buy one, get one free** = you pay for one, you get two.']),
  dict(t='passage', title='Read the online shop and the notice', head='Myeongdong Student Style: winter sale',
    text="""**Warm padded jacket** (black, navy, grey). Sizes S to XL. Was ₩89,000. **Now ₩59,000.**
**Wool scarf** (red, beige). One size. ₩12,000. Buy one, get one free!
**Classic jeans** (blue). Sizes 26 to 34. ₩35,000. 10% off with a student card.
**Running trainers** (white). Sizes 230 to 280. ₩65,000. No discount.

**Notice for customers**
You can return clothes within 14 days. Please bring the receipt and do not wash or wear the clothes outside. We give a refund in the same way you paid: cash for cash, card for card. Sale items: you can change the size or colour, but we do not give a refund.

**A message from a customer**
"I bought the padded jacket in size M but it was too small, so I changed it for an L. The staff were very kind and they spoke English. It is really warm. Korea in January is minus ten degrees! Tip for Sri Lankan students: buy your winter jacket here, not at home. It's cheaper and better for the cold." (Kavindi, student from Negombo)"""),
  dict(t='mcq', title='Choose the correct answer', items=[
    ('How much is the padded jacket now?', ['₩89,000', '₩59,000', '₩35,000']),
    ('You buy two scarves. How much do you pay?', ['₩12,000', '₩24,000', '₩6,000']),
    ('Who gets 10% off the jeans?', ['everyone', 'students with a student card', 'customers who pay cash']),
    ('Which item has no discount?', ['the trainers', 'the jeans', 'the scarf']),
    ('You bought a sale jacket and you don\'t like it. What can you do?', ['get a refund', 'change the size or colour', 'nothing']),
    ('Why did Kavindi change her jacket?', ['the colour was wrong', 'it was too small', 'it was too expensive']),
  ]),
  dict(t='lines', title='Answer the questions', items=['How many days do you have to return clothes?', 'What two things must you do to return clothes?', 'What is Kavindi\'s tip for Sri Lankan students?']),
  dict(t='dialogue', title='Practise the conversation', ins='Read with a partner. Then change the words in bold and practise again.', lines=[
    ('Customer', 'Excuse me, how much is **this jacket**?'), ('Assistant', 'It\'s **59,000 won**. It\'s on sale.'), ('Customer', 'Can I try it on?'),
    ('Assistant', 'Sure. The changing room is over there.'), ('Customer', 'It\'s **too small**. Do you have it in **a large**?'), ('Assistant', 'Yes, here you are.'),
    ('Customer', 'Great, I\'ll take it. Can I pay **by card**?'), ('Assistant', 'Of course. Here\'s your receipt.')]),
 ],
 teacher=dict(
  need='Student worksheet, board. Optional: real price tags or a few clothes from the dormitory.',
  aims=['Name clothes and shopping words', 'Read prices and discounts correctly', 'Understand return rules and use a short shopping conversation'],
  steps=[
   (10, 'What are you wearing?', 'Students describe a partner\'s clothes. Teach the word box with things in the room.'),
   (10, 'Prices', 'Read the note. Practise: write 5 prices in won and rupees on the board, students read them. 1,000 won is about Rs 220 (check today\'s rate).'),
   (25, 'Reading', 'Exercises 4 and 5. Pairs explain item 2 (buy one, get one free) and item 5 (sale items) in their own words.'),
   (10, 'Check', 'Go through the answers. Ask: "Is the jacket a good price in rupees?"'),
   (15, 'Role-play', 'Exercise 6. Then a mini shop: half the class are assistants with price tags, half are customers with ₩100,000 to spend. Swap.'),
   (10, 'Mock interview prep', 'Mock interview round 1 is after the break. Remind students of "point, reason, example". Give 3 practice questions: Why Korea? What will you study? Tell me about your family.'),
   (10, 'Wrap-up', 'Each student says one thing they bought and the price.'),
  ],
  answers=['**4:** 1 ₩59,000, 2 ₩12,000 (one free), 3 students with a student card, 4 the trainers, 5 change the size or colour, 6 it was too small',
   '**5:** 1 14 days. 2 Bring the receipt; don\'t wash or wear the clothes outside. 3 Buy your winter jacket in Korea, not at home (it\'s cheaper and better for the cold).'],
  tips=['Korean shoe sizes are in millimetres (250 = UK 6 roughly). Students find this interesting and useful.', 'Use the cold weather point to talk about practical preparation for Korea.'],
  homework='IT lab today: Day 10 lesson on epicielts.live. Homework: write a shopping list of 5 things you need for Korea with an estimated price in won.'
 )),

dict(R, day=12, theme='Week 2 review', title='Week 2 review: a day in the city',
 focus='Revising home, town, food, shopping and present continuous through one longer text.',
 student=[
  dict(t='words', title='Week 2 words', items=['living room', 'opposite', 'turn left', 'go straight on', 'some', 'any', 'a bottle of', 'How much', 'these', 'on sale', 'at the moment', 'right now']),
  dict(t='passage', title='Read Nimal\'s message', head='Saturday in Seoul (a message to my cousin)',
    text="""Hi Kasun,

I'm writing this on the subway right now! It's Saturday and I'm going to Hongdae with two friends from my dormitory. Let me tell you about my week.

My room is small but nice. There is a bed, a desk and a big window. There aren't any curtains yet, so the sun wakes me up at six! The kitchen is on the first floor and we share it with twenty students.

On Wednesday I went to the supermarket opposite the subway station. I wanted some vegetables, but there weren't any green chillies! I bought a bag of rice, some eggs and a bottle of soy sauce. Rice is expensive here: 10 kg is about 35,000 won.

At the moment I'm learning to cook Korean food. My Korean friend Jisoo is teaching me. Yesterday we made kimchi fried rice. It was spicy but not as spicy as my mother's curry!

Directions to my dormitory, for when you visit: come out of exit 3 of the subway station, go straight on for 200 metres, then turn left at the bank. The dormitory is the tall white building between the bank and the park.

Write soon!
Nimal"""),
  dict(t='tf', title='True, false or not given?', labels=['T', 'F', 'NG'], ins='NG means the text does not say.', items=[
    'Nimal is at home when he writes the message.', 'His room has curtains.', 'Twenty students use the kitchen.', 'He bought green chillies at the supermarket.', 'Jisoo is from Korea.', 'Nimal likes Korean food more than Sri Lankan food.', 'The dormitory is next to the park.']),
  dict(t='lines', title='Answer the questions', items=['Where is Nimal going today?', 'Why does he wake up at six?', 'How much is 10 kg of rice?', 'What is Jisoo doing at the moment?', 'Which subway exit should Kasun use?']),
  dict(t='gap', title='Choose the correct word', items=['There (is / are) a desk in my room.', 'There aren\'t (some / any) curtains.', 'I bought (some / any) eggs.', '(How much / How many) is the rice?', 'I (cook / am cooking) dinner right now.', 'Jisoo usually (teaches / is teaching) me on Saturdays.']),
  dict(t='write', title='Your reply', ins='Write a short reply from Kasun (5 to 6 sentences). Say what you are doing right now, describe your room, and ask Nimal two questions.', n=7),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Recycle all Week 2 language in one connected text', 'Practise true / false / not given', 'Write a short informal reply'],
  steps=[
   (10, 'Two-minute talk', 'Pairs: talk for one minute each about "my room in the dormitory". Partner counts how many Week 2 words they use.'),
   (20, 'Reading', 'Read once for gist: "Where is Nimal? Who is Kasun?" Then exercise 3. Explain NG carefully with item 6.'),
   (15, 'Questions and check', 'Exercise 4. Students show the line in the text.'),
   (10, 'Grammar check', 'Exercise 5: there is/are, some/any, how much/many, present simple vs continuous.'),
   (25, 'Writing', 'Exercise 6. Model the start on the board: "Hi Nimal, Thanks for your message! Right now I\'m..." Collect and mark with ticks for good sentences.'),
   (10, 'Wrap-up', 'Remind students the Week 2 quiz is in the IT lab today.'),
  ],
  answers=['**3:** 1 F (on the subway), 2 F, 3 T, 4 F (there weren\'t any), 5 T (his Korean friend), 6 NG, 7 T (between the bank and the park)',
   '**4:** 1 Hongdae. 2 There are no curtains, so the sun wakes him. 3 About 35,000 won. 4 Teaching him to cook Korean food. 5 Exit 3.',
   '**5:** 1 is, 2 any, 3 some, 4 How much, 5 am cooking, 6 teaches'],
  tips=['Not Given is new for most students. Tell them: if you need to guess, it is probably NG.', 'Marking the replies: tick good sentences and underline one mistake per sentence. Do not correct everything.'],
  homework='IT lab today: Week 2 quiz (GE-W2). Homework: finish your reply to Nimal.'
 )),

dict(R, day=14, theme='Last weekend', title='Weekend activities',
 focus='Past simple regular verbs in a text about a weekend. Weekend activity words.',
 student=[
  dict(t='words', title='Weekend activities', items=['visit relatives', 'watch a film', 'play cricket', 'walk on the beach', 'tidy my room', 'wash clothes', 'listen to music', 'cook lunch', 'chat with friends', 'stay at home', 'travel to', 'relax']),
  dict(t='note', title='Past simple: regular verbs', items=['Add **-ed**: walk → walk**ed**, play → play**ed**, watch → watch**ed**.', 'Verbs ending in **-e**: add **-d**: live → live**d**, dance → dance**d**.', 'Consonant + **y**: change to **-ied**: study → stud**ied**, tidy → tid**ied**.', 'Short verbs with one vowel + one consonant: double it: stop → sto**pped**, chat → cha**tted**.', 'Negative: I **didn\'t** watch TV.   Question: **Did** you visit your grandparents?']),
  dict(t='passage', title='Read the blog', head='Our first weekend in Korea, by Hiruni',
    text="""Last Friday evening our teacher asked us, "What are your plans for the weekend?" We didn't have any plans, so we decided to explore.

On Saturday morning I washed my clothes and tidied my room. Then my roommate Ji-eun and I walked to the river. We stayed there for two hours. We watched people on bicycles, and an old man played the flute under a bridge. It was beautiful.

In the afternoon we visited a traditional market. We tried tteokbokki (spicy rice cakes) and hotteok (a sweet pancake). I liked the hotteok best. Ji-eun laughed because I asked for "not spicy" food in Korean and the woman smiled and added more chilli!

On Sunday it rained all day, so we stayed in the dormitory. I cooked lunch for six students: rice and dhal. They loved it! In the evening I chatted with my parents on video and I studied Korean for an hour.

It was a quiet weekend, but I learned a lot. Next weekend we want to travel to Busan by train."""),
  dict(t='table', title='Saturday or Sunday?', ins='Write Sat or Sun.', head=['Activity', 'Day'], rows=[
    ['washed clothes', ''], ['cooked lunch', ''], ['visited a market', ''], ['studied Korean', ''], ['walked to the river', ''], ['stayed in the dormitory', '']]),
  dict(t='lines', title='Answer the questions', items=['Why did they decide to explore?', 'What did they see at the river? (two things)', 'Which food did Hiruni like best?', 'Why did they stay in on Sunday?', 'Where do they want to go next weekend?']),
  dict(t='gap', title='Write the past simple', items=['I ___ (play) football with my cousins.', 'We ___ (study) for three hours.', 'She ___ (dance) at the wedding.', 'They ___ (chat) until midnight.', 'I ___ (not watch) TV last weekend.', '___ you ___ (visit) your grandmother?']),
  dict(t='write', title='Your last weekend', ins='Write 6 sentences about your last weekend. Use at least 5 regular past verbs.', n=7),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use 12 weekend activity phrases', 'Spell regular past simple forms correctly', 'Read a blog and order events'],
  steps=[
   (10, 'Weekend survey', 'Students ask 3 classmates "What do you usually do at the weekend?" Board the answers, then the word box.'),
   (15, 'Spelling rules', 'Read the note. Board challenge: 12 verbs, teams write the past form. Point out pronunciation: walked /t/, played /d/, visited /id/ (more in the listening lesson after the break).'),
   (20, 'Reading', 'Exercises 4 and 5. Ask about culture: Hiruni asked for "not spicy" and got more chilli. Why? (A joke, or the woman misunderstood.)'),
   (10, 'Grammar practice', 'Exercise 6, then check spelling on the board.'),
   (25, 'Your weekend', 'Exercise 7. Then pairs ask "Did you...?" questions about each other\'s weekend. Partner answers "Yes, I did / No, I didn\'t".'),
   (10, 'Wrap-up', 'Each student says one true and one false sentence about their weekend; the class guesses the false one.'),
  ],
  answers=['**4:** washed clothes Sat, cooked lunch Sun, visited a market Sat, studied Korean Sun, walked to the river Sat, stayed in the dormitory Sun',
   '**5:** 1 They didn\'t have any plans. 2 People on bicycles; an old man playing the flute. 3 Hotteok. 4 It rained all day. 5 Busan.',
   '**6:** 1 played, 2 studied, 3 danced, 4 chatted, 5 didn\'t watch, 6 Did you visit'],
  tips=['Tomorrow is the mid-programme test. Use the last 5 minutes to tell students what it includes (reading, writing, listening, speaking) and that it is not pass/fail.'],
  homework='IT lab today: Day 14 lesson on epicielts.live. Homework: revise Weeks 1 to 2 words for tomorrow\'s mid-programme test.'
 )),

dict(R, day=16, theme='School & education', title='School subjects and education',
 focus='Words for school and university. Reading about education in Korea and Sri Lanka.',
 student=[
  dict(t='words', title='School and university', items=['subject', 'maths', 'science', 'history', 'geography', 'IT', 'exam', 'grade', 'semester', 'lecture', 'assignment', 'scholarship', 'degree', 'graduate', 'O/L and A/L']),
  dict(t='match', title='Match the words and meanings', left=['lecture', 'assignment', 'semester', 'graduate', 'scholarship', 'grade'],
    right=['money to pay for your studies', 'a talk by a teacher at university', 'half of the university year', 'finish university and get a degree', 'a mark like A, B or C', 'work you do at home and give to the teacher']),
  dict(t='passage', title='Read the article', head='Two school systems',
    text="""In Sri Lanka, children start school at five. They take the O/L exams at about sixteen and the A/L exams at about nineteen. A/L results are very important because they decide who can go to a state university. Many students go to tuition classes in the evenings and at weekends.

In South Korea, children also start school young, and secondary school students study very hard. Many students go to private academies called **hagwon** after school and sometimes study until ten or eleven at night. At the end of high school, students take a big exam called the **Suneung**. On the day of the Suneung, planes stop flying during the listening test so that it is quiet!

At Korean universities, the year has two semesters: spring (March to June) and autumn (September to December). Students choose a major, for example engineering or nursing. They go to lectures, write assignments and take mid-term and final exams. Attendance is important: if you miss too many classes, you can fail the course.

International students on scholarships usually study Korean for one year first. They need TOPIK level 3 or higher before they start their degree. Universities also have clubs, called **dongari**, for sports, music, dance and volunteering. They are a great way to make Korean friends."""),
  dict(t='tf', title='True or false?', items=['Sri Lankan children start school at six.', 'A/L results decide entry to state universities.', 'Hagwon are free government schools.', 'Planes stop during part of the Suneung.', 'The Korean university year has three semesters.', 'Missing classes can cause you to fail.', 'Scholarship students usually start their degree immediately.']),
  dict(t='lines', title='Answer the questions', items=['What is the Suneung?', 'When is the autumn semester?', 'What TOPIK level do scholarship students need?', 'What are dongari? Why are they useful?']),
  dict(t='table', title='Compare', ins='Talk with a partner, then complete the table.', head=['', 'Sri Lanka', 'Korea'], rows=[['Big exam at the end of school', '', ''], ['Extra classes after school', '', ''], ['Something I like', '', ''], ['Something I don\'t like', '', '']]),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use education vocabulary for school and university', 'Read an article comparing two systems', 'Compare and give opinions'],
  steps=[
   (10, 'My school', 'Students tell a partner: favourite subject, worst subject, best teacher. Board useful words.'),
   (10, 'Vocabulary', 'Word box and exercise 2.'),
   (25, 'Reading', 'Exercises 4 and 5. Pause on hagwon, Suneung and dongari: say them and ask if students know them from K-dramas.'),
   (20, 'Compare', 'Exercise 6 in pairs, then groups of four share. Push for reasons: "I like... because..."'),
   (15, 'Speaking link', 'Practise a scholarship interview question: "Tell me about your education." Model a 4-sentence answer, students practise in pairs.'),
   (10, 'Wrap-up', 'Students write 2 sentences: one thing they will do to succeed at a Korean university.'),
  ],
  answers=['**2:** 1 lecture: a talk by a teacher at university (B). 2 assignment: work you do at home... (F). 3 semester: half of the university year (C). 4 graduate: finish university and get a degree (D). 5 scholarship: money to pay for your studies (A). 6 grade: a mark like A, B or C (E).',
   '**4:** 1 F (five), 2 T, 3 F (private academies), 4 T, 5 F (two), 6 T, 7 F (they study Korean for one year first)',
   '**5:** 1 A big exam at the end of high school. 2 September to December. 3 TOPIK level 3 or higher. 4 University clubs; a great way to make Korean friends.'],
  tips=['Some details (TOPIK level, Korean year first) depend on each scholarship. If a student has a specific offer letter, check its rules with them.'],
  homework='IT lab today: Day 16 lesson. Homework: write 5 sentences about your school life using past simple.'
 )),

dict(R, day=18, theme='Week 3 review + health', title='Body, health and the doctor',
 focus='Body and health words. Reading a student health guide.',
 student=[
  dict(t='words', title='Body and health', items=['head', 'throat', 'stomach', 'back', 'tooth', 'headache', 'sore throat', 'stomach ache', 'fever', 'cough', 'cold', 'medicine', 'prescription', 'appointment', 'health insurance']),
  dict(t='note', title='Talking about health', items=['I **have a** headache / cold / fever / cough / sore throat.', 'My back **hurts**. My stomach **hurts**.', 'I **feel** sick / tired / dizzy.', 'You **should** see a doctor. You **should** drink water and rest.']),
  dict(t='passage', title='Read the health guide', head='Staying healthy in Korea: advice for international students',
    text="""**Health insurance.** All international students in Korea must have national health insurance. It costs about 70,000 won a month. With insurance, a visit to a small clinic costs only around 5,000 to 10,000 won.

**Small problems.** For a cold, a sore throat or a headache, go to a pharmacy first. Pharmacists can give you medicine without a prescription. Many pharmacies close at 9 pm, but some convenience stores sell basic medicine like painkillers.

**Seeing a doctor.** For a fever that lasts more than two days, a bad cough or a stomach ache that doesn't stop, see a doctor at a clinic. You usually don't need an appointment. Take your alien registration card (ARC) and your insurance details. The doctor gives you a prescription and you take it to the pharmacy next door.

**Emergencies.** Call **119** for an ambulance. It is free. Hospitals in big cities have international clinics with English-speaking staff.

**Winter health.** Korean winters are very cold and dry. Wear warm clothes, drink plenty of water and wash your hands often. Many students catch a cold in their first winter.

**Your mind matters too.** Feeling homesick or stressed is normal. Talk to friends, call your family and visit the university counselling centre. It is free and confidential."""),
  dict(t='mcq', title='Choose the correct answer', items=[
    ('Where should you go first for a sore throat?', ['a hospital', 'a pharmacy', 'call 119']),
    ('What do you need a prescription for?', ['medicine from a doctor', 'painkillers from a convenience store', 'insurance']),
    ('When should you see a doctor for a fever?', ['immediately', 'after more than two days', 'never']),
    ('What number do you call for an ambulance?', ['911', '112', '119']),
    ('The counselling centre is...', ['expensive', 'free', 'only for Korean students']),
  ]),
  dict(t='match', title='Problem and advice', left=['I have a headache.', 'I feel homesick.', 'I have a bad cough and a fever for three days.', 'I cut my hand badly and it won\'t stop bleeding.', 'I always catch colds in winter.'],
    right=['Call 119 or go to the hospital.', 'Wear warm clothes and wash your hands often.', 'Take a painkiller from the pharmacy and rest.', 'Talk to friends and call your family.', 'See a doctor at a clinic.']),
  dict(t='write', title='Give advice', ins='Your friend in Korea writes: "I feel sick, I have a sore throat and I don\'t know what to do." Write a reply with 4 pieces of advice using should.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Name body parts and common illnesses', 'Understand practical health advice for Korea', 'Give advice with should'],
  steps=[
   (10, 'Simon says', 'Touch your head / back / throat. Then mime illnesses for students to name.'),
   (10, 'Vocabulary', 'Word box and the note. Drill "I have a..." vs "My... hurts".'),
   (25, 'Reading', 'Exercises 4 and 5. Spend time on 119, insurance and the counselling centre: this is real information they need.'),
   (10, 'Advice', 'Exercise 5 match, then pairs act it: one is sick, one gives advice.'),
   (20, 'Writing', 'Exercise 6. Model: "You should go to the pharmacy..."'),
   (15, 'Wrap-up', 'Quick revision of Week 3 words before the Week 3 quiz in the IT lab. Finish with a quick doctor role-play in pairs using the note phrases.'),
  ],
  answers=['**4:** 1 a pharmacy, 2 medicine from a doctor, 3 after more than two days, 4 119, 5 free',
   '**5:** 1 headache: take a painkiller and rest (C). 2 homesick: talk to friends and call your family (D). 3 cough and fever 3 days: see a doctor (E). 4 bad cut: call 119 or go to the hospital (A). 5 colds in winter: warm clothes, wash hands (B).'],
  tips=['Prices and the insurance amount change; check the current figure before Day 18 if students ask for exact numbers.', 'Handle the homesickness part gently. Some students may already feel it in Week 3 of a residential programme.'],
  homework='IT lab today: Week 3 quiz (GE-W3). Homework: learn 10 health words.'
 )),

dict(R, day=20, theme='Predictions & promises', title='Jobs and careers',
 focus='Job words and workplaces. Reading about careers for graduates in Korea.',
 student=[
  dict(t='words', title='Jobs', items=['engineer', 'nurse', 'chef', 'hotel manager', 'IT technician', 'designer', 'factory worker', 'translator', 'accountant', 'farmer', 'salary', 'part-time job', 'full-time', 'experience', 'skills']),
  dict(t='match', title='Who works where?', left=['nurse', 'chef', 'IT technician', 'translator', 'farmer', 'accountant'],
    right=['in an office, with numbers and money', 'in a hospital', 'in a kitchen', 'with computers and networks', 'on a farm', 'with two languages, in a company or online']),
  dict(t='passage', title='Read the careers page', head='After graduation: careers for international students',
    text="""Every year, thousands of international students graduate from Korean universities. What happens next?

**Staying in Korea.** Graduates can apply for a D-10 visa to look for a job for up to six months. Korean companies need workers with language skills, especially Korean, English and an Asian language like Sinhala, Vietnamese or Nepali. Jobs in engineering, IT, nursing and hotels are popular. A starting salary for a graduate is often 2.5 to 3 million won a month.

**Part-time jobs during your studies.** Students on a D-2 visa can work part-time, usually up to 20 to 25 hours a week during the semester, with permission from the university. Common jobs are in cafés, restaurants, convenience stores and as language tutors. They help you practise Korean and earn money, but don't let work hurt your grades!

**Going home.** Many graduates return to their home country. They work for Korean companies abroad, in tourism, or as Korean teachers and translators. Sri Lanka has Korean companies in construction, textiles and IT.

**What employers want.** We asked five Korean managers. They all said the same three things: good Korean (TOPIK 4 or higher), work experience, and a positive attitude. One manager said: "I will always choose the student who is friendly and works hard over the student with perfect grades." """),
  dict(t='tf', title='True or false?', items=['Graduates can stay six months to look for a job.', 'Korean companies only want Korean speakers.', 'A starting salary is often 2.5 to 3 million won a month.', 'D-2 students can work full-time.', 'Part-time jobs can help your Korean.', 'All graduates stay in Korea.', 'Employers want TOPIK 4 or higher.']),
  dict(t='lines', title='Answer the questions', items=['Name three popular job areas for graduates.', 'Where do students often work part-time?', 'What three things do employers want?', 'What did one manager say is more important than perfect grades?']),
  dict(t='write', title='Your future job', ins='Write 5 sentences: What job do you want? Where? Why? What skills do you need? Use will and want to.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board',
  aims=['Use 15 job and work words', 'Understand real career options after studying in Korea', 'Talk about future jobs (prepares for mock interview 2 after the break)'],
  steps=[
   (10, 'Job charades', 'Students mime jobs. Then the word box.'),
   (10, 'Match', 'Exercise 2.'),
   (25, 'Reading', 'Exercises 4 and 5. Discuss: which careers fit our group\'s chosen subjects?'),
   (15, 'Interview practice', 'Mock interview round 2 is after the break. Pairs practise: "What do you want to do after you graduate?" with point, reason, example.'),
   (20, 'Writing', 'Exercise 6. Students use it as notes for the afternoon interview.'),
   (10, 'Wrap-up', 'Two students read their future job paragraph.'),
  ],
  answers=['**2:** nurse: in a hospital (B). chef: in a kitchen (C). IT technician: computers and networks (D). translator: two languages (F). farmer: on a farm (E). accountant: office, numbers and money (A).',
   '**4:** 1 T, 2 F (language skills including English and Asian languages), 3 T, 4 F (part-time, 20 to 25 hours), 5 T, 6 F (many return home), 7 T',
   '**5:** 1 Engineering, IT, nursing, hotels (any three). 2 Cafés, restaurants, convenience stores, language tutoring. 3 Good Korean (TOPIK 4+), work experience, a positive attitude. 4 Being friendly and working hard.'],
  tips=['Visa rules and hours change. Present the figures as typical, and tell students to always check with their university\'s international office.'],
  homework='IT lab today: Day 20 lesson. Homework: write your answer to "What will you do after you graduate?" (6 sentences).'
 )),
]
