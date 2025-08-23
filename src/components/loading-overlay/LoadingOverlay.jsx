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
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    if (!isVisible || !showSpinner) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1; // Increment by 1% every 40ms for a 4s cycle
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isVisible, showSpinner]);

  if (!isVisible && !isAnimating) return null;

  const sizeClasses = {
    small: {
      barWidth: "w-48",
      barHeight: "h-2",
      container: "w-48",
    },
    medium: {
      barWidth: "w-64",
      barHeight: "h-3",
      container: "w-64",
    },
    large: {
      barWidth: "w-80",
      barHeight: "h-4",
      container: "w-80",
    },
  };

  const variantClasses = {
    blue: {
      background: "bg-white/80",
      bar: "bg-gradient-to-r from-blue-400 to-blue-600",
      track: "bg-gray-200",
      text: "text-gray-800",
      subtext: "text-gray-600",
      glow: "shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    },
    gray: {
      background: "bg-white/80",
      bar: "bg-gradient-to-r from-gray-500 to-gray-700",
      track: "bg-gray-200",
      text: "text-gray-800",
      subtext: "text-gray-600",
      glow: "shadow-[0_0_8px_rgba(75,85,99,0.5)]",
    },
    dark: {
      background: "bg-black/50",
      bar: "bg-gradient-to-r from-gray-200 to-white",
      track: "bg-gray-600",
      text: "text-white",
      subtext: "text-gray-200",
      glow: "shadow-[0_0_8px_rgba(255,255,255,0.5)]",
    },
  };

  const currentVariant = variantClasses[variant] || variantClasses.blue;
  const currentSize = sizeClasses[size] || sizeClasses.medium;

  const ProgressBar = () => (
    <div className={`relative ${currentSize.container}`}>
      <div
        className={`absolute top-0 left-0 ${currentSize.barHeight} ${currentVariant.track} rounded-full w-full`}
      />
      <div
        className={`absolute top-0 left-0 ${currentSize.barHeight} ${currentVariant.bar} ${currentVariant.glow} rounded-full transition-all duration-[4000ms] ease-[cubic-bezier(0.4,0,0.2,1)]`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${currentVariant.background} ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`transform transition-all duration-500 text-center ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-4 opacity-0"
        }`}
      >
        <div className="flex justify-center mb-4">
          {customIcon ? (
            <div className="animate-pulse">{customIcon}</div>
          ) : showSpinner ? (
            <ProgressBar />
          ) : null}
        </div>

        <div className={`text-lg font-medium ${currentVariant.text} mb-1`}>
          {message}
          {showDots && dots}
        </div>

        {submessage && (
          <div className={`text-sm ${currentVariant.subtext} mb-6`}>
            {submessage}
          </div>
        )}

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