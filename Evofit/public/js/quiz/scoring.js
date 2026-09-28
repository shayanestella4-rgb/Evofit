// @ts-check
import { STEPS, STEP, DIMENSIONS, BANDS, PHASES, WATER_ML_PER_KG, GLASS_ML, GLASSES_MAX } from './data.js';

/**
 * @typedef {import('./data.js').DimKey} DimKey
 * @typedef {Record<string, string|number>} Answers
 * @typedef {{
 *   dims: Record<DimKey, number|null>,
 *   total: number,
 *   phase: typeof PHASES[number],
 *   bands: Record<DimKey, typeof BANDS[number]|null>,
 *   ranked: DimKey[],
 *   weakest: DimKey,
 *   strongest: DimKey,
 *   water: { targetL: number, intakeL: number, ratio: number },
 * }} Result
 */

export const PESO_DEFAULT = { f: 65, m: 80, x: 70 };

/** @param {number} n @param {number} lo @param {number} hi */
export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** @param {unknown} peso */
export function waterTargetL(peso) {
  const kg = clamp(Number(peso) || 0, 30, 200);
  return Math.round((kg * WATER_ML_PER_KG) / 100) / 10;
}

/** @param {unknown} copos */
export function waterIntakeL(copos) {
  const n = clamp(Math.round(Number(copos) || 0), 0, GLASSES_MAX);
  return (n * GLASS_ML) / 1000;
}

/**
 * Nota do consumo de água: proporção entre o que a pessoa bebe e a meta, limitada a 100.
 * @param {unknown} copos @param {unknown} peso
 */
export function waterIntakeScore(copos, peso) {
  const target = waterTargetL(peso);
  if (!target) return 0;
  return clamp(Math.round((waterIntakeL(copos) / target) * 100), 0, 100);
}

/**
 * Nota de uma resposta (0 a 100) ou null quando a etapa não pontua ou não foi respondida.
 * @param {string} stepId @param {Answers} answers
 */
export function answerScore(stepId, answers) {
  const step = STEP[stepId];
  if (!step || !step.scored) return null;
  const value = answers[stepId];
  if (value === undefined || value === null || value === '') return null;
  if (step.type === 'glasses') return waterIntakeScore(value, answers.peso ?? PESO_DEFAULT.x);
  const opt = step.options?.find((o) => o.v === value);
  return opt && typeof opt.s === 'number' ? opt.s : null;
}

/** @param {number|null} score */
export function bandOf(score) {
  if (score === null || Number.isNaN(score)) return null;
  let band = BANDS[0];
  for (const b of BANDS) if (score >= b.min) band = b;
  return band;
}

/** @param {number} total */
export function phaseOf(total) {
  let phase = PHASES[0];
  for (const p of PHASES) if (total >= p.min) phase = p;
  return phase;
}

/** Todas as perguntas pontuadas e o peso foram respondidos. @param {Answers} answers */
export function isComplete(answers) {
  return STEPS.every((s) => !s.scored || answerScore(s.id, answers) !== null) && Number(answers.peso) > 0;
}

/** @param {number[]} xs */
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

/**
 * Calcula a nota por área, a nota geral e a fase.
 * @param {Answers} answers
 * @returns {Result}
 */
export function computeResult(answers) {
  /** @type {Record<string, number[]>} */
  const buckets = {};
  for (const s of STEPS) {
    const score = answerScore(s.id, answers);
    if (score === null) continue;
    (buckets[s.group] ||= []).push(score);
  }
  /** @type {Record<DimKey, number|null>} */
  const dims = /** @type {any} */ ({});
  /** @type {Record<DimKey, any>} */
  const bands = /** @type {any} */ ({});
  for (const d of DIMENSIONS) {
    const xs = buckets[d.key];
    dims[d.key] = xs && xs.length ? Math.round(mean(xs)) : null;
    bands[d.key] = bandOf(dims[d.key]);
  }
  const answered = DIMENSIONS.filter((d) => dims[d.key] !== null);
  const total = answered.length ? Math.round(mean(answered.map((d) => /** @type {number} */ (dims[d.key])))) : 0;
  // Empate: mantém a ordem canônica, que já prioriza rotina e disciplina.
  const ranked = answered.map((d) => d.key).sort((a, b) => /** @type {number} */ (dims[a]) - /** @type {number} */ (dims[b]));
  const targetL = waterTargetL(answers.peso ?? PESO_DEFAULT.x);
  const intakeL = waterIntakeL(answers.h_copos ?? 0);
  return {
    dims,
    total,
    phase: phaseOf(total),
    bands,
    ranked,
    weakest: ranked[0],
    strongest: ranked[ranked.length - 1],
    water: { targetL, intakeL, ratio: targetL ? intakeL / targetL : 0 },
  };
}
