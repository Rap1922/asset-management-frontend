import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Pastikan autoTable diimpor


export default function AssetReports() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  const [filters, setFilters] = useState({
    company: "",
    department: "",
    category: "",
    type: "",
  });

  const navigate = useNavigate();
  const limit = 5;

  useEffect(() => {
    fetchDropdownData();
  }, []); // ✅ Hanya dijalankan sekali untuk mengisi dropdown
  
  useEffect(() => {
    fetchAssets();
  }, [filters, page]); // ✅ Data akan di-refresh setiap kali filter atau page berubah
  


  // ✅ Ambil data aset berdasarkan filter
  const fetchAssets = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    try {
      console.log("📡 Fetching asset data...");
      console.log("🔹 Filter yang dikirim:", filters);

      const response = await axios.get(`http://localhost:5000/assets`, {
        headers,
        params: {
          company: filters.company || "",
          department: filters.department || "",
          category: filters.category || "",
          jenis_aset: filters.type || "",
          page,
          limit
        },
      });

      console.log("✅ Data laporan yang diterima:", response.data);
      setAssets(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("❌ Gagal mengambil data laporan aset:", err);
    }
};



  // ✅ Ambil data untuk dropdown
  const fetchDropdownData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [companiesRes, departmentsRes, categoriesRes, typesRes] = await Promise.all([
        axios.get("http://localhost:5000/companies", { headers }),
        axios.get("http://localhost:5000/departments", { headers }),
        axios.get("http://localhost:5000/categories", { headers }),
        axios.get("http://localhost:5000/types", { headers }),
      ]);

      setCompanies(companiesRes.data || []);
      setDepartments(departmentsRes.data || []);
      setCategories(categoriesRes.data || []);
      setTypes(typesRes.data || []);
    } catch (err) {
      console.error("❌ Gagal mengambil data dropdown:", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  

  // ✅ Export ke Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(assets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Aset");
    XLSX.writeFile(workbook, "Laporan_Aset.xlsx");
  };

  // ✅ Export ke PDF
const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Aset", 14, 15);

    autoTable(doc, {  // ✅ Gunakan autoTable sebagai fungsi mandiri
        head: [["Kode Aset", "Kode Perusahaan", "Nama Perusahaan", "Departemen", "Nama Lokasi", "Jenis Aset", "Sub Jenis Aset"]],
        body: assets.map((asset) => [
            asset.kode_asset,
            asset.kode_perusahaan,
            asset.nama_perusahaan || "Tidak ada data",
            asset.nama_departments || "Tidak ada data",
            asset.nama_lokasi || "Tidak ada data",
            asset.jenis_aset || "Tidak ada data",
            asset.sub_jenis_aset || "Tidak ada data",
        ]),
        startY: 20, // ✅ Pastikan tabel tidak menumpuk teks header
    });

    doc.save("Laporan_Aset.pdf");
};

  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 Laporan Aset</h2>

      {/* 🔹 Filter */}
      <div className="bg-white p-6 shadow-lg rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Filter Laporan</h3>
        <div className="grid grid-cols-4 gap-4">
          {/* Perusahaan */}
          <select
            className="p-3 border rounded-lg"
            value={filters.company}
            onChange={(e) => handleFilterChange("company", e.target.value)}
            >
            <option value="">📌 Pilih Perusahaan</option>
            {companies.map((company) => (
                <option key={company.id} value={company.id}>
                {company.nama_perusahaan}
                </option>
            ))}
            </select>


          {/* Departemen */}
          <select
            className="p-3 border rounded-lg"
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            >
            <option value="">🏢 Pilih Departemen</option>
            {departments.map((dept) => (
                <option key={dept.id} value={dept.kode}>
                {dept.nama_departments}
                </option>
            ))}
            </select>


          {/* Kategori */}
          <select
  className="p-3 border rounded-lg"
  value={filters.category}
  onChange={(e) => handleFilterChange("category", e.target.value)}
>
  <option value="">📂 Pilih Kategori</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.nama_kategori}
    </option>
  ))}
</select>


          {/* Jenis Aset */}
          <select
  className="p-3 border rounded-lg"
  value={filters.type}
  onChange={(e) => handleFilterChange("type", e.target.value)}
>
  <option value="">🔧 Pilih Jenis Aset</option>
  {types.map((type) => (
    <option key={type.id} value={type.id}>
      {type.nama_asset}
    </option>
  ))}
</select>

        </div>
      </div>

      {/* 🔹 TOMBOL EXPORT */}
      <div className="mb-4 flex space-x-4">
        <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          📊 Export ke Excel
        </button>
        <button onClick={exportToPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          📄 Export ke PDF
        </button>
      </div>

      {/* 🔹 TABEL DATA ASET */}
      <div className="bg-white p-5 shadow-md rounded-lg">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Daftar Aset</h3>
        <div className="overflow-y-auto max-h-96">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border px-5 py-3 text-left">Kode Aset</th>
                <th className="border px-5 py-3 text-left">Kode Perusahaan</th>
                <th className="border px-5 py-3 text-left">Nama Perusahaan</th>
                <th className="border px-5 py-3 text-left">Departemen</th>
                <th className="border px-5 py-3 text-left">Nama Lokasi</th>
                <th className="border px-5 py-3 text-left">Jenis Aset</th>
                <th className="border px-5 py-3 text-left">Sub Jenis Aset</th>
              </tr>
            </thead>
            <tbody>
              {assets.length > 0 ? assets.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-100 transition-all">
                  <td className="border px-5 py-3">{asset.kode_asset}</td>
                  <td className="border px-5 py-3">{asset.kode_perusahaan}</td>
                  <td className="border px-5 py-3">{asset.nama_perusahaan}</td>
                  <td className="border px-5 py-3">{asset.nama_departments}</td>
                  <td className="border px-5 py-3">{asset.nama_lokasi}</td>
                  <td className="border px-5 py-3">{asset.jenis_aset}</td>
                  <td className="border px-5 py-3">{asset.sub_jenis_aset}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">❌ Tidak ada aset ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
