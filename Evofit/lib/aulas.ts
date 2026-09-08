import AULA_VIDEO_URLS from "./aula-video-urls.json";
import AULA_THUMB_URLS from "./aula-thumb-urls.json";

const VIDEO_MAP = AULA_VIDEO_URLS as Record<string, string>;
const THUMB_MAP = AULA_THUMB_URLS as Record<string, string>;

export type AulaCategoria = "Cardio" | "Funcional" | "Muay Thai";

export interface Aula {
  id: string;
  title: string;
  category: AulaCategoria;
  duration: number; // minutos
  description: string;
  emoji: string; // usado como capa quando não há thumbnail
}

// Catálogo de aulas — adicione uma entrada aqui pra cada vídeo gravado.
// O vídeo/capa só aparecem depois de rodar scripts/upload-aulas.mjs com o
// arquivo salvo em public/aulas/videos/<id>.mp4 (e opcionalmente
// public/aulas/thumbs/<id>.jpg).
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

export function getAulaVideo(id: string): string | undefined {
  return VIDEO_MAP[id];
}

export function getAulaThumb(id: string): string | undefined {
  return THUMB_MAP[id];
}
