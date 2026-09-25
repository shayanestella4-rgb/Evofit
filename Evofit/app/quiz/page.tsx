"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import {
  STEPS, STEP_INDEX, QUESTIONS, DIM, DIMENSIONS, PERFIL_GROUP, ANALYSIS_LINES, PHRASES,
  PHASES, GLASSES_MAX, GLASS_ML,
  computeResult, dimensionInsight, headline, planSteps, sleepInsight, waterInsight,
  firstName, isValidEmail, normalizeEmail, fmtLiters, PESO_DEFAULT,
  type Answers, type DimKey, type Step, type Result,
} from "@/lib/diagnostico";

const META_PIXEL_ID = "1481794462680728";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function trackQuiz(body: Record<string, unknown>) {
  try {
    fetch("/api/quiz/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // tracking não pode quebrar o quiz
  }
}

const STORE_KEY = "evofit_diagnostico";

function loadStored(): { i: number; answers: Answers; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.i === "number" && parsed?.answers) return parsed;
    return null;
  } catch {
    return null;
  }
}

function persist(state: { i: number; answers: Answers; email: string }) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponível — não quebra o quiz
  }
}

function groupMeta(group: string) {
  return group === "perfil" ? PERFIL_GROUP : DIM[group as DimKey];
}

function fillTitle(title: string, name: string): string {
  if (!title.includes("{nome}")) return title;
  if (!name) {
    const t = title.replace("{nome}, ", "");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  return title.replace("{nome}", name);
}

// ─── Widgets ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 176 }: { score: number; size?: number }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#2D2D2D" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={r} fill="none" stroke="#A8B78A" strokeWidth="14"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-3xl font-extrabold text-[#F0F0F0]">{score}</strong>
        <span className="text-xs text-[#8A8A8A]">/100</span>
      </div>
    </div>
  );
}

function RadarChart({ dims }: { dims: Result["dims"] }) {
  const size = 280, c = size / 2, R = 96;
  const n = DIMENSIONS.length;
  const pt = (i: number, r: number) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };
  const poly = (r: number) => DIMENSIONS.map((_, i) => pt(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");
  const levels = [0.25, 0.5, 0.75, 1].map((f, idx) => (
    <polygon key={idx} points={poly(R * f)} fill="none" stroke="#2D2D2D" strokeWidth="1" />
  ));
  const strong = <polygon points={poly(R * 0.7)} fill="none" stroke="#A8B78A" strokeWidth="1" strokeDasharray="4 3" opacity={0.6} />;
  const axes = DIMENSIONS.map((_, i) => {
    const [x, y] = pt(i, R);
    return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#2D2D2D" strokeWidth="1" />;
  });
  const data = DIMENSIONS.map((d, i) => pt(i, R * Math.max(0.04, (dims[d.key] ?? 0) / 100)));
  const dataPoly = data.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const dots = data.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#A8B78A" />);
  const labels = DIMENSIONS.map((d, i) => {
    const [x, y] = pt(i, R + 30);
    const anchor = Math.abs(x - c) < 8 ? "middle" : x > c ? "start" : "end";
    return (
      <text key={d.key} x={x} y={y} textAnchor={anchor} fontSize="11" fill="#CBD5E0">
        <tspan x={x}>{d.label}</tspan>
        <tspan x={x} dy="14" fontWeight="bold" fill="#A8B78A">{dims[d.key] ?? "·"}</tspan>
      </text>
    );
  });
  return (
    <svg viewBox={`-30 -10 ${size + 60} ${size + 20}`} className="w-full max-w-sm mx-auto">
      {levels}
      {strong}
      {axes}
      <polygon points={dataPoly} fill="#6B7F56" fillOpacity={0.35} stroke="#A8B78A" strokeWidth="2" />
      {dots}
      {labels}
    </svg>
  );
}

function GlassesPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const liters = fmtLiters((value * GLASS_ML) / 1000);
  return (
    <div>
      <p className="text-center mb-4">
        <strong className="text-3xl font-extrabold text-[#F0F0F0]">{value}</strong>{" "}
        <span className="text-sm text-[#8A8A8A]">{value === 1 ? "copo" : "copos"}</span>
        <span className="block text-xs text-[#A8B78A] mt-1">{liters} por dia</span>
      </p>
      <div className="grid grid-cols-6 gap-2 mb-4">
        {Array.from({ length: GLASSES_MAX }, (_, i) => {
          const n = i + 1;
          const full = n <= value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n === value ? n - 1 : n)}
              aria-label={`${n} ${n === 1 ? "copo" : "copos"}`}
              aria-pressed={full}
              className={`aspect-square rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                full ? "bg-[#6B7F56] border-[#6B7F56]" : "bg-[#1A1A1A] border-[#2D2D2D]"
              }`}
            >
              💧
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] text-[#F0F0F0] text-lg"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onChange(0)}
          className="text-xs font-semibold text-[#8A8A8A] hover:text-[#F0F0F0] px-3 py-2"
        >
          Quase nenhum
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(GLASSES_MAX, value + 1))}
          className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] text-[#F0F0F0] text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

function QuizShell({
  showBack, showProgress, showCounter, answeredCount, totalQuestions, progressPct,
  groupIcon, groupLabel, onBack, children,
}: {
  showBack: boolean;
  showProgress: boolean;
  showCounter: boolean;
  answeredCount: number;
  totalQuestions: number;
  progressPct: number;
  groupIcon: string | null;
  groupLabel: string | null;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full px-6 pt-10 pb-8">
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="text-[#8A8A8A] hover:text-[#F0F0F0] transition-colors mb-4 -ml-1 w-8 h-8 flex items-center justify-center"
        >
          ←
        </button>
      )}
      {showProgress && (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#A8B78A]">Diagnóstico Evofit</span>
            {showCounter && (
              <span className="text-xs text-[#8A8A8A]">{answeredCount} de {totalQuestions}</span>
            )}
          </div>
          <div className="h-1.5 bg-[#1F2A1C] rounded-full overflow-hidden mb-8">
            <div className="h-full bg-[#6B7F56] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}
      {groupIcon && groupLabel && (
        <p className="flex items-center gap-2 text-xs font-semibold text-[#A8B78A] uppercase tracking-wide mb-3">
          <span>{groupIcon}</span>
          <span>{groupLabel}</span>
        </p>
      )}
      {children}
    </div>
  );
}

function WeightSlider({ value, min, max, unit, onChange }: { value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-center mb-6">
        <strong className="text-4xl font-extrabold text-[#F0F0F0]">{value}</strong>{" "}
        <span className="text-base text-[#8A8A8A]">{unit}</span>
      </p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#6B7F56] mb-4"
      />
      <div className="flex items-center justify-between text-xs text-[#6B7280] mb-4">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] text-[#F0F0F0] text-lg">−</button>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2D2D2D] text-[#F0F0F0] text-lg">+</button>
      </div>
    </div>
  );
}

// ─── Página ─────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [openArea, setOpenArea] = useState<DimKey | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const sessionIdRef = useRef<string | null>(null);
  const restoredRef = useRef(false);

  // Restaura progresso salvo (recarregar a página não perde o quiz).
  useEffect(() => {
    const saved = loadStored();
    if (saved && saved.i > 0) {
      setStepIdx(saved.i);
      setAnswers(saved.answers);
      setEmail(saved.email);
      setStarted(true);
    }
    restoredRef.current = true;
  }, []);

  useEffect(() => {
    fetch("/api/quiz/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", totalSteps: STEPS.length }),
    })
      .then((r) => r.json())
      .then((data) => { if (data?.id) sessionIdRef.current = data.id; })
      .catch(() => {});
  }, []);

  const step: Step = STEPS[stepIdx];
  const name = firstName(answers.nome) || (typeof answers.nome === "string" ? answers.nome : "");

  useEffect(() => {
    if (!restoredRef.current) return;
    persist({ i: stepIdx, answers, email });
    if (sessionIdRef.current) {
      trackQuiz({ action: "progress", id: sessionIdRef.current, lastStep: stepIdx, totalSteps: STEPS.length, answers });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  function goTo(idx: number) {
    setStepIdx(idx);
  }

  function nextIndex(i: number): number {
    let n = i + 1;
    if (STEPS[n]?.id === "email" && email) n += 1;
    return n;
  }

  function prevIndex(i: number): number {
    let p = i - 1;
    while (p > 0 && (STEPS[p].type === "analise" || (STEPS[p].type === "email" && email))) p -= 1;
    return Math.max(0, p);
  }

  function advance() {
    goTo(nextIndex(stepIdx));
  }

  function goBack() {
    if (stepIdx <= 0) { setStarted(false); return; }
    goTo(prevIndex(stepIdx));
  }

  function setAnswer(id: string, value: string | number) {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      if (id === "sexo" && !prev.peso) {
        next.peso = PESO_DEFAULT[String(value)] ?? PESO_DEFAULT.x;
      }
      return next;
    });
  }

  function pickSingle(id: string, value: string) {
    setAnswer(id, value);
    setTimeout(() => advance(), 350);
  }

  function submitName() {
    const n = firstName(nameInput);
    if (!n) { setNameError(true); return; }
    setNameError(false);
    setAnswer("nome", n);
    advance();
  }

  function submitEmail() {
    const normalized = normalizeEmail(emailInput);
    if (!isValidEmail(normalized)) { setEmailError(true); return; }
    setEmailError(false);
    setEmail(normalized);
    if (sessionIdRef.current) trackQuiz({ action: "email", id: sessionIdRef.current, email: normalized });
    window.fbq?.("track", "Lead", { content_name: "diagnostico" });
    try { localStorage.setItem("evofit_email", normalized); } catch { /* ignora */ }
    advance();
  }

  // Animação da tela de análise.
  useEffect(() => {
    if (step?.type !== "analise") return;
    setAnalysisStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    ANALYSIS_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setAnalysisStep(i + 1), (i + 1) * 480));
    });
    timers.push(setTimeout(() => advance(), ANALYSIS_LINES.length * 480 + 500));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  function goToOferta() {
    if (sessionIdRef.current) trackQuiz({ action: "complete", id: sessionIdRef.current });
    window.fbq?.("track", "ViewContent", { content_name: "oferta", value: 97, currency: "BRL" });
    router.push("/quiz/oferta");
  }

  function restart() {
    setAnswers({});
    setEmail("");
    setOpenArea(null);
    persist({ i: 0, answers: {}, email: "" });
    goTo(STEP_INDEX.sexo);
  }

  const answeredCount = QUESTIONS.filter((q) => STEP_INDEX[q.id] < stepIdx).length;
  const progressPct = QUESTIONS.length ? Math.round((answeredCount / QUESTIONS.length) * 100) : 0;
  const showBack = started && step.id !== "hero" && step.type !== "analise" && step.type !== "resultado";
  const showProgress = started && step.group !== "final" && step.id !== "hero";
  const showCounter = step.type !== "insight";
  const groupMetaNow = step.group !== "final" && step.id !== "hero" ? groupMeta(step.group) : null;
  const shellProps = {
    showBack, showProgress, showCounter, answeredCount, totalQuestions: QUESTIONS.length, progressPct,
    groupIcon: groupMetaNow?.icon ?? null, groupLabel: groupMetaNow?.label ?? null, onBack: goBack,
  };

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
        <img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
      </noscript>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {!started && (
        <div className="flex-1 flex flex-col justify-center max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full px-6 py-16 text-center animate-fade-in">
          <p className="text-xs font-semibold text-[#A8B78A] uppercase tracking-wide mb-3">✨ Diagnóstico Evofit · grátis</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F0F0F0] leading-tight mb-4">
            Qual hábito está segurando a <span className="text-[#A8B78A]">sua evolução?</span>
          </h1>
          <p className="text-[#8A8A8A] mb-8 leading-relaxed">
            São 23 perguntas rápidas sobre sete áreas: rotina, disciplina, sono, alimentação, água, treino e fôlego.
            No fim, você vê sua nota de 0 a 100 em cada uma e sabe por onde começar.
          </p>

          <button
            onClick={() => { setStarted(true); goTo(STEP_INDEX.sexo); window.fbq?.("trackCustom", "StartDiagnostico"); }}
            className="bg-[#6B7F56] text-white font-bold px-8 py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10]"
          >
            Começar meu diagnóstico
          </button>
          <p className="text-xs text-[#6B7280] mt-4">⏱️ Leva uns 3 minutos. O resultado sai na hora.</p>

          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="flex -space-x-2">
              {["/pessoas/user-2.png", "/pessoas/user-4.png", "/pessoas/user-7.png", "/pessoas/user-9.png"].map((src) => (
                <div key={src} className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#0A0A0A]">
                  <Image src={src} alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280]">Feito pra quem nunca teve tempo de treinar.</p>
          </div>
        </div>
      )}

      {/* ── Perguntas de escolha única ───────────────────────────────────── */}
      {started && step.type === "single" && (
        <QuizShell {...shellProps}>
          <div className="flex-1 animate-fade-in" key={step.id}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-8 leading-snug">
              {fillTitle(step.title || "", name)}
            </h2>
            {step.sub && <p className="text-xs text-[#8A8A8A] -mt-6 mb-6">{step.sub}</p>}
            <div
              className={
                step.layout === "cards" ? "grid grid-cols-1 sm:grid-cols-3 gap-3"
                  : step.layout === "chips" ? "flex flex-wrap gap-2"
                  : "space-y-3"
              }
            >
              {(step.options || []).map((opt) => {
                const selected = answers[step.id] === opt.v;
                if (step.layout === "chips") {
                  return (
                    <button
                      key={opt.v}
                      onClick={() => pickSingle(step.id, opt.v)}
                      className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                        selected ? "bg-[#6B7F56] border-[#6B7F56] text-white" : "bg-[#1A1A1A] border-[#2D2D2D] text-[#C0C0C0] hover:border-[#6B7F56]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                }
                if (step.layout === "swatch") {
                  return (
                    <button
                      key={opt.v}
                      onClick={() => pickSingle(step.id, opt.v)}
                      className={`w-full flex items-center gap-4 text-left px-4 py-4 rounded-[0.75rem] text-sm font-medium border transition-all ${
                        selected ? "border-[#6B7F56] bg-[#1F2A1C] text-[#F0F0F0]" : "border-[#2D2D2D] bg-[#1A1A1A] text-[#C0C0C0] hover:border-[#6B7F56]"
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full shrink-0 border border-black/20" style={{ background: opt.swatch }} />
                      <span>{opt.label}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={opt.v}
                    onClick={() => pickSingle(step.id, opt.v)}
                    className={`w-full flex items-center justify-between gap-4 text-left px-4 py-4 rounded-[0.75rem] text-sm font-medium border transition-all ${
                      selected ? "border-[#6B7F56] bg-[#1F2A1C] text-[#F0F0F0]" : "border-[#2D2D2D] bg-[#1A1A1A] text-[#C0C0C0] hover:border-[#6B7F56] hover:text-[#F0F0F0]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.icon && (
                      <span className="shrink-0 w-9 h-9 flex items-center justify-center text-lg bg-[#1F2A1C] rounded-lg">{opt.icon}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </QuizShell>
      )}

      {/* ── Nome ─────────────────────────────────────────────────────────── */}
      {started && step.type === "text" && (
        <QuizShell {...shellProps}>
          <div className="flex-1 animate-fade-in" key={step.id}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-2 leading-snug">{step.title}</h2>
            {step.sub && <p className="text-xs text-[#8A8A8A] mb-6">{step.sub}</p>}
            <input
              type="text"
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); if (nameError) setNameError(false); }}
              onKeyDown={(e) => e.key === "Enter" && submitName()}
              placeholder={step.placeholder}
              autoFocus
              maxLength={40}
              className="w-full border border-[#2D2D2D] bg-[#1A1A1A] rounded-[0.75rem] px-4 py-4 text-sm text-[#F0F0F0] placeholder-[#6B7280] focus:outline-none focus:border-[#6B7F56] transition-all"
            />
            {nameError && <p className="text-xs text-red-400 mt-2">Digite seu primeiro nome, com pelo menos 2 letras.</p>}
          </div>
          <button onClick={submitName} className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10] mt-4">
            Continuar
          </button>
        </QuizShell>
      )}

      {/* ── Peso (range) ─────────────────────────────────────────────────── */}
      {started && step.type === "range" && (
        <QuizShell {...shellProps}>
          <div className="flex-1 animate-fade-in" key={step.id}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-2 leading-snug">{step.title}</h2>
            {step.sub && <p className="text-xs text-[#8A8A8A] mb-8">{step.sub}</p>}
            <WeightSlider
              value={Number(answers.peso) || PESO_DEFAULT[String(answers.sexo)] || PESO_DEFAULT.x}
              min={step.min ?? 40}
              max={step.max ?? 160}
              unit={step.unit || "kg"}
              onChange={(v) => setAnswer("peso", v)}
            />
          </div>
          <button onClick={advance} className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10] mt-6">
            Continuar
          </button>
        </QuizShell>
      )}

      {/* ── Copos de água ────────────────────────────────────────────────── */}
      {started && step.type === "glasses" && (
        <QuizShell {...shellProps}>
          <div className="flex-1 animate-fade-in" key={step.id}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-2 leading-snug">{step.title}</h2>
            {step.sub && <p className="text-xs text-[#8A8A8A] mb-8">{step.sub}</p>}
            <GlassesPicker value={Number(answers.h_copos ?? 0)} onChange={(v) => setAnswer("h_copos", v)} />
          </div>
          <button
            onClick={advance}
            disabled={answers.h_copos === undefined}
            className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10] mt-6 disabled:opacity-40"
          >
            Continuar
          </button>
        </QuizShell>
      )}

      {/* ── Telas de transição (insight) ─────────────────────────────────── */}
      {started && step.type === "insight" && step.id === "i_sono" && (() => {
        const si = sleepInsight(answers);
        return (
          <QuizShell {...shellProps}>
            <div className="flex-1 flex flex-col justify-center animate-fade-in" key={step.id}>
              <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1rem] p-6 mb-6">
                {si.stat.startsWith("+") && (
                  <p className="mb-3"><strong className="text-3xl font-extrabold text-[#A8B78A]">{si.stat}</strong> <span className="text-sm text-[#8A8A8A]">{si.statLabel}</span></p>
                )}
                {!si.stat.startsWith("+") && (
                  <p className="mb-3"><strong className="text-2xl font-extrabold text-[#A8B78A]">{si.stat}</strong> <span className="text-sm text-[#8A8A8A]">{si.statLabel}</span></p>
                )}
                <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-2 leading-snug">{si.title}</h2>
                <p className="text-sm text-[#C0C0C0] leading-relaxed">{si.text}</p>
              </div>
            </div>
            <button onClick={advance} className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10]">
              Continuar
            </button>
          </QuizShell>
        );
      })()}

      {started && step.type === "insight" && step.id === "i_agua" && (() => {
        const r = computeResult(answers);
        const wi = waterInsight(r);
        return (
          <QuizShell {...shellProps}>
            <div className="flex-1 flex flex-col justify-center animate-fade-in" key={step.id}>
              <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[1rem] p-6 mb-6">
                <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-2 leading-snug">{wi.title}</h2>
                <p className="text-sm text-[#A8B78A] mb-2">{wi.gapText}</p>
                <p className="text-sm text-[#C0C0C0] leading-relaxed">{wi.text}</p>
              </div>
            </div>
            <button onClick={advance} className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10]">
              Continuar
            </button>
          </QuizShell>
        );
      })()}

      {started && step.type === "insight" && step.id === "i_prova" && (
        <QuizShell {...shellProps}>
          <div className="flex-1 flex flex-col justify-center animate-fade-in text-center" key={step.id}>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-2 leading-snug">Todo mundo começa de algum lugar.</h2>
            <p className="text-sm text-[#8A8A8A] mb-6">Essas pessoas usam a Evofit. Nenhuma começou pronta: começaram com um plano que cabia na rotina.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative aspect-square rounded-[1rem] overflow-hidden border border-[#2D2D2D]">
                <Image src="/antes-depois-1.png" alt="Antes e depois de uma aluna da Evofit" fill className="object-cover object-center" />
              </div>
              <div className="relative aspect-square rounded-[1rem] overflow-hidden border border-[#2D2D2D]">
                <Image src="/antes-depois-homem.png" alt="Antes e depois de um aluno da Evofit" fill className="object-cover object-center" />
              </div>
            </div>
          </div>
          <button onClick={advance} className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10] mt-4">
            Continuar o diagnóstico
          </button>
        </QuizShell>
      )}

      {/* ── Análise ──────────────────────────────────────────────────────── */}
      {started && step.type === "analise" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full">
          <div className="relative w-32 h-32 mb-8">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r="78" fill="none" stroke="#2D2D2D" strokeWidth="12" />
              <circle
                cx="100" cy="100" r="78" fill="none" stroke="#6B7F56" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 78}
                strokeDashoffset={2 * Math.PI * 78 * (1 - analysisStep / ANALYSIS_LINES.length)}
                style={{ transition: "stroke-dashoffset .4s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <strong className="text-2xl font-extrabold text-[#F0F0F0]">{Math.round((analysisStep / ANALYSIS_LINES.length) * 100)}%</strong>
            </div>
          </div>
          <h2 className="text-lg font-extrabold text-[#F0F0F0] mb-6">Analisando suas respostas</h2>
          <ol className="w-full max-w-xs space-y-2">
            {ANALYSIS_LINES.map((l, i) => (
              <li key={l.dim} className={`flex items-center gap-2 text-sm transition-opacity ${i < analysisStep ? "text-[#C0C0C0] opacity-100" : "opacity-30 text-[#8A8A8A]"}`}>
                <span>{i < analysisStep ? "✅" : "⬜"}</span>
                <span>{l.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Email ────────────────────────────────────────────────────────── */}
      {started && step.type === "email" && (
        <div className="flex-1 flex flex-col max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full px-6 pt-10 pb-8">
          <div className="h-1.5 bg-[#1F2A1C] rounded-full overflow-hidden mb-10">
            <div className="h-full bg-[#6B7F56] rounded-full" style={{ width: "100%" }} />
          </div>
          <div className="flex-1 flex flex-col justify-center animate-fade-in">
            <p className="text-xs font-semibold text-[#A8B78A] uppercase tracking-wide mb-2">🔒 Diagnóstico pronto</p>
            <h2 className="text-xl font-extrabold text-[#F0F0F0] mb-2 leading-snug">
              {name ? `${name}, seu` : "Seu"} diagnóstico está pronto.
            </h2>
            <p className="text-sm text-[#8A8A8A] mb-8 leading-relaxed">
              Deixe seu e-mail pra liberar o resultado. A equipe Evofit pode te mandar dicas pra colocar o plano em prática.
            </p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); if (emailError) setEmailError(false); }}
              onKeyDown={(e) => e.key === "Enter" && submitEmail()}
              placeholder="voce@email.com"
              autoFocus
              className="w-full border border-[#2D2D2D] bg-[#1A1A1A] rounded-[0.75rem] px-4 py-4 text-sm text-[#F0F0F0] placeholder-[#6B7280] focus:outline-none focus:border-[#6B7F56] transition-all mb-2"
            />
            {emailError && <p className="text-xs text-red-400 mb-2">Confere o e-mail? Parece que falta alguma coisa.</p>}
            <p className="text-[11px] text-[#6B7280] mt-2">🛡️ Seu e-mail fica só com a Evofit. Sem spam, e dá pra sair da lista quando quiser.</p>
          </div>
          <button onClick={submitEmail} disabled={!emailInput.trim()} className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10] disabled:opacity-40 mt-4">
            Ver meu diagnóstico
          </button>
        </div>
      )}

      {/* ── Resultado ────────────────────────────────────────────────────── */}
      {started && step.type === "resultado" && (() => {
        const r = computeResult(answers);
        const areasSorted = [...DIMENSIONS].sort((x, y) => (r.dims[x.key] ?? 0) - (r.dims[y.key] ?? 0));
        const plan = planSteps(answers, r);
        const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
        const numbers = [
          { icon: "💧", label: "Água por dia", now: fmtLiters(r.water.intakeL), goal: `Meta: ${fmtLiters(r.water.targetL)}` },
          { icon: "😴", label: "Sono por noite", now: (PHRASES.s_horas[String(answers.s_horas)] ?? "").replace("entre ", "").replace(" horas", " h"), goal: "Meta: 7 a 9 h" },
          { icon: "🏋️", label: "Treinos por semana", now: PHRASES.d_freq[String(answers.d_freq)] ?? "", goal: "Meta inicial: 3 dias" },
          { icon: "⏱️", label: "Tempo livre pra treinar", now: PHRASES.p_tempo[String(answers.p_tempo)] ?? "", goal: "Treinos a partir de 15 min" },
        ];
        return (
          <div className="flex-1 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full px-6 pt-10 pb-12 animate-fade-in">
            {/* Hero do resultado */}
            <div className="flex flex-col items-center text-center mb-8">
              <ScoreRing score={r.total} />
              <p className="text-xs text-[#6B7280] mt-4">Diagnóstico de {name || "você"} · {date}</p>
              <p className="text-xs font-semibold text-[#A8B78A] mt-1">Fase {r.phase.n} de 4 · <strong>{r.phase.name}</strong></p>
              <h2 className="text-xl font-extrabold text-[#F0F0F0] mt-3 mb-2 leading-snug">{headline(r, name)}</h2>
              <p className="text-sm text-[#C0C0C0] leading-relaxed">{r.phase.text}</p>
              <ol className="flex items-center gap-2 mt-4">
                {PHASES.map((p) => (
                  <li key={p.n} className={`flex items-center gap-1 text-[10px] font-semibold ${p.n === r.phase.n ? "text-[#A8B78A]" : p.n < r.phase.n ? "text-[#6B7F56]" : "text-[#4B5563]"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${p.n === r.phase.n ? "border-[#A8B78A] bg-[#1F2A1C]" : p.n < r.phase.n ? "border-[#6B7F56] bg-[#6B7F56] text-white" : "border-[#2D2D2D]"}`}>
                      {p.n}
                    </span>
                    {p.name}
                  </li>
                ))}
              </ol>
            </div>

            {/* Radar */}
            <div className="mb-8">
              <RadarChart dims={r.dims} />
              <p className="text-center text-[10px] text-[#6B7280] mt-1">Linha tracejada: a partir de 70 a área já é forte</p>
            </div>

            {/* Áreas */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-[#F0F0F0] mb-1">Sua nota em cada área</h3>
              <p className="text-xs text-[#8A8A8A] mb-3">Da mais fraca pra mais forte. Toque pra ver o que cada nota quer dizer.</p>
              <ul className="space-y-2">
                {areasSorted.map((d) => {
                  const s = r.dims[d.key] ?? 0;
                  const b = r.bands[d.key];
                  const open = openArea === d.key;
                  const ins = dimensionInsight(d.key, answers, r);
                  const bandColor = b?.key === "forte" ? "text-[#A8B78A]" : b?.key === "atencao" ? "text-yellow-400" : "text-red-400";
                  return (
                    <li key={d.key} className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[0.75rem] overflow-hidden">
                      <button onClick={() => setOpenArea(open ? null : d.key)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                        <span className="text-lg">{d.icon}</span>
                        <span className="flex-1 text-sm font-semibold text-[#F0F0F0]">{d.label}</span>
                        <span className={`text-xs font-semibold ${bandColor}`}>{b?.label}</span>
                        <span className="text-sm font-bold text-[#F0F0F0] w-8 text-right">{s}</span>
                        <span className="text-[#6B7280] text-xs">{open ? "▲" : "▼"}</span>
                      </button>
                      {open && (
                        <div className="px-4 pb-4 text-sm text-[#C0C0C0] leading-relaxed space-y-2">
                          <p>{ins.text}</p>
                          <p className="text-[#A8B78A]"><strong>Primeiro passo:</strong> {ins.tip}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Números */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-[#F0F0F0] mb-3">Seus números</h3>
              <div className="grid grid-cols-2 gap-3">
                {numbers.map((n) => (
                  <div key={n.label} className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[0.75rem] p-3">
                    <p className="text-xs text-[#8A8A8A] mb-1">{n.icon} {n.label}</p>
                    <p className="text-sm font-bold text-[#F0F0F0]">{n.now}</p>
                    <p className="text-[10px] text-[#6B7280]">{n.goal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plano */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-[#F0F0F0] mb-3">Seu plano começa por aqui</h3>
              <ol className="space-y-3">
                {plan.map((p, i) => (
                  <li key={i} className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-[0.75rem] p-4">
                    <span className="text-[10px] font-bold text-[#A8B78A] uppercase tracking-wide">{p.when}</span>
                    <p className="text-sm font-bold text-[#F0F0F0] mt-1 mb-1">{p.dim ? DIM[p.dim].icon : "✨"} {p.title}</p>
                    <p className="text-xs text-[#C0C0C0] leading-relaxed">{p.text}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* CTA */}
            <div className="bg-[#1F2A1C] border border-[#35402C] rounded-[1rem] p-6 text-center">
              <p className="text-xs font-semibold text-[#A8B78A] uppercase tracking-wide mb-2">✨ Fase {r.phase.n} · {r.phase.name}</p>
              <h3 className="text-lg font-extrabold text-[#F0F0F0] mb-2">O plano da Evofit pra quem está nessa fase</h3>
              <p className="text-sm text-[#C0C0C0] mb-5 leading-relaxed">{r.phase.plan} Treino, dieta e suporte no mesmo lugar, por menos de R$ 3,30 por dia.</p>
              <button onClick={goToOferta} className="w-full bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] active:bg-[#556345] transition-colors shadow-lg shadow-[#141a10] mb-3">
                Ver meu plano
              </button>
              <button onClick={restart} className="text-xs text-[#8A8A8A] hover:text-[#F0F0F0] underline">
                Refazer o diagnóstico
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
