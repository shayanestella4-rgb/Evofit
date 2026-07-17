"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AnamneseData } from "@/lib/types";
import { setProgramStartDate, getProgramStartDate } from "@/lib/workoutLog";
import type { ManualSlot } from "@/lib/workout";

const STORAGE_KEY_ANAMNESE = "evofit_anamnese";
const STORAGE_KEY_PHOTO    = "evofit_profile_photo";
const storageKeyExercises = () => `evofit_exercises_${new Date().toDateString()}`;
const storageKeyTask      = () => `evofit_task_${new Date().toDateString()}`;
const storageKeySlot      = () => `evofit_slot_${new Date().toDateString()}`;

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AppContextType {
  anamnese: AnamneseData | null;
  completedExercises: string[];
  todayTaskDone: boolean;
  hasOnboarding: boolean;
  overrideSlot: ManualSlot | null;
  profilePhoto: string | null;
  saveAnamnese: (data: AnamneseData) => void;
  toggleExercise: (id: string) => void;
  setTodayTaskDone: (v: boolean) => void;
  setOverrideSlot: (slot: ManualSlot | null) => void;
  setProfilePhoto: (photo: string | null) => void;
  clearData: () => void;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [anamnese, setAnamnese] = useState<AnamneseData | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [todayTaskDone, setTodayTaskDoneState] = useState(false);
  const [overrideSlot, setOverrideSlotState] = useState<ManualSlot | null>(null);
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null);

  // Carrega do localStorage ao montar (client-side only)
  useEffect(() => {
    const savedAnamnese  = localStorage.getItem(STORAGE_KEY_ANAMNESE);
    const savedExercises = localStorage.getItem(storageKeyExercises());
    const savedTask      = localStorage.getItem(storageKeyTask());
    const savedSlot      = localStorage.getItem(storageKeySlot());
    const savedPhoto     = localStorage.getItem(STORAGE_KEY_PHOTO);

    if (savedAnamnese) {
      setAnamnese(JSON.parse(savedAnamnese));
      // Anamnese pode ter vindo pré-preenchida do quiz de vendas (antes da compra) —
      // nesse caso o ciclo de 30 dias ainda não foi iniciado, então inicia agora.
      if (!getProgramStartDate()) {
        setProgramStartDate(new Date().toISOString());
      }
    }
    if (savedExercises) setCompletedExercises(JSON.parse(savedExercises));
    if (savedTask)      setTodayTaskDoneState(JSON.parse(savedTask));
    if (savedSlot)      setOverrideSlotState(JSON.parse(savedSlot));
    if (savedPhoto)     setProfilePhotoState(savedPhoto);
  }, []);

  function saveAnamnese(data: AnamneseData) {
    setAnamnese(data);
    localStorage.setItem(STORAGE_KEY_ANAMNESE, JSON.stringify(data));
    // Reinicia o ciclo de 30 dias sempre que a anamnese é salva/renovada
    setProgramStartDate(new Date().toISOString());
  }

  function toggleExercise(id: string) {
    setCompletedExercises((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem(storageKeyExercises(), JSON.stringify(next));
      return next;
    });
  }

  function setTodayTaskDone(v: boolean) {
    setTodayTaskDoneState(v);
    localStorage.setItem(storageKeyTask(), JSON.stringify(v));
  }

  function setOverrideSlot(slot: ManualSlot | null) {
    setOverrideSlotState(slot);
    if (slot) {
      localStorage.setItem(storageKeySlot(), JSON.stringify(slot));
    } else {
      localStorage.removeItem(storageKeySlot());
    }
  }

  function setProfilePhoto(photo: string | null) {
    setProfilePhotoState(photo);
    if (photo) localStorage.setItem(STORAGE_KEY_PHOTO, photo);
    else       localStorage.removeItem(STORAGE_KEY_PHOTO);
  }

  function clearData() {
    localStorage.removeItem(STORAGE_KEY_ANAMNESE);
    localStorage.removeItem(STORAGE_KEY_PHOTO);
    setAnamnese(null);
    setCompletedExercises([]);
    setTodayTaskDoneState(false);
    setProfilePhotoState(null);
  }

  return (
    <AppContext.Provider
      value={{
        anamnese,
        completedExercises,
        todayTaskDone,
        hasOnboarding: !!anamnese,
        overrideSlot,
        profilePhoto,
        saveAnamnese,
        toggleExercise,
        setTodayTaskDone,
        setOverrideSlot,
        setProfilePhoto,
        clearData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return ctx;
}
