import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = "evofit-admin-2026";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  await prisma.subscription.upsert({
    where: { email },
    create: { email, status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });

  return NextResponse.json({ ok: true, email });
}
