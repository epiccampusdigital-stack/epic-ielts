import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function WritingResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/attempts/${attemptId}/writing/result`, api())
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [attemptId]);

  const pollAI = async () => {
    if (!attemptId) return;
    setFeedbackLoading(true);
    let attempts = 0;
    const maxAttempts = 30;

    const check = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/attempts/${attemptId}/writing/feedback`, api());
        if (res.data.status === 'ready' && res.data.feedback) {
          setFeedback(res.data.feedback);
          setFeedbackLoading(false);
          return true;
        }
        if (res.data.status === 'error' || res.data.markingStatus === 'FAILED') {
          setFeedbackLoading(false);
          return true;
        }
      } catch (err) {
        console.error('AI poll error:', err);
      }
      return false;
    };

    const interval = setInterval(async () => {
      const done = await check();
      attempts++;
      if (done || attempts >= maxAttempts) {
        clearInterval(interval);
        setFeedbackLoading(false);
      }
    }, 4000);

    await check();
  };

  useEffect(() => {
    pollAI();
  }, [attemptId]);

  const handleRetryAI = async () => {
    setFeedbackLoading(true);
    try {
      // Trigger fresh marking via the common AI feedback endpoint
      await axios.get(`${API_URL}/api/attempts/${attemptId}/ai-feedback`, api());
      pollAI();
    } catch (err) {
      console.error('Retry error:', err);
      setFeedbackLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b' }}>Loading results...</p>
      </div>
    </div>
  );

  const sub = data?.writingSubmission;
  const writingTasks = data?.paper?.writingTasks || [];
  const t1Band = sub?.task1Band || feedback?.task1?.band;
  const t2Band = sub?.task2Band || feedback?.task2?.band;
  const overall = sub?.overallBand || feedback?.overallBand ||
    (t1Band && t2Band ? ((t1Band * 0.34) + (t2Band * 0.66)).toFixed(1) : null);

  const getBandColor = (b) => {
    if (!b) return '#94a3b8';
    if (b >= 7) return '#16a34a';
    if (b >= 5.5) return '#d97706';
    return '#dc2626';
  };

  const CriterionBar = ({ label, score }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: getBandColor(score) }}>{score || '—'}</span>
      </div>
      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${((score || 0) / 9) * 100}%`, height: '100%', background: getBandColor(score), borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f7ff', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        
        .bands-grid { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
        @media (min-width: 768px) { .bands-grid { gap: 20px; } }
        
        .band-circle { width: 90px; height: 90px; border-radius: 50%; background: #ffffff; border: 4px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; animation: scaleIn 0.5s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .band-circle.large { width: 110px; height: 110px; border: 5px solid #e2e8f0; }
        @media (min-width: 768px) { 
          .band-circle { width: 110px; height: 110px; } 
          .band-circle.large { width: 140px; height: 140px; border: 6px solid #e2e8f0; }
        }
        
        .scores-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
        @media (min-width: 768px) { .scores-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; } }
        
        .score-card { background: white; border: 1px solid #dbeafe; border-radius: 16px; padding: 16px; text-align: center; }
        @media (min-width: 768px) { .score-card { padding: 20px 16px; } }
        
        .feedback-split { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 20px; }
        @media (min-width: 1024px) { .feedback-split { grid-template-columns: 1fr 1fr; } }
        
        .mobile-hide { display: none !important; }
        @media (min-width: 768px) { .mobile-hide { display: block !important; } }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)', padding: '32px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="mobile-hide" style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>EPIC IELTS Writing Test</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#ffffff', marginBottom: 6 }}>Writing Test Complete 🎉</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 24 }}>
          {data?.paper?.testType} {data?.paper?.paperCode} — {data?.paper?.title}
        </p>

        {/* Band scores */}
        <div className="bands-grid">
          {[
            { label: 'Task 1 Band', value: t1Band },
            { label: 'Overall Band', value: overall, large: true },
            { label: 'Task 2 Band', value: t2Band }
          ].map(({ label, value, large }) => (
            <div key={label} className={`band-circle ${large ? 'large' : ''}`}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: large ? 36 : 28, fontWeight: 700, color: getBandColor(value), lineHeight: 1 }}>
                {value ? Number(value).toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginTop: 2, textAlign: 'center', padding: '0 8px' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Score cards */}
        <div className="scores-grid">
          {[
            { label: 'Task 1 Words', value: sub?.task1WordCount || 0, icon: '📝', note: sub?.task1WordCount >= 150 ? '✅ Meets min' : '⚠️ Under 150' },
            { label: 'Task 2 Words', value: sub?.task2WordCount || 0, icon: '✍️', note: sub?.task2WordCount >= 250 ? '✅ Meets min' : '⚠️ Under 250' },
            { label: 'Overall Band', value: overall ? Number(overall).toFixed(1) : '—', icon: '⭐', note: 'AI Estimated' }
          ].map(({ label, value, icon, note }) => (
            <div key={label} className="score-card">
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{note}</div>
            </div>
          ))}
        </div>

        {/* AI Feedback */}
        {feedbackLoading ? (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #dbeafe', padding: 32, textAlign: 'center', marginBottom: 24, animation: 'fadeUp 0.4s ease' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width: 40, height: 40, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#2563eb', fontWeight: 600, marginBottom: 4 }}>EPIC AI is marking your writing...</p>
            <p style={{ color: '#64748b', fontSize: 13 }}>Analysing Task Achievement, Coherence, Vocabulary and Grammar. This takes 15-30 seconds.</p>
          </div>
        ) : feedback ? (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #bfdbfe', padding: 28, marginBottom: 24, animation: 'fadeUp 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #dbeafe' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🤖</div>
              <div>
                <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: 20, fontWeight: 800 }}>EPIC AI Writing Examiner</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Detailed IELTS Writing band analysis</p>
              </div>
            </div>

            {/* Final report */}
            {feedback.finalStudentReport && (
              <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 14, padding: 22, border: '1px solid #bfdbfe', marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, color: '#1d4ed8', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>📜 Examiner's Report</h3>
                <p style={{ lineHeight: 1.8, marginBottom: 0, color: '#1e3a5f', fontSize: 14 }}>{feedback.finalStudentReport}</p>
              </div>
            )}

            {/* Task 1 and Task 2 breakdown */}
            <div className="feedback-split">
              {[
                { label: 'Task 1 Analysis', taskData: feedback.task1, criteria: ['taskAchievement', 'coherenceCohesion', 'lexicalResource', 'grammaticalRange'], criteriaLabels: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range'] },
                { label: 'Task 2 Analysis', taskData: feedback.task2, criteria: ['taskResponse', 'coherenceCohesion', 'lexicalResource', 'grammaticalRange'], criteriaLabels: ['Task Response', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range'] }
              ].map(({ label, taskData, criteria, criteriaLabels }) => (
                <div key={label} style={{ background: '#f8faff', borderRadius: 14, padding: 20, border: '1px solid #dbeafe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{label}</h3>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: getBandColor(taskData?.band) }}>
                      {taskData?.band ? Number(taskData.band).toFixed(1) : '—'}
                    </span>
                  </div>
                  {criteria.map((key, i) => (
                    <CriterionBar key={key} label={criteriaLabels[i]} score={taskData?.[key]} />
                  ))}
                  {taskData?.feedback && (
                    <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginTop: 12, marginBottom: 0 }}>
                      {taskData.feedback}
                    </p>
                  )}

                  {taskData?.rewrittenExample && (
                    <div style={{ marginTop: 16, background: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '12px', borderRadius: '0 8px 8px 0' }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>Band 8 Rewrite Example</div>
                      <div style={{ fontSize: '12.5px', color: '#1e40af', fontStyle: 'italic' }}>"{taskData.rewrittenExample}"</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Grammar Mistakes (Task 2) */}
            {feedback.task2?.grammarMistakes?.length > 0 && (
              <div style={{ marginTop: 20, background: '#fef2f2', borderRadius: 14, padding: 20, border: '1px solid #fecaca' }}>
                <h3 style={{ marginTop: 0, color: '#991b1b', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔍 Grammar Correction</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #fecaca' }}>
                        <th style={{ textAlign: 'left', padding: '8px', color: '#b91c1c' }}>Your Text</th>
                        <th style={{ textAlign: 'left', padding: '8px', color: '#b91c1c' }}>Correction</th>
                        <th style={{ textAlign: 'left', padding: '8px', color: '#b91c1c' }}>Rule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.task2.grammarMistakes.map((m, i) => (
                        <tr key={i} style={{ borderBottom: i < feedback.task2.grammarMistakes.length - 1 ? '1px solid #fee2e2' : 'none' }}>
                          <td style={{ padding: '8px', color: '#dc2626', textDecoration: 'line-through' }}>{m.mistake}</td>
                          <td style={{ padding: '8px', color: '#16a34a', fontWeight: '600' }}>{m.correction}</td>
                          <td style={{ padding: '8px', color: '#7f1d1d', fontSize: '11px' }}>{m.rule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Vocabulary Upgrades */}
            {([...(feedback.task1?.vocabularyUpgrades || []), ...(feedback.task2?.vocabularyUpgrades || [])]).length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>💎 Vocabulary Upgrades</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {[...(feedback.task1?.vocabularyUpgrades || []), ...(feedback.task2?.vocabularyUpgrades || [])].map((v, i) => (
                    <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, textDecoration: 'line-through', color: '#64748b' }}>{v.original}</span>
                        <span style={{ color: '#2563eb' }}>→</span>
                        <span style={{ fontSize: 13, fontWeight: '700', color: '#1d4ed8' }}>{v.better}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                        "{v.example}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Tricks */}
            {([...(feedback.task1?.keyTricks || []), ...(feedback.task2?.keyTricks || [])]).length > 0 && (
              <div style={{ marginTop: 20, background: '#fdf2f8', borderRadius: 14, padding: 20, border: '1px solid #fbcfe8' }}>
                <h3 style={{ marginTop: 0, color: '#9d174d', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>💡 Key Examination Techniques</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {[...(feedback.task1?.keyTricks || []), ...(feedback.task2?.keyTricks || [])].map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ background: '#be185d', color: 'white', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: '700', flexShrink: 0, marginTop: 2 }}>{i+1}</div>
                      <div style={{ fontSize: 13, color: '#831843', lineHeight: 1.5 }}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress and Study Plan */}
            <div className="feedback-split" style={{ marginTop: 20 }}>
              <div style={{ background: '#eff6ff', borderRadius: 14, padding: 20, border: '1px solid #bfdbfe' }}>
                <h3 style={{ marginTop: 0, color: '#1e40af', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📊 Progress to Target</h3>
                <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, fontSize: 13, color: '#1e3a5f', lineHeight: 1.6, border: '1px solid #dbeafe' }}>
                  {feedback.progressToTarget}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 20, border: '1px solid #bbf7d0' }}>
                <h3 style={{ marginTop: 0, color: '#166534', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🗓️ Weekly Study Action Plan</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {(feedback.studyPlan || []).map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="checkbox" checked={false} readOnly style={{ width: 16, height: 16, borderRadius: 4, cursor: 'not-allowed' }} />
                      <span style={{ fontSize: 13, color: '#14532d' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths and improvements */}
            <div className="feedback-split" style={{ marginTop: 20 }}>
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 18, border: '1px solid #bbf7d0' }}>
                <h3 style={{ marginTop: 0, color: '#166534', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>✅ Strengths</h3>
                <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
                  {[...(feedback.task1?.strengths || []), ...(feedback.task2?.strengths || [])].slice(0, 4).map((s, i) => (
                    <li key={i} style={{ color: '#14532d', fontSize: 13 }}>{s}</li>
                  ))}
                </ul>
              </div>
              <div style={{ background: '#fff7ed', borderRadius: 12, padding: 18, border: '1px solid #ffedd5' }}>
                <h3 style={{ marginTop: 0, color: '#9a3412', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🎯 Areas to Improve</h3>
                <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
                  {[...(feedback.task1?.improvements || []), ...(feedback.task2?.improvements || [])].slice(0, 4).map((s, i) => (
                    <li key={i} style={{ color: '#7c2d12', fontSize: 13 }}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #dbeafe', padding: 32, textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
            <p style={{ color: '#64748b', marginBottom: 16, fontSize: 15 }}>AI feedback could not be generated at this moment.</p>
            <button 
              onClick={handleRetryAI}
              style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              Retry AI Analysis
            </button>
          </div>
        )}

        {/* Student responses */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #dbeafe', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #dbeafe', background: '#f8faff' }}>
            <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: 18, fontWeight: 800 }}>Your Responses</h2>
          </div>
          {[
            { taskNum: 1, response: sub?.task1Response, wordCount: sub?.task1WordCount, prompt: writingTasks.find(t => t.taskNumber === 1)?.prompt },
            { taskNum: 2, response: sub?.task2Response, wordCount: sub?.task2WordCount, prompt: writingTasks.find(t => t.taskNumber === 2)?.prompt }
          ].map(({ taskNum, response, wordCount, prompt }) => (
            <div key={taskNum} style={{ padding: 24, borderBottom: taskNum === 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>Task {taskNum}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{wordCount || 0} words</span>
              </div>
              {prompt && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, fontStyle: 'italic', lineHeight: 1.6 }}>{prompt.substring(0, 150)}...</p>}
              <div style={{ background: '#f8faff', borderRadius: 10, padding: 16, border: '1px solid #dbeafe', fontSize: 14, lineHeight: 1.8, color: '#1e293b', whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
                {response || '(No response submitted)'}
              </div>
            </div>
          ))}
        </div>

        {/* Back button */}
        <div style={{ textAlign: 'center', paddingBottom: 40 }}>
          <button onClick={() => navigate('/student/dashboard')}
            style={{ padding: '13px 32px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
