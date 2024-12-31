import React, { useEffect, useState } from 'react'
import './Intable.css'
import PrescriptionCreator from './rxCreator';
import axios from 'axios';
import { ENDPOINT } from '../../config';
import toast from 'react-hot-toast';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const ToggleBox = ({ patient, doctorCred, index, setpresUploaded}) => {
    const filteredKeys = ['name', 'telephone', 'age', 'gender', 'symptoms', 'symptoms_Duration', 'village', 'latitude', 'longitude', 'doctor', 'Last Visited', 'Registered', 'followup', 'BP_systolic', 'BP_diastolic', 'SPO2_value', 'heart_rate'];

    const [prescriptions, setPrescriptions] = useState(patient.prescriptions ? patient.prescriptions : [
        { id: Date.now(), notation: "", saltName: "", dosage: "", remarks: "" },
    ]);
    const [pastHistory, setPastHistory] = useState(patient.pastHistory);
    const [diagnosis, setDiagnosis] = useState(patient.diagnosis);
    const [advice, setAdvice] = useState(patient.advice);
    const [specialRemark, setSpecialRemark] = useState(patient.specialRemark);
    const [behavior, setBehavior] = useState(patient.behavior)
    const [pdfFile, setPdfFile] = useState(null);

    const handleBehaviorChange = (event) => {
        const selectedBehavior = event.target.value;
        setBehavior(selectedBehavior);
    };

    const addTextToPdf = async (data) => {
        // Load the existing PDF template
        const existingPdfBytes = await fetch(`${process.env.PUBLIC_URL}/template.pdf`).then(res =>
            res.arrayBuffer()
        );

        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Get the first page of the document
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const fontSize = 7; // Adjust as per readability
        firstPage.drawText(`${data.patient_Id}`, { x: 85, y: 469, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.date}`, { x: 58, y: 449, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`Telemedicine Portal`, { x: 85, y: 424, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.name}`, { x: 58, y: 399, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.age}`, { x: 58, y: 372, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.phone}`, { x: 60, y: 347, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.Bp}`, { x: 74, y: 318, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.pulseRate}`, { x: 74, y: 294, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.Spo2}`, { x: 74, y: 271, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.ECG}`, { x: 74, y: 247, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });

        const sanitizeText = (text) => {
            if (typeof text !== 'string') {
                console.warn('sanitizeText received non-string input:', text);
                return ''; // Return an empty string for invalid input
            }
            return text.replace(/\n/g, ' '); // Replace newline characters with a space
        };
        // Utility function to split text into multiple lines
        function splitTextIntoLines(text, maxWidth, font, fontSize) {
            const sanitizedText = sanitizeText(text);
            const words = sanitizedText.split(' ');
            const lines = [];
            let currentLine = '';

            words.forEach(word => {
                const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
                if (width < maxWidth) {
                    currentLine += (currentLine.length > 0 ? ' ' : '') + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            });

            if (currentLine.length > 0) {
                lines.push(currentLine);
            }

            return lines;
        }

        // Adding advice text with wrapping
        const adviceLines = splitTextIntoLines(data.advice, 100, helveticaFont, fontSize);
        let yPosition = 219; // Starting y position for the advice text

        adviceLines.forEach(line => {
            firstPage.drawText(line, {
                x: 36,
                y: yPosition,
                size: fontSize,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });
            yPosition -= fontSize + 5; // Move down for the next line
        });

        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const textWidth = helveticaFont.widthOfTextAtSize(doctorCred.name, fontSize);
        const rightEdgeX = 372;
        const startX = rightEdgeX - textWidth;
        firstPage.drawText(`${doctorCred.name}`, { x: startX, y: 509, size: fontSize, font: helveticaBoldFont, color: rgb(0, 0, 0) });
        const textWidth2 = helveticaFont.widthOfTextAtSize(doctorCred.degree, fontSize);
        const startX2 = rightEdgeX - textWidth2 + 1;
        firstPage.drawText(`${doctorCred.degree}`, { x: startX2, y: 499, size: fontSize, font: helveticaBoldFont, color: rgb(0, 0, 0) });
        const textWidth3 = helveticaFont.widthOfTextAtSize(`Registration Number: ${doctorCred.regNO} `, fontSize);
        const startX3 = rightEdgeX - textWidth3;
        firstPage.drawText(`Registration Number: ${doctorCred.regNO}`, { x: startX3, y: 489, size: fontSize, font: helveticaBoldFont, color: rgb(0, 0, 0) });

        firstPage.drawText(`${data.time}`, { x: 190, y: 449, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.Visit}`, { x: 190, y: 424, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.Address}`, { x: 190, y: 399, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.Gender}`, { x: 190, y: 372, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`${data.pastHistory}`, { x: 190, y: 347, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });

        const CCLines = splitTextIntoLines(data.diagnosis, 200, helveticaFont, fontSize);
        let yPosition2 = 322; // Starting y position for the advice text

        CCLines.forEach(line => {
            firstPage.drawText(line, {
                x: 190,
                y: yPosition2,
                size: fontSize,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });
            yPosition2 -= fontSize + 5; // Move down for the next line
        });

        const startXp = 158;
        let startYp = 219; // Adjust starting position
        const lineSpacing = fontSize + 5; // Spacing between lines

        data.prescriptions.forEach((prescription, index) => {
            const text = `${prescription.notation}      ${prescription.saltName}        ${prescription.dosage}      ${prescription.remarks}`;
            firstPage.drawText(text, {
                x: startXp,
                y: startYp,
                size: fontSize,
                font: helveticaFont, // or helveticaBoldFont for bold text
                color: rgb(0, 0, 0),
            });
            startYp -= lineSpacing; // Move down for the next line
        });
        const srLines = splitTextIntoLines(data.specialRemark, 55, helveticaFont, fontSize);
        let yPosition3 = startYp - 5; // Starting y position for the advice text

        srLines.forEach(line => {
            firstPage.drawText(line, {
                x: 328,
                y: yPosition3,
                size: fontSize,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });
            yPosition3 -= fontSize + 5; // Move down for the next line
        });
        // const imageBytes = await fetch(`https://teleniir.com${doctorCred.signature}`).then((res) => res.arrayBuffer());
        // const signatureImage = await pdfDoc.embedPng(imageBytes);
        // const { width, height } = signatureImage.size();
        // firstPage.drawImage(signatureImage, {
        //     x: 320,
        //     y: 76,
        //     width: 60, // You can adjust the size of the image
        //     height: (height / width) * 60, // Maintain aspect ratio
        // });


        // Save the PDF
        const pdfBytes = await pdfDoc.save();

        // Download the modified PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        if(index>1){
            handleFileUpload(blob, patient.id, "prescription")
        }
        else{
            handleFileUpload(blob, patient._id, "prescription")
        }
        setPdfFile(blob);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${data.patient_Id}`;
        link.click();
    };
    const handleGenerateBtn = () => {
        try {
            if (index > 1) {
                const data = {
                    patient_Id: patient.id,
                    date: patient['Last Visited']?.split(',')[0] ? patient['Registered']?.split(',')[0] : "Nil",
                    time: patient['Last Visited']?.split(',')[1]?.trim() ? patient['Registered']?.split(',')[1]?.trim() : "Nil",
                    Visit: patient['Visit']? patient['Visit'] > 1 ? `Follow-up(${patient['Visit']})` : 'First': patient['followup'],
                    Address: patient.village,
                    Gender: patient.gender,
                    Consulted_via: "Telemedicine Portal",
                    name: patient.name,
                    age: patient.age,
                    phone: patient.telephone,
                    Bp: `${patient.BP_systolic}/${patient.BP_diastolic}`,
                    pulseRate: patient.heart_rate,
                    Spo2: patient.SPO2_value,
                    ECG: patient.ECG_Image ? "Yes" : "No",
                    pastHistory: pastHistory !== null ? pastHistory : "Nil",
                    diagnosis: diagnosis !== null ? diagnosis : "Nil",
                    advice: advice !== null ? advice : "Nil",
                    specialRemark: specialRemark !== null ? specialRemark : "Nil",
                    prescriptions,
                    behavior,
                    index,
                }
                console.log(data)
                addTextToPdf(data)
                console.log(index);
                axios
                    .post(`${ENDPOINT}/api/saveFollowupERX`, data)
                    .then((response) => {
                        console.log("success", response.data);
                        toast.success("ePrescription successfully generated!!")
                    })
                    .catch((error) => {
                        console.error('Error uploading file:', error);
                    });

            }
            else {
                const data = {
                    patient_Id: patient._id,
                    date: patient['Registered']?.split(',')[0],
                    time: patient['Registered']?.split(',')[1]?.trim(),
                    Visit: patient['Visit']? patient['Visit'] > 1 ? `Follow-up(${patient['Visit']})` : 'First': patient['followup'],
                    Address: patient.village,
                    Gender: patient.gender,
                    Consulted_via: "Telemedicine Portal",
                    name: patient.name,
                    age: patient.age,
                    phone: patient.telephone,
                    Bp: `${patient.BP_systolic}/${patient.BP_diastolic}`,
                    pulseRate: patient.heart_rate,
                    Spo2: patient.SPO2_value,
                    ECG: patient.ECG_Image ? "Yes" : "No",
                    pastHistory,
                    diagnosis,
                    advice,
                    specialRemark,
                    prescriptions,
                    behavior,
                    index,
                }
                console.log(data)
                addTextToPdf(data)
                console.log(index);
                axios
                    .post(`${ENDPOINT}/api/saveERX`, data)
                    .then((response) => {
                        console.log("success", response.data);
                        toast.success("ePrescription successfully generated!!")
                    })
                    .catch((error) => {
                        console.error('Error uploading file:', error);
                    });
            }
        }
        catch (err) {
            console.log("Error while submitting the rx", err)
            alert("something went wrong")
        }
    }

    const handleFileUpload = async (fileBlob, patientId, type) => {

        if (type === "prescription") {
            const file = new File([fileBlob], `${patientId}.pdf`, { type: 'application/pdf' });
            console.log("event-", file);
            setpresUploaded(file)
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('patientId', patientId);
            formData.append('index', index);

            axios
                .post(`${ENDPOINT}/api/presc_n_diagnosis`, formData)
                .then((response) => {
                    // alert('File uploaded successfully');
                    // getPatients();
                })
                .catch((error) => {
                    console.error('Error uploading file:', error);
                });
        }
        // else if (type === "diagnosis") {
        //     const inputValue = event.target.value;
        //     if (!inputValue) return;

        //     axios
        //         .post(`${ENDPOINT}/api/onlydiagnosis`, {
        //             patientId,
        //             diagnosis: inputValue,
        //         })
        //         .then((response) => {
        //             // alert('Diagnosis details saved successfully');
        //             // getPatients();
        //         })
        //         .catch((error) => {
        //             console.error('Error saving diagnosis:', error);
        //         });
        // }
    };

    return (
        <div className='colDetails'>
            <div className='colDetails-1'>
                {filteredKeys.map((dataKey, index) => {
                    return (
                        <div
                            key={index}
                            className={`colDetails-sub`}
                        >
                            <div style={{ fontWeight: 600 }} className='colDetails-sub-sub'>{dataKey}</div>
                            <div className='colDetails-sub-sub'>
                                {patient[dataKey] ? (patient[dataKey] === true ? 'Yes' : patient[dataKey]) : 'Nil'}
                            </div>
                        </div>
                    );
                })}
                <div className={`colDetails-sub`}>
                    <div style={{ fontWeight: 600 }} className='colDetails-sub-sub'>ECG</div>
                    <div className='colDetails-sub-sub'>
                        {patient.ECG_Image ? "Yes" : "No"}
                    </div>
                </div>
            </div>
            <div className='colDetails-2'>
                <div className='colDetails-2Head'>
                    <div>Details</div>
                    <div>Past History</div>
                </div>
                <div className='colDetails-2-sub'>
                    <div style={{ display: 'grid', justifyContent: 'center' }}>
                        <div className='key-value-out'>
                            <div>Date:</div>
                            <div>{patient['Last Visited']?.split(',')[0]
                            }</div>
                        </div>
                        <div className='key-value-out'>
                            <div>Time:</div>
                            <div>{patient['Last Visited']?.split(',')[1]?.trim()
                            }</div>
                        </div>
                        <div className='key-value-out'>
                            <div>⁠Visit :</div>
                            <div>{patient['Visit']? patient['Visit'] > 1 ? `Follow-up(${patient['Visit']})` : 'First': patient['followup']
                            }</div>
                        </div>
                        <div className='key-value-out'>
                            <div>⁠Dr name:</div>
                            <div>{patient.doctor}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', justifyContent: 'center' }}>
                        <textarea
                            type="text"
                            placeholder="Past History"
                            className="diagnosis-input"
                            value={pastHistory ? pastHistory : ""}
                            rows={5}
                            onChange={(e) => setPastHistory(e.target.value)}
                        />
                    </div>
                </div>
                <div className='colDetails-2Head'>
                    <div>Chief Complaint & Diagnosis</div>
                    <div>Advice</div>
                </div>
                <div className='colDetails-2-sub'>
                    <div style={{ display: 'grid', justifyContent: 'center' }}>
                        <textarea
                            type="text"
                            placeholder="Chief Complaint & Diagnosis"
                            className="diagnosis-input"
                            value={diagnosis ? diagnosis : ""}
                            rows={5}
                            onChange={(e) => setDiagnosis(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'grid', justifyContent: 'center' }}>
                        <textarea
                            type="text"
                            placeholder="Advice"
                            className="diagnosis-input"
                            value={advice ? advice : ""}
                            rows={5}
                            onChange={(e) => setAdvice(e.target.value)}
                        />
                    </div>
                </div>
                <div className='colDetails-2Head4'>
                    <div>Rx (Notation + salt + dosage + remark)</div>
                </div>
                <div className='colDetails-2-sub-c'>
                    <div className='behaviorbox'>
                        <PrescriptionCreator prescriptions={prescriptions} setPrescriptions={setPrescriptions} />
                    </div>
                </div>
                <div className='behaviorbox'>
                    <div>
                        <textarea
                            placeholder="Special Remark"
                            value={specialRemark ? specialRemark : ""}
                            style={{ height: '15px', width: '85%' }}
                            onChange={(e) => setSpecialRemark(e.target.value)}
                        />
                    </div>
                    {
                        patient.behavior ? (
                            <div className="behavior-dropdown" style={{ height: '15px', width: '55%' }}>
                                {patient.behavior}
                            </div>
                        ) :
                            <div style={{ display: 'grid', justifyContent: 'center' }}>
                                <select
                                    className="behavior-dropdown"
                                    defaultValue=""
                                    onChange={(event) => handleBehaviorChange(event)}
                                >
                                    <option value="" disabled>
                                        Behavior
                                    </option>
                                    <option value="Treated">Treated</option>
                                    <option value="Referred">Referred</option>
                                    <option value="Treated and Referred">Treated and Referred</option>
                                </select>
                            </div>
                    }
                </div>
                <button style={{ height: '20px', width: '100%', padding: '1px' }} type="submit" className="submit-btn2" onClick={handleGenerateBtn}>
                    Generate ePrescription
                </button>
                {/* <button style={{ height: '20px', width: '100%', padding: '1px' }} type="submit" className="submit-btn2">
                    Print ePrescription
                </button> */}
            </div>
        </div>
    )
}

export default ToggleBox
