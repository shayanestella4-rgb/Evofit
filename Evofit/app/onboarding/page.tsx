"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { AnamneseData } from "@/lib/types";

type Field = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "radio" | "checkbox";
  placeholder?: string;
  options?: string[];
  optionValues?: string[];
};

type Step = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  fields: Field[];
};

const STEPS: Step[] = [
  {
    id: "perfil",
    title: "Seu perfil",
    subtitle: "Vamos te conhecer melhor",
    emoji: "👤",
    fields: [
      { key: "nome", label: "Como você quer ser chamado?", type: "text", placeholder: "Seu nome" },
      { key: "idade", label: "Qual a sua idade?", type: "number", placeholder: "Ex: 28" },
      { key: "sexo", label: "Sexo biológico", type: "select", options: ["Feminino", "Masculino"] },
    ],
  },
  {
    id: "medidas",
    title: "Suas medidas",
    subtitle: "Para calcular seu IMC e calorias",
    emoji: "📏",
    fields: [
      { key: "peso", label: "Peso atual (kg)", type: "number", placeholder: "Ex: 70" },
      { key: "altura", label: "Altura (cm)", type: "number", placeholder: "Ex: 170" },
    ],
  },
  {
    id: "objetivo",
    title: "Seu objetivo",
    subtitle: "O que você quer conquistar?",
    emoji: "🎯",
    fields: [
      {
        key: "objetivo",
        label: "Qual é o seu principal objetivo?",
        type: "radio",
        options: ["Perder gordura", "Ganhar músculo", "Melhorar condicionamento", "Mais disposição e saúde"],
      },
      {
        key: "nivel",
        label: "Seu nível de experiência",
        type: "radio",
        options: ["Iniciante (nunca treinei)", "Básico (treino às vezes)", "Intermediário (treino regularmente)"],
      },
    ],
  },
  {
    id: "rotina",
    title: "Sua rotina",
    subtitle: "Para montar um plano que encaixa na sua vida",
    emoji: "📅",
    fields: [
      {
        key: "diasTreino",
        label: "Quantos dias por semana você pode treinar?",
        type: "radio",
        options: ["2 dias", "3 dias", "4 dias", "5+ dias"],
      },
      {
        key: "periodo",
        label: "Qual período você prefere treinar?",
        type: "radio",
        options: ["Manhã", "Tarde", "Noite", "Indiferente"],
      },
    ],
  },
  {
    id: "saude",
    title: "Saúde & histórico",
    subtitle: "Para garantir um plano seguro para você",
    emoji: "🏥",
    fields: [
      {
        key: "lesoes",
        label: "Você tem alguma dessas condições? Selecione todas que se aplicam.",
        type: "checkbox",
        options: [
          "Condromalácia (desgaste da cartilagem do joelho)",
          "Outra lesão no joelho (menisco, ligamento, tendinite patelar)",
          "Dor lombar ou hérnia de disco",
          "Dor no ombro (tendinite, bursite, luxação)",
          "Tendinite ou dor no punho/cotovelo",
          "Dor no quadril (bursite, impacto femoroacetabular)",
          "Entorses frequentes ou instabilidade no tornozelo",
          "Osteoporose ou osteopenia",
          "Outra condição não listada",
          "Nenhuma dessas",
        ],
        optionValues: ["Condromalácia", "Joelho", "Coluna/lombar", "Ombro", "Punho/Cotovelo", "Quadril", "Tornozelo", "Osteoporose", "Outra", "Nenhuma"],
      },
      {
        key: "sono",
        label: "Como está sua qualidade de sono?",
        type: "radio",
        options: ["Durmo bem (7h+)", "Durmo mal (menos de 6h)", "Irregular"],
      },
    ],
  },
];

type FormData = Record<string, string | string[]>;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({});
  const router = useRouter();
  const { saveAnamnese } = useApp();

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  function setValue(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCheckbox(key: string, value: string) {
    setData((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
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

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Último passo: salva tudo no contexto (localStorage) e vai pro dashboard
      saveAnamnese(data as unknown as AnamneseData);
      router.push("/dashboard");
    }
  }

  function back() {
    setStep((s) => s - 1);
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
      {/* Top bar */}
      <div className="px-6 pt-8 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#C084FC]">Evofit</span>
          <span className="text-xs text-[#CBD5E0]">
            {step + 1} de {STEPS.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-[#1E1035] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 pt-6 pb-8">
        <div className="animate-fade-in" key={step}>
          <div className="text-4xl mb-4">{current.emoji}</div>
          <h1 className="text-2xl font-extrabold text-[#F0F0F0] mb-1">{current.title}</h1>
          <p className="text-sm text-[#B8B8B8] mb-8">{current.subtitle}</p>

          <div className="space-y-6">
            {current.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-[#C0C0C0] mb-3">
                  {field.label}
                </label>

                {field.type === "text" || field.type === "number" ? (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={data[field.key] ?? ""}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    className="w-full border border-[#2D2D2D] rounded-[0.75rem] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#CBD5E0] focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#EDE9FE] transition-all"
                  />
                ) : field.type === "select" ? (
                  <div className="flex gap-3">
                    {field.options!.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setValue(field.key, opt)}
                        className={`flex-1 py-3 rounded-[0.75rem] text-sm font-semibold border transition-all ${
                          data[field.key] === opt
                            ? "bg-[#A855F7] text-white border-[#A855F7]"
                            : "bg-white text-[#C0C0C0] border-[#2D2D2D] hover:border-[#A855F7]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : field.type === "radio" ? (
                  <div className="space-y-2">
                    {field.options!.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setValue(field.key, opt)}
                        className={`w-full text-left px-4 py-3 rounded-[0.75rem] text-sm font-medium border transition-all flex items-center gap-3 ${
                          data[field.key] === opt
                            ? "bg-[#1E1035] text-[#C084FC] border-[#A855F7]"
                            : "bg-white text-[#C0C0C0] border-[#2D2D2D] hover:border-[#C4B5FD]"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            data[field.key] === opt ? "border-[#A855F7]" : "border-[#3A3A3A]"
                          }`}
                        >
                          {data[field.key] === opt && (
                            <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
                          )}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : field.type === "checkbox" ? (
                  <div className="space-y-2">
                    {field.options!.map((opt, i) => {
                      const value = field.optionValues ? field.optionValues[i] : opt;
                      const selected = Array.isArray(data[field.key]) && (data[field.key] as string[]).includes(value);
                      return (
                        <button
                          key={value}
                          onClick={() => toggleCheckbox(field.key, value)}
                          className={`w-full text-left px-4 py-3 rounded-[0.75rem] text-sm font-medium border transition-all flex items-center gap-3 ${
                            selected
                              ? "bg-[#1E1035] text-[#C084FC] border-[#A855F7]"
                              : "bg-white text-[#C0C0C0] border-[#2D2D2D] hover:border-[#C4B5FD]"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-[0.25rem] border-2 shrink-0 flex items-center justify-center ${
                              selected ? "border-[#A855F7] bg-[#A855F7]" : "border-[#3A3A3A]"
                            }`}
                          >
                            {selected && <span className="text-white text-[10px]">✓</span>}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-auto pt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={back}
              className="flex-1 border border-[#2D2D2D] text-[#C0C0C0] font-semibold py-4 rounded-[0.75rem] hover:bg-[#1F1F1F] transition-colors"
            >
              Voltar
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 bg-[#A855F7] text-white font-bold py-4 rounded-[0.75rem] hover:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950"
          >
            {step === STEPS.length - 1 ? "Ver meu plano 🚀" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
