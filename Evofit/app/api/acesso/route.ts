import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const expiresAt = getExpiresAt(30);

  await prisma.subscription.upsert({
    where: { email },
    create: { email, status: "ACTIVE", expiresAt },
    update: { status: "ACTIVE", expiresAt },
  });

  return NextResponse.json({ ok: true });
}
