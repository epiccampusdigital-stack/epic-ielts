import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function SpeakingResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/attempts/${attemptId}/speaking/result`, api())
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    let tries = 0;
    const poll = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/attempts/${attemptId}/speaking/feedback`, api());
        if (res.data.status === 'ready') {
          setFeedback(res.data.feedback);
          setFeedbackLoading(false);
          clearInterval(interval);
        }
      } catch (e) { console.error(e); }
      if (++tries >= 30) { setFeedbackLoading(false); clearInterval(interval); }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [attemptId]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#000814', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ textAlign:'center', color:'white' }}>
        <div style={{ width:48, height:48, border:'3px solid rgba(37,99,235,0.3)', borderTop:'3px solid #2563eb', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'rgba(255,255,255,0.5)' }}>Loading results...</p>
      </div>
    </div>
  );

  const sub = data?.speakingSubmission;
  const overall = sub?.overallBand;

  const getBandColor = (b) => {
    if (!b) return '#94a3b8';
    if (b >= 7) return '#10b981';
    if (b >= 5.5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ minHeight:'100vh', background:'#000814', fontFamily:'Inter,sans-serif', color:'white' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', padding:'48px 40px', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>EPIC IELTS Speaking Test</p>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:32, color:'white', marginBottom:8 }}>Speaking Test Complete 🎤</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:32 }}>{data?.paper?.title}</p>
        <div style={{ display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap' }}>
          {[
            { label:'Part 1', value: sub?.part1Band, icon:'💬' },
            { label:'Overall Band', value: overall, icon:'⭐', large: true },
            { label:'Part 3', value: sub?.part3Band, icon:'🌐' }
          ].map(({ label, value, icon, large }) => (
            <div key={label} style={{ width: large ? 140 : 110, height: large ? 140 : 110, borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:`${large?5:3}px solid ${getBandColor(value)}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:`0 0 ${large?40:20}px ${getBandColor(value)}40` }}>
              <span style={{ fontFamily:'Playfair Display,serif', fontSize: large ? 40 : 28, fontWeight:700, color: getBandColor(value), lineHeight:1 }}>{value ? Number(value).toFixed(1) : '—'}</span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:4, textAlign:'center', padding:'0 8px' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 20px' }}>

        {feedbackLoading ? (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:40, textAlign:'center', marginBottom:24 }}>
            <div style={{ width:48, height:48, border:'3px solid rgba(37,99,235,0.3)', borderTop:'3px solid #2563eb', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 20px' }} />
            <p style={{ color:'#60a5fa', fontWeight:600, marginBottom:8 }}>EPIC AI is transcribing and marking your speaking...</p>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>This takes 1-3 minutes. Please wait.</p>
          </div>
        ) : feedback ? (
          Object.entries(feedback).map(([partKey, partData]) => {
            const partNum = parseInt(partKey.replace('part', ''));
            const partInfo = { 1: { icon:'💬', color:'#2563eb' }, 2: { icon:'🎯', color:'#7c3aed' }, 3: { icon:'🌐', color:'#0891b2' } }[partNum] || {};
            const fb = partData.feedback;
            if (!fb) return null;
            return (
              <div key={partKey} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${partInfo.color}30`, borderRadius:20, padding:28, marginBottom:20, animation:'fadeUp 0.4s ease' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, paddingBottom:16, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:24 }}>{partInfo.icon}</span>
                    <div>
                      <div style={{ fontSize:16, fontWeight:700, color:'white' }}>Part {partNum} Feedback</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{partData.transcript?.substring(0, 80)}...</div>
                    </div>
                  </div>
                  <div style={{ fontSize:36, fontWeight:900, color: getBandColor(fb.band), fontFamily:'Playfair Display,serif' }}>
                    {fb.band ? Number(fb.band).toFixed(1) : '—'}
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
                  {[
                    { label:'Fluency', value: fb.fluencyCoherence },
                    { label:'Vocabulary', value: fb.lexicalResource },
                    { label:'Grammar', value: fb.grammaticalRange },
                    { label:'Pronunciation', value: fb.pronunciation }
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'14px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:22, fontWeight:800, color: getBandColor(value), marginBottom:4 }}>{value || '—'}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
                      <div style={{ height:3, background:'rgba(255,255,255,0.1)', borderRadius:2, marginTop:8, overflow:'hidden' }}>
                        <div style={{ width:`${((value||0)/9)*100}%`, height:'100%', background: getBandColor(value), borderRadius:2 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {fb.feedback && <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.8, marginBottom:16, background:'rgba(255,255,255,0.03)', borderRadius:12, padding:16 }}>{fb.feedback}</p>}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  {fb.strengths?.length > 0 && (
                    <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:16 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'#10b981', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>✅ Strengths</p>
                      {fb.strengths.map((s, i) => <p key={i} style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.6, margin:'0 0 6px' }}>• {s}</p>)}
                    </div>
                  )}
                  {fb.improvements?.length > 0 && (
                    <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'#f59e0b', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>🎯 Improve</p>
                      {fb.improvements.map((s, i) => <p key={i} style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.6, margin:'0 0 6px' }}>• {s}</p>)}
                    </div>
                  )}
                </div>

                {fb.finalReport && (
                  <div style={{ background:`linear-gradient(135deg,${partInfo.color}15,${partInfo.color}08)`, border:`1px solid ${partInfo.color}30`, borderRadius:12, padding:20, marginTop:16 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:partInfo.color, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>📝 AI Examiner Note</p>
                    <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.8, margin:0 }}>{fb.finalReport}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:40, textAlign:'center', marginBottom:24 }}>
            <p style={{ color:'rgba(255,255,255,0.4)', marginBottom:16 }}>AI feedback not available yet.</p>
            <button onClick={() => window.location.reload()}
              style={{ padding:'10px 24px', background:'#2563eb', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
              Refresh
            </button>
          </div>
        )}

        <div style={{ textAlign:'center', paddingBottom:40 }}>
          <button onClick={() => navigate('/student/dashboard')}
            style={{ padding:'14px 36px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
