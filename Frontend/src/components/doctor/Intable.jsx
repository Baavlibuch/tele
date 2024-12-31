import React, { useEffect, useState } from 'react';
import './Intable.css';
import * as Icon from 'react-feather';
import PrescriptionCreator from './rxCreator';
import axios from 'axios';
import { ENDPOINT } from '../../config';
import toast from 'react-hot-toast';
import ToggleBox from './ToggleBox';

const Intable = ({ index, patient, changePatient, doctorCred, setpresUploaded}) => {
    const [togglebox, setToggleBox] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [followuppatients, setfollowupPatients] = useState([]);

    useEffect(() => {
        if (patient?._id) {
            getFollowUpPatients();
        }
    }, [patient]);

    const getFollowUpPatients = async () => {
        try {
            const response = await axios.get(`${ENDPOINT}/api/followuppatient-list`, {
                params: { patient_Id: patient._id },
            });
            setfollowupPatients(response.data.patients || []);
        } catch (error) {
            console.error('Error fetching follow-up patients:', error);
            toast.error('Failed to fetch follow-up patients.');
        }
    };

    return (
        <>
            <div className={`${togglebox ? 'outer-col-select' : 'outer-col'}`}>
                {
                    index + 1 === 10 ? <div className='col-1' style={{ paddingRight: '73px' }} onClick={() => setToggleBox((prev) => !prev)}>
                        {index + 1}
                    </div> :
                        <div className='col-1' style={{ paddingRight: '80px' }} onClick={() => setToggleBox((prev) => !prev)}>
                            {index + 1}
                        </div>
                }
                <div className='col-1' style={{ width: '100%' }} onClick={() => setToggleBox((prev) => !prev)}>
                    {patient._id}
                </div>
                <div className='col-1' style={{ width: '20%' }}>
                    <button
                        className="send"
                        style={{ margin: 0 }}
                        onClick={() => changePatient(patient._id)}
                    >
                        <Icon.MessageCircle />
                    </button>
                </div>
            </div>
            {togglebox && (
                <>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            key={patient._id}
                            onClick={() => setSelectedIndex(1)}
                            style={{
                                backgroundColor: selectedIndex === 1 ? 'rgba(150, 197, 247, 0.18)' : '#f1f1f1',
                                color: 'black',
                                border: '1px solid #ddd',
                                padding: '2px 4px',
                                cursor: 'pointer',
                            }}
                        >
                            1
                        </button>
                        {followuppatients.map((followup, idx) => (
                            <button
                                key={followup._id}
                                onClick={() => setSelectedIndex(idx + 2)}
                                style={{
                                    backgroundColor: selectedIndex === idx + 2 ? 'rgba(150, 197, 247, 0.18)' : '#f1f1f1',
                                    color: 'black',
                                    border: '1px solid #ddd',
                                    padding: '2px 4px',
                                    cursor: 'pointer',
                                }}
                            >
                                {idx + 2}
                            </button>
                        ))}
                    </div>
                    <div>
                        {selectedIndex === 1 && (
                            <ToggleBox patient={patient} index={1} doctorCred={doctorCred} setpresUploaded={setpresUploaded}/>
                        )}
                        {followuppatients.map((followup, idx) => (
                            selectedIndex === idx + 2 ? (
                                <ToggleBox key={followup._id} patient={followup} index={idx + 2} doctorCred={doctorCred} setpresUploaded={setpresUploaded}/>
                            ) : null
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

export default Intable;
