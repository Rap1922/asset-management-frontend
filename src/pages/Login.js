import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



export default function LoginRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perusahaan, setPerusahaan] = useState("");
  const [nama, setNama] = useState("");
  const [role, setRole] = useState(2); // Default role user biasa
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false); // 🔹 Toggle Login/Registrasi
  const navigate = useNavigate();

  // Fetch daftar perusahaan dari backend
  useEffect(() => {
    axios.get("https://asset-management-backend-production.up.railway.app/companies/list")
      .then((res) => setCompanies(res.data))
      .catch(() => setError("Gagal memuat daftar perusahaan."));
}, []);

// Handle Login
const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://asset-management-backend-production.up.railway.app/login", { email, password, perusahaan_id: perusahaan });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Login gagal. Periksa email, password, dan perusahaan.");
    }
};

// Handle Registrasi
const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://asset-management-backend-production.up.railway.app/register", { nama, email, password, role_id: role, perusahaan_id: perusahaan });
      alert("Registrasi berhasil! Silakan login.");
      setIsRegister(false);
    } catch (err) {
      setError("Registrasi gagal. Periksa kembali data Anda.");
    }
};

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">{isRegister ? "Daftar Akun" : "Login"}</h2>
        
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full p-3 border rounded mb-3"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          )}

          <select
            className="w-full p-3 border rounded mb-3"
            value={perusahaan}
            onChange={(e) => setPerusahaan(e.target.value)}
            required
          >
            <option value="">Pilih Perusahaan</option>
            {companies.map((comp) => (
              <option key={comp.id} value={comp.id}>{comp.nama_perusahaan}</option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            {isRegister ? "Daftar" : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            className="text-blue-600 underline hover:text-blue-800"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login di sini" : "Daftar di sini"}
          </button>
        </p>
      </div>
    </div>
  );
}
