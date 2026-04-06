
import { PDFViewer } from '@react-pdf/renderer';
import DoctorBillPDF from './DoctorBillPDF';
import { pdf } from '@react-pdf/renderer';
import { useLocation } from "react-router-dom";
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
const STATIC_BILLABLE_ITEMS = [
    { name: 'Nurse Charges', rate: 500 },
    { name: 'Doctor Visit', rate: 800 },
    { name: 'Room Rent', rate: 1500 },
    { name: 'ICU Charges', rate: 5000 },
    { name: 'Medicines', rate: '' },
    { name: 'Lab Tests', rate: '' }
];
 const API_BASE_URL_TO = import.meta.env.VITE_API_URL;
const BrackupFarm = () => {
    const navi = useNavigate()
     const location = useLocation();
  const patientdata = location.state;
console.log(location)
  const [discount, setdiscount] = useState('')

    const [testData, settestData] = useState({
        billNo: patientdata.id,
        name: patientdata.name,
        ageSex: patientdata.age+' / '+patientdata.sex,
        admissionDate: patientdata.age,
        dischargeDate: patientdata.age,
        issueDate: '',
        diagnosis: '',
        icu: { rate: '2500', days: '2' },
        room: { rate: '1500', days: '3' },
        doctor: { rate: '1000', days: '3' },
        nurse: { rate: '700', days: '3' },
        extra1Label: 'Ambulance',
        extra1: '800',
        extra2Label: 'Blood Test',
        extra2: '950',
        extra3Label: 'Injection',
        extra3: '500',
        receiptNo: 'REC-121212',
        list: [
       
 
    ]
    })

    // const testData = {
    //     billNo: 'KAL-2025-007',
    //     name: patientdata.name,
    //     ageSex: patientdata.age+' / '+patientdata.sex,
    //     admissionDate: patientdata.age,
    //     dischargeDate: patientdata.age,
    //     issueDate: '2025-07-10',
    //     diagnosis: 'Typhoid with dehydration',
    //     icu: { rate: '2500', days: '2' },
    //     room: { rate: '1500', days: '3' },
    //     doctor: { rate: '1000', days: '3' },
    //     nurse: { rate: '700', days: '3' },
    //     extra1Label: 'Ambulance',
    //     extra1: '800',
    //     extra2Label: 'Blood Test',
    //     extra2: '950',
    //     extra3Label: 'Injection',
    //     extra3: '500',
    //     receiptNo: 'REC-121212',
    //     list: [
    //     { label: 'ICU Charge', rate: 200, days: 3, showXDay: true },
    //     { label: 'ICU Charge', rate: 200, days: 3, showXDay: true },
    //     { label: 'ICU Charge', rate: 200, days: 3, showXDay: true },
    //     { label: 'ICU Charge', rate: 200, days: 3, showXDay: true }
 
    // ]
    // };

    const generatePDF = async () => {
        try {
            // postmydata(patientdata._id,testData)

              const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});
    console.log(testData,patientdata._id)
  try {
    const response = await api.post(`/patient_bill_update/${patientdata._id}`,{...testData,discount}); 
    console.log('Description fetched:', response.data);
  } catch (error) {
    console.error('Error fetching description:', error);
  }

            navi('/makebill')
            const blob = await pdf(<DoctorBillPDF formData={{...testData,discount}} fd={patientdata}/>).toBlob();
            const url = URL.createObjectURL(blob);

            // Open the PDF in a new window/tab for viewing
            const newWindow = window.open(url, '_blank');

            if (newWindow) {
                newWindow.focus();
                setTimeout(() => URL.revokeObjectURL(url), 5000); // Revoke after 5 seconds
            } else {
                alert('Please allow pop-ups to view the bill. Your browser blocked the new window.');
                URL.revokeObjectURL(url); // Clean up the URL even if window.open failed
            }

        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate PDF. Check console for details.");
        }
    };



useEffect(() => {
  getdecription()
}, [])


const [view, setView] = useState('billForm'); // Current view: 'add', 'list', or 'billForm'
    const [patients, setPatients] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [amount, setAmount] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(patientdata);
    const [billStep, setBillStep] = useState(1); // Manages steps for the new bill form
    
    // --- STATE FOR BILL CHARGES ---
    const [billableItems, setBillableItems] = useState(STATIC_BILLABLE_ITEMS); // Initialized with static data
    const [billCharges, setBillCharges] = useState([]); // To store charges for the current bill

    // --- ✅ NEW: AUTO-CALCULATE TOTAL BILL ---
    const totalBill = useMemo(() => {
        return billCharges.reduce((total, charge) => {
            const rate = parseFloat(charge.rate) || 0;
            // If days is empty/0, treat it as 1 unit
            const days = parseFloat(charge.days) || 1;
            return (total + (rate * days));
        }, 0)-discount;
    }, [billCharges,discount]);


    // --- HELPER & CORE FUNCTIONS (Unchanged) ---
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

    const formatReceptionNumber = (num) => `R${String(num).padStart(3, '0')}`;
    const nextReceptionNumber = formatReceptionNumber(patients.length + 1);

   



    // --- HANDLERS FOR DYNAMIC BILL CHARGES ---
    const handleAddCharge = () => {
        setBillCharges([...billCharges, { id: Date.now(), name: '', rate: '', days: '' ,type:'Not Fixed'}]);
         settestData({
            ...testData,
            list: [...billCharges, { id: Date.now(), name: '', rate: '', days: '',type:'Not Fixed' }],
          })
    };

    const handleChargeChange = (index, field, value) => {
        const updatedCharges = [...billCharges];
        updatedCharges[index][field] = value;

        if (field === 'name' && value) {
            const selectedItemDetails = billableItems.find(item => item.name === value);
            if (selectedItemDetails && selectedItemDetails.amount) {
                updatedCharges[index]['rate'] = selectedItemDetails.amount;
            }
        }
        setBillCharges(updatedCharges);
        settestData({
            ...testData,
            list: updatedCharges,
          })
    };

    const handleRemoveCharge = (index) => {
        setBillCharges(billCharges.filter((_, i) => i !== index));
        settestData({
            ...testData,
            list: billCharges.filter((_, i) => i !== index),
          })

    };


    // --- RECEIPT MODAL FUNCTIONS (Unchanged) ---
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

    // --- API & PDF FUNCTIONS ---
    const getdecription = async(p) => {
        const api = axios.create({ baseURL: "https://api.care2connect.in", headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" } });
        try {
            const response = await api.get('/add_description/'+Cookies.get('user')); 
            setBillableItems(response.data)
            console.log('Description posted:', response.data);
        } catch (error) { console.error('Error posting description:', error); }
    }

    
    // --- INLINE STYLES (Unchanged) ---
    const styles = `
        /* --- All your existing styles --- */
        .patient-manager-container { max-width: 100%; margin: auto; background: #fff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .pm-title { text-align: center; color: #1c1e21; padding-bottom: 15px; margin-top: 0; font-size: 1.4rem; }
        .pm-nav-container { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #f0f2f5; padding-bottom: 10px; }
        .pm-nav-button { flex: 1; min-width: 120px; padding: 10px; font-size: 15px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; background: #e9ecef; color: #495057; }
        .pm-nav-button.active { background: #007bff; color: #fff; }
        .pm-form { display: flex; flex-direction: column; gap: 15px; }
        .pm-form-group { display: flex; flex-direction: column; width: 100%; }
        .pm-form-row { display: flex; flex-direction: column; gap: 15px; }
        .pm-label { font-weight: 600; margin-bottom: 5px; }
        .pm-input, .pm-select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 15px; }
        .pm-input.read-only { background: #f1f3f5; font-weight: bold; }
        .pm-submit-button { width: 100%; padding: 12px; background: #007bff; color: #fff; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .pm-table-wrapper { width: 100%; overflow-x: auto; }
        .pm-table { width: 100%; border-collapse: collapse; }
        .pm-table thead { display: none; }
        .pm-table tr { display: block; border: 2px solid #dee2e6; border-radius: 10px; margin-bottom: 20px; padding: 12px; background: #fdfdfd; box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
        .pm-table td { display: flex; justify-content: space-between; padding: 8px 5px; text-align: right; border-bottom: 1px solid #f0f2f5; }
        .pm-table td:last-child { border-bottom: none; }
        .pm-table td::before { content: attr(data-label); font-weight: bold; text-align: left; margin-right: 10px; }
        .pm-empty-state-cell { text-align: center; padding: 20px; color: #6c757d; }
        .pm-action-buttons-group { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
        .pm-action-button { padding: 6px 12px; font-size: 14px; font-weight: 600; border: 1px solid; border-radius: 5px; cursor: pointer; transition: background-color 0.2s, color 0.2s; }
        .pm-button-breakup { border-color: #007bff; background: #007bff; color: #fff; }
        .pm-button-breakup:hover { background: #0056b3; }
        .pm-button-receipt { border-color: #28a745; background: #28a745; color: #fff; }
        .pm-button-receipt:hover { background: #218838; }
        .pm-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 15px; }
        .pm-modal-content { background: #fff; padding: 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 90%; max-width: 500px; position: relative; }
        .pm-modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; margin-bottom: 20px; }
        .pm-modal-title { margin: 0; font-size: 1.5rem; color: #343a40; }
        .pm-modal-close-button { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #6c757d; line-height: 1; }
        .pm-modal-body p { margin: 0 0 12px; font-size: 16px; display: flex; justify-content: space-between; }
        .pm-modal-body p strong { color: #495057; }
        .pm-modal-footer { text-align: right; margin-top: 25px; }
        .pm-modal-footer button { padding: 10px 20px; font-size: 15px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; background: #6c757d; color: #fff; }
        .pm-receipt-content { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ccc; box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: 95%; font-family: 'Courier New', Courier, monospace; }
        
        .bill-form-page-container {
            background-color: #f0f2f5; padding: 20px;
        }
        .bill-form-container {
            max-width: 900px; margin: 0 auto; padding: 30px; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }
        .bill-form-header { text-align: center; margin-bottom: 25px; }
        .bill-form-header h2 { font-size: 1.6rem; color: #333; margin: 0 0 10px 0; }
        .bill-form-stepper { display: flex; justify-content: center; align-items: center; margin-bottom: 35px; }
        .stepper-step { width: 32px; height: 32px; border-radius: 50%; background-color: #e9ecef; color: #adb5bd; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: all 0.3s ease; position: relative; }
        .stepper-step.active { background-color: #28a745; color: #fff; }
        .stepper-line { flex-grow: 1; height: 2px; background-color: #e9ecef; margin: 0 5px; }
        .bill-form-group { margin-bottom: 20px; }
        .bill-form-label { display: block; margin-bottom: 8px; font-weight: 600; color: #495057; font-size: 14px; }
        .bill-form-input { width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; font-size: 15px; transition: border-color 0.2s, box-shadow 0.2s; }
        .bill-form-input:focus { border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2); outline: none; }
        .bill-form-input[readOnly] { background-color: #e9ecef; cursor: not-allowed; }
        .bill-form-footer { margin-top: 30px; display: flex; justify-content: flex-end; }
        .bill-form-button { padding: 12px 25px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.2s, transform 0.1s; }
        .bill-form-button:active { transform: scale(0.98); }
        .next-button { background-color: #28a745; color: #fff; }
        .next-button:hover { background-color: #218838; }
        .prev-button { background-color: #6c757d; color: #fff; }
        .prev-button:hover { background-color: #5a6268; }
        .back-to-list-button { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #6c757d; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; }
        .back-to-list-button:hover { background: #5a6268; }
        
        @media (min-width: 768px) {
            .pm-form-row { flex-direction: row; gap: 20px; }
            .pm-table thead { display: table-header-group; }
            .pm-table tr { display: table-row; border: none; margin-bottom: 0; padding: 0; background: #fff; box-shadow: none; }
            .pm-table th, .pm-table td { display: table-cell; padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; vertical-align: middle; }
            .pm-table th { background: #f8f9fa; border-bottom: 2px solid #dee2e6; }
            .pm-table tbody tr { border: none; }
            .pm-table tbody tr:nth-child(odd) { background-color: #f9f9f9; }
            .pm-table tbody tr:hover { background-color: #eaf3ff; }
            .pm-table td::before { display: none; }
        }
        @media print { /* ... print styles ... */ }
    `;


const nextcheck= () => {

const isValid = !billCharges.some(item => item.name === "" ||item.rate === "")
if (isValid) {
const isValids = !billCharges.some(item => item.rate <1)


    if (isValids) {
        setBillStep(3)
    }else{
        Swal.fire({
    icon: "error",
    title: "Invalid Rate",
    text: "Fill Currect Amount",
  });
    }


    


    
}else{
   Swal.fire({
    icon: "error",
    title: "Missing Name or Rate",
    text: "Fill Item Details or Remove Box",
  });

}


}





            return(
                <div>



<>
            <style>{styles}</style>
            <div className="patient-manager-container" style={view === 'billForm' ? {width: '100vw', padding: 0, background: '#f0f2f5'} : {}}>
                
                {/* --- VIEW 3: NEW BILL FORM PAGE --- */}
                {view === 'billForm' && selectedPatient && (
                    <div className="bill-form-page-container">
                        {/* <button className="back-to-list-button" onClick={() => navi('/makebill')}>&larr; Back to Patient List</button> */}
                        <div className="bill-form-container">
                            <div className="bill-form-header">
                                <h2>Kalra Hospital Bill Form</h2>
                            </div>
                            <div className="bill-form-stepper">
                                <div className={`stepper-step ${billStep >= 1 ? 'active' : ''}`}>1</div>
                                <div className="stepper-line"></div>
                                <div className={`stepper-step ${billStep >= 2 ? 'active' : ''}`}>2</div>
                                <div className="stepper-line"></div>
                                <div className={`stepper-step ${billStep >= 3 ? 'active' : ''}`}>3</div>
                            </div>
                            
                            {/* Step 1: Patient Details */}
                            {billStep === 1 && (
                                <form onSubmit={(e) => { e.preventDefault(); setBillStep(2); }}>
                                    <div className="bill-form-group">
                                        <label htmlFor="billNo" className="bill-form-label">Bill No</label>
                                        <input type="text" id="billNo" value={selectedPatient.id} readOnly className="bill-form-input" />
                                    </div>
                                    <div className="bill-form-group">
                                        <label htmlFor="patientName" className="bill-form-label">Patient Name</label>
                                        <input type="text" id="patientName" defaultValue={selectedPatient.name} className="bill-form-input" />
                                    </div>
                                    <div className="bill-form-group">
                                        <label htmlFor="age" className="bill-form-label">Age</label>
                                        <input type="text" id="age" defaultValue={selectedPatient.age} className="bill-form-input" />
                                    </div>
                                    <div className="bill-form-group">
                                        <label htmlFor="sex" className="bill-form-label">Sex</label>
                                        <input type="text" id="sex" defaultValue={selectedPatient.sex} className="bill-form-input" />
                                    </div>
  <div className="bill-form-group">
      <label htmlFor="dob" className="bill-form-label">Admission Date</label>
      <input
        type="date"
        id="dob"
        value={testData.admissionDate || ""}
        onChange={(e) =>
          settestData({
            ...testData,
            admissionDate: e.target.value,
          })
        }
        className="bill-form-input"
      />
    </div>

    <div className="bill-form-group">
      <label htmlFor="dob" className="bill-form-label">Discharge Date</label>
      <input
        type="date"
        id="dob"
        value={testData.dischargeDate || ""}
        onChange={(e) =>
          settestData({
            ...testData,
            dischargeDate: e.target.value,
          })
        }
        className="bill-form-input"
      />
    </div>

    <div className="bill-form-group">
      <label htmlFor="dob" className="bill-form-label">Issue Date</label>
      <input
        type="date"
        id="dob"
        value={testData.issueDate || ""}
        onChange={(e) =>
          settestData({
            ...testData,
            issueDate: e.target.value,
          })
        }
        className="bill-form-input"
      />
    </div>

    <div className="bill-form-group">
      <label htmlFor="dob" className="bill-form-label">Diagnosis</label>
      <input
        type="text"
        id="dob"
        value={testData.diagnosis || ""}
        onChange={(e) =>
          settestData({
            ...testData,
            diagnosis: e.target.value,
          })
        }
        className="bill-form-input"
      />
    </div>

                                    <div className="bill-form-footer">
                                        <button type="submit" className="bill-form-button next-button">Next &rarr;</button>
                                    </div>
                                </form>
                            )}

                            {/* Step 2: Add Charges */}
                            {billStep === 2 && (
                                <div>
                                    <div className="bill-form-group">

                                   
                                     <div className="bill-form-group">
                                        <label className="bill-form-label" htmlFor="totalBill">Reciept Amount</label>
                                        <input
                                            id="totalBill"
                                            type="text"
                                            readOnly
                                            value={`₹ ${patientdata.amount}`}
                                            className="bill-form-input"
                                            style={{ backgroundColor: '#e9f5ea', color: '#155724', fontWeight: 'bold', fontSize: '1.1rem' }}
                                        />
                                    </div>

                                        {billCharges.map((charge, index) => (
                                            <>
                                            <div key={charge.id} className="pm-form-row" style={{  gap: '10px', marginBottom: '15px' }}>
                                                <div className="pm-form-group" style={{ flex: 3 }}>
                                                    <label className="bill-form-label">Item</label>
                                                    <select className="bill-form-input" value={charge.name} onChange={(e) => handleChargeChange(index, 'name', e.target.value)}>
                                                        <option value="" disabled>Select Item...</option>
                                                        {billableItems.map((item, i) => (<option key={i} value={item.name}>{item.name}</option>))}
                                                    </select>
                                                </div>
                                                <div className="pm-form-group" style={{ flex: 3 }}>
                                                    <label className="bill-form-label">Rate Type</label>
                                                    <select className="bill-form-input" value={charge.type} onChange={(e) => handleChargeChange(index, 'type', e.target.value)}>
                                                        <option value="Not Fixed">Day Wise</option>
                                                        <option value="Fixed">Fixed</option>
                                                        <option value="Qw">Quantity Wise</option>
                                                    </select>
                                                </div>
                                                <div className="pm-form-group" style={{ flex: 2 }}>
                                                    <label className="bill-form-label">Rate ₹</label>
                                                    <input type="number" placeholder="Rate" className="bill-form-input" value={charge.rate} onChange={(e) => handleChargeChange(index, 'rate', e.target.value)} />
                                                    <label style={{color:'green',fontSize:12}}>Total Amount : {charge.days?`${charge.rate} x ${charge.days} = ${charge.rate*charge.days}`:charge.rate}₹</label>
                                                </div>
                                            { charge.type!=='Fixed'&&   <div className="pm-form-group" style={{ flex: 1 }}>
                                                    <label className="bill-form-label">{charge.type==='Qw'?'Qty':'Days'}</label>
                                                    <input type="number" placeholder={charge.type==='Qw'?'Qty':'Days'} className="bill-form-input" value={charge.days} onChange={(e) => handleChargeChange(index, 'days', e.target.value)} />
                                                </div>}
                                                <div style={{display:'flex',justifyContent:'end'}}>
                                                <button type="button" onClick={() => handleRemoveCharge(index)} style={{ padding: '12px', border: '1px solid #dc3545', background: '#dc3545', color: 'white', borderRadius: '6px', cursor: 'pointer', height:45,marginTop:27,width:45 }}>
                                                    &#10005;
                                                </button></div>
                                            </div>
                                            
</>
                                        ))}
                                    </div>

                                 <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                        <button type="button" onClick={handleAddCharge} className="bill-form-button" style={{ background: '#0d6efd', width: 'auto' }}>
                                            + Add Item
                                        </button>
                                    </div>

                                    <div className="bill-form-group">
                                        <label className="bill-form-label" htmlFor="totalBill">Discount</label>
                                        <input
                                            id="disBill"
                                            type="number"
                                            onChange={(e)=>setdiscount(e.target.value)}
                                            value={discount}
                                            className="bill-form-input"
                                            style={{ backgroundColor: '#e9f5ea', color: parseFloat(patientdata.amount).toFixed(2)===totalBill.toFixed(2)?'#155724':'#571515ff', fontWeight: 'bold', fontSize: '1.1rem' }}
                                        />
                                    </div>

                                      <div className="bill-form-group">
                                        <label className="bill-form-label" htmlFor="totalBill">Total Bill</label>
                                        <input
                                            id="totalBill"
                                            type="text"
                                            readOnly
                                            value={`₹ ${totalBill.toFixed(2)}`}
                                            className="bill-form-input"
                                            style={{ backgroundColor: '#e9f5ea', color: parseFloat(patientdata.amount).toFixed(2)===totalBill.toFixed(2)?'#155724':'#571515ff', fontWeight: 'bold', fontSize: '1.1rem' }}
                                        />
                                    </div>

                                    <div className="bill-form-footer" style={{ justifyContent: 'space-between' }}>
                                        <button onClick={() => setBillStep(1)} className="bill-form-button prev-button">&larr; Prev</button>
                                        <button onClick={() => parseFloat(patientdata.amount).toFixed(2)===totalBill.toFixed(2)?nextcheck():setBillStep(2)} className="bill-form-button next-button">Next &rarr;</button>
                                    </div>
                                </div>
                            )}

                            {/* ✅ Step 3: Final Review - REPLACED PLACEHOLDER */}
                            {billStep === 3 && (
                                <div>
                                    <div className="bill-form-group">
                                        <label className="bill-form-label" htmlFor="totalBill">Total Bill</label>
                                        <input
                                            id="totalBill"
                                            type="text"
                                            readOnly
                                            value={`₹ ${totalBill.toFixed(2)}`}
                                            className="bill-form-input"
                                            style={{ backgroundColor: '#e9f5ea', color: parseFloat(patientdata.amount).toFixed(2)===totalBill.toFixed(2)?'#155724':'#571515ff', fontWeight: 'bold', fontSize: '1.1rem' }}
                                        />
                                    </div>
                                     <div className="bill-form-group">
                                        <label className="bill-form-label" htmlFor="totalBill">Reciept Amount</label>
                                        <input
                                            id="totalBill"
                                            type="text"
                                            readOnly
                                            value={`₹ ${patientdata.amount}`}
                                            className="bill-form-input"
                                            style={{ backgroundColor: '#e9f5ea', color: '#155724', fontWeight: 'bold', fontSize: '1.1rem' }}
                                        />
                                    </div>
                                    <div className="bill-form-group">
                                        <label className="bill-form-label" htmlFor="receiptNo">Receipt No</label>
                                        <input
                                            id="receiptNo"
                                            type="text"
                                            readOnly
                                            value={selectedPatient.id}
                                            className="bill-form-input"
                                        />
                                    </div>
                                    <div className="bill-form-footer" style={{flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
                                     { parseFloat(patientdata.amount).toFixed(2)===totalBill.toFixed(2) && <button
                                            onClick={generatePDF}
                                            className="bill-form-button next-button"
                                            style={{ width: '100%' }}
                                        >
                                            Submit & View PDF
                                        </button>}
                                        <button
                                            onClick={() => setBillStep(2)}
                                            className="bill-form-button"
                                            style={{ width: '100%', background: '#f8f9fa', color: '#495057', border: '1px solid #ced4da' }}
                                        >
                                            &larr; Prev
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

          
        </>

                </div>
            )



}

export default BrackupFarm