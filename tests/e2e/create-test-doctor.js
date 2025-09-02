const mongoose = require('mongoose');
const Doctor = require('../../Backend/models/doctor');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tele', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if test doctor already exists
    let doctor = await Doctor.findOne({ username: 'test_doctor' });
    
    if (doctor) {
      console.log('Test doctor already exists:');
      console.log(`Username: ${doctor.username}`);
      console.log(`Password: ${doctor.password}`);
      process.exit(0);
    }
    
    // Create test doctor
    doctor = new Doctor({
      username: 'test_doctor',
      password: 'test_password',
      name: 'Test Doctor',
      hospital: 'Test Hospital',
      telephone: '1234567890',
      email: 'test@example.com',
      department: 'General Medicine',
      post: 'Senior Doctor',
      upi_id: 'test@upi',
      fees: 500
    });
    
    await doctor.save();
    console.log('Test doctor created successfully:');
    console.log(`Username: ${doctor.username}`);
    console.log(`Password: ${doctor.password}`);
    
  } catch (error) {
    console.error('Error creating test doctor:', error);
  } finally {
    mongoose.connection.close();
  }
});
