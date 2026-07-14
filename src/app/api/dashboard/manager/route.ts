import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalProduksi,
    menungguApproval,
    totalTransaksiRM,
    totalTransaksiFG,
    stokRM,
    stokFG,
    recentProduksi,
    produksiDisetujui,
    produksiDitolak,
  ] = await Promise.all([
    prisma.produksi.count(),
    prisma.produksi.count({ where: { status: "MENUNGGU_APPROVAL" } }),
    prisma.transaksiRM.count(),
    prisma.transaksiFG.count(),
    prisma.stokRM.findMany({ include: { jenisBahanBaku: true, gudang: true } }),
    prisma.stokFG.findMany({ include: { jenisSemen: true, gudang: true } }),
    prisma.produksi.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { namaLengkap: true } },
        detailFG: { include: { jenisSemen: true } },
        approval: true,
      },
    }),
    prisma.produksi.count({ where: { status: "DISETUJUI" } }),
    prisma.produksi.count({ where: { status: "DITOLAK" } }),
  ]);

  return NextResponse.json({
    totalProduksi,
    menungguApproval,
    produksiDisetujui,
    produksiDitolak,
    totalTransaksiRM,
    totalTransaksiFG,
    stokRM,
    stokFG,
    recentProduksi,
  });
}