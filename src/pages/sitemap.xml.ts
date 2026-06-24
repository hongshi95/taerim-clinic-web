import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '~/consts';
import { TREATMENT_DETAILS } from '~/data/treatments';
import { PHILOSOPHY_PRINCIPLES } from '~/data/philosophy';

// 커스텀 사이트맵 - 페이지별 실제 lastmod(글은 수정/발행일) 제공.
// @astrojs/sitemap는 전 페이지에 동일한 build date를 찍어 "뭐가 바뀌었는지" 신호가 약했음.
// 글마다 실제 수정일을 lastmod로 주면 크롤러가 변경된 글만 골라 빠르게 재수집한다.
// noindex/draft는 제외(색인 대상만). 모든 라우트 타입을 빠짐없이 포함해야 URL 누락이 없다.

const base = SITE.url;
const iso = (d: Date) => d.toISOString();

interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export const GET: APIRoute = async () => {
  const buildDate = new Date();
  const entries: Entry[] = [];

  // 글 (post) - 실제 수정일 우선, 없으면 발행일
  const posts = await getCollection('posts', (p) => !p.data.draft && !p.data.noIndex);
  for (const post of posts) {
    const slug = post.id.replace(/\.mdx?$/, '').split('/').pop();
    const lastmod = post.data.modifiedAt ?? post.data.publishedAt;
    entries.push({
      loc: `${base}/${post.data.category}/${slug}/`,
      lastmod: iso(lastmod),
      changefreq: 'monthly',
      priority: 0.8,
    });
  }

  // 카테고리 페이지 - 해당 카테고리 최신 글 날짜를 lastmod로
  const categories = await getCollection('categories');
  for (const cat of categories) {
    const catPosts = posts.filter((p) => p.data.category === cat.id);
    const latest = catPosts.length
      ? new Date(Math.max(...catPosts.map((p) => (p.data.modifiedAt ?? p.data.publishedAt).getTime())))
      : buildDate;
    entries.push({ loc: `${base}/${cat.id}/`, lastmod: iso(latest), changefreq: 'weekly', priority: 0.9 });
  }

  // 저자 페이지
  const authors = await getCollection('authors');
  for (const a of authors) {
    entries.push({ loc: `${base}/about/author/${a.id}/`, lastmod: iso(buildDate), changefreq: 'monthly', priority: 0.5 });
  }

  // 진료과목 상세
  for (const t of TREATMENT_DETAILS) {
    entries.push({ loc: `${base}/treatments/${t.slug}/`, lastmod: iso(buildDate), changefreq: 'monthly', priority: 0.7 });
  }

  // 진료 철학
  for (const p of PHILOSOPHY_PRINCIPLES) {
    entries.push({ loc: `${base}/about/philosophy/${p.slug}/`, lastmod: iso(buildDate), changefreq: 'yearly', priority: 0.4 });
  }

  // 정적 페이지 (admin 제외)
  const staticPages: Entry[] = [
    { loc: `${base}/`, changefreq: 'weekly', priority: 1.0 },
    { loc: `${base}/about/`, changefreq: 'monthly', priority: 0.7 },
    { loc: `${base}/visit/`, changefreq: 'monthly', priority: 0.7 },
    { loc: `${base}/faq/`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${base}/posts/`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${base}/editorial-policy/`, changefreq: 'yearly', priority: 0.3 },
    { loc: `${base}/privacy/`, changefreq: 'yearly', priority: 0.2 },
    { loc: `${base}/disclosure/`, changefreq: 'yearly', priority: 0.2 },
  ];
  for (const s of staticPages) entries.push({ ...s, lastmod: iso(buildDate) });

  const body = entries
    .map((e) => {
      const lines = [`    <loc>${e.loc}</loc>`];
      if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority != null) lines.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      return `  <url>\n${lines.join('\n')}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
