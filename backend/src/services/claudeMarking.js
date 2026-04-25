const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const systemPrompt = `
You are the official IELTS Digital Examiner for EPIC Campus.

Return ONLY valid JSON. No markdown. No explanation outside JSON.

Use this exact JSON structure:
{
  "bandEstimate": 0,
  "strengths": "",
  "weaknesses": "",
  "improvementAdvice": "",
  "aiDetailedFeedback": ""
}

For Reading:
- Do not invent a new score.
- Use the raw score and band estimate provided by the system.
- Analyze the student's wrong answers, question types, reading skills, and improvement priorities.
- Be direct, helpful, professional, and student-friendly.
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
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2000,
      temperature: 0.2,
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

module.exports = { gradeAttempt };