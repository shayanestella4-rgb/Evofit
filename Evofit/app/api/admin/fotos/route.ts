import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedPhotoUrl, deletePhotoFile } from "@/lib/supabase";

const ADMIN_PASSWORD = "evofit-admin-2026";

/** Fotos de evolução de um aluno pelo email — uso exclusivo do painel /admin. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password, email } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const photos = await prisma.progressPhoto.findMany({
    where: { email: normalizedEmail },
    orderBy: { createdAt: "desc" },
  });

  const withUrls = await Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      tipo: p.tipo,
      createdAt: p.createdAt,
      url: await getSignedPhotoUrl(p.storagePath),
    }))
  );

  return NextResponse.json({ photos: withUrls });
}

/** Exclui uma foto de evolução (storage + registro) — uso exclusivo do painel /admin. */
export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password, id } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const photo = await prisma.progressPhoto.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
  }

  await deletePhotoFile(photo.storagePath);
  await prisma.progressPhoto.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
