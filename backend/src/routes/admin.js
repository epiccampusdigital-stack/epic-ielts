const router = require('express').Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/audio';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only audio files allowed'));
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/papers/:id/upload-audio', auth, adminOnly, uploadAudio.single('audio'), async (req, res) => {
  try {
    const audioUrl = `/uploads/audio/${req.file.filename}`;
    const paper = await prisma.paper.update({
      where: { id: parseInt(req.params.id) },
      data: { audioUrl, audioScript: req.body.script || null }
    });
    res.json({ audioUrl, paper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const prisma = new PrismaClient();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.get('/test-ai', auth, adminOnly, async (req, res) => {
  try {
    const { gradeAttempt } = require('../services/claudeMarking');
    const testResult = await gradeAttempt(
      [{ questionNumber: 1, questionType: 'MULTIPLE_CHOICE', question: 'Test question', studentAnswer: 'A', correctAnswer: 'B', isCorrect: false }],
      JSON.stringify({ studentName: 'Test', rawScore: 20, bandEstimate: 5.5, testType: 'READING', paperCode: 'TEST' })
    );
    res.json({ working: !!testResult, result: testResult });
  } catch (err) {
    res.status(500).json({ working: false, error: err.message });
  }
});

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

router.post('/papers/import-ai', auth, adminOnly, async (req, res) => {
  try {
    const { rawText, testType, paperCode, title } = req.body;
    if (!rawText) return res.status(400).json({ error: 'rawText is required' });

    let anthropic;
    try {
      const sdk = require('@anthropic-ai/sdk');
      anthropic = new (sdk.default || sdk.Anthropic)({ apiKey: process.env.ANTHROPIC_API_KEY });
    } catch (e) {
      return res.status(500).json({ error: 'AI SDK not available' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are an IELTS paper parser. Extract all content from this IELTS paper and return ONLY valid JSON.

Extract:
- All passages with their text
- All questions with question number, type, content, options (if MC), correct answer, and explanation
- Question types must be one of: TRUE_FALSE_NOT_GIVEN, MULTIPLE_CHOICE, SHORT_ANSWER, SENTENCE_COMPLETION, MATCHING_HEADINGS, SUMMARY_COMPLETION, MATCHING_INFORMATION

Return this exact JSON structure:
{
  "title": "paper title",
  "testType": "READING",
  "timeLimitMin": 60,
  "passages": [
    { "passageNumber": 1, "title": "passage title", "text": "full passage text" }
  ],
  "questions": [
    {
      "passageNumber": 1,
      "questionNumber": 1,
      "questionType": "TRUE_FALSE_NOT_GIVEN",
      "content": "question text",
      "options": null,
      "correctAnswer": "TRUE",
      "explanation": "The passage states X which means the answer is TRUE because..."
    }
  ]
}

For MULTIPLE_CHOICE questions, options should be an array like ["A. option one", "B. option two", "C. option three", "D. option four"]
For TRUE_FALSE_NOT_GIVEN the correctAnswer must be TRUE, FALSE, or NOT GIVEN
For SHORT_ANSWER the correctAnswer should be the exact word or phrase from the passage

PAPER TEXT:
${rawText.substring(0, 8000)}`
      }]
    });

    const text = response.content[0].text;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return res.status(500).json({ error: 'AI could not parse the paper structure' });
    }

    // Create the paper
    const paper = await prisma.paper.create({
      data: {
        paperCode: paperCode || `AI-${Date.now()}`,
        testType: (testType || parsed.testType || 'READING').toUpperCase(),
        title: title || parsed.title || 'Imported Paper',
        timeLimitMin: parsed.timeLimitMin || 60,
        instructions: 'Read the passages carefully and answer all questions.',
        status: 'ACTIVE',
        assignedBatches: 'ALL'
      }
    });

    // Create questions
    if (parsed.questions && parsed.questions.length > 0) {
      const questionsData = parsed.questions.map(q => ({
        paperId: paper.id,
        passageNumber: q.passageNumber || 1,
        questionNumber: q.questionNumber,
        questionType: q.questionType || 'SHORT_ANSWER',
        content: q.content,
        options: q.options ? JSON.stringify(q.options) : null,
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || null
      }));
      await prisma.question.createMany({ data: questionsData });
    }

    res.json({
      success: true,
      paper,
      questionsCreated: parsed.questions?.length || 0,
      passagesFound: parsed.passages?.length || 0
    });
  } catch (err) {
    console.error('Import AI error:', err);
    res.status(500).json({ error: 'Import failed: ' + err.message });
  }
});

router.post('/papers', auth, adminOnly, async (req, res) => {
  try {
    const { paperCode, testType, title, timeLimitMin, instructions, status } = req.body;
    const paper = await prisma.paper.create({
      data: {
        paperCode: String(paperCode),
        testType: String(testType).toUpperCase(),
        title: String(title),
        timeLimitMin: parseInt(timeLimitMin) || 60,
        instructions: instructions || '',
        status: status || 'ACTIVE',
        assignedBatches: 'ALL'
      }
    });
    res.json(paper);
  } catch (err) {
    console.error('Create paper error:', err);
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'A paper with this code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create paper: ' + err.message });
    }
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