import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
   headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
   }
});

export default function Results() {
   const params = useParams();
   const attemptId = params.attemptId || params.id;

   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchResult = async () => {
         setLoading(true);

         try {
            const res = await axios.get(
               `${API_URL}/api/attempts/${attemptId}/result`,
               api()
            );

            setData(res.data);
         } catch (err) {
            console.error('Result fetch error:', err);
            alert('Failed to load results.');
         } finally {
            setLoading(false);
         }
      };

      fetchResult();
   }, [attemptId]);

   if (loading) {
      return (
         <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
         }}>
            <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.55; }
          }
        `}</style>

            <div style={{
               background: '#ffffff',
               border: '1px solid #e2e8f0',
               borderRadius: 24,
               padding: '44px 54px',
               textAlign: 'center',
               boxShadow: '0 20px 60px rgba(15,23,42,0.08)'
            }}>
               <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '4px solid #e2e8f0',
                  borderTopColor: '#4f46e5',
                  animation: 'spin 0.85s linear infinite',
                  margin: '0 auto 22px'
               }} />

               <h2 style={{
                  color: '#1a1a2e',
                  fontSize: 22,
                  marginBottom: 8,
                  fontWeight: 800
               }}>
                  EPIC AI is calculating
               </h2>

               <p style={{
                  color: '#64748b',
                  fontSize: 14,
                  margin: 0,
                  animation: 'pulse 1.5s ease-in-out infinite'
               }}>
                  Marking answers, estimating your band, and preparing examiner feedback...
               </p>
            </div>
         </div>
      );
   }

   if (!data) {
      return (
         <div style={{ padding: 40 }}>
            Results not found.
            <button onClick={() => navigate('/student/dashboard')}>Back</button>
         </div>
      );
   }

   const result = data.result || {};
   const answers = data.answers || [];
   const ai = data.aiFeedback || {};

   const rawScore = result.rawScore ?? 0;
   const band = result.bandEstimate ?? ai.bandEstimate ?? 0;
   const correct = answers.filter((a) => a.isCorrect).length;
   const wrong = answers.filter((a) => a.isCorrect === false).length;

   return (
      <div style={{
         minHeight: '100vh',
         background: '#f8fafc',
         fontFamily: 'Inter, sans-serif'
      }}>
         <div style={{
            background: '#1a1a2e',
            color: 'white',
            padding: '46px 40px',
            textAlign: 'center'
         }}>
            <h1 style={{ margin: 0, fontSize: 30 }}>Test Complete 🎉</h1>

            <p style={{
               marginTop: 6,
               color: 'rgba(255,255,255,0.75)',
               fontWeight: 700
            }}>
               EPIC IELTS — {data.paper?.testType} {data.paper?.paperCode}
            </p>

            <div style={{
               margin: '30px auto 0',
               width: 150,
               height: 150,
               borderRadius: '50%',
               background: 'white',
               color: '#4f46e5',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               flexDirection: 'column',
               fontWeight: 900,
               fontSize: 44,
               boxShadow: '0 16px 40px rgba(0,0,0,0.25)'
            }}>
               {Number(band).toFixed(1)}
               <span style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>BAND</span>
            </div>
         </div>

         <div style={{
            maxWidth: 1100,
            margin: '40px auto',
            padding: '0 20px'
         }}>
            <div style={{
               display: 'grid',
               gridTemplateColumns: 'repeat(4, 1fr)',
               gap: 16,
               marginBottom: 30
            }}>
               {[
                  ['Raw Score', `${rawScore}/40`],
                  ['Correct', correct],
                  ['Wrong', wrong],
                  ['Band', Number(band).toFixed(1)]
               ].map(([label, value]) => (
                  <div key={label} style={{
                     background: 'white',
                     padding: 24,
                     borderRadius: 16,
                     border: '1px solid #e2e8f0',
                     textAlign: 'center'
                  }}>
                     <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{value}</div>
                     <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{label}</div>
                  </div>
               ))}
            </div>

            <div style={{
               background: 'white',
               borderRadius: 18,
               border: '1px solid #e2e8f0',
               padding: 30,
               marginBottom: 30,
               boxShadow: '0 10px 30px rgba(15,23,42,0.04)'
            }}>
               <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20
               }}>
                  <div style={{
                     width: 42,
                     height: 42,
                     borderRadius: '50%',
                     background: '#eef2ff',
                     color: '#4f46e5',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: 22
                  }}>
                     🤖
                  </div>

                  <div>
                     <h2 style={{ margin: 0, color: '#1a1a2e' }}>EPIC AI Examiner Feedback</h2>
                     <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                        Personal feedback based on your answers, mistakes, and band score.
                     </p>
                  </div>
               </div>

               <div style={{ display: 'grid', gap: 18 }}>
                  {ai.finalStudentReport && (
                     <section style={{ background: '#f0fdf4', borderRadius: 14, padding: 20, border: '1px solid #dcfce7' }}>
                        <h3 style={{ marginTop: 0, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
                           📜 Examiner's Final Report
                        </h3>
                        <p style={{ lineHeight: 1.8, marginBottom: 0, color: '#14532d', fontWeight: 500 }}>
                           {ai.finalStudentReport}
                        </p>
                     </section>
                  )}

                  {ai.progressComment && (
                     <section style={{ background: '#eff6ff', borderRadius: 14, padding: 18, border: '1px solid #dbeafe' }}>
                        <h3 style={{ marginTop: 0, color: '#1d4ed8' }}>📈 Progress Tracking</h3>
                        <p style={{ lineHeight: 1.7, marginBottom: 0, color: '#1e40af' }}>
                           {ai.progressComment}
                        </p>
                     </section>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                     <section style={{ background: '#f8fafc', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0, color: '#0f172a' }}>✅ Strengths</h3>
                        <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.7 }}>
                           {Array.isArray(ai.strengths) ? ai.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>{ai.strengths || 'No strengths noted.'}</li>}
                        </ul>
                     </section>

                     <section style={{ background: '#fff7ed', borderRadius: 14, padding: 18, border: '1px solid #ffedd5' }}>
                        <h3 style={{ marginTop: 0, color: '#9a3412' }}>🎯 Weak Areas</h3>
                        <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.7 }}>
                           {Array.isArray(ai.weakAreas) ? ai.weakAreas.map((w, i) => <li key={i}>{w}</li>) : <li>{ai.weakAreas || ai.weaknesses || 'No weak areas noted.'}</li>}
                        </ul>
                     </section>
                  </div>

                  <section style={{ background: '#fef2f2', borderRadius: 14, padding: 18, border: '1px solid #fee2e2' }}>
                     <h3 style={{ marginTop: 0, color: '#991b1b' }}>🔍 Mistake Analysis</h3>
                     <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.7 }}>
                        {Array.isArray(ai.mistakeAnalysis) ? ai.mistakeAnalysis.map((m, i) => <li key={i}>{m}</li>) : <li>Detailed analysis processing...</li>}
                     </ul>
                  </section>

                  <section style={{ background: '#f5f3ff', borderRadius: 14, padding: 18, border: '1px solid #ede9fe' }}>
                     <h3 style={{ marginTop: 0, color: '#5b21b6' }}>💡 Improvement Advice</h3>
                     <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.7 }}>
                        {Array.isArray(ai.improvementAdvice) ? ai.improvementAdvice.map((a, i) => <li key={i}>{a}</li>) : <li>{ai.improvementAdvice || 'Keep practicing!'}</li>}
                     </ul>
                  </section>
               </div>
            </div>

            <div style={{
               background: 'white',
               borderRadius: 16,
               border: '1px solid #e2e8f0',
               overflow: 'hidden'
            }}>
               <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
                  <h2 style={{ margin: 0 }}>Answer Review</h2>
               </div>

               {answers.length === 0 ? (
                  <div style={{ padding: 30, color: '#64748b' }}>
                     No answers were submitted.
                  </div>
               ) : (
                  answers.map((a) => (
                     <div key={a.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 150px 150px 80px',
                        gap: 12,
                        padding: 16,
                        borderBottom: '1px solid #f1f5f9',
                        alignItems: 'center'
                     }}>
                        <strong>{a.question?.questionNumber}</strong>
                        <span>{a.question?.content}</span>
                        <span>{a.studentAnswer || '—'}</span>
                        <span>{a.question?.correctAnswer || '—'}</span>
                        <span>{a.isCorrect ? '✅' : '❌'}</span>
                     </div>
                  ))
               )}
            </div>

            <div style={{ textAlign: 'center', marginTop: 30 }}>
               <button
                  onClick={() => navigate('/student/dashboard')}
                  style={{
                     padding: '12px 24px',
                     background: '#4f46e5',
                     color: 'white',
                     border: 'none',
                     borderRadius: 10,
                     fontWeight: 800,
                     cursor: 'pointer'
                  }}
               >
                  Back to Dashboard
               </button>
            </div>
         </div>
      </div>
   );
}