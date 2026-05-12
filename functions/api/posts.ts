// GET /api/posts — D1에 저장된 글 목록 조회 (관리자 미리보기용)

interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'published';
  const category = url.searchParams.get('category');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 100);

  const factCheckStatus = url.searchParams.get('fact_check_status');

  let query = `
    SELECT
      p.id, p.slug, p.title, p.meta_description, p.cover_image,
      p.published_at, p.date_modified, p.status, p.featured,
      p.reading_minutes, p.word_count,
      p.fact_check_status, p.fact_check_confidence, p.fact_check_summary,
      p.reviewed_at, p.reviewed_by,
      c.slug AS category_slug, c.name AS category_name,
      a.slug AS author_slug, a.name AS author_name
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN authors a ON a.id = p.author_id
    WHERE p.status = ?
  `;
  const bindings: Array<string | number> = [status];

  if (category) {
    query += ' AND c.slug = ?';
    bindings.push(category);
  }

  if (factCheckStatus) {
    query += ' AND p.fact_check_status = ?';
    bindings.push(factCheckStatus);
  }

  query += ' ORDER BY p.published_at DESC LIMIT ?';
  bindings.push(limit);

  try {
    const { results } = await env.DB.prepare(query)
      .bind(...bindings)
      .all();

    return json({ ok: true, count: results.length, posts: results });
  } catch (e) {
    return json({ error: 'DB error', details: String(e) }, 500);
  }
};
