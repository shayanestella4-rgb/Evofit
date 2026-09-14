import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardNav from "./components/DashboardNav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const subscription = await prisma.subscription.findUnique({
    where: { email: session.user.email },
  });

  // Cancelada mantém acesso até o fim do período já pago (ver Termos de Uso,
  // seção 6) — só corta na hora se for reembolso/estorno ou nunca ter sido
  // ativada. Por isso CANCELLED entra no mesmo cálculo de expiresAt que ACTIVE,
  // em vez de barrar na hora.
  const now = new Date();
  let isActive = false;
  if (subscription?.status === "ACTIVE") {
    isActive = !subscription.expiresAt || subscription.expiresAt > now;
  } else if (subscription?.status === "CANCELLED") {
    isActive = !!subscription.expiresAt && subscription.expiresAt > now;
  }

  if (!isActive) {
    redirect("/sem-acesso");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <DashboardNav />
    </div>
  );
}
