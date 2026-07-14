"use client";

import { useEffect, useState } from "react";
import {
  Factory, Clock, CheckCircle, XCircle,
  Package, BoxesIcon, TrendingUp, AlertCircle
} from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";
import Link from "next/link";

export default function ManagerDashboard() {
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

  const stats = [
    { label: "Total Produksi", value: data?.totalProduksi ?? 0, icon: Factory, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    { label: "Menunggu Approval", value: data?.menungguApproval ?? 0, icon: Clock, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    { label: "Disetujui", value: data?.produksiDisetujui ?? 0, icon: CheckCircle, color: "bg-green-50 text-green-600", border: "border-green-100" },
    { label: "Ditolak", value: data?.produksiDitolak ?? 0, icon: XCircle, color: "bg-red-50 text-red-600", border: "border-red-100" },
    { label: "Transaksi RM", value: data?.totalTransaksiRM ?? 0, icon: Package, color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
    { label: "Transaksi FG", value: data?.totalTransaksiFG ?? 0, icon: BoxesIcon, color: "bg-orange-50 text-orange-600", border: "border-orange-100" },
  ];

  const statusBadge: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    MENUNGGU_APPROVAL: "bg-amber-100 text-amber-700",
    DISETUJUI: "bg-green-100 text-green-700",
    DITOLAK: "bg-red-100 text-red-700",
  };

  const statusLabel: Record<string, string> = {
    DRAFT: "Draft",
    MENUNGGU_APPROVAL: "Menunggu",
    DISETUJUI: "Disetujui",
    DITOLAK: "Ditolak",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1729]">Dashboard Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan seluruh operasional gudang dan produksi</p>
      </div>

      {/* Alert menunggu approval */}
      {data?.menungguApproval > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Ada {data.menungguApproval} produksi menunggu persetujuan kamu
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Segera review dan berikan keputusan</p>
            </div>
          </div>
          <Link href="/manager/approval"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex-shrink-0">
            Review Sekarang
          </Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`bg-white rounded-xl border ${stat.border} p-4`}>
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-[#0f1729]">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Stok RM ringkasan */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#E8A020]" />
              <h2 className="font-semibold text-[#0f1729] text-sm">Stok Bahan Baku</h2>
            </div>
          </div>
          <div className="space-y-2">
            {data?.stokRM?.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada stok</p>
            )}
            {data?.stokRM?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.jenisBahanBaku.nama}</p>
                  <p className="text-xs text-gray-400">{s.gudang.nama}</p>
                </div>
                <p className={`text-sm font-semibold ${s.jumlah <= s.jenisBahanBaku.stokMinimum ? "text-red-500" : "text-gray-800"}`}>
                  {formatNumber(s.jumlah)} {s.jenisBahanBaku.satuan}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stok FG ringkasan */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BoxesIcon className="w-4 h-4 text-[#E8A020]" />
              <h2 className="font-semibold text-[#0f1729] text-sm">Stok Semen</h2>
            </div>
          </div>
          <div className="space-y-2">
            {data?.stokFG?.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada stok</p>
            )}
            {data?.stokFG?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.jenisSemen.nama}</p>
                  <p className="text-xs text-gray-400">{s.gudang.nama}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {formatNumber(s.jumlah)} {s.jenisSemen.kemasan === "CURAH" ? "TON" : "SAK"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Produksi terbaru */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#E8A020]" />
            <h2 className="font-semibold text-[#0f1729] text-sm">Produksi Terbaru</h2>
          </div>
          <Link href="/manager/approval" className="text-xs text-[#E8A020] hover:underline">Lihat semua</Link>
        </div>
        <div className="space-y-3">
          {data?.recentProduksi?.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada data produksi</p>
          )}
          {data?.recentProduksi?.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">{p.nomorBatch}</p>
                <p className="text-xs text-gray-400">{formatDateTime(p.tanggalMulai)} · {p.user.namaLengkap}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusBadge[p.status]}`}>
                  {statusLabel[p.status]}
                </span>
                {p.totalOutputKg && (
                  <p className="text-xs text-gray-400 mt-0.5">{formatNumber(p.totalOutputKg)} kg</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}