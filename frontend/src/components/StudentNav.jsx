import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { getTrack, setTrack } from '../utils/track';
import { T } from '../theme';

export function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

const NAV = [
  { key: 'dashboard', label: 'Dashboard', href: '/student/dashboard', active: 'dashboard' },
  { key: 'practice', label: 'Practice', href: '/practice', active: 'practice' },
  { key: 'learn', label: 'Learn', href: '/learn', active: 'learn' },
  { key: 'levels', label: 'Levels', href: '/levels', active: 'levels', ieltsOnly: true },
  { key: 'placement', label: 'Placement test', href: '/placement-test', active: 'placement' },
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

/** @param {{ active?: 'dashboard' | 'practice' | 'learn' | 'levels' | 'placement' | null }} props */
export default function StudentNav({ active = null }) {
  const navigate = useNavigate();
  const user = readUser();
  const nameStr = typeof user.name === 'string' && user.name.trim() ? user.name.trim() : 'Student';
  const initial = nameStr.charAt(0).toUpperCase();
  const emailStr = typeof user.email === 'string' ? user.email : '';

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatarRef = useRef(null);
  const mobileBtnRef = useRef(null);
  const mobilePanelRef = useRef(null);

  useEffect(() => {
    function onDocMouseDown(ev) {
      const t = /** @type {Node} */ (ev.target);
      if (avatarRef.current && !avatarRef.current.contains(t)) setAvatarOpen(false);
      const inMobile = (mobileBtnRef.current && mobileBtnRef.current.contains(t)) || (mobilePanelRef.current && mobilePanelRef.current.contains(t));
      if (!inMobile) setMobileOpen(false);
    }
    function onKey(ev) {
      if (ev.key === 'Escape') { setAvatarOpen(false); setMobileOpen(false); }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const track = getTrack();
  const links = NAV.filter(n => !(n.ieltsOnly && track === 'GENERAL'));
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
        .sn-link { position: relative; display: inline-flex; align-items: center; padding: 0 10px; border: 0; background: none; cursor: pointer; font: inherit; font-size: 16px; font-weight: 600; color: ${T.ink}; }
        .sn-link:hover { color: ${T.primary}; }
        .sn-link[aria-current="page"] { color: ${T.primary}; }
        .sn-link[aria-current="page"]::after { content: ''; position: absolute; left: 10px; right: 10px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: ${T.primary}; }
        .sn-burger { display: none; }
        .sn-mobile { display: none; }
        .sn-item { display: block; width: 100%; padding: 10px 16px; font: inherit; font-size: 14px; color: ${T.ink}; background: none; border: 0; cursor: pointer; text-align: left; }
        .sn-item:hover { background: ${T.primaryXSoft}; }
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
          {links.map(item => (
            <button key={item.key} type="button" className="sn-link" aria-current={active === item.active ? 'page' : undefined} onClick={() => go(item.href)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
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
          {links.map(item => (
            <button key={item.key} type="button" className="sn-item" aria-current={active === item.active ? 'page' : undefined} onClick={() => go(item.href)}
              style={{ fontSize: 16, fontWeight: 600, color: active === item.active ? T.primary : T.ink }}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
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
