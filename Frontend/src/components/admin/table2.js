/**
 * Admin Nurses Table Component
 * This file implements the table for displaying and managing nurse data in the admin dashboard.
 * Features include listing nurses, editing, deleting, and updating nurse information.
 */
import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import { ENDPOINT } from '../../config';

import Row from './row';
import NurseRow from './nurseRow';

function TableNurses(props) {
	const [nurses, setNurses] = useState([]);
	const [page, setPage] = useState(1);

	useEffect(() => {
		getNurses();
	}, [page]);

	const getNurses = () => {
		axios
			.get(`${ENDPOINT}/admin/nurse-list?page=${page}`)
			.then((response) => {
				const { nurses } = response.data;
				if (nurses) setNurses(nurses);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const deleteNurse = (id) => {
		axios
			.delete(`${ENDPOINT}/admin/nurse/${id}`)
			.then(() => {
				getNurses();
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const edit = ({ _id, ...rest }) => {
		if (_id)
			axios
				.post(`${ENDPOINT}/admin/nurse/${_id}`, rest)
				.then(() => {
					getNurses();
				})
				.catch((err) => {
					console.error(err);
				});
		else
			axios
				.put(`${ENDPOINT}/admin/nurse`, rest)
				.then(() => {
					getNurses();
				})
				.catch((err) => {
					console.error(err);
				});
	};

	return (
		<table className="table admin-table fadeInUp" style={{ animationDelay: '1s', marginTop:'30px' }}>
			<h5 className="affected-count">
				<button onClick={getNurses} className="refresh">
					<Icon.RefreshCw size={10} />
				</button>
				Nurses
			</h5>
			<thead>
				<tr>
					<th>Username</th>
					<th>Password</th>
					<th>Village</th>
				</tr>
			</thead>
			{nurses.map((nurse, index) => (
				<tbody key={index}>
					<NurseRow nurse={nurse} delete={deleteNurse} edit={edit} />
				</tbody>
			))}
			<div className="pagination">
				<button onClick={() => setPage(Math.max(1, page - 1))} className="arrow">
					<Icon.ArrowLeft size={16} />
				</button>
				<button
					onClick={() =>
						setNurses(
							[
								{
									username: '',
									password: '',
									village: '',
									_id: false,
								},
							].concat(nurses)
						)
					}
					className="arrow"
				>
					<Icon.Plus size={16} />
				</button>
				<button onClick={() => setPage(nurses.length ? page + 1 : page)} className="arrow">
					<Icon.ArrowRight size={16} />
				</button>
			</div>
		</table>
	);
}

export default TableNurses;
