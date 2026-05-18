#!/usr/bin/env node
// MDX 글에서 em dash (—) 제거
// CLAUDE.md: em dash 금지 — 쉼표나 하이픈 사용

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

const files = walkMdx('src/content/posts');
let updated = 0;
const changeCounts = {};
for (const file of files) {
  const original = readFileSync(file, 'utf-8');
  let content = original;
  const count = (content.match(/—/g) || []).length;
  // ' — '(공백 em dash 공백) → ', ' (한국어 자연스러운 대체)
  content = content.replace(/ — /g, ', ');
  // 잔여 em dash → 하이픈
  content = content.replace(/—/g, '-');
  if (content !== original) {
    writeFileSync(file, content, 'utf-8');
    updated++;
    changeCounts[file] = count;
  }
}
console.log(`✓ ${updated}/${files.length} files updated`);
Object.entries(changeCounts).forEach(([f, c]) => console.log(`  - ${f}: ${c} em dash 제거`));
