"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="text-2xl font-extrabold text-[#C084FC]">
            Evofit
          </Link>
          <p className="text-[#8A8A8A] text-sm mt-2">Seu personal trainer digital</p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-8 shadow-sm animate-slide-up">
          <h1 className="text-xl font-bold text-[#F0F0F0] text-center mb-1">
            Entrar na sua conta
          </h1>
          <p className="text-sm text-[#8A8A8A] text-center mb-6">
            Escolha como quer continuar
          </p>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 border border-[#2D2D2D] rounded-[0.75rem] py-3.5 px-4 text-sm font-semibold text-[#C0C0C0] hover:bg-[#1F1F1F] transition-colors mb-3"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          {/* Apple */}
          <button
            onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-[#1F1F1F] rounded-[0.75rem] py-3.5 px-4 text-sm font-semibold text-white hover:bg-[#2A2A2A] transition-colors"
          >
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M13.544 9.63c-.02-2.16 1.763-3.198 1.843-3.25-1.004-1.469-2.566-1.67-3.124-1.692-1.326-.135-2.594.784-3.268.784-.674 0-1.71-.766-2.813-.745-1.44.02-2.773.84-3.516 2.127C.88 9.198 1.99 13.44 3.726 15.77c.862 1.236 1.886 2.621 3.228 2.57 1.297-.05 1.786-.836 3.353-.836 1.567 0 2.006.836 3.374.81 1.398-.023 2.281-1.258 3.133-2.502.988-1.43 1.397-2.814 1.419-2.886-.03-.013-2.72-1.044-2.689-4.296zM11.15 3.07C11.866 2.2 12.353.999 12.213 0c-1.141.046-2.52.76-3.337 1.62-.736.762-1.375 1.988-1.202 3.16 1.272.098 2.563-.646 3.476-1.71z" fill="white"/>
            </svg>
            Continuar com Apple
          </button>

          <div className="mt-6 pt-6 border-t border-[#2D2D2D]">
            <p className="text-xs text-[#9CA3AF] text-center leading-relaxed">
              Ao continuar, você concorda com nossos{" "}
              <Link href="/dashboard/termos" className="text-[#C084FC]">Termos de Uso</Link>{" "}
              e{" "}
              <Link href="/dashboard/privacidade" className="text-[#C084FC]">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
