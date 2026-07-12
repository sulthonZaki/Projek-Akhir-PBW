"use client";

import { useEffect, useState } from "react";
import {
  Plus, Search, Edit, Trash2, KeyRound,
  UserCheck, UserX, RefreshCw, X, Eye, EyeOff
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type User = {
  id: number;
  username: string;
  namaLengkap: string;
  role: string;
  status: string;
  createdAt: string;
};

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_RM: "Admin Gudang RM",
  SUPERVISOR_PRODUKSI: "Supervisor Produksi",
  ADMIN_FG: "Admin Gudang FG",
  MANAGER: "Manager",
};

const roleBadge: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN_RM: "bg-blue-100 text-blue-700",
  SUPERVISOR_PRODUKSI: "bg-orange-100 text-orange-700",
  ADMIN_FG: "bg-green-100 text-green-700",
  MANAGER: "bg-gray-100 text-gray-700",
};

type ModalType = "create" | "edit" | "delete" | "reset-password" | null;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    username: "", namaLengkap: "", role: "", password: "", newPassword: "",
  });

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchUsers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterRole) params.set("role", filterRole);
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, [search, filterRole]);

  function openCreate() {
    setForm({ username: "", namaLengkap: "", role: "", password: "", newPassword: "" });
    setModal("create");
  }

  function openEdit(user: User) {
    setSelected(user);
    setForm({ username: user.username, namaLengkap: user.namaLengkap, role: user.role, password: "", newPassword: "" });
    setModal("edit");
  }

  function openDelete(user: User) { setSelected(user); setModal("delete"); }
  function openReset(user: User) { setSelected(user); setForm({ ...form, newPassword: "" }); setModal("reset-password"); }
  function closeModal() { setModal(null); setSelected(null); }

  async function handleCreate() {
    setSubmitting(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return showToast(data.error, "error");
    showToast("User berhasil dibuat");
    closeModal();
    fetchUsers();
  }

  async function handleEdit() {
    setSubmitting(true);
    const res = await fetch(`/api/users/${selected?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ namaLengkap: form.namaLengkap, role: form.role }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return showToast(data.error, "error");
    showToast("User berhasil diupdate");
    closeModal();
    fetchUsers();
  }

  async function handleToggleStatus(user: User) {
    const newStatus = user.status === "AKTIF" ? "NONAKTIF" : "AKTIF";
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast(`User ${newStatus === "AKTIF" ? "diaktifkan" : "dinonaktifkan"}`);
      fetchUsers();
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    const res = await fetch(`/api/users/${selected?.id}`, { method: "DELETE" });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return showToast(data.error, "error");
    showToast("User berhasil dihapus");
    closeModal();
    fetchUsers();
  }

  async function handleResetPassword() {
    setSubmitting(true);
    const res = await fetch(`/api/users/${selected?.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password", newPassword: form.newPassword || "admin123" }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return showToast(data.error, "error");
    showToast(data.message);
    closeModal();
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
          <button onClick={() => setToast(null)}><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1729]">Manajemen User</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua akun pengguna sistem</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#0f1729] hover:bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari username atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
        >
          <option value="">Semua Role</option>
          {Object.entries(roleLabel).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button onClick={fetchUsers} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dibuat</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Memuat data...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Tidak ada user ditemukan</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0f1729] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{user.namaLengkap.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.namaLengkap}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleBadge[user.role]}`}>
                    {roleLabel[user.role]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.status === "AKTIF" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleToggleStatus(user)} title={user.status === "AKTIF" ? "Nonaktifkan" : "Aktifkan"}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500">
                      {user.status === "AKTIF" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openReset(user)} title="Reset Password"
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500">
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(user)} title="Edit"
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDelete(user)} title="Hapus"
                      className="p-1.5 rounded-lg hover:bg-red-50 transition text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Create */}
      {modal === "create" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">Tambah User Baru</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Nama Lengkap</label>
                <input type="text" value={form.namaLengkap} onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Username</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" placeholder="username" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  <option value="">Pilih role</option>
                  {Object.entries(roleLabel).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" placeholder="Password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleCreate} disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#0f1729] text-white rounded-lg text-sm font-medium hover:bg-[#1a2744] transition disabled:opacity-60">
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {modal === "edit" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">Edit User</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Nama Lengkap</label>
                <input type="text" value={form.namaLengkap} onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Username</label>
                <input type="text" value={form.username} disabled
                  className="w-full px-3 py-2.5 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  {Object.entries(roleLabel).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleEdit} disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#0f1729] text-white rounded-lg text-sm font-medium hover:bg-[#1a2744] transition disabled:opacity-60">
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {modal === "reset-password" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">Reset Password</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Reset password untuk <span className="font-semibold text-gray-800">{selected?.namaLengkap}</span>.
              Kosongkan untuk gunakan password default <span className="font-mono bg-gray-100 px-1 rounded">admin123</span>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Password Baru</label>
              <input type="text" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="Kosongkan untuk default admin123"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleResetPassword} disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#E8A020] text-white rounded-lg text-sm font-medium hover:bg-[#d4911a] transition disabled:opacity-60">
                {submitting ? "Mereset..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {modal === "delete" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0f1729]">Hapus User</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Yakin ingin menghapus user <span className="font-semibold text-gray-800">{selected?.namaLengkap}</span>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleDelete} disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-60">
                {submitting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}