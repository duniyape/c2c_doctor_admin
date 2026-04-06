
import axios from "axios";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { useLoader } from "../../loader/LoaderContext";
 const API_BASE_URL_TO = import.meta.env.VITE_API_URL;
 import Cookies from 'js-cookie';
// --- CUSTOM HOOKS ---
// Custom hook to get window size for responsiveness
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: undefined });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth });
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

// --- HELPER FUNCTIONS ---
// Converts a number to its word representation (e.g., 25 -> "Twenty Five")
const numberToWords = (num) => {
    if (num === null || num === "" || num < 0) return '';
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 200) return 'One Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    
    // Fallback for ages over 199, though unlikely.
    return num.toString();
};

// --- MAIN COMPONENT ---
export default function CurrentOPD() {

    const { showLoader, hideLoader } = useLoader();
  // --- STATE MANAGEMENT ---
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For API calls
  const [apiError, setApiError] = useState(""); // To show API errors

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    dob: "",
    appointmentDate: moment(new Date()).format('yyyy-MM-DD'),
    timeSlot: "", // Initially empty, will be set from API
    isVaccination: "No",
    paymentMode: "Cash",
    sex: 'Male'
  });
  
  // Time slots are now managed by state to be fetched from an API
  const [timeSlots, setTimeSlots] = useState([]);


  // --- RESPONSIVENESS LOGIC ---
  const { width } = useWindowSize();
  const isLaptopOrLarger = width ? width >= 992 : false;


  // --- EVENT HANDLERS & LOGIC ---

  // Get today's date for the date picker max value
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
 
  const handleChange = async () => {

     if (mobile.length !== 10) {
      setMobileError("Please enter a valid 10-digit mobile number.");
      setShowContent(false);
      return;
    }
    setMobileError("");
    setIsLoading(true);
    setApiError("");
    setShowContent(false);


  const api = axios.create({
    baseURL: API_BASE_URL_TO,
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/json",
    },
  });





    try {
      const response = await api.get(`/api/patients?search=91${mobile}`);
      
      // Axios me data yahan milta hai
      const data = response.data;

        console.log("Patients fetched:", data);
      if (data.length>0) {

        const unique = data.filter(
  (item, index, self) =>
    index === self.findIndex((obj) => obj.patient_name === item.patient_name)
);

        setPatients(unique);
        setIsNewPatient(false);
        setSelectedPatient(null);
        setShowContent(true);
        setIsLoading(false);
  
       
      }else{
        setPatients([]);
        setIsNewPatient(true);
        setSelectedPatient(null);
        setShowContent(true);
        setIsLoading(false);
      }

      
    } catch (error) {
      
      console.error("Error fetching patients:", error);
    }

};

  // Handles changes in form inputs
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  // Handles the final form submission
  const handleSubmit = async(e) => {
    e.preventDefault();
    showLoader()
    const finalAppointmentData = { mobile, ...formData, age: calculateAge(formData.dob),doctor_phone_id: Cookies.get('user'),email:'none',symptoms:'none',city:'none',address:'none',timestamp:Math.floor(Date.now() / 1000)};



     const api = axios.create({
    baseURL: API_BASE_URL_TO
   
  });

    try {
      const response = await api.post(`/book_appointment_current_opd`,finalAppointmentData);
      
      // Axios me data yahan milta hai
      const data = response.data;

        console.log("Patients fetched:", data);
        hideLoader()

        if (formData.paymentMode!=='Cash') {
          Swal.fire({
      icon: "success",
      title: "Payment link sent",
      html: `Payment link has been sent to <strong>${mobile}</strong>.`,
      confirmButtonText: "OK",
      backdrop: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setMobile('')
        setFormData({
    name: "",
    fatherName: "",
    dob: "",
    appointmentDate: moment(new Date()).format('yyyy-MM-DD'),
    timeSlot: "", // Initially empty, will be set from API
    isVaccination: "No",
    paymentMode: "Cash",
    sex: 'Male'
  })
      }
    });
        }else{
 Swal.fire({
      icon: "success",
      title: "Appointment Booked",
      html: `Your appointment is booked.<br>Appointment number is <strong>${data.appointment_index}</strong>.`,
      confirmButtonText: "OK",
      backdrop: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setMobile('')
        setFormData({
    name: "",
    fatherName: "",
    dob: "",
    appointmentDate: moment(new Date()).format('yyyy-MM-DD'),
    timeSlot: "", // Initially empty, will be set from API
    isVaccination: "No",
    paymentMode: "Cash",
    sex: 'Male'
  })
      }
    });
        }
      
    } catch (error) {

      hideLoader()
      console.error("Error fetching patients:", error);
      Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something went wrong!",
      confirmButtonText: "OK",
      backdrop: true,
    });
    }



    // if (isNewPatient) {
    //   console.log("Submitting New Patient & Appointment:", finalAppointmentData);
    //   alert(`New patient ${formData.name} added and appointment submitted!`);
    //   // Logic to add the new patient to the list would go here
    // } else {
    //   console.log("Submitting Appointment for Existing Patient:", finalAppointmentData);
    //   alert(`Appointment for ${formData.name} has been submitted!`);
    // }
  };
  
  // Calculates age from date of birth string
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
  
  // --- SIDE EFFECTS (useEffect) ---

  // Effect to fetch available time slots when the component mounts
 // Re-fetch if appointment date changes

  // Effect to update the form when a patient is selected or "Add New" is clicked
  useEffect(() => {
    if (selectedPatient) {
      setFormData((prev) => ({
        ...prev,
        name: selectedPatient.patient_name,
        fatherName: selectedPatient.guardian_name,
        dob: selectedPatient.date_of_birth,
        age: selectedPatient.age,
      }));
      setIsNewPatient(true)

    } else {
      // Reset form for a new patient or when no patient is selected
      setFormData((prev) => ({
        ...prev,
        name: "",
        fatherName: "",
        dob: "",
      }));
    }
  }, [selectedPatient, isNewPatient]);

  // --- STYLES OBJECT ---
  const styles = {
    page: { fontFamily: "'Segoe UI', sans-serif", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5", padding: "20px 0", boxSizing: 'border-box' },
    container: { width: isLaptopOrLarger ? '80%' : 'calc(100% - 40px)', maxWidth: '1400px', padding: isLaptopOrLarger ? "40px 50px" : "30px 25px", background: "white", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", textAlign: "center", transition: 'width 0.3s ease-in-out' },
    header: { color: "#333", marginBottom: "25px", fontSize: isLaptopOrLarger ? "2.5em" : "2em" },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: '0 auto' },
    mobileInput: { padding: "15px", fontSize: "1.1em", borderRadius: "8px", border: "1px solid #ddd", textAlign: "center", letterSpacing: "2px", outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s' },
    errorText: { color: '#dc3545', fontSize: '0.9em', marginTop: '-5px', marginBottom: '5px' },
    buttonGroup: { display: "flex", justifyContent: "center", gap: "15px", marginTop: "10px" },
    button: { padding: "12px 25px", fontSize: "1em", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "background-color 0.3s, transform 0.2s" },
    contentWrapper: { transition: 'max-height 0.7s ease-in-out, opacity 0.5s 0.2s ease-in-out', maxHeight: showContent ? '1500px' : '0px', opacity: showContent ? 1 : 0, overflow: 'hidden', marginTop: showContent ? '30px' : '0' },
    patientListContainer: { textAlign: 'left', marginBottom: '20px' },
    patientCard: { background: '#f9f9f9', border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', transition: 'background-color 0.3s, box-shadow 0.3s, border-left 0.3s' },
    patientCardSelected: { background: '#e7f3ff', borderLeft: '4px solid #007bff', boxShadow: '0 2px 8px rgba(0,123,25_5,0.2)' },
    addNewButton: { background: 'transparent', color: '#007bff', border: '1px dashed #007bff', width: '100%', marginTop: '10px' },
    form: { display: 'grid', gap: '20px', textAlign: 'left' },
    formRow: { display: 'flex', flexDirection: isLaptopOrLarger ? 'row' : 'column', gap: '15px' },
    formField: { flex: 1, display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '8px', color: '#555', fontWeight: 'bold', fontSize: '0.9em' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1em', width: '100%', boxSizing: 'border-box' },
    ageDisplayBox: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1em', width: '100%', boxSizing: 'border-box', background: '#e9ecef', color: '#495057', display: 'flex', alignItems: 'center', minHeight: '50px' },
    radioGroup: { display: 'flex', gap: '10px', border: '1px solid #ccc', borderRadius: '8px', padding: '5px' },
    radioLabel: { flex: 1, textAlign: 'center', padding: '10px', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.3s, color 0.3s' },
  };

//   const ageInWords = numberToWords(age);

  const gettimeslot = async() => {

  const api = axios.create({
  baseURL: API_BASE_URL_TO,
//   headers: {
//     "ngrok-skip-browser-warning": "true",
//     "Content-Type": "application/json"
//   }
});
    
  try {
    const response = await api.get(`/fatch_date_and_time/${moment(new Date()).format('yyyy-MM-DD')}`); 
    console.log('Description fetched:', response.data);
    const ddata = response.data

    const fdata = ddata.filter((item)=>(item.enabled!==false))

    // setTimeSlots(fdata)


    function parseTime(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  return d;
}

// function getUpcomingSlots(data) {
//   const now = new Date();
//   return data.filter(slot => {
//     const startTime = parseTime(slot.id.split(" - ")[0]); // slot ka start time
//     return startTime > now; // sirf future slots
//   });
// }

function getUpcomingSlots(data) {
  const now = new Date();

  return data.filter(slot => {
    const [start, end] = slot.id.split(" - ");  // e.g. "09:00 AM" , "10:00 AM"
    const startTime = parseTime(start);
    const endTime = parseTime(end);

    // include slot if it’s ongoing or in the future
    return endTime > now;
  });
}
    setTimeSlots(getUpcomingSlots(fdata))

    const test = getUpcomingSlots(fdata)

 
    setFormData(prev => ({ ...prev, timeSlot: response.data[0] }));
  


  } catch (error) {
    console.error('Error fetching description:', error);
  }

}

useEffect(() => {
  gettimeslot()
}, [])


  const [age, setage] = useState('0')

  useEffect(() => {
    if (formData.dob) {
        setage(calculateAge(formData.dob))
        console.log(calculateAge(formData.dob))
    }
  }, [formData.dob])


  const flowsend=async()=>{
    const token = 'EACHqNPEWKbkBO33utbtE1EMW5T1B8KlYqSpLDepuZCdrEY9unIfGmwnlZB4XgfEFQw2ohjGAAoBL1OHY08kftSW0ZBEvX5eXIodrY2gghys3IEoyoKwZCvHh0ZBd7I6eB9ttTEV1fsghWvpzycfIr5pIVIeftLpO0jlFLp9FZB31dd48QZCzmYSxSvKuIFkZAOlchwZDZD'
    const api = 'https://graph.facebook.com/v22.0/563776386825270/messages'
    const data = { 
    "messaging_product": "whatsapp", 
    "to": "+91"+mobile, 
    "type": "template", 
    "template": { 
        "name": "marketing_first", 
        "language": { "code": "en" },
        "components": [
            {
                "type": "header",
                "parameters": [
          {
            "type": "image",
            "image": {
              "link": "https://firebasestorage.googleapis.com/v0/b/duniyamart-e69a1.appspot.com/o/Image-user%2FWhatsApp%20Image%202025-07-11%20at%2012.56.04%20AM.jpeg?alt=media&token=301ec414-7d0e-4908-b68b-0313e1ee7044"
            }
          }
        ]
            },
            {
                "type": "body",
                "parameters": []
            },
            {
                "type": "button",
                "sub_type": "flow",  
                "index": "0"  
            }
        ]
    } 
}
    try {
      const res = await axios.post(api,data,{
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
console.log(res.data)
Swal.fire({
  title: "Flow sent successfully ✅",
  text: "Your WhatsApp flow has been triggered.",
  icon: "success",
  confirmButtonText: "OK"
});
setMobile('')
    } catch (error) {
      Swal.fire({
  title: "Something went wrong!",
  text: "Please try again later.",
  icon: "error",
  confirmButtonText: "OK"
});setMobile('')
    }


  }
  

  // --- JSX RENDER ---
  return (
    <>
    {/* <Link to={'/'}><div style={{
    background:'#249CA2',
    height:50,
    // width:'100vw',
    display:'flex',
    alignItems:'center',
    color:'white',
    gap:10,
    
    marginBottom:10
}}> <i style={{paddingLeft:20}} class="fa-solid fa-arrow-left"></i>
    <label style={{fontWeight:700,fontSize:12,color:'white'}}>Back</label>
</div></Link> */}
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.header}>Current Appointment</h1>
        
        <div style={styles.inputGroup}>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10));
                setMobileError("");
              }}
              placeholder="Enter 10-Digit Mobile Number"
              style={{...styles.mobileInput, ':focus': { borderColor: '#007bff', boxShadow: '0 0 5px rgba(0,123,255,0.5)'}}}
              disabled={isLoading}
            />
            
            {mobileError && <p style={styles.errorText}>{mobileError}</p>}
            
              <div style={styles.buttonGroup}>
                  
                  <button style={{ ...styles.button, background: '#28a745', color: 'white' }} onClick={handleChange} disabled={isLoading}>
                      {isLoading ? 'Searching...' : 'Book OPD'}
                  </button>
                  <button style={{ ...styles.button, background: '#1968acff', color: 'white' }} onClick={flowsend}>
                      Send Flow
                  </button>
              </div>
              {apiError && <p style={styles.errorText}>{apiError}</p>}
        </div>

        <div style={styles.contentWrapper}>
            {patients.length > 0 && !isNewPatient && (
                <div style={styles.patientListContainer}>
                    <h3 style={{color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Select Existing Patient</h3>
                    {patients.map((p) => (
                        <div
                            key={p._id}
                            style={{
                                ...styles.patientCard,
                                ...(selectedPatient?._id === p._id ? styles.patientCardSelected : {})
                            }}
                            onClick={() => setSelectedPatient(p)}
                        >
                            <b>{p.patient_name}</b> | Father: {p.guardian_name}
                        </div>
                    ))}
                    <button 
                      style={{...styles.button, ...styles.addNewButton}} 
                      onClick={() => {
                          setIsNewPatient(true); 
                          setSelectedPatient(null);
                      }}
                    >
                        ➕ Add New Patient
                    </button>
                </div>
            )}

            {(selectedPatient || isNewPatient) && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <h2 style={{textAlign: 'center', color: '#333', marginTop: '10px', borderBottom: '2px solid #eee', paddingBottom: '15px'}}>
                        {isNewPatient ? 'New Patient Details' : 'Appointment for ' + formData.name}
                    </h2>
                    
                    <div style={styles.formField}>
                        <label style={styles.label}>Patient Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} style={styles.input} required />
                    </div>
                     <div style={styles.formField}>
                        <label style={styles.label}>Father Name</label>
                        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleFormChange} style={styles.input} required />
                    </div>

                    {/* --- MODIFIED ROW: DOB on Left, Age on Right --- */}
                    <div style={styles.formRow}>
                      <div style={styles.formField}>
                          <label style={styles.label}>Date of Birth</label>
                          <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} style={styles.input} required max={maxDate} />
                      </div>
                      <div style={styles.formField}>
                          <label style={styles.label}>Age</label>
                          {/* NEW: Display box for age */}
                          <div style={styles.ageDisplayBox}>
                            {age ? `${age}` : 'Enter DOB'}
                          </div>
                      </div>
                    </div>
                    
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Date of Appointment</label>
                            <input type="text" name="appointmentDate" value={formData.appointmentDate} style={{...styles.input, background: '#e9ecef'}} readOnly />
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Time Slot</label>
                            <select name="timeSlot" value={formData.timeSlot} onChange={handleFormChange} style={styles.input} required>
                              <option value=''>Select slot</option>
                                {timeSlots.length > 0 ? (
                                  timeSlots.map((slot) => <option key={slot.id} value={slot.id}>{slot.title}</option>)
                                ) : (
                                  <option disabled>No slots available</option>
                                )}
                            </select>
                        </div>
                    </div>
                    
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Gender</label>
                            <div style={styles.radioGroup}>
                                {['Male', 'Female'].map(option => (
                                    <label key={option} style={{...styles.radioLabel, background: formData.sex === option ? '#28a745' : 'transparent', color: formData.sex === option ? 'white' : '#333'}}>
                                        <input type="radio" name="sex" value={option} checked={formData.sex === option} onChange={handleFormChange} style={{display: 'none'}} />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Coming for Vaccination</label>
                            <div style={styles.radioGroup}>
                                {['Yes', 'No'].map(option => (
                                    <label key={option} style={{...styles.radioLabel, background: formData.isVaccination === option ? '#007bff' : 'transparent', color: formData.isVaccination === option ? 'white' : '#333'}}>
                                        <input type="radio" name="isVaccination" value={option} checked={formData.isVaccination === option} onChange={handleFormChange} style={{display: 'none'}} />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Payment Mode</label>
                            <div style={styles.radioGroup}>
                                {['Cash', 'Online'].map(option => (
                                    <label key={option} style={{...styles.radioLabel, background: formData.paymentMode === option ? '#28a745' : 'transparent', color: formData.paymentMode === option ? 'white' : '#333'}}>
                                        <input type="radio" name="paymentMode" value={option} checked={formData.paymentMode === option} onChange={handleFormChange} style={{display: 'none'}} />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button type="submit" style={{ ...styles.button, background: '#007bff', color: 'white', width: '100%', padding: '15px', fontSize: '1.2em', marginTop: '10px' }}>
                        Submit Appointment
                    </button>
                </form>
            )}
        </div>

      </div>
    </div>
    </>
  );
}

