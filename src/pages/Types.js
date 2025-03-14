import { useEffect, useState } from "react";
import axios from "axios";

export default function Types() {
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ kategori_id: "", kode: "", nama_asset: "" });
  const [editType, setEditType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);

   // Pagination
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10; // 🔥 Batasi jumlah item per halama

  useEffect(() => {
    fetchTypes();
    fetchCategories();
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role_id);
    }
  }, []);

// 🚀 Ambil daftar types dari backend
const fetchTypes = () => {
    const token = localStorage.getItem("token");

    console.log("🔍 Token Dikirim:", token); // ✅ Debug apakah token benar dikirim

    axios
      .get("http://localhost:5000/types", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("✅ Data Types Diterima:", res.data); // ✅ Debug hasil dari backend
        setTypes(res.data);
      })
      .catch((err) => {
        console.error("❌ Gagal mengambil data types:", err);
      });
};

// 🚀 Ambil daftar categories dari backend
// 🔹 Fetch Kategori
const fetchCategories = () => {
  const token = localStorage.getItem("token");

  axios.get("http://localhost:5000/categories", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      setCategories(res.data);
    })
    .catch((err) => console.error("❌ Gagal mengambil kategori:", err));
};




 // ✅ Pagination: Hitung jumlah halaman
 const totalPages = Math.ceil(types.length / itemsPerPage);
 const currentItems = types.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

 // ✅ Fungsi untuk navigasi halaman
 const nextPage = () => {
   if (currentPage < totalPages) setCurrentPage(currentPage + 1);
 };

 const prevPage = () => {
   if (currentPage > 1) setCurrentPage(currentPage - 1);
 };


  const handleAddType = () => {
    if (!form.kategori_id || !form.kode || !form.nama_asset) {
      setError("Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    axios
      .post("http://localhost:5000/types", form, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setForm({ kategori_id: "", kode: "", nama_asset: "" });
        setError("");
        fetchTypes();
      })
      .catch((err) => {
        console.error("❌ Gagal menambah jenis:", err);
        setError("Gagal menambahkan jenis aset");
      });
  };

  const handleEditType = () => {
    if (!editType.kategori_id || !editType.kode || !editType.nama_asset) {
      setError("Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    axios
      .put(`http://localhost:5000/types/${editType.id}`, editType, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setIsModalOpen(false);
        setError("");
        fetchTypes();
      })
      .catch((err) => console.error("❌ Gagal mengedit jenis:", err));
  };

  const handleDeleteType = (id) => {
    if (!window.confirm("Yakin ingin menghapus jenis ini?")) return;
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:5000/types/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchTypes())
      .catch((err) => console.error("❌ Gagal menghapus jenis:", err));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manajemen Jenis Aset</h2>

      {/* 🔹 FORM INPUT */}
      <div className="bg-white p-4 shadow-md rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Tambah Jenis</h3>
        {error && <p className="text-red-500">{error}</p>}

        <select
          className="w-full p-2 border rounded mb-2"
          value={form.kategori_id}
          onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
        >
          <option value="">Pilih Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.kode} - {category.nama_kategori}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Kode"
          className="w-full p-2 border rounded mb-2"
          value={form.kode}
          onChange={(e) => setForm({ ...form, kode: e.target.value })}
        />

        <input
          type="text"
          placeholder="Nama Jenis"
          className="w-full p-2 border rounded mb-2"
          value={form.nama_asset}
          onChange={(e) => setForm({ ...form, nama_asset: e.target.value })}
        />

        <button className="p-2 bg-green-500 text-white rounded" onClick={handleAddType}>
          Tambah
        </button>
      </div>

    {/* 🔹 Tabel dengan Scroll & Pagination */}
    <div className="border rounded-md shadow-md">
        <div className="overflow-y-auto max-h-96">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="border px-4 py-2">Kategori</th>
                <th className="border px-4 py-2">Kode</th>
                <th className="border px-4 py-2">Nama Jenis</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((type) => (
                <tr key={type.id} className="text-center">
                  <td className="border px-4 py-2">{type.kategori_id}</td>
                  <td className="border px-4 py-2">{type.kode}</td>
                  <td className="border px-4 py-2">{type.nama_asset}</td>
                  <td className="border px-4 py-2">
                    <button className="p-2 bg-yellow-500 text-white rounded mr-2"
                      onClick={() => { setEditType(type); setIsModalOpen(true); }}>
                      Edit
                    </button>
                    {role === 1 && (
                      <button className="p-2 bg-red-500 text-white rounded"
                        onClick={() => handleDeleteType(type.id)}>
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

      {/* 🔹 MODAL EDIT */}
      {isModalOpen && editType && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Edit Jenis Inventaris</h3>

            <select
              className="w-full p-2 border rounded mb-2"
              value={editType.kategori_id}
              onChange={(e) => setEditType({ ...editType, kategori_id: e.target.value })}
            >
              <option value="">Pilih Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nama_kategori}
                </option>
              ))}
            </select>

            <input type="text" placeholder="Kode" className="w-full p-2 border rounded mb-2" value={editType.kode} onChange={(e) => setEditType({ ...editType, kode: e.target.value })} />

            <input type="text" placeholder="Nama Jenis" className="w-full p-2 border rounded mb-2" value={editType.nama_asset} onChange={(e) => setEditType({ ...editType, nama_asset: e.target.value })} />

            <button className="p-2 bg-blue-500 text-white rounded mr-2" onClick={handleEditType}>
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
