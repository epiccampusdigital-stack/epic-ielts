import React, { useEffect, useState, useMemo } from 'react';
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
   // Which admin panel is open: IELTS or General English. Lists below only show that course.
   const [panel, setPanelState] = useState(() => { try { return localStorage.getItem('epicAdminPanel') === 'GENERAL' ? 'GENERAL' : 'IELTS'; } catch { return 'IELTS'; } });
   const [raw, setRaw] = useState({ students: [], papers: [], results: [] });
   const setPanel = v => { setPanelState(v); try { localStorage.setItem('epicAdminPanel', v); } catch { /* storage blocked */ } };
   const isGE = panel === 'GENERAL';
   const [showAddStudent, setShowAddStudent] = useState(false);
   const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', batch: '', isPaid: false });
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
         setRaw({ students: s.data || [], papers: p.data || [], results: r.data || [] });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
   };

   useEffect(() => {
      const trackOf = p => (p?.track === 'GENERAL' || /^GE[-_]/i.test(String(p?.paperCode || '')) ? 'GENERAL' : 'IELTS');
      setPapers(raw.papers.filter(p => trackOf(p) === panel));
      setResults(raw.results.filter(r => trackOf(r.paper) === panel));
      // Students without a chosen course show in both panels
      setStudents(raw.students.filter(st => !st.course || st.course === panel));
   }, [raw, panel]);

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
      if (!newStudent.name || !newStudent.email || !newStudent.password) {
         setMessage('Please fill all required fields');
         return;
      }
      setSaving(true);
      try {
         await axios.post(`${API_URL}/api/admin/students`, newStudent, api());
         setMessage('Student added successfully!');
         setNewStudent({ name: '', email: '', password: '', batch: '', isPaid: false });
         setShowAddStudent(false);
         fetchAll();
      } catch {
         setMessage('Failed to add student. Email may already exist.');
      } finally { setSaving(false); }
   };

   const getBandColor = (band) => {
      if (!band) return { bg: '#e8eef7', color: '#5b6780' };
      if (band >= 7) return { bg: '#f0fdf4', color: '#16a34a' };
      if (band >= 5) return { bg: '#fffbeb', color: '#d97706' };
      return { bg: '#fef2f2', color: '#dc2626' };
   };

   const banded = results.filter(r => r.result?.bandEstimate);
   const avgBand = isGE
      ? (() => {
         const pct = results.map(r => {
            const raw = r.result?.rawScore;
            if (raw == null) return null;
            if (r.paper?.testType === 'WRITING' || r.paper?.testType === 'SPEAKING') return raw;
            const total = r.paper?._count?.questions || r.totalQuestions || r._count?.answers;
            return total ? (raw / total) * 100 : null;
         }).filter(v => v != null);
         return pct.length ? Math.round(pct.reduce((a, b) => a + b, 0) / pct.length) : '—';
      })()
      : banded.length > 0
         ? (banded.reduce((sum, r) => sum + r.result.bandEstimate, 0) / banded.length).toFixed(1)
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
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif", color: '#0f1114' }}>
         <style>{`
            @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .tab-btn { padding: 8px 16px; border-radius: 50px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #5b6780; font-family: Source Sans Pro, sans-serif; transition: all 0.2s; }
            .tab-btn:hover { background: #e8eef7; color: #0f1114; }
            .tab-btn.active { background: #002761; color: #ffffff; font-weight: 600; }
            .action-btn.link { background: none; color: #0056d2; }
            .action-btn { height: 40px; padding: 0 16px; border-radius: 8px; font-size: 14px; letter-spacing: 0.14px; font-weight: 600; cursor: pointer; font-family: Source Sans Pro, sans-serif; transition: all 0.2s; border: none; }
            .action-btn.primary { background: #0056d2; color: white; }
            .action-btn.primary:hover { background: #0048b0; }
            .action-btn.danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            .action-btn.danger:hover { background: #fee2e2; }
            .action-btn.outline { background: white; color: #0f1114; border: 1px solid #0f1114; }
            .action-btn.outline:hover { border-color: #0056d2; color: #0056d2; }
            .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid #dae1ed; border-radius: 8px; font-size: 14px; font-family: Source Sans Pro, sans-serif; color: #0f1114; outline: none; transition: border-color 0.2s; box-sizing: border-box; background: white; }
            .form-input:focus { border-color: #0056d2; }
            .table-row { display: grid; padding: 14px 20px; border-bottom: 1px solid #e8eef7; align-items: center; transition: background 0.15s; }
            .table-row:hover { background: #f7f9fc; }
            .result-row { cursor: pointer; }
            .result-row:hover { background: #f0f4ff !important; }
            .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease; }
            .modal-box { background: white; border-radius: 20px; padding: 36px; width: 100%; max-width: 480px; box-shadow: 0 24px 64px rgba(0,0,0,0.2); animation: fadeUp 0.3s ease; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
            @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; } }
            .admin-nav { background: #fff; border-bottom: 1px solid #dae1ed; padding: 0 16px; min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; position: sticky; top: 0; z-index: 50; }
            @media (min-width: 768px) { .admin-nav { padding: 0 40px; height: 72px; flex-wrap: nowrap; } }
            .admin-container { max-width: 1280px; margin: 0 auto; padding: 20px 16px; }
            @media (min-width: 768px) { .admin-container { padding: 32px 40px; } }
            .table-container { width: 100%; overflow-x: auto; }
            .admin-table { min-width: 700px; }
            .mobile-hide { display: none !important; }
            @media (min-width: 768px) { .mobile-hide { display: block !important; } }
            .tab-bar { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-bottom: 1px solid #dae1ed; background: #fff; }
            @media (min-width: 768px) { .tab-bar { flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 20px; } }
            .filter-bar { display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 20px; background: #f7f9fc; border-bottom: 1px solid #e8eef7; align-items: center; }
            .filter-input { padding: 8px 12px; border: 1.5px solid #dae1ed; border-radius: 8px; font-size: 13px; font-family: Source Sans Pro, sans-serif; color: #0f1114; outline: none; background: white; transition: border-color 0.2s; }
            .filter-input:focus { border-color: #0056d2; }
            .detail-modal { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.25); animation: fadeUp 0.3s ease; }
            .answer-row { display: grid; grid-template-columns: 40px 1fr 120px 120px 32px; gap: 10px; padding: 10px 16px; border-bottom: 1px solid #e8eef7; align-items: start; font-size: 13px; }
            .answer-row:hover { background: #fafafa; }
            .writing-block { background: #f7f9fc; border: 1px solid #dae1ed; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
            .tag { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
         `}</style>

         {/* NAVBAR */}
         <nav className="admin-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
               <img src={settings.logoUrl} alt="" style={{ height: 26, maxWidth: 120, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
               <span style={{ fontSize: 20, fontWeight: 700, color: '#0056d2', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>EPIC Admin</span>
               <div role="tablist" aria-label="Admin panel" style={{ display: 'inline-flex', padding: 3, borderRadius: 50, background: '#e8eef7', gap: 2 }}>
                  {[['IELTS', 'IELTS'], ['GENERAL', 'General English']].map(([k, l]) => (
                     <button key={k} role="tab" aria-selected={panel === k} onClick={() => setPanel(k)}
                        style={{ height: 30, padding: '0 14px', borderRadius: 50, border: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', color: panel === k ? '#fff' : '#0f1114', background: panel === k ? '#002761' : 'transparent' }}>
                        {l}
                     </button>
                  ))}
               </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <button onClick={() => navigate('/admin/program')} className="action-btn outline" style={{ height: 36 }}>Program tracker</button>
               <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }} className="action-btn link">Log out</button>
               <div title={user.name} style={{ width: 32, height: 32, borderRadius: '50%', background: '#002761', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  {user.name?.charAt(0) || 'A'}
               </div>
            </div>
         </nav>

         <div className="admin-container">
            {message && (
               <div style={{ background: message.includes('success') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: message.includes('success') ? '#166534' : '#dc2626' }}>
                  <span>{message.includes('success') ? '✅' : '⚠️'} {message}</span>
                  <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit' }}>×</button>
               </div>
            )}

            <div style={{ marginBottom: 20 }}>
               <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.28px', color: '#0f1114' }}>{isGE ? 'General English' : 'IELTS'} admin</h1>
               <p style={{ margin: '4px 0 0', color: '#5b6780', fontSize: 16 }}>
                  {isGE ? 'Placement tests, weekly quizzes and lesson papers for the General English course. Scores are out of 100.' : 'IELTS papers, students and band results.'} Switch course at the top.
               </p>
            </div>

            {/* STAT CARDS */}
            <div className="stats-grid">
               {[
                  { label: 'Students', value: students.length },
                  { label: 'Active papers', value: papers.filter(p => p.status === 'ACTIVE').length },
                  { label: 'Tests today', value: todayResults },
                  { label: isGE ? 'Average score (out of 100)' : 'Average band', value: avgBand }
               ].map((stat, i) => (
                  <div key={i} style={{ background: '#ffffff', borderRadius: 16, padding: 20, border: '1px solid #dae1ed', display: 'grid', gap: 4 }}>
                     <div style={{ fontSize: 14, color: '#5b6780', fontWeight: 600 }}>{stat.label}</div>
                     <div style={{ fontSize: 32, fontWeight: 600, color: '#0f1114', lineHeight: 1.1, letterSpacing: '-0.3px' }}>{stat.value}</div>
                  </div>
               ))}
            </div>

            {/* Teaching Mode Global Control */}
            <TeachingModeControl />

            {/* TABS CONTAINER */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #dae1ed', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

               {/* Tab bar */}
               <div className="tab-bar">
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                     {[
                        { id: 'students', label: 'Students', count: students.length },
                        { id: 'papers', label: 'Papers', count: papers.length },
                        { id: 'results', label: 'Results', count: results.length },
                        { id: 'feedback', label: 'Feedback', count: null },
                        { id: 'settings', label: 'Settings', count: null },
                        { id: 'levels', label: 'Levels', count: null }
                     ].map(tab => (
                        <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                           {tab.label}
                           {tab.count !== null && (
                              <span style={{ marginLeft: '8px', background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#e8eef7', color: activeTab === tab.id ? '#ffffff' : '#5b6780', borderRadius: '12px', padding: '1px 8px', fontSize: '11px', fontWeight: '700' }}>{tab.count}</span>
                           )}
                        </button>
                     ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     {activeTab === 'students' && <button className="action-btn primary" onClick={() => setShowAddStudent(true)}>Add student</button>}
                     {activeTab === 'papers' && !reorderMode && (
                        <>
                           <button className="action-btn outline" onClick={() => setReorderMode(true)}>Reorder</button>
                           <button className="action-btn outline" onClick={() => navigate('/admin/papers/import')}>Import (AI / JSON)</button>
                           <button className="action-btn primary" onClick={() => navigate('/admin/papers/create')}>Create paper</button>
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
                  <div>
                     {/* Add Student button is in the tab bar already */}

                     {/* FULL ACCESS STUDENTS */}
                     <div style={{ padding: '20px 20px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f1114', margin: 0 }}>Full access</h3>
                           <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                              {students.filter(s => s.isPaid).length}
                           </span>
                        </div>
                     </div>
                     <div className="table-container">
                        <div className="admin-table">
                           <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 120px', gap: '12px', padding: '10px 20px', background: '#f0fdf4', borderBottom: '1px solid #e8eef7' }}>
                              {['Name', 'Email', 'Batch', 'Paid On', 'Access'].map(h => (
                                 <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                              ))}
                           </div>
                           {loading ? (
                              <div style={{ padding: '20px', textAlign: 'center', color: '#8495b0' }}>Loading...</div>
                           ) : students.filter(s => s.isPaid).length === 0 ? (
                              <div style={{ padding: '24px', textAlign: 'center', color: '#8495b0', fontSize: 13 }}>No paid students yet.</div>
                           ) : students.filter(s => s.isPaid).map(s => (
                              <div key={s.id} className="table-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 120px' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                       {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f1114' }}>{s.name}</span>
                                 </div>
                                 <span style={{ fontSize: '12px', color: '#5b6780' }}>{s.email}</span>
                                 <span style={{ fontSize: '12px', color: '#5b6780' }}>{s.batch || 'General'}</span>
                                 <span style={{ fontSize: '11px', color: '#5b6780' }}>{s.paidAt ? new Date(s.paidAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Manual'}</span>
                                 <button onClick={async () => {
                                    if (!window.confirm(`Remove full access from ${s.name}?`)) return;
                                    try {
                                       await axios.put(`${API_URL}/api/admin/students/${s.id}/access`, { isPaid: false }, api());
                                       fetchAll();
                                    } catch { alert('Failed to update access'); }
                                 }} style={{ padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#dc2626', cursor: 'pointer', fontFamily: 'Source Sans Pro,sans-serif' }}>
                                    Revoke
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* FREE TRIAL STUDENTS */}
                     <div style={{ padding: '20px 20px 0', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f1114', margin: 0 }}>Free trial</h3>
                           <span style={{ background: '#fffbeb', color: '#d97706', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                              {students.filter(s => !s.isPaid).length}
                           </span>
                        </div>
                     </div>
                     <div className="table-container">
                        <div className="admin-table">
                           <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 120px', gap: '12px', padding: '10px 20px', background: '#fffbeb', borderBottom: '1px solid #e8eef7' }}>
                              {['Name', 'Email', 'Batch', 'Joined', 'Access'].map(h => (
                                 <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                              ))}
                           </div>
                           {loading ? (
                              <div style={{ padding: '20px', textAlign: 'center', color: '#8495b0' }}>Loading...</div>
                           ) : students.filter(s => !s.isPaid).length === 0 ? (
                              <div style={{ padding: '24px', textAlign: 'center', color: '#8495b0', fontSize: 13 }}>No free trial students.</div>
                           ) : students.filter(s => !s.isPaid).map(s => (
                              <div key={s.id} className="table-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 120px' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                       {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f1114' }}>{s.name}</span>
                                 </div>
                                 <span style={{ fontSize: '12px', color: '#5b6780' }}>{s.email}</span>
                                 <span style={{ fontSize: '12px', color: '#5b6780' }}>{s.batch || 'General'}</span>
                                 <span style={{ fontSize: '11px', color: '#5b6780' }}>Free</span>
                                 <button onClick={async () => {
                                    if (!window.confirm(`Grant full access to ${s.name}?`)) return;
                                    try {
                                       await axios.put(`${API_URL}/api/admin/students/${s.id}/access`, { isPaid: true }, api());
                                       fetchAll();
                                    } catch { alert('Failed to update access'); }
                                 }} style={{ padding: '5px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#16a34a', cursor: 'pointer', fontFamily: 'Source Sans Pro,sans-serif' }}>
                                    Grant Access
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* ── PAPERS TAB ── */}
               {activeTab === 'papers' && (
                  <div style={{ padding: '24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <h2 style={{ fontFamily: 'Source Sans Pro,Arial, sans-serif', fontSize: 22, color: '#002761', margin: 0 }}>Papers ({papers.length})</h2>
                     </div>
                     {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8495b0' }}>Loading...</div>
                     ) : papers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '1px solid #e3eeff' }}>
                           <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                           <h3 style={{ color: '#002761', marginBottom: 8 }}>No papers yet</h3>
                           <p style={{ color: '#5b6780', marginBottom: 20 }}>Import a paper with AI or create one manually</p>
                        </div>
                     ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                           {papers.map((p, i) => (
                              <div key={p.id} draggable={reorderMode} onDragStart={e => handleDragStart(e, i)} onDragOver={e => handleDragOver(e, i)} onDragEnd={handleDragEnd}
                                 style={{ background: 'white', border: draggedItem === i ? '2px dashed #0056d2' : '1px solid #e3eeff', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: reorderMode ? 'move' : 'default', transition: 'all 0.2s' }}>
                                 {reorderMode && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                          <button onClick={e => { e.stopPropagation(); movePaper(i, -1); }} disabled={i === 0} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #e3eeff', borderRadius: 6, cursor: 'pointer', color: '#0056d2', fontSize: 12 }}>▲</button>
                                          <button onClick={e => { e.stopPropagation(); movePaper(i, 1); }} disabled={i === papers.length - 1} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #e3eeff', borderRadius: 6, cursor: 'pointer', color: '#0056d2', fontSize: 12 }}>▼</button>
                                       </div>
                                       <div style={{ fontSize: 18, color: '#8495b0' }}>⠿</div>
                                    </div>
                                 )}
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: p.testType === 'READING' ? '#f0f6ff' : p.testType === 'WRITING' ? '#f0f6ff' : p.testType === 'LISTENING' ? '#fff7ed' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                       {p.testType === 'READING' ? '📖' : p.testType === 'WRITING' ? '✍️' : p.testType === 'LISTENING' ? '🎧' : '🗣️'}
                                    </div>
                                    <div>
                                       <div style={{ fontWeight: 700, color: '#002761', fontSize: 15, marginBottom: 3 }}>{p.testType} {p.paperCode} — {p.title}</div>
                                       <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: p.track === 'GENERAL' ? '#ecfeff' : '#e3eeff', color: p.track === 'GENERAL' ? '#0e7490' : '#0048b0', fontWeight: 600 }}>{p.track === 'GENERAL' ? 'General English' : 'IELTS'}</span>
                                          <span style={{ fontSize: 11, color: '#5b6780' }}>⏱ {p.timeLimitMin} min</span>
                                          <span style={{ fontSize: 11, color: '#5b6780' }}>ID: {p.id}</span>
                                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: p.status === 'ACTIVE' ? '#f0fdf4' : '#fef3c7', color: p.status === 'ACTIVE' ? '#16a34a' : '#d97706', fontWeight: 600 }}>{p.status}</span>
                                          {p.audioUrl && <span style={{ fontSize: 11, color: '#0056d2' }}>🎵 Audio</span>}
                                       </div>
                                    </div>
                                 </div>
                                 <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button className="action-btn outline" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => navigate(`/admin/papers/${p.id}`)}>✏️ Edit</button>
                                    {p.testType === 'LISTENING' && (
                                       <label style={{ padding: '7px 12px', background: '#f0f6ff', border: '1px solid #c9dcfb', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#0056d2', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
                                    }} style={{ padding: '7px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'Source Sans Pro,sans-serif' }}>🗑 Delete</button>
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
                           placeholder="Search student or paper"
                           value={filterSearch}
                           onChange={e => setFilterSearch(e.target.value)}
                           style={{ minWidth: 200, flex: 1 }}
                        />
                        <select className="filter-input" value={filterType} onChange={e => setFilterType(e.target.value)}>
                           <option value="ALL">All Types</option>
                           <option value="READING">Reading</option>
                           <option value="WRITING">Writing</option>
                           <option value="LISTENING">Listening</option>
                           <option value="SPEAKING">Speaking</option>
                        </select>
                        <div style={{ display: isGE ? 'none' : 'flex', alignItems: 'center', gap: 6 }}>
                           <span style={{ fontSize: 12, color: '#5b6780', whiteSpace: 'nowrap' }}>Band:</span>
                           <input className="filter-input" type="number" placeholder="Min" min="1" max="9" step="0.5" value={filterBandMin} onChange={e => setFilterBandMin(e.target.value)} style={{ width: 70 }} />
                           <span style={{ color: '#8495b0' }}>–</span>
                           <input className="filter-input" type="number" placeholder="Max" min="1" max="9" step="0.5" value={filterBandMax} onChange={e => setFilterBandMax(e.target.value)} style={{ width: 70 }} />
                        </div>
                        {hasActiveFilters && (
                           <button onClick={clearFilters} style={{ padding: '8px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'Source Sans Pro,sans-serif', whiteSpace: 'nowrap' }}>
                              ✕ Clear Filters
                           </button>
                        )}
                        <span style={{ fontSize: 12, color: '#8495b0', whiteSpace: 'nowrap' }}>
                           {filteredResults.length} of {results.length} results
                        </span>
                     </div>

                     <div className="table-container">
                        <div className="admin-table">
                           <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 80px 100px 80px', gap: '12px', padding: '12px 20px', background: '#f7f9fc', borderBottom: '1px solid #e8eef7' }}>
                              {['Student', 'Paper', 'Date', 'Score', isGE ? 'Level' : 'Band', 'Detail'].map(h => (
                                 <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#8495b0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                              ))}
                           </div>
                           {loading ? (
                              <div style={{ padding: '40px', textAlign: 'center', color: '#8495b0' }}>Loading...</div>
                           ) : filteredResults.length === 0 ? (
                              <div style={{ padding: '48px', textAlign: 'center' }}>
                                 <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                                 <p style={{ color: '#8495b0', fontSize: '14px' }}>{hasActiveFilters ? 'No results match your filters.' : 'No results yet.'}</p>
                              </div>
                           ) : filteredResults.map(r => {
                              const band = r.result?.bandEstimate;
                              const bc = getBandColor(band);
                              const geTotal = r.paper?._count?.questions;
                              const gePct = r.result?.rawScore == null ? null
                                 : (r.paper?.testType === 'WRITING' || r.paper?.testType === 'SPEAKING') ? Math.round(r.result.rawScore)
                                 : geTotal ? Math.round((r.result.rawScore / geTotal) * 100) : null;
                              const geLevel = gePct == null ? '—' : gePct >= 90 ? 'B2' : gePct >= 75 ? 'B1' : gePct >= 50 ? 'A2' : gePct >= 25 ? 'A1' : 'Pre-A1';
                              const typeColors = { READING: { bg: '#f0f6ff', color: '#0048b0' }, WRITING: { bg: '#f0fdf4', color: '#16a34a' }, LISTENING: { bg: '#f0f6ff', color: '#003b8f' }, SPEAKING: { bg: '#fff7ed', color: '#ea580c' } };
                              const tc = typeColors[r.paper?.testType] || { bg: '#e8eef7', color: '#5b6780' };
                              return (
                                 <div key={r.id} className="table-row result-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 80px 100px 80px' }} onClick={() => openDetail(r)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                       <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #0056d2, #003b8f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                          {r.student?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                       </div>
                                       <div>
                                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f1114' }}>{r.student?.name}</div>
                                          <div style={{ fontSize: '11px', color: '#8495b0' }}>{r.student?.batch || 'General'}</div>
                                       </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                       <span className="tag" style={{ background: tc.bg, color: tc.color }}>{r.paper?.testType}</span>
                                       <span style={{ fontSize: '13px', color: '#0f1114' }}>{r.paper?.paperCode}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#5b6780' }}>
                                       {r.endedAt ? new Date(r.endedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '—'}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f1114' }}>
                                       {isGE ? (gePct != null ? `${gePct}/100` : '—') : r.result?.rawScore != null ? `${r.result.rawScore}/40` : '—/40'}
                                    </span>
                                    <span style={{ display: 'inline-block', background: bc.bg, color: bc.color, padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                                       {isGE ? geLevel : band != null ? band.toFixed(1) : '—'}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#0056d2', fontWeight: 600 }}>View →</span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'feedback' && (
                 <FeedbackTab />
               )}

               {/* ── LEVELS TAB ── */}
               {activeTab === 'levels' && (
                  <div style={{ padding: '32px', textAlign: 'center' }}>
                     <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                     <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f1114', marginBottom: 8 }}>Level &amp; Section Manager</h3>
                     <p style={{ color: '#5b6780', fontSize: 14, marginBottom: 24 }}>Manage which papers appear in each level and section. Assign paper codes and track what's available.</p>
                     <button
                        onClick={() => { window.location.href = '/admin/levels'; }}
                        style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#0056d2,#003b8f)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                        Open Level Manager →
                     </button>
                  </div>
               )}

               {/* ── SETTINGS TAB ── */}
               {activeTab === 'settings' && (
                  <div style={{ padding: '32px' }}>
                     <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f1114', marginBottom: '24px' }}>Platform Settings</h3>
                     <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                        <div>
                           <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#5b6780', marginBottom: '8px', textTransform: 'uppercase' }}>Site Name</label>
                           <input type="text" className="form-input" value={settings.siteName} onChange={e => setSettings(prev => ({ ...prev, siteName: e.target.value }))} />
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#5b6780', marginBottom: '8px', textTransform: 'uppercase' }}>Logo URL</label>
                           <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <input type="text" className="form-input" value={settings.logoUrl} onChange={e => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))} />
                              <img src={settings.logoUrl} alt="Preview" style={{ height: '32px', maxWidth: '100px', objectFit: 'contain', background: '#002761', padding: '4px', borderRadius: '4px' }} />
                           </div>
                        </div>
                        <button onClick={() => { localStorage.setItem('siteSettings', JSON.stringify(settings)); setMessage('Settings saved successfully!'); setTimeout(() => setMessage(''), 3000); }}
                           style={{ marginTop: '12px', padding: '12px 24px', background: '#0056d2', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                           Save Settings
                        </button>
                        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #dae1ed' }}>
                           <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f1114', marginBottom: 8 }}>Grant Full Access to Specific Student</h3>
                           <p style={{ fontSize: 12, color: '#5b6780', marginBottom: 16 }}>Enter a student email to manually grant full access to all papers.</p>
                           <GrantAccessTool apiUrl={API_URL} api={api} setMessage={setMessage} />
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* ── ADD STUDENT MODAL ── */}
         {showAddStudent && (
            <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddStudent(false); }}>
               <div className="modal-box">
                  <h2 style={{ fontFamily: "Source Sans Pro, Arial, sans-serif", fontSize: '22px', color: '#0f1114', marginBottom: '6px' }}>Add New Student</h2>
                  <p style={{ fontSize: '13px', color: '#8495b0', marginBottom: '24px' }}>Fill in the details to create a student account</p>
                  {[
                     { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'e.g. Aarav Silva' },
                     { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'e.g. aarav@epiccampus.com' },
                     { label: 'Password *', key: 'password', type: 'password', placeholder: 'Minimum 6 characters' },
                     { label: 'Batch / Class', key: 'batch', type: 'text', placeholder: 'e.g. BATCH-A or GENERAL' }
                  ].map(field => (
                     <div key={field.key} style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1e2229', marginBottom: '6px' }}>{field.label}</label>
                        <input className="form-input" type={field.type} placeholder={field.placeholder} value={newStudent[field.key]} onChange={e => setNewStudent(prev => ({ ...prev, [field.key]: e.target.value }))} />
                     </div>
                  ))}
                  <div style={{ marginBottom: '16px', padding: '14px', background: '#f7f9fc', borderRadius: '10px', border: '1px solid #dae1ed' }}>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={newStudent.isPaid} onChange={e => setNewStudent(prev => ({ ...prev, isPaid: e.target.checked }))}
                           style={{ width: 18, height: 18, accentColor: '#16a34a', cursor: 'pointer' }} />
                        <div>
                           <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f1114' }}>💎 Grant Full Access</div>
                           <div style={{ fontSize: '11px', color: '#5b6780' }}>Student can access all papers immediately</div>
                        </div>
                     </label>
                  </div>
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
                     <div style={{ padding: '60px', textAlign: 'center', color: '#8495b0' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
                        <p>Loading submission...</p>
                     </div>
                  ) : detailModal.error ? (
                     <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
                        <p style={{ color: '#dc2626' }}>{detailModal.error}</p>
                        <button onClick={() => setDetailModal(null)} style={{ marginTop: 16, padding: '10px 20px', background: '#e8eef7', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Close</button>
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

function TeachingModeControl() {
   const [globalPaused, setGlobalPaused] = useState(false);
   const [busy, setBusy] = useState(false);
   const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

   const toggle = async () => {
      setBusy(true);
      try {
         const res = await axios.post(
            `${API_URL}/api/attempts/admin/teaching-mode-all`,
            { paused: !globalPaused },
            api()
         );
         setGlobalPaused(res.data.paused);
      } catch (e) {
         alert('Failed to toggle teaching mode');
      }
      setBusy(false);
   };

   return (
      <div style={{
         background: globalPaused
            ? 'linear-gradient(135deg, #fffbeb, #fef3c7)'
            : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
         border: `2px solid ${globalPaused ? '#f59e0b' : '#10b981'}`,
         borderRadius: 16,
         padding: '20px 24px',
         marginBottom: 24,
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'space-between',
         flexWrap: 'wrap',
         gap: 16
      }}>
         <div>
            <div style={{
               fontWeight: 700,
               fontSize: 15,
               color: globalPaused ? '#92400e' : '#166534',
               marginBottom: 4
            }}>
               {globalPaused ? '📖 Teaching Mode is ON — All student timers paused' : '⏱ Exam Mode — All student timers running'}
            </div>
            <div style={{
               fontSize: 12,
               color: globalPaused ? '#b45309' : '#15803d'
            }}>
               {globalPaused
                  ? 'Students see a "Timer Paused" banner. They can still read and type answers.'
                  : 'Students are in exam mode. Click to pause all timers for a teaching moment.'}
            </div>
         </div>
         <button
            onClick={toggle}
            disabled={busy}
            style={{
               padding: '12px 28px',
               background: globalPaused ? '#f59e0b' : '#002761',
               color: globalPaused ? '#0f1114' : '#ffffff',
               border: 'none',
               borderRadius: 10,
               fontWeight: 700,
               fontSize: 13,
               cursor: busy ? 'not-allowed' : 'pointer',
               fontFamily: 'Source Sans Pro, sans-serif',
               opacity: busy ? 0.7 : 1,
               transition: 'all 0.2s',
               whiteSpace: 'nowrap'
            }}
         >
            {busy ? 'Updating...' : globalPaused ? '▶ Resume All Timers' : '⏸ Pause All Timers'}
         </button>
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
                  <h2 style={{ fontFamily: "Source Sans Pro, Arial, sans-serif", fontSize: 20, color: '#0f1114', margin: 0 }}>
                     {data?.student?.name} — {testType} {data?.paper?.paperCode}
                  </h2>
               </div>
               <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#5b6780' }}>📧 {data?.student?.email}</span>
                  <span style={{ fontSize: 12, color: '#5b6780' }}>🎓 {data?.student?.batch || 'General'}</span>
                  <span style={{ fontSize: 12, color: '#5b6780' }}>📅 {data?.endedAt ? new Date(data.endedAt).toLocaleString() : '—'}</span>
               </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
               <span style={{ background: bc.bg, color: bc.color, padding: '6px 18px', borderRadius: 20, fontSize: 20, fontWeight: 700 }}>
                  Band {band != null ? band.toFixed(1) : '—'}
               </span>
               {data?.result?.rawScore != null && (
                  <span style={{ fontSize: 13, color: '#5b6780' }}>Score: {data.result.rawScore}/40</span>
               )}
               <button onClick={onClose} style={{ marginTop: 4, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#8495b0' }}>✕</button>
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
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f1114', margin: 0 }}>Answer Review</h3>
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
               <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px 32px', gap: 10, padding: '8px 16px', background: '#f7f9fc', borderRadius: '8px 8px 0 0', border: '1px solid #dae1ed', borderBottom: 'none' }}>
                  {['#', 'Question', 'Student Answer', 'Correct Answer', ''].map(h => (
                     <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#8495b0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                  ))}
               </div>
               <div style={{ border: '1px solid #dae1ed', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                  {[...data.answers].sort((a, b) => (a.question?.questionNumber || 0) - (b.question?.questionNumber || 0)).map((ans, i) => (
                     <div key={i} className="answer-row" style={{ background: ans.isCorrect ? 'white' : '#fff8f8' }}>
                        <span style={{ fontWeight: 700, color: '#5b6780', fontSize: 12 }}>{ans.question?.questionNumber || i + 1}</span>
                        <span style={{ color: '#1e2229', fontSize: 12, lineHeight: 1.4 }}>{ans.question?.content || '—'}</span>
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

         <button onClick={onClose} style={{ marginTop: 24, width: '100%', padding: '12px', background: '#e8eef7', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14, color: '#5b6780' }}>
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
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Source Sans Pro,sans-serif', fontSize: 13, fontWeight: 600, background: tab === t ? '#0056d2' : '#e8eef7', color: tab === t ? 'white' : '#5b6780' }}>
                  {t === 'task1' ? `Task 1 (${task1Words}w)` : t === 'task2' ? `Task 2 (${task2Words}w)` : '🤖 AI Feedback'}
               </button>
            ))}
         </div>
         {tab === 'task1' && (
            <div className="writing-block">
               <div style={{ fontSize: 11, fontWeight: 700, color: '#8495b0', textTransform: 'uppercase', marginBottom: 10 }}>Task 1 Response — {task1Words} words</div>
               <p style={{ fontSize: 14, lineHeight: 1.8, color: '#1e2229', margin: 0, whiteSpace: 'pre-wrap' }}>{sub.task1Response || '(No response)'}</p>
            </div>
         )}
         {tab === 'task2' && (
            <div className="writing-block">
               <div style={{ fontSize: 11, fontWeight: 700, color: '#8495b0', textTransform: 'uppercase', marginBottom: 10 }}>Task 2 Response — {task2Words} words</div>
               <p style={{ fontSize: 14, lineHeight: 1.8, color: '#1e2229', margin: 0, whiteSpace: 'pre-wrap' }}>{sub.task2Response || '(No response)'}</p>
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
                     <div key={s.label} style={{ background: '#f7f9fc', border: '1px solid #dae1ed', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#0056d2' }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: '#8495b0', marginTop: 4 }}>{s.label}</div>
                     </div>
                  ))}
               </div>
               {feedback.strengths?.length > 0 && (
                  <div className="writing-block" style={{ marginBottom: 12 }}>
                     <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 8 }}>✅ Strengths</div>
                     {feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#1e2229', margin: '4px 0' }}>• {s}</p>)}
                  </div>
               )}
               {(feedback.improvements || feedback.weakAreas)?.length > 0 && (
                  <div className="writing-block">
                     <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 8 }}>⚠️ Areas to Improve</div>
                     {(feedback.improvements || feedback.weakAreas).map((s, i) => <p key={i} style={{ fontSize: 13, color: '#1e2229', margin: '4px 0' }}>• {s}</p>)}
                  </div>
               )}
            </div>
         )}
         {tab === 'feedback' && !feedback && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8495b0' }}>
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
               <div key={s.label} style={{ background: '#f7f9fc', border: '1px solid #dae1ed', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#003b8f' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#8495b0', marginTop: 4 }}>{s.label}</div>
               </div>
            ))}
         </div>
         {['part1', 'part2', 'part3'].map(part => sub[`${part}Transcript`] && (
            <div key={part} className="writing-block" style={{ marginBottom: 12 }}>
               <div style={{ fontSize: 11, fontWeight: 700, color: '#003b8f', textTransform: 'uppercase', marginBottom: 8 }}>🗣️ {part.replace('part', 'Part ')} Transcript</div>
               <p style={{ fontSize: 13, lineHeight: 1.8, color: '#1e2229', margin: 0 }}>{sub[`${part}Transcript`]}</p>
            </div>
         ))}
         <p style={{ fontSize: 12, color: '#8495b0' }}>Status: {sub.markingStatus}</p>
      </div>
   );
}

function AiFeedbackSummary({ json, testType }) {
   let feedback = null;
   try { feedback = JSON.parse(json); } catch { return null; }
   if (!feedback || testType === 'WRITING') return null; // Writing has its own feedback tab

   return (
      <div style={{ marginTop: 20, borderTop: '1px solid #e8eef7', paddingTop: 20 }}>
         <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f1114', marginBottom: 12 }}>🤖 AI Feedback Summary</h3>
         {feedback.teacherSummary && (
            <div className="writing-block" style={{ marginBottom: 12 }}>
               <p style={{ fontSize: 13, lineHeight: 1.7, color: '#1e2229', margin: 0 }}>{feedback.teacherSummary}</p>
            </div>
         )}
         {feedback.strengths?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
               <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 6 }}>✅ Strengths</div>
               {feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#1e2229', margin: '3px 0' }}>• {s}</p>)}
            </div>
         )}
         {feedback.weakAreas?.length > 0 && (
            <div>
               <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 6 }}>⚠️ Weak Areas</div>
               {feedback.weakAreas.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#1e2229', margin: '3px 0' }}>• {s}</p>)}
            </div>
         )}
      </div>
   );
}

function FeedbackTab() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  useEffect(() => {
    fetch(`${API_URL}/api/feedback/admin/all`, api())
      .then(r => r.json())
      .then(data => { setFeedbacks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/api/feedback/admin/${id}`, {
      method: 'PUT',
      headers: { ...api().headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setFeedbacks(f => f.map(fb => fb.id === id ? { ...fb, status } : fb));
    if (selected?.id === id) setSelected(s => ({ ...s, status }));
  };

  const typeColors = { FEEDBACK: '#0056d2', BUG: '#dc2626', QUESTION: '#d97706', OTHER: '#5b6780' };
  const statusColors = { OPEN: '#d97706', IN_PROGRESS: '#0056d2', RESOLVED: '#16a34a' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#8495b0' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: 600 }}>
      <div style={{ width: 340, borderRight: '1px solid #e8eef7', overflowY: 'auto', flexShrink: 0 }}>
        {feedbacks.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8495b0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <p>No feedback yet.</p>
          </div>
        ) : feedbacks.map(fb => (
          <div key={fb.id} onClick={() => setSelected(fb)}
            style={{ padding: '16px 20px', borderBottom: '1px solid #e8eef7', cursor: 'pointer', background: selected?.id === fb.id ? '#f0f6ff' : 'white', transition: 'background 0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: typeColors[fb.type] || '#5b6780', background: '#f7f9fc', padding: '2px 8px', borderRadius: 20 }}>{fb.type}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColors[fb.status] || '#5b6780' }}>{fb.status}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1114', marginBottom: 4 }}>{fb.subject || '(No subject)'}</div>
            <div style={{ fontSize: 12, color: '#5b6780', marginBottom: 4 }}>{fb.student?.name} · {fb.student?.batch}</div>
            <div style={{ fontSize: 12, color: '#8495b0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fb.message}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
        {!selected ? (
          <div style={{ textAlign: 'center', color: '#8495b0', paddingTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <p>Select a message to view</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f1114', marginBottom: 4 }}>{selected.subject || '(No subject)'}</h3>
                <div style={{ fontSize: 13, color: '#5b6780' }}>{selected.student?.name} · {selected.student?.email} · {selected.student?.batch}</div>
                <div style={{ fontSize: 11, color: '#8495b0', marginTop: 4 }}>{new Date(selected.createdAt).toLocaleString()}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: typeColors[selected.type], background: '#f7f9fc', padding: '4px 12px', borderRadius: 20, border: '1px solid #dae1ed' }}>{selected.type}</span>
            </div>
            <div style={{ background: '#f7f9fc', borderRadius: 12, padding: 20, marginBottom: 20, fontSize: 14, lineHeight: 1.8, color: '#1e2229', whiteSpace: 'pre-wrap', border: '1px solid #dae1ed' }}>
              {selected.message}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${selected.status === s ? statusColors[s] : '#dae1ed'}`, background: selected.status === s ? statusColors[s] : 'white', color: selected.status === s ? 'white' : '#5b6780', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'Source Sans Pro, sans-serif' }}>
                  {s === 'OPEN' ? '🔴 Open' : s === 'IN_PROGRESS' ? '🔵 In Progress' : '✅ Resolved'}
                </button>
              ))}
              <a href={`mailto:${selected.student?.email}?subject=Re: ${selected.subject || 'Your feedback'}`}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #c9dcfb', background: '#f0f6ff', color: '#0048b0', fontWeight: 600, fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                📧 Reply via Email
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GrantAccessTool({ apiUrl, api, setMessage }) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleGrant = async () => {
    if (!email.trim()) { alert('Please enter an email address'); return; }
    if (!window.confirm(`Grant full access to ${email}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/grant-access/${encodeURIComponent(email.trim().toLowerCase())}`, {
        method: 'POST',
        headers: api().headers
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Full access granted to ${data.name} (${data.email})`);
        setEmail('');
      } else {
        setMessage('Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, maxWidth: 500 }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="student@email.com"
        style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #dae1ed', borderRadius: 8, fontSize: 14, fontFamily: 'Source Sans Pro,sans-serif', outline: 'none' }}
        onKeyDown={e => e.key === 'Enter' && handleGrant()}
      />
      <button onClick={handleGrant} disabled={loading}
        style={{ padding: '10px 20px', background: loading ? '#8495b0' : '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Source Sans Pro,sans-serif', whiteSpace: 'nowrap' }}>
        {loading ? '...' : '💎 Grant Access'}
      </button>
    </div>
  );
}
