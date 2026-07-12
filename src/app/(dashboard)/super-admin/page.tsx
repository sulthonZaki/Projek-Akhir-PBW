"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Package,
  Factory,
  BoxesIcon,
  Activity,
  TrendingUp,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type DashboardData = {
  totalUser: number;
  userAktif: number;
  userNonaktif: number;
  totalTransaksiRM: number;
  totalTransaksiFG: number;
  totalProduksi: number;
  recentLogs: any[];
  userByRole: any[];
};

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_RM: "Admin Gudang RM",
  SUPERVISOR_PRODUKSI: "Supervisor Produksi",
  ADMIN_FG: "Admin Gudang FG",
  MANAGER: "Manager",
};

const roleBadgeColor: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN_RM: "bg-blue-100 text-blue-700",
  SUPERVISOR_PRODUKSI: "bg-orange-100 text-orange-700",
  ADMIN_FG: "bg-green-100 text-green-700",
  MANAGER: "bg-gray-100 text-gray-700",
};

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/super-admin")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
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
  }

  const stats = [
    {
      label: "Total User",
      value: data?.totalUser ?? 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "User Aktif",
      value: data?.userAktif ?? 0,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
      border: "border-green-100",
    },
    {
      label: "User Nonaktif",
      value: data?.userNonaktif ?? 0,
      icon: UserX,
      color: "bg-red-50 text-red-600",
      border: "border-red-100",
    },
    {
      label: "Transaksi RM",
      value: data?.totalTransaksiRM ?? 0,
      icon: Package,
      color: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Batch Produksi",
      value: data?.totalProduksi ?? 0,
      icon: Factory,
      color: "bg-orange-50 text-orange-600",
      border: "border-orange-100",
    },
    {
      label: "Transaksi FG",
      value: data?.totalTransaksiFG ?? 0,
      icon: BoxesIcon,
      color: "bg-purple-50 text-purple-600",
      border: "border-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f1729]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan seluruh aktivitas sistem CemTrack
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl border ${stat.border} p-4`}
            >
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-[#0f1729]">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Aktivitas terbaru */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#E8A020]" />
            <h2 className="font-semibold text-[#0f1729] text-sm">
              Aktivitas Terbaru
            </h2>
          </div>
          <div className="space-y-3">
            {data?.recentLogs.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">
                Belum ada aktivitas
              </p>
            )}
            {data?.recentLogs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-[#0f1729] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">
                    {log.user.namaLengkap.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">
                    <span className="font-medium">{log.user.namaLengkap}</span>{" "}
                    — {log.deskripsi}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${roleBadgeColor[log.user.role]}`}>
                  {log.aksi}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User per role */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#E8A020]" />
            <h2 className="font-semibold text-[#0f1729] text-sm">
              Distribusi Role
            </h2>
          </div>
          <div className="space-y-3">
            {data?.userByRole.map((item: any) => (
              <div key={item.role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${roleBadgeColor[item.role]}`}>
                    {roleLabel[item.role]}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#0f1729]">
                  {item._count.role}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Total user terdaftar</p>
            <p className="text-3xl font-bold text-[#0f1729]">
              {data?.totalUser}
            </p>
            <div className="flex gap-3 mt-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                <span className="text-xs text-gray-500">{data?.userAktif} aktif</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                <span className="text-xs text-gray-500">{data?.userNonaktif} nonaktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}