import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../loading-overlay/LoadingOverlay';
import { RequestForgotPasswordOTP } from '../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recoveryType, setRecoveryType] = useState('username'); // 'username' or 'email'
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const validateUsername = (username) => {
        if (!username) return "Username is required";
        if (username.length < 4) return "Username must be at least 4 characters";
        return "";
    };

    const validateEmail = (email) => {
        if (!email) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Please enter a valid email address";
        return "";
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        
        let error = '';
        switch (field) {
            case 'username':
                error = validateUsername(formData.username);
                break;
            case 'email':
                error = validateEmail(formData.email);
                break;
        }
        
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleRecoveryTypeChange = (type) => {
        setRecoveryType(type);
        setFormData({ username: '', email: '' });
        setErrors({});
        setTouched({});
        setIsSubmitted(false);
    };

    const handleSubmit = async () => {
        let identifierError = '';
        
        if (recoveryType === 'username') {
            identifierError = validateUsername(formData.username);
        } else {
            identifierError = validateEmail(formData.email);
        }
        
        const newErrors = {
            [recoveryType]: identifierError
        };
        
        setErrors(newErrors);
        setTouched({ [recoveryType]: true });
        
        if (identifierError) {
            return;
        }
        
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            const userNameOrEmail = recoveryType === 'username' ? formData.username : formData.email;
            const response = await RequestForgotPasswordOTP(userNameOrEmail);
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem("userNameOrEmail", userNameOrEmail);
                setIsLoading(false);
                setIsSubmitted(true);
                toast.success(`Recovery instructions sent to your ${recoveryType === 'email' ? 'email' : 'registered email'}`);
            } else {
                setIsLoading(false);
                toast.error(data.errorMessage);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error("Network error: Please check your network connection or try again later");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <section className="h-screen pt-0 pb-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/30 to-slate-300/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/20 to-slate-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-stone-200/25 to-slate-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>
                
                <div className="max-w-md w-full relative">
                    <div className="transition-all duration-1200 ease-out transform translate-y-0 opacity-100">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4 leading-tight">
                                Check Your Email
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent rounded-full mx-auto mb-6"></div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-200/50 p-8 text-center">
                            <p className="text-stone-600 mb-6 leading-relaxed">
                                We've sent password recovery instructions to the email address associated with your {recoveryType}.
                            </p>
                            <p className="text-sm text-stone-500 mb-8">
                                If you don't receive an email within a few minutes, please check your spam folder.
                            </p>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setFormData({ username: '', email: '' });
                                        setErrors({});
                                        setTouched({});
                                    }}
                                    className="w-full py-3 px-6 rounded-xl font-medium text-stone-600 border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all duration-300 transform hover:scale-105 focus:outline-none cursor-pointer"
                                >
                                    Try Again
                                </button>
                                
                                <button
                                    onClick={() => navigate("/otp-validation")}
                                    className="w-full py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none cursor-pointer"
                                >
                                    Validate OTP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section ref={formRef} className="h-screen pt-0 pb-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/30 to-slate-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/20 to-slate-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-stone-200/25 to-slate-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="max-w-md w-full relative">
                <div className={`transition-all duration-1200 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    {/* Back button */}
                    <div className="mb-6">
                        <button 
                            onClick={() => window.history.back()}
                            className="flex items-center text-stone-600 hover:text-stone-800 transition-colors duration-200 group cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                            Back to Sign In
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4 leading-tight">
                            Reset Password
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent rounded-full mx-auto mb-6"></div>
                    </div>

                    <div className="mb-8">
                        <div className="flex bg-stone-100/80 rounded-xl p-1 backdrop-blur-sm border border-stone-200/50">
                            <button
                                onClick={() => handleRecoveryTypeChange('username')}
                                style={{ cursor: "pointer" }}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                                    recoveryType === 'username'
                                        ? 'bg-white text-stone-800 shadow-lg'
                                        : 'text-stone-600 hover:text-stone-800'
                                }`}
                            >
                                <User className="w-4 h-4 mr-2" />
                                Username
                            </button>
                            <button
                                onClick={() => handleRecoveryTypeChange('email')}
                                style={{ cursor: "pointer" }}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                                    recoveryType === 'email'
                                        ? 'bg-white text-stone-800 shadow-lg'
                                        : 'text-stone-600 hover:text-stone-800'
                                }`}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-200/50 p-8">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium text-stone-700 mb-2">
                                    {recoveryType === 'username' ? 'Username' : 'Email Address'}
                                </label>
                                <div className="relative">
                                    <input
                                        id="identifier"
                                        type={recoveryType === 'username' ? 'text' : 'email'}
                                        value={recoveryType === 'username' ? formData.username : formData.email}
                                        onChange={(e) => handleInputChange(recoveryType, e.target.value)}
                                        onBlur={() => handleBlur(recoveryType)}
                                        className={`w-full px-4 py-3 pl-12 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 ${
                                            errors[recoveryType] && touched[recoveryType]
                                                ? 'border-red-300 bg-red-50/50'
                                                : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400'
                                        }`}
                                        placeholder={`Enter your ${recoveryType}`}
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                                        {recoveryType === 'username' ? 
                                            <User className="w-5 h-5 text-stone-400" /> : 
                                            <Mail className="w-5 h-5 text-stone-400" />
                                        }
                                    </div>
                                </div>
                                {errors[recoveryType] && touched[recoveryType] && (
                                    <p className="mt-2 text-sm text-red-600 animate-pulse">{errors[recoveryType]}</p>
                                )}
                            </div>

                            <div
                                onClick={handleSubmit}
                                className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 focus:outline-none cursor-pointer text-center ${
                                    isLoading
                                        ? 'bg-stone-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Sending Instructions...
                                    </div>
                                ) : (
                                    'Send Reset Instructions'
                                )}
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-stone-500">
                                Remember your password?{' '}
                                <button 
                                    onClick={() => window.history.back()}
                                    className="text-stone-600 hover:text-stone-800 font-medium transition-colors duration-200 cursor-pointer"
                                >
                                    Sign in here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Loading Overlay Component */}
            <LoadingOverlay
                isVisible={isLoading}
                message="Processing Request"
                submessage="Please wait while we send recovery instructions"
            />
        </section>
    );
}