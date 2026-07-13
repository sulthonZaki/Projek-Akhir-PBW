import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalProduksi, menungguApproval, disetujui, ditolak, recentProduksi] =
    await Promise.all([
      prisma.produksi.count(),
      prisma.produksi.count({ where: { status: "MENUNGGU_APPROVAL" } }),
      prisma.produksi.count({ where: { status: "DISETUJUI" } }),
      prisma.produksi.count({ where: { status: "DITOLAK" } }),
      prisma.produksi.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { namaLengkap: true } },
          detailRM: { include: { jenisBahanBaku: true } },
          detailFG: { include: { jenisSemen: true } },
        },
      }),
    ]);

  return NextResponse.json({
    totalProduksi,
    menungguApproval,
    disetujui,
    ditolak,
    draft: totalProduksi - menungguApproval - disetujui - ditolak,
    recentProduksi,
  });
}