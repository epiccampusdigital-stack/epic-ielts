import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import AiLearnControl from '../components/AiLearnControl';

// Programme tracker: today's sessions, the 30-day schedule, teachers, students,
// WhatsApp reminder outbox and the Claude schedule assistant.

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const P = `${API_URL}/api/program`;

const C = {
  navy: '#002761', indigo: '#0056d2', gold: '#0056d2', bg: '#f3f6fb', card: '#ffffff',
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
  const [tab, setTab] = useState('dash');
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
    // Once the programme is running, only today and later days are rebuilt: past days and attendance stay.
    const fromDay = data?.todayDay?.dayNumber || 1;
    const msg = fromDay > 1
      ? `Rebuild Day ${fromDay} (today) to Day 30 from the new plan? Earlier days and their attendance stay. Changes you made to the later days will be replaced. Teachers and students stay.`
      : 'Rebuild all 30 days from the new plan? Session notes and changes you made to the schedule will be replaced. Teachers and students stay.';
    if (!window.confirm(msg)) return;
    try {
      await axios.post(`${P}/${programId}/rebuild`, { fromDay }, api());
      flash(fromDay > 1 ? `Schedule rebuilt from Day ${fromDay} onward.` : 'Schedule rebuilt from the new plan.');
      loadProgram();
    } catch (e) { flash(errText(e)); }
  };

  const tabs = [
    { id: 'dash', label: 'Dashboard' },
    ...(isAdmin ? [] : [{ id: 'mine', label: 'My sessions' }]),
    { id: 'today', label: 'Today' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'materials', label: 'Materials' },
    { id: 'review', label: 'Review papers' },
    ...(isAdmin ? [{ id: 'teachers', label: 'Teachers' }] : []),
    { id: 'students', label: 'Students' },
    { id: 'papers', label: 'Papers' },
    ...(isAdmin ? [{ id: 'reminders', label: 'Reminders', badge: data?.pendingReminders || 0 }] : []),
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
        .pg-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(172px, 1fr)); gap: 14px; }
        .pg-tile { background: #fff; border: 1px solid ${C.line}; border-radius: 16px; padding: 16px 18px; position: relative; overflow: hidden; transition: box-shadow .15s, transform .15s; }
        .pg-tile::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--ac, ${C.indigo}); }
        .pg-tile.click { cursor: pointer; }
        .pg-tile.click:hover { box-shadow: 0 6px 22px rgba(0,39,97,.12); transform: translateY(-2px); }
        .pg-tile .k { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: ${C.muted}; font-weight: 700; }
        .pg-tile .v { font-size: 30px; font-weight: 700; line-height: 1.15; margin-top: 4px; color: ${C.text}; }
        .pg-tile .s { font-size: 13px; color: ${C.muted}; margin-top: 4px; }
        .pg-bar { height: 8px; border-radius: 99px; background: #e8eef7; overflow: hidden; margin-top: 10px; }
        .pg-bar > i { display: block; height: 100%; background: var(--ac, ${C.indigo}); border-radius: 99px; }
        .pg-tab-on { background: ${C.indigo} !important; color: #fff !important; border-radius: 10px !important; border-bottom: 3px solid transparent !important; }
        .pg-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .pg-table th { text-align: left; font-size: 12px; letter-spacing: .05em; text-transform: uppercase; color: ${C.muted}; padding: 10px 12px; background: #f7f9fc; border-bottom: 1px solid ${C.line}; position: sticky; top: 0; }
        .pg-table td { padding: 10px 12px; border-bottom: 1px solid #eef2f8; }
        .pg-table tr:hover td { background: #f7faff; }
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
          <AiLearnControl compact />
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
                  height: 40, padding: '0 16px', margin: '6px 2px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, whiteSpace: 'nowrap',
                  color: '#0f1114', fontWeight: 600, borderRadius: 10,
                }} className={tab === t.id ? 'pg-tab-on' : ''}>
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
        {isAdmin && data?.program && data.planCurrent === false && (
          <div style={{ ...card, padding: '14px 16px', marginBottom: 16, background: '#f0f6ff', borderColor: '#b9d2f7', fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span><b>New plan available:</b> the weekly pattern from the teachers (English mornings with Sir and Anna, Korean afternoons and evenings). Rebuild to use it. Once the programme is running this only changes today and later days, and earlier days and attendance stay. Teachers and students stay.</span>
            <button style={btn('primary')} onClick={rebuild}>Rebuild schedule</button>
          </div>
        )}
        {boot.loading && <p style={{ color: C.muted }}>Loading…</p>}
        {boot.error && <p style={{ color: '#b91c1c' }}>{boot.error}</p>}

        {!boot.loading && !boot.error && !boot.programs?.length && (
          <div style={{ ...card, padding: 32, maxWidth: 620 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>No programme yet</h2>
            <p style={{ margin: '0 0 20px', color: C.muted, lineHeight: 1.6 }}>
              Load the Korea scholarship batch: 30 days from Fri 30 Oct, a whole English day then a whole Korean day (8:30 to 11:30 and 1:00 to 4:30), about 90 hours of each language, with placeholder teachers you can rename.
            </p>
            {isAdmin ? <button style={btn('primary')} onClick={seed}>Load the 30-day plan</button> : <p style={{ color: C.muted }}>Ask the admin to set it up.</p>}
          </div>
        )}

        {programId && data && (
          <>
            {tab === 'dash' && <Dashboard programId={programId} data={data} isAdmin={isAdmin} setTab={setTab} flash={flash} />}
            {tab === 'papers' && <Papers programId={programId} flash={flash} />}
            {tab === 'mine' && <MySessions flash={flash} />}
            {tab === 'today' && <DayView programId={programId} data={data} dayNumber={data.todayDay?.dayNumber} flash={flash} isAdmin={isAdmin} onChanged={loadProgram} goReminders={() => setTab('reminders')} />}
            {tab === 'review' && <PaperReview flash={flash} />}
            {tab === 'materials' && <Materials flash={flash} currentWeek={data?.todayDay ? Math.ceil(data.todayDay.dayNumber / 7) : 1} />}
            {tab === 'schedule' && <Schedule programId={programId} data={data} flash={flash} isAdmin={isAdmin} onChanged={loadProgram} />}
            {tab === 'teachers' && <Teachers programId={programId} data={data} flash={flash} isAdmin={isAdmin} onChanged={loadProgram} />}
            {tab === 'students' && <Students programId={programId} data={data} flash={flash} isAdmin={isAdmin} onChanged={loadProgram} />}
            {tab === 'reminders' && <Reminders programId={programId} data={data} flash={flash} isAdmin={isAdmin} whatsappApi={boot.whatsappApi} onChanged={loadProgram} />}
            {tab === 'assistant' && <Assistant programId={programId} flash={flash} aiEnabled={boot.aiEnabled} onChanged={loadProgram} />}
            {tab === 'progress' && <Progress programId={programId} hide={data?.hiddenLanguage} />}
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
          {data.hiddenLanguage !== 'EN' && <div style={{ fontSize: 13, color: '#1e2229', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{day.englishFocus}</div>}
        </div>
        <div style={{ minWidth: 220, flex: '0 1 320px', fontSize: 13, lineHeight: 1.6 }}>
          {data.hiddenLanguage !== 'KR' && <div><b>Korean:</b> {day.koreanFocus}</div>}
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


// ─── Dashboard (first screen) and Papers (all results) ──────────────────────

function Tile({ k, v, s, color, onClick, bar }) {
  return (
    <div className={`pg-tile${onClick ? ' click' : ''}`} style={{ '--ac': color || C.indigo }} onClick={onClick}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      {s ? <div className="s">{s}</div> : null}
      {bar != null ? <div className="pg-bar"><i style={{ width: `${Math.max(0, Math.min(100, bar))}%` }} /></div> : null}
    </div>
  );
}
const TYPE_CHIP = {
  READING: { l: 'Reading', bg: '#e0e7ff', fg: '#003b8f' }, WRITING: { l: 'Writing', bg: '#fef9c3', fg: '#854d0e' },
  LISTENING: { l: 'Listening', bg: '#dcfce7', fg: '#166534' }, SPEAKING: { l: 'Speaking', bg: '#ffedd5', fg: '#9a3412' },
};
const pctColor = p => (p == null ? C.muted : p >= 75 ? '#166534' : p >= 50 ? '#854d0e' : '#991b1b');
function Chip({ type }) {
  const c = TYPE_CHIP[type] || { l: type, bg: '#e8eef7', fg: C.muted };
  return <span style={{ background: c.bg, color: c.fg, borderRadius: 50, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{c.l}</span>;
}
function shortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Colombo' });
}

function Dashboard({ programId, data, isAdmin, setTab, flash }) {
  const [res, setRes] = useState(null);
  const [place, setPlace] = useState(null);
  const [today, setToday] = useState([]);
  const [mine, setMine] = useState(null);
  const dayNo = data?.todayDay?.dayNumber;
  useEffect(() => {
    if (!programId) return;
    axios.get(`${P}/${programId}/results`, api()).then(r => setRes(r.data)).catch(() => setRes({ students: [], attempts: [] }));
    axios.get(`${P}/${programId}/placement`, api()).then(r => setPlace(r.data)).catch(() => setPlace(null));
    if (dayNo) axios.get(`${P}/${programId}/sessions?day=${dayNo}`, api()).then(r => setToday(r.data)).catch(() => setToday([]));
    if (!isAdmin) axios.get(`${P}/my`, api()).then(r => setMine(r.data)).catch(() => setMine(null));
  }, [programId, dayNo, isAdmin]);
  if (!data?.program) return <p style={{ color: C.muted }}>Loading…</p>;
  const user = readUser();
  const first = (mine?.teacher?.name || user.name || '').split(' ')[0];
  const now = new Date(Date.now() + 330 * 60000);
  const nowStr = now.toISOString().slice(11, 16);
  const todayStr = now.toISOString().slice(0, 10);
  const real = today.filter(s => s.subject !== 'BREAK' && s.status !== 'CANCELLED');
  const upcomingToday = real.filter(s => s.endTime > nowStr);
  const mineNext = (mine?.sessions || []).filter(s => s.date && s.date >= todayStr && s.status !== 'CANCELLED' && !(s.date === todayStr && s.endTime <= nowStr)).slice(0, 5);
  const list = isAdmin ? upcomingToday.slice(0, 5) : mineNext;
  const week = dayNo ? Math.ceil(dayNo / 7) : null;
  const total = data.program.days?.length || 30;
  const attempts = res?.attempts || [];
  const pcts = attempts.map(a => a.pct).filter(v => v != null);
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
  const doneToday = attempts.filter(a => a.endedAt && new Date(a.endedAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' }) === todayStr).length;
  const counts = data.counts || [];
  const sTotal = counts.reduce((n, c) => n + c._count, 0), sDone = counts.find(c => c.status === 'DONE')?._count || 0;
  const levels = {};
  [...(place?.rows || []), ...(place?.others || [])].forEach(r => { if (r.level) levels[r.level] = (levels[r.level] || 0) + 1; });
  const levelList = ['Pre-A1', 'A1', 'A2', 'B1', 'B2'].filter(l => levels[l]);
  const nStudents = res?.students?.length || (data.program.students || []).filter(s => s.active !== false).length;
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 26 }}>{first ? `Hi ${first}` : 'Dashboard'}</h2>
        <p style={{ margin: '4px 0 0', color: C.muted }}>{data.todayDay ? `Day ${dayNo} of ${total} · ${prettyDate(data.todayDay.date)} · ${data.todayDay.theme}` : 'No class today.'}</p>
      </div>
      <div className="pg-tiles">
        <Tile k="Today" v={dayNo ? `Day ${dayNo}` : 'Off'} s={dayNo ? `${real.length} sessions · ${upcomingToday.length} still to go` : 'No class day'} color="#0056d2" onClick={() => setTab('today')} />
        <Tile k="Programme" v={week ? `Week ${week}` : '-'} s={dayNo ? `Day ${dayNo} of ${total}` : ''} bar={dayNo ? (dayNo / total) * 100 : 0} color="#7c3aed" onClick={() => setTab('schedule')} />
        <Tile k="Students" v={nStudents || '-'} s="doing papers" color="#0e9f6e" onClick={() => setTab('students')} />
        <Tile k="Papers done" v={res ? attempts.length : '…'} s={doneToday ? `${doneToday} today` : 'none yet today'} color="#f59e0b" onClick={() => setTab('papers')} />
        <Tile k="Class average" v={avg != null ? `${avg}%` : '-'} s="reading, listening and writing" bar={avg || 0} color={avg == null ? C.muted : avg >= 75 ? '#0e9f6e' : avg >= 50 ? '#f59e0b' : '#dc2626'} onClick={() => setTab('papers')} />
        <Tile k="Sessions done" v={`${sDone}/${sTotal || 0}`} s="across the programme" bar={sTotal ? (sDone / sTotal) * 100 : 0} color="#f97316" onClick={() => setTab('progress')} />
      </div>

      <div className="pg-grid2" style={{ alignItems: 'start' }}>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{isAdmin ? 'Up next today' : 'Your next sessions'}</div>
          {list.length === 0 && <p style={{ color: C.muted, margin: 0 }}>Nothing coming up.</p>}
          {list.map(s => {
            const sub = SUBJECT[s.subject] || SUBJECT.ADMIN;
            return (
              <div key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
                <span style={{ width: 118, color: C.muted, flexShrink: 0 }}>{!isAdmin && s.date && s.date !== todayStr ? `${prettyDate(s.date)} ` : ''}{pretty(s.startTime)}</span>
                <span style={{ background: sub.bg, color: sub.fg, borderRadius: 50, padding: '1px 9px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{sub.label}</span>
                <span style={{ flex: 1 }}>{s.title}</span>
              </div>
            );
          })}
          <button style={{ ...btn('outline'), marginTop: 10 }} onClick={() => setTab(isAdmin ? 'today' : 'mine')}>{isAdmin ? 'Open today' : 'All my sessions'}</button>
        </div>

        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Latest papers</div>
          {!res && <p style={{ color: C.muted, margin: 0 }}>Loading…</p>}
          {res && attempts.length === 0 && <p style={{ color: C.muted, margin: 0 }}>{res.note || 'No papers finished yet.'}</p>}
          {attempts.slice(0, 6).map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
              <Chip type={a.testType} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{a.studentName}</b><br /><span style={{ color: C.muted, fontSize: 12 }}>{a.title} · {shortDate(a.endedAt)}</span>
              </span>
              <b style={{ color: pctColor(a.pct) }}>{a.pct != null ? `${a.pct}%` : a.band != null ? `Band ${a.band}` : a.state === 'marking' ? 'Marking' : '-'}</b>
            </div>
          ))}
          <button style={{ ...btn('outline'), marginTop: 10 }} onClick={() => setTab('papers')}>See all papers</button>
        </div>
      </div>

      <div className="pg-grid2" style={{ alignItems: 'start' }}>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Class levels (Day 1 placement)</div>
          {levelList.length === 0 && <p style={{ color: C.muted, margin: 0 }}>Levels show here when students finish all four parts.</p>}
          {levelList.map(l => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0', fontSize: 14 }}>
              <span style={{ width: 52, fontWeight: 700 }}>{l}</span>
              <div className="pg-bar" style={{ flex: 1, marginTop: 0, height: 12 }}><i style={{ width: `${(levels[l] / Math.max(...Object.values(levels))) * 100}%` }} /></div>
              <span style={{ width: 28, textAlign: 'right', color: C.muted }}>{levels[l]}</span>
            </div>
          ))}
        </div>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Quick links</div>
          <div className="pg-tiles" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[['Materials', 'Teacher copies and answers', 'materials', '#7c3aed'], ['Schedule', 'All 30 days', 'schedule', '#0056d2'], ['Papers', 'Every result', 'papers', '#f59e0b'], ['Students', 'Attendance and levels', 'students', '#0e9f6e']].map(([a, b, id, c]) => (
              <div key={id} className="pg-tile click" style={{ '--ac': c, padding: '12px 14px' }} onClick={() => setTab(id)}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{a}</div><div className="s">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Papers({ programId, flash }) {
  const [res, setRes] = useState(null);
  const [sid, setSid] = useState('');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => {
    axios.get(`${P}/${programId}/results`, api()).then(r => setRes(r.data)).catch(e => { flash(errText(e)); setRes({ students: [], attempts: [] }); });
  }, [programId, flash]);
  if (!res) return <p style={{ color: C.muted }}>Loading…</p>;
  const term = q.trim().toLowerCase();
  const rows = res.attempts.filter(a => (!sid || String(a.studentId) === sid) && (!type || a.testType === type) && (!term || `${a.title} ${a.paperCode} ${a.studentName}`.toLowerCase().includes(term)));
  const pcts = rows.map(a => a.pct).filter(v => v != null);
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
  const best = pcts.length ? Math.max(...pcts) : null;
  const sel = { ...input, minWidth: 160 };
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22 }}>Papers and results</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>Every paper the students have finished on the site. This page is read only.</p>
      </div>
      <div className="pg-tiles">
        <Tile k="Papers shown" v={rows.length} s={`of ${res.attempts.length} in total`} color="#f59e0b" />
        <Tile k="Average" v={avg != null ? `${avg}%` : '-'} s="of the papers shown" bar={avg || 0} color={avg == null ? C.muted : avg >= 75 ? '#0e9f6e' : avg >= 50 ? '#f59e0b' : '#dc2626'} />
        <Tile k="Best score" v={best != null ? `${best}%` : '-'} color="#0e9f6e" />
        <Tile k="Students" v={res.students.length} s="with papers" color="#7c3aed" />
      </div>

      {res.students.length > 0 && (
        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>By student <span style={{ color: C.muted, fontWeight: 400, fontSize: 13 }}>(tap a name to filter)</span></div>
          <div className="pg-tiles" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 }}>
            {res.students.map(s => (
              <div key={s.studentId} className="pg-tile click" style={{ '--ac': pctColor(s.avgPct), padding: '10px 14px', outline: String(s.studentId) === sid ? `2px solid ${C.indigo}` : 'none' }} onClick={() => setSid(String(s.studentId) === sid ? '' : String(s.studentId))}>
                <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'capitalize' }}>{String(s.name).toLowerCase()}</div>
                <div className="s">{s.papers} {s.papers === 1 ? "paper" : "papers"} · {s.avgPct != null ? `${s.avgPct}% average` : 'no score yet'}</div>
                <div className="pg-bar" style={{ marginTop: 6 }}><i style={{ width: `${s.avgPct || 0}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select value={sid} onChange={e => setSid(e.target.value)} style={sel}>
          <option value="">All students</option>
          {res.students.map(s => <option key={s.studentId} value={s.studentId}>{s.name}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} style={sel}>
          <option value="">All skills</option>
          {Object.entries(TYPE_CHIP).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search paper or student" style={{ ...input, minWidth: 220 }} />
      </div>

      <div style={{ ...card, overflowX: 'auto' }}>
        <table className="pg-table">
          <thead><tr><th>Student</th><th>Paper</th><th>Skill</th><th>Score</th><th>%</th><th>Band</th><th>Time</th><th>Date</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} style={{ color: C.muted, padding: 18 }}>{res.note || 'No papers match.'}</td></tr>}
            {rows.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{String(a.studentName).toLowerCase()}</td>
                <td>{a.title}{a.isPlacement && <span style={{ marginLeft: 6, fontSize: 11, color: C.muted }}>placement</span>}</td>
                <td><Chip type={a.testType} /></td>
                <td>{a.score || (a.state === 'marking' ? <span style={{ color: C.muted }}>Marking…</span> : a.state === 'failed' ? <span style={{ color: '#991b1b' }}>Not marked</span> : '-')}</td>
                <td style={{ fontWeight: 700, color: pctColor(a.pct) }}>{a.pct != null ? `${a.pct}%` : '-'}</td>
                <td>{a.band != null ? a.band : '-'}</td>
                <td style={{ color: C.muted }}>{a.minutes ? `${a.minutes} min` : '-'}</td>
                <td style={{ color: C.muted, whiteSpace: 'nowrap' }}>{shortDate(a.endedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ─── Review papers: read a paper, listen to the audio, see every answer ─────────
const TYPE_ORDER = ['READING', 'LISTENING', 'WRITING', 'SPEAKING'];
const TYPE_NAME = { READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing', SPEAKING: 'Speaking' };
const TYPE_COLOR = { READING: '#0056d2', LISTENING: '#7c3aed', WRITING: '#0e9f6e', SPEAKING: '#f59e0b' };
const LEVEL_LABEL = { 1: 'Beginner · A1', 2: 'Elementary · A2', 3: 'Intermediate · B1', 4: 'Upper intermediate · B1+', 5: 'Advanced · B2' };
function StarPicker({ value, onChange, size = 20, readOnly }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} role={readOnly ? undefined : 'button'} title={LEVEL_LABEL[i]} onClick={readOnly ? undefined : () => onChange(i)}
          style={{ fontSize: size, lineHeight: 1, cursor: readOnly ? 'default' : 'pointer', color: i <= (value || 0) ? '#F59E0B' : '#D5DBE5' }}>{'\u2605'}</span>
      ))}
    </span>
  );
}


// ─── Teacher guide: print-ready, highlighted copy of a paper ────────────────
function evidenceOf(q) {
  const out = [];
  if (q.evidence) String(q.evidence).split('|').map(x => x.trim()).filter(x => x.length > 2).forEach(x => out.push(x));
  if (!out.length && q.explanation) {
    const re = /["“‘']([^"”’']{6,160})["”’']/g; let m;
    while ((m = re.exec(q.explanation))) out.push(m[1].trim());
  }
  return out;
}
function Highlighted({ text, questions }) {
  const marks = [];
  const low = String(text || '').toLowerCase();
  questions.forEach(q => evidenceOf(q).forEach(ph => {
    const i = low.indexOf(ph.toLowerCase());
    if (i >= 0) marks.push({ i, e: i + ph.length, n: q.number });
  }));
  marks.sort((a, b) => a.i - b.i);
  const kept = []; let end = -1;
  marks.forEach(m => { if (m.i >= end) { kept.push(m); end = m.e; } });
  const parts = []; let pos = 0;
  kept.forEach((m, k) => {
    if (m.i > pos) parts.push(String(text).slice(pos, m.i));
    parts.push(<span key={k} style={{ background: '#fff176', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', padding: '0 1px' }}>{String(text).slice(m.i, m.e)}<sup style={{ color: '#be185d', fontWeight: 700, fontSize: '0.7em', marginLeft: 1 }}>{m.n}</sup></span>);
    pos = m.e;
  });
  parts.push(String(text).slice(pos));
  return <>{parts}</>;
}
function TeacherGuide({ paper, onClose }) {
  const all = [...paper.sections, ...paper.passages].flatMap(x => x.groups.flatMap(g => g.questions));
  const tag = { background: '#dbeafe', color: '#1e3a8a', fontWeight: 700, borderRadius: 4, padding: '1px 8px', fontSize: 12.5, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };
  const Qs = ({ groups }) => groups.map((g, gi) => (
    <div key={gi} style={{ marginBottom: 10, breakInside: 'avoid' }}>
      {g.instruction && <div style={{ fontWeight: 700, fontSize: 12.5, color: '#0f2a5c', margin: '8px 0 4px' }}>{g.instruction}</div>}
      {g.questions.map(q => (
        <div key={q.number} style={{ margin: '5px 0', fontSize: 13, lineHeight: 1.5, breakInside: 'avoid' }}>
          <b>{q.number}.</b> {q.content} <span style={tag}>{q.number}: {String(q.answer || '').split('|').join(' / ')}</span>
          {q.options && q.options.map((o, i) => {
            const right = String(q.answer || '').split('|').map(x => x.trim().toUpperCase()).includes('ABCDEFGH'[i]);
            return <div key={i} style={{ marginLeft: 18, background: right ? '#bbf7d0' : 'transparent', fontWeight: right ? 700 : 400, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{o}</div>;
          })}
          {q.explanation && <div style={{ marginLeft: 18, color: '#475569', fontSize: 12 }}>{q.explanation}</div>}
        </div>
      ))}
    </div>
  ));
  const H = ({ children }) => <h2 style={{ background: '#0f2a5c', color: '#fff', fontSize: 14, margin: '18px 0 8px', padding: '6px 10px', borderRadius: 4, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{children}</h2>;
  return (
    <div id="tg-overlay" style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999, overflow: 'auto' }}>
      <style>{`@media print { body * { visibility: hidden !important; } #tg-overlay, #tg-overlay * { visibility: visible !important; } #tg-overlay { position: absolute !important; inset: auto !important; left: 0; top: 0; width: 100%; overflow: visible !important; } .tg-noprint { display: none !important; } }`}</style>
      <div className="tg-noprint" style={{ position: 'sticky', top: 0, background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '10px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={btn('primary')} onClick={() => window.print()}>Print / Save as PDF</button>
        <button style={btn('outline')} onClick={onClose}>Close</button>
        <span style={{ fontSize: 13, color: '#475569' }}>Yellow = where the answer is. Pink number = question. Blue = answer. Green = correct option.</span>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px 48px', fontFamily: 'Source Sans Pro, Arial, sans-serif', color: '#0f172a' }}>
        <div style={{ borderBottom: '4px solid #0f2a5c', paddingBottom: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f2a5c', letterSpacing: 1 }}>EPIC CAMPUS · TEACHER COPY</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{paper.title}</div>
          <div style={{ fontSize: 12.5, color: '#475569' }}>{paper.code} · {paper.minutes} minutes{paper.difficulty ? ` · Level ${paper.difficulty} of 5 (${LEVEL_LABEL[paper.difficulty]})` : ''}</div>
        </div>
        {paper.passages.map((ps, i) => (
          <div key={i}>
            <H>{ps.title}</H>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13.5, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}><Highlighted text={ps.text} questions={ps.groups.flatMap(g => g.questions)} /></div>
            <H>Questions and answers</H>
            <Qs groups={ps.groups} />
          </div>
        ))}
        {paper.sections.map(sx => (
          <div key={sx.number}>
            <H>Section {sx.number}{sx.description ? ` · ${sx.description}` : ''}</H>
            {sx.script && (
              <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
                {String(sx.script).split('\n').filter(Boolean).map((line, k) => { const m = line.match(/^([A-Za-z ]{2,20}):\s*(.+)$/); return <p key={k} style={{ margin: '0 0 5px' }}>{m ? <><b>{m[1]}:</b> <Highlighted text={m[2]} questions={sx.groups.flatMap(g => g.questions)} /></> : <Highlighted text={line} questions={sx.groups.flatMap(g => g.questions)} />}</p>; })}
              </div>
            )}
            <Qs groups={sx.groups} />
          </div>
        ))}
        {paper.writingTasks.map(t => (
          <div key={t.number}><H>Task {t.number} · at least {t.minWords} words</H><div style={{ fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{t.prompt}</div></div>
        ))}
        {all.length === 0 && paper.writingTasks.length === 0 && <p>No questions in this paper.</p>}
      </div>
    </div>
  );
}

function PaperBuilder({ flash, onMade }) {
  const [skill, setSkill] = useState('READING');
  const [stars, setStarsN] = useState(2);
  const [topic, setTopic] = useState('');
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState(null);
  useEffect(() => { axios.get(`${P}/paper-builder/status`, api()).then(r => setStatus(r.data)).catch(() => setStatus(null)); }, []);
  useEffect(() => {
    if (!job || job.status !== 'running') return undefined;
    const t = setInterval(async () => {
      try {
        const r = (await axios.get(`${P}/paper-builder/jobs/${job.id}`, api())).data;
        setJob(j => ({ ...j, ...r }));
        if (r.status === 'done') { flash(r.warning || 'New paper ready. Check it, then press Make live.'); onMade(r.paperId); }
        if (r.status === 'failed') flash(r.error || 'The builder could not make the paper.');
      } catch (e) { setJob(j => ({ ...j, status: 'failed', error: errText(e) })); }
    }, 3000);
    return () => clearInterval(t);
  }, [job, flash, onMade]);
  const go = async () => {
    try {
      const r = (await axios.post(`${P}/paper-builder/generate`, { skill, difficulty: stars, topic }, api())).data;
      setJob({ id: r.jobId, status: 'running', step: 'Starting' });
    } catch (e) { flash(errText(e)); }
  };
  const busy = job && job.status === 'running';
  return (
    <div style={{ ...card, padding: 16, borderTop: `4px solid ${C.indigo}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Create a new paper</div>
        {status && <div style={{ fontSize: 12, color: C.muted }}>AI writer: {status.claude ? 'ready' : 'no key'} · Google voice: {status.voice ? 'ready' : 'not set (computer voice)'}</div>}
      </div>
      <p style={{ margin: '4px 0 12px', fontSize: 13, color: C.muted }}>The AI writes a brand new paper that does not repeat old questions. It is saved as not live, so you can check it first.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['READING', 'LISTENING', 'WRITING'].map(t => (
            <button key={t} disabled={busy} onClick={() => setSkill(t)} style={{ ...btn('outline'), height: 34, background: skill === t ? TYPE_COLOR[t] : '#fff', color: skill === t ? '#fff' : C.text, borderColor: skill === t ? TYPE_COLOR[t] : C.line }}>{TYPE_NAME[t]}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarPicker value={stars} onChange={busy ? () => {} : setStarsN} />
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{LEVEL_LABEL[stars]}</span>
        </div>
        <input value={topic} disabled={busy} onChange={e => setTopic(e.target.value)} placeholder="Topic (optional), e.g. food in Korea" style={{ flex: '1 1 200px', height: 34, borderRadius: 8, border: `1px solid ${C.line}`, padding: '0 10px', fontFamily: 'inherit', fontSize: 14 }} />
        <button style={btn('primary')} disabled={busy || (status && !status.claude)} onClick={go}>{busy ? 'Working…' : 'Create paper'}</button>
      </div>
      {job && (
        <div style={{ marginTop: 12, fontSize: 13, padding: '8px 12px', borderRadius: 8, background: job.status === 'failed' ? '#fef2f2' : job.status === 'done' ? '#f0fdf4' : '#eef3fb', color: job.status === 'failed' ? '#991b1b' : job.status === 'done' ? '#166534' : C.navy }}>
          {job.status === 'running' && <>{job.step}… this can take 1 to 3 minutes. You can keep working on this page.</>}
          {job.status === 'done' && <>Done. {job.warning || 'The new paper is open below. Check it, then press "Make live for students".'}</>}
          {job.status === 'failed' && <>Could not make the paper: {job.error}</>}
        </div>
      )}
    </div>
  );
}

function PaperReview({ flash }) {
  const [list, setList] = useState(null);
  const [sel, setSel] = useState(null);
  const [paper, setPaper] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [speaking, setSpeaking] = useState(null);
  const [guide, setGuide] = useState(false);
  const loadList = useCallback(() => axios.get(`${P}/paper-review`, api()).then(r => setList(r.data)).catch(e => { flash(errText(e)); setList([]); }), [flash]);
  useEffect(() => { loadList(); }, [loadList]);
  const [audioJob, setAudioJob] = useState(null);
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* no speech support */ } }, []);
  const openPaper = async (id) => {
    setSel(id); setPaper(null); stopVoice();
    try { setPaper((await axios.get(`${P}/paper-review/${id}`, api())).data); } catch (e) { flash(errText(e)); }
  };
  const setStars = async (id, n) => {
    try {
      await axios.patch(`${P}/paper-review/${id}/difficulty`, { difficulty: n }, api());
      setList(l => l.map(x => x.id === id ? { ...x, difficulty: n } : x));
      setPaper(pp => pp && pp.id === id ? { ...pp, difficulty: n } : pp);
      flash('Level saved.');
    } catch (e) { flash(errText(e)); }
  };
  const setLive = async (id, live) => {
    try {
      await axios.patch(`${P}/paper-review/${id}/publish`, { live }, api());
      setList(l => l.map(x => x.id === id ? { ...x, status: live ? 'ACTIVE' : 'DRAFT' } : x));
      setPaper(pp => pp && pp.id === id ? { ...pp, status: live ? 'ACTIVE' : 'DRAFT' } : pp);
      flash(live ? 'Paper is now live for students.' : 'Paper hidden from students.');
    } catch (e) { flash(errText(e)); }
  };
  const removePaper = async (id) => {
    if (!window.confirm('Delete this paper? This cannot be undone.')) return;
    try { await axios.delete(`${P}/paper-review/${id}`, api()); setSel(null); setPaper(null); loadList(); flash('Paper deleted.'); } catch (e) { flash(errText(e)); }
  };
  const recordAudio = async (id) => {
    try {
      const r = (await axios.post(`${P}/paper-builder/${id}/audio`, {}, api())).data;
      setAudioJob('Recording the audio… this takes about a minute.');
      const t = setInterval(async () => {
        try {
          const j = (await axios.get(`${P}/paper-builder/jobs/${r.jobId}`, api())).data;
          if (j.status === 'running') { setAudioJob(`${j.step}…`); return; }
          clearInterval(t); setAudioJob(null);
          if (j.status === 'done') { flash('Audio recorded.'); openPaper(id); } else flash(j.error || 'Recording failed.');
        } catch (e) { clearInterval(t); setAudioJob(null); flash(errText(e)); }
      }, 3000);
    } catch (e) { flash(errText(e)); }
  };
  const stopVoice = () => { try { window.speechSynthesis?.cancel(); } catch { /* no speech support */ } setSpeaking(null); };
  const playVoice = (n, script) => {
    const synth = window.speechSynthesis;
    if (!synth) { flash('This browser cannot read the script aloud.'); return; }
    synth.cancel();
    const voices = synth.getVoices().filter(v => /^en/i.test(v.lang));
    const map = {};
    const lines = String(script).split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^([A-Za-z ]{2,20}):\s*(.+)$/); return m ? { who: m[1].trim(), text: m[2] } : { who: 'Narrator', text: l }; });
    const us = lines.map(l => {
      const u = new SpeechSynthesisUtterance(l.text);
      if (!(l.who in map)) map[l.who] = Object.keys(map).length;
      if (voices.length) u.voice = voices[map[l.who] % voices.length];
      u.lang = u.voice?.lang || 'en-GB'; u.rate = 0.9; u.pitch = /woman/i.test(l.who) ? 1.15 : /man/i.test(l.who) ? 0.85 : 1;
      return u;
    });
    us[us.length - 1].onend = () => setSpeaking(null);
    setSpeaking(n); us.forEach(u => synth.speak(u));
  };
  if (!list) return <p style={{ color: C.muted }}>Loading…</p>;
  const shown = list.filter(p => filter === 'ALL' || p.type === filter);
  const groupsByType = TYPE_ORDER.map(t => [t, shown.filter(p => p.type === t)]).filter(([, a]) => a.length);
  const base = String(API_URL || '').replace(/\/$/, '');
  const Questions = ({ groups }) => (
    <div style={{ display: 'grid', gap: 14 }}>
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.instruction && <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, background: '#eef3fb', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>{g.instruction}</div>}
          {g.questions.map(q => (
            <div key={q.number} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.line}` }}>
              <div style={{ minWidth: 28, height: 28, borderRadius: 14, background: C.indigo, color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{q.number}</div>
              <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>
                <div>{q.content}</div>
                {q.options && q.options.map((o, i) => {
                  const right = String(q.answer || '').split('|').map(x => x.trim().toUpperCase()).includes('ABCDEFGH'[i]);
                  return <div key={i} style={{ margin: '3px 0 0 6px', padding: '2px 8px', borderRadius: 6, background: right ? '#dcfce7' : 'transparent', fontWeight: right ? 700 : 400, color: right ? '#166534' : C.text }}>{o}</div>;
                })}
                {!q.options && <div style={{ marginTop: 4 }}><span style={{ background: '#dcfce7', color: '#166534', fontWeight: 700, borderRadius: 6, padding: '2px 10px', fontSize: 13 }}>{String(q.answer || '').split('|').join('  or  ')}</span></div>}
                {q.explanation && <div style={{ marginTop: 4, fontSize: 12.5, color: C.muted }}>{q.explanation}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {guide && paper && <TeacherGuide paper={paper} onClose={() => setGuide(false)} />}
      <PaperBuilder flash={flash} onMade={id => { loadList(); if (id) openPaper(id); }} />
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Review papers</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>Pick a paper to read it, listen to the audio and see every answer. Only teachers can see this page.</p>
      </div>
      <div className="pg-grid2" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 320px) 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {['ALL', ...TYPE_ORDER].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ ...btn('outline'), height: 30, fontSize: 13, background: filter === t ? C.indigo : '#fff', color: filter === t ? '#fff' : C.text, borderColor: filter === t ? C.indigo : C.line }}>{t === 'ALL' ? 'All' : TYPE_NAME[t]}</button>
            ))}
          </div>
          {groupsByType.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>No papers found.</p>}
          {groupsByType.map(([t, arr]) => (
            <div key={t} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TYPE_COLOR[t], textTransform: 'uppercase', letterSpacing: .6, margin: '4px 0 6px' }}>{TYPE_NAME[t]} ({arr.length})</div>
              {arr.map(p => (
                <button key={p.id} onClick={() => openPaper(p.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px', marginBottom: 6, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${sel === p.id ? C.indigo : C.line}`, background: sel === p.id ? '#eef3fb' : '#fff' }}>
                  <div style={{ fontSize: 11, color: C.faint, fontWeight: 700 }}>{p.code}{p.status === 'DRAFT' ? ' · NOT LIVE' : ''}{p.generated ? ' · AI MADE' : ''}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.title}</div>
                  {p.difficulty ? <StarPicker value={p.difficulty} readOnly size={13} /> : null}
                  <div style={{ fontSize: 12, color: C.muted }}>{p.questions} questions · {p.minutes} min</div>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 14, minWidth: 0 }}>
          {!sel && <div style={{ ...card, padding: 24, color: C.muted }}>Choose a paper on the left.</div>}
          {sel && !paper && <div style={{ ...card, padding: 24, color: C.muted }}>Loading the paper…</div>}
          {paper && (
            <>
              <div style={{ ...card, padding: 18, borderTop: `4px solid ${TYPE_COLOR[paper.type] || C.indigo}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.faint }}>{paper.code} · {TYPE_NAME[paper.type] || paper.type}</div>
                <h3 style={{ margin: '2px 0 6px', fontSize: 20 }}>{paper.title}</h3>
                <div style={{ fontSize: 14, color: C.muted }}>{paper.minutes} minutes{paper.instructions ? ` · ${paper.instructions}` : ''}</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <StarPicker value={paper.difficulty} onChange={n => setStars(paper.id, n)} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{paper.difficulty ? LEVEL_LABEL[paper.difficulty] : 'Tap a star to set the level'}</span>
                  <button style={btn('outline')} onClick={() => setGuide(true)}>Teacher guide (print / PDF)</button>
                  {paper.type === 'LISTENING' && <button style={btn('outline')} disabled={!!audioJob} onClick={() => recordAudio(paper.id)}>{audioJob || 'Record audio with Google voice'}</button>}
                  {paper.generated && <button style={btn('danger')} onClick={() => removePaper(paper.id)}>Delete</button>}
                  <button style={btn(paper.status === 'ACTIVE' ? 'outline' : 'primary')} onClick={() => setLive(paper.id, paper.status !== 'ACTIVE')}>{paper.status === 'ACTIVE' ? 'Hide from students' : 'Make live for students'}</button>
                </div>
              </div>
              {paper.sections.map(s => (
                <div key={s.number} style={{ ...card, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: TYPE_COLOR[paper.type] }}>SECTION {s.number}</div><div style={{ fontSize: 16, fontWeight: 700 }}>{s.description}</div></div>
                  </div>
                  {paper.type === 'LISTENING' && (
                    <div style={{ background: '#f5f3ff', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                      {s.audioUrl ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6', marginBottom: 6 }}>Audio recording</div>
                          <audio controls preload="none" src={s.audioUrl.startsWith('http') ? s.audioUrl : base + s.audioUrl} style={{ width: '100%' }} />
                        </>
                      ) : s.script ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6', marginBottom: 6 }}>No recording yet. Students hear the computer voice.</div>
                          {speaking === s.number
                            ? <button style={btn('danger')} onClick={stopVoice}>Stop</button>
                            : <button style={btn('primary')} onClick={() => playVoice(s.number, s.script)}>Play with the computer voice</button>}
                        </>
                      ) : <div style={{ fontSize: 13, color: C.muted }}>No audio for this section.</div>}
                    </div>
                  )}
                  {s.script && (
                    <details style={{ marginBottom: 12 }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 700, color: C.indigo, fontSize: 14 }}>Transcript</summary>
                      <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.8, background: '#f8fafc', border: `1px solid ${C.line}`, borderRadius: 10, padding: 12 }}>
                        {String(s.script).split('\n').filter(Boolean).map((line, i) => { const m = line.match(/^([A-Za-z ]{2,20}):\s*(.+)$/); return <p key={i} style={{ margin: '0 0 6px' }}>{m ? <><b>{m[1]}:</b> {m[2]}</> : line}</p>; })}
                      </div>
                    </details>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, margin: '4px 0 8px' }}>QUESTIONS AND ANSWERS</div>
                  <Questions groups={s.groups} />
                </div>
              ))}
              {paper.passages.map((ps, i) => (
                <div key={i} style={{ ...card, padding: 18 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{ps.title}</div>
                  <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, lineHeight: 1.8, background: '#f8fafc', border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{ps.text}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, margin: '4px 0 8px' }}>QUESTIONS AND ANSWERS</div>
                  <Questions groups={ps.groups} />
                </div>
              ))}
              {paper.writingTasks.map(t => (
                <div key={t.number} style={{ ...card, padding: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TYPE_COLOR.WRITING }}>TASK {t.number} · at least {t.minWords} words · {t.minutes} min</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginTop: 6 }}>{t.prompt}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Materials({ flash, currentWeek }) {
  const [weeks, setWeeks] = useState(null);
  const [scope, setScope] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => {
    axios.get(`${P}/materials`, api()).then(r => { setWeeks(r.data.groups || []); setScope(r.data.scope); }).catch(e => { flash(errText(e)); setWeeks([]); });
  }, [flash]);
  const open = async (folder, name) => {
    try {
      const r = await axios.get(`${P}/materials/file`, { ...api(), params: { folder, name }, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { flash('Could not open the file. Please try again.'); }
  };
  if (!weeks) return <p style={{ color: C.muted }}>Loading…</p>;
  const term = q.trim().toLowerCase();
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Materials by week</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>{scope && scope !== 'Everything' ? `Showing the materials for ${scope}. ` : ''}This week is open. Tap a week to open it. Open the files on the screen, so there is no need to print the teacher copies.</p>
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search (for example: present simple, reading, hangul)" style={{ ...input, maxWidth: 420 }} />
      {weeks.length === 0 && <div style={{ ...card, padding: 16, color: C.muted }}>Nothing here yet. If this looks wrong, ask the admin to link your login to your teacher name in the Teachers tab.</div>}
      {weeks.map(w => {
        const kinds = w.kinds.map(k => ({ ...k, files: k.files.filter(f => !term || f.title.toLowerCase().includes(term)) })).filter(k => k.files.length);
        if (!kinds.length) return null;
        const isNow = w.week === currentWeek;
        return (
          <details key={w.week} open={isNow || !!term} style={{ ...card, padding: 0 }}>
            <summary style={{ cursor: 'pointer', padding: '14px 16px', fontSize: 18, fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center' }}>
              {w.title}
              {isNow && <span style={{ background: C.indigo, color: '#fff', borderRadius: 50, padding: '1px 9px', fontSize: 12 }}>This week</span>}
              <span style={{ marginLeft: 'auto', color: C.muted, fontSize: 13, fontWeight: 400 }}>{kinds.reduce((n, k) => n + k.files.length, 0)} files</span>
            </summary>
            <div style={{ padding: '0 16px 14px' }}>
              {kinds.map(k => (
                <div key={k.folder} style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.indigo, marginBottom: 4 }}>{k.title}</div>
                  {k.files.map(f => (
                    <div key={f.name} className="pg-row" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 4px', borderTop: `1px solid ${C.line}`, fontSize: 15 }}>
                      <span style={{ flex: 1 }}>{f.title}</span>
                      <span style={{ color: C.muted, fontSize: 12 }}>{f.kb} KB</span>
                      <button onClick={() => open(k.folder, f.name)} style={btn('outline')}>Open</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

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
                {data.hiddenLanguage !== 'EN' && <div style={{ fontSize: 13, color: '#1e2229', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{day.englishFocus}</div>}
                {data.hiddenLanguage !== 'KR' && <div style={{ fontSize: 13, marginTop: 6 }}><b>Korean:</b> {day.koreanFocus}</div>}
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
    const pw = window.prompt('Password for them (leave empty and I will make one):', '');
    if (pw === null) return;
    try {
      const r = await axios.post(`${P}/teachers/${t.id}/login`, { email, password: pw || undefined }, api());
      const text = `Teacher login\nEmail: ${r.data.email}\nPassword: ${r.data.tempPassword}\nSign in at epicielts.live`;
      try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
      window.alert(`${text}\n\n(Copied. Send it to them privately.)`);
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
                    <td style={{ padding: '6px 12px' }}>{t.accountId && <div style={{ fontSize: 12, color: '#166534' }}>Has login{t.email ? `: ${t.email}` : ''}</div>}{isAdmin ? <button style={{ ...btn(), padding: '4px 10px', fontSize: 12 }} onClick={() => makeLogin(t)}>{t.accountId ? 'Reset password' : 'Create login'}</button> : (t.accountId ? '' : '—')}</td>
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

function Progress({ programId, hide }) {
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
          {hide !== 'EN' && <span><span style={{ color: C.indigo }}>■</span> English {s.hours.english} h</span>}
          {hide !== 'KR' && <span><span style={{ color: '#f97316' }}>■</span> Korean {s.hours.korean} h</span>}
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
