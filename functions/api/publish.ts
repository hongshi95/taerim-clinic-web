// POST /api/publish — vivid-blog 자동 발행 엔드포인트
// - 이미지: base64 또는 외부 URL 수용, R2 저장
// - 콘텐츠 구조 강제 검증 (AEO/GEO)
// - IndexNow 자동 통보

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ADMIN_PIN?: string;
  PUBLISH_TOKEN?: string;
}

interface ImagePayload {
  key: string; // content_md 내 치환용 플레이스홀더 (예: "__IMG_1__")
  base64?: string; // WebP 권장, 없으면 url 사용
  url?: string; // 이미 외부 호스팅된 경우
  contentType?: string; // "image/webp" 기본
  alt: string; // SEO 필수
  filename?: string;
}

interface PublishPayload {
  title: string;
  meta_title?: string;
  meta_description: string;
  slug: string;
  category_slug: string;
  author_slug: string;
  content_md: string;
  cover_image?: string; // key 또는 URL
  cover_image_alt?: string; // SEO
  quick_answer: string;
  quick_answer_bullets?: string[];
  faqs?: Array<{ q: string; a: string }>;
  entities?: string[];
  status?: 'draft' | 'published';
  tags?: string[];
  featured?: boolean;
  images?: ImagePayload[]; // 업로드할 이미지들

  // Schema 강화
  schema_type?: 'Article' | 'HowTo' | 'Review' | 'FAQPage';
  howto_steps?: Array<{ name: string; text: string; image?: string }>;
  howto_total_time?: string; // ISO 8601 duration
  citations?: Array<{ claim: string; source: string; url?: string }>;

  // L4 팩트체크 메타데이터 (vivid-blog factCheckPipeline 결과)
  fact_check_status?: 'auto-approved' | 'needs-review' | 'blocked' | 'pending';
  fact_check_confidence?: 'high' | 'medium' | 'low';
  fact_check_summary?: string;
  fact_check_report?: string; // JSON string
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// SHA-256 해시 (deduplication + 캐시 친화 URL)
async function sha256(bytes: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function extFromContentType(ct: string): string {
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('avif')) return 'avif';
  if (ct.includes('png')) return 'png';
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('gif')) return 'gif';
  return 'bin';
}

function base64ToBytes(b64: string): Uint8Array {
  // data URL prefix 제거
  const clean = b64.replace(/^data:[^;]+;base64,/, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function uploadImage(
  env: Env,
  img: ImagePayload
): Promise<{ url: string; key: string }> {
  if (img.url && !img.base64) {
    // 이미 외부 URL이면 그대로 반환 (fetch 후 R2 저장도 가능하지만 기본은 passthrough)
    return { url: img.url, key: img.url };
  }
  if (!img.base64) throw new Error(`image "${img.key}" has no base64/url`);

  const bytes = base64ToBytes(img.base64);
  if (bytes.byteLength > 10 * 1024 * 1024) {
    throw new Error(`image "${img.key}" exceeds 10MB`);
  }

  const contentType = img.contentType ?? 'image/webp';
  const ext = extFromContentType(contentType);
  const hash = await sha256(bytes);
  const r2Key = `${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}.${ext}`;

  // 이미 있으면 재업로드 스킵
  const existing = await env.MEDIA.head(r2Key);
  if (!existing) {
    await env.MEDIA.put(r2Key, bytes, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        alt: img.alt ?? '',
        filename: img.filename ?? '',
      },
    });
  }

  return {
    url: `/images/${r2Key}`, // 자사 도메인 경유
    key: img.key,
  };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // 인증
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '');
  if (!env.PUBLISH_TOKEN || token !== env.PUBLISH_TOKEN) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let data: PublishPayload;
  try {
    data = (await request.json()) as PublishPayload;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // 필수 필드
  const required = ['title', 'meta_description', 'slug', 'category_slug', 'author_slug', 'content_md', 'quick_answer'];
  const missing = required.filter((k) => !data[k as keyof PublishPayload]);
  if (missing.length > 0) {
    return json({ error: `Missing fields: ${missing.join(', ')}` }, 400);
  }

  // 구조 검증 (AEO/GEO)
  const faqs = data.faqs ?? [];
  const entities = data.entities ?? [];
  if (faqs.length < 3) return json({ error: 'FAQ 최소 3개 (AEO/GEO 요건)' }, 400);
  if (entities.length < 5) return json({ error: '엔티티 최소 5개 (15+ 권장)' }, 400);
  if (data.content_md.length < 500) return json({ error: '본문 최소 500자' }, 400);

  // 카테고리 + 저자 조회
  const category = await env.DB.prepare('SELECT id FROM categories WHERE slug = ?')
    .bind(data.category_slug)
    .first<{ id: number }>();
  const author = await env.DB.prepare('SELECT id FROM authors WHERE slug = ?')
    .bind(data.author_slug)
    .first<{ id: number }>();

  if (!category) return json({ error: `Unknown category: ${data.category_slug}` }, 400);
  if (!author) return json({ error: `Unknown author: ${data.author_slug}` }, 400);

  // ─────── 이미지 업로드 + 본문 치환 ───────
  let contentMd = data.content_md;
  let coverImage = data.cover_image;
  const uploadedImages: Array<{ key: string; url: string }> = [];

  if (data.images && data.images.length > 0) {
    for (const img of data.images) {
      try {
        const { url } = await uploadImage(env, img);
        uploadedImages.push({ key: img.key, url });
        // content_md 내 플레이스홀더 치환
        contentMd = contentMd.split(img.key).join(url);
        if (coverImage === img.key) coverImage = url;
      } catch (e) {
        return json({ error: `Image upload failed: ${img.key}`, details: String(e) }, 500);
      }
    }
  }

  const status = data.status ?? 'draft';
  const publishedAt = status === 'published' ? new Date().toISOString() : null;
  const wordCount = contentMd.split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  try {
    await env.DB.prepare(
      `
      INSERT INTO posts (
        slug, category_id, author_id, title, meta_title, meta_description,
        cover_image, cover_image_alt, content_md, quick_answer, quick_answer_bullets,
        faqs, entities, status, published_at, date_modified,
        word_count, reading_minutes, featured, tags,
        schema_type, howto_steps, howto_total_time, citations,
        fact_check_status, fact_check_confidence, fact_check_summary, fact_check_report
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        category_id=excluded.category_id,
        author_id=excluded.author_id,
        title=excluded.title,
        meta_title=excluded.meta_title,
        meta_description=excluded.meta_description,
        cover_image=excluded.cover_image,
        cover_image_alt=excluded.cover_image_alt,
        content_md=excluded.content_md,
        quick_answer=excluded.quick_answer,
        quick_answer_bullets=excluded.quick_answer_bullets,
        faqs=excluded.faqs,
        entities=excluded.entities,
        status=excluded.status,
        published_at=COALESCE(excluded.published_at, posts.published_at),
        date_modified=datetime('now'),
        word_count=excluded.word_count,
        reading_minutes=excluded.reading_minutes,
        featured=excluded.featured,
        tags=excluded.tags,
        schema_type=excluded.schema_type,
        howto_steps=excluded.howto_steps,
        howto_total_time=excluded.howto_total_time,
        citations=excluded.citations,
        fact_check_status=excluded.fact_check_status,
        fact_check_confidence=excluded.fact_check_confidence,
        fact_check_summary=excluded.fact_check_summary,
        fact_check_report=excluded.fact_check_report
    `
    )
      .bind(
        data.slug,
        category.id,
        author.id,
        data.title,
        data.meta_title ?? null,
        data.meta_description,
        coverImage ?? null,
        data.cover_image_alt ?? null,
        contentMd,
        data.quick_answer,
        JSON.stringify(data.quick_answer_bullets ?? []),
        JSON.stringify(faqs),
        JSON.stringify(entities),
        status,
        publishedAt,
        wordCount,
        readingMinutes,
        data.featured ? 1 : 0,
        JSON.stringify(data.tags ?? []),
        data.schema_type ?? 'Article',
        data.howto_steps ? JSON.stringify(data.howto_steps) : null,
        data.howto_total_time ?? null,
        JSON.stringify(data.citations ?? []),
        data.fact_check_status ?? 'pending',
        data.fact_check_confidence ?? 'low',
        data.fact_check_summary ?? null,
        data.fact_check_report ?? null
      )
      .run();
  } catch (e) {
    return json({ error: 'DB error', details: String(e) }, 500);
  }

  const postUrl = `https://deokgye.com/${data.category_slug}/${data.slug}/`;

  // IndexNow 통보 (published만)
  if (status === 'published') {
    const INDEXNOW_KEY = '0e0828f8e02e1a84268bf2cc0bfca3f5';
    const body = JSON.stringify({
      host: 'deokgye.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://deokgye.com/${INDEXNOW_KEY}.txt`,
      urlList: [postUrl],
    });
    await Promise.allSettled([
      fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      fetch('https://www.bing.com/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      fetch('https://yandex.com/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    ]);
  }

  return json({
    ok: true,
    url: postUrl,
    slug: data.slug,
    status,
    images: uploadedImages,
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
