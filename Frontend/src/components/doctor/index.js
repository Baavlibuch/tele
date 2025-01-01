import React from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import { connect } from 'react-redux';
import _ from 'lodash';
import Chat from './doctors_chat';
import Table from './table';
import PeerConnection from '../webrtc/PeerConnection';
import CallWindow from '../webrtc/CallWindow';
import CallModal from '../webrtc/CallModal';
import { ENDPOINT } from '../../config';
import { loginStart, loginSuccess, loginFailure, logout } from './features/doctorSlice';
const client = require('socket.io-client');

axios.defaults.withCredentials = true;

class Doctor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            callWindow: '',
            callModal: '',
            localSrc: null,
            peerSrc: null,
            loading: true,
            loggedin: false,
            username: '',
            password: '',
            patient: '',
            incomingTyping: false,
            requesting: false,
            onlineUsers: [],
            error: '',
            answerBoxHidden: true,
            patientId: null,
            oncall: false,
            callStarted: false,
            presUpload: false,
            _event: null,
            currPatient: null,
            doctorId: null,
        };

        this.configRef = null;
        this.pcRef = null;
        this.socketRef = null;

        this.startCall = this.startCall.bind(this);
        this.rejectCall = this.rejectCall.bind(this);
        this.endCall = this.endCall.bind(this);
        this.scrollDown = this.scrollDown.bind(this);
        this.enterMessageIntoChat = this.enterMessageIntoChat.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.changePatient = this.changePatient.bind(this);
    }

    componentDidMount() {
        this.login();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.patientId && prevState.patientId !== this.state.patientId) {
            console.log("patientid changed");
            this.setupSocket();
        }
    }

    componentWillUnmount() {
        if (this.socketRef) {
            this.socketRef.disconnect();
        }
    }

    setupSocket() {
        console.log('connect() to doctor');
        this.setState({ requesting: true });

        this.socketRef = client('/app_chat', {
            transports: ['websocket'],
            query: {
                type: 'doctor',
                username: this.state.username,
            },
        });

        this.socketRef.on('userAlloted', ({ patientId, chat }) => {
            console.log("useralloted", patientId);
            // this.setState({oncall:true})
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
        });

        this.socketRef.on('userDisconnected', () => {
            this.endCall(false);
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
        });

        this.socketRef.on('onlineUsers', (onlineUsers) => {
            this.setState({ onlineUsers });
        });

        this.socketRef.on('message', ({ message, from }) => {
            if (from === this.state.patientId) {
                this.setState({ incomingTyping: false });
                this.enterMessageIntoChat(message, 'incoming');
            }
        });

        this.socketRef.on('typingChange', ({ state, from }) => {
            if (from === this.state.patientId) {
                this.setState({ incomingTyping: state });
                this.scrollDown();
            }
        });

        this.socketRef.on('referUser', (doctor) => {
            this.endCall(false);
            this.setState({ patientId: doctor.id, answerBoxHidden: true });
        });

        this.socketRef.on('request', (from) => {
            if (from === this.state.patientId) {
                this.setState({ callModal: 'active' });
                this.scrollDown();
            }
        });

        this.socketRef.on('call', ({ data, from }) => {
            if (from === this.state.patientId) {
                if (data.sdp) {
                    this.pcRef.setRemoteDescription(data.sdp);
                    if (data.sdp.type === 'offer') this.pcRef.createAnswer();
                } else {
                    this.pcRef.addIceCandidate(data.candidate);
                }
            }
        });

        this.socketRef.on('end', (from) => {
            if (from === this.state.patientId) this.endCall(false);
            // this.setState({oncall:false})
        });
    }

    startCall(isCaller, config) {
        this.configRef = config;
        this.pcRef = new PeerConnection(this.socketRef, this.state.patientId)
            .on('localStream', (src) => {
                const newState = { callWindow: 'active', localSrc: src };
                if (!isCaller) this.setState({ callModal: '' });
                this.setState(newState);
            })
            .on('peerStream', (src) => this.setState({ peerSrc: src }))
            .start(isCaller, config);
    }

    rejectCall() {
        this.socketRef.emit('end', this.state.patientId);
        this.setState({ callModal: '' });
    }

    endCall(isStarter) {
        this.setState({ callStarted: false }, () => {
            console.log("afterclick", this.state.callStarted);
        });
        if (this.pcRef && typeof this.pcRef.stop === 'function') {
            this.pcRef.stop(isStarter);
        }
        this.pcRef = null;
        this.configRef = null;
        this.setState({
            callWindow: '',
            callModal: '',
            localSrc: null,
            peerSrc: null,
        });
        this.scrollDown();
    }

    scrollDown() {
        // Implement scroll down logic if needed
    }

    enterMessageIntoChat(message, type) {
        // Implement message entering logic
    }

    changePatient(patient) {
        this.setState({ patient });
    }

    login(e) {
        if (e && e.preventDefault) e.preventDefault();

        const { username, password } = this.state;

        this.setState({ loading: true, error: '' });
        this.props.loginStart();
        axios
            .post(ENDPOINT + '/api/login', { username, password })
            .then((response) => {
                const { login, username, hospital, doctorId } = response.data;
                if (login) {
                    this.setState({ doctorId: doctorId })
                    this.setState({ loggedin: true, username, hospital });
                    this.props.loginSuccess({ username, hospital, doctorId });
                    this.setupSocket();
                } else {
                    if (username || password) this.setState({ error: 'Invalid Credentials!' });
                }
                this.setState({ loading: false });
            })
            .catch((err) => {
                this.setState({ loading: false, error: 'Internal Server Error!' });
                console.log(err);
                this.props.loginFailure('Internal Server Error!');
            });
    }

    logout(e) {
        if (e && e.preventDefault) e.preventDefault();

        this.setState({ loading: true, error: '' });
        axios
            .get(ENDPOINT + '/api/logout')
            .then((response) => {
                const { loggedOut } = response.data;
                if (loggedOut) {
                    this.setState({ loggedin: false, username: '', hospital: '', password: '' });
                    this.props.logout();
                } else {
                    // this.setState({ error: 'Error Occured!' });
                }
                this.setState({ loading: false });
            })
            .catch((err) => {
                this.setState({ loading: false, error: 'Internal Server Error!' });
                console.log(err);
            });
    }

    handleChange(event) {
        const { id, value } = event.target;
        this.setState({ [id]: value });
    }

    setchatStarted = (value) => {
        this.setState({ callStarted: value }, () => {
            console.log("afterclick", this.state.callStarted);
        });
    };

    setpresUploaded = (value) => {
        if (this.state.presUpload) {
            this.setState({ presUpload: false, _event: value }, () => {
                console.log("afterclick", this.state.presUpload);
            });
        }
        else {
            this.setState({ presUpload: true, _event: value }, () => {
                console.log("afterclick", this.state.presUpload);
            });
        }
    };

    setCurrPatient = (patientId) => {
        this.setState({ currPatient: patientId })
    }

    // handleLoginClick = () => {
    //     window.open('/nurseLogin', '_blank');
    // };

    render() {
        const { loggedin, username, password, error, loading, patient, callWindow, localSrc, peerSrc, incomingTyping, requesting, callModal, callStarted, presUpload, _event, currPatient } = this.state;

        if (!loggedin) {
            return (
                <div className="Home">
                    {loading ? (
                        <div className="lds-dual-ring"></div>
                    ) : (
                        <div style={{ display: 'grid' }}>
                            <form onSubmit={this.login} className="login-form fadeInUp">
                                <p>{error}</p>
                                <h3>Username: </h3>
                                <input
                                    id="username"
                                    value={username}
                                    onChange={this.handleChange}
                                    type="text"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                />
                                <h3>Password: </h3>
                                <input
                                    id="password"
                                    value={password}
                                    onChange={this.handleChange}
                                    type="password"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                />
                                <button type="submit" className="send">
                                    Login
                                    {/* <Icon.Send /> */}
                                </button>
                            </form>
                            {/* <button className="send" onClick={this.handleLoginClick}>
                                Login for nurse
                            </button> */}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="Home">
                <div className="home-left">
                    <div className="header fadeInUp" style={{ animationDelay: '0.5s' }}>
                        <div className="header-mid">
                            <div className="titles">
                                <h1>Virtual Doctor</h1>
                                <h2>Telemedicine</h2>
                            </div>
                        </div>
                    </div>
                    <Chat callStarted={callStarted} setchatStarted={this.setchatStarted} username={username} changePatient={this.changePatient} patient={patient} socket={this.socketRef} presUpload={presUpload} _event={_event} setCurrPatient={this.setCurrPatient} />
                </div>
                <div className="home-right" style={{ alignItems: 'center' }}>
                    {incomingTyping || requesting ? (
                        <p className="incoming-message">
                            <div className="dots">
                                <div className="dot" />
                                <div className="dot" />
                                <div className="dot" />
                            </div>
                        </p>
                    ) : null}
                    {/* <CallModal chatStarted={this.setchatStarted} status={callModal} startCall={this.startCall} rejectCall={this.rejectCall} /> */}
                    {/* {!_.isEmpty(this.configRef) &&
                        <div className='callwindowcontainer3'>
                            <CallWindow
                                status={callWindow}
                                localSrc={localSrc}
                                peerSrc={peerSrc}
                                config={this.configRef}
                                mediaDevice={this.pcRef?.mediaDevice}
                                endCall={() => this.endCall()}
                            />
                        </div>} */}
                    {/* {!callStarted&&<Table username={username} changePatient={this.changePatient} />} */}
                    <Table username={username} changePatient={this.changePatient} callStarted={callStarted} setpresUploaded={this.setpresUploaded} currPatient={currPatient} doctorId={this.state.doctorId} />
                    <form onSubmit={this.logout} className="login-form fadeInUp">
                        <p>{error}</p>
                        <button
                            onClick={() => {
                                this.socketRef.emit('changeStatus', { username: username, status: "offline" });
                                ; this.logout();
                            }}
                            className="logout fadeInUp"
                            style={{ animationDelay: '0.8s' }}
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    loginStart,
    loginSuccess,
    loginFailure,
    logout
};

export default connect(null, mapDispatchToProps)(Doctor);
