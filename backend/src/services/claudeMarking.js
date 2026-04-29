require('dotenv').config();

let client = null;

function getClient() {
  if (client) return client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { console.error('ANTHROPIC_API_KEY missing'); return null; }
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    client = new Anthropic({ apiKey: key });
    console.log('Claude client ready');
    return client;
  } catch (e) {
    console.error('Claude init error:', e.message);
    return null;
  }
}

const MODEL = 'claude-haiku-4-5-20251001';
console.log('EPIC IELTS Marking Engine - Using model:', MODEL);

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
  if (!claude) return null;

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

  const prompt = `You are an IELTS Reading examiner. Give personal feedback for this student.

STUDENT: ${paperSummary.studentName || 'Student'}
SCORE: ${paperSummary.rawScore || 0}/40 BAND: ${paperSummary.bandEstimate || 4}
PAPER: ${paperSummary.paperCode || 'N/A'}

QUESTION TYPE PERFORMANCE:
${Object.entries(typeStats).map(([t, s]) => `${t}: ${s.correct}/${s.total} correct (${s.wrong} wrong)`).join('\n')}

ALL WRONG ANSWERS (${wrong.length} total mistakes):
${wrong.map(a => `Q${a.questionNumber}[${a.questionType}]: "${String(a.question || '').substring(0, 80)}" | Student: "${a.studentAnswer || 'blank'}" | Correct: "${a.correctAnswer}"`).join('\n')}

CORRECT QUESTION TYPES: ${[...new Set(correct.map(a => a.questionType))].join(', ') || 'None'}

PREVIOUS RESULTS: ${paperSummary.previousResults?.length > 0 ? paperSummary.previousResults.map(p => `Band ${p.band} Score ${p.score}`).join(', ') : 'First attempt'}

Return ONLY JSON:
{
  "bandEstimate": ${paperSummary.bandEstimate || 4},
  "strengths": ["specific strength 1", "specific strength 2"],
  "weakAreas": ["weak area 1 with question type", "weak area 2"],
  "mistakeAnalysis": ["specific mistake pattern 1", "mistake pattern 2", "mistake pattern 3"],
  "questionTypeAnalysis": {
    "TRUE_FALSE_NOT_GIVEN": "performance analysis",
    "MULTIPLE_CHOICE": "performance analysis",
    "SHORT_ANSWER": "performance analysis"
  },
  "improvementAdvice": ["specific IELTS tip 1", "tip 2", "tip 3"],
  "progressComment": "comment on progress vs previous attempts",
  "teacherSummary": "2 sentence professional summary for teacher",
  "finalStudentReport": "4-5 sentence personal message to ${paperSummary.studentName || 'the student'} about their score of ${paperSummary.rawScore}/40 band ${paperSummary.bandEstimate}, what they did well, main weakness, and one clear improvement tip."
}`;

  try {
    console.log('Calling Claude Haiku for Reading...');
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });
    console.log('Claude Reading OK. Tokens:', response.usage?.input_tokens, '+', response.usage?.output_tokens);
    const parsed = safeExtractJson(response.content?.[0]?.text || '');
    if (!parsed) { console.error('JSON parse failed'); return null; }
    console.log('Reading grade complete. Band:', parsed.bandEstimate);
    return parsed;
  } catch (e) {
    console.error('Reading Claude error:', e.message, e.status);
    return null;
  }
}

async function gradeWritingAttempt(task1Response, task1Prompt, task2Response, task2Prompt, studentName, expectedBand) {
  console.log('gradeWritingAttempt called for:', studentName);
  const claude = getClient();
  if (!claude) return null;

  const t1Words = (task1Response || '').trim().split(/\s+/).filter(Boolean).length;
  const t2Words = (task2Response || '').trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are a certified IELTS Writing examiner. Mark these writing tasks and give detailed teaching feedback.

STUDENT: ${studentName || 'Student'} TARGET BAND: ${expectedBand || 'not specified'}

TASK 1 QUESTION: ${(task1Prompt || '').substring(0, 300)}
TASK 1 RESPONSE (${t1Words} words):
${(task1Response || '(No response)').substring(0, 800)}

TASK 2 QUESTION: ${(task2Prompt || '').substring(0, 300)}
TASK 2 RESPONSE (${t2Words} words):
${(task2Response || '(No response)').substring(0, 1000)}

Return ONLY JSON:
{
  "task1": {
    "band": 6.0,
    "taskAchievement": 6.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.0,
    "feedback": "specific feedback on their task 1 response",
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "rewrittenExample": "one weak sentence rewritten at band 8",
    "keyTricks": ["task 1 trick 1", "trick 2"],
    "grammarMistakes": [{"mistake": "exact text", "correction": "fixed", "rule": "grammar rule"}],
    "vocabularyUpgrades": [{"original": "basic word", "better": "advanced word", "example": "example sentence"}]
  },
  "task2": {
    "band": 6.0,
    "taskResponse": 6.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 6.0,
    "grammaticalRange": 6.0,
    "feedback": "specific feedback on their task 2 essay",
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "essayStructureFeedback": "comment on introduction body conclusion",
    "rewrittenExample": "one weak sentence rewritten at band 8",
    "keyTricks": ["task 2 trick 1", "trick 2"],
    "grammarMistakes": [{"mistake": "exact text", "correction": "fixed", "rule": "rule"}],
    "vocabularyUpgrades": [{"original": "word", "better": "better word", "example": "sentence"}]
  },
  "overallBand": 6.0,
  "studyPlan": ["study action 1", "action 2", "action 3"],
  "progressToTarget": "how close to target band and what to focus on",
  "finalStudentReport": "5-6 sentence personal message to ${studentName || 'the student'} referencing their actual writing, bands received, what impressed you, biggest mistake, specific technique to improve next time."
}`;

  try {
    console.log('Calling Claude Haiku for Writing...');
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });
    console.log('Writing OK. Tokens:', response.usage?.input_tokens, '+', response.usage?.output_tokens);
    const parsed = safeExtractJson(response.content?.[0]?.text || '');
    if (!parsed) { console.error('Writing JSON failed'); return null; }
    console.log('Writing grade complete. Overall band:', parsed.overallBand);
    return parsed;
  } catch (e) {
    console.error('Writing Claude error:', e.message);
    return null;
  }
}

async function explainWrongAnswer(questionText, questionType, studentAnswer, correctAnswer, existingExplanation) {
  if (existingExplanation && existingExplanation.length > 20) {
    console.log('Using stored explanation - zero API cost');
    return existingExplanation;
  }
  const claude = getClient();
  if (!claude) return `The correct answer is "${correctAnswer}". Review the passage carefully.`;
  try {
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `IELTS examiner. 3 sentences explaining why this answer is wrong.
Q: ${(questionText || '').substring(0, 150)}
Type: ${questionType}
Student: "${studentAnswer || 'blank'}" Correct: "${correctAnswer}"
1) Why wrong 2) Passage evidence for correct answer 3) Tip for this question type`
      }]
    });
    return response.content[0].text;
  } catch (e) {
    return `The correct answer is "${correctAnswer}". For ${questionType} questions, scan the passage for exact keywords that match the question statement.`;
  }
}

async function gradeSpeakingAttempt(transcript, partNumber, questionPrompt, studentName, expectedBand) {
  console.log('gradeSpeakingAttempt called for:', studentName, 'Part:', partNumber);
  const claude = getClient();
  if (!claude) return null;

  const prompt = `You are a certified IELTS Speaking examiner. Evaluate this speaking response.

STUDENT: ${studentName || 'Student'} TARGET: ${expectedBand || 'not set'}
PART: ${partNumber || 1}
QUESTION: ${questionPrompt || 'Speaking question'}
TRANSCRIPT: ${(transcript || '').substring(0, 800)}

Return ONLY JSON:
{
  "band": 6.0,
  "fluencyCoherence": 6.0,
  "lexicalResource": 6.0,
  "grammaticalRange": 6.0,
  "pronunciation": 6.0,
  "feedback": "specific feedback on their speaking",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "keyTricks": ["speaking tip 1", "tip 2"],
  "finalReport": "3-4 sentence personal message to ${studentName || 'the student'} about their speaking performance."
}`;

  try {
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 800,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });
    return safeExtractJson(response.content?.[0]?.text || '');
  } catch (e) {
    console.error('Speaking Claude error:', e.message);
    return null;
  }
}

module.exports = { gradeAttempt, gradeWritingAttempt, explainWrongAnswer, gradeSpeakingAttempt };