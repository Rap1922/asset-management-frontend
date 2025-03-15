import { useEffect, useState } from "react";
import axios from "axios";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ kode: "", nama_perusahaan: "" });
  const [editCompany, setEditCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = () => {
    axios
      .get("https://asset-management-backend-production.up.railway.app/companies")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Gagal mengambil data perusahaan:", err));
  };

  const handleAddCompany = () => {
    if (!form.kode || !form.nama_perusahaan) {
      setError("Semua field wajib diisi!");
      return;
    }

    axios
      .post("https://asset-management-backend-production.up.railway.app/companies", form)
      .then(() => {
        setForm({ kode: "", nama_perusahaan: "" });
        setError("");
        fetchCompanies();
      })
      .catch((err) => console.error("Gagal menambah perusahaan:", err));
  };

  const handleEditCompany = () => {
    if (!editCompany.kode || !editCompany.nama_perusahaan) {
      setError("Semua field wajib diisi!");
      return;
    }

    axios
      .put(`https://asset-management-backend-production.up.railway.app/companies/${editCompany.id}`, editCompany)
      .then(() => {
        setIsModalOpen(false);
        setError("");
        fetchCompanies();
      })
      .catch((err) => console.error("Gagal mengedit perusahaan:", err));
  };

  const handleDeleteCompany = (id) => {
    if (!window.confirm("Yakin ingin menghapus perusahaan ini?")) return;

    axios
      .delete(`https://asset-management-backend-production.up.railway.app/companies/${id}`)
      .then(() => fetchCompanies())
      .catch((err) => console.error("Gagal menghapus perusahaan:", err));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Company Management</h2>

      {/* Form Tambah Perusahaan */}
      <div className="bg-white p-4 shadow-md rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Tambah Perusahaan</h3>
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
          placeholder="Nama Perusahaan"
          value={form.nama_perusahaan}
          onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <button className="p-2 bg-green-500 text-white rounded" onClick={handleAddCompany}>
          Tambah
        </button>
      </div>

      {/* Tabel Perusahaan */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Kode</th>
            <th className="border px-4 py-2">Nama Perusahaan</th>
            <th className="border px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="text-center">
              <td className="border px-4 py-2">{company.kode}</td>
              <td className="border px-4 py-2">{company.nama_perusahaan}</td>
              <td className="border px-4 py-2">
                <button
                  className="p-2 bg-yellow-500 text-white rounded mr-2"
                  onClick={() => {
                    setEditCompany(company);
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="p-2 bg-red-500 text-white rounded"
                  onClick={() => handleDeleteCompany(company.id)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL EDIT PERUSAHAAN */}
      {isModalOpen && editCompany && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Edit Perusahaan</h3>
            <input
              type="text"
              placeholder="Kode"
              value={editCompany.kode}
              onChange={(e) => setEditCompany({ ...editCompany, kode: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Nama Perusahaan"
              value={editCompany.nama_perusahaan}
              onChange={(e) =>
                setEditCompany({ ...editCompany, nama_perusahaan: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <button className="p-2 bg-blue-500 text-white rounded mr-2" onClick={handleEditCompany}>
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
