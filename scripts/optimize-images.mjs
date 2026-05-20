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
  // 충격파 (Ultra Dual) — 3장 (기계 + radial 시술 + focused 시술)
  { src: 'public/images/clinic/shockwave-machine.jpg', dst: 'public/images/clinic/shockwave-machine.webp', height: 1500 },
  { src: 'public/images/clinic/shockwave-treatment.jpg', dst: 'public/images/clinic/shockwave-treatment.webp', width: 1600 },
  { src: 'public/images/clinic/shockwave-focused.jpg', dst: 'public/images/clinic/shockwave-focused.webp', width: 1600 },
  // 한의원 외관·입구·시설 (NAS 한의원에서 폴더)
  { src: 'public/images/clinic/clinic-building.jpg', dst: 'public/images/clinic/clinic-building.webp', width: 1600 }, // 애플플라자 빌딩 전체 (visit hero)
  { src: 'public/images/clinic/clinic-entrance.jpg', dst: 'public/images/clinic/clinic-entrance.webp', width: 1600 }, // 입구 + 太林 로고 (Heritage 접수)
  { src: 'public/images/clinic/clinic-building-close.jpg', dst: 'public/images/clinic/clinic-building-close.webp', width: 1600 }, // 건물 가까이 (예비)
  // 골타 시술 (NAS 05. 골타추나&견인 폴더)
  { src: 'public/images/clinic/golta-treatment-hd.jpg', dst: 'public/images/clinic/golta-treatment-hd.webp', width: 1600 },
  // 매선요법 도구 (NAS 미용/잼버매선실 - JAMBER 녹는 실 4본 정돈 사진, 환자 얼굴 없음 + 가격표 없음)
  { src: 'public/images/clinic/maesun-threads.jpg', dst: 'public/images/clinic/maesun-threads.webp', width: 1200 },
  // 소아 추나 시술 (NAS 아이들 추나, wide landscape, 환자 얼굴 미노출, pediatric 카테고리 hero용)
  { src: 'public/images/clinic/pediatric-chuna.jpg', dst: 'public/images/clinic/pediatric-chuna.webp', width: 1600 },
  // 경추/목 진료 (NAS 06. 어깨 목이 문제 폴더, EXIF orientation 6 - rotate 자동 보정, 환자 얼굴 미노출)
  { src: 'public/images/clinic/neck-treatment.jpg', dst: 'public/images/clinic/neck-treatment.webp', width: 1600, rotate: true },
  // 손목 진료/촉진 (NAS 11. 자전거 손목 폴더, 손·손목만 노출, 손목터널 글 cover)
  { src: 'public/images/clinic/wrist-treatment.jpg', dst: 'public/images/clinic/wrist-treatment.webp', width: 1600, rotate: true },
];

for (const { src, dst, width, height, rotate } of TARGETS) {
  if (!existsSync(src)) {
    console.log(`SKIP: ${src} not found`);
    continue;
  }
  const before = statSync(src).size;
  const pipeline = sharp(src);
  if (rotate) pipeline.rotate(); // EXIF orientation 자동 적용 (세로로 찍힌 사진 보정)
  if (width) pipeline.resize(width, null, { withoutEnlargement: true });
  if (height) pipeline.resize(null, height, { withoutEnlargement: true });
  await pipeline.webp({ quality: 85, effort: 6 }).toFile(dst);
  const after = statSync(dst).size;
  const ratio = ((1 - after / before) * 100).toFixed(1);
  console.log(`✓ ${dst}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (-${ratio}%)`);
}
