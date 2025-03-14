import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Users from "./pages/Users";
import Companies from "./pages/Companies";
import Departments from "./pages/Departments";
import Locations from "./pages/Locations";
import Categories from "./pages/Categories";
import Types from "./pages/Types";
import Subtypes from "./pages/Subtypes";
import ChangePassword from "./pages/ChangePassword"; // ✅ Import ChangePassword
import Reports from "./pages/Reports";
import QrCodeScannerAssets from "./pages/QrCodeScannerAssets";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Jika akses langsung ke "/", arahkan ke /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Route Login - Bisa Diakses Semua Orang */}
        <Route path="/login" element={<Login />} />

        {/* Semua Route Lainnya Dilindungi oleh ProtectedRoute */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar /> {/* Sidebar Hanya Dipanggil Sekali */}
                <div className="flex-1 p-6">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/locations" element={<Locations />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/types" element={<Types />} />
                    <Route path="/subtypes" element={<Subtypes />} />
                    <Route path="/change-password" element={<ChangePassword />} /> {/* ✅ Tambah Route Ganti Password */}
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/qrcodescannerassets" element={<QrCodeScannerAssets />} />

                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
