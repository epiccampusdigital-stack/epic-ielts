require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');

  const adminHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  try {
    // FIX ACCOUNTS
    await prisma.student.upsert({
      where: { email: 'admin@epic.com' },
      update: { password: adminHash, role: 'ADMIN', name: 'Admin', batch: 'STAFF' },
      create: { email: 'admin@epic.com', password: adminHash, name: 'Admin', role: 'ADMIN', batch: 'STAFF' }
    });
    await prisma.student.upsert({
      where: { email: 'student@epic.com' },
      update: { password: studentHash, role: 'STUDENT', name: 'Test Student', batch: 'GENERAL' },
      create: { email: 'student@epic.com', password: studentHash, name: 'Test Student', role: 'STUDENT', batch: 'GENERAL' }
    });
    console.log('Accounts fixed!');

    // SEED READING 003
    console.log('Checking READING 003...');
    const existing = await prisma.paper.findFirst({ where: { paperCode: '003', testType: 'READING' } });
    if (existing) {
      console.log('READING 003 already exists. Skipping recreation.');
    } else {
      const paper = await prisma.paper.create({
        data: {
          paperCode: '003',
          testType: 'READING',
          title: 'Academic Reading Test — Anthropocene, Behavioural Economics, AI Ethics',
          timeLimitMin: 60,
          instructions: 'Read the passages carefully and answer Questions 1-40.',
          status: 'ACTIVE',
          assignedBatches: 'ALL'
        }
      });
      console.log('Paper created:', paper.id);

      const questions = [
        { passageNumber: 1, questionNumber: 1, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'The term Anthropocene has been officially adopted as a formal geological epoch by the relevant scientific authority.', correctAnswer: 'FALSE', explanation: 'The passage states the Anthropocene has NOT yet been formally ratified...' },
        { passageNumber: 1, questionNumber: 2, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'Paul Crutzen was the first person to use the word Anthropocene in any context.', correctAnswer: 'NOT GIVEN', explanation: 'The passage says Crutzen popularised the term...' },
        { passageNumber: 1, questionNumber: 3, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'Supporters of the Anthropocene concept suggest the Great Acceleration of the mid-twentieth century as the most likely starting point for the epoch.', correctAnswer: 'TRUE', explanation: 'The passage explicitly states that proponents argue...' },
        { passageNumber: 1, questionNumber: 4, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'Some scientists believe the current period of human disruption may not be permanent enough to qualify as a geological epoch.', correctAnswer: 'TRUE', explanation: 'The passage states critics argue the Anthropocene lacks geological permanence...' },
        { passageNumber: 1, questionNumber: 5, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'The Capitalocene framework holds all of humanity equally responsible for planetary disruption.', correctAnswer: 'FALSE', explanation: 'The passage states the Capitalocene attributes planetary disruption NOT to humanity...' },
        { passageNumber: 1, questionNumber: 6, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'The Anthropocene concept has been used in research across multiple academic disciplines.', correctAnswer: 'TRUE', explanation: 'The passage states ecologists, climatologists, archaeologists, and social scientists have all adopted the term.' },
        { passageNumber: 1, questionNumber: 7, questionType: 'MULTIPLE_CHOICE', content: 'Which of the following is mentioned as a potential stratigraphic marker of the Anthropocene?', options: JSON.stringify(['A. The invention of the steam engine', 'B. The global spread of plastics and nuclear fallout', 'C. The domestication of animals', 'D. A significant rise in sea levels']), correctAnswer: 'B', explanation: 'The passage explicitly lists plastics, aluminium, and radionuclides...' },
        { passageNumber: 1, questionNumber: 8, questionType: 'MULTIPLE_CHOICE', content: 'What concern do critics raise about officially naming the Anthropocene?', options: JSON.stringify(['A. It would give too much political power', 'B. It might make environmental destruction seem like a natural stage', 'C. It would require rewriting Earths history', 'D. It exaggerates nuclear testing']), correctAnswer: 'B', explanation: 'The passage states critics contend that designating a new epoch risks normalising environmental destruction...' },
        { passageNumber: 1, questionNumber: 9, questionType: 'MULTIPLE_CHOICE', content: 'What does the passage say about tipping points in the Earth system?', options: JSON.stringify(['A. They are caused by volcanic activity', 'B. They refer to points at which change may become irreversible', 'C. They have been prevented', 'D. They only affect polar regions']), correctAnswer: 'B', explanation: 'The passage defines tipping points as thresholds beyond which change becomes self-reinforcing...' },
        { passageNumber: 1, questionNumber: 10, questionType: 'MULTIPLE_CHOICE', content: 'What is the main purpose of alternative framings such as the Capitalocene?', options: JSON.stringify(['A. To reject human impact', 'B. To challenge universalising language and highlight inequality', 'C. To replace with more precise term', 'D. To argue capitalism is positive']), correctAnswer: 'B', explanation: 'The passage states these alternative framings reflect a concern that the universalising language obscures inequalities.' },
        { passageNumber: 1, questionNumber: 11, questionType: 'MATCHING_HEADINGS', content: 'A description of the measurable physical evidence...', correctAnswer: 'B', explanation: 'Paragraph B describes candidate markers including plastics...' },
        { passageNumber: 1, questionNumber: 12, questionType: 'MATCHING_HEADINGS', content: 'An argument that the Anthropocene concept may serve political or cultural purposes...', correctAnswer: 'C', explanation: 'Paragraph C states the political dimensions of the term...' },
        { passageNumber: 1, questionNumber: 13, questionType: 'MATCHING_HEADINGS', content: 'A reference to the long-lasting nature of decisions...', correctAnswer: 'F', explanation: 'The final paragraph states that decisions made carry consequences that will persist...' },
        { passageNumber: 1, questionNumber: 14, questionType: 'MATCHING_HEADINGS', content: 'An explanation of why some researchers prefer alternative terms...', correctAnswer: 'E', explanation: 'Paragraph E introduces the Capitalocene and Plantationocene...' },
        { passageNumber: 2, questionNumber: 15, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'Classical economic theory assumes individuals act rationally...', correctAnswer: 'TRUE', explanation: 'The passage states classical theory assumes individuals are rational actors.' },
        { passageNumber: 2, questionNumber: 16, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'Prospect theory shows people judge outcomes against a reference point...', correctAnswer: 'TRUE', explanation: 'The passage states prospect theory demonstrated that people evaluate outcomes relative to a reference point.' },
        { passageNumber: 2, questionNumber: 17, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'UK Behavioural Insights Team established before nudge theory published.', correctAnswer: 'FALSE', explanation: 'Published 2008, Team established 2010.' },
        { passageNumber: 2, questionNumber: 18, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'Nudges manipulate behaviour without explicit knowledge/consent.', correctAnswer: 'TRUE', explanation: 'Critics argue nudges produce behaviour without explicit consent.' },
        { passageNumber: 2, questionNumber: 19, questionType: 'TRUE_FALSE_NOT_GIVEN', content: 'All foundational findings successfully replicated.', correctAnswer: 'FALSE', explanation: 'Replication studies have cast doubt on several findings.' },
        { passageNumber: 2, questionNumber: 20, questionType: 'MULTIPLE_CHOICE', content: 'What is loss aversion?', options: JSON.stringify(['A. Avoid financial decisions', 'B. Pain of losses greater than pleasure of gains', 'C. Preference for larger rewards', 'D. Inability to assess risk']), correctAnswer: 'B', explanation: 'Losses are psychologically more painful than equivalent gains.' },
        { passageNumber: 2, questionNumber: 21, questionType: 'MULTIPLE_CHOICE', content: 'Distinctive nudge feature?', options: JSON.stringify(['A. Financial penalties', 'B. Forces choices', 'C. Alters behaviour via choice architecture without restricting freedom', 'D. Requires independent info']), correctAnswer: 'C', explanation: 'Alters behaviour without restricting freedom.' },
        { passageNumber: 2, questionNumber: 22, questionType: 'MULTIPLE_CHOICE', content: 'Structural critic concern?', options: JSON.stringify(['A. Expensive', 'B. Distracts from systemic causes', 'C. Increases inequality', 'D. Only works in high-income countries']), correctAnswer: 'B', explanation: 'May distract attention from structural causes.' },
        { passageNumber: 2, questionNumber: 23, questionType: 'MULTIPLE_CHOICE', content: 'Replication crisis suggests?', options: JSON.stringify(['A. Field discredited', 'B. Some findings less reliable', 'C. Nudges abandoned', 'D. Loss aversion universal']), correctAnswer: 'B', explanation: 'Cast doubt on foundational findings.' },
        { passageNumber: 2, questionNumber: 24, questionType: 'SENTENCE_COMPLETION', content: 'Model known as Homo economicus predicts individuals are ___.', correctAnswer: 'rational actors', explanation: 'Passage says rational actors.' },
        { passageNumber: 2, questionNumber: 25, questionType: 'SENTENCE_COMPLETION', content: 'Influenced by the ___ of options.', correctAnswer: 'framing', explanation: 'Passage says framing of options.' },
        { passageNumber: 2, questionNumber: 26, questionType: 'SENTENCE_COMPLETION', content: 'Altering the ___ without removing freedom.', correctAnswer: 'choice architecture', explanation: 'Passage says choice architecture.' },
        { passageNumber: 2, questionNumber: 27, questionType: 'SENTENCE_COMPLETION', content: 'Whether changes are ___ once nudge removed.', correctAnswer: 'genuinely internalised', explanation: 'Passage says genuinely internalised.' },
        { passageNumber: 2, questionNumber: 28, questionType: 'SHORT_ANSWER', content: 'Willpower diminishes with use?', correctAnswer: 'ego depletion', explanation: 'Passage says ego depletion.' },
        { passageNumber: 2, questionNumber: 29, questionType: 'SHORT_ANSWER', content: 'Prospect theory year?', correctAnswer: '1979', explanation: 'Passage says 1979.' },
        { passageNumber: 2, questionNumber: 30, questionType: 'SHORT_ANSWER', content: 'UK Team informal name?', correctAnswer: 'Nudge Unit', explanation: 'Passage says Nudge Unit.' },
        { passageNumber: 3, questionNumber: 31, questionType: 'SUMMARY_COMPLETION', content: 'Reproduce the ___ present in datasets.', correctAnswer: 'biases', explanation: 'Passage says biases.' },
        { passageNumber: 3, questionNumber: 32, questionType: 'SUMMARY_COMPLETION', content: 'Opacity described as ___ quality.', correctAnswer: 'black box', explanation: 'Passage says black box.' },
        { passageNumber: 3, questionNumber: 33, questionType: 'SUMMARY_COMPLETION', content: 'GDPR right to ___ for automated decisions.', correctAnswer: 'explanation', explanation: 'Passage says explanation.' },
        { passageNumber: 3, questionNumber: 34, questionType: 'SUMMARY_COMPLETION', content: 'Responsibility gap referred to as ___ gap.', correctAnswer: 'accountability', explanation: 'Passage says accountability.' },
        { passageNumber: 3, questionNumber: 35, questionType: 'SUMMARY_COMPLETION', content: 'EU AI Act described as ___ framework.', correctAnswer: 'risk-based', explanation: 'Passage says risk-based.' },
        { passageNumber: 3, questionNumber: 36, questionType: 'MULTIPLE_CHOICE', content: 'Key reason AI perpetuates inequality?', options: JSON.stringify(['A. Intentional', 'B. Trained on biased historical data', 'C. No regulation', 'D. Efficiency vs Fairness']), correctAnswer: 'B', explanation: 'Absorb biases embedded in historical datasets.' },
        { passageNumber: 3, questionNumber: 37, questionType: 'MULTIPLE_CHOICE', content: 'Liability framework struggle?', options: JSON.stringify(['A. Designed for human agents', 'B. Not legal entities', 'C. Physical only', 'D. Written before AI']), correctAnswer: 'A', explanation: 'Designed for a world of discrete human agents.' },
        { passageNumber: 3, questionNumber: 38, questionType: 'MULTIPLE_CHOICE', content: 'Main criticism of global AI governance?', options: JSON.stringify(['A. Military investment', 'B. Too strict', 'C. Competitive national regs insufficient for cross-border', 'D. EU Act not strict enough']), correctAnswer: 'C', explanation: 'Patchwork of national regulations developed in spirit of competitive advantage...' },
        { passageNumber: 3, questionNumber: 39, questionType: 'SHORT_ANSWER', content: 'Autonomous weapons name?', correctAnswer: 'killer robots', explanation: 'Passage says killer robots.' },
        { passageNumber: 3, questionNumber: 40, questionType: 'SHORT_ANSWER', content: 'US approach?', correctAnswer: 'sector-specific', explanation: 'Passage says sector-specific.' }
      ];

      await prisma.question.createMany({
        data: questions.map(q => ({ ...q, paperId: paper.id }))
      });
      console.log('READING 003 Seeded!');
    }

    await prisma.paper.updateMany({ data: { status: 'ACTIVE' } });
    console.log('Papers activated');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
