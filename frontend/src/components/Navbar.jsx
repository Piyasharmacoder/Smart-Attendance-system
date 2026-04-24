export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between">
      
      <h1 className="font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <span>{user?.name}</span>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

    </div>
  );
}