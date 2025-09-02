const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function createTestDoctor() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('tele');
    const doctors = database.collection('doctors');

    // Check if test doctor already exists
    const existingDoctor = await doctors.findOne({ username: 'test_doctor' });
    
    if (existingDoctor) {
      console.log('Test doctor already exists:');
      console.log(`Username: ${existingDoctor.username}`);
      console.log(`Password: ${existingDoctor.password}`);
      return;
    }

    // Create test doctor
    const testDoctor = {
      username: 'test_doctor',
      password: 'test_password',
      name: 'Test Doctor',
      hospital: 'Test Hospital',
      telephone: '1234567890',
      email: 'test@example.com',
      department: 'General Medicine',
      post: 'Senior Doctor',
      upi_id: 'test@upi',
      fees: 500,
      created_at: Math.floor(Date.now() / 1000), // Current timestamp
      attending: '',
      chat_id: ''
    };

    // Insert the test doctor
    const result = await doctors.insertOne(testDoctor);
    console.log('Test doctor created successfully:');
    console.log(`Username: ${testDoctor.username}`);
    console.log(`Password: ${testDoctor.password}`);
    console.log(`ID: ${result.insertedId}`);

  } catch (error) {
    console.error('Error creating test doctor:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createTestDoctor();
