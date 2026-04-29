const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { gradeAttempt } = require('../services/claudeMarking');

const router = express.Router();
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const aiCache = new Map();

function calculateBand(score) {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  return 4.0;
}

function fallbackFeedback(rawScore, bandEstimate, studentName = 'Student', testType = 'Reading', paperCode = '') {
  return {
    studentName,
    testType,
    paperCode,
    score: `${rawScore}/40`,
    bandEstimate: String(bandEstimate),
    criterionScores: {},
    correctAnswers: [],
    studentAnswers: [],
    mistakeAnalysis: ["The AI is currently processing. Refresh in a few seconds for detailed analysis."],
    strengths: ["Test completed successfully."],
    weakAreas: ["Requires AI analysis."],
    improvementAdvice: ["Practice regularly and review wrong answers."],
    teacherSummary: "Student completed the test. Manual review recommended if AI remains unavailable.",
    progressComment: "No previous data available for comparison.",
    finalStudentReport: `You achieved a raw score of ${rawScore}/40 and a band estimate of ${bandEstimate}.`
  };
}

async function createAiFeedback(attempt, result, savedAnswers) {
  const attemptId = attempt.id;
  const studentName = attempt.student?.name || 'Student';
  const testType = String(attempt.paper?.testType || '').toUpperCase();
  
  console.log(`Generating ${testType} feedback for attempt ${attemptId}...`);

  // If already in DB, return it
  if (result.aiFeedbackJson) {
    try {
      return JSON.parse(result.aiFeedbackJson);
    } catch (e) {
      console.error('Failed to parse existing AI feedback:', e.message);
    }
  }

  // Fetch previous 3 completed attempts for context
  const previousAttempts = await prisma.attempt.findMany({
    where: {
      studentId: attempt.studentId,
      status: 'COMPLETED',
      id: { not: attempt.id }
    },
    include: { result: true },
    orderBy: { startedAt: 'desc' },
    take: 3
  });

  const previousResults = previousAttempts.map(a => ({
    date: a.startedAt,
    score: a.result?.rawScore,
    band: a.result?.bandEstimate
  }));

  let aiFeedback = null;

  if (testType === 'WRITING') {
    const sub = await prisma.writingSubmission.findUnique({ where: { attemptId } });
    if (!sub) return null;

    // Cache check
    if (sub.aiFeedback && sub.markingStatus === 'COMPLETE') {
      try {
        const cached = JSON.parse(sub.aiFeedback);
        if (cached) return cached;
      } catch (e) {}
    }

    // Delay to avoid rate limit bursts
    await new Promise(resolve => setTimeout(resolve, 2000));

    const task1Prompt = attempt.paper?.writingTasks?.find(t => t.taskNumber === 1)?.prompt || '';
    const task2Prompt = attempt.paper?.writingTasks?.find(t => t.taskNumber === 2)?.prompt || '';

    const { gradeWritingAttempt } = require('../services/claudeMarking');
    aiFeedback = await gradeWritingAttempt(
      sub.task1Response, task1Prompt,
      sub.task2Response, task2Prompt,
      studentName
    );
  } else {
    const answerReview = savedAnswers.map((a) => ({
      questionNumber: a.question?.questionNumber,
      questionType: a.question?.questionType,
      question: a.question?.content,
      studentAnswer: a.studentAnswer,
      correctAnswer: a.question?.correctAnswer,
      isCorrect: a.isCorrect
    }));

    const paperSummary = {
      studentName,
      title: attempt.paper?.title,
      paperCode: attempt.paper?.paperCode,
      testType,
      rawScore: result.rawScore,
      bandEstimate: result.bandEstimate,
      totalQuestions: attempt.paper?.questions?.length || 40,
      previousResults
    };

    aiFeedback = await gradeAttempt(answerReview, JSON.stringify(paperSummary));
  }

  if (aiFeedback) {
    // Persist to Result table
    await prisma.result.update({
      where: { attemptId },
      data: {
        aiFeedbackJson: JSON.stringify(aiFeedback),
        strengths: Array.isArray(aiFeedback.strengths) ? aiFeedback.strengths.join(', ') : (aiFeedback.strengths || null),
        weaknesses: Array.isArray(aiFeedback.weakAreas) ? aiFeedback.weakAreas.join(', ') : (aiFeedback.weakAreas || null),
        improvementAdvice: Array.isArray(aiFeedback.improvementAdvice) ? aiFeedback.improvementAdvice.join(', ') : (aiFeedback.improvementAdvice || null)
      }
    });

    // If writing, also update writingSubmission
    if (testType === 'WRITING') {
      const task1Band = parseFloat(aiFeedback.task1Band) || 5.0;
      const task2Band = parseFloat(aiFeedback.task2Band) || 5.0;
      const overallBand = parseFloat(aiFeedback.overallBand) || ((task1Band + task2Band) / 2);

      await prisma.writingSubmission.update({
        where: { attemptId },
        data: {
          task1Band: task1Band,
          task2Band: task2Band,
          overallBand: overallBand,
          aiFeedback: JSON.stringify({
            task1Band,
            task2Band,
            overallBand,
            task1Feedback: aiFeedback.task1Feedback || '',
            task2Feedback: aiFeedback.task2Feedback || '',
            strengths: aiFeedback.strengths || [],
            improvements: aiFeedback.improvements || []
          }),
          markingStatus: 'COMPLETE'
        }
      });
      aiCache.set(`writing_${attemptId}`, aiFeedback);
    } else if (testType === 'SPEAKING') {
      await prisma.speakingSubmission.update({
        where: { attemptId },
        data: {
          overallBand: aiFeedback.overallBand || aiFeedback.band,
          aiFeedback: JSON.stringify(aiFeedback),
          markingStatus: 'COMPLETE'
        }
      });
      aiCache.set(`speaking_${attemptId}`, aiFeedback);
    } else {
      aiCache.set(attemptId, aiFeedback);
    }
  } else {
    // AI failed - mark as failed so UI doesn't spin forever
    if (testType === 'WRITING') {
      await prisma.writingSubmission.update({
        where: { attemptId },
        data: { markingStatus: 'FAILED' }
      });
    } else if (testType === 'SPEAKING') {
      await prisma.speakingSubmission.update({
        where: { attemptId },
        data: { markingStatus: 'FAILED' }
      });
    }
  }

  return aiFeedback || fallbackFeedback(result.rawScore, result.bandEstimate, studentName, testType, attempt.paper?.paperCode);
}

router.get('/history/mine', auth, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: {
        studentId: req.user.id,
        status: 'COMPLETED'
      },
      include: {
        paper: {
          select: {
            title: true,
            testType: true,
            paperCode: true
          }
        },
        result: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    res.json(attempts);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      message: 'Error fetching history',
      details: error.message
    });
  }
});

router.get('/dashboard/summary', auth, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { studentId: req.user.id, status: 'COMPLETED' },
      include: { paper: true, result: true },
      orderBy: { id: 'desc' }
    });

    const bySubject = {};
    attempts.forEach(a => {
      const type = a.paper?.testType || 'READING';
      if (!bySubject[type]) bySubject[type] = [];
      if (a.result?.bandEstimate) bySubject[type].push(a.result.bandEstimate);
    });

    const summary = {};
    Object.entries(bySubject).forEach(([type, bands]) => {
      summary[type] = {
        average: (bands.reduce((a,b) => a+b, 0) / bands.length).toFixed(1),
        count: bands.length,
        best: Math.max(...bands).toFixed(1),
        latest: bands[0]?.toFixed(1)
      };
    });

    const overallBands = Object.values(bySubject).flat();
    const overall = overallBands.length > 0
      ? (overallBands.reduce((a,b) => a+b, 0) / overallBands.length).toFixed(1)
      : null;

    res.json({
      summary,
      overall,
      totalTests: attempts.length,
      recentAttempts: attempts.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { paperId } = req.body;

    if (!paperId) {
      return res.status(400).json({ message: 'paperId is required' });
    }

    const attempt = await prisma.attempt.create({
      data: {
        studentId: req.user.id,
        paperId: parseInt(paperId),
        status: 'IN_PROGRESS'
      }
    });

    res.json({
      id: attempt.id,
      attemptId: attempt.id
    });
  } catch (error) {
    console.error('Create attempt error:', error);
    res.status(500).json({
      message: 'Error starting attempt',
      details: error.message
    });
  }
});

router.post('/:id/start', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);

    const attempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: { status: 'IN_PROGRESS' },
      include: {
        paper: {
          include: {
            questions: {
              orderBy: {
                questionNumber: 'asc'
              }
            }
          }
        }
      }
    });

    res.json(attempt);
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({
      message: 'Error starting exam',
      details: error.message
    });
  }
});

router.get('/:id/result', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        paper: {
          include: {
            questions: {
              orderBy: { questionNumber: 'asc' }
            },
            writingTasks: {
              orderBy: { taskNumber: 'asc' }
            }
          }
        },
        answers: {
          include: {
            question: true
          }
        },
        result: true
      }
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    let aiFeedback = aiCache.get(attemptId);

    if (!aiFeedback && attempt.status === 'COMPLETED' && attempt.result) {
      if (attempt.result.aiFeedbackJson) {
        aiFeedback = JSON.parse(attempt.result.aiFeedbackJson);
      } else {
        aiFeedback = await createAiFeedback(attempt, attempt.result, attempt.answers);
      }
      aiCache.set(attemptId, aiFeedback);
    }

    res.json({
      ...attempt,
      aiFeedback
    });
  } catch (error) {
    console.error('Result error:', error);
    res.status(500).json({
      message: 'Error fetching result',
      details: error.message
    });
  }
});

router.put('/:id/autosave', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) return res.json({ saved: 0 });
    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.status === 'COMPLETED') return res.json({ saved: 0 });
    let saved = 0;
    for (const a of answers) {
      if (!a.questionId || a.studentAnswer === undefined) continue;
      await prisma.answer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: parseInt(a.questionId) } },
        create: { attemptId, questionId: parseInt(a.questionId), studentAnswer: String(a.studentAnswer) },
        update: { studentAnswer: String(a.studentAnswer) }
      });
      saved++;
    }
    res.json({ saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        paper: {
          include: {
            questions: {
              orderBy: { questionNumber: 'asc' }
            },
            passages: {
              orderBy: {
                passageNumber: 'asc'
              }
            },
            writingTasks: {
              orderBy: {
                taskNumber: 'asc'
              }
            },
            sections: {
              orderBy: { number: 'asc' },
              include: {
                groups: {
                  include: {
                    questions: { orderBy: { questionNumber: 'asc' } }
                  }
                }
              }
            }
          }
        },
        answers: true,
        result: true
      }
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Attempt fetch error:', error);
    res.status(500).json({
      message: 'Error fetching attempt',
      details: error.message
    });
  }
});

router.post('/:id/end', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const { answers, writingSubmission } = req.body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        paper: { include: { questions: { orderBy: { questionNumber: 'asc' } }, writingTasks: { orderBy: { taskNumber: 'asc' } } } },
        answers: { include: { question: true } }
      }
    });

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.status === 'COMPLETED') return res.json({ message: 'Already completed' });

    const testType = String(attempt.paper.testType || '').toUpperCase();
    let correctCount = 0;
    let bandEstimate = 0;

    if (testType === 'WRITING') {
      if (writingSubmission) {
        await prisma.writingSubmission.upsert({
          where: { attemptId },
          update: {
            task1Response: writingSubmission.task1Response,
            task2Response: writingSubmission.task2Response,
            task1WordCount: writingSubmission.task1Response?.split(/\s+/).length || 0,
            task2WordCount: writingSubmission.task2Response?.split(/\s+/).length || 0,
            markingStatus: 'PENDING_AI'
          },
          create: {
            attemptId,
            task1Response: writingSubmission.task1Response,
            task2Response: writingSubmission.task2Response,
            task1WordCount: writingSubmission.task1Response?.split(/\s+/).length || 0,
            task2WordCount: writingSubmission.task2Response?.split(/\s+/).length || 0,
            markingStatus: 'PENDING_AI'
          }
        });
      }
    } else {
      // If new answers sent, save them - otherwise keep existing autosaved answers
      await prisma.answer.deleteMany({ where: { attemptId } });
      let correctCount = 0;
      const allQuestions = attempt.paper.questions;
      const answerData = allQuestions.map(question => {
        const submitted = Array.isArray(answers)
          ? answers.find(a => parseInt(a.questionId) === question.id)
          : null;
        const studentAnswer = String(submitted?.studentAnswer || '').trim();
        const correctAnswers = String(question.correctAnswer || '').split('|').map(s => s.trim().toLowerCase());
        const isCorrect = studentAnswer.length > 0 &&
          correctAnswers.includes(studentAnswer.toLowerCase());
        if (isCorrect) correctCount++;
        return {
          attemptId,
          questionId: question.id,
          studentAnswer,
          isCorrect: studentAnswer.length === 0 ? false : isCorrect
        };
      });
      await prisma.answer.createMany({ data: answerData });

      // Recalculate score from whatever answers are in database
      const finalAnswers = await prisma.answer.findMany({ where: { attemptId } });
      correctCount = finalAnswers.filter(a => a.isCorrect).length;
      bandEstimate = calculateBand(correctCount);
    }

    await prisma.result.deleteMany({ where: { attemptId } });
    const result = await prisma.result.create({
      data: {
        attemptId,
        rawScore: testType === 'WRITING' ? null : correctCount,
        bandEstimate: testType === 'WRITING' ? null : bandEstimate
      }
    });

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { status: 'COMPLETED', endedAt: new Date() }
    });

    res.json({ message: 'Exam submitted', result });

    // Background AI
    try {
      let submissionData = [];
      if (testType === 'WRITING') {
        submissionData = await prisma.writingSubmission.findUnique({ where: { attemptId } });
      } else {
        submissionData = await prisma.answer.findMany({
          where: { attemptId },
          include: { question: true },
          orderBy: { questionId: 'asc' }
        });
      }
      const aiFeedback = await createAiFeedback(attempt, result, submissionData);
      aiCache.set(attemptId, aiFeedback);
    } catch (aiError) {
      console.error('Background AI error:', aiError);
    }
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ message: error.message });
  }
});
// AI feedback polling endpoint
router.get('/:id/ai-feedback', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    let aiFeedback = aiCache.get(attemptId);
    if (aiFeedback) return res.json({ status: 'ready', feedback: aiFeedback });

    const existingResult = await prisma.result.findUnique({ where: { attemptId } });
    if (existingResult?.aiFeedbackJson) {
      console.log('AI feedback from database - no API call');
      const feedback = JSON.parse(existingResult.aiFeedbackJson);
      aiCache.set(attemptId, feedback);
      return res.json({ status: 'ready', feedback });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        paper: { include: { questions: { orderBy: { questionNumber: 'asc' } }, writingTasks: { orderBy: { taskNumber: 'asc' } } } },
        answers: { include: { question: true } },
        result: true
      }
    });

    if (!attempt || attempt.status !== 'COMPLETED' || !attempt.result) {
      return res.json({ status: 'not_ready' });
    }

    console.log('Generating AI feedback for:', attempt.student?.name);
    const aiFeedbackData = await createAiFeedback(attempt, attempt.result, attempt.answers);

    if (aiFeedbackData) {
      aiCache.set(attemptId, aiFeedbackData);
      await prisma.result.update({
        where: { attemptId },
        data: { aiFeedbackJson: JSON.stringify(aiFeedbackData) }
      });
      return res.json({ status: 'ready', feedback: aiFeedbackData });
    }

    res.json({ status: 'error', message: 'AI generation failed' });
  } catch (err) {
    console.error('AI feedback error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});


const speakingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/speaking');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `speaking_${req.params.id}_${Date.now()}.webm`);
  }
});

const uploadSpeaking = multer({
  storage: speakingStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/:id/speaking/upload', auth, uploadSpeaking.single('audio'), async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const { partNumber } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No audio file' });

    const audioUrl = '/uploads/speaking/' + req.file.filename;
    const updateData = {};
    updateData[`part${partNumber}AudioUrl`] = audioUrl;

    await prisma.speakingSubmission.upsert({
      where: { attemptId },
      create: { attemptId, ...updateData, markingStatus: 'PENDING' },
      update: updateData
    });

    console.log('Speaking Part', partNumber, 'audio saved:', audioUrl);
    res.json({ success: true, audioUrl, partNumber });
  } catch (err) {
    console.error('Speaking upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/speaking/submit', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { student: true, speakingSubmission: true }
    });

    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { status: 'COMPLETED', endedAt: new Date() }
    });

    await prisma.result.upsert({
      where: { attemptId },
      create: { attemptId, rawScore: 0, bandEstimate: 0 },
      update: {}
    });

    res.json({ success: true, message: 'Speaking submitted. AI marking in progress.' });

    // Background transcription and marking
    try {
      const sub = attempt.speakingSubmission;
      if (!sub) return;

      const { transcribeAudioFile, markSpeaking } = require('../services/speakingService');
      const transcripts = {};

      for (const part of ['part1', 'part2', 'part3']) {
        const audioUrl = sub[`${part}AudioUrl`];
        if (audioUrl) {
          const filePath = path.join(__dirname, '../../', audioUrl);
          if (fs.existsSync(filePath)) {
            const transcript = await transcribeAudioFile(filePath);
            if (transcript) {
              transcripts[part] = transcript;
              await prisma.speakingSubmission.update({
                where: { attemptId },
                data: { [`${part}Transcript`]: transcript }
              });
            }
          }
        }
      }

      if (Object.keys(transcripts).length > 0) {
        const results = await markSpeaking(
          transcripts,
          attempt.student?.name,
          attempt.student?.expectedBand
        );

        const bands = Object.values(results).map(r => r.feedback?.band).filter(Boolean);
        const overallBand = bands.length > 0
          ? (bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(1)
          : null;

        await prisma.speakingSubmission.update({
          where: { attemptId },
          data: {
            part1Band: results.part1?.feedback?.band,
            part2Band: results.part2?.feedback?.band,
            part3Band: results.part3?.feedback?.band,
            overallBand: overallBand ? parseFloat(overallBand) : null,
            aiFeedback: JSON.stringify(results),
            markingStatus: 'COMPLETE'
          }
        });

        if (overallBand) {
          await prisma.result.update({
            where: { attemptId },
            data: { bandEstimate: parseFloat(overallBand) }
          });
        }

        console.log('Speaking marked. Overall band:', overallBand);
      }
    } catch (bgErr) {
      console.error('Speaking background error:', bgErr.message);
    }
  } catch (err) {
    console.error('Speaking submit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/speaking/result', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { paper: true, speakingSubmission: true, result: true, student: true }
    });
    if (!attempt) return res.status(404).json({ error: 'Not found' });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/speaking/feedback', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const sub = await prisma.speakingSubmission.findUnique({ where: { attemptId } });
    if (!sub) return res.json({ status: 'not_ready' });
    if (sub.markingStatus === 'COMPLETE' && sub.aiFeedback) {
      return res.json({ status: 'ready', feedback: JSON.parse(sub.aiFeedback), overallBand: sub.overallBand });
    }
    res.json({ status: 'pending', markingStatus: sub.markingStatus });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});
router.post('/:id/writing/submit', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const { task1Response, task2Response } = req.body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        paper: { include: { writingTasks: true } }
      }
    });

    console.log(`Step 1: Attempt ${attemptId} data fetched`);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const task1Words = (task1Response || '').trim().split(/\s+/).filter(Boolean).length;
    const task2Words = (task2Response || '').trim().split(/\s+/).filter(Boolean).length;

    console.log(`Step 2: Word counts calculated (${task1Words}, ${task2Words})`);

    // Save submission
    try {
      await prisma.writingSubmission.upsert({
        where: { attemptId },
        create: {
          attemptId,
          task1Response: task1Response || '',
          task2Response: task2Response || '',
          task1WordCount: task1Words,
          task2WordCount: task2Words,
          markingStatus: 'PENDING_AI'
        },
        update: {
          task1Response: task1Response || '',
          task2Response: task2Response || '',
          task1WordCount: task1Words,
          task2WordCount: task2Words,
          markingStatus: 'PENDING_AI'
        }
      });
      console.log(`Step 3: WritingSubmission upserted`);
    } catch (wsErr) {
      console.error('WritingSubmission Error:', wsErr);
      throw new Error('Failed to save writing submission to DB: ' + wsErr.message);
    }

    // Mark attempt complete
    try {
      await prisma.attempt.update({
        where: { id: attemptId },
        data: { status: 'COMPLETED', endedAt: new Date() }
      });
      console.log(`Step 4: Attempt marked COMPLETED`);
    } catch (attErr) {
      console.error('Attempt Update Error:', attErr);
      throw new Error('Failed to update attempt status: ' + attErr.message);
    }

    // Create placeholder result - use same logic as generic /submit for consistency
    try {
      await prisma.result.deleteMany({ where: { attemptId } });
      await prisma.result.create({
        data: { attemptId, rawScore: null, bandEstimate: null }
      });
      console.log(`Step 5: Result placeholder created`);
    } catch (resErr) {
      console.error('Result Creation Error:', resErr);
      throw new Error('Failed to create result placeholder: ' + resErr.message);
    }

    // Send response immediately
    res.json({ message: 'Writing submitted', task1Words, task2Words });
    console.log(`Step 6: Submission response sent`);

    // Background AI marking
    setTimeout(async () => {
      try {
        const updatedAttempt = await prisma.attempt.findUnique({
          where: { id: attemptId },
          include: { 
            student: true, 
            paper: { include: { writingTasks: true } },
            result: true
          }
        });

        if (updatedAttempt && updatedAttempt.result) {
          await createAiFeedback(updatedAttempt, updatedAttempt.result, []);
          console.log(`Background Writing AI complete for attempt ${attemptId}`);
        }
      } catch (aiErr) {
        console.error(`Writing AI background error for ${attemptId}:`, aiErr);
        await prisma.writingSubmission.update({
          where: { attemptId },
          data: { markingStatus: 'FAILED' }
        }).catch(() => {});
      }
    }, 500);
  } catch (err) {
    console.error('Writing submit error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get writing feedback
router.get('/:id/writing/feedback', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);

    let cached = aiCache.get(`writing_${attemptId}`);
    if (cached) return res.json({ status: 'ready', feedback: cached });

    const sub = await prisma.writingSubmission.findUnique({
      where: { attemptId }
    });

    if (!sub) return res.json({ status: 'not_ready' });
    if (sub.markingStatus === 'COMPLETE' && sub.aiFeedback) {
      const feedback = JSON.parse(sub.aiFeedback);
      aiCache.set(`writing_${attemptId}`, feedback);
      return res.json({ status: 'ready', feedback });
    }

    res.json({ status: 'pending', markingStatus: sub.markingStatus });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get writing submission for result page
router.get('/:id/writing/result', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        paper: { include: { writingTasks: true } },
        writingSubmission: true,
        result: true
      }
    });
    if (!attempt) return res.status(404).json({ message: 'Not found' });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/explain-answer', auth, async (req, res) => {
  try {
    const { studentAnswer, correctAnswer, questionText, questionType, explanation } = req.body;
    const { explainWrongAnswer } = require('../services/claudeMarking');
    const result = await explainWrongAnswer(questionText, questionType, studentAnswer, correctAnswer, explanation);
    res.json({ explanation: result });
  } catch (err) {
    console.error('Explain endpoint error:', err.message);
    res.status(500).json({ explanation: `The correct answer is "${req.body.correctAnswer}". Review the passage carefully for keywords related to this question.` });
  }
});

module.exports = router;