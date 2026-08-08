import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL_TO = import.meta.env.VITE_API_URL;
const DOCTOR_ID = "67ee5e1bde4cb48c515073ee"; 

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const triggerErrorAlert = (title, message) => {
    setAlertConfig({ isOpen: true, title, message });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      setIsLoading(true);
      const apiUrl = `${API_BASE_URL_TO}/get_profile/${DOCTOR_ID}/`;
      
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            'x-api-key': '1234',
            'Accept': 'application/json'
          }
        });

        if (response.data) {
          setProfile(response.data);
        } else {
          throw new Error("No data received from profile endpoint.");
        }
      } catch (error) {
        console.error("Failed to load doctor profile:", error);
        triggerErrorAlert(
          'Profile Error', 
          error.response?.data?.message || 'Could not retrieve profile settings from the server.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-gray-500">Retrieving profile metrics...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md border max-w-sm w-full text-center space-y-3">
          <div className="text-red-500 text-3xl">⚠️</div>
          <h3 className="text-lg font-bold text-gray-900">Failed to Load Profile</h3>
          <p className="text-sm text-gray-500">Profile metrics could not be synchronized over the network at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {alertConfig.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-red-100 overflow-hidden">
              <div className="p-5 border-b text-lg font-bold flex items-center gap-2 text-red-600 bg-red-50">
                <span>❌</span> {alertConfig.title}
              </div>
              <div className="p-6 text-sm text-gray-600 leading-relaxed">
                {alertConfig.message}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={closeAlert}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-md shadow-sm transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="p-6 relative flex flex-col sm:flex-row items-center gap-6 -mt-16">
            <img 
              src={profile.imageUrl} 
              alt={profile.name} 
              className="w-32 h-32 rounded-2xl border-4 border-white object-cover shadow-md bg-gray-100"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150?text=Doctor+Profile";
              }}
            />
            <div className="text-center sm:text-left mt-12 sm:mt-16 flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 capitalize">
                  {profile.role}
                </span>
              </div>
              <p className="text-emerald-600 font-semibold text-sm">{profile.speciality}</p>
              <p className="text-gray-500 text-xs font-medium">Practitioner ID: {profile.secondaryId}</p>
            </div>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Experience</span>
            <span className="text-xl font-bold text-gray-800">{profile.experience} Years</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Appointment Fee</span>
            <span className="text-xl font-bold text-emerald-600">₹{profile.appointmentfee}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Booking Window</span>
            <span className="text-xl font-bold text-gray-800">{profile.appointmentdatelimit} Days</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Operational Status</span>
            <span className={`text-sm font-bold inline-block mt-1 px-2 py-0.5 rounded ${profile.COPDstoptime?.status ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {profile.COPDstoptime?.status ? 'Suspended' : 'Active'}
            </span>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Contact & Location Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span>📋</span> Practice Location Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block text-xs">Professional Email</span>
                <span className="text-gray-700 font-medium">{profile.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Contact Number</span>
                <span className="text-gray-700 font-medium">+{profile.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Clinic Address</span>
                <span className="text-gray-700 font-medium capitalize">{profile.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block text-xs">District</span>
                  <span className="text-gray-700 font-medium capitalize">{profile.district}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">State</span>
                  <span className="text-gray-700 font-medium capitalize">{profile.state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Structures */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span>💳</span> Consultation Fees Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50 bg-emerald-50/50 px-2 rounded">
                <span className="text-emerald-800 font-medium">Standard Appointment Fee</span>
                <span className="font-bold text-emerald-700">₹{profile.appointmentfee}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 bg-teal-50/50 px-2 rounded">
                <span className="text-teal-800 font-medium">Follow-up / Re-appointment</span>
                <span className="font-bold text-teal-700">₹{profile.secondappointmentfee}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Schedule Windows */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span>📅</span> Scheduling & Booking Policies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-xs font-bold uppercase tracking-wider mb-1">Advance Booking Limit</span>
              Patients can schedule appointments up to <strong className="text-gray-800">{profile.appointmentdatelimit} days</strong> in advance from the current date.
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-xs font-bold uppercase tracking-wider mb-1">Re-appointment Expiry</span>
              The validation window for a continuous discounted re-appointment closes after <strong className="text-gray-800">{profile.reappointmentdayslimit} days</strong>.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorProfile;