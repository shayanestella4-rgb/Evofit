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

  if (data?.product?.id !== PRODUCT_CODE) {
    return NextResponse.json({ received: true });
  }

  const email = data?.buyer?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 });
  }

  const caktoId = data?.purchase?.id;

  switch (event) {
    case "purchase_approved":
    case "subscription_renewed":
      await setSubscription(email, "ACTIVE", caktoId);
      break;
    case "purchase_refunded":
    case "purchase_chargeback":
      await setSubscription(email, "REFUNDED", caktoId);
      break;
    case "subscription_cancelled":
      await setSubscription(email, "CANCELLED", caktoId);
      break;
  }

  return NextResponse.json({ received: true });
}

async function setSubscription(
  email: string,
  status: SubscriptionStatus,
  caktoId?: string
) {
  await prisma.subscription.upsert({
    where: { email },
    create: { email, status, caktoId },
    update: { status, ...(caktoId && { caktoId }) },
  });
}
