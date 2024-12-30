import React from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PdfEditor = () => {
    const addTextToPdf = async () => {

        const data = {
            patient_Id: "12345",
            date: "2024-12-30",
            time: "10:30 AM",
            Visit: "First",
            Address: "Village X",
            Gender: "Male",
            Consulted_via: "Telemedicine Portal",
            name: "John Doe",
            age: "30",
            phone: "1234567890",
            Bp: "120/80",
            pulseRate: "72",
            Spo2: "98%",
            ECG: "Yes",
            pastHistory: "No major illnesses",
            diagnosis: "Common Cold lasdfj saldf lsdkfiwn sdsod sovsdnsovnsn sjf0wnsovnosv ",
            advice: "Rest and Hydration sdjfl sldjf lsdf ljsd flsdf ;adsfl as;dlfjsadfasfasdfsdfsdsdf sldfj ;sdf",
            specialRemark: "None asldfj saldfn sdflksdl;asd s;dfn s",
            prescriptions: [
                {
                    notation: "Tab.",
                    salt: "Paracetamol",
                    dosage: "OD",
                    remark: "Take after meals",
                },
                {
                    notation: "Tab.",
                    salt: "Ibuprofen",
                    dosage: "OD",
                    remark: "Twice a day with water",
                },
            ],
            behavior: "Cooperative",
            doctorName: "sadfk Himalaya",
            degree: "M.B.B.S.",
            registrationNo: "12093102",
            Signature: "Himalaya",
        };
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

        // Utility function to split text into multiple lines
        function splitTextIntoLines(text, maxWidth, font, fontSize) {
            const words = text.split(' ');
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

        const textWidth = helveticaFont.widthOfTextAtSize(data.doctorName, fontSize);
        const rightEdgeX = 372;
        const startX = rightEdgeX - textWidth;
        firstPage.drawText(`${data.doctorName}`, { x: startX, y: 509, size: fontSize, font: helveticaBoldFont, color: rgb(0, 0, 0) });
        const textWidth2 = helveticaFont.widthOfTextAtSize(data.degree, fontSize);
        const startX2 = rightEdgeX - textWidth2 + 1;
        firstPage.drawText(`${data.degree}`, { x: startX2, y: 499, size: fontSize, font: helveticaBoldFont, color: rgb(0, 0, 0) });
        const textWidth3 = helveticaFont.widthOfTextAtSize(`Registration Number: ${data.registrationNo} `, fontSize);
        const startX3 = rightEdgeX - textWidth3;
        firstPage.drawText(`Registration Number: ${data.registrationNo}`, { x: startX3, y: 489, size: fontSize, font: helveticaBoldFont, color: rgb(0, 0, 0) });

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
            const text = `${prescription.notation}   ${prescription.salt}   -   ${prescription.dosage}   (${prescription.remark})`;
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
        let yPosition3 = startYp-5; // Starting y position for the advice text

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
        const imageBytes = await fetch('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR04WZpg_mIE3N2buNx9ADMxt-EO7M4nAt0g&s').then((res) => res.arrayBuffer());
        const signatureImage = await pdfDoc.embedPng(imageBytes);
        const { width, height } = signatureImage.size();
        firstPage.drawImage(signatureImage, {
            x: 320,
            y: 76,
            width: 60, // You can adjust the size of the image
            height: (height / width) * 60, // Maintain aspect ratio
          });
        

        // Save the PDF
        const pdfBytes = await pdfDoc.save();

        // Download the modified PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${data.patient_Id}`;
        link.click();
    };

    return (
        <div>
            <h1>PDF Editor</h1>
            <button onClick={addTextToPdf}>Fill Prescription</button>
        </div>
    );
};

export default PdfEditor;
