import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function ListeningExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const autosaveRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/attempts/${attemptId}`, api())
      .then(r => {
        setAttempt(r.data);
        setPaper(r.data.paper);
        setQuestions(r.data.paper?.questions || []);
        const mins = r.data.paper?.timeLimitMin || 40;
        const started = new Date(r.data.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setTimeLeft(Math.max(0, mins * 60 - elapsed));
      });
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleEnd(true); return 0; }
        return t - 1;
      });
    }, 1000);
    autosaveRef.current = setInterval(saveAnswers, 30000);
    return () => { clearInterval(timerRef.current); clearInterval(autosaveRef.current); };
  }, [timeLeft !== null]);

  const saveAnswers = async () => {
    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId), studentAnswer: String(answer)
    }));
    if (payload.length > 0) {
      try {
        await axios.put(`${API_URL}/api/attempts/${attemptId}/autosave`, { answers: payload }, api());
      } catch (e) { console.error('Autosave failed'); }
    }
  };

  const startAudio = () => {
    setShowWarning(false);
    setAudioStarted(true);
    setAudioPlayed(true);
    if (audioRef.current) audioRef.current.play();
  };

  const handleEnd = async (auto = false) => {
    if (!auto) {
      const confirmed = window.confirm(`Submit listening test? You have answered ${Object.keys(answers).length} of ${questions.length} questions.`);
      if (!confirmed) return;
    }
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(autosaveRef.current);
    await saveAnswers();
    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId), studentAnswer: String(answer)
    }));
    try {
      await axios.post(`${API_URL}/api/attempts/${attemptId}/end`, { answers: payload }, api());
      navigate(`/exam/${attemptId}/results`);
    } catch {
      alert('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (!paper) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b' }}>Loading listening exam...</p>
      </div>
    </div>
  );

  const audioUrl = paper.audioUrl ? `${API_URL}${paper.audioUrl}` : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', background: '#f0f7ff', overflow: 'hidden' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .listen-input { width: 100%; border: none; border-bottom: 2px solid #dbeafe; padding: 8px 4px; font-size: 14px; font-family: Inter,sans-serif; color: #1e293b; background: transparent; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .listen-input:focus { border-bottom-color: #2563eb; }
        .choice-btn { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1.5px solid #dbeafe; border-radius: 10px; background: #ffffff; cursor: pointer; margin-bottom: 8px; width: 100%; font-family: Inter,sans-serif; text-align: left; transition: all 0.15s; }
        .choice-btn:hover { border-color: #2563eb; background: #eff6ff; }
        .choice-btn.selected { border-color: #2563eb; background: #eff6ff; }
      `}</style>

      {/* Warning overlay */}
      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: 20, padding: 44, maxWidth: 500, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎧</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1e3a5f', marginBottom: 12, fontSize: 24 }}>
              Listening Test Instructions
            </h2>
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: 18, marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: '#92400e', fontWeight: 700, marginBottom: 10 }}>⚠️ Important Rules:</p>
              <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: '#78350f', lineHeight: 2 }}>
                <li>The audio will play <strong>once only</strong> — you can pause but not replay from beginning</li>
                <li>Put on your headphones <strong>before</strong> clicking start</li>
                <li>Answer questions <strong>while listening</strong></li>
                <li>You have extra time after audio ends to review answers</li>
                <li>Your answers save automatically every 30 seconds</li>
              </ul>
            </div>
            <button onClick={startAudio}
              style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}>
              🎧 Start Listening Now
            </button>
            <p style={{ marginTop: 16, fontSize: 12, color: '#94a3b8' }}>Make sure your volume is turned up</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo.png" alt="EPIC" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }}>EPIC IELTS — Listening {paper.paperCode}</div>
            <div style={{ color: '#93c5fd', fontSize: 11 }}>{paper.title}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {audioStarted && !audioEnded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 20, padding: '4px 14px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
              <span style={{ color: '#fca5a5', fontSize: 12, fontWeight: 600 }}>LIVE</span>
            </div>
          )}
          {audioEnded && (
            <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 20, padding: '4px 14px', color: '#6ee7b7', fontSize: 12, fontWeight: 600 }}>
              ✓ Audio Complete
            </div>
          )}
          <div style={{ background: timeLeft < 300 ? '#dc2626' : timeLeft < 600 ? '#d97706' : 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '7px 18px', borderRadius: 8, fontWeight: 700, fontSize: 18, minWidth: 90, textAlign: 'center' }}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '38% 62%', overflow: 'hidden' }}>

        {/* Left — Audio player */}
        <div style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
          <div style={{ fontSize: 72 }}>🎧</div>
          <h3 style={{ color: '#ffffff', fontFamily: 'Playfair Display, serif', textAlign: 'center', margin: 0, fontSize: 20 }}>
            {!audioStarted ? 'Ready to begin' : audioEnded ? 'Audio Complete' : 'Now Playing...'}
          </h3>

          {audioUrl ? (
            <audio
              ref={audioRef}
              onEnded={() => setAudioEnded(true)}
              onPlay={() => setAudioStarted(true)}
              style={{ width: '100%', borderRadius: 12, marginTop: 8 }}
              controlsList="nodownload nofullscreen"
              onContextMenu={e => e.preventDefault()}
            >
              <source src={audioUrl} />
            </audio>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, textAlign: 'center', width: '100%' }}>
              <p style={{ color: '#fcd34d', fontSize: 14, margin: 0 }}>⚠️ No audio file uploaded for this paper.</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8 }}>Contact your teacher.</p>
            </div>
          )}

          {audioStarted && !audioEnded && (
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, width: '100%', textAlign: 'center' }}>
              <p style={{ color: '#93c5fd', fontSize: 13, margin: 0, fontWeight: 600 }}>
                Answer the questions while listening →
              </p>
            </div>
          )}

          {audioEnded && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: 16, width: '100%', textAlign: 'center' }}>
              <p style={{ color: '#6ee7b7', fontSize: 13, margin: 0, fontWeight: 600 }}>
                Audio finished. Review your answers then click Submit.
              </p>
            </div>
          )}

          {/* Progress */}
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Progress</span>
              <span style={{ color: '#93c5fd', fontSize: 11, fontWeight: 600 }}>{Object.keys(answers).length}/{questions.length} answered</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(Object.keys(answers).length/Math.max(questions.length,1))*100}%`, height: '100%', background: '#60a5fa', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Right — Questions */}
        <div style={{ overflowY: 'auto', padding: 28, background: '#ffffff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
            Answer all {questions.length} questions while you listen
          </p>

          {questions.sort((a, b) => a.questionNumber - b.questionNumber).map((q, idx) => (
            <div key={q.id} style={{ marginBottom: 28, paddingBottom: 24, borderBottom: idx < questions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: answers[q.id] ? '#2563eb' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: answers[q.id] ? '#ffffff' : '#64748b', flexShrink: 0, transition: 'all 0.2s' }}>
                  {q.questionNumber}
                </div>
                <p style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.6, fontWeight: 500, margin: 0, paddingTop: 5 }}>{q.content}</p>
              </div>

              {q.questionType === 'MULTIPLE_CHOICE' && q.options && (
                <div style={{ paddingLeft: 42 }}>
                  {(typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt, i) => (
                    <button key={i} className={`choice-btn ${answers[q.id] === opt ? 'selected' : ''}`}
                      onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${answers[q.id] === opt ? '#2563eb' : '#e2e8f0'}`, background: answers[q.id] === opt ? '#2563eb' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {answers[q.id] === opt && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff' }} />}
                      </div>
                      <span style={{ fontSize: 13, color: answers[q.id] === opt ? '#1d4ed8' : '#475569', fontWeight: answers[q.id] === opt ? 600 : 400 }}>{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {['SHORT_ANSWER', 'FORM_COMPLETION', 'NOTE_COMPLETION', 'SENTENCE_COMPLETION', 'SUMMARY_COMPLETION'].includes(q.questionType) && (
                <div style={{ paddingLeft: 42 }}>
                  <input className="listen-input" type="text"
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    placeholder="Write your answer here..." />
                </div>
              )}

              {q.questionType === 'TRUE_FALSE_NOT_GIVEN' && (
                <div style={{ display: 'flex', gap: 8, paddingLeft: 42 }}>
                  {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                    <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                      style={{ flex: 1, padding: '10px 8px', border: `1.5px solid ${answers[q.id] === opt ? '#2563eb' : '#e2e8f0'}`, borderRadius: 8, background: answers[q.id] === opt ? '#2563eb' : '#ffffff', color: answers[q.id] === opt ? '#ffffff' : '#475569', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#ffffff', borderTop: '1px solid #dbeafe', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {Object.keys(answers).length} of {questions.length} questions answered
        </span>
        <button onClick={() => handleEnd(false)} disabled={submitting}
          style={{ padding: '11px 32px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Submitting...' : '🔒 Submit Listening Test'}
        </button>
      </div>
    </div>
  );
}
