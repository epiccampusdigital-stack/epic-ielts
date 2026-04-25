import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function Results() {
   const params = useParams();
   const attemptId = params.attemptId || params.id;
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [aiFeedback, setAiFeedback] = useState(null);
   const [aiFeedbackLoading, setAiFeedbackLoading] = useState(true);
   const [pollCount, setPollCount] = useState(0);
   const navigate = useNavigate();

   // Load main result once
   useEffect(() => {
      const fetchResult = async () => {
         try {
            const res = await axios.get(
               `${API_URL}/api/attempts/${attemptId}/result`,
               api()
            );
            setData(res.data);
            // Use cached AI feedback if already in result
            if (res.data.aiFeedback && Object.keys(res.data.aiFeedback).length > 0) {
               setAiFeedback(res.data.aiFeedback);
               setAiFeedbackLoading(false);
            }
         } catch (err) {
            console.error('Result fetch error:', err);
         } finally {
            setLoading(false);
         }
      };
      fetchResult();
   }, [attemptId, pollCount]);

   // Poll for AI feedback separately
   useEffect(() => {
      if (!attemptId || aiFeedback) return;

      let pollInterval;
      let attempts = 0;
      const maxAttempts = 20;

      const pollFeedback = async () => {
         try {
            const res = await axios.get(
               `${API_URL}/api/attempts/${attemptId}/ai-feedback`,
               api()
            );
            console.log('AI poll response:', res.data.status);
            if (res.data.status === 'ready' && res.data.feedback) {
               setAiFeedback(res.data.feedback);
               setAiFeedbackLoading(false);
               clearInterval(pollInterval);
               return;
            }
         } catch (err) {
            console.error('AI poll error:', err);
         }
         attempts++;
         if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setAiFeedbackLoading(false);
         }
      };

      pollFeedback(); // immediate first call
      pollInterval = setInterval(pollFeedback, 4000);
      return () => clearInterval(pollInterval);
   }, [attemptId, aiFeedback, pollCount]);

   if (loading) return (
      <div style={{
         minHeight: '100vh',
         background: '#f0f7ff',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         fontFamily: "'Inter', sans-serif"
      }}>
         <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
         <div style={{
            background: '#ffffff',
            border: '1px solid #dbeafe',
            borderRadius: 24,
            padding: '48px 56px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(37,99,235,0.1)'
         }}>
            <div style={{
               width: 64, height: 64,
               borderRadius: '50%',
               border: '4px solid #dbeafe',
               borderTopColor: '#2563eb',
               animation: 'spin 0.85s linear infinite',
               margin: '0 auto 24px'
            }} />
            <h2 style={{ color: '#1e3a5f', fontSize: 22, marginBottom: 8, fontWeight: 800 }}>
               EPIC AI is analysing your test
            </h2>
            <p style={{
               color: '#64748b', fontSize: 14, margin: 0,
               animation: 'pulse 1.5s ease-in-out infinite'
            }}>
               Marking answers, calculating your band score, and preparing personalised examiner feedback...
            </p>
         </div>
      </div>
   );

   if (!data) return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif' }}>
         Results not found.
         <button onClick={() => navigate('/student/dashboard')}>Back</button>
      </div>
   );

    const result = data.result || {};
    const answers = data.answers || [];
    const ai = aiFeedback || {};
    const rawScore = result.rawScore ?? 0;
    const band = result.bandEstimate ?? 0;
    const correct = answers.filter(a => a.isCorrect).length;
    const wrong = answers.filter(a => a.isCorrect === false).length;
    const hasAI = aiFeedback && aiFeedback.finalStudentReport;

   const getBandColor = (b) => {
      if (b >= 7) return '#16a34a';
      if (b >= 5.5) return '#d97706';
      return '#dc2626';
   };

   const bandColor = getBandColor(band);

   return (
      <div style={{
         minHeight: '100vh',
         background: '#f0f7ff',
         fontFamily: "'Inter', sans-serif"
      }}>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.6); }
          to { opacity:1; transform:scale(1); }
        }
        @keyframes confetti {
          0% { transform:translateY(-20px) rotate(0deg); opacity:1; }
          100% { transform:translateY(100vh) rotate(720deg); opacity:0; }
        }
        .result-section {
          background: white;
          border-radius: 16px;
          border: 1px solid #dbeafe;
          padding: 24px;
          margin-bottom: 20px;
          animation: fadeUp 0.4s ease both;
        }
        .answer-row:hover { background: #f0f7ff; }
      `}</style>

         {/* Confetti for good scores */}
         {band >= 6 && Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{
               position: 'fixed',
               top: '-20px',
               left: `${Math.random() * 100}%`,
               width: '10px',
               height: '10px',
               background: ['#2563eb', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'][i % 5],
               borderRadius: Math.random() > 0.5 ? '50%' : '2px',
               animation: `confetti ${2 + Math.random() * 3}s ease-in ${Math.random() * 2}s forwards`,
               pointerEvents: 'none',
               zIndex: 1000
            }} />
         ))}

         {/* Header */}
         <div style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
            padding: '48px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
         }}>
            <div style={{
               position: 'absolute', top: -60, right: -60,
               width: 250, height: 250, borderRadius: '50%',
               background: 'rgba(255,255,255,0.05)'
            }} />
            <p style={{
               fontSize: 11, color: 'rgba(255,255,255,0.6)',
               letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8
            }}>
               EPIC IELTS CBT Platform
            </p>
            <h1 style={{
               fontFamily: "'Playfair Display', serif",
               fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 6
            }}>
               Test Complete! 🎉
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 32 }}>
               EPIC IELTS — {data.paper?.testType} {data.paper?.paperCode}
            </p>

            {/* Band circle */}
            <div style={{
               width: 150, height: 150,
               borderRadius: '50%',
               background: '#ffffff',
               border: `6px solid ${bandColor}`,
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               margin: '0 auto',
               animation: 'scaleIn 0.6s ease',
               boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
            }}>
               <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 48, fontWeight: 700,
                  color: bandColor, lineHeight: 1
               }}>{Number(band).toFixed(1)}</span>
               <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>
                  IELTS BAND
               </span>
            </div>
         </div>

         <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>

            {/* Metric cards */}
            <div style={{
               display: 'grid',
               gridTemplateColumns: 'repeat(4, 1fr)',
               gap: 14,
               marginBottom: 24
            }}>
               {[
                  { icon: '📊', label: 'Raw Score', value: `${rawScore}/40`, color: '#2563eb' },
                  { icon: '✅', label: 'Correct', value: correct, color: '#16a34a' },
                  { icon: '❌', label: 'Wrong', value: wrong, color: '#dc2626' },
                  { icon: '⭐', label: 'Band', value: Number(band).toFixed(1), color: bandColor }
               ].map(({ icon, label, value, color }) => (
                  <div key={label} style={{
                     background: 'white',
                     border: '1px solid #dbeafe',
                     borderRadius: 16,
                     padding: '20px 16px',
                     textAlign: 'center',
                     boxShadow: '0 2px 8px rgba(37,99,235,0.06)'
                  }}>
                     <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                     <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 28, fontWeight: 700,
                        color, marginBottom: 4
                     }}>{value}</div>
                     <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>{label}</div>
                  </div>
               ))}
            </div>

            {/* AI Feedback */}
            <div className="result-section" style={{ border: '1px solid #bfdbfe', animationDelay: '0.1s' }}>
               <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 14, marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid #dbeafe'
               }}>
                  <div style={{
                     width: 48, height: 48,
                     borderRadius: '50%',
                     background: '#eff6ff',
                     display: 'flex', alignItems: 'center',
                     justifyContent: 'center', fontSize: 24
                  }}>🤖</div>
                  <div>
                     <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: 20, fontWeight: 800 }}>
                        EPIC AI Examiner Feedback
                     </h2>
                     <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                        Personalised analysis based on your answers and performance
                     </p>
                  </div>
               </div>

               <div style={{ display: 'grid', gap: 18 }}>
                  {aiFeedbackLoading ? (
                    <div style={{
                      textAlign: 'center', padding: '32px',
                      background: 'white', borderRadius: 16,
                      border: '1px solid #dbeafe',
                      marginBottom: 20
                    }}>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <div style={{
                        width: 40, height: 40,
                        border: '3px solid #dbeafe',
                        borderTopColor: '#2563eb',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px'
                      }} />
                      <p style={{ color: '#2563eb', fontWeight: 600, marginBottom: 4 }}>
                        EPIC AI is analysing your answers...
                      </p>
                      <p style={{ color: '#64748b', fontSize: 13 }}>
                        This takes 10-20 seconds. Please wait.
                      </p>
                    </div>
                  ) : !hasAI ? (
                    <div style={{ textAlign: 'center', padding: 32, background: 'white', borderRadius: 16, border: '1px solid #dbeafe', marginBottom: 20 }}>
                      <p style={{ color: '#64748b', marginBottom: 16 }}>AI feedback could not be generated. Check your API key.</p>
                      <button onClick={() => { setAiFeedbackLoading(true); setPollCount(p => p + 1); }}
                        style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                        Try Again
                      </button>
                    </div>
                  ) : (
                     <>
                        {ai.finalStudentReport && (
                           <div style={{
                              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                              borderRadius: 14, padding: 22,
                              border: '1px solid #bfdbfe',
                              marginBottom: 18
                           }}>
                              <h3 style={{ marginTop: 0, color: '#1d4ed8', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
                                 📜 Examiner's Report
                              </h3>
                              <p style={{ lineHeight: 1.8, marginBottom: 0, color: '#1e3a5f', fontSize: 14 }}>
                                 {ai.finalStudentReport}
                              </p>
                           </div>
                        )}

                        {ai.progressComment && (
                           <div style={{
                              background: '#f0fdf4', borderRadius: 12, padding: 18,
                              border: '1px solid #bbf7d0', marginBottom: 18
                           }}>
                              <h3 style={{ marginTop: 0, color: '#166534', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                                 📈 Progress
                              </h3>
                              <p style={{ lineHeight: 1.7, marginBottom: 0, color: '#15803d', fontSize: 13 }}>
                                 {ai.progressComment}
                              </p>
                           </div>
                        )}

                        <div style={{
                           display: 'grid',
                           gridTemplateColumns: '1fr 1fr',
                           gap: 16, marginBottom: 18
                        }}>
                           <div style={{
                              background: '#f8faff', borderRadius: 12, padding: 18,
                              border: '1px solid #dbeafe'
                           }}>
                              <h3 style={{ marginTop: 0, color: '#1d4ed8', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                                 ✅ Strengths
                              </h3>
                              <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
                                 {Array.isArray(ai.strengths)
                                    ? ai.strengths.map((s, i) => (
                                       <li key={i} style={{ color: '#1e3a5f', fontSize: 13 }}>{s}</li>
                                    ))
                                    : <li style={{ color: '#1e3a5f', fontSize: 13 }}>{ai.strengths || 'Good performance overall.'}</li>
                                 }
                              </ul>
                           </div>

                           <div style={{
                              background: '#fff7ed', borderRadius: 12, padding: 18,
                              border: '1px solid #ffedd5'
                           }}>
                              <h3 style={{ marginTop: 0, color: '#9a3412', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                                 🎯 Areas to Improve
                              </h3>
                              <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
                                 {Array.isArray(ai.weakAreas)
                                    ? ai.weakAreas.map((w, i) => (
                                       <li key={i} style={{ color: '#7c2d12', fontSize: 13 }}>{w}</li>
                                    ))
                                    : <li style={{ color: '#7c2d12', fontSize: 13 }}>{ai.weakAreas || ai.weaknesses || 'Keep practising.'}</li>
                                 }
                              </ul>
                           </div>
                        </div>

                        {ai.questionTypeAnalysis && Object.keys(ai.questionTypeAnalysis).length > 0 && (
                           <div style={{
                              background: '#faf5ff', borderRadius: 12, padding: 18,
                              border: '1px solid #e9d5ff', marginBottom: 18
                           }}>
                              <h3 style={{ marginTop: 0, color: '#6b21a8', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                                 🔬 Question Type Analysis
                              </h3>
                              <div style={{ display: 'grid', gap: 10 }}>
                                 {Object.entries(ai.questionTypeAnalysis).map(([type, analysis]) => (
                                    <div key={type} style={{
                                       display: 'flex', gap: 12, alignItems: 'flex-start'
                                    }}>
                                       <span style={{
                                          background: '#ede9fe',
                                          color: '#5b21b6',
                                          padding: '3px 10px',
                                          borderRadius: 20,
                                          fontSize: 11,
                                          fontWeight: 700,
                                          whiteSpace: 'nowrap',
                                          flexShrink: 0
                                       }}>
                                          {type.replace(/_/g, ' ')}
                                       </span>
                                       <span style={{ fontSize: 13, color: '#4c1d95', lineHeight: 1.6 }}>
                                          {analysis}
                                       </span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {ai.mistakeAnalysis && ai.mistakeAnalysis.length > 0 && (
                           <div style={{
                              background: '#fef2f2', borderRadius: 12, padding: 18,
                              border: '1px solid #fee2e2', marginBottom: 18
                           }}>
                              <h3 style={{ marginTop: 0, color: '#991b1b', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                                 🔍 Mistake Analysis
                              </h3>
                              <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
                                 {Array.isArray(ai.mistakeAnalysis)
                                    ? ai.mistakeAnalysis.map((m, i) => (
                                       <li key={i} style={{ color: '#7f1d1d', fontSize: 13 }}>{m}</li>
                                    ))
                                    : <li style={{ color: '#7f1d1d', fontSize: 13 }}>Analysis processing...</li>
                                 }
                              </ul>
                           </div>
                        )}

                        {ai.improvementAdvice && ai.improvementAdvice.length > 0 && (
                           <div style={{
                              background: '#f0fdf4', borderRadius: 12, padding: 18,
                              border: '1px solid #bbf7d0'
                           }}>
                              <h3 style={{ marginTop: 0, color: '#166534', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                                 💡 How to Improve Your Band
                              </h3>
                              <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
                                 {Array.isArray(ai.improvementAdvice)
                                    ? ai.improvementAdvice.map((a, i) => (
                                       <li key={i} style={{ color: '#14532d', fontSize: 13 }}>{a}</li>
                                    ))
                                    : <li style={{ color: '#14532d', fontSize: 13 }}>Keep practising regularly.</li>
                                 }
                              </ul>
                           </div>
                        )}
                     </>
                  )}
               </div>
            </div>

            {/* Answer review table */}
            <div className="result-section" style={{ animationDelay: '0.2s' }}>
               <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid #dbeafe'
               }}>
                  <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: 18, fontWeight: 800 }}>
                     Answer Review
                  </h2>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                     {correct} correct · {wrong} wrong
                  </span>
               </div>

               {/* Table header */}
               <div style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 140px 140px 60px',
                  gap: 12,
                  padding: '10px 16px',
                  background: '#f0f7ff',
                  borderRadius: 8,
                  marginBottom: 4
               }}>
                  {['No.', 'Question', 'Your Answer', 'Correct Answer', '✓/✗'].map(h => (
                     <span key={h} style={{
                        fontSize: 11, fontWeight: 700,
                        color: '#1d4ed8',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                     }}>{h}</span>
                  ))}
               </div>

               {answers.length === 0 ? (
                  <div style={{ padding: 24, color: '#64748b', textAlign: 'center' }}>
                     No answers were submitted.
                  </div>
               ) : (
                  answers.map((a, i) => (
                     <div
                        key={a.id}
                        className="answer-row"
                        style={{
                           display: 'grid',
                           gridTemplateColumns: '50px 1fr 140px 140px 60px',
                           gap: 12,
                           padding: '13px 16px',
                           borderBottom: i < answers.length - 1 ? '1px solid #f0f7ff' : 'none',
                           alignItems: 'center',
                           background: i % 2 === 0 ? '#ffffff' : '#f8fbff',
                           transition: 'background 0.15s'
                        }}
                     >
                        <span style={{
                           fontSize: 13, fontWeight: 700, color: '#2563eb'
                        }}>
                           {a.question?.questionNumber}
                        </span>
                        <span style={{
                           fontSize: 12, color: '#475569', lineHeight: 1.4,
                           overflow: 'hidden',
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical'
                        }}>
                           {a.question?.content}
                        </span>
                        <span style={{
                           fontSize: 13,
                           color: a.isCorrect ? '#16a34a' : '#dc2626',
                           fontWeight: 600
                        }}>
                           {a.studentAnswer || '(no answer)'}
                        </span>
                        <span style={{
                           fontSize: 13, color: '#16a34a', fontWeight: 600
                        }}>
                           {a.question?.correctAnswer}
                        </span>
                        <div style={{
                           width: 28, height: 28,
                           borderRadius: '50%',
                           background: a.isCorrect ? '#f0fdf4' : '#fef2f2',
                           border: `2px solid ${a.isCorrect ? '#16a34a' : '#ef4444'}`,
                           display: 'flex', alignItems: 'center',
                           justifyContent: 'center', fontSize: 14
                        }}>
                           {a.isCorrect ? '✓' : '✗'}
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Back button */}
            <div style={{ textAlign: 'center', marginTop: 8, paddingBottom: 40 }}>
               <button
                  onClick={() => navigate('/student/dashboard')}
                  style={{
                     padding: '13px 32px',
                     background: '#2563eb',
                     color: 'white',
                     border: 'none',
                     borderRadius: 10,
                     fontWeight: 700,
                     cursor: 'pointer',
                     fontSize: 15,
                     transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = '#1d4ed8'}
                  onMouseLeave={e => e.target.style.background = '#2563eb'}
               >
                  ← Back to Dashboard
               </button>
            </div>

         </div>
      </div>
   );
}