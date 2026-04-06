
import { PDFViewer } from '@react-pdf/renderer';
import DoctorBillPDF from './DoctorBillPDF';
import { pdf } from '@react-pdf/renderer';
import { useLocation } from "react-router-dom";
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import Reciept from './Reciept';

 const API_BASE_URL_TO = import.meta.env.VITE_API_URL;
const EditReceipt = () => {
    const navi = useNavigate()
     const location = useLocation();
  const patientdata = location.state;


    const [editamount, seteditamount] = useState(patientdata.amount)

    const [editname, seteditname] = useState(patientdata.name)
    const [editfname, seteditfname] = useState(patientdata.fatherName)



    const generatePDF = async (e) => {
        e.preventDefault();

        Swal.fire({
    title: "Are you sure?",
    text: "You want to update amount",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Update",
    cancelButtonText: "No, Cancel",
  }).then(async(result) => {
    if (result.isConfirmed) {

    
        try {

 
        

              const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});

  try {
    const response = await api.post(`/patient_amount_update/${patientdata._id}`,{amount:editamount,name:editname,fatherName:editfname}); 
    console.log('Description fetched:', response.data);
  } catch (error) {
    console.error('Error fetching description:', error);
  }

            navi('/makebill')
            const blob = await pdf(<Reciept s={{...patientdata,amount:editamount,name:editname,fatherName:editfname}}/>).toBlob();
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


        }
  });
    };


const gotoedit=async()=>{
                  const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});

if (parseFloat(editamount)===parseFloat(patientdata.amount)) {
    navi('/updatebrackup', { state: {...patientdata,amount:editamount,name:editname,fatherName:editfname} })
    // console.log('done1');

}else if (parseFloat(editamount)>0) {
    try {
    const response = await api.post(`/patient_amount_update/${patientdata._id}`,{amount:editamount,name:editname,fatherName:editfname}); 
    // console.log('done2');
    navi('/updatebrackup', { state: {...patientdata,amount:editamount,name:editname,fatherName:editfname} })
  } catch (error) {
    console.error('Error fetching description:', error);
  }
}else{
Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Fill valid amount!",
    });
}

  
}



const [view, setView] = useState('billForm'); // Current view: 'add', 'list', or 'billForm'
    const [selectedPatient, setSelectedPatient] = useState(patientdata);

    

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
                                <h2>Edit Receipt Amount</h2>
                            </div>

                                <form onSubmit={generatePDF}>
                                    <div className="bill-form-group">
                                        <label htmlFor="billNo" className="bill-form-label">Bill No</label>
                                        <input type="text" id="billNo" value={selectedPatient.id} readOnly className="bill-form-input" />
                                    </div>
                                    <div className="bill-form-group">
                                        <label htmlFor="patientName" className="bill-form-label">Patient Name</label>
                                        <input type="text" id="patientName" defaultValue={editname} onChange={(e)=>seteditname(e.target.value)} className="bill-form-input" />
                                    </div>
                                     <div className="bill-form-group">
                                        <label htmlFor="patientName" className="bill-form-label">Father`s Name</label>
                                        <input type="text" id="patientName" defaultValue={editfname} onChange={(e)=>seteditfname(e.target.value)} className="bill-form-input" />
                                    </div>
                                    <div className="bill-form-group">
                                        <label htmlFor="amount" className="bill-form-label">Amount</label>
                                        <input required type="text" id="amount" defaultValue={editamount} onChange={(e)=>seteditamount(e.target.value)} className="bill-form-input" />
                                    </div>



                                        <button
                                            // onClick={generatePDF}
                                            className="bill-form-button next-button"
                                            style={{ width: '100%' }}
                                            type="submit"
                                            
                                        >
                                            Update & View PDF
                                        </button>

                       
                                </form>


                              {selectedPatient.brackup&&   <button
                                            onClick={gotoedit}
                                            className="bill-form-button next-button"
                                            style={{ width: '100%' , marginTop:10}}
                           
                                            
                                        >
                                            Proceed to Edit Bill
                                        </button>}

                          

                        </div>
                    </div>
                )}
            </div>

          
        </>

                </div>
            )



}

export default EditReceipt