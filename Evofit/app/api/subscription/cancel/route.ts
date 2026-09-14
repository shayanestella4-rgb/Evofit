import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findActiveSubscriptionId, cancelSubscription } from "@/lib/cakto";

/** Cancela a própria assinatura (autenticado) — para as cobranças futuras na Cakto de verdade. */
export async function POST() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let subscriptionId: string | null;
  try {
    subscriptionId = await findActiveSubscriptionId(email);
  } catch {
    return NextResponse.json({ error: "Falha ao consultar a Cakto. Tente novamente ou peça suporte via WhatsApp." }, { status: 502 });
  }

  if (!subscriptionId) {
    return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada na Cakto pra esse email." }, { status: 404 });
  }

  const result = await cancelSubscription(subscriptionId);
  if (!result.ok) {
    return NextResponse.json({ error: result.detail ?? "Erro ao cancelar na Cakto." }, { status: 502 });
  }

  // Atualiza local já — o webhook da Cakto também vai confirmar isso, sem problema duplicar.
  await prisma.subscription.updateMany({
    where: { email },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
