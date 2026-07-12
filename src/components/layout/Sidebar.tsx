"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Factory,
  BoxesIcon,
  Users,
  Settings,
  Database,
  ClipboardList,
  TrendingUp,
  CheckSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

type Role =
  | "SUPER_ADMIN"
  | "ADMIN_RM"
  | "SUPERVISOR_PRODUKSI"
  | "ADMIN_FG"
  | "MANAGER";

const menuByRole: Record<Role, { label: string; href: string; icon: any }[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { label: "Manajemen User", href: "/super-admin/users", icon: Users },
    { label: "Master Data", href: "/super-admin/master-data", icon: Database },
    { label: "Audit Log", href: "/super-admin/audit-log", icon: FileText },
    { label: "Pengaturan", href: "/super-admin/settings", icon: Settings },
  ],
  ADMIN_RM: [
    { label: "Dashboard", href: "/admin-rm", icon: LayoutDashboard },
    { label: "Stok Bahan Baku", href: "/admin-rm/stok", icon: Package },
    { label: "Barang Masuk", href: "/admin-rm/masuk", icon: ClipboardList },
    { label: "Barang Keluar", href: "/admin-rm/keluar", icon: ClipboardList },
    { label: "Laporan", href: "/admin-rm/laporan", icon: FileText },
  ],
  SUPERVISOR_PRODUKSI: [
    { label: "Dashboard", href: "/supervisor-produksi", icon: LayoutDashboard },
    {
      label: "Input Produksi",
      href: "/supervisor-produksi/input",
      icon: Factory,
    },
    {
      label: "Riwayat Produksi",
      href: "/supervisor-produksi/riwayat",
      icon: ClipboardList,
    },
    { label: "Laporan", href: "/supervisor-produksi/laporan", icon: FileText },
  ],
  ADMIN_FG: [
    { label: "Dashboard", href: "/admin-fg", icon: LayoutDashboard },
    { label: "Stok Semen", href: "/admin-fg/stok", icon: BoxesIcon },
    { label: "Barang Masuk", href: "/admin-fg/masuk", icon: ClipboardList },
    { label: "Barang Keluar", href: "/admin-fg/keluar", icon: ClipboardList },
    { label: "Surat Jalan", href: "/admin-fg/surat-jalan", icon: FileText },
    { label: "Laporan", href: "/admin-fg/laporan", icon: FileText },
  ],
  MANAGER: [
    { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { label: "Approval", href: "/manager/approval", icon: CheckSquare },
    { label: "Analitik", href: "/manager/analitik", icon: TrendingUp },
    { label: "Laporan", href: "/manager/laporan", icon: FileText },
  ],
};

const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_RM: "Admin Gudang RM",
  SUPERVISOR_PRODUKSI: "Supervisor Produksi",
  ADMIN_FG: "Admin Gudang FG",
  MANAGER: "Manager",
};

export default function Sidebar({
  role,
  namaLengkap,
}: {
  role: Role;
  namaLengkap: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const menus = menuByRole[role] || [];

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-[#0f1729] transition-all duration-300 min-h-screen",
        collapsed ? "w-[70px]" : "w-[240px]",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-white/10",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="w-8 h-8 bg-[#E8A020] rounded-lg flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-base">
            Cem<span className="text-[#E8A020]">Track</span>
          </span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-gray-400 text-xs truncate">{namaLengkap}</p>
          <span className="inline-block mt-1 bg-[#E8A020]/20 text-[#E8A020] text-xs px-2 py-0.5 rounded">
            {roleLabel[role]}
          </span>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive =
            pathname === menu.href ||
            (menu.href !== `/${role.toLowerCase().replace("_", "-")}` &&
              pathname.startsWith(menu.href));

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-[#E8A020] text-white font-medium"
                  : "text-gray-400 hover:bg-white/10 hover:text-white",
              )}
              title={collapsed ? menu.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{menu.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-[#E8A020] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#d4911a] transition z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
