import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const SKILL = {
  reading:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '📖', label: 'Reading' },
  writing:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✍️', label: 'Writing' },
  listening: { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff', icon: '🎧', label: 'Listening' },
  speaking:  { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', icon: '🎤', label: 'Speaking' },
};

const LEVEL_COLORS = ['#1d4ed8', '#7c3aed', '#0891b2', '#16a34a', '#dc2626'];

export default function LevelsDashboard() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(1);
  const [starting, setStarting] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    axios.get(`${API_URL}/api/levels`, auth())
      .then(r => { setLevels(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const startPaper = async (paper) => {
    setStarting(paper.id);
    try {
      const res = await axios.post(`${API_URL}/api/attempts`, { paperId: paper.id }, auth());
      const attemptId = res.data.id || res.data.attemptId;
      navigate(`/exam/${attemptId}/greeting`);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error === 'PAYMENT_REQUIRED') {
        navigate('/upgrade');
      } else {
        alert('Failed to start. Please try again.');
      }
    }
    setStarting(null);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
        <div style={{ color: '#64748b', fontSize: 15 }}>Loading your programme...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <div style={{ background: '#1e293b', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white' }}>E</div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 15, lineHeight: 1 }}>EPIC IELTS</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>Learning Programme</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{user.name}</span>
          <button
            onClick={() => navigate('/student/dashboard')}
            style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            ← Dashboard
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1e293b', margin: '0 0 6px' }}>Your IELTS Programme</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>5 levels · 15 sections · up to 60 full mock tests · all 4 skills</p>
        </div>

        {/* Level cards */}
        {levels.map((level, lIdx) => {
          const color = LEVEL_COLORS[lIdx] || '#1d4ed8';
          const isExpanded = expandedLevel === level.levelNumber;
          const totalPapers = level.sections.reduce((sum, s) => sum + Object.values(s.papers).filter(Boolean).length, 0);
          const maxPapers = level.sections.length * 4;
          const pct = Math.round((totalPapers / maxPapers) * 100);

          return (
            <div key={level.id} style={{ background: 'white', borderRadius: 16, marginBottom: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

              {/* Level header */}
              <div
                onClick={() => setExpandedLevel(isExpanded ? null : level.levelNumber)}
                style={{ padding: '18px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, userSelect: 'none' }}>

                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}12`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color, flexShrink: 0 }}>
                  {level.levelNumber}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Level {level.levelNumber} — {level.title}</span>
                    <span style={{ background: `${color}15`, color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>Band {level.targetBand}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{level.description}</p>
                </div>

                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{totalPapers}/{maxPapers} available</div>
                  <div style={{ width: 100, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                <div style={{ color: '#94a3b8', fontSize: 14, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</div>
              </div>

              {/* Sections */}
              {isExpanded && (
                <div style={{ padding: '4px 20px 20px', display: 'grid', gap: 12, borderTop: '1px solid #f1f5f9' }}>
                  {level.sections.map(section => {
                    const available = Object.values(section.papers).filter(Boolean).length;
                    return (
                      <div key={section.id} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0', marginTop: 12 }}>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 800, color: '#1e293b', fontSize: 14 }}>Section {section.sectionNumber}</span>
                            {section.isComplete && (
                              <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>✓ Complete</span>
                            )}
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{available}/4 available</span>
                        </div>

                        {/* 4 skill tiles */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                          {['reading', 'writing', 'listening', 'speaking'].map(skill => {
                            const paper = section.papers[skill];
                            const s = SKILL[skill];
                            const isStarting = starting === paper?.id;
                            return (
                              <div key={skill} style={{
                                background: paper ? s.bg : '#f1f5f9',
                                border: `1px solid ${paper ? s.border : '#e2e8f0'}`,
                                borderRadius: 10,
                                padding: '12px 8px',
                                textAlign: 'center',
                                opacity: paper ? 1 : 0.55,
                                transition: 'opacity 0.2s'
                              }}>
                                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: paper ? s.color : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                  {s.label}
                                </div>
                                {paper ? (
                                  <button
                                    onClick={() => startPaper(paper)}
                                    disabled={isStarting}
                                    style={{
                                      width: '100%',
                                      padding: '6px 4px',
                                      background: isStarting ? '#94a3b8' : s.color,
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 6,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      cursor: isStarting ? 'not-allowed' : 'pointer',
                                      transition: 'background 0.2s'
                                    }}>
                                    {isStarting ? '...' : 'Start'}
                                  </button>
                                ) : (
                                  <div style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic', padding: '5px 0' }}>
                                    Coming Soon
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {levels.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <p>Programme not available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
