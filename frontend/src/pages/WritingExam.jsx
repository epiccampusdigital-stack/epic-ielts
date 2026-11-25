import EndTestConfirm from '../components/EndTestConfirm';
import { isExamPaper, afterExamSubmit, FullscreenGuard } from '../utils/examMode';
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import SplitHandle, { useSplit, SPLIT_CSS } from '../components/SplitHandle';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const VISUAL_WRITING_TASK_TYPES = new Set(['PIE_CHART', 'LINE_GRAPH', 'BAR_CHART', 'TABLE']);

const parseTaskTableData = (wt) => {
  if (!wt?.tableData) return null;
  try {
    const raw =
      typeof wt.tableData === 'string' ? JSON.parse(wt.tableData) : wt.tableData;
    return raw && typeof raw === 'object' ? { ...raw } : null;
  } catch {
    return null;
  }
};

function ChartRenderer({ chartData, taskType }) {
  if (!chartData) return null;

  let data;
  try {
    data = typeof chartData === 'string' ? JSON.parse(chartData) : chartData;
  } catch { return null; }

  const container = {
    background: '#f7f9fc',
    border: '1px solid #dae1ed',
    borderRadius: 10,
    padding: '20px',
    marginBottom: 16,
    fontFamily: 'Source Sans Pro, sans-serif',
  };

  const titleStyle = {
    fontSize: 13, fontWeight: 700,
    color: '#0f1114', marginBottom: 14,
    textAlign: 'center',
  };

  // TABLE
  if (taskType === 'TABLE' && data.headers && data.rows) {
    return (
      <div style={container}>
        {data.title && <div style={titleStyle}>{data.title}</div>}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {data.headers.map((h, i) => (
                  <th key={i} style={{
                    background: '#0f1114', color: 'white',
                    padding: '8px 10px', textAlign: 'center',
                    fontWeight: 700, fontSize: 11,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#f7f9fc' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: '7px 10px',
                      border: '1px solid #dae1ed',
                      textAlign: ci === 0 ? 'left' : 'center',
                      fontWeight: ci === 0 ? 700 : 400,
                      fontSize: 12, color: '#0f1114',
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.notes && (
          <div style={{ fontSize: 11, color: '#8495b0', marginTop: 8, fontStyle: 'italic' }}>
            {data.notes}
          </div>
        )}
      </div>
    );
  }

  // PIE CHARTS
  if (taskType === 'PIE_CHART' && data.charts) {
    const COLORS = ['#0048b0','#003b8f','#ea580c','#16a34a','#d97706','#0891b2','#dc2626'];
    const PieSlices = ({ chart }) => {
      let cum = -90;
      const cx = 90, cy = 90, r = 75;
      const slices = chart.segments.map((seg, i) => {
        const angle = (seg.percentage / 100) * 360;
        const s = (cum * Math.PI) / 180;
        cum += angle;
        const e = (cum * Math.PI) / 180;
        const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
        const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
        const mid = s + (e - s) / 2;
        return {
          d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${angle > 180 ? 1 : 0},1 ${x2},${y2} Z`,
          lx: cx + r * 0.6 * Math.cos(mid),
          ly: cy + r * 0.6 * Math.sin(mid),
          seg, color: COLORS[i % COLORS.length], pct: seg.percentage,
        };
      });
      return (
        <div style={{ textAlign: 'center', flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#0f1114', marginBottom: 6 }}>
            {chart.year || chart.label}
          </div>
          <svg viewBox="0 0 180 180" style={{ width: 170, height: 170 }}>
            {slices.map((s, i) => (
              <g key={i}>
                <path d={s.d} fill={s.color} stroke="white" strokeWidth="2"/>
                {s.pct >= 7 && (
                  <text x={s.lx} y={s.ly} textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 9, fill: 'white', fontWeight: 700 }}>
                    {s.pct}%
                  </text>
                )}
              </g>
            ))}
          </svg>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4,
            justifyContent: 'center', marginTop: 6 }}>
            {chart.segments.map((seg, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center',
                gap: 3, fontSize: 10 }}>
                <div style={{ width:9, height:9, borderRadius:2,
                  background: COLORS[i % COLORS.length], flexShrink:0 }}/>
                <span style={{ color:'#1e2229' }}>{seg.label} {seg.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    };
    return (
      <div style={container}>
        {data.title && <div style={titleStyle}>{data.title}</div>}
        <div style={{ display:'flex', gap:16, justifyContent:'center',
          flexWrap:'wrap' }}>
          {data.charts.map((c, i) => <PieSlices key={i} chart={c}/>)}
        </div>
      </div>
    );
  }

  // BAR CHART
  if ((taskType === 'BAR_CHART' || data.type === 'grouped_bar')
      && data.categories && data.series) {
    const BC = ['#0048b0','#16a34a','#ea580c','#003b8f','#d97706','#0891b2'];
    const all = data.series.flatMap(s => s.values);
    const maxV = Math.max(...all);
    const H = 160, pad = { l:40, r:10, t:10, b:40 };
    const innerH = H - pad.t - pad.b;
    const catCount = data.categories.length;
    const serCount = data.series.length;
    const bw = Math.max(8, Math.floor(200 / (catCount * serCount + catCount)));
    const gw = serCount * (bw + 2) + 8;
    const W = Math.max(360, catCount * gw + pad.l + pad.r);
    return (
      <div style={container}>
        {data.title && <div style={titleStyle}>{data.title}</div>}
        <div style={{ overflowX: 'auto' }}>
          <svg width={W} height={H} style={{ display:'block', margin:'0 auto' }}>
            {[0,25,50,75,100].filter(v => v <= maxV + 5).map(v => {
              const y = pad.t + innerH - (v / maxV) * innerH;
              return (
                <g key={v}>
                  <line x1={pad.l} y1={y} x2={W - pad.r} y2={y}
                    stroke="#dae1ed" strokeWidth={1}/>
                  <text x={pad.l - 3} y={y + 3} textAnchor="end"
                    fontSize={8} fill="#8495b0">{v}</text>
                </g>
              );
            })}
            {data.categories.map((cat, ci) => {
              const gx = pad.l + ci * gw + 4;
              return (
                <g key={ci}>
                  {data.series.map((s, si) => {
                    const val = s.values[ci] || 0;
                    const bh = (val / maxV) * innerH;
                    const bx = gx + si * (bw + 2);
                    const by = pad.t + innerH - bh;
                    return (
                      <g key={si}>
                        <rect x={bx} y={by} width={bw} height={bh}
                          fill={BC[si % BC.length]} rx={2}/>
                        {bh > 12 && (
                          <text x={bx + bw/2} y={by + 9} textAnchor="middle"
                            fontSize={7} fill="white" fontWeight="700">{val}</text>
                        )}
                      </g>
                    );
                  })}
                  <text x={gx + gw/2 - 4} y={H - 8} textAnchor="middle"
                    fontSize={8} fill="#1e2229"
                    transform={catCount > 4 ? `rotate(-30,${gx+gw/2-4},${H-8})` : ''}>
                    {cat}
                  </text>
                </g>
              );
            })}
            <line x1={pad.l} y1={pad.t+innerH} x2={W-pad.r} y2={pad.t+innerH}
              stroke="#1e2229" strokeWidth={1.5}/>
          </svg>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center',
          flexWrap:'wrap', marginTop:6 }}>
          {data.series.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center',
              gap:4, fontSize:11 }}>
              <div style={{ width:12, height:12, borderRadius:2,
                background: BC[i % BC.length] }}/>
              <span style={{ color:'#1e2229' }}>{s.label}</span>
            </div>
          ))}
        </div>
        {data.notes && (
          <div style={{ fontSize:11, color:'#8495b0', marginTop:8,
            fontStyle:'italic', textAlign:'center' }}>{data.notes}</div>
        )}
      </div>
    );
  }

  // LINE GRAPH
  if (taskType === 'LINE_GRAPH' && data.series) {
    const LC = ['#0048b0','#16a34a','#ea580c','#003b8f','#d97706','#0891b2'];
    const all = data.series.flatMap(s => s.data.map(p => p.value));
    const allYears = [...new Set(data.series.flatMap(s =>
      s.data.map(p => p.year)))].sort();
    const maxV = Math.max(...all), minV = Math.min(...all);
    const W = 420, H = 180;
    const pad = { l:50, r:20, t:10, b:30 };
    const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
    const xP = yr => pad.l + ((yr - allYears[0]) /
      (allYears[allYears.length-1] - allYears[0])) * iW;
    const yP = v => pad.t + iH - ((v - minV) / ((maxV - minV) || 1)) * iH;
    return (
      <div style={container}>
        {data.title && <div style={titleStyle}>{data.title}</div>}
        <div style={{ overflowX:'auto' }}>
          <svg width={W} height={H} style={{ display:'block', margin:'0 auto' }}>
            {[0,0.25,0.5,0.75,1].map((pct, i) => {
              const val = Math.round(minV + pct * (maxV - minV));
              const y = pad.t + iH * (1 - pct);
              return (
                <g key={i}>
                  <line x1={pad.l} y1={y} x2={W-pad.r} y2={y}
                    stroke="#dae1ed" strokeWidth={1}/>
                  <text x={pad.l-4} y={y+3} textAnchor="end"
                    fontSize={9} fill="#8495b0">{val}</text>
                </g>
              );
            })}
            {allYears.filter((_,i) => i % 2 === 0 ||
              i === allYears.length-1).map(yr => (
              <text key={yr} x={xP(yr)} y={H-4} textAnchor="middle"
                fontSize={9} fill="#1e2229">{yr}</text>
            ))}
            {data.series.map((s, si) => {
              const pts = [...s.data].sort((a,b) => a.year-b.year);
              const dAttr = pts.map((p,i) =>
                `${i===0?'M':'L'}${xP(p.year)},${yP(p.value)}`).join(' ');
              return (
                <g key={si}>
                  <path d={dAttr} fill="none"
                    stroke={LC[si%LC.length]} strokeWidth={2}/>
                  {pts.map((p,i) => (
                    <circle key={i} cx={xP(p.year)} cy={yP(p.value)}
                      r={3} fill={LC[si%LC.length]}/>
                  ))}
                </g>
              );
            })}
            <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t+iH}
              stroke="#1e2229" strokeWidth={1.5}/>
            <line x1={pad.l} y1={pad.t+iH} x2={W-pad.r} y2={pad.t+iH}
              stroke="#1e2229" strokeWidth={1.5}/>
          </svg>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center',
          flexWrap:'wrap', marginTop:6 }}>
          {data.series.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center',
              gap:4, fontSize:11 }}>
              <div style={{ width:18, height:3, borderRadius:2,
                background: LC[i%LC.length] }}/>
              <span style={{ color:'#1e2229' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// Some papers store the task as plain text: keep its line breaks, show "a | b | c" lines as a table
// and "- point" lines as a list. Prompts that are already HTML are shown as they are.
function promptHtml(p) {
  if (!p) return '';
  const text = String(p);
  if (/<\/?(p|br|table|ul|ol|li|div|strong|b|em)\b/i.test(text)) return text;
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = text.replace(/\r/g, '').split('\n');
  let out = '', i = 0;
  while (i < lines.length) {
    const ln = lines[i].trim();
    if (!ln) { i++; continue; }
    if (ln.includes('|') && ln.split('|').length >= 3) {
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].split('|').length >= 3) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        if (!cells.every(c => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      out += '<table><thead><tr>' + rows[0].map(c => `<th>${esc(c)}</th>`).join('') + '</tr></thead><tbody>' + rows.slice(1).map(r => '<tr>' + r.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
      continue;
    }
    if (/^[-•*]\s+/.test(ln)) {
      let li = '';
      while (i < lines.length && /^[-•*]\s+/.test(lines[i].trim())) { li += `<li>${esc(lines[i].trim().replace(/^[-•*]\s+/, ''))}</li>`; i++; }
      out += `<ul>${li}</ul>`;
      continue;
    }
    out += `<p>${esc(ln)}</p>`; i++;
  }
  return out;
}

export default function WritingExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [paper, setPaper] = useState(null);
  const [task, setTask] = useState(1);
  // Phones: the task question on top and the writing box below, with a bar to drag between them
  const [split, setSplit] = useSplit('writing-split', 42);
  const layoutRef = useRef(null);
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');
  const [task3, setTask3] = useState(''); // three-task papers: the second report (taskNumber 3)
  const [timeLeft, setTimeLeft] = useState(null);
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return API_URL + (url.startsWith('/') ? '' : '/') + url;
  };
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [lookWrite, setLookWrite] = useState(false); // picture and writing box side by side, full screen
  const [lwZoom, setLwZoom] = useState(1);
  const [floatPic, setFloatPic] = useState(false); // a small picture window the student can drag anywhere
  const [floatPos, setFloatPos] = useState(() => ({ x: Math.max(8, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 400), y: 90 }));
  const [floatZoom, setFloatZoom] = useState(1);
  const dragRef = useRef(null);
  const startDrag = e => {
    const p = e.touches ? e.touches[0] : e;
    dragRef.current = { dx: p.clientX - floatPos.x, dy: p.clientY - floatPos.y };
    const move = ev => {
      const q = ev.touches ? ev.touches[0] : ev;
      if (!dragRef.current) return;
      if (ev.cancelable) ev.preventDefault();
      setFloatPos({ x: Math.min(window.innerWidth - 120, Math.max(0, q.clientX - dragRef.current.dx)), y: Math.min(window.innerHeight - 60, Math.max(0, q.clientY - dragRef.current.dy)) });
    };
    const up = () => { dragRef.current = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
  };
  const [teachingMode, setTeachingMode] = useState(false);
  const timerRef = useRef();
  const timerStartedRef = useRef(false);
  const task1Ref = useRef('');
  const task2Ref = useRef('');
  const task3Ref = useRef('');
  const teachingModeRef = useRef(false);
  const examRef = useRef(null); // set for Exam tab papers
  // Admin can switch off the student pause button (Admin dashboard → Exam timer)
  const [canPause, setCanPause] = useState(false);
  useEffect(() => {
     axios.get(`${API_URL}/api/attempts/exam-settings`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(r => { const ok = r.data?.studentPause !== false; setCanPause(ok); if (!ok) { teachingModeRef.current = false; setTeachingMode(false); } })
        .catch(() => setCanPause(false));
  }, []);

  useEffect(() => {
    if (!attemptId) return;

    axios.get(`${API_URL}/api/attempts/${attemptId}`, api())
      .then(r => {
        setAttempt(r.data);
        setPaper(r.data.paper);
        examRef.current = isExamPaper(r.data.paper) ? r.data.paper : null;
        // Bring back essays typed before the student left the page
        let local = null;
        try { local = JSON.parse(localStorage.getItem(`epic-essays-${attemptId}`) || 'null'); } catch { local = null; }
        let server = null;
        try { server = r.data.draft ? JSON.parse(r.data.draft) : null; } catch { server = null; }
        const best = local && (!server || (local.at || 0) >= (server.at || 0)) ? local : server;
        if (r.data.status !== 'COMPLETED' && best) {
          try {
            const d = best;
            if (d.task1) setTask1(prev => { const v = prev || d.task1; task1Ref.current = v; return v; });
            if (d.task2) setTask2(prev => { const v = prev || d.task2; task2Ref.current = v; return v; });
            if (d.task3) setTask3(prev => { const v = prev || d.task3; task3Ref.current = v; return v; });
          } catch { /* ignore a broken draft */ }
        }
        const totalSeconds = ((r.data.paper?.timeLimitMin || 60) + (r.data.extraMinutes || 0)) * 60;
        const startedAt = r.data.startedAt ? new Date(r.data.startedAt).getTime() : null;
        const elapsed = startedAt ? Math.floor(((r.data.serverNow || Date.now()) - startedAt) / 1000) : 0;
        setTimeLeft(Math.max(0, totalSeconds - elapsed));
      })
      .catch(e => console.error('Paper fetch error:', e));

    axios.get(`${API_URL}/api/attempts/${attemptId}/writing/result`, api())
      .then(r => {
        if (r.data?.writingSubmission) {
          const t1 = r.data.writingSubmission.task1Response || '';
          const t2 = r.data.writingSubmission.task2Response || '';
          setTask1(t1); task1Ref.current = t1;
          setTask2(t2); task2Ref.current = t2;
        }
      })
      .catch(e => console.error('Submission fetch error:', e));

    // Also try checking common AI feedback endpoint
    axios.get(`${API_URL}/api/attempts/${attemptId}/ai-feedback`, api())
      .then(r => {
        if (r.data?.feedback) {
          setTask1(prev => {
            const v = prev || r.data.feedback.task1Response || '';
            task1Ref.current = v;
            return v;
          });
          setTask2(prev => {
            const v = prev || r.data.feedback.task2Response || '';
            task2Ref.current = v;
            return v;
          });
        }
      })
      .catch(() => {});
  }, [attemptId]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timerStartedRef.current) return;
    timerStartedRef.current = true;

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          timerStartedRef.current = false;
          setTimeout(() => handleSubmit(true), 100);
          return 0;
        }
        if (teachingModeRef.current) return t;
        return t - 1;
      });
    }, 1000);

    timerRef.current = interval;

    return () => {
      clearInterval(interval);
      timerStartedRef.current = false;
    };
  }, [timeLeft]);

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const timerColor = timeLeft !== null
    ? timeLeft < 300 ? '#dc2626' : timeLeft < 600 ? '#d97706' : '#002761'
    : '#002761';

  const toggleTeachingMode = () => {
    if (examRef.current) return;
      if (!canPause && !teachingModeRef.current) return;
    const entering = !teachingMode;
    setTeachingMode(entering);
    teachingModeRef.current = entering;
  };

  // Task order on screen. With three tasks: Task 1 = taskNumber 1, Task 2 = taskNumber 3 (second report), Task 3 = taskNumber 2 (essay)
  const hasTask3 = (paper?.writingTasks || []).some(t => t.taskNumber === 3);
  const wTasks = paper?.writingTasks || [];
  // Task 2 shows unless the paper's tasks are known and none is the essay (Task 1 only, or two reports)
  const hasTask2 = wTasks.some(t => t.taskNumber === 2) || (!hasTask3 && !wTasks.length);
  // Only the tasks this paper has (a paper with taskNumber 1 and 3 and no essay shows two tasks)
  const ORDER = (hasTask3 ? [1, 3, 2] : [1, 2]).filter(n => n !== 2 || hasTask2);
  const shownNo = n => ORDER.indexOf(n) + 1;
  const nextTask = ORDER[ORDER.indexOf(task) + 1];
  const prevTask = ORDER[ORDER.indexOf(task) - 1];
  const handleSubmit = async (auto = false) => {
    if (!auto) {
      if (nextTask) { setTask(nextTask); return; }
      setShowConfirm(true);
      return;
    }
    setSubmitting(true);
    clearInterval(timerRef.current);
    // Use refs so auto-submit always has the latest text
    // even if called from inside a stale closure
    const finalTask1 = task1Ref.current || task1;
    const finalTask2 = task2Ref.current || task2;
    try {
      await axios.post(
        `${API_URL}/api/attempts/${attemptId}/writing/submit`,
        { task1Response: finalTask1, ...(hasTask2 ? { task2Response: finalTask2 } : {}), ...(hasTask3 ? { task3Response: task3Ref.current || task3 } : {}) },
        api()
      );
      navigate(examRef.current ? afterExamSubmit(examRef.current) : `/exam/${attemptId}/writing-results`);
    } catch (err) {
      console.error('Auto-submit error:', err);
      // Still navigate - backend will mark with whatever was saved
      navigate(examRef.current ? afterExamSubmit(examRef.current) : `/exam/${attemptId}/writing-results`);
    }
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      await axios.post(
        `${API_URL}/api/attempts/${attemptId}/writing/submit`,
        { task1Response: task1Ref.current || task1, ...(hasTask2 ? { task2Response: task2Ref.current || task2 } : {}), ...(hasTask3 ? { task3Response: task3Ref.current || task3 } : {}) },
        api()
      );
      navigate(examRef.current ? afterExamSubmit(examRef.current) : `/exam/${attemptId}/writing-results`);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Unknown error';
      alert('Failed to submit: ' + msg);
      setSubmitting(false);
    }
  };

  const writingTasks = paper?.writingTasks || [];
  const hasWritingTasks = writingTasks.length > 0;
  // Save essays to the student's account as they type, and when they leave the page
  const draftSaved = useRef('');
  const saveDraft = useRef(null);
  saveDraft.current = (keepalive = false) => {
    if (!attemptId || attempt?.status === 'COMPLETED' || submitting) return;
    const body = JSON.stringify({ task1: task1Ref.current || '', task2: task2Ref.current || '', task3: task3Ref.current || '' });
    if (body === draftSaved.current || body === '{"task1":"","task2":"","task3":""}') return;
    draftSaved.current = body;
    try {
      fetch(`${API_URL}/api/attempts/${attemptId}/writing/draft`, {
        method: 'PUT', keepalive,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body,
      }).then(r => { if (!r.ok) draftSaved.current = ''; }).catch(() => { draftSaved.current = ''; });
    } catch { draftSaved.current = ''; }
  };
  useEffect(() => {
    if (!attempt) return undefined;
    if (attempt.status !== 'COMPLETED' && (task1 || task2 || task3)) {
      try { localStorage.setItem(`epic-essays-${attemptId}`, JSON.stringify({ task1: task1 || '', task2: task2 || '', task3: task3 || '', at: Date.now() })); } catch { /* storage blocked */ }
    }
    const t = setTimeout(() => saveDraft.current(), 2000);
    return () => clearTimeout(t);
  }, [task1, task2, task3, attempt]);
  useEffect(() => {
    if (!attempt) return undefined;
    const id = setInterval(() => saveDraft.current(), 20000);
    const onHide = () => saveDraft.current(true);
    const onVis = () => { if (document.visibilityState === 'hidden') saveDraft.current(true); };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVis);
      saveDraft.current(true);
    };
  }, [attempt]);

  const writingTask1 = writingTasks.find(t => t.taskNumber === 1);
  const writingTask2 = writingTasks.find(t => t.taskNumber === 2);
  const currentTask = task === 1 ? writingTask1 : task === 2 ? writingTask2 : writingTasks.find(t => t.taskNumber === task);
  const chartTask = task === 1 ? writingTask1 : (currentTask?.chartImageUrl ? currentTask : null);
  // What the student can open beside the writing box: a picture, a drawn chart or a table
  const visualOf = t => {
    if (!t) return null;
    if (t.chartImageUrl) return 'img';
    const td = parseTaskTableData(t);
    if (td?._writingTaskType && td._writingTaskType !== 'ESSAY' && t.tableData) return 'chart';
    if (td?.headers?.length) return 'table';
    return null;
  };
  const lwTask = chartTask && visualOf(chartTask) ? chartTask : null;
  const currentText = task === 1 ? task1 : task === 3 ? task3 : task2;
  const setCurrentText = task === 1
    ? (v) => { setTask1(v); task1Ref.current = v; }
    : task === 3
      ? (v) => { setTask3(v); task3Ref.current = v; }
      : (v) => { setTask2(v); task2Ref.current = v; };
  const writingTask3 = writingTasks.find(t => t.taskNumber === 3);
  const min3 = writingTask3?.minWords || 150;

  const minWords = currentTask?.minWords || (task === 1 ? 150 : 250);
  const min1 = writingTask1?.minWords || 150;
  const min2 = writingTask2?.minWords || 250;
  const TEXTS = { 1: [task1, min1], 2: [task2, min2], 3: [task3, min3] };
  const wc = wordCount(currentText);
  const wcColor = wc >= minWords ? '#16a34a' : wc >= minWords * 0.8 ? '#d97706' : '#dc2626';

  const renderTable = (tableData) => {
    if (!tableData) return null;
    return (
      <div style={{ overflowX: 'auto', margin: '20px 0', border: '1px solid #e3eeff', borderRadius: '12px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f0f6ff' }}>
              {(tableData.headers || []).map((h, i) => <th key={i} style={{ padding: '10px', border: '1px solid #e3eeff', color: '#002761', fontWeight: '700' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {(tableData.rows || []).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '10px', border: '1px solid #e3eeff', color: '#1e2229' }}>
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!paper) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f6ff', fontFamily: 'Source Sans Pro, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #e3eeff', borderTop: '3px solid #0056d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#5b6780' }}>Loading writing exam...</p>
      </div>
    </div>
  );

  if (!hasWritingTasks) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f6ff',
        fontFamily: 'Source Sans Pro, sans-serif',
        padding: 24
      }}>
        <div style={{
          maxWidth: 480,
          background: '#fff',
          borderRadius: 16,
          padding: 28,
          border: '1px solid #c9dcfb',
          boxShadow: '0 12px 40px rgba(30,58,95,0.08)'
        }}>
          <h2 style={{ margin: '0 0 12px', color: '#002761', fontSize: 20 }}>Writing tasks not ready</h2>
          <p style={{ color: '#5b6780', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            This paper has no Task 1 / Task 2 configured yet. Ask your administrator to open the paper in the admin editor and add both writing tasks (prompts, chart if needed, word minimums), then try again.
          </p>
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              background: '#0056d2',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Source Sans Pro, sans-serif'
            }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitting) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f7f9fc',
      fontFamily: 'Source Sans Pro, sans-serif'
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '48px 56px', textAlign: 'center',
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        border: '1px solid #dae1ed', maxWidth: 400
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
        <h2 style={{ color: '#0f1114', fontWeight: 700,
          fontSize: 22, marginBottom: 8, fontFamily: 'Source Sans Pro, sans-serif' }}>
          Submitting your writing...
        </h2>
        <p style={{ color: '#5b6780', fontSize: 14, marginBottom: 24,
          lineHeight: 1.6 }}>
          Your answers are being saved and sent for AI marking.
          Please do not close this window.
        </p>
        <div style={{
          width: 40, height: 40, border: '4px solid #dae1ed',
          borderTop: '4px solid #0056d2', borderRadius: '50%',
          animation: 'spin 1s linear infinite', margin: '0 auto'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div className="exam-root" style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Source Sans Pro, sans-serif', background: '#f0f6ff', overflow: 'hidden' }}>
      <style>{`
        .exam-root { height: 100vh; height: 100dvh; }
        .mobile-tabs { display: flex; background: #fff; border-bottom: 1px solid #dae1ed; flex-shrink: 0; }
        .mobile-tabs button { flex: 1; padding: 12px 8px; border: 0; background: none; font: 700 15px 'Source Sans Pro', sans-serif; color: #5b6780; border-bottom: 3px solid transparent; cursor: pointer; }
        .mobile-tabs button.on { color: #0056d2; border-bottom-color: #0056d2; }
        .eh-title { display: none; }
        @media (max-width: 1023px) {
          .exam-layout > .passage-section, .exam-layout > .questions-section { flex: 1; min-height: 0 !important; border-right: 0 !important; }
          .questions-section { padding: 12px !important; }
          .writing-area { min-height: 120px; font-size: 16px; }
          .passage-section { padding: 14px !important; }
          .wa-head { flex-wrap: wrap; gap: 6px; }
        }
        @media (min-width: 1024px) { .mobile-tabs { display: none; } }
        @media (min-width: 600px) { .eh-title { display: block; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .writing-area {
          width: 100%;
          flex: 1;
          padding: 16px;
          font-size: 15px;
          font-family: Source Sans Pro, Arial, sans-serif;
          line-height: 1.8;
          color: #0f1114;
          border: 1.5px solid #e3eeff;
          border-radius: 10px;
          resize: none;
          outline: none;
          box-sizing: border-box;
          background: #f7f9fc;
          transition: border-color 0.2s;
        }
        .writing-area:focus { border-color: #0056d2; background: #ffffff; }
        .task-tab { padding: 8px 20px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: Source Sans Pro, sans-serif; transition: all 0.2s; }
        .nav-btn { padding: 10px 24px; border-radius: 9px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: Source Sans Pro, sans-serif; transition: all 0.2s; border: none; }
        .exam-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        @media (min-width: 1024px) {
          .exam-layout {
            display: grid;
            grid-template-columns: 45% 55%;
          }
        }

        .passage-section {
          background: #f7f9fc;
          border-right: 1px solid #e3eeff;
          overflow-y: auto;
          padding: 20px;
          min-height: 35vh;
        }

        @media (min-width: 1024px) {
          .passage-section {
            padding: 28px;
            height: auto;
          }
        }

        .questions-section {
          background: #ffffff;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          min-height: 65vh;
        }

        @media (min-width: 1024px) {
          .questions-section {
            height: auto;
          }
        }

        .exam-header {
          background: linear-gradient(135deg, #002761, #0048b0);
          padding: 8px 12px;
          min-height: 52px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .exam-header {
            height: 60px;
            padding: 0 24px;
            gap: 0;
          }
        }

        .mobile-hide {
          display: none !important;
        }

        @media (min-width: 768px) {
          .mobile-hide {
            display: block !important;
          }
        }
        .writing-prompt-content table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 14px; }
        .writing-prompt-content th, .writing-prompt-content td { border: 1px solid #c9dcfb; padding: 10px 14px; text-align: left; color: #0f1114; }
        .writing-prompt-content th { background: #f0f6ff; font-weight: 700; color: #0048b0; }
        .writing-prompt-content tr:nth-child(even) td { background: #f7f9fc; }
        .writing-prompt-content p { margin-bottom: 10px; line-height: 1.7; }
        .writing-prompt-content ul, .writing-prompt-content ol { padding-left: 20px; margin-bottom: 10px; }
      `}</style>

      {/* Header */}
      <div className="exam-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <img src="/logo.png" alt="EPIC" style={{ height: 24, filter: 'brightness(0) invert(1)' }} />
          <div className="mobile-hide" style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
          <div className="eh-title">
            <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 600 }}>
              EPIC IELTS — Writing {paper.paperCode}
            </div>
            <div className="mobile-hide" style={{ color: '#93c5fd', fontSize: 11 }}>{paper.title}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Task tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 4 }}>
            {ORDER.map(t => (
              <button key={t} className="task-tab"
                style={{ background: task === t ? '#ffffff' : 'transparent', color: task === t ? '#002761' : 'rgba(255,255,255,0.7)', padding: '6px 14px', fontSize: '11px' }}
                onClick={() => setTask(t)}>
                Task {shownNo(t)}
              </button>
            ))}
          </div>

          {canPause && !examRef.current && (
<button
            onClick={toggleTeachingMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              background: teachingMode
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'rgba(255,255,255,0.1)',
              color: teachingMode ? '#0f1114' : 'rgba(255,255,255,0.8)',
              border: teachingMode
                ? '1.5px solid #f59e0b'
                : '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Source Sans Pro, sans-serif',
              transition: 'all 0.2s',
              letterSpacing: '0.02em'
            }}
          >
            {teachingMode ? 'TEACHING' : 'EXAM MODE'}
          </button>
)}

          {/* Timer */}
          <div style={{
            background: timeLeft < 300 ? '#dc2626' : timeLeft < 600 ? '#d97706' : 'rgba(255,255,255,0.15)',
            color: teachingMode ? '#f59e0b' : (timeLeft < 300 ? '#ef4444' : '#ffffff'),
            padding: '6px 16px', borderRadius: 8,
            fontWeight: 700, fontSize: 16, fontVariantNumeric: 'tabular-nums',
            minWidth: 80, textAlign: 'center',
            border: timeLeft < 300 ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            {teachingMode && (
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#f59e0b',
                letterSpacing: '0.1em',
                marginLeft: 4
              }}>
                PAUSED
              </span>
            )}
          </div>
        </div>
      </div>

      <style>{SPLIT_CSS}</style>

      {/* Body */}
      <div className="exam-layout" ref={layoutRef} style={{ '--split': `${split}%` }}>

        {/* Left — Task prompt */}
        <div className="passage-section" style={{ background: '#f7f9fc', borderRight: '1px solid #e3eeff', overflowY: 'auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e3eeff', borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0056d2', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#0048b0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Writing Task {shownNo(task)}
            </span>
          </div>

          <p style={{ fontSize: 11, color: '#5b6780', marginBottom: 16 }}>
            You should spend about {currentTask?.timeMinutes || (task === 1 ? 20 : 40)} minutes on this task. Write at least {minWords} words.
          </p>

          {/* Task prompt */}
          <div
            className="writing-prompt-content"
            style={{ fontSize: 14, color: '#0f1114', lineHeight: 1.8, marginBottom: 20, fontWeight: 400 }}
            dangerouslySetInnerHTML={{ __html: promptHtml((task === 1 ? writingTask1?.prompt : task === 2 ? writingTask2?.prompt : currentTask?.prompt)) || `<p>No prompt text for Task ${task}. Ask your administrator to edit this paper.</p>` }}
          />
          {currentTask?.tableData && (() => {
            const tdRaw = parseTaskTableData(currentTask);
            if (!tdRaw) return null;
            const td = { ...tdRaw };
            delete td._writingTaskType;
            if (!td?.headers?.length) return null;
            return (
              <div style={{ overflowX: 'auto', margin: '16px 0', borderRadius: 10, border: '1px solid #c9dcfb' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f0f6ff' }}>
                      {td.headers.map((h, i) => (
                        <th key={i} style={{ padding: '10px 14px', border: '1px solid #c9dcfb', color: '#0048b0', fontWeight: 700, textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(td.rows || []).map((row, ri) => (
                      <tr key={ri}>
                        {(Array.isArray(row) ? row : Object.values(row)).map((cell, ci) => (
                          <td key={ci} style={{ padding: '10px 14px', border: '1px solid #c9dcfb', color: '#0f1114', background: ri % 2 === 0 ? '#fff' : '#f7f9fc' }}>
                            {typeof cell === 'object' ? cell.text || '' : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Chart for Task 1 */}
          {chartTask && (() => {
            const tdMeta = parseTaskTableData(chartTask);
            const importTaskType = tdMeta?._writingTaskType;
            const tdForGrid = tdMeta ? { ...tdMeta } : null;
            if (tdForGrid) delete tdForGrid._writingTaskType;
            const hasTableGrid = !!(tdForGrid?.headers?.length);
            const promptPlain = (chartTask.prompt || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const promptSnippet = promptPlain.slice(0, 160) + (promptPlain.length > 160 ? '…' : '');
            const visualPending =
              !chartTask.chartImageUrl &&
              !hasTableGrid &&
              ((importTaskType && VISUAL_WRITING_TASK_TYPES.has(importTaskType)) ||
                (tdMeta && Object.keys(tdMeta).filter((k) => k !== '_writingTaskType').length > 0));
            const showChartPanel =
              chartTask.chartImageUrl ||
              (chartTask.chartDescription && !VISUAL_WRITING_TASK_TYPES.has(chartTask.chartDescription)) ||
              visualPending;

            if (!showChartPanel) return null;

            return (
            <div style={{ background: '#ffffff', borderRadius: 14, padding: 20, border: '1px solid #e3eeff', marginTop: 16 }}>
              {lwTask && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => { setLwZoom(1); setLookWrite(true); }} style={{ flex: 1, minWidth: 180, padding: '10px 12px', border: 0, borderRadius: 10, background: '#002761', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>⤢ Picture and writing box side by side</button>
                  <button type="button" onClick={() => setFloatPic(f => !f)} style={{ flex: 1, minWidth: 180, padding: '10px 12px', border: '1.5px solid #002761', borderRadius: 10, background: floatPic ? '#e3eeff' : '#fff', color: '#002761', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{floatPic ? '✕ Close the small picture' : '▣ Small picture I can move'}</button>
                </div>
              )}
              {chartTask.chartImageUrl ? (
                <div style={{ marginBottom: '24px', animation: 'fadeIn 0.5s ease' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0048b0', marginBottom: 12, textAlign: 'center' }}>
                    {chartTask.chartDescription || "Figure 1: Task Visualization"}
                  </p>
                  <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setImageZoom(z => Math.max(0.5, parseFloat((z - 0.15).toFixed(2))))}
                      style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #c9dcfb', background: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0048b0', lineHeight: 1 }}
                    >−</button>
                    <span style={{ fontSize: 11, color: '#8495b0', minWidth: 36, textAlign: 'center' }}>{Math.round(imageZoom * 100)}%</span>
                    <button
                      onClick={() => setImageZoom(z => Math.min(3, parseFloat((z + 0.15).toFixed(2))))}
                      style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #c9dcfb', background: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0048b0', lineHeight: 1 }}
                    >+</button>
                  </div>
                  <div style={{ overflow: 'auto', maxHeight: '55vh', borderRadius: 12, border: '1px solid #dae1ed' }}>
                    <img
                      src={getFullUrl(chartTask.chartImageUrl)}
                      alt="Task Chart"
                      style={{ width: `${imageZoom * 100}%`, maxWidth: 'none', display: 'block', transition: 'width 0.2s' }}
                    />
                  </div>
                </div>
              ) : chartTask.tableData &&
                  chartTask.tableData._writingTaskType &&
                  chartTask.tableData._writingTaskType !== 'ESSAY' ? (
                <ChartRenderer
                  chartData={chartTask.tableData}
                  taskType={chartTask.tableData._writingTaskType}
                />
              ) : chartTask.chartDescription && !VISUAL_WRITING_TASK_TYPES.has(chartTask.chartDescription) ? (
                <div style={{ background: '#f7f9fc', border: '2px dashed #c3cddd', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#5b6780', marginBottom: 12 }}>🖼️ CHART DESCRIPTION</div>
                  <p style={{ fontSize: 14, color: '#5b6780', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                    "{chartTask.chartDescription}"
                  </p>
                </div>
              ) : visualPending ? (
                <div style={{ background: '#fffbeb', border: '2px dashed #fbbf24', borderRadius: 12, padding: 20, textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>Chart visual</div>
                  <p style={{ fontSize: 14, color: '#78350f', lineHeight: 1.6, margin: 0 }}>
                    {promptSnippet ? (
                      <>Chart (reference): <strong>{promptSnippet}</strong> — </>
                    ) : null}
                    Image will be uploaded by your teacher. Refer to the task instructions above and write your overview using the information given.
                  </p>
                </div>
              ) : (
                <div style={{
                  background: '#fef9c3',
                  border: '1px solid #fcd34d',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#92400e'
                }}>
                  📊 Chart will be uploaded by your teacher.
                </div>
              )}
            </div>
            );
          })()}

          {task === 2 && (
            <div style={{ background: '#f0f6ff', borderRadius: 12, padding: 14, border: '1px solid #c9dcfb' }}>
              <p style={{ fontSize: 11, color: '#0048b0', fontWeight: 600, marginBottom: 6 }}>💡 Task {shownNo(2)} Tips</p>
              <ul style={{ paddingLeft: 16, margin: 0, fontSize: 11, color: '#003b8f', lineHeight: 1.6 }}>
                <li>Plan your essay before writing (5 minutes)</li>
                <li>Write an introduction, 2 body paragraphs, conclusion</li>
                <li>State your opinion clearly</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right — Writing area */}
        <SplitHandle layoutRef={layoutRef} value={split} onChange={setSplit} label={`Question ↑ · Your answer ↓ (${wc} words)`} />
        <div className="questions-section" style={{ display: 'flex', flexDirection: 'column', padding: 20, gap: 12 }}>
          {teachingMode && (
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '2px solid #f59e0b',
              borderRadius: 12,
              padding: '12px 20px',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: 20 }}>📖</span>
              <div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#92400e'
                }}>
                  Teaching Mode — Timer Paused
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#b45309',
                  marginTop: 2
                }}>
                  Your answers are saved. Click ⏱ Exam to resume your timer.
                </div>
              </div>
            </div>
          )}

          <div className="wa-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#002761', margin: 0 }}>
              Your Answer — Task {shownNo(task)}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: wcColor }}>
                {wc} / {minWords} words minimum
              </div>
              <div style={{
                width: 80, height: 6, background: '#dae1ed', borderRadius: 3, overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, (wc / minWords) * 100)}%`,
                  height: '100%',
                  background: wcColor,
                  borderRadius: 3,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          </div>

          <textarea
            className="writing-area"
            value={currentText}
            onChange={e => setCurrentText(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            placeholder={`Write your Task ${shownNo(task)} response here...\n\nMinimum ${minWords} words required.`}
          />

          <div style={{ fontSize: 11, color: '#8495b0', flexShrink: 0 }}>
            {task !== 2
              ? 'Describe the chart: overview → key features → comparisons'
              : 'Structure: Introduction → View 1 → View 2 → Your opinion → Conclusion'}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: '#ffffff', borderTop: '1px solid #e3eeff', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div className="mobile-hide" style={{ display: 'flex', gap: 12 }}>
          {ORDER.map(n => (
            <span key={n} style={{ fontSize: 11, color: '#5b6780', marginRight: 12, whiteSpace: 'nowrap' }}>
              T{shownNo(n)}: <strong style={{ color: wordCount(TEXTS[n][0]) >= TEXTS[n][1] ? '#16a34a' : '#dc2626' }}>{wordCount(TEXTS[n][0])}</strong>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'flex-end' }}>
          {prevTask && (
            <button className="nav-btn"
              onClick={() => setTask(prevTask)}
              style={{ background: '#e8eef7', color: '#5b6780', border: '1px solid #dae1ed', padding: '8px 16px', fontSize: '12px' }}>
              ← T{shownNo(prevTask)}
            </button>
          )}

          {nextTask ? (
            <button className="nav-btn"
              onClick={() => setTask(nextTask)}
              style={{ background: '#0056d2', color: '#ffffff', padding: '8px 16px', fontSize: '12px' }}>
              Next Task →
            </button>
          ) : (
            <button className="nav-btn"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              style={{ background: '#dc2626', color: '#ffffff', padding: '8px 16px', fontSize: '12px' }}>
              {submitting ? '...' : 'Submit Exam'}
            </button>
          )}
        </div>
      </div>

      {/* Small movable picture window (drag the dark bar; drag the bottom-right corner to resize) */}
      {floatPic && lwTask && !lookWrite && (
        <div role="dialog" aria-label="Small picture" style={{ position: 'fixed', left: floatPos.x, top: floatPos.y, zIndex: 2900, width: 380, height: 300, minWidth: 220, minHeight: 160, maxWidth: '96vw', maxHeight: '85vh', resize: 'both', overflow: 'hidden', background: '#fff', borderRadius: 12, boxShadow: '0 12px 36px rgba(0,0,0,.3)', border: '2px solid #002761', display: 'flex', flexDirection: 'column' }}>
          <div onPointerDown={e => { if (e.pointerType !== 'touch') startDrag(e); }} onTouchStart={startDrag}
            style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#002761', color: '#fff', cursor: 'move', touchAction: 'none', userSelect: 'none' }}>
            <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>✥ Drag me</span>
            {visualOf(lwTask) === 'img' && (<>
              <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => setFloatZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))} style={{ width: 26, height: 26, borderRadius: '50%', border: 0, background: '#fff', color: '#002761', fontWeight: 800, cursor: 'pointer' }}>−</button>
              <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => setFloatZoom(z => Math.min(4, +(z + 0.25).toFixed(2)))} style={{ width: 26, height: 26, borderRadius: '50%', border: 0, background: '#fff', color: '#002761', fontWeight: 800, cursor: 'pointer' }}>+</button>
            </>)}
            <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => setFloatPic(false)} aria-label="Close" style={{ width: 26, height: 26, borderRadius: '50%', border: 0, background: '#fff', color: '#002761', fontWeight: 800, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {visualOf(lwTask) === 'img' && <img src={getFullUrl(lwTask.chartImageUrl)} alt="Task picture" draggable={false} style={{ width: `${floatZoom * 100}%`, maxWidth: 'none', display: 'block' }} />}
            {visualOf(lwTask) === 'chart' && <ChartRenderer chartData={lwTask.tableData} taskType={lwTask.tableData._writingTaskType} />}
            {visualOf(lwTask) === 'table' && (() => { const td = parseTaskTableData(lwTask); const g = td ? { ...td } : null; if (g) delete g._writingTaskType; return renderTable(g); })()}
          </div>
        </div>
      )}

      {/* Picture and writing box side by side (full screen) */}
      {lookWrite && lwTask && (() => {
        const kind = visualOf(lwTask);
        const td = parseTaskTableData(lwTask);
        const tdGrid = td ? { ...td } : null; if (tdGrid) delete tdGrid._writingTaskType;
        const zb = { width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #c9dcfb', background: '#fff', fontSize: 20, fontWeight: 700, color: '#0048b0', cursor: 'pointer', lineHeight: 1 };
        return (
          <div className="lw-wrap" role="dialog" aria-label="Picture and writing box">
            <style>{`
              .lw-wrap { position: fixed; inset: 0; z-index: 3000; background: #eef2f8; display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, 42%); grid-template-rows: auto minmax(0, 1fr); }
              .lw-top { grid-column: 1 / -1; display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: linear-gradient(135deg, #002761, #0048b0); color: #fff; }
              .lw-pic { overflow: auto; padding: 12px; min-height: 0; background: #fff; border-right: 1px solid #dae1ed; }
              .lw-write { display: flex; flex-direction: column; padding: 12px; gap: 8px; min-height: 0; }
              .lw-write textarea { flex: 1; min-height: 0; width: 100%; box-sizing: border-box; border: 1.5px solid #c9dcfb; border-radius: 10px; padding: 12px 14px; font: inherit; font-size: 16px; line-height: 1.7; resize: none; background: #fff; }
              @media (max-width: 899px) {
                .lw-wrap { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 45%) minmax(0, 1fr); }
                .lw-pic { border-right: 0; border-bottom: 1px solid #dae1ed; }
              }
            `}</style>
            <div className="lw-top">
              <b style={{ fontSize: 14 }}>Writing Task {shownNo(task)}</b>
              <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: timeLeft < 300 ? '#fca5a5' : '#fff' }}>{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
              <span style={{ flex: 1 }} />
              {kind === 'img' && (<>
                <button type="button" style={zb} aria-label="Zoom out" onClick={() => setLwZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}>−</button>
                <button type="button" style={{ ...zb, width: 'auto', borderRadius: 50, padding: '0 12px', fontSize: 13 }} onClick={() => setLwZoom(1)}>{lwZoom === 1 ? 'Fit' : `${Math.round(lwZoom * 100)}%`}</button>
                <button type="button" style={zb} aria-label="Zoom in" onClick={() => setLwZoom(z => Math.min(4, +(z + 0.25).toFixed(2)))}>+</button>
              </>)}
              <button type="button" onClick={() => setLookWrite(false)} style={{ marginLeft: 6, border: 0, borderRadius: 50, padding: '8px 16px', background: '#fff', color: '#002761', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Close ✕</button>
            </div>
            <div className="lw-pic">
              {kind === 'img' && <img src={getFullUrl(lwTask.chartImageUrl)} alt="Task picture" style={lwZoom === 1 ? { width: '100%', height: 'auto', display: 'block' } : { width: `${lwZoom * 100}%`, maxWidth: 'none', display: 'block' }} />}
              {kind === 'chart' && <ChartRenderer chartData={lwTask.tableData} taskType={lwTask.tableData._writingTaskType} />}
              {kind === 'table' && renderTable(tdGrid)}
            </div>
            <div className="lw-write">
              <div style={{ fontSize: 13, color: '#334155', maxHeight: 90, overflowY: 'auto', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: (currentTask?.prompt || '').split('\n')[0] }} />
              <textarea value={currentText} onChange={e => setCurrentText(e.target.value)} spellCheck={false} autoCorrect="off" autoCapitalize="off" data-gramm="false" data-enable-grammarly="false" placeholder={`Write your Task ${shownNo(task)} answer here…`} />
              <div style={{ fontSize: 13, fontWeight: 700, color: wcColor }}>{wc} / {minWords} words minimum</div>
            </div>
          </div>
        );
      })()}

      {/* Confirm before ending */}
      <FullscreenGuard active={!!examRef.current} />
      <EndTestConfirm
        open={showConfirm}
        unit="tasks"
        answered={ORDER.filter(n => wordCount(TEXTS[n][0]) > 0).length}
        total={ORDER.length}
        unanswered={ORDER.map((n, i) => (wordCount(TEXTS[n][0]) > 0 ? null : i + 1)).filter(Boolean)}
        onBack={() => setShowConfirm(false)}
        onEnd={confirmSubmit}
        onJump={n => { setTask(ORDER[n - 1] || n); setShowConfirm(false); }}
        extra={
          <div style={{ background: '#f0f6ff', borderRadius: 10, padding: '10px 14px', marginTop: 14, border: '1px solid #e3eeff' }}>
            {ORDER.map((t, i) => [i + 1, TEXTS[t][0], TEXTS[t][1]]).map(([n, txt, min]) => (
              <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 14 }}>
                <span style={{ color: '#5b6780' }}>Task {n}</span>
                <span style={{ fontWeight: 700, color: wordCount(txt) >= min ? '#16a34a' : '#dc2626' }}>
                  {wordCount(txt)} words {wordCount(txt) < min ? `(minimum ${min})` : '✓'}
                </span>
              </div>
            ))}
          </div>
        }
      />
    </div>
  );
}
