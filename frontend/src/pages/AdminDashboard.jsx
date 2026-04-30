import { useEffect, useState, useMemo } from 'react';
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
   const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', batch: '' });
   const [newPaper, setNewPaper] = useState({ paperCode: '', testType: 'READING', title: '', timeLimitMin: 60 });
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [message, setMessage] = useState('');
   const [reorderMode, setReorderMode] = useState(false);
   const [draggedItem, setDraggedItem] = useState(null);
   const [importText, setImportText] = useState('');
   const [importType, setImportType] = useState('READING');
   const [importCode, setImportCode] = useState('');
   const [importTitle, setImportTitle] = useState('');
   const [importLoading, setImportLoading] = useState(false);
   const [importError, setImportError] = useState('');
   const [importSuccess, setImportSuccess] = useState('');
   const [showImportModal, setShowImportModal] = useState(false);

   // Results filters
   const [filterType, setFilterType] = useState('ALL');
   const [filterSearch, setFilterSearch] = useState('');
   const [filterBandMin, setFilterBandMin] = useState('');
   const [filterBandMax, setFilterBandMax] = useState('');

   // Submission detail modal
   const [detailModal, setDetailModal] = useState(null); // attempt detail data
   const [detailLoading, setDetailLoading] = useState(false);

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
   const handleDragEnd = (e) => { e.target.style.opacity = '1'; setDraggedItem(null); };
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

   const openDetail = async (attempt) => {
      setDetailLoading(true);
      setDetailModal({ loading: true, attempt });
      try {
         const res = await axios.get(`${API_URL}/api/admin/results/${attempt.id}/detail`, api());
         setDetailModal({ loading: false, data: res.data });
      } catch (err) {
         setDetailModal({ loading: false, error: err.response?.data?.error || err.message });
      } finally {
         setDetailLoading(false);
      }
   };

   const addStudent = async () => {
      if (!newStudent.name || !newStudent.email || !newStudent.password) { setMessage('Please fill all required fields'); return; }
      setSaving(true);
      try {
         await axios.post(`${API_URL}/api/admin/students`, newStudent, api());
         setMessage('Student added successfully!');
         setNewStudent({ name: '', email: '', password: '', batch: '' });
         setShowAddStudent(false);
         fetchAll();
      } catch { setMessage('Failed to add student. Email may already exist.'); }
      finally { setSaving(false); }
   };

   const getBandColor = (band) => {
      if (!band) return { bg: '#f1f5f9', color: '#64748b' };
      if (band >= 7) return { bg: '#f0fdf4', color: '#16a34a' };
      if (band >= 5) return { bg: '#fffbeb', color: '#d97706' };
      return { bg: '#fef2f2', color: '#dc2626' };
   };

   const avgBand = results.length > 0
      ? (results.reduce((sum, r) => sum + (r.result?.bandEstimate || 0), 0) / results.filter(r => r.result?.bandEstimate).length || 0).toFixed(1)
      : '—';

   const todayResults = results.filter(r => {
      if (!r.endedAt) return false;
      const today = new Date();
      const end = new Date(r.endedAt);
      return end.toDateString() === today.toDateString();
   }).length;

   // Filtered results
   const filteredResults = useMemo(() => {
      return results.filter(r => {
         if (filterType !== 'ALL' && r.paper?.testType !== filterType) return false;
         if (filterSearch) {
            const search = filterSearch.toLowerCase();
            const nameMatch = r.student?.name?.toLowerCase().includes(search);
            const emailMatch = r.student?.email?.toLowerCase().includes(search);
            const paperMatch = r.paper?.paperCode?.toLowerCase().includes(search);
            if (!nameMatch && !emailMatch && !paperMatch) return false;
         }
         const band = r.result?.bandEstimate;
         if (filterBandMin !== '' && (!band || band < parseFloat(filterBandMin))) return false;
         if (filterBandMax !== '' && (!band || band > parseFloat(filterBandMax))) return false;
         return true;
      });
   }, [results, filterType, filterSearch, filterBandMin, filterBandMax]);

   const clearFilters = () => {
      setFilterType('ALL');
      setFilterSearch('');
      setFilterBandMin('');
      setFilterBandMax('');
   };

   const hasActiveFilters = filterType !== 'ALL' || filterSearch || filterBandMin || filterBandMax;

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
            .result-row { cursor: pointer; }
            .result-row:hover { background: #f0f4ff !important; }
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
            .filter-bar { display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 20px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; align-items: center; }
            .filter-input { padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; color: #1e293b; outline: none; background: white; transition: border-color 0.2s; }
            .filter-input:focus { border-color: #4f46e5; }
            .detail-modal { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.25); animation: fadeUp 0.3s ease; }
            .answer-row { display: grid; grid-template-columns: 40px 1fr 120px 120px 32px; gap: 10px; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; align-items: start; font-size: 13px; }
            .answer-row:hover { background: #fafafa; }
            .writing-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
            .tag { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
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
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1a2e', fontSize: '12px', fontWeight: '700' }}>
                  {user.name?.charAt(0) || 'A'}
               </div>
               <button onClick={() => { localStorage.clear(); navigate('/login'); }}
                  style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                  Logout
               </button>
            </div>
         </nav>

         <div className="admin-container">
            {message && (
               <div style={{ background: message.includes('success') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: message.includes('success') ? '#166534' : '#dc2626' }}>
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
                  <div key={i} style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                     <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{stat.icon}</div>
                     <div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color, fontFamily: "'Playfair Display', serif", lineHeight: '1' }}>{stat.value}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{stat.label}</div>
                     </div>
                  </div>
               ))}
            </div>

            {/* TABS CONTAINER */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

               {/* Tab bar */}
               <div className="tab-bar">
                  <div style={{ display: 'flex', gap: '4px' }}>
                     {[
                        { id: 'students', label: '👨‍🎓 Students', count: students.length },
                        { id: 'papers', label: '📋 Papers', count: papers.length },
                        { id: 'results', label: '📊 Results', count: results.length },
                        { id: 'settings', label: '⚙️ Settings', count: null }
                     ].map(tab => (
                        <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                           {tab.label}
                           {tab.count !== null && (
                              <span style={{ marginLeft: '8px', background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: activeTab === tab.id ? '#ffffff' : '#64748b', borderRadius: '12px', padding: '1px 8px', fontSize: '11px', fontWeight: '700' }}>{tab.count}</span>
                           )}
                        </button>
                     ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     {activeTab === 'students' && <button className="action-btn primary" onClick={() => setShowAddStudent(true)}>+ Add Student</button>}
                     {activeTab === 'papers' && !reorderMode && (
                        <>
                           <button className="action-btn outline" onClick={() => setReorderMode(true)}>↕️ Reorder</button>
                           <button className="action-btn outline" onClick={() => navigate('/admin/papers/import')}>✨ Import (AI/JSON)</button>
                           <button className="action-btn primary" onClick={() => navigate('/admin/papers/create')}>+ Create Paper</button>
                        </>
                     )}
                     {activeTab === 'papers' && reorderMode && (
                        <>
                           <button className="action-btn outline" onClick={() => { setReorderMode(false); fetchAll(); }}>Cancel</button>
                           <button className="action-btn primary" onClick={async () => {
                              setSaving(true);
                              try {
                                 const orders = papers.map((p, i) => ({ id: p.id, order: i }));
                                 await axios.post(`${API_URL}/api/admin/papers/reorder`, { orders }, api());
                                 setMessage('Order updated successfully! ✨');
                                 setReorderMode(false);
                                 fetchAll();
                              } catch { setMessage('Failed to update order.'); }
                              finally { setSaving(false); }
                           }}>Save Order</button>
                        </>
                     )}
                  </div>
               </div>

               {/* ── STUDENTS TAB ── */}
               {activeTab === 'students' && (
                  <div className="table-container">
                     <div className="admin-table">
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '12px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                           {['Name', 'Email', 'Batch', 'Actions'].map(h => (
                              <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                           ))}
                        </div>
                        {loading ? (
                           <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                        ) : students.length === 0 ? (
                           <div style={{ padding: '48px', textAlign: 'center' }}>
                              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍🎓</div>
                              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No students yet.</p>
                           </div>
                        ) : students.map(s => (
                           <div key={s.id} className="table-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>
                                    {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                 </div>
                                 <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{s.name}</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>{s.email}</span>
                              <span style={{ display: 'inline-block', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{s.batch || 'General'}</span>
                              <div><button className="action-btn outline" style={{ padding: '6px 12px', fontSize: '12px' }}>View</button></div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* ── PAPERS TAB ── */}
               {activeTab === 'papers' && (
                  <div style={{ padding: '24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, color: '#1e3a5f', margin: 0 }}>Papers ({papers.length})</h2>
                     </div>
                     {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>Loading...</div>
                     ) : papers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #dbeafe' }}>
                           <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                           <h3 style={{ color: '#1e3a5f', marginBottom: 8 }}>No papers yet</h3>
                           <p style={{ color: '#64748b', marginBottom: 20 }}>Import a paper with AI or create one manually</p>
                        </div>
                     ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                           {papers.map((p, i) => (
                              <div key={p.id} draggable={reorderMode} onDragStart={e => handleDragStart(e, i)} onDragOver={e => handleDragOver(e, i)} onDragEnd={handleDragEnd}
                                 style={{ background: 'white', border: draggedItem === i ? '2px dashed #4f46e5' : '1px solid #dbeafe', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: reorderMode ? 'move' : 'default', transition: 'all 0.2s' }}>
                                 {reorderMode && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                          <button onClick={e => { e.stopPropagation(); movePaper(i, -1); }} disabled={i === 0} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #dbeafe', borderRadius: 6, cursor: 'pointer', color: '#4f46e5', fontSize: 12 }}>▲</button>
                                          <button onClick={e => { e.stopPropagation(); movePaper(i, 1); }} disabled={i === papers.length - 1} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #dbeafe', borderRadius: 6, cursor: 'pointer', color: '#4f46e5', fontSize: 12 }}>▼</button>
                                       </div>
                                       <div style={{ fontSize: 18, color: '#94a3b8' }}>⠿</div>
                                    </div>
                                 )}
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: p.testType === 'READING' ? '#eff6ff' : p.testType === 'WRITING' ? '#f5f3ff' : p.testType === 'LISTENING' ? '#fff7ed' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                       {p.testType === 'READING' ? '📖' : p.testType === 'WRITING' ? '✍️' : p.testType === 'LISTENING' ? '🎧' : '🗣️'}
                                    </div>
                                    <div>
                                       <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 15, marginBottom: 3 }}>{p.testType} {p.paperCode} — {p.title}</div>
                                       <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: 11, color: '#64748b' }}>⏱ {p.timeLimitMin} min</span>
                                          <span style={{ fontSize: 11, color: '#64748b' }}>ID: {p.id}</span>
                                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: p.status === 'ACTIVE' ? '#f0fdf4' : '#fef3c7', color: p.status === 'ACTIVE' ? '#16a34a' : '#d97706', fontWeight: 600 }}>{p.status}</span>
                                          {p.audioUrl && <span style={{ fontSize: 11, color: '#2563eb' }}>🎵 Audio</span>}
                                       </div>
                                    </div>
                                 </div>
                                 <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button className="action-btn outline" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => navigate(`/admin/papers/${p.id}`)}>✏️ Edit</button>
                                    {p.testType === 'LISTENING' && (
                                       <label style={{ padding: '7px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                          🎵 {p.audioUrl ? 'Change Audio' : 'Upload Audio'}
                                          <input type="file" accept=".mp3,.wav,.ogg,.m4a" style={{ display: 'none' }} onChange={async e => {
                                             const file = e.target.files[0];
                                             if (!file) return;
                                             const fd = new FormData();
                                             fd.append('audio', file);
                                             try {
                                                await axios.post(`${API_URL}/api/admin/papers/${p.id}/upload-audio`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } });
                                                setMessage('Audio uploaded successfully!');
                                                fetchAll();
                                             } catch (err) { setMessage('Upload failed: ' + (err.response?.data?.error || err.message)); }
                                          }} />
                                       </label>
                                    )}
                                    <button onClick={() => {
                                       if (window.confirm(`Delete ${p.testType} ${p.paperCode} — ${p.title}?\n\nThis will also delete all student attempts. Cannot be undone.`)) {
                                          axios.delete(`${API_URL}/api/admin/papers/${p.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                                             .then(() => { setMessage('Paper deleted successfully'); fetchAll(); })
                                             .catch(err => setMessage('Delete failed: ' + (err.response?.data?.error || err.message)));
                                       }
                                    }} style={{ padding: '7px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>🗑 Delete</button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* ── RESULTS TAB ── */}
               {activeTab === 'results' && (
                  <div>
                     {/* Filter Bar */}
                     <div className="filter-bar">
                        <input
                           className="filter-input"
                           placeholder="🔍 Search student or paper..."
                           value={filterSearch}
                           onChange={e => setFilterSearch(e.target.value)}
                           style={{ minWidth: 200, flex: 1 }}
                        />
                        <select className="filter-input" value={filterType} onChange={e => setFilterType(e.target.value)}>
                           <option value="ALL">All Types</option>
                           <option value="READING">📖 Reading</option>
                           <option value="WRITING">✍️ Writing</option>
                           <option value="LISTENING">🎧 Listening</option>
                           <option value="SPEAKING">🗣️ Speaking</option>
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                           <span style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>Band:</span>
                           <input className="filter-input" type="number" placeholder="Min" min="1" max="9" step="0.5" value={filterBandMin} onChange={e => setFilterBandMin(e.target.value)} style={{ width: 70 }} />
                           <span style={{ color: '#94a3b8' }}>–</span>
                           <input className="filter-input" type="number" placeholder="Max" min="1" max="9" step="0.5" value={filterBandMax} onChange={e => setFilterBandMax(e.target.value)} style={{ width: 70 }} />
                        </div>
                        {hasActiveFilters && (
                           <button onClick={clearFilters} style={{ padding: '8px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' }}>
                              ✕ Clear Filters
                           </button>
                        )}
                        <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                           {filteredResults.length} of {results.length} results
                        </span>
                     </div>

                     <div className="table-container">
                        <div className="admin-table">
                           <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 80px 100px 80px', gap: '12px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                              {['Student', 'Paper', 'Date', 'Score', 'Band', 'Detail'].map(h => (
                                 <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                              ))}
                           </div>
                           {loading ? (
                              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                           ) : filteredResults.length === 0 ? (
                              <div style={{ padding: '48px', textAlign: 'center' }}>
                                 <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                                 <p style={{ color: '#94a3b8', fontSize: '14px' }}>{hasActiveFilters ? 'No results match your filters.' : 'No results yet.'}</p>
                              </div>
                           ) : filteredResults.map(r => {
                              const band = r.result?.bandEstimate;
                              const bc = getBandColor(band);
                              const typeColors = { READING: { bg: '#eff6ff', color: '#1d4ed8' }, WRITING: { bg: '#f0fdf4', color: '#16a34a' }, LISTENING: { bg: '#faf5ff', color: '#7c3aed' }, SPEAKING: { bg: '#fff7ed', color: '#ea580c' } };
                              const tc = typeColors[r.paper?.testType] || { bg: '#f1f5f9', color: '#475569' };
                              return (
                                 <div key={r.id} className="table-row result-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 80px 100px 80px' }} onClick={() => openDetail(r)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                       <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                          {r.student?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                       </div>
                                       <div>
                                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>{r.student?.name}</div>
                                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.student?.batch || 'General'}</div>
                                       </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                       <span className="tag" style={{ background: tc.bg, color: tc.color }}>{r.paper?.testType}</span>
                                       <span style={{ fontSize: '13px', color: '#1e293b' }}>{r.paper?.paperCode}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                       {r.endedAt ? new Date(r.endedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '—'}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                       {r.result?.rawScore != null ? `${r.result.rawScore}/40` : '—/40'}
                                    </span>
                                    <span style={{ display: 'inline-block', background: bc.bg, color: bc.color, padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                                       {band != null ? band.toFixed(1) : '—'}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600 }}>View →</span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               )}

               {/* ── SETTINGS TAB ── */}
               {activeTab === 'settings' && (
                  <div style={{ padding: '32px' }}>
                     <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '24px' }}>Platform Settings</h3>
                     <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                        <div>
                           <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Site Name</label>
                           <input type="text" className="form-input" value={settings.siteName} onChange={e => setSettings(prev => ({ ...prev, siteName: e.target.value }))} />
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Logo URL</label>
                           <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <input type="text" className="form-input" value={settings.logoUrl} onChange={e => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))} />
                              <img src={settings.logoUrl} alt="Preview" style={{ height: '32px', maxWidth: '100px', objectFit: 'contain', background: '#1a1a2e', padding: '4px', borderRadius: '4px' }} />
                           </div>
                        </div>
                        <button onClick={() => { localStorage.setItem('siteSettings', JSON.stringify(settings)); setMessage('Settings saved successfully!'); setTimeout(() => setMessage(''), 3000); }}
                           style={{ marginTop: '12px', padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                           Save Settings
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* ── ADD STUDENT MODAL ── */}
         {showAddStudent && (
            <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddStudent(false); }}>
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
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>{field.label}</label>
                        <input className="form-input" type={field.type} placeholder={field.placeholder} value={newStudent[field.key]} onChange={e => setNewStudent(prev => ({ ...prev, [field.key]: e.target.value }))} />
                     </div>
                  ))}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                     <button className="action-btn outline" style={{ flex: 1, padding: '12px' }} onClick={() => setShowAddStudent(false)}>Cancel</button>
                     <button className="action-btn primary" style={{ flex: 2, padding: '12px' }} onClick={addStudent} disabled={saving}>{saving ? 'Adding...' : 'Add Student'}</button>
                  </div>
               </div>
            </div>
         )}

         {/* ── SUBMISSION DETAIL MODAL ── */}
         {detailModal && (
            <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDetailModal(null); }}>
               <div className="detail-modal">
                  {detailModal.loading ? (
                     <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
                        <p>Loading submission...</p>
                     </div>
                  ) : detailModal.error ? (
                     <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
                        <p style={{ color: '#dc2626' }}>{detailModal.error}</p>
                        <button onClick={() => setDetailModal(null)} style={{ marginTop: 16, padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Close</button>
                     </div>
                  ) : (
                     <DetailView data={detailModal.data} onClose={() => setDetailModal(null)} getBandColor={getBandColor} />
                  )}
               </div>
            </div>
         )}
      </div>
   );
}

function DetailView({ data, onClose, getBandColor }) {
   const testType = data?.paper?.testType;
   const band = data?.result?.bandEstimate;
   const bc = getBandColor(band);
   const typeEmoji = { READING: '📖', WRITING: '✍️', LISTENING: '🎧', SPEAKING: '🗣️' };

   return (
      <div style={{ padding: '32px' }}>
         {/* Header */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 24 }}>{typeEmoji[testType] || '📄'}</span>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1e293b', margin: 0 }}>
                     {data?.student?.name} — {testType} {data?.paper?.paperCode}
                  </h2>
               </div>
               <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>📧 {data?.student?.email}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>🎓 {data?.student?.batch || 'General'}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>📅 {data?.endedAt ? new Date(data.endedAt).toLocaleString() : '—'}</span>
               </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
               <span style={{ background: bc.bg, color: bc.color, padding: '6px 18px', borderRadius: 20, fontSize: 20, fontWeight: 700 }}>
                  Band {band != null ? band.toFixed(1) : '—'}
               </span>
               {data?.result?.rawScore != null && (
                  <span style={{ fontSize: 13, color: '#64748b' }}>Score: {data.result.rawScore}/40</span>
               )}
               <button onClick={onClose} style={{ marginTop: 4, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
         </div>

         {/* WRITING */}
         {testType === 'WRITING' && data?.writingSubmission && (
            <div>
               <WritingSection sub={data.writingSubmission} />
            </div>
         )}

         {/* READING / LISTENING */}
         {(testType === 'READING' || testType === 'LISTENING') && data?.answers?.length > 0 && (
            <div>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Answer Review</h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                     <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        ✓ {data.answers.filter(a => a.isCorrect).length} Correct
                     </span>
                     <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        ✗ {data.answers.filter(a => !a.isCorrect).length} Wrong
                     </span>
                  </div>
               </div>
               {/* Table header */}
               <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px 32px', gap: 10, padding: '8px 16px', background: '#f8fafc', borderRadius: '8px 8px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none' }}>
                  {['#', 'Question', 'Student Answer', 'Correct Answer', ''].map(h => (
                     <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                  ))}
               </div>
               <div style={{ border: '1px solid #e2e8f0', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                  {[...data.answers].sort((a, b) => (a.question?.questionNumber || 0) - (b.question?.questionNumber || 0)).map((ans, i) => (
                     <div key={i} className="answer-row" style={{ background: ans.isCorrect ? 'white' : '#fff8f8' }}>
                        <span style={{ fontWeight: 700, color: '#64748b', fontSize: 12 }}>{ans.question?.questionNumber || i + 1}</span>
                        <span style={{ color: '#374151', fontSize: 12, lineHeight: 1.4 }}>{ans.question?.content || '—'}</span>
                        <span style={{ color: ans.isCorrect ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: 12 }}>
                           {ans.studentAnswer || '(blank)'}
                        </span>
                        <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 12 }}>{ans.question?.correctAnswer || '—'}</span>
                        <span style={{ fontSize: 16 }}>{ans.isCorrect ? '✅' : '❌'}</span>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* SPEAKING */}
         {testType === 'SPEAKING' && data?.speakingSubmission && (
            <SpeakingSection sub={data.speakingSubmission} />
         )}

         {/* AI Feedback summary if available */}
         {data?.result?.aiFeedbackJson && <AiFeedbackSummary json={data.result.aiFeedbackJson} testType={testType} />}

         <button onClick={onClose} style={{ marginTop: 24, width: '100%', padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14, color: '#475569' }}>
            Close
         </button>
      </div>
   );
}

function WritingSection({ sub }) {
   const [tab, setTab] = useState('task1');
   const task1Words = sub.task1WordCount || sub.task1Response?.split(/\s+/).filter(Boolean).length || 0;
   const task2Words = sub.task2WordCount || sub.task2Response?.split(/\s+/).filter(Boolean).length || 0;

   let feedback = null;
   try { feedback = sub.aiFeedback ? JSON.parse(sub.aiFeedback) : null; } catch { }

   return (
      <div>
         <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['task1', 'task2', 'feedback'].map(t => (
               <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, background: tab === t ? '#4f46e5' : '#f1f5f9', color: tab === t ? 'white' : '#64748b' }}>
                  {t === 'task1' ? `Task 1 (${task1Words}w)` : t === 'task2' ? `Task 2 (${task2Words}w)` : '🤖 AI Feedback'}
               </button>
            ))}
         </div>
         {tab === 'task1' && (
            <div className="writing-block">
               <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Task 1 Response — {task1Words} words</div>
               <p style={{ fontSize: 14, lineHeight: 1.8, color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>{sub.task1Response || '(No response)'}</p>
            </div>
         )}
         {tab === 'task2' && (
            <div className="writing-block">
               <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Task 2 Response — {task2Words} words</div>
               <p style={{ fontSize: 14, lineHeight: 1.8, color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>{sub.task2Response || '(No response)'}</p>
            </div>
         )}
         {tab === 'feedback' && feedback && (
            <div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                     { label: 'Task 1 Band', value: sub.task1Band?.toFixed(1) || feedback.task1Band || '—' },
                     { label: 'Task 2 Band', value: sub.task2Band?.toFixed(1) || feedback.task2Band || '—' },
                     { label: 'Overall Band', value: sub.overallBand?.toFixed(1) || feedback.overallBand || '—' }
                  ].map(s => (
                     <div key={s.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5' }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                     </div>
                  ))}
               </div>
               {feedback.strengths?.length > 0 && (
                  <div className="writing-block" style={{ marginBottom: 12 }}>
                     <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 8 }}>✅ Strengths</div>
                     {feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#374151', margin: '4px 0' }}>• {s}</p>)}
                  </div>
               )}
               {(feedback.improvements || feedback.weakAreas)?.length > 0 && (
                  <div className="writing-block">
                     <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 8 }}>⚠️ Areas to Improve</div>
                     {(feedback.improvements || feedback.weakAreas).map((s, i) => <p key={i} style={{ fontSize: 13, color: '#374151', margin: '4px 0' }}>• {s}</p>)}
                  </div>
               )}
            </div>
         )}
         {tab === 'feedback' && !feedback && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
               <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
               <p>AI feedback is still being generated or not yet available.</p>
               <p style={{ fontSize: 12 }}>Status: {sub.markingStatus}</p>
            </div>
         )}
      </div>
   );
}

function SpeakingSection({ sub }) {
   let feedback = null;
   try { feedback = sub.aiFeedback ? JSON.parse(sub.aiFeedback) : null; } catch { }
   return (
      <div>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
               { label: 'Part 1', value: sub.part1Band?.toFixed(1) || '—' },
               { label: 'Part 2', value: sub.part2Band?.toFixed(1) || '—' },
               { label: 'Part 3', value: sub.part3Band?.toFixed(1) || '—' },
               { label: 'Overall', value: sub.overallBand?.toFixed(1) || '—' }
            ].map(s => (
               <div key={s.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#7c3aed' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
               </div>
            ))}
         </div>
         {['part1', 'part2', 'part3'].map(part => sub[`${part}Transcript`] && (
            <div key={part} className="writing-block" style={{ marginBottom: 12 }}>
               <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: 8 }}>🗣️ {part.replace('part', 'Part ')} Transcript</div>
               <p style={{ fontSize: 13, lineHeight: 1.8, color: '#374151', margin: 0 }}>{sub[`${part}Transcript`]}</p>
            </div>
         ))}
         <p style={{ fontSize: 12, color: '#94a3b8' }}>Status: {sub.markingStatus}</p>
      </div>
   );
}

function AiFeedbackSummary({ json, testType }) {
   let feedback = null;
   try { feedback = JSON.parse(json); } catch { return null; }
   if (!feedback || testType === 'WRITING') return null; // Writing has its own feedback tab

   return (
      <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
         <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>🤖 AI Feedback Summary</h3>
         {feedback.teacherSummary && (
            <div className="writing-block" style={{ marginBottom: 12 }}>
               <p style={{ fontSize: 13, lineHeight: 1.7, color: '#374151', margin: 0 }}>{feedback.teacherSummary}</p>
            </div>
         )}
         {feedback.strengths?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
               <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 6 }}>✅ Strengths</div>
               {feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#374151', margin: '3px 0' }}>• {s}</p>)}
            </div>
         )}
         {feedback.weakAreas?.length > 0 && (
            <div>
               <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 6 }}>⚠️ Weak Areas</div>
               {feedback.weakAreas.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#374151', margin: '3px 0' }}>• {s}</p>)}
            </div>
         )}
      </div>
   );
}
