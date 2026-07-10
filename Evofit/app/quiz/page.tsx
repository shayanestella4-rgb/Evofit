"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Phase = "hook" | "quiz" | "analyzing" | "chat";

const QUESTIONS = [
  {
    key: "identificacao",
    question: "Qual dessas frases mais parece com você agora?",
    options: [
      "Cuido de todo mundo e nunca sobra tempo pra mim",
      "Já tentei academia ou dieta um monte de vezes e não colou",
      "Vivo cansada(o), sem energia nem pras minhas coisas",
      "Quero mudar, mas não sei nem por onde começar",
    ],
  },
  {
    key: "procrastinacao",
    question: "Quantas vezes você já disse \"segunda-feira eu começo\"?",
    options: [
      "Perdi a conta de tantas vezes",
      "Comecei, mas parei já na primeira semana",
      "Essa seria minha primeira vez de verdade",
      "Pra mim não é sobre dia — é não saber por onde começar",
    ],
  },
  {
    key: "bloqueio",
    question: 'O que mais pesa quando você pensa em "treinar" ou "fazer dieta"?',
    options: [
      "Vergonha de começar do zero",
      "Medo de gastar e não dar certo",
      "Não saber montar treino/dieta sozinho(a)",
      "Ninguém pra cobrar/confiar",
    ],
  },
  {
    key: "desejo",
    question: "Se em 90 dias seu corpo E sua cabeça estivessem no controle, o que mudaria primeiro?",
    options: [
      "Minha energia no dia a dia",
      "Minha autoestima no espelho",
      "Minha disposição pra cuidar de quem eu amo",
      "Finalmente eu em primeiro lugar, por uma vez",
    ],
  },
];

const BLOQUEIO_INSIGHT: Record<string, string> = {
  "Vergonha de começar do zero":
    "e vi que a vergonha de começar do zero é o que mais te trava — isso é mais comum do que você imagina, e aqui ninguém vai te julgar",
  "Medo de gastar e não dar certo":
    "e vi que o medo de gastar e não dar certo é o que mais te trava — por isso o Evofit custa menos que um lanche por dia",
  "Não saber montar treino/dieta sozinho(a)":
    "e vi que não saber montar treino ou dieta sozinho(a) é o que mais te trava — é exatamente pra isso que eu existo",
  "Ninguém pra cobrar/confiar":
    "e vi que faltar alguém pra cobrar de você é o que mais te trava — é literalmente meu trabalho todo dia",
};

function buildChatMessages(bloqueio: string | undefined): string[] {
  const insight =
    (bloqueio && BLOQUEIO_INSIGHT[bloqueio]) ||
    "e vi exatamente onde você trava hoje";

  return [
    "oi, aqui é a Evo 👋",
    "terminei de analisar suas respostas",
    insight,
    "você não precisa de mais um app de treino genérico",
    "que ninguém segue depois da 2ª semana",
    "nem de personal caro cobrando R$150+ pra te passar o mesmo treino de sempre",
    "você precisa de algo que treine você onde você tá, com o tempo que sobra",
    "e que cuide da sua cabeça também, não só do corpo",
    "comecei a montar seu plano personalizado...",
    "enquanto isso, olha rapidinho como funciona 👇",
  ];
}

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hook");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chatCount, setChatCount] = useState(0);

  const messages = buildChatMessages(answers.bloqueio);

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
    const t = setTimeout(() => setPhase("chat"), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  function selectAnswer(key: string, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setPhase("analyzing");
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {phase === "hook" && (
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 py-16 text-center animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F0F0F0] leading-tight mb-4">
            Chega de vergonha na academia, de procrastinar...
            <br />
            <span className="text-[#C084FC]">e de cuidar de todo mundo, menos de você.</span>
          </h1>
          <p className="text-[#8A8A8A] mb-10 leading-relaxed">
            Em 2 minutos, descubra um plano de treino e dieta que encaixa no
            tempo que você já tem — sem pagar caro por personal e nutricionista.
          </p>

          <div className="bg-[#1E1035] rounded-[1.5rem] p-5 text-left border border-[#2D1B4E] mb-10">
            <span className="inline-block bg-[#2D1B4E] text-[#C084FC] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              💜 SUGESTÃO EVO IA
            </span>
            <p className="text-sm text-[#F0F0F0] leading-relaxed">
              &ldquo;Seu maior travamento não é preguiça — é rotina. E isso muda
              com 20 minutos, não com 2 horas de academia.&rdquo;
            </p>
          </div>

          <button
            onClick={() => setPhase("quiz")}
            className="bg-[#A855F7] text-white font-bold px-8 py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950"
          >
            Começar meu diagnóstico
          </button>

          <p className="text-xs text-[#6B7280] mt-6">
            Feito para quem nunca teve tempo de treinar.
          </p>
        </div>
      )}

      {phase === "quiz" && (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 pt-10 pb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#C084FC]">Evofit</span>
            <span className="text-xs text-[#8A8A8A]">
              {step + 1} de {QUESTIONS.length}
            </span>
          </div>
          <div className="h-1.5 bg-[#1E1035] rounded-full overflow-hidden mb-10">
            <div
              className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          <div className="flex-1 animate-fade-in" key={step}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-8 leading-snug">
              {QUESTIONS[step].question}
            </h2>
            <div className="space-y-3">
              {QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => selectAnswer(QUESTIONS[step].key, opt)}
                  className="w-full text-left px-4 py-4 rounded-[0.75rem] text-sm font-medium border border-[#2D2D2D] text-[#C0C0C0] bg-[#1A1A1A] hover:border-[#A855F7] hover:text-[#F0F0F0] transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
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
