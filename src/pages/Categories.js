import { useEffect, useState } from "react";
import axios from "axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [form, setForm] = useState({ kode: "", nama_kategori: "" });
  const [editCategory, setEditCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
    getUserRole();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, categories]); // ✅ Update otomatis saat input pencarian berubah

  // 🚀 Ambil daftar kategori dari backend
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("https://asset-management-backend-production.up.railway.app/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
      setFilteredCategories(response.data); // ✅ Awalnya filteredCategories = categories
    } catch (err) {
      console.error("❌ Gagal mengambil data kategori:", err);
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

  // ✅ Tambah kategori baru
  const handleAddCategory = async (event) => {
    event.preventDefault();
    if (!form.kode || !form.nama_kategori) {
      setError("❌ Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.post("https://asset-management-backend-production.up.railway.app/categories", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ kode: "", nama_kategori: "" });
      setError("");
      fetchCategories();
    } catch (err) {
      console.error("❌ Gagal menambah kategori:", err);
      setError("Gagal menambahkan kategori.");
    }
  };

  // ✅ Edit kategori
  const handleEditCategory = async (event) => {
    event.preventDefault();
    if (!editCategory.kode || !editCategory.nama_kategori) {
      setError("❌ Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.put(`https://asset-management-backend-production.up.railway.app/categories/${editCategory.id}`, editCategory, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsModalOpen(false);
      setError("");
      fetchCategories();
    } catch (err) {
      console.error("❌ Gagal mengedit kategori:", err);
      setError("Gagal mengedit kategori.");
    }
  };

  // ✅ Hapus kategori (Hanya Admin)
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("⚠️ Yakin ingin menghapus kategori ini?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://asset-management-backend-production.up.railway.app/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      console.error("❌ Gagal menghapus kategori:", err);
      setError("Gagal menghapus kategori.");
    }
  };

  // ✅ Filter pencarian berdasarkan input user
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories); // ✅ Jika kosong, tampilkan semua kategori
    } else {
      const filtered = categories.filter((category) =>
        category.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.nama_kategori.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

  // ✅ Pagination: Hitung jumlah halaman
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentItems = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manajemen Kategori</h2>



      {/* Form Tambah Kategori */}
      <form onSubmit={handleAddCategory} className="bg-white p-4 shadow-md rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Tambah Kategori</h3>
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
          placeholder="Nama Kategori"
          value={form.nama_kategori}
          onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <button type="submit" className="p-2 bg-green-500 text-white rounded">
          Tambah
        </button>
      </form>

            {/* 🔍 Input Pencarian */}
            <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Cari kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-1/3 mr-2"
        />
      </div>

      {/* Tabel Kategori */}
      <div className="border rounded-md shadow-md">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Kode</th>
              <th className="border px-4 py-2">Nama Kategori</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((category) => (
              <tr key={category.id} className="text-center">
                <td className="border px-4 py-2">{category.kode}</td>
                <td className="border px-4 py-2">{category.nama_kategori}</td>
                <td className="border px-4 py-2">
                  <button className="p-2 bg-yellow-500 text-white rounded mr-2" onClick={() => { setEditCategory(category); setIsModalOpen(true); }}>
                    Edit
                  </button>
                  {role === 1 && (
                    <button className="p-2 bg-red-500 text-white rounded" onClick={() => handleDeleteCategory(category.id)}>
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

            {/* MODAL EDIT KATEGORI */}
            {isModalOpen && editCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Edit Kategori</h3>
            <input type="text" placeholder="Kode" value={editCategory.kode}
              onChange={(e) => setEditCategory({ ...editCategory, kode: e.target.value })}
              className="w-full p-2 border rounded mb-2" />
            <input type="text" placeholder="Nama Kategori" value={editCategory.nama_kategori}
              onChange={(e) => setEditCategory({ ...editCategory, nama_kategori: e.target.value })}
              className="w-full p-2 border rounded mb-2" />
            <button className="p-2 bg-blue-500 text-white rounded mr-2" onClick={handleEditCategory}>Simpan</button>
            <button className="p-2 bg-gray-500 text-white rounded" onClick={() => setIsModalOpen(false)}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}
