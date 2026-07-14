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
    prisma.transaksiFG.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        jenisSemen: true,
        customer: true,
        user: { select: { namaLengkap: true } },
      },
    }),
    prisma.transaksiFG.count({ where }),
  ]);

  return NextResponse.json({ transaksi, total, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { jenis, jenisSemenId, jumlah, satuan, customerId, gudangId, keterangan, tanggal } = body;
  const userId = Number((session.user as any).id);

  const nomorDokumen = generateNomorDokumen(jenis === "MASUK" ? "FG-IN" : "FG-OUT");

  // Cek stok kalau keluar
  if (jenis === "KELUAR") {
    const stok = await prisma.stokFG.findUnique({
      where: {
        jenisSemenId_gudangId: {
          jenisSemenId: Number(jenisSemenId),
          gudangId: Number(gudangId),
        },
      },
    });
    if (!stok || stok.jumlah < Number(jumlah)) {
      return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
    }
  }

  const transaksi = await prisma.transaksiFG.create({
    data: {
      nomorDokumen,
      tanggal: new Date(tanggal),
      jenis,
      jenisSemenId: Number(jenisSemenId),
      jumlah: Number(jumlah),
      satuan,
      customerId: customerId ? Number(customerId) : null,
      keterangan,
      userId,
    },
  });

  // Update stok FG
  const existing = await prisma.stokFG.findUnique({
    where: {
      jenisSemenId_gudangId: {
        jenisSemenId: Number(jenisSemenId),
        gudangId: Number(gudangId),
      },
    },
  });

  if (existing) {
    await prisma.stokFG.update({
      where: { id: existing.id },
      data: {
        jumlah: jenis === "MASUK"
          ? existing.jumlah + Number(jumlah)
          : Math.max(0, existing.jumlah - Number(jumlah)),
      },
    });
  } else if (jenis === "MASUK") {
    await prisma.stokFG.create({
      data: {
        jenisSemenId: Number(jenisSemenId),
        gudangId: Number(gudangId),
        jumlah: Number(jumlah),
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      aksi: "CREATE",
      modul: "FG",
      deskripsi: `Transaksi ${jenis} FG: ${nomorDokumen} (${jumlah} ${satuan})`,
    },
  });

  return NextResponse.json({ success: true, transaksi });
}