import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import AgentWidget from '../components/AgentWidget';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const RESULT_ROUTES = {
  READING: 'results',
  WRITING: 'writing-results',
  LISTENING: 'results',
  SPEAKING: 'speaking-results',
};

const SKILL_ORDER = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];

const SKILL_LABEL = {
  READING: 'Reading',
  WRITING: 'Writing',
  LISTENING: 'Listening',
  SPEAKING: 'Speaking',
};

const SKILL_ICONS = {
  READING: '📖',
  WRITING: '✍️',
  LISTENING: '🎧',
  SPEAKING: '🎤',
};

/** Spec skill colours */
const SKILL_STYLE = {
  READING: { stroke: '#2563EB', top: '#2563EB', bgSoft: '#EFF6FF' },
  WRITING: { stroke: '#D97706', top: '#D97706', bgSoft: '#FFFBEB' },
  LISTENING: { stroke: '#7C3AED', top: '#7C3AED', bgSoft: '#F5F3FF' },
  SPEAKING: { stroke: '#DB2777', top: '#DB2777', bgSoft: '#FDF2F8' },
};

const C = {
  pageBg: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  subtleBorder: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primarySoft: '#EEF2FF',
  accent: '#7C3AED',
  accentSoft: '#F5F3FF',
  success: '#059669',
  warning: '#D97706',
  neutralBand: '#64748B',
  shadow: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.03)',
  shadowHover: '0 4px 12px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.04)',
  shadowHero: '0 10px 30px rgba(79,70,229,0.06)',
  transition: '180ms cubic-bezier(0.4, 0, 0.2, 1)',
};

function localDateKey(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getStreak(attempts) {
  const completed = attempts.filter(a => a.status === 'COMPLETED');
  const dates = new Set();
  for (const a of completed) {
    dates.add(localDateKey(a.endedAt || a.startedAt));
  }
  const now = new Date();
  const todayKey = localDateKey(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterdayKey = localDateKey(y);
  if (!dates.has(todayKey) && !dates.has(yesterdayKey)) return 0;

  const end = new Date(now);
  if (!dates.has(todayKey)) {
    end.setDate(end.getDate() - 1);
  }
  let streak = 0;
  const cur = new Date(end);
  while (true) {
    const k = localDateKey(cur);
    if (dates.has(k)) {
      streak += 1;
      cur.setDate(cur.getDate() - 1);
    } else break;
  }
  return streak;
}

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

function levelFromBand(band) {
  if (band == null || Number.isNaN(Number(band))) return { level: '—', name: '—' };
  const b = Number(band);
  if (b >= 7.5) return { level: 5, name: 'Advanced' };
  if (b >= 6.5) return { level: 4, name: 'Upper-Intermediate' };
  if (b >= 5.5) return { level: 3, name: 'Intermediate' };
  if (b >= 4.5) return { level: 2, name: 'Elementary' };
  return { level: 1, name: 'Foundation' };
}

function clampTargetBand(n) {
  let x = Math.round(Number(n) * 2) / 2;
  if (!Number.isFinite(x)) return 6.5;
  return Math.min(9, Math.max(4, x));
}

function bandSemanticColor(band) {
  if (band == null || !Number.isFinite(Number(band))) return C.neutralBand;
  const b = Number(band);
  if (b >= 7) return C.success;
  if (b >= 5.5) return C.warning;
  return C.neutralBand;
}

function sparklinePoints(values) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padX = 4;
  const padY = 4;
  const w = 100 - padX * 2;
  const h = 24 - padY * 2;
  return values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * w;
    const t = max === min ? 0.5 : (v - min) / (max - min);
    const y = padY + h * (1 - t);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

function SvgSparkline({ values, stroke, dashed, stretch }) {
  const ratio = stretch ? 'none' : 'xMidYMid meet';
  if (dashed || !values || values.length < 2) {
    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 24"
        preserveAspectRatio={ratio}
        style={{ display: 'block', minHeight: stretch ? 60 : undefined }}
        aria-hidden
      >
        <line
          x1="4"
          y1="12"
          x2="96"
          y2="12"
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  const pts = sparklinePoints(values);
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 24"
      preserveAspectRatio={ratio}
      style={{ display: 'block', minHeight: stretch ? 60 : undefined }}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
}

function getLast7Days(attempts) {
  const out = [];
  const completed = attempts.filter(a => a.status === 'COMPLETED');
  const dates = new Set(completed.map(a => localDateKey(a.endedAt || a.startedAt)));
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    out.push({
      date: d,
      key,
      done: dates.has(key),
      isToday: i === 0,
      label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
    });
  }
  return out;
}

function todayInputMinISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return localDateKey(d);
}

/** Coach copy — formal tone; priorities first match wins. */
function getCoachMessage({
  currentBand,
  gapBands,
  goalReached,
  skillStats,
  placementDone,
  examDate,
  daysToExam,
}) {
  if (daysToExam != null && daysToExam >= 0 && daysToExam <= 7) {
    return {
      headline:
        daysToExam === 0
          ? 'Final stretch. Exam day.'
          : `Final stretch. ${daysToExam} days to exam day.`,
      sub:
        'Prioritise full mock papers and review your weakest skill once daily.',
    };
  }

  const bigJump = Object.entries(skillStats || {}).find(
    ([, st]) => st.trend != null && st.trend >= 0.5
  );
  if (bigJump) {
    const [skill, st] = bigJump;
    const lowAbsolute = st.latest != null && st.latest < 4.0;
    return {
      headline: lowAbsolute
        ? `${SKILL_LABEL[skill]} up ${st.trend.toFixed(1)} bands — keep building from here.`
        : `Excellent progress in ${SKILL_LABEL[skill]} — up ${st.trend.toFixed(1)} bands.`,
      sub: lowAbsolute
        ? 'Strong direction. Keep your practice frequency steady to consolidate the gains.'
        : 'Maintain this momentum. Keep your practice frequency steady.',
    };
  }

  if (goalReached) {
    return {
      headline: 'Target band achieved. Outstanding.',
      sub:
        'Continue practising to consolidate your performance under exam conditions.',
    };
  }

  if (currentBand != null && gapBands != null && gapBands > 0) {
    let sub = 'A clear study plan and daily practice will close this gap.';
    if (examDate && daysToExam != null && daysToExam > 0) {
      sub =
        `With ${daysToExam} days to go, focus on consistent daily practice.`;
    }
    const headline = gapBands < 1.0
      ? `Within reach. ${gapBands.toFixed(1)} bands to your target.`
      : `${gapBands.toFixed(1)} bands from your target.`;
    return {
      headline,
      sub,
    };
  }

  if (!placementDone) {
    return {
      headline: 'Take your free placement test to begin.',
      sub:
        'A baseline across all four skills will shape your study plan.',
    };
  }

  return {
    headline: 'Continue practising across all skills.',
    sub: 'Structured sessions keep every skill aligned with exam expectations.',
  };
}

export default function StudentDashboard() {
  const [rawHistory, setRawHistory] = useState([]);
  const [myLevels, setMyLevels] = useState({
    hasFullAccess: false,
    isPaid: false,
    purchasedLevels: [],
    placementDone: false,
    placementBand: null,
  });
  const [papers, setPapers] = useState([]);
  const [historyFetchFailed, setHistoryFetchFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [targetBand, setTargetBand] = useState(() => {
    try {
      const raw = localStorage.getItem('epicTargetBand');
      if (raw == null || raw === '') return 6.5;
      return clampTargetBand(parseFloat(raw));
    } catch {
      return 6.5;
    }
  });
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState(String(targetBand));
  const [todayBusy, setTodayBusy] = useState(false);
  const [focusBusy, setFocusBusy] = useState(false);
  const [examDate, setExamDate] = useState(() => {
    try {
      return localStorage.getItem('epicExamDate') || null;
    } catch {
      return null;
    }
  });
  const [editingExamDate, setEditingExamDate] = useState(false);
  const [examDraft, setExamDraft] = useState('');
  const [openSkillDrawer, setOpenSkillDrawer] = useState(
    /** @type {'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING' | null} */ (null)
  );
  const [skillDrawerEntered, setSkillDrawerEntered] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = (user.name || 'Student').split(' ')[0];

  useEffect(() => {
    const load = async () => {
      let histFail = false;
      const results = await Promise.allSettled([
        axios.get(`${API_URL}/api/attempts/history/mine`, api()),
        axios.get(`${API_URL}/api/payments/my-levels`, api()),
        axios.get(`${API_URL}/api/papers/assigned`, api()),
      ]);
      const [historyRes, levelsRes, papersRes] = results;
      if (historyRes.status === 'fulfilled') {
        setRawHistory(Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
      } else {
        console.error('Dashboard history error:', historyRes.reason);
        setRawHistory([]);
        histFail = true;
      }
      if (levelsRes.status === 'fulfilled') {
        setMyLevels(levelsRes.value.data || {});
      } else {
        console.error('Dashboard levels error:', levelsRes.reason);
      }
      if (papersRes.status === 'fulfilled') {
        setPapers(Array.isArray(papersRes.value.data) ? papersRes.value.data : []);
      } else {
        console.error('Dashboard papers error:', papersRes.reason);
        setPapers([]);
      }
      setHistoryFetchFailed(histFail);
      setLoading(false);
    };
    load();
  }, []);

  const completedAttempts = useMemo(
    () => rawHistory.filter(a => a.status === 'COMPLETED'),
    [rawHistory]
  );

  const fallbackBandFromHistory = useMemo(() => {
    if (!completedAttempts.length) return null;
    const sorted = [...completedAttempts].sort(
      (a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt)
    );
    for (const a of sorted) {
      const b = getBand(a);
      if (b != null) return b;
    }
    return null;
  }, [completedAttempts]);

  const currentBand = useMemo(() => {
    if (historyFetchFailed) return null;
    const pb = myLevels.placementBand;
    if (pb != null && pb !== '' && Number.isFinite(Number(pb))) return Number(pb);
    return fallbackBandFromHistory;
  }, [myLevels.placementBand, fallbackBandFromHistory, historyFetchFailed]);

  const streak = useMemo(() => getStreak(rawHistory), [rawHistory]);

  const completedIds = useMemo(() => {
    const s = new Set();
    for (const a of completedAttempts) {
      if (a.paperId) s.add(a.paperId);
    }
    return s;
  }, [completedAttempts]);

  const totalPapers = papers.length;
  const completedPaperCount = completedIds.size;
  const practiceProgress = totalPapers > 0 ? (completedPaperCount / totalPapers) * 100 : 0;

  const skillStats = useMemo(() => {
    const out = {};
    for (const skill of SKILL_ORDER) {
      const skillAttempts = completedAttempts
        .filter(a => (a.paper?.testType || 'READING') === skill)
        .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
      const bands = skillAttempts.map(a => getBand(a)).filter(x => x != null);
      const last5 = bands.slice(-5);
      const latest = last5.length ? last5[last5.length - 1] : null;
      let trend = null;
      if (last5.length >= 2) {
        const d = last5[last5.length - 1] - last5[last5.length - 2];
        if (Math.abs(d) < 0.05) trend = 0;
        else trend = Math.round(d * 10) / 10;
      }
      const paperIds = new Set(skillAttempts.map(a => a.paperId).filter(Boolean));
      out[skill] = {
        spark: last5,
        latest,
        trend,
        papersDone: paperIds.size,
        dashed: last5.length < 2,
      };
    }
    return out;
  }, [completedAttempts]);

  const recommendation = useMemo(() => {
    const inProg = rawHistory.filter(a => a.status === 'IN_PROGRESS');
    if (inProg.length) {
      const pick = [...inProg].sort(
        (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
      )[0];
      const sid = pick.id;
      const title = pick.paper?.title || 'your paper';
      return {
        kind: 'continue',
        paperId: null,
        headline: `Continue ${title}`,
        sub: 'Pick up where you left off and finish strong.',
        cta: 'Continue exam →',
        go: () => navigate(`/exam/${sid}/greeting`),
      };
    }

    if (!myLevels.placementDone && completedAttempts.length === 0) {
      return {
        kind: 'placement',
        headline: 'Start your free placement test',
        sub: 'Get a baseline across all four skills in one guided session.',
        cta: 'Start placement →',
        paperId: null,
        go: () => navigate('/placement-test'),
      };
    }

    const latestBand = skill => {
      const arr = completedAttempts
        .filter(a => (a.paper?.testType || 'READING') === skill)
        .sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt));
      if (!arr.length) return null;
      return getBand(arr[0]);
    };

    const papersFor = skill =>
      papers
        .filter(p => p.testType === skill)
        .sort((a, b) => String(a.paperCode || '').localeCompare(String(b.paperCode || '')));

    const firstUnattempted = skill => papersFor(skill).find(p => p.id && !completedIds.has(p.id));

    const hasAnyBand = SKILL_ORDER.some(s => latestBand(s) != null);

    let focusSkill = null;
    if (hasAnyBand) {
      let bestMin = Infinity;
      const cand = [];
      for (const s of SKILL_ORDER) {
        const b = latestBand(s);
        if (b != null && b < bestMin) {
          bestMin = b;
          cand.length = 0;
          cand.push(s);
        } else if (b != null && b === bestMin) {
          cand.push(s);
        }
      }
      focusSkill = cand[0] || null;
    } else {
      for (const s of SKILL_ORDER) {
        if (firstUnattempted(s)) {
          focusSkill = s;
          break;
        }
      }
    }

    if (!focusSkill) {
      focusSkill = 'READING';
    }

    const un = firstUnattempted(focusSkill);
    const skillLabel = SKILL_LABEL[focusSkill];
    const lb = latestBand(focusSkill);

    if (un) {
      const code = un.paperCode || un.title || 'paper';
      return {
        kind: 'start',
        paperId: un.id,
        headline: `Your ${skillLabel} needs work — try ${un.title || code}`,
        sub: lb != null
          ? `Latest ${skillLabel} band: ${Number(lb).toFixed(1)}. This paper targets your weak areas.`
          : `Build consistency in ${skillLabel}. This paper is a great next step.`,
        cta: `Start ${code} →`,
      };
    }

    const attemptsSkill = completedAttempts
      .filter(a => (a.paper?.testType || 'READING') === focusSkill)
      .sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt));
    const recentPaper = attemptsSkill[0]?.paper;
    const retryTitle = recentPaper?.title || recentPaper?.paperCode || skillLabel;
    return {
      kind: 'start',
      paperId: recentPaper?.id ?? null,
      headline: `Retry ${retryTitle} to push your band up`,
      sub: lb != null
        ? `Latest ${skillLabel} band: ${Number(lb).toFixed(1)}. A second run often lifts your score.`
        : `Keep practising ${skillLabel} to see a clear band estimate.`,
      cta: recentPaper?.paperCode ? `Start ${recentPaper.paperCode} →` : 'Open practice →',
      go: recentPaper?.id ? undefined : () => navigate('/practice'),
    };
  }, [rawHistory, completedAttempts, myLevels.placementDone, papers, completedIds, navigate]);

  const lastFiveForNarrative = useMemo(() => {
    const sorted = [...completedAttempts].sort(
      (a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt)
    );
    return sorted.slice(0, 5);
  }, [completedAttempts]);

  const totalCompleted = completedAttempts.length;

  const narrative = useMemo(() => {
    if (!lastFiveForNarrative.length) return null;
    const X = lastFiveForNarrative.length;
    const bands = lastFiveForNarrative.map(a => getBand(a)).filter(x => x != null);
    const avg = bands.length
      ? (bands.reduce((s, x) => s + x, 0) / bands.length).toFixed(1)
      : '—';
    const earliestTs = lastFiveForNarrative.reduce(
      (acc, a) => {
        const t = new Date(a.endedAt || a.startedAt).getTime();
        return Math.min(acc, t);
      },
      new Date(lastFiveForNarrative[0].endedAt || lastFiveForNarrative[0].startedAt).getTime()
    );
    // eslint-disable-next-line react-hooks/purity -- headline span uses wall-clock "today"
    const nowTs = Date.now();
    const N = Math.max(1, Math.ceil((nowTs - earliestTs) / 86400000));
    return { N, X, avg };
  }, [lastFiveForNarrative]);

  const hasCompletedToday = useMemo(() => {
    const k = localDateKey(new Date());
    return completedAttempts.some(
      a => localDateKey(a.endedAt || a.startedAt) === k
    );
  }, [completedAttempts]);

  const pulseSessionBtn = !hasCompletedToday && streak < 2;

  const gapBands =
    currentBand != null && targetBand != null
      ? Math.max(0, Math.round((targetBand - currentBand) * 10) / 10)
      : null;

  const goalReached =
    currentBand != null && targetBand != null && currentBand >= targetBand;

  const daysToExam = useMemo(() => {
    if (!examDate) return null;
    const target = new Date(`${examDate}T12:00:00`);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / 86400000);
  }, [examDate]);

  const last7Cells = useMemo(() => getLast7Days(rawHistory), [rawHistory]);

  const openExamEditor = () => {
    setExamDraft(examDate || '');
    setEditingExamDate(true);
  };

  const coach = useMemo(
    () =>
      getCoachMessage({
        currentBand,
        gapBands,
        goalReached,
        skillStats,
        placementDone: myLevels.placementDone,
        examDate,
        daysToExam,
      }),
    [
      currentBand,
      gapBands,
      goalReached,
      skillStats,
      myLevels.placementDone,
      examDate,
      daysToExam,
    ]
  );

  const weakestSkillCallout = useMemo(() => {
    const skillBands = SKILL_ORDER.map(s => ({
      skill: s,
      band: skillStats[s].latest,
    })).filter(x => x.band != null);
    if (skillBands.length < 2) return null;
    const weakest = skillBands.reduce(
      (min, x) => (x.band < min.band ? x : min),
      skillBands[0]
    );
    const others = skillBands.filter(x => x.skill !== weakest.skill);
    const otherAvg = others.reduce((s, x) => s + x.band, 0) / others.length;
    const gap = otherAvg - weakest.band;
    if (gap < 1.0) return null;
    return {
      skill: weakest.skill,
      band: weakest.band,
      gap: Math.round(gap * 10) / 10,
      recommendedPaper:
        papers
          .filter(p => p.testType === weakest.skill)
          .sort((a, b) =>
            String(a.paperCode || '').localeCompare(String(b.paperCode || ''))
          )
          .find(p => p.id && !completedIds.has(p.id)) ?? null,
    };
  }, [skillStats, papers, completedIds]);

  const persistExamDate = value => {
    if (value == null || value === '') return;
    try {
      localStorage.setItem('epicExamDate', value);
    } catch { /* ignore */ }
    setExamDate(value);
    setEditingExamDate(false);
  };

  const saveTarget = useCallback(() => {
    const v = clampTargetBand(parseFloat(String(targetDraft).trim()));
    setTargetBand(v);
    try {
      localStorage.setItem('epicTargetBand', String(v));
    } catch { /* ignore */ }
    setEditingTarget(false);
  }, [targetDraft]);

  const levelInfo = levelFromBand(
    myLevels.placementBand != null && myLevels.placementBand !== ''
      ? Number(myLevels.placementBand)
      : currentBand
  );

  useEffect(() => {
    document.body.style.overflow = openSkillDrawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [openSkillDrawer]);

  useEffect(() => {
    if (!openSkillDrawer) return undefined;
    const onKeyDown = ev => {
      if (ev.key === 'Escape') setOpenSkillDrawer(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openSkillDrawer]);

  useEffect(() => {
    if (!openSkillDrawer) {
      setSkillDrawerEntered(false);
      return undefined;
    }
    const id = requestAnimationFrame(() => setSkillDrawerEntered(true));
    return () => cancelAnimationFrame(id);
  }, [openSkillDrawer]);

  const onSkillCardClick = skill => {
    setOpenSkillDrawer(skill);
  };

  const runTodaySession = async () => {
    if (typeof recommendation.go === 'function') {
      recommendation.go();
      return;
    }
    if (recommendation.kind === 'start' && recommendation.paperId) {
      setTodayBusy(true);
      try {
        const res = await axios.post(
          `${API_URL}/api/attempts`,
          { paperId: recommendation.paperId },
          api()
        );
        const attemptId = res.data.id || res.data.attemptId;
        navigate(`/exam/${attemptId}/greeting`);
      } catch (e) {
        console.error(e);
        if (e.response?.status === 403) navigate('/upgrade');
      } finally {
        setTodayBusy(false);
      }
    }
  };

  const runFocusPaperStart = async paperId => {
    if (!paperId) return;
    setFocusBusy(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/attempts`,
        { paperId },
        api()
      );
      const attemptId = res.data.id || res.data.attemptId;
      navigate(`/exam/${attemptId}/greeting`);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 403) navigate('/upgrade');
    } finally {
      setFocusBusy(false);
    }
  };

  const dateInputMin = todayInputMinISO();

  if (loading) {
    return (
      <div
        className="dash-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <style>{`
          .dash-page { box-sizing: border-box; }
          .dash-skel { background: #E2E8F0; border-radius: 16px; animation: dashPulse 1.2s ease-in-out infinite; }
          @keyframes dashPulse { 0%,100%{ opacity:1 } 50%{ opacity:0.55 } }
          @media (max-width: 767px) {
            .dash-hero-inner { flex-direction: column !important; }
            .dash-session-row { flex-direction: column !important; align-items: stretch !important; }
          }
          @media (max-width: 639px) {
            .dash-page-inner { padding: 16px !important; }
            .dash-skill-grid { grid-template-columns: 1fr !important; }
            .dash-bottom-row { grid-template-columns: 1fr !important; }
          }
          @media (min-width: 640px) and (max-width: 1023px) {
            .dash-skill-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
        <StudentNav active="dashboard" />
        <div
          className="dash-page-inner"
          style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 48px' }}
        >
          <div className="dash-skel" style={{ height: 200, marginBottom: 32, borderRadius: 24 }} />
          <div className="dash-skel" style={{ height: 120, marginBottom: 32 }} />
          <div
            className="dash-skill-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="dash-skel" style={{ height: 140 }} />
            ))}
          </div>
          <div className="dash-skel" style={{ height: 220, marginBottom: 32 }} />
          <div className="dash-bottom-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="dash-skel" style={{ height: 160 }} />
            <div className="dash-skel" style={{ height: 160 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dash-page"
      style={{
        minHeight: '100vh',
        background: C.pageBg,
        fontFamily: 'Inter, sans-serif',
        color: C.text,
      }}
    >
      <style>{`
        .dash-page { box-sizing: border-box; }
        * { box-sizing: border-box; }
        @keyframes dashPulse { 0%,100%{ opacity:1 } 50%{ opacity:0.55 } }
        @keyframes bandFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes skillDrawerBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sessionGlow {
          0%, 100% { box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 0 0 0 rgba(79,70,229,0.12); }
          50% { box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 0 20px 2px rgba(79,70,229,0.14); }
        }
        .dash-exam-pill-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          max-width: 100%;
          flex-wrap: wrap;
        }
        .dash-exam-clear-visible {
          opacity: 0;
          transition: opacity ${C.transition};
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: ${C.textMuted};
          padding: 2px;
          line-height: 1;
          flex-shrink: 0;
        }
        .dash-exam-pill-wrap:hover .dash-exam-clear-visible,
        .dash-exam-pill-wrap:focus-within .dash-exam-clear-visible {
          opacity: 1;
        }
        .dash-band-num { animation: bandFadeIn 400ms ease-out 1 forwards; opacity: 0; }
        .dash-lift {
          transition: transform ${C.transition}, box-shadow ${C.transition}, border-color ${C.transition};
        }
        .dash-lift:hover {
          transform: translateY(-2px);
          box-shadow: ${C.shadowHover};
        }
        .dash-skill-card:hover {
          transform: translateY(-2px);
          box-shadow: ${C.shadowHover};
        }
        .dash-skill-card { transition: transform ${C.transition}, box-shadow ${C.transition}, border-color ${C.transition}; }
        .dash-skill-card.skill-READING:hover {
          border-color: #2563EB !important;
        }
        .dash-skill-card.skill-WRITING:hover {
          border-color: #D97706 !important;
        }
        .dash-skill-card.skill-LISTENING:hover {
          border-color: #7C3AED !important;
        }
        .dash-skill-card.skill-SPEAKING:hover {
          border-color: #DB2777 !important;
        }
        .dash-row-hover { transition: background ${C.transition}; }
        .dash-row-hover:hover { background: #F8FAFC; }
        .dash-session-pulse { animation: sessionGlow 2s ease-in-out infinite; }
        @media (max-width: 767px) {
          .dash-hero-inner { flex-direction: column !important; }
          .dash-session-row { flex-direction: column !important; align-items: stretch !important; }
        }
        @media (max-width: 639px) {
          .dash-page-inner { padding: 16px !important; }
          .dash-hero { padding: 16px !important; }
          .dash-hero-band-card { padding: 16px !important; }
          .dash-session-card { padding: 16px !important; }
          .dash-skill-grid { grid-template-columns: 1fr !important; }
          .dash-bottom-row { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .dash-skill-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      <StudentNav active="dashboard" />
      <div
        className="dash-page-inner"
        style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 48px' }}
      >
        {/* Hero */}
        <div
          className="dash-hero"
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 32,
            padding: 32,
            borderRadius: 24,
            background: `linear-gradient(135deg, ${C.primarySoft} 0%, ${C.accentSoft} 100%)`,
            boxShadow: C.shadowHero,
          }}
        >
          <svg
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.4,
            }}
            aria-hidden
          >
            <defs>
              <radialGradient id="dashBlob1" cx="0%" cy="0%" r="60%">
                <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="dashBlob2" cx="100%" cy="100%" r="50%">
                <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashBlob1)" />
            <rect width="100%" height="100%" fill="url(#dashBlob2)" />
          </svg>
          <div
            className="dash-hero-inner"
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 32,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  margin: '0 0 16px',
                  lineHeight: 1.2,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Hello, {firstName} 👋
              </h1>
              <div style={{ marginBottom: 16 }}>
                {editingExamDate ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      type="date"
                      min={dateInputMin}
                      value={examDraft}
                      onChange={e => {
                        const v = e.target.value;
                        setExamDraft(v);
                        if (v) persistExamDate(v);
                      }}
                      onBlur={() => setEditingExamDate(false)}
                      autoFocus
                      style={{
                        padding: '6px 10px',
                        fontSize: 13,
                        fontFamily: 'Inter, sans-serif',
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 10,
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Cancel editing exam date"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => setEditingExamDate(false)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: 16,
                        color: C.textMuted,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : daysToExam === null ? (
                  <button
                    type="button"
                    onClick={openExamEditor}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 12px',
                      borderRadius: 9999,
                      border: `1px dashed ${C.primary}`,
                      background: 'rgba(79,70,229,0.08)',
                      color: C.primary,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    📅 Set your exam date
                  </button>
                ) : daysToExam > 0 ? (
                  <div className="dash-exam-pill-wrap">
                    <button
                      type="button"
                      onClick={openExamEditor}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '4px 12px',
                        borderRadius: 9999,
                        border: 'none',
                        background: C.primarySoft,
                        color: C.primary,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      📅 Exam in {daysToExam} day{daysToExam === 1 ? '' : 's'}
                    </button>
                    <button
                      type="button"
                      className="dash-exam-clear-visible"
                      aria-label="Clear exam date"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        try {
                          localStorage.removeItem('epicExamDate');
                        } catch { /* ignore */ }
                        setExamDate(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : daysToExam === 0 ? (
                  <button
                    type="button"
                    onClick={openExamEditor}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 12px',
                      borderRadius: 9999,
                      border: 'none',
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    📅 Exam is today — give it your best.
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openExamEditor}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 12px',
                      borderRadius: 9999,
                      border: 'none',
                      background: '#F1F5F9',
                      color: C.textSecondary,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'left',
                    }}
                  >
                    Exam was {Math.abs(daysToExam)} day
                    {Math.abs(daysToExam) === 1 ? '' : 's'} ago. Plan your next one →
                  </button>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {last7Cells.map(cell => (
                    <div
                      key={`${cell.key}-lab`}
                      style={{
                        width: 24,
                        textAlign: 'center',
                        fontSize: 11,
                        fontWeight: 500,
                        color: C.textMuted,
                        flexShrink: 0,
                      }}
                    >
                      {cell.label}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {last7Cells.map(cell => {
                    const base = {
                      width: 24,
                      height: 24,
                      borderRadius: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: `background-color ${C.transition}, border-color ${C.transition}`,
                      boxSizing: 'border-box',
                      flexShrink: 0,
                    };
                    if (cell.done && cell.isToday) {
                      return (
                        <div
                          key={`${cell.key}-dot`}
                          style={{
                            ...base,
                            background: C.primary,
                            border: `2px solid ${C.primary}`,
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </div>
                      );
                    }
                    if (cell.done) {
                      return (
                        <div
                          key={`${cell.key}-dot`}
                          style={{
                            ...base,
                            background: C.primary,
                            border: `2px solid ${C.primary}`,
                          }}
                        />
                      );
                    }
                    if (cell.isToday) {
                      return (
                        <div
                          key={`${cell.key}-dot`}
                          style={{
                            ...base,
                            background: 'transparent',
                            border: `2px solid ${C.primary}`,
                          }}
                        />
                      );
                    }
                    return (
                      <div
                        key={`${cell.key}-dot`}
                        style={{
                          ...base,
                          background: '#F1F5F9',
                          border: '2px solid transparent',
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, marginTop: 8 }}>
                  Last 7 days · {streak}-day streak
                </div>
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1.35 }}>
                  {coach.headline}
                </div>
                <div style={{ fontSize: 14, fontWeight: 400, color: C.textSecondary, marginTop: 4, lineHeight: 1.5 }}>
                  {coach.sub}
                </div>
              </div>
            </div>
            <div
              className="dash-hero-band-wrap"
              style={{
                flex: '0 1 320px',
                width: '100%',
                maxWidth: 360,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <div
                className="dash-hero-band-card"
                style={{
                  background: C.cardBg,
                  borderRadius: 20,
                  padding: 32,
                  border: `1px solid ${C.cardBorder}`,
                  boxShadow: C.shadow,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: C.textMuted,
                    marginBottom: 8,
                  }}
                >
                  YOUR BAND
                </div>
                <div
                  className="dash-band-num"
                  style={{
                    fontSize: 72,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: currentBand != null ? C.primary : '#CBD5E1',
                    lineHeight: 1,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {currentBand != null ? Number(currentBand).toFixed(1) : '—'}
                </div>
                <div
                  style={{
                    width: 40,
                    height: 1,
                    background: C.cardBorder,
                    margin: '12px auto',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {!editingTarget ? (
                    <>
                      <span style={{ fontSize: 13, color: C.textSecondary }}>Target:</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                        {Number(targetBand).toFixed(1)}
                      </span>
                      <button
                        type="button"
                        aria-label="Edit target band"
                        onClick={() => {
                          setEditingTarget(true);
                          setTargetDraft(String(targetBand));
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          color: C.textMuted,
                          lineHeight: 1,
                          transition: `color ${C.transition}`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.text; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; }}
                      >
                        ✎
                      </button>
                    </>
                  ) : (
                    <input
                      type="number"
                      min={4}
                      max={9}
                      step={0.5}
                      value={targetDraft}
                      onChange={e => setTargetDraft(e.target.value)}
                      onBlur={saveTarget}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveTarget();
                      }}
                      autoFocus
                      style={{
                        width: 80,
                        padding: '6px 8px',
                        fontSize: 13,
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 8,
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    />
                  )}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, fontWeight: 500 }}>
                  {currentBand == null ? null : goalReached ? (
                    <span style={{ color: C.success }}>🎯 Goal reached</span>
                  ) : (
                    <span style={{ color: C.warning }}>{gapBands != null ? `${gapBands.toFixed(1)} to go` : ''}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's session */}
        <div
          className="dash-session-card"
          style={{
            marginBottom: 32,
            padding: 24,
            borderRadius: 16,
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            boxShadow: C.shadow,
          }}
        >
          <div
            className="dash-session-row"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
            }}
          >
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: C.primary,
                  marginBottom: 8,
                }}
              >
                TODAY&apos;S SESSION
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1.35 }}>
                {recommendation.headline}
              </div>
              <p style={{ fontSize: 14, color: C.textSecondary, margin: '8px 0 0', lineHeight: 1.5 }}>
                {recommendation.sub}
              </p>
            </div>
            <button
              type="button"
              disabled={todayBusy}
              className={pulseSessionBtn ? 'dash-session-pulse' : ''}
              onClick={runTodaySession}
              style={{
                flexShrink: 0,
                padding: '12px 20px',
                borderRadius: 12,
                border: 'none',
                cursor: todayBusy ? 'wait' : 'pointer',
                background: C.primary,
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                boxShadow: C.shadow,
                transition: `background ${C.transition}, box-shadow ${C.transition}, transform ${C.transition}`,
                opacity: todayBusy ? 0.75 : 1,
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => {
                if (!todayBusy) e.currentTarget.style.background = C.primaryHover;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = C.primary;
              }}
            >
              {todayBusy ? 'Starting…' : recommendation.cta}
            </button>
          </div>
        </div>

        {weakestSkillCallout != null && (
          <div
            style={{
              marginBottom: 32,
              padding: 20,
              borderRadius: 16,
              border: '1px solid #FCD34D',
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div style={{ flex: '1 1 220px', minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#B45309',
                  marginBottom: 8,
                }}
              >
                ⚠️ FOCUS AREA
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>
                Your {SKILL_LABEL[weakestSkillCallout.skill]} is{' '}
                {weakestSkillCallout.gap.toFixed(1)} bands below your other skills.
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, color: C.textSecondary, marginTop: 4, lineHeight: 1.5 }}>
                {weakestSkillCallout.recommendedPaper
                  ? `Try ${weakestSkillCallout.recommendedPaper.title || weakestSkillCallout.recommendedPaper.paperCode} — the next step for ${SKILL_LABEL[weakestSkillCallout.skill]}.`
                  : `Keep practising ${SKILL_LABEL[weakestSkillCallout.skill]} to balance your performance.`}
              </div>
            </div>
            {weakestSkillCallout.recommendedPaper ? (
              <button
                type="button"
                disabled={focusBusy}
                onClick={() => runFocusPaperStart(weakestSkillCallout.recommendedPaper.id)}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: focusBusy ? 'wait' : 'pointer',
                  background: '#D97706',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  opacity: focusBusy ? 0.85 : 1,
                  transition: `background ${C.transition}`,
                }}
                onMouseEnter={e => {
                  if (!focusBusy) e.currentTarget.style.background = '#B45309';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#D97706';
                }}
              >
                {focusBusy
                  ? 'Starting…'
                  : `Start ${weakestSkillCallout.recommendedPaper.paperCode || 'paper'} →`}
              </button>
            ) : null}
          </div>
        )}

        {/* Skill grid */}
        <div
          className="dash-skill-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {SKILL_ORDER.map(skill => {
            const st = skillStats[skill];
            const meta = SKILL_STYLE[skill];
            return (
              <div
                key={skill}
                role="button"
                tabIndex={0}
                className={`dash-skill-card skill-${skill}`}
                onClick={() => onSkillCardClick(skill)}
                onKeyDown={e => {
                  if (e.key === ' ') e.preventDefault();
                  if (e.key === 'Enter' || e.key === ' ') onSkillCardClick(skill);
                }}
                style={{
                  background: C.cardBg,
                  borderRadius: 16,
                  padding: 20,
                  border: `1px solid ${C.cardBorder}`,
                  borderTop: `4px solid ${meta.top}`,
                  boxShadow: C.shadow,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>{SKILL_ICONS[skill]}</span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: C.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {SKILL_LABEL[skill]}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
                    {st.papersDone} done
                  </span>
                </div>
                <div style={{ height: 24, marginBottom: 24 }}>
                  <SvgSparkline values={st.spark} stroke={meta.stroke} dashed={st.dashed} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: st.latest != null ? meta.stroke : '#CBD5E1',
                    }}
                  >
                    {st.latest != null ? Number(st.latest).toFixed(1) : '—'}
                  </span>
                  {st.trend != null && st.spark.length >= 2 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 9999,
                        padding: '2px 8px',
                        ...(st.trend > 0
                          ? { background: '#ECFDF5', color: C.success }
                          : st.trend < 0
                            ? { background: '#FFFBEB', color: C.warning }
                            : { background: '#F1F5F9', color: C.neutralBand }),
                      }}
                    >
                      {st.trend > 0 ? `▲ +${st.trend.toFixed(1)}` : st.trend < 0 ? `▼ ${st.trend.toFixed(1)}` : '● 0.0'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent activity */}
        <div
          style={{
            marginBottom: 32,
            padding: 24,
            borderRadius: 16,
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            boxShadow: C.shadow,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: C.text,
              margin: '0 0 16px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Recent activity
          </h2>
          {totalCompleted === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textSecondary }}>No papers yet</div>
              <p style={{ fontSize: 15, color: C.textMuted, margin: '8px 0 0' }}>
                Start your placement test or pick a practice paper above.
              </p>
            </div>
          ) : (
            <>
              {narrative && (
                <p style={{ fontSize: 15, color: '#334155', margin: '0 0 24px', lineHeight: 1.5 }}>
                  In the last {narrative.N} days you&apos;ve done {narrative.X} paper
                  {narrative.X === 1 ? '' : 's'}. Average band: {narrative.avg}.
                </p>
              )}
              <div>
                {lastFiveForNarrative.map((attempt, idx) => {
                  const skill = attempt.paper?.testType || 'READING';
                  const band = getBand(attempt);
                  const route = RESULT_ROUTES[skill] || 'results';
                  const isLast = idx === lastFiveForNarrative.length - 1;
                  return (
                    <div
                      key={attempt.id}
                      role="button"
                      tabIndex={0}
                      className="dash-row-hover"
                      onClick={() => navigate(`/exam/${attempt.id}/${route}`)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') navigate(`/exam/${attempt.id}/${route}`);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: isLast ? 'none' : `1px solid ${C.subtleBorder}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ minWidth: 0, paddingRight: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 20 }}>{SKILL_ICONS[skill]}</span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>
                            {attempt.paper?.title || SKILL_LABEL[skill]}
                          </span>
                          {attempt.paper?.paperCode && (
                            <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>
                              {attempt.paper.paperCode}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                          {relativeTime(attempt.endedAt || attempt.startedAt)}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color: band != null ? bandSemanticColor(band) : C.textMuted,
                          flexShrink: 0,
                        }}
                      >
                        {band != null ? Number(band).toFixed(1) : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalCompleted > 5 && (
                <button
                  type="button"
                  onClick={() => navigate('/practice')}
                  style={{
                    marginTop: 24,
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.primary,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    textDecoration: 'none',
                  }}
                >
                  View all results →
                </button>
              )}
            </>
          )}
        </div>

        {/* Bottom row */}
        <div
          className="dash-bottom-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <div
            role="button"
            tabIndex={0}
            className="dash-lift"
            onClick={() => navigate('/practice')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') navigate('/practice');
            }}
            style={{
              padding: 24,
              borderRadius: 16,
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              boxShadow: C.shadow,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#2563EB',
              }}
            >
              PRACTICE
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginTop: 8 }}>All papers</div>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '8px 0 16px' }}>
              {totalPapers} papers · {completedPaperCount} done
            </p>
            <div style={{ height: 4, background: '#F1F5F9', borderRadius: 9999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, practiceProgress)}%`,
                  background: '#3B82F6',
                  borderRadius: 9999,
                  transition: `width ${C.transition}`,
                }}
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18, color: C.textMuted }}>→</div>
          </div>

          <div
            role="button"
            tabIndex={0}
            className="dash-lift"
            onClick={() => navigate(myLevels.placementDone ? '/levels' : '/placement-test')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate(myLevels.placementDone ? '/levels' : '/placement-test');
              }
            }}
            style={{
              padding: 24,
              borderRadius: 16,
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              boxShadow: C.shadow,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: C.accent,
              }}
            >
              PROGRAMME
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginTop: 8 }}>My pathway</div>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '8px 0 16px' }}>
              {myLevels.placementDone
                ? `Level ${levelInfo.level} ${levelInfo.name}`
                : 'Take placement test to unlock'}
            </p>
            <div style={{ height: 4, background: '#F1F5F9', borderRadius: 9999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: myLevels.placementDone ? '100%' : '0%',
                  background: '#8B5CF6',
                  borderRadius: 9999,
                  transition: `width ${C.transition}`,
                }}
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18, color: C.textMuted }}>→</div>
          </div>
        </div>
      </div>

      {openSkillDrawer && (
        <>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
          <div
            className="skill-drawer-backdrop"
            role="presentation"
            onClick={() => setOpenSkillDrawer(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              zIndex: 300,
              animation: 'skillDrawerBackdropIn 200ms ease-out forwards',
            }}
          />

          <div
            className={`skill-drawer-panel ${skillDrawerEntered ? 'skill-drawer-panel-open' : ''}`}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '100vw',
              maxWidth: 480,
              background: '#FFFFFF',
              boxShadow: '-20px 0 40px rgba(15,23,42,0.08)',
              zIndex: 301,
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateX(100%)',
              transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {(() => {
              const skill = openSkillDrawer;
              const meta = SKILL_STYLE[skill];
              const st = skillStats[skill];
              const recent = [...completedAttempts]
                .filter(a => (a.paper?.testType || 'READING') === skill)
                .sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt))
                .slice(0, 5);
              const progBands = [...completedAttempts]
                .filter(a => (a.paper?.testType || 'READING') === skill)
                .sort((a, b) => new Date(a.endedAt || a.startedAt) - new Date(b.endedAt || b.startedAt))
                .map(a => getBand(a))
                .filter(v => v != null && Number.isFinite(Number(v)));
              const progNumeric = progBands.map(Number);
              const progBest =
                progNumeric.length > 0 ? Math.max(...progNumeric) : null;
              const progAvg =
                progNumeric.length > 0
                  ? (progNumeric.reduce((s, v) => s + v, 0) / progNumeric.length).toFixed(1)
                  : null;
              const dashedProg = progNumeric.length < 2;
              const latestAttempt = completedAttempts
                .filter(a => (a.paper?.testType || 'READING') === skill)
                .sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt))[0];

              const t1Band = latestAttempt?.writingSubmission?.task1Band ?? null;
              const t2Band = latestAttempt?.writingSubmission?.task2Band ?? null;
              const t1Ok = t1Band != null && Number.isFinite(Number(t1Band));
              const t2Ok = t2Band != null && Number.isFinite(Number(t2Band));
              const spSub = latestAttempt?.speakingSubmission;
              const spOverall = spSub?.overallBand;
              const spMark = spSub?.markingStatus;
              const transcript =
                typeof spSub?.transcript === 'string' && spSub.transcript.trim() ? spSub.transcript.trim() : null;

              const writingBar = (label, bb, bbOk) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.textSecondary }}>{label}</span>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: bbOk ? bandSemanticColor(bb) : C.textMuted,
                      }}
                    >
                      {bbOk ? Number(bb).toFixed(1) : '—'}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 9999,
                      background: '#F1F5F9',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: bbOk ? `${Math.min(100, Math.max(0, (Number(bb) / 9) * 100))}%` : 0,
                        borderRadius: 9999,
                        background: bbOk ? `${meta.stroke}` : '#E2E8F0',
                        opacity: bbOk ? 0.85 : 0.35,
                        transition: 'width 260ms cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                </div>
              );

              return (
                <>
                  <div
                    style={{
                      flexShrink: 0,
                      padding: 24,
                      borderBottom: `1px solid ${C.subtleBorder}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 28, lineHeight: 1 }}>{SKILL_ICONS[skill]}</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{SKILL_LABEL[skill]}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                        <span
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            color: st.latest != null ? meta.stroke : '#CBD5E1',
                          }}
                        >
                          {st.latest != null ? Number(st.latest).toFixed(1) : '—'}
                        </span>
                        {st.trend != null && st.spark.length >= 2 && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 9999,
                              padding: '2px 8px',
                              ...(st.trend > 0
                                ? { background: '#ECFDF5', color: C.success }
                                : st.trend < 0
                                  ? { background: '#FFFBEB', color: C.warning }
                                  : { background: '#F1F5F9', color: C.neutralBand }),
                            }}
                          >
                            {st.trend > 0
                              ? `▲ +${st.trend.toFixed(1)}`
                              : st.trend < 0
                                ? `▼ ${st.trend.toFixed(1)}`
                                : '● 0.0'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Close drawer"
                      onClick={() => setOpenSkillDrawer(null)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                        background: 'transparent',
                        color: C.textSecondary,
                        fontSize: 18,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: `background ${C.transition}, color ${C.transition}`,
                        fontFamily: 'Inter, sans-serif',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#F1F5F9';
                        e.currentTarget.style.color = C.text;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = C.textSecondary;
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '0 0 12px' }}>
                      Recent attempts
                    </h3>
                    {recent.length === 0 ? (
                      <div style={{ fontSize: 13, color: C.textMuted }}>
                        No {SKILL_LABEL[skill]} attempts yet.
                      </div>
                    ) : (
                      recent.map((attempt, ai) => {
                        const isoLast = ai === recent.length - 1;
                        const rb = getBand(attempt);
                        const rRoute = RESULT_ROUTES[skill] || 'results';
                        return (
                          <div
                            key={attempt.id}
                            role="presentation"
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 0',
                              borderBottom: isoLast ? 'none' : `1px solid ${C.subtleBorder}`,
                              gap: 12,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>
                                  {attempt.paper?.title || SKILL_LABEL[skill]}
                                </span>
                                {attempt.paper?.paperCode && (
                                  <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 6 }}>
                                    {attempt.paper.paperCode}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                                {relativeTime(attempt.endedAt || attempt.startedAt)}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <span
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  fontVariantNumeric: 'tabular-nums',
                                  color: rb != null ? bandSemanticColor(rb) : C.textMuted,
                                }}
                              >
                                {rb != null ? Number(rb).toFixed(1) : '—'}
                              </span>
                              <button
                                type="button"
                                aria-label="View result"
                                onClick={() => {
                                  navigate(`/exam/${attempt.id}/${rRoute}`);
                                  setOpenSkillDrawer(null);
                                }}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: C.primary,
                                  fontSize: 18,
                                  padding: 4,
                                  lineHeight: 1,
                                  fontFamily: 'inherit',
                                }}
                              >
                                →
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {skill === 'WRITING' && (
                      <>
                        <h3
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.text,
                            margin: '24px 0 12px',
                          }}
                        >
                          Latest writing breakdown
                        </h3>
                        {latestAttempt?.writingSubmission ? (
                          (t1Ok || t2Ok ? (
                            <>
                              {writingBar('Task 1', t1Band, t1Ok)}
                              {writingBar('Task 2', t2Band, t2Ok)}
                            </>
                          ) : (
                            <div style={{ fontSize: 13, color: C.textMuted }}>
                              Detailed breakdown not available for this attempt.
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: 13, color: C.textMuted }}>
                            Detailed breakdown not available for this attempt.
                          </div>
                        )}
                      </>
                    )}

                    {skill === 'SPEAKING' && latestAttempt?.speakingSubmission && (
                      <>
                        <h3
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.text,
                            margin: '24px 0 12px',
                          }}
                        >
                          Latest speaking detail
                        </h3>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            color:
                              spOverall != null && Number.isFinite(Number(spOverall))
                                ? bandSemanticColor(spOverall)
                                : C.textMuted,
                            marginBottom: 10,
                          }}
                        >
                          {spOverall != null && Number.isFinite(Number(spOverall))
                            ? Number(spOverall).toFixed(1)
                            : '—'}
                        </div>
                        {spMark === 'COMPLETE' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 9999,
                              padding: '4px 10px',
                              background: '#ECFDF5',
                              color: C.success,
                              marginBottom: 12,
                            }}
                          >
                            COMPLETE
                          </span>
                        ) : (
                          <div style={{ fontSize: 13, fontWeight: 500, color: C.textMuted, marginBottom: 12 }}>
                            Marking in progress…
                          </div>
                        )}
                        {transcript && latestAttempt?.id ? (
                          <div style={{ marginTop: transcript ? 8 : 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontStyle: 'italic',
                                color: C.textSecondary,
                                lineHeight: 1.5,
                              }}
                            >
                              {transcript.slice(0, 150)}
                              {transcript.length > 150 ? '…' : ''}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigate(`/exam/${latestAttempt.id}/speaking-results`);
                                setOpenSkillDrawer(null);
                              }}
                              style={{
                                marginTop: 8,
                                border: 'none',
                                background: 'none',
                                padding: 0,
                                fontSize: 13,
                                fontWeight: 500,
                                color: C.primary,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                fontFamily: 'Inter, sans-serif',
                              }}
                            >
                              Read more →
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}

                    {(skill === 'READING' || skill === 'LISTENING') && (
                      <>
                        <h3
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.text,
                            margin: '24px 0 12px',
                          }}
                        >
                          Score progression
                        </h3>
                        <div style={{ width: 300, maxWidth: '100%', height: 60, marginBottom: 8 }}>
                          <SvgSparkline
                            values={progNumeric}
                            stroke={meta.stroke}
                            dashed={dashedProg}
                            stretch
                          />
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>
                          Best:{' '}
                          <span style={{ fontWeight: 600, color: C.text }}>
                            {progBest != null ? Number(progBest).toFixed(1) : '—'}
                          </span>
                          {' · '}Average:{' '}
                          <span style={{ fontWeight: 600, color: C.text }}>{progAvg ?? '—'}</span>
                          {' · '}Attempts:{` ${progNumeric.length}`}
                        </div>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/practice?skill=${skill}`);
                        setOpenSkillDrawer(null);
                      }}
                      style={{
                        marginTop: 24,
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.primary,
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      View all {SKILL_LABEL[skill]} papers →
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
          <style>{`
            .skill-drawer-panel.skill-drawer-panel-open {
              transform: translateX(0) !important;
            }
            @media (max-width: 639px) {
              .skill-drawer-panel {
                max-width: none !important;
                width: 100vw !important;
              }
            }
          `}</style>
        </>
      )}
      <AgentWidget />
    </div>
  );
}
