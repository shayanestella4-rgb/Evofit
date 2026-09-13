import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Tracking anônimo do funil do quiz — sem senha (chamado direto da página
 * pública /quiz). Só escreve, nunca devolve dado de outra sessão, então não
 * expõe nada sensível.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, id, lastStep, totalSteps, answers, email } = body;

  try {
    if (action === "start") {
      const session = await prisma.quizSession.create({
        data: { totalSteps: totalSteps ?? 0 },
      });
      return NextResponse.json({ id: session.id });
    }

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    }

    if (action === "progress") {
      await prisma.quizSession.update({
        where: { id },
        data: {
          lastStep: lastStep ?? undefined,
          totalSteps: totalSteps ?? undefined,
          answers: answers ?? undefined,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "email") {
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json({ error: "email inválido" }, { status: 400 });
      }
      await prisma.quizSession.update({
        where: { id },
        data: { email: email.trim().toLowerCase() },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "complete") {
      await prisma.quizSession.update({
        where: { id },
        data: { reachedOffer: true },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  } catch {
    // Sessão pode não existir mais (ex: id inválido) — não quebra a experiência do usuário.
    return NextResponse.json({ ok: false });
  }
}
