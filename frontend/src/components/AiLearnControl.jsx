import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Staff switch for the students' AI Learn chat. Closed by default to save API credits.
export default function AiLearnControl({ compact = false }) {
  const [st, setSt] = useState(null);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    axios.get(`${API_URL}/api/ai-learn/status`, api()).then(r => { setSt(r.data); setLeft(r.data.secondsLeft || 0); }).catch(() => {});
  }, []);
  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);
  useEffect(() => {
    if (!left) return undefined;
    const id = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [left > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (path, body) => {
    setBusy(true); setErr('');
    try { const r = await axios.post(`${API_URL}/api/ai-learn/${path}`, body || {}, api()); setSt(r.data); setLeft(r.data.secondsLeft || 0); }
    catch (e) { setErr(e.response?.data?.error || 'Could not change AI Learn'); }
    setBusy(false);
  };

  const open = left > 0;
  const pill = (bg, color, border) => ({ height: 30, padding: '0 11px', borderRadius: 50, border: `1.5px solid ${border}`, background: bg, color, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' });
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', background: open ? '#e9f5e6' : '#f4f6fa', border: `1px solid ${open ? '#9fd18f' : '#dae1ed'}`, borderRadius: 50, padding: '4px 6px 4px 12px', fontFamily: 'inherit' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: open ? '#276a1a' : '#5b6780' }}>
        AI Learn: {st == null ? '…' : open ? `open · ${fmt(left)} left` : 'closed'}
      </span>
      {open ? (
        <button type="button" disabled={busy} onClick={() => act('close')} style={pill('#fff', '#d30a28', '#f3b4bd')}>Close now</button>
      ) : (
        [10, 20, 30].concat(compact ? [] : [60]).map(m => (
          <button key={m} type="button" disabled={busy} onClick={() => act('open', { minutes: m })} style={pill('#fff', '#0056d2', '#b9d2f7')} title={`Open AI Learn for students for ${m} minutes`}>{m} min</button>
        ))
      )}
      {err && <span style={{ fontSize: 12, color: '#d30a28' }}>{err}</span>}
    </div>
  );
}
