const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { gradeAttempt } = require('../services/claudeMarking');

const router = express.Router();
const prisma = new PrismaClient();

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
  const studentName = attempt.student?.name || 'Student';
  
  // Fetch previous 3 completed attempts for this student (excluding current one)
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
    testType: attempt.paper?.testType,
    rawScore: result.rawScore,
    bandEstimate: result.bandEstimate,
    totalQuestions: attempt.paper?.questions?.length || 40,
    previousResults
  };

  const ai = await gradeAttempt(answerReview, JSON.stringify(paperSummary));
  return ai || fallbackFeedback(result.rawScore, result.bandEstimate, studentName, attempt.paper?.testType, attempt.paper?.paperCode);
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
              orderBy: {
                questionNumber: 'asc'
              }
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
      aiFeedback = await createAiFeedback(attempt, attempt.result, attempt.answers);
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
              orderBy: {
                questionNumber: 'asc'
              }
            },
            passages: {
              orderBy: {
                passageNumber: 'asc'
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
        paper: { include: { questions: true } },
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
      if (Array.isArray(answers) && answers.length > 0) {
        await prisma.answer.deleteMany({ where: { attemptId } });
        const answerData = answers.map(a => {
          const question = attempt.paper.questions.find(q => q.id === parseInt(a.questionId));
          const studentAnswer = String(a.studentAnswer || '').trim();
          const correctAnswer = String(question?.correctAnswer || '').trim();
          const isCorrect = correctAnswer.toLowerCase() === studentAnswer.toLowerCase();
          return { attemptId, questionId: parseInt(a.questionId), studentAnswer, isCorrect };
        });
        await prisma.answer.createMany({ data: answerData });
      } else {
        // Timer ran out - use autosaved answers already in database
        const existingAnswers = await prisma.answer.findMany({
          where: { attemptId },
          include: { question: true }
        });
        for (const ans of existingAnswers) {
          const studentAnswer = String(ans.studentAnswer || '').trim().toLowerCase();
          const correctAnswer = String(ans.question?.correctAnswer || '').trim().toLowerCase();
          const isCorrect = studentAnswer === correctAnswer;
          await prisma.answer.update({
            where: { id: ans.id },
            data: { isCorrect }
          });
        }
      }

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

    // Check cache first
    let aiFeedback = aiCache.get(attemptId);
    if (aiFeedback) {
      console.log('Returning cached AI feedback for attempt', attemptId);
      return res.json({ status: 'ready', feedback: aiFeedback });
    }

    // Fetch attempt with all needed data
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        paper: { include: { questions: true } },
        answers: { include: { question: true } },
        result: true
      }
    });

    if (!attempt || !attempt.result) {
      return res.json({ status: 'not_ready', message: 'Result not ready yet' });
    }

    if (attempt.status !== 'COMPLETED') {
      return res.json({ status: 'not_ready', message: 'Exam not completed' });
    }

    console.log('Generating AI feedback on demand for attempt', attemptId);
    aiFeedback = await createAiFeedback(attempt, attempt.result, attempt.answers);

    if (aiFeedback) {
      aiCache.set(attemptId, aiFeedback);
      return res.json({ status: 'ready', feedback: aiFeedback });
    }

    res.json({ status: 'error', message: 'AI feedback generation failed' });
  } catch (err) {
    console.error('AI feedback endpoint error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});


// Submit writing exam
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

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const task1Words = task1Response?.trim().split(/\s+/).filter(Boolean).length || 0;
    const task2Words = task2Response?.trim().split(/\s+/).filter(Boolean).length || 0;

    // Save submission
    await prisma.writingSubmission.upsert({
      where: { attemptId },
      create: {
        attemptId,
        task1Response,
        task2Response,
        task1WordCount: task1Words,
        task2WordCount: task2Words,
        markingStatus: 'PENDING'
      },
      update: {
        task1Response,
        task2Response,
        task1WordCount: task1Words,
        task2WordCount: task2Words,
        markingStatus: 'PENDING'
      }
    });

    // Mark attempt complete
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { status: 'COMPLETED', endedAt: new Date() }
    });

    // Create placeholder result
    await prisma.result.upsert({
      where: { attemptId },
      create: { attemptId, rawScore: 0, bandEstimate: 0 },
      update: {}
    });

    // Send response immediately
    res.json({ message: 'Writing submitted', task1Words, task2Words });

    // Background AI marking
    try {
      const task1Prompt = attempt.paper?.writingTasks?.find(t => t.taskNumber === 1)?.prompt || '';
      const task2Prompt = attempt.paper?.writingTasks?.find(t => t.taskNumber === 2)?.prompt || '';

      const { gradeWritingAttempt } = require('../services/claudeMarking');
      const feedback = await gradeWritingAttempt(
        task1Response, task1Prompt,
        task2Response, task2Prompt,
        attempt.student?.name
      );

      if (feedback) {
        const overall = ((feedback.task1?.band || 0) * 0.34 + (feedback.task2?.band || 0) * 0.66).toFixed(1);
        await prisma.writingSubmission.update({
          where: { attemptId },
          data: {
            task1Band: feedback.task1?.band,
            task2Band: feedback.task2?.band,
            overallBand: parseFloat(overall),
            aiFeedback: JSON.stringify(feedback),
            markingStatus: 'COMPLETE'
          }
        });
        await prisma.result.update({
          where: { attemptId },
          data: { bandEstimate: parseFloat(overall) }
        });
        aiCache.set(`writing_${attemptId}`, feedback);
        console.log('Writing marked — Overall band:', overall);
      }
    } catch (aiErr) {
      console.error('Writing AI error:', aiErr);
    }
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