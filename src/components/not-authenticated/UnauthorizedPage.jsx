import { useState, useEffect } from "react";
import { Lock, ArrowLeft, Key, FileText, Shield } from 'lucide-react';
import { Link } from "react-router-dom";
import SnowflakeAnimation, { SnowflakePresets } from "../animations/SnowflakeAnimation";

const UnauthorizedPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  const inspirationalQuotes = [
    "Every story deserves to be protected and preserved with care.",
    "Your memories are precious - they require the right key to unlock.",
    "Great stories are worth waiting for, worth protecting.",
    "The most beautiful narratives are often behind closed doors."
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
    }, 4000);
    return () => clearInterval(quoteTimer);
  }, []);

  const handleLogin = () => {
    // This would redirect to login page in a real application
    console.log("Redirect to login page");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 relative overflow-hidden flex items-center justify-center">
      
      <SnowflakeAnimation 
        {...SnowflakePresets.prominent}
        zIndex={20}
      />

      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/20 to-slate-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/15 to-slate-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-amber-200/10 to-orange-300/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-20 bg-gradient-to-b from-stone-300/30 to-transparent rotate-12 animate-pulse delay-700"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
          <div className="w-1 h-16 bg-gradient-to-b from-stone-300/30 to-transparent -rotate-12 animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Content */}
        <div className={`text-center transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          
          {/* Icon and Lock */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-stone-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3">
                <FileText className="w-8 h-8 text-stone-100" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Brand */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-3">
              Legacy Loom
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-stone-400 to-slate-400 mx-auto rounded-full"></div>
          </div>

          {/* Main Message */}
          <div className={`mb-8 transition-all duration-1000 ease-out delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-stone-200/50">
              <div className="flex items-center justify-center mb-6">
                <Shield className="w-16 h-16 text-stone-600" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 mb-4">
                Access Required
              </h2>
              
              <p className="text-lg text-stone-600 leading-relaxed mb-6">
                This story sanctuary is protected. You'll need the proper credentials to enter this sacred space where memories are woven into lasting legacies.
              </p>

              {/* Rotating Quote */}
              <div className="min-h-[60px] flex items-center justify-center mb-8">
                <blockquote className="text-stone-500 italic text-center max-w-md transition-all duration-500 ease-in-out">
                  "{inspirationalQuotes[currentQuote]}"
                </blockquote>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to={"/user-login"}>
                    <button
                    onClick={handleLogin}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-stone-600 to-slate-600 hover:from-stone-700 hover:to-slate-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105 cursor-pointer"
                    >
                    <Key size={20} />
                    <span>Authorize yourself</span>
                    </button>
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center space-x-3 px-6 py-3 bg-white hover:bg-stone-50 border-2 border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 rounded-xl transition-all duration-200 font-medium cursor-pointer"
                >
                  <ArrowLeft size={20} />
                  <span>Return to Previous Page</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default UnauthorizedPage;