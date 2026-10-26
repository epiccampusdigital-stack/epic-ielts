// General English placement: parts, levels and per-part scores (no IELTS bands).

export const PARTS = [
  { skill: 'READING', label: 'Grammar, vocabulary & reading', short: 'Grammar & reading', time: '45 min',
    what: '20 grammar questions, 10 vocabulary questions and a short text with 10 questions.' },
  { skill: 'LISTENING', label: 'Listening', short: 'Listening', time: '20 min',
    what: 'Two short recordings, played twice. Use headphones.' },
  { skill: 'WRITING', label: 'Writing', short: 'Writing', time: '40 min',
    what: 'Two short tasks: write about yourself, then write a short email.' },
  { skill: 'SPEAKING', label: 'Speaking', short: 'Speaking', time: '12 min',
    what: 'Answer questions out loud. The microphone records your answers.' },
];

export function levelFor(score) {
  if (score == null) return null;
  if (score >= 90) return 'B2';
  if (score >= 75) return 'B1';
  if (score >= 50) return 'A2';
  if (score >= 25) return 'A1';
  return 'Pre-A1';
}

export const LEVEL_TEXT = {
  'Pre-A1': 'Just starting. Knows a few words and phrases.',
  A1: 'Beginner. Can use simple phrases about everyday things.',
  A2: 'Elementary. Can handle short, simple conversations and texts.',
  B1: 'Intermediate. Can deal with most everyday situations.',
  B2: 'Upper intermediate. Can talk and write about a wide range of topics.',
};

// Score out of 100 for one placement attempt, or a status when it is not ready yet
export function partScore(attempt) {
  if (!attempt) return { state: 'todo' };
  const t = attempt.paper?.testType;
  if (t === 'WRITING' || t === 'SPEAKING') {
    const sub = t === 'WRITING' ? attempt.writingSubmission : attempt.speakingSubmission;
    const raw = attempt.result?.rawScore;
    if (raw != null && sub?.markingStatus !== 'FAILED') return { state: 'done', score: Math.round(raw) };
    if (sub?.markingStatus === 'FAILED') return { state: 'failed' };
    return { state: 'marking' };
  }
  const raw = attempt.result?.rawScore;
  const total = attempt.paper?._count?.questions;
  if (raw == null || !total) return { state: 'marking' };
  return { state: 'done', score: Math.round((raw / total) * 100) };
}

export function isGePlacementPaper(p) {
  return p?.track === 'GENERAL' && String(p?.paperCode || '').startsWith('GE-PT');
}

