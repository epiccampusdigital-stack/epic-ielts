require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
// Render sits behind a proxy: without this every visitor shares one IP, so per-IP limits hit everyone at once
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://epicielts.live',
    'https://www.epicielts.live',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Stripe webhook MUST receive raw body — register before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

try {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  app.use('/audio', express.static(path.join(__dirname, '../public-audio')));
  app.use('/media', express.static(path.join(__dirname, '../public-media'), { maxAge: '7d' }));
} catch(e) {
  console.log('Uploads folder not found, skipping');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.get('/health', async (req, res) => {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      aiModel: 'claude-haiku-4-5'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EPIC IELTS API running',
    time: new Date().toISOString(),
    aiKeyLoaded: !!process.env.ANTHROPIC_API_KEY
  });
});

const auth = require('./middleware/auth');
const adminOnly = require('./middleware/adminOnly');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/attempts', require('./routes/attempts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/uploads'));
app.use('/api/admin/papers/import-json', auth, adminOnly, require('./routes/importJson'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/levels', require('./routes/levels'));
app.use('/api/learn', require('./routes/learn'));
app.use('/api/dictionary', require('./routes/dictionary'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/ai-learn', require('./routes/aiLearn'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/program', require('./routes/program'));
app.use('/api/listening', require('./routes/listening'));
app.use('/api/exams', require('./routes/exams'));

app.get('/', (req, res) => {
  res.json({ message: 'EPIC IELTS API running' });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: err.message });
});

if (!process.env.JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not set. Logins are signed with the default secret in the code. Set JWT_SECRET on Render.');
}

const PORT = process.env.PORT || 10000;
// Make sure the new tables and columns exist before taking requests (safe to run every boot)
require('./ensureSchema').ensureSchema(prisma)
  .catch(e => console.error('[schema] update failed:', e.message))
  .finally(() => app.listen(PORT, '0.0.0.0', () => {
    try { require('./services/dailyTask').startDailyTaskTimer(); } catch (e) { console.error('[daily-task] not started:', e.message); }
  console.log(`EPIC IELTS Backend running on port ${PORT}`);
  console.log('AI Key loaded:', !!process.env.ANTHROPIC_API_KEY);
  // Load the General English lessons, quizzes and placement tests once, if they are not there yet
  (async () => {
    try {
      const modules = await prisma.learnModule.count({ where: { track: 'GENERAL' } });
      const placement = await prisma.paper.count({ where: { track: 'GENERAL', paperCode: { startsWith: 'GE-PT' } } });
      const { COURSE_PAPERS } = require('../scripts/generalEnglish/coursePapers');
      const have = new Set((await prisma.paper.findMany({ where: { track: 'GENERAL', paperCode: { startsWith: 'GE-C' } }, select: { paperCode: true, testType: true } })).map(p => `${p.paperCode}:${p.testType}`));
      const missing = COURSE_PAPERS.filter(p => !have.has(`${p.code}:${p.testType}`));
      if (modules === 0 || placement < 4) {
        const { seedGeneralEnglish } = require('../scripts/generalEnglish');
        console.log('[general-english] content loaded:', JSON.stringify(await seedGeneralEnglish(prisma)));
      } else if (missing.length) {
        // Only add the course papers that are missing, so existing papers (and their audio and stars) stay as they are
        const { seedPaperList } = require('../scripts/generalEnglish/placement');
        let added = 0;
        for (const [i, p] of COURSE_PAPERS.entries()) {
          if (!missing.includes(p)) continue;
          try { added += await seedPaperList(prisma, [p], 950 + i); console.log('[general-english] added', p.code); }
          catch (err) { console.error('[general-english] could not add', p.code, '-', err.message); }
        }
        console.log('[general-english] new course papers added:', added);
      }
    } catch (e) {
      console.error('[general-english] auto load skipped:', e.message);
    }
    // Then: fix GE paper 4 options, attach the Listening 002 audio and fill in difficulty stars (all safe to repeat)
    try {
      const { removeSilentGeListening } = require('../scripts/removeSilentGeListening');
      console.log('[general-english] listening without audio:', JSON.stringify(await removeSilentGeListening(prisma)));
      const { repairGeC4R } = require('../scripts/repairGeC4R');
      console.log('[general-english] paper 4 repair:', JSON.stringify(await repairGeC4R(prisma)));
      const { attachGeListeningAudio } = require('../scripts/attachGeListeningAudio');
      console.log('[general-english] listening audio:', JSON.stringify(await attachGeListeningAudio(prisma)));
      const { applyGeDifficulty } = require('../scripts/generalEnglish/difficulty');
      console.log('[general-english] difficulty stars:', JSON.stringify(await applyGeDifficulty(prisma)));
      const { renameGePapers } = require('../scripts/generalEnglish/naming');
      console.log('[general-english] paper names:', JSON.stringify(await renameGePapers(prisma)));
    } catch (e) {
      console.error('[general-english] paper 4 repair skipped:', e.message);
    }
    try {
      const { applyProgramTimetable } = require('../scripts/programTimetable');
      console.log('[program] timetable weeks 1 to 3:', JSON.stringify(await applyProgramTimetable(prisma)));
    } catch (e) {
      console.error('[program] timetable weeks 1 to 3 skipped:', e.message);
    }
    try {
      const { upgradePaper8 } = require('../scripts/generalEnglish/paper8Part2');
      console.log('[general-english] reading 008 part 2:', JSON.stringify(await upgradePaper8(prisma)));
    } catch (e) {
      console.error('[general-english] reading 008 part 2 skipped:', e.message);
    }
    try {
      const { upgradePaper12 } = require('../scripts/generalEnglish/paper12Part2');
      console.log('[general-english] reading 012 part 2:', JSON.stringify(await upgradePaper12(prisma)));
    } catch (e) {
      console.error('[general-english] reading 012 part 2 skipped:', e.message);
    }
    try {
      const { addNewIeltsReading } = require('../scripts/ielts/readingNewFive');
      console.log('[ielts] five new reading papers:', JSON.stringify(await addNewIeltsReading(prisma)));
      const { addNewIeltsWriting } = require('../scripts/ielts/writingNewFive');
      console.log('[ielts] five new writing papers:', JSON.stringify(await addNewIeltsWriting(prisma)));
      const { addHalfwayMock } = require('../scripts/ielts/halfwayMock');
      console.log('[ielts] halfway mock:', JSON.stringify(await addHalfwayMock(prisma)));
      // Opens the mock for students at its start time, checked every minute
      // The halfway mock moves to the Exam tab (rebuilt as Exam Paper 2): it no longer opens by itself on Saturday.
      const hm = await prisma.paper.updateMany({ where: { paperCode: { in: ['IM-HALF-L', 'IM-HALF-R', 'IM-HALF-W'] }, status: 'DRAFT' }, data: { status: 'EXAM_LOCKED' } });
      if (hm.count) console.log('[ielts] halfway mock moved to the exam tab (locked):', hm.count);
      const { addExamPaper1 } = require('../scripts/ielts/examPaper1');
      console.log('[ielts] exam paper 1:', JSON.stringify(await addExamPaper1(prisma)));
      // Exam Paper 2 listening: saved hidden (locked and not in the Exam tab) so its audio can be recorded part by part
      // by audio jobs; teachers can listen in the teacher portal. It goes into the Exam tab later.
      const { addExam2Listening } = require('../scripts/ielts/examPaper2Listening');
      console.log('[ielts] exam paper 2 listening (hidden):', JSON.stringify(await addExam2Listening(prisma, { record: false })));
      // Listening audio jobs (record or re-record single parts) run in the background
      require('../scripts/ielts/audioJobs').runAudioJobs(prisma).then(r => console.log('[ielts] audio jobs:', JSON.stringify(r))).catch(e => console.error('[ielts] audio jobs:', e.message));
      const { addSleepTreesReading } = require('../scripts/ielts/readingSleepTreesFailure');
      console.log('[ielts] new reading paper:', JSON.stringify(await addSleepTreesReading(prisma)));
      const { addParkLifeWriting } = require('../scripts/ielts/writingParkLifeStages');
      console.log('[ielts] new writing paper:', JSON.stringify(await addParkLifeWriting(prisma)));
      const { splitParkLifeWriting } = require('../scripts/ielts/writingParkLifeStages');
      console.log('[ielts] writing 016 split:', JSON.stringify(await splitParkLifeWriting(prisma)));
      const { dropParkLifeEssay } = require('../scripts/ielts/writingParkLifeStages');
      console.log('[ielts] writing 016 essay removed:', JSON.stringify(await dropParkLifeEssay(prisma)));
    } catch (e) {
      console.error('[ielts] new reading paper skipped:', e.message);
    }
    try {
      const { renameIeltsPapers } = require('../scripts/ieltsNaming');
      console.log('[ielts] paper names:', JSON.stringify(await renameIeltsPapers(prisma)));
    } catch (e) {
      console.error('[ielts] paper names skipped:', e.message);
    }
  })();
  // Copy the IELTS listening papers into General English once (GE-L1...). The IELTS originals are not changed.
  (async () => {
    try {
      const have = await prisma.paper.count({ where: { track: 'GENERAL', testType: 'LISTENING', paperCode: { startsWith: 'GE-L' } } });
      if (have === 0) {
        const { copyListeningToGeneral } = require('../scripts/copyListeningToGeneral');
        const n = await copyListeningToGeneral(prisma, { apply: true, limit: 4 });
        console.log('[general-english] listening papers copied:', n);
      }
    } catch (e) {
      console.error('[general-english] listening copy skipped:', e.message);
    }
  })();
  try {
    require('./services/programService').startScheduler();
  } catch (e) {
    console.error('Programme scheduler failed to start:', e.message);
  }
}));