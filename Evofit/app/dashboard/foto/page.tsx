"use client";

import { useEffect, useRef, useState } from "react";

// ─── Tipos e helpers de storage ──────────────────────────────────────────────

interface PhotoEntry {
  dateStr:  string; // new Date().toDateString()
  dayLabel: string; // "Segunda, 23 mai"
  dataUrl:  string; // base64 JPEG comprimido
}

const GALLERY_KEY = "evofit_photo_gallery";
const MAX_PHOTOS  = 20; // limite para não estourar o localStorage

const DAY_NAMES   = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const MONTH_NAMES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

function formatLabel(d: Date) {
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function loadGallery(): PhotoEntry[] {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    return raw ? (JSON.parse(raw) as PhotoEntry[]) : [];
  } catch {
    return [];
  }
}

function persistGallery(entries: PhotoEntry[]) {
  // Mantém apenas as MAX_PHOTOS mais recentes
  localStorage.setItem(GALLERY_KEY, JSON.stringify(entries.slice(-MAX_PHOTOS)));
}

/** Redimensiona e comprime a imagem para JPEG 70% (máx 800px de largura). */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const MAX_W = 800;
        const scale = Math.min(1, MAX_W / img.width);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas ctx null");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar imagem"));
    };

    img.src = url;
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FotoPage() {
  const [gallery, setGallery] = useState<PhotoEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [preview, setPreview] = useState<PhotoEntry | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const todayStr   = new Date().toDateString();
  const todayLabel = formatLabel(new Date());
  const todayPhoto = gallery.find((p) => p.dateStr === todayStr) ?? null;
  const pastPhotos = gallery.filter((p) => p.dateStr !== todayStr).slice().reverse();

  useEffect(() => {
    setGallery(loadGallery());
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const dataUrl = await compressImage(file);
      const entry: PhotoEntry = { dateStr: todayStr, dayLabel: todayLabel, dataUrl };

      // Substitui foto do dia se já existir, senão adiciona
      const updated = [...gallery.filter((p) => p.dateStr !== todayStr), entry];
      persistGallery(updated);
      setGallery(loadGallery());
    } catch {
      setError("Não foi possível carregar a foto. Tente novamente.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function deletePhoto(dateStr: string) {
    const updated = gallery.filter((p) => p.dateStr !== dateStr);
    persistGallery(updated);
    setGallery(updated);
    if (preview?.dateStr === dateStr) setPreview(null);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-[#7C3AED] font-semibold uppercase tracking-wide mb-1">
          Evolução visual
        </p>
        <h1 className="text-2xl font-extrabold text-[#111827]">Registro de fotos</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {gallery.length === 0
            ? "Registre seu progresso com fotos do treino"
            : `${gallery.length} foto${gallery.length !== 1 ? "s" : ""} registrada${gallery.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Foto de hoje */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">
          Hoje · {todayLabel}
        </p>

        {todayPhoto ? (
          /* Já tem foto hoje */
          <div className="relative rounded-[1rem] overflow-hidden border border-[#E5E7EB] aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={todayPhoto.dataUrl}
              alt="Treino de hoje"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setPreview(todayPhoto)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between">
              <span className="text-white text-xs font-semibold">✓ Treino registrado</span>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs bg-white/90 text-[#374151] font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                >
                  Substituir
                </button>
                <button
                  onClick={() => deletePhoto(todayStr)}
                  className="text-xs bg-red-500/90 text-white font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Sem foto hoje */
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="w-full border-2 border-dashed border-[#D1D5DB] rounded-[1rem] py-14 flex flex-col items-center gap-3 hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-10 h-10 border-[3px] border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-6xl">📸</span>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#374151]">Registrar treino de hoje</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Toque para carregar da galeria</p>
                </div>
              </>
            )}
          </button>
        )}

        {/* Input oculto */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {error && (
          <p className="text-xs text-[#EF4444] mt-2 text-center">{error}</p>
        )}
      </div>

      {/* Galeria de fotos passadas */}
      {pastPhotos.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">
            Histórico de fotos
          </p>
          <div className="grid grid-cols-2 gap-3">
            {pastPhotos.map((photo) => (
              <div
                key={photo.dateStr}
                className="relative rounded-[1rem] overflow-hidden border border-[#E5E7EB] aspect-square"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.dataUrl}
                  alt={photo.dayLabel}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreview(photo)}
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                  <p className="text-white text-[10px] font-semibold">{photo.dayLabel}</p>
                </div>
                <button
                  onClick={() => deletePhoto(photo.dateStr)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-[10px] hover:bg-red-500 transition-colors"
                  title="Excluir foto"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {gallery.length === 0 && (
        <div className="text-center py-10">
          <p className="text-5xl mb-3">🏋️</p>
          <p className="text-sm font-bold text-[#374151] mb-1">Nenhuma foto ainda</p>
          <p className="text-xs text-[#9CA3AF]">Registre seu primeiro treino acima e acompanhe sua evolução!</p>
        </div>
      )}

      {/* Dica */}
      <div className="mt-5 bg-[#F5F3FF] rounded-[1rem] p-4 border border-[#EDE9FE]">
        <p className="text-xs font-semibold text-[#7C3AED] mb-1">💡 Por que registrar fotos?</p>
        <p className="text-xs text-[#374151] leading-relaxed">
          O espelho mente, a balança engana — mas as fotos mostram a verdade. Tire uma foto por semana no mesmo horário e ângulo para enxergar sua evolução real.
        </p>
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.dataUrl}
              alt={preview.dayLabel}
              className="w-full rounded-[1rem] object-contain max-h-[80vh]"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-[1rem]">
              <p className="text-white font-bold text-sm">{preview.dayLabel}</p>
            </div>
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white text-lg hover:bg-black/80 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
