import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav from '../components/StudentNav';
import { T } from '../theme';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const errText = e => e?.response?.data?.error || 'Something went wrong. Please try again.';
const me = () => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } };
const STAFF = ['ADMIN', 'TEACHER', 'PROGRAM_TEACHER'];
const TYPE = { READING: ['Reading', '#0056d2'], WRITING: ['Writing', '#7c3aed'], LISTENING: ['Listening', '#0e7490'], SPEAKING: ['Speaking', '#c2410c'] };
const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;

function Linkify({ text, onLink }) {
  const parts = String(text).split(URL_RE);
  return parts.map((p, i) => (i % 2 === 1
    ? <a key={i} href={p} target="_blank" rel="noreferrer" onClick={() => onLink && onLink()} style={{ color: 'inherit', textDecoration: 'underline', wordBreak: 'break-all', fontWeight: 600 }}>{p}</a>
    : <Fragment key={i}>{p}</Fragment>));
}

function PaperCard({ paper, staff, onStart, starting }) {
  if (!paper) return null;
  const [label, col] = TYPE[paper.testType] || ['Paper', T.primary];
  return (
    <div className="mc-card">
      <div className="mc-card-top" style={{ background: col }}>{label} paper{paper.track === 'GENERAL' ? ' · General English' : paper.track === 'IELTS' ? ' · IELTS' : ''}</div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{paper.title}</div>
        <div style={{ fontSize: 13.5, color: T.muted, marginTop: 2 }}>
          {paper.timeLimitMin ? `${paper.timeLimitMin} minutes` : ''}
          {paper.difficulty ? <span style={{ marginLeft: 8, color: '#F59E0B', letterSpacing: 1 }}>{'★'.repeat(paper.difficulty)}<span style={{ color: '#D5DBE5' }}>{'★'.repeat(5 - paper.difficulty)}</span></span> : null}
        </div>
        {paper.missing ? <div style={{ fontSize: 13, color: T.error, marginTop: 6 }}>This paper is no longer available.</div>
          : !staff && <button type="button" className="mc-card-btn" disabled={starting} onClick={() => onStart(paper.id)} style={{ background: col }}>{starting ? 'Opening…' : 'Start paper'}</button>}
      </div>
    </div>
  );
}

function LessonCard({ lesson, staff, onOpen }) {
  if (!lesson) return null;
  return (
    <div className="mc-card">
      <div className="mc-card-top" style={{ background: '#2e7d32' }}>Lesson{lesson.module ? ` · ${lesson.module}` : ''}</div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{lesson.title}</div>
        {lesson.estimatedMin ? <div style={{ fontSize: 13.5, color: T.muted, marginTop: 2 }}>About {lesson.estimatedMin} minutes</div> : null}
        {lesson.missing ? <div style={{ fontSize: 13, color: T.error, marginTop: 6 }}>This lesson is no longer available.</div>
          : !staff && <button type="button" className="mc-card-btn" onClick={() => onOpen(lesson)} style={{ background: '#2e7d32' }}>Open lesson</button>}
      </div>
    </div>
  );
}

const initials = name => String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const AV_COLORS = ['#0056d2', '#7a3db8', '#0e7490', '#b45309', '#2e7d32', '#c2410c', '#be185d', '#475569'];
const avColor = s => AV_COLORS[[...String(s || '')].reduce((n, c) => n + c.charCodeAt(0), 0) % AV_COLORS.length];
function Avatar({ name, size = 36, color }) {
  return <span className="mc-av" style={{ width: size, height: size, fontSize: size * 0.38, background: color || avColor(name) }}>{initials(name)}</span>;
}
const dayName = d => {
  const t = new Date(d); const now = new Date();
  const diff = Math.round((new Date(now.toDateString()) - new Date(t.toDateString())) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return t.toLocaleDateString([], { weekday: diff < 7 ? 'long' : undefined, day: 'numeric', month: 'short' });
};
const shortWhen = d => {
  if (!d) return '';
  const t = new Date(d); const now = new Date();
  if (t.toDateString() === now.toDateString()) return t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const diff = Math.round((new Date(now.toDateString()) - new Date(t.toDateString())) / 86400000);
  return diff < 7 ? t.toLocaleDateString([], { weekday: 'short' }) : t.toLocaleDateString([], { day: 'numeric', month: 'short' });
};
const Icon = {
  send: <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" fill="currentColor" /></svg>,
  plus: <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  info: <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 11v6M12 7.5v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>,
  back: <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>,
};

function StatsModal({ messageId, onClose }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { axios.get(`${API_URL}/api/chat/messages/${messageId}/stats`, api()).then(r => setD(r.data)).catch(e => setErr(errText(e))); }, [messageId]);
  const tick = ok => <span style={{ fontWeight: 700, color: ok ? T.success : '#c3cad6' }}>{ok ? '✓' : '–'}</span>;
  const rows = d ? [...d.students].sort((a, b) => (b.done - a.done) || (b.opened - a.opened) || (b.seen - a.seen) || a.name.localeCompare(b.name)) : [];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,20,.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(560px, 100%)', maxHeight: '86vh', overflowY: 'auto', background: '#fff', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Who did it?</h2>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'none', fontSize: 22, cursor: 'pointer' }} aria-label="Close">×</button>
        </div>
        {err && <p style={{ color: T.error }}>{err}</p>}
        {!d && !err && <p style={{ color: T.muted }}>Loading…</p>}
        {d && (<>
          <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
            {[['Seen', d.seen, '#e3eeff', T.primary], ['Opened', d.opened, '#fff4e8', '#c2410c'], ['Done', d.done, '#e9f5e6', '#276a1a'], ['Not yet', d.total - d.done, '#fdecee', T.error]].map(([k, v, bg, c]) => (
              <div key={k} style={{ background: bg, color: c, borderRadius: 10, padding: '8px 14px', fontWeight: 700 }}><div style={{ fontSize: 22 }}>{v}<span style={{ fontSize: 13, opacity: .8 }}>/{d.total}</span></div><div style={{ fontSize: 12.5 }}>{k}</div></div>
            ))}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5 }}>
            <thead><tr style={{ textAlign: 'left', color: T.muted, fontSize: 12.5 }}><th style={{ padding: 6 }}>Student</th><th style={{ padding: 6, textAlign: 'center' }}>Seen</th><th style={{ padding: 6, textAlign: 'center' }}>Opened</th><th style={{ padding: 6, textAlign: 'center' }}>Done</th><th style={{ padding: 6 }}>Score</th></tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.id} style={{ borderTop: `1px solid ${T.tint}`, background: r.done ? '#f5fbf3' : 'transparent' }}>
                <td style={{ padding: 6 }}><b>{r.name}</b></td>
                <td style={{ padding: 6, textAlign: 'center' }}>{tick(r.seen || r.opened)}</td>
                <td style={{ padding: 6, textAlign: 'center' }}>{tick(r.opened)}</td>
                <td style={{ padding: 6, textAlign: 'center' }}>{tick(r.done)}</td>
                <td style={{ padding: 6, color: T.muted }}>{r.score || ''}</td>
              </tr>
            ))}</tbody>
          </table>
          {d.total === 0 && <p style={{ color: T.muted }}>No students in this group yet.</p>}
        </>)}
      </div>
    </div>
  );
}

function Members({ group, onClose, flash }) {
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  const [people, setPeople] = useState([]);
  const [pick, setPick] = useState({});
  const load = useCallback(() => axios.get(`${API_URL}/api/chat/groups/${group.id}/members`, api()).then(r => setList(r.data)).catch(e => flash(errText(e))), [group.id, flash]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => axios.get(`${API_URL}/api/chat/people`, { ...api(), params: { q } }).then(r => setPeople(r.data)).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [q]);
  const inGroup = new Set((list || []).map(m => m.id));
  const add = async ids => {
    if (!ids.length) return;
    try { await axios.post(`${API_URL}/api/chat/groups/${group.id}/members`, { studentIds: ids }, api()); setPick({}); load(); flash(`${ids.length} added.`); } catch (e) { flash(errText(e)); }
  };
  const remove = async id => { try { await axios.delete(`${API_URL}/api/chat/groups/${group.id}/members/${id}`, api()); load(); } catch (e) { flash(errText(e)); } };
  const chosen = Object.keys(pick).filter(k => pick[k]).map(Number);
  const notIn = people.filter(p => !inGroup.has(p.id));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,20,.45)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(460px, 100%)', height: '100%', background: '#fff', overflowY: 'auto', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Members · {group.name}</h2>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'none', fontSize: 22, cursor: 'pointer' }} aria-label="Close">×</button>
        </div>
        <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: T.muted }}>ADD STUDENTS</div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or email" style={{ width: '100%', marginTop: 6, border: `1.5px solid ${T.hairline}`, borderRadius: 8, padding: '9px 11px', fontSize: 14.5, fontFamily: 'inherit' }} />
        <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 6, border: `1px solid ${T.hairline}`, borderRadius: 8 }}>
          {notIn.length === 0 && <div style={{ padding: 10, fontSize: 14, color: T.muted }}>No more students to add.</div>}
          {notIn.map(p => (
            <label key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 10px', borderBottom: `1px solid ${T.tint}`, cursor: 'pointer', fontSize: 14.5 }}>
              <input type="checkbox" checked={!!pick[p.id]} onChange={e => setPick(x => ({ ...x, [p.id]: e.target.checked }))} />
              <span><b>{p.name}</b> <span style={{ color: T.mid, fontSize: 13 }}>{p.email}{p.course ? ` · ${p.course === 'GENERAL' ? 'General English' : p.course}` : ''}</span></span>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button type="button" disabled={!chosen.length} onClick={() => add(chosen)} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: 0, background: chosen.length ? T.primary : '#b8c3d6', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Add selected ({chosen.length})</button>
          <button type="button" disabled={!notIn.length} onClick={() => add(notIn.map(p => p.id))} style={{ height: 36, padding: '0 14px', borderRadius: 8, border: `1px solid ${T.ink}`, background: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add all shown ({notIn.length})</button>
        </div>
        <div style={{ marginTop: 20, fontSize: 14, fontWeight: 700, color: T.muted }}>IN THIS GROUP ({list ? list.length : '…'})</div>
        {(list || []).map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${T.tint}`, fontSize: 14.5 }}>
            <span><b>{m.name}</b>{STAFF.includes(m.role) ? <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: T.primary, background: T.primarySoft, borderRadius: 50, padding: '1px 8px' }}>STAFF</span> : null}<br /><span style={{ color: T.mid, fontSize: 13 }}>{m.email}</span></span>
            <button type="button" onClick={() => remove(m.id)} style={{ border: 0, background: 'none', color: T.error, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.mc-wrap { height: calc(100vh - var(--mc-top)); display: grid; grid-template-columns: 340px minmax(0, 1fr); background: #fff; }
.mc-wrap.with-info { grid-template-columns: 340px minmax(0, 1fr) 320px; }
.mc-side { border-right: 1px solid #e4e6eb; display: flex; flex-direction: column; min-height: 0; }
.mc-side-h { padding: 16px 16px 8px; }
.mc-title { font-size: 24px; font-weight: 800; margin: 0; }
.mc-search { display: flex; align-items: center; gap: 8px; background: #f0f2f5; border-radius: 50px; padding: 0 14px; height: 40px; color: #65676b; }
.mc-search input { border: 0; background: transparent; outline: none; font: inherit; font-size: 15px; flex: 1; min-width: 0; color: #050505; }
.mc-list { overflow-y: auto; padding: 4px 8px 12px; flex: 1; }
.mc-item { width: 100%; display: flex; gap: 12px; align-items: center; padding: 10px; border: 0; border-radius: 10px; background: transparent; cursor: pointer; font: inherit; text-align: left; }
.mc-item:hover { background: #f2f2f2; }
.mc-item.on { background: #ebf5ff; }
.mc-av { border-radius: 50%; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; flex: none; letter-spacing: .02em; }
.mc-main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.mc-head { height: 64px; padding: 0 12px 0 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #e4e6eb; box-shadow: 0 1px 2px rgba(0,0,0,.04); flex: none; }
.mc-iconbtn { width: 40px; height: 40px; border-radius: 50%; border: 0; background: transparent; color: ${T.primary}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-iconbtn:hover { background: #f0f2f5; }
.mc-feed { flex: 1; overflow-y: auto; padding: 12px 16px 8px; background: #fff; }
.mc-day { text-align: center; font-size: 12.5px; color: #65676b; font-weight: 600; margin: 16px 0 8px; }
.mc-row { display: flex; align-items: flex-end; gap: 8px; margin-top: 2px; }
.mc-row.mine { justify-content: flex-end; }
.mc-col { display: flex; flex-direction: column; max-width: min(560px, 76%); min-width: 0; }
.mc-row.mine .mc-col { align-items: flex-end; }
.mc-name { font-size: 12.5px; color: #65676b; margin: 10px 0 2px 12px; }
.mc-bub { padding: 8px 12px; border-radius: 18px; font-size: 15px; line-height: 1.42; white-space: pre-wrap; overflow-wrap: anywhere; background: #f0f2f5; color: #050505; position: relative; }
.mc-row.mine .mc-bub { background: ${T.primary}; color: #fff; }
.mc-row.staff:not(.mine) .mc-bub { background: #fff6dc; }
.mc-row:not(.mine).first .mc-bub { border-bottom-left-radius: 6px; } .mc-row:not(.mine).mid .mc-bub { border-top-left-radius: 6px; border-bottom-left-radius: 6px; } .mc-row:not(.mine).last .mc-bub { border-top-left-radius: 6px; }
.mc-row.mine.first .mc-bub { border-bottom-right-radius: 6px; } .mc-row.mine.mid .mc-bub { border-top-right-radius: 6px; border-bottom-right-radius: 6px; } .mc-row.mine.last .mc-bub { border-top-right-radius: 6px; }
.mc-bub.cardonly { background: transparent !important; padding: 0; }
.mc-bub.gone { background: transparent !important; border: 1px solid #e4e6eb; color: #8a8d91 !important; font-style: italic; }
.mc-meta { display: flex; gap: 8px; align-items: center; font-size: 11.5px; color: #8a8d91; margin: 3px 6px 0; flex-wrap: wrap; }
.mc-act { opacity: 0; transition: opacity .12s; border: 0; background: #f0f2f5; color: #b3261e; font: inherit; font-size: 12px; font-weight: 700; border-radius: 50px; padding: 3px 10px; cursor: pointer; align-self: center; flex: none; }
.mc-row:hover .mc-act, .mc-act:focus { opacity: 1; }
@media (hover: none) { .mc-act { opacity: .85; } }
.mc-task { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: .06em; background: #f5b400; color: #1d1600; border-radius: 50px; padding: 1px 8px; margin-bottom: 4px; }
.mc-row.mine .mc-task { background: rgba(255,255,255,.25); color: #fff; }
.mc-card { background: #fff; border: 1px solid #e4e6eb; border-radius: 16px; overflow: hidden; width: min(340px, 70vw); color: #050505; white-space: normal; margin-top: 4px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
.mc-card-top { color: #fff; font-size: 12px; font-weight: 700; letter-spacing: .04em; padding: 6px 12px; }
.mc-card-btn { margin-top: 10px; height: 38px; width: 100%; border: 0; border-radius: 10px; color: #fff; font: inherit; font-weight: 700; font-size: 14.5px; cursor: pointer; }
.mc-stat { border: 0; background: #ebf5ff; color: ${T.primary}; font: inherit; font-size: 12.5px; font-weight: 700; border-radius: 50px; padding: 3px 10px; cursor: pointer; }
.mc-comp { padding: 10px 12px 12px; border-top: 1px solid #e4e6eb; flex: none; background: #fff; }
.mc-bar { display: flex; align-items: flex-end; gap: 6px; }
.mc-input { flex: 1; min-width: 0; background: #f0f2f5; border-radius: 22px; padding: 10px 16px; border: 0; outline: none; font: inherit; font-size: 15px; resize: none; max-height: 160px; line-height: 1.4; color: #050505; }
.mc-send { width: 42px; height: 42px; border-radius: 50%; border: 0; background: transparent; color: ${T.primary}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-send:disabled { color: #bcc0c4; cursor: default; }
.mc-pop { border: 1px solid #e4e6eb; border-radius: 14px; padding: 8px; margin-bottom: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.08); background: #fff; }
.mc-pick { display: flex; width: 100%; gap: 8px; align-items: baseline; text-align: left; border: 0; background: transparent; padding: 7px 8px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 14px; }
.mc-pick:hover, .mc-pick.on { background: #ebf5ff; }
.mc-chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #e4e6eb; border-radius: 50px; padding: 4px 12px; font: inherit; font-size: 13px; font-weight: 600; background: #fff; cursor: pointer; color: #050505; }
.mc-chip.on { background: #fff6dc; border-color: #f5d98b; color: #6b4a00; }
.mc-info { border-left: 1px solid #e4e6eb; overflow-y: auto; padding: 20px 16px; }
.mc-info-btn { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 8px; border: 0; background: transparent; padding: 11px 10px; border-radius: 10px; cursor: pointer; font: inherit; font-size: 15px; font-weight: 600; color: #050505; text-align: left; }
.mc-info-btn:hover { background: #f2f2f2; }
.mc-toggle { width: 40px; height: 22px; border-radius: 50px; position: relative; flex: none; transition: background .15s; }
.mc-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .15s; }
.mc-toggle.on::after { transform: translateX(18px); }
@media (max-width: 1100px) { .mc-wrap.with-info { grid-template-columns: 300px minmax(0, 1fr); } .mc-info { position: fixed; right: 0; top: 0; bottom: 0; width: min(340px, 100%); background: #fff; z-index: 40; box-shadow: -8px 0 24px rgba(0,0,0,.12); } }
@media (max-width: 819px) { .mc-wrap, .mc-wrap.with-info { grid-template-columns: 1fr; } .mc-side { border-right: 0; } .mc-col { max-width: 84%; } }
`;

export default function Messages() {
  const navigate = useNavigate();
  const user = me();
  const staff = STAFF.includes(user.role);
  const [groups, setGroups] = useState(null);
  const [sel, setSel] = useState(() => { try { return parseInt(sessionStorage.getItem('chat-group'), 10) || null; } catch { return null; } });
  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [attach, setAttach] = useState(null); // { kind: 'paper'|'lesson', item }
  const [picker, setPicker] = useState(null); // 'menu' | 'paper' | 'lesson'
  const [papers, setPapers] = useState([]);
  const [lessons, setLessons] = useState(null);
  const [pickQ, setPickQ] = useState('');
  const [listQ, setListQ] = useState('');
  const [code, setCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newOnly, setNewOnly] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(null);
  const [asTask, setAsTask] = useState(false);
  const [statsFor, setStatsFor] = useState(null);
  const [notifPerm, setNotifPerm] = useState(() => ('Notification' in window ? Notification.permission : 'unsupported'));
  const [narrow, setNarrow] = useState(() => window.innerWidth < 820);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const lastId = useRef(0);
  const flash = useCallback(m => { setMsg(m); setTimeout(() => setMsg(''), 3500); }, []);

  useEffect(() => { const f = () => setNarrow(window.innerWidth < 820); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const loadGroups = useCallback(() => axios.get(`${API_URL}/api/chat/groups`, api()).then(r => setGroups(r.data)).catch(e => { setGroups([]); flash(errText(e)); }), [flash]);
  useEffect(() => { loadGroups(); const id = setInterval(loadGroups, 15000); return () => clearInterval(id); }, [loadGroups]);
  useEffect(() => { if (staff) axios.get(`${API_URL}/api/chat/papers`, api()).then(r => setPapers(Array.isArray(r.data) ? r.data : [])).catch(() => {}); }, [staff]);
  useEffect(() => { if (staff && picker === 'lesson' && lessons == null) axios.get(`${API_URL}/api/chat/lessons`, api()).then(r => setLessons(Array.isArray(r.data) ? r.data : [])).catch(() => setLessons([])); }, [staff, picker, lessons]);
  useEffect(() => { try { if (sel) sessionStorage.setItem('chat-group', String(sel)); } catch { /* blocked */ } }, [sel]);

  const scrollDown = () => setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 30);
  const loadMessages = useCallback(async (full) => {
    if (!sel) return;
    try {
      const r = await axios.get(`${API_URL}/api/chat/groups/${sel}/messages`, { ...api(), params: full ? {} : { after: lastId.current } });
      const d = r.data;
      setData(prev => {
        if (full || !prev || prev.group.id !== d.group.id) { lastId.current = d.messages.length ? d.messages[d.messages.length - 1].id : 0; scrollDown(); return d; }
        const gone = new Set(d.unsent || []);
        const base = gone.size ? prev.messages.map(m => gone.has(m.id) && !m.deleted ? { ...m, deleted: true, text: '', paper: null, lesson: null, stats: null, status: null } : m) : prev.messages;
        if (!d.messages.length) return { ...prev, group: d.group, canPost: d.canPost, messages: base };
        lastId.current = d.messages[d.messages.length - 1].id;
        const el = listRef.current; const atBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        if (atBottom) scrollDown();
        return { ...d, messages: [...base, ...d.messages] };
      });
    } catch (e) {
      if (e.response?.status === 404) { setSel(null); setData(null); loadGroups(); }
    }
  }, [sel, loadGroups]);
  useEffect(() => {
    setData(null); lastId.current = 0; setShowInfo(false); setPicker(null); setAttach(null);
    if (!sel) return undefined;
    loadMessages(true);
    const id = setInterval(() => { if (document.visibilityState === 'visible') loadMessages(false); }, 4000);
    return () => clearInterval(id);
  }, [sel, loadMessages]);

  const canSend = !sending && (text.trim() || attach);
  const send = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/chat/groups/${sel}/messages`, {
        text,
        paperId: attach?.kind === 'paper' ? attach.item.id : undefined,
        lessonId: attach?.kind === 'lesson' ? attach.item.id : undefined,
        isTask: asTask || !!attach,
      }, api());
      setText(''); setAttach(null); setPicker(null); setAsTask(false);
      await loadMessages(false); scrollDown(); loadGroups();
      inputRef.current?.focus();
    } catch (e) { flash(errText(e)); }
    setSending(false);
  };
  const del = async id => {
    if (!window.confirm(staff ? 'Unsend this message? It will be removed for everyone in the group.' : 'Unsend this message?')) return;
    try { await axios.delete(`${API_URL}/api/chat/messages/${id}`, api()); setData(d => ({ ...d, messages: d.messages.map(m => m.id === id ? { ...m, deleted: true, text: '', paper: null, lesson: null, stats: null, status: null } : m) })); } catch (e) { flash(errText(e)); }
  };
  const join = async () => {
    try { const r = await axios.post(`${API_URL}/api/chat/join`, { code }, api()); setCode(''); await loadGroups(); setSel(r.data.id); flash(`You joined ${r.data.name}.`); } catch (e) { flash(errText(e)); }
  };
  const create = async () => {
    try { const r = await axios.post(`${API_URL}/api/chat/groups`, { name: newName, onlyStaffPost: newOnly }, api()); setNewName(''); setNewOnly(false); setShowNew(false); await loadGroups(); setSel(r.data.id); } catch (e) { flash(errText(e)); }
  };
  const patch = async body => {
    try { await axios.patch(`${API_URL}/api/chat/groups/${sel}`, body, api()); loadMessages(true); loadGroups(); } catch (e) { flash(errText(e)); }
  };
  const track = (messageId, kind, undo) => axios.post(`${API_URL}/api/chat/messages/${messageId}/click`, { kind, undo }, api()).catch(() => {});
  const markDone = async (m, undo) => {
    await track(m.id, 'DONE', undo);
    setData(d => ({ ...d, messages: d.messages.map(x => x.id === m.id ? { ...x, status: { ...(x.status || {}), done: !undo, opened: true } } : x) }));
  };
  const askNotif = async () => { try { const p = await Notification.requestPermission(); setNotifPerm(p); if (p === 'granted') flash('Notifications are on. You will get a message when there is a new task.'); } catch { /* not supported */ } };
  const startPaper = async (id, messageId) => {
    if (messageId && !staff) track(messageId, 'PAPER');
    setStarting(id);
    try { const r = await axios.post(`${API_URL}/api/attempts`, { paperId: id }, api()); navigate(`/exam/${r.data.id || r.data.attemptId}/greeting`); }
    catch (e) { if (e.response?.status === 403) navigate('/upgrade'); else flash(errText(e)); }
    setStarting(null);
  };
  const openLesson = async (lesson, messageId) => {
    if (messageId && !staff) await track(messageId, 'LESSON');
    navigate(`/learn/${lesson.moduleId}/${lesson.id}`);
  };
  const copyInvite = () => {
    const t = `Join our group "${data.group.name}" on epicielts.live: open Messages and enter the code ${data.group.joinCode}`;
    try { navigator.clipboard.writeText(t); flash('Invite copied. Paste it in WhatsApp.'); } catch { flash(t); }
  };

  const q = pickQ.trim().toLowerCase();
  const shownPapers = useMemo(() => papers.filter(p => !q || p.title.toLowerCase().includes(q)).slice(0, 80), [papers, q]);
  const shownLessons = useMemo(() => (lessons || []).filter(l => !q || l.title.toLowerCase().includes(q) || String(l.module || '').toLowerCase().includes(q)).slice(0, 120), [lessons, q]);
  const shownGroups = (groups || []).filter(g => !listQ.trim() || g.name.toLowerCase().includes(listQ.trim().toLowerCase()));
  const selGroup = (groups || []).find(g => g.id === sel);

  const showList = !narrow || !sel;
  const showChat = !narrow || !!sel;
  const pill = (primary) => ({ height: 36, padding: '0 14px', borderRadius: 50, border: primary ? 0 : '1px solid #e4e6eb', background: primary ? T.primary : '#fff', color: primary ? '#fff' : '#050505', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' });

  // Group messages into runs from the same sender (Messenger-style bubbles), with day separators
  const feed = useMemo(() => {
    const ms = data?.messages || [];
    return ms.map((m, i) => {
      const prev = ms[i - 1]; const next = ms[i + 1];
      const gap = (a, b) => Math.abs(new Date(b.createdAt) - new Date(a.createdAt)) > 5 * 60000;
      const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
      const joinPrev = prev && !newDay && prev.senderId === m.senderId && !gap(prev, m);
      const nextDay = next && new Date(next.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
      const joinNext = next && !nextDay && next.senderId === m.senderId && !gap(m, next);
      const pos = joinPrev && joinNext ? 'mid' : joinPrev ? 'last' : joinNext ? 'first' : 'single';
      return { m, newDay, pos, showName: !m.mine && !joinPrev, showAvatar: !m.mine && !joinNext, showTime: !joinNext };
    });
  }, [data]);

  const topH = staff ? 56 : 69;
  const info = data && (
    <aside className="mc-info" aria-label="Group details">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="mc-iconbtn" onClick={() => setShowInfo(false)} aria-label="Close details" style={{ color: '#65676b', fontSize: 24 }}>×</button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <Avatar name={data.group.name} size={72} />
        <div style={{ fontWeight: 800, fontSize: 18, marginTop: 8 }}>{data.group.name}</div>
        <div style={{ fontSize: 13.5, color: '#65676b' }}>{selGroup ? `${selGroup.members} members · ` : ''}{data.group.onlyStaffPost ? 'Only teachers post' : 'Everyone can post'}</div>
      </div>
      {staff ? (<>
        <div style={{ background: '#f0f2f5', borderRadius: 12, padding: '10px 12px', marginBottom: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, color: '#65676b', fontWeight: 700 }}>JOIN CODE</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 4 }}>{data.group.joinCode}</div>
          <button type="button" onClick={copyInvite} style={{ ...pill(true), marginTop: 6 }}>Copy invite for WhatsApp</button>
        </div>
        <button type="button" className="mc-info-btn" onClick={() => setShowMembers(true)}>Members <span style={{ color: '#65676b' }}>›</span></button>
        <button type="button" className="mc-info-btn" onClick={() => patch({ onlyStaffPost: !data.group.onlyStaffPost })}>Only teachers can post <span className={`mc-toggle${data.group.onlyStaffPost ? ' on' : ''}`} style={{ background: data.group.onlyStaffPost ? T.primary : '#ccd0d5' }} /></button>
        <button type="button" className="mc-info-btn" title="Posts a task every morning at 8:00" onClick={() => patch({ dailyTask: !data.group.dailyTask })}>
          <span>Daily task<span style={{ display: 'block', fontSize: 12.5, color: '#65676b', fontWeight: 400 }}>A paper or video every morning at 8:00</span></span>
          <span className={`mc-toggle${data.group.dailyTask ? ' on' : ''}`} style={{ background: data.group.dailyTask ? '#2e7d32' : '#ccd0d5' }} />
        </button>
        <button type="button" className="mc-info-btn" onClick={async () => { try { await axios.post(`${API_URL}/api/chat/groups/${sel}/daily-now`, {}, api()); loadMessages(false); scrollDown(); flash('Task posted.'); } catch (e) { flash(errText(e)); } }}>Post today's task now <span style={{ color: '#65676b' }}>›</span></button>
        <button type="button" className="mc-info-btn" style={{ color: T.error }} onClick={() => { if (window.confirm('Archive this group? Students will not see it any more.')) patch({ archived: true }).then(() => setSel(null)); }}>Archive group</button>
      </>) : (<>
        {notifPerm === 'default' && <button type="button" className="mc-info-btn" onClick={askNotif}>Turn on notifications <span style={{ color: T.primary }}>›</span></button>}
        <button type="button" className="mc-info-btn" style={{ color: T.error }} onClick={async () => { if (!window.confirm('Leave this group?')) return; try { await axios.delete(`${API_URL}/api/chat/groups/${sel}/members/${user.id}`, api()); setSel(null); loadGroups(); } catch (e) { flash(errText(e)); } }}>Leave group</button>
      </>)}
    </aside>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: T.font, color: '#050505', '--mc-top': `${topH}px` }}>
      <style>{CSS}</style>
      {staff
        ? <div style={{ height: topH, background: T.navy, color: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 17 }}>EPIC Campus · Messages</b>
            <button type="button" onClick={() => navigate(user.role === 'PROGRAM_TEACHER' ? '/teacher' : '/admin/dashboard')} style={{ ...pill(false), background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.7)' }}>Back to admin</button>
          </div>
        : <StudentNav active="messages" />}
      {msg && <div role="status" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#050505', color: '#fff', padding: '10px 18px', borderRadius: 50, zIndex: 60, fontSize: 14.5 }}>{msg}</div>}

      <div className={`mc-wrap${showInfo && !narrow ? ' with-info' : ''}`}>
        {showList && (
          <aside className="mc-side" aria-label="Chats">
            <div className="mc-side-h">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 40, marginBottom: 10 }}>
                <h1 className="mc-title">Chats</h1>
                {staff && !showNew && <button type="button" onClick={() => setShowNew(true)} style={pill(false)}>+ New group</button>}
              </div>
              {staff && showNew && (
                <div style={{ display: 'grid', gap: 8, marginBottom: 10, background: '#f0f2f5', borderRadius: 12, padding: 10 }}>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name, e.g. Korea Batch 1" autoFocus style={{ border: '1px solid #e4e6eb', borderRadius: 10, padding: '9px 11px', fontSize: 14.5, fontFamily: 'inherit' }} />
                  <label style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={newOnly} onChange={e => setNewOnly(e.target.checked)} /> Only teachers can post</label>
                  <div style={{ display: 'flex', gap: 6 }}><button type="button" disabled={!newName.trim()} onClick={create} style={pill(true)}>Create</button><button type="button" onClick={() => setShowNew(false)} style={pill(false)}>Cancel</button></div>
                </div>
              )}
              <label className="mc-search">{Icon.search}<input value={listQ} onChange={e => setListQ(e.target.value)} placeholder="Search chats" aria-label="Search chats" /></label>
              {!staff && (
                <form onSubmit={e => { e.preventDefault(); join(); }} style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Have a group code? Type it here" maxLength={8} style={{ flex: 1, minWidth: 0, border: '1px solid #e4e6eb', borderRadius: 50, padding: '0 14px', height: 38, fontSize: 14, fontFamily: 'inherit', letterSpacing: code ? 2 : 0, fontWeight: code ? 700 : 400 }} />
                  <button type="submit" disabled={!code.trim()} style={{ ...pill(true), opacity: code.trim() ? 1 : 0.5 }}>Join</button>
                </form>
              )}
            </div>
            <div className="mc-list">
              {groups == null && <div style={{ color: '#65676b', fontSize: 14, padding: 10 }}>Loading…</div>}
              {groups && groups.length === 0 && <div style={{ color: '#65676b', fontSize: 14, lineHeight: 1.5, padding: 10 }}>{staff ? 'No groups yet. Create one, then share its code with your students.' : 'You are not in a group yet. Ask your teacher for the group code and type it above.'}</div>}
              {shownGroups.map(g => (
                <button key={g.id} type="button" className={`mc-item${sel === g.id ? ' on' : ''}`} onClick={() => setSel(g.id)}>
                  <Avatar name={g.name} size={52} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 15.5, fontWeight: g.unread > 0 ? 800 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                    <span style={{ display: 'flex', gap: 4, fontSize: 13.5, color: g.unread > 0 ? '#050505' : '#65676b', fontWeight: g.unread > 0 ? 700 : 400 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{g.last ? `${g.last.by === user.name ? 'You' : g.last.by.split(' ')[0]}: ${g.last.text || ''}` : `${g.members} member${g.members === 1 ? '' : 's'}`}</span>
                      {g.last && <span style={{ flex: 'none' }}>· {shortWhen(g.last.at)}</span>}
                    </span>
                  </span>
                  {g.unread > 0 && <span style={{ width: 12, height: 12, borderRadius: '50%', background: T.primary, flex: 'none' }} aria-label={`${g.unread} unread`} />}
                </button>
              ))}
            </div>
          </aside>
        )}

        {showChat && (
          <section className="mc-main" aria-label="Chat">
            {!sel && <div style={{ margin: 'auto', color: '#65676b', fontSize: 15, padding: 20, textAlign: 'center' }}>Choose a chat on the left.</div>}
            {sel && !data && <div style={{ margin: 'auto', color: '#65676b' }}>Loading…</div>}
            {sel && data && (<>
              <div className="mc-head">
                {narrow && <button type="button" className="mc-iconbtn" onClick={() => setSel(null)} aria-label="Back to chats">{Icon.back}</button>}
                <Avatar name={data.group.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.group.name}</div>
                  <div style={{ fontSize: 12.5, color: '#65676b' }}>{selGroup ? `${selGroup.members} members` : ''}{data.group.dailyTask ? ' · Daily task on' : ''}</div>
                </div>
                <button type="button" className="mc-iconbtn" onClick={() => setShowInfo(v => !v)} aria-label="Group details" title="Group details">{Icon.info}</button>
              </div>

              <div ref={listRef} className="mc-feed">
                {data.messages.length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <Avatar name={data.group.name} size={64} />
                    <div style={{ fontWeight: 700, fontSize: 17, marginTop: 8 }}>{data.group.name}</div>
                    <div style={{ color: '#65676b', fontSize: 14 }}>No messages yet. Say hello.</div>
                  </div>
                )}
                {feed.map(({ m, newDay, pos, showName, showAvatar, showTime }) => {
                  const cardOnly = !m.deleted && !m.text && (m.paper || m.lesson) && !m.isTask;
                  return (
                    <Fragment key={m.id}>
                      {newDay && <div className="mc-day">{dayName(m.createdAt)}</div>}
                      <div className={`mc-row ${m.mine ? 'mine' : ''} ${m.staff ? 'staff' : ''} ${pos}`}>
                        {!m.mine && (showAvatar ? <Avatar name={m.senderName} size={28} color={m.senderName === 'EPIC Daily Task' ? '#f5b400' : undefined} /> : <span style={{ width: 28, flex: 'none' }} />)}
                        {m.mine && !m.deleted && <button type="button" className="mc-act" onClick={() => del(m.id)} title="Remove this message for everyone">Unsend</button>}
                        <div className="mc-col">
                          {showName && <div className="mc-name">{m.senderName}{m.staff ? ' · Teacher' : ''}</div>}
                          <div className={`mc-bub${m.deleted ? ' gone' : ''}${cardOnly ? ' cardonly' : ''}`}>
                            {m.deleted ? (m.mine ? 'You unsent a message' : 'This message was unsent') : (<>
                              {m.isTask && <div className="mc-task">TASK</div>}
                              {m.text && <div><Linkify text={m.text} onLink={staff ? null : () => track(m.id, 'LINK')} /></div>}
                              {m.paper && <PaperCard paper={m.paper} staff={staff} onStart={pid => startPaper(pid, m.id)} starting={starting === m.paper.id} />}
                              {m.lesson && <LessonCard lesson={m.lesson} staff={staff} onOpen={l => openLesson(l, m.id)} />}
                              {!staff && m.isTask && m.status && !m.paper && (
                                m.status.done
                                  ? <div style={{ marginTop: 6, fontSize: 13.5, fontWeight: 700, color: m.mine ? '#fff' : '#276a1a' }}>Done ✓ {!m.lesson && <button type="button" onClick={() => markDone(m, true)} style={{ border: 0, background: 'none', color: 'inherit', opacity: .7, cursor: 'pointer', fontSize: 12, textDecoration: 'underline', fontFamily: 'inherit' }}>undo</button>}</div>
                                  : !m.lesson && <button type="button" onClick={() => markDone(m)} style={{ display: 'block', marginTop: 8, height: 34, padding: '0 14px', border: 0, borderRadius: 50, background: '#2e7d32', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Mark as done</button>
                              )}
                              {!staff && m.isTask && m.status?.done && m.paper && <div style={{ marginTop: 6, fontSize: 13.5, fontWeight: 700, color: '#276a1a' }}>Done ✓</div>}
                            </>)}
                          </div>
                          {(showTime || (staff && m.stats && !m.deleted)) && (
                            <div className="mc-meta">
                              {showTime && <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>}
                              {staff && m.stats && !m.deleted && (
                                <button type="button" className="mc-stat" onClick={() => setStatsFor(m.id)}>
                                  Seen {m.stats.seen}/{m.stats.total}{m.stats.task ? ` · Done ${m.stats.done}` : ` · Opened ${m.stats.opened}`} ›
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        {!m.mine && staff && !m.deleted && <button type="button" className="mc-act" onClick={() => del(m.id)} title="Remove this message for everyone">Unsend</button>}
                      </div>
                    </Fragment>
                  );
                })}
              </div>

              {data.canPost ? (
                <div className="mc-comp">
                  {staff && picker === 'menu' && (
                    <div className="mc-pop" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="mc-chip" onClick={() => { setPicker('paper'); setPickQ(''); }}>Share a paper</button>
                      <button type="button" className="mc-chip" onClick={() => { setPicker('lesson'); setPickQ(''); }}>Share a lesson</button>
                    </div>
                  )}
                  {staff && (picker === 'paper' || picker === 'lesson') && (
                    <div className="mc-pop">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <b style={{ fontSize: 14 }}>{picker === 'paper' ? 'Share a paper' : 'Share a lesson'}</b>
                        <label className="mc-search" style={{ height: 34, flex: 1 }}>{Icon.search}<input autoFocus value={pickQ} onChange={e => setPickQ(e.target.value)} placeholder={picker === 'paper' ? 'Search papers' : 'Search lessons'} /></label>
                        <button type="button" onClick={() => setPicker(null)} style={{ border: 0, background: 'none', fontSize: 20, cursor: 'pointer', color: '#65676b' }} aria-label="Close">×</button>
                      </div>
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {picker === 'paper' && shownPapers.map(p => (
                          <button key={p.id} type="button" className="mc-pick" onClick={() => { setAttach({ kind: 'paper', item: p }); setPicker(null); inputRef.current?.focus(); }}>
                            <b style={{ color: (TYPE[p.testType] || [])[1], flex: 'none' }}>{(TYPE[p.testType] || [p.testType])[0]}</b><span style={{ flex: 1 }}>{p.title}</span><span style={{ color: '#8a8d91', fontSize: 12.5 }}>{p.track === 'GENERAL' ? 'General English' : 'IELTS'}</span>
                          </button>
                        ))}
                        {picker === 'lesson' && lessons == null && <div style={{ color: '#65676b', fontSize: 14, padding: 8 }}>Loading lessons…</div>}
                        {picker === 'lesson' && lessons && shownLessons.length === 0 && <div style={{ color: '#65676b', fontSize: 14, padding: 8 }}>No lessons found.</div>}
                        {picker === 'lesson' && shownLessons.map(l => (
                          <button key={l.id} type="button" className="mc-pick" onClick={() => { setAttach({ kind: 'lesson', item: l }); setPicker(null); inputRef.current?.focus(); }}>
                            <b style={{ color: '#2e7d32', flex: 'none' }}>Lesson</b><span style={{ flex: 1 }}>{l.title}</span><span style={{ color: '#8a8d91', fontSize: 12.5 }}>{l.module}{l.track === 'GENERAL' ? ' · GE' : l.track === 'IELTS' ? ' · IELTS' : ''}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {(attach || staff) && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                      {attach && (
                        <span className="mc-chip" style={{ cursor: 'default', background: '#ebf5ff', borderColor: '#bcd7fb' }}>
                          {attach.kind === 'paper' ? 'Paper' : 'Lesson'}: <b>{attach.item.title}</b>
                          <button type="button" onClick={() => setAttach(null)} aria-label="Remove" style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: '#65676b' }}>×</button>
                        </span>
                      )}
                      {staff && (
                        <button type="button" className={`mc-chip${asTask || attach ? ' on' : ''}`} disabled={!!attach} onClick={() => setAsTask(v => !v)} title="Students get a notification and you see who did it">
                          {asTask || attach ? '✓ ' : ''}Task
                        </button>
                      )}
                    </div>
                  )}
                  <div className="mc-bar">
                    {staff && <button type="button" className="mc-iconbtn" onClick={() => setPicker(p => (p ? null : 'menu'))} aria-label="Share a paper or lesson" title="Share a paper or lesson" style={{ height: 42, width: 42 }}>{Icon.plus}</button>}
                    <textarea ref={inputRef} className="mc-input" value={text} onChange={e => setText(e.target.value)} rows={Math.min(5, Math.max(1, text.split('\n').length))}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder={attach ? 'Add a note (optional)' : 'Aa'} aria-label="Message" />
                    <button type="button" className="mc-send" onClick={send} disabled={!canSend} aria-label="Send">{Icon.send}</button>
                  </div>
                </div>
              ) : <div style={{ borderTop: '1px solid #e4e6eb', padding: 14, textAlign: 'center', color: '#65676b', fontSize: 14 }}>Only teachers can post in this group.</div>}
            </>)}
          </section>
        )}
        {showInfo && info}
      </div>
      {statsFor && <StatsModal messageId={statsFor} onClose={() => setStatsFor(null)} />}
      {showMembers && data && <Members group={data.group} onClose={() => { setShowMembers(false); loadGroups(); }} flash={flash} />}
    </div>
  );
}
