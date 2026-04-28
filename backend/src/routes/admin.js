const router = require('express').Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

function adminOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/audio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'audio_' + Date.now() + path.extname(file.originalname).toLowerCase());
  }
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only audio files allowed'));
  }
});

router.post('/papers/:id/upload-audio', auth, adminOnly, uploadAudio.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const audioUrl = '/uploads/audio/' + req.file.filename;
    const paper = await prisma.paper.update({
      where: { id: parseInt(req.params.id) },
      data: { audioUrl }
    });
    res.json({ success: true, audioUrl, paper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// Reorder papers
router.post('/papers/reorder', auth, adminOnly, async (req, res) => {
  const { orders } = req.body; // Array of { id, order }

  try {
    await prisma.$transaction(
      orders.map((o) =>
        prisma.paper.update({
          where: { id: o.id },
          data: { order: o.order }
        })
      )
    );
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ error: 'Failed to reorder papers' });
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
      orderBy: [
        { order: 'asc' },
        { paperCode: 'asc' }
      ]
    });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get papers' });
  }
});

router.post('/papers/import-ai', auth, adminOnly, async (req, res) => {
  try {
    const { rawText, testType, paperCode, title } = req.body;
    console.log('IMPORT AI CALLED - type:', testType, 'code:', paperCode, 'textLength:', rawText?.length);

    if (!rawText || rawText.trim().length < 10) {
      return res.status(400).json({ error: 'Please paste the paper text.' });
    }

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return res.status(500).json({ error: 'AI not configured on server. Check ANTHROPIC_API_KEY in Render environment.' });

    const type = (testType || 'READING').toUpperCase();

    let finalCode = String(paperCode || Date.now());
    const conflict = await prisma.paper.findFirst({ where: { paperCode: finalCode, testType: type } });
    if (conflict) finalCode = finalCode + '-' + Date.now().toString().slice(-4);

    let Anthropic;
    try { Anthropic = require('@anthropic-ai/sdk'); }
    catch(e) { return res.status(500).json({ error: 'Anthropic SDK not installed. Run: npm install @anthropic-ai/sdk' }); }

    const claude = new Anthropic({ apiKey: key });

    const prompts = {
      READING: `Extract this IELTS Reading paper. Return ONLY a raw JSON object, no markdown, no backticks, no explanation text before or after.

JSON structure required:
{
  "title": "paper title",
  "testType": "READING",
  "timeLimitMin": 60,
  "passages": [
    { "passageNumber": 1, "title": "passage title", "text": "complete passage text" }
  ],
  "questions": [
    {
      "passageNumber": 1,
      "questionNumber": 1,
      "questionType": "TRUE_FALSE_NOT_GIVEN",
      "content": "question text",
      "options": null,
      "correctAnswer": "TRUE",
      "explanation": "2-3 sentences explaining why this answer is correct referencing the passage"
    }
  ]
}

questionType options: TRUE_FALSE_NOT_GIVEN, MULTIPLE_CHOICE, SHORT_ANSWER, SENTENCE_COMPLETION, MATCHING_HEADINGS, SUMMARY_COMPLETION, MATCHING_INFORMATION
For MULTIPLE_CHOICE options must be array like ["A. text", "B. text", "C. text", "D. text"] and correctAnswer must be A B C or D
For TRUE_FALSE_NOT_GIVEN correctAnswer must be TRUE FALSE or NOT GIVEN

PAPER:
${rawText.substring(0, 14000)}`,

      WRITING: `Extract this IELTS Writing paper. Return ONLY a raw JSON object, no markdown, no backticks.

JSON structure required:
{
  "title": "IELTS Academic Writing Test",
  "testType": "WRITING",
  "timeLimitMin": 60,
  "tasks": [
    {
      "taskNumber": 1,
      "prompt": "complete task 1 question text",
      "chartDescription": "describe the chart or graph if present, or null",
      "minWords": 150
    },
    {
      "taskNumber": 2,
      "prompt": "complete task 2 essay question",
      "chartDescription": null,
      "minWords": 250
    }
  ]
}

PAPER:
${rawText.substring(0, 6000)}`,

      LISTENING: `Extract this IELTS Listening paper. Return ONLY a raw JSON object, no markdown, no backticks.

JSON structure required:
{
  "title": "IELTS Academic Listening Test",
  "testType": "LISTENING",
  "timeLimitMin": 40,
  "questions": [
    {
      "sectionNumber": 1,
      "questionNumber": 1,
      "questionType": "MULTIPLE_CHOICE",
      "content": "question text",
      "options": ["A. option", "B. option", "C. option"],
      "correctAnswer": "A",
      "explanation": "explanation of why this answer is correct"
    }
  ]
}

PAPER:
${rawText.substring(0, 10000)}`,

      SPEAKING: `Extract this IELTS Speaking paper. Return ONLY a raw JSON object, no markdown, no backticks.

JSON structure required:
{
  "title": "IELTS Academic Speaking Test",
  "testType": "SPEAKING",
  "timeLimitMin": 15,
  "parts": [
    {
      "partNumber": 1,
      "title": "Introduction and Interview",
      "questions": ["question 1", "question 2", "question 3"]
    },
    {
      "partNumber": 2,
      "title": "Individual Long Turn",
      "questions": ["full cue card with bullet points"]
    },
    {
      "partNumber": 3,
      "title": "Two-way Discussion",
      "questions": ["question 1", "question 2", "question 3"]
    }
  ]
}

PAPER:
${rawText.substring(0, 6000)}`
    };

    const prompt = prompts[type] || prompts.READING;

    console.log('Calling Claude for import type:', type);
    let response;
    try {
      response = await claude.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }]
      });
    } catch(aiErr) {
      console.error('Claude API error:', aiErr.message, aiErr.status);
      return res.status(500).json({ error: 'AI call failed: ' + aiErr.message + '. Check ANTHROPIC_API_KEY is valid.' });
    }

    const rawRes = response.content?.[0]?.text || '';
    console.log('Claude responded, length:', rawRes.length);

    let parsed;
    const attempts = [
      () => JSON.parse(rawRes),
      () => JSON.parse(rawRes.match(/\{[\s\S]*\}/)?.[0]),
      () => JSON.parse(rawRes.replace(/```json|```/g, '').trim()),
      () => JSON.parse(rawRes.substring(rawRes.indexOf('{'), rawRes.lastIndexOf('}') + 1))
    ];

    for (const attempt of attempts) {
      try { parsed = attempt(); if (parsed) break; } catch {}
    }

    if (!parsed) {
      console.error('All JSON parse attempts failed. Raw:', rawRes.substring(0, 500));
      return res.status(500).json({ error: 'AI returned invalid format. Please try again.', preview: rawRes.substring(0, 300) });
    }

    const paper = await prisma.paper.create({
      data: {
        paperCode: finalCode,
        testType: type,
        title: String(title || parsed.title || 'Imported Paper'),
        timeLimitMin: parseInt(parsed.timeLimitMin) || 60,
        instructions: 'Read carefully and answer all questions.',
        status: 'ACTIVE',
        assignedBatches: 'ALL'
      }
    });
    console.log('Paper created:', paper.id, paper.paperCode);

    let questionsCreated = 0, passagesCreated = 0, tasksCreated = 0;

    if (type === 'READING') {
      for (const p of (parsed.passages || [])) {
        try {
          await prisma.passage.create({
            data: { paperId: paper.id, passageNumber: parseInt(p.passageNumber)||1, title: String(p.title||'Passage'), text: String(p.text||'') }
          });
          passagesCreated++;
        } catch(e) { console.error('Passage error:', e.message); }
      }
      if ((parsed.questions||[]).length > 0) {
        const qData = parsed.questions.map(q => ({
          paperId: paper.id,
          passageNumber: parseInt(q.passageNumber)||1,
          questionNumber: parseInt(q.questionNumber)||1,
          questionType: q.questionType||'SHORT_ANSWER',
          content: String(q.content||''),
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: String(q.correctAnswer||''),
          explanation: q.explanation ? String(q.explanation) : null
        }));
        await prisma.question.createMany({ data: qData });
        questionsCreated = qData.length;
      }
    }

    if (type === 'WRITING') {
      for (const task of (parsed.tasks||[])) {
        try {
          await prisma.writingTask.create({
            data: { paperId: paper.id, taskNumber: parseInt(task.taskNumber)||1, prompt: String(task.prompt||''), chartUrl: null, minWords: parseInt(task.minWords)||(task.taskNumber===1?150:250) }
          });
          tasksCreated++;
        } catch(e) { console.error('Task error:', e.message); }
      }
    }

    if (type === 'LISTENING') {
      if ((parsed.questions||[]).length > 0) {
        const qData = parsed.questions.map(q => ({
          paperId: paper.id,
          passageNumber: parseInt(q.sectionNumber)||1,
          questionNumber: parseInt(q.questionNumber)||1,
          questionType: q.questionType||'SHORT_ANSWER',
          content: String(q.content||''),
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: String(q.correctAnswer||''),
          explanation: q.explanation ? String(q.explanation) : null
        }));
        await prisma.question.createMany({ data: qData });
        questionsCreated = qData.length;
      }
    }

    res.json({
      success: true,
      paperId: paper.id,
      paperCode: finalCode,
      testType: type,
      title: paper.title,
      passagesCreated,
      questionsCreated,
      tasksCreated,
      message: `✅ ${type} paper "${finalCode}" imported! ${questionsCreated} questions, ${passagesCreated} passages, ${tasksCreated} writing tasks created.`
    });

  } catch (err) {
    console.error('IMPORT FATAL:', err.message);
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
  const { questions, passages, ...rawPaperData } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Sanitize basic paper data
      const paperData = {
        paperCode: rawPaperData.paperCode,
        testType: rawPaperData.testType,
        title: rawPaperData.title,
        timeLimitMin: parseInt(rawPaperData.timeLimitMin) || 60,
        instructions: rawPaperData.instructions,
        status: rawPaperData.status,
        assignedBatches: rawPaperData.assignedBatches,
        audioUrl: rawPaperData.audioUrl,
        audioScript: rawPaperData.audioScript,
        order: rawPaperData.order !== undefined ? parseInt(rawPaperData.order) : undefined
      };

      const updatedPaper = await tx.paper.update({
        where: { id: paperId },
        data: paperData
      });

      // 2. Update questions if provided
      if (questions && Array.isArray(questions)) {
        for (const q of questions) {
          const qData = {
            passageNumber: q.passageNumber,
            questionNumber: parseInt(q.questionNumber),
            questionType: q.questionType,
            content: q.content,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            options: Array.isArray(q.options) ? JSON.stringify(q.options) : q.options
          };

          if (q.id && typeof q.id === 'number') {
            await tx.question.update({
              where: { id: q.id },
              data: qData
            });
          } else {
            await tx.question.create({
              data: { ...qData, paperId }
            });
          }
        }
      }

      // 3. Update passages if provided
      if (passages && Array.isArray(passages)) {
        for (const p of passages) {
          const pData = {
            passageNumber: p.passageNumber,
            title: p.title,
            text: p.text
          };

          if (p.id && typeof p.id === 'number') {
            await tx.passage.update({
              where: { id: p.id },
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
    const paperId = parseInt(req.params.id);
    console.log('Deleting paper:', paperId);

    await prisma.answer.deleteMany({ where: { attempt: { paperId } } });
    await prisma.result.deleteMany({ where: { attempt: { paperId } } });
    await prisma.writingSubmission.deleteMany({ where: { attempt: { paperId } } });
    await prisma.speakingSubmission.deleteMany({ where: { attempt: { paperId } } });
    await prisma.attempt.deleteMany({ where: { paperId } });
    await prisma.question.deleteMany({ where: { paperId } });
    await prisma.passage.deleteMany({ where: { paperId } });
    await prisma.writingTask.deleteMany({ where: { paperId } });
    await prisma.paper.delete({ where: { id: paperId } });

    console.log('Paper deleted:', paperId);
    res.json({ success: true, message: 'Paper deleted successfully' });
  } catch (err) {
    console.error('Delete paper error:', err.message);
    res.status(500).json({ error: 'Failed to delete: ' + err.message });
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