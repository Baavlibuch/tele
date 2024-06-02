import React, { useRef, useState } from 'react';

import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';

import Statement from './statement';
import NewRow from './newRow';
import Title from './title';
import { checksearch } from '../helper/utils';
import io from 'socket.io-client';
import OptionsVar from './OptionsVar';
const socket = io.connect('/doctor/persona');

const StatementBox = ({
	handleNewData,
	createFunction,
	editFunction,
	handleContentTable,
	newData,
	content, //here is the data object
	dataId,
	titleKey,
	newInputsField,
	searchValue,
	headings
}) => {
	const [addNewTab, setAddNewTab] = useState(false);
	const boxMainRef = useRef(null);
	const [nextq, setNextQ] = useState(null);
	const [value, setValue] = useState('');
	const [nextqalert, setNextQAlert] = useState(false);
	const [valuealert, setValueAlert] = useState(false);
	const [newcontent,setNewContent]=useState(content);

	const handleBoxMainScroll = (scroll) => {};

	const handleCreate = (data,setOptionAlert,setNewContent) => {

		const newData = {
			...data,
			id: dataId
		};
		createFunction(newData,setOptionAlert,setNewContent);
	};

	const handleCloseNewRow = () => {
		setAddNewTab(false);
	};

	function edit(ref, index) {
		if (ref === 'nextQuestion') {
			return (
				<textarea
					value={nextq}
					autoFocus
					type="text"
					onChange={(e) => {
						setNextQ(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							socket.emit('edit_option_nextq', itemid, index, nextq);
							setNextQAlert(null);
						}
						if (e.key === 'Escape') {
							setNextQAlert(null);
						}
					}}
				/>
			);
		}
	}

	return (
		<div className="Box-main" ref={boxMainRef} onScroll={handleBoxMainScroll}>
			{newcontent.map((item, index) => (
				<div className="Box-table-row" key={item._id}>
					<div className="Box-table-row-header">
						<Title
							headings={headings}
							titleKey={titleKey}
							title={item.option_name ? item.option_name : item.content_variant_name}
						/>
						<CloseIcon className="Box-table-row-header-icon" onClick={handleContentTable} />
					</div>
					<div className="Box-table-row-statement">
						{/* {console.log(content)} */}
						{/* <div>{console.log(content, ' ', item.nextQuestion, ' ', item.value)}</div> */}
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '50%',
								justifyContent: 'flex-start',
								alignItems: 'flex-start'
							}}
						>
							<Statement
								statementText={item.statement.en ?? ''}
								dataId={dataId}
								contentId={item._id}
								type={'english'}
								handleUpdate={editFunction}
								searchValue={searchValue}
								index={index}
							/>
							<Statement
								statementText={item.statement.hi ?? ''}
								dataId={dataId}
								contentId={item._id}
								type={'hindi'}
								handleUpdate={editFunction}
								searchValue={searchValue}
								index={index}
							/>
						</div>
						<div className="box-statement" style={{ fontSize: '11px' }}>
							<OptionsVar
								itemid={dataId}
								value={item.nextQuestion ?? ''}
								index={index}
								title={'nextQuestion'}
							/>
							{/*content name and varient probability => for the content varient*/}
						</div>
						<div className="box-statement" style={{ fontSize: '11px' }}>
							<OptionsVar itemid={dataId} value={item.value ?? ''} index={index} title={'value'} />
						</div>
					</div>
				</div>
			))}
			{addNewTab && (
				<NewRow
					dataId={dataId}
					handleFunction={handleCreate}
					handleNewData={handleNewData}
					closeFunction={handleCloseNewRow}
					title={titleKey}
					newData={newData}
					newInputsField={newInputsField}
					setContent={setNewContent}
				/>
			)}
			<AddCircleOutlineOutlinedIcon
				className="Box-main-add-new-icon"
				onClick={() => setAddNewTab(true)}
			/>
		</div>
	);
};

export default StatementBox;

{
	/* {nextqalert === null ? (
									<p
										className="Box-table-statement-single"
										style={{ cursor: 'pointer' }}
										onClick={() => {
											setNextQAlert(index);
											setNextQ(item.nextQuestion);
										}}
									>
										{nextq !== '' ? nextq : item.nextQuestion}
									</p>
								) : (
									edit('nextQuestion', index)
								)} */
}
