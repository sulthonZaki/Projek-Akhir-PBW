import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [suppliers, customers, jenisBahanBaku, jenisSemen, gudang] =
    await Promise.all([
      prisma.supplier.findMany({ orderBy: { nama: "asc" } }),
      prisma.customer.findMany({ orderBy: { nama: "asc" } }),
      prisma.jenisBahanBaku.findMany({ orderBy: { nama: "asc" } }),
      prisma.jenisSemen.findMany({ orderBy: { nama: "asc" } }),
      prisma.gudang.findMany({ orderBy: { nama: "asc" } }),
    ]);

  return NextResponse.json({ suppliers, customers, jenisBahanBaku, jenisSemen, gudang });
}