import React, { useState, useEffect } from 'react';
import axios from 'axios';


const initialAppointmentData = [];

// --- Define Modern Styles as JavaScript Objects ---
const styles = {
  // 1. Enhanced Card Design
  cardContainer: {
    fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: '30px',
    backgroundColor: '#ffffff', // Clean white background
    borderRadius: '16px', // More rounded corners
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)', // Pronounced, soft shadow
    maxWidth: '1100px',
    margin: '5px auto',
    border: '1px solid #e0e0e0',
  },
  // 2. Prominent Header
  header: {
    fontSize: '28px',
    fontWeight: 700,
    // color: '#1a73e8', // Stronger primary blue
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e0e0e0', // Thicker separator
  },
  // Date Selector Styles
  dateSelectorContainer: {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid #e0e0e0',
  },
  dateLabel: {
      fontWeight: 600,
      color: '#343a40',
  },
  dateInput: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '15px',
      cursor: 'pointer',
  },
  // 3. Sleek Table Design
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  },
  // Table Header
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    // backgroundColor: '#1a73e8', // Primary blue header
    // color: 'white',
    fontWeight: 700,
    fontSize: '14px',
    textTransform: 'uppercase',
  },
  // Table Data
  td: {
    borderBottom: '1px solid #dee2e6',
    padding: '15px 20px',
    textAlign: 'left',
    backgroundColor: '#ffffff',
    fontSize: '14px',
  },
  // Dynamic styles for selected row
  selectedRow: {
    backgroundColor: '#e6f0ff', // Very light blue highlight for selection
  },
  // Status Indicator Styles (Pills)
  statusBase: {
    display: 'inline-block',
    padding: '5px 12px',
    borderRadius: '25px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statusAccepted: {
    backgroundColor: '#e6ffed', // Soft light green
    color: '#006400', // Dark forest green text
  },
  statusRejected: {
    backgroundColor: '#ffe6e6', // Soft light red
    color: '#cc0000', // Deep red text
  },
  statusPending: {
    backgroundColor: '#fffbe6', // Soft light yellow
    color: '#997a00', // Dark yellow-brown text
  },
  // Footer and Button Styles
  footerContainer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // New style for the button group using Flexbox
  buttonGroup: {
    display: 'flex',
    gap: '15px', 
    alignItems: 'center',
  },
  // 4. Modern Button Styling
  buttonBase: {
    padding: '12px 22px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '15px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  acceptButton: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState(initialAppointmentData);
  const [selectedAppointments, setSelectedAppointments] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  // NEW STATE: Date selection, initialized to the date from the original API call
  const [selectedDate, setSelectedDate] = useState('2025-11-16'); 

  const allAppointmentIds = appointments.map(item => item.appoint_number);
  const selectedCount = selectedAppointments.size;
  const isActionDisabled = selectedCount === 0;

  // Handler for date change
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  // API Fetch Hook - Now depends on selectedDate
  useEffect(() => {
    // Clear selection when data changes
    setSelectedAppointments(new Set()); 

    if (!selectedDate) {
        console.warn("Date not selected. Aborting API fetch.");
        setAppointments([]);
        return;
    }

    const fetchAppointments = async () => {
      // API endpoint now uses the selectedDate state
      const apiUrl = `https://api.care2connect.in/get_refund_user/${selectedDate}`;
      
      console.log(`Fetching appointments for ${selectedDate} from: ${apiUrl}`);

      try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Assuming the returned data array structure matches the appointment structure
          setAppointments(data);
          console.log(`Successfully fetched and set ${data.length} appointment(s).`);
        } else {
          console.warn("API returned data is not an array. Using mock data.", data);
          setAppointments(initialAppointmentData); 
        }
        
      } catch (error) {
        console.error("Failed to fetch appointment data. Using mock data:", error);
        setAppointments(initialAppointmentData);
      }
    };
    
    fetchAppointments();
    
  }, [selectedDate]); // Dependency added: fetch runs whenever selectedDate changes


  useEffect(() => {
    const isAll = appointments.length > 0 && selectedCount === appointments.length;
    setIsAllSelected(isAll);
  }, [selectedCount, appointments.length]);

  const handleSelectRow = (appointNumber) => {
    setSelectedAppointments(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(appointNumber)) {
        newSelected.delete(appointNumber);
      } else {
        newSelected.add(appointNumber);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAppointments(new Set());
    } else {
      setSelectedAppointments(new Set(allAppointmentIds));
    }
  };

  const handleBulkAction = (action) => {
    if (isActionDisabled) return;

    // Filter the complete appointment data based on the selected IDs
    const selectedDataArray = appointments.filter(app => 
      selectedAppointments.has(app.appoint_number)
    );

    // Log the array of complete data objects (as requested)
    console.log(`--- ${action.toUpperCase()} ACTION ---`);
    console.log(`Selected Appointment Data for bulk action:`, selectedDataArray);
    if (action==='Accept') {
        sendbroadcart(selectedDataArray)
    }

    const newStatus = action.toLowerCase();
    
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        selectedAppointments.has(app.appoint_number)
          ? { ...app, status: newStatus } 
          : app
      )
    );

    setSelectedAppointments(new Set()); 
    // Using alert as it was in the original code, but note that in a real app, this should be a custom toast/modal.
    alert(`${action}d ${selectedCount} appointments. Check the console for the array of selected data.`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
        return { ...styles.statusBase, ...styles.statusAccepted };
      case 'rejected':
        return { ...styles.statusBase, ...styles.statusRejected };
      default:
        return { ...styles.statusBase, ...styles.statusPending };
    }
  };


  const sendbroadcart=async(data)=>{



  for (let i = 0; i < data.length; i++) {
    const element = data[i];


    // const dd = waitwatch(element.whatsapp_number)

     const accessToken = 'EACHqNPEWKbkBO33utbtE1EMW5T1B8KlYqSpLDepuZCdrEY9unIfGmwnlZB4XgfEFQw2ohjGAAoBL1OHY08kftSW0ZBEvX5eXIodrY2gghys3IEoyoKwZCvHh0ZBd7I6eB9ttTEV1fsghWvpzycfIr5pIVIeftLpO0jlFLp9FZB31dd48QZCzmYSxSvKuIFkZAOlchwZDZD'; // Replace with your token
  const phoneNumberId = '563776386825270'; // Replace with your number ID


  const payload={
  "messaging_product": "whatsapp",
  "to": element.whatsapp_number,
  "type": "template",
  "template": {
    "name": "cancel_ap",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": element.date_of_appointment  // Example: "Indrajeet"
          },
          {
            "type": "text",
            "text": element.time_slot  // Example: "123456"
          }
        ]
      }
    ]
  }
}



        const kk = await axios.post(
          `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log(kk)



  }






}


  return (
    <div style={styles.cardContainer}>
      <h2 className='text-emerald-600' style={styles.header}>Refund Patients</h2>
      
      {/* --- NEW: Date Selection Input --- */}
      <div style={styles.dateSelectorContainer}>
          <label htmlFor="appointment-date" style={styles.dateLabel}>Select Appointment Date:</label>
          <input
              type="date"
              id="appointment-date"
              value={selectedDate}
              onChange={handleDateChange}
              style={styles.dateInput}
          />
      </div>
      {/* ---------------------------------- */}

      <table style={styles.table}>
        <thead>
          <tr className='bg-gray-100'>
            <th style={{ ...styles.th, width: '40px' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                disabled={appointments.length === 0}
              />
            </th>
            <th style={{ ...styles.th, width: '30%' }}>Patient Name</th>
            <th style={styles.th}>WhatsApp Number</th>
            <th style={styles.th}>Time Slot</th>
            {/* <th style={{ ...styles.th, width: '15%' }}>Status</th> */}
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>No appointments found.</td>
            </tr>
          ) : (
            appointments.map((appointment, index) => {
              const isSelected = selectedAppointments.has(appointment.appoint_number);
              return (
                <tr 
                  key={appointment.appoint_number} 
                  style={isSelected ? styles.selectedRow : {}} // Highlight selected rows
                >
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(appointment.appoint_number)}
                    />
                  </td>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#343a40' }}>
                    {appointment.patient_name}
                  </td>
                  <td style={styles.td}>{appointment.whatsapp_number}</td>
                  <td style={styles.td}>{appointment.time_slot}</td>
                  
                  {/* Status Column with Pill Styling */}
                  {/* <td style={styles.td}>
                      <span style={getStatusStyle(appointment.status)}>
                          {appointment.status.toUpperCase()}
                      </span>
                  </td> */}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* --- Footer / Bulk Action Area --- */}
      <div style={styles.footerContainer}>
        <div style={{ fontWeight: '600', color: '#6c757d' }}>
          {selectedCount} Appointment(s) Selected
        </div>
        
        <div style={styles.buttonGroup}> 
          <button 
            style={{ 
              ...styles.buttonBase, 
              ...styles.acceptButton, 
              ...(isActionDisabled ? styles.disabledButton : {})
            }}
            onClick={() => handleBulkAction('Accept')}
            disabled={isActionDisabled}
          >
            Accept ({selectedCount})
          </button>
          <button 
            style={{ 
              ...styles.buttonBase, 
              ...styles.rejectButton,
              ...(isActionDisabled ? styles.disabledButton : {})
            }}
            onClick={() => handleBulkAction('Reject')}
            disabled={isActionDisabled}
          >
            Reject ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;