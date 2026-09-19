// Perguntas do quiz de vendas (app/quiz/page.tsx) — extraído pra cá também
// pra permitir que o painel de métricas (app/admin) rotule cada passo do
// funil com o texto real da pergunta, em vez de só um número de índice.

export type Option = { label: string; icon: string };
export type MultiOption = { label: string; value: string; icon: string };

export type QuizItem =
  | { type: "question"; key: string; question: string; options: Option[] }
  | { type: "multi"; key: string; question: string; subtitle?: string; options: MultiOption[] }
  | { type: "insight"; title: string; text: string }
  | { type: "social"; title: string; subtitle: string }
  | { type: "input"; key: string; question: string; subtitle?: string; inputType: "text" | "number"; placeholder: string; suffix?: string; allowNone?: string };

export const QUIZ_ITEMS: QuizItem[] = [
  {
    type: "question",
    key: "sexo",
    question: "Você é...",
    options: [
      { label: "Homem", icon: "👨" },
      { label: "Mulher", icon: "👩" },
    ],
  },
  {
    type: "question",
    key: "idade",
    question: "Qual sua faixa de idade?",
    options: [
      { label: "18–25 anos", icon: "🧑" },
      { label: "26–35 anos", icon: "🧑" },
      { label: "36–45 anos", icon: "🧑" },
      { label: "46+ anos", icon: "🧑" },
    ],
  },
  {
    type: "social",
    title: "Pessoas reais treinando com o Evofit",
    subtitle: "Gente comum, com rotina corrida, que decidiu colocar o corpo e a mente em primeiro lugar",
  },
  {
    type: "question",
    key: "experiencia",
    question: "Você já treinou em academia antes?",
    options: [
      { label: "Nunca treinei", icon: "🌱" },
      { label: "Já treinei, mas parei", icon: "⏸️" },
      { label: "Treino de vez em quando", icon: "🔄" },
      { label: "Treino regularmente e quero evoluir", icon: "📈" },
    ],
  },
  {
    type: "question",
    key: "objetivo",
    question: "Qual é o seu objetivo principal?",
    options: [
      { label: "Perder gordura", icon: "🔥" },
      { label: "Ganhar músculo", icon: "💪" },
      { label: "Melhorar disposição e saúde", icon: "⚡" },
      { label: "Só sair do sedentarismo", icon: "🚶" },
    ],
  },
  {
    type: "question",
    key: "condicionamento",
    question: "Como você descreveria seu condicionamento hoje?",
    options: [
      { label: "Fico sem fôlego fácil", icon: "😮‍💨" },
      { label: "Consigo me exercitar um pouco", icon: "🙂" },
      { label: "Aguento bem esforço moderado", icon: "💪" },
      { label: "Estou em boa forma, mas quero mais", icon: "🏆" },
    ],
  },
  {
    type: "insight",
    title: "Seu ponto de partida não define seu resultado",
    text: "Não importa se você nunca treinou ou já tentou várias vezes — o que muda o jogo é ter um plano que se encaixa na sua rotina real, não na rotina ideal que ninguém tem.",
  },
  {
    type: "question",
    key: "tentativas",
    question: "Você já tentou treinar antes e não conseguiu manter?",
    options: [
      { label: "Várias vezes", icon: "🔁" },
      { label: "Uma ou duas vezes", icon: "✌️" },
      { label: "Nunca tentei de verdade", icon: "🆕" },
      { label: "Treino, mas sempre travo em algum ponto", icon: "🚧" },
    ],
  },
  {
    type: "question",
    key: "obstaculo",
    question: "O que mais te atrapalha a manter uma rotina de treino?",
    options: [
      { label: "Falta de tempo", icon: "⏰" },
      { label: "Falta de motivação", icon: "🔋" },
      { label: "Não saber o que fazer", icon: "❓" },
      { label: "Cansaço no fim do dia", icon: "😴" },
    ],
  },
  {
    type: "insight",
    title: "Consistência importa mais que intensidade",
    text: "20 minutos de treino feitos toda semana valem mais do que 2 horas uma vez por mês. É por isso que o plano se adapta ao tempo que você realmente tem — não ao tempo que você acha que deveria ter.",
  },
  {
    type: "question",
    key: "diasTreino",
    question: "Quantos dias por semana você consegue treinar?",
    options: [
      { label: "2 dias", icon: "🗓️" },
      { label: "3 dias", icon: "📅" },
      { label: "4 dias", icon: "🔥" },
      { label: "5+ dias", icon: "🚀" },
    ],
  },
  {
    type: "question",
    key: "tempoTreino",
    question: "Quanto tempo você tem disponível por treino?",
    options: [
      { label: "40 min", icon: "⏱️" },
      { label: "1h", icon: "⏰" },
      { label: "1h30", icon: "🕐" },
    ],
  },
  {
    type: "question",
    key: "alimentacao",
    question: "Como está sua alimentação hoje?",
    options: [
      { label: "Bem desorganizada", icon: "🍔" },
      { label: "Tento comer bem, mas erro no fim de semana", icon: "⚖️" },
      { label: "Já como razoavelmente bem", icon: "🥗" },
      { label: "Não sei nem por onde começar a dieta", icon: "❓" },
    ],
  },
  {
    type: "insight",
    title: "Treino e dieta andam juntos",
    text: "Treinar sem ajustar a alimentação é como remar contra a maré. Por isso o Evofit monta os dois ao mesmo tempo — sem dieta restritiva, sem cortar tudo que você gosta.",
  },
  {
    type: "question",
    key: "sono",
    question: "Como está sua qualidade de sono?",
    options: [
      { label: "Durmo mal", icon: "😵" },
      { label: "Durmo razoável", icon: "😐" },
      { label: "Durmo bem", icon: "😴" },
      { label: "Varia muito", icon: "🔄" },
    ],
  },
  {
    type: "question",
    key: "vergonha",
    question: "Você sente vergonha ou insegurança de treinar perto de outras pessoas?",
    options: [
      { label: "Sim, bastante", icon: "😳" },
      { label: "Um pouco", icon: "🙈" },
      { label: "Não, mas não sei o que fazer", icon: "🤷" },
      { label: "Não tenho vergonha", icon: "💪" },
    ],
  },
  {
    type: "question",
    key: "bloqueio",
    question: 'O que mais pesa quando você pensa em "treinar" ou "fazer dieta"?',
    options: [
      { label: "Vergonha de começar do zero", icon: "😳" },
      { label: "Medo de gastar e não dar certo", icon: "💸" },
      { label: "Não saber montar treino/dieta sozinho(a)", icon: "🧩" },
      { label: "Ninguém pra cobrar/confiar", icon: "🤝" },
    ],
  },
  {
    type: "question",
    key: "procrastinacao",
    question: 'Quantas vezes você já disse "segunda-feira eu começo"?',
    options: [
      { label: "Perdi a conta de tantas vezes", icon: "🔁" },
      { label: "Comecei, mas parei já na primeira semana", icon: "⏸️" },
      { label: "Essa seria minha primeira vez de verdade", icon: "✨" },
      { label: "Pra mim não é sobre dia — é não saber por onde começar", icon: "🧭" },
    ],
  },
  {
    type: "question",
    key: "identificacao",
    question: "Qual dessas frases mais parece com você agora?",
    options: [
      { label: "Cuido de todo mundo e nunca sobra tempo pra mim", icon: "❤️" },
      { label: "Já tentei academia ou dieta um monte de vezes e não colou", icon: "🔁" },
      { label: "Vivo cansada(o), sem energia nem pras minhas coisas", icon: "🔋" },
      { label: "Quero mudar, mas não sei nem por onde começar", icon: "🧭" },
    ],
  },
  {
    type: "insight",
    title: "Só faltam alguns dados pra deixar seu plano 100% preciso",
    text: "Treino e dieta calculados certinho pro SEU corpo — não uma média genérica. Leva 30 segundos.",
  },
  {
    type: "input",
    key: "exercicioNaoGosta",
    question: "Se você já treina, qual exercício você não gosta?",
    subtitle: "Isso não significa que você não irá fazer, mas sim de buscarmos formas de melhor aderência ao treino montado.",
    inputType: "text",
    placeholder: "Ex: agachamento, esteira...",
    allowNone: "Nenhum",
  },
  {
    type: "input",
    key: "idadeExata",
    question: "Qual sua idade exata?",
    inputType: "number",
    placeholder: "Ex: 28",
  },
  {
    type: "input",
    key: "peso",
    question: "Qual seu peso atual?",
    inputType: "number",
    placeholder: "Ex: 70",
    suffix: "kg",
  },
  {
    type: "input",
    key: "altura",
    question: "Qual sua altura?",
    inputType: "number",
    placeholder: "Ex: 170",
    suffix: "cm",
  },
  {
    type: "multi",
    key: "lesoes",
    question: "Você tem alguma dessas condições?",
    subtitle: "Selecione todas que se aplicam — seu treino é montado evitando o que puder piorar cada uma delas.",
    options: [
      { label: "Condromalácia (desgaste da cartilagem do joelho)", value: "Condromalácia", icon: "🦵" },
      { label: "Outra lesão no joelho (menisco, ligamento, tendinite patelar)", value: "Joelho", icon: "🦵" },
      { label: "Dor lombar ou hérnia de disco", value: "Coluna/lombar", icon: "🧍" },
      { label: "Dor no ombro (tendinite, bursite, luxação)", value: "Ombro", icon: "💪" },
      { label: "Tendinite ou dor no punho/cotovelo", value: "Punho/Cotovelo", icon: "✋" },
      { label: "Dor no quadril (bursite, impacto femoroacetabular)", value: "Quadril", icon: "🦴" },
      { label: "Entorses frequentes ou instabilidade no tornozelo", value: "Tornozelo", icon: "🦶" },
      { label: "Osteoporose ou osteopenia", value: "Osteoporose", icon: "🩻" },
      { label: "Hipertensão ou outro problema cardiovascular", value: "Cardiovascular", icon: "❤️" },
      { label: "Diabetes", value: "Diabetes", icon: "🩸" },
      { label: "Outra condição não listada", value: "Outra", icon: "❓" },
      { label: "Nenhuma dessas", value: "Nenhuma", icon: "✅" },
    ],
  },
  {
    type: "insight",
    title: "Sua anamnese está passando por uma avaliação",
    text: "Antes do seu treino ser liberado, nossa equipe confere suas respostas pra garantir que ele faz sentido pro seu corpo, sua rotina e suas condições de saúde — não é só um algoritmo cuspindo um treino genérico.",
  },
];

/** Rótulo curto de cada passo — usado no funil do painel de métricas. */
export function quizStepLabel(index: number): string {
  const item = QUIZ_ITEMS[index];
  if (!item) return `Passo ${index}`;
  if (item.type === "insight" || item.type === "social") return item.title;
  return item.question;
}
