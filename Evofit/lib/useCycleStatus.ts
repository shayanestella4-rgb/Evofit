"use client";

import { useEffect, useState } from "react";
import { computeCycleStatus, type CycleStatus } from "./cycle";

const DEFAULT_STATUS: CycleStatus = computeCycleStatus(0);

/** Busca o status do ciclo (treinos concluídos/ciclo atual) no servidor. */
export function useCycleStatus() {
  const [status, setStatus] = useState<CycleStatus>(DEFAULT_STATUS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/workout/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data && typeof data.cycleNumber === "number") setStatus(data); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return { status, setStatus, loaded };
}
