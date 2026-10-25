// General English content: 5 weekly modules (30 daily lessons) + 5 weekly quizzes.
// seedGeneralEnglish(prisma) is safe to run more than once: it updates in place and keeps student progress.
const modules = [require('./week1'), require('./week2'), require('./week3'), require('./week4'), require('./week5')];
const quizzes = require('./quizzes');

async function seedGeneralEnglish(prisma) {
  const report = { modules: 0, lessons: 0, quizzes: 0 };

  for (const [mi, mod] of modules.entries()) {
    const order = 100 + mi; // after any IELTS modules
    let row = await prisma.learnModule.findFirst({ where: { track: 'GENERAL', title: mod.title } });
    const data = { title: mod.title, description: mod.description, icon: mod.icon, color: mod.color, order, track: 'GENERAL' };
    row = row ? await prisma.learnModule.update({ where: { id: row.id }, data }) : await prisma.learnModule.create({ data });
    report.modules++;

    for (const [li, lesson] of mod.lessons.entries()) {
      const existing = await prisma.learnLesson.findFirst({ where: { moduleId: row.id, order: li + 1 } });
      const ldata = { title: lesson.title, content: lesson.content, estimatedMin: lesson.estimatedMin || 15, order: li + 1, moduleId: row.id };
      if (existing) await prisma.learnLesson.update({ where: { id: existing.id }, data: ldata });
      else await prisma.learnLesson.create({ data: ldata });
      report.lessons++;
    }
  }

  for (const [qi, quiz] of quizzes.entries()) {
    const existing = await prisma.paper.findFirst({ where: { paperCode: quiz.code, testType: 'READING' } });
    if (existing) {
      // Never rebuild a quiz that students have attempted
      const attempts = await prisma.attempt.count({ where: { paperId: existing.id } });
      if (attempts > 0) continue;
      await prisma.paper.delete({ where: { id: existing.id } });
    }
    await prisma.$transaction(async tx => {
      const paper = await tx.paper.create({
        data: {
          paperCode: quiz.code, testType: 'READING', track: 'GENERAL', title: quiz.title,
          timeLimitMin: quiz.timeLimitMin, status: 'ACTIVE', assignedBatches: 'ALL', order: 1000 + qi,
          instructions: 'Read the text, then choose the best answer for each question.',
        },
      });
      const passage = await tx.passage.create({ data: { paperId: paper.id, passageNumber: 1, title: quiz.passageTitle, text: quiz.passage } });
      const group = await tx.questionGroup.create({
        data: { passageId: passage.id, groupType: 'MULTIPLE_CHOICE', instruction: 'Choose the correct letter, A, B, C or D.', order: 0 },
      });
      for (const [i, [content, opts, correct, explanation]] of quiz.q.entries()) {
        await tx.question.create({
          data: {
            paperId: paper.id, groupId: group.id, passageNumber: 1, questionNumber: i + 1, questionType: 'MULTIPLE_CHOICE',
            content, options: opts.map((o, k) => `${'ABCD'[k]}. ${o}`), correctAnswer: correct, explanation, order: i,
          },
        });
      }
    });
    report.quizzes++;
  }
  return report;
}

module.exports = { modules, quizzes, seedGeneralEnglish };
