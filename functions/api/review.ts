// POST /api/review — 관리자 팩트체크 리뷰 처리
//   body: { slug, decision: 'approve' | 'reject', reviewer?: string }
// GET /api/review?slug=... — 리뷰 상세 (report JSON 포함)

interface Env {
  DB: D1Database;
  ADMIN_PIN?: string;
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

// 인증: admin cookie 확인 (admin-check와 동일 로직, 간단화)
async function isAdmin(request: Request, env: Env): Promise<boolean> {
  const cookie = request.headers.get('Cookie') || '';
  return /admin=ok/.test(cookie) || !!env.ADMIN_PIN === false;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return json({ error: 'unauthorized' }, 401);

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  if (!slug) return json({ error: 'slug required' }, 400);

  try {
    const row = await env.DB.prepare(
      `SELECT slug, title, content_md, category_id, fact_check_status,
              fact_check_confidence, fact_check_summary, fact_check_report,
              reviewed_at, reviewed_by, entities
       FROM posts WHERE slug = ?`
    )
      .bind(slug)
      .first();

    if (!row) return json({ error: 'not found' }, 404);

    // fact_check_report는 JSON 문자열 — 파싱해서 반환
    let report: unknown = null;
    if (row.fact_check_report) {
      try {
        report = JSON.parse(row.fact_check_report as string);
      } catch {
        // 파싱 실패는 raw 문자열 그대로
      }
    }

    return json({ ok: true, post: { ...row, fact_check_report_parsed: report } });
  } catch (e) {
    return json({ error: 'DB error', details: String(e) }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return json({ error: 'unauthorized' }, 401);

  const body = (await request.json().catch(() => null)) as {
    slug?: string;
    decision?: 'approve' | 'reject';
    reviewer?: string;
  } | null;

  if (!body?.slug || !body.decision) {
    return json({ error: 'slug and decision required' }, 400);
  }

  const newStatus = body.decision === 'approve' ? 'reviewed' : 'blocked';
  const reviewer = body.reviewer ?? 'admin';

  try {
    const res = await env.DB.prepare(
      `UPDATE posts
       SET fact_check_status = ?, reviewed_at = datetime('now'), reviewed_by = ?
       WHERE slug = ?`
    )
      .bind(newStatus, reviewer, body.slug)
      .run();

    if ((res.meta?.changes ?? 0) === 0) {
      return json({ error: 'post not found' }, 404);
    }

    return json({ ok: true, slug: body.slug, status: newStatus });
  } catch (e) {
    return json({ error: 'DB error', details: String(e) }, 500);
  }
};
