async function test() {
  try {
    console.log('Testing Login...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@epic.com', password: 'student123' })
    });
    const loginData = await loginRes.json();
    
    if (!loginRes.ok) throw new Error(loginData.error || loginData.message);
    const token = loginData.token;
    console.log('✅ Login successful, Token received:', token ? 'Yes' : 'No');

    console.log('\nTesting GET /api/papers/assigned...');
    const papersRes = await fetch('http://localhost:3001/api/papers/assigned', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const papersData = await papersRes.json();
    
    if (!papersRes.ok) throw new Error(papersData.error || papersData.message);
    console.log(`✅ Papers retrieved successfully. Count: ${papersData.length}`);
    papersData.forEach(p => console.log(`- ${p.paperCode}: ${p.title} (${p.status})`));

  } catch (error) {
    console.error('❌ Test failed!', error.message);
  }
}
test();
