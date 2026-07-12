import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  const users = await prisma.user.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { username: { contains: search } },
            { namaLengkap: { contains: search } },
          ],
        } : {},
        role ? { role: role as any } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      namaLengkap: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, namaLengkap, role, password } = body;

  if (!username || !namaLengkap || !role || !password) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const user = await prisma.user.create({
    data: { username, namaLengkap, role, password: hashedPassword, status: "AKTIF" },
  });

  await prisma.auditLog.create({
    data: {
      userId: Number((session.user as any).id),
      aksi: "CREATE",
      modul: "USER",
      deskripsi: `Membuat user baru: ${username} (${role})`,
    },
  });

  return NextResponse.json({ success: true, user });
}