import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken, hasActiveSubscription } from "@/lib/cakto";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Expira por data (expiresAt vencido)
  const expired = await prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: now },
    },
    data: { status: "CANCELLED" },
  });

  console.log(`[cron] ${expired.count} assinatura(s) expirada(s) por data`);

  // 2. Verifica na API da Cakto as que não têm expiresAt (acesso sem data definida)
  const semData = await prisma.subscription.findMany({
    where: { status: "ACTIVE", expiresAt: null },
    select: { email: true },
  });

  let canceladosCakto = 0;
  if (semData.length > 0) {
    let token: string;
    try {
      token = await getToken();
    } catch (e) {
      console.error("[cron] erro ao obter token Cakto:", e);
      return NextResponse.json({
        ok: true,
        expiredByDate: expired.count,
        cancelledByCakto: 0,
        error: "Falha ao autenticar na Cakto",
      });
    }

    for (const { email } of semData) {
      try {
        const ativo = await hasActiveSubscription(email, token);
        if (!ativo) {
          await prisma.subscription.update({
            where: { email },
            data: { status: "CANCELLED" },
          });
          canceladosCakto++;
          console.log(`[cron] cancelado via Cakto: ${email}`);
        }
      } catch (e) {
        console.error(`[cron] erro ao verificar ${email}:`, e);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    expiredByDate: expired.count,
    cancelledByCakto: canceladosCakto,
  });
}
