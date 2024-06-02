import React, { useState, useEffect } from 'react';
import { checksearch } from '../helper/utils';
import { NEXT_QUESTION, NEXT_QUESTION_VARIANTS } from '../../../apiHelper';
import io from 'socket.io-client';
const socket = io.connect('/doctor/persona');
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { useSelector, useDispatch } from 'react-redux';

const NextQuestionVarient = ({ item, searchValue }) => {
	const [alert, setAlert] = useState(false);
	const [next, setNext] = useState(false);
	const [nextvalue, setNextValue] = useState(item[NEXT_QUESTION]);
	const [value, setValue] = useState('');
	const [data, setData] = useState(
		item[NEXT_QUESTION_VARIANTS].length > 0
			? [nextfunction(), ...item[NEXT_QUESTION_VARIANTS]]
			: item[NEXT_QUESTION_VARIANTS]
	);
	const [varientalert, setVarientAlert] = useState(null);
	const [varientvalue, setVarientValue] = useState('');

	const doctor = useSelector((state) => state.doctor.doctor);
	function addvarient() {
		if (alert) {
			return (
				<textarea
					className="edit-textarea"
					placeholder="Next Variant"
					type="text"
					value={value}
					autoFocus
					onChange={(event) => {
						setValue(event.target.value);
					}}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							socket.emit('adding_next_varient', item._id, doctor, value);
							let updatedData = null;
							if (data.length === 0) {
								updatedData = [nextfunction(), ...data, value];
							} else {
								updatedData = [...data, value];
							}
							setData(updatedData);
							item[NEXT_QUESTION_VARIANTS] = updatedData;
							setValue('');
							setAlert(false);
						} else if (event.key === 'Escape') {
							setAlert(false);
						}
					}}
				/>
			);
		}
	}

	function editvarient(index, value) {
		if (index === varientalert) {
			return (
				<textarea
					className="edit-textarea"
					placeholder="Next Variant"
					type="text"
					value={varientvalue}
					autoFocus
					onChange={(event) => {
						setVarientValue(event.target.value);
					}}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							if (index === 0) {
								console.log('next question');
								socket.emit('editing_next', item._id, doctor, varientvalue);
							} else {
								socket.emit('editing_next_varient', item._id, doctor, index, varientvalue);
								let d = data;
								d[index] = varientvalue;
								setData(d);
								// console.log(data, 'this si for verfification');
							}
							setVarientAlert(null);
						} else if (event.key === 'Escape') {
							setVarientAlert(null);
						}
					}}
				/>
			);
		}
		return value;
	}

	function nextfunction() {
		if (next) {
			return (
				<div className="f4" style={{ color: 'Red' }}>
					<textarea
						className="edit-textarea"
						placeholder="Next"
						type="text"
						value={nextvalue}
						autoFocus
						onChange={(event) => {
							setNextValue(event.target.value);
						}}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								socket.emit('editing_next', item._id, doctor, nextvalue);

								// item[NEXT_QUESTION] = nextvalue;

								setNext(false);
							} else if (event.key === 'Escape') {
								setNext(false);
							}
						}}
					/>
				</div>
			);
		}
		return checksearch(nextvalue ?? '', searchValue);
	}
	useEffect(() => {}, [data]);

	return (
		<div className="f4">
			<div className="">
				{data.length === 0 && (
					<div
						className="item"
						onClick={() => {
							setNext(true);
						}}
					>
						{nextfunction()}
					</div>
				)}

				<div className="next">
					{data.length > 0 &&
						data.map((item, index) => {
							return (
								<div
									className="item"
									key={index}
									onClick={() => {
										setVarientAlert(index);
										setVarientValue(item);
									}}
								>
									{editvarient(index, item)}
								</div>
							);
						})}
				</div>
				{addvarient()}
			</div>

			<AddCircleOutlineOutlinedIcon
				className="button"
				onClick={() => {
					setAlert(true);
				}}
			/>
		</div>
	);
};

export default NextQuestionVarient;
