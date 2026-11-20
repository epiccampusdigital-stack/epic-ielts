// Teachers open and lock the Exam tab papers here. Students see an exam only after it is opened.
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { T } from '../theme';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const SKILL = { READING: 'Reading', WRITING: 'Writing', LISTENING: 'Listening' };

export default function ExamControl({ flash = () => {} }) {
  const [exams, setExams] = useState(null);
  const [busy, setBusy] = useState('');
  const [confirm, setConfirm] = useState('');
  const load = useCallback(() => axios.get(`${API_URL}/api/exams`, api()).then(r => setExams(r.data.exams || [])).catch(() => setExams([])), []);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  async function toggle(exam) {
    const action = exam.open ? 'lock' : 'open';
    setBusy(exam.id); setConfirm('');
    try {
      await axios.post(`${API_URL}/api/exams/${exam.id}/${action}`, {}, api());
      flash(action === 'open' ? `${exam.title} is open. Students can start it now.` : `${exam.title} is locked again.`);
      await load();
    } catch (e) { flash(e.response?.data?.error || 'Could not change the exam.'); }
    setBusy('');
  }

  if (!exams) return <p style={{ color: T.muted }}>Loading exams…</p>;
  if (!exams.length) return <p style={{ color: T.muted }}>No exams yet.</p>;
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <p style={{ margin: 0, color: T.muted, fontSize: 15 }}>Students see these in their Exam tab. They stay locked until you open them. Open the exam when everyone is sitting down and ready.</p>
      {exams.map(e => (
        <div key={e.id} style={{ background: '#fff', border: `${e.open ? 2 : 1}px solid ${e.open ? T.success : T.hairline}`, borderRadius: 14, padding: 18, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>{e.title}</div>
              <div style={{ color: T.muted, fontSize: 14 }}>{e.subtitle} · {e.totalMinutes} minutes</div>
            </div>
            <span style={{ padding: '5px 12px', borderRadius: 50, fontWeight: 700, fontSize: 14, background: e.open ? T.successSoft : T.tint, color: e.open ? T.success : T.muted }}>{e.open ? 'Open' : '🔒 Locked'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {e.parts.map((p, k) => (
              <span key={p.paperId} style={{ background: '#f6f8fc', borderRadius: 10, padding: '6px 12px', fontSize: 14 }}>
                Part {k + 1}: {SKILL[p.testType] || p.testType}, {p.timeLimitMin} min · <b>{p.finishedBy || 0}</b> submitted
              </span>
            ))}
          </div>
          {confirm === e.id ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>{e.open ? 'Lock it? Students who have not started cannot start.' : 'Open it for all students now?'}</span>
              <button type="button" disabled={busy === e.id} onClick={() => toggle(e)} style={{ height: 40, padding: '0 18px', borderRadius: 50, border: 0, background: e.open ? T.error : T.success, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{busy === e.id ? 'Saving…' : e.open ? 'Yes, lock it' : 'Yes, open it'}</button>
              <button type="button" onClick={() => setConfirm('')} style={{ height: 40, padding: '0 18px', borderRadius: 50, border: `1.5px solid ${T.hairline}`, background: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          ) : (
            <div><button type="button" onClick={() => setConfirm(e.id)} style={{ height: 42, padding: '0 20px', borderRadius: 50, border: 0, background: e.open ? '#fff' : T.primary, color: e.open ? T.error : '#fff', boxShadow: e.open ? `inset 0 0 0 1.5px ${T.error}` : 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>{e.open ? '🔒 Lock the exam' : '🔓 Open the exam for students'}</button></div>
          )}
        </div>
      ))}
    </div>
  );
}
