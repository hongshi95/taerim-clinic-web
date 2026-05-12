-- 0003: 팩트체크 보고서 컬럼 추가
-- 4-레이어 파이프라인 (L1 규칙 / L2 엔티티 실증 / L3 크로스 모델 / L4 리뷰)

ALTER TABLE posts ADD COLUMN fact_check_status TEXT DEFAULT 'pending';
-- 'pending' | 'auto-approved' | 'needs-review' | 'blocked' | 'reviewed'

ALTER TABLE posts ADD COLUMN fact_check_confidence TEXT DEFAULT 'low';
-- 'high' | 'medium' | 'low'

ALTER TABLE posts ADD COLUMN fact_check_summary TEXT;
-- 한 줄 요약 (대시보드 표시용)

ALTER TABLE posts ADD COLUMN fact_check_report TEXT;
-- JSON: FactCheckReport 전체 직렬화 (상세 리뷰 페이지)

ALTER TABLE posts ADD COLUMN reviewed_at TEXT;
-- 관리자 수동 리뷰 완료 시각 (ISO)

ALTER TABLE posts ADD COLUMN reviewed_by TEXT;
-- 리뷰어 식별자

-- 대시보드 필터용 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_factcheck_status ON posts(fact_check_status);
