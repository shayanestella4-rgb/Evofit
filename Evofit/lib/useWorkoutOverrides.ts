"use client";

import { useEffect, useState } from "react";

/** Busca os treinos manuais (definidos pelo /admin) do usuário logado — {dayIdx: exerciseIds[]}. */
export function useWorkoutOverrides() {
  const [overrides, setOverrides] = useState<Record<number, string[]>>({});

  useEffect(() => {
    fetch("/api/workout/overrides")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.overrides) setOverrides(data.overrides); })
      .catch(() => {});
  }, []);

  return overrides;
}
