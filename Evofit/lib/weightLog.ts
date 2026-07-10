export interface WeightEntry {
  date: string;    // toDateString() — chave de dedup por dia
  isoDate: string; // ISO 8601
  weight: number;  // kg
}

const key = (exerciseId: string) => `evofit_weight_${exerciseId}`;
const MAX_ENTRIES = 10;

export function loadWeightLog(exerciseId: string): WeightEntry[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key(exerciseId)) : null;
    return raw ? (JSON.parse(raw) as WeightEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveWeightEntry(exerciseId: string, weight: number): WeightEntry[] {
  const entries = loadWeightLog(exerciseId);
  const today   = new Date();
  const entry: WeightEntry = {
    date:    today.toDateString(),
    isoDate: today.toISOString(),
    weight,
  };

  const existingIdx = entries.findIndex((e) => e.date === today.toDateString());
  const updated = existingIdx >= 0
    ? entries.map((e, i) => (i === existingIdx ? entry : e))
    : [...entries, entry];

  const trimmed = updated.slice(-MAX_ENTRIES);

  if (typeof window !== "undefined") {
    localStorage.setItem(key(exerciseId), JSON.stringify(trimmed));
  }
  return trimmed;
}

export function getLastWeight(exerciseId: string): WeightEntry | null {
  const entries = loadWeightLog(exerciseId);
  return entries.length > 0 ? entries[entries.length - 1] : null;
}
