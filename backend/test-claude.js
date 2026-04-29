require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 200,
  system: 'You are a JSON API. Return raw JSON only. No markdown. No backticks. Start with {',
  messages: [{ role: 'user', content: 'Return this JSON exactly: {"band": 6.5}' }]
}).then(r => {
  console.log('SUCCESS');
  console.log('RAW:', r.content[0].text);
  const s = r.content[0].text.indexOf('{');
  const e = r.content[0].text.lastIndexOf('}');
  console.log('EXTRACTED:', r.content[0].text.substring(s, e+1));
  console.log('PARSED OK:', JSON.parse(r.content[0].text.substring(s, e+1)));
}).catch(e => {
  console.log('FAILED:', e.status, e.message);
});
