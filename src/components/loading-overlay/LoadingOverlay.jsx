import { useEffect, useState } from "react";

export default function LoadingOverlay({
  isVisible = false,
  message = "Loading...",
  submessage = null,
  variant = "blue", // blue, gray, dark
  size = "medium", // small, medium, large
  showSpinner = true,
  showDots = true,
  customIcon = null,
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
    small: "w-12 h-12 border-2",
    medium: "w-16 h-16 border-3",
    large: "w-20 h-20 border-4",
  };

  const variantClasses = {
    blue: {
      background: "bg-white/80",
      spinner: "border-gray-300 border-t-blue-500",
      text: "text-gray-800",
      subtext: "text-gray-600",
    },
    gray: {
      background: "bg-white/80",
      spinner: "border-gray-300 border-t-gray-600",
      text: "text-gray-800",
      subtext: "text-gray-600",
    },
    dark: {
      background: "bg-black/50",
      spinner: "border-gray-600 border-t-white",
      text: "text-white",
      subtext: "text-gray-200",
    },
  };

  const currentVariant = variantClasses[variant] || variantClasses.blue;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${currentVariant.background} ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Main content - no box, just centered content */}
      <div
        className={`transform transition-all duration-500 text-center ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-4 opacity-0"
        }`}
      >
        {/* Spinner or Custom Icon */}
        <div className="flex justify-center mb-4">
          {customIcon ? (
            <div className="animate-pulse">{customIcon}</div>
          ) : showSpinner ? (
            <div
              className={`${sizeClasses[size]} ${currentVariant.spinner} rounded-full animate-spin`}
            ></div>
          ) : null}
        </div>

        {/* Main message */}
        <div className={`text-lg font-medium ${currentVariant.text} mb-1`}>
          {message}
          {showDots && dots}
        </div>

        {/* Submessage */}
        {submessage && (
          <div className={`text-sm ${currentVariant.subtext} mb-6`}>
            {submessage}
          </div>
        )}

        {/* Cancel button if provided */}
        {onCancel && (
          <button
            onClick={onCancel}
            className={`mt-4 px-6 py-2 text-sm ${currentVariant.text} hover:opacity-80 transition-opacity duration-200 border border-gray-400 rounded-md bg-white/20 hover:bg-white/30`}
          >
            {cancelText}
          </button>
        )}
      </div>
    </div>
  );
}

