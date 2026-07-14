import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stok = await prisma.stokFG.findMany({
    include: { jenisSemen: true, gudang: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(stok);
}