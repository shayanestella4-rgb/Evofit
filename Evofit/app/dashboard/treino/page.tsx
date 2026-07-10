"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { getWorkoutForDay, getWeekSchedule } from "@/lib/workout";
import {
  saveWorkoutLog,
  loadWorkoutLogs,
  getUnseenCycleMilestone,
  markCycleSeen,
  getProgramStatus,
} from "@/lib/workoutLog";
import { loadWeightLog, saveWeightEntry } from "@/lib/weightLog";
import type { WeightEntry } from "@/lib/weightLog";
import Link from "next/link";

import type { Exercise } from "@/lib/workout";

function toAppDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function TreinoPage() {
  const { anamnese, completedExercises, toggleExercise } = useApp();
  const [gifModal, setGifModal] = useState<Exercise | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [weightLog,   setWeightLog]   = useState<WeightEntry[]>([]);
  const [weightSaved, setWeightSaved] = useState(false);
  const { cycleNumber } = getProgramStatus();

  const todayIdx = toAppDay(new Date().getDay());
  const [selectedDay, setSelectedDay] = useState<number>(todayIdx);

  // Se hoje é descanso, pré-seleciona o primeiro dia de treino da semana
  useEffect(() => {
    if (!anamnese) return;
    const schedule = getWeekSchedule(anamnese);
    if (!schedule[todayIdx]?.isTraining) {
      const first = schedule.findIndex((d) => d.isTraining);
      if (first >= 0) setSelectedDay(first);
    }
  }, [anamnese, todayIdx]);

  const weekSchedule = anamnese ? getWeekSchedule(anamnese) : [];
  const trainingDays = weekSchedule
    .map((d, i) => ({ ...d, idx: i }))
    .filter((d) => d.isTraining);

  const workout    = getWorkoutForDay(anamnese, selectedDay, cycleNumber);
  const isViewing  = selectedDay !== todayIdx;

  const doneCount = workout.exercises.filter((ex) =>
    completedExercises.includes(ex.id)
  ).length;
  const totalEx  = workout.exercises.length;
  const progress = totalEx > 0 ? (doneCount / totalEx) * 100 : 0;
  const allDone  = totalEx > 0 && doneCount === totalEx;

  const [milestone,   setMilestone]   = useState<number | null>(null);
  const [loggedToday, setLoggedToday] = useState(() => {
    if (typeof window === "undefined") return false;
    const logs = loadWorkoutLogs();
    return logs.some((l) => l.dateStr === new Date().toDateString());
  });

  // Loga o treino automaticamente quando todos os exercícios forem concluídos
  useEffect(() => {
    if (!allDone || loggedToday || workout.isRest || !anamnese || isViewing) return;

    setLoggedToday(true);
    const entry = {
      dateStr:       new Date().toDateString(),
      isoDate:       new Date().toISOString(),
      workoutName:   workout.name,
      exerciseCount: totalEx,
    };
    saveWorkoutLog(entry);
    const unseen = getUnseenCycleMilestone();
    if (unseen !== null) setMilestone(unseen);
  }, [allDone, loggedToday, workout, anamnese, totalEx, isViewing]);

  // Carrega histórico de carga ao abrir modal de exercício
  useEffect(() => {
    if (!gifModal) { setWeightInput(""); setWeightLog([]); setWeightSaved(false); return; }
    const log = loadWeightLog(gifModal.id);
    setWeightLog(log);
    const last = log[log.length - 1];
    setWeightInput(last ? String(last.weight) : "");
    setWeightSaved(false);
  }, [gifModal]);

  function handleSaveWeight() {
    if (!gifModal || !weightInput) return;
    const kg = parseFloat(weightInput.replace(",", "."));
    if (isNaN(kg) || kg <= 0) return;
    const updated = saveWeightEntry(gifModal.id, kg);
    setWeightLog(updated);
    setWeightSaved(true);
    setTimeout(() => setWeightSaved(false), 2000);
  }

  function handleCloseMilestone() {
    if (milestone !== null) markCycleSeen(milestone);
    setMilestone(null);
  }

  // ── Sem anamnese ────────────────────────────────────────────────────────────
  if (!anamnese) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 pb-4 flex flex-col items-center text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-xl font-extrabold text-[#F0F0F0] mb-2">Anamnese necessária</h1>
        <p className="text-sm text-[#B8B8B8] mb-6">
          Preencha sua avaliação inicial para receber um treino personalizado.
        </p>
        <Link
          href="/onboarding"
          className="bg-[#A855F7] text-white font-bold px-6 py-3 rounded-[0.75rem] hover:bg-[#9333EA] transition-colors"
        >
          Fazer anamnese
        </Link>
      </div>
    );
  }

  // ── Layout principal ────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-8 pb-4">

        {/* Seletor de dias de treino da semana */}
        {trainingDays.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] text-[#CBD5E0] font-semibold uppercase tracking-wide mb-2">
              Seus treinos desta semana
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {trainingDays.map(({ idx, day, emoji }) => {
                const isSelected = selectedDay === idx;
                const isToday    = idx === todayIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(idx)}
                    className={`flex flex-col items-center px-4 py-2.5 rounded-[0.875rem] shrink-0 min-w-[64px] transition-all ${
                      isSelected
                        ? "bg-[#A855F7] text-white shadow-md shadow-purple-200"
                        : "bg-[#252525] text-[#C0C0C0] hover:bg-[#1E1035]"
                    }`}
                  >
                    <span className="text-lg leading-none">{emoji}</span>
                    <span className={`text-xs font-bold mt-1 ${isToday && !isSelected ? "text-[#C084FC]" : ""}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className={`text-[9px] font-semibold mt-0.5 ${isSelected ? "text-purple-200" : "text-[#C084FC]"}`}>
                        hoje
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Banner de visualização */}
        {isViewing && !workout.isRest && (
          <div className="bg-[#1E1035] rounded-[0.75rem] px-3 py-2 mb-4 flex items-center gap-2">
            <span className="text-sm">👀</span>
            <p className="text-xs font-semibold text-[#C084FC]">
              Visualizando treino de {DAY_NAMES[selectedDay]}
            </p>
          </div>
        )}

        {/* ── Dia de descanso ─────────────────────────────────────────────────── */}
        {workout.isRest ? (
          <div className="flex flex-col items-center text-center pt-6">
            <div className="text-6xl mb-6">😴</div>
            <h1 className="text-2xl font-extrabold text-[#F0F0F0] mb-2">Dia de descanso</h1>
            <p className="text-sm text-[#B8B8B8] max-w-xs leading-relaxed mb-8">
              Seu corpo cresce durante o descanso. Aproveite para recuperar e voltar mais forte amanhã.
            </p>
            <div className="bg-[#1E1035] rounded-[1rem] p-4 border border-[#2D1B4E] w-full text-left">
              <p className="text-xs font-semibold text-[#C084FC] mb-2">💡 Sugestões para hoje</p>
              <ul className="space-y-1.5 text-sm text-[#C0C0C0]">
                <li>• Alongamento leve por 15 minutos</li>
                <li>• Caminhada de 20-30 minutos</li>
                <li>• Hidrate bem — beba 2L de água</li>
                <li>• Durma cedo para recuperar</li>
              </ul>
            </div>
            <Link href="/dashboard" className="mt-6 text-sm text-[#C084FC] font-semibold hover:underline">
              ← Voltar ao início
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5">
              <p className="text-xs text-[#C084FC] font-semibold uppercase tracking-wide mb-1">
                {workout.emoji} {isViewing ? `Treino de ${DAY_NAMES[selectedDay]}` : "Treino de hoje"}
              </p>
              <h1 className="text-2xl font-extrabold text-[#F0F0F0]">{workout.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-[#1E1035] text-[#C084FC] text-xs px-2.5 py-1 rounded-full font-semibold">
                  {workout.duration} min
                </span>
                <span className="bg-[#1E1035] text-[#C084FC] text-xs px-2.5 py-1 rounded-full font-semibold">
                  {totalEx} exercícios
                </span>
                <span className="bg-[#1E1035] text-[#C084FC] text-xs px-2.5 py-1 rounded-full font-semibold">
                  {workout.muscleLabel}
                </span>
              </div>
            </div>

            {/* Barra de progresso — só no treino de hoje */}
            {!isViewing && (
              <div className="bg-[#1A1A1A] rounded-[1rem] p-4 border border-[#2D2D2D] mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#C0C0C0]">Progresso</span>
                  <span className="text-xs text-[#C084FC] font-bold">{doneCount} / {totalEx}</span>
                </div>
                <div className="h-2 bg-[#1E1035] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {allDone && (
                  <p className="text-center text-sm font-bold text-[#10B981] mt-3">
                    🎉 Treino concluído! Incrível!
                  </p>
                )}
              </div>
            )}

            {/* Dica */}
            {workout.exercises[0]?.tip && (
              <div className="bg-[#1E1035] rounded-[1rem] p-3 border border-[#2D1B4E] mb-4 flex gap-2 items-start">
                <span className="text-sm shrink-0">💡</span>
                <p className="text-xs text-[#C0C0C0] leading-relaxed">{workout.exercises[0].tip}</p>
              </div>
            )}

            {/* Lista de exercícios */}
            <div className="space-y-3">
              {workout.exercises.map((ex, i) => {
                const isDone = !isViewing && completedExercises.includes(ex.id);
                return (
                  <div
                    key={ex.id}
                    className={`rounded-[1rem] border transition-all ${
                      isDone ? "bg-[#052E16] border-[#10B981]" : "bg-[#1A1A1A] border-[#2D2D2D]"
                    }`}
                  >
                    <button
                      onClick={() => !isViewing && toggleExercise(ex.id)}
                      disabled={isViewing}
                      className={`w-full text-left p-4 ${!isViewing ? "active:scale-[0.98] transition-transform" : "cursor-default"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
                          isDone ? "bg-[#10B981] text-white" : "bg-[#252525] text-[#B8B8B8]"
                        }`}>
                          {isDone ? "✓" : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isDone ? "text-[#34D399] line-through" : "text-[#F0F0F0]"}`}>
                            {ex.name}
                          </p>
                          <p className="text-xs text-[#CBD5E0] mt-0.5">{ex.muscle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-[#C084FC]">{ex.sets}</p>
                          <p className="text-[10px] text-[#CBD5E0]">Descanso {ex.rest}</p>
                        </div>
                      </div>
                    </button>

                    {ex.gif && (
                      <button
                        onClick={() => setGifModal(ex)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-[#252525] text-[10px] font-semibold text-[#C084FC] hover:bg-[#1E1035] transition-colors rounded-b-[1rem]"
                      >
                        <span>▶</span> Ver demonstração
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botão de conclusão — só no treino de hoje */}
            {!isViewing && allDone && (
              <Link href="/dashboard">
                <button className="w-full mt-5 bg-[#10B981] text-white font-bold py-4 rounded-[0.75rem] hover:bg-[#059669] transition-colors shadow-lg shadow-emerald-950">
                  Treino concluído ✓ — Voltar ao início
                </button>
              </Link>
            )}
          </>
        )}
      </div>

      {/* ── Modal de milestone (100, 200, 300… treinos) ──────────────────────── */}
      {milestone !== null && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-[1.5rem] p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-2xl font-extrabold text-[#F0F0F0] mb-1">
              {milestone}º mês concluído!
            </h2>
            <p className="text-sm text-[#B8B8B8] leading-relaxed mb-4">
              Você completou <strong>30 dias de programa</strong> com o Evofit.
              Isso é dedicação de verdade. Parabéns! 🎉
            </p>
            <div className="bg-[#1E1035] rounded-[0.75rem] p-3 mb-5 border border-[#2D1B4E] text-left">
              <p className="text-xs font-bold text-[#C084FC] mb-1">
                ⚠️ Hora de renovar seu programa de treino
              </p>
              <p className="text-xs text-[#C084FC] leading-relaxed">
                Após 30 dias seu corpo se adaptou aos exercícios atuais.
                Para continuar evoluindo, atualize sua anamnese e receba um novo programa personalizado.
              </p>
            </div>
            <div className="space-y-2">
              <Link href="/onboarding" onClick={handleCloseMilestone}>
                <button className="w-full bg-[#A855F7] text-white font-bold py-3.5 rounded-[0.75rem] hover:bg-[#9333EA] transition-colors">
                  🔄 Renovar assinatura agora
                </button>
              </Link>
              <button
                onClick={handleCloseMilestone}
                className="w-full text-sm text-[#CBD5E0] py-2 hover:text-[#C0C0C0] transition-colors"
              >
                Lembrar depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de demonstração (GIF) ──────────────────────────────────────── */}
      {gifModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setGifModal(null)}
        >
          <div
            className="bg-[#1A1A1A] rounded-[1.5rem] w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gifModal.gif}
              alt={gifModal.name}
              className="w-full object-cover"
              style={{ maxHeight: "280px" }}
            />

            <div className="p-4">
              <p className="text-base font-extrabold text-[#F0F0F0] mb-0.5">{gifModal.name}</p>
              <p className="text-xs text-[#CBD5E0] mb-3">{gifModal.muscle}</p>

              <div className="flex gap-2 mb-3">
                <span className="bg-[#1E1035] text-[#C084FC] text-xs font-bold px-3 py-1 rounded-full">
                  {gifModal.sets}
                </span>
                <span className="bg-[#252525] text-[#C0C0C0] text-xs font-semibold px-3 py-1 rounded-full">
                  Descanso {gifModal.rest}
                </span>
              </div>

              <div className="bg-[#1E1035] rounded-[0.75rem] p-3 mb-4">
                <p className="text-[11px] text-[#C084FC] leading-relaxed">
                  💡 {gifModal.tip}
                </p>
              </div>

              {/* Registro de carga */}
              <div className="bg-[#252525] rounded-[0.75rem] p-3 mb-4">
                <p className="text-xs font-bold text-[#C0C0C0] mb-2">🏋️ Registrar carga</p>

                <div className="flex gap-2 items-center mb-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Ex: 20"
                    value={weightInput}
                    onChange={(e) => { setWeightInput(e.target.value); setWeightSaved(false); }}
                    className="flex-1 border border-[#3A3A3A] rounded-[0.5rem] px-3 py-2 text-sm font-semibold text-[#F0F0F0] focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
                  />
                  <span className="text-sm font-semibold text-[#B8B8B8]">kg</span>
                  <button
                    onClick={handleSaveWeight}
                    className={`px-4 py-2 rounded-[0.5rem] text-xs font-bold transition-colors ${
                      weightSaved
                        ? "bg-[#10B981] text-white"
                        : "bg-[#A855F7] text-white hover:bg-[#9333EA]"
                    }`}
                  >
                    {weightSaved ? "✓ Salvo" : "Salvar"}
                  </button>
                </div>

                {weightLog.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[#CBD5E0] mb-1">Histórico recente:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[...weightLog].reverse().slice(0, 5).map((entry, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            i === 0
                              ? "bg-[#1E1035] text-[#C084FC]"
                              : "bg-white text-[#B8B8B8] border border-[#2D2D2D]"
                          }`}
                        >
                          {entry.weight}kg
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setGifModal(null)}
                className="w-full bg-[#A855F7] text-white font-bold py-3 rounded-[0.75rem] hover:bg-[#9333EA] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
