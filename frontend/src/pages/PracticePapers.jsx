import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const SKILL_META = {
  READING: {
    icon: '📖', color: '#1d4ed8',
    bg: '#eff6ff', border: '#bfdbfe', label: 'Reading'
  },
  WRITING: {
    icon: '✍️', color: '#16a34a',
    bg: '#f0fdf4', border: '#bbf7d0', label: 'Writing'
  },
  LISTENING: {
    icon: '🎧', color: '#7c3aed',
    bg: '#faf5ff', border: '#e9d5ff', label: 'Listening'
  },
  SPEAKING: {
    icon: '🎤', color: '#ea580c',
    bg: '#fff7ed', border: '#fed7aa', label: 'Speaking'
  },
};

const SKILL_ORDER = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];

function lastAttemptBand(lastAttempt, skill) {
  if (!lastAttempt) return null;
  if (skill === 'WRITING') {
    return lastAttempt.writingSubmission?.overallBand ?? null;
  }
  return lastAttempt.result?.bandEstimate ?? lastAttempt.result?.band ?? lastAttempt.result?.overallBand ?? null;
}

export default function PracticePapers() {
  const [papers, setPapers] = useState([]);
  const [myLevels, setMyLevels] = useState({
    hasFullAccess: false, isPaid: false
  });
  const [history, setHistory] = useState([]);
  const [starting, setStarting] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [papersRes, levelsRes, historyRes] = await Promise.all([
          axios.get(`${API_URL}/api/papers/assigned`, api()),
          axios.get(`${API_URL}/api/payments/my-levels`, api()),
          axios.get(`${API_URL}/api/attempts/history/mine`, api()),
        ]);
        setPapers(Array.isArray(papersRes.data) ? papersRes.data : []);
        setMyLevels(levelsRes.data || {});
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      } catch (err) {
        console.error(err.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const startPaper = async (paperId) => {
    setStarting(paperId);
    try {
      const res = await axios.post(
        `${API_URL}/api/attempts`, { paperId }, api()
      );
      const attemptId = res.data.id || res.data.attemptId;
      navigate(`/exam/${attemptId}/greeting`);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/upgrade');
      } else {
        alert('Failed to start. Please try again.');
      }
    }
    setStarting(null);
  };

  const handleBuyFullAccess = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/payments/create-level-checkout`,
        { levelNumber: 99 },
        api()
      );
      window.location.href = res.data.url;
    } catch {
      alert('Payment failed. Please try again.');
    }
  };

  const isUnlocked = (paper) => {
    if (paper.paperCode === '001') return true;
    if (myLevels.hasFullAccess || myLevels.isPaid) return true;
    return false;
  };

  const getLastAttempt = (paperId) => {
    return history.find(
      a => a.paperId === paperId && a.status === 'COMPLETED'
    );
  };

  const getBandColor = (band) => {
    if (!band) return '#94a3b8';
    if (band >= 7) return '#16a34a';
    if (band >= 5.5) return '#d97706';
    return '#dc2626';
  };

  const grouped = {};
  SKILL_ORDER.forEach(skill => {
    grouped[skill] = papers
      .filter(p => p.testType === skill)
      .sort((a, b) => (a.paperCode || '').localeCompare(b.paperCode || ''));
  });

  const isFullyUnlocked = myLevels.hasFullAccess || myLevels.isPaid;

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', background: '#f8fafc'
    }}>
      <div style={{ color: '#64748b' }}>Loading papers...</div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Inter, sans-serif'
    }}>
      <style>{`
        .paper-card:hover {
          border-color: var(--skill-color) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .paper-card { transition: all 0.15s ease; }
        .btn-start:hover { opacity: 0.88; }
        .btn-start { transition: opacity 0.15s; }
      `}</style>

      {/* Header */}
      <div style={{
        background: '#1e293b',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer', fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              padding: 0, display: 'flex',
              alignItems: 'center', gap: 6
            }}>
            ← Dashboard
          </button>
          <div style={{
            width: 1, height: 18,
            background: 'rgba(255,255,255,0.12)'
          }} />
          <span style={{
            color: 'white', fontWeight: 800, fontSize: 15
          }}>
            📝 Practice Papers
          </span>
        </div>

        {!isFullyUnlocked && (
          <button
            type="button"
            className="btn-start"
            onClick={handleBuyFullAccess}
            style={{
              padding: '7px 16px',
              background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
              color: 'white', border: 'none',
              borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 700
            }}>
            🔓 Unlock All — LKR 10,000
          </button>
        )}
        {isFullyUnlocked && (
          <span style={{
            background: 'rgba(22,163,74,0.2)',
            color: '#4ade80', borderRadius: 20,
            padding: '4px 12px', fontSize: 12, fontWeight: 700
          }}>
            ✅ Full Access
          </span>
        )}
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 20px' }}>

        {/* Unlock banner for locked students */}
        {!isFullyUnlocked && (
          <div style={{
            background: 'linear-gradient(135deg,#1e293b,#1d4ed8)',
            borderRadius: 14, padding: '20px 24px',
            marginBottom: 30,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white'
          }}>
            <div>
              <div style={{
                fontWeight: 800, fontSize: 15, marginBottom: 4
              }}>
                🔓 Unlock All Practice Papers
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.65)', fontSize: 13
              }}>
                Get unlimited access to all Reading, Writing,
                Listening and Speaking papers · AI marked
              </div>
            </div>
            <div style={{ flexShrink: 0, marginLeft: 20, textAlign: 'right' }}>
              <div style={{
                fontSize: 20, fontWeight: 900, marginBottom: 8
              }}>
                LKR 10,000
              </div>
              <button
                type="button"
                className="btn-start"
                onClick={handleBuyFullAccess}
                style={{
                  padding: '8px 20px',
                  background: 'white',
                  color: '#1d4ed8', border: 'none',
                  borderRadius: 8, fontWeight: 800,
                  fontSize: 13, cursor: 'pointer'
                }}>
                Buy Now →
              </button>
            </div>
          </div>
        )}

        {/* Papers by skill */}
        {SKILL_ORDER.map(skill => {
          const meta = SKILL_META[skill];
          const skillPapers = grouped[skill] || [];
          if (skillPapers.length === 0) return null;

          return (
            <div key={skill} style={{ marginBottom: 36 }}>

              {/* Skill header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 10, marginBottom: 14
              }}>
                <span style={{ fontSize: 20 }}>{meta.icon}</span>
                <h2 style={{
                  margin: 0, fontSize: 17,
                  fontWeight: 800, color: '#0f172a'
                }}>
                  {meta.label}
                </h2>
                <span style={{
                  background: meta.bg, color: meta.color,
                  border: `1px solid ${meta.border}`,
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 11, fontWeight: 700
                }}>
                  {skillPapers.length} paper{skillPapers.length !== 1 ? 's' : ''}
                </span>
                {!isFullyUnlocked && (
                  <span style={{
                    color: '#94a3b8', fontSize: 12,
                    marginLeft: 4
                  }}>
                    · Paper 001 free
                  </span>
                )}
              </div>

              {/* Paper grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 12
              }}>
                {skillPapers.map(paper => {
                  const unlocked = isUnlocked(paper);
                  const free = paper.paperCode === '001';
                  const isStarting = starting === paper.id;
                  const lastAttempt = getLastAttempt(paper.id);
                  const band = lastAttemptBand(lastAttempt, skill);

                  return (
                    <div
                      key={paper.id}
                      className="paper-card"
                      style={{
                        '--skill-color': meta.color,
                        background: 'white',
                        borderRadius: 13,
                        padding: '18px 16px',
                        border: `1.5px solid ${unlocked ? meta.border : '#e2e8f0'}`,
                        position: 'relative',
                        opacity: unlocked ? 1 : 0.72
                      }}>

                      {/* Badges */}
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '65%'
                      }}>
                        {free && (
                          <span style={{
                            background: '#16a34a', color: 'white',
                            borderRadius: 20, padding: '2px 7px',
                            fontSize: 9, fontWeight: 800,
                            letterSpacing: '0.04em'
                          }}>
                            FREE
                          </span>
                        )}
                        {!unlocked && (
                          <span style={{ fontSize: 13 }}>🔒</span>
                        )}
                        {band != null && band !== '' && (
                          <span style={{
                            background: '#f8fafc',
                            color: getBandColor(Number(band)),
                            border: `1px solid ${getBandColor(Number(band))}40`,
                            borderRadius: 20, padding: '2px 7px',
                            fontSize: 10, fontWeight: 800
                          }}>
                            {Number(band).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div style={{
                        fontSize: 11,
                        color: meta.color,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 6,
                        paddingRight: 40
                      }}>
                        {meta.label} {paper.paperCode}
                      </div>

                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: '#1e293b', marginBottom: 4,
                        paddingRight: 40, lineHeight: 1.4
                      }}>
                        {paper.title || `${meta.label} Paper ${paper.paperCode}`}
                      </div>

                      <div style={{
                        fontSize: 11, color: '#94a3b8', marginBottom: 14
                      }}>
                        {paper.timeLimitMin || 60} min
                        {lastAttempt && ` · Done ${new Date(lastAttempt.endedAt || lastAttempt.startedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </div>

                      {unlocked ? (
                        <button
                          type="button"
                          className="btn-start"
                          onClick={() => startPaper(paper.id)}
                          disabled={isStarting}
                          style={{
                            width: '100%', padding: '8px',
                            background: meta.color,
                            color: 'white', border: 'none',
                            borderRadius: 8, fontSize: 12,
                            fontWeight: 700,
                            cursor: isStarting ? 'wait' : 'pointer',
                            opacity: isStarting ? 0.7 : 1
                          }}>
                          {isStarting
                            ? 'Starting...'
                            : lastAttempt
                              ? 'Retake →'
                              : 'Start →'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-start"
                          onClick={handleBuyFullAccess}
                          style={{
                            width: '100%', padding: '8px',
                            background: '#f1f5f9',
                            color: '#64748b', border: 'none',
                            borderRadius: 8, fontSize: 11,
                            fontWeight: 600, cursor: 'pointer'
                          }}>
                          Unlock All — LKR 10,000
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
