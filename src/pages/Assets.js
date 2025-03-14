//koding aset baru

import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [showDeletedAssets, setShowDeletedAssets] = useState(false); // ✅ Tambahkan ini!
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);


  const [form, setForm] = useState(
    {
    
    kode_departemen: "",
    kode_lokasi: "",
    kategori_id: "",
    jenis_id: "",
    subjenis_id: "",
    deskripsi: "",
  });
  
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔹 State untuk konfirmasi hapus aset
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    fetchAssets();
    fetchDropdownData();
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role_id);
      console.log("Role User:", payload.role_id);
    }
  }, [currentPage, showDeletedAssets]); // ✅ Tambahkan showDeletedAssets sebagai dependensi
  

  const fetchAssets = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Token tidak ditemukan di localStorage!");
      return;
    }
  
    const headers = { Authorization: `Bearer ${token}` };
    const status = showDeletedAssets ? "deleted" : "active"; // 🔹 Filter status aset
  
    try {
      console.log("📡 Fetching asset data...");
      const response = await axios.get(
        `http://localhost:5000/assets?page=${currentPage}&limit=${itemsPerPage}&status=${status}`, 
        { headers }
      );
  
      console.log("✅ Data aset diterima dari backend:", response.data);
  
      if (response.data && Array.isArray(response.data.data)) {
        setAssets(response.data.data);
      } else {
        console.warn("⚠️ Data aset tidak dalam format yang diharapkan:", response.data);
        setAssets([]);
      }
    } catch (err) {
      console.error("❌ Gagal mengambil data aset:", err.response ? err.response.data : err);
      setAssets([]);
    }
  };
  

  
  
  

  const fetchDropdownData = () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios.get("http://localhost:5000/departments", { headers })
      .then((res) => {
        console.log("✅ Departemen diterima:", res.data);
        setDepartments(res.data || []);
      })
      .catch((err) => console.error("❌ Gagal mengambil departemen:", err));

    axios.get("http://localhost:5000/locations", { headers })
      .then((res) => {
        console.log("✅ Lokasi diterima:", res.data);
        setLocations(res.data || []);
      })
      .catch((err) => console.error("❌ Gagal mengambil lokasi:", err));

    axios.get("http://localhost:5000/categories", { headers })
      .then((res) => {
        console.log("✅ Kategori diterima:", res.data);
        setCategories(res.data || []);
      })
      .catch((err) => console.error("❌ Gagal mengambil kategori:", err));

    // axios.get("http://localhost:5000/types", { headers })
    //   .then((res) => {
    //     console.log("✅ Jenis diterima:", res.data);
    //     setTypes(res.data || []);
    //   })
    //   .catch((err) => console.error("❌ Gagal mengambil jenis aset:", err));

    //   axios.get("http://localhost:5000/subtypes", { headers })
    //   .then((res) => {
    //     console.log("✅ Subjenis diterima:", res.data);
    //     setSubtypes(res.data.data || []); // HARUS res.data.data, bukan res.data langsung
    //   })
    //   .catch((err) => console.error("❌ Gagal mengambil sub-jenis:", err));
    
  };

   // 🔹 Ambil Jenis Aset berdasarkan Kategori yang dipilih
   useEffect(() => {
    if (form.kategori_id) {
      fetchTypes(form.kategori_id);
    } else {
      setTypes([]); // Reset jika kategori tidak dipilih
      setForm({ ...form, jenis_id: "", subjenis_id: "" }); // Reset jenis dan subjenis
    }
  }, [form.kategori_id]);


  const fetchTypes = (kategori_id) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`http://localhost:5000/types`, { headers })
        .then((res) => {
            console.log(`Mengambil data jenis aset untuk kategori: ${kategori_id}`);
            console.log("Data jenis diterima:", res.data);

            // Filter hanya data yang sesuai dengan kategori_id yang dipilih
            const filteredTypes = res.data.filter(type => type.kategori_id == kategori_id);
            setTypes(filteredTypes);
        })
        .catch((err) => console.error("❌ Gagal mengambil jenis:", err));
};



    // 🔹 Ambil Sub-Jenis berdasarkan Jenis yang dipilih
    useEffect(() => {
    
      if (form.jenis_id) {
        fetchSubtypes(form.jenis_id);
        
      } else {
        setSubtypes([]); // Reset jika jenis tidak dipilih
        setForm({ ...form, subjenis_id: "" }); // Reset subjenis
      }
    }, [form.jenis_id]);

    const fetchSubtypes = (jenis_id) => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
    
      axios.get(`http://localhost:5000/subtypes?jenis_id=${jenis_id}`, { headers })
        .then((res) => {
          console.log("✅ Data sub-jenis diterima:", res.data);
    
          // Ambil hanya array data yang benar
          if (res.data && Array.isArray(res.data.data)) {
            const filteredSubtypes = res.data.data.filter(sub => sub.jenis_id == jenis_id);
            setSubtypes(filteredSubtypes);
            console.log("🔹 Subtypes setelah filter:", filteredSubtypes);
          } else {
            setSubtypes([]);
            console.log("⚠️ Tidak ada subjenis yang sesuai.");
          }
        })
        .catch((err) => {
          console.error("❌ Gagal mengambil sub-jenis:", err);
          setSubtypes([]);
        });
    };
    
    
    
    



    const handleAddAsset = async (event) => {
      event.preventDefault(); // ⛔ Mencegah form reload halaman
    
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Token tidak ditemukan di localStorage!");
        setError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }
    
      const headers = { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      };
    
      // ✅ Validasi agar tidak ada field kosong sebelum dikirim ke backend
      if (!form.kode_departemen || !form.kode_lokasi || !form.kategori_id || !form.jenis_id || !form.subjenis_id) {
        setError("❌ Semua field wajib diisi!");
        return;
      }
    
      try {
        // 🔹 Ambil kode dari pilihan user
        const kode_departemen = String(form.kode_departemen);
        const kode_lokasi = String(form.kode_lokasi);
        const kode_kategori = String(form.kategori_id);
        const kode_jenis = String(form.jenis_id);
        const kode_subjenis = String(form.subjenis_id);
    
        // 🔹 Generate nomor urut (biar unik bisa di-backend)
        const timestamp = new Date().getTime().toString().slice(-6); // Gunakan 6 digit terakhir timestamp
        const newKodeAsset = `${kode_departemen}${kode_lokasi}${kode_kategori}${kode_jenis}${kode_subjenis}${timestamp}`;
    
        const newAsset = { 
          kode_departemen, 
          kode_lokasi,
          kategori_id: kode_kategori,
          jenis_id: kode_jenis,
          subjenis_id: kode_subjenis,
          deskripsi: form.deskripsi.trim() !== "" ? form.deskripsi : null, 
          kode_asset: newKodeAsset
        };
    
        console.log("📡 Mengirim data aset:", newAsset);
        
        const response = await axios.post("http://localhost:5000/assets", newAsset, { headers });
        console.log("✅ Aset berhasil ditambahkan!", response.data);
    
        // 🔄 Refresh daftar aset setelah berhasil menambahkan
        fetchAssets();
    
        // 🔄 Tutup modal setelah data berhasil dikirim
        setShowAddAssetModal(false);
    
        // 🔄 Reset form setelah berhasil disimpan
        setForm({ 
          kode_departemen: "", 
          kode_lokasi: "", 
          kategori_id: "", 
          jenis_id: "", 
          subjenis_id: "", 
          deskripsi: "" 
        });
    
      } catch (err) {
        console.error("❌ Gagal menambah aset:", err);
        setError(`Gagal menambah aset: ${err.response?.data?.error || "Kesalahan server"}`);
      }
    };
    
    

    


    const handleDeleteAsset = async (id) => {
      const token = localStorage.getItem("token");
  
      if (!token) {
          console.error("❌ Token tidak ditemukan di localStorage!");
          setError("Token tidak ditemukan. Silakan login kembali.");
          return;
      }
  
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  
      try {
          console.log(`🗑 Mengubah status aset dengan ID: ${id} menjadi 'deleted'`);
          await axios.put(`http://localhost:5000/assets/${id}`, { status: "deleted" }, { headers });
  
          console.log("✅ Aset berhasil dihapus (status 'deleted')!");
          fetchAssets(); // 🔄 Refresh daftar aset
          setShowDeleteModal(false); // ✅ Tutup modal setelah sukses
      } catch (err) {
          console.error("❌ Gagal mengubah status aset:", err);
          setError(`Gagal mengubah status aset: ${err.response?.data?.error || "Kesalahan server"}`);
      }
  };
  
  const handleRestoreAsset = async (id) => {
      const token = localStorage.getItem("token");
  
      if (!token) {
          console.error("❌ Token tidak ditemukan di localStorage!");
          setError("Token tidak ditemukan. Silakan login kembali.");
          return;
      }
  
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  
      try {
          console.log(`♻️ Mengembalikan aset dengan ID: ${id} menjadi 'active'`);
          await axios.put(`http://localhost:5000/assets/${id}`, { status: "active" }, { headers });
  
          console.log("✅ Aset berhasil dikembalikan menjadi 'active'!");
          fetchAssets(); // 🔄 Refresh daftar aset
      } catch (err) {
          console.error("❌ Gagal mengembalikan aset:", err);
          setError(`Gagal mengembalikan aset: ${err.response?.data?.error || "Kesalahan server"}`);
      }
  };
  
    
    
    

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Aset</h2>

        {/* 🔹 Tombol Tambah Aset */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddAssetModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-md transition-all"
        >
          ➕ Tambah Aset
        </button>
      </div>

      {/* 🔹 MODAL FORM UNTUK TAMBAH ASET */}
{showAddAssetModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h3 className="text-lg font-semibold mb-4">Tambah Aset</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form className="grid grid-cols-1 gap-4">
{/* 🔹 Pilihan Departemen */}
<div>
  <label className="block text-sm font-medium text-gray-700">Departemen</label>
  <select
    className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    value={form.kode_departemen}
    onChange={(e) => {
      const selectedDept = departments.find(dept => dept.kode === e.target.value);
      console.log("📌 Departemen yang dipilih:", selectedDept); // 🔍 Log departemen yang dipilih
      setForm({ ...form, kode_departemen: e.target.value });
    }}
  >
    <option value="">Pilih Departemen</option>
    {departments.map((dept) => (
      <option key={dept.id} value={dept.kode}>{dept.nama_departments}</option>
    ))}
  </select>
</div>


{/* 🔹 Pilihan Lokasi */}
<div>
  <label className="block text-sm font-medium text-gray-700">Lokasi</label>
  <select
    className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    value={form.kode_lokasi}
    onChange={(e) => {
      const selectedLocation = locations.find(loc => loc.kode === e.target.value);
      console.log("📌 Lokasi yang dipilih:", selectedLocation);
      setForm({ ...form, kode_lokasi: e.target.value });
    }}
  >
    <option value="">Pilih Lokasi</option>
    {locations.map((loc) => (
      <option key={loc.id} value={loc.kode}>{loc.nama_lokasi}</option>
    ))}
  </select>
</div>


{/* 🔹 Pilihan Kategori */}
<div>
  <label className="block text-sm font-medium text-gray-700">Kategori</label>
  <select
    className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    value={form.kategori_id}
    onChange={(e) => {
      const selectedCategory = categories.find(cat => cat.id == e.target.value);
      console.log("📌 Kategori yang dipilih:", selectedCategory); // 🔍 Log kategori yang dipilih
      setForm({ ...form, kategori_id: e.target.value });
    }}
  >
    <option value="">Pilih Kategori</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
    ))}
  </select>
</div>


{/* 🔹 Pilihan Jenis */}
<div>
  <label className="block text-sm font-medium text-gray-700">Jenis</label>
  <select
    className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    value={form.jenis_id} // ✅ Simpan ID di dalam form
    onChange={(e) => {
      const selectedJenis = types.find(type => type.id == e.target.value);
      console.log("📌 Jenis yang dipilih:", selectedJenis); // 🔍 Log jenis yang dipilih
      setForm({ ...form, jenis_id: e.target.value }); // ✅ Simpan ID, bukan kode
    }}
    disabled={!form.kategori_id}
  >
    <option value="">Pilih Jenis</option>
    {types.map((type) => (
      <option key={type.id} value={type.id}>{type.nama_asset}</option> // ✅ Simpan ID di dalam value
    ))}
  </select>
</div>


{/* 🔹 Pilihan Sub-Jenis */}
<div>
  <label className="block text-sm font-medium text-gray-700">Subjenis</label>
  <select
    className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    value={form.subjenis_id}
    onChange={(e) => {
      const selectedSubJenis = subtypes.find(sub => sub.kode === e.target.value);
      console.log("📌 Sub-Jenis yang dipilih:", selectedSubJenis); // 🔍 Log sub-jenis yang dipilih
      setForm({ ...form, subjenis_id: e.target.value });
    }}
    disabled={!form.jenis_id || subtypes.length === 0}
  >
    <option value="">Pilih Subjenis</option>
    {subtypes.map((sub) => (
      <option key={sub.id} value={sub.kode}>{sub.nama_subaset}</option>
    ))}
  </select>
</div>



        {/* 🔹 Input Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <input
            type="text"
            className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            placeholder="Opsional..."
          />
        </div>

        {/* 🔹 Tombol Aksi */}
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => setShowAddAssetModal(false)}
          >
            Batal
          </button>
          <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleAddAsset} // 🔹 Pastikan tidak menggunakan () agar tidak auto-execute
        >
          Simpan
        </button>

        </div>
      </form>
    </div>
  </div>
)}

    

    
       {/* 🔹 TABEL DATA */}
       <div className="bg-white shadow-lg rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4 flex justify-between">
    Daftar Aset
    <button
      className={`px-4 py-2 rounded-lg text-white ${showDeletedAssets ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
      onClick={() => setShowDeletedAssets(!showDeletedAssets)}
    >
      {showDeletedAssets ? "🔄 Lihat Aset Aktif" : "🗑 Lihat Aset Terhapus"}
    </button>
  </h3>

  <div className="overflow-y-auto max-h-96">
    <table className="w-full border-collapse">
      <thead className="bg-blue-600 text-white">
        <tr>
          <th className="border px-4 py-3 text-left">Kode Aset</th>
          <th className="border px-4 py-3 text-center">QR Code</th>
          <th className="border px-4 py-3 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="bg-gray-50">
        {assets.length > 0 ? (
          assets.map(asset => (
            <tr key={asset.id} className="hover:bg-gray-200 transition-all">
              <td className="border px-4 py-3">{asset.kode_asset}</td>
              <td className="border px-4 py-3">
                <div className="flex justify-center items-center">
                  <QRCodeCanvas value={asset.kode_asset} size={60} />
                </div>
              </td>
              <td className="border px-4 py-3 text-center">
  {asset.status === "active" ? (
    <button
      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-all"
      onClick={() => {
        setSelectedAsset(asset);
        setShowDeleteModal(true);
      }}
    >
      🗑 Hapus
    </button>
  ) : (
    role === 1 && ( // ✅ Pastikan hanya admin bisa restore
      <button
        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-all"
        onClick={() => handleRestoreAsset(asset.id)}
      >
        ♻️ Restore
      </button>
    )
  )}
</td>

            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} className="text-center text-gray-500 py-4">
              ❌ Tidak ada data aset
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

 {/* 🔹 KONFIRMASI HAPUS */}
 {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-3">Konfirmasi Penghapusan</h3>
            <p className="mb-4">Apakah Anda yakin ingin menghapus aset ini?</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => handleDeleteAsset(selectedAsset.id)}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    
        {/* 🔹 PAGING */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg shadow hover:bg-gray-400 transition-all"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}>
            ⬅️ Prev
          </button>
    
          <span className="text-gray-700">Halaman {currentPage}</span>
    
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg shadow hover:bg-gray-400 transition-all"
            onClick={() => setCurrentPage(currentPage + 1)}>
            Next ➡️
          </button>
        </div>
      </div>
    );
    
}
