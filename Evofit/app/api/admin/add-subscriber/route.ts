import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = "evofit-admin-2026";

function getExpiresAt(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, action = "grant", days = 30 } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (action === "revoke") {
    await prisma.subscription.upsert({
      where: { email },
      create: { email, status: "CANCELLED" },
      update: { status: "CANCELLED", expiresAt: new Date() },
    });
  } else {
    const expiresAt = getExpiresAt(days);
    await prisma.subscription.upsert({
      where: { email },
      create: { email, status: "ACTIVE", expiresAt },
      update: { status: "ACTIVE", expiresAt },
    });
  }

  return NextResponse.json({ ok: true, email, action });
}
