import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const where: any = status ? { status } : {};

  const [produksi, total] = await Promise.all([
    prisma.produksi.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { namaLengkap: true } },
        detailRM: { include: { jenisBahanBaku: true } },
        detailFG: { include: { jenisSemen: true } },
        approval: { include: { user: { select: { namaLengkap: true } } } },
      },
    }),
    prisma.produksi.count({ where }),
  ]);

  return NextResponse.json({ produksi, total, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { tanggalMulai, tanggalSelesai, catatan, detailRM, detailFG } = body;
  const userId = Number((session.user as any).id);

  const nomorBatch = `BATCH/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(Math.random() * 9000) + 1000}`;

  // Hitung total output
  const totalOutputKg = detailFG.reduce((sum: number, d: any) => {
    return sum + Number(d.jumlahOutput);
  }, 0);

  // Hitung total RM terpakai (konversi ke kg)
  const totalRMKg = detailRM.reduce((sum: number, d: any) => {
    const jumlah = Number(d.jumlahTerpakai);
    return sum + (d.satuan === "TON" ? jumlah * 1000 : jumlah);
  }, 0);

  const efisiensi = totalRMKg > 0 ? (totalOutputKg / totalRMKg) * 100 : 0;

  const produksi = await prisma.produksi.create({
    data: {
      nomorBatch,
      tanggalMulai: new Date(tanggalMulai),
      tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
      status: "MENUNGGU_APPROVAL",
      totalOutputKg,
      efisiensi: Math.round(efisiensi * 100) / 100,
      catatan,
      userId,
      detailRM: {
        create: detailRM.map((d: any) => ({
          jenisBahanBakuId: Number(d.jenisBahanBakuId),
          jumlahTerpakai: Number(d.jumlahTerpakai),
          satuan: d.satuan,
        })),
      },
      detailFG: {
        create: detailFG.map((d: any) => ({
          jenisSemenId: Number(d.jenisSemenId),
          jumlahOutput: Number(d.jumlahOutput),
          satuan: d.satuan,
        })),
      },
    },
  });

  // Buat approval request
  await prisma.approval.create({
    data: {
      produksiId: produksi.id,
      userId,
      status: "PENDING",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      aksi: "CREATE",
      modul: "PRODUKSI",
      deskripsi: `Input produksi batch: ${nomorBatch}`,
    },
  });

  return NextResponse.json({ success: true, produksi });
}