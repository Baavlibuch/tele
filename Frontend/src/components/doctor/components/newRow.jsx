import React, { useState } from 'react';
import Input from './ui/editInput';
import { CreateContentVariantData, EditContentVariantData } from '../helper/dbUtils';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
const socket = io.connect('/doctor/persona');

const NewRow = ({
	dataId,
	title,
	closeFunction,
	handleNewData, //
	newData,
	newInputsField,
	setStatement,
	setVarient,
	handleFunction,
	setContent,
}) => {
	const [optionAlert,setOptionAlert]=useState(null);
	// const [newData, setNewData] = useState({
	//     title:'',
	//     statementEn:'',
	//     statementHi:'',
	// });

	// // storing data
	// const handleNewData = (e) => {
	//     e.preventDefault();

	//     const name = e.target.name;
	//     const value = e.target.value;

	//     setNewData(prev => ({
	//         ...prev,
	//         [name]:value
	//     }))
	// };
	const handleCreate = (data) => {
		const newData = {
			...data,
			id: dataId
		};

		console.log('data', newData, '\n');

		try {
			socket.emit('create_content_variant', newData, (response) => {
				if (response.status === 'done') {
					toast.success('Updated Successfully');
					console.log(response);
					setVarient(response.data);
					closeFunction();
				} else if (response.status === 'error') {
					toast.error('Something went wrong');
				}
			});
		} catch (error) {
			console.log(error);
		}
	};

	const handleoption = (data) => {
		const newData = {
			...data,
			id: dataId
		};
		console.log(newData);
		handleFunction(newData,setOptionAlert,setContent);
		if(optionAlert){
			closeFunction();
		}
		else{
			closeFunction();
		}
		
	};

	return (
		<>
			<div className="newRow-main">
				<span className="newRow-title">Add New {title}</span>
				{newInputsField && (
					<div>
						{newInputsField?.map((item) => (
							<Input
								placeHolder={item.placeholder}
								textValue={item.textValue}
								type={item.type}
								handleText={handleNewData}
								name={item.name}
							/>
						))}
						{/* <Input placeHolder="Content Variant Title" textValue={newData.title} type="new" handleText={handleNewData} name="title" />
        <Input placeHolder="Content Variant Statement in English" textValue={newData.statementEn} type="new" handleText={handleNewData} name="statementEn" />
        <Input placeHolder="Content Variant Statement in Hindi" textValue={newData.statementHi}  type="new" handleText={handleNewData} name="statementHi" /> */}
					</div>
				)}
				<div className="newRow-btn">
					<button
						type="button"
						className="newRow-create-btn"
						onClick={() => {

							title === 'Content Name' ? handleoption(newData) : handleCreate(newData);
						}}
					>
						Create
					</button>
					<button type="button" className="newRow-cancel-btn" onClick={closeFunction}>
						Cancel
					</button>
				</div>
			</div>
		</>
	);
};

export default NewRow;
