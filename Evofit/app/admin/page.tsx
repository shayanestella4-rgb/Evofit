"use client";

import { useState, useCallback } from "react";

const ADMIN_PASSWORD = "evofit-admin-2026";

interface Stats {
  totalUsers: number;
  newUsersLast7Days: number;
  activeSubscriptions: number;
  subscriptionsByStatus: Record<string, number>;
  quiz: {
    totalSessions: number;
    answered: number;
    emailCaptured: number;
    reachedOffer: number;
    purchased: number;
    funnel: { step: number; label: string; reachedCount: number }[];
  };
  workouts: {
    totalCompletions: number;
    byUser: {
      email: string;
      completedTotal: number;
      cycleNumber: number;
      completedInCycle: number;
      remainingInCycle: number;
      lastCompletedAt: string | null;
    }[];
  };
}

interface Lead {
  id: string;
  email: string;
  answers: Record<string, unknown> | null;
  progress: number;
  reachedOffer: boolean;
  purchased: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [leadsError, setLeadsError] = useState("");
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setStatsError("");
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      if (res.ok) setStats(data);
      else setStatsError(data.error || "Erro ao carregar estatísticas.");
    } catch {
      setStatsError("Erro de conexão ao carregar estatísticas.");
    }
  }, []);

  const loadLeads = useCallback(async () => {
    setLeadsError("");
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      if (res.ok) setLeads(data.leads);
      else setLeadsError(data.error || "Erro ao carregar leads.");
    } catch {
      setLeadsError("Erro de conexão ao carregar leads.");
    }
  }, []);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      loadStats();
      loadLeads();
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

  const maxFunnelCount = stats?.quiz.funnel[0]?.reachedCount || 1;

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-white font-bold text-xl">Admin Evofit</h1>

        {statsError && <p className="text-red-400 text-xs">{statsError}</p>}

        {stats && (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Usuários cadastrados" value={stats.totalUsers} sub={`+${stats.newUsersLast7Days} últimos 7 dias`} />
              <StatCard label="Assinaturas ativas" value={stats.activeSubscriptions} />
              <StatCard label="Fizeram o quiz" value={stats.quiz.totalSessions} />
              <StatCard label="Compraram (via quiz)" value={stats.quiz.purchased} />
            </div>

            {/* Funil do quiz */}
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6">
              <h2 className="text-white font-bold text-sm mb-4">Funil do quiz</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label="Acessaram" value={stats.quiz.totalSessions} small />
                <StatCard label="Responderam ≥1 pergunta" value={stats.quiz.answered} small />
                <StatCard label="Deixaram o email" value={stats.quiz.emailCaptured} small />
                <StatCard label="Chegaram na oferta" value={stats.quiz.reachedOffer} small />
              </div>

              <p className="text-[#8A8A8A] text-xs mb-3">Onde as pessoas param (cada linha = quantas chegaram até ali):</p>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {stats.quiz.funnel.map((f) => (
                  <div key={f.step} className="flex items-center gap-2 text-xs">
                    <span className="text-[#6B7280] w-5 shrink-0 text-right">{f.step}</span>
                    <div className="flex-1 bg-[#111] rounded h-6 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#A855F7]/40 rounded"
                        style={{ width: `${Math.max(2, (f.reachedCount / maxFunnelCount) * 100)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-[#F0F0F0] truncate">{f.label}</span>
                    </div>
                    <span className="text-[#C0C0C0] w-10 shrink-0 text-right font-semibold">{f.reachedCount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treinos concluídos (ciclo de 120) */}
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6">
              <h2 className="text-white font-bold text-sm mb-1">Treinos concluídos</h2>
              <p className="text-[#8A8A8A] text-xs mb-4">
                O ciclo (fase de treino + variedade de exercícios) muda a cada 120 treinos concluídos por pessoa.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label="Total de treinos concluídos" value={stats.workouts.totalCompletions} small />
              </div>

              {stats.workouts.byUser.length === 0 && (
                <p className="text-[#6B7280] text-xs">Ninguém concluiu um treino ainda.</p>
              )}
              {stats.workouts.byUser.length > 0 && (
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {stats.workouts.byUser.map((u) => (
                    <div key={u.email} className="flex items-center gap-3 px-3 py-2.5 border border-[#2D2D2D] rounded-lg text-xs">
                      <span className="flex-1 min-w-0 truncate text-[#F0F0F0]">{u.email}</span>
                      <span className="text-[#8A8A8A] shrink-0">
                        {u.completedInCycle}/120 no ciclo {u.cycleNumber}
                      </span>
                      <span className="text-[#6B7280] shrink-0 font-semibold">{u.completedTotal} total</span>
                      {u.lastCompletedAt && (
                        <span className="text-[#6B7280] shrink-0 hidden sm:inline">
                          {new Date(u.lastCompletedAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Leads do quiz (quem deixou email) */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6">
          <h2 className="text-white font-bold text-sm mb-1">Leads do quiz</h2>
          <p className="text-[#8A8A8A] text-xs mb-4">
            Quem deixou o email, mais recente primeiro{leads ? ` (${leads.length})` : ""}.
          </p>
          {leadsError && <p className="text-red-400 text-xs">{leadsError}</p>}
          {leads && leads.length === 0 && (
            <p className="text-[#6B7280] text-xs">Ninguém deixou o email ainda.</p>
          )}
          {leads && leads.length > 0 && (
            <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
              {leads.map((lead) => {
                const isOpen = expandedLeadId === lead.id;
                return (
                  <div key={lead.id} className="border border-[#2D2D2D] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedLeadId(isOpen ? null : lead.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#1E1035]/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#F0F0F0] truncate">{lead.email}</p>
                        <p className="text-[10px] text-[#6B7280]">
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#8A8A8A] shrink-0">{lead.progress}% do quiz</span>
                      {lead.purchased && (
                        <span className="text-[10px] font-semibold text-green-400 shrink-0">✓ comprou</span>
                      )}
                      {!lead.purchased && lead.reachedOffer && (
                        <span className="text-[10px] font-semibold text-yellow-400 shrink-0">viu a oferta</span>
                      )}
                      <span className="text-[#6B7280] shrink-0">{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && lead.answers && (
                      <div className="px-3 py-3 bg-[#111] border-t border-[#2D2D2D] grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {Object.entries(lead.answers).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-[#6B7280]">{key}:</span>{" "}
                            <span className="text-[#C0C0C0]">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Liberar/revogar acesso manual */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6 space-y-4">
          <h2 className="text-white font-bold text-sm">Liberar/revogar acesso</h2>
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
    </div>
  );
}

function StatCard({ label, value, sub, small }: { label: string; value: number; sub?: string; small?: boolean }) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4">
      <p className={`font-extrabold text-white ${small ? "text-lg" : "text-2xl"}`}>{value}</p>
      <p className="text-[#8A8A8A] text-[11px] mt-0.5 leading-snug">{label}</p>
      {sub && <p className="text-[#6B7280] text-[10px] mt-0.5">{sub}</p>}
    </div>
  );
}
