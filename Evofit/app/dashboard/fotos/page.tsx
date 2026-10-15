"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Tipo = "frente" | "lado" | "costas";

interface Photo {
  id: string;
  tipo: Tipo;
  createdAt: string;
  url: string | null;
}

const TIPOS: { value: Tipo; label: string }[] = [
  { value: "frente", label: "Frente" },
  { value: "lado",   label: "Lado" },
  { value: "costas", label: "Costas" },
];

const MONTHS = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Redimensiona e comprime a foto no navegador antes de enviar (lado 900px, JPEG). */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Erro ao carregar imagem"));
      img.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas indisponível")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function FotosPage() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [uploading, setUploading] = useState<Tipo | null>(null);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const inputRefs = useRef<Record<Tipo, HTMLInputElement | null>>({ frente: null, lado: null, costas: null });

  async function loadPhotos() {
    const res = await fetch("/api/fotos");
    if (res.ok) {
      const data = await res.json();
      setPhotos(data.photos);
    }
  }

  useEffect(() => { loadPhotos(); }, []);

  async function handleFile(tipo: Tipo, file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(tipo);
    try {
      const imageBase64 = await compressImage(file);
      const res = await fetch("/api/fotos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, imageBase64 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar a foto.");
      } else {
        setPhotos((prev) => [data.photo, ...(prev ?? [])]);
      }
    } catch {
      setError("Erro ao processar a imagem.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-8 pb-8">
      <div className="mb-6">
        <Link href="/dashboard/perfil" className="inline-flex items-center gap-1 text-xs text-[#F2C4CC] font-semibold mb-4 hover:underline">
          ← Voltar ao perfil
        </Link>
        <h1 className="text-2xl font-extrabold text-[#F0F0F0]">Fotos de evolução</h1>
        <p className="text-sm text-[#B8B8B8] mt-1">
          Registre fotos periódicas pra acompanhar sua própria evolução ao longo do tempo.
        </p>
      </div>

      {/* Botões de captura */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {TIPOS.map(({ value, label }) => (
          <div key={value}>
            <input
              ref={(el) => { inputRefs.current[value] = el; }}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => handleFile(value, e.target.files?.[0])}
            />
            <button
              onClick={() => inputRefs.current[value]?.click()}
              disabled={uploading !== null}
              className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded-[0.75rem] py-4 flex flex-col items-center gap-1.5 text-[#F0F0F0] text-xs font-semibold disabled:opacity-50 active:scale-[0.97] transition-transform"
            >
              <span className="text-xl">{uploading === value ? "⏳" : "📸"}</span>
              {uploading === value ? "Enviando..." : label}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-[#EF4444] mb-4 text-center">{error}</p>}

      {/* Galeria por tipo */}
      {photos === null ? (
        <p className="text-sm text-[#8A8A8A] text-center mt-8">Carregando...</p>
      ) : photos.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-[1rem] border border-[#2D2D2D] p-6 text-center">
          <p className="text-sm text-[#B8B8B8]">Nenhuma foto ainda. Tire a primeira pra começar a registrar sua evolução.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {TIPOS.map(({ value, label }) => {
            const list = photos.filter((p) => p.tipo === value);
            return (
              <div key={value} className="space-y-2">
                <p className="text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-wide text-center">{label}</p>
                {list.length === 0 ? (
                  <div className="aspect-[3/4] rounded-lg bg-[#1A1A1A] border border-dashed border-[#2D2D2D]" />
                ) : (
                  list.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setLightbox(p)}
                      className="block w-full relative aspect-[3/4] rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#2D2D2D]"
                    >
                      {p.url && (
                        // eslint-disable-next-line @next/next/no-img-element -- miniatura dinâmica vinda de URL assinada temporária
                        <img src={p.url} alt={`${label} — ${formatDate(p.createdAt)}`} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-semibold text-white bg-black/50 py-0.5">
                        {formatDate(p.createdAt)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {lightbox.url && (
            // eslint-disable-next-line @next/next/no-img-element -- visualização ampliada da mesma miniatura
            <img src={lightbox.url} alt="" className="max-w-full max-h-full rounded-lg" />
          )}
        </div>
      )}
    </div>
  );
}
