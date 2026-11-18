// IELTS Reading (new) 2: the bicycle, bees, habits. 40 questions, 60 minutes. Original content.
const { mc, tf, sc, I, PARA5 } = require('./kit');

const P1 = `[A] The first machine that looked like a bicycle was built in Germany in 1817 by Karl von Drais. It had two wooden wheels and a seat, but no pedals. Riders sat on it and pushed themselves along the ground with their feet. It was called the "running machine", and for a short time it was fashionable among wealthy young men. However, it was heavy, uncomfortable and dangerous on rough roads, and interest soon faded.

[B] In the 1860s, French inventors added pedals to the front wheel. To travel faster, later designers made the front wheel larger and larger, until some were over 1.5 metres high. These "penny-farthing" bicycles were fast, but riders sat so high that falls were common and often serious. As a result, cycling was seen mainly as a sport for brave young men rather than as a practical way to travel.

[C] Everything changed in 1885, when John Kemp Starley in England produced the "safety bicycle". It had two wheels of the same size and a chain that connected the pedals to the back wheel. A few years later, air-filled rubber tyres made the ride far more comfortable. The safety bicycle was cheaper, easier to ride and much less dangerous, and millions were sold in the 1890s.

[D] The bicycle had a surprisingly large effect on society. For the first time, ordinary working people could travel several kilometres to work without paying for transport. It also gave women new freedom. Women cyclists needed more practical clothes than long, heavy skirts, and some historians believe cycling helped to change attitudes towards women's independence.

[E] Today, there are estimated to be more than a billion bicycles in the world. In cities such as Amsterdam and Copenhagen, more people travel to work by bicycle than by car. Many governments now build special cycle lanes, because cycling reduces traffic, improves health and produces no pollution. Electric bicycles, which help riders on hills and longer journeys, are now one of the fastest-growing types of transport.`;

const P2 = `[A] Bees are among the most important insects on Earth. As they move from flower to flower collecting nectar, they carry pollen, which allows plants to produce fruit and seeds. This process is called pollination. Around three quarters of the world's main food crops, including apples, almonds, coffee and tomatoes, depend at least partly on insects such as bees. Without them, our diets would be much less varied.

[B] Most people think of the honeybee, which lives in large colonies and makes honey. In fact, there are more than 20,000 species of bee, and most of them live alone rather than in groups. Many wild bees are better pollinators than honeybees for certain plants. The bumblebee, for example, can shake pollen loose from tomato flowers by vibrating its body, something honeybees cannot do.

[C] Unfortunately, bee populations are falling in many parts of the world. In some countries, beekeepers lose a third of their colonies each winter. Scientists believe there are several causes. Large farms that grow only one crop provide food for just a few weeks each year. Certain chemicals used to kill insect pests can also harm bees, affecting their ability to find their way back to the nest. Diseases and parasites, such as the varroa mite, add to the pressure.

[D] Some farmers have found creative solutions. In parts of China, where wild bees have almost disappeared, workers pollinate fruit trees by hand using small brushes. This is slow and expensive: a person can pollinate only a small number of trees each day. Other farmers rent colonies of honeybees, which are transported by lorry from farm to farm as different crops come into flower.

[E] There are also simple ways that ordinary people can help. Planting a variety of flowers that bloom at different times of the year gives bees food over a long period. Leaving a small area of a garden wild provides places for solitary bees to build nests. Some cities have even started keeping bees on the roofs of buildings. Experts stress, however, that protecting wild bees is just as important as keeping honeybees.`;

const P3 = `[A] Psychologists estimate that around 40% of the things we do each day are habits rather than conscious decisions. We brush our teeth, check our phones and take the same route to work without really thinking about it. Habits are useful because they save mental energy: if we had to think carefully about every small action, we would quickly become exhausted.

[B] According to the writer Charles Duhigg, every habit follows a loop with three parts. First, there is a cue, a signal that tells the brain to start the behaviour, such as feeling bored or seeing a phone. Next comes the routine, which is the behaviour itself. Finally, there is a reward, something pleasant that makes the brain want to repeat the loop in the future. Over time, the brain begins to expect the reward as soon as it notices the cue.

[C] How long does it take to form a new habit? A popular claim is 21 days, but research by Dr Phillippa Lally at University College London suggests that this is too simple. In her study, it took participants anywhere from 18 to 254 days to make a new behaviour automatic, with an average of 66 days. Simple habits, such as drinking a glass of water after breakfast, formed much faster than difficult ones, like doing fifty sit-ups.

[D] Breaking a bad habit is often harder than forming a good one. Experts say that simply trying to stop rarely works. A better strategy is to keep the same cue and reward but change the routine. For example, a person who eats sweets when they feel stressed at work could go for a short walk instead. Making a bad habit more difficult also helps, such as leaving a phone in another room while studying.

[E] The author James Clear suggests that small improvements matter more than big changes. He argues that getting just 1% better each day adds up to a remarkable difference over a year. Rather than setting a goal like "I will read more", people should create a clear plan, for instance "I will read two pages after dinner every evening". Linking a new habit to an existing one, a method he calls "habit stacking", makes it easier to remember.`;

const HEAD1 = ['The bicycle in the modern world', 'An early machine without pedals', 'A safer and more popular design', 'Why bicycles are expensive today', 'Fast but risky machines', 'Changes to everyday life and society'];

const PAPER = {
  code: 'IR-NEW-02', testType: 'READING', title: 'IELTS Reading (new)', timeLimitMin: 60, difficulty: 3, topic: 'Bicycles, bees and habits',
  instructions: 'Three passages and 40 questions. Passage 1: questions 1 to 13. Passage 2: questions 14 to 26. Passage 3: questions 27 to 40. You have 60 minutes.',
  passages: [
    { title: 'The story of the bicycle', text: P1, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.HEAD(1, 5), questions: [
        mc('Paragraph A', HEAD1, 'B', 'Paragraph A: the running machine had "no pedals".', ['It had two wooden wheels and a seat, but no pedals']),
        mc('Paragraph B', HEAD1, 'E', 'Paragraph B: penny-farthings "were fast, but ... falls were common".', ['These "penny-farthing" bicycles were fast, but riders sat so high that falls were common']),
        mc('Paragraph C', HEAD1, 'C', 'Paragraph C: the "safety bicycle" was cheaper, easier and much less dangerous.', ['The safety bicycle was cheaper, easier to ride and much less dangerous']),
        mc('Paragraph D', HEAD1, 'F', 'Paragraph D: "The bicycle had a surprisingly large effect on society."', ['The bicycle had a surprisingly large effect on society']),
        mc('Paragraph E', HEAD1, 'A', 'Paragraph E describes bicycles today.', ['Today, there are estimated to be more than a billion bicycles in the world']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(6, 9), questions: [
        tf('The running machine was popular for many decades.', 'FALSE', 'It was fashionable only "for a short time" and "interest soon faded".', ['for a short time it was fashionable among wealthy young men']),
        tf('The pedals of early French bicycles were attached to the front wheel.', 'TRUE', '"French inventors added pedals to the front wheel"', ['French inventors added pedals to the front wheel']),
        tf('John Kemp Starley became very rich from selling bicycles.', 'NOT GIVEN', 'The passage says millions were sold but nothing about Starley\'s money.'),
        tf('In Copenhagen, more people cycle to work than drive.', 'TRUE', '"more people travel to work by bicycle than by car"', ['more people travel to work by bicycle than by car']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SC(10, 13), wordLimit: 'ONE WORD ONLY', questions: [
        sc('The safety bicycle used a ________ to connect the pedals to the back wheel.', 'CHAIN', '"a chain that connected the pedals to the back wheel"', ['a chain that connected the pedals to the back wheel']),
        sc('Air-filled rubber ________ made riding much more comfortable.', 'TYRES|TIRES', '"air-filled rubber tyres made the ride far more comfortable"', ['air-filled rubber tyres made the ride far more comfortable']),
        sc('Cycling gave women new ________.', 'FREEDOM', '"It also gave women new freedom."', ['It also gave women new freedom']),
        sc('________ bicycles help riders on hills and longer journeys.', 'ELECTRIC', '"Electric bicycles, which help riders on hills and longer journeys"', ['Electric bicycles, which help riders on hills and longer journeys']),
      ] },
    ] },
    { title: 'Why bees matter', text: P2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.PARA(14, 18), questions: [
        mc('An example of people doing the work of bees', PARA5, 'D', 'Paragraph D: workers in China "pollinate fruit trees by hand".', ['workers pollinate fruit trees by hand using small brushes']),
        mc('A list of reasons why bees are declining', PARA5, 'C', 'Paragraph C: one-crop farms, chemicals, diseases and parasites.', ['Scientists believe there are several causes']),
        mc('The number of different kinds of bee', PARA5, 'B', 'Paragraph B: "more than 20,000 species of bee".', ['there are more than 20,000 species of bee']),
        mc('Ways that individuals can support bees', PARA5, 'E', 'Paragraph E: planting flowers and leaving part of the garden wild.', ['There are also simple ways that ordinary people can help']),
        mc('An explanation of the word "pollination"', PARA5, 'A', 'Paragraph A: "This process is called pollination."', ['This process is called pollination']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(19, 22), questions: [
        tf('Most species of bee live in large colonies.', 'FALSE', '"most of them live alone rather than in groups"', ['most of them live alone rather than in groups']),
        tf('Bumblebees can release pollen from tomato flowers by vibrating.', 'TRUE', '"can shake pollen loose from tomato flowers by vibrating its body"', ['can shake pollen loose from tomato flowers by vibrating its body']),
        tf('Honey from wild bees is healthier than honey from honeybees.', 'NOT GIVEN', 'The passage does not compare types of honey.'),
        tf('Some beekeepers lose a third of their colonies each winter.', 'TRUE', '"beekeepers lose a third of their colonies each winter"', ['beekeepers lose a third of their colonies each winter']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SUM(23, 26), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Summary: Large farms with only one crop give bees food for just a few ________ each year.', 'WEEKS', '"provide food for just a few weeks each year"', ['provide food for just a few weeks each year']),
        sc('Some chemicals affect bees\' ability to find their way back to the ________.', 'NEST', '"their ability to find their way back to the nest"', ['affecting their ability to find their way back to the nest']),
        sc('Hand pollination is slow and ________.', 'EXPENSIVE', '"This is slow and expensive"', ['This is slow and expensive']),
        sc('Some farmers rent honeybee colonies, which are moved by ________ from farm to farm.', 'LORRY|TRUCK', '"transported by lorry from farm to farm"', ['which are transported by lorry from farm to farm']),
      ] },
    ] },
    { title: 'How habits work', text: P3, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.FEAT(27, 31, 'C') + ' A: Charles Duhigg. B: Dr Phillippa Lally. C: James Clear.', questions: [
        mc('Every habit has a cue, a routine and a reward.', ['Charles Duhigg', 'Dr Phillippa Lally', 'James Clear'], 'A', 'Duhigg: "every habit follows a loop with three parts".', ['According to the writer Charles Duhigg, every habit follows a loop with three parts']),
        mc('Small daily improvements can lead to a big change.', ['Charles Duhigg', 'Dr Phillippa Lally', 'James Clear'], 'C', 'Clear: "getting just 1% better each day adds up to a remarkable difference".', ['getting just 1% better each day adds up to a remarkable difference over a year']),
        mc('The time needed to form a habit varies a lot.', ['Charles Duhigg', 'Dr Phillippa Lally', 'James Clear'], 'B', 'Lally: "anywhere from 18 to 254 days".', ['it took participants anywhere from 18 to 254 days to make a new behaviour automatic']),
        mc('A new habit is easier to remember if you link it to an old one.', ['Charles Duhigg', 'Dr Phillippa Lally', 'James Clear'], 'C', 'Clear calls this "habit stacking".', ['Linking a new habit to an existing one, a method he calls "habit stacking"']),
        mc('The brain begins to expect a reward when it notices a cue.', ['Charles Duhigg', 'Dr Phillippa Lally', 'James Clear'], 'A', 'Paragraph B, Duhigg\'s habit loop.', ['the brain begins to expect the reward as soon as it notices the cue']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(32, 35), questions: [
        mc('Why are habits useful, according to paragraph A?', ['They make us happier', 'They save mental energy', 'They help us sleep', 'They make us more creative'], 'B', '"Habits are useful because they save mental energy"', ['Habits are useful because they save mental energy']),
        mc('What was the average time to form a habit in Dr Lally\'s study?', ['18 days', '21 days', '66 days', '254 days'], 'C', '"with an average of 66 days"', ['with an average of 66 days']),
        mc('What is the best way to break a bad habit?', ['Simply try to stop', 'Change the cue', 'Keep the cue and reward but change the routine', 'Remove the reward completely'], 'C', '"keep the same cue and reward but change the routine"', ['A better strategy is to keep the same cue and reward but change the routine']),
        mc('Which plan follows James Clear\'s advice?', ['I will read more', 'I will be healthier this year', 'I will read two pages after dinner every evening', 'I will never eat sweets'], 'C', 'His example is "I will read two pages after dinner every evening".', ['"I will read two pages after dinner every evening"']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SA(36, 40), wordLimit: 'NO MORE THAN TWO WORDS', questions: [
        sc('About what percentage of daily actions are habits? (write a number)', '40%|40|40 PERCENT|40 PER CENT', '"around 40% of the things we do each day are habits"', ['around 40% of the things we do each day are habits']),
        sc('What is the name for the signal that starts a habit?', 'CUE|A CUE', '"there is a cue, a signal that tells the brain to start"', ['there is a cue, a signal that tells the brain to start the behaviour']),
        sc('Where did Dr Lally do her research?', 'UNIVERSITY COLLEGE LONDON|UCL', '"Dr Phillippa Lally at University College London"', ['Dr Phillippa Lally at University College London']),
        sc('What could a stressed worker do instead of eating sweets?', 'SHORT WALK|A SHORT WALK|WALK', '"could go for a short walk instead"', ['could go for a short walk instead']),
        sc('Where should you leave your phone while studying?', 'ANOTHER ROOM', '"leaving a phone in another room while studying"', ['leaving a phone in another room while studying']),
      ] },
    ] },
  ],
};

module.exports = { PAPER };
