const https = require('https');

const data = JSON.stringify({
  email: 'admin@epic.com',
  password: 'admin123'
});

const options = {
  hostname: 'epic-ielts-backend.onrender.com',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing live login at epic-ielts-backend.onrender.com...');

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (d) => {
    responseBody += d;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
      const parsed = JSON.parse(responseBody);
      if (res.statusCode === 200 && parsed.token) {
        console.log('LOGIN SUCCESS!');
        console.log('User Role:', parsed.user?.role);
      } else {
        console.log('LOGIN FAILED!');
        console.log('Error:', parsed.error || responseBody);
      }
    } catch (e) {
      console.log('Could not parse response:', responseBody);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.write(data);
req.end();
