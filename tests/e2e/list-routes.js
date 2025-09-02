const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  endpoints: [
    '/',
    '/api/health',
    '/api/doctor/login',
    '/api/doctor/patients',
    '/api/nurse/login',
    '/api/patient/list',
    '/api/doctor/list',
    '/api/status'
  ]
};

// Test endpoint
async function testEndpoint(url) {
  try {
    const response = await axios.get(url, { timeout: 3000 });
    return {
      status: response.status,
      data: response.data ? 'Response received' : 'No data',
      method: 'GET'
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        error: error.response.statusText,
        method: 'GET'
      };
    } else if (error.code === 'ECONNREFUSED') {
      return { error: 'Connection refused - is the server running?' };
    } else if (error.code === 'ECONNABORTED') {
      return { error: 'Connection timeout' };
    } else {
      return { error: error.message };
    }
  }
}

// Run tests
async function runTests() {
  console.log('Testing API endpoints...\n');
  
  for (const endpoint of config.endpoints) {
    const url = `${config.baseUrl}${endpoint}`;
    process.stdout.write(`Testing ${url.padEnd(40)}`);
    
    try {
      const result = await testEndpoint(url);
      
      if (result.error) {
        console.log(`❌ ${result.error}`);
      } else {
        console.log(`✅ ${result.status} ${result.method} - ${result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${error.message}`);
    }
  }
  
  console.log('\nTests completed');
}

runTests().catch(console.error);
