import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { api, P, C, btn, input, card, pretty, prettyDate, errText, readUser, Pill, DayView, Materials, TeacherGuide } from './AdminProgram';

// Teacher portal: a short, clean version of the programme tracker for teachers.
// My schedule (what the admin has set), today's class (attendance and notes),
// every IELTS and General English paper with its answers, and the teacher's books.

const todayColombo = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const addDays = (ds, n) => { const d = new Date(`${ds}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const mondayOf = ds => { const d = new Date(`${ds}T00:00:00Z`); return addDays(ds, -((d.getUTCDay() + 6) % 7)); };
const slotOf = t => (t < '13:30' ? 'Morning' : t < '18:00' ? 'Afternoon' : 'Evening');
const recentlyChanged = s => s.updatedAt && s.createdAt && (new Date(s.updatedAt) - new Date(s.createdAt) > 60000) && (Date.now() - new Date(s.updatedAt) < 3 * 86400000) && s.status === 'SCHEDULED';
const SKILL = { READING: ['Reading', '#0056d2', '#e8f0fe'], LISTENING: ['Listening', '#7c3aed', '#f3edff'], WRITING: ['Writing', '#0e9f6e', '#e7f8f1'], SPEAKING: ['Speaking', '#c2410c', '#fff3e8'] };

export default function TeacherPortal() {
  const navigate = useNavigate();
  const user = readUser();
  const [tab, setTab] = useState(() => { try { return sessionStorage.getItem('tp-tab') || 'home'; } catch { return 'home'; } });
  const [mine, setMine] = useState(null);
  const [programId, setProgramId] = useState(null);
  const [data, setData] = useState(null);
  const [all, setAll] = useState(null);
  const [toast, setToast] = useState('');
  const flash = useCallback(m => { setToast(m); window.setTimeout(() => setToast(''), 5000); }, []);

  const load = useCallback(async () => {
    try {
      const [my, list] = await Promise.all([axios.get(`${P}/my`, api()), axios.get(P, api())]);
      setMine(my.data);
      const pid = list.data.programs.find(p => p.status === 'ACTIVE')?.id || list.data.programs[0]?.id || null;
      setProgramId(pid);
      if (pid) {
        const [prog, sess] = await Promise.all([axios.get(`${P}/${pid}`, api()), axios.get(`${P}/${pid}/sessions`, api())]);
        setData(prog.data); setAll(sess.data);
      }
    } catch (e) {
      if (e?.response?.status === 401) { logout(); return; }
      flash(errText(e)); setMine(m => m || { teacher: null, sessions: [] });
    }
  }, [flash]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); const t = window.setInterval(load, 120000); return () => window.clearInterval(t); }, [load]);
  useEffect(() => { try { sessionStorage.setItem('tp-tab', tab); } catch { /* private mode */ } }, [tab]);
  useEffect(() => { document.title = 'Teacher portal · EPIC Campus'; return () => { document.title = 'EPIC IELTS'; }; }, []);

  function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/teacher-login'); }

  const first = String(mine?.teacher?.name || user.name || 'Teacher').split(' ')[0];
  const tabs = [['home', 'Home'], ['schedule', 'My schedule'], ['today', "Today's class"], ['papers', 'Papers & answers'], ['books', 'My books']];

  return (
    <div className="tp" style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif", color: C.text }}>
      <style>{`
        .tp-wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
        .tp-tabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 10px 0; }
        .tp-tabs::-webkit-scrollbar { display: none; }
        .tp-tab { height: 38px; padding: 0 16px; border-radius: 50px; border: 0; background: transparent; color: #334155; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .tp-tab:hover { background: #eef3fb; }
        .tp-tab.on { background: ${C.navy}; color: #fff; }
        .tp-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; }
        .tp-day { background: #fff; border: 1px solid ${C.line}; border-radius: 14px; padding: 10px; min-height: 140px; }
        .tp-day.today { border: 2px solid ${C.indigo}; }
        .tp-day.off { background: #f8fafc; }
        .tp-s { border-radius: 10px; padding: 8px 9px; margin-top: 8px; font-size: 13px; line-height: 1.35; background: #f1f5fb; }
        .tp-s.me { background: #e8f0fe; border-left: 4px solid ${C.indigo}; }
        .tp-s.cx { opacity: .5; text-decoration: line-through; }
        .tp-list { display: grid; gap: 10px; }
        .tp-paper { display: flex; gap: 14px; align-items: center; background: #fff; border: 1px solid ${C.line}; border-radius: 14px; padding: 12px 16px; cursor: pointer; text-align: left; font: inherit; width: 100%; }
        .tp-paper:hover { border-color: ${C.indigo}; box-shadow: 0 4px 16px rgba(0,39,97,.08); }
        .tp-seg { display: inline-flex; background: #e8eef7; border-radius: 50px; padding: 4px; }
        .tp-seg button { border: 0; background: transparent; border-radius: 50px; height: 34px; padding: 0 16px; font: inherit; font-weight: 700; font-size: 14px; color: #334155; cursor: pointer; }
        .tp-seg button.on { background: #fff; color: ${C.navy}; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
        @media (max-width: 900px) { .tp-week { grid-template-columns: minmax(0, 1fr); } .tp-day { min-height: 0; } .tp-day.off { display: none; } }
      `}</style>

      <header style={{ background: C.navy, color: '#fff' }}>
        <div className="tp-wrap" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, opacity: 0.75, fontWeight: 600, letterSpacing: '.04em' }}>EPIC CAMPUS · TEACHER PORTAL</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Hi {first}</div>
          </div>
          <button onClick={() => navigate('/messages')} style={{ ...btn(), background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.6)' }}>Messages</button>
          <button onClick={logout} style={{ ...btn(), background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.6)' }}>Log out</button>
        </div>
      </header>
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0, zIndex: 30 }}>
        <nav className="tp-wrap tp-tabs" role="tablist">
          {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={`tp-tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>)}
        </nav>
      </div>

      <main className="tp-wrap" style={{ padding: '20px 20px 80px' }}>
        {toast && <div role="status" style={{ ...card, padding: '10px 14px', marginBottom: 16, background: '#e3eeff', borderColor: '#b9d2f7', color: '#003b8f', fontSize: 14 }}>{toast}</div>}
        {!mine && <p style={{ color: C.muted }}>Loading…</p>}
        {mine && !mine.teacher && (
          <div style={{ ...card, padding: 20, marginBottom: 16 }}>
            <b>Your login is not linked to a teacher name yet.</b>
            <div style={{ color: C.muted, marginTop: 4 }}>Ask the admin to link it in the Teachers tab. You can still open the papers and answers.</div>
          </div>
        )}
        {mine && tab === 'home' && <Home me={mine.teacher} mine={mine.sessions || []} all={all} data={data} programId={programId} go={setTab} />}
        {mine && tab === 'schedule' && <MySchedule me={mine.teacher} mine={mine.sessions || []} all={all} data={data} />}
        {mine && tab === 'today' && (programId && data ? <DayView programId={programId} data={data} dayNumber={data.todayDay?.dayNumber} flash={flash} isAdmin={false} onChanged={load} goReminders={() => {}} /> : <p style={{ color: C.muted }}>No programme is running.</p>)}
        {mine && tab === 'papers' && <PaperLibrary flash={flash} />}
        {mine && tab === 'books' && <Materials flash={flash} currentWeek={data?.todayDay ? Math.ceil(data.todayDay.dayNumber / 7) : 1} />}
      </main>
    </div>
  );
}

// ─── Home: the important things at a glance ─────────────────────────────────
function Home({ me, mine, all, data, programId, go }) {
  const navigate = useNavigate();
  const today = todayColombo();
  const nowHM = new Date(Date.now() + 330 * 60000).toISOString().slice(11, 16);
  const [results, setResults] = useState(null);
  const [unread, setUnread] = useState({ unread: 0 });
  useEffect(() => {
    if (programId) axios.get(`${P}/${programId}/results`, api()).then(r => setResults(r.data)).catch(() => setResults({ students: [], attempts: [] }));
    axios.get(`${API_URL}/api/chat/unread`, api()).then(r => setUnread(r.data)).catch(() => {});
  }, [programId]);

  const live = mine.filter(s => s.status !== 'CANCELLED' && s.date);
  const upcoming = live.filter(s => s.date > today || (s.date === today && s.endTime > nowHM)).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const next = upcoming[0];
  const nowClass = next && next.date === today && next.startTime <= nowHM;
  const wk = mondayOf(today), wkEnd = addDays(wk, 6);
  const thisWeek = live.filter(s => s.date >= wk && s.date <= wkEnd);
  const done = live.filter(s => s.status === 'DONE').length;
  const needNotes = live.filter(s => s.status === 'SCHEDULED' && (s.date < today || (s.date === today && s.endTime <= nowHM))).length;
  const students = (data?.program?.students || []).filter(x => x.active).length;
  const dayNo = data?.todayDay?.dayNumber; const total = data?.program?.days?.length || 0;
  const dateOfDay = new Map((data?.program?.days || []).map(d => [d.dayNumber, d.date]));
  const todayAll = (all || []).filter(s => s.subject !== 'BREAK' && s.status !== 'CANCELLED' && dateOfDay.get(s.dayNumber) === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const recent = (results?.attempts || []).filter(a => a.endedAt).sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt)).slice(0, 6);
  const weekPcts = (results?.attempts || []).filter(a => a.pct != null && a.endedAt && a.endedAt.slice(0, 10) >= wk).map(a => a.pct);
  const weekAvg = weekPcts.length ? Math.round(weekPcts.reduce((x, y) => x + y, 0) / weekPcts.length) : null;
  const untilText = s => {
    const mins = Math.round((new Date(`${s.date}T${s.startTime}:00+05:30`) - Date.now()) / 60000);
    if (mins <= 0) return 'Happening now';
    if (mins < 60) return `Starts in ${mins} min`;
    if (mins < 24 * 60) return `Starts in ${Math.round(mins / 60)} h`;
    const d = Math.round((new Date(`${s.date}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)) / 86400000);
    return d === 1 ? 'Tomorrow' : `In ${d} days`;
  };
  const tile = (k, v, sub, color, onClick) => (
    <button type="button" onClick={onClick} disabled={!onClick} style={{ textAlign: 'left', font: 'inherit', cursor: onClick ? 'pointer' : 'default', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px', borderTop: `4px solid ${color}`, color: C.text }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.muted }}>{k}</div>
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginTop: 2 }}>{v}</div>
      <div style={{ fontSize: 13, color: C.muted }}>{sub}</div>
    </button>
  );
  const pc = v => (v == null ? C.muted : v >= 75 ? '#0e9f6e' : v >= 50 ? '#b45309' : '#dc2626');

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ color: C.muted, fontSize: 14.5 }}>{prettyDate(today)}{dayNo ? ` · Day ${dayNo} of ${total} · Week ${Math.ceil(dayNo / 7)}` : ' · No class day today'}{data?.todayDay?.theme ? ` · ${data.todayDay.theme}` : ''}</div>

      <div style={{ background: nowClass ? 'linear-gradient(135deg,#0e9f6e,#047857)' : 'linear-gradient(135deg,#002761,#0056d2)', color: '#fff', borderRadius: 18, padding: '20px 22px', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, letterSpacing: '.05em' }}>{nowClass ? 'YOUR CLASS IS NOW' : 'YOUR NEXT CLASS'}</div>
          {next ? (
            <>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>{next.date === today ? 'Today' : prettyDate(next.date)} · {pretty(next.startTime)} to {pretty(next.endTime)}</div>
              <div style={{ fontSize: 16, opacity: 0.92, marginTop: 2 }}>{next.title}</div>
            </>
          ) : <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{me ? 'No classes scheduled yet' : 'Your login is not linked to a teacher yet'}</div>}
        </div>
        {next && <div style={{ background: 'rgba(255,255,255,.16)', borderRadius: 50, padding: '8px 16px', fontWeight: 700, fontSize: 15 }}>{untilText(next)}</div>}
        {next && next.date === today && <button type="button" onClick={() => go('today')} style={{ height: 42, padding: '0 18px', borderRadius: 50, border: 0, background: '#fff', color: C.navy, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Take attendance</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        {tile('This week', thisWeek.length, thisWeek.length === 1 ? 'class for you' : 'classes for you', C.indigo, () => go('schedule'))}
        {tile('Classes done', done, `of ${live.length} in the programme`, '#0e9f6e', () => go('schedule'))}
        {tile('Students', students || '-', 'in this batch', '#7c3aed')}
        {tile('Class average', weekAvg != null ? `${weekAvg}%` : '-', weekPcts.length ? `${weekPcts.length} papers this week` : 'no papers this week yet', pc(weekAvg))}
        {tile('Messages', unread.unread || 0, unread.unread ? 'unread' : 'all read', '#f59e0b', () => navigate('/messages'))}
      </div>

      {needNotes > 0 && (
        <div style={{ ...card, padding: '12px 16px', background: '#fff8eb', borderColor: '#f5d9a8', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: 220, color: '#7c4a03' }}><b>{needNotes} finished {needNotes === 1 ? 'class needs' : 'classes need'} attendance or notes.</b> Open the class and press Mark done.</span>
          <button style={btn()} onClick={() => go('today')}>Open today's class</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><b style={{ fontSize: 17 }}>Your upcoming classes</b><button onClick={() => go('schedule')} style={{ border: 0, background: 'none', color: C.indigo, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Full schedule ›</button></div>
          {!upcoming.length && <p style={{ color: C.muted, margin: '10px 0 0' }}>Nothing coming up yet. The admin will send your timetable.</p>}
          {upcoming.slice(0, 5).map(s => (
            <div key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${C.line}`, marginTop: 8 }}>
              <div style={{ width: 46, textAlign: 'center', flex: 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.indigo, textTransform: 'uppercase' }}>{s.date === today ? 'Today' : prettyDate(s.date).split(' ')[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{s.date.slice(8).replace(/^0/, '')}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{pretty(s.startTime)} to {pretty(s.endTime)}</div>
                <div style={{ fontSize: 14, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
              </div>
              {recentlyChanged(s) && <span style={chg}>Changed</span>}
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: 18 }}>
          <b style={{ fontSize: 17 }}>Today at the campus</b>
          {!todayAll.length && <p style={{ color: C.muted, margin: '10px 0 0' }}>No classes today.</p>}
          {todayAll.map(s => {
            const isMe = me && s.teacherId === me.id;
            const on = s.startTime <= nowHM && nowHM < s.endTime;
            return (
              <div key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${C.line}`, marginTop: 8 }}>
                <div style={{ width: 92, flex: 'none', fontSize: 13, color: C.muted }}>{slotOf(s.startTime)}<div style={{ color: C.text, fontWeight: 700 }}>{pretty(s.startTime)}</div></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: isMe ? C.indigo : C.muted, fontWeight: isMe ? 700 : 400 }}>{isMe ? 'You' : s.teacher?.name || 'No teacher yet'}</div>
                </div>
                {on ? <span style={{ fontSize: 11.5, fontWeight: 800, color: '#047857', background: '#dcfce7', borderRadius: 50, padding: '2px 9px' }}>Now</span> : s.status === 'DONE' ? <span style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>Done ✓</span> : null}
              </div>
            );
          })}
        </div>

        <div style={{ ...card, padding: 18 }}>
          <b style={{ fontSize: 17 }}>Latest papers from students</b>
          {!results && <p style={{ color: C.muted, margin: '10px 0 0' }}>Loading…</p>}
          {results && !recent.length && <p style={{ color: C.muted, margin: '10px 0 0' }}>No papers finished yet.</p>}
          {recent.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${C.line}`, marginTop: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, textTransform: 'capitalize' }}>{String(a.studentName).toLowerCase()}</div>
                <div style={{ fontSize: 13, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: pc(a.pct) }}>{a.pct != null ? `${a.pct}%` : a.band != null ? `Band ${a.band}` : a.state === 'marking' ? <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>Marking…</span> : '-'}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── My schedule: next class, then the week (only me or everyone) ─────────────
function MySchedule({ me, mine, all, data }) {
  const today = todayColombo();
  const [week, setWeek] = useState(() => mondayOf(today));
  const [who, setWho] = useState('me');
  const dateOfDay = useMemo(() => new Map((data?.program?.days || []).map(d => [d.dayNumber, d.date])), [data]);
  const dayOfDate = useMemo(() => new Map((data?.program?.days || []).map(d => [d.date, d])), [data]);
  const list = useMemo(() => {
    const src = who === 'me' || !all ? mine : all.filter(s => s.subject !== 'BREAK').map(s => ({ ...s, date: dateOfDay.get(s.dayNumber) }));
    return src.filter(s => s.date);
  }, [who, all, mine, dateOfDay]);
  const nowHM = new Date(Date.now() + 330 * 60000).toISOString().slice(11, 16);
  const next = mine.filter(s => s.status !== 'CANCELLED' && s.date && (s.date > today || (s.date === today && s.endTime > nowHM)))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const count = mine.filter(s => s.status !== 'CANCELLED' && days.includes(s.date)).length;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ ...card, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', background: next ? '#fff' : '#f8fafc' }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: '#e8f0fe', color: C.indigo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 800, lineHeight: 1 }}>
          {next ? <><span style={{ fontSize: 11, textTransform: 'uppercase' }}>{prettyDate(next.date).split(' ')[0]}</span><span style={{ fontSize: 22 }}>{next.date.slice(8).replace(/^0/, '')}</span></> : '—'}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>YOUR NEXT CLASS</div>
          {next ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{next.date === today ? 'Today' : prettyDate(next.date)} · {pretty(next.startTime)} to {pretty(next.endTime)}</div>
              <div style={{ fontSize: 15, color: '#334155', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><Pill subject={next.subject} /> {next.title}{recentlyChanged(next) && <span style={chg}>Changed</span>}</div>
            </>
          ) : <div style={{ fontSize: 17, fontWeight: 600 }}>{me ? 'Nothing scheduled yet. The admin will send your timetable.' : 'No schedule yet.'}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 300px' }}>
        <button style={btn()} onClick={() => setWeek(w => addDays(w, -7))} aria-label="Previous week">‹</button>
        <div style={{ fontWeight: 700, fontSize: 16, flex: '0 1 230px', textAlign: 'center' }}>{week === mondayOf(today) ? 'This week' : `Week of ${prettyDate(week)}`}<div style={{ fontSize: 12.5, color: C.muted, fontWeight: 400 }}>{prettyDate(days[0])} to {prettyDate(days[6])} · you have {count} {count === 1 ? 'class' : 'classes'}</div></div>
        <button style={btn()} onClick={() => setWeek(w => addDays(w, 7))} aria-label="Next week">›</button>
        {week !== mondayOf(today) && <button style={{ ...btn(), border: 0, color: C.indigo }} onClick={() => setWeek(mondayOf(today))}>This week</button>}
        </div>
        <div className="tp-seg" style={{ marginLeft: 'auto' }}>
          <button className={who === 'me' ? 'on' : ''} onClick={() => setWho('me')}>Only me</button>
          <button className={who === 'all' ? 'on' : ''} onClick={() => setWho('all')} disabled={!all}>Whole timetable</button>
        </div>
      </div>

      <div className="tp-week">
        {days.map(ds => {
          const pd = dayOfDate.get(ds);
          const items = list.filter(s => s.date === ds).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <div key={ds} className={`tp-day${ds === today ? ' today' : ''}${!pd && !items.length ? ' off' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <b style={{ fontSize: 14, color: ds === today ? C.indigo : C.text }}>{ds === today ? 'Today' : prettyDate(ds).split(' ')[0]}</b>
                <span style={{ fontSize: 12, color: C.muted }}>{prettyDate(ds).split(' ').slice(1).join(' ')}</span>
              </div>
              {!items.length && <div style={{ fontSize: 12.5, color: C.faint, marginTop: 8 }}>{pd ? (who === 'me' ? 'No class for you' : 'No classes') : 'No class day'}</div>}
              {items.map(s => {
                const isMe = me && s.teacherId === me.id;
                return (
                  <div key={s.id} className={`tp-s${isMe ? ' me' : ''}${s.status === 'CANCELLED' ? ' cx' : ''}`}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.03em' }}>{slotOf(s.startTime)}</div>
                    <div style={{ fontWeight: 700 }}>{pretty(s.startTime)} – {pretty(s.endTime)}</div>
                    <div>{s.title}</div>
                    {who === 'all' && <div style={{ fontSize: 12, color: isMe ? C.indigo : C.muted, fontWeight: isMe ? 700 : 400 }}>{isMe ? 'You' : s.teacher?.name || 'No teacher yet'}</div>}
                    {s.status === 'DONE' && <div style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>Done ✓</div>}
                    {recentlyChanged(s) && <span style={{ ...chg, marginTop: 4, display: 'inline-block' }}>Changed</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: C.muted }}>The admin sets the timetable. When it changes, it updates here and you get a message.</p>
    </div>
  );
}
const chg = { fontSize: 11, fontWeight: 800, color: '#9a3412', background: '#ffedd5', borderRadius: 50, padding: '1px 8px' };

// ─── Papers & answers: every IELTS and General English paper, opened as a teacher copy ─
function PaperLibrary({ flash }) {
  const [track, setTrack] = useState(() => { try { return localStorage.getItem('tp-track') || 'GENERAL'; } catch { return 'GENERAL'; } });
  const [lists, setLists] = useState({});
  const [skill, setSkill] = useState('ALL');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  useEffect(() => { try { localStorage.setItem('tp-track', track); } catch { /* private mode */ } }, [track]);
  useEffect(() => {
    if (lists[track]) return;
    axios.get(`${P}/paper-review`, { ...api(), params: { track } }).then(r => setLists(l => ({ ...l, [track]: r.data }))).catch(e => { flash(errText(e)); setLists(l => ({ ...l, [track]: [] })); });
  }, [track, lists, flash]);
  const view = async p => {
    setBusy(p.id);
    try { setOpen((await axios.get(`${P}/paper-review/${p.id}`, api())).data); } catch (e) { flash(errText(e)); }
    setBusy(null);
  };
  const list = lists[track];
  const term = q.trim().toLowerCase();
  const shown = (list || []).filter(p => p.type !== 'SPEAKING' && (skill === 'ALL' || p.type === skill) && (!term || `${p.title} ${p.code} ${p.topic || ''}`.toLowerCase().includes(term)));

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 22 }}>Papers and answers</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>Open any paper to see the text, the questions and the correct answers. Yellow shows where each answer is. You can print it.</p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tp-seg">
          <button className={track === 'IELTS' ? 'on' : ''} onClick={() => setTrack('IELTS')}>IELTS</button>
          <button className={track === 'GENERAL' ? 'on' : ''} onClick={() => setTrack('GENERAL')}>General English</button>
        </div>
        <div className="tp-seg">
          {[['ALL', 'All'], ['READING', 'Reading'], ['LISTENING', 'Listening'], ['WRITING', 'Writing']].map(([k, l]) => <button key={k} className={skill === k ? 'on' : ''} onClick={() => setSkill(k)}>{l}</button>)}
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a paper" aria-label="Search a paper" style={{ ...input, height: 42, borderRadius: 50, padding: '0 16px', fontSize: 14, flex: '1 1 200px', maxWidth: 320 }} />
      </div>
      {!list && <p style={{ color: C.muted }}>Loading…</p>}
      {list && !shown.length && <div style={{ ...card, padding: 18, color: C.muted }}>No papers match.</div>}
      <div className="tp-list">
        {shown.map(p => {
          const [label, fg, bg] = SKILL[p.type] || ['Paper', C.muted, '#eef2f7'];
          return (
            <button key={p.id} type="button" className="tp-paper" onClick={() => view(p)}>
              <span style={{ flex: 'none', width: 86, textAlign: 'center', background: bg, color: fg, fontWeight: 800, fontSize: 12.5, borderRadius: 50, padding: '4px 0' }}>{label}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 15.5 }}>{p.title}</b>
                <span style={{ fontSize: 13, color: C.muted }}>{p.type === 'WRITING' ? 'Writing tasks' : `${p.questions} questions`}{p.minutes ? ` · ${p.minutes} min` : ''}{p.topic ? ` · ${p.topic}` : ''}{p.status === 'DRAFT' ? ' · hidden from students' : ''}</span>
              </span>
              <span style={{ flex: 'none', fontWeight: 700, color: C.indigo, fontSize: 14 }}>{busy === p.id ? 'Opening…' : 'Open with answers ›'}</span>
            </button>
          );
        })}
      </div>
      {open && <TeacherGuide paper={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
