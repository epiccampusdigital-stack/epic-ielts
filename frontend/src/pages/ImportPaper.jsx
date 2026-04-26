import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function ImportPaper() {
   const [rawText, setRawText] = useState('');
   const [testType, setTestType] = useState('READING');
   const [paperCode, setPaperCode] = useState('');
   const [title, setTitle] = useState('');
   const [loading, setLoading] = useState(false);
   const [result, setResult] = useState(null);
   const [error, setError] = useState('');
   const navigate = useNavigate();

   const handleImport = async () => {
      if (!rawText) {
         setError('Please paste some paper text first.');
         return;
      }
      setLoading(true);
      setError('');
      try {
         const res = await axios.post(`${API_URL}/api/admin/papers/import-ai`, {
            rawText, testType, paperCode, title
         }, api());
         setResult(res.data);
         if (res.data.success) {
            setTimeout(() => {
               navigate(`/admin/papers/${res.data.paper.id}`);
            }, 2000);
         }
      } catch (err) {
         setError(err.response?.data?.error || 'Import failed. Check console.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
         <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
               onClick={() => navigate('/admin/dashboard')}
               style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '600', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
               ← Back to Dashboard
            </button>

            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
               <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' }}>✨ AI Paper Import</h1>
               <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Paste raw text from a PDF or website. Our AI will automatically detect passages, questions, and answers.</p>

               {error && (
                  <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '24px', fontSize: '14px' }}>
                     {error}
                  </div>
               )}

               {result?.success && (
                  <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '24px' }}>
                     <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Success!</h3>
                     <p style={{ fontSize: '14px' }}>Created paper with {result.questionsCreated} questions. Redirecting to editor...</p>
                  </div>
               )}

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                     <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Paper Code</label>
                     <input 
                        className="form-input" 
                        placeholder="e.g. 005" 
                        value={paperCode} 
                        onChange={e => setPaperCode(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                     />
                  </div>
                  <div>
                     <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Test Type</label>
                     <select 
                        className="form-input" 
                        value={testType} 
                        onChange={e => setTestType(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                     >
                        <option value="READING">Reading</option>
                        <option value="LISTENING">Listening</option>
                     </select>
                  </div>
               </div>

               <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Paste Paper Content Here</label>
                  <textarea 
                     value={rawText}
                     onChange={e => setRawText(e.target.value)}
                     placeholder="Paste the full text of the exam here..."
                     style={{ 
                        width: '100%', 
                        height: '300px', 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: '1.5px solid #e2e8f0', 
                        fontFamily: 'monospace', 
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'vertical'
                     }}
                  />
               </div>

               <button 
                  onClick={handleImport}
                  disabled={loading}
                  style={{ 
                     width: '100%', 
                     padding: '14px', 
                     background: '#4f46e5', 
                     color: 'white', 
                     border: 'none', 
                     borderRadius: '12px', 
                     fontWeight: '700', 
                     fontSize: '16px',
                     cursor: loading ? 'not-allowed' : 'pointer',
                     opacity: loading ? 0.7 : 1,
                     transition: 'all 0.2s'
                  }}
               >
                  {loading ? '🤖 AI is processing... (up to 30s)' : '🚀 Magic Import with AI'}
               </button>
            </div>
         </div>
      </div>
   );
}
