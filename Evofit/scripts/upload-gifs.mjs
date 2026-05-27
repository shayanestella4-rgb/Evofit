/**
 * Script para fazer upload de todos os GIFs para o Vercel Blob
 * Uso: node scripts/upload-gifs.mjs
 */

import { put } from '@vercel/blob';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

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

const GIFS_DIR   = join(process.cwd(), 'public', 'gifs');
const OUTPUT_FILE = join(process.cwd(), 'lib', 'gif-urls.json');

// Carrega mapeamento existente (para retomar se interrompido)
let urlMap = {};
if (existsSync(OUTPUT_FILE)) {
  urlMap = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
  console.log(`📂 Retomando: ${Object.keys(urlMap).length} GIFs já enviados`);
}

const gifFiles = readdirSync(GIFS_DIR).filter(f => f.endsWith('.gif'));
console.log(`🎬 Total de GIFs encontrados: ${gifFiles.length}`);
console.log(`⏭️  Já enviados: ${Object.keys(urlMap).length}`);
console.log(`📤 Faltam: ${gifFiles.length - Object.keys(urlMap).length}\n`);

let uploaded = 0;
let skipped  = 0;
let failed   = 0;

for (const file of gifFiles) {
  const id       = basename(file, '.gif');
  const filePath = join(GIFS_DIR, file);

  if (urlMap[id]) {
    skipped++;
    continue;
  }

  try {
    const fileBuffer  = readFileSync(filePath);
    const blob = await put(`gifs/${file}`, fileBuffer, {
      access: 'public',
      token,
      contentType: 'image/gif',
      addRandomSuffix: false,
    });

    urlMap[id] = blob.url;
    uploaded++;

    const total = gifFiles.length;
    const done  = uploaded + skipped;
    const pct   = Math.round((done / total) * 100);
    process.stdout.write(`\r✅ [${done}/${total}] ${pct}% — ${file}                    `);

    // Salva progresso a cada 10 uploads
    if (uploaded % 10 === 0) {
      writeFileSync(OUTPUT_FILE, JSON.stringify(urlMap, null, 2));
    }
  } catch (err) {
    // Arquivo já existe no Blob Store — deriva a URL pelo padrão conhecido
    if (err.message && err.message.includes('blob-allow-overwrite')) {
      const baseUrl = `https://dckgeeda0hovqkbr.public.blob.vercel-storage.com`;
      urlMap[id] = `${baseUrl}/gifs/${file}`;
      uploaded++;
      const total = gifFiles.length;
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
console.log(`\n📄 Mapeamento salvo em: lib/gif-urls.json`);
