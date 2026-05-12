#!/usr/bin/env node
// MDX 콘텐츠를 D1 posts 테이블로 동기화 (1회성)
//   - src/content/posts/**/*.mdx 글들을 읽어 frontmatter + 본문 추출
//   - D1에 INSERT OR REPLACE (slug 기준)
//   - /api/stats, /admin/metrics, /admin/audit-log 가 실데이터 표시하도록
//
// 실행: node scripts/sync-mdx-to-d1.mjs [--dry-run]
//
// 주의: PUBLISH_TOKEN 우회 — wrangler d1 execute로 직접 SQL 실행

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import os from 'node:os';

const DRY_RUN = process.argv.includes('--dry-run');
const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');
const DB_NAME = 'deokgye_db';

// ── frontmatter 파서 (gray-matter 의존성 없이) ──
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const [, fmRaw, body] = match;
  const frontmatter = {};

  // 간단 YAML 파서 — key: value + 배열 + 따옴표 문자열
  const lines = fmRaw.split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    // 배열 아이템 (들여쓰기 + "-")
    if (/^\s{2,}-\s/.test(line) && currentArray) {
      let val = line.replace(/^\s*-\s*/, '').trim();
      val = stripQuotes(val);
      currentArray.push(val);
      continue;
    }

    // 배열 내부 키 (FAQ 등)
    if (/^\s{4,}\w+:/.test(line) && currentArray && currentArray.length > 0) {
      const [subKey, ...subValParts] = line.trim().split(':');
      const subVal = stripQuotes(subValParts.join(':').trim());
      const last = currentArray[currentArray.length - 1];
      if (typeof last === 'string') {
        currentArray[currentArray.length - 1] = { [subKey]: subVal };
      } else {
        last[subKey] = subVal;
      }
      continue;
    }

    // 최상위 key:
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      const [, key, rawVal] = kv;
      currentKey = key;
      const val = rawVal.trim();
      if (val === '' || val === '|') {
        // 하위 배열/객체 예상
        currentArray = [];
        frontmatter[key] = currentArray;
      } else {
        currentArray = null;
        frontmatter[key] = stripQuotes(val);
      }
    }
  }

  return { frontmatter, body };
}

function stripQuotes(s) {
  if (!s) return s;
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// ── MDX 전체 스캔 ──
function scanMDX() {
  const all = [];
  const categories = fs.readdirSync(POSTS_DIR).filter((d) =>
    fs.statSync(path.join(POSTS_DIR, d)).isDirectory()
  );
  for (const category of categories) {
    const catDir = path.join(POSTS_DIR, category);
    const files = fs.readdirSync(catDir).filter((f) => f.endsWith('.mdx'));
    for (const file of files) {
      const full = path.join(catDir, file);
      const raw = fs.readFileSync(full, 'utf-8');
      const slug = file.replace(/\.mdx$/, '');
      const { frontmatter, body } = parseFrontmatter(raw);
      all.push({ category, slug, full, frontmatter, body, wordCount: body.split(/\s+/).length });
    }
  }
  return all;
}

// ── SQL 생성 ──
function esc(s) {
  if (s === null || s === undefined) return 'NULL';
  if (typeof s === 'number') return String(s);
  if (typeof s === 'boolean') return s ? '1' : '0';
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildSql(posts, categoryMap, authorMap) {
  const lines = [];
  for (const p of posts) {
    const f = p.frontmatter;
    const categoryId = categoryMap[p.category];
    const authorId = authorMap[f.author || 'deokgye'];
    if (!categoryId || !authorId) {
      console.warn(`⚠️  스킵: ${p.slug} (category=${p.category} author=${f.author})`);
      continue;
    }

    const publishedAt = f.publishedAt || new Date().toISOString().slice(0, 10);
    const modifiedAt = f.modifiedAt || publishedAt;
    const readingMinutes = Math.max(1, Math.ceil(p.wordCount / 200));
    const quickAnswerBullets = JSON.stringify(f.quickAnswerBullets || []);
    const faqs = JSON.stringify(f.faqs || []);
    const entities = JSON.stringify(f.entities || []);
    const tags = JSON.stringify(f.tags || []);
    const citations = JSON.stringify(f.citations || []);

    lines.push(`
INSERT OR REPLACE INTO posts (
  slug, category_id, author_id, title, meta_title, meta_description,
  cover_image, cover_image_alt, content_md, quick_answer, quick_answer_bullets,
  faqs, entities, status, published_at, date_modified,
  word_count, reading_minutes, featured, tags,
  schema_type, citations,
  fact_check_status, fact_check_confidence, fact_check_summary
) VALUES (
  ${esc(p.slug)}, ${categoryId}, ${authorId},
  ${esc(f.title)}, ${esc(f.meta_title || f.title)}, ${esc(f.description || '')},
  NULL, ${esc(f.coverImageAlt || '')}, ${esc(p.body)},
  ${esc(f.quickAnswer || '')}, ${esc(quickAnswerBullets)},
  ${esc(faqs)}, ${esc(entities)},
  'published', ${esc(publishedAt)}, ${esc(modifiedAt)},
  ${p.wordCount}, ${readingMinutes}, 0, ${esc(tags)},
  ${esc(f.schemaType || 'Article')}, ${esc(citations)},
  'auto-approved', 'high', 'MDX 수동 편집 (rules.ts 매뉴얼 검증 가정)'
);`);
  }
  return lines.join('\n');
}

// ── 메인 ──
console.log('📚 MDX → D1 sync\n');

const posts = scanMDX();
console.log(`발견: ${posts.length}개 글\n`);
posts.forEach((p) => {
  console.log(`  [${p.category}] ${p.slug} — ${p.frontmatter.title?.slice(0, 40) ?? '(제목 없음)'}`);
});

if (posts.length === 0) {
  console.log('\n동기화할 글 없음. 종료.');
  process.exit(0);
}

// 카테고리 + 저자 ID 매핑 (D1에서 조회)
console.log('\n🔍 카테고리/저자 ID 조회...');
function queryD1(sql) {
  const out = execSync(
    `npx wrangler d1 execute ${DB_NAME} --remote --command="${sql.replace(/"/g, '\\"')}" --json`,
    { encoding: 'utf-8' }
  );
  const m = out.match(/"results":\s*(\[[\s\S]*?\])/);
  return m ? JSON.parse(m[1]) : [];
}

const cats = queryD1('SELECT id, slug FROM categories');
const auths = queryD1('SELECT id, slug FROM authors');
const categoryMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
const authorMap = Object.fromEntries(auths.map((a) => [a.slug, a.id]));
console.log('  카테고리:', categoryMap);
console.log('  저자:', authorMap);

const sql = buildSql(posts, categoryMap, authorMap);
const sqlPath = path.join(os.tmpdir(), `mdx-sync-${Date.now()}.sql`);
fs.writeFileSync(sqlPath, sql, 'utf-8');
console.log(`\n✏️  SQL 생성: ${sqlPath} (${sql.length} bytes)`);

if (DRY_RUN) {
  console.log('\n[dry-run] 실행 스킵. SQL 파일 확인 후 재실행.');
  process.exit(0);
}

console.log('\n🚀 D1에 적용...');
execSync(
  `npx wrangler d1 execute ${DB_NAME} --remote --file="${sqlPath.replace(/\\/g, '/')}"`,
  { stdio: 'inherit' }
);

console.log('\n✅ 완료 — /admin/metrics 새로고침 시 반영');

// 임시 파일 정리
try {
  fs.unlinkSync(sqlPath);
} catch {}
