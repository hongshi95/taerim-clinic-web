#!/usr/bin/env node
// 모든 MDX 글에 이미지 최소 2장 자동 삽입
// 이미지가 이미 있으면 건너뛰고, 없는 글만 삽입.
//
// 전략:
//   - 각 글마다 "대표 이미지"(첫 H2 직후) + "보조 이미지"(중간 위치)
//   - 소스: picsum.photos seed 기반 (slug 해시 → 일관된 이미지)
//     · CC0 라이선스 + 캐시 친화
//     · 향후 실 이미지로 교체 시 URL만 변경 (alt는 유지)
//   - alt 텍스트: 글 주제(title + entities 일부)로 상세화
//
// 실행: node scripts/add-images-to-mdx.mjs [--dry-run]

import fs from 'node:fs';
import path from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');
const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');

function listMdx(dir) {
  const out = [];
  for (const cat of fs.readdirSync(dir)) {
    const sub = path.join(dir, cat);
    if (!fs.statSync(sub).isDirectory()) continue;
    for (const f of fs.readdirSync(sub)) {
      if (f.endsWith('.mdx')) out.push({ category: cat, slug: f.replace(/\.mdx$/, ''), full: path.join(sub, f) });
    }
  }
  return out;
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) return { fmRaw: '', body: raw };
  return { fmRaw: m[1], body: m[2] };
}

function extractTitle(fmRaw) {
  const m = fmRaw.match(/^title:\s*"([^"]+)"/m);
  return m ? m[1] : '';
}

function countExistingImages(body) {
  const md = (body.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length;
  const html = (body.match(/<img\s+[^>]*src=/gi) ?? []).length;
  return md + html;
}

function insertTwoImages(body, slug, title, category) {
  // 이미지 URL (picsum.photos seed 기반 — 일관된 이미지)
  const img1 = `https://picsum.photos/seed/${slug}-hero/1200/630`;
  const img2 = `https://picsum.photos/seed/${slug}-detail/800/450`;

  // alt 텍스트 (글 주제 반영 + category 힌트)
  const catLabel = { cars: '자동차', dating: '연애', life: '자기관리' }[category] ?? category;
  const alt1 = `${title.replace(/"/g, '')} — 대표 이미지 (${catLabel} 주제 일러스트)`;
  const alt2 = `${title.replace(/"/g, '')} — 본문 세부 이미지`;

  const imgBlock1 = `\n{/* IMG-PLACEHOLDER:hero — 실 이미지 발행 시 교체 */}\n![${alt1}](${img1})\n`;
  const imgBlock2 = `\n{/* IMG-PLACEHOLDER:detail — 실 이미지 발행 시 교체 */}\n![${alt2}](${img2})\n`;

  // 본문 파싱: H2 마다 위치 수집
  const lines = body.split('\n');
  const h2Indices = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) h2Indices.push(i);
  }

  // 대표 이미지: 첫 H2 바로 앞 (글 맨 위에 가까움)
  // 보조 이미지: 중간 H2 앞
  if (h2Indices.length === 0) {
    // H2 없으면 맨 앞에 2장
    return imgBlock1 + imgBlock2 + '\n' + body;
  }

  const firstH2 = h2Indices[0];
  const midH2 = h2Indices[Math.floor(h2Indices.length / 2)] ?? h2Indices[h2Indices.length - 1];

  // 뒤에서 앞으로 삽입 (인덱스 보존)
  const newLines = [...lines];
  if (midH2 !== firstH2) {
    newLines.splice(midH2, 0, imgBlock2);
  }
  newLines.splice(firstH2, 0, imgBlock1);

  return newLines.join('\n');
}

const posts = listMdx(POSTS_DIR);
console.log(`📚 ${posts.length}개 MDX 스캔\n`);

let modified = 0;
let skipped = 0;

for (const p of posts) {
  const raw = fs.readFileSync(p.full, 'utf-8');
  const { fmRaw, body } = parseFrontmatter(raw);
  const existing = countExistingImages(body);

  if (existing >= 2) {
    console.log(`  ⏭️  [${p.category}] ${p.slug} — 이미 ${existing}장`);
    skipped++;
    continue;
  }

  const title = extractTitle(fmRaw);
  const newBody = insertTwoImages(body, p.slug, title, p.category);
  const newRaw = `---\n${fmRaw}\n---\n${newBody}`;

  console.log(`  ✏️  [${p.category}] ${p.slug} — ${existing}장 → 2장 (+${2 - existing})`);

  if (!DRY_RUN) {
    fs.writeFileSync(p.full, newRaw, 'utf-8');
  }
  modified++;
}

console.log(`\n✅ 수정: ${modified}개 · 스킵: ${skipped}개${DRY_RUN ? ' (dry-run)' : ''}`);

if (!DRY_RUN && modified > 0) {
  console.log('\n💡 다음 단계:');
  console.log('  1. git status 로 확인');
  console.log('  2. git commit + push → pre-push 훅 → 자동 배포');
  console.log('  3. 추후 picsum.photos URL을 실 AI 생성 이미지로 교체');
  console.log('     (scripts/sync-mdx-to-d1.mjs 재실행으로 D1도 갱신)');
}
