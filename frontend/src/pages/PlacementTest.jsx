import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const SKILL_META = {
  READING:   { icon: '📖', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', label: 'Reading',   time: '60 min' },
  WRITING:   { icon: '✍️', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Writing',   time: '60 min' },
  LISTENING: { icon: '🎧', color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', label: 'Listening', time: '30 min' },
  SPEAKING:  { icon: '🎤', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'Speaking',  time: '15 min' },
};

const LEVEL_NAMES = {
  1: 'Foundation', 2: 'Elementary', 3: 'Intermediate',
  4: 'Upper Intermediate', 5: 'Advanced'
};

const SKILLS_ORDER = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];

export default function PlacementTest() {
  const [papers, setPapers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [papersRes, historyRes] = await Promise.all([
          axios.get(`${API_URL}/api/papers/assigned`, api()),
          axios.get(`${API_URL}/api/attempts/history/mine`, api()),
        ]);

        const allPapers = Array.isArray(papersRes.data) ? papersRes.data : [];
        const placement = allPapers.filter(p => p.paperCode === '001');
        const hist = Array.isArray(historyRes.data) ? historyRes.data : [];

        setPapers(placement);
        setHistory(hist);

        // Derive recommendation if all 4 are done
        const bands = SKILLS_ORDER.map(skill => {
          const paper = placement.find(p => p.testType === skill);
          if (!paper) return null;
          const attempt = hist.find(a => a.paperId === paper.id && a.status === 'COMPLETED');
          // Reading/Listening → result.bandEstimate; Writing → writingSubmission.overallBand; Speaking → result.bandEstimate
          const band = attempt?.result?.bandEstimate
            || attempt?.writingSubmission?.overallBand
            || null;
          return band;
        });

        if (bands.every(b => b !== null && b !== undefined)) {
          const avg = bands.reduce((s, b) => s + parseFloat(b), 0) / bands.length;
          let level = 1;
          if (avg >= 7.5) level = 5;
          else if (avg >= 6.5) level = 4;
          else if (avg >= 5.5) level = 3;
          else if (avg >= 4.5) level = 2;
          setRecommendation({ band: avg.toFixed(1), level });
        }
      } catch (err) {
        console.error('Placement load error:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const startPaper = async (paperId) => {
    setStarting(paperId);
    try {
      const res = await axios.post(`${API_URL}/api/attempts`, { paperId }, api());
      const attemptId = res.data.id || res.data.attemptId;
      navigate(`/exam/${attemptId}/greeting`);
    } catch {
      alert('Failed to start. Please try again.');
    }
    setStarting(null);
  };

  const completedCount = SKILLS_ORDER.filter(skill => {
    const paper = papers.find(p => p.testType === skill);
    return paper && history.some(a => a.paperId === paper.id && a.status === 'COMPLETED');
  }).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
        Loading placement test...
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
            <div style={{ color: '#94a3b8', fontSize: 11 }}>Free Placement Test</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/student/dashboard')}
          style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1e293b', margin: '0 0 10px' }}>Free IELTS Placement Test</h1>
          <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto 20px' }}>
            Complete all 4 skills to discover your current IELTS level. We'll recommend the perfect programme for you.
          </p>
          <div style={{ display: 'inline-flex', gap: 20, background: 'white', borderRadius: 12, padding: '10px 24px', border: '1px solid #e2e8f0', fontSize: 13, color: '#64748b', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>✅ Completely free</span>
            <span>🤖 AI marked</span>
            <span>⚡ Instant results</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', marginBottom: 24, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Progress: {completedCount}/4 tests completed</div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(completedCount / 4) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #16a34a, #4f46e5)', borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: completedCount === 4 ? '#16a34a' : '#94a3b8' }}>
            {completedCount === 4 ? '✓ Done!' : `${completedCount}/4`}
          </div>
        </div>

        {/* Recommendation box */}
        {recommendation && (
          <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', borderRadius: 16, padding: '28px', marginBottom: 28, color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Placement Result</div>
            <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 6 }}>Band {recommendation.band}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, opacity: 0.9 }}>
              Recommended: Level {recommendation.level} — {LEVEL_NAMES[recommendation.level]}
            </div>
            <button
              onClick={() => navigate('/levels')}
              style={{ padding: '14px 32px', background: 'white', color: '#1d4ed8', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>
              View My Programme → Buy Level {recommendation.level} (LKR 2,000)
            </button>
          </div>
        )}

        {/* 4 skill tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
          {SKILLS_ORDER.map(skill => {
            const paper = papers.find(p => p.testType === skill);
            const meta = SKILL_META[skill];
            const attempt = history.find(a => a.paperId === paper?.id && a.status === 'COMPLETED');
            const band = attempt?.result?.bandEstimate || attempt?.writingSubmission?.overallBand;
            const isDone = !!band;
            const isStarting = starting === paper?.id;

            return (
              <div key={skill} style={{ background: 'white', borderRadius: 14, padding: '22px', border: `2px solid ${isDone ? meta.color : '#e2e8f0'}`, position: 'relative', transition: 'border-color 0.2s' }}>
                {isDone && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: meta.color, color: 'white', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                    ✓ Done
                  </div>
                )}
                <div style={{ fontSize: 30, marginBottom: 10 }}>{meta.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{meta.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{meta.time} · Free placement paper</div>
                {isDone ? (
                  <div style={{ fontSize: 28, fontWeight: 900, color: meta.color }}>Band {band}</div>
                ) : paper ? (
                  <button
                    onClick={() => startPaper(paper.id)}
                    disabled={isStarting}
                    style={{ width: '100%', padding: '11px', background: isStarting ? '#94a3b8' : meta.color, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: isStarting ? 'not-allowed' : 'pointer' }}>
                    {isStarting ? 'Starting...' : `Start ${meta.label} →`}
                  </button>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Not yet available</div>
                )}
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div style={{ background: 'white', borderRadius: 14, padding: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: 15, fontWeight: 800 }}>How it works</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              'Complete all 4 placement tests — Reading, Writing, Listening and Speaking',
              'Our AI marks each test and gives you a band score instantly',
              'We calculate your average band and recommend the right level for you',
              'Purchase your recommended level (LKR 2,000) or get full access (LKR 10,000)',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, flexShrink: 0, color: '#4f46e5' }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
