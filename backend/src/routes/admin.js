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
      orderBy: { id: 'desc' } // Changed from createdAt
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
      data: { name, email: email.toLowerCase().trim(), password: hashed, batch: batch || 'GENERAL', role: 'STUDENT' }
    });
    res.json({ id: student.id, name: student.name, email: student.email, batch: student.batch });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.get('/papers', auth, adminOnly, async (req, res) => {
  try {
    const papers = await prisma.paper.findMany({
      orderBy: { id: 'desc' } // Changed from createdAt
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
  try {
    const paper = await prisma.paper.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update paper' });
  }
});

router.delete('/papers/:id', auth, adminOnly, async (req, res) => {
  try {
    await prisma.paper.delete({ where: { id: parseInt(req.params.id) } });
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

router.get('/results', auth, adminOnly, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { status: 'COMPLETE' },
      include: {
        student: { select: { name: true, batch: true, email: true } },
        paper: { select: { paperCode: true, testType: true, title: true } },
        result: true
      },
      orderBy: { endedAt: 'desc' }
    });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get results' });
  }
});

module.exports = router;
