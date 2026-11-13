import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { T } from '../theme';

// Extra parts of Messages: highlighted text, the highlight toolbar, the student's answer box,
// the teacher's answers panel (with an AI suggestion), the student's task list and the pinned bar.

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const errText = e => e?.response?.data?.error || 'Something went wrong. Please try again.';
const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;
export const HL = { yellow: '#fde68a', green: '#bbf7d0', pink: '#fbcfe8', blue: '#bfdbfe' };

function Linkify({ text, onLink }) {
  const parts = String(text).split(URL_RE);
  return parts.map((p, i) => (i % 2 === 1
    ? <a key={i} href={p} target="_blank" rel="noreferrer" onClick={() => onLink && onLink()} style={{ color: 'inherit', textDecoration: 'underline', wordBreak: 'break-all', fontWeight: 600 }}>{p}</a>
    : <Fragment key={i}>{p}</Fragment>));
}

// The message text with the teacher's highlights. The text inside keeps every character, so
// selection offsets match the original text.
export function HighlightedText({ id, text, highlights, onLink }) {
  const list = (highlights || []).filter(h => h.e > h.s).sort((a, b) => a.s - b.s);
  const parts = []; let at = 0;
  for (const h of list) {
    if (h.s > at) parts.push({ t: text.slice(at, h.s) });
    parts.push({ t: text.slice(Math.max(h.s, at), h.e), c: h.c });
    at = Math.max(at, h.e);
  }
  if (at < text.length) parts.push({ t: text.slice(at) });
  return (
    <div data-hl-id={id} className="mc-text">
      {parts.map((p, i) => (p.c
        ? <mark key={i} style={{ background: HL[p.c] || HL.yellow, color: '#050505', borderRadius: 3, padding: '0 1px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}><Linkify text={p.t} onLink={onLink} /></mark>
        : <Linkify key={i} text={p.t} onLink={onLink} />))}
    </div>
  );
}

// Where the selection starts and ends inside one message text (character offsets)
export function selectionInMessage() {
  const sel = window.getSelection && window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const box = n => (n && (n.nodeType === 1 ? n : n.parentElement))?.closest?.('[data-hl-id]');
  const el = box(range.startContainer);
  if (!el || el !== box(range.endContainer) || !/^\d+$/.test(el.dataset.hlId)) return null;
  const offset = (node, off) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n = 0; let cur;
    while ((cur = w.nextNode())) { if (cur === node) return n + off; n += cur.textContent.length; }
    // the boundary is an element: count the text before that child
    if (node.nodeType === 1) {
      const w2 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let m = 0; let c2;
      const stop = node.childNodes[off] || null;
      while ((c2 = w2.nextNode())) { if (stop && (stop === c2 || stop.contains(c2))) return m; m += c2.textContent.length; }
      return m;
    }
    return n;
  };
  const s = offset(range.startContainer, range.startOffset); const e = offset(range.endContainer, range.endOffset);
  if (e <= s) return null;
  const r = range.getBoundingClientRect();
  return { id: parseInt(el.dataset.hlId, 10), s, e, rect: { top: r.top, left: r.left + r.width / 2, bottom: r.bottom } };
}

// Remove [s, e) from a list of highlights (keeps the parts outside)
export function cutRange(list, s, e) {
  const out = [];
  for (const h of list || []) {
    if (h.e <= s || h.s >= e) { out.push(h); continue; }
    if (h.s < s) out.push({ ...h, e: s });
    if (h.e > e) out.push({ ...h, s: e });
  }
  return out;
}

export function HighlightToolbar({ at, onPick, onClear, onClose }) {
  if (!at) return null;
  const top = Math.max(8, at.rect.top - 52);
  const left = Math.min(window.innerWidth - 230, Math.max(8, at.rect.left - 110));
  return (
    <div role="toolbar" aria-label="Highlight" onMouseDown={e => e.preventDefault()}
      style={{ position: 'fixed', top, left, zIndex: 70, background: '#1c1e21', borderRadius: 12, padding: '6px 8px', display: 'flex', gap: 6, alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,.25)' }}>
      {Object.entries(HL).map(([k, c]) => (
        <button key={k} type="button" onClick={() => onPick(k)} aria-label={`Highlight ${k}`} title={`Highlight (${k})`}
          style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid #fff', background: c, cursor: 'pointer' }} />
      ))}
      <button type="button" onClick={onClear} style={{ border: 0, background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '0 6px', fontFamily: 'inherit' }}>Remove</button>
      <button type="button" onClick={onClose} aria-label="Close" style={{ border: 0, background: 'transparent', color: '#bbb', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
    </div>
  );
}

const STATE = {
  TODO: ['To do', '#fff4e5', '#b45309'],
  SENT: ['Sent · waiting for teacher', '#eef2ff', '#3730a3'],
  REDO: ['Try again', '#fff1f2', '#be123c'],
  GOOD: ['Good', '#e9f7ee', '#15803d'],
  DONE: ['Done', '#e9f7ee', '#15803d'],
};
export function StateBadge({ state, score }) {
  const [label, bg, fg] = STATE[state] || STATE.TODO;
  return <span style={{ fontSize: 12, fontWeight: 800, background: bg, color: fg, borderRadius: 50, padding: '2px 9px', whiteSpace: 'nowrap' }}>{label}{score != null && (state === 'GOOD' || state === 'REDO') ? ` · ${score}/10` : ''}{state === 'GOOD' || state === 'DONE' ? ' ✓' : ''}</span>;
}

// Student: answer a teacher's question inside the chat
export function AnswerBox({ m, onSaved, flash, startOpen }) {
  const a = m.myAnswer;
  const [editing, setEditing] = useState(!!startOpen && (!a || (a.checkedAt && a.status !== 'GOOD')));
  const [text, setText] = useState(a?.text || '');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!editing) setText(a?.text || ''); }, [a?.text, editing]);
  const save = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try { const r = await axios.post(`${API_URL}/api/chat/messages/${m.id}/answer`, { text }, api()); onSaved(r.data); setEditing(false); flash('Answer sent to your teacher.'); }
    catch (e) { flash(errText(e)); }
    setBusy(false);
  };
  const box = { marginTop: 10, background: '#fff', borderRadius: 12, padding: '10px 12px', border: '1px solid #e4e6eb', color: '#050505' };
  if (editing || !a) {
    if (!editing) {
      return <button type="button" onClick={() => setEditing(true)} style={{ display: 'block', marginTop: 10, height: 36, padding: '0 16px', border: 0, borderRadius: 50, background: T.primary, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Write your answer</button>;
    }
    return (
      <div style={box}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#65676b', marginBottom: 6 }}>Your answer (only your teacher sees it)</div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={Math.min(14, Math.max(6, text.split('\n').length + 1))} autoFocus={!startOpen}
          placeholder="Write your answer here…" style={{ width: '100%', border: '1px solid #ccd0d5', borderRadius: 10, padding: '9px 11px', font: 'inherit', fontSize: 16, lineHeight: 1.55, resize: 'vertical', boxSizing: 'border-box', minHeight: 140 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button type="button" onClick={save} disabled={busy || !text.trim()} style={{ height: 36, padding: '0 16px', border: 0, borderRadius: 50, background: T.primary, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: busy || !text.trim() ? 0.6 : 1 }}>{busy ? 'Sending…' : a ? 'Send again' : 'Send answer'}</button>
          <button type="button" onClick={() => { setEditing(false); setText(a?.text || ''); }} style={{ height: 36, padding: '0 14px', border: '1px solid #ccd0d5', borderRadius: 50, background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#8a8d91' }}>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
        </div>
      </div>
    );
  }
  const state = a.checkedAt ? (a.status === 'GOOD' ? 'GOOD' : 'REDO') : 'SENT';
  return (
    <div style={{ ...box, borderColor: state === 'GOOD' ? '#86d39b' : state === 'REDO' ? '#f5a3b3' : '#e4e6eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#65676b' }}>Your answer</span>
        <StateBadge state={state} score={a.score} />
      </div>
      <div style={{ whiteSpace: 'pre-wrap', fontSize: 14.5, lineHeight: 1.5 }}>{a.text}</div>
      {a.checkedAt && a.feedback && (
        <div style={{ marginTop: 8, background: state === 'GOOD' ? '#e9f7ee' : '#fff7ed', borderRadius: 10, padding: '8px 10px', fontSize: 14, lineHeight: 1.5 }}>
          <b>{a.checkedBy || 'Teacher'}:</b> <span style={{ whiteSpace: 'pre-wrap' }}>{a.feedback}</span>
        </div>
      )}
      {state !== 'GOOD' && (
        <button type="button" onClick={() => setEditing(true)} style={{ marginTop: 8, height: 32, padding: '0 14px', border: 0, borderRadius: 50, background: state === 'REDO' ? '#be123c' : '#f0f2f5', color: state === 'REDO' ? '#fff' : '#050505', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>
          {state === 'REDO' ? 'Try again' : 'Edit my answer'}
        </button>
      )}
    </div>
  );
}

// Teacher: every student's answer to one question, with marking and an AI suggestion
function AnswerCard({ row, flash, onSaved }) {
  const a = row.answer;
  const [score, setScore] = useState(a?.score ?? '');
  const [feedback, setFeedback] = useState(a?.feedback || '');
  const [ai, setAi] = useState(null);
  const [busy, setBusy] = useState('');
  const suggest = async () => {
    setBusy('ai');
    try {
      const r = await axios.post(`${API_URL}/api/chat/answers/${a.id}/suggest`, {}, api());
      setAi(r.data); setScore(r.data.score); setFeedback(r.data.feedback);
    } catch (e) { flash(errText(e)); }
    setBusy('');
  };
  const save = async status => {
    setBusy(status);
    try { const r = await axios.patch(`${API_URL}/api/chat/answers/${a.id}`, { status, score, feedback }, api()); onSaved(row.id, r.data); flash(status === 'GOOD' ? `Marked as good for ${row.name}.` : `Sent back to ${row.name} to try again.`); }
    catch (e) { flash(errText(e)); }
    setBusy('');
  };
  const state = a.checkedAt ? (a.status === 'GOOD' ? 'GOOD' : 'REDO') : 'SENT';
  return (
    <div style={{ border: '1px solid #e4e6eb', borderRadius: 14, padding: 14, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <b style={{ fontSize: 15.5 }}>{row.name}</b>
        <StateBadge state={state} score={a.checkedAt ? a.score : null} />
      </div>
      <div style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.55, background: '#f7f8fa', borderRadius: 10, padding: '10px 12px' }}>{a.text}</div>
      <div style={{ fontSize: 12, color: '#8a8d91', marginTop: 4 }}>{a.text.trim().split(/\s+/).length} words · sent {new Date(a.updatedAt).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</div>
      {ai?.corrections?.length > 0 && (
        <div style={{ marginTop: 10, background: '#f5f3ff', borderRadius: 10, padding: '8px 10px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#6d28d9', marginBottom: 4 }}>AI SUGGESTED CORRECTIONS (check before sending)</div>
          {ai.corrections.map((c, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: 1.6 }}><s style={{ color: '#be123c' }}>{c.wrong}</s> → <b style={{ color: '#15803d' }}>{c.right}</b></div>
          ))}
          <button type="button" onClick={() => setFeedback(f => `${f}${f ? '\n\n' : ''}Corrections:\n${ai.corrections.map(c => `• ${c.wrong} → ${c.right}`).join('\n')}`)}
            style={{ marginTop: 6, border: 0, background: 'none', color: '#6d28d9', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Add these to my feedback</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12.5, color: '#65676b', display: 'grid', gap: 3 }}>Score
          <select value={score === null ? '' : score} onChange={e => setScore(e.target.value)} style={{ height: 36, borderRadius: 8, border: '1px solid #ccd0d5', padding: '0 8px', font: 'inherit', fontSize: 14 }}>
            <option value="">No score</option>
            {Array.from({ length: 11 }, (_, i) => <option key={i} value={i}>{i}/10</option>)}
          </select>
        </label>
        <label style={{ fontSize: 12.5, color: '#65676b', display: 'grid', gap: 3, flex: 1, minWidth: 220 }}>Feedback for {row.name.split(' ')[0]}
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} placeholder="What was good, and what to fix…" style={{ border: '1px solid #ccd0d5', borderRadius: 8, padding: '7px 9px', font: 'inherit', fontSize: 16, lineHeight: 1.45, resize: 'vertical' }} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={suggest} disabled={!!busy} style={{ height: 36, padding: '0 14px', borderRadius: 50, border: '1.5px solid #7c3aed', background: '#fff', color: '#6d28d9', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{busy === 'ai' ? 'Checking…' : 'AI suggestion'}</button>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => save('REDO')} disabled={!!busy} style={{ height: 36, padding: '0 14px', borderRadius: 50, border: 0, background: '#ffe4e6', color: '#be123c', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{busy === 'REDO' ? 'Saving…' : 'Try again'}</button>
        <button type="button" onClick={() => save('GOOD')} disabled={!!busy} style={{ height: 36, padding: '0 16px', borderRadius: 50, border: 0, background: '#16a34a', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{busy === 'GOOD' ? 'Saving…' : 'Good ✓'}</button>
      </div>
    </div>
  );
}

export function AnswersModal({ messageId, onClose, flash, onChanged }) {
  const [d, setD] = useState(null);
  const [tab, setTab] = useState('WAIT');
  useEffect(() => { axios.get(`${API_URL}/api/chat/messages/${messageId}/answers`, api()).then(r => setD(r.data)).catch(e => { flash(errText(e)); onClose(); }); }, [messageId]); // eslint-disable-line react-hooks/exhaustive-deps
  const onSaved = (studentId, answer) => { setD(x => ({ ...x, students: x.students.map(s => (s.id === studentId ? { ...s, answer } : s)) })); onChanged?.(); };
  const waiting = (d?.students || []).filter(s => s.answer && !s.answer.checkedAt);
  const checked = (d?.students || []).filter(s => s.answer && s.answer.checkedAt);
  const none = (d?.students || []).filter(s => !s.answer);
  const shown = tab === 'WAIT' ? waiting : tab === 'DONE' ? checked : none;
  const tabBtn = (k, label, n) => (
    <button key={k} type="button" onClick={() => setTab(k)} style={{ border: 0, borderBottom: `3px solid ${tab === k ? T.primary : 'transparent'}`, background: 'none', padding: '8px 4px', marginRight: 14, fontWeight: 700, fontSize: 14.5, color: tab === k ? T.primary : '#65676b', cursor: 'pointer', fontFamily: 'inherit' }}>{label} <span style={{ fontWeight: 600 }}>{n}</span></button>
  );
  return (
    <div role="dialog" aria-modal="true" aria-label="Answers" onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 80, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: 'min(680px, 100%)', height: '100%', background: '#f0f2f5', display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 32px rgba(0,0,0,.2)' }}>
        <div style={{ background: '#fff', padding: '14px 18px 0', borderBottom: '1px solid #e4e6eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <b style={{ fontSize: 19 }}>Answers</b>
            <button type="button" onClick={onClose} aria-label="Close" style={{ border: 0, background: '#f0f2f5', width: 36, height: 36, borderRadius: '50%', fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
          {d && <div style={{ fontSize: 14, color: '#65676b', margin: '4px 0 6px', whiteSpace: 'pre-wrap', maxHeight: 64, overflow: 'hidden' }}>{d.question || (d.imageUrl ? 'Question with a photo' : '')}</div>}
          {d && <div>{tabBtn('WAIT', 'To check', waiting.length)}{tabBtn('DONE', 'Checked', checked.length)}{tabBtn('NONE', 'Not answered', none.length)}</div>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
          {!d && <div style={{ color: '#65676b' }}>Loading…</div>}
          {d && shown.length === 0 && <div style={{ color: '#65676b', textAlign: 'center', padding: 30 }}>{tab === 'WAIT' ? 'Nothing to check right now.' : tab === 'DONE' ? 'No answers checked yet.' : 'Everyone has answered.'}</div>}
          {d && tab !== 'NONE' && shown.map(s => <AnswerCard key={`${s.id}-${s.answer.updatedAt}-${s.answer.checkedAt || ''}`} row={s} flash={flash} onSaved={onSaved} />)}
          {d && tab === 'NONE' && shown.map(s => (
            <div key={s.id} style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: '1px solid #e4e6eb', display: 'flex', justifyContent: 'space-between' }}><b>{s.name}</b><span style={{ color: '#b45309', fontWeight: 700, fontSize: 13 }}>No answer yet</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Student: tasks from all my groups with what I still need to do
export function MyTasks({ onOpen }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { axios.get(`${API_URL}/api/chat/my-tasks`, api()).then(r => setRows(Array.isArray(r.data) ? r.data : [])).catch(() => setRows([])); }, []);
  if (rows == null) return <div style={{ color: '#65676b', fontSize: 14, padding: 10 }}>Loading…</div>;
  if (!rows.length) return <div style={{ color: '#65676b', fontSize: 14, padding: 10, lineHeight: 1.5 }}>No tasks in the last 30 days.</div>;
  const todo = rows.filter(r => r.state === 'TODO' || r.state === 'REDO').length;
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ fontSize: 13.5, color: '#65676b', padding: '2px 6px 4px' }}>{todo ? `${todo} task${todo === 1 ? '' : 's'} to do` : 'All done. Well done!'}</div>
      {rows.map(r => (
        <button key={r.id} type="button" onClick={() => onOpen(r)} className="mc-item" style={{ alignItems: 'flex-start', border: '1px solid #e4e6eb', background: '#fff' }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5, lineHeight: 1.35 }}>{r.title}</span>
            <span style={{ display: 'block', fontSize: 12.5, color: '#65676b', marginTop: 2 }}>{r.group} · {r.from} · {new Date(r.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span>
            {r.feedback && <span style={{ display: 'block', fontSize: 13, color: '#334155', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{r.feedback}"</span>}
          </span>
          <StateBadge state={r.state} score={r.score} />
        </button>
      ))}
    </div>
  );
}

export function PinBar({ pin, staff, onJump, onUnpin }) {
  if (!pin) return null;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 16px', background: '#fffbea', borderBottom: '1px solid #f5e3a3', flex: 'none' }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.06em', color: '#8a5a00', flex: 'none' }}>PINNED</span>
      <button type="button" onClick={onJump} style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 0, background: 'none', cursor: 'pointer', font: 'inherit', fontSize: 14, color: '#050505', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: 0 }}>
        <b>{pin.by}:</b> {pin.text}
      </button>
      {staff && <button type="button" onClick={onUnpin} style={{ border: 0, background: 'none', color: '#8a5a00', fontWeight: 700, fontSize: 13, cursor: 'pointer', flex: 'none', fontFamily: 'inherit' }}>Unpin</button>}
    </div>
  );
}

// Full-screen photo viewer. For a question with a photo, students see the photo and their answer box
// side by side (stacked on a phone), so they can look and write at the same time without zooming the page.
export function ImageViewer({ m, src, staff, flash, onSaved, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [natural, setNatural] = useState(null);
  const answering = !staff && m.askAnswer;
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose(); if (e.key === '+' || e.key === '=') setZoom(z => Math.min(4, z + 0.5)); if (e.key === '-') setZoom(z => Math.max(1, z - 0.5)); };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);
  const zbtn = { width: 44, height: 44, borderRadius: '50%', border: 0, background: 'rgba(255,255,255,.16)', color: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
  return (
    <div role="dialog" aria-modal="true" aria-label="Photo" className={`mc-viewer${answering ? ' answering' : ''}`}>
      <style>{`
        .mc-viewer { position: fixed; inset: 0; z-index: 3000; background: #111; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
        .mc-viewer.answering { grid-template-columns: minmax(0, 1fr) minmax(360px, 34%); }
        .mc-vpane { position: relative; min-height: 0; min-width: 0; }
        .mc-vimg { position: absolute; inset: 0; overflow: auto; display: flex; }
        .mc-vimg img { margin: auto; display: block; }
        .mc-vside { background: #f0f2f5; overflow-y: auto; padding: 18px 18px 28px; min-height: 0; }
        .mc-vbar { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); display: flex; gap: 8px; align-items: center; background: rgba(0,0,0,.6); border-radius: 50px; padding: 6px 10px; }
        @media (max-width: 819px) {
          .mc-viewer.answering { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 46%) minmax(0, 1fr); }
          .mc-vside { padding: 12px 12px 24px; }
        }
      `}</style>
      <div className="mc-vpane">
      <div className="mc-vimg">
        <img src={src} alt="Photo sent by the teacher" onLoad={e => setNatural(e.currentTarget.naturalWidth)}
          onDoubleClick={() => setZoom(z => (z > 1 ? 1 : 2))}
          style={zoom === 1 ? { maxWidth: 'calc(100% - 24px)', maxHeight: 'calc(100% - 24px)', objectFit: 'contain' } : { width: `${Math.round((natural || 800) * zoom * 0.75)}px`, maxWidth: 'none', maxHeight: 'none' }} />
      </div>
        <button type="button" onClick={onClose} aria-label="Close photo" style={{ ...zbtn, position: 'absolute', top: 14, left: 14, zIndex: 2, background: 'rgba(0,0,0,.55)', fontSize: 26 }}>×</button>
        <div className="mc-vbar">
          <button type="button" style={zbtn} aria-label="Zoom out" onClick={() => setZoom(z => Math.max(1, z - 0.5))}>−</button>
          <button type="button" style={{ ...zbtn, width: 'auto', padding: '0 14px', fontSize: 14 }} onClick={() => setZoom(1)}>{zoom === 1 ? 'Fit' : `${Math.round(zoom * 100)}%`}</button>
          <button type="button" style={zbtn} aria-label="Zoom in" onClick={() => setZoom(z => Math.min(4, z + 0.5))}>+</button>
        </div>
      </div>
      {answering && (
        <div className="mc-vside">
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', color: '#8a5a00', marginBottom: 6 }}>QUESTION · {m.senderName}</div>
          {m.text && <div style={{ fontSize: 16.5, lineHeight: 1.55, whiteSpace: 'pre-wrap', color: '#050505', background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #e4e6eb' }}><HighlightedText id={`v${m.id}`} text={m.text} highlights={m.highlights} /></div>}
          <AnswerBox m={m} flash={flash} onSaved={onSaved} startOpen />
          <div style={{ fontSize: 12.5, color: '#65676b', marginTop: 10 }}>Tip: use + and − to zoom the photo. Your answer stays here while you look.</div>
        </div>
      )}
    </div>
  );
}

// The small quote of the message being replied to (inside a bubble, or above the composer)
export function ReplyQuote({ reply, mine, onClick, onClear }) {
  if (!reply) return null;
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      style={{ display: 'flex', gap: 8, alignItems: 'center', borderLeft: `4px solid ${mine ? 'rgba(255,255,255,.7)' : T.primary}`, background: mine ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.05)', borderRadius: 8, padding: '5px 9px', marginBottom: 6, cursor: onClick ? 'pointer' : 'default', whiteSpace: 'normal' }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 12.5, fontWeight: 800 }}>{onClear ? 'Replying to ' : ''}{reply.by || 'a message'}</span>
        <span style={{ display: 'block', fontSize: 13.5, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reply.text || (reply.imageUrl ? 'A photo' : '')}</span>
      </span>
      {onClear && <button type="button" onClick={onClear} aria-label="Cancel reply" style={{ border: 0, background: 'none', fontSize: 20, cursor: 'pointer', color: '#65676b', lineHeight: 1 }}>×</button>}
    </div>
  );
}

// Every reply to one message in one place, so the teacher can check them easily
export function RepliesModal({ messageId, staff, flash, onClose, onReply }) {
  const [d, setD] = useState(null);
  useEffect(() => { axios.get(`${API_URL}/api/chat/messages/${messageId}/replies`, api()).then(r => setD(r.data)).catch(e => { flash(errText(e)); onClose(); }); }, [messageId]); // eslint-disable-line react-hooks/exhaustive-deps
  const people = d ? new Set(d.replies.filter(r => !r.staff).map(r => r.senderId)).size : 0;
  return (
    <div role="dialog" aria-modal="true" aria-label="Replies" onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 2500, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: 'min(600px, 100%)', height: '100%', background: '#f0f2f5', display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 32px rgba(0,0,0,.2)' }}>
        <div style={{ background: '#fff', padding: '14px 18px', borderBottom: '1px solid #e4e6eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <b style={{ fontSize: 19 }}>Replies{d ? ` (${d.replies.length})` : ''}</b>
            <button type="button" onClick={onClose} aria-label="Close" style={{ border: 0, background: '#f0f2f5', width: 36, height: 36, borderRadius: '50%', fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
          {d && <div style={{ marginTop: 8, background: '#f7f8fa', borderLeft: `4px solid ${T.primary}`, borderRadius: 8, padding: '8px 10px', fontSize: 14.5, whiteSpace: 'pre-wrap', maxHeight: 110, overflowY: 'auto' }}><b>{d.message.by}:</b> {d.message.text || (d.message.imageUrl ? 'A photo' : '')}</div>}
          {d && staff && <div style={{ fontSize: 13.5, color: '#65676b', marginTop: 8 }}>{people} student{people === 1 ? '' : 's'} replied{d.notReplied?.length ? ` · Not replied yet: ${d.notReplied.join(', ')}` : ' · everyone replied'}</div>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gap: 10, alignContent: 'start' }}>
          {!d && <div style={{ color: '#65676b' }}>Loading…</div>}
          {d && !d.replies.length && <div style={{ color: '#65676b', textAlign: 'center', padding: 30 }}>No replies yet.</div>}
          {d && d.replies.map(r => (
            <div key={r.id} style={{ background: r.staff ? '#fff6dc' : '#fff', border: '1px solid #e4e6eb', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: '#65676b', marginBottom: 4 }}>
                <b style={{ color: '#050505', fontSize: 15 }}>{r.mine ? 'You' : r.senderName}{r.staff ? ' · Teacher' : ''}</b>
                <span>{new Date(r.createdAt).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 15.5, lineHeight: 1.5 }}>{r.text}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff', padding: 12, borderTop: '1px solid #e4e6eb' }}>
          <button type="button" onClick={() => { onReply(); onClose(); }} style={{ width: '100%', height: 42, border: 0, borderRadius: 50, background: T.primary, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Write a reply</button>
        </div>
      </div>
    </div>
  );
}
