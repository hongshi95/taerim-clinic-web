#!/usr/bin/env node
// 바탕화면 + 시작 메뉴에 "Secrets Manager" 바로가기 생성
// 더블클릭 → 자동으로 GUI 서버 띄우고 브라우저 오픈

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const PROJECT_DIR = path.resolve(process.cwd());
const SHORTCUT_NAME = 'Secrets Manager.lnk';
const BAT_NAME = 'secrets-manager.bat';

// .bat 런처 (프로젝트 내부) — 새 터미널 열고 npm run secrets 실행
const batPath = path.join(PROJECT_DIR, BAT_NAME);
const batContent = `@echo off
title Secrets Manager (deokgye-web)
cd /d "${PROJECT_DIR}"
echo.
echo ========================================
echo   Secrets Manager - localhost:7777
echo ========================================
echo.
echo  Ctrl+C to stop
echo.
node scripts/secrets-manage.mjs serve
pause
`;
fs.writeFileSync(batPath, batContent, 'utf-8');
console.log(`✅ 런처 .bat 생성: ${batPath}`);

// 바탕화면 + 시작 메뉴 .lnk 생성 (PowerShell COM)
const desktopDir = path.join(os.homedir(), 'Desktop');
const startMenuDir = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'Microsoft',
  'Windows',
  'Start Menu',
  'Programs'
);

const targets = [
  { dir: desktopDir, label: '바탕화면' },
  { dir: startMenuDir, label: '시작 메뉴' },
];

for (const { dir, label } of targets) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  ${label} 디렉터리 없음: ${dir}`);
    continue;
  }
  const lnkPath = path.join(dir, SHORTCUT_NAME);
  const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('${lnkPath.replace(/'/g, "''")}')
$Shortcut.TargetPath = '${batPath.replace(/'/g, "''")}'
$Shortcut.WorkingDirectory = '${PROJECT_DIR.replace(/'/g, "''")}'
$Shortcut.Description = '시크릿 관리 GUI (deokgye-web)'
$Shortcut.IconLocation = 'shell32.dll,48'
$Shortcut.Save()
`.trim();

  try {
    execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, '; ')}"`,
      { stdio: 'pipe' }
    );
    console.log(`✅ ${label} 바로가기: ${lnkPath}`);
  } catch (e) {
    console.error(`❌ ${label} 바로가기 실패: ${String(e).slice(0, 200)}`);
  }
}

console.log(`
🎉 설치 완료!

다음부턴 이렇게 쓰세요:
  • 바탕화면의 "Secrets Manager" 아이콘 더블클릭
  • 또는 시작 메뉴에서 "Secrets" 검색

자동으로 GUI 서버 시작 + 브라우저 오픈됩니다.
`);
