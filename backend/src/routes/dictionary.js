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

// Sinhala needs a stronger model than the quick English one
const SI_MODELS = [process.env.SINHALA_MODEL, 'claude-sonnet-5-5', 'claude-opus-5-5', 'claude-sonnet-4-5'].filter(Boolean);
async function sinhalaMeaning(word, sentence, englishMeaning) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: key });
  const prompt = `You are a Sri Lankan English teacher. A Sinhala-speaking student tapped the English word "${word}" in this sentence:
"${String(sentence || '').slice(0, 300)}"
Its meaning here: ${englishMeaning}

Give:
1. "sinhalaWord": the correct Sinhala word or short phrase for "${word}" with THIS meaning, as it appears in a good English-Sinhala dictionary (for example culture = සංස්කෘතිය, environment = පරිසරය, increase = වැඩි වීම). Use proper Sinhala script and correct spelling. Do not write the English word in Sinhala letters unless Sri Lankans really use the English word.
2. "sinhala": one short, simple, natural sentence in everyday Sinhala that explains the meaning, the way a teacher would say it in class. Correct grammar and spelling. No English words.

Reply with JSON only: {"sinhalaWord":"...","sinhala":"..."}`;
  for (const model of SI_MODELS) {
    try {
      const r = await client.messages.create({ model, max_tokens: 400, messages: [{ role: 'user', content: prompt }] });
      const txt = r?.content?.map(c => c.text || '').join('') || '';
      const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
      if (j.sinhala && /[\u0D80-\u0DFF]/.test(j.sinhala)) return { sinhala: String(j.sinhala), sinhalaWord: String(j.sinhalaWord || '') };
    } catch (e) {
      if (e && (e.status === 404 || e.status === 400)) continue;
      console.error('Dictionary Sinhala error:', e.message);
      return null;
    }
  }
  return null;
}

async function fromClaude(word, sentence, sinhala) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: key });
    const r = await client.messages.create({
      model: 'claude-haiku-4-5', max_tokens: sinhala ? 500 : 220,
      messages: [{ role: 'user', content:
`A beginner English student (level A2) tapped "${word}" in this sentence:
"${String(sentence || '').slice(0, 300)}"

Explain what it means IN THIS SENTENCE using very simple words (A1-A2).${sinhala ? ' The student is Sri Lankan, so also give the meaning in Sinhala (natural, everyday Sinhala in Sinhala script, the way a Sri Lankan teacher would explain it).' : ''} Reply with JSON only, no other text:
{"partOfSpeech":"noun/verb/adjective/...","meaning":"one short simple sentence, max 15 words","example":"one very short simple example sentence"${sinhala ? ',"sinhalaWord":"the Sinhala word or short phrase for it","sinhala":"one short simple Sinhala sentence explaining the meaning in this sentence"' : ''}}` }],
    });
    const txt = r?.content?.[0]?.text || '';
    const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
    if (!j.meaning) return null;
    return { meaning: String(j.meaning), partOfSpeech: String(j.partOfSpeech || ''), example: String(j.example || ''), phonetic: '',
      ...(sinhala && j.sinhala ? { sinhala: String(j.sinhala), sinhalaWord: String(j.sinhalaWord || '') } : {}) };
  } catch (e) { console.error('Dictionary Claude error:', e.message); return null; }
}

// GET /api/dictionary?word=...&sentence=...
router.get('/', auth, async (req, res) => {
  const word = clean(req.query.word);
  if (!word || word.length < 2 || word.length > 60 || word.split(' ').length > 5) return res.status(400).json({ error: 'Pick one word or a short phrase' });
  const sentence = String(req.query.sentence || '').slice(0, 400);
  const sinhala = req.query.si === '1';
  const k = (sinhala ? 'si|' : '') + word + '|' + sentence.slice(0, 120);
  if (cache.has(k)) return res.json(cache.get(k));
  let out = (await fromClaude(word, sentence, false)) || (word.includes(' ') ? null : await fromDictionaryApi(word));
  if (!out) return res.status(404).json({ error: 'No meaning found' });
  if (sinhala) out = { ...out, ...((await sinhalaMeaning(word, sentence, out.meaning)) || {}) };
  const body = { word, ...out };
  if (cache.size > 2000) cache.clear();
  cache.set(k, body);
  res.json(body);
});

module.exports = router;
