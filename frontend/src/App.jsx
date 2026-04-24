import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

// 🔐 Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// 🧱 Layout
import MainLayout from "./layout/MainLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* 🔓 Public Route: No Sidebar/Navbar here */}
        <Route path="/" element={<Auth />} />

        {/* 🔐 Protected Routes: Wrapped in MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 📅 Attendance Route */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <MainLayout>
                {/* Yahan apna Attendance component daalein */}
                <div className="text-white text-2xl font-bold">Attendance Page Coming Soon...</div>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 📊 Reports Route */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                {/* Yahan apna Reports component daalein */}
                <div className="text-white text-2xl font-bold">Reports Page Coming Soon...</div>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 - Redirect to Dashboard or Login if route not found */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}