import { useState, useEffect } from 'react';
import { Home, Plus, LogOut, Menu, X, Snowflake, Globe } from 'lucide-react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import LogoutConfirmationModal from '../modals/LogoutConfirmationModal';
import { useDispatch } from 'react-redux';
import { resetPublicFeed, resetStoryCardState, resetTimelines } from '../../store/storyCardSlice';
import { Logout } from '../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';

export default function DashboardNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const profileImage = '/DemoProfileImage/Profile.jpg';

    const navItems = [
        { icon: Globe, label: 'Stories', active: location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/'), link: '/dashboard' },
        { icon: Home, label: 'My Timelines', active: location.pathname === '/my-timelines' || location.pathname.startsWith('/my-timelines/'), link: '/my-timelines' },
        { icon: Plus, label: 'Post', active: location.pathname === '/timeline-editor' || location.pathname.startsWith('/timeline-editor/'), link: '/timeline-editor' }
    ];

    const logout = async () => {
        try {
            const response = await Logout();
            const data = await response.json();

            if (data.success) {
                localStorage.removeItem("userId");
                localStorage.removeItem("userName");
                localStorage.removeItem("email");
                localStorage.removeItem("token");
        
                dispatch(resetStoryCardState());
                dispatch(resetPublicFeed());
                dispatch(resetTimelines());
        
                navigate("/");
                toast.success("Logout successfully");
                return;
            }
        } catch (error) {
            toast.success("Logout successfully");
        } finally {
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            localStorage.removeItem("email");
            localStorage.removeItem("token");
    
            dispatch(resetStoryCardState());
            dispatch(resetPublicFeed());
            dispatch(resetTimelines());
    
            navigate("/");
        }
    }

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:block bg-white/90 backdrop-blur-sm border-b border-stone-200/50 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-stone-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                                <Snowflake className="w-5 h-5 text-stone-100" />
                            </div>
                            <span className="text-xl font-serif font-semibold text-stone-800">Legacy Loom</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="flex items-center space-x-1">
                            {navItems.map((item, index) => (
                                <Link key={index} to={item.link}>
                                    <button
                                        style={{ cursor: "pointer" }}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                            item.active 
                                                ? 'bg-blue-100 text-blue-800 shadow-sm' 
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
                        <div className="flex items-center space-x-3">
                            <img 
                                src={profileImage}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 border-2 border-white"
                            />
                            <button 
                                className="flex items-center space-x-2 px-3 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-50 rounded-lg transition-all duration-200 cursor-pointer"
                                onClick={() => setShowLogoutModal(true)}
                            >
                                <LogOut size={18} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="md:hidden bg-white/90 backdrop-blur-sm border-b border-stone-200/50 sticky top-0 z-50 shadow-sm">
                <div className="px-4">
                    <div className="flex items-center justify-between h-16 relative">
                        
                        {/* Mobile Navigation Buttons */}
                        <div className="flex items-center space-x-4 flex-1">
                            {navItems.map((item, index) => (
                                <Link key={index} to={item.link} className="flex-1">
                                    <button
                                        className={`flex flex-col items-center justify-center w-full py-2 rounded-lg transition-all duration-200 ${
                                            item.active 
                                                ? 'bg-blue-100 text-blue-800 shadow-sm' 
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                                        }`}
                                    >
                                        <item.icon size={20} />
                                        {/* <span className="text-xs font-medium mt-1">{item.label}</span> */}
                                    </button>
                                </Link>
                            ))}
                        </div>

                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors duration-200 ml-4"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {/* Mobile Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-50">
                                
                                {/* Profile section */}
                                <div className="flex items-center space-x-3 px-4 py-3 border-b border-stone-200">
                                    <img 
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full object-cover shadow-sm border-2 border-white"
                                    />
                                    <span className="text-stone-700 font-medium text-sm">Welcome back!</span>
                                </div>
                                
                                {/* Logout */}
                                <button 
                                    className="flex items-center space-x-3 px-4 py-3 w-full text-left text-stone-600 hover:text-stone-800 hover:bg-stone-50 transition-all duration-200"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setShowLogoutModal(true);
                                    }}
                                >
                                    <LogOut size={18} />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                <Outlet/>
            </main>
            <LogoutConfirmationModal 
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={async () => {
                    await logout();
                    setShowLogoutModal(false);
                }}
            />
        </>
    );
}