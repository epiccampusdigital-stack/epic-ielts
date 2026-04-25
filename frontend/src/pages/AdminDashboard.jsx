import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function AdminDashboard() {
   const [activeTab, setActiveTab] = useState('students');
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
   const navigate = useNavigate();
   const user = JSON.parse(localStorage.getItem('user') || '{}');

   useEffect(() => { fetchAll(); }, []);

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
         await axios.post(`${API_URL}/api/admin/papers`, {
            ...newPaper,
            timeLimitMin: parseInt(newPaper.timeLimitMin),
            status: 'ACTIVE'
         }, api());
         setMessage('Paper created successfully!');
         setNewPaper({ paperCode: '', testType: 'READING', title: '', timeLimitMin: 60 });
         setShowAddPaper(false);
         fetchAll();
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .tab-btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #64748b;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .tab-btn:hover { background: #f1f5f9; color: #1e293b; }
        .tab-btn.active { background: #4f46e5; color: #ffffff; font-weight: 600; }
        .action-btn {
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          border: none;
        }
        .action-btn.primary { background: #4f46e5; color: white; }
        .action-btn.primary:hover { background: #4338ca; transform: translateY(-1px); }
        .action-btn.danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .action-btn.danger:hover { background: #fee2e2; }
        .action-btn.outline { background: white; color: #475569; border: 1px solid #e2e8f0; }
        .action-btn.outline:hover { border-color: #4f46e5; color: #4f46e5; }
        .form-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          background: white;
        }
        .form-input:focus { border-color: #4f46e5; }
        .table-row {
          display: grid;
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          align-items: center;
          transition: background 0.15s;
        }
        .table-row:hover { background: #f8fafc; }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justifyContent: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .modal-box {
          background: white;
          border-radius: 20px;
          padding: 36px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          animation: fadeUp 0.3s ease;
        }
      `}</style>

         {/* NAVBAR */}
         <nav style={{
            background: '#1a1a2e',
            padding: '0 40px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
         }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <img src="/logo.png" alt="EPIC" style={{ height: '34px', filter: 'brightness(0) invert(1)' }} />
               <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)' }} />
               <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Admin Panel
               </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: '#f59e0b' }}>Administrator</div>
               </div>
               <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#1a1a2e', fontSize: '14px', fontWeight: '700'
               }}>
                  {user.name?.charAt(0) || 'A'}
               </div>
               <button
                  onClick={() => { localStorage.clear(); navigate('/login'); }}
                  style={{
                     padding: '7px 16px',
                     background: 'rgba(255,255,255,0.08)',
                     color: 'rgba(255,255,255,0.7)',
                     border: '1px solid rgba(255,255,255,0.15)',
                     borderRadius: '8px',
                     fontSize: '13px',
                     cursor: 'pointer',
                     fontFamily: "'Inter', sans-serif",
                     transition: 'all 0.2s'
                  }}
               >Logout</button>
            </div>
         </nav>

         <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 40px' }}>

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
            <div style={{
               display: 'grid',
               gridTemplateColumns: 'repeat(4, 1fr)',
               gap: '16px',
               marginBottom: '32px',
               animation: 'fadeUp 0.4s ease'
            }}>
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
               <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  background: '#fafafa'
               }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                     {[
                        { id: 'students', label: '👨‍🎓 Students', count: students.length },
                        { id: 'papers', label: '📋 Papers', count: papers.length },
                        { id: 'results', label: '📊 Results', count: results.length }
                     ].map(tab => (
                        <button
                           key={tab.id}
                           className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                           onClick={() => setActiveTab(tab.id)}
                        >
                           {tab.label}
                           <span style={{
                              marginLeft: '8px',
                              background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                              color: activeTab === tab.id ? '#ffffff' : '#64748b',
                              borderRadius: '12px',
                              padding: '1px 8px',
                              fontSize: '11px',
                              fontWeight: '700'
                           }}>{tab.count}</span>
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
                           <button className="action-btn outline" onClick={() => navigate('/admin/papers/import')}>
                              ✨ Import Paper (AI)
                           </button>
                           <button className="action-btn primary" onClick={() => setShowAddPaper(true)}>
                              + Create Paper
                           </button>
                        </>
                     )}
                  </div>
               </div>

               {/* STUDENTS TAB */}
               {activeTab === 'students' && (
                  <div>
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
               )}

               {/* PAPERS TAB */}
               {activeTab === 'papers' && (
                  <div>
                     <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr',
                        gap: '12px',
                        padding: '12px 20px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9'
                     }}>
                        {['Code', 'Type', 'Title', 'Status', 'Actions'].map(h => (
                           <span key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                        ))}
                     </div>
                     {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                     ) : papers.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center' }}>
                           <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                           <p style={{ color: '#94a3b8', fontSize: '14px' }}>No papers yet. Create your first paper!</p>
                        </div>
                     ) : papers.map((p, i) => {
                        const tc = getTypeColor(p.testType);
                        return (
                           <div key={p.id} className="table-row" style={{ gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>{p.paperCode}</span>
                              <span style={{
                                 display: 'inline-block',
                                 background: tc.bg, color: tc.color,
                                 padding: '3px 10px', borderRadius: '20px',
                                 fontSize: '12px', fontWeight: '600'
                              }}>{p.testType}</span>
                              <span style={{ fontSize: '13px', color: '#475569' }}>{p.title}</span>
                              <span style={{
                                 display: 'inline-block',
                                 background: p.status === 'ACTIVE' ? '#f0fdf4' : '#f1f5f9',
                                 color: p.status === 'ACTIVE' ? '#16a34a' : '#64748b',
                                 padding: '3px 10px', borderRadius: '20px',
                                 fontSize: '12px', fontWeight: '500'
                              }}>{p.status}</span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                 <button className="action-btn outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate(`/admin/papers/${p.id}`)}>Edit</button>
                                 <button className="action-btn danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}

               {/* RESULTS TAB */}
               {activeTab === 'results' && (
                  <div>
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

      </div>
   );
}