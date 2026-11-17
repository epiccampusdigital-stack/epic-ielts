import { Fragment, useState } from 'react';

// Results page, Reading: each passage with the answers highlighted, then that passage's questions.
// Yellow = where the answer is (green border if the student got it right, red if wrong).
// Pink = words from the question that also appear in the passage (the "keywords" to scan for).
// Green underline = linking words (code words) that show where the writer is going.

const CODE_WORDS = ['however', 'but', 'although', 'though', 'yet', 'whereas', 'in contrast', 'on the other hand', 'instead',
  'because', 'as a result', 'therefore', 'for this reason', 'for these reasons', 'in addition', 'furthermore',
  'moreover', 'for example', 'for instance', 'unlike', 'despite', 'rather than']
const STOP = new Set(('the a an and or of to in on at for with from by is are was were be been being this that these those it its they them their there '
  + 'which who what when where why how do does did can could should would will may might must has have had not no yes than then about into over '
  + 'according passage writer text following statement statements paragraph choose correct letter answer word words people person some many most '
  + 'more less very also often usually because only other such just after before your you our we us').split(' '));

const norm = s => String(s || '').toLowerCase();

// Old papers keep all three passages in one text with "PASSAGE 1:" markers
function passagesOf(paper) {
  const list = (paper?.passages || []).filter(p => p && p.text);
  if (list.length === 1 && /PASSAGE\s*2\s*:/i.test(list[0].text)) {
    const t = list[0].text; const out = [];
    const re = /PASSAGE\s*(\d)\s*:/gi; const marks = []; let m;
    while ((m = re.exec(t))) marks.push({ n: parseInt(m[1], 10), at: m.index, after: m.index + m[0].length });
    marks.forEach((mk, i) => out.push({ passageNumber: mk.n, title: '', text: t.slice(mk.after, i + 1 < marks.length ? marks[i + 1].at : t.length).trim() }));
    return out;
  }
  return list.map(p => ({ passageNumber: p.passageNumber, title: p.title || '', text: p.text }));
}

function findSpan(text, phrase) {
  if (!phrase) return null;
  let i = text.indexOf(phrase);
  if (i < 0) i = norm(text).indexOf(norm(phrase));
  return i < 0 ? null : [i, i + phrase.length];
}

// Build the highlighted passage for one paragraph-range of text
function buildMarks(text, qs) {
  const n = text.length;
  const ev = new Array(n).fill(null); const kw = new Array(n).fill(false); const cw = new Array(n).fill(false);
  const endsEv = {};
  for (const q of qs) {
    const spans = [];
    String(q.evidence || '').split('|').map(s => s.trim()).filter(Boolean).forEach(ph => { const sp = findSpan(text, ph); if (sp) spans.push(sp); });
    // no stored evidence: for a written answer, find the answer word in the text
    if (!spans.length && q.correctAnswer && !/^(TRUE|FALSE|NOT GIVEN|YES|NO|[A-H])$/i.test(String(q.correctAnswer).trim())) {
      const w = String(q.correctAnswer).split('/')[0].trim();
      if (w.length > 2) { const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'); const m = re.exec(text); if (m) spans.push([m.index, m.index + m[0].length]); }
    }
    for (const [a, b] of spans) {
      for (let x = a; x < b; x++) ev[x] = q;
      endsEv[b - 1] = q;
      // keywords: question words that appear inside this answer sentence
      const words = new Set(norm(q.content).match(/[a-z][a-z'-]{3,}/g) || []);
      const seg = text.slice(a, b);
      const re = /[A-Za-z][A-Za-z'-]{3,}/g; let m;
      while ((m = re.exec(seg))) {
        const w = norm(m[0]);
        if (!STOP.has(w) && (words.has(w) || [...words].some(q2 => q2.length > 4 && (w.startsWith(q2.slice(0, 5)))))) for (let x = a + m.index; x < a + m.index + m[0].length; x++) kw[x] = true;
      }
    }
  }
  for (const c of CODE_WORDS) {
    const re = new RegExp(`\\b${c}\\b`, 'gi'); let m;
    while ((m = re.exec(text))) for (let x = m.index; x < m.index + m[0].length; x++) cw[x] = true;
  }
  const out = []; let k = 0;
  while (k < n) {
    let j = k;
    while (j + 1 < n && ev[j + 1] === ev[k] && kw[j + 1] === kw[k] && cw[j + 1] === cw[k] && endsEv[j] === undefined) j++;
    out.push({ t: text.slice(k, j + 1), q: ev[k], kw: kw[k], cw: cw[k], end: endsEv[j] });
    k = j + 1;
  }
  return out;
}

const qNum = q => q.questionNumber;

export default function PassageReview({ paper, answers }) {
  const [open, setOpen] = useState({});
  const passages = passagesOf(paper);
  if (!passages.length) return null;
  const byQ = new Map((answers || []).map(a => [a.questionId, a]));
  const allQs = [];
  (paper.passages || []).forEach(p => (p.groups || []).forEach(g => (g.questions || []).forEach(q => allQs.push(q))));
  (paper.questions || []).forEach(q => { if (!allQs.some(x => x.id === q.id)) allQs.push(q); });
  if (!allQs.length) return null;
  const jump = id => {
    const el = document.getElementById(`ev-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.animate?.([{ boxShadow: '0 0 0 6px rgba(234,179,8,.6)' }, { boxShadow: '0 0 0 0 rgba(234,179,8,0)' }], { duration: 1400 });
  };

  return (
    <div className="result-section" style={{ animationDelay: '0.18s', padding: 20 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#002761' }}>Check your answers in the passage</div>
      <div style={{ fontSize: 13, color: '#5b6780', margin: '4px 0 10px', lineHeight: 1.7 }}>
        <span style={{ background: '#fde68a', padding: '0 4px', borderRadius: 3 }}>Yellow</span> = where the answer is ·{' '}
        <span style={{ background: '#fbcfe8', fontWeight: 700, padding: '0 4px', borderRadius: 3 }}>Pink</span> = keywords from the question ·{' '}
        <span style={{ textDecoration: 'underline', textDecorationColor: '#16a34a', textDecorationThickness: 2.5, fontWeight: 700, color: '#166534' }}>green underline</span> = code words (linking words) ·{' '}
        tags show the question number, <b style={{ color: '#15803d' }}>green ✓</b> if you got it right, <b style={{ color: '#b91c1c' }}>red ✗</b> if not.
      </div>
      {passages.map((p, pi) => {
        const qs = allQs.filter(q => (q.passageNumber || 1) === p.passageNumber).sort((a, b) => qNum(a) - qNum(b))
          .map(q => ({ ...q, ans: byQ.get(q.id) }));
        if (!qs.length) return null;
        const isOpen = open[p.passageNumber] ?? pi === 0;
        const right = qs.filter(q => q.ans?.isCorrect).length;
        const paras = p.text.split(/\n\s*\n/);
        return (
          <div key={p.passageNumber} style={{ border: '1px solid #dae1ed', borderRadius: 12, marginBottom: 12, overflow: 'hidden', background: '#fff' }}>
            <button type="button" onClick={() => setOpen(o => ({ ...o, [p.passageNumber]: !isOpen }))}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f0f6ff', border: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <span style={{ fontWeight: 700, color: '#002761', fontSize: 15 }}>Passage {p.passageNumber}{p.title ? ` · ${p.title}` : ''}</span>
              <span style={{ fontSize: 13, color: '#5b6780', whiteSpace: 'nowrap' }}>{right}/{qs.length} correct · {isOpen ? 'Hide ▲' : 'Show ▼'}</span>
            </button>
            {isOpen && (
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 15.5, lineHeight: 2, color: '#1e2229', maxHeight: '65vh', overflowY: 'auto', paddingRight: 6 }}>
                  {paras.map((para, i) => (
                    <p key={i} style={{ margin: '0 0 10px' }}>
                      {buildMarks(para, qs).map((s, k) => {
                        let node = s.t;
                        if (s.cw) node = <span style={{ textDecoration: 'underline', textDecorationColor: '#16a34a', textDecorationThickness: 2.5, textUnderlineOffset: 2, fontWeight: 700, color: '#166534' }}>{node}</span>;
                        if (s.kw) node = <span style={{ background: '#fbcfe8', fontWeight: 700 }}>{node}</span>;
                        if (s.q) {
                          const ok = s.q.ans?.isCorrect;
                          node = <span id={s.end ? `ev-${s.q.id}` : undefined} style={{ background: '#fde68a', borderBottom: `2.5px solid ${ok ? '#16a34a' : '#dc2626'}` }}>{node}</span>;
                        }
                        return (
                          <Fragment key={k}>
                            {node}
                            {s.end && (
                              <span style={{ display: 'inline-block', margin: '0 4px', padding: '0 7px', borderRadius: 9, fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 700, lineHeight: 1.6,
                                background: s.end.ans?.isCorrect ? '#dcfce7' : '#fee2e2', color: s.end.ans?.isCorrect ? '#15803d' : '#b91c1c' }}>
                                Q{qNum(s.end)} {s.end.ans?.isCorrect ? '✓' : '✗'}
                              </span>
                            )}
                          </Fragment>
                        );
                      })}
                    </p>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                  {qs.map(q => {
                    const a = q.ans; const ok = a?.isCorrect; const notGiven = /^NOT GIVEN$/i.test(String(q.correctAnswer || '').trim()); const hasEv = !notGiven;
                    return (
                      <div key={q.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 8, background: ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}` }}>
                        <span style={{ minWidth: 34, height: 24, borderRadius: 6, background: ok ? '#16a34a' : '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{qNum(q)}</span>
                        <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>
                          <div style={{ color: '#1e2229' }}>{q.content}</div>
                          <div style={{ marginTop: 3, fontSize: 13.5 }}>
                            Your answer: <b style={{ color: ok ? '#15803d' : '#b91c1c' }}>{a?.studentAnswer || '— not answered'}</b>
                            {!ok && <> · Correct: <b style={{ color: '#15803d' }}>{q.correctAnswer}</b></>}
                          </div>
                          {q.explanation && <div style={{ marginTop: 3, fontSize: 13, color: '#475569' }}>{q.explanation}</div>}
                          {notGiven && <div style={{ marginTop: 3, fontSize: 13, color: '#475569' }}>The passage does not give this information, so there is nothing to highlight.</div>}
                        </div>
                        {hasEv && <button type="button" onClick={() => jump(q.id)} style={{ flex: 'none', border: '1px solid #c9dcfb', background: '#fff', color: '#0056d2', fontWeight: 700, fontSize: 12.5, borderRadius: 50, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Show in passage</button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
