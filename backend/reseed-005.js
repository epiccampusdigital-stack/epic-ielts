const https = require('https');

function httpPost(url, body, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { hostname: urlObj.hostname, path: urlObj.pathname, method: 'POST', headers };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function httpDelete(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname, path: urlObj.pathname, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

function httpGet(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { hostname: urlObj.hostname, path: urlObj.pathname, method: 'GET', headers };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // 1. Login
  console.log('Step 1: Login...');
  const loginRes = await httpPost('https://epic-ielts-backend.onrender.com/api/auth/login', {
    email: 'admin@epic.com', password: 'admin123'
  });
  const token = JSON.parse(loginRes.body).token;
  console.log('Token:', token ? 'OK' : 'FAILED');
  if (!token) { console.error('Login failed:', loginRes.body); return; }

  // 2. Delete ALL existing papers with code "005" or "READING005"
  console.log('\nStep 2: Delete any existing READING 005 papers...');
  const debugRes = await httpGet('https://epic-ielts-backend.onrender.com/api/papers/debug');
  const debug = JSON.parse(debugRes.body);
  const toDelete = debug.papers.filter(p => p.code === '005' || p.code === 'READING005');
  console.log('Papers to delete:', toDelete.map(p => `id:${p.id} code:${p.code}`));
  for (const p of toDelete) {
    const d = await httpDelete(`https://epic-ielts-backend.onrender.com/api/admin/papers/${p.id}`, token);
    console.log(`Deleted id:${p.id} → status:${d.status} ${d.body}`);
  }

  // 3. Wait 3 minutes for Render to deploy the new reading005.js with code "005"
  console.log('\nStep 3: Waiting 3 minutes for Render to deploy...');
  for (let i = 1; i <= 18; i++) {
    process.stdout.write(`  ${i * 10}s...`);
    await sleep(10000);
  }
  console.log('\nDone waiting.');

  // 4. Call seed endpoint
  console.log('\nStep 4: Seeding READING 005...');
  const seedRes = await httpPost('https://epic-ielts-backend.onrender.com/api/papers/seed-reading005');
  console.log('Seed status:', seedRes.status);
  console.log('Seed response:', seedRes.body);

  // 5. Verify
  console.log('\nStep 5: Verify...');
  const paper005 = JSON.parse(seedRes.body);
  if (paper005.success && paper005.paperId) {
    const detailRes = await httpGet(`https://epic-ielts-backend.onrender.com/api/papers/${paper005.paperId}`);
    const detail = JSON.parse(detailRes.body);
    console.log('Code:', detail.paperCode);
    console.log('Title:', detail.title);
    console.log('Passages:', detail.passages?.length);
    console.log('Questions:', detail.questions?.length);
    detail.passages?.forEach(p => console.log('  Passage', p.passageNumber, ':', p.title));
  }

  // 6. Final list
  console.log('\nStep 6: All papers...');
  const finalRes = await httpGet('https://epic-ielts-backend.onrender.com/api/papers/debug');
  const final = JSON.parse(finalRes.body);
  final.papers.forEach(p => console.log(` [id:${p.id}] ${p.code} (${p.type})`));
}

main().catch(console.error);
