const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/learn/modules
// Returns all modules with lessons and student progress
router.get('/modules', auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const modules = await prisma.learnModule.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            estimatedMin: true,
            progress: {
              where: { studentId },
              select: { completedAt: true }
            }
          }
        }
      }
    });

    // Shape response: add completedCount and isCompleted per lesson
    const shaped = modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      description: mod.description,
      icon: mod.icon,
      color: mod.color,
      order: mod.order,
      lessons: mod.lessons.map(l => ({
        id: l.id,
        title: l.title,
        order: l.order,
        estimatedMin: l.estimatedMin,
        isCompleted: l.progress.length > 0,
        completedAt: l.progress[0]?.completedAt || null,
      })),
      totalLessons: mod.lessons.length,
      completedLessons: mod.lessons.filter(
        l => l.progress.length > 0
      ).length,
    }));

    res.json(shaped);
  } catch (err) {
    console.error('Learn modules error:', err.message);
    res.status(500).json({ error: 'Failed to load modules' });
  }
});

// GET /api/learn/lessons/:lessonId
// Returns a single lesson with content
router.get('/lessons/:lessonId', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const lessonId = parseInt(req.params.lessonId);

    if (!lessonId) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    const lesson = await prisma.learnLesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            icon: true,
            color: true,
          }
        },
        progress: {
          where: { studentId },
          select: { completedAt: true }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get prev/next lessons in same module
    const siblings = await prisma.learnLesson.findMany({
      where: { moduleId: lesson.moduleId },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, order: true }
    });

    const currentIndex = siblings.findIndex(s => s.id === lessonId);
    const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const next = currentIndex < siblings.length - 1 
      ? siblings[currentIndex + 1] 
      : null;

    res.json({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      estimatedMin: lesson.estimatedMin,
      order: lesson.order,
      module: lesson.module,
      isCompleted: lesson.progress.length > 0,
      completedAt: lesson.progress[0]?.completedAt || null,
      prev,
      next,
      lessonNumber: currentIndex + 1,
      totalLessons: siblings.length,
    });
  } catch (err) {
    console.error('Learn lesson error:', err.message);
    res.status(500).json({ error: 'Failed to load lesson' });
  }
});

// POST /api/learn/progress/:lessonId
// Marks a lesson as complete for the current student
router.post('/progress/:lessonId', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const lessonId = parseInt(req.params.lessonId);

    if (!lessonId) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    // Verify lesson exists
    const lesson = await prisma.learnLesson.findUnique({
      where: { id: lessonId },
      select: { id: true, title: true }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Upsert — safe to call multiple times
    const progress = await prisma.learnProgress.upsert({
      where: {
        studentId_lessonId: { studentId, lessonId }
      },
      create: { studentId, lessonId },
      update: { completedAt: new Date() }
    });

    res.json({ 
      success: true, 
      lessonId,
      completedAt: progress.completedAt 
    });
  } catch (err) {
    console.error('Learn progress error:', err.message);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

module.exports = router;
