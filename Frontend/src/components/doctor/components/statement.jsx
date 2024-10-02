import React, { useEffect, useState } from 'react';
import { shortText } from '../helper/utils';
import Input from './ui/editInput';
import { checksearch } from '../helper/utils';
// import keyboardicon from '../../../../src/keyboard.svg';
// import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const Statement = ({
	statementText,
	dataId,
	contentId,
	type,
	handleUpdate,
	indicator_statement,
	indicator_statement_function,
	searchValue,index
}) => {
	const [editOption, setEditOption] = useState(false);
	const [data, setData] = useState({
		statement: '',
		id: '',
		contentId: '',
		type: ''
	});
	const [alert, setAlert] = useState(false);
	const [alertvalue, setAlertValue] = useState('');

	useEffect(() => {
		setData((prev) => ({
			...prev,
			statement: statementText,
			id: dataId,
			contentId: contentId,
			type: type
		}));
	}, []);

	const updateText = (event) => {
		const value = event.target.value;
		setData((prev) => ({ ...prev, statement: value }));
	};

	const openEditOption = () => {
		setEditOption(true);
	};

	const closeEditOption = (event) => {
		if (event.key === 'Escape') {
			setEditOption(false);
		}
		if (event.key === 'Enter') {
			setEditOption(false);

			handleUpdate(data,index);
		}
	};

	return (
		<>
			{editOption ? (
				<div className="Box-table-statement-single" onKeyDown={closeEditOption}>
					<Input textValue={data.statement} handleText={updateText} />
				</div>
			) : (
				<>
					<div className="box-statement">
						<div
							className="Box-table-statement-single"
							onClick={openEditOption}
						>
                            { checksearch(shortText(data.statement), searchValue) }
                            <span className='tooltip'>{ checksearch(data.statement, searchValue) }</span>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default Statement;
