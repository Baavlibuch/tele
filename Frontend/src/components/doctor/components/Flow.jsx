import React, { useState } from 'react';
import { checksearch } from '../helper/utils';
import io from 'socket.io-client';
const socket = io.connect('/doctor/persona');

const Flow = ({ item, searchValue }) => {
	const [flow, setFlow] = useState(item.Flow);
	const [flowid, setFlowId] = useState();

	function check(val) {
		if (val === null || val === undefined || val === '') {
			return true;
		}
		return false;
	}
	// const handleFlowUpdate = () => {
	// 	socket.emit('editing_flow', flowid, flow);
	// 	setFlowId(null);
	// };
	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			if (flow && flowid) {
				socket.emit('editing_flow', flowid, flow);
				item.Flow = flow;
				setFlow(null);
				setFlowId(null);
				console.log(item.Flow);
			} else {
				console.log('data is not there');
			}
		} else if (event.key === 'Escape') {
			setFlowId(null);
		}
	};
	const inputfunction = () => {
		return (
			<div className="inputfield">
				<textarea
					placeholder="Enter flow"
					className="edit-textarea"
					type="text"
					value={flow}
					onChange={(event) => {
						setFlow(event.target.value);
					}}
					onKeyDown={handleKeyDown}
				/>
			</div>
		);
	};

	return (
		<div
      style={{ width: '100%' }}
			onClick={(e) => {
				console.log(item._id, check(item._id));
				setFlowId(item._id);
			}}
		>
			{item._id === flowid
				? inputfunction()
				: check(item.Flow)
				? inputfunction()
				: checksearch(item.Flow, searchValue)}
		</div>
	);
};

export default Flow;
