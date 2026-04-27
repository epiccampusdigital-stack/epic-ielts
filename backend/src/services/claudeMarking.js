require('dotenv').config();

let client = null;

function getClient() {
  if (client) return client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error('ANTHROPIC_API_KEY not found in environment');
    return null;
  }
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    client = new Anthropic({ apiKey: key });
    console.log('Claude client created successfully');
    return client;
  } catch (e) {
    console.error('Failed to create Claude client:', e.message);
    return null;
  }
}

const MODEL = 'claude-sonnet-4-5-20250929';

function safeExtractJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

async function gradeAttempt(answerReview, paperSummaryStr) {
  console.log('gradeAttempt called');
  const claude = getClient();
  if (!claude) {
    console.error('No Claude client available');
    return null;
  }

  let paperSummary = {};
  try { paperSummary = JSON.parse(paperSummaryStr); } catch {}

  const wrong = (answerReview || []).filter(a => !a.isCorrect);
  const correct = (answerReview || []).filter(a => a.isCorrect);

  const typeStats = {};
  (answerReview || []).forEach(a => {
    const t = a.questionType || 'UNKNOWN';
    if (!typeStats[t]) typeStats[t] = { total: 0, correct: 0, wrong: 0 };
    typeStats[t].total++;
    if (a.isCorrect) typeStats[t].correct++;
    else typeStats[t].wrong++;
  });

  const prompt = `You are the EPIC IELTS AI Examiner. Analyze this student's IELTS Reading test result and give detailed personal feedback.

STUDENT: ${paperSummary.studentName || 'Student'}
PAPER: ${paperSummary.paperCode || 'N/A'} - ${paperSummary.testType || 'READING'}
RAW SCORE: ${paperSummary.rawScore || 0}/40
BAND ESTIMATE: ${paperSummary.bandEstimate || 4}

QUESTION TYPE PERFORMANCE:
${Object.entries(typeStats).map(([t, s]) => `${t}: ${s.correct}/${s.total} correct`).join('\n')}

WRONG ANSWERS (${wrong.length} mistakes):
${wrong.slice(0, 15).map(a => `Q${a.questionNumber} [${a.questionType}]: "${String(a.question || '').substring(0, 100)}"
  Student: "${a.studentAnswer || 'blank'}" → Correct: "${a.correctAnswer}"`).join('\n\n')}

CORRECT TYPES: ${[...new Set(correct.map(a => a.questionType))].join(', ') || 'None'}

PREVIOUS ATTEMPTS: ${paperSummary.previousResults?.length > 0 ? JSON.stringify(paperSummary.previousResults) : 'First attempt'}

Return ONLY valid JSON, no extra text:
{
  "bandEstimate": ${paperSummary.bandEstimate || 4},
  "strengths": ["strength 1 based on correct answers", "strength 2", "strength 3"],
  "weakAreas": ["weak area 1 mentioning question type", "weak area 2", "weak area 3"],
  "mistakeAnalysis": ["specific mistake analysis 1", "analysis 2", "analysis 3"],
  "questionTypeAnalysis": {
    "TRUE_FALSE_NOT_GIVEN": "how they performed on this type",
    "MULTIPLE_CHOICE": "how they performed",
    "SHORT_ANSWER": "how they performed"
  },
  "improvementAdvice": ["specific IELTS tip 1", "tip 2", "tip 3"],
  "progressComment": "comment on this attempt vs previous",
  "teacherSummary": "2 sentence summary for teacher",
  "finalStudentReport": "4-5 sentence personal message to ${paperSummary.studentName || 'the student'} about their score of ${paperSummary.rawScore}/40 (Band ${paperSummary.bandEstimate}), what they did well, their main weakness, and one specific improvement tip."
}`;

  try {
    console.log('Calling Claude API for Reading...');
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });
    console.log('Claude responded for Reading');
    const text = response.content?.[0]?.text || '';
    const parsed = safeExtractJson(text);
    if (!parsed) {
      console.error('Failed to parse Claude JSON:', text.substring(0, 200));
      return null;
    }
    console.log('Reading AI complete. Band:', parsed.bandEstimate);
    return parsed;
  } catch (e) {
    console.error('Claude API error:', e.message, 'Status:', e.status);
    return null;
  }
}

async function gradeWritingAttempt(task1Response, task1Prompt, task2Response, task2Prompt, studentName, expectedBand) {
  console.log('gradeWritingAttempt called for:', studentName);
  const claude = getClient();
  if (!claude) {
    console.error('No Claude client for writing');
    return null;
  }

  const t1Words = (task1Response || '').trim().split(/\s+/).filter(Boolean).length;
  const t2Words = (task2Response || '').trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are a certified IELTS Writing examiner. Mark these writing tasks and give detailed teaching feedback.

STUDENT: ${studentName || 'Student'}
TARGET BAND: ${expectedBand || 'Not specified'}

TASK 1 QUESTION: ${task1Prompt || 'Describe the visual information'}
TASK 1 RESPONSE (${t1Words} words):
${task1Response || '(No response)'}

TASK 2 QUESTION: ${task2Prompt || 'Write an essay'}
TASK 2 RESPONSE (${t2Words} words):
${task2Response || '(No response)'}

Return ONLY valid JSON:
{
  "task1": {
    "band": 6.0,
    "taskAchievement": 6.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.0,
    "feedback": "Specific feedback on Task 1 response",
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "rewrittenExample": "One weak sentence rewritten at Band 8",
    "keyTricks": ["IELTS Task 1 trick 1", "trick 2"],
    "grammarMistakes": [{"mistake": "text from essay", "correction": "fixed", "rule": "grammar rule"}],
    "vocabularyUpgrades": [{"original": "basic word", "better": "advanced word", "example": "example sentence"}]
  },
  "task2": {
    "band": 6.0,
    "taskResponse": 6.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.0,
    "feedback": "Specific feedback on Task 2 essay",
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "essayStructureFeedback": "Comment on structure",
    "rewrittenExample": "One weak sentence rewritten at Band 8",
    "keyTricks": ["IELTS Task 2 trick 1", "trick 2"],
    "grammarMistakes": [{"mistake": "text", "correction": "fixed", "rule": "rule"}],
    "vocabularyUpgrades": [{"original": "word", "better": "better word", "example": "sentence"}]
  },
  "overallBand": 6.0,
  "studyPlan": ["study action 1", "action 2", "action 3"],
  "progressToTarget": "How close to target and what to focus on",
  "finalStudentReport": "5-6 sentence personal message to ${studentName || 'the student'} about their writing performance, bands, strengths, main weakness, and improvement tip."
}`;

  try {
    console.log('Calling Claude API for Writing...');
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 3000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });
    console.log('Claude responded for Writing');
    const text = response.content?.[0]?.text || '';
    const parsed = safeExtractJson(text);
    if (!parsed) {
      console.error('Writing JSON parse failed:', text.substring(0, 200));
      return null;
    }
    console.log('Writing AI complete. Overall band:', parsed.overallBand);
    return parsed;
  } catch (e) {
    console.error('Writing Claude error:', e.message);
    return null;
  }
}

async function explainWrongAnswer(questionText, questionType, studentAnswer, correctAnswer, existingExplanation) {
  console.log('explainWrongAnswer called');
  if (existingExplanation && existingExplanation.length > 20) {
    return existingExplanation;
  }
  const claude = getClient();
  if (!claude) return `The correct answer is "${correctAnswer}". Review the passage carefully.`;

  try {
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are an IELTS Reading examiner. Explain in 3-4 sentences why this answer is wrong and what the correct answer means.

Question: ${questionText}
Question Type: ${questionType}
Student answered: "${studentAnswer || 'no answer'}"
Correct answer: "${correctAnswer}"

Explain: 1) Why student answer is wrong 2) What evidence in the passage supports the correct answer 3) A tip for this question type`
      }]
    });
    return response.content[0].text;
  } catch (e) {
    console.error('Explain error:', e.message);
    return `The correct answer is "${correctAnswer}". For ${questionType} questions, look for exact keywords in the passage that confirm or contradict the statement.`;
  }
}

module.exports = { gradeAttempt, gradeWritingAttempt, explainWrongAnswer };