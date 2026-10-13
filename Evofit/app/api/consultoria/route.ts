import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONSULTORIA_TIPOS } from "@/lib/consultoria-tipos";

/** Recebe a anamnese curta de /consultoria (e variantes /consultoria/[tipo]) — público, sem login (lead ainda não comprou). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { tipo, nome, whatsapp, idade, sexo, objetivo, nivel, diasTreino, lesoes, observacoes, respostas } = body;

  if (!nome || typeof nome !== "string" || !whatsapp || typeof whatsapp !== "string") {
    return NextResponse.json({ error: "Nome e WhatsApp são obrigatórios" }, { status: 400 });
  }

  const tipoValido = typeof tipo === "string" && CONSULTORIA_TIPOS[tipo] ? tipo : "comum";

  await prisma.consultLead.create({
    data: {
      tipo: tipoValido,
      nome: nome.trim().slice(0, 120),
      whatsapp: whatsapp.trim().slice(0, 30),
      idade: typeof idade === "string" ? idade.trim().slice(0, 10) : undefined,
      sexo: typeof sexo === "string" ? sexo.trim().slice(0, 40) : undefined,
      objetivo: typeof objetivo === "string" ? objetivo.trim().slice(0, 80) : undefined,
      nivel: typeof nivel === "string" ? nivel.trim().slice(0, 120) : undefined,
      diasTreino: typeof diasTreino === "string" ? diasTreino.trim().slice(0, 20) : undefined,
      lesoes: typeof lesoes === "string" ? lesoes.trim().slice(0, 500) : undefined,
      observacoes: typeof observacoes === "string" ? observacoes.trim().slice(0, 1000) : undefined,
      respostas: respostas && typeof respostas === "object" ? respostas : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
