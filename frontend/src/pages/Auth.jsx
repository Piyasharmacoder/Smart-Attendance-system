import { useState } from "react";
import API from "../api/axios";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee"
  });

  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        window.location.href = "/dashboard";
      } else {
        const res = await API.post("/auth/register", form);

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        window.location.href = "/dashboard";
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-600 to-purple-700">
      
      {/* LEFT */}
      <div className="hidden md:flex w-1/2 text-white flex-col justify-center items-center p-10">
        <h1 className="text-5xl font-bold mb-4">DTable Attendance</h1>
        <p className="text-lg opacity-80 text-center">
          Smart Attendance + OT + Reports System
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex w-full md:w-1/2 justify-center items-center">
        <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl p-8 w-[350px] text-white">

          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? "Login" : "Sign Up"}
          </h2>

          {/* NAME */}
          {!isLogin && (
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full mb-3 p-3 rounded bg-white/20 placeholder-white outline-none"
            />
          )}

          {/* EMAIL */}
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full mb-3 p-3 rounded bg-white/20 placeholder-white outline-none"
          />

          {/* PASSWORD */}
          <div className="relative mb-3">
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 rounded bg-white/20 placeholder-white outline-none"
            />
            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 cursor-pointer text-sm"
            >
              {showPass ? "Hide" : "Show"}
            </span>
          </div>

          {/* ROLE */}
          {!isLogin && (
            <select
              name="role"
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded bg-white/20 text-white"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          )}

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full bg-white text-indigo-600 font-semibold p-3 rounded hover:scale-105 transition"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>

          {/* TOGGLE */}
          <p className="text-center mt-4 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              className="ml-1 font-bold cursor-pointer"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}