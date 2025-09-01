import { useState, useEffect } from 'react';
import { X, Phone, User, Server } from 'lucide-react';

export default function BackendNoticeModal({ isOpen }) {
    const [isVisible, setIsVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Show modal after a delay
            const modalTimer = setTimeout(() => {
                setShowModal(true);
            }, 1000);

            // Animate in
            const visibilityTimer = setTimeout(() => {
                setIsVisible(true);
            }, 1600);

            return () => {
                clearTimeout(modalTimer);
                clearTimeout(visibilityTimer);
            };
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setShowModal(false);
        }, 300);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={handleClose}
            />
            
            {/* Modal */}
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transition-all duration-500 ease-out transform ${
                isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
            }`}>
                
                {/* Decorative top border */}
                <div className="h-2 bg-gradient-to-r from-stone-400 via-stone-500 to-slate-500"></div>
                
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group z-10 cursor-pointer"
                >
                    <X className="w-4 h-4 text-stone-600 group-hover:text-stone-800 transition-colors" />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-stone-100 to-slate-100 rounded-full">
                            <Server className="w-8 h-8 text-stone-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-serif font-bold text-stone-800 text-center mb-4">
                        Backend Service Notice
                    </h2>

                    {/* Message */}
                    <div className="text-stone-600 leading-relaxed mb-8 space-y-3">
                        <p className="text-center">
                            Our backend services are currently paused to manage hosting costs on Azure App Services.
                        </p>
                        <p className="text-center">
                            If you need immediate access or encounter any issues, please don't hesitate to reach out.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gradient-to-br from-stone-50 to-slate-50 rounded-xl p-6 border border-stone-200/50">
                        <div className="text-center space-y-3">
                            <div className="flex items-center justify-center space-x-2 text-stone-700">
                                <User className="w-4 h-4" />
                                <span className="font-medium">Rishav Das</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-stone-600">
                                <Phone className="w-4 h-4" />
                                <a 
                                    href="tel:7044457380" 
                                    className="font-mono text-lg hover:text-stone-800 transition-colors duration-200 underline decoration-stone-300 hover:decoration-stone-500"
                                >
                                    7044457380
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Footer message */}
                    <p className="text-sm text-stone-500 text-center mt-6 italic">
                        Thank you for your understanding and patience.
                    </p>
                </div>

                {/* Decorative bottom elements */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
            </div>
        </div>
    );
}