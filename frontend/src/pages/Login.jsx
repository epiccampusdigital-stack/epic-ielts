import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import AgentWidget from '../components/AgentWidget';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '176832951489-8e1f4h848679ur3ci27ccpkv5upi6aci.apps.googleusercontent.com';

const WHATSAPP = '94777644946';
const WHATSAPP_SHOWN = '+94 77 764 4946';

// Layout: a dark navy hero and closing band framing light sections, one idea per section, a 1120px column.
// Shared EPIC theme (site, tracker, print pack and deck): navy, indigo for English and actions,
// gold for highlights and Korean, Playfair Display headings, Inter text, Lora for reading passages.
const K = {
  ink: '#1A1A2E',
  sub: '#475569',
  faint: '#64748B',
  paper: '#F8FAFC',
  card: '#FFFFFF',
  rule: '#E2E8F0',
  indigo: '#4F46E5',
  indigoDark: '#4338CA',
  indigoSoft: '#EEF2FF',
  navy: '#1A1A2E',
  navyDeep: '#12122A',
  navyText: '#CBD5E1',
  gold: '#F59E0B',
  goldSoft: '#FFFBEB',
  marker: '#FDE68A',
  right: '#15803D',
  wrong: '#B42318',
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
        <span className="xw-brand">EPIC IELTS</span>
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
    age: '', city: '', phone: '', expectedBand: '',
  });

  const finishLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    try { sessionStorage.removeItem('epicPlacementPrompted'); } catch { /* storage blocked */ }
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

  // From any button on the page: open the right tab, bring the card into view, put the cursor in it
  const openAuth = m => {
    switchMode(m);
    scrollToId('signin');
    window.setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), reducedMotion() ? 0 : 450);
  };

  return (
    <div className="lp">
      <style>{css}</style>

      <header className="lp-header">
        <div className="lp-wrap lp-header-row">
          <button type="button" className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })}>
            <img src="/logo.png" alt="" height="28" onError={e => { e.target.style.display = 'none'; }} />
            <span>EPIC IELTS</span>
          </button>
          <nav className="lp-nav" aria-label="Sections">
            <button type="button" onClick={() => scrollToId('try')}>Try a question</button>
            <button type="button" onClick={() => scrollToId('how')}>How it works</button>
            <button type="button" onClick={() => scrollToId('courses')}>Courses</button>
            <button type="button" onClick={() => scrollToId('prices')}>Prices</button>
            <button type="button" onClick={() => scrollToId('faq')}>Questions</button>
          </nav>
          <div className="lp-header-actions">
            <button type="button" className="lp-btn lp-btn-on-dark" onClick={() => openAuth('login')}>Sign in</button>
            <button type="button" className="lp-btn lp-btn-primary lp-hide-sm" onClick={() => openAuth('signup')}>Start free</button>
          </div>
        </div>
      </header>

      <main>
        {/* 1. Hero: what it is, and the way in */}
        <section className="lp-section lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-copy">
              <h1>Practise IELTS the way the real test feels.</h1>
              <p className="lp-lede">
                Timed, computer-based papers for Reading, Listening, Writing and Speaking, marked as soon as you finish. Made by Epic Campus in Sri Lanka for our own students.
              </p>
              <div className="lp-cta-row">
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => openAuth('signup')}>Create a free account</button>
                <button type="button" className="lp-btn lp-btn-on-dark lp-btn-lg" onClick={() => scrollToId('try')}>Try a question first</button>
              </div>
              <ul className="lp-ticks">
                <li>Free placement test in all four skills</li>
                <li>Your first paper in each skill is free</li>
                <li>No card needed to start</li>
              </ul>
            </div>

            <div className="lp-auth" id="signin">
              <div className="lp-tabs" role="tablist" aria-label="Account">
                <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Sign in</button>
                <button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => switchMode('signup')}>Create account</button>
              </div>

              <div className="lp-auth-body">
                <div className="lp-google"><div id="google-btn" /></div>
                {googleReady && <div className="lp-or"><span>or use your email</span></div>}

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
                    <button className="lp-btn lp-btn-primary lp-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
                    <p className="lp-small">
                      Forgot your password? <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I forgot my EPIC IELTS password. My email is: ')}`} target="_blank" rel="noreferrer">Message us on WhatsApp</a> and we will reset it.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="lp-form">
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
                    <div className="lp-row lp-row3">
                      <div className="lp-field">
                        <label htmlFor="su-age">Age</label>
                        <input id="su-age" type="number" min="10" max="99" value={signup.age} onChange={e => up('age', e.target.value)} />
                      </div>
                      <div className="lp-field">
                        <label htmlFor="su-city">City</label>
                        <input id="su-city" autoComplete="address-level2" value={signup.city} onChange={e => up('city', e.target.value)} />
                      </div>
                      <div className="lp-field">
                        <label htmlFor="su-band">Target band</label>
                        <select id="su-band" value={signup.expectedBand} onChange={e => up('expectedBand', e.target.value)}>
                          <option value="">Not sure</option>
                          {['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                    <button className="lp-btn lp-btn-primary lp-submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
                    <p className="lp-small">Your first paper in each skill is free. No card needed.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Try it: the product, shown as the real exam screen */}
        <section className="lp-section lp-white lp-glow" id="try">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2>Try a real question</h2>
              <p>This is what a Reading paper looks like on the site, with the passage, the questions and the clock running. Answer the three questions to see how marking works.</p>
            </div>
            <SampleExam />
          </div>
        </section>

        {/* 3. How it works: a real sequence, so it is numbered */}
        <section className="lp-section" id="how">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2>How it works</h2>
              <p>Three steps from your first login to your first band score.</p>
            </div>
            <ol className="lp-steps">
              <li>
                <h3>Take the placement test</h3>
                <p>One short paper in each skill. It is free and gives you a starting band, so you know where to begin.</p>
              </li>
              <li>
                <h3>Practise full timed papers</h3>
                <p>Papers follow the computer test’s format, timing and question types. Your answers save as you go.</p>
              </li>
              <li>
                <h3>Read your feedback</h3>
                <p>See every answer explained, your band for each skill, and what to work on next. Retake papers to track your progress.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* 4. The four skills: what each paper is and how it is marked */}
        <section className="lp-section lp-dark" id="skills">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2>All four skills, marked</h2>
              <p>Each skill is timed and marked the way the real test treats it.</p>
            </div>
            <div className="lp-table-wrap">
              <table className="lp-skills">
                <thead>
                  <tr><th scope="col">Skill</th><th scope="col">What you do</th><th scope="col">How it is marked</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row">Reading</th><td data-label="What you do">3 passages, 40 questions, 60 minutes</td><td data-label="How it is marked">Instantly, with the reason for every answer</td></tr>
                  <tr><th scope="row">Listening</th><td data-label="What you do">4 recordings, 40 questions</td><td data-label="How it is marked">Instantly, with the reason for every answer</td></tr>
                  <tr><th scope="row">Writing</th><td data-label="What you do">Task 1 (150 words) and Task 2 (250 words), 60 minutes</td><td data-label="How it is marked">A band for each task against the official band descriptors, with written comments</td></tr>
                  <tr><th scope="row">Speaking</th><td data-label="What you do">Parts 1, 2 and 3, recorded in your browser</td><td data-label="How it is marked">Your answers are transcribed, then given a band and comments</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Courses */}
        <section className="lp-section lp-tint" id="courses">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2>Courses</h2>
              <p>One account gives you both. Switch between them from the top of your dashboard.</p>
            </div>
            <div className="lp-courses">
              <article className="lp-course">
                <h3>IELTS</h3>
                <p>Full Academic papers in all four skills, from your first practice paper to exam-ready. Best when you have a test date or a band to reach.</p>
                <ul>
                  <li>Placement test and band tracking</li>
                  <li>Levels that move you up step by step</li>
                  <li>Lessons on grammar, vocabulary and test strategy</li>
                </ul>
              </article>
              <article className="lp-course">
                <h3>General English</h3>
                <p>Everyday English for students heading abroad. One short lesson a day with practice at the end, and a quiz each week.</p>
                <ul>
                  <li>30 daily lessons, from introductions to interviews</li>
                  <li>Weekly quizzes with your score</li>
                  <li>Scholarship interview and personal statement practice</li>
                </ul>
              </article>
            </div>

            <aside className="lp-korea">
              <div>
                <h3>Korea scholarship programme</h3>
                <p>A 30-day live-in course at Epic Campus that mixes English and Korean for students going to South Korea on university scholarships.</p>
              </div>
              <a className="lp-btn lp-btn-ghost" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I would like to know about the next Korea scholarship programme intake.')}`} target="_blank" rel="noreferrer">Ask about the next intake</a>
            </aside>
          </div>
        </section>

        {/* 6. Prices */}
        <section className="lp-section lp-white lp-glow" id="prices">
          <div className="lp-wrap">
            <div className="lp-head">
              <h2>Prices</h2>
              <p>Start free. Pay only when you want more papers, by card inside your account. General English is included for everyone.</p>
            </div>
            <div className="lp-plans">
              <article className="lp-plan">
                <h3>Start</h3>
                <p className="lp-price">Free</p>
                <ul>
                  <li>Placement test in all four skills</li>
                  <li>Your first paper in each skill</li>
                  <li>General English lessons and quizzes</li>
                </ul>
                <button type="button" className="lp-btn lp-btn-ghost" onClick={() => openAuth('signup')}>Create a free account</button>
              </article>
              <article className="lp-plan">
                <h3>One level</h3>
                <p className="lp-price">LKR 2,000</p>
                <ul>
                  <li>A set of papers in all four skills</li>
                  <li>Writing and Speaking bands with comments</li>
                  <li>Buy the next level when you are ready</li>
                </ul>
                <button type="button" className="lp-btn lp-btn-ghost" onClick={() => openAuth('signup')}>Start free, buy later</button>
              </article>
              <article className="lp-plan lp-plan-full">
                <h3>Full access</h3>
                <p className="lp-price">LKR 10,000</p>
                <ul>
                  <li>Every paper in every level</li>
                  <li>All four skills, with retakes</li>
                  <li>Everything in General English</li>
                </ul>
                <button type="button" className="lp-btn lp-btn-gold" onClick={() => openAuth('signup')}>Start free, unlock later</button>
              </article>
            </div>
          </div>
        </section>

        {/* 7. Questions */}
        <section className="lp-section" id="faq">
          <div className="lp-wrap lp-faq-grid">
            <div className="lp-head">
              <h2>Questions</h2>
              <p>Anything else, message us on WhatsApp at <span className="lp-nowrap">{WHATSAPP_SHOWN}</span>.</p>
            </div>
            <div className="lp-faq">
              <details>
                <summary>Is this the real IELTS test?</summary>
                <p>No. It is practice made by Epic Campus. The papers follow the format, timing and question types of the computer-delivered IELTS, so the real test feels familiar on the day.</p>
              </details>
              <details>
                <summary>How accurate are the Writing and Speaking bands?</summary>
                <p>They are marked against the public IELTS band descriptors and come with comments that explain the band. Treat them as a practice estimate to guide what you work on next.</p>
              </details>
              <details>
                <summary>What can I do for free?</summary>
                <p>Create an account, take the placement test, and do your first paper in each skill. General English lessons are included for everyone.</p>
              </details>
              <details>
                <summary>I am an Epic Campus student. Do I pay?</summary>
                <p>Ask your teacher. Class students usually get access through Epic Campus.</p>
              </details>
              <details>
                <summary>I forgot my password.</summary>
                <p>Message us on WhatsApp with the email you signed up with and we will reset it for you.</p>
              </details>
            </div>
          </div>
        </section>

        {/* 8. Closing call to action */}
        <section className="lp-section lp-closing">
          <div className="lp-wrap lp-closing-row">
            <div>
              <h2>Start with the free placement test.</h2>
              <p>It takes one sitting and tells you where you stand in every skill.</p>
            </div>
            <button type="button" className="lp-btn lp-btn-gold lp-btn-lg" onClick={() => openAuth('signup')}>Create a free account</button>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-row">
          <div>
            <p className="lp-foot-name">Epic Campus (Pvt) Ltd, Sri Lanka</p>
            <p className="lp-foot-note">EPIC IELTS is independent practice and is not affiliated with the IELTS test partners.</p>
          </div>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp {WHATSAPP_SHOWN}</a>
        </div>
      </footer>

      <AgentWidget />
    </div>
  );
}

const css = `
.lp { min-height: 100vh; background: ${K.paper}; color: ${K.ink}; font-family: Inter, system-ui, sans-serif; font-size: 17px; line-height: 1.6; }
.lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
.lp a { color: ${K.indigo}; text-underline-offset: 2px; }
.lp h1, .lp h2, .lp h3 { font-family: 'Playfair Display', Georgia, serif; color: ${K.ink}; margin: 0; text-wrap: balance; }
.lp p { margin: 0; }
.lp button { font: inherit; }
.lp-wrap { max-width: 1120px; margin: 0 auto; padding-left: max(24px, env(safe-area-inset-left, 0px)); padding-right: max(24px, env(safe-area-inset-right, 0px)); }
.lp-nowrap { white-space: nowrap; }

/* Buttons */
.lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 18px; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: background 150ms, border-color 150ms, color 150ms; white-space: nowrap; }
.lp-btn-lg { height: 50px; padding: 0 24px; font-size: 16px; }
.lp-btn-primary { background: ${K.indigo}; color: #fff !important; }
.lp-btn-primary:hover { background: ${K.indigoDark}; }
.lp-btn-ghost { background: ${K.card}; color: ${K.ink} !important; border-color: ${K.rule}; }
.lp-btn-ghost:hover { border-color: ${K.ink}; }
.lp-btn-on-dark { background: rgba(255, 255, 255, 0.04); color: #FFFFFF !important; border-color: rgba(255, 255, 255, 0.28); }
.lp-btn-on-dark:hover { background: rgba(255, 255, 255, 0.10); border-color: rgba(255, 255, 255, 0.5); }
.lp-btn-gold { background: ${K.gold}; color: ${K.navy} !important; }
.lp-btn-gold:hover { background: #FBBF24; }
.lp-btn-primary { box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35); }
.lp-btn:disabled { opacity: 0.7; cursor: progress; }
.lp :focus-visible { outline: 2px solid ${K.indigo}; outline-offset: 2px; }
.lp-header :focus-visible, .lp-hero-copy :focus-visible, .lp-closing :focus-visible { outline-color: ${K.gold}; }

/* Header */
.lp::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 60; background: ${K.navy}; }
.lp-header { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 50; background: rgba(26, 26, 46, 0.97); backdrop-filter: blur(14px) saturate(140%); -webkit-backdrop-filter: blur(14px) saturate(140%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.lp-header-row { display: flex; align-items: center; gap: 24px; height: 68px; }
.lp-brand { display: inline-flex; align-items: center; gap: 10px; background: none; border: none; padding: 0; cursor: pointer; color: #FFFFFF; font-weight: 700; font-size: 16px; letter-spacing: 0.04em; }
.lp-nav { display: flex; gap: 4px; margin-left: auto; }
.lp-nav button { background: none; border: none; padding: 8px 12px; border-radius: 6px; color: ${K.navyText}; font-size: 15px; cursor: pointer; }
.lp-nav button:hover { color: #FFFFFF; background: rgba(255, 255, 255, 0.07); }
.lp-header-actions { display: flex; gap: 10px; }

/* Sections */
.lp-section { padding-block: 104px; scroll-margin-top: 68px; }
.lp-white { background: ${K.card}; border-top: 1px solid ${K.rule}; border-bottom: 1px solid ${K.rule}; }
.lp-glow { background: radial-gradient(900px 360px at 50% 0%, rgba(79, 70, 229, 0.09), transparent 70%), ${K.card}; }
.lp-tint { background: linear-gradient(180deg, ${K.paper} 0%, ${K.indigoSoft} 100%); }
.lp-head { max-width: 640px; margin-bottom: 48px; display: grid; gap: 14px; }
.lp-head h2 { font-size: 40px; line-height: 1.15; letter-spacing: -0.01em; }
.lp-head p { font-size: 18px; color: ${K.sub}; }
.lp-head::before { content: ''; display: block; width: 44px; height: 3px; border-radius: 2px; background: linear-gradient(90deg, ${K.gold}, #FCD34D); margin-bottom: 6px; }
.lp-closing .lp-closing-row > div::before { content: ''; display: block; width: 44px; height: 3px; border-radius: 2px; background: linear-gradient(90deg, ${K.gold}, #FCD34D); margin-bottom: 20px; }

/* Dark band (four skills) */
.lp-dark { color: #FFFFFF; background:
    radial-gradient(700px 380px at 100% 0%, rgba(245, 158, 11, 0.16), transparent 70%),
    radial-gradient(800px 460px at 0% 100%, rgba(79, 70, 229, 0.42), transparent 70%),
    linear-gradient(180deg, ${K.navy}, ${K.navyDeep}); }
.lp-dark .lp-head h2 { color: #FFFFFF; }
.lp-dark .lp-head p { color: ${K.navyText}; }
.lp-dark .lp-skills th, .lp-dark .lp-skills td { border-bottom-color: rgba(255, 255, 255, 0.12); }
.lp-dark .lp-skills thead th { color: #94A3B8; border-bottom: 2px solid ${K.gold}; }
.lp-dark .lp-skills tbody th { color: #FFFFFF; }
.lp-dark .lp-skills td { color: ${K.navyText}; }
.lp-dark .lp-skills tbody tr { transition: background 150ms; }
.lp-dark .lp-skills tbody tr:hover { background: rgba(255, 255, 255, 0.03); }

/* Price cards */
.lp-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch; }
.lp-plan { background: ${K.card}; border: 1px solid ${K.rule}; border-radius: 14px; padding: 32px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 12px 30px rgba(26, 26, 46, 0.06); }
.lp-plan h3 { font-size: 22px; }
.lp-price { font-family: 'Playfair Display', Georgia, serif; font-size: 40px; font-weight: 700; line-height: 1; font-variant-numeric: lining-nums; }
.lp-plan ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; color: ${K.sub}; flex: 1; }
.lp-plan li { padding-left: 24px; position: relative; }
.lp-plan li::before { content: ''; position: absolute; left: 2px; top: 0.45em; width: 11px; height: 6px; border-left: 2px solid ${K.indigo}; border-bottom: 2px solid ${K.indigo}; transform: rotate(-45deg); }
.lp-plan .lp-btn { width: 100%; margin-top: 8px; }
.lp-plan-full { color: #FFFFFF; border-color: transparent; background:
    radial-gradient(420px 260px at 100% 0%, rgba(245, 158, 11, 0.25), transparent 70%),
    linear-gradient(160deg, #2A2970 0%, ${K.navy} 70%); box-shadow: 0 24px 60px rgba(26, 26, 46, 0.28); }
.lp-plan-full h3, .lp-plan-full .lp-price { color: #FFFFFF; }
.lp-plan-full ul { color: ${K.navyText}; }
.lp-plan-full li::before { border-color: ${K.gold}; }

/* Hero */
.lp-hero { padding-block: 96px 112px; color: #FFFFFF; position: relative; overflow: hidden;
  background:
    radial-gradient(720px 520px at 8% 0%, rgba(79, 70, 229, 0.55), transparent 65%),
    radial-gradient(560px 420px at 95% 35%, rgba(245, 158, 11, 0.20), transparent 70%),
    radial-gradient(800px 500px at 60% 120%, rgba(99, 102, 241, 0.30), transparent 70%),
    linear-gradient(180deg, ${K.navy} 0%, ${K.navyDeep} 100%); }
.lp-hero::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.35;
  background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 56px 56px; mask-image: radial-gradient(ellipse at 30% 30%, #000 20%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 30% 30%, #000 20%, transparent 70%); }
.lp-hero .lp-wrap { position: relative; z-index: 1; }
.lp-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 80px; align-items: center; }
.lp-hero-copy { display: grid; gap: 28px; }
.lp-hero h1 { font-size: 62px; line-height: 1.05; letter-spacing: -0.02em; max-width: 13ch; color: #FFFFFF; }
.lp-lede { font-size: 20px; line-height: 1.6; color: ${K.navyText}; max-width: 32em; }
.lp-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
.lp-ticks { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 10px; color: #E2E8F0; font-size: 16px; }
.lp-ticks li { display: flex; gap: 10px; align-items: baseline; }
.lp-ticks li::before { content: ''; flex: none; width: 14px; height: 8px; border-left: 2px solid ${K.gold}; border-bottom: 2px solid ${K.gold}; transform: translateY(-3px) rotate(-45deg); }

/* Auth card */
.lp-auth { background: ${K.card}; color: ${K.ink}; border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 14px; box-shadow: 0 30px 80px rgba(8, 8, 30, 0.45), 0 2px 6px rgba(8, 8, 30, 0.2); scroll-margin-top: 92px; overflow: hidden; }
.lp-tabs { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid ${K.rule}; }
.lp-tabs button { padding: 18px 0 16px; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; color: ${K.faint}; font-size: 15px; cursor: pointer; }
.lp-tabs button.on { color: ${K.ink}; font-weight: 600; border-bottom-color: ${K.ink}; }
.lp-auth-body { padding: 28px 32px 32px; }
.lp-google { display: flex; justify-content: center; }
.lp-google:empty { display: none; }
.lp-or { display: flex; align-items: center; gap: 12px; font-size: 13px; color: ${K.faint}; margin: 20px 0 4px; }
.lp-or::before, .lp-or::after { content: ''; flex: 1; height: 1px; background: ${K.rule}; }
.lp-form { display: grid; gap: 8px; }
.lp-form label { font-size: 14px; font-weight: 600; color: ${K.ink}; margin-top: 10px; }
.lp-form label:first-child { margin-top: 0; }
.lp-field { display: grid; gap: 8px; min-width: 0; }
.lp-field label { margin-top: 10px; }
.lp-form input, .lp-form select { font: inherit; font-size: 16px; height: 46px; padding: 0 12px; border: 1px solid ${K.rule}; border-radius: 6px; background: #fff; color: ${K.ink}; width: 100%; min-width: 0; }
.lp-form input:focus, .lp-form select:focus { outline: 2px solid ${K.indigo}; outline-offset: 0; border-color: ${K.indigo}; }
.lp-pw { position: relative; display: block; }
.lp-pw input { padding-right: 68px; }
.lp-pw button { position: absolute; right: 6px; top: 7px; height: 32px; padding: 0 10px; font-size: 14px; color: ${K.sub}; background: none; border: none; cursor: pointer; border-radius: 4px; }
.lp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.lp-row3 { grid-template-columns: 0.7fr 1fr 1fr; }
.lp-submit { width: 100%; height: 48px; margin-top: 18px; font-size: 16px; }
.lp-small { font-size: 14px; line-height: 1.55; color: ${K.sub}; margin-top: 10px !important; }
.lp-error, .lp-notice { margin: 16px 0 4px !important; padding: 10px 12px; font-size: 14px; border-radius: 4px; }
.lp-error { border-left: 3px solid ${K.wrong}; background: #FEF3F2; color: ${K.wrong}; }
.lp-notice { border-left: 3px solid ${K.right}; background: #ECFDF3; color: ${K.right}; }

/* Sample exam window */
.xw { background: ${K.card}; border: 1px solid #CBD5E1; border-radius: 12px; overflow: hidden; box-shadow: 0 30px 70px rgba(26, 26, 46, 0.14), 0 2px 6px rgba(26, 26, 46, 0.06); }
.xw-bar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: linear-gradient(90deg, ${K.navy}, #24245A); color: ${K.navyText}; font-size: 14px; }
.xw-brand { color: #FFFFFF; font-weight: 700; letter-spacing: 0.04em; }
.xw-part { padding-left: 16px; border-left: 1px solid rgba(255, 255, 255, 0.18); }
.xw-clock { margin-left: auto; display: inline-flex; gap: 8px; align-items: baseline; }
.xw-time { font-variant-numeric: tabular-nums; font-weight: 700; color: ${K.gold}; font-size: 16px; }
.xw-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.xw-passage { padding: 32px 36px; border-right: 1px solid ${K.rule}; display: grid; gap: 16px; align-content: start; background: #FCFCFD; }
.xw-passage h3 { font-size: 22px; }
.xw-passage p { font-family: Lora, Georgia, serif; font-size: 17px; line-height: 1.8; color: ${K.ink}; }
.xw-qs { padding: 32px 36px; display: grid; gap: 22px; align-content: start; }
.xw-inst { font-size: 15px; color: ${K.sub}; }
.xw-q { display: grid; gap: 12px; padding-left: 14px; border-left: 3px solid transparent; }
.xw-q.is-current { border-left-color: ${K.indigo}; }
.xw-stem { font-size: 16px; font-weight: 600; display: flex; gap: 12px; align-items: baseline; }
.xw-num { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: 1.5px solid ${K.ink}; border-radius: 50%; font-size: 12px; font-weight: 700; transform: translateY(-1px); }
.xw-opts { display: flex; gap: 8px; flex-wrap: wrap; padding-left: 36px; }
.xw-opt { font-size: 14px; padding: 7px 14px; border-radius: 4px; border: 1px solid ${K.rule}; background: #fff; color: ${K.ink}; cursor: pointer; }
.xw-opt:hover { border-color: ${K.ink}; }
.xw-opt.is-right { background: ${K.marker}; border-color: ${K.gold}; font-weight: 600; }
.xw-opt.is-wrong { border-color: ${K.wrong}; color: ${K.wrong}; text-decoration: line-through; }
.xw-opt.is-off { color: ${K.faint}; }
.xw-why { font-size: 14px; line-height: 1.55; color: ${K.sub}; padding-left: 36px; }
.xw-why b { color: ${K.ink}; }
.xw-foot { display: flex; align-items: center; gap: 16px; justify-content: space-between; padding: 12px 20px; border-top: 1px solid ${K.rule}; background: ${K.paper}; flex-wrap: wrap; }
.xw-nav { display: flex; gap: 6px; }
.xw-dot { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid ${K.rule}; border-radius: 4px; font-size: 13px; font-weight: 600; background: #fff; color: ${K.sub}; }
.xw-dot.is-done { background: ${K.ink}; border-color: ${K.ink}; color: #fff; }
.xw-dot.is-current { outline: 2px solid ${K.indigo}; outline-offset: 1px; }
.xw-score { font-size: 14px; color: ${K.sub}; font-variant-numeric: tabular-nums; }

/* How it works */
.lp-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; counter-reset: step; }
.lp-steps li { counter-increment: step; display: grid; gap: 12px; align-content: start; padding: 28px; background: ${K.card}; border: 1px solid ${K.rule}; border-radius: 12px; }
.lp-steps li::before { content: counter(step); display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 50%; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: ${K.navy}; background: linear-gradient(145deg, #FCD34D, ${K.gold}); box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35); }
.lp-steps li { box-shadow: 0 12px 30px rgba(26, 26, 46, 0.05); }
.lp-steps h3 { font-size: 22px; }
.lp-steps p { color: ${K.sub}; }

/* Skills table */
.lp-table-wrap { overflow-x: auto; }
.lp-skills { width: 100%; border-collapse: collapse; min-width: 640px; }
.lp-skills th, .lp-skills td { text-align: left; vertical-align: top; padding: 20px 24px 20px 0; border-bottom: 1px solid ${K.rule}; }
.lp-skills thead th { font-family: Inter, system-ui, sans-serif; font-size: 14px; font-weight: 600; color: ${K.faint}; padding-top: 0; border-bottom: 2px solid ${K.ink}; }
.lp-skills tbody th { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 700; width: 18%; }
.lp-skills td { color: ${K.sub}; width: 41%; }

/* Courses */
.lp-courses { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.lp-course { position: relative; overflow: hidden; background: ${K.card}; border: 1px solid ${K.rule}; border-radius: 14px; padding: 40px 36px 36px; display: grid; gap: 14px; align-content: start; box-shadow: 0 12px 30px rgba(79, 70, 229, 0.07); }
.lp-course::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 4px; background: linear-gradient(90deg, ${K.indigo}, #8B5CF6 55%, ${K.gold}); }
.lp-course h3 { font-size: 26px; }
.lp-course p { color: ${K.sub}; }
.lp-course ul { margin: 6px 0 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.lp-course li { padding-left: 20px; position: relative; }
.lp-course li::before { content: ''; position: absolute; left: 0; top: 0.65em; width: 8px; height: 8px; background: ${K.indigo}; border-radius: 2px; }
.lp-korea { margin-top: 24px; display: flex; align-items: center; justify-content: space-between; gap: 32px; padding: 28px 36px; background: ${K.goldSoft}; border: 1px solid #FCD34D; border-radius: 14px; }
.lp-korea > div { display: grid; gap: 8px; max-width: 640px; }
.lp-korea h3 { font-size: 22px; }
.lp-korea p { color: ${K.sub}; }

/* Prices */
.lp-faq-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 80px; align-items: start; }
.lp-faq-grid .lp-head { margin-bottom: 0; }

/* FAQ */
.lp-faq { border-top: 2px solid ${K.ink}; }
.lp-faq details { border-bottom: 1px solid ${K.rule}; }
.lp-faq summary { cursor: pointer; list-style: none; padding: 20px 40px 20px 0; font-weight: 600; position: relative; }
.lp-faq summary::-webkit-details-marker { display: none; }
.lp-faq summary::after { content: '+'; position: absolute; right: 4px; top: 16px; font-size: 24px; font-weight: 400; color: ${K.sub}; }
.lp-faq details[open] summary::after { content: '−'; }
.lp-faq details p { padding: 0 40px 22px 0; color: ${K.sub}; }

/* Closing */
.lp-closing { padding-block: 96px; background:
    radial-gradient(600px 300px at 90% 0%, rgba(245, 158, 11, 0.22), transparent 70%),
    radial-gradient(700px 400px at 0% 100%, rgba(79, 70, 229, 0.45), transparent 70%),
    linear-gradient(180deg, ${K.navy}, ${K.navyDeep}); }
.lp-closing-row { display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
.lp-closing h2 { color: #FFFFFF; font-size: 40px; line-height: 1.15; }
.lp-closing p { color: ${K.navyText}; font-size: 18px; margin-top: 10px; }

/* Footer */
.lp-foot { padding-block: 36px 104px; font-size: 14px; color: #94A3B8; background: ${K.navyDeep}; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.lp-foot a { color: ${K.gold}; }
.lp-foot-row { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
.lp-foot-name { color: #FFFFFF; font-weight: 600; }
.lp-foot-note { margin-top: 4px !important; max-width: 46em; }

@media (prefers-reduced-motion: reduce) {
  .lp * { transition: none !important; scroll-behavior: auto !important; }
}

@media (max-width: 1000px) {
  .lp-nav { display: none; }
  .lp-header-actions { margin-left: auto; }
  .lp-hero-grid { grid-template-columns: 1fr; gap: 56px; }
  .lp-hero h1 { max-width: 16ch; }
  .lp-auth { max-width: 520px; }
  .lp-faq-grid { grid-template-columns: 1fr; gap: 32px; }
  .lp-plans { grid-template-columns: 1fr; max-width: 520px; }
}
@media (max-width: 760px) {
  .lp { font-size: 16px; }
  .lp-section { padding-block: 72px; }
  .lp-hero { padding-block: 48px 72px; }
  .lp-hero h1 { font-size: 40px; }
  .lp-lede { font-size: 18px; }
  .lp-head { margin-bottom: 32px; }
  .lp-head h2, .lp-closing h2 { font-size: 30px; }
  .lp-head p { font-size: 16px; }
  .lp-steps { grid-template-columns: 1fr; gap: 32px; }
  .lp-courses { grid-template-columns: 1fr; }
  .lp-course { padding: 28px 24px; }
  .lp-korea { flex-direction: column; align-items: flex-start; padding: 24px; }
  .xw-body { grid-template-columns: 1fr; }
  .xw-passage { border-right: none; border-bottom: 1px solid ${K.rule}; padding: 24px 20px; }
  .xw-qs { padding: 24px 20px; }
  .xw-part { display: none; }
  .xw-opts, .xw-why { padding-left: 0; }
  .lp-closing { padding-block: 64px; }
  .lp-skills { min-width: 0; }
  .lp-skills thead { display: none; }
  .lp-skills, .lp-skills tbody, .lp-skills tr, .lp-skills th, .lp-skills td { display: block; width: auto !important; }
  .lp-skills tr { padding: 20px 0; border-bottom: 1px solid ${K.rule}; }
  .lp-skills tr:first-child { border-top: 2px solid ${K.gold}; }
  .lp-dark .lp-skills tr { border-bottom-color: rgba(255, 255, 255, 0.12); }
  .lp-dark .lp-skills td::before { color: #94A3B8; }
  .lp-skills th, .lp-skills td { padding: 0; border: none; }
  .lp-skills td { margin-top: 10px; }
  .lp-skills td::before { content: attr(data-label); display: block; font-size: 13px; font-weight: 600; color: ${K.faint}; }
}
@media (max-width: 520px) {
  .lp-wrap { padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .lp-hide-sm { display: none; }
  .lp-hero h1 { font-size: 34px; }
  .lp-cta-row .lp-btn { width: 100%; }
  .lp-auth-body { padding: 22px 18px 24px; }
  .lp-row, .lp-row3 { grid-template-columns: 1fr; gap: 0; }
  .lp-plan { padding: 26px 22px; }
}
`;
