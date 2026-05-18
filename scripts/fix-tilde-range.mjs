#!/usr/bin/env node
// MDX 안 '~' 범위 문자를 '-'로 변환 (Markdown strikethrough 충돌 회피)
// '09:30~19:00' 같이 한국어 시간/숫자 범위가 Markdown 파서에 의해 ~text~ 취소선으로 해석되는 문제 fix

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
const counts = {};
for (const file of files) {
  const original = readFileSync(file, 'utf-8');
  let content = original;
  const before = (content.match(/~/g) || []).length;

  // 숫자~숫자 (시간/가격/횟수 등 범위) → 숫자-숫자
  content = content.replace(/(\d)\s*~\s*(\d)/g, '$1-$2');
  // 한글~숫자 (예: 평일~주말, 1주~) → -
  content = content.replace(/([가-힣])\s*~\s*(\d)/g, '$1-$2');
  // 숫자~한글 (예: 5~분 정도) → -
  content = content.replace(/(\d)\s*~\s*([가-힣])/g, '$1-$2');
  // 한글~한글 (예: 광대~턱선, 사춘기 직전~사춘기 초반) → -
  content = content.replace(/([가-힣])\s*~\s*([가-힣])/g, '$1-$2');
  // 영문~영문 (예: A~Z) → -
  content = content.replace(/([A-Za-z])\s*~\s*([A-Za-z])/g, '$1-$2');

  if (content !== original) {
    writeFileSync(file, content, 'utf-8');
    updated++;
    counts[file] = before - (content.match(/~/g) || []).length;
  }
}
console.log(`✓ ${updated}/${files.length} files updated`);
Object.entries(counts).forEach(([f, c]) => console.log(`  - ${f}: ${c} tilde replaced`));
