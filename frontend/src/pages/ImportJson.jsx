import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function ImportJson() {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [needsUpload, setNeedsUpload] = useState([]);
  const [paperId, setPaperId] = useState(null);
  const navigate = useNavigate();

  const handleValidate = () => {
    setValidationError('');
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.testType || !['READING', 'LISTENING'].includes(parsed.testType)) {
        setValidationError('Invalid testType. Must be READING or LISTENING.');
        return false;
      }
      return parsed;
    } catch (e) {
      setValidationError('Invalid JSON: ' + e.message);
      return false;
    }
  };

  const handleImport = async () => {
    const parsed = handleValidate();
    if (!parsed) return;

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/admin/papers/import-json`, parsed, auth());
      setSuccess('Paper imported successfully!');
      setPaperId(res.data.paperId);
      setNeedsUpload(res.data.needsUpload || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed. Check server logs.');
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async (file, type) => {
    const fd = new FormData();
    fd.append(type, file);
    try {
      const r = await axios.post(`${API_URL}/api/upload/${type}`, fd, {
        headers: { ...auth().headers, 'Content-Type': 'multipart/form-data' }
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

    // Save to DB
    try {
      // Fetch full paper to avoid overwriting other fields if we used a partial update
      // But for simplicity, let's just use a dedicated update for specific asset
      // Actually, existing admin route handles full paper update.
      // Let's just fetch the paper, update the specific field, and save.
      const paperRes = await axios.get(`${API_URL}/api/admin/papers/${paperId}`, auth());
      const paper = paperRes.data;

      if (item.type === 'audio') {
        const section = paper.sections.find(s => s.number === item.sectionNumber);
        if (section) section.audioUrl = url;
      } else if (item.type === 'image') {
        // Find group by ID in all sections/passages
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

      await axios.put(`${API_URL}/api/admin/papers/${paperId}`, paper, auth());
      
      // Update local state to show uploaded
      setNeedsUpload(prev => prev.map(u => 
        (u.type === item.type && (u.sectionNumber === item.sectionNumber || u.groupId === item.groupId))
        ? { ...u, done: true } : u
      ));

    } catch (err) {
      alert('Failed to save asset URL: ' + err.message);
    }
  };

  const downloadTemplate = (type) => {
    const templates = {
      LISTENING: {
        title: "LISTENING 001",
        code: "001",
        testType: "LISTENING",
        timeMinutes: 30,
        allowReplay: true,
        overallInstructions: "Instructions here...",
        sections: [
          {
            sectionNumber: 1,
            description: "Section description...",
            groups: [
              {
                type: "FORM_COMPLETION",
                instruction: "Complete the form...",
                wordLimit: "ONE WORD AND/OR A NUMBER",
                questions: [
                  { number: 1, content: "Name: ___", correctAnswer: "John", explanation: "He says John." }
                ]
              }
            ]
          }
        ]
      },
      READING: {
        title: "READING 001",
        code: "001",
        testType: "READING",
        timeMinutes: 60,
        overallInstructions: "Instructions here...",
        passages: [
          {
            passageNumber: 1,
            title: "Passage Title",
            content: "Passage text...",
            groups: [
              {
                type: "TRUE_FALSE_NOT_GIVEN",
                instruction: "Agree/Disagree...",
                questions: [
                  { number: 1, content: "Statement...", correctAnswer: "TRUE", explanation: "Passage says X." }
                ]
              }
            ]
          }
        ]
      }
    };
    const blob = new Blob([JSON.stringify(templates[type], null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type.toLowerCase()}.json`;
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '700', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0 }}>📄 JSON Paper Import</h1>
              <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>Paste a JSON object to bulk-create a paper.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => downloadTemplate('READING')} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>Download Reading Template</button>
              <button onClick={() => downloadTemplate('LISTENING')} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>Download Listening Template</button>
            </div>
          </div>

          {!success ? (
            <>
              {(error || validationError) && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '24px', fontSize: '14px' }}>
                  {error || validationError}
                </div>
              )}

              <textarea 
                value={jsonText}
                onChange={e => { setJsonText(e.target.value); setValidationError(''); }}
                placeholder="Paste your JSON here..."
                style={{ 
                  width: '100%', 
                  height: '400px', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '2px solid #e2e8f0', 
                  fontFamily: 'monospace', 
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical',
                  background: '#f8fafc',
                  lineHeight: '1.6'
                }}
              />

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button 
                  onClick={handleValidate}
                  style={{ flex: 1, padding: '14px', background: 'white', color: '#4f46e5', border: '2px solid #4f46e5', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Validate JSON
                </button>
                <button 
                  onClick={handleImport}
                  disabled={loading || !jsonText.trim()}
                  style={{ flex: 2, padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !jsonText.trim()) ? 0.7 : 1 }}
                >
                  {loading ? 'Importing...' : 'Import Paper'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginBottom: '8px' }}>Success!</h2>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>The paper has been created. You now need to upload the required assets.</p>

              {needsUpload.length > 0 && (
                <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', textAlign: 'left', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '16px', textTransform: 'uppercase' }}>Required Assets</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {needsUpload.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: '700' }}>{item.label}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px', textTransform: 'uppercase' }}>{item.type}</span>
                        </div>
                        {item.done ? (
                          <span style={{ color: '#16a34a', fontWeight: '800', fontSize: '12px' }}>✅ UPLOADED</span>
                        ) : (
                          <label style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                            Upload
                            <input type="file" style={{ display: 'none' }} onChange={e => handleUpload(item, e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button 
                  onClick={() => navigate(`/admin/papers/${paperId}`)}
                  style={{ padding: '14px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Go to Paper Editor
                </button>
                <button 
                  onClick={() => { setSuccess(null); setJsonText(''); setNeedsUpload([]); }}
                  style={{ padding: '14px 24px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Import Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
