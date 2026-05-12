#!/usr/bin/env node
// 시크릿 통합 관리 도구
//
// 한 번의 명령으로 시크릿을 여러 위치에 동시 등록/조회:
//   1. GitHub repo secret (CI 자동 배포)
//   2. Windows 영구 환경변수 (로컬 wrangler/CLI)
//   3. .env 로컬 파일 (선택)
//
// 사용:
//   node scripts/secrets-manage.mjs set <NAME> <VALUE>     # 모든 위치에 저장
//   node scripts/secrets-manage.mjs list                    # 어디 뭐 있나 조회
//   node scripts/secrets-manage.mjs check <NAME>            # 특정 시크릿 위치 추적
//   node scripts/secrets-manage.mjs remove <NAME>           # 모든 위치에서 제거
//
// 알려진 시크릿 (manifest):
//   - CLOUDFLARE_API_TOKEN     ← CI 배포용 (선택, pre-push 훅 쓰면 불필요)
//   - CLOUDFLARE_ACCOUNT_ID    ← CI 배포용
//   - ADMIN_PIN                ← deokgye.com/admin/ 로그인
//   - PUBLISH_TOKEN            ← vivid-blog → /api/publish 인증
//   - PUBLIC_GSC_VERIFICATION  ← 웹마스터 (Google)
//   - PUBLIC_NAVER_VERIFICATION ← 웹마스터 (네이버)
//   - PUBLIC_BING_VERIFICATION ← 웹마스터 (Bing)
//   - PUBLIC_DAUM_VERIFICATION ← 웹마스터 (Daum)

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const REPO = 'hongshi95/deokgye-web';
const ENV_LOCAL = path.join(process.cwd(), '.env');
const ENV_DEV_VARS = path.join(process.cwd(), '.dev.vars');

// 시크릿 매니페스트 — 시크릿명 → { 어디 저장해야 하나 }
const MANIFEST = {
  CLOUDFLARE_API_TOKEN: { gh: true, winEnv: true, envFile: false, dev: false },
  CLOUDFLARE_ACCOUNT_ID: { gh: true, winEnv: true, envFile: false, dev: false },
  ADMIN_PIN: { gh: false, winEnv: true, envFile: false, dev: true },
  PUBLISH_TOKEN: { gh: false, winEnv: true, envFile: false, dev: true },
  PUBLIC_GSC_VERIFICATION: { gh: true, winEnv: false, envFile: true, dev: false },
  PUBLIC_NAVER_VERIFICATION: { gh: true, winEnv: false, envFile: true, dev: false },
  PUBLIC_BING_VERIFICATION: { gh: true, winEnv: false, envFile: true, dev: false },
  PUBLIC_DAUM_VERIFICATION: { gh: true, winEnv: false, envFile: true, dev: false },
};

const cmd = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

function sh(command, opts = {}) {
  return execSync(command, { encoding: 'utf8', shell: 'bash', ...opts }).trim();
}

function shSafe(command, opts = {}) {
  try {
    return sh(command, opts);
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────
// 위치별 저장 함수
// ─────────────────────────────────────────
function setGitHubSecret(name, value) {
  // value는 stdin으로 전달 — shell escaping 회피
  const tmp = path.join(process.cwd(), `.tmp-secret-${Date.now()}.txt`);
  try {
    fs.writeFileSync(tmp, value, 'utf-8');
    sh(`gh secret set ${name} --repo ${REPO} < "${tmp.replace(/\\/g, '/')}"`);
    return true;
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

function setWindowsEnv(name, value) {
  // PowerShell로 사용자 환경변수 영구 저장
  const escaped = value.replace(/'/g, "''");
  const psCmd = `[Environment]::SetEnvironmentVariable('${name}', '${escaped}', 'User')`;
  sh(`powershell -NoProfile -Command "${psCmd.replace(/"/g, '\\"')}"`);
  return true;
}

function setEnvFile(name, value, file = ENV_LOCAL) {
  let content = '';
  if (fs.existsSync(file)) content = fs.readFileSync(file, 'utf-8');
  const re = new RegExp(`^${name}=.*$`, 'm');
  const newLine = `${name}=${value}`;
  content = re.test(content) ? content.replace(re, newLine) : (content.endsWith('\n') || !content ? content + newLine + '\n' : content + '\n' + newLine + '\n');
  fs.writeFileSync(file, content, 'utf-8');
  return true;
}

// ─────────────────────────────────────────
// 위치별 조회 함수
// ─────────────────────────────────────────
function getGitHubSecret(name) {
  const list = shSafe(`gh secret list --repo ${REPO}`) || '';
  return list.split('\n').some((l) => l.split(/\s+/)[0] === name);
}

function getWindowsEnv(name) {
  const out = shSafe(`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('${name}', 'User')"`);
  return out && out.length > 0 ? out : null;
}

function getEnvFile(name, file = ENV_LOCAL) {
  if (!fs.existsSync(file)) return null;
  const content = fs.readFileSync(file, 'utf-8');
  const m = content.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return m ? m[1] : null;
}

// ─────────────────────────────────────────
// CLI 핸들러
// ─────────────────────────────────────────
function actionSet(name, value) {
  if (!name || !value) {
    console.error('사용: secrets-manage set <NAME> <VALUE>');
    process.exit(2);
  }
  const targets = MANIFEST[name];
  if (!targets) {
    console.warn(`⚠️  미등록 시크릿 "${name}" — manifest에 추가하지 않음, 모든 위치에 저장 시도`);
  }
  const t = targets || { gh: true, winEnv: true, envFile: false, dev: false };

  console.log(`\n🔐 "${name}" 저장 중...`);
  if (t.gh) {
    setGitHubSecret(name, value);
    console.log(`  ✅ GitHub Secret (${REPO})`);
  }
  if (t.winEnv) {
    setWindowsEnv(name, value);
    console.log(`  ✅ Windows User 환경변수 (새 터미널부터 유효)`);
  }
  if (t.envFile) {
    setEnvFile(name, value, ENV_LOCAL);
    console.log(`  ✅ ${ENV_LOCAL}`);
  }
  if (t.dev) {
    setEnvFile(name, value, ENV_DEV_VARS);
    console.log(`  ✅ ${ENV_DEV_VARS}`);
  }
  console.log('\n완료. `secrets-manage check ' + name + '` 으로 확인 가능.');
}

function actionCheck(name) {
  if (!name) {
    console.error('사용: secrets-manage check <NAME>');
    process.exit(2);
  }
  console.log(`\n🔍 "${name}" 위치 추적:\n`);
  const gh = getGitHubSecret(name);
  console.log(`  ${gh ? '✅' : '❌'} GitHub Secret (${REPO})`);
  const we = getWindowsEnv(name);
  console.log(`  ${we ? '✅' : '❌'} Windows User 환경변수${we ? ' — ' + maskValue(we) : ''}`);
  const ef = getEnvFile(name);
  console.log(`  ${ef ? '✅' : '❌'} .env${ef ? ' — ' + maskValue(ef) : ''}`);
  const dv = getEnvFile(name, ENV_DEV_VARS);
  console.log(`  ${dv ? '✅' : '❌'} .dev.vars${dv ? ' — ' + maskValue(dv) : ''}`);
}

function actionList() {
  console.log('\n📋 시크릿 매니페스트 + 현재 상태\n');
  console.log('NAME'.padEnd(30) + 'GH'.padEnd(5) + 'WIN'.padEnd(5) + 'ENV'.padEnd(5) + 'DEV');
  console.log('─'.repeat(50));
  for (const name of Object.keys(MANIFEST)) {
    const gh = getGitHubSecret(name) ? '✅' : '·';
    const we = getWindowsEnv(name) ? '✅' : '·';
    const ef = getEnvFile(name) ? '✅' : '·';
    const dv = getEnvFile(name, ENV_DEV_VARS) ? '✅' : '·';
    console.log(name.padEnd(30) + gh.padEnd(5) + we.padEnd(5) + ef.padEnd(5) + dv);
  }
  console.log('\nGH=GitHub Secret · WIN=Windows env · ENV=.env · DEV=.dev.vars');
}

function actionRemove(name) {
  if (!name) {
    console.error('사용: secrets-manage remove <NAME>');
    process.exit(2);
  }
  console.log(`\n🗑️  "${name}" 제거 중...`);
  shSafe(`gh secret delete ${name} --repo ${REPO}`);
  console.log('  ✅ GitHub Secret');
  shSafe(`powershell -NoProfile -Command "[Environment]::SetEnvironmentVariable('${name}', $null, 'User')"`);
  console.log('  ✅ Windows env');
  // .env 파일에서도 제거
  for (const file of [ENV_LOCAL, ENV_DEV_VARS]) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      const newContent = content.replace(new RegExp(`^${name}=.*$\n?`, 'm'), '');
      if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf-8');
        console.log(`  ✅ ${file}`);
      }
    }
  }
}

function maskValue(v) {
  if (v.length <= 8) return '*'.repeat(v.length);
  return v.slice(0, 4) + '...' + v.slice(-4);
}

// ─────────────────────────────────────────
// 로컬 웹 GUI (브라우저 폼)
// ─────────────────────────────────────────
function actionServe(port = 7777) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);

    if (req.method === 'GET' && url.pathname === '/') {
      const rows = Object.keys(MANIFEST).map((name) => {
        const t = MANIFEST[name];
        const gh = getGitHubSecret(name);
        const we = getWindowsEnv(name);
        const ef = getEnvFile(name);
        const dv = getEnvFile(name, ENV_DEV_VARS);
        const targets = [t.gh && 'GH', t.winEnv && 'WIN', t.envFile && '.env', t.dev && '.dev.vars']
          .filter(Boolean).join(' + ');
        const statuses = [
          t.gh ? (gh ? '✅ GH' : '❌ GH') : '',
          t.winEnv ? (we ? '✅ WIN' : '❌ WIN') : '',
          t.envFile ? (ef ? '✅ .env' : '❌ .env') : '',
          t.dev ? (dv ? '✅ .dev' : '❌ .dev') : '',
        ].filter(Boolean).join(' · ');
        return `
          <tr>
            <td><code>${name}</code><div class="targets">→ ${targets}</div></td>
            <td><div class="status">${statuses}</div></td>
            <td>
              <form method="POST" action="/save" class="row">
                <input type="hidden" name="name" value="${name}">
                <input type="password" name="value" placeholder="새 값 입력 (비우면 변경 안 함)" autocomplete="new-password">
                <button type="submit">저장</button>
              </form>
            </td>
          </tr>`;
      }).join('');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>시크릿 관리</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 1000px; margin: 30px auto; padding: 0 20px; color: #1f2937; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .sub { color: #6b7280; margin-bottom: 30px; }
  table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
  th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  th { background: #f9fafb; font-size: 12px; text-transform: uppercase; color: #6b7280; }
  tr:last-child td { border-bottom: none; }
  code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  .targets { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .status { font-size: 12px; color: #4b5563; line-height: 1.6; }
  input[type=password] { width: 240px; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: monospace; }
  button { padding: 8px 16px; background: #2563eb; color: white; border: 0; border-radius: 6px; cursor: pointer; font-weight: 500; margin-left: 8px; }
  button:hover { background: #1d4ed8; }
  .row { display: flex; align-items: center; }
  .ok { background: #d1fae5; color: #065f46; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
  .err { background: #fee2e2; color: #991b1b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
  .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; }
</style>
</head><body>
  <h1>🔐 시크릿 관리 (deokgye-web)</h1>
  <p class="sub">매니페스트 기반 자동 동기화 — 한 번 입력하면 정해진 위치에 모두 저장</p>
  ${url.searchParams.get('saved') ? `<div class="ok">✅ "${url.searchParams.get('saved')}" 저장 완료 — ${url.searchParams.get('targets') || ''}</div>` : ''}
  ${url.searchParams.get('error') ? `<div class="err">❌ 실패: ${url.searchParams.get('error')}</div>` : ''}
  <table>
    <thead><tr><th>시크릿</th><th>현재 상태</th><th>새 값 저장</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">로컬 전용 (localhost:${port}) · 입력값은 즉시 등록되며 페이지에 저장되지 않음</p>
</body></html>`);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/save') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const params = new URLSearchParams(body);
          const name = params.get('name');
          const value = params.get('value');
          if (!name || !value) {
            res.writeHead(302, { Location: '/?error=' + encodeURIComponent('값을 입력하세요') });
            res.end();
            return;
          }
          const t = MANIFEST[name] || { gh: true, winEnv: true, envFile: false, dev: false };
          const targets = [];
          if (t.gh) { setGitHubSecret(name, value); targets.push('GitHub'); }
          if (t.winEnv) { setWindowsEnv(name, value); targets.push('Windows'); }
          if (t.envFile) { setEnvFile(name, value, ENV_LOCAL); targets.push('.env'); }
          if (t.dev) { setEnvFile(name, value, ENV_DEV_VARS); targets.push('.dev.vars'); }
          res.writeHead(302, {
            Location: '/?saved=' + encodeURIComponent(name) + '&targets=' + encodeURIComponent(targets.join(' + ')),
          });
          res.end();
        } catch (e) {
          res.writeHead(302, { Location: '/?error=' + encodeURIComponent(String(e).slice(0, 200)) });
          res.end();
        }
      });
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  server.listen(port, '127.0.0.1', () => {
    const u = `http://localhost:${port}/`;
    console.log(`\n🌐 시크릿 관리 GUI 실행 중`);
    console.log(`   ${u}\n   브라우저에서 입력 후 Ctrl+C로 종료\n`);
    // 브라우저 자동 오픈 (Windows)
    try {
      execSync(`cmd.exe /c start "" "${u}"`, { stdio: 'ignore' });
    } catch {}
  });
}

// ─────────────────────────────────────────
// 디스패치
// ─────────────────────────────────────────
switch (cmd) {
  case 'set': actionSet(arg1, arg2); break;
  case 'check': actionCheck(arg1); break;
  case 'list': actionList(); break;
  case 'remove': actionRemove(arg1); break;
  case 'serve': actionServe(arg1 ? Number(arg1) : 7777); break;
  default:
    console.log(`사용법:
  node scripts/secrets-manage.mjs serve [PORT]          # 🌐 브라우저 GUI 폼 (default 7777)
  node scripts/secrets-manage.mjs set <NAME> <VALUE>   # 매니페스트 위치에 저장
  node scripts/secrets-manage.mjs check <NAME>          # 어디 저장됐나 조회
  node scripts/secrets-manage.mjs list                  # 전체 매니페스트 + 상태
  node scripts/secrets-manage.mjs remove <NAME>         # 모든 위치에서 제거

매니페스트:`);
    for (const [n, t] of Object.entries(MANIFEST)) {
      const where = [t.gh && 'GH', t.winEnv && 'WIN', t.envFile && 'ENV', t.dev && 'DEV']
        .filter(Boolean).join('+');
      console.log(`  ${n.padEnd(30)} → ${where}`);
    }
}
