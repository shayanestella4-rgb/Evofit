import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCycleStatus } from "@/lib/cycle";

/** Marca o treino do dia como concluído (autenticado) — no máximo 1 por dia. */
export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { workoutName, duration } = await request.json().catch(() => ({}));

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existingToday = await prisma.workoutCompletion.findFirst({
    where: { email, completedAt: { gte: startOfDay } },
  });

  if (!existingToday) {
    await prisma.workoutCompletion.create({
      data: { email, workoutName: workoutName ?? undefined, duration: duration ?? undefined },
    });
  }

  const completedTotal = await prisma.workoutCompletion.count({ where: { email } });
  return NextResponse.json(computeCycleStatus(completedTotal));
}
