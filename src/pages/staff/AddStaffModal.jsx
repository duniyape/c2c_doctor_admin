import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Check, ArrowRight, User, ArrowLeft } from 'lucide-react';

const PERMISSION_OPTIONS = [
  "Setting","Staff",'Refund','Reports','Reschedule'
];

const AddStaffModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [step, setStep] = useState(1); // 1 = Details, 2 = Permissions
  
  // Default Empty State
  const defaultState = {
    // EmpID: "EMP" + Math.floor(1000 + Math.random() * 9000), 
    name: "", email: "", phone: "", address: "", district: "", state: "",
    role: "staff", speciality: "", experience: "", password: "", confirmPassword: "",
    doctorId: "", phonenumberID: "", accessToken: "", imageUrl: "",
    permissions: [] 
  };

  const [formData, setFormData] = useState(defaultState);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1); // Always start at Step 1
      if (initialData) {
        setFormData({ ...initialData, password: "", confirmPassword: "" });
      } else {
        setFormData(defaultState);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePermission = (perm) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists 
          ? prev.permissions.filter(p => p !== perm)
          : [...prev.permissions, perm]
      };
    });
  };

  // Move to Step 2
  const handleNext = (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Simple validation could go here
    setStep(2);
  };

  // Final Save
  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* --- Header & Stepper --- */}
        <div className="flex flex-col border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center p-6 pb-2">
            <div>
              <h2 className="text-xl font-bold text-emerald-700">
                {initialData ? "Edit Staff" : "Add New Staff"}
              </h2>
              <p className="text-sm text-slate-500">
                Step {step} of 2: {step === 1 ? "Personal Details" : "Access Permissions"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-slate-200 mt-2">
            <div 
              className="h-full bg-teal-600 transition-all duration-300 ease-in-out" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
        </div>

        {/* --- Body Content --- */}
        <div className="overflow-y-auto p-6 flex-1 bg-white">
          
          {/* STEP 1: FORM DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                <InputGroup label="Email" name="email" value={formData.email} onChange={handleChange} />
                <InputGroup label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                <InputGroup label="Address" name="address" value={formData.address} onChange={handleChange} />
                <InputGroup label="District" name="district" value={formData.district} onChange={handleChange} />
                <InputGroup label="State" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* <InputGroup label="Employee ID" name="EmpID" value={formData.EmpID} onChange={handleChange} /> */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="staff">Staff</option><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="admin">Admin</option>
                  </select>
                </div>
                <InputGroup label="Speciality" name="speciality" value={formData.speciality} onChange={handleChange} />
                <InputGroup label="Experience" name="experience" value={formData.experience} onChange={handleChange} />
                {/* <InputGroup label="Doctor ID" name="doctorId" value={formData.doctorId} onChange={handleChange} /> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Unchanged if blank" />
                <InputGroup label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* STEP 2: PERMISSIONS GRID */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-4 flex items-start gap-3">
                <Shield className="text-teal-600 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-teal-800">Access Control</h4>
                  <p className="text-xs text-teal-600 mt-1">Select the features this staff member is allowed to access. Unchecked items will be hidden from their dashboard.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PERMISSION_OPTIONS.map(perm => {
                  const isSelected = formData.permissions.includes(perm);
                  return (
                    <div 
                      key={perm} 
                      onClick={() => togglePermission(perm)} 
                      className={`
                        cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all duration-200 select-none
                        ${isSelected ? 'bg-teal-600 border-teal-600 shadow-lg shadow-teal-200' : 'bg-white border-slate-100 hover:border-teal-300 hover:bg-slate-50'}
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-lg flex items-center justify-center transition-colors 
                        ${isSelected ? 'bg-white text-teal-600' : 'bg-slate-200 text-slate-400'}
                      `}>
                        <Check size={14} strokeWidth={4}/>
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                        {perm}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* --- Footer Actions --- */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          
          {/* Back Button */}
          {step === 2 ? (
            <button 
              onClick={() => setStep(1)} 
              className="px-4 py-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 font-medium rounded-xl transition-all flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Back to Details
            </button>
          ) : (
             <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
          )}

          {/* Action Button */}
          {step === 1 ? (
            <button 
              onClick={handleNext} 
              className="px-8 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center gap-2"
            >
              <Save size={18} /> Save & Finish
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

const InputGroup = ({ label, name, type = "text", value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500">{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value || ""} 
      onChange={onChange} 
      placeholder={placeholder} 
      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-300" 
    />
  </div>
);

export default AddStaffModal;