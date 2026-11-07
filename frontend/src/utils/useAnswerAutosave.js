import { useEffect, useRef } from 'react';
import API_URL from '../api';

// Saves exam answers to the student's account:
//  - 1.5 seconds after any change
//  - every 20 seconds as a backup
//  - when the student leaves the page, closes the tab or switches away
// so going out of a paper and back in never loses answers.
// A copy is also kept in this browser, so a refresh brings answers back at once,
// even if the save to the server had not finished yet.
const localKey = id => `epic-answers-${id}`;
export function localAnswers(attemptId) {
  try { const d = JSON.parse(localStorage.getItem(localKey(attemptId)) || 'null'); return d && d.answers ? d.answers : {}; } catch { return {}; }
}
export function keepLocal(attemptId, answers) {
  try { localStorage.setItem(localKey(attemptId), JSON.stringify({ at: Date.now(), answers })); } catch { /* storage full or blocked */ }
}

export default function useAnswerAutosave(attemptId, answers, answersRef, enabled) {
  const lastSaved = useRef('');

  const payload = () => Object.entries(answersRef.current || {})
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([questionId, answer]) => ({ questionId: parseInt(questionId, 10), studentAnswer: String(answer) }));

  const save = (keepalive = false) => {
    if (!attemptId) return;
    const list = payload();
    if (!list.length) return;
    const body = JSON.stringify({ answers: list });
    if (body === lastSaved.current) return;
    lastSaved.current = body;
    try {
      fetch(`${API_URL}/api/attempts/${attemptId}/autosave`, {
        method: 'PUT',
        keepalive,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body,
      }).then(r => { if (!r.ok) lastSaved.current = ''; }).catch(() => { lastSaved.current = ''; });
    } catch { lastSaved.current = ''; }
  };
  const saveRef = useRef(save);
  saveRef.current = save;

  // shortly after each change (and straight away in this browser)
  useEffect(() => {
    if (!enabled) return undefined;
    keepLocal(attemptId, { ...(answersRef.current || {}), ...(answers || {}) });
    const t = setTimeout(() => saveRef.current(), 1500);
    return () => clearTimeout(t);
  }, [answers, enabled]);

  // backup timer + leaving the page
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => saveRef.current(), 20000);
    const onHide = () => saveRef.current(true);
    const onVis = () => { if (document.visibilityState === 'hidden') saveRef.current(true); };
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('beforeunload', onHide);
      document.removeEventListener('visibilitychange', onVis);
      saveRef.current(true); // leaving the exam page inside the site
    };
  }, [attemptId, enabled]);

  return save;
}
