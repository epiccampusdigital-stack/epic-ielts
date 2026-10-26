import { useNavigate, useSearchParams } from 'react-router-dom';

const LEVEL_NAMES = {
  1: 'Foundation', 2: 'Elementary', 3: 'Intermediate',
  4: 'Upper Intermediate', 5: 'Advanced', 99: 'Full Access'
};

export default function LevelPaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const level = parseInt(params.get('level') || '0');
  const isFullAccess = level === 99;
  const levelName = LEVEL_NAMES[level] || 'your level';
  const testCount = isFullAccess ? 15 : 3;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Source Sans Pro, sans-serif', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>

        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f1114', marginBottom: 12 }}>
          Payment Successful!
        </h1>

        <p style={{ color: '#1e2229', fontSize: 15, marginBottom: 8, lineHeight: 1.6 }}>
          {isFullAccess
            ? 'You now have full access to all 5 levels!'
            : `Level ${level} — ${levelName} is now unlocked!`}
        </p>
        <p style={{ color: '#5b6780', fontSize: 13, marginBottom: 28 }}>
          Your {testCount} mock test{testCount !== 1 ? 's' : ''} are ready to start.
        </p>

        {/* What's unlocked */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 28, textAlign: 'left' }}>
          {(isFullAccess
            ? ['📖 All Reading mock tests', '✍️ All Writing mock tests', '🎧 All Listening mock tests', '🎤 All Speaking mock tests', '🤖 AI marking & feedback', '📊 Full band score dashboard']
            : [`📖 Reading — Level ${level}`, `✍️ Writing — Level ${level}`, `🎧 Listening — Level ${level}`, `🎤 Speaking — Level ${level}`, '🤖 AI marking & feedback']
          ).map(item => (
            <div key={item} style={{ fontSize: 13, color: '#15803d', padding: '4px 0' }}>✓ {item}</div>
          ))}
        </div>

        <button
          onClick={() => navigate('/levels')}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0048b0, #003b8f)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
          Start Learning →
        </button>
        <button
          onClick={() => navigate('/student/dashboard')}
          style={{ width: '100%', padding: '12px', background: '#e8eef7', color: '#5b6780', border: '1px solid #dae1ed', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Go to Dashboard
        </button>

        <p style={{ marginTop: 20, fontSize: 11, color: '#8495b0' }}>
          A confirmation email will arrive shortly. If you have any issues, contact us.
        </p>
      </div>
    </div>
  );
}
