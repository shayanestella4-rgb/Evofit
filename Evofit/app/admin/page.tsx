"use client";

import { useState, useCallback, useMemo } from "react";
import { getExerciseCatalog, getWorkoutForDay, getWorkoutFromExerciseIds, getWeekSchedule } from "@/lib/workout";
import type { ManualExerciseEntry, ManualTechnique } from "@/lib/workout";
import { computeCycleStatus } from "@/lib/cycle";

const ADMIN_PASSWORD = "evofit-admin-2026";
const DAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const GROUP_LABELS: Record<string, string> = {
  quadriceps: "Quadríceps", gluteos: "Glúteos", posteriores: "Posteriores", panturrilha: "Panturrilha",
  peito: "Peito", costas: "Costas", ombros: "Ombros", biceps: "Bíceps", triceps: "Tríceps",
  core: "Abdômen", trapezio: "Trapézio", antebraco: "Antebraço", cardio: "Cardio",
};
const TECHNIQUE_LABELS: Record<"" | ManualTechnique, string> = {
  "": "Normal", dropset: "🔥 Dropset", cluster: "⚡ Cluster set", restpause: "⏸️ Rest-pause", biset: "🔗 Bi-set (com o próximo)",
};

function normalizeEntries(raw: unknown): ManualExerciseEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e) => (typeof e === "string" ? { id: e } : e));
}

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

interface AnamneseForm {
  nome: string; idade: string; sexo: string; peso: string; altura: string;
  objetivo: string; nivel: string; diasTreino: string; tempoTreino: string; sono: string;
  lesoes: string[]; lesoesDetalhe: string;
}

const BLANK_ANAMNESE: AnamneseForm = {
  nome: "", idade: "", sexo: "Feminino", peso: "", altura: "",
  objetivo: "", nivel: "", diasTreino: "", tempoTreino: "", sono: "",
  lesoes: [], lesoesDetalhe: "",
};

const OBJETIVO_OPTS = ["Perder gordura", "Ganhar músculo", "Melhorar condicionamento", "Mais disposição e saúde"];
const NIVEL_OPTS = ["Iniciante (nunca treinei)", "Intermediário (já tenho uma certa experiência com os exercícios)", "Avançado (treino regularmente)"];
const DIAS_OPTS = ["2 dias", "3 dias", "4 dias", "5+ dias"];
const TEMPO_OPTS = ["40 min", "1h", "1h30"];
const SONO_OPTS = ["Durmo bem (7h+)", "Durmo mal (menos de 6h)", "Irregular"];
const LESOES_OPTS: [string, string][] = [
  ["Condromalácia", "Condromalácia (desgaste da cartilagem do joelho)"],
  ["Joelho", "Outra lesão no joelho (menisco, ligamento, tendinite patelar)"],
  ["Coluna/lombar", "Dor lombar ou hérnia de disco"],
  ["Ombro", "Dor no ombro (tendinite, bursite, luxação)"],
  ["Punho/Cotovelo", "Tendinite ou dor no punho/cotovelo"],
  ["Quadril", "Dor no quadril (bursite, impacto femoroacetabular)"],
  ["Tornozelo", "Entorses frequentes ou instabilidade no tornozelo"],
  ["Osteoporose", "Osteoporose ou osteopenia"],
  ["Cardiovascular", "Hipertensão ou outro problema cardiovascular"],
  ["Diabetes", "Diabetes"],
  ["Outra", "Outra condição não listada"],
  ["Nenhuma", "Nenhuma dessas"],
];

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

  const [anamneseEmail, setAnamneseEmail] = useState("");
  const [anamneseForm, setAnamneseForm] = useState<AnamneseForm | null>(null);
  const [anamneseFound, setAnamneseFound] = useState(false);
  const [anamneseStatus, setAnamneseStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");
  const [anamneseMessage, setAnamneseMessage] = useState("");

  const [overridesByDay, setOverridesByDay] = useState<Record<number, ManualExerciseEntry[]>>({});
  const [overrideDay, setOverrideDay] = useState(0);
  const [overrideSearch, setOverrideSearch] = useState("");
  const [overrideStatus, setOverrideStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const catalog = useMemo(() => getExerciseCatalog(), []);
  const catalogById = useMemo(() => new Map(catalog.map((e) => [e.id, e])), [catalog]);

  const [previewDay, setPreviewDay] = useState(0);
  const [previewCompletedTotal, setPreviewCompletedTotal] = useState(0);

  async function loadAnamnese() {
    const target = anamneseEmail.trim().toLowerCase();
    if (!target) return;
    setAnamneseStatus("loading");
    setAnamneseMessage("");
    setOverrideStatus("idle");
    try {
      const [anamneseRes, overridesRes] = await Promise.all([
        fetch("/api/admin/anamnese", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: ADMIN_PASSWORD, email: target }),
        }),
        fetch("/api/admin/overrides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: ADMIN_PASSWORD, email: target }),
        }),
      ]);
      const result = await anamneseRes.json();
      const overridesResult = await overridesRes.json();
      if (!anamneseRes.ok) {
        setAnamneseStatus("error");
        setAnamneseMessage(result.error || "Erro ao buscar.");
        return;
      }
      if (result.data) {
        setAnamneseForm({ ...BLANK_ANAMNESE, ...result.data, lesoes: result.data.lesoes ?? [] });
        setAnamneseFound(true);
      } else {
        setAnamneseForm({ ...BLANK_ANAMNESE });
        setAnamneseFound(false);
      }
      setPreviewCompletedTotal(result.completedTotal ?? 0);
      setPreviewDay(0);
      const rawOverrides = overridesResult.overrides ?? {};
      const normalized: Record<number, ManualExerciseEntry[]> = {};
      for (const key of Object.keys(rawOverrides)) {
        normalized[Number(key)] = normalizeEntries(rawOverrides[key]);
      }
      setOverridesByDay(normalized);
      setOverrideDay(0);
      setOverrideSearch("");
      setAnamneseStatus("idle");
    } catch {
      setAnamneseStatus("error");
      setAnamneseMessage("Erro de conexão.");
    }
  }

  async function saveAnamneseAdmin() {
    if (!anamneseForm) return;
    const target = anamneseEmail.trim().toLowerCase();
    setAnamneseStatus("saving");
    setAnamneseMessage("");
    try {
      const res = await fetch("/api/admin/anamnese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD, email: target, data: anamneseForm }),
      });
      const result = await res.json();
      if (res.ok) {
        setAnamneseStatus("saved");
        setAnamneseFound(true);
        setAnamneseMessage("✓ Salvo — o app dessa pessoa vai usar esses dados no próximo carregamento.");
      } else {
        setAnamneseStatus("error");
        setAnamneseMessage(result.error || "Erro ao salvar.");
      }
    } catch {
      setAnamneseStatus("error");
      setAnamneseMessage("Erro de conexão.");
    }
  }

  function toggleAnamneseLesao(value: string) {
    setAnamneseForm((prev) => {
      if (!prev) return prev;
      const has = prev.lesoes.includes(value);
      let lesoes: string[];
      if (value === "Nenhuma") {
        lesoes = has ? [] : ["Nenhuma"];
      } else if (has) {
        lesoes = prev.lesoes.filter((l) => l !== value);
      } else {
        lesoes = [...prev.lesoes.filter((l) => l !== "Nenhuma"), value];
      }
      return { ...prev, lesoes };
    });
  }

  function toggleOverrideExercise(id: string) {
    setOverridesByDay((prev) => {
      const current = prev[overrideDay] ?? [];
      const next = current.some((e) => e.id === id)
        ? current.filter((e) => e.id !== id)
        : [...current, { id }];
      return { ...prev, [overrideDay]: next };
    });
  }

  function setOverrideTechnique(id: string, technique: "" | ManualTechnique) {
    setOverridesByDay((prev) => {
      const current = prev[overrideDay] ?? [];
      const next = current.map((e) =>
        e.id === id
          ? technique
            ? { ...e, technique }
            : { id: e.id }
          : e
      );
      return { ...prev, [overrideDay]: next };
    });
  }

  async function saveOverrideDay() {
    const target = anamneseEmail.trim().toLowerCase();
    if (!target) return;
    setOverrideStatus("saving");
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD, email: target, dayIdx: overrideDay, exerciseIds: overridesByDay[overrideDay] ?? [] }),
      });
      setOverrideStatus(res.ok ? "saved" : "error");
    } catch {
      setOverrideStatus("error");
    }
  }

  async function clearOverrideDay() {
    const target = anamneseEmail.trim().toLowerCase();
    if (!target) return;
    setOverrideStatus("saving");
    try {
      const res = await fetch("/api/admin/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD, email: target, dayIdx: overrideDay, exerciseIds: [] }),
      });
      if (res.ok) {
        setOverridesByDay((prev) => ({ ...prev, [overrideDay]: [] }));
        setOverrideStatus("saved");
      } else {
        setOverrideStatus("error");
      }
    } catch {
      setOverrideStatus("error");
    }
  }

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

  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);

  async function handleRefund() {
    setStatus("loading");
    setMessage("");
    setRefundConfirmOpen(false);
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ADMIN_PASSWORD, email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(`✓ Reembolsado e acesso revogado para ${email}`);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Erro ao reembolsar.");
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
              className="w-full bg-[#111] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6B7F56]"
            />
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button type="submit" className="w-full bg-[#6B7F56] text-white font-semibold py-3 rounded-lg text-sm">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const maxFunnelCount = stats?.quiz.funnel[0]?.reachedCount || 1;

  const previewCycleNumber = computeCycleStatus(previewCompletedTotal).cycleNumber;
  const previewSchedule = anamneseForm ? getWeekSchedule(anamneseForm) : [];
  const previewManualEntries = overridesByDay[previewDay];
  const previewWorkout = anamneseForm
    ? previewManualEntries && previewManualEntries.length > 0
      ? getWorkoutFromExerciseIds(anamneseForm, previewManualEntries, previewCycleNumber)
      : getWorkoutForDay(anamneseForm, previewDay, previewCycleNumber)
    : null;

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
                        className="absolute inset-y-0 left-0 bg-[#6B7F56]/40 rounded"
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
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#1F2A1C]/40 transition-colors"
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

        {/* Editar treino/anamnese de um usuário */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-white font-bold text-sm">Editar treino de um usuário</h2>
            <p className="text-[#8A8A8A] text-xs mt-1">
              Busca pelo email — se a pessoa já treina, vem preenchido; se não, começa em branco.
              Salvar aqui atualiza o treino dela na próxima vez que abrir o app.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="email"
              value={anamneseEmail}
              onChange={(e) => setAnamneseEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadAnamnese()}
              placeholder="email@cliente.com"
              className="flex-1 bg-[#111] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6B7F56]"
            />
            <button
              onClick={loadAnamnese}
              disabled={anamneseStatus === "loading" || !anamneseEmail}
              className="bg-[#252525] text-white font-semibold px-5 rounded-lg text-sm disabled:opacity-50 shrink-0"
            >
              {anamneseStatus === "loading" ? "..." : "Buscar"}
            </button>
          </div>

          {anamneseForm && (
            <div className="space-y-4 pt-2 border-t border-[#2D2D2D]">
              {!anamneseFound && (
                <p className="text-[10px] text-yellow-500">Essa pessoa ainda não tem treino salvo no servidor — preencha e salve pra criar.</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FieldText label="Nome" value={anamneseForm.nome} onChange={(v) => setAnamneseForm((p) => p && { ...p, nome: v })} />
                <FieldText label="Idade" value={anamneseForm.idade} onChange={(v) => setAnamneseForm((p) => p && { ...p, idade: v })} type="number" />
                <FieldSelect label="Sexo" value={anamneseForm.sexo} options={["Feminino", "Masculino"]} onChange={(v) => setAnamneseForm((p) => p && { ...p, sexo: v })} />
                <FieldText label="Peso (kg)" value={anamneseForm.peso} onChange={(v) => setAnamneseForm((p) => p && { ...p, peso: v })} type="number" />
                <FieldText label="Altura (cm)" value={anamneseForm.altura} onChange={(v) => setAnamneseForm((p) => p && { ...p, altura: v })} type="number" />
                <FieldSelect label="Sono" value={anamneseForm.sono} options={SONO_OPTS} onChange={(v) => setAnamneseForm((p) => p && { ...p, sono: v })} />
                <FieldSelect label="Objetivo" value={anamneseForm.objetivo} options={OBJETIVO_OPTS} onChange={(v) => setAnamneseForm((p) => p && { ...p, objetivo: v })} />
                <FieldSelect label="Nível" value={anamneseForm.nivel} options={NIVEL_OPTS} onChange={(v) => setAnamneseForm((p) => p && { ...p, nivel: v })} />
                <FieldSelect label="Dias de treino" value={anamneseForm.diasTreino} options={DIAS_OPTS} onChange={(v) => setAnamneseForm((p) => p && { ...p, diasTreino: v })} />
                <FieldSelect label="Tempo por treino" value={anamneseForm.tempoTreino} options={TEMPO_OPTS} onChange={(v) => setAnamneseForm((p) => p && { ...p, tempoTreino: v })} />
              </div>

              <div>
                <label className="block text-[10px] text-[#8A8A8A] uppercase font-semibold tracking-wide mb-2">Condições / lesões</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {LESOES_OPTS.map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => toggleAnamneseLesao(value)}
                      className={`text-left px-3 py-2 rounded-lg text-[11px] border transition-colors ${
                        anamneseForm.lesoes.includes(value)
                          ? "bg-[#1F2A1C] border-[#6B7F56] text-[#A8B78A]"
                          : "bg-[#111] border-[#2D2D2D] text-[#8A8A8A]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {anamneseForm.lesoes.includes("Outra") && (
                  <input
                    type="text"
                    value={anamneseForm.lesoesDetalhe}
                    onChange={(e) => setAnamneseForm((p) => p && { ...p, lesoesDetalhe: e.target.value })}
                    placeholder="Qual condição?"
                    className="w-full mt-2 bg-[#111] border border-[#2D2D2D] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#6B7F56]"
                  />
                )}
              </div>

              {anamneseMessage && (
                <p className={`text-xs ${anamneseStatus === "error" ? "text-red-400" : "text-green-400"}`}>{anamneseMessage}</p>
              )}

              <button
                onClick={saveAnamneseAdmin}
                disabled={anamneseStatus === "saving"}
                className="w-full bg-[#6B7F56] text-white font-bold py-3 rounded-lg text-sm disabled:opacity-50"
              >
                {anamneseStatus === "saving" ? "Salvando..." : "💾 Salvar treino dessa pessoa"}
              </button>
            </div>
          )}
        </div>

        {/* Treino atual — visualização somente-leitura do que o app dela mostra */}
        {anamneseForm && anamneseFound && (
          <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-white font-bold text-sm">Treino atual dessa pessoa</h2>
              <p className="text-[#8A8A8A] text-xs mt-1">
                Exatamente o que o app dela mostra hoje — o algoritmo automático, ou o manual do
                dia, quando houver um. Ciclo atual: {previewCycleNumber} ({previewCompletedTotal}{" "}
                treinos concluídos no total). Edite os campos acima (sem precisar salvar) pra ver
                como o treino mudaria.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DAY_NAMES.map((name, i) => {
                const isManual = (overridesByDay[i] ?? []).length > 0;
                const isTraining = previewSchedule[i]?.isTraining ?? true;
                return (
                  <button
                    key={i}
                    onClick={() => setPreviewDay(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      previewDay === i
                        ? "bg-[#6B7F56] border-[#6B7F56] text-white"
                        : !isTraining
                        ? "bg-[#111] border-[#2D2D2D] text-[#4B5563]"
                        : isManual
                        ? "bg-[#1F2A1C] border-[#6B7F56] text-[#A8B78A]"
                        : "bg-[#111] border-[#2D2D2D] text-[#8A8A8A]"
                    }`}
                  >
                    {name.slice(0, 3)}{isManual ? " ✏️" : ""}
                  </button>
                );
              })}
            </div>

            {previewWorkout && (
              previewWorkout.isRest ? (
                <p className="text-sm text-[#8A8A8A]">😴 Descanso nesse dia.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{previewWorkout.emoji} {previewWorkout.name}</p>
                      <p className="text-[11px] text-[#8A8A8A]">{previewWorkout.muscleLabel} · ~{previewWorkout.duration} min</p>
                    </div>
                    {(overridesByDay[previewDay] ?? []).length > 0 && (
                      <span className="text-[10px] font-semibold text-[#A8B78A] bg-[#1F2A1C] border border-[#6B7F56] px-2 py-1 rounded-lg shrink-0">
                        ✏️ Manual
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {previewWorkout.exercises.map((ex, i) => (
                      <div key={`${ex.id}-${i}`} className="bg-[#111] border border-[#2D2D2D] rounded-lg px-3 py-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#F0F0F0] font-medium">{ex.name}</span>
                          <span className="text-[#8A8A8A] shrink-0">{ex.sets} · {ex.rest}</span>
                        </div>
                        {ex.biSetNote && <p className="text-[10px] text-[#A8B78A] mt-1">{ex.biSetNote}</p>}
                        {ex.jointCaution && <p className="text-[10px] text-yellow-500 mt-1">{ex.jointCaution}</p>}
                        {ex.beginnerCaution && <p className="text-[10px] text-sky-400 mt-1">{ex.beginnerCaution}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Treino manual por dia (substitui o algoritmo nesse dia) */}
        {anamneseForm && (
          <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-white font-bold text-sm">Treino manual por dia</h2>
              <p className="text-[#8A8A8A] text-xs mt-1">
                Escolhe o dia e monta a lista de exercícios exata pra essa pessoa — esse dia
                para de usar o algoritmo automático até você limpar de novo. Pra cada exercício
                dá pra escolher uma técnica (dropset, cluster, rest-pause). No bi-set, marque a
                técnica no primeiro exercício da dupla — ele se junta automaticamente com o
                próximo da lista, então adicione os dois em sequência.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DAY_NAMES.map((name, i) => {
                const count = (overridesByDay[i] ?? []).length;
                return (
                  <button
                    key={i}
                    onClick={() => { setOverrideDay(i); setOverrideStatus("idle"); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      overrideDay === i
                        ? "bg-[#6B7F56] border-[#6B7F56] text-white"
                        : count > 0
                        ? "bg-[#1F2A1C] border-[#6B7F56] text-[#A8B78A]"
                        : "bg-[#111] border-[#2D2D2D] text-[#8A8A8A]"
                    }`}
                  >
                    {name.slice(0, 3)}{count > 0 ? ` · ${count}` : ""}
                  </button>
                );
              })}
            </div>

            <div>
              <p className="text-[10px] text-[#8A8A8A] uppercase font-semibold tracking-wide mb-2">
                Selecionados pra {DAY_NAMES[overrideDay]} ({(overridesByDay[overrideDay] ?? []).length})
              </p>
              {(overridesByDay[overrideDay] ?? []).length === 0 ? (
                <p className="text-[11px] text-[#6B7280]">Nenhum — esse dia usa o algoritmo automático normalmente.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(overridesByDay[overrideDay] ?? []).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-1.5 bg-[#1F2A1C] border border-[#6B7F56] text-[#A8B78A] text-[11px] pl-2.5 pr-1 py-1 rounded-lg"
                    >
                      <span>{catalogById.get(entry.id)?.name ?? entry.id}</span>
                      <select
                        value={entry.technique ?? ""}
                        onChange={(e) => setOverrideTechnique(entry.id, e.target.value as "" | ManualTechnique)}
                        className="bg-[#111] border border-[#35402C] rounded text-[10px] text-[#A8B78A] px-1 py-0.5 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Object.entries(TECHNIQUE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => toggleOverrideExercise(entry.id)}
                        title="Clique pra remover"
                        className="text-[#8A8A8A] hover:text-white px-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <input
                type="text"
                value={overrideSearch}
                onChange={(e) => setOverrideSearch(e.target.value)}
                placeholder="Buscar exercício pra adicionar (ex: supino, glúteo, esteira...)"
                className="w-full bg-[#111] border border-[#2D2D2D] rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-[#6B7F56]"
              />
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {catalog
                  .filter((ex) =>
                    overrideSearch.trim().length === 0 ||
                    ex.name.toLowerCase().includes(overrideSearch.toLowerCase()) ||
                    (GROUP_LABELS[ex.group] ?? ex.group).toLowerCase().includes(overrideSearch.toLowerCase())
                  )
                  .map((ex) => {
                    const selected = (overridesByDay[overrideDay] ?? []).some((e) => e.id === ex.id);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => toggleOverrideExercise(ex.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs text-left border transition-colors ${
                          selected
                            ? "bg-[#1F2A1C] border-[#6B7F56] text-[#A8B78A]"
                            : "bg-[#111] border-[#2D2D2D] text-[#C0C0C0] hover:border-[#3A3A3A]"
                        }`}
                      >
                        <span className="truncate">{ex.name}</span>
                        <span className="text-[10px] text-[#6B7280] shrink-0">{GROUP_LABELS[ex.group] ?? ex.group}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {overrideStatus === "saved" && <p className="text-xs text-green-400">✓ Salvo.</p>}
            {overrideStatus === "error" && <p className="text-xs text-red-400">Erro ao salvar.</p>}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={saveOverrideDay}
                disabled={overrideStatus === "saving"}
                className="bg-[#6B7F56] text-white font-bold py-3 rounded-lg text-sm disabled:opacity-50"
              >
                {overrideStatus === "saving" ? "Salvando..." : `💾 Salvar ${DAY_NAMES[overrideDay]}`}
              </button>
              <button
                onClick={clearOverrideDay}
                disabled={overrideStatus === "saving" || (overridesByDay[overrideDay] ?? []).length === 0}
                className="bg-[#252525] text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-50"
              >
                ↩️ Voltar ao automático
              </button>
            </div>
          </div>
        )}

        {/* Liberar/revogar acesso manual */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-6 space-y-4">
          <h2 className="text-white font-bold text-sm">Liberar/revogar acesso</h2>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@cliente.com"
            className="w-full bg-[#111] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6B7F56]"
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
              className="bg-[#6B7F56] text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-50"
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

          <button
            onClick={() => setRefundConfirmOpen(true)}
            disabled={status === "loading" || !email}
            className="w-full bg-[#252525] border border-[#EF4444] text-[#FCA5A5] font-semibold py-3 rounded-lg text-sm disabled:opacity-50"
          >
            💸 Reembolsar pedido na Cakto
          </button>

          <p className="text-[#B8B8B8] text-xs text-center">
            Liberar = ativa o acesso ao Evofit · Revogar = bloqueia imediatamente<br />
            Reembolsar = devolve o dinheiro do último pedido pago e revoga o acesso na hora
          </p>
        </div>
      </div>

      {/* Confirmação de reembolso */}
      {refundConfirmOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-white font-bold text-lg mb-2">Reembolsar {email}?</h2>
            <p className="text-[#B8B8B8] text-sm leading-relaxed mb-5">
              Isso devolve o valor do pedido pago mais recente dessa pessoa na Cakto de verdade
              (dinheiro sai da sua conta) e revoga o acesso dela ao Evofit imediatamente. Não dá pra desfazer.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleRefund}
                className="w-full bg-[#EF4444] text-white font-bold py-3.5 rounded-lg text-sm hover:bg-[#DC2626] transition-colors"
              >
                Sim, reembolsar
              </button>
              <button
                onClick={() => setRefundConfirmOpen(false)}
                className="w-full text-sm text-[#CBD5E0] py-2 hover:text-[#C0C0C0] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
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

function FieldText({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-[10px] text-[#8A8A8A] uppercase font-semibold tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-[#2D2D2D] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6B7F56]"
      />
    </div>
  );
}

function FieldSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] text-[#8A8A8A] uppercase font-semibold tracking-wide mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-[#2D2D2D] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6B7F56]"
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
