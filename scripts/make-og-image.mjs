#!/usr/bin/env node
/**
 * OG 공유 이미지 생성 - 카테고리별 진료 사진 -> public/og-*.jpg (각 1200x630)
 * webp OG 이미지는 카카오톡 공유 카드에서 렌더링되지 않으므로 JPG로 고정.
 * 빌드와 무관한 1회성 자산 생성 스크립트 (이미지 교체 시 재실행).
 *   node scripts/make-og-image.mjs
 *
 * 크롭 방식: 1.91:1(1200x630)에 맞춰 원본 높이를 자르되, vfrac(0=상단 유지, 1=하단 유지)로
 * 피사체(얼굴/동작)가 잘리지 않는 세로 위치를 잡는다. (sharp position:'attention'은 밝은
 * 영역을 피사체로 잘못 잡아 건물 사진 시절 OG에 하늘만 보이던 원인이라 사용하지 않는다.)
 *
 * 카테고리 매핑(2026-06): 추나=물리치료 장면이라 다이어트와 안 어울려, 다이어트는 상담 장면 사용.
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const clinic = path.join(root, 'public/images/clinic');
const pub = path.join(root, 'public');

const TARGET_W = 1200;
const TARGET_H = 630;

// out: 결과 파일명 / src: 소스 / vfrac: 세로 크롭 위치
const JOBS = [
  { out: 'og-image.jpg',        src: 'chuna-hd.webp',          vfrac: 0.12 }, // 홈/기본/통증치료 (추나)
  { out: 'og-accident.jpg',     src: 'consultation.png',       vfrac: 0.45 }, // 교통사고 (진료 상담)
  { out: 'og-diet.jpg',         src: 'photo-edited.jpg',       vfrac: 0.55 }, // 다이어트 (원장 상담)
  { out: 'og-pediatric.jpg',    src: 'pediatric-chuna.webp',   vfrac: 0.30 }, // 소아 (소아 추나)
  { out: 'og-constitution.jpg', src: 'herbal-preparation.png', vfrac: 0.50 }, // 체질개선 (한약 조제)
  { out: 'og-beauty.jpg',       src: 'maesun-threads.webp',    vfrac: 0.50 }, // 피부미용 (매선)
];

const ratio = TARGET_W / TARGET_H;

for (const job of JOBS) {
  const srcPath = path.join(clinic, job.src);
  const outPath = path.join(pub, job.out);
  const meta = await sharp(srcPath).metadata();
  let cropH = Math.round(meta.width / ratio);
  if (cropH > meta.height) cropH = meta.height;
  const top = Math.round((meta.height - cropH) * job.vfrac);

  await sharp(srcPath)
    .extract({ left: 0, top, width: meta.width, height: cropH })
    .resize(TARGET_W, TARGET_H)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath);

  console.log(`OK ${job.out.padEnd(20)} <- ${job.src.padEnd(24)} (top=${top}, cropH=${cropH})`);
}
console.log(`완료: ${JOBS.length}개 OG 이미지 (${TARGET_W}x${TARGET_H} JPG)`);
