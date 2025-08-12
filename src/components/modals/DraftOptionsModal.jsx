import { useState, useEffect, useRef } from "react";
import { Edit2, Trash2, X } from "lucide-react";
import SnowflakeAnimation, {
  SnowflakePresets,
} from "../animations/SnowflakeAnimation";

const DraftOptionsModal = ({ isOpen, onClose, onDelete, onEdit, draftTitle = "this draft" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the first focusable element when modal opens
      const focusableElements = modalRef.current.querySelectorAll(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
          <h2 className="text-2xl font-serif font-bold text-stone-800 text-center mb-2">
            Draft Options
          </h2>
          <p className="text-stone-600 text-center leading-relaxed">
            Choose an action for "{draftTitle}".
          </p>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-3">
            <button
              onClick={onEdit}
              className="flex items-center space-x-3 px-4 py-3 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 rounded-xl transition-all duration-200 font-medium cursor-pointer"
            >
              <Edit2 size={20} className="text-stone-600" />
              <span>Edit Draft</span>
            </button>

            <button
              onClick={onDelete}
              className="flex items-center space-x-3 px-4 py-3 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 rounded-xl transition-all duration-200 font-medium cursor-pointer"
            >
              <Trash2 size={20} className="text-red-600" />
              <span>Delete Draft</span>
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

export default DraftOptionsModal;