import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stokFG, transaksiMasuk, transaksiKeluar, recentTransaksi] =
    await Promise.all([
      prisma.stokFG.findMany({
        include: { jenisSemen: true, gudang: true },
      }),
      prisma.transaksiFG.count({ where: { jenis: "MASUK" } }),
      prisma.transaksiFG.count({ where: { jenis: "KELUAR" } }),
      prisma.transaksiFG.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { jenisSemen: true, customer: true },
      }),
    ]);

  return NextResponse.json({
    totalJenisSemen: stokFG.length,
    transaksiMasuk,
    transaksiKeluar,
    stokFG,
    recentTransaksi,
  });
}