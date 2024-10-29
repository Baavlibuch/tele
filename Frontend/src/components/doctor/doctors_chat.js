import React from 'react';
import * as Icon from 'react-feather';
import $ from 'jquery';
import _ from 'lodash';

import Progress from 'react-progressbar';

import axios from 'axios';
import { ENDPOINT } from "../../config";

import PeerConnection from '../webrtc/PeerConnection';
import CallWindow from '../webrtc/CallWindow';
import CallModal from '../webrtc/CallModal';

const client = require('socket.io-client');

export default class Chat extends React.Component {
	state = {
		loading: true,
		chatStarted: false,
		patientId: null,
		incomingTyping: false,
		chat: [],
		textAnswered: '',
		actionsReveal: false,
		doctors: [],
		doctorSelected: '',

		callWindow: '',
		callModal: '',
		localSrc: null,
		peerSrc: null,
	};

	socket = null;
	pc = {};

	componentDidMount() {
		axios
			.get(ENDPOINT + '/api/doctor-list')
			.then((response) => {
				const { doctors } = response.data;
				console.log("doctorList", response.data)
				if (doctors) {
					this.setState({ doctors });
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}

	// componentWillReceiveProps(props) {
	// 	const { patient, callStarted } = props;
	// 	if (this.state.patient !== patient && this.socket) {
	// 		this.socket.emit('changePatient', patient);
	// 	}

	// }
	componentDidUpdate(prevProps) {
		const { callStarted, patient } = this.props;
		const { callStarted: prevCallStarted } = prevProps;

		if (prevProps.patient !== patient && this.socket) {
			this.socket.emit('changePatient', patient);
		}

		if (callStarted !== prevCallStarted) {
			console.log("Call Started has changed to:", callStarted);
			if (callStarted) {
				console.log(patient)
				// this.beginCheckupsBtn();
			}
		}
	}

	sendMessage = (e) => {
		if (e && e.preventDefault) e.preventDefault();

		const { textAnswered, patientId } = this.state;
		if (textAnswered.length) {
			this.setState({ textAnswered: '' });
			this.socket.emit('message', { message: textAnswered, to: patientId });
			this.enterMessageIntoChat(textAnswered, 'outgoing');
		}
	};

	enterMessageIntoChat = (statement, type) => {
		const { chat } = this.state;
		this.setState(
			{
				chat: chat.concat([{ statement, type }])
			},
			this.scrollDown
		);
	};

	scrollDown = () => {
		$('#chat-box').animate({ scrollTop: $('#chat-box')[0].scrollHeight }, 800);
	};



	connect = () => {
		const { username } = this.props;

		this.socket = client('/app_chat', {
			transports: ['websocket'],
			query: {
				type: 'doctor',
				username
			}
		});

		this.socket.on('userAlloted', ({ patientId, chat }) => {
			if (patientId && chat)
				this.setState(
					{
						loading: false,
						textAnswered: '',
						patientId,
						chat: chat.map(({ statement, type }) => {
							return {
								statement,
								type: type === 'incoming' ? 'outgoing' : 'incoming'
							};
						})
					},
					this.scrollDown
				);
			this.socket.emit('changeStatus', { username: this.props.username, status: "buzy" });
			this.props.setchatStarted(true);
		});

		this.socket.on('userDisconnected', () => {
			// this.endCall(false);
			this.setState({
				loading: true,
				patientId: null,
				chat: [
					{
						statement: 'हम आपके परामर्श के लिए रोगियों को खोज रहे हैं',
						type: 'incoming'
					}
				]
			});
			this.socket.emit('changeStatus', { username: this.props.username, status: "idle" });
			// window.location.reload();

		});

		this.socket.on('onlineUsers', (onlineUsers) => {
			this.setState({ onlineUsers });
		});

		this.socket.on('message', ({ message, from }) => {
			if (from === this.state.patientId) {
				this.setState({ incomingTyping: false });
				this.enterMessageIntoChat(message, 'incoming');
			}
		});

		this.socket.on('typingChange', ({ state, from }) => {
			if (from === this.state.patientId) {
				this.setState({ incomingTyping: state });
				this.scrollDown();
			}
		});

		this.socket.on('request', (from) => {
			if (from === this.state.patientId) {
				this.setState({ callModal: 'active' });
				this.scrollDown();
			}
		});

		this.socket.on('call', ({ data, from }) => {
			if (from === this.state.patientId) {
				if (data.sdp) {
					this.pc.setRemoteDescription(data.sdp);
					if (data.sdp.type === 'offer') this.pc.createAnswer();
				} else this.pc.addIceCandidate(data.candidate);
			}
		});

		this.socket.on('end', (from) => {
			if (from === this.state.patientId) this.endCall(false);
		});
	};

	startCall = (isCaller, config) => {
		this.config = config;
		this.pc = new PeerConnection(this.socket, this.state.patientId)
			.on('localStream', (src) => {
				const newState = { callWindow: 'active', localSrc: src };
				if (!isCaller) newState.callModal = '';
				this.setState(newState);
			})
			.on('peerStream', (src) => this.setState({ peerSrc: src }))
			.start(isCaller, config);
		this.props.setchatStarted(true);
	};

	rejectCall = () => {
		const { patientId } = this.state;
		this.socket.emit('end', patientId);
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
		this.props.setchatStarted(false);
	};

	disconnectUser = () => {
		// this.socket.emit('changeStatus', { username: this.props.username, status: "idle" });
		this.setState({
			loading: true,
			patientId: null,
			chat: [
				{
					statement: 'हम आपके परामर्श के लिए रोगियों को खोज रहे हैं',
					type: 'incoming'
				}
			]
		});
		const { patientId } = this.state;
		console.log(patientId)
		this.socket.emit('disconnectUser', { patientId });
		this.props.setchatStarted(false);
	};

	referUser = () => {
		const { doctorSelected, patientId } = this.state;
		this.socket.emit('referUser', { doctorSelected, patientId });
	};

	componentWillUnmount() {
		if (this.socket) this.socket.disconnect();
	}

	handleMessageChange = (event) => {
		const { id, value } = event.target;
		const { textAnswered, patientId } = this.state;

		this.setState({
			[id]: value
		});

		if (patientId) {
			if ((value.length === 0) ^ (textAnswered.length === 0)) {
				this.socket.emit('typingChange', { state: value.length > 0, to: patientId });
			}
		}
	};

	handleChange = (event) => {
		const { id, value } = event.target;

		this.setState({
			[id]: value
		});
	};

	imageUpload = (event) => {
		const file = event.target.files[0];
		if (!file || !this.socket) return;
		this.setState({ uploadingImage: 0.01 });
		const { patientId } = this.state;

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
				if (this.socket) {
					this.enterMessageIntoChat('chat-img-' + image.filename, 'outgoing');
					this.socket.emit('message', { message: 'chat-img-' + image.filename, to: patientId });
				}
				this.setState({ uploadingImage: 0, ...(image ? { image } : {}) });
			})
			.catch((err) => {
				this.setState({ uploadingImage: 0 });
			});
	};

	renderChat = () => {
		const { callModal, chat, loading, incomingTyping } = this.state;
		console.log('chat = ', chat)

		return (
			<div id="chat-box" className="chat-box" style={loading ? { marginBottom: 0 } : {}}>
				{chat.length === 0 ? (
					<p className="no-messages">No messages were shared</p>
				) : chat.every(({ statement }) => statement === undefined) ? (
					<p className="no-messages">No messages were shared</p>
				) : (
					chat.map(({ statement, type }, index) => {
						const chatStatement = (statement && typeof statement !== 'string') ? statement['hi'] : statement;
						if (!chatStatement) return null;

						return (
							<p
								key={index}
								className={`${type}-message ${type === 'outgoing' ? 'fadeInUp' : 'fadeInRight'}`}
								style={{ animationDelay: type === 'incoming' ? '0.6s' : '0.2s' }}
							>
								{(typeof statement === 'string') && (statement.endsWith('.jpg') || statement.endsWith('.jpeg') || statement.endsWith('.png')) ? (
									<a href={`/aa/images/` + statement.split('-')[2]} download>
										<img
											src={`/aa/images/` + statement.split('-')[2]}
											alt=""
											style={{ cursor: 'pointer' }}
										/>
									</a>
								) : (typeof statement === 'string') && statement.endsWith('.pdf') ? (
									<a
										href={`/aa/images/` + statement.split('-')[2]}
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
					})
				)}

				{incomingTyping && (
					<p className="incoming-message">
						<div className="dots">
							<div className="dot" />
							<div className="dot" />
							<div className="dot" />
						</div>
					</p>
				)}

				<CallModal status={callModal} startCall={this.startCall} rejectCall={this.rejectCall} />
			</div>

		);
	};

	renderAnswers = () => {
		const { textAnswered, loading, patientId, uploadingImage } = this.state;

		const callWithVideo = (video) => {
			const config = { audio: true, video };
			return () => this.startCall(true, config);
		};

		if (loading) return null;

		if (uploadingImage) {
			return (
				<div className="answer-box text-row fadeInUp" style={{ animationDelay: '1s' }}>
					<Progress completed={Math.floor(uploadingImage * 100)} />
				</div>
			);
		}

		if (patientId)
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
	};

	renderActions = () => {
		const { actionsReveal, doctors, doctorSelected } = this.state;

		if (!actionsReveal)
			return (
				<div className="chat-actions">
					<button
						onClick={() => {
							this.setState({
								actionsReveal: true,
								doctorSelected: doctors.length ? doctors[0].username : ''
							});
						}}
					>
						<Icon.ArrowRight />
					</button>
				</div>
			);

		return (
			<div className="chat-actions expand">
				<button
					onClick={() => {
						this.setState({ actionsReveal: false });
					}}
				>
					<Icon.ArrowDown />
				</button>
				{doctors.length ? (
					<div className="select-row fadeInUp" style={{ animationDelay: '0.2s' }}>
						<label>Refer to:</label>
						<select id="doctorSelected" value={doctorSelected} onChange={this.handleChange}>
							{doctors.map(({ username, name, post }) => {
								return (
									<option value={username}>
										{name}, {post}
									</option>
								);
							})}
						</select>
						<button className="send" onClick={this.referUser}>
							<Icon.Send />
						</button>
					</div>
				) : null}
			</div>
		);
	};

	beginCheckupsBtn = () => {
		this.setState({
			chatStarted: true,
			chat: [
				{
					statement: 'हम आपके परामर्श के लिए रोगियों को खोज रहे हैं',
					type: 'incoming'
				}
			]
		});
		this.connect();
	}

	render() {
		const { patientId, chatStarted } = this.state;
		const { callWindow, localSrc, peerSrc } = this.state;

		if (!chatStarted)
			return (
				<div className="Chat Chati fadeInUp" style={{ animationDelay: '0.7s' }}>
					<button
						className="start is-green"
						onClick={() => {
							this.beginCheckupsBtn();
							this.socket.emit('changeStatus', { username: this.props.username, status: "idle" });


						}}
					>
						Begin checkups
					</button>
				</div>
			);
		return (
			<div className='container-chat-callWindow'>

				<div className="Chat Chati fadeInUp" style={{ animationDelay: '0.7s', marginBottom: '8rem' }}>
					{patientId ? (
						<>
							<h6 style={{ margin: 0, marginBottom: 6 }}>{patientId}</h6>
							<button className="close-icon" onClick={this.disconnectUser}>
								<Icon.XCircle />
							</button>
						</>
					) : null}
					{this.renderChat()}
					{this.renderAnswers()}
					{patientId && this.renderActions()}
				</div>
				{!_.isEmpty(this.config) &&
					<div className='callwindowcontainer2'>
						<CallWindow
							status={callWindow}
							localSrc={localSrc}
							peerSrc={peerSrc}
							config={this.config}
							mediaDevice={this.pc.mediaDevice}
							endCall={this.endCall}
						/>
					</div>
				}
			</div>
		);
	}
}
