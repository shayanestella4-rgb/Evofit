import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  await prisma.subscription.upsert({
    where: { email },
    create: { email, status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });

  return NextResponse.json({ ok: true });
}
