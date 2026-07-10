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
