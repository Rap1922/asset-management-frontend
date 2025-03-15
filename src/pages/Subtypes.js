import { useEffect, useState } from "react";
import axios from "axios";

export default function Subtypes() {
  const [subtypes, setSubtypes] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ jenis_id: "", kode: "", nama_subaset: "" });
  const [editSubtype, setEditSubtype] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSubtypes();
    fetchTypes();
    getUserRole();
  }, []);

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role_id);
    }
  };

  // 🚀 Ambil daftar subtypes dari backend
  const fetchSubtypes = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("https://asset-management-backend-production.up.railway.app/subtypes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubtypes(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("❌ Gagal mengambil data subtypes:", err);
      setSubtypes([]);
    }
  };

  // 🚀 Ambil daftar types dari backend
  const fetchTypes = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("https://asset-management-backend-production.up.railway.app/types", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTypes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Gagal mengambil data types:", err);
      setTypes([]);
    }
  };

  // ✅ Tambah Subtype baru
  const handleAddSubtype = async () => {
    if (!form.jenis_id || !form.kode || !form.nama_subaset) {
      setError("❌ Semua field wajib diisi!");
      return;
    }

    setError("");
    const token = localStorage.getItem("token");

    try {
      await axios.post("https://asset-management-backend-production.up.railway.app/subtypes", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm({ jenis_id: "", kode: "", nama_subaset: "" });
      fetchSubtypes();
      setCurrentPage(1);
    } catch (error) {
      console.error("❌ Gagal menambah sub-jenis:", error);
      setError("Gagal menambah sub-jenis!");
    }
  };

  // ✅ Edit Subtype - Memunculkan Modal & Isi Form
  const openEditModal = (subtype) => {
    setEditSubtype(subtype);
    setIsModalOpen(true);
  };

  // ✅ Simpan Perubahan Edit
  const handleEditSubtype = async () => {
    if (!editSubtype || !editSubtype.id || !editSubtype.jenis_id || !editSubtype.kode || !editSubtype.nama_subaset) {
      setError("❌ Semua field wajib diisi!");
      return;
    }
  
    setError(""); // Reset error sebelum request
    const token = localStorage.getItem("token");
  
    try {
      console.log("📤 Mengirim data edit ke server:", editSubtype); // Debugging
  
      const response = await axios.put(`https://asset-management-backend-production.up.railway.app/subtypes/${editSubtype.id}`, 
        {
          jenis_id: editSubtype.jenis_id, 
          kode: editSubtype.kode, 
          nama_subaset: editSubtype.nama_subaset
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("✅ Subtype berhasil diperbarui:", response.data); // Debugging response server
  
      setIsModalOpen(false); // Tutup modal setelah sukses
      fetchSubtypes(); // Refresh data terbaru
  
    } catch (error) {
      console.error("❌ Gagal mengedit sub-jenis:", error);
  
      if (error.response) {
        setError(error.response.data.error || "Terjadi kesalahan saat mengedit sub-jenis.");
      } else {
        setError("Gagal menghubungi server.");
      }
    }
  };
  

  // ✅ Hapus Subtype (Hanya untuk Admin)
  const handleDeleteSubtype = async (id) => {
    if (!window.confirm("⚠️ Yakin ingin menghapus sub-jenis ini?")) return;
    if (role !== 1) {
      alert("❌ Anda tidak memiliki izin untuk menghapus sub-jenis ini!");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`https://asset-management-backend-production.up.railway.app/subtypes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchSubtypes();
    } catch (error) {
      console.error("❌ Gagal menghapus sub-jenis:", error);
    }
  };

  // ✅ Pagination
  const totalPages = Math.ceil(subtypes.length / itemsPerPage);
  const currentItems = subtypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manajemen Sub-Jenis Aset</h2>

      {/* 🔹 FORM INPUT */}
      <div className="bg-white p-4 shadow-md rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Tambah Sub-Jenis</h3>
        {error && <p className="text-red-500">{error}</p>}

        <select className="w-full p-2 border rounded mb-2" value={form.jenis_id} onChange={(e) => setForm({ ...form, jenis_id: e.target.value })}>
          <option value="">Pilih Jenis</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.kode} - {type.nama_asset}
            </option>
          ))}
        </select>

        <input type="text" placeholder="Kode" className="w-full p-2 border rounded mb-2" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
        <input type="text" placeholder="Nama Sub-Jenis" className="w-full p-2 border rounded mb-2" value={form.nama_subaset} onChange={(e) => setForm({ ...form, nama_subaset: e.target.value })} />
        <button className="p-2 bg-green-500 text-white rounded" onClick={handleAddSubtype}>Tambah</button>
      </div>

      {/* 🔹 SCROLLABLE TABEL DATA */}
      <div className="border rounded-md shadow-md overflow-auto" style={{ maxHeight: "400px" }}>
        <table className="w-full border">
          <thead className="sticky top-0 bg-gray-200">
            <tr>
              <th className="border px-4 py-2 hidden">Jenis</th> {/* Kolom disembunyikan */}
              <th className="border px-4 py-2">Kode</th>
              <th className="border px-4 py-2">Nama Sub-Jenis</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((subtype) => (
              <tr key={subtype.id} className="text-center">
                <td className="border px-4 py-2 hidden">{subtype.jenis_id}</td> {/* Data disembunyikan */}
                <td className="border px-4 py-2">{subtype.kode}</td>
                <td className="border px-4 py-2">{subtype.nama_subaset}</td>
                <td className="border px-4 py-2">
                  <button className="p-2 bg-yellow-500 text-white rounded mr-2" onClick={() => openEditModal(subtype)}>Edit</button>
                  {role === 1 && <button className="p-2 bg-red-500 text-white rounded" onClick={() => handleDeleteSubtype(subtype.id)}>Hapus</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 PAGINATION */}
      <div className="mt-4 flex justify-between">
        <button className="p-2 bg-gray-500 text-white rounded" onClick={() => setCurrentPage(prev => prev > 1 ? prev - 1 : prev)} disabled={currentPage === 1}>Prev</button>
        <span>Halaman {currentPage} dari {totalPages}</span>
        <button className="p-2 bg-gray-500 text-white rounded" onClick={() => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev)} disabled={currentPage === totalPages}>Next</button>
      </div>

      {/* 🔹 MODAL EDIT */}
      {isModalOpen && editSubtype && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Edit Sub-Jenis</h3>
            <input type="text" className="w-full p-2 border rounded mb-2" value={editSubtype.nama_subaset} onChange={(e) => setEditSubtype({ ...editSubtype, nama_subaset: e.target.value })} />
            <button className="p-2 bg-blue-500 text-white rounded" onClick={handleEditSubtype}>Simpan</button>
            <button className="p-2 bg-gray-500 text-white rounded ml-2" onClick={() => setIsModalOpen(false)}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );

}
