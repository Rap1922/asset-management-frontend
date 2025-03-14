import { useEffect, useState } from "react";
import axios from "axios";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ kode: "", nama_lokasi: "" });
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [editLocation, setEditLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ State untuk pencarian

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLocations();
    getUserRole();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, locations]); // ✅ Filter otomatis saat pencarian berubah

  // 🚀 Ambil daftar lokasi dari backend
  const fetchLocations = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get("http://localhost:5000/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data);
      setFilteredLocations(response.data); // ✅ Awalnya filteredLocations = locations
    } catch (err) {
      console.error("❌ Gagal mengambil data lokasi:", err);
    }
  };

  // 🔥 Ambil role dari token login
  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role_id);
    }
  };

  // ✅ Tambah Lokasi baru
  const handleAddLocation = () => {
    if (!form.kode || !form.nama_lokasi) {
      setError("Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    axios
      .post("http://localhost:5000/locations", form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setForm({ kode: "", nama_lokasi: "" });
        setError("");
        fetchLocations();
      })
      .catch((err) => console.error("Gagal menambah lokasi:", err));
  };

  // ✅ Edit Lokasi
  const handleEditLocation = () => {
    if (!editLocation.kode || !editLocation.nama_lokasi) {
      setError("Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    axios
      .put(`http://localhost:5000/locations/${editLocation.id}`, editLocation, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setIsModalOpen(false);
        setError("");
        fetchLocations();
      })
      .catch((err) => console.error("Gagal mengedit lokasi:", err));
  };

  // ✅ Hapus Lokasi (Hanya Admin)
  const handleDeleteLocation = (id) => {
    if (!window.confirm("Yakin ingin menghapus lokasi ini?")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:5000/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => fetchLocations())
      .catch((err) => console.error("Gagal menghapus lokasi:", err));
  };

  // ✅ Filter pencarian berdasarkan input user
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredLocations(locations); // ✅ Jika kosong, tampilkan semua lokasi
    } else {
      const filtered = locations.filter((location) =>
        location.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.nama_lokasi.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  };

  // 🔹 Hitung Index Data untuk Pagination
  // ✅ Pagination: Hitung jumlah halaman berdasarkan hasil pencarian
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const currentItems = filteredLocations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 🔹 Navigasi Halaman
  const nextPage = () => {
    if (currentPage < Math.ceil(locations.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manajemen Lokasi</h2>

      {/* Form Tambah Lokasi */}
      <div className="bg-white p-4 shadow-md rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Tambah Lokasi</h3>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Kode"
          value={form.kode}
          onChange={(e) => setForm({ ...form, kode: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <input
          type="text"
          placeholder="Nama Lokasi"
          value={form.nama_lokasi}
          onChange={(e) => setForm({ ...form, nama_lokasi: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <button className="p-2 bg-green-500 text-white rounded" onClick={handleAddLocation}>
          Tambah
        </button>
      </div>

       {/* 🔍 Input Pencarian */}
       <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Cari lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-1/3 mr-2"
        />
      </div>

      {/* 🔹 Tabel Lokasi dengan Scroll dan Pagination */}
      <div className="border rounded-md shadow-md">
        <div className="overflow-y-auto max-h-96">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="border px-4 py-2">Kode</th>
                <th className="border px-4 py-2">Nama Lokasi</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((location) => (
                <tr key={location.id} className="text-center">
                  <td className="border px-4 py-2">{location.kode}</td>
                  <td className="border px-4 py-2">{location.nama_lokasi}</td>
                  <td className="border px-4 py-2">
                    <button className="p-2 bg-yellow-500 text-white rounded mr-2"
                      onClick={() => {
                        setEditLocation(location);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    {role === 1 && (
                      <button
                        className="p-2 bg-red-500 text-white rounded"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Tombol Navigasi Pagination */}
      <div className="mt-4 flex justify-between">
        <button className="p-2 bg-gray-500 text-white rounded" onClick={prevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Halaman {currentPage} dari {Math.ceil(locations.length / itemsPerPage)}</span>
        <button className="p-2 bg-gray-500 text-white rounded" onClick={nextPage} disabled={currentPage === Math.ceil(locations.length / itemsPerPage)}>
          Next
        </button>
      </div>

{/* MODAL EDIT LOKASI */}
{isModalOpen && editLocation && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h3 className="text-xl font-bold mb-4">Edit Lokasi</h3>
      <input
        type="text"
        placeholder="Kode"
        className="w-full p-2 border rounded mb-2"
        value={editLocation.kode}
        onChange={(e) => setEditLocation({ ...editLocation, kode: e.target.value })} // ✅ Tambahkan handler onChange
      />
      <input
        type="text"
        placeholder="Nama Lokasi"
        className="w-full p-2 border rounded mb-2"
        value={editLocation.nama_lokasi}
        onChange={(e) => setEditLocation({ ...editLocation, nama_lokasi: e.target.value })} // ✅ Tambahkan handler onChange
      />
      <button className="p-2 bg-blue-500 text-white rounded mr-2" onClick={handleEditLocation}>
        Simpan
      </button>
      <button className="p-2 bg-gray-500 text-white rounded" onClick={() => setIsModalOpen(false)}>
        Batal
      </button>
    </div>
  </div>
)}

    </div>
  );
}
