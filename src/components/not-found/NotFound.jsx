import { useState, useEffect } from 'react';
import { Snowflake, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import SnowflakeAnimation, { SnowflakePresets } from '../animations/SnowflakeAnimation';

function NotFound() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 flex items-center justify-center relative overflow-hidden">
      
      <SnowflakeAnimation 
        {...SnowflakePresets.prominent}
        zIndex={0}
      />

      {/* Main Content */}
      <div className={`text-center px-4 transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-stone-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <Snowflake className="w-12 h-12 text-stone-100 animate-spin" style={{animationDuration: '8s'}} />
          </div>
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-serif font-bold text-transparent bg-gradient-to-r from-stone-600 to-slate-700 bg-clip-text mb-4 animate-pulse">
            404
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-stone-600 to-slate-700 mx-auto rounded-full opacity-60"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8 space-y-3">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-stone-800 mb-2">
            Page Lost in the Legacy
          </h2>
          <p className="text-lg text-stone-600 max-w-md mx-auto leading-relaxed">
            The page you're looking for seems to have vanished like threads in time. 
            Let's weave you back to familiar ground.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link to="/">
            <button 
              className="group bg-gradient-to-r from-stone-700 to-slate-800 text-stone-50 px-8 py-3 rounded-full hover:from-stone-800 hover:to-slate-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2 cursor-pointer"
            >
              <Home size={18} className="group-hover:animate-bounce" />
              <span>Return Home</span>
            </button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="group text-stone-600 hover:text-stone-800 font-medium transition-all duration-300 px-6 py-3 rounded-full hover:bg-stone-100 flex items-center space-x-2 border border-stone-200 hover:border-stone-300 cursor-pointer"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
          <div className="w-32 h-32 bg-gradient-to-br from-stone-400 to-slate-500 rounded-full blur-3xl animate-ping" style={{animationDuration: '4s'}}></div>
        </div>
        
        <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 opacity-10">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-400 to-stone-500 rounded-full blur-2xl animate-pulse" style={{animationDuration: '3s'}}></div>
        </div>
      </div>

      {/* Custom CSS Animation */}
      <style jsx="true">{`
        @keyframes snowfall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default NotFound;