import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

const WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET!;
const PRODUCT_CODE = "Shyane21";

interface CaktoPayload {
  event: string;
  data: {
    buyer?: {
      name?: string;
      email?: string;
      document?: string;
    };
    product?: {
      id?: string;
      name?: string;
    };
    purchase?: {
      id?: string;
      value?: number;
      status?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  const token =
    request.headers.get("x-cakto-token") ??
    request.nextUrl.searchParams.get("token");

  if (!WEBHOOK_SECRET || token !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: CaktoPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data } = payload;

  if (data?.product?.id !== PRODUCT_CODE) {
    return NextResponse.json({ received: true });
  }

  const email = data?.buyer?.email;
  if (!email) {
    return NextResponse.json({ error: "Email not found in payload" }, { status: 400 });
  }

  const caktoId = data?.purchase?.id;

  switch (event) {
    case "purchase_approved":
    case "subscription_renewed":
      await setSubscription(email, SubscriptionStatus.ACTIVE, caktoId);
      break;

    case "purchase_refunded":
    case "purchase_chargeback":
      await setSubscription(email, SubscriptionStatus.REFUNDED, caktoId);
      break;

    case "subscription_cancelled":
      await setSubscription(email, SubscriptionStatus.CANCELLED, caktoId);
      break;

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function setSubscription(
  email: string,
  status: SubscriptionStatus,
  caktoId?: string
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status, caktoId },
    update: { status, ...(caktoId && { caktoId }) },
  });
}
