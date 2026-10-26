import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import AgentWidget from '../components/AgentWidget';
import { T } from '../theme';
import { PARTS, levelFor, partScore, isGePlacementPaper } from '../utils/gePlacement';

// General English has no IELTS band. Students get a score out of 100 for each test,
// a placement score and level from Day 1, and an overall score from the weekly quizzes.

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// Rating words for a score out of 100 (shown with the number, never instead of it)
function ratingFor(score) {
  if (score == null) return { label: 'Not taken yet', color: T.muted, soft: T.tint };
  if (score >= 85) return { label: 'Excellent', color: T.success, soft: T.successSoft };
  if (score >= 70) return { label: 'Good', color: T.primary, soft: T.primarySoft };
  if (score >= 50) return { label: 'Developing', color: T.warning, soft: T.warningSoft };
  return { label: 'Needs more practice', color: T.error, soft: T.errorSoft };
}

function percent(attempt) {
  const raw = attempt?.result?.rawScore;
  const total = attempt?.paper?._count?.questions;
  if (raw == null || !total) return null;
  return Math.round((raw / total) * 100);
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

  // Latest completed attempt per weekly quiz (placement papers are shown separately)
  const quizzes = useMemo(() => {
    const done = history.filter(a => a.status === 'COMPLETED' || a.endedAt);
    return papers.filter(p => !isGePlacementPaper(p)).map(p => {
      const attempts = done.filter(a => a.paperId === p.id || (a.paper?.paperCode === p.paperCode && a.paper?.testType === p.testType));
      attempts.sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt));
      const latest = attempts[0] || null;
      return { paper: p, latest, score: latest ? percent(latest) : null, tries: attempts.length };
    });
  }, [history, papers]);

  const placementRows = PARTS.map(part => {
    const attempt = placement.find(a => a.paper?.testType === part.skill);
    return { ...part, attempt, result: partScore(attempt) };
  });
  const placementScored = placementRows.filter(r => r.result.state === 'done');
  const placementStarted = placementRows.some(r => r.result.state !== 'todo');
  const placementDone = placementScored.length === PARTS.length;
  const placementOverall = placementScored.length ? Math.round(placementScored.reduce((s, r) => s + r.result.score, 0) / placementScored.length) : null;

  const scored = quizzes.filter(q => q.score != null);
  const overall = scored.length ? Math.round(scored.reduce((s, q) => s + q.score, 0) / scored.length) : null;
  const totalLessons = modules.reduce((s, m) => s + (m.totalLessons || 0), 0);
  const doneLessons = modules.reduce((s, m) => s + (m.completedLessons || 0), 0);
  const nextLesson = (() => {
    for (const m of modules) for (const l of m.lessons || []) if (!l.isCompleted) return { m, l };
    return null;
  })();

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: T.font, color: T.ink }}>
      <style>{`
        .gd-wrap { max-width: 1184px; margin: 0 auto; padding: 32px 32px 96px; display: grid; gap: 24px; }
        .gd-card { background: #fff; border: 1px solid ${T.hairline}; border-radius: 16px; padding: 24px; }
        .gd-h2 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.1px; }
        .gd-sub { margin: 4px 0 0; color: ${T.muted}; font-size: 14px; }
        .gd-btn { height: 40px; padding: 0 16px; border-radius: 8px; font: inherit; font-size: 14px; font-weight: 600; letter-spacing: 0.14px; cursor: pointer; border: 1px solid ${T.ink}; background: #fff; color: ${T.ink}; white-space: nowrap; }
        .gd-btn.primary { background: ${T.primary}; border-color: ${T.primary}; color: #fff; }
        .gd-btn.primary:hover { background: ${T.primaryPressed}; }
        .gd-btn.light { background: transparent; color: #fff; border-color: rgba(255,255,255,0.7); }
        .gd-top { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 16px; }
        .gd-callout { background: ${T.navy}; color: #fff; border-radius: 16px; padding: 32px; display: grid; gap: 12px; align-content: center; }
        .gd-callout p { margin: 0; color: ${T.navyText}; }
        .gd-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .gd-stat { border: 1px solid ${T.hairline}; border-radius: 16px; padding: 20px; display: grid; gap: 4px; align-content: start; }
        .gd-stat .k { font-size: 14px; color: ${T.muted}; font-weight: 600; }
        .gd-stat .v { font-size: 36px; font-weight: 600; letter-spacing: -0.4px; line-height: 1.1; }
        .gd-stat .v small { font-size: 14px; color: ${T.muted}; font-weight: 400; letter-spacing: 0; }
        .gd-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 16px; align-items: start; }
        .gd-row { display: grid; grid-template-columns: minmax(0, 1fr) 88px 150px 120px; gap: 12px; align-items: center; padding: 14px 0; border-top: 1px solid ${T.hairline}; }
        .gd-parts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
        .gd-part { border: 1px solid ${T.hairline}; border-radius: 8px; padding: 12px; display: grid; gap: 2px; }
        .gd-bar { height: 8px; border-radius: 50px; background: ${T.tint}; overflow: hidden; }
        .gd-bar > span { display: block; height: 100%; border-radius: 50px; background: ${T.primary}; }
        @media (max-width: 900px) {
          .gd-wrap { padding: 20px 16px 80px; }
          .gd-top, .gd-grid { grid-template-columns: 1fr; }
          .gd-row { grid-template-columns: minmax(0, 1fr) auto; }
          .gd-row .gd-hide { display: none; }
          .gd-parts { grid-template-columns: 1fr 1fr; }
          .gd-callout { padding: 24px; }
        }
      `}</style>
      <StudentNav active="dashboard" />

      <main className="gd-wrap">
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px' }}>Welcome back, {firstName}</h1>
          <p className="gd-sub" style={{ fontSize: 16 }}>General English. All scores are out of 100.</p>
        </div>

        {!loading && !placementDone ? (
          <section className="gd-callout" aria-label="Placement test">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#b0e5fb' }}>{placementStarted ? `Placement test: ${placementScored.length} of 4 parts done` : 'Start here'}</span>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.28px', color: '#fff' }}>
              {placementStarted ? 'Finish your placement test' : 'Take your placement test first'}
            </h2>
            <p style={{ maxWidth: 620 }}>Four short tests: grammar, vocabulary and reading; listening; writing; speaking. They show your teachers where your English is today. There is no pass or fail.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button type="button" className="gd-btn primary" style={{ height: 48, padding: '0 24px', fontSize: 16 }} onClick={() => navigate('/placement-test')}>
                {placementStarted ? 'Continue the placement test' : 'Start the placement test'}
              </button>
            </div>
          </section>
        ) : (
          <div className="gd-top">
            <section className="gd-callout" aria-label="Next lesson">
              <span style={{ fontSize: 14, fontWeight: 600, color: '#b0e5fb' }}>{nextLesson ? 'Continue learning' : 'All lessons finished'}</span>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.28px', color: '#fff' }}>
                {nextLesson ? nextLesson.l.title : 'Well done. You finished all 30 lessons.'}
              </h2>
              <p>{doneLessons} of {totalLessons || 30} daily lessons finished.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {nextLesson && <button type="button" className="gd-btn primary" onClick={() => navigate(`/learn/${nextLesson.m.id}/${nextLesson.l.id}`)}>Resume lesson</button>}
                <button type="button" className="gd-btn light" onClick={() => navigate('/practice')}>Weekly quizzes</button>
              </div>
            </section>
            <div className="gd-stats">
              <div className="gd-stat">
                <span className="k">Overall quiz score</span>
                <span className="v">{overall == null ? '–' : overall}<small>{overall == null ? '' : ' / 100'}</small></span>
                <span style={{ fontSize: 14, color: ratingFor(overall).color, fontWeight: 600 }}>{overall == null ? 'After your first quiz' : ratingFor(overall).label}</span>
              </div>
              <div className="gd-stat">
                <span className="k">Placement level</span>
                <span className="v">{levelFor(placementOverall) || '–'}</span>
                <span style={{ fontSize: 14, color: T.muted }}>{placementOverall == null ? '' : `${placementOverall} / 100 on Day 1`}</span>
              </div>
              <div className="gd-stat">
                <span className="k">Quizzes taken</span>
                <span className="v">{scored.length}<small> of {quizzes.length || 5}</small></span>
              </div>
              <div className="gd-stat">
                <span className="k">Lessons done</span>
                <span className="v">{doneLessons}<small> of {totalLessons || 30}</small></span>
              </div>
            </div>
          </div>
        )}

        {placementStarted && (
          <section className="gd-card" aria-label="Placement results">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <div>
                <h2 className="gd-h2">Placement test</h2>
                <p className="gd-sub">{placementDone ? `Overall ${placementOverall} out of 100, level ${levelFor(placementOverall)}` : 'Your scores appear here as each part is marked.'}</p>
              </div>
              <button type="button" className="gd-btn" onClick={() => navigate('/placement-test')}>Open placement test</button>
            </div>
            <div className="gd-parts">
              {placementRows.map(r => (
                <div key={r.skill} className="gd-part">
                  <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>{r.short}</span>
                  <span style={{ fontSize: 24, fontWeight: 600 }}>
                    {r.result.state === 'done' ? r.result.score : r.result.state === 'marking' ? '…' : '–'}
                    {r.result.state === 'done' && <span style={{ fontSize: 13, color: T.muted, fontWeight: 400 }}> / 100</span>}
                  </span>
                  <span style={{ fontSize: 13, color: r.result.state === 'done' ? T.primary : T.muted, fontWeight: 600 }}>
                    {r.result.state === 'done' ? `Level ${levelFor(r.result.score)}` : r.result.state === 'marking' ? 'Being marked' : r.result.state === 'failed' ? 'Ask your teacher' : 'Not taken'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="gd-grid">
          <section className="gd-card" aria-label="Quiz scores">
            <h2 className="gd-h2">Weekly quizzes</h2>
            <p className="gd-sub" style={{ marginBottom: 12 }}>One quiz at the end of each week. Your overall score is the average of your latest score on each quiz.</p>
            {loading ? <p style={{ color: T.muted }}>Loading…</p> : quizzes.length === 0 ? (
              <p style={{ color: T.muted }}>Quizzes will appear here when your teacher adds them.</p>
            ) : quizzes.map(q => {
              const rt = ratingFor(q.score);
              return (
                <div key={q.paper.id} className="gd-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{q.paper.title}</div>
                    <div style={{ fontSize: 13, color: T.muted }}>{q.tries ? `${q.tries} attempt${q.tries > 1 ? 's' : ''}` : 'Not taken yet'}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {q.score == null ? '–' : q.score}<span style={{ fontSize: 13, color: T.muted, fontWeight: 400 }}>{q.score == null ? '' : ' / 100'}</span>
                  </div>
                  <div className="gd-hide">
                    <span style={{ fontSize: 13, fontWeight: 600, padding: '2px 10px', borderRadius: 50, background: rt.soft, color: rt.color, whiteSpace: 'nowrap' }}>{rt.label}</span>
                  </div>
                  <div className="gd-hide" style={{ textAlign: 'right' }}>
                    {q.latest
                      ? <button type="button" className="gd-btn" onClick={() => navigate(`/exam/${q.latest.id}/results`)}>Review</button>
                      : <button type="button" className="gd-btn primary" onClick={() => navigate('/practice')}>Take quiz</button>}
                  </div>
                </div>
              );
            })}
          </section>

          <aside style={{ display: 'grid', gap: 16 }}>
            <section className="gd-card" aria-label="Lessons">
              <h2 className="gd-h2">Lessons</h2>
              <p className="gd-sub" style={{ marginBottom: 14 }}>{doneLessons} of {totalLessons || 30} daily lessons finished</p>
              <div className="gd-bar" aria-hidden="true"><span style={{ width: `${totalLessons ? (doneLessons / totalLessons) * 100 : 0}%` }} /></div>
              <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                {modules.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                    <span>{m.title}</span>
                    <span style={{ color: T.muted, fontVariantNumeric: 'tabular-nums' }}>{m.completedLessons}/{m.totalLessons}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="gd-btn primary" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/learn')}>Open lessons</button>
            </section>

            <section className="gd-card" aria-label="How scores work">
              <h2 className="gd-h2" style={{ fontSize: 16 }}>How your score works</h2>
              <div style={{ marginTop: 8 }}>
                {[85, 70, 50, 0].map(min => {
                  const rt = ratingFor(min);
                  const range = min === 85 ? '85 to 100' : min === 70 ? '70 to 84' : min === 50 ? '50 to 69' : '0 to 49';
                  return (
                    <div key={min} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', fontSize: 14, borderTop: min === 85 ? 0 : `1px solid ${T.hairline}` }}>
                      <span style={{ fontWeight: 600, color: rt.color }}>{rt.label}</span>
                      <span style={{ color: T.muted, fontVariantNumeric: 'tabular-nums' }}>{range}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </main>
      <AgentWidget />
    </div>
  );
}
