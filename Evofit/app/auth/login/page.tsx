"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const CAKTO_URL = "https://pay.cakto.com.br/aprvkwz_909423";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      redirect: false,
    });

    if (result?.error) {
      setError("Email não encontrado. Verifique se usou o mesmo email da compra.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-8 shadow-sm animate-slide-up">
      <h1 className="text-xl font-bold text-[#F0F0F0] text-center mb-1">
        Acessar minha conta
      </h1>
      <p className="text-sm text-[#B8B8B8] text-center mb-6">
        Digite o email usado na sua compra
      </p>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoComplete="email"
          className="w-full bg-[#111111] border border-[#2D2D2D] rounded-[0.75rem] px-4 py-3.5 text-sm text-[#F0F0F0] placeholder-[#4B5563] focus:outline-none focus:border-[#A855F7] transition-colors"
        />

        {error && (
          <p className="text-[#EF4444] text-xs text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-[#A855F7] text-white font-semibold py-3.5 rounded-[0.75rem] text-sm active:bg-[#9333EA] transition-colors disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Acessar"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[#2D2D2D]">
        <p className="text-xs text-[#CBD5E0] text-center">
          Ainda não assinou?{" "}
          <button
            onClick={() => { window.location.href = CAKTO_URL; }}
            className="text-[#C084FC] font-semibold"
          >
            Assinar o Evofit
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="text-2xl font-extrabold text-[#C084FC]">
            Evofit
          </Link>
          <p className="text-[#B8B8B8] text-sm mt-2">Seu personal trainer digital</p>
        </div>
        <Suspense fallback={<div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-8 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
