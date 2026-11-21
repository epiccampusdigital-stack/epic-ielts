import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { T } from '../theme';

// Dashboard card: the placement test (moved here from the nav bar).
// Shows the starting band from the placement test, the latest exam band, and once the
// programme is over (30 Nov 2026) the progress from the start as a percentage.
const PROGRAMME_END = new Date('2026-11-30T23:59:00+05:30');
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function PlacementProgress() {
  const navigate = useNavigate();
  const [start, setStart] = useState(undefined); // undefined = loading, null = no placement yet
  const [latest, setLatest] = useState(null); // { band, title }

  useEffect(() => {
    let alive = true;
    axios.get(`${API_URL}/api/payments/my-levels`, auth())
      .then(r => { if (alive) setStart(r.data?.placementDone && r.data?.placementBand != null ? Number(r.data.placementBand) : null); })
      .catch(() => { if (alive) setStart(null); });
    // the newest exam with a finished overall band
    axios.get(`${API_URL}/api/exams`, auth()).then(async r => {
      const exams = (r.data?.exams || []).slice().reverse();
      for (const ex of exams) {
        try {
          const res = await axios.get(`${API_URL}/api/exams/${ex.id}/results`, auth());
          const b = res.data?.overall?.band;
          if (b != null) { if (alive) setLatest({ band: Number(b), title: ex.title || 'Latest exam' }); return; }
        } catch { /* not taken yet */ }
      }
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const [now] = useState(() => Date.now());
  if (start === undefined) return null;
  const over = now > PROGRAMME_END.getTime();
  const pct = start && latest ? Math.round(((latest.band - start) / start) * 100) : null;
  const cell = (label, value, sub, color = T.ink) => (
    <div style={{ flex: '1 1 140px', background: T.primaryXSoft, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: T.mid }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: T.muted }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 20, margin: '0 0 20px', fontFamily: T.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: T.primary }}>MY PROGRESS</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.ink }}>{over ? 'Your 30 days: start vs finish' : 'Where you started, and where you are now'}</div>
        </div>
        {start == null && <button type="button" onClick={() => navigate('/placement-test')}
          style={{ height: 40, padding: '0 18px', borderRadius: 8, border: 0, background: T.primary, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>Take the placement test</button>}
      </div>
      {start == null
        ? <div style={{ color: T.muted, fontSize: 15, lineHeight: 1.5 }}>Take the placement test first. It gives your starting score, and at the end of the programme we compare your final exam with it to show how much you have improved.</div>
        : <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {cell('STARTING BAND', start.toFixed(1), 'Placement test')}
          {cell(over ? 'FINAL BAND' : 'LATEST BAND', latest ? latest.band.toFixed(1) : '—', latest ? latest.title : 'After your next exam')}
          {pct != null
            ? cell('PROGRESS', `${pct > 0 ? '+' : ''}${pct}%`, `${latest.band - start >= 0 ? '+' : ''}${(latest.band - start).toFixed(1)} band${Math.abs(latest.band - start) === 1 ? '' : 's'}`, pct > 0 ? T.success : pct < 0 ? T.error : T.ink)
            : cell('PROGRESS', '—', 'Shown after an exam')}
        </div>}
      {start != null && !over && <div style={{ marginTop: 10, fontSize: 13, color: T.mid }}>Your full progress report comes after the final exam, when the 30 days are over.</div>}
    </div>
  );
}
