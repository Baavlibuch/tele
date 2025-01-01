import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Typography, TextField, Button } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import * as Icon from 'react-feather';
import { ENDPOINT } from '../../config';
import toast from 'react-hot-toast';


// NurseLoginRegister Component
const NurseLoginRegister = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');
    const [expandedRows, setExpandedRows] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [village, setVillage] = useState("");
    const villages = [
        "Siner",
        "Siner-Dharna",
        "Siner-Baliyana",
        "Siner-Gura",
        "Siner-thanmata Hinglaj"
    ];

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
            patients.filter((patient) =>
                Object.values(patient).some((value) =>
                    typeof value === 'string'
                        ? value.toLowerCase().includes(query)
                        : value && value.toString().toLowerCase().includes(query)
                )
            )
        );
    };

    const fetchPatients = () => {
        axios
            .get(`${ENDPOINT}/api/allpatient-listexcel/${village}`)
            .then((response) => {
                console.log(response.data.patients)
                setPatients(response.data.patients);
                setFilteredPatients(response.data.patients);
            })
            .catch((err) => {
                toast.error('Failed to fetch patients.');
                console.error('Error fetching patients:', err);
            });
    };

    // Handle login
    const handleLogin = async () => {
        try {
            const response = await axios.post(`${ENDPOINT}/api/nurselogin`, { username, password });
            setError('');
            console.log(response.data)
            setVillage(response.data.village)
            axios
            .get(`${ENDPOINT}/api/allpatient-listexcel/${response.data.village}`)
            .then((response) => {
                console.log(response.data.patients)
                setPatients(response.data.patients);
                setFilteredPatients(response.data.patients);
            })
            .catch((err) => {
                toast.error('Failed to fetch patients.');
                console.error('Error fetching patients:', err);
            });
            toast.success(response.data.message);
            setIsLoggedIn(true);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while logging in.');
        }
    };

    // Handle registration
    const handleRegister = async () => {
        try {
            const response = await axios.post(`${ENDPOINT}/api/nurseregister`, { username, password, village });
            setIsRegistering(false);
            setError('');
            setUsername('');
            setPassword('');
            toast.success(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during registration.');
        }
    };

    const styles = {
        container: {
            maxWidth: '400px',
            margin: '50px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
        },
        input: {
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '16px',
        },
        button: {
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
        },
        buttonSecondary: {
            backgroundColor: '#28A745',
        },
        link: {
            color: '#007BFF',
            textDecoration: 'underline',
            cursor: 'pointer',
        },
        error: {
            color: 'red',
            fontSize: '14px',
        },
        welcomeText: {
            fontSize: '20px',
            fontWeight: 'bold',
        },
        patientList: {
            listStyle: 'none',
            padding: 0,
        },
        patientItem: {
            padding: '10px',
            borderBottom: '1px solid #ccc',
        },
    };

    return (
        <div>
            {!isLoggedIn ? (
                <div style={styles.container}>
                    <div>
                        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                        {isRegistering && <select
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                            style={styles.input}
                        >
                            <option value="" disabled>
                                Select a village
                            </option>
                            {villages.map((v, index) => (
                                <option key={index} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>}
                        <button
                            onClick={isRegistering ? handleRegister : handleLogin}
                            style={{ ...styles.button, ...(isRegistering ? styles.buttonSecondary : {}) }}
                        >
                            {isRegistering ? 'Register' : 'Login'}
                        </button>
                        {error && <p style={styles.error}>{error}</p>}
                        {/* <div style={styles.link} onClick={() => setIsRegistering(!isRegistering)}>
                            {isRegistering ? 'Already have an account? Login' : 'New user? Register'}
                        </div> */}
                    </div>
                </div>
            ) : (
                <div style={{ width: '100vw' }}>
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

                    <TableContainer component={Paper} style={{ height: "75vh", width: "100%", overflowX: "auto", overflowY: "auto" }}>
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
                                    <TableCell>BP Systolic</TableCell>
                                    <TableCell>BP Diastolic</TableCell>
                                    <TableCell>SPO2</TableCell>
                                    <TableCell>Heart Rate</TableCell>
                                    <TableCell>Prescription</TableCell>
                                    <TableCell>Past History</TableCell>
                                    <TableCell>Advice</TableCell>
                                    <TableCell>Diagnosis</TableCell>
                                    <TableCell>Behavior</TableCell>
                                    <TableCell>Chat History</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPatients.map(patient => (
                                    <React.Fragment key={patient._id}>
                                        <TableRow>
                                            <TableCell>{patient.id ? patient.id : patient._id || "Nil"}</TableCell>
                                            <TableCell>{patient.name || "Nil"}</TableCell>
                                            <TableCell>{patient.age || "Nil"}</TableCell>
                                            <TableCell>{patient.gender || "Nil"}</TableCell>
                                            <TableCell>{patient.telephone || "Nil"}</TableCell>
                                            <TableCell>{patient.hospital || "Nil"}</TableCell>
                                            <TableCell>{patient.doctor || "Nil"}</TableCell>
                                            <TableCell>{patient.village || "Nil"}</TableCell>
                                            <TableCell>{patient.symptoms || "Nil"}</TableCell>
                                            <TableCell>{patient.symptoms_Duration || "Nil"}</TableCell>
                                            <TableCell>{patient.Visit || "Nil"}</TableCell>
                                            <TableCell>{patient['Last Visited'] || "Nil"}</TableCell>
                                            <TableCell>{patient.Registered || "Nil"}</TableCell>
                                            <TableCell>{patient.latitude || "Nil"}</TableCell>
                                            <TableCell>{patient.longitude || "Nil"}</TableCell>
                                            <TableCell>{patient.BP_systolic || "Nil"}</TableCell>
                                            <TableCell>{patient.BP_diastolic || "Nil"}</TableCell>
                                            <TableCell>{patient.SPO2_value || "Nil"}</TableCell>
                                            <TableCell>{patient.heart_rate || "Nil"}</TableCell>
                                            <TableCell>{patient.prescription ? (
                                                <a href={patient.prescription} target="_blank" rel="noopener noreferrer" className="view-link">
                                                    View Prescription
                                                </a>
                                            ) :
                                                // (
                                                // <label className="upload-btn">
                                                //     <Icon.Upload size={14} /> Upload
                                                //     <input
                                                //         type="file"
                                                //         accept=".pdf,.doc,.docx,.txt"
                                                //         onChange={(event) => handleFileUpload(event, patient._id, 'prescription')}
                                                //         style={{ display: 'none' }}
                                                //     />
                                                // </label>
                                                // )
                                                "Nil"
                                            }</TableCell>
                                            <TableCell>{patient.pastHistory || "Nil"}</TableCell>
                                            <TableCell>{patient.advice || "Nil"}</TableCell>
                                            <TableCell>{patient.diagnosis ? (
                                                <div className="diagnosis-container">
                                                    {patient.diagnosis}
                                                </div>
                                            ) :
                                                "Nil"
                                                // (
                                                // <input
                                                //     type="text"
                                                //     placeholder="Enter diagnosis"
                                                //     className="diagnosis-input"
                                                //     // onBlur={(event) => handleFileUpload(event, patient._id, 'diagnosis')}
                                                //     onKeyDown={(event) => {
                                                //         if (event.key === "Enter") {
                                                //             handleFileUpload(event, patient._id, 'diagnosis');
                                                //         }
                                                //     }}
                                                // />
                                                // )
                                            }</TableCell>
                                            {/* <TableCell>{patient.behavior}</TableCell> */}
                                            <TableCell>{
                                                patient.behavior ? (
                                                    <div className="">
                                                        {patient.behavior}
                                                    </div>
                                                ) : "Nil"
                                                // <select
                                                //     className="behavior-dropdown"
                                                //     defaultValue=""
                                                //     onChange={(event) => handleBehaviorChange(event, patient._id)}
                                                // >
                                                //     <option value="" disabled>
                                                //         Behavior
                                                //     </option>
                                                //     <option value="Treated">Treated</option>
                                                //     <option value="Referred">Referred</option>
                                                // </select>
                                            }</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => toggleRow(patient._id)}>
                                                    {expandedRows[patient._id] ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={20}>
                                                <Collapse in={expandedRows[patient._id]} timeout="auto" unmountOnExit>
                                                    <Typography variant="subtitle1">Chat History</Typography>
                                                    {patient.chat.map((msg, index) => (
                                                        <Typography key={index} style={{ marginBottom: '8px' }}>
                                                            {/* {msg.timestamp && <span>[{msg.timestamp}] </span>} */}
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
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </div>
    );
};

export default NurseLoginRegister;
