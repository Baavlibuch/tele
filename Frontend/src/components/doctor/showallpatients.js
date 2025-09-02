import React, { useEffect, useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Typography, TextField, Button } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import * as Icon from 'react-feather';
import { ENDPOINT } from '../../config';
import toast from 'react-hot-toast';

function PatientList() {
    const [patients, setPatients] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        // --- STATIC DATA FOR DEMO ---
        const staticPatients = [
            {
                _id: "1",
                id: "P001",
                name: "Aarav Sharma",
                age: 28,
                gender: "Male",
                telephone: "9876543210",
                hospital: "AIIMS Jodhpur",
                doctor: "Dr. Rajesh Sharma",
                village: "Siner",
                symptoms: "Fever, cough",
                symptoms_Duration: "3 days",
                Visit: "Follow-up in 1 week",
                "Last Visited": "2025-08-20",
                Registered: "2025-08-18",
                latitude: "26.2389",
                longitude: "73.0243",
                BP_systolic: 120,
                BP_diastolic: 80,
                SPO2_value: 97,
                heart_rate: 75,
                prescription: "",
                pastHistory: "Nil",
                advice: "Hydration, rest",
                diagnosis: "Viral Fever",
                behavior: "Treated",
                chat: [{ statement: "Mild fever recorded" }]
            },
            {
                _id: "2",
                id: "P002",
                name: "Priya Nair",
                age: 34,
                gender: "Female",
                telephone: "9811122233",
                hospital: "Apollo",
                doctor: "Dr. Priya Patel",
                village: "Siner-Dharna",
                symptoms: "Severe headache",
                symptoms_Duration: "2 days",
                Visit: "Recheck after 1 month",
                "Last Visited": "2025-08-22",
                Registered: "2025-08-20",
                latitude: "26.2989",
                longitude: "73.0843",
                BP_systolic: 118,
                BP_diastolic: 76,
                SPO2_value: 99,
                heart_rate: 72,
                prescription: "",
                pastHistory: "Migraine",
                advice: "Pain medication",
                diagnosis: "Migraine",
                behavior: "Referred",
                chat: [{ statement: "Prescribed CT Scan" }]
            },
            {
                _id: "3",
                id: "P003",
                name: "Rohan Gupta",
                age: 45,
                gender: "Male",
                telephone: "9823345678",
                hospital: "Fortis",
                doctor: "Dr. Arun Reddy",
                village: "Siner-Baliyana",
                symptoms: "Chest pain",
                symptoms_Duration: "1 day",
                Visit: "Immediate cardiology referral",
                "Last Visited": "2025-08-25",
                Registered: "2025-08-24",
                latitude: "26.2580",
                longitude: "73.0500",
                BP_systolic: 150,
                BP_diastolic: 95,
                SPO2_value: 95,
                heart_rate: 88,
                prescription: "",
                pastHistory: "Hypertension",
                advice: "ECG advised",
                diagnosis: "Suspected angina",
                behavior: "Referred",
                chat: [{ statement: "Patient reported chest discomfort" }]
            },
            {
                _id: "4",
                id: "P004",
                name: "Ananya Singh",
                age: 22,
                gender: "Female",
                telephone: "9834567890",
                hospital: "ICMR",
                doctor: "Dr. Anjali Verma",
                village: "Siner-Gura",
                symptoms: "Sore throat, cough",
                symptoms_Duration: "4 days",
                Visit: "Follow-up after 5 days",
                "Last Visited": "2025-08-19",
                Registered: "2025-08-16",
                latitude: "26.2680",
                longitude: "73.0643",
                BP_systolic: 110,
                BP_diastolic: 70,
                SPO2_value: 99,
                heart_rate: 68,
                prescription: "",
                pastHistory: "Nil",
                advice: "Warm saline gargles",
                diagnosis: "Throat infection",
                behavior: "Treated",
                chat: [{ statement: "Prescribed antibiotics" }]
            },
            {
                _id: "5",
                id: "P005",
                name: "Karthik Reddy",
                age: 30,
                gender: "Male",
                telephone: "9845678901",
                hospital: "AIIMS Jodhpur",
                doctor: "Dr. Karthik Iyer",
                village: "Siner-thanmata Hinglaj",
                symptoms: "Shortness of breath",
                symptoms_Duration: "1 week",
                Visit: "Follow-up after 2 weeks",
                "Last Visited": "2025-08-27",
                Registered: "2025-08-25",
                latitude: "26.2900",
                longitude: "73.0800",
                BP_systolic: 130,
                BP_diastolic: 85,
                SPO2_value: 92,
                heart_rate: 98,
                prescription: "",
                pastHistory: "Asthma",
                advice: "Inhaler prescribed",
                diagnosis: "Asthma attack",
                behavior: "Treated",
                chat: [{ statement: "Patient advised regular inhaler use" }]
            },
            {
                _id: "6",
                id: "P006",
                name: "Meera Kapoor",
                age: 38,
                gender: "Female",
                telephone: "9856789012",
                hospital: "Apollo",
                doctor: "Dr. Neha Kapoor",
                village: "Siner",
                symptoms: "Abdominal pain",
                symptoms_Duration: "2 days",
                Visit: "Ultrasound advised",
                "Last Visited": "2025-08-23",
                Registered: "2025-08-21",
                latitude: "26.2760",
                longitude: "73.0743",
                BP_systolic: 115,
                BP_diastolic: 75,
                SPO2_value: 97,
                heart_rate: 80,
                prescription: "",
                pastHistory: "Nil",
                advice: "Pain relief",
                diagnosis: "Gastritis",
                behavior: "Treated",
                chat: [{ statement: "Ultrasound scheduled" }]
            },
            {
                _id: "7",
                id: "P007",
                name: "Vikram Singh",
                age: 52,
                gender: "Male",
                telephone: "9867890123",
                hospital: "Fortis",
                doctor: "Dr. Vikram Singh",
                village: "Siner-Dharna",
                symptoms: "Joint pain",
                symptoms_Duration: "6 months",
                Visit: "Monthly follow-up",
                "Last Visited": "2025-08-15",
                Registered: "2025-08-10",
                latitude: "26.2480",
                longitude: "73.0443",
                BP_systolic: 135,
                BP_diastolic: 90,
                SPO2_value: 98,
                heart_rate: 76,
                prescription: "",
                pastHistory: "Arthritis",
                advice: "Physiotherapy",
                diagnosis: "Osteoarthritis",
                behavior: "Treated",
                chat: [{ statement: "Prescribed joint supplements" }]
            },
            {
                _id: "8",
                id: "P008",
                name: "Neha Joshi",
                age: 29,
                gender: "Female",
                telephone: "9871112233",
                hospital: "ICMR",
                doctor: "Dr. Meera Menon",
                village: "Siner-Baliyana",
                symptoms: "Fatigue, weight loss",
                symptoms_Duration: "3 weeks",
                Visit: "Blood tests advised",
                "Last Visited": "2025-08-26",
                Registered: "2025-08-22",
                latitude: "26.2523",
                longitude: "73.0489",
                BP_systolic: 110,
                BP_diastolic: 70,
                SPO2_value: 99,
                heart_rate: 74,
                prescription: "",
                pastHistory: "Nil",
                advice: "Balanced diet",
                diagnosis: "Suspected anemia",
                behavior: "Referred",
                chat: [{ statement: "Lab tests scheduled" }]
            },
            {
                _id: "9",
                id: "P009",
                name: "Amit Joshi",
                age: 40,
                gender: "Male",
                telephone: "9845567890",
                hospital: "Fortis",
                doctor: "Dr. Amit Joshi",
                village: "Siner",
                symptoms: "High blood pressure",
                symptoms_Duration: "2 years",
                Visit: "Quarterly follow-up",
                "Last Visited": "2025-08-12",
                Registered: "2025-08-10",
                latitude: "26.2599",
                longitude: "73.0688",
                BP_systolic: 148,
                BP_diastolic: 95,
                SPO2_value: 97,
                heart_rate: 79,
                prescription: "Amlodipine",
                pastHistory: "Hypertension",
                advice: "Regular exercise",
                diagnosis: "Hypertension",
                behavior: "Under observation",
                chat: [{ statement: "Medication dosage adjusted" }]
            },
            {
                _id: "10",
                id: "P010",
                name: "Sneha Kapoor",
                age: 25,
                gender: "Female",
                telephone: "9822223344",
                hospital: "Apollo",
                doctor: "Dr. Priya Verma",
                village: "Siner-thanmata Hinglaj",
                symptoms: "Irregular periods",
                symptoms_Duration: "5 months",
                Visit: "Gynecology follow-up",
                "Last Visited": "2025-08-17",
                Registered: "2025-08-15",
                latitude: "26.2685",
                longitude: "73.0711",
                BP_systolic: 112,
                BP_diastolic: 74,
                SPO2_value: 99,
                heart_rate: 70,
                prescription: "",
                pastHistory: "Nil",
                advice: "Lifestyle modification",
                diagnosis: "PCOS",
                behavior: "Referred",
                chat: [{ statement: "Ultrasound and hormone tests advised" }]
            },
            {
                _id: "11",
                id: "P011",
                name: "Rajesh Kumar",
                age: 55,
                gender: "Male",
                telephone: "9812233445",
                hospital: "AIIMS Jodhpur",
                doctor: "Dr. Rajesh Kumar",
                village: "Siner-Gura",
                symptoms: "Vision problems",
                symptoms_Duration: "1 year",
                Visit: "Ophthalmology referral",
                "Last Visited": "2025-08-20",
                Registered: "2025-08-14",
                latitude: "26.2444",
                longitude: "73.0599",
                BP_systolic: 125,
                BP_diastolic: 82,
                SPO2_value: 98,
                heart_rate: 72,
                prescription: "",
                pastHistory: "Diabetes",
                advice: "Eye examination",
                diagnosis: "Diabetic retinopathy",
                behavior: "Referred",
                chat: [{ statement: "Patient referred to eye specialist" }]
            },
            {
                _id: "12",
                id: "P012",
                name: "Mohit Shukla",
                age: 36,
                gender: "Male",
                telephone: "9873334455",
                hospital: "ICMR",
                doctor: "Dr. Mohit Shukla",
                village: "Siner-Dharna",
                symptoms: "Persistent cough",
                symptoms_Duration: "2 weeks",
                Visit: "X-ray chest advised",
                "Last Visited": "2025-08-28",
                Registered: "2025-08-26",
                latitude: "26.2711",
                longitude: "73.0412",
                BP_systolic: 118,
                BP_diastolic: 78,
                SPO2_value: 96,
                heart_rate: 81,
                prescription: "",
                pastHistory: "Nil",
                advice: "Avoid smoking",
                diagnosis: "Bronchitis",
                behavior: "Under observation",
                chat: [{ statement: "Chest x-ray scheduled" }]
            },
            {
                _id: "13",
                id: "P013",
                name: "Rohit Kumar",
                age: 36,
                gender: "Male",
                telephone: "9867543201",
                hospital: "ICMR",
                doctor: "Dr. Rajesh Kumar",
                village: "Siner-Baliyana",
                symptoms: "Back pain",
                symptoms_Duration: "2 months",
                Visit: "MRI advised",
                "Last Visited": "2025-08-20",
                Registered: "2025-08-19",
                latitude: "26.2766",
                longitude: "73.0749",
                BP_systolic: 120,
                BP_diastolic: 78,
                SPO2_value: 97,
                heart_rate: 77,
                prescription: "",
                pastHistory: "Desk job, sedentary lifestyle",
                advice: "Physiotherapy",
                diagnosis: "Lumbar spondylosis",
                behavior: "Chronic",
                chat: [{ statement: "MRI scheduled" }]
              },
              {
                _id: "14",
                id: "P014",
                name: "Priya Singh",
                age: 31,
                gender: "Female",
                telephone: "9821345678",
                hospital: "Apollo",
                doctor: "Dr. Priya Verma",
                village: "Siner-Gura",
                symptoms: "Dizziness",
                symptoms_Duration: "3 days",
                Visit: "Blood sugar test advised",
                "Last Visited": "2025-08-25",
                Registered: "2025-08-23",
                latitude: "26.2762",
                longitude: "73.0741",
                BP_systolic: 110,
                BP_diastolic: 68,
                SPO2_value: 98,
                heart_rate: 82,
                prescription: "",
                pastHistory: "Nil",
                advice: "Hydration, medication",
                diagnosis: "Hypoglycemia",
                behavior: "Treated",
                chat: [{ statement: "Test result awaited" }]
              },
              {
                _id: "15",
                id: "P015",
                name: "Karan Mehta",
                age: 54,
                gender: "Male",
                telephone: "9812456780",
                hospital: "AIIMS Jodhpur",
                doctor: "Dr. Mohit Shukla",
                village: "Siner-thanmata Hinglaj",
                symptoms: "Swelling in feet",
                symptoms_Duration: "2 weeks",
                Visit: "Kidney function test advised",
                "Last Visited": "2025-08-21",
                Registered: "2025-08-20",
                latitude: "26.2748",
                longitude: "73.0730",
                BP_systolic: 135,
                BP_diastolic: 88,
                SPO2_value: 96,
                heart_rate: 84,
                prescription: "",
                pastHistory: "Diabetes",
                advice: "Low salt diet",
                diagnosis: "Nephropathy",
                behavior: "Chronic",
                chat: [{ statement: "Tests pending" }]
              },
              {
                _id: "16",
                id: "P016",
                name: "Deepa Iyer",
                age: 39,
                gender: "Female",
                telephone: "9821346790",
                hospital: "Fortis",
                doctor: "Dr. Karthik Iyer",
                village: "Siner",
                symptoms: "Throat pain",
                symptoms_Duration: "1 week",
                Visit: "Throat swab taken",
                "Last Visited": "2025-08-22",
                Registered: "2025-08-21",
                latitude: "26.2763",
                longitude: "73.0747",
                BP_systolic: 118,
                BP_diastolic: 76,
                SPO2_value: 97,
                heart_rate: 79,
                prescription: "",
                pastHistory: "Nil",
                advice: "Warm saline gargles",
                diagnosis: "Tonsillitis",
                behavior: "Treated",
                chat: [{ statement: "Culture report awaited" }]
              },
              {
                _id: "17",
                id: "P017",
                name: "Rajiv Menon",
                age: 46,
                gender: "Male",
                telephone: "9876541209",
                hospital: "Apollo",
                doctor: "Dr. Meera Menon",
                village: "Siner-Dharna",
                symptoms: "Frequent urination",
                symptoms_Duration: "3 months",
                Visit: "Blood sugar test advised",
                "Last Visited": "2025-08-24",
                Registered: "2025-08-22",
                latitude: "26.2759",
                longitude: "73.0740",
                BP_systolic: 125,
                BP_diastolic: 82,
                SPO2_value: 98,
                heart_rate: 81,
                prescription: "",
                pastHistory: "Family history of diabetes",
                advice: "Low sugar diet",
                diagnosis: "Type 2 Diabetes",
                behavior: "Chronic",
                chat: [{ statement: "Follow-up in 10 days" }]
              },
              {
                _id: "18",
                id: "P018",
                name: "Ankita Kapoor",
                age: 28,
                gender: "Female",
                telephone: "9812346755",
                hospital: "ICMR",
                doctor: "Dr. Neha Kapoor",
                village: "Siner-Baliyana",
                symptoms: "Eye redness",
                symptoms_Duration: "5 days",
                Visit: "Eye drops prescribed",
                "Last Visited": "2025-08-26",
                Registered: "2025-08-24",
                latitude: "26.2764",
                longitude: "73.0744",
                BP_systolic: 114,
                BP_diastolic: 72,
                SPO2_value: 99,
                heart_rate: 78,
                prescription: "",
                pastHistory: "Nil",
                advice: "Avoid dust exposure",
                diagnosis: "Conjunctivitis",
                behavior: "Treated",
                chat: [{ statement: "Improving with medication" }]
              },
              {
                _id: "19",
                id: "P019",
                name: "Vinod Reddy",
                age: 50,
                gender: "Male",
                telephone: "9821345781",
                hospital: "Apollo",
                doctor: "Dr. Arun Reddy",
                village: "Siner-Gura",
                symptoms: "Persistent cough",
                symptoms_Duration: "1 month",
                Visit: "Chest X-ray advised",
                "Last Visited": "2025-08-19",
                Registered: "2025-08-18",
                latitude: "26.2767",
                longitude: "73.0751",
                BP_systolic: 132,
                BP_diastolic: 86,
                SPO2_value: 94,
                heart_rate: 87,
                prescription: "",
                pastHistory: "Smoker",
                advice: "Quit smoking",
                diagnosis: "Bronchitis",
                behavior: "Under observation",
                chat: [{ statement: "Awaiting X-ray results" }]
              },
              {
                _id: "20",
                id: "P020",
                name: "Lakshmi Verma",
                age: 42,
                gender: "Female",
                telephone: "9812765432",
                hospital: "Fortis",
                doctor: "Dr. Anjali Verma",
                village: "Siner-thanmata Hinglaj",
                symptoms: "Palpitations",
                symptoms_Duration: "2 weeks",
                Visit: "ECG done",
                "Last Visited": "2025-08-25",
                Registered: "2025-08-23",
                latitude: "26.2745",
                longitude: "73.0734",
                BP_systolic: 138,
                BP_diastolic: 88,
                SPO2_value: 97,
                heart_rate: 110,
                prescription: "",
                pastHistory: "Nil",
                advice: "Avoid caffeine",
                diagnosis: "Arrhythmia",
                behavior: "Critical",
                chat: [{ statement: "Cardiology referral" }]
              },
              {
                _id: "21",
                id: "P021",
                name: "Arjun Patel",
                age: 33,
                gender: "Male",
                telephone: "9821345699",
                hospital: "AIIMS Jodhpur",
                doctor: "Dr. Priya Patel",
                village: "Siner",
                symptoms: "High fever",
                symptoms_Duration: "3 days",
                Visit: "Malaria test ordered",
                "Last Visited": "2025-08-22",
                Registered: "2025-08-20",
                latitude: "26.2769",
                longitude: "73.0756",
                BP_systolic: 118,
                BP_diastolic: 74,
                SPO2_value: 96,
                heart_rate: 92,
                prescription: "",
                pastHistory: "Nil",
                advice: "Hydration, rest",
                diagnosis: "Suspected malaria",
                behavior: "Under observation",
                chat: [{ statement: "Test results awaited" }]
              },
              {
                _id: "22",
                id: "P022",
                name: "Sneha Sharma",
                age: 25,
                gender: "Female",
                telephone: "9876543120",
                hospital: "ICMR",
                doctor: "Dr. Rajesh Sharma",
                village: "Siner-Dharna",
                symptoms: "Abnormal bleeding",
                symptoms_Duration: "2 weeks",
                Visit: "Ultrasound advised",
                "Last Visited": "2025-08-23",
                Registered: "2025-08-21",
                latitude: "26.2753",
                longitude: "73.0736",
                BP_systolic: 112,
                BP_diastolic: 70,
                SPO2_value: 98,
                heart_rate: 76,
                prescription: "",
                pastHistory: "Nil",
                advice: "Gynecology referral",
                diagnosis: "PCOS",
                behavior: "Chronic",
                chat: [{ statement: "Awaiting scan report" }]
              },
              {
                _id: "23",
                id: "P023",
                name: "Sameer Naidu",
                age: 48,
                gender: "Male",
                telephone: "9856123478",
                hospital: "Fortis",
                doctor: "Dr. Sunita Naidu",
                village: "Siner-Gura",
                symptoms: "Ear pain",
                symptoms_Duration: "6 days",
                Visit: "ENT referral",
                "Last Visited": "2025-08-26",
                Registered: "2025-08-24",
                latitude: "26.2761",
                longitude: "73.0743",
                BP_systolic: 116,
                BP_diastolic: 74,
                SPO2_value: 98,
                heart_rate: 82,
                prescription: "",
                pastHistory: "Nil",
                advice: "Antibiotics",
                diagnosis: "Otitis media",
                behavior: "Treated",
                chat: [{ statement: "Ear drops prescribed" }]
              }
            // 👉 Continue adding more patients here
        ];
    
        setPatients(staticPatients);
        setFilteredPatients(staticPatients);
    
        // Keep API dormant but available
        // axios.get('/api/patient-listexcel')
        //     .then((response) => {
        //         setPatients(response.data.patients);
        //         setFilteredPatients(response.data.patients);
        //     })
        //     .catch((err) => console.log(err));
    }, []);

    const toggleRow = (patientId) => {
        setExpandedRows(prevState => ({
            ...prevState,
            [patientId]: !prevState[patientId]
        }));
    };

    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        setFilteredPatients(
            patients.filter((patient) =>
                Object.values(patient).some((value) =>
                    typeof value === 'string'
                        ? value.toLowerCase().includes(query)
                        : value && value.toString().toLowerCase().includes(query)
                )
            )
        );
    };

    const getPatients = () => {
        axios
            .get(ENDPOINT + '/api/patient-list')
            .then((response) => {
                setPatients(response.data.patients);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleFileUpload = (event, patientId, type) => {
        if (type === "prescription") {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('patientId', patientId);

            axios
                .post(`${ENDPOINT}/api/presc_n_diagnosis`, formData)
                .then(() => {
                    alert('File uploaded successfully');
                    getPatients();
                })
                .catch((error) => {
                    console.error('Error uploading file:', error);
                });
        } else if (type === "diagnosis") {
            const inputValue = event.target.value;
            if (!inputValue) return;

            axios
                .post(`${ENDPOINT}/api/onlydiagnosis`, {
                    patientId,
                    diagnosis: inputValue,
                })
                .then(() => {
                    toast.success("Diagnosis details saved successfully");
                    getPatients();
                })
                .catch((error) => {
                    console.error('Error saving diagnosis:', error);
                });
        }
    };

    const handleBehaviorChange = (event, patientId) => {
        const selectedBehavior = event.target.value;

        axios
            .post(`${ENDPOINT}/api/save-behavior`, {
                patientId,
                behavior: selectedBehavior,
            })
            .then(() => {
                alert('Behavior saved successfully');
                getPatients();
            })
            .catch((error) => {
                console.error('Error saving behavior:', error);
            });
    };

    const handleGeneratePrescription = async (patient) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([600, 600]); // slightly bigger page
            const { height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
            // Header
            page.drawText("AIIMS Jodhpur - e-Prescription", {
                x: 50,
                y: height - 50,
                size: 16,
                font,
                color: rgb(0, 0, 0)
            });
    
            // Horizontal line
            page.drawLine({
                start: { x: 50, y: height - 60 },
                end: { x: 550, y: height - 60 },
                thickness: 1,
                color: rgb(0, 0, 0)
            });
    
            // Patient info
            let y = height - 80;
            const lineGap = 18;
            const fields = [
                `Patient ID: ${patient.id || "Nil"}`,
                `Name: ${patient.name || "Nil"}`,
                `Age: ${patient.age || "Nil"}`,
                `Gender: ${patient.gender || "Nil"}`,
                `Doctor: ${patient.doctor || "Nil"}`,
                `Hospital: ${patient.hospital || "Nil"}`,
                `Last Visit: ${patient["Last Visited"] || "Nil"}`,
                `Diagnosis: ${patient.diagnosis || "Not specified"}`,
                `Prescription: ${patient.prescription || "Not specified"}`,
                `Advice: ${patient.advice || "Not specified"}`,
                `Behavior / Follow-up: ${patient.behavior || "Not specified"}`
            ];
    
            fields.forEach((text) => {
                page.drawText(text, { x: 50, y, size: 12, font });
                y -= lineGap;
            });
    
            // Footer
            page.drawLine({
                start: { x: 50, y: y - 10 },
                end: { x: 250, y: y - 10 },
                thickness: 1,
                color: rgb(0, 0, 0)
            });
            page.drawText("Doctor's Signature", { x: 50, y: y - 25, size: 12, font });
            page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 400, y: y - 25, size: 12, font });
    
            // Save and download PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Prescription_${patient.name}.pdf`;
            link.click();
        } catch (err) {
            console.error("Error generating PDF:", err);
            toast.error("Failed to generate PDF");
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Search Patients"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ marginRight: '10px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setSearchQuery('')}
                >
                    Clear Search
                </Button>
            </div>

            <Typography variant="h6">
                Total Findings: {filteredPatients.length}
            </Typography>

            <TableContainer component={Paper} style={{ height: "75vh", width: "100%", overflowX: "auto", overflowY: "auto" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Telephone</TableCell>
                            <TableCell>Hospital</TableCell>
                            <TableCell>Doctor</TableCell>
                            <TableCell>Village</TableCell>
                            <TableCell>Symptoms</TableCell>
                            <TableCell>Symptoms Duration</TableCell>
                            <TableCell>Follow-up</TableCell>
                            <TableCell>Last Visited</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell>Latitude</TableCell>
                            <TableCell>Longitude</TableCell>
                            <TableCell>BP Systolic</TableCell>
                            <TableCell>BP Diastolic</TableCell>
                            <TableCell>SPO2</TableCell>
                            <TableCell>Heart Rate</TableCell>
                            <TableCell>Prescription</TableCell>
                            <TableCell>Past History</TableCell>
                            <TableCell>Advice</TableCell>
                            <TableCell>Diagnosis</TableCell>
                            <TableCell>Behavior</TableCell>
                            <TableCell>Chat History</TableCell>
                            <TableCell>Generate PDF</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPatients.map((patient) => (
                            <React.Fragment key={patient._id}>
                                <TableRow>
                                    <TableCell>{patient.id || patient._id || "Nil"}</TableCell>
                                    <TableCell>{patient.name || "Nil"}</TableCell>
                                    <TableCell>{patient.age || "Nil"}</TableCell>
                                    <TableCell>{patient.gender || "Nil"}</TableCell>
                                    <TableCell>{patient.telephone || "Nil"}</TableCell>
                                    <TableCell>{patient.hospital || "Nil"}</TableCell>
                                    <TableCell>{patient.doctor || "Nil"}</TableCell>
                                    <TableCell>{patient.village || "Nil"}</TableCell>
                                    <TableCell>{patient.symptoms || "Nil"}</TableCell>
                                    <TableCell>{patient.symptoms_Duration || "Nil"}</TableCell>
                                    <TableCell>{patient.Visit || "Nil"}</TableCell>
                                    <TableCell>{patient["Last Visited"] || "Nil"}</TableCell>
                                    <TableCell>{patient.Registered || "Nil"}</TableCell>
                                    <TableCell>{patient.latitude || "Nil"}</TableCell>
                                    <TableCell>{patient.longitude || "Nil"}</TableCell>
                                    <TableCell>{patient.BP_systolic || "Nil"}</TableCell>
                                    <TableCell>{patient.BP_diastolic || "Nil"}</TableCell>
                                    <TableCell>{patient.SPO2_value || "Nil"}</TableCell>
                                    <TableCell>{patient.heart_rate || "Nil"}</TableCell>

                                    {/* Prescription cell */}
                                    <TableCell>
                                        {patient.prescription ? (
                                            <a href={patient.prescription} target="_blank" rel="noopener noreferrer" className="view-link">
                                                View Prescription
                                            </a>
                                        ) : "Nil"}
                                    </TableCell>

                                    <TableCell>{patient.pastHistory || "Nil"}</TableCell>
                                    <TableCell>{patient.advice || "Nil"}</TableCell>
                                    <TableCell>{patient.diagnosis || "Nil"}</TableCell>
                                    <TableCell>{patient.behavior || "Nil"}</TableCell>

                                    {/* Chat History toggle */}
                                    <TableCell>
                                        <IconButton onClick={() => toggleRow(patient._id)}>
                                            {expandedRows[patient._id] ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </TableCell>

                                    {/* Generate PDF button */}
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleGeneratePrescription(patient)}
                                        >
                                            Generate PDF
                                        </Button>
                                    </TableCell>
                                </TableRow>

                                {/* Collapsible Chat History */}
                                <TableRow>
                                    <TableCell colSpan={26}>
                                        <Collapse in={expandedRows[patient._id]} timeout="auto" unmountOnExit>
                                            <Typography variant="subtitle1">Chat History</Typography>
                                            {patient.chat.map((msg, index) => (
                                                <Typography key={index} style={{ marginBottom: '8px' }}>
                                                    {msg.statement}
                                                </Typography>
                                            ))}
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default PatientList;