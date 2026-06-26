-- 상담 신청(문의) 접수 테이블
-- 공개 사이트 하단 ConsultBar → POST /api/consult → 여기 저장.
-- 관리자(/admin/leads)와 GET /api/leads 로 열람.

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  area TEXT,
  phone TEXT NOT NULL,
  source TEXT,
  agreed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'done')),
  user_agent TEXT,
  ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
