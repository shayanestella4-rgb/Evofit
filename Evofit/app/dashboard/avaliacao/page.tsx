"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Review {
  id:        string;
  name:      string;
  initial:   string;
  stars:     number;
  comment:   string;
  dateLabel: string;
  seed?:     boolean; // reviews fixas de exemplo
}

// ─── Reviews de exemplo ───────────────────────────────────────────────────────

const SEED_REVIEWS: Review[] = [
  {
    id: "seed-1",
    name: "Marcos Oliveira",
    initial: "M",
    stars: 5,
    comment: "Incrível! Finalmente um app de treino que respeita a minha rotina de CLT. Os treinos são curtos, objetivos e o app não me enche de notificação. Já perdi 6kg em dois meses.",
    dateLabel: "há 3 dias",
    seed: true,
  },
  {
    id: "seed-2",
    name: "Camila Ferreira",
    initial: "C",
    stars: 5,
    comment: "A dieta é o que me surpreendeu mais. Sem frescura, sem ingrediente caro — comida de verdade mesmo. Arroz, feijão, frango e resultado aparecendo! Super recomendo.",
    dateLabel: "há 5 dias",
    seed: true,
  },
  {
    id: "seed-3",
    name: "Rafael Santos",
    initial: "R",
    stars: 4,
    comment: "App muito bom, intuitivo e fácil de usar. O que sinto falta é de vídeos demonstrando os exercícios, mas no geral é excelente. Já indiquei para dois amigos.",
    dateLabel: "há 1 semana",
    seed: true,
  },
  {
    id: "seed-4",
    name: "Juliana Costa",
    initial: "J",
    stars: 5,
    comment: "Comecei sem acreditar muito, mas a anamnese personaliza tudo direitinho. Treino há 40 dias e já sinto diferença na disposição e no sono. Valeu cada centavo!",
    dateLabel: "há 2 semanas",
    seed: true,
  },
  {
    id: "seed-5",
    name: "Diego Almeida",
    initial: "D",
    stars: 5,
    comment: "O registro de fotos é genial para ver a evolução. A gente não percebe no espelho mas quando compara as fotos a diferença é absurda. Muito bom mesmo.",
    dateLabel: "há 3 semanas",
    seed: true,
  },
  {
    id: "seed-6",
    name: "Patricia Rocha",
    initial: "P",
    stars: 4,
    comment: "Ótimo aplicativo, bem feito e organizado. Uso todo dia há um mês. Adoraria ter uma opção de treino para academia também, mas o de casa já funciona muito bem.",
    dateLabel: "há 1 mês",
    seed: true,
  },
  {
    id: "seed-7",
    name: "Bruno Mendes",
    initial: "B",
    stars: 5,
    comment: "Nunca consegui manter constância em nenhum app antes. As tarefas diárias e a sequência de dias me motivaram demais. Hoje estou no 28º dia seguido!",
    dateLabel: "há 1 mês",
    seed: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "evofit_reviews";

function loadUserReviews(): Review[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

function saveUserReview(review: Review) {
  const existing = loadUserReviews();
  const updated  = [review, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function calcOverall(reviews: Review[]) {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length;
}

function calcDistribution(reviews: Review[]) {
  const dist = [0, 0, 0, 0, 0]; // índice 0 = 1 estrela … 4 = 5 estrelas
  reviews.forEach((r) => { dist[r.stars - 1]++; });
  return dist;
}

function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-xs", md: "text-base", lg: "text-2xl" };
  return (
    <span className={sizes[size]}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= value ? "text-[#F59E0B]" : "text-[#E5E7EB]"}>★</span>
      ))}
    </span>
  );
}

function ClickableStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl leading-none transition-transform active:scale-90 hover:scale-110"
        >
          <span className={(hovered || value) >= s ? "text-[#F59E0B]" : "text-[#E5E7EB]"}>★</span>
        </button>
      ))}
    </div>
  );
}

const MONTHS = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AvaliacaoPage() {
  const { anamnese } = useApp();

  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [stars,   setStars]   = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    setUserReviews(loadUserReviews());
    // verifica se já avaliou
    const already = loadUserReviews().some((r) => !r.seed);
    setSubmitted(already);
  }, []);

  const allReviews   = [...userReviews, ...SEED_REVIEWS];
  const overall      = calcOverall(allReviews);
  const dist         = calcDistribution(allReviews);
  const totalReviews = allReviews.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (stars === 0)         { setError("Selecione uma nota de 1 a 5 estrelas."); return; }
    if (comment.trim() === "") { setError("Escreva um comentário antes de enviar."); return; }

    const review: Review = {
      id:        `user-${Date.now()}`,
      name:      anamnese?.nome ? anamnese.nome.split(" ")[0] : "Você",
      initial:   (anamnese?.nome ?? "V").charAt(0).toUpperCase(),
      stars,
      comment:   comment.trim(),
      dateLabel: "agora",
    };

    saveUserReview(review);
    setUserReviews(loadUserReviews());
    setSubmitted(true);
    setError("");
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-8">

      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/perfil" className="inline-flex items-center gap-1 text-xs text-[#7C3AED] font-semibold mb-4 hover:underline">
          ← Voltar ao perfil
        </Link>
        <h1 className="text-2xl font-extrabold text-[#111827]">Avaliações</h1>
        <p className="text-sm text-[#6B7280] mt-1">Veja o que os alunos estão dizendo</p>
      </div>

      {/* Nota geral */}
      <div className="bg-white rounded-[1rem] border border-[#E5E7EB] p-5 mb-4">
        <div className="flex items-center gap-6">
          {/* Nota grande */}
          <div className="text-center shrink-0">
            <p className="text-5xl font-extrabold text-[#111827] leading-none">
              {overall.toFixed(1)}
            </p>
            <Stars value={Math.round(overall)} size="md" />
            <p className="text-[10px] text-[#9CA3AF] mt-1">{totalReviews} avaliações</p>
          </div>

          {/* Barras de distribuição */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dist[star - 1];
              const pct   = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#6B7280] w-3 shrink-0">{star}</span>
                  <span className="text-[10px] text-[#F59E0B]">★</span>
                  <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] w-7 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Formulário de avaliação */}
      {submitted ? (
        <div className="bg-[#F0FDF4] rounded-[1rem] border border-[#BBF7D0] p-5 mb-4 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm font-bold text-[#15803D]">Obrigado pela sua avaliação!</p>
          <p className="text-xs text-[#166534] mt-1">Seu feedback nos ajuda a melhorar o app.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[1rem] border border-[#E5E7EB] p-5 mb-4"
        >
          <p className="text-sm font-bold text-[#111827] mb-4">⭐ Deixe sua avaliação</p>

          {/* Estrelas clicáveis */}
          <div className="mb-4">
            <p className="text-xs text-[#6B7280] mb-2">Sua nota</p>
            <ClickableStars value={stars} onChange={setStars} />
            {stars > 0 && (
              <p className="text-xs text-[#9CA3AF] mt-1">
                {["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente!"][stars]}
              </p>
            )}
          </div>

          {/* Campo de comentário */}
          <div className="mb-4">
            <p className="text-xs text-[#6B7280] mb-2">Seu comentário</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sua experiência com o Evofit..."
              maxLength={400}
              rows={4}
              className="w-full text-sm text-[#111827] placeholder-[#9CA3AF] bg-[#FAF7F2] border border-[#E5E7EB] rounded-[0.75rem] px-3 py-2.5 resize-none focus:outline-none focus:border-[#F59E0B] transition-colors"
            />
            <p className="text-[10px] text-[#9CA3AF] text-right mt-0.5">
              {comment.length}/400
            </p>
          </div>

          {error && (
            <p className="text-xs text-[#EF4444] mb-3">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#7C3AED] text-white font-bold py-3 rounded-[0.75rem] text-sm hover:bg-[#6D28D9] transition-colors active:scale-[0.98]"
          >
            Enviar avaliação
          </button>
        </form>
      )}

      {/* Lista de comentários */}
      <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">
        Comentários dos alunos
      </p>

      <div className="space-y-3">
        {allReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-[1rem] border border-[#E5E7EB] p-4"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {review.initial}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#111827] truncate">{review.name}</p>
                  <span className="text-[10px] text-[#9CA3AF] shrink-0">{review.dateLabel}</span>
                </div>
                <Stars value={review.stars} size="sm" />
                <p className="text-xs text-[#374151] leading-relaxed mt-1.5">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
