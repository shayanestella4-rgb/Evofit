"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { getDayDiet, DAY_NAMES } from "@/lib/diet";

// Gradiente de fallback por tipo de refeição (aparece enquanto a foto carrega
// ou se ela falhar — garante que o card sempre tenha visual bonito)
const MEAL_GRADIENT: Record<string, string> = {
  cafe:    "linear-gradient(135deg, #FEF3C7 0%, #F59E0B 100%)",
  lanche1: "linear-gradient(135deg, #D1FAE5 0%, #10B981 100%)",
  almoco:  "linear-gradient(135deg, #EDE9FE 0%, #7C3AED 100%)",
  lanche2: "linear-gradient(135deg, #DBEAFE 0%, #3B82F6 100%)",
  jantar:  "linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)",
};

export default function DietaPage() {
  const { anamnese } = useApp();
  const diet = getDayDiet(anamnese);

  const [done, setDone]         = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(diet.meals[0]?.id ?? null);
  // controla quais imagens já carregaram
  const [loaded, setLoaded]     = useState<Record<string, boolean>>({});

  function toggleDone(id: string) {
    setDone((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function toggleExpand(id: string) {
    setExpanded((prev) => prev === id ? null : id);
  }

  const consumed  = done.reduce((sum, id) => sum + (diet.meals.find((m) => m.id === id)?.kcal ?? 0), 0);
  const progress  = diet.totalKcal > 0 ? Math.min((consumed / diet.totalKcal) * 100, 100) : 0;
  const dayName   = DAY_NAMES[new Date().getDay()];
  const allDone   = done.length === diet.meals.length && diet.meals.length > 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-[#C084FC] font-semibold uppercase tracking-wide mb-1">
          Plano alimentar · {dayName}
        </p>
        <h1 className="text-2xl font-extrabold text-[#F0F0F0]">Dieta de hoje</h1>
        <p className="text-sm text-[#B8B8B8] mt-1">
          {anamnese
            ? `Personalizada para ${anamnese.nome?.split(" ")[0] ?? "você"} · ${anamnese.objetivo ?? "Condicionamento"}`
            : "Complete a anamnese para personalizar"}
        </p>
      </div>

      {/* Anel calórico + macros */}
      <div className="bg-[#1A1A1A] rounded-[1rem] p-5 border border-[#2D2D2D] mb-5">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#2D2D2D" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none"
                stroke="#A855F7" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                strokeLinecap="round" className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-extrabold text-[#F0F0F0]">{consumed}</span>
              <span className="text-[9px] text-[#CBD5E0]">kcal</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-[#B8B8B8] mb-1">
              <span>Consumido</span>
              <span className="font-semibold text-[#F0F0F0]">{consumed} / {diet.totalKcal} kcal</span>
            </div>
            <div className="h-1.5 bg-[#1E1035] rounded-full mb-3">
              <div className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-xs font-bold text-[#C084FC]">{diet.protein}g</p>
                <p className="text-[9px] text-[#CBD5E0]">Proteína</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-[#C084FC]">{diet.carbs}g</p>
                <p className="text-[9px] text-[#CBD5E0]">Carbo</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-[#10B981]">{diet.fat}g</p>
                <p className="text-[9px] text-[#CBD5E0]">Gordura</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de refeição */}
      <div className="space-y-3">
        {diet.meals.map((meal) => {
          const isDone     = done.includes(meal.id);
          const isExpanded = expanded === meal.id;
          const imgLoaded  = loaded[meal.id] ?? false;

          return (
            <div key={meal.id}
              className={`bg-[#1A1A1A] rounded-[1rem] border overflow-hidden transition-all ${
                isDone ? "border-[#10B981]" : "border-[#2D2D2D]"
              }`}
            >
              {/* Foto do prato */}
              <div className="relative w-full h-36 overflow-hidden"
                style={{ background: MEAL_GRADIENT[meal.id] ?? MEAL_GRADIENT.almoco }}>

                {/* A imagem começa invisível e aparece com fade ao carregar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meal.photo}
                  alt={meal.label}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                  style={{ opacity: imgLoaded ? 1 : 0 }}
                  onLoad={() => setLoaded((prev) => ({ ...prev, [meal.id]: true }))}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />

                {/* Overlay verde quando concluída */}
                {isDone && (
                  <div className="absolute inset-0 bg-[#10B981]/70 flex items-center justify-center z-10">
                    <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                      <span className="text-3xl text-[#10B981]">✓</span>
                    </div>
                  </div>
                )}

                {/* Gradiente inferior + nome (sempre visível) */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-[5]" />
                <div className="absolute bottom-2 left-3 flex items-center gap-2 z-[6]">
                  <span className="text-lg drop-shadow">{meal.emoji}</span>
                  <span className="text-white font-bold text-sm drop-shadow-sm">{meal.label}</span>
                </div>

                {/* Badge de kcal */}
                <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2.5 py-1 z-[6]">
                  <span className="text-white text-[11px] font-bold">{meal.kcal} kcal</span>
                </div>
              </div>

              {/* Barra de ações */}
              <div className="flex items-center px-4 py-2.5 gap-3">
                <p className="text-xs text-[#CBD5E0] flex-1">🕐 {meal.time}</p>
                <button
                  onClick={() => toggleExpand(meal.id)}
                  className="text-xs text-[#C084FC] font-semibold px-3 py-1.5 rounded-full bg-[#1E1035] hover:bg-[#1E1035] transition-colors"
                >
                  {isExpanded ? "Fechar ▲" : "Ver itens ▼"}
                </button>
                <button
                  onClick={() => toggleDone(meal.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isDone ? "bg-[#10B981] border-[#10B981] text-white" : "border-[#3A3A3A] hover:border-[#10B981]"
                  }`}
                >
                  {isDone && <span className="text-sm font-bold">✓</span>}
                </button>
              </div>

              {/* Lista de itens (colapsável) */}
              {isExpanded && (
                <div className="px-4 pb-3 border-t border-[#252525] pt-2.5 space-y-1.5">
                  {meal.items.map((item) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <p className="text-xs text-[#C0C0C0]">{item.name}</p>
                      <p className="text-xs text-[#CBD5E0] font-medium ml-2 shrink-0">{item.cals} kcal</p>
                    </div>
                  ))}
                  <div className="pt-1.5 mt-1.5 border-t border-[#252525] flex justify-between">
                    <p className="text-xs font-semibold text-[#C0C0C0]">Total da refeição</p>
                    <p className="text-xs font-bold text-[#C084FC]">{meal.kcal} kcal</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Parabéns */}
      {allDone && (
        <div className="mt-4 bg-[#052E16] rounded-[1rem] p-4 border border-[#166534] text-center">
          <p className="text-base font-extrabold text-[#34D399]">🎉 Plano do dia concluído!</p>
          <p className="text-xs text-[#B8B8B8] mt-1">Você seguiu toda a dieta de hoje. Incrível disciplina!</p>
        </div>
      )}

      {/* Hidratação */}
      <div className="mt-4 bg-[#0A1628] rounded-[1rem] p-4 border border-[#1E3A5F]">
        <p className="text-sm font-semibold text-[#60A5FA] mb-1">💧 Hidratação</p>
        <p className="text-xs text-[#93C5FD]">
          Meta: <strong>{diet.waterGoal}L</strong> de água hoje. Beba um copo agora e não espere ter sede!
        </p>
      </div>
    </div>
  );
}
