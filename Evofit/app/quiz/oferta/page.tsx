"use client";

import Image from "next/image";
import { CAKTO_CHECKOUT_URL } from "@/lib/constants";

function goToCakto() {
  window.location.href = CAKTO_CHECKOUT_URL;
}

const BENEFICIOS = [
  { icon: "🏋️", title: "Treino diário", desc: "Adaptado ao seu tempo e nível — sem precisar montar nada sozinho(a)." },
  { icon: "🥗", title: "Plano alimentar", desc: "Café, almoço, jantar e lanches calculados pra sua rotina." },
  { icon: "⚡", title: "Motivação diária", desc: "Mini tarefas que cuidam da sua cabeça, não só do seu corpo." },
];

const PARA_QUEM = [
  "Quem cuida de todo mundo e nunca sobra tempo pra si mesmo(a)",
  "Quem trabalha o dia inteiro e não tem 2 horas pra academia",
  "Quem já tentou começar antes e não conseguiu manter",
  "Quem quer mudar o corpo e a cabeça, sem gastar rios de dinheiro",
];

const PLANO_BENEFICIOS = [
  "Treino personalizado todos os dias",
  "Dieta feita pra sua rotina",
  "Tarefas motivacionais diárias",
  "Suporte via WhatsApp",
  "Cancele quando quiser",
];

const PROGRESSO = [
  { label: "Energia no dia a dia", hoje: 25, depois: 85 },
  { label: "Consistência de treino", hoje: 15, depois: 80 },
  { label: "Disposição pra cuidar de você", hoje: 20, depois: 90 },
];

const RESULTADOS = ["/resultado-1.png", "/resultado-2.png", "/resultado-3.png"];
const DEPOIMENTOS_FOTOS = [
  "/depoimento-1.png",
  "/depoimento-2.png",
  "/depoimento-3.png",
  "/depoimento-4.png",
  "/depoimento-5.png",
  "/depoimento-6.png",
  "/depoimento-7.png",
];

const COMPARACAO = [
  { item: "Personal trainer", custo: "R$ 300+/mês" },
  { item: "Nutricionista", custo: "R$ 200+/mês" },
  { item: "Evofit (treino + dieta + suporte)", custo: "R$ 27/mês", destaque: true },
];

export default function OfertaPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center px-6 py-16">
      <div className="max-w-md w-full">
        {/* Headline */}
        <div className="text-center mb-10 animate-fade-in">
          <span className="inline-block bg-[#1E1035] text-[#C084FC] text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Seu personal trainer digital
          </span>
          <h1 className="text-3xl font-extrabold text-[#F0F0F0] leading-tight mb-4">
            Chegou a hora de colocar
            <br />
            <span className="text-[#C084FC]">você em primeiro lugar</span>
          </h1>
          <p className="text-[#8A8A8A] leading-relaxed">
            Sem academia lotada, sem plano genérico, sem gastar o que você não tem.
          </p>
        </div>

        {/* Vídeo real do app */}
        <div className="mb-10 animate-slide-up">
          <video
            src="/video-evofit.mp4"
            controls
            playsInline
            className="w-full rounded-[1rem] border border-[#2D2D2D]"
          />
          <p className="text-xs text-[#6B7280] text-center mt-2">
            Veja como o Evofit funciona por dentro
          </p>
        </div>

        {/* Benefícios */}
        <div className="space-y-4 mb-10 animate-slide-up">
          {BENEFICIOS.map((b) => (
            <div
              key={b.title}
              className="bg-[#1A1A1A] rounded-[1rem] p-5 border border-[#2D2D2D] flex gap-4 items-start"
            >
              <div className="w-11 h-11 shrink-0 bg-[#1E1035] rounded-xl flex items-center justify-center text-xl">
                {b.icon}
              </div>
              <div>
                <h3 className="font-bold text-[#F0F0F0] mb-1">{b.title}</h3>
                <p className="text-sm text-[#8A8A8A] leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progresso ilustrativo */}
        <div className="mb-10 animate-slide-up">
          <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-1 text-center">
            O que costuma mudar com constância
          </h2>
          <p className="text-xs text-[#6B7280] text-center mb-5">
            Ilustrativo — seu resultado depende da sua constância
          </p>
          <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1rem] p-5 space-y-5">
            {PROGRESSO.map((p) => (
              <div key={p.label}>
                <p className="text-sm text-[#C0C0C0] mb-2">{p.label}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#2D2D2D] rounded-full overflow-hidden">
                    <div className="h-full bg-[#6B7280] rounded-full" style={{ width: `${p.hoje}%` }} />
                  </div>
                  <span className="text-[10px] text-[#6B7280] w-12">Hoje</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-2 bg-[#2D2D2D] rounded-full overflow-hidden">
                    <div className="h-full bg-[#A855F7] rounded-full" style={{ width: `${p.depois}%` }} />
                  </div>
                  <span className="text-[10px] text-[#C084FC] w-12">Com Evofit</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA intermediário */}
        <button
          onClick={goToCakto}
          className="w-full bg-[#A855F7] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950 mb-10 animate-slide-up"
        >
          Escolher meu plano
        </button>

        {/* Pra quem é */}
        <div className="mb-10 animate-slide-up">
          <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-4 text-center">
            O Evofit é pra você se...
          </h2>
          <ul className="space-y-3">
            {PARA_QUEM.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[#C0C0C0]">
                <span className="text-[#C084FC] shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Resultados reais */}
        <div className="mb-10 animate-slide-up">
          <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-4 text-center">
            Resultados reais de quem já usa
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {RESULTADOS.map((src) => (
              <div key={src} className="relative aspect-square rounded-[0.75rem] overflow-hidden border border-[#2D2D2D]">
                <Image src={src} alt="Antes e depois de um usuário do Evofit" fill className="object-cover object-center" />
              </div>
            ))}
          </div>
        </div>

        {/* Depoimentos reais */}
        <div className="mb-10 animate-slide-up -mx-6">
          <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-4 text-center px-6">
            Quem já está usando
          </h2>
          <div className="flex gap-3 overflow-x-auto px-6 pb-2 snap-x snap-mandatory scrollbar-hide">
            {DEPOIMENTOS_FOTOS.map((src) => (
              <div
                key={src}
                className="relative shrink-0 w-40 aspect-[3/4] rounded-[0.75rem] overflow-hidden border border-[#2D2D2D] snap-start"
              >
                <Image src={src} alt="Depoimento de um usuário do Evofit" fill className="object-cover object-top" />
              </div>
            ))}
          </div>
        </div>

        {/* Comparação de custo */}
        <div className="mb-10 animate-slide-up">
          <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-4 text-center">
            Quanto custaria isso separado?
          </h2>
          <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1rem] overflow-hidden">
            {COMPARACAO.map((c) => (
              <div
                key={c.item}
                className={`flex items-center justify-between px-5 py-4 ${
                  c.destaque ? "bg-[#1E1035]" : "border-b border-[#2D2D2D]"
                }`}
              >
                <span className={`text-sm ${c.destaque ? "text-[#C084FC] font-bold" : "text-[#C0C0C0]"}`}>
                  {c.item}
                </span>
                <span className={`text-sm font-semibold ${c.destaque ? "text-[#C084FC]" : "text-[#8A8A8A]"}`}>
                  {c.custo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Preço */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1rem] p-6 animate-slide-up">
          <p className="text-xs text-[#8A8A8A] uppercase font-semibold tracking-wide mb-1">
            Plano mensal
          </p>
          <p className="text-sm text-[#8A8A8A] mb-1">R$0,90 por dia</p>
          <p className="text-3xl font-extrabold text-[#F0F0F0] mb-5">
            R$27,00<span className="text-base font-semibold text-[#8A8A8A]">/mês</span>
          </p>

          <ul className="space-y-2 mb-6">
            {PLANO_BENEFICIOS.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-[#C0C0C0]">
                <span className="text-[#10B981]">✓</span>
                {b}
              </li>
            ))}
          </ul>

          <button
            onClick={goToCakto}
            className="w-full bg-[#A855F7] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#9333EA] transition-colors shadow-lg shadow-purple-950"
          >
            Escolher meu plano
          </button>
        </div>
      </div>
    </div>
  );
}
