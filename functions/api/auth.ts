// POST /api/auth — Admin PIN 로그인
// 성공 시 session cookie 설정 (HttpOnly, Secure)

interface Env {
  DB: D1Database;
  ADMIN_PIN?: string;
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ADMIN_PIN) {
    return json({ error: 'ADMIN_PIN not configured' }, 500);
  }

  let body: { pin?: string };
  try {
    body = (await request.json()) as { pin?: string };
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!body.pin || body.pin !== env.ADMIN_PIN) {
    return json({ error: 'Invalid PIN' }, 401);
  }

  // 세션 생성
  const sessionId = randomId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24시간

  await env.DB.prepare(
    'INSERT INTO admin_sessions (id, expires_at, user_agent, ip) VALUES (?, ?, ?, ?)'
  )
    .bind(
      sessionId,
      expiresAt,
      request.headers.get('User-Agent') ?? '',
      request.headers.get('CF-Connecting-IP') ?? ''
    )
    .run();

  // 오래된 세션 정리
  await env.DB.prepare(`DELETE FROM admin_sessions WHERE expires_at < datetime('now')`).run();

  const cookie = `deokgye_admin=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}`;

  return json(
    { ok: true },
    200,
    { 'Set-Cookie': cookie }
  );
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(/deokgye_admin=([a-f0-9]+)/);
  if (match) {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(match[1]).run();
  }
  return json(
    { ok: true },
    200,
    { 'Set-Cookie': 'deokgye_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' }
  );
};
