import React, { useCallback, useState } from 'react';
import { checksearch } from '../helper/utils';
import { TYPE } from '../../../../src/apiHelper';
import io from 'socket.io-client';
import { EditType } from '../helper/dbUtils';

const socket = io.connect('/doctor/persona');

const Type = ({ item, searchValue, itemid }) => {
	const [value, setValue] = useState(item[TYPE]);
	const [isEditing, setIsEditing] = useState(false);
	// console.log(item._id);

	const typeOptions = ['none', 'button', 'list', 'text', 'analyse', 'telephone'];

	const handleEditType = () => {
		console.log('Editing type:', value, ' ', itemid, ' ');

		EditType(value, itemid);

		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
	};

	return (
		<div>
			{isEditing ? (
				<div className="inputfield">
					{/* Use a dropdown for editing */}
					<select
						value={value}
						onChange={(e) => setValue(e.target.value)}
						// onBlur={handleCancelEdit} // Handle blur to cancel editing when clicking outside
					>
						{typeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<button
						onClick={async () => {
							console.log('once see it from frontned');
							EditType(value, itemid,handleCancelEdit);
							// setIsEditing(false);
						}}
					>
						Save
					</button>
					<button onClick={handleCancelEdit}>Cancel</button>
				</div>
			) : (
				<div onClick={() => setIsEditing(true)}>{checksearch(value??"", searchValue)}</div>
			)}
		</div>
	);
};

export default Type;
