import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/library"; // 🔥 Tambahkan BarcodeFormat
import axios from "axios";
import { FiCamera, FiSearch, FiXCircle } from "react-icons/fi";

export default function ScanAsset() {
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState(""); // 🔥 Simpan kode yang discan
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const selectedCameraRef = useRef(null);

  // ✅ Mulai Scan Saat Tombol Diklik
  const startScanner = () => {
    setIsScanning(true);
    setScannedCode(""); // 🔥 Reset barcode sebelumnya
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    codeReader
      .listVideoInputDevices()
      .then((videoDevices) => {
        if (videoDevices.length === 0) {
          setError("❌ Kamera tidak ditemukan!");
          return;
        }

        let selectedDeviceId;
        if (selectedCameraRef.current) {
          selectedDeviceId = selectedCameraRef.current;
        } else {
          let backCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes("back") || 
            device.label.toLowerCase().includes("environment")
          );

          selectedDeviceId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;
          selectedCameraRef.current = selectedDeviceId;
        }

        // ✅ Pilih format barcode yang didukung
        const formats = [
          BarcodeFormat.QR_CODE, 
          BarcodeFormat.CODE_128, 
          BarcodeFormat.CODE_39, 
          BarcodeFormat.EAN_13,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E
        ];

        codeReader.decodeFromVideoDevice(
          selectedDeviceId, 
          videoRef.current, 
          (result, err) => {
            if (result) {
              const scannedText = result.getText();
              console.log("✅ Barcode scanned:", scannedText);
              setScannedCode(scannedText); // 🔥 Simpan barcode untuk ditampilkan di popup
              fetchAssetDetail(scannedText);
              stopScanner();
            }
            if (err) {
              console.warn("⚠ QR Code error:", err);
            }
          },
          { formats } // 🔥 Pilih format barcode
        );
      })
      .catch((err) => {
        console.error("❌ Kamera Error:", err);
        setError("❌ Tidak dapat mengakses kamera.");
      });
  };

  // ✅ Hentikan Scanner
  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      setIsScanning(false);
    }
  };

  // ✅ Fetch data aset berdasarkan kode
  const fetchAssetDetail = async (kodeAsset) => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ Anda tidak memiliki izin untuk melihat aset ini.");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Fetching:", kodeAsset);
      const response = await axios.get(
        `https://asset-management-backend-production.up.railway.app/assets/${kodeAsset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ API Response:", response.data);
      setScanResult(response.data);
    } catch (err) {
      console.error("❌ API Error:", err);
      setError("❌ Aset tidak ditemukan atau tidak aktif.");
      setScanResult(null);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📡 Scan Barcode / QR Code Aset</h2>

      {/* 🔹 BUTTON START SCANNER */}
      <button
        className={`px-4 py-2 mb-4 ${isScanning ? "bg-red-600" : "bg-blue-600"} text-white rounded-lg`}
        onClick={isScanning ? stopScanner : startScanner}
      >
        {isScanning ? "🛑 Stop Scan" : "📸 Mulai Scan"}
      </button>

      {/* 🔹 VIDEO SCANNER */}
      {isScanning && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiCamera className="mr-2" /> Arahkan Kamera ke Barcode / QR Code
          </h3>
          <video ref={videoRef} className="w-full border rounded-lg overflow-hidden"></video>
        </div>
      )}

      {/* 🔹 POPUP HASIL SCAN */}
      {scannedCode && (
        <div className="fixed top-5 right-5 bg-white shadow-lg p-4 rounded-lg border">
          <h3 className="text-md font-semibold">✅ Barcode Terbaca</h3>
          <p className="text-lg font-bold text-blue-600">{scannedCode}</p>
        </div>
      )}

      {/* 🔹 INPUT MANUAL */}
      <div className="mt-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <FiSearch className="mr-2" /> Masukkan Kode Aset
        </h3>
        <div className="flex">
          <input
            type="text"
            placeholder="Masukkan kode aset..."
            className="p-3 border rounded-l-lg flex-grow"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchAssetDetail(manualCode);
                setManualCode(""); 
              }
            }}
          />
          <button
            className="px-4 bg-blue-600 text-white rounded-r-lg"
            onClick={() => {
              fetchAssetDetail(manualCode);
              setManualCode(""); 
            }}
          >
            🔍 Cari
          </button>
        </div>
      </div>

      {/* 🔹 ERROR MESSAGE */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg flex items-center">
          <FiXCircle className="mr-2" /> {error}
        </div>
      )}

      {/* 🔹 HASIL SCAN / DETAIL ASET */}
      {scanResult && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-3">📋 Detail Aset</h3>
          <p><strong>Kode Aset:</strong> {scanResult.kode_asset}</p>
          <p><strong>Perusahaan:</strong> {scanResult.nama_perusahaan}</p>
          <p><strong>Departemen:</strong> {scanResult.nama_departments}</p>
          <p><strong>Lokasi:</strong> {scanResult.nama_lokasi}</p>
          <p><strong>Jenis Aset:</strong> {scanResult.jenis_aset}</p>
          <p><strong>Sub Jenis Aset:</strong> {scanResult.sub_jenis_aset}</p>
        </div>
      )}
    </div>
  );
}
