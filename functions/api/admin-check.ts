// GET /api/admin-check — 현재 세션 유효성 확인

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(/deokgye_admin=([a-f0-9]+)/);
  if (!match) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = await env.DB.prepare(
    `SELECT id FROM admin_sessions WHERE id = ? AND expires_at > datetime('now')`
  )
    .bind(match[1])
    .first();

  return new Response(
    JSON.stringify({ authenticated: !!session }),
    {
      status: session ? 200 : 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    }
  );
};
