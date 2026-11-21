import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import { T } from '../theme';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const SKILL = { LISTENING: 'Listening', READING: 'Reading', WRITING: 'Writing' };
const card = { background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 20 };
const band = b => (b == null ? '—' : Number(b).toFixed(1));

// One sheet for a whole exam: overall band, each part's score and band, and every answer.
export default function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [onlyWrong, setOnlyWrong] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = () => axios.get(`${API_URL}/api/exams/${examId}/results`, api())
      .then(r => { if (!stop) setData(r.data); })
      .catch(e => { if (!stop) setError(e.response?.data?.error === 'RESULTS_HELD' ? 'Your results are not ready to see yet. Your teacher will share your scores and answers in class.' : 'Could not load your results. Please refresh the page.'); });
    load();
    // writing is marked by the computer a minute or two after submitting: check again until it is ready
    const t = setInterval(() => { if (!data || data.parts.some(p => p.testType === 'WRITING' && p.done && p.band == null)) load(); }, 20000);
    return () => { stop = true; clearInterval(t); };
  }, [examId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="root" style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <style>{'@page { size: A4; margin: 12mm; } @media print { .noprint, nav, .sn-row, .sn-mobile { display: none !important; } body, .root { background: #fff !important; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } tr { break-inside: avoid; } }'}</style>
      <div className="noprint"><StudentNav active="exams" /></div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 16px 64px', display: 'grid', gap: 16 }}>
        <div className="noprint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={() => navigate('/exams')} style={{ background: 'none', border: 0, color: T.primary, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>‹ Back to exams</button>
          {data && <button type="button" onClick={() => window.print()} style={{ height: 38, padding: '0 16px', borderRadius: 50, border: 0, background: T.primary, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>📄 Download PDF</button>}
        </div>
        {error && <div style={{ ...card, background: T.errorSoft, color: T.error }}>{error}</div>}
        {!data && !error && <div style={card}>Loading your results…</div>}
        {data && <>
          <div style={{ background: T.navy, color: '#fff', borderRadius: 16, padding: '22px 24px', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: '#b0e5fb' }}>RESULTS</div>
              <h1 style={{ margin: '4px 0 4px', fontSize: 28 }}>{data.exam.title}</h1>
              <div style={{ color: T.navyText, fontSize: 15 }}>{data.student}{data.totalQuestions ? ` · ${data.totalScore} of ${data.totalQuestions} questions correct (listening and reading)` : ''}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,.1)', borderRadius: 14, padding: '10px 22px' }}>
              <div style={{ fontSize: 13, color: '#b0e5fb', fontWeight: 700, letterSpacing: '.06em' }}>OVERALL BAND</div>
              <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>{data.overall ? band(data.overall.band) : '—'}</div>
              {data.overall && !data.overall.complete && <div style={{ fontSize: 12, color: T.navyText }}>Writing is still being marked</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {data.parts.map(p => (
              <div key={p.testType} style={{ ...card, padding: 16 }}>
                <div style={{ fontWeight: 700, color: T.muted, fontSize: 14 }}>{SKILL[p.testType] || p.testType}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.navy }}>{p.done ? band(p.band) : '—'}</div>
                <div style={{ color: T.muted, fontSize: 14 }}>
                  {!p.done ? 'Not done' : p.total ? `${p.score} / ${p.total} correct` : p.band == null ? 'Being marked (1–2 minutes)…' : `Task 1: ${band(p.task1Band)}${p.task2Band != null ? ` · Task 2: ${band(p.task2Band)}` : ''}`}
                </div>
              </div>
            ))}
          </div>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 15, cursor: 'pointer' }}>
            <input type="checkbox" checked={onlyWrong} onChange={e => setOnlyWrong(e.target.checked)} /> Show only the questions I got wrong
          </label>

          {data.parts.filter(p => p.done).map(p => (
            <div key={p.testType} style={{ ...card, display: 'grid', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22, color: T.navy }}>{SKILL[p.testType]} {p.total ? <span style={{ fontSize: 16, color: T.muted, fontWeight: 600 }}>· {p.score} / {p.total} · band {band(p.band)}</span> : null}</h2>
              {p.questions && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 560 }}>
                    <thead><tr style={{ textAlign: 'left', color: T.muted, fontSize: 13 }}>
                      <th style={{ padding: 8, width: 44 }}>Q</th><th style={{ padding: 8 }}>Question</th><th style={{ padding: 8 }}>Your answer</th><th style={{ padding: 8 }}>Correct answer</th>
                    </tr></thead>
                    <tbody>
                      {p.questions.filter(q => !onlyWrong || !q.isCorrect).map(q => (
                        <tr key={q.n} style={{ borderTop: `1px solid ${T.hairline}`, verticalAlign: 'top', background: q.isCorrect ? 'transparent' : '#fff8f8' }}>
                          <td style={{ padding: 8, fontWeight: 800 }}>{q.isCorrect ? <span style={{ color: T.success }}>✓ {q.n}</span> : <span style={{ color: T.error }}>✗ {q.n}</span>}</td>
                          <td style={{ padding: 8 }}>{q.question}{!q.isCorrect && q.why && <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{q.why}</div>}</td>
                          <td style={{ padding: 8, color: q.isCorrect ? T.success : T.error, fontWeight: 600 }}>{q.yours || <i style={{ color: T.mid }}>(no answer)</i>}</td>
                          <td style={{ padding: 8, fontWeight: 700 }}>{q.correct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {p.testType === 'WRITING' && (
                <div style={{ display: 'grid', gap: 10, fontSize: 15, lineHeight: 1.6 }}>
                  {p.band == null && <div style={{ color: T.muted }}>Your writing is being marked. This page updates by itself.</div>}
                  {p.tasks.map(t => (
                    <div key={t.taskNumber} style={{ background: '#f6f8fc', borderRadius: 10, padding: '10px 14px' }}>
                      <b>Task {t.taskNumber}</b>{t.words != null ? ` · ${t.words} words` : ''}{t.feedback && <div>{t.feedback}</div>}
                    </div>
                  ))}
                  {p.strengths.length > 0 && <div><b>Strengths:</b> {p.strengths.join(' ')}</div>}
                  {p.improvements.length > 0 && <div><b>To improve:</b> {p.improvements.join(' ')}</div>}
                  <button type="button" onClick={() => navigate(`/exam/${p.attemptId}/writing-results`)} style={{ justifySelf: 'start', height: 40, padding: '0 16px', borderRadius: 50, border: `1.5px solid ${T.primary}`, background: '#fff', color: T.primary, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Full writing feedback and model answers ›</button>
                </div>
              )}
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}
