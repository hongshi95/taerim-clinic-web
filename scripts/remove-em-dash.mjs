#!/usr/bin/env node
// em dash(—) 제거 — 모든 case를 하이픈 ' - '로 일관성 변환
// CLAUDE.md: em dash 금지, 하이픈 사용. (쉼표는 시간 범위/인용 by-line에서 어색해서 회피)

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walkMdx(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walkMdx(full));
    else if (entry.endsWith('.mdx')) files.push(full);
  }
  return files;
}

function walkAll(dir, exts) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', '.astro', '.wrangler', '.git'].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walkAll(full, exts));
    else if (exts.some(e => entry.endsWith(e))) files.push(full);
  }
  return files;
}

// 인자 --all → src 전체, 기본 → MDX만
const files = process.argv.includes('--all')
  ? walkAll('src', ['.astro', '.ts', '.tsx', '.json', '.mdx', '.md', '.mjs', '.css'])
  : walkMdx('src/content/posts');

let updated = 0;
const counts = {};
for (const file of files) {
  const original = readFileSync(file, 'utf-8');
  let content = original;
  const before = (content.match(/—/g) || []).length;

  // 시간 범위 잔재 (이전 ', ' 변환 case): "09:30, 19:00" -> "09:30 - 19:00"
  content = content.replace(/(\d{1,2}:\d{2}),\s*(\d{1,2}:\d{2})/g, '$1 - $2');

  // em dash → 하이픈 (모든 컨텍스트 일관성)
  content = content.replace(/ — /g, ' - ');
  content = content.replace(/—/g, '-');

  if (content !== original) {
    writeFileSync(file, content, 'utf-8');
    updated++;
    counts[file] = before;
  }
}
console.log(`✓ ${updated}/${files.length} files updated`);
Object.entries(counts).forEach(([f, c]) => console.log(`  - ${f}: ${c} em dash`));
