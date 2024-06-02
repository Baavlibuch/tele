import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';

function Row(props) {
	const [doctor, setDoctor] = useState(props.doctor);
	const [username, setUsername] = useState(props.doctor.username);
	const [password, setPassword] = useState(props.doctor.password);
	const [hospital, setHospital] = useState(props.doctor.hospital);
	const [name, setName] = useState(props.doctor.name);
	const [email, setEmail] = useState(props.doctor.email);
	const [telephone, setTelephone] = useState(props.doctor.telephone);
	const [post, setPost] = useState(props.doctor.post);
	const [upiID, setUpiID] = useState(props.doctor.upi_id);
	const [fees, setFees] = useState(props.doctor.fees);
	const [department, setDepartment] = useState(props.doctor.department);
	const [reveal, setReveal] = useState(false);
	const [editing, setEditing] = useState(props.doctor._id ? false : true);

	useEffect(() => {
		setDoctor(props.doctor);
		setUsername(props.doctor.username);
		setHospital(props.doctor.hospital);
		setPassword(props.doctor.password);
		setName(props.doctor.name);
		setEmail(props.doctor.email);
		setTelephone(props.doctor.telephone);
		setPost(props.doctor.post);
		setUpiID(props.doctor.upi_id);
		setFees(props.doctor.fees);
		setDepartment(props.doctor.department);
		setEditing(props.doctor._id ? false : true);
	}, [props.doctor]);

	const handleReveal = () => {
		setReveal(!reveal);
	};

	return (
		<React.Fragment>
			<span
				className={`dropdown ${reveal ? 'rotateRightDown' : 'rotateDownRight'}`}
				onClick={() => {
					handleReveal();
				}}
			>
				<Icon.ChevronDown />
			</span>
			<tr
				className={props.total ? 'doctor is-total' : 'doctor'}
				className={props.total ? 'is-total' : ''}
				onClick={editing ? null : handleReveal}
			>
				<td style={{ fontWeight: 600, textTransform: 'none' }}>
					{editing ? (
						<input
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
							}}
						></input>
					) : (
						doctor.username
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
							}}
						></input>
					) : (
						doctor.password
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={hospital}
							onChange={(e) => {
								setHospital(e.target.value);
							}}
						></input>
					) : (
						doctor.hospital
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={telephone}
							onChange={(e) => {
								setTelephone(e.target.value);
							}}
						></input>
					) : (
						doctor.telephone
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
							}}
						></input>
					) : (
						doctor.email
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={name}
							onChange={(e) => {
								setName(e.target.value);
							}}
						></input>
					) : (
						doctor.name
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={department}
							onChange={(e) => {
								setDepartment(e.target.value);
							}}
						></input>
					) : (
						doctor.department
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={post}
							onChange={(e) => {
								setPost(e.target.value);
							}}
						></input>
					) : (
						doctor.post
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={upiID}
							onChange={(e) => {
								setUpiID(e.target.value);
							}}
						></input>
					) : (
						doctor.upi_id
					)}
				</td>
				<td style={{ color: 'inherit', textTransform: 'none' }}>
					{editing ? (
						<input
							value={fees}
							onChange={(e) => {
								setFees(e.target.value);
							}}
						></input>
					) : (
						doctor.fees
					)}
				</td>
			</tr>
			<tr className={`spacer`} style={{ display: reveal && !props.total ? '' : 'none' }}>
				<td></td>
				<td></td>
				<td></td>
			</tr>

			{Object.keys(doctor).map((dataKey, index) => {
				return (
					<tr
						key={index}
						className={`district`}
						style={{ display: reveal && !props.total ? '' : 'none' }}
					>
						<td style={{ fontWeight: 600 }}>{dataKey}</td>
						<td>{doctor[dataKey] ? (doctor[dataKey] === true ? 'Yes' : doctor[dataKey]) : '-'}</td>
					</tr>
				);
			})}

			<tr className={`spacer`} style={{ display: reveal && !props.total ? '' : 'none' }}>
				<td></td>
				<td></td>
				<td></td>
			</tr>
			{editing ? (
				<tr>
					<button
						onClick={() => {
							props.edit({
								...doctor,
								username,
								password,
								hospital,
								telephone,
								email,
								name,
								department,
								post,
								upi_id: upiID,
								fees
							});
							setEditing(false);
						}}
						style={{ background: 'none', padding: 0 }}
					>
						<Icon.Save size={16} />
					</button>
					<button
						onClick={() => {
							setEditing(props.doctor._id ? false : true);
						}}
						style={{ background: 'none', padding: 0 }}
					>
						<Icon.X size={16} />
					</button>
				</tr>
			) : (
				<tr>
					<button
						onClick={() => {
							setEditing(true);
						}}
						style={{ background: 'none', padding: 0 }}
					>
						<Icon.Settings size={16} />
					</button>
					<button
						onClick={() => {
							props.delete(doctor._id);
						}}
						style={{ background: 'none', padding: 0 }}
					>
						<Icon.Trash size={16} />
					</button>
				</tr>
			)}
		</React.Fragment>
	);
}

export default Row;
