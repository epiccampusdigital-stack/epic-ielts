import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const features = [
  { icon: '📖', label: 'All Reading Practice Tests' },
  { icon: '✍️', label: 'All Writing Practice Tests' },
  { icon: '🎧', label: 'All Listening Practice Tests' },
  { icon: '🎤', label: 'All Speaking Practice Tests' },
  { icon: '📊', label: 'Full Band Score Dashboard' },
  { icon: '🤖', label: 'AI Examiner Feedback' }
];

export default function UpgradePrompt() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/payments/create-checkout`, {}, api());
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .feature-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; background: rgba(255,255,255,0.07); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px; animation: fadeUp 0.4s ease both; }
        .upgrade-btn { width: 100%; padding: 16px; background: #f59e0b; color: #1a1a2e; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; letter-spacing: -0.2px; }
        .upgrade-btn:hover:not(:disabled) { background: #d97706; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.4); }
        .upgrade-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '24px 16px 48px'
      }}>

        {/* Header card */}
        <div style={{
          width: '100%',
          maxWidth: 560,
          background: 'linear-gradient(160deg, #0f2044 0%, #1e3a5f 55%, #1d4ed8 100%)',
          borderRadius: '20px 20px 0 0',
          padding: '48px 36px 40px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -100, right: -80, pointerEvents: 'none' }} />

          <div style={{ fontSize: 52, marginBottom: 12 }}>🔓</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 700,
            color: '#ffffff', marginBottom: 10
          }}>
            Unlock Full Access
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>
            One-time payment · Lifetime access · All 4 skills
          </p>

          {/* Price display */}
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)',
            borderRadius: 14, padding: '14px 28px', marginBottom: 24
          }}>
            <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>One-time price</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: '#fbbf24', lineHeight: 1 }}>LKR 10,000</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>No recurring charges ever</span>
          </div>

          {/* Feature checklist */}
          <div style={{ textAlign: 'left' }}>
            {features.map((f, i) => (
              <div key={f.label} className="feature-item" style={{ animationDelay: `${i * 0.07}s` }}>
                <span style={{ fontSize: 18, minWidth: 22 }}>{f.icon}</span>
                <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>✓ {f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <div style={{
          width: '100%',
          maxWidth: 560,
          background: '#ffffff',
          borderRadius: '0 0 20px 20px',
          padding: '32px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span>⚠️</span>
              <span style={{ color: '#dc2626', fontSize: 13 }}>{error}</span>
            </div>
          )}

          <button className="upgrade-btn" onClick={handleUpgrade} disabled={loading}>
            {loading ? (
              <>
                <div style={{ width: 20, height: 20, border: '2.5px solid rgba(0,0,0,0.2)', borderTop: '2.5px solid #1a1a2e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Redirecting to checkout…
              </>
            ) : (
              '🔓 Pay LKR 10,000 — Unlock Everything'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span
              onClick={() => navigate('/student/dashboard')}
              style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Back to Dashboard
            </span>
          </div>

          <div style={{
            marginTop: 24, padding: '12px 16px',
            background: '#f8fafc', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Secure payment via Stripe</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Your card details are never stored on our servers. Powered by Stripe.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
