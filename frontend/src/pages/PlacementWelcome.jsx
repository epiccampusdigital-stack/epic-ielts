import StudentNav from '../components/StudentNav';

const C = { navy: '#1A1A2E', indigo: '#4F46E5', gold: '#F59E0B', bg: '#F8FAFC', card: '#FFFFFF', line: '#E2E8F0', sub: '#475569', faint: '#64748B' };
const SERIF = "'Playfair Display', Georgia, serif";

function Mark() {
  return <div style={{ width: 32, height: 3, background: C.gold, borderRadius: 2, marginBottom: 12 }} />;
}

// First screen for a brand new student: pick the course, then take that course's placement test
export default function PlacementWelcome({ onChoose }) {
  const name = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').name?.split(' ')[0] || ''; } catch { return ''; }
  })();
  const options = [
    { key: 'GENERAL', title: 'General English', note: 'For the Korea program and everyday English. Four short tests, about 2 hours in total.' },
    { key: 'IELTS', title: 'IELTS', note: 'For students preparing for the IELTS exam. Full Reading, Writing, Listening and Speaking papers.' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif', color: C.text }}>
      <style>{`
        .gp-btn { transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease; }
        .gp-btn:hover { box-shadow: 0 10px 24px rgba(26,26,46,0.08); transform: translateY(-2px); }
        .gp-btn:focus-visible { outline: 3px solid #A5B4FC; outline-offset: 2px; }
      `}</style>
      <StudentNav active="placement" />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 16px 64px' }}>
        <Mark />
        <h1 style={{ fontFamily: SERIF, fontSize: 34, margin: '0 0 10px', lineHeight: 1.15 }}>
          Welcome to EPIC{name ? `, ${name}` : ''}
        </h1>
        <p style={{ color: C.sub, fontSize: 16, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 560 }}>
          Your first step is a placement test. It shows your teachers what you already know, so your lessons start at the right level.
          Which course are you here for?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {options.map(o => (
            <button key={o.key} type="button" className="gp-btn" onClick={() => onChoose(o.key)} style={{
              textAlign: 'left', background: C.card, border: `1px solid ${C.line}`, borderTop: `3px solid ${o.key === 'GENERAL' ? C.gold : C.indigo}`,
              borderRadius: 16, padding: '22px 22px 20px', cursor: 'pointer', fontFamily: 'inherit', color: C.text,
            }}>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{o.title}</div>
              <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.55, marginBottom: 16 }}>{o.note}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.indigo }}>Start this placement →</span>
            </button>
          ))}
        </div>
        <p style={{ marginTop: 22, fontSize: 13, color: C.faint }}>You can switch course at any time from the top bar.</p>
      </div>
    </div>
  );
}
