import { Snowflake } from 'lucide-react';
import { Link } from 'react-router-dom';


function HomeNav() {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-stone-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-center h-16">
            <Link to={"/"}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-stone-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Snowflake className="w-5 h-5 text-stone-100" />
                </div>
                <span className="text-[19px] font-serif font-bold text-stone-800 tracking-wide">
                  Legacy Loom 
                </span>
              </div>
            </Link>
            

            <div className="flex items-center space-x-4">

              <Link to={"/user-login"}>
                <button className="text-stone-600 hover:text-stone-800 font-medium transition-all duration-300 px-4 py-2 rounded-full hover:bg-stone-100 cursor-pointer">
                  Login
                </button>
              </Link>

              <Link to={"/register"}>
                <button className="bg-gradient-to-r from-stone-700 to-slate-800 text-stone-50 px-6 py-2 rounded-full hover:from-stone-800 hover:to-slate-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium cursor-pointer">
                  Register
                </button>
              </Link>

            </div>
          </div>

        </div>
    </nav>
  )
}

export default HomeNav
