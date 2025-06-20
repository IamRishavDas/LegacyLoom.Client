import DashboardNavbar from './DashboradNavbar';
import StoryCard from './StoryCard';

export default function DashboardHome() {
    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 relative overflow-hidden">
            
            {/* Subtle background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-stone-200/20 to-slate-300/15 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-stone-300/15 to-slate-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <StoryCard/>

        </div>
        </>
    );
}