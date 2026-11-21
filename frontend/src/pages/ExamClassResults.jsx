// Teachers: the whole class's results for one exam, ready to save as a PDF (browser "Save as PDF").
// A summary table first, then each student's full answer sheet on its own page.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { T } from '../theme';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const SKILL = { LISTENING: 'Listening', READING: 'Reading', WRITING: 'Writing' };
const band = b => (b == null ? '—' : Number(b).toFixed(1));
const th = { textAlign: 'left', padding: '7px 8px', background: '#eef3fb', borderBottom: `1px solid ${T.hairline}`, fontSize: 12.5 };
const td = { padding: '4px 8px', borderBottom: `1px solid ${T.hairline}`, fontSize: 13, verticalAlign: 'top' };

const CSS = `
@page { size: A4; margin: 12mm; }
@media print {
  .noprint { display: none !important; }
  body { background: #fff !important; }
  .sheet { break-before: page; border: 0 !important; padding: 0 !important; }
  .wrap { padding: 0 !important; max-width: none !important; }
  tr { break-inside: avoid; }
  .root { background: #fff !important; }
  .part-head { break-after: avoid; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;

function partCell(p) {
  if (!p || !p.done) return <span style={{ color: T.mid }}>not done</span>;
  if (p.testType === 'WRITING') return <><b>{band(p.band)}</b>{p.band == null ? <span style={{ color: T.mid }}> (marking)</span> : <span style={{ color: T.muted }}> · T1 {band(p.task1Band)} · T2 {band(p.task2Band)}</span>}</>;
  return <><b>{p.score}/{p.total}</b> <span style={{ color: T.muted }}>· band {band(p.band)}</span></>;
}

export default function ExamClassResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [who, setWho] = useState('all');
  const [answers, setAnswers] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/exams/${examId}/class`, api())
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Could not load the results.'));
  }, [examId]);

  const types = useMemo(() => (data?.sheets?.[0]?.parts || []).map(p => p.testType), [data]);
  const shown = useMemo(() => (data?.sheets || []).filter(s => who === 'all' || String(s.studentId) === who), [data, who]);
  const today = new Date().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="root" style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <style>{CSS}</style>
      <div className="wrap" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 64px', display: 'grid', gap: 16 }}>
        <div className="noprint" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 0, color: T.primary, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
          <span style={{ flex: 1 }} />
          {data && <>
            <select value={who} onChange={e => setWho(e.target.value)} style={{ height: 40, borderRadius: 8, border: `1px solid ${T.hairline}`, padding: '0 10px', fontFamily: 'inherit', fontSize: 14 }}>
              <option value="all">All students ({data.sheets.length})</option>
              {data.sheets.map(s => <option key={s.studentId} value={String(s.studentId)}>{s.student}</option>)}
            </select>
            <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={answers} onChange={e => setAnswers(e.target.checked)} /> Include every answer
            </label>
            <button type="button" onClick={() => window.print()} style={{ height: 40, padding: '0 18px', borderRadius: 8, border: 0, background: T.primary, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>📄 Download PDF</button>
          </>}
        </div>
        {data && <div className="noprint" style={{ fontSize: 13, color: T.muted }}>In the print window, choose <b>Save as PDF</b> as the printer. {data.released ? 'Students can see these results.' : 'These results are still hidden from students.'}</div>}
        {error && <div style={{ background: T.errorSoft, color: T.error, borderRadius: 12, padding: 16 }}>{error}</div>}
        {!data && !error && <div>Loading results…</div>}

        {data && <>
          {/* Summary */}
          <div style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', color: T.primary }}>EPIC CAMPUS · RESULTS SHEET</div>
            <h1 style={{ margin: '4px 0 2px', fontSize: 24 }}>{data.exam.title}</h1>
            <div style={{ color: T.muted, fontSize: 14, marginBottom: 14 }}>{shown.length} student{shown.length === 1 ? '' : 's'} · printed {today}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>#</th><th style={th}>Student</th>{types.map(t => <th key={t} style={th}>{SKILL[t] || t}</th>)}<th style={th}>Overall band</th></tr></thead>
              <tbody>
                {shown.map((s, i) => (
                  <tr key={s.studentId}>
                    <td style={td}>{i + 1}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{s.student}</td>
                    {types.map(t => <td key={t} style={td}>{partCell(s.parts.find(p => p.testType === t))}</td>)}
                    <td style={{ ...td, fontWeight: 800, fontSize: 15, color: T.primary }}>{band(s.overall?.band)}{s.overall && !s.overall.complete && <span style={{ fontSize: 11, color: T.mid, fontWeight: 600 }}> (so far)</span>}</td>
                  </tr>
                ))}
                {!shown.length && <tr><td style={td} colSpan={types.length + 3}>Nobody has finished this exam yet.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* One page per student */}
          {answers && shown.map(s => (
            <div key={s.studentId} className="sheet" style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 14, padding: 20, display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', borderBottom: `2px solid ${T.navy}`, paddingBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', color: T.primary }}>{data.exam.title.toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{s.student}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: T.muted }}>Overall band</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: T.primary, lineHeight: 1 }}>{band(s.overall?.band)}</div>
                  {s.totalQuestions > 0 && <div style={{ fontSize: 12, color: T.muted }}>{s.totalScore}/{s.totalQuestions} questions right</div>}
                </div>
              </div>
              {s.parts.map(p => (
                <div key={p.testType} className="part">
                  <div className="part-head" style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{SKILL[p.testType] || p.testType} <span style={{ fontWeight: 600, color: T.muted, fontSize: 14 }}>· {partCell(p)}</span></div>
                  {p.done && p.questions && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr><th style={{ ...th, width: 34 }}>Q</th><th style={th}>Student's answer</th><th style={th}>Correct answer</th></tr></thead>
                      <tbody>{p.questions.map(q => (
                        <tr key={q.n}>
                          <td style={{ ...td, fontWeight: 800, color: q.isCorrect ? T.success : T.error }}>{q.isCorrect ? '✓' : '✗'} {q.n}</td>
                          <td style={{ ...td, color: q.isCorrect ? T.success : T.error }}>{q.yours || <i style={{ color: T.mid }}>(no answer)</i>}</td>
                          <td style={td}>{q.correct}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                  {p.done && p.testType === 'WRITING' && (
                    <div style={{ display: 'grid', gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
                      {(p.tasks || []).map(t => <div key={t.taskNumber}><b>Task {t.taskNumber}</b> ({t.words ?? '?'} words){t.feedback ? `: ${t.feedback}` : ''}</div>)}
                      {p.strengths?.length > 0 && <div><b>Strengths:</b> {p.strengths.join(' · ')}</div>}
                      {p.improvements?.length > 0 && <div><b>To improve:</b> {p.improvements.join(' · ')}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}
