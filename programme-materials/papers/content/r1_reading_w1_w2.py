R = dict(folder='Reading', kind='Reading & vocabulary', time='9:00 to 10:30', who='English Teacher 1')

LESSONS = [
dict(R, day=2, theme='Personal information', title='Numbers, phone numbers and email addresses',
 focus='Reading a scholarship form and an email. Saying and writing numbers correctly.',
 student=[
  dict(t='words', title='Words for today', items=['first name', 'surname', 'date of birth', 'address', 'phone number', 'email address', 'nationality', 'age', 'at (@)', 'dot (.)', 'zero / oh', 'double']),
  dict(t='note', title='How we say numbers', items=[
    'Phone numbers: say each number. **077 123 4455** = oh-seven-seven, one-two-three, four-four, five-five (or **double four, double five**).',
    'Teens and tens sound different: **thirteen** (13) / **thirty** (30), **fifteen** (15) / **fifty** (50). The stress is at the end in thir**TEEN**.',
    'Email: **dilini.perera@gmail.com** = dilini **dot** perera **at** gmail **dot** com.',
    'Dates: **12/05/2006** = the twelfth of May, two thousand and six.']),
  dict(t='match', title='Match the numbers', ins='Write the letter next to the number.',
    left=['13', '30', '15', '50', '18', '80'], right=['fifty', 'eighteen', 'thirteen', 'eighty', 'thirty', 'fifteen']),
  dict(t='passage', title='Read the form and the email', head='Korea Scholarship 2026: Application form',
    text="""**First name:** Dilini   **Surname:** Perera
**Date of birth:** 12 May 2006   **Age:** 20   **Nationality:** Sri Lankan
**Address:** 45 Temple Road, Matara, Sri Lanka
**Phone:** 077 345 1188   **Email:** dilini.perera06@gmail.com
**Languages:** Sinhala (first language), English (basic), Korean (beginner)

Dear Ms Kim,

My name is Dilini Perera and I am 20 years old. I am from Matara, a city in the south of Sri Lanka. I am sending my application form for the Korea Scholarship. I want to study nursing at a university in Daejeon.

My phone number is 077 345 1188. Please note: my old email address was dilini.p@yahoo.com, but I do not use it now. My new email address is on the form.

I live with my parents and my two younger brothers. My father is a teacher and my mother has a small shop. In my free time I watch Korean dramas and I study Korean on my phone for thirty minutes every day.

Thank you for reading my application.

Best wishes,
Dilini Perera"""),
  dict(t='tf', title='True or false?', ins='Read again. Circle T (true) or F (false).', items=[
    'Dilini is twenty years old.', 'She is from Galle.', 'She wants to study nursing.', 'Her email address now is dilini.p@yahoo.com.',
    'She has two brothers.', 'Her mother is a teacher.', 'She studies Korean for thirteen minutes every day.']),
  dict(t='lines', title='Answer the questions', items=[
    'What is Dilini\'s surname?', 'When was she born?', 'Which city in Korea does she want to study in?', 'What languages does she speak?', 'What does she do in her free time?']),
  dict(t='table', title='Your form', ins='Fill in the form about you. Then ask a partner and fill in the second column.',
    head=['', 'Me', 'My partner'], rows=[['First name', '', ''], ['Surname', '', ''], ['Date of birth', '', ''], ['Phone number', '', ''], ['Email address', '', ''], ['Hometown', '', '']]),
 ],
 teacher=dict(
  need='Student worksheet, board, a ball or soft toy for the number game',
  aims=['Read a simple form and email and find personal details', 'Say and write phone numbers, email addresses and dates clearly', 'Hear and say the difference between 13 and 30, 15 and 50'],
  steps=[
   (10, 'Number ball', 'Students stand in a circle. Throw the ball and say a number from 1 to 100. The catcher writes it in the air and throws it back with a new number. Include teens and tens on purpose.'),
   (10, 'Words for today', 'Go through the word box. Drill **surname**, **date of birth**, **nationality**. Write your own email on the board and read it with "at" and "dot".'),
   (10, 'How we say numbers', 'Read the note together. Clap the stress: thir-TEEN, THIR-ty. Students do exercise 3 in pairs, then check by saying the pairs aloud.'),
   (20, 'Reading', 'First read: give one minute and ask only "Who is the email to? What does Dilini want?" Second read: exercises 4 and 5 alone, then compare in pairs.'),
   (10, 'Check answers', 'Ask students to show where the answer is in the text. Focus on item 4 (old and new email) and item 7 (thirty, not thirteen).'),
   (20, 'Your form', 'Students fill in the "Me" column, then interview a partner. The partner must spell their surname and read their email aloud. Monitor and note common mistakes.'),
   (10, 'Wrap-up', 'Put 3 or 4 common mistakes on the board without names. Students correct them. Remind them about the IT lab practice at the end of the block.'),
  ],
  answers=['**3 Match:** 1 C (13 thirteen), 2 E (30 thirty), 3 F (15 fifteen), 4 A (50 fifty), 5 B (18 eighteen), 6 D (80 eighty)',
   '**4 True or false:** 1 T, 2 F (Matara), 3 T, 4 F (that is her old email), 5 T, 6 F (her father), 7 F (thirty minutes)',
   '**5 Questions:** 1 Perera. 2 On 12 May 2006. 3 Daejeon. 4 Sinhala, English and Korean. 5 She watches Korean dramas and studies Korean on her phone.'],
  tips=['Many students say "fifty" for 15. Keep coming back to the stress game all week.', 'Students often write the surname first. Explain that forms in Korea will ask for "surname" and "given name" separately, so read the labels.', 'If a student has no email address, help them make one in the IT lab today; they will need it for the site.'],
  homework='IT lab today: Day 2 lesson on epicielts.live (General English, Week 1). Homework: write your full name, date of birth, phone number and email address in words, as you would say them.'
 )),

dict(R, day=4, theme='Daily routine', title='A day in the life',
 focus='Daily activities and telling the time. Reading about a student\'s day in Korea.',
 student=[
  dict(t='words', title='Daily activities', items=['wake up', 'get up', 'have a shower', 'get dressed', 'have breakfast', 'catch the bus', 'start class', 'have lunch', 'finish class', 'do homework', 'cook dinner', 'go to bed']),
  dict(t='note', title='Telling the time', items=[
    '7:00 = **seven o\'clock**    7:15 = **quarter past seven**    7:30 = **half past seven**    7:45 = **quarter to eight**',
    'You can also say the numbers: 7:15 = **seven fifteen**, 7:45 = **seven forty-five**.',
    'Use **at** with times: at 6:30. Use **in** with parts of the day: in the morning, in the afternoon, in the evening. But **at night**.']),
  dict(t='lines', title='What time is it?', ins='Write the time in words.', items=['6:30', '8:15', '12:00', '1:45', '9:20']),
  dict(t='passage', title='Read about Ruwan', head='My day as an international student',
    text="""Hi! I'm Ruwan and I'm from Kandy. I am a student at a university in Busan, South Korea. People here call me "Ru". My Korean friend Minho gave me that name!

On weekdays I get up at half past six. I have a shower and I get dressed. I have breakfast in my dormitory at seven o'clock. Korean breakfast is rice, soup and kimchi, so it is very different from string hoppers at home!

I catch the bus to the campus at quarter to eight. My first class starts at nine. I have Korean language classes in the morning and engineering classes in the afternoon. I have lunch at the student cafeteria at about half past twelve. It is cheap and the food is good.

Classes finish at five o'clock. Then I go to the library and do my homework. Twice a week I play football with students from Vietnam, Nepal and Korea. In the evening I cook dinner with my roommate. He is from Indonesia and he makes very good fried rice.

I call my family in Sri Lanka at nine o'clock every night. Korea is three and a half hours ahead of Sri Lanka, so it is half past five in the evening at home. I go to bed at about eleven."""),
  dict(t='table', title='Complete Ruwan\'s timetable', head=['Time', 'Activity'], rows=[
    ['6:30', ''], ['7:00', ''], ['', 'catches the bus'], ['9:00', ''], ['12:30', ''], ['5:00', ''], ['9:00 pm', ''], ['11:00', '']]),
  dict(t='mcq', title='Choose the correct answer', items=[
    ('Where does Ruwan study?', ['Kandy', 'Busan', 'Seoul']),
    ('What does he study in the afternoon?', ['Korean', 'engineering', 'nursing']),
    ('Who does he play football with?', ['only Korean students', 'his roommate', 'students from different countries']),
    ('Who is his roommate?', ['Minho', 'a student from Indonesia', 'a student from Nepal']),
    ('When it is 9 pm in Korea, the time in Sri Lanka is...', ['5:30 pm', '12:30 am', '9 am']),
  ]),
  dict(t='write', title='Your day', ins='Write 5 sentences about your normal day at home. Use times. Example: I get up at six o\'clock.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board, a clock face drawn on the board (or a real clock)',
  aims=['Use 12 daily routine phrases', 'Tell the time in two ways', 'Read a short text and find times and activities'],
  steps=[
   (10, 'Mime game', 'Mime 5 activities (brushing teeth, catching a bus, cooking). Students guess the phrase. Then 3 students mime for the class.'),
   (10, 'Daily activities', 'Teach the word box. Students put the 12 phrases in the order of their own day. Check with a partner: "First I wake up, then..."'),
   (15, 'Telling the time', 'Use the clock on the board. Teach o\'clock, past, to, half, quarter. Students do exercise 3. Then "What time is it?" chain round the class with times you draw.'),
   (20, 'Reading', 'Pre-question: "Where is Ruwan? What is different about his breakfast?" Then exercises 4 and 5 alone. Pairs compare.'),
   (10, 'Check', 'Elicit answers. Point out "Korea is three and a half hours ahead". Ask: if it is 10 am here, what time is it in Korea? (1:30 pm)'),
   (20, 'Your day', 'Students write exercise 7. Then read it to a partner, who must draw a simple timetable from what they hear. Swap.'),
   (5, 'Wrap-up', 'Two students read their day to the class. Correct only one or two key mistakes (third person -s comes on Day 5).'),
  ],
  answers=['**3:** 1 half past six / six thirty. 2 quarter past eight / eight fifteen. 3 twelve o\'clock (midday). 4 quarter to two / one forty-five. 5 twenty past nine / nine twenty.',
   '**5 Timetable:** 6:30 gets up; 7:00 has breakfast; 7:45 catches the bus; 9:00 first class starts; 12:30 has lunch; 5:00 classes finish; 9:00 pm calls his family; 11:00 goes to bed.',
   '**6:** 1 Busan, 2 engineering, 3 students from different countries, 4 a student from Indonesia, 5 5:30 pm'],
  tips=['Ask "Who is Minho?" as a quick check that students read carefully. (His Korean friend, who gave him the name "Ru".)', 'Students will make he/she mistakes when describing Ruwan ("he get up"). Accept them today; Day 5 teaches the -s ending.'],
  homework='IT lab today: Day 4 lesson on epicielts.live. Homework: write tomorrow\'s timetable for the programme in English, with times.'
 )),

dict(R, day=6, theme='Week 1 review', title='Week 1 review: people and places',
 focus='Revising Week 1 words: countries, numbers, family, routine and free time.',
 student=[
  dict(t='words', title='Week 1 words', items=['nationality', 'surname', 'cousin', 'grandparents', 'daughter', 'have breakfast', 'go to bed', 'quarter past', 'hobby', 'weekend', 'kind', 'funny']),
  dict(t='gap', title='Complete the sentences', ins='Use a word from the box.', items=[
    'My father\'s brother is my ___.', 'I\'m from Sri Lanka. My ___ is Sri Lankan.', 'My ___ is Fernando and my first name is Nimal.',
    'I usually ___ at 6 o\'clock and ___ at 10 o\'clock.', 'My ___ is cricket. I play it every ___.', 'My sister is very ___. She always makes us laugh.']),
  dict(t='passage', title='Read the profiles', head='Meet the students: Korea Scholarship 2026',
    text="""**Tharindu, 19, Kurunegala.** Tharindu lives with his grandparents, his mother and his younger sister. He wakes up at five because he helps on the family farm before school. He loves cricket and he plays every weekend. He wants to study agriculture in Korea.

**Sachini, 21, Colombo.** Sachini is an only child. Her parents are both nurses. She works part-time in a phone shop, so she is good at numbers and talking to customers. In her free time she draws and she likes K-pop. She wants to study design.

**Pasindu, 20, Galle.** Pasindu has a big family: two brothers, one sister and a lot of cousins. He doesn't like mornings! He gets up at eight on weekdays and at ten on Sundays. He is very funny and he is the best singer in the group. He wants to study hotel management."""),
  dict(t='table', title='Who is it?', ins='Write the name: Tharindu, Sachini or Pasindu.', head=['Who...', 'Name'], rows=[
    ['...has no brothers or sisters?', ''], ['...gets up very early?', ''], ['...likes music?', ''], ['...has many cousins?', ''],
    ['...wants to work in hotels?', ''], ['...has a job?', ''], ['...lives with three generations of family?', ''], ['...likes art?', '']]),
  dict(t='gap', title='Choose the correct word', items=[
    'Sachini (is / are) an only child.', 'Tharindu (play / plays) cricket every weekend.', 'Pasindu (don\'t / doesn\'t) like mornings.',
    '(Her / His) parents are nurses. (Sachini)', 'They (wants / want) to study in Korea.', 'What time (do / does) Pasindu get up on Sundays?']),
  dict(t='write', title='Your profile', ins='Write a profile like the ones above about you: name, age, hometown, family, routine, hobbies and what you want to study.', n=7),
 ],
 teacher=dict(
  need='Student worksheet, board. Prepare: a sheet with each student\'s name for the find-someone-who game (optional).',
  aims=['Recycle Week 1 vocabulary', 'Read three short profiles and match information', 'Write a personal profile (it becomes Presentation night material)'],
  steps=[
   (10, 'Board race', 'Two teams. Call a category (family, countries, routine, hobbies). One student from each team writes a word. Fastest correct word wins a point.'),
   (10, 'Week 1 words', 'Exercise 2 alone, then check in pairs. Elicit more family words (aunt, niece).'),
   (20, 'Reading', 'Exercise 3 then 4. Students underline the line in the text that gives each answer.'),
   (10, 'Grammar check', 'Exercise 5. This revises be, present simple -s, do/does and possessives from the week.'),
   (25, 'Your profile', 'Students write their profile. Go round and help. Fast finishers add one sentence about a family member.'),
   (15, 'Gallery', 'Profiles go on the wall. Students walk, read and write one question on a sticky note for each of 3 classmates.'),
  ],
  answers=['**2:** 1 uncle, 2 nationality, 3 surname, 4 have breakfast / go to bed (or get up / go to bed), 5 hobby, weekend, 6 funny',
   '**4:** has no brothers or sisters: Sachini. Gets up very early: Tharindu. Likes music: Sachini (K-pop) and Pasindu (singing). Many cousins: Pasindu. Hotels: Pasindu. Has a job: Sachini. Three generations: Tharindu. Likes art: Sachini.',
   '**5:** 1 is, 2 plays, 3 doesn\'t, 4 Her, 5 want, 6 does'],
  tips=['The weekly quiz is on the site today in the IT lab (GE-W1). Remind students it counts toward their overall score out of 100.', 'Keep the profiles: students can use them for practice before the next presentation night.'],
  homework='IT lab today: Week 1 quiz on epicielts.live. Homework: learn your profile and practise saying it in under one minute.'
 )),

dict(R, day=8, theme='My town & directions', title='Places in town',
 focus='Words for places in a town. Reading a map and a town guide.',
 student=[
  dict(t='words', title='Places', items=['bank', 'post office', 'pharmacy', 'supermarket', 'bus station', 'hospital', 'police station', 'library', 'park', 'convenience store', 'subway station', 'restaurant']),
  dict(t='match', title='Where do you go?', ins='Match the need with the place.', left=['I need money.', 'I want to send a letter.', 'I need medicine for a headache.', 'I want to read a book.', 'I want to take a train under the city.', 'I want a snack at 2 am.'],
    right=['library', 'pharmacy', 'bank', 'convenience store', 'post office', 'subway station']),
  dict(t='note', title='Words for where things are', items=['**next to**: The bank is next to the post office.', '**opposite**: The park is opposite the library.', '**between**: The pharmacy is between the bank and the café.', '**on the corner of**: The hospital is on the corner of Main Street and Park Road.', '**near / far from**: The dormitory is near the campus.']),
  dict(t='passage', title='Read the guide', head='Welcome to Daehak-ro: a guide for new students',
    text="""Daehak-ro is the street outside the main gate of the university. Everything you need is here.

When you come out of the main gate, the **subway station** is on your left. Trains go to the city centre every five minutes. Opposite the subway station there is a big **supermarket**. It is open from 9 am to 11 pm.

Next to the supermarket there is a **bank** with an ATM. International students can open an account here. Bring your passport and your student card. Between the bank and the post office there is a small **pharmacy**. The pharmacist speaks a little English.

There are three **convenience stores** on the street. They are open 24 hours. You can buy food, drinks, phone cards and bus cards there.

The **hospital** is not on Daehak-ro. It is on the corner of Daehak-ro and Hanbit Road, about ten minutes on foot. The international office can help you book an appointment.

The best place for students is the **park** at the end of the street. It is quiet, and on Saturday evenings there is a food market."""),
  dict(t='tf', title='True or false?', items=['The subway station is on the right when you come out of the gate.', 'The supermarket closes at 11 pm.', 'You need your passport to open a bank account.', 'The pharmacy is next to the post office.', 'Convenience stores close at night.', 'The hospital is on Daehak-ro.', 'There is a food market in the park on Saturdays.']),
  dict(t='lines', title='Answer the questions', items=['How often do trains go to the city centre?', 'What can you buy in a convenience store? (three things)', 'Who can help you book a hospital appointment?']),
  dict(t='write', title='My town', ins='Write 5 sentences about places in your town. Use next to, opposite, between, near.', n=6),
 ],
 teacher=dict(
  need='Student worksheet, board. Draw a simple street map on the board before class (gate, 8 boxes).',
  aims=['Name 12 places in a town', 'Use next to, opposite, between, on the corner of', 'Read a town guide and find places on a map'],
  steps=[
   (10, 'Where do you go?', 'Ask: "Where do you go when you need money? medicine?" Elicit places in Sri Lankan towns. Then the word box.'),
   (10, 'Match', 'Exercise 2 in pairs. Check. Explain "convenience store" (in Korea: GS25, CU, 7-Eleven, open 24 hours).'),
   (10, 'Location words', 'Use the board map. Point and ask "Where is the bank?" Students answer with the note phrases.'),
   (25, 'Reading', 'Students read and draw the places on the board map in their notebooks. Then exercises 5 and 6. Check against a finished map.'),
   (25, 'My town', 'Students write about their town, then describe it to a partner who draws a map. Compare the map with the description.'),
   (10, 'Wrap-up', 'Quick quiz: "It\'s between the bank and the post office." "Pharmacy!"'),
  ],
  answers=['**2:** 1 bank (C), 2 post office (E), 3 pharmacy (B), 4 library (A), 5 subway station (F), 6 convenience store (D)',
   '**5:** 1 F (on the left), 2 T, 3 T (passport and student card), 4 T (it is between the bank and the post office), 5 F (24 hours), 6 F (on the corner of Daehak-ro and Hanbit Road), 7 T',
   '**6:** 1 Every five minutes. 2 Food, drinks, phone cards, bus cards (any three). 3 The international office.'],
  tips=['This lesson sets up the listening after the break (following directions). Keep the board map up if the room is shared.', 'Some students mix "opposite" and "next to". Use two students standing in the room to show it.'],
  homework='IT lab today: Day 8 lesson on epicielts.live. Homework: draw a map of the street near your home and label 6 places in English.'
 )),
]
