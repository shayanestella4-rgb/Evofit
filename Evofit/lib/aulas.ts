import AULA_THUMB_URLS from "./aula-thumb-urls.json";

const THUMB_MAP = AULA_THUMB_URLS as Record<string, string>;

export type AulaCategoria = "Cardio" | "Funcional" | "Muay Thai";

export interface Aula {
  id: string;
  title: string;
  category?: AulaCategoria;
  duration: number; // minutos
  description?: string;
  emoji: string; // usado como capa quando não há thumbnail nem vídeo
  youtubeId?: string; // id do vídeo no YouTube (não listado) — sem isso, a aula aparece como "em breve"
}

// Catálogo de aulas — vídeos hospedados como "não listado" no YouTube (grátis,
// sem limite de espaço — vídeo longo com áudio não cabe no Vercel Blob).
// Pra publicar uma aula: suba o vídeo no YouTube como não listado e cole o
// id aqui (o trecho depois de "v=" na URL, ex: youtube.com/watch?v=ABC123 → "ABC123").
export const AULAS_CATALOG: Aula[] = [
  { id: "aula-1", title: "Superiores esculpidos",       duration: 16, emoji: "💪", youtubeId: "OoZfL6yTOIU" },
  { id: "aula-2", title: "Combinações intensas",        duration: 15, emoji: "🔥", youtubeId: "hOljFkCbMV0" },
  { id: "aula-3", title: "Superiores fortes",           duration: 17, emoji: "💪", youtubeId: "zqm1XYvYwWM" },
  { id: "aula-4", title: "Pernas desenhadas",           duration: 19, emoji: "🦵", youtubeId: "9OSxSn668Dk" },
  { id: "aula-5", title: "Corpo todo ativo",            duration: 23, emoji: "⚡", youtubeId: "ZZIzQDiSU_w" },
  { id: "aula-6", title: "Superiores incríveis",        duration: 22, emoji: "💪", youtubeId: "oClQXLEtoLg" },
  { id: "aula-7", title: "Abdômen e braços desenhados", duration: 28, emoji: "🎯", youtubeId: "0V-1hzbd4gY" },
  { id: "aula-8", title: "Inferiores desenhados",       duration: 26, emoji: "🦵", youtubeId: "_v28bpJVLXg" },
  { id: "aula-9", title: "Abdômen forte",               duration: 39, emoji: "🎯", youtubeId: "fYy8J8ap8gk" },
  { id: "aula-10", title: "Corpo todo forte",           duration: 33, emoji: "🔥", youtubeId: "BEpldK6XLJY" },
];

/** Capa da aula: usa a miniatura customizada (Blob) se existir, senão a do próprio YouTube, senão cai no emoji. */
export function getAulaThumb(aula: Aula): string | undefined {
  if (THUMB_MAP[aula.id]) return THUMB_MAP[aula.id];
  if (aula.youtubeId) return `https://img.youtube.com/vi/${aula.youtubeId}/hqdefault.jpg`;
  return undefined;
}
