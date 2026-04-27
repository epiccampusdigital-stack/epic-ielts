require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

let client;
try {
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log('Claude client initialized OK');
} catch (e) {
  console.error('Claude init failed:', e.message);
}

const MODEL = 'claude-sonnet-4-5-20250929';

function safeExtractJson(text) {
  if (!text) return null;
  // Try direct parse first
  try { return JSON.parse(text); } catch {}
  
  // Find first { and last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  
  if (start === -1 || end === -1 || end < start) {
    console.error('No JSON block found in Claude response');
    return null;
  }
  
  const jsonStr = text.substring(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parse failed for extracted string:', e.message);
    // Try to fix common issues like trailing commas or single quotes if needed
    // But for now, just return null
    return null;
  }
}

async function gradeAttempt(answerReview, paperSummaryStr) {
  console.log('=== GRADE READING CALLED ===');
  if (!client) { console.error('No Claude client'); return null; }
  if (!process.env.ANTHROPIC_API_KEY) { console.error('No API key'); return null; }
  let paperSummary = {};
  try { paperSummary = JSON.parse(paperSummaryStr); } catch {}
  const wrongAnswers = (answerReview || []).filter(a => !a.isCorrect);
  const correctAnswers = (answerReview || []).filter(a => a.isCorrect);
  const typeBreakdown = {};
  (answerReview || []).forEach(a => {
    const t = a.questionType || 'UNKNOWN';
    if (!typeBreakdown[t]) typeBreakdown[t] = { total: 0, correct: 0, wrong: 0 };
    typeBreakdown[t].total++;
    if (a.isCorrect) typeBreakdown[t].correct++;
    else typeBreakdown[t].wrong++;
  });
  const prompt = `You are the EPIC IELTS AI Examiner. Analyze this student's IELTS Reading test and give detailed personal feedback.

STUDENT: ${paperSummary.studentName || 'Student'}
SCORE: ${paperSummary.rawScore || 0}/40
BAND: ${paperSummary.bandEstimate || 4}
PAPER: ${paperSummary.paperCode || 'N/A'}

PERFORMANCE BY QUESTION TYPE:
${Object.entries(typeBreakdown).map(([t, d]) => `${t}: ${d.correct}/${d.total} correct (${d.wrong} wrong)`).join('\n')}

WRONG ANSWERS (${wrongAnswers.length} mistakes):
${wrongAnswers.map(a => `Q${a.questionNumber} [${a.questionType}]: "${String(a.question || '').substring(0, 120)}"
  Student answered: "${a.studentAnswer || '(blank)'}"
  Correct answer: "${a.correctAnswer}"`).join('\n\n')}

CORRECT QUESTION TYPES STUDENT GOT RIGHT: ${[...new Set(correctAnswers.map(a => a.questionType))].join(', ') || 'None'}

Return ONLY valid JSON:
{
  "bandEstimate": ${paperSummary.bandEstimate || 4},
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weakAreas": ["specific weak area mentioning question type 1", "weak area 2", "weak area 3"],
  "mistakeAnalysis": ["specific analysis of mistake pattern 1", "analysis 2", "analysis 3"],
  "questionTypeAnalysis": {
    "TRUE_FALSE_NOT_GIVEN": "specific performance analysis",
    "MULTIPLE_CHOICE": "specific performance analysis",
    "SHORT_ANSWER": "specific performance analysis"
  },
  "improvementAdvice": ["specific actionable advice 1", "advice 2", "advice 3"],
  "progressComment": "comment on this attempt and progress",
  "teacherSummary": "2 sentence professional teacher summary",
  "finalStudentReport": "Personal 4-5 sentence message directly to ${paperSummary.studentName || 'the student'} about their score, specific mistakes, strengths, and one clear improvement tip."
}`;
  try {
    console.log('Calling Claude for Reading...');
    const response = await client.messages.create({
      model: MODEL, max_tokens: 2000, temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });
    console.log('Claude Reading response OK');
    const parsed = safeExtractJson(response.content?.[0]?.text || '');
    if (!parsed) { console.error('JSON parse failed'); return null; }
    console.log('=== READING GRADE COMPLETE ===');
    return parsed;
  } catch (e) {
    console.error('Reading Claude error:', e.message, e.status);
    return null;
  }
}

async function gradeWritingAttempt(task1Response, task1Prompt, task2Response, task2Prompt, studentName, expectedBand) {
  console.log('=== GRADE WRITING CALLED ===');
  if (!client) { console.error('No Claude client'); return null; }
  if (!process.env.ANTHROPIC_API_KEY) { console.error('No API key'); return null; }
  const t1Words = (task1Response || '').trim().split(/\s+/).filter(Boolean).length;
  const t2Words = (task2Response || '').trim().split(/\s+/).filter(Boolean).length;
  const prompt = `You are a certified IELTS Writing examiner and teacher. Mark these writing tasks and give detailed teaching feedback that helps the student improve.

STUDENT: ${studentName || 'Student'}
TARGET BAND: ${expectedBand || 'Not specified'}

TASK 1 QUESTION: ${task1Prompt}
TASK 1 RESPONSE (${t1Words} words):
${task1Response || '(No response provided)'}

TASK 2 QUESTION: ${task2Prompt}
TASK 2 RESPONSE (${t2Words} words):
${task2Response || '(No response provided)'}

Return ONLY valid JSON:
{
  "task1": {
    "band": 6.0,
    "taskAchievement": 6.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.0,
    "feedback": "Detailed specific feedback on what this student wrote",
    "strengths": ["specific strength from their text", "another"],
    "improvements": ["specific improvement needed", "another"],
    "rewrittenExample": "Take one weak sentence and rewrite at Band 8 level",
    "keyTricks": ["IELTS Task 1 trick for their mistakes", "trick 2", "trick 3"],
    "grammarMistakes": [{"mistake": "exact text from essay", "correction": "fixed version", "rule": "grammar rule"}],
    "vocabularyUpgrades": [{"original": "their word", "better": "better word", "example": "example sentence"}]
  },
  "task2": {
    "band": 6.0,
    "taskResponse": 6.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.0,
    "feedback": "Detailed specific feedback on their essay",
    "strengths": ["specific strength", "another"],
    "improvements": ["specific improvement", "another"],
    "essayStructureFeedback": "Comment on their intro, body paragraphs, and conclusion",
    "rewrittenExample": "Take one weak sentence and rewrite at Band 8 level",
    "keyTricks": ["IELTS Task 2 trick for their topic and mistakes", "trick 2", "trick 3"],
    "grammarMistakes": [{"mistake": "exact text", "correction": "fixed", "rule": "the rule"}],
    "vocabularyUpgrades": [{"original": "their word", "better": "better word", "example": "sentence"}]
  },
  "overallBand": 6.0,
  "studyPlan": ["study action for next week", "action 2", "action 3"],
  "progressToTarget": "How close to target band and what to focus on",
  "finalStudentReport": "Personal 5-6 sentence message to ${studentName || 'the student'} referencing their actual writing, their bands, what impressed you, their biggest mistake, and one specific technique to improve."
}`;
  try {
    console.log('Calling Claude for Writing...');
    const response = await client.messages.create({
      model: MODEL, max_tokens: 3000, temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });
    console.log('Claude Writing response OK');
    const parsed = safeExtractJson(response.content?.[0]?.text || '');
    if (!parsed) { console.error('Writing JSON parse failed'); return null; }
    console.log('=== WRITING GRADE COMPLETE - Overall:', parsed.overallBand, '===');
    return parsed;
  } catch (e) {
    console.error('Writing Claude error:', e.message, e.status);
    return null;
  }
}

async function explainWrongAnswer(questionText, questionType, studentAnswer, correctAnswer, existingExplanation) {
  console.log('=== EXPLAIN ANSWER CALLED ===');
  if (!client) return 'AI explanation unavailable.';
  if (existingExplanation && existingExplanation.length > 20) {
    console.log('Using stored explanation');
    return existingExplanation;
  }
  try {
    const response = await client.messages.create({
      model: MODEL, max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are an IELTS Reading examiner. Explain clearly and fully why this answer is wrong.

Question: ${questionText}
Question Type: ${questionType}
Student answered: "${studentAnswer || '(no answer)'}"
Correct answer: "${correctAnswer}"

Write 3-4 sentences that:
1. Explain why the student answer is wrong
2. Explain what evidence supports the correct answer
3. Give a specific tip for this question type`
      }]
    });
    return response.content[0].text;
  } catch (e) {
    console.error('Explain error:', e.message);
    return `The correct answer is "${correctAnswer}". Look for keywords in the passage that directly match the question. For ${questionType} questions, always check if the passage explicitly states, contradicts, or does not mention the statement.`;
  }
}

module.exports = { gradeAttempt, gradeWritingAttempt, explainWrongAnswer };