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

function fallbackFeedback(rawScore, bandEstimate) {
  return {
    bandEstimate,
    strengths:
      'You completed the reading test and submitted your answers. This gives us a clear starting point for improvement.',
    weaknesses:
      `Your score was ${rawScore}/40, so your main weakness is accuracy across question types. Focus especially on locating evidence in the passage before choosing an answer.`,
    improvementAdvice:
      'Review every wrong answer. Find the exact sentence in the passage that proves the correct answer. Practise TRUE/FALSE/NOT GIVEN, multiple choice, matching, and short-answer questions separately.',
    aiDetailedFeedback:
      `Your estimated IELTS Reading band is ${bandEstimate}. To improve, slow down slightly, underline keywords, compare the question with the passage carefully, and avoid guessing without text evidence.`
  };
}

async function createAiFeedback(attempt, result, savedAnswers) {
  const answerReview = savedAnswers.map((a) => ({
    questionNumber: a.question?.questionNumber,
    questionType: a.question?.questionType,
    question: a.question?.content,
    studentAnswer: a.studentAnswer,
    correctAnswer: a.question?.correctAnswer,
    isCorrect: a.isCorrect
  }));

  const paperSummary = {
    title: attempt.paper?.title,
    paperCode: attempt.paper?.paperCode,
    testType: attempt.paper?.testType,
    rawScore: result.rawScore,
    bandEstimate: result.bandEstimate,
    totalQuestions: attempt.paper?.questions?.length || 40
  };

  const ai = await gradeAttempt(answerReview, JSON.stringify(paperSummary));
  return ai || fallbackFeedback(result.rawScore, result.bandEstimate);
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

router.get('/:id', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        paper: {
          include: {
            questions: {
              orderBy: {
                questionNumber: 'asc'
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
    const { answers } = req.body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        paper: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    await prisma.answer.deleteMany({
      where: { attemptId }
    });

    let correctCount = 0;

    if (Array.isArray(answers) && answers.length > 0) {
      const answerData = answers.map((a) => {
        const question = attempt.paper.questions.find(
          (q) => q.id === parseInt(a.questionId)
        );

        const studentAnswer = String(a.studentAnswer || '').trim();
        const correctAnswer = String(question?.correctAnswer || '').trim();

        const isCorrect =
          correctAnswer.toLowerCase() === studentAnswer.toLowerCase();

        if (isCorrect) correctCount++;

        return {
          attemptId,
          questionId: parseInt(a.questionId),
          studentAnswer,
          isCorrect
        };
      });

      await prisma.answer.createMany({
        data: answerData
      });
    }

    const bandEstimate = calculateBand(correctCount);

    await prisma.result.deleteMany({
      where: { attemptId }
    });

    const result = await prisma.result.create({
      data: {
        attemptId,
        rawScore: correctCount,
        bandEstimate
      }
    });

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date()
      }
    });

    // IMPORTANT:
    // Send response immediately so frontend can navigate to results fast.
    // AI feedback will generate in the background.
    res.json({
      message: 'Exam submitted',
      result
    });

    try {
      const savedAnswers = await prisma.answer.findMany({
        where: { attemptId },
        include: {
          question: true
        },
        orderBy: {
          questionId: 'asc'
        }
      });

      const aiFeedback = await createAiFeedback(attempt, result, savedAnswers);
      aiCache.set(attemptId, aiFeedback);
    } catch (aiError) {
      console.error('Background AI feedback error:', aiError);
    }
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({
      message: 'Error submitting attempt',
      details: error.message
    });
  }
});

module.exports = router;