// Five harder General English papers (3 reading, 2 writing), about 40% harder than the earlier set:
// longer texts (430 to 480 words against about 300), 14 questions (against 10), paragraph matching and
// inference questions, and longer writing tasks. Stars: 3 = B1, 4 = B1+. All content is original.
// `ev` lists the exact words in the text that give each answer (stored as Question.evidence).

const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const tf = (content, answer, explanation, ev) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });
const MC = (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B, C or D.`;
const TF = (a, b) => `Questions ${a} to ${b}. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.`;
const SC = (a, b) => `Questions ${a} to ${b}. Complete the sentences. Write ONE WORD from the text for each answer.`;
const MATCH = (a, b, last) => `Questions ${a} to ${b}. Which paragraph contains the following information? Choose the correct paragraph, A to ${last}. You may use a letter more than once.`;
const PARA5 = ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E'];
const PARA6 = [...PARA5, 'Paragraph F'];

// ───────────── READING 1 (3 stars) ─────────────
const T1 = `[A] Many people believe that children learn languages more easily than adults. It is true that young children who move to a new country often speak like local people after a few years, while their parents may keep a strong accent all their lives. Because of this, many adults never try, believing they have simply started too late. However, researchers say this does not mean that adults cannot learn a new language well. In some ways, adults actually have important advantages.

[B] First, adults usually know why they are learning. A nurse who plans to work in Korea, for example, has a clear goal and a strong reason to study every day. Many adults also have more experience of studying and know which methods work best for them. Adults are also better at understanding grammar rules, because they can compare the new language with their first language. In one study, adults who studied Spanish for six months made faster progress than children who studied for the same length of time.

[C] Adults also face some problems. The biggest one is time. Most adults have jobs and families, so it is difficult to find a regular hour to practise. Another problem is fear of making mistakes. Children are happy to try new words, even when they are wrong, but adults often feel embarrassed and stay silent in class. Teachers say this is a pity, because speaking is the fastest way to improve. Some learners also give up after a few weeks, because progress at the beginning often feels very slow.

[D] So what is the best way for an adult to learn? Experts agree on a few simple ideas. Short, regular study is better than long, rare sessions: twenty minutes every day is more useful than three hours on Sunday. Learners should also use the language in real situations, such as ordering food, watching videos or talking to neighbours. Finally, it helps to learn whole phrases, not single words. "Could you help me?" is more useful than a long list of verbs. Reading simple stories and listening to songs can also help learners remember new words.

[E] Technology has made learning easier than ever before. Free apps can teach hundreds of new words, and video calls make it possible to practise with a teacher who lives in another country. Some apps even use games and points to keep learners interested. But most teachers warn that apps alone are not enough. To speak confidently, learners need to talk to real people, make mistakes and learn from them. As one teacher puts it, "Nobody learns to swim by reading about water."`;

const hard1 = {
  code: 'GE-C10R', testType: 'READING', title: 'Reading · Learning a language as an adult', timeLimitMin: 25, difficulty: 3, topic: 'Study and learning',
  instructions: 'One text with paragraphs A to E and 14 questions. Read the text, then answer the questions.',
  passages: [{ title: 'Is it too late to learn a language?', text: T1, groups: [
    { type: 'MULTIPLE_CHOICE', instruction: MATCH(1, 5, 'E'), questions: [
      mc('A comparison of how fast two groups of learners improved', PARA5, 'B', 'Paragraph B: adults "made faster progress than children".', ['made faster progress than children']),
      mc('Advice about how often to study', PARA5, 'D', 'Paragraph D: "twenty minutes every day is more useful than three hours on Sunday".', ['twenty minutes every day is more useful than three hours on Sunday']),
      mc('A reason why adults may not speak in class', PARA5, 'C', 'Paragraph C: adults "feel embarrassed and stay silent in class".', ['adults often feel embarrassed and stay silent in class']),
      mc('A warning about depending only on technology', PARA5, 'E', 'Paragraph E: "apps alone are not enough".', ['apps alone are not enough']),
      mc('A popular belief about children and languages', PARA5, 'A', 'Paragraph A: "Many people believe that children learn languages more easily than adults."', ['Many people believe that children learn languages more easily than adults']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(6, 9), questions: [
      tf('Young children who move abroad often speak like local people after a few years.', 'TRUE', '"young children who move to a new country often speak like local people after a few years"', ['young children who move to a new country often speak like local people after a few years']),
      tf('In the Spanish study, the children made faster progress than the adults.', 'FALSE', 'It was the adults who "made faster progress than children".', ['adults who studied Spanish for six months made faster progress than children']),
      tf('Most adults find it hard to practise at a regular time.', 'TRUE', '"Most adults have jobs and families, so it is difficult to find a regular hour to practise."', ['it is difficult to find a regular hour to practise']),
      tf('Free language apps are more popular with young people than with adults.', 'NOT GIVEN', 'The text does not compare who uses apps more.', []),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(10, 12), questions: [
      mc('Why are adults better at understanding grammar rules?', ['They have more free time', 'They can compare the new language with their first language', 'They are not afraid of mistakes', 'They use apps every day'], 'B', '"they can compare the new language with their first language"', ['they can compare the new language with their first language']),
      mc('What do teachers say about speaking?', ['It is less important than grammar', 'It is the fastest way to improve', 'It is easier for adults than for children', 'It should start after six months'], 'B', '"speaking is the fastest way to improve"', ['speaking is the fastest way to improve']),
      mc('What does the teacher mean by "Nobody learns to swim by reading about water"?', ['Swimming is a good hobby for learners', 'You must practise a language, not only study it', 'Reading is not useful for language learners', 'Learning a language is dangerous'], 'B', 'The paragraph says learners must "talk to real people, make mistakes and learn from them". Reading about swimming does not teach you to swim, in the same way.', ['learners need to talk to real people, make mistakes and learn from them']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(13, 14), wordLimit: 'ONE WORD', questions: [
      sc('Learners should use the language in ________ situations, such as ordering food.', 'REAL', '"use the language in real situations"', ['use the language in real situations']),
      sc('It helps to learn whole ________, not single words.', 'PHRASES', '"it helps to learn whole phrases, not single words"', ['it helps to learn whole phrases, not single words']),
    ] },
  ] }],
};

// ───────────── READING 2 (4 stars) ─────────────
const T2 = `Many of the world's cities are getting hotter, and not only because of climate change. Roads, roofs and car parks absorb the sun's energy during the day and release it slowly at night. As a result, the centre of a large city can be several degrees warmer than the countryside around it. Scientists call this the "urban heat island" effect.

High temperatures are more than uncomfortable. During heatwaves, hospitals see more patients with breathing and heart problems, and older people who live alone are at particular risk. Hot nights are especially harmful, because the body cannot recover while people sleep. Heat also increases the demand for air conditioning, which uses large amounts of electricity and pushes even more warm air into the streets. In some cities, the number of deaths rises sharply during long periods of extreme heat.

One of the cheapest ways to fight urban heat is to plant trees. A tree cools the air in two ways. Its leaves provide shade, and it releases water through tiny holes in its leaves, which cools the air around it in the same way that sweat cools the skin. Studies suggest that a street with a full line of trees can be up to five degrees cooler on a summer afternoon than a similar street without them. Trees also absorb some of the dust and smoke in the air, which makes the streets healthier.

Several cities have set ambitious targets. Melbourne in Australia plans to cover forty per cent of the city with trees by 2040, and Paris has promised to create "urban forests" near some of its most famous buildings. In Medellín, Colombia, a network of green corridors along roads and rivers was planted at relatively low cost, and local officials reported a clear fall in temperatures in the surrounding areas. Other cities, from Singapore to Milan, have started similar projects.

However, planting trees is not as simple as it sounds. Young trees need regular watering for their first few years, and many die because nobody looks after them. In crowded neighbourhoods there is often little space, as pipes and cables run beneath the pavement. Critics also point out that new trees are frequently planted in wealthier areas, while poorer districts, which are often the hottest, receive fewer.

For this reason, many experts argue that trees should be part of a wider plan. Painting roofs white to reflect sunlight, creating small parks and replacing car parks with green spaces can all help. As one city planner put it, "There is no single solution, but every degree we save can protect people's lives."`;

const hard2 = {
  code: 'GE-C11R', testType: 'READING', title: 'Reading · Cooling cities with trees', timeLimitMin: 25, difficulty: 4, topic: 'Cities and environment',
  instructions: 'One longer text and 14 questions. Read the text, then answer the questions.',
  passages: [{ title: 'Can trees cool our cities?', text: T2, groups: [
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(1, 5), questions: [
      tf('The centre of a large city can be warmer than the countryside around it.', 'TRUE', '"the centre of a large city can be several degrees warmer than the countryside around it"', ['the centre of a large city can be several degrees warmer than the countryside around it']),
      tf('Hot nights are less dangerous than hot days.', 'FALSE', '"Hot nights are especially harmful, because the body cannot recover while people sleep."', ['Hot nights are especially harmful']),
      tf('Air conditioning helps to make the streets cooler.', 'FALSE', 'It "pushes even more warm air into the streets".', ['pushes even more warm air into the streets']),
      tf('Paris has promised to create urban forests near some famous buildings.', 'TRUE', '"Paris has promised to create "urban forests" near some of its most famous buildings"', ['Paris has promised to create "urban forests" near some of its most famous buildings']),
      tf('The green corridors in Medellín were very expensive to plant.', 'FALSE', 'They were planted "at relatively low cost".', ['was planted at relatively low cost']),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(6, 11), questions: [
      mc('According to the text, how do trees cool the air?', ['By giving shade and releasing water through their leaves', 'By giving shade and absorbing heat at night', 'By blocking the wind and the rain', 'By reflecting sunlight from their branches'], 'A', '"Its leaves provide shade, and it releases water through tiny holes in its leaves"', ['Its leaves provide shade, and it releases water through tiny holes in its leaves']),
      mc('How much cooler can a street with a full line of trees be on a summer afternoon?', ['Up to two degrees', 'Up to five degrees', 'Up to ten degrees', 'Up to forty degrees'], 'B', '"up to five degrees cooler on a summer afternoon"', ['up to five degrees cooler on a summer afternoon']),
      mc('Which city plans to cover forty per cent of its area with trees?', ['Paris', 'Medellín', 'Melbourne', 'None of them'], 'C', '"Melbourne in Australia plans to cover forty per cent of the city with trees by 2040"', ['Melbourne in Australia plans to cover forty per cent of the city with trees by 2040']),
      mc('Why do many young trees die?', ['Pipes and cables damage their roots', 'Nobody looks after them', 'There is too much rain', 'People cut them down'], 'B', '"many die because nobody looks after them"', ['many die because nobody looks after them']),
      mc('What is the critics\' main point?', ['Trees cost too much money', 'More new trees go to wealthier areas than to poorer ones', 'Trees need too much water', 'Trees damage the pavement'], 'B', '"new trees are frequently planted in wealthier areas, while poorer districts ... receive fewer"', ['new trees are frequently planted in wealthier areas']),
      mc('What is the main idea of the last paragraph?', ['Trees alone are not enough, so cities need several solutions', 'Trees are useless in hot cities', 'White roofs are better than trees', 'City planners do not care about heat'], 'A', '"trees should be part of a wider plan" and "There is no single solution".', ['trees should be part of a wider plan']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(12, 14), wordLimit: 'ONE WORD', questions: [
      sc('Roads, roofs and car parks absorb the sun\'s ________ during the day.', 'ENERGY', '"absorb the sun\'s energy during the day"', ['absorb the sun\'s energy during the day']),
      sc('During heatwaves, older people who live ________ are at particular risk.', 'ALONE', '"older people who live alone are at particular risk"', ['older people who live alone are at particular risk']),
      sc('Roofs can be painted white to ________ sunlight.', 'REFLECT', '"Painting roofs white to reflect sunlight"', ['Painting roofs white to reflect sunlight']),
    ] },
  ] }],
};

// ───────────── READING 3 (4 stars) ─────────────
const T3 = `[A] South Korea is famous for its technology, its music and its fast economic growth. Less well known is a problem that worries many of its leaders: the country is running out of young workers. South Korea has one of the lowest birth rates in the world, with women having, on average, fewer than one child each. At the same time, people are living longer. In 2024, more than one in five South Koreans were aged sixty-five or over.

[B] The effects are already visible. In some rural areas, schools have closed because there are not enough children, and many farms are run by people in their seventies. Factories, shipyards and fishing companies report that they cannot find enough staff, especially for jobs that are physically demanding. Young Koreans, who are often highly educated, tend to prefer office work in big cities such as Seoul. Some companies have even raised wages, but they still struggle to attract local applicants.

[C] One response has been to invite workers from other countries. Since 2004, the Employment Permit System, known as the EPS, has allowed companies to hire workers from a group of partner countries, including Sri Lanka, Nepal, Vietnam and the Philippines. Applicants usually have to pass a Korean language test before they can be chosen, and they are employed in areas such as manufacturing, farming, fishing and construction.

[D] For many workers, the system offers real opportunities. Wages in Korea are often several times higher than at home, and the money that workers send back supports families and local economies. Some workers also gain skills and experience that help them start businesses when they return. Many say that the experience also changed the way they see the world. For Korean employers, foreign staff have become essential; some small factories say they could not continue without them.

[E] The system is not without problems, however. Workers usually cannot change employers freely, which critics say puts them in a weak position if conditions are poor. Language difficulties can lead to misunderstandings and even accidents at work, and some workers feel isolated, living far from cities and from people who share their culture. Human rights groups have called for better housing and stronger protection.

[F] The government is trying several approaches at once. It has increased the number of foreign workers allowed each year, created new visas for skilled workers, and offered money to couples who have children. Few experts believe that any single policy will solve the problem. What seems certain is that foreign workers will play a growing role in South Korea's future, and that learning Korean will remain the first step for anyone hoping to join them.`;

const hard3 = {
  code: 'GE-C12R', testType: 'READING', title: 'Reading · Why Korea needs foreign workers', timeLimitMin: 25, difficulty: 4, topic: 'Work and society',
  instructions: 'One text with paragraphs A to F and 14 questions. Read the text, then answer the questions.',
  passages: [{ title: 'A country running out of workers', text: T3, groups: [
    { type: 'MULTIPLE_CHOICE', instruction: MATCH(1, 6, 'F'), questions: [
      mc('Examples of the kinds of work that foreign workers do', PARA6, 'C', 'Paragraph C: "manufacturing, farming, fishing and construction".', ['manufacturing, farming, fishing and construction']),
      mc('A reason why young Koreans do not choose some jobs', PARA6, 'B', 'Paragraph B: they "tend to prefer office work in big cities".', ['tend to prefer office work in big cities such as Seoul']),
      mc('How workers\' earnings help their home countries', PARA6, 'D', 'Paragraph D: the money "supports families and local economies".', ['supports families and local economies']),
      mc('Figures that show the population is getting older', PARA6, 'A', 'Paragraph A: "more than one in five South Koreans were aged sixty-five or over".', ['more than one in five South Koreans were aged sixty-five or over']),
      mc('A limit on workers\' freedom', PARA6, 'E', 'Paragraph E: "Workers usually cannot change employers freely".', ['Workers usually cannot change employers freely']),
      mc('Several actions the government has taken', PARA6, 'F', 'Paragraph F: more workers, new visas and money for couples.', ['The government is trying several approaches at once']),
    ] },
    { type: 'TRUE_FALSE_NOT_GIVEN', instruction: TF(7, 10), questions: [
      tf('On average, women in South Korea have more than one child.', 'FALSE', 'Women have "fewer than one child each".', ['fewer than one child each']),
      tf('Some schools in rural areas of South Korea have closed.', 'TRUE', '"In some rural areas, schools have closed"', ['In some rural areas, schools have closed']),
      tf('Sri Lanka is one of the EPS partner countries.', 'TRUE', '"partner countries, including Sri Lanka"', ['partner countries, including Sri Lanka']),
      tf('Most foreign workers go home after three years in Korea.', 'NOT GIVEN', 'The text does not say how long workers stay.', []),
    ] },
    { type: 'MULTIPLE_CHOICE', instruction: MC(11, 12), questions: [
      mc('What do applicants usually have to do before they can be chosen?', ['Pass a Korean language test', 'Live in Seoul for a year', 'Start a business', 'Find a Korean partner'], 'A', '"Applicants usually have to pass a Korean language test before they can be chosen"', ['Applicants usually have to pass a Korean language test before they can be chosen']),
      mc('According to the writer, what seems certain about the future?', ['One policy will solve the problem', 'Foreign workers will play a growing role', 'The birth rate will rise quickly', 'Small factories will close'], 'B', '"foreign workers will play a growing role in South Korea\'s future"', ['foreign workers will play a growing role in South Korea\'s future']),
    ] },
    { type: 'SENTENCE_COMPLETION', instruction: SC(13, 14), wordLimit: 'ONE WORD', questions: [
      sc('Some workers gain skills that help them start ________ when they return home.', 'BUSINESSES', '"help them start businesses when they return"', ['help them start businesses when they return']),
      sc('Human rights groups have asked for better ________ and stronger protection.', 'HOUSING', '"called for better housing and stronger protection"', ['called for better housing and stronger protection']),
    ] },
  ] }],
};

// ───────────── WRITING ─────────────
const hard4 = {
  code: 'GE-C10W', testType: 'WRITING', title: 'Writing · A formal email and an opinion essay', timeLimitMin: 50, difficulty: 3, topic: 'Study abroad',
  instructions: 'Two tasks. Task 1 is a formal email. Task 2 is an opinion essay and carries more marks.',
  tasks: [
    { taskNumber: 1, minWords: 110, timeMinutes: 20, prompt: 'You are going to study at a university in Korea next March. You need a room in the student dormitory. Write an email to the dormitory office.\n\nIn your email:\n- say who you are and when you will arrive\n- ask about the types of rooms and the cost\n- ask two more questions (for example, about meals, the internet or rules)\n\nStart with "Dear Sir or Madam," and use a formal style. Write at least 110 words.' },
    { taskNumber: 2, minWords: 160, timeMinutes: 30, prompt: 'Some people say the best way to learn a language is to live in the country where it is spoken. Others think you can learn a language well in your own country.\n\nWhat is your opinion? Give reasons and examples from your own experience.\n\nWrite at least 160 words. Use paragraphs and linking words (for example: however, for instance, as a result).' },
  ],
};
const hard5 = {
  code: 'GE-C11W', testType: 'WRITING', title: 'Writing · A table report and a problem-solution essay', timeLimitMin: 60, difficulty: 4, topic: 'Reports and society',
  instructions: 'Two tasks, in the style of the IELTS Writing test. Task 2 carries more marks than Task 1.',
  tasks: [
    { taskNumber: 1, minWords: 150, timeMinutes: 20, prompt: 'The table shows how many hours per week students at one language school spent on different activities in 2020 and 2025.\n\nActivity | 2020 | 2025\nClasses with a teacher | 12 | 10\nStudying alone with books | 6 | 3\nUsing learning apps | 1 | 5\nSpeaking practice with others | 2 | 4\nWatching videos in the language | 3 | 6\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.' },
    { taskNumber: 2, minWords: 200, timeMinutes: 40, prompt: 'In many countries, the population is getting older and there are fewer young people to do the work.\n\nWhat problems does this cause? What solutions can you suggest?\n\nGive reasons for your answer and include relevant examples from your own knowledge or experience.\n\nWrite at least 200 words.' },
  ],
};

const HARD_PAPERS = [hard1, hard4, hard2, hard3, hard5];
module.exports = { HARD_PAPERS };
