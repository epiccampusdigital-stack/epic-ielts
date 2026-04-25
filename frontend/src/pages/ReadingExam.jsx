import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

const api = () => ({
   headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
   }
});

export default function ReadingExam() {
   const params = useParams();
   const attemptId = params.attemptId || params.id;

   const [paper, setPaper] = useState(null);
   const [questions, setQuestions] = useState([]);
   const [answers, setAnswers] = useState({});
   const [timeLeft, setTimeLeft] = useState(null);
   const [totalTime, setTotalTime] = useState(0);
   const [currentPassage, setCurrentPassage] = useState(1);
   const [questionPage, setQuestionPage] = useState(0);
   const [submitting, setSubmitting] = useState(false);
   const [showWarning, setShowWarning] = useState(false);

   const navigate = useNavigate();
   const timerRef = useRef(null);

   useEffect(() => {
      const loadExam = async () => {
         try {
            const res = await axios.get(
               `${API_URL}/api/attempts/${attemptId}`,
               api()
            );

            const loadedPaper = res.data.paper;
            const loadedQuestions = loadedPaper?.questions || [];

            setPaper(loadedPaper);
            setQuestions(loadedQuestions);
            const timeInSeconds = (loadedPaper?.timeLimitMin || 60) * 60;
            setTimeLeft(timeInSeconds);
            setTotalTime(timeInSeconds);
         } catch (err) {
            console.error('Load exam error:', err);
            alert('Failed to load exam. Please go back and start again.');
            navigate('/student/dashboard');
         }
      };

      loadExam();
   }, [attemptId, navigate]);

   useEffect(() => {
      if (timeLeft === null || submitting) return;

      timerRef.current = setInterval(() => {
         setTimeLeft((t) => {
            if (t <= 60 && t > 59) setShowWarning(true);

            if (t <= 1) {
               clearInterval(timerRef.current);
               handleEnd(true);
               return 0;
            }

            return t - 1;
         });
      }, 1000);

      return () => clearInterval(timerRef.current);
   }, [timeLeft === null, submitting]);

   const splitPassageText = (text) => {
      const full = text || '';
      const p1Start = full.indexOf('PASSAGE 1:');
      const p2Start = full.indexOf('PASSAGE 2:');
      const p3Start = full.indexOf('PASSAGE 3:');

      if (p1Start === -1) {
         return { 1: full, 2: full, 3: full };
      }

      return {
         1: full.slice(p1Start, p2Start > -1 ? p2Start : undefined).trim(),
         2: p2Start > -1 ? full.slice(p2Start, p3Start > -1 ? p3Start : undefined).trim() : '',
         3: p3Start > -1 ? full.slice(p3Start).trim() : ''
      };
   };

   const getQuestionType = (type) => String(type || '').toUpperCase();

   const getGroupMeta = (paperCode, startNo, endNo, questionType) => {
      const code = String(paperCode || '').replace(/\D/g, '');
      const type = getQuestionType(questionType);

      const isPaper002 = code === '002';

      if (startNo >= 1 && endNo <= 5) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: 'Do the following statements agree with the information given in the passage?',
            note: 'Write: TRUE / FALSE / NOT GIVEN'
         };
      }

      if (startNo >= 6 && endNo <= 10) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: 'Choose the correct letter, A–D.',
            note: ''
         };
      }

      if (startNo >= 11 && endNo <= 15) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: isPaper002
               ? 'Do the following statements agree with the information given in the passage?'
               : 'Do the following statements agree with the passage?',
            note: 'Write: TRUE / FALSE / NOT GIVEN'
         };
      }

      if (startNo >= 16 && endNo <= 20) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: 'Choose the correct letter, A–D.',
            note: ''
         };
      }

      if (startNo >= 21 && endNo <= 25) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: isPaper002
               ? 'The passage has six paragraphs (A–F). Match each statement with the correct paragraph.'
               : 'Match each statement with the correct paragraph (A–E).',
            note: '',
            matchingOptions: isPaper002
               ? ['A. Paragraph 1', 'B. Paragraph 2', 'C. Paragraph 3', 'D. Paragraph 4', 'E. Paragraph 5', 'F. Paragraph 6']
               : ['A. Paragraph 1', 'B. Paragraph 2', 'C. Paragraph 3', 'D. Paragraph 4', 'E. Paragraph 5']
         };
      }

      if (startNo >= 26 && endNo <= 30) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: isPaper002
               ? 'Answer the questions using NO MORE THAN THREE WORDS.'
               : 'Answer the questions using NO MORE THAN TWO WORDS.',
            note: ''
         };
      }

      if (startNo >= 31 && endNo <= 35) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: isPaper002
               ? 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.'
               : 'Complete the summary using NO MORE THAN TWO WORDS.',
            note: ''
         };
      }

      if (startNo >= 36 && endNo <= 40) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: isPaper002
               ? 'Answer the questions using NO MORE THAN THREE WORDS.'
               : 'Answer the questions using NO MORE THAN TWO WORDS.',
            note: ''
         };
      }

      if (['TFNG', 'TRUE_FALSE_NOT_GIVEN'].includes(type)) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: 'Do the following statements agree with the information given in the passage?',
            note: 'Write: TRUE / FALSE / NOT GIVEN'
         };
      }

      if (['MC', 'MCQ', 'MULTIPLE_CHOICE'].includes(type)) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: 'Choose the correct letter, A–D.',
            note: ''
         };
      }

      if (type.includes('MATCHING')) {
         return {
            title: `Questions ${startNo}–${endNo}`,
            instruction: 'Match each statement with the correct paragraph.',
            note: ''
         };
      }

      return {
         title: `Questions ${startNo}–${endNo}`,
         instruction: 'Answer the questions below.',
         note: ''
      };
   };

   const splitOption = (option) => {
      const value = String(option || '').trim();
      const match = value.match(/^([A-F])[\.\)]\s*(.*)$/i);

      if (match) {
         return {
            value: match[1].toUpperCase(),
            letter: match[1].toUpperCase(),
            text: match[2]
         };
      }

      if (['A', 'B', 'C', 'D', 'E', 'F'].includes(value.toUpperCase())) {
         return {
            value: value.toUpperCase(),
            letter: value.toUpperCase(),
            text: ''
         };
      }

      return {
         value,
         letter: '',
         text: value
      };
   };

   const getOptions = (q, groupMeta) => {
      const type = getQuestionType(q.questionType);

      if (['TFNG', 'TRUE_FALSE_NOT_GIVEN'].includes(type)) {
         return [
            { value: 'TRUE', letter: '', text: 'TRUE' },
            { value: 'FALSE', letter: '', text: 'FALSE' },
            { value: 'NOT GIVEN', letter: '', text: 'NOT GIVEN' }
         ];
      }

      if (['MULTIPLE_CHOICE', 'MCQ', 'MC'].includes(type)) {
         try {
            const parsed = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;

            if (Array.isArray(parsed) && parsed.length > 0) {
               return parsed.map(splitOption);
            }
         } catch {
            return ['A', 'B', 'C', 'D'].map(splitOption);
         }

         return ['A', 'B', 'C', 'D'].map(splitOption);
      }

      if (type.includes('MATCHING') && groupMeta?.matchingOptions?.length) {
         return groupMeta.matchingOptions.map(splitOption);
      }

      return [];
   };

   const [showConfirm, setShowConfirm] = useState(false);

   const handleEndClick = () => {
      setShowConfirm(true);
   };

   const handleEnd = async (auto = false) => {
      if (submitting) return;

      setShowConfirm(false);
      setSubmitting(true);
      clearInterval(timerRef.current);

      try {
         const formattedAnswers = Object.entries(answers).map(([key, value]) => ({
            questionId: parseInt(key),
            studentAnswer: value
         }));

         await axios.post(
            `${API_URL}/api/attempts/${attemptId}/end`,
            {
               answers: formattedAnswers,
               timeSpentSeconds: totalTime - timeLeft
            },
            api()
         );

         navigate(`/exam/${attemptId}/results`);
      } catch (err) {
         console.error('Submit exam error:', err);
         alert('Failed to submit. Please try again.');
         setSubmitting(false);
      }
   };

   const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
   };

   const selectAnswer = (questionId, value) => {
      setAnswers((prev) => ({
         ...prev,
         [questionId]: value
      }));
   };

   const getTimerStyle = () => {
      if (timeLeft === null) return { bg: '#1e293b', color: '#ffffff' };
      if (timeLeft < 300) return { bg: '#dc2626', color: '#ffffff' };
      if (timeLeft < 600) return { bg: '#d97706', color: '#ffffff' };
      return { bg: '#1e293b', color: '#ffffff' };
   };

   if (!paper) {
      return (
         <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: "'Inter', sans-serif"
         }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ textAlign: 'center' }}>
               <div style={{
                  width: '44px',
                  height: '44px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #4f46e5',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px'
               }} />
               <p style={{ color: '#64748b', fontSize: '14px' }}>Loading exam...</p>
            </div>
         </div>
      );
   }

   const passages = [...new Set(questions.map((q) => q.passageNumber || 1))]
      .filter(Boolean)
      .sort((a, b) => a - b);

   const safePassages = passages.length > 0 ? passages : [1];

   const passageQuestions = questions.filter((q) => (q.passageNumber || 1) === currentPassage);
   const totalPages = Math.max(1, Math.ceil(passageQuestions.length / 5));
   const currentQuestions = passageQuestions.slice(questionPage * 5, (questionPage + 1) * 5);
   const answeredCount = Object.keys(answers).length;
   const timerStyle = getTimerStyle();

   const startNo = currentQuestions[0]?.questionNumber || '';
   const endNo = currentQuestions[currentQuestions.length - 1]?.questionNumber || '';
   const groupMeta = getGroupMeta(
      paper.paperCode,
      Number(startNo),
      Number(endNo),
      currentQuestions[0]?.questionType
   );

   const passageMap = splitPassageText(paper.instructions || paper.content || '');
   const currentPassageText =
      paper.passages?.[currentPassage - 1]?.text ||
      paper.passageTexts?.[currentPassage - 1] ||
      passageMap[currentPassage] ||
      'Passage text will appear here.';

   return (
      <div style={{
         height: '100vh',
         display: 'flex',
         flexDirection: 'column',
         fontFamily: "'Inter', sans-serif",
         background: '#f8fafc',
         overflow: 'hidden'
      }}>
         <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes timerPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }

        .pill-btn {
          flex: 1;
          min-width: 145px;
          padding: 12px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'Inter', sans-serif;
          text-align: left;
        }

        .pill-btn:hover {
          border-color: #4f46e5;
          background: #f5f3ff;
        }

        .pill-btn.selected {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #ffffff;
          font-weight: 700;
        }

        .option-content {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.35;
        }

        .option-letter {
          min-width: 24px;
          height: 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 800;
          font-size: 12px;
          flex-shrink: 0;
        }

        .pill-btn.selected .option-letter {
          background: rgba(255,255,255,0.2);
          color: #ffffff;
        }

        .short-input {
          width: 100%;
          border: none;
          border-bottom: 2px solid #e2e8f0;
          padding: 8px 4px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          background: transparent;
          outline: none;
        }

        .short-input:focus {
          border-bottom-color: #4f46e5;
        }

        .nav-btn {
          padding: 9px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
        }

        .nav-btn.primary {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #ffffff;
        }

        .nav-btn.danger {
          background: #dc2626;
          border-color: #dc2626;
          color: #ffffff;
        }

        .q-dot {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #94a3b8;
        }

        .q-dot.answered {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }

        .q-dot.current {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #ffffff;
        }

        .group-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 18px;
        }

        .group-title {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .group-instruction {
          font-size: 13px;
          color: #334155;
          font-weight: 600;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .group-note {
          font-size: 12px;
          color: #4f46e5;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .matching-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .matching-pill {
          background: #ffffff;
          border: 1px solid #dbeafe;
          color: #1e40af;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
        }
      `}</style>

         {showWarning && (
            <div style={{
               background: '#fef3c7',
               borderBottom: '1px solid #fcd34d',
               padding: '10px 24px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between'
            }}>
               <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '500' }}>
                  ⚠️ Only 1 minute remaining! Your test will auto-submit soon.
               </span>
               <button
                  onClick={() => setShowWarning(false)}
                  style={{
                     background: 'none',
                     border: 'none',
                     cursor: 'pointer',
                     color: '#92400e',
                     fontSize: '16px'
                  }}
               >
                  ×
               </button>
            </div>
         )}

         <div style={{
            background: '#1a1a2e',
            padding: '0 24px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
         }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <img src="/logo.png" alt="EPIC" style={{ height: '28px', filter: 'brightness(0) invert(1)' }} />
               <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)' }} />
               <div>
                  <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600' }}>
                     EPIC IELTS — {paper.testType} {paper.paperCode}
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '11px' }}>
                     Passage {currentPassage} of {safePassages.length}
                  </div>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               {safePassages.map((p) => (
                  <div
                     key={p}
                     style={{
                        width: '32px',
                        height: '8px',
                        borderRadius: '4px',
                        background: p === currentPassage ? '#4f46e5' : 'rgba(255,255,255,0.2)'
                     }}
                  />
               ))}
            </div>

            <div style={{
               background: timerStyle.bg,
               color: timerStyle.color,
               padding: '8px 20px',
               borderRadius: '8px',
               fontWeight: '700',
               fontSize: '18px',
               minWidth: '90px',
               textAlign: 'center',
               animation: timeLeft < 300 ? 'timerPulse 1s infinite' : 'none'
            }}>
               {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </div>
         </div>

         <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '55% 45%',
            overflow: 'hidden'
         }}>
            <div style={{
               background: '#fafaf7',
               borderRight: '1px solid #e2e8f0',
               overflowY: 'auto',
               padding: '32px'
            }}>
               <div style={{
                  borderLeft: '4px solid #4f46e5',
                  paddingLeft: '20px',
                  marginBottom: '24px'
               }}>
                  <span style={{
                     display: 'inline-block',
                     background: '#eff0fe',
                     color: '#4f46e5',
                     fontSize: '11px',
                     fontWeight: '700',
                     padding: '4px 12px',
                     borderRadius: '20px',
                     marginBottom: '10px'
                  }}>
                     Passage {currentPassage}
                  </span>

                  <h2 style={{
                     fontFamily: "'Playfair Display', serif",
                     fontSize: '20px',
                     fontWeight: '700',
                     color: '#1a1a2e',
                     lineHeight: '1.3'
                  }}>
                     Reading Passage {currentPassage}
                  </h2>
               </div>

               <div style={{
                  fontFamily: "'Lora', serif",
                  fontSize: '15.5px',
                  lineHeight: '1.9',
                  color: '#2d3748',
                  textAlign: 'justify',
                  whiteSpace: 'pre-wrap'
               }}>
                  {currentPassageText}
               </div>
            </div>

            <div style={{
               background: '#ffffff',
               overflowY: 'auto',
               display: 'flex',
               flexDirection: 'column'
            }}>
               <div style={{
                  padding: '20px 24px 0',
                  borderBottom: '1px solid #f1f5f9',
                  flexShrink: 0
               }}>
                  <div className="group-box">
                     <div className="group-title">{groupMeta.title}</div>
                     <div className="group-instruction">{groupMeta.instruction}</div>
                     {groupMeta.note && <div className="group-note">{groupMeta.note}</div>}

                     {groupMeta.matchingOptions && (
                        <div className="matching-list">
                           {groupMeta.matchingOptions.map((item) => (
                              <span key={item} className="matching-pill">
                                 {item}
                              </span>
                           ))}
                        </div>
                     )}
                  </div>

                  <div style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     marginBottom: '16px'
                  }}>
                     <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                        Question Navigator
                     </span>

                     <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {answeredCount}/{questions.length} answered
                     </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingBottom: '16px' }}>
                     {passageQuestions.map((q, i) => (
                        <div
                           key={q.id}
                           className={`q-dot ${answers[q.id] ? 'answered' : ''} ${currentQuestions.find((cq) => cq.id === q.id) ? 'current' : ''
                              }`}
                           onClick={() => setQuestionPage(Math.floor(i / 5))}
                        >
                           {q.questionNumber}
                        </div>
                     ))}
                  </div>
               </div>

               <div style={{ flex: 1, padding: '24px' }}>
                  {currentQuestions.map((q, idx) => {
                     const options = getOptions(q, groupMeta);

                     return (
                        <div
                           key={q.id}
                           style={{
                              marginBottom: '28px',
                              paddingBottom: '24px',
                              borderBottom: idx < currentQuestions.length - 1 ? '1px solid #f1f5f9' : 'none'
                           }}
                        >
                           <div style={{
                              display: 'flex',
                              gap: '12px',
                              marginBottom: '14px',
                              alignItems: 'flex-start'
                           }}>
                              <div style={{
                                 width: '28px',
                                 height: '28px',
                                 borderRadius: '50%',
                                 background: answers[q.id] ? '#4f46e5' : '#f1f5f9',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 fontSize: '12px',
                                 fontWeight: '700',
                                 color: answers[q.id] ? '#ffffff' : '#64748b',
                                 flexShrink: 0
                              }}>
                                 {q.questionNumber}
                              </div>

                              <p style={{
                                 fontSize: '14px',
                                 color: '#1e293b',
                                 lineHeight: '1.6',
                                 fontWeight: '500',
                                 margin: 0,
                                 paddingTop: '4px'
                              }}>
                                 {q.content}
                              </p>
                           </div>

                           {options.length > 0 ? (
                              <div style={{ display: 'flex', gap: '8px', paddingLeft: '40px', flexWrap: 'wrap' }}>
                                 {options.map((opt) => {
                                    const selected = answers[q.id] === opt.value;

                                    return (
                                       <button
                                          key={`${q.id}-${opt.value}`}
                                          className={`pill-btn ${selected ? 'selected' : ''}`}
                                          onClick={() => selectAnswer(q.id, opt.value)}
                                       >
                                          <span className="option-content">
                                             {opt.letter && (
                                                <span className="option-letter">
                                                   {opt.letter}
                                                </span>
                                             )}
                                             <span>{opt.text || opt.value}</span>
                                          </span>
                                       </button>
                                    );
                                 })}
                              </div>
                           ) : (
                              <div style={{ paddingLeft: '40px' }}>
                                 <input
                                    className="short-input"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => selectAnswer(q.id, e.target.value)}
                                    placeholder="Write your answer here..."
                                 />
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>

         <div style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
         }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
               {answeredCount} of {questions.length} answered
            </span>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               {safePassages.map((p) => (
                  <button
                     key={p}
                     className={`nav-btn ${currentPassage === p ? 'primary' : ''}`}
                     onClick={() => {
                        setCurrentPassage(p);
                        setQuestionPage(0);
                     }}
                  >
                     P{p}
                  </button>
               ))}

               <button
                  className="nav-btn"
                  onClick={() => setQuestionPage((p) => Math.max(0, p - 1))}
                  disabled={questionPage === 0}
                  style={{ opacity: questionPage === 0 ? 0.4 : 1 }}
               >
                  ← Prev
               </button>

               <span style={{ fontSize: '12px', color: '#94a3b8', padding: '0 4px' }}>
                  {questionPage + 1}/{totalPages}
               </span>

               <button
                  className="nav-btn primary"
                  onClick={() => {
                     if (questionPage < totalPages - 1) {
                        setQuestionPage((p) => p + 1);
                     } else {
                        const currentIndex = safePassages.indexOf(currentPassage);
                        const nextPassage = safePassages[currentIndex + 1];

                        if (nextPassage) {
                           setCurrentPassage(nextPassage);
                           setQuestionPage(0);
                        }
                     }
                  }}
               >
                  Next →
               </button>
            </div>

            <button
               className="nav-btn danger"
               onClick={handleEndClick}
               disabled={submitting}
               style={{ minWidth: '120px' }}
            >
               {submitting ? '... ' : '🔒 END TEST'}
            </button>
         </div>

         {showConfirm && (
            <div style={{
               position: 'fixed',
               top: 0, left: 0, right: 0, bottom: 0,
               background: 'rgba(15, 23, 42, 0.75)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 9999,
               fontFamily: 'Inter, sans-serif'
            }}>
               <div style={{
                  background: 'white',
                  padding: 32,
                  borderRadius: 16,
                  maxWidth: 400,
                  width: '90%',
                  textAlign: 'center',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
               }}>
                  <h2 style={{ margin: '0 0 16px', color: '#0f172a' }}>Submit Test?</h2>
                  <p style={{ color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
                     You have answered <strong>{Object.keys(answers).length}</strong> of <strong>{questions.length}</strong> questions.
                     This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                     <button
                        onClick={() => setShowConfirm(false)}
                        style={{
                           padding: '10px 20px',
                           background: '#f1f5f9',
                           color: '#475569',
                           border: 'none',
                           borderRadius: 8,
                           fontWeight: 600,
                           cursor: 'pointer',
                           flex: 1
                        }}
                     >
                        Cancel
                     </button>
                     <button
                        onClick={() => handleEnd()}
                        style={{
                           padding: '10px 20px',
                           background: '#dc2626',
                           color: 'white',
                           border: 'none',
                           borderRadius: 8,
                           fontWeight: 600,
                           cursor: 'pointer',
                           flex: 1
                        }}
                     >
                        Confirm Submit
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}