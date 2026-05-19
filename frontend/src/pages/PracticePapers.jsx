import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  warning: '#D97706',
  neutralBand: '#64748B',
  shadow: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.03)',
  shadowHover: '0 4px 12px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.04)',
  transition: '180ms cubic-bezier(0.4, 0, 0.2, 1)',
};

const SKILL_STYLE = {
  READING: { stroke: '#2563EB', soft: '#EFF6FF', icon: '📖', label: 'Reading' },
  WRITING: { stroke: '#D97706', soft: '#FFFBEB', icon: '✍️', label: 'Writing' },
  LISTENING: { stroke: '#7C3AED', soft: '#F5F3FF', icon: '🎧', label: 'Listening' },
  SPEAKING: { stroke: '#DB2777', soft: '#FDF2F8', icon: '🎤', label: 'Speaking' },
};

const SKILL_ORDER = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];

const RESULT_ROUTES = {
  READING: 'results',
  WRITING: 'writing-results',
  LISTENING: 'results',
  SPEAKING: 'speaking-results',
};

function getBand(attempt) {
  const v = attempt?.writingSubmission?.overallBand
    ?? attempt?.speakingSubmission?.overallBand
    ?? attempt?.result?.bandEstimate
    ?? null;
  if (v === '' || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function relativeTime(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const now = Date.now();
  const sec = Math.floor((now - d.getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} minutes ago`;
  const dayStart = t => {
    const x = new Date(t);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };
  const ds = dayStart(now) - dayStart(d.getTime());
  const days = Math.floor(ds / 86400000);
  if (days === 0) {
    if (sec < 86400) return 'today';
    return 'yesterday';
  }
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  if (days < 365) return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function bandPillTone(band) {
  if (band == null || !Number.isFinite(Number(band))) {
    return { bg: '#F1F5F9', fg: C.neutralBand };
  }
  const b = Number(band);
  if (b >= 7) return { bg: '#ECFDF5', fg: C.success };
  if (b >= 5.5) return { bg: '#FFFBEB', fg: '#B45309' };
  return { bg: '#F1F5F9', fg: C.neutralBand };
}

/** @returns {{ kind:'LOCKED' } | { kind:'IN_PROGRESS', attemptId:number|string } | { kind:'NEW' } | { kind:'DONE', bestBand: number|null, lastAttemptId: number|string, lastDone: Date|null }} */
function getPaperState(paper, attempts, paperUnlocked) {
  const myAttempts = attempts.filter(a => a.paperId === paper.id);
  const completed = myAttempts.filter(a => a.status === 'COMPLETED');
  const inProg = myAttempts.find(a => a.status === 'IN_PROGRESS');
  const isFree = paper.paperCode === '001';
  const locked = !isFree && !paperUnlocked;

  if (locked) return { kind: 'LOCKED' };
  if (inProg) return { kind: 'IN_PROGRESS', attemptId: inProg.id };
  if (completed.length === 0) return { kind: 'NEW' };

  const numericBands = completed
    .map(a => getBand(a))
    .filter(x => x != null && Number.isFinite(Number(x)))
    .map(Number);
  const bestBand =
    numericBands.length === 0 ? null : Math.max(...numericBands);

  const lastCompleted = [...completed].sort(
    (a, b) =>
      new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt)
  )[0];
  const lastDone = completed.reduce((latest, a) => {
    const t = new Date(a.endedAt || a.startedAt);
    return !latest || t > latest ? t : latest;
  }, /** @type {null|Date} */ (null));

  return {
    kind: 'DONE',
    bestBand: bestBand == null ? null : bestBand,
    lastAttemptId: lastCompleted.id,
    lastDone,
  };
}

function countCompletedPapers(skillPapers, attempts) {
  return skillPapers.filter(p =>
    attempts.some(a => a.paperId === p.id && a.status === 'COMPLETED')
  ).length;
}

export default function PracticePapers() {
  const [papers, setPapers] = useState([]);
  const [myLevels, setMyLevels] = useState({
    hasFullAccess: false, isPaid: false
  });
  const [history, setHistory] = useState([]);
  const [starting, setStarting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('ALL');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  useEffect(() => {
    const raw = searchParams.get('skill');
    if (!raw || raw === '') {
      setSkillFilter('ALL');
      return;
    }
    const up = String(raw).toUpperCase();
    if (SKILL_ORDER.includes(up)) setSkillFilter(up);
    else setSkillFilter('ALL');
  }, [searchParams]);

  const startPaper = async paperId => {
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

  const isUnlocked = paper => {
    if (paper.paperCode === '001') return true;
    if (myLevels.hasFullAccess || myLevels.isPaid) return true;
    return false;
  };

  const grouped = useMemo(() => {
    const g = {};
    SKILL_ORDER.forEach(skill => {
      g[skill] = papers
        .filter(p => p.testType === skill)
        .sort((a, b) =>
          String(a.paperCode || '').localeCompare(String(b.paperCode || ''))
        );
    });
    return g;
  }, [papers]);

  const filterCounts = useMemo(() => {
    const counts = {};
    SKILL_ORDER.forEach(skill => {
      counts[skill] = (grouped[skill] || []).length;
    });
    return counts;
  }, [grouped]);

  const handleCardActivate = (paper, skill, state) => {
    if (starting === paper.id) return;
    if (state.kind === 'LOCKED') {
      handleBuyFullAccess();
      return;
    }
    if (state.kind === 'IN_PROGRESS') {
      navigate(`/exam/${state.attemptId}/greeting`);
      return;
    }
    if (state.kind === 'DONE') {
      const route = RESULT_ROUTES[skill] || 'results';
      navigate(`/exam/${state.lastAttemptId}/${route}`);
      return;
    }
    startPaper(paper.id);
  };

  const isFullyUnlocked = myLevels.hasFullAccess || myLevels.isPaid;

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif',
          background: C.pageBg,
        }}
      >
        <StudentNav active="practice" />
        <div
          style={{
            minHeight: '40vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: C.textMuted }}>Loading papers...</div>
        </div>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif',
          background: C.pageBg,
        }}
      >
        <StudentNav active="practice" />
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '12px 24px',
            borderBottom: `1px solid ${C.cardBorder}`,
            background: '#fff',
          }}
        />
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>
            No papers available.
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
        .pp-filter-row { scrollbar-width: thin; }
        .pp-filter-row::-webkit-scrollbar { height: 6px; }
        .pp-paper-card { transition: transform ${C.transition}, box-shadow ${C.transition}, border-color ${C.transition}; outline: none; }
        .pp-paper-card:hover:not(:disabled):not(.pp-paper-busy) {
          transform: translateY(-2px);
          box-shadow: ${C.shadowHover};
          border-color: var(--stroke);
        }
        .pp-filter-pill:focus-visible {
          outline: 2px solid ${C.primary};
          outline-offset: 2px;
        }
      `}</style>

      <StudentNav active="practice" />

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '12px 24px',
          borderBottom: `1px solid ${C.cardBorder}`,
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {isFullyUnlocked ? (
          <span style={{ fontSize: 14, fontWeight: 600, color: C.success }}>
            ✓ Full access — all papers unlocked
          </span>
        ) : (
          <>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.textSecondary }}>
              Free papers only · Upgrade to unlock all
            </span>
            <button
              type="button"
              onClick={handleBuyFullAccess}
              style={{
                padding: '8px 16px',
                background: C.primary,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Unlock All →
            </button>
          </>
        )}
      </div>

      {/* Sticky skill filter */}
      <div
        style={{
          position: 'sticky',
          top: 64,
          zIndex: 50,
          borderBottom: `1px solid ${C.cardBorder}`,
          background: 'rgba(248, 250, 252, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '12px 0',
        }}
      >
        <div
          className="pp-filter-row"
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
          }}
        >
          {[{ key: 'ALL', label: 'All', count: papers.length },
            ...SKILL_ORDER.map(skill => ({
              key: skill,
              label: SKILL_STYLE[skill].label,
              count: filterCounts[skill] || 0,
            }))
          ].map(({ key, label, count }) => {
            const selected = key === 'ALL' ? skillFilter === 'ALL' : skillFilter === key;

            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                className="pp-filter-pill"
                onClick={() => setSkillFilter(key)}
                style={{
                  flexShrink: 0,
                  padding: '8px 16px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  border: selected
                    ? `1px solid ${C.primary}`
                    : `1px solid ${C.cardBorder}`,
                  background: selected ? C.primary : '#fff',
                  color: selected ? '#fff' : C.textSecondary,
                  transition: `all ${C.transition}`,
                }}
                onMouseEnter={e => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.background = '#F8FAFC';
                  }
                }}
                onMouseLeave={e => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = C.cardBorder;
                    e.currentTarget.style.background = '#fff';
                  }
                }}
              >
                {label}{' '}
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 11,
                    opacity: selected ? 0.95 : 1,
                  }}
                >
                  · {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>
        {SKILL_ORDER.filter(
          skill => skillFilter === 'ALL' || skillFilter === skill
        ).map(skill => {
          const skillMeta = SKILL_STYLE[skill];
          const skillPapers = grouped[skill] || [];

          const filterEmptySpecific =
            skillFilter !== 'ALL' &&
            skillFilter === skill &&
            skillPapers.length === 0;
          if (filterEmptySpecific) {
            return (
              <div
                key={skill}
                style={{ textAlign: 'center', padding: '64px 24px' }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: C.text }}>
                  No {skillMeta.label} papers yet
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.textMuted, marginTop: 8 }}>
                  Check back soon.
                </div>
              </div>
            );
          }

          if (skillPapers.length === 0) return null;

          const completedPaperN = countCompletedPapers(skillPapers, history);

          return (
            <section key={skill} style={{ marginBottom: 48 }}>
              <header
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: 20,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 28, lineHeight: 1 }}>
                      {skillMeta.icon}
                    </span>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 24,
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      {skillMeta.label}
                    </h2>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: C.textMuted,
                    }}
                  >
                    {skillPapers.length} paper{skillPapers.length !== 1 ? 's' : ''}{' '}
                    · {completedPaperN} completed
                  </div>
                </div>
              </header>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {skillPapers.map(paper => {
                  const unlocked = isUnlocked(paper);
                  const ps = getPaperState(paper, history, unlocked);
                  const busy = starting === paper.id;

                  let statusEl = null;
                  let actionLabel = '';
                  let actionColor = C.primary;

                  if (ps.kind === 'LOCKED') {
                    statusEl = (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 9999,
                          padding: '4px 10px',
                          background: '#F1F5F9',
                          color: C.textMuted,
                        }}
                      >
                        🔒 Locked
                      </span>
                    );
                    actionLabel = 'Unlock →';
                    actionColor = C.accent;
                  } else if (ps.kind === 'IN_PROGRESS') {
                    statusEl = (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 9999,
                          padding: '4px 10px',
                          background: '#FEF3C7',
                          color: '#B45309',
                        }}
                      >
                        In progress
                      </span>
                    );
                    actionLabel = busy ? 'Starting…' : 'Continue →';
                    actionColor = C.warning;
                  } else if (ps.kind === 'NEW') {
                    statusEl = (
                      <span
                        style={{
                          display: 'inline-flex',
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 9999,
                          padding: '4px 10px',
                          background: '#F1F5F9',
                          color: C.textSecondary,
                        }}
                      >
                        Not started
                      </span>
                    );
                    actionLabel = busy ? 'Starting…' : 'Start →';
                    actionColor = C.primary;
                  } else {
                    const tone = bandPillTone(ps.bestBand);
                    const label =
                      ps.bestBand != null && Number.isFinite(Number(ps.bestBand))
                        ? `Best Band ${Number(ps.bestBand).toFixed(1)}`
                        : 'Completed';
                    statusEl = (
                      <span
                        style={{
                          display: 'inline-flex',
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 9999,
                          padding: '4px 10px',
                          background: tone.bg,
                          color: tone.fg,
                        }}
                      >
                        {label}
                      </span>
                    );
                    actionLabel = 'Review →';
                    actionColor = C.textSecondary;
                  }

                  const lastTxt =
                    ps.kind === 'DONE' &&
                    ps.lastDone &&
                    Number.isFinite(ps.lastDone.getTime())
                      ? ` · Last done ${relativeTime(ps.lastDone)}`
                      : '';

                  return (
                    <div
                      key={paper.id}
                      role="button"
                      tabIndex={0}
                      className={`pp-paper-card${busy ? ' pp-paper-busy' : ''}`}
                      onClick={() =>
                        busy ? undefined : handleCardActivate(paper, skill, ps)
                      }
                      onKeyDown={e => {
                        if (e.key === ' ') e.preventDefault();
                        if ((e.key === 'Enter' || e.key === ' ') && !busy) {
                          handleCardActivate(paper, skill, ps);
                        }
                      }}
                      aria-disabled={busy}
                      aria-busy={busy}
                      style={{
                        '--stroke': skillMeta.stroke,
                        background: C.cardBg,
                        borderRadius: 16,
                        padding: 20,
                        border: `1px solid ${C.cardBorder}`,
                        borderTopWidth: 3,
                        borderTopStyle: 'solid',
                        borderTopColor: skillMeta.stroke,
                        boxShadow: C.shadow,
                        cursor: busy ? 'wait' : 'pointer',
                        position: 'relative',
                        outline: 'none',
                        ...(ps.kind === 'LOCKED'
                          ? { opacity: 0.7 }
                          : {}),
                      }}
                    >
                      {ps.kind === 'LOCKED' && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            fontSize: 16,
                            color: C.textMuted,
                            lineHeight: 1,
                            pointerEvents: 'none',
                          }}
                          aria-hidden
                        >
                          🔒
                        </span>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color: skillMeta.stroke,
                            }}
                          >
                            {skill}
                            {' '}
                            {paper.paperCode}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 16,
                              fontWeight: 600,
                              color: C.text,
                              lineHeight: 1.35,
                              paddingRight:
                                ps.kind === 'LOCKED' ? 24 : 0,
                            }}
                          >
                            {paper.title ||
                              `${skillMeta.label} Paper ${paper.paperCode}`}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', gap: 6 }}>
                          {paper.paperCode === '001' ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: '#ECFDF5',
                                color: C.success,
                                padding: '3px 8px',
                                borderRadius: 9999,
                              }}
                            >
                              FREE
                            </span>
                          ) : unlocked ? null : (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: '#FEF3C7',
                                color: '#B45309',
                                padding: '3px 8px',
                                borderRadius: 9999,
                              }}
                            >
                              PAID
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ marginTop: 16 }}>{statusEl}</div>

                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 12,
                          borderTop: `1px solid ${C.subtleBorder}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted }}>
                          ⏱ {paper.timeLimitMin || 60} min
                          {lastTxt}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: busy ? C.textMuted : actionColor,
                            fontFamily: 'Inter, sans-serif',
                            cursor: busy ? 'wait' : 'inherit',
                          }}
                        >
                          {actionLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
