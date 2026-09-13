/**
 * Script para fazer upload de capas customizadas das aulas guiadas pro Vercel Blob.
 * Uso: node scripts/upload-aulas.mjs
 *
 * O vídeo em si NÃO passa por aqui — fica hospedado como "não listado" no
 * YouTube (grátis, sem limite de espaço; vídeo longo com áudio não cabe no
 * plano gratuito do Vercel Blob). Cole o id do vídeo do YouTube direto em
 * lib/aulas.ts (campo `youtubeId` de cada aula).
 *
 * Esse script é só pra quando você quiser uma capa customizada em vez da
 * miniatura automática do YouTube: salve em public/aulas/thumbs/<aula-id>.jpg
 * (o <aula-id> é o "id" de cada aula em lib/aulas.ts).
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

const THUMB_CONTENT_TYPES = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
};

const THUMBS_DIR  = join(process.cwd(), 'public', 'aulas', 'thumbs');
const OUTPUT_FILE = join(process.cwd(), 'lib', 'aula-thumb-urls.json');

if (!existsSync(THUMBS_DIR)) {
  console.log('⏭️  Pasta public/aulas/thumbs não existe — nada pra enviar.');
  process.exit(0);
}

let urlMap = {};
if (existsSync(OUTPUT_FILE)) {
  urlMap = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
}

const files = readdirSync(THUMBS_DIR).filter((f) => THUMB_CONTENT_TYPES[extname(f).toLowerCase()]);
console.log(`📁 Capas: ${files.length} arquivo(s) encontrado(s).`);

let uploaded = 0, failed = 0;
for (const file of files) {
  const ext = extname(file).toLowerCase();
  const id  = basename(file, ext);
  try {
    const buf  = readFileSync(join(THUMBS_DIR, file));
    const blob = await put(`aulas/thumbs/${file}`, buf, {
      access: 'public', token, contentType: THUMB_CONTENT_TYPES[ext], addRandomSuffix: false, allowOverwrite: true,
    });
    urlMap[id] = blob.url;
    uploaded++;
    console.log(`✅ ${file}`);
  } catch (err) {
    failed++;
    console.error(`❌ Falha: ${file} — ${err.message}`);
  }
}

writeFileSync(OUTPUT_FILE, JSON.stringify(urlMap, null, 2));
console.log(`\n📊 Enviadas: ${uploaded} | Falhas: ${failed}`);
console.log('📄 Mapeamento salvo em: lib/aula-thumb-urls.json');
