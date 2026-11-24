// Class: activities the teacher runs in class (timed drills, games), newest first. Each opens inside the site.
import { useState } from 'react';
import StudentNav from '../components/StudentNav';
import { T } from '../theme';

const ACTIVITIES = [
  { id: 'fixit-24nov', title: 'Fix It and Write It', date: 'Tuesday 24 November', tag: '30 minutes · review of everything',
    desc: 'Twenty sentences, each with one mistake: spelling, grammar, graph language and Task 2 sentences. Rewrite each one correctly. A wrong answer gets a hint and a second try, then you copy the correct sentence so you remember it.',
    src: '/fixit.html' },
  { id: 'drills2-24nov', title: 'IELTS Timed Drills 2', date: 'Tuesday 24 November', tag: 'Spelling · Numbers · Reading · Writing',
    desc: 'Six drills on the small things that cost the most marks: spelling, numbers and dates, the word limit, paraphrasing, common grammar mistakes and linking words. Use headphones for Drills 1 and 2.',
    src: '/drills2.html' },
  { id: 'drills-24nov', title: 'IELTS Timed Drills', date: 'Tuesday 24 November', tag: 'Listening · Reading · Writing',
    desc: 'Six timed drills for the Final Exam: listening traps, True/False/Not Given, headings, graph language, a Task 1 overview and a Task 2 introduction. Use headphones for Drill 1.',
    src: '/drills.html' },
];

export default function ClassPage() {
  const [open, setOpen] = useState(null);
  const a = ACTIVITIES.find(x => x.id === open);
  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <StudentNav active="class" />
      <div style={{ maxWidth: a ? 1100 : 900, margin: '0 auto', padding: '24px 16px 48px', display: 'grid', gap: 16 }}>
        {!a ? <>
          <div style={{ background: T.navy, color: '#fff', borderRadius: 16, padding: '22px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: '#b0e5fb' }}>CLASS</div>
            <h1 style={{ margin: '4px 0 6px', fontSize: 28 }}>Today's class activities</h1>
            <div style={{ fontSize: 15, color: T.navyText, lineHeight: 1.5 }}>Open the activity your teacher tells you to. Newest first.</div>
          </div>
          {ACTIVITIES.map((x, i) => (
            <button key={x.id} type="button" onClick={() => setOpen(x.id)}
              style={{ textAlign: 'left', background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 20, cursor: 'pointer', fontFamily: T.font, display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.primary, background: T.primarySoft, borderRadius: 20, padding: '3px 10px' }}>{i === 0 ? 'Activity 1 · newest' : `Activity ${i + 1}`}</span>
                <span style={{ fontSize: 13, color: T.mid }}>{x.date} · {x.tag}</span>
              </div>
              <div style={{ fontSize: 21, fontWeight: 700 }}>{x.title}</div>
              <div style={{ fontSize: 15, color: T.muted, lineHeight: 1.5 }}>{x.desc}</div>
              <div style={{ color: T.primary, fontWeight: 700 }}>Open ›</div>
            </button>
          ))}
        </> : <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setOpen(null)} style={{ background: 'none', border: 0, color: T.primary, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: T.font, padding: 0 }}>‹ All class activities</button>
            <a href={a.src} target="_blank" rel="noreferrer" style={{ color: T.primary, fontWeight: 700, fontSize: 14 }}>Open full screen ↗</a>
          </div>
          <iframe title={a.title} src={a.src} allow="autoplay" style={{ width: '100%', height: 'calc(100vh - 150px)', minHeight: 600, border: `1px solid ${T.hairline}`, borderRadius: 16, background: '#fff' }} />
        </>}
      </div>
    </div>
  );
}
