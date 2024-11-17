import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import { ENDPOINT } from '../../config';
import Row from './row';
import * as XLSX from 'xlsx'; // For Excel
import { useHistory } from 'react-router-dom';

function Table({ username, changePatient, callStarted }) {
	const [patients, setPatients] = useState([]);
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const rowsPerPage = 10;
	const history = useHistory();

	useEffect(() => {
		const timer = setInterval(() => {
			getPatients();
		}, 20000 * 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		getPatients();
	}, [callStarted]);

	const getPatients = () => {
		axios
			.get(ENDPOINT + '/api/patient-list')
			.then((response) => {
				setPatients(response.data.patients);
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
		const worksheet = XLSX.utils.json_to_sheet(patients);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
		XLSX.writeFile(workbook, 'patients.xlsx');
	};

	const handleNavigation = () => {
		history.push('/patients');
	};

	const handleFileUpload = (event, patientId, type) => {
		const file = event.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);
		formData.append('patientId', patientId);

		axios.post(`${ENDPOINT}/api/presc_n_diagnosis`, formData)
			.then((response) => {
				alert('File uploaded successfully');
				getPatients();
			})
			.catch((error) => {
				console.error('Error uploading file:', error);
			});
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
			<table className="table fadeInUp" style={{ animationDelay: '1s' }}>
				<h5 className="affected-count">
					<button onClick={getPatients} className="refresh">
						<Icon.RefreshCw size={10} />
					</button>
					Patients
				</h5>
				<thead>
					<tr>
						<th className="state-heading">
							<div className="heading-content">
								<abbr title="Name">Name</abbr>
							</div>
						</th>
						<th>
							<div className="heading-content">
								<abbr title="Telephone">Telephone</abbr>
							</div>
						</th>
						<th>
							<div className="heading-content">
								<abbr title="Age">Age</abbr>
							</div>
						</th>
						<th>
							<div className="heading-content">
								<abbr title="Gender">Sex</abbr>
							</div>
						</th>
						<th>Prescription</th>
						<th>Diagnosis</th>
					</tr>
				</thead>
				{displayedPatients.map((patient, index) => (
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
								{/* Display existing prescription if available */}
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
								{/* Display existing diagnosis if available */}
								{patient.diagnosis ? (
									<a href={patient.diagnosis} target="_blank" rel="noopener noreferrer" className="view-link">
										View Diagnosis
									</a>
								) : (
									<label className="upload-btn">
										<Icon.Upload size={14} /> Upload
										<input
											type="file"
											accept=".pdf,.doc,.docx,.txt"
											onChange={(event) => handleFileUpload(event, patient._id, 'diagnosis')}
											style={{ display: 'none' }}
										/>
									</label>
								)}
							</td>
						</tr>
					</tbody>
				))}
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
		</div>
	);
}

export default Table;
