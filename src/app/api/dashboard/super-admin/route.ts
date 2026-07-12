import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalUser,
    userAktif,
    totalTransaksiRM,
    totalTransaksiFG,
    totalProduksi,
    recentLogs,
    userByRole,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "AKTIF" } }),
    prisma.transaksiRM.count(),
    prisma.transaksiFG.count(),
    prisma.produksi.count(),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { namaLengkap: true, role: true } } },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
  ]);

  return NextResponse.json({
    totalUser,
    userAktif,
    userNonaktif: totalUser - userAktif,
    totalTransaksiRM,
    totalTransaksiFG,
    totalProduksi,
    recentLogs,
    userByRole,
  });
}