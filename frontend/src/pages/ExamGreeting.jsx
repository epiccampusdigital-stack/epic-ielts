import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
   headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
   }
});

export default function ExamGreeting() {
   const params = useParams();
   const attemptId = params.attemptId || params.id;
   const navigate = useNavigate();

   const [attempt, setAttempt] = useState(null);
   const [paper, setPaper] = useState(null);
   const [loading, setLoading] = useState(true);
   const [starting, setStarting] = useState(false);
   const [error, setError] = useState('');

   const user = JSON.parse(localStorage.getItem('user') || '{}');

   useEffect(() => {
      const fetchExam = async () => {
         setLoading(true);
         setError('');

         try {
            let res;

            try {
               res = await axios.get(`${API_URL}/api/attempts/${attemptId}`, api());
            } catch {
               res = await axios.get(`${API_URL}/api/attempts/${attemptId}/result`, api());
            }

            setAttempt(res.data);
            setPaper(res.data.paper);
         } catch (err) {
            console.error('Exam greeting fetch error:', err);
            setError('Failed to load exam. Please go back to dashboard and start again.');
         } finally {
            setLoading(false);
         }
      };

      fetchExam();
   }, [attemptId]);

   const handleStart = async () => {
      setStarting(true);
      try {
         await axios.post(`${API_URL}/api/attempts/${attemptId}/start`, {}, api());
         const type = paper?.testType?.toLowerCase();
         if (type === 'writing') {
            navigate(`/exam/${attemptId}/writing`);
         } else if (type === 'listening') {
            navigate(`/exam/${attemptId}/listening`);
         } else {
            navigate(`/exam/${attemptId}/reading`);
         }
      } catch (err) {
         console.error('Start exam error:', err);
         alert('Failed to start exam. Please try again.');
         setStarting(false);
      }
   };

   if (loading) {
      return (
         <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: "'Inter', sans-serif"
         }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ textAlign: 'center' }}>
               <div style={{
                  width: '42px',
                  height: '42px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #4f46e5',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px'
               }} />
               <p style={{ color: '#64748b' }}>Loading exam...</p>
            </div>
         </div>
      );
   }

   if (error || !paper) {
      return (
         <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: "'Inter', sans-serif"
         }}>
            <div style={{
               background: '#ffffff',
               border: '1px solid #e2e8f0',
               borderRadius: '16px',
               padding: '32px',
               textAlign: 'center',
               maxWidth: '420px'
            }}>
               <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>Exam could not load</h2>
               <p style={{ color: '#64748b', marginBottom: '20px' }}>
                  {error || 'Paper data was not found for this attempt.'}
               </p>
               <button
                  onClick={() => navigate('/student/dashboard')}
                  style={{
                     padding: '10px 18px',
                     background: '#4f46e5',
                     color: '#ffffff',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: 'pointer',
                     fontWeight: '600'
                  }}
               >
                  Back to Dashboard
               </button>
            </div>
         </div>
      );
   }

   return (
      <div style={{
         minHeight: '100vh',
         background: '#f8fafc',
         fontFamily: "'Inter', sans-serif"
      }}>
         <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .start-btn {
          width: 100%;
          padding: 18px;
          background: #1a1a2e;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.03em;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .start-btn:hover:not(:disabled) {
          background: #2d2d5e;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26,26,46,0.3);
        }

        .start-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .info-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 24px; }
        @media (min-width: 768px) { .info-grid { grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; } }
        
        .exam-nav { background: #1a1a2e; padding: 0 16px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        @media (min-width: 768px) { .exam-nav { padding: 0 40px; } }
        
        .greeting-card { background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .greeting-content { padding: 24px; }
        @media (min-width: 768px) { .greeting-content { padding: 44px; } }
      `}</style>

         <nav className="exam-nav">
            <img
               src="/logo.png"
               alt="EPIC"
               style={{ height: '28px', filter: 'brightness(0) invert(1)' }}
            />
            <span className="mobile-hide" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
               Exam Registration
            </span>
         </nav>

         <div style={{
            maxWidth: '680px',
            margin: '30px auto',
            padding: '0 16px',
            animation: 'fadeUp 0.5s ease'
         }}>
            <div className="greeting-card">
               <div style={{
                  height: '5px',
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)'
               }} />

               <div className="greeting-content">
                  <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                     <p style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#94a3b8',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        marginBottom: '12px'
                     }}>
                        EPIC Campus — IELTS CBT Platform
                     </p>

                     <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '26px',
                        fontWeight: '700',
                        color: '#1a1a2e',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                     }}>
                        EPIC IELTS — {paper.testType} {paper.paperCode}
                     </h1>

                     <p style={{ fontSize: '15px', color: '#64748b' }}>{paper.title}</p>
                  </div>

                  <div className="info-grid">
                     {[
                        { icon: '⏱', label: 'Time Allowed', value: `${paper.timeLimitMin || 60} minutes` },
                        { icon: '❓', label: 'Total Questions', value: `${paper.questions?.length || 40} questions` },
                        { icon: '📚', label: 'Test Type', value: paper.testType },
                        { icon: '🎯', label: 'Attempt ID', value: attempt?.id || attemptId }
                     ].map((item, i) => (
                        <div key={i} style={{
                           background: '#f8fafc',
                           borderRadius: '12px',
                           padding: '16px',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '12px',
                           border: '1px solid #f1f5f9'
                        }}>
                           <span style={{ fontSize: '22px' }}>{item.icon}</span>
                           <div>
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                                 {item.label}
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                 {item.value}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div style={{
                     background: '#f8fafc',
                     borderRadius: '12px',
                     padding: '20px 24px',
                     marginBottom: '24px',
                     border: '1px solid #e2e8f0'
                  }}>
                     <p style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#64748b',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '14px'
                     }}>
                        Instructions
                     </p>

                     {[
                        'Read each passage carefully before answering questions.',
                        'Do not refresh or close the browser during the exam.',
                        'Click END TEST only when you have completed all questions.',
                        'Results and band scores appear after submission.'
                     ].map((item, i) => (
                        <div key={i} style={{
                           display: 'flex',
                           alignItems: 'flex-start',
                           gap: '10px',
                           marginBottom: i < 3 ? '10px' : '0'
                        }}>
                           <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#4f46e5',
                              marginTop: '7px',
                              flexShrink: 0
                           }} />
                           <span style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                              {item}
                           </span>
                        </div>
                     ))}
                  </div>

                  <button className="start-btn" onClick={handleStart} disabled={starting}>
                     {starting ? 'Starting exam...' : '🚀 START EXAM'}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}