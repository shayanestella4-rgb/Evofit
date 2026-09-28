// @ts-check
import { DIMENSIONS, GLASSES_MAX, GLASS_ML } from './data.js';
import { reducedMotion } from '../lib/dom.js';
import { fmtLiters, escapeHtml } from '../lib/format.js';

/**
 * Componentes visuais do quiz. Cada função devolve HTML (string) e, quando o
 * componente é interativo, uma função `mount` que liga os eventos.
 * @typedef {import('./data.js').DimKey} DimKey
 */

/* ------------------------------------------------------------------ Copos */

const GLASS_PATH = 'M6 5h28l-3.1 42.2a3 3 0 0 1-3 2.8H12.1a3 3 0 0 1-3-2.8Z';

/** @param {number} value */
export function glassesHTML(value) {
  const glasses = Array.from({ length: GLASSES_MAX }, (_, i) => {
    const n = i + 1;
    return `<button type="button" class="glass${n <= value ? ' is-full' : ''}" data-n="${n}" style="--i:${i}"
      aria-label="${n} ${n === 1 ? 'copo' : 'copos'}" aria-pressed="${n <= value}">
      <svg viewBox="0 0 40 52" aria-hidden="true" focusable="false">
        <g clip-path="url(#glass-clip)"><g class="glass__water"><path class="glass__wave" d="M-40 9q10-5 20 0t20 0 20 0 20 0 20 0V60H-40Z"/></g></g>
        <path class="glass__outline" d="${GLASS_PATH}"/>
      </svg></button>`;
  }).join('');
  return `
    <svg width="0" height="0" class="sr-only" aria-hidden="true"><clipPath id="glass-clip"><path d="${GLASS_PATH}"/></clipPath></svg>
    <div class="glasses">
      <p class="glasses__readout" aria-live="polite"><strong data-glasses-n>${value}</strong> <span data-glasses-unit>${value === 1 ? 'copo' : 'copos'}</span>
        <span class="glasses__liters" data-glasses-l>${fmtLiters((value * GLASS_ML) / 1000)} por dia</span></p>
      <div class="glasses__grid" role="group" aria-label="Toque no copo que representa quanto você bebe">${glasses}</div>
      <div class="glasses__controls">
        <button type="button" class="icon-btn" data-glasses-step="-1" aria-label="Um copo a menos"><span aria-hidden="true">−</span></button>
        <button type="button" class="chip-btn" data-glasses-zero>Quase nenhum</button>
        <button type="button" class="icon-btn" data-glasses-step="1" aria-label="Um copo a mais"><span aria-hidden="true">+</span></button>
      </div>
    </div>`;
}

/**
 * @param {HTMLElement} root @param {number} initial
 * @param {(value: number) => void} onChange
 */
export function mountGlasses(root, initial, onChange) {
  let value = initial;
  const set = (/** @type {number} */ v) => {
    value = Math.max(0, Math.min(GLASSES_MAX, v));
    root.querySelectorAll('.glass').forEach((g, i) => {
      const full = i < value;
      g.classList.toggle('is-full', full);
      g.setAttribute('aria-pressed', String(full));
      /** @type {HTMLElement} */ (g).style.setProperty('--d', `${Math.abs(i - value) * 35}ms`);
    });
    const n = /** @type {HTMLElement} */ (root.querySelector('[data-glasses-n]'));
    n.textContent = String(value);
    /** @type {HTMLElement} */ (root.querySelector('[data-glasses-unit]')).textContent = value === 1 ? 'copo' : 'copos';
    /** @type {HTMLElement} */ (root.querySelector('[data-glasses-l]')).textContent = `${fmtLiters((value * GLASS_ML) / 1000)} por dia`;
    n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump');
    onChange(value);
  };
  root.addEventListener('click', (ev) => {
    const t = /** @type {HTMLElement} */ (ev.target);
    const glass = t.closest('.glass');
    if (glass) {
      const n = Number(/** @type {HTMLElement} */ (glass).dataset.n);
      set(n === value ? n - 1 : n);
      return;
    }
    const step = t.closest('[data-glasses-step]');
    if (step) { set(value + Number(/** @type {HTMLElement} */ (step).dataset.glassesStep)); return; }
    if (t.closest('[data-glasses-zero]')) set(0);
  });
}

/* ------------------------------------------------------------------ Régua (peso) */

const TICK = 12;

/** @param {number} min @param {number} max @param {number} value @param {string} unit */
export function rulerHTML(min, max, value, unit) {
  const ticks = [];
  for (let v = min; v <= max; v++) {
    const kind = v % 10 === 0 ? 'major' : v % 5 === 0 ? 'mid' : 'minor';
    ticks.push(`<span class="tick tick--${kind}">${kind === 'major' ? `<b>${v}</b>` : ''}</span>`);
  }
  return `
    <div class="ruler-wrap">
      <p class="ruler__value"><strong data-ruler-n>${value}</strong><span>${escapeHtml(unit)}</span></p>
      <div class="ruler-box">
        <div class="ruler" tabindex="0" role="slider" aria-label="Seu peso em quilos"
          aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${value}" aria-valuetext="${value} ${escapeHtml(unit)}">
          <div class="ruler__track" style="--tick:${TICK}px">${ticks.join('')}</div>
        </div>
      </div>
      <div class="ruler__controls">
        <button type="button" class="icon-btn" data-ruler-step="-1" aria-label="Diminuir 1 quilo"><span aria-hidden="true">−</span></button>
        <span class="ruler__hint">Arraste a régua</span>
        <button type="button" class="icon-btn" data-ruler-step="1" aria-label="Aumentar 1 quilo"><span aria-hidden="true">+</span></button>
      </div>
    </div>`;
}

/**
 * @param {HTMLElement} root @param {{min:number,max:number,value:number,unit:string}} o
 * @param {(value: number) => void} onChange
 */
export function mountRuler(root, o, onChange) {
  const ruler = /** @type {HTMLElement} */ (root.querySelector('.ruler'));
  const out = /** @type {HTMLElement} */ (root.querySelector('[data-ruler-n]'));
  let value = o.value;
  let raf = 0;
  const toScroll = (/** @type {number} */ v) => (v - o.min) * TICK;
  const apply = (/** @type {number} */ v) => {
    if (v === value) return;
    value = v;
    out.textContent = String(v);
    ruler.setAttribute('aria-valuenow', String(v));
    ruler.setAttribute('aria-valuetext', `${v} ${o.unit}`);
    onChange(v);
  };
  // Posição inicial sem animação, depois do layout.
  requestAnimationFrame(() => { ruler.scrollLeft = toScroll(value); onChange(value); });
  ruler.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const v = Math.round(ruler.scrollLeft / TICK) + o.min;
      apply(Math.max(o.min, Math.min(o.max, v)));
    });
  }, { passive: true });
  const go = (/** @type {number} */ v) => {
    const target = Math.max(o.min, Math.min(o.max, v));
    ruler.scrollTo({ left: toScroll(target), behavior: reducedMotion() ? 'auto' : 'smooth' });
  };
  ruler.addEventListener('keydown', (ev) => {
    const map = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 };
    if (ev.key in map) { ev.preventDefault(); go(value + map[/** @type {keyof typeof map} */ (ev.key)]); }
    if (ev.key === 'Home') { ev.preventDefault(); go(o.min); }
    if (ev.key === 'End') { ev.preventDefault(); go(o.max); }
  });
  root.querySelectorAll('[data-ruler-step]').forEach((b) =>
    b.addEventListener('click', () => go(value + Number(/** @type {HTMLElement} */ (b).dataset.rulerStep))));

  // Mouse: arrastar a régua e usar a roda (no toque, a rolagem nativa já resolve).
  let dragX = 0, dragLeft = 0, dragging = false;
  ruler.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    dragging = true; dragX = ev.clientX; dragLeft = ruler.scrollLeft;
    ruler.setPointerCapture(ev.pointerId);
    ruler.classList.add('is-dragging');
  });
  ruler.addEventListener('pointermove', (ev) => { if (dragging) ruler.scrollLeft = dragLeft - (ev.clientX - dragX); });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    ruler.classList.remove('is-dragging');
    go(value);
  };
  ruler.addEventListener('pointerup', endDrag);
  ruler.addEventListener('pointercancel', endDrag);
  ruler.addEventListener('wheel', (ev) => {
    if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
    ev.preventDefault();
    ruler.scrollLeft += ev.deltaY;
  }, { passive: false });
}

/* ------------------------------------------------------------------ Anel da nota */

const RING_R = 88;
export const RING_C = 2 * Math.PI * RING_R;

/** @param {number} score */
export function scoreRingHTML(score) {
  return `
    <div class="ring" style="--target:${(RING_C * (1 - score / 100)).toFixed(1)};--c:${RING_C.toFixed(1)}">
      <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs><linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="oklch(0.84 0.07 124)"/><stop offset="1" stop-color="oklch(0.564 0.066 128.6)"/></linearGradient></defs>
        <circle class="ring__track" cx="100" cy="100" r="${RING_R}"/>
        <circle class="ring__bar" cx="100" cy="100" r="${RING_R}"/>
      </svg>
      <p class="ring__label"><strong data-score>0</strong><span>/100</span></p>
    </div>`;
}

/* ------------------------------------------------------------------ Radar */

/**
 * Gráfico radar das 7 áreas, com a zona "Forte" (70+) marcada.
 * @param {Record<DimKey, number|null>} dims
 */
export function radarHTML(dims) {
  const size = 360, c = size / 2, R = 124;
  const n = DIMENSIONS.length;
  const pt = (/** @type {number} */ i, /** @type {number} */ r) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };
  const poly = (/** @type {number} */ r) => DIMENSIONS.map((_, i) => pt(i, r).map((v) => v.toFixed(1)).join(',')).join(' ');
  const levels = [0.25, 0.5, 0.75, 1].map((f) => `<polygon class="radar__level" points="${poly(R * f)}"/>`).join('');
  const strong = `<polygon class="radar__strong" points="${poly(R * 0.7)}"/>`;
  const axes = DIMENSIONS.map((_, i) => { const [x, y] = pt(i, R); return `<line class="radar__axis" x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('');
  const data = DIMENSIONS.map((d, i) => pt(i, R * Math.max(0.04, (dims[d.key] ?? 0) / 100)));
  const dataPoly = data.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const dots = data.map(([x, y], i) => `<circle class="radar__dot" style="--i:${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"/>`).join('');
  const labels = DIMENSIONS.map((d, i) => {
    const [x, y] = pt(i, R + 26);
    const anchor = Math.abs(x - c) < 8 ? 'middle' : x > c ? 'start' : 'end';
    const dy = y < c - R * 0.6 ? -6 : y > c + R * 0.4 ? 10 : 0;
    return `<text class="radar__label" x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">
      <tspan x="${x.toFixed(1)}">${d.label}</tspan><tspan class="radar__num" x="${x.toFixed(1)}" dy="16">${dims[d.key] ?? '·'}</tspan></text>`;
  }).join('');
  const summary = DIMENSIONS.map((d) => `${d.label}: ${dims[d.key] ?? 'sem resposta'}`).join(', ');
  return `
    <figure class="radar">
      <svg viewBox="-40 -10 ${size + 80} ${size + 20}" role="img" aria-label="Gráfico das sete áreas. ${summary}.">
        ${levels}${strong}${axes}
        <polygon class="radar__area" points="${dataPoly}"/>
        ${dots}${labels}
      </svg>
      <figcaption class="radar__legend"><span class="radar__legend-strong"></span> Linha tracejada: a partir de 70 a área já é forte</figcaption>
    </figure>`;
}
