// IndexNow 프로토콜 - Bing, Yandex, Naver(일부) 즉시 인덱싱 통보
// 공식 문서: https://www.indexnow.org/documentation

export const INDEXNOW_KEY = '0e0828f8e02e1a84268bf2cc0bfca3f5';
export const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
] as const;

/**
 * 단일 URL 인덱싱 통보
 * @param url 전체 URL (예: https://deokgye.com/cars/xxx/)
 */
export async function notifyIndexNow(url: string): Promise<void> {
  const endpoint = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`;
  try {
    const res = await fetch(endpoint, { method: 'GET' });
    if (!res.ok) {
      console.error(`IndexNow failed: ${res.status} ${res.statusText}`);
    }
  } catch (e) {
    console.error('IndexNow notify error:', e);
  }
}

/**
 * 다중 URL 배치 통보 (최대 10,000개)
 */
export async function notifyIndexNowBatch(urls: string[], host = 'deokgye.com'): Promise<void> {
  if (urls.length === 0) return;

  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map((ep) =>
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      })
    )
  );

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`IndexNow ${INDEXNOW_ENDPOINTS[i]} failed:`, r.reason);
    } else if (!r.value.ok) {
      console.error(`IndexNow ${INDEXNOW_ENDPOINTS[i]} HTTP ${r.value.status}`);
    }
  });
}
