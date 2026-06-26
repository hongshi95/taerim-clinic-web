// POST /api/consult — 상담 신청(문의) 접수 → D1 leads 테이블.
// 공개 사이트 하단 ConsultBar 가 호출. 같은 도메인이라 CORS 무관.
// 두꺼비와 동일하게 POST만 허용(그 외 405).

interface Env {
  DB: D1Database;
  // 선택: 설정 시 상담 접수를 구글시트에도 미러링(직원 폰 확인용). 미설정이면 조용히 skip.
  SHEET_WEBHOOK_URL?: string;
  // 선택: 웹훅 위변조 방지용 공유 시크릿(Apps Script에서 검증).
  SHEET_WEBHOOK_TOKEN?: string;
}

interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  area: string;
  phone: string;
  source: string;
}

// 구글시트(Apps Script 웹앱) 미러 — 비차단/best-effort.
// 실패해도 상담 접수(D1) 결과엔 영향 없음. URL 미설정 시 즉시 skip.
async function mirrorToSheet(env: Env, lead: LeadRow): Promise<void> {
  const url = env.SHEET_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, token: env.SHEET_WEBHOOK_TOKEN ?? '' }),
    });
  } catch {
    // 미러 실패는 무시(상담은 이미 D1에 저장됨).
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function genId(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// 테이블 자동 생성(런타임 DB 바인딩은 권한 있음 → 수동 마이그레이션 불필요).
// isolate당 1회만 실행되도록 플래그 캐시.
let leadsTableReady = false;
async function ensureLeadsTable(env: Env): Promise<void> {
  if (leadsTableReady) return;
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, created_at TEXT DEFAULT (datetime('now')), name TEXT NOT NULL, area TEXT, phone TEXT NOT NULL, source TEXT, agreed INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'new', user_agent TEXT, ip TEXT)"
  );
  leadsTableReady = true;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  let body: Record<string, unknown>;
  try {
    // ConsultBar는 text/plain로 전송(프리플라이트 회피) → 텍스트를 JSON.parse.
    body = JSON.parse(await request.text());
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  const name = String(body.name ?? '').trim().slice(0, 60);
  const phone = String(body.phone ?? '').replace(/\D/g, '').slice(0, 15);
  const area = String(body.area ?? '미선택').trim().slice(0, 40);
  const source = String(body.source ?? '상담').trim().slice(0, 60);

  if (!name || phone.length < 10) {
    return json({ ok: false, error: '이름/연락처를 확인해 주세요.' }, 400);
  }

  try {
    await ensureLeadsTable(env);
    const id = genId();
    const createdAt = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO leads (id, name, area, phone, source, agreed, user_agent, ip)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
    )
      .bind(
        id,
        name,
        area,
        phone,
        source,
        request.headers.get('User-Agent') ?? '',
        request.headers.get('CF-Connecting-IP') ?? ''
      )
      .run();
    // 구글시트 미러는 응답을 막지 않도록 waitUntil로 백그라운드 처리.
    waitUntil(mirrorToSheet(env, { id, created_at: createdAt, name, area, phone, source }));
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: 'DB error', details: String(e).slice(0, 120) }, 500);
  }
};

export const onRequestGet: PagesFunction<Env> = async () =>
  new Response('Method Not Allowed', { status: 405 });
