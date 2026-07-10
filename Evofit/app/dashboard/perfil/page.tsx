"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  loadWorkoutLogs,
  getTotalWorkouts,
  getLast30DaysActivity,
  getWeeklyWorkouts,
  getProgramStatus,
} from "@/lib/workoutLog";

function calcIMC(weight: number, height: number) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function imcLabel(imc: number) {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "#F59E0B" };
  if (imc < 25)   return { label: "Peso normal",     color: "#10B981" };
  if (imc < 30)   return { label: "Sobrepeso",        color: "#F97316" };
  return           { label: "Obesidade",              color: "#EF4444" };
}

type MenuItem = { icon: string; label: string; href?: string; badge?: string; external?: boolean; whatsapp?: boolean };

const MENU_ITEMS: MenuItem[] = [
  { icon: "📋", label: "Refazer anamnese",         href: "/onboarding" },
  { icon: "🔒", label: "Privacidade e dados", href: "/dashboard/privacidade" },
  {
    icon: "💬",
    label: "Suporte via WhatsApp",
    href: "https://wa.me/551145527512?text=Olá%2C%20preciso%20de%20suporte%20com%20o%20Evofit",
    external: true,
    whatsapp: true,
  },
  { icon: "⭐", label: "Avaliar o app", href: "/dashboard/avaliacao" },
  { icon: "📄", label: "Termos de uso", href: "/dashboard/termos" },
];

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#25D366" className="w-[18px] h-[18px] shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const WEEK_LABELS = ["8ª", "7ª", "6ª", "5ª", "4ª", "3ª", "Passada"];

export default function PerfilPage() {
  const { anamnese, saveAnamnese, clearData, profilePhoto, setProfilePhoto } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const SIZE = 220;
          const canvas = document.createElement("canvas");
          canvas.width  = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext("2d")!;
          const min = Math.min(img.width, img.height);
          const sx  = (img.width  - min) / 2;
          const sy  = (img.height - min) / 2;
          ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.src = ev.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
    setProfilePhoto(dataUrl);
    e.target.value = "";
  }
  const router = useRouter();

  // Anamnese
  const name    = anamnese?.nome    ?? "—";
  const age     = Number(anamnese?.idade)  || 0;
  const height  = Number(anamnese?.altura) || 0;
  const goal    = anamnese?.objetivo ?? "—";
  const level   = anamnese?.nivel    ?? "—";
  const initial = name.charAt(0).toUpperCase();

  const [weight, setWeight] = useState(Number(anamnese?.peso) || 70);

  const imc     = height > 0 ? calcIMC(weight, height) : "—";
  const imcInfo = height > 0 ? imcLabel(Number(imc)) : { label: "—", color: "#CBD5E0" };

  // Dados de evolução (carregados do localStorage)
  const [totalWorkouts, setTotalWorkouts]   = useState(0);
  const [last30Days,    setLast30Days]       = useState<boolean[]>([]);
  const [weeklyData,    setWeeklyData]       = useState<number[]>([]);

  const [programStatus, setProgramStatus] = useState(() => getProgramStatus());

  useEffect(() => {
    setTotalWorkouts(getTotalWorkouts());
    setLast30Days(getLast30DaysActivity(30));
    setWeeklyData(getWeeklyWorkouts(7));
    setProgramStatus(getProgramStatus());
    // Suprimir warning de unused import
    void loadWorkoutLogs;
  }, []);

  const { daysInCycle, daysRemaining, isOverdue, cycleNumber, hasStartDate } = programStatus;

  function handleSaveWeight() {
    if (anamnese) saveAnamnese({ ...anamnese, peso: String(weight) });
  }

  function handleLogout() {
    clearData();
    router.push("/");
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      <h1 className="text-2xl font-extrabold text-[#F0F0F0] mb-6">Perfil</h1>

      {/* Avatar */}
      <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-5 flex items-center gap-4 mb-4">
        <div className="relative shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-full overflow-hidden bg-[#A855F7] flex items-center justify-center text-2xl font-black text-white hover:opacity-90 transition-opacity focus:outline-none"
            title="Trocar foto de perfil"
          >
            {profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePhoto} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </button>
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#1A1A1A] rounded-full border border-[#2D2D2D] flex items-center justify-center pointer-events-none shadow-sm">
            <span className="text-[9px]">📷</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#F0F0F0] truncate capitalize">{name}</p>
          <p className="text-sm text-[#B8B8B8]">{age > 0 ? `${age} anos` : "—"}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {goal !== "—" && (
              <span className="bg-[#1E1035] text-[#C084FC] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {goal}
              </span>
            )}
            {level !== "—" && (
              <span className="bg-[#252525] text-[#C0C0C0] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {level.split(" ")[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#1A1A1A] rounded-[1rem] p-4 border border-[#2D2D2D] text-center">
          <p className="text-xl font-extrabold text-[#C084FC]">{age || "—"}</p>
          <p className="text-[10px] text-[#CBD5E0]">Idade</p>
        </div>
        <div className="bg-[#1A1A1A] rounded-[1rem] p-4 border border-[#2D2D2D] text-center">
          <p className="text-xl font-extrabold text-[#C084FC]">{height || "—"}</p>
          <p className="text-[10px] text-[#CBD5E0]">Altura (cm)</p>
        </div>
        <div className="bg-[#1A1A1A] rounded-[1rem] p-4 border border-[#2D2D2D] text-center">
          <p className="text-xl font-extrabold" style={{ color: imcInfo.color }}>{imc}</p>
          <p className="text-[10px] text-[#CBD5E0]">IMC</p>
        </div>
      </div>

      {/* Label IMC */}
      {height > 0 && (
        <div
          className="rounded-[1rem] p-3 mb-4 flex items-center gap-2 border"
          style={{ backgroundColor: `${imcInfo.color}15`, borderColor: `${imcInfo.color}40` }}
        >
          <span className="text-sm">📊</span>
          <p className="text-xs font-semibold" style={{ color: imcInfo.color }}>
            IMC {imc} — {imcInfo.label}
          </p>
        </div>
      )}

      {/* ── EVOLUÇÃO DE TREINOS ─────────────────────────────────────────────── */}
      <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-4 mb-4">
        <p className="text-xs font-semibold text-[#C0C0C0] mb-4">🏋️ Evolução de treinos</p>

        {/* Ciclo de 30 dias + total de treinos */}
        <div className="flex items-end justify-between mb-2">
          <div>
            {hasStartDate ? (
              <>
                <p className="text-3xl font-extrabold text-[#C084FC] leading-none">
                  {isOverdue ? "30" : daysInCycle}
                </p>
                <p className="text-[10px] text-[#CBD5E0] mt-0.5">
                  {isOverdue ? "dias — programa vencido" : `dias no programa (ciclo ${cycleNumber})`}
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-[#CBD5E0] leading-none">—</p>
                <p className="text-[10px] text-[#CBD5E0] mt-0.5">faça a anamnese para começar</p>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#C0C0C0]">{totalWorkouts}</p>
            <p className="text-[10px] text-[#CBD5E0]">treinos no total</p>
          </div>
        </div>

        {/* Barra de progresso dos 30 dias */}
        <div className="h-2.5 bg-[#1E1035] rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${hasStartDate ? Math.round((daysInCycle / 30) * 100) : 0}%`,
              backgroundColor: isOverdue ? "#EF4444" : "#A855F7",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#CBD5E0] mb-5">
          <span>Dia {hasStartDate ? daysInCycle : 0}/30</span>
          <span>🔄 A cada 30 dias, programa é renovado</span>
        </div>

        {/* Heatmap — últimos 30 dias */}
        <p className="text-[10px] font-semibold text-[#CBD5E0] uppercase tracking-wide mb-2">
          Últimos 30 dias
        </p>
        {last30Days.length > 0 ? (
          <>
            <div className="grid grid-cols-10 gap-1 mb-1">
              {last30Days.map((trained, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm transition-colors ${
                    trained ? "bg-[#C084FC]" : "bg-[#252525]"
                  }`}
                  title={trained ? "Treinou" : "Descanso"}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-[#A855F7]" />
                <span className="text-[10px] text-[#CBD5E0]">Treinou</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-[#252525]" />
                <span className="text-[10px] text-[#CBD5E0]">Descansou</span>
              </div>
              <span className="text-[10px] text-[#CBD5E0] ml-auto">
                {last30Days.filter(Boolean).length} dias ativos
              </span>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-10 gap-1 mb-5">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-sm bg-[#252525]" />
            ))}
          </div>
        )}

        {/* Gráfico de frequência semanal */}
        <p className="text-[10px] font-semibold text-[#CBD5E0] uppercase tracking-wide mb-3">
          Frequência semanal (últimas 7 semanas)
        </p>
        <div className="space-y-1.5">
          {weeklyData.map((count, i) => {
            const isLast   = i === weeklyData.length - 1;
            const label    = isLast ? "Semana atual" : WEEK_LABELS[i] ?? `${weeklyData.length - i}ª sem.`;
            const barWidth = count > 0 ? Math.max(6, Math.round((count / 7) * 100)) : 0;

            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-[#CBD5E0] w-20 shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-[#252525] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLast ? "bg-[#A855F7]" : "bg-[#C4B5FD]"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#C0C0C0] w-8 text-right font-medium">
                  {count}d
                </span>
              </div>
            );
          })}
        </div>

        {/* Alerta de renovação */}
        {isOverdue && (
          <div className="mt-4 bg-[#2D0808] rounded-[0.75rem] p-3 border border-[#4A0A0A]">
            <p className="text-xs font-bold text-[#FCA5A5]">
              ⏰ Seu programa venceu! Renove para continuar evoluindo.
            </p>
            <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-relaxed">
              30 dias se passaram desde a última anamnese. Atualize seus dados e receba um novo programa.
            </p>
          </div>
        )}
        {!isOverdue && hasStartDate && daysRemaining <= 5 && daysRemaining > 0 && (
          <div className="mt-4 bg-[#1E1035] rounded-[0.75rem] p-3 border border-[#2D1B4E]">
            <p className="text-xs font-bold text-[#C084FC]">
              ⏰ Faltam apenas {daysRemaining} dia{daysRemaining !== 1 ? "s" : ""} para renovar!
            </p>
            <p className="text-[10px] text-[#C084FC] mt-0.5 leading-relaxed">
              Seu programa será atualizado em breve. Já vá pensando em seus novos objetivos.
            </p>
          </div>
        )}
      </div>

      {/* Atualizar peso */}
      <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-4 mb-4">
        <p className="text-xs font-semibold text-[#C0C0C0] mb-3">Atualizar peso atual</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeight((w) => Math.max(30, Math.round((w - 0.5) * 10) / 10))}
            className="w-10 h-10 rounded-full bg-[#252525] text-[#C0C0C0] font-bold text-lg hover:bg-[#1E1035] transition-colors"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <p className="text-3xl font-extrabold text-[#F0F0F0]">{weight}</p>
            <p className="text-xs text-[#CBD5E0]">kg</p>
          </div>
          <button
            onClick={() => setWeight((w) => Math.min(300, Math.round((w + 0.5) * 10) / 10))}
            className="w-10 h-10 rounded-full bg-[#A855F7] text-white font-bold text-lg hover:bg-[#9333EA] transition-colors"
          >
            +
          </button>
        </div>
        <button
          onClick={handleSaveWeight}
          className="w-full mt-3 border border-[#A855F7] text-[#C084FC] font-semibold py-2.5 rounded-[0.75rem] text-sm hover:bg-[#1E1035] transition-colors"
        >
          Salvar peso
        </button>
      </div>

      {/* Menu */}
      <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] overflow-hidden mb-4">
        {MENU_ITEMS.map((item, i) => (
          <div key={item.label}>
            {i > 0 && <div className="h-px bg-[#252525]" />}

            {item.href && item.external ? (
              /* Link externo (WhatsApp, etc.) */
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-4 hover:bg-[#052E16] transition-colors"
              >
                {item.whatsapp ? <WhatsAppIcon /> : <span className="text-base shrink-0">{item.icon}</span>}
                <p className="flex-1 text-sm font-medium text-[#C0C0C0]">{item.label}</p>
                {item.badge && (
                  <span className="text-[10px] bg-[#052E16] text-[#34D399] px-2 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
                <span className="text-[#CBD5E0] text-sm">›</span>
              </a>
            ) : item.href ? (
              /* Link interno */
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-4 hover:bg-[#1F1F1F] transition-colors"
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="flex-1 text-sm font-medium text-[#C0C0C0]">{item.label}</p>
                {item.badge && (
                  <span className="text-[10px] bg-[#052E16] text-[#34D399] px-2 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
                <span className="text-[#CBD5E0] text-sm">›</span>
              </Link>
            ) : (
              /* Botão sem ação ainda */
              <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#1F1F1F] transition-colors">
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="flex-1 text-left text-sm font-medium text-[#C0C0C0]">{item.label}</p>
                {item.badge && (
                  <span className="text-[10px] bg-[#1E1035] text-[#C084FC] px-2 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
                <span className="text-[#CBD5E0] text-sm">›</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Sair */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border border-[#FEE2E2] text-[#EF4444] font-semibold py-3.5 rounded-[0.75rem] text-sm hover:bg-[#2D0808] transition-colors"
      >
        Sair da conta
      </button>
    </div>
  );
}
