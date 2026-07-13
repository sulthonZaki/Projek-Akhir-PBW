"use client";

import { useEffect, useState } from "react";
import { Package, AlertTriangle, RefreshCw } from "lucide-react";
import { formatNumber, formatDateTime } from "@/lib/utils";

export default function StokRMPage() {
  const [stok, setStok] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchStok() {
    setLoading(true);
    const res = await fetch("/api/rm/stok");
    const data = await res.json();
    setStok(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchStok();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1729]">Stok Bahan Baku</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kondisi stok real-time semua bahan baku
          </p>
        </div>
        <button
          onClick={fetchStok}
          className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Bahan Baku
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Gudang
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Stok
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Min. Stok
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Update Terakhir
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
            ) : stok.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  Belum ada data stok
                </td>
              </tr>
            ) : (
              stok.map((s: any) => (
                <tr
                  key={s.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition ${s.isLow ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.isLow ? "bg-red-100" : "bg-blue-50"}`}
                      >
                        <Package
                          className={`w-3.5 h-3.5 ${s.isLow ? "text-red-500" : "text-blue-500"}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {s.jenisBahanBaku.nama}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {s.jenisBahanBaku.kode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {s.gudang.nama}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-sm font-semibold ${s.isLow ? "text-red-500" : "text-gray-800"}`}
                    >
                      {formatNumber(s.jumlah)} {s.jenisBahanBaku.satuan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {formatNumber(s.jenisBahanBaku.stokMinimum)}{" "}
                    {s.jenisBahanBaku.satuan}
                  </td>
                  <td className="px-5 py-3">
                    {s.isLow ? (
                      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full w-fit">
                        <AlertTriangle className="w-3 h-3" /> Stok Rendah
                      </span>
                    ) : (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {formatDateTime(s.updatedAt)}
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
