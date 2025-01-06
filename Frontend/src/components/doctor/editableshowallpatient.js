import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Typography
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { ENDPOINT } from '../../config';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx'; // For Excel
import Patient from './patientList';

function ManagePatients() {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: '', telephone: '' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = () => {
        axios
            .get(`${ENDPOINT}/api/allpatient-listexcel`)
            .then((response) => {
                setPatients(response.data.patients);
                setFilteredPatients(response.data.patients);
            })
            .catch((err) => {
                toast.error('Failed to fetch patients.');
                console.error('Error fetching patients:', err);
            });
    };

    const handleAddPatient = () => {
        if (!newPatient.name || !newPatient.age || !newPatient.gender || !newPatient.telephone) {
            toast.error('All fields are required.');
            return;
        }
        axios
            .post(`${ENDPOINT}/api/add-patient`, newPatient)
            .then((response) => {
                toast.success('Patient added successfully');
                setNewPatient({ name: '', age: '', gender: '', telephone: '' });
                fetchPatients();
            })
            .catch((err) => {
                toast.error('Error adding patient.');
                console.error('Error adding patient:', err);
            });
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        setFilteredPatients(
            patients.filter((patient) =>
                Object.values(patient).some((value) =>
                    typeof value === 'string'
                        ? value.toLowerCase().includes(query)
                        : value && value.toString().toLowerCase().includes(query)
                )
            )
        );
    };

    const downloadExcel = () => {
        // Clone and filter the data to include only the specified attributes
        const processedData = patients.map(patient => {
            // Format the prescriptions array
            if (Array.isArray(patient.prescriptions)) {
                patient.prescriptions = patient.prescriptions
                    .map(prescription =>
                        `Notation: ${prescription.notation || ''}, SaltName: ${prescription.saltName || ''}, Dosage: ${prescription.dosage || ''}, Remarks: ${prescription.remarks || ''}, ID: ${prescription.id || ''}`
                    )
                    .join('\n'); // Separate multiple prescriptions with a newline
            }

            // Return only the required attributes
            return {
                Id: patient.id ? patient.id : patient._id || "Nil",
                Name: patient.name || "Nil",
                Age: patient.age || "Nil",
                Gender: patient.gender || "Nil",
                Telephone: patient.telephone || "Nil",
                Hospital: patient.hospital || "Nil",
                Timestamp: patient.timestamps || "Nil",
                Ip: patient.ip || "Nil",
                Doctor: patient.doctor || "Nil",
                Village: patient.village || "Nil",
                Symptoms: patient.symptoms || "Nil",
                "Symptoms duration": patient.symptoms_Duration || "Nil",
                "BP systolic": patient.BP_systolic || "Nil",
                "BP diastolic": patient.BP_diastolic || "Nil",
                "BP image": patient.BP_Image || "Nil",
                Spo2: patient.SPO2_value || "Nil",
                "Heart rate": patient.heart_rate || "Nil",
                "Spo2 / heart rate image": patient.Spo2_Image || "Nil",
                "ECG (yes no)": patient.ECG_Image ? "Yes" : "No" || "Nil",
                "ECG pdf": patient.ECG_Image || "Nil",
                Followup: patient.Visit ? patient.Visit : patient.followup || "Nil",
                "Last visit": patient['Last Visited'] || "Nil",
                "Register visit": patient['Registered'] || "Nil",
                Longitude: patient.longitude || "Nil",
                Latitude: patient.latitude || "Nil",
                "Prescriptions": patient.prescriptions || "Nil",
                "Prescription pdf": patient.prescription || "Nil",
                "Diagnosis / chief complaint": patient.diagnosis || "Nil",
                Behaviour: patient.behavior || "Nil",
                Advice: patient.advice || "Nil",
                "Special Remark": patient.specialRemark || "Nil",
            };
        });

        // Generate the Excel file
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
        XLSX.writeFile(workbook, 'patients.xlsx');
    };

    return (
        <div>
            <h2>Manage Patients</h2>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="text"
                    placeholder="Gender"
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="tel"
                    placeholder="Telephone"
                    value={newPatient.telephone}
                    onChange={(e) => setNewPatient({ ...newPatient, telephone: e.target.value })}
                    style={{ marginRight: '10px' }}
                />
                <Button variant="contained" color="primary" onClick={handleAddPatient}>
                    Add Patient
                </Button>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearch}
                    style={{ marginRight: '10px', width: '200px' }}
                />
                <IconButton>
                    <Search />
                </IconButton>
                <Button variant="outlined" color="secondary" onClick={downloadExcel} style={{ marginLeft: '20px' }}>
                    Download Excel
                </Button>
            </div>

            <Typography variant="h6">
                Total Findings: {filteredPatients.length}
            </Typography>

            <TableContainer component={Paper} style={{ maxHeight: "60vh", overflowX: "auto", marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Telephone</TableCell>
                            <TableCell>Hospital</TableCell>
                            <TableCell>Doctor</TableCell>
                            <TableCell>Village</TableCell>
                            <TableCell>Symptoms</TableCell>
                            <TableCell>Symptoms Duration</TableCell>
                            <TableCell>Visit</TableCell>
                            <TableCell>Last Visited</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell>Latitude</TableCell>
                            <TableCell>Longitude</TableCell>
                            <TableCell>BP Systolic</TableCell>
                            <TableCell>BP Diastolic</TableCell>
                            <TableCell>SPO2</TableCell>
                            <TableCell>Heart Rate</TableCell>
                            <TableCell>Prescription</TableCell>
                            <TableCell>Past History</TableCell>
                            <TableCell>Advice</TableCell>
                            <TableCell>Diagnosis</TableCell>
                            <TableCell>Behavior</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPatients.map((patient) => (
                            <Patient key={patient._id || patient.id} patient={patient} fetchPatients={fetchPatients} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default ManagePatients;
