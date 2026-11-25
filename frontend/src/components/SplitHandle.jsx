// Phones and small tablets: the exam shows the question (top) and the answers (bottom) together.
// The bar between them can be dragged, or nudged with the arrow buttons, to give either part more room.
import { useCallback, useEffect, useRef, useState } from 'react';

export function useSplit(key, start = 45) {
  const [v, setV] = useState(() => {
    try { const n = parseInt(localStorage.getItem(key), 10); return n >= 15 && n <= 85 ? n : start; } catch { return start; }
  });
  useEffect(() => { try { localStorage.setItem(key, String(v)); } catch { /* storage blocked */ } }, [key, v]);
  return [v, setV];
}

export const SPLIT_CSS = `
.split-handle { display: none; }
@media (max-width: 1023px) {
  .exam-layout { flex-direction: column !important; }
  .exam-layout > .passage-section { flex: 0 0 var(--split, 45%) !important; height: auto !important; max-height: none !important; min-height: 0 !important; border-right: 0 !important; border-bottom: 0 !important; overflow-y: auto !important; }
  .exam-layout > .questions-section { flex: 1 1 0 !important; height: auto !important; max-height: none !important; min-height: 0 !important; overflow-y: auto !important; }
  .split-handle { display: flex; flex: none; align-items: center; gap: 8px; height: 32px; padding: 0 8px 0 12px; background: #e8eef7; border-top: 1px solid #c9d6ea; border-bottom: 1px solid #c9d6ea; touch-action: none; user-select: none; -webkit-user-select: none; cursor: row-resize; position: relative; z-index: 2; }
  .split-handle .grip { width: 34px; height: 5px; border-radius: 3px; background: #8aa0c2; flex: none; }
  .split-handle button { border: 0; background: #fff; color: #0056d2; width: 30px; height: 22px; border-radius: 6px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.12); }
  .split-handle .lbl { flex: 1; min-width: 0; font-size: 11.5px; color: #44506a; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}
`;

export default function SplitHandle({ layoutRef, value, onChange, label = 'Drag to resize' }) {
  const dragging = useRef(false);
  const setFromY = useCallback(y => {
    const el = layoutRef.current; if (!el) return;
    const r = el.getBoundingClientRect(); if (!r.height) return;
    onChange(Math.round(Math.min(85, Math.max(15, ((y - r.top) / r.height) * 100))));
  }, [layoutRef, onChange]);
  const down = e => { if (e.target.closest('button')) return; dragging.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* old browser */ } };
  const move = e => { if (dragging.current) setFromY(e.clientY); };
  const up = () => { dragging.current = false; };
  return (
    <div className="split-handle" role="separator" aria-orientation="horizontal" aria-label={label}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <span className="lbl">{label}</span>
      <span className="grip" />
      <button type="button" aria-label="Show more of the top part" onClick={() => onChange(Math.min(85, value + 15))}>▼</button>
      <button type="button" aria-label="Show more of the bottom part" onClick={() => onChange(Math.max(15, value - 15))}>▲</button>
    </div>
  );
}
