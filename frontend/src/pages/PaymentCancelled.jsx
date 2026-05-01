import { useNavigate } from 'react-router-dom';

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
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
          <div style={{ fontSize: 60, marginBottom: 20 }}>😕</div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28, fontWeight: 700,
            color: '#1e3a5f', marginBottom: 12
          }}>
            Payment Cancelled
          </h2>

          <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
            No worries — <strong>you weren't charged.</strong>
          </p>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
            Your free access is still available. You can unlock all exams whenever you're ready.
          </p>

          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 12, padding: '14px 16px', marginBottom: 28,
            fontSize: 13, color: '#475569', lineHeight: 1.6
          }}>
            🎁 <strong>Reminder:</strong> Full access is a <strong>one-time payment of LKR 10,000</strong> — lifetime access to all 4 skills, all papers, and AI feedback.
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/upgrade')}
              style={{
                flex: 1, padding: '13px',
                background: '#1e3a5f', color: 'white',
                border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.target.style.background = '#2563eb'}
              onMouseLeave={e => e.target.style.background = '#1e3a5f'}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              style={{
                flex: 1, padding: '13px',
                background: '#f1f5f9', color: '#374151',
                border: '1px solid #e2e8f0', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
