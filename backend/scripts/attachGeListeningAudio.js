// Attaches recorded audio (backend/public-audio/ge-c4l-sectionN.mp3) to the GE listening mock test (its name is set by generalEnglish/naming.js).
// Safe to run on every start: it only fills sections that have a file and no audio yet.
const fs = require('fs');
const path = require('path');
async function attachGeListeningAudio(prisma) {
  // The paper may still be loading on the first start after a deploy, so wait for it for up to ~40 seconds
  let paper = null;
  for (let i = 0; i < 8 && !paper; i++) {
    paper = await prisma.paper.findFirst({ where: { paperCode: 'GE-C4L' }, include: { sections: true } });
    if (!paper) await new Promise(r => setTimeout(r, 5000));
  }
  if (!paper) return { skipped: true };
  let attached = 0;
  for (const s of paper.sections) {
    const file = `ge-c4l-section${s.number}.mp3`;
    const url = `/audio/${file}`;
    if (fs.existsSync(path.join(__dirname, '../public-audio', file)) && s.audioUrl !== url) {
      await prisma.section.update({ where: { id: s.id }, data: { audioUrl: url } });
      attached++;
    }
  }
  return { attached };
}
module.exports = { attachGeListeningAudio };
