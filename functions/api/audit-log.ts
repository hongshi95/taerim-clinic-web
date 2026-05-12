// GET /api/audit-log — 최근 활동 이력
// posts 테이블의 created_at·date_modified·reviewed_at·published_at을
// 통합 타임라인으로 제공

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

interface AuditEvent {
  timestamp: string;
  type: 'created' | 'modified' | 'published' | 'reviewed';
  slug: string;
  title: string;
  category: string | null;
  actor: string | null;
  details?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200);

  try {
    const { results } = await env.DB.prepare(
      `SELECT
         p.slug, p.title, p.status, p.created_at, p.date_modified,
         p.published_at, p.reviewed_at, p.reviewed_by,
         p.fact_check_status, p.fact_check_confidence,
         c.slug as category_slug
       FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY COALESCE(p.reviewed_at, p.date_modified, p.created_at) DESC
       LIMIT ?`
    )
      .bind(limit)
      .all<{
        slug: string;
        title: string;
        status: string;
        created_at: string;
        date_modified: string;
        published_at: string | null;
        reviewed_at: string | null;
        reviewed_by: string | null;
        fact_check_status: string | null;
        fact_check_confidence: string | null;
        category_slug: string | null;
      }>();

    // 각 글의 여러 이벤트를 개별 엔트리로 풀기
    const events: AuditEvent[] = [];
    for (const r of results) {
      const base = {
        slug: r.slug,
        title: r.title,
        category: r.category_slug,
      };
      if (r.created_at) {
        events.push({ ...base, timestamp: r.created_at, type: 'created', actor: 'system' });
      }
      if (r.date_modified && r.date_modified !== r.created_at) {
        events.push({
          ...base,
          timestamp: r.date_modified,
          type: 'modified',
          actor: 'system',
          details: r.fact_check_status
            ? `factcheck=${r.fact_check_status}(${r.fact_check_confidence ?? '-'})`
            : undefined,
        });
      }
      if (r.published_at) {
        events.push({ ...base, timestamp: r.published_at, type: 'published', actor: 'system' });
      }
      if (r.reviewed_at) {
        events.push({
          ...base,
          timestamp: r.reviewed_at,
          type: 'reviewed',
          actor: r.reviewed_by,
          details: r.fact_check_status ?? undefined,
        });
      }
    }

    // 역순 정렬 (최신 먼저)
    events.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    return json({ ok: true, events: events.slice(0, limit) });
  } catch (e) {
    return json({ error: 'DB error', details: String(e).slice(0, 200) }, 500);
  }
};
