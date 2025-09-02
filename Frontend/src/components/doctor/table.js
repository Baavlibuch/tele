import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import { ENDPOINT } from '../../config';
import Row from './row';
import * as XLSX from 'xlsx'; // For Excel
import { useHistory } from 'react-router-dom';
import Intable from './Intable';
import DoctorCred from './doctorCred';

function Table({ username, changePatient, callStarted, setpresUploaded, currPatient, doctorId }) {
	const [patients, setPatients] = useState([]);
	const [patientsexcel, setPatientsexcel] = useState([]);
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const rowsPerPage = 10;
	const history = useHistory();
	const [prevCurrPatient, setPrevCurrPatient] = useState("tt-3333333333");
	const [doctor, setDoctor] = useState();

	useEffect(() => {
		const timer = setInterval(() => {
			getPatients();
		}, 20000 * 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		getPatients();
	}, [callStarted]);

	useEffect(() => {
		console.log("currpatient", currPatient)
		console.log("prevpatient", prevCurrPatient)
		console.log("reorder")
		reorderPatients();
	}, [currPatient]);

	const reorderPatients = () => {
		const currPatientIndex = patients.findIndex(patient => patient._id === currPatient);
		if (currPatientIndex !== -1) {
			const reorderedPatients = [
				patients[currPatientIndex],
				...patients.slice(0, currPatientIndex),
				...patients.slice(currPatientIndex + 1),
			];
			console.log("setPatient")
			setPatients(reorderedPatients);
		}
	};


	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const getPatients = async () => {
		try {
			setLoading(true);
			setError(null);
			
			// Fetch paginated and filtered patient list
			const [patientsRes, excelRes] = await Promise.all([
				axios.get(`${ENDPOINT}/api/patient-list`, {
					params: {
						page,
						limit: rowsPerPage,
						search: searchQuery,
						sortBy: 'created_at',
						sortOrder: 'desc'
					}
				}),
				axios.get(`${ENDPOINT}/api/patient-list`, {
					params: { limit: 1000 } // For Excel export
				})
			]);

			setPatients(patientsRes.data.patients);
			setPatientsexcel(excelRes.data.patients || []);
			reorderPatients();
		} catch (err) {
			console.error('Error fetching patients:', err);
			setError('Failed to load patient data. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// const filteredKeys = ['symptoms', 'symptoms_Duration', 'village', 'latitude', 'longitude', 'doctor', 'Last Visited', 'Registered', 'followup'];
	const filteredPatients = patients.filter(patient => {
		const searchLower = searchQuery.toLowerCase();
		return (
			(patient.name || '').toLowerCase().includes(searchLower) ||
			(patient.telephone || '').includes(searchQuery) ||
			(patient.village || '').toLowerCase().includes(searchLower) ||
			(patient.diagnosis || '').toLowerCase().includes(searchLower) ||
			(patient.symptoms || '').toLowerCase().includes(searchLower)
		);
	});

	const displayedPatients = filteredPatients.slice((page - 1) * rowsPerPage, page * rowsPerPage);
	const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

	const followupCount = patients.filter(patient => patient.followup > 1).length;

	const downloadExcel = () => {
    try {
        const processedData = patientsexcel.map(patient => {
            // Format the prescriptions array
            let prescriptionsText = '';
            if (Array.isArray(patient.prescriptions)) {
                prescriptionsText = patient.prescriptions
                    .map(prescription => 
                        `Notation: ${prescription.notation || ''}, SaltName: ${prescription.saltName || ''}, ` +
                        `Dosage: ${prescription.dosage || ''}, Remarks: ${prescription.remarks || ''}`
                    )
                    .join('\n');
            }

            return {
                'Patient ID': patient._id || 'N/A',
                'Name': patient.name || 'N/A',
                'Phone': patient.telephone || 'N/A',
                'Age': patient.age || 'N/A',
                'Gender': patient.gender || 'N/A',
                'Village': patient.village || 'N/A',
                'IP Address': patient.ip || 'N/A',
                'Symptoms': patient.symptoms || 'N/A',
                'Symptom Duration': patient.symptoms_Duration || 'N/A',
                'Diagnosis': patient.diagnosis || 'N/A',
                'BP Systolic': patient.BP_systolic || 'N/A',
                'BP Diastolic': patient.BP_diastolic || 'N/A',
                'SpO2': patient.SPO2_value || 'N/A',
                'Heart Rate': patient.heart_rate || 'N/A',
                'ECG': patient.ECG_Image ? 'Yes' : 'No',
                'Prescriptions': prescriptionsText || 'None',
                'Behavior': patient.behavior || 'N/A',
                'Advice': patient.advice || 'N/A',
                'Special Remarks': patient.specialRemark || 'N/A',
                'Last Visit': patient.last_messaged_at 
                    ? new Date(patient.last_messaged_at).toLocaleDateString() 
                    : 'N/A',
                'Registered On': patient.created_at 
                    ? new Date(patient.created_at).toLocaleDateString() 
                    : 'N/A',
                'Follow-ups': patient.followup || 0,
                'Doctor': patient.doctor || 'N/A',
                'Longitude': patient.longitude || 'N/A',
                'Latitude': patient.latitude || 'N/A'
            };
        });

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(processedData);
        
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Patients');
        
        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `patient_records_${new Date().toISOString().split('T')[0]}.xlsx`);
        
    } catch (error) {
        console.error('Error generating Excel file:', error);
        alert('Error generating Excel file. Please try again.');
    }
};


	const handleNavigation = () => {
		window.open('/patients', '_blank');
	};
	

	return (
		<div className="table-container">
			<div className="controls">
				<div className="search-container">
					<Icon.Search className="search-icon" />
					<input
						type="text"
						placeholder="Search by name, phone, village, or symptoms..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="table-actions">
					<h5>Total Patients with Follow-up: {followupCount}</h5>
					<button onClick={downloadExcel} className="download-btn">
						Download Excel
					</button>
					<button onClick={handleNavigation} className="download-btn">
						See All Patients
					</button>
				</div>
			</div>
			<div className="table-title">
				<button onClick={getPatients} className="refresh">
					<Icon.RefreshCw size={10} />
				</button>
				<span>Patients</span>
			</div>
			<div className="table-content">
				<table>
					<thead>
						<tr>
							<th>Patient</th>
							<th>Contact</th>
							<th>Symptoms</th>
							<th>Diagnosis</th>
							<th>Last Visit</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{displayedPatients.map((patient, index) => (
							<tr key={index} className={currPatient === patient._id ? 'active-patient' : ''}>
								<td>
									<div className="patient-info">
										<div className="patient-name">{patient.name}</div>
										<div className="patient-meta">
											<span>ID: {patient._id}</span>
											<span>•</span>
											<span>{patient.age} years</span>
											<span>•</span>
											<span>{patient.gender}</span>
										</div>
										<div className="patient-village">
											<Icon.MapPin size={12} /> {patient.village || 'N/A'}
										</div>
									</div>
								</td>
								<td>
									<div className="contact-info">
										<div><Icon.Phone size={14} /> {patient.telephone || 'N/A'}</div>
										{patient.doctor && (
											<div className="doctor-info">
												<Icon.User size={14} /> Dr. {patient.doctor.replace('dr_', '')}
											</div>
										)}
									</div>
								</td>
								<td className="symptoms-cell">
									<div className="symptoms">
										{patient.symptoms || 'No symptoms recorded'}
										{patient.symptoms_Duration && (
											<span className="duration">({patient.symptoms_Duration})</span>
										)}
									</div>
								</td>
								<td>
									{patient.diagnosis || 'Pending diagnosis'}
								</td>
								<td>
									{patient.last_messaged_at
										? new Date(patient.last_messaged_at).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric'
										}) 
										: 'N/A'}
									{patient.followup > 0 && (
										<span className="followup-badge">
											<Icon.RefreshCw size={12} /> {patient.followup}
										</span>
									)}
								</td>
								<td>
									<Intable 
										patient={patient} 
										index={index} 
										changePatient={changePatient} 
										getPatient={getPatients} 
										doctorCred={doctor} 
										setpresUploaded={setpresUploaded} 
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="table-footer">
				<div className="patient-count">Count: {filteredPatients.length}</div>
				<div className="pagination">
					<button
						onClick={() => setPage(Math.max(1, page - 1))}
						className="arrow"
						disabled={page === 1}
					>
						<Icon.ArrowLeft size={16} />
					</button>
					<span>
						Page {page} of {totalPages}
					</span>
					<button
						onClick={() => setPage(Math.min(totalPages, page + 1))}
						className="arrow"
						disabled={page === totalPages}
					>
						<Icon.ArrowRight size={16} />
					</button>
				</div>
			</div>
			<DoctorCred doctorId={doctorId} setDoctor={setDoctor} />
		</div>
	);
}

export default Table;
