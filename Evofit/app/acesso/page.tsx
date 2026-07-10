"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcessoPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAcesso(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/acesso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (res.ok) {
      router.push(`/auth/login?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } else {
      setError("Erro ao ativar acesso. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold text-[#C084FC]">Evofit</span>
          <p className="text-[#B8B8B8] text-sm mt-2">Seu personal trainer digital</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <h1 className="text-xl font-bold text-[#F0F0F0] mb-1">Compra confirmada!</h1>
            <p className="text-sm text-[#CBD5E0]">
              Digite o email que você usou na compra para ativar seu acesso.
            </p>
          </div>

          <form onSubmit={handleAcesso} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
              className="w-full bg-[#111111] border border-[#2D2D2D] rounded-[0.75rem] px-4 py-3.5 text-sm text-[#F0F0F0] placeholder-[#4B5563] focus:outline-none focus:border-[#A855F7] transition-colors"
            />

            {error && <p className="text-[#EF4444] text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#A855F7] text-white font-semibold py-3.5 rounded-[0.75rem] text-sm active:bg-[#9333EA] transition-colors disabled:opacity-50"
            >
              {loading ? "Ativando..." : "Ativar meu acesso"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
