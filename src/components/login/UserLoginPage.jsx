import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginUsingEmail, LoginUsingUsername } from '../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';
import LoadingOverlay from '../loading-overlay/LoadingOverlay';

export default function UserLoginPage() {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState('username'); // 'username' or 'email'
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

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

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        if (password.length < 6) return "Password must be at least 6 characters";
        return "";
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
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
            case 'password':
                error = validatePassword(formData.password);
                break;
        }
        
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleLoginTypeChange = (type) => {
        setLoginType(type);
        // Clear form data and errors when switching
        setFormData({ username: '', email: '', password: '' });
        setErrors({});
        setTouched({});
    };

    const saveCredentialsToLocalStorage = (data) => {
        localStorage.setItem("userId", data.id);
        localStorage.setItem("userName", data.userName);
        localStorage.setItem("email", data.email);
        localStorage.setItem("token", data.token);
    }

    const handleSubmit = async () => {
        let identifierError = '';
        let passwordError = validatePassword(formData.password);
        
        if (loginType === 'username') {
            identifierError = validateUsername(formData.username);
        } else {
            identifierError = validateEmail(formData.email);
        }
        
        const newErrors = {
            [loginType]: identifierError,
            password: passwordError
        };
        
        setErrors(newErrors);
        setTouched({ [loginType]: true, password: true });
        
        if (identifierError || passwordError) {
            return;
        }
        
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            const response = loginType === 'username' ? await LoginUsingUsername(formData.username, formData.password)
                : await LoginUsingEmail(formData.email, formData.password);
            const data = await response.json();

            if (data.success) {
                setIsLoading(false);
                toast.success("Login successfull");
                saveCredentialsToLocalStorage(data.data);
                navigate("/dashboard");
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

    return (
        <section ref={formRef} className="h-screen pt-0 pb-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/30 to-slate-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/20 to-slate-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-stone-200/25 to-slate-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="max-w-md w-full relative">
                <div className={`transition-all duration-1200 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4 leading-tight">
                            Welcome Back
                            <span className="block text-stone-600 mt-2 bg-gradient-to-r from-stone-600 via-stone-700 to-slate-600 bg-clip-text">
                                to Legacy Loom
                            </span>
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent rounded-full mx-auto mb-6"></div>
                        <p className="text-lg text-stone-600 font-light">
                            Continue your storytelling journey
                        </p>
                    </div>

                    {/* Login Type Selector */}
                    <div className="mb-8">
                        <div className="flex bg-stone-100/80 rounded-xl p-1 backdrop-blur-sm border border-stone-200/50">
                            <button
                                onClick={() => handleLoginTypeChange('username')}
                                style={{cursor: "pointer"}}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    loginType === 'username'
                                        ? 'bg-white text-stone-800 shadow-lg'
                                        : 'text-stone-600 hover:text-stone-800'
                                }`}
                            >
                                Username
                            </button>
                            <button
                                onClick={() => handleLoginTypeChange('email')}
                                style={{cursor: "pointer"}}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    loginType === 'email'
                                        ? 'bg-white text-stone-800 shadow-lg'
                                        : 'text-stone-600 hover:text-stone-800'
                                }`}
                            >
                                Email
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-200/50 p-8">
                        <div className="space-y-6">
                            
                            {/* Username/Email Field */}
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium text-stone-700 mb-2">
                                    {loginType === 'username' ? 'Username' : 'Email Address'}
                                </label>
                                <input
                                    id="identifier"
                                    type={loginType === 'username' ? 'text' : 'email'}
                                    value={loginType === 'username' ? formData.username : formData.email}
                                    onChange={(e) => handleInputChange(loginType, e.target.value)}
                                    onBlur={() => handleBlur(loginType)}
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 ${
                                        errors[loginType] && touched[loginType]
                                            ? 'border-red-300 bg-red-50/50'
                                            : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400'
                                    }`}
                                    placeholder={`Enter your ${loginType}`}
                                />
                                {errors[loginType] && touched[loginType] && (
                                    <p className="mt-2 text-sm text-red-600 animate-pulse">{errors[loginType]}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 ${
                                        errors.password && touched.password
                                            ? 'border-red-300 bg-red-50/50'
                                            : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400'
                                    }`}
                                    placeholder="Enter your password"
                                />
                                {errors.password && touched.password && (
                                    <p className="mt-2 text-sm text-red-600 animate-pulse">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot Password Link */}
                            {/* <div className="text-right">
                                <button className="text-sm text-stone-600 hover:text-stone-800 font-medium transition-colors duration-200">
                                    Forgot password?
                                </button>
                            </div> */}

                            {/* Submit Button */}
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
                                        Signing In...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-stone-500">
                                Don't have an account?{' '}
                                <Link to={"/register"}>
                                  <button className="text-stone-600 hover:text-stone-800 font-medium transition-colors duration-200 cursor-pointer">
                                      Create one here
                                  </button>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <LoadingOverlay
                    isVisible={isLoading}
                    message="Verifying"
                    submessage="Please wait while we verify your credentials"
                    variant="slate"
                    size="medium"
                    showDots={true}
                  />
        </section>
    );
}