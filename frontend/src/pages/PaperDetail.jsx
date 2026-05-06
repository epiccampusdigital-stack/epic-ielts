import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const QUESTION_TYPE_MAP = {
  "Multiple Choice":          "MULTIPLE_CHOICE",
  "Short Answer":             "SHORT_ANSWER",
  "Fill in the blank":        "FILL_IN_THE_BLANK",
  "True / False / Not Given": "TRUE_FALSE_NOT_GIVEN",
  "Yes / No / Not Given":     "YES_NO_NOT_GIVEN",
  "Heading Matching":         "HEADING_MATCHING",
  "Matching":                 "MATCHING",
  "Sentence Completion":      "SENTENCE_COMPLETION",
  "Summary Completion":       "SUMMARY_COMPLETION",
  "Table Completion":         "TABLE_COMPLETION",
  "Note Completion":          "NOTE_COMPLETION",
  "Form Completion":          "FORM_COMPLETION",
  "Map / Diagram Labeling":   "MAP_LABELING",
};

const Q_TYPES = Object.keys(QUESTION_TYPE_MAP).map(k => ({ value: QUESTION_TYPE_MAP[k], label: k }));

const lbl = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' };
const inp = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', background: '#fff' };
const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API_URL + (url.startsWith('/') ? '' : '/') + url;
};

// --- SUB-COMPONENTS ---

const TableEditor = ({ data, onChange }) => {
  const table = data || { headers: ['Column 1', 'Column 2'], rows: [[{ text: '' }, { text: '' }]] };
  const headers = table.headers || [];
  const rows = table.rows || [];

  const updateHeader = (i, val) => {
    const next = [...headers]; next[i] = val;
    onChange({ ...table, headers: next });
  };

  const toggleCell = (ri, ci) => {
    const nextRows = [...rows];
    const cell = { ...nextRows[ri][ci] };
    if (cell.blank) {
      delete cell.blank;
      delete cell.questionNumber;
      cell.text = '';
    } else {
      cell.blank = true;
      cell.text = '';
      cell.questionNumber = '';
    }
    nextRows[ri] = [...nextRows[ri]];
    nextRows[ri][ci] = cell;
    onChange({ ...table, rows: nextRows });
  };

  const updateCell = (ri, ci, val) => {
    const nextRows = [...rows];
    nextRows[ri] = [...nextRows[ri]];
    nextRows[ri][ci] = { ...nextRows[ri][ci], text: val };
    onChange({ ...table, rows: nextRows });
  };

  const updateBlankQ = (ri, ci, val) => {
    const nextRows = [...rows];
    nextRows[ri] = [...nextRows[ri]];
    nextRows[ri][ci] = { ...nextRows[ri][ci], questionNumber: parseInt(val) || '' };
    onChange({ ...table, rows: nextRows });
  };

  const addRow = () => onChange({ ...table, rows: [...rows, headers.map(() => ({ text: '' }))] });
  const addCol = () => onChange({ headers: [...headers, 'New Col'], rows: rows.map(r => [...r, { text: '' }]) });

  return (
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <button onClick={addCol} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>+ ADD COLUMN</button>
        <button onClick={addRow} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>+ ADD ROW</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ border: '1px solid #e2e8f0', padding: '10px' }}>
                <input style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '800', textAlign: 'center', fontSize: '12px' }} value={h} onChange={e => updateHeader(i, e.target.value)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ border: '1px solid #e2e8f0', padding: '8px', minWidth: '120px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {cell.blank ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#4f46e5' }}>Q:</span>
                        <input type="number" style={{ ...inp, padding: '4px', textAlign: 'center' }} value={cell.questionNumber} onChange={e => updateBlankQ(ri, ci, e.target.value)} placeholder="Q#" />
                      </div>
                    ) : (
                      <input style={{ ...inp, border: 'none', padding: '4px', fontSize: '13px' }} value={cell.text} onChange={e => updateCell(ri, ci, e.target.value)} placeholder="Static text..." />
                    )}
                    <button onClick={() => toggleCell(ri, ci)} style={{ fontSize: '9px', fontWeight: '800', color: cell.blank ? '#dc2626' : '#10b981', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      {cell.blank ? 'SWITCH TO TEXT' : 'SWITCH TO BLANK'}
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- MAIN PAGE ---

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [edited, setEdited] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  // Tracking deletions for the transaction
  const [delQIds, setDelQIds] = useState([]);
  const [delGIds, setDelGIds] = useState([]);
  const [delSIds, setDelSIds] = useState([]);
  const [delPIds, setDelPIds] = useState([]);
  const [delWTIds, setDelWTIds] = useState([]);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      setError(null);
      const r = await axios.get(`${API_URL}/api/admin/papers/${id}`, auth());
      const raw = r.data;
      const normalized = {
        ...raw,
        passages: (raw.passages || []).map((p) => ({
          ...p,
          groups: (p.groups || []).map((g) => ({
            ...g,
            questions: (g.questions || []).map((q) => ({ ...q }))
          }))
        })),
        sections: (raw.sections || []).map((s) => ({
          ...s,
          groups: (s.groups || []).map((g) => ({
            ...g,
            questions: (g.questions || []).map((q) => ({ ...q }))
          }))
        })),
        questions: (raw.questions || []).map((q) => ({ ...q })),
        writingTasks: (raw.writingTasks || []).map((w) => ({ ...w }))
      };
      const snapshot = JSON.parse(JSON.stringify(normalized));
      setPaper(snapshot);
      setEdited(JSON.parse(JSON.stringify(snapshot)));
      // If paper was just imported (logic can be based on missing audio or specialized flag)
      if (r.data.testType === 'LISTENING' && r.data.sections?.length > 0 && !r.data.sections[0].audioUrl) {
        setShowSetup(true);
      }
    } catch (e) { 
      console.error(e); 
      setError(e.response?.data?.error || e.message);
    }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await axios.put(`${API_URL}/api/admin/papers/${id}`, {
        ...edited,
        deletedQuestionIds: delQIds,
        deletedGroupIds: delGIds,
        deletedSectionIds: delSIds,
        deletedPassageIds: delPIds,
        deletedWritingTaskIds: delWTIds
      }, auth());
      setMsg('✅ Paper saved successfully!');
      setEditMode(false);
      await load();
    } catch (e) { setMsg('❌ Save failed: ' + (e.response?.data?.error || e.message)); }
    setSaving(false);
  };

  const uploadAsset = async (file, type) => {
    const fd = new FormData(); fd.append(type, file);
    try {
      const r = await axios.post(`${API_URL}/api/upload/${type}`, fd, { headers: { ...auth().headers, 'Content-Type': 'multipart/form-data' } });
      return r.data.url;
    } catch (e) { setMsg(`❌ Upload failed: ` + (e.response?.data?.error || e.message)); return null; }
  };

  // --- HANDLERS ---

  const addSection = () => {
    const num = (edited.sections?.length || 0) + 1;
    setEdited(p => ({ ...p, sections: [...(p.sections || []), { number: num, groups: [] }] }));
  };

  const addGroup = (sIdx) => {
    const nextSections = [...edited.sections];
    nextSections[sIdx].groups = [...(nextSections[sIdx].groups || []), { groupType: 'FORM_COMPLETION', instruction: '', questions: [] }];
    setEdited({ ...edited, sections: nextSections });
  };

  const addPassageGroup = (pIdx) => {
    const nextPassages = [...edited.passages];
    nextPassages[pIdx].groups = [...(nextPassages[pIdx].groups || []), { groupType: 'SHORT_ANSWER', instruction: '', questions: [] }];
    setEdited({ ...edited, passages: nextPassages });
  };

  const addQuestion = (sIdx, gIdx) => {
    const nextSections = [...edited.sections];
    const group = nextSections[sIdx].groups[gIdx];
    
    // Find global maxNo across all hierarchical structures
    const allQs = [
      ...(edited.questions || []),
      ...(edited.sections || []).flatMap(s => (s.groups || []).flatMap(g => g.questions || [])),
      ...(edited.passages || []).flatMap(p => (p.groups || []).flatMap(g => g.questions || []))
    ];
    const maxNo = allQs.length ? Math.max(...allQs.map(q => q.questionNumber || 0)) : 0;
    
    group.questions = [...(group.questions || []), {
      questionNumber: maxNo + 1,
      questionType: group.groupType,
      content: '',
      correctAnswer: '',
      explanation: ''
    }];
    setEdited({ ...edited, sections: nextSections });
  };

  const addPassageQuestion = (pIdx, gIdx) => {
    const nextPassages = [...edited.passages];
    const group = nextPassages[pIdx].groups[gIdx];
    
    const allQs = [
      ...(edited.questions || []),
      ...(edited.sections || []).flatMap(s => (s.groups || []).flatMap(g => g.questions || [])),
      ...(edited.passages || []).flatMap(p => (p.groups || []).flatMap(g => g.questions || []))
    ];
    const maxNo = allQs.length ? Math.max(...allQs.map(q => q.questionNumber || 0)) : 0;
    
    group.questions = [...(group.questions || []), {
      questionNumber: maxNo + 1,
      questionType: group.groupType,
      content: '',
      correctAnswer: '',
      explanation: ''
    }];
    setEdited({ ...edited, passages: nextPassages });
  };

  const updateQ = (sIdx, gIdx, qIdx, field, val) => {
    const nextSections = [...edited.sections];
    nextSections[sIdx].groups[gIdx].questions[qIdx][field] = val;
    setEdited({ ...edited, sections: nextSections });
  };

  const updatePassageQ = (pIdx, gIdx, qIdx, field, val) => {
    const nextPassages = [...edited.passages];
    nextPassages[pIdx].groups[gIdx].questions[qIdx][field] = val;
    setEdited({ ...edited, passages: nextPassages });
  };

  const removeQ = (sIdx, gIdx, qIdx) => {
    const nextSections = [...edited.sections];
    const q = nextSections[sIdx].groups[gIdx].questions[qIdx];
    if (q.id) setDelQIds(prev => [...prev, q.id]);
    nextSections[sIdx].groups[gIdx].questions.splice(qIdx, 1);
    setEdited({ ...edited, sections: nextSections });
  };

  const removePassageQ = (pIdx, gIdx, qIdx) => {
    const nextPassages = [...edited.passages];
    const q = nextPassages[pIdx].groups[gIdx].questions[qIdx];
    if (q.id) setDelQIds(prev => [...prev, q.id]);
    nextPassages[pIdx].groups[gIdx].questions.splice(qIdx, 1);
    setEdited({ ...edited, passages: nextPassages });
  };

  const removeGroup = (sIdx, gIdx) => {
    const nextSections = [...edited.sections];
    const g = nextSections[sIdx].groups[gIdx];
    if (g.id) setDelGIds(prev => [...prev, g.id]);
    nextSections[sIdx].groups.splice(gIdx, 1);
    setEdited({ ...edited, sections: nextSections });
  };

  const removePassageGroup = (pIdx, gIdx) => {
    const nextPassages = [...edited.passages];
    const g = nextPassages[pIdx].groups[gIdx];
    if (g.id) setDelGIds(prev => [...prev, g.id]);
    nextPassages[pIdx].groups.splice(gIdx, 1);
    setEdited({ ...edited, passages: nextPassages });
  };

  const addPassage = () => {
    const num = (edited.passages?.length || 0) + 1;
    setEdited(p => ({ ...p, passages: [...(p.passages || []), { passageNumber: num, title: '', text: '' }] }));
  };

  const addFlatQuestion = (pNum) => {
    const maxNo = edited.questions?.length ? Math.max(...edited.questions.map(q => q.questionNumber || 0)) : 0;
    const newQ = { questionNumber: maxNo + 1, passageNumber: pNum, questionType: 'SHORT_ANSWER', content: '', correctAnswer: '', explanation: '', options: null };
    setEdited(p => ({ ...p, questions: [...(p.questions || []), newQ] }));
  };

  const updateFlatQ = (idx, field, val) => {
    const next = [...edited.questions];
    next[idx][field] = val;
    setEdited({ ...edited, questions: next });
  };

  const removeFlatQ = (idx) => {
    const q = edited.questions[idx];
    if (q.id) setDelQIds(prev => [...prev, q.id]);
    const next = [...edited.questions];
    next.splice(idx, 1);
    setEdited({ ...edited, questions: next });
  };

  const addWritingTask = () => {
    const num = (edited.writingTasks?.length || 0) + 1;
    setEdited(p => ({ ...p, writingTasks: [...(p.writingTasks || []), { taskNumber: num, prompt: '', minWords: num === 1 ? 150 : 250 }] }));
  };

  const updateWT = (idx, field, val) => {
    const next = [...edited.writingTasks];
    next[idx][field] = val;
    setEdited({ ...edited, writingTasks: next });
  };

  const removeWT = (idx) => {
    const wt = edited.writingTasks[idx];
    if (wt.id) setDelWTIds(prev => [...prev, wt.id]);
    const next = [...edited.writingTasks];
    next.splice(idx, 1);
    setEdited({ ...edited, writingTasks: next });
  };

  // --- RENDERERS ---

  const renderListeningSection = (section, sIdx) => (
    <div key={sIdx} style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b' }}>Section {section.number}</h2>
        {editMode && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#4f46e5', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '800' }}>
            {section.audioUrl ? '🎵 REPLACE AUDIO' : '🎤 UPLOAD AUDIO'}
            <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={async e => {
              const url = await uploadAsset(e.target.files[0], 'audio');
              if (url) {
                const next = [...edited.sections]; next[sIdx].audioUrl = url;
                setEdited({ ...edited, sections: next });
                setMsg('✅ Section audio uploaded');
              }
            }} />
          </label>
        )}
      </div>
      
      {section.audioUrl && <audio controls src={getFullUrl(section.audioUrl)} style={{ width: '100%', marginBottom: '24px' }} />}
      
      <div style={{ display: 'grid', gap: '24px' }}>
        {(section.groups || []).map((group, gIdx) => (
          <div key={gIdx} style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1.5px solid #e2e8f0' }}>
            {editMode ? (
              <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '45%' }}>
                    <label style={lbl}>Type</label>
                    <select style={inp} value={group.groupType} onChange={e => {
                      const next = [...edited.sections]; next[sIdx].groups[gIdx].groupType = e.target.value;
                      setEdited({ ...edited, sections: next });
                    }}>
                      {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div style={{ width: '45%' }}>
                    <label style={lbl}>Word Limit</label>
                    <input style={inp} value={group.wordLimit || ''} onChange={e => {
                      const next = [...edited.sections]; next[sIdx].groups[gIdx].wordLimit = e.target.value;
                      setEdited({ ...edited, sections: next });
                    }} placeholder="e.g. ONE WORD ONLY" />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Instruction</label>
                  <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={group.instruction || ''} onChange={e => {
                    const next = [...edited.sections]; next[sIdx].groups[gIdx].instruction = e.target.value;
                    setEdited({ ...edited, sections: next });
                  }} />
                </div>

                {(group.groupType === 'MAP_LABELING' || group.groupType === 'TABLE_COMPLETION') && (
                  <div>
                    <label style={lbl}>{group.groupType === 'MAP_LABELING' ? 'Map Image' : 'Optional Diagram'}</label>
                    {group.imageUrl && <img src={getFullUrl(group.imageUrl)} style={{ maxHeight: '150px', display: 'block', marginBottom: '10px', borderRadius: '8px' }} />}
                    <label style={{ display: 'inline-block', padding: '6px 12px', border: '1.5px solid #4f46e5', color: '#4f46e5', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '800' }}>
                      UPLOAD IMAGE <input type="file" style={{ display: 'none' }} onChange={async e => {
                        const url = await uploadAsset(e.target.files[0], 'image');
                        if (url) {
                          const next = [...edited.sections]; next[sIdx].groups[gIdx].imageUrl = url;
                          setEdited({ ...edited, sections: next });
                        }
                      }} />
                    </label>
                  </div>
                )}

                {group.groupType === 'TABLE_COMPLETION' && (
                  <TableEditor data={group.tableData} onChange={val => {
                    const next = [...edited.sections]; next[sIdx].groups[gIdx].tableData = val;
                    setEdited({ ...edited, sections: next });
                  }} />
                )}

                <button onClick={() => removeGroup(sIdx, gIdx)} style={{ width: 'fit-content', background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>🗑 REMOVE GROUP</button>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#4f46e5' }}>{group.instruction}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>LIMIT: {group.wordLimit}</div>
                {group.imageUrl && <img src={getFullUrl(group.imageUrl)} style={{ maxWidth: '100%', borderRadius: '12px', marginTop: '12px', border: '1px solid #e2e8f0' }} />}
              </div>
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              {(group.questions || []).map((q, qIdx) => (
                <div key={qIdx} style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  {editMode ? (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '30px', textAlign: 'center' }}>
                        <input type="number" style={{ ...inp, padding: '4px', textAlign: 'center' }} value={q.questionNumber} onChange={e => updateQ(sIdx, gIdx, qIdx, 'questionNumber', parseInt(e.target.value))} />
                        <button onClick={() => removeQ(sIdx, gIdx, qIdx)} style={{ marginTop: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>🗑</button>
                      </div>
                      <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                        <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={q.content} onChange={e => updateQ(sIdx, gIdx, qIdx, 'content', e.target.value)} placeholder="Question prompt (e.g. Name: Sarah ___)" />
                        {group.groupType === 'MULTIPLE_CHOICE' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {['A', 'B', 'C', 'D'].map((letter, i) => {
                              const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? q.options.split('\n') : ['', '', '', '']);
                              return (
                                <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#4f46e5' }}>{letter}.</span>
                                  <input 
                                    style={{ ...inp, padding: '6px 10px' }} 
                                    value={opts[i]?.replace(/^[A-D][\.\)]\s*/, '') || ''} 
                                    onChange={e => {
                                      const next = [...opts];
                                      for(let j=0; j<4; j++) if(!next[j]) next[j] = '';
                                      next[i] = `${letter}. ${e.target.value}`;
                                      updateQ(sIdx, gIdx, qIdx, 'options', next);
                                    }} 
                                    placeholder={`Option ${letter}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input style={{ ...inp, flex: 1 }} value={q.correctAnswer} onChange={e => updateQ(sIdx, gIdx, qIdx, 'correctAnswer', e.target.value)} placeholder="Correct Answer (Sarah|Sarah Smith)" />
                          <input style={{ ...inp, flex: 1 }} value={q.explanation || ''} onChange={e => updateQ(sIdx, gIdx, qIdx, 'explanation', e.target.value)} placeholder="Explanation" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ fontWeight: '800', color: '#4f46e5' }}>{q.questionNumber}.</span>
                      <div style={{ fontSize: '14px', flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{q.content}</div>
                        {group.groupType === 'MULTIPLE_CHOICE' && Array.isArray(q.options) && (
                          <div style={{ display: 'grid', gap: '4px', marginLeft: '12px', marginBottom: '8px' }}>
                            {q.options.map((opt, i) => (
                              <div key={i} style={{ fontSize: '13px', color: '#64748b' }}>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        <span style={{ fontWeight: '800', color: '#10b981' }}>{q.correctAnswer}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {editMode && <button onClick={() => addQuestion(sIdx, gIdx)} style={{ width: '100%', padding: '8px', border: '1px dashed #4f46e5', background: '#fff', color: '#4f46e5', borderRadius: '10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>+ ADD QUESTION</button>}
            </div>
          </div>
        ))}
        {editMode && <button onClick={() => addGroup(sIdx)} style={{ width: '100%', padding: '12px', border: '2px dashed #4f46e5', background: '#eff6ff', color: '#4f46e5', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>+ ADD QUESTION GROUP</button>}
      </div>
    </div>
  );

  const renderCompleteSetup = () => {
    const sections = paper.sections || [];
    const missing = [];
    sections.forEach(s => {
      if (!s.audioUrl) missing.push({ type: 'AUDIO', label: `Section ${s.number} Audio`, sIdx: sections.indexOf(s) });
      (s.groups || []).forEach(g => {
        if (g.groupType === 'MAP_LABELING' && !g.imageUrl) missing.push({ type: 'IMAGE', label: `Sec ${s.number} Map Image`, gIdx: s.groups.indexOf(g), sIdx: sections.indexOf(s) });
      });
    });

    if (missing.length === 0) return null;

    return (
      <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '2px solid #4f46e5', marginBottom: '32px', boxShadow: '0 10px 25px rgba(79,70,229,0.1)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '16px' }}>🏁 COMPLETE SETUP</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>These files are required before the paper can be published.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {missing.map((item, i) => (
            <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>{item.label}</span>
              <label style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                UPLOAD
                <input type="file" style={{ display: 'none' }} onChange={async e => {
                  const url = await uploadAsset(e.target.files[0], item.type.toLowerCase());
                  if (url) {
                    const next = [...edited.sections];
                    if (item.type === 'AUDIO') next[item.sIdx].audioUrl = url;
                    else next[item.sIdx].groups[item.gIdx].imageUrl = url;
                    setEdited({ ...edited, sections: next });
                    await save(); // Auto save after setup upload
                  }
                }} />
              </label>
            </div>
          ))}
        </div>
        <button onClick={() => setShowSetup(false)} style={{ marginTop: '24px', background: 'none', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Dismiss</button>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
  if (!edited) return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <h2 style={{ color: '#ef4444' }}>⚠️ Failed to load paper</h2>
      <p style={{ color: '#64748b' }}>{error || 'The paper might have been deleted or the server is unreachable.'}</p>
      <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button onClick={() => navigate('/admin/dashboard')} style={{ padding: '10px 20px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>← Dashboard</button>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Edit Paper</button>
            ) : (
              <>
                <button onClick={() => { setEdited(JSON.parse(JSON.stringify(paper))); setEditMode(false); }} style={{ padding: '10px 24px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </>
            )}
          </div>
        </div>

        {msg && <div style={{ padding: '16px', background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#166534' : '#dc2626', borderRadius: '12px', marginBottom: '24px', fontWeight: '700' }}>{msg}</div>}

        {showSetup && renderCompleteSetup()}

        {/* PAPER SETTINGS */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          {editMode ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}><label style={lbl}>Title</label><input style={inp} value={edited.title} onChange={e => setEdited({ ...edited, title: e.target.value })} /></div>
                <div style={{ width: '150px' }}><label style={lbl}>Code</label><input style={inp} value={edited.paperCode} onChange={e => setEdited({ ...edited, paperCode: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '150px' }}><label style={lbl}>Time (Min)</label><input type="number" style={inp} value={edited.timeLimitMin} onChange={e => setEdited({ ...edited, timeLimitMin: parseInt(e.target.value) })} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                  <input type="checkbox" checked={edited.practiceMode} onChange={e => setEdited({ ...edited, practiceMode: e.target.checked })} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Allow Audio Replay (Practice Mode)</span>
                </div>
              </div>
              <div><label style={lbl}>Overall Instructions</label><textarea style={{ ...inp, minHeight: '80px' }} value={edited.instructions} onChange={e => setEdited({ ...edited, instructions: e.target.value })} /></div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px' }}>{paper.title}</h1>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ background: '#4f46e5', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>{paper.testType}</span>
                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>{paper.paperCode}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#4f46e5' }}>{paper.timeLimitMin} <span style={{ fontSize: '12px', color: '#94a3b8' }}>MINS</span></div>
                  {paper.practiceMode && <span style={{ fontSize: '10px', fontWeight: '800', color: '#10b981' }}>REPLAY ENABLED</span>}
                </div>
              </div>
              <p style={{ marginTop: '24px', color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>{paper.instructions}</p>
            </div>
          )}
        </div>

        {/* SECTION CONTENT */}
        {edited.testType === 'LISTENING' && (
          <div>
            {(edited.sections || []).map((s, i) => renderListeningSection(s, i))}
            {editMode && <button onClick={addSection} style={{ width: '100%', padding: '24px', border: '3px dashed #e2e8f0', background: '#fff', color: '#94a3b8', borderRadius: '24px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>➕ ADD NEW SECTION</button>}
          </div>
        )}

        {edited.testType === 'READING' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            {(edited.passages || []).sort((a,b)=>a.passageNumber-b.passageNumber).map((psg, pIdx) => (
              <div key={pIdx} style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Passage {psg.passageNumber}</h2>
                  {editMode && <button onClick={() => { if(window.confirm('Delete passage?')) { if(psg.id) setDelPIds(p=>[...p,psg.id]); const n=[...edited.passages]; n.splice(pIdx,1); setEdited({...edited, passages:n}); } }} style={{ color: '#ef4444', border: 'none', background: 'none', fontWeight: '800', cursor: 'pointer' }}>🗑 DELETE PASSAGE</button>}
                </div>
                {editMode ? (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div><label style={lbl}>Title</label><input style={inp} value={psg.title} onChange={e => { const n=[...edited.passages]; n[pIdx].title=e.target.value; setEdited({...edited, passages:n}); }} /></div>
                    <div><label style={lbl}>Content</label><textarea style={{ ...inp, minHeight: '300px', fontFamily: 'Lora, serif', fontSize: '16px', lineHeight: '1.6' }} value={psg.text} onChange={e => { const n=[...edited.passages]; n[pIdx].text=e.target.value; setEdited({...edited, passages:n}); }} /></div>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ fontSize: '22px', fontFamily: 'Playfair Display, serif', marginBottom: '16px' }}>{psg.title}</h3>
                    <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Lora, serif', fontSize: '15px', color: '#334155', lineHeight: '1.8' }}>{psg.text}</div>
                  </div>
                )}

                <div style={{ marginTop: '32px', borderTop: '2px solid #f1f5f9', paddingTop: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#4f46e5', marginBottom: '16px' }}>QUESTIONS FOR PASSAGE {psg.passageNumber}</h4>
                  <div style={{ display: 'grid', gap: '24px' }}>
                    {(psg.groups || []).map((group, gIdx) => (
                      <div key={gIdx} style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1.5px solid #e2e8f0' }}>
                        {editMode ? (
                          <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div style={{ width: '45%' }}>
                                <label style={lbl}>Type</label>
                                <select style={inp} value={group.groupType} onChange={e => {
                                  const next = [...edited.passages]; next[pIdx].groups[gIdx].groupType = e.target.value;
                                  setEdited({ ...edited, passages: next });
                                }}>
                                  {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                              </div>
                              <div style={{ width: '45%' }}>
                                <label style={lbl}>Word Limit</label>
                                <input style={inp} value={group.wordLimit || ''} onChange={e => {
                                  const next = [...edited.passages]; next[pIdx].groups[gIdx].wordLimit = e.target.value;
                                  setEdited({ ...edited, passages: next });
                                }} placeholder="e.g. NO MORE THAN TWO WORDS" />
                              </div>
                            </div>
                            <div>
                              <label style={lbl}>Instruction</label>
                              <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={group.instruction || ''} onChange={e => {
                                const next = [...edited.passages]; next[pIdx].groups[gIdx].instruction = e.target.value;
                                setEdited({ ...edited, passages: next });
                              }} />
                            </div>
                            
                            {group.groupType === 'TABLE_COMPLETION' && (
                              <TableEditor data={group.tableData} onChange={val => {
                                const next = [...edited.passages]; next[pIdx].groups[gIdx].tableData = val;
                                setEdited({ ...edited, passages: next });
                              }} />
                            )}

                            <button onClick={() => removePassageGroup(pIdx, gIdx)} style={{ width: 'fit-content', background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>🗑 REMOVE GROUP</button>
                          </div>
                        ) : (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#4f46e5' }}>{group.instruction}</div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>LIMIT: {group.wordLimit}</div>
                          </div>
                        )}

                        <div style={{ display: 'grid', gap: '12px' }}>
                          {(group.questions || []).map((q, qIdx) => (
                            <div key={qIdx} style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              {editMode ? (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                  <div style={{ width: '30px', textAlign: 'center' }}>
                                    <input type="number" style={{ ...inp, padding: '4px', textAlign: 'center' }} value={q.questionNumber} onChange={e => updatePassageQ(pIdx, gIdx, qIdx, 'questionNumber', parseInt(e.target.value))} />
                                    <button onClick={() => removePassageQ(pIdx, gIdx, qIdx)} style={{ marginTop: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>🗑</button>
                                  </div>
                                  <div style={{ flex: 1, display: 'grid', gap: '8px' }}>
                                    <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={q.content} onChange={e => updatePassageQ(pIdx, gIdx, qIdx, 'content', e.target.value)} placeholder="Question content..." />
                                    {group.groupType === 'MULTIPLE_CHOICE' ? (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {['A', 'B', 'C', 'D'].map((letter, i) => {
                                          const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? q.options.split('\n') : ['', '', '', '']);
                                          return (
                                            <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#4f46e5' }}>{letter}.</span>
                                              <input 
                                                style={{ ...inp, padding: '6px 10px' }} 
                                                value={opts[i]?.replace(/^[A-D][\.\)]\s*/, '') || ''} 
                                                onChange={e => {
                                                  const next = [...opts];
                                                  for(let j=0; j<4; j++) if(!next[j]) next[j] = '';
                                                  next[i] = `${letter}. ${e.target.value}`;
                                                  updatePassageQ(pIdx, gIdx, qIdx, 'options', next);
                                                }} 
                                                placeholder={`Option ${letter}`}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (group.groupType === 'MATCHING' || group.groupType === 'HEADING_MATCHING') && (
                                      <input style={inp} value={q.options || ''} onChange={e => updatePassageQ(pIdx, gIdx, qIdx, 'options', e.target.value)} placeholder="Options (A. Text, B. Text...)" />
                                    )}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                      <input style={{ ...inp, flex: 1 }} value={q.correctAnswer} onChange={e => updatePassageQ(pIdx, gIdx, qIdx, 'correctAnswer', e.target.value)} placeholder="Correct Answer" />
                                      <input style={{ ...inp, flex: 1 }} value={q.explanation || ''} onChange={e => updatePassageQ(pIdx, gIdx, qIdx, 'explanation', e.target.value)} placeholder="Explanation" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <span style={{ fontWeight: '800', color: '#4f46e5' }}>{q.questionNumber}.</span>
                                  <div style={{ fontSize: '14px' }}>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{q.content}</div>
                                    {group.groupType === 'MULTIPLE_CHOICE' && Array.isArray(q.options) && (
                                      <div style={{ display: 'grid', gap: '4px', marginLeft: '12px', marginBottom: '8px' }}>
                                        {q.options.map((opt, i) => (
                                          <div key={i} style={{ fontSize: '13px', color: '#64748b' }}>
                                            {opt}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <div style={{ fontWeight: '700', color: '#10b981' }}>{q.correctAnswer}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {editMode && <button onClick={() => addPassageQuestion(pIdx, gIdx)} style={{ width: '100%', padding: '8px', border: '1px dashed #4f46e5', background: '#fff', color: '#4f46e5', borderRadius: '10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>+ ADD QUESTION</button>}
                        </div>
                      </div>
                    ))}
                    {editMode && <button onClick={() => addPassageGroup(pIdx)} style={{ width: '100%', padding: '12px', border: '2px dashed #4f46e5', background: '#eff6ff', color: '#4f46e5', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>+ ADD QUESTION GROUP</button>}
                  </div>
                </div>
              </div>
            ))}
            {editMode && <button onClick={addPassage} style={{ width: '100%', padding: '24px', border: '3px dashed #e2e8f0', background: '#fff', color: '#94a3b8', borderRadius: '24px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>➕ ADD NEW PASSAGE</button>}
          </div>
        )}

        {edited.testType === 'WRITING' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            {(edited.writingTasks || []).sort((a,b)=>a.taskNumber-b.taskNumber).map((task, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Task {task.taskNumber}</h2>
                  {editMode && <button onClick={() => removeWT(idx)} style={{ color: '#ef4444', border: 'none', background: 'none', fontWeight: '800', cursor: 'pointer' }}>🗑 DELETE TASK</button>}
                </div>
                {editMode ? (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                      <label style={lbl}>Writing Prompt</label>
                      <textarea style={{ ...inp, minHeight: '150px' }} value={task.prompt} onChange={e => updateWT(idx, 'prompt', e.target.value)} />
                    </div>
                    {task.taskNumber === 1 && (
                      <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                          <label style={lbl}>Chart/Image</label>
                          {task.chartImageUrl && <img src={getFullUrl(task.chartImageUrl)} style={{ maxHeight: '200px', display: 'block', marginBottom: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />}
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#4f46e5', color: '#fff', borderRadius: '10px', cursor:'pointer', fontSize: '13px', fontWeight: '800' }}>
                            {task.chartImageUrl ? '🔄 REPLACE IMAGE' : '🖼️ UPLOAD CHART'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                              const url = await uploadAsset(e.target.files[0], 'image');
                              if (url) updateWT(idx, 'chartImageUrl', url);
                            }} />
                          </label>
                        </div>
                        <div>
                          <label style={lbl}>Chart/Image Description (Placeholder Text)</label>
                          <textarea style={{ ...inp, minHeight: '60px' }} value={task.chartDescription || ''} onChange={e => updateWT(idx, 'chartDescription', e.target.value)} placeholder="e.g. A line graph showing the population growth in..." />
                        </div>
                        <div>
                          <label style={lbl}>Task 1 Table (Optional)</label>
                          <TableEditor data={task.tableData} onChange={val => updateWT(idx, 'tableData', val)} />
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div>
                        <label style={lbl}>Min Words</label>
                        <input type="number" style={{ ...inp, width: '120px' }} value={task.minWords} onChange={e => updateWT(idx, 'minWords', parseInt(e.target.value))} />
                      </div>
                      <div>
                        <label style={lbl}>Time (Minutes)</label>
                        <input type="number" style={{ ...inp, width: '120px' }} value={task.timeMinutes || (task.taskNumber===1?20:40)} onChange={e => updateWT(idx, 'timeMinutes', parseInt(e.target.value))} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', color: '#334155', lineHeight: '1.8', marginBottom: '20px' }}>{task.prompt}</div>
                    {task.chartImageUrl && <img src={getFullUrl(task.chartImageUrl)} style={{ maxWidth: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }} />}
                    {task.taskNumber === 1 && task.tableData && (
                      <div style={{ marginTop: '20px' }}>
                         <TableEditor data={task.tableData} onChange={() => {}} />
                      </div>
                    )}
                    <div style={{ marginTop: '20px', fontSize: '12px', fontWeight: '800', color: '#94a3b8' }}>WORD LIMIT: {task.minWords}+ WORDS</div>
                  </div>
                )}
              </div>
            ))}
            {editMode && (edited.writingTasks?.length || 0) < 2 && <button onClick={addWritingTask} style={{ width: '100%', padding: '24px', border: '3px dashed #e2e8f0', background: '#fff', color: '#94a3b8', borderRadius: '24px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>➕ ADD WRITING TASK</button>}
          </div>
        )}

        {edited.testType === 'SPEAKING' && (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>Speaking paper editor is coming soon. Use AI Import for speaking papers for now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

