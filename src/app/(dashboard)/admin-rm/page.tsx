"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";
import Link from "next/link";

export default function AdminRMDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/admin-rm")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Memuat data...
        </div>
      </div>
    );

  const stats = [
    {
      label: "Jenis Bahan Baku",
      value: data?.totalJenisBahanBaku ?? 0,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "Transaksi Masuk",
      value: data?.transaksiMasuk ?? 0,
      icon: ArrowDown,
      color: "bg-green-50 text-green-600",
      border: "border-green-100",
    },
    {
      label: "Transaksi Keluar",
      value: data?.transaksiKeluar ?? 0,
      icon: ArrowUp,
      color: "bg-orange-50 text-orange-600",
      border: "border-orange-100",
    },
    {
      label: "Stok Rendah",
      value: data?.stokRendah ?? 0,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
      border: "border-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f1729]">
          Dashboard Gudang RM
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor stok dan transaksi bahan baku
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl border ${stat.border} p-4`}
            >
              <div
                className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-[#0f1729]">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Stok saat ini */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#E8A020]" />
              <h2 className="font-semibold text-[#0f1729] text-sm">
                Stok Bahan Baku
              </h2>
            </div>
            <Link
              href="/admin-rm/stok"
              className="text-xs text-[#E8A020] hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {data?.stokRM?.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Belum ada stok
              </p>
            )}
            {data?.stokRM?.slice(0, 5).map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2 border-b border-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {s.jenisBahanBaku.nama}
                  </p>
                  <p className="text-xs text-gray-400">{s.gudang.nama}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${s.jumlah <= s.jenisBahanBaku.stokMinimum ? "text-red-500" : "text-gray-800"}`}
                  >
                    {formatNumber(s.jumlah)} {s.jenisBahanBaku.satuan}
                  </p>
                  {s.jumlah <= s.jenisBahanBaku.stokMinimum && (
                    <p className="text-xs text-red-400">Stok rendah!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaksi terbaru */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E8A020]" />
              <h2 className="font-semibold text-[#0f1729] text-sm">
                Transaksi Terbaru
              </h2>
            </div>
            <Link
              href="/admin-rm/masuk"
              className="text-xs text-[#E8A020] hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentTransaksi?.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Belum ada transaksi
              </p>
            )}
            {data?.recentTransaksi?.map((t: any) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-2 border-b border-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t.jenisBahanBaku.nama}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(t.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${t.jenis === "MASUK" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                  >
                    {t.jenis}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatNumber(t.jumlah)} {t.satuan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert stok rendah */}
      {data?.stokRendahList?.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-red-700 text-sm">
              Peringatan Stok Rendah
            </h2>
          </div>
          <div className="space-y-2">
            {data.stokRendahList.map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5"
              >
                <p className="text-sm font-medium text-gray-800">
                  {s.jenisBahanBaku.nama}
                </p>
                <p className="text-sm text-red-500 font-semibold">
                  {formatNumber(s.jumlah)} / min.{" "}
                  {formatNumber(s.jenisBahanBaku.stokMinimum)}{" "}
                  {s.jenisBahanBaku.satuan}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
