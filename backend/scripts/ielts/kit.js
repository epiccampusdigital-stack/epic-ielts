// Small kit for writing IELTS papers in code. `ev` = the exact words in the passage that give the answer
// (stored as Question.evidence, so the teacher portal and the results page can highlight them).

const mc = (content, options, answer, explanation, ev) => ({ type: 'MULTIPLE_CHOICE', content, options, answer, explanation, ev });
const tf = (content, answer, explanation, ev = []) => ({ type: 'TRUE_FALSE_NOT_GIVEN', content, answer, explanation, ev });
const sc = (content, answer, explanation, ev) => ({ type: 'SENTENCE_COMPLETION', content, answer, explanation, ev });

const I = {
  TF: (a, b) => `Questions ${a} to ${b}. Do the following statements agree with the information in the passage? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.`,
  MC: (a, b) => `Questions ${a} to ${b}. Choose the correct letter, A, B, C or D.`,
  SC: (a, b, limit = 'ONE WORD ONLY') => `Questions ${a} to ${b}. Complete the sentences below. Choose ${limit} from the passage for each answer.`,
  SUM: (a, b, limit = 'ONE WORD ONLY') => `Questions ${a} to ${b}. Complete the summary below. Choose ${limit} from the passage for each answer.`,
  SA: (a, b, limit = 'NO MORE THAN TWO WORDS') => `Questions ${a} to ${b}. Answer the questions below. Choose ${limit} from the passage for each answer.`,
  HEAD: (a, b) => `Questions ${a} to ${b}. The passage has five paragraphs, A to E. Choose the correct heading for each paragraph from the list of headings, A to F. There is one more heading than you need.`,
  PARA: (a, b, last = 'E') => `Questions ${a} to ${b}. Which paragraph contains the following information? Choose the correct paragraph, A to ${last}. You may use a letter more than once.`,
  FEAT: (a, b, last = 'D') => `Questions ${a} to ${b}. Match each statement with the correct person, A to ${last}. You may use a letter more than once.`,
};
const PARA5 = ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E'];

// Adds each paper once (by code). Safe on every start; never touches a paper that is already there.
async function addIeltsPapers(prisma, papers, opts = {}) {
  const { seedPaperList } = require('../generalEnglish/placement');
  const added = [];
  for (const p of papers) {
    const have = await prisma.paper.findFirst({ where: { paperCode: p.code, testType: p.testType }, select: { id: true } });
    if (have) continue;
    const last = await prisma.paper.findFirst({ where: { track: 'IELTS', testType: p.testType }, orderBy: { order: 'desc' }, select: { order: true } });
    await seedPaperList(prisma, [p], (last?.order || 0) + 1, { track: 'IELTS', ...(opts.status ? { status: opts.status } : {}) });
    added.push(p.code);
  }
  return added.length ? { added } : { skipped: 'already there' };
}

// Checks every evidence phrase is really in its passage and the questions are numbered 1 to 40
function checkReading(p) {
  const errors = []; let n = 0;
  p.passages.forEach(ps => ps.groups.forEach(g => g.questions.forEach(q => {
    n++;
    (q.ev || []).forEach(e => { if (!ps.text.includes(e)) errors.push(`${p.code} Q${n}: evidence not in passage: ${e}`); });
    if (q.options && !/^[A-F]$/.test(q.answer)) errors.push(`${p.code} Q${n}: bad option answer ${q.answer}`);
    if (q.options && q.answer.charCodeAt(0) - 65 >= q.options.length) errors.push(`${p.code} Q${n}: answer outside options`);
    if (q.type === 'TRUE_FALSE_NOT_GIVEN' && !['TRUE', 'FALSE', 'NOT GIVEN'].includes(q.answer)) errors.push(`${p.code} Q${n}: bad TF answer`);
    if (q.type === 'TRUE_FALSE_NOT_GIVEN' && q.answer !== 'NOT GIVEN' && !(q.ev || []).length) errors.push(`${p.code} Q${n}: no evidence`);
  })));
  if (n !== 40) errors.push(`${p.code}: ${n} questions, not 40`);
  return errors;
}

module.exports = { mc, tf, sc, I, PARA5, addIeltsPapers, checkReading };
