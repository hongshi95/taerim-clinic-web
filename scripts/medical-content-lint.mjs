#!/usr/bin/env node
/**
 * 의료 콘텐츠 위험 표현 lint (의료법 + 팩트체크 보조)
 *
 * em dash lint처럼 CI에서 실행. 의료법 56조(의료광고 금지)에 걸리는
 * 효과 단정·과장·최상급 표현, 그리고 출처 없는 효과 수치를 검출한다.
 *
 * 기본은 '경고'(검토 유도)로 빌드를 막지 않는다. 오탐 가능성 때문.
 * --strict 옵션이면 위험 표현 발견 시 exit 1로 빌드 차단.
 *
 * 사용: node scripts/medical-content-lint.mjs [--strict]
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const STRICT = process.argv.includes('--strict');

// 위험 표현 규칙 (정규식 + 사유). 부정 맥락은 가능한 한 정규식으로 제외.
const RULES = [
  {
    re: /완치(?!\s*(보다|되지\s*않|이?\s*어렵|는\s*어렵|가\s*어렵|되기\s*어렵|가\s*아닌|는\s*어려))/g,
    why: '완치 단정 (치료효과 보장은 의료법 위반 소지)',
    level: 'high',
  },
  {
    re: /100\s*%\s*(효과|완치|치료|호전|개선)/g,
    why: '100% 효과 단정',
    level: 'high',
  },
  {
    re: /반드시\s*(낫|치료|효과|좋아|개선|호전)/g,
    why: '치료효과 단정',
    level: 'high',
  },
  {
    re: /부작용\s*(이|은)?\s*(전혀\s*)?없(습니다|다|음|어요)/g,
    why: '부작용 없음 단정 (안전성 보장 금지)',
    level: 'high',
  },
  {
    re: /(최고(?!조)|최상의|유일한|단\s*하나의|국내\s*1위|업계\s*1위|가장\s*효과적|가장\s*좋은\s*(치료|효과)|제일\s*효과)/g,
    why: '최상급·배타성 표현 (의료광고 금지)',
    level: 'high',
  },
  {
    re: /(즉효|특효|신효|기적적|기적의)/g,
    why: '과장 효과 표현',
    level: 'high',
  },
  {
    re: /\d+\s*kg\s*(감량|빠짐|빠지|줄)/g,
    why: '체중 감량 수치 (효과 단정 주의 - 개인차·출처 명시 필요)',
    level: 'mid',
  },
  {
    // 효과·치료 맥락의 퍼센트만 (본인부담률·증상빈도 등 일반 통계 오탐 제외)
    re: /(효과|호전|개선|완치율|치료율|성공률|감소율)\D{0,12}\d+\s*%/g,
    why: '효과 수치 (반드시 출처·근거 표기 필요)',
    level: 'mid',
  },
];

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.md') || e.endsWith('.mdx')) out.push(p);
  }
  return out;
}

const files = walk('src/content/posts');
let high = 0;
let mid = 0;
let low = 0;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // 출처/citations 줄은 건너뜀 (source·url 라인의 수치는 검증 대상 아님)
    if (/^\s*(source:|url:|- claim:)/.test(line)) return;
    for (const { re, why, level } of RULES) {
      re.lastIndex = 0;
      const m = re.exec(line);
      if (m) {
        const tag = level === 'high' ? '🔴' : level === 'mid' ? '🟡' : '🟢';
        console.log(`${tag} ${file}:${i + 1}  [${why}]`);
        console.log(`    "${line.trim().slice(0, 90)}"`);
        if (level === 'high') high++;
        else if (level === 'mid') mid++;
        else low++;
      }
    }
  });
}

console.log(`\n검출: 🔴 ${high}건(의료법 위험) · 🟡 ${mid}건(효과 수치) · 🟢 ${low}건(출처 권장)`);

if (high === 0 && mid === 0) {
  console.log('✓ 의료법 위험·효과 단정 표현 없음');
}

// strict 모드: high 등급 발견 시 빌드 차단
if (STRICT && high > 0) {
  console.error(`\n❌ 의료법 위험 표현 ${high}건 - 수정 필요 (--strict)`);
  process.exit(1);
}
