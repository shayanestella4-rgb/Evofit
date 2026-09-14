import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCycleStatus } from "@/lib/cycle";

/** Status do ciclo atual (autenticado) — quantos treinos concluídos, qual ciclo, etc. */
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const completedTotal = await prisma.workoutCompletion.count({ where: { email } });
  return NextResponse.json(computeCycleStatus(completedTotal));
}
