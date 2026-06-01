"use client";

import Link from "next/link";

export default function SemAcessoPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-6xl">🔒</div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Acesso restrito</h1>
          <p className="text-[#9CA3AF] text-sm leading-relaxed">
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
            className="block w-full py-3 px-4 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] text-[#9CA3AF] font-semibold text-sm transition-colors"
          >
            Entrar com outra conta
          </Link>
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
