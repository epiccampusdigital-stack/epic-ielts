import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }
    axios.get(`${API_URL}/api/auth/verify-email?token=${token}`)
      .then(r => { setStatus('success'); setMessage(r.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.error || 'Verification failed.'); });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Source Sans Pro, sans-serif', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #dae1ed' }}>
        {status === 'verifying' && (
          <>
            <div style={{ width: 48, height: 48, border: '3px solid #dae1ed', borderTop: '3px solid #0056d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1114', marginBottom: 8 }}>Verifying your email...</h2>
            <p style={{ color: '#5b6780', fontSize: 14 }}>Please wait a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f1114', marginBottom: 8 }}>Email Verified!</h2>
            <p style={{ color: '#5b6780', fontSize: 15, marginBottom: 28 }}>{message}</p>
            <button onClick={() => navigate('/')}
              style={{ padding: '12px 28px', background: '#0056d2', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Source Sans Pro, sans-serif' }}>
              Go to Login →
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 20 }}>❌</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f1114', marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ color: '#5b6780', fontSize: 15, marginBottom: 28 }}>{message}</p>
            <button onClick={() => navigate('/')}
              style={{ padding: '12px 28px', background: '#0056d2', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Source Sans Pro, sans-serif' }}>
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
