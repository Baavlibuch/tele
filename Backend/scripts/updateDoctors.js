const mongoose = require('mongoose');
const Doctor = require('../models/doctor');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/telemedicine', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    updateDoctors();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function updateDoctors() {
    try {
        // List of doctors to set as online
        const onlineDoctors = [
            'Dr. Mohit Shukla',
            'Dr. Priya Patel',
            'Dr. Rajesh Kumar',
            'Dr. Anjali Verma'
        ];

        // Update status to 'online' for these doctors
        const result = await Doctor.updateMany(
            { name: { $in: onlineDoctors } },
            { $set: { status: 'online' } }
        );

        console.log('Update result:', result);

        // Get the updated doctors list
        const updatedDoctors = await Doctor.find({ name: { $in: onlineDoctors } });
        
        console.log('\nUpdated Doctors Status:');
        updatedDoctors.forEach(doc => {
            console.log(`- ${doc.name} (${doc.department}): ${doc.status}`);
        });

        // Close the connection
        mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error updating doctors:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}
