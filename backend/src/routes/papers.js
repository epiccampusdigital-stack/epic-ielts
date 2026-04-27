const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        status: true
      },
      orderBy: { id: 'desc' }
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