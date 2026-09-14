import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email) return null;

        const subscription = await prisma.subscription.findUnique({
          where: { email },
        });
        if (!subscription) return null;

        // Cancelada ainda pode logar até o fim do período já pago (ver
        // dashboard/layout.tsx e Termos de Uso, seção 6) — só bloqueia de
        // vez se nunca ativou, foi reembolsada, ou o período já passou.
        const now = new Date();
        const canLogin =
          subscription.status === "ACTIVE" ||
          (subscription.status === "CANCELLED" && !!subscription.expiresAt && subscription.expiresAt > now);
        if (!canLogin) return null;

        return { id: email, email };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/onboarding");
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/auth/login", nextUrl));
      }
      return true;
    },
    session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      return session;
    },
  },
  session: { strategy: "jwt" },
});
