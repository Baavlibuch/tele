import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ENDPOINT } from '../config';
import * as Icon from 'react-feather';
import CallModal from './webrtc/CallModal';
import PeerConnection from './webrtc/PeerConnection';
import CallWindow from './webrtc/CallWindow';
import _ from 'lodash';
const client = require('socket.io-client');

export default function DocRtc(props) {
    const [loading, setLoading] = useState(true);
    const [chatStarted, setChatStarted] = useState(false);
    const [patientId, setPatientId] = useState(null);
    const [incomingTyping, setIncomingTyping] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [chat, setChat] = useState([]);
    const [textAnswered, setTextAnswered] = useState('');
    const [actionsReveal, setActionsReveal] = useState(false);
    const [answerBoxHidden, setAnswerBoxHidden] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [doctorSelected, setDoctorSelected] = useState('');
    const [callWindow, setCallWindow] = useState('');
    const [callModal, setCallModal] = useState('');
    const [localSrc, setLocalSrc] = useState(null);
    const [peerSrc, setPeerSrc] = useState(null);
    const [config, setConfig] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [docIndex, setDocIndex] = useState();
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [readyPopupOpen, setReadyPopupOpen] = useState(false);
    const [modePopupOpen, setModePopupOpen] = useState(false);
    const { setDoctor, setPatient, socketRef, setTrigger, callParentFunc } = props
    // const socketRef = useRef(null);
    const pcRef = useRef(null);
    const configRef = useRef(null);

    // useEffect(() => {
    // console.log('Connecting to doctor...');
    // setRequesting(true);

    // socketRef.current = client('/app_chat', {
    //     transports: ['websocket'],
    //     query: {
    //         type: 'patient',
    //         patientId
    //     }
    // });

    // setSocketRef(socketRef.current);

    // // Event listeners for socket.io
    // socketRef.current.on('doctorAlloted', (doctor) => {
    //     console.log("docrtc function")
    //     console.log('--doctorAlloted--');
    //     setAnswerBoxHidden(false);
    //     setRequesting(false);
    //     setSelectedDoctor(doctor);
    //     setDoctor(doctor)
    // });

    // socketRef.current.on('onlineUsers', (onlineUsers) => {
    //     console.log("docrtc function")
    //     setOnlineUsers(onlineUsers);
    // });

    // // socketRef.current.on('message', ({ message, from }) => {
    // //     console.log("docrtc function")

    // //     if (from === selectedDoctor) {
    // //         setIncomingTyping(false);
    // //         enterMessageIntoChat(message, 'incoming');
    // //     }
    // // });

    // // socketRef.current.on('typingChange', ({ state, from }) => {
    // //     console.log("docrtc function")
    // //     if (from === selectedDoctor) {
    // //         setIncomingTyping(state);
    // //         scrollDown();
    // //     }
    // // });

    // socketRef.current.on('referUser', (doctor) => {
    //     console.log("docrtc function")
    //     endCall(false);
    //     setSelectedDoctor(doctor);
    //     setDoctor(doctor);
    //     setAnswerBoxHidden(true);
    // });

    // socketRef.current.on('request', (from) => {
    //     console.log("docrtc function")
    //     if (from === selectedDoctor) {
    //         setCallModal('active');
    //         scrollDown();
    //     }
    // });

    // socketRef.current.on('call', ({ data, from }) => {
    //     console.log("docrtc function")
    //     if (from === selectedDoctor) {
    //         if (data.sdp) {
    //             pcRef.current.setRemoteDescription(data.sdp);
    //             if (data.sdp.type === 'offer') pcRef.current.createAnswer();
    //         } else {
    //             pcRef.current.addIceCandidate(data.candidate);
    //         }
    //     }
    // });

    // socketRef.current.on('end', (from) => {
    //     console.log("docrtc function")
    //     if (from === selectedDoctor) endCall(false);
    // });

    // return () => {
    //     // Clean up socket connection on unmount
    //     if (socketRef.current) {
    //         socketRef.current.disconnect();
    //     }
    //     setSocketRef(null);
    // };
    // }, [modePopupOpen]);

    const enterMessageIntoChat = (message, type) => {
        // Implement message entering logic here
        // Example: setChat([...chat, { message, type }]);
    };

    const scrollDown = () => {
        // Implement scroll down logic here if needed
    };

    const startCall = (isCaller, config) => {
        configRef.current = config;
        pcRef.current = new PeerConnection(socketRef, selectedDoctor)
            .on('localStream', (src) => {
                setCallWindow('active');
                setLocalSrc(src);
                if (!isCaller) setCallModal('');
            })
            .on('peerStream', (src) => setPeerSrc(src))
            .start(isCaller, config);
    };

    const rejectCall = () => {
        socketRef.emit('end', selectedDoctor);
        setCallModal('');
    };

    const endCall = (isStarter) => {
        if (pcRef.current && typeof pcRef.current.stop === 'function') {
            pcRef.current.stop(isStarter);
        }
        pcRef.current = null;
        configRef.current = null;
        setCallWindow('');
        setCallModal('');
        setLocalSrc(null);
        setPeerSrc(null);
        scrollDown();
    };

    const formSub = () => {
        setShowForm(true);
    };

    const handleStartCall = () => {
        console.log(number.length)
        if (number.length !== 13) {
            alert("The phone number must be 10 digits.");
            return;
        }

        const id = name + '-' + number;
        setPatientId(id);
        setPatient(id);

        axios
            .post(ENDPOINT + '/api/addpatient', { id, name, number })
            .then((response) => {
                console.log(response.status);
            })
            .catch((err) => {
                console.log(err);
            });

        setShowForm(false);
        openReadyPopup();
    };


    const callWithVideo = async (video) => {
        // const config = { audio: true, video };
        // startCall(true, config);
        closeModePopup();
    };

    useEffect(() => {
        getDoctors();
    }, []);

    const getDoctors = () => {
        axios
            .get(ENDPOINT + '/api/Alldoctor-list')
            .then((response) => {
                const { doctors } = response.data;
                if (doctors) {
                    setDoctors(doctors);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const itemsPerPage = 25;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(doctors.length / itemsPerPage);

    const openReadyPopup = () => {
        setReadyPopupOpen(true);
    };

    const closeReadyPopup = () => {
        setReadyPopupOpen(false);
    };

    const openModePopup = () => {
        setModePopupOpen(true);
    };

    const closeModePopup = () => {
        setModePopupOpen(false);
    };

    const handleYesClick = async () => {
        await axios
            .post(ENDPOINT + '/api/updatepatientdochos', { patientId, selectedHospital, selectedDoctor })
            .then((response) => {
                console.log(response.status);
            })
            .catch((err) => {
                console.log(err);
            });
        setTrigger(prev => !prev);
        closeReadyPopup();
        openModePopup();
        callParentFunc();
    };

    const handleNoClick = () => {
        closeReadyPopup();
    };

    const handleChange = (e) => {
        // Ensure that +91 stays as a prefix and user inputs only after that
        const input = e.target.value;
        if (input.startsWith('+91')) {
            setNumber(input);
        } else {
            setNumber('+91' + input.replace(/^\+91/, ''));
        }
    };

    return (
        <>
            {incomingTyping || requesting ? (
                <p className="incoming-message">
                    <div className="dots">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                    </div>
                </p>
            ) : null}
            <CallModal status={callModal} startCall={startCall} rejectCall={rejectCall} />
            <div>
                {readyPopupOpen && (
                    <div className="popup">
                        <div className="popup-content">
                            <span className="close" onClick={closeReadyPopup}>&times;</span>
                            <p>{`Do You want to call ${selectedDoctor} ?`}</p>
                            <div className="button-container">
                                <button onClick={handleYesClick}>Yes</button>
                                <button onClick={handleNoClick}>No</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {!showForm && (
                <div className="tablecontainer">
                    <div className="tablegrid">
                        <div className="tablehead">
                            <div className='htext'>NAME</div>
                            <div className='htext'>STATUS</div>
                            <div className='htext'>CALL</div>
                        </div>
                        {
                            currentDoctors.map((doc, index) => (
                                <div key={index} className={`${docIndex === index ? "active-tablerow" : "tablerow"}`}>
                                    <div className="ctext">{doc.name}</div>
                                    <div className="ctext">
                                        {(doc.status === "online") ? (
                                            <div className='ofcontainer'>
                                                <div className='gdot'></div>
                                                <div className='oftext'>online</div>
                                            </div>
                                        ) : doc.status === "buzy" ? (
                                            <div className='ofcontainer'>
                                                <div className='ydot'></div>
                                                <div className='oftext'>busy</div>
                                            </div>
                                        )
                                            :
                                            (
                                                <div className='ofcontainer'>
                                                    <div className='rdot'></div>
                                                    <div className='oftext'>offline</div>
                                                </div>
                                            )}
                                    </div>
                                    {(doc.status === "online") && (
                                        <div className="ctextq">
                                            {patientId !== null ? (
                                                <>
                                                    <button type="button" onClick={() => callWithVideo(true)} className="send">
                                                        <Icon.Video />
                                                    </button>
                                                    <button type="button" onClick={() => callWithVideo(false)} className="send">
                                                        <Icon.PhoneCall />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button type="button" onClick={() => {
                                                        formSub();
                                                        setDocIndex(index);
                                                        setSelectedDoctor(doctors[index].username);
                                                        setDoctor(doctors[index].username)
                                                        setSelectedHospital(doctors[index].hospital);
                                                    }} className="send">
                                                        <Icon.Video />
                                                    </button>
                                                    <button type="button" onClick={() => {
                                                        formSub();
                                                        setDocIndex(index);
                                                        setSelectedDoctor(doctors[index].username);
                                                        setDoctor(doctors[index].username)
                                                        setSelectedHospital(doctors[index].hospital);
                                                    }} className="send">
                                                        <Icon.PhoneCall />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
            {showForm && (
                <div className="form">
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input
                        type="text"
                        placeholder="Number"
                        value={number}
                        onChange={handleChange}
                    />
                    <button onClick={handleStartCall}>Start Call</button>
                </div>
            )}
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? 'active' : ''}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
            {configRef.current && (
                <div className='callwindowcontainer'>
                    <CallWindow
                        status={callWindow}
                        localSrc={localSrc}
                        peerSrc={peerSrc}
                        config={configRef.current}
                        mediaDevice={pcRef.current.mediaDevice}
                        endCall={() => endCall()}
                    />
                </div>
            )}
        </>
    );
}
