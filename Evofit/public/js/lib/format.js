// @ts-check
/** Formatação e saneamento compartilhados entre quiz, oferta e dashboard. */

const NF1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const NF0 = new Intl.NumberFormat('pt-BR');

/** @param {number} l */
export const fmtLiters = (l) => `${NF1.format(l)} L`;
/** @param {number} n */
export const fmtInt = (n) => NF0.format(Math.round(n));
/** @param {number} ratio 0..1 */
export const fmtPct = (ratio) => `${NF0.format(Math.round(ratio * 1000) / 10)}%`;

const HTML_ESC = /** @type {Record<string,string>} */ ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });
/** @param {unknown} s */
export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => HTML_ESC[c]);

/**
 * Primeiro nome, com inicial maiúscula e só caracteres de nome.
 * @param {unknown} raw
 */
export function firstName(raw) {
  const first = String(raw ?? '').normalize('NFC').trim().split(/\s+/)[0] || '';
  const clean = first.replace(/[^\p{L}'-]/gu, '').slice(0, 24);
  if (clean.length < 2) return '';
  return clean
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|[-'])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase('pt-BR'));
}

/**
 * Escolhe a variação de texto conforme o gênero informado. Sem gênero, usa a forma neutra.
 * @param {unknown} gender @param {{f: string, m: string, x: string}} forms
 */
export function byGender(gender, forms) {
  return gender === 'f' ? forms.f : gender === 'm' ? forms.m : forms.x;
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
/** @param {unknown} v */
export const normalizeEmail = (v) => String(v ?? '').trim().toLowerCase();
/** @param {string} v */
export const isValidEmail = (v) => v.length <= 254 && EMAIL_RE.test(v);
