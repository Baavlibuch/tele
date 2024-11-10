import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Typography, TextField, Button } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

function PatientList() {
    const [patients, setPatients] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        axios
            .get('/api/all-patients')
            .then((response) => {
                setPatients(response.data.patients);
                setFilteredPatients(response.data.patients);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const toggleRow = (patientId) => {
        setExpandedRows(prevState => ({
            ...prevState,
            [patientId]: !prevState[patientId]
        }));
    };

    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        setFilteredPatients(
            patients.filter(patient =>
                patient.name.toLowerCase().includes(query) ||
                patient._id.toLowerCase().includes(query) ||
                patient.symptoms.some(symptom => symptom.toLowerCase().includes(query))
            )
        );
    };

    return (
        <div>

            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Search Patients"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ marginRight: '10px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setSearchQuery('')}
                >
                    Clear Search
                </Button>
            </div>

            <Typography variant="h6">
                Total Findings: {filteredPatients.length}
            </Typography>

            <TableContainer component={Paper}>
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
                            <TableCell>Follow-up</TableCell>
                            <TableCell>Last Visited</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell>Latitude</TableCell>
                            <TableCell>Longitude</TableCell>
                            <TableCell>Chat History</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPatients.map(patient => (
                            <>
                                <TableRow key={patient._id}>
                                    <TableCell>{patient._id}</TableCell>
                                    <TableCell>{patient.name}</TableCell>
                                    <TableCell>{patient.age}</TableCell>
                                    <TableCell>{patient.gender}</TableCell>
                                    <TableCell>{patient.telephone}</TableCell>
                                    <TableCell>{patient.hospital}</TableCell>
                                    <TableCell>{patient.doctor}</TableCell>
                                    <TableCell>{patient.village}</TableCell>
                                    <TableCell>{patient.symptoms.join(', ')}</TableCell> {/* Join symptoms if it's an array */}
                                    <TableCell>{patient.symptoms_Duration}</TableCell>
                                    <TableCell>{patient.followup}</TableCell>
                                    <TableCell>{patient['Last Visited']}</TableCell>
                                    <TableCell>{patient.Registered}</TableCell>
                                    <TableCell>{patient.latitude}</TableCell>
                                    <TableCell>{patient.longitude}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => toggleRow(patient._id)}>
                                            {expandedRows[patient._id] ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={15}>
                                        <Collapse in={expandedRows[patient._id]} timeout="auto" unmountOnExit>
                                            <Typography variant="subtitle1">Chat History</Typography>
                                            {patient.chat.map((msg, index) => (
                                                <Typography key={index}>
                                                    {(typeof msg.statement === 'string') && (msg.statement.endsWith('.jpg') || msg.statement.endsWith('.jpeg') || msg.statement.endsWith('.png')) ? (
                                                        <a href={`/aa/images/` + msg.statement.split('-')[2]} download>
                                                            <img
                                                                src={`/aa/images/` + msg.statement.split('-')[2]}
                                                                alt=""
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                        </a>
                                                    ) : (typeof msg.statement === 'string') && msg.statement.endsWith('.pdf') ? (
                                                        <a
                                                            href={`/aa/images/` + msg.statement.split('-')[2]}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            style={{ fontSize: '18px' }}
                                                        >
                                                            Download PDF
                                                        </a>
                                                    ) : (
                                                        msg.statement
                                                    )}
                                                </Typography>
                                            ))}
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default PatientList;
