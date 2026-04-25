import { useDispatch, useSelector } from "react-redux";
import { logout } from "../app/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-green-50 px-4 md:px-8 py-3 flex justify-between items-center shadow-sm">
      
      {/* 🟢 LEFT: LOGO */}
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="bg-green-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
          <span className="text-xl">🚀</span>
        </div>
        <h1 className="text-xl font-black bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent tracking-tight">
          DTable
        </h1>
      </div>

      {/* 🟢 RIGHT: USER ACTIONS */}
      <div className="relative flex items-center gap-3 md:gap-5">
        
        {/* ROLE BADGE - Hidden on very small screens */}
        <span className="hidden sm:inline-block text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-widest border border-green-200">
          {userInfo?.role || "Employee"}
        </span>

        {/* USER INFO (Desktop Only) */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-slate-800 font-bold text-sm leading-tight">
            {userInfo?.name}
          </span>
          <span className="text-slate-400 text-[11px] font-medium">
            Online
          </span>
        </div>

        {/* AVATAR WRAPPER */}
        <div 
          onClick={() => setOpen(!open)}
          className="relative cursor-pointer group"
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 p-[2px] shadow-lg shadow-green-100 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <span className="text-green-600 font-black text-lg">
                {userInfo?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          {/* Status Indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        {/* 🟢 NEXT-LEVEL DROPDOWN */}
        {open && (
          <>
            {/* Overlay to close dropdown on click outside */}
            <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)}></div>
            
            <div className="absolute right-0 top-14 w-64 bg-white rounded-3xl shadow-2xl shadow-green-200/50 border border-green-50 p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
              
              {/* User Identity */}
              <div className="flex items-center gap-3 p-2 mb-3 bg-green-50/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold">
                   {userInfo?.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{userInfo?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{userInfo?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-slate-50 p-3 rounded-xl transition-colors">
                  <span>👤</span> Profile Settings
                </button>
                <button className="w-full flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-slate-50 p-3 rounded-xl transition-colors">
                  <span>📊</span> My Stats
                </button>
                
                <div className="h-[1px] bg-slate-100 my-2 mx-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors"
                >
                  <span>Logout</span> 
                  <span className="ml-auto">→</span>
                </button>
              </div>

            </div>
          </>
        )}

      </div>
    </nav>
  );
}