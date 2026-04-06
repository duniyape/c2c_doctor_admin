import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LayoutDashboard, CalendarDays, Users, BarChart3, Settings, LogOut, Check, Menu, Clock, FileText, UserPlus, Zap, Download, ChevronLeft, UserCircle, Bell, ChevronDown, ArrowLeft, Stethoscope, User, Key, Lock, User2, CheckCircle2, Edit3 , Plus , X, AlertCircle} from 'lucide-react';
import axios from 'axios';
import moment from 'moment';
import DateSetting from './DateSetting';
import LedgerView from './Reports';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import PatientDetails from './PatientDetails';
import DoctorReschedule from '../pages/newupdate/Reschedule.jsx'
import Addproduct from '../pages/newupdate/Addproduct.jsx'
import Addpatient from '../pages/newupdate/Addpatient.jsx'
import Makebill from '../pages/newupdate/Makebill.jsx'
import BrackupFarm from '../pages/newupdate/BrackupFarm.jsx'
import CurrentOPD from '../pages/newupdate/CurrentOPD.jsx'
import UpdateBrackup from '../pages/newupdate/UpdateBrackup.jsx'
import EditReceipt from '../pages/newupdate/EditReceipt.jsx'
import DoctorLedgerPage from '../pages/newupdate/DoctorLedger.jsx'
import Staff from '../pages/staff/Staff.jsx';
import RefundUser from '../pages/newupdate/RefundUser.jsx'
import { useUser } from '../context/UserContext.jsx';
import Setting from '../pages/setting/Setting.jsx';
import Swal from 'sweetalert2';
import { useLoader } from '../loader/LoaderContext.jsx';
import Cookies from "js-cookie";
import useApi from '../api/useApi';
import AssignSlot from '../pages/newupdate/AssignSlots.jsx'
import ChangePassword from './ChangePassword.jsx';

// --- Configuration ---
const PRIMARY_COLOR = 'bg-green-600';
const ACCENT_COLOR = 'text-green-600';
const SOFT_BG = 'bg-slate-50';



const doctors = [
  {
    id: '69aa8d862e6ce410bad8f99a',
    name: 'Dr. Indiver Kalra',
    role: 'MBBS, MD (Psychiatry)',
    initials: 'IK',
    color: 'emerald',
    specialty: 'MBBS, MD (Psychiatry)'
  },
  {
    id: '69ab14581e106e13ffbd9729',
    name: 'Dr. Pragati Kalra',
    role: 'MBBS, MD (Psychiatry)',
    initials: 'PK',
    color: 'blue',
    specialty: 'MBBS, MD (Psychiatry)'
  },
  {
    id: '69ab14c71e106e13ffbd972a',
    name: 'Centre For Little Minds',
    role: 'Clinic',
    initials: 'LM',
    color: 'purple',
    specialty: 'MBBS, MD (Psychiatry)'
  }
];

/**
 * Renders a single navigation link for the sidebar.
 */
const NavItem = ({ icon: Icon, label, onClick, isCollapsed,path }) => (
    <NavLink
        to={path}
        onClick={onClick}
        className={({ isActive }) =>`flex items-center p-3 text-sm font-medium rounded-xl transition duration-150 ${
            isActive
                ? `text-white ${PRIMARY_COLOR} shadow-lg`
                : 'text-gray-600 hover:bg-gray-100'
        } ${isCollapsed ? 'justify-center' : ''}`}  
        // Add title for hover tooltip when collapsed
        title={isCollapsed ? label : ''} 
    >
        <Icon className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : 'mr-0'}`} />
        {/* Only show label if sidebar is NOT collapsed */}
        {!isCollapsed && label}
    </NavLink>
);

/**
 * Renders a metric summary card.
 */
const MetricCard = ({ icon: Icon, title, value, detail, colorClass, borderClass }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border-t-4 ${borderClass} transition duration-300 hover:shadow-xl`}>
        <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <p className="text-4xl font-extrabold text-gray-900">{value}</p>
        {/* <p className="text-xs text-gray-400 mt-2">{detail}</p> */}
    </div>
);


const AppointmentRow = ({ appointment_index, patient_name, time_slot, kalra_id, onUpdateClick , pay_id ,data}) => {
    const isOld = pay_id?.startsWith('old');
    const statusClasses = isOld ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

    const navigate = useNavigate();
    
    // Check if ID already exists (truthy check)
    const hasId = !!kalra_id && kalra_id.trim() !== "";

    return (
        <div onClick={()=>navigate(`/appointment/${encodeURIComponent(JSON.stringify(data))}`)} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-4 bg-white hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition duration-150">
            <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">No: {appointment_index}</p>
                <p className="text-md font-bold text-gray-800 truncate uppercase">{patient_name}</p>
                <div className="flex items-center mt-1 space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusClasses}`}>
                        {isOld ? 'REAPPOINTMENT' : 'NEW'}
                    </span>
                    <span className="text-xs font-medium text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {time_slot}
                    </span>
                    {hasId && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> ID: {kalra_id}
                        </span>
                    )}
                </div>
            </div>
            
          { Cookies.get('user')!=='67ee5e1bde4cb48c515073ee' &&<div className="flex items-center space-x-2 w-full sm:w-auto">
                {/* Only show button if ID does NOT exist */}
                {!hasId && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdateClick();
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update OPD No.</span>
                    </button>
                )}
            </div>}
        </div>
    );
};


// const AppointmentRow = ({ appointment_index, patient_name, time_slot, pay_id,data }) => {
//     const navigate = useNavigate();
//     const statusClasses = useMemo(() => {
//         const firstThree = pay_id.slice(0, 3);
//         if (firstThree==='old') {
//             return 'bg-yellow-100 text-yellow-700'
//         }else{
//             return 'bg-green-100 text-green-700'
//         }
    
//     }, [pay_id]);

//     return (
//         <div onClick={()=>navigate(`/appointment/${encodeURIComponent(JSON.stringify(data))}`)} className="flex justify-between items-center py-3 px-4 bg-white hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition duration-150">
//             <div className="flex-1 min-w-0">
//                 <p className="text-xs text-gray-400 mb-1">Appointment No: {appointment_index}</p>
//                 <p className="text-md font-semibold text-gray-800 truncate uppercase">{patient_name}</p>
//             </div>
//             <div className="text-right">
//                 <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusClasses} mr-4 hidden sm:inline-block`}>
//                     {pay_id.slice(0, 3)==='old'?'Reappointment':'New'}
//                 </span>
//                 <p className="text-sm font-medium text-gray-600">{time_slot}</p>
//             </div>
//         </div>
//     );
// };

/**
 * Renders a custom confirmation modal for logging out.
 */
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        // Added backdrop-blur-md for the desired effect
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-md">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 duration-300">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    Are you sure you want to log out of the care2connect dashboard?
                </p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 shadow-md flex items-center"
                    >
                        <LogOut className="w-4 h-4 inline mr-1 -mt-0.5" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};



const UpdateIdModal = ({ isOpen, onClose, onSubmit }) => {
    const [idValue, setIdValue] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    // Reset states when modal is opened or closed
    useEffect(() => {
        if (!isOpen) {
            setIdValue('');
            setIsConfirming(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        if (!idValue.trim()) return;
        setIsConfirming(true);
    };

    const handleFinalConfirm = () => {
        onSubmit(idValue);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
                {!isConfirming ? (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Plus className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Update OPD No.</h3>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleInitialSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Enter OPD No.</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Type OPD No...."
                                    value={idValue}
                                    onChange={(e) => setIdValue(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm text-lg font-semibold"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition">Update Now</button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Update?</h3>
                        <p className="text-gray-500 text-sm mb-8">
                            Are you sure you want to update the OPD No. to <span className="font-bold text-emerald-600">"{idValue}"</span>?
                        </p>
                        
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setIsConfirming(false)} 
                                className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                            >
                                No, Back
                            </button>
                            <button 
                                onClick={handleFinalConfirm}
                                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition"
                            >
                                Yes, Update
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Toast = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-emerald-500 rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">{message}</span>
        </div>
    );
};


// --- Main Application Component ---
const   Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile menu state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Default to collapsed/icon-only on load
    const [showLogoutModal, setShowLogoutModal] = useState(false); 
    const {showLoader,hideLoader}=useLoader()

       const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
        const [selectedAppointment, setSelectedAppointment] = useState(null);
        const [toast, setToast] = useState({ show: false, message: '' });

      const [activeDoctorId, setActiveDoctorId] = useState(Cookies.get('user') || doctors[0].id);




  const handleDoctorSwitch = (id,name) => {
    Cookies.set('user', id, { expires: 360 });
    Cookies.set('name', name, { expires: 360 });
    setActiveDoctorId(id);
    window.location.reload();
  };
  

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const profileMenuRef = useRef(null);
      // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navigate = useNavigate();
    const handleNavigationClick = (view) => {
        setIsSidebarOpen(false); // Close sidebar on mobile after navigation
    };
    
        const handleLogoutConfirm = () => {
        Cookies.remove("EmpID");
        Cookies.remove("user");
        Cookies.remove("phoneid");
        Cookies.remove("token");
        Cookies.remove("role");
        Cookies.remove("name");

        setShowLogoutModal(false);
        // navigate("/login", { replace: true });
        window.location.href = "/login";
        };



     

     const user = useUser();
    const checkPermission=(text)=>{
     return user?.permissions.includes(text);
    }
    
    const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard", path: "/",display:true },
//   { icon: UserCircle, label: "OPD", key: "opd", path: "/currentOPD",display:true },
  { icon: FileText, label: "Receipt", key: "receipt", path: "/makebill",display:Cookies.get("user")==='67ee5e1bde4cb48c515073ee'?true:false },
  { icon: BarChart3, label: "Reports", key: "analytics", path: "/reports",display:checkPermission('Reports') },
  { icon: CalendarDays, label: "Reschedule", key: "reschedule", path: "/reschedule",display:checkPermission('Reschedule') },
  { icon: Zap, label: "Refund", key: "refund", path: "/refund",display:checkPermission('Refund') },
  { icon: User, label: "Staff", key: "staff", path: "/staff",display:checkPermission('Staff') },
  { icon: Settings, label: "Setting", key: "settings", path: "/settings",display:checkPermission('Setting') }
];

    const RenderView = () => {
      const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState('appointments'); // 'list' or 'add'
    const [requests,setrequests] = useState([])

    const checkPermission=(text)=>{
     return user?.permissions.includes(text);
    }

      const QuickActionButton = ({ icon: Icon, label, action }) => (
      <Link to={action} className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-md hover:shadow-lg hover:ring-2 ring-green-200 transition duration-200 group">
          <div className={`p-3 rounded-full bg-green-50 group-hover:bg-green-100 transition duration-200`}>
              <Icon className={`w-6 h-6 ${ACCENT_COLOR}`} />
          </div>
          <span className="mt-3 text-xs text-center font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      </Link>
  );
  
        const [mockAppointments, setData] = useState([]);
         const [loading, setLoading] = useState(false);
  //   const Today=moment().format('YYYY-MM-DD')
    const [selecteddate, setselecteddate] = useState(new Date());

         useEffect(() => {
    const savedDate = sessionStorage.getItem("date");
    if (savedDate) setselecteddate(savedDate);
  }, []);
  
    
  
  
      const filteredAppointments = useMemo(() => {
          if (!searchQuery) {
              return mockAppointments;
          }
          console.log(mockAppointments)
          const query = searchQuery.toLowerCase();
          return mockAppointments.filter(appt => 
              appt.patient_name.toLowerCase().includes(query) || 
              appt.whatsapp_number.toLowerCase().includes(query)
          );
      }, [searchQuery,mockAppointments]); 
  
  const [counting, setcounting] = useState({
      appointment : 0,
      paid : 0 ,
      unpaid : 0,
      time : 0
  })
    
   
  
    useEffect(() => {
      axios
        .get(`https://api.care2connect.in/get_appointments/${moment(selecteddate).format("YYYY-MM-DD")}/${Cookies.get('user')}`)
        .then((res) => {
          setData((res.data).filter((item)=>(parseFloat(item.amount)>=0)).sort((a, b) => Number(a.appointment_index) - Number(b.appointment_index)));
          const appointment = (res.data).filter((item)=>(parseFloat(item.amount)>=0)).length
          const appointmentp = (res.data).filter((item)=>(parseFloat(item.amount)>0)).length
          const appointmentu = (res.data).filter((item)=>(parseFloat(item.amount)===0)).length
          setcounting({...counting,appointment:appointment,paid:appointmentp, unpaid:appointmentu})
        //   setLoading(false);  
          console.log(res.data)
        })
        .catch((err) => {
          console.error(err);
        //   setLoading(false);
        });
    }, [selecteddate]);
    
        useEffect(() => {
        if (view !== 'requests') return;
        const fetchData = async () => {
            try {
            const response = await axios.get(
                'https://api.care2connect.in/manage_opd_requests'
            );
            console.log(response.data);
            setrequests(response.data)
            } catch (error) {
            console.log(error);
            }
        };
        fetchData();
        }, [view]);

    
  
  
    const downloadPdf = async () => {
    const response = await fetch(`https://api.care2connect.in/pdf/${moment(selecteddate).format("YYYY-MM-DD")}/`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(new Blob([blob]));
  
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'appointments.pdf'); // specify filename
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const aprovebtn=(userdata)=>{
         Swal.fire({
              title: "Are you sure?",
              text: "Approve Request!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33", 
              confirmButtonText: "Yes, Approve!"
            }).then(async(result) => {
              if (result.isConfirmed) {
                showLoader()
                try {
                  const res =await axios.post(`https://api.care2connect.in/book_appointment_current_opd`,userdata)
                     console.log(res.data.data)
                    const data=res.data.data
                    setrequests((prev) =>
                        prev.filter((item) => item._id !== userdata._id)
                        );
                  Swal.fire({
                        title: "Approved!",
                        html: `
                            <p><b>Appointment Confirmed</b></p>
                            <p>Appointment No: <b>${data.appointment_index}</b></p>
                            <p>Time Slot: <b>${data.time_slot}</b></p>
                        `,
                        icon: "success"
                        });

                    } catch (error) {
                        console.log(error)
                     }finally{
                    hideLoader()
                }
              }
            });
        }
    const deleteOpdRequest = async (id) => {
    Swal.fire({
              title: "Are you sure?",
              text: "Delete Request!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33", 
              confirmButtonText: "Yes, Delete!"
            }).then(async(result) => {
              if (result.isConfirmed) {
                showLoader()
                try {
                    await axios.delete(
                        `https://api.care2connect.in/manage_opd_requests?id=${id}`
                        );
                        // update UI without refetch
                        setrequests((prev) =>
                        prev.filter((item) => item._id !== id)
                        );
                        Swal.fire({
                        title: "Deleted!",
                        text: "Request has been Deleted.",
                        icon: "success"
                        });

                    } catch (error) {
                   console.log(error)
                }finally{
                    hideLoader()
                }
              }
            });
    };


    const updateAppointmentStatus=async(item,status)=>{
        console.log(item)
        if(status==="Approved"){
            aprovebtn(item)
        }else if(status==="Declined"){
            deleteOpdRequest(item._id)
        }
    }
    const {postData} = useApi();

    const handleUpdateId = async(newId) => {
            if (selectedAppointment) {



                 try {
                      const success = await postData(`/update_appointment/${selectedAppointment._id}/`, { kalra_id: newId });
                      if (success) {
                        setuserdata({ ...data, kalra_id: newId });
                        Swal.fire({
                          title: "Updated!",
                          text: "The ID Number has been successfully updated.",
                          icon: "success",
                          confirmButtonColor: "#10b981"
                        });
                      }
                    } catch (err) {
                    //   Swal.fire("Error", "Could not update ID number", "error");
                    } finally {
                      setToast({ show: true, message: `ID for ${selectedAppointment.patient_name} updated successfully!` });
                    }


              
            }
        };

     const openUpdateModal = (appt) => {
            setSelectedAppointment(appt);
            setIsUpdateModalOpen(true);
        };


   

    if (loading) return <h2>Loading...</h2>;


    

    return(
          <>
          <div className="p-4">
                {/* <h1 className="hidden lg:block text-3xl font-extrabold text-gray-900 mb-8">
                    Welcome back, Dr. Neeraj Bansal
                </h1> */}

{Cookies.get("Hospital")==='Yes'&&
                <div className="flex items-center bg-gray-100 p-1 rounded-2xl flex-1 max-w-xl mx-auto mb-4">
          {doctors.map((doctor) => {
            const isActive = activeDoctorId === doctor.id;
            return (
              <button
                key={doctor.id}
                onClick={() => handleDoctorSwitch(doctor.id,doctor.name)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-white shadow-sm text-emerald-700 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold whitespace-nowrap">
                    {doctor.name.split(' ').slice(1).join(' ') || doctor.name}
                  </span>
                  {isActive && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span className="text-[8px] font-medium opacity-60 leading-none hidden md:block uppercase mt-0.5">
                  {doctor.specialty}
                </span>
              </button>
            );
          })}
        </div>}

                {/* --- Content Area --- */}
                    <div className="space-y-8">
                        
                        {/* 1. Key Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                            <MetricCard
                                icon={CalendarDays}
                                title="Appointments Today"
                                value={counting.appointment}
                                detail="+5% from yesterday"
                                colorClass="text-cyan-500"
                                borderClass="border-cyan-500"
                            />
                            <MetricCard
                                icon={UserPlus}
                                title="Paid Appointments"
                                value={counting.paid}
                                detail="3 registrations this morning"
                                colorClass="text-green-600"
                                borderClass="border-green-600"
                            />
                            <MetricCard
                                icon={FileText}
                                title="Re-appointments"
                                value={counting.unpaid}
                                detail="Requires physician review"
                                colorClass="text-yellow-500"
                                borderClass="border-yellow-500"
                            />
                            <MetricCard
                                icon={Zap}
                                title="Avg Wait Time"
                                value="15 min"
                                detail="Target: < 20 min"
                                colorClass="text-indigo-500"
                                borderClass="border-indigo-500"
                            />
                        </div>

                        {/* 2. Quick Actions / Settings Grid */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-4">
                                {/* {checkPermission('Setting')&&<QuickActionButton icon={UserPlus} label="Add Patient" action='/addpatient'/>} */}
                                {checkPermission('Reports')&&<QuickActionButton icon={FileText} label="Reports" action='/reports'/>}
                                {Cookies.get("user")==='67ee5e1bde4cb48c515073ee'&&<QuickActionButton icon={Clock} label="Current OPD" action='/currentOPD'/>}
                                {Cookies.get("user")==='67ee5e1bde4cb48c515073ee'&&<QuickActionButton icon={FileText} label="Receipt" action='/makebill'/>}
                                {checkPermission('Reschedule')&&<QuickActionButton icon={CalendarDays} label="Reschedule" action='/reschedule'/>}
                                {checkPermission('Refund')&&<QuickActionButton icon={Zap} label="Refund" action='/refund'/>}
                                {checkPermission('Staff')&&<QuickActionButton icon={User} label="Staff" action='/staff'/>}
                                {checkPermission('Setting')&&<QuickActionButton icon={Settings} label="Settings" action='/settings'/>}
                                {checkPermission('Setting')&&<QuickActionButton icon={Settings} label="Change Password" action='/change-password'/>}
                            </div>
                        </div>

                        {/* 3. Today's Appointments List */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                             <div className="flex py-3 px-6 space-x-4">
                                <button 
                                     className={`
                                    py-2 px-3 sm:px-4 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap
                                    ${view === 'appointments' 
                                        ? 'border-b-4 border-emerald-600 text-emerald-700 bg-emerald-50'
                                        : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setView('appointments')}
                                >
                                    Appointments
                                </button>
                                
                                <button 
                                   className={`
                                    py-2 px-3 sm:px-4 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap
                                    ${view === 'assign' 
                                        ? 'border-b-4 border-emerald-600 text-emerald-700 bg-emerald-50'
                                        : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
                                    }
                                `}
                                    onClick={() => setView('assign')}
                                >
                                    Current OPD
                                </button>

                                <button 
                                   className={`
                                    py-2 px-3 sm:px-4 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap
                                    ${view === 'Current' 
                                        ? 'border-b-4 border-emerald-600 text-emerald-700 bg-emerald-50'
                                        : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
                                    }
                                `}
                                    onClick={() => setView('Current')}
                                >
                                    All
                                </button>
                                
                            </div>

                           {view==="appointments"&& <div className="p-4">
                                {/* Search and Date Picker Area */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-4 text-sm">
                                    <input
                                        type="text"
                                        placeholder="Search by ID or Name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 p-3 px-4 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition duration-150"
                                    />
                                    <input
                                        value={selecteddate}
                                        onChange={(e)=>{setselecteddate(e.target.value);sessionStorage.setItem("date", e.target.value)}}
                                        type="date"
                                        // defaultValue="2025-11-08"
                                        className="p-2 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition duration-150"
                                    />
                                     <button
                                    onClick={downloadPdf}
                                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition duration-150"
                                    aria-label="Download Appointments List"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Download CSV</span>
                                    </button>
                                </div>
                                
                                {/* Appointment List */}
                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                                    {filteredAppointments.length > 0 ? (
                                        filteredAppointments.filter((item)=>(item.appointmenttype!=='current')).map(appt => (
                                            <AppointmentRow key={appt.id} {...appt} data={appt} onUpdateClick={() => openUpdateModal(appt)} />
                                        ))
                                    ) : (
                                        <p className="p-4 text-center text-gray-500">
                                            No Appointments Found.
                                        </p>
                                    )}
                                </div>

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    Total Appointments Shown: {filteredAppointments.length}
                                </p>

                                      <UpdateIdModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onSubmit={handleUpdateId} />
                <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
               
                            </div>}
                             {view==="Current"&& <div className="p-4">
                                {/* Search and Date Picker Area */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-4 text-sm">
                                    <input
                                        type="text"
                                        placeholder="Search by ID or Name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 p-3 px-4 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition duration-150"
                                    />
                                    <input
                                        value={selecteddate}
                                        onChange={(e)=>setselecteddate(e.target.value)}
                                        type="date"
                                        // defaultValue="2025-11-08"
                                        className="p-2 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition duration-150"
                                    />
                                     <button
                                    onClick={downloadPdf}
                                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition duration-150"
                                    aria-label="Download Appointments List"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Download CSV</span>
                                    </button>
                                </div>
                                
                                {/* Appointment List */}
                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                                    {filteredAppointments.length > 0 ? (
                                        filteredAppointments.map(appt => (
                                            <AppointmentRow key={appt.id} {...appt} data={appt} onUpdateClick={() => openUpdateModal(appt)}  />
                                        ))
                                    ) : (
                                        <p className="p-4 text-center text-gray-500">
                                            No Appointments Found.
                                        </p>
                                    )}
                                </div>

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    Total Appointments Shown: {filteredAppointments.length}
                                </p>
                            </div>}

                            {
                              view === "assign" &&  <AssignSlot/>
                            }

                            {view === "requests" && (
                                <div className="px-4 py-4 w-full mx-auto">
                                    {requests.length > 0 ? (
                                    <>
                                        {/* DESKTOP TABLE VIEW: Visible on sm (640px) and up */}
                                        <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg shadow-md">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-emerald-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patient</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Time</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                            {requests.map((app, index) => (
                                                <tr key={app._id} className="hover:bg-emerald-50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-semibold text-emerald-700">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-gray-900 uppercase">{app.name}</div>
                                                    <div className="text-xs text-gray-500">{app.mobile} | {app.age}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    <div className="font-medium">{new Date(app.appointmentDate).toLocaleDateString('en-GB')}</div>
                                                    <div className="text-xs text-gray-500">{app.timeSlot}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.isVaccination ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {app.isVaccination ? 'Vaccination' : 'Consultation'}
                                                    </span>
                                                </td>
                                                {/* <td className="px-4 py-3 text-center space-x-2">
                                                    <button onClick={() => updateAppointmentStatus(app._id, 'Approved')} className="text-emerald-600 hover:text-emerald-800 font-bold text-xs uppercase">Approve</button>
                                                    <button onClick={() => updateAppointmentStatus(app._id, 'Declined')} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase">Decline</button>
                                                </td> */}
                                                  <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <button
                                                            onClick={() => updateAppointmentStatus(app, 'Approved')}
                                                            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-md flex items-center"
                                                            title="Approve Appointment"
                                                        >
                                                            <i className="fas fa-check mr-1"></i> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateAppointmentStatus(app, 'Declined')}
                                                            className="px-3 py-1 text-xs font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow-md flex items-center"
                                                            title="Decline Appointment"
                                                        >
                                                            <i className="fas fa-times mr-1"></i> Decline
                                                        </button>
                                                    </div>
                                                </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        </div>

                                    {/* MOBILE CARD VIEW: Modern App-style Layout */}
                                    <div className="sm:hidden space-y-3">
                                    {requests.map((app, index) => (
                                        <div key={app._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        {/* Top Section: Identity & Badge */}
                                        <div className="p-4 flex justify-between items-center bg-gray-50/50">
                                            <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                                                {app.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight leading-none">{app.name}</h3>
                                                <span className="text-[12px] text-gray-500 font-medium">{app.mobile}</span>
                                            </div>
                                            </div>
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${app.isVaccination ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                            {app.isVaccination ? 'VACCINATION' : 'CONSULTATION'}
                                            </span>
                                        </div>

                                        {/* Middle Section: Info Grid */}
                                        <div className="px-4 py-3 grid grid-cols-2 gap-2 border-t border-gray-50">
                                            <div className="flex items-center space-x-2 text-gray-600">
                                            <i className="fas fa-calendar-day text-emerald-500 text-xs"></i>
                                            <span className="text-xs font-medium">{new Date(app.appointmentDate).toLocaleDateString('en-GB')}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-600">
                                            <i className="fas fa-clock text-emerald-500 text-xs"></i>
                                            <span className="text-xs font-medium">{app.timeSlot}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-600 col-span-2">
                                            <i className="fas fa-phone-alt text-emerald-500 text-xs"></i>
                                            <span className="text-xs font-medium">Age:{app.age}</span>
                                            </div>
                                        </div>

                                        {/* Bottom Section: Full-Width Actions */}
                                        <div className="flex border-t border-gray-100">
                                            <button 
                                            onClick={() => updateAppointmentStatus(app, 'Declined')}
                                            className="flex-1 py-3 text-xs font-bold text-red-500 hover:bg-red-100 transition-colors border-r border-gray-100"
                                            >
                                            DECLINE
                                            </button>
                                            <button 
                                            onClick={() => updateAppointmentStatus(app, 'Approved')}
                                            className="flex-1 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors"
                                            >
                                            APPROVE
                                            </button>
                                        </div>
                                        </div>
                                    ))}
                                    </div>
                                    </>
                                    ) : (
                                    <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-600 italic">
                                        <p>No appointment requests found.</p>
                                    </div>
                                    )}
                                </div>
                                )}
                        </div>
                    </div>
               
                </div>
                </>
    )
}


// 1. Get the current URL location
    const location = useLocation();
    
    // 1. Ref to the main scrollable content area
    const mainContentRef = useRef(null);

    // 2. Define the condition for showing the full dashboard layout
    // The sidebar and layout should be HIDDEN on the '/login' route.
    const isLoginPage = location.pathname === '/login';
    const isNotHomePage = location.pathname !== '/';

    useEffect(() => {
    if (mainContentRef.current) {
        // Scroll the main content area (the element with overflow-y-auto) to the absolute top
        mainContentRef.current.scrollTo({
            top: 0,
            behavior: 'instant' // Ensure immediate scroll without smooth animation
        });
    }
    }, [location.pathname]);

//   if (loading) return <h2>Loading...</h2>;

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <h1 className="text-9xl font-extrabold text-gray-800 tracking-widest">
                404
            </h1>
            <div className="bg-green-600 px-2 text-sm rounded rotate-12 absolute text-white">
                Page Not Found
            </div>
            <p className="mt-5 text-xl text-gray-600">
                Sorry, we couldn't find the page you're looking for.
            </p>
            <Link
                to="/"
                className="mt-8 px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out shadow-lg"
            >
                Go to Dashboard
            </Link>
        </div>
    );
}; 

  if (isLoginPage) {
        return (
            // A simple, unstyled container for the login page
            <div className={`h-screen  items-center justify-center ${SOFT_BG} font-sans`}>
                <Routes>
                    <Route path="*" element={<LoginPage />} />                    {/* Optionally handle mistyped authenticated routes with a redirect here */}
                </Routes>
            </div>
        );
    }
  


    return (
        <div className={`h-screen flex ${SOFT_BG} overflow-hidden font-sans`}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar - Dynamically adjusted width */}
            <aside
                className={`fixed top-0 left-0 min-h-screen flex flex-col ${
                    isSidebarCollapsed ? 'w-20 p-4' : 'w-54 p-6'
                } bg-white border-r border-gray-200 shadow-xl z-30 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative lg:translate-x-0 lg:shadow-none lg:h-full`}
            >
                {/* Header/Logo */}
                <div className={`mb-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center'} transition-all duration-300`}>
                    {/* Logo Icon (always visible) */}
                    {/* <HeartPulse className={`w-7 h-7 text-green-600 ${!isSidebarCollapsed ? 'mr-2' : ''}`} /> */}
                    <img className={`${!isSidebarCollapsed?'w-30':"w-13"}`} src='https://care2connect.in/assets/pp-BXFzvpwK.png' alt='logo'/>
                    {/* Text (hidden when collapsed) */}
                    {/* {!isSidebarCollapsed && (
                        <span className="text-2xl font-bold">
                            Care2Connect
                        </span>
                    )} */}
                </div>
                
                {/* Navigation Items */}
               <nav className="space-y-2 flex-1">
                {navItems.map((item) =>{
                    if(!item.display) return
                    return (
                    <NavItem
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => handleNavigationClick(item.key)}
                    isCollapsed={isSidebarCollapsed}
                    path={item.path}
                    />
                )})}
                </nav>



                {/* Collapse Toggle (Desktop only) */}
                <div className={`pt-4 ${isSidebarCollapsed ? 'justify-center' : 'justify-end'} border-t border-gray-100 flex`}>
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition duration-150"
                        title={isSidebarCollapsed ? 'Expand Menu' : 'Collapse Menu'}
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                </div>

                {/* Logout Item */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <NavItem
                        icon={LogOut}
                        label="Logout"
                        isActive={false}
                        onClick={() => setShowLogoutModal(true)} 
                        isCollapsed={isSidebarCollapsed}
                    />
                </div>
            </aside>

            {/* Main Content Area */}
            <main  className="flex-1">
                
                {/* Top Bar for Mobile Menu */}
                <header className="flex justify-between items-center lg:hidden p-3 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-10">
                     <div className="flex items-center space-x-2">
                    {isNotHomePage&&<Link
                                to={-1} 
                                className="inline-flex items-center text-emerald-700 borde p-2 rounded-full font-semibold text-sm transition duration-150 hover:bg-emerald-200 hover:shadow-md"
                            >
                                <ArrowLeft className='w-6 h-6'/>
                                {/* Back */}
                            </Link>}
                    <h1 onClick={()=>navigate(-1)} className="text-2xl font-bold text-gray-900">Care2Connect</h1>
                    </div>
                    <button
                        className="text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                </header>

                {/* 2. DESKTOP/AUTHENTICATED TOP BAR (NEW) */}
                <div className={`hidden lg:flex items-center mb-8 border-b border-gray-200 fixed top-0 left-0 right-0 bg-white z-10 p-1 ${isNotHomePage?"justify-between":"justify-end"} px-8`}>

                {/* Search Bar/Page Title Area */}
                {isNotHomePage&&<div className={`flex items-center space-x-3 ${isSidebarCollapsed ? 'pl-18' : 'pl-62' } transition-all duration-300`}>
                   <Link 
                        to={'/'} 
                        className="inline-flex items-center text-emerald-700 bg-emerald-100 border border-emerald-300 py-2 px-4 rounded-full font-semibold text-sm transition duration-150 hover:bg-emerald-200 hover:shadow-md"
                    >
                        <ArrowLeft className='w-4 h-4 mr-2'/>
                        Back
                    </Link>
                {/* <h1 className="text-3xl font-bold text-gray-900 px-4 py-2 gap-3 flex items-center">
                    <Stethoscope size={24} /> Care2Connect
                </h1> */}
                </div>}
                
                {/* User & Actions Area */}
               <div className="flex items-center space-x-0">
                    
                    {/* Notification Icon (Add hover animation) */}
                    <button className="relative p-2 text-gray-500 hover:text-emerald-600 transition duration-150 hover:scale-105">
                        {/* <Bell className="w-6 h-6" /> */}
                        {/* ... dot ... */}
                    </button>

                    {/* User Profile Menu */}
                     <div className="relative" ref={profileMenuRef}>
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className={`flex items-center space-x-3 p-1.5 rounded-xl transition ${isProfileMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                            >
                                <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                                    <span className="font-bold text-green-700 text-sm"><User2 size={15}></User2></span>
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-bold text-gray-800 leading-tight">{Cookies.get('name')}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">Administrator</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Account Settings</p>
                                    </div>
                                    
                                    {/* <Link 
                                        to="/settings" 
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <User className="w-4 h-4 mr-3" /> Profile Details
                                    </Link> */}
                                    
                                    <Link 
                                        to="/change-password" 
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    >
                                        <Key className="w-4 h-4 mr-3" /> Change Password
                                    </Link>
                                    
                                    {/* <div className="h-px bg-gray-50 my-1"></div> */}
                                    
                                    {/* <button 
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            setShowLogoutModal(true);
                                        }}
                                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" /> Sign Out
                                    </button> */}
                                </div>
                            )}
                        </div> 

                         
            </div>
               
                    </div>

               
                <div ref={mainContentRef} className='mt-17 overflow-y-auto h-[calc(100vh-80px)]'>
                <Routes>
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/" element={<RenderView/>} />
                    <Route path="/appointments" element={<DateSetting />} />
                    <Route path="/appointment/:id" element={<PatientDetails />} />
                    <Route path="/settings" element={<Setting />} />
                    <Route path="/reports" element={<LedgerView />} />
                    <Route path="/reschedule" element={<DoctorReschedule />} />
                    <Route path="/adddescription" element={<Addproduct />} />
                    <Route path="/addpatient" element={<Addpatient />} />
                    <Route path="/makebill" element={<Makebill />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/brackup" element={<BrackupFarm />} />
                    <Route path="/updatebrackup" element={<UpdateBrackup />} />
                    <Route path="/editamount" element={<EditReceipt />} />
                    <Route path="/currentOPD" element={ <iframe
                                                            src="https://dnb.care2connect.in"
                                                            title="External Website"
                                                            width="100%"
                                                            height="100%"
                                                            style={{ border: "none" }}
                                                        />} />
                    {/* <Route path="/currentOPD" element={<CurrentOPD />} /> */}
                    <Route path="/doctorledger" element={<DoctorLedgerPage />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/refund" element={<RefundUser />} />
                </Routes>
                </div>
                          </main>

                        
            {/* Custom Logout Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutConfirm}
            />
        </div>
    );
};

export default Dashboard;