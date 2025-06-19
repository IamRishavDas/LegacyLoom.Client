import { useEffect, useState } from "react";

export default function LoadingOverlay({
  isVisible = false,
  message = "Processing...",
  submessage = "Please wait while we handle your request",
  variant = "stone", // stone, slate, blue, etc.
  size = "medium", // small, medium, large
  showSpinner = true,
  showDots = true,
  customIcon = null,
  blur = "backdrop-blur-md",
  opacity = "bg-white/20",
  onCancel = null,
  cancelText = "Cancel",
}) {
  const [dots, setDots] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = "auto";
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isVisible]);

  useEffect(() => {
    if (!showDots || !isVisible) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [showDots, isVisible]);

  if (!isVisible && !isAnimating) return null;

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-20 h-20",
    large: "w-24 h-24",
  };

  const variantClasses = {
    stone: {
      spinner: "border-stone-300/30 border-t-stone-600",
      text: "text-stone-800",
      subtext: "text-stone-600",
      accent: "from-stone-200/30 to-slate-300/20",
    },
    slate: {
      spinner: "border-slate-300/30 border-t-slate-600",
      text: "text-slate-800",
      subtext: "text-slate-600",
      accent: "from-slate-200/30 to-stone-300/20",
    },
    blue: {
      spinner: "border-blue-300/30 border-t-blue-600",
      text: "text-blue-800",
      subtext: "text-blue-600",
      accent: "from-blue-200/30 to-indigo-300/20",
    },
  };

  const currentVariant = variantClasses[variant] || variantClasses.stone;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${blur} ${opacity} ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br ${currentVariant.accent} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-br ${currentVariant.accent} rounded-full blur-3xl animate-pulse delay-1000`}
        ></div>
        <div
          className={`absolute bottom-1/3 left-1/2 w-40 h-40 bg-gradient-to-br ${currentVariant.accent} rounded-full blur-3xl animate-pulse delay-2000`}
        ></div>
      </div>

      {/* Main content */}
      <div
        className={`transform transition-all duration-500 ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-4 opacity-0"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-8 max-w-sm mx-4 text-center">
          {/* Spinner or Custom Icon */}
          <div className="flex justify-center mb-6">
            {customIcon ? (
              <div className="animate-pulse">{customIcon}</div>
            ) : showSpinner ? (
              <div
                className={`${sizeClasses[size]} border-4 ${currentVariant.spinner} rounded-full animate-spin`}
              ></div>
            ) : null}
          </div>

          {/* Main message */}
          <h3
            className={`text-xl font-serif font-semibold ${currentVariant.text} mb-2`}
          >
            {message}
            {showDots && dots}
          </h3>

          {/* Submessage */}
          {submessage && (
            <p
              className={`text-sm ${currentVariant.subtext} mb-6 leading-relaxed`}
            >
              {submessage}
            </p>
          )}

          {/* Animated progress bar */}
          <div className="w-full bg-gray-200/50 rounded-full h-1 mb-6 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-${variant}-400 to-${variant}-600 rounded-full animate-pulse`}
              style={{
                animation: "loading-progress 2s ease-in-out infinite",
              }}
            ></div>
          </div>

          {/* Cancel button if provided */}
          {onCancel && (
            <button
              onClick={onCancel}
              className={`px-4 py-2 text-sm ${currentVariant.subtext} hover:${currentVariant.text} transition-colors duration-200 border border-gray-300/50 rounded-lg hover:bg-white/50`}
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>

      <style jsx="true">{`
        @keyframes loading-progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

// Example usage component showing integration with your registration form
export function ExampleUsage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    {
      message: "Validating information",
      submessage: "Checking your details...",
    },
    { message: "Creating account", submessage: "Setting up your profile..." },
    { message: "Finalizing setup", submessage: "Almost ready..." },
  ];

  const handleSubmit = async () => {
    setIsLoading(true);
    setLoadingStep(0);

    // Simulate multi-step loading
    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    setIsLoading(false);
    setLoadingStep(0);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-200/50 p-8 max-w-md w-full">
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6 text-center">
          Test Loading Overlay
        </h2>

        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? "Processing..." : "Create Account"}
          </button>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setIsLoading(!isLoading)}
              className="py-2 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              Toggle Basic
            </button>
            <button
              onClick={handleSubmit}
              className="py-2 px-3 rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              Multi-step
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlays */}
      <LoadingOverlay
        isVisible={isLoading && loadingStep === -1}
        message="Creating Account"
        submessage="Please wait while we process your information"
        variant="stone"
        size="medium"
        onCancel={handleCancel}
        cancelText="Cancel"
      />

      <LoadingOverlay
        isVisible={isLoading && loadingStep >= 0}
        message={loadingSteps[loadingStep]?.message}
        submessage={loadingSteps[loadingStep]?.submessage}
        variant="stone"
        size="large"
        showDots={true}
      />
    </div>
  );
}
