const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'http://localhost:3001',
  doctorCredentials: {
    username: 'test_doctor',
    password: 'test_password'
  },
  endpoints: {
    login: '/api/doctor/login'
  }
};

// Test doctor login
async function testDoctorLogin() {
  console.log('Testing doctor login endpoint...');
  
  try {
    console.log(`\n1. Sending login request to ${config.baseUrl}${config.endpoints.login}`);
    console.log(`   Username: ${config.doctorCredentials.username}`);
    
    const response = await axios.post(
      `${config.baseUrl}${config.endpoints.login}`,
      config.doctorCredentials,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    
    console.log('✅ Login successful!');
    console.log('   Response status:', response.status);
    console.log('   Response data:', JSON.stringify(response.data, null, 2));
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Login failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('   Error: Invalid credentials');
      } else if (error.response.status === 500) {
        console.log('   Error: Server error - check server logs');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('   Error: No response received from server');
      console.log('   Check if the backend server is running');
    } else {
      // Something happened in setting up the request
      console.log('   Error:', error.message);
    }
    
    return false;
  }
}

// Run the test
async function runTests() {
  console.log('Starting doctor authentication tests...\n');
  
  try {
    // Test 1: Try to login with test credentials
    const loginSuccess = await testDoctorLogin();
    
    if (!loginSuccess) {
      console.log('\n💡 Tip: The test doctor account might not exist in the database.');
      console.log('   You can create a test doctor account using the admin interface.');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    console.log('\nTests completed');
  }
}

runTests();
