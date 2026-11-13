import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { T } from '../theme';

// Shows a pop-up (with a soft chime and a browser notification if allowed) when a teacher posts a new task.
const KEY = 'epic-task-last';
const FB_KEY = 'epic-fb-last'; // time of the last checked answer we showed
const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
    const ctx = new Ctx(); const now = ctx.currentTime;
    [[880, 0], [1320, 0.16]].forEach(([f, t]) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, now + t); g.gain.exponentialRampToValueAtTime(0.25, now + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.35);
      o.start(now + t); o.stop(now + t + 0.4);
    });
  } catch { /* sound blocked */ }
}

export default function TaskNotifier() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const baseTitle = useRef(document.title);

  const open = useCallback(t => {
    try { sessionStorage.setItem('chat-group', String(t.groupId)); } catch { /* blocked */ }
    setItems(x => x.filter(i => i.id !== t.id));
    navigate('/messages');
  }, [navigate]);

  const check = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    let last = 0; try { last = parseInt(localStorage.getItem(KEY), 10) || 0; } catch { /* blocked */ }
    let fbLast = null; try { fbLast = localStorage.getItem(FB_KEY); } catch { /* blocked */ }
    try {
      const r = await axios.get(`${API_URL}/api/chat/notifications`, { ...api(), params: { after: last, fbAfter: fbLast || undefined } });
      const { latestId, tasks, feedback, serverTime } = r.data;
      if (latestId && latestId !== last) { try { localStorage.setItem(KEY, String(latestId)); } catch { /* blocked */ } }
      // Answers the teacher has checked since last time
      const fb = Array.isArray(feedback) ? feedback : [];
      const fbMark = fb.length ? fb[fb.length - 1].checkedAt : (!fbLast ? serverTime : null);
      if (fbMark) { try { localStorage.setItem(FB_KEY, fbMark); } catch { /* blocked */ } }
      if (fb.length) {
        setItems(x => [...x, ...fb.map(f => ({ ...f, id: `fb-${f.id}-${f.checkedAt}`, fb: true })).filter(f => !x.some(i => i.id === f.id))].slice(-3));
        chime();
        if ('Notification' in window && Notification.permission === 'granted') {
          fb.slice(-1).forEach(f => {
            try {
              const n = new Notification(f.status === 'GOOD' ? 'Your answer is good' : 'Your teacher wants you to try again', { body: f.feedback ? f.feedback.slice(0, 140) : f.group, icon: '/logo.png', tag: `fb-${f.id}` });
              n.onclick = () => { window.focus(); open(f); n.close(); };
            } catch { /* not allowed */ }
          });
        }
      }
      if (!tasks?.length) return;
      setItems(x => [...x, ...tasks.filter(t => !x.some(i => i.id === t.id))].slice(-3));
      chime();
      if ('Notification' in window && Notification.permission === 'granted') {
        tasks.slice(-2).forEach(t => {
          try {
            const n = new Notification(`New task · ${t.group}`, { body: t.paper ? `${t.paper}: ${t.text}` : t.text.slice(0, 140), icon: '/logo.png', tag: `task-${t.id}` });
            n.onclick = () => { window.focus(); open(t); n.close(); };
          } catch { /* not allowed */ }
        });
      }
    } catch { /* offline or logged out */ }
  }, [open]);

  useEffect(() => {
    check();
    const id = setInterval(check, 20000);
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, [check]);

  useEffect(() => {
    if (items.length) { document.title = `(${items.length}) ${items.some(i => !i.fb) ? 'New task' : 'Answer checked'} · EPIC Campus`; }
    else document.title = baseTitle.current;
  }, [items.length]);

  if (!items.length) return null;
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000, display: 'grid', gap: 10, width: 'min(360px, calc(100vw - 32px))' }}>
      {items.map(t => (t.fb ? (
        <div key={t.id} role="alert" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,39,97,.25)', border: `2px solid ${t.status === 'GOOD' ? '#16a34a' : '#be123c'}`, overflow: 'hidden', fontFamily: T.font, animation: 'epicPop .35s ease-out' }}>
          <style>{'@keyframes epicPop{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}'}</style>
          <div style={{ background: t.status === 'GOOD' ? '#16a34a' : '#be123c', color: '#fff', padding: '7px 14px', fontSize: 13, fontWeight: 700, letterSpacing: '.04em', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t.status === 'GOOD' ? 'ANSWER CHECKED · GOOD' : 'ANSWER CHECKED · TRY AGAIN'}{t.score != null ? ` · ${t.score}/10` : ''}</span>
            <button type="button" aria-label="Close" onClick={() => setItems(x => x.filter(i => i.id !== t.id))} style={{ border: 0, background: 'none', color: '#fff', fontSize: 18, lineHeight: 1, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: '10px 14px 12px' }}>
            <div style={{ fontSize: 13, color: T.mid, marginBottom: 2 }}>{t.from} · {t.group}</div>
            {t.question && <div style={{ fontSize: 13.5, color: T.muted, maxHeight: 40, overflow: 'hidden' }}>{t.question}</div>}
            {t.feedback && <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.45, maxHeight: 84, overflow: 'hidden', marginTop: 4, whiteSpace: 'pre-wrap' }}>{t.feedback}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" onClick={() => open(t)} style={{ height: 36, padding: '0 16px', border: 0, borderRadius: 8, background: t.status === 'GOOD' ? '#16a34a' : '#be123c', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t.status === 'GOOD' ? 'See it' : 'Try again'}</button>
              <button type="button" onClick={() => setItems(x => x.filter(i => i.id !== t.id))} style={{ height: 36, padding: '0 14px', border: `1px solid ${T.hairline}`, borderRadius: 8, background: '#fff', color: T.muted, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
            </div>
          </div>
        </div>
      ) : (
        <div key={t.id} role="alert" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,39,97,.25)', border: `2px solid ${T.primary}`, overflow: 'hidden', fontFamily: T.font, animation: 'epicPop .35s ease-out' }}>
          <style>{'@keyframes epicPop{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}'}</style>
          <div style={{ background: T.primary, color: '#fff', padding: '7px 14px', fontSize: 13, fontWeight: 700, letterSpacing: '.04em', display: 'flex', justifyContent: 'space-between' }}>
            <span>NEW TASK · {t.group}</span>
            <button type="button" aria-label="Close" onClick={() => setItems(x => x.filter(i => i.id !== t.id))} style={{ border: 0, background: 'none', color: '#fff', fontSize: 18, lineHeight: 1, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: '10px 14px 12px' }}>
            <div style={{ fontSize: 13, color: T.mid, marginBottom: 2 }}>From {t.from}</div>
            {t.paper && <div style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>{t.paper}</div>}
            <div style={{ fontSize: 14.5, color: T.inkSoft, lineHeight: 1.45, maxHeight: 64, overflow: 'hidden' }}>{t.text}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" onClick={() => open(t)} style={{ height: 36, padding: '0 16px', border: 0, borderRadius: 8, background: T.primary, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Open task</button>
              <button type="button" onClick={() => setItems(x => x.filter(i => i.id !== t.id))} style={{ height: 36, padding: '0 14px', border: `1px solid ${T.hairline}`, borderRadius: 8, background: '#fff', color: T.muted, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Later</button>
            </div>
          </div>
        </div>
      )))}
    </div>
  );
}
