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
   const [needsUpload, setNeedsUpload] = useState([]);
   const navigate = useNavigate();

   const uploadAsset = async (file, type) => {
      const fd = new FormData();
      fd.append(type, file);
      try {
         const r = await axios.post(`${API_URL}/api/upload/${type}`, fd, {
            headers: { ...api().headers, 'Content-Type': 'multipart/form-data' }
         });
         return r.data.url;
      } catch (e) {
         alert('Upload failed: ' + (e.response?.data?.error || e.message));
         return null;
      }
   };

   const handleUpload = async (item, file) => {
      const url = await uploadAsset(file, item.type);
      if (!url) return;

      try {
         const paperId = result.paperId;
         const paperRes = await axios.get(`${API_URL}/api/admin/papers/${paperId}`, api());
         const paper = paperRes.data;

         if (item.type === 'audio') {
            const section = paper.sections.find(s => s.number === item.sectionNumber);
            if (section) section.audioUrl = url;
         } else if (item.type === 'image') {
            if (paper.sections) {
               paper.sections.forEach(s => {
                  const group = s.groups.find(g => g.id === item.groupId);
                  if (group) group.imageUrl = url;
               });
            }
            if (paper.passages) {
               paper.passages.forEach(p => {
                  const group = p.groups.find(g => g.id === item.groupId);
                  if (group) group.imageUrl = url;
               });
            }
         }

         await axios.put(`${API_URL}/api/admin/papers/${paperId}`, paper, api());
         setNeedsUpload(prev => prev.map(u => 
            (u.type === item.type && (u.sectionNumber === item.sectionNumber || u.groupId === item.groupId))
            ? { ...u, done: true } : u
         ));
      } catch (err) {
         alert('Failed to save asset URL: ' + err.message);
      }
   };

   const handleImport = async () => {
      if (!rawText) {
         setError('Please paste some paper text or JSON first.');
         return;
      }
      setLoading(true);
      setError('');
      setResult(null);
      setNeedsUpload([]);

      try {
         let isJson = false;
         let jsonData = null;
         try {
            const parsed = JSON.parse(rawText);
            if (parsed && parsed.testType) {
               isJson = true;
               jsonData = parsed;
            }
         } catch (e) {}

         if (isJson) {
            const res = await axios.post(`${API_URL}/api/admin/papers/import-json`, jsonData, api());
            setResult({ ...res.data, isJson: true });
            setNeedsUpload(res.data.needsUpload || []);
            if (res.data.success && (!res.data.needsUpload || res.data.needsUpload.length === 0)) {
               setTimeout(() => navigate(`/admin/papers/${res.data.paperId}`), 2000);
            }
         } else {
            const res = await axios.post(`${API_URL}/api/admin/papers/import-ai`, {
               rawText, testType, paperCode, title
            }, api());
            setResult(res.data);
            if (res.data.success) {
               setTimeout(() => navigate(`/admin/papers/${res.data.paper.id}`), 2000);
            }
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
               <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' }}>✨ Paper Import</h1>
               <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Paste raw text for AI processing, or structured JSON for direct import.</p>

               {error && (
                  <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '24px', fontSize: '14px' }}>
                     {error}
                  </div>
               )}

               {result?.success && (
                  <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '24px' }}>
                     <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Success!</h3>
                     <p style={{ fontSize: '14px' }}>
                        {result.isJson 
                           ? `${result.paperId ? 'Paper' : 'Data'} imported successfully! ${needsUpload.length > 0 ? 'Now upload assets below.' : 'Redirecting...'}`
                           : `Created paper with ${result.questionsCreated} questions. Redirecting...`}
                     </p>
                  </div>
               )}

               {result?.isJson && needsUpload.length > 0 && (
                  <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px' }}>
                     <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '12px', textTransform: 'uppercase' }}>📋 Required Assets</h3>
                     <div style={{ display: 'grid', gap: '10px' }}>
                        {needsUpload.map((item, i) => (
                           <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.label}</span>
                              {item.done ? (
                                 <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '11px' }}>✅ UPLOADED</span>
                              ) : (
                                 <label style={{ padding: '6px 12px', background: '#4f46e5', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                                    Upload
                                    <input type="file" style={{ display: 'none' }} onChange={e => handleUpload(item, e.target.files[0])} />
                                 </label>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                     <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Paper Code (AI path only)</label>
                     <input 
                        className="form-input" 
                        placeholder="e.g. 005" 
                        value={paperCode} 
                        onChange={e => setPaperCode(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                     />
                  </div>
                  <div>
                     <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Test Type (AI path only)</label>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Paste Paper Text or JSON Here</label>
                  <textarea 
                     value={rawText}
                     onChange={e => setRawText(e.target.value)}
                     placeholder="Paste raw text or structured JSON here..."
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

               <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                     onClick={handleImport}
                     disabled={loading}
                     style={{ 
                        flex: 1,
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
                     {loading ? 'Processing...' : '🚀 Import Paper'}
                  </button>
                  {result?.success && (
                     <button 
                        onClick={() => navigate(`/admin/papers/${result.paperId || result.paper?.id}`)}
                        style={{ 
                           padding: '14px 24px', 
                           background: 'white', 
                           color: '#4f46e5', 
                           border: '2px solid #4f46e5', 
                           borderRadius: '12px', 
                           fontWeight: '700', 
                           fontSize: '16px',
                           cursor: 'pointer'
                        }}
                     >
                        Open Editor
                     </button>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
