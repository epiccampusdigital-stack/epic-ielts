import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import { T } from '../theme';
import { enterFullscreen, exitFullscreen } from '../utils/examMode';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const card = { background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 20 };
const SKILL = { READING: 'Reading', WRITING: 'Writing', LISTENING: 'Listening', SPEAKING: 'Speaking' };

export default function Exams() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [exams, setExams] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [auto, setAuto] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [oneClock, setOneClock] = useState(true);
  const pending = useRef(null);

  const load = useCallback(() => axios.get(`${API_URL}/api/exams`, api())
    .then(r => { setExams(r.data.exams || []); setError(''); return r.data.exams || []; })
    .catch(() => { setError('Could not load the exams. Check your internet and refresh the page.'); return null; }), []);

  // Coming back after a part: stay in full screen only if another part of the same exam is waiting
  useEffect(() => {
    load().then(list => {
      const done = Number(params.get('done'));
      const exam = done && list ? list.find(e => e.parts.some(p => p.paperId === done)) : null;
      const next = exam && exam.parts.find(p => !p.done);
      if (!next) { exitFullscreen(); return; }
      // one-timer exams go straight on to the next part (the clock is already running)
      // one-timer exams: a 10-second pause on screen, then the next part opens by itself
      if ((exam.oneTimer || exam.autoNext) && exam.open) { pending.current = { exam, next }; setAuto(next.testType); setOneClock(!!exam.oneTimer); setCountdown(10); }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Locked exams open by themselves when the teacher unlocks them
  useEffect(() => { const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  async function startPart(exam, part) {
    enterFullscreen(); // must run inside the click
    setBusy(part.paperId);
    try {
      let id = part.attemptId;
      if (!id || !part.inProgress) {
        const r = await axios.post(`${API_URL}/api/attempts`, { paperId: part.paperId }, api());
        id = r.data.attemptId || r.data.id;
        if (!r.data.resumed) await axios.post(`${API_URL}/api/attempts/${id}/start`, {}, api());
      }
      setParams({});
      navigate(`/exam/${id}/${part.testType.toLowerCase()}`);
    } catch (e) {
      exitFullscreen();
      setBusy(''); setAuto('');
      const m = e.response?.data?.message;
      setError(m || 'Could not start the exam. Please try again.');
      load();
    }
  }

  const doneId = Number(params.get('done'));
  useEffect(() => {
    if (!auto || countdown <= 0) return undefined;
    const t = setTimeout(() => {
      if (countdown === 1 && pending.current) { const { exam, next } = pending.current; pending.current = null; startPart(exam, next); }
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [auto, countdown]); // eslint-disable-line react-hooks/exhaustive-deps

  if (auto) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: T.navy, color: '#fff', fontFamily: T.font, textAlign: 'center', padding: 16 }}>
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        <div style={{ fontSize: 15, letterSpacing: '.08em', color: '#b0e5fb', fontWeight: 700 }}>{oneClock ? 'PART SUBMITTED' : 'THIS PART IS FINISHED'}</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{SKILL[auto] || 'The next part'} starts automatically in</div>
        <div aria-live="polite" style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{countdown > 0 ? countdown : '…'}</div>
        <div style={{ color: T.navyText, fontSize: 16 }}>{countdown > 0 ? 'seconds. Take a breath and get ready.' : 'Opening now…'}</div>
        <div style={{ color: T.navyText, fontSize: 14 }}>{oneClock ? 'The exam timer keeps running.' : 'The next part has its own timer. It starts when the part opens.'}</div>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <StudentNav active="exams" />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 16px 64px', display: 'grid', gap: 16 }}>
        <div style={{ background: T.navy, color: '#fff', borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: '#b0e5fb' }}>EXAMS</div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 28 }}>Class exams</h1>
          <div style={{ fontSize: 15, color: T.navyText, lineHeight: 1.5 }}>Your teacher opens each exam in class. The exam fills the whole screen, there are no word meanings, and you can do each part only once.</div>
        </div>
        {error && <div style={{ ...card, background: T.errorSoft, borderColor: T.errorSoft, color: T.error, fontWeight: 600 }}>{error}</div>}
        {!exams && !error && <div style={card}>Loading…</div>}
        {exams && !exams.length && <div style={card}>No exams yet.</div>}
        {(exams || []).map(exam => {
          const next = exam.parts.find(p => !p.done);
          const allDone = !next;
          const justDone = exam.parts.find(p => p.paperId === doneId);
          return (
            <div key={exam.id} style={{ ...card, display: 'grid', gap: 14, borderColor: exam.open && !allDone ? T.primary : T.hairline, borderWidth: exam.open && !allDone ? 2 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'start' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24, color: T.navy }}>{exam.title}</h2>
                  <div style={{ color: T.muted, fontSize: 15, marginTop: 2 }}>{exam.subtitle} · {exam.totalMinutes} minutes in total</div>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: 50, fontWeight: 700, fontSize: 14, background: allDone ? T.successSoft : exam.open ? T.primarySoft : T.tint, color: allDone ? T.success : exam.open ? T.primary : T.muted }}>
                  {allDone ? '✓ Finished' : exam.open ? 'Open now' : '🔒 Locked'}
                </span>
              </div>

              {justDone && !allDone && <div style={{ background: T.successSoft, color: T.success, borderRadius: 10, padding: '10px 14px', fontWeight: 700 }}>
                Part {exam.parts.indexOf(justDone) + 1} is submitted. Start Part {exam.parts.indexOf(next) + 1} now: the timer starts when you press the button.
              </div>}

              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                {exam.parts.map((p, k) => {
                  const isNext = p === next;
                  return (
                    <li key={p.paperId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 12, background: isNext && exam.open ? T.primaryXSoft : '#f6f8fc', flexWrap: 'wrap' }}>
                      <span style={{ width: 30, height: 30, borderRadius: 50, display: 'grid', placeItems: 'center', fontWeight: 800, background: p.done ? T.success : isNext ? T.primary : T.hairline, color: p.done || isNext ? '#fff' : T.muted, flexShrink: 0 }}>{p.done ? '✓' : k + 1}</span>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Part {k + 1}: {SKILL[p.testType] || p.testType}</div>
                        <div style={{ color: T.muted, fontSize: 14 }}>{p.timeLimitMin} minutes{p.done ? ' · submitted' : p.inProgress ? ' · started, not submitted' : ''}</div>
                      </div>
                      {exam.open && isNext && (
                        <button type="button" disabled={!!busy} onClick={() => startPart(exam, p)}
                          style={{ height: 46, padding: '0 22px', borderRadius: 50, border: 0, background: T.primary, color: '#fff', fontWeight: 700, fontSize: 16, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                          {busy === p.paperId ? 'Starting…' : p.inProgress ? `Continue Part ${k + 1}` : k === 0 ? 'Start the exam' : `Start Part ${k + 1}`}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>

              {!exam.open && !allDone && <div style={{ color: T.muted, fontSize: 15 }}>This exam is locked. It opens when your teacher unlocks it, and this page updates by itself.</div>}
              {exam.open && !allDone && exam.oneTimer && <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.5 }}>One timer for the whole exam ({exam.totalMinutes} minutes). When you submit a part, the next part opens straight away and the clock keeps running, so there is no break. The exam fills the screen; if you leave full screen by mistake, press the orange "Back to full screen" button at the top.</div>}
              {exam.open && !allDone && !exam.oneTimer && exam.autoNext && <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.5 }}>Each part has its own timer ({exam.parts.map(p => `${SKILL[p.testType] || p.testType} ${p.timeLimitMin} min`).join(', ')}). When a part's time is up, or when you submit it, your answers are sent, a 10-second countdown shows, and the next part opens by itself. The exam fills the screen; if you leave full screen by mistake, press the orange "Back to full screen" button at the top.</div>}
              {exam.open && !allDone && !exam.oneTimer && !exam.autoNext && <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.5 }}>Do the parts in order, one after the other. When you press Start, the exam fills the screen. If you leave full screen by mistake, press the orange "Back to full screen" button at the top. When the time runs out, your answers are sent automatically.</div>}
              {allDone && exam.released === false && <div style={{ background: T.primaryXSoft, borderRadius: 12, padding: '14px 16px', color: T.ink, fontSize: 15, lineHeight: 1.5 }}>
                <b>Well done, you have finished this exam.</b> Your results are being marked. Your teacher will share your scores and answers in class.
              </div>}
              {allDone && exam.released !== false && <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ color: T.muted, fontSize: 15 }}>Well done, you have finished this exam. You cannot do it again, but you can see your results:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => navigate(`/exams/${exam.id}/results`)}
                    style={{ height: 42, padding: '0 20px', borderRadius: 50, border: 0, background: T.primary, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>See all results and answers ›</button>
                  {exam.parts.filter(p => p.attemptId).map(p => (
                    <button key={p.paperId} type="button" onClick={() => navigate(p.testType === 'WRITING' ? `/exam/${p.attemptId}/writing-results` : `/exam/${p.attemptId}/results`)}
                      style={{ height: 42, padding: '0 18px', borderRadius: 50, border: `1.5px solid ${T.primary}`, background: '#fff', color: T.primary, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>{SKILL[p.testType] || p.testType} results ›</button>
                  ))}
                </div>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
