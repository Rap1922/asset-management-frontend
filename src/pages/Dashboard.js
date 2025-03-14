import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({ total: 0, aktif: 0, rusak: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // ✅ State untuk halaman
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const limit = 5; // ✅ Set jumlah data per halaman

  // 🔹 Ambil data aset & statistik saat halaman dimuat
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get(`http://localhost:5000/assets?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        console.log("✅ Data aset diterima:", res.data);
        setAssets(res.data.data);
        setTotalPages(res.data.totalPages);
    })
    .catch(err => {
        console.error("❌ Gagal mengambil data aset:", err);
    });

    axios.get("http://localhost:5000/assets/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log("✅ Statistik aset diterima:", res.data);
      setStats(res.data);
    })
    .catch(err => {
      console.error("❌ Gagal mengambil statistik aset:", err);
    });

  }, [navigate, page]); // ✅ Perbarui data saat halaman berubah

  // 🔍 Filter pencarian
  const filteredAssets = assets.filter(asset =>
    asset.kode_asset.toLowerCase().includes(search.toLowerCase()) ||
    asset.kode_perusahaan.toLowerCase().includes(search.toLowerCase()) ||
    (asset.nama_perusahaan && asset.nama_perusahaan.toLowerCase().includes(search.toLowerCase())) ||
    (asset.nama_departments && asset.nama_departments.toLowerCase().includes(search.toLowerCase())) ||
    (asset.nama_lokasi && asset.nama_lokasi.toLowerCase().includes(search.toLowerCase())) ||
    (asset.jenis_aset && asset.jenis_aset.toLowerCase().includes(search.toLowerCase())) ||
    (asset.sub_jenis_aset && asset.sub_jenis_aset.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Aset</h2>

      {/* 🔹 Kartu Statistik */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 shadow-md rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-700">Total Aset</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white p-5 shadow-md rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-700">Aset Aktif</h3>
          <p className="text-3xl font-bold text-green-600">{stats.aktif}</p>
        </div>
      </div>

      {/* 🔹 Pencarian */}
      <div className="mb-4">
        <input 
          type="text"
          placeholder="🔍 Cari aset berdasarkan kode, perusahaan, lokasi, jenis aset..." 
          className="w-full p-3 border rounded-md shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🔹 Tabel Data Aset dengan Scroll */}
      <div className="bg-white p-5 shadow-md rounded-lg">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Daftar Aset</h3>
        <div className="overflow-y-auto max-h-96"> {/* ✅ Scroll View */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border px-5 py-3 text-left">Kode Aset</th>
                <th className="border px-5 py-3 text-left">Kode Perusahaan</th>
                <th className="border px-5 py-3 text-left">Nama Perusahaan</th>
                <th className="border px-5 py-3 text-left">Nama Departemen</th>
                <th className="border px-5 py-3 text-left">Nama Lokasi</th>
                <th className="border px-5 py-3 text-left">Jenis Aset</th>
                <th className="border px-5 py-3 text-left">Sub Jenis Aset</th>
                <th className="border px-5 py-3 text-center">QR Code</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-100 transition-all">
                  <td className="border px-5 py-3 text-gray-700">{asset.kode_asset}</td>
                  <td className="border px-5 py-3 text-gray-700">{asset.kode_perusahaan}</td>
                  <td className="border px-5 py-3 text-gray-700">{asset.nama_perusahaan || "Tidak ada data"}</td>
                  <td className="border px-5 py-3 text-gray-700">{asset.nama_departments || "Tidak ada data"}</td>
                  <td className="border px-5 py-3 text-gray-700">{asset.nama_lokasi || "Tidak ada data"}</td>
                  <td className="border px-5 py-3 text-gray-700">{asset.jenis_aset || "Tidak ada data"}</td>
                  <td className="border px-5 py-3 text-gray-700">{asset.sub_jenis_aset || "Tidak ada data"}</td>
                  <td className="border px-5 py-3 text-gray-700 text-center">
                    <QRCodeCanvas value={asset.kode_asset} size={50} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="text-center text-gray-500 py-4">❌ Tidak ada aset ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Pagination */}
      <div className="flex justify-center mt-4">
        <button 
          onClick={() => setPage(page - 1)} 
          disabled={page === 1} 
          className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
        >
          ⬅ Prev
        </button>
        <span className="px-4 py-2">{page} / {totalPages}</span>
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page === totalPages} 
          className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}
