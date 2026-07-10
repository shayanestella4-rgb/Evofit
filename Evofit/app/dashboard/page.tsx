"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getTodayWorkout, getWeekSchedule } from "@/lib/workout";
import { getProgramStatus, loadWorkoutLogs } from "@/lib/workoutLog";

// ─── Frases motivacionais ─────────────────────────────────────────────────────

const QUOTES: { text: string; author: string }[] = [
  { text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.", author: "Robert Collier" },
  { text: "Não espere por uma crise para descobrir o que é importante em sua vida.", author: "Platão" },
  { text: "Cuide do seu corpo. É o único lugar que você tem para viver.", author: "Jim Rohn" },
  { text: "A dor que você sente hoje é a força que você vai sentir amanhã.", author: "Arnold Schwarzenegger" },
  { text: "Você não precisa ser ótimo para começar, mas precisa começar para ser ótimo.", author: "Zig Ziglar" },
  { text: "O corpo consegue quase tudo. É a mente que você precisa convencer.", author: "Desconhecido" },
  { text: "Não pare quando estiver cansado. Pare quando tiver terminado.", author: "David Goggins" },
  { text: "Disciplina é a ponte entre metas e realizações.", author: "Jim Rohn" },
  { text: "Cada treino te aproxima da versão que você sempre quis ser.", author: "Desconhecido" },
  { text: "Não se compare a ninguém. Seja melhor do que você era ontem.", author: "Desconhecido" },
  { text: "A jornada de mil milhas começa com um único passo.", author: "Lao Tsé" },
  { text: "O único mau treino é aquele que não aconteceu.", author: "Desconhecido" },
  { text: "Seus limites existem apenas em sua mente.", author: "Roy T. Bennett" },
  { text: "A consistência bate a intensidade todos os dias.", author: "Desconhecido" },
  { text: "Grandes resultados exigem grandes ambições.", author: "Heráclito" },
  { text: "Você é mais forte do que pensa e mais capaz do que imagina.", author: "Desconhecido" },
  { text: "A saúde não é uma meta. É um estilo de vida.", author: "Desconhecido" },
  { text: "Invista em si mesmo. Seu corpo é sua casa para o resto da vida.", author: "Desconhecido" },
  { text: "O difícil é o que leva tempo. O impossível é o que leva um pouco mais.", author: "Fridtjof Nansen" },
  { text: "Faça hoje o que os outros não querem, tenha amanhã o que os outros não terão.", author: "Jerry Rice" },
  { text: "Movimento é remédio para criar mudança na saúde física, emocional e mental.", author: "Carol Welch" },
  { text: "Não se trata de ter tempo, mas de priorizar.", author: "Desconhecido" },
  { text: "O segredo da mudança é focar toda a sua energia não em lutar contra o velho, mas em construir o novo.", author: "Sócrates" },
  { text: "Acredite em si mesmo e você estará a meio caminho da vitória.", author: "Theodore Roosevelt" },
  { text: "Nada muda se nada mudar.", author: "Desconhecido" },
  { text: "Seu corpo ouve tudo que sua mente diz.", author: "Naomi Judd" },
  { text: "Progresso, não perfeição.", author: "Desconhecido" },
  { text: "Comece onde você está. Use o que você tem. Faça o que você pode.", author: "Arthur Ashe" },
  { text: "A força não vem da capacidade física. Vem de uma vontade indomável.", author: "Mahatma Gandhi" },
  { text: "Cada dia é uma nova oportunidade de ser mais saudável.", author: "Desconhecido" },
  { text: "Treinar é difícil. Ser fraco também é difícil. Escolha sua dificuldade.", author: "Desconhecido" },
];

/** Retorna a frase do dia — muda a cada dia do ano. */
function getTodayQuote() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function DashboardHome() {
  const { anamnese, completedExercises, todayTaskDone, profilePhoto, setProfilePhoto } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Redimensiona a imagem para 220×220 (crop central) e salva como JPEG base64 */
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
    // limpa o input para permitir selecionar a mesma foto novamente
    e.target.value = "";
  }

  const { cycleNumber } = getProgramStatus();
  const workout      = getTodayWorkout(anamnese, cycleNumber);
  const weekSchedule = getWeekSchedule(anamnese);

  const userName = anamnese?.nome ?? "você";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const initial = userName.charAt(0).toUpperCase();

  // Progresso do treino de hoje
  const doneCount = workout.exercises.filter((ex) =>
    completedExercises.includes(ex.id)
  ).length;
  const totalEx = workout.exercises.length;
  const workoutProgress = totalEx > 0 ? (doneCount / totalEx) * 100 : 0;

  // Dia atual (Seg=0...Dom=6)
  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // Datas dos treinos realmente realizados (do localStorage)
  const loggedDates = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>();
    const logs = loadWorkoutLogs();
    return new Set(logs.map((l) => l.dateStr));
  })[0];

  // Retorna a data real (toDateString) para o dia i da semana atual
  function weekDayDate(i: number): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = i - todayIndex;
    const d = new Date(today.getTime() + diff * 86400000);
    return d.toDateString();
  }

  const quote = getTodayQuote();

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[#B8B8B8]">{greeting} 👋</p>
          <h1 className="text-xl font-extrabold text-[#F0F0F0] capitalize">{userName}</h1>
        </div>
        {/* Avatar — toque para trocar foto */}
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full overflow-hidden bg-[#A855F7] flex items-center justify-center text-white font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#A855F7]/40"
            title="Trocar foto de perfil"
          >
            {profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePhoto} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </button>
          {/* Ícone de câmera pequeno no canto */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#1A1A1A] rounded-full border border-[#2D2D2D] flex items-center justify-center pointer-events-none">
            <span className="text-[8px]">📷</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      {/* Tira da semana */}
      <div className="flex gap-1.5 mb-6">
        {weekSchedule.map((item, i) => {
          const isToday   = i === todayIndex;
          const isPast    = i < todayIndex;
          const didTrain  = isPast && item.isTraining && loggedDates.has(weekDayDate(i));
          const missed    = isPast && item.isTraining && !loggedDates.has(weekDayDate(i));

          return (
            <div
              key={item.day}
              title={item.workoutName || "Descanso"}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-semibold transition-all ${
                isToday
                  ? "bg-[#A855F7] text-white"
                  : didTrain
                  ? "bg-[#1E1035] text-[#C084FC]"
                  : missed
                  ? "bg-[#1A1A1A] text-[#D1D5DB] border border-[#252525]"
                  : item.isTraining
                  ? "bg-white text-[#CBD5E0] border border-[#2D2D2D]"
                  : "bg-[#1A1A1A] text-[#D1D5DB] border border-[#252525]"
              }`}
            >
              {item.day}
              {didTrain && <span className="mt-0.5 text-[8px]">✓</span>}
              {missed    && <span className="mt-0.5 text-[8px]">✕</span>}
              {isToday   && <span className="mt-0.5 w-1 h-1 rounded-full bg-white" />}
            </div>
          );
        })}
      </div>

      {/* Card de treino */}
      {workout.isRest ? (
        <div className="bg-[#1A1A1A] rounded-[1rem] p-5 mb-4 border border-[#2D2D2D]">
          <p className="text-2xl mb-2">😴</p>
          <h2 className="text-lg font-extrabold text-[#C0C0C0]">Dia de descanso</h2>
          <p className="text-sm text-[#B8B8B8] mt-1 mb-3">
            Aproveite para se recuperar. Uma caminhada leve ou alongamento são ótimos hoje.
          </p>
          <Link href="/dashboard/treino" className="text-xs text-[#C084FC] font-semibold hover:underline">
            Ver treinos da semana →
          </Link>
        </div>
      ) : (
        <Link href="/dashboard/treino">
          <div className="bg-gradient-to-br from-[#1A0A2E] to-[#A855F7] rounded-[1rem] p-5 mb-4 shadow-lg shadow-purple-950 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                {workout.emoji} Treino de hoje
              </span>
              <span className="bg-[#A855F7] text-white text-xs px-2.5 py-1 rounded-full font-bold">
                {workout.duration} min
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mb-1">{workout.name}</h2>
            <p className="text-sm text-purple-300">{workout.muscleLabel} · {totalEx} exercícios</p>
            <div className="mt-4 bg-white/5 rounded-xl p-3">
              <div className="flex justify-between text-xs text-purple-300 mb-1.5">
                <span>Progresso</span>
                <span>{doneCount} / {totalEx} exercícios</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A1A1A] rounded-full transition-all duration-500"
                  style={{ width: `${workoutProgress}%` }}
                />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link href="/dashboard/dieta">
          <div className="bg-[#1A1A1A] rounded-[1rem] p-4 border border-[#2D2D2D] hover:shadow-md transition-shadow cursor-pointer">
            <p className="text-xs text-[#B8B8B8] mb-1">🥗 Dieta hoje</p>
            <p className="text-base font-extrabold text-[#F0F0F0]">1.850 kcal</p>
            <div className="mt-2 h-1.5 bg-[#1E1035] rounded-full">
              <div className="h-full w-[60%] bg-[#A855F7] rounded-full" />
            </div>
            <p className="text-[10px] text-[#CBD5E0] mt-1">Meta diária</p>
          </div>
        </Link>

        <Link href="/dashboard/tarefas">
          <div className="bg-[#1A1A1A] rounded-[1rem] p-4 border border-[#2D2D2D] hover:shadow-md transition-shadow cursor-pointer">
            <p className="text-xs text-[#B8B8B8] mb-1">⚡ Tarefa do dia</p>
            <p className="text-sm font-bold text-[#F0F0F0] leading-tight">
              Meditar 10 min
            </p>
            <div className="mt-3">
              {todayTaskDone ? (
                <span className="inline-flex items-center gap-1 bg-[#052E16] text-[#34D399] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Concluída
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-[#1E1035] text-[#C084FC] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Pendente
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Frase motivacional */}
      <div className="bg-[#1E1035] rounded-[1rem] p-4 border border-[#2D1B4E] mb-4">
        <p className="text-xs text-[#C084FC] font-semibold mb-1">✨ Frase do dia</p>
        <p className="text-sm text-[#C0C0C0] font-medium leading-relaxed italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-xs text-[#CBD5E0] mt-1">— {quote.author}</p>
      </div>

      {/* Resumo da semana */}
      <div className="bg-[#1A1A1A] rounded-[1rem] p-4 border border-[#2D2D2D]">
        <p className="text-xs font-semibold text-[#C0C0C0] mb-3">Semana em resumo</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Treinos feitos", value: String(todayIndex), unit: `/ ${weekSchedule.filter(w => w.isTraining).length}` },
            { label: "Sequência", value: String(todayIndex), unit: "dias" },
            { label: "Tarefas feitas", value: todayTaskDone ? "1" : "0", unit: "hoje" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl font-extrabold text-[#C084FC]">
                {s.value}
                <span className="text-xs text-[#CBD5E0] font-normal ml-0.5">{s.unit}</span>
              </p>
              <p className="text-[10px] text-[#CBD5E0] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
