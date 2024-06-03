import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { ENDPOINT } from '../config';
import * as Icon from 'react-feather';
import CallModal from './webrtc/CallModal'
import PeerConnection from './webrtc/PeerConnection';
import CallWindow from './webrtc/CallWindow';
const client = require('socket.io-client');

export default function DocRtc(props) {

    const [loading, setLoading] = useState(true);
    const [chatStarted, setChatStarted] = useState(false);
    const [patientId, setPatientId] = useState(null);
    const [incomingTyping, setIncomingTyping] = useState(false);
    const [chat, setChat] = useState([]);
    const [textAnswered, setTextAnswered] = useState('');
    const [actionsReveal, setActionsReveal] = useState(false);
    // const [doctors, setDoctors] = useState([]);
    const [doctorSelected, setDoctorSelected] = useState('');
    const [callWindow, setCallWindow] = useState('');
    const [callModal, setCallModal] = useState('');
    const [localSrc, setLocalSrc] = useState(null);
    const [peerSrc, setPeerSrc] = useState(null);
    // const [currentPage, setCurrentPage] = useState(1);
    const [config, setConfig] = useState(null);

    const [doctors, setDoctors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [docindex, setDocindex] = useState();

    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [selectedHospital, setSelectedHospital] = useState(null)

    const socketInstance = client('/app_chat', {
        transports: ['websocket'],
        query: {
            patientId,
			type: 'patient'
        }
    });

    const peerConnection = useRef(null);

    const startCall = (isCaller, config) => {
        console.log("starting call...")
        setConfig(config);
        peerConnection.current = new PeerConnection(socketInstance, selectedDoctor)
            .on('localStream', (src) => {
                const newState = { callWindow: 'active', localSrc: src };
                if (!isCaller) newState.callModal = '';
                setCallWindow(newState.callWindow);
                setLocalSrc(newState.localSrc);
                if (!isCaller) setCallModal(newState.callModal);
            })
            .on('peerStream', (src) => setPeerSrc(src))
            .start(isCaller, config);
    };

    const endCall = (isStarter) => {
        if (_.isFunction(peerConnection.current?.stop)) {
            peerConnection.current.stop(isStarter);
        }
        peerConnection.current = null;
        setConfig(null);
        setCallWindow('');
        setCallModal('');
        setLocalSrc(null);
        setPeerSrc(null);
        // scrollDown(); // Assuming you have a scrollDown function
    };

    const formSub = () => {
        setShowForm(true);
    }
    const handleStartCall = () => {
        setPatientId(name + '-' + number)
        console.log(name + '-' + number)
        let id=name + '-' + number
        axios
            .post(ENDPOINT + '/api/addpatient',{id,name,number})
            .then((response) => {
                console.log(response.status)
            })
            .catch((err) => {
                console.log(err);
            });
        setShowForm(false);
    };

    const callWithVideo = async(video) => {
        await axios
            .post(ENDPOINT + '/api/updatepatientdochos',{patientId,selectedHospital, selectedDoctor})
            .then((response) => {
                console.log(response.status)
            })
            .catch((err) => {
                console.log(err);
            });
        console.log("callWithVideo")
        const config = { audio: true,video };
        startCall(true, config);
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

    if (callWindow === 'active') {
        return (
            <div className='callwindowcontainer'>
                <CallWindow
                    status={callWindow}
                    localSrc={localSrc}
                    peerSrc={peerSrc}
                    config={config}
                    mediaDevice={peerConnection.mediaDevice}
                    endCall={() => endCall(true)}
                /></div>
        );
    }
    return (
        <>
            {!showForm && (<div className="tablecontainer">

                <div className="tablegrid">
                    <div className="tablehead">
                        <div className='htext'>NAME</div>
                        <div className='htext'>STATUS</div>
                        <div className='htext'>CALL</div>
                    </div>
                    {
                        currentDoctors.map((doc, index) => {
                            return (

                                <div key={index} className={`${docindex === index ? "active-tablerow" : "tablerow"}`}>
                                    <div className="ctext">{doc.name}</div>
                                    <div className="ctext">{
                                        doc.attending
                                            === '' ? (
                                            <div className='ofcontainer'><div className='gdot'></div><div className='oftext'>online</div></div>
                                        )
                                            :
                                            (
                                                <div className='ofcontainer'><div className='rdot'></div><div className='oftext'>offline</div></div>
                                            )

                                    }
                                    </div>
                                    <div className="ctextq">
                                        {
                                            patientId !== null && (
                                                <>
                                                    <button type="button" onClick={() => { callWithVideo(true); }} className="send">
                                                        <Icon.Video />
                                                    </button>
                                                    <button type="button" onClick={() => { callWithVideo(false); }} className="send">
                                                        <Icon.PhoneCall />
                                                    </button></>)
                                        }
                                        {
                                            patientId === null && (
                                                <>
                                                    <button type="button" onClick={()=>{formSub();
                                                        setDocindex(index); setSelectedDoctor(doctors[index].username);setSelectedHospital(doctors[index].hospital);  
                                                    }} className="send"
                                                    >
                                                        <Icon.Video />
                                                    </button>
                                                    <button type="button" onClick={()=>{formSub();
                                                        setDocindex(index); setSelectedDoctor(doctors[index].username);setSelectedHospital(doctors[index].hospital);  
                                                    }} className="send">
                                                        <Icon.PhoneCall />
                                                    </button></>)
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>)}
            {showForm && (
                <div className="form">
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input type="text" placeholder="Number" value={number} onChange={(e) => setNumber(e.target.value)} />
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
        </>
    );
}