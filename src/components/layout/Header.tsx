"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { formatDateTime } from "@/lib/utils";

export default function Header({ session }: { session: any }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const namaLengkap = session?.user?.namaLengkap || session?.user?.name;
  const role = session?.user?.role;

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN_RM: "Admin Gudang RM",
    SUPERVISOR_PRODUKSI: "Supervisor Produksi",
    ADMIN_FG: "Admin Gudang FG",
    MANAGER: "Manager",
  };

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400">{formatDateTime(new Date())}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifikasi */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E8A020] rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-7 h-7 bg-[#0f1729] rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-none">
                {namaLengkap}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {roleLabel[role] || role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800">
                  {namaLengkap}
                </p>
                <p className="text-xs text-gray-400">{roleLabel[role]}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
