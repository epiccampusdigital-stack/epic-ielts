// One-off, safe to run again: fixes the "undefined. Paragraph E/F" options in GE-C4R (Tea in Sri Lanka),
// re-marks students' answers for the paragraph questions, and refreshes their scores.
const LET = 'ABCDEFGH';
async function repairGeC4R(prisma) {
  const paper = await prisma.paper.findFirst({ where: { paperCode: 'GE-C4R' } });
  if (!paper) return { skipped: true };
  const qs = await prisma.question.findMany({ where: { paperId: paper.id } });
  let optionsFixed = 0;
  for (const q of qs) {
    if (!Array.isArray(q.options)) continue;
    const fixed = q.options.map((o, k) => String(o).replace(/^[A-Za-z]+[.)]\s*/, `${LET[k]}. `));
    if (JSON.stringify(fixed) !== JSON.stringify(q.options)) {
      await prisma.question.update({ where: { id: q.id }, data: { options: fixed } });
      optionsFixed++;
    }
  }
  const mcq = qs.filter(q => q.questionType === 'MULTIPLE_CHOICE');
  const byId = Object.fromEntries(mcq.map(q => [q.id, q]));
  const answers = await prisma.answer.findMany({ where: { questionId: { in: mcq.map(q => q.id) } } });
  const touched = new Set();
  for (const a of answers) {
    const q = byId[a.questionId];
    const txt = String(a.studentAnswer || '').trim();
    if (!txt) continue;
    const m = txt.match(/Paragraph\s+([A-F])\b/i) || txt.match(/^([A-H])(?:[.)]|$)/i);
    const letter = m ? m[1].toUpperCase() : null;
    if (!letter) continue;
    const ok = String(q.correctAnswer).split('|').map(s => s.trim().toUpperCase()).includes(letter);
    const idx = LET.indexOf(letter);
    const label = Array.isArray(q.options) && q.options[idx] ? q.options[idx] : txt;
    if (ok !== a.isCorrect || label !== txt) {
      await prisma.answer.update({ where: { id: a.id }, data: { isCorrect: ok, studentAnswer: label } });
      touched.add(a.attemptId);
    }
  }
  for (const attemptId of touched) {
    const all = await prisma.answer.findMany({ where: { attemptId } });
    const raw = all.filter(x => x.isCorrect).length;
    await prisma.result.updateMany({ where: { attemptId }, data: { rawScore: raw, aiFeedbackJson: null, finalStudentReport: null } });
  }
  return { optionsFixed, attemptsRescored: touched.size };
}
module.exports = { repairGeC4R };
