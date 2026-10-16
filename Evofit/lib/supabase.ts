import { createClient } from "@supabase/supabase-js";

// Service role key — acesso privilegiado ao bucket. Só pode ser usado em
// código server-side (API routes), nunca importado num client component.
// Criado sob demanda (não no carregamento do módulo) pra não derrubar o
// build caso as env vars do Supabase ainda não estejam configuradas no
// ambiente — só quebra de verdade se alguém chamar a função sem elas.
const globalForSupabase = globalThis as unknown as { supabase?: ReturnType<typeof createClient> };

function getSupabase() {
  if (!globalForSupabase.supabase) {
    globalForSupabase.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return globalForSupabase.supabase;
}

export const FOTOS_BUCKET = "fotos-evolucao";

export async function uploadPhoto(storagePath: string, buffer: Buffer, contentType: string) {
  return getSupabase().storage.from(FOTOS_BUCKET).upload(storagePath, buffer, { contentType });
}

/** Assinatura temporária (1h) pra exibir uma foto privada do bucket. */
export async function getSignedPhotoUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await getSupabase().storage
    .from(FOTOS_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export async function deletePhotoFile(storagePath: string) {
  return getSupabase().storage.from(FOTOS_BUCKET).remove([storagePath]);
}
