// Perguntas extras por perfil de aluno na anamnese curta de /consultoria —
// referência: "10 Modelos de Anamnese para Personal Trainer" (Fabio Ceschini).
// Mantém os campos comuns (nome, whatsapp, idade, sexo, objetivo, nível,
// dias de treino, lesões, observações) e soma perguntas específicas do perfil.

export type ExtraFieldType = "radio" | "checkbox" | "text" | "textarea" | "scale";

export interface ExtraField {
  key: string;
  label: string;
  type: ExtraFieldType;
  options?: string[];
  placeholder?: string;
}

export interface TipoConfig {
  slug: string;
  titulo: string;
  subtitulo: string;
  extras: ExtraField[];
}

export const CONSULTORIA_TIPOS: Record<string, TipoConfig> = {
  comum: {
    slug: "comum",
    titulo: "Me conta um pouco sobre você",
    subtitulo: "Algumas perguntas rápidas pra eu entender sua rotina e já ir pensando no seu treino.",
    extras: [],
  },
  emagrecimento: {
    slug: "emagrecimento",
    titulo: "Vamos montar seu plano pra emagrecer",
    subtitulo: "Me conta um pouco mais sobre sua rotina e seu histórico com emagrecimento.",
    extras: [
      { key: "autoestima", label: "Como está sua autoestima hoje?", type: "scale" },
      {
        key: "dificuldade",
        label: "Hoje, qual é sua maior dificuldade pra emagrecer?",
        type: "radio",
        options: [
          "Manter a regularidade nos exercícios",
          "Manter a regularidade na alimentação",
          "Manter o ânimo pra treinar",
          "Quando fico triste, desconto na comida",
          "Quando fico triste, falto aos treinos",
          "Outra",
        ],
      },
      { key: "jaTentou", label: "Já tentou emagrecer antes? O que fez?", type: "textarea", placeholder: "Ex: dietas, remédios, academia..." },
    ],
  },
  idoso: {
    slug: "idoso",
    titulo: "Vamos cuidar da sua qualidade de vida",
    subtitulo: "Algumas perguntas pra eu entender melhor o seu dia a dia.",
    extras: [
      {
        key: "dificuldades",
        label: "Hoje você tem dificuldade para:",
        type: "checkbox",
        options: ["Caminhar", "Subir ou descer escadas", "Levantar da cadeira ou da cama", "Ficar em pé parado(a)", "Se vestir sozinho(a)", "Nenhuma dessas"],
      },
      { key: "quedas", label: "Alguma vez já perdeu o equilíbrio e caiu?", type: "radio", options: ["Sim", "Não"] },
      {
        key: "condicoes",
        label: "Tem alguma dessas condições?",
        type: "checkbox",
        options: ["Hipertensão arterial", "Diabetes", "Osteoporose", "Parkinson", "Alzheimer", "Nenhuma dessas"],
      },
      { key: "sonho", label: "O que mais te deixaria feliz conseguir fazer de novo?", type: "textarea", placeholder: "Ex: brincar com os netos, caminhar sem cansar, dançar..." },
    ],
  },
  gestante: {
    slug: "gestante",
    titulo: "Vamos cuidar de você nessa fase",
    subtitulo: "Algumas perguntas sobre a gestação pra eu te orientar com segurança.",
    extras: [
      { key: "semanas", label: "De quantas semanas ou meses você está?", type: "text", placeholder: "Ex: 20 semanas" },
      { key: "primeiraGestacao", label: "Essa é sua primeira gestação?", type: "radio", options: ["Sim", "Não"] },
      { key: "complicacao", label: "Tem alguma complicação conhecida na gestação (pressão alta, diabetes gestacional)?", type: "radio", options: ["Sim", "Não"] },
      { key: "restricaoMedica", label: "O médico recomendou que você NÃO praticasse algum tipo de exercício? Qual?", type: "textarea" },
    ],
  },
  posparto: {
    slug: "posparto",
    titulo: "Vamos retomar seu treino com segurança",
    subtitulo: "Algumas perguntas sobre o parto e como você está se sentindo.",
    extras: [
      { key: "tipoParto", label: "Qual foi o tipo de parto?", type: "radio", options: ["Normal", "Cesariana"] },
      { key: "tempoParto", label: "Há quanto tempo foi o parto?", type: "text", placeholder: "Ex: 2 meses" },
      { key: "intercorrencia", label: "Houve alguma intercorrência no parto ou pós-parto?", type: "textarea" },
      { key: "autoestima", label: "Como está sua autoestima hoje?", type: "scale" },
      { key: "atividadeAntes", label: "Já praticava atividade física antes ou durante a gestação?", type: "radio", options: ["Sim", "Não"] },
    ],
  },
  obesidade: {
    slug: "obesidade",
    titulo: "Vamos montar seu plano com cuidado",
    subtitulo: "Algumas perguntas sobre seu histórico pra eu te ajudar da melhor forma.",
    extras: [
      { key: "quandoComecou", label: "Quando você começou a ganhar peso? (ano, contexto)", type: "textarea" },
      {
        key: "tentativas",
        label: "Quantas vezes já tentou emagrecer (dietas, remédios, cirurgia)?",
        type: "radio",
        options: ["1 vez", "2 a 3 vezes", "4 a 6 vezes", "7 ou mais vezes"],
      },
      { key: "dorAtual", label: "Sente alguma dor no corpo hoje, mesmo em repouso? Onde?", type: "textarea" },
    ],
  },
  diabetes: {
    slug: "diabetes",
    titulo: "Vamos montar um plano seguro pro seu diabetes",
    subtitulo: "Algumas perguntas específicas pra treinar com segurança.",
    extras: [
      { key: "tipo", label: "Qual tipo de diabetes você tem?", type: "radio", options: ["Tipo 1", "Tipo 2", "Não sei dizer"] },
      {
        key: "tempoDiagnostico",
        label: "Há quanto tempo foi diagnosticado(a)?",
        type: "radio",
        options: ["Menos de 1 ano", "1 a 4 anos", "5 a 9 anos", "10 ou mais anos"],
      },
      { key: "remedio", label: "Faz uso de insulina ou outro remédio para controlar? Qual?", type: "text" },
      { key: "crises", label: "Já teve crise de hipoglicemia ou hiperglicemia?", type: "radio", options: ["Sim", "Não"] },
    ],
  },
  hipertensao: {
    slug: "hipertensao",
    titulo: "Vamos montar um plano seguro pra sua pressão",
    subtitulo: "Algumas perguntas específicas pra treinar com segurança.",
    extras: [
      {
        key: "tempoDiagnostico",
        label: "Há quanto tempo foi diagnosticado(a) com pressão alta?",
        type: "radio",
        options: ["Menos de 1 ano", "1 a 4 anos", "5 a 9 anos", "10 ou mais anos"],
      },
      { key: "remedio", label: "Faz uso de remédio para controlar a pressão? Qual?", type: "text" },
      {
        key: "outrasCondicoes",
        label: "Tem alguma outra condição?",
        type: "checkbox",
        options: ["Diabetes", "Colesterol elevado", "Obesidade", "Apneia do sono", "Nenhuma dessas"],
      },
      {
        key: "sintomas",
        label: "Já sentiu algum desses sintomas durante o exercício?",
        type: "checkbox",
        options: ["Tontura", "Dor no peito", "Falta de ar", "Visão escurecida", "Nenhum desses"],
      },
    ],
  },
  poscovid: {
    slug: "poscovid",
    titulo: "Vamos retomar seu condicionamento com cuidado",
    subtitulo: "Algumas perguntas sobre como foi a covid pra você.",
    extras: [
      { key: "quando", label: "Quando você teve contato com a covid? (mês/ano aproximado)", type: "text" },
      {
        key: "internacao",
        label: "Precisou de internação ou UTI?",
        type: "radio",
        options: ["Não precisei", "Hospital, sem UTI", "UTI sem respirador", "UTI com respirador"],
      },
      {
        key: "sintomasHoje",
        label: "Hoje, quais sintomas você ainda sente?",
        type: "checkbox",
        options: ["Fadiga", "Falta de ar ao caminhar ou se esforçar", "Dor articular ou muscular", "Insônia", "Nenhum desses"],
      },
    ],
  },
  depressao: {
    slug: "depressao",
    titulo: "Vamos montar um plano que cabe no seu momento",
    subtitulo: "Algumas perguntas pra eu te ajudar da melhor forma.",
    extras: [
      {
        key: "tempoDiagnostico",
        label: "Há quanto tempo foi diagnosticado(a)?",
        type: "radio",
        options: ["Menos de 1 ano", "1 a 2 anos", "3 a 5 anos", "6 ou mais anos"],
      },
      { key: "remedio", label: "Faz uso de remédio para controlar os sintomas?", type: "radio", options: ["Sim", "Não"] },
      { key: "sono", label: "Como está a qualidade do seu sono?", type: "scale" },
      {
        key: "sintomas",
        label: "Sente algum desses sintomas?",
        type: "checkbox",
        options: ["Cansaço generalizado", "Vontade de não sair de casa", "Mudança no apetite", "Dificuldade de dormir", "Nenhum desses"],
      },
    ],
  },
};

export const TIPO_LABELS: Record<string, string> = {
  comum: "Homem ou mulher comum",
  emagrecimento: "Emagrecimento",
  idoso: "Terceira idade",
  gestante: "Gestante",
  posparto: "Pós-parto",
  obesidade: "Obesidade",
  diabetes: "Diabetes",
  hipertensao: "Hipertensão arterial",
  poscovid: "Pós-covid",
  depressao: "Depressão",
};
