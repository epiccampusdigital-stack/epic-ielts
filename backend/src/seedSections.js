require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding levels and sections...');

  const levels = [
    {
      levelNumber: 1,
      title: 'Foundation',
      description: 'Perfect for students beginning their IELTS journey. Builds core skills and familiarity with all four exam formats.',
      targetBand: '4.0 - 4.5',
      price: 19,
      sections: [
        { sectionNumber: 1,  title: 'Section 1',  readingCode: '001', writingCode: '001', listeningCode: '001', speakingCode: '001' },
        { sectionNumber: 2,  title: 'Section 2',  readingCode: '002', writingCode: '002', listeningCode: '002', speakingCode: '002' },
        { sectionNumber: 3,  title: 'Section 3',  readingCode: '003', writingCode: '003', listeningCode: '003', speakingCode: '003' },
      ]
    },
    {
      levelNumber: 2,
      title: 'Elementary',
      description: 'Develops core exam techniques across all skills. Introduces more complex question types and longer texts.',
      targetBand: '4.5 - 5.5',
      price: 29,
      sections: [
        { sectionNumber: 4,  title: 'Section 4',  readingCode: '004', writingCode: '004', listeningCode: '004', speakingCode: '004' },
        { sectionNumber: 5,  title: 'Section 5',  readingCode: '005', writingCode: '005', listeningCode: '005', speakingCode: '005' },
        { sectionNumber: 6,  title: 'Section 6',  readingCode: '006', writingCode: '006', listeningCode: '006', speakingCode: '006' },
      ]
    },
    {
      levelNumber: 3,
      title: 'Intermediate',
      description: 'Targets the Band 6 threshold. Practises all academic question types with authentic exam-style content.',
      targetBand: '5.5 - 6.5',
      price: 39,
      sections: [
        { sectionNumber: 7,  title: 'Section 7',  readingCode: '007', writingCode: '007', listeningCode: '007', speakingCode: '007' },
        { sectionNumber: 8,  title: 'Section 8',  readingCode: '008', writingCode: '008', listeningCode: '008', speakingCode: '008' },
        { sectionNumber: 9,  title: 'Section 9',  readingCode: '009', writingCode: '009', listeningCode: '009', speakingCode: '009' },
      ]
    },
    {
      levelNumber: 4,
      title: 'Upper Intermediate',
      description: 'Pushes towards Band 7. Features challenging inference questions and complex academic writing tasks.',
      targetBand: '6.5 - 7.5',
      price: 49,
      sections: [
        { sectionNumber: 10, title: 'Section 10', readingCode: '010', writingCode: '010', listeningCode: '010', speakingCode: '010' },
        { sectionNumber: 11, title: 'Section 11', readingCode: '011', writingCode: '011', listeningCode: '011', speakingCode: '011' },
        { sectionNumber: 12, title: 'Section 12', readingCode: '012', writingCode: '012', listeningCode: '012', speakingCode: '012' },
      ]
    },
    {
      levelNumber: 5,
      title: 'Advanced',
      description: 'Designed for Band 7.5 and above. The most demanding texts, tasks and speaking topics in the programme.',
      targetBand: '7.5+',
      price: 59,
      sections: [
        { sectionNumber: 13, title: 'Section 13', readingCode: '013', writingCode: '013', listeningCode: '013', speakingCode: '013' },
        { sectionNumber: 14, title: 'Section 14', readingCode: '014', writingCode: '014', listeningCode: '014', speakingCode: '014' },
        { sectionNumber: 15, title: 'Section 15', readingCode: '015', writingCode: '015', listeningCode: '015', speakingCode: '015' },
      ]
    },
  ];

  for (const levelData of levels) {
    const level = await prisma.level.upsert({
      where: { levelNumber: levelData.levelNumber },
      update: {
        title: levelData.title,
        description: levelData.description,
        targetBand: levelData.targetBand,
        price: levelData.price,
      },
      create: {
        levelNumber: levelData.levelNumber,
        title: levelData.title,
        description: levelData.description,
        targetBand: levelData.targetBand,
        price: levelData.price,
      }
    });

    for (const sectionData of levelData.sections) {
      await prisma.levelSection.upsert({
        where: { sectionNumber: sectionData.sectionNumber },
        update: {
          title: sectionData.title,
          readingCode: sectionData.readingCode,
          writingCode: sectionData.writingCode,
          listeningCode: sectionData.listeningCode,
          speakingCode: sectionData.speakingCode,
        },
        create: {
          sectionNumber: sectionData.sectionNumber,
          title: sectionData.title,
          levelId: level.id,
          readingCode: sectionData.readingCode,
          writingCode: sectionData.writingCode,
          listeningCode: sectionData.listeningCode,
          speakingCode: sectionData.speakingCode,
        }
      });
    }
    console.log(`Level ${levelData.levelNumber} — ${levelData.title} seeded`);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
