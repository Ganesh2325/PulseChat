const axios = require('axios');

async function test() {
  const API_URL = 'http://localhost:4000';
  
  try {
    console.log('Fetching rooms...');
    // Note: This requires a token or disabling auth for test
    // For now, let's just check if the server is alive
    const res = await axios.get(`${API_URL}/health`);
    console.log('Health Check:', res.data);
    
    const rooms = await axios.get(`${API_URL}/rooms`).catch(err => {
        console.log('Rooms Fetch Status:', err.response?.status);
        return { data: [] };
    });
    console.log('Rooms Found:', rooms.data.length);
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

test();
