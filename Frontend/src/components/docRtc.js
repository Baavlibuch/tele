import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ENDPOINT } from '../config';
import * as Icon from 'react-feather';
import CallModal from './webrtc/CallModal';
import styled from 'styled-components';

// Styled Components
const TableContainer = styled.div`
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  background: white;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 15px;
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 12px 15px;
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 12px 15px;
  align-items: center;
  border-bottom: 1px solid #f1f3f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  padding: 8px 0;
  display: flex;
  align-items: center;
`;

const HeaderText = styled.div`
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  background-color: ${props => {
    if (props.status === 'online') return '#2ecc71';
    if (props.status === 'busy') return '#f1c40f';
    if (props.status === 'idle') return '#3498db';
    return '#e74c3c';
  }};
`;

const StatusText = styled.span`
  font-size: 0.85rem;
  color: #495057;
  text-transform: capitalize;
`;

const CallButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f1f3f5;
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #495057;
  }
`;
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
    const [showForm2, setShowForm2] = useState(false);
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [docIndex, setDocIndex] = useState();
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [readyPopupOpen, setReadyPopupOpen] = useState(false);
    const [modePopupOpen, setModePopupOpen] = useState(false);
    const { setDoctor, setPatient, socketRef, setTrigger, callParentFunc, setChatHistory } = props
    // const socketRef = useRef(null);
    const pcRef = useRef(null);
    const configRef = useRef(null);

    useEffect(() => {
        const fetchDoctorsWithTimeout = () => {
            getDoctors();
            setTimeout(fetchDoctorsWithTimeout, 5000);
        };

        fetchDoctorsWithTimeout();

        return () => {
            clearTimeout(fetchDoctorsWithTimeout);
        };
    }, []);

    //   useEffect(() => {
    //     console.log("aftersdfsad")
    //     if (selectedDoctor) {
    //       if (selectedDoctor.status === "online") {
    //         alert("Your Session Is Over");
    //       }
    //     }
    //   }, [selectedDoctor]);
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

    // socketRef.on("statusChanged",()=>{console.log("statusChanged")});

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
    // }, []);

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
    const formSub2 = () => {
        setShowForm2(true);
    };

    const handleStartCall = () => {
        console.log(number.length)
        if (number.length !== 10) {
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
    const handleStartCall2 = () => {
        console.log(number.length)
        if (number.length !== 10) {
            alert("The phone number must be 10 digits.");
            return;
        }

        const id = name + '-' + number;
        setPatientId(id);
        // setPatient(id);

        axios
        .post(ENDPOINT + '/api/seepatientchat', { id, name, number, selectedDoctor })
        .then((response) => {
            console.log(response.data); 
            if(response.data.success) {
                setChatHistory(response.data.chat);
            } else {
                alert(response.data.message); 
            }
        })
        .catch((err) => {
            console.error("Error fetching chat history:", err);
            alert("An error occurred while fetching chat history. Please try again.");
        });
    

        setShowForm2(false);
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

        const input = e.target.value;

        setNumber(input);
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
            {!showForm && !showForm2 && (
                <TableContainer>
                    <TableGrid>
                        <TableHead>
                            <HeaderText>NAME</HeaderText>
                            <HeaderText>STATUS</HeaderText>
                            <HeaderText>CALL</HeaderText>
                        </TableHead>
                        {currentDoctors.map((doc, index) => (
                            <TableRow key={doc._id || index}>
                                <TableCell>{doc.name || 'Doctor'}</TableCell>
                                <TableCell>
                                    <StatusContainer>
                                        <StatusDot status={doc.status?.toLowerCase()} />
                                        <StatusText>
                                            {doc.status ? doc.status.toLowerCase() : 'offline'}
                                        </StatusText>
                                    </StatusContainer>
                                </TableCell>
                                <TableCell>
                                    {(doc.status && (doc.status.toLowerCase() === 'online' || doc.status.toLowerCase() === 'idle')) && (
                                        <CallButton 
                                            type="button"
                                            onClick={() => {
                                                setSelectedDoctor(doc.name);
                                                setDoctor(doc);
                                                setShowForm(true);
                                            }}
                                        >
                                            <Icon.PhoneCall />
                                        </CallButton>
                                    )}
                                    {!(doc.status && (doc.status.toLowerCase() === 'online' || doc.status.toLowerCase() === 'idle')) && (
                                        <div>
                                            <CallButton 
                                                type="button" 
                                                onClick={() => {
                                                    formSub();
                                                    setDocIndex(index);
                                                    setSelectedDoctor(doctors[index].username);
                                                    setDoctor(doctors[index].username);
                                                    setSelectedHospital(doctors[index].hospital);
                                                }}
                                            >
                                                <Icon.Video />
                                            </CallButton>
                                            <CallButton 
                                                type="button" 
                                                onClick={() => {
                                                    formSub2();
                                                    setDocIndex(index);
                                                    setSelectedDoctor(doctors[index].username);
                                                    setDoctor(doctors[index].username);
                                                    setSelectedHospital(doctors[index].hospital);
                                                }}
                                            >
                                                <Icon.MessageCircle />
                                            </CallButton>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableGrid>
                </TableContainer>
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
            {showForm2 && (
                <div className="form">
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input
                        type="text"
                        placeholder="Number"
                        value={number}
                        onChange={handleChange}
                    />
                    <button onClick={handleStartCall2}>View Chat</button>
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
