import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Shield, Check, X } from 'lucide-react';
import LoadingOverlay from '../loading-overlay/LoadingOverlay';
import { useNavigate } from 'react-router-dom';
import { ChangePassword } from '../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Password validation function
    const validatePassword = (password) => {
        const errors = [];
        
        // Length check (8-15 characters)
        if (password.length < 8 || password.length > 15) {
            errors.push('Must be 8-15 characters long');
        }
        
        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            errors.push('Must contain at least one uppercase letter');
        }
        
        // Number check
        if (!/[0-9]/.test(password)) {
            errors.push('Must contain at least one number');
        }
        
        // Special character check
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Must contain at least one special character');
        }
        
        return errors;
    };

    // Password strength indicators
    const getPasswordStrength = (password) => {
        const criteria = [
            { label: '8-15 characters', test: (p) => p.length >= 8 && p.length <= 15 },
            { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
            { label: 'Number', test: (p) => /[0-9]/.test(p) },
            { label: 'Special character', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) }
        ];

        return criteria.map(criterion => ({
            ...criterion,
            met: criterion.test(password)
        }));
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
        if (field === 'password') {
            const passwordErrors = validatePassword(formData.password);
            if (passwordErrors.length > 0) {
                error = passwordErrors[0]; // Show first error
            }
        } else if (field === 'confirmPassword') {
            if (!formData.confirmPassword) {
                error = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                error = 'Passwords do not match';
            }
        }
        
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleSubmit = async () => {
        // Validate password
        const passwordErrors = validatePassword(formData.password);
        let confirmPasswordError = '';
        
        if (!formData.password) {
            passwordErrors.push('Password is required');
        }
        
        if (!formData.confirmPassword) {
            confirmPasswordError = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            confirmPasswordError = 'Passwords do not match';
        }
        
        const newErrors = {
            password: passwordErrors.length > 0 ? passwordErrors[0] : '',
            confirmPassword: confirmPasswordError
        };
        
        setErrors(newErrors);
        setTouched({ password: true, confirmPassword: true });
        
        if (passwordErrors.length > 0 || confirmPasswordError) {
            return;
        }
        
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            const authToken = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if(authToken == null || userId == null){
                toast.warn("Authenticate to do this operation");
                navigate("/forgot-password");
                return;
            }

            const response = await ChangePassword(authToken, userId, formData.password);
            const data = await response.json();
            
            if (data.success) {
                setIsLoading(false);
                setIsSuccess(true);
                toast.success('Password changed successfully!');
                
                // Redirect after success
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            } else {
                setIsLoading(false);
                toast.error(data.errorMessage | 'Failed to change password. Please try again.');
            }
        } catch (error) {
            setIsLoading(false);
            toast.error('Network error: Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const isPasswordValid = passwordStrength.every(criterion => criterion.met);

    // Success screen
    if (isSuccess) {
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
                                Password changed successfully!
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full mx-auto mb-6"></div>
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
                            onClick={() => navigate("/user-login")}
                            className="flex items-center text-stone-600 hover:text-stone-800 transition-colors duration-200 group cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                            Back
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-stone-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4 leading-tight">
                            Change Password
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent rounded-full mx-auto mb-6"></div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-200/50 p-8">
                        <div className="space-y-6">
                            {/* New Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 pr-12 ${
                                            errors.password && touched.password
                                                ? 'border-red-300 bg-red-50/50'
                                                : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400'
                                        }`}
                                        placeholder="Enter your new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-600 hover:text-stone-800 transition-colors duration-200 z-10 cursor-pointer"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Password strength indicators */}
                                {formData.password && (
                                    <div className="mt-3 space-y-2">
                                        <div className="text-xs font-medium text-stone-600 mb-2">Password requirements:</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {passwordStrength.map((criterion, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                                        criterion.met ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}>
                                                        {criterion.met ? (
                                                            <Check className="w-3 h-3 text-white" />
                                                        ) : (
                                                            <X className="w-3 h-3 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <span className={`text-xs ${
                                                        criterion.met ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                        {criterion.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {errors.password && touched.password && (
                                    <p className="mt-2 text-sm text-red-600 animate-pulse">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        onBlur={() => handleBlur('confirmPassword')}
                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 pr-12 ${
                                            errors.confirmPassword && touched.confirmPassword
                                                ? 'border-red-300 bg-red-50/50'
                                                : formData.confirmPassword && formData.password === formData.confirmPassword && isPasswordValid
                                                ? 'border-green-300 bg-green-50/50'
                                                : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400'
                                        }`}
                                        placeholder="Confirm your new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-600 hover:text-stone-800 transition-colors duration-200 z-10 cursor-pointer"
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Password match indicator */}
                                {formData.confirmPassword && (
                                    <div className="mt-2 flex items-center space-x-2">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                            formData.password === formData.confirmPassword ? 'bg-green-500' : 'bg-red-500'
                                        }`}>
                                            {formData.password === formData.confirmPassword ? (
                                                <Check className="w-3 h-3 text-white" />
                                            ) : (
                                                <X className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <span className={`text-xs ${
                                            formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                        </span>
                                    </div>
                                )}

                                {errors.confirmPassword && touched.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600 animate-pulse">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div
                                onClick={handleSubmit}
                                className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 focus:outline-none cursor-pointer text-center ${
                                    isLoading || !isPasswordValid || formData.password !== formData.confirmPassword
                                        ? 'bg-stone-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Changing Password...
                                    </div>
                                ) : (
                                    'Change Password'
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <LoadingOverlay
                    isVisible={isLoading}
                    message="Chaning password"
                    submessage="Please wait while we save your new password"
                />
            )}
        </section>
    );
}