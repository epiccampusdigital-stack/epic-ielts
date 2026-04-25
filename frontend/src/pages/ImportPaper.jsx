import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export default function ImportPaper() {
  const [rawText, setRawText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setExtracting(true);
    setExtractedData(null);

    try {
      const res = await axios.post(`${API_URL}/api/admin/papers/extract`, { rawText }, api());
      setExtractedData(res.data);
    } catch (err) {
      console.error('Extraction error:', err);
      alert('Failed to extract paper data. Please check the text format.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;
    setSaving(true);

    try {
      // 1. Create Paper
      const paperRes = await axios.post(`${API_URL}/api/admin/papers`, {
        title: extractedData.title || 'Extracted Paper',
        testType: extractedData.testType || 'READING',
        paperCode: `SMART-${Date.now().toString().slice(-6)}`,
        timeLimitMin: extractedData.timeLimitMin || 60,
        instructions: extractedData.passages?.map(p => `PASSAGE ${p.passageNumber}: ${p.title}\n${p.text}`).join('\n\n') || ''
      }, api());

      const paperId = paperRes.data.id;

      // 2. Create Questions
      const questions = extractedData.questions || [];
      for (const q of questions) {
        await axios.post(`${API_URL}/api/admin/papers/${paperId}/questions`, {
          passageNumber: q.passageNumber || 1,
          questionNumber: q.questionNumber,
          questionType: q.questionType || 'MC',
          content: q.content,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || ''
        }, api());
      }

      alert('Paper imported successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save paper. Please check the data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '8px' }}>Smart Paper Import</h1>
        <p style={{ color: '#64748b' }}>Paste raw IELTS paper text or PDF content to automatically generate a digital exam.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>1. Paste Raw Source</h3>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your paper content here (including passages, questions, and answer key)..."
            style={{
              width: '100%',
              height: '500px',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.6',
              outline: 'none',
              resize: 'none'
            }}
          />
          <button
            onClick={handleExtract}
            disabled={extracting || !rawText.trim()}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '14px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: extracting ? 0.7 : 1
            }}
          >
            {extracting ? 'AI is extracting data...' : '✨ Extract Questions with AI'}
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>2. AI Extraction Preview</h3>
          <div style={{
            height: '500px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            overflowY: 'auto'
          }}>
            {!extractedData && !extracting && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
                Extracted data will appear here.<br />Click the extract button to begin.
              </div>
            )}

            {extracting && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px', color: '#64748b' }}>Claude is parsing the paper structure...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {extractedData && (
              <div>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '18px' }}>{extractedData.title}</h4>
                  <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>{extractedData.testType} • {extractedData.timeLimitMin} MIN</span>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {extractedData.questions?.map((q, i) => (
                    <div key={i} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '14px' }}>Q{q.questionNumber}</strong>
                        <span style={{ fontSize: '11px', background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px' }}>{q.questionType}</span>
                      </div>
                      <p style={{ fontSize: '13px', margin: '0 0 8px', color: '#334155' }}>{q.content}</p>
                      {q.options && (
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'grid', gap: '4px', marginBottom: '8px' }}>
                          {q.options.map((opt, j) => <div key={j}>• {opt}</div>)}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Ans: {q.correctAnswer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !extractedData}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '14px',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving to database...' : '💾 Confirm & Save All'}
          </button>
        </div>
      </div>
    </div>
  );
}
