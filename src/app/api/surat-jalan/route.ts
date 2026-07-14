import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const suratJalan = await prisma.transaksiFG.findMany({
    where: {
      jenis: "KELUAR",
      nomorSJ: { not: null },
    },
    orderBy: { createdAt: "desc" },
    include: {
      jenisSemen: true,
      customer: true,
      user: { select: { namaLengkap: true } },
    },
  });

  return NextResponse.json(suratJalan);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { transaksiId, nomorSJ } = body;

  await prisma.transaksiFG.update({
    where: { id: Number(transaksiId) },
    data: { nomorSJ },
  });

  return NextResponse.json({ success: true });
}