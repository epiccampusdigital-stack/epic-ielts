import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import AgentWidget from '../components/AgentWidget';

// General English has no IELTS band. Students get a score out of 100 for each quiz,
// and an overall score: the average of their latest score on every quiz they have taken.

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const C = {
  navy: '#1A1A2E', navyDeep: '#12122A', indigo: '#4F46E5', indigoSoft: '#EEF2FF', gold: '#F59E0B',
  bg: '#F8FAFC', card: '#FFFFFF', line: '#E2E8F0', text: '#1A1A2E', sub: '#475569', faint: '#64748B',
};

// Rating words for a score out of 100 (shown with the number, never instead of it)
function ratingFor(score) {
  if (score == null) return { label: 'No score yet', color: C.faint, soft: '#F1F5F9' };
  if (score >= 85) return { label: 'Excellent', color: '#047857', soft: '#ECFDF5' };
  if (score >= 70) return { label: 'Good', color: C.indigo, soft: C.indigoSoft };
  if (score >= 50) return { label: 'Developing', color: '#B45309', soft: '#FFFBEB' };
  return { label: 'Needs more practice', color: '#B42318', soft: '#FEF3F2' };
}

function percent(attempt) {
  const raw = attempt?.result?.rawScore;
  const total = attempt?.paper?._count?.questions;
  if (raw == null || !total) return null;
  return Math.round((raw / total) * 100);
}

function ScoreRing({ score }) {
  const r = 54, c = 2 * Math.PI * r;
  const v = score == null ? 0 : Math.max(0, Math.min(100, score));
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={score == null ? 'No overall score yet' : `Overall score ${score} out of 100`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#ge-ring)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 70 70)" />
      <defs>
        <linearGradient id="ge-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCD34D" /><stop offset="100%" stopColor={C.gold} />
        </linearGradient>
      </defs>
      <text x="70" y="76" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="38" fontWeight="700" fill="#FFFFFF">
        {score == null ? '–' : score}
      </text>
      <text x="70" y="98" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="12" fill="#CBD5E1">out of 100</text>
    </svg>
  );
}

export default function GeneralDashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [papers, setPapers] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const firstName = (user.name || 'Student').split(' ')[0];

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API_URL}/api/attempts/history/mine?track=GENERAL`, api()),
      axios.get(`${API_URL}/api/papers/assigned?track=GENERAL`, api()),
      axios.get(`${API_URL}/api/learn/modules?track=GENERAL`, api()),
    ]).then(([h, p, m]) => {
      if (h.status === 'fulfilled' && Array.isArray(h.value.data)) setHistory(h.value.data);
      if (p.status === 'fulfilled' && Array.isArray(p.value.data)) setPapers(p.value.data);
      if (m.status === 'fulfilled' && Array.isArray(m.value.data)) setModules(m.value.data);
      setLoading(false);
    });
  }, []);

  // Latest completed attempt per quiz
  const quizzes = useMemo(() => {
    const done = history.filter(a => a.status === 'COMPLETED' || a.endedAt);
    return papers.map(p => {
      const attempts = done.filter(a => a.paperId === p.id || (a.paper?.paperCode === p.paperCode && a.paper?.testType === p.testType));
      attempts.sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt));
      const latest = attempts[0] || null;
      return { paper: p, latest, score: latest ? percent(latest) : null, tries: attempts.length };
    });
  }, [history, papers]);

  const scored = quizzes.filter(q => q.score != null);
  const overall = scored.length ? Math.round(scored.reduce((s, q) => s + q.score, 0) / scored.length) : null;
  const rating = ratingFor(overall);
  const totalLessons = modules.reduce((s, m) => s + (m.totalLessons || 0), 0);
  const doneLessons = modules.reduce((s, m) => s + (m.completedLessons || 0), 0);
  const nextLesson = (() => {
    for (const m of modules) for (const l of m.lessons || []) if (!l.isCompleted) return { m, l };
    return null;
  })();
  const nextQuiz = quizzes.find(q => q.score == null);

  return (
    <div className="ge" style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, system-ui, sans-serif', color: C.text }}>
      <style>{`
        .ge-wrap { max-width: 1100px; margin: 0 auto; padding: 32px max(24px, env(safe-area-inset-right, 0px)) 96px max(24px, env(safe-area-inset-left, 0px)); display: grid; gap: 24px; }
        .ge-hero { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 32px; align-items: center; padding: 32px 36px; border-radius: 16px; color: #fff;
          background: radial-gradient(520px 260px at 0% 0%, rgba(79,70,229,0.55), transparent 70%), radial-gradient(420px 240px at 100% 100%, rgba(245,158,11,0.18), transparent 70%), linear-gradient(160deg, ${C.navy}, ${C.navyDeep});
          box-shadow: 0 20px 50px rgba(26,26,46,0.18); }
        .ge-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 24px; align-items: start; }
        .ge-card { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 14px; padding: 24px; }
        .ge-row { display: grid; grid-template-columns: minmax(0, 1fr) 96px 150px 124px; gap: 12px; align-items: center; padding: 14px 0; border-top: 1px solid ${C.line}; }
        .ge-btn { font: inherit; font-size: 14px; font-weight: 600; white-space: nowrap; border-radius: 8px; padding: 9px 14px; cursor: pointer; border: 1px solid ${C.line}; background: #fff; color: ${C.text}; }
        .ge-btn.primary { background: ${C.indigo}; border-color: ${C.indigo}; color: #fff; }
        .ge-btn.gold { background: ${C.gold}; border-color: ${C.gold}; color: ${C.navy}; }
        .ge-bar { height: 8px; border-radius: 999px; background: #EEF2F7; overflow: hidden; }
        .ge-bar > span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, ${C.indigo}, #8B5CF6); }
        @media (max-width: 860px) {
          .ge-hero { grid-template-columns: 1fr; justify-items: start; padding: 26px 22px; }
          .ge-grid { grid-template-columns: 1fr; }
          .ge-row { grid-template-columns: minmax(0, 1fr) auto; }
          .ge-row .ge-hide { display: none; }
        }
      `}</style>
      <StudentNav active="dashboard" />

      <main className="ge-wrap">
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32 }}>Hello, {firstName}</h1>
          <p style={{ margin: '6px 0 0', color: C.sub }}>Your General English progress. Scores are out of 100.</p>
        </div>

        <section className="ge-hero" aria-label="Overall score">
          <ScoreRing score={overall} />
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 14, color: '#CBD5E1', fontWeight: 600 }}>Overall score</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700 }}>
                {overall == null ? 'Take your first quiz' : rating.label}
              </span>
            </div>
            <p style={{ margin: 0, color: '#CBD5E1', fontSize: 14, lineHeight: 1.6, maxWidth: 520 }}>
              {overall == null
                ? 'Your overall score appears after your first weekly quiz.'
                : `Average of your latest score on each quiz you have taken (${scored.length} of ${quizzes.length || 5}).`}
            </p>
          </div>
          <div style={{ display: 'grid', gap: 10, justifyItems: 'stretch', minWidth: 200 }}>
            {nextLesson && (
              <button type="button" className="ge-btn gold" onClick={() => navigate(`/learn/${nextLesson.m.id}/${nextLesson.l.id}`)}>
                Continue: {nextLesson.l.title.split(':')[0]}
              </button>
            )}
            {nextQuiz && (
              <button type="button" className="ge-btn" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', borderColor: 'rgba(255,255,255,0.28)' }} onClick={() => navigate('/practice')}>
                Next quiz: {nextQuiz.paper.title.split(':')[0]}
              </button>
            )}
          </div>
        </section>

        <div className="ge-grid">
          <section className="ge-card" aria-label="Quiz scores">
            <h2 style={{ margin: '0 0 4px', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22 }}>Quiz scores</h2>
            <p style={{ margin: '0 0 12px', color: C.sub, fontSize: 14 }}>One quiz at the end of each week, marked out of 100.</p>
            {loading ? <p style={{ color: C.faint }}>Loading…</p> : quizzes.length === 0 ? (
              <p style={{ color: C.faint }}>Quizzes will appear here when your teacher adds them.</p>
            ) : quizzes.map(q => {
              const rt = ratingFor(q.score);
              return (
                <div key={q.paper.id} className="ge-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{q.paper.title}</div>
                    <div style={{ fontSize: 13, color: C.faint }}>{q.tries ? `${q.tries} attempt${q.tries > 1 ? 's' : ''}` : 'Not taken yet'}</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {q.score == null ? '–' : q.score}<span style={{ fontSize: 13, color: C.faint, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>{q.score == null ? '' : ' / 100'}</span>
                  </div>
                  <div className="ge-hide">
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: rt.soft, color: rt.color, whiteSpace: 'nowrap' }}>{rt.label}</span>
                  </div>
                  <div className="ge-hide" style={{ textAlign: 'right' }}>
                    {q.latest
                      ? <button type="button" className="ge-btn" onClick={() => navigate(`/exam/${q.latest.id}/results`)}>See answers</button>
                      : <button type="button" className="ge-btn primary" onClick={() => navigate('/practice')}>Take quiz</button>}
                  </div>
                </div>
              );
            })}
          </section>

          <aside style={{ display: 'grid', gap: 24 }}>
            <section className="ge-card" aria-label="Lessons">
              <h2 style={{ margin: '0 0 4px', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22 }}>Lessons</h2>
              <p style={{ margin: '0 0 14px', color: C.sub, fontSize: 14 }}>{doneLessons} of {totalLessons || 30} daily lessons finished</p>
              <div className="ge-bar" aria-hidden="true"><span style={{ width: `${totalLessons ? (doneLessons / totalLessons) * 100 : 0}%` }} /></div>
              <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                {modules.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                    <span style={{ color: C.text }}>{m.title.split(':')[0]}</span>
                    <span style={{ color: C.faint, fontVariantNumeric: 'tabular-nums' }}>{m.completedLessons}/{m.totalLessons}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="ge-btn primary" style={{ width: '100%', marginTop: 18 }} onClick={() => navigate('/learn')}>Open lessons</button>
            </section>

            <section className="ge-card" aria-label="How scores work">
              <h2 style={{ margin: '0 0 10px', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18 }}>How your score works</h2>
              {[85, 70, 50, 0].map(min => {
                const rt = ratingFor(min);
                const range = min === 85 ? '85 to 100' : min === 70 ? '70 to 84' : min === 50 ? '50 to 69' : '0 to 49';
                return (
                  <div key={min} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: rt.color }}>{rt.label}</span>
                    <span style={{ color: C.faint, fontVariantNumeric: 'tabular-nums' }}>{range}</span>
                  </div>
                );
              })}
            </section>
          </aside>
        </div>
      </main>
      <AgentWidget />
    </div>
  );
}
