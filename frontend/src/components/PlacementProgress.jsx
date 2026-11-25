import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { T } from '../theme';

// "My progress": the placement band, then each class exam's band, side by side, so students see where
// they started and how they have grown. Shown on the dashboard and at the top of the Exam tab.
// Data: GET /api/exams/progress → { placement: { band } | null, exams: [{ id, title, state, band, score, total, skills }] }
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const SHORT = { paper1: 'Exam Paper 1', paper2: 'Midway Exam', final: 'Final Exam' };
const STATE = { locked: '🔒 Not yet', open: 'Open now', 'in-progress': 'In progress', held: 'Results soon', marking: 'Being marked' };

export function useExamProgress() {
  const [data, setData] = useState(undefined); // undefined = loading, null = failed
  useEffect(() => {
    let alive = true;
    const get = () => axios.get(`${API_URL}/api/exams/progress`, auth()).then(r => { if (alive) setData(r.data); }).catch(() => { if (alive) setData(d => d ?? null); });
    get();
    const t = setInterval(get, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return data;
}

export default function PlacementProgress({ data: given }) {
  const navigate = useNavigate();
  const own = useExamProgress();
  const data = given !== undefined ? given : own;
  if (!data) return null;
  const start = data.placement?.band ?? null;
  const steps = [
    { key: 'placement', label: 'Placement test', band: start, note: start == null ? 'Not taken' : 'Your start' },
    ...(data.exams || []).map(e => ({ key: e.id, label: SHORT[e.id] || e.title, band: e.state === 'ready' ? e.band : null, note: e.state === 'ready' ? (e.total ? `${e.score} / ${e.total} correct` : 'Overall band') : STATE[e.state] || '' })),
  ];
  const withBand = steps.filter(s => s.band != null);
  const latest = withBand.length > 1 ? withBand[withBand.length - 1] : null;
  const diff = latest && start != null ? latest.band - start : null;

  return (
    <div style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 20, fontFamily: T.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: T.primary }}>MY PROGRESS</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.ink }}>Where you started, and how you have grown</div>
        </div>
        {diff != null && (
          <div style={{ padding: '8px 14px', borderRadius: 12, background: diff > 0 ? T.successSoft : diff < 0 ? T.errorSoft : T.primaryXSoft, color: diff > 0 ? T.success : diff < 0 ? T.error : T.ink, fontWeight: 800, fontSize: 16 }}>
            {diff > 0 ? '▲ +' : diff < 0 ? '▼ ' : ''}{diff.toFixed(1)} band{Math.abs(diff) === 1 ? '' : 's'} since the placement test
          </div>
        )}
        {start == null && <button type="button" onClick={() => navigate('/placement-test')}
          style={{ height: 40, padding: '0 18px', borderRadius: 8, border: 0, background: T.primary, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>Take the placement test</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        {steps.map((s, i) => {
          const prev = i > 0 ? [...steps.slice(0, i)].reverse().find(x => x.band != null) : null;
          const up = s.band != null && prev ? s.band - prev.band : null;
          const isLatest = latest && s.key === latest.key;
          return (
            <div key={s.key} style={{ position: 'relative', borderRadius: 12, padding: '12px 14px', background: s.band != null ? (isLatest ? T.primary : T.primaryXSoft) : '#f6f8fc', color: isLatest ? '#fff' : T.ink, border: `1px solid ${isLatest ? T.primary : T.hairline}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', opacity: 0.85 }}>{i === 0 ? 'START' : `STEP ${i}`}</div>
              <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginTop: 4, color: s.band == null ? T.muted : undefined }}>
                {s.band != null ? Number(s.band).toFixed(1) : '—'}
                {up != null && up !== 0 && <span style={{ fontSize: 14, fontWeight: 800, marginLeft: 6, color: isLatest ? '#fff' : up > 0 ? T.success : T.error }}>{up > 0 ? '▲' : '▼'}{Math.abs(up).toFixed(1)}</span>}
              </div>
              {/* a small bar: band out of 9 */}
              <div style={{ height: 6, borderRadius: 3, background: isLatest ? 'rgba(255,255,255,.3)' : T.hairline, marginTop: 6 }}>
                <div style={{ height: 6, borderRadius: 3, width: `${s.band != null ? Math.min(100, (s.band / 9) * 100) : 0}%`, background: isLatest ? '#fff' : T.primary }} />
              </div>
              <div style={{ fontSize: 12.5, marginTop: 6, color: isLatest ? '#e6eeff' : T.muted }}>{s.note}</div>
            </div>
          );
        })}
      </div>
      {start == null && <div style={{ marginTop: 10, color: T.muted, fontSize: 14, lineHeight: 1.5 }}>Take the placement test to get your starting band. Each exam is then compared with it, so you can see how much you have improved.</div>}
    </div>
  );
}
