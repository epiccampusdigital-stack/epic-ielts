import { useEffect, useRef, useState } from 'react';

// Pop-up shown before a student ends a test, so a test is never ended by accident.
// It shows how many questions are answered and lists the unanswered ones (tap one to go to it).
// If anything is unanswered, "End test anyway" only unlocks after a few seconds.
const WAIT = 3;

export default function EndTestConfirm({ open, answered, total, unanswered = [], onBack, onEnd, onJump, title = 'End the test?', extra = null, unit = 'questions' }) {
  const [wait, setWait] = useState(WAIT);
  const backRef = useRef(null);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const missing = Math.max(0, total - answered);
  const allDone = missing === 0;

  useEffect(() => {
    if (!open) return undefined;
    setWait(allDone ? 0 : WAIT);
    const id = setInterval(() => setWait(w => (w > 0 ? w - 1 : 0)), 1000);
    setTimeout(() => backRef.current?.focus(), 30);
    const onKey = e => { if (e.key === 'Escape') onBackRef.current?.(); };
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(id); window.removeEventListener('keydown', onKey); };
  }, [open, allDone]);

  if (!open) return null;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  const shown = unanswered.slice(0, 40);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="etc-title" onClick={e => { if (e.target === e.currentTarget) onBack(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 16, fontFamily: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 18, width: 'min(480px, 100%)', boxShadow: '0 25px 60px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        <div style={{ background: allDone ? '#e9f7ee' : '#fff4e5', padding: '18px 24px', borderBottom: `1px solid ${allDone ? '#bfe5cc' : '#f6d9a8'}` }}>
          <div id="etc-title" style={{ fontSize: 22, fontWeight: 700, color: '#0f1114' }}>
            {allDone ? `All ${unit} answered` : `You have ${missing} ${missing === 1 ? unit.replace(/s$/, '') : unit} left`}
          </div>
          <div style={{ fontSize: 15, color: '#475569', marginTop: 2 }}>{title}</div>
        </div>
        <div style={{ padding: '18px 24px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 15, color: '#334155' }}>Answered</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: allDone ? '#15803d' : '#b45309', fontVariantNumeric: 'tabular-nums' }}>
              {answered} <span style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>of {total}</span>
            </span>
          </div>
          <div style={{ height: 10, borderRadius: 50, background: '#e8eef7', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: allDone ? '#16a34a' : '#f59e0b', borderRadius: 50 }} />
          </div>

          {extra}

          {!allDone && shown.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                Not answered yet{onJump ? ' (tap a number to go there)' : ''}:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {shown.map(n => (
                  <button key={n} type="button" onClick={() => onJump && onJump(n)} disabled={!onJump}
                    style={{ minWidth: 36, height: 34, borderRadius: 8, border: '1.5px solid #f59e0b', background: '#fffbeb', color: '#92400e', fontWeight: 800, fontSize: 14, cursor: onJump ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                    {n}
                  </button>
                ))}
                {unanswered.length > shown.length && <span style={{ alignSelf: 'center', color: '#64748b' }}>+{unanswered.length - shown.length} more</span>}
              </div>
            </div>
          )}

          <p style={{ fontSize: 14, color: '#64748b', margin: '16px 0 18px', lineHeight: 1.5 }}>
            {allDone ? 'Check your answers if you have time. ' : 'Unanswered questions get no marks. '}
            When you end the test, you cannot change your answers.
          </p>

          <div style={{ display: 'grid', gap: 10 }}>
            <button ref={backRef} type="button" onClick={onBack}
              style={{ height: 48, border: 0, borderRadius: 12, background: '#0056d2', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
              {allDone ? 'Go back and check' : 'Go back to my test'}
            </button>
            <button type="button" onClick={onEnd} disabled={wait > 0}
              style={{ height: 44, borderRadius: 12, border: '1.5px solid #dc2626', background: '#fff', color: wait > 0 ? '#f19999' : '#dc2626', fontWeight: 700, fontSize: 15, cursor: wait > 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {allDone ? 'Yes, end the test' : wait > 0 ? `End test anyway (${wait})` : 'End test anyway'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
