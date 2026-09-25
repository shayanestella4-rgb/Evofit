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
  jointCaution?: string; // aviso extra quando o exercício está na mesma região de uma condição articular da aluna
  biSetNote?: string; // presente só no primeiro exercício do par — nome do parceiro pra fazer em bi-set
  beginnerCaution?: string; // aviso extra só pra quem está no nível Iniciante (ex: procurar apoio num unilateral liberado pra esse nível)
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
  avoidForBeginner?: boolean; // tecnicamente exigente — fora do pool pra Iniciante e Intermediário (só entra no Avançado)
  beginnerCaution?: string; // liberado pra Iniciante, mas mostra um aviso extra de segurança/execução só pra esse nível
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
    { id: "q6",  name: "Hack squat (máquina)",            primaryMuscle: "Quadríceps / Vasto lateral",  compound: true,  avoidFor: ["Joelho"] },
    { id: "q10", name: "Agachamento no Smith",            primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Quadril", "Coluna/lombar"], avoidForBeginner: true },
    { id: "q14", name: "Agachamento taça",                primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Quadril"] },
    { id: "q3",  name: "Agachamento búlgaro com haltere", primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo", "Condromalácia"], avoidForBeginner: true },
    { id: "q17", name: "Agachamento búlgaro no Smith",    primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo", "Condromalácia"], avoidForBeginner: true },
    { id: "q4",  name: "Afundo com halteres",             primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Condromalácia"] },
    { id: "q16", name: "Afundo no Smith",                 primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Condromalácia"] },
    { id: "q11", name: "Avanço com halteres",             primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Condromalácia"], avoidForBeginner: true },
    { id: "q19", name: "Avanço alternado com halteres",   primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo", "Condromalácia"], avoidForBeginner: true },
    { id: "q22", name: "Levantamento terra",              primaryMuscle: "Quadríceps / Posteriores / Lombar", compound: true, avoidFor: ["Coluna/lombar", "Joelho", "Quadril", "Osteoporose"], avoidForBeginner: true },
    { id: "q18", name: "Agachamento guiado na máquina",   primaryMuscle: "Quadríceps / Glúteos",        compound: true,  avoidFor: ["Joelho"] },
    { id: "q21", name: "Agachamento no hack horizontal", primaryMuscle: "Quadríceps",                    compound: true,  avoidFor: ["Joelho"] },
    { id: "q15", name: "Leg press 45° unilateral",        primaryMuscle: "Quadríceps (unilateral)",     compound: true,  avoidFor: [], avoidForBeginner: true },
    { id: "q5",  name: "Cadeira extensora",               primaryMuscle: "Quadríceps (isolamento)",     compound: false, avoidFor: ["Joelho"] },
    { id: "q12", name: "Cadeira extensora unilateral",    primaryMuscle: "Quadríceps (isolamento)",     compound: false, avoidFor: ["Joelho"], avoidForBeginner: true },
    { id: "q20", name: "Cadeira adutora",                 primaryMuscle: "Adutores",                    compound: false, avoidFor: ["Quadril"] },
  ],

  // ── GLÚTEOS (12 exercícios — ~4 ciclos) ──────────────────────────────────
  // Ordenados para intercalar padrões de movimento — sem repetir o mesmo padrão
  // dentro do mesmo ciclo de picks.

  gluteos: [
    { id: "g6",  name: "Elevação pélvica na máquina (hip thrust)", primaryMuscle: "Glúteo máximo",       compound: true,  avoidFor: [] },
    { id: "g7",  name: "Abdução sentada na máquina",      primaryMuscle: "Glúteo médio",                compound: true,  avoidFor: [] },
    { id: "g20", name: "Sumô belt squat",                 primaryMuscle: "Glúteos / Adutores",          compound: true,  avoidFor: ["Quadril"] },
    { id: "g8",  name: "Recuo com halteres",              primaryMuscle: "Glúteos / Isquiotibiais",     compound: true,  avoidFor: ["Quadril"], avoidForBeginner: true },
    { id: "g17", name: "Recuo alternado com halteres",    primaryMuscle: "Glúteos / Isquiotibiais",     compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo"], avoidForBeginner: true },
    { id: "g18", name: "Recuo no Smith",                  primaryMuscle: "Glúteos / Isquiotibiais",     compound: true,  avoidFor: ["Joelho", "Quadril", "Condromalácia"], avoidForBeginner: true },
    { id: "g3",  name: "Step-up com haltere",             primaryMuscle: "Glúteos / Quadríceps",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo"], beginnerCaution: "🧷 Exercício unilateral — procure um apoio (parede, banco, barra) por perto pra se equilibrar melhor." },
    { id: "g19", name: "Step-up no hack squat",           primaryMuscle: "Glúteos / Quadríceps",        compound: true,  avoidFor: ["Joelho", "Quadril", "Tornozelo"], avoidForBeginner: true },
    { id: "g15", name: "Levantamento sumô com halteres",  primaryMuscle: "Glúteos / Isquiotibiais",     compound: true,  avoidFor: ["Coluna/lombar", "Joelho", "Quadril"], avoidForBeginner: true },
    { id: "g14", name: "Bom dia no hack squat",           primaryMuscle: "Glúteos / Isquiotibiais / Lombar", compound: true, avoidFor: ["Coluna/lombar", "Quadril", "Osteoporose"], avoidForBeginner: true },
    { id: "g21", name: "Hiperextensão de glúteo no banco romano", primaryMuscle: "Glúteo máximo / Lombar", compound: true, avoidFor: ["Coluna/lombar", "Osteoporose"], avoidForBeginner: true },
    { id: "g11", name: "Glúteo no cabo (perna estendida)", primaryMuscle: "Glúteo máximo",              compound: false, avoidFor: [] },
    { id: "g4",  name: "Glúteo no cabo (perna cruzada)",  primaryMuscle: "Glúteo máximo",               compound: false, avoidFor: [] },
    { id: "g16", name: "Glúteo no cabo (perna flexionada)", primaryMuscle: "Glúteo máximo",             compound: false, avoidFor: [] },
    { id: "g5",  name: "Abdução no cabo (atrás)",         primaryMuscle: "Glúteo médio",                compound: false, avoidFor: [] },
    { id: "g13", name: "Abdução no cabo (frente)",        primaryMuscle: "Glúteo médio",                compound: false, avoidFor: [] },
  ],

  // ── POSTERIORES (10 exercícios) ───────────────────────────────────────────

  posteriores: [
    { id: "po1",  name: "Stiff com barra",                primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar", "Quadril", "Osteoporose"], avoidForBeginner: true },
    { id: "po3",  name: "Cadeira flexora",                primaryMuscle: "Isquiotibiais",               compound: true,  avoidFor: ["Joelho"] },
    { id: "po4",  name: "Mesa flexora",                   primaryMuscle: "Isquiotibiais",               compound: true,  avoidFor: ["Joelho"] },
    { id: "po9",  name: "Stiff com haltere",              primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar", "Quadril", "Osteoporose"], avoidForBeginner: true },
    { id: "po6",  name: "Stiff unilateral com halteres",  primaryMuscle: "Isquiotibiais (unilateral)",  compound: true,  avoidFor: ["Coluna/lombar", "Quadril", "Tornozelo", "Osteoporose"], avoidForBeginner: true },
    { id: "po12", name: "Levantamento terra sumô",        primaryMuscle: "Isquiotibiais / Glúteos",     compound: true,  avoidFor: ["Coluna/lombar", "Joelho", "Quadril"], avoidForBeginner: true },
    { id: "po8",  name: "Flexora em pé",                  primaryMuscle: "Isquiotibiais (isolamento)",  compound: false, avoidFor: ["Joelho"] },
  ],

  // ── PANTURRILHA ────────────────────────────────────────────────────────────

  panturrilha: [
    { id: "pa1", name: "Panturrilha em pé na máquina",        primaryMuscle: "Gastrocnêmio",            compound: false, avoidFor: [] },
    { id: "pa3", name: "Panturrilha no leg press 45°",        primaryMuscle: "Gastrocnêmio",            compound: false, avoidFor: [] },
    { id: "pa5", name: "Panturrilha no hack horizontal",      primaryMuscle: "Gastrocnêmio",            compound: false, avoidFor: [] },
    { id: "pa2", name: "Panturrilha sentado (sóleo)",         primaryMuscle: "Sóleo",                   compound: false, avoidFor: [] },
  ],

  // ── PEITO (16 exercícios) ────────────────────────────────────────────────

  peito: [
    { id: "p28", name: "Supino reto na máquina",           primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro"] },
    { id: "p33", name: "Supino reto com barra",            primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "p29", name: "Supino com halteres",              primaryMuscle: "Peitoral",                    compound: true,  avoidFor: ["Ombro"] },
    { id: "p27", name: "Supino inclinado com halteres",    primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p30", name: "Supino inclinado com barra",       primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "p26", name: "Supino inclinado na máquina",      primaryMuscle: "Peitoral superior",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p34", name: "Supino vertical (shoulder press)", primaryMuscle: "Peitoral / Ombros",           compound: true,  avoidFor: ["Ombro"] },
    { id: "p20", name: "Crucifixo deitado com cabo",       primaryMuscle: "Peitoral (abertura)",         compound: false, avoidFor: ["Ombro"] },
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
    { id: "c25", name: "Puxada aberta no graviton",           primaryMuscle: "Dorsal / Teres maior",       compound: true,  avoidFor: ["Ombro"] },
    { id: "c19", name: "Pulley frente articulado pegada supinada", primaryMuscle: "Dorsal / Bíceps",       compound: true,  avoidFor: ["Ombro"] },
    { id: "c21", name: "Pulley frente articulado pegada neutra", primaryMuscle: "Dorsal",                  compound: true,  avoidFor: ["Ombro"] },
    { id: "c20", name: "Pulley frente articulado unilateral", primaryMuscle: "Dorsal (unilateral)",        compound: true,  avoidFor: ["Ombro"], avoidForBeginner: true },
    { id: "c23", name: "Pulley frente triângulo",             primaryMuscle: "Dorsal inferior",            compound: false, avoidFor: ["Ombro"] },
    { id: "c24", name: "Pulley frente unilateral",            primaryMuscle: "Dorsal (unilateral)",        compound: false, avoidFor: ["Ombro"], avoidForBeginner: true },
    { id: "c32", name: "Remada curvada com barra livre",      primaryMuscle: "Dorsal / Trapézio médio",    compound: true,  avoidFor: ["Coluna/lombar", "Punho/Cotovelo", "Osteoporose"] },
    { id: "c33", name: "Remada curvada na máquina",           primaryMuscle: "Dorsal / Trapézio",          compound: true,  avoidFor: [] },
    { id: "c31", name: "Remada cavalinho na máquina",         primaryMuscle: "Dorsal / Rombóides",         compound: true,  avoidFor: [] },
    { id: "c37", name: "Remada cavalinho livre",              primaryMuscle: "Dorsal / Rombóides",         compound: true,  avoidFor: ["Coluna/lombar"] },
    { id: "c26", name: "Remada articulada pegada pronada",    primaryMuscle: "Dorsal / Trapézio",          compound: true,  avoidFor: [] },
    { id: "c34", name: "Remada articulada pegada neutra",     primaryMuscle: "Dorsal / Trapézio",          compound: true,  avoidFor: [] },
    { id: "c36", name: "Remada articulada pegada supinada",   primaryMuscle: "Dorsal / Bíceps",            compound: true,  avoidFor: [] },
    { id: "c27", name: "Remada articulada unilateral pegada pronada", primaryMuscle: "Dorsal (unilateral)", compound: true, avoidFor: [], avoidForBeginner: true },
    { id: "c28", name: "Remada baixa com barra",              primaryMuscle: "Dorsal / Rombóides",         compound: true,  avoidFor: [] },
    { id: "c30", name: "Remada baixa unilateral",             primaryMuscle: "Dorsal (unilateral)",        compound: true,  avoidFor: [], avoidForBeginner: true },
    { id: "c17", name: "Face pull",                           primaryMuscle: "Trapézio / Deltóide posterior", compound: false, avoidFor: [] },
  ],

  // ── OMBROS (16 exercícios) ───────────────────────────────────────────────

  ombros: [
    { id: "o20", name: "Desenvolvimento com halteres sentado", primaryMuscle: "Deltóide anterior / lateral", compound: true, avoidFor: ["Ombro"] },
    { id: "o26", name: "Desenvolvimento com halteres pegada neutra", primaryMuscle: "Deltóide anterior / lateral", compound: true, avoidFor: ["Ombro"] },
    { id: "o19", name: "Desenvolvimento na máquina",          primaryMuscle: "Deltóide anterior / lateral", compound: true,  avoidFor: ["Ombro"] },
    { id: "o18", name: "Desenvolvimento militar com barra",   primaryMuscle: "Deltóide anterior",          compound: true,  avoidFor: ["Ombro"] },
    { id: "o23", name: "Elevação lateral com halteres",       primaryMuscle: "Deltóide lateral",           compound: false, avoidFor: ["Ombro"] },
    { id: "o29", name: "Elevação lateral na máquina",         primaryMuscle: "Deltóide lateral",           compound: false, avoidFor: ["Ombro"] },
    { id: "o30", name: "Elevação lateral no cabo",            primaryMuscle: "Deltóide lateral",           compound: false, avoidFor: ["Ombro"] },
    { id: "o21", name: "Elevação frontal no cabo",             primaryMuscle: "Deltóide anterior",          compound: false, avoidFor: ["Ombro"] },
    { id: "o22", name: "Elevação frontal unilateral no cabo", primaryMuscle: "Deltóide anterior",          compound: false, avoidFor: ["Ombro"], avoidForBeginner: true },
    { id: "o27", name: "Elevação frontal pegada neutra",      primaryMuscle: "Deltóide anterior",          compound: false, avoidFor: ["Ombro"] },
    { id: "o28", name: "Elevação frontal pegada pronada",     primaryMuscle: "Deltóide anterior",          compound: false, avoidFor: ["Ombro"] },
    { id: "o31", name: "Remada alta no cabo",                 primaryMuscle: "Deltóide lateral / Trapézio", compound: true,  avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "o24", name: "Posterior de ombro sentado com halteres", primaryMuscle: "Deltóide posterior",     compound: false, avoidFor: [] },
    { id: "o25", name: "Posterior de ombro em pé com halteres",  primaryMuscle: "Deltóide posterior",      compound: false, avoidFor: [] },
    { id: "o16", name: "Crucifixo invertido na máquina",       primaryMuscle: "Deltóide posterior",         compound: false, avoidFor: [] },
    { id: "o17", name: "Crucifixo invertido no cabo",          primaryMuscle: "Deltóide posterior",         compound: false, avoidFor: [] },
  ],

  // ── BÍCEPS (21 exercícios) ────────────────────────────────────────────────

  biceps: [
    { id: "b28", name: "Rosca direta com barra W",             primaryMuscle: "Bíceps (cabeça curta)",      compound: false, avoidFor: [] },
    { id: "b26", name: "Rosca direta alternada",                primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b19", name: "Rosca direta com halteres",             primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b27", name: "Rosca direta alternada 45°",            primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b18", name: "Rosca alternada sentado",               primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b33", name: "Rosca no cabo",                          primaryMuscle: "Bíceps",                     compound: false, avoidFor: [] },
    { id: "b36", name: "Rosca no cabo com corda",                primaryMuscle: "Bíceps / Braquial",         compound: false, avoidFor: [] },
    { id: "b37", name: "Rosca inversa no cabo",                  primaryMuscle: "Bíceps / Antebraço",        compound: false, avoidFor: [] },
    { id: "b16", name: "Rosca Scott com barra W",                primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "b34", name: "Rosca Scott alternada com halteres",     primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "b35", name: "Rosca Scott com halteres",                primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "b15", name: "Rosca banco inclinado",                  primaryMuscle: "Bíceps (alongado)",         compound: false, avoidFor: [] },
    { id: "b24", name: "Rosca concentrada",                      primaryMuscle: "Bíceps (pico)",             compound: false, avoidFor: [] },
    { id: "b32", name: "Rosca martelo com halteres",             primaryMuscle: "Bíceps / Braquial",         compound: false, avoidFor: [] },
    { id: "b31", name: "Rosca martelo sentada",                  primaryMuscle: "Bíceps / Braquial",         compound: false, avoidFor: [] },
  ],

  // ── TRÍCEPS (13 exercícios) ──────────────────────────────────────────────

  triceps: [
    { id: "t1",  name: "Tríceps pulley no cabo",          primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t6",  name: "Tríceps pulley com corda",        primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t14", name: "Tríceps pulley pegada supinada",  primaryMuscle: "Tríceps (porção lateral)",    compound: false, avoidFor: [] },
    { id: "t9",  name: "Tríceps pulley invertido",        primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
    { id: "t13", name: "Tríceps no cabo alto",            primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
    { id: "t15", name: "Tríceps coice no cabo",           primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: [] },
    { id: "t17", name: "Tríceps na máquina",              primaryMuscle: "Tríceps",                     compound: false, avoidFor: [] },
    { id: "t2",  name: "Tríceps testa com barra W",       primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t8",  name: "Tríceps testa unilateral",        primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t18", name: "Tríceps testa no cabo",           primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Punho/Cotovelo"] },
    { id: "t5",  name: "Tríceps francês com haltere",     primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t16", name: "Tríceps francês no cabo",         primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Ombro", "Punho/Cotovelo"] },
    { id: "t7",  name: "Tríceps francês unilateral cabo", primaryMuscle: "Tríceps (porção longa)",      compound: false, avoidFor: ["Punho/Cotovelo"] },
  ],

  // ── ABDÔMEN (14 exercícios — usados como finalizador fixo 4x15, não entram
  //    na periodização — ver pickAbsExercises / buildAbsExercises) ───────────

  core: [
    { id: "ab14", name: "Prancha isométrica",             primaryMuscle: "Core completo / Estabilização", compound: false, avoidFor: [] },
    { id: "ab3",  name: "Abdominal crunch",               primaryMuscle: "Reto abdominal",                 compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab15", name: "Abdominal curto",                primaryMuscle: "Reto abdominal",                 compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab7",  name: "Crunch na máquina",               primaryMuscle: "Reto abdominal",                 compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab10", name: "Supra no banco declinado",        primaryMuscle: "Reto abdominal (superior)",      compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab13", name: "Crunch oblíquo (perna cruzada)",  primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab11", name: "Toque no calcanhar alternado",    primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab16", name: "Toque no pé (oblíquo)",           primaryMuscle: "Oblíquos",                       compound: false, avoidFor: ["Osteoporose"] },
    { id: "ab6",  name: "Abdominal infra",                 primaryMuscle: "Abdômen inferior",               compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
    { id: "ab2",  name: "Abdominal bicicleta",              primaryMuscle: "Oblíquos / Reto abdominal",      compound: false, avoidFor: ["Coluna/lombar", "Osteoporose"] },
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
    { id: "an12", name: "Flexão de punho com barra",              primaryMuscle: "Antebraço (flexores)",  compound: false, avoidFor: [] },
    { id: "an3",  name: "Flexão de punho com halteres",            primaryMuscle: "Antebraço (flexores)",  compound: false, avoidFor: [] },
    { id: "an1",  name: "Flexão de punho unilateral",              primaryMuscle: "Antebraço",             compound: false, avoidFor: [] },
    { id: "an9",  name: "Extensão de punho com barra",             primaryMuscle: "Antebraço (extensores)", compound: false, avoidFor: [] },
    { id: "an13", name: "Extensão de punho com halteres",          primaryMuscle: "Antebraço (extensores)", compound: false, avoidFor: [] },
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
    // Qui: posteriores — com 1 exercício extra de glúteo como estímulo, sem tirar o foco de posterior
    3: {
      name: "Posteriores",
      emoji: "🍑",
      groups: ["posteriores", "gluteos"],
      volumes: { posteriores: 5, gluteos: 1 },
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
      groups: ["costas", "biceps", "ombros", "triceps", "peito"],
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
    // Qui: posteriores — com 1 exercício extra de glúteo como estímulo, sem tirar o foco de posterior
    3: {
      name: "Posteriores",
      emoji: "🔥",
      groups: ["posteriores", "gluteos"],
      volumes: { posteriores: 5, gluteos: 1 },
      abs: true,
    },
    // Sex: superior — peito com só 1 exercício, mais costas
    4: {
      name: "Superior",
      emoji: "💪",
      groups: ["costas", "biceps", "ombros", "triceps", "peito"],
      volumes: { costas: 3, peito: 1, ombros: 2, biceps: 1, triceps: 1 },
      abs: true,
    },
  },

  // Alterna inferior/superior/inferior/superior/inferior ao longo da semana —
  // nunca 2 dias de inferior seguidos, mesmo com mais dias de inferior no total.
  "5+ dias": {
    // Seg: quadríceps — volume extra pra reforçar o viés de inferiores
    0: {
      name: "Quadríceps",
      emoji: "🦵",
      groups: ["quadriceps", "panturrilha"],
      volumes: { quadriceps: 5, panturrilha: 1 },
      abs: true,
    },
    // Ter: costas + bíceps
    1: {
      name: "Costas + Bíceps",
      emoji: "🏋️",
      groups: ["costas", "biceps"],
      volumes: { costas: 4, biceps: 2 },
    },
    // Qua: glúteos
    2: {
      name: "Glúteos",
      emoji: "🍑",
      groups: ["gluteos"],
      volumes: { gluteos: 6 },
    },
    // Qui: ombros + tríceps + peito, nessa ordem — ombro é prioridade (feito
    // com o corpo mais descansado), peito por último. Peito com só 1 exercício.
    3: {
      name: "Ombros + Tríceps + Peito",
      emoji: "💥",
      groups: ["ombros", "triceps", "peito"],
      volumes: { peito: 1, ombros: 3, triceps: 3 },
      abs: true,
    },
    // Sex: posteriores — com 1 exercício extra de glúteo como estímulo, sem tirar o foco de posterior
    4: {
      name: "Posteriores",
      emoji: "🔥",
      groups: ["posteriores", "gluteos"],
      volumes: { posteriores: 5, gluteos: 1 },
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
      groups: ["costas", "trapezio", "biceps", "ombros", "peito", "triceps", "antebraco", "panturrilha"],
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
      groups: ["costas", "trapezio", "biceps", "antebraco", "panturrilha"],
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
      groups: ["costas", "trapezio", "biceps", "antebraco", "panturrilha"],
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
      groups: ["costas", "trapezio", "biceps", "antebraco"],
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
      groups: ["biceps", "triceps", "panturrilha"],
      volumes: { biceps: 4, triceps: 4, panturrilha: 1 },
    },
  },
};

// ── FULL BODY (só nível Iniciante) ────────────────────────────────────────────
// Iniciante/sedentário não deve ser parcelado por grupo (ABC) — a literatura
// (supercompensação + baixo volume tolerado) indica corpo inteiro em toda
// sessão, variando o exercício de cada grupo a cada dia/mês (ver getWorkoutForDay,
// que usa um ciclo virtual por dia da semana pra garantir essa variação).
// Só os grandes padrões de movimento (agachamento/quadril já recruta posterior
// e panturrilha sinergicamente) — um full body de verdade não é 1 exercício
// isolado por cada um dos 9 grupos da biblioteca, isso vira sessão de 90min.
//
// Mesmo treinando tudo todo dia, mantém a mesma preferência de ênfase por sexo
// (mulher: inferior — glúteo/quadríceps/posterior; homem: superior — peito/
// costas/ombros) alternando qual dessas regiões ganha um exercício extra a
// cada dia de treino da semana — todo mundo treina tudo, só a "estrela do dia"
// muda.
const FULL_BODY_DAY_INDEXES: Record<string, number[]> = {
  "2 dias":  [0, 3],
  "3 dias":  [0, 2, 4],
  "4 dias":  [0, 1, 3, 4],
  "5+ dias": [0, 1, 2, 3, 4],
};

// Ordem pensada pra ficar inferior (quad/glúteo) → costas+bíceps (puxar) →
// peito+ombros+tríceps (empurrar) — mesmo padrão usado nos splits normais.
const FULL_BODY_BASE_VOLUMES: Partial<Record<MuscleGroup, number>> = {
  quadriceps: 1, gluteos: 1, costas: 1, biceps: 1, peito: 1, ombros: 1, triceps: 1,
};

const FEMALE_FULL_BODY_EMPHASIS: MuscleGroup[] = ["gluteos", "quadriceps", "posteriores"];
const MALE_FULL_BODY_EMPHASIS: MuscleGroup[] = ["peito", "costas", "ombros"];

function buildFullBodyDay(position: number, isFemale: boolean): SplitSlot {
  const emphasisList = isFemale ? FEMALE_FULL_BODY_EMPHASIS : MALE_FULL_BODY_EMPHASIS;
  const emphasis = emphasisList[position % emphasisList.length];
  const volumes = { ...FULL_BODY_BASE_VOLUMES, [emphasis]: (FULL_BODY_BASE_VOLUMES[emphasis] ?? 0) + 1 };
  const baseGroups = Object.keys(FULL_BODY_BASE_VOLUMES) as MuscleGroup[];
  // "posteriores" não é grupo base do full body — quando é a ênfase do dia,
  // entra logo depois de glúteos (mesma vizinhança "inferior" dos outros splits).
  const groups = baseGroups.includes(emphasis)
    ? baseGroups
    : (() => {
        const idx = baseGroups.indexOf("gluteos");
        return [...baseGroups.slice(0, idx + 1), emphasis, ...baseGroups.slice(idx + 1)];
      })();
  return {
    name: `Corpo Inteiro (ênfase: ${GROUP_LABELS[emphasis]})`,
    emoji: "💪",
    groups,
    volumes,
    abs: true,
  };
}

/** Monta a tabela de dias Full Body pra um diasTreino específico, já com a ênfase de cada dia. */
function buildFullBodySplits(diasTreino: string, isFemale: boolean): Record<string, Record<number, SplitSlot>> {
  const key = FULL_BODY_DAY_INDEXES[diasTreino] ? diasTreino : "3 dias";
  const dayIndexes = FULL_BODY_DAY_INDEXES[key];
  const dayMap: Record<number, SplitSlot> = {};
  dayIndexes.forEach((dayIdx, position) => {
    dayMap[dayIdx] = buildFullBodyDay(position, isFemale);
  });
  return { [key]: dayMap };
}

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
 * Trapézio: só para homens em nível Avançado — Iniciante, Intermediário
 * e full body (que só existe pra Iniciante) não entram.
 * Antebraço: só para homens, nunca no full body.
 * Glúteos: só para mulheres na programação automática — quando o aluno
 * escolhe manualmente um slot com glúteos (isManualOverride), a escolha dele
 * prevalece.
 */
function isGroupAllowed(g: MuscleGroup, isFemale: boolean, isBeginner: boolean, isFullBody: boolean = false, isManualOverride: boolean = false): boolean {
  if (g === "trapezio") return !isFemale && !isBeginner && !isFullBody;
  if (g === "antebraco") return !isFemale && !isFullBody;
  if (g === "gluteos" && !isManualOverride) return isFemale;
  return true;
}

/**
 * Tier de experiência (1=Iniciante, 2=Intermediário, 3=Avançado) a partir do
 * texto de "nivel". Usa o texto entre parênteses (não o rótulo principal)
 * pra reconhecer os dois rótulos que o tier 2 já teve ("treino às vezes" e,
 * mais recente, "já tenho uma certa experiência com os exercícios") e o
 * rótulo antigo do tier 1/3 ("Básico"/"Iniciante", "treino regularmente") —
 * então continua classificando corretamente quem já tinha o nível salvo com
 * um rótulo anterior, sem precisar migrar dados.
 */
function getNivelTier(nivel?: string): 1 | 2 | 3 {
  if (nivel?.includes("treino regularmente")) return 3;
  if (nivel?.includes("treino às vezes") || nivel?.includes("já tenho uma certa experiência")) return 2;
  return 1;
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
  "Cardiovascular": ["hipertensao", "pressao alta", "cardiaco", "cardiopata", "coracao", "arritmia"],
  "Diabetes": ["diabetes", "diabetico", "diabetica", "glicemia"],
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

// ─── Aviso de amplitude/intensidade por região articular ─────────────────────
// Condições de sobrecarga óssea (osteoporose) pedem o oposto ("mantenha a
// carga, evite é flexão/torção") — não entram nesse aviso de amplitude.
const JOINT_CAUTION_TEXT = "Neste exercício diminua a amplitude e intensidade, vá até o seu limite.";
const JOINT_CAUTION_EXCLUDED_TAGS = ["Osteoporose", "Cardiovascular", "Diabetes", "Nenhuma", "Outra"];

/** Grupos musculares onde essa tag tem pelo menos um exercício restrito — ou seja, a região que a condição afeta. */
function affectedGroupsForTag(tag: string): Set<MuscleGroup> {
  const groups = new Set<MuscleGroup>();
  for (const group of Object.keys(LIBRARY) as MuscleGroup[]) {
    if (LIBRARY[group].some((ex) => ex.avoidFor.includes(tag))) groups.add(group);
  }
  return groups;
}

/** Une as regiões afetadas por todas as condições relevantes da aluna (exceto osteoporose/nenhuma/outra). */
function getCautionGroups(injuries: string[]): Set<MuscleGroup> {
  const relevant = injuries.filter((i) => !JOINT_CAUTION_EXCLUDED_TAGS.includes(i));
  const groups = new Set<MuscleGroup>();
  for (const tag of relevant) {
    for (const g of affectedGroupsForTag(tag)) groups.add(g);
  }
  return groups;
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
 * Fase 1 — Hipertrofia base  (ciclos 1, 4, 7 … para iniciante/intermediário | 1, 5, 9 … para avançado)
 * Fase 2 — Força
 * Fase 3 — Volume alto
 *
 * Para avançado, o ciclo tem uma 4ª posição (ver getAdvancedTechnique) que
 * não substitui o treino inteiro — só adiciona um finalizador em 1-2 dias da
 * semana (ver isFinisherDay). Nessa posição, os exercícios normais usam a
 * mesma prescrição da fase 3 (volume alto).
 */
function getBaseSetsRest(
  goal: string,
  nivel: string,
  cycleNumber: number = 1,
): SetsRest {
  const isInter    = getNivelTier(nivel) === 3;
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
 * Retorna null se o aluno não é avançado, ou se o ciclo atual não está na
 * "rodada" de fase 4 — nesses casos o dia inteiro usa só getBaseSetsRest.
 *
 * Quando não-nulo, aplica-se a UM ÚNICO exercício (o último/finalizador do
 * treino), e só em 1-2 dias de treino da semana (ver isFinisherDay) — nunca no
 * treino inteiro.
 */
function getAdvancedTechnique(goal: string, nivel: string, cycleNumber: number, injuries: string[] = []): SetsRest | null {
  const isInter = getNivelTier(nivel) === 3;
  if (!isInter) return null;
  // Dropset/bi-set/rest-pause elevam bastante o duplo produto (FC × pressão) —
  // contraindicados pra quem tem hipertensão/problema cardiovascular, e também
  // pra diabetes (risco de sangramento retiniano com esforço máximo/Valsalva
  // em quem tem retinopatia — como o quiz não distingue o grau, aplica pra todos).
  if (injuries.includes("Cardiovascular") || injuries.includes("Diabetes")) return null;

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

// Classificação explícita de equipamento (por id) pra formar bi-sets com confiança —
// o nome do exercício sozinho é pouco confiável ("Pulldown" não bate com "pulley",
// "Rosca direta alternada" não menciona "halteres" mesmo sendo com halteres).
const BISET_MACHINE_IDS = new Set([
  "q2", "q6", "q10", "q5", "q12", "q15", "q18", "q21", "q20", "q16", "q17",
  "g6", "g7", "g11", "g4", "g16", "g5", "g13", "g20", "g18", "g14", "g19",
  "po3", "po4", "po8",
  "pa1", "pa3", "pa5", "pa2",
  "p28", "p26", "p20", "p21", "p24", "p25", "p17", "p18", "p19",
  "c18", "c25", "c19", "c21", "c20", "c23", "c24", "c33", "c31", "c26", "c34", "c36", "c27", "c28", "c30", "c17",
  "o19", "o21", "o22", "o16", "o17", "o29", "o30", "o31",
  "b33", "b36", "b37",
  "t1", "t6", "t9", "t13", "t7", "t14", "t15", "t16", "t17", "t18",
  "tr1", "tr4",
  "ab7",
]);

const BISET_DUMBBELL_IDS = new Set([
  "q4", "q11", "q14", "q19",
  "g8", "g3", "g17", "g15",
  "po9", "po6",
  "p29", "p27", "p23",
  "o20", "o26", "o24", "o25", "o23",
  "b19", "b18", "b34", "b35", "b15", "b32", "b31", "b26", "b24", "b27",
  "t5", "t8",
  "tr2",
  "an13", "an3",
]);

// Bi-set só pode juntar exercícios da MESMA região do corpo — numa academia
// cheia os aparelhos de perna ficam num canto e os de superior/livre noutro,
// então um par perna+superior obrigaria a aluna a atravessar a academia entre
// uma série e outra, inviabilizando o "sem pausa entre a dupla" do bi-set.
const LOWER_BODY_GROUPS = new Set<MuscleGroup>(["quadriceps", "gluteos", "posteriores", "panturrilha"]);
function isLowerBody(g: MuscleGroup): boolean {
  return LOWER_BODY_GROUPS.has(g);
}

/**
 * Bi-set pra treinos de 40min: pareia 1 exercício de aparelho fixo (máquina/cabo)
 * com 1 exercício de halteres — nunca dois aparelhos, porque numa academia cheia
 * a aluna não consegue ocupar duas máquinas ao mesmo tempo. Prioriza um parceiro
 * de outro grupo muscular do dia (ex: bíceps num dia de costas) quando existir,
 * já que esse exercício entraria no treino de qualquer forma — só reordena pra
 * virar bi-set em vez de bloco sequencial. Nunca pareia entre pernas e superior
 * (ver isLowerBody) — sem parceiro coerente na mesma região, o exercício fica
 * fora do bi-set, no formato normal. Reordena a lista pra cada par ficar lado a
 * lado.
 */
function applyBiSets(
  defs: (ExerciseDef & { group: MuscleGroup })[]
): { ordered: (ExerciseDef & { group: MuscleGroup })[]; partnerNameOf: Map<string, string> } {
  const machines  = defs.filter((d) => BISET_MACHINE_IDS.has(d.id));
  const dumbbells = defs.filter((d) => BISET_DUMBBELL_IDS.has(d.id));
  const paired = new Set<string>();
  const partnerNameOf = new Map<string, string>();
  const pairs: [ExerciseDef & { group: MuscleGroup }, ExerciseDef & { group: MuscleGroup }][] = [];

  for (const m of machines) {
    if (paired.has(m.id)) continue;
    const sameRegion = (d: ExerciseDef & { group: MuscleGroup }) => isLowerBody(d.group) === isLowerBody(m.group);
    const partner =
      dumbbells.find((d) => !paired.has(d.id) && d.group !== m.group && sameRegion(d)) ??
      dumbbells.find((d) => !paired.has(d.id) && sameRegion(d));
    if (!partner) continue;
    paired.add(m.id);
    paired.add(partner.id);
    partnerNameOf.set(m.id, partner.name);
    pairs.push([m, partner]);
  }

  const ordered = pairs.flatMap(([a, b]) => [a, b]);
  ordered.push(...defs.filter((d) => !paired.has(d.id)));
  return { ordered, partnerNameOf };
}

// Pra mulher, alguns grupos ficam restritos a um pool bem menor (menos ênfase/
// variedade que no treino masculino) — ex: bíceps só rosca direta (polia ou
// halter) e rosca martelo, sem Scott nem banco inclinado.
const FEMALE_RESTRICTED_POOLS: Partial<Record<MuscleGroup, string[]>> = {
  biceps: ["b33", "b19", "b32", "b31"],
};

/**
 * Com volume baixo (40min), a rotação normal às vezes seleciona só exercícios
 * de máquina/cabo OU só de halter no dia inteiro — sem os dois tipos, o
 * applyBiSets não tem como formar par nenhum. Garante que o dia tenha pelo
 * menos 1 de cada, trocando um exercício (do tipo em falta) por outro do
 * mesmo grupo — sem isso, um dia de grupo único (ex: Glúteos, Posteriores)
 * podia ficar sem nenhum bi-set formado, mesmo em 40min.
 */
function ensureBiSetMix(
  defs: (ExerciseDef & { group: MuscleGroup })[],
  injuries: string[],
  isFemale: boolean,
  isBeginner: boolean,
  cycleNumber: number
): (ExerciseDef & { group: MuscleGroup })[] {
  if (defs.length < 2) return defs;
  const hasMachine  = defs.some((d) => BISET_MACHINE_IDS.has(d.id));
  const hasDumbbell = defs.some((d) => BISET_DUMBBELL_IDS.has(d.id));
  if (hasMachine && hasDumbbell) return defs; // já tem os dois

  const findCandidate = (group: MuscleGroup, targetSet: Set<string>, excludeIds: Set<string>) => {
    const pool = LIBRARY[group].filter((ex) =>
      targetSet.has(ex.id) &&
      !excludeIds.has(ex.id) &&
      !ex.avoidFor.some((a) => injuries.includes(a)) &&
      !(isBeginner && ex.avoidForBeginner) &&
      (!isFemale || !FEMALE_RESTRICTED_POOLS[group] || FEMALE_RESTRICTED_POOLS[group]!.includes(ex.id))
    );
    return pool.length > 0 ? pool[(cycleNumber - 1) % pool.length] : null;
  };

  if (hasMachine !== hasDumbbell) {
    // já tem um dos dois — só precisa trocar 1 exercício pelo tipo que falta,
    // sem sacrificar o único exercício que já representa o tipo que temos.
    const haveSet = hasMachine ? BISET_MACHINE_IDS : BISET_DUMBBELL_IDS;
    const needSet = hasMachine ? BISET_DUMBBELL_IDS : BISET_MACHINE_IDS;
    const idsInDefs = new Set(defs.map((d) => d.id));

    for (let i = 0; i < defs.length; i++) {
      if (haveSet.has(defs[i].id)) continue; // preserva o representante do tipo que já temos
      const c = findCandidate(defs[i].group, needSet, idsInDefs);
      if (c) { const next = [...defs]; next[i] = { ...c, group: defs[i].group }; return next; }
    }
    // não achou um "neutro" pra trocar — só mexe no tipo que já temos se houver mais de 1 (não zera o tipo existente)
    if (defs.filter((d) => haveSet.has(d.id)).length >= 2) {
      for (let i = 0; i < defs.length; i++) {
        if (!haveSet.has(defs[i].id)) continue;
        const c = findCandidate(defs[i].group, needSet, idsInDefs);
        if (c) { const next = [...defs]; next[i] = { ...c, group: defs[i].group }; return next; }
      }
    }
    return defs; // nenhum candidato seguro (ex: só existe versão avançada pra iniciante) — dia fica sem bi-set
  }

  // Nenhum dos dois tipos presente (ex: só exercícios de barra livre) — tenta
  // converter 2 exercícios distintos, 1 pra máquina e 1 pra halter.
  const next = [...defs];
  const idsInDefs = new Set(defs.map((d) => d.id));
  let machineIdx = -1;
  for (let i = 0; i < next.length; i++) {
    const c = findCandidate(next[i].group, BISET_MACHINE_IDS, idsInDefs);
    if (c) {
      idsInDefs.delete(next[i].id);
      idsInDefs.add(c.id);
      next[i] = { ...c, group: next[i].group };
      machineIdx = i;
      break;
    }
  }
  if (machineIdx === -1) return defs;
  for (let i = 0; i < next.length; i++) {
    if (i === machineIdx) continue;
    const c = findCandidate(next[i].group, BISET_DUMBBELL_IDS, idsInDefs);
    if (c) { next[i] = { ...c, group: next[i].group }; return next; }
  }
  return defs; // só conseguiu converter 1 dos 2 tipos — troca parcial não ajuda, mantém original
}

// Exercícios que são essencialmente o MESMO movimento, no MESMO aparelho —
// só muda pegada, ângulo do cabo, ou unilateral/bilateral (ex: pulley pegada
// supinada vs neutra, leg press vs leg press unilateral, glúteo no cabo perna
// cruzada vs estendida). Diferença de equipamento (barra vs halter vs Smith)
// NÃO entra aqui — isso muda o estímulo de verdade (estabilização, ADM) e já
// é tratado como exercícios distintos no resto do sistema. Usado só pra evitar
// 2 variações quase-idênticas no mesmo treino — nunca restringe seleção.
const FAMILY_MAP: Record<string, string> = {
  // Quadríceps
  q2: "q_legpress", q15: "q_legpress",
  q5: "q_legext", q12: "q_legext",
  // Glúteos
  g4: "g_kickback", g11: "g_kickback", g16: "g_kickback",
  g5: "g_abducao_cabo", g13: "g_abducao_cabo",
  // Posteriores
  po9: "po_stiff_halter", po6: "po_stiff_halter",
  // Costas
  c19: "c_pulley_artic", c21: "c_pulley_artic", c20: "c_pulley_artic",
  c26: "c_remada_artic", c34: "c_remada_artic", c36: "c_remada_artic", c27: "c_remada_artic",
  c18: "c_pulldown_pegada", c23: "c_pulldown_pegada", c24: "c_pulldown_pegada",
  // Ombros
  o20: "o_dev_halter", o26: "o_dev_halter",
  o21: "o_frontal_cabo", o22: "o_frontal_cabo",
  o27: "o_frontal_livre", o28: "o_frontal_livre",
  // Bíceps
  b26: "b_direta_halter", b19: "b_direta_halter",
  b27: "b_inclinado45", b15: "b_inclinado45",
  b33: "b_cabo_reto", b36: "b_cabo_reto",
  b34: "b_scott_halter", b35: "b_scott_halter",
  // Tríceps
  t1: "t_pulley_pegada", t6: "t_pulley_pegada", t14: "t_pulley_pegada",
  t16: "t_frances_cabo", t7: "t_frances_cabo",
  // Antebraço
  an1: "an_flexao_halter", an3: "an_flexao_halter",
};

/**
 * Garante que, dentro de UM MESMO grupo no dia, não saiam 2 exercícios da
 * mesma família (ex: pulley pegada supinada + pulley pegada neutra) — troca
 * a segunda ocorrência por outro exercício do pool que não repita a família.
 * Se não achar substituto sem família repetida, mantém a escolha original
 * (melhor repetir do que sobrar menos exercícios do que o volume pedia).
 */
function dedupeFamilies(picks: ExerciseDef[], pool: ExerciseDef[]): ExerciseDef[] {
  const usedFamilies = new Set<string>();
  const usedIds = new Set(picks.map((p) => p.id));
  const result: ExerciseDef[] = [];
  for (const ex of picks) {
    const fam = FAMILY_MAP[ex.id];
    if (fam && usedFamilies.has(fam)) {
      const alt = pool.find((p) => !usedIds.has(p.id) && !(FAMILY_MAP[p.id] && usedFamilies.has(FAMILY_MAP[p.id])));
      if (alt) {
        usedIds.delete(ex.id);
        usedIds.add(alt.id);
        if (FAMILY_MAP[alt.id]) usedFamilies.add(FAMILY_MAP[alt.id]);
        result.push(alt);
        continue;
      }
    }
    if (fam) usedFamilies.add(fam);
    result.push(ex);
  }
  return result;
}

// Porção/ângulo de cada exercício — usado pra intercalar a seleção e garantir
// que, quando o volume permitir mais de 1 exercício, cubram ângulos diferentes
// em vez de repetir sempre a mesma porção (ex: ombro posterior + lateral, não
// só desenvolvimento repetido). Sem entrada = cai no bucket "medio".
const PORTION_MAP: Partial<Record<MuscleGroup, Record<string, string>>> = {
  ombros: {
    o18: "frontal", o19: "frontal", o20: "frontal", o21: "frontal", o22: "frontal", o26: "frontal", o27: "frontal", o28: "frontal",
    o23: "lateral", o29: "lateral", o30: "lateral", o31: "lateral",
    o24: "posterior", o25: "posterior", o16: "posterior", o17: "posterior",
  },
  biceps: {
    b16: "curto", b34: "curto", b35: "curto",
    b15: "longo",
  },
  triceps: {
    t5: "frances", t7: "frances", t16: "frances",
    t2: "testa", t8: "testa", t18: "testa",
    t1: "pulley", t6: "pulley", t9: "pulley", t13: "pulley", t14: "pulley", t15: "pulley", t17: "pulley",
  },
};

/**
 * Escolhe `cap` exercícios cobrindo porções/ângulos diferentes (ex: ombro
 * frontal, lateral, posterior) em vez de deixar a rotação simples repetir a
 * mesma porção. Cicla por qual porção "começa" a cada mês, então: com cap ≥
 * número de porções, cobre todas nesse dia; com cap menor (pouco tempo/
 * volume), garante que ao menos 1-2 porções apareçam, alternando qual delas
 * ao longo dos meses. Retorna null quando não há porção definida pro grupo
 * (usa a rotação padrão nesse caso).
 */
function pickAcrossPortions(
  sorted: ExerciseDef[],
  portionMap: Record<string, string> | undefined,
  cap: number,
  cycleNumber: number
): ExerciseDef[] | null {
  if (!portionMap) return null;

  const buckets = new Map<string, ExerciseDef[]>();
  for (const ex of sorted) {
    const portion = portionMap[ex.id] ?? "medio";
    if (!buckets.has(portion)) buckets.set(portion, []);
    buckets.get(portion)!.push(ex);
  }
  const portionNames = Array.from(buckets.keys());
  if (portionNames.length <= 1) return null;

  const picked: ExerciseDef[] = [];
  const usedPerPortion = new Map<string, number>();
  for (let i = 0; i < cap; i++) {
    const portion = portionNames[(cycleNumber - 1 + i) % portionNames.length];
    const bucket = buckets.get(portion)!;
    const already = usedPerPortion.get(portion) ?? 0;
    const idx = (cycleNumber - 1 + already) % bucket.length;
    picked.push(bucket[idx]);
    usedPerPortion.set(portion, already + 1);
  }
  return picked;
}

/**
 * Monta a lista de exercícios filtrada por lesão, ordenada (compostos primeiro,
 * com máquinas priorizadas para iniciantes, e porções/ângulos intercalados pra
 * ombro/bíceps/tríceps) e rotacionada pelo número do ciclo — exercícios
 * diferentes a cada mês.
 *
 * @param volumes  Quantidade de exercícios por grupo (usa defaultVol como fallback)
 */
function pickExercises(
  groups: MuscleGroup[],
  injuries: string[],
  cycleNumber: number = 1,
  volumes: Partial<Record<MuscleGroup, number>> = {},
  isFemale: boolean = true,
  isBeginner: boolean = false,
  timeScale: number = 1,
  isFullBody: boolean = false,
  isManualOverride: boolean = false
): (ExerciseDef & { group: MuscleGroup })[] {
  const result: (ExerciseDef & { group: MuscleGroup })[] = [];

  for (const g of groups) {
    if (!isGroupAllowed(g, isFemale, isBeginner, isFullBody, isManualOverride)) continue;

    let pool = LIBRARY[g].filter((ex) => {
      const injuryOk = injuries.includes("Outra") ? ex.avoidFor.length === 0 : !ex.avoidFor.some((a) => injuries.includes(a));
      if (!injuryOk) return false;
      return !(isBeginner && ex.avoidForBeginner);
    });

    if (isFemale && FEMALE_RESTRICTED_POOLS[g]) {
      const allowedIds = FEMALE_RESTRICTED_POOLS[g]!;
      pool = pool.filter((ex) => allowedIds.includes(ex.id));
    }

    // Compostos primeiro; para iniciantes, máquinas antes de peso livre dentro do mesmo grupo
    const sorted = [...pool].sort((a, b) => {
      if (isBeginner) {
        const machineDiff = +isMachineFriendly(b.name) - +isMachineFriendly(a.name);
        if (machineDiff !== 0) return machineDiff;
      }
      return +b.compound - +a.compound;
    });

    let cap = volumes[g] ?? defaultVol(g, isFemale);
    cap = Math.max(1, Math.round(cap * timeScale));
    if (isFemale && g === "peito") cap = Math.min(cap, 2);

    if (sorted.length === 0) continue;

    const byPortion = pickAcrossPortions(sorted, PORTION_MAP[g], cap, cycleNumber);
    let groupPicks: ExerciseDef[];
    if (byPortion) {
      groupPicks = byPortion;
    } else {
      // Rotação: cada ciclo avança `cap` posições → exercícios novos a cada mês
      groupPicks = [];
      const offset = ((cycleNumber - 1) * cap) % sorted.length;
      for (let i = 0; i < cap && i < sorted.length; i++) {
        groupPicks.push(sorted[(offset + i) % sorted.length]);
      }
    }

    // Evita 2 variações quase-idênticas do mesmo exercício no mesmo treino
    // (ex: pulley pegada supinada + pegada neutra) — troca a repetida por outra do pool.
    groupPicks = dedupeFamilies(groupPicks, sorted);
    result.push(...groupPicks.map((ex) => ({ ...ex, group: g })));
  }

  return result;
}

/** Escolhe 1 exercício de abdômen, rotacionando por ciclo e por dia (mais variedade na semana). */
function pickAbsExercises(injuries: string[], isFemale: boolean, cycleNumber: number, dayIdx: number): (ExerciseDef & { group: MuscleGroup })[] {
  const virtualCycle = cycleNumber * 10 + dayIdx;
  return pickExercises(["core"], injuries, virtualCycle, { core: 1 }, isFemale);
}

/** Escolhe a máquina de cardio do dia, intercalando entre esteira / bike / elíptico. */
function pickCardio(cycleNumber: number, dayIdx: number): { id: string; name: string } {
  const idx = (cycleNumber + dayIdx) % CARDIO_LIBRARY.length;
  return CARDIO_LIBRARY[idx];
}

function buildAbsExercises(injuries: string[], isFemale: boolean, cycleNumber: number, dayIdx: number): Exercise[] {
  const cautionGroups = getCautionGroups(injuries);
  return pickAbsExercises(injuries, isFemale, cycleNumber, dayIdx).map((ex) => ({
    id:     ex.id,
    name:   ex.name,
    muscle: "Abdômen",
    sets:   "4x15",
    rest:   "30s",
    tip:    "Foco na contração do abdômen — evite puxar o pescoço, o movimento deve vir da barriga.",
    gif:    GIF_MAP[ex.id] ?? undefined,
    video:  VIDEO_MAP[ex.id] ?? undefined,
    jointCaution: cautionGroups.has(ex.group) ? JOINT_CAUTION_TEXT : undefined,
  }));
}

/**
 * Perfil de tempo disponível — escala o volume de exercícios por grupo
 * (aplicado ao cap em pickExercises) e ajusta o cardio final.
 * Cardio nunca entra no tempo de musculação, em nenhum perfil — é sempre
 * opcional/à parte (feito num dia/momento com mais disponibilidade), então o
 * tempo escolhido vai inteiro pra musculação. Os volumes dos splits foram
 * desenhados pro "1h30" (volumeScale 1.2 já embute esse tempo cheio).
 * Em "40 min" os exercícios entram em bi-set (aparelho + halteres) pra caber
 * no tempo sem depender de duas máquinas livres.
 */
const TIME_PROFILES: Record<string, { volumeScale: number; includeCardio: boolean; cardioMinutes: number; cardioLabel: string; useBiSets: boolean }> = {
  "40 min": { volumeScale: 0.55, includeCardio: false, cardioMinutes: 0, cardioLabel: "", useBiSets: true },
  "1h":     { volumeScale: 0.85, includeCardio: false, cardioMinutes: 0, cardioLabel: "", useBiSets: false },
  "1h30":   { volumeScale: 1,    includeCardio: false, cardioMinutes: 0, cardioLabel: "", useBiSets: false },
};

function getTimeProfile(tempoTreino?: string) {
  return TIME_PROFILES[tempoTreino ?? "1h30"] ?? TIME_PROFILES["1h30"];
}

function buildCardioExercise(cycleNumber: number, dayIdx: number, cardioLabel: string = "20-30 min"): Exercise {
  const c = pickCardio(cycleNumber, dayIdx);
  return {
    id:     c.id,
    name:   c.name,
    muscle: "Cardio",
    sets:   cardioLabel,
    rest:   "—",
    tip:    "Ritmo moderado e constante — o objetivo é queimar calorias extras sem prejudicar a recuperação do treino de força.",
    gif:    GIF_MAP[c.id] ?? undefined,
    video:  VIDEO_MAP[c.id] ?? undefined,
  };
}

/**
 * Converte o texto de descanso ("75s", "2min") pra segundos. parseInt sozinho
 * lê "2min" como 2 (segundos!) em vez de 120 — por isso o formato precisa ser
 * reconhecido explicitamente, não só o prefixo numérico.
 */
function parseRestSeconds(rest: string): number {
  const match = rest.match(/(\d+)\s*(min)?/);
  if (!match) return 60;
  const value = parseInt(match[1], 10);
  return match[2] ? value * 60 : value;
}

/** Estima a duração (min) somando o tempo dos exercícios de força + abdômen + cardio. */
function estimateDuration(mainCount: number, timePerMain: number, absCount: number, cardioMinutes: number = 25): number {
  const absTime = absCount * 4 * (1.5 + 30 / 60); // 4 séries, ~30s de descanso
  return Math.round(5 + mainCount * timePerMain + absTime + cardioMinutes);
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
    tempoTreino,
  } = anamnese;

  const isFemale = sexo === "Feminino";
  const isBeginner = getNivelTier(nivel) <= 2;
  const isTrueBeginner = getNivelTier(nivel) === 1;
  const injuries = resolveInjuries(lesoes, lesoesDetalhe);
  const timeProfile = getTimeProfile(tempoTreino);
  const { sets, reps, rest, tip } = getBaseSetsRest(objetivo, nivel, cycleNumber);
  let defs = pickExercises(slot.groups, injuries, cycleNumber, slot.volumes ?? {}, isFemale, isBeginner, timeProfile.volumeScale, false, true);
  const cautionGroups = getCautionGroups(injuries);
  let partnerNameOf = new Map<string, string>();
  if (timeProfile.useBiSets) {
    defs = ensureBiSetMix(defs, injuries, isFemale, isBeginner, cycleNumber);
    ({ ordered: defs, partnerNameOf } = applyBiSets(defs));
  }

  const exercises: Exercise[] = defs.map((ex) => {
    const partner = partnerNameOf.get(ex.id);
    return {
      id:     ex.id,
      name:   ex.name,
      muscle: ex.primaryMuscle,
      sets:   `${sets}x${reps}`,
      rest:   partner ? `sem pausa entre a dupla · ${rest} depois` : rest,
      tip,
      gif:    GIF_MAP[ex.id] ?? undefined,
      video:  VIDEO_MAP[ex.id] ?? undefined,
      jointCaution: cautionGroups.has(ex.group) ? JOINT_CAUTION_TEXT : undefined,
      biSetNote: partner ? `🔗 Bi-set com ${partner} — faça os dois direto, sem descansar entre eles. Descanse só depois de completar a dupla.` : undefined,
      beginnerCaution: isTrueBeginner ? ex.beginnerCaution : undefined,
    };
  });

  const mainCount = exercises.length;
  if (timeProfile.includeCardio) exercises.push(buildCardioExercise(cycleNumber, 0, timeProfile.cardioLabel));

  const restSeconds = parseRestSeconds(rest);
  const timePerEx   = sets * (1.5 + restSeconds / 60);
  let duration      = estimateDuration(mainCount, timePerEx, 0, timeProfile.cardioMinutes);
  // Bi-set: a dupla descansa uma vez só, não duas — desconta o descanso economizado por par.
  if (partnerNameOf.size > 0) {
    duration -= Math.round(partnerNameOf.size * (restSeconds / 60));
  }

  return {
    name:        slot.name,
    emoji:       slot.emoji,
    muscleLabel: slot.groups.filter((g) => isGroupAllowed(g, isFemale, isBeginner, false, true)).map((g) => GROUP_LABELS[g]).join(" · "),
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
    tempoTreino,
  } = anamnese;

  const isFemale = sexo === "Feminino";
  const isBeginner = getNivelTier(nivel) <= 2;
  const isTrueBeginner = getNivelTier(nivel) === 1;
  const splits   = isTrueBeginner ? buildFullBodySplits(diasTreino, isFemale) : (isFemale ? FEMALE_SPLITS : MALE_SPLITS);
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
  const timeProfile = getTimeProfile(tempoTreino);
  const base     = getBaseSetsRest(objetivo, nivel, cycleNumber);
  const advanced = getAdvancedTechnique(objetivo, nivel, cycleNumber, injuries);
  // Em treinos de 40min o bi-set por tempo já é a técnica do dia — não empilha com o finalizador avançado.
  const isFinisherDay = !timeProfile.useBiSets && advanced !== null && getFinisherDays(split).has(dayIdx);
  // Full Body treina os mesmos grupos toda sessão — usa um ciclo virtual por dia
  // pra segunda/quarta/sexta pegarem exercícios diferentes na mesma semana
  // (ex: Peck Deck na segunda, Supino Máquina na quarta), não só de mês em mês.
  const pickCycle = isTrueBeginner ? cycleNumber * 10 + dayIdx : cycleNumber;
  let defs = pickExercises(slot.groups, injuries, pickCycle, slot.volumes, isFemale, isBeginner, timeProfile.volumeScale, isTrueBeginner);
  const cautionGroups = getCautionGroups(injuries);
  let partnerNameOf = new Map<string, string>();
  if (timeProfile.useBiSets) {
    defs = ensureBiSetMix(defs, injuries, isFemale, isBeginner, cycleNumber);
    ({ ordered: defs, partnerNameOf } = applyBiSets(defs));
  }

  // Dropset exige troca de carga instantânea, sem sair andando pra pegar outro
  // peso — por isso só pode cair num exercício de máquina/cabo, nunca em peso
  // livre. Se o último exercício não for de aparelho, usa o último que for.
  const isDropset = !!advanced && advanced.tip.startsWith("🔥 Dropset");
  let finisherIndex = defs.length - 1;
  if (isFinisherDay && isDropset) {
    for (let i = defs.length - 1; i >= 0; i--) {
      if (BISET_MACHINE_IDS.has(defs[i].id)) { finisherIndex = i; break; }
    }
  }

  // A técnica avançada (quando existe) aplica-se só a um exercício do dia,
  // e só nos dias marcados como finalizador — nunca no treino inteiro.
  const exercises: Exercise[] = defs.map((ex, i) => {
    const isFinisherExercise = isFinisherDay && i === finisherIndex;
    const presc = isFinisherExercise ? advanced! : base;
    const partner = partnerNameOf.get(ex.id);
    return {
      id:     ex.id,
      name:   ex.name,
      muscle: ex.primaryMuscle,
      sets:   `${presc.sets}x${presc.reps}`,
      rest:   partner ? `sem pausa entre a dupla · ${presc.rest} depois` : presc.rest,
      tip:    presc.tip,
      gif:    GIF_MAP[ex.id] ?? undefined,
      video:  VIDEO_MAP[ex.id] ?? undefined,
      jointCaution: cautionGroups.has(ex.group) ? JOINT_CAUTION_TEXT : undefined,
      biSetNote: partner ? `🔗 Bi-set com ${partner} — faça os dois direto, sem descansar entre eles. Descanse só depois de completar a dupla.` : undefined,
      beginnerCaution: isTrueBeginner ? ex.beginnerCaution : undefined,
    };
  });
  const mainCount = exercises.length;

  // Abdômen (2-3x/semana, conforme o slot) — sempre antes do cardio
  const absExercises = slot.abs ? buildAbsExercises(injuries, isFemale, cycleNumber, dayIdx) : [];
  exercises.push(...absExercises);

  // Cardio — todo dia de treino, sempre por último (exceto em treinos de 40min, ver TIME_PROFILES)
  if (timeProfile.includeCardio) exercises.push(buildCardioExercise(cycleNumber, dayIdx, timeProfile.cardioLabel));

  const baseRestSeconds = parseRestSeconds(base.rest);
  const timePerMain      = base.sets * (1.5 + baseRestSeconds / 60);
  let duration = estimateDuration(mainCount, timePerMain, absExercises.length, timeProfile.cardioMinutes);
  // Bi-set: a dupla descansa uma vez só, não duas — desconta o descanso economizado por par.
  if (partnerNameOf.size > 0) {
    duration -= Math.round(partnerNameOf.size * (baseRestSeconds / 60));
  }
  if (isFinisherDay) {
    // O último exercício usa a prescrição avançada em vez da base — ajusta a diferença
    const advRestSeconds = parseRestSeconds(advanced!.rest);
    const timePerAdvanced = advanced!.sets * (1.5 + advRestSeconds / 60);
    duration += Math.round(timePerAdvanced - timePerMain);
  }

  return {
    name:        slot.name,
    emoji:       slot.emoji,
    muscleLabel: slot.groups.filter((g) => isGroupAllowed(g, isFemale, isBeginner, isTrueBeginner)).map((g) => GROUP_LABELS[g]).join(" · "),
    duration,
    exercises,
    isRest: false,
  };
}

/** Catálogo achatado (id, nome, grupo) de toda a biblioteca — usado no editor manual do /admin. */
export function getExerciseCatalog(): { id: string; name: string; group: MuscleGroup | "cardio" }[] {
  const catalog: { id: string; name: string; group: MuscleGroup | "cardio" }[] = [];
  for (const group of Object.keys(LIBRARY) as MuscleGroup[]) {
    for (const ex of LIBRARY[group]) catalog.push({ id: ex.id, name: ex.name, group });
  }
  for (const c of CARDIO_LIBRARY) catalog.push({ id: c.id, name: c.name, group: "cardio" });
  return catalog;
}

function findExerciseDef(id: string): (ExerciseDef & { group: MuscleGroup }) | null {
  for (const group of Object.keys(LIBRARY) as MuscleGroup[]) {
    const found = LIBRARY[group].find((ex) => ex.id === id);
    if (found) return { ...found, group };
  }
  return null;
}

/**
 * Monta o treino do dia a partir de uma lista fixa de ids escolhida
 * manualmente (via /admin) — ignora o algoritmo de seleção automática pra
 * esse dia específico. Ainda usa a prescrição de séries/descanso da
 * periodização normal (fase do ciclo), só não filtra por lesão/nível —
 * a escolha já é uma decisão explícita de quem está montando.
 */
export type ManualTechnique = "dropset" | "cluster" | "restpause" | "biset";

export interface ManualExerciseEntry {
  id: string;
  technique?: ManualTechnique;
}

// Prescrições fixas por técnica — independem de objetivo/nível porque aqui é
// escolha explícita de quem está montando o treino manual, não periodização
// automática (ver getAdvancedTechnique, que é a versão automática/mensal
// dessas mesmas técnicas). Bi-set não tem SetsRest própria — usa a base do
// exercício, só muda o texto do descanso (ver pareamento abaixo).
const MANUAL_TECHNIQUE_PRESCRIPTIONS: Record<Exclude<ManualTechnique, "biset">, SetsRest> = {
  dropset: {
    sets: 3, reps: "12+8", rest: "60s",
    tip: "🔥 Dropset: complete as 12 reps normais, reduza 20% da carga sem pausar e execute mais 8 reps. Máximo esforço metabólico nessa série.",
  },
  cluster: {
    sets: 4, reps: "8+4", rest: "90s",
    tip: "⚡ Cluster set: execute 4 reps, pausa de 10s sem soltar o peso, mais 4 reps. As últimas 4 devem ser muito difíceis — permite carga maior com técnica perfeita.",
  },
  restpause: {
    sets: 4, reps: "6-8 + rest-pause", rest: "2min",
    tip: "⏸️ Rest-pause: leve a série quase à falha, descanse só 15s sem soltar o peso, e faça mais 4-6 reps. Repita esse mini-descanso mais uma vez.",
  },
};

/**
 * Monta o treino do dia a partir de uma lista fixa de exercícios escolhida
 * manualmente (via /admin) — ignora o algoritmo de seleção automática pra
 * esse dia específico. Cada exercício pode ter uma técnica própria (dropset/
 * cluster/rest-pause muda só a prescrição dele; bi-set pareia com o PRÓXIMO
 * item da lista — os dois ficam sem pausa entre si). Sem técnica, usa a
 * prescrição normal da periodização (fase do ciclo). Não filtra por lesão/
 * nível — a escolha já é uma decisão explícita de quem está montando.
 */
export function getWorkoutFromExerciseIds(
  anamnese: AnamneseData,
  entries: (string | ManualExerciseEntry)[],
  cycleNumber: number = 1
): DayWorkout {
  const { objetivo = "Mais disposição e saúde", nivel = "Iniciante (nunca treinei)", lesoes = [], lesoesDetalhe } = anamnese;
  const injuries = resolveInjuries(lesoes, lesoesDetalhe);
  const cautionGroups = getCautionGroups(injuries);
  const base = getBaseSetsRest(objetivo, nivel, cycleNumber);
  const isTrueBeginner = getNivelTier(nivel) === 1;

  const normalized: ManualExerciseEntry[] = entries.map((e) => (typeof e === "string" ? { id: e } : e));

  const exercises: Exercise[] = [];
  let skipNext = false;

  for (let i = 0; i < normalized.length; i++) {
    if (skipNext) { skipNext = false; continue; }
    const { id, technique } = normalized[i];

    const cardio = CARDIO_LIBRARY.find((c) => c.id === id);
    if (cardio) {
      exercises.push({
        id:     cardio.id,
        name:   cardio.name,
        muscle: "Cardio",
        sets:   "20-30 min",
        rest:   "—",
        tip:    "Ritmo moderado e constante — o objetivo é queimar calorias extras sem prejudicar a recuperação do treino de força.",
        gif:    GIF_MAP[cardio.id] ?? undefined,
        video:  VIDEO_MAP[cardio.id] ?? undefined,
      });
      continue;
    }
    const def = findExerciseDef(id);
    if (!def) continue; // id inválido/removido da biblioteca — ignora silenciosamente

    if (technique === "biset") {
      const next = normalized[i + 1];
      const partnerDef = next ? findExerciseDef(next.id) : null;
      if (partnerDef) {
        skipNext = true;
        exercises.push({
          id: def.id, name: def.name, muscle: def.primaryMuscle,
          sets: `${base.sets}x${base.reps}`,
          rest: `sem pausa entre a dupla · ${base.rest} depois`,
          tip: base.tip,
          gif: GIF_MAP[def.id] ?? undefined, video: VIDEO_MAP[def.id] ?? undefined,
          jointCaution: cautionGroups.has(def.group) ? JOINT_CAUTION_TEXT : undefined,
          biSetNote: `🔗 Bi-set com ${partnerDef.name} — faça os dois direto, sem descansar entre eles. Descanse só depois de completar a dupla.`,
          beginnerCaution: isTrueBeginner ? def.beginnerCaution : undefined,
        });
        exercises.push({
          id: partnerDef.id, name: partnerDef.name, muscle: partnerDef.primaryMuscle,
          sets: `${base.sets}x${base.reps}`,
          rest: `sem pausa entre a dupla · ${base.rest} depois`,
          tip: base.tip,
          gif: GIF_MAP[partnerDef.id] ?? undefined, video: VIDEO_MAP[partnerDef.id] ?? undefined,
          jointCaution: cautionGroups.has(partnerDef.group) ? JOINT_CAUTION_TEXT : undefined,
          beginnerCaution: isTrueBeginner ? partnerDef.beginnerCaution : undefined,
        });
        continue;
      }
      // sem próximo exercício pra parear — cai pra prescrição normal
    }

    const presc = technique && technique !== "biset" ? MANUAL_TECHNIQUE_PRESCRIPTIONS[technique] : base;
    exercises.push({
      id:     def.id,
      name:   def.name,
      muscle: def.primaryMuscle,
      sets:   `${presc.sets}x${presc.reps}`,
      rest:   presc.rest,
      tip:    presc.tip,
      gif:    GIF_MAP[def.id] ?? undefined,
      video:  VIDEO_MAP[def.id] ?? undefined,
      jointCaution: cautionGroups.has(def.group) ? JOINT_CAUTION_TEXT : undefined,
      beginnerCaution: isTrueBeginner ? def.beginnerCaution : undefined,
    });
  }

  const restSeconds = parseRestSeconds(base.rest);
  const timePerEx   = base.sets * (1.5 + restSeconds / 60);
  const mainCount   = exercises.filter((e) => e.muscle !== "Cardio").length;
  const duration    = estimateDuration(mainCount, timePerEx, 0, 0);

  return {
    name:        "Treino personalizado",
    emoji:       "✍️",
    muscleLabel: "Montado manualmente",
    duration,
    exercises,
    isRest: exercises.length === 0,
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
  const isTrueBeginner = getNivelTier(anamnese.nivel) === 1;
  const diasTreino = anamnese.diasTreino ?? "3 dias";
  const splits   = isTrueBeginner ? buildFullBodySplits(diasTreino, isFemale) : (isFemale ? FEMALE_SPLITS : MALE_SPLITS);
  const split    = splits[diasTreino] ?? splits["3 dias"];

  return labels.map((d, i) => ({
    day:         d,
    isTraining:  !!split[i],
    workoutName: split[i]?.name ?? "",
    emoji:       split[i]?.emoji ?? "",
  }));
}
