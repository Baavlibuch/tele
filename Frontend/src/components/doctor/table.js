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


	const getPatients = () => {
		axios
			.get(ENDPOINT + '/api/patient-list')
			.then((response) => {
				setPatients(response.data.patients);
				reorderPatients();
			})
			.catch((err) => {
				console.log(err);
			});
		axios
			.get(ENDPOINT + '/api/patient-listexcel')
			.then((response) => {
				console.log(response.data.patients)
				setPatientsexcel(response.data.patients);
				reorderPatients();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// const filteredKeys = ['symptoms', 'symptoms_Duration', 'village', 'latitude', 'longitude', 'doctor', 'Last Visited', 'Registered', 'followup'];
	const filteredPatients = patients.filter(patient =>
		(patient._id || '').toLowerCase().includes(searchQuery.toLowerCase())
	);

	const displayedPatients = filteredPatients.slice((page - 1) * rowsPerPage, page * rowsPerPage);
	const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

	const followupCount = patients.filter(patient => patient.followup > 1).length;

	const downloadExcel = () => {
		// Clone and filter the data to include only the specified attributes
		const processedData = patientsexcel.map(patient => {
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


	const handleNavigation = () => {
		window.open('/patients', '_blank');
	};
	

	return (
		<div>
			<div>
				<h5>Total Patients with Follow-up: {followupCount}</h5>
				<button onClick={downloadExcel} className="download-btn">
					Download Excel
				</button>
				<button onClick={handleNavigation} className="download-btn">
					See All Patients
				</button>
			</div>
			<div style={{ marginBottom: '10px' }}>
				<input
					type="text"
					placeholder="Search Patients"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					style={{
						width: '40%',
						padding: '2px',
						border: '1px solid #ddd',
						borderRadius: '4px',
					}}
				/>
			</div>
			<table className="table fadeInUp" style={{ animationDelay: '1s' }}>
				<h5 className="affected-count">
					<button onClick={getPatients} className="refresh">
						<Icon.RefreshCw size={10} />
					</button>
					Patients
				</h5>
				<div style={{ width: '100%', borderCollapse: 'collapse' }}>
					<div style={{ border: '2px solid rgb(230, 230, 230)', fontWeight: 'bold' }}>
						<div style={{ display: 'flex', backgroundColor: 'rgba(137, 137, 137, 0.18)' }}>
							<div style={{ textAlign: 'left', padding: '10px', width: '10%', fontSize: '14px' }}>Sno.</div>
							<div style={{ textAlign: 'left', padding: '10px', width: '80%', fontSize: '14px' }}>Patients</div>
							<div style={{ textAlign: 'left', padding: '10px', width: '10%', fontSize: '14px' }}>Chat</div>
						</div>
					</div>
					{displayedPatients.map((patient, index) => (
						<div key={index}>
							<div>
								<Intable patient={patient} index={index} changePatient={changePatient} getPatient={getPatients} doctorCred={doctor} setpresUploaded={setpresUploaded} />
							</div>
						</div>
					))}
				</div>
				<div style={{ fontSize: '12px' }}>Count: {filteredPatients.length}</div>
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
			</table>
			<DoctorCred doctorId={doctorId} setDoctor={setDoctor} />
		</div>
	);
}

export default Table;
