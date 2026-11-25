// Question sets in Messages.
// Teachers paste questions in a simple text format (one per line, "question = answer / other answer"),
// tick earlier photos / audio / PDFs from the chat to go with them, and send. Students answer in the chat,
// answers are marked straight away, and the teacher sees everyone's score.
import { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { T } from '../theme';
import SplitHandle, { useSplit, SPLIT_CSS } from './SplitHandle';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const errText = e => e?.response?.data?.error || 'Something went wrong. Please try again.';
const isAudio = u => /\/chat-audio\/|\/uploads\/audio\/|\.(mp3|m4a|wav|ogg|oga|aac|webm|opus)$/i.test(u || '');

export const QUIZ_HELP = `Choices: A B C D E F G H
1. Toilets = A
2. Café = C
Choices: none
6. What time does the café open? = nine / 9 / 9 am`;

// Text → questions. "Choices: A B C" applies to the questions after it, until "Choices: none".
export function parseQuiz(text) {
  const items = [], errors = [];
  let options = null;
  String(text || '').replace(/\r/g, '').split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const c = line.match(/^choices?\s*:\s*(.*)$/i);
    if (c) {
      const v = c[1].trim();
      options = !v || /^none$/i.test(v) ? null : v.split(/\s*[,|]\s*|\s+/).filter(Boolean).slice(0, 12);
      return;
    }
    const at = line.lastIndexOf('=');
    if (at < 1) { errors.push(`Line ${i + 1}: add "= answer" at the end`); return; }
    const q = line.slice(0, at).replace(/^\s*\d+\s*[.)]\s*/, '').trim();
    const answers = line.slice(at + 1).split('/').map(a => a.trim()).filter(Boolean);
    if (!q || !answers.length) { errors.push(`Line ${i + 1}: needs a question and an answer`); return; }
    if (options && !answers.some(a => options.some(o => o.toLowerCase() === a.toLowerCase()))) errors.push(`Line ${i + 1}: the answer "${answers[0]}" is not one of the choices`);
    items.push({ q, options, answers });
  });
  return { items, errors };
}

const btn = (bg, fg = '#fff') => ({ height: 40, padding: '0 18px', border: 0, borderRadius: 50, background: bg, color: fg, fontWeight: 700, fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit' });

// ---------- Teacher: write and send a question set ----------
export function QuizComposer({ messages, imgSrc, onSend, onClose }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [attach, setAttach] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [busy, setBusy] = useState(false);
  const { items, errors } = useMemo(() => parseQuiz(text), [text]);
  const media = (messages || []).filter(m => !m.deleted && (m.imageUrl || m.fileUrl)).slice(-30).reverse();
  const toggle = id => setAttach(a => (a.includes(id) ? a.filter(x => x !== id) : a.length >= 8 ? a : [...a, id]));
  const send = async () => {
    if (!items.length || errors.length) return;
    setBusy(true);
    try { await onSend({ text: title.trim() || 'Answer these questions', quiz: { items, attach, showAnswers } }); onClose(); } catch { /* parent shows the error */ }
    setBusy(false);
  };
  const box = { width: '100%', boxSizing: 'border-box', border: '1px solid #ced0d4', borderRadius: 10, padding: '10px 12px', fontSize: 15, fontFamily: 'inherit' };
  return (
    <div role="dialog" aria-modal="true" aria-label="Send questions" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 'min(720px, 100%)', maxHeight: '92vh', overflowY: 'auto', padding: 18, display: 'grid', gap: 12, fontFamily: T.font }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ fontSize: 18, flex: 1 }}>📝 Send questions</b>
          <button type="button" onClick={onClose} aria-label="Close" style={{ ...btn('#e4e6eb', '#050505'), width: 40, padding: 0 }}>×</button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title or instructions (e.g. Lakeside Park map: answer questions 1 to 10)" style={box} />
        <div>
          <div style={{ fontSize: 13.5, color: '#65676b', marginBottom: 4 }}>
            One question per line: <b>question = answer</b>. Several right answers? Separate them with <b>/</b>. Buttons instead of typing? Put <b>Choices: A B C</b> on a line before the questions (and <b>Choices: none</b> to stop).
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder={QUIZ_HELP} rows={10} style={{ ...box, fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 14 }} />
          <div style={{ fontSize: 13.5, marginTop: 4, color: errors.length ? '#b3261e' : '#15803d', fontWeight: 600 }}>
            {errors.length ? errors.slice(0, 4).join(' · ') : items.length ? `${items.length} question${items.length === 1 ? '' : 's'} ready` : ''}
          </div>
        </div>
        <div>
          <b style={{ fontSize: 14.5 }}>Show with the questions</b> <span style={{ fontSize: 13, color: '#65676b' }}>(tick earlier photos, audio or PDFs from this chat, up to 8)</span>
          {!media.length && <div style={{ fontSize: 13.5, color: '#65676b', marginTop: 4 }}>Nothing to attach yet. Send the photo or audio in the chat first, then come back here.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginTop: 6 }}>
            {media.map(m => {
              const on = attach.includes(m.id);
              return (
                <button key={m.id} type="button" onClick={() => toggle(m.id)} aria-pressed={on}
                  style={{ position: 'relative', textAlign: 'left', border: `2px solid ${on ? T.primary : '#e4e6eb'}`, background: on ? '#eef4ff' : '#fff', borderRadius: 12, padding: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {m.imageUrl ? <img src={imgSrc(m.imageUrl)} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                    : <div style={{ height: 80, borderRadius: 8, background: isAudio(m.fileUrl) ? '#7c3aed' : '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isAudio(m.fileUrl) ? 30 : 16, fontWeight: 800 }}>{isAudio(m.fileUrl) ? '🎵' : 'PDF'}</div>}
                  <div style={{ fontSize: 12.5, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.fileName || m.text || 'Photo'}</div>
                  {on && <span style={{ position: 'absolute', top: 10, right: 10, background: T.primary, color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14.5 }}>
          <input type="checkbox" checked={showAnswers} onChange={e => setShowAnswers(e.target.checked)} /> After they send their answers, also show them the right answers (off: they only see ✓ / ✗ and their score)
        </label>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={btn('#e4e6eb', '#050505')}>Cancel</button>
          <button type="button" disabled={!items.length || !!errors.length || busy} onClick={send} style={{ ...btn(T.primary), opacity: !items.length || errors.length || busy ? 0.5 : 1 }}>{busy ? 'Sending…' : `Send ${items.length || ''} question${items.length === 1 ? '' : 's'}`}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- In the chat: the question set (students answer, teachers see answers and results) ----------
export function QuizCard({ m, staff, imgSrc, pdfSrc, flash, onDone, onResults }) {
  const quiz = m.quiz;
  const mine = m.myQuiz;
  const [ans, setAns] = useState(() => quiz.items.map(() => ''));
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [split, setSplit] = useSplit('quiz-split', 45);
  const layoutRef = useRef(null);
  const left = ans.filter(a => !String(a).trim()).length;
  const submit = async () => {
    if (left && !window.confirm(`${left} question${left === 1 ? ' is' : 's are'} still empty. Send anyway? You can only send once.`)) return;
    setBusy(true);
    try { const r = await axios.post(`${API_URL}/api/chat/messages/${m.id}/quiz`, { answers: ans }, api()); onDone(r.data); }
    catch (e) { flash(errText(e)); }
    setBusy(false);
  };
  const hasMedia = quiz.attach.some(a => a.imageUrl || a.fileUrl);
  const mediaBlock = full => (
    <>
      {quiz.attach.map(a => (
        <div key={a.id}>
          {a.imageUrl && (full
            ? <img src={imgSrc(a.imageUrl)} alt="For the questions" onClick={() => setZoom(z => !z)} title={zoom ? 'Tap to fit' : 'Tap to zoom in'} style={{ width: zoom ? '200%' : '100%', maxWidth: 'none', cursor: zoom ? 'zoom-out' : 'zoom-in', borderRadius: 10, border: '1px solid #e4e6eb', background: '#fff', display: 'block' }} />
            : <a href={imgSrc(a.imageUrl)} target="_blank" rel="noreferrer"><img src={imgSrc(a.imageUrl)} alt="For the questions" style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 12, border: '1px solid #e4e6eb', background: '#fff', display: 'block' }} /></a>)}
          {a.fileUrl && isAudio(a.fileUrl) && <div style={{ background: '#fff', borderRadius: 12, padding: '8px 10px', border: '1px solid #e4e6eb' }}><div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>🎵 {a.fileName || 'Audio'}</div><audio controls preload="metadata" src={imgSrc(a.fileUrl)} style={{ width: '100%', height: 40 }} /></div>}
          {a.fileUrl && !isAudio(a.fileUrl) && <a href={pdfSrc(a.fileUrl, a.fileName)} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: T.primary }}>📄 {a.fileName || 'Open the PDF'}</a>}
        </div>
      ))}
    </>
  );
  const questionBlock = (
    <>
      <ol style={{ margin: 0, paddingLeft: 24, display: 'grid', gap: 10 }}>
        {quiz.items.map((it, i) => {
          const done = !!mine;
          const ok = done ? mine.results[i] : null;
          const given = done ? mine.answers[i] : ans[i];
          return (
            <li key={i} style={{ fontSize: 15 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{it.q}{done && <span style={{ marginLeft: 6, color: ok ? '#15803d' : '#b3261e', fontWeight: 800 }}>{ok ? '✓' : '✗'}</span>}</div>
              {staff ? (
                <div style={{ fontSize: 14, color: '#15803d', fontWeight: 700 }}>Answer: {it.answers.join(' / ')}{it.options ? `  ·  choices ${it.options.join(' ')}` : ''}</div>
              ) : it.options ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {it.options.map(o => {
                    const sel = String(given || '').toLowerCase() === o.toLowerCase();
                    return <button key={o} type="button" disabled={done} onClick={() => setAns(a => a.map((x, j) => (j === i ? o : x)))}
                      style={{ minWidth: 40, height: 38, padding: '0 10px', borderRadius: 10, border: `2px solid ${sel ? (done ? (ok ? '#15803d' : '#b3261e') : T.primary) : '#ced0d4'}`, background: sel ? (done ? (ok ? '#e9f7ee' : '#fdecea') : '#eef4ff') : '#fff', fontWeight: 800, fontSize: 15, cursor: done ? 'default' : 'pointer', fontFamily: 'inherit' }}>{o}</button>;
                  })}
                </div>
              ) : (
                <input value={given || ''} disabled={done} onChange={e => setAns(a => a.map((x, j) => (j === i ? e.target.value : x)))} placeholder="Your answer"
                  style={{ width: '100%', maxWidth: 360, boxSizing: 'border-box', height: 38, borderRadius: 10, border: `1.5px solid ${done ? (ok ? '#15803d' : '#b3261e') : '#ced0d4'}`, padding: '0 10px', fontSize: 15, fontFamily: 'inherit', background: done ? (ok ? '#e9f7ee' : '#fdecea') : '#fff' }} />
              )}
              {done && !ok && mine.correct && <div style={{ fontSize: 13.5, color: '#15803d', fontWeight: 700, marginTop: 3 }}>Right answer: {mine.correct[i]}</div>}
            </li>
          );
        })}
      </ol>
      {!staff && !mine && <button type="button" onClick={submit} disabled={busy} style={{ ...btn(T.primary), justifySelf: 'start' }}>{busy ? 'Sending…' : 'Send my answers'}</button>}
      {!staff && mine && <div style={{ fontWeight: 800, fontSize: 16, color: '#0b3d91' }}>Your score: {mine.score} / {mine.total}</div>}
    </>
  );
  return (
    <div style={{ marginTop: 6, display: 'grid', gap: 10, minWidth: 'min(520px, 70vw)' }}>
      {staff && <div style={{ fontSize: 13, fontWeight: 700, color: '#8a5a00', background: '#fff4c2', borderRadius: 8, padding: '6px 10px' }}>Teacher view: only teachers see the green answers. Students see the questions only.</div>}
      {hasMedia && <button type="button" onClick={() => setFocus(true)} style={{ ...btn('#050505'), justifySelf: 'start' }}>⤢ Open picture and questions together</button>}
      {mediaBlock(false)}
      {questionBlock}
      {staff && <button type="button" onClick={onResults} style={{ ...btn('#050505'), justifySelf: 'start' }}>Results · {quiz.submitted || 0} answered ›</button>}
      {focus && (
        <div role="dialog" aria-modal="true" aria-label="Picture and questions" style={{ position: 'fixed', inset: 0, zIndex: 2000, background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: T.font }}>
          <style>{SPLIT_CSS}</style>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #e4e6eb', flex: 'none' }}>
            <b style={{ flex: 1, fontSize: 15.5, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.text || 'Questions'}</b>
            {mine && <b style={{ color: '#0b3d91' }}>{mine.score}/{mine.total}</b>}
            <button type="button" onClick={() => setFocus(false)} style={btn('#e4e6eb', '#050505')}>Close</button>
          </div>
          <div className="exam-layout" ref={layoutRef} style={{ '--split': `${split}%`, flex: 1, minHeight: 0, display: 'flex' }}>
            <div className="passage-section" style={{ flex: '1 1 55%', overflow: 'auto', padding: 12, background: '#f6f8fc', display: 'grid', gap: 10, alignContent: 'start' }}>
              {mediaBlock(true)}
              <div style={{ fontSize: 12.5, color: '#65676b' }}>Tap the picture to zoom in or out.</div>
            </div>
            <SplitHandle layoutRef={layoutRef} value={split} onChange={setSplit} label="Picture ↑ · Questions ↓" />
            <div className="questions-section" style={{ flex: '1 1 45%', overflowY: 'auto', padding: 14, display: 'grid', gap: 10, alignContent: 'start', borderLeft: '1px solid #e4e6eb' }}>
              {questionBlock}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Teacher: everyone's results ----------
export function QuizResults({ id, onClose }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useMemo(() => { axios.get(`${API_URL}/api/chat/messages/${id}/quiz-results`, api()).then(r => setData(r.data)).catch(e => setErr(errText(e))); }, [id]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Results" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 'min(760px, 100%)', maxHeight: '92vh', overflowY: 'auto', padding: 18, fontFamily: T.font }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <b style={{ fontSize: 18, flex: 1 }}>{data?.title || 'Results'}</b>
          <button type="button" onClick={onClose} aria-label="Close" style={{ ...btn('#e4e6eb', '#050505'), width: 40, padding: 0 }}>×</button>
        </div>
        {err && <div style={{ color: '#b3261e' }}>{err}</div>}
        {!data && !err && <div>Loading…</div>}
        {data && <>
          <div style={{ fontSize: 14, color: '#65676b', marginBottom: 8 }}>{data.submitted} of {data.students.length} students answered</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr><th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #e4e6eb' }}>Student</th><th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #e4e6eb' }}>Score</th><th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #e4e6eb' }}>Answers</th></tr></thead>
            <tbody>{data.students.map(s => (
              <tr key={s.id}>
                <td style={{ padding: 6, borderBottom: '1px solid #f0f2f5', fontWeight: 700 }}>{s.name}</td>
                <td style={{ padding: 6, borderBottom: '1px solid #f0f2f5', fontWeight: 800, color: s.done ? '#0b3d91' : '#8a8d91' }}>{s.done ? `${s.score}/${s.total}` : 'not yet'}</td>
                <td style={{ padding: 6, borderBottom: '1px solid #f0f2f5' }}>{s.done && s.answers.map((a, i) => <span key={i} style={{ display: 'inline-block', margin: '1px 4px 1px 0', padding: '1px 6px', borderRadius: 6, background: s.results[i] ? '#e9f7ee' : '#fdecea', color: s.results[i] ? '#15803d' : '#b3261e', fontWeight: 700 }}>{i + 1}. {a || '—'}</span>)}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ marginTop: 14, fontWeight: 700 }}>Each question</div>
          <ol style={{ paddingLeft: 22, fontSize: 14 }}>{data.perQuestion.map((q, i) => <li key={i} style={{ margin: '3px 0' }}>{q.q} <span style={{ color: '#15803d', fontWeight: 700 }}>({q.answer})</span> · <b>{q.right}/{data.submitted}</b> right</li>)}</ol>
        </>}
      </div>
    </div>
  );
}
