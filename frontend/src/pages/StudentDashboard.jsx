import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function StudentDashboard() {
  const [history, setHistory] = useState([]);
  const [myLevels, setMyLevels] = useState({
    hasFullAccess: false,
    isPaid: false,
    purchasedLevels: [],
    placementDone: false,
    placementBand: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const load = async () => {
      try {
        const [historyRes, levelsRes] = await Promise.all([
          axios.get(`${API_URL}/api/attempts/history/mine`, api()),
          axios.get(`${API_URL}/api/payments/my-levels`, api()),
        ]);
        setHistory(
          Array.isArray(historyRes.data)
            ? historyRes.data
                .filter(a => a.status === 'COMPLETED')
                .slice(0, 5)
            : []
        );
        setMyLevels(levelsRes.data || {});
      } catch (err) {
        console.error('Dashboard load error:', err.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const getBandColor = (band) => {
    if (!band) return '#94a3b8';
    if (band >= 7) return '#16a34a';
    if (band >= 5.5) return '#d97706';
    return '#dc2626';
  };

  const SKILL_ICONS = {
    READING: '📖',
    WRITING: '✍️',
    LISTENING: '🎧',
    SPEAKING: '🎤',
  };

  const RESULT_ROUTES = {
    READING: 'results',
    WRITING: 'writing-results',
    LISTENING: 'results',
    SPEAKING: 'speaking-results',
  };

  const resolveAttemptBand = (attempt) => {
    const skill = attempt.paper?.testType || 'READING';
    if (skill === 'WRITING') {
      return attempt.writingSubmission?.overallBand ?? null;
    }
    return attempt.result?.bandEstimate ?? attempt.result?.band ?? attempt.result?.overallBand ?? null;
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: 'Inter, sans-serif'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #1d4ed8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px'
        }} />
        <div style={{ color: '#64748b', fontSize: 14 }}>
          Loading your dashboard...
        </div>
      </div>
    </div>
  );

  const isFullyUnlocked = myLevels.hasFullAccess || myLevels.isPaid;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Inter, sans-serif'
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-hover:hover {
          border-color: var(--hover-color) !important;
          box-shadow: 0 8px 32px var(--hover-shadow) !important;
          transform: translateY(-2px);
        }
        .card-hover { transition: all 0.2s ease; }
        .btn-hover:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-hover { transition: all 0.15s ease; }
        @media (max-width: 700px) {
          .dash-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: '#1e293b',
        padding: '0 32px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/logo.png"
            alt="EPIC IELTS"
            style={{ height: 28, filter: 'brightness(0) invert(1)', opacity: 0.9 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <span style={{
            color: 'white',
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: '0.02em'
          }}>
            EPIC IELTS
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            {user.name || 'Student'}
          </span>
          <button
            className="btn-hover"
            type="button"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/');
            }}
            style={{
              padding: '5px 14px',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600
            }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 20px' }}>

        {/* ── GREETING ── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 900,
            color: '#0f172a',
            margin: '0 0 6px'
          }}>
            Hello, {(user.name || 'Student').split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Choose how you want to practise your IELTS today.
          </p>
        </div>

        {/* ── TWO MAIN CARDS ── */}
        <div className="dash-two-col" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 18,
          marginBottom: 36
        }}>

          {/* CARD 1 — Practice Papers */}
          <div
            role="button"
            tabIndex={0}
            className="card-hover"
            onClick={() => navigate('/practice')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/practice'); }}
            style={{
              '--hover-color': '#1d4ed8',
              '--hover-shadow': 'rgba(29,78,216,0.12)',
              background: 'white',
              borderRadius: 18,
              padding: '28px 24px',
              border: '2px solid #e2e8f0',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}>
            {/* Top accent bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)'
            }} />

            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>

            <h2 style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#0f172a',
              margin: '0 0 8px'
            }}>
              Practice Papers
            </h2>

            <p style={{
              color: '#64748b',
              fontSize: 13,
              margin: '0 0 18px',
              lineHeight: 1.6
            }}>
              Practise individual Reading, Writing, Listening and
              Speaking papers. First paper of each skill is free.
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 20
            }}>
              {[
                { icon: '📖', label: 'Reading' },
                { icon: '✍️', label: 'Writing' },
                { icon: '🎧', label: 'Listening' },
                { icon: '🎤', label: 'Speaking' },
              ].map(s => (
                <span key={s.label} style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {s.icon} {s.label}
                </span>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                {isFullyUnlocked ? (
                  <span style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    borderRadius: 20,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 800
                  }}>
                    ✅ Full Access
                  </span>
                ) : (
                  <div>
                    <div style={{
                      fontSize: 10,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: 2
                    }}>
                      Unlock All
                    </div>
                    <div style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: '#0f172a'
                    }}>
                      LKR 10,000
                    </div>
                  </div>
                )}
              </div>
              <div style={{
                background: '#1d4ed8',
                color: 'white',
                borderRadius: 10,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 700
              }}>
                Open →
              </div>
            </div>
          </div>

          {/* CARD 2 — My Programme */}
          <div
            role="button"
            tabIndex={0}
            className="card-hover"
            onClick={() => navigate(myLevels.placementDone ? '/levels' : '/placement-test')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') navigate(myLevels.placementDone ? '/levels' : '/placement-test');
            }}
            style={{
              '--hover-color': '#7c3aed',
              '--hover-shadow': 'rgba(124,58,237,0.12)',
              background: 'white',
              borderRadius: 18,
              padding: '28px 24px',
              border: '2px solid #e2e8f0',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}>
            {/* Top accent bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)'
            }} />

            {/* FREE badge */}
            {!myLevels.placementDone && (
              <div style={{
                position: 'absolute', top: 14, right: 14,
                background: '#16a34a',
                color: 'white',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}>
                FREE TEST
              </div>
            )}

            <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>

            <h2 style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#0f172a',
              margin: '0 0 8px'
            }}>
              My Programme
            </h2>

            <p style={{
              color: '#64748b',
              fontSize: 13,
              margin: '0 0 18px',
              lineHeight: 1.6
            }}>
              {myLevels.placementDone
                ? `Your level: Band ${myLevels.placementBand != null ? myLevels.placementBand : '—'}. Continue your personalised IELTS programme.`
                : 'Take a free placement test across all 4 skills. Get your IELTS band score and a personalised study programme.'
              }
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 20
            }}>
              <span style={{
                background: '#f0fdf4', color: '#16a34a',
                borderRadius: 20, padding: '4px 10px',
                fontSize: 11, fontWeight: 700
              }}>
                ✅ Free Placement
              </span>
              <span style={{
                background: '#faf5ff', color: '#7c3aed',
                borderRadius: 20, padding: '4px 10px',
                fontSize: 11, fontWeight: 700
              }}>
                5 Levels
              </span>
              <span style={{
                background: '#fff7ed', color: '#ea580c',
                borderRadius: 20, padding: '4px 10px',
                fontSize: 11, fontWeight: 700
              }}>
                🤖 AI Marked
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  fontSize: 10,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 2
                }}>
                  Per Section
                </div>
                <div style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: '#0f172a'
                }}>
                  LKR 2,000
                </div>
              </div>
              <div style={{
                background: '#7c3aed',
                color: 'white',
                borderRadius: 10,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 700
              }}>
                {myLevels.placementDone ? 'Continue →' : 'Start Free →'}
              </div>
            </div>
          </div>
        </div>

        {/* ── RECENT RESULTS ── */}
        <div>
          <h2 style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 14px'
          }}>
            Recent Results
          </h2>

          {history.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: 14,
              padding: '32px',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🚀</div>
              <div style={{
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: 6,
                fontSize: 15
              }}>
                Ready to start?
              </div>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                Complete your first test to see your results here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {history.map((attempt) => {
                const skill = attempt.paper?.testType || 'READING';
                const band = resolveAttemptBand(attempt);
                const route = RESULT_ROUTES[skill] || 'results';
                return (
                  <div
                    key={attempt.id}
                    role="button"
                    tabIndex={0}
                    className="card-hover"
                    onClick={() => navigate(`/exam/${attempt.id}/${route}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/exam/${attempt.id}/${route}`);
                    }}
                    style={{
                      '--hover-color': '#e2e8f0',
                      '--hover-shadow': 'rgba(0,0,0,0.06)',
                      background: 'white',
                      borderRadius: 12,
                      padding: '13px 16px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer'
                    }}>
                    <div style={{ fontSize: 20, width: 32, textAlign: 'center' }}>
                      {SKILL_ICONS[skill] || '📄'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700,
                        color: '#1e293b',
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {attempt.paper?.title || skill}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        marginTop: 2
                      }}>
                        {new Date(
                          attempt.endedAt || attempt.startedAt
                        ).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                    {band != null && band !== '' && (
                      <div style={{
                        fontWeight: 900,
                        fontSize: 17,
                        color: getBandColor(Number(band)),
                        flexShrink: 0
                      }}>
                        Band {Number(band).toFixed(1)}
                      </div>
                    )}
                    <div style={{ color: '#cbd5e1', fontSize: 13 }}>→</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
