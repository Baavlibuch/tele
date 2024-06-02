import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import { ENDPOINT } from '../../config';

import Row from './row';

function Table({ username, changePatient }) {
	const [patients, setPatients] = useState([]);
	const [page, setPage] = useState(1);

	useEffect(() => {
		const timer = setInterval(() => {
			getPatients();
		}, 20000 * 1000);
		return () => clearInterval(timer);
	}, []);
	useEffect(() => {
		getPatients();
	}, [page]);

	const getPatients = () => {
		axios
			.get(ENDPOINT + '/api/patient-list?page=' + page)
			.then((response) => {
				setPatients(response.data.patients);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	// make a axios call every 1min
	// setInterval(getPatients, 60 * 1000);

	return (
		<table className="table fadeInUp" style={{ animationDelay: '1s' }}>
			<h5 className="affected-count">
				<button onClick={getPatients} class="refresh">
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
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'G' : 'Gen') : 'Gender'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-gray' : ''}`} title="Type">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'T' : 'Typ') : 'Type'}
							</abbr>
						</div>
					</th>
				</tr>
			</thead>

			{patients.map((patient, index) => {
				return (
					<tbody>
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
				);
			})}
			<div className="pagination">
				<button onClick={() => setPage(Math.max(1, page - 1))} className="arrow">
					<Icon.ArrowLeft size={16} />
				</button>
				<button onClick={() => setPage(patients.length ? page + 1 : page)} className="arrow">
					<Icon.ArrowRight size={16} />
				</button>
			</div>
		</table>
	);
}

export default Table;
