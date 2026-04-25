const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY
});

function safeExtractJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

async function gradeAttempt(answerReview, paperSummaryStr) {
  console.log('=== CLAUDE MARKING STARTED ===');
  console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'YES - ' + process.env.ANTHROPIC_API_KEY.substring(0, 15) + '...' : 'NO - MISSING');
  console.log('Total answers to analyze:', answerReview.length);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is missing from .env');
    return null;
  }

  let paperSummary;
  try {
    paperSummary = typeof paperSummaryStr === 'string' ? JSON.parse(paperSummaryStr) : paperSummaryStr;
  } catch {
    paperSummary = { rawScore: 0, bandEstimate: 4 };
  }

  const wrongAnswers = answerReview.filter(a => !a.isCorrect);
  const correctAnswers = answerReview.filter(a => a.isCorrect);

  const questionTypeBreakdown = {};
  answerReview.forEach(a => {
    const type = a.questionType || 'UNKNOWN';
    if (!questionTypeBreakdown[type]) {
      questionTypeBreakdown[type] = { total: 0, correct: 0, wrong: 0 };
    }
    questionTypeBreakdown[type].total++;
    if (a.isCorrect) questionTypeBreakdown[type].correct++;
    else questionTypeBreakdown[type].wrong++;
  });

  const prompt = `You are the official EPIC IELTS AI Examiner. Analyze this student's IELTS Reading test performance and give detailed personal feedback.

STUDENT: ${paperSummary.studentName || 'Student'}
PAPER: ${paperSummary.paperCode || 'N/A'} - ${paperSummary.title || 'IELTS Reading Test'}
RAW SCORE: ${paperSummary.rawScore || 0}/40
IELTS BAND ESTIMATE: ${paperSummary.bandEstimate || 4}

PERFORMANCE BY QUESTION TYPE:
${Object.entries(questionTypeBreakdown).map(([type, data]) => 
  `- ${type}: ${data.correct}/${data.total} correct (${data.wrong} wrong)`
).join('\n')}

WRONG ANSWERS (${wrongAnswers.length} mistakes to analyze):
${wrongAnswers.map(a => 
  `Q${a.questionNumber} [${a.questionType}]: "${a.question?.substring(0, 100) || 'N/A'}"
   Student wrote: "${a.studentAnswer || '(blank)'}" | Correct: "${a.correctAnswer}"`
).join('\n\n')}

CORRECT ANSWERS (${correctAnswers.length} correct):
Question types the student got right: ${[...new Set(correctAnswers.map(a => a.questionType))].filter(Boolean).join(', ') || 'None'}

${paperSummary.previousResults?.length > 0 ? `PREVIOUS ATTEMPTS: ${paperSummary.previousResults.map(p => `Band ${p.band} (Score: ${p.score})`).join(', ')}` : 'PREVIOUS ATTEMPTS: This is the student\'s first attempt.'}

Now provide detailed, specific, personal IELTS feedback. Return ONLY this JSON structure with no extra text:

{
  "bandEstimate": ${paperSummary.bandEstimate || 4},
  "strengths": [
    "specific strength based on what the student got right",
    "another specific strength",
    "third specific strength"
  ],
  "weakAreas": [
    "specific weak area based on wrong answers",
    "another specific weakness with question type mentioned",
    "third weakness"
  ],
  "mistakeAnalysis": [
    "Analysis of specific wrong answer pattern you noticed",
    "Another specific mistake pattern explanation",
    "Third specific mistake with advice on how to avoid it"
  ],
  "questionTypeAnalysis": {
    ${Object.keys(questionTypeBreakdown).map(type => 
      `"${type}": "analysis of student performance on ${type} questions"`
    ).join(',\n    ')}
  },
  "improvementAdvice": [
    "Specific actionable advice for IELTS Reading improvement",
    "Second specific advice with technique",
    "Third advice for the student's weakest area"
  ],
  "progressComment": "${paperSummary.previousResults?.length > 0 ? 'Compare to previous attempts and comment on progress' : 'This is the first attempt. Encourage and set expectations.'}",
  "teacherSummary": "Professional 2-sentence summary for the teacher about this student's performance and recommended focus areas",
  "finalStudentReport": "Write a warm, personal 4-5 sentence message directly to ${paperSummary.studentName || 'the student'}. Address them by name. Tell them their score, what they did well, what they struggled with specifically (mention question types and actual mistakes), and give them one clear next step to improve. Be encouraging but honest."
}`;

  try {
    console.log('Calling Claude API...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    console.log('Claude API responded successfully');
    const text = response.content?.[0]?.text || '';
    console.log('Response preview:', text.substring(0, 200));

    const parsed = safeExtractJson(text);

    if (!parsed) {
      console.error('Failed to parse Claude response as JSON');
      console.error('Raw response:', text);
      return null;
    }

    console.log('=== CLAUDE MARKING COMPLETE ===');
    return parsed;

  } catch (error) {
    console.error('=== CLAUDE API ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.status) console.error('HTTP Status:', error.status);
    if (error.error) console.error('API Error:', JSON.stringify(error.error));
    return null;
  }
}

async function gradeWritingAttempt(task1Response, task1Prompt, task2Response, task2Prompt, studentName) {
  console.log('=== CLAUDE WRITING MARKING STARTED ===');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY missing');
    return null;
  }

  const prompt = `You are an official IELTS Writing examiner. Mark these two writing tasks using official IELTS band descriptors.

STUDENT: ${studentName || 'Student'}

TASK 1 PROMPT: ${task1Prompt || 'Describe the visual information'}
TASK 1 RESPONSE (${task1Response?.split(' ').length || 0} words):
${task1Response || '(No response)'}

TASK 2 PROMPT: ${task2Prompt || 'Write an essay'}
TASK 2 RESPONSE (${task2Response?.split(' ').length || 0} words):
${task2Response || '(No response)'}

Return ONLY this JSON:
{
  "task1": {
    "band": 6.0,
    "taskAchievement": 6.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.0,
    "feedback": "Specific feedback on Task 1",
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"]
  },
  "task2": {
    "band": 6.0,
    "taskResponse": 6.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.0,
    "feedback": "Specific feedback on Task 2",
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"]
  },
  "overallBand": 6.0,
  "finalStudentReport": "Personal message to ${studentName || 'the student'} about their writing performance"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content?.[0]?.text || '';
    const parsed = safeExtractJson(text);
    console.log('Writing marking complete');
    return parsed;
  } catch (error) {
    console.error('Writing marking error:', error.message);
    return null;
  }
}

module.exports = { gradeAttempt, gradeWritingAttempt };