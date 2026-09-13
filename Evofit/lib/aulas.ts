import AULA_THUMB_URLS from "./aula-thumb-urls.json";

const THUMB_MAP = AULA_THUMB_URLS as Record<string, string>;

export type AulaCategoria = "Cardio" | "Funcional" | "Muay Thai";

export interface Aula {
  id: string;
  title: string;
  category: AulaCategoria;
  duration: number; // minutos
  description: string;
  emoji: string; // usado como capa quando não há thumbnail nem vídeo
  youtubeId?: string; // id do vídeo no YouTube (não listado) — sem isso, a aula aparece como "em breve"
}

// Catálogo de aulas — vídeos hospedados como "não listado" no YouTube (grátis,
// sem limite de espaço — vídeo longo com áudio não cabe no Vercel Blob).
// Pra publicar uma aula: suba o vídeo no YouTube como não listado e cole o
// id aqui (o trecho depois de "v=" na URL, ex: youtube.com/watch?v=ABC123 → "ABC123").
export const AULAS_CATALOG: Aula[] = [
  {
    id: "cardio-20min",
    title: "Cardio Intenso",
    category: "Cardio",
    duration: 20,
    description: "Treino cardiovascular pra fazer em casa, sem equipamento — eleva a frequência cardíaca e queima calorias extras.",
    emoji: "🏃",
  },
  {
    id: "funcional-30min",
    title: "Funcional Corpo Inteiro",
    category: "Funcional",
    duration: 30,
    description: "Movimentos funcionais trabalhando força, equilíbrio e resistência — sem precisar de academia.",
    emoji: "⚡",
  },
  {
    id: "muaythai-40min",
    title: "Muay Thai Fundamentos",
    category: "Muay Thai",
    duration: 40,
    description: "Golpes e combinações básicas de Muay Thai num formato de treino — condicionamento e técnica juntos.",
    emoji: "🥊",
  },
];

/** Capa da aula: usa a miniatura customizada (Blob) se existir, senão a do próprio YouTube, senão cai no emoji. */
export function getAulaThumb(aula: Aula): string | undefined {
  if (THUMB_MAP[aula.id]) return THUMB_MAP[aula.id];
  if (aula.youtubeId) return `https://img.youtube.com/vi/${aula.youtubeId}/hqdefault.jpg`;
  return undefined;
}
