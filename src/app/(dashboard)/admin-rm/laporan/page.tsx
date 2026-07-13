"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function LaporanRMPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState({
    dari: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    sampai: new Date().toISOString().split("T")[0],
  });

  async function fetchLaporan() {
    setLoading(true);
    const res = await fetch(
      `/api/rm/transaksi?dari=${periode.dari}&sampai=${periode.sampai}`,
    );
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    fetchLaporan();
  }, []);

  const totalMasuk =
    data?.transaksi
      ?.filter((t: any) => t.jenis === "MASUK")
      .reduce((sum: number, t: any) => sum + t.jumlah, 0) || 0;
  const totalKeluar =
    data?.transaksi
      ?.filter((t: any) => t.jenis === "KELUAR")
      .reduce((sum: number, t: any) => sum + t.jumlah, 0) || 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1729]">
            Laporan Gudang RM
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Rekap transaksi bahan baku per periode
          </p>
        </div>
      </div>

      {/* Filter periode */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={periode.dari}
            onChange={(e) => setPeriode({ ...periode, dari: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={periode.sampai}
            onChange={(e) => setPeriode({ ...periode, sampai: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
          />
        </div>
        <button
          onClick={fetchLaporan}
          className="flex items-center gap-2 bg-[#0f1729] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2744] transition"
        >
          <RefreshCw className="w-4 h-4" /> Tampilkan
        </button>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
      >
        <div className="bg-white rounded-xl border border-green-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Masuk</p>
          <p className="text-2xl font-bold text-green-600">
            {formatNumber(totalMasuk)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">berbagai satuan</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Keluar</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatNumber(totalKeluar)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">berbagai satuan</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Transaksi</p>
          <p className="text-2xl font-bold text-blue-600">{data?.total || 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">transaksi</p>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <FileText className="w-4 h-4 text-[#E8A020]" />
          <h2 className="font-semibold text-[#0f1729] text-sm">
            Detail Transaksi
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                No. Dokumen
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Tanggal
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Jenis
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Bahan Baku
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Jumlah
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                User
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  Memuat data...
                </td>
              </tr>
            ) : data?.transaksi?.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  Tidak ada transaksi pada periode ini
                </td>
              </tr>
            ) : (
              data?.transaksi?.map((t: any) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-3 text-sm font-mono text-gray-600">
                    {t.nomorDokumen}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {formatDateTime(t.tanggal)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${t.jenis === "MASUK" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {t.jenis}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">
                    {t.jenisBahanBaku.nama}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-800">
                    {formatNumber(t.jumlah)} {t.satuan}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {t.user.namaLengkap}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
