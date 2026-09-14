import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findLatestPaidOrderId, refundOrder } from "@/lib/cakto";

const ADMIN_PASSWORD = "evofit-admin-2026";

/** Reembolsa o pedido pago mais recente de um usuário na Cakto — uso exclusivo do /admin. */
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

  let orderId: string | null;
  try {
    orderId = await findLatestPaidOrderId(normalizedEmail);
  } catch {
    return NextResponse.json({ error: "Falha ao consultar a Cakto." }, { status: 502 });
  }
  if (!orderId) {
    return NextResponse.json({ error: "Nenhum pedido pago encontrado na Cakto pra esse email." }, { status: 404 });
  }

  const result = await refundOrder(orderId);
  if (!result.ok) {
    return NextResponse.json({ error: result.detail ?? "Erro ao reembolsar na Cakto." }, { status: 502 });
  }

  await prisma.subscription.updateMany({
    where: { email: normalizedEmail },
    data: { status: "REFUNDED" },
  });

  return NextResponse.json({ ok: true, detail: result.detail });
}
