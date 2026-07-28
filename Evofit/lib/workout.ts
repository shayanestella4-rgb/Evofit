import type { AnamneseData } from "./types";
import GIF_URLS from "./gif-urls.json";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MuscleGroup =
  | "quadriceps"
  | "gluteos"
  | "posteriores"
  | "panturrilha"
  | "peito"
  | "costas"
  | "ombros"
  | "biceps"
  | "triceps"
  | "core";

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: string;
  rest: string;
  tip: string;
  gif?: string; // caminho em /gifs/<id>.gif — undefined se não houver GIF disponível
}

// Mapeamento de IDs → URLs no Vercel Blob (gerado por scripts/upload-gifs.mjs)
const GIF_MAP = GIF_URLS as Record<string, string>;

export interface DayWorkout {
  name: string;
  emoji: string;
  muscleLabel: string;
  duration: number;
  exercises: Exercise[];
  isRest: boolean;
}

export interface WeekDay {
  day: string;
  isTraining: boolean;
  workoutName: string;
  emoji: string;
}

interface ExerciseDef {
  id: string;
  name: string;
  primaryMuscle: string;
  compound: boolean;       // compostos primeiro na ordenação
  avoidFor: string[];      // lesões que contra-indicam
}

interface SplitSlot {
  name: string;
  emoji: string;
  groups: MuscleGroup[];
  /** Quantidade de exercícios a selecionar por grupo muscular */
  volumes: Partial<Record<MuscleGroup, number>>;
  /** Se este dia inclui um finalizador de abdômen (2-3x/semana, fora da periodização) */
  abs?: boolean;
}

// ─── Banco de exercícios ──────────────────────────────────────────────────────

const LIBRARY: Record<MuscleGroup, ExerciseDef[]> = {

  // ── QUADRÍCEPS (15 exercícios — ~5 ciclos) ────────────────────────────────

  quadriceps: [
    { id: "q1",  name: "Agachamento livre",               primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: [] },
    { id: "q2",  name: "Leg press 45°",                   primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: [] },
    { id: "q9",  name: "Leg press horizontal",            primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: [] },
    { id: "q6",  name: "Hack squat (máquina)",            primaryMuscle: "Quadríceps / Vasto lateral",  compound: true,  avoidFor: ["Joelho"] },
    { id: "q8",  name: "Agachamento sumô com barra",      primaryMuscle: "Quadríceps / Adutores",       compound: true,  avoidFor: [] },
    { id: "q10", name: "Agachamento no Smith",            primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: [] },
    { id: "q13", name: "Agachamento com trava",           primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: [] },
    { id: "q14", name: "Agachamento taça",                primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: [] },
    { id: "q3",  name: "Agachamento búlgaro",             primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho"] },
    { id: "q4",  name: "Afundo com halteres",             primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho"] },
    { id: "q7",  name: "Agachamento búlgaro com barra",   primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho"] },
    { id: "q11", name: "Avanço com halteres",             primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho"] },
    { id: "q15", name: "Leg press 45° unilateral",        primaryMuscle: "Quadríceps (unilateral)",     compound: true,  avoidFor: [] },
    { id: "q5",  name: "Cadeira extensora",               primaryMuscle: "Quadríceps (isolamento)",     compound: false, avoidFor: ["Joelho"] },
    { id: "q12", name: "Cadeira extensora unilateral",    primaryMuscle: "Quadríceps (isolamento)",     compound: false, avoidFor: ["Joelho"] },
  ],

  // ── GLÚTEOS (12 exercícios — ~4 ciclos) ──────────────────────────────────
  // Ordenados para intercalar padrões de movimento — sem repetir o mesmo padrão
  // dentro do mesmo ciclo de picks.

  gluteos: [
    { id: "g6",  name: "Elevação pélvica (hip thrust)",   primaryMuscle: "Glúteo máximo",               compound: true,  avoidFor: [] },
    { id: "g7",  name: "Abdução sentada na máquina",      primaryMuscle: "Glúteo médio",                compound: true,  avoidFor: [] },
    { id: "g2",  name: "Agachamento sumô com haltere",    primaryMuscle: "Glúteos / Adutores",          compound: true,  avoidFor: [] },
    { id: "g8",  name: "Recuo com halteres",              primaryMuscle: "Glúteos / Isquiotibiais",     compound: true,  avoidFor: [] },
    { id: "g3",  name: "Step-up com haltere",             primaryMuscle: "Glúteos / Quadríceps",        compound: true,  avoidFor: ["Joelho"] },
    { id: "g9",  name: "Elevação de perna em pé",         primaryMuscle: "Glúteo máximo",               compound: true,  avoidFor: [] },
    { id: "g12", name: "Step-up com barra",               primaryMuscle: "Glúteos / Quadríceps",        compound: true,  avoidFor: ["Joelho"] },
    { id: "g10", name: "Elevação pélvica unilateral",     primaryMuscle: "Glúteo máximo (unilateral)",  compound: true,  avoidFor: [] },
    { id: "g1",  name: "Hip thrust com barra",            primaryMuscle: "Glúteo máximo",               compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "g11", name: "Coice de glúteo no cabo",         primaryMuscle: "Glúteo máximo",               compound: false, avoidFor: [] },
    { id: "g4",  name: "Glúteo no cabo (kickback)",       primaryMuscle: "Glúteo máximo",               compound: false, avoidFor: [] },
    { id: "g5",  name: "Abdução no cabo baixo",           primaryMuscle: "Glúteo médio",                compound: false, avoidFor: [] },
  ],

  // ── POSTERIORES (10 exercícios) ───────────────────────────────────────────

  posteriores: [
    { id: "po1",  name: "Stiff com barra",                primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "po3",  name: "Cadeira flexora",                primaryMuscle: "Isquiotibiais",               compound: true,  avoidFor: ["Joelho"] },
    { id: "po4",  name: "Mesa flexora",                   primaryMuscle: "Isquiotibiais",               compound: true,  avoidFor: ["Joelho"] },
    { id: "po9",  name: "Stiff com haltere",              primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "po6",  name: "Stiff unilateral com halteres",  primaryMuscle: "Isquiotibiais (unilateral)",  compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "po5",  name: "Bom dia (good morning)",         primaryMuscle: "Isquiotibiais / Lombar",      compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "po11", name: "Bom dia no Smith",               primaryMuscle: "Isquiotibiais / Lombar",      compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "po12", name: "Levantamento terra sumô",        primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar", "Joelho"] },
    { id: "po8",  name: "Flexora em pé",                  primaryMuscle: "Isquiotibiais (isolamento)",  compound: false, avoidFor: ["Joelho"] },
    { id: "po10", name: "Flexão nórdica",                 primaryMuscle: "Isquiotibiais (excêntrico)",  compound: false, avoidFor: ["Joelho"] },
  ],

  // ── PANTURRILHA (5 exercícios — ~2 ciclos) ────────────────────────────────

  panturrilha: [
    { id: "pa1", name: "Panturrilha em pé na máquina",        primaryMuscle: "Gastrocnêmio",            compound: false, avoidFor: [] },
    { id: "pa3", name: "Panturrilha no leg press",            primaryMuscle: "Gastrocnêmio",            compound: false, avoidFor: [] },
    { id: "pa5", name: "Panturrilha no leg press horizontal", primaryMuscle: "Gastrocnêmio",            compound: false, avoidFor: [] },
    { id: "pa4", name: "Panturrilha no Smith",                primaryMuscle: "Gastrocnêmio",            compound: false, avoidFor: [] },
    { id: "pa2", name: "Panturrilha sentado (sóleo)",         primaryMuscle: "Sóleo",                   compound: false, avoidFor: [] },
  ],

  // ── PEITO (16 exercícios — ~5 ciclos) ────────────────────────────────────

  peito: [
    { id: "p1",  name: "Supino reto com barra",           primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro"] },
    { id: "p2",  name: "Supino inclinado com halteres",   primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p7",  name: "Supino inclinado com barra",      primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p15", name: "Supino com halteres",             primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro"] },
    { id: "p3",  name: "Supino declinado com halteres",   primaryMuscle: "Peitoral inferior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p8",  name: "Supino na máquina",               primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro"] },
    { id: "p13", name: "Supino vertical (shoulder press)", primaryMuscle: "Peitoral / Ombros",          compound: true,  avoidFor: ["Ombro"] },
    { id: "p6",  name: "Flexão de braço",                 primaryMuscle: "Peitoral / Tríceps",          compound: true,  avoidFor: [] },
    { id: "p4",  name: "Crucifixo com halteres",          primaryMuscle: "Peitoral (abertura)",         compound: false, avoidFor: ["Ombro"] },
    { id: "p9",  name: "Crucifixo inclinado",             primaryMuscle: "Peitoral superior (abertura)", compound: false, avoidFor: ["Ombro"] },
    { id: "p14", name: "Crucifixo com cabo deitado",      primaryMuscle: "Peitoral (abertura)",         compound: false, avoidFor: ["Ombro"] },
    { id: "p5",  name: "Crossover polia alta",            primaryMuscle: "Peitoral / Serrátil",         compound: false, avoidFor: ["Ombro"] },
    { id: "p10", name: "Crossover polia baixa",           primaryMuscle: "Peitoral inferior",           compound: false, avoidFor: ["Ombro"] },
    { id: "p16", name: "Crossover polia média",           primaryMuscle: "Peitoral (porção média)",     compound: false, avoidFor: ["Ombro"] },
    { id: "p11", name: "Voador peitoral",                 primaryMuscle: "Peitoral (abertura)",         compound: false, avoidFor: ["Ombro"] },
    { id: "p12", name: "Pack deck (máquina)",             primaryMuscle: "Peitoral",                    compound: false, avoidFor: ["Ombro"] },
  ],

  // ── COSTAS (16 exercícios — ~5 ciclos) ───────────────────────────────────

  costas: [
    { id: "c7",  name: "Barra fixa",                      primaryMuscle: "Dorsal / Bíceps",             compound: true,  avoidFor: ["Ombro"] },
    { id: "c1",  name: "Puxada frontal na barra",         primaryMuscle: "Dorsal / Teres maior",        compound: true,  avoidFor: ["Ombro"] },
    { id: "c13", name: "Puxada pegada fechada",           primaryMuscle: "Dorsal inferior",             compound: true,  avoidFor: [] },
    { id: "c10", name: "Puxada unilateral",               primaryMuscle: "Dorsal (unilateral)",         compound: true,  avoidFor: [] },
    { id: "c16", name: "Puxada inclinada com corda",      primaryMuscle: "Dorsal inferior / Serrátil",  compound: false, avoidFor: [] },
    { id: "c5",  name: "Puxada com triângulo",            primaryMuscle: "Dorsal inferior",             compound: false, avoidFor: [] },
    { id: "c2",  name: "Remada curvada com barra",        primaryMuscle: "Dorsal / Trapézio médio",     compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "c8",  name: "Remada curvada com halteres",     primaryMuscle: "Dorsal / Rombóides",          compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "c11", name: "Remada curvada invertida",        primaryMuscle: "Dorsal / Bíceps",             compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "c15", name: "Remada curvada na máquina",       primaryMuscle: "Dorsal / Trapézio",           compound: true,  avoidFor: [] },
    { id: "c3",  name: "Remada unilateral (serrote)",     primaryMuscle: "Dorsal",                      compound: true,  avoidFor: [] },
    { id: "c12", name: "Remada cavalinho",                primaryMuscle: "Dorsal / Rombóides",          compound: true,  avoidFor: [] },
    { id: "c14", name: "Remada articulada",               primaryMuscle: "Dorsal / Trapézio",           compound: true,  avoidFor: [] },
    { id: "c9",  name: "Remada sentada na máquina",       primaryMuscle: "Dorsal / Rombóides",          compound: true,  avoidFor: [] },
    { id: "c4",  name: "Remada baixa no cabo",            primaryMuscle: "Dorsal / Rombóides",          compound: true,  avoidFor: [] },
    { id: "c6",  name: "Levantamento terra convencional", primaryMuscle: "Costas completa / Glúteos",   compound: true,  avoidFor: ["Coluna/lombar", "Joelho"] },
  ],

  // ── OMBROS (15 exercícios — ~5 ciclos) ───────────────────────────────────

  ombros: [
    { id: "o1",  name: "Desenvolvimento com halteres",    primaryMuscle: "Deltóide anterior / lateral", compound: true,  avoidFor: ["Ombro"] },
    { id: "o5",  name: "Arnold press",                    primaryMuscle: "Deltóide completo",           compound: true,  avoidFor: ["Ombro"] },
    { id: "o6",  name: "Desenvolvimento na máquina",      primaryMuscle: "Deltóide anterior / lateral", compound: true,  avoidFor: ["Ombro"] },
    { id: "o10", name: "Desenvolvimento em pé alternado", primaryMuscle: "Deltóide anterior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "o2",  name: "Elevação lateral com halteres",   primaryMuscle: "Deltóide lateral",            compound: false, avoidFor: ["Ombro"] },
    { id: "o7",  name: "Elevação lateral unilateral cabo", primaryMuscle: "Deltóide lateral",           compound: false, avoidFor: [] },
    { id: "o8",  name: "Elevação lateral sentado",        primaryMuscle: "Deltóide lateral",            compound: false, avoidFor: ["Ombro"] },
    { id: "o4",  name: "Elevação frontal com halteres",   primaryMuscle: "Deltóide anterior",           compound: false, avoidFor: ["Ombro"] },
    { id: "o13", name: "Elevação frontal alternada",      primaryMuscle: "Deltóide anterior",           compound: false, avoidFor: ["Ombro"] },
    { id: "o3",  name: "Face pull no cabo",               primaryMuscle: "Deltóide posterior",          compound: false, avoidFor: [] },
    { id: "o9",  name: "Posterior de ombro com halteres", primaryMuscle: "Deltóide posterior",          compound: false, avoidFor: [] },
    { id: "o14", name: "Voador para deltoides posterior", primaryMuscle: "Deltóide posterior",          compound: false, avoidFor: [] },
    { id: "o15", name: "Posterior de ombro sentado",      primaryMuscle: "Deltóide posterior",          compound: false, avoidFor: [] },
    { id: "o11", name: "Crucifixo inverso com cabo",      primaryMuscle: "Deltóide posterior",          compound: false, avoidFor: [] },
    { id: "o12", name: "Voador invertido",                primaryMuscle: "Deltóide posterior / Rombóide", compound: false, avoidFor: [] },
  ],

  // ── BÍCEPS (14 exercícios — ~4 ciclos) ───────────────────────────────────

  biceps: [
    { id: "b1",  name: "Rosca direta com barra",          primaryMuscle: "Bíceps (cabeça longa)",       compound: false, avoidFor: [] },
    { id: "b11", name: "Rosca direta barra W",            primaryMuscle: "Bíceps (cabeça curta)",       compound: false, avoidFor: [] },
    { id: "b6",  name: "Rosca Scott com barra W",         primaryMuscle: "Bíceps (pico)",               compound: false, avoidFor: [] },
    { id: "b9",  name: "Rosca Scott na máquina",          primaryMuscle: "Bíceps (pico)",               compound: false, avoidFor: [] },
    { id: "b2",  name: "Rosca alternada com halteres",    primaryMuscle: "Bíceps",                      compound: false, avoidFor: [] },
    { id: "b12", name: "Rosca alternada sentado",         primaryMuscle: "Bíceps",                      compound: false, avoidFor: [] },
    { id: "b13", name: "Rosca bíceps com halteres",       primaryMuscle: "Bíceps",                      compound: false, avoidFor: [] },
    { id: "b7",  name: "Rosca banco inclinado",           primaryMuscle: "Bíceps (alongado)",           compound: false, avoidFor: [] },
    { id: "b3",  name: "Rosca martelo com halteres",      primaryMuscle: "Bíceps / Braquial",           compound: false, avoidFor: [] },
    { id: "b8",  name: "Rosca martelo com corda",         primaryMuscle: "Bíceps / Braquial",           compound: false, avoidFor: [] },
    { id: "b14", name: "Rosca martelo sentada",           primaryMuscle: "Bíceps / Braquial",           compound: false, avoidFor: [] },
    { id: "b4",  name: "Rosca concentrada",               primaryMuscle: "Bíceps (pico)",               compound: false, avoidFor: [] },
    { id: "b5",  name: "Rosca no cabo baixo",             primaryMuscle: "Bíceps",                      compound: false, avoidFor: [] },
    { id: "b10", name: "Rosca unilateral no cabo",        primaryMuscle: "Bíceps (unilateral)",         compound: false, avoidFor: [] },
  ],

  // ── TRÍCEPS (13 exercícios — ~4 ciclos) ──────────────────────────────────

  triceps: [
    { id: "t3",  name: "Mergulho no banco",               primaryMuscle: "Tríceps / Peitoral inf.",     compound: true,  avoidFor: ["Ombro"] },
    { id: "t1",  name: "Tríceps pulley no cabo",          primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t6",  name: "Tríceps pulley com corda",        primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t9",  name: "Tríceps pulley invertido",        primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
    { id: "t11", name: "Tríceps pulley barra V",          primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t2",  name: "Tríceps testa (skullcrusher)",    primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro"] },
    { id: "t8",  name: "Tríceps testa unilateral",        primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro"] },
    { id: "t13", name: "Tríceps no cabo alto",            primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
    { id: "t10", name: "Tríceps deitado barra W",         primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro"] },
    { id: "t5",  name: "Tríceps francês com haltere",     primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro"] },
    { id: "t7",  name: "Tríceps francês unilateral cabo", primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
    { id: "t12", name: "Tríceps francês sentado",         primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro"] },
    { id: "t4",  name: "Tríceps kickback com haltere",    primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
  ],

  // ── ABDÔMEN (14 exercícios — usados como finalizador fixo 4x15, não entram
  //    na periodização — ver pickAbsExercises / buildAbsExercises) ───────────

  core: [
    { id: "ab14", name: "Prancha isométrica",             primaryMuscle: "Core completo / Estabilização", compound: false, avoidFor: [] },
    { id: "ab3",  name: "Abdominal crunch",               primaryMuscle: "Reto abdominal",                 compound: false, avoidFor: [] },
    { id: "ab7",  name: "Crunch na máquina",               primaryMuscle: "Reto abdominal",                 compound: false, avoidFor: [] },
    { id: "ab10", name: "Supra no banco declinado",        primaryMuscle: "Reto abdominal (superior)",      compound: false, avoidFor: [] },
    { id: "ab13", name: "Crunch oblíquo",                  primaryMuscle: "Oblíquos",                       compound: false, avoidFor: [] },
    { id: "ab11", name: "Toque no calcanhar alternado",    primaryMuscle: "Oblíquos",                       compound: false, avoidFor: [] },
    { id: "ab6",  name: "Abdominal infra",                 primaryMuscle: "Abdômen inferior",               compound: false, avoidFor: ["Coluna/lombar"] },
    { id: "ab1",  name: "Abdominal infra deitado",         primaryMuscle: "Abdômen inferior",               compound: false, avoidFor: ["Coluna/lombar"] },
    { id: "ab4",  name: "Tuck crunch",                     primaryMuscle: "Abdômen completo",                compound: false, avoidFor: ["Coluna/lombar"] },
    { id: "ab2",  name: "Abdominal bicicleta",              primaryMuscle: "Oblíquos / Reto abdominal",      compound: false, avoidFor: ["Coluna/lombar"] },
    { id: "ab5",  name: "Abdominal twisting",               primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Coluna/lombar"] },
    { id: "ab12", name: "Abdominal twist",                  primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Coluna/lombar"] },
    { id: "ab9",  name: "Rotação de tronco",                primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Coluna/lombar"] },
    { id: "ab8",  name: "Abdominal remador",                primaryMuscle: "Abdômen completo",                compound: false, avoidFor: ["Coluna/lombar"] },
  ],
};

// ─── Cardio (finalizador fixo, todos os dias de treino) ───────────────────────

const CARDIO_LIBRARY: { id: string; name: string }[] = [
  { id: "ca3", name: "Esteira" },
  { id: "ca1", name: "Bicicleta ergométrica" },
  { id: "ca2", name: "Elíptico" },
];

// ─── Divisões semanais ────────────────────────────────────────────────────────
// volumes: quantidade de exercícios por grupo naquele dia
// Dia: 0=Seg … 6=Dom
// abs: dia leva finalizador de abdômen (4x15, fixo) — 2-3x/semana por plano
// Todo dia de treino leva cardio (20-30min) depois da musculação — ver getWorkoutForDay.

// ── FEMININO ──────────────────────────────────────────────────────────────────
// Mais volume de inferiores do que de superiores. Nos dias de superior:
// peito com apenas 1 exercício, priorizando costas / bíceps / ombro / tríceps.
const FEMALE_SPLITS: Record<string, Record<number, SplitSlot>> = {

  "2 dias": {
    // Seg: inferior completo
    0: {
      name: "Quadríceps + Glúteos",
      emoji: "🦵",
      groups: ["quadriceps", "gluteos", "panturrilha"],
      volumes: { quadriceps: 3, gluteos: 3, panturrilha: 1 },
      abs: true,
    },
    // Qui: posteriores
    3: {
      name: "Posteriores",
      emoji: "🍑",
      groups: ["posteriores"],
      volumes: { posteriores: 3 },
      abs: true,
    },
  },

  "3 dias": {
    // Seg: pernas (quad+post)
    0: {
      name: "Pernas",
      emoji: "🦵",
      groups: ["quadriceps", "posteriores", "panturrilha"],
      volumes: { quadriceps: 4, posteriores: 3, panturrilha: 1 },
      abs: true,
    },
    // Qua: superior completo condensado — peito com só 1 exercício
    2: {
      name: "Superior Completo",
      emoji: "💪",
      groups: ["costas", "peito", "triceps", "ombros", "biceps"],
      volumes: { costas: 3, peito: 1, triceps: 1, ombros: 2, biceps: 1 },
      abs: true,
    },
    // Sex: dia de glúteos (foco total)
    4: {
      name: "Glúteos",
      emoji: "🍑",
      groups: ["gluteos"],
      volumes: { gluteos: 6 },
    },
  },

  "4 dias": {
    // Seg: quadríceps
    0: {
      name: "Quadríceps",
      emoji: "🦵",
      groups: ["quadriceps", "panturrilha"],
      volumes: { quadriceps: 4, panturrilha: 1 },
      abs: true,
    },
    // Ter: glúteos
    1: {
      name: "Glúteos",
      emoji: "🍑",
      groups: ["gluteos"],
      volumes: { gluteos: 6 },
    },
    // Qui: posteriores
    3: {
      name: "Posteriores",
      emoji: "🔥",
      groups: ["posteriores"],
      volumes: { posteriores: 3 },
      abs: true,
    },
    // Sex: superior — peito com só 1 exercício, mais costas
    4: {
      name: "Superior",
      emoji: "💪",
      groups: ["costas", "peito", "ombros", "biceps", "triceps"],
      volumes: { costas: 3, peito: 1, ombros: 2, biceps: 1, triceps: 1 },
      abs: true,
    },
  },

  "5+ dias": {
    // Seg: quadríceps — volume extra pra reforçar o viés de inferiores
    0: {
      name: "Quadríceps",
      emoji: "🦵",
      groups: ["quadriceps", "panturrilha"],
      volumes: { quadriceps: 5, panturrilha: 1 },
      abs: true,
    },
    // Ter: glúteos
    1: {
      name: "Glúteos",
      emoji: "🍑",
      groups: ["gluteos"],
      volumes: { gluteos: 6 },
    },
    // Qua: costas + bíceps
    2: {
      name: "Costas + Bíceps",
      emoji: "🏋️",
      groups: ["costas", "biceps"],
      volumes: { costas: 4, biceps: 2 },
    },
    // Qui: posteriores
    3: {
      name: "Posteriores",
      emoji: "🔥",
      groups: ["posteriores"],
      volumes: { posteriores: 3 },
      abs: true,
    },
    // Sex: peito + ombros + tríceps — peito com só 1 exercício
    4: {
      name: "Peito + Ombros + Tríceps",
      emoji: "💥",
      groups: ["peito", "ombros", "triceps"],
      volumes: { peito: 1, ombros: 3, triceps: 3 },
      abs: true,
    },
  },
};

// ── MASCULINO ─────────────────────────────────────────────────────────────────
// Inferiores treinado só 1x/semana (quadríceps + posterior + glúteo no mesmo dia).
// Panturrilha sai do dia de perna e entra em algum dia de braço.
const MALE_SPLITS: Record<string, Record<number, SplitSlot>> = {

  "2 dias": {
    // Seg: superior completo — 8 exercícios + panturrilha
    0: {
      name: "Superior Completo",
      emoji: "💪",
      groups: ["costas", "peito", "ombros", "biceps", "triceps", "panturrilha"],
      volumes: { costas: 2, peito: 2, ombros: 2, biceps: 1, triceps: 1, panturrilha: 1 },
      abs: true,
    },
    // Qui: inferior completo (quad + glúteo + posterior) — único dia de perna da semana
    3: {
      name: "Inferior Completo",
      emoji: "🦵",
      groups: ["quadriceps", "gluteos", "posteriores"],
      volumes: { quadriceps: 2, gluteos: 2, posteriores: 2 },
      abs: true,
    },
  },

  "3 dias": {
    // Seg: costas + bíceps + panturrilha
    0: {
      name: "Costas + Bíceps",
      emoji: "🏋️",
      groups: ["costas", "biceps", "panturrilha"],
      volumes: { costas: 4, biceps: 2, panturrilha: 1 },
      abs: true,
    },
    // Qua: inferior completo — único dia de perna da semana
    2: {
      name: "Inferior Completo",
      emoji: "🦵",
      groups: ["quadriceps", "gluteos", "posteriores"],
      volumes: { quadriceps: 2, gluteos: 2, posteriores: 2 },
      abs: true,
    },
    // Sex: peito + tríceps + ombros
    4: {
      name: "Peito + Tríceps + Ombros",
      emoji: "💪",
      groups: ["peito", "triceps", "ombros"],
      volumes: { peito: 3, triceps: 2, ombros: 2 },
    },
  },

  "4 dias": {
    // Seg: costas + bíceps + panturrilha
    0: {
      name: "Costas + Bíceps",
      emoji: "🏋️",
      groups: ["costas", "biceps", "panturrilha"],
      volumes: { costas: 4, biceps: 2, panturrilha: 1 },
      abs: true,
    },
    // Ter: peito + tríceps
    1: {
      name: "Peito + Tríceps",
      emoji: "💪",
      groups: ["peito", "triceps"],
      volumes: { peito: 4, triceps: 3 },
    },
    // Qui: inferior completo — único dia de perna da semana
    3: {
      name: "Pernas",
      emoji: "🦵",
      groups: ["quadriceps", "gluteos", "posteriores"],
      volumes: { quadriceps: 2, gluteos: 2, posteriores: 2 },
      abs: true,
    },
    // Sex: ombros
    4: {
      name: "Ombros",
      emoji: "🔥",
      groups: ["ombros"],
      volumes: { ombros: 3 },
      abs: true,
    },
  },

  "5+ dias": {
    // Seg: peito + tríceps
    0: {
      name: "Peito + Tríceps",
      emoji: "💪",
      groups: ["peito", "triceps"],
      volumes: { peito: 4, triceps: 3 },
    },
    // Ter: costas + bíceps
    1: {
      name: "Costas + Bíceps",
      emoji: "🏋️",
      groups: ["costas", "biceps"],
      volumes: { costas: 4, biceps: 3 },
      abs: true,
    },
    // Qua: inferior completo — único dia de perna da semana
    2: {
      name: "Pernas",
      emoji: "🦵",
      groups: ["quadriceps", "gluteos", "posteriores"],
      volumes: { quadriceps: 2, gluteos: 2, posteriores: 2 },
      abs: true,
    },
    // Qui: ombros
    3: {
      name: "Ombros",
      emoji: "🔥",
      groups: ["ombros"],
      volumes: { ombros: 3 },
      abs: true,
    },
    // Sex: braços — volume + panturrilha
    4: {
      name: "Braços — Volume",
      emoji: "⚡",
      groups: ["biceps", "triceps", "panturrilha"],
      volumes: { biceps: 4, triceps: 4, panturrilha: 1 },
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GROUP_LABELS: Record<MuscleGroup, string> = {
  quadriceps:  "Quadríceps",
  gluteos:     "Glúteos",
  posteriores: "Posteriores",
  panturrilha: "Panturrilha",
  peito:       "Peito",
  costas:      "Costas",
  ombros:      "Ombros",
  biceps:      "Bíceps",
  triceps:     "Tríceps",
  core:        "Abdômen",
};

/** Volume padrão por grupo (fallback para slots manuais sem volumes definidos) */
function defaultVol(g: MuscleGroup, isFemale: boolean): number {
  const female: Record<MuscleGroup, number> = {
    costas: 4, peito: 3, ombros: 4, biceps: 2, triceps: 2,
    quadriceps: 4, gluteos: 5, posteriores: 3, panturrilha: 1, core: 1,
  };
  const male: Record<MuscleGroup, number> = {
    costas: 4, peito: 4, ombros: 3, biceps: 3, triceps: 3,
    quadriceps: 2, gluteos: 2, posteriores: 2, panturrilha: 1, core: 1,
  };
  return isFemale ? female[g] : male[g];
}

/**
 * Periodização em 4 fases que rotacionam a cada ciclo de 30 dias.
 *
 * Fase 1 — Hipertrofia base  (ciclos 1, 5, 9 …)
 * Fase 2 — Força             (ciclos 2, 6, 10 …)
 * Fase 3 — Volume alto       (ciclos 3, 7, 11 …)
 * Fase 4 — Técnicas avançadas (ciclos 4, 8, 12 …)  ← dropset / bi-set / cluster set / rest-pause
 *
 * A fase 4 só existe para quem o quiz identificou como "Intermediário" —
 * iniciante/básico giram só entre as fases 1-3 (nunca fazem técnicas avançadas,
 * por segurança de execução).
 */
function getSetsRest(
  goal: string,
  nivel: string,
  cycleNumber: number = 1,
): { sets: number; reps: string; rest: string; tip: string } {
  const isInter    = nivel?.includes("Intermediário");
  const totalPhases = isInter ? 4 : 3;
  const phase        = ((cycleNumber - 1) % totalPhases) + 1; // 1 → 2 → 3 → (4) → 1 → …

  // ── Fase 1: Hipertrofia base ────────────────────────────────────────────────
  if (phase === 1) {
    const sets = isInter ? 4 : 3;
    if (goal?.includes("músculo")) {
      return { sets, reps: "8-10", rest: "75s",
        tip: "Carga progressiva — as últimas 2 reps devem ser difíceis. Desça o peso em 3s (excêntrico). Sinta a contração no pico." };
    }
    if (goal?.includes("gordura")) {
      return { sets, reps: "12", rest: "45s",
        tip: "Descanse pouco para manter o metabolismo elevado. Mantenha a técnica mesmo no cansaço — nunca sacrifique a postura." };
    }
    if (goal?.includes("condicionamento")) {
      return { sets: 3, reps: "12", rest: "40s",
        tip: "Ritmo constante, respiração controlada. Core sempre ativado. Foco em resistência muscular." };
    }
    return { sets: 3, reps: "10-12", rest: "60s",
      tip: "Qualidade acima de quantidade. Execute cada repetição com controle total — concêntrico 2s, excêntrico 3s." };
  }

  // ── Fase 2: Força ───────────────────────────────────────────────────────────
  if (phase === 2) {
    return { sets: 4, reps: "5-7", rest: "2min",
      tip: "🏋️ Fase de força: use cargas pesadas com técnica perfeita. Descanse por completo entre séries. Aumente a carga assim que conseguir 7 reps limpas." };
  }

  // ── Fase 3: Volume alto ─────────────────────────────────────────────────────
  if (phase === 3) {
    const sets = isInter ? 5 : 4;
    return { sets, reps: goal?.includes("músculo") ? "12-15" : "15", rest: "40s",
      tip: "💦 Fase de volume: carga moderada, muitas repetições, descanso curto. Foco em pump e resistência. Seu músculo vai crescer nas micro-pausas." };
  }

  // ── Fase 4: Técnicas avançadas ─────────────────────────────────────────────
  // Alterna entre 2 técnicas por objetivo a cada nova rodada da fase 4
  // (ciclo 4 → técnica A, ciclo 8 → técnica B, ciclo 12 → técnica A de novo…)
  const advancedRound = Math.floor((cycleNumber - 1) / 4) % 2;

  if (goal?.includes("gordura") || goal?.includes("condicionamento")) {
    if (advancedRound === 0) {
      return { sets: 3, reps: "12+8", rest: "60s",
        tip: "🔥 Dropset: complete as 12 reps normais, reduza 20% da carga sem pausar e execute mais 8 reps. Máximo esforço metabólico em cada série." };
    }
    return { sets: isInter ? 4 : 3, reps: "10-12", rest: "sem pausa entre a dupla · 90s depois",
      tip: "🔗 Bi-set: execute este exercício direto com o próximo da lista, sem descansar entre eles. Descanse só depois de completar a dupla. Eleva o gasto calórico e economiza tempo de treino." };
  }

  if (advancedRound === 0) {
    return { sets: isInter ? 4 : 3, reps: "8+4", rest: "90s",
      tip: "⚡ Cluster set: execute 4 reps, pausa de 10s sem soltar o peso, mais 4 reps. As últimas 4 devem ser muito difíceis — permite carga maior com técnica perfeita." };
  }
  return { sets: isInter ? 4 : 3, reps: "6-8 + rest-pause", rest: "2min",
    tip: "⏸️ Rest-pause: leve a série quase à falha, descanse só 15s sem soltar o peso, e faça mais 4-6 reps. Repita esse mini-descanso mais uma vez. Extrai mais estímulo da mesma carga, sem precisar aumentar o peso." };
}

/**
 * Monta a lista de exercícios filtrada por lesão, ordenada (compostos primeiro)
 * e rotacionada pelo número do ciclo — exercícios diferentes a cada mês.
 *
 * @param volumes  Quantidade de exercícios por grupo (usa defaultVol como fallback)
 */
function pickExercises(
  groups: MuscleGroup[],
  injuries: string[],
  cycleNumber: number = 1,
  volumes: Partial<Record<MuscleGroup, number>> = {},
  isFemale: boolean = true
): ExerciseDef[] {
  const result: ExerciseDef[] = [];

  for (const g of groups) {
    const pool = LIBRARY[g].filter((ex) => {
      if (injuries.includes("Outra")) return ex.avoidFor.length === 0;
      return !ex.avoidFor.some((a) => injuries.includes(a));
    });

    // Compostos primeiro
    const sorted = [...pool].sort((a, b) => +b.compound - +a.compound);
    const cap = volumes[g] ?? defaultVol(g, isFemale);

    if (sorted.length === 0) continue;

    // Rotação: cada ciclo avança `cap` posições → exercícios novos a cada mês
    const offset = ((cycleNumber - 1) * cap) % sorted.length;
    for (let i = 0; i < cap && i < sorted.length; i++) {
      result.push(sorted[(offset + i) % sorted.length]);
    }
  }

  return result;
}

/** Escolhe 1 exercício de abdômen, rotacionando por ciclo e por dia (mais variedade na semana). */
function pickAbsExercises(injuries: string[], isFemale: boolean, cycleNumber: number, dayIdx: number): ExerciseDef[] {
  const virtualCycle = cycleNumber * 10 + dayIdx;
  return pickExercises(["core"], injuries, virtualCycle, { core: 1 }, isFemale);
}

/** Escolhe a máquina de cardio do dia, intercalando entre esteira / bike / elíptico. */
function pickCardio(cycleNumber: number, dayIdx: number): { id: string; name: string } {
  const idx = (cycleNumber + dayIdx) % CARDIO_LIBRARY.length;
  return CARDIO_LIBRARY[idx];
}

function buildAbsExercises(injuries: string[], isFemale: boolean, cycleNumber: number, dayIdx: number): Exercise[] {
  return pickAbsExercises(injuries, isFemale, cycleNumber, dayIdx).map((ex) => ({
    id:     ex.id,
    name:   ex.name,
    muscle: "Abdômen",
    sets:   "4x15",
    rest:   "30s",
    tip:    "Foco na contração do abdômen — evite puxar o pescoço, o movimento deve vir da barriga.",
    gif:    GIF_MAP[ex.id] ?? undefined,
  }));
}

function buildCardioExercise(cycleNumber: number, dayIdx: number): Exercise {
  const c = pickCardio(cycleNumber, dayIdx);
  return {
    id:     c.id,
    name:   c.name,
    muscle: "Cardio",
    sets:   "20-30 min",
    rest:   "—",
    tip:    "Ritmo moderado e constante — o objetivo é queimar calorias extras sem prejudicar a recuperação do treino de força.",
    gif:    GIF_MAP[c.id] ?? undefined,
  };
}

/** Estima a duração (min) somando o tempo dos exercícios de força + abdômen + cardio. */
function estimateDuration(mainCount: number, timePerMain: number, absCount: number): number {
  const absTime    = absCount * 4 * (1.5 + 30 / 60); // 4 séries, ~30s de descanso
  const cardioTime = 25; // meio-termo de 20-30min
  return Math.round(5 + mainCount * timePerMain + absTime + cardioTime);
}

// ─── API pública ──────────────────────────────────────────────────────────────

/** Slots disponíveis para o aluno escolher manualmente */
export interface ManualSlot {
  name:    string;
  emoji:   string;
  groups:  MuscleGroup[];
  volumes: Partial<Record<MuscleGroup, number>>;
}

export const MANUAL_SLOTS: ManualSlot[] = [
  { name: "Quadríceps",            emoji: "🦵", groups: ["quadriceps", "panturrilha"],               volumes: { quadriceps: 5, panturrilha: 2 } },
  { name: "Glúteos + Posteriores", emoji: "🍑", groups: ["gluteos", "posteriores"],                  volumes: { gluteos: 4, posteriores: 3 } },
  { name: "Peito + Tríceps",       emoji: "💪", groups: ["peito", "triceps"],                        volumes: { peito: 4, triceps: 3 } },
  { name: "Costas + Bíceps",       emoji: "🏋️", groups: ["costas", "biceps"],                        volumes: { costas: 4, biceps: 3 } },
  { name: "Ombros + Abdômen",      emoji: "🔥", groups: ["ombros", "core"],                          volumes: { ombros: 4, core: 3 } },
  { name: "Braços",                emoji: "⚡", groups: ["biceps", "triceps"],                       volumes: { biceps: 4, triceps: 4 } },
  { name: "Abdômen",               emoji: "🎯", groups: ["core"],                                    volumes: { core: 5 } },
  { name: "Pernas Completo",       emoji: "🏃", groups: ["quadriceps", "posteriores", "panturrilha"], volumes: { quadriceps: 3, posteriores: 2, panturrilha: 2 } },
  { name: "Superior Completo",     emoji: "💥", groups: ["peito", "costas", "ombros"],               volumes: { peito: 3, costas: 2, ombros: 2 } },
  { name: "Glúteos Isolado",       emoji: "✨", groups: ["gluteos"],                                 volumes: { gluteos: 6 } },
];

/** Monta um treino a partir de um slot manual escolhido pelo aluno (sempre com cardio no final) */
export function getWorkoutBySlot(
  anamnese: AnamneseData,
  slot: ManualSlot,
  cycleNumber: number = 1
): DayWorkout {
  const {
    sexo      = "Feminino",
    objetivo  = "Mais disposição e saúde",
    nivel     = "Iniciante (nunca treinei)",
    lesoes    = "Não tenho",
  } = anamnese;

  const isFemale = sexo === "Feminino";
  const injuries = lesoes !== "Não tenho" ? [lesoes] : [];
  const { sets, reps, rest, tip } = getSetsRest(objetivo, nivel, cycleNumber);
  const defs = pickExercises(slot.groups, injuries, cycleNumber, slot.volumes ?? {}, isFemale);

  const exercises: Exercise[] = defs.map((ex) => ({
    id:     ex.id,
    name:   ex.name,
    muscle: ex.primaryMuscle,
    sets:   `${sets}x${reps}`,
    rest,
    tip,
    gif:    GIF_MAP[ex.id] ?? undefined,
  }));

  const mainCount = exercises.length;
  exercises.push(buildCardioExercise(cycleNumber, 0));

  const restSeconds = parseInt(rest) || 60;
  const timePerEx   = sets * (1.5 + restSeconds / 60);
  const duration    = estimateDuration(mainCount, timePerEx, 0);

  return {
    name:        slot.name,
    emoji:       slot.emoji,
    muscleLabel: slot.groups.map((g) => GROUP_LABELS[g]).join(" · "),
    duration,
    exercises,
    isRest: false,
  };
}

/** Retorna o treino para um dia específico da semana (0=Seg … 6=Dom) */
export function getWorkoutForDay(anamnese: AnamneseData | null, dayIdx: number, cycleNumber: number = 1): DayWorkout {
  if (!anamnese) {
    return {
      name: "Treino",
      emoji: "🏋️",
      muscleLabel: "Complete a anamnese",
      duration: 0,
      exercises: [],
      isRest: false,
    };
  }

  const {
    sexo       = "Feminino",
    objetivo   = "Mais disposição e saúde",
    nivel      = "Iniciante (nunca treinei)",
    diasTreino = "3 dias",
    lesoes     = "Não tenho",
  } = anamnese;

  const isFemale = sexo === "Feminino";
  const splits   = isFemale ? FEMALE_SPLITS : MALE_SPLITS;
  const split    = splits[diasTreino] ?? splits["3 dias"];
  const slot     = split[dayIdx];

  if (!slot) {
    return {
      name: "Descanso",
      emoji: "😴",
      muscleLabel: "Recuperação ativa",
      duration: 0,
      exercises: [],
      isRest: true,
    };
  }

  const injuries = lesoes !== "Não tenho" ? [lesoes] : [];
  const { sets, reps, rest, tip } = getSetsRest(objetivo, nivel, cycleNumber);
  const defs = pickExercises(slot.groups, injuries, cycleNumber, slot.volumes, isFemale);

  const exercises: Exercise[] = defs.map((ex) => ({
    id:     ex.id,
    name:   ex.name,
    muscle: ex.primaryMuscle,
    sets:   `${sets}x${reps}`,
    rest,
    tip,
    gif:    GIF_MAP[ex.id] ?? undefined,
  }));
  const mainCount = exercises.length;

  // Abdômen (2-3x/semana, conforme o slot) — sempre antes do cardio
  const absExercises = slot.abs ? buildAbsExercises(injuries, isFemale, cycleNumber, dayIdx) : [];
  exercises.push(...absExercises);

  // Cardio — todo dia de treino, sempre por último
  exercises.push(buildCardioExercise(cycleNumber, dayIdx));

  const restSeconds = parseInt(rest) || 60;
  const timePerEx   = sets * (1.5 + restSeconds / 60);
  const duration    = estimateDuration(mainCount, timePerEx, absExercises.length);

  return {
    name:        slot.name,
    emoji:       slot.emoji,
    muscleLabel: slot.groups.map((g) => GROUP_LABELS[g]).join(" · "),
    duration,
    exercises,
    isRest: false,
  };
}

/** Retorna o treino personalizado para o dia atual com base no gênero e objetivos */
export function getTodayWorkout(anamnese: AnamneseData | null, cycleNumber: number = 1): DayWorkout {
  const jsDay  = new Date().getDay();
  const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
  return getWorkoutForDay(anamnese, dayIdx, cycleNumber);
}

/** Retorna os 7 dias da semana com indicação de treino ou descanso */
export function getWeekSchedule(anamnese: AnamneseData | null): WeekDay[] {
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  if (!anamnese) {
    return labels.map((d) => ({ day: d, isTraining: false, workoutName: "", emoji: "" }));
  }

  const isFemale = (anamnese.sexo ?? "Feminino") === "Feminino";
  const splits   = isFemale ? FEMALE_SPLITS : MALE_SPLITS;
  const split    = splits[anamnese.diasTreino ?? "3 dias"] ?? splits["3 dias"];

  return labels.map((d, i) => ({
    day:         d,
    isTraining:  !!split[i],
    workoutName: split[i]?.name ?? "",
    emoji:       split[i]?.emoji ?? "",
  }));
}
