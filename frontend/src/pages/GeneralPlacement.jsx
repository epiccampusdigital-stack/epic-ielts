import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import { PARTS, LEVEL_TEXT, levelFor, partScore, isGePlacementPaper } from '../utils/gePlacement';

// General English placement: four short tests taken on Day 1 of a program.
// Each part gets a score out of 100 and a CEFR level. No IELTS bands here.

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const C = {
  navy: '#1A1A2E', deep: '#12122A', indigo: '#4F46E5', indigoSoft: '#EEF2FF', gold: '#F59E0B',
  bg: '#F8FAFC', card: '#FFFFFF', line: '#E2E8F0', text: '#1A1A2E', sub: '#475569', faint: '#64748B',
};
const SERIF = "'Playfair Display', Georgia, serif";

function Mark() {
  return <div style={{ width: 32, height: 3, background: C.gold, borderRadius: 2, marginBottom: 12 }} />;
}

export default function GeneralPlacement() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [p, h] = await Promise.all([
        axios.get(`${API_URL}/api/papers/assigned?track=GENERAL`, api()),
        axios.get(`${API_URL}/api/attempts/placement/mine`, api()),
      ]);
      setPapers((Array.isArray(p.data) ? p.data : []).filter(isGePlacementPaper));
      setHistory((Array.isArray(h.data) ? h.data : []).filter(a => a.paper?.track === 'GENERAL'));
    } catch {
      setError('Could not load the placement test. Please refresh the page.');
    }
    setLoading(false);
  };

  const historyRef = useRef([]);
  useEffect(() => { historyRef.current = history; }, [history]);

  useEffect(() => {
    Promise.resolve().then(load);
    // Writing and speaking are marked in the background: refresh while any part is still being marked
    const id = setInterval(() => {
      if (historyRef.current.some(a => partScore(a).state === 'marking')) load();
    }, 20000);
    return () => clearInterval(id);
  }, []);

  const start = async (paper, redo) => {
    setBusy(paper.id);
    setError('');
    try {
      if (redo) await axios.post(`${API_URL}/api/attempts/placement/reset`, { skill: paper.testType, track: 'GENERAL' }, api());
      const res = await axios.post(`${API_URL}/api/attempts`, { paperId: paper.id, isPlacement: true }, api());
      navigate(`/exam/${res.data.id || res.data.attemptId}/greeting`);
    } catch {
      setError('That test could not start. Please try again, or ask your teacher.');
    }
    setBusy(null);
  };

  const rows = PARTS.map(part => {
    const paper = papers.find(p => p.testType === part.skill);
    const attempt = history.find(a => a.paper?.testType === part.skill);
    return { ...part, paper, attempt, result: partScore(attempt) };
  });
  const scored = rows.filter(r => r.result.state === 'done');
  const allDone = scored.length === PARTS.length;
  const overall = scored.length ? Math.round(scored.reduce((s, r) => s + r.result.score, 0) / scored.length) : null;
  const nextUp = rows.find(r => r.result.state === 'todo' && r.paper);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif', color: C.text }}>
      <style>{`
        .gp-row { transition: border-color 160ms ease, box-shadow 160ms ease; }
        .gp-row:hover { border-color: #C7D2FE; box-shadow: 0 6px 18px rgba(26,26,46,0.06); }
        .gp-btn:focus-visible { outline: 3px solid #A5B4FC; outline-offset: 2px; }
        @media (max-width: 640px) {
          .gp-row { grid-template-columns: 40px 1fr !important; }
          .gp-row .gp-side { grid-column: 1 / -1; justify-content: flex-start !important; }
          .gp-hero { padding: 28px 22px !important; }
          .gp-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <StudentNav active="placement" />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 16px 64px' }}>
        <section className="gp-hero" style={{
          background: `radial-gradient(circle at 85% 10%, rgba(245,158,11,0.18), transparent 45%), linear-gradient(135deg, ${C.deep} 0%, ${C.navy} 55%, #2A2560 100%)`,
          color: '#fff', borderRadius: 20, padding: '36px 40px', marginBottom: 28,
        }}>
          <div className="gp-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 600, marginBottom: 10 }}>
                General English · Day 1
              </div>
              <h1 style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1.15, margin: '0 0 12px', fontWeight: 700 }}>
                Placement test
              </h1>
              <p style={{ margin: 0, color: '#CBD5E1', fontSize: 15, lineHeight: 1.6, maxWidth: 480 }}>
                Four short tests that show your teachers where your English is today: grammar, vocabulary,
                reading, listening, writing and speaking. There is no pass or fail. Just do your best.
              </p>
            </div>
            <div style={{ textAlign: 'center', minWidth: 150 }}>
              <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700, lineHeight: 1 }}>
                {overall == null ? '–' : overall}
              </div>
              <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>
                {allDone ? 'overall, out of 100' : scored.length ? 'so far, out of 100' : 'out of 100'}
              </div>
              <div style={{ marginTop: 12, display: 'inline-block', padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', fontSize: 13, fontWeight: 600 }}>
                {allDone ? `Level ${levelFor(overall)}` : `${scored.length} of 4 done`}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" style={{ background: '#FEF3F2', color: '#B42318', border: '1px solid #FECDCA', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        {allDone && (
          <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
            <Mark />
            <h2 style={{ fontFamily: SERIF, fontSize: 22, margin: '0 0 6px' }}>Your level: {levelFor(overall)}</h2>
            <p style={{ margin: '0 0 18px', color: C.sub, fontSize: 15, lineHeight: 1.6 }}>{LEVEL_TEXT[levelFor(overall)]} Your teachers will use this to plan your group.</p>
            <button className="gp-btn" type="button" onClick={() => navigate('/learn')} style={{
              padding: '11px 22px', background: C.indigo, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Go to my lessons</button>
          </section>
        )}

        <Mark />
        <h2 style={{ fontFamily: SERIF, fontSize: 22, margin: '0 0 6px' }}>The four parts</h2>
        <p style={{ margin: '0 0 18px', color: C.sub, fontSize: 14 }}>
          Take them in order if you can. Each part is timed and you can only take it once, unless your teacher asks you to redo it.
        </p>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.faint }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {rows.map((r, i) => {
              const s = r.result;
              const isNext = nextUp && nextUp.skill === r.skill;
              return (
                <div key={r.skill} className="gp-row" style={{
                  display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 16, alignItems: 'center',
                  background: C.card, border: `1px solid ${isNext ? '#A5B4FC' : C.line}`, borderRadius: 14, padding: '18px 20px',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15,
                    background: s.state === 'done' ? '#ECFDF5' : C.indigoSoft, color: s.state === 'done' ? '#047857' : C.indigo,
                  }}>{s.state === 'done' ? '✓' : i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{r.label}</div>
                    <div style={{ color: C.sub, fontSize: 13, marginTop: 3, lineHeight: 1.5 }}>{r.time} · {r.what}</div>
                  </div>
                  <div className="gp-side" style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'flex-end' }}>
                    {s.state === 'done' && (
                      <>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{s.score}<span style={{ fontSize: 13, color: C.faint, fontFamily: 'Inter, sans-serif' }}> /100</span></div>
                          <div style={{ fontSize: 12, color: C.indigo, fontWeight: 600, marginTop: 4 }}>Level {levelFor(s.score)}</div>
                        </div>
                        <button className="gp-btn" type="button" onClick={() => navigate(`/exam/${r.attempt.id}/${r.skill === 'WRITING' ? 'writing-results' : r.skill === 'SPEAKING' ? 'speaking-results' : 'results'}`)} style={linkBtn}>Details</button>
                      </>
                    )}
                    {s.state === 'marking' && <span style={{ fontSize: 13, color: '#B45309', fontWeight: 600 }}>Being marked...</span>}
                    {s.state === 'failed' && (
                      <button className="gp-btn" type="button" disabled={busy === r.paper?.id} onClick={() => start(r.paper, true)} style={linkBtn}>Marking failed. Redo</button>
                    )}
                    {s.state === 'todo' && (r.paper ? (
                      <button className="gp-btn" type="button" disabled={busy === r.paper.id} onClick={() => start(r.paper, false)} style={{
                        padding: '10px 18px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        background: isNext ? C.indigo : C.navy, color: '#fff', opacity: busy === r.paper.id ? 0.6 : 1,
                      }}>{busy === r.paper.id ? 'Starting...' : 'Start'}</button>
                    ) : (
                      <span style={{ fontSize: 13, color: C.faint }}>Not loaded yet</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <section style={{ marginTop: 32, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '22px 26px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>How your score works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {[['90+', 'B2'], ['75 to 89', 'B1'], ['50 to 74', 'A2'], ['25 to 49', 'A1'], ['0 to 24', 'Pre-A1']].map(([r, l]) => (
              <div key={l} style={{ background: C.bg, borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, color: C.indigo }}>{l}</div>
                <div style={{ fontSize: 12, color: C.sub }}>{r} out of 100</div>
              </div>
            ))}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
            Grammar, reading and listening are marked straight away. Writing and speaking are marked by AI and
            usually take a minute or two. Your overall score is the average of the four parts.
          </p>
        </section>
      </div>
    </div>
  );
}

const linkBtn = {
  padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.line}`, background: '#fff', color: C.text,
  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};

