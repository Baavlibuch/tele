import React, { useState } from "react";

const PrescriptionCreator = ({prescriptions, setPrescriptions}) => {

    const handleRxChange = (id, field, value) => {
        setPrescriptions((prev) =>
            prev.map((rx) => (rx.id === id ? { ...rx, [field]: value } : rx))
        );
    };

    const addPrescription = () => {
        setPrescriptions((prev) => [
            ...prev,
            { id: Date.now(), notation: "", saltName: "", dosage: "", remarks: "" },
        ]);
    };
    const notations = [
        "Inh.", "Tab.", "Cap.", "Oint.", "Syp.", "E/d", "N/d", "Sach.",
    ];

    const saltNames = [
        "Acebrophylline 100mg", "Ambroxol", "Amlodipine 5mg", "Amoxiclave 625mg",
        "Antacid", "Azirthromycine", "Azirthromycine 500mg",
        "Baclomethason + Neomycin + Clotrimazole", "Calcium 500mg & Vit. D3",
        "Cefixime 200mg", "Ciprofloxacin + prednisolone", "Ciprofloxacine",
        "Deriphylline 150mg", "Dextrometharphan", "Diacyclomine 100mg",
        "Diclofenac gel", "Furosemide 40mg", "Gliclazide + Metformine",
        "Idodine povidine", "Iron Folic Acid", "Itraconazole 100 mg",
        "Ketoconazole", "Levocetrizine 5mg", "Levofloxacine 500mg",
        "Mefenemic acid + dicyclomine", "Mefenemic acid + paracetamole",
        "Metformine + Glimepride (500mg/2gm)", "Metformine + Glimepride (500mg/1gm)",
        "Metformine + Glimepride (500mg/3gm)", "Metformine 500mg",
        "Metronidazole", "Montelukast + levocitrizine", "Multivitamine",
        "Naproxen 500mg", "Normal saline", "Ofloxacine 500mg", "Omeprazole 20mg",
        "Ornidazole 200mg", "ORS", "Pantopr̥azole 40mg", "Paracetamole",
        "Paracetamole + diclofenac", "Paracetamole + ibuprofen",
        "Paracetamole 500mg", "Ranitidine 90mg", "Salbutamol",
        "Telmisartan 40mg", "Tobramycine", "Voglibose", "Xylometazoline",
        "Prednisolon 5mg",
    ];

    const dosages = ["OD", "BD", "TDS", "SOS", "HS"];

    return (
        <div style={{ display: "grid", justifyContent: "center", gap: "0.5px" }}>
            {prescriptions.map((rx, index) => (
                <div
                    key={rx.id}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "15% 40% 10% 30% 5%",
                        alignItems: "center",
                        padding: "1px",
                    }}
                >
                    <div>
                        <input
                            className="input-rx"
                            list={`notations-${rx.id}`}
                            value={rx.notation}
                            onChange={(e) =>
                                handleRxChange(rx.id, "notation", e.target.value)
                            }
                        />
                        <datalist id={`notations-${rx.id}`}>
                            {notations.map((notation) => (
                                <option key={notation} value={notation} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <input
                            className="input-rx"
                            list={`saltNames-${rx.id}`}
                            value={rx.saltName}
                            onChange={(e) =>
                                handleRxChange(rx.id, "saltName", e.target.value)
                            }
                            style={{marginLeft:'4px'}}
                        />
                        <datalist id={`saltNames-${rx.id}`}>
                            {saltNames.map((salt) => (
                                <option key={salt} value={salt} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <input
                            className="input-rx"
                            list={`dosages-${rx.id}`}
                            // placeholder="Dosage"
                            value={rx.dosage}
                            onChange={(e) =>
                                handleRxChange(rx.id, "dosage", e.target.value)
                            }
                            style={{marginLeft:'0.5px'}}
                        />
                        <datalist id={`dosages-${rx.id}`}>
                            {dosages.map((dosage) => (
                                <option key={dosage} value={dosage} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <textarea
                            placeholder="Remark"
                            value={rx.remarks}
                            onChange={(e) =>
                                handleRxChange(rx.id, "remarks", e.target.value)
                            }
                            style={{height: '15px', width: '85%', marginLeft: '6px' }}
                        />
                    </div>
                    {index === prescriptions.length - 1 && (
                        <button style={{ padding: '2px', width: '20px', marginLeft: '-3px' }} type="button" onClick={addPrescription}>
                            +
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PrescriptionCreator;
