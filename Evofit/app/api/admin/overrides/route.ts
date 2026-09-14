import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = "evofit-admin-2026";

/**
 * Lista (sem `dayIdx`) ou salva/limpa (com `dayIdx`) o treino manual de um
 * dia da semana pra um usuário — uso exclusivo do painel /admin.
 * `exerciseIds: []` remove o override desse dia (volta a gerar automático).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password, email, dayIdx, exerciseIds } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  if (typeof dayIdx === "number") {
    if (Array.isArray(exerciseIds) && exerciseIds.length === 0) {
      await prisma.userWorkoutOverride.deleteMany({ where: { email: normalizedEmail, dayIdx } });
      return NextResponse.json({ ok: true, cleared: true });
    }
    if (!Array.isArray(exerciseIds)) {
      return NextResponse.json({ error: "exerciseIds obrigatório" }, { status: 400 });
    }
    await prisma.userWorkoutOverride.upsert({
      where: { email_dayIdx: { email: normalizedEmail, dayIdx } },
      create: { email: normalizedEmail, dayIdx, exerciseIds },
      update: { exerciseIds },
    });
    return NextResponse.json({ ok: true });
  }

  const rows = await prisma.userWorkoutOverride.findMany({ where: { email: normalizedEmail } });
  const byDay: Record<number, string[]> = {};
  for (const row of rows) byDay[row.dayIdx] = row.exerciseIds as string[];
  return NextResponse.json({ overrides: byDay });
}
