import React, { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  RefreshCw, 
  User, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  UserPlus,
  Clock,
   Calendar,
   Send,
   Check
} from "lucide-react";
import moment from "moment";
import axios from "axios";
import Cookies from 'js-cookie';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [pendingAssign, setPendingAssign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);
    try {
      const res = await fetch("https://api.care2connect.in/api/patientsx/67ee5e1bde4cb48c515073ee");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      showNotification("Failed to connect to server", "error");
    } finally {
      setLoading(false);
    }
  }

  function showNotification(message, type = "success") {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }

  // Memoized filtered list for performance
  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fatherName.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile.includes(search)
    );
  }, [patients, search]);

  function highlight(text) {
    if (!search) return text;
    const re = new RegExp(`(${search})`, "gi");
    return text.replace(re, '<mark class="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">$1</mark>');
  }

  function handleAssignClick(patient) {
    const input = document.getElementById(`input-${patient.id}`);
    const val = input?.value.trim();

    if (!val) {
      showNotification(`Token number missing for ${patient.name}`, "error");
      return;
    }

    setPendingAssign({ ...patient, val });
  }

  async function confirmAppointment() {
    if (!pendingAssign) return;

    setLoading(true);
    try {
      await fetch("https://api.care2connect.in/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pendingAssign.id,
          name: pendingAssign.name,
          mobile: pendingAssign.mobile,
          number: pendingAssign.val
        })
      });

      showNotification(`Token #${pendingAssign.val} locked for ${pendingAssign.name}`);
      setPendingAssign(null);
      loadPatients();
    } catch (err) {
      showNotification("Failed to assign token", "error");
    } finally {
      setLoading(false);
    }
  }

   const [isOn, setIsOn] = useState(true); // Default to Online
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [currentDate, setCurrentDate] = useState("");
   const [submitState, setSubmitState] = useState('idle'); // 'idle', 'loading', 'submitted'


   const USER_ID = Cookies.get('user');
      const BASE_API_URL = 'https://api.care2connect.in';
      // const BASE_API_URL = 'http://127.0.0.1:5001';

   useEffect(() => {
    const fetchdata = async () => {
      try {
        let res = await axios.post(
          `${BASE_API_URL}/get_profile/${USER_ID}/`,
          {},{
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "1234",
            },
          }
        );


       if(res.data.COPDstoptime){
        const dt =  res.data.COPDstoptime
        if(dt.date===moment(new Date()).format('YYYY-MM-DD')){
            setSubmitState('submitted')
            setSelectedTime(dt.time)
        }
       }



      } catch (error) {
          console.error("Error fetching user profile:", error);
      }
    };
    fetchdata();
  }, []);

   const save = async () => {

      setSubmitState('loading');

      
    
      try {
        await axios.post(
          `${BASE_API_URL}/v1/send-stop-booking/${USER_ID}`,
          {
            date:moment(new Date()).format('YYYY-MM-DD'),
            time:selectedTime,
            status:false
          }
        );
        setSubmitState('submitted');
     
      } catch (error) {
        setSubmitState('idle')
        console.error("Error updating user:", error);
      }

  };

  const handleSubmit = () => {
    // save()
    // setSubmitState('loading');
    // // Simulate a network request
    // setTimeout(() => {
    //   setSubmitState('submitted');
    //   // Reset after 3 seconds
    //   setTimeout(() => setSubmitState('idle'), 3000);
    // }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} className="text-green-400" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header Section */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <UserPlus size={24} />
            </div> */}
            {/* <div>
              <h1 className="text-lg md:text-2xl font-bold tracking-tight">Assign Token</h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:block">Current Booking</p>
            </div> */}


          {/* Right: Controls & Global Actions */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
            
            {/* Time Input Component */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all" title="Scheduled Start/End Time">
              <Clock className="w-4 h-4 text-slate-400" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none w-25 cursor-pointer"
              />
            </div>

           <button 
            onClick={save}
            disabled={submitState !== 'idle'}
            className={`px-4 py-2 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
              submitState === 'idle' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10 active:scale-95' 
                : submitState === 'loading'
                ? 'bg-emerald-400 cursor-wait'
                : 'bg-emerald-500 shadow-emerald-500/10'
            }`}
          >
            {submitState === 'idle' && (
              <>
                <span className="text-sm">Submit</span> <Send size={14} />
              </>
            )}
            {submitState === 'loading' && (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Sending...</span>
              </>
            )}
            {submitState === 'submitted' && (
              <>
                <span className="text-sm">Submitted</span> <Check size={14} />
              </>
            )}
          </button>

            
          </div>
     

         


          </div>

          <button
            onClick={loadPatients}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            <span className="text-sm font-semibold hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">


        


        
        {/* Search Bar */}
        <div className="relative mb-6 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, father's name or mobile..."
            className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm text-sm md:text-base"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Desktop Table View (Visible on MD screens and up) */}
        <div className="hidden md:block bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Patient Details</th>
                <th className="px-6 py-4">Father Name</th>
                <th className="px-6 py-4">Contact & Info</th>
                <th className="px-6 py-4 text-right">Appointment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800" dangerouslySetInnerHTML={{ __html: highlight(p.name) }} />
                    {/* <div className="text-xs text-slate-400 mt-0.5">ID: {p.id.slice(0, 8)}</div> */}
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-slate-600 font-medium" dangerouslySetInnerHTML={{ __html: highlight(p.fatherName) }} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Phone size={14} className="text-slate-400" />
                      <span dangerouslySetInnerHTML={{ __html: highlight(p.mobile) }} />
                    </div>
                    <div className="text-xs text-slate-400 ml-5 capitalize">{p.gender}</div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {p.appointmentNo ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm">
                        <CheckCircle size={16} />
                        #{p.appointmentNo}
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          id={`input-${p.id}`}
                          type="number"
                          placeholder="Token #"
                          className="w-24 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                        <button
                          onClick={() => handleAssignClick(p)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
                        >
                          Assign
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPatients.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No patients found matching your search criteria.
            </div>
          )}
        </div>

        {/* Mobile Card View (Visible on small screens) */}
        <div className="md:hidden space-y-4">
          {filteredPatients.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg" dangerouslySetInnerHTML={{ __html: highlight(p.name) }} />
                  <p className="text-xs text-slate-500 font-medium">Father: <span dangerouslySetInnerHTML={{ __html: highlight(p.fatherName) }} /></p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                  {p.gender}
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                <Phone size={14} />
                <span dangerouslySetInnerHTML={{ __html: highlight(p.mobile) }} />
              </div>

              <div className="pt-4 border-t border-slate-50">
                {p.appointmentNo ? (
                  <div className="w-full bg-emerald-600 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md shadow-emerald-200">
                    <CheckCircle size={18} />
                    Appointment Confirmed: #{p.appointmentNo}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      id={`input-${p.id}`}
                      type="number"
                      placeholder="Token #"
                      className="flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      onClick={() => handleAssignClick(p)}
                      className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold active:scale-95 transition-transform shadow-md shadow-emerald-200"
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredPatients.length === 0 && (
            <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
              No matching records
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {pendingAssign && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-600" size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">Confirm Token</h3>
            <p className="text-slate-500 text-center mb-8 px-2">
              Are you sure you want to assign token <span className="text-emerald-600 font-bold">#{pendingAssign.val}</span> to <span className="text-slate-900 font-semibold">{pendingAssign.name}</span>?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmAppointment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                Yes, Confirm Now
              </button>
              <button
                onClick={() => setPendingAssign(null)}
                className="w-full py-4 text-slate-400 font-semibold hover:text-slate-600 transition-colors"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {loading && !pendingAssign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl">
            <Loader2 className="animate-spin text-emerald-400" size={24} />
            <span className="font-bold tracking-tight">Processing...</span>
          </div>
        </div>
      )}

    </div>
  );
}