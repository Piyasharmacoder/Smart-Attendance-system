import { useMemo, useState } from "react";
import { useGetAttendanceQuery } from "../api/attendanceApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Reports() {
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [employeeNameInput, setEmployeeNameInput] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "",
    employeeName: "",
  });
  const [rangeTab, setRangeTab] = useState("30D");
  const [previewImage, setPreviewImage] = useState("");

  const localUser = useMemo(() => {
    const userInfo = localStorage.getItem("userInfo");
    const user = localStorage.getItem("user");
    const parsed = userInfo || user;
    if (!parsed) return null;
    try {
      return JSON.parse(parsed);
    } catch {
      return null;
    }
  }, []);

  const { data, isLoading } = useGetAttendanceQuery({
    startDate: appliedFilters.startDate || undefined,
    endDate: appliedFilters.endDate || undefined,
    userId: appliedFilters.userId || undefined,
  });

  const records = useMemo(() => data?.data || [], [data]);
  const filteredRecords = useMemo(() => {
    const role = localUser?.role;
    const currentUserId = localUser?._id;
    let rows = [...records];

    if (role === "employee" && currentUserId) {
      rows = rows.filter((row) => row?.user?._id === currentUserId);
    }

    if (appliedFilters.employeeName.trim()) {
      const term = appliedFilters.employeeName.trim().toLowerCase();
      rows = rows.filter((row) =>
        (row?.user?.name || "").toLowerCase().includes(term)
      );
    }

    return rows;
  }, [records, appliedFilters.employeeName, localUser?._id, localUser?.role]);

  const totalHours = useMemo(
    () => filteredRecords.reduce((sum, row) => sum + (row.workingHours || 0), 0),
    [filteredRecords]
  );
  const completedDays = useMemo(
    () => filteredRecords.filter((row) => row.status === "Completed").length,
    [filteredRecords]
  );
  const averageHours = filteredRecords.length
    ? (totalHours / filteredRecords.length).toFixed(2)
    : "0.00";
  const onTimeRate = filteredRecords.length
    ? Math.round((completedDays / filteredRecords.length) * 100)
    : 0;
  const todayRecord = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return filteredRecords.find(
      (row) => row?.date && new Date(row.date).toISOString().split("T")[0] === today
    );
  }, [filteredRecords]);

  const openExport = async (type) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (appliedFilters.startDate) params.set("startDate", appliedFilters.startDate);
    if (appliedFilters.endDate) params.set("endDate", appliedFilters.endDate);
    if (appliedFilters.userId) params.set("userId", appliedFilters.userId);

    const url = `${API_URL}/reports/${type}?${params.toString()}`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = type === "excel" ? "attendance_report.xlsx" : "attendance_report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch {
      alert("Unable to export report.");
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getVisualPercent = (hours) => {
    const safeHours = Number(hours || 0);
    return Math.max(5, Math.min(100, Math.round((safeHours / 10) * 100)));
  };

  const formatTime = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      startDate: startDateInput,
      endDate: endDateInput,
      userId: userIdInput,
      employeeName: employeeNameInput,
    });
  };

  const getSelfie = (row) => row?.punchIn?.image || row?.punchIn?.selfie || "";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Attendance Summary Reports</h1>
        <p className="text-slate-500 mt-1">
          Track attendance trends, timings, and export detailed logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-700 text-white shadow-sm">
          <h2 className="font-semibold text-lg mb-5">Attendance Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10">
              <div>
                <p className="text-slate-300 text-xs uppercase tracking-wider">Average Hrs / Day</p>
                <p className="text-xl font-bold mt-1">{averageHours}h</p>
              </div>
              <span className="text-emerald-300 text-xs font-semibold">{onTimeRate}% On Time</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10">
              <div>
                <p className="text-slate-300 text-xs uppercase tracking-wider">Completed Days</p>
                <p className="text-xl font-bold mt-1">{completedDays}</p>
              </div>
              <span className="text-sky-300 text-xs font-semibold">of {filteredRecords.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-700 text-white shadow-sm">
          <h2 className="font-semibold text-lg mb-5">Timings</h2>
          <div className="space-y-3">
            <p className="text-sm text-slate-300">Today</p>
            <p className="font-semibold text-lg">
              {todayRecord?.punchIn?.time
                ? `${new Date(todayRecord.punchIn.time).toLocaleTimeString()} - ${
                    todayRecord?.punchOut?.time
                      ? new Date(todayRecord.punchOut.time).toLocaleTimeString()
                      : "In Progress"
                  }`
                : "No punch-in today"}
            </p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${getVisualPercent(todayRecord?.workingHours || 0)}%` }}
              />
            </div>
            <p className="text-xs text-slate-300">Duration: {todayRecord?.workingHours || 0}h</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-700 text-white shadow-sm">
          <h2 className="font-semibold text-lg mb-5">Actions</h2>
          <div className="space-y-3">
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="w-full p-2.5 border border-white/20 rounded-xl bg-white/5 text-white"
            />
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="w-full p-2.5 border border-white/20 rounded-xl bg-white/5 text-white"
            />
            <input
              type="text"
              placeholder="User ID (optional)"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="w-full p-2.5 border border-white/20 rounded-xl bg-white/5 text-white placeholder:text-slate-300"
            />
            <input
              type="text"
              placeholder="Employee name"
              value={employeeNameInput}
              onChange={(e) => setEmployeeNameInput(e.target.value)}
              className="w-full p-2.5 border border-white/20 rounded-xl bg-white/5 text-white placeholder:text-slate-300"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApplyFilters}
                className="px-3 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold"
              >
                Apply Filter
              </button>
              <button
                onClick={() => openExport("excel")}
                className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
              >
                Export Excel
              </button>
              <button
                onClick={() => openExport("pdf")}
                className="px-3 py-2 bg-white text-slate-900 rounded-xl text-sm font-semibold"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">Logs & Requests</h2>
            <p className="text-sm text-slate-500">Attendance log for selected time range.</p>
          </div>
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            {["30D", "MAR", "FEB", "JAN", "DEC"].map((tab) => (
              <button
                key={tab}
                onClick={() => setRangeTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  rangeTab === tab
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto max-h-[520px] border border-slate-100 rounded-2xl">
            <table className="min-w-[1080px] w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Punch In</th>
                  <th className="px-4 py-3">Punch Out</th>
                  <th className="px-4 py-3">Selfie</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Working Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.slice(0, 50).map((row) => {
                    const selfie = getSelfie(row);
                    return (
                      <tr
                        key={row._id}
                        className="border-b border-slate-100 hover:bg-emerald-50/30 transition"
                      >
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{row?.user?.name || "N/A"}</td>
                        <td className="px-4 py-3 text-slate-700">{formatTime(row?.punchIn?.time)}</td>
                        <td className="px-4 py-3 text-slate-700">{formatTime(row?.punchOut?.time)}</td>
                        <td className="px-4 py-3">
                          {selfie ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(selfie)}
                              className="focus:outline-none"
                            >
                              <img
                                src={selfie}
                                alt="selfie"
                                className="h-10 w-10 rounded-full object-cover border border-slate-200"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {row?.punchIn?.location
                            ? `${row.punchIn.location.lat}, ${row.punchIn.location.lng}`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                                style={{ width: `${getVisualPercent(row.workingHours)}%` }}
                              />
                            </div>
                            <span className="text-slate-700">{row.workingHours ?? 0}h</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4"
          onClick={() => setPreviewImage("")}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Selfie Preview</h3>
              <button
                onClick={() => setPreviewImage("")}
                className="text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <img
              src={previewImage}
              alt="Selfie preview"
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
