const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const systemPrompt = `
You are the AI Marking Engine for EPIC IELTS Digital Examiner.

You must analyse student answers only after the student clicks END.
You must act as a strict IELTS-style examiner.
Return ONLY valid JSON. No markdown wrappers.

GENERAL RULES:
- Do not teach during the exam.
- Do not give hints during the exam.
- Only mark after END.
- Be strict, realistic, and professional.
- Do not over-score students.
- Give clear IELTS-style feedback.
- Do not use emojis.
- Do not use casual language.

AI MARKING ENGINE TASKS:
1. Reading and Listening: Compare student answers with answer key. Calculate score out of 40. Convert to band estimate.
2. Writing: Analyse Task 1/2 using IELTS criteria (Task Achievement/Response, Coherence, Lexical, Grammar).
3. Speaking: Analyse responses using IELTS criteria (Fluency, Lexical, Grammar, Pronunciation).
4. Feedback: Explain mistakes, identify weak areas, give improvement advice.
5. Progress: Compare current result with previous results if available.

OUTPUT JSON FORMAT (STRICT):
{
  "studentName": "string",
  "testType": "Reading | Listening | Writing | Speaking",
  "paperCode": "string",
  "score": "X/40",
  "bandEstimate": "X.X",
  "criterionScores": { "taskResponse": 0, "coherence": 0, "lexical": 0, "grammar": 0 },
  "correctAnswers": ["list of correct answers"],
  "studentAnswers": ["list of student answers"],
  "mistakeAnalysis": ["list of specific mistakes and why they happened"],
  "strengths": ["list of positive observations"],
  "weakAreas": ["list of areas needing improvement"],
  "improvementAdvice": ["list of specific steps to take"],
  "teacherSummary": "Internal summary for the teacher",
  "progressComment": "Comparison with previous results",
  "finalStudentReport": "A professional summary report for the student"
}
`;

function safeExtractJson(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch { }

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function gradeAttempt(answers, paperStr) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Claude error: ANTHROPIC_API_KEY missing from .env');
    return null;
  }

  try {
    const summary = JSON.parse(paperStr);
    const testType = String(summary.testType || '').toUpperCase();

    if (testType === 'WRITING') {
      return await gradeWritingAttempt(answers, paperStr);
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest', // Ensure we use the latest stable model
      max_tokens: 3000,
      temperature: 0, // Lower temperature for more consistent marking
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `
Analyze this IELTS Reading test result.

Paper/System Summary:
${paperStr}

Answer Review:
${JSON.stringify(answers, null, 2)}

Give feedback to the student. Focus on:
1. Overall band explanation
2. Strengths
3. Weak question types
4. Why mistakes happened
5. How to improve
6. Next study plan
`
        }
      ]
    });

    console.log('Claude raw response:', response);
    const text = response.content?.[0]?.text || '';
    const parsed = safeExtractJson(text);

    if (!parsed) {
      console.error('Claude returned non-JSON:', text);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Claude FULL ERROR:', error);
    return null;
  }
}

async function gradeWritingAttempt(submission, paperStr) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4000,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `
Analyze this IELTS Writing test submission.

Paper/System Summary:
${paperStr}

Student Submission:
${JSON.stringify(submission, null, 2)}

Provide a strict, professional IELTS evaluation.
Evaluate Task 1 and Task 2 separately but return one final consolidated JSON.
Focus on:
1. Task Achievement / Response
2. Coherence and Cohesion
3. Lexical Resource (Vocabulary)
4. Grammatical Range and Accuracy

Calculate a fair band score for each criterion and an overall band estimate.
`
        }
      ]
    });

    const text = response.content?.[0]?.text || '';
    return safeExtractJson(text);
  } catch (error) {
    console.error('Writing Grade Error:', error);
    return null;
  }
}

async function extractPaperData(rawText) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4000,
      temperature: 0,
      system: `You are an IELTS paper extraction system. Extract the following from the provided text and return ONLY valid JSON.
      
      STRUCTURE:
      {
        "title": "string",
        "testType": "READING | WRITING",
        "timeLimitMin": number,
        "passages": [{ "passageNumber": number, "title": "string", "text": "string" }],
        "questions": [{
          "passageNumber": number,
          "questionNumber": number,
          "questionType": "TRUE_FALSE_NOT_GIVEN | MULTIPLE_CHOICE | SHORT_ANSWER | SENTENCE_COMPLETION | MATCHING_HEADINGS | SUMMARY_COMPLETION",
          "content": "string",
          "options": ["list of strings or null"],
          "correctAnswer": "string",
          "explanation": "string or null"
        }]
      }
      
      RULES:
      - Extract only what is explicitly in the text.
      - If answer key is not provided, leave correctAnswer as empty string.
      - Return ONLY JSON.`,
      messages: [
        {
          role: 'user',
          content: rawText
        }
      ]
    });

    const text = response.content?.[0]?.text || '';
    return safeExtractJson(text);
  } catch (error) {
    console.error('Extraction Error:', error);
    return null;
  }
}

module.exports = { gradeAttempt, gradeWritingAttempt, extractPaperData };