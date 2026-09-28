// @ts-check
/** Utilitários de DOM e movimento usados pelo quiz, pela oferta e pela dashboard. */

/** @param {string} sel @param {ParentNode} [root] */
export const $ = (sel, root = document) => /** @type {HTMLElement|null} */ (root.querySelector(sel));
/** @param {string} sel @param {ParentNode} [root] */
export const $$ = (sel, root = document) => /** @type {HTMLElement[]} */ ([...root.querySelectorAll(sel)]);

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** @param {number} ms */
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** SVG do sprite de ícones. @param {string} name @param {string} [cls] */
export const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" aria-hidden="true" focusable="false"><use href="img/icons.svg#i-${name}"></use></svg>`;

const easeOutExpo = (/** @type {number} */ t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Anima um número de `from` até `to` no texto do elemento.
 * @param {HTMLElement} el @param {number} to
 * @param {{ from?: number, duration?: number, format?: (n: number) => string, delay?: number }} [opts]
 */
export function countUp(el, to, opts = {}) {
  const { from = 0, duration = 1400, format = (n) => String(Math.round(n)), delay = 0 } = opts;
  if (reducedMotion()) { el.textContent = format(to); return Promise.resolve(); }
  return new Promise((resolve) => {
    setTimeout(() => {
      const t0 = performance.now();
      const tick = (/** @type {number} */ now) => {
        const t = Math.min(1, (now - t0) / duration);
        el.textContent = format(from + (to - from) * easeOutExpo(t));
        if (t < 1) requestAnimationFrame(tick); else resolve(undefined);
      };
      requestAnimationFrame(tick);
    }, delay);
  });
}

/**
 * Adiciona `.is-in` quando o elemento entra na tela (uma vez só).
 * @param {ParentNode} [root] @param {string} [selector]
 */
export function observeReveal(root = document, selector = '.reveal') {
  const items = $$(selector, root).filter((el) => !el.classList.contains('is-in'));
  if (!('IntersectionObserver' in window) || reducedMotion()) {
    items.forEach((el) => { el.classList.add('is-in'); el.dispatchEvent(new CustomEvent('reveal')); });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      e.target.dispatchEvent(new CustomEvent('reveal'));
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

/**
 * Onda de toque a partir do ponto clicado.
 * @param {HTMLElement} el @param {MouseEvent|PointerEvent} ev
 */
export function ripple(el, ev) {
  if (reducedMotion()) return;
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2.2;
  const dot = document.createElement('span');
  dot.className = 'ripple';
  const x = (ev.clientX || r.left + r.width / 2) - r.left - size / 2;
  const y = (ev.clientY || r.top + r.height / 2) - r.top - size / 2;
  dot.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  el.append(dot);
  dot.addEventListener('animationend', () => dot.remove(), { once: true });
}

/** Leitura segura do sessionStorage. @param {string} key */
export function loadJSON(key) {
  try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; }
}
/** @param {string} key @param {unknown} value */
export function saveJSON(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* modo privado */ }
}

/** Marca que o JS está ativo (usado pelo CSS pra liberar animações de entrada). */
export function markJs() {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');
}
