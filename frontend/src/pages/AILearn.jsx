import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import MiniMarkdown from '../utils/miniMarkdown';
import { T } from '../theme';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const SUGGEST = [
  'What should I practise? Look at my results and give me custom practice.',
  'Explain the present perfect in simple English with 5 examples.',
  'Check my sentence: "She don\'t like to going to school."',
  'Give me 10 useful words for living in a Korean dormitory.',
  'Help me write an email to a Korean professor.',
  'Ask me one scholarship interview question and give me feedback on my answer.',
];

export default function AILearn() {
  const location = useLocation();
  const [st, setSt] = useState(null);
  const [left, setLeft] = useState(0);
  const [msgs, setMsgs] = useState(() => { try { return JSON.parse(sessionStorage.getItem('ai-learn-chat') || '[]'); } catch { return []; } });
  const [q, setQ] = useState(location.state?.ask || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const endRef = useRef(null);
  const [view, setView] = useState('chat');
  const [saved, setSaved] = useState([]);
  const [savedIds, setSavedIds] = useState({}); // message index -> saved row id
  const loadSaved = useCallback(() => { axios.get(`${API_URL}/api/ai-learn/saved`, api()).then(r => setSaved(r.data)).catch(() => {}); }, []);
  useEffect(() => { loadSaved(); }, [loadSaved]);
  const saveAnswer = async i => {
    const q = [...msgs.slice(0, i)].reverse().find(m => m.role === 'user')?.content || '';
    try { const r = await axios.post(`${API_URL}/api/ai-learn/saved`, { question: q, answer: msgs[i].content }, api()); setSavedIds(x => ({ ...x, [i]: r.data.id })); setSaved(x => [r.data, ...x]); }
    catch (e) { setErr(e.response?.data?.error || 'Could not save. Try again.'); }
  };
  const removeSaved = async id => {
    try { await axios.delete(`${API_URL}/api/ai-learn/saved/${id}`, api()); setSaved(x => x.filter(r => r.id !== id)); setSavedIds(x => Object.fromEntries(Object.entries(x).filter(([, v]) => v !== id))); } catch { /* ignore */ }
  };

  const load = useCallback(() => {
    axios.get(`${API_URL}/api/ai-learn/status`, api()).then(r => { setSt(r.data); setLeft(r.data.secondsLeft || 0); }).catch(() => setSt({ open: false }));
  }, []);
  useEffect(() => { load(); const id = setInterval(load, 20000); return () => clearInterval(id); }, [load]);
  useEffect(() => {
    if (!left) return undefined;
    const id = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [left > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { try { sessionStorage.setItem('ai-learn-chat', JSON.stringify(msgs.slice(-30))); } catch { /* blocked */ } endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs]);

  const canAsk = (left > 0 || st?.staff) && !busy;
  const ask = async text => {
    const question = String(text ?? q).trim();
    if (!question || !canAsk) return;
    const next = [...msgs, { role: 'user', content: question }];
    setMsgs(next); setQ(''); setBusy(true); setErr('');
    try {
      const r = await axios.post(`${API_URL}/api/ai-learn/ask`, { messages: next }, api());
      setMsgs(m => [...m, { role: 'assistant', content: r.data.answer }]);
      setSt(s => ({ ...s, used: r.data.used, limit: r.data.limit }));
    } catch (e) {
      setErr(e.response?.data?.error || 'Something went wrong. Please try again.');
      if (e.response?.data?.closed) load();
    }
    setBusy(false);
  };

  const open = left > 0 || st?.staff;
  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <StudentNav active="ailearn" />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px 120px' }}>
        <div style={{ background: T.navy, color: '#fff', borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: '#b0e5fb' }}>AI LEARN</div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 28 }}>Ask anything about English</h1>
          <div style={{ fontSize: 15, color: T.navyText, lineHeight: 1.5 }}>Grammar, words, emails, IELTS, the scholarship interview. AI Learn can see your results on this site, so ask it "What should I practise?" to get work made just for you.</div>
          <div style={{ marginTop: 12, display: 'inline-block', padding: '5px 12px', borderRadius: 50, fontSize: 14, fontWeight: 700, background: left > 0 ? '#2e7d32' : '#5b6780' }}>
            {st == null ? 'Checking…' : left > 0 ? `Open now · ${fmt(left)} left${st.limit ? ` · ${Math.max(0, st.limit - (st.used || 0))} questions left` : ''}` : st.staff ? 'Closed for students (staff can still test it)' : 'Closed. Your teacher will open it in class.'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {[['chat', 'Ask AI Learn'], ['saved', `My saved answers (${saved.length})`]].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setView(id)} style={{ height: 38, padding: '0 16px', borderRadius: 50, border: `1.5px solid ${view === id ? T.primary : T.hairline}`, background: view === id ? T.primary : '#fff', color: view === id ? '#fff' : T.ink, fontWeight: 700, fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>
          ))}
        </div>

        {view === 'saved' && (
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            {saved.length === 0 && <div style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 14, padding: 18, color: T.muted, fontSize: 15 }}>No saved answers yet. When AI Learn gives you a useful answer, press <b>Save</b> under it. You can read your saved answers here any time, even when AI Learn is closed.</div>}
            {saved.map(r => (
              <details key={r.id} style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 14, padding: '12px 16px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 15.5, color: T.ink, lineHeight: 1.4 }}>{r.question.length > 140 ? r.question.slice(0, 140) + '…' : r.question}
                  <span style={{ display: 'block', fontWeight: 400, fontSize: 12.5, color: T.mid, marginTop: 2 }}>Saved {new Date(r.createdAt).toLocaleDateString()}</span></summary>
                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.55 }}><MiniMarkdown text={r.answer} /></div>
                <button type="button" onClick={() => removeSaved(r.id)} style={{ marginTop: 6, border: 0, background: 'none', color: T.error, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, padding: 0 }}>Delete</button>
              </details>
            ))}
          </div>
        )}

        {view === 'chat' && msgs.length === 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.muted, marginBottom: 8 }}>Try one of these</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGEST.map(s => (
                <button key={s} type="button" disabled={!canAsk} onClick={() => ask(s)} style={{ textAlign: 'left', border: `1px solid ${T.hairline}`, background: '#fff', borderRadius: 12, padding: '10px 14px', fontSize: 14, cursor: canAsk ? 'pointer' : 'default', color: T.inkSoft, fontFamily: 'inherit', maxWidth: 400, opacity: canAsk ? 1 : 0.6 }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {view === 'chat' && <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ justifySelf: m.role === 'user' ? 'end' : 'stretch', maxWidth: m.role === 'user' ? '80%' : '100%', background: m.role === 'user' ? T.primary : '#fff', color: m.role === 'user' ? '#fff' : T.ink, border: m.role === 'user' ? 'none' : `1px solid ${T.hairline}`, borderRadius: 14, padding: '12px 16px', fontSize: 15, lineHeight: 1.55, whiteSpace: m.role === 'user' ? 'pre-wrap' : 'normal' }}>
              {m.role === 'user' ? m.content : <MiniMarkdown text={m.content} />}
              {m.role === 'assistant' && (
                <div style={{ borderTop: `1px solid ${T.tint}`, marginTop: 8, paddingTop: 8 }}>
                  {savedIds[i]
                    ? <span style={{ fontSize: 13.5, fontWeight: 700, color: T.success }}>Saved to My saved answers ✓</span>
                    : <button type="button" onClick={() => saveAnswer(i)} style={{ border: `1px solid ${T.primary}`, background: T.primaryXSoft, color: T.primary, borderRadius: 50, height: 32, padding: '0 14px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>Save this answer</button>}
                </div>
              )}
            </div>
          ))}
          {busy && <div style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 14, padding: '12px 16px', color: T.muted, fontSize: 15 }}>Thinking…</div>}
          {err && <div style={{ background: T.errorSoft, color: T.error, borderRadius: 12, padding: '10px 14px', fontSize: 14 }}>{err}</div>}
          <div ref={endRef} />
        </div>}
      </div>

      {view === 'chat' && <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: `1px solid ${T.hairline}`, padding: '12px 16px' }}>
        <form onSubmit={e => { e.preventDefault(); ask(); }} style={{ maxWidth: 860, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea value={q} onChange={e => setQ(e.target.value)} disabled={!open} rows={q.split('\n').length > 2 ? 5 : 1}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }}
            placeholder={open ? 'Search or ask anything about English… (Enter to send, Shift+Enter for a new line)' : 'AI Learn is closed right now'}
            style={{ flex: 1, resize: 'vertical', minHeight: 44, maxHeight: 220, border: `1.5px solid ${T.hairline}`, borderRadius: 12, padding: '11px 14px', fontSize: 15, fontFamily: 'inherit', background: open ? '#fff' : '#f4f6fa' }} />
          <button type="submit" disabled={!canAsk || !q.trim()} style={{ height: 46, padding: '0 20px', borderRadius: 12, border: 0, background: canAsk && q.trim() ? T.primary : '#b8c3d6', color: '#fff', fontWeight: 700, fontSize: 15, cursor: canAsk && q.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>Ask</button>
          {msgs.length > 0 && <button type="button" onClick={() => { setMsgs([]); setErr(''); }} style={{ height: 46, padding: '0 14px', borderRadius: 12, border: `1px solid ${T.hairline}`, background: '#fff', color: T.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>New chat</button>}
        </form>
      </div>}
    </div>
  );
}
