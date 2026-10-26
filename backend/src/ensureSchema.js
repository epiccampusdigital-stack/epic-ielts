// Applies the additive, re-runnable schema update at startup, in case the host did not run
// `prisma migrate deploy` during the build. Every statement uses IF NOT EXISTS, so running it
// on a database that already has the changes does nothing. It never drops or edits data.
const fs = require('fs');
const path = require('path');

const FILES = ['20261026120000_add_tracks_and_program_tracker', '20261026200000_add_student_course'];

async function ensureSchema(prisma) {
  for (const name of FILES) {
    const file = path.join(__dirname, '..', 'prisma', 'migrations', name, 'migration.sql');
    if (!fs.existsSync(file)) continue;
    const sql = fs.readFileSync(file, 'utf8')
      .split('\n').filter(l => !l.trim().startsWith('--')).join('\n');
    // One statement per call: statements end with ";" at the end of a line
    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    let ran = 0;
    for (const st of statements) {
      await prisma.$executeRawUnsafe(st.endsWith(';') ? st : `${st};`);
      ran++;
    }
    console.log(`[schema] ${name}: ${ran} statements checked`);
  }
}

module.exports = { ensureSchema };
