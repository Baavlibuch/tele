import React from "react";
import * as Icon from "react-feather";
import $ from "jquery";
import _ from "lodash";

import Progress from "react-progressbar";

import axios from "axios";
import { ENDPOINT, languages } from "../config";

import PeerConnection from "./webrtc/PeerConnection";
import CallWindow from "./webrtc/CallWindow";
import CallModal from "./webrtc/CallModal";
import Cookies from 'universal-cookie';

import { getDescriptionImage } from "./componentHelper";
import { LANG_ENGLISH, LANG_HINDI, LANG_MARWARI } from "../apiHelper";
import doctor from "./doctor";

const bson = require('bson');
const { commands } = require('../data/commands'); // TODO: Should be fetched from backend or be executed at the backend via APIs
const client = require('socket.io-client');	// client ~ io

const TYPE_TEXT = 'text'
const TYPE_BUTTON = 'button'
const TYPE_LIST = 'list'										// checkboxes
const TYPE_SELECT = 'select'
const TYPE_UPLOAD = 'upload'
const TYPE_CUSTOM_TEXT = 'custom_text'
// const TYPE_MULTI_SELECT = 'multi_select'
const TYPE_NONE = "none"                    // send a message and move to next message. Or run a command
const TYPE_ANALYSE = "analyse"              // complex analyses of user answers on frontend. example cardiac screening
const TYPE_GENERIC_TEXT = 'generic_text'
const TYPE_DOWNLOAD = 'download'

const MUTE_ALL = 'muteall'
const SPEAK_ALL = 'speakall'
// const STOP_SPEECH = 'stop'

const INCOMING_MESSAGE = 'incoming'					// sent by bot or doctor
const OUTGOING_MESSAGE = 'outgoing'					// sent by user/patient

//Incoming message : chatbot server to user

export default class Chat extends React.Component {
	cookies = new Cookies();
	audio = undefined;
	state = {
		conversation_session_id: '',
		questions: [],
		answers: {},
		timestamps: {},
		messageReceivedTimestamp: null,
		currentQuestion: {},

		languageSelected: null, // TODO: Save and load from cookie
		helpline: '011-23978046', // TODO: Fetch location specific ambulance numbers

		optionSelected: null,
		textAnswered: '',

		chat: [],
		loadingChat: true,
		requesting: false,

		connectToDoctor: false,

		patientId: null,
		doctor: null,
		incomingTyping: false,

		answerBoxHidden: true,
		answerFormat: {}, // instructions for presenting and receiving the answer to the user
		questionDetails: {},

		callWindow: '',
		callModal: '',
		localSrc: null,
		peerSrc: null,

		mute: SPEAK_ALL
	};

	socket = null;
	pc = {};

	componentDidMount() {
		// generate sessionID for mongodb.
		this.state.conversation_session_id = new bson.ObjectId().toString();

		let languageSelected = this.cookies.get('languageSelected')
		if (!languageSelected) {
			languageSelected = 'hi'
			this.cookies.set('languageSelected', languageSelected, { path: '/' });
		}
		this.setState({ languageSelected })//, conversation_session_id})

		this.realtime()
		

		// axios
		// 	.get(ENDPOINT + '/api/questions')
		// 	.then((response) => {
		// 		const { questions, incomingChats } = response.data;
		// 		if (questions)
		// 			this.setState(
		// 				{
		// 					questions,
		// 					chat: incomingChats,
		// 					loadingChat: false
		// 				},
		// 				() => {
		// 					this.setQuestion(questions[0]);
		// 				}
		// 			);
		// 	})
		// 	.catch((error) => {
		// 		// this.setState({ loadingChat: false });
		// 		console.log(error);
		// 	});

		// navigator.geolocation.getCurrentPosition(
		//   this.getHelpline.bind(this)
		// );

	}

	componentWillUnmount() {
		if (this.socket) this.socket.disconnect();
	}

	componentDidUpdate(prevProps) {
		const { selectedDoctor, PatientID, trigger } = this.props;

		// Check if selectedDoctor or PatientID has changed
		if (prevProps.selectedDoctor !== selectedDoctor || prevProps.PatientID !== PatientID || prevProps.trigger != trigger) {
			// Update the state and reconnect to the socket after updating state
			this.setState({ doctor: selectedDoctor, patientId: PatientID }, () => {
				console.log("Updated doctor:", this.state.doctor);
				console.log("Updated patientId:", this.state.patientId);
				this.setState({ connectToDoctor: true })
				// Reconnect to the socket after updating state
				this.connect();
			});
		}
		console.log("Previous callBtn value:", prevProps.callBtn);
		console.log("Current callBtn value:", this.props.callBtn);

		if (prevProps.callBtn !== this.props.callBtn) {
			console.log("calling started! from chat");
			const config = { audio: true, video: true };
			this.startCall(true, config);
		}
	}


	/**
	   * sets different types of questions - configures variables to be used later
	 * @param question Either a question object or a question ID
	 * @param customOptions Overrides the existing options
	   * Sends information to the backend with every message
	   * Adds the statements in the memory
	 */
	setQuestion = (question, customOptions = null) => {
		// if ID, get object
		if (typeof question == "number" || typeof question == "string") {
			question = this.getQuestionById(question);
		}
		const { answers, textOverrideAnswered } = this.state;					// contains question ID and value of user input
		let { statement, type, options, pattern, id, nextQuestion, paramsFrom, command, branches, loopStart } = question;
		console.log("statement = ", statement)

		if (customOptions) {
			options = customOptions;
		}

		let { chatStatement, audio } = this.setOutput(statement);

		if (typeof statement && typeof statement !== 'string') {
			console.log(`setQuestion. typeof statement = ${typeof statement}`)
			this.speak(chatStatement, false, audio, statement)
			// conversation is added in the memory here
			for (let key in statement) {
				statement[key] = this.insertVariables(statement[key]);
			}
		} else {
			console.log(`setQuestion. typeof statement = ${typeof statement}`)
			statement = this.insertVariables(statement);
		}
		if (typeof options == 'string') {
			// Options generated by a command
			options = commands[options](answers, question, this.setQuestion);
		}
		let tempSelection = this.state.tempSelection;
		if (type === 'list') {
			tempSelection = {};
			for (let i = 0; i < options.length; ++i) {
				tempSelection[i] = false;
			}
		}
		// console.log('chatbot.js.setQuestion progress marker 1')
		this.enterMessageIntoChat(statement, INCOMING_MESSAGE);
		this.setState({
			answerBoxHidden: type === TYPE_NONE,
			textAnswered: '',
			optionSelected: '0',
			answerFormat: { type, options, pattern },
			questionDetails: { loopStart, statement, id, nextQuestion, paramsFrom, command, branches },
			tempSelection: tempSelection
		});
		// console.log('chatbot.js.setQuestion progress marker 2')
		if (type === TYPE_NONE && command) {
			// run a task/command
			//commands[command](answers, question, this.setQuestion);
			this.realtime()
		}
		else if (type === TYPE_ANALYSE && command) {
			// run a task/command
			// const { questions } = this.state;
			//commands[command](answers, question, questions, this.setQuestion);
			this.realtime()
		}
		else if (type === TYPE_NONE && nextQuestion) {
			// console.log('chatbot.js.setQuestion progress marker 3')
			// simple statement
			// Without delay, the present question may not get rendered
			setTimeout(function () {
				console.log("simple statement. nextQuestion = ", nextQuestion)
				if (this.questions !== undefined) this.setQuestion(nextQuestion);
				else this.realtime();
			}.bind(this), 1000)
		}
		else {
			console.log("chatbot.js.setQuestion. progress marker 4 - default situation in setQuestion");
		}
		if (question.statement && question.statement.download) {
			console.log(`chatbot.setQuestion : question.statement.download = ${question.statement.download}`)
			axios.get(ENDPOINT + `/api/download/${question.statement.download}`, {
				responseType: 'blob', // important
				// params: { fileUrl: question.statement.download }
			}).then((response) => {
				// create file link in browser's memory
				const href = URL.createObjectURL(response.data);

				// create "a" HTML element with href to file & click
				const link = document.createElement('a');
				link.href = href;
				link.setAttribute('download', question.statement.download); //or any other extension
				document.body.appendChild(link);
				link.click();

				// clean up "a" element & remove ObjectURL
				document.body.removeChild(link);
				URL.revokeObjectURL(href);
			});
		}
	};

	setOutput(statement) {
		console.log('setOutput() : statement = ', statement)
		let audio = undefined;
		let chatStatement = (typeof statement === "string") ? statement : statement[this.state.languageSelected];
		// console.log('setOutput() : chatStatement = ', chatStatement)
		if (chatStatement && typeof chatStatement !== "string") {
			audio = chatStatement["audio"];
			chatStatement = chatStatement["text"];
		}
		// fallback to default behaviour if no values exist
		if (!chatStatement) chatStatement = statement[LANG_HINDI];
		if (chatStatement && typeof chatStatement !== "string") {
			audio = chatStatement["audio"];
			chatStatement = chatStatement["text"];
		}
		if (!chatStatement) chatStatement = statement[LANG_ENGLISH];
		if (chatStatement && typeof chatStatement !== "string") {
			audio = chatStatement["audio"];
			chatStatement = chatStatement["text"];
		}
		console.log('chatStatement = ', chatStatement)
		return { chatStatement, audio };
	}

	/**
	 * formats the data of statement and associated data of message
	 */
	insertVariables(statement) {
		let formattedStatement = statement;
		console.log(`chatbot.insertVariable formattedStatement = ${formattedStatement}`)
		while (typeof formattedStatement === String && formattedStatement.search('{.*}') !== -1) {
			formattedStatement = this.insertVariable(formattedStatement);
		}
		return formattedStatement;
	};

	insertVariable(statement) {
		let formattedStatement = statement;
		let start = statement.search('{.*}');
		if (start !== -1) {
			let end = statement.search('}');
			formattedStatement = statement.replace(
				statement.substring(start, end + 1),
				this.state[statement.substring(start + 1, end)]);
		}
		return formattedStatement;
	};

	/**
	 * Add message of any kind to the json and update UI
	 */
	enterMessageIntoChat = (statement, direction) => {
		const { chat } = this.state;
		this.setState(
			{
				chat: chat.concat([{ statement, type: direction }])
			},
			this.scrollDown
		);
	};

	/*
	 * Return question object from questions list
	 */
	getQuestionById = (id) => {
		const { questions, currentQuestion } = this.state;
		// realtime. messages are received on the fly
		if (id === undefined) {
			return currentQuestion
		}

		// offline. entire question bank is received. and decisions are made at the client
		for (let i = 0; i < questions.length; i++) {
			if (questions[i].id === id) return questions[i];
		}

		console.error("failed to search for question with ID = ", id)
		return null;
	};

	/**
	 * UI
	 */
	scrollDown = () => {
		let x = $('#chat-box')
		if (x.length)
			x.animate({ scrollTop: x[0].scrollHeight }, 800);
	};

	/**
	 * Sends on send button press. Attached to form. Uses socket
	 */
	sendMessage = (event) => {
		const { textAnswered, doctor } = this.state;

		if (event && event.preventDefault) event.preventDefault();

		if (textAnswered.length) {
			this.setState({ textAnswered: '' });
			this.socket.emit('message', { message: textAnswered, to: doctor });
			this.enterMessageIntoChat(textAnswered, OUTGOING_MESSAGE);
		}
	};

	// used while uploading image
	handleMessageChange = (event) => {
		const { id, value } = event.target;
		const { textAnswered, doctor } = this.state;

		this.setState({
			[id]: value
		});

		if ((value.length === 0) ^ (textAnswered.length === 0)) {
			this.socket.emit('typingChange', { state: value.length > 0, to: doctor });
		}
	};

	/**
	 * For doctor-patient interaction
	 * For call or only messages?
	 * Primarily for the doctor
	 */
	connect = () => {
		console.log('connect() to doctor');
		const { patientId } = this.state;
		const { setSocketRef, PatientID } = this.props;  // Receive socketRef as a prop

		// Check if socketRef exists, otherwise create a new socket
		const idToUse = PatientID || patientId;

		console.log('Initializing new socket');
		this.socket = client('/app_chat', {
			transports: ['websocket'],
			query: {
				type: 'patient',
				patientId: idToUse,
			}
		});

		setSocketRef(this.socket);


		console.log("this is socket", this.socket);

		// Ensure event listeners are set up
		this.socket.on('doctorAlloted', (doctor) => {
			console.log("chatbot function doctorAlloted");
			this.setState({
				answerBoxHidden: false,
				requesting: false,
				doctor
			});
		});

		this.socket.on('onlineUsers', (onlineUsers) => {
			console.log("chatbot function onlineUsers");
			this.setState({ onlineUsers });
		});

		this.socket.on('message', ({ message, from }) => {
			console.log("chatbot function message");
			if (from === this.state.doctor) {
				this.setState({ incomingTyping: false });
				this.enterMessageIntoChat(message, 'incoming');
			}
		});

		this.socket.on('typingChange', ({ state, from }) => {
			console.log("chatbot function typingChange");
			if (from === this.state.doctor) {
				this.setState({ incomingTyping: state });
				this.scrollDown();
			}
		});

		this.socket.on('referUser', (doctor) => {
			console.log("chatbot function referUser");
			this.endCall(false);
			this.setState({ doctor, answerBoxHidden: true });
		});

		this.socket.on('request', (from) => {
			console.log("chatbot function request");
			if (from === this.state.doctor) {
				this.setState({ callModal: 'active' });
				this.scrollDown();
			}
		});

		this.socket.on('call', ({ data, from }) => {
			console.log("chatbot function call");
			if (from === this.state.doctor) {
				if (data.sdp) {
					this.pc.setRemoteDescription(data.sdp);
					if (data.sdp.type === 'offer') this.pc.createAnswer();
				} else {
					this.pc.addIceCandidate(data.candidate);
				}
			}
		});

		this.socket.on('end', (from) => {
			console.log("chatbot function end");
			if (from === this.state.doctor) this.endCall(false);
		});
	};


	startCall = (isCaller, config) => {
		this.config = config;
		this.pc = new PeerConnection(this.socket, this.state.doctor)
			.on('localStream', (src) => {
				const newState = { callWindow: 'active', localSrc: src };
				if (!isCaller) newState.callModal = '';
				this.setState(newState);
			})
			.on('peerStream', (src) => this.setState({ peerSrc: src }))
			.start(isCaller, config);
	};

	rejectCall = () => {
		const { doctor } = this.state;
		this.socket.emit('end', doctor);
		this.setState({ callModal: '' });
	};

	endCall = (isStarter) => {
		if (_.isFunction(this.pc.stop)) {
			this.pc.stop(isStarter);
		}
		this.pc = {};
		this.config = null;
		this.setState(
			{
				callWindow: '',
				callModal: '',
				localSrc: null,
				peerSrc: null
			},
			this.scrollDown
		);
	};

	answer = (event, textOverrides) => {
		console.debug('answer()')
		const { optionSelected, questionDetails, answerFormat, answers, tempSelection } = this.state;
		console.log(`answer : optionSelected = ${optionSelected}`)
		const { options, type } = answerFormat;
		// noinspection JSUnusedLocalSymbols
		const { id, paramsFrom, branches, loopStart } = questionDetails;
		let { textAnswered, reset } = this.state;
		let textTypeAnswer = [TYPE_CUSTOM_TEXT, TYPE_TEXT, 'tel', 'password', 'email', 'date'].includes(type);

		// prevent Default followup to the event. No idea when?
		if (event && event.preventDefault) event.preventDefault();

		if (type === TYPE_LIST) {
			// Don't do much other than update things
			textTypeAnswer = false;
			textAnswered = "";
			let savedValues = [];
			for (let i = 0; i < options.length; ++i) {
				let { statement, audio } = this.setOutput(options[i].statement)
				if (tempSelection[i]) {
					textAnswered += statement + ", ";
					savedValues.push(options[i].dbValue);
				}
			}
			if (textAnswered === "") textAnswered = "None"
			else textAnswered = textAnswered.substring(0, textAnswered.length - 2);

			let s = ''
			if (textTypeAnswer) {
				console.log('answer() : textTypeAnswer = ', textTypeAnswer, ', textAnswered = ', textAnswered)
				s = textAnswered;
			}
			else {
				console.log('answer() ', savedValues)
				for (let i = 0; i < savedValues.length; i++) {
					if (i > 0) s += ', '
					s += savedValues[i];
					console.log(`answer() savedValues[${i}] = `, savedValues[i])
				}
			}
			this.enterMessageIntoChat(s, OUTGOING_MESSAGE);
			console.log(`answer() list constructed value = `, s)

			this.setState(
				{
					answers: {
						...this.state.answers,
						[id]: savedValues
					},
					answerBoxHidden: true,
					timestamps: {
						...this.state.timestamps,
						[id]: Date.now()
					}
				},
				this.answerEntered
			);
		}
		else if (reset) {
			console.log('chatbot.answer : reset = ', reset)
			this.realtime()
			// this.setState(this.state, this.answerEntered)
		}
		else if ((!textTypeAnswer || textAnswered) && (!textOverrides)) {
			// accept as an answer if type is not text.
			console.log('textOverrides = ', textOverrides)

			if (type === 'password') {
				this.enterMessageIntoChat('****', OUTGOING_MESSAGE);
			}
			else if (type !== TYPE_NONE) {
				console.debug('answer() type != none')
				// button
				this.enterMessageIntoChat(
					textTypeAnswer ? textAnswered : options[optionSelected].statement,
					OUTGOING_MESSAGE
				);
			}
			let value = textTypeAnswer ? textAnswered : options[optionSelected].value;
			if (loopStart) {
				value = [value];
				if (answers[id]) {
					value = [...answers[id], ...value];
				}
			}
			this.setState(
				{
					answers: {																								// push a value into answers
						...this.state.answers,
						[id]: value
					},
					answerBoxHidden: true,
					timestamps: {
						...this.state.timestamps,
						[id]: Date.now()
					}
				},
				this.answerEntered
			);
		}
		else {
			console.debug('answer() default fallback')
			if (textOverrides) {
				console.log("text overrides. custom user input. nothing special done yet")
			}
		}
	};

	/*
	 * called when bot completes questionnaire and is passed in user's physical location
	 * posts to the assessment api
	 */
	completedChatbot = (position) => {
		const { latitude, longitude } = (position && position.coords) || {};
		const { chat, answers, timestamps, conversation_session_id } = this.state;

		this.setState({ requesting: true });

		// Save the statements in the selected language.
		const chatToSave = this.saveChatStatements(chat);

		/*
		 * send the chat to the server and push into DB.
		 * run the assessment code
		 */
		axios
			.post(ENDPOINT + '/api/assessment', {
				answers,
				timestamps,
				latitude,
				longitude,
				chat: chatToSave,
				conversation_session_id
			})
			.then((response) => {
				console.log("api/assessment contacted")
				const { incomingChats, connectToDoctor, patientId, question } = response.data;		// messages fetched here
				if (connectToDoctor) {
					console.log('connectToDoctor = ', connectToDoctor)
					this.setState(
						{
							connectToDoctor,
							patientId,
							chat: chat.concat(incomingChats)
						},
						this.scrollDown
					);
					this.setQuestion(question);
					console.log('scrolledDown()')

				} else {
					console.log("not connect to doctor")
					if (incomingChats) {
						// bot to user
						console.log("incoming chats")
						this.setState(
							{
								chat: chat.concat(incomingChats)																	// This is where chat content is updated
							},
							this.scrollDown
						);
					}
				}
				this.setState({ requesting: false });
			})
			.catch((error) => {
				this.setState({ requesting: false });
				console.log(error);
			});
	};

	saveChatStatements(chat) {
		console.log("saving chatStatement")
		const chatToSave = [];
		for (let i = 0; i < chat.length; ++i) {
			let { statement, audio } = this.setOutput(chat[i].statement)
			let type = chat[i].type;
			chatToSave.push({ statement, type });
		}
		return chatToSave;
	}

	/*
	 * Runs after answer is entered by the user.
	 * Sets up command execution
	 * Calls setQuestion()
	 * Will update server
	 * Before endchatbotsequence()
	 */
	answerEntered = () => {
		console.log("answerEntered() entered")
		// noinspection JSUnusedLocalSymbols
		const { answers, connectToDoctor, optionSelected,
			answerFormat, questionDetails, tempSelection, questions } = this.state;
		const { type, options } = answerFormat;
		//const textTypeAnswer = ['text', 'tel', 'password', 'email', 'date', 'list'].includes(type);
		let { nextQuestion } = options && typeof options[optionSelected].nextQuestion != 'undefined'
			? options[optionSelected] : questionDetails;
		const { command } = questionDetails;
		console.debug('nextQuestion = ', nextQuestion, '. command = ', command, '. questionDetails = ', questionDetails)
		console.debug("type =", type, "command = ", command)
		if (typeof nextQuestion === 'undefined' && command) {
			// Next question to be set by command logic
			console.log(answers)
			if (questions === undefined) this.realtime();
			else commands[command](answers, questionDetails, this.setQuestion, tempSelection);
		}
		else if (type === TYPE_ANALYSE && command) {
			// focus on analysing
			const { questions } = this.state;
			if (questions === undefined) this.realtime()
			else commands[command](answers, questionDetails, questions, this.setQuestion);
		}
		else if (nextQuestion === 0) {
			this.endChatbotSequence();
		}
		else if (questions !== undefined && questions.length > 0) {
			console.debug(questions)
			// offline scenario
			// nextQuestion has been provided
			const question = this.getQuestionById(nextQuestion);
			this.setQuestion(question);
		}
		// else if (questions === undefined) {
		// 	// realtime
		// 	this.realtime()
		// }
		else {
			// normal scenario. next question is available
			// examples of unhandled scenarios are - list
			// console.error("answerEntered. unhandled scenario")
			console.log('normal answer. answers = ', answers)
			this.realtime()
		}
		console.log('answerEntered. optionSelected = ', optionSelected)
	};

	/**
	 * End of flow.
	 */
	endChatbotSequence = () => {
		console.log("endChatbotSequence()")
		const { connectToDoctor, optionSelected } = this.state;
		console.log(connectToDoctor)
		if (connectToDoctor) {
			const lastMessage = {
				en: 'Please look after your health.',
				hi: 'कृपया अपनी सेहत का ख़याल रखें।',
				bn: 'আপনার স্বাস্থ্যের যত্ন নিন'
			};
			if (optionSelected === '0') this.connect();
			else this.enterMessageIntoChat(lastMessage[this.state.languageSelected], 'incoming');
		} else {
			// get completed chatbot - leads to assessment
			navigator.geolocation.getCurrentPosition(
				this.completedChatbot.bind(this),
				this.completedChatbot.bind(this)
			);
			console.log("got current user location")
		}
	};

	/**
	 * Called on UI, state, etc changes on frontend
	 * Redirects to URLs if needed
	 * Most frequently called
	 * Best for tracking of user behavior
	 * Updates state
	 */
	handleChange = (event) => {
		const { id, value } = event.target;
		console.log('onChange.handleChange : event = ', event)
		const { type } = this.state.answerFormat;

		if (type === TYPE_LIST) {
			this.setState({
				tempSelection: {
					...this.state.tempSelection,
					[id]: !this.state.tempSelection[id]
				}
			});
		}
		else if (event.target.id === 'textOverrideField') {
			// text message overrides other ui inputs
			console.log('handleChange. textOverrideField')
			this.setState(
				{
					textAnswered: value
				},
				() => {
					this.answer(null, true);
				}
			);
		}
		else {
			// everything default behavior, update things
			console.log("handleChange default")
			// external site
			let redirectUrl = event.target.getAttribute("data-url")

			this.setState(
				{
					[id]: value
				},
				() => {
					if (type === TYPE_BUTTON) {

						// open external site
						if (redirectUrl) window.open(redirectUrl)

						this.answer(null, false);
					}
				}
			);
		}
	};

	handleLanguageChange = (event) => {
		const { id, value } = event.target;
		this.cookies.set(id, value, '/')
		this.setState(
			{
				[id]: value
			},
			() => {
				// const { languageSelected } = this.state.languageSelected;
				this.scrollDown();
			}
		);
	};

	/*
	 * live chat-bot text communication with server
	 */
	realtime = (state) => {
		console.log("realtime()")
		const data = this.makeRealtimeRequest(state, false)
		this.sendRealTimeRequest(data)
	}

	backMessage = (event) => {
		console.log("realtime()")
		const data = this.makeRealtimeRequest(this.state, true)
		console.log('chatbot.backMessage data = ', data)
		this.sendRealTimeRequest(data)
	}

	sendRealTimeRequest = (data) => {
		axios
			.post(ENDPOINT + '/api/realtime', data)
			.then((response) => this.realtimeResponse(response))
			.catch((error) => {
				// this.setState({ loadingChat: false });
				this.scrollDown()
				console.error('realtime post error - ', error)
			})
	}

	makeRealtimeRequest = (state, back) => {
		console.log(`chatbot.makeRealTimeRequest back = ${back}`)
		const { optionSelected,
			answerFormat,
			// questionDetails,
			textAnswered,
			customText,
			conversation_session_id,
			answers,
			patientId,
			currentQuestion,
			messageReceivedTimestamp,
			reset
		} = this.state;
		const { options } = answerFormat;
		let nextQuestion;
		if (back) nextQuestion = undefined
		else {
			if (options && options[optionSelected].nextQuestion) {
				// question has options. type is button
				nextQuestion = options[optionSelected].nextQuestion;
			} else {
				// question doesn't have options. other types
				nextQuestion = currentQuestion.nextQuestion;
			}
		}
		// console.debug('realtime().currentQuestion = ', currentQuestion)
		// TODO : check if branch questions (with compute and decisions) are managed well
		// const question = this.getQuestionById(nextQuestion);
		// console.log("questionDetails = ", questionDetails)
		// console.log("textAnswered = ", textAnswered)
		// console.log(optionSelected)
		// console.log("nextQuestion = ", nextQuestion)
		console.log(`chatbot.realtime: customtext = ${customText}`)

		return {
			currentQuestion,
			optionSelected,
			customText: answerFormat.type === TYPE_CUSTOM_TEXT ? textAnswered : null,
			answerFormat,
			options,
			nextQuestion,
			conversation_session_id,
			answers,
			patient_id: patientId,
			state: state,
			reset,
			duration: Date.now() - messageReceivedTimestamp,
			back
		}
	}

	realtimeResponse = (response) => {
		console.log('chatbot.realtimeResponse() response = ', response)
		const { question, incomingChats } = response.data;
		console.log('chatbot.realtimeResponse.question received = ', question)
		if (question)
			this.setState(
				{
					currentQuestion: question,
					loadingChat: false,
					messageReceivedTimestamp: Date.now(),
					reset: false,
					customText: null
				},
				() => {
					console.log("settingQuestion")
					this.setQuestion(question);
				});
	}

	imageUpload = (event) => {
		const { questionDetails } = this.state;
		const nextQuestion = questionDetails ? questionDetails.nextQuestion : null;
		const file = event.target.files[0];
		if (!file) return;
		if (!this.socket) console.log("Not connected to doctor's chat");
		this.setState({ uploadingImage: 0.01 });
		const { doctor } = this.state;

		const formData = new FormData();
		formData.append('image', file);

		axios
			.post('/api/image', formData, {
				onUploadProgress: (progressEvent) => {
					this.setState({
						uploadingImage: progressEvent.loaded / progressEvent.total
					});
				}
			})
			.then((response) => {
				const { image } = response.data;
				this.enterMessageIntoChat('chat-img-' + image.filename, OUTGOING_MESSAGE);
				if (this.socket) {
					this.socket.emit('message', { message: 'chat-img-' + image.filename, to: doctor });
				} else if (nextQuestion) {
					this.setQuestion(nextQuestion);
				} else if (nextQuestion === 0) {
					this.endChatbotSequence();
				}
				this.setState({ uploadingImage: 0, ...(image ? { image } : {}) });
			})
			.catch((err) => {
				console.log(err);
				if (nextQuestion) {
					this.setQuestion(nextQuestion);
				}
				this.setState({ uploadingImage: 0 });
			});
	};

	/* Chat history box */
	renderChat = () => {
		const {
			callModal,
			chat,
			answerBoxHidden,
			incomingTyping,
			loadingChat,
			requesting,
			mute
		} = this.state;

		if (loadingChat) return null;
		console.log("renderChat : chat.length = ", chat.length, ". chat = ", chat)
		return (
			<div id="chat-box" className="chat-box" style={answerBoxHidden ? { marginBottom: 0 } : {}}>
				{chat.map(({ statement, type }) => {
					// latest message render
					let { chatStatement, audio } = this.setOutput(statement)
					let description_image = getDescriptionImage(statement, this.state.languageSelected);

					return (
						<p
							// key={{chatStatement}}
							className={`${type}-message ${type === OUTGOING_MESSAGE ? 'fadeInUp' : 'fadeInRight'}`}
							style={{ animationDelay: type === 'incoming' ? '0.6s' : '0.2s' }}
							onMouseEnter={() => { if (mute === SPEAK_ALL) this.speak(chatStatement, true, audio, statement) }}
							onTouchStart={() => { if (mute === SPEAK_ALL) this.speak(chatStatement, true, audio, statement) }}
							onMouseLeave={() => { this.stopAudio() }}
						>
							{description_image && <div>
								<img src={require("../data/" + description_image)} style={{ maxHeight: `${type === OUTGOING_MESSAGE ? '150px' : undefined}` }} alt='' />
							</div>}
							{(typeof statement === 'string') && (statement.endsWith('.jpg') || statement.endsWith('.jpeg') || statement.endsWith('.png')) ? (
								<img
									src={`http://${window.location.hostname}:3000/aa/images/` + statement.split('-')[2]}
									alt=""
								/>
							) : (typeof statement === 'string') && statement.endsWith('.pdf') ? (
								<a
									href={`http://${window.location.hostname}:3000/aa/images/` + statement.split('-')[2]}
									target="_blank"
									rel="noopener noreferrer"
									download
									style={{ fontSize: '18px' }}
								>
									Download PDF
								</a>
							) : (
								chatStatement
							)}
						</p>
					);
				})}
				{incomingTyping || requesting ? (
					<p className="incoming-message">
						<div className="dots">
							<div className="dot" />
							<div className="dot" />
							<div className="dot" />
						</div>
					</p>
				) : null}
				<CallModal status={callModal} startCall={this.startCall} rejectCall={this.rejectCall} />
			</div>
		);
	};

	stopAudio() {
		window.speechSynthesis.cancel();
		try { if (this.audio) this.audio.pause(); } catch (e) { console.log("this.audio.pause doesn't work") }
	}

	speak(chatStatement, stopOldSpeach = true, recording, statement) {
		// console.log("speaking ", chatStatement)
		if (stopOldSpeach) this.stopAudio()

		if (recording) {
			this.audio = new Audio(require('../data/audio/' + recording));
			// audio.type("audio/mp3")
			this.audio.play();
			return
		}

		if (!chatStatement) {
			let output = this.setOutput(statement);
			chatStatement = output.chatStatement
		}
		console.log("speak : chatStatement = ", chatStatement)

		const msg = new SpeechSynthesisUtterance()
		msg.text = chatStatement.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
		// msg.volume = 1;
		msg.lang = this.state.languageSelected
		if (msg.lang === LANG_MARWARI) msg.lang = LANG_HINDI
		window.speechSynthesis.speak(msg);
		// console.log("speechSynthesis.speaking = ", window.speechSynthesis.speaking, "stopSpeaking = ", stopOldSpeach)
		window.speechSynthesis.resume()
	}

	textAnswerOverrides = (event) => {
		let { answerFormat } = this.state
		answerFormat.type = TYPE_CUSTOM_TEXT
		this.setState({ answerFormat })
		console.log('answerFormat = ', answerFormat)
		this.answer(null, false)
	};

	/*
	 * Create UI for when user wants to text instead of button, etc.
	 * Used in TYPE_LIST, TYPE_BUTTON, TYPE_SELECT, TYPE_UPLOAD
	 */
	renderTextOverrideMessage = () => {
		const { textOverrideAnswered } = this.state;
		const { pattern } = this.state.answerFormat;
		console.log('renderTextOverride : rendering customeTextField')
		return (
			<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
				<form onSubmit={this.textAnswerOverrides} className="message-form">
					<input
						id="textOverrideField"
						value={textOverrideAnswered}
						onChange={this.handleChange}
						type={TYPE_CUSTOM_TEXT}
						pattern={pattern}
						autoComplete="off"
						autoCorrect="off"
						spellCheck="false"
						onFocus={this.scrollDown}
					/>
					<button type="submit" className="send">
						<Icon.Send />
					</button>
				</form>
			</div>
		)
	}

	/* User inputs */
	renderAnswers = () => {
		console.log("renderAnswers()")
		const {
			optionSelected,
			textAnswered,
			answerBoxHidden,
			doctor,
			loadingChat,
			uploadingImage
		} = this.state;
		const { options, type, pattern } = this.state.answerFormat;
		console.log('renderAnswers type = ', type)

		const callWithVideo = (video) => {
			const config = { audio: true, video };
			return () => this.startCall(true, config);
		};
		/* no answers allowed */
		if (answerBoxHidden || loadingChat) return null;
		/* chatting with a doctor, so different set of functions */
		else if (uploadingImage) {
			return (
				<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
					<Progress completed={Math.floor(uploadingImage * 100)} />
				</div>
			);
		}
		else if (doctor) {
			console.log("doctor****", doctor);
			return (
				<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
					<form onSubmit={this.sendMessage} className="message-form">
						<input
							id="textAnswered"
							value={textAnswered}
							onChange={this.handleMessageChange}
							type="text"
							autoComplete="off"
							autoCorrect="off"
							spellCheck="false"
							onFocus={this.scrollDown}
						/>
						{textAnswered ? (
							<button type="submit" className="send">
								<Icon.Send />
							</button>
						) : null}
						{!textAnswered ? (
							<button type="button" onClick={callWithVideo(true)} className="send">
								<Icon.Video />
							</button>
						) : null}
						{!textAnswered ? (
							<button type="button" onClick={callWithVideo(false)} className="send">
								<Icon.PhoneCall />
							</button>
						) : null}
						{!textAnswered ? (
							<button
								type="button"
								onClick={() => {
									$('#imageInput').click();
								}}
								className="send"
							>
								<Icon.Image />
							</button>
						) : null}
						<div style={{ width: 0, height: 0, overflow: 'hidden' }}>
							<input
								type="file"
								id="imageInput"
								name="imageInput"
								onChange={this.imageUpload}
								accept="image/*,application/pdf"
							/>
						</div>
					</form>
				</div>
			);
		}
		else if (type === TYPE_BUTTON) {
			/* different types of answer*/
			// User answer buttons
			return (
				<div>
					<div className="answer-box button-row">
						{options.map(({ value, statement, url, skip = false }, index) => {
							console.log('renderAnswers() button index : ', index)
							let chatStatement = undefined
							let description_image = undefined
							let audio = undefined
							if (statement === undefined) chatStatement = undefined
							else {
								let output = this.setOutput(statement)
								chatStatement = output.chatStatement
								audio = output.audio
								description_image = getDescriptionImage(statement, this.state.languageSelected);
							}
							console.log('renderAnswers() setting button options. chatStatement = ', chatStatement)
							// noinspection HtmlRequiredAltAttribute
							if (skip === undefined) skip = false
							// console.log("render.answers answerBoxHidden skip = ", skip, '. value = ', value)

							return (
								<button
									key={value}
									value={value}
									data-url={url}
									id="optionSelected"									// important
									onClick={this.handleChange}
									className="fadeInUp"
									style={{ animationDelay: `1.${index}s`, background: '#CCCCFF', color: '#111111', fontSize: 'larger', fontFamily: 'Georgia' }}
									onMouseEnter={() => this.speak(chatStatement, false, audio, statement)}
									onTouchStart={() => this.speak(chatStatement, true, audio, statement)}
									onMouseLeave={() => { this.stopAudio() }}
									hidden={skip}
								>
									{chatStatement}
									<br />
									{description_image &&
										<img src={require("../data/" + description_image)} style={{
											maxWidth: '80%', maxHeight: "300px", aspectRatio: 1, pointerEvents: "none"
										}} alt={''} />
									}
								</button>
							);
						})}
					</div>
					{this.renderTextOverrideMessage()}
				</div>
			);
		}
		else if (type === TYPE_LIST) {
			// checkboxes
			console.log("renderAnswers list")
			return (
				<div>
					<div style={{ display: "flex", "flexDirection": "column" }}>
						<div className="answer-box button-row" style={{ "flexWrap": "wrap" }}>
							{options.map(({ value, statement }, index) => {
								let { chatStatement, audio } = this.setOutput(statement)
								let description_image = getDescriptionImage(statement, this.state.languageSelected);

								// noinspection HtmlRequiredAltAttribute
								return (
									<label
										style={{ animationDelay: `1.${index}s`, background: '#CCCCFF', color: '#111111', fontSize: 'Larger', flex: '1' }}
										onMouseEnter={() => this.speak(chatStatement, false, audio, statement)}
										onTouchStart={() => this.speak(chatStatement, true, audio, statement)}
										onMouseLeave={() => { this.stopAudio() }}
									>
										<input type="checkbox"
											id={value}
											onChange={this.handleChange}
											className="fadeInUp"
											style={{ marginRight: "10px", background: '#CCCCFF', color: '#111111' }}
										/>
										{chatStatement}
										{description_image && <img src={require("../data/" + description_image)} style={{
											width: '100%', height: undefined, aspectRatio: 1, pointerEvents: "none"
										}} />}
									</label>
								);
							})}
						</div>
						<button
							onClick={this.answer}
							className="fadeInUp"
							style={{ animationDelay: `2.0s`, background: '#CCCCFF', color: '#111111', fontSize: 'larger', position: 'relative', whiteSpace: 'nowrap' }}
						>
							<object>
								{this.state.languageSelected === LANG_HINDI || this.state.languageSelected === LANG_MARWARI ? "भेजें" : "SUBMIT"}
								<object height='1px' hspace="5mm" />
								<Icon.Send />
							</object>
						</button>
					</div>
					{this.renderTextOverrideMessage()}
				</div>
			);
		}
		else if (type === TYPE_SELECT) {
			// spinner
			console.log("renderAnswers select")
			return (
				<div>
					<div className="answer-box select-row fadeInUp" style={{ animationDelay: '1s' }}>
						<select id="optionSelected" value={optionSelected} onChange={this.handleChange}>
							{options && options.map(({ value, statement }) => {
								let { chatStatement, audio } = this.setOutput(statement)
								return <option value={value}>{chatStatement}</option>;
							})}
						</select>
						<button onClick={this.answer} className="send">
							<Icon.Send />
						</button>
					</div>
					{this.renderTextOverrideMessage()}
				</div>
			);
		}
		else if (type === TYPE_UPLOAD) {
			// Media upload
			console.log("renderAnswers upload")
			return (
				<div>
					<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
						<form className="message-form">
							<button
								type="button"
								onClick={() => {
									$('#imageInput').click();
								}}
								className="send"
							>
								<Icon.File />
							</button>
							<div style={{ width: 0, height: 0, overflow: 'hidden' }}>
								<input
									type="file"
									id="imageInput"
									name="imageInput"
									onChange={this.imageUpload}
									accept="image/*,application/pdf"
								/>
							</div>
						</form>
					</div>
					{this.renderTextOverrideMessage()}
				</div>
			);
		}
		else if (type === TYPE_GENERIC_TEXT) {
			return this.renderTextOverrideMessage()
		}
		else {
			// text field updated but message not sent. send button is to be pressed
			return (
				<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
					<form onSubmit={this.answer} className="message-form">
						<input
							id="textAnswered"
							value={textAnswered}
							onChange={this.handleChange}
							type={type}
							pattern={pattern}
							autoComplete="off"
							autoCorrect="off"
							spellCheck="false"
							onFocus={this.scrollDown}
						/>
						<button type="submit" className="send">
							<Icon.Send />
						</button>
					</form>
				</div>
			);
		}
	};

	resetConversation = (event) => {
		this.state.reset = true
		// this.state.nextQuestion = 1.0
		// this.state.type = 'none'
		this.setState(this.state)
		this.handleChange(event)
	}

	// needs to be implemented properly using speach state and event
	toggleMuter = (event) => {
		// const muter = document.getElementById("muter");
		// TODO : Use set on progress listener
		if (this.state.mute === MUTE_ALL) {
			this.state.mute = SPEAK_ALL
			const muted = document.getElementById('muted')
			muted.style.visibility = 'hidden'
			const speaks = document.getElementById('speaks')
			speaks.style.visibility = 'visible'
			this.setState(this.state)
		} else if (this.state.mute === SPEAK_ALL) {
			this.state.mute = MUTE_ALL
			this.stopAudio()
			const muted = document.getElementById('muted')
			muted.style.visibility = 'visible'
			const speaks = document.getElementById('speaks')
			speaks.style.visibility = 'hidden'
			this.setState(this.state)
		}
	}

	/*
	 * Render language selector and chat refresher
	 */
	renderLanguageSelect = () => {
		const {
			languageSelected
		} = this.state;

		return (
			<div className="select-row fadeInUp" style={{ animationDelay: '0.2s' }}>
				<label>Language:</label>
				<select id="languageSelected" value={languageSelected} onChange={this.handleLanguageChange}>
					{languages.map(({ code, name }) => {
						return <option value={code} key={code}>{name}</option>;
					})}
				</select>
				<object height='1px' width="60px" />
				<Icon.VolumeX id={"muted"} onClick={this.toggleMuter} alt="mute" style={{ visibility: "hidden" }} />
				<Icon.Volume2 id={"speaks"} onClick={this.toggleMuter} alt="speak" />
				<object height='1px' width="60px" />
				<Icon.Repeat onClick={this.resetConversation} />
				<object height='1px' width="60px" />
				<Icon.CornerDownLeft onClick={this.backMessage} />
				<object height='1px' width="20px" />
			</div>
		);
	};

	render() {
		console.log('render')
		const { loadingChat } = this.state;
		const { callWindow, localSrc, peerSrc } = this.state;

		if (!_.isEmpty(this.config)) {
			return (
				<div className="gridoutcontainer" >
					<div>
						<div className="chat-options expand">
							{this.renderLanguageSelect()}
						</div>
						<div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
							{loadingChat && <div className="lds-dual-ring" />}
							{this.renderChat()}
							<div style={{ height: '1px', backgroundColor: 'grey', boxShadow: '1px 2px 9px grey', marginBottom: '10px' }} />
							{this.renderAnswers()}
						</div>
					</div>
					<div className='callwindowcontainer'>
						<CallWindow
							status={callWindow}
							localSrc={localSrc}
							peerSrc={peerSrc}
							config={this.config}
							mediaDevice={this.pc.mediaDevice}
							endCall={this.endCall}
							buttonRef={this.buttonRef}
							callBtn={this.props.callBtn}
						/>
					</div>
				</div>
			);
		}

		return (
			<>
				<div className="chat-options expand">
					{this.renderLanguageSelect()}
				</div>
				<div className="Chat fadeInUp" style={{ animationDelay: '0.7s' }}>
					{loadingChat && <div className="lds-dual-ring" />}
					{this.renderChat()}
					<div style={{ height: '1px', backgroundColor: 'grey', boxShadow: '1px 2px 9px grey', marginBottom: '10px' }} />
					{this.renderAnswers()}
				</div>
			</>
		);
	}
}
