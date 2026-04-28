const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// One-shot seed endpoint — call POST /api/papers/seed-reading005 on Render to insert the paper
router.post('/seed-reading005', async (req, res) => {
  try {
    const paperData = require('../data/papers/reading005');

    // Remove if already exists
    const existing = await prisma.paper.findFirst({
      where: { paperCode: paperData.code, testType: 'READING' }
    });
    if (existing) {
      await prisma.answer.deleteMany({ where: { question: { paperId: existing.id } } });
      await prisma.question.deleteMany({ where: { paperId: existing.id } });
      await prisma.passage.deleteMany({ where: { paperId: existing.id } });
      await prisma.attempt.deleteMany({ where: { paperId: existing.id } });
      await prisma.paper.delete({ where: { id: existing.id } });
    }

    // Create paper
    const paper = await prisma.paper.create({
      data: {
        paperCode: paperData.code,
        testType: 'READING',
        title: paperData.title,
        timeLimitMin: paperData.timeAllowed,
        instructions: 'Read the passages carefully and answer all questions.',
        status: 'ACTIVE',
        assignedBatches: 'ALL'
      }
    });

    // Create passages
    for (const p of paperData.passages) {
      await prisma.passage.create({
        data: { paperId: paper.id, passageNumber: p.number, title: p.title, text: p.text }
      });
    }

    // Create questions
    for (const q of paperData.questions) {
      let optionsStr = null;
      if (q.options) {
        optionsStr = JSON.stringify(Object.entries(q.options).map(([k, v]) => `${k}. ${v}`));
      } else if (q.paragraphOptions) {
        optionsStr = JSON.stringify(q.paragraphOptions);
      }
      await prisma.question.create({
        data: {
          paperId: paper.id,
          passageNumber: q.passageNumber,
          questionNumber: q.number,
          questionType: q.type,
          content: q.text,
          options: optionsStr,
          correctAnswer: q.answer,
          explanation: q.explanation || null
        }
      });
    }

    res.json({ success: true, paperId: paper.id, code: paper.paperCode, questions: paperData.questions.length });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/assigned', async (req, res) => {
  try {
    const { type } = req.query;
    const where = { status: 'ACTIVE' };
    if (type && type !== 'ALL') where.testType = type.toUpperCase();

    const papers = await prisma.paper.findMany({
      where,
      select: {
        id: true,
        paperCode: true,
        testType: true,
        title: true,
        timeLimitMin: true,
        status: true,
        order: true
      },
      orderBy: [
        { order: 'asc' },
        { paperCode: 'asc' }
      ]
    });

    console.log('Papers returned:', papers.length, papers.map(p => p.paperCode + '-' + p.testType));
    res.json(papers);
  } catch (err) {
    console.error('Papers error:', err.message);
    res.status(500).json({ error: 'Failed to get papers' });
  }
});

router.get('/debug', async (req, res) => {
  try {
    const all = await prisma.paper.findMany({ orderBy: { id: 'desc' } });
    res.json({ total: all.length, papers: all.map(p => ({ id: p.id, code: p.paperCode, type: p.testType, status: p.status })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        questions: { orderBy: { questionNumber: 'asc' } },
        passages: { orderBy: { passageNumber: 'asc' } },
        sections: {
          include: {
            groups: {
              include: { questions: { orderBy: { questionNumber: 'asc' } } }
            }
          },
          orderBy: { number: 'asc' }
        },
        writingTasks: { orderBy: { taskNumber: 'asc' } }
      }
    });
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;