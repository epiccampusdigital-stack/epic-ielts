// IELTS Reading (new) 5: chocolate, desert solar power, AI in medicine. 40 questions, 60 minutes. Original content.
const { mc, tf, sc, I, PARA5 } = require('./kit');

const P1 = `[A] Chocolate comes from the seeds of the cacao tree, which grows in hot, wet regions close to the equator. The tree was first used by people in Central and South America more than 3,000 years ago. The Maya and later the Aztecs made a bitter drink from roasted cacao seeds mixed with water, chilli and spices. It was not sweet at all, and it was often drunk during religious ceremonies.

[B] Cacao seeds were so valuable to the Aztecs that they were used as money. Historical records show that a turkey could be bought for around a hundred seeds, while a tomato cost just one. Rulers stored huge quantities of seeds, and the emperor Montezuma is said to have drunk many cups of the cacao drink each day.

[C] Spanish explorers brought cacao to Europe in the sixteenth century. At first, Europeans did not enjoy the bitter taste, so they added sugar and sometimes cinnamon. The sweet drink became fashionable among the rich, and special chocolate houses opened in cities such as London and Amsterdam. For about two hundred years, however, chocolate was only a drink, and it remained too expensive for most people.

[D] The nineteenth century brought a series of important inventions. In 1828, a Dutch chemist, Coenraad van Houten, developed a press that separated cocoa butter from the seeds, producing a fine powder. In 1847, a British company made the first solid chocolate bar, and in 1875 two Swiss men added condensed milk to create milk chocolate. Factories could now produce chocolate cheaply, and it became a treat that ordinary people could afford.

[E] Today, around 70% of the world's cacao is grown in West Africa, mainly in Ivory Coast and Ghana, often on small family farms. Many farmers earn very little, and child labour remains a serious concern in some areas. In response, several organisations now certify chocolate that is produced under fair conditions, and an increasing number of consumers are choosing to buy it.`;

const P2 = `[A] Deserts receive more sunlight than almost anywhere else on Earth. It has been calculated that the sunlight falling on the world's deserts in just a few hours contains more energy than the whole of humanity uses in a year. For this reason, engineers have long seen deserts as ideal places to produce solar power.

[B] There are two main technologies. Photovoltaic panels, the type often seen on rooftops, turn sunlight directly into electricity. Concentrated solar power plants use thousands of mirrors to focus sunlight onto a tower or pipe, heating a liquid that produces steam to drive a turbine. An advantage of the second method is that the heat can be stored in tanks of melted salt, so electricity can still be produced for several hours after sunset.

[C] Several countries have already built huge desert solar farms. Morocco's Noor complex near the city of Ouarzazate is one of the largest concentrated solar power plants in the world and supplies electricity to more than a million people. In India, the Bhadla solar park in the Thar Desert covers an area of about 56 square kilometres, and China has built enormous solar farms in its western deserts.

[D] Deserts also present challenges. Sand and dust settle on the panels and reduce the amount of electricity they produce, so they must be cleaned regularly. Because water is scarce, some farms now use robots that clean the panels with soft brushes instead of water. Extreme heat can also lower the efficiency of panels. Another problem is distance: deserts are often far from the cities that need the power, so long and expensive transmission lines are required.

[E] Some scientists have noticed an unexpected benefit. The shade from solar panels reduces evaporation from the ground, and in some projects plants have begun to grow between the rows of panels. Farmers in parts of China now grow vegetables and keep sheep beneath them. Researchers believe that, if carefully planned, desert solar farms could produce both clean energy and food.`;

const P3 = `[A] Artificial intelligence, or AI, is already changing the way doctors work. AI systems learn by studying very large amounts of data, such as thousands of medical images, and finding patterns that can be difficult for humans to see. They can then use these patterns to make predictions about new patients, often in a matter of seconds.

[B] One of the most successful uses so far is in reading medical images. In a study led by Dr Sarah Chen, an AI system examined mammograms, the X-ray images used to check for breast cancer. The system made fewer mistakes than a single specialist, both missing fewer cancers and raising fewer false alarms. However, Dr Chen points out that the best results came when the AI and a human doctor worked together.

[C] AI may also help hospitals make better use of their time. Systems can predict which patients are likely to miss appointments, or which ones are at risk of becoming seriously ill, so that staff can act early. Professor Ravi Menon, who studies health systems, says that AI could reduce the time doctors spend on paperwork, which in some countries takes up almost half of their working day, allowing them to spend more time with patients.

[D] There are, however, important concerns. AI systems are only as good as the data they learn from. If most of that data comes from one group of people, the system may be less accurate for others. Dr Grace Owusu, an expert in medical ethics, warns that a skin cancer program trained mainly on images of light skin may perform poorly on patients with darker skin. Patient privacy is another worry, because AI needs access to large amounts of personal health information.

[E] Most experts agree that AI will not replace doctors in the near future. Medicine involves understanding a patient's situation, explaining difficult news and making decisions when information is incomplete, which machines cannot yet do well. As Professor Menon puts it, "AI will not replace doctors, but doctors who use AI may replace those who do not."`;

const HEAD = ['Where chocolate comes from today', 'An ancient drink', 'Seeds used as money', 'Why chocolate is good for health', 'Inventions that made chocolate cheap', 'A luxury drink in Europe'];
const PEOPLE = ['Dr Sarah Chen', 'Professor Ravi Menon', 'Dr Grace Owusu'];

const PAPER = {
  code: 'IR-NEW-05', testType: 'READING', title: 'IELTS Reading (new)', timeLimitMin: 60, difficulty: 3, topic: 'Chocolate, desert solar power and AI in medicine',
  instructions: 'Three passages and 40 questions. Passage 1: questions 1 to 13. Passage 2: questions 14 to 26. Passage 3: questions 27 to 40. You have 60 minutes.',
  passages: [
    { title: 'The story of chocolate', text: P1, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.HEAD(1, 5), questions: [
        mc('Paragraph A', HEAD, 'B', 'Paragraph A: the Maya and Aztecs made a bitter drink.', ['made a bitter drink from roasted cacao seeds']),
        mc('Paragraph B', HEAD, 'C', 'Paragraph B: "they were used as money".', ['Cacao seeds were so valuable to the Aztecs that they were used as money']),
        mc('Paragraph C', HEAD, 'F', 'Paragraph C: the sweet drink "became fashionable among the rich".', ['The sweet drink became fashionable among the rich']),
        mc('Paragraph D', HEAD, 'E', 'Paragraph D: inventions meant factories could produce chocolate cheaply.', ['Factories could now produce chocolate cheaply']),
        mc('Paragraph E', HEAD, 'A', 'Paragraph E: 70% of cacao is grown in West Africa.', ["around 70% of the world's cacao is grown in West Africa"]),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(6, 9), questions: [
        tf('The Aztec cacao drink was sweet.', 'FALSE', '"It was not sweet at all"', ['It was not sweet at all']),
        tf('A turkey cost more cacao seeds than a tomato.', 'TRUE', 'A turkey cost around a hundred seeds; a tomato cost one.', ['a turkey could be bought for around a hundred seeds, while a tomato cost just one']),
        tf('The first chocolate house in London opened in 1650.', 'NOT GIVEN', 'Chocolate houses in London are mentioned, but no date is given.'),
        tf('For about two hundred years, chocolate in Europe was only a drink.', 'TRUE', '"For about two hundred years, however, chocolate was only a drink"', ['For about two hundred years, however, chocolate was only a drink']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SUM(10, 13), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Summary: The cacao tree grows in hot, wet regions close to the ________.', 'EQUATOR', '"close to the equator"', ['which grows in hot, wet regions close to the equator']),
        sc('Europeans added ________ and sometimes cinnamon to the drink.', 'SUGAR', '"they added sugar and sometimes cinnamon"', ['they added sugar and sometimes cinnamon']),
        sc('In 1828, van Houten developed a ________ that separated cocoa butter from the seeds.', 'PRESS', '"developed a press that separated cocoa butter"', ['developed a press that separated cocoa butter from the seeds']),
        sc('Milk chocolate was created by adding condensed milk in ________. (write a year)', '1875', '"in 1875 two Swiss men added condensed milk"', ['in 1875 two Swiss men added condensed milk']),
      ] },
    ] },
    { title: 'Power from the desert sun', text: P2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.PARA(14, 18), questions: [
        mc('A way of cleaning panels without water', PARA5, 'D', 'Paragraph D: robots with soft brushes.', ['some farms now use robots that clean the panels with soft brushes instead of water']),
        mc('A claim about how much energy reaches deserts', PARA5, 'A', 'Paragraph A: a few hours of desert sunlight exceeds yearly human energy use.', ['contains more energy than the whole of humanity uses in a year']),
        mc('Examples of large solar farms in different countries', PARA5, 'C', 'Paragraph C: Morocco, India and China.', ["Several countries have already built huge desert solar farms"]),
        mc('An unexpected advantage for farming', PARA5, 'E', 'Paragraph E: vegetables and sheep beneath the panels.', ['Farmers in parts of China now grow vegetables and keep sheep beneath them']),
        mc('How electricity can be produced after dark', PARA5, 'B', 'Paragraph B: heat stored in melted salt.', ['the heat can be stored in tanks of melted salt']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(19, 22), questions: [
        mc('How do photovoltaic panels work?', ['They heat water to make steam', 'They turn sunlight directly into electricity', 'They store heat in salt', 'They use wind and sun together'], 'B', '"turn sunlight directly into electricity"', ['turn sunlight directly into electricity']),
        mc('How many people does the Noor complex supply with electricity?', ['About 56,000', 'About half a million', 'More than a million', 'About ten million'], 'C', '"supplies electricity to more than a million people"', ['supplies electricity to more than a million people']),
        mc('Why are long transmission lines needed?', ['Deserts are far from the cities that need power', 'Panels produce too much power', 'Sand damages short lines', 'Cities do not allow solar farms'], 'A', '"deserts are often far from the cities that need the power"', ['deserts are often far from the cities that need the power']),
        mc('What does the shade from panels reduce?', ['Wind', 'Evaporation from the ground', 'The number of sheep', 'Electricity production'], 'B', '"The shade from solar panels reduces evaporation from the ground"', ['The shade from solar panels reduces evaporation from the ground']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(23, 26), questions: [
        tf('Concentrated solar power plants use mirrors.', 'TRUE', '"use thousands of mirrors to focus sunlight"', ['use thousands of mirrors to focus sunlight']),
        tf('The Bhadla solar park is in the Thar Desert.', 'TRUE', '"the Bhadla solar park in the Thar Desert"', ['the Bhadla solar park in the Thar Desert']),
        tf('Extreme heat makes solar panels more efficient.', 'FALSE', '"Extreme heat can also lower the efficiency of panels."', ['Extreme heat can also lower the efficiency of panels']),
        tf('Solar electricity from deserts is cheaper than electricity from coal.', 'NOT GIVEN', 'Costs are not compared with coal.'),
      ] },
    ] },
    { title: 'Artificial intelligence in medicine', text: P3, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.FEAT(27, 31, 'C') + ' A: Dr Sarah Chen. B: Professor Ravi Menon. C: Dr Grace Owusu.', questions: [
        mc('AI could give doctors more time with patients.', PEOPLE, 'B', 'Menon: AI could reduce time on paperwork, "allowing them to spend more time with patients".', ['allowing them to spend more time with patients']),
        mc('A program may not work well for all skin colours.', PEOPLE, 'C', 'Owusu warns about a skin cancer program trained mainly on light skin.', ['a skin cancer program trained mainly on images of light skin may perform poorly on patients with darker skin']),
        mc('The best results come from AI and doctors working together.', PEOPLE, 'A', 'Chen: "the best results came when the AI and a human doctor worked together".', ['the best results came when the AI and a human doctor worked together']),
        mc('Doctors who use AI may replace doctors who do not.', PEOPLE, 'B', 'Menon\'s quote in paragraph E.', ['doctors who use AI may replace those who do not']),
        mc('An AI system made fewer mistakes than one specialist.', PEOPLE, 'A', 'Chen\'s study on mammograms.', ['The system made fewer mistakes than a single specialist']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(32, 35), questions: [
        tf('AI systems learn by studying large amounts of data.', 'TRUE', '"AI systems learn by studying very large amounts of data"', ['AI systems learn by studying very large amounts of data']),
        tf('In Dr Chen\'s study, the AI raised more false alarms than the specialist.', 'FALSE', 'It raised "fewer false alarms".', ['raising fewer false alarms']),
        tf('Most hospitals in Europe already use AI to read X-rays.', 'NOT GIVEN', 'The passage does not say how many hospitals use AI.'),
        tf('Experts think AI will replace doctors soon.', 'FALSE', '"AI will not replace doctors in the near future"', ['Most experts agree that AI will not replace doctors in the near future']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SA(36, 40), wordLimit: 'NO MORE THAN TWO WORDS', questions: [
        sc('What are the X-ray images used to check for breast cancer called?', 'MAMMOGRAMS', '"mammograms, the X-ray images used to check for breast cancer"', ['mammograms, the X-ray images used to check for breast cancer']),
        sc('What can AI predict that some patients are likely to miss?', 'APPOINTMENTS', '"which patients are likely to miss appointments"', ['which patients are likely to miss appointments']),
        sc('What takes up almost half of some doctors\' working day?', 'PAPERWORK', '"paperwork, which in some countries takes up almost half of their working day"', ['paperwork, which in some countries takes up almost half of their working day']),
        sc('Apart from accuracy, what other worry is mentioned in paragraph D?', 'PATIENT PRIVACY|PRIVACY', '"Patient privacy is another worry"', ['Patient privacy is another worry']),
        sc('According to paragraph E, what kind of news must doctors sometimes explain?', 'DIFFICULT NEWS|DIFFICULT', '"explaining difficult news"', ['explaining difficult news']),
      ] },
    ] },
  ],
};

module.exports = { PAPER };
