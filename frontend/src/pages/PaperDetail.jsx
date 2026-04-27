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
   const [editMode, setEditMode] = useState(false);
   const [editedPaper, setEditedPaper] = useState(null);
   const [saving, setSaving] = useState(false);
   const [message, setMessage] = useState('');
   const [settings] = useState(() => {
      const saved = localStorage.getItem('siteSettings');
      return saved ? JSON.parse(saved) : { siteName: 'EPIC IELTS', logoUrl: '/logo.png' };
   });

   useEffect(() => {
      fetchPaper();
   }, [id]);

   const fetchPaper = async () => {
      setLoading(true);
      try {
         const res = await axios.get(`${API_URL}/api/papers/${id}`, api());
         setPaper(res.data);
         setEditedPaper(JSON.parse(JSON.stringify(res.data)));
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleSave = async () => {
      setSaving(true);
      setMessage('');
      try {
         // Include questions to be deleted or updated
         await axios.put(`${API_URL}/api/admin/papers/${id}`, editedPaper, api());
         setMessage('Paper updated successfully! ✨');
         setPaper(JSON.parse(JSON.stringify(editedPaper)));
         setEditMode(false);
      } catch (err) {
         console.error(err);
         setMessage('Failed to update paper. ❌');
      } finally {
         setSaving(false);
      }
   };

   const updateQuestion = (qId, field, value) => {
      setEditedPaper(prev => ({
         ...prev,
         questions: prev.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
      }));
   };

   const addQuestion = (passageNumber) => {
      const lastQ = editedPaper.questions.sort((a,b) => b.questionNumber - a.questionNumber)[0];
      const newNo = lastQ ? lastQ.questionNumber + 1 : 1;
      
      const newQ = {
         id: 'temp-' + Date.now(),
         paperId: parseInt(id),
         passageNumber,
         questionNumber: newNo,
         questionType: 'SHORT_ANSWER',
         content: 'New Question Text',
         correctAnswer: '',
         options: ''
      };

      setEditedPaper(prev => ({
         ...prev,
         questions: [...prev.questions, newQ]
      }));
   };

   const deleteQuestion = (qId) => {
      setEditedPaper(prev => ({
         ...prev,
         questions: prev.questions.filter(q => q.id !== qId)
      }));
   };

   if (loading) return <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Inter', sans-serif", color: '#64748b' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
      Loading paper settings...
   </div>;
   
   if (!paper) return <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>Paper not found.</div>;

   const questionsByPassage = {};
   const currentData = editMode ? editedPaper : paper;
   
   if (currentData.questions) {
      currentData.questions.forEach(q => {
         const pNum = q.passageNumber || 1;
         if (!questionsByPassage[pNum]) questionsByPassage[pNum] = [];
         questionsByPassage[pNum].push(q);
      });
   }
   
   const passageNumbers = Object.keys(questionsByPassage).map(Number).sort((a,b)=>a-b);

   return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", padding: '24px 16px' }}>
         <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            .input-field { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; background: white; }
            .input-field:focus { border-color: #4f46e5; }
            .section-card { background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; margin-bottom: 24px; }
         `}</style>

         <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
               <button 
                  onClick={() => navigate('/admin/dashboard')} 
                  style={{ padding: '10px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#475569', transition: 'all 0.2s' }}
               >← Back</button>

               <div style={{ display: 'flex', gap: '12px' }}>
                  {!editMode ? (
                     <button 
                        onClick={() => setEditMode(true)} 
                        style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
                     >⚙️ Edit Settings</button>
                  ) : (
                     <>
                        <button 
                           onClick={() => { setEditMode(false); setEditedPaper(JSON.parse(JSON.stringify(paper))); }} 
                           style={{ padding: '10px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                        >Cancel</button>
                        <button 
                           onClick={handleSave} 
                           disabled={saving}
                           style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
                        >{saving ? 'Saving...' : '💾 Save Changes'}</button>
                     </>
                  )}
               </div>
            </div>

            {message && (
               <div style={{ padding: '16px', background: message.includes('successfully') ? '#f0fdf4' : '#fef2f2', color: message.includes('successfully') ? '#166534' : '#dc2626', borderRadius: '12px', border: '1px solid currentColor', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
                  {message}
               </div>
            )}

            <div className="section-card">
               {!editMode ? (
                  <>
                     <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#1a1a2e', marginBottom: '8px' }}>
                        {paper.title}
                     </h1>
                     <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                           {paper.testType}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                           Code: {paper.paperCode} • {paper.timeLimitMin} mins
                        </span>
                     </div>
                  </>
               ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                     <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Paper Title</label>
                        <input className="input-field" value={editedPaper.title} onChange={e => setEditedPaper(prev => ({ ...prev, title: e.target.value }))} />
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                           <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Test Type</label>
                           <select className="input-field" value={editedPaper.testType} onChange={e => setEditedPaper(prev => ({ ...prev, testType: e.target.value }))}>
                              <option value="READING">Reading</option>
                              <option value="WRITING">Writing</option>
                              <option value="LISTENING">Listening</option>
                              <option value="SPEAKING">Speaking</option>
                           </select>
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Paper Code</label>
                           <input className="input-field" value={editedPaper.paperCode} onChange={e => setEditedPaper(prev => ({ ...prev, paperCode: e.target.value }))} />
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Time (Mins)</label>
                           <input className="input-field" type="number" value={editedPaper.timeLimitMin} onChange={e => setEditedPaper(prev => ({ ...prev, timeLimitMin: parseInt(e.target.value) }))} />
                        </div>
                     </div>
                     <div style={{ marginTop: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Full Paper Content / Instructions</label>
                        <textarea 
                           className="input-field" 
                           style={{ minHeight: '150px' }} 
                           value={editedPaper.instructions || ''} 
                           onChange={e => setEditedPaper(prev => ({ ...prev, instructions: e.target.value }))}
                           placeholder="Paste all passages here if not using separate passage fields..."
                        />
                     </div>
                  </div>
               )}
            </div>

            {/* Audio Settings (Listening Only) */}
            {(currentData.testType === 'LISTENING' || paper.testType === 'LISTENING') && (
               <div className="section-card" style={{ borderLeft: '4px solid #7c3aed' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e3a5f', fontWeight: '800' }}>🎧 Listening Audio Settings</h3>
                  
                  <div style={{ background: '#f5f3ff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                     {paper.audioUrl ? (
                        <div style={{ marginBottom: '16px' }}>
                           <p style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '700', marginBottom: '8px' }}>Current Audio:</p>
                           <audio controls src={`${API_URL}${paper.audioUrl}`} style={{ width: '100%', height: '40px' }} />
                           <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Path: {paper.audioUrl}</p>
                        </div>
                     ) : (
                        <div style={{ padding: '16px', textAlign: 'center', background: '#ffffff', border: '1.5px dashed #ddd6fe', borderRadius: '10px', marginBottom: '16px' }}>
                           <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>No audio file uploaded yet.</p>
                        </div>
                     )}

                     <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input 
                           type="file" 
                           accept="audio/*" 
                           id="audio-upload"
                           style={{ display: 'none' }}
                           onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              
                              const formData = new FormData();
                              formData.append('audio', file);
                              
                              setMessage('Uploading audio...');
                              try {
                                 await axios.post(`${API_URL}/api/admin/papers/${id}/upload-audio`, formData, {
                                    headers: { 
                                       ...api().headers,
                                       'Content-Type': 'multipart/form-data' 
                                    }
                                 });
                                 setMessage('Audio uploaded successfully! 🎉');
                                 fetchPaper();
                              } catch (err) {
                                 setMessage('Upload failed: ' + (err.response?.data?.error || err.message));
                              }
                           }}
                        />
                        <button 
                           onClick={() => document.getElementById('audio-upload').click()}
                           style={{ flex: 1, padding: '12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                           📤 {paper.audioUrl ? 'Replace Audio' : 'Upload Audio File'}
                        </button>
                     </div>
                     <p style={{ fontSize: '11px', color: '#7c3aed', marginTop: '10px', textAlign: 'center' }}>
                        Allowed: MP3, WAV, OGG, M4A (Max 50MB)
                     </p>
                  </div>
               </div>
            )}

            {passageNumbers.map(pNum => {
               const qs = questionsByPassage[pNum]?.sort((a,b) => a.questionNumber - b.questionNumber) || [];
               const passageText = currentData.passages?.[pNum - 1]?.text || currentData.passageTexts?.[pNum - 1] || currentData.instructions || currentData.content || '';
               
               return (
                  <div key={pNum} style={{ marginBottom: '40px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a5f' }}>Passage {pNum}</h2>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                        {editMode && (
                           <button 
                              onClick={() => {
                                 setEditedPaper(prev => ({
                                    ...prev,
                                    passages: prev.passages.filter((_, idx) => idx !== pNum - 1)
                                 }));
                              }}
                              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                           >Remove Passage</button>
                        )}
                     </div>
                     
                     <div className="section-card">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '10px', textTransform: 'uppercase' }}>Passage Content</label>
                        {!editMode ? (
                           <div style={{ fontFamily: "'Lora', serif", fontSize: '15px', lineHeight: '1.8', color: '#2d3748', whiteSpace: 'pre-wrap' }}>
                              {passageText || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No passage text provided.</span>}
                           </div>
                        ) : (
                           <textarea 
                              className="input-field" 
                              style={{ minHeight: '200px', lineHeight: '1.6', fontFamily: "'Lora', serif" }}
                              value={passageText}
                              onChange={e => {
                                 const updatedPassages = [...(editedPaper.passages || [])];
                                 if (!updatedPassages[pNum - 1]) updatedPassages[pNum - 1] = { passageNumber: pNum };
                                 updatedPassages[pNum - 1].text = e.target.value;
                                 setEditedPaper(prev => ({ ...prev, passages: updatedPassages }));
                              }}
                           />
                        )}
                     </div>

                     <div style={{ display: 'grid', gap: '16px' }}>
                        {qs.map(q => (
                           <div key={q.id} style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', position: 'relative' }}>
                              <div style={{ display: 'flex', gap: '16px' }}>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>
                                       {q.questionNumber}
                                    </div>
                                    {editMode && (
                                       <button 
                                          onClick={() => deleteQuestion(q.id)}
                                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px', cursor: 'pointer', fontSize: '10px' }}
                                          title="Delete Question"
                                       >🗑️</button>
                                    )}
                                 </div>
                                 
                                 <div style={{ flex: 1 }}>
                                    {!editMode ? (
                                       <>
                                          <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', marginBottom: '12px', lineHeight: '1.5' }}>{q.content}</div>
                                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                             <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                <span style={{ fontWeight: '700' }}>TYPE:</span> {q.questionType}
                                             </div>
                                             {q.options && (
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                   <span style={{ fontWeight: '700' }}>OPTIONS:</span> {Array.isArray(q.options) ? q.options.join(', ') : q.options}
                                                </div>
                                             )}
                                          </div>
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>
                                             <span>✅</span> {q.correctAnswer}
                                          </div>
                                       </>
                                    ) : (
                                       <div style={{ display: 'grid', gap: '16px' }}>
                                          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '12px' }}>
                                             <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>NO.</label>
                                                <input className="input-field" type="number" value={q.questionNumber} onChange={e => updateQuestion(q.id, 'questionNumber', parseInt(e.target.value))} />
                                             </div>
                                             <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>QUESTION CONTENT</label>
                                                <textarea className="input-field" value={q.content} onChange={e => updateQuestion(q.id, 'content', e.target.value)} />
                                             </div>
                                          </div>
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                             <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>QUESTION TYPE</label>
                                                <select className="input-field" value={q.questionType} onChange={e => updateQuestion(q.id, 'questionType', e.target.value)}>
                                                   <option value="TFNG">True/False/Not Given</option>
                                                   <option value="MCQ">Multiple Choice</option>
                                                   <option value="SHORT_ANSWER">Short Answer</option>
                                                   <option value="MATCHING">Matching</option>
                                                   <option value="SUMMARY_COMPLETION">Summary Completion</option>
                                                </select>
                                             </div>
                                             <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>CORRECT ANSWER</label>
                                                <input className="input-field" value={q.correctAnswer} onChange={e => updateQuestion(q.id, 'correctAnswer', e.target.value)} />
                                             </div>
                                          </div>
                                          {['MCQ', 'MATCHING'].includes(q.questionType) && (
                                             <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>OPTIONS (Comma separated)</label>
                                                <input 
                                                   className="input-field" 
                                                   value={Array.isArray(q.options) ? q.options.join(', ') : q.options} 
                                                   onChange={e => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))} 
                                                />
                                             </div>
                                          )}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}

                        {editMode && (
                           <button 
                              onClick={() => addQuestion(pNum)}
                              style={{ padding: '12px', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '12px', color: '#4f46e5', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseOver={e => e.target.style.borderColor = '#4f46e5'}
                              onMouseOut={e => e.target.style.borderColor = '#e2e8f0'}
                           >+ Add Question to Passage {pNum}</button>
                        )}
                     </div>
                  </div>
               );
            })}

            {editMode && (
               <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <button 
                     onClick={() => {
                        const nextNum = passageNumbers.length + 1;
                        setEditedPaper(prev => ({
                           ...prev,
                           passages: [...(prev.passages || []), { passageNumber: nextNum, text: '' }]
                        }));
                     }}
                     style={{ padding: '16px 32px', background: '#ffffff', color: '#4f46e5', border: '2px solid #4f46e5', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)' }}
                  >➕ Add New Passage</button>
               </div>
            )}
         </div>
      </div>
   );
}

