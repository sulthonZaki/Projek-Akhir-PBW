import { auth } from "@/lib/auth";

export default async function SuperAdminPage() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0f1729] mb-1">
        Dashboard Super Admin
      </h1>
      <p className="text-gray-500 text-sm">
        Selamat datang, {(session?.user as any)?.namaLengkap}
      </p>
    </div>
  );
}
