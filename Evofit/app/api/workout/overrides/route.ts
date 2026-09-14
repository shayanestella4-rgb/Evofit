import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Overrides manuais (definidos pelo /admin) do usuário logado — {dayIdx: exerciseIds[]}. */
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const rows = await prisma.userWorkoutOverride.findMany({ where: { email } });
  const byDay: Record<number, string[]> = {};
  for (const row of rows) byDay[row.dayIdx] = row.exerciseIds as string[];
  return NextResponse.json({ overrides: byDay });
}
