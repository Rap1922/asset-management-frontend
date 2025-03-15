import { useEffect, useState } from "react";
import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ nama: "", email: "", password: "", role_id: "", perusahaan_id: "" });
  const [editUser, setEditUser] = useState(null);
  const [editPassword, setEditPassword] = useState(""); // State untuk password saat edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login");

    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role_id === 1) {
      fetchUsers(token);
      fetchRoles(token);
      fetchCompanies(token);
    } else {
      alert("Access Denied!");
      window.location.href = "/dashboard";
    }
  }, []);

  const fetchUsers = (token) => {
    axios.get("https://asset-management-backend-production.up.railway.app/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data))
      .catch(err => console.error("Gagal mengambil data user:", err));
  };

  const fetchRoles = (token) => {
    axios.get("https://asset-management-backend-production.up.railway.app/roles", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRoles(res.data))
      .catch(err => console.error("Gagal mengambil data role:", err));
  };

  const fetchCompanies = (token) => {
    axios.get("https://asset-management-backend-production.up.railway.app/companies/list", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCompanies(res.data))
      .catch(err => console.error("Gagal mengambil data perusahaan:", err));
  };

  const handleAddUser = () => {
    if (!form.nama || !form.email || !form.password || !form.role_id || !form.perusahaan_id) {
      setError("Semua field wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    axios.post("https://asset-management-backend-production.up.railway.app/users", form, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setForm({ nama: "", email: "", password: "", role_id: "", perusahaan_id: "" });
        setError("");
        fetchUsers(token);
      })
      .catch(err => console.error("Gagal menambah user:", err));
  };

  const handleEditUser = () => {
    if (!editUser.nama || !editUser.role_id || !editUser.perusahaan_id) {
      setError("Nama, Role, dan Perusahaan wajib diisi!");
      return;
    }

    const token = localStorage.getItem("token");
    const updatedData = { ...editUser };

    // Jika password diisi, tambahkan ke request
    if (editPassword) {
      updatedData.password = editPassword;
    }

    axios.put(`https://asset-management-backend-production.up.railway.app/users/${editUser.id}`, updatedData, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setIsModalOpen(false);
        setEditPassword(""); // Reset password setelah update
        setError("");
        fetchUsers(token);
      })
      .catch(err => console.error("Gagal mengedit user:", err));
  };

  const handleDeleteUser = (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    const token = localStorage.getItem("token");
    axios.delete(`https://asset-management-backend-production.up.railway.app/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchUsers(token))
      .catch(err => console.error("Gagal menghapus user:", err));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {/* Form Tambah User */}
      <div className="bg-white p-4 shadow-md rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Tambah User</h3>
        {error && <p className="text-red-500">{error}</p>}
        <input type="text" placeholder="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="p-2 border rounded mr-2" />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="p-2 border rounded mr-2" />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="p-2 border rounded mr-2" />

        {/* Dropdown Role */}
        <select className="p-2 border rounded mr-2" value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}>
          <option value="">Pilih Role</option>
          {roles.map(role => <option key={role.id} value={role.id}>{role.role_name}</option>)}
        </select>

        {/* Dropdown Perusahaan */}
        <select className="p-2 border rounded mr-2" value={form.perusahaan_id} onChange={(e) => setForm({ ...form, perusahaan_id: e.target.value })}>
          <option value="">Pilih Perusahaan</option>
          {companies.map(company => <option key={company.id} value={company.id}>{company.nama_perusahaan}</option>)}
        </select>

        <button className="p-2 bg-green-500 text-white rounded" onClick={handleAddUser}>Tambah</button>
      </div>

      {/* Tabel User */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Nama</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Perusahaan</th>
            <th className="border px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="text-center">
              <td className="border px-4 py-2">{user.nama}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role_name}</td>
              <td className="border px-4 py-2">{user.nama_perusahaan}</td>
              <td className="border px-4 py-2">
                <button className="p-2 bg-yellow-500 text-white rounded mr-2" onClick={() => { setEditUser(user); setIsModalOpen(true); }}>Edit</button>
                <button className="p-2 bg-red-500 text-white rounded" onClick={() => handleDeleteUser(user.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL EDIT USER */}
      {isModalOpen && editUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <input type="text" placeholder="Nama" value={editUser.nama} onChange={(e) => setEditUser({ ...editUser, nama: e.target.value })} className="w-full p-2 border rounded mb-2" />
            <input type="password" placeholder="Ganti Password (Opsional)" className="w-full p-2 border rounded mb-2" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
            <button className="p-2 bg-blue-500 text-white rounded mr-2" onClick={handleEditUser}>Simpan</button>
            <button className="p-2 bg-gray-500 text-white rounded" onClick={() => setIsModalOpen(false)}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}
