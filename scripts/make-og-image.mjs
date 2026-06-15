#!/usr/bin/env node
/**
 * OG 공유 이미지 생성 - chuna-hd.webp(원장 추나 진료 장면) -> public/og-image.jpg (1200x630)
 * webp OG 이미지는 카카오톡 공유 카드에서 렌더링되지 않으므로 JPG로 고정.
 * 빌드와 무관한 1회성 자산 생성 스크립트 (이미지 교체 시 재실행).
 *   node scripts/make-og-image.mjs
 *
 * 크롭 방식: 1.91:1(1200x630)에 맞춰 4:3 원본의 높이를 자르되, 상단을 살짝(12%)만
 * 트리밍해 원장 머리가 잘리지 않게 하고 하단 바닥 여백을 제거한다.
 * (sharp position:'attention'은 밝은 하늘 영역을 피사체로 잘못 잡아, 건물 사진을 쓰던
 *  시절 검색 썸네일에 하늘만 보이던 원인이라 사용하지 않는다.)
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'public/images/clinic/chuna-hd.webp');
const out = path.join(root, 'public/og-image.jpg');

const TARGET_W = 1200;
const TARGET_H = 630;
const TOP_TRIM_FRACTION = 0.12; // 0=상단 유지, 1=하단 유지

const meta = await sharp(src).metadata();
const ratio = TARGET_W / TARGET_H;
let cropH = Math.round(meta.width / ratio);
if (cropH > meta.height) cropH = meta.height;
const top = Math.round((meta.height - cropH) * TOP_TRIM_FRACTION);

await sharp(src)
  .extract({ left: 0, top, width: meta.width, height: cropH })
  .resize(TARGET_W, TARGET_H)
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(out);

console.log(`OG 이미지 생성: ${out} (${TARGET_W}x${TARGET_H} JPG, src=chuna-hd.webp, top=${top})`);
