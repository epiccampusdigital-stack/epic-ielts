import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export default function StudentDashboard() {
  const [papers, setPapers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const papersRes = await axios.get(`${API_URL}/api/papers/assigned`, api());
        const allPapers = Array.isArray(papersRes.data) ? papersRes.data : [];
        // Sort papers by paperCode ascending (READING001, READING002, etc.)
        allPapers.sort((a, b) => (a.paperCode || '').localeCompare(b.paperCode || ''));
        console.log('All papers from API:', allPapers.length, allPapers.map(p => p.paperCode + ' ' + p.testType));
        setPapers(allPapers);
      } catch (err) {
        console.error('Papers fetch error:', err.response?.status, err.message);
        setPapers([]);
      }
      try {
        const historyRes = await axios.get(`${API_URL}/api/attempts/history/mine`, api());
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      } catch (err) {
        console.error('History fetch error:', err.message);
        setHistory([]);
      }
      try {
        const summaryRes = await axios.get(`${API_URL}/api/attempts/dashboard/summary`, api());
        setSummary(summaryRes.data);
      } catch (err) {
        console.error('Summary fetch error:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const startTest = async (paperId) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/attempts`,
        { paperId },
        api()
      );

      const attemptId = res.data.id || res.data.attemptId;
      navigate(`/exam/${attemptId}/greeting`);
    } catch (err) {
      console.error('Start test error:', err);
      alert('Failed to start test. Please try again.');
    }
  };

  const getBandColor = (band) => {
    if (!band) return { bg: '#f1f5f9', color: '#64748b' };
    if (band >= 7) return { bg: '#f0fdf4', color: '#16a34a' };
    if (band >= 5.5) return { bg: '#fffbeb', color: '#d97706' };
    return { bg: '#fef2f2', color: '#dc2626' };
  };

  const getTypeColor = (type) => {
    const colors = {
      READING: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      WRITING: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
      LISTENING: { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
      SPEAKING: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' }
    };

    return colors[type] || {
      bg: '#f1f5f9',
      color: '#475569',
      border: '#e2e8f0'
    };
  };

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const initials = user.name
    ? user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'S';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        @media (min-width: 768px) {
          .dashboard-container {
            padding: 40px 40px;
          }
        }

        .paper-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.25s ease;
          animation: fadeUp 0.4s ease both;
          position: relative;
          overflow: hidden;
        }

        .paper-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #4f46e5;
          border-radius: 4px 0 0 4px;
        }

        .paper-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
          border-color: #c7d2fe;
        }

        .start-btn {
          padding: 10px 20px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .start-btn:hover {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79,70,229,0.4);
        }

        .logout-btn {
          padding: 8px 16px;
          background: transparent;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .nav-link {
          font-size: 14px;
          color: #64748b;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s;
          font-weight: 500;
        }

        .nav-link:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .result-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 60px 60px;
          gap: 12px;
          padding: 14px 16px;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
        }

        @media (min-width: 768px) {
          .result-row {
            grid-template-columns: 2fr 1fr 80px 80px;
            gap: 16px;
            padding: 14px 20px;
          }
        }

        .result-row:hover {
          background: #f8fafc;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }

        .navbar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 16px;
          height: auto;
          min-height: 64px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          gap: 12px;
          padding-bottom: 12px;
          padding-top: 12px;
        }

        @media (min-width: 768px) {
          .navbar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
            height: 64px;
            padding-bottom: 0;
            padding-top: 0;
          }
        }

        .hero-section {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 32px 16px;
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .hero-section {
            padding: 48px 40px;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <nav className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/logo.png"
                alt="EPIC Campus"
                style={{ height: '32px', objectFit: 'contain' }}
              />
              <div
                style={{
                  width: '1px',
                  height: '24px',
                  background: '#e2e8f0'
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#4f46e5',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                IELTS CBT
              </span>
            </div>
            
            <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="nav-link">Dashboard</span>
              <span className="nav-link">My Results</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }} className="mobile-hide">
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                  {user.name || 'Student'}
                </div>
              </div>

              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {initials}
              </div>

              <button
                className="logout-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="hero-section">
          <div
            style={{
              position: 'absolute',
              right: '-60px',
              top: '-60px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(79,70,229,0.15)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '200px',
              bottom: '-80px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(245,158,11,0.08)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '20px',
                padding: '4px 14px',
                marginBottom: '16px'
              }}
            >
              <span style={{ fontSize: '10px' }}>🎓</span>
              <span
                style={{
                  fontSize: '10px',
                  color: '#f59e0b',
                  fontWeight: '500',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                {user.batch || 'General'} Batch
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '8px',
                lineHeight: '1.2'
              }}
              className="responsive-text"
            >
              Welcome back, {user.name?.split(' ')[0] || 'Student'} 👋
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '28px'
              }}
            >
              Ready for your next IELTS practice test?
            </p>

            <div className="stats-grid">
              {[
                { label: 'Tests Available', value: papers.length, icon: '📋' },
                { label: 'Tests Taken', value: history.length, icon: '✅' },
                {
                  label: 'Average Band',
                  value: summary?.overall || '—',
                  icon: '📈'
                }
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#ffffff',
                        fontFamily: "'Playfair Display', serif"
                      }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {summary?.summary && Object.keys(summary.summary).length > 0 && (
              <div 
                style={{ 
                  marginTop: '24px', 
                  background: 'rgba(255,255,255,0.1)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px', 
                  padding: '20px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  animation: 'fadeUp 0.6s ease both'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '18px' }}>🤖</span>
                  <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>AI Progress Insights</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  {Object.entries(summary.summary).map(([type, data]) => (
                    <div key={type} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase' }}>{type}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{data.average}</span>
                        <span style={{ fontSize: '11px', color: '#10b981' }}>Best: {data.best}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-container">
          <div style={{ marginBottom: '48px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1a1a2e',
                    marginBottom: '4px'
                  }}
                >
                  Your Assigned Tests
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {papers.length} test{papers.length !== 1 ? 's' : ''} available for your batch
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['ALL', 'READING', 'WRITING', 'LISTENING', 'SPEAKING'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid',
                      borderColor: filter === t ? '#4f46e5' : '#e2e8f0',
                      background: filter === t ? '#4f46e5' : 'white',
                      color: filter === t ? 'white' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="responsive-grid">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '160px',
                      background:
                        'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                      backgroundSize: '400px 100%',
                      animation: 'shimmer 1.5s infinite',
                      borderRadius: '16px'
                    }}
                  />
                ))}
              </div>
            ) : papers.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>📋</div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '18px',
                    color: '#1e293b',
                    marginBottom: '8px'
                  }}
                >
                  You're all caught up!
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>
                  No tests assigned yet. Check back later or contact your teacher.
                </p>
              </div>
            ) : (
              <div className="responsive-grid">
                {(filter === 'ALL'
                  ? papers.slice(0, 6)
                  : papers.filter(p => p.testType === filter).slice(0, 3)
                ).map((paper, i) => {
                  const typeColor = getTypeColor(paper.testType);

                  return (
                    <div
                      key={paper.id}
                      className="paper-card"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: typeColor.bg,
                          border: `1px solid ${typeColor.border}`,
                          borderRadius: '20px',
                          padding: '4px 10px',
                          marginBottom: '12px'
                        }}
                      >
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: typeColor.color,
                            display: 'inline-block'
                          }}
                        />
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color: typeColor.color,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase'
                          }}
                        >
                          {paper.testType}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1a1a2e',
                          marginBottom: '4px',
                          letterSpacing: '-0.2px'
                        }}
                      >
                        EPIC IELTS — {paper.testType} {paper.paperCode}
                      </h3>

                      <p
                        style={{
                          fontSize: '12px',
                          color: '#64748b',
                          marginBottom: '16px'
                        }}
                      >
                        {paper.title}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          marginBottom: '18px',
                          flexWrap: 'wrap'
                        }}
                      >
                        {[
                          { icon: '⏱', text: `${paper.timeLimitMin} min` },
                          { icon: '❓', text: '40 Qs' },
                          { icon: '📚', text: 'Academic' }
                        ].map((pill, j) => (
                          <div
                            key={j}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '20px',
                              padding: '3px 8px',
                              fontSize: '10px',
                              color: '#64748b',
                              fontWeight: '500'
                            }}
                          >
                            <span>{pill.icon}</span>
                            <span>{pill.text}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '20px',
                            padding: '4px 10px'
                          }}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: '#16a34a',
                              display: 'inline-block'
                            }}
                          />
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '500',
                              color: '#16a34a'
                            }}
                          >
                            Available
                          </span>
                        </div>

                        <button
                          className="start-btn"
                          style={{ padding: '8px 16px', fontSize: '12px' }}
                          onClick={() => startTest(paper.id)}
                        >
                          Start Test →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  marginBottom: '4px'
                }}
              >
                Past Results
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                Your test history and band scores
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 80px 80px',
                  gap: '16px',
                  padding: '14px 20px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0'
                }}
              >
                {['Paper', 'Date', 'Score', 'Band'].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#94a3b8',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {history.length === 0 ? (
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                  No results yet — take your first test!
                </div>
              ) : (
                history.map((attempt) => {
                  const band = attempt.result?.bandEstimate;
                  const bandStyle = getBandColor(band);

                  return (
                    <div 
                      key={attempt.id} 
                      className="result-row"
                      onClick={() => navigate(`/exam/${attempt.id}/results`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '2px'
                          }}
                        >
                          EPIC IELTS — {attempt.paper?.testType} {attempt.paper?.paperCode}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {attempt.paper?.title}
                        </div>
                      </div>

                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {formatDate(attempt.endedAt)}
                      </div>

                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1e293b'
                        }}
                      >
                        {attempt.result?.rawScore ?? '—'}/40
                      </div>

                      <div>
                        {band ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              background: bandStyle.bg,
                              color: bandStyle.color,
                              fontSize: '12px',
                              fontWeight: '700'
                            }}
                          >
                            {Number(band).toFixed(1)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Processing...</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}