const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'http://localhost:3005',
  endpoints: ['/api/health', '/api/doctor/login']
};

// Test API endpoint
async function testEndpoint(endpoint) {
  const url = `${config.baseUrl}${endpoint}`;
  console.log(`\nTesting ${url}`);
  
  try {
    const response = await axios.get(url, { timeout: 3000 });
    console.log(`✅ Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.response) {
      console.log(`❌ Error: ${error.response.status} ${error.response.statusText}`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests...');
  
  for (const endpoint of config.endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\nAPI tests completed');
}

runTests().catch(console.error);
