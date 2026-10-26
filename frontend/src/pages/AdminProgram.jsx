import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

// Programme tracker: today's sessions, the 30-day schedule, teachers, students,
// WhatsApp reminder outbox and the Claude schedule assistant.

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const P = `${API_URL}/api/program`;

const C = {
  navy: '#002761', indigo: '#0056d2', gold: '#0056d2', bg: '#ffffff', card: '#ffffff',
  line: '#dae1ed', text: '#0f1114', muted: '#5b6780', faint: '#8495b0',
};
const SUBJECT = {
  ENGLISH: { label: 'English', bg: '#e0e7ff', fg: '#003b8f' },
  KOREAN: { label: 'Korean', bg: '#ffedd5', fg: '#9a3412' },
  IT_LAB: { label: 'IT lab', bg: '#dcfce7', fg: '#166534' },
  ACTIVITY: { label: 'Activity', bg: '#fef9c3', fg: '#854d0e' },
  ASSESSMENT: { label: 'Test', bg: '#f3e8ff', fg: '#6b21a8' },
  BREAK: { label: 'Break', bg: '#e8eef7', fg: '#5b6780' },
  ADMIN: { label: 'Admin', bg: '#e8eef7', fg: '#1e2229' },
};
const KIND = {
  NIGHT_BEFORE: 'Night before', SESSION_SOON: 'Before class', DAILY_BRIEF: 'Morning brief',
  CHANGE: 'Schedule change', CUSTOM: 'Message', ADMIN_DIGEST: 'Digest',
};
const ATT = [
  { k: 'PRESENT', l: 'P', title: 'Present', bg: '#dcfce7', fg: '#166534' },
  { k: 'LATE', l: 'L', title: 'Late', bg: '#fef9c3', fg: '#854d0e' },
  { k: 'ABSENT', l: 'A', title: 'Absent', bg: '#fee2e2', fg: '#991b1b' },
  { k: 'EXCUSED', l: 'E', title: 'Excused', bg: '#e0e7ff', fg: '#003b8f' },
];

function readUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}
function pretty(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
function prettyDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00Z');
  return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}
function timeAgo(iso) {
  const diff = (new Date(iso).getTime() - Date.now()) / 60000;
  const abs = Math.abs(Math.round(diff));
  const s = abs < 60 ? `${abs} min` : abs < 1440 ? `${Math.round(abs / 60)} h` : `${Math.round(abs / 1440)} d`;
  return diff >= 0 ? `in ${s}` : `${s} ago`;
}
function errText(e) { return e?.response?.data?.error || e?.message || 'Something went wrong'; }

const btn = (kind = 'outline') => ({
  height: 36, padding: '0 14px', borderRadius: 8, fontSize: 14, fontWeight: 600, letterSpacing: '0.14px', cursor: 'pointer', fontFamily: 'inherit',
  border: kind === 'primary' ? `1px solid ${C.indigo}` : kind === 'gold' ? `1px solid ${C.gold}` : kind === 'danger' ? '1px solid #f3b6bf' : '1px solid #0f1114',
  background: kind === 'primary' ? C.indigo : kind === 'gold' ? C.gold : kind === 'danger' ? '#fff' : '#fff',
  color: kind === 'primary' || kind === 'gold' ? '#fff' : kind === 'danger' ? '#d30a28' : '#0f1114',
});
const input = { padding: '8px 10px', border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 13, fontFamily: 'Source Sans Pro, sans-serif', background: '#fff', color: C.text, boxSizing: 'border-box' };
const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16 };

function Pill({ subject }) {
  const s = SUBJECT[subject] || SUBJECT.ADMIN;
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

export default function AdminProgram() {
  const navigate = useNavigate();
  const user = readUser();
  const isAdmin = user.role === 'ADMIN';
  const [boot, setBoot] = useState({ loading: true });
  const [programId, setProgramId] = useState(null);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(isAdmin ? 'today' : 'mine');
  const [toast, setToast] = useState('');

  const toastTimer = useRef(null);
  const flash = useCallback(msg => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 5000);
  }, []);

  const loadList = useCallback(async () => {
    try {
      const r = await axios.get(P, api());
      setBoot({ loading: false, ...r.data });
      if (r.data.programs.length) setProgramId(id => id || r.data.programs.find(p => p.status === 'ACTIVE')?.id || r.data.programs[0].id);
    } catch (e) {
      setBoot({ loading: false, error: errText(e) });
    }
  }, []);

  const loadProgram = useCallback(async () => {
    if (!programId) return;
    try {
      const r = await axios.get(`${P}/${programId}`, api());
      setData(r.data);
    } catch (e) {
      flash(errText(e));
    }
  }, [programId, flash]);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadProgram(); }, [loadProgram]);
  // Keep the due-reminder count fresh while the page is open
  useEffect(() => {
    if (!programId) return undefined;
    const t = window.setInterval(loadProgram, 60000);
    return () => window.clearInterval(t);
  }, [programId, loadProgram]);

  useEffect(() => {
    const n = data?.pendingReminders || 0;
    document.title = n ? `(${n}) Program tracker · EPIC` : 'Program tracker · EPIC';
    return () => { document.title = 'EPIC IELTS'; };
  }, [data?.pendingReminders]);

  const seed = async () => {
    try {
      const r = await axios.post(`${P}/seed/korea-batch-1`, {}, api());
      setProgramId(r.data.program.id);
      await loadList();
      flash('30-day plan loaded. Add teacher names and phone numbers next.');
      setTab('teachers');
    } catch (e) { flash(errText(e)); }
  };

  const paused = data?.program?.status === 'PAUSED';
  const togglePause = async () => {
    try {
      await axios.put(`${P}/${programId}`, { status: paused ? 'ACTIVE' : 'PAUSED' }, api());
      flash(paused ? 'Tracker is back on. Reminders start again.' : 'Tracker paused. No reminders will be sent.');
      loadProgram();
    } catch (e) { flash(errText(e)); }
  };
  const rebuild = async () => {
    if (!window.confirm('Rebuild all 30 days from the new plan? Session notes and changes you made to the schedule will be replaced. Teachers and students stay.')) return;
    try {
      await axios.post(`${P}/${programId}/rebuild`, {}, api());
      flash('Schedule rebuilt with the new 4-hour and 3-hour blocks.');
      loadProgram();
    } catch (e) { flash(errText(e)); }
  };

  const tabs = [
    ...(isAdmin ? [] : [{ id: 'mine', label: 'My sessions' }]),
    { id: 'today', label: 'Today' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'students', label: 'Students' },
    { id: 'reminders', label: 'Reminders', badge: data?.pendingReminders || 0 },
    ...(isAdmin ? [{ id: 'assistant', label: 'Ask Claude' }] : []),
    { id: 'progress', label: 'Progress' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif", color: C.text }}>
      <style>{`
        .pg-wrap { max-width: 1180px; margin: 0 auto; padding: 24px 20px 80px; }
        .pg-tabs { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
        .pg-tabs::-webkit-scrollbar { display: none; }
        .pg-row:hover { background: #f7f9fc; }
        .pg-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 760px) { .pg-grid2 { grid-template-columns: 1fr; } .pg-hide-sm { display: none !important; } }
      `}</style>

      <header style={{ background: '#fff', borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="pg-wrap" style={{ paddingTop: 14, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {user.role === 'PROGRAM_TEACHER' ? (
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }} style={btn()}>Log out</button>
          ) : (
            <button onClick={() => navigate('/admin/dashboard')} style={btn()}>← Admin</button>
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14, color: C.indigo, fontWeight: 600 }}>Program tracker</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.1px' }}>{data?.program?.name || 'Residential programme'}</div>
          </div>
          {data?.todayDay ? (
            <div style={{ fontSize: 14, background: C.navy, color: '#fff', padding: '4px 12px', borderRadius: 50, fontWeight: 600 }}>
              Today: Day {data.todayDay.dayNumber} · {data.todayDay.theme}
            </div>
          ) : data?.program ? (
            <div style={{ fontSize: 14, color: C.muted }}>No class day today</div>
          ) : null}
          {isAdmin && data?.program && (
            <button style={btn(paused ? 'primary' : 'outline')} onClick={togglePause}>{paused ? 'Turn tracker back on' : 'Pause tracker'}</button>
          )}
          {boot.programs?.length > 1 && (
            <select value={programId || ''} onChange={e => setProgramId(Number(e.target.value))} style={{ ...input, maxWidth: 220 }}>
              {boot.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>
        {programId && (
          <div className="pg-wrap" style={{ paddingTop: 0, paddingBottom: 0 }}>
            <nav className="pg-tabs">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  height: 44, padding: '0 12px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, whiteSpace: 'nowrap',
                  color: tab === t.id ? C.indigo : '#0f1114', fontWeight: 600,
                  borderBottom: tab === t.id ? `3px solid ${C.indigo}` : '3px solid transparent',
                }}>
                  {t.label}
                  {t.badge ? <span style={{ marginLeft: 6, background: C.indigo, color: '#fff', borderRadius: 50, padding: '1px 7px', fontSize: 12, fontWeight: 700 }}>{t.badge}</span> : null}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="pg-wrap">
        {toast && (
          <div role="status" style={{ ...card, padding: '10px 14px', marginBottom: 16, borderColor: '#b9d2f7', background: '#e3eeff', color: '#003b8f', fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span>{toast}</span>
            <button onClick={() => setToast('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>×</button>
          </div>
        )}

        {paused && (
          <div style={{ ...card, padding: '14px 16px', marginBottom: 16, background: '#fff4e8', borderColor: '#f5c99b', color: '#a32e00', fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span><b>The tracker is paused.</b> No reminders or morning briefs are created or sent until you turn it back on. Everything else still works.</span>
            {isAdmin && <button style={btn('primary')} onClick={togglePause}>Turn back on</button>}
          </div>
        )}
        {isAdmin && data?.program && !data.todayDay && data.program.dayEndTime !== '19:30' && (
          <div style={{ ...card, padding: '14px 16px', marginBottom: 16, background: '#f0f6ff', borderColor: '#b9d2f7', fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span><b>New day plan available:</b> a 4-hour and a 3-hour block each day, English and Korean swapping daily. Rebuild the schedule to use it. Teachers and students stay.</span>
            <button style={btn('primary')} onClick={rebuild}>Rebuild schedule</button>
          </div>
        )}
        {boot.loading && <p style={{ color: C.muted }}>Loading…</p>}
        {boot.error && <p style={{ color: '#b91c1c' }}>{boot.error}</p>}

        {!boot.loading && !boot.error && !boot.programs?.length && (
          <div style={{ ...card, padding: 32, maxWidth: 620 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>No programme yet</h2>
            <p style={{ margin: '0 0 20px', color: C.muted, lineHeight: 1.6 }}>
              Load the Korea scholarship batch: 30 days from Fri 30 Oct, a 4-hour and a 3-hour block every day, about 98 hours each of English and Korean, with placeholder teachers you can rename.
            </p>
            {isAdmin ? <button style={btn('primary')} onClick={seed}>Load the 30-day plan</button> : <p style={{ color: C.muted }}>Ask the admin to set it up.</p>}
          </div>
        )}

        {programId && data && (
          <>
            {tab === 'mine' && <MySessions flash={flash} />}
            {tab === 'today' && <DayView programId={programId} data={data} dayNumber={data.todayDay?.dayNumber} flash={flash} isAdmin={isAdmin} onChanged={loadProgram} goReminders={() => setTab('reminders')} />}
            {tab === 'schedule' && <Schedule programId={programId} data={data} flash={flash} isAdmin={isAdmin} onChanged={loadProgram} />}
            {tab === 'teachers' && <Teachers programId={programId} data={data} flash={flash} isAdmin={isAdmin} onChanged={loadProgram} />}
            {tab === 'students' && <Students programId={programId} data={data} flash={flash} isAdmin={isAdmin} onChanged={loadProgram} />}
            {tab === 'reminders' && <Reminders programId={programId} data={data} flash={flash} isAdmin={isAdmin} whatsappApi={boot.whatsappApi} onChanged={loadProgram} />}
            {tab === 'assistant' && <Assistant programId={programId} flash={flash} aiEnabled={boot.aiEnabled} onChanged={loadProgram} />}
            {tab === 'progress' && <Progress programId={programId} />}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Today / one day ─────────────────────────────────────────────────────────

function DayView({ programId, data, dayNumber, flash, isAdmin, onChanged, goReminders }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const day = data.program.days.find(d => d.dayNumber === dayNumber);
  const next = useMemo(() => data.program.days.find(d => d.date > data.today), [data]);

  const load = useCallback(async () => {
    if (!dayNumber) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await axios.get(`${P}/${programId}/sessions?day=${dayNumber}`, api());
      setSessions(r.data);
    } catch (e) { flash(errText(e)); }
    setLoading(false);
  }, [programId, dayNumber, flash]);
  useEffect(() => { load(); }, [load]);

  if (!dayNumber) {
    return (
      <div style={{ ...card, padding: 24 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18 }}>No classes today</h2>
        <p style={{ margin: 0, color: C.muted }}>
          {next ? `Next class day: Day ${next.dayNumber}, ${prettyDate(next.date)} (${next.theme}).` : 'The programme has finished.'} Open the Schedule tab to look ahead.
        </p>
      </div>
    );
  }

  const nowHM = new Date(Date.now() + 330 * 60000).toISOString().slice(11, 16);
  const teaching = sessions.filter(s => s.subject !== 'BREAK');
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ ...card, padding: 20, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 13, color: C.muted }}>Day {day.dayNumber} · {prettyDate(day.date)}</div>
          <h2 style={{ margin: '2px 0 10px', fontSize: 22, fontFamily: 'Source Sans Pro, sans-serif' }}>{day.theme}</h2>
          <div style={{ fontSize: 13, color: '#1e2229', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{day.englishFocus}</div>
        </div>
        <div style={{ minWidth: 220, flex: '0 1 320px', fontSize: 13, lineHeight: 1.6 }}>
          <div><b>Korean:</b> {day.koreanFocus}</div>
          <div style={{ marginTop: 6 }}><b>IT lab:</b> {day.itLabTask}</div>
          {data.pendingReminders > 0 && (
            <button style={{ ...btn('gold'), marginTop: 12 }} onClick={goReminders}>{data.pendingReminders} reminder{data.pendingReminders > 1 ? 's' : ''} to send</button>
          )}
        </div>
      </div>

      {loading ? <p style={{ color: C.muted }}>Loading sessions…</p> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {teaching.map(s => (
            <SessionCard key={s.id} s={s} students={data.program.students.filter(st => st.active)} flash={flash} onSaved={load}
              live={s.startTime <= nowHM && nowHM < s.endTime} isAdmin={isAdmin} programId={programId} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ s, students, flash, onSaved, live, isAdmin }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(s.notes || '');
  const [att, setAtt] = useState(() => Object.fromEntries((s.attendance || []).map(a => [a.programStudentId, a.status])));
  const [busy, setBusy] = useState(false);
  const done = s.status === 'DONE', cancelled = s.status === 'CANCELLED';
  const marked = Object.keys(att).length;

  const saveAll = async markDone => {
    setBusy(true);
    try {
      const records = Object.entries(att).map(([programStudentId, status]) => ({ programStudentId: Number(programStudentId), status }));
      if (records.length) await axios.put(`${P}/sessions/${s.id}/attendance`, { records }, api());
      if (markDone === undefined) await axios.put(`${P}/sessions/${s.id}/notes`, { notes }, api());
      else await axios.post(`${P}/sessions/${s.id}/complete`, { done: markDone, notes }, api());
      flash(markDone ? 'Session marked done.' : 'Saved.');
      setOpen(false);
      onSaved();
    } catch (e) { flash(errText(e)); }
    setBusy(false);
  };
  const allPresent = () => setAtt(Object.fromEntries(students.map(st => [st.id, 'PRESENT'])));

  return (
    <div style={{ ...card, padding: 0, opacity: cancelled ? 0.55 : 1, borderColor: live ? C.gold : C.line, boxShadow: live ? '0 0 0 3px rgba(245,158,11,0.15)' : 'none' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 16px', flexWrap: 'wrap' }}>
        <div style={{ width: 150, fontSize: 13, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{pretty(s.startTime)}–{pretty(s.endTime)}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Pill subject={s.subject} />
            <span style={{ fontWeight: 600, textDecoration: cancelled ? 'line-through' : 'none' }}>{s.title}</span>
            {live && <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309' }}>NOW</span>}
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{s.teacher?.name || 'No teacher assigned'}{s.description ? ` · ${s.description}` : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {done && <span style={{ fontSize: 12, fontWeight: 600, color: '#166534', background: '#dcfce7', padding: '3px 10px', borderRadius: 999 }}>Done</span>}
          {!cancelled && <button style={btn()} onClick={() => setOpen(o => !o)}>{open ? 'Close' : marked ? `Attendance ${marked}/${students.length}` : 'Attendance & notes'}</button>}
        </div>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${C.line}`, padding: 16, display: 'grid', gap: 14 }}>
          {students.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>{isAdmin ? 'Add students in the Students tab to take attendance.' : 'No students added yet.'}</p>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <b style={{ fontSize: 13 }}>Attendance</b>
                <button style={{ ...btn(), padding: '4px 10px', fontSize: 12 }} onClick={allPresent}>Everyone present</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 8 }}>
                {students.map(st => (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 10px', border: `1px solid ${C.line}`, borderRadius: 8 }}>
                    <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.name}</span>
                    <span style={{ display: 'inline-flex', gap: 3 }}>
                      {ATT.map(a => (
                        <button key={a.k} title={a.title} aria-label={`${st.name} ${a.title}`} onClick={() => setAtt(m => ({ ...m, [st.id]: a.k }))}
                          style={{ width: 26, height: 26, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: att[st.id] === a.k ? `1.5px solid ${a.fg}` : `1px solid ${C.line}`, background: att[st.id] === a.k ? a.bg : '#fff', color: att[st.id] === a.k ? a.fg : C.faint }}>
                          {a.l}
                        </button>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <b style={{ fontSize: 13 }}>Notes</b>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="What you covered, who needs help, interview feedback…" style={{ ...input, width: '100%', marginTop: 6, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button style={btn()} disabled={busy} onClick={() => saveAll(undefined)}>Save</button>
            {done
              ? <button style={btn()} disabled={busy} onClick={() => saveAll(false)}>Mark not done</button>
              : <button style={btn('primary')} disabled={busy} onClick={() => saveAll(true)}>Save & mark done</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Teacher's own sessions ──────────────────────────────────────────────────

function MySessions({ flash }) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    axios.get(`${P}/my`, api()).then(r => setState({ loading: false, ...r.data })).catch(e => { flash(errText(e)); setState({ loading: false }); });
  }, [flash]);
  if (state.loading) return <p style={{ color: C.muted }}>Loading…</p>;
  if (!state.teacher) return <div style={{ ...card, padding: 20 }}>Your login is not linked to a teacher yet. Ask the admin to link it in the Teachers tab.</div>;
  const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
  const upcoming = state.sessions.filter(s => s.date && s.date >= today && s.status !== 'CANCELLED');
  const byDate = upcoming.reduce((m, s) => { (m[s.date] = m[s.date] || []).push(s); return m; }, {});
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <h2 style={{ margin: 0, fontSize: 20 }}>Hi {state.teacher.name.split(' ')[0]}, here's what's coming up</h2>
      {Object.keys(byDate).length === 0 && <p style={{ color: C.muted }}>Nothing scheduled.</p>}
      {Object.entries(byDate).slice(0, 7).map(([date, list]) => (
        <div key={date} style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{date === today ? 'Today' : prettyDate(date)} · Day {list[0].dayNumber}</div>
          {list.map(s => (
            <div key={s.id} style={{ display: 'flex', gap: 12, padding: '6px 0', fontSize: 14, borderTop: `1px solid ${C.line}` }}>
              <span style={{ width: 130, color: C.muted }}>{pretty(s.startTime)}–{pretty(s.endTime)}</span>
              <span style={{ flex: 1 }}>{s.title}</span>
              {s.status === 'DONE' && <span style={{ color: '#166534', fontSize: 12, fontWeight: 600 }}>Done</span>}
            </div>
          ))}
        </div>
      ))}
      <p style={{ fontSize: 13, color: C.muted }}>Take attendance and add notes from the Today tab.</p>
    </div>
  );
}

// ─── Schedule (30 days) ──────────────────────────────────────────────────────

function Schedule({ programId, data, flash, isAdmin, onChanged }) {
  const days = data.program.days;
  const [dayNumber, setDayNumber] = useState(data.todayDay?.dayNumber || 1);
  const [sessions, setSessions] = useState([]);
  const [edits, setEdits] = useState({});
  const [dayEdit, setDayEdit] = useState(null);
  const [adding, setAdding] = useState(null);
  const [busy, setBusy] = useState(false);
  const day = days.find(d => d.dayNumber === dayNumber);
  const teachers = data.teachers.filter(t => t.active);

  const load = useCallback(async () => {
    try {
      const r = await axios.get(`${P}/${programId}/sessions?day=${dayNumber}`, api());
      setSessions(r.data); setEdits({}); setDayEdit(null); setAdding(null);
    } catch (e) { flash(errText(e)); }
  }, [programId, dayNumber, flash]);
  useEffect(() => { load(); }, [load]);

  const run = async (operations, okMsg) => {
    setBusy(true);
    try {
      const r = await axios.post(`${P}/${programId}/operations`, { operations }, api());
      flash(`${okMsg || 'Saved.'}${r.data.notified ? ` ${r.data.notified} teacher${r.data.notified > 1 ? 's' : ''} will be told.` : ''}`);
      await load(); onChanged();
    } catch (e) { flash(errText(e)); }
    setBusy(false);
  };

  const saveSessions = () => {
    const ops = Object.entries(edits).map(([id, e]) => ({ type: 'update_session', sessionId: Number(id), ...e }));
    if (ops.length) run(ops, 'Schedule updated.');
  };
  const setField = (id, field, value) => setEdits(m => ({ ...m, [id]: { ...(m[id] || {}), [field]: value } }));
  const val = (s, f) => (edits[s.id] && edits[s.id][f] !== undefined ? edits[s.id][f] : s[f]);

  const makeOffDay = () => {
    if (!window.confirm(`Make ${prettyDate(day.date)} an off day?\n\nDay ${day.dayNumber} and every day after it will move one day later, and all affected teachers get a WhatsApp update.`)) return;
    run([{ type: 'shift_days', fromDay: day.dayNumber, days: 1 }], 'Off day added.');
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ ...card, padding: 12, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {days.map(d => {
          const on = d.dayNumber === dayNumber, today = d.date === data.today;
          return (
            <button key={d.id} ref={on ? el => el?.scrollIntoView({ block: 'nearest', inline: 'center' }) : undefined} onClick={() => setDayNumber(d.dayNumber)} title={d.theme} style={{
              flex: '0 0 auto', minWidth: 66, padding: '6px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
              border: on ? `1.5px solid ${C.indigo}` : today ? `1.5px solid ${C.gold}` : `1px solid ${C.line}`, background: on ? '#e3eeff' : '#fff',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: on ? C.indigo : C.text }}>Day {d.dayNumber}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{prettyDate(d.date)}</div>
            </button>
          );
        })}
      </div>

      {day && (
        <div style={{ ...card, padding: 18 }}>
          {dayEdit ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <input style={input} value={dayEdit.theme || ''} onChange={e => setDayEdit({ ...dayEdit, theme: e.target.value })} placeholder="Theme" />
              <textarea style={input} rows={4} value={dayEdit.englishFocus || ''} onChange={e => setDayEdit({ ...dayEdit, englishFocus: e.target.value })} placeholder="English focus" />
              <input style={input} value={dayEdit.koreanFocus || ''} onChange={e => setDayEdit({ ...dayEdit, koreanFocus: e.target.value })} placeholder="Korean focus" />
              <textarea style={input} rows={2} value={dayEdit.itLabTask || ''} onChange={e => setDayEdit({ ...dayEdit, itLabTask: e.target.value })} placeholder="IT lab task" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btn('primary')} disabled={busy} onClick={() => run([{ type: 'update_day', dayNumber, ...dayEdit }], 'Day updated.')}>Save day</button>
                <button style={btn()} onClick={() => setDayEdit(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 13, color: C.muted }}>Day {day.dayNumber} · {prettyDate(day.date)}</div>
                <div style={{ fontSize: 19, fontWeight: 700, margin: '2px 0 6px' }}>{day.theme}</div>
                <div style={{ fontSize: 13, color: '#1e2229', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{day.englishFocus}</div>
                <div style={{ fontSize: 13, marginTop: 6 }}><b>Korean:</b> {day.koreanFocus}</div>
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <button style={btn()} onClick={() => setDayEdit({ theme: day.theme, englishFocus: day.englishFocus, koreanFocus: day.koreanFocus, itLabTask: day.itLabTask })}>Edit day</button>
                  <button style={btn('danger')} disabled={busy} onClick={makeOffDay}>Make this date an off day</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
            <thead>
              <tr style={{ background: '#f7f9fc', textAlign: 'left', color: C.muted }}>
                {['Start', 'End', 'Type', 'Session', 'Teacher', 'Status'].map(h => <th key={h} style={{ padding: '10px 12px', fontWeight: 600, borderBottom: `1px solid ${C.line}` }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} className="pg-row" style={{ borderBottom: `1px solid ${C.line}`, background: edits[s.id] ? '#fffbeb' : undefined }}>
                  <td style={{ padding: '6px 12px' }}>{isAdmin ? <input type="time" style={{ ...input, width: 132 }} value={val(s, 'startTime')} onChange={e => setField(s.id, 'startTime', e.target.value)} /> : pretty(s.startTime)}</td>
                  <td style={{ padding: '6px 12px' }}>{isAdmin ? <input type="time" style={{ ...input, width: 132 }} value={val(s, 'endTime')} onChange={e => setField(s.id, 'endTime', e.target.value)} /> : pretty(s.endTime)}</td>
                  <td style={{ padding: '6px 12px' }}><Pill subject={s.subject} /></td>
                  <td style={{ padding: '6px 12px', minWidth: 240 }}>{isAdmin ? <input style={{ ...input, width: '100%' }} value={val(s, 'title')} onChange={e => setField(s.id, 'title', e.target.value)} /> : s.title}</td>
                  <td style={{ padding: '6px 12px' }}>
                    {s.subject === 'BREAK' ? <span style={{ color: C.faint }}>—</span> : isAdmin ? (
                      <select style={{ ...input, width: 190 }} value={val(s, 'teacherId') ?? ''} onChange={e => setField(s.id, 'teacherId', e.target.value ? Number(e.target.value) : null)}>
                        <option value="">Unassigned</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    ) : (s.teacher?.name || 'Unassigned')}
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    {isAdmin && s.subject !== 'BREAK' ? (
                      <select style={{ ...input, width: 120 }} value={val(s, 'status')} onChange={e => setField(s.id, 'status', e.target.value)}>
                        <option value="SCHEDULED">Scheduled</option><option value="DONE">Done</option><option value="CANCELLED">Cancelled</option>
                      </select>
                    ) : s.status.toLowerCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8, padding: 12, justifyContent: 'space-between', flexWrap: 'wrap', borderTop: `1px solid ${C.line}` }}>
            <button style={btn()} onClick={() => setAdding({ startTime: '19:30', endTime: '20:30', subject: 'ACTIVITY', title: '', teacherId: '' })}>+ Add session</button>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.keys(edits).length > 0 && <button style={btn()} onClick={() => setEdits({})}>Discard</button>}
              <button style={btn('primary')} disabled={busy || !Object.keys(edits).length} onClick={saveSessions}>Save changes{Object.keys(edits).length ? ` (${Object.keys(edits).length})` : ''}</button>
            </div>
          </div>
        )}
        {adding && (
          <div style={{ padding: 12, borderTop: `1px solid ${C.line}`, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', background: '#f7f9fc' }}>
            <input type="time" style={input} value={adding.startTime} onChange={e => setAdding({ ...adding, startTime: e.target.value })} />
            <input type="time" style={input} value={adding.endTime} onChange={e => setAdding({ ...adding, endTime: e.target.value })} />
            <select style={input} value={adding.subject} onChange={e => setAdding({ ...adding, subject: e.target.value })}>
              {Object.entries(SUBJECT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input style={{ ...input, flex: 1, minWidth: 200 }} placeholder="Session title" value={adding.title} onChange={e => setAdding({ ...adding, title: e.target.value })} />
            <select style={input} value={adding.teacherId} onChange={e => setAdding({ ...adding, teacherId: e.target.value })}>
              <option value="">No teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button style={btn('primary')} disabled={busy || !adding.title.trim()} onClick={() => run([{
              type: 'add_session', dayNumber, startTime: adding.startTime, endTime: adding.endTime, subject: adding.subject, title: adding.title.trim(),
              teacherId: adding.teacherId ? Number(adding.teacherId) : null,
              language: adding.subject === 'ENGLISH' ? 'EN' : adding.subject === 'KOREAN' ? 'KR' : undefined,
            }], 'Session added.')}>Add</button>
            <button style={btn()} onClick={() => setAdding(null)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Teachers ────────────────────────────────────────────────────────────────

function Teachers({ programId, data, flash, isAdmin, onChanged }) {
  const [rows, setRows] = useState(data.teachers);
  const [dirty, setDirty] = useState({});
  const [stats, setStats] = useState([]);
  const [settings, setSettings] = useState({ koreanSiteUrl: data.program.koreanSiteUrl || '', remindMinutes: data.program.remindMinutes, adminPhone: data.program.adminPhone || '' });
  useEffect(() => { setRows(data.teachers); setDirty({}); }, [data.teachers]);
  useEffect(() => { axios.get(`${P}/${programId}/stats`, api()).then(r => setStats(r.data.byTeacher)).catch(() => {}); }, [programId]);

  const set = (id, f, v) => { setRows(rs => rs.map(r => (r.id === id ? { ...r, [f]: v } : r))); setDirty(d => ({ ...d, [id]: true })); };
  const save = async t => {
    try {
      await axios.put(`${P}/teachers/${t.id}`, t, api());
      setDirty(d => { const n = { ...d }; delete n[t.id]; return n; });
      flash(`${t.name} saved.`); onChanged();
    } catch (e) { flash(errText(e)); }
  };
  const add = async () => {
    try { await axios.post(`${P}/teachers`, { name: 'New teacher', subject: 'ENGLISH' }, api()); onChanged(); } catch (e) { flash(errText(e)); }
  };
  const makeLogin = async t => {
    const email = window.prompt(`Login email for ${t.name}:`, t.email || '');
    if (!email) return;
    try {
      const r = await axios.post(`${P}/teachers/${t.id}/login`, { email }, api());
      window.alert(r.data.tempPassword
        ? `Login created for ${r.data.email}\nTemporary password: ${r.data.tempPassword}\n\nShare it privately. They can sign in at epicielts.live.`
        : `${r.data.email} already had a teacher login. It is now linked.`);
      onChanged();
    } catch (e) { flash(errText(e)); }
  };
  const saveSettings = async () => {
    try { await axios.put(`${P}/${programId}`, settings, api()); flash('Programme settings saved.'); onChanged(); } catch (e) { flash(errText(e)); }
  };
  const hours = id => stats.find(s => s.id === id);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.line}` }}>
          <div>
            <b>Teachers</b>
            <div style={{ fontSize: 13, color: C.muted }}>Reminders go to the WhatsApp number here. Sri Lankan numbers like 0771234567 are fine.</div>
          </div>
          {isAdmin && <button style={btn()} onClick={add}>+ Add teacher</button>}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f7f9fc', textAlign: 'left', color: C.muted }}>
                {['Name', 'WhatsApp', 'Subject', 'Focus', 'Confirmed', 'Hours', 'Login', ''].map(h => <th key={h} style={{ padding: '10px 12px', fontWeight: 600 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(t => {
                const h = hours(t.id);
                return (
                  <tr key={t.id} style={{ borderTop: `1px solid ${C.line}`, opacity: t.active ? 1 : 0.5 }}>
                    <td style={{ padding: '6px 12px' }}><input disabled={!isAdmin} style={{ ...input, width: 200 }} value={t.name} onChange={e => set(t.id, 'name', e.target.value)} /></td>
                    <td style={{ padding: '6px 12px' }}><input disabled={!isAdmin} style={{ ...input, width: 140 }} value={t.phone || ''} placeholder="07X XXX XXXX" onChange={e => set(t.id, 'phone', e.target.value)} /></td>
                    <td style={{ padding: '6px 12px' }}>
                      <select disabled={!isAdmin} style={input} value={t.subject} onChange={e => set(t.id, 'subject', e.target.value)}>
                        <option value="ENGLISH">English</option><option value="KOREAN">Korean</option><option value="IT">IT</option><option value="OTHER">Other</option>
                      </select>
                    </td>
                    <td style={{ padding: '6px 12px' }}><input disabled={!isAdmin} style={{ ...input, width: 170 }} value={t.focus || ''} onChange={e => set(t.id, 'focus', e.target.value)} /></td>
                    <td style={{ padding: '6px 12px', textAlign: 'center' }}><input disabled={!isAdmin} type="checkbox" checked={t.confirmed} onChange={e => set(t.id, 'confirmed', e.target.checked)} /></td>
                    <td style={{ padding: '6px 12px', color: C.muted, whiteSpace: 'nowrap' }}>{h ? `${h.hours} h · ${h.done}/${h.total} done` : '—'}</td>
                    <td style={{ padding: '6px 12px' }}>{t.accountId ? <span style={{ fontSize: 12, color: '#166534' }}>Linked</span> : isAdmin ? <button style={{ ...btn(), padding: '4px 10px', fontSize: 12 }} onClick={() => makeLogin(t)}>Create login</button> : '—'}</td>
                    <td style={{ padding: '6px 12px' }}>{isAdmin && dirty[t.id] && <button style={{ ...btn('primary'), padding: '6px 12px' }} onClick={() => save(t)}>Save</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {isAdmin && <div style={{ padding: '10px 16px', fontSize: 12, color: C.muted, borderTop: `1px solid ${C.line}` }}>To hand someone's sessions to another teacher, use Ask Claude ("give all of Teacher 4's sessions to Teacher 2") or the Schedule tab.</div>}
      </div>

      {isAdmin && (
        <div style={{ ...card, padding: 16 }}>
          <b>Programme settings</b>
          <div className="pg-grid2" style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13 }}>Korean study site
              <input style={{ ...input, width: '100%', marginTop: 4 }} value={settings.koreanSiteUrl} onChange={e => setSettings({ ...settings, koreanSiteUrl: e.target.value })} />
            </label>
            <label style={{ fontSize: 13 }}>Remind teachers this many minutes before class
              <input type="number" min={5} max={180} style={{ ...input, width: '100%', marginTop: 4 }} value={settings.remindMinutes} onChange={e => setSettings({ ...settings, remindMinutes: e.target.value })} />
            </label>
          </div>
          <button style={{ ...btn('primary'), marginTop: 12 }} onClick={saveSettings}>Save settings</button>
        </div>
      )}

      {isAdmin && (
        <div style={{ ...card, padding: 16, display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 640 }}>
            <b>General English content</b>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Loads the 30 daily lessons (one per programme day) and the 5 weekly quizzes into the General English tab. Safe to run again: student progress is kept.</div>
          </div>
          <button style={btn()} onClick={async () => {
            try {
              const r = await axios.post(`${API_URL}/api/admin/seed-general-english`, {}, api());
              flash(`General English loaded: ${r.data.lessons} lessons, ${r.data.quizzes} new quizzes.`);
            } catch (e) { flash(errText(e)); }
          }}>Load lessons & quizzes</button>
        </div>
      )}
    </div>
  );
}

// ─── Students ────────────────────────────────────────────────────────────────

function Students({ programId, data, flash, isAdmin, onChanged }) {
  const [bulk, setBulk] = useState('');
  const [stats, setStats] = useState([]);
  const students = data.program.students.filter(s => s.active);
  useEffect(() => { axios.get(`${P}/${programId}/stats`, api()).then(r => setStats(r.data.byStudent)).catch(() => {}); }, [programId, data]);

  const addBulk = async () => {
    const list = bulk.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const [name, phone, scholarship] = line.split(',').map(x => x && x.trim());
      return { name, phone, scholarship: scholarship ? scholarship.toUpperCase() : null };
    });
    if (!list.length) return;
    try { await axios.post(`${P}/${programId}/students`, { students: list }, api()); setBulk(''); flash(`${list.length} student${list.length > 1 ? 's' : ''} added.`); onChanged(); } catch (e) { flash(errText(e)); }
  };
  const remove = async s => {
    if (!window.confirm(`Remove ${s.name} from the programme? Their attendance history is kept.`)) return;
    try { await axios.delete(`${P}/students/${s.id}`, api()); onChanged(); } catch (e) { flash(errText(e)); }
  };
  const rate = id => stats.find(x => x.id === id);

  return (
    <>
    <PlacementResults programId={programId} data={data} />
    <div className="pg-grid2" style={{ alignItems: 'start' }}>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.line}` }}><b>Students ({students.length})</b></div>
        {students.length === 0 && <p style={{ padding: 16, margin: 0, color: C.muted, fontSize: 14 }}>No students yet.</p>}
        {students.map(s => {
          const r = rate(s.id);
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: `1px solid ${C.line}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{[s.phone, s.scholarship && `${s.scholarship.toLowerCase()} scholarship`].filter(Boolean).join(' · ') || '—'}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: r?.rate == null ? C.faint : r.rate >= 90 ? '#166534' : r.rate >= 75 ? '#92400e' : '#b91c1c' }}>
                {r?.rate == null ? 'No attendance yet' : `${r.rate}% present`}
              </div>
              {isAdmin && <button style={{ ...btn('danger'), padding: '4px 10px', fontSize: 12 }} onClick={() => remove(s)}>Remove</button>}
            </div>
          );
        })}
      </div>
      {isAdmin && (
        <div style={{ ...card, padding: 16 }}>
          <b>Add students</b>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 10px' }}>One per line: name, phone, FULL or PARTIAL. Only the name is required.</p>
          <textarea rows={8} style={{ ...input, width: '100%' }} value={bulk} onChange={e => setBulk(e.target.value)} placeholder={'Nimal Perera, 0771234567, FULL\nAmaya Silva, 0712345678, PARTIAL'} />
          <button style={{ ...btn('primary'), marginTop: 10 }} onClick={addBulk} disabled={!bulk.trim()}>Add</button>
        </div>
      )}
    </div>
    </>
  );
}

// Day 1 General English placement results, so teachers can group students by level
const PART_LABEL = { READING: 'Grammar & reading', LISTENING: 'Listening', WRITING: 'Writing', SPEAKING: 'Speaking' };
const LEVEL_ORDER = ['B2', 'B1', 'A2', 'A1', 'Pre-A1'];

function PlacementResults({ programId, data }) {
  const [res, setRes] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    axios.get(`${P}/${programId}/placement`, api()).then(r => setRes(r.data)).catch(() => setFailed(true));
  }, [programId, data]);

  if (failed) return null;
  const parts = res?.parts || ['READING', 'LISTENING', 'WRITING', 'SPEAKING'];
  const rows = [...(res?.rows || []), ...(res?.others || [])];
  const finished = rows.filter(r => r.level);
  const groups = LEVEL_ORDER.map(l => ({ level: l, names: finished.filter(r => r.level === l).map(r => r.name) })).filter(g => g.names.length);
  const cell = p => {
    if (!p) return <span style={{ color: C.faint }}>–</span>;
    if (p.state === 'marking') return <span style={{ color: '#92400e', fontSize: 12 }}>marking</span>;
    if (p.state === 'failed') return <span style={{ color: '#b91c1c', fontSize: 12 }}>failed</span>;
    return <b>{p.score}</b>;
  };
  const th = { textAlign: 'left', padding: '8px 12px', fontSize: 12, color: C.muted, fontWeight: 600, whiteSpace: 'nowrap' };
  const td = { padding: '9px 12px', fontSize: 14, borderTop: `1px solid ${C.line}`, whiteSpace: 'nowrap' };

  return (
    <div style={{ ...card, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <b>Day 1 placement test</b>
        <span style={{ fontSize: 13, color: C.muted }}>
          {res ? `${finished.length} of ${res.rows.length} finished all four parts` : 'Loading...'} · scores out of 100
        </span>
      </div>
      {groups.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '12px 16px', borderBottom: `1px solid ${C.line}`, background: '#f7f9fc' }}>
          {groups.map(g => (
            <div key={g.level} style={{ fontSize: 13 }}>
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: '#e3eeff', color: '#0056d2', fontWeight: 700, marginRight: 6 }}>{g.level}</span>
              {g.names.join(', ')}
            </div>
          ))}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Student</th>
            {parts.map(p => <th key={p} style={th}>{PART_LABEL[p] || p}</th>)}
            <th style={th}>Overall</th><th style={th}>Level</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td style={{ ...td, color: C.muted }} colSpan={parts.length + 3}>No students yet.</td></tr>}
            {rows.map((r, i) => (
              <tr key={r.programStudentId || `acc-${r.account?.id || i}`}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  {!r.programStudentId && <div style={{ fontSize: 11, color: '#92400e' }}>Not on the programme list</div>}
                  {r.programStudentId && !r.account && <div style={{ fontSize: 11, color: C.faint }}>Not started</div>}
                </td>
                {parts.map(p => <td key={p} style={td}>{cell(r.parts?.[p])}</td>)}
                <td style={td}>{r.overall == null ? '–' : <b>{r.overall}</b>}</td>
                <td style={td}>{r.level ? <b style={{ color: '#0056d2' }}>{r.level}</b> : <span style={{ color: C.faint, fontSize: 12 }}>{r.done ? `${r.done}/4 done` : '–'}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: 0, padding: '10px 16px', fontSize: 12, color: C.muted, borderTop: `1px solid ${C.line}` }}>
        Students take this on their own account on Day 1 (it opens on their first login). Names are matched to the programme list, so use the same name on the account.
        Levels: 90+ B2, 75 to 89 B1, 50 to 74 A2, 25 to 49 A1, below 25 Pre-A1.
      </p>
    </div>
  );
}

// ─── Reminders outbox ────────────────────────────────────────────────────────

function Reminders({ programId, data, flash, isAdmin, whatsappApi, onChanged }) {
  const [status, setStatus] = useState('PENDING');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await axios.get(`${P}/${programId}/reminders?status=${status}`, api()); setList(r.data); } catch (e) { flash(errText(e)); }
    setLoading(false);
  }, [programId, status, flash]);
  useEffect(() => { load(); }, [load]);

  const mark = async (r, s) => {
    try { await axios.post(`${P}/reminders/${r.id}/mark`, { status: s }, api()); await load(); onChanged(); } catch (e) { flash(errText(e)); }
  };
  const openWa = r => {
    window.open(r.waLink, '_blank', 'noopener');
    mark(r, 'SENT');
  };
  const refresh = async () => {
    setBusy(true);
    try { const r = await axios.post(`${P}/${programId}/reminders/refresh`, {}, api()); flash(`${r.data.created} new reminder${r.data.created === 1 ? '' : 's'} queued.`); await load(); onChanged(); } catch (e) { flash(errText(e)); }
    setBusy(false);
  };
  const briefs = async () => {
    setBusy(true);
    try { const r = await axios.post(`${P}/${programId}/briefs`, { force: true }, api()); flash(r.data.created ? `${r.data.created} morning brief${r.data.created > 1 ? 's' : ''} written.` : (r.data.reason || 'No sessions today, so no briefs.')); await load(); onChanged(); } catch (e) { flash(errText(e)); }
    setBusy(false);
  };
  const sendCustom = async () => {
    setBusy(true);
    try { const r = await axios.post(`${P}/${programId}/reminders/custom`, { message: custom }, api()); setCustom(''); flash(`Message queued for ${r.data.created} teachers.`); setStatus('PENDING'); await load(); onChanged(); } catch (e) { flash(errText(e)); }
    setBusy(false);
  };

  const now = Date.now();
  const due = list.filter(r => status === 'PENDING' && new Date(r.dueAt).getTime() <= now + 15 * 60000);
  const later = list.filter(r => !(status === 'PENDING' && new Date(r.dueAt).getTime() <= now + 15 * 60000));

  const Item = ({ r }) => (
    <div style={{ display: 'flex', gap: 14, padding: '12px 16px', borderTop: `1px solid ${C.line}`, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ width: 150, flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.teacher?.name || '—'}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{KIND[r.kind] || r.kind}</div>
        <div style={{ fontSize: 12, color: new Date(r.dueAt).getTime() < now && r.status === 'PENDING' ? '#b45309' : C.faint }}>{timeAgo(r.dueAt)}</div>
      </div>
      <div style={{ flex: 1, minWidth: 220, fontSize: 13, whiteSpace: 'pre-line', color: '#1e2229', lineHeight: 1.5 }}>
        {r.message}
        {r.error && <div style={{ marginTop: 6, fontSize: 12, color: '#b91c1c' }}>{r.error}</div>}
      </div>
      {r.status === 'PENDING' || r.status === 'FAILED' ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {r.waLink
            ? <button style={{ ...btn('primary'), background: '#16a34a', borderColor: '#16a34a' }} onClick={() => openWa(r)}>Send on WhatsApp</button>
            : <span style={{ fontSize: 12, color: '#b45309', alignSelf: 'center' }}>No phone number</span>}
          <button style={btn()} onClick={() => mark(r, 'SENT')}>Mark sent</button>
          <button style={btn()} onClick={() => mark(r, 'SKIPPED')}>Skip</button>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: C.muted }}>{r.status.toLowerCase()}{r.sentAt ? ` · ${new Date(r.sentAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}` : ''}</span>
      )}
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ ...card, padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: C.muted, maxWidth: 560, lineHeight: 1.6 }}>
          {whatsappApi
            ? 'WhatsApp Business is connected: reminders send automatically when due. Failed ones show here.'
            : 'One-tap mode: when a reminder is due, tap "Send on WhatsApp". The message opens ready to send. Auto-send switches on once a WhatsApp Business number is added on the server.'}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={btn()} disabled={busy} onClick={refresh}>Check for new reminders</button>
          {isAdmin && <button style={btn()} disabled={busy} onClick={briefs}>Write today's morning briefs</button>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {[['PENDING', 'To send'], ['SENT', 'Sent'], ['SKIPPED', 'Skipped'], ['FAILED', 'Failed']].map(([k, l]) => (
          <button key={k} onClick={() => setStatus(k)} style={{ ...btn(status === k ? 'primary' : 'outline'), padding: '6px 12px' }}>{l}</button>
        ))}
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? <p style={{ padding: 16, margin: 0, color: C.muted }}>Loading…</p> : list.length === 0 ? (
          <p style={{ padding: 16, margin: 0, color: C.muted }}>{status === 'PENDING' ? 'Nothing to send right now.' : 'Nothing here.'}</p>
        ) : status === 'PENDING' ? (
          <>
            <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: 13, background: '#fffbeb' }}>Due now ({due.length})</div>
            {due.length === 0 && <p style={{ padding: '0 16px 12px', margin: 0, fontSize: 13, color: C.muted }}>All caught up.</p>}
            {due.map(r => <Item key={r.id} r={r} />)}
            <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: 13, background: '#f7f9fc', borderTop: `1px solid ${C.line}` }}>Coming up ({later.length})</div>
            {later.map(r => <Item key={r.id} r={r} />)}
          </>
        ) : list.map(r => <Item key={r.id} r={r} />)}
      </div>

      {isAdmin && (
        <div style={{ ...card, padding: 16 }}>
          <b>Message all teachers</b>
          <textarea rows={3} style={{ ...input, width: '100%', marginTop: 8 }} value={custom} onChange={e => setCustom(e.target.value)} placeholder="e.g. Staff meeting at 7:45 AM tomorrow in the lab." />
          <button style={{ ...btn('primary'), marginTop: 8 }} disabled={busy || !custom.trim()} onClick={sendCustom}>Queue message</button>
        </div>
      )}
      {data.program.changeLogs?.length > 0 && (
        <div style={{ ...card, padding: 16 }}>
          <b>Recent changes</b>
          {data.program.changeLogs.map(c => (
            <div key={c.id} style={{ fontSize: 13, padding: '8px 0', borderTop: `1px solid ${C.line}`, display: 'flex', gap: 12 }}>
              <span style={{ color: C.faint, width: 110, flexShrink: 0 }}>{new Date(c.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              <span style={{ color: '#1e2229' }}>{c.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Claude assistant ────────────────────────────────────────────────────────

function Assistant({ programId, flash, aiEnabled, onChanged }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async e => {
    e?.preventDefault();
    const message = text.trim();
    if (!message) return;
    const history = msgs.map(m => ({ role: m.role, content: m.content }));
    setMsgs(m => [...m, { role: 'user', content: message }]);
    setText(''); setBusy(true);
    try {
      const r = await axios.post(`${P}/${programId}/assistant`, { message, history }, api());
      setMsgs(m => [...m, { role: 'assistant', content: r.data.reply, proposal: r.data.proposal }]);
    } catch (err) {
      setMsgs(m => [...m, { role: 'assistant', content: `Sorry, that failed: ${errText(err)}` }]);
    }
    setBusy(false);
  };

  const apply = async (i, proposal) => {
    setBusy(true);
    try {
      const r = await axios.post(`${P}/${programId}/assistant/apply`, { operations: proposal.operations }, api());
      setMsgs(m => m.map((x, j) => (j === i ? { ...x, applied: true } : x)));
      flash(`Done. ${r.data.summaries.join('. ')}.`);
      onChanged();
    } catch (err) { flash(errText(err)); }
    setBusy(false);
  };

  const examples = [
    'Make next Monday an off day',
    'English Teacher 4 is not coming. Give their sessions to Teacher 2 and 3',
    'Move tomorrow\'s English evening to 7:00 PM',
    'Who teaches on Day 10?',
  ];

  if (!aiEnabled) return <div style={{ ...card, padding: 20 }}>Claude is not set up on the server (ANTHROPIC_API_KEY is missing).</div>;
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', minHeight: 480 }}>
      <div style={{ flex: 1, padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
        {msgs.length === 0 && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Tell Claude what changed. It proposes the edit, you confirm, teachers get told.</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {examples.map(x => <button key={x} style={{ ...btn(), fontWeight: 400 }} onClick={() => setText(x)}>{x}</button>)}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ justifySelf: m.role === 'user' ? 'end' : 'start', maxWidth: '85%' }}>
            <div style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-line', background: m.role === 'user' ? C.indigo : '#e8eef7', color: m.role === 'user' ? '#fff' : C.text }}>{m.content}</div>
            {m.proposal && (
              <div style={{ marginTop: 8, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, background: '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Proposed change</div>
                <div style={{ fontSize: 13, color: '#1e2229' }}>{m.proposal.summary}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{m.proposal.operations.length} edit{m.proposal.operations.length > 1 ? 's' : ''}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {m.applied ? <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>Applied</span> : (
                    <>
                      <button style={btn('primary')} disabled={busy} onClick={() => apply(i, m.proposal)}>Apply & notify teachers</button>
                      <button style={btn()} onClick={() => setMsgs(ms => ms.map((x, j) => (j === i ? { ...x, proposal: null } : x)))}>Discard</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {busy && <div style={{ fontSize: 13, color: C.muted }}>Thinking…</div>}
      </div>
      <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: 12, borderTop: `1px solid ${C.line}` }}>
        <input style={{ ...input, flex: 1, padding: '10px 12px', fontSize: 14 }} value={text} onChange={e => setText(e.target.value)} placeholder="e.g. Cancel the Korean evening on Day 8" disabled={busy} />
        <button style={btn('primary')} disabled={busy || !text.trim()}>Send</button>
      </form>
    </div>
  );
}

// ─── Progress ────────────────────────────────────────────────────────────────

function Progress({ programId }) {
  const [s, setS] = useState(null);
  useEffect(() => { axios.get(`${P}/${programId}/stats`, api()).then(r => setS(r.data)).catch(() => setS({ error: true })); }, [programId]);
  if (!s) return <p style={{ color: C.muted }}>Loading…</p>;
  if (s.error) return <p style={{ color: '#b91c1c' }}>Could not load progress.</p>;
  const total = s.hours.english + s.hours.korean || 1;
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ ...card, padding: 16 }}>
        <b>Teaching time (scheduled, excluding cancelled)</b>
        <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', marginTop: 12, background: '#e8eef7' }}>
          <div style={{ width: `${(s.hours.english / total) * 100}%`, background: C.indigo }} />
          <div style={{ width: `${(s.hours.korean / total) * 100}%`, background: '#f97316' }} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 13 }}>
          <span><span style={{ color: C.indigo }}>■</span> English {s.hours.english} h</span>
          <span><span style={{ color: '#f97316' }}>■</span> Korean {s.hours.korean} h</span>
        </div>
      </div>
      <div className="pg-grid2" style={{ alignItems: 'start' }}>
        <div style={{ ...card, padding: 16 }}>
          <b>Sessions done by teacher</b>
          {s.byTeacher.map(t => (
            <div key={t.id} style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>{t.name}</span><span style={{ color: C.muted }}>{t.done}/{t.total}</span></div>
              <div style={{ height: 6, background: '#e8eef7', borderRadius: 999, marginTop: 4 }}><div style={{ width: `${t.total ? (t.done / t.total) * 100 : 0}%`, height: '100%', background: '#16a34a', borderRadius: 999 }} /></div>
            </div>
          ))}
        </div>
        <div style={{ ...card, padding: 16 }}>
          <b>Attendance by student</b>
          {s.byStudent.length === 0 && <p style={{ fontSize: 13, color: C.muted }}>No students yet.</p>}
          {s.byStudent.map(st => (
            <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderTop: `1px solid ${C.line}` }}>
              <span>{st.name}</span>
              <span style={{ color: C.muted }}>{st.rate == null ? '—' : `${st.rate}%`} · {st.ABSENT} absent · {st.LATE} late</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
