import React, { useState } from 'react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socket = io.connect('/doctor/persona');

const OptionsVar = ({ itemid, value, index, title }) => {
	const [alert, setAlert] = useState(false);
	const [prev, setPrev] = useState(value);
	const [val, setVal] = useState(value);

	function edit(ref, index) {
		return (
			<textarea
				value={val}
				autoFocus
				className="etextarea"
				type="text"
				onChange={(e) => {
					setVal(e.target.value);
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						socket.emit('edit_option_varients', itemid, index, val, ref, (res) => {
							if (res.status === 'done') {
								setVal(res.data);
								setPrev(res.data);
								toast.success('updated');
								setAlert(false);
							} else if (res.status === 'error') {
								toast.error('something went wrong');
								setAlert(false);
							}
						});
					} else if (e.key === 'Escape') {
						setAlert(false);
						setVal(prev);
					}
				}}
			/>
		);
	}
	return (
		<>
			{!alert ? (
				<p
					className="Box-table-statement-single"
					style={{ cursor: 'pointer' }}
					onClick={() => {
						setAlert(true);
					}}
				>
					{val}
				</p>
			) : (
				edit(title, index)
			)}
		</>
	);
};

export default OptionsVar;
