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
        id: true, paperCode: true, testType: true,
        title: true, timeLimitMin: true, status: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(papers);
  } catch (err) {
    console.error('Papers error:', err);
    res.status(500).json({ error: 'Failed to get papers' });
  }
});

router.get('/debug/all', async (req, res) => {
  try {
    const papers = await prisma.paper.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    res.json(papers);
  } catch (err) {
    console.error('Debug papers error:', err);
    res.status(500).json({ error: 'Failed to get all papers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: {
        id: parseInt(req.params.id)
      },
      include: {
        passages: {
          orderBy: { passageNumber: 'asc' }
        },
        questions: {
          orderBy: {
            questionNumber: 'asc'
          }
        }
      }
    });

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    res.json(paper);
  } catch (err) {
    console.error('Paper error:', err);
    res.status(500).json({ error: 'Failed to get paper' });
  }
});

module.exports = router;