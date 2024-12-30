import React from 'react';

const PrescriptionTemplate = ({ data }) => {
    return (
        <div className="prescription-template" style={{ width: '800px', margin: '0 auto', border: '1px solid black', padding: '10px' }}>
            <header style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                <h2>ICMR-NIIRNCD</h2>
                <p>National Institute for Implementation Research on Non-Communicable Diseases</p>
                <h4>Dr. Dileep Seervi</h4>
                <p>Registration Number: 66005</p>
                <p>Website: www.teleniir.com</p>
            </header>

            <section style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                <div>
                    <p><strong>Patient ID:</strong> {data.patient_Id}</p>
                    <p><strong>Date:</strong> {data.date}</p>
                    <p><strong>Consulted Via:</strong> {data.Consulted_via}</p>
                </div>
                <div>
                    <p><strong>Time:</strong> {data.time}</p>
                    <p><strong>Visit:</strong> {data.Visit}</p>
                </div>
            </section>

            <section style={{ border: '1px solid black', margin: '10px 0', padding: '10px' }}>
                <p><strong>Name:</strong> {data.name}</p>
                <p><strong>Age:</strong> {data.age}</p>
                <p><strong>Gender:</strong> {data.Gender}</p>
                <p><strong>Phone:</strong> {data.phone}</p>
                <p><strong>Address:</strong> {data.Address}</p>
                <p><strong>P/H:</strong> {data.pastHistory}</p>
            </section>

            <section style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                <div>
                    <p><strong>BP:</strong> {data.Bp}</p>
                    <p><strong>Pulse Rate:</strong> {data.pulseRate}</p>
                    <p><strong>SPO2:</strong> {data.Spo2}</p>
                </div>
                <div>
                    <p><strong>ECG:</strong> {data.ECG}</p>
                </div>
            </section>

            <section style={{ border: '1px solid black', margin: '10px 0', padding: '10px' }}>
                <h4>Chief Complaint & Diagnosis</h4>
                <p>{data.diagnosis}</p>
            </section>

            <section style={{ border: '1px solid black', margin: '10px 0', padding: '10px' }}>
                <h4>Advice</h4>
                <p>{data.advice}</p>
            </section>

            <section style={{ border: '1px solid black', margin: '10px 0', padding: '10px' }}>
                <h4>Prescriptions</h4>
                {data.prescriptions.map((prescription, index) => (
                    <div key={index}>
                        <p>
                            <strong>Medicine:</strong> {prescription.saltName} - {prescription.dosage}{' '}
                            <strong>Remarks:</strong> {prescription.remarks}
                        </p>
                    </div>
                ))}
            </section>

            <footer style={{ textAlign: 'center', marginTop: '20px', borderTop: '2px solid black', paddingTop: '10px' }}>
                <p><strong>Signature:</strong> {data.Signature}</p>
                <p>This prescription is not valid for medicolegal cases.</p>
            </footer>
        </div>
    );
};

export default PrescriptionTemplate;
