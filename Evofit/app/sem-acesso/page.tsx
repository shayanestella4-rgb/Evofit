"use client";

import Link from "next/link";
import { useState } from "react";

export default function SemAcessoPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<"sucesso" | "nao_encontrado" | "erro" | null>(null);

  async function verificarRenovacao() {
    if (!email.includes("@")) return;
    setLoading(true);
    setResultado(null);
    try {
      const res = await fetch("/api/verificar-renovacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setResultado("sucesso");
      } else if (res.status >= 500) {
        setResultado("erro");
      } else {
        setResultado("nao_encontrado");
      }
    } catch {
      setResultado("erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-6xl">🔒</div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Acesso restrito</h1>
          <p className="text-[#CBD5E0] text-sm leading-relaxed">
            Para acessar o Evofit você precisa ter uma assinatura ativa.
            Se você já comprou, aguarde alguns instantes e tente novamente.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              window.location.href = "https://pay.cakto.com.br/aprvkwz_909423";
            }}
            className="block w-full py-3 px-4 rounded-xl bg-[#A855F7] active:bg-[#9333EA] text-white font-semibold text-sm transition-colors"
          >
            Quero assinar agora
          </button>

          <Link
            href="/auth/login"
            className="block w-full py-3 px-4 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-[#CBD5E0] font-semibold text-sm transition-colors"
          >
            Entrar com outra conta
          </Link>
        </div>

        {/* Seção de verificação de renovação */}
        <div className="pt-2 border-t border-[#2D2D2D]">
          <p className="text-[#CBD5E0] text-sm mb-3">Já renovou? Verifique seu acesso:</p>

          {resultado === "sucesso" ? (
            <div className="space-y-3">
              <p className="text-green-400 text-sm font-medium">
                ✅ Assinatura confirmada! Faça login para continuar.
              </p>
              <Link
                href="/auth/login"
                className="block w-full py-3 px-4 rounded-xl bg-[#A855F7] text-white font-semibold text-sm transition-colors"
              >
                Fazer login agora
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Seu e-mail de cadastro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-white text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#A855F7]"
              />
              <button
                onClick={verificarRenovacao}
                disabled={loading || !email.includes("@")}
                className="w-full py-3 px-4 rounded-xl bg-[#1A1A1A] border border-[#A855F7] text-[#A855F7] font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Verificar renovação"}
              </button>

              {resultado === "nao_encontrado" && (
                <p className="text-red-400 text-xs">
                  Nenhuma assinatura ativa encontrada. Confirme o e-mail ou{" "}
                  <a href="mailto:suporte@evofit.com.br" className="underline">
                    fale com o suporte
                  </a>
                  .
                </p>
              )}
              {resultado === "erro" && (
                <p className="text-yellow-400 text-xs">
                  Erro ao verificar. Tente novamente ou{" "}
                  <a href="mailto:suporte@evofit.com.br" className="underline">
                    fale com o suporte
                  </a>
                  .
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-[#4B5563] text-xs">
          Já assinou e ainda sem acesso?{" "}
          <a
            href="mailto:suporte@evofit.com.br"
            className="text-[#A855F7] underline"
          >
            Fale com o suporte
          </a>
        </p>
      </div>
    </div>
  );
}
