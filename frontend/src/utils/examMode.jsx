// Exam tab papers (status EXAM_LOCKED / EXAM_OPEN): full screen while working, no word meanings,
// and after submitting a part the student goes back to the Exam tab (which starts the next part).
import { useEffect, useState } from 'react';

export const isExamPaper = paper => String(paper?.status || '').startsWith('EXAM');

export function enterFullscreen() {
  try {
    const el = document.documentElement;
    if (document.fullscreenElement) return;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen;
    const p = fn && fn.call(el);
    if (p && p.catch) p.catch(() => {});
  } catch { /* not allowed here */ }
}
export function exitFullscreen() {
  try {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) return;
    const fn = document.exitFullscreen || document.webkitExitFullscreen;
    const p = fn && fn.call(document);
    if (p && p.catch) p.catch(() => {});
  } catch { /* ignore */ }
}

export const afterExamSubmit = paper => `/exams?done=${paper?.id || ''}`;

// A small button that brings full screen back if the student pressed Esc.
export function FullscreenGuard({ active }) {
  const [full, setFull] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const on = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  if (!active || full || !document.fullscreenEnabled) return null;
  return (
    <button type="button" onClick={enterFullscreen}
      style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', top: 'calc(10px + env(safe-area-inset-top, 0px))', zIndex: 9999, background: '#d97706', color: '#fff', border: '2px solid #fff', borderRadius: 50, padding: '8px 16px', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 14px rgba(0,0,0,.25)', cursor: 'pointer', fontFamily: 'inherit' }}>
      ⛶ Back to full screen (exam)
    </button>
  );
}
