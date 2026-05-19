#!/usr/bin/env node
// public/images/clinic/ 큰 사진을 webp + 적정 해상도로 최적화
// 5~6MB JPG/PNG -> 200~400KB webp (load 속도 ↑, Cloudflare bandwidth ↓)

import sharp from 'sharp';
import { existsSync, statSync } from 'fs';

const TARGETS = [
  // portrait (인물 사진): 세로 1500px 충분
  { src: 'public/images/clinic/director-01.jpg', dst: 'public/images/clinic/director-01.webp', height: 1500 },
  { src: 'public/images/clinic/director-02.jpg', dst: 'public/images/clinic/director-02.webp', height: 1500 },
  // landscape (가로): 가로 1600px
  { src: 'public/images/clinic/chuna-hd.png', dst: 'public/images/clinic/chuna-hd.webp', width: 1600 },
  // cutout (alpha 보존): PNG -> webp (lossless 가능)
  { src: 'public/images/clinic/director-cutout.png', dst: 'public/images/clinic/director-cutout.webp', height: 1500 },
];

for (const { src, dst, width, height } of TARGETS) {
  if (!existsSync(src)) {
    console.log(`SKIP: ${src} not found`);
    continue;
  }
  const before = statSync(src).size;
  const pipeline = sharp(src);
  if (width) pipeline.resize(width, null, { withoutEnlargement: true });
  if (height) pipeline.resize(null, height, { withoutEnlargement: true });
  await pipeline.webp({ quality: 85, effort: 6 }).toFile(dst);
  const after = statSync(dst).size;
  const ratio = ((1 - after / before) * 100).toFixed(1);
  console.log(`✓ ${dst}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (-${ratio}%)`);
}
