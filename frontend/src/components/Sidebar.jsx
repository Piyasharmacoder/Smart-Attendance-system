export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="w-64 bg-white shadow-lg p-5">
      <h2 className="text-xl font-bold mb-6">DTable</h2>

      <nav className="space-y-3">

        <a href="/dashboard" className="block hover:text-indigo-600">
          Dashboard
        </a>

        <a href="/attendance" className="block hover:text-indigo-600">
          Attendance
        </a>

        {/* Manager */}
        {user?.role === "manager" && (
          <a href="/team" className="block hover:text-indigo-600">
            Team
          </a>
        )}

        {/* Admin */}
        {user?.role === "admin" && (
          <a href="/users" className="block hover:text-indigo-600">
            Users
          </a>
        )}

        <a href="/reports" className="block hover:text-indigo-600">
          Reports
        </a>

      </nav>
    </div>
  );
}