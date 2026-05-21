import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import AgentWidget from '../components/AgentWidget';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '176832951489-8e1f4h848679ur3ci27ccpkv5upi6aci.apps.googleusercontent.com';

/**
 * Marketing poster slot.
 * Set to an image URL string to display a promo on the login page.
 * Set to null to show the default content (free access callout + bullets).
 *
 * Later this will be replaced with an API call to fetch the active promo
 * from the database, but the rest of the component will remain identical.
 *
 * Image guidance:
 *   - Portrait orientation (around 720x1080 ideal)
 *   - JPG, PNG, or WebP
 *   - Object-fit: contain, so it never crops. Letterbox if landscape.
 */
const LOGIN_PROMO = {
  image: null,           // e.g. '/promos/korean-scholarship.jpg' or full Cloudinary URL
  alt: 'Marketing poster',
};

const DEFAULT_BULLETS = [
  { emoji: '🎯', bg: '#DBEAFE', label: 'Real exam conditions', sub: 'Strict CBT timing and authentic test flow' },
  { emoji: '🤖', bg: '#F3E8FF', label: 'AI examiner feedback', sub: 'Personalised analysis after every test' },
  { emoji: '📈', bg: '#DCFCE7', label: 'Track all 4 skills', sub: 'Reading, Writing, Listening & Speaking' },
];

const COMPACT_BULLETS = [
  { emoji: '🎯', bg: '#DBEAFE', label: 'Real exam conditions' },
  { emoji: '🤖', bg: '#F3E8FF', label: 'AI examiner feedback' },
  { emoji: '📈', bg: '#DCFCE7', label: 'Track all 4 skills' },
];

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [settings] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    return saved ? JSON.parse(saved) : { siteName: 'EPIC IELTS', logoUrl: '/logo.png' };
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signup, setSignup] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    address: '', age: '', city: '', phone: '', expectedBand: ''
  });

  const logoUrl = settings.logoUrl || '/logo.png';
  const siteName = settings.siteName || 'EPIC IELTS';
  const posterMode = Boolean(LOGIN_PROMO.image);

  const finishLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.role === 'ADMIN' || user.role === 'TEACHER') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  useEffect(() => {
    const loadGoogle = () => {
      if (!window.google || !GOOGLE_CLIENT_ID) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/api/auth/google`, {
              credential: response.credential
            });
            finishLogin(res.data.token, res.data.user);
          } catch (err) {
            setError(err.response?.data?.error || 'Google login failed. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      });
      const btn = document.getElementById('google-btn');
      if (btn) {
        btn.innerHTML = '';
        window.google.accounts.id.renderButton(btn, {
          theme: 'outline', size: 'large', width: 400,
          text: 'continue_with', shape: 'rectangular'
        });
      }
    };
    if (!document.getElementById('google-script')) {
      const script = document.createElement('script');
      script.id = 'google-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = loadGoogle;
      document.body.appendChild(script);
    } else {
      loadGoogle();
    }
  }, [mode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: loginEmail, password: loginPassword
      });
      finishLogin(res.data.token, res.data.user);
    } catch (err) {
      if (err.response?.data?.error === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
      } else {
        setError(err.response?.data?.error || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (signup.password !== signup.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signup.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, {
        name: signup.name,
        email: signup.email,
        password: signup.password,
        address: signup.address,
        age: signup.age,
        city: signup.city,
        phone: signup.phone,
        expectedBand: signup.expectedBand
      });
      setMode('login');
      setError('');
      setLoginEmail(signup.email);
      alert('Account created! Please check your email and click the verification link before logging in.');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSignup = (field, value) => {
    setSignup(prev => ({ ...prev, [field]: value }));
  };

  const handleForgotPassword = () => {
    alert("Forgot password? Email epicampus.lk@gmail.com for help — we'll add a self-serve reset soon.");
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#0F172A',
    marginBottom: 6,
  };

  const inputStyle = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    fontSize: 14,
    fontWeight: 400,
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    outline: 'none',
    color: '#0F172A',
    background: '#FFFFFF',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 180ms, box-shadow 180ms',
  };

  const sectionLabelStyle = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#4F46E5',
    marginBottom: 14,
  };

  const renderBrandHeader = (compact = false) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 10 : 12 }}>
        <img
          src={logoUrl}
          alt="Logo"
          style={{ height: compact ? 32 : 40, width: 'auto', objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <span style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
          {siteName}
        </span>
      </div>
      <p style={{
        marginTop: compact ? 4 : 6,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#475569',
      }}>
        WE CREATE YOUR FUTURE
      </p>
    </div>
  );

  const renderCompactBullet = (bullet) => (
    <div key={bullet.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: 24, height: 24, borderRadius: '50%', background: bullet.bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>
        {bullet.emoji}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>{bullet.label}</span>
    </div>
  );

  const renderFullBullet = (bullet) => (
    <div key={bullet.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{
        width: 32, height: 32, borderRadius: '50%', background: bullet.bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {bullet.emoji}
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{bullet.label}</div>
        <div style={{ fontSize: 13, fontWeight: 400, color: '#475569', marginTop: 2, lineHeight: 1.5 }}>
          {bullet.sub}
        </div>
      </div>
    </div>
  );

  const renderGoogleSection = (dividerText) => (
    <>
      <div className="google-btn-wrap">
        <div id="google-btn" />
        {loading && (
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#475569', marginTop: 8 }}>
            {mode === 'login' ? 'Signing in...' : 'Signing in...'}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
        <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', whiteSpace: 'nowrap' }}>
          {dividerText}
        </span>
        <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #FFFFFF; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .login-container {
            flex-direction: row;
            height: 100vh;
            overflow: hidden;
          }
        }
        .left-panel {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 32px 24px;
          background: linear-gradient(135deg, #E0E7FF 0%, #EDE9FE 100%);
        }
        @media (min-width: 1024px) {
          .left-panel {
            width: 50%;
            height: 100vh;
            padding: 64px 48px;
          }
        }
        @media (max-width: 1023px) {
          .left-panel {
            height: auto;
            min-height: unset;
            flex-shrink: 0;
          }
          .left-panel-footer { display: none; }
        }
        @media (max-width: 639px) {
          .left-panel { display: none; }
        }
        .left-panel-middle { display: none; }
        @media (min-width: 1024px) {
          .left-panel-middle {
            display: flex;
            align-items: center;
            flex: 1;
            padding: 32px 0;
          }
        }
        .right-panel {
          position: relative;
          background: #FFFFFF;
          min-height: 100vh;
          overflow: auto;
          padding: 32px 24px;
          flex: 1;
        }
        @media (min-width: 1024px) {
          .right-panel {
            width: 50%;
            height: 100vh;
            padding: 64px;
          }
        }
        .mobile-brand-header { display: none; }
        @media (max-width: 639px) {
          .mobile-brand-header { display: block; margin-bottom: 24px; }
        }
        .system-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          background: #ECFDF5;
        }
        @media (min-width: 1024px) {
          .system-badge { top: 32px; right: 32px; }
        }
        .form-inner {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 48px;
          padding-bottom: 32px;
        }
        @media (min-width: 1024px) {
          .form-inner { padding-top: 0; }
        }
        .mode-tab {
          flex: 1;
          padding: 12px 0;
          text-align: center;
          cursor: pointer;
          border: none;
          background: none;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          border-bottom: 2px solid transparent;
          transition: all 180ms;
        }
        .mode-tab.active {
          color: #4F46E5;
          border-bottom-color: #4F46E5;
          font-weight: 600;
        }
        .mode-tab:not(.active) {
          color: #94A3B8;
          font-weight: 500;
        }
        .mode-tab:not(.active):hover { color: #0F172A; }
        .epic-input:focus {
          border-color: #4F46E5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12) !important;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #4F46E5;
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 180ms;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .submit-btn:hover:not(:disabled) { background: #4338CA; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .forgot-btn {
          background: none;
          border: none;
          padding: 0;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #4F46E5;
          cursor: pointer;
        }
        .forgot-btn:hover { text-decoration: underline; }
        .google-btn-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 20px;
        }
        #google-btn {
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: 400px;
        }
        .signup-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 480px) {
          .signup-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="login-container">

        {/* LEFT PANEL — brand / promo */}
        <div className="left-panel">
          <svg
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35 }}
            aria-hidden
          >
            <defs>
              <radialGradient id="loginBlob1" cx="0%" cy="0%" r="60%">
                <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="loginBlob2" cx="100%" cy="100%" r="50%">
                <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#loginBlob1)" />
            <rect width="100%" height="100%" fill="url(#loginBlob2)" />
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {renderBrandHeader()}
          </div>

          <div className="left-panel-middle" style={{ position: 'relative', zIndex: 1 }}>
            {posterMode ? (
              <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
                <img
                  src={LOGIN_PROMO.image}
                  alt={LOGIN_PROMO.alt}
                  style={{
                    width: '100%',
                    maxHeight: 480,
                    objectFit: 'contain',
                    borderRadius: 16,
                    boxShadow: '0 10px 40px rgba(15,23,42,0.10)',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {COMPACT_BULLETS.map(renderCompactBullet)}
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', maxWidth: 480 }}>
                <p style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#4338CA',
                }}>
                  COMPUTER BASED TEST PLATFORM
                </p>

                <h2 style={{ marginTop: 12, fontSize: 32, fontWeight: 700, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                  Prepare smarter.
                </h2>
                <h2 style={{ marginTop: 4, fontSize: 32, fontWeight: 700, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                  Score higher.
                </h2>

                <div style={{
                  marginTop: 32,
                  background: '#FFFFFF',
                  border: '1px solid #FCD34D',
                  borderRadius: 16,
                  padding: 20,
                  maxWidth: 360,
                  boxShadow: '0 4px 20px rgba(217,119,6,0.10)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🎁</span>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#B45309' }}>
                      FREE PLACEMENT TEST
                    </span>
                  </div>
                  <p style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                    1 free exam per skill
                  </p>
                  <p style={{ marginTop: 4, fontSize: 13, fontWeight: 500, color: '#475569' }}>
                    Unlock all 36 papers for LKR 10,000.
                  </p>
                </div>

                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {DEFAULT_BULLETS.map(renderFullBullet)}
                </div>
              </div>
            )}
          </div>

          <p className="left-panel-footer" style={{ position: 'relative', zIndex: 1, fontSize: 11, fontWeight: 500, color: '#94A3B8' }}>
            © EPIC Campus · Sri Lanka
          </p>
        </div>

        {/* RIGHT PANEL — form */}
        <div className="right-panel">
          <div className="system-badge">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>System Online</span>
          </div>

          <div className="form-inner">
            <div className="mobile-brand-header">
              {renderBrandHeader(true)}
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ marginTop: 8, fontSize: 15, fontWeight: 400, color: '#475569', lineHeight: 1.5 }}>
              {mode === 'login'
                ? `Sign in to your ${siteName} account`
                : `Join ${siteName} and start your IELTS journey`}
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9', marginTop: 32 }}>
              <button
                type="button"
                className={`mode-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`mode-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Create Account
              </button>
            </div>

            {/* Free access reminder (login) */}
            {mode === 'login' && (
              <div style={{
                marginTop: 24,
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>🎁</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>
                  Free access: 1 exam per skill — unlock all for LKR 10,000.
                </span>
              </div>
            )}

            {/* What's included banner (signup) */}
            {mode === 'signup' && (
              <div style={{
                marginTop: 24,
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 12,
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', marginBottom: 6 }}>
                  ✅ What's included FREE on signup
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                  {['1 Reading test', '1 Writing test', '1 Listening test', '1 Speaking test', 'Band score dashboard', 'AI feedback'].map(item => (
                    <span key={item} style={{ fontSize: 11, color: '#166534' }}>✓ {item}</span>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: '#64748B' }}>
                  Upgrade to full access anytime for <strong>LKR 10,000</strong> (one-time, lifetime).
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{
                marginTop: 20,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#B91C1C',
                fontSize: 13,
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} style={{ marginTop: error ? 20 : 0 }}>
                {renderGoogleSection('or sign in with email')}

                <div style={{ marginTop: 20 }}>
                  <label htmlFor="login-email" style={labelStyle}>Email address</label>
                  <input
                    id="login-email"
                    name="email"
                    className="epic-input"
                    style={inputStyle}
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <label htmlFor="login-password" style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      name="password"
                      className="epic-input"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        width: 24, height: 24, background: 'none', border: 'none',
                        cursor: 'pointer', color: '#94A3B8', fontSize: 16, padding: 0,
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="forgot-btn" onClick={handleForgotPassword}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: 24 }} disabled={loading}>
                  {loading ? (
                    <>
                      <div style={{
                        width: 18, height: 18,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Signing in...
                    </>
                  ) : 'Sign In →'}
                </button>

                <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, fontWeight: 400, color: '#94A3B8' }}>
                  By signing in you agree to our Terms &amp; Privacy.
                </p>
              </form>
            )}

            {/* CREATE ACCOUNT FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} style={{ marginTop: error ? 20 : 0 }}>
                {renderGoogleSection('or create account with email')}

                <p style={{ ...sectionLabelStyle, marginTop: 20 }}>Personal Information</p>

                <div>
                  <label htmlFor="signup-name" style={labelStyle}>Full Name *</label>
                  <input
                    id="signup-name"
                    name="name"
                    className="epic-input"
                    style={inputStyle}
                    type="text"
                    autoComplete="name"
                    value={signup.name}
                    onChange={e => updateSignup('name', e.target.value)}
                    placeholder="e.g. Aarav Silva"
                    required
                  />
                </div>

                <div className="signup-grid-2" style={{ marginTop: 16 }}>
                  <div>
                    <label htmlFor="signup-age" style={labelStyle}>Age</label>
                    <input
                      id="signup-age"
                      name="age"
                      className="epic-input"
                      style={inputStyle}
                      type="number"
                      value={signup.age}
                      onChange={e => updateSignup('age', e.target.value)}
                      placeholder="e.g. 22"
                      min="10"
                      max="80"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-city" style={labelStyle}>City</label>
                    <input
                      id="signup-city"
                      name="city"
                      className="epic-input"
                      style={inputStyle}
                      type="text"
                      autoComplete="address-level2"
                      value={signup.city}
                      onChange={e => updateSignup('city', e.target.value)}
                      placeholder="e.g. Colombo"
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label htmlFor="signup-address" style={labelStyle}>Address</label>
                  <input
                    id="signup-address"
                    name="address"
                    className="epic-input"
                    style={inputStyle}
                    type="text"
                    autoComplete="street-address"
                    value={signup.address}
                    onChange={e => updateSignup('address', e.target.value)}
                    placeholder="e.g. 123 Main Street, Colombo 03"
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <label htmlFor="signup-phone" style={labelStyle}>Phone Number</label>
                  <input
                    id="signup-phone"
                    name="phone"
                    className="epic-input"
                    style={inputStyle}
                    type="tel"
                    autoComplete="tel"
                    value={signup.phone}
                    onChange={e => updateSignup('phone', e.target.value)}
                    placeholder="e.g. +94 77 123 4567"
                  />
                </div>

                <div style={{ height: 1, background: '#F1F5F9', margin: '24px 0' }} />

                <p style={sectionLabelStyle}>Account Details</p>

                <div>
                  <label htmlFor="signup-email" style={labelStyle}>Email Address *</label>
                  <input
                    id="signup-email"
                    name="email"
                    className="epic-input"
                    style={inputStyle}
                    type="email"
                    autoComplete="email"
                    value={signup.email}
                    onChange={e => updateSignup('email', e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="signup-grid-2" style={{ marginTop: 16 }}>
                  <div>
                    <label htmlFor="signup-password" style={labelStyle}>Password *</label>
                    <input
                      id="signup-password"
                      name="password"
                      className="epic-input"
                      style={inputStyle}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={signup.password}
                      onChange={e => updateSignup('password', e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-confirm-password" style={labelStyle}>Confirm Password *</label>
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      className="epic-input"
                      style={inputStyle}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={signup.confirmPassword}
                      onChange={e => updateSignup('confirmPassword', e.target.value)}
                      placeholder="Repeat password"
                      required
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#475569', cursor: 'pointer', marginTop: 16 }}>
                  <input
                    type="checkbox"
                    style={{ width: 16, height: 16, accentColor: '#4F46E5' }}
                    onChange={e => setShowPassword(e.target.checked)}
                  />
                  Show passwords
                </label>

                <div style={{ height: 1, background: '#F1F5F9', margin: '24px 0' }} />

                <p style={sectionLabelStyle}>IELTS Goal</p>

                <div>
                  <label htmlFor="signup-band" style={labelStyle}>Expected IELTS Band Score</label>
                  <select
                    id="signup-band"
                    name="expectedBand"
                    className="epic-input"
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={signup.expectedBand}
                    onChange={e => updateSignup('expectedBand', e.target.value)}
                  >
                    <option value="">Select your target band</option>
                    <option value="4.0">4.0 — Basic</option>
                    <option value="4.5">4.5</option>
                    <option value="5.0">5.0 — Modest</option>
                    <option value="5.5">5.5</option>
                    <option value="6.0">6.0 — Competent</option>
                    <option value="6.5">6.5</option>
                    <option value="7.0">7.0 — Good</option>
                    <option value="7.5">7.5</option>
                    <option value="8.0">8.0 — Very Good</option>
                    <option value="8.5">8.5</option>
                    <option value="9.0">9.0 — Expert</option>
                  </select>
                  <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                    This helps our AI tailor feedback to your goal
                  </p>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: 24 }} disabled={loading}>
                  {loading ? (
                    <>
                      <div style={{
                        width: 18, height: 18,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Creating account...
                    </>
                  ) : 'Create Account →'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 16 }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#4F46E5', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: 12,
                    }}
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <AgentWidget />
    </>
  );
}
