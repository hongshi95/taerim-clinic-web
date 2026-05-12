-- 덕계 블로그 D1 초기 스키마
-- Phase 3: vivid-blog 자동 발행 + Admin UI를 위한 DB

-- ──────────────────────────────────────
-- 카테고리
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────
-- 저자
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT,
  expertise TEXT, -- JSON array
  knows_about TEXT, -- JSON array
  same_as TEXT, -- JSON array (social profile URLs)
  created_at TEXT DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────
-- 글 (핵심 테이블)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  author_id INTEGER NOT NULL REFERENCES authors(id),

  -- 콘텐츠
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT NOT NULL,
  cover_image TEXT,
  content_md TEXT NOT NULL, -- 마크다운 원본
  content_html TEXT, -- 렌더링된 HTML (빌드 시 생성)
  excerpt TEXT,

  -- AEO/GEO 필드 (모두 필수)
  quick_answer TEXT NOT NULL,
  quick_answer_bullets TEXT, -- JSON array
  faqs TEXT NOT NULL DEFAULT '[]', -- JSON array of {q, a}
  entities TEXT NOT NULL DEFAULT '[]', -- JSON array

  -- 상태
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- 날짜
  published_at TEXT,
  date_modified TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),

  -- 메타
  word_count INTEGER,
  reading_minutes INTEGER,
  featured INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]' -- JSON array
);

-- ──────────────────────────────────────
-- 미디어 (R2 이미지)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key TEXT UNIQUE NOT NULL,
  mime_type TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  byte_size INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ──────────────────────────────────────
-- 내부 링크 (토픽 클러스터)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS internal_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  to_post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  anchor_text TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (from_post_id, to_post_id)
);

-- ──────────────────────────────────────
-- Admin 세션 (PIN 로그인)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY, -- UUID
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  user_agent TEXT,
  ip TEXT
);

-- ──────────────────────────────────────
-- 인덱스 (성능)
-- ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_from ON internal_links(from_post_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);

-- ──────────────────────────────────────
-- 시드: 3개 카테고리 + 1명 저자
-- ──────────────────────────────────────
INSERT OR IGNORE INTO categories (slug, name, description, emoji, display_order) VALUES
  ('cars', '자동차', '직접 타보고 만져본 차량 리뷰 · 관리 · 구매 가이드', '🚗', 1),
  ('dating', '연애', '관계 심리 · 커뮤니케이션 · 데이트 전략', '💬', 2),
  ('life', '자기관리', '습관 · 건강 · 재테크 · 성장 실전 사례', '🌱', 3);

INSERT OR IGNORE INTO authors (slug, name, bio, expertise, knows_about, same_as) VALUES
  (
    'deokgye',
    '덕계 에디터',
    '뭐 하나에 꽂히면 끝을 보는 성격. 자동차·연애·자기관리 주제를 파고들며 실제 경험을 기록합니다.',
    '["자동차 리뷰","실전 연애 심리","자기관리 루틴"]',
    '["자동차","연애 심리","습관 형성","운동","재테크"]',
    '[]'
  );
