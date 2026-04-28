import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const Q_TYPES = [
  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given' },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'SENTENCE_COMPLETION', label: 'Sentence Completion' },
  { value: 'SUMMARY_COMPLETION', label: 'Summary Completion' },
  { value: 'MATCHING_HEADINGS', label: 'Matching Headings' },
  { value: 'MATCHING_INFORMATION', label: 'Matching Information' },
  { value: 'PARAGRAPH_MATCH', label: 'Paragraph Match' },
];

const NEEDS_OPTIONS = ['MULTIPLE_CHOICE','MATCHING_HEADINGS','MATCHING_INFORMATION','PARAGRAPH_MATCH'];

function parseOptions(raw) {
  if (!raw) return '';
  if (Array.isArray(raw)) return raw.join('\n');
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p.join('\n') : raw; }
  catch { return raw; }
}

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edited, setEdited] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [delQIds, setDelQIds] = useState([]);
  const [delPIds, setDelPIds] = useState([]);
  const [delWTIds, setDelWTIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/papers/${id}`, auth());
      setPaper(r.data);
      setEdited(JSON.parse(JSON.stringify(r.data)));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const startEdit = () => {
    setEdited(JSON.parse(JSON.stringify(paper)));
    setDelQIds([]); setDelPIds([]); setDelWTIds([]);
    setEditMode(true); setMsg('');
  };

  const cancelEdit = () => {
    setEdited(JSON.parse(JSON.stringify(paper)));
    setDelQIds([]); setDelPIds([]); setDelWTIds([]);
    setEditMode(false); setMsg('');
  };

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await axios.put(`${API_URL}/api/admin/papers/${id}`, {
        ...edited,
        deletedQuestionIds: delQIds,
        deletedPassageIds: delPIds,
        deletedWritingTaskIds: delWTIds,
      }, auth());
      setMsg('✅ Paper saved successfully!');
      setDelQIds([]); setDelPIds([]); setDelWTIds([]);
      await load();
      setEditMode(false);
    } catch(e) {
      setMsg('❌ Save failed: ' + (e.response?.data?.error || e.message));
    }
    setSaving(false);
  };

  // ── question helpers ──────────────────────────────────────────
  const updateQ = (key, field, val) => setEdited(p => ({
    ...p, questions: p.questions.map(q => (q._key === key || q.id === key) ? { ...q, [field]: val } : q)
  }));

  const addQ = (passageNumber) => {
    const qs = edited.questions || [];
    const maxNo = qs.length ? Math.max(...qs.map(q => q.questionNumber || 0)) : 0;
    const _key = 'new-' + Date.now();
    setEdited(p => ({ ...p, questions: [...(p.questions||[]), {
      _key, paperId: parseInt(id), passageNumber,
      questionNumber: maxNo + 1, questionType: 'SHORT_ANSWER',
      content: '', correctAnswer: '', options: null, explanation: ''
    }]}));
  };

  const removeQ = (q) => {
    if (typeof q.id === 'number') setDelQIds(prev => [...prev, q.id]);
    const key = q._key || q.id;
    setEdited(p => ({ ...p, questions: p.questions.filter(x => (x._key || x.id) !== key) }));
  };

  // ── passage helpers ───────────────────────────────────────────
  const addPassage = () => {
    const ps = edited.passages || [];
    const nextNum = ps.length ? Math.max(...ps.map(p => p.passageNumber || 0)) + 1 : 1;
    const _key = 'new-' + Date.now();
    setEdited(p => ({ ...p, passages: [...(p.passages||[]), {
      _key, passageNumber: nextNum,
      title: '', sectionInstruction: '', text: ''
    }]}));
  };

  const removePassage = (passage) => {
    if (typeof passage.id === 'number') setDelPIds(prev => [...prev, passage.id]);
    const key = passage._key || passage.id;
    const pNum = passage.passageNumber;
    // also mark questions in this passage for deletion
    (edited.questions || []).filter(q => q.passageNumber === pNum).forEach(q => {
      if (typeof q.id === 'number') setDelQIds(prev => [...prev, q.id]);
    });
    setEdited(p => ({
      ...p,
      passages: p.passages.filter(x => (x._key || x.id) !== key),
      questions: p.questions.filter(q => q.passageNumber !== pNum),
    }));
  };

  const updatePassage = (pNum, field, val) => setEdited(p => ({
    ...p, passages: p.passages.map(x => x.passageNumber === pNum ? { ...x, [field]: val } : x)
  }));

  const updateWT = (idx, field, val) => setEdited(p => ({
    ...p, writingTasks: (p.writingTasks||[]).map((wt,i) => i===idx ? {...wt,[field]:val} : wt)
  }));

  const uploadChart = async (idx, file) => {
    const fd = new FormData(); fd.append('image', file);
    try {
      const r = await axios.post(`${API_URL}/api/admin/papers/${id}/upload-image`, fd, { headers:{ ...auth().headers, 'Content-Type':'multipart/form-data' } });
      updateWT(idx, 'chartUrl', r.data.imageUrl);
      setMsg('✅ Chart image uploaded!');
    } catch(e) { setMsg('❌ Image upload failed: ' + (e.response?.data?.error || e.message)); }
  };

  const uploadAudio = async (file) => {
    const fd = new FormData(); fd.append('audio', file);
    try {
      await axios.post(`${API_URL}/api/admin/papers/${id}/upload-audio`, fd, { headers:{ ...auth().headers, 'Content-Type':'multipart/form-data' } });
      setMsg('✅ Audio uploaded!'); await load();
    } catch(e) { setMsg('❌ Audio upload failed: ' + (e.response?.data?.error || e.message)); }
  };

  if (loading) return <div style={{padding:'80px',textAlign:'center',fontFamily:'Inter,sans-serif',color:'#64748b'}}>Loading…</div>;
  if (!paper)  return <div style={{padding:'80px',textAlign:'center',fontFamily:'Inter,sans-serif'}}>Paper not found.</div>;

  const cur = editMode ? edited : paper;

  // Build unified passage list from passages array (not just questionsByPassage)
  const passageMap = {};
  (cur.passages || []).forEach(p => { passageMap[p.passageNumber] = p; });
  // Fallback: include any passage numbers that appear in questions but have no passage record
  (cur.questions || []).forEach(q => {
    const n = q.passageNumber || 1;
    if (!passageMap[n]) passageMap[n] = { passageNumber: n, title: '', text: '' };
  });
  const passageNums = Object.keys(passageMap).map(Number).sort((a,b) => a-b);

  const qByPassage = {};
  (cur.questions || []).forEach(q => {
    const n = q.passageNumber || 1;
    if (!qByPassage[n]) qByPassage[n] = [];
    qByPassage[n].push(q);
  });

  const inp = {
    width:'100%', padding:'9px 13px', border:'1.5px solid #e2e8f0',
    borderRadius:'8px', fontSize:'14px', outline:'none',
    fontFamily:'Inter,sans-serif', boxSizing:'border-box', background:'#fff'
  };
  const lbl = { display:'block', fontSize:'10px', fontWeight:'700', color:'#94a3b8', marginBottom:'5px', textTransform:'uppercase' };

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif',padding:'24px 16px'}}>
      <div style={{maxWidth:'1000px',margin:'0 auto'}}>

        {/* ── Top bar ── */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px',flexWrap:'wrap',gap:'10px'}}>
          <button onClick={() => navigate('/admin/dashboard')}
            style={{padding:'9px 18px',background:'#fff',border:'1px solid #e2e8f0',borderRadius:'10px',cursor:'pointer',fontWeight:'600',color:'#475569',fontSize:'14px'}}>
            ← Back
          </button>
          <div style={{display:'flex',gap:'10px'}}>
            {!editMode ? (
              <button onClick={startEdit}
                style={{padding:'9px 22px',background:'#4f46e5',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'700',fontSize:'14px'}}>
                ✏️ Edit Paper
              </button>
            ) : (
              <>
                <button onClick={cancelEdit}
                  style={{padding:'9px 22px',background:'#f1f5f9',color:'#475569',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'600',fontSize:'14px'}}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  style={{padding:'9px 22px',background:saving?'#94a3b8':'#10b981',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'700',fontSize:'14px'}}>
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Message ── */}
        {msg && (
          <div style={{padding:'13px 18px',background:msg.startsWith('✅')?'#f0fdf4':'#fef2f2',color:msg.startsWith('✅')?'#166534':'#dc2626',borderRadius:'12px',border:`1px solid ${msg.startsWith('✅')?'#bbf7d0':'#fecaca'}`,marginBottom:'20px',fontWeight:'600',fontSize:'14px'}}>
            {msg}
          </div>
        )}

        {/* ── Paper meta card ── */}
        <div style={{background:'#fff',borderRadius:'16px',padding:'24px',border:'1px solid #e2e8f0',marginBottom:'28px'}}>
          {!editMode ? (
            <>
              <h1 style={{fontFamily:'Georgia,serif',fontSize:'26px',color:'#1a1a2e',marginBottom:'8px'}}>{paper.title}</h1>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap',fontSize:'13px',color:'#64748b'}}>
                <span style={{background:'#eff6ff',color:'#1d4ed8',padding:'3px 10px',borderRadius:'20px',fontWeight:'700'}}>{paper.testType}</span>
                <span>Code: <b>{paper.paperCode}</b></span>
                <span>Time: <b>{paper.timeLimitMin} min</b></span>
                <span>{(paper.questions||[]).length} questions • {(paper.passages||[]).length} passages</span>
              </div>
            </>
          ) : (
            <div style={{display:'grid',gap:'14px'}}>
              <div>
                <label style={lbl}>Paper Title</label>
                <input style={inp} value={edited.title||''} onChange={e => setEdited(p=>({...p,title:e.target.value}))} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={lbl}>Test Type</label>
                  <select style={inp} value={edited.testType||''} onChange={e => setEdited(p=>({...p,testType:e.target.value}))}>
                    {['READING','WRITING','LISTENING','SPEAKING'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Paper Code</label>
                  <input style={inp} value={edited.paperCode||''} onChange={e => setEdited(p=>({...p,paperCode:e.target.value}))} />
                </div>
                <div>
                  <label style={lbl}>Time (Mins)</label>
                  <input style={inp} type="number" value={edited.timeLimitMin||60} onChange={e => setEdited(p=>({...p,timeLimitMin:parseInt(e.target.value)||60}))} />
                </div>
              </div>
              <div>
                <label style={lbl}>Overall Instructions (shown at top of exam)</label>
                <textarea style={{...inp,minHeight:'70px',lineHeight:'1.5',resize:'vertical'}} value={edited.instructions||''} onChange={e => setEdited(p=>({...p,instructions:e.target.value}))} placeholder="e.g. Read the passages and answer Questions 1–40." />
              </div>
            </div>
          )}
        </div>
        {/* ── Writing Tasks (WRITING papers only) ── */}
        {cur.testType === 'WRITING' && (
          <div style={{background:'#fff',borderRadius:'16px',padding:'24px',border:'1px solid #e2e8f0',marginBottom:'28px'}}>
            <h3 style={{fontSize:'16px',fontWeight:'800',color:'#15803d',margin:'0 0 20px'}}>✍️ Writing Tasks</h3>
            {[1,2].map(taskNum => {
              const wts = (editMode ? edited : cur).writingTasks || [];
              const wtIdx = wts.findIndex(w => w.taskNumber === taskNum);
              const wt = wts[wtIdx];
              return (
                <div key={taskNum} style={{background:'#f8fafc',borderRadius:'12px',padding:'20px',marginBottom:'16px',border:'1px solid #e2e8f0'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                    <span style={{fontWeight:'800',fontSize:'14px',color:'#1e293b'}}>
                      Task {taskNum} — {taskNum===1 ? 'Chart/Graph Description (min 150 words)' : 'Essay Question (min 250 words)'}
                    </span>
                    {editMode && !wt && (
                      <button onClick={() => setEdited(p=>({...p,writingTasks:[...(p.writingTasks||[]),{taskNumber:taskNum,prompt:'',chartUrl:null,minWords:taskNum===1?150:250}]}))}
                        style={{background:'#10b981',color:'#fff',border:'none',borderRadius:'8px',padding:'6px 14px',cursor:'pointer',fontWeight:'700',fontSize:'12px'}}>
                        + Add Task {taskNum}
                      </button>
                    )}
                    {editMode && wt && typeof wt.id === 'number' && (
                      <button onClick={() => { setDelWTIds(p=>[...p,wt.id]); setEdited(p=>({...p,writingTasks:(p.writingTasks||[]).filter(x=>x.taskNumber!==taskNum)})); }}
                        style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'8px',padding:'5px 12px',cursor:'pointer',fontWeight:'700',fontSize:'12px'}}>
                        Remove
                      </button>
                    )}
                  </div>
                  {wt ? (
                    <div style={{display:'grid',gap:'12px'}}>
                      <div>
                        <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#94a3b8',marginBottom:'5px',textTransform:'uppercase'}}>Task Prompt</label>
                        {!editMode
                          ? <p style={{fontSize:'14px',color:'#1e293b',lineHeight:'1.7',margin:0,whiteSpace:'pre-wrap'}}>{wt.prompt || <em style={{color:'#94a3b8'}}>No prompt yet.</em>}</p>
                          : <textarea style={{width:'100%',padding:'10px',border:'1.5px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',outline:'none',fontFamily:'Inter,sans-serif',minHeight:'100px',boxSizing:'border-box',resize:'vertical'}}
                              value={wt.prompt||''} onChange={e=>updateWT(wtIdx,'prompt',e.target.value)}
                              placeholder={taskNum===1 ? 'e.g. The chart below shows global energy consumption. Summarise the information...' : 'e.g. Some people believe universities should focus only on academic subjects. Discuss both views...'} />
                        }
                      </div>
                      {taskNum === 1 && (
                        <div>
                          <label style={{display:'block',fontSize:'10px',fontWeight:'700',color:'#94a3b8',marginBottom:'8px',textTransform:'uppercase'}}>Chart / Image</label>
                          {wt.chartUrl
                            ? <img src={`${API_URL}${wt.chartUrl}`} alt="chart" style={{maxWidth:'100%',maxHeight:'260px',borderRadius:'10px',border:'1px solid #e2e8f0',display:'block',marginBottom:'10px'}}/>
                            : <div style={{padding:'24px',textAlign:'center',background:'#fff',border:'2px dashed #e2e8f0',borderRadius:'10px',marginBottom:'10px',color:'#94a3b8',fontSize:'13px'}}>No chart image yet</div>
                          }
                          {editMode && (
                            <label style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'8px 16px',background:'#7c3aed',color:'#fff',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>
                              📤 {wt.chartUrl ? 'Replace' : 'Upload'} Chart Image
                              <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ if(e.target.files[0]) uploadChart(wtIdx,e.target.files[0]); }}/>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{color:'#94a3b8',fontSize:'13px',margin:0,fontStyle:'italic'}}>No Task {taskNum} added yet. {editMode && 'Click "+ Add Task" above.'}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Listening Audio (LISTENING papers only) ── */}
        {cur.testType === 'LISTENING' && (
          <div style={{background:'#fff',borderRadius:'16px',padding:'24px',border:'1px solid #e2e8f0',borderLeft:'4px solid #7c3aed',marginBottom:'28px'}}>
            <h3 style={{fontSize:'16px',fontWeight:'800',color:'#7c3aed',margin:'0 0 16px'}}>🎧 Listening Audio</h3>
            {cur.audioUrl
              ? <audio controls src={`${API_URL}${cur.audioUrl}`} style={{width:'100%',marginBottom:'14px'}}/>
              : <div style={{padding:'20px',textAlign:'center',background:'#f5f3ff',border:'2px dashed #ddd6fe',borderRadius:'10px',marginBottom:'14px',color:'#7c3aed',fontSize:'13px'}}>No audio file uploaded yet</div>
            }
            <label style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 20px',background:'#7c3aed',color:'#fff',borderRadius:'10px',cursor:'pointer',fontWeight:'700',fontSize:'14px'}}>
              📤 {cur.audioUrl ? 'Replace' : 'Upload'} Audio File
              <input type="file" accept="audio/*" style={{display:'none'}} onChange={e=>{ if(e.target.files[0]) uploadAudio(e.target.files[0]); }}/>
            </label>
            <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'8px',marginBottom:0}}>Accepted: MP3, WAV, OGG, M4A — max 100MB</p>
          </div>
        )}

        {/* ── Passages ── */}

        {passageNums.map(pNum => {
          const passage = passageMap[pNum];
          const qs = (qByPassage[pNum] || []).slice().sort((a,b) => (a.questionNumber||0)-(b.questionNumber||0));

          return (
            <div key={pNum} style={{marginBottom:'36px'}}>
              {/* Passage header */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
                <h2 style={{fontSize:'20px',fontWeight:'800',color:'#1e3a5f',margin:0}}>Passage {pNum}</h2>
                <div style={{flex:1,height:'1px',background:'#e2e8f0'}} />
                {editMode && (
                  <button onClick={() => removePassage(passage)}
                    style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'8px',padding:'5px 12px',cursor:'pointer',fontSize:'12px',fontWeight:'700'}}>
                    🗑 Remove Passage
                  </button>
                )}
              </div>

              {/* Passage content card */}
              <div style={{background:'#fff',borderRadius:'14px',padding:'20px',border:'1px solid #e2e8f0',marginBottom:'14px'}}>
                {editMode ? (
                  <div style={{display:'grid',gap:'12px'}}>
                    <div>
                      <label style={lbl}>Passage Title (shown to students above the text)</label>
                      <input style={inp} value={passage.title||''} placeholder={`e.g. The Industrial Revolution`}
                        onChange={e => updatePassage(pNum,'title',e.target.value)} />
                    </div>
                    <div>
                      <label style={lbl}>Section Instruction (shown above questions — e.g. "Questions 1–5: Write TRUE, FALSE or NOT GIVEN")</label>
                      <input style={inp} value={passage.sectionInstruction||''} placeholder={`e.g. Questions 1–5: Do the following statements agree with the information?`}
                        onChange={e => updatePassage(pNum,'sectionInstruction',e.target.value)} />
                    </div>
                    <div>
                      <label style={lbl}>Passage Text</label>
                      <textarea style={{...inp,minHeight:'200px',lineHeight:'1.7',fontFamily:'Georgia,serif',fontSize:'14px',resize:'vertical'}}
                        value={passage.text||''} placeholder="Paste passage text here…"
                        onChange={e => updatePassage(pNum,'text',e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <>
                    {passage.title && <h3 style={{fontFamily:'Georgia,serif',fontSize:'17px',fontWeight:'700',color:'#1e293b',marginBottom:'12px'}}>{passage.title}</h3>}
                    <div style={{fontFamily:'Georgia,serif',fontSize:'15px',lineHeight:'1.9',color:'#2d3748',whiteSpace:'pre-wrap'}}>
                      {passage.text || <span style={{fontStyle:'italic',color:'#94a3b8'}}>No passage text yet.</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Section instruction banner (view mode) */}
              {!editMode && passage.sectionInstruction && (
                <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'10px',padding:'10px 16px',marginBottom:'12px',fontSize:'13px',fontWeight:'600',color:'#1d4ed8'}}>
                  📋 {passage.sectionInstruction}
                </div>
              )}

              {/* Questions */}
              <div style={{display:'grid',gap:'10px'}}>
                {qs.map(q => {
                  const qkey = q._key || q.id;
                  return (
                    <div key={qkey} style={{background:'#fff',padding:'18px 20px',borderRadius:'12px',border:'1px solid #e2e8f0'}}>
                      {!editMode ? (
                        <div style={{display:'flex',gap:'14px',alignItems:'flex-start'}}>
                          <div style={{width:'30px',height:'30px',borderRadius:'7px',background:'#4f46e5',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'800',flexShrink:0}}>
                            {q.questionNumber}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:'14px',color:'#1e293b',lineHeight:'1.6',marginBottom:'8px'}}>{q.content}</div>
                            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',fontSize:'12px'}}>
                              <span style={{background:'#eff6ff',color:'#1d4ed8',padding:'2px 8px',borderRadius:'10px',fontWeight:'600'}}>{Q_TYPES.find(t=>t.value===q.questionType)?.label || q.questionType}</span>
                              <span style={{background:'#dcfce7',color:'#166534',padding:'2px 8px',borderRadius:'10px',fontWeight:'700'}}>✅ {q.correctAnswer}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                          <div style={{display:'flex',flexDirection:'column',gap:'8px',alignItems:'center',flexShrink:0}}>
                            <div style={{width:'30px',height:'30px',borderRadius:'7px',background:'#4f46e5',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'800'}}>
                              {q.questionNumber}
                            </div>
                            <button onClick={() => removeQ(q)} title="Remove question"
                              style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'6px',padding:'4px 7px',cursor:'pointer',fontSize:'14px',lineHeight:1}}>
                              🗑
                            </button>
                          </div>
                          <div style={{flex:1,display:'grid',gap:'10px'}}>
                            <div style={{display:'grid',gridTemplateColumns:'70px 1fr',gap:'10px'}}>
                              <div>
                                <label style={lbl}>Q No.</label>
                                <input style={inp} type="number" value={q.questionNumber||''}
                                  onChange={e => updateQ(qkey,'questionNumber',parseInt(e.target.value)||1)} />
                              </div>
                              <div>
                                <label style={lbl}>Question Text</label>
                                <textarea style={{...inp,minHeight:'60px',resize:'vertical'}} value={q.content||''}
                                  onChange={e => updateQ(qkey,'content',e.target.value)} placeholder="Enter question text…" />
                              </div>
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                              <div>
                                <label style={lbl}>Question Type</label>
                                <select style={inp} value={q.questionType||'SHORT_ANSWER'}
                                  onChange={e => updateQ(qkey,'questionType',e.target.value)}>
                                  {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={lbl}>Correct Answer</label>
                                <input style={inp} value={q.correctAnswer||''}
                                  onChange={e => updateQ(qkey,'correctAnswer',e.target.value)} placeholder="e.g. TRUE / A / word" />
                              </div>
                            </div>
                            {NEEDS_OPTIONS.includes(q.questionType) && (
                              <div>
                                <label style={lbl}>Options (one per line)</label>
                                <textarea style={{...inp,minHeight:'80px',resize:'vertical'}}
                                  value={parseOptions(q.options)}
                                  onChange={e => updateQ(qkey,'options', e.target.value.split('\n').map(s=>s.trim()).filter(Boolean))}
                                  placeholder={'A. Option one\nB. Option two\nC. Option three\nD. Option four'} />
                              </div>
                            )}
                            <div>
                              <label style={lbl}>Explanation (optional — shown after wrong answer)</label>
                              <textarea style={{...inp,minHeight:'50px',resize:'vertical'}} value={q.explanation||''}
                                onChange={e => updateQ(qkey,'explanation',e.target.value)} placeholder="Why is this the correct answer?" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {editMode && (
                  <button onClick={() => addQ(pNum)}
                    style={{padding:'13px',background:'#f8fafc',border:'2px dashed #c7d2fe',borderRadius:'12px',color:'#4f46e5',fontWeight:'700',cursor:'pointer',fontSize:'14px',transition:'border-color .2s'}}>
                    + Add Question to Passage {pNum}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* ── Add Passage ── */}
        {editMode && (
          <div style={{textAlign:'center',padding:'32px 0 48px'}}>
            <button onClick={addPassage}
              style={{padding:'14px 36px',background:'#fff',color:'#4f46e5',border:'2px solid #4f46e5',borderRadius:'14px',fontWeight:'800',cursor:'pointer',fontSize:'15px',boxShadow:'0 4px 14px rgba(79,70,229,.12)',transition:'all .2s'}}>
              ➕ Add New Passage
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
