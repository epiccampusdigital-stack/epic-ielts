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

const TEST_TYPE_CHIP = {
  READING: { bg: '#ede9fe', color: '#5b21b6' },
  LISTENING: { bg: '#dbeafe', color: '#1e40af' },
  WRITING: { bg: '#fce7f3', color: '#9d174d' },
  SPEAKING: { bg: '#d1fae5', color: '#065f46' },
};

const statusChipStyle = (bg, color) => ({
  background: bg,
  color,
  fontSize: '11px',
  fontWeight: 800,
  padding: '4px 10px',
  borderRadius: '20px',
  letterSpacing: '0.5px',
});

const parseQuestionOptions = (options) => {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') return options.split('\n').filter(Boolean);
  return [];
};

const optionMatchesAnswer = (opt, correctAnswer) => {
  const norm = (s) => String(s || '').trim().toLowerCase().replace(/^[a-d][.)]\s*/i, '');
  const o = norm(opt);
  const c = norm(correctAnswer);
  if (!o || !c) return false;
  if (o === c) return true;
  const letter = o.charAt(0);
  if (/^[a-d]$/.test(c) && letter === c) return true;
  return o.includes(c) || c.includes(o);
};

const questionRangeLabel = (questions) => {
  const nums = (questions || []).map(q => q.questionNumber).filter(n => n != null).sort((a, b) => a - b);
  if (!nums.length) return 'QUESTIONS —';
  if (nums.length === 1) return `QUESTIONS ${nums[0]}`;
  return `QUESTIONS ${nums[0]}–${nums[nums.length - 1]}`;
};

const uniqueQuestionTypes = (questions) => {
  const types = [...new Set((questions || []).map(q => q.questionType).filter(Boolean))];
  return types.length ? types.join(' · ') : '';
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
  const [collapsedPassages, setCollapsedPassages] = useState(new Set());
  const [expandedPassages, setExpandedPassages] = useState(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [hoveredQuestion, setHoveredQuestion] = useState(null);

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

  const toggleInSet = (setter, key) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const countAllQuestions = () => {
    if (!edited) return 0;
    if (edited.testType === 'READING') {
      const hasGroups = edited.passages?.some(p => p.groups?.length > 0);
      if (hasGroups) {
        return (edited.passages || []).flatMap(p => (p.groups || []).flatMap(g => g.questions || [])).length;
      }
      return (edited.questions || []).length;
    }
    if (edited.testType === 'LISTENING') {
      return (edited.sections || []).flatMap(s => (s.groups || []).flatMap(g => g.questions || [])).length;
    }
    return (edited.questions || []).length;
  };

  const readingIsFlatFormat = edited?.testType === 'READING' &&
    (edited.questions?.length > 0) &&
    !edited.passages?.some(p => p.groups?.length > 0);

  const paperIsActive = paper?.status === 'PUBLISHED';

  const backBtnStyle = {
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    color: '#475569',
    borderRadius: '10px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  };

  const renderActionButtons = () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button type="button" onClick={() => navigate('/admin/dashboard')} style={backBtnStyle}>← Back</button>
      {!editMode ? (
        <button type="button" onClick={() => setEditMode(true)} style={{ ...backBtnStyle, background: '#f59e0b', color: '#1a1a2e', border: 'none', fontWeight: 700 }}>Edit Mode</button>
      ) : (
        <>
          <button type="button" onClick={() => { setEdited(JSON.parse(JSON.stringify(paper))); setEditMode(false); }} style={backBtnStyle}>Cancel</button>
          <button type="button" onClick={save} disabled={saving} style={{ background: '#4f46e5', color: '#fff', fontWeight: 700, borderRadius: '10px', padding: '8px 18px', fontSize: '13px', border: 'none', cursor: saving ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif' }}>{saving ? 'Saving...' : 'Save'}</button>
        </>
      )}
    </div>
  );

  const renderNavyHeader = ({ title, subtitle, count, collapseKey, headerRight }) => {
    const collapsed = collapsedPassages.has(collapseKey);
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2b55 100%)',
        borderRadius: collapsed ? '20px' : '20px 20px 0 0',
        padding: '20px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '18px', fontWeight: 700 }}>{title}</div>
          {subtitle && (
            <div style={{ color: '#a5b4fc', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>{subtitle}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {headerRight}
          <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px' }}>
            {count} question{count !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => toggleInSet(setCollapsedPassages, collapseKey)}
            style={{ color: '#fff', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}
          >
            {collapsed ? '▸' : '▾'}
          </button>
        </div>
      </div>
    );
  };

  const renderPassageTextBlock = (text, textKey) => {
    if (!text) return null;
    const expanded = expandedPassages.has(textKey);
    return (
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{
          fontFamily: 'Lora, serif',
          fontSize: '14px',
          color: '#475569',
          lineHeight: '1.8',
          whiteSpace: 'pre-wrap',
          maxHeight: expanded ? 'none' : '96px',
          overflow: expanded ? 'visible' : 'hidden',
        }}>
          {text}
        </div>
        <button
          type="button"
          onClick={() => toggleInSet(setExpandedPassages, textKey)}
          style={{ color: '#4f46e5', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '8px 0', display: 'block', background: 'none', border: 'none', fontFamily: 'Inter, sans-serif' }}
        >
          {expanded ? 'Hide passage ↑' : 'Show full passage ↓'}
        </button>
      </div>
    );
  };

  const renderQuestionsSectionHeader = (label, total, shown) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 28px' }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Showing {shown} of {total}</div>
    </div>
  );

  const renderReadOnlyQuestionCard = (q, groupType, cardKey) => {
    const qType = groupType || q.questionType;
    const opts = parseQuestionOptions(q.options);
    const isMC = qType === 'MULTIPLE_CHOICE';
    const isTFNG = qType === 'TRUE_FALSE_NOT_GIVEN' || qType === 'YES_NO_NOT_GIVEN';
    const tfngOptions = qType === 'YES_NO_NOT_GIVEN'
      ? ['Yes', 'No', 'Not Given']
      : ['True', 'False', 'Not Given'];
    const hovered = hoveredQuestion === cardKey;

    return (
      <div
        key={cardKey}
        onMouseEnter={() => setHoveredQuestion(cardKey)}
        onMouseLeave={() => setHoveredQuestion(null)}
        style={{
          background: hovered ? '#fafbff' : '#f8fafc',
          border: `1px solid ${hovered ? '#c7d2fe' : '#e2e8f0'}`,
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '8px', background: '#4f46e5', color: '#fff',
          fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {q.questionNumber}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>{qType}</div>
          <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500, lineHeight: '1.5', marginBottom: '8px' }}>{q.content}</div>

          {isMC && opts.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              {opts.map((opt, i) => {
                const correct = optionMatchesAnswer(opt, q.correctAnswer);
                return (
                  <div key={i} style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginBottom: '2px',
                    background: correct ? '#dcfce7' : 'transparent',
                    color: correct ? '#166534' : '#64748b',
                    fontWeight: correct ? 700 : 400,
                  }}>
                    {opt}
                  </div>
                );
              })}
            </div>
          )}

          {isTFNG && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {tfngOptions.map(opt => {
                const correct = optionMatchesAnswer(opt, q.correctAnswer);
                return (
                  <span key={opt} style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: correct ? '#dcfce7' : 'transparent',
                    color: correct ? '#166534' : '#64748b',
                    fontWeight: correct ? 700 : 400,
                    border: correct ? 'none' : '1px solid #e2e8f0',
                  }}>
                    {opt}
                  </span>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Correct answer</span>
            <span style={{ background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', fontSize: '12px' }}>
              {q.correctAnswer}
            </span>
          </div>
          {q.explanation && (
            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>{q.explanation}</div>
          )}
        </div>
      </div>
    );
  };

  const renderQuestionListWithLimit = (questions, groupType, expandKey, labelPrefix, number) => {
    const sorted = [...questions].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
    const showAll = expandedQuestions.has(expandKey);
    const visible = showAll ? sorted : sorted.slice(0, 5);
    const remaining = sorted.length - visible.length;

    return (
      <div style={{ padding: '0 28px 28px' }}>
        {renderQuestionsSectionHeader(`${labelPrefix} ${number}`, sorted.length, visible.length)}
        <div style={{ display: 'grid', gap: '12px' }}>
          {visible.map((q, qIdx) => renderReadOnlyQuestionCard(q, groupType, `${expandKey}-q-${q.id || qIdx}`))}
        </div>
        {!showAll && remaining > 0 && (
          <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>+ {remaining} more question{remaining !== 1 ? 's' : ''}</span>
            <button
              type="button"
              onClick={() => toggleInSet(setExpandedQuestions, expandKey)}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Show all
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStatsRow = () => {
    const totalQ = countAllQuestions();
    const passageOrSectionCount = edited.testType === 'LISTENING'
      ? (edited.sections?.length || 0)
      : (edited.passages?.length || 0);
    const passageLabel = edited.testType === 'LISTENING' ? 'Sections' : 'Passages';

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Questions', value: totalQ, color: '#4f46e5' },
          { label: passageLabel, value: passageOrSectionCount, color: '#1e293b' },
          { label: 'Time Limit', value: `${edited.timeLimitMin || paper?.timeLimitMin || '—'} min`, color: '#1e293b' },
          { label: 'Status', value: paperIsActive ? 'Active' : 'Draft', color: paperIsActive ? '#10b981' : '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderListeningSection = (section, sIdx) => {
    const collapseKey = `listening-${section.number ?? sIdx}`;
    const collapsed = collapsedPassages.has(collapseKey);
    const sectionQuestions = (section.groups || []).flatMap(g => g.questions || []);
    const subtitle = questionRangeLabel(sectionQuestions);

    return (
    <div key={sIdx} style={{
      background: '#fff',
      borderRadius: collapsed ? '20px' : '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      marginBottom: '32px',
      overflow: 'hidden',
    }}>
      {renderNavyHeader({
        title: `Section ${section.number}${section.description ? ` — ${section.description}` : ''}`,
        subtitle,
        count: sectionQuestions.length,
        collapseKey,
        headerRight: editMode ? (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
            {section.audioUrl ? '🎵 Replace' : '🎤 Upload'}
            <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={async e => {
              const url = await uploadAsset(e.target.files[0], 'audio');
              if (url) {
                const next = [...edited.sections]; next[sIdx].audioUrl = url;
                setEdited({ ...edited, sections: next });
                setMsg('✅ Section audio uploaded');
              }
            }} />
          </label>
        ) : null,
      })}

      {!collapsed && (
      <div style={{ padding: '24px 28px' }}>
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
                  <textarea rows={4} style={{ ...inp, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} value={group.instruction || ''} onChange={e => {
                    const next = [...edited.sections]; next[sIdx].groups[gIdx].instruction = e.target.value;
                    setEdited({ ...edited, sections: next });
                  }} ></textarea>
                </div>

                {(group.groupType === 'MAP_LABELING' || group.groupType === 'TABLE_COMPLETION') && (
                  <div>
                    <label style={lbl}>{group.groupType === 'MAP_LABELING' ? 'Map Image' : 'Optional Diagram'}</label>
                    {group.imageUrl && <img src={getFullUrl(group.imageUrl)} style={{ maxHeight: '150px', display: 'block', marginBottom: '10px', borderRadius: '8px' }} alt="" />}
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

                <button type="button" onClick={() => removeGroup(sIdx, gIdx)} style={{ width: 'fit-content', background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>🗑 REMOVE GROUP</button>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#4f46e5' }}>{group.instruction}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>LIMIT: {group.wordLimit}</div>
                {group.imageUrl && <img src={getFullUrl(group.imageUrl)} style={{ maxWidth: '100%', borderRadius: '12px', marginTop: '12px', border: '1px solid #e2e8f0' }} alt="" />}
              </div>
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              {(group.questions || []).map((q, qIdx) => (
                <div key={qIdx}>
                  {editMode ? (
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '30px', textAlign: 'center' }}>
                        <input type="number" style={{ ...inp, padding: '4px', textAlign: 'center' }} value={q.questionNumber} onChange={e => updateQ(sIdx, gIdx, qIdx, 'questionNumber', parseInt(e.target.value))} />
                        <button type="button" onClick={() => removeQ(sIdx, gIdx, qIdx)} style={{ marginTop: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>🗑</button>
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
                </div>
                  ) : (
                    renderReadOnlyQuestionCard(q, group.groupType, `listen-${sIdx}-${gIdx}-${qIdx}`)
                  )}
                </div>
              ))}
              {editMode && <button type="button" onClick={() => addQuestion(sIdx, gIdx)} style={{ width: '100%', padding: '8px', border: '1px dashed #4f46e5', background: '#fff', color: '#4f46e5', borderRadius: '10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>+ ADD QUESTION</button>}
            </div>
          </div>
        ))}
        {editMode && <button type="button" onClick={() => addGroup(sIdx)} style={{ width: '100%', padding: '12px', border: '2px dashed #4f46e5', background: '#eff6ff', color: '#4f46e5', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>+ ADD QUESTION GROUP</button>}
      </div>
      </div>
      )}
    </div>
    );
  };

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
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px 80px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', color: '#1a1a2e', marginBottom: '8px', marginTop: 0, fontWeight: 700 }}>
              {editMode ? edited.title : paper.title}
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {(() => {
                const tt = paper.testType || edited.testType;
                const chip = TEST_TYPE_CHIP[tt] || { bg: '#f1f5f9', color: '#64748b' };
                return <span style={statusChipStyle(chip.bg, chip.color)}>{tt}</span>;
              })()}
              <span style={statusChipStyle('#ecfdf5', '#065f46')}>{countAllQuestions()} questions</span>
              {(edited.passages?.length > 0 || edited.sections?.length > 0) && (
                <span style={statusChipStyle('#f0f9ff', '#0c4a6e')}>
                  {edited.testType === 'LISTENING'
                    ? `${edited.sections?.length || 0} sections`
                    : `${edited.passages?.length || 0} passages`}
                </span>
              )}
              {readingIsFlatFormat && (
                <span style={statusChipStyle('#fef3c7', '#92400e')}>Legacy format</span>
              )}
              <span style={statusChipStyle('#f1f5f9', '#64748b')}>{paper.paperCode}</span>
            </div>
          </div>
          {renderActionButtons()}
        </div>

        {msg && <div style={{ padding: '16px', background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#166534' : '#dc2626', borderRadius: '12px', marginBottom: '24px', fontWeight: '700' }}>{msg}</div>}

        {renderStatsRow()}

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
              <p style={{ marginTop: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>{paper.instructions}</p>
              {paper.practiceMode && <span style={{ fontSize: '10px', fontWeight: '800', color: '#10b981' }}>REPLAY ENABLED</span>}
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

        {edited.testType === 'READING' && (() => {
          const hasGroups = edited.passages?.some(p => p.groups?.length > 0);
          const hasFlatQuestions = edited.questions?.length > 0;
          const isFlatFormat = hasFlatQuestions && !hasGroups;

          if (isFlatFormat) {
            const byPassage = {};
            (edited.questions || []).forEach(q => {
              const pn = q.passageNumber || 1;
              if (!byPassage[pn]) byPassage[pn] = [];
              byPassage[pn].push(q);
            });
            const passageNums = Object.keys(byPassage).map(Number).sort((a, b) => a - b);
            const passageByNum = Object.fromEntries(
              (edited.passages || []).map(p => [p.passageNumber, p])
            );

            return (
              <div style={{ display: 'grid', gap: '32px' }}>
                {passageNums.map(pn => {
                  const psg = passageByNum[pn];
                  const questions = byPassage[pn].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
                  const collapseKey = `reading-flat-${pn}`;
                  const collapsed = collapsedPassages.has(collapseKey);
                  const subtitle = `${questionRangeLabel(questions)}  ·  ${uniqueQuestionTypes(questions)}`;

                  return (
                    <div key={pn} style={{
                      background: '#fff',
                      borderRadius: collapsed ? '20px' : '20px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                    }}>
                      {renderNavyHeader({
                        title: `Passage ${pn}${psg?.title ? ` — ${psg.title}` : ''}`,
                        subtitle,
                        count: questions.length,
                        collapseKey,
                      })}
                      {!collapsed && (
                        <>
                          {!editMode && psg?.text && renderPassageTextBlock(psg.text, `flat-text-${pn}`)}
                          {!editMode && renderQuestionListWithLimit(questions, null, `flat-q-${pn}`, 'QUESTIONS FOR PASSAGE', pn)}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
          <div style={{ display: 'grid', gap: '32px' }}>
            {(edited.passages || []).sort((a,b)=>a.passageNumber-b.passageNumber).map((psg, pIdx) => {
              const collapseKey = `reading-grouped-${psg.passageNumber ?? pIdx}`;
              const collapsed = collapsedPassages.has(collapseKey);
              const passageQuestions = (psg.groups || []).flatMap(g => g.questions || []);
              const subtitle = `${questionRangeLabel(passageQuestions)}  ·  ${uniqueQuestionTypes(passageQuestions)}`;

              return (
              <div key={pIdx} style={{
                background: '#fff',
                borderRadius: collapsed ? '20px' : '20px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}>
                {renderNavyHeader({
                  title: `Passage ${psg.passageNumber}${psg.title ? ` — ${psg.title}` : ''}`,
                  subtitle,
                  count: passageQuestions.length,
                  collapseKey,
                  headerRight: editMode ? (
                    <button type="button" onClick={() => { if(window.confirm('Delete passage?')) { if(psg.id) setDelPIds(p=>[...p,psg.id]); const n=[...edited.passages]; n.splice(pIdx,1); setEdited({...edited, passages:n}); } }} style={{ color: '#fca5a5', border: 'none', background: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }}>🗑 Delete</button>
                  ) : null,
                })}
                {!collapsed && (
                <>
                {editMode ? (
                  <div style={{ display: 'grid', gap: '16px', padding: '24px 28px' }}>
                    <div><label style={lbl}>Title</label><input style={inp} value={psg.title} onChange={e => { const n=[...edited.passages]; n[pIdx].title=e.target.value; setEdited({...edited, passages:n}); }} /></div>
                    <div><label style={lbl}>Content</label><textarea style={{ ...inp, minHeight: '300px', fontFamily: 'Lora, serif', fontSize: '16px', lineHeight: '1.6' }} value={psg.text} onChange={e => { const n=[...edited.passages]; n[pIdx].text=e.target.value; setEdited({...edited, passages:n}); }} /></div>
                  </div>
                ) : (
                  renderPassageTextBlock(psg.text, `grouped-text-${psg.passageNumber}`)
                )}

                {editMode ? (
                <div style={{ marginTop: '0', borderTop: '2px solid #f1f5f9', padding: '24px 28px' }}>
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
                              <textarea rows={4} style={{ ...inp, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} value={group.instruction || ''} onChange={e => {
                                const next = [...edited.passages]; next[pIdx].groups[gIdx].instruction = e.target.value;
                                setEdited({ ...edited, passages: next });
                              }} ></textarea>
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
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                  <div style={{ width: '30px', textAlign: 'center' }}>
                                    <input type="number" style={{ ...inp, padding: '4px', textAlign: 'center' }} value={q.questionNumber} onChange={e => updatePassageQ(pIdx, gIdx, qIdx, 'questionNumber', parseInt(e.target.value))} />
                                    <button type="button" onClick={() => removePassageQ(pIdx, gIdx, qIdx)} style={{ marginTop: '8px', border: 'none', background: 'none', cursor: 'pointer' }}>🗑</button>
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
                            </div>
                          ))}
                          <button type="button" onClick={() => addPassageQuestion(pIdx, gIdx)} style={{ width: '100%', padding: '8px', border: '1px dashed #4f46e5', background: '#fff', color: '#4f46e5', borderRadius: '10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>+ ADD QUESTION</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addPassageGroup(pIdx)} style={{ width: '100%', padding: '12px', border: '2px dashed #4f46e5', background: '#eff6ff', color: '#4f46e5', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>+ ADD QUESTION GROUP</button>
                  </div>
                </div>
                ) : (
                  <>
                    {(psg.groups || []).map((group, gIdx) => (
                      (group.instruction || group.wordLimit) ? (
                        <div key={gIdx} style={{ padding: '12px 28px 0', fontSize: '13px', color: '#64748b' }}>
                          <div style={{ fontWeight: 700, color: '#4f46e5' }}>{group.instruction}</div>
                          {group.wordLimit && <div style={{ fontSize: '11px', marginTop: '2px' }}>LIMIT: {group.wordLimit}</div>}
                        </div>
                      ) : null
                    ))}
                    {renderQuestionListWithLimit(passageQuestions, null, `grouped-q-${psg.passageNumber}`, 'QUESTIONS FOR PASSAGE', psg.passageNumber)}
                  </>
                )}
                </>
                )}
              </div>
              );
            })}
            {editMode && <button onClick={addPassage} style={{ width: '100%', padding: '24px', border: '3px dashed #e2e8f0', background: '#fff', color: '#94a3b8', borderRadius: '24px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>➕ ADD NEW PASSAGE</button>}
          </div>
          );
        })()}

        {edited.testType === 'WRITING' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            {(edited.writingTasks || []).sort((a,b)=>a.taskNumber-b.taskNumber).map((task, idx) => {
              const taskTitle = task.taskNumber === 1
                ? `Task 1 — ${task.tableData ? 'Report' : 'Chart / Graph'}`
                : 'Task 2 — Essay';
              return (
              <div key={idx} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2b55 100%)',
                  borderRadius: '20px 20px 0 0',
                  padding: '20px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '18px', fontWeight: 700 }}>{taskTitle}</div>
                  {editMode && <button type="button" onClick={() => removeWT(idx)} style={{ color: '#fca5a5', border: 'none', background: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '12px' }}>🗑 Delete</button>}
                </div>
                <div style={{ padding: '32px' }}>
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
              </div>
              );
            })}
            {editMode && (edited.writingTasks?.length || 0) < 2 && <button onClick={addWritingTask} style={{ width: '100%', padding: '24px', border: '3px dashed #e2e8f0', background: '#fff', color: '#94a3b8', borderRadius: '24px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>➕ ADD WRITING TASK</button>}
          </div>
        )}

        {edited.testType === 'SPEAKING' && (
          <div style={{ display: 'grid', gap: '32px' }}>

            {[1, 2, 3].map(partNum => {
              const partQuestions = (edited.questions || [])
                .filter(q => (q.passageNumber || q.sectionNumber || 1) === partNum)
                .filter(q => q.questionType !== 'SPEAKING_CUE_CARD')
                .sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));

              const cueCard = partNum === 2
                ? (edited.questions || []).find(q => q.questionType === 'SPEAKING_CUE_CARD')
                : null;

              const partMeta = {
                1: { title: 'Part 1 — Introduction & Interview', color: '#2563eb', icon: '💬', desc: 'Familiar topics — home, work, hobbies, daily life' },
                2: { title: 'Part 2 — Individual Long Turn', color: '#7c3aed', icon: '🎯', desc: 'Cue card topic — student speaks for 1-2 minutes' },
                3: { title: 'Part 3 — Two-way Discussion', color: '#0891b2', icon: '🌐', desc: 'Abstract discussion linked to Part 2 topic' }
              }[partNum];

              return (
                <div key={partNum} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

                  <div style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2b55 100%)',
                    borderRadius: '20px 20px 0 0',
                    padding: '20px 28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '18px', fontWeight: 700 }}>
                        Part {partNum} — {partMeta.title.split('—')[1]?.trim() || partMeta.title}
                      </div>
                      <div style={{ color: '#a5b4fc', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>{partMeta.desc}</div>
                    </div>
                    <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px' }}>
                      {partQuestions.length} question{partQuestions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div style={{ padding: '24px' }}>
                  {/* Cue card for Part 2 */}
                  {partNum === 2 && (
                    <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#7c3aed', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📋 Cue Card</div>
                      {cueCard ? (
                        <div>
                          <textarea
                            value={cueCard.content || ''}
                            onChange={e => {
                              const updated = (edited.questions || []).map(q =>
                                q.id === cueCard.id ? { ...q, content: e.target.value } : q
                              );
                              setEdited({ ...edited, questions: updated });
                            }}
                            style={{ width: '100%', minHeight: '100px', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', background: 'white' }}
                            placeholder="Describe a place you enjoy visiting..."
                          />
                          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Include the topic and bullet points in this field. Use line breaks to separate bullet points.</p>
                        </div>
                      ) : (
                        <div style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
                          No cue card found. Import the paper via JSON to add a cue card automatically.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Questions list */}
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {partQuestions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', background: '#f8fafc', borderRadius: '8px' }}>
                        No questions yet for Part {partNum}
                      </div>
                    ) : (
                      partQuestions.map((q, idx) => (
                        <div key={q.id || idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: partMeta.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                            {q.questionNumber || idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <textarea
                              value={q.content || ''}
                              onChange={e => {
                                const updated = (edited.questions || []).map(question =>
                                  question.id === q.id ? { ...question, content: e.target.value } : question
                                );
                                setEdited({ ...edited, questions: updated });
                              }}
                              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '60px', background: 'white' }}
                              placeholder="Enter speaking question..."
                            />
                            {q.explanation && (
                              <div style={{ fontSize: '11px', color: '#7c3aed', marginTop: '4px', fontStyle: 'italic' }}>
                                Band descriptor: {q.explanation}
                              </div>
                            )}
                          </div>
                          {editMode && (
                            <button
                              onClick={() => {
                                if (window.confirm('Remove this question?')) {
                                  if (q.id && !String(q.id).startsWith('temp_')) {
                                    setDelQIds(p => [...p, q.id]);
                                  }
                                  const updated = (edited.questions || []).filter(question => question.id !== q.id);
                                  setEdited({ ...edited, questions: updated });
                                }
                              }}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', padding: '4px', flexShrink: 0 }}
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add question button — edit mode only */}
                  {editMode && (
                    <button
                      onClick={() => {
                        const newQ = {
                          id: `temp_${Date.now()}`,
                          questionNumber: partQuestions.length + 1,
                          content: '',
                          correctAnswer: '',
                          explanation: '',
                          questionType: 'SPEAKING',
                          passageNumber: partNum,
                        };
                        setEdited({ ...edited, questions: [...(edited.questions || []), newQ] });
                      }}
                      style={{ marginTop: '12px', padding: '8px 16px', background: `${partMeta.color}15`, color: partMeta.color, border: `1px solid ${partMeta.color}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      + Add Question to Part {partNum}
                    </button>
                  )}
                  </div>
                </div>
              );
            })}

            {/* Save note */}
            <div style={{ background: '#fef9c3', border: '1px solid #fcd34d', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#92400e' }}>
              💡 After editing questions, click <strong>Save Changes</strong> at the top of the page to save your edits.
            </div>
          </div>
        )}

        {/* STICKY BOTTOM ACTION BAR */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          background: '#fff',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '32px',
          borderRadius: '14px',
          boxShadow: '0 -4px 12px rgba(15,23,42,0.06)',
        }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {editMode
              ? 'Edit mode active · Don\'t forget to save'
              : 'Read-only view · Enable Edit Mode to make changes'}
          </span>
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
}

