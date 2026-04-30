import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// Fallback questions if DB has none
const FALLBACK_PARTS = [
  {
    number: 1,
    title: 'Part 1',
    subtitle: 'Introduction & Interview',
    duration: 60,
    prepTime: 0,
    icon: '💬',
    color: '#2563eb',
    description: 'Answer questions about familiar topics. Speak naturally and give detailed answers.',
    questions: [
      'Tell me about your hometown. What do you like most about living there?',
      'What do you enjoy doing in your free time? How often do you do this?',
      'Do you prefer spending time indoors or outdoors? Why?'
    ]
  },
  {
    number: 2,
    title: 'Part 2',
    subtitle: 'Individual Long Turn',
    duration: 120,
    prepTime: 60,
    icon: '🎯',
    color: '#7c3aed',
    description: 'You have 1 minute to prepare, then speak for up to 2 minutes on the topic.',
    questions: [
      'Describe a person who has had a significant influence on your life.\n\nYou should say:\n• Who this person is and how you know them\n• What qualities or characteristics they have\n• How they have influenced you\n• And explain why this person is important to you'
    ]
  },
  {
    number: 3,
    title: 'Part 3',
    subtitle: 'Two-Way Discussion',
    duration: 90,
    prepTime: 0,
    icon: '🌐',
    color: '#0891b2',
    description: 'Discuss more abstract ideas related to the Part 2 topic.',
    questions: [
      'Do you think that famous people and celebrities have a responsibility to be good role models for young people?',
      'How do you think social media influencers affect the values and behaviour of young people today?',
      'Some people say that schools should teach students how to use social media responsibly. Do you agree?'
    ]
  }
];

const PART_META = {
  1: { title: 'Part 1', subtitle: 'Introduction & Interview', duration: 60, prepTime: 0, icon: '💬', color: '#2563eb', description: 'Answer questions about familiar topics. Speak naturally and give detailed answers.' },
  2: { title: 'Part 2', subtitle: 'Individual Long Turn', duration: 120, prepTime: 60, icon: '🎯', color: '#7c3aed', description: 'You have 1 minute to prepare, then speak for up to 2 minutes on the topic.' },
  3: { title: 'Part 3', subtitle: 'Two-Way Discussion', duration: 90, prepTime: 0, icon: '🌐', color: '#0891b2', description: 'Discuss more abstract ideas related to the Part 2 topic.' }
};

export default function SpeakingExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  // Paper/questions state
  const [parts, setParts] = useState(null); // array of part objects with questions
  const [paperLoading, setPaperLoading] = useState(true);
  const [paperError, setPaperError] = useState(null);

  // Exam state
  const [partIndex, setPartIndex] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [recording, setRecording] = useState(false);
  const [uploaded, setUploaded] = useState({}); // { 1: true, 2: true, 3: true }
  const [uploading, setUploading] = useState(false);
  const [prepTimeLeft, setPrepTimeLeft] = useState(null);
  const [recordTimeLeft, setRecordTimeLeft] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [visualizerData, setVisualizerData] = useState([]);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);

  // Load paper from DB
  useEffect(() => {
    const loadPaper = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/attempts/${attemptId}`, api());
        const attempt = res.data;
        const paper = attempt?.paper;

        // Try to build parts from DB questions
        // Speaking questions stored as flat questions with sectionNumber = part number
        // or as sections with groups
        const dbParts = buildPartsFromPaper(paper);

        if (dbParts && dbParts.length > 0) {
          setParts(dbParts);
        } else {
          // Fallback to hardcoded
          console.warn('No speaking questions in DB, using fallback');
          setParts(FALLBACK_PARTS);
        }
      } catch (err) {
        console.error('Failed to load speaking paper:', err);
        setPaperError('Failed to load exam. Using default questions.');
        setParts(FALLBACK_PARTS);
      } finally {
        setPaperLoading(false);
      }
    };

    loadPaper();
    requestMicPermission();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [attemptId]);

  // Build parts array from paper data
  const buildPartsFromPaper = (paper) => {
    if (!paper) return null;

    // Method 1: sections with groups (if imported via AI)
    if (paper.sections?.length > 0) {
      return paper.sections.map(section => {
        const partNum = section.number;
        const meta = PART_META[partNum] || PART_META[1];
        const questions = [];
        section.groups?.forEach(group => {
          group.questions?.forEach(q => questions.push(q.content));
          // Also use group instruction as a question if no sub-questions
          if (!group.questions?.length && group.instruction) {
            questions.push(group.instruction);
          }
        });
        return { number: partNum, ...meta, questions: questions.length > 0 ? questions : null };
      }).filter(p => p.questions?.length > 0);
    }

    // Method 2: flat questions with sectionNumber = part number
    if (paper.questions?.length > 0) {
      const byPart = {};
      paper.questions.forEach(q => {
        const partNum = q.sectionNumber || 1;
        if (!byPart[partNum]) byPart[partNum] = [];
        byPart[partNum].push(q.content);
      });
      const partNums = Object.keys(byPart).map(Number).sort();
      if (partNums.length > 0) {
        return partNums.map(partNum => {
          const meta = PART_META[partNum] || PART_META[1];
          return { number: partNum, ...meta, questions: byPart[partNum] };
        });
      }
    }

    return null;
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch {
      setHasPermission(false);
    }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    setVisualizerData(Array.from(data).slice(0, 20));
    animFrameRef.current = requestAnimationFrame(drawVisualizer);
  };

  const startPrep = () => {
    setPhase('prep');
    let t = part.prepTime;
    setPrepTimeLeft(t);
    timerRef.current = setInterval(() => {
      t--;
      setPrepTimeLeft(t);
      if (t <= 0) { clearInterval(timerRef.current); startRecording(); }
    }, 1000);
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const mr = new MediaRecorder(streamRef.current, { mimeType });
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecording(false);
        cancelAnimationFrame(animFrameRef.current);
        setVisualizerData([]);
        await uploadRecording(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setPhase('recording');
      drawVisualizer();

      let t = part.duration;
      setRecordTimeLeft(t);
      timerRef.current = setInterval(() => {
        t--;
        setRecordTimeLeft(t);
        if (t <= 0) { clearInterval(timerRef.current); stopRecording(); }
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      alert('Could not start recording: ' + err.message);
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecordTimeLeft(null);
    setPhase('done');
  };

  const uploadRecording = async (blob) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, `speaking_part${part.number}.webm`);
      formData.append('partNumber', part.number);
      await axios.post(`${API_URL}/api/attempts/${attemptId}/speaking/upload`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
      });
      setUploaded(u => ({ ...u, [part.number]: true }));
    } catch (e) {
      console.error('Upload failed:', e.message);
      alert('Upload failed. Please try recording again.');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    if (partIndex < parts.length - 1) {
      setPartIndex(p => p + 1);
      setPhase('intro');
      setRecordTimeLeft(null);
      setPrepTimeLeft(null);
    } else {
      setPhase('complete');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/attempts/${attemptId}/speaking/submit`, {}, api());
      navigate(`/exam/${attemptId}/speaking-results`);
    } catch {
      alert('Failed to submit. Try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Loading state
  if (paperLoading || hasPermission === null) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000814', fontFamily: 'Inter,sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(37,99,235,0.3)', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>{hasPermission === null ? 'Requesting microphone access...' : 'Loading exam...'}</p>
      </div>
    </div>
  );

  if (hasPermission === false) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000814', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 48, maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎤</div>
        <h2 style={{ color: '#ffffff', marginBottom: 12, fontFamily: 'Playfair Display,serif' }}>Microphone Access Required</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 28, lineHeight: 1.6 }}>Please allow microphone access in your browser settings, then try again.</p>
        <button onClick={requestMicPermission} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Try Again</button>
      </div>
    </div>
  );

  if (!parts) return null;

  const part = parts[partIndex];

  const TIPS = {
    1: ['💡 Give extended answers — avoid one-word replies', '💡 Use examples from your personal experience', '💡 Speak at a natural pace — not too fast'],
    2: ['💡 Use your 1 minute prep time to make notes', '💡 Cover all bullet points in the task card', '💡 Aim to speak for the full 2 minutes'],
    3: ['💡 Give opinions and justify them with reasons', '💡 Use advanced vocabulary and complex sentences', '💡 Consider both sides before giving your view']
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000814', fontFamily: 'Inter,sans-serif', color: 'white' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.8} }
        @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(37,99,235,0.4)} 50%{box-shadow:0 0 60px rgba(37,99,235,0.8)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .neon-btn { border: none; cursor: pointer; font-family: Inter,sans-serif; font-weight: 700; transition: all 0.3s; }
        .neon-btn:hover { transform: translateY(-2px); }
        .neon-btn:active { transform: translateY(0); }
        .neon-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo.png" alt="EPIC" style={{ height: 32, filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>EPIC IELTS — SPEAKING TEST</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>AI-Powered Assessment</div>
          </div>
        </div>

        {/* Part progress indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {parts.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: uploaded[p.number] ? 'linear-gradient(135deg,#10b981,#059669)' : i === partIndex ? `linear-gradient(135deg,${p.color},${p.color}99)` : 'rgba(255,255,255,0.08)',
                border: `2px solid ${i <= partIndex ? p.color : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'white',
                boxShadow: i === partIndex ? `0 0 20px ${p.color}60` : 'none',
                transition: 'all 0.3s'
              }}>
                {uploaded[p.number] ? '✓' : p.number}
              </div>
              {i < parts.length - 1 && <div style={{ width: 32, height: 2, background: uploaded[p.number] ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: 1, transition: 'all 0.5s' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          {Object.keys(uploaded).length} / {parts.length} recorded
        </div>
      </div>

      {paperError && (
        <div style={{ background: 'rgba(245,158,11,0.15)', borderBottom: '1px solid rgba(245,158,11,0.3)', padding: '10px 32px', fontSize: 13, color: '#fbbf24' }}>
          ⚠️ {paperError}
        </div>
      )}

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px' }}>

        {/* ── INTRO PHASE ── */}
        {phase === 'intro' && (
          <div style={{ animation: 'fadeUp 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `${part.color}22`, border: `1px solid ${part.color}40`, borderRadius: 20, padding: '6px 20px', marginBottom: 20 }}>
                <span style={{ fontSize: 20 }}>{part.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: part.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{part.title} — {part.subtitle}</span>
              </div>
              <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 36, color: 'white', marginBottom: 12, lineHeight: 1.2 }}>Ready for {part.title}?</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>{part.description}</p>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
              {[
                { icon: '❓', label: 'Questions', value: part.questions.length },
                { icon: '⏱', label: 'Recording time', value: `${part.duration}s` },
                { icon: '🎯', label: 'Prep time', value: part.prepTime > 0 ? `${part.prepTime}s` : 'None' }
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 4 }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Questions preview */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Questions in this part</p>
              <div style={{ display: 'grid', gap: 12 }}>
                {part.questions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ background: `${part.color}33`, color: part.color, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 32 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Tips for {part.title}</p>
              {(TIPS[part.number] || TIPS[1]).map((tip, i) => (
                <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 6 }}>{tip}</div>
              ))}
            </div>

            <button className="neon-btn" onClick={() => setPhase('question')}
              style={{ width: '100%', padding: 18, background: `linear-gradient(135deg,${part.color},${part.color}cc)`, color: 'white', borderRadius: 16, fontSize: 16, boxShadow: `0 8px 32px ${part.color}40` }}>
              {part.icon} Begin {part.title} →
            </button>
          </div>
        )}

        {/* ── QUESTION PHASE ── */}
        {phase === 'question' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            {/* Show all questions for this part */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${part.color}30`, borderRadius: 20, padding: 32, marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${part.color},${part.color}40)` }} />
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: part.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {part.title} · {part.questions.length} Question{part.questions.length > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'grid', gap: 20 }}>
                {part.questions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ background: `${part.color}33`, color: part.color, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                    <p style={{ fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,0.9)', margin: 0, whiteSpace: 'pre-line' }}>{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prep timer for Part 2 */}
            {part.prepTime > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'center' }}>
                <p style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {phase === 'prep' ? 'Preparation Time Remaining' : '1 minute preparation before recording'}
                </p>
                {phase === 'prep' && prepTimeLeft !== null && (
                  <div style={{ fontSize: 56, fontWeight: 900, color: '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(prepTimeLeft)}
                  </div>
                )}
                {phase !== 'prep' && (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Click "Start Preparation" when ready</p>
                )}
              </div>
            )}

            {/* Recording UI */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
              {/* Visualizer bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, height: 60, marginBottom: 24 }}>
                {recording ? visualizerData.map((v, i) => (
                  <div key={i} style={{ width: 6, borderRadius: 3, background: `linear-gradient(to top,${part.color},${part.color}60)`, height: `${Math.max(4, (v / 255) * 56)}px`, transition: 'height 0.05s' }} />
                )) : Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} style={{ width: 6, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>

              {/* Record button */}
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                {recording && <>
                  <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: `2px solid ${part.color}`, animation: 'ripple 1.5s infinite' }} />
                  <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: `2px solid ${part.color}`, animation: 'ripple 1.5s infinite 0.5s' }} />
                </>}
                <button
                  onClick={recording ? stopRecording : (part.prepTime > 0 ? startPrep : startRecording)}
                  disabled={uploading}
                  className="neon-btn"
                  style={{
                    width: 96, height: 96, borderRadius: '50%', fontSize: 36,
                    background: recording ? 'linear-gradient(135deg,#dc2626,#991b1b)' : `linear-gradient(135deg,${part.color},${part.color}cc)`,
                    color: 'white',
                    boxShadow: recording ? '0 0 40px rgba(220,38,38,0.6)' : `0 0 30px ${part.color}50`,
                    animation: recording ? 'glow 2s infinite' : 'none'
                  }}>
                  {uploading ? '⏳' : recording ? '⏹' : part.prepTime > 0 ? '📝' : '🎤'}
                </button>
              </div>

              {/* Status */}
              <div style={{ marginBottom: 20 }}>
                {uploading ? (
                  <p style={{ color: '#60a5fa', fontSize: 14, fontWeight: 600 }}>⏳ Saving recording...</p>
                ) : recording ? (
                  <>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
                      {recordTimeLeft !== null ? formatTime(recordTimeLeft) : ''}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>🔴 Recording — answer all questions, then click ⏹ when done</p>
                  </>
                ) : uploaded[part.number] ? (
                  <p style={{ color: '#10b981', fontSize: 14, fontWeight: 600 }}>✅ Part {part.number} recorded — you can re-record or continue</p>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                    {part.prepTime > 0 ? 'Click 📝 to start preparation time, then record' : 'Click 🎤 to start recording all questions for this part'}
                  </p>
                )}
              </div>

              {/* Re-record note */}
              {uploaded[part.number] && !recording && !uploading && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
                  Not happy? Click 🎤 to re-record this part.
                </p>
              )}

              {/* Next button */}
              {!recording && !uploading && (
                <button className="neon-btn" onClick={handleNext}
                  style={{
                    padding: '12px 28px',
                    background: uploaded[part.number] ? `linear-gradient(135deg,${part.color},${part.color}cc)` : 'rgba(255,255,255,0.08)',
                    color: 'white', borderRadius: 12, fontSize: 14,
                    border: `1px solid ${uploaded[part.number] ? part.color : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: uploaded[part.number] ? `0 4px 20px ${part.color}40` : 'none'
                  }}>
                  {partIndex === parts.length - 1 ? 'Finish Test ✓' : `Next: ${parts[partIndex + 1]?.title} →`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── COMPLETE PHASE ── */}
        {phase === 'complete' && (
          <div style={{ animation: 'fadeUp 0.5s ease', textAlign: 'center' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 24, padding: 56, marginBottom: 32 }}>
              <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
              <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 36, color: 'white', marginBottom: 12 }}>Speaking Test Complete!</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
                All {parts.length} parts recorded. Your responses will be transcribed and marked by EPIC AI.
              </p>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
                {parts.map(p => (
                  <div key={p.number} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 24px', minWidth: 140 }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: uploaded[p.number] ? '#10b981' : '#ef4444' }}>
                      {uploaded[p.number] ? '✓ Recorded' : '✗ Not recorded'}
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(uploaded).length < parts.length && (
                <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 20px', marginBottom: 24, fontSize: 13, color: '#fbbf24' }}>
                  ⚠️ Some parts were not recorded. You can still submit, but those parts will not be marked.
                </div>
              )}

              <button className="neon-btn" onClick={handleSubmit} disabled={submitting}
                style={{ padding: '18px 56px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', borderRadius: 16, fontSize: 17, boxShadow: '0 8px 32px rgba(16,185,129,0.4)', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? '⏳ Submitting...' : '🚀 Submit for AI Marking'}
              </button>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 16 }}>AI feedback will be ready within 2-3 minutes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
