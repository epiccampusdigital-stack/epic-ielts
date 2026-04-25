async function test() {
  try {
    console.log('Testing Health...');
    const health = await fetch('http://localhost:3001/api/health');
    console.log('Health:', await health.json());

    console.log('\nTesting Admin Login...');
    const adminLogin = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@epic.com', password: 'admin123' })
    });
    const adminData = await adminLogin.json();
    console.log('Admin Token Received:', !!adminData.token);

    console.log('\nTesting Student Login...');
    const studentLogin = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@epic.com', password: 'student123' })
    });
    const studentData = await studentLogin.json();
    console.log('Student Token Received:', !!studentData.token);

    console.log('\nTesting GET /api/papers/assigned...');
    const papersRes = await fetch('http://localhost:3001/api/papers/assigned', {
      headers: { Authorization: `Bearer ${studentData.token}` }
    });
    const papersData = await papersRes.json();
    console.log(`Papers Array Length: ${papersData.length}`);
    if (papersData.length > 0) {
      console.log('First paper:', papersData[0].paperCode, papersData[0].testType, papersData[0].status);
    }
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}
test();
