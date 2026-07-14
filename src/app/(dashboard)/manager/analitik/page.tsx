"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Package, BoxesIcon, Factory } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AnalitikPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/manager")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-400">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Memuat data...
      </div>
    </div>
  );

  const approvalRate = data?.totalProduksi > 0
    ? Math.round((data.produksiDisetujui / data.totalProduksi) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1729]">Analitik</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan performa operasional pabrik</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        <div className="bg-white rounded-xl border border-blue-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Factory className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase">Approval Rate</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">{approvalRate}%</p>
          <p className="text-xs text-gray-400 mt-1">dari {data?.totalProduksi} total batch</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${approvalRate}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-green-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-green-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Stok RM</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatNumber(data?.stokRM?.reduce((sum: number, s: any) => sum + s.jumlah, 0) || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{data?.stokRM?.length || 0} jenis bahan baku</p>
        </div>

        <div className="bg-white rounded-xl border border-orange-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <BoxesIcon className="w-4 h-4 text-orange-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Stok FG</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {formatNumber(data?.stokFG?.reduce((sum: number, s: any) => sum + s.jumlah, 0) || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{data?.stokFG?.length || 0} jenis semen</p>
        </div>
      </div>

      {/* Breakdown produksi */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-[#E8A020]" />
          <h2 className="font-semibold text-[#0f1729] text-sm">Status Produksi</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Disetujui", value: data?.produksiDisetujui || 0, color: "bg-green-500", total: data?.totalProduksi },
            { label: "Ditolak", value: data?.produksiDitolak || 0, color: "bg-red-500", total: data?.totalProduksi },
            { label: "Menunggu", value: data?.menungguApproval || 0, color: "bg-amber-500", total: data?.totalProduksi },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800">{item.value}</p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all`}
                  style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stok detail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-[#E8A020]" />
            <h2 className="font-semibold text-[#0f1729] text-sm">Detail Stok RM</h2>
          </div>
          <div className="space-y-2">
            {data?.stokRM?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Belum ada stok</p>}
            {data?.stokRM?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.jenisBahanBaku.nama}</p>
                  <p className="text-xs text-gray-400">{s.gudang.nama}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${s.jumlah <= s.jenisBahanBaku.stokMinimum ? "text-red-500" : "text-gray-800"}`}>
                    {formatNumber(s.jumlah)} {s.jenisBahanBaku.satuan}
                  </p>
                  {s.jumlah <= s.jenisBahanBaku.stokMinimum && (
                    <p className="text-xs text-red-400">Stok rendah</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BoxesIcon className="w-4 h-4 text-[#E8A020]" />
            <h2 className="font-semibold text-[#0f1729] text-sm">Detail Stok FG</h2>
          </div>
          <div className="space-y-2">
            {data?.stokFG?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Belum ada stok</p>}
            {data?.stokFG?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.jenisSemen.nama}</p>
                  <p className="text-xs text-gray-400">{s.gudang.nama} · {s.jenisSemen.kemasan.replace("_", " ")}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {formatNumber(s.jumlah)} {s.jenisSemen.kemasan === "CURAH" ? "TON" : "SAK"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}