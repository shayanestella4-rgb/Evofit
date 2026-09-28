import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Imita a rota RPC do Supabase que o tracker.js do Diagnóstico Evofit chama
 * (public/js/lib/tracker.js, sem nenhuma alteração) — mantém o arquivo
 * original intacto, só o backend muda: em vez de um projeto Supabase à
 * parte, grava direto no QuizSession que o resto do app já usa.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { p_sid, p_meta } = body;

  if (!p_sid || typeof p_sid !== "string") {
    return NextResponse.json({ error: "p_sid obrigatório" }, { status: 400 });
  }

  try {
    await prisma.quizSession.upsert({
      where: { id: p_sid },
      create: { id: p_sid, answers: p_meta ? { _meta: p_meta } : undefined },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Tracking nunca pode travar o diagnóstico pra quem está respondendo.
    return NextResponse.json({ ok: false });
  }
}
