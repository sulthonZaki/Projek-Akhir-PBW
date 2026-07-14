import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "MENUNGGU_APPROVAL";

  const produksi = await prisma.produksi.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { namaLengkap: true } },
      detailRM: { include: { jenisBahanBaku: true } },
      detailFG: { include: { jenisSemen: true } },
      approval: { include: { user: { select: { namaLengkap: true } } } },
    },
  });

  return NextResponse.json(produksi);
}