import { useSelector } from "react-redux";
import { useGetDashboardQuery } from "../api/dashboardApi";
import { usePunchInMutation, usePunchOutMutation } from "../api/attendanceApi";

export default function Dashboard() {
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetDashboardQuery(userInfo?.role, { skip: !userInfo });
  const summary = data?.summary || {};

  const [punchIn, { isLoading: punchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: punchingOut }] = usePunchOutMutation();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-green-50 to-white text-slate-800">
      
      {/* 🌟 TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-green-100">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Good Morning, {userInfo?.name || "User"}!
          </h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <span>📅</span> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {/* PunchIn Logic */}}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-green-200 transition-all hover:-translate-y-1 active:scale-95"
          >
            <span>📍</span> Punch In
          </button>
          <button
            onClick={() => {/* PunchOut Logic */}}
            className="flex items-center gap-2 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 px-8 py-3 rounded-2xl font-bold transition-all hover:-translate-y-1 active:scale-95"
          >
            <span>👋</span> Punch Out
          </button>
        </div>
      </div>

      {/* 📊 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon="🕒" 
          title="Total Work Hours" 
          value={summary.totalHours || "00"} 
          color="bg-emerald-500" 
          trend="+2.5% vs last week"
        />
        <StatCard 
          icon="🗓️" 
          title="Days Present" 
          value={summary.totalDays || "0"} 
          color="bg-teal-500" 
          trend="On Track"
        />
        <StatCard 
          icon="⚡" 
          title="Overtime" 
          value={`${summary.overtimeCount || 0} Hrs`} 
          color="bg-green-600" 
          trend="Extra Effort!"
        />
        <StatCard 
          icon="🌴" 
          title="Leaves Taken" 
          value={summary.totalLeaves || "0"} 
          color="bg-slate-700" 
          trend="Available: 12"
        />
      </div>

      {/* 📉 RECENT ACTIVITY / EXTRA SECTION (Placeholder) */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-green-50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="p-2 bg-green-100 rounded-lg">📈</span> Weekly Activity
          </h2>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-green-100 rounded-2xl text-slate-400 font-medium">
            Chart Visualization Area
          </div>
        </div>

        <div className="bg-gradient-to-tr from-green-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Company Notice</h2>
            <p className="text-green-100 text-sm leading-relaxed">
              New attendance policy is live. Please ensure your GPS is enabled while punching in.
            </p>
            <button className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-2 rounded-xl text-sm font-semibold transition-all">
              Read More
            </button>
          </div>
          {/* Abstract Design Element */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

// 🧱 REUSABLE PREMIUM CARD COMPONENT
function StatCard({ icon, title, value, color, trend }) {
  return (
    <div className="group bg-white p-1 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-green-50 hover:-translate-y-2">
      <div className="bg-white rounded-[2.2rem] p-6 h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform`}>
            {icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
            Live Data
          </span>
        </div>
        
        <div>
          <h3 className="text-slate-500 font-semibold text-sm mb-1">{title}</h3>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-xs font-medium text-green-600">
          <span className="mr-1">↗</span> {trend}
        </div>
      </div>
    </div>
  );
}