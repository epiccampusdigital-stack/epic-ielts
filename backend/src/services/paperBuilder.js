// Paper builder: Claude writes a new General English paper as JSON, we check it, save it as a
// DRAFT (teachers review it and press "Make live"), and for listening papers Gemini TTS records
// the audio. Keys come only from env vars: ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY.
const { prisma } = require('./programService');
const { seedPaperList } = require('../../scripts/generalEnglish/placement');
const { LEVELS } = require('../../scripts/generalEnglish/difficulty');

const GENERATOR_MODELS = [process.env.GENERATOR_MODEL, 'claude-sonnet-5-5', 'claude-sonnet-4-5', 'claude-haiku-4-5'].filter(Boolean);
const TTS_MODELS = [process.env.GEMINI_TTS_MODEL, 'gemini-3.8-flash-tts', 'gemini-2.5-flash-preview-tts'].filter(Boolean);
const MALE_VOICE = process.env.GEMINI_MALE_VOICE || 'Sadaltager';
const FEMALE_VOICE = process.env.GEMINI_FEMALE_VOICE || 'Sulafat';
const NARRATOR_VOICE = process.env.GEMINI_NARRATOR_VOICE || FEMALE_VOICE;

// ─── jobs (in memory; a job takes 1 to 4 minutes) ───────────────────────────
const jobs = new Map();
const newJob = by => {
  const id = Math.random().toString(36).slice(2, 10);
  const job = { id, by, status: 'running', step: 'Starting', paperId: null, error: null, started: Date.now() };
  jobs.set(id, job);
  for (const [k, j] of jobs) if (Date.now() - j.started > 6 * 3600e3) jobs.delete(k);
  return job;
};

// ─── text helpers ───────────────────────────────────────────────────────────
const words = s => new Set(String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 2));
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let n = 0; for (const w of a) if (b.has(w)) n++;
  return n / (a.size + b.size - n);
};
const norm = s => String(s || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ');

// ─── what already exists (so new papers do not repeat it) ──────────────────
async function existingContent() {
  const papers = await prisma.paper.findMany({
    where: { track: 'GENERAL' },
    select: { title: true, topic: true, testType: true, audioScript: true, passages: { select: { text: true } }, writingTasks: { select: { prompt: true } }, questions: { select: { content: true } } },
  });
  const titles = papers.map(p => `${p.testType}: ${p.title}${p.topic ? ` (${p.topic})` : ''}`);
  const questions = papers.flatMap(p => p.questions.map(q => q.content)).filter(Boolean);
  const texts = papers.flatMap(p => [...p.passages.map(x => x.text), ...p.writingTasks.map(t => t.prompt), p.audioScript || '']).filter(t => t.length > 80);
  return { titles, questions, texts };
}

// ─── the prompt ─────────────────────────────────────────────────────────────
const SHAPES = {
  READING: `{
  "title": "short title, 2 to 6 words",
  "topic": "one or two words",
  "minutes": 20,
  "instructions": "one sentence for the student",
  "passageTitle": "...",
  "passage": "the reading text. Use blank lines between paragraphs. If you use paragraph-matching questions, start each paragraph with [A], [B], [C] ...",
  "groups": [
    { "type": "MULTIPLE_CHOICE", "instruction": "Questions 1 to 4. Choose the correct letter, A, B, C or D.",
      "questions": [ { "q": "question", "options": ["text","text","text","text"], "answer": "B", "why": "short reason quoting the text", "ev": ["exact words copied from the passage"] } ] },
    { "type": "TRUE_FALSE_NOT_GIVEN", "instruction": "Questions 5 to 8. Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.",
      "questions": [ { "q": "statement", "answer": "TRUE", "why": "...", "ev": ["exact words"] } ] },
    { "type": "SENTENCE_COMPLETION", "instruction": "Questions 9 to 10. Complete the sentences. Write ONE WORD from the text.", "wordLimit": "ONE WORD",
      "questions": [ { "q": "sentence with ________ for the gap", "answer": "WORD", "why": "...", "ev": ["exact words"] } ] }
  ]
}`,
  LISTENING: `{
  "title": "short title, 2 to 6 words",
  "topic": "one or two words",
  "minutes": 18,
  "instructions": "one sentence for the student",
  "sections": [
    { "number": 1, "description": "what the student will hear, e.g. A woman books a hotel room",
      "script": "Narrator: Section one. You will hear ... Questions 1 to 5.\\nWoman: ...\\nMan: ...",
      "groups": [ { "type": "SENTENCE_COMPLETION", "instruction": "Questions 1 to 5. Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.", "wordLimit": "ONE WORD AND/OR A NUMBER",
        "questions": [ { "q": "Name of hotel: ________", "answer": "SEAVIEW", "why": "...", "ev": ["exact words copied from the script"] } ] } ] },
    { "number": 2, "description": "...", "script": "Narrator: Section two. ...\\nGuide: ...",
      "groups": [ { "type": "MULTIPLE_CHOICE", "instruction": "Questions 6 to 10. Choose the correct letter, A, B or C.",
        "questions": [ { "q": "question", "options": ["text","text","text"], "answer": "C", "why": "...", "ev": ["exact words"] } ] } ] }
  ]
}`,
  WRITING: `{
  "title": "short title, 2 to 6 words",
  "topic": "one or two words",
  "minutes": 45,
  "instructions": "one sentence for the student",
  "tasks": [
    { "taskNumber": 1, "minWords": 80, "timeMinutes": 20, "prompt": "the full task, with bullet points on new lines starting with - , ending with 'Write at least N words.'" },
    { "taskNumber": 2, "minWords": 120, "timeMinutes": 25, "prompt": "..." }
  ]
}`,
};

const LEVEL_GUIDE = {
  1: 'A1 beginner. Very short simple sentences, present simple, everyday words only (home, family, food, time, places). Reading text about 180 words. Listening scripts about 100 words. Writing: Task 1 about 40 words, Task 2 about 60 words.',
  2: 'A2 elementary. Simple sentences joined with and/but/because, past simple, common words. Reading text about 280 words. Listening scripts about 150 words. Writing: Task 1 about 70 words (a short email), Task 2 about 80 words.',
  3: 'B1 intermediate. Clear connected text, some opinions and reasons, a few less common words. Reading text about 350 words with paragraphs [A] to [E]. Listening scripts about 180 words, one speaker may correct themselves. Writing: Task 1 about 100 words (formal email), Task 2 about 150 words (opinion).',
  4: 'B1+ upper intermediate. Longer sentences, some abstract ideas, linking words such as however, although, as a result. Reading text about 400 words. Listening scripts about 200 words with distractors (a speaker changes a detail). Writing: Task 1 about 120 words (formal letter), Task 2 about 180 words (advantages and disadvantages).',
  5: 'B2 advanced, close to IELTS Academic. Complex sentences, academic vocabulary, paraphrase in questions. Reading text about 450 words. Listening scripts about 220 words with distractors. Writing: Task 1 150 words (describe data given as a small text table), Task 2 250 words (discuss both views and give an opinion).',
};

const COUNTS = { READING: d => (d <= 2 ? 10 : 12), LISTENING: () => 10, WRITING: () => 2 };

function buildPrompt({ skill, difficulty, topic, avoid, extraAvoid }) {
  const n = COUNTS[skill](difficulty);
  const lines = [
    `Write ONE new General English ${skill.toLowerCase()} practice paper for Sri Lankan students aged 18 to 24 who are preparing to study in Korea.`,
    `Level: ${difficulty} of 5 stars. ${LEVEL_GUIDE[difficulty]}`,
    topic ? `Topic: ${topic}.` : 'Choose a fresh, interesting topic that students will like (study, travel, work, health, technology, culture, nature, Sri Lanka, Korea, everyday life).',
    skill === 'WRITING' ? 'Write exactly 2 tasks.' : `Write exactly ${n} questions in total, numbered from 1 in order across all groups. Use 2 or 3 different question types.`,
    skill === 'LISTENING' ? 'Write exactly 2 sections with 5 questions each. Section 1 is a conversation between two people (one man, one woman). Section 2 is one person talking (a talk, announcement or lecture). Every script line starts with the speaker name and a colon. The first line of each script is "Narrator: ...". Use first names or roles as speaker names (for example Woman, Man, Receptionist, Guide). Numbers, prices and times in scripts are written as words, the way people say them.' : '',
    skill !== 'WRITING' ? `Rules for questions:
- Every answer must be clearly supported by the text. "ev" must be words copied EXACTLY from the ${skill === 'READING' ? 'passage' : 'script'} (same spelling and punctuation), 3 to 15 words, that show the answer.
- NOT GIVEN answers have "ev": [].
- MULTIPLE_CHOICE: ${skill === 'READING' ? '4' : '3'} options with no letters in front; "answer" is the letter. Paragraph-matching questions use options "Paragraph A", "Paragraph B" ... and the type MULTIPLE_CHOICE.
- SENTENCE_COMPLETION answers are in CAPITALS and are words from the text that fit the gap. Give other correct forms separated by | (for example "4|FOUR").
- TRUE_FALSE_NOT_GIVEN answers are TRUE, FALSE or NOT GIVEN. Include at least one of each when you use this type.
- Mix the correct letters (not always B).` : '',
    'Everything must be original. Do not copy published tests.',
    avoid.titles.length ? `These papers already exist. Choose a DIFFERENT topic and do not reuse their ideas:\n${avoid.titles.slice(-80).join('\n')}` : '',
    extraAvoid && extraAvoid.length ? `Your last try repeated these existing questions. Write different ones:\n${extraAvoid.join('\n')}` : '',
    `Reply with ONLY the JSON, no other words, in exactly this shape:\n${SHAPES[skill]}`,
  ];
  return lines.filter(Boolean).join('\n\n');
}

let anthropic = null;
async function askClaude(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set on the server.');
  if (!anthropic) { const Anthropic = require('@anthropic-ai/sdk'); anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
  let lastErr;
  for (const model of GENERATOR_MODELS) {
    try {
      const r = await anthropic.messages.create({
        model, max_tokens: 12000,
        system: 'You are an experienced English exam writer. You write clear, accurate, original exam papers and reply only with valid JSON.',
        messages: [{ role: 'user', content: prompt }],
      });
      const text = r.content.map(c => c.text || '').join('');
      const a = text.indexOf('{'); const b = text.lastIndexOf('}');
      if (a < 0 || b < a) throw new Error('The AI did not return a paper. Please try again.');
      return JSON.parse(text.slice(a, b + 1));
    } catch (e) {
      lastErr = e;
      if (e && (e.status === 404 || /model/i.test(e.message || '') && e.status === 400)) continue; // try the next model
      throw e;
    }
  }
  throw lastErr;
}

// ─── checking ───────────────────────────────────────────────────────────────
const TYPES = ['MULTIPLE_CHOICE', 'TRUE_FALSE_NOT_GIVEN', 'SENTENCE_COMPLETION'];
function toPaper(skill, difficulty, j) {
  const problems = [];
  const code = 'GE-G' + Date.now().toString(36).toUpperCase();
  const label = { READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing' }[skill];
  const base = {
    code, testType: skill, difficulty, topic: String(j.topic || '').slice(0, 60) || null,
    title: `${label} · ${String(j.title || 'New paper').slice(0, 80)}`,
    timeLimitMin: Math.min(90, Math.max(10, parseInt(j.minutes, 10) || 20)),
    instructions: String(j.instructions || '').slice(0, 400) || 'Read the instructions for each part carefully.',
  };
  const fixQ = (q, source, maxOpt) => {
    const type = q.type;
    let answer = String(q.answer || '').trim().toUpperCase();
    const ev = (Array.isArray(q.ev) ? q.ev : []).map(x => String(x).trim()).filter(Boolean);
    const out = { type, content: String(q.q || q.content || '').trim(), answer, explanation: String(q.why || '').trim() || null, ev: [] };
    if (!out.content) problems.push('A question has no text.');
    if (type === 'MULTIPLE_CHOICE') {
      const opts = (Array.isArray(q.options) ? q.options : []).map(o => String(o).replace(/^[A-H][.)]\s+/, '').trim()).filter(Boolean);
      if (opts.length < 3 || opts.length > maxOpt + 3) problems.push(`Question "${out.content.slice(0, 40)}" has ${opts.length} options.`);
      answer = answer.replace(/^PARAGRAPH\s+/, '').charAt(0);
      if ('ABCDEFGH'.indexOf(answer) < 0 || 'ABCDEFGH'.indexOf(answer) >= opts.length) problems.push(`Question "${out.content.slice(0, 40)}" has a wrong answer letter.`);
      out.options = opts; out.answer = answer;
    } else if (type === 'TRUE_FALSE_NOT_GIVEN') {
      if (!['TRUE', 'FALSE', 'NOT GIVEN'].includes(answer)) problems.push(`Statement "${out.content.slice(0, 40)}" has answer ${answer}.`);
    } else if (type === 'SENTENCE_COMPLETION') {
      if (!answer) problems.push(`Gap "${out.content.slice(0, 40)}" has no answer.`);
    } else problems.push(`Unknown question type ${type}.`);
    const src = norm(source);
    for (const e of ev) if (src.includes(norm(e).replace(/^["']|["']$/g, ''))) out.ev.push(e);
    if (answer !== 'NOT GIVEN' && !out.ev.length) problems.push(`Question "${out.content.slice(0, 40)}" has no evidence in the text.`);
    return out;
  };
  const fixGroups = (groups, source, maxOpt) => (Array.isArray(groups) ? groups : []).map(g => {
    const type = TYPES.includes(g.type) ? g.type : null;
    if (!type) problems.push(`Unknown group type ${g.type}.`);
    return { type: type || 'MULTIPLE_CHOICE', instruction: String(g.instruction || '').trim(), wordLimit: g.wordLimit || null, questions: (g.questions || []).map(q => fixQ({ ...q, type }, source, maxOpt)) };
  });

  if (skill === 'READING') {
    const text = String(j.passage || '').trim();
    if (text.split(/\s+/).length < 120) problems.push('The reading text is too short.');
    const groups = fixGroups(j.groups, text, 4);
    const n = groups.reduce((a, g) => a + g.questions.length, 0);
    if (n !== COUNTS.READING(difficulty)) problems.push(`Expected ${COUNTS.READING(difficulty)} questions, got ${n}.`);
    return { problems, paper: { ...base, passages: [{ title: String(j.passageTitle || j.title || 'Reading text'), text, groups }] } };
  }
  if (skill === 'LISTENING') {
    const sections = (Array.isArray(j.sections) ? j.sections : []).map((s, i) => {
      const script = String(s.script || '').trim();
      if (script.split(/\s+/).length < 60) problems.push(`Section ${i + 1} script is too short.`);
      return { number: i + 1, description: String(s.description || `Section ${i + 1}`), script, groups: fixGroups(s.groups, script, 3) };
    });
    if (sections.length !== 2) problems.push(`Expected 2 sections, got ${sections.length}.`);
    const n = sections.reduce((a, s) => a + s.groups.reduce((b, g) => b + g.questions.length, 0), 0);
    if (n !== 10) problems.push(`Expected 10 questions, got ${n}.`);
    const scripts = {}; sections.forEach(s => { scripts[s.number] = s.script; });
    return { problems, paper: { ...base, audioScript: JSON.stringify(scripts), sections: sections.map(({ script, ...s }) => s) } };
  }
  const tasks = (Array.isArray(j.tasks) ? j.tasks : []).slice(0, 2).map((t, i) => ({
    taskNumber: i + 1, prompt: String(t.prompt || '').trim(),
    minWords: Math.max(30, parseInt(t.minWords, 10) || 80), timeMinutes: Math.max(5, parseInt(t.timeMinutes, 10) || 20),
  }));
  if (tasks.length !== 2 || tasks.some(t => t.prompt.length < 40)) problems.push('Writing papers need 2 full tasks.');
  return { problems, paper: { ...base, tasks } };
}

function repeats(paper, avoid) {
  const qs = [...(paper.passages || []), ...(paper.sections || [])].flatMap(x => x.groups.flatMap(g => g.questions.map(q => q.content)));
  const oldQ = avoid.questions.map(q => [q, words(q)]);
  const rep = [];
  for (const q of qs) {
    const w = words(q);
    if (w.size < 3) continue;
    const hit = oldQ.find(([, ow]) => jaccard(w, ow) >= 0.75);
    if (hit) rep.push(hit[0]);
  }
  const bodies = [...(paper.passages || []).map(p => p.text), ...(paper.tasks || []).map(t => t.prompt), paper.audioScript || ''].filter(Boolean);
  const textRepeat = bodies.some(b => { const w = words(b); return avoid.texts.some(t => jaccard(w, words(t)) >= 0.45); });
  return { rep, textRepeat };
}

// ─── Gemini text-to-speech ──────────────────────────────────────────────────
function wav(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
const silence = sec => Buffer.alloc(Math.round(24000 * sec) * 2);
const voiceFor = (name, used) => {
  if (/narrator/i.test(name)) return NARRATOR_VOICE;
  if (/\b(man|male|mr|father|boy|he)\b/i.test(name) && !/woman/i.test(name)) return MALE_VOICE;
  if (/\b(woman|female|mrs|ms|miss|mother|girl|lady)\b/i.test(name)) return FEMALE_VOICE;
  return used.size % 2 === 0 ? MALE_VOICE : FEMALE_VOICE;
};
async function geminiTts(text, speakers) {
  const key = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const speechConfig = speakers.length > 1
    ? { multiSpeakerVoiceConfig: { speakerVoiceConfigs: speakers.map(s => ({ speaker: s.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: s.voice } } })) } }
    : { voiceConfig: { prebuiltVoiceConfig: { voiceName: speakers[0].voice } } };
  let lastErr;
  for (const model of TTS_MODELS) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig } }),
    });
    if (r.status === 404) { lastErr = new Error(`TTS model ${model} not found`); continue; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Google TTS error ${r.status}: ${(j.error && j.error.message) || 'unknown'}`);
    const part = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
    if (!part) throw new Error('Google TTS returned no audio.');
    return Buffer.from(part.inlineData.data, 'base64');
  }
  throw lastErr;
}
// Narrator lines on their own voice; the rest in one call with up to 2 voices (Gemini allows 2).
async function recordScript(script) {
  const lines = String(script).split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/^([A-Za-z][A-Za-z .']{0,24}):\s*(.+)$/); return m ? { who: m[1].trim(), text: m[2] } : { who: 'Narrator', text: l };
  });
  const chunks = [];
  for (const l of lines) {
    const narr = /narrator/i.test(l.who);
    const last = chunks[chunks.length - 1];
    if (last && last.narr === narr) last.lines.push(l); else chunks.push({ narr, lines: [l] });
  }
  const parts = [silence(1.5)];
  for (const c of chunks) {
    const used = new Map();
    c.lines.forEach(l => { if (!used.has(l.who)) used.set(l.who, voiceFor(l.who, used)); });
    let names = [...used.keys()];
    if (names.length > 2) { // fold extra speakers onto the two voices
      const keep = names.slice(0, 2);
      c.lines.forEach(l => { if (!keep.includes(l.who)) l.who = keep[(names.indexOf(l.who)) % 2]; });
      names = keep;
    }
    if (names.length === 2 && used.get(names[0]) === used.get(names[1])) used.set(names[1], used.get(names[0]) === MALE_VOICE ? FEMALE_VOICE : MALE_VOICE);
    const speakers = names.map(n => ({ name: n.replace(/[^A-Za-z]/g, '') || 'Speaker', voice: used.get(n) }));
    const body = c.lines.map(l => `${l.who.replace(/[^A-Za-z]/g, '') || 'Speaker'}: ${l.text}`).join('\n');
    const say = speakers.length > 1
      ? `Read this conversation aloud in clear, natural British English at a calm exam speed:\n${body}`
      : `Read this aloud in clear, natural British English at a calm exam speed: ${c.lines.map(l => l.text).join(' ')}`;
    parts.push(await geminiTts(say, speakers), silence(c.narr ? 1 : 0.8));
  }
  return wav(Buffer.concat(parts));
}
async function storeAudio(buf, name) {
  const { cloudinary, isLocal } = require('../config/cloudinary');
  if (!isLocal && cloudinary) {
    return new Promise((resolve, reject) => {
      const s = cloudinary.uploader.upload_stream({ resource_type: 'video', folder: 'epic-ielts/audio', public_id: name, format: 'mp3' }, (e, r) => (e ? reject(e) : resolve(r.secure_url)));
      s.end(buf);
    });
  }
  const fs = require('fs'); const path = require('path');
  const dir = path.join(__dirname, '../../uploads/audio');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${name}.wav`), buf);
  return `/uploads/audio/${name}.wav`;
}
const ttsReady = () => !!(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY);

async function recordPaperAudio(paperId, job) {
  const paper = await prisma.paper.findUnique({ where: { id: paperId }, include: { sections: { orderBy: { number: 'asc' } } } });
  let scripts = {}; try { scripts = JSON.parse(paper.audioScript || '{}'); } catch { /* none */ }
  let done = 0;
  for (const s of paper.sections) {
    const script = scripts[s.number] || scripts[String(s.number)];
    if (!script) continue;
    if (job) job.step = `Recording section ${s.number} audio`;
    const buf = await recordScript(script);
    const url = await storeAudio(buf, `${paper.paperCode.toLowerCase()}-section${s.number}-${Date.now().toString(36)}`);
    await prisma.section.update({ where: { id: s.id }, data: { audioUrl: url } });
    done++;
  }
  return done;
}

// ─── main job ───────────────────────────────────────────────────────────────
async function runJob(job, { skill, difficulty, topic }) {
  try {
    job.step = 'Checking existing papers';
    const avoid = await existingContent();
    let result; let extraAvoid = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      job.step = attempt === 1 ? 'Writing the paper (about a minute)' : `Writing the paper again (try ${attempt})`;
      const j = await askClaude(buildPrompt({ skill, difficulty, topic, avoid, extraAvoid }));
      const r = toPaper(skill, difficulty, j);
      if (r.problems.length) { result = r; extraAvoid = []; console.warn('[builder] problems:', r.problems.join(' / ')); continue; }
      const rep = repeats(r.paper, avoid);
      if (rep.rep.length || rep.textRepeat) { result = { ...r, problems: [`It repeated ${rep.rep.length} old questions${rep.textRepeat ? ' and an old text' : ''}.`] }; extraAvoid = rep.rep.slice(0, 15); continue; }
      result = r; break;
    }
    if (result.problems.length) throw new Error(`Could not make a clean paper: ${result.problems.slice(0, 3).join(' ')}`);
    job.step = 'Saving the paper';
    const p = result.paper;
    await seedPaperList(prisma, [p], 2000 + Math.floor(Date.now() / 1000) % 100000, { status: 'DRAFT', source: 'GENERATED' });
    const saved = await prisma.paper.findFirst({ where: { paperCode: p.code, testType: p.testType }, select: { id: true } });
    job.paperId = saved.id;
    if (skill === 'LISTENING') {
      if (ttsReady()) {
        try { await recordPaperAudio(saved.id, job); } catch (e) { job.warning = `Paper saved, but the audio failed: ${e.message}. Students will hear the computer voice until you press "Record audio" again.`; }
      } else job.warning = 'Paper saved. No Google AI key is set yet, so students will hear the computer voice.';
    }
    job.step = 'Done'; job.status = 'done';
  } catch (e) {
    console.error('[builder] failed:', e);
    job.status = 'failed'; job.error = e.message || 'Something went wrong';
  }
}

function startJob(by, opts) {
  const job = newJob(by);
  runJob(job, opts);
  return job;
}
function startAudioJob(by, paperId) {
  const job = newJob(by); job.paperId = paperId;
  (async () => {
    try { if (!ttsReady()) throw new Error('No Google AI key is set on the server (GOOGLE_AI_API_KEY).'); await recordPaperAudio(paperId, job); job.status = 'done'; job.step = 'Done'; } catch (e) { job.status = 'failed'; job.error = e.message; }
  })();
  return job;
}

module.exports = { startJob, startAudioJob, getJob: id => jobs.get(id), ttsReady, LEVELS, _test: { toPaper, repeats, buildPrompt, recordScript, wav } };
