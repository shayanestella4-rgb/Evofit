/**
 * Script para fazer upload dos vídeos e capas das aulas guiadas (cardio,
 * funcional, muay thai...) para o Vercel Blob.
 * Uso: node scripts/upload-aulas.mjs
 *
 * Salve os arquivos em:
 *   public/aulas/videos/<aula-id>.mp4   → gera lib/aula-video-urls.json
 *   public/aulas/thumbs/<aula-id>.jpg   → gera lib/aula-thumb-urls.json  (opcional)
 * O <aula-id> é o "id" de cada aula em lib/aulas.ts (ex: cardio-20min.mp4).
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

const VIDEO_CONTENT_TYPES = {
  '.mp4':  'video/mp4',
  '.mov':  'video/quicktime',
  '.webm': 'video/webm',
};

const THUMB_CONTENT_TYPES = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
};

async function uploadFolder(folderName, sourceDir, outputFile, contentTypes) {
  if (!existsSync(sourceDir)) {
    console.log(`⏭️  Pasta ${sourceDir} não existe, pulando ${folderName}.\n`);
    return;
  }

  let urlMap = {};
  if (existsSync(outputFile)) {
    urlMap = JSON.parse(readFileSync(outputFile, 'utf-8'));
  }

  const files = readdirSync(sourceDir).filter((f) => contentTypes[extname(f).toLowerCase()]);
  console.log(`📁 ${folderName}: ${files.length} arquivo(s) encontrado(s), ${Object.keys(urlMap).length} já enviados.`);

  let uploaded = 0;
  let skipped  = 0;
  let failed   = 0;

  for (const file of files) {
    const ext      = extname(file).toLowerCase();
    const id       = basename(file, ext);
    const filePath = join(sourceDir, file);

    if (urlMap[id]) {
      skipped++;
      continue;
    }

    try {
      const fileBuffer = readFileSync(filePath);
      const blob = await put(`${folderName}/${file}`, fileBuffer, {
        access: 'public',
        token,
        contentType: contentTypes[ext],
        addRandomSuffix: false,
      });

      urlMap[id] = blob.url;
      uploaded++;

      const total = files.length;
      const done  = uploaded + skipped;
      process.stdout.write(`\r✅ [${done}/${total}] ${file}                    `);

      writeFileSync(outputFile, JSON.stringify(urlMap, null, 2));
    } catch (err) {
      if (err.message && err.message.includes('blob-allow-overwrite')) {
        const baseUrl = `https://dckgeeda0hovqkbr.public.blob.vercel-storage.com`;
        urlMap[id] = `${baseUrl}/${folderName}/${file}`;
        uploaded++;
        process.stdout.write(`\r⏭️  já existia — ${file}                    `);
      } else {
        console.error(`\n❌ Falha: ${file} — ${err.message}`);
        failed++;
      }
    }
  }

  writeFileSync(outputFile, JSON.stringify(urlMap, null, 2));
  console.log(`\n   Enviados agora: ${uploaded} | Pulados: ${skipped} | Falhas: ${failed}\n`);
}

await uploadFolder(
  'aulas/videos',
  join(process.cwd(), 'public', 'aulas', 'videos'),
  join(process.cwd(), 'lib', 'aula-video-urls.json'),
  VIDEO_CONTENT_TYPES
);

await uploadFolder(
  'aulas/thumbs',
  join(process.cwd(), 'public', 'aulas', 'thumbs'),
  join(process.cwd(), 'lib', 'aula-thumb-urls.json'),
  THUMB_CONTENT_TYPES
);

console.log('📄 Mapeamentos salvos em lib/aula-video-urls.json e lib/aula-thumb-urls.json');
