import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Busca a anamnese salva no servidor pro usuário logado (ou null se nunca sincronizou). */
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const record = await prisma.userAnamnese.findUnique({ where: { email } });
  return NextResponse.json({ data: record?.data ?? null, updatedAt: record?.updatedAt ?? null });
}

/** Sincroniza a anamnese do usuário logado (chamado ao salvar/atualizar no app). */
export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data } = await request.json().catch(() => ({}));
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "data obrigatório" }, { status: 400 });
  }

  const record = await prisma.userAnamnese.upsert({
    where: { email },
    create: { email, data },
    update: { data },
  });
  return NextResponse.json({ data: record.data, updatedAt: record.updatedAt });
}
