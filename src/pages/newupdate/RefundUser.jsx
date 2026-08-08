// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import moment from 'moment';
// import Cookies from 'js-cookie';

// const API_BASE_URL_TO = import.meta.env.VITE_API_URL;

// const initialAppointmentData = [];

// const AppointmentTable = () => {
//   const [appointments, setAppointments] = useState(initialAppointmentData);
//   const [selectedAppointments, setSelectedAppointments] = useState(new Set());
//   const [isAllSelected, setIsAllSelected] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  
//   // States: Loading indicator
//   const [isLoading, setIsLoading] = useState(false);
  
//   // State: Time Slot Filter
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState('All');

//   // Filter type ('non-refunded' or 'refunded')
//   const [activeFilter, setActiveFilter] = useState('non-refunded');

//   // Custom Alert/Confirmation Modal State
//   const [alertConfig, setAlertConfig] = useState({
//     isOpen: false,
//     type: 'success', // 'success' | 'confirm' | 'error'
//     title: '',
//     message: '',
//     onConfirm: null // Callback function for confirmation actions
//   });

//   // Extract unique time slots from the fetched appointments list for the filter dropdown
//   const uniqueTimeSlots = ['All', ...new Set(appointments.map(app => app.time_slot).filter(Boolean))];

//   // Combined Filter logic: splits data using the refund_id key AND filters by time_slot if selected
//   const filteredAppointments = appointments.filter(app => {
//     const hasRefundId = app.hasOwnProperty('refund_id') && app.refund_id !== null && app.refund_id !== '';
//     const matchesRefundFilter = activeFilter === 'refunded' ? hasRefundId : !hasRefundId;
//     const matchesTimeFilter = selectedTimeSlot === 'All' || app.time_slot === selectedTimeSlot;

//     return matchesRefundFilter && matchesTimeFilter;
//   });

//   const allFilteredIds = filteredAppointments.map(item => item._id);
//   const selectedCount = selectedAppointments.size;
  
//   const isRefundedFilter = activeFilter === 'refunded';
//   const shouldShowActionButton = selectedCount > 0 && !isRefundedFilter;
//   const actionButtonText = isRefundedFilter ? `Refund This (${selectedCount})` : `Refund (${selectedCount})`;

//   const handleDateChange = (event) => {
//     setSelectedDate(event.target.value);
//   };

//   const handleTimeSlotChange = (event) => {
//     setSelectedTimeSlot(event.target.value);
//     setSelectedAppointments(new Set()); 
//   };

//   // Helper to trigger custom alerts
//   const triggerAlert = (type, title, message, onConfirm = null) => {
//     setAlertConfig({
//       isOpen: true,
//       type,
//       title,
//       message,
//       onConfirm
//     });
//   };

//   const closeAlert = () => {
//     setAlertConfig(prev => ({ ...prev, isOpen: false }));
//   };

//   // API Fetch Hook
//   useEffect(() => {
//     setSelectedAppointments(new Set()); 
//     setSelectedTimeSlot('All'); 

//     if (!selectedDate) {
//         console.warn("Date not selected. Aborting API fetch.");
//         setAppointments([]);
//         return;
//     }

//     const fetchAppointments = async () => {
//       setIsLoading(true);
//       const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
//       const userCookie = Cookies.get('user');
//       const apiUrl = `${API_BASE_URL_TO}/get_appointments/${formattedDate}/${userCookie}`;
      
//       try {
//         const response = await fetch(apiUrl);
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
//         const data = await response.json();
//         if (Array.isArray(data)) {
//           let filteredData = data.filter((item)=>(parseFloat(item.amount)>0));
//           setAppointments(filteredData);
//         } else {
//           setAppointments(initialAppointmentData); 
//         }
//       } catch (error) {
//         console.error("Failed to fetch appointment data:", error);
//         setAppointments(initialAppointmentData);
//         triggerAlert('error', 'Fetch Failed', 'Could not load appointment data from server.');
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchAppointments();
//   }, [selectedDate]); 

  
//   // Sync "Select All" state with the current visibility of rows
//   useEffect(() => {
//     const isAll = filteredAppointments.length > 0 && filteredAppointments.every(app => selectedAppointments.has(app._id));
//     setIsAllSelected(isAll);
//   }, [selectedAppointments, filteredAppointments]);

//   const handleSelectRow = (appointNumber) => {
//     setSelectedAppointments(prevSelected => {
//       const newSelected = new Set(prevSelected);
//       if (newSelected.has(appointNumber)) {
//         newSelected.delete(appointNumber);
//       } else {
//         newSelected.add(appointNumber);
//       }
//       return newSelected;
//     });
//   };

//   const handleSelectAll = () => {
//     if (isAllSelected) {
//       setSelectedAppointments(prev => {
//         const next = new Set(prev);
//         allFilteredIds.forEach(id => next.delete(id));
//         return next;
//       });
//     } else {
//       setSelectedAppointments(prev => {
//         const next = new Set(prev);
//         allFilteredIds.forEach(id => next.add(id));
//         return next;
//       });
//     }
//   };

// // Intermediate function to prompt confirmation modal with list of records
//   const confirmBulkAction = (action) => {
//     // Filter the raw appointments array down to only the currently selected ones
//     const selectedArray = appointments.filter(app => 
//       selectedAppointments.has(app._id)
//     );

//     // Create a readable list of selected patient names
//     const patientNamesList = selectedArray.map(app => app.patient_name || "Unknown Patient");

//     triggerAlert(
//       'confirm',
//       'Confirm Action',
//       {
//         text: `Are you sure you want to process the bulk ${action.toLowerCase()} for ${selectedCount} patient record(s)?`,
//         items: patientNamesList // Pass the array of names here
//       },
//       () => executeBulkAction(action)
//     );
//   };

//   const executeBulkAction = async (action) => {
//     closeAlert(); // Close confirmation window
    
//     const selectedArray = appointments.filter(app => 
//       selectedAppointments.has(app._id)
//     );

//     const selectedDataArray = selectedArray.map(app => ({
//       "pay_id": 'pay_T3OxlfInpe693B',
//       "amount": app.amount,
//       "doctor_phone_id": app.doctor_phone_id,
//       "phone": app.whatsapp_number,
//       "name": app.patient_name,
//       "appointmentdate": app.date_of_appointment,
//       "timeslot": app.time_slot,
//       "doctor_name": Cookies.get('name') || "Dr. Unknown",
//     }));

//     if (selectedDataArray.length === 0) return;

//     try {
//       setIsLoading(true); 
//       const response = await axios.post(`${API_BASE_URL_TO}/function_refund/refund-payments`, selectedDataArray);

//       if (response.status === 200) {
//         setAppointments(prevAppointments => 
//           prevAppointments.map(app => 
//             selectedAppointments.has(app._id)
//               ? { ...app, refund_id: response.data?.refund_id || 'REF_UPDATED' } 
//               : app
//           )
//         );

//         setSelectedAppointments(new Set()); 
        
//         // Show Custom Success Alert
//         triggerAlert('success', 'Action Successful', `${action} processed successfully for ${selectedDataArray.length} records.`);
//       }

//     } catch (error) {
//       console.error(`Failed to execute ${action} on the server:`, error);
//       triggerAlert('error', 'Execution Error', `Server Error: Could not complete the bulk ${action} action.`);
//     } finally {
//       setIsLoading(false); 
//     }
//   };

//   const totalRefunded = appointments.filter(a => a.hasOwnProperty('refund_id') && a.refund_id !== null && a.refund_id !== '').length;
//   const totalNonRefunded = appointments.length - totalRefunded;

//   return (
//     <div className="font-sans p-7 bg-white rounded-2xl shadow-xl max-w-[1100px] mx-auto my-1 border border-gray-200 relative">
      
//       {/* CUSTOM MODAL ALERT/CONFIRMATION COMPONENT */}
//       {alertConfig.isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
//           <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden transform scale-100 transition-transform">
//             <div className={`p-5 border-b text-lg font-bold flex items-center gap-2 ${
//               alertConfig.type === 'confirm' ? 'text-blue-600 bg-blue-50 border-blue-100' :
//               alertConfig.type === 'error' ? 'text-red-600 bg-red-50 border-red-100' :
//               'text-emerald-600 bg-emerald-50 border-emerald-100'
//             }`}>
//               {alertConfig.type === 'confirm' && <span>⚠️</span>}
//               {alertConfig.type === 'success' && <span>✅</span>}
//               {alertConfig.type === 'error' && <span>❌</span>}
//               {alertConfig.title}
//             </div>
//            <div className="p-6 text-sm text-gray-600 leading-relaxed max-h-[350px] overflow-y-auto">
//               {/* If message configuration is an object containing text and list items */}
//               {typeof alertConfig.message === 'object' && alertConfig.message !== null ? (
//                 <div>
//                   <p className="mb-3 font-medium text-gray-800">{alertConfig.message.text}</p>
//                   <ul className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-100 divide-y divide-gray-200/60 max-h-[180px] overflow-y-auto list-none">
//                     {alertConfig.message.items.map((name, idx) => (
//                       <li key={idx} className="py-1.5 px-1 flex items-center gap-2 text-xs text-gray-700 font-semibold">
//                         <span className="text-emerald-500 font-bold">•</span> {name}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ) : (
//                 /* Fallback for regular string alert messages */
//                 alertConfig.message
//               )}
//             </div>
//             <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
//               {alertConfig.type === 'confirm' ? (
//                 <>
//                   <button 
//                     onClick={closeAlert}
//                     className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-xs rounded-md hover:bg-gray-100 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     onClick={alertConfig.onConfirm}
//                     className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md shadow-sm transition-colors"
//                   >
//                     Confirm
//                   </button>
//                 </>
//               ) : (
//                 <button 
//                   onClick={closeAlert}
//                   className={`px-5 py-2 text-white font-medium text-xs rounded-md shadow-sm transition-colors ${
//                     alertConfig.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
//                   }`}
//                 >
//                   OK
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <h2 className="text-2xl font-bold text-emerald-600 mb-6 pb-4 border-b border-gray-200">
//         Refund Patients
//       </h2>
      
//       {/* Top Bar Filters */}
//       <div className="mb-5 p-2.5 bg-gray-50 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-gray-200">
//         <div className="flex flex-wrap items-center gap-4">
//           <div className="flex items-center gap-2">
//             <label htmlFor="appointment-date" className="font-semibold text-gray-700 text-sm whitespace-nowrap">
//               Date:
//             </label>
//             <input
//                 type="date"
//                 id="appointment-date"
//                 value={selectedDate}
//                 onChange={handleDateChange}
//                 disabled={isLoading}
//                 className="py-2 px-3 rounded-md border border-gray-300 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
//             />
//           </div>

//           <div className="flex items-center gap-2">
//             <label htmlFor="timeslot-filter" className="font-semibold text-gray-700 text-sm whitespace-nowrap">
//               Time Slot:
//             </label>
//             <select
//               id="timeslot-filter"
//               value={selectedTimeSlot}
//               onChange={handleTimeSlotChange}
//               disabled={appointments.length === 0 || isLoading}
//               className="py-2 px-3 rounded-md border border-gray-300 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
//             >
//               {uniqueTimeSlots.map((slot) => (
//                 <option key={slot} value={slot}>
//                   {slot}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="flex bg-gray-200 p-1 rounded-lg self-start lg:self-auto">
//           <button
//             onClick={() => { setActiveFilter('non-refunded'); setSelectedAppointments(new Set()); }}
//             disabled={isLoading}
//             className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 disabled:opacity-50 ${
//               activeFilter === 'non-refunded' 
//                 ? 'bg-white text-gray-900 shadow-sm' 
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Appointments ({totalNonRefunded})
//           </button>
//           <button
//             onClick={() => { setActiveFilter('refunded'); setSelectedAppointments(new Set()); }}
//             disabled={isLoading}
//             className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 disabled:opacity-50 ${
//               activeFilter === 'refunded' 
//                 ? 'bg-emerald-600 text-white shadow-sm' 
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Refunded ({totalRefunded})
//           </button>
//         </div>
//       </div>

//       {/* Table Container */}
//       <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 min-h-[200px] relative">
//         <table className="w-full border-separate border-spacing-0">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700 w-10">
//                 {!isRefundedFilter && (
//                   <input
//                     type="checkbox"
//                     checked={isAllSelected}
//                     onChange={handleSelectAll}
//                     disabled={filteredAppointments.length === 0 || isLoading}
//                     className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
//                   />
//                 )}
//               </th>
//               <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700 w-[30%]">
//                 Patient Name
//               </th>
//               <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
//                 WhatsApp Number
//               </th>
//               <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
//                 Time Slot
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {isLoading ? (
//               <tr>
//                 <td colSpan="4" className="p-10 text-center bg-white">
//                   <div className="flex flex-col items-center justify-center gap-3">
//                     <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
//                     <span className="text-sm font-medium text-gray-500">Loading records...</span>
//                   </div>
//                 </td>
//               </tr>
//             ) : filteredAppointments.length === 0 ? (
//               <tr>
//                 <td colSpan="4" className="p-4 text-center text-sm text-gray-500 bg-white">
//                   No appointments found matching this criteria.
//                 </td>
//               </tr>
//             ) : (
//               filteredAppointments.map((appointment) => {
//                 const isSelected = selectedAppointments.has(appointment._id);
//                 return (
//                   <tr 
//                     key={appointment._id} 
//                     className={`transition-colors duration-150 ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
//                   >
//                     <td className="p-4 text-sm text-gray-700 border-b border-gray-200">
//                       {!isRefundedFilter && (
//                         <input
//                           type="checkbox"
//                           checked={isSelected}
//                           onChange={() => handleSelectRow(appointment._id)}
//                           className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
//                         />
//                       )}
//                     </td>
//                     <td className="p-4 text-sm font-semibold text-gray-800 border-b border-gray-200">
//                       {appointment.patient_name}
//                     </td>
//                     <td className="p-4 text-sm text-gray-600 border-b border-gray-200">
//                       {appointment.whatsapp_number}
//                     </td>
//                     <td className="p-4 text-sm text-gray-600 border-b border-gray-200">
//                       {appointment.time_slot}
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Footer Area */}
//       <div className="mt-7 pt-5 border-t border-gray-200 flex justify-between items-center min-h-[60px]">
//         <div className="font-semibold text-gray-500 text-sm">
//           {isLoading ? (
//             <span className="text-gray-400">Synchronizing...</span>
//           ) : !isRefundedFilter ? (
//             `${selectedCount} Appointment(s) Selected`
//           ) : (
//             "Viewing Refunded Records"
//           )}
//         </div>
        
//         <div className="flex gap-4 items-center"> 
//           {shouldShowActionButton && (
//             <button 
//               onClick={() => confirmBulkAction('Refund')}
//               disabled={isLoading}
//               className="py-3 px-6 rounded-lg font-semibold text-sm shadow-md transition-all duration-300 bg-green-600 text-white hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {actionButtonText}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentTable;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Cookies from 'js-cookie';

const API_BASE_URL_TO = import.meta.env.VITE_API_URL;

const initialAppointmentData = [];

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState(initialAppointmentData);
  const [selectedAppointments, setSelectedAppointments] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  
  // States: Loading indicator
  const [isLoading, setIsLoading] = useState(false);
  
  // State: Time Slot Filter
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('All');

  // Filter type upgraded to 3 choices: 'appointments' | 'processing' | 'refunded'
  const [activeFilter, setActiveFilter] = useState('appointments');

  // Custom Alert/Confirmation Modal State
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'confirm' | 'error'
    title: '',
    message: '',
    onConfirm: null // Callback function for confirmation actions
  });

  // Extract unique time slots from the fetched appointments list for the filter dropdown
  const uniqueTimeSlots = ['All', ...new Set(appointments.map(app => app.time_slot).filter(Boolean))];

  // Combined Filter logic: categorizes item based on refund_status values
  const filteredAppointments = appointments.filter(app => {
    // 1. Determine base refund categorization
    let itemStatus = 'appointments'; // default fallback
    
    if (app.refund_status === 'processing') {
      itemStatus = 'processing';
    } else if (app.refund_status === 'refunded' || (app.hasOwnProperty('refund_id') && app.refund_id !== null && app.refund_id !== '')) {
      itemStatus = 'refunded';
    }

    const matchesStatusFilter = activeFilter === itemStatus;
    const matchesTimeFilter = selectedTimeSlot === 'All' || app.time_slot === selectedTimeSlot;

    return matchesStatusFilter && matchesTimeFilter;
  });

  const allFilteredIds = filteredAppointments.map(item => item._id);
  const selectedCount = selectedAppointments.size;
  
  // Action buttons remain visible for un-refunded appointments
  const isActionableFilter = activeFilter === 'appointments';
  const shouldShowActionButton = selectedCount > 0 && isActionableFilter;
  const actionButtonText = `Process Bulk Refund (${selectedCount})`;

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeSlotChange = (event) => {
    setSelectedTimeSlot(event.target.value);
    setSelectedAppointments(new Set()); 
  };

  // Helper to trigger custom alerts
  const triggerAlert = (type, title, message, onConfirm = null) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm
    });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  // API Fetch Hook
  useEffect(() => {
    setSelectedAppointments(new Set()); 
    setSelectedTimeSlot('All'); 

    if (!selectedDate) {
        console.warn("Date not selected. Aborting API fetch.");
        setAppointments([]);
        return;
    }

    const fetchAppointments = async () => {
      setIsLoading(true);
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      const userCookie = Cookies.get('user');
      const apiUrl = `${API_BASE_URL_TO}/get_appointments/${formattedDate}/${userCookie}`;
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (Array.isArray(data)) {
          let filteredData = data.filter((item)=>(parseFloat(item.amount)>0));
          setAppointments(filteredData);
        } else {
          setAppointments(initialAppointmentData); 
        }
      } catch (error) {
        console.error("Failed to fetch appointment data:", error);
        setAppointments(initialAppointmentData);
        triggerAlert('error', 'Fetch Failed', 'Could not load appointment data from server.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, [selectedDate]); 

  // Sync "Select All" state with the current visibility of rows
  useEffect(() => {
    const isAll = filteredAppointments.length > 0 && filteredAppointments.every(app => selectedAppointments.has(app._id));
    setIsAllSelected(isAll);
  }, [selectedAppointments, filteredAppointments]);

  const handleSelectRow = (appointId) => {
    setSelectedAppointments(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(appointId)) {
        newSelected.delete(appointId);
      } else {
        newSelected.add(appointId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAppointments(prev => {
        const next = new Set(prev);
        allFilteredIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedAppointments(prev => {
        const next = new Set(prev);
        allFilteredIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  // Intermediate function to prompt confirmation modal with list of records
  const confirmBulkAction = (action) => {
    const selectedArray = appointments.filter(app => 
      selectedAppointments.has(app._id)
    );

    const patientNamesList = selectedArray.map(app => app.patient_name || "Unknown Patient");

    triggerAlert(
      'confirm',
      'Confirm Action',
      {
        text: `Are you sure you want to process the bulk ${action.toLowerCase()} for ${selectedCount} patient record(s)?`,
        items: patientNamesList
      },
      () => executeBulkAction(action)
    );
  };

  const executeBulkAction = async (action) => {
    closeAlert(); 
    
    const selectedArray = appointments.filter(app => 
      selectedAppointments.has(app._id)
    );

    const selectedDataArray = selectedArray.map(app => ({
      "pay_id": app.pay_id,
      "amount": app.amount,
      "doctor_phone_id": app.doctor_phone_id,
      "phone": app.whatsapp_number,
      "name": app.patient_name,
      "appointmentdate": app.date_of_appointment,
      "timeslot": app.time_slot,
      "doctor_name": Cookies.get('name') || "Dr. Unknown",
    }));

    if (selectedDataArray.length === 0) return;

    try {
      setIsLoading(true); 
      const doctor_id = Cookies.get('user');
      const response = await axios.post(`${API_BASE_URL_TO}/function_refund/refund-payments-request/${doctor_id}`, selectedDataArray);
      console.log(response)

      if (response.status === 200) {
        setAppointments(prevAppointments => 
          prevAppointments.map(app => 
            selectedAppointments.has(app._id)
              ? { 
                  ...app, 
                  refund_id: response.data?.refund_id || 'REF_UPDATED',
                  refund_status: 'processing' // Auto shift to complete filter view
                } 
              : app
          )
        );

        setSelectedAppointments(new Set()); 
        triggerAlert('success', 'Action Successful', `${action} processed successfully for ${selectedDataArray.length} records.`);
      }

    } catch (error) {
      console.error(`Failed to execute ${action} on the server:`, error);
      triggerAlert('error', 'Execution Error', `Server Error: Could not complete the bulk ${action} action.`);
    } finally {
      setIsLoading(false); 
    }
  };

  // Calculate badge dynamic values across entire response set
  const totalAppointmentsCount = appointments.filter(app => !app.refund_status).length;
  const totalPendingCount = appointments.filter(app => app.refund_status === 'processing').length;
  const totalRefundedCount = appointments.filter(app => app.refund_status === 'refunded').length;

  return (
    <div className="font-sans p-7 bg-white rounded-2xl shadow-xl max-w-[1100px] mx-auto my-1 border border-gray-200 relative">
      
      {/* CUSTOM MODAL ALERT/CONFIRMATION COMPONENT */}
      {alertConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden transform scale-100 transition-transform">
            <div className={`p-5 border-b text-lg font-bold flex items-center gap-2 ${
              alertConfig.type === 'confirm' ? 'text-blue-600 bg-blue-50 border-blue-100' :
              alertConfig.type === 'error' ? 'text-red-600 bg-red-50 border-red-100' :
              'text-emerald-600 bg-emerald-50 border-emerald-100'
            }`}>
              {alertConfig.type === 'confirm' && <span>⚠️</span>}
              {alertConfig.type === 'success' && <span>✅</span>}
              {alertConfig.type === 'error' && <span>❌</span>}
              {alertConfig.title}
            </div>
            <div className="p-6 text-sm text-gray-600 leading-relaxed max-h-[350px] overflow-y-auto">
              {typeof alertConfig.message === 'object' && alertConfig.message !== null ? (
                <div>
                  <p className="mb-3 font-medium text-gray-800">{alertConfig.message.text}</p>
                  <ul className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-100 divide-y divide-gray-200/60 max-h-[180px] overflow-y-auto list-none">
                    {alertConfig.message.items.map((name, idx) => (
                      <li key={idx} className="py-1.5 px-1 flex items-center gap-2 text-xs text-gray-700 font-semibold">
                        <span className="text-emerald-500 font-bold">•</span> {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                alertConfig.message
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {alertConfig.type === 'confirm' ? (
                <>
                  <button 
                    onClick={closeAlert}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-xs rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={alertConfig.onConfirm}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md shadow-sm transition-colors"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button 
                  onClick={closeAlert}
                  className={`px-5 py-2 text-white font-medium text-xs rounded-md shadow-sm transition-colors ${
                    alertConfig.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-emerald-600 mb-6 pb-4 border-b border-gray-200">
        Refund Patients
      </h2>
      
      {/* Top Bar Filters */}
      <div className="mb-5 p-2.5 bg-gray-50 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="appointment-date" className="font-semibold text-gray-700 text-sm whitespace-nowrap">
              Date:
            </label>
            <input
                type="date"
                id="appointment-date"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={isLoading}
                className="py-2 px-3 rounded-md border border-gray-300 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="timeslot-filter" className="font-semibold text-gray-700 text-sm whitespace-nowrap">
              Time Slot:
            </label>
            <select
              id="timeslot-filter"
              value={selectedTimeSlot}
              onChange={handleTimeSlotChange}
              disabled={appointments.length === 0 || isLoading}
              className="py-2 px-3 rounded-md border border-gray-300 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {uniqueTimeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Updated Three-way Filter Control Tab Container */}
        <div className="flex bg-gray-200 p-1 rounded-lg self-start lg:self-auto space-x-1">
          <button
            onClick={() => { setActiveFilter('appointments'); setSelectedAppointments(new Set()); }}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 disabled:opacity-50 ${
              activeFilter === 'appointments' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Appointments ({totalAppointmentsCount})
          </button>
          <button
            onClick={() => { setActiveFilter('processing'); setSelectedAppointments(new Set()); }}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 disabled:opacity-50 ${
              activeFilter === 'processing' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Processing ({totalPendingCount})
          </button>
          <button
            onClick={() => { setActiveFilter('refunded'); setSelectedAppointments(new Set()); }}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 disabled:opacity-50 ${
              activeFilter === 'refunded' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Refunded ({totalRefundedCount})
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 min-h-[200px] relative">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700 w-10">
                {isActionableFilter && (
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={filteredAppointments.length === 0 || isLoading}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                )}
              </th>
              <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700 w-[30%]">
                Patient Name
              </th>
              <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
                WhatsApp Number
              </th>
              <th className="p-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
                Time Slot
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="p-10 text-center bg-white">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-gray-500">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-sm text-gray-500 bg-white">
                  No records matching the "{activeFilter}" criteria.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => {
                const isSelected = selectedAppointments.has(appointment._id);
                return (
                  <tr 
                    key={appointment._id} 
                    className={`transition-colors duration-150 ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <td className="p-4 text-sm text-gray-700 border-b border-gray-200">
                      {isActionableFilter && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(appointment._id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-800 border-b border-gray-200">
                      {appointment.patient_name}
                    </td>
                    <td className="p-4 text-sm text-gray-600 border-b border-gray-200">
                      {appointment.whatsapp_number}
                    </td>
                    <td className="p-4 text-sm text-gray-600 border-b border-gray-200">
                      {appointment.time_slot}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Area */}
      <div className="mt-7 pt-5 border-t border-gray-200 flex justify-between items-center min-h-[60px]">
        <div className="font-semibold text-gray-500 text-sm capitalize">
          {isLoading ? (
            <span className="text-gray-400">Synchronizing...</span>
          ) : isActionableFilter ? (
            `${selectedCount} Appointment(s) Selected`
          ) : (
            `Viewing ${activeFilter} items`
          )}
        </div>
        
        <div className="flex gap-4 items-center"> 
          {shouldShowActionButton && (
            <button 
              onClick={() => confirmBulkAction('Refund')}
              disabled={isLoading}
              className="py-3 px-6 rounded-lg font-semibold text-sm shadow-md transition-all duration-300 bg-green-600 text-white hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;