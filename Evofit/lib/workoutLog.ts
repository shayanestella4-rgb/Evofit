// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface WorkoutLog {
  dateStr:       string; // new Date().toDateString()
  isoDate:       string; // ISO 8601
  workoutName:   string;
  exerciseCount: number;
}

// ─── Chaves de storage ────────────────────────────────────────────────────────

const LOG_KEY = "evofit_workout_log";

// ─── Registro de treinos ──────────────────────────────────────────────────────
// O ciclo de periodização (fase + rotação de exercícios) não usa mais essas
// datas locais — vem de WorkoutCompletion no banco (ver lib/cycle.ts e
// lib/useCycleStatus.ts). O que sobra aqui é só o histórico local usado pro
// heatmap/gráfico semanal do perfil.

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
