// Audio jobs: record (or re-record) listening parts on the server, one part at a time.
// To redo a part: add a job with a NEW id. Each job runs once (remembered in AppSetting "audio.job.<id>").
// refresh: copy the script and voices from code into the paper first, so script or voice changes are used.
// Needs GOOGLE_AI_API_KEY on Render; until it is set, jobs wait and run on a later start.
const JOBS = [
  // { id: 'ex2-l-all-v1', code: 'EX2-L', parts: [1, 2, 3, 4], refresh: () => require('./examPaper2Listening').LISTENING.audioScript },
  { id: 'ex2-l-part1-v1', code: 'EX2-L', parts: [1], refresh: () => require('./examPaper2Listening').LISTENING.audioScript },
];

async function runAudioJobs(prisma) {
  const builder = require('../../src/services/paperBuilder');
  if (!JOBS.length) return { jobs: 0 };
  if (!builder.ttsReady()) return { waiting: 'GOOGLE_AI_API_KEY is not set' };
  const out = [];
  for (const j of JOBS) {
    const key = `audio.job.${j.id}`;
    if (await prisma.appSetting.findUnique({ where: { key } })) continue;
    const paper = await prisma.paper.findFirst({ where: { paperCode: j.code, testType: 'LISTENING' }, select: { id: true } });
    if (!paper) { out.push({ id: j.id, skipped: 'paper not added yet' }); continue; }
    if (j.refresh) await prisma.paper.update({ where: { id: paper.id }, data: { audioScript: j.refresh() } });
    try {
      const n = await builder.recordPaperAudio(paper.id, null, j.parts);
      await prisma.appSetting.upsert({ where: { key }, update: { value: new Date().toISOString() }, create: { key, value: new Date().toISOString() } });
      out.push({ id: j.id, recorded: n });
    } catch (e) { out.push({ id: j.id, failed: e.message }); }
  }
  return out;
}

module.exports = { JOBS, runAudioJobs };
