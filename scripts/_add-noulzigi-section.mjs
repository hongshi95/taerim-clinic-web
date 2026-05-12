#!/usr/bin/env node
/**
 * 노을길 글 mdx에 "노을지기 한마디" 1인칭 단락 일괄 추가
 *  - care/farewell/finance/health 카테고리별 톤 분기
 *  - <!-- NOULZIGI --> 마커로 멱등성
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');

const args = process.argv.slice(2);
const limit = parseInt(args[args.indexOf('--limit') + 1]) || Infinity;

const MARKER = '<!-- NOULZIGI -->';

function askClaude(prompt, { timeout = 4 * 60_000 } = {}) {
  const claudePath = process.env.CLAUDE_CLI || 'claude';
  return execSync(`${claudePath} -p ${JSON.stringify(prompt)}`, {
    encoding: 'utf-8', timeout, maxBuffer: 10 * 1024 * 1024,
  }).trim();
}

const files = [];
for (const cat of ['care', 'farewell', 'finance', 'health']) {
  const dir = path.join(POSTS_DIR, cat);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.mdx'))) {
    files.push({ category: cat, file: path.join(dir, f), name: f });
  }
}
console.log(`━━━ 노을길 ${files.length}편 1인칭 단락 추가 ━━━\n`);

const targets = files.filter(f => !fs.readFileSync(f.file, 'utf-8').includes(MARKER));
console.log(`처리 대상: ${targets.length}편\n`);

const TONE = {
  health: '의료·건강 자료 큐레이터 입장. "저희가 정리하면서", "보건복지부 자료 읽어보니", "보호자분께서 자주 묻는" 같은 표현. 자녀 보호자/본인 양 시점.',
  finance: '시니어 재정 큐레이터 입장. "저희가 1차 출처 확인해보니", "국민연금공단 안내 직접 읽어보니", "어르신과 자녀 입장에서" 같은 표현.',
  care: '돌봄·요양 큐레이터 입장. "저희가 장기요양 자료 정리하면서", "방문요양 현장 사례 모아보니", "보호자분 입장에서 자주 막히는" 같은 표현.',
  farewell: '이별·정리 큐레이터 입장. 절제된 정중한 톤. "저희가 정리하면서 가장 자주 받는 질문", "공식 안내가 빠뜨린 부분", "사전에 알아두면 좋은" 같은 표현. 슬픔·죽음에 대한 가벼운 표현 금지.',
};

const toProcess = targets.slice(0, limit);
let success = 0, failed = 0;
for (const [i, t] of toProcess.entries()) {
  console.log(`\n[${i + 1}/${toProcess.length}] ${t.category}/${t.name}`);
  try {
    const content = fs.readFileSync(t.file, 'utf-8');
    // LF 또는 CRLF 지원
    let fmEnd = content.indexOf('\n---\n', 4);
    let fmEndLen = 5;
    if (fmEnd < 0) {
      fmEnd = content.indexOf('\r\n---\r\n', 4);
      fmEndLen = 7;
    }
    if (fmEnd < 0) throw new Error('frontmatter 종료 못 찾음');
    const frontmatter = content.slice(0, fmEnd + fmEndLen);
    const body = content.slice(fmEnd + fmEndLen);

    const titleMatch = frontmatter.match(/^title:\s*"?(.+?)"?\s*$/m);
    const title = titleMatch ? titleMatch[1] : t.name;
    const bodyExcerpt = body.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2500);

    const prompt = `노을길 (noulgil.com, 시니어·노년 정보 블로그) ${t.category} 글의 본문 끝에 추가할 "노을지기 한마디" 1인칭 단락을 작성하세요.

# 글 정보
- 제목: ${title}
- 카테고리: ${t.category} (시니어·노년 영역)
- 본문 발췌: ${bodyExcerpt}

# 출력 형식
## 노을지기 한마디

[1~2 문단, 각 200~400자]

# 톤
- 노을지기 (필명) 1인칭, 정중한 존댓말
- ${TONE[t.category]}
- 글 주제에 대해 자녀 보호자/본인 입장에서 짚는 포인트 1~2개
- 가짜 본명·이력·경력 단정 금지
- 따뜻하지만 절제된 톤, 과장·감탄사 X

# 출력
H2 + 본문만. 다른 설명 없이 markdown만.`;

    const t0 = Date.now();
    const raw = askClaude(prompt);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

    let block = raw.replace(/^```[a-z]*\s*\n?/g, '').replace(/\n?```\s*$/g, '').trim();
    if (!block.startsWith('##')) {
      const m = block.match(/##[\s\S]*$/);
      if (m) block = m[0];
      else throw new Error('출력에 ## 없음');
    }

    const newBody = body.trimEnd() + '\n\n' + MARKER + '\n\n' + block + '\n';
    fs.writeFileSync(t.file, frontmatter + newBody, 'utf-8');
    console.log(`   ✅ +${block.length}자 (${elapsed}s)`);
    success++;
  } catch (err) {
    console.error(`   ❌ ${err.message.slice(0, 100)}`);
    failed++;
  }
}

console.log(`\n━━━ 완료 ━━━\n✅ ${success} | ❌ ${failed}`);
process.exit(0);
