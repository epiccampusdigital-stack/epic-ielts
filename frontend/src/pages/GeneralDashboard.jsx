import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import AgentWidget from '../components/AgentWidget';
import SuggestedPapers from '../components/SuggestedPapers';
import { T } from '../theme';
import { PARTS, levelFor, partScore, isGePlacementPaper } from '../utils/gePlacement';

// General English student dashboard: the student's own page with their scores, progress and what to do next.
// Scores are out of 100 (no IELTS bands).

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const SKILLS = [
  { key: 'READING', label: 'Reading', color: '#0056d2' },
  { key: 'LISTENING', label: 'Listening', color: '#7a3db8' },
  { key: 'WRITING', label: 'Writing', color: '#b45309' },
];
const RESULT_ROUTE = { READING: 'results', LISTENING: 'results', WRITING: 'writing-results', SPEAKING: 'speaking-results' };

function ratingFor(score) {
  if (score == null) return { label: 'No score yet', color: T.muted };
  if (score >= 85) return { label: 'Excellent', color: T.success };
  if (score >= 70) return { label: 'Good', color: T.primary };
  if (score >= 50) return { label: 'Getting there', color: T.warning };
  return { label: 'Keep practising', color: T.error };
}

// Score out of 100 for one finished attempt
function score100(a) {
  const raw = a?.result?.rawScore;
  if (raw == null) return null;
  const t = a.paper?.testType;
  if (t === 'WRITING' || t === 'SPEAKING') return Math.round(raw);
  const total = a.paper?._count?.questions;
  return total ? Math.round((raw / total) * 100) : null;
}

function dayLabel(d) {
  const t = new Date(d); const now = new Date();
  const days = Math.floor((new Date(now.toDateString()) - new Date(t.toDateString())) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function Trend({ values }) {
  if (values.length < 2) return <div style={{ color: T.muted, fontSize: 14, padding: '18px 0' }}>Do two or more papers to see your line.</div>;
  const w = 520, h = 120, pad = 10;
  const x = i => pad + (i * (w - pad * 2)) / (values.length - 1);
  const y = v => h - pad - (v / 100) * (h - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Your scores over time" style={{ display: 'block' }}>
      {[25, 50, 75].map(g => <line key={g} x1={pad} x2={w - pad} y1={y(g)} y2={y(g)} stroke={T.tint} strokeWidth="1" />)}
      <polyline points={`${pad},${h - pad} ${pts} ${w - pad},${h - pad}`} fill="rgba(0,86,210,0.08)" stroke="none" />
      <polyline points={pts} fill="none" stroke={T.primary} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="#fff" stroke={T.primary} strokeWidth="2" />)}
    </svg>
  );
}

export default function GeneralDashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [papers, setPapers] = useState([]);
  const [modules, setModules] = useState([]);
  const [placement, setPlacement] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const firstName = (user.name || 'Student').split(' ')[0];

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API_URL}/api/attempts/history/mine?track=GENERAL`, api()),
      axios.get(`${API_URL}/api/papers/assigned?track=GENERAL`, api()),
      axios.get(`${API_URL}/api/learn/modules?track=GENERAL`, api()),
      axios.get(`${API_URL}/api/attempts/placement/mine`, api()),
    ]).then(([h, p, m, pl]) => {
      if (h.status === 'fulfilled' && Array.isArray(h.value.data)) setHistory(h.value.data);
      if (p.status === 'fulfilled' && Array.isArray(p.value.data)) setPapers(p.value.data);
      if (m.status === 'fulfilled' && Array.isArray(m.value.data)) setModules(m.value.data);
      if (pl.status === 'fulfilled' && Array.isArray(pl.value.data)) setPlacement(pl.value.data.filter(a => a.paper?.track === 'GENERAL'));
      setLoading(false);
    });
  }, []);

  // Finished practice papers (placement tests are shown on their own)
  const done = useMemo(() => history
    .filter(a => (a.status === 'COMPLETED' || a.endedAt) && !a.isPlacement && !isGePlacementPaper(a.paper || {}))
    .map(a => ({ ...a, score: score100(a) }))
    .sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt)), [history]);
  const scoredDone = done.filter(a => a.score != null);
  const average = scoredDone.length ? Math.round(scoredDone.slice(0, 10).reduce((s, a) => s + a.score, 0) / Math.min(10, scoredDone.length)) : null;
  const papersDone = new Set(done.map(a => a.paperId)).size;
  const trend = scoredDone.slice(0, 10).reverse().map(a => a.score);
  const skillRows = SKILLS.map(s => {
    const vals = scoredDone.filter(a => a.paper?.testType === s.key).slice(0, 3).map(a => a.score);
    return { ...s, score: vals.length ? Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) : null, count: done.filter(a => a.paper?.testType === s.key).length };
  });

  // Weekly quizzes: latest score on each
  const quizzes = useMemo(() => papers.filter(p => /^GE-W\d/.test(String(p.paperCode || ''))).map(p => {
    const latest = done.find(a => a.paperId === p.id);
    return { paper: p, latest, score: latest ? latest.score : null };
  }), [papers, done]);

  const placementRows = PARTS.map(part => {
    const attempt = placement.find(a => a.paper?.testType === part.skill);
    return { ...part, attempt, result: partScore(attempt) };
  });
  const placementScored = placementRows.filter(r => r.result.state === 'done');
  const placementStarted = placementRows.some(r => r.result.state !== 'todo');
  const placementDone = placementScored.length === PARTS.length;
  const placementOverall = placementScored.length ? Math.round(placementScored.reduce((s, r) => s + r.result.score, 0) / placementScored.length) : null;

  const totalLessons = modules.reduce((s, m) => s + (m.totalLessons || 0), 0);
  const doneLessons = modules.reduce((s, m) => s + (m.completedLessons || 0), 0);
  const nextLesson = (() => { for (const m of modules) for (const l of m.lessons || []) if (!l.isCompleted) return { m, l }; return null; })();
  const rating = ratingFor(average);

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <style>{`
        .gd-wrap { max-width: 1184px; margin: 0 auto; padding: 28px 32px 96px; display: grid; gap: 22px; }
        .gd-card { background: #fff; border: 1px solid ${T.hairline}; border-radius: 16px; padding: 22px; }
        .gd-h2 { margin: 0; font-size: 20px; font-weight: 700; }
        .gd-btn { height: 38px; padding: 0 16px; border-radius: 8px; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; border: 1px solid ${T.hairline}; background: #fff; color: ${T.ink}; white-space: nowrap; }
        .gd-btn.primary { background: ${T.primary}; border-color: ${T.primary}; color: #fff; }
        .gd-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .gd-stat { background: #fff; border: 1px solid ${T.hairline}; border-radius: 16px; padding: 16px 18px; display: grid; gap: 2px; align-content: start; }
        .gd-stat .k { font-size: 13.5px; color: ${T.muted}; font-weight: 700; }
        .gd-stat .v { font-size: 34px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
        .gd-stat .v small { font-size: 14px; color: ${T.muted}; font-weight: 400; }
        .gd-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 18px; align-items: start; }
        .gd-bar { height: 10px; border-radius: 50px; background: ${T.tint}; overflow: hidden; }
        .gd-bar > span { display: block; height: 100%; border-radius: 50px; }
        .gd-row { display: grid; grid-template-columns: minmax(0, 1fr) 70px auto; gap: 12px; align-items: center; padding: 11px 0; border-top: 1px solid ${T.hairline}; }
        .gd-parts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 12px; }
        @media (max-width: 900px) {
          .gd-wrap { padding: 18px 16px 80px; }
          .gd-grid { grid-template-columns: 1fr; }
          .gd-stats, .gd-parts { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
      <StudentNav active="dashboard" />

      <main className="gd-wrap">
        <header>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: T.primary, textTransform: 'uppercase' }}>My dashboard</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 30, fontWeight: 700 }}>Hi {firstName}</h1>
          <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 16 }}>This page is yours. It shows your scores, how you are improving and what to do next.</p>
        </header>

        {!loading && !placementDone && (
          <section style={{ background: T.navy, color: '#fff', borderRadius: 16, padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{placementStarted ? `Finish your placement test (${placementScored.length} of 4 done)` : 'First, take your placement test'}</div>
              <div style={{ color: T.navyText, fontSize: 15, marginTop: 2 }}>It shows your teachers your level. No pass or fail.</div>
            </div>
            <button type="button" className="gd-btn primary" style={{ height: 44, padding: '0 22px', fontSize: 15 }} onClick={() => navigate('/placement-test')}>
              {placementStarted ? 'Continue' : 'Start the placement test'}
            </button>
          </section>
        )}

        <SuggestedPapers track="GENERAL" />

        <section aria-label="My progress">
          <h2 className="gd-h2" style={{ marginBottom: 12 }}>My progress</h2>
          <div className="gd-stats">
            <div className="gd-stat">
              <span className="k">My average score</span>
              <span className="v">{average ?? '–'}<small>{average == null ? '' : ' / 100'}</small></span>
              <span style={{ fontSize: 14, fontWeight: 700, color: rating.color }}>{average == null ? 'Do a paper to start' : rating.label}</span>
            </div>
            <div className="gd-stat">
              <span className="k">Papers done</span>
              <span className="v">{papersDone}</span>
              <span style={{ fontSize: 14, color: T.muted }}>{done.length} tries in total</span>
            </div>
            <div className="gd-stat">
              <span className="k">Lessons done</span>
              <span className="v">{doneLessons}<small> / {totalLessons || 30}</small></span>
              <div className="gd-bar" style={{ marginTop: 6 }}><span style={{ width: `${totalLessons ? (doneLessons / totalLessons) * 100 : 0}%`, background: T.success }} /></div>
            </div>
            <div className="gd-stat">
              <span className="k">My level</span>
              <span className="v">{levelFor(placementOverall) || '–'}</span>
              <span style={{ fontSize: 14, color: T.muted }}>{placementOverall == null ? 'After the placement test' : `Placement: ${placementOverall} / 100`}</span>
            </div>
          </div>
        </section>

        <div className="gd-grid">
          <div style={{ display: 'grid', gap: 18 }}>
            <section className="gd-card" aria-label="Scores over time">
              <h2 className="gd-h2">My scores over time</h2>
              <p style={{ margin: '2px 0 10px', color: T.muted, fontSize: 14 }}>Your last {Math.max(trend.length, 0) || 10} papers, oldest on the left.</p>
              <Trend values={trend} />
              <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                {skillRows.map(s => (
                  <div key={s.key} style={{ display: 'grid', gridTemplateColumns: '90px minmax(0,1fr) 64px', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{s.label}</span>
                    <div className="gd-bar"><span style={{ width: `${s.score ?? 0}%`, background: s.color }} /></div>
                    <span style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: s.score == null ? T.mid : T.ink }}>{s.score == null ? 'Not yet' : `${s.score}`}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="gd-card" aria-label="My recent papers">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <h2 className="gd-h2">My recent papers</h2>
                <button type="button" onClick={() => navigate('/practice')} style={{ border: 0, background: 'none', color: T.primary, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>All papers ›</button>
              </div>
              <div style={{ marginTop: 8 }}>
                {loading ? <p style={{ color: T.muted }}>Loading…</p> : done.length === 0 ? (
                  <p style={{ color: T.muted, margin: '8px 0 0' }}>You have not finished a paper yet. Start one from "Suggested for you".</p>
                ) : done.slice(0, 6).map(a => (
                  <div key={a.id} className="gd-row">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.paper?.title || 'Paper'}</div>
                      <div style={{ fontSize: 13, color: T.muted }}>{dayLabel(a.endedAt || a.startedAt)}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: ratingFor(a.score).color }}>
                      {a.score ?? '…'}<span style={{ fontSize: 12, color: T.muted, fontWeight: 400 }}>{a.score == null ? '' : '/100'}</span>
                    </div>
                    <button type="button" className="gd-btn" onClick={() => navigate(`/exam/${a.id}/${RESULT_ROUTE[a.paper?.testType] || 'results'}`)}>Review</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside style={{ display: 'grid', gap: 18 }}>
            <section className="gd-card" aria-label="Lessons">
              <h2 className="gd-h2">My lessons</h2>
              <p style={{ margin: '2px 0 12px', color: T.muted, fontSize: 14 }}>{doneLessons} of {totalLessons || 30} finished</p>
              {nextLesson ? (
                <div style={{ background: T.primaryXSoft, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, color: T.muted, fontWeight: 700 }}>Next lesson</div>
                  <div style={{ fontWeight: 700, margin: '2px 0 10px' }}>{nextLesson.l.title}</div>
                  <button type="button" className="gd-btn primary" onClick={() => navigate(`/learn/${nextLesson.m.id}/${nextLesson.l.id}`)}>Continue</button>
                </div>
              ) : <div style={{ fontWeight: 700, color: T.success }}>All lessons finished. Well done.</div>}
            </section>

            {quizzes.length > 0 && (
              <section className="gd-card" aria-label="Weekly quizzes">
                <h2 className="gd-h2">Weekly quizzes</h2>
                <div style={{ marginTop: 6 }}>
                  {quizzes.map(q => (
                    <div key={q.paper.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: `1px solid ${T.hairline}` }}>
                      <span style={{ fontWeight: 600, minWidth: 0 }}>{q.paper.title}</span>
                      {q.latest
                        ? <button type="button" onClick={() => navigate(`/exam/${q.latest.id}/${RESULT_ROUTE[q.paper.testType] || 'results'}`)} style={{ border: 0, background: 'none', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700, fontSize: 16, color: ratingFor(q.score).color }}>{q.score ?? '…'}<span style={{ fontSize: 12, color: T.muted, fontWeight: 400 }}>/100</span></button>
                        : <span style={{ fontSize: 13, color: T.mid }}>Not taken</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {placementStarted && (
              <section className="gd-card" aria-label="Placement test">
                <h2 className="gd-h2">Placement test</h2>
                <div className="gd-parts" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {placementRows.map(r => (
                    <div key={r.skill} style={{ border: `1px solid ${T.hairline}`, borderRadius: 10, padding: '8px 10px' }}>
                      <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 700 }}>{r.short}</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>
                        {r.result.state === 'done' ? r.result.score : r.result.state === 'marking' ? '…' : '–'}
                        {r.result.state === 'done' && <span style={{ fontSize: 12, color: T.muted, fontWeight: 400 }}>/100</span>}
                      </div>
                      <div style={{ fontSize: 12.5, color: r.result.state === 'done' ? T.primary : T.muted, fontWeight: 600 }}>
                        {r.result.state === 'done' ? `Level ${levelFor(r.result.score)}` : r.result.state === 'marking' ? 'Being marked' : r.result.state === 'failed' ? 'Ask your teacher' : 'Not taken'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
      <AgentWidget />
    </div>
  );
}
