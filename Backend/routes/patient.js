const express = require('express');
const router = express.Router();
const Patient = require('../models/patient');
const { validationResult } = require('express-validator');
const { body, query } = require('express-validator');

// Validation middleware for patient list query params
const validatePatientList = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim(),
  query('village').optional().trim(),
  query('doctor').optional().trim(),
  query('sortBy').optional().isIn(['name', 'created_at', 'last_messaged_at', 'followup']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

/**
 * @route GET /api/patient-list
 * @description Get paginated list of patients with filtering and sorting
 * @access Private (Add your auth middleware)
 */
router.get('/patient-list', validatePatientList, async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Build query
    const query = {};
    
    // Search filter
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Village filter
    if (req.query.village) {
      query.village = new RegExp(req.query.village, 'i');
    }
    
    // Doctor filter
    if (req.query.doctor) {
      query.doctor = req.query.doctor;
    }

    // Get total count for pagination
    const total = await Patient.countDocuments(query);
    
    // Get paginated patients
    const patients = await Patient.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-__v -chat -conversation_state -monte_carlo_tree -facts -patient_state')
      .lean();

    // Format response
    const formattedPatients = patients.map(patient => ({
      _id: patient._id,
      name: patient.name,
      telephone: patient.telephone,
      village: patient.village,
      symptoms: patient.symptoms,
      symptoms_Duration: patient.symptoms_Duration,
      Registered: patient.created_at,
      'Last Visited': patient.last_messaged_at || patient.created_at,
      followup: patient.followup || 0,
      doctor: patient.doctor || 'Unassigned',
      age: patient.age || 'N/A',
      gender: patient.gender || 'N/A'
    }));

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      patients: formattedPatients
    });

  } catch (error) {
    console.error('Error fetching patient list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/patient/:id
 * @description Get detailed information about a specific patient
 * @access Private (Add your auth middleware)
 */
router.get('/patient/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .select('-__v -conversation_state -monte_carlo_tree')
      .lean();
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Format prescriptions if they exist
    if (patient.prescriptions && Array.isArray(patient.prescriptions)) {
      patient.prescriptions = patient.prescriptions.map(prescription => ({
        id: prescription.id,
        notation: prescription.notation || '',
        saltName: prescription.saltName || '',
        dosage: prescription.dosage || '',
        remarks: prescription.remarks || ''
      }));
    }

    res.json({
      success: true,
      patient
    });

  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/patient-search
 * @description Search patients by name, phone, or symptoms
 * @access Private (Add your auth middleware)
 */
router.get('/patient-search', [
  query('q').trim().notEmpty().withMessage('Search query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const searchQuery = req.query.q;
    const limit = parseInt(req.query.limit) || 10;

    const patients = await Patient.find(
      { $text: { $search: searchQuery } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .select('name telephone village symptoms followup created_at last_messaged_at')
    .lean();

    const formattedResults = patients.map(patient => ({
      _id: patient._id,
      name: patient.name,
      telephone: patient.telephone,
      village: patient.village,
      symptoms: patient.symptoms,
      followup: patient.followup || 0,
      lastVisited: patient.last_messaged_at || patient.created_at
    }));

    res.json({
      success: true,
      results: formattedResults
    });

  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching patients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
