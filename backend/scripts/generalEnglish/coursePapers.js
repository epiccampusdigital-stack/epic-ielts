// General English course papers for the Korea programme: 3 reading + 3 writing, in the same order
// and at the same level as the English workbooks (A1 to A2). Papers 1 = workbook 2 (Days 6-13),
// 2 = workbook 3 (Days 16-22), 3 = workbook 4 (Days 23-28).
// Reading is auto-marked (score out of 100 + level). Writing is marked by Claude out of 100.

const mc = (content, options, answer, explanation) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation });
const tf = (content, answer, explanation) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation });
const sc = (content, answer, explanation) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation });
const MC = (from, to) => `Questions ${from} to ${to}. Choose the correct letter, A, B, C or D.`;
const TF = (from, to) => `Questions ${from} to ${to}. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.`;
const SC = (from, to) => `Questions ${from} to ${to}. Complete the sentences. Write NO MORE THAN TWO WORDS OR A NUMBER from the text.`;

// ───────────── Reading 1 · Home, town, food and shopping (A1) ─────────────
const R1_A = `My name is Nadeesha. Last month my family moved to a new house in Hikkaduwa. It is not very big, but I love it. There are three bedrooms, a kitchen, a living room and a small bathroom. My bedroom is upstairs, next to my brother's room. From my window I can see the sea.

There is a big mango tree in the garden. My father put a table and four chairs under the tree, and we eat dinner there when it is not raining. My mother likes the kitchen best because it is bright and there is a lot of space.

Our street is quiet, but the town is only ten minutes away on foot. There is a supermarket, a bank, a post office and a small hospital. The bus station is opposite the supermarket. On Sundays there is a market near the temple, and my mother and I buy fruit and vegetables there.`;

const R1_B = `Seaview Café · Hikkaduwa · Open every day 7 am to 9 pm

Breakfast (7 am to 11 am)
Egg hoppers (2) ........................ Rs 450
Bread, butter and jam .................. Rs 350

Lunch and dinner
Rice and curry (chicken or fish) ....... Rs 950
Vegetable rice and curry ............... Rs 750
Fried noodles .......................... Rs 800

Drinks
Tea or coffee .......................... Rs 200
Fresh mango juice ...................... Rs 400
Water (1 litre) ........................ Rs 150

Students get 10% off from Monday to Friday. Show your student card.
Sorry, we do not take cards. Cash only.`;

const reading1 = {
  code: 'GE-C1R', testType: 'READING', title: 'Course paper 1 · Reading: home, town and food', timeLimitMin: 30,
  instructions: 'For English workbook 2 (home and town, food and shopping). Two short texts and 20 questions. Read each text, then answer the questions.',
  passages: [
    { title: 'Text 1: Our new house', text: R1_A, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC(1, 6), questions: [
        mc('Where is Nadeesha\'s new house?', ['Galle', 'Hikkaduwa', 'Matara', 'Colombo'], 'B', '"My family moved to a new house in Hikkaduwa."'),
        mc('How many bedrooms are there?', ['One', 'Two', 'Three', 'Four'], 'C', '"There are three bedrooms."'),
        mc('Where is her bedroom?', ['Next to the kitchen', 'Downstairs', 'Next to her brother\'s room', 'In the garden'], 'C', '"My bedroom is upstairs, next to my brother\'s room."'),
        mc('Where does the family eat dinner when it is dry?', ['In the kitchen', 'Under the mango tree', 'In the living room', 'At a café'], 'B', '"We eat dinner there", under the tree, "when it is not raining".'),
        mc('Why does her mother like the kitchen?', ['It is near the sea', 'It is new', 'It is bright and big', 'It is quiet'], 'C', '"It is bright and there is a lot of space."'),
        mc('How long does it take to walk to the town?', ['Five minutes', 'Ten minutes', 'Twenty minutes', 'One hour'], 'B', '"The town is only ten minutes away on foot."'),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(7, 10), questions: [
        tf('The new house is very big.', 'FALSE', '"It is not very big."'),
        tf('Nadeesha can see the sea from her window.', 'TRUE', '"From my window I can see the sea."'),
        tf('The bus station is opposite the bank.', 'FALSE', 'It is opposite the supermarket.'),
        tf('Nadeesha\'s brother goes to school in the town.', 'NOT GIVEN', 'The text does not say where her brother goes to school.'),
      ] },
    ] },
    { title: 'Text 2: A café menu', text: R1_B, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC(11, 15), questions: [
        mc('What time does the café close?', ['7 am', '11 am', '9 pm', '10 pm'], 'C', '"Open every day 7 am to 9 pm."'),
        mc('How much is vegetable rice and curry?', ['Rs 750', 'Rs 800', 'Rs 950', 'Rs 450'], 'A', 'Vegetable rice and curry: Rs 750.'),
        mc('You can order egg hoppers at ___.', ['8 am', '1 pm', '6 pm', 'any time'], 'A', 'Breakfast is from 7 am to 11 am.'),
        mc('Which is the cheapest drink?', ['Tea', 'Coffee', 'Mango juice', 'Water'], 'D', 'Water is Rs 150.'),
        mc('How can you pay?', ['By card', 'In cash', 'By card or cash', 'Online'], 'B', '"We do not take cards. Cash only."'),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: SC(16, 20), wordLimit: 'NO MORE THAN TWO WORDS OR A NUMBER', questions: [
        sc('The rice and curry comes with chicken or ________.', 'FISH', '"Rice and curry (chicken or fish)".'),
        sc('One plate of fried noodles costs Rs ________.', '800', 'Fried noodles: Rs 800.'),
        sc('Students get ________ off from Monday to Friday.', '10%|10 PERCENT|TEN PERCENT', '"Students get 10% off."'),
        sc('To get the student price, show your ________.', 'STUDENT CARD|CARD|STUDENT ID', '"Show your student card."'),
        sc('A cup of tea costs the same as a cup of ________.', 'COFFEE', '"Tea or coffee: Rs 200."'),
      ] },
    ] },
  ],
};

// ───────────── Reading 2 · Past, travel, health and plans (A1-A2) ─────────────
const R2_A = `Last April, Tharindu and his cousin Malith went on a trip to Nuwara Eliya. First, they took the bus from Colombo to Kandy. It left at six in the morning and the journey took three hours. In Kandy they had breakfast and visited the lake. After that, they took the train to Nanu Oya. It was slow, but the views of the mountains and tea fields were amazing.

In Nuwara Eliya it was very cold, and Malith didn't have a jacket. He bought one at the market for two thousand rupees. In the afternoon they went to Gregory Lake and rode bicycles around it. Then they had hot soup at a small restaurant.

Unfortunately, on the second day Malith felt sick. He had a headache and a sore throat. Tharindu took him to a pharmacy, and the pharmacist gave him some medicine and told him to drink a lot of warm water and rest. Malith stayed at the guest house and slept all afternoon. By the evening he felt much better, and they went for a short walk in Victoria Park.

Next year, they are going to visit Jaffna. Tharindu says they will take the train all the way, and this time Malith will pack a jacket and some medicine!`;

const reading2 = {
  code: 'GE-C2R', testType: 'READING', title: 'Course paper 2 · Reading: a trip to the hills', timeLimitMin: 30,
  instructions: 'For English workbook 3 (past simple, travel stories, health and plans). One story and 20 questions.',
  passages: [
    { title: 'A trip to Nuwara Eliya', text: R2_A, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC(1, 7), questions: [
        mc('How did they travel from Colombo to Kandy?', ['By train', 'By bus', 'By car', 'By bicycle'], 'B', '"They took the bus from Colombo to Kandy."'),
        mc('How long was the bus journey?', ['One hour', 'Two hours', 'Three hours', 'Six hours'], 'C', '"The journey took three hours."'),
        mc('What did they do in Kandy?', ['They rode bicycles', 'They visited the lake', 'They bought a jacket', 'They slept'], 'B', '"They had breakfast and visited the lake."'),
        mc('Why did Malith buy a jacket?', ['It was raining', 'It was very cold', 'It was cheap', 'His jacket was old'], 'B', '"It was very cold, and Malith didn\'t have a jacket."'),
        mc('What was wrong with Malith on the second day?', ['A stomach ache and a cough', 'A headache and a sore throat', 'A broken leg', 'Toothache'], 'B', '"He had a headache and a sore throat."'),
        mc('Who gave Malith medicine?', ['A doctor', 'Tharindu', 'A pharmacist', 'The guest house owner'], 'C', '"The pharmacist gave him some medicine."'),
        mc('What are they going to do next year?', ['Go to Kandy again', 'Visit Jaffna', 'Buy bicycles', 'Stay at home'], 'B', '"Next year, they are going to visit Jaffna."'),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(8, 13), questions: [
        tf('The bus left Colombo at six in the morning.', 'TRUE', '"It left at six in the morning."'),
        tf('The train to Nanu Oya was fast.', 'FALSE', '"It was slow."'),
        tf('The jacket cost two thousand rupees.', 'TRUE', '"He bought one at the market for two thousand rupees."'),
        tf('They went swimming in Gregory Lake.', 'FALSE', 'They "rode bicycles around it".'),
        tf('Malith went to hospital.', 'FALSE', 'He went to a pharmacy and rested at the guest house.'),
        tf('Tharindu also felt sick on the trip.', 'NOT GIVEN', 'The story only says Malith felt sick.'),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: SC(14, 20), wordLimit: 'NO MORE THAN TWO WORDS OR A NUMBER', questions: [
        sc('From the train they could see mountains and ________.', 'TEA FIELDS|THE TEA FIELDS|TEA', '"The views of the mountains and tea fields".'),
        sc('After riding bicycles they had hot ________.', 'SOUP', '"Then they had hot soup."'),
        sc('The pharmacist told Malith to drink warm ________.', 'WATER', '"Drink a lot of warm water."'),
        sc('Malith slept all ________ at the guest house.', 'AFTERNOON', '"Slept all afternoon."'),
        sc('In the evening they walked in ________.', 'VICTORIA PARK', '"A short walk in Victoria Park."'),
        sc('Next year they will travel to Jaffna by ________.', 'TRAIN', '"They will take the train all the way."'),
        sc('This time Malith will pack a jacket and some ________.', 'MEDICINE', '"Malith will pack a jacket and some medicine."'),
      ] },
    ] },
  ],
};

// ───────────── Reading 3 · Studying in Korea, emails and the interview (A2) ─────────────
const R3_A = `From: International Office, Hanbit University
To: New international students
Subject: Welcome to Hanbit University!

Dear students,

Welcome to Hanbit University. We are very happy that you are joining us this March. Here is some important information for your first week.

Arrival: Please arrive in Daejeon by Friday 27 February. A university bus will meet students at Daejeon Station at 10 am and 3 pm that day.

Accommodation: All first-year international students live in the Sejong dormitory. Rooms are for two students. There is a kitchen on every floor, but cooking in your room is not allowed. Dinner is served in the dining hall from 5:30 to 7:30 pm.

Orientation: Orientation is on Monday 2 March at 9 am in the main hall. You must bring your passport, your admission letter and two passport photos. We will help you open a bank account and get your student card.

Korean classes: All scholarship students take Korean classes for one year before starting their degree. Classes are from Monday to Friday, 9 am to 1 pm. You will take a short level test on Tuesday 3 March.

If you have any questions, please reply to this email or call us on 042-555-0190 (Monday to Friday, 9 am to 6 pm).

Best wishes,
Ms Kim Ji-won
International Office`;

const R3_B = `Interview tips from a past scholarship student

When I had my scholarship interview, I was very nervous. Now I tell new students three things.

First, answer every question with a point, a reason and an example. For example, if they ask "Why do you want to study engineering?", don't just say "Because I like it." Say what you want to study, why, and give a real example from your life.

Second, it is better to speak a little slowly and clearly than quickly with many mistakes. The interviewers know English is not your first language. They want to understand you.

Third, learn a few sentences in Korean. You do not need to be perfect, but a short self-introduction in Korean shows that you are serious about living in Korea. My interviewers smiled when I said "만나서 반갑습니다", and I felt much more relaxed after that.`;

const reading3 = {
  code: 'GE-C3R', testType: 'READING', title: 'Course paper 3 · Reading: starting university in Korea', timeLimitMin: 35,
  instructions: 'For English workbook 4 (studying in Korea, emails, goals and the scholarship interview). Two texts and 20 questions.',
  passages: [
    { title: 'Text 1: An email from the university', text: R3_A, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: MC(1, 6), questions: [
        mc('Who wrote the email?', ['A student', 'A Korean teacher', 'The International Office', 'A bus driver'], 'C', 'It is from Ms Kim Ji-won, International Office.'),
        mc('When must students arrive in Daejeon?', ['By 27 February', 'On 2 March', 'On 3 March', 'In April'], 'A', '"Please arrive in Daejeon by Friday 27 February."'),
        mc('How many students share a dormitory room?', ['One', 'Two', 'Three', 'Four'], 'B', '"Rooms are for two students."'),
        mc('Where can students cook?', ['In their room', 'In the dining hall', 'In the kitchen on each floor', 'They cannot cook'], 'C', '"There is a kitchen on every floor, but cooking in your room is not allowed."'),
        mc('What happens on Tuesday 3 March?', ['Orientation', 'A Korean level test', 'The bus to the station', 'The first degree class'], 'B', '"You will take a short level test on Tuesday 3 March."'),
        mc('How long do scholarship students study Korean before their degree?', ['One month', 'Six months', 'One year', 'Two years'], 'C', '"Korean classes for one year before starting their degree."'),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: SC(7, 12), wordLimit: 'NO MORE THAN TWO WORDS OR A NUMBER', questions: [
        sc('The university bus meets students at 10 am and ________.', '3 PM|3PM|3', '"At 10 am and 3 pm that day."'),
        sc('Dinner in the dining hall finishes at ________.', '7:30 PM|7.30 PM|7:30|7.30', '"From 5:30 to 7:30 pm."'),
        sc('Orientation is in the ________.', 'MAIN HALL|THE MAIN HALL', '"In the main hall."'),
        sc('At orientation, bring your passport, admission letter and two ________.', 'PASSPORT PHOTOS|PHOTOS|PHOTOGRAPHS', '"Two passport photos."'),
        sc('Korean classes finish at ________ every day.', '1 PM|1PM|1|ONE', '"9 am to 1 pm."'),
        sc('You can call the office from Monday to ________.', 'FRIDAY', '"Monday to Friday, 9 am to 6 pm."'),
      ] },
    ] },
    { title: 'Text 2: Interview tips', text: R3_B, groups: [
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(13, 17), questions: [
        tf('The writer felt calm before the interview.', 'FALSE', '"I was very nervous."'),
        tf('The writer says a good answer has a point, a reason and an example.', 'TRUE', '"Answer every question with a point, a reason and an example."'),
        tf('It is better to speak quickly so you can say more.', 'FALSE', 'Speak "a little slowly and clearly".'),
        tf('The interview lasted thirty minutes.', 'NOT GIVEN', 'The text does not say how long it was.'),
        tf('The interviewers were happy when the writer spoke some Korean.', 'TRUE', '"My interviewers smiled."'),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: MC(18, 20), questions: [
        mc('"Because I like it" is a weak answer because it has no ___.', ['grammar', 'reason or example', 'Korean', 'question'], 'B', 'The writer wants a real reason and an example.'),
        mc('Why should you learn a little Korean for the interview?', ['It is the law', 'To show you are serious about living in Korea', 'Because the interview is in Korean', 'To get a higher score in English'], 'B', '"It shows that you are serious about living in Korea."'),
        mc('How did the writer feel after speaking Korean?', ['More nervous', 'Angry', 'More relaxed', 'Tired'], 'C', '"I felt much more relaxed after that."'),
      ] },
    ] },
  ],
};

// ───────────── Writing papers (marked out of 100) ─────────────
const writing1 = {
  code: 'GE-C1W', testType: 'WRITING', title: 'Course paper 1 · Writing: my home and my town', timeLimitMin: 40,
  instructions: 'For English workbook 2. Two tasks. Write full sentences. Use there is / there are, prepositions of place, and some / any.',
  tasks: [
    { taskNumber: 1, minWords: 50, timeMinutes: 15, prompt: 'Describe your home.\n\nWrite about:\n- where your home is\n- the rooms in your home\n- your favourite room and where things are in it (use in, on, under, next to, between)\n\nWrite at least 50 words.' },
    { taskNumber: 2, minWords: 80, timeMinutes: 25, prompt: 'Your friend Kasun is coming to visit your town for the first time. Write an email to him.\n\nTell him:\n- how to get to your house from the bus station\n- two good places to eat and what food they have\n- one place to visit and why he will like it\n\nStart with "Hi Kasun," and write at least 80 words.' },
  ],
};

const writing2 = {
  code: 'GE-C2W', testType: 'WRITING', title: 'Course paper 2 · Writing: a story and a plan', timeLimitMin: 45,
  instructions: 'For English workbook 3. Two tasks. Use the past simple in Task 1 and going to / will in Task 2.',
  tasks: [
    { taskNumber: 1, minWords: 80, timeMinutes: 25, prompt: 'Write a short story about a trip you went on.\n\nInclude:\n- where you went, when, and who you went with\n- what you did, in order (use first, then, after that, finally)\n- one problem that happened, and what you did about it\n- how you felt at the end\n\nWrite at least 80 words. Use the past simple.' },
    { taskNumber: 2, minWords: 60, timeMinutes: 20, prompt: 'Write about your plans for your first month in Korea.\n\nInclude:\n- three things you are going to do\n- one thing you think will be difficult, and why\n- one promise you will make to your family\n\nWrite at least 60 words. Use "going to" and "will".' },
  ],
};

const writing3 = {
  code: 'GE-C3W', testType: 'WRITING', title: 'Course paper 3 · Writing: email and personal statement', timeLimitMin: 50,
  instructions: 'For English workbook 4. Two tasks. Task 1 is a polite email. Task 2 is the short personal statement for your scholarship.',
  tasks: [
    { taskNumber: 1, minWords: 70, timeMinutes: 20, prompt: 'You have just received a welcome email from the International Office at your Korean university. Write a polite reply to Ms Kim.\n\nIn your email:\n- thank her for the information\n- tell her what time you will arrive at the station\n- ask two questions about the dormitory or the Korean classes\n\nStart with "Dear Ms Kim," and end with "Kind regards," and your name. Write at least 70 words.' },
    { taskNumber: 2, minWords: 120, timeMinutes: 30, prompt: 'Write your personal statement for the scholarship.\n\nInclude:\n- who you are and where you are from\n- what you want to study and why (give a point, a reason and an example)\n- one strength you have and an example of it\n- what you want to do after you graduate\n\nWrite at least 120 words.' },
  ],
};

const COURSE_PAPERS = [reading1, writing1, reading2, writing2, reading3, writing3];

module.exports = { COURSE_PAPERS };
