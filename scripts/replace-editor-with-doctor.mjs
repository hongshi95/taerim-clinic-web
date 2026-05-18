#!/usr/bin/env node
// MDX 일괄 정정: 편집팀 -> 한의사(서조혁 원장)
// 의료법 제27조·56조 준수: 의료 콘텐츠는 자격자 명의

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walkMdx(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkMdx(full));
    } else if (entry.endsWith('.mdx')) {
      files.push(full);
    }
  }
  return files;
}

const REPLACEMENTS = [
  // frontmatter author 통일
  [/^author:\s*taerimhan\s*$/gm, 'author: seo-johyuk'],
  [/^author:\s*"taerim"\s*$/gm, 'author: seo-johyuk'],

  // 본문 1인칭 — 자주 등장 패턴부터
  [/저희 편집팀이/g, '저(서조혁 원장)는'],
  [/편집팀이 다음 공식 자료를 정리한 결과입니다/g, '서조혁 원장이 다음 공식 자료를 검토한 결과입니다'],
  [/편집팀이 위 기관 자료를 검토한 바로는/g, '원장이 임상에서 확인한 바로는'],
  [/편집팀이 운영하면서 가장 자주 본 실수는/g, '진료실에서 가장 자주 본 실수는'],
  [/편집팀의 관찰에 따르면/g, '진료실에서 관찰한 바로는'],
  [/편집팀 노트/g, '원장 노트'],
  [/편집팀 안내/g, '원장 안내'],

  // 잔여 안전망 (위 패턴에서 못 잡은 '편집팀' 단어)
  [/편집팀/g, '원장'],
];

const files = walkMdx('src/content/posts');
let updated = 0;
const changes = {};
for (const file of files) {
  const original = readFileSync(file, 'utf-8');
  let content = original;
  for (const [pattern, replacement] of REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    writeFileSync(file, content, 'utf-8');
    updated++;
    changes[file] = (original.match(/편집팀/g) || []).length;
  }
}

console.log(`✓ Updated ${updated}/${files.length} files`);
Object.entries(changes).forEach(([file, count]) => {
  console.log(`  - ${file}: ${count} '편집팀' 정정`);
});
