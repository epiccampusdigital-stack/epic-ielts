import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import AgentWidget from '../components/AgentWidget';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '176832951489-8e1f4h848679ur3ci27ccpkv5upi6aci.apps.googleusercontent.com';

const WHATSAPP = '94777644946';

// Colours: ink for text, paper for the page, one indigo for actions (matches the app),
// and a highlighter yellow used only where the page "marks" something.
const K = {
  ink: '#16213B',
  sub: '#4A5568',
  faint: '#8A94A6',
  paper: '#F4F6F9',
  card: '#FFFFFF',
  rule: '#DCE1E8',
  indigo: '#4F46E5',
  indigoDark: '#3E36C9',
  marker: '#FFE066',
  right: '#1F7A4D',
  wrong: '#B42318',
};

// A real-format question the visitor can answer before signing in
const SAMPLE = {
  passage: 'Sri Lanka has grown tea since the 1860s, when coffee plantations in the hill country were destroyed by a leaf disease. Planters replaced the dying coffee with tea, and within thirty years the island had become one of the largest tea exporters in the world.',
  question: 'Tea replaced coffee because the coffee crop failed.',
  answer: 'TRUE',
  why: 'The passage says coffee was "destroyed by a leaf disease" and planters "replaced the dying coffee with tea".',
};

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [picked, setPicked] = useState(null);
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signup, setSignup] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', city: '', phone: '', expectedBand: '',
  });

  const finishLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.role === 'PROGRAM_TEACHER') navigate('/teacher');
    else if (user.role === 'ADMIN' || user.role === 'TEACHER') navigate('/admin/dashboard');
    else navigate('/student/dashboard');
  };

  useEffect(() => {
    const loadGoogle = () => {
      if (!window.google || !GOOGLE_CLIENT_ID) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/api/auth/google`, { credential: response.credential });
            finishLogin(res.data.token, res.data.user);
          } catch (err) {
            setError(err.response?.data?.error || 'Google sign-in did not work. Try again or use your email.');
          } finally {
            setLoading(false);
          }
        },
      });
      const el = document.getElementById('google-btn');
      if (el) {
        el.innerHTML = '';
        window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 360, text: 'continue_with', shape: 'rectangular' });
        setGoogleReady(true);
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
    // finishLogin is stable enough for this one-time setup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setNotice('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email: loginEmail, password: loginPassword });
      finishLogin(res.data.token, res.data.user);
    } catch (err) {
      if (err.response?.data?.error === 'EMAIL_NOT_VERIFIED') {
        setError('Verify your email first. The link is in your inbox.');
      } else if (!err.response) {
        setError('Could not reach the server. Check your connection and try again in a moment.');
      } else {
        setError(err.response?.data?.error || 'That email and password do not match.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (signup.password !== signup.confirmPassword) { setError('The two passwords are different.'); return; }
    if (signup.password.length < 6) { setError('Use at least 6 characters for your password.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/signup`, {
        name: signup.name, email: signup.email, password: signup.password,
        age: signup.age, city: signup.city, phone: signup.phone, expectedBand: signup.expectedBand,
      });
      setMode('login');
      setLoginEmail(signup.email);
      setNotice('Account created. Sign in with your email and password.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create the account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const up = (field, value) => setSignup(prev => ({ ...prev, [field]: value }));
  const switchMode = m => { setMode(m); setError(''); setNotice(''); };

  return (
    <div className="lp">
      <style>{css}</style>

      <header className="lp-top">
        <a className="lp-brand" href="/">
          <img src="/logo.png" alt="" height="30" onError={e => { e.target.style.display = 'none'; }} />
          <span>EPIC IELTS</span>
        </a>
        <nav className="lp-topnav" aria-label="Page">
          <a href="#courses">Courses</a>
          <a href="#prices">Prices</a>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp us</a>
        </nav>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-intro">
            <h1>Practise IELTS the way the real test feels.</h1>
            <p className="lp-lede">
              Timed computer-based papers for Reading, Writing, Listening and Speaking, marked straight away. Built by Epic Campus in Sri Lanka for our own students.
            </p>

            <figure className="lp-sample" aria-label="Try a sample question">
              <figcaption>Try one. Reading, True / False / Not Given</figcaption>
              <p className="lp-passage">{SAMPLE.passage}</p>
              <p className="lp-q"><span className="lp-qn">1</span>{SAMPLE.question}</p>
              <div className="lp-opts" role="radiogroup" aria-label="Your answer">
                {['TRUE', 'FALSE', 'NOT GIVEN'].map(o => {
                  const state = picked == null ? '' : o === SAMPLE.answer ? 'is-right' : o === picked ? 'is-wrong' : 'is-off';
                  return (
                    <button key={o} type="button" role="radio" aria-checked={picked === o} className={`lp-opt ${state}`} onClick={() => setPicked(o)}>
                      {o.charAt(0) + o.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
              <p className="lp-why" aria-live="polite">
                {picked == null ? 'Pick an answer to see how it is marked.'
                  : picked === SAMPLE.answer ? <><b>Correct.</b> {SAMPLE.why}</>
                  : <><b>Not this time.</b> The answer is True. {SAMPLE.why}</>}
              </p>
            </figure>
          </div>

          <div className="lp-auth" id="signin">
            <div className="lp-tabs" role="tablist">
              <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Sign in</button>
              <button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => switchMode('signup')}>Create account</button>
            </div>

            <div className="lp-google">
              <div id="google-btn" />
            </div>
            {googleReady && <div className="lp-or"><span>or use your email</span></div>}

            {notice && <p className="lp-notice" role="status">{notice}</p>}
            {error && <p className="lp-error" role="alert">{error}</p>}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="lp-form">
                <label>Email
                  <input type="email" autoComplete="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </label>
                <label>Password
                  <span className="lp-pw">
                    <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
                  </span>
                </label>
                <button className="lp-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
                <p className="lp-small">
                  Forgot your password? <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I forgot my EPIC IELTS password. My email is: ')}`} target="_blank" rel="noreferrer">Message us on WhatsApp</a> and we will reset it.
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="lp-form">
                <label>Full name
                  <input required autoComplete="name" value={signup.name} onChange={e => up('name', e.target.value)} />
                </label>
                <label>Email
                  <input type="email" required autoComplete="email" value={signup.email} onChange={e => up('email', e.target.value)} />
                </label>
                <label>WhatsApp number
                  <input type="tel" autoComplete="tel" placeholder="07X XXX XXXX" value={signup.phone} onChange={e => up('phone', e.target.value)} />
                </label>
                <div className="lp-row">
                  <label>Password
                    <input type="password" required minLength={6} autoComplete="new-password" value={signup.password} onChange={e => up('password', e.target.value)} />
                  </label>
                  <label>Repeat password
                    <input type="password" required autoComplete="new-password" value={signup.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} />
                  </label>
                </div>
                <div className="lp-row lp-row3">
                  <label>Age
                    <input type="number" min="10" max="99" value={signup.age} onChange={e => up('age', e.target.value)} />
                  </label>
                  <label>City
                    <input autoComplete="address-level2" value={signup.city} onChange={e => up('city', e.target.value)} />
                  </label>
                  <label>Target band
                    <select value={signup.expectedBand} onChange={e => up('expectedBand', e.target.value)}>
                      <option value="">Not sure</option>
                      {['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>
                </div>
                <button className="lp-submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
                <p className="lp-small">Your first exam in each skill is free. No card needed.</p>
              </form>
            )}
          </div>
        </section>

        <section className="lp-band" id="courses">
          <div className="lp-wrap lp-courses">
            <div>
              <h2>IELTS</h2>
              <p>Full Academic papers in all four skills, with the same timing, layout and question types as the computer test. Writing and Speaking get band scores and written feedback against the official descriptors.</p>
            </div>
            <div>
              <h2>General English</h2>
              <p>Everyday English for students heading abroad: one short lesson a day, practice questions, and a quiz at the end of each week. Switch between IELTS and General English from the top of your dashboard.</p>
            </div>
            <div>
              <h2>Korea scholarship programme</h2>
              <p>Our 30-day residential course mixes English and Korean for students going to South Korea on university scholarships. Ask us on WhatsApp about the next intake.</p>
            </div>
          </div>
        </section>

        <section className="lp-wrap lp-prices" id="prices">
          <h2>Prices</h2>
          <table>
            <tbody>
              <tr><th scope="row">Placement test and first exam in each skill</th><td>Free</td></tr>
              <tr><th scope="row">One level (a set of papers in all four skills)</th><td>LKR 2,000</td></tr>
              <tr><th scope="row">Full access to every paper</th><td>LKR 10,000</td></tr>
              <tr><th scope="row">General English lessons and quizzes</th><td>Included</td></tr>
            </tbody>
          </table>
          <p className="lp-small">Pay by card inside your account. Epic Campus students: ask your teacher about class access.</p>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <span>Epic Campus (Pvt) Ltd, Sri Lanka</span>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp +94 77 764 4946</a>
        </div>
      </footer>

      <AgentWidget />
    </div>
  );
}

const css = `
.lp { min-height: 100vh; background: ${K.paper}; color: ${K.ink}; font-family: Inter, system-ui, sans-serif; }
.lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
.lp a { color: ${K.indigo}; }
.lp-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

.lp-top { max-width: 1120px; margin: 0 auto; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.lp-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: ${K.ink} !important; font-weight: 700; font-size: 16px; letter-spacing: 0.01em; }
.lp-topnav { display: flex; gap: 22px; font-size: 14px; }
.lp-topnav a { color: ${K.sub}; text-decoration: none; }
.lp-topnav a:hover { color: ${K.ink}; text-decoration: underline; }

.lp-hero { max-width: 1120px; margin: 0 auto; padding: 32px 24px 64px; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 420px); gap: 56px; align-items: start; }
.lp-intro h1 { font-size: 44px; line-height: 1.08; letter-spacing: -0.02em; font-weight: 700; margin: 8px 0 18px; max-width: 15ch; }
.lp-lede { font-size: 18px; line-height: 1.6; color: ${K.sub}; max-width: 34em; margin: 0 0 32px; }

.lp-sample { margin: 0; background: ${K.card}; border: 1px solid ${K.rule}; border-radius: 6px; padding: 22px 24px 18px; max-width: 560px; }
.lp-sample figcaption { font-size: 13px; color: ${K.faint}; margin-bottom: 12px; }
.lp-passage { font-family: Lora, Georgia, serif; font-size: 16px; line-height: 1.75; margin: 0 0 16px; color: ${K.ink}; }
.lp-q { font-size: 15px; font-weight: 600; margin: 0 0 12px; display: flex; gap: 10px; align-items: baseline; }
.lp-qn { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: 1.5px solid ${K.ink}; border-radius: 50%; font-size: 12px; flex-shrink: 0; }
.lp-opts { display: flex; gap: 8px; flex-wrap: wrap; }
.lp-opt { font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 4px; border: 1px solid ${K.rule}; background: #fff; color: ${K.ink}; cursor: pointer; }
.lp-opt:hover { border-color: ${K.ink}; }
.lp-opt.is-right { background: ${K.marker}; border-color: #E0B800; font-weight: 600; }
.lp-opt.is-wrong { border-color: ${K.wrong}; color: ${K.wrong}; text-decoration: line-through; }
.lp-opt.is-off { color: ${K.faint}; }
.lp-why { font-size: 14px; line-height: 1.55; color: ${K.sub}; margin: 14px 0 0; min-height: 44px; }
.lp-why b { color: ${K.ink}; }

.lp-auth { background: ${K.card}; border: 1px solid ${K.rule}; border-radius: 6px; padding: 8px 28px 28px; position: sticky; top: 16px; }
.lp-tabs { display: grid; grid-template-columns: 1fr 1fr; margin: 0 -28px 22px; border-bottom: 1px solid ${K.rule}; }
.lp-tabs button { font: inherit; font-size: 15px; padding: 16px 0 14px; background: none; border: none; border-bottom: 2px solid transparent; color: ${K.faint}; cursor: pointer; margin-bottom: -1px; }
.lp-tabs button.on { color: ${K.ink}; font-weight: 600; border-bottom-color: ${K.ink}; }
.lp-google { display: flex; justify-content: center; min-height: 0; }
.lp-google:empty { display: none; }
.lp-or { display: flex; align-items: center; gap: 12px; font-size: 13px; color: ${K.faint}; margin: 18px 0 4px; }
.lp-or::before, .lp-or::after { content: ''; flex: 1; height: 1px; background: ${K.rule}; }
.lp-form { display: grid; gap: 14px; margin-top: 14px; }
.lp-form label { display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: ${K.ink}; }
.lp-form input, .lp-form select { font: inherit; font-size: 15px; font-weight: 400; height: 44px; padding: 0 12px; border: 1px solid ${K.rule}; border-radius: 4px; background: #fff; color: ${K.ink}; width: 100%; }
.lp-form input:focus, .lp-form select:focus, .lp-opt:focus-visible, .lp-tabs button:focus-visible, .lp-submit:focus-visible, .lp-pw button:focus-visible { outline: 2px solid ${K.indigo}; outline-offset: 1px; border-color: ${K.indigo}; }
.lp-pw { position: relative; display: block; }
.lp-pw input { padding-right: 64px; }
.lp-pw button { position: absolute; right: 6px; top: 6px; height: 32px; padding: 0 10px; font: inherit; font-size: 13px; color: ${K.sub}; background: none; border: none; cursor: pointer; border-radius: 4px; }
.lp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.lp-row3 { grid-template-columns: 0.7fr 1fr 1fr; }
.lp-submit { font: inherit; font-size: 15px; font-weight: 600; height: 46px; border: none; border-radius: 4px; background: ${K.indigo}; color: #fff; cursor: pointer; margin-top: 4px; }
.lp-submit:hover { background: ${K.indigoDark}; }
.lp-submit:disabled { opacity: 0.7; cursor: progress; }
.lp-small { font-size: 13px; line-height: 1.55; color: ${K.sub}; margin: 0; }
.lp-error { margin: 14px 0 0; padding: 10px 12px; border-left: 3px solid ${K.wrong}; background: #FEF3F2; color: ${K.wrong}; font-size: 14px; }
.lp-notice { margin: 14px 0 0; padding: 10px 12px; border-left: 3px solid ${K.right}; background: #ECFDF3; color: ${K.right}; font-size: 14px; }

.lp-band { background: ${K.card}; border-top: 1px solid ${K.rule}; border-bottom: 1px solid ${K.rule}; padding: 56px 0; }
.lp-courses { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.lp-courses h2, .lp-prices h2 { font-size: 20px; margin: 0 0 10px; letter-spacing: -0.01em; }
.lp-courses p { font-size: 15px; line-height: 1.65; color: ${K.sub}; margin: 0; max-width: 34em; }

.lp-prices { padding-top: 56px; padding-bottom: 64px; }
.lp-prices table { width: 100%; max-width: 640px; border-collapse: collapse; margin: 6px 0 14px; }
.lp-prices th, .lp-prices td { text-align: left; padding: 14px 0; border-bottom: 1px solid ${K.rule}; font-size: 15px; }
.lp-prices th { font-weight: 400; color: ${K.ink}; padding-right: 24px; }
.lp-prices td { font-weight: 600; white-space: nowrap; text-align: right; font-variant-numeric: tabular-nums; }

.lp-foot { border-top: 1px solid ${K.rule}; padding: 22px 0 96px; font-size: 14px; color: ${K.sub}; }
.lp-foot .lp-wrap { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }

@media (max-width: 900px) {
  .lp-hero { grid-template-columns: 1fr; gap: 32px; padding-top: 8px; }
  .lp-auth { order: -1; position: static; }
  .lp-intro h1 { font-size: 32px; }
  .lp-lede { font-size: 16px; }
  .lp-courses { grid-template-columns: 1fr; gap: 28px; }
}
@media (max-width: 520px) {
  .lp-topnav a:not(:last-child) { display: none; }
  .lp-auth { padding: 8px 18px 22px; }
  .lp-tabs { margin: 0 -18px 18px; }
  .lp-row, .lp-row3 { grid-template-columns: 1fr; }
  .lp-sample { padding: 18px; }
}
`;
