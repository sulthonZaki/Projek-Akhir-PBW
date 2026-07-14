import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, catatanAdmin, gudangId } = body;
  const userId = Number((session.user as any).id);
  const role = (session.user as any).role;

  const permintaan = await prisma.permintaanBahanBaku.findUnique({
    where: { id: Number(id) },
    include: { details: { include: { jenisBahanBaku: true } } },
  });

  if (!permintaan) {
    return NextResponse.json({ error: "Permintaan tidak ditemukan" }, { status: 404 });
  }

  if (action === "approve" && role === "ADMIN_RM") {
    // Update status permintaan
    await prisma.permintaanBahanBaku.update({
      where: { id: Number(id) },
      data: { status: "DISETUJUI", catatanAdmin },
    });

    // Auto input barang keluar untuk setiap detail
    for (const detail of permintaan.details) {
      const nomorDokumen = `RM-OUT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(Math.random() * 9000) + 1000}`;

      await prisma.transaksiRM.create({
        data: {
          nomorDokumen,
          tanggal: new Date(),
          jenis: "KELUAR",
          jenisBahanBakuId: detail.jenisBahanBakuId,
          jumlah: detail.jumlah,
          satuan: detail.satuan,
          keterangan: `Permintaan produksi: ${permintaan.nomorPermintaan}`,
          userId,
        },
      });

      // Kurangi stok RM
      if (gudangId) {
        const existingStok = await prisma.stokRM.findUnique({
          where: {
            jenisBahanBakuId_gudangId: {
              jenisBahanBakuId: detail.jenisBahanBakuId,
              gudangId: Number(gudangId),
            },
          },
        });

        if (existingStok) {
          await prisma.stokRM.update({
            where: { id: existingStok.id },
            data: { jumlah: Math.max(0, existingStok.jumlah - detail.jumlah) },
          });
        }
      }
    }

    // Update status jadi SELESAI
    await prisma.permintaanBahanBaku.update({
      where: { id: Number(id) },
      data: { status: "SELESAI" },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        aksi: "UPDATE",
        modul: "RM",
        deskripsi: `Approve permintaan bahan baku: ${permintaan.nomorPermintaan}`,
      },
    });

    return NextResponse.json({ success: true, message: "Permintaan disetujui, barang keluar otomatis tercatat" });
  }

  if (action === "reject" && role === "ADMIN_RM") {
    await prisma.permintaanBahanBaku.update({
      where: { id: Number(id) },
      data: { status: "DITOLAK", catatanAdmin },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        aksi: "UPDATE",
        modul: "RM",
        deskripsi: `Tolak permintaan bahan baku: ${permintaan.nomorPermintaan}`,
      },
    });

    return NextResponse.json({ success: true, message: "Permintaan ditolak" });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}