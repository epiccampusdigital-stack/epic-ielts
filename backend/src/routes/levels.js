const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// GET all levels with sections and paper availability
router.get('/', auth, async (req, res) => {
  try {
    const levels = await prisma.level.findMany({
      where: { isActive: true },
      orderBy: { levelNumber: 'asc' },
      include: { sections: { where: { isActive: true }, orderBy: { sectionNumber: 'asc' } } }
    });

    const allPapers = await prisma.paper.findMany({
      select: { paperCode: true, testType: true, id: true, title: true, status: true }
    });

    const paperMap = {};
    allPapers.forEach(p => {
      if (p.status === 'PUBLISHED') {
        paperMap[`${p.testType}_${p.paperCode}`] = p;
      }
    });

    const levelsWithStatus = levels.map(level => ({
      ...level,
      sections: level.sections.map(section => {
        const papers = {
          reading:   paperMap[`READING_${section.readingCode}`]   || null,
          writing:   paperMap[`WRITING_${section.writingCode}`]   || null,
          listening: paperMap[`LISTENING_${section.listeningCode}`] || null,
          speaking:  paperMap[`SPEAKING_${section.speakingCode}`]  || null,
        };
        return {
          ...section,
          papers,
          isComplete: Object.values(papers).every(Boolean)
        };
      })
    }));

    res.json(levelsWithStatus);
  } catch (err) {
    console.error('Levels fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

// Admin: GET all levels (includes draft papers too)
router.get('/admin', auth, async (req, res) => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { levelNumber: 'asc' },
      include: { sections: { orderBy: { sectionNumber: 'asc' } } }
    });

    const allPapers = await prisma.paper.findMany({
      select: { paperCode: true, testType: true, id: true, title: true, status: true }
    });

    const paperMap = {};
    allPapers.forEach(p => {
      paperMap[`${p.testType}_${p.paperCode}`] = p;
    });

    const levelsWithStatus = levels.map(level => ({
      ...level,
      sections: level.sections.map(section => {
        const papers = {
          reading:   paperMap[`READING_${section.readingCode}`]   || null,
          writing:   paperMap[`WRITING_${section.writingCode}`]   || null,
          listening: paperMap[`LISTENING_${section.listeningCode}`] || null,
          speaking:  paperMap[`SPEAKING_${section.speakingCode}`]  || null,
        };
        return {
          ...section,
          papers,
          isComplete: Object.values(papers).every(Boolean)
        };
      })
    }));

    res.json(levelsWithStatus);
  } catch (err) {
    console.error('Admin levels fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

// Admin: update a section's paper codes
router.put('/sections/:id', auth, async (req, res) => {
  try {
    const { readingCode, writingCode, listeningCode, speakingCode } = req.body;
    const updated = await prisma.levelSection.update({
      where: { id: parseInt(req.params.id) },
      data: { readingCode, writingCode, listeningCode, speakingCode }
    });
    res.json(updated);
  } catch (err) {
    console.error('Section update error:', err);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

module.exports = router;
