// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface WorkoutLog {
  dateStr:       string; // new Date().toDateString()
  isoDate:       string; // ISO 8601
  workoutName:   string;
  exerciseCount: number;
}

export interface ProgramStatus {
  daysInProgram:  number;  // total de dias desde o início do ciclo atual
  daysInCycle:    number;  // dias dentro do ciclo (0-30, trava em 30 se vencido)
  daysRemaining:  number;  // dias restantes (0 = vencido)
  isOverdue:      boolean; // programa vencido (>= 30 dias sem renovar)
  cycleNumber:    number;  // qual ciclo estamos (1 = primeiro mês, 2 = segundo…)
  hasStartDate:   boolean; // se o aluno já fez anamnese
}

// ─── Chaves de storage ────────────────────────────────────────────────────────

const LOG_KEY          = "evofit_workout_log";
const PROGRAM_START_KEY = "evofit_program_start";
const cycleSeen         = (n: number) => `evofit_cycle_seen_${n}`;

// ─── Programa de 30 dias ──────────────────────────────────────────────────────

export function setProgramStartDate(dateISO: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PROGRAM_START_KEY, dateISO);
  }
}

export function getProgramStartDate(): Date | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROGRAM_START_KEY);
  return raw ? new Date(raw) : null;
}

/** Retorna o status completo do ciclo atual de 30 dias. */
export function getProgramStatus(): ProgramStatus {
  const start = getProgramStartDate();

  if (!start) {
    return { daysInProgram: 0, daysInCycle: 0, daysRemaining: 30, isOverdue: false, cycleNumber: 1, hasStartDate: false };
  }

  const diffMs     = Date.now() - start.getTime();
  const daysTotal  = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue  = daysTotal >= 30;

  return {
    daysInProgram: daysTotal,
    daysInCycle:   isOverdue ? 30 : daysTotal,
    daysRemaining: isOverdue ? 0  : 30 - daysTotal,
    isOverdue,
    cycleNumber:   Math.floor(daysTotal / 30) + 1,
    hasStartDate:  true,
  };
}

/**
 * Retorna o número do ciclo vencido ainda não exibido, ou null.
 * Ex.: após 30 dias → retorna 1 (primeiro ciclo completo).
 */
export function getUnseenCycleMilestone(): number | null {
  if (typeof window === "undefined") return null;
  const start = getProgramStartDate();
  if (!start) return null;

  const daysTotal = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysTotal < 30) return null;

  const cycleCompleted = Math.floor(daysTotal / 30); // ≥ 1
  const seen = localStorage.getItem(cycleSeen(cycleCompleted)) === "true";
  return seen ? null : cycleCompleted;
}

export function markCycleSeen(cycleNumber: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(cycleSeen(cycleNumber), "true");
  }
}

// ─── Registro de treinos ──────────────────────────────────────────────────────

export function loadWorkoutLogs(): WorkoutLog[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LOG_KEY) : null;
    return raw ? (JSON.parse(raw) as WorkoutLog[]) : [];
  } catch {
    return [];
  }
}

/**
 * Salva um treino — ignora duplicatas do mesmo dia.
 * Retorna o array atualizado.
 */
export function saveWorkoutLog(entry: WorkoutLog): WorkoutLog[] {
  const logs = loadWorkoutLogs();
  if (logs.some((l) => l.dateStr === entry.dateStr)) return logs;
  const updated = [...logs, entry];
  if (typeof window !== "undefined") {
    localStorage.setItem(LOG_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function getTotalWorkouts(): number {
  return loadWorkoutLogs().length;
}

// ─── Dados para gráficos ──────────────────────────────────────────────────────

/** Booleans (true = treinou) para os últimos N dias — usado no heatmap. */
export function getLast30DaysActivity(days = 30): boolean[] {
  const logs   = loadWorkoutLogs();
  const logSet = new Set(logs.map((l) => l.dateStr));
  const result: boolean[] = [];
  const today  = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(logSet.has(d.toDateString()));
  }
  return result;
}

/** Treinos por semana — do mais antigo ao mais recente. */
export function getWeeklyWorkouts(weeksBack = 6): number[] {
  const logs  = loadWorkoutLogs();
  const today = new Date();
  const result: number[] = [];

  for (let w = weeksBack; w >= 1; w--) {
    const start = new Date(today);
    start.setDate(today.getDate() - w * 7);
    const end = new Date(today);
    end.setDate(today.getDate() - (w - 1) * 7);

    const count = logs.filter((l) => {
      const d = new Date(l.isoDate);
      return d > start && d <= end;
    }).length;

    result.push(count);
  }
  return result;
}
