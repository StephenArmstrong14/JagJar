import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('Attempting login...');
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'developer',
        password: 'password'
      }),
      redirect: 'manual',
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    try {
      const data = await response.json();
      console.log('Response data:', data);
    } catch (e) {
      console.log('Could not parse response as JSON:', await response.text());
    }
  } catch (error) {
    console.error('Error during login test:', error);
  }
}

testLogin();