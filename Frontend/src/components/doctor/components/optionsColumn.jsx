import React, { useState } from 'react';

import StatementBox from './statementBox';
import OptionsRowTab from './optionsRowTab';
import { CreateOptionsData, EditOptionsData } from '../helper/dbUtils';
import { useSelector, useDispatch } from 'react-redux';

const OptionsColumn = ({ item, searchValue }) => {
	const [optionsPopUp, setOptionsPopUp] = useState(false);
	const doctor = useSelector((state) => state.doctor.doctor);

	const handleOptionsTable = (event) => {
		event.stopPropagation();
		setOptionsPopUp(!optionsPopUp);
	};

	const [newDataOptions, setNewDataOptions] = useState({
		nextQuestion: '',
		optionName: '',
		statementEn: '',
		statementHi: ''
	});

	const newInputsFieldOptions = [
		{
			placeholder: 'option name',
			type: 'new',
			name: 'optionName',
			textValue: newDataOptions.title
		},
		{
			placeholder: 'option next Question',
			type: 'new',
			name: 'nextQuestion',
			textValue: newDataOptions.nextQuestion
		},
		{
			placeholder: 'option Statement in English',
			type: 'new',
			name: 'statementEn',
			textValue: newDataOptions.statementEn
		},
		{
			placeholder: 'option Statement in Hindi',
			type: 'new',
			name: 'statementHi',
			textValue: newDataOptions.statementHi
		}
	];

	const handleNewData = (e) => {
		e.preventDefault();

		const name = e.target.name;
		const value = e.target.value;

		setNewDataOptions((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleOptionsStatement = (data) => {
		console.log(data);
		EditOptionsData(data, doctor);
	};

	return (
		<div className="options-main">
			{optionsPopUp ? (
				<StatementBox
					handleNewData={handleNewData}
					createFunction={CreateOptionsData}
					editFunction={handleOptionsStatement}
					handleContentTable={handleOptionsTable}
					newData={newDataOptions}
					content={item.options}
					dataId={item._id}
					titleKey={'Content Name'}
					newInputsField={newInputsFieldOptions}
					searchValue={searchValue}
					headings={["statement","next question","value"]}

				/>
			) : (
				<div className="options-rowTabs-main" onClick={handleOptionsTable}>
					{item.options.length > 0 &&
						item.options.map((option) => (
							<OptionsRowTab optionsContent={option} key={option._id} searchValue={searchValue} />
						))}
					{/* //this is actual display data */}
				</div>
			)}
		</div>
	);
};

export default OptionsColumn;
