import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import AgentWidget from '../components/AgentWidget';
import { setTrack } from '../utils/track';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '176832951489-8e1f4h848679ur3ci27ccpkv5upi6aci.apps.googleusercontent.com';

const WHATSAPP = '94777644946';
const WHATSAPP_SHOWN = '+94 77 764 4946';

// Layout: white canvas, a navy callout card beside the sign-in card, then catalogue-style sections.
const K = {
  ink: '#0f1114', sub: '#5b6780', faint: '#8495b0', paper: '#ffffff', card: '#ffffff', rule: '#dae1ed', tint: '#e8eef7',
  indigo: '#0056d2', indigoDark: '#0048b0', indigoSoft: '#e3eeff', xsoft: '#f0f6ff', navy: '#002761', navyMid: '#003b8f', navyText: '#c9d6ec',
  right: '#276a1a', wrong: '#d30a28',
};

// A short Reading passage with one question of each True / False / Not given type
const SAMPLE = {
  title: 'Tea in the hill country',
  passage: [
    'Sri Lanka, then called Ceylon, has grown tea since the 1860s. Before that, much of the hill country was covered in coffee plantations.',
    'A leaf disease reached the island in 1869 and spread through the coffee estates over the following years. Planters replaced the dying coffee with tea, and by the end of the century Ceylon had become one of the largest tea exporters in the world.',
  ],
  questions: [
    { text: 'Tea replaced coffee because the coffee crop failed.', answer: 'TRUE', why: 'The coffee was destroyed by a leaf disease, and planters “replaced the dying coffee with tea”.' },
    { text: 'The leaf disease reached the island in the 1890s.', answer: 'FALSE', why: 'The passage gives the date as 1869, not the 1890s.' },
    { text: 'Tea earned planters more money than coffee had.', answer: 'NOT GIVEN', why: 'The passage says nothing about how much money either crop made.' },
  ],
};

const OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN'];
const label = o => o.charAt(0) + o.slice(1).toLowerCase();

function reducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

// The exam-window clock: counts down like the real test (still when reduced motion is on)
function ExamClock() {
  const [left, setLeft] = useState(59 * 60 + 41);
  useEffect(() => {
    if (reducedMotion()) return undefined;
    const t = window.setInterval(() => setLeft(s => (s <= 0 ? 60 * 60 : s - 1)), 1000);
    return () => window.clearInterval(t);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return <span className="xw-time" aria-label="Time left in the sample">{mm}:{ss}</span>;
}

function SampleExam() {
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const answered = Object.keys(answers).length;
  const score = SAMPLE.questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="xw" role="group" aria-label="Sample Reading questions">
      <div className="xw-bar">
        <span className="xw-brand">EPIC Campus</span>
        <span className="xw-part">Reading, Part 1</span>
        <span className="xw-clock">Time left <ExamClock /></span>
      </div>

      <div className="xw-body">
        <article className="xw-passage">
          <h3>{SAMPLE.title}</h3>
          {SAMPLE.passage.map((p, i) => <p key={i}>{p}</p>)}
        </article>

        <div className="xw-qs">
          <p className="xw-inst">Do the statements agree with the information in the passage? Choose <b>True</b>, <b>False</b> or <b>Not given</b>.</p>
          {SAMPLE.questions.map((q, i) => {
            const picked = answers[i];
            return (
              <div key={i} className={`xw-q ${current === i ? 'is-current' : ''}`} onFocus={() => setCurrent(i)}>
                <p className="xw-stem"><span className="xw-num">{i + 1}</span>{q.text}</p>
                <div className="xw-opts" role="radiogroup" aria-label={`Question ${i + 1}`}>
                  {OPTIONS.map(o => {
                    const state = picked == null ? '' : o === q.answer ? 'is-right' : o === picked ? 'is-wrong' : 'is-off';
                    return (
                      <button key={o} type="button" role="radio" aria-checked={picked === o} className={`xw-opt ${state}`}
                        onClick={() => { setAnswers(a => ({ ...a, [i]: o })); setCurrent(i); }}>
                        {label(o)}
                      </button>
                    );
                  })}
                </div>
                {picked != null && (
                  <p className="xw-why" aria-live="polite">
                    {picked === q.answer ? <b>Correct.</b> : <b>The answer is {label(q.answer)}.</b>} {q.why}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="xw-foot">
        <div className="xw-nav" aria-label="Questions">
          {SAMPLE.questions.map((q, i) => (
            <span key={i} className={`xw-dot ${answers[i] != null ? 'is-done' : ''} ${current === i ? 'is-current' : ''}`}>{i + 1}</span>
          ))}
        </div>
        <span className="xw-score" aria-live="polite">
          {answered < SAMPLE.questions.length ? `${answered} of ${SAMPLE.questions.length} answered` : `You scored ${score} out of ${SAMPLE.questions.length}`}
        </span>
      </div>
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const firstFieldRef = useRef(null);
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signup, setSignup] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', city: '', phone: '', expectedBand: '', course: '',
  });

  const finishLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.course) setTrack(user.course);
    if (user.role === 'PROGRAM_TEACHER') navigate('/teacher');
    else if (user.role === 'ADMIN' || user.role === 'TEACHER') navigate('/admin/dashboard');
    else navigate('/choose-course');
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
        window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 320, text: 'continue_with', shape: 'rectangular' });
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
    // finishLogin only navigates; this setup runs once per tab switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setNotice('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email: loginEmail, password: loginPassword });
      finishLogin(res.data.token, res.data.user);
    } catch (err) {
      if (err.response?.data?.error === 'EMAIL_NOT_VERIFIED') setError('Verify your email first. The link is in your inbox.');
      else if (!err.response) setError('Could not reach the server. Check your connection and try again in a moment.');
      else setError(err.response?.data?.error || 'That email and password do not match.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (signup.password !== signup.confirmPassword) { setError('The two passwords are different.'); return; }
    if (signup.password.length < 6) { setError('Use at least 6 characters for your password.'); return; }
    if (!signup.course) { setError('Choose your course: IELTS or General English.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/signup`, {
        name: signup.name, email: signup.email, password: signup.password,
        age: signup.age, city: signup.city, phone: signup.phone, expectedBand: signup.course === 'IELTS' ? signup.expectedBand : '', course: signup.course,
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

  // From any button on the page: open the right tab, bring the card into view, put the cursor in it
  const openAuth = m => {
    switchMode(m);
    scrollToId('signin');
    window.setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), reducedMotion() ? 0 : 450);
  };

  const COURSES = [
    {
      key: 'IELTS', tag: 'Exam preparation', title: 'IELTS Academic', who: 'For students with a test date or a band to reach',
      text: 'Timed computer-based papers in Reading, Listening, Writing and Speaking, marked when you finish.',
      chips: ['Reading', 'Listening', 'Writing', 'Speaking'], meta: 'Band score for every skill', tone: '#e3eeff', ink: '#003b8f',
    },
    {
      key: 'GENERAL', tag: 'Everyday English', title: 'General English', who: 'For students going abroad to study or work',
      text: 'A short lesson every day for 30 days, a quiz each week, and practice for interviews and personal statements.',
      chips: ['Grammar', 'Vocabulary', 'Interviews', 'Emails'], meta: 'Score out of 100 and a CEFR level', tone: '#e9f5e6', ink: '#276a1a',
    },
    {
      key: 'KOREA', tag: 'Live-in programme', title: 'Korea Scholarship Programme', who: 'For scholarship students going to South Korea',
      text: '30 days at Epic Campus in Galle: English and Korean every day, mock interviews and a final test.',
      chips: ['English', 'Korean', 'TOPIK I', 'Mock interviews'], meta: '10 students per intake', tone: '#fff4e8', ink: '#a32e00',
    },
  ];
  const PILLS = ['IELTS Reading', 'IELTS Listening', 'IELTS Writing', 'IELTS Speaking', 'General English', 'Grammar', 'Vocabulary', 'Scholarship interviews', 'Personal statements', 'Korean (TOPIK I)'];

  return (
    <div className="lp">
      <style>{css}</style>

      <header className="lp-header">
        <div className="lp-wrap lp-header-row">
          <button type="button" className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })}>
            <img src="/logo.png" alt="" height="28" onError={e => { e.target.style.display = 'none'; }} />
            <span>EPIC Campus</span>
          </button>
          <nav className="lp-nav" aria-label="Sections">
            <button type="button" onClick={() => scrollToId('courses')}>Courses</button>
            <button type="button" onClick={() => scrollToId('try')}>Try a question</button>
            <button type="button" onClick={() => scrollToId('how')}>How it works</button>
            <button type="button" onClick={() => scrollToId('prices')}>Prices</button>
            <button type="button" onClick={() => scrollToId('faq')}>FAQ</button>
          </nav>
          <div className="lp-header-actions">
            <button type="button" className="lp-btn lp-btn-link" onClick={() => openAuth('login')}>Log in</button>
            <button type="button" className="lp-btn lp-btn-primary" onClick={() => openAuth('signup')}>Join for free</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero: navy pitch card beside the sign-in card */}
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-pitch">
              <p className="lp-eyebrow">Epic Campus, Galle</p>
              <h1>English for your next step abroad</h1>
              <p className="lp-lede">IELTS practice that feels like the real computer test, and a General English course for students heading to university overseas. Every test is marked as soon as you finish.</p>
              <div className="lp-cta-row">
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => openAuth('signup')}>Join for free</button>
                <button type="button" className="lp-btn lp-btn-outline-light lp-btn-lg" onClick={() => scrollToId('courses')}>See the courses</button>
              </div>
              <ul className="lp-ticks">
                <li>Free placement test</li>
                <li>First paper in each skill free</li>
                <li>No card needed</li>
              </ul>
            </div>

            <div className="lp-auth" id="signin">
              <div className="lp-tabs" role="tablist" aria-label="Account">
                <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Log in</button>
                <button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => switchMode('signup')}>Create account</button>
              </div>

              <div className="lp-auth-body">
                <div className="lp-google"><div id="google-btn" /></div>
                {googleReady && <div className="lp-or"><span>or</span></div>}

                {notice && <p className="lp-notice" role="status">{notice}</p>}
                {error && <p className="lp-error" role="alert">{error}</p>}

                {mode === 'login' ? (
                  <form onSubmit={handleLogin} className="lp-form">
                    <label htmlFor="login-email">Email</label>
                    <input id="login-email" ref={firstFieldRef} type="email" autoComplete="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                    <label htmlFor="login-password">Password</label>
                    <span className="lp-pw">
                      <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
                    </span>
                    <button className="lp-btn lp-btn-primary lp-submit" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
                    <p className="lp-small">
                      Forgot your password? <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I forgot my EPIC password. My email is: ')}`} target="_blank" rel="noreferrer">Message us on WhatsApp</a>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="lp-form">
                    <span className="lp-label" id="su-course-label">Your course</span>
                    <div className="lp-course-pick" role="radiogroup" aria-labelledby="su-course-label">
                      {[['IELTS', 'IELTS', 'Exam practice and band scores'], ['GENERAL', 'General English', 'Daily lessons and a score out of 100']].map(([k, t, d]) => (
                        <button key={k} type="button" role="radio" aria-checked={signup.course === k} className={signup.course === k ? 'on' : ''} onClick={() => up('course', k)}>
                          <b>{t}</b><span>{d}</span>
                        </button>
                      ))}
                    </div>
                    <label htmlFor="su-name">Full name</label>
                    <input id="su-name" ref={firstFieldRef} required autoComplete="name" value={signup.name} onChange={e => up('name', e.target.value)} />
                    <label htmlFor="su-email">Email</label>
                    <input id="su-email" type="email" required autoComplete="email" value={signup.email} onChange={e => up('email', e.target.value)} />
                    <label htmlFor="su-phone">WhatsApp number</label>
                    <input id="su-phone" type="tel" autoComplete="tel" placeholder="07X XXX XXXX" value={signup.phone} onChange={e => up('phone', e.target.value)} />
                    <div className="lp-row">
                      <div className="lp-field">
                        <label htmlFor="su-pw">Password</label>
                        <input id="su-pw" type="password" required minLength={6} autoComplete="new-password" value={signup.password} onChange={e => up('password', e.target.value)} />
                      </div>
                      <div className="lp-field">
                        <label htmlFor="su-pw2">Repeat password</label>
                        <input id="su-pw2" type="password" required autoComplete="new-password" value={signup.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} />
                      </div>
                    </div>
                    <div className={`lp-row ${signup.course === 'IELTS' ? 'lp-row3' : ''}`}>
                      <div className="lp-field">
                        <label htmlFor="su-age">Age</label>
                        <input id="su-age" type="number" min="10" max="99" value={signup.age} onChange={e => up('age', e.target.value)} />
                      </div>
                      <div className="lp-field">
                        <label htmlFor="su-city">City</label>
                        <input id="su-city" autoComplete="address-level2" value={signup.city} onChange={e => up('city', e.target.value)} />
                      </div>
                      {signup.course === 'IELTS' && (
                        <div className="lp-field">
                          <label htmlFor="su-band">Target band</label>
                          <select id="su-band" value={signup.expectedBand} onChange={e => up('expectedBand', e.target.value)}>
                            <option value="">Not sure</option>
                            {['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'].map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <button className="lp-btn lp-btn-primary lp-submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
                    <p className="lp-small">You can switch course any time after you log in.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* What do you want to learn */}
        <section className="lp-section lp-pills-section">
          <div className="lp-wrap">
            <h2 className="lp-h2">What do you want to learn?</h2>
            <div className="lp-pills">
              {PILLS.map(p => <button key={p} type="button" className="lp-pill" onClick={() => scrollToId('courses')}>{p}</button>)}
            </div>
          </div>
        </section>

        {/* Courses as catalogue tiles */}
        <section className="lp-section" id="courses">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2 className="lp-h2">Courses</h2>
              <p>One account works for IELTS and General English. Pick your course when you log in and switch whenever you like.</p>
            </div>
            <div className="lp-tiles">
              {COURSES.map(c => (
                <article key={c.key} className="lp-tile">
                  <div className="lp-tile-top" style={{ background: c.tone }}>
                    <span style={{ color: c.ink }}>{c.tag}</span>
                  </div>
                  <div className="lp-tile-body">
                    <p className="lp-provider"><img src="/logo.png" alt="" height="16" onError={e => { e.target.style.display = 'none'; }} />Epic Campus</p>
                    <h3>{c.title}</h3>
                    <p className="lp-tile-who">{c.who}</p>
                    <p className="lp-tile-text">{c.text}</p>
                    <div className="lp-chips">{c.chips.map(x => <span key={x}>{x}</span>)}</div>
                  </div>
                  <div className="lp-tile-foot">
                    <span>{c.meta}</span>
                    {c.key === 'KOREA'
                      ? <a className="lp-tile-link" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I would like to know about the next Korea scholarship programme intake.')}`} target="_blank" rel="noreferrer">Ask about the next intake</a>
                      : <button type="button" className="lp-tile-link" onClick={() => { up('course', c.key); openAuth('signup'); }}>Start free</button>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Try it */}
        <section className="lp-section lp-tint" id="try">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2 className="lp-h2">Try a real question</h2>
              <p>This is what a Reading paper looks like on the site. Answer the three questions to see how marking works.</p>
            </div>
            <SampleExam />
          </div>
        </section>

        {/* How it works */}
        <section className="lp-section" id="how">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2 className="lp-h2">How it works</h2>
            </div>
            <ol className="lp-steps">
              <li>
                <h3>Choose your course</h3>
                <p>IELTS or General English. You can switch at any time from the top bar.</p>
              </li>
              <li>
                <h3>Take the placement test</h3>
                <p>It is free and shows where you are in grammar, vocabulary, reading, listening, writing and speaking.</p>
              </li>
              <li>
                <h3>Practise and track your score</h3>
                <p>Lessons, timed papers and quizzes. Your scores go straight to your dashboard so you can see your progress.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* Navy stat band */}
        <section className="lp-section lp-section-tight">
          <div className="lp-wrap">
            <div className="lp-stats">
              <div className="lp-stats-copy">
                <h2>Marked the moment you finish</h2>
                <p>Reading and Listening answers are checked instantly with a reason for every answer. Writing and Speaking are marked against clear criteria with written comments.</p>
              </div>
              <dl className="lp-stats-grid">
                <div><dt>4</dt><dd>skills in every course</dd></div>
                <div><dt>30</dt><dd>daily General English lessons</dd></div>
                <div><dt>5</dt><dd>weekly quizzes</dd></div>
                <div><dt>0</dt><dd>cost to start</dd></div>
              </dl>
            </div>
          </div>
        </section>

        {/* Prices */}
        <section className="lp-section" id="prices">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2 className="lp-h2">Prices</h2>
              <p>Start free. Pay only when you want more IELTS papers. General English is included for everyone.</p>
            </div>
            <div className="lp-plans">
              <article className="lp-plan">
                <h3>Start</h3>
                <p className="lp-price">Free</p>
                <ul>
                  <li>Placement test</li>
                  <li>Your first IELTS paper in each skill</li>
                  <li>All General English lessons and quizzes</li>
                </ul>
                <button type="button" className="lp-btn lp-btn-secondary" onClick={() => openAuth('signup')}>Join for free</button>
              </article>
              <article className="lp-plan">
                <h3>One IELTS level</h3>
                <p className="lp-price">LKR 2,000</p>
                <ul>
                  <li>A set of papers in all four skills</li>
                  <li>Writing and Speaking bands with comments</li>
                  <li>Buy the next level when you are ready</li>
                </ul>
                <button type="button" className="lp-btn lp-btn-secondary" onClick={() => openAuth('signup')}>Start free, buy later</button>
              </article>
              <article className="lp-plan lp-plan-full">
                <p className="lp-plan-flag">Best value</p>
                <h3>Full IELTS access</h3>
                <p className="lp-price">LKR 10,000</p>
                <ul>
                  <li>Every paper in every level</li>
                  <li>All four skills, with retakes</li>
                  <li>Everything in General English</li>
                </ul>
                <button type="button" className="lp-btn lp-btn-primary" onClick={() => openAuth('signup')}>Join for free</button>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="lp-section lp-tint" id="faq">
          <div className="lp-wrap lp-faq-grid">
            <div className="lp-head">
              <h2 className="lp-h2">Frequently asked questions</h2>
              <p>Anything else? Message us on WhatsApp at <span className="lp-nowrap">{WHATSAPP_SHOWN}</span>.</p>
            </div>
            <div className="lp-faq">
              <details>
                <summary>Is this the real IELTS test?</summary>
                <p>No. It is practice made by Epic Campus. The papers follow the format, timing and question types of the computer-delivered IELTS, so the real test feels familiar on the day.</p>
              </details>
              <details>
                <summary>What is the difference between IELTS and General English?</summary>
                <p>IELTS gives you full exam papers and a band score. General English is a daily course for everyday and university English, with a score out of 100 and a level instead of a band.</p>
              </details>
              <details>
                <summary>How accurate are the Writing and Speaking marks?</summary>
                <p>They are marked against clear criteria and come with comments that explain the mark. Treat them as a practice estimate to guide what you work on next.</p>
              </details>
              <details>
                <summary>I am an Epic Campus student. Do I pay?</summary>
                <p>Ask your teacher. Class and programme students usually get access through Epic Campus.</p>
              </details>
              <details>
                <summary>I forgot my password.</summary>
                <p>Message us on WhatsApp with the email you signed up with and we will reset it.</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-row">
          <div>
            <p className="lp-foot-name">Epic Campus (Pvt) Ltd, Galle, Sri Lanka</p>
            <p className="lp-foot-note">EPIC IELTS practice is independent and is not affiliated with the IELTS test partners.</p>
          </div>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp {WHATSAPP_SHOWN}</a>
        </div>
      </footer>

      <AgentWidget />
    </div>
  );
}

const css = `
.lp { min-height: 100vh; background: #fff; color: ${K.ink}; font-family: 'Source Sans Pro', 'Source Sans 3', Arial, sans-serif; font-size: 16px; line-height: 1.5; }
.lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
.lp a { color: ${K.indigo}; text-underline-offset: 2px; }
.lp h1, .lp h2, .lp h3 { font-family: inherit; color: ${K.ink}; margin: 0; font-weight: 600; text-wrap: balance; }
.lp p { margin: 0; }
.lp button { font: inherit; }
.lp-wrap { max-width: 1184px; margin: 0 auto; padding-left: max(48px, env(safe-area-inset-left, 0px)); padding-right: max(48px, env(safe-area-inset-right, 0px)); }
.lp-nowrap { white-space: nowrap; }

/* Buttons: 8px rectangles for actions, capsules only for filters */
.lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 16px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.14px; cursor: pointer; text-decoration: none; border: 1px solid transparent; white-space: nowrap; transition: background 150ms, border-color 150ms; }
.lp-btn-lg { height: 48px; padding: 0 24px; font-size: 16px; }
.lp-btn-primary { background: ${K.indigo}; color: #fff !important; }
.lp-btn-primary:hover { background: ${K.indigoDark}; }
.lp-btn-secondary { background: #fff; color: ${K.ink} !important; border-color: ${K.ink}; }
.lp-btn-secondary:hover { background: ${K.xsoft}; }
.lp-btn-link { background: none; color: ${K.indigo} !important; padding: 0 12px; }
.lp-btn-link:hover { text-decoration: underline; }
.lp-btn-outline-light { background: transparent; color: #fff !important; border-color: rgba(255,255,255,0.7); }
.lp-btn-outline-light:hover { background: rgba(255,255,255,0.08); }
.lp-btn:disabled { opacity: 0.7; cursor: progress; }
.lp :focus-visible { outline: 2px solid ${K.indigo}; outline-offset: 2px; }

/* Top nav: white, hairline */
.lp-header { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid ${K.rule}; }
.lp-header-row { display: flex; align-items: center; gap: 24px; height: 72px; }
.lp-brand { display: inline-flex; align-items: center; gap: 10px; background: none; border: none; padding: 0; cursor: pointer; color: ${K.indigo}; font-weight: 700; font-size: 20px; letter-spacing: -0.2px; }
.lp-nav { display: flex; gap: 4px; margin-left: 16px; }
.lp-nav button { background: none; border: none; padding: 0 10px; height: 40px; color: ${K.ink}; font-size: 16px; font-weight: 600; cursor: pointer; }
.lp-nav button:hover { color: ${K.indigo}; }
.lp-header-actions { display: flex; gap: 8px; margin-left: auto; align-items: center; }

/* Sections */
.lp-section { padding-block: 64px; scroll-margin-top: 72px; }
.lp-section-tight { padding-block: 16px 64px; }
.lp-tint { background: ${K.xsoft}; }
.lp-head { max-width: 680px; margin-bottom: 32px; display: grid; gap: 8px; }
.lp-h2 { font-size: 28px; line-height: 1.2; letter-spacing: -0.28px; }
.lp-head p { font-size: 16px; color: ${K.sub}; }

/* Hero */
.lp-hero { padding-block: 32px 48px; }
.lp-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) 440px; gap: 24px; align-items: stretch; }
.lp-pitch { background: ${K.navy}; color: #fff; border-radius: 16px; padding: 48px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
.lp-eyebrow { font-size: 14px; font-weight: 600; color: #b0e5fb; letter-spacing: 0.2px; }
.lp-pitch h1 { color: #fff; font-size: 44px; line-height: 1.1; letter-spacing: -0.6px; max-width: 14ch; }
.lp-lede { font-size: 18px; line-height: 1.55; color: ${K.navyText}; max-width: 34em; }
.lp-cta-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
.lp-ticks { list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 20px; color: ${K.navyText}; font-size: 14px; }
.lp-ticks li { display: flex; gap: 8px; align-items: center; }
.lp-ticks li::before { content: ''; width: 12px; height: 7px; border-left: 2px solid #b0e5fb; border-bottom: 2px solid #b0e5fb; transform: translateY(-2px) rotate(-45deg); }

/* Auth card */
.lp-auth { background: #fff; border: 1px solid ${K.rule}; border-radius: 16px; scroll-margin-top: 96px; overflow: hidden; }
.lp-tabs { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid ${K.rule}; }
.lp-tabs button { height: 52px; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; color: ${K.sub}; font-size: 16px; font-weight: 600; cursor: pointer; }
.lp-tabs button.on { color: ${K.indigo}; border-bottom-color: ${K.indigo}; }
.lp-auth-body { padding: 24px 32px 32px; }
.lp-google { display: flex; justify-content: center; }
.lp-google:empty { display: none; }
.lp-or { display: flex; align-items: center; gap: 12px; font-size: 14px; color: ${K.sub}; margin: 16px 0 4px; }
.lp-or::before, .lp-or::after { content: ''; flex: 1; height: 1px; background: ${K.rule}; }
.lp-form { display: grid; gap: 6px; }
.lp-form label, .lp-label { font-size: 14px; font-weight: 600; color: ${K.ink}; margin-top: 12px; }
.lp-form > label:first-child, .lp-form > .lp-label:first-child { margin-top: 0; }
.lp-field { display: grid; gap: 6px; min-width: 0; }
.lp-form input, .lp-form select { font: inherit; font-size: 16px; height: 48px; padding: 0 12px; border: 1px solid ${K.sub}; border-radius: 8px; background: #fff; color: ${K.ink}; width: 100%; min-width: 0; }
.lp-form input:focus, .lp-form select:focus { outline: none; border: 2px solid ${K.indigo}; padding: 0 11px; }
.lp-pw { position: relative; display: block; }
.lp-pw input { padding-right: 68px; }
.lp-pw button { position: absolute; right: 6px; top: 8px; height: 32px; padding: 0 10px; font-size: 14px; font-weight: 600; color: ${K.indigo}; background: none; border: none; cursor: pointer; border-radius: 4px; }
.lp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.lp-row3 { grid-template-columns: 0.7fr 1fr 1fr; }
.lp-course-pick { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.lp-course-pick button { text-align: left; display: grid; gap: 2px; padding: 12px; border: 1px solid ${K.rule}; border-radius: 8px; background: #fff; cursor: pointer; color: ${K.ink}; }
.lp-course-pick button b { font-size: 15px; }
.lp-course-pick button span { font-size: 13px; color: ${K.sub}; line-height: 1.35; }
.lp-course-pick button.on { border: 2px solid ${K.indigo}; padding: 11px; background: ${K.xsoft}; }
.lp-submit { width: 100%; height: 48px; margin-top: 20px; font-size: 16px; }
.lp-small { font-size: 14px; color: ${K.sub}; margin-top: 12px !important; }
.lp-error, .lp-notice { margin: 16px 0 4px !important; padding: 10px 12px; font-size: 14px; border-radius: 8px; }
.lp-error { background: #fdecee; color: ${K.wrong}; }
.lp-notice { background: #e9f5e6; color: ${K.right}; }

/* Pills */
.lp-pills-section { padding-block: 16px 24px; }
.lp-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.lp-pill { height: 36px; padding: 0 16px; border-radius: 50px; border: 1px solid ${K.rule}; background: #fff; color: ${K.ink}; font-size: 14px; font-weight: 600; letter-spacing: 0.14px; cursor: pointer; }
.lp-pill:hover { background: ${K.tint}; border-color: ${K.tint}; }

/* Course tiles */
.lp-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.lp-tile { border: 1px solid ${K.rule}; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; background: #fff; transition: border-color 150ms; }
.lp-tile:hover { border-color: ${K.indigo}; }
.lp-tile-top { height: 112px; display: flex; align-items: flex-end; padding: 16px; }
.lp-tile-top span { font-size: 12px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; }
.lp-tile-body { padding: 16px 16px 0; display: grid; gap: 8px; flex: 1; align-content: start; }
.lp-provider { display: flex; align-items: center; gap: 6px; font-size: 14px; color: ${K.sub}; }
.lp-tile h3 { font-size: 20px; line-height: 1.3; letter-spacing: -0.1px; }
.lp-tile-who { font-size: 14px; font-weight: 600; color: ${K.ink}; }
.lp-tile-text { font-size: 14px; color: ${K.sub}; line-height: 1.43; }
.lp-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.lp-chips span { font-size: 13px; padding: 2px 8px; border-radius: 2px; background: ${K.tint}; color: ${K.navy}; }
.lp-tile-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; margin-top: 12px; border-top: 1px solid ${K.rule}; font-size: 13px; color: ${K.sub}; }
.lp-tile-link { background: none; border: none; padding: 0; color: ${K.indigo}; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; white-space: nowrap; }
.lp-tile-link:hover { text-decoration: underline; }

/* Sample exam window */
.xw { background: #fff; border: 1px solid ${K.rule}; border-radius: 16px; overflow: hidden; }
.xw-bar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: ${K.navy}; color: ${K.navyText}; font-size: 14px; }
.xw-brand { color: #fff; font-weight: 700; }
.xw-part { padding-left: 16px; border-left: 1px solid rgba(255,255,255,0.2); }
.xw-clock { margin-left: auto; display: inline-flex; gap: 8px; align-items: baseline; }
.xw-time { font-variant-numeric: tabular-nums; font-weight: 700; color: #fff; font-size: 16px; }
.xw-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.xw-passage { padding: 32px; border-right: 1px solid ${K.rule}; display: grid; gap: 12px; align-content: start; }
.xw-passage h3 { font-size: 20px; }
.xw-passage p { font-size: 16px; line-height: 1.6; color: ${K.ink}; }
.xw-qs { padding: 32px; display: grid; gap: 20px; align-content: start; }
.xw-inst { font-size: 14px; color: ${K.sub}; }
.xw-q { display: grid; gap: 10px; padding-left: 12px; border-left: 3px solid transparent; }
.xw-q.is-current { border-left-color: ${K.indigo}; }
.xw-stem { font-size: 16px; font-weight: 600; display: flex; gap: 10px; align-items: baseline; }
.xw-num { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: ${K.tint}; color: ${K.navy}; font-size: 12px; font-weight: 700; }
.xw-opts { display: flex; gap: 8px; flex-wrap: wrap; padding-left: 34px; }
.xw-opt { font-size: 14px; font-weight: 600; height: 36px; padding: 0 14px; border-radius: 8px; border: 1px solid ${K.rule}; background: #fff; color: ${K.ink}; cursor: pointer; }
.xw-opt:hover { border-color: ${K.ink}; }
.xw-opt.is-right { background: #e9f5e6; border-color: ${K.right}; color: ${K.right}; }
.xw-opt.is-wrong { border-color: ${K.wrong}; color: ${K.wrong}; text-decoration: line-through; }
.xw-opt.is-off { color: ${K.faint}; }
.xw-why { font-size: 14px; color: ${K.sub}; padding-left: 34px; }
.xw-why b { color: ${K.ink}; }
.xw-foot { display: flex; align-items: center; gap: 16px; justify-content: space-between; padding: 12px 20px; border-top: 1px solid ${K.rule}; flex-wrap: wrap; }
.xw-nav { display: flex; gap: 6px; }
.xw-dot { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid ${K.rule}; border-radius: 4px; font-size: 13px; font-weight: 600; background: #fff; color: ${K.sub}; }
.xw-dot.is-done { background: ${K.navy}; border-color: ${K.navy}; color: #fff; }
.xw-dot.is-current { outline: 2px solid ${K.indigo}; outline-offset: 1px; }
.xw-score { font-size: 14px; color: ${K.sub}; font-variant-numeric: tabular-nums; }

/* How it works */
.lp-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; counter-reset: step; }
.lp-steps li { counter-increment: step; display: grid; gap: 8px; align-content: start; padding: 24px; border: 1px solid ${K.rule}; border-radius: 16px; }
.lp-steps li::before { content: 'Step ' counter(step); font-size: 14px; font-weight: 600; color: ${K.indigo}; }
.lp-steps h3 { font-size: 20px; }
.lp-steps p { color: ${K.sub}; font-size: 16px; }

/* Navy stat band */
.lp-stats { background: ${K.navy}; color: #fff; border-radius: 16px; padding: 48px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; align-items: center; }
.lp-stats-copy { display: grid; gap: 12px; }
.lp-stats h2 { color: #fff; font-size: 28px; letter-spacing: -0.28px; }
.lp-stats p { color: ${K.navyText}; font-size: 16px; }
.lp-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px 32px; margin: 0; }
.lp-stats-grid div { border-left: 2px solid ${K.indigo}; padding-left: 16px; }
.lp-stats-grid dt { font-size: 44px; font-weight: 600; line-height: 1; letter-spacing: -0.5px; }
.lp-stats-grid dd { margin: 6px 0 0; color: ${K.navyText}; font-size: 14px; }

/* Prices */
.lp-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: stretch; }
.lp-plan { border: 1px solid ${K.rule}; border-radius: 16px; padding: 32px; display: flex; flex-direction: column; gap: 12px; position: relative; }
.lp-plan h3 { font-size: 20px; }
.lp-price { font-size: 36px; font-weight: 600; line-height: 1.1; letter-spacing: -0.4px; }
.lp-plan ul { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 8px; color: ${K.sub}; flex: 1; font-size: 16px; }
.lp-plan li { padding-left: 24px; position: relative; }
.lp-plan li::before { content: ''; position: absolute; left: 2px; top: 0.45em; width: 11px; height: 6px; border-left: 2px solid ${K.indigo}; border-bottom: 2px solid ${K.indigo}; transform: rotate(-45deg); }
.lp-plan .lp-btn { width: 100%; margin-top: 12px; }
.lp-plan-full { border: 2px solid ${K.indigo}; padding: 31px; }
.lp-plan-flag { position: absolute; top: -12px; left: 24px; background: ${K.indigo}; color: #fff; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 4px; letter-spacing: 0.3px; }

/* FAQ */
.lp-faq-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: 64px; align-items: start; }
.lp-faq-grid .lp-head { margin-bottom: 0; }
.lp-faq { border-top: 1px solid ${K.rule}; }
.lp-faq details { border-bottom: 1px solid ${K.rule}; }
.lp-faq summary { cursor: pointer; list-style: none; padding: 16px 40px 16px 0; font-weight: 600; font-size: 16px; position: relative; }
.lp-faq summary::-webkit-details-marker { display: none; }
.lp-faq summary::after { content: ''; position: absolute; right: 8px; top: 22px; width: 8px; height: 8px; border-right: 2px solid ${K.ink}; border-bottom: 2px solid ${K.ink}; transform: rotate(45deg); transition: transform 150ms; }
.lp-faq details[open] summary::after { transform: rotate(-135deg); top: 26px; }
.lp-faq details p { padding: 0 40px 16px 0; color: ${K.sub}; }

/* Footer */
.lp-foot { padding-block: 32px 96px; font-size: 14px; color: ${K.sub}; border-top: 1px solid ${K.rule}; }
.lp-foot-row { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
.lp-foot-name { color: ${K.ink}; font-weight: 600; }
.lp-foot-note { margin-top: 4px !important; max-width: 46em; }
.lp-foot a { font-weight: 600; text-decoration: none; }

@media (prefers-reduced-motion: reduce) { .lp * { transition: none !important; } }
@media (max-width: 1080px) {
  .lp-nav { display: none; }
  .lp-hero-grid { grid-template-columns: 1fr; }
  .lp-auth { max-width: 560px; }
  .lp-tiles, .lp-plans { grid-template-columns: 1fr 1fr; }
  .lp-faq-grid, .lp-stats { grid-template-columns: 1fr; gap: 32px; }
}
@media (max-width: 760px) {
  .lp-wrap { padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .lp-header-row { height: 64px; }
  .lp-section { padding-block: 48px; }
  .lp-hero { padding-block: 16px 32px; }
  .lp-pitch { padding: 28px 24px; }
  .lp-pitch h1 { font-size: 32px; }
  .lp-lede { font-size: 16px; }
  .lp-h2 { font-size: 24px; }
  .lp-tiles, .lp-plans, .lp-steps { grid-template-columns: 1fr; }
  .lp-stats { padding: 28px 24px; }
  .lp-stats-grid dt { font-size: 36px; }
  .xw-body { grid-template-columns: 1fr; }
  .xw-passage { border-right: none; border-bottom: 1px solid ${K.rule}; padding: 20px; }
  .xw-qs { padding: 20px; }
  .xw-part { display: none; }
  .xw-opts, .xw-why { padding-left: 0; }
  .lp-auth-body { padding: 20px 16px 24px; }
  .lp-row, .lp-row3 { grid-template-columns: 1fr; gap: 0; }
  .lp-cta-row .lp-btn { flex: 1; }
  .lp-brand span { font-size: 18px; }
}
`;
