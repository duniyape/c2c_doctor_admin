import React, { useState, useMemo, useEffect } from 'react';
import Reciept from './Reciept';
import { pdf } from '@react-pdf/renderer';
import axios from 'axios';
 import useApi from "../../api/useApi";
import { Link, useNavigate } from 'react-router';
import DoctorBillPDF from './DoctorBillPDF';
import moment from 'moment';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download ,FileText,Receipt, Edit } from 'lucide-react';
import Cookies from 'js-cookie';
 const API_BASE_URL_TO = import.meta.env.VITE_API_URL;

const Makebill = () => {
    const navigate = useNavigate()
    const { postData } = useApi();

     const [pselected, setpselected] = useState(false)
    // ... (Your existing state declarations remain the same)
    const [view, setView] = useState('list');
    const [patients, setPatients] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [MobileNumber, setMobileNumber] = useState('');
    const [fatherName, setfatherName] = useState('');
    const [amount, setAmount] = useState('');
    const [age, setAge] = useState('');

    const today = new Date().toISOString().split("T")[0];
    const [dob, setdob] = useState('')
    const [sex, setSex] = useState('');

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBreakupModalOpen, setIsBreakupModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [recieptnum, setrecieptnum] = useState('Searching...')

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
    // const formatReceptionNumber = (num) => `R${String(num).padStart(3, '0')}`;
    // const nextReceptionNumber = formatReceptionNumber(patients.length + 1);
    const nextReceptionNumber = patients.length + 4101

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!patientName.trim()|| !fatherName.trim() || !amount || !age || !sex || !date) {
            alert('Please fill in all fields.');
            return;
        }
        const newPatient = {
            id: recieptnum,
            name: patientName.trim(),
            amount: parseFloat(amount).toFixed(2),
            age,
            sex,
            date,
            fatherName: fatherName.trim(),
            whatsappNumber: MobileNumber,
            doctor_phone_id:Cookies.get('user')
        };
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
                patient.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            padding: 6px 6px; font-size: 10px; font-weight: 600;
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

const [fromdate, setfromdate] = useState(moment(new Date()).format('yyyy-MM-DD'))
const [todate, settodate] = useState(moment(new Date()).format('yyyy-MM-DD'))

  const getdecription = async() => {
    getrecieptnum()

  const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});
    
  try {
    const response = await api.get(`/patient_bill?from_date=${moment(fromdate).format('yyyy-MM-DD')}&to_date=${moment(todate).format('yyyy-MM-DD')}`); 
    console.log('Description fetched:', response.data);
    setPatients(response.data.patients?response.data.patients:[])
  } catch (error) {
    console.error('Error fetching description:', error);
  }





}
  const getrecieptnum = async() => {

  const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});
    
  try {
    const response = await api.get(`/get_patient_bill_reciept_number`); 
    console.log('Description fetched:', response.data);
    setrecieptnum(response.data.patient_id?response.data.patient_id:4101)
  } catch (error) {
    console.error('Error fetching description:', error);
  }





}

function downloadPDF() {
  const doc = new jsPDF();

// Title
doc.setFontSize(14);
doc.text("Receipt List", 14, 15);

// Table
autoTable(doc, {
  head: [["#", "Reception No.", "Date" ,"Patient Name", "Father’s Name", "Gender", "Amount"]],
  body: patients.map((p, index) => [
    index + 1,
    p.id,
    new Date(p.date).toLocaleDateString("en-IN"),
    p.name,
    p.fatherName,
    p.sex,
    p.amount
  ]),
  startY: 30,
  styles: { fontSize: 9 },
  theme: "grid",
  headStyles: { fillColor: [22, 160, 133] },
});

// Save PDF
doc.save("patients.pdf");

}

function downloadExcel() {


    const customData = patients.map(p => ({
    "Reception No.": p.id,
    "Date": p.date,
    "Patient Name":p.name,
    "Father’s Name": p.fatherName,
    "Gender": p.sex,
    "Amount (₹)": p.amount,
  }));
  // 1) Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(customData);

  // 2) Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");

  // 3) Write workbook to binary array
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // 4) Convert to Blob and trigger download
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "patients.xlsx");
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
    const response = await api.post('/patient_bill',p); 
    getdecription()
    console.log('Description fetched:', response.data);
  } catch (error) {
    console.error('Error fetching description:', error);
  }



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
if (!pselected) {
    try {
    const response = await api.post('/patient',newPatient); 
    console.log('Description fetched:', response.data);
  } catch (error) {
    console.error('Error fetching description:', error);
  }
}
  



}

useEffect(() => {
  getdecription()
  
}, [fromdate,todate])


const [patientlist, setpatientlist] = useState([])

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
setpatientlist(unique)
            //   console.log(res)
            }
        };
        // fetchAppointments();
    }, []);

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


  const [suggestions, setSuggestions] = useState([]);

  // Object array (sample)
//   const patientss = [
//     { id: 1, name: "John Doe", age: 32 },
//     { id: 2, name: "Jane Smith", age: 28 },
//     { id: 3, name: "Michael Johnson", age: 40 },
//     { id: 4, name: "Emily Davis", age: 35 },
//     { id: 5, name: "David Wilson", age: 30 },
//   ];

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setPatientName(value);

//     if (value.length > 0) {
//       const filtered = patientlist.filter((p) =>
//         p.patient_name.toLowerCase().includes(value.toLowerCase())
//       );
//       setSuggestions(filtered);
//     } else {
//       setSuggestions([]);
//     }
//   };

const handleChange = async (e) => {
  const value = e.target.value;
  setMobileNumber(value);

  const api = axios.create({
    baseURL: API_BASE_URL_TO,
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/json",
    },
  });

  if (value.length > 1) {
    try {
      const response = await api.get(`/api/patients?search=91${value}`);
      
      // Axios me data yahan milta hai
      const data = response.data;

      setSuggestions(data);
      console.log("Patients fetched:", data);
    } catch (error) {
      setSuggestions([]);
      console.error("Error fetching patients:", error);
    }
  } else {
    setSuggestions([]);
  }
};



 

  const handleSelect = (patient) => {
    setPatientName(patient.patient_name);
    setfatherName(patient.guardian_name);
    setMobileNumber(patient.whatsapp_number);
    setAge(patient.age?patient.age==='none'?'':patient.age:'');
    setSex(patient.sex?patient.sex:'');
    setpselected(true)
    setSuggestions([]);
  };



const generatePDFbrackup = async (datax,fd) => {
        try {
            
            const blob = await pdf(<DoctorBillPDF formData={datax} fd={fd} />).toBlob();
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

    function calculateAge(dobStr) {
  let dob = new Date(dobStr);
  let today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    let prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} years, ${months} months, ${days} days`;
}


useEffect(() => {
  if (dob) {
    setAge(calculateAge(dob))
  }
}, [dob])


    return (
        <div className="p-0 sm:p-6 bg-emerald-50 min-h-screen text-sm"> {/* Reduced padding here */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                    @media print {
                        .no-print { display: none !important; }
                        .pm-modal-overlay { position: static; background: none; }
                        .pm-receipt-content { box-shadow: none; border: none; max-width: 100%; width: 100%; height: auto; }
                        body { margin: 0; }
                    }
                    /* Custom styling for small text on table/forms */
                    input, select, button, .pm-label, .pm-table th, .pm-table td {
                        font-size: 0.875rem; /* text-sm equivalent */
                    }
                    /* Custom input focus style matching the image */
                    .input-style-custom:focus {
                        border-color: #34d399 !important; /* emerald-400 or green-400 */
                        box-shadow: 0 0 0 1px #34d399;
                        outline: none;
                    }
                `}
            </style>
            
            <script src="https://kit.fontawesome.com/a076d05399.js" crossOrigin="anonymous"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

            <div className="max-w-5xl mx-auto rounded-xl shadow-2xl bg-white p-4 sm:p-8 font-[Inter] mb-8"> {/* Reduced inner padding */}
                
                {/* Custom Message Box */}
                {/* {message && (
                    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-white text-base ${message.type === 'success' ? 'bg-emerald-500' : message.type === 'error' ? 'bg-red-600' : 'bg-blue-500'}`}>
                        {message.text}
                    </div>
                )} */}

                {/* Navigation (Matching Image) */}
                <div className="flex mb-2"> {/* Removed border-b */}
                    <button 
                        className={`px-3 py-2 text-sm font-semibold transition-all ${
                            view === 'list' 
                                ? 'text-emerald-700 border-b-2 border-emerald-600' 
                                : 'text-gray-600 hover:text-emerald-600'
                        }`} 
                        onClick={() => setView('list')}
                    >
                        View Receipts
                    </button>
                    <button 
                        className={`px-3 py-2 text-sm font-semibold transition-all ${
                            view === 'add' 
                                ? 'text-emerald-700 border-b-2 border-emerald-600' 
                                : 'text-gray-600 hover:text-emerald-600'
                        }`} 
                        onClick={() => setView('add')}
                    >
                        Add Receipt
                    </button>
                  
                </div>

                {/* --- ADD RECEIPT View --- */}
                {view === 'add' && (
                    <div className="p-0 bg-white rounded-xl pt-4"> {/* Added top padding for separation */}
                        <h2 className="text-xl font-bold text-gray-700 mb-5">New Receipt Entry</h2> {/* Increased bottom margin */}
                        {/* Removed: Border line after subheading */}

                        <form onSubmit={handleSubmit} className="space-y-4"> {/* Reduced vertical spacing */}
                            
                            {/* Receipt No. & Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Reduced gap */}
                                <div className="flex flex-col">
                                    <label className="font-medium text-gray-600 mb-1">Reception No.</label>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={recieptnum}
                                        className="p-3 border border-emerald-400 bg-emerald-50 rounded-lg cursor-not-allowed text-sm font-mono" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-medium text-gray-600 mb-1">Date</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            max={today} 
                                            value={date} 
                                            onChange={(e) => setDate(e.target.value)} 
                                            required 
                                            className="p-3 w-full border border-emerald-400 rounded-lg transition input-style-custom text-sm" 
                                        />
                                        <i className="fas fa-calendar-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mobile Number & Suggestions */}
                            <div className="flex flex-col relative">
                                <label className="font-medium text-gray-600 mb-1">Mobile Number</label>
                                <input 
                                    type="text" 
                                    value={MobileNumber} 
                                    onChange={handleChange} 
                                    placeholder="Enter 10-digit mobile number..." 
                                    required 
                                    minLength="10" 
                                    maxLength="10"
                                    className="p-3 border border-emerald-400 rounded-lg transition input-style-custom text-sm" 
                                />
                                {suggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-lg shadow-lg max-h-36 overflow-y-auto">
                                        {suggestions.map((patient, index) => (
                                            <li 
                                                key={index} 
                                                onClick={() => handleSelect(patient)} 
                                                className="p-2 cursor-pointer hover:bg-emerald-50 transition border-b border-gray-100 text-sm"
                                            >
                                                <i className="fas fa-user-check text-emerald-500 mr-2"></i>
                                                {patient.whatsapp_number}{" "}
                                                <span className="text-gray-500 text-xs">({patient.patient_name})</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Patient Details (Conditional on Mobile Number length) */}
                            {MobileNumber.length >=10 && (
                                <>
                                    <div className="flex flex-col">
                                        <label className="font-medium text-gray-600 mb-1">Patient Name</label>
                                        <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g., John Doe" required className="p-3 border border-emerald-400 rounded-lg transition input-style-custom text-sm" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-medium text-gray-600 mb-1">Father's Name</label>
                                        <input type="text" value={fatherName} onChange={(e) => setfatherName(e.target.value)} placeholder="e.g., Jane Doe" required className="p-3 border border-emerald-400 rounded-lg transition input-style-custom text-sm" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> {/* Reduced gap */}
                                        <div className="flex flex-col">
                                            <label className="font-medium text-gray-600 mb-1">Sex</label>
                                            <select value={sex} onChange={(e) => setSex(e.target.value)} required className="p-3 border border-emerald-400 rounded-lg transition input-style-custom appearance-none bg-white text-sm">
                                                <option value="" disabled>Select Sex</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="font-medium text-gray-600 mb-1">Date of Birth</label>
                                            <input max={today} type="date" value={dob} onChange={(e) => setdob(e.target.value)} className="p-3 border border-emerald-400 rounded-lg transition input-style-custom text-sm" />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="font-medium text-gray-600 mb-1">Age</label>
                                            <input type="text" min="0" value={age} readOnly placeholder="e.g., 35" required className="p-3 border border-emerald-400 bg-emerald-50 rounded-lg transition input-style-custom text-sm" />
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {/* Amount */}
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-600 mb-1">Amount (₹)</label>
                                <input min={1} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 500" required className="p-3 border border-emerald-400 rounded-lg transition input-style-custom font-semibold text-sm" />
                            </div>

                            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold text-base rounded-lg shadow-md hover:bg-emerald-700 transition transform hover:scale-[1.01] mt-6"> {/* Increased top margin for button */}
                                <i className="fas fa-save mr-2"></i> Save Receipt
                            </button>
                        </form>
                    </div>
                )}

                {/* --- LIST RECEIPT View --- */}
                {view === 'list' && (
                    <div className="p-0 bg-white rounded-xl pt-4"> {/* Added top padding for separation */}
                        <h2 className="text-xl font-bold text-gray-700 mb-5">Receipt History</h2> {/* Increased bottom margin */}

                        {/* Date Filters */}
                        <div className="grid grid-cols-2 gap-4 mb-4"> {/* Reduced gap and margin */}
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-600 mb-1">From Date</label>
                                <input type="date" value={fromdate} onChange={(e) => setfromdate(e.target.value)} className="p-3 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-600 mb-1">To Date</label>
                                <input type="date" value={todate} onChange={(e) => settodate(e.target.value)} className="p-3 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        </div>
                        
                        {/* Search & Download */}
                        <div className="flex items-center space-x-3 mb-4">
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                placeholder="🔍 Search by name or mobile number..." 
                                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" 
                            />
                            <button onClick={downloadPDF} className="p-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition">
                                <Download/>
                            </button>
                        </div>
                        
                        {/* Table */}
                        {/* <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 w-full">
                            <table id="receipt-list-table" className="min-w-full"> 
                                <thead className="bg-gray-50 border-b border-gray-300">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rec. No.</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Patient Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Father Name</th>
                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {filteredPatients.slice().reverse().map((patient) => (
                                        <tr key={patient.id} className="hover:bg-emerald-50 transition border-b border-gray-100 last:border-b-0">
                                            <td className="px-4 py-2 whitespace-nowrap text-xs font-mono text-gray-900">{patient.id}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">{patient.date}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{patient.name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">{patient.fatherName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-right text-emerald-700">₹{patient.amount}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center text-xs font-medium">
                                                <div className="flex justify-center space-x-2">
                                                    <button 
                                                        onClick={() =>{patient.brackup?generatePDFbrackup(patient.brackup, patient):navigate('/brackup',{ state: patient }) }}
                                                        className="py-1 w-27 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
                                                    >
                                                        {patient.brackup ? 'View Bill' : 'Create Bill'}
                                                    </button>
                                                    <button 
                                                        onClick={() => generatePDF(patient)}
                                                        className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                                                    >
                                                        Receipt
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate('/editamount', { state: patient })}
                                                        className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPatients.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500 italic">
                                                No receipts found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div> */}
                        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 w-full">
  <table id="receipt-list-table" className="min-w-full block md:table">
    <thead className="hidden md:table-header-group bg-gray-50 border-b border-gray-300">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rec. No.</th>
        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date/Patient</th>
        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Father Name</th>
        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white block md:table-row-group">
      {filteredPatients.slice().reverse().map((patient) => (
        <tr key={patient.id} className="hover:bg-emerald-50 transition border-b border-gray-100 last:border-b-0 block md:table-row p-1 md:p-0">
          
          {/* Mobile Label for Rec No */}
          <td className="md:table-cell px-4 py-2 whitespace-nowrap text-xs font-mono text-gray-900 block md:before:content-none before:content-['Rec_No:'] before:font-bold before:mr-2">
            {patient.id}
          </td>

          {/* Combined Name and Date for Mobile */}
          <td className="md:table-cell px-4 py-2 block md:table-cell">
            <div className="text-xs font-medium text-gray-900">{patient.name}</div>
            <div className="text-[10px] text-gray-500 md:text-xs">{patient.date}</div>
          </td>

          {/* Hidden on small mobile, visible on desktop */}
          <td className="hidden lg:table-cell px-4 py-2 whitespace-nowrap text-xs text-gray-700">
            {patient.fatherName}
          </td>

          <td className="md:table-cell px-4 py-2 whitespace-nowrap text-sm font-bold md:text-right text-emerald-700 block md:before:content-none before:content-['Amount:'] before:mr-2">
            ₹{patient.amount}
          </td>

          <td className="md:table-cell px-4 py-4 md:py-2 whitespace-nowrap text-center text-xs font-medium block">
            <div className="flex justify-start md:justify-center space-x-2">
              <button 
                onClick={() =>{patient.brackup?generatePDFbrackup(patient.brackup, patient):navigate('/brackup',{ state: patient }) }}
                className="flex-1 md:flex-none py-1.5 px-3 text-[10px] font-semibold rounded-full bg-yellow-100 text-yellow-800"
              >
                {patient.brackup ? 'View Bill' : 'Create Bill'}
              </button>
              <button 
                onClick={() => generatePDF(patient)}
                className="px-3 py-1.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800"
              >
                Receipt
              </button>
              <button 
                onClick={() => navigate('/editamount', { state: patient })}
                className="px-3 py-1.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-800"
              >
                Edit
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
                    </div>
                )}
            </div>


            
            {/* --- Receipt/Print Modal --- */}
            {isReceiptModalOpen && selectedPatient && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 no-print">
                    <ReceiptTemplate 
                        patient={selectedPatient} 
                        close={handleCloseReceiptModal}
                    />
                </div>
            )}

            {/* --- Bill Breakup Modal (PLACEHOLDER) --- */}
            {isBreakupModalOpen && selectedPatient && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 no-print" onClick={handleCloseBreakupModal}>
                    <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-md text-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                            <h2 className="text-lg font-bold text-gray-800">Bill Breakup (Placeholder)</h2>
                            <button onClick={handleCloseBreakupModal} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                        </div>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>Patient:</strong> {selectedPatient.name}</p>
                            <p><strong>Receipt No:</strong> <span className="font-mono">{selectedPatient.id}</span></p>
                            <p><strong>Total Amount:</strong> <span className="font-bold text-base text-emerald-600">₹{selectedPatient.amount.toFixed(2)}</span></p>
                            <p className="pt-2 text-xs italic border-t mt-3">
                                Detailed service breakdown would be displayed here.
                            </p>
                        </div>
                        <div className="flex justify-end pt-3">
                            <button onClick={handleCloseBreakupModal} className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Makebill;