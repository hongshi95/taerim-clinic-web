#!/usr/bin/env node
/**
 * sync-related-posts.mjs - 관련글(relatedPosts) 스냅샷을 소스 글과 동기화
 *
 * 문제(재발 원인):
 *   각 글 frontmatter의 relatedPosts는 다른 글의 title/summary를 "스냅샷"으로 복사해 둠.
 *   소스 글 제목을 교정하면(예: '충격파 치료' -> '근건이완수기요법') 다른 글에 박힌
 *   스냅샷은 옛 제목으로 남음(stale). 이 옛 제목이 의료법 위반 표현이면
 *   medical-content-lint --strict가 배포를 통째로 막음(silent red).
 *
 * 해결:
 *   relatedPosts 항목의 url로 소스 글을 찾아, 스냅샷 title이 소스의 현재 title과 다르면(stale)
 *   title/summary/cat을 소스 기준으로 갱신. 소스 글은 이미 lint를 통과하므로 동기화 결과도 안전.
 *
 * 사용:
 *   node scripts/sync-related-posts.mjs            # --check: stale 보고만, 있으면 exit 1
 *   node scripts/sync-related-posts.mjs --write    # 실제 수정
 *
 * 배포 게이트(.github/workflows/deploy.yml)에서 medical-content-lint 직전에 --write로 실행 =
 * 소스 제목이 바뀌어도 stale 스냅샷이 자동 갱신되어 재발 방지.
 */
import fs from 'node:fs';
import path from 'node:path';

const WRITE = process.argv.includes('--write');
const ROOT = path.resolve('src/content/posts');

/** frontmatter에서 따옴표 제거한 단일 필드 값 */
function field(front, key) {
  const m = front.match(new RegExp('^' + key + ':\\s*(.+?)\\s*$', 'm'));
  if (!m) return '';
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  return v;
}

// 1) cat/slug -> { title, desc, cat } 소스 맵 구축
const map = {};
for (const cat of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, cat);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(f)) continue;
    const slug = f.replace(/\.mdx?$/, '');
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const fm = raw.match(/^---\r?\n([\s\S]+?)\r?\n---/);
    const front = fm ? fm[1] : '';
    map[`${cat}/${slug}`] = { title: field(front, 'title'), desc: field(front, 'description') || field(front, 'summary'), cat };
  }
}

// 2) 각 글의 relatedPosts 블록을 순회하며 stale 갱신
const report = [];
let totalStale = 0, filesChanged = 0;

for (const cat of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, cat);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(f)) continue;
    const fp = path.join(dir, f);
    const raw = fs.readFileSync(fp, 'utf8');
    const nl = raw.includes('\r\n') ? '\r\n' : '\n';
    const fmm = raw.match(/^(---\r?\n)([\s\S]+?)(\r?\n---)/);
    if (!fmm) continue;
    const lines = fmm[2].split(/\r?\n/);

    let inRP = false, target = null, stale = false, changed = false;
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (/^relatedPosts:\s*$/.test(ln)) { inRP = true; continue; }
      if (!inRP) continue;
      if (/^\S/.test(ln)) { inRP = false; target = null; continue; } // 다음 최상위 키 = 블록 종료

      const um = ln.match(/^\s*-\s*url:\s*"https?:\/\/taerimclinic\.com\/([^"]+?)\/?"/);
      if (um) { target = um[1].replace(/\/$/, ''); stale = false; continue; }

      const tm = ln.match(/^(\s*)title:\s*"(.*)"\s*$/);
      if (tm && target && map[target] && map[target].title) {
        if (map[target].title !== tm[2]) {
          stale = true; totalStale++;
          report.push(`[${cat}/${f.replace(/\.mdx?$/, '')}] -> ${target}\n   stale: "${tm[2]}"\n   source: "${map[target].title}"`);
          if (WRITE) { lines[i] = `${tm[1]}title: "${map[target].title}"`; changed = true; }
        } else stale = false;
        continue;
      }
      // stale 항목만 summary/cat도 소스 기준으로 갱신
      const sm = ln.match(/^(\s*)summary:\s*"(.*)"\s*$/);
      if (sm && target && stale && WRITE && map[target].desc) { lines[i] = `${sm[1]}summary: "${map[target].desc}"`; changed = true; continue; }
      const cm = ln.match(/^(\s*)cat:\s*"(.*)"\s*$/);
      if (cm && target && stale && WRITE) { lines[i] = `${cm[1]}cat: "${map[target].cat}"`; changed = true; continue; }
    }

    if (changed) {
      const head = fmm[1];
      const rest = raw.slice(head.length + fmm[2].length); // \r?\n--- 이후(닫는 ---+본문)
      fs.writeFileSync(fp, head + lines.join(nl) + rest, 'utf8');
      filesChanged++;
    }
  }
}

if (report.length) console.log(report.join('\n') + '\n');
console.log(`stale 관련글 제목 ${totalStale}개` + (WRITE ? ` -> 동기화 완료 (${filesChanged}개 파일 수정)` : ' (--check 모드, 미수정. --write로 수정)'));
if (!WRITE && totalStale > 0) process.exit(1);
