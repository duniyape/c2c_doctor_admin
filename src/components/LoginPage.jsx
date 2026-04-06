import React, { useState } from 'react';
import { HeartPulse, User, Lock, Loader2 } from 'lucide-react';
import useApi from '../api/useApi';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

// --- Configuration (Matching Dashboard Theme) ---
// Note: Colors will now influence the subtle glassy tones.
const PRIMARY_COLOR = 'bg-green-600';
const ACCENT_COLOR = 'text-green-600';
// Changed SOFT_BG to a gradient for a more dynamic glassy backdrop
const GRADIENT_BG = 'bg-gradient-to-br from-green-100 to-cyan-100'; // Softer, more vibrant background

const LoginPage = () => {
    // 1. State management for form data
    const [formData, setFormData] = useState({ email: "", password: "" });
     const {postData} = useApi()
    const navigate = useNavigate();
    // 2. State management for loading/error status
    const [loginStatus, setLoginStatus] = useState({ error: null, loading: false });

    const handleChange = (e) => {
        // Clear error message whenever the user types
        setLoginStatus({ error: null, loading: false });
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoginStatus({ error: null, loading: true });

    // Delay (simulate API loading)
    // setTimeout(async () => {
        try {
            let res = await postData('/login-kk', {
                username: formData.email,
                password: formData.password,
            });

            console.log(res);

            if (!res) {
                setLoginStatus({ error: "Invalid Email or Password", loading: false });
                return;
            }

            // Store cookies based on role
            Cookies.set('phoneid', res.phonenumberID, { expires: 360 });
            Cookies.set('token', res.accessToken, { expires: 360 });
            Cookies.set('role', res.role, { expires: 360 });
            Cookies.set('name', res.name, { expires: 360 });

            if (res.role === "doctor") {
                Cookies.set('user', res.user, { expires: 360 });
                Cookies.set('Hospital', 'No', { expires: 360 });

         
            }else if (res.role === "hospital") {
                Cookies.set('user', res.user, { expires: 360 });
                Cookies.set('HospitalID', res.hospital, { expires: 360 });
                Cookies.set('Hospital', 'Yes', { expires: 360 });
                Cookies.set('role', 'doctor', { expires: 360 });

            }
             else {
                Cookies.set('Hospital', 'No', { expires: 360 });
                Cookies.set('user', res.doctorId, { expires: 360 });
                Cookies.set('EmpID', res.user, { expires: 360 });
            }

            navigate('/');

        } catch (err) {
            console.error(err);
            setLoginStatus({
                error: "Something went wrong, try again later.",
                loading: false,
            });
        }
    // }, 1500);
};


    return (
        // Changed main background to a gradient for the glassy effect to shine
        <div className={`min-h-screen flex items-center justify-center ${GRADIENT_BG} p-4 sm:p-6 relative`}>
            
            {/* Optional: Add some floating background elements for extra visual flair in a glassy theme */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>


            {/* Login Card - now with Glassy Effect */}
            <div className="relative z-10 w-full max-w-md bg-white/80 rounded-3xl shadow-2xl p-8 sm:p-10 
                            border border-white/50 backdrop-blur-xl backdrop-filter transition duration-500 
                            transform hover:shadow-3xl hover:-translate-y-1"> 
                
                {/* Header/Logo */}
                <div className="text-center mb-10">
                    <div className="flex justify-center items-center mb-4">
                        <HeartPulse className={`w-10 h-10 ${ACCENT_COLOR}`} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 drop-shadow-sm">
                        Care2connect Login
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Access your healthcare professional dashboard
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    
                    {/* Username Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Username / Email
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                placeholder="e.g., dr.smith"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition duration-150 bg-white/60" // Glassy input
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition duration-150 bg-white/60" // Glassy input
                            />
                        </div>
                    </div>
                    
                    {/* Action Links */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className={`h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500`}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <a href="#" className={`font-medium ${ACCENT_COLOR} hover:text-green-700 transition duration-150`}>
                            Forgot password?
                        </a>
                    </div>
                    
                    {/* Error Message Display */}
                    {loginStatus.error && (
                        <div className="text-sm text-center font-medium text-red-700 bg-red-100 p-3 rounded-lg border border-red-200">
                            {loginStatus.error}
                        </div>
                    )}


                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loginStatus.loading}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-xl text-lg font-semibold text-white 
                                ${PRIMARY_COLOR} hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 transform 
                                ${loginStatus.loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                        >
                            {loginStatus.loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

            </div>
            {/* Added a custom style block for keyframe animations if not using a build process that handles @keyframes directly */}
            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite cubic-bezier(0.64, 0.04, 0.35, 1);
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;