import { useState, useEffect, useRef } from "react";
import { LogOut, X, AlertTriangle } from "lucide-react";
import SnowflakeAnimation, {
  SnowflakePresets,
} from "../animations/SnowflakeAnimation";

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the first focusable element when modal opens
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        firstFocusableRef.current = focusableElements[0];
        lastFocusableRef.current =
          focusableElements[focusableElements.length - 1];
        firstFocusableRef.current.focus();
      }
    }
  }, [isOpen]);

  const handleTabKey = (event) => {
    if (event.key === "Tab") {
      if (event.shiftKey) {
        // Shift + Tab (backwards)
        if (document.activeElement === firstFocusableRef.current) {
          event.preventDefault();
          lastFocusableRef.current.focus();
        }
      } else {
        // Tab (forwards)
        if (document.activeElement === lastFocusableRef.current) {
          event.preventDefault();
          firstFocusableRef.current.focus();
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onKeyDown={handleTabKey}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <SnowflakeAnimation {...SnowflakePresets.dense} zIndex={10} />

      {/* Blurred Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-stone-200/50 max-w-md w-full mx-4 transform transition-all duration-300 ${
          isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-stone-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg">
                <LogOut className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-800 text-center mb-2">
            Leave Your Stories Behind?
          </h2>

          <p className="text-stone-600 text-center leading-relaxed">
            Your memories and stories are waiting to be preserved. Are you sure
            you want to step away from your legacy for now?
          </p>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6">
          <div className="bg-stone-50/80 rounded-xl p-4 mb-6 border border-stone-200/50">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-stone-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-stone-600">
                Don't worry - your stories will be safely preserved and waiting
                for your return. Every word, every memory, every moment you've
                captured will remain exactly as you left it.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white hover:bg-stone-50 border-2 border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 rounded-xl transition-all duration-200 font-medium text-center cursor-pointer"
            >
              Continue Writing
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 text-white rounded-xl transition-all duration-200 font-medium text-center shadow-lg transform hover:scale-[1.02] cursor-pointer"
            >
              Yes, Logout
            </button>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-stone-300/30 to-transparent rounded-full"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br from-stone-300/20 to-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;
