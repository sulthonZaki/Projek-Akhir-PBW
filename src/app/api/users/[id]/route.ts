import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action, namaLengkap, role, status, newPassword } = body;
  const userId = Number(params.id);

  if (action === "reset-password") {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword || "admin123", salt);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    await prisma.auditLog.create({
      data: {
        userId: Number((session.user as any).id),
        aksi: "UPDATE",
        modul: "USER",
        deskripsi: `Reset password user ID: ${userId}`,
      },
    });
    return NextResponse.json({ success: true, message: "Password berhasil direset" });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(namaLengkap && { namaLengkap }),
      ...(role && { role }),
      ...(status && { status }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: Number((session.user as any).id),
      aksi: "UPDATE",
      modul: "USER",
      deskripsi: `Update user ID: ${userId}`,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(params.id);
  const selfId = Number((session.user as any).id);

  if (userId === selfId) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  await prisma.auditLog.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  await prisma.auditLog.create({
    data: {
      userId: selfId,
      aksi: "DELETE",
      modul: "USER",
      deskripsi: `Menghapus user ID: ${userId}`,
    },
  });

  return NextResponse.json({ success: true });
}