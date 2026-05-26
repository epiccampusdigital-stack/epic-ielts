import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  { key: 'levels', label: 'Programme', href: '/levels', active: 'levels' },
  { key: 'placement', label: 'Placement', href: '/placement-test', active: 'placement' },
];

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
      if (avatarRef.current && !avatarRef.current.contains(t)) {
        setAvatarOpen(false);
      }
      const inMobile =
        (mobileBtnRef.current && mobileBtnRef.current.contains(t)) ||
        (mobilePanelRef.current && mobilePanelRef.current.contains(t));
      if (!inMobile) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  useEffect(() => {
    function onKey(ev) {
      if (ev.key === 'Escape') {
        setAvatarOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

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
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <style>{`
        .sn-top-row {
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
        }
        .sn-desktop-links {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .sn-hamburger-btn { display: none !important; }
        .sn-mobile-slide {
          display: none !important;
          overflow: hidden;
          max-height: 0;
          transition: max-height 200ms ease-out;
          background: white;
          border-bottom: 1px solid #E2E8F0;
        }
        .sn-mobile-slide.sn-mobile-open {
          max-height: 280px;
        }
        @media (max-width: 767px) {
          .sn-center-slot .sn-desktop-links { display: none !important; }
          .sn-hamburger-btn { display: inline-flex !important; }
          .sn-mobile-slide { display: block !important; }
        }
        @media (max-width: 639px) {
          .sn-avatar-name { display: none !important; }
        }
      `}</style>

      {/* Top row: logo · centre · avatar */}
      <div className="sn-top-row">
        <button
          type="button"
          onClick={() => go('/student/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            fontFamily: 'inherit',
          }}
        >
          <img src="/logo.png" alt="" style={{ height: 28 }} onError={e => { e.target.style.display = 'none'; }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.02em', color: '#0F172A' }}>EPIC IELTS</span>
        </button>

        <div
          className="sn-center-slot"
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <nav className="sn-desktop-links" aria-label="Main">
            {NAV.map(item => {
              const isAct = active === item.active;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-current={isAct ? 'page' : undefined}
                  onClick={() => go(item.href)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
                    color: isAct ? '#4F46E5' : '#475569',
                    background: isAct ? 'rgba(79,70,229,0.08)' : 'transparent',
                  }}
                  onMouseEnter={ev => {
                    if (!isAct) {
                      ev.currentTarget.style.background = '#F1F5F9';
                      ev.currentTarget.style.color = '#0F172A';
                    }
                  }}
                  onMouseLeave={ev => {
                    if (!isAct) {
                      ev.currentTarget.style.background = 'transparent';
                      ev.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            ref={mobileBtnRef}
            type="button"
            className="sn-hamburger-btn"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 8,
              fontSize: 24,
              lineHeight: 1,
              color: '#475569',
              fontFamily: 'inherit',
            }}
          >
            ☰
          </button>
        </div>

        <div ref={avatarRef} style={{ position: 'relative', flexShrink: 0, marginLeft: 'auto' }}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={avatarOpen}
            onClick={() => setAvatarOpen(o => !o)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px 6px 6px',
              border: '1px solid #E2E8F0',
              borderRadius: 9999,
              background: 'white',
              cursor: 'pointer',
              transition: 'border-color 120ms, background 120ms',
              fontFamily: 'inherit',
            }}
            onMouseEnter={ev => {
              ev.currentTarget.style.borderColor = '#CBD5E1';
              ev.currentTarget.style.background = '#F8FAFC';
            }}
            onMouseLeave={ev => {
              ev.currentTarget.style.borderColor = '#E2E8F0';
              ev.currentTarget.style.background = 'white';
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {initial}
            </span>
            <span
              className="sn-avatar-name"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 120,
              }}
            >
              {nameStr}
            </span>
            <span style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1 }} aria-hidden="true">
              ⌄
            </span>
          </button>

          {avatarOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: 220,
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                boxShadow: '0 10px 30px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.04)',
                overflow: 'hidden',
                zIndex: 200,
              }}
            >
              <div style={{ borderBottom: '1px solid #F1F5F9', padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{nameStr}</div>
                {emailStr ? (
                  <div
                    title={emailStr}
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontWeight: 400,
                      color: '#64748B',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {emailStr}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                role="menuitem"
                style={dropdownItemNeutral()}
                onMouseEnter={ev => {
                  ev.currentTarget.style.background = '#F8FAFC';
                  ev.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={ev => {
                  ev.currentTarget.style.background = 'none';
                  ev.currentTarget.style.color = '#475569';
                }}
                onClick={() => go('/practice')}
              >
                📊&nbsp;&nbsp;My results
              </button>
              <button
                type="button"
                role="menuitem"
                style={dropdownItemNeutral()}
                onMouseEnter={ev => {
                  ev.currentTarget.style.background = '#F8FAFC';
                  ev.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={ev => {
                  ev.currentTarget.style.background = 'none';
                  ev.currentTarget.style.color = '#475569';
                }}
                onClick={() => {
                  setAvatarOpen(false);
                  // COMING_SOON: dedicated Settings
                  alert('Coming soon');
                }}
              >
                ⚙️&nbsp;&nbsp;Settings
              </button>
              <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
              <button
                type="button"
                role="menuitem"
                style={{
                  ...dropdownItemNeutral(),
                  color: '#DC2626',
                }}
                onMouseEnter={ev => {
                  ev.currentTarget.style.background = '#FEF2F2';
                }}
                onMouseLeave={ev => {
                  ev.currentTarget.style.background = 'none';
                }}
                onClick={signOut}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full-width slide-down (mobile); kept in DOM hidden on desktop */}
      <div ref={mobilePanelRef} className={`sn-mobile-slide ${mobileOpen ? 'sn-mobile-open' : ''}`}>
        <nav aria-label="Mobile main">
          {NAV.map((item, idx) => {
            const isAct = active === item.active;
            const isLast = idx === NAV.length - 1;
            return (
              <button
                key={item.key}
                type="button"
                aria-current={isAct ? 'page' : undefined}
                onClick={() => go(item.href)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  color: isAct ? '#4F46E5' : '#475569',
                  borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function dropdownItemNeutral() {
  return {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#475569',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 120ms, color 120ms',
    fontFamily: 'Inter, system-ui, sans-serif',
  };
}
