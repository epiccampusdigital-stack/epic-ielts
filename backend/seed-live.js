const https = require('https');

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = body ? JSON.stringify(body) : '';
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) }
    };
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
  // First get admin token to delete duplicates
  console.log('Step 1: Login as admin...');
  const loginRes = await httpPost('https://epic-ielts-backend.onrender.com/api/auth/login', {
    email: 'admin@epic.com',
    password: 'admin123'
  });
  console.log('Login status:', loginRes.status, loginRes.body.substring(0, 200));

  let token = null;
  try {
    token = JSON.parse(loginRes.body).token;
    console.log('Token obtained:', token ? 'YES' : 'NO');
  } catch(e) {
    console.log('Could not parse token');
  }

  // Re-seed (the seed endpoint deletes existing by code before inserting)
  console.log('\nStep 2: Re-seeding READING005 with corrected code "005"...');
  const seedRes = await httpPost('https://epic-ielts-backend.onrender.com/api/papers/seed-reading005');
  console.log('Seed status:', seedRes.status);
  console.log('Seed response:', seedRes.body);

  // If we have token, delete the stale READING005 entry
  if (token) {
    console.log('\nStep 3: Checking for duplicate READING005 entry...');
    const debugRes = await httpGet('https://epic-ielts-backend.onrender.com/api/papers/debug');
    const debug = JSON.parse(debugRes.body);
    const duplicate = debug.papers.find(p => p.code === 'READING005');
    if (duplicate) {
      console.log('Found duplicate READING005 with id:', duplicate.id, '- deleting...');
      const delRes = await new Promise((resolve, reject) => {
        const urlObj = new URL(`https://epic-ielts-backend.onrender.com/api/admin/papers/${duplicate.id}`);
        const options = {
          hostname: urlObj.hostname,
          path: urlObj.pathname,
          method: 'DELETE',
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
      console.log('Delete status:', delRes.status, delRes.body);
    } else {
      console.log('No READING005 duplicate found.');
    }
  }

  // Final verification
  console.log('\nStep 4: Final state of all papers...');
  const finalRes = await httpGet('https://epic-ielts-backend.onrender.com/api/papers/debug');
  const final = JSON.parse(finalRes.body);
  console.log('Total papers:', final.total);
  final.papers.forEach(p => console.log(' -', `[id:${p.id}]`, p.code, p.type, p.status));
}

main().catch(console.error);
