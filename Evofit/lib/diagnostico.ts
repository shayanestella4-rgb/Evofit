// Espelho leve dos passos do "Diagnóstico Evofit" (o quiz de verdade roda os
// arquivos originais em public/js/quiz/*.js, intocados) — usado só pra
// nomear os passos do funil no painel /admin. Mantenha os ids e a ordem
// idênticos a public/js/quiz/data.js (STEPS) se o quiz mudar lá.

interface StepMeta {
  id: string;
  title?: string;
}

const STEPS: StepMeta[] = [
  { id: "hero" },
  { id: "sexo", title: "Pra começar, como você se identifica?" },
  { id: "idade", title: "Qual a sua idade?" },
  { id: "objetivo", title: "O que você mais quer mudar agora?" },
  { id: "nome" },
  { id: "condicoes", title: "Você tem alguma dessas condições?" },
  { id: "r_dia", title: "Como é um dia comum na sua vida?" },
  { id: "r_plano", title: "Você organiza a semana antes dela começar?" },
  { id: "s_horas", title: "Quantas horas você dorme numa noite normal?" },
  { id: "s_regular", title: "No fim de semana, seu horário de dormir muda muito?" },
  { id: "s_acordar", title: "E como você costuma acordar?" },
  { id: "i_sono" },
  { id: "a_ultra", title: "Quantos dias por semana entram ultraprocessados na sua rotina?" },
  { id: "a_verde", title: "Fruta, verdura e legume, com que frequência aparecem no seu prato?" },
  { id: "a_emocional", title: "Quando bate estresse, ansiedade ou tédio, o que acontece com a comida?" },
  { id: "h_copos", title: "Quantos copos de água você bebe num dia comum?" },
  { id: "h_urina", title: "Qual a cor da sua urina na maior parte do dia?" },
  { id: "peso", title: "Quanto você pesa, mais ou menos?" },
  { id: "i_agua" },
  { id: "p_tempo", title: "Quanto tempo livre você consegue separar pra treinar, de verdade?" },
  { id: "p_local", title: "Onde seria mais fácil você treinar hoje?" },
  { id: "p_bloqueio", title: "O que mais te impede de treinar hoje?" },
  { id: "e_escada", title: "Se você subir 3 andares de escada no seu ritmo, como chega lá em cima?" },
  { id: "e_caminhada", title: "Quanto tempo você aguenta caminhar em ritmo acelerado sem parar?" },
  { id: "i_prova" },
  { id: "d_freq", title: "Hoje, quantos dias por semana você se exercita?" },
  { id: "d_recomeco", title: "Quantas vezes você já começou um treino ou uma dieta e parou no meio?" },
  { id: "d_falha", title: "Quando você perde um treino ou sai da dieta, o que costuma acontecer?" },
  { id: "analise" },
  { id: "email" },
  { id: "resultado" },
];

export const TOTAL_STEPS = STEPS.length;

const FIXED_LABELS: Record<string, string> = {
  hero: "Abriu o quiz",
  i_sono: "Tela: sono e fome",
  i_agua: "Tela: meta de água",
  i_prova: "Tela: resultados reais",
  analise: "Análise",
  email: "Pediu o e-mail",
  resultado: "Viu o resultado",
  nome: "Nome",
};

/** Rótulo curto de cada passo — usado no funil do painel de métricas. */
export function stepLabelByIndex(index: number): string {
  const s = STEPS[index];
  if (!s) return `Passo ${index}`;
  if (FIXED_LABELS[s.id]) return FIXED_LABELS[s.id];
  const t = s.title || s.id;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
