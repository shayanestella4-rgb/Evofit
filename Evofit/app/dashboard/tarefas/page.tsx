"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  getTaskForDay,
  getTaskHistory,
  calcStreak,
  calcTotalXP,
  type TaskHistoryEntry,
} from "@/lib/tasks";

export default function TarefasPage() {
  const { todayTaskDone, setTodayTaskDone } = useApp();

  const [streak,  setStreak]  = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);

  const dayIndex  = new Date().getDay();
  const todayTask = getTaskForDay(dayIndex);

  // Recalcula streak, XP e histórico quando todayTaskDone muda
  useEffect(() => {
    setStreak(calcStreak(todayTaskDone));
    setTotalXP(calcTotalXP(todayTaskDone));
    setHistory(getTaskHistory(6));
  }, [todayTaskDone]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-[#7C3AED] font-semibold uppercase tracking-wide mb-1">
          Motivação diária
        </p>
        <h1 className="text-2xl font-extrabold text-[#111827]">Suas tarefas</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Nova tarefa todo dia — mantenha a sequência! 🔥
        </p>
      </div>

      {/* Streak + XP */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#FFF7ED] rounded-[1rem] p-4 border border-[#FED7AA]">
          <p className="text-2xl mb-1">🔥</p>
          <p className="text-xl font-extrabold text-[#EA580C]">
            {streak} {streak === 1 ? "dia" : "dias"}
          </p>
          <p className="text-xs text-[#F97316]">Sequência atual</p>
        </div>
        <div className="bg-[#F5F3FF] rounded-[1rem] p-4 border border-[#EDE9FE]">
          <p className="text-2xl mb-1">⭐</p>
          <p className="text-xl font-extrabold text-[#7C3AED]">{totalXP} XP</p>
          <p className="text-xs text-[#7C3AED]">Pontos acumulados</p>
        </div>
      </div>

      {/* Tarefa de hoje */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">
          Tarefa de hoje
        </p>
        <div
          className={`rounded-[1rem] p-5 border transition-all ${
            todayTaskDone
              ? "bg-[#F0FDF4] border-[#10B981]"
              : "bg-white border-[#E5E7EB]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
              todayTaskDone ? "bg-[#DCFCE7]" : "bg-[#F5F3FF]"
            }`}>
              {todayTask.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-[#EDE9FE] text-[#7C3AED] px-2 py-0.5 rounded-full font-semibold">
                  {todayTask.category}
                </span>
                <span className="text-[10px] text-[#9CA3AF]">+{todayTask.xp} XP</span>
              </div>
              <h2 className="font-bold text-[#111827] text-base mb-1">{todayTask.title}</h2>
              <p className="text-xs text-[#6B7280] leading-relaxed">{todayTask.desc}</p>
            </div>
          </div>

          <button
            onClick={() => setTodayTaskDone(!todayTaskDone)}
            className={`w-full mt-4 py-3.5 rounded-[0.75rem] font-bold text-sm transition-all active:scale-[0.98] ${
              todayTaskDone
                ? "bg-[#10B981] text-white"
                : "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-violet-100"
            }`}
          >
            {todayTaskDone ? "✓ Tarefa concluída! Parabéns!" : "Marcar como feita"}
          </button>
        </div>
      </div>

      {/* Histórico dos últimos 6 dias */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">
          Últimos 6 dias
        </p>
        <div className="space-y-2">
          {history.map((entry, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-[0.75rem] px-4 py-3 border ${
                entry.done ? "bg-white border-[#E5E7EB]" : "bg-white border-[#F3F4F6]"
              }`}
            >
              <span className="text-base shrink-0">{entry.task.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  entry.done ? "text-[#374151]" : "text-[#9CA3AF] line-through"
                }`}>
                  {entry.task.title}
                </p>
                <p className="text-[10px] text-[#9CA3AF]">{entry.label}</p>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                entry.done
                  ? "bg-[#10B981] text-white"
                  : "bg-[#F3F4F6] text-[#D1D5DB]"
              }`}>
                {entry.done ? "✓" : "○"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dica */}
      <div className="bg-[#F5F3FF] rounded-[1rem] p-4 border border-[#EDE9FE]">
        <p className="text-xs font-semibold text-[#7C3AED] mb-1">💡 Dica do dia</p>
        <p className="text-xs text-[#374151] leading-relaxed">
          Completar pequenas tarefas diárias cria o hábito da disciplina. Em 21 dias consecutivos, isso vira rotina automática!
        </p>
      </div>
    </div>
  );
}
