"use client";

import { useState } from "react";
import type { ExtraField, TipoConfig } from "@/lib/consultoria-tipos";

const NIVEL_OPTIONS = [
  "Iniciante (nunca treinei)",
  "Intermediário (já tenho uma certa experiência com os exercícios)",
  "Avançado (treino regularmente)",
];
const SEXO_OPTIONS = ["Feminino", "Masculino"];

function formatPhoneBR(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
const isValidPhoneBR = (v: string) => /^\d{10,11}$/.test(v.replace(/\D/g, ""));

const radioClass = (selected: boolean) =>
  `w-full text-left px-4 py-3 rounded-[0.75rem] text-sm font-medium border transition-all flex items-center gap-3 ${
    selected ? "bg-[#1F2A1C] text-[#A8B78A] border-[#6B7F56]" : "bg-[#1A1A1A] text-[#C0C0C0] border-[#2D2D2D] hover:border-[#A8B78A]"
  }`;

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)} className={radioClass(value === opt)}>
          <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${value === opt ? "border-[#6B7F56]" : "border-[#3A3A3A]"}`}>
            {value === opt && <span className="w-2 h-2 rounded-full bg-[#6B7F56]" />}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}

function CheckboxGroup({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  function toggle(opt: string) {
    if (opt === "Nenhuma dessas" || opt === "Nenhum desses") {
      onChange(value.includes(opt) ? [] : [opt]);
      return;
    }
    const cleared = value.filter((v) => v !== "Nenhuma dessas" && v !== "Nenhum desses");
    onChange(cleared.includes(opt) ? cleared.filter((v) => v !== opt) : [...cleared, opt]);
  }
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)} className={radioClass(selected)}>
            <span className={`w-4 h-4 rounded-[0.25rem] border-2 shrink-0 flex items-center justify-center ${selected ? "border-[#6B7F56] bg-[#6B7F56]" : "border-[#3A3A3A]"}`}>
              {selected && <span className="text-white text-[10px]">✓</span>}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ScaleInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const n = value === "" ? null : Number(value);
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Array.from({ length: 11 }, (_, i) => i).map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(String(i))}
          className={`w-9 h-9 rounded-full text-xs font-bold border transition-all ${
            n === i ? "bg-[#6B7F56] text-white border-[#6B7F56]" : "bg-[#1A1A1A] text-[#C0C0C0] border-[#2D2D2D] hover:border-[#6B7F56]"
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

const fieldClass =
  "w-full border border-[#2D2D2D] rounded-[0.75rem] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#6B7280] bg-[#1A1A1A] focus:outline-none focus:border-[#6B7F56] focus:ring-2 focus:ring-[#1F2A1C] transition-all";
const labelClass = "block text-sm font-semibold text-[#C0C0C0] mb-3";

export default function ConsultoriaForm({ tipoConfig }: { tipoConfig: TipoConfig }) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [nivel, setNivel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [extras, setExtras] = useState<Record<string, string | string[]>>({});

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function setExtra(key: string, value: string | string[]) {
    setExtras((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nome.trim()) { setError("Digite seu nome."); return; }
    if (!isValidPhoneBR(whatsapp)) { setError("Confere o WhatsApp? Parece que falta alguma coisa."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/consultoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoConfig.slug,
          nome, whatsapp, email, idade, sexo, nivel, observacoes,
          respostas: extras,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Não deu pra enviar agora. Tenta de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-extrabold text-[#F0F0F0] mb-2">Recebi suas informações!</h1>
        <p className="text-sm text-[#B8B8B8] max-w-xs">
          Entro em contato pelo seu WhatsApp em breve pra continuar a nossa conversa.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-10">
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <p className="text-sm font-semibold text-[#A8B78A] mb-1">Evofit</p>
        <h1 className="text-2xl font-extrabold text-[#F0F0F0] mb-2">{tipoConfig.titulo}</h1>
        <p className="text-sm text-[#B8B8B8] mb-8">{tipoConfig.subtitulo}</p>

        <div className="space-y-6">
          <div>
            <label className={labelClass}>Seu nome</label>
            <input className={fieldClass} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
          </div>

          <div>
            <label className={labelClass}>Seu WhatsApp (com DDD)</label>
            <input
              className={fieldClass}
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatPhoneBR(e.target.value))}
              placeholder="(11) 91234-5678"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className={labelClass}>Seu e-mail (opcional)</label>
            <input
              className={fieldClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className={labelClass}>Sua idade</label>
            <input className={fieldClass} value={idade} onChange={(e) => setIdade(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="Ex: 28" inputMode="numeric" />
          </div>

          <div>
            <label className={labelClass}>Sexo biológico</label>
            <div className="flex gap-3">
              {SEXO_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSexo(opt)}
                  className={`flex-1 py-3 rounded-[0.75rem] text-sm font-semibold border transition-all ${
                    sexo === opt ? "bg-[#6B7F56] text-white border-[#6B7F56]" : "bg-[#1A1A1A] text-[#C0C0C0] border-[#2D2D2D] hover:border-[#6B7F56]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {tipoConfig.temNivel && (
            <div>
              <label className={labelClass}>Nível de treinamento</label>
              <RadioGroup options={NIVEL_OPTIONS} value={nivel} onChange={setNivel} />
            </div>
          )}

          {tipoConfig.extras.map((field: ExtraField) => (
            <div key={field.key}>
              <label className={labelClass}>{field.label}</label>
              {field.type === "radio" && (
                <RadioGroup options={field.options || []} value={(extras[field.key] as string) || ""} onChange={(v) => setExtra(field.key, v)} />
              )}
              {field.type === "checkbox" && (
                <CheckboxGroup options={field.options || []} value={(extras[field.key] as string[]) || []} onChange={(v) => setExtra(field.key, v)} />
              )}
              {field.type === "scale" && (
                <ScaleInput value={(extras[field.key] as string) || ""} onChange={(v) => setExtra(field.key, v)} />
              )}
              {field.type === "text" && (
                <input className={fieldClass} value={(extras[field.key] as string) || ""} onChange={(e) => setExtra(field.key, e.target.value)} placeholder={field.placeholder} />
              )}
              {field.type === "textarea" && (
                <textarea
                  className={`${fieldClass} min-h-[90px] resize-none`}
                  value={(extras[field.key] as string) || ""}
                  onChange={(e) => setExtra(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          <div>
            <label className={labelClass}>Se tiver outras informações que julgar relevante, descreva abaixo</label>
            <textarea
              className={`${fieldClass} min-h-[90px] resize-none`}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Rotina, histórico, o que já tentou..."
            />
          </div>
        </div>

        {error && <p className="text-[#EF4444] text-xs text-center mt-6">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-[#6B7F56] text-white font-bold py-4 rounded-[0.75rem] hover:bg-[#556345] transition-colors disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
