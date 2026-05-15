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
  if (!text || typeof text !== 'string') return null;
  // Try 1: already clean JSON
  try { return JSON.parse(text.trim()); } catch(e) {}
  // Try 2: find first { ... last }
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(text.substring(start, end + 1));
    }
  } catch(e) {}
  // Try 3: strip markdown fences (```json ... ```) then find { ... }
  try {
    const stripped = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    const start = stripped.indexOf('{');
    const end = stripped.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(stripped.substring(start, end + 1));
    }
  } catch(e) {}
  console.error('JSON parse failed. Raw:', text.substring(0, 300));
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
        system: 'You are an IELTS marking API. Respond with raw JSON only. Never use markdown. Never use backticks. Never wrap in code fences. Start your response with { and end with }. No text before or after the JSON.',
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

    // Word count check
    const task1Words = (task1Response || '').trim().split(/\s+/).filter(w => w.length > 0).length;
    const task2Words = (task2Response || '').trim().split(/\s+/).filter(w => w.length > 0).length;

    // If student wrote almost nothing return minimum bands
    if (task1Words < 20 && task2Words < 20) {
      console.log('Writing: Both tasks too short, returning Band 1');
      return {
        task1Band: 1.0,
        task2Band: 1.0,
        overallBand: 1.0,
        task1: {
          band: 1.0,
          taskAchievement: 1.0,
          coherenceCohesion: 1.0,
          lexicalResource: 1.0,
          grammaticalRange: 1.0,
          feedback: "Task not attempted. No meaningful response was written."
        },
        task2: {
          band: 1.0,
          taskResponse: 1.0,
          coherenceCohesion: 1.0,
          lexicalResource: 1.0,
          grammaticalRange: 1.0,
          feedback: "Task not attempted. No meaningful response was written."
        },
        strengths: ["No strengths identified — task was not attempted."],
        improvements: [
          "You must write at least 150 words for Task 1.",
          "You must write at least 250 words for Task 2.",
          "Attempt both tasks fully to receive a valid band score."
        ],
        weeklyActionPlan: "Start by practising writing at least 150 words for Task 1 and 250 words for Task 2 every day.",
        progressToTarget: "A meaningful attempt at both tasks is required before progress can be assessed."
      };
    }

    const task1TooShort = task1Words < 20
      ? `WARNING: Student wrote only ${task1Words} words. Task 1 minimum is 150 words. Penalise heavily — Task Achievement cannot exceed Band 3.`
      : `Task 1 word count: approximately ${task1Words} words (minimum 150).${task1Words < 150 ? ' Student is UNDER the word limit — penalise Task Achievement.' : ''}`;

    const task2TooShort = task2Words < 20
      ? `WARNING: Student wrote only ${task2Words} words. Task 2 minimum is 250 words. Penalise heavily — Task Response cannot exceed Band 3.`
      : `Task 2 word count: approximately ${task2Words} words (minimum 250).${task2Words < 250 ? ' Student is UNDER the word limit — penalise Task Response.' : ''}`;

    const prompt = `You are a strict, certified IELTS examiner marking an Academic Writing test.
You must apply the official IELTS band descriptors STRICTLY and honestly.
Do NOT be generous. Award the band that accurately reflects the writing quality.
A typical student scores between Band 4.0 and 6.5. Band 7+ requires genuinely sophisticated writing.

OFFICIAL IELTS BAND DESCRIPTORS (apply these strictly):
Band 9: Expert user. Fully operational, accurate and fluent.
Band 8: Very good. Fully operational with minor inaccuracies.
Band 7: Good. Operational with occasional inaccuracies. Good range of vocabulary and grammar.
Band 6: Competent. Generally effective with some inaccuracies. Adequate range.
Band 5: Modest. Partial command. Noticeable errors. Limited range.
Band 4: Limited. Basic competence. Frequent errors. Very limited range.
Band 3: Extremely limited. Frequent breakdowns in communication.
Band 2: Intermittent. Great difficulty. Little communication possible.
Band 1: Non-user. Essentially no ability.

STUDENT: ${studentName || 'Student'}
EXPECTED TARGET BAND: ${expectedBand || 'not specified'}

═══════════════════════════════════
TASK 1 PROMPT:
${(task1Prompt || 'Describe the chart or diagram.').substring(0, 300)}

${task1TooShort}

TASK 1 RESPONSE:
${task1Words < 5 ? '[NO RESPONSE — Student left Task 1 blank]' : (task1Response || '').substring(0, 800)}
═══════════════════════════════════
TASK 2 PROMPT:
${(task2Prompt || 'Write an essay.').substring(0, 300)}

${task2TooShort}

TASK 2 RESPONSE:
${task2Words < 5 ? '[NO RESPONSE — Student left Task 2 blank]' : (task2Response || '').substring(0, 1200)}
═══════════════════════════════════

MARKING RULES YOU MUST FOLLOW:
1. Task 1 is worth 33% and Task 2 is worth 67% of the overall band.
   Overall = (task1Band * 0.33) + (task2Band * 0.67). Round to nearest 0.5.
2. If a response is off-topic, award maximum Band 3 for Task Achievement/Response.
3. If a response is under the word limit, reduce Task Achievement/Response by at least 1 band.
4. If a response is mostly copied from the prompt, award Band 1 for Task Achievement.
5. Gibberish, random words, or non-English text = Band 1 across all criteria.
6. Band 7+ requires: varied vocabulary, complex sentences, cohesive devices, no major errors.
7. Be honest. Students need accurate feedback to improve.

Return ONLY this JSON. No markdown. No backticks. Start with { end with }.
All string values must be on ONE line with no line breaks inside strings.
{
  "task1Band": 5.5,
  "task2Band": 5.0,
  "overallBand": 5.0,
  "task1": {
    "band": 5.5,
    "taskAchievement": 5.0,
    "coherenceCohesion": 6.0,
    "lexicalResource": 5.5,
    "grammaticalRange": 5.5,
    "feedback": "Specific honest feedback on Task 1 response quality."
  },
  "task2": {
    "band": 5.0,
    "taskResponse": 5.0,
    "coherenceCohesion": 5.0,
    "lexicalResource": 5.0,
    "grammaticalRange": 5.0,
    "feedback": "Specific honest feedback on Task 2 response quality."
  },
  "strengths": ["specific genuine strength 1", "specific genuine strength 2"],
  "improvements": ["specific improvement needed 1", "specific improvement needed 2", "specific improvement needed 3"],
  "weeklyActionPlan": "Specific one sentence study advice based on their actual weaknesses.",
  "progressToTarget": "Honest one sentence assessment of gap between current and target band."
}
Replace ALL values with your actual honest assessment.
The example values above (5.5, 5.0 etc) are just placeholders — do NOT copy them.
Keep ALL strings on one line.
Do not add any fields not shown above.`;

    const response = await callClaudeWithRetry(prompt, 1000);
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