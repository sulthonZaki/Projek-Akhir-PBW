import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateNomorDokumen } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jenis = searchParams.get("jenis") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const where: any = jenis ? { jenis } : {};

  const [transaksi, total] = await Promise.all([
    prisma.transaksiRM.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        jenisBahanBaku: true,
        supplier: true,
        user: { select: { namaLengkap: true } },
        approval: true,
      },
    }),
    prisma.transaksiRM.count({ where }),
  ]);

  return NextResponse.json({ transaksi, total, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { jenis, jenisBahanBakuId, jumlah, satuan, supplierId, gudangId, nomorPO, keterangan, tanggal } = body;
  const userId = Number((session.user as any).id);

  const nomorDokumen = generateNomorDokumen(jenis === "MASUK" ? "RM-IN" : "RM-OUT");

  const transaksi = await prisma.transaksiRM.create({
    data: {
      nomorDokumen,
      tanggal: new Date(tanggal),
      jenis,
      jenisBahanBakuId: Number(jenisBahanBakuId),
      jumlah: Number(jumlah),
      satuan,
      supplierId: supplierId ? Number(supplierId) : null,
      nomorPO,
      keterangan,
      userId,
    },
  });

  // Update stok
  const existingStok = await prisma.stokRM.findUnique({
    where: { jenisBahanBakuId_gudangId: { jenisBahanBakuId: Number(jenisBahanBakuId), gudangId: Number(gudangId) } },
  });

  if (existingStok) {
    await prisma.stokRM.update({
      where: { id: existingStok.id },
      data: {
        jumlah: jenis === "MASUK"
          ? existingStok.jumlah + Number(jumlah)
          : Math.max(0, existingStok.jumlah - Number(jumlah)),
      },
    });
  } else {
    await prisma.stokRM.create({
      data: {
        jenisBahanBakuId: Number(jenisBahanBakuId),
        gudangId: Number(gudangId),
        jumlah: jenis === "MASUK" ? Number(jumlah) : 0,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      aksi: "CREATE",
      modul: "RM",
      deskripsi: `Transaksi ${jenis} RM: ${nomorDokumen} (${jumlah} ${satuan})`,
    },
  });

  return NextResponse.json({ success: true, transaksi });
}