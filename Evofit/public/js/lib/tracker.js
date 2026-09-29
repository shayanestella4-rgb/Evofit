// @ts-check
import { CONFIG, activeBackend } from '../config.js';

/**
 * Tracking do funil. Fala o formato de RPC do Supabase (POST /rest/v1/rpc/<função>);
 * o servidor local (server/server.mjs) responde nas mesmas rotas, então este código
 * é o mesmo nos dois ambientes. Tudo é "fire and forget": nunca trava a interface.
 *
 * @typedef {{
 *   step_max?: number, step_key?: string, answers?: Record<string, unknown>,
 *   name?: string, gender?: string, age_range?: string, goal?: string, blocker?: string, weight_kg?: number,
 *   scores?: Record<string, number|null>, score_total?: number, phase?: number, weakest?: string,
 *   email?: string, whatsapp?: string, duration_s?: number, event?: 'email'|'result'|'offer'|'buy'
 * }} TrackPatch
 */

const SID_KEY = 'evofit.sid';
const START_KEY = 'evofit.startedAt';
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|lighthouse/i;

/** @param {string} key */
function readSession(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
/** @param {string} key @param {string} value */
function writeSession(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* modo privado: segue sem persistir */ }
}

/** @param {string} fn */
function endpoint(fn) {
  if (activeBackend() === 'supabase') return `${CONFIG.supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/${fn}`;
  return `${location.origin}/rest/v1/rpc/${fn}`;
}

function headers() {
  const key = activeBackend() === 'supabase' ? CONFIG.supabaseAnonKey : 'local';
  return { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` };
}

/**
 * UUID v4. crypto.randomUUID só existe em página segura (HTTPS ou localhost);
 * pelo IP da rede local a página não é "segura", então cai no getRandomValues.
 */
function uuidv4() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function deviceType() {
  if (matchMedia('(max-width: 767px)').matches) return 'mobile';
  if (matchMedia('(max-width: 1100px) and (pointer: coarse)').matches) return 'tablet';
  return 'desktop';
}

const UTM_KEY = 'evofit.utm';

/** Parâmetros utm_* da URL; guardados na aba pra seguirem até a página de oferta. */
function utm() {
  const q = new URLSearchParams(location.search);
  /** @type {Record<string,string>} */
  const out = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const v = q.get(k);
    if (v) out[k] = v.slice(0, 120);
  }
  if (Object.keys(out).length) {
    writeSession(UTM_KEY, JSON.stringify(out));
    return out;
  }
  try { return JSON.parse(readSession(UTM_KEY) || '{}'); } catch { return {}; }
}

function referrerHost() {
  try { return document.referrer ? new URL(document.referrer).hostname.slice(0, 120) : ''; } catch { return ''; }
}

class Tracker {
  constructor() {
    this.enabled = !BOT_UA.test(navigator.userAgent);
    /** @type {string|null} */
    this.sid = readSession(SID_KEY);
    this.startedAt = Number(readSession(START_KEY)) || Date.now();
    /** @type {Promise<unknown>} */
    this.queue = Promise.resolve();
    this.failures = 0;
    this.watching = false;
  }

  get hasSession() { return Boolean(this.sid); }

  seconds() { return Math.round((Date.now() - this.startedAt) / 1000); }

  /**
   * Envia em fila, na ordem em que as chamadas acontecem.
   * @param {string} fn @param {Record<string, unknown>} body @param {boolean} [keepalive]
   */
  send(fn, body, keepalive = false) {
    if (!this.enabled || !this.sid) return this.queue;
    const run = () => fetch(endpoint(fn), { method: 'POST', headers: headers(), body: JSON.stringify(body), keepalive })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.failures = 0;
      })
      .catch((err) => {
        this.failures += 1;
        // Só registra no console: a pessoa não pode ser travada por falha de métrica.
        if (this.failures <= 3) console.warn('[evofit] tracking falhou:', fn, err.message);
      });
    this.queue = this.queue.then(run, run);
    return this.queue;
  }

  /** Cria a sessão, se ainda não existe nesta aba. */
  start() {
    if (!this.enabled || this.sid) return this.queue;
    try {
      this.sid = uuidv4();
    } catch (err) {
      // Sem ID não há tracking, mas o quiz segue funcionando normalmente.
      console.warn('[evofit] tracking desligado:', /** @type {Error} */ (err).message);
      this.enabled = false;
      return this.queue;
    }
    this.startedAt = Date.now();
    writeSession(SID_KEY, this.sid);
    writeSession(START_KEY, String(this.startedAt));
    this.send('quiz_start', {
      p_sid: this.sid,
      p_meta: { ...utm(), referrer: referrerHost(), device: deviceType(), landing: location.pathname.slice(0, 120) },
    });
    this.watchDuration();
    return this.queue;
  }

  /** Retoma a sessão salva (depois de recarregar a página ou na página de oferta). */
  resume() {
    if (this.sid) this.watchDuration();
    return this.hasSession;
  }

  /** @param {TrackPatch} patch @param {boolean} [keepalive] */
  update(patch, keepalive = false) {
    return this.send('quiz_track', { p_sid: this.sid, p_data: { ...patch, duration_s: this.seconds() } }, keepalive);
  }

  /** @param {'email'|'result'|'offer'|'buy'} name @param {TrackPatch} [extra] */
  event(name, extra = {}) {
    return this.update({ ...extra, event: name }, name === 'buy');
  }

  watchDuration() {
    if (this.watching) return;
    this.watching = true;
    const flush = () => this.update({}, true);
    setInterval(() => { if (document.visibilityState === 'visible') flush(); }, 20000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
    addEventListener('pagehide', flush);
  }
}

export const tracker = new Tracker();

/** Mantém os parâmetros utm_* no link de checkout, pra atribuição de venda. @param {string} url */
export function withUtm(url) {
  const params = utm();
  if (!Object.keys(params).length) return url;
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) if (!u.searchParams.has(k)) u.searchParams.set(k, v);
  return u.toString();
}
