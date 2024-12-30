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
	};

	const filteredKeys = ['symptoms', 'symptoms_Duration', 'village', 'latitude', 'longitude', 'doctor', 'Last Visited', 'Registered', 'followup'];
	const filteredPatients = patients.filter((patient) => {
		return filteredKeys.some((key) => {
			return patient[key] && patient[key].toString().toLowerCase().includes(searchQuery.toLowerCase());
		});
	});

	const displayedPatients = filteredPatients.slice((page - 1) * rowsPerPage, page * rowsPerPage);
	const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);

	const followupCount = patients.filter(patient => patient.followup > 1).length;

	const downloadExcel = () => {
		// window.location.reload();
		const worksheet = XLSX.utils.json_to_sheet(patients);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
		XLSX.writeFile(workbook, 'patients.xlsx');
	};

	const handleNavigation = () => {
		history.push('/patients');
	};

	// const handleFileUpload = (event, patientId, type) => {
	// 	if (type === "prescription") {
	// 		console.log("event-", event.target.files[0]);
	// 		setpresUploaded(event.target.files[0]);
	// 		const file = event.target.files[0];
	// 		if (!file) return;

	// 		const formData = new FormData();
	// 		formData.append('file', file);
	// 		formData.append('type', type);
	// 		formData.append('patientId', patientId);

	// 		axios
	// 			.post(`${ENDPOINT}/api/presc_n_diagnosis`, formData)
	// 			.then((response) => {
	// 				alert('File uploaded successfully');
	// 				getPatients();
	// 			})
	// 			.catch((error) => {
	// 				console.error('Error uploading file:', error);
	// 			});
	// 	} else if (type === "diagnosis") {
	// 		const inputValue = event.target.value;
	// 		if (!inputValue) return;

	// 		axios
	// 			.post(`${ENDPOINT}/api/onlydiagnosis`, {
	// 				patientId,
	// 				diagnosis: inputValue,
	// 			})
	// 			.then((response) => {
	// 				// alert('Diagnosis details saved successfully');
	// 				getPatients();
	// 			})
	// 			.catch((error) => {
	// 				console.error('Error saving diagnosis:', error);
	// 			});
	// 	}
	// };


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
			<table className="table fadeInUp" style={{ animationDelay: '1s' }}>
				<h5 className="affected-count">
					<button onClick={getPatients} className="refresh">
						<Icon.RefreshCw size={10} />
					</button>
					Patients
				</h5>
				{/* {displayedPatients.map((patient, index) => (
					<tbody key={index}>
						<Row key={index} patient={patient} />
						<tr>
							<td colSpan="4">
								{patient.doctor === username ? (
									<button
										className="send"
										style={{ margin: 0 }}
										onClick={(e) => {
											e.preventDefault();
											changePatient(patient._id);
										}}
									>
										<Icon.MessageCircle />
									</button>
								) : null}
							</td>
							<td>
								{patient.prescription ? (
									<a href={patient.prescription} target="_blank" rel="noopener noreferrer" className="view-link">
										View Prescription
									</a>
								) : (
									<label className="upload-btn">
										<Icon.Upload size={14} /> Upload
										<input
											type="file"
											accept=".pdf,.doc,.docx,.txt"
											onChange={(event) => handleFileUpload(event, patient._id, 'prescription')}
											style={{ display: 'none' }}
										/>
									</label>
								)}
							</td>
							<td>
								{patient.diagnosis ? (
									<div className="diagnosis-container">
										{patient.diagnosis}
									</div>
								) : (
									<input
										type="text"
										placeholder="Enter diagnosis"
										className="diagnosis-input"
										// onBlur={(event) => handleFileUpload(event, patient._id, 'diagnosis')}
										onKeyDown={(event) => {
											if (event.key === "Enter") {
												handleFileUpload(event, patient._id, 'diagnosis');
											}
										}}
									/>
								)}
							</td>
							<td>
								{
									patient.behavior ? (
										<div className="">
											{patient.behavior}
										</div>
									) :
										<select
											className="behavior-dropdown"
											defaultValue=""
											onChange={(event) => handleBehaviorChange(event, patient._id)}
										>
											<option value="" disabled>
												Behavior
											</option>
											<option value="Treated">Treated</option>
											<option value="Referred">Referred</option>
										</select>
								}
							</td>
						</tr>
					</tbody>
				))} */}
				<div style={{ width: '100%', borderCollapse: 'collapse' }}>
					<div style={{border:'2px solid rgb(230, 230, 230)', fontWeight:'bold'}}>
						<div style={{ display: 'flex', backgroundColor: 'rgba(137, 137, 137, 0.18)' }}>
							<div style={{ textAlign: 'left', padding: '10px', width: '10%', fontSize: '14px' }}>Sno.</div>
							<div style={{ textAlign: 'left', padding: '10px', width: '80%', fontSize: '14px' }}>Patients</div>
							<div style={{ textAlign: 'left', padding: '10px', width: '10%',fontSize: '14px' }}>Chat</div>
						</div>
					</div>
					{displayedPatients.map((patient, index) => (
						<div key={index}>
							<div>
								<Intable patient={patient} index={index} changePatient={changePatient} getPatient={getPatients} doctorCred={doctor}/>
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
			<DoctorCred doctorId={doctorId} setDoctor={setDoctor}/>
		</div>
	);
}

export default Table;
