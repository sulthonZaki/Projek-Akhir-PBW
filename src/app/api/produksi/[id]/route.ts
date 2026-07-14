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
  const { action, catatan } = body;
  const userId = Number((session.user as any).id);
  const role = (session.user as any).role;

  const produksi = await prisma.produksi.findUnique({
    where: { id: Number(id) },
    include: { detailFG: true, approval: true },
  });

  if (!produksi) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

  if (action === "approve" && role === "MANAGER") {
  await prisma.produksi.update({
    where: { id: Number(id) },
    data: { status: "DISETUJUI" },
  });

  await prisma.approval.update({
    where: { produksiId: Number(id) },
    data: { status: "DISETUJUI", userId, catatan },
  });

  // Tambah stok FG + catat transaksi
  for (const detail of produksi.detailFG) {
    const gudangFG = await prisma.gudang.findFirst({
      where: { tipe: "FG", aktif: true },
    });

    if (gudangFG) {
      // Update stok
      const existing = await prisma.stokFG.findUnique({
        where: {
          jenisSemenId_gudangId: {
            jenisSemenId: detail.jenisSemenId,
            gudangId: gudangFG.id,
          },
        },
      });

      if (existing) {
        await prisma.stokFG.update({
          where: { id: existing.id },
          data: { jumlah: existing.jumlah + detail.jumlahOutput },
        });
      } else {
        await prisma.stokFG.create({
          data: {
            jenisSemenId: detail.jenisSemenId,
            gudangId: gudangFG.id,
            jumlah: detail.jumlahOutput,
          },
        });
      }

      // Catat transaksi FG masuk
      const nomorDokumen = `FG-IN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(Math.random() * 9000) + 1000}`;

      await prisma.transaksiFG.create({
        data: {
          nomorDokumen,
          tanggal: new Date(),
          jenis: "MASUK",
          jenisSemenId: detail.jenisSemenId,
          jumlah: detail.jumlahOutput,
          satuan: detail.satuan,
          keterangan: `Hasil produksi batch: ${produksi.nomorBatch}`,
          userId,
        },
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      userId,
      aksi: "UPDATE",
      modul: "PRODUKSI",
      deskripsi: `Approve produksi batch ID: ${id}`,
    },
  });

  return NextResponse.json({ success: true, message: "Produksi disetujui, stok FG bertambah" });
}

  if (action === "reject") {
    await prisma.produksi.update({
      where: { id: Number(id) },
      data: { status: "DITOLAK" },
    });

    await prisma.approval.update({
      where: { produksiId: Number(id) },
      data: { status: "DITOLAK", userId, catatan },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        aksi: "UPDATE",
        modul: "PRODUKSI",
        deskripsi: `Tolak produksi batch ID: ${id}`,
      },
    });

    return NextResponse.json({ success: true, message: "Produksi ditolak" });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}