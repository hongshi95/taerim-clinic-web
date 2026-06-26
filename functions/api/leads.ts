// GET   /api/leads — 관리자 전용 문의 목록 (세션 필요)
// PATCH /api/leads — 문의 상태 변경(new/contacted/done)
// 인증: admin-check.ts 와 동일한 deokgye_admin 세션 쿠키 검증.

interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

let leadsTableReady = false;
async function ensureLeadsTable(env: Env): Promise<void> {
  if (leadsTableReady) return;
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, created_at TEXT DEFAULT (datetime('now')), name TEXT NOT NULL, area TEXT, phone TEXT NOT NULL, source TEXT, agreed INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'new', user_agent TEXT, ip TEXT)"
  );
  leadsTableReady = true;
}

async function isAuthed(request: Request, env: Env): Promise<boolean> {
  const cookie = request.headers.get('Cookie') ?? '';
  const m = cookie.match(/deokgye_admin=([a-f0-9]+)/);
  if (!m) return false;
  const s = await env.DB.prepare(
    `SELECT id FROM admin_sessions WHERE id = ? AND expires_at > datetime('now')`
  )
    .bind(m[1])
    .first();
  return !!s;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthed(request, env))) return json({ error: 'unauthorized' }, 401);
  await ensureLeadsTable(env);
  const rows = await env.DB.prepare(
    `SELECT id, created_at, name, area, phone, source, status
     FROM leads ORDER BY created_at DESC LIMIT 500`
  ).all();
  return json({ ok: true, leads: rows.results ?? [] });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthed(request, env))) return json({ error: 'unauthorized' }, 401);
  let body: { id?: string; status?: string };
  try {
    body = (await request.json()) as { id?: string; status?: string };
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const allowed = ['new', 'contacted', 'done'];
  if (!body.id || !allowed.includes(body.status ?? '')) {
    return json({ error: 'bad params' }, 400);
  }
  await env.DB.prepare(`UPDATE leads SET status = ? WHERE id = ?`).bind(body.status, body.id).run();
  return json({ ok: true });
};
