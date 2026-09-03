import type { AnamneseData } from "./types";
import GIF_URLS from "./gif-urls.json";
import VIDEO_URLS from "./video-urls.json";

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
  | "core"
  | "trapezio"
  | "antebraco";

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: string;
  rest: string;
  tip: string;
  gif?: string;   // caminho em /gifs/<id>.gif — undefined se não houver GIF disponível
  video?: string; // vídeo de demonstração — undefined se ainda não gravado (usa gif como fallback)
}

// Mapeamento de IDs → URLs no Vercel Blob (gerado por scripts/upload-gifs.mjs)
const GIF_MAP = GIF_URLS as Record<string, string>;
// Mapeamento de IDs → URLs no Vercel Blob (gerado por scripts/upload-videos.mjs)
const VIDEO_MAP = VIDEO_URLS as Record<string, string>;

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
  avoidForBeginner?: boolean; // tecnicamente exigente — fora do pool para nível Iniciante
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
    { id: "q1",  name: "Agachamento livre",               primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Quadril"], avoidForBeginner: true },
    { id: "q2",  name: "Leg press 45°",                   primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: [] },
    { id: "q9",  name: "Leg press horizontal",            primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: [] },
    { id: "q6",  name: "Hack squat (máquina)",            primaryMuscle: "Quadríceps / Vasto lateral",  compound: true,  avoidFor: ["Joelho"] },
    { id: "q8",  name: "Agachamento sumô com barra",      primaryMuscle: "Quadríceps / Adutores",       compound: true,  avoidFor: ["Quadril", "Coluna/lombar"], avoidForBeginner: true },
    { id: "q10", name: "Agachamento no Smith",            primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Quadril", "Coluna/lombar"] },
    { id: "q13", name: "Agachamento com trava",           primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "q14", name: "Agachamento taça",                primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Quadril"] },
    { id: "q3",  name: "Agachamento búlgaro",             primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo", "Condromalácia"] },
    { id: "q4",  name: "Afundo com halteres",             primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Condromalácia"] },
    { id: "q7",  name: "Agachamento búlgaro com barra",   primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo", "Condromalácia", "Coluna/lombar"] },
    { id: "q11", name: "Avanço com halteres",             primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Condromalácia"], avoidForBeginner: true },
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
    { id: "g2",  name: "Agachamento sumô com haltere",    primaryMuscle: "Glúteos / Adutores",          compound: true,  avoidFor: ["Quadril"] },
    { id: "g8",  name: "Recuo com halteres",              primaryMuscle: "Glúteos / Isquiotibiais",     compound: true,  avoidFor: ["Quadril"], avoidForBeginner: true },
    { id: "g3",  name: "Step-up com haltere",             primaryMuscle: "Glúteos / Quadríceps",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo"] },
    { id: "g9",  name: "Elevação de perna em pé",         primaryMuscle: "Glúteo máximo",               compound: true,  avoidFor: [] },
    { id: "g12", name: "Step-up com barra",               primaryMuscle: "Glúteos / Quadríceps",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo"] },
    { id: "g10", name: "Elevação pélvica unilateral",     primaryMuscle: "Glúteo máximo (unilateral)",  compound: true,  avoidFor: [] },
    { id: "g1",  name: "Hip thrust com barra",            primaryMuscle: "Glúteo máximo",               compound: true,  avoidFor: ["Coluna/lombar", "Quadril"] },
    { id: "g11", name: "Coice de glúteo no cabo",         primaryMuscle: "Glúteo máximo",               compound: false, avoidFor: [] },
    { id: "g4",  name: "Glúteo no cabo (kickback)",       primaryMuscle: "Glúteo máximo",               compound: false, avoidFor: [] },
    { id: "g5",  name: "Abdução no cabo baixo",           primaryMuscle: "Glúteo médio",                compound: false, avoidFor: [] },
  ],

  // ── POSTERIORES (10 exercícios) ───────────────────────────────────────────

  posteriores: [
    { id: "po1",  name: "Stiff com barra",                primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar", "Quadril", "Osteoporose"], avoidForBeginner: true },
    { id: "po3",  name: "Cadeira flexora",                primaryMuscle: "Isquiotibiais",               compound: true,  avoidFor: ["Joelho"] },
    { id: "po4",  name: "Mesa flexora",                   primaryMuscle: "Isquiotibiais",               compound: true,  avoidFor: ["Joelho"] },
    { id: "po9",  name: "Stiff com haltere",              primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar", "Quadril", "Osteoporose"], avoidForBeginner: true },
    { id: "po6",  name: "Stiff unilateral com halteres",  primaryMuscle: "Isquiotibiais (unilateral)",  compound: true,  avoidFor: ["Coluna/lombar", "Quadril", "Tornozelo", "Osteoporose"], avoidForBeginner: true },
    { id: "po5",  name: "Bom dia (good morning)",         primaryMuscle: "Isquiotibiais / Lombar",      compound: true,  avoidFor: ["Coluna/lombar", "Quadril", "Osteoporose"], avoidForBeginner: true },
    { id: "po11", name: "Bom dia no Smith",               primaryMuscle: "Isquiotibiais / Lombar",      compound: true,  avoidFor: ["Coluna/lombar", "Quadril", "Osteoporose"], avoidForBeginner: true },
    { id: "po12", name: "Levantamento terra sumô",        primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar", "Joelho", "Quadril"], avoidForBeginner: true },
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
    { id: "p28", name: "Supino reto na máquina",           primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro"] },
    { id: "p33", name: "Supino reto com barra",            primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "p29", name: "Supino com halteres",              primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro"] },
    { id: "p27", name: "Supino inclinado com halteres",    primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p30", name: "Supino inclinado com barra",       primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "p31", name: "Supino inclinado com barra (pegada fechada)", primaryMuscle: "Peitoral superior", compound: true,  avoidFor: ["Punho/Cotovelo"] },
    { id: "p26", name: "Supino inclinado na máquina",      primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p32", name: "Supino inclinado no cabo",         primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p34", name: "Supino vertical (shoulder press)", primaryMuscle: "Peitoral / Ombros",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p20", name: "Crucifixo deitado com cabo",       primaryMuscle: "Peitoral (abertura)",         compound: false, avoidFor: ["Ombro"] },
    { id: "p22", name: "Crucifixo inclinado com halteres", primaryMuscle: "Peitoral superior (abertura)", compound: false, avoidFor: ["Ombro"] },
    { id: "p21", name: "Crucifixo inclinado no cross",     primaryMuscle: "Peitoral superior (abertura)", compound: false, avoidFor: ["Ombro"] },
    { id: "p23", name: "Crucifixo com halteres",           primaryMuscle: "Peitoral (abertura)",         compound: false, avoidFor: ["Ombro"] },
    { id: "p24", name: "Crucifixo na máquina",             primaryMuscle: "Peitoral (abertura)",         compound: false, avoidFor: ["Ombro"] },
    { id: "p25", name: "Peck deck (máquina)",              primaryMuscle: "Peitoral",                    compound: false, avoidFor: ["Ombro"] },
    { id: "p17", name: "Crossover polia alta",             primaryMuscle: "Peitoral / Serrátil",         compound: false, avoidFor: ["Ombro"] },
    { id: "p18", name: "Crossover polia baixa",            primaryMuscle: "Peitoral inferior",           compound: false, avoidFor: ["Ombro"] },
    { id: "p19", name: "Crossover polia média",            primaryMuscle: "Peitoral (porção média)",     compound: false, avoidFor: ["Ombro"] },
  ],

  // ── COSTAS (19 exercícios) ───────────────────────────────────────────────

  costas: [
    { id: "c18", name: "Pulldown",                            primaryMuscle: "Dorsal",                     compound: true,  avoidFor: ["Ombro"] },
    { id: "c25", name: "Puxada no graviton pegada neutra",    primaryMuscle: "Dorsal / Teres maior",       compound: true,  avoidFor: ["Ombro"] },
    { id: "c19", name: "Pulley frente articulado pegada supinada", primaryMuscle: "Dorsal / Bíceps",       compound: true,  avoidFor: ["Ombro"] },
    { id: "c21", name: "Pulley frente articulado",            primaryMuscle: "Dorsal",                     compound: true,  avoidFor: ["Ombro"] },
    { id: "c20", name: "Pulley frente articulado unilateral", primaryMuscle: "Dorsal (unilateral)",        compound: true,  avoidFor: ["Ombro"] },
    { id: "c22", name: "Pulley frente pegada aberta",         primaryMuscle: "Dorsal",                     compound: false, avoidFor: ["Ombro"] },
    { id: "c23", name: "Pulley frente triângulo",             primaryMuscle: "Dorsal inferior",            compound: false, avoidFor: ["Ombro"] },
    { id: "c24", name: "Pulley frente unilateral",            primaryMuscle: "Dorsal (unilateral)",        compound: false, avoidFor: ["Ombro"] },
    { id: "c32", name: "Remada curvada com barra livre",      primaryMuscle: "Dorsal / Trapézio médio",    compound: true,  avoidFor: ["Coluna/lombar", "Punho/Cotovelo", "Osteoporose"] },
    { id: "c33", name: "Remada curvada na máquina",           primaryMuscle: "Dorsal / Trapézio",          compound: true,  avoidFor: [] },
    { id: "c35", name: "Remada unilateral com halteres",      primaryMuscle: "Dorsal (unilateral)",        compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "c31", name: "Remada cavalinho na máquina",         primaryMuscle: "Dorsal / Rombóides",         compound: true,  avoidFor: [] },
    { id: "c26", name: "Remada articulada pegada pronada",    primaryMuscle: "Dorsal / Trapézio",          compound: true,  avoidFor: [] },
    { id: "c34", name: "Remada articulada pegada neutra",     primaryMuscle: "Dorsal / Trapézio",          compound: true,  avoidFor: [] },
    { id: "c27", name: "Remada articulada unilateral pegada pronada", primaryMuscle: "Dorsal (unilateral)", compound: true, avoidFor: [] },
    { id: "c28", name: "Remada baixa com barra",              primaryMuscle: "Dorsal / Rombóides",         compound: true,  avoidFor: [] },
    { id: "c29", name: "Remada baixa triângulo",              primaryMuscle: "Dorsal inferior",            compound: true,  avoidFor: [] },
    { id: "c30", name: "Remada baixa unilateral",             primaryMuscle: "Dorsal (unilateral)",        compound: true,  avoidFor: [] },
    { id: "c17", name: "Face pull",                           primaryMuscle: "Trapézio / Deltóide posterior", compound: false, avoidFor: [] },
  ],

  // ── OMBROS (10 exercícios) ────────────────────────────────────────────────

  ombros: [
    { id: "o20", name: "Desenvolvimento no banco com halteres", primaryMuscle: "Deltóide anterior / lateral", compound: true, avoidFor: ["Ombro"] },
    { id: "o19", name: "Desenvolvimento na máquina",          primaryMuscle: "Deltóide anterior / lateral", compound: true,  avoidFor: ["Ombro"] },
    { id: "o18", name: "Desenvolvimento em pé pegada neutra", primaryMuscle: "Deltóide anterior",          compound: true,  avoidFor: ["Ombro"] },
    { id: "o23", name: "Elevação lateral unilateral",         primaryMuscle: "Deltóide lateral",           compound: false, avoidFor: ["Ombro"] },
    { id: "o21", name: "Elevação frontal no cabo",             primaryMuscle: "Deltóide anterior",          compound: false, avoidFor: ["Ombro"] },
    { id: "o22", name: "Elevação frontal unilateral no cabo", primaryMuscle: "Deltóide anterior",          compound: false, avoidFor: ["Ombro"] },
    { id: "o24", name: "Posterior de ombro sentado com halteres", primaryMuscle: "Deltóide posterior",     compound: false, avoidFor: [] },
    { id: "o25", name: "Posterior de ombro em pé com halteres",  primaryMuscle: "Deltóide posterior",      compound: false, avoidFor: [] },
    { id: "o16", name: "Crucifixo invertido na máquina",       primaryMuscle: "Deltóide posterior",         compound: false, avoidFor: [] },
    { id: "o17", name: "Crucifixo invertido no cabo",          primaryMuscle: "Deltóide posterior",         compound: false, avoidFor: [] },
  ],

  // ── BÍCEPS (21 exercícios) ────────────────────────────────────────────────

  biceps: [
    { id: "b28", name: "Rosca direta com barra W",             primaryMuscle: "Bíceps (cabeça curta)",      compound: false, avoidFor: [] },
    { id: "b26", name: "Rosca direta alternada",                primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b25", name: "Rosca direta alternada com halteres",  primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b27", name: "Rosca direta alternada 45°",            primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b18", name: "Rosca alternada sentado",               primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b19", name: "Rosca bíceps com halteres",             primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b20", name: "Rosca bíceps na máquina",                primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b21", name: "Rosca bíceps sentado",                  primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b33", name: "Rosca no cabo",                          primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b22", name: "Rosca unilateral pegada invertida no cabo", primaryMuscle: "Bíceps (unilateral)",   compound: false, avoidFor: [] },
    { id: "b23", name: "Rosca unilateral no cabo alto",          primaryMuscle: "Bíceps (unilateral)",       compound: false, avoidFor: [] },
    { id: "b16", name: "Rosca Scott com barra W",                primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "b17", name: "Rosca Scott na máquina",                 primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "b34", name: "Rosca Scott alternada com halteres",     primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "b35", name: "Rosca Scott com halteres",                primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "b15", name: "Rosca banco inclinado",                  primaryMuscle: "Bíceps (alongado)",         compound: false, avoidFor: [] },
    { id: "b24", name: "Rosca concentrada",                      primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: [] },
    { id: "b29", name: "Rosca direta concentrada",               primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: [] },
    { id: "b32", name: "Rosca martelo com halteres",             primaryMuscle: "Bíceps / Braquial",         compound: false, avoidFor: [] },
    { id: "b30", name: "Rosca martelo com corda",                primaryMuscle: "Bíceps / Braquial",         compound: false, avoidFor: [] },
    { id: "b31", name: "Rosca martelo sentada",                  primaryMuscle: "Bíceps / Braquial",         compound: false, avoidFor: [] },
  ],

  // ── TRÍCEPS (13 exercícios — ~4 ciclos) ──────────────────────────────────

  triceps: [
    { id: "t3",  name: "Mergulho no banco",               primaryMuscle: "Tríceps / Peitoral inf.",     compound: true,  avoidFor: ["Ombro"] },
    { id: "t1",  name: "Tríceps pulley no cabo",          primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t6",  name: "Tríceps pulley com corda",        primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t9",  name: "Tríceps pulley invertido",        primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
    { id: "t11", name: "Tríceps pulley barra V",          primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t2",  name: "Tríceps testa (skullcrusher)",    primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t8",  name: "Tríceps testa unilateral",        primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t13", name: "Tríceps no cabo alto",            primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
    { id: "t10", name: "Tríceps deitado barra W",         primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t5",  name: "Tríceps francês com haltere",     primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t7",  name: "Tríceps francês unilateral cabo", primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "t12", name: "Tríceps francês sentado",         primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t4",  name: "Tríceps kickback com haltere",    primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
  ],

  // ── ABDÔMEN (14 exercícios — usados como finalizador fixo 4x15, não entram
  //    na periodização — ver pickAbsExercises / buildAbsExercises) ───────────

  core: [
    { id: "ab14", name: "Prancha isométrica",             primaryMuscle: "Core completo / Estabilização", compound: false, avoidFor: [] },
    { id: "ab3",  name: "Abdominal crunch",               primaryMuscle: "Reto abdominal",                 compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab7",  name: "Crunch na máquina",               primaryMuscle: "Reto abdominal",                 compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab10", name: "Supra no banco declinado",        primaryMuscle: "Reto abdominal (superior)",      compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab13", name: "Crunch oblíquo",                  primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab11", name: "Toque no calcanhar alternado",    primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab6",  name: "Abdominal infra",                 primaryMuscle: "Abdômen inferior",               compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
    { id: "ab1",  name: "Abdominal infra deitado",         primaryMuscle: "Abdômen inferior",               compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
    { id: "ab4",  name: "Tuck crunch",                     primaryMuscle: "Abdômen completo",                compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
    { id: "ab2",  name: "Abdominal bicicleta",              primaryMuscle: "Oblíquos / Reto abdominal",      compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
    { id: "ab5",  name: "Abdominal twisting",               primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
    { id: "ab12", name: "Abdominal twist",                  primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
    { id: "ab9",  name: "Rotação de tronco",                primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
    { id: "ab8",  name: "Abdominal remador",                primaryMuscle: "Abdômen completo",                compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
  ],

  // ── TRAPÉZIO (4 exercícios — só treino masculino) ─────────────────────────

  trapezio: [
    { id: "tr3", name: "Encolhimento com barra",             primaryMuscle: "Trapézio",  compound: false, avoidFor: [] },
    { id: "tr2", name: "Encolhimento com halteres",          primaryMuscle: "Trapézio",  compound: false, avoidFor: [] },
    { id: "tr1", name: "Encolhimento no cabo",                primaryMuscle: "Trapézio",  compound: false, avoidFor: [] },
    { id: "tr4", name: "Encolhimento no Smith",               primaryMuscle: "Trapézio",  compound: false, avoidFor: [] },
  ],

  // ── ANTEBRAÇO (12 exercícios — só treino masculino) ───────────────────────

  antebraco: [
    { id: "an4",  name: "Hand grip",                             primaryMuscle: "Antebraço (preensão)", compound: false, avoidFor: [] },
    { id: "an5",  name: "Rolinho de antebraço",                  primaryMuscle: "Antebraço",             compound: false, avoidFor: [] },
    { id: "an11", name: "Rosca de dedo com barra",                primaryMuscle: "Antebraço (flexores)",  compound: false, avoidFor: [] },
    { id: "an7",  name: "Rosca de dedos com halteres",            primaryMuscle: "Antebraço (flexores)",  compound: false, avoidFor: [] },
    { id: "an12", name: "Rosca de punho com barra",               primaryMuscle: "Antebraço (flexores)",  compound: false, avoidFor: [] },
    { id: "an10", name: "Rosca de punho atrás das costas",        primaryMuscle: "Antebraço (flexores)",  compound: false, avoidFor: [] },
    { id: "an8",  name: "Rosca de punho pegada neutra",            primaryMuscle: "Antebraço",             compound: false, avoidFor: [] },
    { id: "an9",  name: "Rosca de punho reversa com barra",        primaryMuscle: "Antebraço (extensores)", compound: false, avoidFor: [] },
    { id: "an6",  name: "Rosca inversa com barra",                 primaryMuscle: "Antebraço (extensores)", compound: false, avoidFor: [] },
    { id: "an3",  name: "Flexão de punho com halteres",            primaryMuscle: "Antebraço (flexores)",  compound: false, avoidFor: [] },
    { id: "an1",  name: "Flexão de pulso neutra sentado",           primaryMuscle: "Antebraço",             compound: false, avoidFor: [] },
    { id: "an2",  name: "Flexão de punho reversa com anilha",       primaryMuscle: "Antebraço (extensores)", compound: false, avoidFor: [] },
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
      groups: ["panturrilha", "quadriceps", "gluteos"],
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
      groups: ["panturrilha", "quadriceps", "posteriores"],
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
      groups: ["panturrilha", "quadriceps"],
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
      groups: ["panturrilha", "quadriceps"],
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
      groups: ["panturrilha", "trapezio", "antebraco", "costas", "peito", "ombros", "biceps", "triceps"],
      volumes: { costas: 2, peito: 2, ombros: 2, biceps: 1, triceps: 1, panturrilha: 1, trapezio: 1, antebraco: 1 },
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
      groups: ["panturrilha", "trapezio", "antebraco", "costas", "biceps"],
      volumes: { costas: 4, biceps: 2, panturrilha: 1, trapezio: 1, antebraco: 1 },
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
      groups: ["panturrilha", "trapezio", "antebraco", "costas", "biceps"],
      volumes: { costas: 4, biceps: 2, panturrilha: 1, trapezio: 1, antebraco: 1 },
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
      groups: ["trapezio", "antebraco", "costas", "biceps"],
      volumes: { costas: 4, biceps: 3, trapezio: 1, antebraco: 1 },
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
      groups: ["panturrilha", "biceps", "triceps"],
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
  trapezio:    "Trapézio",
  antebraco:   "Antebraço",
};

/**
 * Trapézio: só para homens em nível avançado (Intermediário) — iniciante e
 * básico não precisam desse volume extra, e não faz parte do treino feminino.
 */
function isGroupAllowed(g: MuscleGroup, isFemale: boolean, isBeginner: boolean): boolean {
  if (g === "trapezio") return !isFemale && !isBeginner;
  return true;
}

// ─── "Outra condição" (texto livre) → tags conhecidas ────────────────────────
// Quando a aluna descreve a condição em texto livre, tentamos reconhecer
// palavras-chave e aplicar as mesmas restrições da condição correspondente,
// em vez de cair sempre no modo "Outra" (que exclui qualquer exercício com
// qualquer restrição, mais conservador do que precisa ser).

const OUTRA_KEYWORDS: Record<string, string[]> = {
  "Condromalácia": ["condromalacia"],
  "Joelho": ["joelho", "menisco", "ligamento cruzado", " lca ", "tendinite patelar", "patela"],
  "Coluna/lombar": ["lombar", "hernia de disco", "hernia", "disco", "coluna", "lombalgia", "protrusao"],
  "Ombro": ["ombro", "manguito rotador", "luxacao"],
  "Punho/Cotovelo": ["punho", "cotovelo", "epicondilite", "tunel do carpo", "carpo"],
  "Quadril": ["quadril", "femoroacetabular", "labrum", " fai "],
  "Tornozelo": ["tornozelo", "entorse"],
  "Osteoporose": ["osteoporose", "osteopenia", "densidade ossea"],
};

function normalizeText(s: string): string {
  return ` ${s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")} `;
}

/** Reconhece palavras-chave no texto livre de "Outra condição" e retorna as tags equivalentes já mapeadas. */
function matchOutraKeywords(detalhe: string): string[] {
  const norm = normalizeText(detalhe);
  const matched: string[] = [];
  for (const [tag, keywords] of Object.entries(OUTRA_KEYWORDS)) {
    if (keywords.some((k) => norm.includes(normalizeText(k).trim()))) matched.push(tag);
  }
  return matched;
}

/**
 * Resolve a lista final de restrições: se "Outra" foi marcada e o texto livre
 * bate com alguma condição conhecida, usa as tags específicas (mais precisas)
 * em vez do modo conservador de "Outra". Sem correspondência, mantém "Outra".
 */
function resolveInjuries(lesoes: string[], lesoesDetalhe?: string): string[] {
  const base = lesoes.filter((l) => l !== "Nenhuma");
  if (!base.includes("Outra") || !lesoesDetalhe?.trim()) return base;

  const matched = matchOutraKeywords(lesoesDetalhe);
  if (matched.length === 0) return base;

  const semOutra = base.filter((l) => l !== "Outra");
  return [...new Set([...semOutra, ...matched])];
}

/** Volume padrão por grupo (fallback para slots manuais sem volumes definidos) */
function defaultVol(g: MuscleGroup, isFemale: boolean): number {
  const female: Record<MuscleGroup, number> = {
    costas: 4, peito: 3, ombros: 4, biceps: 2, triceps: 2,
    quadriceps: 4, gluteos: 5, posteriores: 3, panturrilha: 1, core: 1,
    trapezio: 1, antebraco: 1,
  };
  const male: Record<MuscleGroup, number> = {
    costas: 4, peito: 4, ombros: 3, biceps: 3, triceps: 3,
    quadriceps: 2, gluteos: 2, posteriores: 2, panturrilha: 1, core: 1,
    trapezio: 1, antebraco: 1,
  };
  return isFemale ? female[g] : male[g];
}

type SetsRest = { sets: number; reps: string; rest: string; tip: string };

/**
 * Periodização em 3 fases que rotacionam a cada ciclo de 30 dias — aplicada a
 * todos os exercícios "normais" do treino.
 *
 * Fase 1 — Hipertrofia base  (ciclos 1, 4, 7 … para iniciante/básico | 1, 5, 9 … para intermediário)
 * Fase 2 — Força
 * Fase 3 — Volume alto
 *
 * Para intermediário, o ciclo tem uma 4ª posição (ver getAdvancedTechnique) que
 * não substitui o treino inteiro — só adiciona um finalizador em 1-2 dias da
 * semana (ver isFinisherDay). Nessa posição, os exercícios normais usam a
 * mesma prescrição da fase 3 (volume alto).
 */
function getBaseSetsRest(
  goal: string,
  nivel: string,
  cycleNumber: number = 1,
): SetsRest {
  const isInter    = nivel?.includes("Intermediário");
  const totalPhases = isInter ? 4 : 3;
  let phase          = ((cycleNumber - 1) % totalPhases) + 1; // 1 → 2 → 3 → (4) → 1 → …
  if (phase === 4) phase = 3; // fase 4 usa a base da fase 3 — só o finalizador muda (ver getAdvancedTechnique)

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
  const sets = isInter ? 5 : 4;
  return { sets, reps: goal?.includes("músculo") ? "12-15" : "15", rest: "40s",
    tip: "💦 Fase de volume: carga moderada, muitas repetições, descanso curto. Foco em pump e resistência. Seu músculo vai crescer nas micro-pausas." };
}

/**
 * Técnica avançada do finalizador (dropset / bi-set / cluster set / rest-pause).
 * Retorna null se o aluno não é intermediário, ou se o ciclo atual não está na
 * "rodada" de fase 4 — nesses casos o dia inteiro usa só getBaseSetsRest.
 *
 * Quando não-nulo, aplica-se a UM ÚNICO exercício (o último/finalizador do
 * treino), e só em 1-2 dias de treino da semana (ver isFinisherDay) — nunca no
 * treino inteiro.
 */
function getAdvancedTechnique(goal: string, nivel: string, cycleNumber: number): SetsRest | null {
  const isInter = nivel?.includes("Intermediário");
  if (!isInter) return null;

  const phase = ((cycleNumber - 1) % 4) + 1;
  if (phase !== 4) return null;

  // Alterna entre 2 técnicas por objetivo a cada nova rodada da fase 4
  // (ciclo 4 → técnica A, ciclo 8 → técnica B, ciclo 12 → técnica A de novo…)
  const advancedRound = Math.floor((cycleNumber - 1) / 4) % 2;

  if (goal?.includes("gordura") || goal?.includes("condicionamento")) {
    if (advancedRound === 0) {
      return { sets: 3, reps: "12+8", rest: "60s",
        tip: "🔥 Dropset: complete as 12 reps normais, reduza 20% da carga sem pausar e execute mais 8 reps. Máximo esforço metabólico nessa série." };
    }
    return { sets: 4, reps: "10-12", rest: "sem pausa entre a dupla · 90s depois",
      tip: "🔗 Bi-set: execute este exercício direto com o próximo, sem descansar entre eles. Descanse só depois de completar a dupla." };
  }

  if (advancedRound === 0) {
    return { sets: 4, reps: "8+4", rest: "90s",
      tip: "⚡ Cluster set: execute 4 reps, pausa de 10s sem soltar o peso, mais 4 reps. As últimas 4 devem ser muito difíceis — permite carga maior com técnica perfeita." };
  }
  return { sets: 4, reps: "6-8 + rest-pause", rest: "2min",
    tip: "⏸️ Rest-pause: leve a série quase à falha, descanse só 15s sem soltar o peso, e faça mais 4-6 reps. Repita esse mini-descanso mais uma vez." };
}

/**
 * Escolhe 1-2 dias de treino da semana (do split já filtrado por sexo/frequência)
 * que recebem o finalizador de técnica avançada. Determinístico por split — não
 * muda de mês pra mês, só o `advancedRound` (dropset↔bi-set, cluster↔rest-pause) muda.
 */
function getFinisherDays(split: Record<number, SplitSlot>): Set<number> {
  const days = Object.keys(split).map(Number).sort((a, b) => a - b);
  const chosen = new Set<number>();
  if (days.length === 0) return chosen;
  chosen.add(days[0]);
  if (days.length >= 4) chosen.add(days[Math.floor(days.length / 2)]);
  return chosen;
}

// Exercícios guiados (máquina, Smith, cabo/polia) — priorizados para iniciantes
// por exigirem menos controle técnico de trajetória/estabilização que o peso livre.
const MACHINE_KEYWORDS = ["máquina", "smith", "cabo", "polia", "pulley", "graviton", "leg press", "cadeira", "mesa", "peck deck"];

function isMachineFriendly(name: string): boolean {
  const lower = name.toLowerCase();
  return MACHINE_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * Monta a lista de exercícios filtrada por lesão, ordenada (compostos primeiro,
 * com máquinas priorizadas para iniciantes) e rotacionada pelo número do ciclo —
 * exercícios diferentes a cada mês.
 *
 * @param volumes  Quantidade de exercícios por grupo (usa defaultVol como fallback)
 */
function pickExercises(
  groups: MuscleGroup[],
  injuries: string[],
  cycleNumber: number = 1,
  volumes: Partial<Record<MuscleGroup, number>> = {},
  isFemale: boolean = true,
  isBeginner: boolean = false
): ExerciseDef[] {
  const result: ExerciseDef[] = [];

  for (const g of groups) {
    if (!isGroupAllowed(g, isFemale, isBeginner)) continue;

    const pool = LIBRARY[g].filter((ex) => {
      const injuryOk = injuries.includes("Outra") ? ex.avoidFor.length === 0 : !ex.avoidFor.some((a) => injuries.includes(a));
      if (!injuryOk) return false;
      return !(isBeginner && ex.avoidForBeginner);
    });

    // Compostos primeiro; para iniciantes, máquinas antes de peso livre dentro do mesmo grupo
    const sorted = [...pool].sort((a, b) => {
      if (isBeginner) {
        const machineDiff = +isMachineFriendly(b.name) - +isMachineFriendly(a.name);
        if (machineDiff !== 0) return machineDiff;
      }
      return +b.compound - +a.compound;
    });
    let cap = volumes[g] ?? defaultVol(g, isFemale);
    if (isFemale && g === "peito") cap = Math.min(cap, 2);

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
    video:  VIDEO_MAP[ex.id] ?? undefined,
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
    video:  VIDEO_MAP[c.id] ?? undefined,
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
    sexo          = "Feminino",
    objetivo      = "Mais disposição e saúde",
    nivel         = "Iniciante (nunca treinei)",
    lesoes        = [],
    lesoesDetalhe,
  } = anamnese;

  const isFemale = sexo === "Feminino";
  const isBeginner = (nivel?.includes("Iniciante") || nivel?.includes("Básico")) ?? false;
  const injuries = resolveInjuries(lesoes, lesoesDetalhe);
  const { sets, reps, rest, tip } = getBaseSetsRest(objetivo, nivel, cycleNumber);
  const defs = pickExercises(slot.groups, injuries, cycleNumber, slot.volumes ?? {}, isFemale, isBeginner);

  const exercises: Exercise[] = defs.map((ex) => ({
    id:     ex.id,
    name:   ex.name,
    muscle: ex.primaryMuscle,
    sets:   `${sets}x${reps}`,
    rest,
    tip,
    gif:    GIF_MAP[ex.id] ?? undefined,
    video:  VIDEO_MAP[ex.id] ?? undefined,
  }));

  const mainCount = exercises.length;
  exercises.push(buildCardioExercise(cycleNumber, 0));

  const restSeconds = parseInt(rest) || 60;
  const timePerEx   = sets * (1.5 + restSeconds / 60);
  const duration    = estimateDuration(mainCount, timePerEx, 0);

  return {
    name:        slot.name,
    emoji:       slot.emoji,
    muscleLabel: slot.groups.filter((g) => isGroupAllowed(g, isFemale, isBeginner)).map((g) => GROUP_LABELS[g]).join(" · "),
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
    sexo          = "Feminino",
    objetivo      = "Mais disposição e saúde",
    nivel         = "Iniciante (nunca treinei)",
    diasTreino    = "3 dias",
    lesoes        = [],
    lesoesDetalhe,
  } = anamnese;

  const isFemale = sexo === "Feminino";
  const isBeginner = (nivel?.includes("Iniciante") || nivel?.includes("Básico")) ?? false;
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

  const injuries = resolveInjuries(lesoes, lesoesDetalhe);
  const base     = getBaseSetsRest(objetivo, nivel, cycleNumber);
  const advanced = getAdvancedTechnique(objetivo, nivel, cycleNumber);
  const isFinisherDay = advanced !== null && getFinisherDays(split).has(dayIdx);
  const defs = pickExercises(slot.groups, injuries, cycleNumber, slot.volumes, isFemale, isBeginner);

  // A técnica avançada (quando existe) aplica-se só ao último exercício do dia,
  // e só nos dias marcados como finalizador — nunca no treino inteiro.
  const exercises: Exercise[] = defs.map((ex, i) => {
    const isFinisherExercise = isFinisherDay && i === defs.length - 1;
    const presc = isFinisherExercise ? advanced! : base;
    return {
      id:     ex.id,
      name:   ex.name,
      muscle: ex.primaryMuscle,
      sets:   `${presc.sets}x${presc.reps}`,
      rest:   presc.rest,
      tip:    presc.tip,
      gif:    GIF_MAP[ex.id] ?? undefined,
      video:  VIDEO_MAP[ex.id] ?? undefined,
    };
  });
  const mainCount = exercises.length;

  // Abdômen (2-3x/semana, conforme o slot) — sempre antes do cardio
  const absExercises = slot.abs ? buildAbsExercises(injuries, isFemale, cycleNumber, dayIdx) : [];
  exercises.push(...absExercises);

  // Cardio — todo dia de treino, sempre por último
  exercises.push(buildCardioExercise(cycleNumber, dayIdx));

  const baseRestSeconds = parseInt(base.rest) || 60;
  const timePerMain      = base.sets * (1.5 + baseRestSeconds / 60);
  let duration = estimateDuration(mainCount, timePerMain, absExercises.length);
  if (isFinisherDay) {
    // O último exercício usa a prescrição avançada em vez da base — ajusta a diferença
    const advRestSeconds = parseInt(advanced!.rest) || 60;
    const timePerAdvanced = advanced!.sets * (1.5 + advRestSeconds / 60);
    duration += Math.round(timePerAdvanced - timePerMain);
  }

  return {
    name:        slot.name,
    emoji:       slot.emoji,
    muscleLabel: slot.groups.filter((g) => isGroupAllowed(g, isFemale, isBeginner)).map((g) => GROUP_LABELS[g]).join(" · "),
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
