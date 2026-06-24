#!/usr/bin/env node
/**
 * IndexNow 일괄 색인 통보
 * Bing·Naver·Yandex 등 IndexNow 참여 검색엔진에 URL 변경을 즉시 알림
 * (구글은 IndexNow 미지원 → GSC에서 별도 처리)
 *
 * 사용: node scripts/indexnow-submit.mjs
 * sitemap.xml에서 전체 URL을 읽어 한 번에 통보
 */
const KEY = process.env.TAERIMHAN_INDEXNOW_KEY || 'd9302cc99124c895f0c30edc61542da4';
const HOST = 'taerimclinic.com';
const SITEMAP = `https://${HOST}/sitemap.xml`;

// 1) sitemap에서 URL 추출
const res = await fetch(SITEMAP);
if (!res.ok) {
  console.error(`sitemap fetch 실패: ${res.status}`);
  process.exit(1);
}
const xml = await res.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`sitemap에서 ${urls.length}개 URL 추출`);

if (urls.length === 0) {
  console.error('URL이 없습니다');
  process.exit(1);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: urls,
};

// 2) IndexNow 공식 엔드포인트 (참여 엔진에 자동 전파)
const endpoints = [
  'https://api.indexnow.org/indexnow',
  'https://searchadvisor.naver.com/indexnow', // 네이버 직접
];

for (const ep of endpoints) {
  try {
    const r = await fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    console.log(`✓ ${ep} → ${r.status} ${r.statusText}`);
  } catch (e) {
    console.error(`✗ ${ep} → ${e.message}`);
  }
}

console.log('\nIndexNow 통보 완료. (색인은 검색엔진 처리 시간에 따라 며칠 소요)');
