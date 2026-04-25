import { useGetAttendanceQuery } from "../api/attendanceApi";

export default function Team() {
  const { data, isLoading } = useGetAttendanceQuery();
  const records = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Team Attendance</h1>
        <p className="text-slate-500 mt-1">
          Manager view of team attendance from backend RBAC.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        {isLoading ? (
          <p className="text-slate-500">Loading team records...</p>
        ) : (
          <div className="space-y-3">
            {records.map((item) => (
              <div key={item._id} className="border border-slate-100 rounded-xl p-3 text-sm">
                <p>Name: {item.user?.name || "N/A"}</p>
                <p>Date: {new Date(item.date).toLocaleDateString()}</p>
                <p>Hours: {item.workingHours ?? 0}</p>
                <p>Status: {item.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
