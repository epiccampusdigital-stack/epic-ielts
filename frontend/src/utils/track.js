// Which content track the student is browsing: IELTS (default) or GENERAL (General English).
const KEY = 'epicTrack';

export function getTrack() {
  try {
    return localStorage.getItem(KEY) === 'GENERAL' ? 'GENERAL' : 'IELTS';
  } catch {
    return 'IELTS';
  }
}

export function setTrack(track) {
  try {
    localStorage.setItem(KEY, track === 'GENERAL' ? 'GENERAL' : 'IELTS');
  } catch {
    /* storage blocked: stays on IELTS */
  }
  window.dispatchEvent(new CustomEvent('epic-track-change', { detail: getTrack() }));
}

export function trackLabel(track = getTrack()) {
  return track === 'GENERAL' ? 'General English' : 'IELTS';
}

// Query string helper: `?track=GENERAL`
export function trackParam(track = getTrack()) {
  return `track=${track}`;
}
