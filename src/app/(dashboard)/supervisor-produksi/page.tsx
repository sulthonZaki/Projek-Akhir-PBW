"use client";

import { useEffect, useState } from "react";
import { Factory, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function SupervisorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/supervisor")
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
    { label: "Draft", value: data?.draft ?? 0, icon: AlertCircle, color: "bg-gray-50 text-gray-600", border: "border-gray-100" },
    { label: "Menunggu Approval", value: data?.menungguApproval ?? 0, icon: Clock, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    { label: "Disetujui", value: data?.disetujui ?? 0, icon: CheckCircle, color: "bg-green-50 text-green-600", border: "border-green-100" },
    { label: "Ditolak", value: data?.ditolak ?? 0, icon: XCircle, color: "bg-red-50 text-red-600", border: "border-red-100" },
  ];

  const statusBadge: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    MENUNGGU_APPROVAL: "bg-amber-100 text-amber-700",
    DISETUJUI: "bg-green-100 text-green-700",
    DITOLAK: "bg-red-100 text-red-700",
  };

  const statusLabel: Record<string, string> = {
    DRAFT: "Draft",
    MENUNGGU_APPROVAL: "Menunggu Approval",
    DISETUJUI: "Disetujui",
    DITOLAK: "Ditolak",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1729]">Dashboard Produksi</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor dan kelola proses produksi semen</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
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

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-[#E8A020]" />
            <h2 className="font-semibold text-[#0f1729] text-sm">Produksi Terbaru</h2>
          </div>
          <Link href="/supervisor-produksi/riwayat" className="text-xs text-[#E8A020] hover:underline">Lihat semua</Link>
        </div>
        <div className="space-y-3">
          {data?.recentProduksi?.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">Belum ada data produksi</p>
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
                  <p className="text-xs text-gray-400 mt-0.5">{p.totalOutputKg.toLocaleString()} kg output</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0f1729] rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">Siap input produksi hari ini?</p>
          <p className="text-gray-400 text-sm mt-0.5">Catat pemakaian bahan baku dan hasil produksi</p>
        </div>
        <Link href="/supervisor-produksi/input"
          className="bg-[#E8A020] hover:bg-[#d4911a] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
          Input Produksi
        </Link>
      </div>
    </div>
  );
}