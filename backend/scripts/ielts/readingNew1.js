// IELTS Reading (new) 1: coffee, disappearing languages, vertical farms. 40 questions, 60 minutes. Original content.
const { mc, tf, sc, I, PARA5 } = require('./kit');

const P1 = `[A] According to a popular legend, coffee was discovered in Ethiopia more than a thousand years ago by a goat herder called Kaldi. He noticed that his goats became unusually lively after eating red berries from a certain bush. Curious, he tried the berries himself and felt full of energy. Whether or not the story is true, historians agree that the coffee plant grew wild in the forests of Ethiopia long before people learned to drink it.

[B] The first clear evidence of coffee drinking comes from Yemen in the fifteenth century. There, religious scholars drank it to stay awake during night-time prayers. From Yemen, coffee spread quickly to Mecca, Cairo and Istanbul, where the first coffee houses opened. These became important places for conversation, music and business, and they were sometimes called "schools of the wise".

[C] For many years, Yemen controlled the trade, and coffee beans were usually boiled or roasted before being exported so that they could not be planted elsewhere. However, in the seventeenth century, a traveller is said to have carried seven seeds secretly to India. Soon afterwards, Dutch traders began growing coffee on the island of Java, and by the eighteenth century coffee plantations had appeared across the Caribbean and South America.

[D] Today, Brazil is by far the largest producer, growing around a third of the world's coffee. Vietnam is second, followed by Colombia and Indonesia. Most coffee is grown on small farms of less than five hectares, and around 25 million farming families depend on it for their income. Prices, however, can change sharply from year to year, which makes life difficult for small farmers.

[E] Coffee now faces a serious threat from climate change. The plants grow best within a narrow range of temperatures, and rising heat, drought and new diseases are already reducing harvests in some regions. Scientists warn that by 2050 the area suitable for growing coffee could fall by half. In response, researchers are developing new varieties that can survive hotter conditions, and some farmers are planting trees to give their coffee plants shade.`;

const P2 = `[A] There are about 7,000 languages spoken in the world today, but they are not shared equally. Just 23 languages, including Mandarin, Spanish and English, are spoken by more than half of the world's population. At the other extreme, around 40% of all languages have fewer than 1,000 speakers. Linguists estimate that one language disappears roughly every few months.

[B] Languages rarely die suddenly. More often, the process takes several generations. Parents who speak a minority language may decide that their children will have better chances in life if they speak the national language instead. The children may understand their grandparents but answer them in a different language. Eventually, a generation grows up that cannot speak the old language at all. According to the linguist Dr Maria Ortega, "A language is in danger as soon as children stop learning it at home."

[C] Why does it matter if a language disappears? Professor Kenji Sato argues that each language contains knowledge that may exist nowhere else. Many indigenous languages, for example, have detailed words for local plants, animals and weather patterns, and this knowledge can be useful for medicine and environmental protection. Others point out that language is closely connected to identity, and losing it can make communities feel cut off from their history.

[D] Fortunately, some languages have been brought back from the edge. The best-known example is Hebrew, which was used mainly for religious purposes for centuries before becoming the everyday language of millions of people. In New Zealand, the Maori language was declining in the 1970s, but "language nests", where young children spend the day with fluent elderly speakers, have helped to increase the number of young speakers.

[E] Technology is also playing a role. Dr Amina Bello, who works with communities in West Africa, records elderly speakers telling stories and singing songs, and these recordings are stored in online archives. Some communities have even created mobile apps to teach their languages. However, Dr Bello warns that technology alone cannot save a language. "Recordings are like photographs," she says. "They remember a language, but only people can keep it alive."`;

const P3 = `[A] By 2050, the world's population is expected to reach almost ten billion, and around two thirds of people will live in cities. Feeding them will be a major challenge, because good farmland is limited and much of it is already in use. One possible solution is vertical farming: growing crops indoors in tall buildings, with plants stacked on shelves one above the other.

[B] Vertical farms do not use soil. Instead, most use a method called hydroponics, in which plant roots sit in water that contains all the nutrients the plants need. Special LED lights replace the sun, and computers control the temperature, humidity and light for each crop. Because the conditions are perfect all year round, farmers can harvest crops such as lettuce up to twelve times a year, compared with two or three times on a traditional farm.

[C] Supporters say the method has many environmental benefits. Vertical farms use up to 95% less water than ordinary farms, because the water is collected and used again. As the plants are grown indoors, there is no need for chemical pesticides. In addition, farms can be built close to supermarkets in the city centre, so food travels a much shorter distance and arrives fresher.

[D] However, vertical farming also has serious problems. The biggest is the cost of energy. The LED lights and air-conditioning systems use large amounts of electricity, and if that electricity comes from coal or gas, the farm may actually produce more carbon emissions than a traditional one. Building and equipping a vertical farm is also very expensive, and several large companies have closed in recent years after failing to make a profit.

[E] For now, vertical farms mainly grow leafy vegetables and herbs, which grow quickly and sell for a high price. Crops such as rice, wheat and potatoes, which provide most of the world's calories, need too much space and light to be grown this way at a reasonable cost. Most experts therefore believe that vertical farming will not replace traditional agriculture but will become one part of a wider food system, especially in crowded cities with little land.`;

const PAPER = {
  code: 'IR-NEW-01', testType: 'READING', title: 'IELTS Reading (new)', timeLimitMin: 60, difficulty: 3, topic: 'Coffee, languages and vertical farms',
  instructions: 'Three passages and 40 questions. Passage 1: questions 1 to 13. Passage 2: questions 14 to 26. Passage 3: questions 27 to 40. You have 60 minutes.',
  passages: [
    { title: 'The journey of coffee', text: P1, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.HEAD(1, 5), questions: [
        mc('Paragraph A', ['A danger to future harvests', 'A story about the origin of coffee', 'Where coffee is grown today', 'How coffee left the Middle East', 'The rise of coffee houses', 'Why coffee prices rise in winter'], 'B', 'Paragraph A tells the legend of Kaldi and his goats.', ['According to a popular legend, coffee was discovered in Ethiopia']),
        mc('Paragraph B', ['A danger to future harvests', 'A story about the origin of coffee', 'Where coffee is grown today', 'How coffee left the Middle East', 'The rise of coffee houses', 'Why coffee prices rise in winter'], 'E', 'Paragraph B describes the first coffee houses in Mecca, Cairo and Istanbul.', ['where the first coffee houses opened']),
        mc('Paragraph C', ['A danger to future harvests', 'A story about the origin of coffee', 'Where coffee is grown today', 'How coffee left the Middle East', 'The rise of coffee houses', 'Why coffee prices rise in winter'], 'D', 'Paragraph C explains how seeds reached India, Java and the Americas.', ['a traveller is said to have carried seven seeds secretly to India']),
        mc('Paragraph D', ['A danger to future harvests', 'A story about the origin of coffee', 'Where coffee is grown today', 'How coffee left the Middle East', 'The rise of coffee houses', 'Why coffee prices rise in winter'], 'C', 'Paragraph D lists the main producing countries today.', ['Today, Brazil is by far the largest producer']),
        mc('Paragraph E', ['A danger to future harvests', 'A story about the origin of coffee', 'Where coffee is grown today', 'How coffee left the Middle East', 'The rise of coffee houses', 'Why coffee prices rise in winter'], 'A', 'Paragraph E is about climate change reducing harvests.', ['Coffee now faces a serious threat from climate change']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(6, 10), questions: [
        tf('Historians are certain that the story of Kaldi is true.', 'FALSE', 'The text says "Whether or not the story is true", so historians are not certain.', ['Whether or not the story is true']),
        tf('In Yemen, coffee was first drunk to help people stay awake.', 'TRUE', '"religious scholars drank it to stay awake during night-time prayers"', ['religious scholars drank it to stay awake during night-time prayers']),
        tf('Coffee beans were often boiled or roasted before export to stop them being planted.', 'TRUE', '"boiled or roasted before being exported so that they could not be planted elsewhere"', ['coffee beans were usually boiled or roasted before being exported so that they could not be planted elsewhere']),
        tf('Coffee from Vietnam is more expensive than coffee from Brazil.', 'NOT GIVEN', 'The passage gives Vietnam\'s position as a producer but says nothing about its price.'),
        tf('Most coffee is grown on very large farms.', 'FALSE', '"Most coffee is grown on small farms of less than five hectares"', ['Most coffee is grown on small farms of less than five hectares']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SUM(11, 13), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Summary: Coffee plants need a narrow range of temperatures. Heat, drought and new ________ are already reducing harvests.', 'DISEASES', '"rising heat, drought and new diseases are already reducing harvests"', ['rising heat, drought and new diseases are already reducing harvests']),
        sc('By 2050, the area suitable for coffee could fall by ________.', 'HALF', '"could fall by half"', ['the area suitable for growing coffee could fall by half']),
        sc('Some farmers are planting trees to give their coffee plants ________.', 'SHADE', '"planting trees to give their coffee plants shade"', ['some farmers are planting trees to give their coffee plants shade']),
      ] },
    ] },
    { title: 'Why languages disappear', text: P2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.FEAT(14, 18, 'C') + ' A: Dr Maria Ortega. B: Professor Kenji Sato. C: Dr Amina Bello.', questions: [
        mc('Recordings cannot replace living speakers.', ['Dr Maria Ortega', 'Professor Kenji Sato', 'Dr Amina Bello'], 'C', 'Dr Bello: "only people can keep it alive."', ['They remember a language, but only people can keep it alive']),
        mc('A language is at risk when it is no longer passed on to children.', ['Dr Maria Ortega', 'Professor Kenji Sato', 'Dr Amina Bello'], 'A', 'Dr Ortega: "A language is in danger as soon as children stop learning it at home."', ['A language is in danger as soon as children stop learning it at home']),
        mc('Some languages hold knowledge found in no other language.', ['Dr Maria Ortega', 'Professor Kenji Sato', 'Dr Amina Bello'], 'B', 'Professor Sato argues each language "contains knowledge that may exist nowhere else".', ['each language contains knowledge that may exist nowhere else']),
        mc('This person stores stories and songs in online archives.', ['Dr Maria Ortega', 'Professor Kenji Sato', 'Dr Amina Bello'], 'C', 'Dr Bello records stories and songs that "are stored in online archives".', ['these recordings are stored in online archives']),
        mc('Local words for plants and animals can help medicine.', ['Dr Maria Ortega', 'Professor Kenji Sato', 'Dr Amina Bello'], 'B', 'Professor Sato: this knowledge "can be useful for medicine and environmental protection".', ['this knowledge can be useful for medicine and environmental protection']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SA(19, 22), wordLimit: 'NO MORE THAN TWO WORDS', questions: [
        sc('About what percentage of languages have fewer than 1,000 speakers? (write a number)', '40%|40|40 PERCENT|40 PER CENT', '"around 40% of all languages have fewer than 1,000 speakers"', ['around 40% of all languages have fewer than 1,000 speakers']),
        sc('Which language was used mainly for religious purposes for centuries?', 'HEBREW', '"Hebrew, which was used mainly for religious purposes for centuries"', ['Hebrew, which was used mainly for religious purposes for centuries']),
        sc('In New Zealand, what are the places called where children spend the day with elderly speakers?', 'LANGUAGE NESTS', '"language nests", where young children spend the day with fluent elderly speakers', ['"language nests", where young children spend the day with fluent elderly speakers']),
        sc('What have some communities created to teach their languages?', 'MOBILE APPS|APPS', '"Some communities have even created mobile apps to teach their languages."', ['Some communities have even created mobile apps to teach their languages']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(23, 26), questions: [
        mc('How many languages are spoken by more than half of the world\'s population?', ['7', '23', '1,000', '7,000'], 'B', '"Just 23 languages ... are spoken by more than half of the world\'s population."', ["Just 23 languages, including Mandarin, Spanish and English, are spoken by more than half of the world's population"]),
        mc('According to paragraph B, why do some parents stop using a minority language with their children?', ['They have forgotten it', 'They think the national language gives better chances', 'Schools do not allow it', 'The grandparents ask them to'], 'B', '"their children will have better chances in life if they speak the national language instead"', ['their children will have better chances in life if they speak the national language instead']),
        mc('What other reason for saving languages is given in paragraph C?', ['They are easy to learn', 'They are good for tourism', 'Language is connected to identity', 'They help children pass exams'], 'C', '"language is closely connected to identity"', ['language is closely connected to identity']),
        mc('What does Dr Bello compare recordings to?', ['Books', 'Photographs', 'Museums', 'Songs'], 'B', '"Recordings are like photographs"', ['Recordings are like photographs']),
      ] },
    ] },
    { title: 'Farming in the sky', text: P3, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.PARA(27, 31), questions: [
        mc('A reason why some vertical farming companies have closed', PARA5, 'D', 'Paragraph D: "several large companies have closed in recent years after failing to make a profit".', ['several large companies have closed in recent years after failing to make a profit']),
        mc('A description of how plants are grown without soil', PARA5, 'B', 'Paragraph B explains hydroponics.', ['Vertical farms do not use soil']),
        mc('A prediction about the number of people living in cities', PARA5, 'A', 'Paragraph A: "around two thirds of people will live in cities".', ['around two thirds of people will live in cities']),
        mc('The types of crop that are not suitable for vertical farms', PARA5, 'E', 'Paragraph E: rice, wheat and potatoes need too much space and light.', ['Crops such as rice, wheat and potatoes, which provide most of the world\'s calories, need too much space and light']),
        mc('A benefit of growing food near where it is sold', PARA5, 'C', 'Paragraph C: farms near supermarkets mean food "arrives fresher".', ['so food travels a much shorter distance and arrives fresher']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(32, 35), questions: [
        mc('How many times a year can lettuce be harvested in a vertical farm?', ['Two or three', 'Up to five', 'Up to twelve', 'Every day'], 'C', '"up to twelve times a year"', ['harvest crops such as lettuce up to twelve times a year']),
        mc('Why do vertical farms use less water?', ['They grow fewer plants', 'The water is collected and used again', 'They use rain water only', 'Plants need no water indoors'], 'B', '"because the water is collected and used again"', ['because the water is collected and used again']),
        mc('What is the biggest problem with vertical farming?', ['Lack of workers', 'The cost of energy', 'Pests and insects', 'Poor-quality seeds'], 'B', '"The biggest is the cost of energy."', ['The biggest is the cost of energy']),
        mc('What do most experts believe about vertical farming?', ['It will replace traditional farming', 'It will fail completely', 'It will be one part of a wider food system', 'It will mainly grow rice'], 'C', '"will become one part of a wider food system"', ['will not replace traditional agriculture but will become one part of a wider food system']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SUM(36, 40), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Summary: In vertical farms, special LED ________ replace the sun.', 'LIGHTS', '"Special LED lights replace the sun"', ['Special LED lights replace the sun']),
        sc('________ control the temperature, humidity and light for each crop.', 'COMPUTERS', '"computers control the temperature, humidity and light"', ['computers control the temperature, humidity and light for each crop']),
        sc('Because plants are indoors, there is no need for chemical ________.', 'PESTICIDES', '"there is no need for chemical pesticides"', ['there is no need for chemical pesticides']),
        sc('If the electricity comes from coal or gas, the farm may produce more carbon ________ than a traditional farm.', 'EMISSIONS', '"produce more carbon emissions than a traditional one"', ['the farm may actually produce more carbon emissions than a traditional one']),
        sc('Vertical farms mainly grow leafy vegetables and ________.', 'HERBS', '"mainly grow leafy vegetables and herbs"', ['vertical farms mainly grow leafy vegetables and herbs']),
      ] },
    ] },
  ],
};

module.exports = { PAPER };
