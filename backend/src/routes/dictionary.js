// Word / phrase meanings for the reading exam. Simple English that fits the sentence the word is in.
// Claude gives the simple meaning; the free dictionary is the fallback. Answers are cached in memory.
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const cache = new Map();
const clean = (s) => String(s || '').toLowerCase().replace(/['’]s\b/g, '').replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ').trim();

async function fromDictionaryApi(word) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: ctrl.signal });
    if (!r.ok) return null;
    const data = await r.json();
    const m = data?.[0]?.meanings?.[0];
    const d = m?.definitions?.[0];
    if (!d?.definition) return null;
    return { meaning: d.definition, partOfSpeech: m.partOfSpeech || '', example: d.example || '', phonetic: data[0].phonetic || '' };
  } catch { return null; } finally { clearTimeout(t); }
}

async function fromClaude(word, sentence) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: key });
    const r = await client.messages.create({
      model: 'claude-haiku-4-5', max_tokens: 220,
      messages: [{ role: 'user', content:
`A beginner English student (level A2) tapped "${word}" in this sentence:
"${String(sentence || '').slice(0, 300)}"

Explain what it means IN THIS SENTENCE using very simple words (A1-A2). Reply with JSON only, no other text:
{"partOfSpeech":"noun/verb/adjective/...","meaning":"one short simple sentence, max 15 words","example":"one very short simple example sentence"}` }],
    });
    const txt = r?.content?.[0]?.text || '';
    const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
    if (!j.meaning) return null;
    return { meaning: String(j.meaning), partOfSpeech: String(j.partOfSpeech || ''), example: String(j.example || ''), phonetic: '' };
  } catch (e) { console.error('Dictionary Claude error:', e.message); return null; }
}

// GET /api/dictionary?word=...&sentence=...
router.get('/', auth, async (req, res) => {
  const word = clean(req.query.word);
  if (!word || word.length < 2 || word.length > 60 || word.split(' ').length > 5) return res.status(400).json({ error: 'Pick one word or a short phrase' });
  const sentence = String(req.query.sentence || '').slice(0, 400);
  const k = word + '|' + sentence.slice(0, 120);
  if (cache.has(k)) return res.json(cache.get(k));
  const out = (await fromClaude(word, sentence)) || (word.includes(' ') ? null : await fromDictionaryApi(word));
  if (!out) return res.status(404).json({ error: 'No meaning found' });
  const body = { word, ...out };
  if (cache.size > 2000) cache.clear();
  cache.set(k, body);
  res.json(body);
});

module.exports = router;
