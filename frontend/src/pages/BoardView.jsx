import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { HighlightedText, ReplyQuote } from '../components/ChatExtras';

// View-only message board for a shared link (no login). Nothing can be posted or changed here.
const fileSrc = u => (u && u.startsWith('/') ? `${API_URL}${u}` : u);
const when = d => new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function BoardView() {
  const { token } = useParams();
  const [groups, setGroups] = useState(null);
  const [sel, setSel] = useState(null);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [olderBusy, setOlderBusy] = useState(false);
  const base = `${API_URL}/api/chat/view/${encodeURIComponent(token)}`;

  useEffect(() => {
    axios.get(`${base}/groups`).then(r => { setGroups(r.data); if (r.data[0]) setSel(r.data[0].id); })
      .catch(e => setErr(e?.response?.data?.error || 'This link is not working. Ask the teacher for a new one.'));
  }, [base]);
  useEffect(() => {
    if (!sel) return;
    setData(null);
    axios.get(`${base}/groups/${sel}/messages`).then(r => { setData(r.data); setTimeout(() => { const el = document.getElementById('bv-feed'); if (el) el.scrollTop = el.scrollHeight; }, 50); })
      .catch(() => setData({ messages: [], group: { name: '' }, error: true }));
  }, [base, sel]);
  const older = async () => {
    if (!data?.messages?.length) return;
    setOlderBusy(true);
    try {
      const r = await axios.get(`${base}/groups/${sel}/messages`, { params: { before: data.messages[0].id } });
      setData(d => ({ ...d, more: r.data.more, messages: [...r.data.messages, ...d.messages] }));
    } catch { /* keep what we have */ }
    setOlderBusy(false);
  };

  if (err) return <div style={{ fontFamily: 'Arial, sans-serif', padding: 40, textAlign: 'center', color: '#334155' }}><h2 style={{ color: '#0f2a5c' }}>EPIC Campus message board</h2><p>{err}</p></div>;
  return (
    <div className="bv">
      <style>{`
        .bv { font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #050505; height: 100vh; display: grid; grid-template-rows: auto minmax(0,1fr); background: #fff; }
        .bv-top { display: flex; align-items: center; gap: 12px; padding: 12px 18px; background: linear-gradient(135deg,#002761,#0048b0); color: #fff; }
        .bv-body { display: grid; grid-template-columns: 300px minmax(0,1fr); min-height: 0; }
        .bv-side { border-right: 1px solid #e4e6eb; overflow-y: auto; padding: 10px; }
        .bv-g { width: 100%; text-align: left; border: 0; background: none; padding: 10px 12px; border-radius: 10px; cursor: pointer; font: inherit; }
        .bv-g.on { background: #e7f0fe; }
        .bv-feed { overflow-y: auto; padding: 16px 20px; background: #fff; }
        .bv-msg { display: flex; flex-direction: column; margin: 0 0 14px; max-width: 760px; }
        .bv-bub { background: #f0f2f5; border-radius: 16px; padding: 10px 14px; font-size: 15px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
        .bv-msg.staff .bv-bub { background: #e7f0fe; }
        .bv-chip { display: inline-block; font-size: 11px; font-weight: 800; border-radius: 6px; padding: 1px 7px; margin-right: 6px; background: #fff4e5; color: #b45309; }
        @media (max-width: 760px) { .bv-body { grid-template-columns: minmax(0,1fr); grid-template-rows: auto minmax(0,1fr); } .bv-side { border-right: 0; border-bottom: 1px solid #e4e6eb; display: flex; gap: 6px; overflow-x: auto; padding: 8px; } .bv-g { white-space: nowrap; width: auto; } .bv-g .bv-last { display: none; } }
      `}</style>
      <div className="bv-top">
        <b style={{ fontSize: 17 }}>EPIC Campus · Message board</b>
        <span style={{ fontSize: 12.5, background: 'rgba(255,255,255,.18)', borderRadius: 50, padding: '3px 10px' }}>View only</span>
      </div>
      <div className="bv-body">
        <div className="bv-side">
          {groups == null && <div style={{ color: '#65676b', padding: 10 }}>Loading…</div>}
          {(groups || []).map(g => (
            <button key={g.id} type="button" className={`bv-g${sel === g.id ? ' on' : ''}`} onClick={() => setSel(g.id)}>
              <b style={{ display: 'block', fontSize: 15 }}>{g.name}</b>
              <span className="bv-last" style={{ display: 'block', fontSize: 12.5, color: '#65676b', marginTop: 2 }}>{g.members} students · {g.messages} messages</span>
              {g.last && <span className="bv-last" style={{ display: 'block', fontSize: 12.5, color: '#65676b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.last.by}: {g.last.text}</span>}
            </button>
          ))}
        </div>
        <div id="bv-feed" className="bv-feed">
          {!data && sel && <div style={{ color: '#65676b' }}>Loading messages…</div>}
          {data?.more && <div style={{ textAlign: 'center', margin: '0 0 14px' }}><button type="button" onClick={older} disabled={olderBusy} style={{ border: '1px solid #ccd0d5', background: '#fff', borderRadius: 50, padding: '6px 16px', cursor: 'pointer', fontWeight: 700 }}>{olderBusy ? 'Loading…' : 'Show older messages'}</button></div>}
          {data && !data.messages.length && <div style={{ color: '#65676b' }}>No messages yet.</div>}
          {(data?.messages || []).map(m => (
            <div key={m.id} className={`bv-msg${m.staff ? ' staff' : ''}`}>
              <div style={{ fontSize: 12.5, color: '#65676b', margin: '0 0 3px 6px' }}><b style={{ color: m.staff ? '#0048b0' : '#050505' }}>{m.senderName}</b>{m.staff ? ' · Teacher' : ''} · {when(m.createdAt)}</div>
              <div className="bv-bub">
                {m.replyTo && <ReplyQuote reply={m.replyTo} />}
                {(m.isTask || m.pinned) && <div style={{ marginBottom: 4 }}>{m.isTask && <span className="bv-chip">{m.askAnswer ? 'QUESTION' : 'TASK'}</span>}{m.pinned && <span className="bv-chip" style={{ background: '#fde68a', color: '#713f12' }}>PINNED</span>}</div>}
                {m.imageUrl && <a href={fileSrc(m.imageUrl)} target="_blank" rel="noreferrer"><img src={fileSrc(m.imageUrl)} alt="Photo" loading="lazy" style={{ display: 'block', maxWidth: '100%', maxHeight: '60vh', borderRadius: 12, marginBottom: m.text ? 8 : 0 }} /></a>}
                {m.fileUrl && <a href={fileSrc(m.fileUrl)} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 10, alignItems: 'center', background: '#fff', borderRadius: 10, padding: '8px 12px', textDecoration: 'none', color: '#050505', border: '1px solid #e4e6eb', marginBottom: m.text ? 8 : 0 }}><span style={{ background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: 11, borderRadius: 5, padding: '10px 6px' }}>PDF</span><b>{m.fileName || 'Document.pdf'}</b></a>}
                {m.paper && <div style={{ background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid #e4e6eb', marginBottom: m.text ? 8 : 0 }}><b>{m.paper.title}</b> <span style={{ color: '#65676b', fontSize: 13 }}>· {String(m.paper.testType || 'Paper').toLowerCase()}</span></div>}
                {m.lesson && <div style={{ background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid #e4e6eb', marginBottom: m.text ? 8 : 0 }}><b>{m.lesson.title}</b> <span style={{ color: '#65676b', fontSize: 13 }}>· lesson</span></div>}
                {m.text && <HighlightedText id={`bv${m.id}`} text={m.text} highlights={m.highlights} />}
              </div>
              {(m.stats || m.answers) && (
                <div style={{ fontSize: 12.5, color: '#475569', margin: '4px 0 0 6px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {m.stats && <span>Seen by {m.stats.seen}/{m.stats.total}{m.stats.task ? ` · Done ${m.stats.done}/${m.stats.total}` : ''}</span>}
                  {m.answers && <span>Answers {m.answers.total} · checked {m.answers.checked}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
