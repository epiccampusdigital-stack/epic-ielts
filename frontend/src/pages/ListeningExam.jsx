import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function ListeningExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [answers, setAnswers] = useState({});
  const [activeSIdx, setActiveSIdx] = useState(0);
  const [playedSections, setPlayedSections] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const autosaveRef = useRef(null);

  const questionMap = useMemo(() => {
    const map = {};
    if (!paper) return map;
    (paper.sections || []).forEach(section => {
      (section.groups || []).forEach(group => {
        (group.questions || []).forEach(q => {
          map[q.questionNumber] = q;
        });
      });
    });
    return map;
  }, [paper]);

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return API_URL + (url.startsWith('/') ? '' : '/') + url;
  };

  const sortByNumber = (questions) =>
    (questions || []).slice().sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));

  useEffect(() => {
    axios.get(`${API_URL}/api/attempts/${attemptId}`, api())
      .then(r => {
        setPaper(r.data.paper);
        const existingAnswers = {};
        (r.data.answers || []).forEach(a => { existingAnswers[a.questionId] = a.studentAnswer; });
        setAnswers(existingAnswers);
        setTimeLeft((r.data.paper?.timeLimitMin || 30) * 60);
      });
  }, [attemptId]);

  useEffect(() => {
    if (timeLeft === null) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    autosaveRef.current = setInterval(saveAnswers, 30000);
    timerRef.current = id;
    return () => { clearInterval(id); clearInterval(autosaveRef.current); };
  }, [timeLeft === null]);

  const saveAnswers = async () => {
    const payload = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId), studentAnswer: String(answer)
    }));
    if (payload.length > 0) {
      try { await axios.put(`${API_URL}/api/attempts/${attemptId}/autosave`, { answers: payload }, api()); }
      catch (e) { console.error('Autosave failed'); }
    }
  };

  const handleEnd = async (auto = false) => {
    if (!auto) {
      if (!window.confirm("Are you sure you want to submit your listening test?")) return;
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

  const startAudio = () => {
    const section = paper.sections[activeSIdx];
    if (playedSections[section.id] && !paper.practiceMode) return;
    if (audioRef.current) {
      const audioUrl = section.audioUrl || paper.audioUrl || null;
      if (audioUrl) audioRef.current.src = getFullUrl(audioUrl);
      audioRef.current.play();
      setPlayedSections(prev => ({ ...prev, [section.id]: true }));
    }
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (!paper) return <div style={{padding:'40px',textAlign:'center'}}>Loading...</div>;

  const sections = paper.sections || [];
  const currentSection = sections[activeSIdx] || { groups: [] };

  const allSectionQs = (currentSection.groups || []).flatMap(g => g.questions || []);
  const minQ = allSectionQs.length ? Math.min(...allSectionQs.map(q => q.questionNumber || 0)) : '?';
  const maxQ = allSectionQs.length ? Math.max(...allSectionQs.map(q => q.questionNumber || 0)) : '?';

  const renderTable = (tableData) => {
    if (!tableData) return null;
    return (
      <div style={{ overflowX: 'auto', margin: '20px 0', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {(tableData.headers || []).map((h, i) => (
                <th key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(tableData.rows || []).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '12px', border: '1px solid #e2e8f0' }}>
                    {cell.blank ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: '#4f46e5' }}>{cell.questionNumber}</span>
                        {(() => {
                          const q = questionMap[cell.questionNumber];
                          return q
                            ? <input className="listen-input" value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                            : <span style={{color:'#ef4444'}}>Q{cell.questionNumber} missing</span>;
                        })()}
                      </div>
                    ) : (
                      <span style={{ color: '#1e293b' }}>{cell.text}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', background: '#f8fafc', overflow: 'hidden' }}>
      <style>{`
        .listen-input { width: 100%; border: none; border-bottom: 2px solid #cbd5e1; padding: 6px 2px; font-size: 14px; color: #1e293b; background: transparent; outline: none; transition: border-color 0.2s; }
        .listen-input:focus { border-bottom-color: #4f46e5; }
        .choice-btn { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; margin-bottom: 8px; width: 100%; text-align: left; }
        .choice-btn.selected { border-color: #4f46e5; background: #f5f3ff; }
      `}</style>

      {showInstructions && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 48, maxWidth: 600, width: '90%', textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', marginBottom: 16 }}>IELTS Listening Test</h2>
            <div style={{ textAlign: 'left', background: '#f1f5f9', padding: 24, borderRadius: 16, marginBottom: 32 }}>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: '#475569', lineHeight: 1.8 }}>
                <li>There are 4 sections. Audio plays <b>ONCE ONLY</b> (unless Practice Mode).</li>
                <li>Answer questions as you listen.</li>
                <li>10 minutes transfer time included in the total timer.</li>
              </ul>
            </div>
            <button onClick={() => setShowInstructions(false)} style={{ padding: '18px 48px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 800, cursor: 'pointer' }}>Start Exam</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#fff', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo.png" style={{ height: 32 }} alt="EPIC" />
          <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b' }}>{paper.paperCode}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>TIME LEFT</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: timeLeft < 300 ? '#ef4444' : '#1e293b', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
          </div>
          <button onClick={() => handleEnd(false)} disabled={submitting} style={{ padding: '12px 28px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
            {submitting ? 'Submitting...' : 'Finish Test'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '380px', borderRight: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 32, flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginBottom: 24 }}>Sections</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {sections.map((s, idx) => {
                const sQs = (s.groups || []).flatMap(g => g.questions || []);
                const sMin = sQs.length ? Math.min(...sQs.map(q => q.questionNumber || 0)) : '?';
                const sMax = sQs.length ? Math.max(...sQs.map(q => q.questionNumber || 0)) : '?';
                return (
                  <button key={s.id} onClick={() => setActiveSIdx(idx)} style={{ padding: '16px 20px', borderRadius: 12, border: '1.5px solid', borderColor: activeSIdx === idx ? '#4f46e5' : '#e2e8f0', background: activeSIdx === idx ? '#f5f3ff' : '#fff', color: activeSIdx === idx ? '#4f46e5' : '#64748b', fontWeight: 800, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div>Section {s.number}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, marginTop: 2 }}>Q{sMin}–{sMax}</div>
                    </div>
                    {playedSections[s.id] && <span>✅</span>}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 40, background: '#f1f5f9', borderRadius: 20, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 12 }}>AUDIO CONTROL</div>
              {(() => {
                const audioUrl = currentSection.audioUrl || paper.audioUrl || null;
                if (!audioUrl) return <div style={{ fontSize: 12, color: '#94a3b8' }}>No audio file attached</div>;
                return (
                  <>
                    <audio ref={audioRef} src={getFullUrl(audioUrl)} onEnded={() => {}} controls={paper.practiceMode} style={{ width: '100%', marginBottom: 12 }} />
                    {!paper.practiceMode && (
                      playedSections[currentSection.id] ? (
                        <div style={{ fontSize: 12, color: '#166534', fontWeight: 800 }}>✅ Played Once</div>
                      ) : (
                        <button onClick={startAudio} style={{ width: '100%', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>▶ Play Audio</button>
                      )
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '48px 64px', background: '#fff' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', marginBottom: 8 }}>
              Section {currentSection.number}
              <span style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginLeft: 12 }}>
                Questions {minQ}–{maxQ}
              </span>
            </h1>
            {currentSection.description && (
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 40, lineHeight: 1.6 }}>{currentSection.description}</p>
            )}

            {sortByNumber((currentSection.groups || []).flatMap(g => [])).length === 0 && (
              <div style={{ marginBottom: 40 }} />
            )}

            {(currentSection.groups || []).map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: 48 }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #4f46e5', padding: 20, borderRadius: '4px 16px 16px 4px', marginBottom: 24 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 4, whiteSpace: 'pre-wrap' }}>{group.instruction}</div>
                  {group.wordLimit && <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>Write: {group.wordLimit}</div>}
                </div>

                {group.imageUrl && (
                  <img src={getFullUrl(group.imageUrl)} style={{ maxWidth: '100%', borderRadius: 16, marginBottom: 24, border: '1px solid #e2e8f0' }} alt="Question diagram" />
                )}

                {group.groupType === 'TABLE_COMPLETION' && renderTable(group.tableData)}

                <div style={{ display: 'grid', gap: 24 }}>
                  {sortByNumber(group.questions || []).map(q => {
                    const inTable = group.groupType === 'TABLE_COMPLETION' &&
                      JSON.stringify(group.tableData || {}).includes(`"questionNumber":${q.questionNumber}`);
                    if (inTable) return null;

                    return (
                      <div key={q.id} style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: answers[q.id] ? '#4f46e5' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: answers[q.id] ? '#fff' : '#475569', flexShrink: 0, transition: 'all 0.2s' }}>
                          {q.questionNumber}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, color: '#1e293b', lineHeight: 1.6, marginBottom: 12 }}>{q.content}</div>
                          {(q.questionType === 'MULTIPLE_CHOICE' ||
                            q.questionType === 'Multiple Choice' ||
                            q.groupType === 'MULTIPLE_CHOICE' ||
                            q.type === 'MULTIPLE_CHOICE' ||
                            (q.options && (typeof q.options === 'string'
                              ? JSON.parse(q.options)
                              : q.options).length > 0)
                          ) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                              {(typeof q.options === 'string'
                                ? JSON.parse(q.options)
                                : (q.options || [])
                              ).filter(opt => opt && String(opt).trim() !== '')
                               .map((opt, i) => {
                                const optLetter = String(opt).trim().match(/^([A-D])\./)?.[1] || opt;
                                const selected = answers[q.id] === optLetter || answers[q.id] === opt;
                                return (
                                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: selected ? '#f5f3ff' : '#fff', border: `1.5px solid ${selected ? '#4f46e5' : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
                                    <input
                                      type="radio"
                                      name={`q${q.id}`}
                                      checked={selected}
                                      onChange={() => {
                                        const letter = String(opt).trim().match(/^([A-D])\./)?.[1] || opt;
                                        setAnswers({ ...answers, [q.id]: letter });
                                      }}
                                      style={{ accentColor: '#4f46e5', flexShrink: 0 }}
                                    />
                                    <span style={{ fontSize: 14, fontWeight: selected ? 700 : 500, color: selected ? '#4f46e5' : '#475569', lineHeight: 1.4 }}>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <input
                              className="listen-input"
                              style={{ maxWidth: 300 }}
                              value={answers[q.id] || ''}
                              onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                              placeholder="Your answer..."
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigator Footer */}
      <div style={{ height: 64, background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {sections.map((s, idx) => {
          const sQs = (s.groups || []).flatMap(g => g.questions || []);
          const sMin = sQs.length ? Math.min(...sQs.map(q => q.questionNumber || 0)) : '?';
          const sMax = sQs.length ? Math.max(...sQs.map(q => q.questionNumber || 0)) : '?';
          return (
            <button key={s.id} onClick={() => setActiveSIdx(idx)} style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: activeSIdx === idx ? '#1e293b' : '#f1f5f9', color: activeSIdx === idx ? '#fff' : '#64748b', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              Section {s.number}
              <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.7 }}>Q{sMin}–{sMax}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}