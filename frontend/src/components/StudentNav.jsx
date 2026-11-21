import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { getTrack, setTrack } from '../utils/track';
import { T } from '../theme';
import TaskNotifier from './TaskNotifier';

export function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

// Practice is a dropdown: everything students practise with lives inside it.
const PRACTICE = [
  { key: 'learn', label: 'Learn', href: '/learn', active: 'learn', desc: 'Lessons for every skill' },
  { key: 'listening', label: 'Listening practice', href: '/listening-practice', active: 'listening', desc: 'Words, dictation and videos' },
  { key: 'games', label: 'Games', href: '/games', active: 'games', desc: 'Fun spelling and word games' },
  { key: 'everyday', label: 'Day to day English', href: '/everyday', active: 'everyday', generalOnly: true, desc: 'English for daily life' },
  { key: 'ailearn', label: 'AI Learn', href: '/ai-learn', active: 'ailearn', generalOnly: true, desc: 'Practise with the AI tutor' },
];
const NAV = [
  { key: 'dashboard', label: 'Dashboard', href: '/student/dashboard', active: 'dashboard' },
  { key: 'papers', label: 'Papers', href: '/practice', active: 'practice' },
  { key: 'practicemenu', label: 'Practice', menu: true },
  { key: 'exams', label: 'Exam', href: '/exams', active: 'exams' },
  { key: 'levels', label: 'Levels', href: '/levels', active: 'levels', ieltsOnly: true },
];

// Saves the course on the account too, so it is remembered on other devices
export function saveCourse(course) {
  setTrack(course);
  try {
    const u = readUser();
    localStorage.setItem('user', JSON.stringify({ ...u, course }));
  } catch { /* storage blocked */ }
  axios.post(`${API_URL}/api/auth/course`, { course }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).catch(() => {});
}

/** @param {{ active?: 'dashboard' | 'practice' | 'learn' | 'listening' | 'games' | 'exams' | 'levels' | 'placement' | 'everyday' | 'ailearn' | 'messages' | null }} props */
export default function StudentNav({ active = null }) {
  const navigate = useNavigate();
  const user = readUser();
  const nameStr = typeof user.name === 'string' && user.name.trim() ? user.name.trim() : 'Student';
  const initial = nameStr.charAt(0).toUpperCase();
  const emailStr = typeof user.email === 'string' ? user.email : '';

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const practiceRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatarRef = useRef(null);
  const [unread, setUnread] = useState(0);
  const [toAnswer, setToAnswer] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () => axios.get(`${API_URL}/api/chat/unread`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => { if (alive) { setUnread(r.data.unread || 0); setToAnswer(r.data.unanswered || 0); } }).catch(() => {});
    load(); const id = setInterval(load, 30000);
    window.addEventListener('epic-chat-refresh', load);
    return () => { alive = false; clearInterval(id); window.removeEventListener('epic-chat-refresh', load); };
  }, []);
  const mobileBtnRef = useRef(null);
  const mobilePanelRef = useRef(null);

  useEffect(() => {
    function onDocMouseDown(ev) {
      const t = /** @type {Node} */ (ev.target);
      if (avatarRef.current && !avatarRef.current.contains(t)) setAvatarOpen(false);
      if (practiceRef.current && !practiceRef.current.contains(t)) setPracticeOpen(false);
      const inMobile = (mobileBtnRef.current && mobileBtnRef.current.contains(t)) || (mobilePanelRef.current && mobilePanelRef.current.contains(t));
      if (!inMobile) setMobileOpen(false);
    }
    function onKey(ev) {
      if (ev.key === 'Escape') { setAvatarOpen(false); setMobileOpen(false); setPracticeOpen(false); }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const track = getTrack();
  const fit = n => !(n.ieltsOnly && track === 'GENERAL') && !(n.generalOnly && track !== 'GENERAL');
  const links = NAV.filter(fit);
  const practiceLinks = PRACTICE.filter(fit);
  const practiceActive = practiceLinks.some(p => p.active === active);
  const switchTrack = next => {
    if (next === track) return;
    saveCourse(next);
    // Every page refetches for the chosen course
    window.location.reload();
  };

  const go = href => {
    navigate(href);
    setAvatarOpen(false);
    setMobileOpen(false);
    setPracticeOpen(false);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAvatarOpen(false);
    navigate('/');
  };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, fontFamily: T.font, background: '#fff', borderBottom: `1px solid ${T.hairline}` }}>
      <style>{`
        .sn-row { max-width: 1280px; margin: 0 auto; padding: 0 32px; height: 68px; display: flex; align-items: center; gap: 20px; }
        .sn-links { display: flex; align-items: stretch; gap: 4px; height: 100%; }
        .sn-link { position: relative; display: inline-flex; align-items: center; padding: 0 8px; white-space: nowrap; border: 0; background: none; cursor: pointer; font: inherit; font-size: 15px; font-weight: 600; color: ${T.ink}; }
        .sn-link:hover { color: ${T.primary}; }
        .sn-link[aria-current="page"] { color: ${T.primary}; }
        .sn-link[aria-current="page"]::after { content: ''; position: absolute; left: 8px; right: 8px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: ${T.primary}; }
        .sn-burger { display: none; }
        .sn-dm { position: relative; display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px 0 12px; border-radius: 999px; border: 0; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; color: #fff; background: linear-gradient(135deg, ${T.primary}, #6a3df0); box-shadow: 0 2px 8px rgba(0,86,210,.3); transition: transform .12s, box-shadow .12s; }
        .sn-dm:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,86,210,.4); }
        .sn-dm[aria-current="page"] { outline: 2px solid ${T.navy}; outline-offset: 2px; }
        .sn-dm-count { position: absolute; top: -6px; right: -6px; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 10px; background: #ff3040; color: #fff; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px #fff; animation: sn-bump .4s; }
        .sn-dm-dot { position: absolute; top: -3px; right: -3px; width: 12px; height: 12px; border-radius: 50%; background: #ff3040; box-shadow: 0 0 0 2px #fff; }
        @keyframes sn-bump { 0% { transform: scale(.4) } 70% { transform: scale(1.2) } 100% { transform: scale(1) } }
        @media (max-width: 900px) { .sn-dm { padding: 0; width: 40px; justify-content: center; } .sn-dm-label { display: none; } }
        .sn-mobile { display: none; }
        .sn-item { display: block; width: 100%; padding: 10px 16px; font: inherit; font-size: 14px; color: ${T.ink}; background: none; border: 0; cursor: pointer; text-align: left; }
        .sn-item:hover { background: ${T.primaryXSoft}; }
        @media (max-width: 1240px) {
          .sn-links, .sn-track-desktop { display: none; }
          .sn-burger { display: inline-flex; }
          .sn-mobile.open { display: block; border-top: 1px solid ${T.hairline}; padding: 8px 0 12px; }
        }
        @media (max-width: 900px) {
          .sn-row { padding: 0 16px; height: 60px; gap: 12px; }
          .sn-links, .sn-track-desktop { display: none; }
          .sn-burger { display: inline-flex; }
          .sn-mobile.open { display: block; border-top: 1px solid ${T.hairline}; padding: 8px 0 12px; }
          .sn-name { display: none; }
        }
      `}</style>

      <div className="sn-row">
        <button type="button" onClick={() => go('/student/dashboard')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, fontFamily: 'inherit' }}>
          <img src="/logo.png" alt="" style={{ height: 26 }} onError={e => { e.target.style.display = 'none'; }} />
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.2px', color: T.primary }}>EPIC Campus</span>
        </button>

        <div className="sn-track-desktop"><TrackToggle track={track} onChange={switchTrack} /></div>

        <nav className="sn-links" aria-label="Main">
          {links.map(item => (item.menu
            ? <div key={item.key} ref={practiceRef} style={{ position: 'relative', display: 'flex' }}>
              <button type="button" className="sn-link" aria-haspopup="menu" aria-expanded={practiceOpen} aria-current={practiceActive ? 'page' : undefined} onClick={() => setPracticeOpen(o => !o)}>
                {item.label}
                <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" style={{ marginLeft: 6, transform: practiceOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
              </button>
              {practiceOpen && (
                <div role="menu" className="sn-drop" style={{ position: 'absolute', top: 'calc(100% - 4px)', left: 0, minWidth: 260, background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 10, boxShadow: '0 0 4px rgba(15,17,20,0.1), 0 2px 12px 2px rgba(15,17,20,0.1)', padding: 6, zIndex: 200 }}>
                  {practiceLinks.map(p => (
                    <button key={p.key} type="button" role="menuitem" className="sn-item" onClick={() => go(p.href)} style={{ borderRadius: 8, color: active === p.active ? T.primary : T.ink }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{p.label}</div>
                      <div style={{ fontSize: 13, color: T.muted }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            : <button key={item.key} type="button" className="sn-link" aria-current={active === item.active ? 'page' : undefined} onClick={() => go(item.href)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="sn-dm" aria-label={`Messages${unread ? `, ${unread} unread` : ''}`} aria-current={active === 'messages' ? 'page' : undefined} title="Messages" onClick={() => go('/messages')}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 3L10.5 13.5M22 3l-7 18-4.5-7.5L3 9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
            <span className="sn-dm-label">Messages</span>
            {unread > 0 && <span className="sn-dm-count">{unread > 99 ? '99+' : unread}</span>}
            {unread === 0 && toAnswer > 0 && <span className="sn-dm-dot" title={`${toAnswer} question${toAnswer === 1 ? '' : 's'} from your teacher to answer`} />}
          </button>
          <button ref={mobileBtnRef} type="button" className="sn-burger" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(o => !o)}
            style={{ border: `1px solid ${T.hairline}`, background: '#fff', borderRadius: 8, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M0 1h18M0 7h18M0 13h18" stroke={T.ink} strokeWidth="2" /></svg>
          </button>

          <div ref={avatarRef} style={{ position: 'relative' }}>
            <button type="button" aria-haspopup="menu" aria-expanded={avatarOpen} onClick={() => setAvatarOpen(o => !o)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 4, border: 0, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: T.navy, color: '#fff', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{initial}</span>
              <span className="sn-name" style={{ fontSize: 14, fontWeight: 600, color: T.ink, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nameStr}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke={T.muted} strokeWidth="1.6" fill="none" /></svg>
            </button>

            {avatarOpen && (
              <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 240, background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 8, boxShadow: '0 0 4px rgba(15,17,20,0.1), 0 2px 12px 2px rgba(15,17,20,0.1)', overflow: 'hidden', zIndex: 200, padding: '4px 0' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.hairline}`, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{nameStr}</div>
                  {emailStr && <div title={emailStr} style={{ marginTop: 2, fontSize: 12, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emailStr}</div>}
                </div>
                <button type="button" role="menuitem" className="sn-item" onClick={() => go('/choose-course')}>Change course</button>
                <button type="button" role="menuitem" className="sn-item" onClick={() => go('/practice')}>My results</button>
                <div style={{ height: 1, background: T.hairline, margin: '4px 0' }} />
                <button type="button" role="menuitem" className="sn-item" style={{ color: T.error }} onClick={signOut}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={mobilePanelRef} className={`sn-mobile ${mobileOpen ? 'open' : ''}`}>
        <div style={{ padding: '4px 16px 12px' }}><TrackToggle track={track} onChange={switchTrack} /></div>
        <nav aria-label="Mobile main">
          {links.map(item => (item.menu
            ? <div key={item.key}>
              <div style={{ padding: '10px 16px 4px', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: T.mid }}>PRACTICE</div>
              {practiceLinks.map(p => (
                <button key={p.key} type="button" className="sn-item" aria-current={active === p.active ? 'page' : undefined} onClick={() => go(p.href)}
                  style={{ fontSize: 16, fontWeight: 600, paddingLeft: 28, color: active === p.active ? T.primary : T.ink }}>{p.label}</button>
              ))}
            </div>
            : <button key={item.key} type="button" className="sn-item" aria-current={active === item.active ? 'page' : undefined} onClick={() => go(item.href)}
              style={{ fontSize: 16, fontWeight: 600, color: active === item.active ? T.primary : T.ink }}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <TaskNotifier />
    </div>
  );
}

function TrackToggle({ track, onChange }) {
  const opts = [
    { key: 'IELTS', label: 'IELTS' },
    { key: 'GENERAL', label: 'General English' },
  ];
  return (
    <div role="tablist" aria-label="Course" style={{ display: 'inline-flex', padding: 3, borderRadius: 50, background: T.tint, gap: 2 }}>
      {opts.map(o => {
        const on = o.key === track;
        return (
          <button key={o.key} type="button" role="tab" aria-selected={on} onClick={() => onChange(o.key)}
            style={{
              height: 30, padding: '0 14px', borderRadius: 50, border: 0, cursor: on ? 'default' : 'pointer', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', color: on ? '#fff' : T.ink, background: on ? T.navy : 'transparent',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
