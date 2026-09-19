import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = "evofit-admin-2026";

/**
 * Busca (sem `data` no body) ou salva (com `data` no body) a anamnese de
 * qualquer usuário pelo email — uso exclusivo do painel /admin.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password, email, data } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (data && typeof data === "object") {
    const record = await prisma.userAnamnese.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail, data },
      update: { data },
    });
    return NextResponse.json({ data: record.data, updatedAt: record.updatedAt });
  }

  const [record, completedTotal] = await Promise.all([
    prisma.userAnamnese.findUnique({ where: { email: normalizedEmail } }),
    prisma.workoutCompletion.count({ where: { email: normalizedEmail } }),
  ]);
  return NextResponse.json({ data: record?.data ?? null, updatedAt: record?.updatedAt ?? null, completedTotal });
}
