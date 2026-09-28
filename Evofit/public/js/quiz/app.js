// @ts-check
import {
  STEPS, STEP_INDEX, QUESTIONS, FLOW_GROUPS, DIM, DIMENSIONS, PERFIL_GROUP, ANALYSIS_LINES, PHRASES, PHASES,
} from './data.js';
import { computeResult, PESO_DEFAULT } from './scoring.js';
import { dimensionInsight, headline, planSteps, sleepInsight, waterInsight } from './insights.js';
import { glassesHTML, mountGlasses, rulerHTML, mountRuler, scoreRingHTML, radarHTML } from './widgets.js';
import { $, $$, icon, wait, countUp, observeReveal, ripple, loadJSON, saveJSON, markJs, reducedMotion } from '../lib/dom.js';
import { escapeHtml, firstName, fmtLiters, normalizeEmail, isValidEmail } from '../lib/format.js';
import { tracker } from '../lib/tracker.js';
import { initPixel, pixel } from '../lib/pixel.js';

/**
 * @typedef {import('./data.js').Step} Step
 * @typedef {import('./data.js').DimKey} DimKey
 * @typedef {{ v: 1, i: number, answers: Record<string, any>, email: string }} QuizState
 */

const STORE = 'evofit.quiz';
const AUTO_ADVANCE_MS = 450;

/** @type {QuizState} */
const S = (() => {
  const saved = loadJSON(STORE);
  return saved && saved.v === 1 && typeof saved.i === 'number' && saved.answers ? saved : { v: 1, i: 0, answers: {}, email: '' };
})();
const persist = () => saveJSON(STORE, S);

const stage = /** @type {HTMLElement} */ ($('#main'));
const layout = /** @type {HTMLElement} */ ($('.layout'));
const topbar = /** @type {HTMLElement} */ ($('.topbar'));
let busy = false;

/* ------------------------------------------------------------------ helpers */

const nome = () => S.answers.nome || '';

/** @param {string} group */
const groupMeta = (group) => (group === 'perfil' ? PERFIL_GROUP : DIM[/** @type {DimKey} */ (group)]);

/** Troca {nome} pelo nome digitado (escapado) ou remove a saudação. @param {string} title */
function fillTitle(title) {
  if (!title.includes('{nome}')) return escapeHtml(title);
  if (!nome()) { const t = title.replace('{nome}, ', ''); return escapeHtml(t.charAt(0).toUpperCase() + t.slice(1)); }
  return escapeHtml(title).replace('{nome}', `<span class="q-name">${escapeHtml(nome())}</span>`);
}

/** @param {string} group */
function chip(group) {
  if (group === 'final') return '';
  const m = groupMeta(group);
  return `<p class="q-chip">${icon(m.icon)}<span>${m.label}</span></p>`;
}

/** @param {Step} step */
function head(step) {
  return `${chip(step.group)}
    <h2 class="q-title" id="t-${step.id}" tabindex="-1">${fillTitle(step.title || '')}</h2>
    ${step.sub ? `<p class="q-sub">${escapeHtml(step.sub)}</p>` : ''}`;
}

/** @param {boolean} [disabled] @param {string} [label] */
const continueBtn = (disabled = false, label = 'Continuar') =>
  `<div class="screen__actions"><button type="button" class="btn btn--block" data-next ${disabled ? 'disabled' : ''}>
    <span class="btn__label">${label}</span>${icon('arrow-right', 'ico-go')}</button></div>`;

const photo = (/** @type {string} */ name, /** @type {string} */ alt, sizes = '(min-width: 960px) 44vw, 100vw', eager = false) =>
  `<img src="img/fotos/${name}-sm.webp" srcset="img/fotos/${name}-sm.webp 640w, img/fotos/${name}-lg.webp 1200w" sizes="${sizes}"
    alt="${escapeHtml(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

/* ------------------------------------------------------------------ templates */

/** @type {Record<string, (step: Step) => string>} */
const T = {
  single(step) {
    const selected = S.answers[step.id];
    const hasSel = step.options?.some((o) => o.v === selected);
    const opts = (step.options || []).map((o, i) => {
      const checked = selected === o.v;
      const tab = (hasSel ? checked : i === 0) ? 0 : -1;
      return `<button type="button" class="opt${o.icon ? ' opt--icon' : ''}" role="radio" aria-checked="${checked}" tabindex="${tab}" data-v="${escapeHtml(o.v)}" style="--i:${i}">
        ${o.icon ? `<span class="opt__icon">${icon(o.icon)}</span>` : ''}
        ${o.swatch ? `<span class="opt__swatch" style="--sw:${o.swatch}"></span>` : ''}
        <span class="opt__label">${escapeHtml(o.label)}</span>
        <span class="opt__mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg></span>
      </button>`;
    }).join('');
    return `${head(step)}<div class="opts opts--${step.layout || 'list'}" role="radiogroup" aria-labelledby="t-${step.id}">${opts}</div>`;
  },

  text(step) {
    return `${head(step)}
      <form class="field-form" novalidate>
        <label class="sr-only" for="in-${step.id}">${escapeHtml(step.title || '')}</label>
        <input class="field" id="in-${step.id}" type="text" autocomplete="given-name" autocapitalize="words" enterkeyhint="next"
          maxlength="40" placeholder="${escapeHtml(step.placeholder || '')}" value="${escapeHtml(S.answers[step.id] || '')}" required
          aria-describedby="err-${step.id}">
        <p class="field-error" id="err-${step.id}" role="alert" hidden>Digite seu primeiro nome, com pelo menos 2 letras.</p>
        <button class="btn btn--block" type="submit"><span class="btn__label">Continuar</span>${icon('arrow-right', 'ico-go')}</button>
      </form>`;
  },

  range(step) {
    const v = Number(S.answers.peso) || PESO_DEFAULT[/** @type {'f'|'m'|'x'} */ (S.answers.sexo)] || PESO_DEFAULT.x;
    return `${head(step)}${rulerHTML(step.min ?? 40, step.max ?? 160, v, step.unit || 'kg')}${continueBtn()}`;
  },

  glasses(step) {
    const v = Number(S.answers.h_copos ?? 0);
    return `${head(step)}${glassesHTML(v)}${continueBtn(S.answers.h_copos === undefined)}`;
  },

  insight(step) { return INSIGHT[step.id](step); },

  analise() {
    const n = ANALYSIS_LINES.length;
    const orbit = ANALYSIS_LINES.map((l, i) => `<span class="orbit__icon" data-dim="${l.dim}" style="--a:${(360 / n) * i}deg">${icon(DIM[/** @type {DimKey} */ (l.dim)].icon)}</span>`).join('');
    const lines = ANALYSIS_LINES.map((l, i) => `<li class="aline" data-i="${i}"><span class="aline__dot">${icon('check')}</span>${escapeHtml(l.text)}</li>`).join('');
    return `
      <div class="analysis">
        <div class="orbit" aria-hidden="true">
          <svg viewBox="0 0 200 200" class="orbit__ring"><circle class="orbit__track" cx="100" cy="100" r="78"/><circle class="orbit__bar" cx="100" cy="100" r="78"/></svg>
          <p class="orbit__pct"><strong data-pct>0</strong><span>%</span></p>
          ${orbit}
        </div>
        <h2 class="q-title" id="t-analise" tabindex="-1">Analisando suas respostas</h2>
        <ol class="alines" aria-live="polite">${lines}</ol>
      </div>`;
  },

  email() {
    const who = nome() ? `${escapeHtml(nome())}, seu` : 'Seu';
    return `
      <div class="gate">
        <div class="gate__preview" aria-hidden="true">
          <div class="gate__ring"><span>?</span></div>
          <div class="gate__bars">${DIMENSIONS.map((d, i) => `<span style="--w:${[62, 38, 71, 45, 83, 29, 55][i]}%"></span>`).join('')}</div>
        </div>
        <p class="kicker">${icon('lock-simple')}Diagnóstico pronto</p>
        <h2 class="q-title" id="t-email" tabindex="-1">${who} diagnóstico está pronto.</h2>
        <p class="q-sub">Deixe seu e-mail pra liberar o resultado. A equipe Evofit pode te mandar dicas pra colocar o plano em prática.</p>
        <form class="field-form" novalidate>
          <label class="field-label" for="in-email">Seu melhor e-mail</label>
          <input class="field" id="in-email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false"
            enterkeyhint="go" maxlength="254" placeholder="voce@email.com" value="${escapeHtml(S.email)}" required aria-describedby="err-email">
          <p class="field-error" id="err-email" role="alert" hidden>Confere o e-mail? Parece que falta alguma coisa.</p>
          <button class="btn btn--block btn--shine" type="submit"><span class="btn__label">Ver meu diagnóstico</span>${icon('arrow-right', 'ico-go')}</button>
          <p class="gate__privacy">${icon('shield-check')}<span>Seu e-mail fica só com a Evofit. Sem spam, e dá pra sair da lista quando quiser.</span></p>
        </form>
      </div>`;
  },

  resultado() { return resultHTML(); },
};

/** Telas de transição. @type {Record<string, (step: Step) => string>} */
const INSIGHT = {
  i_sono() {
    const si = sleepInsight(S.answers);
    const numeric = si.stat.startsWith('+');
    return `
      <div class="insight">
        ${chip('sono')}
        <p class="insight__stat"><strong ${numeric ? 'data-count="385" data-prefix="+"' : ''}>${numeric ? '+0' : escapeHtml(si.stat)}</strong><span>${escapeHtml(si.statLabel)}</span></p>
        <h2 class="q-title" id="t-i_sono" tabindex="-1">${escapeHtml(si.title)}</h2>
        <p class="insight__text">${escapeHtml(si.text)}</p>
        ${numeric ? '<p class="insight__source">Fonte: Al Khatib e colegas, European Journal of Clinical Nutrition, 2017.</p>' : ''}
      </div>${continueBtn()}`;
  },
  i_agua() {
    const r = computeResult(S.answers);
    const wi = waterInsight(r);
    const ratio = Math.min(1, r.water.ratio);
    return `
      <div class="insight">
        ${chip('agua')}
        <div class="gauge" style="--v:${ratio.toFixed(3)}" aria-hidden="true">
          <div class="gauge__bar"><span class="gauge__fill"></span><span class="gauge__goal"></span></div>
          <div class="gauge__legend"><span>Hoje <b>${fmtLiters(r.water.intakeL)}</b></span><span>Meta <b>${fmtLiters(r.water.targetL)}</b></span></div>
        </div>
        <h2 class="q-title" id="t-i_agua" tabindex="-1">${escapeHtml(wi.title)}</h2>
        <p class="insight__lead">${escapeHtml(wi.gapText)}</p>
        <p class="insight__text">${escapeHtml(wi.text)}</p>
        <p class="insight__source">Fontes: Armstrong e colegas, Journal of Nutrition, 2012; Ganio e colegas, British Journal of Nutrition, 2011.</p>
      </div>${continueBtn()}`;
  },
  i_prova() {
    const women = [
      { src: 'oferta/resultado-1.webp', w: 313, h: 372, alt: 'Antes e depois de uma aluna da Evofit' },
      { src: 'oferta/antes-depois-1.webp', w: 371, h: 387, alt: 'Antes e depois de outra aluna da Evofit' },
    ];
    const men = [
      { src: 'oferta/resultado-2.webp', w: 473, h: 416, alt: 'Antes e depois de um aluno da Evofit' },
      { src: 'oferta/resultado-3.webp', w: 477, h: 408, alt: 'Antes e depois de outro aluno da Evofit' },
    ];
    const pics = S.answers.sexo === 'm' ? [men[0], women[0], men[1]] : [women[0], men[0], women[1]];
    return `
      <div class="insight insight--prova">
        <h2 class="q-title" id="t-i_prova" tabindex="-1">Todo mundo começa de algum lugar.</h2>
        <p class="insight__text">Essas pessoas usam a Evofit. Nenhuma começou pronta: começaram com um plano que cabia na rotina.</p>
        <div class="proof">${pics.map((p, i) => `<figure class="proof__item" style="--i:${i}"><img src="img/${p.src}" width="${p.w}" height="${p.h}" alt="${escapeHtml(p.alt)}" loading="lazy" decoding="async"></figure>`).join('')}</div>
      </div>${continueBtn(false, 'Continuar o diagnóstico')}`;
  },
};

/* ------------------------------------------------------------------ resultado */

function resultHTML() {
  const a = S.answers;
  const r = computeResult(a);
  const name = nome();
  const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const areas = [...DIMENSIONS].sort((x, y) => (r.dims[x.key] ?? 0) - (r.dims[y.key] ?? 0)).map((d, i) => {
    const s = r.dims[d.key] ?? 0;
    const band = r.bands[d.key];
    const ins = dimensionInsight(d.key, a, r);
    const open = i < 2;
    return `<li class="area area--${band?.key}" style="--s:${s / 100};--i:${i}">
      <button type="button" class="area__head" aria-expanded="${open}" aria-controls="area-${d.key}">
        <span class="area__icon">${icon(d.icon)}</span>
        <span class="area__name">${d.label}</span>
        <span class="area__band">${band?.label ?? ''}</span>
        <span class="area__score">${s}</span>
        <span class="area__bar" aria-hidden="true"><span></span></span>
        ${icon('caret-down', 'area__caret')}
      </button>
      <div class="area__body" id="area-${d.key}"><div class="area__inner">
        <p>${escapeHtml(ins.text)}</p>
        <p class="area__tip"><strong>Primeiro passo:</strong> ${escapeHtml(ins.tip)}</p>
      </div></div>
    </li>`;
  }).join('');

  const sleepNow = PHRASES.s_horas[a.s_horas] ?? '';
  const numbers = [
    { icon: 'drop', label: 'Água por dia', now: fmtLiters(r.water.intakeL), goal: `Meta: ${fmtLiters(r.water.targetL)}`, v: Math.min(1, r.water.ratio) },
    { icon: 'moon-stars', label: 'Sono por noite', now: sleepNow.replace('entre ', '').replace(' horas', ' h'), goal: 'Meta: 7 a 9 h', v: (r.dims.sono ?? 0) / 100 },
    { icon: 'barbell', label: 'Treinos por semana', now: PHRASES.d_freq[a.d_freq] ?? '', goal: 'Meta inicial: 3 dias', v: { '0': 0, '1-2': 0.5, '3-4': 1, '5+': 1 }[/** @type {'0'} */ (a.d_freq)] ?? 0 },
    { icon: 'timer', label: 'Tempo livre pra treinar', now: PHRASES.p_tempo[a.p_tempo] ?? '', goal: 'Treinos a partir de 15 min', v: 1 },
  ].map((n, i) => `<div class="num reveal" style="--i:${i};--v:${n.v.toFixed(3)}">
      <p class="num__label">${icon(n.icon)}${n.label}</p>
      <p class="num__now">${escapeHtml(n.now)}</p>
      <span class="num__meter" aria-hidden="true"><span></span></span>
      <p class="num__goal">${n.goal}</p>
    </div>`).join('');

  const plan = planSteps(a, r).map((p, i) => `<li class="plan__step reveal" style="--i:${i}">
      <span class="plan__when">${p.when}</span>
      <p class="plan__title">${p.dim ? icon(DIM[p.dim].icon) : icon('sparkle')}${escapeHtml(p.title)}</p>
      <p class="plan__text">${escapeHtml(p.text)}</p>
    </li>`).join('');

  const phases = PHASES.map((p) => `<li class="${p.n === r.phase.n ? 'is-current' : p.n < r.phase.n ? 'is-past' : ''}"><span>${p.n}</span>${p.name}</li>`).join('');

  return `
    <article class="result">
      <header class="result__hero">
        <div class="result__score">${scoreRingHTML(r.total)}</div>
        <div class="result__summary">
          <p class="result__meta">Diagnóstico de ${escapeHtml(name || 'você')} · ${date}</p>
          <p class="phase-badge">Fase ${r.phase.n} de 4 · <strong>${r.phase.name}</strong></p>
          <h2 class="result__headline" id="t-resultado" tabindex="-1">${escapeHtml(headline(r, name))}</h2>
          <p class="result__text">${escapeHtml(r.phase.text)}</p>
          <ol class="phase-track" aria-label="Fases do diagnóstico">${phases}</ol>
        </div>
      </header>

      <section class="result__areas" aria-labelledby="h-areas">
        <div class="result__radar reveal">${radarHTML(r.dims)}</div>
        <div class="result__list">
          <h3 class="result__h" id="h-areas">Sua nota em cada área</h3>
          <p class="result__hint">Da mais fraca pra mais forte. Toque pra ver o que cada nota quer dizer.</p>
          <ul class="areas reveal">${areas}</ul>
        </div>
      </section>

      <section class="result__numbers" aria-labelledby="h-nums">
        <h3 class="result__h reveal" id="h-nums">Seus números</h3>
        <div class="numbers">${numbers}</div>
      </section>

      <section class="result__plan" aria-labelledby="h-plan">
        <h3 class="result__h reveal" id="h-plan">Seu plano começa por aqui</h3>
        <ol class="plan">${plan}</ol>
      </section>

      <section class="result__cta reveal" aria-labelledby="h-cta">
        <svg class="flow-lines result__lines" viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-20 200 C 120 120, 260 260, 420 150 S 620 60, 640 90" stroke="oklch(0.84 0.07 124 / .35)"/>
          <path d="M-20 230 C 160 150, 300 280, 460 170 S 620 110, 640 130" stroke="oklch(0.84 0.07 124 / .2)"/>
        </svg>
        <p class="kicker">${icon('sparkle')}Fase ${r.phase.n} · ${r.phase.name}</p>
        <h3 class="result__cta-title" id="h-cta">O plano da Evofit pra quem está nessa fase</h3>
        <p class="result__cta-text">${escapeHtml(r.phase.plan)} Treino, dieta e suporte no mesmo lugar, por menos de R$ 3,30 por dia.</p>
        <a class="btn btn--shine" href="oferta" data-offer><span class="btn__label">Ver meu plano</span>${icon('arrow-right', 'ico-go')}</a>
        <button type="button" class="link-btn" data-restart>Refazer o diagnóstico</button>
      </section>
    </article>`;
}

/* ------------------------------------------------------------------ painel, faixa e progresso */

const BAND = { hero: '38svh', insight: '24svh', none: '0px' };

/** @param {Step} step */
function bandFor(step) {
  if (step.id === 'hero') return BAND.hero;
  if (step.type === 'insight') return step.id === 'i_prova' ? BAND.none : BAND.insight;
  // Perguntas nunca têm faixa: a posição das opções não muda entre uma pergunta e outra.
  return BAND.none;
}

/** @param {Step} step */
function setPanel(step) {
  const view = step.id === 'hero' ? 'hero' : step.type === 'analise' ? 'analise' : step.type === 'email' ? 'email' : step.type === 'resultado' ? 'resultado' : 'quiz';
  document.body.dataset.view = view;
  const band = bandFor(step);
  layout.style.setProperty('--band', band);
  document.body.dataset.band = band === BAND.none ? 'off' : 'on';
  const group = step.group === 'final' ? (step.type === 'email' ? 'final' : 'none') : step.group;
  $$('.panel__media > [data-group]').forEach((el) => {
    const on = el.dataset.group === group;
    if (on && el instanceof HTMLImageElement && el.dataset.src && !el.src) loadPanelImage(el);
    el.classList.toggle('is-on', on);
  });
  // Pré-carrega a foto da próxima área.
  const nextGroup = STEPS.slice(STEP_INDEX[step.id] + 1).find((s) => s.group !== step.group)?.group;
  const nextImg = nextGroup && $(`.panel__media > img[data-group="${nextGroup}"]`);
  if (nextImg instanceof HTMLImageElement && nextImg.dataset.src && !nextImg.src) loadPanelImage(nextImg);

  const gi = FLOW_GROUPS.indexOf(step.group);
  const meta = step.group === 'final' ? null : groupMeta(step.group);
  const cap = $('.panel__caption');
  if (cap && meta) {
    /** @type {HTMLElement} */ ($('.panel__index', cap)).textContent = `${String(gi + 1).padStart(2, '0')} / ${String(FLOW_GROUPS.length).padStart(2, '0')}`;
    const title = /** @type {HTMLElement} */ ($('.panel__title', cap));
    if (title.textContent !== meta.label) { title.textContent = meta.label; title.classList.remove('swap'); void title.offsetWidth; title.classList.add('swap'); }
  }
  $$('.panel__groups li').forEach((li, i) => {
    li.classList.toggle('is-done', i < gi || step.group === 'final');
    li.classList.toggle('is-current', i === gi);
  });
  if (group === 'agua') updateWaterArt();
}

/** @param {HTMLImageElement} img */
function loadPanelImage(img) {
  img.srcset = img.dataset.srcset || '';
  img.src = img.dataset.src || '';
  delete img.dataset.src;
}

function updateWaterArt() {
  const r = computeResult({ ...S.answers, h_copos: S.answers.h_copos ?? 4 });
  $$('.water-art').forEach((el) => el.style.setProperty('--level', String(Math.max(0.12, Math.min(1, r.water.ratio)))));
}

/** @param {number} i */
function updateProgress(i) {
  const step = STEPS[i];
  const bar = $('.progress');
  const count = $('.topbar__count');
  const inQuiz = step.id !== 'hero' && step.group !== 'final';
  /** @type {HTMLElement} */ ($('.topbar__back')).hidden = step.id === 'hero' || step.type === 'analise' || step.type === 'resultado';
  bar?.toggleAttribute('hidden', !inQuiz);
  count?.toggleAttribute('hidden', !inQuiz);
  if (!inQuiz) return;
  FLOW_GROUPS.forEach((g, gi) => {
    const qs = QUESTIONS.filter((q) => q.group === g);
    const done = qs.filter((q) => STEP_INDEX[q.id] < i).length;
    const seg = /** @type {HTMLElement} */ ($(`.progress__seg[data-g="${gi}"] > span`));
    if (seg) seg.style.transform = `scaleX(${qs.length ? done / qs.length : 0})`;
  });
  const qn = QUESTIONS.findIndex((q) => STEP_INDEX[q.id] >= i);
  const n = qn === -1 ? QUESTIONS.length : qn + 1;
  const now = $('[data-qnow]');
  if (now) now.textContent = String(n);
  bar?.setAttribute('aria-valuenow', String(Math.round(((n - 1) / QUESTIONS.length) * 100)));
}

/* ------------------------------------------------------------------ navegação */

/**
 * Mostra a etapa `i`. `dir` controla o sentido da animação.
 * @param {number} i @param {'fwd'|'back'} [dir]
 */
function go(i, dir = 'fwd') {
  const step = STEPS[i];
  if (!step) return;
  S.i = i;
  persist();
  const current = /** @type {HTMLElement|null} */ (stage.querySelector('.screen.is-active'));
  let next;
  if (step.id === 'hero') {
    next = /** @type {HTMLElement} */ ($('.screen--hero'));
    next.hidden = false;
  } else {
    next = document.createElement('section');
    next.className = `screen screen--${step.type} screen--${step.id}`;
    next.dataset.step = step.id;
    next.setAttribute('aria-labelledby', `t-${step.id}`);
    next.innerHTML = `<div class="screen__inner">${T[step.type](step)}</div>`;
    stage.append(next);
  }
  if (current && current !== next) leave(current, dir);
  next.dataset.dir = dir;
  next.classList.remove('is-leaving');
  next.classList.add('is-active');

  setPanel(step);
  updateProgress(i);
  topbar.dataset.step = step.id;
  window.scrollTo({ top: 0, behavior: 'auto' });
  bind(step, next);
  if (step.id !== 'hero') {
    const title = /** @type {HTMLElement|null} */ (next.querySelector('.q-title, .result__headline'));
    // Foco no título pra leitores de tela acompanharem a troca de tela.
    requestAnimationFrame(() => title?.focus({ preventScroll: true }));
  }
  trackStep(step);
}

/** @param {HTMLElement} el @param {'fwd'|'back'} dir */
function leave(el, dir) {
  el.classList.remove('is-active');
  el.dataset.dir = dir;
  el.classList.add('is-leaving');
  const done = () => {
    if (el.classList.contains('screen--hero')) { el.hidden = true; el.classList.remove('is-leaving'); } else el.remove();
  };
  if (reducedMotion()) done(); else setTimeout(done, 170);
}

/** Próxima etapa navegável a partir de `i`. @param {number} i */
function nextIndex(i) {
  let n = i + 1;
  if (STEPS[n]?.id === 'email' && S.email) n += 1;
  return n;
}

/** Etapa anterior navegável (pula a análise e o e-mail já respondido). @param {number} i */
function prevIndex(i) {
  let p = i - 1;
  while (p > 0 && (STEPS[p].type === 'analise' || (STEPS[p].type === 'email' && S.email))) p -= 1;
  return Math.max(0, p);
}

function advance() {
  busy = false;
  go(nextIndex(S.i), 'fwd');
}

function stepBack() {
  if (S.i <= 0) return;
  busy = false;
  go(prevIndex(S.i), 'back');
}

/* ------------------------------------------------------------------ eventos por tela */

/** @param {Step} step @param {HTMLElement} el */
function bind(step, el) {
  el.querySelector('[data-next]')?.addEventListener('click', () => advance());
  if (step.type === 'single') bindSingle(step, el);
  if (step.type === 'text') bindName(step, el);
  if (step.type === 'range') {
    mountRuler(el, { min: step.min ?? 40, max: step.max ?? 160, value: Number(S.answers.peso) || PESO_DEFAULT[/** @type {'x'} */ (S.answers.sexo)] || PESO_DEFAULT.x, unit: step.unit || 'kg' },
      (v) => { S.answers.peso = v; persist(); });
  }
  if (step.type === 'glasses') {
    const btn = /** @type {HTMLButtonElement} */ (el.querySelector('[data-next]'));
    mountGlasses(el, Number(S.answers.h_copos ?? 0), (v) => {
      S.answers.h_copos = v; persist(); btn.disabled = false; updateWaterArt();
    });
  }
  if (step.id === 'i_sono') {
    const n = /** @type {HTMLElement|null} */ (el.querySelector('[data-count]'));
    if (n) countUp(n, 385, { delay: 350, duration: 1600, format: (v) => `+${Math.round(v)}` });
  }
  if (step.type === 'analise') runAnalysis(el);
  if (step.type === 'email') bindEmail(el);
  if (step.type === 'resultado') bindResult(el);
}

/** @param {Step} step @param {HTMLElement} el */
function bindSingle(step, el) {
  const opts = /** @type {HTMLButtonElement[]} */ ($$('.opt', el));
  const pick = (/** @type {HTMLButtonElement} */ btn, /** @type {MouseEvent|KeyboardEvent} */ ev) => {
    if (busy) return;
    busy = true;
    opts.forEach((o) => { o.setAttribute('aria-checked', String(o === btn)); o.tabIndex = o === btn ? 0 : -1; });
    btn.classList.add('is-picked');
    if (ev instanceof MouseEvent) ripple(btn, ev);
    const v = btn.dataset.v || '';
    S.answers[step.id] = v;
    if (step.id === 'sexo' && !S.answers.peso) S.answers.peso = PESO_DEFAULT[/** @type {'f'} */ (v)] || PESO_DEFAULT.x;
    persist();
    const at = S.i;
    setTimeout(() => { if (S.i === at) advance(); else busy = false; }, reducedMotion() ? 60 : AUTO_ADVANCE_MS);
  };
  opts.forEach((btn, idx) => {
    btn.addEventListener('click', (ev) => pick(btn, ev));
    btn.addEventListener('keydown', (ev) => {
      const k = ev.key;
      if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(k)) return;
      ev.preventDefault();
      const to = k === 'Home' ? 0 : k === 'End' ? opts.length - 1
        : (idx + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : -1) + opts.length) % opts.length;
      opts.forEach((o, i) => { o.tabIndex = i === to ? 0 : -1; });
      opts[to].focus();
    });
  });
}

/** @param {HTMLElement} input @param {HTMLElement} err @param {boolean} show */
function fieldError(input, err, show) {
  err.hidden = !show;
  input.setAttribute('aria-invalid', String(show));
  if (show && !reducedMotion()) { input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake'); }
}

/** @param {Step} step @param {HTMLElement} el */
function bindName(step, el) {
  const form = /** @type {HTMLFormElement} */ (el.querySelector('form'));
  const input = /** @type {HTMLInputElement} */ (form.querySelector('input'));
  const err = /** @type {HTMLElement} */ (form.querySelector('.field-error'));
  if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => input.focus(), 400);
  input.addEventListener('input', () => { if (!err.hidden && firstName(input.value)) fieldError(input, err, false); });
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const n = firstName(input.value);
    if (!n) { fieldError(input, err, true); input.focus(); return; }
    S.answers[step.id] = n;
    persist();
    input.blur();
    advance();
  });
}

/** @param {HTMLElement} el */
function bindEmail(el) {
  const form = /** @type {HTMLFormElement} */ (el.querySelector('form'));
  const input = /** @type {HTMLInputElement} */ (form.querySelector('input'));
  const err = /** @type {HTMLElement} */ (form.querySelector('.field-error'));
  const btn = /** @type {HTMLButtonElement} */ (form.querySelector('button[type="submit"]'));
  input.addEventListener('input', () => { if (!err.hidden && isValidEmail(normalizeEmail(input.value))) fieldError(input, err, false); });
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = normalizeEmail(input.value);
    if (!isValidEmail(email)) { fieldError(input, err, true); input.focus(); return; }
    S.email = email;
    persist();
    btn.classList.add('is-loading');
    tracker.event('email', { email });
    pixel('Lead', { content_name: 'diagnostico' });
    input.blur();
    await wait(reducedMotion() ? 0 : 450);
    advance();
  });
}

/** @param {HTMLElement} el */
async function runAnalysis(el) {
  const r = computeResult(S.answers);
  tracker.update({ scores: r.dims, score_total: r.total, phase: r.phase.n, weakest: r.weakest });
  const lines = $$('.aline', el);
  const pct = /** @type {HTMLElement} */ (el.querySelector('[data-pct]'));
  const bar = /** @type {SVGCircleElement} */ (el.querySelector('.orbit__bar'));
  const per = reducedMotion() ? 120 : 560;
  const C = 2 * Math.PI * 78;
  bar.style.strokeDasharray = `${C}`;
  bar.style.strokeDashoffset = `${C}`;
  for (let i = 0; i < lines.length; i++) {
    lines[i].classList.add('is-active');
    el.querySelector(`.orbit__icon[data-dim="${ANALYSIS_LINES[i].dim}"]`)?.classList.add('is-lit');
    const target = Math.round(((i + 1) / lines.length) * 100);
    countUp(pct, target, { from: Math.round((i / lines.length) * 100), duration: per });
    bar.style.strokeDashoffset = `${C * (1 - target / 100)}`;
    await wait(per);
    lines[i].classList.remove('is-active');
    lines[i].classList.add('is-done');
  }
  await wait(reducedMotion() ? 100 : 500);
  if (STEPS[S.i]?.type === 'analise') advance();
}

/** @param {HTMLElement} el */
function bindResult(el) {
  const r = computeResult(S.answers);
  tracker.event('result');
  const ring = /** @type {HTMLElement} */ (el.querySelector('.ring'));
  requestAnimationFrame(() => requestAnimationFrame(() => ring.classList.add('is-drawn')));
  countUp(/** @type {HTMLElement} */ (el.querySelector('[data-score]')), r.total, { delay: 250, duration: 1800 });
  observeReveal(el);
  el.querySelectorAll('.area__head').forEach((head) => head.addEventListener('click', () => {
    const open = head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(!open));
  }));
  el.querySelector('[data-offer]')?.addEventListener('click', () => pixel('ViewContent', { content_name: 'oferta', value: 97, currency: 'BRL' }));
  el.querySelector('[data-restart]')?.addEventListener('click', () => {
    S.i = 0; S.answers = {}; persist();
    go(STEP_INDEX.sexo, 'back');
  });
}

/* ------------------------------------------------------------------ tracking */

/** @param {Step} step */
function trackStep(step) {
  const a = S.answers;
  tracker.update({
    step_max: STEP_INDEX[step.id],
    step_key: step.id,
    answers: a,
    name: a.nome || undefined,
    gender: a.sexo || undefined,
    age_range: a.idade || undefined,
    goal: a.objetivo || undefined,
    blocker: a.p_bloqueio || undefined,
    weight_kg: a.peso ? Number(a.peso) : undefined,
  });
}

/* ------------------------------------------------------------------ início */

function start() {
  pixel('StartDiagnostico');
  go(STEP_INDEX.sexo, 'fwd');
}

function init() {
  markJs();
  // Métrica nunca pode impedir o quiz de abrir.
  try { initPixel(); } catch (err) { console.warn('[evofit] pixel:', /** @type {Error} */ (err).message); }
  try { if (tracker.hasSession) tracker.resume(); else tracker.start(); } catch (err) { console.warn('[evofit] tracking:', /** @type {Error} */ (err).message); }

  document.addEventListener('touchstart', () => {}, { passive: true });
  $('#start')?.addEventListener('click', start);
  $('.topbar__back')?.addEventListener('click', () => history.back());

  // O "voltar" do navegador volta uma pergunta em vez de sair do quiz.
  history.replaceState({ evofit: 'base' }, '');
  history.pushState({ evofit: 'quiz' }, '');
  addEventListener('popstate', () => {
    if (S.i > 0) { stepBack(); history.pushState({ evofit: 'quiz' }, ''); }
    else history.back();
  });

  if (S.i > 0 && STEPS[S.i]) {
    go(S.i, 'fwd');
  } else {
    document.body.dataset.view = 'hero';
    setPanel(STEPS[0]);
    trackStep(STEPS[0]);
  }
}

init();
