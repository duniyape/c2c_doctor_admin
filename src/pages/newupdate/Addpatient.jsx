import React, { useState, useMemo, useEffect } from 'react';
import Reciept from './Reciept';
import { pdf } from '@react-pdf/renderer';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router';
import useApi from '../../api/useApi';
import Cookies from 'js-cookie';
 const API_BASE_URL_TO = import.meta.env.VITE_API_URL;
const Addpatient = () => {
    const { postData } = useApi();
    // ... (Your existing state declarations remain the same)
    const [view, setView] = useState('add');
    const [patients, setPatients] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [MobileNumber, setMobileNumber] = useState('');
    const [fatherName, setfatherName] = useState('');
    const [amount, setAmount] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBreakupModalOpen, setIsBreakupModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Helper function to convert number to words (Indian currency format)
    const numberToWords = (num) => {
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const number = parseFloat(num).toFixed(2);
        const [integerPart] = number.split('.');

        if (parseInt(integerPart) === 0) return 'Zero';

        const inWords = (n) => {
            let str = '';
            if (n > 99) {
                str += a[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n > 19) {
                str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
            } else {
                str += a[n];
            }
            return str.trim();
        };

        let result = '';
        const numToConvert = parseInt(integerPart);
        result += inWords(numToConvert % 1000);

        if (numToConvert > 999) {
             const thousands = Math.floor(numToConvert / 1000) % 100;
             if (thousands > 0) result = inWords(thousands) + ' Thousand ' + result;
        }
        if (numToConvert > 99999) {
             const lakhs = Math.floor(numToConvert / 100000) % 100;
             if (lakhs > 0) result = inWords(lakhs) + ' Lakh ' + result;
        }

        return `Rupees ${result.trim()} Only`;
    };

    // ... (Your other functions like formatReceptionNumber, handleSubmit, etc., remain the same)
    const formatReceptionNumber = (num) => `R${String(num).padStart(3, '0')}`;
    const nextReceptionNumber = formatReceptionNumber(patients.length + 1);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!patientName.trim()|| !fatherName.trim()  || !age || !sex ||!MobileNumber ) {
            alert('Please fill in all fields.');
            return;
        }
        // const newPatient = {
        //     id: nextReceptionNumber,
        //     name: patientName.trim(),
        //     amount: parseFloat(amount).toFixed(2),
        //     age,
        //     sex,
        //     date,
        //     fatherName: fatherName.trim(),
        //     whatsappNumber: MobileNumber
        // };
        

        const newPatient = {
        'patient_name': patientName.trim(),
        'guardian_name': fatherName.trim(),
        'date_of_appointment': moment().format("YYYY-MM-DD"),
        'time_slot': "10:00 AM - 11:00 AM",
        'doctor_phone_id':Cookies.get('user'),
        'email' : "none",
        'symptoms' : "none",
        'age' : age,
        'sex': sex,
        'timestamp' : moment().unix(),
        'whatsapp_number' : '91'+(MobileNumber).toString(),
        'date_of_birth' : "none",
        'city' : "none",
        'address' : "none",
        'role':'appointment',
        'status':'created',
        "createdAt": 'x',
        "vaccine":"No"
            }
        setPatients([...patients, newPatient]);
        postdecription(newPatient)

        setPatientName('');
        setfatherName('')
        setMobileNumber('')
        setAmount('');
        setAge('');
        setSex('');
        setDate(new Date().toISOString().split('T')[0]);
        setView('list');
    };

    const filteredPatients = useMemo(
        () =>
            patients.filter((patient) =>
                patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [patients, searchTerm]
    );

    const handleShowBreakup = (patient) => {
        setSelectedPatient(patient);
        setIsBreakupModalOpen(true);
    };
    const handleCloseBreakupModal = () => {
        setIsBreakupModalOpen(false);
        setSelectedPatient(null);
    };

    const handleShowReceipt = (patient) => {
        setSelectedPatient(patient);
        setIsReceiptModalOpen(true);
    };
    const handleCloseReceiptModal = () => {
        setIsReceiptModalOpen(false);
        setSelectedPatient(null);
    };

    const handlePrint = () => {
        window.print();
    };

    const styles = `
        /* --- All your existing styles from the top remain here --- */
        .patient-manager-container {
            max-width: 100%; margin: 12px auto; background: #fff;
            padding: 15px; border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .pm-title { text-align: center; color: #1c1e21; padding-bottom: 15px; margin-top: 0; font-size: 1.4rem; }
        .pm-nav-container { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #f0f2f5; padding-bottom: 10px; }
        .pm-nav-button { flex: 1; min-width: 120px; padding: 10px; font-size: 15px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; background: #e9ecef; color: #495057; }
        .pm-nav-button.active { background: #007bff; color: #fff; }
        .pm-form { display: flex; flex-direction: column; gap: 15px; }
        .pm-form-group { display: flex; flex-direction: column; width: 100%; }
        .pm-form-row { display: flex; flex-direction: column; gap: 15px; }
        .pm-label { font-weight: 600; margin-bottom: 5px; }
        .pm-input, .pm-select {
            width: 100%; padding: 10px;
            border: 1px solid #ddd; border-radius: 6px;
            box-sizing: border-box; font-size: 15px;
        }
        .pm-input.read-only { background: #f1f3f5; font-weight: bold; }
        .pm-submit-button { width: 100%; padding: 12px; background: #007bff; color: #fff; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        
        /* Table Styles */
        .pm-table-wrapper { width: 100%; overflow-x: auto; }
        .pm-table { width: 100%; border-collapse: collapse; }
        .pm-table thead { display: none; }
        .pm-table tr {
            display: block; border: 2px solid #dee2e6;
            border-radius: 10px; margin-bottom: 20px;
            padding: 12px; background: #fdfdfd;
            box-shadow: 0 3px 8px rgba(0,0,0,0.08);
        }
        .pm-table td { display: flex; justify-content: space-between; padding: 8px 5px; text-align: right; border-bottom: 1px solid #f0f2f5; }
        .pm-table td:last-child { border-bottom: none; }
        .pm-table td::before { content: attr(data-label); font-weight: bold; text-align: left; margin-right: 10px; }
        .pm-empty-state-cell { text-align: center; padding: 20px; color: #6c757d; }

        /* Action Buttons */
        .pm-action-buttons-group { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
        .pm-action-button {
            padding: 6px 12px; font-size: 14px; font-weight: 600;
            border: 1px solid; border-radius: 5px; cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
        }
        .pm-button-breakup { border-color: #007bff; background: #007bff; color: #fff; }
        .pm-button-breakup:hover { background: #0056b3; }
        .pm-button-receipt { border-color: #28a745; background: #28a745; color: #fff; }
        .pm-button-receipt:hover { background: #218838; }
        
        /* Generic Modal Styles */
        .pm-modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.6); display: flex;
            justify-content: center; align-items: center; z-index: 1000;
            padding: 15px;
        }
        .pm-modal-content {
            background: #fff; padding: 25px; border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            width: 90%; max-width: 500px; position: relative;
        }
        .pm-modal-header {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #dee2e6; padding-bottom: 10px; margin-bottom: 20px;
        }
        .pm-modal-title { margin: 0; font-size: 1.5rem; color: #343a40; }
        .pm-modal-close-button {
            background: none; border: none; font-size: 1.8rem;
            cursor: pointer; color: #6c757d; line-height: 1;
        }
        .pm-modal-body p { margin: 0 0 12px; font-size: 16px; display: flex; justify-content: space-between; }
        .pm-modal-body p strong { color: #495057; }
        .pm-modal-footer { text-align: right; margin-top: 25px; }
        .pm-modal-footer button {
            padding: 10px 20px; font-size: 15px; font-weight: 600;
            border: none; border-radius: 6px; cursor: pointer;
            background: #6c757d; color: #fff;
        }

        /* --- NEW/UPDATED RECEIPT STYLES --- */
        .pm-receipt-content {
            background: #fff; padding: 20px; border-radius: 8px;
            border: 1px solid #ccc;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            width: 95%;
            font-family: 'Courier New', Courier, monospace;
        }
        .receipt-header-new { display: flex; align-items: center; justify-content: space-between; padding-bottom: 15px; border-bottom: 2px solid #333; }
        .receipt-logo { width: 60px; height: 60px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #aaa; }
        .clinic-details { text-align: right; }
        .clinic-details h2 { margin: 0; font-size: 1.2rem; }
        .clinic-details p { margin: 2px 0; font-size: 0.8rem; color: #555; }
        .receipt-title { text-align: center; margin: 15px 0; font-size: 1.4rem; font-weight: bold; letter-spacing: 1px; }
        .receipt-info-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.9rem; }
        .receipt-main-content { padding: 15px 0; border-top: 1px dashed #999; border-bottom: 1px dashed #999; }
        .receipt-main-content p { margin: 10px 0; line-height: 1.6; font-size: 0.95rem; }
        .receipt-main-content .amount-in-words { font-style: italic; }
        .receipt-main-content strong { font-weight: bold; }
        .payment-details { display: flex; justify-content: space-between; padding: 10px 0; }
        .receipt-signature { margin-top: 40px; text-align: right; }
        .signature-line { border-top: 1px solid #333; width: 180px; margin-left: auto; margin-bottom: 5px; }
        .receipt-signature p { margin: 0; font-weight: bold; }

        /* Tablet (≥600px) */
        @media (min-width: 600px) { .patient-manager-container { padding: 20px; } .pm-title { font-size: 1.6rem; } }

        /* Desktop (≥768px) */
        @media (min-width: 768px) {
            .pm-form-row { flex-direction: row; gap: 20px; }
            .pm-table thead { display: table-header-group; }
            .pm-table tr {
                display: table-row; border: 1px solid #dee2e6;
                margin-bottom: 0; padding: 0; background: #fff; box-shadow: none;
            }
            .pm-table th, .pm-table td { display: table-cell; padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; vertical-align: middle; }
            .pm-table th { background: #f8f9fa; border-bottom: 2px solid #dee2e6; }
            .pm-table tbody tr { border: 1px solid #dee2e6; }
            .pm-table tbody tr:nth-child(odd) { background-color: #f9f9f9; }
            .pm-table tbody tr:nth-child(even) { background-color: #ffffff; }
            .pm-table tbody tr:hover { background-color: #eaf3ff; border: 1px solid #007bff; }
            .pm-table td::before { display: none; content: none; }
        }

        /* Large desktops (≥1200px) */
        @media (min-width: 1200px) { .patient-manager-container { max-width: 1100px; padding: 30px; } .pm-title { font-size: 1.8rem; } .pm-nav-button { font-size: 16px; } }
        
        /* Print Styles */
        @media print {
            body * { visibility: hidden; }
            .receipt-print-area, .receipt-print-area * { visibility: visible; }
            .receipt-print-area {
                position: absolute; left: 0; top: 0;
                width: 100%; margin: 0; padding: 15px;
                border: none; box-shadow: none;
                font-family: 'Courier New', Courier, monospace; /* Ensure font is consistent for printing */
            }
            .no-print { display: none !important; }
        }
    `;


    useEffect(() => {
        const fetchAppointments = async () => {
              let res = await postData("/get_appointment", {});
              if(Array.isArray(res)){
            //   setAppointments(res.filter((item) => item.status === "success"));

            const fdata = res
            // .filter((item) => item.status === "success")

  const unique = [];
const seen = new Set();

for (const item of fdata) {
  const key = item.patient_name + "|" + item.guardian_name;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(item);
  }
}

// console.log(unique);
setPatients(unique)
            //   console.log(res)
            }
        };
        fetchAppointments();
    }, []);

  const getdecription = async() => {

  const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});
    
  try {
    const response = await api.get('/patient'); 
    console.log('Description fetched:', response.data);
    setPatients(response.data.patients?response.data.patients:[])
  } catch (error) {
    console.error('Error fetching description:', error);
  }


  const unique = [];
const seen = new Set();

for (const item of data) {
  const key = item.patient_name + "|" + item.guardian_name;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(item);
  }
}

console.log(unique);
setPatients(unique)



}




const postdecription = async(p) => {

  const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});
    
  try {
    const response = await api.post('/patient',p); 
    console.log('Description fetched:', response.data);
  } catch (error) {
    console.error('Error fetching description:', error);
  }


}



    const generatePDF = async (s) => {
        try {
            const blob = await pdf(<Reciept s={s}/>).toBlob();
            const url = URL.createObjectURL(blob);

            // Open the PDF in a new window/tab for viewing
            const newWindow = window.open(url, '_blank');

            if (newWindow) {
                // Optional: Focus on the new window if it opens successfully
                newWindow.focus();
                // Clean up the URL when the new window is closed or after a short delay
                // Note: It's hard to know exactly when the user closes the window.
                // For simplicity, we can revoke after a short delay or when the current component unmounts.
                // For a more robust solution, you might need a more complex state management or cleanup.
                setTimeout(() => URL.revokeObjectURL(url), 5000); // Revoke after 5 seconds
            } else {
                alert('Please allow pop-ups to view the bill. Your browser blocked the new window.');
                URL.revokeObjectURL(url); // Clean up the URL even if window.open failed
            }

            // Reset form after generating/attempting to open PDF
            // setFormData(initialFormData);
            // setStep(1);
            // setVisibleExtrasCount(0);
            // alert("Bill Generated!!!");

        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

    return (

        <>
{/* 
        <Link to={'/'}><div style={{
    background:'#249CA2',
    height:50,
    width:'100vw',
    display:'flex',
    alignItems:'center',
    color:'white',
    gap:10,
    
    marginBottom:10
}}> <i style={{paddingLeft:20}} class="fa-solid fa-arrow-left"></i>
    <label style={{fontWeight:700,fontSize:12,color:'white'}}>Back</label>
</div></Link> */}
        
            <style>{styles}</style>
            <div className="patient-manager-container" style={{width:'90vw'}}>
                {/* --- Your Add/List Views and Buttons remain here --- */}
                <div className="pm-nav-container">
                    <button className={`pm-nav-button ${view === 'add' ? 'active' : ''}`} onClick={() => setView('add')}>Add Patient</button>
                    <button className={`pm-nav-button ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Patient List</button>
                </div>

                {view === 'add' && (
                       <div>
                            <h2 className="pm-title">Add Patient Details</h2>
                            <form onSubmit={handleSubmit} className="pm-form">
                                <div className="pm-form-row">
                                    {/* <div className="pm-form-group"><label className="pm-label">Reception No.</label><input type="text" readOnly value={nextReceptionNumber} className="pm-input read-only" /></div> */}
                                    {/* <div className="pm-form-group"><label className="pm-label">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="pm-input" /></div> */}
                                </div>
                                <div className="pm-form-group"><label className="pm-label">Patient Name</label><input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g., John Doe" required className="pm-input" /></div>
                                <div className="pm-form-group"><label className="pm-label">Father`s Name</label><input type="text" value={fatherName} onChange={(e) => setfatherName(e.target.value)} placeholder="e.g., John Doe" required className="pm-input" /></div>
                                <div className="pm-form-row">
                                    <div className="pm-form-group"><label className="pm-label">Sex</label><select value={sex} onChange={(e) => setSex(e.target.value)} required className="pm-select"><option value="" disabled>Select Sex</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                                    <div className="pm-form-group"><label className="pm-label">Age</label><input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 35" required className="pm-input" /></div>
                                    <div className="pm-form-group"><label className="pm-label">Mobile Number</label><input type="number" value={MobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="e.g., 80xxxxxxx00" required className="pm-input" /></div>
                                </div>
                                {/* <div className="pm-form-group"><label className="pm-label">Amount</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 500" required className="pm-input" /></div> */}
                                <button type="submit" className="pm-submit-button">Submit</button>
                            </form>
                        </div>
                )}

                {view === 'list' && (
                    <div>
                        <h2 className="pm-title">Patient List</h2>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Search by patient name..." className="pm-input" style={{ marginBottom: '20px' }} />
                        <div className="pm-table-wrapper">
                            <table className="pm-table">
                                <thead>
                                    <tr>
                                        <th>Reception No.</th><th>Date</th><th>Patient Name</th><th>Age</th><th>Sex</th><th>Amount</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map((appt,index) => (
                                            <div key={appt.appoint_number} style={card}>
                                                <div style={cardTop}>
                                                    <span style={serial}>{index + 1}.</span>
                                                    <span style={name}>
                                                        {appt.patient_name} 
                                                        {/* <span style={id}>({appt.guardian_name})</span> */}
                                                    </span>
                                                
                                                </div>
                                                <div style={cardBottom}>
                                                    <span style={dateText}>S/o {appt.guardian_name}</span>
                                                    <span style={timeText}> {appt.whatsapp_number}</span>
                                                </div>
                                            </div>
                                            // <tr key={appt.id}>
                                            //     <td data-label="Reception No.">{index + 1}</td>
                                            //     <td data-label="Date">{appt.date}</td>
                                            //     <td data-label="Patient Name">{appt.patient_name}</td>
                                            //     <td data-label="Age">{appt.age}</td>
                                            //     <td data-label="Sex">{appt.sex}</td>
                                            //     <td data-label="Amount">₹{appt.amount}</td>
                                            //     <td data-label="Actions">
                                            //         <div className="pm-action-buttons-group">
                                            //             <button onClick={() => handleShowBreakup(appt)} className="pm-action-button pm-button-breakup">Breakup</button>
                                            //             <button onClick={()=>generatePDF(appt)} className="pm-action-button pm-button-receipt">Receipt</button>
                                            //         </div>
                                            //     </td>
                                            // </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" className="pm-empty-state-cell">No patients found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Breakup Modal (remains unchanged) */}
            {isBreakupModalOpen && selectedPatient && (
                <div className="pm-modal-overlay" onClick={handleCloseBreakupModal}>
                    <div className="pm-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="pm-modal-header">
                            <h2 className="pm-modal-title">Patient Breakup</h2>
                            <button onClick={handleCloseBreakupModal} className="pm-modal-close-button">&times;</button>
                        </div>
                        <div className="pm-modal-body">
                            <p><strong>Reception No.:</strong> <span>{selectedPatient.id}</span></p>
                            <p><strong>Date:</strong> <span>{selectedPatient.date}</span></p>
                            <p><strong>Patient Name:</strong> <span>{selectedPatient.name}</span></p>
                            <p><strong>Age:</strong> <span>{selectedPatient.age}</span></p>
                            <p><strong>Sex:</strong> <span>{selectedPatient.sex}</span></p>
                            <p><strong>Amount:</strong> <span>₹{selectedPatient.amount}</span></p>
                        </div>
                        <div className="pm-modal-footer">
                                <button onClick={handleCloseBreakupModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- UPDATED Receipt Modal --- */}
            {isReceiptModalOpen && selectedPatient && (
            <div className="pm-modal-overlay">
              <div className="pm-receipt-content receipt-print-area" onClick={(e) => e.stopPropagation()}>
                <div style={{
                  width: '100%', height: '70vh',
                overflow:'auto'
                }}>

                <Reciept />
                </div>


                 <div className="pm-modal-footer no-print">
                             <button onClick={generatePDF} style={{background: '#17a2b8', marginRight: '10px'}}>Print</button>
                             <button onClick={handleCloseReceiptModal}>Close</button>
                         </div>
              </div>
            </div>
                



            )}
        </>
    );
};


const container = {
    padding: "15px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
};

const header = {
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
};

const title = {
    fontSize: "18px",
    color: "#075E54",
    fontWeight: "bold",
};

const datePicker = {
    marginLeft: "10px",
    padding: "4px 8px",
    border: "1px solid #ccc",
    borderRadius: "5px",
};

const listContainer = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
};

const card = {
    background: "white",
    padding: "12px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
};

const cardTop = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
};

const serial = {
    fontWeight: "bold",
    marginRight: "10px",
    color: "#444",
};

const name = { fontSize: "15px", fontWeight: "600", flex: 1, color: "#222" };
const id = { fontSize: "13px", color: "#888", marginLeft: "5px" };

const checkbox = { marginLeft: "10px", transform: "scale(1.2)" };

const cardBottom = {
    marginTop: "6px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#555",
};

const dateText = { display: "flex", alignItems: "center" };
const timeText = { display: "flex", alignItems: "center" };

const emptyMsg = { textAlign: "center", marginTop: "30px", color: "#888" };

const rescheduleBtn = {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#075E54",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
};

const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
};

const modalBox = {
    background: "white",
    padding: 20,
    borderRadius: 10,
    width: "300px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

const dateInputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: 5,
    border: "1px solid #ccc",
};

const modalActions = {
    marginTop: 20,
    display: "flex",
    gap: 10,
};

const confirmBtn = {
    flex: 1,
    backgroundColor: "#075E54",
    color: "white",
    padding: "8px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
};

const cancelBtn = {
    flex: 1,
    backgroundColor: "#ccc",
    color: "black",
    padding: "8px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
};

export default Addpatient;