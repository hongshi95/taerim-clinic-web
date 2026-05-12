#!/usr/bin/env node
// Git 훅 재설치 (다른 머신에서 clone 후 실행)
// .git/hooks/ 는 gitignore 되기 때문에 checkout 시 자동 복제 안 됨

import fs from 'node:fs';
import path from 'node:path';

const HOOK_SOURCE = path.join('scripts', 'git-hooks', 'pre-push');
const HOOK_TARGET = path.join('.git', 'hooks', 'pre-push');

const hookContent = `#!/bin/sh
# deokgye-web 자동 배포 훅 (scripts/git-hooks/pre-push 기반)
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  exit 0
fi
cd "$(git rev-parse --show-toplevel)"
node scripts/auto-deploy.mjs
`;

fs.mkdirSync(path.dirname(HOOK_TARGET), { recursive: true });
fs.writeFileSync(HOOK_TARGET, hookContent, { mode: 0o755 });

try {
  fs.chmodSync(HOOK_TARGET, 0o755);
} catch {}

console.log(`✅ Git 훅 설치 완료: ${HOOK_TARGET}`);
console.log('   이후 git push (main) → 자동 배포 실행');
