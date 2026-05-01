import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '176832951489-8e1f4h848679ur3ci27ccpkv5upi6aci.apps.googleusercontent.com';

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
      setError(err.response?.data?.error || 'Invalid email or password.');
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
      finishLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSignup = (field, value) => {
    setSignup(prev => ({ ...prev, [field]: value }));
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    fontSize: '14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '9px',
    outline: 'none',
    color: '#1e293b',
    background: '#ffffff',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    letterSpacing: '0.02em'
  };

  const features = [
    { icon: '🎯', title: 'Real Exam Conditions', desc: 'Strict CBT timing and authentic test flow' },
    { icon: '🤖', title: 'AI Examiner Feedback', desc: 'Personalised analysis after every test' },
    { icon: '📊', title: 'Instant Band Scores', desc: 'IELTS band estimate immediately on submit' },
    { icon: '📈', title: 'Track Your Progress', desc: 'See improvement across all 4 skills over time' },
    { icon: '🎧', title: 'All 4 Skills Covered', desc: 'Reading, Writing, Listening & Speaking' },
    { icon: '🔒', title: 'Free Trial Included', desc: '1 free exam per skill — upgrade to unlock all' }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f8fafc; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .epic-input { transition: border-color 0.2s, box-shadow 0.2s !important; }
        .epic-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }
        .mode-tab { padding: 10px 0; font-size: 15px; font-weight: 600; cursor: pointer; border: none; background: none; font-family: 'Inter', sans-serif; transition: all 0.2s; flex: 1; text-align: center; border-bottom: 2.5px solid transparent; }
        .mode-tab.active { color: #2563eb; border-bottom-color: #2563eb; }
        .mode-tab:not(.active) { color: #94a3b8; }
        .mode-tab:not(.active):hover { color: #64748b; }
        .submit-btn { width: 100%; padding: 14px; background: #1e3a5f; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .submit-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,0.3); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .feature-card { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; background: rgba(255,255,255,0.06); border-radius: 10px; border: 1px solid rgba(255,255,255,0.09); margin-bottom: 8px; animation: fadeUp 0.4s ease both; }
        .login-container { display: flex; min-height: 100vh; width: 100vw; flex-direction: column; }
        @media (min-width: 768px) { .login-container { flex-direction: row; height: 100vh; overflow: hidden; } }
        .left-panel { width: 100%; background: linear-gradient(160deg, #0f2044 0%, #1e3a5f 50%, #1d4ed8 100%); display: none; flex-direction: column; align-items: center; justify-content: center; padding: 40px 36px; position: relative; overflow-y: auto; }
        @media (min-width: 768px) { .left-panel { width: 44%; display: flex; } }
        .right-panel { width: 100%; background: #ffffff; display: flex; flex-direction: column; position: relative; }
        @media (min-width: 768px) { .right-panel { width: 56%; overflow-y: auto; } }
        .logo-img { width: 160px; filter: brightness(0) invert(1); object-fit: contain; margin-bottom: 12px; }
        @media (min-width: 768px) { .logo-img { width: 190px; } }
        .system-badge { position: absolute; top: 16px; right: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 20px; padding: 4px 12px; font-size: 11px; color: #16a34a; font-weight: 600; display: flex; align-items: center; gap: 6px; z-index: 10; }
        @media (min-width: 768px) { .system-badge { top: 20px; right: 24px; font-size: 12px; padding: 5px 14px; } }
        .form-container { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 64px 24px 48px; }
        @media (min-width: 768px) { .form-container { align-items: center; padding: 48px 56px; } }
        .free-callout { background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06)); border: 1px solid rgba(245,158,11,0.35); border-radius: 10px; padding: 11px 14px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .included-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 14px; margin-bottom: 20px; }
      `}</style>

      <div className="login-container">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: -120, right: -120, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.025)', bottom: -80, left: -60, pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 340, position: 'relative' }}>
            <img src={settings.logoUrl} alt="Logo" className="logo-img"
              style={{ filter: settings.logoUrl === '/logo.png' ? 'brightness(0) invert(1)' : 'none' }} />

            <div style={{ width: 44, height: 2, background: 'rgba(245,158,11,0.7)', borderRadius: 2, marginBottom: 12 }} />

            <p style={{ fontSize: 10, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Computer Based Test Platform
            </p>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#ffffff', lineHeight: 1.3, marginBottom: 24 }}>
              Prepare smarter.<br />Score higher.
            </h2>

            {/* Free access callout */}
            <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>Free Access Included</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>1 exam per skill · Unlock all for LKR 10,000</div>
              </div>
            </div>

            {features.map((f, i) => (
              <div key={f.title} className="feature-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <span style={{ fontSize: 18, minWidth: 24, marginTop: 1 }}>{f.icon}</span>
                <div>
                  <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}

            <p style={{ position: 'relative', marginTop: 20, color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: '0.05em' }}>
              {settings.siteName} · We Create Your Future
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="system-badge">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
            System Online
          </div>

          <div className="form-container">
            <div style={{ width: '100%', maxWidth: 460 }}>

              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: mode === 'login' ? 34 : 28,
                  fontWeight: 700, color: '#1e3a5f',
                  marginBottom: 6, lineHeight: 1.2
                }}>
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>
                  {mode === 'login'
                    ? `Sign in to your ${settings.siteName} account`
                    : `Join ${settings.siteName} and start your IELTS journey`}
                </p>
              </div>

              {/* Mode tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
                <button className={`mode-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>
                  Sign In
                </button>
                <button className={`mode-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>
                  Create Account
                </button>
              </div>

              {/* Free access callout (right panel, visible on mobile) */}
              {mode === 'login' && (
                <div className="free-callout">
                  <span style={{ fontSize: 16 }}>🎁</span>
                  <span style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                    <strong>Free access:</strong> 1 exam per skill — unlock all for LKR 10,000
                  </span>
                </div>
              )}

              {/* What's included banner (signup) */}
              {mode === 'signup' && (
                <div className="included-banner">
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>✅ What's included FREE on signup</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                    {['1 Reading test', '1 Writing test', '1 Listening test', '1 Speaking test', 'Band score dashboard', 'AI feedback'].map(item => (
                      <span key={item} style={{ fontSize: 11, color: '#166534' }}>✓ {item}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
                    Upgrade to full access anytime for <strong>LKR 10,000</strong> (one-time, lifetime).
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 10, padding: '12px 16px',
                  marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <span>⚠️</span>
                  <span style={{ color: '#dc2626', fontSize: 13 }}>{error}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} style={{ animation: 'slideRight 0.3s ease' }}>

                  {/* Google at top */}
                  <div id="google-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>or sign in with email</span>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Email address</label>
                    <input className="epic-input" style={inputStyle} type="email"
                      value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      placeholder="you@example.com" required />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input className="epic-input" style={{ ...inputStyle, paddingRight: 46 }}
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter your password" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: '#2563eb' }} /> Remember me
                    </label>
                    <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</span>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Signing in...</>
                    ) : 'Sign In →'}
                  </button>
                </form>
              )}

              {/* SIGNUP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSignup} style={{ animation: 'slideLeft 0.3s ease' }}>

                  {/* Google at top */}
                  <div id="google-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>or create account with email</span>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  </div>

                  <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                    Personal Information
                  </p>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Full Name *</label>
                    <input className="epic-input" style={inputStyle} type="text"
                      value={signup.name} onChange={e => updateSignup('name', e.target.value)}
                      placeholder="e.g. Aarav Silva" required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Age</label>
                      <input className="epic-input" style={inputStyle} type="number"
                        value={signup.age} onChange={e => updateSignup('age', e.target.value)}
                        placeholder="e.g. 22" min="10" max="80" />
                    </div>
                    <div>
                      <label style={labelStyle}>City</label>
                      <input className="epic-input" style={inputStyle} type="text"
                        value={signup.city} onChange={e => updateSignup('city', e.target.value)}
                        placeholder="e.g. Colombo" />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Address</label>
                    <input className="epic-input" style={inputStyle} type="text"
                      value={signup.address} onChange={e => updateSignup('address', e.target.value)}
                      placeholder="e.g. 123 Main Street, Colombo 03" />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Phone Number</label>
                    <input className="epic-input" style={inputStyle} type="tel"
                      value={signup.phone} onChange={e => updateSignup('phone', e.target.value)}
                      placeholder="e.g. +94 77 123 4567" />
                  </div>

                  <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />

                  <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                    Account Details
                  </p>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Email Address *</label>
                    <input className="epic-input" style={inputStyle} type="email"
                      value={signup.email} onChange={e => updateSignup('email', e.target.value)}
                      placeholder="you@example.com" required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Password *</label>
                      <input className="epic-input" style={inputStyle}
                        type={showPassword ? 'text' : 'password'}
                        value={signup.password} onChange={e => updateSignup('password', e.target.value)}
                        placeholder="Min. 6 characters" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Confirm Password *</label>
                      <input className="epic-input" style={inputStyle}
                        type={showPassword ? 'text' : 'password'}
                        value={signup.confirmPassword} onChange={e => updateSignup('confirmPassword', e.target.value)}
                        placeholder="Repeat password" required />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', cursor: 'pointer', marginBottom: 16 }}>
                    <input type="checkbox" style={{ accentColor: '#2563eb' }} onChange={e => setShowPassword(e.target.checked)} />
                    Show passwords
                  </label>

                  <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0 16px' }} />

                  <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                    IELTS Goal
                  </p>

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Expected IELTS Band Score</label>
                    <select className="epic-input" style={{ ...inputStyle, cursor: 'pointer' }}
                      value={signup.expectedBand} onChange={e => updateSignup('expectedBand', e.target.value)}>
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
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                      This helps our AI tailor feedback to your goal
                    </p>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Creating account...</>
                    ) : 'Create Account →'}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
                    Already have an account?{' '}
                    <span style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => { setMode('login'); setError(''); }}>
                      Sign in here
                    </span>
                  </p>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
