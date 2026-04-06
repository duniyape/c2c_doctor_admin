import React, { useEffect, useState } from 'react'

import { Link } from 'react-router';

import Swal from 'sweetalert2'
import axios from 'axios';
import Cookies from 'js-cookie';
// Utility to merge inline styles (for cleaner JSX)
const mergeStyles = (defaultStyle, newStyles) => ({ ...defaultStyle, ...newStyles });


const Payment = () => {

    
  const USER_ID =  Cookies.get('user');
  const BASE_API_URL = 'https://api.care2connect.in';

  // Note: The json_parameter object is static and not used in the component's logic, so it is removed for clarity.

  const [fee, setfee] = useState('');
  const [loading, setLoading] = useState(true);
  const [originalFee, setOriginalFee] = useState(''); // To track if changes were made


  // --- Data Fetching ---
  useEffect(() => {
    const fetchdata = async () => {
      setLoading(true);
      try {
        let res = await axios.post(
          `${BASE_API_URL}/get_profile/${USER_ID}/`,
          {}, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "1234",
          },
        }
        );
        const fetchedFee = res.data.appointmentfee || '';
        setfee(fetchedFee);
        setOriginalFee(fetchedFee); // Store original fee
        setLoading(false);

      } catch (error) {
        console.error("Error fetching user profile:", error);
        Swal.fire("Error!", "Failed to load payment settings.", "error");
        setLoading(false);
      }
    };
    fetchdata();
  }, []); 

  // --- Update Handler ---
  const updates = () => {
    if (fee === originalFee) {
        Swal.fire('No Changes', 'The appointment fee is the same as the saved value.', 'info');
        return;
    }
      
    Swal.fire({
      title: "Confirm Update",
      text: "You are about to set the new appointment fee to " + fee,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#17a2b8", // Updated button color
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Yes, Update!"
    }).then(async (result) => {
      if (result.isConfirmed) {

        try {
          await axios.post(
            `${BASE_API_URL}/update_user/${USER_ID}/`,
            { appointmentfee: fee }, {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "1234",
            },
          }
          );
          Swal.fire({
            title: "Updated!",
            text: "Your appointment fee has been updated.",
            icon: "success"
          });
          setOriginalFee(fee); // Update original fee after successful save

        } catch (error) {
          console.error("Error updating user profile:", error);
          Swal.fire("Error!", "Failed to update settings.", "error");
        }
      }
    });
  }

  // --- Conditional Rendering for Loading ---
  if (loading) {
    return (
      <div style={mergeStyles(styles.root, { justifyContent: 'center', alignItems: 'center' })}>
        <p style={styles.loadingText}>Loading Payment Settings...</p>
      </div>
    );
  }

  // --- UI Layout ---
  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Payment Parameters</h2>

        {/* Input Group with better alignment */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Appointment Fee (in currency)</label>
          <div style={styles.inputWrapper}>
            <input 
              value={fee} 
              onChange={(e) => setfee(e.target.value)} 
              style={styles.input} 
              type="number" 
              placeholder="Enter fee amount"
              min="0"
            />
          </div>
        </div>

        {/* Save Button */}
        <div style={styles.buttonGroup}>
          <button className='bg-emerald-600' style={styles.saveButton} onClick={updates} disabled={!fee || fee === originalFee}>
            Save Setting 
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Updated Inline Styles for better UI/UX ---
const styles = {
    root: {

   
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 0',
        fontFamily: 'Arial, sans-serif',
    },
    container: {
        width: "100%",
        maxWidth: "400px", // Maximum width for a clean look
        background: 'white',
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        display: 'flex',
        flexDirection: 'column',
    },
    heading: { 
        fontSize: "1.2rem", 
        marginBottom: "25px", 
        color: '#343a40',
        textAlign: 'center',
        fontWeight: '600',
    },
    loadingText: {
        color: '#6c757d',
        fontSize: '1rem',
    },
    
    // --- Form Inputs (Improved Grid Layout) ---
    inputGroup: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr', // Label and Input in two columns
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
    },
    label: {
        color: '#495057',
        fontSize: '0.95rem',
        textAlign: 'left',
        fontWeight: '500', // Slightly bolder for better readability
    },
    inputWrapper: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
    },
    input: {
        padding: '10px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        fontSize: '1rem',
        color: '#495057',
        width: '100%',
        boxSizing: 'border-box',
        textAlign: 'right', // Align number input content to the right
    },

    // --- Buttons ---
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        margin: '10px 0 0',
    },
    saveButton: {
        // backgroundColor: '#17a2b8', // Info/Secondary color for main action
        color: 'white',
        border: 'none',
        padding: '12px 25px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'background-color 0.3s',
        width: '100%',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        '&:hover': {
            backgroundColor: '#138496',
        },
        '&:disabled': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
        }
    },
};

export default Payment;