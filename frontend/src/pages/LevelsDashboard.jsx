import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const SKILL = {
  reading:   { bg: '#f0f6ff', color: '#0048b0', border: '#c9dcfb', icon: '📖', label: 'Reading' },
  writing:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✍️', label: 'Writing' },
  listening: { bg: '#f0f6ff', color: '#003b8f', border: '#c9dcfb', icon: '🎧', label: 'Listening' },
  speaking:  { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', icon: '🎤', label: 'Speaking' },
};

const LEVEL_COLORS = ['#0048b0', '#003b8f', '#0891b2', '#16a34a', '#dc2626'];

export default function LevelsDashboard() {
  const [levels, setLevels] = useState([]);
  const [myLevels, setMyLevels] = useState({ hasFullAccess: false, purchasedLevels: [], placementDone: false });
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(1);
  const [starting, setStarting] = useState(null);
  const [buying, setBuying] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/levels`, auth()),
      axios.get(`${API_URL}/api/payments/my-levels`, auth()),
    ]).then(([lvlRes, myRes]) => {
      setLevels(lvlRes.data);
      setMyLevels(myRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleBuyLevel = async (levelNumber) => {
    setBuying(levelNumber);
    try {
      const res = await axios.post(
        `${API_URL}/api/payments/create-level-checkout`,
        { levelNumber },
        auth()
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed to start. Please try again.');
    }
    setBuying(null);
  };

  const startPaper = async (paper) => {
    setStarting(paper.id);
    try {
      const res = await axios.post(`${API_URL}/api/attempts`, { paperId: paper.id }, auth());
      const attemptId = res.data.id || res.data.attemptId;
      navigate(`/exam/${attemptId}/greeting`);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/levels');
      } else {
        alert('Failed to start. Please try again.');
      }
    }
    setStarting(null);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Source Sans Pro, sans-serif', background: '#f7f9fc' }}>
      <StudentNav active="levels" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
          <div style={{ color: '#5b6780', fontSize: 15 }}>Loading your programme...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc', fontFamily: 'Source Sans Pro, sans-serif' }}>

      <StudentNav active="levels" />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f1114', margin: '0 0 6px' }}>My Programme</h1>
          <p style={{ color: '#5b6780', fontSize: 14, margin: 0 }}>5 levels · 15 sections · up to 60 full mock tests · all 4 skills</p>
        </div>

        {/* Full Access banner — shown only if not yet full access */}
        {!myLevels.hasFullAccess && (
          <div style={{ background: 'linear-gradient(135deg, #0f1114 0%, #0056d2 60%, #003b8f 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>🎯 Full Access — All 5 Levels</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>15 complete mock tests · All 4 skills · AI marking</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'line-through' }}>LKR 10,000 separately</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>LKR 10,000</div>
              <button
                onClick={() => handleBuyLevel(99)}
                disabled={buying === 99}
                style={{ padding: '12px 24px', background: 'white', color: '#0056d2', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: buying === 99 ? 'not-allowed' : 'pointer', opacity: buying === 99 ? 0.7 : 1 }}>
                {buying === 99 ? 'Loading...' : 'Get Full Access →'}
              </button>
            </div>
          </div>
        )}

        {/* Placement test nudge */}
        {!myLevels.placementDone && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#15803d' }}>
              🎯 <strong>Not sure where to start?</strong> Take the free placement test to find your level.
            </div>
            <button
              onClick={() => navigate('/placement-test')}
              style={{ padding: '8px 18px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
              Free Placement Test →
            </button>
          </div>
        )}

        {/* Level cards */}
        {levels.map((level, lIdx) => {
          const color = LEVEL_COLORS[lIdx] || '#0048b0';
          const isExpanded = expandedLevel === level.levelNumber;
          const isUnlocked = myLevels.hasFullAccess || myLevels.purchasedLevels.includes(level.levelNumber);
          const totalPapers = level.sections.reduce((sum, s) => sum + Object.values(s.papers).filter(Boolean).length, 0);
          const maxPapers = level.sections.length * 4;
          const pct = Math.round((totalPapers / maxPapers) * 100);

          return (
            <div key={level.id} style={{ background: 'white', borderRadius: 16, marginBottom: 12, border: `2px solid ${isUnlocked ? color + '30' : '#dae1ed'}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

              {/* Level header */}
              <div
                onClick={() => setExpandedLevel(isExpanded ? null : level.levelNumber)}
                style={{ padding: '18px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, userSelect: 'none' }}>

                <div style={{ width: 44, height: 44, borderRadius: '50%', background: isUnlocked ? `${color}15` : '#e8eef7', border: `2px solid ${isUnlocked ? color : '#dae1ed'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: isUnlocked ? color : '#8495b0', flexShrink: 0 }}>
                  {isUnlocked ? level.levelNumber : '🔒'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0f1114' }}>Level {level.levelNumber} — {level.title}</span>
                    <span style={{ background: `${color}15`, color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>Band {level.targetBand}</span>
                    {isUnlocked && <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>✓ Unlocked</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#5b6780', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{level.description}</p>
                </div>

                {/* Price / buy button OR progress */}
                {isUnlocked ? (
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#8495b0', marginBottom: 4 }}>{totalPapers}/{maxPapers} available</div>
                    <div style={{ width: 100, height: 5, background: '#e8eef7', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f1114' }}>LKR 2,000</div>
                      <div style={{ fontSize: 11, color: '#8495b0' }}>3 mock tests</div>
                    </div>
                    <button
                      onClick={() => handleBuyLevel(level.levelNumber)}
                      disabled={buying === level.levelNumber}
                      style={{ padding: '10px 18px', background: color, color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: buying === level.levelNumber ? 'not-allowed' : 'pointer', opacity: buying === level.levelNumber ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                      {buying === level.levelNumber ? '...' : `Buy Level ${level.levelNumber}`}
                    </button>
                  </div>
                )}

                <div style={{ color: '#8495b0', fontSize: 14, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</div>
              </div>

              {/* Sections */}
              {isExpanded && (
                <div style={{ padding: '4px 20px 20px', borderTop: '1px solid #e8eef7' }}>
                  {isUnlocked ? (
                    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                      {level.sections.map(section => {
                        const available = Object.values(section.papers).filter(Boolean).length;
                        return (
                          <div key={section.id} style={{ background: '#f7f9fc', borderRadius: 12, padding: '14px 16px', border: '1px solid #dae1ed' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 700, color: '#0f1114', fontSize: 14 }}>Section {section.sectionNumber}</span>
                                {section.isComplete && <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>✓ Complete</span>}
                              </div>
                              <span style={{ fontSize: 11, color: '#8495b0' }}>{available}/4 available</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                              {['reading', 'writing', 'listening', 'speaking'].map(skill => {
                                const paper = section.papers[skill];
                                const s = SKILL[skill];
                                const isStarting = starting === paper?.id;
                                return (
                                  <div key={skill} style={{ background: paper ? s.bg : '#e8eef7', border: `1px solid ${paper ? s.border : '#dae1ed'}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center', opacity: paper ? 1 : 0.55 }}>
                                    <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: paper ? s.color : '#8495b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{s.label}</div>
                                    {paper ? (
                                      <button
                                        onClick={() => startPaper(paper)}
                                        disabled={isStarting}
                                        style={{ width: '100%', padding: '6px 4px', background: isStarting ? '#8495b0' : s.color, color: 'white', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: isStarting ? 'not-allowed' : 'pointer' }}>
                                        {isStarting ? '...' : 'Start'}
                                      </button>
                                    ) : (
                                      <div style={{ fontSize: 10, color: '#8495b0', fontStyle: 'italic', padding: '5px 0' }}>Coming Soon</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ margin: '16px 0', padding: '24px', textAlign: 'center', background: '#f7f9fc', borderRadius: 12, border: '1px dashed #dae1ed' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                      <p style={{ color: '#5b6780', fontSize: 14, margin: '0 0 16px' }}>
                        Purchase Level {level.levelNumber} to unlock 3 complete mock tests (Reading, Writing, Listening &amp; Speaking).
                      </p>
                      <button
                        onClick={() => handleBuyLevel(level.levelNumber)}
                        disabled={buying === level.levelNumber}
                        style={{ padding: '12px 28px', background: color, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        {buying === level.levelNumber ? 'Loading...' : `Buy Level ${level.levelNumber} — LKR 2,000`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {levels.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8495b0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <p>Programme not available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
