// Fifteen extra General English papers (5 reading, 5 writing, 5 listening), easy to hard.
// Stars: 1 = A1, 2 = A2, 3 = B1, 4 = B1+, 5 = B2. All content is original.
// `ev` lists the exact words in the text or script that give each answer (stored as Question.evidence).

const P8 = require('./paper8Part2');
const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const tf = (content, answer, explanation, ev) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });
const MC = (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B, C or D.`;
const MC3 = (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B or C.`;
const TF = (a, b) => `Questions ${a} to ${b}. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.`;
const SC = (a, b) => `Questions ${a} to ${b}. Complete the sentences. Write ONE WORD from the text.`;
const SCL = (a, b) => `Questions ${a} to ${b}. Complete the sentences. Write ONE WORD AND/OR A NUMBER for each answer.`;
const PARA = ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E'];

// ───────────── READING ─────────────
const R5 = `My name is Dilani and I am sixteen years old. I live in Matara with my mother, my father and my little brother, Ravi. On weekdays I go to school, so I am very busy. But the weekend is my favourite time.

On Saturday morning I get up at seven o'clock. I help my mother in the kitchen and we make breakfast together. We usually eat string hoppers with coconut sambol. After breakfast I wash the dishes. Then I walk to the market with my father. We buy fish, rice and fresh vegetables. The market is not far from our house, so we do not take a bus.

In the afternoon I play cricket with my friends in the park. I am not a very good player, but I love the game. At six o'clock I go home and take a shower. In the evening we watch television together. My brother likes cartoons, but my father likes the news.

On Sunday we go to the temple in the morning. After that we visit my grandmother. She lives in a small village near Weligama. She cooks delicious rice and curry for us. I love my grandmother very much.`;

const reading5 = {
  code: 'GE-C5R', testType: 'READING', title: 'Reading 005 · My weekend', timeLimitMin: 15, difficulty: 1, topic: 'Daily life',
  instructions: 'One short text and 10 questions. Read the text, then answer the questions.',
  passages: [{ title: 'My weekend', text: R5, groups: [
    { type: 'MULTIPLE_CHOICE', instruction: MC(1, 4), questions: [
      mc('Where does Dilani live?', ['Galle', 'Matara', 'Weligama', 'Colombo'], 'B', '"I live in Matara."', ['I live in Matara']),
      mc('What time does she get up on Saturday?', ['Six o\'clock', 'Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock'], 'B', '"I get up at seven o\'clock."', ['I get up at seven o\'clock']),
      mc('What does the family usually eat for breakfast?', ['Bread and jam', 'Egg hoppers', 'String hoppers with coconut sambol', 'Rice and curry'], 'C', '"We usually eat string hoppers with coconut sambol."', ['We usually eat string hoppers with coconut sambol']),
      mc('How does Dilani go to the market?', ['By bus', 'By bike', 'On foot', 'By tuk-tuk'], 'C', '"I walk to the market with my father."', ['I walk to the market with my father']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(5, 7), questions: [
      tf('Dilani goes to school on weekdays.', 'TRUE', '"On weekdays I go to school."', ['On weekdays I go to school']),
      tf('Dilani is a very good cricket player.', 'FALSE', '"I am not a very good player."', ['I am not a very good player']),
      tf('Dilani\'s mother works in a hospital.', 'NOT GIVEN', 'The text does not say where her mother works.', []),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(8, 10), wordLimit: 'ONE WORD', questions: [
      sc('Dilani buys fish, rice and fresh ________ at the market.', 'VEGETABLES', '"We buy fish, rice and fresh vegetables."', ['We buy fish, rice and fresh vegetables']),
      sc('She plays cricket in the ________.', 'PARK', '"I play cricket with my friends in the park."', ['play cricket with my friends in the park']),
      sc('Her grandmother lives in a small ________ near Weligama.', 'VILLAGE', '"She lives in a small village near Weligama."', ['She lives in a small village near Weligama']),
    ] },
  ] }],
};

const R6 = `The Kandy Community Library opened its doors last Monday. The old library was small and dark, and many people stopped using it. Now the town has a new building with three floors, big windows and a garden at the back.

The ground floor has books for children, a toy corner and a small café. The first floor is for adults and has more than twenty thousand books in Sinhala, Tamil and English. On the top floor there are twelve computers and a quiet room for students. Library cards are free for everyone under eighteen. Adults pay two hundred rupees a year.

The library is open from eight in the morning until seven in the evening, Monday to Saturday. It is closed on Sundays and on public holidays. Every Saturday at ten o'clock there is a story hour for young children, and on the first Friday of each month a local writer visits to talk about his or her work.

The new library cost about forty million rupees. Most of the money came from the government, but local people also helped. A group of students sold cakes for three months and gave the library eighty thousand rupees. The librarian, Mrs Perera, says she is very proud of them. "This is not just a place for books," she says. "It is a place where the whole town can meet."`;

const reading6 = {
  code: 'GE-C6R', testType: 'READING', title: 'Reading 006 · The new library', timeLimitMin: 20, difficulty: 2, topic: 'Town and services',
  instructions: 'One text and 10 questions. Read the text, then answer the questions.',
  passages: [{ title: 'A new library for Kandy', text: R6, groups: [
    { type: 'MULTIPLE_CHOICE', instruction: MC(1, 5), questions: [
      mc('How many floors does the new library have?', ['One', 'Two', 'Three', 'Four'], 'C', '"a new building with three floors"', ['a new building with three floors']),
      mc('Where is the café?', ['In the garden', 'On the ground floor', 'On the first floor', 'On the top floor'], 'B', '"The ground floor has books for children, a toy corner and a small café."', ['The ground floor has books for children, a toy corner and a small café']),
      mc('How much do adults pay for a library card?', ['Nothing', '200 rupees a year', '200 rupees a month', '80,000 rupees'], 'B', '"Adults pay two hundred rupees a year."', ['Adults pay two hundred rupees a year']),
      mc('When is the library closed?', ['On Saturdays', 'On Fridays', 'On Sundays and public holidays', 'On Mondays'], 'C', '"It is closed on Sundays and on public holidays."', ['It is closed on Sundays and on public holidays']),
      mc('Where did most of the money come from?', ['The students', 'The government', 'Mrs Perera', 'A local writer'], 'B', '"Most of the money came from the government."', ['Most of the money came from the government']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(6, 9), questions: [
      tf('The old library was big and bright.', 'FALSE', '"The old library was small and dark."', ['The old library was small and dark']),
      tf('There are books in three languages on the first floor.', 'TRUE', '"books in Sinhala, Tamil and English"', ['books in Sinhala, Tamil and English']),
      tf('A writer visits the library every Saturday.', 'FALSE', 'The writer visits on the first Friday of each month.', ['on the first Friday of each month a local writer visits']),
      tf('Mrs Perera has worked at the library for ten years.', 'NOT GIVEN', 'The text does not say how long she has worked there.', []),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(10, 10), wordLimit: 'ONE WORD', questions: [
      sc('A group of students sold ________ for three months.', 'CAKES', '"A group of students sold cakes for three months."', ['sold cakes for three months']),
    ] },
  ] }],
};

const R7 = `[A] Many cities in Asia are famous for traffic jams, and Colombo is no exception. In the morning and evening, the main roads are full of cars, buses and tuk-tuks, and a short journey can take an hour. Because of this, a small group of residents decided, five years ago, to try something different: they began riding bicycles to work.

[B] At first, cycling was not easy. There were almost no cycle lanes, and drivers were not used to sharing the road. Several of the early riders had minor accidents, and some gave up. The group, however, did not stop. They wrote to the city council, took photographs of the most dangerous roads, and asked for safer routes.

[C] Their efforts slowly worked. Two years ago the council built a six-kilometre cycle lane along the coast, and it was so popular that a second one was added last year. A survey shows that the number of people who cycle to work in the city has risen from about two hundred to more than three thousand.

[D] Cycling also has benefits for health and for money. Doctors say that thirty minutes of cycling a day reduces the risk of heart disease. A cyclist spends very little on fuel, and a good bicycle can be bought for about thirty thousand rupees, which is less than the cost of a motorbike.

[E] Not everyone is convinced, though. Some shop owners worry that cycle lanes take away parking spaces and reduce the number of customers. Others point out that in the rainy season the lanes are often flooded. The council says it is studying both problems and will publish its plan next year.`;

const reading7 = {
  code: 'GE-C7R', testType: 'READING', title: 'Reading 007 · Cycling in Colombo', timeLimitMin: 20, difficulty: 3, topic: 'Cities and transport',
  instructions: 'One text with paragraphs A to E and 10 questions. Read the text, then answer the questions.',
  passages: [{ title: 'Cycling in Colombo', text: R7, groups: [
    { type: 'MULTIPLE_CHOICE', instruction: 'Questions 1 to 5. Which paragraph contains the following information? Choose the correct paragraph, A to E.', questions: [
      mc('A reason why the group started to cycle', PARA, 'A', 'Paragraph A: traffic is so bad that "a short journey can take an hour".', ['a short journey can take an hour']),
      mc('Actions the group took to get safer roads', PARA, 'B', 'Paragraph B: they wrote to the council and took photographs.', ['They wrote to the city council']),
      mc('Numbers that show cycling has become more popular', PARA, 'C', 'Paragraph C: from about 200 to more than 3,000 riders.', ['from about two hundred to more than three thousand']),
      mc('A health benefit of cycling', PARA, 'D', 'Paragraph D: it "reduces the risk of heart disease".', ['reduces the risk of heart disease']),
      mc('A worry about the effect on business', PARA, 'E', 'Paragraph E: shop owners worry about "the number of customers".', ['reduce the number of customers']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(6, 8), questions: [
      tf('The first cyclists had no problems.', 'FALSE', '"Several of the early riders had minor accidents."', ['Several of the early riders had minor accidents']),
      tf('The second cycle lane was built last year.', 'TRUE', '"a second one was added last year"', ['a second one was added last year']),
      tf('A good bicycle costs more than a motorbike.', 'FALSE', 'A bicycle costs "less than the cost of a motorbike".', ['which is less than the cost of a motorbike']),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(9, 9), questions: [
      mc('What does the council say about the parking and flooding problems?', ['It will ignore them', 'It is studying them', 'It has already solved them', 'It will build more car parks'], 'B', '"it is studying both problems"', ['it is studying both problems']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(10, 10), wordLimit: 'ONE WORD', questions: [
      sc('The group took ________ of the most dangerous roads.', 'PHOTOGRAPHS', '"took photographs of the most dangerous roads"', ['took photographs of the most dangerous roads']),
    ] },
  ] }],
};

const R8 = `Fashion has changed dramatically over the past two decades. Clothes that once cost a week's wages can now be bought for the price of a lunch, and shoppers in many countries buy far more garments than their grandparents did. Researchers estimate that the average person today buys sixty per cent more clothing than in the year 2000, yet keeps each item for only half as long.

This pattern, often called "fast fashion", depends on a global chain of factories. A shirt sold in Europe may be designed in one country, made from cotton grown in another, and sewn in a third. Because companies compete fiercely on price, they constantly push their suppliers to cut costs, and the people at the bottom of the chain, usually garment workers, bear much of the pressure. In some countries, workers earn less than the amount needed to cover basic living expenses, even when they work overtime.

The environmental consequences are equally serious. Growing cotton requires enormous quantities of water; one estimate suggests that a single cotton T-shirt takes about 2,700 litres, roughly what one person drinks in two and a half years. Dyeing fabrics pollutes rivers near factories, and synthetic materials such as polyester release tiny plastic fibres each time they are washed. Meanwhile, millions of tonnes of unwanted clothing are thrown away every year, and only a small fraction is recycled.

Not all experts agree on the solution. Some argue that consumers should simply buy less and choose better quality, accepting higher prices. Others believe that this places an unfair burden on people with low incomes, and that governments should instead require companies to make clothes that last longer and can be recycled. A third group is more optimistic about technology, pointing to new methods that turn old cotton into fresh fibre. Whatever approach proves most effective, nearly everyone accepts that the present system cannot continue indefinitely.`;

const reading8 = {
  code: 'GE-C8R', testType: 'READING', title: 'Reading 008 · The cost of cheap clothes', timeLimitMin: P8.NEW_TIME, difficulty: 4, topic: 'Society and environment',
  instructions: P8.NEW_INSTRUCTIONS,
  passages: [{ title: 'The hidden cost of cheap clothes', text: R8, groups: [
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(1, 4), questions: [
      tf('People today buy more clothes than people did in the year 2000.', 'TRUE', '"buys sixty per cent more clothing than in the year 2000"', ['buys sixty per cent more clothing than in the year 2000']),
      tf('People keep their clothes for twice as long as they did in 2000.', 'FALSE', 'They keep each item "for only half as long".', ['keeps each item for only half as long']),
      tf('In some countries, garment workers\' wages do not cover basic living costs.', 'TRUE', '"workers earn less than the amount needed to cover basic living expenses"', ['workers earn less than the amount needed to cover basic living expenses']),
      tf('Most clothing companies grow their own cotton.', 'NOT GIVEN', 'The text does not say who grows the cotton.', []),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(5, 8), questions: [
      mc('How much water does one cotton T-shirt need, according to the text?', ['About 270 litres', 'About 2,700 litres', 'About 27,000 litres', 'About 2.5 litres'], 'B', '"a single cotton T-shirt takes about 2,700 litres"', ['a single cotton T-shirt takes about 2,700 litres']),
      mc('What problem does polyester cause?', ['It uses a lot of water', 'It pollutes rivers with dye', 'It releases tiny plastic fibres when washed', 'It cannot be sewn'], 'C', '"release tiny plastic fibres each time they are washed"', ['release tiny plastic fibres each time they are washed']),
      mc('What do some experts say consumers should do?', ['Buy less and choose better quality', 'Buy only cotton', 'Buy more cheap clothes', 'Stop using factories'], 'A', '"buy less and choose better quality"', ['buy less and choose better quality']),
      mc('Why do other experts disagree with this idea?', ['It is too complicated', 'It is unfair to people with low incomes', 'It needs new technology', 'Governments do not agree'], 'B', '"an unfair burden on people with low incomes"', ['an unfair burden on people with low incomes']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(9, 10), wordLimit: 'ONE WORD', questions: [
      sc('New methods can turn old cotton into fresh ________.', 'FIBRE|FIBER', '"turn old cotton into fresh fibre"', ['turn old cotton into fresh fibre']),
      sc('Companies compete fiercely on ________, so they push suppliers to cut costs.', 'PRICE', '"compete fiercely on price"', ['compete fiercely on price']),
    ] },
  ] }, P8.PART2],
};

const R9 = `Almost one-third of the food that humans eat depends on pollination, the process by which pollen is carried from one flower to another so that plants can produce fruit and seeds. For centuries, this task has been performed free of charge by insects, above all by bees. Yet in the past two decades, beekeepers in North America and Europe have reported alarming losses, with some losing up to forty per cent of their hives in a single winter.

Scientists have struggled to identify one clear cause. Several factors appear to act together. The most widely discussed are parasitic mites, which weaken bees and spread viruses; certain agricultural pesticides, which can damage the insects' ability to find their way home; and the loss of wild flowers, as meadows are replaced by fields of a single crop. A bee that must travel long distances to find food uses more energy and is more vulnerable to disease. Climate change may be making matters worse by shifting the time at which plants flower, so that bees emerge when little food is available.

The economic implications are considerable. In California, almond growers rent hives from beekeepers across the country, and the fee has roughly tripled in ten years. In parts of China, where wild pollinators have almost disappeared from some orchards, farmers now pollinate apple trees by hand, climbing ladders with small brushes. Such methods are slow and expensive, and no one believes they could replace insects on a global scale.

Responses vary. Some governments have restricted the use of the most harmful pesticides, and several cities now encourage residents to plant flowers on balconies and roofs. Researchers are also experimenting with robotic pollinators, although these remain far less efficient than real bees. Perhaps the most promising approach, according to many ecologists, is also the simplest: restoring strips of wild flowers along the edges of farmland, which provides food for bees without reducing the farmers' harvest significantly.`;

const reading9 = {
  code: 'GE-C9R', testType: 'READING', title: 'Reading 009 · Bees and the food we eat', timeLimitMin: 25, difficulty: 5, topic: 'Science and environment',
  instructions: 'One longer text and 10 questions. Read the text, then answer the questions.',
  passages: [{ title: 'Bees and the problem of pollination', text: R9, groups: [
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(1, 3), questions: [
      tf('About a third of the food people eat depends on pollination.', 'TRUE', '"Almost one-third of the food that humans eat depends on pollination"', ['Almost one-third of the food that humans eat depends on pollination']),
      tf('Beekeepers in Asia have lost up to forty per cent of their hives.', 'NOT GIVEN', 'The text gives these losses for North America and Europe only.', []),
      tf('Scientists agree that parasitic mites are the only cause of the losses.', 'FALSE', '"Scientists have struggled to identify one clear cause."', ['Scientists have struggled to identify one clear cause']),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(4, 6), questions: [
      mc('According to the text, how can some pesticides harm bees?', ['They kill bees at once', 'They damage the bees\' ability to find their way home', 'They make flowers disappear', 'They spread viruses'], 'B', '"damage the insects\' ability to find their way home"', ['damage the insects\' ability to find their way home']),
      mc('Why is a bee that flies long distances at greater risk?', ['It uses more energy and is more vulnerable to disease', 'It cannot find any flowers', 'It meets more mites', 'It sleeps less'], 'A', '"uses more energy and is more vulnerable to disease"', ['uses more energy and is more vulnerable to disease']),
      mc('What has happened to the fee for hiring hives in California?', ['It has halved', 'It has stayed the same', 'It has roughly tripled', 'It has doubled'], 'C', '"the fee has roughly tripled in ten years"', ['the fee has roughly tripled in ten years']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(7, 8), questions: [
      tf('Pollinating by hand could easily replace insects across the world.', 'FALSE', '"no one believes they could replace insects on a global scale"', ['no one believes they could replace insects on a global scale']),
      tf('Robotic pollinators are as efficient as real bees.', 'FALSE', 'They are "far less efficient than real bees".', ['far less efficient than real bees']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(9, 10), wordLimit: 'ONE WORD', questions: [
      sc('Climate change may change the time at which plants ________.', 'FLOWER', '"shifting the time at which plants flower"', ['shifting the time at which plants flower']),
      sc('Many ecologists suggest restoring strips of wild ________ along the edges of farmland.', 'FLOWERS', '"strips of wild flowers along the edges of farmland"', ['strips of wild flowers along the edges of farmland']),
    ] },
  ] }],
};

// ───────────── WRITING ─────────────
const writing5 = {
  code: 'GE-C5W', testType: 'WRITING', title: 'Writing 005 · About me', timeLimitMin: 30, difficulty: 1, topic: 'Personal information',
  instructions: 'Two short tasks. Write simple, full sentences.',
  tasks: [
    { taskNumber: 1, minWords: 40, timeMinutes: 12, prompt: 'Introduce yourself to a new friend.\n\nWrite about:\n- your name, your age and where you live\n- your family\n- one thing you like to do\n\nWrite at least 40 words.' },
    { taskNumber: 2, minWords: 60, timeMinutes: 18, prompt: 'Describe a normal day in your life.\n\nWrite about:\n- what time you get up\n- what you eat and where you go\n- what you do in the evening\n\nUse the present simple. Write at least 60 words.' },
  ],
};
const writing6 = {
  code: 'GE-C6W', testType: 'WRITING', title: 'Writing 006 · A message and a place', timeLimitMin: 40, difficulty: 2, topic: 'Plans and places',
  instructions: 'Two tasks. Task 1 is a short email to a friend. Task 2 describes a place you like.',
  tasks: [
    { taskNumber: 1, minWords: 70, timeMinutes: 18, prompt: 'Your friend Nuwan has invited you to his birthday party next Saturday. Write an email to him.\n\nIn your email:\n- thank him for the invitation\n- say if you can come, and give a reason\n- offer to bring something\n\nStart with "Hi Nuwan," and write at least 70 words.' },
    { taskNumber: 2, minWords: 80, timeMinutes: 22, prompt: 'Describe a place you like to visit.\n\nInclude:\n- where it is and how you get there\n- what you can see and do there\n- why you like it\n\nWrite at least 80 words.' },
  ],
};
const writing7 = {
  code: 'GE-C7W', testType: 'WRITING', title: 'Writing 007 · A complaint and an opinion', timeLimitMin: 50, difficulty: 3, topic: 'Complaints and opinions',
  instructions: 'Two tasks. Task 1 is a formal email. Task 2 is a short opinion essay.',
  tasks: [
    { taskNumber: 1, minWords: 100, timeMinutes: 20, prompt: 'You bought a mobile phone from a shop two weeks ago. The screen has stopped working. Write an email to the shop manager.\n\nIn your email:\n- explain what you bought and when\n- describe the problem\n- say what you want the shop to do\n\nStart with "Dear Sir or Madam," and write at least 100 words.' },
    { taskNumber: 2, minWords: 150, timeMinutes: 30, prompt: 'Some people think students should live in a hostel while they study. Other people think it is better to live at home with their family.\n\nWhat is your opinion? Give reasons and examples.\n\nWrite at least 150 words.' },
  ],
};
const writing8 = {
  code: 'GE-C8W', testType: 'WRITING', title: 'Writing 008 · A letter and an essay', timeLimitMin: 55, difficulty: 4, topic: 'Study and education',
  instructions: 'Two tasks. Task 1 is a formal letter. Task 2 is an essay with advantages and disadvantages.',
  tasks: [
    { taskNumber: 1, minWords: 120, timeMinutes: 20, prompt: 'You have won a place on a scholarship programme, but you cannot attend the interview on the date given. Write a letter to the programme coordinator.\n\nIn your letter:\n- thank the coordinator and say who you are\n- explain why you cannot attend on that date\n- suggest two other dates and ask about the next steps\n\nWrite at least 120 words. Use a formal style.' },
    { taskNumber: 2, minWords: 180, timeMinutes: 35, prompt: 'More and more students choose to study in a foreign country.\n\nWhat are the advantages and disadvantages of studying abroad?\n\nGive reasons for your answer and include examples from your own knowledge or experience.\n\nWrite at least 180 words.' },
  ],
};
const writing9 = {
  code: 'GE-C9W', testType: 'WRITING', title: 'Writing 009 · A report and a discussion essay', timeLimitMin: 60, difficulty: 5, topic: 'Reports and discussion',
  instructions: 'Two tasks, in the style of the IELTS Writing test. Task 2 carries more marks than Task 1.',
  tasks: [
    { taskNumber: 1, minWords: 150, timeMinutes: 20, prompt: 'The table shows how students at one college travel to class.\n\nMethod of travel | 2015 | 2025\nBus | 48% | 30%\nWalking | 25% | 22%\nBicycle | 5% | 18%\nMotorbike | 12% | 15%\nCar | 10% | 15%\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.' },
    { taskNumber: 2, minWords: 250, timeMinutes: 40, prompt: 'Some people believe that mobile phones should be banned in classrooms. Others think that phones are a useful tool for learning.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include relevant examples.\n\nWrite at least 250 words.' },
  ],
};

// ───────────── LISTENING (2 sections, 10 questions each) ─────────────
const L5A = `Narrator: Section one. You will hear a man buying a bus ticket. Questions 1 to 5.
Clerk: Good morning. Can I help you?
Man: Yes, please. I want a ticket to Kandy.
Clerk: One way or return?
Man: Return, please. I am coming back on Sunday.
Clerk: The bus leaves at half past eight. It costs six hundred and fifty rupees for a return ticket.
Man: Half past eight is fine. Which platform?
Clerk: Platform four.
Man: Thank you very much.
Clerk: Here is your ticket. Have a good trip.`;
const L5B = `Narrator: Section two. You will hear a teacher talking to new students on the first day. Questions 6 to 10.
Teacher: Welcome to English class, everyone. My name is Miss Hansani. Our class is on Monday, Wednesday and Friday. We start at nine o'clock and finish at eleven. Please bring a notebook and a pen every day. You do not need a dictionary because the classroom has computers. The classroom is on the second floor, next to the library. If you are sick, please call the office. Now, let's begin.`;
const listening5 = {
  code: 'GE-C5L', testType: 'LISTENING', title: 'Listening 005 · Tickets and a first class', timeLimitMin: 15, difficulty: 1, topic: 'Travel and study',
  instructions: 'Two short sections and 10 questions. Press Play to hear each section. You can listen twice. Read the questions before you listen.',
  audioScript: JSON.stringify({ 1: L5A, 2: L5B }),
  sections: [
    { number: 1, description: 'A man buys a bus ticket', groups: [{ type: 'SENTENCE_COMPLETION', instruction: SCL(1, 5), wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
      sc('Destination: ________', 'KANDY', '"I want a ticket to Kandy."', ['I want a ticket to Kandy']),
      sc('Type of ticket: ________', 'RETURN', '"Return, please."', ['Return, please']),
      sc('The bus leaves at ________', '8.30|8:30|830|HALF PAST EIGHT|8 30', '"The bus leaves at half past eight."', ['The bus leaves at half past eight']),
      sc('Price of the ticket: ________ rupees', '650|SIX HUNDRED AND FIFTY', '"six hundred and fifty rupees"', ['six hundred and fifty rupees']),
      sc('Platform number: ________', '4|FOUR', '"Platform four."', ['Platform four']),
    ] }] },
    { number: 2, description: 'A teacher talks to new students', groups: [{ type: 'MULTIPLE_CHOICE', instruction: MC3(6, 10), questions: [
      mc('Which days is the class?', ['Monday, Wednesday and Friday', 'Tuesday, Thursday and Saturday', 'Every day'], 'A', '"Our class is on Monday, Wednesday and Friday."', ['Our class is on Monday, Wednesday and Friday']),
      mc('What time does the class finish?', ['Ten o\'clock', 'Eleven o\'clock', 'Twelve o\'clock'], 'B', '"We start at nine o\'clock and finish at eleven."', ['finish at eleven']),
      mc('What must students bring?', ['A dictionary', 'A computer', 'A notebook and a pen'], 'C', '"Please bring a notebook and a pen every day."', ['bring a notebook and a pen']),
      mc('Where is the classroom?', ['On the first floor', 'On the second floor', 'In the library'], 'B', '"The classroom is on the second floor, next to the library."', ['on the second floor, next to the library']),
      mc('What should students do if they are sick?', ['Call the office', 'Send an email', 'Ask the teacher'], 'A', '"If you are sick, please call the office."', ['please call the office']),
    ] }] },
  ],
};

const L6A = `Narrator: Section one. You will hear a woman asking about swimming lessons for her son. Questions 1 to 5.
Receptionist: Blue Wave Swimming School. How can I help?
Woman: Hello. I would like lessons for my son, please. He is eight years old.
Receptionist: Of course. We have classes for beginners on Tuesdays and Saturdays.
Woman: Saturday is better for us. What time is the class?
Receptionist: The Saturday class is at four in the afternoon. It lasts forty-five minutes.
Woman: And how much is it?
Receptionist: It is four thousand rupees for a month, which is four lessons.
Woman: That's fine. And does he need a swimming cap?
Receptionist: Yes, he does. You can buy one here for six hundred rupees.`;
const L6B = `Narrator: Section two. You will hear a head teacher talking about a school trip. Questions 6 to 10.
Head teacher: Good morning, students. I want to tell you about our trip to Sigiriya. We will go on Friday the fourteenth of March. The bus leaves school at six in the morning, so please arrive by half past five. Each student must bring lunch and a bottle of water. We will climb the rock in the morning and visit the museum after lunch. Wear comfortable shoes, because the climb is long. The trip costs one thousand two hundred rupees, and you must pay by next Tuesday. We will return to school at five in the afternoon.`;
const listening6 = {
  code: 'GE-C6L', testType: 'LISTENING', title: 'Listening 006 · Swimming lessons and a school trip', timeLimitMin: 15, difficulty: 2, topic: 'Lessons and trips',
  instructions: 'Two sections and 10 questions. Press Play to hear each section. You can listen twice. Read the questions before you listen.',
  audioScript: JSON.stringify({ 1: L6A, 2: L6B }),
  sections: [
    { number: 1, description: 'A woman asks about swimming lessons', groups: [{ type: 'SENTENCE_COMPLETION', instruction: SCL(1, 5), wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
      sc('Age of the boy: ________ years old', '8|EIGHT', '"He is eight years old."', ['He is eight years old']),
      sc('Day of the lesson: ________', 'SATURDAY', '"Saturday is better for us."', ['Saturday is better for us']),
      sc('The class starts at ________ in the afternoon.', '4|FOUR|4:00|4.00|4 PM', '"at four in the afternoon"', ['at four in the afternoon']),
      sc('Price for one month: ________ rupees', '4000|4,000|FOUR THOUSAND', '"four thousand rupees for a month"', ['four thousand rupees for a month']),
      sc('A swimming cap costs ________ rupees.', '600|SIX HUNDRED', '"for six hundred rupees"', ['for six hundred rupees']),
    ] }] },
    { number: 2, description: 'A head teacher talks about a school trip', groups: [{ type: 'MULTIPLE_CHOICE', instruction: MC3(6, 10), questions: [
      mc('When is the trip?', ['Friday 14 March', 'Friday 4 March', 'Tuesday 14 March'], 'A', '"Friday the fourteenth of March"', ['Friday the fourteenth of March']),
      mc('What time must students arrive at school?', ['5.30', '6.00', '6.30'], 'A', '"please arrive by half past five"', ['please arrive by half past five']),
      mc('What must each student bring?', ['Lunch and water', 'Money for food', 'A camera'], 'A', '"bring lunch and a bottle of water"', ['bring lunch and a bottle of water']),
      mc('What will they do after lunch?', ['Climb the rock', 'Visit the museum', 'Go swimming'], 'B', '"visit the museum after lunch"', ['visit the museum after lunch']),
      mc('What time will they return to school?', ['3 pm', '5 pm', '6 pm'], 'B', '"return to school at five in the afternoon"', ['return to school at five in the afternoon']),
    ] }] },
  ],
};

const L7A = `Narrator: Section one. You will hear two friends planning a surprise birthday party. Questions 1 to 5.
Amal: Sara, have you thought about Dinesh's birthday? It's on the twentieth of June.
Sara: Yes. I think a surprise party is a good idea. Where can we have it?
Amal: His house is too small. What about the restaurant near the beach?
Sara: That's expensive. My aunt has a garden and she said we can use it for free.
Amal: Perfect. How many people should we invite?
Sara: About twenty. Not more, because the garden isn't very big.
Amal: Okay. I can make the cake. Dinesh loves chocolate.
Sara: Good. Then I'll organise the music and the drinks. We shouldn't tell him anything. Let's say we're taking him out for dinner at seven.
Amal: Great. We'll bring him to the garden instead.`;
const L7B = `Narrator: Section two. You will hear a guide talking about a museum. Questions 6 to 10.
Guide: Welcome to the National Museum. Before we start, let me explain a few things. The museum was built in 1877 and it is the biggest in the country. On the ground floor you can see ancient coins and stone statues. The second floor is about the colonial period. If you want to take photographs, please do not use a flash, because it can damage old paintings. Our tour lasts ninety minutes, and after that there will be a short break in the garden café. Tickets for foreign visitors cost two thousand rupees, but Sri Lankan citizens pay only two hundred.`;
const listening7 = {
  code: 'GE-C7L', testType: 'LISTENING', title: 'Listening 007 · A party plan and a museum tour', timeLimitMin: 18, difficulty: 3, topic: 'Plans and visits',
  instructions: 'Two sections and 10 questions. Press Play to hear each section. You can listen twice. Read the questions before you listen.',
  audioScript: JSON.stringify({ 1: L7A, 2: L7B }),
  sections: [
    { number: 1, description: 'Two friends plan a surprise party', groups: [{ type: 'MULTIPLE_CHOICE', instruction: MC3(1, 5), questions: [
      mc('When is Dinesh\'s birthday?', ['12 June', '20 June', '22 June'], 'B', '"It\'s on the twentieth of June."', ['It\'s on the twentieth of June']),
      mc('Why do they not choose the restaurant?', ['It is too far', 'It is too expensive', 'It is closed'], 'B', 'Sara says, "That\'s expensive."', ['That\'s expensive']),
      mc('Where will the party be?', ['At Dinesh\'s house', 'At a restaurant on the beach', 'In Sara\'s aunt\'s garden'], 'C', '"My aunt has a garden and she said we can use it for free."', ['My aunt has a garden']),
      mc('How many guests will they invite?', ['12', '20', '30'], 'B', '"About twenty."', ['About twenty']),
      mc('Who will make the cake?', ['Amal', 'Sara', 'Sara\'s aunt'], 'A', '"I can make the cake."', ['I can make the cake']),
    ] }] },
    { number: 2, description: 'A guide talks about a museum', groups: [{ type: 'SENTENCE_COMPLETION', instruction: SCL(6, 10), wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
      sc('The museum was built in ________.', '1877', '"The museum was built in 1877."', ['built in 1877']),
      sc('On the ground floor there are ancient coins and ________ statues.', 'STONE', '"ancient coins and stone statues"', ['ancient coins and stone statues']),
      sc('Visitors must not use a ________ when they take photographs.', 'FLASH', '"please do not use a flash"', ['please do not use a flash']),
      sc('The tour lasts ________ minutes.', '90|NINETY', '"Our tour lasts ninety minutes"', ['lasts ninety minutes']),
      sc('Sri Lankan citizens pay ________ rupees.', '200|TWO HUNDRED', '"Sri Lankan citizens pay only two hundred"', ['Sri Lankan citizens pay only two hundred']),
    ] }] },
  ],
};

const L8A = `Narrator: Section one. You will hear a radio interview with a young woman who volunteers. Questions 1 to 5.
Presenter: Today I'm talking to Nadia Perera, who spends her weekends helping at an animal shelter. Nadia, what made you start?
Nadia: Well, I always loved animals, but I never had a pet because my parents were allergic. A friend told me about the shelter two years ago, and I went along just to look. I ended up staying all day.
Presenter: What do you do there?
Nadia: Mostly I clean the cages and feed the dogs. I'd like to say I play with them all day, but that only happens at the end. The part I enjoy most is helping the nervous animals. Some of them have been badly treated, and it can take weeks before they trust you.
Presenter: Is it ever difficult?
Nadia: Yes. The hardest thing is saying goodbye when an animal is adopted. I'm happy for them, of course, but I cry every time.
Presenter: Would you recommend volunteering?
Nadia: Definitely, but you must be reliable. The animals need feeding whether you feel like it or not.`;
const L8B = `Narrator: Section two. You will hear part of a talk about sleep for students. Questions 6 to 10.
Lecturer: Most adults need between seven and nine hours of sleep every night, but surveys show that students often get less than six. This matters because sleep is when the brain stores what you have learned. Students who sleep badly find it harder to concentrate, and they make more mistakes in exams. There are three simple ways to improve your sleep. First, go to bed and wake up at the same time every day, even at weekends. Second, stop using your phone at least an hour before bed, because the blue light from screens keeps the brain awake. Third, avoid coffee after four o'clock in the afternoon, since caffeine stays in the body for many hours.`;
const listening8 = {
  code: 'GE-C8L', testType: 'LISTENING', title: 'Listening 008 · An animal shelter and sleep', timeLimitMin: 18, difficulty: 4, topic: 'Volunteering and health',
  instructions: 'Two sections and 10 questions. Press Play to hear each section. You can listen twice. Read the questions before you listen.',
  audioScript: JSON.stringify({ 1: L8A, 2: L8B }),
  sections: [
    { number: 1, description: 'A radio interview with a volunteer', groups: [{ type: 'MULTIPLE_CHOICE', instruction: MC3(1, 5), questions: [
      mc('Why did Nadia never have a pet?', ['Her parents were allergic', 'There was no space', 'Pets were too expensive'], 'A', '"my parents were allergic"', ['my parents were allergic']),
      mc('How did she find out about the shelter?', ['From an advert', 'A friend told her', 'From school'], 'B', '"A friend told me about the shelter"', ['A friend told me about the shelter']),
      mc('What does she mainly do at the shelter?', ['Train the dogs', 'Clean the cages and feed the dogs', 'Take photographs'], 'B', '"Mostly I clean the cages and feed the dogs."', ['Mostly I clean the cages and feed the dogs']),
      mc('What does she enjoy most?', ['Helping the nervous animals', 'Playing with the dogs', 'Talking to visitors'], 'A', '"The part I enjoy most is helping the nervous animals."', ['The part I enjoy most is helping the nervous animals']),
      mc('What is the hardest part for her?', ['Getting up early', 'Saying goodbye when an animal is adopted', 'Cleaning the cages'], 'B', '"The hardest thing is saying goodbye when an animal is adopted."', ['saying goodbye when an animal is adopted']),
    ] }] },
    { number: 2, description: 'A talk about sleep for students', groups: [{ type: 'SENTENCE_COMPLETION', instruction: SCL(6, 10), wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
      sc('Most adults need between seven and ________ hours of sleep.', '9|NINE', '"between seven and nine hours"', ['between seven and nine hours']),
      sc('Students often get less than ________ hours of sleep.', '6|SIX', '"less than six"', ['less than six']),
      sc('Sleep is when the brain ________ what you have learned.', 'STORES', '"the brain stores what you have learned"', ['the brain stores what you have learned']),
      sc('Stop using your phone at least ________ before bed.', 'AN HOUR|1 HOUR|ONE HOUR|HOUR', '"at least an hour before bed"', ['at least an hour before bed']),
      sc('Avoid coffee after ________ o\'clock in the afternoon.', '4|FOUR', '"avoid coffee after four o\'clock"', ['avoid coffee after four o\'clock']),
    ] }] },
  ],
};

const L9A = `Narrator: Section one. You will hear a student, Ravi, talking to his tutor about his research project. Questions 1 to 5.
Tutor: Come in, Ravi. How is the project going?
Ravi: Not bad, but I've changed my topic. I was going to write about solar energy, but there is so much material that I couldn't narrow it down. So I've decided to focus on wind power in coastal areas instead.
Tutor: That sounds more manageable. Have you started the survey?
Ravi: I'd planned to interview fifty residents, but I only managed to talk to thirty-five. Most people were happy to answer, though.
Tutor: Thirty-five is acceptable as long as you explain that in your methods section. What about the deadline?
Ravi: It's the fifteenth of April, isn't it?
Tutor: Actually, it was moved a week later because of the holiday, so it's the twenty-second.
Ravi: Oh, thank you. I'd have missed it. One more thing. Should I include my interview questions in the main text?
Tutor: No, put them in an appendix at the end. The main text is for your analysis.`;
const L9B = `Narrator: Section two. You will hear a lecture about urban farming. Questions 6 to 10.
Lecturer: By 2050, nearly seventy per cent of the world's population is expected to live in cities, so finding ways to produce food close to consumers has become a priority. One approach is vertical farming, in which crops are grown in stacked layers inside a building. Because the plants receive artificial light and are fed through water rather than soil, they use up to ninety per cent less water than traditional fields. The main disadvantage is cost: the electricity needed for lighting accounts for nearly a third of the expenses. For this reason, most vertical farms currently grow leafy vegetables, which are light and grow quickly, rather than crops such as wheat. Some cities are also experimenting with rooftop gardens, where unused space on buildings is turned into small farms.`;
const listening9 = {
  code: 'GE-C9L', testType: 'LISTENING', title: 'Listening 009 · A research project and urban farming', timeLimitMin: 20, difficulty: 5, topic: 'Study and science',
  instructions: 'Two sections and 10 questions. Press Play to hear each section. You can listen twice. Read the questions before you listen.',
  audioScript: JSON.stringify({ 1: L9A, 2: L9B }),
  sections: [
    { number: 1, description: 'A student talks to his tutor', groups: [{ type: 'MULTIPLE_CHOICE', instruction: MC3(1, 5), questions: [
      mc('What is the new topic of Ravi\'s project?', ['Solar energy', 'Wind power in coastal areas', 'Water power'], 'B', '"wind power in coastal areas"', ['wind power in coastal areas']),
      mc('Why did he change his topic?', ['There was too much material', 'He had no books', 'His tutor told him to'], 'A', '"there is so much material that I couldn\'t narrow it down"', ['there is so much material that I couldn\'t narrow it down']),
      mc('How many residents did he interview?', ['15', '35', '50'], 'B', '"I only managed to talk to thirty-five."', ['I only managed to talk to thirty-five']),
      mc('What is the deadline now?', ['15 April', '22 April', '29 April'], 'B', '"it\'s the twenty-second"', ['it\'s the twenty-second']),
      mc('Where should he put his interview questions?', ['In the main text', 'In the methods section', 'In an appendix'], 'C', '"put them in an appendix at the end"', ['put them in an appendix at the end']),
    ] }] },
    { number: 2, description: 'A lecture about urban farming', groups: [{ type: 'SENTENCE_COMPLETION', instruction: SCL(6, 10), wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
      sc('By 2050, about ________ per cent of people will live in cities.', '70|SEVENTY', '"nearly seventy per cent"', ['nearly seventy per cent']),
      sc('In vertical farming, crops are grown in stacked ________ inside a building.', 'LAYERS', '"stacked layers inside a building"', ['stacked layers inside a building']),
      sc('The plants are fed through ________ rather than soil.', 'WATER', '"fed through water rather than soil"', ['fed through water rather than soil']),
      sc('Lighting accounts for nearly a ________ of the expenses.', 'THIRD|1/3', '"nearly a third of the expenses"', ['nearly a third of the expenses']),
      sc('Most vertical farms grow ________ vegetables.', 'LEAFY', '"grow leafy vegetables"', ['grow leafy vegetables']),
    ] }] },
  ],
};

const NEW_PAPERS = [
  reading5, reading6, reading7, reading8, reading9,
  writing5, writing6, writing7, writing8, writing9,
  // Listening 005 to 009 are kept here but not loaded: listening papers go live only with real audio.
];
const LISTENING_DRAFTS = [listening5, listening6, listening7, listening8, listening9];

module.exports = { NEW_PAPERS, LISTENING_DRAFTS };
