const mongoose = require('mongoose');
const Patient = require('../models/patient');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tele', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const samplePatients = [
  {
    _id: 'PAT001',
    name: 'Rahul Sharma',
    telephone: '9876543210',
    gender: 'Male',
    age: '45',
    village: 'Jodhpur',
    symptoms: 'Fever, cough, and difficulty breathing',
    symptoms_Duration: '3 days',
    diagnosis: 'Acute Bronchitis',
    created_at: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    last_messaged_at: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    followup: 2,
    doctor: 'dr_singh',
    prescriptions: [
      {
        id: 1,
        notation: 'Tab. Azithromycin 500mg',
        saltName: 'Azithromycin',
        dosage: 'Once daily for 5 days',
        remarks: 'Take after food'
      },
      {
        id: 2,
        notation: 'Syp. Levocetirizine 5mg/5ml',
        saltName: 'Levocetirizine',
        dosage: '5ml twice daily for 7 days',
        remarks: 'At night'
      }
    ]
  },
  {
    _id: 'PAT002',
    name: 'Priya Patel',
    telephone: '8765432109',
    gender: 'Female',
    age: '32',
    village: 'Udaipur',
    symptoms: 'Headache and fatigue',
    symptoms_Duration: '1 week',
    diagnosis: 'Migraine',
    created_at: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    last_messaged_at: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    followup: 1,
    doctor: 'dr_mehta',
    prescriptions: [
      {
        id: 1,
        notation: 'Tab. Sumatriptan 50mg',
        saltName: 'Sumatriptan',
        dosage: 'As needed for migraine',
        remarks: 'Maximum 200mg in 24 hours'
      }
    ]
  },
  {
    _id: 'PAT003',
    name: 'Amit Kumar',
    telephone: '7654321098',
    gender: 'Male',
    age: '28',
    village: 'Jaipur',
    symptoms: 'Stomach pain and diarrhea',
    symptoms_Duration: '2 days',
    diagnosis: 'Gastroenteritis',
    created_at: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    last_messaged_at: Date.now(), // Today
    followup: 0,
    doctor: 'dr_sharma',
    prescriptions: [
      {
        id: 1,
        notation: 'Cap. Ofloxacin 200mg',
        saltName: 'Ofloxacin',
        dosage: 'Twice daily for 3 days',
        remarks: 'After food'
      },
      {
        id: 2,
        notation: 'Syp. ORS',
        saltName: 'Oral Rehydration Solution',
        dosage: 'After every loose stool',
        remarks: 'As needed'
      }
    ]
  }
];

const seedDB = async () => {
  try {
    // Drop the problematic index
    try {
      await Patient.collection.dropIndex('prescriptions.id_1');
      console.log('Dropped prescriptions.id_1 index');
    } catch (e) {
      console.log('Index prescriptions.id_1 does not exist or could not be dropped');
    }
    
    // Clear existing data
    await Patient.deleteMany({});
    console.log('Cleared existing patient data');
    
    // Insert sample data one by one to avoid index issues
    for (const patient of samplePatients) {
      await Patient.create(patient);
      console.log(`Added patient: ${patient.name}`);
    }
    
    console.log('Successfully added all sample patient data');
    
    // Close the connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
