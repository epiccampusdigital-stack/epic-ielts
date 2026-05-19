import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const C = {
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primarySoft: '#EEF2FF',
  accent: '#7C3AED',
  accentSoft: '#F5F3FF',
  pageBg: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  subtleBorder: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  success: '#059669',
  shadow: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.03)',
  shadowHover: '0 4px 12px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.04)',
  transition: '180ms cubic-bezier(0.4, 0, 0.2, 1)',
};

const SKILL_STYLE = {
  READING: { stroke: '#2563EB', soft: '#EFF6FF', icon: '📖', label: 'Reading', time: '60 min' },
  WRITING: { stroke: '#D97706', soft: '#FFFBEB', icon: '✍️', label: 'Writing', time: '60 min' },
  LISTENING: { stroke: '#7C3AED', soft: '#F5F3FF', icon: '🎧', label: 'Listening', time: '30 min' },
  SPEAKING: { stroke: '#DB2777', soft: '#FDF2F8', icon: '🎤', label: 'Speaking', time: '15 min' },
};

const LEVEL_NAMES = {
  1: 'Foundation', 2: 'Elementary', 3: 'Intermediate',
  4: 'Upper Intermediate', 5: 'Advanced'
};

const SKILLS_ORDER = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];

/** Writing → speaking → objective scores (reading/listening). */
function placementAttemptBand(attempt) {
  if (!attempt) return null;
  return (
    attempt.writingSubmission?.overallBand ??
    attempt.speakingSubmission?.overallBand ??
    attempt.result?.bandEstimate ??
    null
  );
}

export default function PlacementTest() {
  const [papers, setPapers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);
  const [resettingSkill, setResettingSkill] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [papersRes, historyRes] = await Promise.all([
          axios.get(`${API_URL}/api/papers/assigned`, api()),
          axios.get(`${API_URL}/api/attempts/placement/mine`, api()),
        ]);

        const allPapers = Array.isArray(papersRes.data) ? papersRes.data : [];
        const placement = allPapers.filter(p => p.paperCode === '001');
        const hist = Array.isArray(historyRes.data) ? historyRes.data : [];

        setPapers(placement);
        setHistory(hist);

        // Derive recommendation if all 4 placement skills have bands
        const bands = SKILLS_ORDER.map(skill => {
          const paper = placement.find(p => p.testType === skill);
          if (!paper) return null;
          const attempt = hist.find(
            a => a.paper?.testType === skill && a.status === 'COMPLETED'
          );
          return placementAttemptBand(attempt);
        });

        if (bands.every(b => b !== null && b !== undefined)) {
          const avg = bands.reduce((s, b) => s + parseFloat(b), 0) / bands.length;
          let level = 1;
          if (avg >= 7.5) level = 5;
          else if (avg >= 6.5) level = 4;
          else if (avg >= 5.5) level = 3;
          else if (avg >= 4.5) level = 2;
          setRecommendation({ band: avg.toFixed(1), level });
        } else {
          setRecommendation(null);
        }
      } catch (err) {
        console.error('Placement load error:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const startPaper = async paperId => {
    setStarting(paperId);
    try {
      const res = await axios.post(
        `${API_URL}/api/attempts`,
        { paperId, isPlacement: true },
        api()
      );
      const attemptId = res.data.id || res.data.attemptId;
      navigate(`/exam/${attemptId}/greeting`);
    } catch {
      alert('Failed to start. Please try again.');
    }
    setStarting(null);
  };

  const redoPlacementSkill = async (skill, paper) => {
    const skillLabel = SKILL_STYLE[skill].label;
    if (
      !window.confirm(
        `Redo your ${skillLabel} placement test? Your current placement band for ${skillLabel} will be replaced.`
      )
    ) {
      return;
    }
    setResettingSkill(skill);
    try {
      await axios.post(`${API_URL}/api/attempts/placement/reset`, { skill }, api());
      await startPaper(paper.id);
    } catch {
      alert('Failed to reset placement. Please try again.');
    } finally {
      setResettingSkill(null);
    }
  };

  const completedCount = SKILLS_ORDER.filter(skill => {
    const paper = papers.find(p => p.testType === skill);
    if (!paper) return false;
    const attempt = history.find(
      a => a.paper?.testType === skill && a.status === 'COMPLETED'
    );
    return placementAttemptBand(attempt) != null;
  }).length;

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif',
          background: C.pageBg,
        }}
      >
        <StudentNav active="placement" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            color: C.textMuted,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
            Loading placement test...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.pageBg,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <style>{`
        .pl-tile {
          transition: transform ${C.transition}, box-shadow ${C.transition}, border-color ${C.transition};
        }
        .pl-tile:hover {
          transform: translateY(-2px);
          box-shadow: ${C.shadowHover};
        }
        @media (max-width: 639px) {
          .pl-tile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <StudentNav active="placement" />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: '0 0 10px' }}>
            Free IELTS Placement Test
          </h1>
          <p style={{ color: C.textSecondary, fontSize: 14, maxWidth: 480, margin: '0 auto 20px' }}>
            Complete all 4 skills to discover your current IELTS level. We&apos;ll recommend the perfect programme for you.
          </p>
          <div
            style={{
              display: 'inline-flex',
              gap: 20,
              background: C.cardBg,
              borderRadius: 12,
              padding: '10px 24px',
              border: `1px solid ${C.cardBorder}`,
              fontSize: 13,
              color: C.textSecondary,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span>✅ Completely free</span>
            <span>🤖 AI marked</span>
            <span>⚡ Instant results</span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 24,
            border: `1px solid ${C.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
              Progress: {completedCount}/4 tests completed
            </div>
            <div style={{ height: 6, background: '#F1F5F9', borderRadius: 9999, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(completedCount / 4) * 100}%`,
                  height: '100%',
                  background: C.primary,
                  borderRadius: 9999,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: completedCount === 4 ? C.primary : C.textMuted }}>
            {completedCount === 4 ? '✓ Done!' : `${completedCount}/4`}
          </div>
        </div>

        {/* Recommendation box */}
        {recommendation && (
          <div
            style={{
              background: `linear-gradient(135deg, ${C.primarySoft} 0%, ${C.accentSoft} 100%)`,
              borderRadius: 24,
              padding: 32,
              marginBottom: 28,
              border: `1px solid ${C.cardBorder}`,
              boxShadow: C.shadow,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.textMuted,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Your placement
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 8px' }}>
              Band {recommendation.band} — Level {recommendation.level}{' '}
              {LEVEL_NAMES[recommendation.level]}
            </h2>
            <p style={{ fontSize: 14, color: C.textSecondary, margin: '0 0 24px', lineHeight: 1.5 }}>
              You&apos;re at Level {recommendation.level} {LEVEL_NAMES[recommendation.level]}. Your
              programme is tailored to this level — start building from here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/levels')}
              style={{
                padding: '12px 24px',
                background: C.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.primaryHover;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = C.primary;
              }}
            >
              Go to my programme →
            </button>
          </div>
        )}

        {/* 4 skill tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            marginBottom: 28,
          }}
          className="pl-tile-grid"
        >
          {SKILLS_ORDER.map(skill => {
            const paper = papers.find(p => p.testType === skill);
            const meta = SKILL_STYLE[skill];
            const attempt = history.find(
              a => a.paper?.testType === skill && a.status === 'COMPLETED'
            );
            const band = placementAttemptBand(attempt);
            const isDone = band != null;
            const isStarting = starting === paper?.id;
            const isResetting = resettingSkill === skill;

            return (
              <div
                key={skill}
                className="pl-tile"
                style={{
                  background: C.cardBg,
                  borderRadius: 16,
                  padding: 24,
                  border: `1px solid ${C.cardBorder}`,
                  borderTopWidth: 3,
                  borderTopColor: meta.stroke,
                  position: 'relative',
                }}
              >
                {isDone && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: meta.stroke,
                      color: 'white',
                      borderRadius: 9999,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    ✓ Done
                  </div>
                )}
                <div style={{ fontSize: 30, marginBottom: 10 }}>{meta.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>{meta.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.textMuted, marginBottom: 16 }}>
                  {meta.time} · Free placement paper
                </div>
                {isDone ? (
                  <>
                    <div style={{ fontSize: 32, fontWeight: 700, color: meta.stroke, fontVariantNumeric: 'tabular-nums' }}>
                      Band {band}
                    </div>
                    <button
                      type="button"
                      onClick={() => redoPlacementSkill(skill, paper)}
                      disabled={isResetting || isStarting}
                      style={{
                        marginTop: 10,
                        padding: 0,
                        background: 'none',
                        border: 'none',
                        fontSize: 12,
                        color: C.textMuted,
                        cursor: isResetting || isStarting ? 'not-allowed' : 'pointer',
                        fontWeight: 500,
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {isResetting ? 'Resetting...' : 'Redo this section →'}
                    </button>
                  </>
                ) : paper ? (
                  <button
                    type="button"
                    onClick={() => startPaper(paper.id)}
                    disabled={isStarting}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: isStarting ? C.textMuted : meta.stroke,
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: isStarting ? 'not-allowed' : 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {isStarting ? 'Starting...' : `Start ${meta.label} →`}
                  </button>
                ) : (
                  <div style={{ color: C.textMuted, fontSize: 13, fontStyle: 'italic' }}>Not yet available</div>
                )}
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${C.cardBorder}`,
          }}
        >
          <h3 style={{ margin: '0 0 16px', color: C.text, fontSize: 15, fontWeight: 800 }}>How it works</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              'Complete all 4 placement tests — Reading, Writing, Listening and Speaking',
              'Our AI marks each test and gives you a band score instantly',
              'We calculate your average band and recommend the right level for you',
              'Purchase your recommended level (LKR 2,000) or get full access (LKR 10,000)',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: C.subtleBorder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 12,
                    flexShrink: 0,
                    color: C.primary,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
