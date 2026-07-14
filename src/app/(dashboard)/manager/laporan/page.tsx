"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function LaporanManagerPage() {
  const [produksi, setProduksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState({
    dari: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    sampai: new Date().toISOString().split("T")[0],
  });

  async function fetchLaporan() {
    setLoading(true);
    const res = await fetch("/api/manager/approval?status=");
    const data = await res.json();
    setProduksi(data);
    setLoading(false);
  }

  useEffect(() => { fetchLaporan(); }, []);

  const totalOutput = produksi
    .filter((p) => p.status === "DISETUJUI")
    .reduce((sum, p) => sum + (p.totalOutputKg || 0), 0);

  const avgEfisiensi = produksi.filter((p) => p.efisiensi).length > 0
    ? produksi.filter((p) => p.efisiensi).reduce((sum, p) => sum + p.efisiensi, 0) / produksi.filter((p) => p.efisiensi).length
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1729]">Laporan</h1>
        <p className="text-gray-500 text-sm mt-1">Rekap seluruh aktivitas produksi dan gudang</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Dari Tanggal</label>
          <input type="date" value={periode.dari} onChange={(e) => setPeriode({ ...periode, dari: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Sampai Tanggal</label>
          <input type="date" value={periode.sampai} onChange={(e) => setPeriode({ ...periode, sampai: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
        </div>
        <button onClick={fetchLaporan} className="flex items-center gap-2 bg-[#0f1729] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2744] transition">
          <RefreshCw className="w-4 h-4" /> Tampilkan
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Batch</p>
          <p className="text-2xl font-bold text-blue-600">{produksi.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Output Disetujui</p>
          <p className="text-2xl font-bold text-green-600">{formatNumber(Math.round(totalOutput))} kg</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Rata-rata Efisiensi</p>
          <p className="text-2xl font-bold text-amber-600">{avgEfisiensi.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <FileText className="w-4 h-4 text-[#E8A020]" />
          <h2 className="font-semibold text-[#0f1729] text-sm">Detail Semua Produksi</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">No. Batch</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Supervisor</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Output</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Efisiensi</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Memuat data...</td></tr>
            ) : produksi.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Tidak ada data produksi</td></tr>
            ) : produksi.map((p: any) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3 text-sm font-mono text-gray-600">{p.nomorBatch}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(p.tanggalMulai)}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{p.user.namaLengkap}</td>
                <td className="px-5 py-3 text-sm text-gray-800">{p.totalOutputKg ? `${formatNumber(p.totalOutputKg)} kg` : "-"}</td>
                <td className="px-5 py-3 text-sm text-gray-800">{p.efisiensi ? `${p.efisiensi}%` : "-"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    p.status === "DISETUJUI" ? "bg-green-100 text-green-700" :
                    p.status === "DITOLAK" ? "bg-red-100 text-red-700" :
                    p.status === "MENUNGGU_APPROVAL" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{p.status.replace(/_/g, " ")}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}