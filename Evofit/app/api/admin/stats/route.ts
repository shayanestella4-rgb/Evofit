import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QUIZ_ITEMS, quizStepLabel } from "@/lib/quiz-items";
import { computeCycleStatus } from "@/lib/cycle";

const ADMIN_PASSWORD = "evofit-admin-2026";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    newUsersLast7Days,
    activeSubscriptions,
    subscriptionsByStatus,
    quizTotalSessions,
    quizAnswered,
    quizEmailCaptured,
    quizReachedOffer,
    purchasedEmails,
    quizEmails,
    stepCounts,
    totalCompletions,
    completionsByEmail,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.quizSession.count(),
    prisma.quizSession.count({ where: { lastStep: { gt: 0 } } }),
    prisma.quizSession.count({ where: { email: { not: null } } }),
    prisma.quizSession.count({ where: { reachedOffer: true } }),
    prisma.subscription.findMany({ where: { status: { not: "INACTIVE" } }, select: { email: true } }),
    prisma.quizSession.findMany({ where: { email: { not: null } }, select: { email: true } }),
    prisma.quizSession.groupBy({ by: ["lastStep"], _count: { lastStep: true } }),
    prisma.workoutCompletion.count(),
    prisma.workoutCompletion.groupBy({
      by: ["email"],
      _count: { email: true },
      _max: { completedAt: true },
      orderBy: { _count: { email: "desc" } },
      take: 50,
    }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const row of subscriptionsByStatus) byStatus[row.status] = row._count.status;

  // Cruza email de quem fez o quiz com email de quem comprou (Subscription não tem FK com QuizSession).
  const purchasedEmailSet = new Set(purchasedEmails.map((s) => s.email.toLowerCase()));
  const quizPurchased = new Set(
    quizEmails.map((q) => q.email!.toLowerCase()).filter((e) => purchasedEmailSet.has(e))
  ).size;

  // Funil: quantas sessões chegaram em CADA passo (soma de quem passou daquele ponto em diante).
  const stopMap = new Map<number, number>();
  for (const row of stepCounts) stopMap.set(row.lastStep, row._count.lastStep);
  const funnel: { step: number; label: string; reachedCount: number }[] = [];
  for (let step = 1; step <= QUIZ_ITEMS.length; step++) {
    let reachedCount = 0;
    for (const [s, c] of stopMap) if (s >= step) reachedCount += c;
    funnel.push({ step, label: quizStepLabel(step - 1), reachedCount });
  }

  const workoutsByUser = completionsByEmail.map((row) => ({
    email: row.email,
    lastCompletedAt: row._max.completedAt,
    ...computeCycleStatus(row._count.email),
  }));

  return NextResponse.json({
    totalUsers,
    newUsersLast7Days,
    activeSubscriptions,
    subscriptionsByStatus: byStatus,
    quiz: {
      totalSessions: quizTotalSessions,
      answered: quizAnswered,
      emailCaptured: quizEmailCaptured,
      reachedOffer: quizReachedOffer,
      purchased: quizPurchased,
      funnel,
    },
    workouts: {
      totalCompletions,
      byUser: workoutsByUser,
    },
  });
}
