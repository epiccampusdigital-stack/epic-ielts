import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { T } from '../theme';

// "Suggested for you": papers the system picks for this student
// (unfinished ones, tasks from the teacher, then the weakest skill at the right level).
const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const SKILL = {
  READING: { label: 'Reading', color: '#0056d2', soft: '#e3eeff' },
  LISTENING: { label: 'Listening', color: '#7a3db8', soft: '#f2e9fb' },
  WRITING: { label: 'Writing', color: '#b45309', soft: '#fff3e0' },
  SPEAKING: { label: 'Speaking', color: '#0f766e', soft: '#e3f6f3' },
};
const TAG = { continue: 'Not finished', teacher: 'From your teacher', practice: 'For you' };

export default function SuggestedPapers({ track = 'GENERAL', onLoaded }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/papers/suggested`, { ...api(), params: { track } })
      .then(r => { setItems(r.data.suggestions || []); onLoaded?.(r.data); })
      .catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const go = async s => {
    if (s.attemptId) return navigate(`/exam/${s.attemptId}/greeting`);
    if (s.locked) return navigate('/upgrade');
    setBusy(s.paper.id); setErr('');
    try {
      const r = await axios.post(`${API_URL}/api/attempts`, { paperId: s.paper.id }, api());
      navigate(`/exam/${r.data.id || r.data.attemptId}/greeting`);
    } catch (e) {
      if (e.response?.status === 403) navigate('/upgrade');
      else setErr('Could not open the paper. Please try again.');
    }
    setBusy(null);
  };

  if (items && items.length === 0) return null;
  return (
    <section aria-label="Suggested for you">
      <style>{`
        .sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; margin-top: 12px; }
        .sp-card { border: 1px solid ${T.hairline}; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 6px; background: #fff; transition: box-shadow .15s, border-color .15s; }
        .sp-card:hover { border-color: #b9c8e2; box-shadow: 0 6px 18px rgba(0,39,97,.08); }
        .sp-btn { margin-top: auto; height: 38px; border: 0; border-radius: 8px; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; color: #fff; }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Suggested for you</h2>
        <button type="button" onClick={() => navigate('/practice')} style={{ border: 0, background: 'none', color: T.primary, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>All papers ›</button>
      </div>
      {err && <div style={{ color: T.error, fontSize: 14, marginTop: 6 }}>{err}</div>}
      <div className="sp-grid">
        {(items || [null, null, null]).map((s, i) => {
          if (!s) return <div key={i} className="sp-card" style={{ minHeight: 150, background: T.primaryXSoft, border: 0 }} />;
          const k = SKILL[s.paper.testType] || SKILL.READING;
          return (
            <div key={s.paper.id} className="sp-card" style={s.kind === 'teacher' ? { borderColor: '#f5d98b', background: '#fffcf2' } : undefined}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: k.color, background: k.soft, borderRadius: 50, padding: '2px 10px' }}>{k.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.kind === 'teacher' ? '#8a5a00' : s.kind === 'continue' ? T.warning : T.muted }}>{TAG[s.kind]}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 17, color: T.ink, lineHeight: 1.3 }}>{s.paper.title}</div>
              {s.paper.difficulty ? (
                <div aria-label={`${s.paper.difficulty} of 5 stars`} style={{ fontSize: 14, letterSpacing: 1 }}>
                  {[1, 2, 3, 4, 5].map(n => <span key={n} style={{ color: n <= s.paper.difficulty ? '#F59E0B' : '#D5DBE5' }}>★</span>)}
                </div>
              ) : null}
              <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.4 }}>{s.reason}</div>
              <button type="button" className="sp-btn" disabled={busy === s.paper.id} onClick={() => go(s)} style={{ background: s.kind === 'continue' ? '#2e7d32' : T.primary, opacity: busy === s.paper.id ? 0.7 : 1 }}>
                {busy === s.paper.id ? 'Opening…' : s.kind === 'continue' ? 'Continue' : s.locked ? 'Unlock' : 'Start'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
