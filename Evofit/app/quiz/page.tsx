"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";

const META_PIXEL_ID = "1481794462680728";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type Phase = "hook" | "quiz" | "analyzing" | "chat";

type Option = { label: string; icon: string };
type MultiOption = { label: string; value: string; icon: string };

type QuizItem =
  | { type: "question"; key: string; question: string; options: Option[] }
  | { type: "multi"; key: string; question: string; subtitle?: string; options: MultiOption[] }
  | { type: "insight"; title: string; text: string }
  | { type: "social"; title: string; subtitle: string }
  | { type: "input"; key: string; question: string; inputType: "text" | "number"; placeholder: string; suffix?: string };

const ORBIT_CENTER = "/pessoas/user-1.png";
const ORBIT_RING = [
  "/pessoas/user-2.png",
  "/pessoas/user-3.png",
  "/pessoas/user-4.png",
  "/pessoas/user-5.png",
  "/pessoas/user-6.png",
  "/pessoas/user-7.png",
  "/pessoas/user-8.png",
  "/pessoas/user-9.png",
];

const QUIZ_ITEMS: QuizItem[] = [
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
    key: "local",
    question: "Prefere treinar em casa ou na academia?",
    options: [
      { label: "Em casa", icon: "🏠" },
      { label: "Na academia", icon: "🏋️" },
      { label: "Os dois", icon: "🔀" },
      { label: "Ainda não decidi", icon: "🤔" },
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
      { label: "Outra condição não listada", value: "Outra", icon: "❓" },
      { label: "Nenhuma dessas", value: "Nenhuma", icon: "✅" },
    ],
  },
  {
    type: "question",
    key: "periodo",
    question: "Qual período você prefere treinar?",
    options: [
      { label: "Manhã", icon: "🌅" },
      { label: "Tarde", icon: "🌤️" },
      { label: "Noite", icon: "🌙" },
      { label: "Indiferente", icon: "🔀" },
    ],
  },
];

const ANSWERABLE = QUIZ_ITEMS.filter(
  (i): i is Extract<QuizItem, { type: "question" | "input" | "multi" }> =>
    i.type === "question" || i.type === "input" || i.type === "multi",
);

const BLOQUEIO_INSIGHT: Record<string, string> = {
  "Vergonha de começar do zero":
    "vi que a vergonha de começar do zero é seu maior travamento — aqui ninguém te julga",
  "Medo de gastar e não dar certo":
    "vi que o medo de gastar é seu maior travamento — o Evofit custa menos que um lanche por dia",
  "Não saber montar treino/dieta sozinho(a)":
    "vi que não saber montar treino sozinho(a) é seu maior travamento — é pra isso que eu existo",
  "Ninguém pra cobrar/confiar":
    "vi que faltar alguém pra te cobrar é seu maior travamento — isso é literalmente meu trabalho",
};

function buildChatMessages(bloqueio: string | undefined): string[] {
  const insight = (bloqueio && BLOQUEIO_INSIGHT[bloqueio]) || "vi exatamente onde você trava";

  return [
    "oi, aqui é a Evo 👋",
    insight,
    "nada de app genérico ou personal caro cobrando R$150+",
    "um plano que treina você onde você tá, e cuida da sua cabeça também",
    "já comecei seu plano...",
    "olha rapidinho como funciona 👇",
  ];
}

function mapNivel(experiencia: string | undefined): string {
  if (experiencia === "Treino regularmente e quero evoluir") return "Intermediário (treino regularmente)";
  if (experiencia === "Treino de vez em quando") return "Básico (treino às vezes)";
  return "Iniciante (nunca treinei)";
}

function buildAnamnese(answers: Record<string, string>, multi: Record<string, string[]>) {
  return {
    idade: answers.idadeExata,
    sexo: answers.sexo,
    peso: answers.peso,
    altura: answers.altura,
    objetivo: answers.objetivo,
    nivel: mapNivel(answers.experiencia),
    diasTreino: answers.diasTreino,
    periodo: answers.periodo,
    lesoes: multi.lesoes ?? [],
    sono: answers.sono,
  };
}

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hook");
  const [itemIndex, setItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({});
  const [inputValue, setInputValue] = useState("");
  const [chatCount, setChatCount] = useState(0);

  const messages = buildChatMessages(answers.bloqueio);
  const currentItem = QUIZ_ITEMS[itemIndex];
  const answerNumber = QUIZ_ITEMS.slice(0, itemIndex + 1).filter(
    (i) => i.type === "question" || i.type === "input" || i.type === "multi",
  ).length;

  useEffect(() => {
    setInputValue("");
  }, [itemIndex]);

  // Revela as mensagens da Evo uma por uma
  useEffect(() => {
    if (phase !== "chat") return;
    if (chatCount >= messages.length) return;
    const t = setTimeout(() => setChatCount((c) => c + 1), 700);
    return () => clearTimeout(t);
  }, [phase, chatCount, messages.length]);

  // Tela de "analisando"
  useEffect(() => {
    if (phase !== "analyzing") return;
    window.fbq?.("track", "Lead");
    const t = setTimeout(() => setPhase("chat"), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  function goToNext(latestAnswers: Record<string, string> = answers) {
    if (itemIndex < QUIZ_ITEMS.length - 1) {
      setItemIndex((i) => i + 1);
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("evofit_anamnese", JSON.stringify(buildAnamnese(latestAnswers, multiAnswers)));
      }
      setPhase("analyzing");
    }
  }

  function selectAnswer(key: string, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    goToNext(next);
  }

  function toggleMultiOption(key: string, value: string) {
    setMultiAnswers((prev) => {
      const current = prev[key] ?? [];
      let next: string[];
      if (value === "Nenhuma") {
        next = current.includes("Nenhuma") ? [] : ["Nenhuma"];
      } else if (current.includes(value)) {
        next = current.filter((v) => v !== value);
      } else {
        next = [...current.filter((v) => v !== "Nenhuma"), value];
      }
      return { ...prev, [key]: next };
    });
  }

  function goBack() {
    if (itemIndex > 0) {
      setItemIndex((i) => i - 1);
    } else {
      setPhase("hook");
    }
  }

  const BackButton = (
    <button
      onClick={goBack}
      aria-label="Voltar"
      className="text-[#8A8A8A] hover:text-[#F0F0F0] transition-colors mb-4 -ml-1 w-8 h-8 flex items-center justify-center"
    >
      ←
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {phase === "hook" && (
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 py-16 text-center animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F0F0F0] leading-tight mb-4">
            Esse aplicativo está ajudando homens e mulheres a{" "}
            <span className="text-[#C084FC]">treinar e emagrecer</span> de forma
            simples e eficaz
          </h1>
          <p className="text-[#8A8A8A] mb-8 leading-relaxed">
            Responda esse teste gratuito de apenas 2 minutos e aprenda 👇
          </p>

          <div className="grid grid-cols-2 gap-3 mb-10">
            <div className="relative aspect-square rounded-[1rem] overflow-hidden border border-[#2D2D2D]">
              <Image
                src="/antes-depois-1.png"
                alt="Antes e depois de uma usuária do Evofit"
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="relative aspect-square rounded-[1rem] overflow-hidden border border-[#2D2D2D]">
              <Image
                src="/antes-depois-homem.png"
                alt="Antes e depois de um usuário do Evofit"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>

          <button
            onClick={() => setPhase("quiz")}
            className="bg-[#A855F7] text-white font-bold px-8 py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950"
          >
            Quero aprender mais
          </button>

          <p className="text-xs text-[#6B7280] mt-6">
            Feito para quem nunca teve tempo de treinar.
          </p>
        </div>
      )}

      {phase === "quiz" && currentItem.type === "question" && (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 pt-10 pb-8">
          {BackButton}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#C084FC]">Evofit</span>
            <span className="text-xs text-[#8A8A8A]">
              {answerNumber} de {ANSWERABLE.length}
            </span>
          </div>
          <div className="h-1.5 bg-[#1E1035] rounded-full overflow-hidden mb-10">
            <div
              className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${(answerNumber / ANSWERABLE.length) * 100}%` }}
            />
          </div>

          <div className="flex-1 animate-fade-in" key={itemIndex}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-8 leading-snug">
              {currentItem.question}
            </h2>
            <div className="space-y-3">
              {currentItem.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => selectAnswer(currentItem.key, opt.label)}
                  className="w-full flex items-center justify-between gap-4 text-left px-4 py-4 rounded-[0.75rem] text-sm font-medium border border-[#2D2D2D] text-[#C0C0C0] bg-[#1A1A1A] hover:border-[#A855F7] hover:text-[#F0F0F0] transition-all"
                >
                  <span>{opt.label}</span>
                  <span className="shrink-0 w-9 h-9 flex items-center justify-center text-lg bg-[#1E1035] rounded-lg">
                    {opt.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "quiz" && currentItem.type === "input" && (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 pt-10 pb-8">
          {BackButton}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#C084FC]">Evofit</span>
            <span className="text-xs text-[#8A8A8A]">
              {answerNumber} de {ANSWERABLE.length}
            </span>
          </div>
          <div className="h-1.5 bg-[#1E1035] rounded-full overflow-hidden mb-10">
            <div
              className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${(answerNumber / ANSWERABLE.length) * 100}%` }}
            />
          </div>

          <div className="flex-1 animate-fade-in" key={itemIndex}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-8 leading-snug">
              {currentItem.question}
            </h2>
            <div className="relative">
              <input
                type={currentItem.inputType}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentItem.placeholder}
                autoFocus
                className="w-full border border-[#2D2D2D] bg-[#1A1A1A] rounded-[0.75rem] px-4 py-4 text-sm text-[#F0F0F0] placeholder-[#6B7280] focus:outline-none focus:border-[#A855F7] transition-all"
              />
              {currentItem.suffix && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
                  {currentItem.suffix}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => selectAnswer(currentItem.key, inputValue.trim())}
            disabled={!inputValue.trim()}
            className="w-full bg-[#A855F7] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950 disabled:opacity-40"
          >
            Continuar
          </button>
        </div>
      )}

      {phase === "quiz" && currentItem.type === "multi" && (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 pt-10 pb-8">
          {BackButton}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#C084FC]">Evofit</span>
            <span className="text-xs text-[#8A8A8A]">
              {answerNumber} de {ANSWERABLE.length}
            </span>
          </div>
          <div className="h-1.5 bg-[#1E1035] rounded-full overflow-hidden mb-10">
            <div
              className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${(answerNumber / ANSWERABLE.length) * 100}%` }}
            />
          </div>

          <div className="flex-1 animate-fade-in overflow-y-auto" key={itemIndex}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-2 leading-snug">
              {currentItem.question}
            </h2>
            {currentItem.subtitle && (
              <p className="text-xs text-[#8A8A8A] mb-6 leading-relaxed">{currentItem.subtitle}</p>
            )}
            <div className="space-y-3">
              {currentItem.options.map((opt) => {
                const selected = (multiAnswers[currentItem.key] ?? []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleMultiOption(currentItem.key, opt.value)}
                    className={`w-full flex items-center justify-between gap-4 text-left px-4 py-4 rounded-[0.75rem] text-sm font-medium border transition-all ${
                      selected
                        ? "border-[#A855F7] bg-[#1E1035] text-[#F0F0F0]"
                        : "border-[#2D2D2D] bg-[#1A1A1A] text-[#C0C0C0] hover:border-[#A855F7] hover:text-[#F0F0F0]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded-[0.375rem] border-2 shrink-0 flex items-center justify-center ${
                          selected ? "border-[#A855F7] bg-[#A855F7]" : "border-[#3A3A3A]"
                        }`}
                      >
                        {selected && <span className="text-white text-xs">✓</span>}
                      </span>
                      {opt.label}
                    </span>
                    <span className="shrink-0 w-9 h-9 flex items-center justify-center text-lg bg-[#1E1035] rounded-lg">
                      {opt.icon}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => goToNext()}
            disabled={(multiAnswers[currentItem.key] ?? []).length === 0}
            className="w-full mt-6 bg-[#A855F7] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950 disabled:opacity-40"
          >
            Continuar
          </button>
        </div>
      )}

      {phase === "quiz" && currentItem.type === "insight" && (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 pt-10 pb-8">
          {BackButton}
          <div className="h-1.5 bg-[#1E1035] rounded-full overflow-hidden mb-10">
            <div
              className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${(answerNumber / ANSWERABLE.length) * 100}%` }}
            />
          </div>
          <div className="flex-1 flex flex-col justify-center animate-fade-in" key={itemIndex}>
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1rem] p-6 mb-8">
              <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-3 leading-snug">
                {currentItem.title}
              </h2>
              <p className="text-sm text-[#8A8A8A] leading-relaxed">{currentItem.text}</p>
            </div>
            <button
              onClick={() => goToNext()}
              className="w-full bg-[#A855F7] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {phase === "quiz" && currentItem.type === "social" && (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 pt-10 pb-8">
          {BackButton}
          <div className="h-1.5 bg-[#1E1035] rounded-full overflow-hidden mb-10">
            <div
              className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${(answerNumber / ANSWERABLE.length) * 100}%` }}
            />
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in" key={itemIndex}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-2 leading-snug">
              {currentItem.title}
            </h2>
            <p className="text-sm text-[#8A8A8A] mb-10 max-w-xs">{currentItem.subtitle}</p>

            <div className="relative w-64 h-64 mb-10">
              {/* Círculos-guia */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#2D2D2D]" />
              <div className="absolute inset-8 rounded-full border border-dashed border-[#2D2D2D]" />

              {/* Avatar central */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full overflow-hidden border-2 border-[#A855F7] shadow-lg shadow-purple-950 z-10">
                <Image src={ORBIT_CENTER} alt="Usuário do Evofit" width={80} height={80} className="w-full h-full object-cover" />
              </div>

              {/* Avatares em órbita */}
              {ORBIT_RING.map((src, i) => {
                const angle = (i / ORBIT_RING.length) * 2 * Math.PI;
                const radius = 118;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <div
                    key={src}
                    className="absolute top-1/2 left-1/2 w-11 h-11 rounded-full overflow-hidden border-2 border-[#2D2D2D]"
                    style={{ transform: `translate(${x - 22}px, ${y - 22}px)` }}
                  >
                    <Image src={src} alt="Usuário do Evofit" width={44} height={44} className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => goToNext()}
              className="w-full bg-[#A855F7] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-10 h-10 border-4 border-[#2D2D2D] border-t-[#A855F7] rounded-full animate-spin mb-6" />
          <p className="text-[#8A8A8A] text-sm">Analisando suas respostas...</p>
        </div>
      )}

      {phase === "chat" && (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#A855F7] flex items-center justify-center text-white font-bold">
              E
            </div>
            <div>
              <p className="text-sm font-bold text-[#F0F0F0]">Evo IA</p>
              <p className="text-xs text-[#10B981]">online agora</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {messages.slice(0, chatCount).map((msg, i) => (
              <div
                key={i}
                className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1rem] px-4 py-3 text-sm text-[#F0F0F0] max-w-[85%] animate-fade-in"
              >
                {msg}
              </div>
            ))}
          </div>

          {chatCount >= messages.length && (
            <button
              onClick={() => router.push("/quiz/oferta")}
              className="mt-8 w-full bg-[#A855F7] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950 animate-fade-in"
            >
              Ver como funciona agora
            </button>
          )}
        </div>
      )}
    </div>
  );
}
