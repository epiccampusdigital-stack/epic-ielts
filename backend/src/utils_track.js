// Track helpers: IELTS (default, existing content) or GENERAL (General English).
const TRACKS = ['IELTS', 'GENERAL'];

function normalizeTrack(value, fallback = 'IELTS') {
  const v = String(value || '').toUpperCase().trim();
  if (v === 'GE' || v === 'GENERAL_ENGLISH') return 'GENERAL';
  return TRACKS.includes(v) ? v : fallback;
}

// Explicit track wins; otherwise paper codes starting with "GE" are General English.
function trackForPaper(explicit, paperCode) {
  if (explicit) return normalizeTrack(explicit);
  return /^GE[-_]?/i.test(String(paperCode || '')) ? 'GENERAL' : 'IELTS';
}

module.exports = { TRACKS, normalizeTrack, trackForPaper };
