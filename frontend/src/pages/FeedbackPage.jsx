import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('FEEDBACK');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) { setError('Please write a message.'); return; }
    setSending(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/feedback`, { subject, message, type }, api());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif', padding: '40px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button onClick={() => navigate('/student/dashboard')}
          style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          ← Back to Dashboard
        </button>
        <div style={{ background: 'white', borderRadius: 20, padding: 40, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1e293b', marginBottom: 12 }}>Message Sent!</h2>
              <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Your message has been sent to the EPIC IELTS team. We will get back to you soon.</p>
              <button onClick={() => navigate('/student/dashboard')}
                style={{ padding: '12px 28px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#1e293b', marginBottom: 8 }}>💬 Feedback & Support</h1>
                <p style={{ color: '#64748b', fontSize: 14 }}>Send us a message — bug reports, feedback, or anything you need help with.</p>
              </div>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                  {error}
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { value: 'FEEDBACK', label: '💡 Feedback', color: '#4f46e5' },
                    { value: 'BUG', label: '🐛 Bug Report', color: '#dc2626' },
                    { value: 'QUESTION', label: '❓ Question', color: '#d97706' },
                    { value: 'OTHER', label: '📩 Other', color: '#64748b' }
                  ].map(t => (
                    <button key={t.value} onClick={() => setType(t.value)}
                      style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${type === t.value ? t.color : '#e2e8f0'}`, background: type === t.value ? t.color : 'white', color: type === t.value ? 'white' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Brief subject..."
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Message *</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your feedback or issue in detail..."
                  rows={6}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }} />
              </div>
              <button onClick={handleSubmit} disabled={sending}
                style={{ width: '100%', padding: '14px', background: sending ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {sending ? '⏳ Sending...' : '📨 Send Message'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
