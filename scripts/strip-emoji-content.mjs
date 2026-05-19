#!/usr/bin/env node
/**
 * MDX 본문에서 그럴듯한 이모지 일괄 제거
 * 사용자 규칙: 의료 콘텐츠에 이모지 사용 X (전문성 저하)
 * 대상: 📚 🟢 📞 🗺️ 🩺 🥗 🚗 👶 ✨ 🌿 ⭐ 🔥 📌 📝 🕘
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const EMOJI_PATTERNS = [
  /📚\s*/g,
  /🟢\s*/g,
  /📞\s*/g,
  /🗺️\s*/g,
  /🩺\s*/g,
  /🥗\s*/g,
  /🚗\s*/g,
  /👶\s*/g,
  /✨\s*/g,
  /🌿\s*/g,
  /⭐\s*/g,
  /🔥\s*/g,
  /📌\s*/g,
  /📝\s*/g,
  /🕘\s*/g,
];

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      files.push(...walk(p));
    } else if (e.endsWith('.md') || e.endsWith('.mdx')) {
      files.push(p);
    }
  }
  return files;
}

const files = walk('src/content/posts');
let changedCount = 0;

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const re of EMOJI_PATTERNS) {
    after = after.replace(re, '');
  }
  if (before !== after) {
    writeFileSync(file, after, 'utf8');
    console.log(`✓ ${file}`);
    changedCount++;
  }
}

console.log(`\nDone. ${changedCount}/${files.length} files cleaned.`);
