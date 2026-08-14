/**
 * Script para fazer upload dos vídeos de demonstração para o Vercel Blob
 * Uso: node scripts/upload-videos.mjs
 *
 * Coloque os arquivos em public/videos/<exercicio-id>.mp4 (ex: public/videos/q1.mp4
 * para o exercício "q1" — o id de cada exercício está em lib/workout.ts).
 */

import { put } from '@vercel/blob';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

// Carrega .env.local manualmente
const envFile = join(process.cwd(), '.env.local');
if (existsSync(envFile)) {
  const lines = readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('❌ BLOB_READ_WRITE_TOKEN não encontrado no .env.local');
  process.exit(1);
}

const CONTENT_TYPES = {
  '.mp4':  'video/mp4',
  '.mov':  'video/quicktime',
  '.webm': 'video/webm',
};

const VIDEOS_DIR   = join(process.cwd(), 'public', 'videos');
const OUTPUT_FILE  = join(process.cwd(), 'lib', 'video-urls.json');

if (!existsSync(VIDEOS_DIR)) {
  console.error(`❌ Pasta não encontrada: ${VIDEOS_DIR}`);
  process.exit(1);
}

// Carrega mapeamento existente (para retomar se interrompido)
let urlMap = {};
if (existsSync(OUTPUT_FILE)) {
  urlMap = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
  console.log(`📂 Retomando: ${Object.keys(urlMap).length} vídeos já enviados`);
}

const videoFiles = readdirSync(VIDEOS_DIR).filter((f) => CONTENT_TYPES[extname(f).toLowerCase()]);
console.log(`🎬 Total de vídeos encontrados: ${videoFiles.length}`);
console.log(`⏭️  Já enviados: ${Object.keys(urlMap).length}`);
console.log(`📤 Faltam: ${videoFiles.length - Object.keys(urlMap).length}\n`);

let uploaded = 0;
let skipped  = 0;
let failed   = 0;

for (const file of videoFiles) {
  const ext      = extname(file).toLowerCase();
  const id       = basename(file, ext);
  const filePath = join(VIDEOS_DIR, file);

  if (urlMap[id]) {
    skipped++;
    continue;
  }

  try {
    const fileBuffer = readFileSync(filePath);
    const blob = await put(`videos/${file}`, fileBuffer, {
      access: 'public',
      token,
      contentType: CONTENT_TYPES[ext],
      addRandomSuffix: false,
    });

    urlMap[id] = blob.url;
    uploaded++;

    const total = videoFiles.length;
    const done  = uploaded + skipped;
    const pct   = Math.round((done / total) * 100);
    process.stdout.write(`\r✅ [${done}/${total}] ${pct}% — ${file}                    `);

    // Salva progresso a cada 5 uploads (vídeos são maiores, salvar mais seguido)
    if (uploaded % 5 === 0) {
      writeFileSync(OUTPUT_FILE, JSON.stringify(urlMap, null, 2));
    }
  } catch (err) {
    // Arquivo já existe no Blob Store — deriva a URL pelo padrão conhecido
    if (err.message && err.message.includes('blob-allow-overwrite')) {
      const baseUrl = `https://dckgeeda0hovqkbr.public.blob.vercel-storage.com`;
      urlMap[id] = `${baseUrl}/videos/${file}`;
      uploaded++;
      const total = videoFiles.length;
      const done  = uploaded + skipped;
      process.stdout.write(`\r⏭️ [${done}/${total}] já existia — ${file}                    `);
    } else {
      console.error(`\n❌ Falha: ${file} — ${err.message}`);
      failed++;
    }
  }
}

// Salva resultado final
writeFileSync(OUTPUT_FILE, JSON.stringify(urlMap, null, 2));

console.log(`\n\n📊 Resultado:`);
console.log(`   ✅ Enviados agora: ${uploaded}`);
console.log(`   ⏭️  Pulados (já existiam): ${skipped}`);
console.log(`   ❌ Falhas: ${failed}`);
console.log(`\n📄 Mapeamento salvo em: lib/video-urls.json`);
