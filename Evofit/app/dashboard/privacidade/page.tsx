"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function PrivacidadePage() {
  const { anamnese, saveAnamnese } = useApp();

  const [email, setEmail]   = useState(anamnese?.email ?? "");
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  function handleSave() {
    const trimmed = email.trim();

    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Digite um e-mail válido.");
      return;
    }

    if (anamnese) {
      saveAnamnese({ ...anamnese, email: trimmed });
    }

    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleRemoveEmail() {
    setEmail("");
    if (anamnese) saveAnamnese({ ...anamnese, email: "" });
    setSaved(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-8">

      {/* Header */}
      <Link href="/dashboard/perfil" className="inline-flex items-center gap-1 text-sm text-[#C084FC] font-semibold mb-6 hover:underline">
        ← Voltar
      </Link>

      <h1 className="text-2xl font-extrabold text-[#F0F0F0] mb-1">Privacidade e dados</h1>
      <p className="text-sm text-[#B8B8B8] mb-6 leading-relaxed">
        O Evofit armazena seus dados <strong>somente no dispositivo</strong>. Nenhuma informação é enviada a servidores externos.
      </p>

      {/* Card: e-mail */}
      <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-5 mb-4">
        <p className="text-xs font-semibold text-[#C0C0C0] mb-1">📧 Seu e-mail</p>
        <p className="text-xs text-[#CBD5E0] mb-4 leading-relaxed">
          Usado futuramente para notificações e recuperação de conta. Fica salvo apenas aqui no seu celular.
        </p>

        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); setSaved(false); }}
          className="w-full border border-[#2D2D2D] rounded-[0.75rem] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/30 focus:border-[#A855F7] transition"
        />

        {error && (
          <p className="text-xs text-[#EF4444] mt-1.5">{error}</p>
        )}

        <button
          onClick={handleSave}
          className="w-full mt-3 bg-[#A855F7] text-white font-bold py-3 rounded-[0.75rem] hover:bg-[#9333EA] transition-colors text-sm"
        >
          {saved ? "✓ E-mail salvo!" : "Salvar e-mail"}
        </button>

        {anamnese?.email && (
          <button
            onClick={handleRemoveEmail}
            className="w-full mt-2 text-xs text-[#CBD5E0] py-1.5 hover:text-[#EF4444] transition-colors"
          >
            Remover e-mail salvo
          </button>
        )}
      </div>

      {/* Card: o que armazenamos */}
      <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-5 mb-4">
        <p className="text-xs font-semibold text-[#C0C0C0] mb-3">🗂️ O que está salvo no seu dispositivo</p>
        <ul className="space-y-2">
          {[
            { icon: "👤", text: "Nome, idade, sexo e medidas corporais" },
            { icon: "🎯", text: "Objetivo, nível e frequência de treinos" },
            { icon: "🏋️", text: "Histórico de treinos realizados" },
            { icon: "📧", text: "E-mail (opcional, apenas se informado)" },
          ].map((item) => (
            <li key={item.text} className="flex items-start gap-2.5">
              <span className="text-sm shrink-0 mt-0.5">{item.icon}</span>
              <p className="text-xs text-[#B8B8B8] leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 bg-[#052E16] rounded-[0.75rem] p-3 border border-[#BBF7D0]">
          <p className="text-xs text-[#15803D] font-semibold">
            ✅ Nenhum dado é compartilhado com terceiros ou enviado para servidores.
          </p>
        </div>
      </div>

      {/* Card: LGPD */}
      <div className="bg-[#1E1035] rounded-[1rem] border border-[#2D1B4E] p-4">
        <p className="text-xs font-semibold text-[#C084FC] mb-1">⚖️ Seus direitos (LGPD)</p>
        <p className="text-xs text-[#C0C0C0] leading-relaxed">
          Você pode solicitar a exclusão total dos seus dados a qualquer momento pelo suporte ou pela opção <strong>"Sair da conta"</strong> no perfil, que remove todos os dados locais.
        </p>
      </div>
    </div>
  );
}
