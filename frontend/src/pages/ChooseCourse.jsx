import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import StudentNav, { readUser, saveCourse } from '../components/StudentNav';
import { getTrack } from '../utils/track';
import { T } from '../theme';

// First screen after logging in: pick the course. New students go straight to that course's placement test.
const COURSES = [
  {
    key: 'GENERAL', title: 'General English', tag: 'Everyday English',
    text: 'Daily lessons, weekly quizzes and interview practice for students going abroad. Scored out of 100 with a CEFR level.',
    points: ['30 daily lessons', '5 weekly quizzes', 'Placement test in 4 parts'], tone: '#e9f5e6', ink: '#276a1a',
  },
  {
    key: 'IELTS', title: 'IELTS Academic', tag: 'Exam preparation',
    text: 'Full timed papers in Reading, Listening, Writing and Speaking, marked with a band score for each skill.',
    points: ['Computer-test format', 'Band score for every skill', 'Levels to move up'], tone: '#e3eeff', ink: '#003b8f',
  },
];

export default function ChooseCourse() {
  const navigate = useNavigate();
  const user = readUser();
  const first = (user.name || '').split(' ')[0];
  const current = user.course || null;
  const [busy, setBusy] = useState(null);

  const choose = async key => {
    setBusy(key);
    saveCourse(key);
    try {
      const res = await axios.get(`${API_URL}/api/attempts/placement/mine`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const mine = (Array.isArray(res.data) ? res.data : []).filter(a => (a.paper?.track === 'GENERAL') === (key === 'GENERAL'));
      navigate(mine.length === 0 ? '/placement-test' : '/student/dashboard');
    } catch {
      navigate('/student/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: T.font, color: T.ink }}>
      <style>{`
        .cc-grid, .cc-grid * { box-sizing: border-box; }
        .cc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cc-tile { text-align: left; border: 1px solid ${T.hairline}; border-radius: 16px; background: #fff; padding: 0; overflow: hidden; cursor: pointer; font: inherit; color: inherit; display: flex; flex-direction: column; transition: border-color 150ms; }
        .cc-tile:hover { border-color: ${T.primary}; }
        .cc-tile:disabled { cursor: progress; opacity: .7; }
        @media (max-width: 720px) { .cc-grid { grid-template-columns: 1fr; } }
      `}</style>
      <StudentNav active={null} />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 32, lineHeight: 1.2, letterSpacing: '-0.3px', margin: '0 0 8px', fontWeight: 600 }}>
          {first ? `Welcome, ${first}.` : 'Welcome.'} Which course are you studying?
        </h1>
        <p style={{ margin: '0 0 32px', color: T.muted, fontSize: 18 }}>
          You can switch between them at any time from the top bar.
        </p>
        <div className="cc-grid">
          {COURSES.map(c => {
            const isCurrent = (current || getTrack()) === c.key && !!current;
            return (
              <button key={c.key} type="button" className="cc-tile" onClick={() => choose(c.key)} disabled={!!busy}>
                <div style={{ background: c.tone, height: 96, padding: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ color: c.ink, fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>{c.tag}</span>
                  {isCurrent && <span style={{ background: '#fff', color: T.ink, fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>Your course</span>}
                </div>
                <div style={{ padding: 24, display: 'grid', gap: 10, flex: 1, width: '100%' }}>
                  <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.2px' }}>{c.title}</span>
                  <span style={{ fontSize: 16, color: T.muted, lineHeight: 1.5 }}>{c.text}</span>
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {c.points.map(p => <span key={p} style={{ fontSize: 13, padding: '2px 8px', borderRadius: 2, background: T.tint, color: T.navy }}>{p}</span>)}
                  </span>
                </div>
                <div style={{ padding: '0 24px 24px', width: '100%' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 16px', borderRadius: 8, background: T.primary, color: '#fff', fontSize: 14, fontWeight: 600, letterSpacing: '0.14px' }}>
                    {busy === c.key ? 'Opening…' : `Continue with ${c.title}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
