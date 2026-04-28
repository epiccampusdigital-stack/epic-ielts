const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.post('/', auth, adminOnly, async (req, res) => {
  const data = req.body;

  try {
    // 1. VALIDATION
    if (!data.title || !data.code || !data.testType) {
      return res.status(400).json({ error: 'Missing paper metadata (title, code, testType)' });
    }

    if (!['READING', 'LISTENING'].includes(data.testType)) {
      return res.status(400).json({ error: 'testType must be READING or LISTENING' });
    }

    // Check duplicate code
    const existing = await prisma.paper.findFirst({
      where: { paperCode: data.code, testType: data.testType }
    });
    if (existing) {
      return res.status(400).json({ error: `Paper code ${data.code} already exists for ${data.testType}` });
    }

    // Validate group types
    const validTypes = [
      'MULTIPLE_CHOICE', 'SHORT_ANSWER', 'FORM_COMPLETION', 'MAP_LABELING',
      'TABLE_COMPLETION', 'NOTE_COMPLETION', 'SENTENCE_COMPLETION', 'MATCHING',
      'TRUE_FALSE_NOT_GIVEN'
    ];

    const qNumbers = new Set();
    const validateGroups = (groups) => {
      for (const g of groups) {
        if (!validTypes.includes(g.type)) {
          throw new Error(`Unknown group type: ${g.type}`);
        }
        if (g.type === 'TABLE_COMPLETION' && !g.tableData) {
          throw new Error('TABLE_COMPLETION group missing tableData');
        }
        for (const q of g.questions) {
          if (qNumbers.has(q.number)) {
            throw new Error(`Duplicate question number: ${q.number}`);
          }
          qNumbers.add(q.number);
          if (g.type === 'MULTIPLE_CHOICE' && (!q.options || !Array.isArray(q.options))) {
            throw new Error(`MCQ question ${q.number} missing options array`);
          }
        }
      }
    };

    if (data.testType === 'LISTENING') {
      if (!data.sections || !Array.isArray(data.sections)) {
        return res.status(400).json({ error: 'Listening paper must have sections' });
      }
      for (const s of data.sections) {
        validateGroups(s.groups || []);
      }
    } else {
      if (!data.passages || !Array.isArray(data.passages)) {
        return res.status(400).json({ error: 'Reading paper must have passages' });
      }
      for (const p of data.passages) {
        validateGroups(p.groups || []);
      }
    }

    // 2. TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      const paper = await tx.paper.create({
        data: {
          title: data.title,
          paperCode: data.code,
          testType: data.testType,
          timeLimitMin: parseInt(data.timeMinutes) || 60,
          instructions: data.overallInstructions || '',
          practiceMode: data.allowReplay || false,
          status: 'ACTIVE',
          assignedBatches: 'ALL'
        }
      });

      const needsUpload = [];

      if (data.testType === 'LISTENING') {
        for (const s of data.sections) {
          const section = await tx.section.create({
            data: {
              paperId: paper.id,
              number: s.sectionNumber,
              description: s.description || '',
              audioUrl: null
            }
          });
          needsUpload.push({ type: 'audio', sectionNumber: s.sectionNumber, label: `Section ${s.sectionNumber} Audio` });

          for (const g of s.groups) {
            const group = await tx.questionGroup.create({
              data: {
                sectionId: section.id,
                groupType: g.type,
                instruction: g.instruction || '',
                wordLimit: g.wordLimit || '',
                tableData: g.tableData || null,
                imageUrl: null
              }
            });
            if (g.type === 'MAP_LABELING') {
              needsUpload.push({ type: 'image', groupId: group.id, label: `Sec ${s.sectionNumber} Group Image` });
            }

            for (const q of g.questions) {
              await tx.question.create({
                data: {
                  paperId: paper.id,
                  groupId: group.id,
                  sectionNumber: s.sectionNumber,
                  questionNumber: q.number,
                  questionType: g.type,
                  content: q.content,
                  options: q.options || null,
                  correctAnswer: String(q.correctAnswer),
                  explanation: q.explanation || null
                }
              });
            }
          }
        }
      } else {
        // READING
        for (const p of data.passages) {
          const passage = await tx.passage.create({
            data: {
              paperId: paper.id,
              passageNumber: p.passageNumber,
              title: p.title || 'Passage',
              text: p.content || ''
            }
          });

          for (const g of p.groups) {
            const group = await tx.questionGroup.create({
              data: {
                passageId: passage.id,
                groupType: g.type,
                instruction: g.instruction || '',
                wordLimit: g.wordLimit || '',
                tableData: g.tableData || null,
                imageUrl: null
              }
            });

            for (const q of g.questions) {
              await tx.question.create({
                data: {
                  paperId: paper.id,
                  groupId: group.id,
                  passageNumber: p.passageNumber,
                  questionNumber: q.number,
                  questionType: g.type,
                  content: q.content,
                  options: q.options || null,
                  correctAnswer: String(q.correctAnswer),
                  explanation: q.explanation || null
                }
              });
            }
          }
        }
      }

      return { paperId: paper.id, needsUpload };
    });

    res.json({ success: true, ...result });

  } catch (err) {
    console.error('JSON Import Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
