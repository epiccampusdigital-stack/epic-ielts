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
  try {
    // 1. Direct parse
    return JSON.parse(text);
  } catch (e) {
    try {
      // 2. Strip markdown backticks
      const stripped = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      return JSON.parse(stripped);
    } catch (e2) {
      try {
        // 3. Extract JSON object using regex
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
      } catch (e3) {
        console.error('All JSON parse attempts failed. Raw response snippet:', text.substring(0, 200));
        return null;
      }
    }
  }
  return null;
}

async function callClaudeWithRetry(prompt, maxTokens = 800, maxRetries = 3) {
  const claude = getClient();
  if (!claude) return null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await claude.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });
      return response;
    } catch (error) {
      // If rate limited (529 or 429), wait and retry
      if ((error.status === 529 || error.status === 429 || error.message?.includes('overloaded') || error.message?.includes('rate limit')) 
          && attempt < maxRetries) {
        const waitTime = attempt * 2000; // 2s, 4s, 6s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      console.error(`Claude API error (Attempt ${attempt}/${maxRetries}):`, error.message);
      if (attempt === maxRetries) throw error;
    }
  }
}

async function gradeAttempt(answerReview, paperSummaryStr) {
  console.log('gradeAttempt called');
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
${wrong.slice(0, 15).map(a => `Q${a.questionNumber}[${a.questionType}]: "${String(a.question || '').substring(0, 80)}" | Student: "${a.studentAnswer || 'blank'}" | Correct: "${a.correctAnswer}"`).join('\n')}
${wrong.length > 15 ? '... (truncated for space)' : ''}

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
    const response = await callClaudeWithRetry(prompt, 800);
    const parsed = safeExtractJson(response.content?.[0]?.text || '');
    if (!parsed) { console.error('JSON parse failed'); return null; }
    console.log('Reading grade complete. Band:', parsed.bandEstimate);
    return parsed;
  } catch (e) {
    console.error('Reading Claude error:', e.message);
    return null;
  }
}

async function gradeWritingAttempt(task1Response, task1Prompt, task2Response, task2Prompt, studentName, expectedBand) {
  console.log('gradeWritingAttempt called for:', studentName);
  
  const t1Truncated = (task1Response || '').substring(0, 2000);
  const t2Truncated = (task2Response || '').substring(0, 3000);
  const t1Words = t1Truncated.trim().split(/\s+/).filter(Boolean).length;
  const t2Words = t2Truncated.trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are a certified IELTS Writing examiner. Mark these writing tasks and give detailed teaching feedback.

STUDENT: ${studentName || 'Student'} TARGET BAND: ${expectedBand || 'not specified'}

TASK 1 QUESTION: ${(task1Prompt || '').substring(0, 300)}
TASK 1 RESPONSE (${t1Words} words):
${t1Truncated}

TASK 2 QUESTION: ${(task2Prompt || '').substring(0, 300)}
TASK 2 RESPONSE (${t2Words} words):
${t2Truncated}

Return ONLY a valid JSON object. Do not include any markdown formatting, code blocks, backticks, or explanatory text. Start your response with { and end with }.

JSON Structure:
{
  "task1": { "band": 6.0, "taskAchievement": 6.0, "coherenceCohesion": 6.0, "lexicalResource": 6.0, "grammaticalRange": 6.0, "feedback": "...", "strengths": [], "improvements": [], "rewrittenExample": "...", "keyTricks": [], "grammarMistakes": [], "vocabularyUpgrades": [] },
  "task2": { "band": 6.0, "taskResponse": 6.0, "coherenceCohesion": 6.0, "lexicalResource": 6.0, "grammaticalRange": 6.0, "feedback": "...", "strengths": [], "improvements": [], "essayStructureFeedback": "...", "rewrittenExample": "...", "keyTricks": [], "grammarMistakes": [], "vocabularyUpgrades": [] },
  "overallBand": 6.0, "studyPlan": [], "progressToTarget": "...", "finalStudentReport": "..."
}`;

  try {
    const response = await callClaudeWithRetry(prompt, 800);
    const responseText = response.content?.[0]?.text || '';
    console.log('Claude raw response snippet:', responseText.substring(0, 300));

    const parsed = safeExtractJson(responseText);
    if (!parsed) { 
      console.log('Writing JSON failed. Raw response was:', responseText.substring(0, 300));
      // Fallback object to prevent server crashes
      return {
        task1: { band: 5.0, feedback: "Automated feedback temporarily unavailable." },
        task2: { band: 5.0, feedback: "Automated feedback temporarily unavailable." },
        overallBand: 5.0,
        finalStudentReport: "Automated feedback temporarily unavailable. Please ask your teacher for manual feedback.",
        markingStatus: 'PARTIAL'
      };
    }
    console.log('Writing grade complete. Overall band:', parsed.overallBand);
    return parsed;
  } catch (e) {
    console.error('Writing Claude error:', e.message);
    return null;
  }
}

async function explainWrongAnswer(questionText, questionType, studentAnswer, correctAnswer, existingExplanation) {
  if (existingExplanation && existingExplanation.length > 20) {
    return existingExplanation;
  }
  try {
    const prompt = `IELTS examiner. 3 sentences explaining why this answer is wrong.
Q: ${(questionText || '').substring(0, 150)}
Type: ${questionType}
Student: "${studentAnswer || 'blank'}" Correct: "${correctAnswer}"
1) Why wrong 2) Passage evidence for correct answer 3) Tip for this question type`;
    
    const response = await callClaudeWithRetry(prompt, 300);
    return response.content[0].text;
  } catch (e) {
    return `The correct answer is "${correctAnswer}". For ${questionType} questions, scan the passage for exact keywords that match the question statement.`;
  }
}

async function gradeSpeakingAttempt(transcript, partNumber, questionPrompt, studentName, expectedBand) {
  console.log('gradeSpeakingAttempt called for:', studentName, 'Part:', partNumber);
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
  "feedback": "...", "strengths": [], "improvements": [], "keyTricks": [], "finalReport": "..."
}`;

  try {
    const response = await callClaudeWithRetry(prompt, 600);
    const parsed = safeExtractJson(response.content?.[0]?.text || '');
    return parsed;
  } catch (e) {
    console.error('Speaking Claude error:', e.message);
    return null;
  }
}

module.exports = { gradeAttempt, gradeWritingAttempt, explainWrongAnswer, gradeSpeakingAttempt };