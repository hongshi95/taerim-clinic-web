// GET /api/stats — admin 대시보드용 D1 통계
// 발행/팩트체크 상태/카테고리/신선도/최근 활동 집계

interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // 병렬 쿼리 (1 rountrip으로 여러 집계)
    const [total, byStatus, byCategory, byFactCheck, byConfidence, recent, staleCandidates, weekly] =
      await Promise.all([
        env.DB.prepare(`SELECT COUNT(*) as n FROM posts`).first<{ n: number }>(),

        env.DB.prepare(`SELECT status, COUNT(*) as n FROM posts GROUP BY status`).all(),

        env.DB.prepare(`
          SELECT c.slug, c.name, COUNT(p.id) as n
          FROM categories c
          LEFT JOIN posts p ON p.category_id = c.id
          GROUP BY c.id ORDER BY c.display_order
        `).all(),

        env.DB.prepare(`
          SELECT fact_check_status, COUNT(*) as n
          FROM posts WHERE fact_check_status IS NOT NULL
          GROUP BY fact_check_status
        `).all(),

        env.DB.prepare(`
          SELECT fact_check_confidence, COUNT(*) as n
          FROM posts WHERE fact_check_confidence IS NOT NULL
          GROUP BY fact_check_confidence
        `).all(),

        env.DB.prepare(`
          SELECT p.slug, p.title, p.status, p.date_modified, p.fact_check_status, p.fact_check_confidence,
                 c.slug as category_slug
          FROM posts p
          LEFT JOIN categories c ON c.id = p.category_id
          ORDER BY p.date_modified DESC
          LIMIT 10
        `).all(),

        env.DB.prepare(`
          SELECT p.slug, p.title, p.date_modified, c.slug as category_slug
          FROM posts p
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE p.status = 'published'
            AND julianday('now') - julianday(p.date_modified) > 90
          ORDER BY p.date_modified ASC
          LIMIT 20
        `).all(),

        env.DB.prepare(`
          SELECT DATE(published_at) as day, COUNT(*) as n
          FROM posts
          WHERE published_at IS NOT NULL
            AND julianday('now') - julianday(published_at) <= 30
          GROUP BY DATE(published_at)
          ORDER BY day DESC
        `).all(),
      ]);

    return json({
      ok: true,
      total: total?.n ?? 0,
      byStatus: byStatus.results ?? [],
      byCategory: byCategory.results ?? [],
      byFactCheck: byFactCheck.results ?? [],
      byConfidence: byConfidence.results ?? [],
      recent: recent.results ?? [],
      staleCandidates: staleCandidates.results ?? [],
      weeklyTrend: weekly.results ?? [],
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return json({ error: 'DB error', details: String(e).slice(0, 200) }, 500);
  }
};
