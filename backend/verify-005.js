const https = require('https');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Checking READING 005 (id:19) detail...');
  const res = await httpGet('https://epic-ielts-backend.onrender.com/api/papers/19');
  const paper = JSON.parse(res.body);
  console.log('Paper code:', paper.paperCode);
  console.log('Paper title:', paper.title);
  console.log('Paper testType:', paper.testType);
  console.log('Passages:', paper.passages?.length);
  paper.passages?.forEach(p => console.log('  - Passage', p.passageNumber, ':', p.title));
  console.log('Questions:', paper.questions?.length);
  // Show first 5 and last 5 questions
  const qs = paper.questions || [];
  qs.slice(0, 5).forEach(q => console.log(`  Q${q.questionNumber} [${q.questionType}]: ${q.content?.substring(0, 60)}...`));
  console.log('  ...');
  qs.slice(-5).forEach(q => console.log(`  Q${q.questionNumber} [${q.questionType}]: ${q.content?.substring(0, 60)}...`));
}

main().catch(console.error);
