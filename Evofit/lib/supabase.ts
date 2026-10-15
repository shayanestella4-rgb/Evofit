import { createClient } from "@supabase/supabase-js";

// Service role key — acesso privilegiado ao bucket. Só pode ser usado em
// código server-side (API routes), nunca importado num client component.
const globalForSupabase = globalThis as unknown as { supabase: ReturnType<typeof createClient> };

function createSupabaseClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export const supabase = globalForSupabase.supabase ?? createSupabaseClient();

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;

export const FOTOS_BUCKET = "fotos-evolucao";

/** Assinatura temporária (1h) pra exibir uma foto privada do bucket. */
export async function getSignedPhotoUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(FOTOS_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
