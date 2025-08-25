import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, RefreshCw, Shield, Clock } from 'lucide-react';
import LoadingOverlay from '../loading-overlay/LoadingOverlay';
import { RequestForgotPasswordOTP, ValidateOTP } from '../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function OTPVerificationPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isExpired, setIsExpired] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    
    const inputRefs = useRef([]);
    const intervalRef = useRef(null);

    const navigate = useNavigate();
    
    // Timer duration in seconds (5 minutes)
    const TIMER_DURATION = 5 * 60;
    const STORAGE_KEY = 'otp_timer_expiry';

    // Initialize timer on component mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        // Check if there's an existing timer in localStorage
        const storedExpiry = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();
        
        if (storedExpiry && parseInt(storedExpiry) > now) {
            // Timer is still active
            const remaining = Math.ceil((parseInt(storedExpiry) - now) / 1000);
            setTimeLeft(remaining);
        } else {
            // Start new timer
            const expiryTime = now + (TIMER_DURATION * 1000);
            localStorage.setItem(STORAGE_KEY, expiryTime.toString());
            setTimeLeft(TIMER_DURATION);
        }

        return () => clearTimeout(timer);
    }, []);

    // Timer countdown effect
    useEffect(() => {
        if (timeLeft > 0 && !isExpired) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsExpired(true);
                        localStorage.removeItem(STORAGE_KEY);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timeLeft, isExpired]);

    // Format timer display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow numeric input
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only the last character
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (newOtp.every(digit => digit !== '') && !newOtp.includes('')) {
            setTimeout(() => handleVerifyOtp(newOtp), 100);
        }
    };

    // Handle backspace/delete
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            const newOtp = [...otp];
            
            if (otp[index]) {
                // Clear current field
                newOtp[index] = '';
            } else if (index > 0) {
                // Move to previous field and clear it
                newOtp[index - 1] = '';
                inputRefs.current[index - 1]?.focus();
            }
            
            setOtp(newOtp);
            setError('');
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const saveCredentialsToLocalStorage = (data) => {
        localStorage.setItem("userId", data.id);
        localStorage.setItem("userName", data.userName);
        localStorage.setItem("email", data.email);
        localStorage.setItem("token", data.token);
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text');
        const digits = paste.replace(/\D/g, '').slice(0, 6);
        
        if (digits.length > 0) {
            const newOtp = Array(6).fill('');
            for (let i = 0; i < digits.length && i < 6; i++) {
                newOtp[i] = digits[i];
            }
            setOtp(newOtp);
            setError('');
            
            // Focus appropriate field
            const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
            inputRefs.current[focusIndex]?.focus();

            // Auto-submit if complete
            if (digits.length === 6) {
                setTimeout(() => handleVerifyOtp(newOtp), 100);
            }
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (otpArray = otp) => {
        if (isExpired) {
            setError('OTP has expired. Please request a new one.');
            return;
        }

        const otpString = otpArray.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await ValidateOTP(localStorage.getItem("userNameOrEmail"), otpString);
            const data = await response.json();
            
            if (data.success) {
                setIsLoading(false);
                setIsVerified(true);
                localStorage.removeItem(STORAGE_KEY);
                toast.success('OTP verified successfully!');
                
                saveCredentialsToLocalStorage(data.data);
                // Redirect after success animation
                setTimeout(() => {
                    navigate("/change-password");
                }, 2000);
            } else {
                setIsLoading(false);
                setError('Invalid OTP. Please check and try again.');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            setIsLoading(false);
            setError('Verification failed. Please try again.');
            toast.error('Network error. Please try again.');
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (isResending) return;
        
        setIsResending(true);
        setError('');
        setOtp(['', '', '', '', '', '']);
        
        try {
            const response = await RequestForgotPasswordOTP(localStorage.getItem("userNameOrEmail"));
            const data = await response.json();

            if (data.success) {
                toast.success('New OTP sent successfully!');
                setIsLoading(false);

                // Reset timer
                const now = Date.now();
                const expiryTime = now + (TIMER_DURATION * 1000);
                localStorage.setItem(STORAGE_KEY, expiryTime.toString());
                setTimeLeft(TIMER_DURATION);
                setIsExpired(false);
                
                setIsResending(false);
                inputRefs.current[0]?.focus();
            } else {
                setIsLoading(false);
                toast.error(data.errorMessage);
            }
            
        } catch (error) {
            setIsResending(false);
            toast.error('Failed to resend OTP. Please try again.');
        }
    };

    // Success screen
    if (isVerified) {
        return (
            <section className="h-screen pt-0 pb-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-300/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-green-300/20 to-emerald-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-green-200/25 to-emerald-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>
                
                <div className="max-w-md w-full relative">
                    <div className="transition-all duration-1200 ease-out transform translate-y-0 opacity-100">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4 leading-tight">
                                OTP Verified!
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full mx-auto mb-6"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="h-screen pt-0 pb-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
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
                            Back
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-stone-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4 leading-tight">
                            Verify OTP
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent rounded-full mx-auto mb-6"></div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-200/50 p-8">
                        {/* Timer */}
                        <div className="flex items-center justify-center mb-6">
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isExpired ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-600'}`}>
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {isExpired ? 'Expired' : formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* OTP Input */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-4 text-center">
                                    Enter 6-digit OTP
                                </label>
                                <div className="flex justify-center space-x-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => inputRefs.current[index] = el}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            disabled={isExpired || isLoading}
                                            className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 ${
                                                error
                                                    ? 'border-red-300 bg-red-50/50'
                                                    : digit
                                                    ? 'border-stone-400 bg-stone-50'
                                                    : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400'
                                            } ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    ))}
                                </div>
                                {error && (
                                    <p className="mt-3 text-sm text-red-600 text-center animate-pulse">{error}</p>
                                )}
                            </div>

                            {/* Manual verify button (hidden when auto-submit works) */}
                            <button
                                onClick={() => handleVerifyOtp()}
                                disabled={isLoading || isExpired || otp.some(digit => digit === '')}
                                className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 focus:outline-none cursor-pointer text-center ${
                                    isLoading || isExpired || otp.some(digit => digit === '')
                                        ? 'bg-stone-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify OTP'
                                )}
                            </button>
                        </div>

                        {/* Resend section */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-stone-500 mb-3">
                                Didn't receive the code?
                            </p>
                            <button
                                onClick={handleResendOtp}
                                disabled={isResending || (!isExpired && timeLeft > 0)}
                                className={`inline-flex items-center text-stone-600 hover:text-stone-800 font-medium transition-colors duration-200 cursor-pointer ${
                                    isResending || (!isExpired && timeLeft > 0) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                                {isResending ? 'Sending...' : 'Resend OTP'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <LoadingOverlay
                    isVisible={isLoading}
                    message="Verifying OTP"
                    submessage="Please wait while we verify your OTP"
                />
                )}
        </section>
    );
}