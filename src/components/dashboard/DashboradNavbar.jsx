import { useState } from 'react';
import { Home, Users, Plus, LogOut, Menu, X, Snowflake } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import LogoutConfirmationModal from '../modals/LogoutConfirmationModal';

export default function DashboardNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();
    
    // Generate a random profile picture using random avatar services
    const avatarServices = [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    ];
    
    const profileImage = avatarServices[0];

    const navItems = [
        { icon: Users, label: 'Home', active: false, link: '/dashboard' },
        { icon: Home, label: 'My Timelines', active: false, link: '/my-timelines' },
        { icon: Plus, label: 'Create', active: false, link: '/timeline-editor' }
    ];

    const logout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <>
            <nav className="bg-white/90 backdrop-blur-sm border-b border-stone-200/50 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <Link to={"/"}>
                            <div className="w-10 h-10 bg-gradient-to-br from-stone-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                                <Snowflake className="w-5 h-5 text-stone-100" />
                            </div>
                        </Link>
                        <span className="text-xl font-serif font-semibold text-stone-800">Legacy Loom</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item, index) => (
                            <Link key={index} to={`${item.link}`}>
                                <button
                                    key={index}
                                    style={{cursor: "pointer"}}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                        item.active 
                                            ? 'bg-stone-100 text-stone-800 shadow-sm' 
                                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </Link>
                        ))}
                    </div>

                    {/* Profile and Logout */}
                    <div className="hidden md:flex items-center space-x-3">
                        <Link to={"/not-authorized"}>
                            <img 
                                src={profileImage}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 border-2 border-white"
                            />
                        </Link>
                        <button className="flex items-center space-x-2 px-3 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-50 rounded-lg transition-all duration-200 cursor-pointer"
                                onClick={() =>  setShowLogoutModal(true)}>
                            <LogOut size={18} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors duration-200"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-stone-200/50 bg-white/95 backdrop-blur-sm">
                        <div className="flex flex-col space-y-2">
                            
                            {/* Profile section */}
                            <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                                <img 
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white"
                                />
                                <span className="text-stone-700 font-medium">Welcome back!</span>
                            </div>
                            
                            {/* Navigation items */}
                            {navItems.map((item, index) => (
                                <button
                                    key={index}
                                    className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                                        item.active 
                                            ? 'bg-stone-100 text-stone-800' 
                                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                                    }`}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                            
                            {/* Logout */}
                            <button className="flex items-center space-x-3 px-4 py-3 mx-2 text-stone-600 hover:text-stone-800 hover:bg-stone-50 rounded-lg transition-all duration-200"
                                    onClick={() => setShowLogoutModal(true)}>
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
        <main>
            <Outlet/>
        </main>
        <LogoutConfirmationModal 
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={() => {
                setShowLogoutModal(false);
                logout();
            }}/>
        </>
    );
}