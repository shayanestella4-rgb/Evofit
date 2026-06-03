import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ email?: string; name?: string }>;
}

export default async function AcessoPage({ searchParams }: Props) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase();

  if (email && email.includes("@")) {
    await prisma.subscription.upsert({
      where: { email },
      create: { email, status: "ACTIVE" },
      update: { status: "ACTIVE" },
    });
  }

  redirect(`/auth/login${email ? `?email=${encodeURIComponent(email)}` : ""}`);
}
