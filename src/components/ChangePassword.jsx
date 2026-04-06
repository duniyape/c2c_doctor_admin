import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';

export default function App() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

      const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  // Calculate password strength percentage
  const strengthScore = Object.values(validations).filter(v => v).length - 1; // excluding match
  const strengthPercentage = Math.max(0, (strengthScore / 5) * 100);

  useEffect(() => {
    const { newPassword, confirmPassword } = formData;
    setValidations({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
      match: newPassword !== '' && newPassword === confirmPassword
    });
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!Object.values(validations).every(v => v)) return;

  setIsSubmitting(true);

  try {
    const userId = Cookies.get('user'); // login ke baad store kiya hua

    const response = await fetch("https://api.care2connect.in/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        old_password: formData.currentPassword,
        new_password: formData.newPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      setIsSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } else {
      alert(data.error || "Password change failed");
    }

  } catch (error) {
    alert("Server error");
    console.error(error);
  }

  setIsSubmitting(false);
};

  const ValidationItem = ({ label, isValid }) => (
    <div className={`flex items-center space-x-2 text-sm transition-colors duration-300 ${isValid ? 'text-emerald-600' : 'text-slate-400'}`}>
      {isValid ? <CheckCircle2 size={14} /> : <XCircle size={14} className="opacity-40" />}
      <span>{label}</span>
    </div>
  );

  const getStrengthColor = () => {
    if (strengthPercentage <= 20) return 'bg-rose-500';
    if (strengthPercentage <= 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 text-center animate-in fade-in zoom-in duration-500 border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Updated!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Your account security has been successfully updated. Please use your new password for future logins.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-md shadow-slate-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-5">
          
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Change Password</h1>
          <p className="text-slate-500 mt-1.5">Change your password to keep your account safe</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Current Password</label>
              <div className="relative group">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
               <div className="h-px bg-slate-100 flex-1" />
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">New Credentials</span>
               <div className="h-px bg-slate-100 flex-1" />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
              <div className="relative group">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="Create a strong password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Strength Meter */}
              {formData.newPassword && (
                <div className="pt-2 px-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <span>Password Strength</span>
                    <span className={strengthPercentage > 60 ? 'text-emerald-600' : 'text-slate-500'}>
                      {strengthPercentage <= 20 ? 'Weak' : strengthPercentage <= 60 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`}
                      style={{ width: `${strengthPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Confirm New Password</label>
              <div className="relative group">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="Repeat new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <CheckCircle2 className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${validations.match ? 'text-emerald-500' : 'text-slate-400'}`} size={18} />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-2 gap-y-3 border border-slate-100">
              <ValidationItem label="8+ characters" isValid={validations.length} />
              <ValidationItem label="Uppercase letter" isValid={validations.uppercase} />
              <ValidationItem label="Lowercase letter" isValid={validations.lowercase} />
              <ValidationItem label="Number (0-9)" isValid={validations.number} />
              <ValidationItem label="Special char" isValid={validations.special} />
              <ValidationItem label="Passwords match" isValid={validations.match} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !Object.values(validations).every(v => v)}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all active:scale-[0.99] shadow-lg shadow-indigo-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Change Password</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        
        </div>
        
       
      </div>
    </div>
  );
}