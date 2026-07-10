"use client";

import { useState } from "react";

const ADMIN_PASSWORD = "evofit-admin-2026";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setAuthError("Senha incorreta.");
    }
  }

  async function handleAction(action: "grant" | "revoke") {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/add-subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: ADMIN_PASSWORD,
          action,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(
          action === "grant"
            ? `✓ Acesso liberado para ${email}`
            : `✓ Acesso revogado para ${email}`
        );
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Erro ao executar ação.");
      }
    } catch {
      setStatus("error");
      setMessage("Erro de conexão.");
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-white font-bold text-lg mb-4">Admin Evofit</h1>
          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha admin"
              className="w-full bg-[#111] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#A855F7]"
            />
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button type="submit" className="w-full bg-[#A855F7] text-white font-semibold py-3 rounded-lg text-sm">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-8 w-full max-w-sm space-y-6">
        <h1 className="text-white font-bold text-lg">Admin Evofit</h1>

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@cliente.com"
          className="w-full bg-[#111] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#A855F7]"
        />

        {message && (
          <p className={`text-xs text-center ${status === "success" ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction("grant")}
            disabled={status === "loading" || !email}
            className="bg-[#A855F7] text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-50"
          >
            ✓ Liberar acesso
          </button>
          <button
            onClick={() => handleAction("revoke")}
            disabled={status === "loading" || !email}
            className="bg-[#EF4444] text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-50"
          >
            ✕ Revogar acesso
          </button>
        </div>

        <p className="text-[#B8B8B8] text-xs text-center">
          Liberar = ativa o acesso ao Evofit<br />
          Revogar = bloqueia imediatamente
        </p>
      </div>
    </div>
  );
}
