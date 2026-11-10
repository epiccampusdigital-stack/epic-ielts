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
const when = d => {
  const t = new Date(d); const now = new Date();
  const time = t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return t.toDateString() === now.toDateString() ? time : `${t.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${time}`;
};

function PaperCard({ paper, staff, onStart, starting }) {
  if (!paper) return null;
  const [label, col] = TYPE[paper.testType] || ['Paper', T.primary];
  return (
    <div style={{ marginTop: 6, background: '#fff', border: `1.5px solid ${col}`, borderRadius: 12, overflow: 'hidden', maxWidth: 380, color: T.ink }}>
      <div style={{ background: col, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', padding: '5px 12px' }}>{label.toUpperCase()} PAPER{paper.track === 'GENERAL' ? ' · GENERAL ENGLISH' : paper.track === 'IELTS' ? ' · IELTS' : ''}</div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{paper.title}</div>
        <div style={{ fontSize: 13.5, color: T.muted, marginTop: 2 }}>
          {paper.timeLimitMin ? `${paper.timeLimitMin} minutes` : ''}
          {paper.difficulty ? <span style={{ marginLeft: 8, color: '#F59E0B', letterSpacing: 1 }}>{'★'.repeat(paper.difficulty)}<span style={{ color: '#D5DBE5' }}>{'★'.repeat(5 - paper.difficulty)}</span></span> : null}
        </div>
        {paper.missing ? <div style={{ fontSize: 13, color: T.error, marginTop: 6 }}>This paper is no longer available.</div>
          : staff ? <div style={{ fontSize: 13, color: T.mid, marginTop: 8 }}>Students see a Start button here.</div>
            : <button type="button" disabled={starting} onClick={() => onStart(paper.id)} style={{ marginTop: 10, height: 38, padding: '0 18px', border: 0, borderRadius: 8, background: col, color: '#fff', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit' }}>{starting ? 'Opening…' : 'Start paper'}</button>}
      </div>
    </div>
  );
}

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

export default function Messages() {
  const navigate = useNavigate();
  const user = me();
  const staff = STAFF.includes(user.role);
  const [groups, setGroups] = useState(null);
  const [sel, setSel] = useState(() => { try { return parseInt(sessionStorage.getItem('chat-group'), 10) || null; } catch { return null; } });
  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [paperId, setPaperId] = useState('');
  const [papers, setPapers] = useState([]);
  const [paperQ, setPaperQ] = useState('');
  const [showPapers, setShowPapers] = useState(false);
  const [code, setCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newOnly, setNewOnly] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(null);
  const [asTask, setAsTask] = useState(false);
  const [statsFor, setStatsFor] = useState(null);
  const [notifPerm, setNotifPerm] = useState(() => ('Notification' in window ? Notification.permission : 'unsupported'));
  const [narrow, setNarrow] = useState(() => window.innerWidth < 820);
  const listRef = useRef(null);
  const lastId = useRef(0);
  const flash = useCallback(m => { setMsg(m); setTimeout(() => setMsg(''), 3500); }, []);

  useEffect(() => { const f = () => setNarrow(window.innerWidth < 820); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const loadGroups = useCallback(() => axios.get(`${API_URL}/api/chat/groups`, api()).then(r => setGroups(r.data)).catch(e => { setGroups([]); flash(errText(e)); }), [flash]);
  useEffect(() => { loadGroups(); const id = setInterval(loadGroups, 15000); return () => clearInterval(id); }, [loadGroups]);
  useEffect(() => { if (staff) axios.get(`${API_URL}/api/chat/papers`, api()).then(r => setPapers(r.data)).catch(() => {}); }, [staff]);
  useEffect(() => { try { if (sel) sessionStorage.setItem('chat-group', String(sel)); } catch { /* blocked */ } }, [sel]);

  const scrollDown = () => setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 30);
  const loadMessages = useCallback(async (full) => {
    if (!sel) return;
    try {
      const r = await axios.get(`${API_URL}/api/chat/groups/${sel}/messages`, { ...api(), params: full ? {} : { after: lastId.current } });
      const d = r.data;
      setData(prev => {
        if (full || !prev || prev.group.id !== d.group.id) { lastId.current = d.messages.length ? d.messages[d.messages.length - 1].id : 0; scrollDown(); return d; }
        if (!d.messages.length) return { ...prev, group: d.group, canPost: d.canPost };
        lastId.current = d.messages[d.messages.length - 1].id;
        const el = listRef.current; const atBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        if (atBottom) scrollDown();
        return { ...d, messages: [...prev.messages, ...d.messages] };
      });
    } catch (e) {
      if (e.response?.status === 404) { setSel(null); setData(null); loadGroups(); }
    }
  }, [sel, loadGroups]);
  useEffect(() => {
    setData(null); lastId.current = 0;
    if (!sel) return undefined;
    loadMessages(true);
    const id = setInterval(() => { if (document.visibilityState === 'visible') loadMessages(false); }, 4000);
    return () => clearInterval(id);
  }, [sel, loadMessages]);

  const send = async () => {
    if (sending || (!text.trim() && !paperId)) return;
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/chat/groups/${sel}/messages`, { text, paperId: paperId || undefined, isTask: asTask || !!paperId }, api());
      setText(''); setPaperId(''); setShowPapers(false); setAsTask(false);
      await loadMessages(false); scrollDown(); loadGroups();
    } catch (e) { flash(errText(e)); }
    setSending(false);
  };
  const del = async id => {
    if (!window.confirm('Delete this message?')) return;
    try { await axios.delete(`${API_URL}/api/chat/messages/${id}`, api()); setData(d => ({ ...d, messages: d.messages.map(m => m.id === id ? { ...m, deleted: true, text: '', paper: null } : m) })); } catch (e) { flash(errText(e)); }
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
  const copyInvite = () => {
    const t = `Join our group "${data.group.name}" on epicielts.live: open Messages and enter the code ${data.group.joinCode}`;
    try { navigator.clipboard.writeText(t); flash('Invite copied. Paste it in WhatsApp.'); } catch { flash(t); }
  };
  const shownPapers = useMemo(() => papers.filter(p => !paperQ || p.title.toLowerCase().includes(paperQ.toLowerCase())).slice(0, 80), [papers, paperQ]);
  const chosenPaper = papers.find(p => String(p.id) === String(paperId));

  const showList = !narrow || !sel;
  const showChat = !narrow || !!sel;
  const inputCss = { border: `1.5px solid ${T.hairline}`, borderRadius: 8, padding: '9px 11px', fontSize: 14.5, fontFamily: 'inherit', minWidth: 0 };
  const btn = (primary) => ({ height: 38, padding: '0 14px', borderRadius: 8, border: primary ? 0 : `1px solid ${T.ink}`, background: primary ? T.primary : '#fff', color: primary ? '#fff' : T.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' });

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      {staff
        ? <div style={{ background: T.navy, color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 17 }}>Messages</b>
            <button type="button" onClick={() => navigate(user.role === 'PROGRAM_TEACHER' ? '/teacher' : '/admin/dashboard')} style={{ ...btn(false), background: 'transparent', color: '#fff', borderColor: '#fff' }}>Back to admin</button>
          </div>
        : <StudentNav active="messages" />}
      {msg && <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: T.ink, color: '#fff', padding: '10px 18px', borderRadius: 10, zIndex: 60, fontSize: 14.5 }}>{msg}</div>}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: narrow ? '12px' : '22px 16px', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '320px minmax(0, 1fr)', gap: 16 }}>
        {showList && (
          <aside style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 14, alignSelf: 'start' }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Groups</div>
            {!staff && (
              <form onSubmit={e => { e.preventDefault(); join(); }} style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Join with a code" maxLength={8} style={{ ...inputCss, flex: 1, letterSpacing: code ? 2 : 0, fontWeight: code ? 700 : 400 }} />
                <button type="submit" disabled={!code.trim()} style={btn(true)}>Join</button>
              </form>
            )}
            {staff && (showNew
              ? <div style={{ display: 'grid', gap: 8, marginBottom: 12, background: '#f6f8fc', borderRadius: 10, padding: 10 }}>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name, e.g. Korea Batch 1" style={inputCss} autoFocus />
                  <label style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={newOnly} onChange={e => setNewOnly(e.target.checked)} /> Only teachers can post (announcements)</label>
                  <div style={{ display: 'flex', gap: 6 }}><button type="button" disabled={!newName.trim()} onClick={create} style={btn(true)}>Create group</button><button type="button" onClick={() => setShowNew(false)} style={btn(false)}>Cancel</button></div>
                </div>
              : <button type="button" onClick={() => setShowNew(true)} style={{ ...btn(true), width: '100%', marginBottom: 12 }}>+ New group</button>)}
            {groups == null && <div style={{ color: T.muted, fontSize: 14 }}>Loading…</div>}
            {groups && groups.length === 0 && <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.5 }}>{staff ? 'No groups yet. Create one, then share its code with your students.' : 'You are not in a group yet. Ask your teacher for the group code and type it above.'}</div>}
            <div style={{ display: 'grid', gap: 4 }}>
              {(groups || []).map(g => (
                <button key={g.id} type="button" onClick={() => setSel(g.id)} style={{ textAlign: 'left', border: 0, borderRadius: 10, padding: '10px 10px', cursor: 'pointer', background: sel === g.id ? T.primaryXSoft : 'transparent', fontFamily: 'inherit', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', background: sel === g.id ? T.primary : T.navy, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flex: 'none' }}>{g.name.slice(0, 1).toUpperCase()}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><b style={{ fontSize: 15, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</b>
                      {g.unread > 0 && <span style={{ background: '#d30a28', color: '#fff', borderRadius: 50, fontSize: 11.5, fontWeight: 700, padding: '1px 7px', alignSelf: 'center' }}>{g.unread}</span>}</span>
                    <span style={{ display: 'block', fontSize: 13, color: T.mid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.last ? `${g.last.by}: ${g.last.text}` : `${g.members} member${g.members === 1 ? '' : 's'}`}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {showChat && (
          <section style={{ background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, display: 'flex', flexDirection: 'column', height: narrow ? 'calc(100vh - 110px)' : 'calc(100vh - 140px)', minHeight: 460, overflow: 'hidden' }}>
            {!sel && <div style={{ margin: 'auto', color: T.muted, fontSize: 15, padding: 20, textAlign: 'center' }}>Choose a group on the left.</div>}
            {sel && !data && <div style={{ margin: 'auto', color: T.muted }}>Loading…</div>}
            {sel && data && (<>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {narrow && <button type="button" onClick={() => setSel(null)} style={{ border: 0, background: 'none', fontSize: 22, cursor: 'pointer', padding: 0 }} aria-label="Back">←</button>}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{data.group.name}</div>
                  <div style={{ fontSize: 13, color: T.mid }}>{data.group.onlyStaffPost ? 'Only teachers can post' : 'Everyone can post'}</div>
                </div>
                {staff && (<>
                  <span style={{ fontSize: 13.5, color: T.muted }}>Code <b style={{ fontSize: 17, letterSpacing: 2, color: T.ink }}>{data.group.joinCode}</b></span>
                  <button type="button" onClick={copyInvite} style={btn(false)}>Copy invite</button>
                  <button type="button" onClick={() => setShowMembers(true)} style={btn(false)}>Members</button>
                  <button type="button" onClick={() => patch({ onlyStaffPost: !data.group.onlyStaffPost })} style={btn(false)}>{data.group.onlyStaffPost ? 'Let students post' : 'Only teachers post'}</button>
                  <button type="button" title="Post a task automatically every morning at 8:00" onClick={() => patch({ dailyTask: !data.group.dailyTask })} style={{ ...btn(false), background: data.group.dailyTask ? '#e9f5e6' : '#fff', borderColor: data.group.dailyTask ? '#9fd18f' : T.ink, color: data.group.dailyTask ? '#276a1a' : T.ink }}>Daily task: {data.group.dailyTask ? 'On' : 'Off'}</button>
                  <button type="button" title="Post today's automatic task now" onClick={async () => { try { await axios.post(`${API_URL}/api/chat/groups/${sel}/daily-now`, {}, api()); loadMessages(false); scrollDown(); } catch (e) { flash(errText(e)); } }} style={btn(false)}>Post a task now</button>
                  <button type="button" onClick={() => { if (window.confirm('Archive this group? Students will not see it any more.')) patch({ archived: true }).then(() => setSel(null)); }} style={{ ...btn(false), color: T.error, borderColor: '#f3b4bd' }}>Archive</button>
                </>)}
                {!staff && notifPerm === 'default' && <button type="button" onClick={askNotif} style={{ ...btn(true), background: '#f5b400', color: '#1d1600' }}>Turn on notifications</button>}
                {!staff && <button type="button" onClick={async () => { if (!window.confirm('Leave this group?')) return; try { await axios.delete(`${API_URL}/api/chat/groups/${sel}/members/${user.id}`, api()); setSel(null); loadGroups(); } catch (e) { flash(errText(e)); } }} style={{ ...btn(false), color: T.muted, borderColor: T.hairline }}>Leave</button>}
              </div>

              <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', background: '#f6f8fc' }}>
                {data.messages.length === 0 && <div style={{ textAlign: 'center', color: T.muted, fontSize: 14.5, marginTop: 30 }}>No messages yet.</div>}
                {data.messages.map((m, i) => {
                  const prev = data.messages[i - 1];
                  const showName = !m.mine && (!prev || prev.senderId !== m.senderId);
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.mine ? 'flex-end' : 'flex-start', marginTop: showName ? 12 : 4 }}>
                      {showName && <div style={{ fontSize: 12.5, fontWeight: 700, color: m.staff ? T.primary : T.muted, margin: '0 4px 2px' }}>{m.senderName}{m.staff ? ' · Teacher' : ''}</div>}
                      <div style={{ maxWidth: 'min(560px, 88%)', background: m.deleted ? 'transparent' : m.mine ? T.primary : m.staff ? '#fff8e1' : '#fff', color: m.deleted ? T.mid : m.mine ? '#fff' : T.ink, border: m.deleted ? `1px dashed ${T.hairline}` : m.mine ? 'none' : `1px solid ${m.staff ? '#f5d98b' : T.hairline}`, borderRadius: 14, padding: '8px 12px', fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                        {m.deleted ? <i>Message deleted</i> : (<>
                          {m.isTask && <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 800, letterSpacing: '.06em', background: m.mine ? 'rgba(255,255,255,.22)' : '#f5b400', color: m.mine ? '#fff' : '#1d1600', borderRadius: 50, padding: '1px 9px', marginBottom: 4 }}>TASK</div>}
                          {m.text && <div><Linkify text={m.text} onLink={staff ? null : () => track(m.id, 'LINK')} /></div>}
                          {m.paper && <PaperCard paper={m.paper} staff={staff} onStart={pid => startPaper(pid, m.id)} starting={starting === m.paper.id} />}
                          {staff && m.stats && (
                            <button type="button" onClick={() => setStatsFor(m.id)} style={{ display: 'block', marginTop: 8, border: 0, borderRadius: 8, background: m.mine ? 'rgba(255,255,255,.18)' : T.primaryXSoft, color: m.mine ? '#fff' : T.primary, padding: '5px 10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                              Seen {m.stats.seen}/{m.stats.total} · Opened {m.stats.opened}{m.stats.task ? ` · Done ${m.stats.done}` : ''} · See who ›
                            </button>
                          )}
                          {!staff && m.isTask && m.status && (
                            m.status.done
                              ? <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700, color: '#276a1a' }}>Done ✓{!m.paper && <button type="button" onClick={() => markDone(m, true)} style={{ marginLeft: 8, border: 0, background: 'none', color: T.mid, cursor: 'pointer', fontSize: 12, textDecoration: 'underline', fontFamily: 'inherit' }}>undo</button>}</div>
                              : !m.paper && <button type="button" onClick={() => markDone(m)} style={{ display: 'block', marginTop: 8, height: 34, padding: '0 14px', border: 0, borderRadius: 8, background: '#2e7d32', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Mark as done</button>
                          )}
                        </>)}
                        <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 3, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {when(m.createdAt)}
                          {!m.deleted && (m.mine || staff) && <button type="button" onClick={() => del(m.id)} style={{ marginLeft: 8, border: 0, background: 'none', color: 'inherit', cursor: 'pointer', fontSize: 11.5, textDecoration: 'underline', padding: 0, fontFamily: 'inherit' }}>Delete</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {data.canPost ? (
                <div style={{ borderTop: `1px solid ${T.hairline}`, padding: 10, background: '#fff' }}>
                  {staff && showPapers && (
                    <div style={{ marginBottom: 8, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: 8 }}>
                      <input value={paperQ} onChange={e => setPaperQ(e.target.value)} placeholder="Search papers…" style={{ ...inputCss, width: '100%' }} />
                      <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 6 }}>
                        {shownPapers.map(p => (
                          <button key={p.id} type="button" onClick={() => { setPaperId(String(p.id)); setShowPapers(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, background: String(p.id) === String(paperId) ? T.primaryXSoft : 'transparent', padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
                            <b style={{ color: (TYPE[p.testType] || [])[1] }}>{(TYPE[p.testType] || [p.testType])[0]}</b> · {p.title} <span style={{ color: T.mid, fontSize: 12.5 }}>{p.track === 'GENERAL' ? 'General English' : 'IELTS'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {staff && <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13.5, marginBottom: 6, color: T.inkSoft }}><input type="checkbox" checked={asTask || !!paperId} disabled={!!paperId} onChange={e => setAsTask(e.target.checked)} /> This is a task (students get a notification, you see who did it)</label>}
                  {chosenPaper && <div style={{ marginBottom: 8, fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>Sharing paper: <b>{chosenPaper.title}</b><button type="button" onClick={() => setPaperId('')} style={{ border: 0, background: 'none', color: T.error, cursor: 'pointer', fontFamily: 'inherit' }}>remove</button></div>}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    {staff && <button type="button" onClick={() => setShowPapers(v => !v)} title="Share a paper" style={{ ...btn(false), height: 44 }}>+ Paper</button>}
                    <textarea value={text} onChange={e => setText(e.target.value)} rows={text.split('\n').length > 2 ? 4 : 1}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder={staff ? 'Write a message, paste a link, or add a paper…' : 'Write a message…'}
                      style={{ ...inputCss, flex: 1, resize: 'vertical', minHeight: 44, maxHeight: 200, borderRadius: 12 }} />
                    <button type="button" onClick={send} disabled={sending || (!text.trim() && !paperId)} style={{ ...btn(true), height: 44, opacity: sending || (!text.trim() && !paperId) ? 0.6 : 1 }}>Send</button>
                  </div>
                </div>
              ) : <div style={{ borderTop: `1px solid ${T.hairline}`, padding: 14, textAlign: 'center', color: T.muted, fontSize: 14 }}>Only teachers can post in this group.</div>}
            </>)}
          </section>
        )}
      </div>
      {statsFor && <StatsModal messageId={statsFor} onClose={() => setStatsFor(null)} />}
      {showMembers && data && <Members group={data.group} onClose={() => { setShowMembers(false); loadGroups(); }} flash={flash} />}
    </div>
  );
}
