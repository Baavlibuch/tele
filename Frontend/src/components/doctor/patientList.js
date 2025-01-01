import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Button, IconButton, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle, Typography
} from '@mui/material';
import { Edit, Delete, Save } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ENDPOINT } from '../../config';

const Patient = ({ patient, fetchPatients }) => {
    const [editingRow, setEditingRow] = useState(null);
    const [newPatient, setNewPatient] = useState(patient);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePatientId, setDeletePatientId] = useState(null);
    const [Visit, setVisit] = useState(null);
    const [followup, setFollowup] = useState(null);

    const handleSavePatient = (patientId, Visit) => {
        const updatedPatientData = newPatient; // Assuming you are modifying the same patient object
        console.log(patientId, Visit)
        axios
            .put(`${ENDPOINT}/api/update-patient/${patientId}/${Visit}`, updatedPatientData)
            .then((response) => {
                toast.success('Patient updated successfully');
                setEditingRow(null);
                fetchPatients();
            })
            .catch((err) => {
                toast.error('Error updating patient.');
                console.error('Error updating patient:', err);
            });
    };

    const handleDeletePatient = () => {
        axios
            .delete(`${ENDPOINT}/api/delete-patient/${deletePatientId}/${Visit}`)
            .then(() => {
                toast.success('Patient deleted successfully');
                fetchPatients();
            })
            .catch((err) => {
                toast.error('Error deleting patient.');
                console.error('Error deleting patient:', err);
            })
            .finally(() => {
                handleDeleteDialogClose();
            });
    };

    const handleDeleteDialogOpen = (patientId, Visit, followup) => {
        setDeleteDialogOpen(true);
        setDeletePatientId(patientId);
        setVisit(Visit);
        setFollowup(followup);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setDeletePatientId(null);
        setVisit(null);
    };

    const handleEditPatient = (patientId) => {
        setEditingRow(patientId);
    };

    const handleInputChange = (event, patientId, visit) => {
        const { name, value } = event.target;

        setNewPatient((prev) => ({
            ...prev, // Copy all the previous values
            [name]: value // Update the specific field dynamically
        }));
    };



    return (
        <>
            <TableRow key={newPatient._id}>
                <TableCell>{newPatient.id ? newPatient.id : newPatient._id || "Nil"}</TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="name"
                            value={newPatient.name}
                            onChange={(e) => handleInputChange(e, newPatient._id, newPatient.Visit)}
                        />
                    ) : (
                        newPatient.name
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="age"
                            value={newPatient.age}
                            onChange={(e) => handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.age
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="gender"
                            value={newPatient.gender}
                            onChange={(e) => handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.gender
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="telephone"
                            value={newPatient.telephone}
                            onChange={(e) => handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.telephone
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="hospital"
                            value={newPatient.hospital}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.hospital
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="doctor"
                            value={newPatient.doctor}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.doctor
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="village"
                            value={newPatient.village}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.village
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="symptoms"
                            value={newPatient.symptoms}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.symptoms
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="symptomsDuration"
                            value={newPatient.symptoms_Duration}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.symptoms_Duration
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="followUp"
                            value={newPatient.Visit}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.Visit
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="lastVisited"
                            value={newPatient.lastVisited}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.lastVisited
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="registered"
                            value={newPatient.Registered}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.Registered
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="latitude"
                            value={newPatient.latitude}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.latitude
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="longitude"
                            value={newPatient.longitude}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.longitude
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="bpSystolic"
                            value={newPatient.BP_systolic}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.BP_systolic
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="bpDiastolic"
                            value={newPatient.BP_diastolic}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.BP_diastolic
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="spo2"
                            value={newPatient.SPO2_value}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.SPO2_value
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="heartRate"
                            value={newPatient.heart_rate}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.heart_rate
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="prescription"
                            value={newPatient.prescription}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.prescription
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="pastHistory"
                            value={newPatient.pastHistory}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.pastHistory
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="advice"
                            value={newPatient.advice}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.advice
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="diagnosis"
                            value={newPatient.diagnosis}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.diagnosis
                    )}
                </TableCell>
                <TableCell>
                    {editingRow === (newPatient.id ? newPatient.id : newPatient._id) ? (
                        <textarea
                            name="behavior"
                            value={newPatient.behavior}
                            onChange={(e) => newPatient.Visit > 1 ? handleInputChange(e, newPatient.id, newPatient.Visit) : handleInputChange(e, (newPatient.id ? newPatient.id : newPatient._id), newPatient.Visit)}
                        />
                    ) : (
                        newPatient.behavior
                    )}
                </TableCell>
                {
                    newPatient.Visit === 1 ?
                        <TableCell>
                            {editingRow === newPatient._id ? (
                                <IconButton onClick={() => handleSavePatient(newPatient._id, newPatient.Visit)}>
                                    <Save />
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => handleEditPatient(newPatient._id)}>
                                    <Edit />
                                </IconButton>
                            )}
                            <IconButton onClick={() => handleDeleteDialogOpen(newPatient._id, newPatient.Visit, newPatient.followup)}>
                                <Delete />
                            </IconButton>
                        </TableCell> :
                        <TableCell>
                            {editingRow === newPatient.id ? (
                                <IconButton onClick={() => handleSavePatient(newPatient.id, newPatient.Visit)}>
                                    <Save />
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => handleEditPatient(newPatient.id)}>
                                    <Edit />
                                </IconButton>
                            )}
                            <IconButton onClick={() => handleDeleteDialogOpen(newPatient.id, newPatient.Visit, newPatient.followup)}>
                                <Delete />
                            </IconButton>
                        </TableCell>
                }
            </TableRow>
            <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                <DialogTitle>Delete Patient</DialogTitle>
                {(newPatient.Visit === 1 && newPatient.followup !== 1) ? (
                    <>
                        <DialogContent>
                            <DialogContentText>
                                You cannot delete a patient with multiple Visits.
                                First, delete all Visits, then continue?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                        </DialogActions>
                    </>
                ) : (
                    <>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to delete this patient?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                            <Button onClick={handleDeletePatient}>Confirm</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};

export default Patient;
