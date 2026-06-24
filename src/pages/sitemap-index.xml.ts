import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '~/consts';

// 사이트맵 인덱스 - 실제 URL 목록(sitemap.xml)을 가리키는 목차.
// 129개 URL 규모엔 단일 sitemap.xml로 충분하지만, 표준 index 주소(/sitemap-index.xml)를
// 함께 살려둬 과거 제출/호환을 유지한다. lastmod = 최신 글 수정/발행일(콘텐츠 변경 신호).

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts', (p) => !p.data.draft && !p.data.noIndex);
  const latest = posts.length
    ? new Date(Math.max(...posts.map((p) => (p.data.modifiedAt ?? p.data.publishedAt).getTime())))
    : new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE.url}/sitemap.xml</loc>
    <lastmod>${latest.toISOString()}</lastmod>
  </sitemap>
</sitemapindex>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
