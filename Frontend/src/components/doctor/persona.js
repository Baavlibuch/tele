import React from 'react';
import headerHeader from './dataEntry/Header';
import Heading from './dataEntry/heading/Heading';
import { ENDPOINT } from '../../config';
import ArcDiagram from './dataEntry/Graph/Arc';

import io from 'socket.io-client';
import {
	ID,
	LANG_ENGLISH,
	LANG_HINDI,
	NEXT_QUESTION,
	OPTION_VARIANT_NAME,
	OPTIONS,
	STATEMENT,
	FACT,
	TYPE,
	CONTENT_VARIANTS,
	NEXT_QUESTION_LIST,
	CONTENT_VARIANT_NAME,
	BRANCHES,
	DB_VALUE,
	VALUE,
	COMMAND,
	OPTION_STATEMENT_VARIANTS,
	VARIANT_PROBABILITY,
	LANG_BANGLA,
	DESCRIPTION_IMAGE
} from '../../apiHelper';
// import ComponentOptionNextQ from './ComponentOptionNextQ';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { ClipLoader } from 'react-spinners';
import Header from './dataEntry/Header';
import NormalStatement from './components/normalStatement';
import ContentVariantColumn from './components/contentVariantColumn';
import OptionsColumn from './components/optionsColumn';
import Topic from './components/topic';

import { connect } from 'react-redux';
import RowTabs from './components/rowTabs';
import toast from 'react-hot-toast';
import { tooltipClasses } from '@mui/material';
import Svg from './svg';
import Flow from './components/Flow';
import NextQuestionVarient from './components/NextQuestionVarient';
import { useSelector, useDispatch } from 'react-redux';
import Type from './components/Type';
import StatementVarient from './components/StatementVarient';
import BranchSelector from './components/branchSelector';
import {checksearch} from './helper/utils';
import ProcessColumn from './components/processColumn';

// console.log(`persona : io = ${io}, io.parsed = ${io.parsed}, io.path = ${io.path}, io.opts = ${io.opts}`)
// const socket = io('http://localhost:3000/doctor/persona', {transports: ["http"]})

const socket = io.connect('/doctor/persona', {
	transports: ['websocket']
});

// socket.on('connect_error', (err) => {
// 	console.log('persona.connect_error. err instanceof Error = ', err); // true
// 	// console.log('persona.connect_error. err.message = ', err.message); // not authorized
// 	console.log('persona.connect_error. err.data = ', err.data); // { content: "Please retry later" }
// });

class Persona extends React.Component {
	state = {
		messageData: [],
		messagedef: [],
		newmessage: [],
		id: '',
		statement: '',
		nextQuestion: '',
		name2: '',
		Statement2: '',
		next2: '',
		a: false,
		layerSwitch: {},
		b: false,
		messageId: 300,
		inputRef: { current: null },
		rootSheetRef: { current: null },
		level1SheetRef: { current: null },
		db: false,
		sta: '',

		index_en: 0, //for english statement index
		dbdata_en: '', //for english statement value
		index_hi: 0, //for hindi statement index
		dbdata_hi: '', //for hindi statement value

		indexnext: null, //In options field,for holding the value of record where the  nextquestion is get edited in the options field
		nextcon: null, //holds the value of index
		nextindex: null, //for the previous value
		nextprev: null, //to pass teh edited value

		indexnexts: null, //it holds the record index or the item id for tracing the which options must be changed ,of english
		nextindexs: null, //it holds the value of the array in whch the user like to edit for english
		indexnexth: null, //it holds the record index or the item id for tracing the which options must be changed ,of hindi
		nextindexh: null, //it holds the value of the array in whch the user like to edit for hindi
		engpre: null, //previous value of theoptions text of english
		engpost: null, //post value of theoptions text of english
		hinpre: null, //previous value of theoptions text of hindi
		hipost: null, //post value of the options text of hindi

		name_id: 0, //index for  the name of record
		name: '', //value fo the name of the record
		next_id: 0, //index for the next question of the record
		next: '', //value of the next question of the record

		click: false,
		clickref: null,

		expressdown: false,

		content_varient_name: null,
		content_varient_statement: null,
		content_varient_next: null,
		content_varient_type: null,

		cid: null,
		con: null,

		cs: null,
		csv: null,

		cn: null,
		cnv: null,

		displaydata: ['Doctor-persona'],
		search: false,
		searchValue: null,

		pageNumber: 1, //for get 1 = 50 rows at once // sushil-state
		loading: false, // when data is fetched it will set to true
		scrollTimeOut: null, // timeout for scroll
		selectedRowData: [],
		collapse: { toogleid: true, tooglesemantic: true, tooglemetadata: true },
		nodeRowRefs: [],
		messageWithPost: [],

        currentBranch: null, // current branch
	};

	toogleidfunction = () => {
		this.setState((prevState) => ({
			collapse: {
				...prevState.collapse,
				toogleid: !prevState.collapse.toogleid
			}
		}));
	};
	tooglesemanticfunction = () => {
		this.setState((prevState) => ({
			collapse: {
				...prevState.collapse,
				tooglesemantic: !prevState.collapse.tooglesemantic
			}
		}));
	};
	tooglemetadatafunction = () => {
		this.setState((prevState) => ({
			collapse: {
				...prevState.collapse,
				tooglemetadata: !prevState.collapse.tooglemetadata
			}
		}));
	};

	handleLayerScroll = (scroll) => {
		if (scroll.target && this.state.level1SheetRef.current)
			this.state.level1SheetRef.current.scrollTop = scroll.target.scrollTop;
	};

	handleRootScroll = (scroll) => {
		const target = scroll.target;
		// checking if target is avaliable
		if (!target) {
			return null;
		}

		// if (target && this.state.rootSheetRef.current) {
		// 	this.state.rootSheetRef.current.scrollTop = target.scrollTop;
		// }

		// clearTimeout(this.state.scrollTimeOut); // clear the prev timeout  to prevent multiple function calls

		// // Set a new timeout that will trigger the fetchData function after a specific time
		// this.state.scrollTimeOut = setTimeout(() => {
		// 	//sushil fetch next 10 data from back end when scroll to bottom
		// 	if (target.scrollHeight - target.scrollTop - target.clientHeight <= 100) {
		// 		this.getData(this.state.pageNumber, this.props.doctor.doctorId); // calling the fetch data function to next 10 data rows
		// 	}
		// }, 300);
	};

	handle = () => {
		console.log('handleA');
		let { a } = this.state;
		this.setState({ a: !a });
	}; //Toggle case to display the options panel

	handleB = () => {
		console.log('handleB');
		let { b } = this.state;
		this.setState({ b: !b });
	};

  /**
   * @description - This function is used to fetch all the messages of the 
   *      current branch and update the graph
   * @returns - void
   */
  fetchBranchMessages = () => {

    const data = {
      branch_name: this.state.currentBranch,
      doctor_id: this.props.doctor.doctorId,
      page_number: this.state.pageNumber 
    }

    this.setState({ loading: true });

    socket.emit('get_branch_all_messages', data, (res) => {
      if (res.status === "error") {
        toast.error(res.message);
        return;
      }
    });

    socket.on('got_branch_all_messages', (data) => {
      if (data) {
        this.setState({ messageData: [...this.state.messageData, ...data] });
        this.updateGraph();
        this.setState({ pageNumber: this.state.pageNumber + 1 });
      }

      this.setState({ loading: false });
    });
  }

    updateGraph = () => {
        if (this.state.nodeRowRefs) {
            const tempPositionData = [];
            this.state.nodeRowRefs.map((item, index) => {
                const element = item.current;
                if (element) {
                    const { x, y } = element.getBoundingClientRect();
                    const height = element.getBoundingClientRect().height;
                    // const height = element.offsetHeight;
                    const nextQuestion = this.state.messageData[index].nextQuestion
                        ? this.state.messageData[index].nextQuestion
                        : null;

                    const options = this.state.messageData[index].options
                        ? this.state.messageData[index].options
                        : null;

                    const dataWithPos = {
                        id: this.state.messageData[index].id,
                        nextQuestion,
                        options,
                        position: [x, y],
                        height
                    };
                    tempPositionData.push(dataWithPos);
                }
            });

            this.setState({ messageWithPost: tempPositionData });
        }
    }

    componentDidUpdate(_prevProps, prevState) {
        if (this.state.currentBranch !== prevState.currentBranch) {
            this.setState({ pageNumber: 1 }, () => {
                this.fetchBranchMessages();
            });
        }
    }

    /**
     * @description - Called when the `load more` btn is clicked. It fetches the next 
     *      (50 default) messages of the current branch
     */
	loadMore = () => {
		this.fetchBranchMessages()
	};

	edit_nextq = (item) => {
		console.log('edit _id:', ' ', item[NEXT_QUESTION]);
		this.setState({ next_id: item._id, next: item[NEXT_QUESTION] });
	};

	handleKeyDown = (event) => {
		if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
			console.log('Ctrl+F pressed - Initiating search');
			// Trigger your search logic here
			if (this.state.search) {
				// event.preventDefault();
				this.setState({ search: false });
			} else {
				// event.preventDefault();
				this.setState({ search: true });
			}
		}
	};

	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleKeyDown);
	}

	handleNewRow = (index) => {
		const { messageData } = this.state;

        const prevRowOrder = messageData[index] ? messageData[index].order : null;
        const nextRowOrder = messageData[index + 1] ? messageData[index + 1].order : null;

		const newRowData = {
			id: 'Enter the name',
			statement: { en: 'Enter your Statement in English', hi: 'Enter your Statement in Hindi' },
			option_name: 'Enter Option name',
			optionsStatement: { en: 'Enter your options in english', hi: 'Enter your options in Hindi' },
			next2: 'Enter the next Question list',
			nextQuestion: 'Enter the next Question',
			//   content_name: "Enter content name",
			//   content_statement: "Enter content statement",
			content_type: 'none',
			content_next: 'Enter the next content',
			doctor_id: this.props.doctor.doctorId,
            branch_name: this.state.currentBranch,
			// content_name:"Enter content_name"
            prev_row_order: prevRowOrder,
            next_row_order: nextRowOrder,
		};

		socket.emit('create_message_for_branch', newRowData, (res) => {
            if (res.status === 'error') {
                toast.error(res.message);
                return;
            }
        });

		socket.on('new_message', async (message) => {
			//its returning from backend with the messaegas a include in to the message data

			let newid = message._id;
			this.setState((prevState) => ({ newmessage: [...prevState.newmessage, newid] }));
			let { newmessage } = this.state;
			// console.log('--------------------------\n', newmessage, '\n----------------------------');
			console.log(message);
			const updateRow = [
				...messageData.slice(0, index + 1),
				message,
				...messageData.slice(index + 1)
			];

			this.setState({
				messageData: updateRow
			});
		});
	};

	handleRowSelection = (selectedRow) => {
		const { selectedRowData } = this.state;

		// Check if the selected row is already in the selectedRowData array
		const isSelected = selectedRowData.some((row) => row.id === selectedRow.id);

		// If the row is already selected, remove it from the array
		// Otherwise, add it to the array
		if (isSelected) {
			const updatedSelectedRowData = selectedRowData.filter((row) => row.id !== selectedRow.id);
			this.setState({ selectedRowData: updatedSelectedRowData });
		} else {
			this.setState((prevState) => ({
				selectedRowData: [...prevState.selectedRowData, selectedRow]
			}));
		}
	};

	handleExport = () => {
		const { selectedRowData } = this.state;

		if (selectedRowData.length > 0) {
			// Converting JSON string
			const jsonData = JSON.stringify(selectedRowData, null, 2);

			// Open a new tab with the JSON data
			const newTab = window.open();
			newTab.document.open();
			newTab.document.write(`<pre>${jsonData}</pre>`);
			newTab.document.close();
		}
	};

	// handleToogleSemantic = () => {
	// 	let { tooglesemantic } = this.state;
	// 	this.setState({ tooglesemantic: !tooglesemantic });
	// };

	getPosition = (index) => {
		const element = this.state.nodeRowRefs[index].current;
		if (element) {
			const { x, y } = element.getBoundingClientRect();
			console.log('Element position:', x, y);
		}
	};

    setCurrentBranch = (branch) => {
        this.setState({ currentBranch: branch });
    }

	render() {
		const {
			messageData,
			messagedef,
			rootSheetRef,

			name_id,
			name,

			next_id,
			next,

			expressdown,

			search,
			searchValue,
			collapse,
			nodeRowRefs,
			messageWithPost,
		} = this.state;

		console.log("messageWithPost", messageWithPost);
		// console.log('typeof messageData =', typeof messageData);

		return (
			<div className="BotBuilder">
				<div className="BotBuilder-table-actions">
                    <div style={{ display: 'flex', gap: 5 }}>
					    <button onClick={this.handleExport} className="BotBuilder-table-actions-export-btn">
						    Export
					    </button>
                        <BranchSelector setBranch={ this.setCurrentBranch } doctorId={this.props.doctor.doctorId} />
                    </div>                    
					<div>
						{search !== true && (
							<input
								className="BotBuilder-table-actions-input"
								aria-label="Sizing example input"
								aria-describedby="inputGroup-sizing-sm"
								type="search"
								placeholder="@search"
								value={searchValue}
								onChange={(event) => {
									event.preventDefault();
									this.setState({ searchValue: event.target.value });
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {

										if (this.state.messagedef.length === 0) {
											this.setState({ messagedef: this.state.messageData }, () => {
												console.log(
													'Updated messagedef:',
													this.state.messagedef,
													' ',
													this.state.messageData
												);
											});
										}

										if (
											this.state.searchValue !== '' &&
											this.state.searchValue !== null &&
											this.state.searchValue !== undefined
										) {
											socket.emit('search', this.state.searchValue, (res) => {
												if (res.result !== null && res.result !== undefined) {
													this.setState({ messageData: res.result }, () => {
														console.log('Updated messageData:', this.state.messageData);
													});
												}
											});
										} else {
											this.setState({ messageData: this.state.messagedef });
										}
									}
								}}
							/>
						)}
					</div>
				</div>

				{/* 
					// handleToogleSemantic={this.handleToogleSemantic}
				// tooglesemantic={this.state.tooglesemantic} */}
				{/* /> */}

				<div
					className={expressdown === false ? 'root_sheet' : 'not_root_down'}
					onScroll={this.handleRootScroll}
					ref={rootSheetRef}
				>
					<div className="field">
						<div className="field-wrapper">
						{/* THIS WILL CREATE NODE AND LAY SIDE BY SIDE _ FLEX MODE !! */}
							<div className="graphs">
								<Svg data={messageWithPost} key="graph" />
							</div>
							<div className="root-root-row">
								<Header
									handle={this.handle}
									collapse={this.state.collapse}
									toogleidfunction={this.toogleidfunction}
									tooglemetadatafunction={this.tooglemetadatafunction}
									tooglesemanticfunction={this.tooglesemanticfunction}
								/>


								{/* <div
													className="root-row root-head"
												>
													<div className="f1 h11">Id</div>
													<div className="f2"   style={{marginTop:"5px"}}>Name</div>
													<div className="flow" style={{marginTop:"5px"}}>Flow</div>
													<div className="f3">Statement/Content Variants</div>
													<div className="f4">Next</div>
													<div className="f5">Options</div>
													<div className="dtype">Type</div>
													<div
														className={
															this.state.collapse.tooglesemantic === true ? 'f6' : 'handleclean'
														}
													>
														Semantic
													</div>
													<div className="fMetaData">Meta Data</div>
												</div> */}


								{messageData.map((item, index) => {
									nodeRowRefs[index] = nodeRowRefs[index] || React.createRef();
									return (
										<>
											<div
												key={`${item._id}-root-row`}
												className="root-row"
												id="justtheid"
												ref={nodeRowRefs[index]}
												onClick={() => this.getPosition(index)}
											>
												<div key={`${item[ID]}-f1`} className="f1 tooltip-content">
													<div className="f1-input">
														<input type="checkbox" onChange={() => this.handleRowSelection(item)} />
													</div>
													<div className="f1-id">
														{this.state.collapse.toogleid === true && (
															<RowTabs contentName={item._id} />
														)}
													</div>
												</div>
												<div
													key={`${item[ID]}-f2`}
													className="f2"
													onClick={() => {
														this.setState({ name_id: item._id, name: item[ID] });
													}}
													onKeyDown={(event) => {
														if (event.key === 'Escape') {
															this.setState({ name_id: null });
														} //name
													}}
												>
													{item._id === name_id && (
														<div className="inputfield">
															<textarea
																placeholder="enter whatever"
																className="edit-textarea"
																autoFocus
																type="text"
																value={name}
																onChange={(event) => {
																	this.setState({ name: event.target.value });
																}}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		this.setState({ name_id: null });
																	} //name
																	if (event.key === 'Enter') {
																		socket.emit('editing_name', name_id, name, (res) => {
                                      if (res.status === "error") {
                                        toast.error(res.message);
                                      } else {
                                        toast.success('Updated Successfully');
                                      }
                                    });
																		this.setState({ name_id: 0 });
                                    item[ID] = name;
																	}
																}}
															/>
															{item._id !== name_id &&
																(item[ID] === '' || item[ID] === undefined || item[ID] === null ? (
																	<div className="inputfield">
																		<textarea
																			placeholder="enter whatever"
																			className="edit-textarea"
																			autoFocus={true}
																			type="text"
																			value={name}
																			onChange={(event) => {
																				this.setState({ name: event.target.value });
																			}}
																			onKeyDown={(event) => {
																				if (event.key === 'Enter') {
																					socket.emit('editing_name', name_id, name);
																					console.log(name_id, ' ', name);
																					this.setState({ name_id: 0 });
																					item[ID] = name;
																				}
																			}}
																		/>
																	</div>
																) : (
																	checksearch(
																		item[ID] === undefined ? '' : item[ID],
																		this.state.searchValue
																	)
																))}
														</div>
													)}

													{item._id !== name_id &&
														(item[ID] === '' || item[ID] === undefined || item[ID] === null ? (
															<div className="inputfield">
																<textarea
																	placeholder="enter whatever"
																	className="edit-textarea"
																	autoFocus={true}
																	type="text"
																	value={name}
																	onChange={(event) => {
																		this.setState({ name: event.target.value });
																	}}
																	onKeyDown={(event) => {
																		if (event.key === 'Enter') {
																			socket.emit('editing_name', name_id, name);
																			this.setState({ name_id: 0 });
																		}
																	}}
																/>
															</div>
														) : (
															checksearch(item[ID] ?? '', this.state.searchValue)
														))}
												</div>

												{/* flow */}
												<div key={`${item[ID]}-flow`} className="flow">
													<Flow item={item} searchValue={searchValue} />
												</div>

												<div key={`${item[ID]}-f3`} className="f3">
													{/* {item.content_variants.length > 0 ? (
														<ContentVariantColumn
															key={`f3-${item._id}-ContentVariantColumn`}
															item={item}
															updateData={this.updateData}
														/>
													) : (
														<NormalStatement
															key={`f3-${item._id}-normalStatement`}
															updateData={this.updateData}
															statement={item.statement}
															dataId={item._id}
															searchValue={searchValue}
															checksearch={this.checksearch}
															items={item}
														/>
													)} */}
													<StatementVarient item={item} searchValue={searchValue} />
													{/* statement/content variant`` */}
												</div>

												{/* <div
										key={`${item[ID]}-f4`}
										className="f4"
										onKeyDown={(event) => {
											if (event.key === 'Escape') {
												this.setState({ next_id: null });
											}
										}}
										onClick={() => {
											this.edit_nextq(item);
										}}
									>
										{item._id === next_id && (
											<textarea
												className="edit-textarea"
												placeholder="Next"
												type="text"
												value={next}
												autoFocus
												onChange={(event) => {
													this.setState({ next: event.target.value });
												}}
												onKeyDown={(event) => {
													if (event.key === 'Enter') {
														socket.emit('editing_next', next_id, next);
														console.log(next_id, ' ', next);
														this.setState({ next_id: null });
														item[NEXT_QUESTION] = next;
													}
												}}
									<div key={`${item[ID]}-f3`} className="f3">
										{item.content_variants.length > 0 ? (
											<ContentVariantColumn
												key={`f3-${item._id}-ContentVariantColumn`}
												item={item}
												updateData={this.updateData}
											/>
										) : (
											<NormalStatement
												key={`f3-${item._id}-normalStatement`}
												updateData={this.updateData}
												statement={item.statement}
												dataId={item._id}
												searchValue={searchValue}
												checksearch={this.checksearch}
												item={item}
												type={"statement"}
											/>

										)}
										{item._id !== next_id &&
											this.checksearch(
												item[NEXT_QUESTION] === undefined ? '' : item[NEXT_QUESTION],
												this.state.searchValue
											)}
									</div> */}
												<div key={`${item[ID]}-f4`} >
													<NextQuestionVarient item={item} searchValue={searchValue} />
												</div>

												<div key={`${item[ID]}-f5`} className="f5" id={`${item[ID]}-f5`}>
													<OptionsColumn
														key={`f5-${item._id}`}
														item={item}
														searchValue={searchValue}
													/>
												</div>
                        <div key={`${item[ID]}-process`} className="process" id={`${item[ID]}-process`}>
                          <ProcessColumn
                            key={`process-${item._id}`}
                            item={item}
                            searchValue={searchValue}
                          />
                        </div>
												<div className="dtype" key={`${item[ID]}-dtype`}>
													<Type item={item} searchValue={searchValue} itemid={item._id} />
												</div>
												<div
													className={
														this.state.collapse.tooglesemantic === true ? 'f6' : 'handleclean'
													}
													key={`${item[ID]}-f6`}
													id={`${item[ID]}-f6`}
												>
													{this.state.collapse.tooglesemantic === true && (
														<Topic
															item={item}
															checksearch={checksearch}
															searchValue={searchValue}
														/>
													)}
												</div>

												<div className="fMetaData">
													{this.state.collapse.tooglemetadata === true &&
														item.doctor.map((doctor) => <RowTabs contentName={doctor.username} />)}
												</div>
											</div>
                      <div className='add-row' >
                        <AddCircleOutlineOutlinedIcon className="add-row-icon" onClick={() => this.handleNewRow(index)} />
                      </div>
										</>
									);
								})}
                </div>
							</div>
						</div>

						<div className="main-loader">
							{this.state.loading && <ClipLoader className="loader" size={50} color={'gray'} />}
						</div>
					</div>
				</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		doctor: state.doctor.doctor,
		loading: state.doctor.loading,
		error: state.doctor.error
	};
};

export default connect(mapStateToProps)(Persona);
