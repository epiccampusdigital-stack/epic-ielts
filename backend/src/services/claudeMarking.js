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

const MODEL = 'claude-haiku-4-5';
console.log('EPIC IELTS Marking Engine - Using model:', MODEL);

function safeExtractJson(text) {
  if (!text) return null;
  // Try 1: clean JSON
  try { return JSON.parse(text.trim()); } catch(e) {}
  // Try 2: find { ... } and parse just that part
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(text.substring(start, end + 1));
    }
  } catch(e) {}
  return null;
}

async function callClaudeWithRetry(prompt, maxTokens = 400, maxRetries = 3) {
  const claude = getClient();
  if (!claude) return null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await claude.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature: 0.3,
        system: 'You are an IELTS examiner API. Return only the exact JSON structure requested. No extra fields. No markdown. No backticks. Keep responses under 400 tokens.',
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
  try {
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

    const response = await callClaudeWithRetry(prompt, 600);
    const responseText = response.content?.[0]?.text || '';
    const parsed = safeExtractJson(responseText);
    if (!parsed) { 
      console.error('Reading JSON parse failed. Raw:', responseText.substring(0, 200));
      return null; 
    }
    console.log('Reading grade complete. Band:', parsed.bandEstimate);
    return parsed;
  } catch (e) {
    console.error('Reading Claude error:', e.message);
    return null;
  }
}

async function gradeWritingAttempt(task1Response, task1Prompt, task2Response, task2Prompt, studentName, expectedBand) {
  try {
    console.log('gradeWritingAttempt called for:', studentName);
    
    const prompt = `You are an expert IELTS examiner. 
Analyse both writing tasks and return detailed feedback.

TASK 1 RESPONSE:
${task1Response.substring(0, 1000)}

TASK 2 RESPONSE:
${task2Response.substring(0, 1500)}

Return ONLY this JSON. No markdown. No backticks. 
Start with { and end with }. 
All string values must be on ONE line with no line breaks inside strings.

{
  "task1Band": 7.0,
  "task2Band": 7.0,
  "overallBand": 7.0,
  "task1": {
    "band": 7.0,
    "taskAchievement": 7.0,
    "coherenceCohesion": 7.0,
    "lexicalResource": 6.5,
    "grammaticalRange": 7.0,
    "feedback": "One sentence feedback on task 1."
  },
  "task2": {
    "band": 7.0,
    "taskResponse": 7.0,
    "coherenceCohesion": 7.0,
    "lexicalResource": 7.0,
    "grammaticalRange": 7.0,
    "feedback": "One sentence feedback on task 2."
  },
  "strengths": ["strength one", "strength two", "strength three"],
  "improvements": ["improvement one", "improvement two", "improvement three"],
  "weeklyActionPlan": "One sentence study advice for this student.",
  "progressToTarget": "One sentence on how close student is to their target band."
}

Replace all values with your actual assessment.
Keep ALL strings on one line.
Do not add any fields not shown above.`;

    const response = await callClaudeWithRetry(prompt, 800);
    const responseText = response.content?.[0]?.text || '';
    console.log('Writing Claude raw response snippet:', responseText.substring(0, 300));

    const parsed = safeExtractJson(responseText);
    if (!parsed) { 
      console.log('Writing JSON extraction failed. Response length:', responseText.length);
      return {
        task1Band: 5.0,
        task2Band: 5.0,
        overallBand: 5.0,
        task1: { band: 5.0, feedback: "Automated feedback temporarily unavailable." },
        task2: { band: 5.0, feedback: "Automated feedback temporarily unavailable." },
        strengths: ["Review your writing carefully."],
        improvements: ["Practice more tasks."],
        weeklyActionPlan: "Continue practicing daily.",
        progressToTarget: "Stay focused on your target band.",
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
    return response?.content?.[0]?.text || `The correct answer is "${correctAnswer}". For ${questionType} questions, scan the passage for exact keywords that match the question statement.`;
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