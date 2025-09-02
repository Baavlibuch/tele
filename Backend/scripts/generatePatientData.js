const mongoose = require('mongoose');
const Patient = require('../models/patient');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/telemed', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data generators
const firstNames = [
  'John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava', 'Robert', 'Isabella',
  'David', 'Mia', 'Joseph', 'Charlotte', 'Charles', 'Amelia', 'Thomas', 'Harper', 'Daniel', 'Evelyn'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const conditions = [
  'Hypertension', 'Diabetes', 'Asthma', 'Arthritis', 'Migraine', 'Anxiety', 'Depression',
  'High Cholesterol', 'GERD', 'Allergies', 'Back Pain', 'Osteoporosis', 'COPD', 'Hypothyroidism'
];

const medications = [
  'Lisinopril', 'Metformin', 'Albuterol', 'Atorvastatin', 'Levothyroxine', 'Metoprolol',
  'Omeprazole', 'Losartan', 'Simvastatin', 'Amlodipine', 'Gabapentin', 'Hydrochlorothiazide'
];

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomVital = (min, max, decimal = 0) => {
  const value = Math.random() * (max - min) + min;
  return decimal === 0 ? Math.round(value) : value.toFixed(decimal);
};

const generateRandomPatient = (id) => {
  const gender = Math.random() > 0.5 ? 'Male' : 'Female';
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const age = Math.floor(Math.random() * 60) + 18;
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const medication = medications[Math.floor(Math.random() * medications.length)];
  
  const systolic = generateRandomVital(90, 160);
  const diastolic = generateRandomVital(60, 100);
  const spo2 = generateRandomVital(92, 100);
  const heartRate = generateRandomVital(60, 100);
  const temperature = generateRandomVital(97, 99.9, 1);
  
  return {
    _id: `PAT${String(id).padStart(4, '0')}`,
    name: `${firstName} ${lastName}`,
    age: age,
    gender: gender,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`,
    address: `${Math.floor(Math.random() * 9999) + 1} ${lastName} St, City${Math.floor(Math.random() * 100) + 1}`,
    bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
    SPO2_value: spo2.toString(),
    BP_systolic: systolic.toString(),
    BP_diastolic: diastolic.toString(),
    BP_value: `${systolic}/${diastolic}`,
    heart_rate: heartRate.toString(),
    Pulserate: heartRate.toString(),
    Temperature_value: temperature.toString(),
    Bloodglucose_value: generateRandomVital(70, 200).toString(),
    Bloodglucose_taken_at: new Date().toISOString(),
    symptoms: condition,
    symptoms_Duration: `${Math.floor(Math.random() * 12) + 1} ${['days', 'weeks', 'months'][Math.floor(Math.random() * 3)]}`,
    vaccination_status: ['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated'][Math.floor(Math.random() * 3)],
    symptomatic_forcovid: Math.random() > 0.7,
    Visit: Math.floor(Math.random() * 5) + 1,
    prescriptions: [{
      id: Date.now(),
      notation: medication,
      saltName: `${medication} ${['5mg', '10mg', '20mg', '50mg', '100mg'][Math.floor(Math.random() * 5)]}`,
      dosage: `${['Once', 'Twice', 'Three times', 'Four times'][Math.floor(Math.random() * 4)]} daily`,
      remarks: 'Take with food'
    }],
    pastHistory: `${condition} for ${Math.floor(Math.random() * 10) + 1} years`,
    diagnosis: `Primary: ${condition}`,
    advice: 'Follow up in 3 months',
    specialRemark: 'Monitor blood pressure regularly',
    is_cardiac_patient: Math.random() > 0.7,
    cardiac_surgery_in_the_past: Math.random() > 0.8,
    createdAt: generateRandomDate(new Date(2022, 0, 1), new Date())
  };
};

const generatePatients = async (count = 25) => {
  try {
    // Clear existing patients
    await Patient.deleteMany({}).exec();
    console.log('Cleared existing patients');
    
    // Generate new patients
    const patients = [];
    for (let i = 1; i <= count; i++) {
      patients.push(generateRandomPatient(i));
    }
    
    // Insert into database
    await Patient.insertMany(patients);
    console.log(`Successfully generated ${count} patient records`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error generating patient data:', error);
    process.exit(1);
  }
};

// Generate 25 patient records
generatePatients(25);
