import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const role = (session.user as any).role;
  const userId = Number((session.user as any).id);

  const where: any = {
    AND: [
      status ? { status } : {},
      // Supervisor hanya lihat permintaan miliknya sendiri
      role === "SUPERVISOR_PRODUKSI" ? { userId } : {},
    ],
  };

  const permintaan = await prisma.permintaanBahanBaku.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { namaLengkap: true, role: true } },
      details: {
        include: { jenisBahanBaku: true },
      },
    },
  });

  return NextResponse.json(permintaan);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { keperluanProduksi, tanggal, details } = body;
  const userId = Number((session.user as any).id);

  if (!details || details.length === 0) {
    return NextResponse.json({ error: "Detail bahan baku wajib diisi" }, { status: 400 });
  }

  const nomorPermintaan = `PBB/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(Math.random() * 9000) + 1000}`;

  const permintaan = await prisma.permintaanBahanBaku.create({
    data: {
      nomorPermintaan,
      tanggal: new Date(tanggal),
      keperluanProduksi,
      status: "PENDING",
      userId,
      details: {
        create: details.map((d: any) => ({
          jenisBahanBakuId: Number(d.jenisBahanBakuId),
          jumlah: Number(d.jumlah),
          satuan: d.satuan,
          keterangan: d.keterangan || null,
        })),
      },
    },
    include: { details: true },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      aksi: "CREATE",
      modul: "RM",
      deskripsi: `Buat permintaan bahan baku: ${nomorPermintaan}`,
    },
  });

  return NextResponse.json({ success: true, permintaan });
}