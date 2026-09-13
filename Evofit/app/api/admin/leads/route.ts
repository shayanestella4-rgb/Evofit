import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = "evofit-admin-2026";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [leads, purchasedEmails] = await Promise.all([
    prisma.quizSession.findMany({
      where: { email: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, email: true, answers: true, lastStep: true, totalSteps: true, reachedOffer: true, createdAt: true },
    }),
    prisma.subscription.findMany({ where: { status: { not: "INACTIVE" } }, select: { email: true } }),
  ]);

  const purchasedSet = new Set(purchasedEmails.map((s) => s.email.toLowerCase()));

  const result = leads.map((l) => ({
    id: l.id,
    email: l.email,
    answers: l.answers,
    progress: l.totalSteps > 0 ? Math.round((l.lastStep / l.totalSteps) * 100) : 0,
    reachedOffer: l.reachedOffer,
    purchased: purchasedSet.has(l.email!.toLowerCase()),
    createdAt: l.createdAt,
  }));

  return NextResponse.json({ leads: result });
}
