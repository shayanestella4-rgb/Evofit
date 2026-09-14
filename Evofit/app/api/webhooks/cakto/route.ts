import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "REFUNDED" | "CANCELLED";

const WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET!;
const PRODUCT_CODE = "Shyane21";

interface CaktoPayload {
  event: string;
  data: {
    buyer?: { name?: string; email?: string; document?: string };
    product?: { id?: string; name?: string };
    purchase?: { id?: string; value?: number; status?: string };
  };
}

// Verificação de endpoint (algumas plataformas enviam GET antes de ativar)
export async function GET() {
  console.log("[webhook] GET de verificação recebido");
  return NextResponse.json({ status: "ok", service: "evofit-webhook" });
}

export async function POST(request: NextRequest) {
  console.log("[webhook] recebido POST em /api/webhooks/cakto");
  console.log("[webhook] headers:", JSON.stringify(Object.fromEntries(request.headers)));

  let payload: CaktoPayload;
  try {
    payload = await request.json();
  } catch {
    console.log("[webhook] erro ao parsear JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  console.log("[webhook] payload:", JSON.stringify(payload));

  // Cakto pode enviar o token no header, query string ou no body
  const token =
    request.headers.get("x-cakto-token") ??
    request.headers.get("x-webhook-token") ??
    request.headers.get("authorization")?.replace("Bearer ", "") ??
    request.nextUrl.searchParams.get("token") ??
    (payload as any)?.token ??
    (payload as any)?.secret;

  if (WEBHOOK_SECRET && token !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { event, data } = payload;

  console.log("[webhook] event:", event, "| product:", data?.product?.id, "| email:", data?.buyer?.email);

  const email = data?.buyer?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 });
  }

  const caktoId = data?.purchase?.id;

  switch (event) {
    case "purchase_approved":
    case "subscription_renewed": {
      // Renova o período pago por mais 30 dias a partir de agora — é essa data
      // que "cancelamento mantém acesso até o fim do período" (Termos de Uso,
      // seção 6) usa depois, se a assinatura for cancelada.
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await setSubscription(email, "ACTIVE", caktoId, expiresAt);
      break;
    }
    case "purchase_refunded":
    case "purchase_chargeback":
      // Reembolso corta o acesso na hora — não faz sentido manter até expiresAt.
      await setSubscription(email, "REFUNDED", caktoId);
      break;
    case "subscription_cancelled":
      // Não mexe em expiresAt — mantém o que já tinha, pra honrar o período já pago.
      await setSubscription(email, "CANCELLED", caktoId);
      break;
  }

  return NextResponse.json({ received: true });
}

async function setSubscription(
  email: string,
  status: SubscriptionStatus,
  caktoId?: string,
  expiresAt?: Date
) {
  await prisma.subscription.upsert({
    where: { email },
    create: { email, status, caktoId, expiresAt },
    update: { status, ...(caktoId && { caktoId }), ...(expiresAt && { expiresAt }) },
  });
}
