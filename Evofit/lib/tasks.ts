// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface DailyTask {
  emoji: string;
  title: string;
  desc: string;
  category: string;
  xp: number;
}

export interface TaskHistoryEntry {
  label: string;       // "Ontem", "Seg", "Ter"…
  task: DailyTask;
  done: boolean;
}

// ─── 7 tarefas — uma para cada dia da semana (0=Dom … 6=Sáb) ────────────────

const TASKS: DailyTask[] = [
  // 0 – Domingo
  { emoji: "🧘", title: "Meditar por 10 minutos", category: "Mente", xp: 50,
    desc: "Encontre um lugar tranquilo, feche os olhos e respire fundo por 10 min. Reduz cortisol e melhora o foco." },
  // 1 – Segunda
  { emoji: "💧", title: "Beber 2.5L de água", category: "Saúde", xp: 50,
    desc: "Hidratação é fundamental para o treino e a recuperação muscular. Mantenha uma garrafa do lado o dia todo." },
  // 2 – Terça
  { emoji: "😴", title: "Dormir antes das 23h", category: "Sono", xp: 50,
    desc: "É dormindo que os músculos crescem e o corpo se recupera. Apague as telas às 22h30 e durma cedo." },
  // 3 – Quarta
  { emoji: "🚶", title: "Caminhar 20 min ao ar livre", category: "Ativo", xp: 50,
    desc: "Uma caminhada leve ativa a circulação, reduz o estresse e queima calorias extras sem cansar o corpo." },
  // 4 – Quinta
  { emoji: "🍽️", title: "Não pular nenhuma refeição", category: "Dieta", xp: 50,
    desc: "Comer nos horários certos mantém o metabolismo acelerado e evita fome compulsiva à noite." },
  // 5 – Sexta
  { emoji: "🤸", title: "Alongar por 15 minutos", category: "Recuperação", xp: 50,
    desc: "Após o treino ou antes de dormir, alongue os principais grupos musculares. Previne lesões e melhora postura." },
  // 6 – Sábado
  { emoji: "📵", title: "1 hora sem celular", category: "Mente", xp: 50,
    desc: "Desconecte por 1 hora. Leia, descanse, fique presente. Saúde mental é tão importante quanto o treino físico." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTaskForDay(dayIndex: number): DailyTask {
  return TASKS[dayIndex % TASKS.length];
}

/** Lê os últimos N dias do localStorage e retorna histórico real. */
export function getTaskHistory(days = 6): TaskHistoryEntry[] {
  const result: TaskHistoryEntry[] = [];
  const today = new Date();
  const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const key  = `evofit_task_${d.toDateString()}`;
    const done = typeof window !== "undefined"
      ? localStorage.getItem(key) === "true"
      : false;

    result.push({
      label: i === 1 ? "Ontem" : DAY_LABELS[d.getDay()],
      task: getTaskForDay(d.getDay()),
      done,
    });
  }
  return result;
}

/** Conta dias consecutivos de tarefas concluídas (inclui hoje se feita). */
export function calcStreak(todayDone: boolean): number {
  let streak = todayDone ? 1 : 0;
  const today = new Date();

  for (let i = 1; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key  = `evofit_task_${d.toDateString()}`;
    const done = typeof window !== "undefined"
      ? localStorage.getItem(key) === "true"
      : false;
    if (done) streak++;
    else break;
  }
  return streak;
}

/** Conta total de tarefas concluídas (para XP acumulado). */
export function calcTotalXP(todayDone: boolean): number {
  let total = todayDone ? 50 : 0;
  const today = new Date();

  for (let i = 1; i <= 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key  = `evofit_task_${d.toDateString()}`;
    const done = typeof window !== "undefined"
      ? localStorage.getItem(key) === "true"
      : false;
    if (done) total += 50;
  }
  return total;
}
