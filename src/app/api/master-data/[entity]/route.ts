import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Entity = "supplier" | "customer" | "jenis-bahan-baku" | "jenis-semen" | "gudang";

const modelMap: Record<Entity, any> = {
  supplier: prisma.supplier,
  customer: prisma.customer,
  "jenis-bahan-baku": prisma.jenisBahanBaku,
  "jenis-semen": prisma.jenisSemen,
  gudang: prisma.gudang,
};

export async function POST(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entity = params.entity as Entity;
  const model = modelMap[entity];
  if (!model) return NextResponse.json({ error: "Entity tidak valid" }, { status: 400 });

  const body = await req.json();

  try {
    const result = await model.create({ data: body });

    await prisma.auditLog.create({
      data: {
        userId: Number((session.user as any).id),
        aksi: "CREATE",
        modul: "MASTER",
        deskripsi: `Menambah master data ${entity}: ${body.nama}`,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Kode sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entity = params.entity as Entity;
  const model = modelMap[entity];
  if (!model) return NextResponse.json({ error: "Entity tidak valid" }, { status: 400 });

  const body = await req.json();
  const { id, ...data } = body;

  try {
    const result = await model.update({ where: { id }, data });

    await prisma.auditLog.create({
      data: {
        userId: Number((session.user as any).id),
        aksi: "UPDATE",
        modul: "MASTER",
        deskripsi: `Update master data ${entity} ID: ${id}`,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengupdate data" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entity = params.entity as Entity;
  const model = modelMap[entity];
  if (!model) return NextResponse.json({ error: "Entity tidak valid" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  try {
    await model.update({ where: { id }, data: { aktif: false } });

    await prisma.auditLog.create({
      data: {
        userId: Number((session.user as any).id),
        aksi: "DELETE",
        modul: "MASTER",
        deskripsi: `Nonaktifkan master data ${entity} ID: ${id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}