import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNav from '../components/StudentNav';
import { T } from '../theme';
import { EMAIL, CLAUDE, SITUATIONS, WEBSITES } from '../content/everyday';

const TABS = [
  { id: 'email', label: 'Write an email' },
  { id: 'claude', label: 'How to use Claude' },
  { id: 'situations', label: 'Everyday situations' },
  { id: 'websites', label: 'Useful websites' },
];
const card = { background: '#fff', border: `1px solid ${T.hairline}`, borderRadius: 16, padding: 20 };
const h2 = { fontSize: 22, margin: '0 0 6px', color: T.navy };
const sub = { fontSize: 15, color: T.muted, margin: '0 0 16px', lineHeight: 1.5 };
const DRAFT_KEY = 'epic-email-practice';

function AskBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); if (q.trim()) navigate('/ai-learn', { state: { ask: q.trim() } }); }}
      style={{ display: 'flex', gap: 8, background: '#fff', borderRadius: 14, padding: 6, marginTop: 16 }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="AI Learn: search or ask anything about English…"
        style={{ flex: 1, border: 0, outline: 'none', fontSize: 15, padding: '10px 12px', fontFamily: 'inherit', minWidth: 0 }} />
      <button type="submit" style={{ border: 0, borderRadius: 10, background: T.primary, color: '#fff', fontWeight: 700, padding: '0 18px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Ask</button>
    </form>
  );
}

function EmailBox({ ex }) {
  return (
    <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <div style={{ background: '#f0f6ff', padding: '8px 14px', fontSize: 14, borderBottom: `1px solid ${T.hairline}` }}>
        <b>Subject:</b> {ex.subject}
      </div>
      <div style={{ padding: '12px 14px', fontSize: 15, lineHeight: 1.65, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif' }}>{ex.body}</div>
    </div>
  );
}

function EmailLesson() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(0);
  const [draft, setDraft] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') || { subject: '', body: '' }; } catch { return { subject: '', body: '' }; }
  });
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* blocked */ } }, [draft]);
  const words = draft.body.trim() ? draft.body.trim().split(/\s+/).length : 0;
  const checkWithAi = () => navigate('/ai-learn', {
    state: { ask: `Please check my email to a Korean professor. Correct the mistakes, show my sentence and the better sentence, and explain each change in one short line. Do not rewrite the whole email for me.\n\nSubject: ${draft.subject}\n\n${draft.body}` },
  });

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={card}>
        <h2 style={h2}>The 8 parts of a good email</h2>
        <p style={sub}>Formal emails (to a professor, a university office or an interviewer) follow the same simple pattern.</p>
        <div style={{ display: 'grid', gap: 8 }}>
          {EMAIL.parts.map((p, i) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr)', gap: 10, alignItems: 'start', padding: '8px 0', borderTop: i ? `1px solid ${T.tint}` : 'none' }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: T.primary, color: '#fff', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{i + 1}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name} <span style={{ fontWeight: 400, color: T.muted, fontSize: 14 }}>· {p.what}</span></div>
                <div style={{ marginTop: 4, background: '#fff8e1', borderLeft: '3px solid #f5b400', padding: '5px 10px', borderRadius: '0 6px 6px 0', fontSize: 14.5, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif' }}>{p.ex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h2 style={h2}>Example emails</h2>
        <p style={sub}>Click an example to open it. The first one is the email we practise in class.</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {EMAIL.examples.map((ex, i) => (
            <div key={ex.title} style={{ border: `1px solid ${open === i ? T.primary : T.hairline}`, borderRadius: 12, overflow: 'hidden' }}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', background: open === i ? T.primaryXSoft : '#fff', border: 0, padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>{ex.title}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.primary, background: T.primarySoft, borderRadius: 50, padding: '3px 10px', whiteSpace: 'nowrap' }}>{ex.tag}</span>
              </button>
              {open === i && <div style={{ padding: 12, background: '#f6f8fc' }}><EmailBox ex={ex} /></div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div style={card}>
          <h2 style={h2}>Informal → formal</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5 }}>
            <thead><tr><th style={{ textAlign: 'left', padding: 6, color: T.error }}>Don&apos;t write</th><th style={{ textAlign: 'left', padding: 6, color: T.success }}>Write</th></tr></thead>
            <tbody>{EMAIL.formalInformal.map(([a, b]) => <tr key={a} style={{ borderTop: `1px solid ${T.tint}` }}><td style={{ padding: 6, color: T.muted }}>{a}</td><td style={{ padding: 6, fontWeight: 600 }}>{b}</td></tr>)}</tbody>
          </table>
        </div>
        <div style={card}>
          <h2 style={h2}>Common mistakes</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {EMAIL.mistakes.map(([bad, good, why]) => (
              <div key={bad} style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                <div style={{ color: T.error, textDecoration: 'line-through' }}>{bad}</div>
                <div style={{ color: T.success, fontWeight: 600 }}>{good}</div>
                <div style={{ color: T.muted, fontSize: 13 }}>{why}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...card, borderTop: `5px solid ${T.primary}` }}>
        <h2 style={h2}>Your turn: write to a Korean professor</h2>
        <p style={sub}>Use the 8 parts. Introduce yourself, say what you want to study and ask one polite question. Aim for 100 to 150 words. Your writing is saved on this computer.</p>
        <input value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))} placeholder="Subject: …"
          style={{ width: '100%', border: `1.5px solid ${T.hairline}`, borderRadius: 10, padding: '10px 12px', fontSize: 15, fontFamily: 'inherit', marginBottom: 8 }} />
        <textarea value={draft.body} onChange={e => setDraft(d => ({ ...d, body: e.target.value }))} rows={12} placeholder={'Dear Professor …,\n\nMy name is …'}
          style={{ width: '100%', border: `1.5px solid ${T.hairline}`, borderRadius: 10, padding: '12px', fontSize: 15, lineHeight: 1.6, fontFamily: 'Georgia, serif', resize: 'vertical' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: words >= 100 ? T.success : T.muted }}>{words} words</span>
          <button type="button" onClick={checkWithAi} disabled={words < 20} style={{ height: 40, padding: '0 16px', borderRadius: 8, border: 0, background: words >= 20 ? T.primary : '#b8c3d6', color: '#fff', fontWeight: 700, cursor: words >= 20 ? 'pointer' : 'default', fontFamily: 'inherit' }}>Check with AI Learn</button>
          <button type="button" onClick={() => { try { navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`); } catch { /* not allowed */ } }} style={{ height: 40, padding: '0 16px', borderRadius: 8, border: `1px solid ${T.ink}`, background: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Copy</button>
        </div>
        <div style={{ marginTop: 14, background: '#f6f8fc', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Before you send: checklist</div>
          <ul style={{ margin: 0, paddingLeft: 20, columns: 2, columnGap: 24, fontSize: 14.5, lineHeight: 1.7 }}>{EMAIL.checklist.map(c => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

function ClaudeLesson() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={card}>
        <h2 style={h2}>What is Claude?</h2>
        <p style={{ ...sub, marginBottom: 10 }}>{CLAUDE.intro}</p>
        <a href="https://claude.ai" target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: T.primary }}>Open claude.ai ↗</a>
        <span style={{ color: T.muted, fontSize: 14 }}> · On this site, use <b>AI Learn</b> when your teacher opens it.</span>
      </div>
      <div style={card}>
        <h2 style={h2}>A good question has 4 parts</h2>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {CLAUDE.recipe.map((r, i) => (
            <div key={r.name} style={{ background: ['#e3eeff', '#e9f5e6', '#fff4e8', '#f3e8ff'][i], borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{i + 1}. {r.name}</div>
              <div style={{ fontSize: 14.5, marginTop: 4, fontFamily: 'Georgia, serif' }}>&ldquo;{r.ex}&rdquo;</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, background: T.navy, color: '#fff', borderRadius: 12, padding: '12px 14px', fontSize: 15, lineHeight: 1.6 }}>
          <b>All together:</b> &ldquo;I am a Sri Lankan student, my English is A2 level. Explain the present perfect tense. Use very simple words and 5 examples about studying in Korea. Give me a short table, then 5 practice questions with answers at the end.&rdquo;
        </div>
      </div>
      <div style={card}>
        <h2 style={h2}>Weak question → strong question</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {CLAUDE.badGood.map(([bad, good]) => (
            <div key={bad} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 0.3fr) minmax(0, 1fr)', gap: 10, alignItems: 'start', fontSize: 14.5 }}>
              <div style={{ background: T.errorSoft, color: T.error, borderRadius: 8, padding: '8px 10px', textDecoration: 'line-through' }}>{bad}</div>
              <div style={{ background: T.successSoft, color: '#1d4d14', borderRadius: 8, padding: '8px 10px', lineHeight: 1.5 }}>{good}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={card}>
        <h2 style={h2}>Questions you can try today</h2>
        <p style={sub}>Click one to ask AI Learn (when it is open).</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CLAUDE.prompts.map(p => (
            <button key={p} type="button" onClick={() => navigate('/ai-learn', { state: { ask: p } })} style={{ textAlign: 'left', border: `1px solid ${T.hairline}`, background: T.primaryXSoft, borderRadius: 10, padding: '9px 12px', fontSize: 14.5, cursor: 'pointer', fontFamily: 'inherit', color: T.inkSoft }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={card}>
        <h2 style={h2}>Use AI the smart way</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.8 }}>{CLAUDE.rules.map(r => <li key={r}>{r}</li>)}</ul>
      </div>
    </div>
  );
}

function Situations() {
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      {SITUATIONS.map(s => (
        <div key={s.title} style={card}>
          <h2 style={{ ...h2, fontSize: 19 }}>{s.title}</h2>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, letterSpacing: '.05em', margin: '8px 0 4px' }}>USEFUL PHRASES</div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.7 }}>{s.phrases.map(p => <li key={p}>{p}</li>)}</ul>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, letterSpacing: '.05em', margin: '12px 0 4px' }}>{s.dialogue[0][0] === 'Tip' ? 'TIPS' : 'EXAMPLE'}</div>
          <div style={{ background: '#f6f8fc', borderRadius: 10, padding: '8px 12px', fontSize: 14.5, lineHeight: 1.65 }}>
            {s.dialogue.map(([who, line], i) => <div key={i}><b style={{ color: T.primary }}>{who}:</b> {line}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Websites() {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
      {WEBSITES.map(w => (
        <a key={w.url} href={w.url} target="_blank" rel="noreferrer" style={{ ...card, textDecoration: 'none', color: T.ink, display: 'block' }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: T.primary }}>{w.name} ↗</div>
          <div style={{ fontSize: 13, color: T.mid, margin: '2px 0 6px', overflowWrap: 'anywhere' }}>{w.url.replace(/^https?:\/\//, '')}</div>
          <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{w.what}</div>
        </a>
      ))}
    </div>
  );
}

export default function EverydayEnglish() {
  const [tab, setTab] = useState(() => { try { return sessionStorage.getItem('everyday-tab') || 'email'; } catch { return 'email'; } });
  useEffect(() => { try { sessionStorage.setItem('everyday-tab', tab); } catch { /* blocked */ } }, [tab]);
  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: T.font, color: T.ink }}>
      <StudentNav active="everyday" />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 16px 64px' }}>
        <div style={{ background: T.navy, color: '#fff', borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', color: '#b0e5fb' }}>GENERAL ENGLISH</div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 28 }}>English for your day to day life</h1>
          <div style={{ fontSize: 15, color: T.navyText, lineHeight: 1.5 }}>Real English you will use every day: emails, messages, asking for help, and life in Korea.</div>
          <AskBar />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '18px 0', paddingBottom: 2 }}>
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{ whiteSpace: 'nowrap', height: 40, padding: '0 16px', borderRadius: 50, border: `1.5px solid ${tab === t.id ? T.primary : T.hairline}`, background: tab === t.id ? T.primary : '#fff', color: tab === t.id ? '#fff' : T.ink, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>{t.label}</button>
          ))}
        </div>
        {tab === 'email' && <EmailLesson />}
        {tab === 'claude' && <ClaudeLesson />}
        {tab === 'situations' && <Situations />}
        {tab === 'websites' && <Websites />}
      </div>
    </div>
  );
}
