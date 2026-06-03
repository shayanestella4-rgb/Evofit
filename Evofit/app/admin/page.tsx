"use client";

import { useState } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === "evofit-admin-2026") {
      setAuthed(true);
    } else {
      setMessage("Senha incorreta.");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/add-subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: "evofit-admin-2026" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(`✓ Acesso liberado para ${email}`);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Erro ao adicionar.");
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
            {message && <p className="text-red-400 text-xs">{message}</p>}
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
      <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-white font-bold text-lg mb-1">Liberar acesso</h1>
        <p className="text-[#9CA3AF] text-sm mb-6">Cole o email do comprador para liberar o acesso ao Evofit.</p>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@comprador.com"
            required
            className="w-full bg-[#111] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#A855F7]"
          />
          {message && (
            <p className={`text-xs ${status === "success" ? "text-green-400" : "text-red-400"}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="w-full bg-[#A855F7] text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-50"
          >
            {status === "loading" ? "Liberando..." : "Liberar acesso"}
          </button>
        </form>
      </div>
    </div>
  );
}
