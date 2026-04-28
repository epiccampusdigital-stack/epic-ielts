import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function AdminDashboard() {
   const [activeTab, setActiveTab] = useState('students');
   const [settings, setSettings] = useState(() => {
      const saved = localStorage.getItem('siteSettings');
      return saved ? JSON.parse(saved) : { siteName: 'EPIC IELTS', logoUrl: '/logo.png' };
   });
   const [students, setStudents] = useState([]);
   const [papers, setPapers] = useState([]);
   const [results, setResults] = useState([]);
   const [showAddStudent, setShowAddStudent] = useState(false);
   const [showAddPaper, setShowAddPaper] = useState(false);
   const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', batch: '' });
   const [newPaper, setNewPaper] = useState({ paperCode: '', testType: 'READING', title: '', timeLimitMin: 60 });
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [message, setMessage] = useState('');
   const [reorderMode, setReorderMode] = useState(false);
   const [draggedItem, setDraggedItem] = useState(null);
   const [showImportModal, setShowImportModal] = useState(false);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [importText, setImportText] = useState('');
   const [importType, setImportType] = useState('READING');
   const [importCode, setImportCode] = useState('');
   const [importTitle, setImportTitle] = useState('');
   const [importLoading, setImportLoading] = useState(false);
   const [importError, setImportError] = useState('');
   const [importSuccess, setImportSuccess] = useState('');
   const navigate = useNavigate();
   const user = JSON.parse(localStorage.getItem('user') || '{}');

   useEffect(() => { fetchAll(); }, []);
   
   const handleDragStart = (e, index) => {
      setDraggedItem(index);
      e.dataTransfer.effectAllowed = 'move';
      e.target.style.opacity = '0.5';
   };

   const handleDragOver = (e, index) => {
      e.preventDefault();
      if (draggedItem === null || draggedItem === index) return;
      
      const newPapers = [...papers];
      const draggedPaper = newPapers[draggedItem];
      newPapers.splice(draggedItem, 1);
      newPapers.splice(index, 0, draggedPaper);
      
      setDraggedItem(index);
      setPapers(newPapers);
   };

   const handleDragEnd = (e) => {
      e.target.style.opacity = '1';
      setDraggedItem(null);
   };

   const movePaper = (index, direction) => {
      const newPapers = [...papers];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newPapers.length) return;
      
      const item = newPapers[index];
      newPapers.splice(index, 1);
      newPapers.splice(targetIndex, 0, item);
      setPapers(newPapers);
   };

   const fetchAll = async () => {
      setLoading(true);
      try {
         const [s, p, r] = await Promise.all([
            axios.get(`${API_URL}/api/admin/students`, api()),
            axios.get(`${API_URL}/api/admin/papers`, api()),
            axios.get(`${API_URL}/api/admin/results`, api())
         ]);
         setStudents(s.data);
         setPapers(p.data);
         setResults(r.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
   };

   const addStudent = async () => {
      if (!newStudent.name || !newStudent.email || !newStudent.password) {
         setMessage('Please fill all required fields');
         return;
      }
      setSaving(true);
      try {
         await axios.post(`${API_URL}/api/admin/students`, newStudent, api());
         setMessage('Student added successfully!');
         setNewStudent({ name: '', email: '', password: '', batch: '' });
         setShowAddStudent(false);
         fetchAll();
      } catch {
         setMessage('Failed to add student. Email may already exist.');
      } finally { setSaving(false); }
   };

   const addPaper = async () => {
      if (!newPaper.paperCode || !newPaper.title) {
         setMessage('Please fill all required fields');
         return;
      }
      setSaving(true);
      try {
         const res = await axios.post(`${API_URL}/api/admin/papers`, {
            ...newPaper,
            timeLimitMin: parseInt(newPaper.timeLimitMin),
            status: 'ACTIVE'
         }, api());
         setMessage('Paper created successfully!');
         setNewPaper({ paperCode: '', testType: 'READING', title: '', timeLimitMin: 60 });
         setShowAddPaper(false);
         navigate(`/admin/papers/${res.data.id}`);
      } catch {
         setMessage('Failed to create paper.');
      } finally { setSaving(false); }
   };

   const getBandColor = (band) => {
      if (!band) return { bg: '#f1f5f9', color: '#64748b' };
      if (band >= 7) return { bg: '#f0fdf4', color: '#16a34a' };
      if (band >= 5.5) return { bg: '#fffbeb', color: '#d97706' };
      return { bg: '#fef2f2', color: '#dc2626' };
   };

   const getTypeColor = (type) => {
      const c = {
         READING: { bg: '#eff6ff', color: '#1d4ed8' },
         WRITING: { bg: '#f0fdf4', color: '#16a34a' },
         LISTENING: { bg: '#faf5ff', color: '#7c3aed' },
         SPEAKING: { bg: '#fff7ed', color: '#ea580c' }
      };
      return c[type] || { bg: '#f1f5f9', color: '#475569' };
   };

   const avgBand = results.length > 0
      ? (results.reduce((sum, r) => sum + (r.result?.bandEstimate || 0), 0) / results.length).toFixed(1)
      : '—';

   const todayResults = results.filter(r => {
      if (!r.endedAt) return false;
      const today = new Date();
      const end = new Date(r.endedAt);
      return end.toDateString() === today.toDateString();
   }).length;

   return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
         <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .tab-btn { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: #64748b; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .tab-btn:hover { background: #f1f5f9; color: #1e293b; }
        .tab-btn.active { background: #4f46e5; color: #ffffff; font-weight: 600; }
        
        .action-btn { padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; border: none; }
        .action-btn.primary { background: #4f46e5; color: white; }
        .action-btn.primary:hover { background: #4338ca; transform: translateY(-1px); }
        .action-btn.danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .action-btn.danger:hover { background: #fee2e2; }
        .action-btn.outline { background: white; color: #475569; border: 1px solid #e2e8f0; }
        .action-btn.outline:hover { border-color: #4f46e5; color: #4f46e5; }
        
        .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif; color: #1e293b; outline: none; transition: border-color 0.2s; box-sizing: border-box; background: white; }
        .form-input:focus { border-color: #4f46e5; }
        
        .table-row { display: grid; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; align-items: center; transition: background 0.15s; }
        .table-row:hover { background: #f8fafc; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease; }
        .modal-box { background: white; border-radius: 20px; padding: 36px; width: 100%; max-width: 480px; box-shadow: 0 24px 64px rgba(0,0,0,0.2); animation: fadeUp 0.3s ease; }

        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; } }
        
        .admin-nav { background: #1a1a2e; padding: 0 16px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        @media (min-width: 768px) { .admin-nav { padding: 0 40px; height: 64px; } }
        
        .admin-container { max-width: 1280px; margin: 0 auto; padding: 20px 16px; }
        @media (min-width: 768px) { .admin-container { padding: 32px 40px; } }
        
        .table-container { width: 100%; overflow-x: auto; }
        .admin-table { min-width: 700px; }
        
        .mobile-hide { display: none !important; }
        @media (min-width: 768px) { .mobile-hide { display: block !important; } }
        
        .tab-bar { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
        @media (min-width: 768px) { .tab-bar { flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 20px; } }
      `}</style>

         {/* NAVBAR */}
         <nav className="admin-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <img src={settings.logoUrl} alt="Logo" style={{ height: '28px', maxWidth: '120px', objectFit: 'contain' }} />
               <div className="mobile-hide" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)' }} />
               <span className="mobile-hide" style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {settings.siteName} Panel
               </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <div className="mobile-hide" style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>{user.name}</div>
                  <div style={{ fontSize: '10px', color: '#f59e0b' }}>Administrator</div>
               </div>
               <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#1a1a2e', fontSize: '12px', fontWeight: '700'
               }}>
                  {user.name?.charAt(0) || 'A'}
               </div>
               <button
                  onClick={() => { localStorage.clear(); navigate('/login'); }}
                  style={{
                     padding: '6px 12px',
                     background: 'rgba(255,255,255,0.08)',
                     color: 'rgba(255,255,255,0.7)',
                     border: '1px solid rgba(255,255,255,0.15)',
                     borderRadius: '6px',
                     fontSize: '12px',
                     cursor: 'pointer',
                     fontFamily: "'Inter', sans-serif"
                  }}
               >Logout</button>
            </div>
         </nav>

         <div className="admin-container">

            {/* Message */}
            {message && (
               <div style={{
                  background: message.includes('success') ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: message.includes('success') ? '#166534' : '#dc2626'
               }}>
                  <span>{message.includes('success') ? '✅' : '⚠️'} {message}</span>
                  <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit' }}>×</button>
               </div>
            )}

            {/* STAT CARDS */}
            <div className="stats-grid">
               {[
                  { icon: '👨‍🎓', label: 'Total Students', value: students.length, color: '#4f46e5', bg: '#eff0fe' },
                  { icon: '📋', label: 'Active Papers', value: papers.filter(p => p.status === 'ACTIVE').length, color: '#16a34a', bg: '#f0fdf4' },
                  { icon: '📝', label: 'Tests Today', value: todayResults, color: '#d97706', bg: '#fffbeb' },
                  { icon: '⭐', label: 'Average Band', value: avgBand, color: '#dc2626', bg: '#fef2f2' }
               ].map((stat, i) => (
                  <div key={i} style={{
                     background: '#ffffff',
                     borderRadius: '16px',
                     padding: '24px',
                     border: '1px solid #e2e8f0',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '16px',
                     boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                     animationDelay: `${i * 0.1}s`
                  }}>
                     <div style={{
                        width: '52px', height: '52px',
                        borderRadius: '14px',
                        background: stat.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0
                     }}>{stat.icon}</div>
                     <div>
                        <div style={{
                           fontSize: '28px',
                           fontWeight: '700',
                           color: stat.color,
                           fontFamily: "'Playfair Display', serif",
                           lineHeight: '1'
                        }}>{stat.value}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{stat.label}</div>
                     </div>
                  </div>
               ))}
            </div>

            {/* TABS */}
            <div style={{
               background: '#ffffff',
               borderRadius: '16px',
               border: '1px solid #e2e8f0',
               overflow: 'hidden',
               boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>

               {/* Tab bar */}
               <div className="tab-bar">
                  <div style={{ display: 'flex', gap: '4px' }}>
                     {[
                        { id: 'students', label: '👨‍🎓 Students', count: students.length },
                        { id: 'papers', label: '📋 Papers', count: papers.length },
                        { id: 'results', label: '📊 Results', count: results.length },
                        { id: 'settings', label: '⚙️ Settings', count: null }
                     ].map(tab => (
                        <button
                           key={tab.id}
                           className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                           onClick={() => setActiveTab(tab.id)}
                        >
                           {tab.label}
                           {tab.count !== null && (
                              <span style={{
                                 marginLeft: '8px',
                                 background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                                 color: activeTab === tab.id ? '#ffffff' : '#64748b',
                                 borderRadius: '12px',
                                 padding: '1px 8px',
                                 fontSize: '11px',
                                 fontWeight: '700'
                              }}>{tab.count}</span>
                           )}
                        </button>
                     ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                     {activeTab === 'students' && (
                        <button className="action-btn primary" onClick={() => setShowAddStudent(true)}>
                           + Add Student
                        </button>
                     )}
                     {activeTab === 'papers' && (
                        <>
                           {!reorderMode ? (
                              <>
                                 <button className="action-btn outline" onClick={() => setReorderMode(true)}>
                                    ↕️ Reorder Papers
                                 </button>
                                 <button className="action-btn outline" onClick={() => navigate('/admin/papers/import')}>
                                    ✨ Import Paper (AI)
                                 </button>
                                 <button className="action-btn primary" onClick={() => navigate('/admin/papers/create')}>
                                    + Create Paper
                                 </button>
                              </>
                           ) : (
                              <>
                                 <button className="action-btn outline" onClick={() => { setReorderMode(false); fetchAll(); }}>
                                    Cancel
                                 </button>
                                 <button className="action-btn primary" onClick={async () => {
                                    setSaving(true);
                                    try {
                                       const orders = papers.map((p, i) => ({ id: p.id, order: i }));
                                       await axios.post(`${API_URL}/api/admin/papers/reorder`, { orders }, api());
                                       setMessage('Order updated successfully! ✨');
                                       setReorderMode(false);
                                       fetchAll();
                                    } catch (e) {
                                       setMessage('Failed to update order.');
                                    } finally { setSaving(false); }
                                 }}>
                                    Save New Order
                                 </button>
                              </>
                           )}
                        </>
                     )}
                  </div>
               </div>

               {/* STUDENTS TAB */}
               {activeTab === 'students' && (
                  <div className="table-container">
                     <div className="admin-table">
                        <div style={{
                           display: 'grid',
                           gridTemplateColumns: '2fr 2fr 1fr 1fr',
                           gap: '12px',
                           padding: '12px 20px',
                           background: '#f8fafc',
                           borderBottom: '1px solid #f1f5f9'
                        }}>
                           {['Name', 'Email', 'Batch', 'Actions'].map(h => (
                              <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                           ))}
                        </div>
                        {loading ? (
                           <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                        ) : students.length === 0 ? (
                           <div style={{ padding: '48px', textAlign: 'center' }}>
                              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍🎓</div>
                              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No students yet. Add your first student!</p>
                           </div>
                        ) : students.map((s, i) => (
                           <div key={s.id} className="table-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 <div style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '13px', fontWeight: '600', flexShrink: 0
                                 }}>
                                    {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                 </div>
                                 <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{s.name}</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>{s.email}</span>
                              <span style={{
                                 display: 'inline-block',
                                 background: '#eff6ff',
                                 color: '#1d4ed8',
                                 padding: '3px 10px',
                                 borderRadius: '20px',
                                 fontSize: '12px',
                                 fontWeight: '500'
                              }}>{s.batch || 'General'}</span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                 <button className="action-btn outline" style={{ padding: '6px 12px', fontSize: '12px' }}>View</button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* PAPERS TAB */}
               {activeTab === 'papers' && (
                  <div style={{ padding: '24px' }}>
                     <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                        <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:'#1e3a5f', margin:0 }}>
                           Papers ({papers.length})
                        </h2>
                        <div style={{ display:'flex', gap:10 }}>
                           <button onClick={() => setShowImportModal(true)}
                              style={{ padding:'10px 20px', background:'linear-gradient(135deg,#7c3aed,#2563eb)', color:'white', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                              🤖 Import with AI
                           </button>
                           <button onClick={() => navigate('/admin/papers/create')}
                              style={{ padding:'10px 20px', background:'linear-gradient(135deg,#1e3a5f,#2563eb)', color:'white', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                              + Create Paper
                           </button>
                        </div>
                     </div>

                     {loading ? (
                        <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>Loading...</div>
                     ) : papers.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'60px 20px', background:'white', borderRadius:16, border:'1px solid #dbeafe' }}>
                           <div style={{ fontSize:48, marginBottom:16 }}>📄</div>
                           <h3 style={{ color:'#1e3a5f', marginBottom:8 }}>No papers yet</h3>
                           <p style={{ color:'#64748b', marginBottom:20 }}>Import a paper with AI or create one manually</p>
                           <button onClick={() => setShowImportModal(true)}
                              style={{ padding:'12px 28px', background:'linear-gradient(135deg,#7c3aed,#2563eb)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
                              🤖 Import First Paper
                           </button>
                        </div>
                     ) : (
                        <div style={{ display:'grid', gap:12 }}>
                           {papers.map((p, i) => (
                              <div 
                                 key={p.id} 
                                 draggable={reorderMode}
                                 onDragStart={(e) => handleDragStart(e, i)}
                                 onDragOver={(e) => handleDragOver(e, i)}
                                 onDragEnd={handleDragEnd}
                                 style={{ 
                                    background:'white', 
                                    border: draggedItem === i ? '2px dashed #4f46e5' : '1px solid #dbeafe', 
                                    borderRadius:14, 
                                    padding:'18px 20px', 
                                    display:'flex', 
                                    alignItems:'center', 
                                    justifyContent:'space-between', 
                                    gap:16,
                                    cursor: reorderMode ? 'move' : 'default',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                 }}>
                                 {reorderMode && (
                                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                       <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                          <button 
                                             onClick={(e) => { e.stopPropagation(); movePaper(i, -1); }}
                                             style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'white', border:'1px solid #dbeafe', borderRadius:6, cursor:'pointer', color:'#4f46e5', fontSize:12 }}
                                             disabled={i === 0}
                                          >▲</button>
                                          <button 
                                             onClick={(e) => { e.stopPropagation(); movePaper(i, 1); }}
                                             style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'white', border:'1px solid #dbeafe', borderRadius:6, cursor:'pointer', color:'#4f46e5', fontSize:12 }}
                                             disabled={i === papers.length - 1}
                                          >▼</button>
                                       </div>
                                       <div style={{ fontSize: 18, color: '#94a3b8', cursor: 'move' }}>⠿</div>
                                    </div>
                                 )}
                                 <div style={{ display:'flex', alignItems:'center', gap:14, flex:1 }}>
                                    <div style={{ width:44, height:44, borderRadius:10, background:
                                       p.testType==='READING' ? '#eff6ff' :
                                       p.testType==='WRITING' ? '#f5f3ff' :
                                       p.testType==='LISTENING' ? '#fff7ed' : '#f0fdf4',
                                       display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                                       {p.testType==='READING'?'📖':p.testType==='WRITING'?'✍️':p.testType==='LISTENING'?'🎧':'🗣️'}
                                    </div>
                                    <div>
                                       <div style={{ fontWeight:700, color:'#1e3a5f', fontSize:15, marginBottom:3 }}>
                                          {p.testType} {p.paperCode} — {p.title}
                                       </div>
                                       <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                                          <span style={{ fontSize:11, color:'#64748b' }}>⏱ {p.timeLimitMin} min</span>
                                          <span style={{ fontSize:11, color:'#64748b' }}>ID: {p.id}</span>
                                          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background: p.status==='ACTIVE'?'#f0fdf4':'#fef3c7', color: p.status==='ACTIVE'?'#16a34a':'#d97706', fontWeight:600 }}>
                                             {p.status}
                                          </span>
                                          {p.audioUrl && <span style={{ fontSize:11, color:'#2563eb' }}>🎵 Audio</span>}
                                       </div>
                                    </div>
                                 </div>
                                 <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                                    <button className="action-btn outline" style={{ padding:'7px 12px', fontSize:12 }} onClick={() => navigate(`/admin/papers/${p.id}`)}>✏️ Edit</button>
                                    {p.testType === 'LISTENING' && (
                                       <label style={{ padding:'7px 12px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, fontSize:12, fontWeight:600, color:'#2563eb', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center' }}>
                                          🎵 {p.audioUrl ? 'Change Audio' : 'Upload Audio'}
                                          <input type="file" accept=".mp3,.wav,.ogg,.m4a" style={{ display:'none' }}
                                             onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const fd = new FormData();
                                                fd.append('audio', file);
                                                try {
                                                   await axios.post(`${API_URL}/api/admin/papers/${p.id}/upload-audio`, fd, {
                                                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type':'multipart/form-data' }
                                                   });
                                                   setMessage('Audio uploaded successfully!');
                                                   fetchAll();
                                                } catch(err) { setMessage('Upload failed: ' + (err.response?.data?.error||err.message)); }
                                             }} />
                                       </label>
                                    )}
                                    <button
                                       onClick={() => {
                                          if (window.confirm(`Delete ${p.testType} ${p.paperCode} — ${p.title}?\n\nThis will also delete all student attempts for this paper. This cannot be undone.`)) {
                                             axios.delete(`${API_URL}/api/admin/papers/${p.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                                                .then(() => { setMessage('Paper deleted successfully'); fetchAll(); })
                                                .catch(err => setMessage('Delete failed: ' + (err.response?.data?.error||err.message)));
                                          }
                                       }}
                                       style={{ padding:'7px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, fontSize:12, fontWeight:600, color:'#dc2626', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                                       🗑 Delete
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* IMPORT MODAL */}
                     {showImportModal && (
                        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
                           <div style={{ background:'white', borderRadius:20, padding:36, width:'90%', maxWidth:700, maxHeight:'92vh', overflowY:'auto' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                                 <h2 style={{ fontFamily:'Playfair Display,serif', color:'#1e3a5f', margin:0, fontSize:22 }}>🤖 Import Paper with AI</h2>
                                 <button onClick={() => { setShowImportModal(false); setImportError(''); setImportSuccess(''); }}
                                    style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94a3b8' }}>✕</button>
                              </div>

                              <div style={{ background:'#eff6ff', borderRadius:12, padding:14, marginBottom:20, border:'1px solid #bfdbfe' }}>
                                 <p style={{ fontSize:13, color:'#1d4ed8', margin:0, lineHeight:1.7 }}>
                                    <strong>How to use:</strong> Copy and paste the complete text of your IELTS paper below including passages, questions, and answer key. The AI will extract everything automatically.
                                 </p>
                              </div>

                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
                                 <div>
                                    <label style={{ fontSize:11, fontWeight:700, color:'#475569', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Test Type *</label>
                                    <select value={importType} onChange={e => setImportType(e.target.value)}
                                       style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #dbeafe', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', background:'white' }}>
                                       <option value="READING">📖 Reading</option>
                                       <option value="WRITING">✍️ Writing</option>
                                       <option value="LISTENING">🎧 Listening</option>
                                       <option value="SPEAKING">🗣️ Speaking</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label style={{ fontSize:11, fontWeight:700, color:'#475569', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Paper Code *</label>
                                    <input value={importCode} onChange={e => setImportCode(e.target.value)}
                                       placeholder="e.g. 004"
                                       style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #dbeafe', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' }} />
                                 </div>
                                 <div>
                                    <label style={{ fontSize:11, fontWeight:700, color:'#475569', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Title (optional)</label>
                                    <input value={importTitle} onChange={e => setImportTitle(e.target.value)}
                                       placeholder="Paper title"
                                       style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #dbeafe', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' }} />
                                 </div>
                              </div>

                              <div style={{ marginBottom:16 }}>
                                 <label style={{ fontSize:11, fontWeight:700, color:'#475569', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                                    Paper Text * <span style={{ color:'#94a3b8', fontWeight:400, textTransform:'none', fontSize:12 }}>{importText.length} characters pasted</span>
                                 </label>
                                 <textarea value={importText} onChange={e => setImportText(e.target.value)}
                                    placeholder={importType === 'READING' ? 'Paste the complete reading paper here — include all 3 passages and all 40 questions with the answer key...' :
                                       importType === 'WRITING' ? 'Paste the complete writing paper here — include Task 1 and Task 2 questions...' :
                                       importType === 'LISTENING' ? 'Paste the complete listening paper here — include all sections and questions...' :
                                       'Paste the complete speaking paper here — include Part 1, 2, and 3 questions...'}
                                    rows={14}
                                    style={{ width:'100%', padding:'14px', border:'1.5px solid #dbeafe', borderRadius:10, fontSize:13, fontFamily:'Inter,sans-serif', outline:'none', resize:'vertical', lineHeight:1.7, boxSizing:'border-box' }} />
                              </div>

                              {importError && (
                                 <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
                                    <p style={{ color:'#dc2626', fontSize:13, margin:0, lineHeight:1.7, fontWeight:500 }}>❌ {importError}</p>
                                 </div>
                              )}

                              {importSuccess && (
                                 <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
                                    <p style={{ color:'#16a34a', fontSize:13, margin:0, lineHeight:1.7, fontWeight:500 }}>✅ {importSuccess}</p>
                                 </div>
                              )}

                              <button onClick={async () => {
                                 if (!importText.trim()) { setImportError('Please paste the paper text.'); return; }
                                 if (!importCode.trim()) { setImportError('Please enter a paper code like 004 or 002.'); return; }
                                 setImportLoading(true);
                                 setImportError('');
                                 setImportSuccess('');
                                 try {
                                    const res = await axios.post(
                                       `${API_URL}/api/admin/papers/import-ai`,
                                       { rawText: importText, testType: importType, paperCode: importCode, title: importTitle },
                                       { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, timeout: 120000 }
                                    );
                                    setImportSuccess(res.data.message || 'Paper imported successfully!');
                                    setImportText('');
                                    setImportCode('');
                                    setImportTitle('');
                                    fetchAll();
                                    setTimeout(() => { setShowImportModal(false); setImportSuccess(''); }, 4000);
                                 } catch(err) {
                                    const msg = err.response?.data?.error || err.message || 'Import failed. Try again.';
                                    setImportError(msg);
                                 } finally {
                                    setImportLoading(false);
                                 }
                              }} disabled={importLoading}
                                 style={{ width:'100%', padding:'16px', background: importLoading ? '#94a3b8' : 'linear-gradient(135deg,#7c3aed,#2563eb)', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor: importLoading?'not-allowed':'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.2s' }}>
                                 {importLoading ? '🤖 AI is processing your paper... please wait 30-60 seconds' : '🤖 Import with AI'}
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {/* RESULTS TAB */}
               {activeTab === 'results' && (
                  <div className="table-container">
                     <div className="admin-table">
                        <div style={{
                           display: 'grid',
                           gridTemplateColumns: '2fr 2fr 1fr 80px 100px',
                           gap: '12px',
                           padding: '12px 20px',
                           background: '#f8fafc',
                           borderBottom: '1px solid #f1f5f9'
                        }}>
                           {['Student', 'Paper', 'Date', 'Score', 'Band'].map(h => (
                              <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                           ))}
                        </div>
                        {loading ? (
                           <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                        ) : results.length === 0 ? (
                           <div style={{ padding: '48px', textAlign: 'center' }}>
                              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No results yet.</p>
                           </div>
                        ) : results.map((r, i) => {
                           const band = r.result?.bandEstimate;
                           const bc = getBandColor(band);
                           return (
                              <div key={r.id} className="table-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 80px 100px' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                       width: '30px', height: '30px', borderRadius: '50%',
                                       background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                                       color: 'white', fontSize: '11px', fontWeight: '600', flexShrink: 0
                                    }}>
                                       {r.student?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                       <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>{r.student?.name}</div>
                                       <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.student?.batch}</div>
                                    </div>
                                 </div>
                                 <div>
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                                       EPIC IELTS — {r.paper?.testType} {r.paper?.paperCode}
                                    </div>
                                 </div>
                                 <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    {r.endedAt ? new Date(r.endedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '—'}
                                 </span>
                                 <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                    {r.result?.rawScore ?? '—'}/40
                                 </span>
                                 <span style={{
                                    display: 'inline-block',
                                    background: bc.bg, color: bc.color,
                                    padding: '4px 12px', borderRadius: '20px',
                                    fontSize: '13px', fontWeight: '700'
                                 }}>{band?.toFixed(1) || '—'}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* ADD STUDENT MODAL */}
         {showAddStudent && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddStudent(false); }}>
               <div className="modal-box">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#1a1a2e', marginBottom: '6px' }}>Add New Student</h2>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>Fill in the details to create a student account</p>

                  {[
                     { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'e.g. Aarav Silva' },
                     { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'e.g. aarav@epiccampus.com' },
                     { label: 'Password *', key: 'password', type: 'password', placeholder: 'Minimum 6 characters' },
                     { label: 'Batch / Class', key: 'batch', type: 'text', placeholder: 'e.g. BATCH-A or GENERAL' }
                  ].map(field => (
                     <div key={field.key} style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                           {field.label}
                        </label>
                        <input
                           className="form-input"
                           type={field.type}
                           placeholder={field.placeholder}
                           value={newStudent[field.key]}
                           onChange={e => setNewStudent(prev => ({ ...prev, [field.key]: e.target.value }))}
                        />
                     </div>
                  ))}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                     <button
                        className="action-btn outline"
                        style={{ flex: 1, padding: '12px' }}
                        onClick={() => setShowAddStudent(false)}
                     >Cancel</button>
                     <button
                        className="action-btn primary"
                        style={{ flex: 2, padding: '12px' }}
                        onClick={addStudent}
                        disabled={saving}
                     >{saving ? 'Adding...' : 'Add Student'}</button>
                  </div>
               </div>
            </div>
         )}

         {/* ADD PAPER MODAL */}
         {showAddPaper && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddPaper(false); }}>
               <div className="modal-box">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#1a1a2e', marginBottom: '6px' }}>Create New Paper</h2>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>Fill in the paper details</p>

                  <div style={{ marginBottom: '16px' }}>
                     <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Paper Code *</label>
                     <input className="form-input" placeholder="e.g. 003" value={newPaper.paperCode}
                        onChange={e => setNewPaper(p => ({ ...p, paperCode: e.target.value }))} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                     <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Test Type *</label>
                     <select className="form-input" value={newPaper.testType}
                        onChange={e => setNewPaper(p => ({ ...p, testType: e.target.value }))}>
                        <option value="READING">Reading</option>
                        <option value="WRITING">Writing</option>
                        <option value="LISTENING">Listening</option>
                        <option value="SPEAKING">Speaking</option>
                     </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                     <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Title *</label>
                     <input className="form-input" placeholder="e.g. IELTS Academic Reading Test 3"
                        value={newPaper.title} onChange={e => setNewPaper(p => ({ ...p, title: e.target.value }))} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                     <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Time Limit (minutes)</label>
                     <input className="form-input" type="number" value={newPaper.timeLimitMin}
                        onChange={e => setNewPaper(p => ({ ...p, timeLimitMin: e.target.value }))} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                     <button className="action-btn outline" style={{ flex: 1, padding: '12px' }}
                        onClick={() => setShowAddPaper(false)}>Cancel</button>
                     <button className="action-btn primary" style={{ flex: 2, padding: '12px' }}
                        onClick={addPaper} disabled={saving}>
                        {saving ? 'Creating...' : 'Create Paper'}
                     </button>
                  </div>
               </div>
            </div>
         )}
            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
               <div className="table-container" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '24px' }}>Platform Settings</h3>
                  
                  <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                     <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Site Name</label>
                        <input 
                           type="text" 
                           className="input-field" 
                           value={settings.siteName} 
                           onChange={e => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                        />
                     </div>
                     
                     <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Logo URL</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                           <input 
                              type="text" 
                              className="input-field" 
                              value={settings.logoUrl} 
                              onChange={e => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                           />
                           <img src={settings.logoUrl} alt="Preview" style={{ height: '32px', maxWidth: '100px', objectFit: 'contain', background: '#1a1a2e', padding: '4px', borderRadius: '4px' }} />
                        </div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Tip: You can use a direct image URL or a local path like /logo.png</p>
                     </div>

                     <button 
                        onClick={() => {
                           localStorage.setItem('siteSettings', JSON.stringify(settings));
                           setMessage('Settings saved successfully!');
                           setTimeout(() => setMessage(''), 3000);
                        }}
                        style={{
                           marginTop: '12px',
                           padding: '12px 24px',
                           background: '#4f46e5',
                           color: 'white',
                           border: 'none',
                           borderRadius: '10px',
                           fontWeight: '700',
                           cursor: 'pointer'
                        }}
                     >Save Settings</button>
                  </div>
               </div>
            )}

      </div>
   );
}