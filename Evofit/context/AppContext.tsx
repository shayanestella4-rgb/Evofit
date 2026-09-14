"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AnamneseData } from "@/lib/types";
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

    let localAnamnese: AnamneseData | null = null;
    if (savedAnamnese) {
      localAnamnese = JSON.parse(savedAnamnese);
      setAnamnese(localAnamnese);
    }
    if (savedExercises) setCompletedExercises(JSON.parse(savedExercises));
    if (savedTask)      setTodayTaskDoneState(JSON.parse(savedTask));
    if (savedSlot)      setOverrideSlotState(JSON.parse(savedSlot));
    if (savedPhoto)     setProfilePhotoState(savedPhoto);

    // Sincroniza com o servidor (só funciona se estiver logado — visitante
    // do quiz antes de comprar não tem sessão, e isso é esperado). Servidor
    // manda mais (ex: admin editou o treino da pessoa pelo painel); se o
    // servidor ainda não tem nada, sobe o que já existe no aparelho.
    fetch("/api/anamnese")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!res) return;
        if (res.data) {
          setAnamnese(res.data);
          localStorage.setItem(STORAGE_KEY_ANAMNESE, JSON.stringify(res.data));
        } else if (localAnamnese) {
          fetch("/api/anamnese", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: localAnamnese }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  function saveAnamnese(data: AnamneseData) {
    setAnamnese(data);
    localStorage.setItem(STORAGE_KEY_ANAMNESE, JSON.stringify(data));
    fetch("/api/anamnese", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    }).catch(() => {});
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
