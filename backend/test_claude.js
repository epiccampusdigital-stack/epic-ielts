require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');

async function test() {
  const key = process.env.ANTHROPIC_API_KEY;
  console.log('Testing Key:', key ? 'FOUND' : 'MISSING');
  if (!key) return;

  const anthropic = new Anthropic({ apiKey: key });
  try {
    console.log('Sending test request to Claude...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log('Claude responded:', response.content[0].text);
    console.log('SUCCESS: API KEY IS VALID');
  } catch (error) {
    console.error('Claude Test Failed:', error.status, error.message || error);
  }
}
test();
