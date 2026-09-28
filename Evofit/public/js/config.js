// @ts-check
/**
 * Configuração do diagnóstico. É o único arquivo que muda entre o teste local e a produção.
 *
 * backend:
 *   'auto'     → usa o Supabase quando supabaseUrl e supabaseAnonKey estão preenchidos; senão, o servidor local.
 *   'local'    → força o servidor local (npm start), com banco SQLite em data/.
 *   'supabase' → força o Supabase.
 *
 * A anon key do Supabase é pública por natureza: o banco só aceita o que as funções
 * de supabase/schema.sql permitem. Nunca coloque a service_role key aqui.
 */
export const CONFIG = Object.freeze({
  backend: 'auto',
  supabaseUrl: '',
  supabaseAnonKey: '',

  checkoutUrl: 'https://pay.cakto.com.br/aprvkwz_909423',
  whatsappUrl: 'https://wa.me/551145527512?text=Ol%C3%A1%2C%20estou%20com%20uma%20d%C3%BAvida%20antes%20de%20assinar%20o%20Evofit',
  metaPixelId: '1481794462680728',
  /** O Pixel não carrega em localhost, pra não sujar os dados de anúncio com testes. */
  pixelOnLocalhost: false,
});

/** @returns {'local'|'supabase'} */
export function activeBackend() {
  if (CONFIG.backend === 'local' || CONFIG.backend === 'supabase') return CONFIG.backend;
  return CONFIG.supabaseUrl && CONFIG.supabaseAnonKey ? 'supabase' : 'local';
}

/** Ambiente de teste: localhost, rede local (Wi-Fi de casa) ou nomes .local. */
export const isLocalhost = () => {
  const h = location.hostname;
  return ['localhost', '127.0.0.1', '[::1]'].includes(h) || h.endsWith('.local')
    || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h);
};
