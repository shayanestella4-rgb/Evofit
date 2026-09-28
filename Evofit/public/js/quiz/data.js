// @ts-check
/**
 * Conteúdo do diagnóstico: áreas avaliadas, fases, etapas e opções.
 * Este módulo é a única fonte de verdade para o quiz, o cálculo da nota
 * e os rótulos da dashboard. Não tem efeitos colaterais.
 */

/**
 * @typedef {'rotina'|'disciplina'|'sono'|'alimentacao'|'praticidade'|'agua'|'resistencia'} DimKey
 * @typedef {{ key: DimKey, label: string, icon: string, photo: string|null, alt: string }} Dimension
 * @typedef {{ v: string, label: string, s?: number, icon?: string, swatch?: string }} Option
 * @typedef {'single'|'text'|'range'|'glasses'|'insight'|'analise'|'email'|'resultado'} StepType
 * @typedef {{
 *   id: string, type: StepType, group: 'perfil'|DimKey|'final',
 *   title?: string, sub?: string, options?: Option[], layout?: 'list'|'cards'|'chips'|'swatch',
 *   placeholder?: string, min?: number, max?: number, unit?: string, scored?: boolean
 * }} Step
 */

/** Ordem canônica das áreas (gráfico radar, resultado e dashboard). */
/** @type {Dimension[]} */
export const DIMENSIONS = [
  { key: 'rotina', label: 'Rotina', icon: 'calendar-check', photo: 'treino-costas', alt: 'Mulher de costas se alongando numa academia escura antes do treino' },
  { key: 'disciplina', label: 'Disciplina', icon: 'target', photo: 'treino-foco', alt: 'Mulher de costas com as mãos atrás da cabeça, concentrada antes da série' },
  { key: 'sono', label: 'Sono', icon: 'moon-stars', photo: 'mobilidade', alt: 'Mulher fazendo alongamento no chão, com luz suave entrando pela janela' },
  { key: 'alimentacao', label: 'Alimentação', icon: 'fork-knife', photo: 'prato-carne-ovos', alt: 'Prato com carne grelhada, ovos cozidos e abacate' },
  { key: 'praticidade', label: 'Praticidade', icon: 'barbell', photo: 'treino-avanco', alt: 'Mulher fazendo avanço com halteres na academia' },
  { key: 'agua', label: 'Água', icon: 'drop', photo: null, alt: '' },
  { key: 'resistencia', label: 'Resistência', icon: 'person-simple-run', photo: 'corrida-esteira', alt: 'Mulher correndo na esteira em uma academia com pouca luz' },
];

/** @type {Record<DimKey, Dimension>} */
export const DIM = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d]));

export const PERFIL_GROUP = { key: 'perfil', label: 'Seu perfil', icon: 'user-circle', photo: 'treino-cabo', alt: 'Mulher treinando no cabo com roupa verde, em academia escura' };

/** Faixas de nota por área. */
export const BANDS = [
  { key: 'critico', label: 'Crítico', min: 0 },
  { key: 'atencao', label: 'Atenção', min: 40 },
  { key: 'forte', label: 'Forte', min: 70 },
];

/** Fases da nota geral. */
export const PHASES = [
  {
    n: 1, key: 'despertar', name: 'Despertar', min: 0,
    text: 'Seu corpo está pedindo atenção em várias frentes ao mesmo tempo. A boa notícia é que quem começa daqui sente diferença rápido, porque cada passo pequeno já conta.',
    plan: 'Começar pequeno: treinos curtos, sono e água antes de qualquer dieta radical.',
  },
  {
    n: 2, key: 'construcao', name: 'Construção', min: 40,
    text: 'Você já tem algumas peças no lugar, mas outras estão puxando sua energia pra baixo. É a fase em que ter um plano faz mais diferença.',
    plan: 'Firmar a base: treino com dia marcado e ajuste nas duas áreas mais fracas.',
  },
  {
    n: 3, key: 'ritmo', name: 'Ritmo', min: 60,
    text: 'Sua base é boa. O que falta é constância nas áreas mais fracas pra transformar esforço em resultado que aparece no espelho.',
    plan: 'Ganhar constância: treino progressivo e ajuste fino na alimentação.',
  },
  {
    n: 4, key: 'evolucao', name: 'Evolução', min: 80,
    text: 'Você está acima da média na maioria das áreas. Agora o ganho vem de ajuste fino e de um plano que acompanhe a sua evolução.',
    plan: 'Evoluir de nível: treinos mais intensos e metas de força e definição.',
  },
];

/** Litros de água por quilo de peso por dia (orientação usual de 35 ml/kg). */
export const WATER_ML_PER_KG = 35;
export const GLASS_ML = 250;
export const GLASSES_MAX = 12;

/** @type {Step[]} */
export const STEPS = [
  { id: 'hero', type: 'insight', group: 'perfil' },

  // Perfil
  {
    id: 'sexo', type: 'single', group: 'perfil', layout: 'cards',
    title: 'Pra começar, como você se identifica?',
    options: [
      { v: 'f', label: 'Mulher', icon: 'gender-female' },
      { v: 'm', label: 'Homem', icon: 'gender-male' },
      { v: 'x', label: 'Prefiro não dizer', icon: 'user-circle' },
    ],
  },
  {
    id: 'idade', type: 'single', group: 'perfil', layout: 'chips',
    title: 'Qual a sua idade?',
    options: [
      { v: '18-24', label: '18 a 24' },
      { v: '25-34', label: '25 a 34' },
      { v: '35-44', label: '35 a 44' },
      { v: '45-54', label: '45 a 54' },
      { v: '55+', label: '55 ou mais' },
    ],
  },
  {
    id: 'objetivo', type: 'single', group: 'perfil',
    title: 'O que você mais quer mudar agora?',
    options: [
      { v: 'emagrecer', label: 'Emagrecer e desinchar', icon: 'fire' },
      { v: 'energia', label: 'Ter mais energia no dia a dia', icon: 'lightning' },
      { v: 'condicionamento', label: 'Ganhar fôlego e condicionamento', icon: 'heartbeat' },
      { v: 'musculo', label: 'Definir e ganhar músculo', icon: 'person-arms-spread' },
      { v: 'saude', label: 'Cuidar da saúde pra valer', icon: 'heart' },
    ],
  },
  {
    id: 'nome', type: 'text', group: 'perfil',
    title: 'Como posso te chamar?',
    sub: 'Seu diagnóstico sai com o seu nome.',
    placeholder: 'Seu primeiro nome',
  },

  // Rotina
  {
    id: 'r_dia', type: 'single', group: 'rotina', scored: true,
    title: '{nome}, como é um dia comum na sua vida?',
    options: [
      { v: 'fixo', label: 'Tenho horários e sigo quase sempre', s: 100 },
      { v: 'base', label: 'Tenho uma base, mas improviso bastante', s: 65 },
      { v: 'variavel', label: 'Cada dia é diferente: turno, viagem, filhos', s: 30 },
      { v: 'caos', label: 'Vivo apagando incêndio, não sobra tempo pra nada', s: 5 },
    ],
  },
  {
    id: 'r_plano', type: 'single', group: 'rotina', scored: true,
    title: 'Você organiza a semana antes dela começar?',
    sub: 'Treino, refeições, compromissos.',
    options: [
      { v: 'sempre', label: 'Sim, toda semana', s: 100 },
      { v: 'asvezes', label: 'Às vezes, quando lembro', s: 60 },
      { v: 'raro', label: 'Quase nunca, resolvo no dia', s: 25 },
      { v: 'nunca', label: 'Nunca', s: 0 },
    ],
  },

  // Sono
  {
    id: 's_horas', type: 'single', group: 'sono', scored: true,
    title: 'Quantas horas você dorme numa noite normal?',
    options: [
      { v: '<5', label: 'Menos de 5 horas', s: 5 },
      { v: '5-6', label: 'Entre 5 e 6 horas', s: 35 },
      { v: '6-7', label: 'Entre 6 e 7 horas', s: 65 },
      { v: '7-9', label: 'Entre 7 e 9 horas', s: 100 },
      { v: '9+', label: 'Mais de 9 horas', s: 70 },
    ],
  },
  {
    id: 's_regular', type: 'single', group: 'sono', scored: true,
    title: 'No fim de semana, seu horário de dormir muda muito?',
    options: [
      { v: 'igual', label: 'Quase nada, durmo e acordo no mesmo horário', s: 100 },
      { v: '1-2h', label: 'Muda umas 1 ou 2 horas', s: 65 },
      { v: '3h+', label: 'Muda 3 horas ou mais', s: 25 },
      { v: 'sem', label: 'Não tenho horário nem durante a semana', s: 0 },
    ],
  },
  {
    id: 's_acordar', type: 'single', group: 'sono', scored: true,
    title: 'E como você costuma acordar?',
    options: [
      { v: 'energia', label: 'Com energia, levanto de boa', s: 100 },
      { v: 'devagar', label: 'Devagar, mas engreno depois do café', s: 60 },
      { v: 'sono', label: 'Com sono, querendo mais uma hora', s: 25 },
      { v: 'exausto', label: 'Com a sensação de que nem dormi', s: 0 },
    ],
  },
  { id: 'i_sono', type: 'insight', group: 'sono' },

  // Alimentação
  {
    id: 'a_ultra', type: 'single', group: 'alimentacao', scored: true,
    title: 'Quantos dias por semana entram ultraprocessados na sua rotina?',
    sub: 'Biscoito recheado, salgadinho, fast food, refrigerante, congelado pronto.',
    options: [
      { v: 'nunca', label: 'Quase nunca', s: 100 },
      { v: '1-2', label: '1 ou 2 dias', s: 70 },
      { v: '3-5', label: '3 a 5 dias', s: 30 },
      { v: 'todo', label: 'Todo dia', s: 0 },
    ],
  },
  {
    id: 'a_verde', type: 'single', group: 'alimentacao', scored: true,
    title: 'E fruta, verdura e legume, com que frequência aparecem no seu prato?',
    options: [
      { v: 'sempre', label: 'Em quase todas as refeições', s: 100 },
      { v: '1x', label: 'Pelo menos uma vez por dia', s: 65 },
      { v: 'semana', label: 'Algumas vezes na semana', s: 30 },
      { v: 'raro', label: 'Raramente', s: 0 },
    ],
  },
  {
    id: 'a_emocional', type: 'single', group: 'alimentacao', scored: true,
    title: 'Quando bate estresse, ansiedade ou tédio, o que acontece com a comida?',
    options: [
      { v: 'nada', label: 'Nada muda, como igual', s: 100 },
      { v: 'exagero', label: 'Às vezes eu exagero', s: 55 },
      { v: 'desconto', label: 'Quase sempre desconto na comida', s: 15 },
      { v: 'esqueco', label: 'Perco a fome e passo o dia sem comer', s: 40 },
    ],
  },

  // Água
  {
    id: 'h_copos', type: 'glasses', group: 'agua', scored: true,
    title: 'Quantos copos de água você bebe num dia comum?',
    sub: 'Conte só água. Cada copo tem 250 ml.',
    min: 0, max: GLASSES_MAX,
  },
  {
    id: 'h_urina', type: 'single', group: 'agua', layout: 'swatch', scored: true,
    title: 'Qual a cor da sua urina na maior parte do dia?',
    sub: 'Parece estranho, mas é o jeito mais rápido de saber se falta água no seu corpo.',
    options: [
      { v: 'palha', label: 'Clarinha, cor de palha', s: 100, swatch: 'oklch(0.95 0.07 100)' },
      { v: 'clara', label: 'Amarelo-clara', s: 75, swatch: 'oklch(0.9 0.13 95)' },
      { v: 'escura', label: 'Amarelo-escura', s: 30, swatch: 'oklch(0.8 0.15 85)' },
      { v: 'cha', label: 'Cor de chá, bem escura', s: 0, swatch: 'oklch(0.62 0.12 65)' },
    ],
  },
  {
    id: 'peso', type: 'range', group: 'agua',
    title: 'Quanto você pesa, mais ou menos?',
    sub: 'É com esse número que a gente calcula quanta água o seu corpo pede por dia.',
    min: 40, max: 160, unit: 'kg',
  },
  { id: 'i_agua', type: 'insight', group: 'agua' },

  // Praticidade
  {
    id: 'p_tempo', type: 'single', group: 'praticidade', scored: true,
    title: 'Quanto tempo livre você consegue separar pra treinar, de verdade?',
    options: [
      { v: '<15', label: 'Menos de 15 minutos', s: 25 },
      { v: '15-30', label: 'De 15 a 30 minutos', s: 60 },
      { v: '30-45', label: 'De 30 a 45 minutos', s: 85 },
      { v: '60+', label: '1 hora ou mais', s: 100 },
    ],
  },
  {
    id: 'p_local', type: 'single', group: 'praticidade', scored: true,
    title: 'Onde seria mais fácil você treinar hoje?',
    options: [
      { v: 'academia', label: 'Na academia, tenho uma perto', s: 100, icon: 'barbell' },
      { v: 'casa-equip', label: 'Em casa, tenho algum equipamento', s: 85, icon: 'house' },
      { v: 'casa', label: 'Em casa, sem equipamento nenhum', s: 60, icon: 'house' },
      { v: 'rua', label: 'Ao ar livre, na rua ou no parque', s: 70, icon: 'tree' },
      { v: 'nenhum', label: 'Hoje não tenho onde treinar', s: 15, icon: 'question' },
    ],
  },
  {
    id: 'p_bloqueio', type: 'single', group: 'praticidade', scored: true,
    title: 'O que mais te impede de treinar hoje?',
    options: [
      { v: 'tempo', label: 'Falta de tempo', s: 30, icon: 'clock' },
      { v: 'cansaco', label: 'Cansaço no fim do dia', s: 40, icon: 'battery-low' },
      { v: 'sabe', label: 'Não sei o que fazer nem como montar um treino', s: 45, icon: 'question' },
      { v: 'dinheiro', label: 'Academia e personal são caros', s: 45, icon: 'money' },
      { v: 'vergonha', label: 'Vergonha de começar do zero', s: 55, icon: 'smiley-nervous' },
      { v: 'nada', label: 'Nada, já treino com frequência', s: 100, icon: 'check-circle' },
    ],
  },

  // Resistência
  {
    id: 'e_escada', type: 'single', group: 'resistencia', scored: true,
    title: 'Se você subir 3 andares de escada no seu ritmo, como chega lá em cima?',
    options: [
      { v: 'boa', label: 'De boa, dá pra conversar normal', s: 100 },
      { v: 'leve', label: 'Um pouco ofegante, mas bem', s: 65 },
      { v: 'forte', label: 'Bem ofegante, preciso parar um pouco', s: 30 },
      { v: 'evito', label: 'Evito escada, não aguento', s: 0 },
    ],
  },
  {
    id: 'e_caminhada', type: 'single', group: 'resistencia', scored: true,
    title: 'Quanto tempo você aguenta caminhar em ritmo acelerado sem parar?',
    options: [
      { v: '30+', label: 'Mais de 30 minutos', s: 100 },
      { v: '15-30', label: 'De 15 a 30 minutos', s: 70 },
      { v: '5-15', label: 'De 5 a 15 minutos', s: 35 },
      { v: '<5', label: 'Menos de 5 minutos', s: 5 },
    ],
  },
  { id: 'i_prova', type: 'insight', group: 'resistencia' },

  // Disciplina
  {
    id: 'd_freq', type: 'single', group: 'disciplina', scored: true,
    title: 'Hoje, quantos dias por semana você se exercita?',
    options: [
      { v: '0', label: 'Nenhum', s: 0 },
      { v: '1-2', label: '1 ou 2 dias', s: 40 },
      { v: '3-4', label: '3 ou 4 dias', s: 80 },
      { v: '5+', label: '5 dias ou mais', s: 100 },
    ],
  },
  {
    id: 'd_recomeco', type: 'single', group: 'disciplina', scored: true,
    title: 'Quantas vezes você já começou um treino ou uma dieta e parou no meio?',
    options: [
      { v: 'manteve', label: 'Comecei e mantive', s: 100 },
      { v: 'poucas', label: 'Uma ou duas vezes', s: 60 },
      { v: 'varias', label: 'Já perdi as contas', s: 15 },
      { v: 'nunca', label: 'Nunca cheguei a começar', s: 35 },
    ],
  },
  {
    id: 'd_falha', type: 'single', group: 'disciplina', scored: true,
    title: 'Quando você perde um treino ou sai da dieta, o que costuma acontecer?',
    options: [
      { v: 'volta', label: 'Volto no dia seguinte, normal', s: 100 },
      { v: 'dias', label: 'Levo uns dias pra retomar', s: 55 },
      { v: 'semana', label: 'Largo o resto da semana', s: 20 },
      { v: 'para', label: 'Viro a chave e paro de vez', s: 0 },
    ],
  },

  { id: 'analise', type: 'analise', group: 'final' },
  { id: 'email', type: 'email', group: 'final' },
  { id: 'resultado', type: 'resultado', group: 'final' },
];

/** @type {Record<string, Step>} */
export const STEP = Object.fromEntries(STEPS.map((s) => [s.id, s]));
export const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));

/** Perguntas que a pessoa responde (sem telas de transição). */
export const QUESTIONS = STEPS.filter((s) => ['single', 'text', 'range', 'glasses'].includes(s.type));

/** Grupos na ordem em que aparecem no quiz (barra de progresso). */
export const FLOW_GROUPS = ['perfil', 'rotina', 'sono', 'alimentacao', 'agua', 'praticidade', 'resistencia', 'disciplina'];

/** Etapas do funil exibidas na dashboard: telas do quiz + oferta + clique em comprar. */
export const FUNNEL_STEPS = [
  ...STEPS.map((s, i) => ({ index: i, id: s.id, label: stepLabel(s) })),
  { index: STEPS.length, id: 'oferta', label: 'Viu a oferta' },
  { index: STEPS.length + 1, id: 'compra', label: 'Clicou em comprar' },
];

/** @param {Step} s */
function stepLabel(s) {
  const fixed = {
    hero: 'Abriu o quiz', i_sono: 'Tela: sono e fome', i_agua: 'Tela: meta de água', i_prova: 'Tela: resultados reais',
    analise: 'Análise', email: 'Pediu o e-mail', resultado: 'Viu o resultado', nome: 'Nome',
  };
  if (fixed[s.id]) return fixed[s.id];
  return (s.title || s.id).replace('{nome}, ', '').replace(/^\w/, (c) => c.toUpperCase());
}

/** Textos curtos usados nas explicações do resultado. */
export const PHRASES = {
  s_horas: { '<5': 'menos de 5 horas', '5-6': 'entre 5 e 6 horas', '6-7': 'entre 6 e 7 horas', '7-9': 'entre 7 e 9 horas', '9+': 'mais de 9 horas' },
  s_acordar: { energia: 'com energia', devagar: 'devagar', sono: 'com sono', exausto: 'com a sensação de que nem dormiu' },
  a_ultra: { nunca: 'quase nunca', '1-2': '1 ou 2 dias por semana', '3-5': 'de 3 a 5 dias por semana', todo: 'todo dia' },
  a_verde: { sempre: 'em quase toda refeição', '1x': 'uma vez por dia', semana: 'só algumas vezes na semana', raro: 'raramente' },
  p_tempo: { '<15': 'menos de 15 minutos', '15-30': 'de 15 a 30 minutos', '30-45': 'de 30 a 45 minutos', '60+': '1 hora ou mais' },
  p_bloqueio: { tempo: 'a falta de tempo', cansaco: 'o cansaço no fim do dia', sabe: 'não saber o que fazer no treino', dinheiro: 'o preço de academia e personal', vergonha: 'a vergonha de começar do zero', nada: '' },
  d_freq: { '0': 'nenhum dia', '1-2': '1 ou 2 dias', '3-4': '3 ou 4 dias', '5+': '5 dias ou mais' },
  objetivo: { emagrecer: 'emagrecer', energia: 'ter mais energia', condicionamento: 'ganhar fôlego', musculo: 'definir e ganhar músculo', saude: 'cuidar da saúde' },
};

/** Etapas mostradas na tela de análise, na ordem do quiz. */
export const ANALYSIS_LINES = [
  { dim: 'rotina', text: 'Organizando sua rotina' },
  { dim: 'sono', text: 'Avaliando seu sono' },
  { dim: 'alimentacao', text: 'Olhando o seu prato' },
  { dim: 'agua', text: 'Calculando sua meta de água' },
  { dim: 'praticidade', text: 'Vendo onde o treino cabe' },
  { dim: 'resistencia', text: 'Checando o seu fôlego' },
  { dim: 'disciplina', text: 'Medindo a sua constância' },
];
