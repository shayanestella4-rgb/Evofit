"use client";

import { useState } from "react";
import Image from "next/image";
import { CAKTO_CHECKOUT_URL } from "@/lib/constants";

function goToCakto() {
  window.location.href = CAKTO_CHECKOUT_URL;
}

const FAQ = [
  {
    q: "E se eu quiser cancelar?",
    a: "Você cancela quando quiser, pelo seu próprio painel, em dois cliques. Não tem fidelidade, não tem multa e não precisa pedir autorização para ninguém. Seu acesso continua até o fim do período que você já pagou.",
  },
  {
    q: "Por quanto tempo tenho acesso ao material?",
    a: "Enquanto sua assinatura estiver ativa, você tem acesso a tudo: os treinos do mês, os meses anteriores que já estão na plataforma, os vídeos de execução e o material de alimentação. Se cancelar, o acesso vai até o fim do período já pago.",
  },
  {
    q: "Os treinos só são de academia?",
    a: "Não, você tem acesso aos treinos executados em academia, mas também tem os HIITs de muay thai para fazer em casa.",
  },
  {
    q: "Tem suporte para tirar dúvidas e corrigir exercícios?",
    a: "Sim. Nosso time de personais está disponível de segunda a sexta para te auxiliar com qualquer dúvida e corrigir seus exercícios, acompanhando sua evolução de perto pelo WhatsApp.",
  },
  {
    q: "Caso eu tiver dúvida da execução, posso mandar um vídeo para saber se estou fazendo certo ou errado?",
    a: "Sim, pode mandar via WhatsApp que te ajudo na execução.",
  },
  {
    q: "Posso treinar mesmo começando do zero?",
    a: "Sim. Os treinos são organizados por nível — iniciante, intermediário e avançado — e o suporte pelo WhatsApp ajuda você a começar pelo caminho mais adequado.",
  },
  {
    q: "Como funciona a garantia?",
    a: "Você tem 7 dias após a compra para solicitar o reembolso integral, conforme o Código de Defesa do Consumidor. Basta entrar em contato pelo suporte — sem burocracia.",
  },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mb-4">
      <span className="inline-block bg-[#1F2A1C] text-[#A8B78A] text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3">
        Perguntas frequentes
      </span>
      <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-1">
        Ainda tem alguma <span className="text-[#A8B78A]">dúvida?</span>
      </h2>
      <p className="text-sm text-[#8A8A8A] mb-5">
        Tudo o que você precisa saber antes de começar o Evofit.
      </p>

      <div className="space-y-2.5">
        {FAQ.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[0.75rem] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-sm font-semibold text-[#F0F0F0]">{item.q}</span>
                <span
                  className={`shrink-0 w-6 h-6 rounded-full border border-[#3A3A3A] flex items-center justify-center text-[#8A8A8A] text-xs transition-transform ${
                    isOpen ? "rotate-180 border-[#6B7F56] text-[#A8B78A]" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-xs text-[#8A8A8A] leading-relaxed">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
  "/depoimento-8.png",
];

const COMPARACAO = [
  { item: "Personal trainer", custo: "R$ 300+/mês" },
  { item: "Nutricionista", custo: "R$ 200+/mês" },
  { item: "Evofit (treino + dieta + suporte)", custo: "R$ 97/mês", destaque: true },
];

export default function OfertaPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center px-6 py-16">
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl w-full">
        {/* Headline */}
        <div className="text-center mb-10 animate-fade-in">
          <span className="inline-block bg-[#1F2A1C] text-[#A8B78A] text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Seu personal trainer digital
          </span>
          <h1 className="text-3xl font-extrabold text-[#F0F0F0] leading-tight mb-4">
            Chegou a hora de colocar
            <br />
            <span className="text-[#A8B78A]">você em primeiro lugar</span>
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
              <div className="w-11 h-11 shrink-0 bg-[#1F2A1C] rounded-xl flex items-center justify-center text-xl">
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
                    <div className="h-full bg-[#6B7F56] rounded-full" style={{ width: `${p.depois}%` }} />
                  </div>
                  <span className="text-[10px] text-[#A8B78A] w-12">Com Evofit</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA intermediário */}
        <button
          onClick={goToCakto}
          className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10] mb-10 animate-slide-up"
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
                <span className="text-[#A8B78A] shrink-0">✓</span>
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
        <div className="mb-10 animate-slide-up">
          <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-4 text-center">
            Quem já está usando
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DEPOIMENTOS_FOTOS.map((src) => (
              <div
                key={src}
                className="relative aspect-[3/4] rounded-[0.75rem] overflow-hidden border border-[#2D2D2D]"
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
                  c.destaque ? "bg-[#1F2A1C]" : "border-b border-[#2D2D2D]"
                }`}
              >
                <span className={`text-sm ${c.destaque ? "text-[#A8B78A] font-bold" : "text-[#C0C0C0]"}`}>
                  {c.item}
                </span>
                <span className={`text-sm font-semibold ${c.destaque ? "text-[#A8B78A]" : "text-[#8A8A8A]"}`}>
                  {c.custo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Perguntas frequentes */}
        <div className="mb-4 animate-slide-up">
          <FaqAccordion />
        </div>

        {/* Fale conosco pelo WhatsApp */}
        <a
          href="https://wa.me/551145527512?text=Olá%2C%20estou%20com%20uma%20d%C3%BAvida%20antes%20de%20assinar%20o%20Evofit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full border border-[#25D366]/40 text-[#25D366] font-semibold py-3.5 rounded-[0.75rem] mb-8 hover:bg-[#25D366]/10 transition-colors animate-slide-up"
        >
          <WhatsAppIcon />
          Ainda com dúvida? Fale com a gente pelo WhatsApp
        </a>

        {/* Preço */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1rem] p-6 animate-slide-up">
          <p className="text-xs text-[#8A8A8A] uppercase font-semibold tracking-wide mb-1">
            Plano mensal
          </p>
          <p className="text-sm text-[#8A8A8A] mb-1">R$3,23 por dia</p>
          <p className="text-3xl font-extrabold text-[#F0F0F0] mb-5">
            R$97,00<span className="text-base font-semibold text-[#8A8A8A]">/mês</span>
          </p>

          <ul className="space-y-2 mb-6">
            {PLANO_BENEFICIOS.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-[#C0C0C0]">
                <span className="text-[#10B981]">✓</span>
                {b}
              </li>
            ))}
          </ul>

          {/* Garantia de 7 dias */}
          <div className="bg-[#111] border border-[#2D2D2D] rounded-[1rem] p-4 mb-5 flex items-center gap-3">
            <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#6B7F56] to-[#4A5940] flex flex-col items-center justify-center text-white shadow-lg shadow-[#141a10] border-2 border-[#A8B78A]/40">
              <span className="text-lg font-black leading-none">7</span>
              <span className="text-[7px] font-bold leading-none mt-0.5 tracking-wide">DIAS</span>
            </div>
            <div>
              <span className="inline-block bg-[#1F2A1C] text-[#A8B78A] text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1">
                Compra 100% segura
              </span>
              <p className="text-sm font-extrabold text-[#F0F0F0] mb-0.5">Garantia de 7 dias, sem burocracia</p>
              <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                Se por qualquer motivo você sentir que o Evofit não é pra você, é só entrar em contato
                nos primeiros 7 dias e devolvemos <strong className="text-[#C0C0C0]">100% do seu investimento</strong>.
                Sem pergunta, sem burocracia. O risco é todo nosso.
              </p>
            </div>
          </div>

          <button
            onClick={goToCakto}
            className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10]"
          >
            Escolher meu plano
          </button>
        </div>
      </div>
    </div>
  );
}
