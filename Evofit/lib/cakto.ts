const BASE = "https://api.cakto.com.br/public_api";

export async function getToken(): Promise<string> {
  const res = await fetch(`${BASE}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.CAKTO_CLIENT_ID!,
      client_secret: process.env.CAKTO_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`Cakto token error: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function hasActiveSubscription(
  email: string,
  token?: string
): Promise<boolean> {
  const t = token ?? (await getToken());

  const url = new URL(`${BASE}/subscriptions/`);
  url.searchParams.set("search", email);
  url.searchParams.set("status", "active");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
  });

  if (!res.ok) return false;

  const data = await res.json();
  if (!data.results?.length) return false;

  // confirma que a assinatura pertence ao e-mail buscado
  return data.results.some(
    (sub: { customer?: { email?: string } }) =>
      sub.customer?.email?.toLowerCase() === email.toLowerCase()
  );
}

interface CaktoSubscription {
  id: string;
  status: string;
  customer?: { email?: string };
}

/** Busca a assinatura ativa da Cakto pelo e-mail — devolve o id (UUID) usado pra cancelar. */
export async function findActiveSubscriptionId(
  email: string,
  token?: string
): Promise<string | null> {
  const t = token ?? (await getToken());

  const url = new URL(`${BASE}/subscriptions/`);
  url.searchParams.set("search", email);
  url.searchParams.set("status", "active");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const match = (data.results as CaktoSubscription[] | undefined)?.find(
    (sub) => sub.customer?.email?.toLowerCase() === email.toLowerCase()
  );
  return match?.id ?? null;
}

/** Cancela definitivamente a assinatura na Cakto (para as cobranças futuras). */
export async function cancelSubscription(
  subscriptionId: string,
  token?: string
): Promise<{ ok: boolean; detail?: string; status?: string }> {
  const t = token ?? (await getToken());

  const res = await fetch(`${BASE}/subscriptions/${subscriptionId}/cancel/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${t}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, detail: data.detail ?? `Erro ${res.status}` };
  }
  return { ok: true, detail: data.detail, status: data.status };
}
