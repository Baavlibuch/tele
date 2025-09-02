import React from 'react';
import * as Icon from 'react-feather';
import $ from 'jquery';
import _ from 'lodash';
import Progress from 'react-progressbar';
import axios from 'axios';
import { ENDPOINT } from "../../config";
import { connectSocket } from '../../services/socketService';
import PeerConnection from '../webrtc/PeerConnection';
import CallWindow from '../webrtc/CallWindow';
import CallModal from '../webrtc/CallModal';
import CameraPreview from './CameraPreview';
import { initSocket } from '../../utils/socket';

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

		// WebRTC states
		callWindow: '',
		callModal: '',
		localSrc: null,
		peerSrc: null,
		localStream: null,  // Added to store local media stream
		
		// Camera preview states
		showCameraPreview: false,
		isCameraMinimized: false,
		streamUrl: null,
	};

	socket = null;
	pc = {};

	componentDidMount() {
		const { username } = this.props;
		console.log('Doctor chat component mounted, initializing socket...');
		
		try {
			// Initialize socket connection with error handling
			this.socket = initSocket('/app_chat', {
				query: {
					type: 'doctor',
					username: username || 'anonymous_doctor',
					version: '1.0'
				}
			});
			
			// Manually connect to the socket
			if (this.socket && !this.socket.connected) {
				console.log('Manually connecting socket...');
				this.socket.connect();
			}
			
			// Set up socket event listeners
			this.setupSocketListeners();
		} catch (error) {
			console.error('Failed to initialize socket:', error);
		}

		// Load doctor list
		axios
			.get(ENDPOINT + '/api/doctor-list')
			.then((response) => {
				const { doctors } = response.data;
				console.log("doctorList", response.data);
				if (doctors) {
					this.setState({ doctors });
				}
			})
			.catch((err) => {
				console.log(err);
			});

		// Initialize socket connection
		connectSocket(
			username,
			// onConnect
			(socket) => {
				this.socket = socket;
				
				// Setup socket event listeners
				this.socket.on('userAlloted', this.handleUserAlloted);
				this.socket.on('message', this.handleIncomingMessage);
				this.socket.on('typing', this.handleTyping);
				this.socket.on('call', this.handleCallEvent);
				this.socket.on('userDisconnected', this.handleUserDisconnected);
				
				// Additional socket event listeners
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
					const r = window.confirm(`User ${from} is calling you.`);
					if (r === true) {
						this.startCall(false, from);
					} else {
						this.socket.emit('end', { to: from, from: this.props.username });
					}
				});

				this.socket.on('end', (callFrom) => {
					this.endCall(callFrom === this.state.patientId);
				});

				this.socket.on('endCall', () => {
					this.endCall(false);
				});

				this.socket.on('doctorBusy', () => {
					alert('Doctor is busy at the moment.');
				});

				this.socket.on('patientBusy', () => {
					alert('Patient is busy at the moment.');
				});

				// Handle call events
				this.socket.on('call', ({ data, from }) => {
					if (from === this.state.patientId) {
						if (data.sdp) {
							this.pc.setRemoteDescription(data.sdp);
							if (data.sdp.type === 'offer') this.pc.createAnswer();
						} else if (data.candidate) {
							this.pc.addIceCandidate(data.candidate);
						}
					}
				});
			},
			// onError
			(error) => {
				console.error('Failed to connect to socket:', error);
			}
		);
	}

	componentDidUpdate(prevProps) {
		const { callStarted, patient, presUpload, _event} = this.props;
		const { callStarted: prevCallStarted, presUpload: prevPresUpload} = prevProps;

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

		if (presUpload !== prevPresUpload) {
			console.log("event--",_event)
			this.pimageUpload(_event)
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

	startCall = async (isCaller, config) => {
		try {
			// Request camera and microphone permissions if not already done
			if (!this.state.localStream) {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
					video: config.video ? {
						facingMode: 'user',
						height: { min: 360, ideal: 720, max: 1080 }
					} : false
				});
				this.setState({ localStream: stream });
			}

			// Initialize peer connection
			this.pc = new PeerConnection(this.socket, this.state.patientId)
				.on('localStream', (src) => {
					const newState = { callWindow: 'active', localSrc: src };
					if (!isCaller) newState.callModal = '';
					this.setState(newState);
				})
				.on('peerStream', (src) => this.setState({ peerSrc: src }))
				.start(isCaller, config);

			this.props.setchatStarted(true);

		} catch (err) {
			console.error('Error starting call:', err);
			// Handle error - show a message to the user
			this.enterMessageIntoChat('Could not access camera/microphone. Please check your permissions.', 'incoming');
		}
	}

	// Camera Preview Methods
	handleMinimizeCamera = () => {
		this.setState({ isCameraMinimized: true });
	};

	handleMaximizeCamera = () => {
		this.setState({ isCameraMinimized: false });
	};

	startCameraPreview = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ 
				audio: true, 
				video: {
					facingMode: 'user',
					height: { min: 360, ideal: 720, max: 1080 }
				}
			});
			
			this.setState({ 
				showCameraPreview: true,
				localStream: stream,
				isCameraMinimized: false
			});
			
			// Emit event to notify other participants
			if (this.socket && this.state.patientId) {
				this.socket.emit('camera_status', { 
					status: 'started', 
					to: this.state.patientId 
				});
			}
			
		} catch (err) {
			console.error('Error accessing camera:', err);
			// Show error message to user
			this.enterMessageIntoChat('Could not access camera. Please check your permissions.', 'incoming');
		}
	};;

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
					statement: 'Patient Name: Saroj Gupta',
					type: 'incoming'
				}
			]
		});
		const { patientId } = this.state;
		// this.socket.emit('message', { message: "session-closed", to: patientId });
		console.log(patientId)
		this.socket.emit('disconnectUser', { patientId });
		this.props.setchatStarted(false);
	};

	referUser = () => {
		const { doctorSelected, patientId } = this.state;
		this.socket.emit('referUser', { doctorSelected, patientId });
	};

	componentWillUnmount() {
		// Clean up socket listeners
		if (this.socket) {
			this.socket.off('stream_data');
			this.socket.off('camera_status');
			this.socket.disconnect();
		}
		
		// Clean up media streams
		if (this.state.localStream) {
			this.state.localStream.getTracks().forEach(track => track.stop());
		}
	}
	
	setupSocketListeners = () => {
		const { socket } = this;
		
		socket.on('stream_data', (data) => {
			// Handle incoming stream data
			if (data.type === 'camera_stream' && data.stream) {
				this.setState({ 
					showCameraPreview: true,
					streamUrl: data.stream
				});
			}
		});
		
		socket.on('camera_status', (status) => {
			console.log('Camera status update:', status);
		});
	};

	handleMinimizeCamera = () => {
		this.setState({ isCameraMinimized: true });
	};

	handleMaximizeCamera = () => {
		this.setState({ isCameraMinimized: false });
	};

	startCameraPreview = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ 
				video: true, 
				audio: true 
			});
			
			this.setState({ 
				showCameraPreview: true,
				localStream: stream,
				isCameraMinimized: false
			});
			
			// In a real app, you would send this stream to the peer
		} catch (err) {
			console.error('Error accessing camera:', err);
		}
	};

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

	pimageUpload = (file) => {
		// const file = event.target.files[0];
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
	
		const formatDateHeader = (timestamp) => {
			const date = new Date(timestamp);
			return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		};
	
		const formatTime = (timestamp) => {
			const date = new Date(timestamp);
			return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
		};
	
		let lastDate = null;
		return (
			<div id="chat-box" className="chat-box" style={loading ? { marginBottom: 0 } : {}}>
				{chat.length === 0 ? (
					<p className="no-messages">No messages were shared</p>
				) : chat.every(({ statement }) => statement === undefined) ? (
					<p className="no-messages">No messages were shared</p>
				) : (
					chat.map(({ statement, type, timestamp }, index) => {
						const chatStatement = (statement && typeof statement !== 'string') ? statement['hi'] : statement;
						if (!chatStatement) return null;
	
						// Check if the statement is 'session-closed' to render a special component
						if (statement === 'session-closed') {
							return (
								<div key={index} className="session-closed" style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
									<hr style={{ border: '0.5px solid #ddd' }} />
									<span style={{ position: 'absolute', top: '-10px', background: '#fff', padding: '0 10px', fontSize: '14px', color: '#666' }}>
										Follow-Up
									</span>
								</div>
							);
						}
	
						const currentDate = timestamp ? formatDateHeader(timestamp) : null;
						const showDateHeader = currentDate && currentDate !== lastDate;
						lastDate = currentDate;
	
						return (
							<div key={index}>
								{showDateHeader && (
									<div className="date-header" style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '10px', marginBottom: '10px', color: '#666' }}>
										{currentDate}
									</div>
								)}
								<p
									className={`${type}-message ${type === 'outgoing' ? 'fadeInUp' : 'fadeInRight'}`}
									style={{ animationDelay: type === 'incoming' ? '0.6s' : '0.2s', display: 'flex', alignItems: 'center', marginBottom: '10px' }}
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
									{timestamp && (
										<span className="timestamp" style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>
											{formatTime(timestamp)}
										</span>
									)}
								</p>
							</div>
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

	beginCheckupsBtn = async () => {
		this.setState({
			chatStarted: true,
			chat: [
				{
					statement: 'Patient Name: Saroj Gupta',
					type: 'incoming'
				}
			]
		});

		try {
			// Request camera and microphone permissions
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: {
					facingMode: 'user',
					height: { min: 360, ideal: 720, max: 1080 }
				}
			});

			// Store the stream in state
			this.setState({ localStream: stream });

			// Stop all tracks if they exist
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}

		} catch (err) {
			console.error('Error accessing media devices:', err);
			// Handle error - show a message to the user
			this.enterMessageIntoChat('Could not access camera/microphone. Please check your permissions.', 'incoming');
		}
	}

	render() {
		const { patientId, chatStarted, callWindow, localSrc, peerSrc } = this.state;

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
				{/* Camera Preview Component */}
				<CameraPreview 
					show={this.state.showCameraPreview}
					isMinimized={this.state.isCameraMinimized}
					onMinimize={this.handleMinimizeCamera}
					onMaximize={this.handleMaximizeCamera}
					stream={this.state.localStream}
					onStartCamera={this.startCameraPreview}
					onEndCall={() => {
						if (this.state.localStream) {
							this.state.localStream.getTracks().forEach(track => track.stop());
						}
						this.setState({ 
							showCameraPreview: false,
							localStream: null,
							isCameraMinimized: false
						});
					}}
				/>
			</div>
		);
	}
}
