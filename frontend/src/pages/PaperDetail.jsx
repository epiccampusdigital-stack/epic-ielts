import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function PaperDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [paper, setPaper] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      axios.get(`${API_URL}/api/papers/${id}`, api())
         .then(res => {
            setPaper(res.data);
            setLoading(false);
         })
         .catch(err => {
            console.error(err);
            setLoading(false);
         });
   }, [id]);

   if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>Loading paper details...</div>;
   if (!paper) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>Paper not found.</div>;

   const questionsByPassage = {};
   
   if (paper.questions) {
      paper.questions.forEach(q => {
         const pNum = q.passageNumber || 1;
         if (!questionsByPassage[pNum]) questionsByPassage[pNum] = [];
         questionsByPassage[pNum].push(q);
      });
   }
   
   const passageNumbers = Object.keys(questionsByPassage).map(Number).sort((a,b)=>a-b);

   return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", padding: '40px' }}>
         <button 
            onClick={() => navigate('/admin/dashboard')} 
            style={{ marginBottom: '20px', padding: '8px 16px', background: '#e2e8f0', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: '600', color: '#475569', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.target.style.background = '#cbd5e1'}
            onMouseOut={(e) => e.target.style.background = '#e2e8f0'}
         >← Back to Admin Dashboard</button>
         
         <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#1a1a2e', marginBottom: '8px' }}>
               {paper.title} ({paper.paperCode})
            </h1>
            <div style={{ display: 'inline-block', background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '32px' }}>
               {paper.testType}
            </div>

            {passageNumbers.length === 0 && <div style={{ color: '#64748b' }}>No questions available for this paper.</div>}

            {passageNumbers.map(pNum => {
               const qs = questionsByPassage[pNum].sort((a,b) => a.questionNumber - b.questionNumber);
               const passageText = paper.passages?.[pNum - 1]?.text || paper.passageTexts?.[pNum - 1] || paper.instructions || paper.content || 'Passage text not available.';
               
               return (
                  <div key={pNum} style={{ marginBottom: '48px', borderTop: '2px solid #f1f5f9', paddingTop: '32px' }}>
                     <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Passage {pNum}</h2>
                     <div style={{ 
                        background: '#fafaf7', 
                        padding: '24px', 
                        borderRadius: '12px', 
                        fontFamily: "'Lora', serif", 
                        fontSize: '15px', 
                        lineHeight: '1.8', 
                        color: '#2d3748', 
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0',
                        whiteSpace: 'pre-wrap'
                     }}>
                        {passageText}
                     </div>

                     <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Questions & Answers</h3>
                     <div style={{ display: 'grid', gap: '12px' }}>
                        {qs.map(q => (
                           <div key={q.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                 <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                                    {q.questionNumber}
                                 </div>
                                 <div style={{ width: '100%' }}>
                                    <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', marginBottom: '8px' }}>{q.content}</div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                       <span style={{ fontSize: '12px', color: '#64748b' }}>Type: {q.questionType.replace(/_/g, ' ')}</span>
                                       {q.options && (
                                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                                             Options: {(typeof q.options === 'string' ? JSON.parse(q.options) : q.options).join(', ')}
                                          </span>
                                       )}
                                    </div>
                                    <div style={{ marginTop: '12px', background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}>
                                       Correct Answer: {q.correctAnswer}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
