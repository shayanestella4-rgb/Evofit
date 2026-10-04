import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/cakto";

function getExpiresAt(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Normalmente o webhook da Cakto (purchase_approved, ver app/api/webhooks/cakto)
 * já ativa o acesso na hora da compra. Esta rota é só uma rede de segurança pra
 * quando a pessoa chega aqui antes do webhook processar — por isso confirma a
 * compra de verdade na Cakto antes de liberar, nunca confia só no email digitado
 * (sem essa checagem, qualquer email digitado aqui ganhava 30 dias de acesso).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const existing = await prisma.subscription.findUnique({ where: { email } });
  const now = new Date();
  const alreadyActive = existing?.status === "ACTIVE" && (!existing.expiresAt || existing.expiresAt > now);

  if (!alreadyActive) {
    let hasPaid = false;
    try {
      hasPaid = await hasActiveSubscription(email);
    } catch {
      return NextResponse.json({ error: "Não deu pra confirmar sua compra agora. Tenta de novo em instantes." }, { status: 502 });
    }
    if (!hasPaid) {
      return NextResponse.json({ error: "Nenhuma compra confirmada pra esse email." }, { status: 404 });
    }
    await prisma.subscription.upsert({
      where: { email },
      create: { email, status: "ACTIVE", expiresAt: getExpiresAt(30) },
      update: { status: "ACTIVE", expiresAt: getExpiresAt(30) },
    });
  }

  return NextResponse.json({ ok: true });
}
