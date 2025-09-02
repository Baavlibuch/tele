const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Patient details
const patient = {
  _id: `RAMLAL${Date.now()}`,
  name: 'Ramlal Sinha',
  telephone: '9876543210',
  age: 45,
  gender: 'Male',
  address: '123 Main Street, Mumbai, Maharashtra',
  village: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  emergency_contact: '9876543211',
  emergency_relation: 'Wife',
  occupation: 'Farmer',
  marital_status: 'Married',
  blood_group: 'B+',
  height: 168, // cm
  weight: 72, // kg
  allergies: ['Penicillin'],
  current_medications: ['Metformin 500mg'],
  medical_history: [
    {
      date: new Date('2024-01-15'),
      diagnosis: 'Type 2 Diabetes',
      treatment: 'Prescribed Metformin 500mg twice daily',
      doctor: 'Dr. Sharma',
      hospital: 'City General Hospital'
    }
  ],
  vitals: {
    blood_pressure: '130/85',
    pulse: 78,
    temperature: 98.6,
    spo2: 98,
    bmi: 25.5
  },
  last_visit: new Date(),
  next_appointment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  status: 'waiting',
  created_at: new Date(),
  updated_at: new Date(),
  chat: [
    {
      from: 'system',
      message: 'Patient checked in',
      timestamp: new Date()
    }
  ]
};

async function createDummyPatient() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('tele');
    const patients = database.collection('patients');

    // Check if patient already exists
    const existingPatient = await patients.findOne({ name: 'Ramlal Sinha' });
    
    if (existingPatient) {
      console.log('Patient already exists:');
      console.log(`Name: ${existingPatient.name}`);
      console.log(`ID: ${existingPatient._id}`);
      return;
    }

    // Insert the patient
    const result = await patients.insertOne(patient);
    console.log('Patient created successfully:');
    console.log(`Name: ${patient.name}`);
    console.log(`ID: ${patient._id}`);
    console.log('\nPatient Details:');
    console.log(`Age: ${patient.age}`);
    console.log(`Gender: ${patient.gender}`);
    console.log(`Contact: ${patient.telephone}`);
    console.log(`Address: ${patient.address}`);
    console.log('\nMedical Information:');
    console.log(`Blood Group: ${patient.blood_group}`);
    console.log(`Allergies: ${patient.allergies.join(', ')}`);
    console.log(`Current Medications: ${patient.current_medications.join(', ')}`);
    console.log('\nVitals:');
    console.log(`BP: ${patient.vitals.blood_pressure}`);
    console.log(`Pulse: ${patient.vitals.pulse}`);
    console.log(`SpO2: ${patient.vitals.spo2}%`);
    console.log(`BMI: ${patient.vitals.bmi}`);

  } catch (error) {
    console.error('Error creating patient:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

createDummyPatient();
