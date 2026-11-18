// Five new IELTS Reading papers (IR-NEW-01 to 05), 40 questions each, with evidence for highlighting.
// Question types: matching headings, matching people, paragraph matching, TRUE/FALSE/NOT GIVEN,
// multiple choice, sentence and summary completion, short answers.
const PAPERS = [1, 2, 3, 4, 5].map(i => require(`./readingNew${i}`).PAPER);

async function addNewIeltsReading(prisma) {
  const { addIeltsPapers, checkReading } = require('./kit');
  const bad = PAPERS.flatMap(checkReading);
  if (bad.length) return { skipped: 'paper check failed', errors: bad.slice(0, 5) };
  return addIeltsPapers(prisma, PAPERS);
}

module.exports = { PAPERS, addNewIeltsReading };
