#!/usr/bin/env node
/**
 * OG 공유 이미지 생성 - clinic-building.webp → public/og-image.jpg (1200x630)
 * webp OG 이미지는 카카오톡 공유 카드에서 렌더링되지 않으므로 JPG로 고정.
 * 빌드와 무관한 1회성 자산 생성 스크립트 (이미지 교체 시 재실행).
 *   node scripts/make-og-image.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'public/images/clinic/clinic-building.webp');
const out = path.join(root, 'public/og-image.jpg');

await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(out);

console.log(`✅ OG 이미지 생성: ${out} (1200x630 JPG)`);
