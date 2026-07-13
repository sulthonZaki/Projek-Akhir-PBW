import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stokRM, transaksiMasuk, transaksiKeluar, stokRendah] = await Promise.all([
    prisma.stokRM.findMany({
      include: { jenisBahanBaku: true, gudang: true },
    }),
    prisma.transaksiRM.count({ where: { jenis: "MASUK" } }),
    prisma.transaksiRM.count({ where: { jenis: "KELUAR" } }),
    prisma.stokRM.findMany({
      where: {
        jenisBahanBaku: { stokMinimum: { gt: 0 } },
      },
      include: { jenisBahanBaku: true, gudang: true },
    }),
  ]);

  const stokRendahFiltered = stokRendah.filter(
    (s) => s.jumlah <= s.jenisBahanBaku.stokMinimum
  );

  const recentTransaksi = await prisma.transaksiRM.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { jenisBahanBaku: true, supplier: true },
  });

  return NextResponse.json({
    totalJenisBahanBaku: stokRM.length,
    transaksiMasuk,
    transaksiKeluar,
    stokRendah: stokRendahFiltered.length,
    stokRM,
    recentTransaksi,
    stokRendahList: stokRendahFiltered,
  });
}