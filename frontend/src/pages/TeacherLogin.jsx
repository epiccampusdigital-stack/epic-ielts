import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

// A simple login page just for teachers: epicielts.live/teacher-login
export default function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Teacher login · EPIC Campus';
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (localStorage.getItem('token') && u.role === 'PROGRAM_TEACHER') navigate('/teacher', { replace: true });
    } catch { /* not logged in */ }
    return () => { document.title = 'EPIC IELTS'; };
  }, [navigate]);

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await axios.post(`${API_URL}/api/auth/login`, { email: email.trim(), password });
      const u = r.data.user || {};
      if (!['PROGRAM_TEACHER', 'ADMIN', 'TEACHER'].includes(u.role)) {
        setError('This page is for teachers. Students log in on the main page.');
        setBusy(false); return;
      }
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('user', JSON.stringify(u));
      navigate(u.role === 'PROGRAM_TEACHER' ? '/teacher' : '/admin/dashboard', { replace: true });
    } catch (err) {
      setError(!err.response ? 'Could not reach the server. Check your internet and try again.' : (err.response?.data?.error || 'That email and password do not match.'));
    }
    setBusy(false);
  };

  const field = { width: '100%', height: 48, border: '1px solid #cfd8e6', borderRadius: 12, padding: '0 14px', fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' };
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #002761 0%, #0048b0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Source Sans Pro', 'Source Sans 3', Arial, sans-serif" }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: '30px 26px', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0056d2', letterSpacing: '.06em' }}>EPIC CAMPUS</div>
        <h1 style={{ margin: '4px 0 4px', fontSize: 26, color: '#0f1114' }}>Teacher portal</h1>
        <p style={{ margin: '0 0 20px', color: '#5b6780', fontSize: 14.5 }}>Your timetable, today's class and all the papers with answers.</p>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }} htmlFor="tl-email">Email</label>
        <input id="tl-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} style={field} />
        <label style={{ display: 'block', fontWeight: 600, fontSize: 14, margin: '14px 0 6px' }} htmlFor="tl-pw">Password</label>
        <div style={{ position: 'relative' }}>
          <input id="tl-pw" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} style={{ ...field, paddingRight: 70 }} />
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 8, top: 8, height: 32, border: 0, background: '#eef3fb', borderRadius: 8, padding: '0 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: '#334155' }}>{show ? 'Hide' : 'Show'}</button>
        </div>
        {error && <div role="alert" style={{ marginTop: 14, background: '#fef2f2', color: '#991b1b', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>{error}</div>}
        <button type="submit" disabled={busy} style={{ width: '100%', height: 50, marginTop: 18, border: 0, borderRadius: 12, background: '#0056d2', color: '#fff', fontSize: 16.5, fontWeight: 700, cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.7 : 1 }}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p style={{ margin: '16px 0 0', fontSize: 13.5, color: '#5b6780', textAlign: 'center' }}>Forgot your password? Ask the admin to reset it.</p>
      </form>
    </div>
  );
}
