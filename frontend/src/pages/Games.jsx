import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StudentNav from '../components/StudentNav';
import { T } from '../theme';
import { WORD_SETS as CLASS_WORD_SETS, SENTENCE_SETS, SIMILAR } from '../content/listeningBank';
import { BIG_SETS } from '../content/listeningBankBig';

// ---------- word pools (from the Listening practice banks) ----------
const ALL = (() => {
  const seen = new Set(); const out = [];
  [...BIG_SETS, ...CLASS_WORD_SETS].forEach(st => st.words.forEach(([w, m, si]) => {
    const k = w.toLowerCase(); if (seen.has(k)) return; seen.add(k); out.push({ w, m, si, topic: st.title });
  }));
  return out;
})();
// single words only, for the spelling games
const SPELL = ALL.filter(x => /^[a-z]{4,12}$/i.test(x.w));
const SENTENCES = SENTENCE_SETS.flatMap(s => s.items.map(i => i[0])).filter(s => s.split(' ').length >= 4 && s.split(' ').length <= 12);

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const SI = "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif";

const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* blocked */ } };
function useBest(id) {
  const key = `epic-games-best-${id}`;
  const [best, setBest] = useState(() => load(key, 0));
  const report = useCallback(score => { setBest(b => { if (score > b) { save(key, score); return score; } return b; }); }, [key]);
  return [best, report];
}
// a fresh word every time: no repeats until the pool runs out
function useDeck(pool) {
  const ref = useRef([]);
  return useCallback(() => { if (!ref.current.length) ref.current = shuffle(pool); return ref.current.pop(); }, [pool]);
}

// ---------- believable misspellings ----------
const VOWELS = 'aeiou';
function misspellings(word, n = 3) {
  const w = word.toLowerCase(); const out = new Set(); let guard = 0;
  const rules = [
    s => { const i = 1 + Math.floor(Math.random() * (s.length - 2)); return s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2); }, // swap two letters
    s => { const m = s.match(/([b-df-hj-np-tv-z])\1/); if (m) return s.replace(m[0], m[1]); const i = 1 + Math.floor(Math.random() * (s.length - 1)); return VOWELS.includes(s[i]) ? null : s.slice(0, i) + s[i] + s.slice(i); }, // double / undouble
    s => { const i = 1 + Math.floor(Math.random() * (s.length - 1)); return s.slice(0, i) + s.slice(i + 1); }, // drop a letter
    s => { const idx = [...s].map((c, i) => (i > 0 && VOWELS.includes(c) ? i : -1)).filter(i => i > 0); if (!idx.length) return null; const i = pick(idx); return s.slice(0, i) + pick([...VOWELS].filter(v => v !== s[i])) + s.slice(i + 1); }, // wrong vowel
    s => (s.includes('ie') ? s.replace('ie', 'ei') : s.includes('ei') ? s.replace('ei', 'ie') : null),
    s => (s.includes('ph') ? s.replace('ph', 'f') : s.includes('ck') ? s.replace('ck', 'k') : s.includes('c') ? s.replace(/c(?=[ei])/, 's') : null),
    s => (s.endsWith('our') ? s.replace(/our$/, 'or') : s.endsWith('tion') ? s.replace(/tion$/, 'sion') : s.endsWith('ence') ? s.replace(/ence$/, 'ance') : s.endsWith('ance') ? s.replace(/ance$/, 'ence') : null),
  ];
  while (out.size < n && guard++ < 200) {
    const v = pick(rules)(w);
    if (v && v !== w && v.length > 2) out.add(v);
  }
  return [...out];
}

// ---------- shared look ----------
const CSS = `
@keyframes g-pop { 0% { transform: scale(.6); opacity: 0 } 70% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1) } }
@keyframes g-flash { 0% { transform: scale(.85); opacity: 0; filter: blur(4px) } 15% { transform: scale(1); opacity: 1; filter: blur(0) } 80% { opacity: 1 } 100% { transform: scale(1.04); opacity: 0 } }
@keyframes g-shake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-10px) } 40% { transform: translateX(10px) } 60% { transform: translateX(-6px) } 80% { transform: translateX(6px) } }
@keyframes g-good { 0% { box-shadow: 0 0 0 0 rgba(39,106,26,.55) } 100% { box-shadow: 0 0 0 18px rgba(39,106,26,0) } }
@keyframes g-up { 0% { transform: translateY(0); opacity: 1 } 100% { transform: translateY(-46px); opacity: 0 } }
@keyframes g-fall { from { transform: translateY(-50px) } to { transform: translateY(330px) } }
@keyframes g-slide { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes g-flip { 0% { transform: rotateX(90deg) } 100% { transform: rotateX(0) } }
@keyframes g-bar { from { width: 100% } to { width: 0% } }
@keyframes g-glow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
.g-card { transition: transform .15s, box-shadow .15s } .g-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,39,97,.12) }
.g-btn { transition: transform .08s, background .15s } .g-btn:active { transform: scale(.95) }
.g-shake { animation: g-shake .45s } .g-good { animation: g-good .6s }
`;
const box = { background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 22 };
const big = { fontFamily: T.font, fontSize: 18, fontWeight: 700, borderRadius: 12, border: `2px solid ${T.hairline}`, background: '#fff', color: T.ink, cursor: 'pointer', padding: '14px 18px' };
const primary = { ...big, background: T.primary, borderColor: T.primary, color: '#fff' };

function Plus({ show, text = '+1', good = true }) {
  if (!show) return null;
  return <span key={show} style={{ position: 'absolute', right: 12, top: -6, fontWeight: 800, fontSize: 20, color: good ? T.success : T.error, animation: 'g-up .8s forwards', pointerEvents: 'none' }}>{text}</span>;
}
function Bar({ score, streak, best, extra }) {
  const it = (k, v) => <div style={{ textAlign: 'center', minWidth: 64 }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: T.mid }}>{k}</div><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{v}</div></div>;
  return <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>{it('SCORE', <span key={score} style={{ display: 'inline-block', animation: 'g-pop .3s' }}>{score}</span>)}{it('STREAK', streak >= 3 ? `${streak} 🔥` : streak)}{it('BEST', best)}{extra}</div>;
}
function Lives({ n, max = 3 }) {
  return <div style={{ textAlign: 'center', minWidth: 64 }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: T.mid }}>LIVES</div><div style={{ fontSize: 20 }}>{Array.from({ length: max }, (_, i) => <span key={i} style={{ opacity: i < n ? 1 : .2, transition: 'opacity .3s' }}>❤️</span>)}</div></div>;
}
function Start({ title, how, onStart, best }) {
  return <div style={{ ...box, textAlign: 'center', padding: 36, animation: 'g-pop .35s' }}>
    <h2 style={{ margin: '0 0 8px', fontSize: 26 }}>{title}</h2>
    <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 20px' }}>{how}</p>
    {best > 0 && <p style={{ color: T.mid, margin: '0 0 16px' }}>Your best: <b style={{ color: T.ink }}>{best}</b></p>}
    <button className="g-btn" style={{ ...primary, padding: '14px 40px', animation: 'g-glow 1.6s infinite' }} onClick={onStart}>Start</button>
  </div>;
}
function Over({ score, best, onAgain, children }) {
  const record = score > 0 && score >= best;
  return <div style={{ ...box, textAlign: 'center', padding: 32, animation: 'g-pop .35s' }}>
    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: T.mid }}>GAME OVER</div>
    <div style={{ fontSize: 56, fontWeight: 800, color: T.primary, animation: 'g-pop .5s' }}>{score}</div>
    {record ? <div style={{ fontWeight: 700, color: T.success, marginBottom: 8, animation: 'g-glow 1s infinite' }}>New best score!</div> : <div style={{ color: T.muted, marginBottom: 8 }}>Best: {best}</div>}
    {children}
    <button className="g-btn" style={{ ...primary, marginTop: 14, padding: '12px 36px' }} onClick={onAgain}>Play again</button>
  </div>;
}
function Clue({ item }) {
  return <div style={{ textAlign: 'center', marginBottom: 14 }}>
    <div style={{ fontSize: 17, color: T.inkSoft }}>{item.m}</div>
    {item.si && <div style={{ fontFamily: SI, fontSize: 14, color: T.mid, marginTop: 2 }}>{item.si}</div>}
  </div>;
}

// ================= 1. Spelling flash =================
function SpellFlash() {
  const [best, report] = useBest('flash');
  const next = useDeck(SPELL);
  const [st, setSt] = useState('start'); const [score, setScore] = useState(0); const [streak, setStreak] = useState(0); const [lives, setLives] = useState(3);
  const [round, setRound] = useState(null); const [shown, setShown] = useState(-1); const [phase, setPhase] = useState('flash'); const [chosen, setChosen] = useState(null); const [pop, setPop] = useState(0);
  const speed = Math.max(550, 1200 - score * 35);
  const newRound = useCallback(() => {
    let item = next(); let wrong = misspellings(item.w, 3); let g = 0;
    while (wrong.length < 3 && g++ < 20) { item = next(); wrong = misspellings(item.w, 3); }
    const options = shuffle([item.w.toLowerCase(), ...wrong]);
    setRound({ item, options, answer: options.indexOf(item.w.toLowerCase()) }); setChosen(null); setShown(0); setPhase('flash');
  }, [next]);
  useEffect(() => {
    if (st !== 'play' || phase !== 'flash' || !round) return undefined;
    if (shown >= round.options.length) { setPhase('pick'); return undefined; }
    const t = setTimeout(() => setShown(s => s + 1), speed);
    return () => clearTimeout(t);
  }, [st, phase, shown, round, speed]);
  const start = () => { setScore(0); setStreak(0); setLives(3); setSt('play'); newRound(); };
  const choose = i => {
    if (phase !== 'pick') return;
    setChosen(i); setPhase('show');
    if (i === round.answer) { setScore(s => s + 1 + (streak >= 4 ? 1 : 0)); setStreak(s => s + 1); setPop(p => p + 1); }
    else { setStreak(0); setLives(l => l - 1); }
  };
  const go = () => { if (lives <= 0) { report(score); setSt('over'); } else newRound(); };
  if (st === 'start') return <Start title="Spelling flash" best={best} onStart={start} how="Four spellings flash on the screen, one after another. Only one is correct. Watch closely, then pick the number of the correct spelling. It gets faster as you score. 3 lives." />;
  if (st === 'over') return <Over score={score} best={best} onAgain={start} />;
  const ok = chosen === round?.answer;
  return <div>
    <Bar score={score} streak={streak} best={best} extra={<Lives n={lives} />} />
    <div style={{ ...box, position: 'relative' }}>
      <Plus show={pop} text={streak >= 5 ? '+2' : '+1'} />
      <Clue item={round.item} />
      {phase === 'flash' && <div style={{ height: 150, display: 'grid', placeItems: 'center' }}>
        {shown < round.options.length && <div key={shown} style={{ textAlign: 'center', animation: `g-flash ${speed}ms forwards` }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: T.navy, color: '#fff', fontWeight: 800, display: 'inline-grid', placeItems: 'center', marginBottom: 10 }}>{shown + 1}</div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '.04em', color: T.ink }}>{round.options[shown]}</div>
        </div>}
      </div>}
      {phase === 'pick' && <div style={{ textAlign: 'center', animation: 'g-pop .3s' }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Which number was spelled correctly?</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>{round.options.map((_, i) => <button key={i} className="g-btn" style={{ ...big, width: 72, height: 72, fontSize: 28 }} onClick={() => choose(i)}>{i + 1}</button>)}</div>
        <button className="g-btn" style={{ marginTop: 14, background: 'none', border: 0, color: T.primary, fontWeight: 700, cursor: 'pointer', fontSize: 15 }} onClick={() => { setLives(l => l); setShown(0); setPhase('flash'); }}>Show them again</button>
      </div>}
      {phase === 'show' && <div style={{ textAlign: 'center' }}>
        <div className={ok ? 'g-good' : 'g-shake'} style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 10, fontWeight: 800, color: ok ? T.success : T.error, background: ok ? T.successSoft : T.errorSoft, marginBottom: 12 }}>{ok ? 'Correct!' : 'Not that one'}</div>
        <div style={{ display: 'grid', gap: 8, maxWidth: 380, margin: '0 auto' }}>{round.options.map((o, i) => <div key={i} style={{ animation: `g-slide .3s ${i * 0.06}s both`, padding: '10px 14px', borderRadius: 10, fontSize: 20, fontWeight: 700, display: 'flex', gap: 12, alignItems: 'center', background: i === round.answer ? T.successSoft : i === chosen ? T.errorSoft : T.tint, color: i === round.answer ? T.success : i === chosen ? T.error : T.muted, textDecoration: i !== round.answer ? 'line-through' : 'none' }}><span style={{ fontSize: 14, opacity: .7 }}>{i + 1}</span>{o}</div>)}</div>
        <button className="g-btn" style={{ ...primary, marginTop: 16 }} onClick={go}>{lives <= 0 ? 'See score' : 'Next word'}</button>
      </div>}
    </div>
  </div>;
}

// ================= 2. Falling words =================
function Falling() {
  const [best, report] = useBest('falling');
  const next = useDeck(ALL);
  const [st, setSt] = useState('start'); const [score, setScore] = useState(0); const [streak, setStreak] = useState(0); const [lives, setLives] = useState(3);
  const [round, setRound] = useState(null); const [hit, setHit] = useState(null); const [n, setN] = useState(0); const [pop, setPop] = useState(0);
  const dur = Math.max(2.6, 6.5 - score * 0.15);
  const newRound = useCallback(() => {
    const item = next(); const others = shuffle(ALL.filter(x => x.w !== item.w)).slice(0, 2);
    setRound({ item, words: shuffle([item, ...others]).map((x, i) => ({ ...x, delay: i * 0.25 })) }); setHit(null); setN(k => k + 1);
  }, [next]);
  const start = () => { setScore(0); setStreak(0); setLives(3); setSt('play'); newRound(); };
  const lose = useCallback(() => { setStreak(0); setLives(l => { const v = l - 1; if (v <= 0) setTimeout(() => setSt('over'), 700); return v; }); }, []);
  useEffect(() => { if (st === 'over') report(score); }, [st, score, report]);
  const click = w => {
    if (hit) return;
    const ok = w.w === round.item.w; setHit({ w: w.w, ok });
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); setPop(p => p + 1); } else lose();
    setTimeout(() => { if (lives > 1 || ok) newRound(); }, 650);
  };
  const landed = w => { if (hit || w.w !== round.item.w) return; setHit({ w: w.w, ok: false, missed: true }); lose(); setTimeout(() => { if (lives > 1) newRound(); }, 900); };
  if (st === 'start') return <Start title="Falling words" best={best} onStart={start} how="Read the meaning. Three words fall down the screen. Click the word that matches the meaning before it hits the ground. They fall faster as you score. 3 lives." />;
  if (st === 'over') return <Over score={score} best={best} onAgain={start} />;
  return <div>
    <Bar score={score} streak={streak} best={best} extra={<Lives n={lives} />} />
    <div style={{ ...box, position: 'relative', padding: 0, overflow: 'hidden' }}>
      <Plus show={pop} />
      <div style={{ background: T.navy, color: '#fff', padding: '14px 18px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '.08em', color: '#b0e5fb', fontWeight: 700 }}>FIND THE WORD THAT MEANS</div>
        <div key={n} style={{ fontSize: 19, fontWeight: 700, animation: 'g-pop .3s' }}>{round.item.m}</div>
      </div>
      <div style={{ position: 'relative', height: 340, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', background: `linear-gradient(${T.primaryXSoft}, #fff)` }}>
        {round.words.map((w, i) => {
          const state = hit && hit.w === w.w ? (hit.ok ? 'good' : 'bad') : hit && w.w === round.item.w ? 'good' : null;
          return <div key={`${n}-${i}`} style={{ position: 'relative' }}>
            <button className="g-btn" onClick={() => click(w)} onAnimationEnd={() => landed(w)} style={{ ...big, position: 'absolute', left: '50%', marginLeft: -70, width: 140, padding: '10px 6px', fontSize: 17, animation: `g-fall ${dur}s linear ${w.delay}s both`, animationPlayState: hit ? 'paused' : 'running', background: state === 'good' ? T.successSoft : state === 'bad' ? T.errorSoft : '#fff', borderColor: state === 'good' ? T.success : state === 'bad' ? T.error : T.hairline }}>{w.w}</button>
          </div>;
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, background: T.error, opacity: .35 }} />
      </div>
      {hit?.missed && <div style={{ textAlign: 'center', padding: 10, color: T.error, fontWeight: 700, animation: 'g-shake .4s' }}>Too slow! It was "{round.item.w}"</div>}
    </div>
  </div>;
}

// ================= 3. Unscramble =================
function Unscramble() {
  const [best, report] = useBest('unscramble');
  const next = useDeck(SPELL);
  const [st, setSt] = useState('start'); const [score, setScore] = useState(0); const [streak, setStreak] = useState(0); const [time, setTime] = useState(90);
  const [item, setItem] = useState(null); const [pool, setPool] = useState([]); const [ans, setAns] = useState([]); const [fx, setFx] = useState(''); const [pop, setPop] = useState(0); const [hint, setHint] = useState(false);
  const newWord = useCallback(() => {
    const it = next(); const letters = it.w.toLowerCase().split('').map((c, i) => ({ c, id: i }));
    let mixed = shuffle(letters); let g = 0; while (mixed.map(x => x.c).join('') === it.w.toLowerCase() && g++ < 10) mixed = shuffle(letters);
    setItem(it); setPool(mixed); setAns([]); setFx(''); setHint(false);
  }, [next]);
  useEffect(() => {
    if (st !== 'play') return undefined;
    if (time <= 0) { report(score); setSt('over'); return undefined; }
    const t = setTimeout(() => setTime(s => s - 1), 1000); return () => clearTimeout(t);
  }, [st, time, score, report]);
  const start = () => { setScore(0); setStreak(0); setTime(90); setSt('play'); newWord(); };
  const take = t => { const a = [...ans, t]; setAns(a); setPool(p => p.filter(x => x.id !== t.id));
    if (a.length === item.w.length) {
      if (a.map(x => x.c).join('') === item.w.toLowerCase()) { const pts = hint ? 1 : 2 + (streak >= 3 ? 1 : 0); setScore(s => s + pts); setStreak(s => s + 1); setPop(p => p + 1); setFx('good'); setTimeout(newWord, 700); }
      else { setFx('bad'); setStreak(0); setTimeout(() => { setPool(p => shuffle([...p, ...a])); setAns([]); setFx(''); }, 600); }
    } };
  const back = t => { if (fx) return; setAns(a => a.filter(x => x.id !== t.id)); setPool(p => [...p, t]); };
  if (st === 'start') return <Start title="Unscramble" best={best} onStart={start} how="The letters of a word are mixed up. Read the meaning and click the letters in the right order. 2 points a word, 3 on a streak. A hint shows the first letter but gives 1 point. You have 90 seconds." />;
  if (st === 'over') return <Over score={score} best={best} onAgain={start} />;
  const tile = (bg, col) => ({ width: 46, height: 52, borderRadius: 10, border: `2px solid ${T.hairline}`, background: bg, color: col, fontSize: 24, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', fontFamily: T.font });
  return <div>
    <Bar score={score} streak={streak} best={best} extra={<div style={{ textAlign: 'center', minWidth: 64 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.mid }}>TIME</div><div style={{ fontSize: 22, fontWeight: 800, color: time <= 10 ? T.error : T.ink, animation: time <= 10 ? 'g-pop .5s infinite' : 'none' }}>{time}</div></div>} />
    <div style={{ ...box, position: 'relative' }}>
      <Plus show={pop} text={hint ? '+1' : streak > 3 ? '+3' : '+2'} />
      <Clue item={item} />
      <div className={fx === 'bad' ? 'g-shake' : ''} style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', minHeight: 60, marginBottom: 18 }}>
        {Array.from({ length: item.w.length }, (_, i) => { const t = ans[i]; return t
          ? <button key={t.id} className="g-btn" onClick={() => back(t)} style={{ ...tile(fx === 'good' ? T.successSoft : fx === 'bad' ? T.errorSoft : T.primarySoft, fx === 'good' ? T.success : T.ink), animation: 'g-pop .2s' }}>{t.c}</button>
          : <div key={`e${i}`} style={{ ...tile(T.tint, T.mid), cursor: 'default', borderStyle: 'dashed', display: 'grid', placeItems: 'center' }}>{hint && i === 0 ? <span style={{ opacity: .4 }}>{item.w[0]}</span> : ''}</div>; })}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {pool.map((t, i) => <button key={t.id} className="g-btn" onClick={() => take(t)} style={{ ...tile('#fff', T.ink), animation: `g-pop .25s ${i * 0.03}s both` }}>{t.c}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
        <button className="g-btn" style={{ ...big, fontSize: 14, padding: '8px 14px' }} disabled={hint} onClick={() => setHint(true)}>Hint</button>
        <button className="g-btn" style={{ ...big, fontSize: 14, padding: '8px 14px' }} onClick={() => { setStreak(0); setTime(t => Math.max(0, t - 5)); newWord(); }}>Skip (−5 sec)</button>
      </div>
    </div>
  </div>;
}

// ================= 4. Missing letters =================
function Missing() {
  const [best, report] = useBest('missing');
  const next = useDeck(SPELL);
  const ROUNDS = 12;
  const [st, setSt] = useState('start'); const [score, setScore] = useState(0); const [streak, setStreak] = useState(0); const [no, setNo] = useState(0);
  const [item, setItem] = useState(null); const [holes, setHoles] = useState([]); const [typed, setTyped] = useState([]); const [res, setRes] = useState(null); const [pop, setPop] = useState(0); const [log, setLog] = useState([]);
  const newWord = useCallback(() => {
    const it = next(); const w = it.w.toLowerCase(); const k = Math.max(2, Math.round(w.length * 0.4));
    const idx = shuffle([...Array(w.length).keys()].filter(i => i > 0)).slice(0, k).sort((a, b) => a - b);
    setItem(it); setHoles(idx); setTyped([]); setRes(null); setNo(n => n + 1);
  }, [next]);
  const start = () => { setScore(0); setStreak(0); setNo(0); setLog([]); setSt('play'); newWord(); };
  const check = useCallback(t => {
    const w = item.w.toLowerCase(); const ok = holes.every((h, i) => t[i] === w[h]);
    setRes(ok ? 'good' : 'bad');
    if (ok) { setScore(s => s + holes.length); setStreak(s => s + 1); setPop(p => p + 1); } else { setStreak(0); setLog(l => [...l, item.w]); }
  }, [item, holes]);
  const press = useCallback(c => {
    if (res || !item) return;
    setTyped(t => { if (t.length >= holes.length) return t; const v = [...t, c]; if (v.length === holes.length) setTimeout(() => check(v), 150); return v; });
  }, [res, item, holes, check]);
  const nextOne = () => { if (no >= ROUNDS) { report(score); setSt('over'); } else newWord(); };
  useEffect(() => {
    if (st !== 'play') return undefined;
    const h = e => { if (/^[a-z]$/i.test(e.key)) press(e.key.toLowerCase()); else if (e.key === 'Backspace' && !res) setTyped(t => t.slice(0, -1)); else if (e.key === 'Enter' && res) nextOne(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  });
  if (st === 'start') return <Start title="Missing letters" best={best} onStart={start} how={`Some letters are missing from a word. Read the meaning and type the missing letters (or tap them). 1 point for every letter. ${ROUNDS} words.`} />;
  if (st === 'over') return <Over score={score} best={best} onAgain={start}>{log.length > 0 && <div style={{ color: T.muted }}>Practise these: <b style={{ color: T.ink }}>{log.join(', ')}</b></div>}</Over>;
  const w = item.w.toLowerCase(); let hi = -1;
  return <div>
    <Bar score={score} streak={streak} best={best} extra={<div style={{ textAlign: 'center', minWidth: 64 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.mid }}>WORD</div><div style={{ fontSize: 22, fontWeight: 800 }}>{no}/{ROUNDS}</div></div>} />
    <div style={{ ...box, position: 'relative' }}>
      <Plus show={pop} text={`+${holes.length}`} />
      <Clue item={item} />
      <div key={no} className={res === 'bad' ? 'g-shake' : ''} style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14, perspective: 400 }}>
        {[...w].map((c, i) => { const isHole = holes.includes(i); if (isHole) hi++; const t = isHole ? typed[hi] : c;
          const col = !isHole ? T.ink : res === 'good' ? T.success : res === 'bad' ? (t === c ? T.success : T.error) : T.primary;
          return <div key={i} style={{ width: 44, height: 54, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 800, textTransform: 'uppercase', color: col, background: isHole ? (res === 'good' ? T.successSoft : T.primaryXSoft) : T.tint, border: `2px ${isHole && !t ? 'dashed' : 'solid'} ${isHole ? T.primary : 'transparent'}`, animation: isHole && t ? 'g-flip .25s' : `g-pop .3s ${i * 0.04}s both` }}>{t || ''}</div>; })}
      </div>
      {res === 'bad' && <div style={{ textAlign: 'center', marginBottom: 10, animation: 'g-pop .3s' }}>The word is <b style={{ fontSize: 20, letterSpacing: '.05em' }}>{item.w}</b></div>}
      {res ? <div style={{ textAlign: 'center' }}><button className="g-btn" style={primary} onClick={nextOne}>{no >= ROUNDS ? 'See score' : 'Next word'}</button></div>
        : <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 560, margin: '0 auto' }}>
          {'qwertyuiopasdfghjklzxcvbnm'.split('').map(c => <button key={c} className="g-btn" onClick={() => press(c)} style={{ width: 40, height: 44, borderRadius: 8, border: `1px solid ${T.hairline}`, background: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>{c}</button>)}
          <button className="g-btn" onClick={() => setTyped(t => t.slice(0, -1))} style={{ height: 44, padding: '0 12px', borderRadius: 8, border: `1px solid ${T.hairline}`, background: T.tint, fontWeight: 700, cursor: 'pointer' }}>⌫</button>
        </div>}
    </div>
  </div>;
}

// ================= 5. Confusing words sprint =================
function Sprint() {
  const [best, report] = useBest('sprint');
  const next = useDeck(SIMILAR);
  const [st, setSt] = useState('start'); const [score, setScore] = useState(0); const [streak, setStreak] = useState(0); const [time, setTime] = useState(60);
  const [q, setQ] = useState(null); const [n, setN] = useState(0); const [res, setRes] = useState(null); const [log, setLog] = useState([]); const [pop, setPop] = useState(0);
  useEffect(() => {
    if (st !== 'play') return undefined;
    if (time <= 0) { report(score); setSt('over'); return undefined; }
    const t = setTimeout(() => setTime(s => s - 1), 1000); return () => clearTimeout(t);
  }, [st, time, score, report]);
  const nextQ = useCallback(() => { setQ(next()); setRes(null); setN(k => k + 1); }, [next]);
  const start = () => { setScore(0); setStreak(0); setTime(60); setLog([]); setSt('play'); nextQ(); };
  const answer = o => {
    if (res) return; const ok = o === q[2]; setRes({ o, ok });
    if (ok) { const m = streak >= 5 ? 3 : streak >= 2 ? 2 : 1; setScore(s => s + m); setStreak(s => s + 1); setPop(p => p + 1); setTimeout(nextQ, 450); }
    else { setStreak(0); setTime(t => Math.max(0, t - 3)); setLog(l => (l.some(x => x[0] === q[0]) ? l : [...l, q])); setTimeout(nextQ, 2200); }
  };
  if (st === 'start') return <Start title="Confusing words sprint" best={best} onStart={start} how="Affect or effect? Quite or quiet? Pick the right word for each sentence as fast as you can. Get 3 in a row for double points, 6 in a row for triple. A wrong answer costs 3 seconds. 60 seconds." />;
  if (st === 'over') return <Over score={score} best={best} onAgain={start}>{log.length > 0 && <div style={{ textAlign: 'left', maxWidth: 520, margin: '10px auto 0', display: 'grid', gap: 8 }}><div style={{ fontWeight: 700 }}>Learn from your mistakes:</div>{log.map((x, i) => <div key={i} style={{ background: T.tint, borderRadius: 10, padding: '8px 12px', fontSize: 14, animation: `g-slide .3s ${i * 0.08}s both` }}><b>{x[0].replace('___', x[2])}</b><div style={{ color: T.muted }}>{x[3]}</div></div>)}</div>}</Over>;
  const mult = streak >= 5 ? 'x3' : streak >= 2 ? 'x2' : 'x1';
  return <div>
    <Bar score={score} streak={streak} best={best} extra={<><div style={{ textAlign: 'center', minWidth: 64 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.mid }}>POINTS</div><div key={mult} style={{ fontSize: 22, fontWeight: 800, color: T.primary, animation: 'g-pop .3s' }}>{mult}</div></div><div style={{ textAlign: 'center', minWidth: 64 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.mid }}>TIME</div><div style={{ fontSize: 22, fontWeight: 800, color: time <= 10 ? T.error : T.ink }}>{time}</div></div></>} />
    <div style={{ height: 6, background: T.tint, borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}><div style={{ height: '100%', width: `${(time / 60) * 100}%`, background: time <= 10 ? T.error : T.primary, transition: 'width 1s linear' }} /></div>
    <div style={{ ...box, position: 'relative', textAlign: 'center' }}>
      <Plus show={pop} text={`+${streak > 5 ? 3 : streak > 2 ? 2 : 1}`} />
      <div key={n} style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.5, margin: '10px 0 22px', animation: 'g-slide .3s' }}>
        {q[0].split('___').map((part, i, arr) => <span key={i}>{part}{i < arr.length - 1 && <span style={{ display: 'inline-block', minWidth: 90, borderBottom: `3px solid ${T.primary}`, color: res ? (res.ok ? T.success : T.error) : T.primary, fontWeight: 800 }}>{res ? q[2] : ' '}</span>}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        {q[1].map(o => { const s = res && (o === q[2] ? 'good' : res.o === o ? 'bad' : null);
          return <button key={o} className={`g-btn ${s === 'good' ? 'g-good' : s === 'bad' ? 'g-shake' : ''}`} onClick={() => answer(o)} style={{ ...big, minWidth: 150, fontSize: 22, background: s === 'good' ? T.successSoft : s === 'bad' ? T.errorSoft : '#fff', borderColor: s === 'good' ? T.success : s === 'bad' ? T.error : T.hairline }}>{o}</button>; })}
      </div>
      {res && !res.ok && <div style={{ marginTop: 16, color: T.muted, fontSize: 15, animation: 'g-pop .3s' }}>{q[3]}</div>}
    </div>
  </div>;
}

// ================= 6. Sentence builder =================
function Builder() {
  const [best, report] = useBest('builder');
  const next = useDeck(SENTENCES);
  const ROUNDS = 8;
  const [st, setSt] = useState('start'); const [score, setScore] = useState(0); const [streak, setStreak] = useState(0); const [no, setNo] = useState(0);
  const [target, setTarget] = useState([]); const [pool, setPool] = useState([]); const [ans, setAns] = useState([]); const [res, setRes] = useState(null); const [tries, setTries] = useState(0); const [pop, setPop] = useState(0);
  const newOne = useCallback(() => {
    const s = next(); const words = s.split(' ').map((w, i) => ({ w, id: i }));
    let mixed = shuffle(words); let g = 0; while (mixed.every((x, i) => x.id === i) && g++ < 10) mixed = shuffle(words);
    setTarget(words); setPool(mixed); setAns([]); setRes(null); setTries(0); setNo(n => n + 1);
  }, [next]);
  const start = () => { setScore(0); setStreak(0); setNo(0); setSt('play'); newOne(); };
  const say = text => { try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = 0.9; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch { /* no speech */ } };
  const check = () => {
    const ok = ans.map(x => x.w).join(' ') === target.map(x => x.w).join(' ');
    if (ok) { const pts = tries === 0 ? 3 : tries === 1 ? 2 : 1; setScore(s => s + pts); setStreak(s => s + 1); setPop(p => p + 1); setRes('good'); say(target.map(x => x.w).join(' ')); }
    else { setTries(t => t + 1); setStreak(0); setRes('bad'); setTimeout(() => setRes(null), 600); }
  };
  const nextOne = () => { if (no >= ROUNDS) { report(score); setSt('over'); } else newOne(); };
  if (st === 'start') return <Start title="Sentence builder" best={best} onStart={start} how={`The words of a sentence are mixed up. Click them in the right order to build the sentence, then press Check. 3 points first try, 2 on the second, 1 after that. When you get it right, you hear the sentence. ${ROUNDS} sentences.`} />;
  if (st === 'over') return <Over score={score} best={best} onAgain={start} />;
  const chip = { padding: '10px 14px', borderRadius: 10, border: `2px solid ${T.hairline}`, background: '#fff', fontSize: 18, fontWeight: 600, cursor: 'pointer', fontFamily: T.font };
  return <div>
    <Bar score={score} streak={streak} best={best} extra={<div style={{ textAlign: 'center', minWidth: 64 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.mid }}>SENTENCE</div><div style={{ fontSize: 22, fontWeight: 800 }}>{no}/{ROUNDS}</div></div>} />
    <div style={{ ...box, position: 'relative' }}>
      <Plus show={pop} text={`+${tries === 0 ? 3 : tries === 1 ? 2 : 1}`} />
      <div className={res === 'bad' ? 'g-shake' : res === 'good' ? 'g-good' : ''} style={{ minHeight: 66, border: `2px dashed ${res === 'good' ? T.success : T.hairline}`, borderRadius: 12, padding: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18, background: res === 'good' ? T.successSoft : T.primaryXSoft }}>
        {ans.length === 0 && <span style={{ color: T.mid }}>Click the words below in order...</span>}
        {ans.map((x, i) => <button key={x.id} className="g-btn" disabled={res === 'good'} onClick={() => { setAns(a => a.filter(y => y.id !== x.id)); setPool(p => [...p, x]); }} style={{ ...chip, animation: 'g-pop .2s', borderColor: res === 'good' ? T.success : T.primary, color: res === 'good' ? T.success : T.ink, background: '#fff' }}>{x.w}{i === ans.length - 1 ? '' : ''}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {pool.map((x, i) => <button key={x.id} className="g-btn" onClick={() => { setAns(a => [...a, x]); setPool(p => p.filter(y => y.id !== x.id)); }} style={{ ...chip, animation: `g-pop .25s ${i * 0.04}s both` }}>{x.w}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
        {res === 'good'
          ? <><button className="g-btn" style={{ ...big, fontSize: 15 }} onClick={() => say(target.map(x => x.w).join(' '))}>🔊 Hear it again</button><button className="g-btn" style={primary} onClick={nextOne}>{no >= ROUNDS ? 'See score' : 'Next sentence'}</button></>
          : <><button className="g-btn" style={{ ...big, fontSize: 15 }} onClick={() => { setPool(p => shuffle([...p, ...ans])); setAns([]); }}>Clear</button><button className="g-btn" style={{ ...primary, opacity: pool.length ? .5 : 1 }} disabled={pool.length > 0} onClick={check}>Check</button></>}
      </div>
      {tries >= 2 && res !== 'good' && <div style={{ textAlign: 'center', marginTop: 12, color: T.muted, animation: 'g-pop .3s' }}>Hint: it starts with <b>"{target[0].w}"</b></div>}
    </div>
  </div>;
}

// ================= hub =================
const GAMES = [
  { id: 'flash', title: 'Spelling flash', blurb: 'Four spellings flash past. Spot the correct one.', tag: 'Spelling', C: SpellFlash },
  { id: 'falling', title: 'Falling words', blurb: 'Catch the word that matches the meaning before it lands.', tag: 'Vocabulary', C: Falling },
  { id: 'unscramble', title: 'Unscramble', blurb: 'Put the mixed-up letters back in order. 90 seconds.', tag: 'Spelling', C: Unscramble },
  { id: 'missing', title: 'Missing letters', blurb: 'Fill in the gaps to finish the word.', tag: 'Spelling', C: Missing },
  { id: 'sprint', title: 'Confusing words sprint', blurb: 'Affect or effect? Quite or quiet? Beat the clock.', tag: 'Grammar', C: Sprint },
  { id: 'builder', title: 'Sentence builder', blurb: 'Click the words in the right order to build the sentence.', tag: 'Writing', C: Builder },
];

export default function Games() {
  const [open, setOpen] = useState(null);
  const bests = useMemo(() => Object.fromEntries(GAMES.map(g => [g.id, load(`epic-games-best-${g.id}`, 0)])), [open]);
  const g = GAMES.find(x => x.id === open);
  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <style>{CSS}</style>
      <StudentNav active="games" />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 64px' }}>
        {!g ? <>
          <div style={{ background: T.navy, color: '#fff', borderRadius: 16, padding: '22px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: '#b0e5fb' }}>GAMES</div>
            <h1 style={{ margin: '4px 0 6px', fontSize: 28 }}>Learn English while you play</h1>
            <div style={{ fontSize: 15, color: T.navyText, lineHeight: 1.5 }}>Six quick games for spelling, vocabulary, confusing words and sentences. {ALL.length} words to play with. Beat your best score!</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {GAMES.map((x, i) => <button key={x.id} className="g-card" onClick={() => setOpen(x.id)} style={{ ...box, textAlign: 'left', cursor: 'pointer', fontFamily: T.font, animation: `g-pop .35s ${i * 0.06}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.primary, background: T.primarySoft, borderRadius: 20, padding: '3px 10px' }}>{x.tag}</span>
                {bests[x.id] > 0 && <span style={{ fontSize: 13, color: T.mid }}>Best <b style={{ color: T.ink }}>{bests[x.id]}</b></span>}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{x.title}</div>
              <div style={{ fontSize: 15, color: T.muted, lineHeight: 1.5 }}>{x.blurb}</div>
              <div style={{ marginTop: 12, color: T.primary, fontWeight: 700 }}>Play →</div>
            </button>)}
          </div>
        </> : <>
          <button onClick={() => setOpen(null)} style={{ background: 'none', border: 0, color: T.primary, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 12, fontFamily: T.font }}>← All games</button>
          <g.C key={g.id} />
        </>}
      </div>
    </div>
  );
}
