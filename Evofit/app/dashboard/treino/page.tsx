"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { getTodayWorkout, getWorkoutBySlot } from "@/lib/workout";
import {
  saveWorkoutLog,
  loadWorkoutLogs,
  getUnseenCycleMilestone,
  markCycleSeen,
  getProgramStatus,
} from "@/lib/workoutLog";
import Link from "next/link";

import type { Exercise } from "@/lib/workout";

export default function TreinoPage() {
  const { anamnese, completedExercises, toggleExercise, overrideSlot } = useApp();
  const [gifModal, setGifModal] = useState<Exercise | null>(null);
  const { cycleNumber } = getProgramStatus();
  const workout = overrideSlot && anamnese
    ? getWorkoutBySlot(anamnese, overrideSlot, cycleNumber)
    : getTodayWorkout(anamnese, cycleNumber);

  const doneCount = workout.exercises.filter((ex) =>
    completedExercises.includes(ex.id)
  ).length;
  const totalEx      = workout.exercises.length;
  const progress     = totalEx > 0 ? (doneCount / totalEx) * 100 : 0;
  const allDone      = totalEx > 0 && doneCount === totalEx;

  // Estado do milestone (modal dos 100 treinos)
  const [milestone,   setMilestone]   = useState<number | null>(null);
  // Impede logar mais de uma vez por sessão
  const [loggedToday, setLoggedToday] = useState(() => {
    if (typeof window === "undefined") return false;
    const logs = loadWorkoutLogs();
    return logs.some((l) => l.dateStr === new Date().toDateString());
  });

  // Loga o treino automaticamente quando todos os exercícios forem concluídos
  useEffect(() => {
    if (!allDone || loggedToday || workout.isRest || !anamnese) return;

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
  }, [allDone, loggedToday, workout, anamnese, totalEx]);

  function handleCloseMilestone() {
    if (milestone !== null) markCycleSeen(milestone);
    setMilestone(null);
  }

  // ── Tela de descanso ────────────────────────────────────────────────────────
  if (workout.isRest) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 pb-4 flex flex-col items-center text-center">
        <div className="text-6xl mb-6">😴</div>
        <h1 className="text-2xl font-extrabold text-[#111827] mb-2">Dia de descanso</h1>
        <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed mb-8">
          Seu corpo cresce durante o descanso. Aproveite para recuperar e voltar mais forte amanhã.
        </p>
        <div className="bg-[#FFFBEB] rounded-[1rem] p-4 border border-[#FDE68A] w-full text-left">
          <p className="text-xs font-semibold text-[#D97706] mb-2">💡 Sugestões para hoje</p>
          <ul className="space-y-1.5 text-sm text-[#374151]">
            <li>• Alongamento leve por 15 minutos</li>
            <li>• Caminhada de 20-30 minutos</li>
            <li>• Hidrate bem — beba 2L de água</li>
            <li>• Durma cedo para recuperar</li>
          </ul>
        </div>
        <Link href="/dashboard" className="mt-6 text-sm text-[#7C3AED] font-semibold hover:underline">
          ← Voltar ao início
        </Link>
      </div>
    );
  }

  // ── Sem anamnese ────────────────────────────────────────────────────────────
  if (!anamnese) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 pb-4 flex flex-col items-center text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-xl font-extrabold text-[#111827] mb-2">Anamnese necessária</h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Preencha sua avaliação inicial para receber um treino personalizado.
        </p>
        <Link
          href="/onboarding"
          className="bg-[#7C3AED] text-white font-bold px-6 py-3 rounded-[0.75rem] hover:bg-[#6D28D9] transition-colors"
        >
          Fazer anamnese
        </Link>
      </div>
    );
  }

  // ── Treino principal ────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-8 pb-4">

        {/* Header */}
        <div className="mb-5">
          <p className="text-xs text-[#D97706] font-semibold uppercase tracking-wide mb-1">
            {workout.emoji} Treino de hoje
          </p>
          <h1 className="text-2xl font-extrabold text-[#111827]">{workout.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-[#FFFBEB] text-[#D97706] text-xs px-2.5 py-1 rounded-full font-semibold">
              {workout.duration} min
            </span>
            <span className="bg-[#FFFBEB] text-[#D97706] text-xs px-2.5 py-1 rounded-full font-semibold">
              {totalEx} exercícios
            </span>
            <span className="bg-[#FFFBEB] text-[#D97706] text-xs px-2.5 py-1 rounded-full font-semibold">
              {workout.muscleLabel}
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="bg-white rounded-[1rem] p-4 border border-[#E5E7EB] mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#374151]">Progresso</span>
            <span className="text-xs text-[#D97706] font-bold">{doneCount} / {totalEx}</span>
          </div>
          <div className="h-2 bg-[#EDE9FE] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {allDone && (
            <p className="text-center text-sm font-bold text-[#10B981] mt-3">
              🎉 Treino concluído! Incrível!
            </p>
          )}
        </div>

        {/* Dica */}
        {workout.exercises[0]?.tip && (
          <div className="bg-[#FFFBEB] rounded-[1rem] p-3 border border-[#FDE68A] mb-4 flex gap-2 items-start">
            <span className="text-sm shrink-0">💡</span>
            <p className="text-xs text-[#374151] leading-relaxed">{workout.exercises[0].tip}</p>
          </div>
        )}

        {/* Lista de exercícios */}
        <div className="space-y-3">
          {workout.exercises.map((ex, i) => {
            const isDone = completedExercises.includes(ex.id);
            return (
              <div
                key={ex.id}
                className={`rounded-[1rem] border transition-all ${
                  isDone ? "bg-[#F0FDF4] border-[#10B981]" : "bg-white border-[#E5E7EB]"
                }`}
              >
                {/* Linha principal — toque para marcar feito */}
                <button
                  onClick={() => toggleExercise(ex.id)}
                  className="w-full text-left p-4 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
                      isDone ? "bg-[#10B981] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isDone ? "text-[#059669] line-through" : "text-[#111827]"}`}>
                        {ex.name}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{ex.muscle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#D97706]">{ex.sets}</p>
                      <p className="text-[10px] text-[#9CA3AF]">Descanso {ex.rest}</p>
                    </div>
                  </div>
                </button>

                {/* Botão "Ver demonstração" — só aparece se tiver GIF */}
                {ex.gif && (
                  <button
                    onClick={() => setGifModal(ex)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-[#F3F4F6] text-[10px] font-semibold text-[#D97706] hover:bg-[#FFFBEB] transition-colors rounded-b-[1rem]"
                  >
                    <span>▶</span> Ver demonstração
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Botão de conclusão */}
        {allDone && (
          <Link href="/dashboard">
            <button className="w-full mt-5 bg-[#10B981] text-white font-bold py-4 rounded-[0.75rem] hover:bg-[#059669] transition-colors shadow-lg shadow-emerald-100">
              Treino concluído ✓ — Voltar ao início
            </button>
          </Link>
        )}
      </div>

      {/* ── Modal de milestone (100, 200, 300… treinos) ──────────────────────── */}
      {milestone !== null && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-3">🏆</div>

            <h2 className="text-2xl font-extrabold text-[#111827] mb-1">
              {milestone}º mês concluído!
            </h2>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
              Você completou <strong>30 dias de programa</strong> com o Evofit.
              Isso é dedicação de verdade. Parabéns! 🎉
            </p>

            {/* Aviso de renovação */}
            <div className="bg-[#FEF3C7] rounded-[0.75rem] p-3 mb-5 border border-[#FDE68A] text-left">
              <p className="text-xs font-bold text-[#92400E] mb-1">
                ⚠️ Hora de renovar seu programa de treino
              </p>
              <p className="text-xs text-[#78350F] leading-relaxed">
                Após 30 dias seu corpo se adaptou aos exercícios atuais.
                Para continuar evoluindo, atualize sua anamnese e receba um novo programa personalizado.
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/onboarding" onClick={handleCloseMilestone}>
                <button className="w-full bg-[#7C3AED] text-white font-bold py-3.5 rounded-[0.75rem] hover:bg-[#6D28D9] transition-colors">
                  🔄 Renovar assinatura agora
                </button>
              </Link>
              <button
                onClick={handleCloseMilestone}
                className="w-full text-sm text-[#9CA3AF] py-2 hover:text-[#374151] transition-colors"
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
            className="bg-white rounded-[1.5rem] w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* GIF */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gifModal.gif}
              alt={gifModal.name}
              className="w-full object-cover"
              style={{ maxHeight: "280px" }}
            />

            {/* Info */}
            <div className="p-4">
              <p className="text-base font-extrabold text-[#111827] mb-0.5">{gifModal.name}</p>
              <p className="text-xs text-[#9CA3AF] mb-3">{gifModal.muscle}</p>

              <div className="flex gap-2 mb-3">
                <span className="bg-[#FFFBEB] text-[#D97706] text-xs font-bold px-3 py-1 rounded-full">
                  {gifModal.sets}
                </span>
                <span className="bg-[#F3F4F6] text-[#374151] text-xs font-semibold px-3 py-1 rounded-full">
                  Descanso {gifModal.rest}
                </span>
              </div>

              <div className="bg-[#FEF9C3] rounded-[0.75rem] p-3 mb-4">
                <p className="text-[11px] text-[#713F12] leading-relaxed">
                  💡 {gifModal.tip}
                </p>
              </div>

              <button
                onClick={() => setGifModal(null)}
                className="w-full bg-[#7C3AED] text-white font-bold py-3 rounded-[0.75rem] hover:bg-[#6D28D9] transition-colors"
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
