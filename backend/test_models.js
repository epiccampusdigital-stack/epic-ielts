require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function run() {
  try {
    const models = await anthropic.models.list();
    console.log('Available models for this API key:');
    console.log(JSON.stringify(models, null, 2));
  } catch (err) {
    console.error('Model list error:', err);
  }
}
run();
