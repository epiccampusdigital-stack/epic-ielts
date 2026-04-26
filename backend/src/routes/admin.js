const router = require('express').Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.get('/students', auth, adminOnly, async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      select: { id: true, name: true, email: true, batch: true, role: true },
      orderBy: { id: 'desc' }
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get students' });
  }
});

router.post('/students', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, batch } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashed,
        batch: batch || 'GENERAL',
        role: 'STUDENT'
      }
    });
    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      batch: student.batch
    });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.get('/papers', auth, adminOnly, async (req, res) => {
  try {
    const papers = await prisma.paper.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get papers' });
  }
});

router.post('/papers', auth, adminOnly, async (req, res) => {
  try {
    const paper = await prisma.paper.create({ data: req.body });
    res.json(paper);
  } catch (err) {
    console.error('Create paper error:', err);
    res.status(500).json({ error: 'Failed to create paper' });
  }
});

router.put('/papers/:id', auth, adminOnly, async (req, res) => {
  const paperId = parseInt(req.params.id);
  const { questions, passages, ...paperData } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update basic paper data
      const updatedPaper = await tx.paper.update({
        where: { id: paperId },
        data: paperData
      });

      // 2. Update questions if provided
      if (questions && Array.isArray(questions)) {
        for (const q of questions) {
          const { id, paperId: qPaperId, ...qData } = q;
          if (id) {
            await tx.question.update({
              where: { id },
              data: qData
            });
          }
        }
      }

      // 3. Update passages if provided
      if (passages && Array.isArray(passages)) {
        for (const p of passages) {
          const { id, paperId: pPaperId, ...pData } = p;
          if (id) {
            await tx.passage.update({
              where: { id },
              data: pData
            });
          } else {
            await tx.passage.create({
              data: { ...pData, paperId }
            });
          }
        }
      }

      return updatedPaper;
    });

    res.json(result);
  } catch (err) {
    console.error('Update paper error:', err);
    res.status(500).json({ error: 'Failed to update paper: ' + err.message });
  }
});

// Update the GET detail route as well to include passages
router.get('/papers/:id', auth, adminOnly, async (req, res) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        questions: { orderBy: { questionNumber: 'asc' } },
        passages: { orderBy: { passageNumber: 'asc' } }
      }
    });
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get paper' });
  }
});

router.delete('/papers/:id', auth, adminOnly, async (req, res) => {
  try {
    await prisma.question.deleteMany({
      where: { paperId: parseInt(req.params.id) }
    });
    await prisma.paper.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

router.post('/papers/:id/questions', auth, adminOnly, async (req, res) => {
  try {
    const question = await prisma.question.create({
      data: { ...req.body, paperId: parseInt(req.params.id) }
    });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// FIXED: uses COMPLETED not COMPLETE
router.get('/results', auth, adminOnly, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { status: 'COMPLETED' },
      include: {
        student: {
          select: { name: true, batch: true, email: true }
        },
        paper: {
          select: { paperCode: true, testType: true, title: true }
        },
        result: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get results' });
  }
});

// Add writing task to paper
router.post('/papers/:id/writing-tasks', auth, adminOnly, async (req, res) => {
  try {
    const { taskNumber, prompt, chartUrl, minWords } = req.body;
    const task = await prisma.writingTask.create({
      data: {
        paperId: parseInt(req.params.id),
        taskNumber: parseInt(taskNumber),
        prompt,
        chartUrl: chartUrl || null,
        minWords: parseInt(minWords) || (taskNumber === 1 ? 150 : 250)
      }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create writing task' });
  }
});

// Get paper with writing tasks
router.get('/papers/:id/full', auth, adminOnly, async (req, res) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { questions: true, writingTasks: { orderBy: { taskNumber: 'asc' } } }
    });
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get paper' });
  }
});

module.exports = router;