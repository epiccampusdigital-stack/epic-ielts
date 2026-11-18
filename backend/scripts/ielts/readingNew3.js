// IELTS Reading (new) 3: the Silk Road, plastic in the ocean, online learning. 40 questions, 60 minutes. Original content.
const { mc, tf, sc, I, PARA5 } = require('./kit');

const P1 = `[A] The Silk Road was not a single road but a network of trade routes that connected China with Central Asia, the Middle East and Europe. It was used for more than 1,500 years, from around 130 BCE, when China's Han dynasty officially opened trade with the West, until the fifteenth century. The name "Silk Road" was only invented in 1877 by a German geographer, Ferdinand von Richthofen.

[B] Silk was the most famous product carried west. For centuries, only the Chinese knew how to make it, and they kept the method a closely guarded secret. Roman writers complained that wealthy citizens spent huge sums on silk clothing. Other goods travelled too: spices, tea and paper moved west, while horses, glass, gold and wool moved east.

[C] Few traders travelled the whole route. Instead, goods passed from merchant to merchant, and from city to city, with each one adding to the price. Travellers crossed some of the harshest landscapes on Earth, including the Taklamakan Desert and the Pamir Mountains. Camels, which can survive for days without water, were essential for the desert sections.

[D] The Silk Road carried ideas as well as goods. Buddhism spread from India to China along these routes, and later Islam spread into Central Asia. Knowledge of mathematics, medicine and astronomy passed between cultures. Inventions such as paper-making and printing, which began in China, eventually reached Europe, where they changed the way information was shared.

[E] Sadly, not everything that travelled was welcome. Historians believe that the Black Death, a disease that killed around a third of Europe's population in the fourteenth century, spread partly along trade routes from Asia. From the fifteenth century, as European ships began sailing directly to Asia, the overland routes became less important. Today, China's Belt and Road Initiative has revived interest in the old routes by investing in roads, railways and ports.`;

const P2 = `[A] Every year, around 11 million tonnes of plastic enter the world's oceans, and some studies suggest that the figure could almost triple by 2040. Plastic is popular because it is cheap, light and strong. Unfortunately, the same qualities make it a problem in the environment: it does not rot, and it can float for thousands of kilometres.

[B] Much of this plastic comes from land. It is carried by rivers, blown by the wind or washed away from beaches. One study found that just ten rivers, most of them in Asia and Africa, carry a large share of the plastic that reaches the sea. Fishing equipment is another major source. Lost or thrown-away nets, sometimes called "ghost nets", continue to catch fish, turtles and seabirds for years.

[C] Over time, sunlight and waves break plastic into smaller and smaller pieces. Pieces smaller than five millimetres are known as microplastics. They have been found everywhere, from the deepest ocean trenches to Arctic ice. Small sea creatures eat them by mistake, and they pass up the food chain to larger fish. Scientists are still studying what effect this has on human health.

[D] Large areas of floating rubbish have formed where ocean currents meet. The best known, the Great Pacific Garbage Patch, lies between Hawaii and California. Despite its name, it is not a solid island of plastic. Most of it consists of tiny pieces spread through the water, which makes it very difficult to clean up. Some organisations use long floating barriers to collect larger items, but critics argue that this deals with the problem too late.

[E] Most experts agree that the best solution is to stop plastic reaching the sea in the first place. More than 60 countries have introduced bans or taxes on plastic bags, and some have banned single-use items such as straws and cups. Better waste collection in fast-growing cities is also essential. In 2022, members of the United Nations agreed to work towards a global treaty to reduce plastic pollution, although countries still disagree about how strict it should be.`;

const P3 = `[A] Before 2020, online learning was growing steadily, but most students still studied in classrooms. Then, during the COVID-19 pandemic, schools in more than 180 countries closed their doors, and around 1.6 billion learners suddenly had to study from home. This huge, unplanned experiment gave researchers a rare chance to compare online and face-to-face education.

[B] The results were mixed. A review of studies by researcher Dr Hannah Reid found that, on average, students learned less during school closures than in a normal year, especially in mathematics. However, the losses were not equal. Students from poorer families, who often lacked a quiet place to study, a computer or a reliable internet connection, fell furthest behind.

[C] Online learning seems to work best for certain groups. Professor Daniel Okafor, who studies adult education, points out that adults who are working full-time often prefer online courses because they can study in the evening or at weekends. In his research, students who were already well-organised and motivated achieved similar results online and in class. Younger children, on the other hand, usually found it much harder to concentrate in front of a screen.

[D] Teachers also had to change the way they worked. Many discovered that long video lessons did not keep students' attention. Dr Lucia Ferreira, a specialist in teacher training, recommends breaking lessons into short videos of no more than ten minutes, followed by an activity or quiz. She also stresses that students need regular contact with the teacher, even if it is only a short message, to feel connected to the class.

[E] Today, many schools and universities use a mixture of the two approaches, known as blended learning. Students might watch a lecture online and then use class time for discussion and practice. Dr Reid believes this model can combine the flexibility of online study with the social benefits of the classroom. Most experts agree, however, that technology should support good teaching rather than replace it.`;

const HEAD = ['The spread of beliefs and knowledge', 'How goods were passed along the route', 'Why silk became cheap', 'The meaning and history of a name', 'The end of the old routes and a modern return', 'Products that travelled in both directions'];
const PEOPLE = ['Dr Hannah Reid', 'Professor Daniel Okafor', 'Dr Lucia Ferreira'];

const PAPER = {
  code: 'IR-NEW-03', testType: 'READING', title: 'IELTS Reading (new)', timeLimitMin: 60, difficulty: 3, topic: 'Trade, pollution and online learning',
  instructions: 'Three passages and 40 questions. Passage 1: questions 1 to 13. Passage 2: questions 14 to 26. Passage 3: questions 27 to 40. You have 60 minutes.',
  passages: [
    { title: 'The Silk Road', text: P1, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.HEAD(1, 5), questions: [
        mc('Paragraph A', HEAD, 'D', 'Paragraph A explains the routes and when the name "Silk Road" was invented.', ['The name "Silk Road" was only invented in 1877']),
        mc('Paragraph B', HEAD, 'F', 'Paragraph B: goods moved west and other goods moved east.', ['spices, tea and paper moved west, while horses, glass, gold and wool moved east']),
        mc('Paragraph C', HEAD, 'B', 'Paragraph C: "goods passed from merchant to merchant".', ['goods passed from merchant to merchant, and from city to city']),
        mc('Paragraph D', HEAD, 'A', 'Paragraph D: religions and knowledge spread.', ['The Silk Road carried ideas as well as goods']),
        mc('Paragraph E', HEAD, 'E', 'Paragraph E: routes became less important; the Belt and Road Initiative revived interest.', ['the overland routes became less important']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(6, 9), questions: [
        tf('The Silk Road was one long road.', 'FALSE', '"The Silk Road was not a single road but a network"', ['The Silk Road was not a single road but a network of trade routes']),
        tf('The Chinese kept the method of making silk secret for centuries.', 'TRUE', '"they kept the method a closely guarded secret"', ['they kept the method a closely guarded secret']),
        tf('Most traders travelled the whole route from China to Europe.', 'FALSE', '"Few traders travelled the whole route."', ['Few traders travelled the whole route']),
        tf('Silk was cheaper in Rome than in China.', 'NOT GIVEN', 'Roman citizens spent huge sums, but prices in the two places are not compared.'),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SC(10, 13), wordLimit: 'ONE WORD ONLY', questions: [
        sc('________ were essential for crossing the desert because they can go for days without water.', 'CAMELS', '"Camels, which can survive for days without water, were essential"', ['Camels, which can survive for days without water, were essential for the desert sections']),
        sc('Buddhism spread from ________ to China along the routes.', 'INDIA', '"Buddhism spread from India to China"', ['Buddhism spread from India to China along these routes']),
        sc('Paper-making and ________ began in China and later reached Europe.', 'PRINTING', '"Inventions such as paper-making and printing, which began in China"', ['Inventions such as paper-making and printing, which began in China']),
        sc('The Black Death killed about a ________ of Europe\'s population.', 'THIRD', '"killed around a third of Europe\'s population"', ["killed around a third of Europe's population"]),
      ] },
    ] },
    { title: 'Plastic in the ocean', text: P2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.PARA(14, 18), questions: [
        mc('A description of a well-known area of floating rubbish', PARA5, 'D', 'Paragraph D: the Great Pacific Garbage Patch.', ['The best known, the Great Pacific Garbage Patch, lies between Hawaii and California']),
        mc('A reference to an international agreement', PARA5, 'E', 'Paragraph E: a UN global treaty.', ['members of the United Nations agreed to work towards a global treaty to reduce plastic pollution']),
        mc('The places where microplastics have been found', PARA5, 'C', 'Paragraph C: from ocean trenches to Arctic ice.', ['from the deepest ocean trenches to Arctic ice']),
        mc('Fishing equipment that continues to harm sea life', PARA5, 'B', 'Paragraph B: "ghost nets".', ['Lost or thrown-away nets, sometimes called "ghost nets"']),
        mc('The reasons why plastic is so widely used', PARA5, 'A', 'Paragraph A: "it is cheap, light and strong".', ['Plastic is popular because it is cheap, light and strong']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(19, 22), questions: [
        mc('How much plastic enters the oceans each year?', ['About 5 million tonnes', 'About 11 million tonnes', 'About 33 million tonnes', 'About 60 million tonnes'], 'B', '"around 11 million tonnes of plastic enter the world\'s oceans"', ["around 11 million tonnes of plastic enter the world's oceans"]),
        mc('What size are microplastics?', ['Smaller than 5 millimetres', 'Smaller than 5 centimetres', 'Larger than 5 millimetres', 'About 1 metre'], 'A', '"Pieces smaller than five millimetres are known as microplastics."', ['Pieces smaller than five millimetres are known as microplastics']),
        mc('Why is the Great Pacific Garbage Patch hard to clean up?', ['It is too far from land', 'It is a solid island', 'Most of it is tiny pieces spread through the water', 'It moves too quickly'], 'C', '"Most of it consists of tiny pieces spread through the water, which makes it very difficult to clean up."', ['Most of it consists of tiny pieces spread through the water, which makes it very difficult to clean up']),
        mc('What do most experts think is the best solution?', ['Building more barriers', 'Stopping plastic from reaching the sea', 'Burning plastic on beaches', 'Making plastic heavier'], 'B', '"the best solution is to stop plastic reaching the sea in the first place"', ['the best solution is to stop plastic reaching the sea in the first place']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SUM(23, 26), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Summary: Plastic is a problem because it does not ________ and can float for thousands of kilometres.', 'ROT', '"it does not rot"', ['it does not rot, and it can float for thousands of kilometres']),
        sc('Much plastic is carried to the sea by ________, the wind or water from beaches.', 'RIVERS', '"It is carried by rivers"', ['It is carried by rivers, blown by the wind']),
        sc('Plastic is broken into small pieces by sunlight and ________.', 'WAVES', '"sunlight and waves break plastic into smaller and smaller pieces"', ['sunlight and waves break plastic into smaller and smaller pieces']),
        sc('More than 60 countries have introduced bans or ________ on plastic bags.', 'TAXES', '"bans or taxes on plastic bags"', ['More than 60 countries have introduced bans or taxes on plastic bags']),
      ] },
    ] },
    { title: 'Learning online', text: P3, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.FEAT(27, 31, 'C') + ' A: Dr Hannah Reid. B: Professor Daniel Okafor. C: Dr Lucia Ferreira.', questions: [
        mc('Online lessons should be divided into short parts.', PEOPLE, 'C', 'Dr Ferreira recommends short videos of no more than ten minutes.', ['recommends breaking lessons into short videos of no more than ten minutes']),
        mc('Blended learning can offer the best of both approaches.', PEOPLE, 'A', 'Dr Reid believes it can combine flexibility with social benefits.', ['Dr Reid believes this model can combine the flexibility of online study with the social benefits of the classroom']),
        mc('Working adults often like online courses because of the timing.', PEOPLE, 'B', 'Professor Okafor: they "can study in the evening or at weekends".', ['they can study in the evening or at weekends']),
        mc('Students learned less when schools were closed.', PEOPLE, 'A', 'Dr Reid\'s review: "students learned less during school closures".', ['students learned less during school closures than in a normal year']),
        mc('Students need regular contact with their teacher.', PEOPLE, 'C', 'Dr Ferreira "stresses that students need regular contact with the teacher".', ['She also stresses that students need regular contact with the teacher']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(32, 36), questions: [
        tf('Before 2020, most students studied in classrooms.', 'TRUE', '"most students still studied in classrooms"', ['most students still studied in classrooms']),
        tf('Schools in fewer than 100 countries closed during the pandemic.', 'FALSE', 'Schools closed "in more than 180 countries".', ['schools in more than 180 countries closed their doors']),
        tf('Students from poorer families fell furthest behind.', 'TRUE', '"Students from poorer families ... fell furthest behind."', ['fell furthest behind']),
        tf('Online exams are easier than exams in a classroom.', 'NOT GIVEN', 'The passage does not discuss exams.'),
        tf('Younger children usually found it easy to concentrate online.', 'FALSE', '"Younger children ... usually found it much harder to concentrate"', ['Younger children, on the other hand, usually found it much harder to concentrate in front of a screen']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SA(37, 40), wordLimit: 'NO MORE THAN TWO WORDS', questions: [
        sc('In which subject did students lose most learning, according to Dr Reid\'s review?', 'MATHEMATICS|MATHS|MATH', '"especially in mathematics"', ['especially in mathematics']),
        sc('How many learners had to study from home? (write a number)', '1.6 BILLION|1.6BILLION|1,600 MILLION', '"around 1.6 billion learners suddenly had to study from home"', ['around 1.6 billion learners suddenly had to study from home']),
        sc('What should follow each short video, according to Dr Ferreira? (write ONE answer)', 'ACTIVITY|AN ACTIVITY|QUIZ|A QUIZ', '"followed by an activity or quiz"', ['followed by an activity or quiz']),
        sc('What is the name for a mixture of online and classroom learning?', 'BLENDED LEARNING', '"known as blended learning"', ['known as blended learning']),
      ] },
    ] },
  ],
};

module.exports = { PAPER };
