import { useNavigate } from 'react-router-dom';

// Result page for a General English writing or speaking test: a score out of 100, a level and
// simple feedback. No IELTS bands.

const C = {
  navy: '#1A1A2E', deep: '#12122A', indigo: '#4F46E5', indigoSoft: '#EEF2FF', gold: '#F59E0B',
  bg: '#F8FAFC', card: '#FFFFFF', line: '#E2E8F0', sub: '#475569', faint: '#64748B',
};
const SERIF = "'Playfair Display', Georgia, serif";

const CRITERIA = {
  task: 'Answering the task',
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  organisation: 'Organisation',
  fluency: 'Fluency',
};

function levelFor(score) {
  if (score == null) return null;
  if (score >= 90) return 'B2';
  if (score >= 75) return 'B1';
  if (score >= 50) return 'A2';
  if (score >= 25) return 'A1';
  return 'Pre-A1';
}

export default function GeSkillResult({ skill, title, feedback, loading, failed, responses = [] }) {
  const navigate = useNavigate();
  const score = feedback?.score ?? null;
  const level = feedback?.level || levelFor(score);
  const unit = skill === 'SPEAKING' ? 'Part' : 'Task';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif', color: C.navy }}>
      <style>{`
        @keyframes ge-spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) { .ge-hero { padding: 28px 20px !important; } .ge-hero-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <section className="ge-hero" style={{
        background: `radial-gradient(circle at 85% 10%, rgba(245,158,11,0.18), transparent 45%), linear-gradient(135deg, ${C.deep} 0%, ${C.navy} 55%, #2A2560 100%)`,
        color: '#fff', padding: '40px 40px 44px',
      }}>
        <div className="ge-hero-grid" style={{ maxWidth: 880, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 600, marginBottom: 10 }}>
              General English · {skill === 'SPEAKING' ? 'Speaking' : 'Writing'}
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 30, margin: '0 0 8px', lineHeight: 1.2 }}>{title || 'Your result'}</h1>
            <p style={{ margin: 0, color: '#CBD5E1', fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>
              {loading ? 'Your answers are being marked. This usually takes a minute or two.'
                : failed ? 'Marking did not finish. Please tell your teacher.'
                  : feedback?.summary}
            </p>
          </div>
          <div style={{ textAlign: 'center', minWidth: 140 }}>
            {loading ? (
              <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,0.2)', borderTop: `3px solid ${C.gold}`, borderRadius: '50%', animation: 'ge-spin 0.8s linear infinite', margin: '0 auto' }} />
            ) : (
              <>
                <div style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 700, lineHeight: 1 }}>{score == null ? '–' : score}</div>
                <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>out of 100</div>
                {level && <div style={{ marginTop: 12, display: 'inline-block', padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', fontSize: 13, fontWeight: 600 }}>Level {level}</div>}
              </>
            )}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '28px 16px 64px', display: 'grid', gap: 20 }}>
        {feedback?.criteria && (
          <section style={card}>
            <h2 style={h2}>Your four areas</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {Object.entries(feedback.criteria).map(([k, v]) => (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: C.sub, fontWeight: 500 }}>{CRITERIA[k] || k}</span>
                    <span style={{ fontWeight: 700 }}>{v} / 25</span>
                  </div>
                  <div style={{ height: 8, background: '#EEF2F7', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(v / 25) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.indigo}, #7C73F0)`, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(feedback?.strengths?.length > 0 || feedback?.improvements?.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {feedback?.strengths?.length > 0 && (
              <section style={card}>
                <h2 style={h2}>What went well</h2>
                <ul style={ul}>{feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </section>
            )}
            {feedback?.improvements?.length > 0 && (
              <section style={card}>
                <h2 style={h2}>What to work on</h2>
                <ul style={ul}>{feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </section>
            )}
          </div>
        )}

        {responses.map((r, i) => {
          const item = feedback?.items?.[i];
          return (
            <section key={i} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 10 }}>
                <h2 style={{ ...h2, margin: 0 }}>{unit} {i + 1}</h2>
                {item?.score != null && <span style={{ fontWeight: 700, color: C.indigo }}>{item.score} / 100</span>}
              </div>
              {r.prompt && <p style={{ margin: '0 0 12px', fontSize: 14, color: C.sub, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.prompt}</p>}
              <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: '12px 14px', fontFamily: 'Lora, Georgia, serif', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {r.response?.trim() || <span style={{ color: C.faint, fontStyle: 'italic' }}>No answer</span>}
              </div>
              {item?.feedback && <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.6 }}>{item.feedback}</p>}
            </section>
          );
        })}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => navigate('/placement-test')} style={{ ...btn, background: C.indigo, color: '#fff', border: 'none' }}>Back to placement test</button>
          <button type="button" onClick={() => navigate('/student/dashboard')} style={btn}>Dashboard</button>
        </div>
      </div>
    </div>
  );
}

const card = { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '22px 24px' };
const h2 = { fontFamily: SERIF, fontSize: 20, margin: '0 0 14px' };
const ul = { margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14, color: '#1A1A2E' };
const btn = { padding: '11px 20px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' };
