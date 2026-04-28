const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Starting MCQ migration...');
  const questions = await prisma.question.findMany({
    where: {
      OR: [
        { questionType: 'MULTIPLE_CHOICE' },
        { questionType: 'Multiple Choice' }
      ]
    }
  });

  console.log(`🔍 Found ${questions.length} MCQ questions.`);

  for (const q of questions) {
    // 1. Check if already migrated
    if (q.options && Array.isArray(q.options) && q.options.length > 0) {
       console.log(`✅ Skipping Q${q.questionNumber} (already has array options)`);
       continue;
    }

    // 2. Try to parse stringified JSON if exists
    if (typeof q.options === 'string' && q.options.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(q.options);
        if (Array.isArray(parsed)) {
          console.log(`📦 Converting stringified JSON for Q${q.questionNumber}`);
          await prisma.question.update({ where: { id: q.id }, data: { options: parsed } });
          continue;
        }
      } catch (e) {}
    }

    // 3. Split content if it contains letters A-D
    const content = q.content || '';
    // Look for patterns like "A. ", "B. ", "A) ", "B) "
    const parts = content.split(/([A-D][\.\)])\s/);
    
    if (parts.length > 1) {
      const stem = parts[0].trim();
      const options = [];
      for (let i = 1; i < parts.length; i += 2) {
        const letter = parts[i].replace(/[\.\)]/, '.'); // Normalize to A.
        const text = parts[i+1]?.trim() || '';
        options.push(`${letter} ${text}`);
      }

      if (options.length > 0) {
        console.log(`✨ Migrated Q${q.questionNumber}: ${stem.substring(0, 30)}... [${options.length} options]`);
        await prisma.question.update({
          where: { id: q.id },
          data: {
            content: stem,
            options: options
          }
        });
      }
    } else {
      console.log(`⚠️  Could not split Q${q.questionNumber}: ${content.substring(0, 50)}...`);
    }
  }
  console.log('🏁 Migration finished.');
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
