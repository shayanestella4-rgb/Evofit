import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasActiveCaktoOrder } from "@/lib/cakto";

function getExpiresAt(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  let ativo: boolean;
  try {
    ativo = await hasActiveCaktoOrder(normalizedEmail);
  } catch {
    return NextResponse.json(
      { error: "Erro ao consultar a Cakto. Tente novamente." },
      { status: 502 }
    );
  }

  if (!ativo) {
    return NextResponse.json({
      ok: false,
      message: "Nenhuma assinatura ativa encontrada para este e-mail.",
    });
  }

  await prisma.subscription.upsert({
    where: { email: normalizedEmail },
    create: { email: normalizedEmail, status: "ACTIVE", expiresAt: getExpiresAt() },
    update: { status: "ACTIVE", expiresAt: getExpiresAt() },
  });

  return NextResponse.json({ ok: true });
}
