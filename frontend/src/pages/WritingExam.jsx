import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function WritingExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [paper, setPaper] = useState(null);
  const [task, setTask] = useState(1);
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return API_URL + (url.startsWith('/') ? '' : '/') + url;
  };
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    if (!attemptId) return;

    axios.get(`${API_URL}/api/attempts/${attemptId}`, api())
      .then(r => {
        setAttempt(r.data);
        setPaper(r.data.paper);
        const mins = r.data.paper?.timeLimitMin || 60;
        const started = new Date(r.data.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setTimeLeft(Math.max(0, mins * 60 - elapsed));
      })
      .catch(e => console.error('Paper fetch error:', e));

    axios.get(`${API_URL}/api/attempts/${attemptId}/writing/result`, api())
      .then(r => {
        if (r.data?.writingSubmission) {
          setTask1(r.data.writingSubmission.task1Response || '');
          setTask2(r.data.writingSubmission.task2Response || '');
        }
      })
      .catch(e => console.error('Submission fetch error:', e));

    // Also try checking common AI feedback endpoint
    axios.get(`${API_URL}/api/attempts/${attemptId}/ai-feedback`, api())
      .then(r => {
        if (r.data?.feedback) {
          setTask1(prev => prev || r.data.feedback.task1Response || '');
          setTask2(prev => prev || r.data.feedback.task2Response || '');
        }
      })
      .catch(() => {});
  }, [attemptId]);

  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]);

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const timerColor = timeLeft !== null
    ? timeLeft < 300 ? '#dc2626' : timeLeft < 600 ? '#d97706' : '#1e3a5f'
    : '#1e3a5f';

  const handleSubmit = async (auto = false) => {
    if (!auto) {
      if (task === 1) { setTask(2); return; }
      setShowConfirm(true);
      return;
    }
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      await axios.post(
        `${API_URL}/api/attempts/${attemptId}/writing/submit`,
        { task1Response: task1, task2Response: task2 },
        api()
      );
      navigate(`/exam/${attemptId}/writing-results`);
    } catch (err) {
      alert('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      await axios.post(
        `${API_URL}/api/attempts/${attemptId}/writing/submit`,
        { task1Response: task1, task2Response: task2 },
        api()
      );
      navigate(`/exam/${attemptId}/writing-results`);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Unknown error';
      alert('Failed to submit: ' + msg);
      setSubmitting(false);
    }
  };

  const writingTasks = paper?.writingTasks || [];
  const currentTask = writingTasks.find(t => t.taskNumber === task);
  const currentText = task === 1 ? task1 : task2;
  const setCurrentText = task === 1 ? setTask1 : setTask2;
  const minWords = currentTask?.minWords || (task === 1 ? 150 : 250);
  const wc = wordCount(currentText);
  const wcColor = wc >= minWords ? '#16a34a' : wc >= minWords * 0.8 ? '#d97706' : '#dc2626';

  const renderTable = (tableData) => {
    if (!tableData) return null;
    return (
      <div style={{ overflowX: 'auto', margin: '20px 0', border: '1px solid #dbeafe', borderRadius: '12px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f0f7ff' }}>
              {(tableData.headers || []).map((h, i) => <th key={i} style={{ padding: '10px', border: '1px solid #dbeafe', color: '#1e3a5f', fontWeight: '700' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {(tableData.rows || []).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '10px', border: '1px solid #dbeafe', color: '#334155' }}>
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!paper) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b' }}>Loading writing exam...</p>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', background: '#f0f7ff', overflow: 'hidden' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .writing-area {
          width: 100%;
          flex: 1;
          padding: 16px;
          font-size: 15px;
          font-family: 'Lora', Georgia, serif;
          line-height: 1.8;
          color: #1e293b;
          border: 1.5px solid #dbeafe;
          border-radius: 10px;
          resize: none;
          outline: none;
          background: #fafcff;
          transition: border-color 0.2s;
        }
        .writing-area:focus { border-color: #2563eb; background: #ffffff; }
        .task-tab { padding: 8px 20px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .nav-btn { padding: 10px 24px; border-radius: 9px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; border: none; }
        .exam-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        @media (min-width: 1024px) {
          .exam-layout {
            display: grid;
            grid-template-columns: 45% 55%;
          }
        }

        .passage-section {
          background: #fafcff;
          border-right: 1px solid #dbeafe;
          overflow-y: auto;
          padding: 20px;
          min-height: 35vh;
        }

        @media (min-width: 1024px) {
          .passage-section {
            padding: 28px;
            height: auto;
          }
        }

        .questions-section {
          background: #ffffff;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          min-height: 65vh;
        }

        @media (min-width: 1024px) {
          .questions-section {
            height: auto;
          }
        }

        .exam-header {
          background: linear-gradient(135deg, #1e3a5f, #1d4ed8);
          padding: 12px 16px;
          height: auto;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .exam-header {
            flex-direction: row;
            justify-content: space-between;
            height: 60px;
            padding: 0 24px;
            gap: 0;
          }
        }

        .mobile-hide {
          display: none !important;
        }

        @media (min-width: 768px) {
          .mobile-hide {
            display: block !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="exam-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo.png" alt="EPIC" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
          <div className="mobile-hide" style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }}>
              EPIC IELTS — Writing {paper.paperCode}
            </div>
            <div className="mobile-hide" style={{ color: '#93c5fd', fontSize: 11 }}>{paper.title}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Task tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 4 }}>
            {[1, 2].map(t => (
              <button key={t} className="task-tab"
                style={{ background: task === t ? '#ffffff' : 'transparent', color: task === t ? '#1e3a5f' : 'rgba(255,255,255,0.7)', padding: '6px 14px', fontSize: '11px' }}
                onClick={() => setTask(t)}>
                Task {t}
              </button>
            ))}
          </div>

          {/* Timer */}
          <div style={{
            background: timeLeft < 300 ? '#dc2626' : timeLeft < 600 ? '#d97706' : 'rgba(255,255,255,0.15)',
            color: '#ffffff', padding: '6px 16px', borderRadius: 8,
            fontWeight: 700, fontSize: 16, fontVariantNumeric: 'tabular-nums',
            minWidth: 80, textAlign: 'center',
            border: timeLeft < 300 ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent'
          }}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="exam-layout">

        {/* Left — Task prompt */}
        <div className="passage-section" style={{ background: '#fafcff', borderRight: '1px solid #dbeafe', overflowY: 'auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dbeafe', borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Writing Task {task}
            </span>
          </div>

          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
            You should spend about {task === 1 ? '20' : '40'} minutes on this task. Write at least {minWords} words.
          </p>

          {/* Task prompt */}
          <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.8, marginBottom: 20, fontWeight: 500 }}>
            {currentTask?.prompt || `Loading Task ${task} prompt...`}
          </div>

          {/* Chart for Task 1 */}
          {task === 1 && (
            <div style={{ background: '#ffffff', borderRadius: 14, padding: 20, border: '1px solid #dbeafe', marginTop: 16 }}>
              {currentTask?.chartImageUrl ? (
                <div style={{ marginBottom: '24px', animation: 'fadeIn 0.5s ease' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 12, textAlign: 'center' }}>
                    {currentTask?.chartDescription || "Figure 1: Task Visualization"}
                  </p>
                  <img 
                    src={getFullUrl(currentTask.chartImageUrl)} 
                    alt="Task Chart"
                    style={{ width: '100%', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                  />
                </div>
              ) : currentTask?.chartDescription ? (
                <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>🖼️ CHART DESCRIPTION</div>
                  <p style={{ fontSize: 14, color: '#475569', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                    "{currentTask.chartDescription}"
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {task === 2 && (
            <div style={{ background: '#eff6ff', borderRadius: 12, padding: 14, border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600, marginBottom: 6 }}>💡 Task 2 Tips</p>
              <ul style={{ paddingLeft: 16, margin: 0, fontSize: 11, color: '#1e40af', lineHeight: 1.6 }}>
                <li>Plan your essay before writing (5 minutes)</li>
                <li>Write an introduction, 2 body paragraphs, conclusion</li>
                <li>State your opinion clearly</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right — Writing area */}
        <div className="questions-section" style={{ display: 'flex', flexDirection: 'column', padding: 20, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
              Your Answer — Task {task}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: wcColor }}>
                {wc} / {minWords} words minimum
              </div>
              <div style={{
                width: 80, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, (wc / minWords) * 100)}%`,
                  height: '100%',
                  background: wcColor,
                  borderRadius: 3,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          </div>

          <textarea
            className="writing-area"
            value={currentText}
            onChange={e => setCurrentText(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            placeholder={`Write your Task ${task} response here...\n\nMinimum ${minWords} words required.`}
          />

          <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
            {task === 1
              ? 'Describe the chart: overview → key features → comparisons'
              : 'Structure: Introduction → View 1 → View 2 → Your opinion → Conclusion'}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: '#ffffff', borderTop: '1px solid #dbeafe', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div className="mobile-hide" style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            T1: <strong style={{ color: wordCount(task1) >= 150 ? '#16a34a' : '#dc2626' }}>{wordCount(task1)}</strong>
          </span>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            T2: <strong style={{ color: wordCount(task2) >= 250 ? '#16a34a' : '#dc2626' }}>{wordCount(task2)}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'flex-end' }}>
          {task === 2 && (
            <button className="nav-btn"
              onClick={() => setTask(1)}
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 16px', fontSize: '12px' }}>
              ← T1
            </button>
          )}

          {task === 1 ? (
            <button className="nav-btn"
              onClick={() => setTask(2)}
              style={{ background: '#2563eb', color: '#ffffff', padding: '8px 16px', fontSize: '12px' }}>
              Next Task →
            </button>
          ) : (
            <button className="nav-btn"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              style={{ background: '#dc2626', color: '#ffffff', padding: '8px 16px', fontSize: '12px' }}>
              {submitting ? '...' : 'Submit Exam'}
            </button>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: 20, padding: 36, maxWidth: 460, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1e3a5f', marginBottom: 8 }}>
              Submit Writing Test?
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              You are about to submit your writing test. This cannot be undone.
            </p>
            <div style={{ background: '#f0f7ff', borderRadius: 10, padding: 16, marginBottom: 24, border: '1px solid #dbeafe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Task 1</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: wordCount(task1) >= 150 ? '#16a34a' : '#dc2626' }}>
                  {wordCount(task1)} words {wordCount(task1) < 150 ? '⚠️ Under minimum' : '✅'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Task 2</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: wordCount(task2) >= 250 ? '#16a34a' : '#dc2626' }}>
                  {wordCount(task2)} words {wordCount(task2) < 250 ? '⚠️ Under minimum' : '✅'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                Go Back
              </button>
              <button onClick={confirmSubmit}
                style={{ flex: 2, padding: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
