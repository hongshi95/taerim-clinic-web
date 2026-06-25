import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '~/consts';

export const GET: APIRoute = async () => {
  // posts collection에서 최신 20개 (draft·noIndex 제외, publishedAt 내림차순) - sitemap과 대칭
  const allPosts = (await getCollection('posts', (p) => !p.data.draft && !p.data.noIndex)).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
  const posts = allPosts.slice(0, 20);

  // 카테고리/저자 slug → 표시 이름 (item의 category·creator 메타용). 의료=저자는 한의사 실명(의료법 명의).
  const categories = await getCollection('categories');
  const authors = await getCollection('authors');
  const catName = new Map(categories.map((c) => [c.id, c.data.name]));
  const authorName = new Map(authors.map((a) => [a.id, a.data.name]));

  const items = posts.map((post) => {
    const slug = post.id.replace(/\.mdx?$/, '').split('/').pop();
    const link = `${SITE.url}/${post.data.category}/${slug}/`;
    return {
      title: post.data.title,
      link,
      description: post.data.description,
      pubDate: post.data.modifiedAt ?? post.data.publishedAt,
      category: catName.get(post.data.category) ?? post.data.category,
      creator: authorName.get(post.data.author) ?? SITE.name,
    };
  });

  // 채널 lastBuildDate = 가장 최근 갱신된 글 날짜
  const lastBuild = items.length > 0 ? items[0].pubDate : new Date(0);

  const escapeXml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description><![CDATA[${item.description}]]></description>
      <category>${escapeXml(item.category)}</category>
      <dc:creator><![CDATA[${item.creator}]]></dc:creator>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
    </item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE.name}</title>
    <link>${SITE.url}</link>
    <description>${SITE.description}</description>
    <language>${SITE.locale}</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
};
