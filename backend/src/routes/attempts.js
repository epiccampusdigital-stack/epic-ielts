const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { requirePaidOrFirstExam } = require('../middleware/accessControl');
const { gradeAttempt } = require('../services/claudeMarking');

const router = express.Router();
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const aiCache = new Map();

const PLACEMENT_SKILLS = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];

function calculateBand(score) {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 20) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8)  return 3.5;
  if (score >= 6)  return 3.0;
  if (score >= 4)  return 2.5;
  return 2.0;
}

function extractAnswerLetter(answer) {
  if (!answer) return '';
  const text = String(answer).trim();
  const prefixedLetter = text.match(/^([A-D])[\.\)]/i)?.[1];
  if (prefixedLetter) return prefixedLetter.toUpperCase();
  if (/^[A-D]$/i.test(text)) return text.toUpperCase();
  return text.toUpperCase();
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

    if (testType === 'WRITING') {
      const result = aiFeedback;
      const task1Band = parseFloat(result.task1?.band || result.task1Band) || 5.0;
      const task2Band = parseFloat(result.task2?.band || result.task2Band) || 5.0;
      const overallBand = parseFloat(result.overallBand) || 5.0;

      await prisma.writingSubmission.update({
        where: { attemptId },
        data: {
          task1Band,
          task2Band,
          overallBand,
          aiFeedback: JSON.stringify(result),
          markingStatus: 'COMPLETE'
        }
      });
      aiCache.set(`writing_${attemptId}`, aiFeedback);

      try {
        const task1P = attempt.paper?.writingTasks?.find(t => t.taskNumber === 1)?.prompt || '';
        const task2P = attempt.paper?.writingTasks?.find(t => t.taskNumber === 2)?.prompt || '';
        if (task1P || task2P) {
          const Anthropic = require('@anthropic-ai/sdk');
          const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
          const modelRes = await claude.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 2000,
            system: 'You are an expert IELTS examiner. Return ONLY valid JSON, no markdown, no backticks.',
            messages: [{
              role: 'user',
              content: `Write IELTS model answers for these tasks.\n\nTask 1: ${task1P.substring(0, 400)}\nTask 2: ${task2P.substring(0, 400)}\n\nReturn exactly:\n{"task1":{"band6":"150-170 word Band 6 answer","band7":"180-200 word Band 7 answer"},"task2":{"band6":"250-270 word Band 6 answer","band7":"280-300 word Band 7 answer"}}`
            }]
          });
          const modelText = modelRes.content?.[0]?.text || '';
          const cleanModel = modelText.replace(/```json|```/g, '').trim();
          const modelParsed = JSON.parse(cleanModel);
          if (modelParsed) {
            await prisma.writingSubmission.update({
              where: { attemptId },
              data: { modelAnswers: JSON.stringify(modelParsed) }
            });
          }
        }
      } catch (modelErr) {
        console.error('Model answers generation error:', modelErr.message);
      }
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

// ─── ROUTES ────────────────────────────────────────────────────────────────

router.get('/history/mine', auth, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { studentId: req.user.id, endedAt: { not: null } },
      include: {
        paper: { select: { title: true, testType: true, paperCode: true } },
        result: true,
        writingSubmission: {
          select: { markingStatus: true, overallBand: true, task1Band: true, task2Band: true, modelAnswers: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(attempts);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Error fetching history', details: error.message });
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
        average: (bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(1),
        count: bands.length,
        best: Math.max(...bands).toFixed(1),
        latest: bands[0]?.toFixed(1)
      };
    });

    const overallBands = Object.values(bySubject).flat();
    const overall = overallBands.length > 0
      ? (overallBands.reduce((a, b) => a + b, 0) / overallBands.length).toFixed(1)
      : null;

    res.json({ summary, overall, totalTests: attempts.length, recentAttempts: attempts.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/placement/mine', auth, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: {
        studentId: req.user.id,
        isPlacement: true,
        status: 'COMPLETED'
      },
      include: {
        paper: true,
        result: true,
        writingSubmission: {
          select: {
            markingStatus: true,
            overallBand: true,
            task1Band: true,
            task2Band: true
          }
        },
        speakingSubmission: {
          select: { overallBand: true, markingStatus: true }
        }
      },
      orderBy: { paper: { testType: 'asc' } }
    });
    res.json(attempts);
  } catch (error) {
    console.error('Placement history error:', error);
    res.status(500).json({ message: 'Error fetching placement attempts', details: error.message });
  }
});

router.post('/placement/reset', auth, async (req, res) => {
  try {
    const raw = req.body?.skill;
    const skill = typeof raw === 'string' ? raw.toUpperCase() : '';
    if (!PLACEMENT_SKILLS.includes(skill)) {
      return res.status(400).json({
        message: 'skill must be one of READING, WRITING, LISTENING, SPEAKING'
      });
    }

    await prisma.$transaction([
      prisma.attempt.updateMany({
        where: {
          studentId: req.user.id,
          isPlacement: true,
          paper: { testType: skill }
        },
        data: { isPlacement: false }
      }),
      prisma.student.update({
        where: { id: req.user.id },
        data: { placementDone: false }
      })
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Placement reset error:', error);
    res.status(500).json({ message: 'Error resetting placement', details: error.message });
  }
});

router.post('/', auth, requirePaidOrFirstExam, async (req, res) => {
  try {
    const { paperId, isPlacement: bodyIsPlacement } = req.body;
    if (!paperId) return res.status(400).json({ message: 'paperId is required' });

    const pid = parseInt(paperId, 10);
    if (Number.isNaN(pid)) return res.status(400).json({ message: 'paperId must be a number' });

    const paper = await prisma.paper.findUnique({
      where: { id: pid },
      select: { id: true, testType: true }
    });
    if (!paper) return res.status(404).json({ message: 'Paper not found' });

    const studentId = req.user.id;
    const wantsPlacement = bodyIsPlacement === true;

    if (wantsPlacement) {
      const [, attempt] = await prisma.$transaction([
        prisma.attempt.updateMany({
          where: {
            studentId,
            isPlacement: true,
            paper: { testType: paper.testType }
          },
          data: { isPlacement: false }
        }),
        prisma.attempt.create({
          data: {
            studentId,
            paperId: pid,
            status: 'IN_PROGRESS',
            isPlacement: true
          }
        })
      ]);
      return res.json({ id: attempt.id, attemptId: attempt.id });
    }

    const attempt = await prisma.attempt.create({
      data: {
        studentId,
        paperId: pid,
        status: 'IN_PROGRESS',
        isPlacement: false
      }
    });
    res.json({ id: attempt.id, attemptId: attempt.id });
  } catch (error) {
    console.error('Create attempt error:', error);
    res.status(500).json({ message: 'Error starting attempt', details: error.message });
  }
});

router.post('/:id/start', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const attempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
      include: {
        paper: { include: { questions: { orderBy: { questionNumber: 'asc' } } } }
      }
    });
    res.json(attempt);
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ message: 'Error starting exam', details: error.message });
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
            sections: { include: { groups: { include: { questions: true } } }, orderBy: { number: 'asc' } },
            passages: { include: { groups: { include: { questions: true } } }, orderBy: { passageNumber: 'asc' } },
            questions: { orderBy: { questionNumber: 'asc' } },
            writingTasks: { orderBy: { taskNumber: 'asc' } }
          }
        },
        answers: { include: { question: true } },
        result: true
      }
    });

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    let aiFeedback = aiCache.get(attemptId);
    if (!aiFeedback && attempt.status === 'COMPLETED' && attempt.result) {
      if (attempt.result.aiFeedbackJson) {
        aiFeedback = JSON.parse(attempt.result.aiFeedbackJson);
      } else {
        aiFeedback = await createAiFeedback(attempt, attempt.result, attempt.answers);
      }
      aiCache.set(attemptId, aiFeedback);
    }

    res.json({ ...attempt, aiFeedback });
  } catch (error) {
    console.error('Result error:', error);
    res.status(500).json({ message: 'Error fetching result', details: error.message });
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
            questions: { orderBy: { questionNumber: 'asc' } },
            passages: {
              orderBy: { passageNumber: 'asc' },
              include: {
                groups: {
                  orderBy: { id: 'asc' },
                  include: {
                    questions: {
                      orderBy: { questionNumber: 'asc' }
                    }
                  }
                }
              }
            },
            writingTasks: { orderBy: { taskNumber: 'asc' } },
            sections: {
              orderBy: { number: 'asc' },
              include: { groups: { include: { questions: { orderBy: { questionNumber: 'asc' } } } } }
            }
          }
        },
        answers: true,
        result: true
      }
    });

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    res.json(attempt);
  } catch (error) {
    console.error('Attempt fetch error:', error);
    res.status(500).json({ message: 'Error fetching attempt', details: error.message });
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
        const endExistingSub = await prisma.writingSubmission.findUnique({
          where: { attemptId }
        });

        const endSafeTask1 = (writingSubmission.task1Response && writingSubmission.task1Response.trim().length > 0)
          ? writingSubmission.task1Response
          : (endExistingSub?.task1Response || '');

        const endSafeTask2 = (writingSubmission.task2Response && writingSubmission.task2Response.trim().length > 0)
          ? writingSubmission.task2Response
          : (endExistingSub?.task2Response || '');

        const endTask1Words = endSafeTask1.trim().split(/\s+/).filter(Boolean).length;
        const endTask2Words = endSafeTask2.trim().split(/\s+/).filter(Boolean).length;

        await prisma.writingSubmission.upsert({
          where: { attemptId },
          create: {
            attemptId,
            task1Response: endSafeTask1,
            task2Response: endSafeTask2,
            task1WordCount: endTask1Words,
            task2WordCount: endTask2Words,
            markingStatus: 'PENDING_AI'
          },
          update: {
            ...(endSafeTask1.length > 0 && { task1Response: endSafeTask1, task1WordCount: endTask1Words }),
            ...(endSafeTask2.length > 0 && { task2Response: endSafeTask2, task2WordCount: endTask2Words }),
            markingStatus: 'PENDING_AI'
          }
        });
      }
    } else {
      correctCount = 0;
      const allQuestions = attempt.paper.questions;

      // Load autosaved answers from DB as fallback
      // if frontend sent empty (stale closure / timer expiry)
      let answersToScore = Array.isArray(answers) ? answers : [];
      if (answersToScore.length === 0) {
        const saved = await prisma.answer.findMany({
          where: { attemptId }
        });
        answersToScore = saved.map(a => ({
          questionId: a.questionId,
          studentAnswer: a.studentAnswer
        }));
      }

      // Now safe to delete old answers and rescore
      await prisma.answer.deleteMany({ where: { attemptId } });

      const answerData = allQuestions.map(question => {
        const submitted = answersToScore.find(
          a => parseInt(a.questionId) === question.id
        );
        const studentAnswer = String(submitted?.studentAnswer || '').trim();
        const normalizedStudent = studentAnswer.toUpperCase();
        const extractedStudent = extractAnswerLetter(studentAnswer);
        const correctAnswers = String(question.correctAnswer || '').split('|').map(s => String(s || '').trim());
        const isCorrect = studentAnswer.length > 0 && correctAnswers.some(correct => {
          const normalizedCorrect = correct.toUpperCase();
          const extractedCorrect = extractAnswerLetter(correct);
          return normalizedStudent === normalizedCorrect || extractedStudent === extractedCorrect;
        });
        if (isCorrect) correctCount++;
        return {
          attemptId,
          questionId: question.id,
          studentAnswer,
          isCorrect: studentAnswer.length === 0 ? false : isCorrect
        };
      });
      await prisma.answer.createMany({ data: answerData });

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

    const endedAttempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: { status: 'COMPLETED', endedAt: new Date() },
      select: { isPlacement: true, studentId: true, paper: { select: { testType: true } } }
    });

    // If this was a placement attempt, check if all 4 skills now done
    if (endedAttempt.isPlacement) {
      const placementSkills = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];
      const completedPlacements = await prisma.attempt.findMany({
        where: {
          studentId: endedAttempt.studentId,
          isPlacement: true,
          status: 'COMPLETED',
        },
        include: { paper: { select: { testType: true } }, result: true }
      });
      const completedSkills = new Set(completedPlacements.map(a => a.paper?.testType));
      const allDone = placementSkills.every(s => completedSkills.has(s));
      if (allDone) {
        // Calculate average band across all 4 placement attempts
        const bands = completedPlacements.map(a => {
          const r = a.result;
          return r?.bandEstimate ? parseFloat(r.bandEstimate) : null;
        }).filter(b => b !== null);
        const avgBand = bands.length > 0
          ? Math.round((bands.reduce((s, b) => s + b, 0) / bands.length) * 2) / 2
          : null;
        await prisma.student.update({
          where: { id: endedAttempt.studentId },
          data: {
            placementDone: true,
            ...(avgBand !== null && { placementBand: String(avgBand) })
          }
        });
      }
    }

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

// ─── SPEAKING ──────────────────────────────────────────────────────────────

const uploadSpeaking = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/:id/speaking/upload', auth, uploadSpeaking.single('audio'), async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const { partNumber } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No audio file' });

    let audioUrl;
    const { cloudinary: cloudinaryInstance, isLocal } = require('../config/cloudinary');

    if (!isLocal && cloudinaryInstance) {
      // Upload buffer directly to Cloudinary (persists across deploys)
      const publicId = `speaking_${req.params.id}_part${partNumber}_${Date.now()}`;
      audioUrl = await new Promise((resolve, reject) => {
        const { Readable } = require('stream');
        const uploadStream = cloudinaryInstance.uploader.upload_stream(
          { resource_type: 'video', folder: 'epic-ielts/speaking', public_id: publicId },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        Readable.from(req.file.buffer).pipe(uploadStream);
      });
      console.log('Speaking Part', partNumber, 'uploaded to Cloudinary:', audioUrl);
    } else {
      // Local dev fallback: write buffer to disk
      const dir = path.join(__dirname, '../../uploads/speaking');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filename = `speaking_${req.params.id}_${Date.now()}.webm`;
      fs.writeFileSync(path.join(dir, filename), req.file.buffer);
      audioUrl = '/uploads/speaking/' + filename;
      console.log('Speaking Part', partNumber, 'saved locally:', audioUrl);
    }

    const updateData = {};
    updateData[`part${partNumber}AudioUrl`] = audioUrl;

    await prisma.speakingSubmission.upsert({
      where: { attemptId },
      create: { attemptId, ...updateData, markingStatus: 'PENDING' },
      update: updateData
    });

    res.json({ success: true, audioUrl, partNumber });
  } catch (err) {
    console.error('Speaking upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── FIX: fetch paper with sections+questions so markSpeaking gets real questions ──
router.post('/:id/speaking/submit', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        speakingSubmission: true,
        // FIX 1: include paper with sections and questions
        paper: {
          include: {
            sections: {
              orderBy: { number: 'asc' },
              include: {
                groups: {
                  include: { questions: { orderBy: { questionNumber: 'asc' } } }
                }
              }
            },
            questions: { orderBy: { questionNumber: 'asc' } }
          }
        }
      }
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

      await prisma.speakingSubmission.update({
        where: { attemptId },
        data: { markingStatus: 'TRANSCRIBING' }
      });

      const { transcribeAudioFile, markSpeaking } = require('../services/speakingService');

      // Transcribe all 3 parts in parallel
      const transcriptResults = await Promise.all(
        ['part1', 'part2', 'part3'].map(async (part) => {
          const audioUrl = sub[`${part}AudioUrl`];
          if (!audioUrl) {
            console.log(`${part}: no audio uploaded, skipping`);
            return { part, transcript: null };
          }
          try {
            // Cloudinary URL → pass directly; local path → resolve to absolute
            const audioInput = audioUrl.startsWith('http')
              ? audioUrl
              : path.join(__dirname, '../../', audioUrl);
            if (!audioUrl.startsWith('http') && !fs.existsSync(audioInput)) {
              console.warn(`${part}: local file not found at ${audioInput}`);
              return { part, transcript: null };
            }
            console.log(`${part}: transcribing ${audioUrl.substring(0, 80)}...`);
            const transcript = await transcribeAudioFile(audioInput);
            return { part, transcript };
          } catch (e) {
            console.error(`${part} transcription failed:`, e.message);
            return { part, transcript: null };
          }
        })
      );

      const transcripts = {};
      for (const { part, transcript } of transcriptResults) {
        if (transcript) {
          transcripts[part] = transcript;
          await prisma.speakingSubmission.update({
            where: { attemptId },
            data: { [`${part}Transcript`]: transcript }
          });
        }
      }

      if (Object.keys(transcripts).length > 0) {
        await prisma.speakingSubmission.update({
          where: { attemptId },
          data: { markingStatus: 'MARKING' }
        });

        const results = await markSpeaking(
          transcripts,
          attempt.student?.name,
          attempt.student?.expectedBand,
          attempt.paper
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
          try {
            await prisma.result.upsert({
              where: { attemptId },
              update: { bandEstimate: parseFloat(overallBand) },
              create: {
                attemptId,
                bandEstimate: parseFloat(overallBand),
                rawScore: 0,
              }
            });
          } catch (resultErr) {
            console.error('Speaking result update failed (non-fatal):',
              resultErr.message);
            // markingStatus already set to COMPLETE — do not rethrow
          }
        }

        console.log('Speaking marked. Overall band:', overallBand);
      } else {
        console.warn('No transcripts generated — marking skipped');
        await prisma.speakingSubmission.update({
          where: { attemptId },
          data: { markingStatus: 'FAILED' }
        });
      }
    } catch (bgErr) {
      console.error('Speaking background error:', bgErr.message);
      await prisma.speakingSubmission.update({
        where: { attemptId },
        data: { markingStatus: 'FAILED' }
      }).catch(() => {});
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
      return res.json({ status: 'ready', markingStatus: sub.markingStatus, feedback: JSON.parse(sub.aiFeedback), overallBand: sub.overallBand });
    }
    res.json({ status: 'pending', markingStatus: sub.markingStatus });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ─── WRITING ───────────────────────────────────────────────────────────────

router.post('/:id/writing/submit', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const { task1Response, task2Response } = req.body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { student: true, paper: { include: { writingTasks: true } } }
    });

    console.log(`Step 1: Attempt ${attemptId} data fetched`);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const task1Words = (task1Response || '').trim().split(/\s+/).filter(Boolean).length;
    const task2Words = (task2Response || '').trim().split(/\s+/).filter(Boolean).length;
    console.log(`Step 2: Word counts calculated (${task1Words}, ${task2Words})`);

    try {
      // Load any existing submission first so we never overwrite
      // saved text with empty strings if the AI failed and retried
      const existingSub = await prisma.writingSubmission.findUnique({
        where: { attemptId }
      });

      const safeTask1 = (task1Response && task1Response.trim().length > 0)
        ? task1Response
        : (existingSub?.task1Response || '');

      const safeTask2 = (task2Response && task2Response.trim().length > 0)
        ? task2Response
        : (existingSub?.task2Response || '');

      const safeTask1Words = safeTask1.trim().split(/\s+/).filter(Boolean).length;
      const safeTask2Words = safeTask2.trim().split(/\s+/).filter(Boolean).length;

      await prisma.writingSubmission.upsert({
        where: { attemptId },
        create: {
          attemptId,
          task1Response: safeTask1,
          task2Response: safeTask2,
          task1WordCount: safeTask1Words,
          task2WordCount: safeTask2Words,
          markingStatus: 'PENDING_AI'
        },
        update: {
          // Only update text if new text is non-empty
          ...(safeTask1.length > 0 && { task1Response: safeTask1, task1WordCount: safeTask1Words }),
          ...(safeTask2.length > 0 && { task2Response: safeTask2, task2WordCount: safeTask2Words }),
          markingStatus: 'PENDING_AI'
        }
      });
      console.log(`Step 3: WritingSubmission upserted`);
    } catch (wsErr) {
      console.error('WritingSubmission Error:', wsErr);
      throw new Error('Failed to save writing submission: ' + wsErr.message);
    }

    try {
      const writingEndedAttempt = await prisma.attempt.update({
        where: { id: attemptId },
        data: { status: 'COMPLETED', endedAt: new Date() },
        select: { isPlacement: true, studentId: true, paper: { select: { testType: true } } }
      });
      console.log(`Step 4: Attempt marked COMPLETED`);

      if (writingEndedAttempt.isPlacement) {
        const placementSkills = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];
        const completedPlacements = await prisma.attempt.findMany({
          where: {
            studentId: writingEndedAttempt.studentId,
            isPlacement: true,
            status: 'COMPLETED',
          },
          include: { paper: { select: { testType: true } }, result: true, writingSubmission: true }
        });
        const completedSkills = new Set(completedPlacements.map(a => a.paper?.testType));
        const allDone = placementSkills.every(s => completedSkills.has(s));
        if (allDone) {
          await prisma.student.update({
            where: { id: writingEndedAttempt.studentId },
            data: { placementDone: true }
          });
        }
      }
    } catch (attErr) {
      throw new Error('Failed to update attempt status: ' + attErr.message);
    }

    try {
      await prisma.result.deleteMany({ where: { attemptId } });
      await prisma.result.create({ data: { attemptId, rawScore: null, bandEstimate: null } });
      console.log(`Step 5: Result placeholder created`);
    } catch (resErr) {
      throw new Error('Failed to create result placeholder: ' + resErr.message);
    }

    res.json({ message: 'Writing submitted', task1Words, task2Words });
    console.log(`Step 6: Submission response sent`);

    setTimeout(async () => {
      try {
        const updatedAttempt = await prisma.attempt.findUnique({
          where: { id: attemptId },
          include: { student: true, paper: { include: { writingTasks: true } }, result: true }
        });
        if (updatedAttempt && updatedAttempt.result) {
          await createAiFeedback(updatedAttempt, updatedAttempt.result, []);
          console.log(`Background Writing AI complete for attempt ${attemptId}`);
        }
      } catch (aiErr) {
        console.error(`Writing AI background error for ${attemptId}:`, aiErr);
        await prisma.writingSubmission.update({ where: { attemptId }, data: { markingStatus: 'FAILED' } }).catch(() => {});
      }
    }, 500);
  } catch (err) {
    console.error('Writing submit error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/writing/feedback', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    let cached = aiCache.get(`writing_${attemptId}`);
    if (cached) return res.json({ status: 'ready', feedback: cached });

    const sub = await prisma.writingSubmission.findUnique({ where: { attemptId } });
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

router.get('/:id/writing/result', auth, async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { paper: { include: { writingTasks: true } }, writingSubmission: true, result: true }
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
    let explanationText = '';
    if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        explanationText = parsed?.content?.[0]?.text
          || parsed?.explanation
          || parsed?.text
          || result;
      } catch {
        explanationText = result;
      }
    } else if (result && typeof result === 'object') {
      explanationText = result?.content?.[0]?.text
        || result?.explanation
        || result?.text
        || JSON.stringify(result);
    }
    res.json({ explanation: explanationText });
  } catch (err) {
    console.error('Explain endpoint error:', err.message);
    res.status(500).json({ explanation: `The correct answer is "${req.body.correctAnswer}". Review the passage carefully for keywords related to this question.` });
  }
});

module.exports = router;
