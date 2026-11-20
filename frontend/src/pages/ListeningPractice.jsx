import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import { T } from '../theme';
import { WORD_SETS, PHRASE_SETS, SENTENCE_SETS, SIMILAR, ACCENT_LESSONS } from '../content/listeningBank';

const TABS = [
  { id: 'words', label: 'Words' },
  { id: 'phrases', label: 'Phrases' },
  { id: 'sentences', label: 'Sentences' },
  { id: 'reading', label: 'From your reading papers' },
  { id: 'similar', label: 'Similar words' },
  { id: 'accents', label: 'Accents' },
  { id: 'mistakes', label: 'My mistakes' },
];
const ACCENTS = [
  { id: 'en-GB', label: 'British' },
  { id: 'en-US', label: 'American' },
  { id: 'en-AU', label: 'Australian' },
  { id: 'mix', label: 'Mix them' },
];
const SI = "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif";
const card = { background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 20 };
const MISTAKES_KEY = 'epic-listening-mistakes';
const STATS_KEY = 'epic-listening-stats';

// ---------- small storage helpers (storage can be blocked, so never trust it) ----------
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* blocked */ } };

// ---------- speech ----------
function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener?.('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', update);
  }, []);
  return voices;
}
function pickVoice(voices, lang) {
  const same = voices.filter(v => v.lang?.replace('_', '-') === lang);
  return same.find(v => /google|natural|online/i.test(v.name)) || same[0] || null;
}
function speak(voices, text, lang, rate = 0.9) {
  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  let l = lang;
  if (lang === 'mix') {
    const have = ['en-GB', 'en-US', 'en-AU', 'en-IN'].filter(x => pickVoice(voices, x));
    l = have.length ? have[Math.floor(Math.random() * have.length)] : 'en-GB';
  }
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(voices, l);
  if (v) u.voice = v;
  u.lang = l; u.rate = rate;
  synth.speak(u);
  return l;
}

// ---------- checking ----------
const norm = s => String(s).replace(/[’‘`]/g, "'").replace(/[“”]/g, '"').toLowerCase().trim();
const tokens = s => norm(s).replace(/[.,!?;:"()]/g, ' ').replace(/-/g, ' ').split(/\s+/).filter(Boolean);
function checkText(typed, answer) {
  const a = tokens(answer), b = tokens(typed);
  // longest common subsequence on words, so one missing word does not mark the rest wrong
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const marks = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { marks.push({ w: a[i], ok: true }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { marks.push({ w: a[i], ok: false, typed: null }); i++; }
    else { marks.push({ w: b[j], extra: true }); j++; }
  }
  while (i < n) marks.push({ w: a[i++], ok: false });
  while (j < m) marks.push({ w: b[j++], extra: true });
  // pair a wrong word with the extra word typed in its place, to show "you wrote X"
  for (let k = 0; k < marks.length - 1; k++) {
    if (marks[k].extra && marks[k + 1].ok === false) { marks[k + 1].typed = marks[k].w; marks.splice(k, 1); }
    else if (marks[k].ok === false && marks[k + 1].extra) { marks[k].typed = marks[k + 1].w; marks.splice(k + 1, 1); }
  }
  const right = marks.filter(x => x.ok).length;
  return { correct: right === n && marks.length === n, right, total: n, marks };
}
function letterDiff(typed, answer) {
  const a = [...answer], b = [...norm(typed)];
  return a.map((c, k) => ({ c, ok: (b[k] || '') === c.toLowerCase() }));
}

const btn = (primary) => ({
  height: 44, padding: '0 18px', borderRadius: 50, border: `1.5px solid ${primary ? T.primary : T.hairline}`,
  background: primary ? T.primary : '#fff', color: primary ? '#fff' : T.ink, fontWeight: 700, fontSize: 15,
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
});
const chip = (on) => ({
  whiteSpace: 'nowrap', height: 36, padding: '0 14px', borderRadius: 50, border: `1.5px solid ${on ? T.navy : T.hairline}`,
  background: on ? T.navy : '#fff', color: on ? '#fff' : T.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
});

function shuffle(list) { const a = list.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; }

// ---------- the dictation box used by every typing mode ----------
// item: { text, meaning?, si?, tip?, kind: 'word'|'phrase'|'sentence', source }
function Dictation({ items, voices, accent, setTitle, onMistake, onRight }) {
  const [order, setOrder] = useState(() => items.map((_, k) => k));
  const [pos, setPos] = useState(0);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ right: 0, done: 0, streak: 0 });
  const [showMeaning, setShowMeaning] = useState(false);
  const [heardIn, setHeardIn] = useState('');
  const [started, setStarted] = useState(false);
  const startTime = useRef(null);
  const input = useRef(null);
  const item = items[order[pos]];

  useEffect(() => { setOrder(items.map((_, k) => k)); setPos(0); setTyped(''); setResult(null); setScore({ right: 0, done: 0, streak: 0 }); }, [items]);

  const play = useCallback((rate) => {
    if (!item) return;
    setStarted(true);
    const l = speak(voices, item.text, accent, rate ?? (item.kind === 'word' ? 0.85 : 0.9));
    if (l) setHeardIn(l);
    input.current?.focus();
  }, [item, voices, accent]);

  // play the next one by itself once the student has started
  useEffect(() => { if (started && item) { const t = setTimeout(() => play(), 250); return () => clearTimeout(t); } return undefined; }, [pos, order]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) return <div style={card}>Nothing here yet.</div>;

  function check() {
    if (!typed.trim()) return;
    const r = checkText(typed, item.text);
    let wpm = null;
    if (item.kind !== 'word' && startTime.current) {
      const min = (Date.now() - startTime.current) / 60000;
      if (min > 0.03) wpm = Math.round(tokens(typed).length / min);
    }
    setResult({ ...r, wpm });
    setScore(s => ({ right: s.right + (r.correct ? 1 : 0), done: s.done + 1, streak: r.correct ? s.streak + 1 : 0 }));
    if (r.correct) onRight?.(item); else onMistake?.(item, typed);
  }
  function next() {
    setTyped(''); setResult(null); startTime.current = null;
    if (pos < order.length - 1) setPos(pos + 1);
    else { setOrder(shuffle(items.map((_, k) => k))); setPos(0); }
  }
  function onKey(e) {
    if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); play(); return; }
    if (e.key === 'Enter') { e.preventDefault(); if (result) next(); else check(); }
  }
  const accentName = ACCENTS.find(a => a.id === heardIn)?.label || (heardIn === 'en-IN' ? 'Indian' : '');

  return (
    <div style={{ ...card, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 14, color: T.muted, fontWeight: 700 }}>{setTitle} · {pos + 1} of {order.length}</div>
        <div style={{ display: 'flex', gap: 14, fontSize: 14, color: T.muted }}>
          <span>Right: <b style={{ color: T.success }}>{score.right}</b> / {score.done}</span>
          <span>Streak: <b style={{ color: T.navy }}>{score.streak}</b></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" style={btn(true)} onClick={() => play()}>🔊 {started ? 'Play again' : 'Play'}</button>
        <button type="button" style={btn(false)} onClick={() => play(0.6)}>🐢 Play slowly</button>
        <button type="button" style={btn(false)} onClick={() => { setOrder(shuffle(items.map((_, k) => k))); setPos(0); setTyped(''); setResult(null); }}>Shuffle</button>
        {item.meaning && <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14, color: T.muted, cursor: 'pointer' }}>
          <input type="checkbox" checked={showMeaning} onChange={e => setShowMeaning(e.target.checked)} /> Show the meaning first (easier)
        </label>}
        {accentName && accent === 'mix' && <span style={{ fontSize: 13, color: T.muted }}>Last voice: {accentName}</span>}
      </div>

      {showMeaning && item.meaning && !result && (
        <div style={{ background: T.primaryXSoft, borderRadius: 10, padding: '10px 14px', fontSize: 15 }}>
          {item.meaning}{item.si && <span style={{ fontFamily: SI, marginLeft: 8, color: T.navy }}>{item.si}</span>}
        </div>
      )}

      <input ref={input} value={typed} disabled={!!result} onKeyDown={onKey}
        onChange={e => { if (!startTime.current) startTime.current = Date.now(); setTyped(e.target.value); }}
        placeholder={started ? `Type the ${item.kind} you hear…` : 'Press Play first, then type what you hear'}
        aria-label={`Type the ${item.kind} you hear`} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        style={{ fontSize: item.kind === 'sentence' ? 19 : 24, padding: '14px 16px', borderRadius: 12, border: `2px solid ${result ? (result.correct ? T.success : T.error) : T.hairline}`, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box', background: result ? (result.correct ? T.successSoft : T.errorSoft) : '#fff' }} />

      {!result ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" style={btn(true)} onClick={check} disabled={!typed.trim()}>Check</button>
          <button type="button" style={btn(false)} onClick={() => { setResult({ ...checkText('', item.text), gaveUp: true }); setScore(s => ({ ...s, done: s.done + 1, streak: 0 })); onMistake?.(item, ''); }}>Show the answer</button>
          <span style={{ fontSize: 13, color: T.muted }}>Enter = check · Shift + Enter = play again</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: result.correct ? T.success : T.error }}>
            {result.correct ? 'Correct!' : result.gaveUp ? 'Here is the answer:' : item.kind === 'word' ? 'Not quite. The right spelling:' : `${result.right} of ${result.total} words right`}
            {result.wpm ? <span style={{ color: T.muted, fontWeight: 400, marginLeft: 10, fontSize: 14 }}>Typing speed: {result.wpm} words a minute</span> : null}
          </div>
          {item.kind === 'word' && !result.correct ? (
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '.04em' }}>
              {letterDiff(typed, item.text).map((x, k) => <span key={k} style={{ color: x.ok || result.gaveUp ? T.ink : T.error, textDecoration: x.ok || result.gaveUp ? 'none' : 'underline' }}>{x.c}</span>)}
              {!result.gaveUp && <div style={{ fontSize: 15, fontWeight: 400, color: T.muted, letterSpacing: 0 }}>You wrote: <s>{typed}</s></div>}
            </div>
          ) : item.kind !== 'word' && !result.correct ? (
            <div style={{ fontSize: 19, lineHeight: 1.9 }}>
              <div style={{ fontWeight: 700 }}>{item.text}</div>
              {!result.gaveUp && <div style={{ fontSize: 16 }}>
                {result.marks.map((x, k) => (
                  <span key={k} style={{ marginRight: 6, padding: '1px 5px', borderRadius: 6, background: x.extra ? T.warningSoft : x.ok ? 'transparent' : T.errorSoft, color: x.extra ? T.warning : x.ok ? T.success : T.error }}>
                    {x.extra ? <s>{x.w}</s> : x.ok ? x.w : <>{x.typed ? <><s>{x.typed}</s> → </> : '(missed) '}<b>{x.w}</b></>}
                  </span>
                ))}
              </div>}
            </div>
          ) : (
            <div style={{ fontSize: item.kind === 'word' ? 30 : 19, fontWeight: 800 }}>{item.text}</div>
          )}
          {(item.meaning || item.si || item.tip) && (
            <div style={{ background: '#f6f8fc', borderRadius: 10, padding: '10px 14px', fontSize: 15, lineHeight: 1.6 }}>
              {item.meaning && <div><b>Meaning:</b> {item.meaning}</div>}
              {item.si && <div style={{ fontFamily: SI, color: T.navy }}>{item.si}</div>}
              {item.tip && <div><b>{item.kind === 'sentence' ? 'Watch:' : 'Tip:'}</b> {item.tip}</div>}
              {item.source && <div style={{ color: T.muted, fontSize: 13 }}>From: {item.source}</div>}
            </div>
          )}
          <div><button type="button" style={btn(true)} onClick={next} autoFocus>Next ›</button> <span style={{ fontSize: 13, color: T.muted }}>or press Enter</span></div>
        </div>
      )}
    </div>
  );
}

function SetPicker({ sets, value, onChange, count }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
      {sets.map(s => (
        <button key={s.id} type="button" style={chip(value === s.id)} onClick={() => onChange(s.id)}>{s.title} <span style={{ opacity: .7, fontWeight: 400 }}>({count(s)})</span></button>
      ))}
    </div>
  );
}

// ---------- learn first: listen, read the meaning, say it, then test ----------
const KNOWN_KEY = 'epic-listening-known';
const Recognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

function SayIt({ text }) {
  const [state, setState] = useState({ status: 'idle', heard: '' });
  if (!Recognition) return null;
  function listen() {
    const r = new Recognition();
    r.lang = 'en-GB'; r.interimResults = false; r.maxAlternatives = 5;
    setState({ status: 'listening', heard: '' });
    r.onresult = e => {
      const alts = [...e.results[0]].map(a => a.transcript);
      const want = tokens(text).join(' ');
      const ok = alts.some(a => tokens(a).join(' ') === want);
      setState({ status: ok ? 'ok' : 'no', heard: ok ? text : alts[0] || '' });
    };
    r.onerror = e => setState({ status: 'error', heard: e.error === 'not-allowed' ? 'Please allow the microphone.' : e.error === 'no-speech' ? 'We did not hear anything. Try again.' : 'The microphone is not working here.' });
    r.onend = () => setState(st => (st.status === 'listening' ? { status: 'error', heard: 'We did not hear anything. Try again.' } : st));
    try { r.start(); } catch { setState({ status: 'error', heard: 'The microphone is not working here.' }); }
  }
  const colour = state.status === 'ok' ? T.success : state.status === 'idle' || state.status === 'listening' ? T.muted : T.error;
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" onClick={listen} disabled={state.status === 'listening'} style={{ ...chip(state.status === 'listening'), height: 32, fontSize: 13 }}>🎤 {state.status === 'listening' ? 'Listening… say it now' : 'Say it'}</button>
      {state.status !== 'idle' && state.status !== 'listening' && <span style={{ fontSize: 13, color: colour, fontWeight: 700 }}>
        {state.status === 'ok' ? '✓ Great, clear!' : state.status === 'no' ? `We heard "${state.heard}". Listen and try again.` : state.heard}
      </span>}
    </div>
  );
}

function LearnList({ items, voices, accent }) {
  const [known, setKnownRaw] = useState(() => load(KNOWN_KEY, []));
  const setKnown = fn => setKnownRaw(k => { const n = fn(k); save(KNOWN_KEY, n); return n; });
  const done = items.filter(i => known.includes(i.text)).length;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ ...card, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 15 }}>Listen to each one, read the meaning, then say it out loud. Tick it when you know it.{Recognition ? '' : ' (Use Chrome to practise saying it with the microphone.)'}</span>
        <b style={{ color: T.success }}>{done} of {items.length} learned</b>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 12 }}>
        {items.map(it => {
          const k = known.includes(it.text);
          return (
            <div key={it.text} style={{ ...card, padding: 16, display: 'grid', gap: 8, alignContent: 'start', borderColor: k ? T.success : T.hairline, background: k ? '#f7fbf6' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                <div style={{ fontSize: it.kind === 'word' ? 24 : 19, fontWeight: 800, lineHeight: 1.2 }}>{it.text}</div>
                <label style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 13, color: k ? T.success : T.muted, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={k} onChange={() => setKnown(list => k ? list.filter(x => x !== it.text) : [...list, it.text])} /> I know it
                </label>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => speak(voices, it.text, accent, 0.85)} style={{ ...chip(false), height: 32, fontSize: 13 }}>🔊 Listen</button>
                <button type="button" onClick={() => speak(voices, it.text, accent, 0.55)} style={{ ...chip(false), height: 32, fontSize: 13 }}>🐢 Slowly</button>
              </div>
              {it.meaning && <div style={{ fontSize: 15 }}>{it.meaning}</div>}
              {it.si && <div style={{ fontFamily: SI, color: T.navy, fontSize: 15 }}>{it.si}</div>}
              {it.tip && <div style={{ fontSize: 13, color: T.muted }}><b>Spelling:</b> {it.tip}</div>}
              <SayIt text={it.text} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepSwitch({ step, setStep }) {
  const opts = [['learn', '1. Learn and say it'], ['test', '2. Dictation test']];
  return (
    <div style={{ display: 'inline-flex', background: T.tint, borderRadius: 50, padding: 4, marginBottom: 12, gap: 4 }}>
      {opts.map(([id, label]) => <button key={id} type="button" onClick={() => setStep(id)} aria-pressed={step === id}
        style={{ height: 36, padding: '0 16px', borderRadius: 50, border: 0, background: step === id ? '#fff' : 'transparent', color: step === id ? T.primary : T.muted, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: step === id ? '0 1px 3px rgba(0,0,0,.12)' : 'none' }}>{label}</button>)}
    </div>
  );
}

function WordsMode(props) {
  const [setId, setSetId] = useState(WORD_SETS[0].id);
  const [step, setStep] = useState('learn');
  const set = WORD_SETS.find(s => s.id === setId);
  const items = useMemo(() => set.words.map(([text, meaning, si, tip]) => ({ text, meaning, si, tip, kind: 'word' })), [set]);
  return <>
    <SetPicker sets={WORD_SETS} value={setId} onChange={setSetId} count={s => s.words.length} />
    <p style={{ margin: '0 0 12px', color: T.muted }}>{set.note}</p>
    <StepSwitch step={step} setStep={setStep} />
    {step === 'learn' ? <LearnList items={items} voices={props.voices} accent={props.accent} /> : <Dictation items={items} setTitle={set.title} {...props} />}
  </>;
}
function PhrasesMode(props) {
  const [setId, setSetId] = useState(PHRASE_SETS[0].id);
  const [step, setStep] = useState('learn');
  const set = PHRASE_SETS.find(s => s.id === setId);
  const items = useMemo(() => set.items.map(([text, meaning, si]) => ({ text, meaning, si, kind: 'phrase' })), [set]);
  return <>
    <SetPicker sets={PHRASE_SETS} value={setId} onChange={setSetId} count={s => s.items.length} />
    <p style={{ margin: '0 0 12px', color: T.muted }}>{set.note}</p>
    <StepSwitch step={step} setStep={setStep} />
    {step === 'learn' ? <LearnList items={items} voices={props.voices} accent={props.accent} /> : <Dictation items={items} setTitle={set.title} {...props} />}
  </>;
}
function SentencesMode(props) {
  const [setId, setSetId] = useState(SENTENCE_SETS[0].id);
  const set = SENTENCE_SETS.find(s => s.id === setId);
  const items = useMemo(() => set.items.map(([text, tip]) => ({ text, tip, kind: 'sentence' })), [set]);
  return <>
    <SetPicker sets={SENTENCE_SETS} value={setId} onChange={setSetId} count={s => s.items.length} />
    <p style={{ margin: '0 0 12px', color: T.muted }}>{set.note} Capitals and full stops do not count.</p>
    <Dictation items={items} setTitle={set.title} {...props} />
  </>;
}

function ReadingMode(props) {
  const [state, setState] = useState({ loading: true, papers: [], error: '' });
  const [paperId, setPaperId] = useState(null);
  useEffect(() => {
    axios.get(`${API_URL}/api/listening/reading-sentences`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => { setState({ loading: false, papers: r.data.papers || [], error: '' }); setPaperId(r.data.papers?.[0]?.id ?? null); })
      .catch(() => setState({ loading: false, papers: [], error: 'Could not load your reading papers. Try again later.' }));
  }, []);
  const paper = state.papers.find(p => p.id === paperId);
  const items = useMemo(() => !paper ? [] : paper.passages.flatMap(ps => ps.sentences.map(text => ({ text, kind: 'sentence', source: `${paper.title}${ps.title ? ` · ${ps.title}` : ''}` }))), [paper]);
  if (state.loading) return <div style={card}>Loading your reading papers…</div>;
  if (state.error) return <div style={card}>{state.error}</div>;
  if (!state.papers.length) return <div style={card}><b>Finish a reading paper first.</b><div style={{ color: T.muted, marginTop: 6 }}>When you finish a reading paper in Practice, its sentences show up here for dictation. We only use papers you have done, so this never gives away answers.</div></div>;
  return <>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
      {state.papers.map(p => <button key={p.id} type="button" style={chip(p.id === paperId)} onClick={() => setPaperId(p.id)}>{p.title}</button>)}
    </div>
    <p style={{ margin: '0 0 12px', color: T.muted }}>Real sentences from the reading papers you have finished. Capitals and full stops do not count.</p>
    <Dictation key={paperId} items={items} setTitle={paper?.title || ''} {...props} />
  </>;
}

function SimilarMode({ voices, accent }) {
  const [order, setOrder] = useState(() => shuffle(SIMILAR.map((_, k) => k)));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, done: 0 });
  const [s, opts, ans, rule, si] = SIMILAR[order[pos]];
  const full = s.replace('___', ans);
  function pick(o) {
    if (picked) return;
    setPicked(o); setScore(x => ({ right: x.right + (o === ans ? 1 : 0), done: x.done + 1 }));
  }
  function next() { setPicked(null); if (pos < order.length - 1) setPos(pos + 1); else { setOrder(shuffle(order)); setPos(0); } }
  return (
    <div style={{ ...card, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', fontSize: 14, color: T.muted }}>
        <b>Listen, then choose the right spelling · {pos + 1} of {order.length}</b>
        <span>Right: <b style={{ color: T.success }}>{score.right}</b> / {score.done}</span>
      </div>
      <div><button type="button" style={btn(true)} onClick={() => speak(voices, full, accent, 0.9)}>🔊 Play the sentence</button></div>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}>{picked ? full : s.replace('___', '______')}</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {opts.map(o => {
          const st = picked && o === ans ? 'right' : picked === o ? 'wrong' : '';
          return <button key={o} type="button" onClick={() => pick(o)} style={{ ...btn(false), height: 54, fontSize: 20, minWidth: 120, borderWidth: 2, borderColor: st === 'right' ? T.success : st === 'wrong' ? T.error : T.hairline, color: st === 'right' ? T.success : st === 'wrong' ? T.error : T.ink, background: st === 'right' ? T.successSoft : st === 'wrong' ? T.errorSoft : '#fff' }}>{o}</button>;
        })}
      </div>
      {picked && <div style={{ background: '#f6f8fc', borderRadius: 10, padding: '10px 14px', fontSize: 15, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, color: picked === ans ? T.success : T.error }}>{picked === ans ? 'Correct!' : `The answer is "${ans}".`}</div>
        <div>{rule}</div><div style={{ fontFamily: SI, color: T.navy }}>{si}</div>
      </div>}
      {picked && <div><button type="button" style={btn(true)} onClick={next}>Next ›</button></div>}
    </div>
  );
}

function AccentsMode({ voices }) {
  const say = (t, l) => speak(voices, t, l, 0.85);
  const missing = ['en-GB', 'en-US', 'en-AU'].filter(l => !pickVoice(voices, l));
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {voices.length > 0 && missing.length > 0 && <div style={{ ...card, background: T.warningSoft, borderColor: T.warningSoft, fontSize: 14 }}>This computer does not have a voice for: {missing.map(m => ACCENTS.find(a => a.id === m).label).join(', ')}. Those buttons will use another voice. Chrome usually has all of them.</div>}
      {ACCENT_LESSONS.map(L => (
        <div key={L.id} style={{ ...card, display: 'grid', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 22, margin: '0 0 4px', color: T.navy }}>{L.title}</h2>
            <div style={{ color: T.muted, fontSize: 15 }}>{L.note} Video: {L.by}.</div>
          </div>
          <div style={{ position: 'relative', width: '100%', maxWidth: 720, aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
            <iframe src={`https://www.youtube-nocookie.com/embed/${L.video}?rel=0`} title={L.title} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 560 }}>
              <thead><tr style={{ textAlign: 'left', color: T.muted, fontSize: 13 }}>
                <th style={{ padding: 8 }}>Word</th><th style={{ padding: 8 }}>British</th><th style={{ padding: 8 }}>American</th>{L.rows[0].au && <th style={{ padding: 8 }}>Australian</th>}<th style={{ padding: 8 }}>Sinhala letters</th>
              </tr></thead>
              <tbody>{L.rows.map(r => (
                <tr key={r.word} style={{ borderTop: `1px solid ${T.hairline}`, verticalAlign: 'top' }}>
                  <td style={{ padding: 8, fontWeight: 800, fontSize: 17 }}>{r.word}{r.tip && <div style={{ fontWeight: 400, fontSize: 13, color: T.muted, maxWidth: 220 }}>{r.tip}</div>}</td>
                  {[['uk', 'en-GB'], ['us', 'en-US'], ...(r.au ? [['au', 'en-AU']] : [])].map(([k, l]) => (
                    <td key={k} style={{ padding: 8 }}>{r[k]}<div><button type="button" onClick={() => say(r.word, l)} style={{ ...chip(false), height: 30, marginTop: 4, fontSize: 13 }}>🔊 Listen</button></div></td>
                  ))}
                  <td style={{ padding: 8, fontFamily: SI }}>{r.si}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      ))}
      <div style={{ ...card, fontSize: 15, lineHeight: 1.6 }}>
        <b>Practise with different accents:</b> choose American, Australian or "Mix them" at the top of the page, then do any Words, Phrases or Sentences practice. In IELTS Listening you will hear British, American, Australian and other accents. All of them are correct.
      </div>
    </div>
  );
}

function MistakesMode({ mistakes, setMistakes, ...props }) {
  const items = useMemo(() => mistakes.map(m => ({ ...m })), [mistakes.length]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!mistakes.length) return <div style={card}><b>No mistakes saved yet.</b><div style={{ color: T.muted, marginTop: 6 }}>When you get a word, phrase or sentence wrong, it comes here so you can practise it again. Get it right here and it leaves the list.</div></div>;
  return <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
      <p style={{ margin: 0, color: T.muted }}>{mistakes.length} to practise. Get one right and it leaves the list. Saved on this computer only.</p>
      <button type="button" style={btn(false)} onClick={() => setMistakes([])}>Clear the list</button>
    </div>
    <Dictation items={items} setTitle="My mistakes" {...props} />
  </>;
}

export default function ListeningPractice() {
  const voices = useVoices();
  const [tab, setTab] = useState(() => { try { return sessionStorage.getItem('listening-tab') || 'words'; } catch { return 'words'; } });
  const [accent, setAccent] = useState(() => load('epic-listening-accent', 'en-GB'));
  const [mistakes, setMistakesRaw] = useState(() => load(MISTAKES_KEY, []));
  const [stats, setStats] = useState(() => load(STATS_KEY, { right: 0, done: 0 }));
  useEffect(() => { try { sessionStorage.setItem('listening-tab', tab); } catch { /* blocked */ } }, [tab]);
  useEffect(() => save('epic-listening-accent', accent), [accent]);
  const setMistakes = v => { setMistakesRaw(v); save(MISTAKES_KEY, v); };

  const onMistake = item => {
    setStats(s => { const n = { right: s.right, done: s.done + 1 }; save(STATS_KEY, n); return n; });
    setMistakesRaw(list => {
      if (list.some(m => m.text === item.text)) return list;
      const n = [{ text: item.text, meaning: item.meaning, si: item.si, tip: item.tip, kind: item.kind, source: item.source }, ...list].slice(0, 200);
      save(MISTAKES_KEY, n); return n;
    });
  };
  const onRight = item => {
    setStats(s => { const n = { right: s.right + 1, done: s.done + 1 }; save(STATS_KEY, n); return n; });
    if (tab === 'mistakes') setMistakesRaw(list => { const n = list.filter(m => m.text !== item.text); save(MISTAKES_KEY, n); return n; });
  };
  const noSpeech = typeof window !== 'undefined' && !('speechSynthesis' in window);
  const common = { voices, accent, onMistake, onRight };
  const totalItems = WORD_SETS.reduce((a, s) => a + s.words.length, 0) + PHRASE_SETS.reduce((a, s) => a + s.items.length, 0) + SENTENCE_SETS.reduce((a, s) => a + s.items.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <StudentNav active="listening" />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 16px 64px' }}>
        <div style={{ background: T.navy, color: '#fff', borderRadius: 16, padding: '22px 24px', display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: '#b0e5fb' }}>LISTENING PRACTICE</div>
            <h1 style={{ margin: '4px 0 6px', fontSize: 28 }}>Learn it. Say it. Hear it. Type it.</h1>
            <div style={{ fontSize: 15, color: T.navyText, lineHeight: 1.5 }}>
              {totalItems}+ words, phrases and sentences from class, plus sentences from your reading papers. Use headphones.
              {stats.done > 0 && <> You have got <b style={{ color: '#fff' }}>{stats.right}</b> of {stats.done} right so far.</>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: T.navyText, marginRight: 4 }}>Voice:</span>
            {ACCENTS.map(a => (
              <button key={a.id} type="button" onClick={() => setAccent(a.id)} aria-pressed={accent === a.id}
                style={{ height: 34, padding: '0 14px', borderRadius: 50, border: `1.5px solid ${accent === a.id ? '#fff' : 'rgba(255,255,255,.35)'}`, background: accent === a.id ? '#fff' : 'transparent', color: accent === a.id ? T.navy : '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{a.label}</button>
            ))}
          </div>
        </div>
        {noSpeech && <div style={{ ...card, marginTop: 16, background: T.errorSoft, borderColor: T.errorSoft }}>This browser cannot play the voice. Please use Google Chrome.</div>}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '18px 0', paddingBottom: 2 }}>
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{ whiteSpace: 'nowrap', height: 40, padding: '0 16px', borderRadius: 50, border: `1.5px solid ${tab === t.id ? T.primary : T.hairline}`, background: tab === t.id ? T.primary : '#fff', color: tab === t.id ? '#fff' : T.ink, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              {t.label}{t.id === 'mistakes' && mistakes.length > 0 && <span style={{ marginLeft: 6, background: tab === t.id ? '#fff' : T.error, color: tab === t.id ? T.error : '#fff', borderRadius: 50, padding: '1px 7px', fontSize: 12 }}>{mistakes.length}</span>}
            </button>
          ))}
        </div>
        {tab === 'words' && <WordsMode {...common} />}
        {tab === 'phrases' && <PhrasesMode {...common} />}
        {tab === 'sentences' && <SentencesMode {...common} />}
        {tab === 'reading' && <ReadingMode {...common} />}
        {tab === 'similar' && <SimilarMode voices={voices} accent={accent} />}
        {tab === 'accents' && <AccentsMode voices={voices} />}
        {tab === 'mistakes' && <MistakesMode mistakes={mistakes} setMistakes={setMistakes} {...common} />}
      </div>
    </div>
  );
}
