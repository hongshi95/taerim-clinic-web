// GET /images/{key} — R2 이미지 서빙 + 엣지 캐싱
// 예: /images/ab/cd/abcdef...webp

interface Env {
  MEDIA: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env, request, next }) => {
  const pathParts = params.path;
  const key = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts ?? '');

  if (!key) {
    return new Response('Not Found', { status: 404 });
  }

  // /images/clinic/, /images/team/ 등 정적 파일 경로는 R2 우회 — Pages 정적 파일 직접 serve
  // R2는 사용자 업로드 동적 콘텐츠(/images/r2/*, /images/{hash}.webp 등)용
  const STATIC_PREFIXES = ['clinic/', 'team/', 'logo/', 'icons/', 'og/'];
  if (STATIC_PREFIXES.some(p => key.startsWith(p))) {
    return next();
  }

  // Cloudflare Cache API — 엣지 캐시 활용
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // R2에서 조회
  const obj = await env.MEDIA.get(key);
  if (!obj) {
    // R2 miss → 정적 파일 fallback (public/images/{key} 시도)
    return next();
  }

  // ETag 기반 304 응답 (조건부 GET)
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch === obj.httpEtag) {
    return new Response(null, { status: 304 });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('content-length', String(obj.size));

  const response = new Response(obj.body, { headers });

  // 엣지 캐시에 저장 (비동기)
  await cache.put(cacheKey, response.clone());

  return response;
};
