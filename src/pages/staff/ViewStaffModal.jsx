import React from 'react';
import { 
  X, Mail, Phone, MapPin, Briefcase, 
  User, Shield, Edit3, Trash2, Key, CheckCircle, 
  Calendar, Stethoscope, Hash, Building2, Map 
} from 'lucide-react';

const ViewStaffModal = ({ isOpen, onClose, staff, onEditDetails, onEditPermissions, onDelete }) => {
  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in zoom-in duration-200">
      
      <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:max-w-4xl shadow-2xl overflow-hidden flex flex-col border border-slate-100">
        
        {/* --- 1. HEADER --- */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Staff Profile</h2>
            <p className="text-xs sm:text-sm text-slate-500">View employee details.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- 2. SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {/* Profile Summary */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
               {staff.imageUrl ? (
                 <img src={staff.imageUrl} alt={staff.name} className="w-full h-full rounded-full object-cover" />
               ) : (
                 <span className="text-2xl sm:text-3xl font-bold text-teal-600">{staff.name?.charAt(0)}</span>
               )}
            </div>

            <div className="text-center md:text-left space-y-2 w-full">
               <h3 className="text-xl sm:text-2xl font-bold text-slate-800 break-words">{staff.name}</h3>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg">
                   {staff.role}
                 </span>
                 <span className="flex items-center gap-1.5 text-slate-500 font-medium text-xs sm:text-sm">
                    <Stethoscope size={14} className="text-teal-500"/> {staff.speciality || "No Speciality"}
                 </span>
                 <span className="flex items-center gap-1.5 text-slate-400 font-medium text-[10px] sm:text-xs border-l border-slate-200 pl-3">
                    <Hash size={12}/> {staff.EmpID}
                 </span>
               </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-6">
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Information</h4>
              <InfoRow label="Email Address" value={staff.email} icon={Mail} />
              <InfoRow label="Phone Number" value={staff.phone} icon={Phone} />
              <InfoRow label="Full Address" value={staff.address} icon={MapPin} />
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <InfoRow label="District" value={staff.district} icon={Building2} />
                <InfoRow label="State" value={staff.state} icon={Map} />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 pt-4 md:pt-0">Professional Details</h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                 <InfoRow label="Experience" value={staff.experience} icon={Calendar} />
                 <InfoRow label="Reporting To" value={staff.doctorId || "N/A"} icon={User} />
              </div>

              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 pt-2">System Credentials</h4>
              <InfoRow label="Phone ID" value={staff.phonenumberID} icon={Hash} />
              <InfoRow label="Access Token" value={staff.accessToken ? "••••••••••••••••" : "Not Configured"} icon={Key} />
            </div>

            <div className="md:col-span-2 pt-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex justify-between items-center">
                <span>Active Permissions</span>
                <span className="bg-teal-100 text-teal-700 text-[10px] px-2 py-0.5 rounded-full">{staff.permissions?.length || 0}</span>
              </h4>
              
              {staff.permissions && staff.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {staff.permissions.map((perm, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-600">
                      <CheckCircle size={14} className="text-teal-500" />
                      {perm}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">No specific permissions assigned.</p>
              )}
            </div>

          </div>
        </div>

        {/* --- 3. ACTION FOOTER (Perfected for Both) --- */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
           
           {/* DELETE BUTTON:
               Mobile: Square icon button (Compact)
               Desktop: Full Bordered Button (Balanced) 
           */}
           <button 
             onClick={() => onDelete(staff.EmpID)} 
             className="
               shrink-0 
               h-11 w-11 sm:h-auto sm:w-auto 
               flex items-center justify-center gap-2 
               rounded-xl transition-all 
               bg-red-50 text-red-600 hover:bg-red-100 
               sm:bg-white sm:border sm:border-red-200 sm:hover:bg-red-50 sm:px-4 sm:py-2.5
             "
             title="Delete Profile"
           >
              <Trash2 size={20} className="sm:w-[18px] sm:h-[18px]" /> 
              {/* Text only visible on Desktop */}
              <span className="hidden sm:inline text-sm font-medium">Delete Profile</span>
           </button>

           {/* ACTION GROUP: 
               Mobile: Buttons fill space (flex-1) + Short Text
               Desktop: Auto width + Full Text
           */}
           <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">

             <button 
               onClick={() => onEditDetails(staff)}
               className="
                 flex-1 sm:flex-none 
                 h-11 sm:h-auto 
                 flex items-center justify-center gap-2 
                 bg-teal-600 hover:bg-teal-700 text-white 
                 font-medium rounded-xl shadow-lg shadow-teal-200 transition-all 
                 sm:px-6 sm:py-2.5
               "
             >
                <Edit3 size={18} /> 
                {/* Mobile Text */}
                <span className="sm:hidden text-sm">Edit</span>
                {/* Desktop Text */}
                <span className="hidden sm:inline text-sm">Edit Details</span>
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-xs text-slate-400 font-medium uppercase mb-1 flex items-center gap-1.5">
       {Icon && <Icon size={12} />} {label}
    </p>
    <p className="text-sm font-semibold text-slate-700 bg-slate-50/50 p-2 sm:p-2.5 rounded-lg border border-transparent hover:border-slate-100 transition-colors break-all">
       {value || "—"}
    </p>
  </div>
);

export default ViewStaffModal;