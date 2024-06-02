import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import { ENDPOINT } from '../../config';

import Row from './row';

function Table(props) {
	const [doctors, setDoctors] = useState([]);
	const [page, setPage] = useState(1);

	useEffect(() => {
		getDoctors();
	}, [page]);
	/* add renew button */

	const getDoctors = () => {
		axios
			.get(ENDPOINT + '/admin/doctor-list?page=' + page)
			.then((response) => {
				const { doctors } = response.data;
				console.log(doctors);
				if (doctors) setDoctors(doctors);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const deleteDoctor = (id) => {
		axios
			.delete(ENDPOINT + '/admin/doctor/' + id)
			.then((response) => {
				getDoctors();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const edit = ({ _id, ...rest }) => {
		if (_id)
			axios
				.post(ENDPOINT + '/admin/doctor/' + _id, rest)
				.then((response) => {
					getDoctors();
				})
				.catch((err) => {
					console.log(err);
				});
		else
			axios
				.put(ENDPOINT + '/admin/doctor', rest)
				.then((response) => {
					getDoctors();
				})
				.catch((err) => {
					console.log(err);
				});
	};

	// make a axios call every 1min
	// setInterval(getDoctors, 60 * 1000);

	return (
		<table className="table fadeInUp" style={{ animationDelay: '1s' }}>
			<h5 className="affected-count">
				<button onClick={getDoctors} class="refresh">
					<Icon.RefreshCw size={10} />
				</button>
				Doctors
			</h5>
			<thead>
				<tr>
					<th className="state-heading">
						<div className="heading-content">
							<abbr title="Name">Username</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-cherry' : ''}`} title="Password">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'P' : 'PWD') : 'Password'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Hospital">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'H' : 'HOS') : 'Hospital'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Telephone">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'T' : 'Tel') : 'Telephone'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Email">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'E' : 'Email') : 'Email'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Name">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'N' : 'Name') : 'Name'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Department">
								{window.innerWidth <= 769
									? window.innerWidth <= 375
										? 'D'
										: 'Dept'
									: 'Department'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Post">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'P' : 'Post') : 'Post'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="UPI ID">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'U' : 'UPI ID') : 'UPI ID'}
							</abbr>
						</div>
					</th>
					<th>
						<div className="heading-content">
							<abbr className={`${window.innerWidth <= 769 ? 'is-blue' : ''}`} title="Fees">
								{window.innerWidth <= 769 ? (window.innerWidth <= 375 ? 'F' : 'Fees') : 'Fees'}
							</abbr>
						</div>
					</th>
				</tr>
			</thead>

			{doctors.map((doctor, index) => {
				return (
					<tbody>
						<Row key={index} doctor={doctor} delete={deleteDoctor} edit={edit} />
					</tbody>
				);
			})}
			<div className="pagination">
				<button onClick={() => setPage(Math.max(1, page - 1))} className="arrow">
					<Icon.ArrowLeft size={16} />
				</button>
				<button
					onClick={() => {
						setDoctors(
							[
								{
									username: '',
									password: '',
									hospital: '',
									_id: false
								}
							].concat(doctors)
						);
					}}
					className="arrow"
				>
					<Icon.Plus size={16} />
				</button>
				<button onClick={() => setPage(doctors.length ? page + 1 : page)} className="arrow">
					<Icon.ArrowRight size={16} />
				</button>
			</div>
		</table>
	);
}

export default Table;
