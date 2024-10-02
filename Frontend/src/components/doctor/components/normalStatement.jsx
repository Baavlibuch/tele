import React, { useState } from 'react';

import Statement from './statement';
import {
	CreateContentVariantData,
	CreateTransferStatementData,
	EditStatementData
} from '../helper/dbUtils';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import NewRow from './newRow';
import io from 'socket.io-client';
import chatgpticon from '../../../../src/data/icons8-chatgpt-48.png';
import { useSelector, useDispatch } from 'react-redux';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { style } from 'd3';

const socket = io.connect('/doctor/persona');

const NormalStatement = ({
	statement,
	dataId,
	indicator_statement_function,
	searchValue,
	checksearch,
	items,
	setStatement,
	setVarient,
  type
}) => {
	const [newDataVariant, setNewDataVariant] = useState({
		title: '',
		statementEn: '',
		statementHi: ''
	});

	const [addNewTab, setAddNewTab] = useState(false);
	const [alert, setAlert] = useState(false);
	const [alertvalue, setAlertValue] = useState('');
	const [Index, setIndex] = useState(null);

	const doctor = useSelector((state) => state.doctor.doctor);
	const [option, setOption] = useState(false);
	const [menu, setMenu] = useState(false);
	const newInputsField = [
		{
			placeholder: 'Content Variant Title',
			type: 'new',
			name: 'title',
			textValue: newDataVariant.title
		},
		{
			placeholder: 'Content Variant Statement in English',
			type: 'new',
			name: 'statementEn',
			textValue: newDataVariant.statementEn
		},
		{
			placeholder: 'Content Variant Statement in Hindi',
			type: 'new',
			name: 'statementHi',
			textValue: newDataVariant.statementHi
		}
	];

	const handlerightclick = () => {
		setOption(!option);
	};

	
	const handleCloseNewRow = () => {
		setAddNewTab(false);
	};
	// console.log("once see this data",doctor);

	// const handleButtonClick = (event) => {
	// 	const buttonPosition = event.currentTarget.getBoundingClientRect();
	// 	setKeyboardPosition({ x: buttonPosition.right+100, y: buttonPosition.top-150 });
	// 	setKeyboard(!keyboard);
	// };
	const handleNewData = (e) => {
		e.preventDefault();

		const name = e.target.name;
		const value = e.target.value;

		setNewDataVariant((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleEditStatement = (data) => {
		EditStatementData(data, doctor); // Pass the doctor data to the EditStatementData function
	};
	return (
		<div
			onContextMenu={(e) => {
				e.preventDefault();
				console.log('clicked right in the block and set munu');
				setMenu(!menu);
			}}
			// style={{cursor:"grab"}}
		>
			{/* <div
				onClick={() => {
					setMenu(!menu);
				}}
				// className="link"
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					alignItems: 'flex-end',
					cursor: 'pointer'
				}}
			>
				<MoreVertIcon />
			</div> */}

			{menu && (
				<div
					// className="menu"
					style={{
						width: '100px',
						height: 'fit-content',
						position: 'relative',
						left: '60%',
						cursor: 'pointer',
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'flex-end',
						boxShadow: ' rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
					}}
				>
					<div
						onClick={() => {
							setAddNewTab(true);
						}}
						// className="item"
						style={{
							width: '100%',
							height: 'fit-content',
							display: 'flex',
							justifyContent: 'center',
							backgroundColor: '#f0f0f0',
							fontSize: '12px',
							paddingTop: '3px',
							paddingBottom: '3px',
							paddingLeft: '2px',
							paddingRight: '2px',
							color: 'black',
							position: 'relative',
							boxShadow:
								'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px'
						}}
					>
						Add Varient
					</div>
				</div>
			)}

			<div className="normal-statement-main">
				{statement?.map((item, index) => (
					<div
						onContextMenu={(e) => {
							e.preventDefault();
							handlerightclick();
						}}
						style={{ cursor: 'wait', paddingTop: '5px', paddingBottom: '5px' }}
					>
						<Statement
							statementText={item.en}
							dataId={dataId}
							contentId={item._id}
							type={'english'}
							handleUpdate={handleEditStatement}
							indicator_statement_function={indicator_statement_function}
							searchValue={searchValue}
							checksearch={checksearch}
						/>
						{item.hi === null || item.hi === undefined || item.hi === '' ? (
							alert === false && Index !== index ? (
								option && (
									<div
										className="box"
										onClick={() => {
											socket.emit('translate', item.en, dataId, index, (res) => {
												if (res !== null) {
													setAlertValue(res.data);
													setAlert(!alert);
													console.log('this is fun', alertvalue);
												}
											});
											setAlert(!alert);
											if (Index === null) {
												setIndex(index);
											} else {
												setIndex(null);
											}
										}}
									>
										<img src={chatgpticon} height={30} width={30} alt="" className="img" />
										<div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>
											Translate
										</div>
									</div>
								)
							) : (
								alertvalue !== '' && (
									<Statement
										statementText={alertvalue}
										dataId={dataId}
										contentId={item._id}
										type={'hindi'}
										// handleUpdate={EditStatementData}
										// indicator_statement_function={indicator_statement_function}
										searchValue={searchValue}
										checksearch={checksearch}
									/>
								)
							)
						) : (
							<Statement
								statementText={item.hi}
								dataId={dataId}
								contentId={item._id}
								type={'hindi'}
								handleUpdate={handleEditStatement}
								indicator_statement_function={indicator_statement_function}
								searchValue={searchValue}
								checksearch={checksearch}
							/>
						)}
					</div>
				))}
				{addNewTab && (
					<NewRow
						dataId={dataId}
						closeFunction={handleCloseNewRow}
						title={'Variant Name'}
						newInputsField={newInputsField}
						newData={newDataVariant}
						handleNewData={handleNewData}
						setStatement={setStatement}
						setVarient={setVarient}
					/>
				)}

				{/* <AddCircleOutlineOutlinedIcon
					className="Box-main-add-new-icon"
					onClick={() => {
						setAddNewTab(true);
					}}
				/> */}
			</div>
		</div>
	);
};

export default NormalStatement;
