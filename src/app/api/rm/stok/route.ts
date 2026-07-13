import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stok = await prisma.stokRM.findMany({
    include: {
      jenisBahanBaku: true,
      gudang: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Cek stok minimum
  const stokWithAlert = stok.map((s) => ({
    ...s,
    isLow: s.jumlah <= s.jenisBahanBaku.stokMinimum,
  }));

  return NextResponse.json(stokWithAlert);
}