import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '~/consts';

export const GET: APIRoute = async () => {
  // posts collection에서 최신 20개 (draft 제외, publishedAt 내림차순)
  const allPosts = (await getCollection('posts', (p) => !p.data.draft)).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
  const posts = allPosts.slice(0, 20);

  const items = posts.map((post) => {
    const slug = post.id.replace(/\.mdx?$/, '').split('/').pop();
    const link = `${SITE.url}/${post.data.category}/${slug}/`;
    return {
      title: post.data.title,
      link,
      description: post.data.description,
      pubDate: post.data.publishedAt,
    };
  });

  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid>${item.link}</guid>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
    </item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.name}</title>
    <link>${SITE.url}</link>
    <description>${SITE.description}</description>
    <language>${SITE.locale}</language>
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
