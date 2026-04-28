import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const TYPES = [
  { id:'READING',   icon:'📖', color:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe', desc:'Passages + Q&A, True/False, MCQ, Short Answer' },
  { id:'WRITING',   icon:'✍️', color:'#15803d', bg:'#f0fdf4', border:'#bbf7d0', desc:'Task 1 (chart/image) + Task 2 (essay prompt)' },
  { id:'LISTENING', icon:'🎧', color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', desc:'Audio file + comprehension questions' },
  { id:'SPEAKING',  icon:'🎤', color:'#c2410c', bg:'#fff7ed', border:'#fed7aa', desc:'Part 1, 2 & 3 speaking prompts' },
];

export default function CreatePaper() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1); // 1=type, 2=details
  const [type, setType]       = useState('');
  const [title, setTitle]     = useState('');
  const [code, setCode]       = useState('');
  const [time, setTime]       = useState(60);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const s = { fontFamily:'Inter,sans-serif' };
  const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box', background:'#fff' };
  const lbl = { display:'block', fontSize:'11px', fontWeight:'700', color:'#64748b', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' };

  const create = async () => {
    if (!title.trim() || !code.trim()) { setErr('Title and Code are required.'); return; }
    setSaving(true); setErr('');
    try {
      const r = await axios.post(`${API_URL}/api/admin/papers`, { paperCode: code, testType: type, title, timeLimitMin: time, status:'ACTIVE', instructions:'' }, auth());
      navigate(`/admin/papers/${r.data.id}`);
    } catch(e) {
      setErr(e.response?.data?.error || e.message);
      setSaving(false);
    }
  };

  return (
    <div style={{...s, minHeight:'100vh', background:'#f8fafc', padding:'32px 16px'}}>
      <div style={{maxWidth:'760px', margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'32px'}}>
          <button onClick={() => navigate('/admin/dashboard')}
            style={{padding:'8px 16px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', cursor:'pointer', fontWeight:'600', color:'#475569', fontSize:'13px'}}>
            ← Back
          </button>
          <div>
            <h1 style={{fontSize:'22px', fontWeight:'800', color:'#1a1a2e', margin:0}}>Create New Paper</h1>
            <p style={{fontSize:'13px', color:'#94a3b8', margin:'2px 0 0'}}>Step {step} of 2 — {step===1?'Choose test type':'Enter paper details'}</p>
          </div>
        </div>

        {/* Step 1 — Choose type */}
        {step === 1 && (
          <div>
            <p style={{fontSize:'15px', color:'#475569', marginBottom:'20px', fontWeight:'500'}}>What type of paper are you creating?</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'28px'}}>
              {TYPES.map(t => (
                <div key={t.id} onClick={() => setType(t.id)}
                  style={{background: type===t.id ? t.bg : '#fff', border: `2px solid ${type===t.id ? t.color : '#e2e8f0'}`, borderRadius:'16px', padding:'24px', cursor:'pointer', transition:'all .2s'}}>
                  <div style={{fontSize:'32px', marginBottom:'10px'}}>{t.icon}</div>
                  <div style={{fontSize:'16px', fontWeight:'800', color: type===t.id ? t.color : '#1e293b', marginBottom:'6px'}}>{t.id}</div>
                  <div style={{fontSize:'12px', color:'#64748b', lineHeight:'1.5'}}>{t.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { if(type) setStep(2); else setErr('Please choose a type.'); }}
              style={{width:'100%', padding:'14px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'15px', cursor:'pointer'}}>
              Continue →
            </button>
            {err && <p style={{color:'#dc2626', fontSize:'13px', marginTop:'10px'}}>{err}</p>}
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div style={{background:'#fff', borderRadius:'20px', padding:'32px', border:'1px solid #e2e8f0'}}>
            {/* Type badge */}
            {(() => { const t = TYPES.find(x => x.id===type);
              return <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:t.bg, border:`1px solid ${t.border}`, borderRadius:'20px', padding:'6px 14px', marginBottom:'24px'}}>
                <span>{t.icon}</span>
                <span style={{fontWeight:'700', color:t.color, fontSize:'13px'}}>{t.id} Paper</span>
              </div>;
            })()}

            <div style={{display:'grid', gap:'18px'}}>
              <div>
                <label style={lbl}>Paper Title *</label>
                <input style={inp} value={title} onChange={e=>setTitle(e.target.value)} placeholder={
                  type==='READING'   ? 'e.g. The Industrial Revolution, Coral Reefs & AI Ethics' :
                  type==='WRITING'   ? 'e.g. IELTS Academic Writing — Practice Test 1' :
                  type==='LISTENING' ? 'e.g. IELTS Listening — Urban Development Recording' :
                                       'e.g. IELTS Speaking — Daily Life & Work'
                }/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                <div>
                  <label style={lbl}>Paper Code *</label>
                  <input style={inp} value={code} onChange={e=>setCode(e.target.value)} placeholder="e.g. 006" />
                </div>
                <div>
                  <label style={lbl}>Time Limit (minutes)</label>
                  <input style={inp} type="number" value={time} onChange={e=>setTime(parseInt(e.target.value)||60)} />
                </div>
              </div>

              {/* Type-specific hints */}
              <div style={{background:'#f8fafc', borderRadius:'10px', padding:'14px 16px', border:'1px solid #e2e8f0'}}>
                <p style={{fontSize:'12px', color:'#64748b', margin:0, lineHeight:'1.7'}}>
                  {type==='READING'   && '📌 After creating, you\'ll be taken to the editor where you can add passages, questions (T/F/NG, MCQ, short answer, etc.) and section instructions.'}
                  {type==='WRITING'   && '📌 After creating, you\'ll add Task 1 (chart description prompt + upload a chart image) and Task 2 (essay question). Students write their responses under timed conditions.'}
                  {type==='LISTENING' && '📌 After creating, you\'ll upload the audio file and add comprehension questions. The audio plays automatically at the start of the exam.'}
                  {type==='SPEAKING'  && '📌 After creating, you\'ll add Part 1, 2 & 3 speaking prompts. Students record their responses directly in the browser.'}
                </p>
              </div>

              {err && <p style={{color:'#dc2626', fontSize:'13px', margin:0}}>{err}</p>}

              <div style={{display:'flex', gap:'12px', marginTop:'4px'}}>
                <button onClick={() => { setStep(1); setErr(''); }}
                  style={{padding:'12px 20px', background:'#f1f5f9', color:'#475569', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'600', fontSize:'14px'}}>
                  ← Change Type
                </button>
                <button onClick={create} disabled={saving}
                  style={{flex:1, padding:'12px', background:saving?'#94a3b8':'#10b981', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'800', fontSize:'15px', cursor:'pointer'}}>
                  {saving ? 'Creating…' : `✅ Create ${type} Paper →`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
