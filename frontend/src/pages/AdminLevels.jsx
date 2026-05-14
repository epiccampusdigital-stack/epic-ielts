import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const SKILL_FIELDS = [
  { key: 'readingCode',   label: 'Reading',   color: '#1d4ed8', bg: '#eff6ff' },
  { key: 'writingCode',   label: 'Writing',   color: '#16a34a', bg: '#f0fdf4' },
  { key: 'listeningCode', label: 'Listening', color: '#7c3aed', bg: '#faf5ff' },
  { key: 'speakingCode',  label: 'Speaking',  color: '#ea580c', bg: '#fff7ed' },
];

export default function AdminLevels() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/levels/admin`, auth())
      .then(r => { setLevels(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (section) => {
    setEditingId(section.id);
    setEditDraft({
      readingCode:   section.readingCode   || '',
      writingCode:   section.writingCode   || '',
      listeningCode: section.listeningCode || '',
      speakingCode:  section.speakingCode  || '',
    });
  };

  const saveEdit = async (sectionId) => {
    setSaving(true);
    setMsg('');
    try {
      await axios.put(`${API_URL}/api/levels/sections/${sectionId}`, editDraft, auth());
      setMsg('✅ Section updated');
      setEditingId(null);
      load();
    } catch {
      setMsg('❌ Save failed');
    }
    setSaving(false);
  };

  const statusBadge = (paper) => paper
    ? <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>✓ {paper.paperCode}</span>
    : <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Missing</span>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <div style={{ background: '#1e293b', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'white' }}>E</div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>Admin — Levels &amp; Sections</span>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          ← Admin Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', margin: '0 0 4px' }}>Level &amp; Section Manager</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Assign paper codes to each section. Green = paper exists, Red = coming soon.</p>
        </div>

        {msg && (
          <div style={{ background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: msg.startsWith('✅') ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            {msg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
        ) : (
          levels.map(level => (
            <div key={level.id} style={{ background: 'white', borderRadius: 16, marginBottom: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

              {/* Level header */}
              <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4f46e515', border: '2px solid #4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: '#4f46e5' }}>
                  {level.levelNumber}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 15 }}>Level {level.levelNumber} — {level.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Target Band {level.targetBand}</div>
                </div>
              </div>

              {/* Section table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Section</th>
                      {SKILL_FIELDS.map(f => (
                        <th key={f.key} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: f.color, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{f.label}</th>
                      ))}
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {level.sections.map(section => {
                      const isEditing = editingId === section.id;
                      const missing = SKILL_FIELDS.filter(f => !section.papers[f.label.toLowerCase()]).length;
                      return (
                        <tr key={section.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>
                            Section {section.sectionNumber}
                          </td>
                          {SKILL_FIELDS.map(f => {
                            const paper = section.papers[f.label.toLowerCase()];
                            return (
                              <td key={f.key} style={{ padding: '10px 12px', textAlign: 'center' }}>
                                {isEditing ? (
                                  <input
                                    value={editDraft[f.key]}
                                    onChange={e => setEditDraft({ ...editDraft, [f.key]: e.target.value })}
                                    style={{ width: 60, padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit' }}
                                    placeholder="000"
                                  />
                                ) : (
                                  statusBadge(paper)
                                )}
                              </td>
                            );
                          })}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            {section.isComplete
                              ? <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>✓ Complete</span>
                              : <span style={{ background: '#fffbeb', color: '#d97706', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{missing} missing</span>
                            }
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                <button
                                  onClick={() => saveEdit(section.id)}
                                  disabled={saving}
                                  style={{ padding: '5px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                  {saving ? '...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  style={{ padding: '5px 10px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEdit(section)}
                                style={{ padding: '5px 12px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
