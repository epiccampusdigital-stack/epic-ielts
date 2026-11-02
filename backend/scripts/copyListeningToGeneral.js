// Copies IELTS Listening papers into the General English track as GE-L1, GE-L2, ...
// The originals are NOT changed. Safe to run more than once (a paper already copied is skipped).
// Usage (from the backend folder, with DATABASE_URL set):
//   node scripts/copyListeningToGeneral.js            -> dry run, shows what would be copied
//   node scripts/copyListeningToGeneral.js --apply    -> makes the copies
//   node scripts/copyListeningToGeneral.js --apply --limit 4   -> copy at most 4 papers (default 4)
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const apply = process.argv.includes('--apply');
const li = process.argv.indexOf('--limit');
const limit = li > -1 ? Math.max(1, parseInt(process.argv[li + 1], 10) || 4) : 4;

async function main() {
  const sources = await prisma.paper.findMany({
    where: { testType: 'LISTENING', track: 'IELTS', status: { in: ['ACTIVE', 'PUBLISHED'] }, practiceMode: false },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    take: limit,
    include: { sections: { orderBy: { order: 'asc' }, include: { groups: { orderBy: { order: 'asc' }, include: { questions: { orderBy: { order: 'asc' } } } } } }, questions: { orderBy: { order: 'asc' } } },
  });
  console.log(`Found ${sources.length} IELTS listening paper(s).`);
  let n = 0, made = 0;
  for (const src of sources) {
    n++;
    const code = `GE-L${n}`;
    const exists = await prisma.paper.findFirst({ where: { paperCode: code, testType: 'LISTENING' } });
    const qCount = src.questions.length;
    if (exists) { console.log(`- ${code}: already exists, skipped (source: ${src.paperCode} ${src.title})`); continue; }
    console.log(`- ${code}: would copy "${src.title}" (${src.paperCode}), ${src.sections.length} sections, ${qCount} questions`);
    if (!apply) continue;
    await prisma.$transaction(async tx => {
      const paper = await tx.paper.create({ data: {
        paperCode: code, testType: 'LISTENING', track: 'GENERAL', title: `Listening practice ${n}`, timeLimitMin: src.timeLimitMin,
        instructions: src.instructions, audioUrl: src.audioUrl, audioScript: src.audioScript, status: 'ACTIVE', assignedBatches: 'ALL', order: 960 + n, practiceMode: false,
      } });
      const idMap = new Map(); // old group id -> new group id
      for (const s of src.sections) {
        const sec = await tx.section.create({ data: { paperId: paper.id, number: s.number, description: s.description, audioUrl: s.audioUrl, order: s.order } });
        for (const g of s.groups) {
          const ng = await tx.questionGroup.create({ data: { sectionId: sec.id, groupType: g.groupType, instruction: g.instruction, imageUrl: g.imageUrl, tableData: g.tableData === null ? undefined : g.tableData, wordLimit: g.wordLimit, order: g.order } });
          idMap.set(g.id, ng.id);
        }
      }
      for (const q of src.questions) {
        await tx.question.create({ data: {
          paperId: paper.id, groupId: q.groupId ? (idMap.get(q.groupId) || null) : null, passageNumber: q.passageNumber, sectionNumber: q.sectionNumber,
          questionNumber: q.questionNumber, questionType: q.questionType, content: q.content, options: q.options === null ? undefined : q.options,
          correctAnswer: q.correctAnswer, explanation: q.explanation, imageUrl: q.imageUrl, audioUrl: q.audioUrl, wordLimit: q.wordLimit, order: q.order,
          tableData: q.tableData === null ? undefined : q.tableData, groupInstruction: q.groupInstruction,
        } });
      }
    }, { timeout: 60000 });
    made++;
    console.log(`  copied as ${code}`);
  }
  console.log(apply ? `Done. ${made} paper(s) copied.` : 'Dry run only. Add --apply to make the copies.');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
