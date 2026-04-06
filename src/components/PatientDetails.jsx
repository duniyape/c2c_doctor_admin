import React, { useEffect, useState } from 'react';
import { 
  Calendar, Clock, User, CheckCircle, 
  CreditCard, Activity, MapPin, Shield, 
  MessageCircle, Bell, Download, HeartPulse,
  Syringe, ArrowRight, Stethoscope,
  Fingerprint,
  Hash,
  Save,
  Phone
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useApi from '../api/useApi';
import Cookies from 'js-cookie';
import axios from 'axios';

const PatientDetails = () => {
     const {id} = useParams()
  const {postData} = useApi();
  const useid = JSON.parse(decodeURIComponent(id))._id
  const [data, setuserdata] = useState({})

  
    const [newId, setNewId] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
  useEffect(() => {
    // console.log(JSON.parse(decodeURIComponent(id)))
   setuserdata(JSON.parse(decodeURIComponent(id)))
   setNewId(JSON.parse(decodeURIComponent(id)).kalra_id)
  }, [id]);

   const token = Cookies.get('token')
   const phoneId = Cookies.get('phoneid')



   const sentalert=()=>{
          const payload = {
            messaging_product: "whatsapp",
            // to: userdata.whatsapp_number, 
            to: data.whatsapp_number, 
            type: "template",
            template: {
              name: "appoint_alert", 
              language: { code: "en" },
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: data.patient_name }, 
                    { type: "text", text: data.appointment_index } 
                  ]
                }
              ]
            }
          };
          
        axios.post(`https://graph.facebook.com/v22.0/${phoneId}/messages`, payload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('Message sent successfully:', response.data);
            Swal.fire({
              title: "Succesful!",
              text: "Your Alert has been sent sucessfully.",
              icon: "success"
            });
        })
        .catch(error => {
            console.error('Error sending message:', error.response?.data || error.message);
        });
        }

        const checkin=()=>{
         Swal.fire({
              title: "Are you sure?",
              text: "Visited!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33", 
              confirmButtonText: "Yes, Visited!"
            }).then((result) => {
              if (result.isConfirmed) {
                   postData(`/update_appointment/${useid}/`,{ statusC: 'checked'}).then((e)=>{
                  if(e){
                    console.log(data)
                    Swal.fire({
                      title: "Checked In!",
                      text: "Your appoinmnet has been Updated.",
                      icon: "success"
                    });
                  }
                })
              }
            });
        }

         const updateIdNumber = async () => {
    if (!newId.trim()) return;
    setIsUpdating(true);
    
    try {
      const success = await postData(`/update_appointment/${useid}/`, { kalra_id: newId });
      if (success) {
        setuserdata({ ...data, kalra_id: newId });
        Swal.fire({
          title: "Updated!",
          text: "The OPD Number has been successfully updated.",
          icon: "success",
          confirmButtonColor: "#10b981"
        });
      }
    } catch (err) {
      Swal.fire("Error", "Could not update ID number", "error");
    } finally {
      setIsUpdating(false);
    }
  };

   const calculateDetailedAge = (dob) => {
    if (!dob || dob === "none") return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      // Get days in the previous month
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0 || parts.length === 0) parts.push(`${days}d`);

    return parts.join(' ');
  };


  const displayValue = (val) => (val === "none" || !val ? <span className="text-slate-400 text-xs italic">Not Provided</span> : val);

  return (
    // MAIN BACKGROUND: Clean Clinical Blue-Grey
    <div className="bg-inherit flex-col items-center justify-center md:p-6 overflow-x-hidden font-sans text-slate-800 relative w-full">

        {/* MAIN GLASS CARD - White frosted glass instead of dark */}
        <div className="backdrop-blur-xl bg-white/80 border border-white rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
          
          {/* 1. HERO SECTION (Patient + Date) */}
          <div className="p-6 md:p-8 bg-linear-to-b from-white to-slate-50/50 relative">
             <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="relative w-24 h-24 bg-linear-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-teal-200 transform group-hover:scale-105 transition-all duration-300">
                    {data.appointment_index}
                  </div>
                </div>

                {/* Name & ID */}
                <div className="flex-1 min-w-0">
                   <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight truncate">{data.patient_name}</h2>
                   <div className="flex flex-col md:flex-row items-center md:items-center gap-3 text-slate-500 text-sm mb-5">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                        <Shield size={14} className="text-teal-600"/> 
                        Guardian: <span className="font-semibold text-slate-700">{data.guardian_name}</span>
                      </span>
                      <span className="hidden md:inline text-slate-300">|</span>
                      <span className="font-mono text-slate-400">ID: {data.kalra_id}</span>
                   </div>

                   {/* Action Buttons */}
                   <div className="flex gap-3 justify-center md:justify-start w-full">
                      <button 
                        onClick={() => sentalert()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm transition-all active:scale-95"
                      >
                        <Bell size={16} /> Notify
                      </button>
                      <a 
                        href={`https://wa.me/${data.whatsapp_number}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#1da851] rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                   </div>
                </div>

                {/* Date Ticket Stub - Professional Blue Box */}
                <div className="w-full md:w-auto bg-blue-600 text-white rounded-2xl p-5 shadow-lg shadow-blue-200 flex items-center justify-between md:block gap-6 min-w-[140px]">
                   <div className="text-center md:mb-3">
                      <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Date</p>
                      <p className="text-xl font-bold">{new Date(data.date_of_appointment).toLocaleDateString('en-GB')}</p>
                   </div>
                   <div className="h-8 w-px bg-blue-400/50 md:h-px md:w-full md:my-3"></div>
                   <div className="text-center">
                      <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Time</p>
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={14} className="text-blue-200"/>
                        <p className="text-lg font-bold">{data?.time_slot}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* 2. GRID INFO SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-100">
            
            {/* Payment Panel */}
            <div className="p-6 md:border-r border-slate-100 hover:bg-slate-50/80 transition-colors">
               <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <Hash size={18} className="text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Appointment No.</span>
               </div>
               <div className="flex justify-between items-end mb-6">
                  <div>
                    {/* Updated color to text-indigo-600 */}
                    <span className="text-4xl font-black text-indigo-600 tracking-tight">{data.appointment_index}</span>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <CreditCard size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Fees</span>
               </div>
               <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-3xl font-bold text-slate-800">₹{data.amount}</span>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Consultation</p>
                  </div>
                  <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full">
                     <CheckCircle size={18} />
                  </div>
               </div>

                <div className="text-[10px] text-slate-400 font-mono break-all bg-slate-100 p-2 rounded-lg border border-slate-200">
                    TXN: {data.pay_id}
                </div>
            </div>

            {/* Clinical Panel */}
            {/* <div className="p-6 md:border-r border-slate-100 hover:bg-slate-50/80 transition-colors">
               <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <HeartPulse size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Clinical</span>
               </div>
               
               <div className="space-y-5">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Symptoms</p>
                    <p className="text-sm text-slate-700 font-semibold truncate bg-slate-100 inline-block px-2 py-1 rounded">{displayValue(data.symptoms)}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Vaccination</p>
                    <div className={`flex items-center gap-2 text-sm font-bold ${data.vaccine === 'Yes' ? 'text-teal-600' : 'text-slate-500'}`}>
                       <Syringe size={16} />
                       {data.vaccine === 'Yes' ? 'Required' : 'Not Required'}
                    </div>
                  </div>
               </div>
            </div> */}


            <div className="p-8 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-400 mb-6">
              <User size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Patient Profile</span>
            </div>

            
            <div className="space-y-4">


              
              {/* ID Update Field */}
              <div className="relative">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-2 flex items-center gap-1">
                  <Fingerprint size={10} /> Update OPD Number
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={newId}
                      onChange={(e) => setNewId(e.target.value)}
                      placeholder="Enter ID..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>
                  <button 
                    onClick={updateIdNumber}
                    disabled={isUpdating}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>

               <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                    <p className="text-[10px] text-blue-200 uppercase font-black mb-1">Mobile Number</p>
                    <div className="flex items-center gap-2">
                       <Phone size={14} className="text-blue-300" />
                       <p className="text-lg font-bold tracking-wider">+{data.whatsapp_number}</p>
                    </div>
                  </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase font-black">Age</p>
                  <p className="text-sm font-bold text-slate-800">{calculateDetailedAge(data.date_of_birth) || "N/A"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase font-black">Birth</p>
                  <p className="text-sm font-bold text-slate-800">{displayValue(data.date_of_birth)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100/50 p-3 rounded-xl border border-dashed border-slate-300">
                <MapPin size={14} className="text-teal-500 shrink-0"/>
                <span className="truncate font-semibold">{displayValue(data.city)}</span>
              </div>
            </div>
          </div>
        </div>

            {/* Personal Details Panel */}
            {/* <div className="p-6 hover:bg-slate-50/80 transition-colors">
               <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <User size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Profile</span>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                     <p className="text-[10px] text-slate-400 uppercase font-bold">Age</p>
                     <p className="text-sm font-bold text-slate-800">{displayValue(data.age)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                     <p className="text-[10px] text-slate-400 uppercase font-bold">DOB</p>
                     <p className="text-sm font-bold text-slate-800">{displayValue(data.date_of_birth)}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                     <MapPin size={14} className="text-teal-500 shrink-0"/>
                     <span className="truncate font-medium">{displayValue(data.address)}</span>
                  </div>
               </div>
            </div>
          </div> */}

          {/* BOTTOM CONFIRMATION BAR */}
          <button 
             onClick={() => checkin()}
             className="w-full bg-linear-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white p-4 font-bold tracking-wide text-sm flex items-center justify-center gap-2 transition-all shadow-md"
          >
             VISIT CONFIRMATION <ArrowRight size={18} />
          </button>
        </div>
        
        {/* <div className="text-center mt-6">
           <p className="text-[10px] text-slate-400 font-medium">
             Medical Record ID: <span className="font-mono text-slate-500">{data._id}</span>
           </p>
        </div> */}

      {/* </div> */}
    </div>
  );
};

export default PatientDetails;