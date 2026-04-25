import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const { userInfo } = useSelector((state) => state.auth);

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Attendance", path: "/attendance", icon: "⏱️" },
    { name: "Reports", path: "/reports", icon: "📊" },
    { name: "Overtime", path: "/overtime", icon: "⚡" },
  ];

  if (userInfo?.role === "manager") menu.push({ name: "Team", path: "/team", icon: "👥" });
  if (userInfo?.role === "admin") menu.push({ name: "Users", path: "/users", icon: "🛡️" });

  return (
    <div className="w-72 h-screen bg-white border-r border-slate-100 p-6 hidden md:flex flex-col relative">
      
      {/* 🚀 PREMIUM BRANDING */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-11 h-11 bg-gradient-to-tr from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 transform -rotate-3">
          <span className="text-xl text-white">🚀</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tighter leading-none">
            DTable
          </h2>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Workspace</span>
        </div>
      </div>

      {/* 📂 NAVIGATION SECTION */}
      <div className="flex-1 space-y-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 px-4">
            Main Menu
          </p>
          
          <nav className="space-y-1">
            {menu.map((item, i) => (
              <NavLink
                key={i}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active Bar Indicator */}
                    {isActive && (
                      <div className="absolute left-0 w-1.5 h-6 bg-emerald-500 rounded-r-full" />
                    )}
                    
                    <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    
                    <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {item.name}
                    </span>

                    {isActive && (
                      <div className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* 👤 NEXT-LEVEL USER PROFILE CARD */}
      {/* <div className="mt-auto relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative bg-white border border-slate-100 rounded-[2rem] p-5 shadow-2xl shadow-emerald-100/50">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-50 to-white p-1 mb-3 shadow-sm border border-emerald-100">
              <div className="w-full h-full rounded-[1.2rem] bg-emerald-500 flex items-center justify-center text-white text-xl font-black shadow-inner">
                {userInfo?.name?.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-black text-slate-800 leading-tight">
                {userInfo?.name}
              </p>
              <span className="inline-block mt-1 px-3 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-tighter">
                {userInfo?.role}
              </span >
            </div>

            <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200">
              Account Settings
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}