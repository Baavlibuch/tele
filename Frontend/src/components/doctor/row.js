import React, { useState, useEffect } from 'react';
import * as Icon from 'react-feather';

function Row(props) {
	const [patient, setPatient] = useState(props.patient);
	const [reveal, setReveal] = useState(false);

	useEffect(() => {
		setPatient(props.patient);
	}, [props.patient]);

	const handleReveal = () => {
		setReveal(!reveal);
	};

	const getObjByID = (arr, key) => {
		if (!arr) return null;
		for (let obj of arr) {
			if (obj.id === key) return obj;
		}
		return null;
	};
	let sortedkeys = Object.keys(patient).sort((a,b) => {
		let objA = getObjByID(patient.timestamps, a);
		let objB = getObjByID(patient.timestamps, b);
		let propA = patient[a];
		let propB = patient[b];
		if ((propA && propA !== 'NA') && (propB && propB !== 'NA')) {
			return (objA && objB) ? objA.time - objB.time : 0;
		} else if ((propA && propA !== 'NA') && !(propB && propB !== 'NA')) {
			return -1;
		} else {
			return 1;
		}
	});
	sortedkeys.splice(sortedkeys.indexOf('timestamps'), 1);
	sortedkeys.splice(sortedkeys.indexOf('ip'), 1);
	sortedkeys.splice(sortedkeys.indexOf('_id'), 1);
	sortedkeys.splice(sortedkeys.indexOf('name'), 1);
	sortedkeys.splice(sortedkeys.indexOf('telephone'), 1);
	sortedkeys.splice(sortedkeys.indexOf('age'), 1);
	sortedkeys.splice(sortedkeys.indexOf('gender'), 1);
	sortedkeys.splice(sortedkeys.indexOf('hospital'), 1);
	sortedkeys.splice(sortedkeys.indexOf('type'), 1);
  var patientCopy = {...patient};
	for (let key of sortedkeys) {
		if (Array.isArray(patient[key])) {
			patientCopy[key] = patient[key].join(', ');
		}
	}
	// console.log('============================');
	// for (let key of sortedkeys) {
	// 	console.log(key + ' | ' + patientCopy[key]);
	// 	console.log(key + ' | ' + JSON.stringify(getObjByID(patient.timestamps, key)));
	// }

	const filteredKeys = ['symptoms', 'symptoms_Duration', 'village', 'latitude', 'longitude', 'doctor', 'Last Visited', 'Registered'];

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
				className={props.total ? 'patient is-total' : 'patient'}
				// className={props.total ? 'is-total' : ''}
				onClick={() => {
					handleReveal();
				}}
			>
				<td style={{ fontWeight: 600 }}>{patient.name}</td>
				<td>
					<a href={`tel:${patient.telephone}`} className="link" target="_noblank">
						{patient.telephone}
					</a>
				</td>
				<td style={{ color: '#B5B5B5' }}>{patient.age}</td>
				<td style={{ color: '#B5B5B5' }}>{patient.gender}</td>
				{/* <td style={{ color: '#B5B5B5' }}>{patient.type}</td> */}
			</tr>

			<tr className={`spacer`} style={{ display: reveal && !props.total ? '' : 'none' }}>
				<td/>
				<td/>
				<td/>
			</tr>

			{filteredKeys.map((dataKey, index) => {
				return (
					<tr
						key={index}
						className={`district`}
						style={{ display: reveal && !props.total ? '' : 'none' }}
					>
						<td style={{ fontWeight: 600 }} colspan='3'>{dataKey}</td>
						<td style={{ paddingRight: '20px' }} colspan='2'>
							{patientCopy[dataKey] ? (patientCopy[dataKey] === true ? 'Yes' : patientCopy[dataKey]) : '-'}
						</td>
					</tr>
				);
			})}

			<tr className={`spacer`} style={{ display: reveal && !props.total ? '' : 'none' }}>
				<td/>
				<td/>
				<td/>
			</tr>
		</React.Fragment>
	);
}

export default Row;
