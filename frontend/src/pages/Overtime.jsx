import { useState } from "react";
import {
  useGetOvertimeRequestsQuery,
  useRequestOvertimeMutation,
  useUpdateOvertimeStatusMutation,
} from "../api/overtimeApi";
import { useSelector } from "react-redux";

export default function Overtime() {
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetOvertimeRequestsQuery();
  const [requestOvertime, { isLoading: requesting }] = useRequestOvertimeMutation();
  const [updateOvertimeStatus, { isLoading: updating }] = useUpdateOvertimeStatusMutation();
  const [form, setForm] = useState({ date: "", requestedHours: "", reason: "" });

  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      await requestOvertime({
        date: form.date,
        requestedHours: Number(form.requestedHours),
        reason: form.reason,
      }).unwrap();
      setForm({ date: "", requestedHours: "", reason: "" });
    } catch (error) {
      alert(error?.data?.message || "Failed to request overtime");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateOvertimeStatus({ id, status }).unwrap();
    } catch (error) {
      alert(error?.data?.message || "Failed to update overtime");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Overtime Workflow</h1>
      </div>

      {userInfo?.role === "employee" && (
        <form onSubmit={submitRequest} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <h2 className="font-semibold">Request Overtime</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="p-2 border rounded-xl" />
            <input type="number" required min="1" placeholder="Requested hours" value={form.requestedHours} onChange={(e) => setForm({ ...form, requestedHours: e.target.value })} className="p-2 border rounded-xl" />
            <input type="text" required placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="p-2 border rounded-xl" />
          </div>
          <button disabled={requesting} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
            {requesting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-semibold mb-4">Overtime Requests</h2>
        {isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-3">
            {(data?.data || []).map((item) => (
              <div key={item._id} className="border rounded-xl p-3 text-sm">
                <p>User: {item.user?.name || "N/A"}</p>
                <p>Date: {new Date(item.date).toLocaleDateString()}</p>
                <p>Hours: {item.requestedHours}</p>
                <p>Status: {item.status}</p>
                <p>Reason: {item.reason}</p>
                {(userInfo?.role === "manager" || userInfo?.role === "admin") &&
                  item.status === "Pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        disabled={updating}
                        onClick={() => updateStatus(item._id, "Approved")}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg"
                      >
                        Approve
                      </button>
                      <button
                        disabled={updating}
                        onClick={() => updateStatus(item._id, "Rejected")}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg"
                      >
                        Reject
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
