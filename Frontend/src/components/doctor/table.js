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
		const currentUrl = window.location.origin;

		const modifiedPatients = patients.map((patient) => {
			const imagesAndDocs = patient.chat
				.filter(convo => convo.statement && convo.statement.startsWith('chat-img-') && 
					(convo.statement.endsWith('.jpg') || convo.statement.endsWith('.pdf')))
					.map(convo => `${currentUrl}/aa/images/${convo.statement.replace("chat-img-", "")}`)
				.join(', ');

			return {
				...patient,
				"Images and Documents": imagesAndDocs || 'N/A'
			};
		});

		const worksheet = XLSX.utils.json_to_sheet(modifiedPatients);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');

		XLSX.writeFile(workbook, 'patients.xlsx');
	};

	const handleNavigation = () => {
		history.push('/patients');
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
								<abbr className={`${window.innerWidth <= 769 ? 'is-cherry' : ''}`} title="Telephone">
									{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'T' : 'Tel') : 'Telephone'}
								</abbr>
							</div>
						</th>
						<th>
							<div className="heading-content">
								<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Age">
									{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'A' : 'Age') : 'Age'}
								</abbr>
							</div>
						</th>
						<th>
							<div className="heading-content">
								<abbr className={`${window.innerWidth <= 769 ? 'is-green' : ''}`} title="Gender">
									{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'G' : 'Gen') : 'Sex'}
								</abbr>
							</div>
						</th>
					</tr>
				</thead>
				{displayedPatients.map((patient, index) => (
					<tbody key={index}>
						<Row key={index} patient={patient} />
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
