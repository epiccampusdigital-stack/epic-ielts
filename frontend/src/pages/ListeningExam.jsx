import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function ListeningExam() {
  const params = useParams();
  const attemptId = params.attemptId || params.id;
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const autosaveRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/attempts/${attemptId}`, api())
      .then(r => {
        setAttempt(r.data);
        setPaper(r.data.paper);
        setQuestions(r.data.paper?.questions || []);
        const mins = r.data.paper?.timeLimitMin || 40;
        const started = new Date(r.data.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setTimeLeft(Math.max(0, mins * 60 - elapsed));
      });
  }, [attemptId]);

  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleEnd(true); return 0; }
        return t - 1;
      });
    }, 1000);
    autosaveRef.current = setInterval(saveAnswers, 30000);
    return () => { clearInterval(timerRef.current); clearInterval(autosaveRef.current); };
  }, [timeLeft !== null]);

  const saveAnswers = async () => {
    const payload = Object.entries(answers).map(([questionId, answer]) => ({ 
        questionId: parseInt(questionId), 
        studentAnswer: String(answer) 
    }));
    if (payload.length > 0) {
      try {
        await axios.put(`${API_URL}/api/attempts/${attemptId}/autosave`, { answers: payload }, api());
      } catch (e) { console.error('Autosave failed'); }
    }
  };

  const startAudio = () => {
    setShowWarning(false);
    setAudioStarted(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleAudioEnd = () => {
    setAudioEnded(true);
  };

  const handleEnd = async (auto = false) => {
    if (!auto) {
      const confirmed = window.confirm(`Submit listening test? You have answered ${Object.keys(answers).length} of ${questions.length} questions.`);
      if (!confirmed) return;
    }
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(autosaveRef.current);
    await saveAnswers();
    
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({ 
        questionId: parseInt(questionId), 
        studentAnswer: String(answer) 
      }));
      await axios.post(`${API_URL}/api/attempts/${attemptId}/end`, { answers: payload }, api());
      navigate(`/exam/${attemptId}/results`);
    } catch {
      alert('Failed to submit.');
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (!paper) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f7ff',fontFamily:'Inter,sans-serif'}}><p>Loading...</p></div>;

  const audioUrl = paper.audioUrl ? `${API_URL}${paper.audioUrl}` : null;

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',fontFamily:'Inter,sans-serif',background:'#f0f7ff',overflow:'hidden'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#1e3a5f,#1d4ed8)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <img src="/logo.png" alt="EPIC" style={{height:28,filter:'brightness(0) invert(1)'}}/>
          <div>
            <div style={{color:'#ffffff',fontSize:13,fontWeight:600}}>EPIC IELTS — Listening {paper.paperCode}</div>
            <div style={{color:'#93c5fd',fontSize:11}}>{paper.title}</div>
          </div>
        </div>
        <div style={{background:timeLeft<300?'#dc2626':timeLeft<600?'#d97706':'rgba(255,255,255,0.15)',color:'#ffffff',padding:'7px 18px',borderRadius:8,fontWeight:700,fontSize:18,minWidth:90,textAlign:'center'}}>
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
      </div>

      {/* Warning overlay */}
      {showWarning && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#ffffff',borderRadius:20,padding:40,maxWidth:480,width:'90%',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>🎧</div>
            <h2 style={{fontFamily:'Playfair Display,serif',color:'#1e3a5f',marginBottom:12}}>Listening Test Instructions</h2>
            <div style={{background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:12,padding:16,marginBottom:20,textAlign:'left'}}>
              <p style={{fontSize:13,color:'#92400e',fontWeight:600,marginBottom:8}}>⚠️ Important Rules:</p>
              <ul style={{paddingLeft:18,margin:0,fontSize:13,color:'#78350f',lineHeight:1.8}}>
                <li>The audio will play ONCE only</li>
                <li>You cannot rewind or replay the audio</li>
                <li>Put on your headphones before starting</li>
                <li>Answer questions while listening</li>
                <li>You have extra time after audio ends to review</li>
              </ul>
            </div>
            <button onClick={startAudio}
              style={{padding:'14px 32px',background:'#2563eb',color:'white',border:'none',borderRadius:10,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              🎧 Start Listening Test
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'40% 60%',overflow:'hidden'}}>

        {/* Left — Audio player */}
        <div style={{background:'#1e3a5f',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,gap:24}}>
          <div style={{fontSize:64}}>🎧</div>
          <h3 style={{color:'#ffffff',fontFamily:'Playfair Display,serif',textAlign:'center',margin:0}}>
            {audioStarted ? (audioEnded ? 'Audio Complete' : 'Now Playing...') : 'Waiting to start'}
          </h3>

          {audioUrl && (
            <audio ref={audioRef} onEnded={handleAudioEnd} style={{display:'none'}} preload="auto">
              <source src={audioUrl}/>
            </audio>
          )}

          {audioStarted && !audioEnded && (
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#ef4444',animation:'pulse 1s infinite'}}/>
              <span style={{color:'#93c5fd',fontSize:13,fontWeight:600}}>LIVE — Answer while listening</span>
            </div>
          )}

          {audioEnded && (
            <div style={{background:'rgba(255,255,255,0.1)',borderRadius:12,padding:16,textAlign:'center'}}>
              <p style={{color:'#93c5fd',fontSize:13,margin:0}}>Audio has finished. Review your answers and click Submit.</p>
            </div>
          )}

          {!audioUrl && (
            <div style={{background:'rgba(255,255,255,0.1)',borderRadius:12,padding:16,textAlign:'center'}}>
              <p style={{color:'#fcd34d',fontSize:13}}>⚠️ No audio file found for this paper. Contact your teacher.</p>
            </div>
          )}

          <div style={{width:'100%',background:'rgba(255,255,255,0.1)',borderRadius:8,padding:16}}>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:11,textAlign:'center',margin:0}}>
              {Object.keys(answers).length} of {questions.length} questions answered
            </p>
            <div style={{height:4,background:'rgba(255,255,255,0.2)',borderRadius:2,marginTop:8,overflow:'hidden'}}>
              <div style={{width:`${(Object.keys(answers).length/Math.max(questions.length,1))*100}%`,height:'100%',background:'#60a5fa',borderRadius:2,transition:'width 0.3s'}}/>
            </div>
          </div>
        </div>

        {/* Right — Questions */}
        <div style={{overflowY:'auto',padding:24,background:'#ffffff'}}>
          <p style={{fontSize:11,fontWeight:700,color:'#1d4ed8',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:20}}>
            Answer while you listen — {questions.length} questions
          </p>

          {questions.map((q, idx) => (
            <div key={q.id} style={{marginBottom:24,paddingBottom:20,borderBottom:idx<questions.length-1?'1px solid #f1f5f9':'none'}}>
              <div style={{display:'flex',gap:12,marginBottom:12,alignItems:'flex-start'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:answers[q.id]?'#2563eb':'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:answers[q.id]?'#ffffff':'#64748b',flexShrink:0,transition:'all 0.2s'}}>
                  {q.questionNumber}
                </div>
                <p style={{fontSize:14,color:'#1e293b',lineHeight:1.6,fontWeight:500,margin:0,paddingTop:4}}>{q.content}</p>
              </div>

              {q.questionType === 'MULTIPLE_CHOICE' && q.options && (
                <div style={{paddingLeft:40}}>
                  {(typeof q.options==='string'?JSON.parse(q.options):q.options).map((opt,i)=>(
                    <button key={i} onClick={()=>setAnswers(a=>({...a,[q.id]:opt}))}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',border:`1.5px solid ${answers[q.id]===opt?'#2563eb':'#e2e8f0'}`,borderRadius:10,background:answers[q.id]===opt?'#eff6ff':'#ffffff',cursor:'pointer',marginBottom:8,width:'100%',fontFamily:'Inter,sans-serif',textAlign:'left',transition:'all 0.15s'}}>
                      <div style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${answers[q.id]===opt?'#2563eb':'#e2e8f0'}`,background:answers[q.id]===opt?'#2563eb':'transparent',flexShrink:0}}/>
                      <span style={{fontSize:13,color:answers[q.id]===opt?'#1d4ed8':'#475569',fontWeight:answers[q.id]===opt?600:400}}>{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {(q.questionType==='SHORT_ANSWER'||q.questionType==='FORM_COMPLETION'||q.questionType==='NOTE_COMPLETION'||q.questionType==='SENTENCE_COMPLETION') && (
                <div style={{paddingLeft:40}}>
                  <input type="text" value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}
                    placeholder="Write your answer..."
                    style={{width:'100%',border:'none',borderBottom:'2px solid #e2e8f0',padding:'8px 4px',fontSize:14,fontFamily:'Inter,sans-serif',color:'#1e293b',background:'transparent',outline:'none',transition:'border-color 0.2s',boxSizing:'border-box'}}
                    onFocus={e=>e.target.style.borderBottomColor='#2563eb'}
                    onBlur={e=>e.target.style.borderBottomColor='#e2e8f0'}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{background:'#ffffff',borderTop:'1px solid #dbeafe',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:13,color:'#64748b'}}>{Object.keys(answers).length} of {questions.length} answered</span>
        <button onClick={()=>handleEnd(false)} disabled={submitting}
          style={{padding:'10px 28px',background:'#dc2626',color:'white',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
          {submitting?'Submitting...':'🔒 Submit Listening Test'}
        </button>
      </div>
    </div>
  );
}
