import { useEffect, useState } from "react";
import axios from "axios";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [form, setForm] = useState({ kode: "", nama_departments: "" });
  const [editDepartment, setEditDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ State pencarian

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 🔥 Batasi jumlah item per halaman

  useEffect(() => {
    fetchDepartments();
    getUserRole();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, departments]); // ✅ Filter otomatis ketika pencarian berubah

  // 🚀 Ambil daftar departemen dari backend
  const fetchDepartments = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get("https://asset-management-backend-production.up.railway.app/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
      setFilteredDepartments(response.data); // ✅ Set awal filteredDepartments = departments
    } catch (err) {
      console.error("❌ Gagal mengambil data departemen:", err);
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

  // ✅ Tambah Departemen baru
  const handleAddDepartment = () => {
    if (!form.kode || !form.nama_departments) {
      setError("Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    axios
      .post("https://asset-management-backend-production.up.railway.app/departments", form, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setForm({ kode: "", nama_departments: "" });
        setError("");
        fetchDepartments();
      })
      .catch((err) => console.error("Gagal menambah departemen:", err));
  };

  // ✅ Edit Departemen
  const handleEditDepartment = () => {
    if (!editDepartment.kode || !editDepartment.nama_departments) {
      setError("Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    axios
      .put(`https://asset-management-backend-production.up.railway.app/departments/${editDepartment.id}`, editDepartment, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setIsModalOpen(false);
        setError("");
        fetchDepartments();
      })
      .catch((err) => console.error("Gagal mengedit departemen:", err));
  };

  // ✅ Hapus Departemen (Hanya Admin)
  const handleDeleteDepartment = (id) => {
    if (!window.confirm("Yakin ingin menghapus departemen ini?")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`https://asset-management-backend-production.up.railway.app/departments/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchDepartments())
      .catch((err) => console.error("Gagal menghapus departemen:", err));
  };

    // ✅ Filter pencarian berdasarkan input user
    const handleSearch = () => {
      if (searchQuery.trim() === "") {
        setFilteredDepartments(departments); // ✅ Jika kosong, tampilkan semua departemen
      } else {
        const filtered = departments.filter((department) =>
          department.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          department.nama_departments.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredDepartments(filtered);
      }
    };

  // ✅ Pagination: Hitung jumlah halaman
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const currentItems = filteredDepartments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ✅ Fungsi untuk navigasi halaman
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manajemen Departmen</h2>

      {/* Form Tambah Departemen */}
      <div className="bg-white p-4 shadow-md rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Tambah Departemen</h3>
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
          placeholder="Nama Departemen"
          value={form.nama_departments}
          onChange={(e) => setForm({ ...form, nama_departments: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <button className="p-2 bg-green-500 text-white rounded" onClick={handleAddDepartment}>
          Tambah
        </button>
      </div>


       {/* 🔍 Input Pencarian */}
       <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Cari departemen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-1/3 mr-2"
        />
      </div>

      {/* Tabel Departemen dengan Scroll & Pagination */}
      <div className="border rounded-md shadow-md">
        <div className="overflow-y-auto max-h-96">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="border px-4 py-2">Kode</th>
                <th className="border px-4 py-2">Nama Departemen</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((department) => (
                <tr key={department.id} className="text-center">
                  <td className="border px-4 py-2">{department.kode}</td>
                  <td className="border px-4 py-2">{department.nama_departments}</td>
                  <td className="border px-4 py-2">
                    <button className="p-2 bg-yellow-500 text-white rounded mr-2"
                      onClick={() => { setEditDepartment(department); setIsModalOpen(true); }}>
                      Edit
                    </button>
                    {role === 1 && (
                      <button className="p-2 bg-red-500 text-white rounded"
                        onClick={() => handleDeleteDepartment(department.id)}>
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

      {/* Tombol Pagination */}
      <div className="mt-4 flex justify-between">
        <button className="p-2 bg-gray-500 text-white rounded" onClick={prevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Halaman {currentPage} dari {totalPages}</span>
        <button className="p-2 bg-gray-500 text-white rounded" onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {/* MODAL EDIT DEPARTEMEN */}
      {isModalOpen && editDepartment && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Edit Departemen</h3>
            <input type="text" placeholder="Kode" value={editDepartment.kode}
              onChange={(e) => setEditDepartment({ ...editDepartment, kode: e.target.value })}
              className="w-full p-2 border rounded mb-2" />
            <input type="text" placeholder="Nama Departemen" value={editDepartment.nama_departments}
              onChange={(e) => setEditDepartment({ ...editDepartment, nama_departments: e.target.value })}
              className="w-full p-2 border rounded mb-2" />
            <button className="p-2 bg-blue-500 text-white rounded mr-2" onClick={handleEditDepartment}>Simpan</button>
            <button className="p-2 bg-gray-500 text-white rounded" onClick={() => setIsModalOpen(false)}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}
