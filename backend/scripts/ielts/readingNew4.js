// IELTS Reading (new) 4: the elevator, coral reefs, music and the brain. 40 questions, 60 minutes. Original content.
const { mc, tf, sc, I, PARA5 } = require('./kit');

const P1 = `[A] Simple lifting machines have existed for thousands of years. The ancient Romans used platforms pulled up by ropes to raise wild animals into the Colosseum, and in the Middle Ages, monasteries built on cliffs used baskets on ropes to bring up food and visitors. These early lifts were powered by people, animals or water, and they all had one serious weakness: if the rope broke, the platform fell.

[B] The solution came from an American mechanic, Elisha Otis. In 1854, at an exhibition in New York, he stood on a platform high above the crowd and ordered the only rope holding it to be cut. Instead of falling, the platform stopped after a few centimetres. Otis had invented a safety brake that locked into the sides of the lift shaft as soon as the rope lost tension. The demonstration impressed the public and gave people the confidence to travel in lifts.

[C] The first passenger lift using Otis's brake was installed in a shop in New York in 1857. It was powered by steam and moved at about 0.2 metres per second. Over the following decades, electric motors replaced steam, and lifts became faster, quieter and more reliable. Today, the fastest lifts, found in buildings in China, travel at more than 20 metres per second.

[D] The safe lift changed the shape of cities. Before it, buildings rarely had more than six floors, because people did not want to climb more stairs. The top floors were often the cheapest, as they were the hardest to reach. Once lifts were common, architects could design much taller buildings, and the highest floors became the most expensive, valued for their views and quiet. Combined with new steel frames, lifts made the modern skyscraper possible.

[E] Engineers are still finding ways to improve them. Very tall buildings need several lifts, which take up valuable space, so some companies are testing lifts that can move sideways as well as up and down, allowing several cars to share one shaft. Others are developing lighter cables made from carbon fibre, which could allow a single lift to travel more than a kilometre upwards.`;

const P2 = `[A] Coral reefs cover less than 1% of the ocean floor, yet they are home to around a quarter of all marine species. For this reason, they are often called the "rainforests of the sea". Although corals look like plants or rocks, they are actually animals. Each coral is made up of thousands of tiny creatures called polyps, which build hard skeletons of calcium carbonate that slowly grow into a reef.

[B] Most reef-building corals depend on a close partnership with tiny algae that live inside their bodies. The algae use sunlight to make food, which they share with the coral, and in return the coral gives them shelter. The algae also give corals their bright colours. This partnership explains why most reefs are found in clear, shallow, sunny water.

[C] Reefs are also extremely valuable to people. Around half a billion people depend on them for food, income or protection. Reefs act as natural barriers, reducing the force of waves during storms and protecting coastal towns. They also attract millions of tourists every year, and some medicines, including treatments for cancer, have been developed from substances found in reef animals.

[D] The greatest threat to reefs is rising sea temperatures. When the water becomes too warm, corals push out their algae and turn white, a process known as bleaching. Bleached corals are not dead, but if the water stays hot for too long, they starve. Australia's Great Barrier Reef has suffered several major bleaching events since 2016. Pollution from farms, overfishing and damage from boats add to the problem.

[E] Scientists are working on ways to help. Some are growing young corals in underwater "nurseries" and planting them on damaged reefs. Others are breeding corals that can survive warmer water. However, marine biologist Dr Karen Mills warns that these projects can only buy time. "Unless we reduce the emissions that are heating the planet," she says, "we are simply planting gardens in a house that is on fire."`;

const P3 = `[A] Every known human culture has music. Archaeologists have found flutes made from bird bones that are more than 40,000 years old, which suggests that music is one of the oldest human activities. Yet scientists have long wondered why it exists at all, since, unlike food or shelter, it does not seem necessary for survival.

[B] Brain scans have shown that listening to music activates many different areas of the brain at the same time. Areas linked to hearing, movement, memory and emotion all become active. When we hear a piece of music we love, the brain releases dopamine, a chemical connected to pleasure and reward. Interestingly, research by neuroscientist Dr Valorie Salimpoor found that dopamine is released not only at the best moment of a song but also in the seconds before it, as the listener waits for it.

[C] Music also seems to help memory. Many people can remember song lyrics from their childhood far more easily than facts they learned at school. Doctors working with patients who have memory loss have found that familiar songs can bring back memories and improve mood. Some patients who can no longer recognise family members are still able to sing every word of a song from their youth.

[D] Can music make us more intelligent? In the 1990s, a study suggested that listening to Mozart improved performance on certain tests, and the idea, known as the "Mozart effect", became very popular. However, later research found that the improvement was small and lasted only about fifteen minutes. Psychologist Professor Glenn Schellenberg argues that any music people enjoy can improve their mood and concentration for a short time, so the effect has nothing special to do with Mozart.

[E] Learning to play an instrument, however, may have longer-lasting benefits. Studies of children who take music lessons have found improvements in listening skills and, in some cases, in reading. Professor Nina Kraus, who studies how the brain processes sound, has shown that musicians are better at picking out speech in noisy places. She believes that musical training "tunes" the brain, making it more sensitive to sounds of all kinds.`;

const HEAD = ['A safety invention that won public trust', 'Early lifting machines and their weakness', 'Lifts of the future', 'How lifts changed buildings and property values', 'Why most people prefer stairs', 'From steam to high-speed electric lifts'];
const PEOPLE = ['Dr Valorie Salimpoor', 'Professor Glenn Schellenberg', 'Professor Nina Kraus'];

const PAPER = {
  code: 'IR-NEW-04', testType: 'READING', title: 'IELTS Reading (new)', timeLimitMin: 60, difficulty: 3, topic: 'Lifts, coral reefs and music',
  instructions: 'Three passages and 40 questions. Passage 1: questions 1 to 13. Passage 2: questions 14 to 26. Passage 3: questions 27 to 40. You have 60 minutes.',
  passages: [
    { title: 'Going up: the story of the lift', text: P1, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.HEAD(1, 5), questions: [
        mc('Paragraph A', HEAD, 'B', 'Paragraph A: early lifts had "one serious weakness".', ['they all had one serious weakness: if the rope broke, the platform fell']),
        mc('Paragraph B', HEAD, 'A', 'Paragraph B: Otis\'s brake "gave people the confidence to travel in lifts".', ['gave people the confidence to travel in lifts']),
        mc('Paragraph C', HEAD, 'F', 'Paragraph C: steam, then electric motors, then very fast lifts.', ['electric motors replaced steam']),
        mc('Paragraph D', HEAD, 'D', 'Paragraph D: taller buildings, and top floors became the most expensive.', ['the highest floors became the most expensive']),
        mc('Paragraph E', HEAD, 'C', 'Paragraph E: sideways lifts and carbon-fibre cables.', ['Engineers are still finding ways to improve them']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(6, 9), questions: [
        tf('The Romans used lifts to raise animals into the Colosseum.', 'TRUE', '"to raise wild animals into the Colosseum"', ['to raise wild animals into the Colosseum']),
        tf('At the exhibition, Otis\'s platform fell several metres when the rope was cut.', 'FALSE', 'It "stopped after a few centimetres".', ['the platform stopped after a few centimetres']),
        tf('Otis became the richest engineer in America.', 'NOT GIVEN', 'The passage does not mention his wealth.'),
        tf('Before lifts, the top floors of buildings were often the cheapest.', 'TRUE', '"The top floors were often the cheapest"', ['The top floors were often the cheapest']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SC(10, 13), wordLimit: 'ONE WORD AND/OR A NUMBER', questions: [
        sc('The first passenger lift with Otis\'s brake was put in a ________ in New York.', 'SHOP', '"installed in a shop in New York in 1857"', ['installed in a shop in New York in 1857']),
        sc('The first passenger lift was powered by ________.', 'STEAM', '"It was powered by steam"', ['It was powered by steam']),
        sc('Before lifts, buildings rarely had more than ________ floors.', 'SIX|6', '"rarely had more than six floors"', ['buildings rarely had more than six floors']),
        sc('Lighter cables may be made from ________ fibre.', 'CARBON', '"lighter cables made from carbon fibre"', ['lighter cables made from carbon fibre']),
      ] },
    ] },
    { title: 'Coral reefs in danger', text: P2, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.PARA(14, 18), questions: [
        mc('An explanation of why corals turn white', PARA5, 'D', 'Paragraph D: bleaching.', ['corals push out their algae and turn white']),
        mc('How reefs protect coastal areas', PARA5, 'C', 'Paragraph C: reefs reduce the force of waves.', ['reducing the force of waves during storms and protecting coastal towns']),
        mc('The reason reefs are found in shallow water', PARA5, 'B', 'Paragraph B: the algae need sunlight.', ['This partnership explains why most reefs are found in clear, shallow, sunny water']),
        mc('A comparison between reefs and forests', PARA5, 'A', 'Paragraph A: "rainforests of the sea".', ['they are often called the "rainforests of the sea"']),
        mc('A warning that new methods are not enough on their own', PARA5, 'E', 'Paragraph E: Dr Mills says these projects "can only buy time".', ['these projects can only buy time']),
      ] },
      { type: 'TRUE_FALSE_NOT_GIVEN', instruction: I.TF(19, 22), questions: [
        tf('Corals are a type of plant.', 'FALSE', '"they are actually animals"', ['Although corals look like plants or rocks, they are actually animals']),
        tf('The algae living in corals give them their colour.', 'TRUE', '"The algae also give corals their bright colours."', ['The algae also give corals their bright colours']),
        tf('Bleached corals are already dead.', 'FALSE', '"Bleached corals are not dead"', ['Bleached corals are not dead']),
        tf('The Great Barrier Reef is the most visited reef in the world.', 'NOT GIVEN', 'The passage mentions bleaching there, not visitor numbers.'),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SUM(23, 26), wordLimit: 'ONE WORD ONLY', questions: [
        sc('Summary: Coral reefs cover less than 1% of the ocean floor but are home to about a ________ of marine species.', 'QUARTER', '"around a quarter of all marine species"', ['they are home to around a quarter of all marine species']),
        sc('Each coral is made of thousands of tiny creatures called ________.', 'POLYPS', '"tiny creatures called polyps"', ['thousands of tiny creatures called polyps']),
        sc('Some ________, including treatments for cancer, come from reef animals.', 'MEDICINES', '"some medicines, including treatments for cancer"', ['some medicines, including treatments for cancer']),
        sc('Scientists grow young corals in underwater ________.', 'NURSERIES', '"growing young corals in underwater \\"nurseries\\""', ['growing young corals in underwater "nurseries"']),
      ] },
    ] },
    { title: 'Music and the brain', text: P3, groups: [
      { type: 'MULTIPLE_CHOICE', instruction: I.FEAT(27, 30, 'C') + ' A: Dr Valorie Salimpoor. B: Professor Glenn Schellenberg. C: Professor Nina Kraus.', questions: [
        mc('Musical training makes the brain more sensitive to sound.', PEOPLE, 'C', 'Kraus: training "tunes" the brain.', ['She believes that musical training "tunes" the brain']),
        mc('Pleasure chemicals are released just before the best part of a song.', PEOPLE, 'A', 'Salimpoor: dopamine is released "in the seconds before it".', ['but also in the seconds before it, as the listener waits for it']),
        mc('Any enjoyable music can improve concentration for a short time.', PEOPLE, 'B', 'Schellenberg: "any music people enjoy can improve their mood and concentration".', ['any music people enjoy can improve their mood and concentration for a short time']),
        mc('Musicians find it easier to hear speech in noisy places.', PEOPLE, 'C', 'Kraus has shown musicians are better at picking out speech in noise.', ['musicians are better at picking out speech in noisy places']),
      ] },
      { type: 'MULTIPLE_CHOICE', instruction: I.MC(31, 35), questions: [
        mc('What do the bird-bone flutes suggest?', ['Birds were important in early religion', 'Music is one of the oldest human activities', 'Early people could not make other instruments', 'Music helped people find food'], 'B', '"which suggests that music is one of the oldest human activities"', ['which suggests that music is one of the oldest human activities']),
        mc('What have brain scans shown about listening to music?', ['Only the hearing area becomes active', 'Many areas become active at the same time', 'The brain becomes less active', 'It affects only memory'], 'B', '"activates many different areas of the brain at the same time"', ['listening to music activates many different areas of the brain at the same time']),
        mc('What can familiar songs do for patients with memory loss?', ['Cure the illness', 'Bring back memories and improve mood', 'Help them learn new languages', 'Make them sleep better'], 'B', '"familiar songs can bring back memories and improve mood"', ['familiar songs can bring back memories and improve mood']),
        mc('How long did the "Mozart effect" last, according to later research?', ['About fifteen minutes', 'About an hour', 'About a day', 'Several years'], 'A', '"lasted only about fifteen minutes"', ['the improvement was small and lasted only about fifteen minutes']),
        mc('What may children who take music lessons improve in?', ['Mathematics and science', 'Sport and fitness', 'Listening skills and sometimes reading', 'Drawing and painting'], 'C', '"improvements in listening skills and, in some cases, in reading"', ['improvements in listening skills and, in some cases, in reading']),
      ] },
      { type: 'SENTENCE_COMPLETION', instruction: I.SA(36, 40), wordLimit: 'NO MORE THAN TWO WORDS', questions: [
        sc('How old are the oldest flutes that have been found? (write the number of years)', '40,000|40000|40,000 YEARS|MORE THAN 40,000', '"more than 40,000 years old"', ['more than 40,000 years old']),
        sc('What were the flutes made from?', 'BIRD BONES', '"flutes made from bird bones"', ['flutes made from bird bones']),
        sc('Which chemical connected to pleasure does the brain release?', 'DOPAMINE', '"the brain releases dopamine"', ['the brain releases dopamine']),
        sc('What can many people remember from childhood more easily than school facts?', 'SONG LYRICS|LYRICS', '"remember song lyrics from their childhood"', ['Many people can remember song lyrics from their childhood']),
        sc('In which decade was the Mozart study published?', '1990S|THE 1990S|1990\'S', '"In the 1990s, a study suggested"', ['In the 1990s, a study suggested that listening to Mozart improved performance']),
      ] },
    ] },
  ],
};

module.exports = { PAPER };
