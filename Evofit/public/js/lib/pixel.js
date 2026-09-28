// @ts-check
import { CONFIG, isLocalhost } from '../config.js';

/**
 * Meta Pixel carregado fora do caminho crítico (requestIdleCallback), com a fila
 * padrão do fbq criada na hora pra nenhum evento se perder antes do script chegar.
 */
export function initPixel() {
  if (!CONFIG.metaPixelId || (isLocalhost() && !CONFIG.pixelOnLocalhost)) return;
  const w = /** @type {any} */ (window);
  if (w.fbq) return;
  const fbq = function (...args) { fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args); };
  fbq.queue = /** @type {unknown[]} */ ([]);
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.push = fbq;
  /** @type {any} */ (fbq).callMethod = null;
  w.fbq = fbq;
  w._fbq = fbq;
  fbq('init', CONFIG.metaPixelId);
  fbq('track', 'PageView');

  const load = () => {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.append(s);
  };
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 3000 });
  else setTimeout(load, 300);
}

/** @param {string} event @param {Record<string, unknown>} [params] */
export function pixel(event, params) {
  const fbq = /** @type {any} */ (window).fbq;
  if (!fbq) return;
  const standard = ['PageView', 'Lead', 'ViewContent', 'InitiateCheckout', 'CompleteRegistration'];
  fbq(standard.includes(event) ? 'track' : 'trackCustom', event, params);
}
