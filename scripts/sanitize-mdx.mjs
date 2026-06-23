#!/usr/bin/env node
/**
 * sanitize-mdx.mjs - 발행/빌드 직전 MDX 안전화 (astro build 차단 잔재 제거)
 *
 * 2026-06-23 사고: taerim 배포가 6/22부터 8연속 GitHub Actions failure로 동결(무알림).
 *   근본 원인 = src/content/posts/constitution/...gongjindan-fatigue-care.mdx 에
 *   internal-linker가 채우지 못하고 남긴 `<!-- internal-label -->` HTML 주석.
 *   MDX는 HTML 주석을 지원하지 않아 빌드 첫 에러에서 멈춤 -> 이후 모든 푸시가
 *   같은 파일로 계속 실패 = 사이트 동결.
 *   (같은 클래스 사고를 vivid-blog 엔진은 scripts/lib/sanitize-mdx.mjs로 해결.
 *    taerim은 자체 생성/발행 경로라 미적용이었음. 이 파일이 그 공백을 메움.)
 *
 * 잡는 두 부류 (콘텐츠 MDX 한정):
 *   1) HTML 주석 <!-- ... -->  : MDX 비허용 문법. LLM/internal-linker가 본문에 종종 삽입.
 *   2) 미치환 이미지 플레이스홀더 : 이미지 생성 실패 또는 번역이 토큰을 변형해 남긴 잔재.
 *        - 표준형      ![alt](IMAGE_PLACEHOLDER_3) / ![alt](placeholder)
 *        - 번역 변형형  ![IMAGE_PLACEHOLDER_3](url)  (alt/url 뒤바뀐 형태)
 *        - 표기 변형    image-placeholder, placeholder_2 등 (대소문자/구분자 무시)
 *
 * ⚠️ 스코프 주의: 이 스크립트는 src/content 의 .mdx/.md 콘텐츠 파일만 건드린다.
 *   .astro / .ts / .tsx 는 HTML 주석을 "정상" 문법으로 쓰므로 절대 대상이 아님
 *   (예: src/layouts/*.astro 의 <!-- ... --> 는 합법). em dash 스크립트처럼
 *   src 전체(--all)를 훑으면 합법 주석까지 지우므로, 여기선 콘텐츠로 한정한다.
 *
 * 정상 마크다운 이미지/링크는 보존:
 *   - ![alt](https://...), ![alt](/images/foo.png) 등 실제 URL은 손대지 않음.
 *   - 괄호 안 "전체"가 placeholder 토큰일 때만 제거 -> 실제 자산명에 placeholder가
 *     섞여 있어도(예: /img/placeholder-bg.png) 오삭제 없음.
 *
 * 사용:
 *   node scripts/sanitize-mdx.mjs            # 기본: 잔재 제거 후 파일 수정 + 리포트
 *   node scripts/sanitize-mdx.mjs --check    # 검사만 (수정 X). 잔재 있으면 exit 1
 *   node scripts/sanitize-mdx.mjs --dry-run  # 무엇이 바뀔지 출력만, 수정 X (exit 0)
 *
 * 배선:
 *   - package.json "prebuild" -> npm run build 직전 자동 실행(로컬+CI 공통 최종 방어선).
 *   - .github/workflows/deploy.yml 자가치유 스텝(em dash와 동일 패턴)에서 실행 후 커밋백.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

// 플레이스홀더 토큰 1개를 매칭하는 정규식 조각 (대소문자/구분자 무시).
//   placeholder | image_placeholder | IMAGE-PLACEHOLDER-3 | placeholder_2 ...
const PH = '(?:image[ _-]?)?placeholder(?:[ _-]?\\d+)?';

// 1) HTML 주석 (MDX 빌드 차단). 본문 어디든.
const RE_HTML_COMMENT = /<!--[\s\S]*?-->/g;
// 2a) URL 전체가 placeholder 인 이미지:  ![alt](placeholder)
const RE_PH_URL = new RegExp(`!\\[[^\\]]*\\]\\(\\s*${PH}\\s*\\)`, 'gi');
// 2b) alt 전체가 placeholder 인 이미지(번역 변형):  ![placeholder](url)
const RE_PH_ALT = new RegExp(`!\\[\\s*${PH}\\s*\\]\\([^)]*\\)`, 'gi');

/**
 * 콘텐츠 MDX 문자열에서 빌드 차단 잔재를 제거한 새 문자열을 반환한다 (순수 함수).
 * 동일 입력에 대해 멱등(sanitizeMdx(sanitizeMdx(x)) === sanitizeMdx(x)) -> CI 커밋백 무한루프 없음.
 */
export function sanitizeMdx(md) {
  if (typeof md !== 'string' || !md) return md;
  let out = md;

  const hadComment = RE_HTML_COMMENT.test(out);
  RE_HTML_COMMENT.lastIndex = 0;
  const hadPh = RE_PH_URL.test(out) || RE_PH_ALT.test(out);
  RE_PH_URL.lastIndex = 0;
  RE_PH_ALT.lastIndex = 0;

  out = out.replace(RE_HTML_COMMENT, '');
  out = out.replace(RE_PH_URL, '');
  out = out.replace(RE_PH_ALT, '');

  // 제거로 생긴 빈 줄만 정리(클린 파일은 건드리지 않음): 3줄 이상 빈 줄 -> 2줄.
  if (hadComment || hadPh) {
    out = out.replace(/\n{3,}/g, '\n\n');
  }
  return out;
}

/** 파일 1개의 잔재 건수 리포트({comments, placeholders, total}). 수정하지 않음. */
export function findResidues(md) {
  if (typeof md !== 'string' || !md) return { comments: 0, placeholders: 0, total: 0 };
  const comments = (md.match(RE_HTML_COMMENT) || []).length;
  RE_HTML_COMMENT.lastIndex = 0;
  const phUrl = (md.match(RE_PH_URL) || []).length;
  RE_PH_URL.lastIndex = 0;
  const phAlt = (md.match(RE_PH_ALT) || []).length;
  RE_PH_ALT.lastIndex = 0;
  const placeholders = phUrl + phAlt;
  return { comments, placeholders, total: comments + placeholders };
}

// ---- CLI ----------------------------------------------------------------
// 모듈로 import 될 때는 아래 실행부를 건너뛴다(순수 함수만 재사용).
const isMain = process.argv[1] && resolve(process.argv[1]).endsWith('sanitize-mdx.mjs');
if (isMain) {
  const CHECK = process.argv.includes('--check');
  const DRY = process.argv.includes('--dry-run');
  const CONTENT_DIR = resolve('src/content');

  function walkContent(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) files.push(...walkContent(full));
      else if (entry.endsWith('.mdx') || entry.endsWith('.md')) files.push(full);
    }
    return files;
  }

  const files = walkContent(CONTENT_DIR);
  let changed = 0;
  let totalResidues = 0;
  const report = [];

  for (const file of files) {
    const original = readFileSync(file, 'utf-8');
    const res = findResidues(original);
    if (res.total === 0) continue;

    totalResidues += res.total;
    const rel = relative(process.cwd(), file);
    report.push(`  - ${rel}: 주석 ${res.comments}, 플레이스홀더 ${res.placeholders}`);

    if (!CHECK) {
      const cleaned = sanitizeMdx(original);
      if (cleaned !== original) {
        if (!DRY) writeFileSync(file, cleaned, 'utf-8');
        changed++;
      }
    }
  }

  if (totalResidues === 0) {
    console.log(`✓ MDX 잔재 없음 (${files.length} files 검사)`);
    process.exit(0);
  }

  if (CHECK) {
    console.error(`✗ MDX 잔재 ${totalResidues}건 발견 (${report.length} files):`);
    report.forEach((l) => console.error(l));
    console.error('  -> 수정: node scripts/sanitize-mdx.mjs');
    process.exit(1);
  }

  const verb = DRY ? '수정 예정' : '수정';
  console.log(`✓ MDX 잔재 ${totalResidues}건 ${verb} (${changed}/${files.length} files)`);
  report.forEach((l) => console.log(l));
  process.exit(0);
}
