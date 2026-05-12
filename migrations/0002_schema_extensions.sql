-- 0002: schema_type, HowTo, Citations, cover_image_alt 컬럼 추가

ALTER TABLE posts ADD COLUMN cover_image_alt TEXT;
ALTER TABLE posts ADD COLUMN schema_type TEXT DEFAULT 'Article';
ALTER TABLE posts ADD COLUMN howto_steps TEXT; -- JSON array of {name, text, image?}
ALTER TABLE posts ADD COLUMN howto_total_time TEXT; -- ISO 8601 duration (예: PT30M)
ALTER TABLE posts ADD COLUMN citations TEXT DEFAULT '[]'; -- JSON array of {claim, source, url?}
