#!/usr/bin/env node
// git push 후 자동 배포 오케스트레이터
// pre-push hook에서 호출 — build + wrangler pages deploy 순차 실행
// 토큰/시크릿 없이 로컬 wrangler OAuth로 배포

import { execSync } from 'node:child_process';

function run(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: 'bash', ...opts });
}

try {
  console.log('\n🏗️  Building...');
  run('npm run build');

  console.log('\n🚀 Deploying to Cloudflare Pages...');
  run('npx wrangler pages deploy dist --project-name=deokgye-web --branch=main --commit-dirty=true --commit-message="auto deploy"');

  console.log('\n✅ 배포 완료 — https://deokgye.com (반영 1-2분)');
} catch (e) {
  console.error('\n❌ 배포 실패');
  console.error(e.message || String(e));
  process.exit(1);
}
