const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Sample doctors data
const doctors = [
  {
    username: 'mohit_shukla',
    password: 'doctor123',
    name: 'Dr. Mohit Shukla',
    hospital: 'City General Hospital',
    telephone: '9876543210',
    email: 'mohit.shukla@example.com',
    department: 'Cardiology',
    post: 'Senior Cardiologist',
    upi_id: 'mohit.shukla@upi',
    fees: 800,
    status: 'Online',
    attending: '',
    chat_id: '',
    created_at: Math.floor(Date.now() / 1000),
    branches: []
  },
  {
    username: 'priya_verma',
    password: 'doctor123',
    name: 'Dr. Priya Verma',
    hospital: 'Metro Health Center',
    telephone: '8765432109',
    email: 'priya.verma@example.com',
    department: 'Pediatrics',
    post: 'Pediatrician',
    upi_id: 'priya.verma@upi',
    fees: 700,
    status: 'Online',
    attending: '',
    chat_id: '',
    created_at: Math.floor(Date.now() / 1000),
    branches: []
  },
  {
    username: 'rajesh_kumar',
    password: 'doctor123',
    name: 'Dr. Rajesh Kumar',
    hospital: 'Sunrise Hospital',
    telephone: '7654321098',
    email: 'rajesh.kumar@example.com',
    department: 'Orthopedics',
    post: 'Orthopedic Surgeon',
    upi_id: 'rajesh.kumar@upi',
    fees: 900,
    status: 'Online',
    attending: '',
    chat_id: '',
    created_at: Math.floor(Date.now() / 1000),
    branches: []
  }
];

async function setupDoctors() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('tele');
    const doctorsCollection = database.collection('doctors');

    // Clear existing test doctors
    await doctorsCollection.deleteMany({
      username: { $in: doctors.map(d => d.username) }
    });

    // Insert new doctors
    const result = await doctorsCollection.insertMany(doctors);
    console.log(`Inserted ${result.insertedCount} doctors`);
    
    console.log('\nDoctors created:');
    doctors.forEach((doctor, index) => {
      console.log(`\n${index + 1}. ${doctor.name}`);
      console.log(`   Username: ${doctor.username}`);
      console.log(`   Password: ${doctor.password}`);
      console.log(`   Department: ${doctor.department}`);
      console.log(`   Status: ${doctor.status}`);
    });

  } catch (error) {
    console.error('Error setting up doctors:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

setupDoctors();
