// Motor do "Diagnóstico Evofit" — quiz de 23 perguntas que dá uma nota de
// 0 a 100 em 7 áreas, calcula uma fase (Despertar/Construção/Ritmo/Evolução)
// e gera textos personalizados por combinação de resposta. Portado do projeto
// separado "Diagnóstico Evofit" (HTML/JS puro) para dentro do app React.
// Tudo aqui é função pura das respostas — sem efeitos colaterais.

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type DimKey = "rotina" | "disciplina" | "sono" | "alimentacao" | "praticidade" | "agua" | "resistencia";

export interface Dimension {
  key: DimKey;
  label: string;
  icon: string; // emoji
}

export interface Option {
  v: string;
  label: string;
  s?: number;
  icon?: string;
  swatch?: string;
}

export type StepType = "single" | "text" | "range" | "glasses" | "insight" | "analise" | "email" | "resultado";

export interface Step {
  id: string;
  type: StepType;
  group: "perfil" | DimKey | "final";
  title?: string;
  sub?: string;
  options?: Option[];
  layout?: "list" | "cards" | "chips" | "swatch";
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
  scored?: boolean;
}

export type Answers = Record<string, string | number | undefined>;

// ─── Áreas avaliadas ───────────────────────────────────────────────────────────

export const DIMENSIONS: Dimension[] = [
  { key: "rotina", label: "Rotina", icon: "📅" },
  { key: "disciplina", label: "Disciplina", icon: "🎯" },
  { key: "sono", label: "Sono", icon: "😴" },
  { key: "alimentacao", label: "Alimentação", icon: "🍽️" },
  { key: "praticidade", label: "Praticidade", icon: "🏋️" },
  { key: "agua", label: "Água", icon: "💧" },
  { key: "resistencia", label: "Resistência", icon: "🏃" },
];

export const DIM: Record<DimKey, Dimension> = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d])) as Record<DimKey, Dimension>;

export const PERFIL_GROUP = { key: "perfil", label: "Seu perfil", icon: "👤" };

/** Faixas de nota por área. */
export const BANDS = [
  { key: "critico", label: "Crítico", min: 0 },
  { key: "atencao", label: "Atenção", min: 40 },
  { key: "forte", label: "Forte", min: 70 },
];

/** Fases da nota geral. */
export const PHASES = [
  {
    n: 1, key: "despertar", name: "Despertar", min: 0,
    text: "Seu corpo está pedindo atenção em várias frentes ao mesmo tempo. A boa notícia é que quem começa daqui sente diferença rápido, porque cada passo pequeno já conta.",
    plan: "Começar pequeno: treinos curtos, sono e água antes de qualquer dieta radical.",
  },
  {
    n: 2, key: "construcao", name: "Construção", min: 40,
    text: "Você já tem algumas peças no lugar, mas outras estão puxando sua energia pra baixo. É a fase em que ter um plano faz mais diferença.",
    plan: "Firmar a base: treino com dia marcado e ajuste nas duas áreas mais fracas.",
  },
  {
    n: 3, key: "ritmo", name: "Ritmo", min: 60,
    text: "Sua base é boa. O que falta é constância nas áreas mais fracas pra transformar esforço em resultado que aparece no espelho.",
    plan: "Ganhar constância: treino progressivo e ajuste fino na alimentação.",
  },
  {
    n: 4, key: "evolucao", name: "Evolução", min: 80,
    text: "Você está acima da média na maioria das áreas. Agora o ganho vem de ajuste fino e de um plano que acompanhe a sua evolução.",
    plan: "Evoluir de nível: treinos mais intensos e metas de força e definição.",
  },
];

export const WATER_ML_PER_KG = 35;
export const GLASS_ML = 250;
export const GLASSES_MAX = 12;

// ─── Perguntas ──────────────────────────────────────────────────────────────

export const STEPS: Step[] = [
  { id: "hero", type: "insight", group: "perfil" },

  // Perfil
  {
    id: "sexo", type: "single", group: "perfil", layout: "cards",
    title: "Pra começar, como você se identifica?",
    options: [
      { v: "f", label: "Mulher", icon: "👩" },
      { v: "m", label: "Homem", icon: "👨" },
      { v: "x", label: "Prefiro não dizer", icon: "🙂" },
    ],
  },
  {
    id: "idade", type: "single", group: "perfil", layout: "chips",
    title: "Qual a sua idade?",
    options: [
      { v: "18-24", label: "18 a 24" },
      { v: "25-34", label: "25 a 34" },
      { v: "35-44", label: "35 a 44" },
      { v: "45-54", label: "45 a 54" },
      { v: "55+", label: "55 ou mais" },
    ],
  },
  {
    id: "objetivo", type: "single", group: "perfil",
    title: "O que você mais quer mudar agora?",
    options: [
      { v: "emagrecer", label: "Emagrecer e desinchar", icon: "🔥" },
      { v: "energia", label: "Ter mais energia no dia a dia", icon: "⚡" },
      { v: "condicionamento", label: "Ganhar fôlego e condicionamento", icon: "💓" },
      { v: "musculo", label: "Definir e ganhar músculo", icon: "💪" },
      { v: "saude", label: "Cuidar da saúde pra valer", icon: "❤️" },
    ],
  },
  {
    id: "nome", type: "text", group: "perfil",
    title: "Como posso te chamar?",
    sub: "Seu diagnóstico sai com o seu nome.",
    placeholder: "Seu primeiro nome",
  },

  // Rotina
  {
    id: "r_dia", type: "single", group: "rotina", scored: true,
    title: "{nome}, como é um dia comum na sua vida?",
    options: [
      { v: "fixo", label: "Tenho horários e sigo quase sempre", s: 100 },
      { v: "base", label: "Tenho uma base, mas improviso bastante", s: 65 },
      { v: "variavel", label: "Cada dia é diferente: turno, viagem, filhos", s: 30 },
      { v: "caos", label: "Vivo apagando incêndio, não sobra tempo pra nada", s: 5 },
    ],
  },
  {
    id: "r_plano", type: "single", group: "rotina", scored: true,
    title: "Você organiza a semana antes dela começar?",
    sub: "Treino, refeições, compromissos.",
    options: [
      { v: "sempre", label: "Sim, toda semana", s: 100 },
      { v: "asvezes", label: "Às vezes, quando lembro", s: 60 },
      { v: "raro", label: "Quase nunca, resolvo no dia", s: 25 },
      { v: "nunca", label: "Nunca", s: 0 },
    ],
  },

  // Sono
  {
    id: "s_horas", type: "single", group: "sono", scored: true,
    title: "Quantas horas você dorme numa noite normal?",
    options: [
      { v: "<5", label: "Menos de 5 horas", s: 5 },
      { v: "5-6", label: "Entre 5 e 6 horas", s: 35 },
      { v: "6-7", label: "Entre 6 e 7 horas", s: 65 },
      { v: "7-9", label: "Entre 7 e 9 horas", s: 100 },
      { v: "9+", label: "Mais de 9 horas", s: 70 },
    ],
  },
  {
    id: "s_regular", type: "single", group: "sono", scored: true,
    title: "No fim de semana, seu horário de dormir muda muito?",
    options: [
      { v: "igual", label: "Quase nada, durmo e acordo no mesmo horário", s: 100 },
      { v: "1-2h", label: "Muda umas 1 ou 2 horas", s: 65 },
      { v: "3h+", label: "Muda 3 horas ou mais", s: 25 },
      { v: "sem", label: "Não tenho horário nem durante a semana", s: 0 },
    ],
  },
  {
    id: "s_acordar", type: "single", group: "sono", scored: true,
    title: "E como você costuma acordar?",
    options: [
      { v: "energia", label: "Com energia, levanto de boa", s: 100 },
      { v: "devagar", label: "Devagar, mas engreno depois do café", s: 60 },
      { v: "sono", label: "Com sono, querendo mais uma hora", s: 25 },
      { v: "exausto", label: "Com a sensação de que nem dormi", s: 0 },
    ],
  },
  { id: "i_sono", type: "insight", group: "sono" },

  // Alimentação
  {
    id: "a_ultra", type: "single", group: "alimentacao", scored: true,
    title: "Quantos dias por semana entram ultraprocessados na sua rotina?",
    sub: "Biscoito recheado, salgadinho, fast food, refrigerante, congelado pronto.",
    options: [
      { v: "nunca", label: "Quase nunca", s: 100 },
      { v: "1-2", label: "1 ou 2 dias", s: 70 },
      { v: "3-5", label: "3 a 5 dias", s: 30 },
      { v: "todo", label: "Todo dia", s: 0 },
    ],
  },
  {
    id: "a_verde", type: "single", group: "alimentacao", scored: true,
    title: "E fruta, verdura e legume, com que frequência aparecem no seu prato?",
    options: [
      { v: "sempre", label: "Em quase todas as refeições", s: 100 },
      { v: "1x", label: "Pelo menos uma vez por dia", s: 65 },
      { v: "semana", label: "Algumas vezes na semana", s: 30 },
      { v: "raro", label: "Raramente", s: 0 },
    ],
  },
  {
    id: "a_emocional", type: "single", group: "alimentacao", scored: true,
    title: "Quando bate estresse, ansiedade ou tédio, o que acontece com a comida?",
    options: [
      { v: "nada", label: "Nada muda, como igual", s: 100 },
      { v: "exagero", label: "Às vezes eu exagero", s: 55 },
      { v: "desconto", label: "Quase sempre desconto na comida", s: 15 },
      { v: "esqueco", label: "Perco a fome e passo o dia sem comer", s: 40 },
    ],
  },

  // Água
  {
    id: "h_copos", type: "glasses", group: "agua", scored: true,
    title: "Quantos copos de água você bebe num dia comum?",
    sub: "Conte só água. Cada copo tem 250 ml.",
    min: 0, max: GLASSES_MAX,
  },
  {
    id: "h_urina", type: "single", group: "agua", layout: "swatch", scored: true,
    title: "Qual a cor da sua urina na maior parte do dia?",
    sub: "Parece estranho, mas é o jeito mais rápido de saber se falta água no seu corpo.",
    options: [
      { v: "palha", label: "Clarinha, cor de palha", s: 100, swatch: "#F5EFC8" },
      { v: "clara", label: "Amarelo-clara", s: 75, swatch: "#EBDD8E" },
      { v: "escura", label: "Amarelo-escura", s: 30, swatch: "#D8B968" },
      { v: "cha", label: "Cor de chá, bem escura", s: 0, swatch: "#9C7233" },
    ],
  },
  {
    id: "peso", type: "range", group: "agua",
    title: "Quanto você pesa, mais ou menos?",
    sub: "É com esse número que a gente calcula quanta água o seu corpo pede por dia.",
    min: 40, max: 160, unit: "kg",
  },
  { id: "i_agua", type: "insight", group: "agua" },

  // Praticidade
  {
    id: "p_tempo", type: "single", group: "praticidade", scored: true,
    title: "Quanto tempo livre você consegue separar pra treinar, de verdade?",
    options: [
      { v: "<15", label: "Menos de 15 minutos", s: 25 },
      { v: "15-30", label: "De 15 a 30 minutos", s: 60 },
      { v: "30-45", label: "De 30 a 45 minutos", s: 85 },
      { v: "60+", label: "1 hora ou mais", s: 100 },
    ],
  },
  {
    id: "p_local", type: "single", group: "praticidade", scored: true,
    title: "Onde seria mais fácil você treinar hoje?",
    options: [
      { v: "academia", label: "Na academia, tenho uma perto", s: 100, icon: "🏋️" },
      { v: "casa-equip", label: "Em casa, tenho algum equipamento", s: 85, icon: "🏠" },
      { v: "casa", label: "Em casa, sem equipamento nenhum", s: 60, icon: "🏠" },
      { v: "rua", label: "Ao ar livre, na rua ou no parque", s: 70, icon: "🌳" },
      { v: "nenhum", label: "Hoje não tenho onde treinar", s: 15, icon: "❓" },
    ],
  },
  {
    id: "p_bloqueio", type: "single", group: "praticidade", scored: true,
    title: "O que mais te impede de treinar hoje?",
    options: [
      { v: "tempo", label: "Falta de tempo", s: 30, icon: "⏰" },
      { v: "cansaco", label: "Cansaço no fim do dia", s: 40, icon: "🔋" },
      { v: "sabe", label: "Não sei o que fazer nem como montar um treino", s: 45, icon: "❓" },
      { v: "dinheiro", label: "Academia e personal são caros", s: 45, icon: "💰" },
      { v: "vergonha", label: "Vergonha de começar do zero", s: 55, icon: "😬" },
      { v: "nada", label: "Nada, já treino com frequência", s: 100, icon: "✅" },
    ],
  },

  // Resistência
  {
    id: "e_escada", type: "single", group: "resistencia", scored: true,
    title: "Se você subir 3 andares de escada no seu ritmo, como chega lá em cima?",
    options: [
      { v: "boa", label: "De boa, dá pra conversar normal", s: 100 },
      { v: "leve", label: "Um pouco ofegante, mas bem", s: 65 },
      { v: "forte", label: "Bem ofegante, preciso parar um pouco", s: 30 },
      { v: "evito", label: "Evito escada, não aguento", s: 0 },
    ],
  },
  {
    id: "e_caminhada", type: "single", group: "resistencia", scored: true,
    title: "Quanto tempo você aguenta caminhar em ritmo acelerado sem parar?",
    options: [
      { v: "30+", label: "Mais de 30 minutos", s: 100 },
      { v: "15-30", label: "De 15 a 30 minutos", s: 70 },
      { v: "5-15", label: "De 5 a 15 minutos", s: 35 },
      { v: "<5", label: "Menos de 5 minutos", s: 5 },
    ],
  },
  { id: "i_prova", type: "insight", group: "resistencia" },

  // Disciplina
  {
    id: "d_freq", type: "single", group: "disciplina", scored: true,
    title: "Hoje, quantos dias por semana você se exercita?",
    options: [
      { v: "0", label: "Nenhum", s: 0 },
      { v: "1-2", label: "1 ou 2 dias", s: 40 },
      { v: "3-4", label: "3 ou 4 dias", s: 80 },
      { v: "5+", label: "5 dias ou mais", s: 100 },
    ],
  },
  {
    id: "d_recomeco", type: "single", group: "disciplina", scored: true,
    title: "Quantas vezes você já começou um treino ou uma dieta e parou no meio?",
    options: [
      { v: "manteve", label: "Comecei e mantive", s: 100 },
      { v: "poucas", label: "Uma ou duas vezes", s: 60 },
      { v: "varias", label: "Já perdi as contas", s: 15 },
      { v: "nunca", label: "Nunca cheguei a começar", s: 35 },
    ],
  },
  {
    id: "d_falha", type: "single", group: "disciplina", scored: true,
    title: "Quando você perde um treino ou sai da dieta, o que costuma acontecer?",
    options: [
      { v: "volta", label: "Volto no dia seguinte, normal", s: 100 },
      { v: "dias", label: "Levo uns dias pra retomar", s: 55 },
      { v: "semana", label: "Largo o resto da semana", s: 20 },
      { v: "para", label: "Viro a chave e paro de vez", s: 0 },
    ],
  },

  { id: "analise", type: "analise", group: "final" },
  { id: "email", type: "email", group: "final" },
  { id: "resultado", type: "resultado", group: "final" },
];

export const STEP: Record<string, Step> = Object.fromEntries(STEPS.map((s) => [s.id, s]));
export const STEP_INDEX: Record<string, number> = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));

/** Perguntas que a pessoa responde (sem telas de transição). */
export const QUESTIONS = STEPS.filter((s) => ["single", "text", "range", "glasses"].includes(s.type));

/** Grupos na ordem em que aparecem no quiz (barra de progresso). */
export const FLOW_GROUPS: (DimKey | "perfil")[] = ["perfil", "rotina", "sono", "alimentacao", "agua", "praticidade", "resistencia", "disciplina"];

function stepLabel(s: Step): string {
  const fixed: Record<string, string> = {
    hero: "Abriu o quiz", i_sono: "Tela: sono e fome", i_agua: "Tela: meta de água", i_prova: "Tela: resultados reais",
    analise: "Análise", email: "Pediu o e-mail", resultado: "Viu o resultado", nome: "Nome",
  };
  if (fixed[s.id]) return fixed[s.id];
  const t = (s.title || s.id).replace("{nome}, ", "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Rótulo curto de cada passo — usado no funil do painel de métricas. */
export function stepLabelByIndex(index: number): string {
  const s = STEPS[index];
  return s ? stepLabel(s) : `Passo ${index}`;
}

export const TOTAL_STEPS = STEPS.length;

/** Textos curtos usados nas explicações do resultado. */
export const PHRASES: Record<string, Record<string, string>> = {
  s_horas: { "<5": "menos de 5 horas", "5-6": "entre 5 e 6 horas", "6-7": "entre 6 e 7 horas", "7-9": "entre 7 e 9 horas", "9+": "mais de 9 horas" },
  s_acordar: { energia: "com energia", devagar: "devagar", sono: "com sono", exausto: "com a sensação de que nem dormiu" },
  a_ultra: { nunca: "quase nunca", "1-2": "1 ou 2 dias por semana", "3-5": "de 3 a 5 dias por semana", todo: "todo dia" },
  a_verde: { sempre: "em quase toda refeição", "1x": "uma vez por dia", semana: "só algumas vezes na semana", raro: "raramente" },
  p_tempo: { "<15": "menos de 15 minutos", "15-30": "de 15 a 30 minutos", "30-45": "de 30 a 45 minutos", "60+": "1 hora ou mais" },
  p_bloqueio: { tempo: "a falta de tempo", cansaco: "o cansaço no fim do dia", sabe: "não saber o que fazer no treino", dinheiro: "o preço de academia e personal", vergonha: "a vergonha de começar do zero", nada: "" },
  d_freq: { "0": "nenhum dia", "1-2": "1 ou 2 dias", "3-4": "3 ou 4 dias", "5+": "5 dias ou mais" },
  objetivo: { emagrecer: "emagrecer", energia: "ter mais energia", condicionamento: "ganhar fôlego", musculo: "definir e ganhar músculo", saude: "cuidar da saúde" },
};

/** Etapas mostradas na tela de análise, na ordem do quiz. */
export const ANALYSIS_LINES: { dim: DimKey; text: string }[] = [
  { dim: "rotina", text: "Organizando sua rotina" },
  { dim: "sono", text: "Avaliando seu sono" },
  { dim: "alimentacao", text: "Olhando o seu prato" },
  { dim: "agua", text: "Calculando sua meta de água" },
  { dim: "praticidade", text: "Vendo onde o treino cabe" },
  { dim: "resistencia", text: "Checando o seu fôlego" },
  { dim: "disciplina", text: "Medindo a sua constância" },
];

// ─── Pontuação ──────────────────────────────────────────────────────────────

export const PESO_DEFAULT: Record<string, number> = { f: 65, m: 80, x: 70 };

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function waterTargetL(peso: unknown): number {
  const kg = clamp(Number(peso) || 0, 30, 200);
  return Math.round((kg * WATER_ML_PER_KG) / 100) / 10;
}

export function waterIntakeL(copos: unknown): number {
  const n = clamp(Math.round(Number(copos) || 0), 0, GLASSES_MAX);
  return (n * GLASS_ML) / 1000;
}

export function waterIntakeScore(copos: unknown, peso: unknown): number {
  const target = waterTargetL(peso);
  if (!target) return 0;
  return clamp(Math.round((waterIntakeL(copos) / target) * 100), 0, 100);
}

export function answerScore(stepId: string, answers: Answers): number | null {
  const step = STEP[stepId];
  if (!step || !step.scored) return null;
  const value = answers[stepId];
  if (value === undefined || value === null || value === "") return null;
  if (step.type === "glasses") return waterIntakeScore(value, answers.peso ?? PESO_DEFAULT.x);
  const opt = step.options?.find((o) => o.v === value);
  return opt && typeof opt.s === "number" ? opt.s : null;
}

export function bandOf(score: number | null) {
  if (score === null || Number.isNaN(score)) return null;
  let band = BANDS[0];
  for (const b of BANDS) if (score >= b.min) band = b;
  return band;
}

export function phaseOf(total: number) {
  let phase = PHASES[0];
  for (const p of PHASES) if (total >= p.min) phase = p;
  return phase;
}

export function isComplete(answers: Answers): boolean {
  return STEPS.every((s) => !s.scored || answerScore(s.id, answers) !== null) && Number(answers.peso) > 0;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export interface Result {
  dims: Record<DimKey, number | null>;
  total: number;
  phase: (typeof PHASES)[number];
  bands: Record<DimKey, ReturnType<typeof bandOf>>;
  ranked: DimKey[];
  weakest: DimKey;
  strongest: DimKey;
  water: { targetL: number; intakeL: number; ratio: number };
}

export function computeResult(answers: Answers): Result {
  const buckets: Record<string, number[]> = {};
  for (const s of STEPS) {
    const score = answerScore(s.id, answers);
    if (score === null) continue;
    (buckets[s.group] ||= []).push(score);
  }
  const dims = {} as Record<DimKey, number | null>;
  const bands = {} as Record<DimKey, ReturnType<typeof bandOf>>;
  for (const d of DIMENSIONS) {
    const xs = buckets[d.key];
    dims[d.key] = xs && xs.length ? Math.round(mean(xs)) : null;
    bands[d.key] = bandOf(dims[d.key]);
  }
  const answered = DIMENSIONS.filter((d) => dims[d.key] !== null);
  const total = answered.length ? Math.round(mean(answered.map((d) => dims[d.key] as number))) : 0;
  const ranked = answered.map((d) => d.key).sort((a, b) => (dims[a] as number) - (dims[b] as number));
  const targetL = waterTargetL(answers.peso ?? PESO_DEFAULT.x);
  const intakeL = waterIntakeL(answers.h_copos ?? 0);
  return {
    dims,
    total,
    phase: phaseOf(total),
    bands,
    ranked,
    weakest: ranked[0],
    strongest: ranked[ranked.length - 1],
    water: { targetL, intakeL, ratio: targetL ? intakeL / targetL : 0 },
  };
}

// ─── Formatação ─────────────────────────────────────────────────────────────

const NF1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const fmtLiters = (l: number) => `${NF1.format(l)} L`;

export function firstName(raw: unknown): string {
  const first = String(raw ?? "").normalize("NFC").trim().split(/\s+/)[0] || "";
  const clean = first.replace(/[^\p{L}'-]/gu, "").slice(0, 24);
  if (clean.length < 2) return "";
  return clean
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|[-'])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase("pt-BR"));
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
export const normalizeEmail = (v: unknown) => String(v ?? "").trim().toLowerCase();
export const isValidEmail = (v: string) => v.length <= 254 && EMAIL_RE.test(v);

// ─── Insights personalizados do resultado ──────────────────────────────────

export const DIM_IN_SENTENCE: Record<DimKey, string> = {
  rotina: "a rotina",
  disciplina: "a constância",
  sono: "o sono",
  alimentacao: "a alimentação",
  praticidade: "a falta de praticidade pra treinar",
  agua: "a água",
  resistencia: "o fôlego",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const val = (a: Answers, id: string) => String(a[id] ?? "");
const good = (a: Answers, id: string) => (answerScore(id, a) ?? 0) >= 60;
const join = (first: string, second: string, agree: boolean) => (agree ? `${first} e ${second}` : `${first}, mas ${second}`);
const band = (r: Result, key: DimKey) => r.bands[key]?.key ?? "critico";

export interface Insight {
  text: string;
  tip: string;
}

const BUILDERS: Record<DimKey, (a: Answers, r: Result) => Insight> = {
  rotina(a, r) {
    const dia = ({
      fixo: "Seus horários se repetem quase todo dia.",
      base: "Seu dia tem uma base de horários, mas com bastante improviso.",
      variavel: "Cada dia seu é diferente do outro.",
      caos: "Seu dia é apagar um incêndio atrás do outro.",
    } as Record<string, string>)[val(a, "r_dia")] ?? "";
    const plano = ({
      sempre: "Você organiza a semana antes dela começar.",
      asvezes: "A semana só é planejada de vez em quando.",
      raro: "A semana quase nunca é planejada.",
      nunca: "A semana começa sem plano nenhum.",
    } as Record<string, string>)[val(a, "r_plano")] ?? "";
    const b = band(r, "rotina");
    const end = ({
      critico: 'Assim, treino e comida viram "se der tempo", e quase nunca dá.',
      atencao: "Quando o dia aperta, o treino costuma ser a primeira coisa a cair.",
      forte: "Isso deixa treino e refeição quase no automático.",
    } as Record<string, string>)[b];
    const tip = ({
      critico: "Escolha um horário fixo de treino, 3 vezes na semana, e coloque um alarme pra ele.",
      atencao: "Separe 10 minutos no domingo pra marcar os treinos da semana na agenda.",
      forte: "Trate o treino como compromisso: dia e hora marcados, igual reunião.",
    } as Record<string, string>)[b];
    return { text: `${dia} ${plano} ${end}`, tip };
  },

  sono(a, r) {
    const horas = PHRASES.s_horas[val(a, "s_horas")] ?? "";
    const acordar = PHRASES.s_acordar[val(a, "s_acordar")] ?? "";
    const regular = ({
      igual: "E mantém o mesmo horário até no fim de semana.",
      "1-2h": "No fim de semana, o horário muda umas 1 ou 2 horas.",
      "3h+": "No fim de semana, o horário muda 3 horas ou mais, e o corpo sente isso como um fuso horário toda segunda-feira.",
      sem: "E não existe um horário fixo pra dormir.",
    } as Record<string, string>)[val(a, "s_regular")] ?? "";
    const b = band(r, "sono");
    const end = ({
      critico: "Com esse sono, o corpo sente mais fome, tem menos disposição pra treinar e se recupera pior.",
      atencao: "Dá pra melhorar, e quando o sono melhora, a fome e a disposição melhoram junto.",
      forte: "Isso ajuda a controlar a fome e a recuperar o corpo depois do treino.",
    } as Record<string, string>)[b];
    let tip = "Se treinar à noite, termine pelo menos 2 horas antes de deitar.";
    if (["<5", "5-6", "6-7"].includes(val(a, "s_horas"))) tip = "Escolha um horário pra deitar que garanta 7 horas de sono e deixe o celular fora da cama 30 minutos antes.";
    else if (["3h+", "sem"].includes(val(a, "s_regular"))) tip = "Tente não variar mais que 1 hora entre a semana e o fim de semana, na hora de deitar e de acordar.";
    else if (["sono", "exausto"].includes(val(a, "s_acordar"))) tip = "Pegue luz do dia logo cedo e evite café depois das 16h.";
    return { text: `Você dorme ${horas} e acorda ${acordar}. ${regular} ${end}`, tip };
  },

  alimentacao(a, r) {
    const ultra = ({
      nunca: "Ultraprocessado quase nunca entra no seu prato",
      "1-2": "Ultraprocessado entra 1 ou 2 dias por semana",
      "3-5": "Ultraprocessado entra de 3 a 5 dias por semana",
      todo: "Ultraprocessado entra todo dia",
    } as Record<string, string>)[val(a, "a_ultra")] ?? "";
    const verde = ({
      sempre: "fruta, verdura e legume aparecem em quase toda refeição.",
      "1x": "fruta, verdura e legume aparecem uma vez por dia.",
      semana: "fruta, verdura e legume só aparecem algumas vezes na semana.",
      raro: "fruta, verdura e legume quase não aparecem.",
    } as Record<string, string>)[val(a, "a_verde")] ?? "";
    const emocional = ({
      nada: "O emocional não decide o que você come.",
      exagero: "Às vezes o estresse decide o que vai pro prato.",
      desconto: "Quando o emocional aperta, a comida vira válvula de escape.",
      esqueco: "Quando o estresse aperta, você esquece de comer, e isso costuma virar exagero depois.",
    } as Record<string, string>)[val(a, "a_emocional")] ?? "";
    const b = band(r, "alimentacao");
    const end = ({
      critico: "Do jeito que está, qualquer treino fica brigando contra o prato.",
      atencao: "Tem coisa boa aí, falta acertar o que ainda puxa pra trás.",
      forte: "É uma base difícil de construir, e você já tem.",
    } as Record<string, string>)[b];
    const worst = ["a_ultra", "a_verde", "a_emocional"]
      .map((id) => ({ id, s: answerScore(id, a) ?? 100 }))
      .sort((x, y) => x.s - y.s)[0];
    const tip = worst.s >= 70
      ? "Agora dá pra ajustar quantidade e proteína pro seu objetivo."
      : ({
          a_ultra: "Troque um ultraprocessado por dia por comida de verdade. Uma troca por vez.",
          a_verde: "Monte o prato começando por metade de verdura e legume. O resto se ajusta.",
          a_emocional: "Quando bater vontade de comer por estresse, beba um copo de água e espere 10 minutos antes de decidir.",
        } as Record<string, string>)[worst.id];
    return { text: `${join(ultra, verde, good(a, "a_ultra") === good(a, "a_verde"))} ${emocional} ${end}`, tip };
  },

  agua(a, r) {
    const { targetL, intakeL } = r.water;
    const first = intakeL > 0
      ? `Você bebe cerca de ${fmtLiters(intakeL)} de água por dia e a sua meta é de ${fmtLiters(targetL)}.`
      : `Você quase não bebe água pura, e a sua meta é de ${fmtLiters(targetL)} por dia.`;
    const urina = ({
      palha: "A cor da urina mostra uma boa hidratação.",
      clara: "A cor da urina está boa, mas dá pra melhorar.",
      escura: "A urina amarelo-escura confirma que está faltando água.",
      cha: "A urina bem escura é um sinal claro de que falta água.",
    } as Record<string, string>)[val(a, "h_urina")] ?? "";
    const ratio = r.water.ratio;
    const end = ratio >= 0.95 ? "Hidratação em dia."
      : ratio >= 0.7 ? "Falta pouco pra chegar lá."
      : "Pouca água pesa na energia, no humor e na concentração ao longo do dia.";
    const gapGlasses = Math.ceil(Math.max(0, targetL - intakeL) / 0.25);
    const tip = gapGlasses > 0
      ? `Deixe uma garrafa de 1 litro à vista e beba ${gapGlasses} ${gapGlasses === 1 ? "copo" : "copos"} a mais por dia.`
      : "Nos dias de treino, beba um copo a mais pra cada 30 minutos de exercício.";
    return { text: `${first} ${urina} ${end}`, tip };
  },

  praticidade(a, r) {
    const tempo = PHRASES.p_tempo[val(a, "p_tempo")] ?? "";
    const local = ({
      academia: "e uma academia perto",
      "casa-equip": "e algum equipamento em casa",
      casa: "em casa, sem equipamento",
      rua: "ao ar livre",
      nenhum: "e hoje não tem onde",
    } as Record<string, string>)[val(a, "p_local")] ?? "";
    const bloqueio = val(a, "p_bloqueio");
    const obstacle = bloqueio && bloqueio !== "nada"
      ? `O que mais atrapalha é ${PHRASES.p_bloqueio[bloqueio]}.`
      : "E nada te impede de treinar hoje.";
    const b = band(r, "praticidade");
    const end = ({
      critico: "Do jeito que está, o treino fica sempre pra depois.",
      atencao: "Dá pra treinar, só falta um treino que caiba no tempo e no lugar que você tem.",
      forte: "A parte difícil, que é ter como treinar, já está resolvida.",
    } as Record<string, string>)[b];
    const tip = ({
      tempo: "Treinos de 15 a 25 minutos resolvem. Não precisa de 1 hora por dia.",
      cansaco: "Treine logo que chegar em casa, antes de sentar no sofá. Ou de manhã, antes do dia te cansar.",
      sabe: "Com o treino pronto e o vídeo de cada exercício, você só precisa apertar o play.",
      dinheiro: "Treino em casa, sem equipamento, já dá resultado no começo.",
      vergonha: "Começar em casa tira a pressão. Ninguém precisa ver o seu primeiro treino.",
      nada: "Mantenha a frequência e aumente a carga aos poucos.",
    } as Record<string, string>)[bloqueio] ?? "Comece com 3 treinos curtos por semana, no horário que você já tem livre.";
    return { text: `Você tem ${tempo} pra treinar ${local}. ${obstacle} ${end}`, tip };
  },

  resistencia(a, r) {
    const escada = ({
      boa: "Três andares de escada não te tiram o fôlego",
      leve: "Três andares de escada te deixam um pouco ofegante",
      forte: "Três andares de escada já te obrigam a parar",
      evito: "Você evita escada porque falta fôlego",
    } as Record<string, string>)[val(a, "e_escada")] ?? "";
    const caminhada = ({
      "30+": "você caminha rápido por mais de 30 minutos.",
      "15-30": "você aguenta de 15 a 30 minutos de caminhada rápida.",
      "5-15": "a caminhada rápida para entre 5 e 15 minutos.",
      "<5": "a caminhada rápida não passa de 5 minutos.",
    } as Record<string, string>)[val(a, "e_caminhada")] ?? "";
    const b = band(r, "resistencia");
    const end = ({
      critico: "Seu fôlego está abaixo do que o dia a dia pede, e isso faz qualquer treino parecer pesado demais.",
      atencao: "O fôlego dá conta do básico, mas ainda cansa cedo. É uma área que costuma melhorar rápido com treino.",
      forte: "Isso te dá margem pra treinos mais intensos.",
    } as Record<string, string>)[b];
    const tip = ({
      critico: "Comece com caminhadas de 10 minutos em ritmo firme e some 5 minutos por semana.",
      atencao: "Inclua 2 treinos curtos e intensos por semana, no estilo HIIT.",
      forte: "Use essa base pra buscar força e definição.",
    } as Record<string, string>)[b];
    return { text: `${join(escada, caminhada, good(a, "e_escada") === good(a, "e_caminhada"))} ${end}`, tip };
  },

  disciplina(a, r) {
    const freq = ({
      "0": "Hoje você não se exercita nenhum dia da semana",
      "1-2": "Hoje você se exercita 1 ou 2 dias por semana",
      "3-4": "Hoje você se exercita 3 ou 4 dias por semana",
      "5+": "Hoje você se exercita 5 dias ou mais por semana",
    } as Record<string, string>)[val(a, "d_freq")] ?? "";
    const recomeco = ({
      manteve: "mantém o que começa.",
      poucas: "já começou e parou uma ou duas vezes.",
      varias: "já perdeu as contas de quantas vezes começou e parou.",
      nunca: "nunca chegou a começar de verdade.",
    } as Record<string, string>)[val(a, "d_recomeco")] ?? "";
    const falha = ({
      volta: "Quando sai do plano, você volta no dia seguinte.",
      dias: "Quando sai do plano, leva uns dias pra retomar.",
      semana: "Quando sai do plano, larga o resto da semana.",
      para: "Quando sai do plano, para de vez.",
    } as Record<string, string>)[val(a, "d_falha")] ?? "";
    const b = band(r, "disciplina");
    const end = ({
      critico: "O problema costuma ser tentar mudar tudo de uma vez, sem nada que te segure quando a motivação acaba.",
      atencao: "A constância ainda depende da motivação do dia.",
      forte: "Essa é a parte mais difícil, e você já tem.",
    } as Record<string, string>)[b];
    const tip = ({
      critico: "Troque a meta de perfeição por uma regra simples: nunca falhar dois dias seguidos.",
      atencao: "Deixe o treino com dia e hora marcados. Quando está na agenda, não depende de vontade.",
      forte: "Agora é hora de um plano à altura da sua disciplina.",
    } as Record<string, string>)[b];
    return { text: `${join(freq, recomeco, good(a, "d_freq") === good(a, "d_recomeco"))} ${falha} ${end}`, tip };
  },
};

export function dimensionInsight(key: DimKey, answers: Answers, result: Result): Insight {
  const built = BUILDERS[key](answers, result);
  return { text: built.text.replace(/\s+/g, " ").trim(), tip: built.tip };
}

export function headline(r: Result, name: string): string {
  const [w1, w2] = r.ranked;
  const lead = name ? `${name}, ` : "";
  const fix = (s: string) => (name ? s : cap(s));
  if ((r.dims[w1] ?? 0) >= 70) return `${lead}${fix("sua base está forte. Agora o ganho vem do ajuste fino.")}`;
  if (!w2 || (r.dims[w2] ?? 0) >= 70) return `${lead}${fix(`${DIM_IN_SENTENCE[w1]} é o que mais segura a sua evolução.`)}`;
  return `${lead}${fix(`${DIM_IN_SENTENCE[w1]} e ${DIM_IN_SENTENCE[w2]} estão segurando a sua evolução.`)}`;
}

export interface PlanStep {
  when: string;
  dim: DimKey | null;
  title: string;
  text: string;
}

export function planSteps(a: Answers, r: Result): PlanStep[] {
  const [w1, w2] = r.ranked;
  const local = ({
    academia: "na academia", "casa-equip": "em casa", casa: "em casa, sem equipamento", rua: "em casa ou ao ar livre", nenhum: "em casa, sem equipamento",
  } as Record<string, string>)[val(a, "p_local")] ?? "em casa ou na academia";
  const tempo = ({
    "<15": "15 a 20 minutos", "15-30": "15 a 30 minutos", "30-45": "30 a 45 minutos", "60+": "até 1 hora",
  } as Record<string, string>)[val(a, "p_tempo")] ?? "15 a 30 minutos";
  const goal = PHRASES.objetivo[val(a, "objetivo")] ?? "cuidar da saúde";
  return [
    { when: "Semana 1", dim: w1, title: DIM[w1].label, text: dimensionInsight(w1, a, r).tip },
    { when: "Semana 2", dim: w2, title: DIM[w2].label, text: dimensionInsight(w2, a, r).tip },
    {
      when: "Da semana 3 em diante", dim: null, title: "Plano completo",
      text: `Treinos de ${tempo} ${local}, com dieta pensada pra ${goal}. E suporte no WhatsApp pra você não parar.`,
    },
  ];
}

export function sleepInsight(a: Answers) {
  const h = val(a, "s_horas");
  if (["<5", "5-6", "6-7"].includes(h)) {
    return {
      title: "Dormir pouco dá fome.",
      stat: "+385", statLabel: "kcal por dia",
      text: "Numa revisão de estudos publicada em 2017, quem dormiu menos do que precisava comeu, em média, 385 kcal a mais por dia. É como um lanche extra todo dia, sem perceber.",
    };
  }
  if (h === "9+") {
    return {
      title: "Muito sono também conta.",
      stat: "9h+", statLabel: "por noite",
      text: "Dormir mais de 9 horas com frequência pode ser sinal de um sono que não descansa. Se mesmo assim o cansaço não passa, vale conversar com um médico.",
    };
  }
  return {
    title: "Seu sono joga a seu favor.",
    stat: "7 a 9h", statLabel: "por noite",
    text: "Dormir de 7 a 9 horas ajuda a controlar a fome e a recuperar o corpo depois do treino. Muita gente que começa a treinar não tem essa base.",
  };
}

export function waterInsight(r: Result) {
  const { targetL, intakeL } = r.water;
  const gap = Math.max(0, Math.round((targetL - intakeL) * 10) / 10);
  return {
    title: `Sua meta: ${fmtLiters(targetL)} de água por dia`,
    gapText: gap > 0 ? `Hoje você bebe cerca de ${fmtLiters(intakeL)}. Faltam ${fmtLiters(gap)} por dia.` : `Hoje você bebe cerca de ${fmtLiters(intakeL)}. Você já chega lá. Boa!`,
    text: "Estudos com adultos saudáveis mostram que perder cerca de 1,5% do peso em água já basta pra piorar o humor e a concentração.",
  };
}
