import { useEffect, useRef, useState } from 'react';

export default function HomeContent() {
    const heroRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
        setIsVisible(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section ref={heroRef} className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex">

            {/* Background Image with Cut Paper Effect */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div 
                    className="absolute top-16 right-0 w-96 h-80 opacity-100 transform rotate-12"
                    style={{
                        backgroundImage: 'url(/homeImages/1.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        clipPath: 'polygon(15% 0%, 85% 5%, 90% 80%, 10% 95%, 5% 25%)',
                        filter: 'sepia(25%) saturate(85%) brightness(1) contrast(1)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    }}
                />
                <div 
                    className="absolute bottom-32 left-12 w-80 h-64 opacity-100 transform -rotate-8"
                    style={{
                        backgroundImage: 'url(/homeImages/2.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        clipPath: 'polygon(8% 10%, 88% 0%, 95% 75%, 12% 90%, 0% 30%)',
                        filter: 'sepia(30%) saturate(75%) brightness(1) contrast(1)',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.08)',
                    }}
                />
                <div 
                    className="absolute bottom-0 left-1/2 w-72 h-60 opacity-100 transform rotate-19 -translate-x-1/2"
                    style={{
                        backgroundImage: 'url(/homeImages/3.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center bottom',
                        clipPath: 'polygon(18% 5%, 82% 8%, 88% 85%, 15% 92%, 10% 28%)',
                        filter: 'sepia(35%) saturate(70%) brightness(1.2) contrast(0.94)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                    }}
                />
            </div>

            {/* Original gradient blobs */}
            <div className="absolute inset-0 pointer-events-none z-1">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/20 to-slate-300/15 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/15 to-slate-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-stone-200/18 to-slate-300/12 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center">

                    <div className={`transition-all duration-1200 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce delay-3000"></div>

                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-800 mb-8 leading-tight relative">
                            Your Stories,
                            <span className="block text-stone-600 mt-2 bg-gradient-to-r from-stone-600 via-stone-700 to-slate-600 bg-clip-text animate-pulse">
                            Gently Woven
                            </span>
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-stone-300 to-transparent rounded-full"></div>
                        </h1>

                        <p className="text-xl md:text-2xl text-stone-600 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
                            Legacy Loom is more than an application it's a quiet sanctuary for stories, where every whispered memory, 
                            gentle dream, and heartfelt aspiration finds a home that endures with grace.
                        </p>
                    </div>

                </div>
            </div>

        </section>
    )
}