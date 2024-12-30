import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DoctorCred = ({ doctorId, setDoctor }) => {
    const [formData, setFormData] = useState({
        name: '',
        degree: '',
        regNO: '',
        signature: null,
        signaturePreview: '',
    });

    useEffect(() => {
        
        const fetchDoctor = async () => {
            try {
                const { data } = await axios.get(`/api/doctor/${doctorId}`);
                setFormData({
                    name: data.name || '',
                    degree: data.degree || '',
                    regNO: data.regNO || '',
                    signature: null,
                    signaturePreview: data.signature || '',
                });
                setDoctor({
                    name: data.name || '',
                    degree: data.degree || '',
                    regNO: data.regNO || '',
                    signature: null,
                    signaturePreview: data.signature || '',
                })
            } catch (err) {
                console.error('Error fetching doctor data:', err);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, signature: file, signaturePreview: URL.createObjectURL(file) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('degree', formData.degree);
        data.append('regNO', formData.regNO);
        if (formData.signature) data.append('signature', formData.signature);

        try {
            const { data: updatedDoctor } = await axios.put(`/api/doctor/${doctorId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // alert('Doctor credentials updated successfully');
            toast.success('Doctor credentials updated successfully');
        } catch (err) {
            console.error('Error updating doctor credentials:', err);
            alert('Failed to update credentials');
        }
    };

    return (
        <div className=''>
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px',  margin: '30px auto' }}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>Degree:</label>
                    <input
                        type="text"
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>Registration No:</label>
                    <input
                        type="text"
                        name="regNO"
                        value={formData.regNO}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>Signature:</label>
                    <input
                        type="file"
                        name="signature"
                        onChange={handleFileChange}
                        style={{ marginBottom: '10px' }}
                    />
                    {formData.signaturePreview && (
                        <div>
                            <img
                                src={formData.signaturePreview}
                                alt="Signature Preview"
                                style={{ width: '100px', marginTop: '10px' }}
                            />
                        </div>
                    )}
                </div>
                <button type="submit">
                    Update
                </button>
            </form>
        </div>
    );
};

export default DoctorCred;
