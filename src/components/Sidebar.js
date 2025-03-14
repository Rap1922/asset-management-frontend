  import { Link, useLocation } from "react-router-dom";
  import { useState, useEffect } from "react";
  import { FiGrid, FiBox, FiUsers, FiHome, FiMapPin, FiLayers, FiTag, FiList, FiLogOut, FiKey, FiFileText } from "react-icons/fi";

  import { useNavigate } from "react-router-dom";

  export default function Sidebar() {
    console.log("🔵 Sidebar dirender!");

    const [role, setRole] = useState(null);
    const [company, setCompany] = useState("");
    const [userName, setUserName] = useState("");
    const location = useLocation();

    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role_id);
        setCompany(payload.nama_perusahaan);
        setUserName(payload.nama_user);
      }
    }, []);




  

    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    };

    
    
    

    return (
      <div className="w-72 bg-gray-900 text-white min-h-screen p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Asset Management</h2>
          <p className="text-sm text-gray-400">👋 Selamat Datang, <span className="font-bold">{userName}</span></p>
          <p className="text-sm text-gray-400">🏢 {company}</p>
        </div>
  
        <nav className="flex-grow">
          <ul className="space-y-2">
            <SidebarItem to="/dashboard" icon={<FiGrid />} label="Dashboard" active={location.pathname === "/dashboard"} />
  
            <p className="text-gray-500 mt-4 mb-2 uppercase text-xs">Master Data</p>
            <SidebarItem to="/departments" icon={<FiLayers />} label="Departemen" active={location.pathname === "/departments"} />
            <SidebarItem to="/locations" icon={<FiMapPin />} label="Lokasi" active={location.pathname === "/locations"} />
            <SidebarItem to="/categories" icon={<FiTag />} label="Kategori" active={location.pathname === "/categories"} />
            <SidebarItem to="/types" icon={<FiList />} label="Jenis Aset" active={location.pathname === "/types"} />
            <SidebarItem to="/subtypes" icon={<FiList />} label="Sub-Jenis Aset" active={location.pathname === "/subtypes"} />
  
            <p className="text-gray-500 mt-4 mb-2 uppercase text-xs">Data Aset</p>
            <SidebarItem to="/assets" icon={<FiBox />} label="Tambah Aset" active={location.pathname === "/assets"} />
            <SidebarItem to="/qrcodescannerassets" icon={<FiBox />} label="Scan Aset" active={location.pathname === "/qrcodescannerassets"} />
  
            <p className="text-gray-500 mt-4 mb-2 uppercase text-xs">Laporan</p>
            <SidebarItem to="/reports" icon={<FiFileText />} label="Laporan Aset" active={location.pathname === "/reports"} />
  
            <p className="text-gray-500 mt-4 mb-2 uppercase text-xs">Akun</p>
            <SidebarItem to="/change-password" icon={<FiKey />} label="Ganti Password" active={location.pathname === "/change-password"} />
            {role === 1 && (
              <SidebarItem to="/users" icon={<FiUsers />} label="Users" active={location.pathname === "/users"} />
            )}
  
            {/* 🔴 Tombol Logout */}
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-all"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </ul>
        </nav>
  
        {/* 🛑 Modal Logout */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Konfirmasi Logout
              </h2>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin logout?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* 🔹 Komponen Sidebar Item */
  function SidebarItem({ to, icon, label, active }) {
    return (
      <li>
        <Link to={to} className={`flex items-center py-2 px-4 rounded-lg transition-all ${active ? "bg-blue-600" : "hover:bg-blue-800"}`}>
          <span className="mr-3">{icon}</span>
          {label}
        </Link>
      </li>
    );
  }
