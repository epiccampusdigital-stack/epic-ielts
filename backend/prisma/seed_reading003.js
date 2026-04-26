require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating READING 003...');

  const existing = await prisma.paper.findFirst({ where: { paperCode: '003', testType: 'READING' } });
  if (existing) {
    await prisma.question.deleteMany({ where: { paperId: existing.id } });
    await prisma.paper.delete({ where: { id: existing.id } });
    console.log('Deleted existing READING 003');
  }

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
    // PASSAGE 1 — The Anthropocene
    {
      passageNumber: 1,
      questionNumber: 1,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'The term Anthropocene has been officially adopted as a formal geological epoch by the relevant scientific authority.',
      options: null,
      correctAnswer: 'FALSE',
      explanation: 'The passage states the Anthropocene has NOT yet been formally ratified by the International Commission on Stratigraphy. The passage says the debate over whether to designate it continues, meaning it is FALSE that it has been officially adopted.'
    },
    {
      passageNumber: 1,
      questionNumber: 2,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'Paul Crutzen was the first person to use the word Anthropocene in any context.',
      options: null,
      correctAnswer: 'NOT GIVEN',
      explanation: 'The passage says Crutzen popularised the term in the early 2000s but does not state whether he was the first person to use it. Since the passage gives no information about who first coined the term, the answer is NOT GIVEN.'
    },
    {
      passageNumber: 1,
      questionNumber: 3,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'Supporters of the Anthropocene concept suggest the Great Acceleration of the mid-twentieth century as the most likely starting point for the epoch.',
      options: null,
      correctAnswer: 'TRUE',
      explanation: 'The passage explicitly states that proponents argue the mid-twentieth century Great Acceleration represents the most plausible starting point. This matches the statement exactly, so the answer is TRUE.'
    },
    {
      passageNumber: 1,
      questionNumber: 4,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'Some scientists believe the current period of human disruption may not be permanent enough to qualify as a geological epoch.',
      options: null,
      correctAnswer: 'TRUE',
      explanation: 'The passage states critics argue the Anthropocene lacks geological permanence and that the current disruption may prove transient relative to deep geological processes. This directly supports the statement, so the answer is TRUE.'
    },
    {
      passageNumber: 1,
      questionNumber: 5,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'The Capitalocene framework holds all of humanity equally responsible for planetary disruption.',
      options: null,
      correctAnswer: 'FALSE',
      explanation: 'The passage states the Capitalocene attributes planetary disruption NOT to humanity as a whole but specifically to the logic of capital accumulation and the fossil fuel economy. This is the opposite of the statement, so the answer is FALSE.'
    },
    {
      passageNumber: 1,
      questionNumber: 6,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'The Anthropocene concept has been used in research across multiple academic disciplines.',
      options: null,
      correctAnswer: 'TRUE',
      explanation: 'The passage states ecologists, climatologists, archaeologists, and social scientists have all adopted the term. Multiple disciplines are explicitly named, confirming this statement is TRUE.'
    },
    {
      passageNumber: 1,
      questionNumber: 7,
      questionType: 'MULTIPLE_CHOICE',
      content: 'Which of the following is mentioned as a potential stratigraphic marker of the Anthropocene?',
      options: JSON.stringify(['A. The invention of the steam engine in the eighteenth century', 'B. The global spread of plastics and nuclear fallout from weapons testing', 'C. The domestication of animals during the Neolithic period', 'D. A significant rise in sea levels caused by glacial retreat']),
      correctAnswer: 'B',
      explanation: 'The passage explicitly lists plastics, aluminium, and radionuclides from nuclear weapons testing as candidate stratigraphic markers. Option B matches these exactly. The other options (steam engine, animal domestication, sea level rise) are not mentioned as markers in the passage.'
    },
    {
      passageNumber: 1,
      questionNumber: 8,
      questionType: 'MULTIPLE_CHOICE',
      content: 'What concern do critics raise about officially naming the Anthropocene?',
      options: JSON.stringify(['A. It would give too much political power to geologists', 'B. It might make environmental destruction seem like a natural historical stage', 'C. It would require rewriting large sections of Earths geological history', 'D. It exaggerates the role of nuclear testing in shaping geology']),
      correctAnswer: 'B',
      explanation: 'The passage states critics contend that designating a new epoch risks normalising environmental destruction by framing it as a natural progression of Earth history. This is exactly what option B describes. The other concerns are not mentioned in the passage.'
    },
    {
      passageNumber: 1,
      questionNumber: 9,
      questionType: 'MULTIPLE_CHOICE',
      content: 'What does the passage say about tipping points in the Earth system?',
      options: JSON.stringify(['A. They are primarily caused by volcanic activity', 'B. They refer to points at which change may become self-reinforcing and irreversible', 'C. They have been successfully prevented through international climate agreements', 'D. They only affect ecosystems in polar regions']),
      correctAnswer: 'B',
      explanation: 'The passage defines tipping points as thresholds beyond which change becomes self-reinforcing and potentially irreversible. This matches option B exactly. The passage gives examples including polar ice sheets, Amazon rainforest, and monsoon patterns — not just polar regions — eliminating option D.'
    },
    {
      passageNumber: 1,
      questionNumber: 10,
      questionType: 'MULTIPLE_CHOICE',
      content: 'What is the main purpose of alternative framings such as the Capitalocene?',
      options: JSON.stringify(['A. To reject the idea that human activity affects geology', 'B. To challenge the universalising language of the Anthropocene and highlight inequality', 'C. To replace the Anthropocene with a more scientifically precise term', 'D. To argue that capitalism has had a positive effect on the environment']),
      correctAnswer: 'B',
      explanation: 'The passage states these alternative framings reflect a concern that the universalising language of the Anthropocene obscures deep inequalities in who caused environmental change and who bears its consequences. Option B captures this purpose precisely.'
    },
    {
      passageNumber: 1,
      questionNumber: 11,
      questionType: 'MATCHING_HEADINGS',
      content: 'A description of the measurable physical evidence that could define the Anthropocene in the geological record.',
      options: null,
      correctAnswer: 'B',
      explanation: 'Paragraph B (the second paragraph) describes candidate markers including plastics, radionuclides, carbon isotope ratios, and species extinction rates — these are the measurable physical evidence in the geological record. Always look for the paragraph that contains specific physical or scientific evidence.'
    },
    {
      passageNumber: 1,
      questionNumber: 12,
      questionType: 'MATCHING_HEADINGS',
      content: 'An argument that the Anthropocene concept may serve political or cultural purposes beyond its scientific meaning.',
      options: null,
      correctAnswer: 'C',
      explanation: 'Paragraph C (the third paragraph) states the political dimensions of the term have made it as much a cultural concept as a scientific one. This directly addresses the Anthropocene serving cultural and political purposes beyond science.'
    },
    {
      passageNumber: 1,
      questionNumber: 13,
      questionType: 'MATCHING_HEADINGS',
      content: 'A reference to the long-lasting nature of decisions made by present-day societies.',
      options: null,
      correctAnswer: 'F',
      explanation: 'The final paragraph (F) states that decisions made by contemporary societies carry consequences that will persist in the rock record for millions of years to come. This is a direct reference to the long-lasting nature of present-day decisions.'
    },
    {
      passageNumber: 1,
      questionNumber: 14,
      questionType: 'MATCHING_HEADINGS',
      content: 'An explanation of why some researchers prefer alternative terms to Anthropocene.',
      options: null,
      correctAnswer: 'E',
      explanation: 'Paragraph E introduces the Capitalocene and Plantationocene as alternatives and explains these reflect concern that the Anthropocene obscures inequalities. This is the paragraph that explains why researchers prefer alternative terms.'
    },
    // PASSAGE 2 — Behavioural Economics
    {
      passageNumber: 2,
      questionNumber: 15,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'Classical economic theory assumes that all individuals act rationally to maximise their own benefit.',
      options: null,
      correctAnswer: 'TRUE',
      explanation: 'The passage opens by stating classical economic theory assumes individuals are rational actors who consistently make decisions that maximise their own utility. This matches the statement exactly, so the answer is TRUE.'
    },
    {
      passageNumber: 2,
      questionNumber: 16,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'Prospect theory shows that people judge outcomes against a reference point rather than in absolute terms.',
      options: null,
      correctAnswer: 'TRUE',
      explanation: 'The passage states prospect theory demonstrated that people evaluate outcomes not in absolute terms but relative to a reference point. This is exactly what the statement says, so the answer is TRUE.'
    },
    {
      passageNumber: 2,
      questionNumber: 17,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'The UKs Behavioural Insights Team was established before nudge theory was formally published.',
      options: null,
      correctAnswer: 'FALSE',
      explanation: 'The passage states Thaler and Sunstein published nudge theory in their 2008 book, and the UK established the Behavioural Insights Team in 2010. Since 2010 is AFTER 2008, the team was established AFTER publication, making the statement FALSE.'
    },
    {
      passageNumber: 2,
      questionNumber: 18,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'Some critics argue that nudges manipulate behaviour without the explicit knowledge or consent of individuals.',
      options: null,
      correctAnswer: 'TRUE',
      explanation: 'The passage states critics argue nudges involve engineering environments to produce behaviour without the explicit consent of those being nudged. This directly supports the statement, so the answer is TRUE.'
    },
    {
      passageNumber: 2,
      questionNumber: 19,
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      content: 'All foundational findings in behavioural economics have been successfully replicated in follow-up studies.',
      options: null,
      correctAnswer: 'FALSE',
      explanation: 'The passage states replication studies have cast doubt on several foundational findings including ego depletion and classic priming effects. This is the opposite of the statement — NOT all findings have been successfully replicated — so the answer is FALSE.'
    },
    {
      passageNumber: 2,
      questionNumber: 20,
      questionType: 'MULTIPLE_CHOICE',
      content: 'What is loss aversion as described in the passage?',
      options: JSON.stringify(['A. The tendency to avoid making any financial decisions', 'B. The psychological pain of losses being greater than the pleasure of equivalent gains', 'C. The preference for larger financial rewards over smaller immediate ones', 'D. The inability to assess risk accurately in complex situations']),
      correctAnswer: 'B',
      explanation: 'The passage defines loss aversion as losses being psychologically more painful than equivalent gains. Option B matches this definition precisely. The other options describe different concepts not mentioned in the passage.'
    },
    {
      passageNumber: 2,
      questionNumber: 21,
      questionType: 'MULTIPLE_CHOICE',
      content: 'According to the passage, what makes a nudge distinct from other policy tools?',
      options: JSON.stringify(['A. It relies on financial penalties to change behaviour', 'B. It forces individuals to make specific choices', 'C. It alters behaviour through choice architecture without restricting freedom', 'D. It requires individuals to seek out new information independently']),
      correctAnswer: 'C',
      explanation: 'The passage defines a nudge as something that predictably alters behaviour without restricting freedom of choice or significantly changing financial incentives. Option C captures this precisely. Options A and B are the opposite of what nudges do.'
    },
    {
      passageNumber: 2,
      questionNumber: 22,
      questionType: 'MULTIPLE_CHOICE',
      content: 'What concern do structural critics raise about nudge interventions?',
      options: JSON.stringify(['A. They are too expensive for governments to implement at scale', 'B. They may draw attention away from deeper systemic causes of social problems', 'C. They have been shown to increase inequality in public health outcomes', 'D. They only work effectively in high-income countries']),
      correctAnswer: 'B',
      explanation: 'The passage states critics argue nudge interventions by focusing on individual behaviour may distract attention from structural and systemic causes of social problems such as poverty and inequality. This matches option B exactly.'
    },
    {
      passageNumber: 2,
      questionNumber: 23,
      questionType: 'MULTIPLE_CHOICE',
      content: 'What does the replication crisis referred to in the final paragraph suggest?',
      options: JSON.stringify(['A. Behavioural economics has been entirely discredited as a field', 'B. Some key findings in behavioural science may be less reliable than previously thought', 'C. Nudge theory has been abandoned by governments as ineffective', 'D. Loss aversion has been proven to be a universal human trait']),
      correctAnswer: 'B',
      explanation: 'The passage states replication studies have cast doubt on several foundational findings and prompted calls for greater rigour. This means some findings are less reliable — matching option B. The passage does NOT say the entire field is discredited (option A) or that nudge theory has been abandoned (option C).'
    },
    {
      passageNumber: 2,
      questionNumber: 24,
      questionType: 'SENTENCE_COMPLETION',
      content: 'The classical economic model assumes individuals are ___ who seek to maximise utility.',
      options: null,
      correctAnswer: 'rational actors',
      explanation: 'The passage states the model known as Homo economicus predicts individuals are rational actors. The exact phrase from the passage is rational actors. In sentence completion questions always use words directly from the passage.'
    },
    {
      passageNumber: 2,
      questionNumber: 25,
      questionType: 'SENTENCE_COMPLETION',
      content: 'Kahneman and Tversky showed that people are influenced by the ___ of options when making decisions.',
      options: null,
      correctAnswer: 'framing',
      explanation: 'The passage states individuals are swayed by the framing of options. The exact word from the passage is framing. This is a classic IELTS scanning question — look for the word that fills the gap using language near the key names Kahneman and Tversky.'
    },
    {
      passageNumber: 2,
      questionNumber: 26,
      questionType: 'SENTENCE_COMPLETION',
      content: 'A nudge changes behaviour by altering the ___ without removing freedom of choice.',
      options: null,
      correctAnswer: 'choice architecture',
      explanation: 'The passage defines a nudge as any aspect of the choice architecture that alters behaviour without restricting freedom. The answer is choice architecture — two words taken directly from the passage definition of a nudge.'
    },
    {
      passageNumber: 2,
      questionNumber: 27,
      questionType: 'SENTENCE_COMPLETION',
      content: 'Some researchers question whether behavioural changes produced by nudges are ___ once the nudge is removed.',
      options: null,
      correctAnswer: 'genuinely internalised',
      explanation: 'The passage states critics question whether changes produced by nudges are genuinely internalised or merely superficial, reverting once the nudge is removed. The answer genuinely internalised comes directly from this sentence.'
    },
    {
      passageNumber: 2,
      questionNumber: 28,
      questionType: 'SHORT_ANSWER',
      content: 'What term describes the concept that willpower diminishes with repeated use?',
      options: null,
      correctAnswer: 'ego depletion',
      explanation: 'The passage refers to ego depletion as the idea that willpower is a finite resource that diminishes with use. This is the exact term used in the passage. Scanning for the word willpower in the passage leads directly to this answer.'
    },
    {
      passageNumber: 2,
      questionNumber: 29,
      questionType: 'SHORT_ANSWER',
      content: 'In what year was prospect theory first developed?',
      options: null,
      correctAnswer: '1979',
      explanation: 'The passage states prospect theory was developed in 1979. Numbers and dates are easy to scan for — always look for the specific year near the term prospect theory in the passage.'
    },
    {
      passageNumber: 2,
      questionNumber: 30,
      questionType: 'SHORT_ANSWER',
      content: 'What informal name is given to the UKs Behavioural Insights Team?',
      options: null,
      correctAnswer: 'Nudge Unit',
      explanation: 'The passage states the Behavioural Insights Team is informally known as the Nudge Unit. The word informally in the question is a paraphrase of informally known as in the passage — this signals the answer is nearby.'
    },
    // PASSAGE 3 — AI Ethics
    {
      passageNumber: 3,
      questionNumber: 31,
      questionType: 'SUMMARY_COMPLETION',
      content: 'AI systems trained on historical data tend to reproduce the ___ present in those datasets.',
      options: null,
      correctAnswer: 'biases',
      explanation: 'The passage states machine learning models trained on historical data inevitably absorb the biases embedded in those datasets. The answer is biases — taken directly from the passage. In summary completion always use words from the passage, not synonyms.'
    },
    {
      passageNumber: 3,
      questionNumber: 32,
      questionType: 'SUMMARY_COMPLETION',
      content: 'The opacity of powerful AI systems is often described using the phrase ___ quality.',
      options: null,
      correctAnswer: 'black box',
      explanation: 'The passage uses the term black box quality to describe the opacity of powerful AI systems. The phrase black box is in quotation marks in the passage, signalling it is a specific technical term being defined.'
    },
    {
      passageNumber: 3,
      questionNumber: 33,
      questionType: 'SUMMARY_COMPLETION',
      content: 'The EUs GDPR includes a right to ___ for decisions made by automated systems.',
      options: null,
      correctAnswer: 'explanation',
      explanation: 'The passage states the GDPR includes a right to explanation for automated decisions. Scan for GDPR in the passage and the answer appears immediately after — right to explanation.'
    },
    {
      passageNumber: 3,
      questionNumber: 34,
      questionType: 'SUMMARY_COMPLETION',
      content: 'The difficulty of assigning responsibility when AI causes harm is referred to as an ___ gap.',
      options: null,
      correctAnswer: 'accountability',
      explanation: 'The passage explicitly uses the term accountability gap to describe the difficulty of assigning legal or moral responsibility for AI-driven harm. Scan for the word gap in the passage to locate this answer quickly.'
    },
    {
      passageNumber: 3,
      questionNumber: 35,
      questionType: 'SUMMARY_COMPLETION',
      content: 'The EU AI Act is described as a ___ regulatory framework that classifies AI applications by level of risk.',
      options: null,
      correctAnswer: 'risk-based',
      explanation: 'The passage states the EU AI Act establishes a risk-based regulatory framework. The exact phrase is risk-based. Always look for the key noun (EU AI Act) in the passage and read the surrounding text for the answer.'
    },
    {
      passageNumber: 3,
      questionNumber: 36,
      questionType: 'MULTIPLE_CHOICE',
      content: 'What does the passage identify as a key reason AI systems can perpetuate social inequalities?',
      options: JSON.stringify(['A. AI developers intentionally program discriminatory outcomes into their systems', 'B. Machine learning models are trained on historical data that contains existing biases', 'C. Governments have refused to regulate the use of AI in sensitive sectors', 'D. AI systems are designed to prioritise efficiency over fairness']),
      correctAnswer: 'B',
      explanation: 'The passage states because machine learning models are trained on historical data they inevitably absorb the biases embedded in those datasets. Option B matches this explanation exactly. Option A is wrong because the passage says these are not intentional — they reflect structural inequalities.'
    },
    {
      passageNumber: 3,
      questionNumber: 37,
      questionType: 'MULTIPLE_CHOICE',
      content: 'According to the passage, why do current liability frameworks struggle to address AI-driven harm?',
      options: JSON.stringify(['A. They were designed for situations involving identifiable individual human agents', 'B. They do not recognise AI systems as legal entities capable of causing damage', 'C. They apply only to physical harm and not to financial or reputational damage', 'D. They were written before AI technology was commercially available']),
      correctAnswer: 'A',
      explanation: 'The passage states existing liability frameworks were designed for a world of discrete human agents and identifiable causes and are poorly adapted to AI-driven harm. This matches option A. The passage does not mention options B, C, or D as reasons.'
    },
    {
      passageNumber: 3,
      questionNumber: 38,
      questionType: 'MULTIPLE_CHOICE',
      content: 'What is the passages main criticism of current global AI governance?',
      options: JSON.stringify(['A. Governments are investing too heavily in military AI at the expense of civilian applications', 'B. Existing regulations are too strict and are slowing down beneficial AI innovation', 'C. National regulations developed competitively are insufficient for technologies with cross-border impacts', 'D. The EU AI Act does not go far enough in restricting high-risk AI applications']),
      correctAnswer: 'C',
      explanation: 'The passage concludes that the patchwork of national regulations developed in a spirit of competitive advantage rather than cooperative governance is inadequate for technologies whose impacts transcend borders. This is exactly what option C states.'
    },
    {
      passageNumber: 3,
      questionNumber: 39,
      questionType: 'SHORT_ANSWER',
      content: 'What term is commonly used to describe fully autonomous weapons systems in public debate?',
      options: null,
      correctAnswer: 'killer robots',
      explanation: 'The passage states campaigns for a ban on fully autonomous weapons often called killer robots have gained support. The answer killer robots is in quotation marks in the passage, indicating it is the common public term. Scan for autonomous weapons to find this answer.'
    },
    {
      passageNumber: 3,
      questionNumber: 40,
      questionType: 'SHORT_ANSWER',
      content: 'What type of approach has the United States favoured in regulating AI, rather than comprehensive legislation?',
      options: null,
      correctAnswer: 'sector-specific',
      explanation: 'The passage states the United States has favoured a more sector-specific voluntary approach relying on agency guidance and executive orders rather than comprehensive legislation. The answer is sector-specific — find United States in the final paragraph to locate this quickly.'
    }
  ];

  await prisma.question.createMany({
    data: questions.map(q => ({ ...q, paperId: paper.id }))
  });

  console.log('Created', questions.length, 'questions for READING 003');

  const verify = await prisma.question.count({ where: { paperId: paper.id } });
  console.log('Verified:', verify, 'questions in database');

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
