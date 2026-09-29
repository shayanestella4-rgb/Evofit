import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Imita a rota RPC do Supabase que o tracker.js do Diagnóstico Evofit chama
 * (public/js/lib/tracker.js, sem nenhuma alteração) — ver quiz_start/route.ts
 * pro mesmo raciocínio. p_data é o "patch" que o tracker manda a cada
 * atualização (ver TrackPatch em tracker.js).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { p_sid, p_data } = body;

  if (!p_sid || typeof p_sid !== "string") {
    return NextResponse.json({ error: "p_sid obrigatório" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (p_data && typeof p_data.step_max === "number") data.lastStep = p_data.step_max;
  if (p_data && p_data.answers && typeof p_data.answers === "object") data.answers = p_data.answers;
  if (p_data && typeof p_data.email === "string" && p_data.email.includes("@")) {
    data.email = p_data.email.trim().toLowerCase();
  }
  if (p_data && typeof p_data.whatsapp === "string" && p_data.whatsapp.replace(/\D/g, "").length >= 10) {
    data.whatsapp = p_data.whatsapp.trim();
  }
  if (p_data && (p_data.event === "offer" || p_data.event === "buy")) data.reachedOffer = true;

  try {
    await prisma.quizSession.update({ where: { id: p_sid }, data });
    return NextResponse.json({ ok: true });
  } catch {
    // Sessão pode não existir mais, ou tracking pode falhar — nunca trava o diagnóstico.
    return NextResponse.json({ ok: false });
  }
}
