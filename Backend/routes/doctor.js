const express = require('express');
const Doctor = require('../models/doctor');
const router = express.Router();

// Doctor login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find doctor by username
        const doctor = await Doctor.findOne({ username });
        
        // Check if doctor exists
        if (!doctor) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check password (in a real app, use bcrypt for password hashing)
        if (password !== doctor.password) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Set session or JWT token here if needed
        // For now, just return success with doctor data (excluding password)
        const { password: _, ...doctorData } = doctor._doc;
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            doctor: doctorData
        });
        
    } catch (error) {
        console.error('Error during doctor login:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred during login',
            error: error.message
        });
    }
});

// Update specific doctors to online status
router.post('/update-doctors-online', async (req, res) => {
    try {
        // List of doctor names to set as online
        const onlineDoctors = [
            'Dr. Mohit Shukla',
            'Dr. Priya Patel',
            'Dr. Rajesh Kumar',
            'Dr. Anjali Verma'
        ];

        // Update status to 'online' for these doctors
        await Doctor.updateMany(
            { name: { $in: onlineDoctors } },
            { $set: { status: 'online' } }
        );

        // Get the updated doctors list
        const updatedDoctors = await Doctor.find({ name: { $in: onlineDoctors } });
        
        res.status(200).json({
            success: true,
            message: 'Doctors status updated to online',
            updatedDoctors: updatedDoctors.map(doc => ({
                name: doc.name,
                status: doc.status,
                department: doc.department
            }))
        });
    } catch (error) {
        console.error('Error updating doctors status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating doctors status',
            error: error.message
        });
    }
});

// Get all doctors
router.get('/Alldoctor-list', async (req, res) => {
    try {
        const doctors = await Doctor.find({}, { password: 0 }); // Exclude passwords
        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ 
                success: false,
                message: 'Doctor not found' 
            });
        }
        
        // Exclude password from response
        const { password, ...doctorData } = doctor._doc;
        
        res.status(200).json({
            success: true,
            doctor: doctorData
        });
        
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching doctor',
            error: error.message
        });
    }
});

module.exports = router;
