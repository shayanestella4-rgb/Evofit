// O ciclo de periodização (fase hipertrofia/força/volume) e a rotação de
// exercícios avançam a cada N treinos concluídos pelo aluno — não mais por
// dias corridos desde a anamnese. Ver prisma WorkoutCompletion e
// app/api/workout/status.

export const WORKOUTS_PER_CYCLE = 120;

export interface CycleStatus {
  completedTotal: number;
  cycleNumber: number;       // 1 = primeiro ciclo, 2 = segundo…
  completedInCycle: number;  // 0-119 dentro do ciclo atual
  remainingInCycle: number;  // quantos faltam pro próximo ciclo
}

export function computeCycleStatus(completedTotal: number): CycleStatus {
  const completedInCycle = completedTotal % WORKOUTS_PER_CYCLE;
  return {
    completedTotal,
    cycleNumber: Math.floor(completedTotal / WORKOUTS_PER_CYCLE) + 1,
    completedInCycle,
    remainingInCycle: WORKOUTS_PER_CYCLE - completedInCycle,
  };
}
