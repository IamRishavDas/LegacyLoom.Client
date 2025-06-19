import { useEffect, useRef, useState } from "react";
import { Register } from "../../apis/apicalls/apicalls";
import { Link, useNavigate } from "react-router-dom";
import LoadingOverlay from "../loading-overlay/LoadingOverlay";
import { toast } from "react-toastify";
import HomeNav from "../home/HomeNav";

export default function RegisterPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    // Prevent body scrolling
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  const validateUsername = (username) => {
    if (!username) return "Username is required";
    if (username.length < 4) return "Username must be at least 4 characters";
    if (username.length > 50) return "Username must not exceed 50 characters";
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
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 15) return "Password must not exceed 15 characters";

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) return "Password must include an uppercase letter";
    if (!hasNumber) return "Password must include a number";
    if (!hasSpecialChar) return "Password must include a special character";

    return "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let error = "";
    switch (field) {
      case "username":
        error = validateUsername(formData.username);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
      case "password":
        error = validatePassword(formData.password);
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async () => {
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const newErrors = {
      username: usernameError,
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);
    setTouched({ username: true, email: true, password: true });

    if (usernameError || emailError || passwordError) {
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await Register(formData.username, formData.email, formData.password);
      const data = await response.json();

      if (data.success) {
        setIsLoading(false);
        toast.success(
          data.successMessage == null ? "User registerd successfully" : data.successMessage + "Redirecting to login page");
        navigate("/user-login");
      } else {
        setIsLoading(false);
        toast.error(data.errorMessage);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Network Error try again later If not resolved try contact admins");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={formRef}
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative bg-stone-100"
    >
      <HomeNav/>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/30 to-slate-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/20 to-slate-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-stone-200/25 to-slate-300/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-md w-full relative">
        <div
          className={`transition-all duration-1200 ease-out transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="text-center pt-12 mb-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4 leading-tight">
              Welcome to
              <span className="block text-stone-600 mt-2 bg-gradient-to-r from-stone-600 via-stone-700 to-slate-600 bg-clip-text">
                Legacy Loom
              </span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-lg text-stone-600 font-light">
              Begin your journey of gentle storytelling
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-200/50 p-8">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  onBlur={() => handleBlur("username")}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 ${
                    errors.username && touched.username
                      ? "border-red-300 bg-red-50/50"
                      : "border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400"
                  }`}
                  placeholder="Enter your username"
                />
                {errors.username && touched.username && (
                  <p className="mt-2 text-sm text-red-600 animate-pulse">
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 ${
                    errors.email && touched.email
                      ? "border-red-300 bg-red-50/50"
                      : "border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && touched.email && (
                  <p className="mt-2 text-sm text-red-600 animate-pulse">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  onBlur={() => handleBlur("password")}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-stone-400/50 ${
                    errors.password && touched.password
                      ? "border-red-300 bg-red-50/50"
                      : "border-stone-200 bg-stone-50/50 hover:border-stone-300 focus:border-stone-400"
                  }`}
                  placeholder="Create a secure password"
                />
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-600 animate-pulse">
                    {errors.password}
                  </p>
                )}
                <p className="mt-2 text-xs text-stone-500">
                  Must be 8-15 characters with uppercase, number, and special
                  character
                </p>
              </div>

              <div
                onClick={handleSubmit}
                className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 focus:outline-none cursor-pointer text-center ${
                  isLoading
                    ? "bg-stone-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-stone-500">
                Already have an account?{" "}
                <Link to={"/user-login"}>
                  <button className="text-stone-600 hover:text-stone-800 font-medium transition-colors duration-200 cursor-pointer">
                    Sign in here
                  </button>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay
        isVisible={isLoading}
        message="Creating Account"
        submessage="Please wait while we set up your Legacy Loom profile"
        variant="slate"
        size="medium"
        showDots={true}
      />
    </section>
  );
}
