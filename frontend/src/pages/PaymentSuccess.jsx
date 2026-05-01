import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function PaymentSuccess() {
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/payments/verify?session_id=${sessionId}`,
          api()
        );
        if (res.data.isPaid) {
          // Update localStorage so the app reflects paid status immediately
          try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.isPaid = true;
            localStorage.setItem('user', JSON.stringify(user));
          } catch {}
          setStatus('success');
          setTimeout(() => navigate('/student/dashboard'), 3000);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [sessionId]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { 0% { transform: scale(0.7); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: status === 'success' ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : status === 'error' ? '#fef2f2' : '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '48px 40px',
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          animation: 'fadeUp 0.4s ease'
        }}>

          {status === 'verifying' && (
            <>
              <div style={{
                width: 56, height: 56,
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 24px'
              }} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#1e293b', marginBottom: 10 }}>
                Verifying your payment…
              </h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Please wait while we confirm your purchase.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ fontSize: 64, animation: 'pop 0.5s ease', marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#15803d', marginBottom: 12 }}>
                Payment Successful!
              </h2>
              <p style={{ color: '#374151', fontSize: 15, marginBottom: 8, lineHeight: 1.6 }}>
                You now have <strong>full lifetime access</strong> to all EPIC IELTS practice tests and AI feedback.
              </p>
              <p style={{ color: '#64748b', fontSize: 13 }}>Redirecting to your dashboard in 3 seconds…</p>
              <div style={{ marginTop: 24, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px' }}>
                {[
                  '📖 All Reading Practice Tests',
                  '✍️ All Writing Practice Tests',
                  '🎧 All Listening Practice Tests',
                  '🎤 All Speaking Practice Tests',
                  '📊 Full Band Score Dashboard',
                  '🤖 AI Examiner Feedback'
                ].map(item => (
                  <div key={item} style={{ fontSize: 13, color: '#15803d', padding: '4px 0', textAlign: 'left' }}>
                    ✓ {item}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/student/dashboard')}
                style={{
                  marginTop: 24, width: '100%', padding: '13px',
                  background: '#15803d', color: 'white', border: 'none',
                  borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}
              >
                Go to Dashboard →
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#dc2626', marginBottom: 12 }}>
                Verification Failed
              </h2>
              <p style={{ color: '#374151', fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
                We couldn't confirm your payment. If you were charged, please contact us and we'll sort it out immediately.
              </p>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>
                Your free access is still available.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => navigate('/upgrade')}
                  style={{
                    flex: 1, padding: '12px', background: '#1e3a5f', color: 'white',
                    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/student/dashboard')}
                  style={{
                    flex: 1, padding: '12px', background: '#f1f5f9', color: '#374151',
                    border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Dashboard
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
