import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase, FOTOS_BUCKET, getSignedPhotoUrl } from "@/lib/supabase";

const TIPOS = ["frente", "lado", "costas"] as const;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Fotos de evolução do próprio usuário logado (ver ProgressPhoto no schema). */
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const photos = await prisma.progressPhoto.findMany({
    where: { email },
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

export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { tipo, imageBase64 } = body;

  if (!TIPOS.includes(tipo)) {
    return NextResponse.json({ error: "Tipo de foto inválido." }, { status: 400 });
  }
  const match = typeof imageBase64 === "string"
    ? imageBase64.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/)
    : null;
  if (!match) {
    return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });
  }

  const [, ext, base64Data] = match;
  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Imagem maior que 5MB." }, { status: 400 });
  }

  const fileExt = ext === "jpeg" ? "jpg" : ext;
  const emailSlug = email.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `${emailSlug}/${Date.now()}-${tipo}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(FOTOS_BUCKET)
    .upload(storagePath, buffer, { contentType: `image/${ext}` });
  if (uploadError) {
    return NextResponse.json({ error: "Erro ao enviar a foto." }, { status: 502 });
  }

  const photo = await prisma.progressPhoto.create({ data: { email, tipo, storagePath } });
  const url = await getSignedPhotoUrl(storagePath);

  return NextResponse.json({ photo: { id: photo.id, tipo: photo.tipo, createdAt: photo.createdAt, url } });
}
