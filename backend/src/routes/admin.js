const router = require('express').Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const adminOnly = require('../middleware/adminOnly');

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

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/images');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'chart_' + Date.now() + path.extname(file.originalname).toLowerCase());
  }
});
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
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

router.post('/papers/:id/upload-image', auth, adminOnly, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageUrl = '/uploads/images/' + req.file.filename;
    res.json({ success: true, imageUrl });
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
  "title": "paper title",
  "testType": "LISTENING",
  "timeLimitMin": 30,
  "sections": [
    {
      "number": 1,
      "description": "Recording 1 - [describe context]",
      "groups": [
        {
          "groupType": "FORM_COMPLETION",
          "instruction": "Complete the form below...",
          "wordLimit": "ONE WORD AND/OR A NUMBER",
          "imageUrl": null,
          "tableData": null,
          "questions": [
            {
              "questionNumber": 1,
              "questionType": "FORM_COMPLETION",
              "content": "Full Name: Sarah ___",
              "correctAnswer": "Sarah|Sarah Smith",
              "explanation": "reference to the audio"
            }
          ]
        }
      ]
    }
  ]
}

questionType options: MULTIPLE_CHOICE, FORM_COMPLETION, MAP_LABELING, TABLE_COMPLETION, NOTE_COMPLETION, SENTENCE_COMPLETION, SHORT_ANSWER
For MAP_LABELING, set "imageUrl": "[PLACEHOLDER]".
For TABLE_COMPLETION, provide "tableData": { "headers": ["col1", "col2"], "rows": [["cell1", "{blank1}"]] }.
CRITICAL: Use {blank1}, {blank2} etc. inside cells where questions are.
Question numbers must run 1–40 across the whole paper.

PAPER:
${rawText.substring(0, 14000)}`,

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
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 8000,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }]
      });
    } catch(aiErr) {
      console.error('Claude API error:', aiErr.message, aiErr.status);
      return res.status(500).json({ error: 'AI call failed: ' + aiErr.message });
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
      return res.status(500).json({ error: 'AI returned invalid format.' });
    }

    const paper = await prisma.paper.create({
      data: {
        paperCode: finalCode,
        testType: type,
        title: String(title || parsed.title || 'Imported Paper'),
        timeLimitMin: parseInt(parsed.timeLimitMin) || 60,
        instructions: parsed.instructions || 'Read carefully and answer all questions.',
        status: 'ACTIVE',
        assignedBatches: 'ALL'
      }
    });

    if (type === 'READING') {
      for (const p of (parsed.passages || [])) {
        await prisma.passage.create({
          data: { paperId: paper.id, passageNumber: parseInt(p.passageNumber)||1, title: String(p.title||'Passage'), text: String(p.text||'') }
        });
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
      }
    }

    if (type === 'WRITING') {
      for (const task of (parsed.tasks||[])) {
        await prisma.writingTask.create({
          data: { paperId: paper.id, taskNumber: parseInt(task.taskNumber)||1, prompt: String(task.prompt||''), chartUrl: null, minWords: parseInt(task.minWords)||(task.taskNumber===1?150:250) }
        });
      }
    }

    if (type === 'LISTENING') {
      for (const s of (parsed.sections || [])) {
        const section = await prisma.section.create({
          data: { paperId: paper.id, number: parseInt(s.number), description: s.description }
        });
        for (const g of (s.groups || [])) {
          // Normalize tableData if it exists (convert strings with {blank1} to objects)
          let tableData = g.tableData;
          if (tableData && Array.isArray(tableData.rows)) {
            tableData.rows = tableData.rows.map(row => 
              row.map(cell => {
                if (typeof cell === 'string') {
                  const match = cell.match(/\{blank(\d+)\}/i);
                  if (match) return { text: '', blank: true, questionNumber: parseInt(match[1]) };
                  return { text: cell, blank: false };
                }
                return cell;
              })
            );
          }

          const group = await prisma.questionGroup.create({
            data: {
              sectionId: section.id,
              groupType: g.groupType,
              instruction: g.instruction,
              wordLimit: g.wordLimit,
              tableData: tableData ? JSON.parse(JSON.stringify(tableData)) : null,
              imageUrl: g.imageUrl === '[PLACEHOLDER]' ? null : g.imageUrl
            }
          });
          if (Array.isArray(g.questions)) {
            const qData = g.questions.map(q => ({
              paperId: paper.id,
              groupId: group.id,
              sectionNumber: section.number,
              questionNumber: parseInt(q.questionNumber),
              questionType: q.questionType || g.groupType,
              content: String(q.content || ''),
              options: q.options ? JSON.stringify(q.options) : null,
              correctAnswer: String(q.correctAnswer || ''),
              explanation: q.explanation || null
            }));
            await prisma.question.createMany({ data: qData });
          }
        }
      }
    }

    res.json({ success: true, paperId: paper.id, paperCode: finalCode, testType: type });

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
    res.status(500).json({ error: 'Failed to create paper: ' + err.message });
  }
});

router.put('/papers/:id', auth, adminOnly, async (req, res) => {
  const paperId = parseInt(req.params.id);
  const { 
    questions, 
    passages, 
    sections, 
    writingTasks,
    deletedQuestionIds, 
    deletedPassageIds, 
    deletedSectionIds, 
    deletedGroupIds,
    deletedWritingTaskIds,
    ...rawPaperData 
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const paperData = {
        paperCode: rawPaperData.paperCode,
        testType: rawPaperData.testType,
        title: rawPaperData.title,
        timeLimitMin: parseInt(rawPaperData.timeLimitMin) || 60,
        instructions: rawPaperData.instructions,
        status: rawPaperData.status,
        assignedBatches: rawPaperData.assignedBatches,
        practiceMode: rawPaperData.practiceMode,
        audioUrl: rawPaperData.audioUrl,
        order: rawPaperData.order !== undefined ? parseInt(rawPaperData.order) : undefined
      };
      Object.keys(paperData).forEach(k => paperData[k] === undefined && delete paperData[k]);
      const updatedPaper = await tx.paper.update({ where: { id: paperId }, data: paperData });

      // Deletions
      if (deletedQuestionIds?.length) await tx.question.deleteMany({ where: { id: { in: deletedQuestionIds }, paperId } });
      if (deletedPassageIds?.length) await tx.passage.deleteMany({ where: { id: { in: deletedPassageIds }, paperId } });
      if (deletedGroupIds?.length) await tx.questionGroup.deleteMany({ where: { id: { in: deletedGroupIds } } });
      if (deletedSectionIds?.length) await tx.section.deleteMany({ where: { id: { in: deletedSectionIds }, paperId } });
      if (deletedWritingTaskIds?.length) await tx.writingTask.deleteMany({ where: { id: { in: deletedWritingTaskIds }, paperId } });

      // Flat Questions (Reading)
      if (Array.isArray(questions)) {
        for (const q of questions) {
          const qData = {
            paperId,
            passageNumber: q.passageNumber,
            questionNumber: q.questionNumber,
            questionType: q.questionType,
            content: q.content,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            options: q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : null
          };
          if (q.id) await tx.question.update({ where: { id: q.id }, data: qData });
          else await tx.question.create({ data: qData });
        }
      }

      // Passages
      if (Array.isArray(passages)) {
        for (const p of passages) {
          if (p.id) await tx.passage.update({ where: { id: p.id }, data: { passageNumber: p.passageNumber, title: p.title, text: p.text } });
          else await tx.passage.create({ data: { ...p, paperId, id: undefined } });
        }
      }

      // Writing Tasks
      if (Array.isArray(writingTasks)) {
        for (const wt of writingTasks) {
          if (wt.id) await tx.writingTask.update({ where: { id: wt.id }, data: { taskNumber: wt.taskNumber, prompt: wt.prompt, chartUrl: wt.chartUrl, minWords: wt.minWords } });
          else await tx.writingTask.create({ data: { ...wt, paperId, id: undefined } });
        }
      }

      // Sections (hierarchical - Listening)
      if (Array.isArray(sections)) {
        for (const s of sections) {
          let sId = s.id;
          if (sId) {
            await tx.section.update({ where: { id: sId }, data: { number: s.number, description: s.description, audioUrl: s.audioUrl } });
          } else {
            const newS = await tx.section.create({ data: { paperId, number: s.number, description: s.description, audioUrl: s.audioUrl } });
            sId = newS.id;
          }

          if (Array.isArray(s.groups)) {
            for (const g of s.groups) {
              let gId = g.id;
              if (gId) {
                await tx.questionGroup.update({ where: { id: gId }, data: { groupType: g.groupType, instruction: g.instruction, wordLimit: g.wordLimit, tableData: g.tableData, imageUrl: g.imageUrl } });
              } else {
                const newG = await tx.questionGroup.create({ data: { sectionId: sId, groupType: g.groupType, instruction: g.instruction, wordLimit: g.wordLimit, tableData: g.tableData, imageUrl: g.imageUrl } });
                gId = newG.id;
              }

              if (Array.isArray(g.questions)) {
                for (const q of g.questions) {
                  const qData = {
                    paperId,
                    groupId: gId,
                    questionNumber: q.questionNumber,
                    questionType: q.questionType,
                    content: q.content,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    options: q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : null
                  };
                  if (q.id) await tx.question.update({ where: { id: q.id }, data: qData });
                  else await tx.question.create({ data: qData });
                }
              }
            }
          }
        }
      }

      return updatedPaper;
    });
    res.json(result);
  } catch (err) {
    console.error('Update paper error:', err.message);
    res.status(500).json({ error: 'Failed to update paper: ' + err.message });
  }
});

router.get('/papers/:id', auth, adminOnly, async (req, res) => {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        questions:    { orderBy: { questionNumber: 'asc' } },
        passages:     { orderBy: { passageNumber:  'asc' } },
        sections: {
          include: {
            groups: {
              include: { questions: { orderBy: { questionNumber: 'asc' } } }
            }
          },
          orderBy: { number: 'asc' }
        },
        writingTasks: { orderBy: { taskNumber:     'asc' } }
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