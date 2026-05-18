// 콘텐츠 구조 강제 검증 (AEO/GEO 요건)
// /api/publish 호출 시 이 검증을 통과해야 저장됨

export interface PublishPayload {
  title: string;
  meta_title?: string;
  meta_description: string;
  slug: string;
  category_slug: string;
  author_slug: string;
  content_md: string;
  cover_image?: string;
  quick_answer: string;
  quick_answer_bullets?: string[];
  faqs?: Array<{ q: string; a: string }>;
  entities?: string[];
  status?: 'draft' | 'published';
  tags?: string[];
  featured?: boolean;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const H2_REGEX = /^##\s+(.+)$/gm;
const KOREAN_WORD_COUNT_REGEX = /\S+/g; // 한국어는 단어보다 문자 수 중심

function countWords(text: string): number {
  return (text.match(KOREAN_WORD_COUNT_REGEX) ?? []).length;
}

/**
 * H2 직후 60단어 구조 검증 (GEO 핵심)
 * 44.2%의 AI 인용이 첫 30% 텍스트에서 발생 → 각 H2 섹션도 직답 구조여야
 */
function validateH2Structure(md: string): string[] {
  const errors: string[] = [];
  const parts = md.split(/^##\s+(.+)$/gm);

  // parts: [before_first_h2, heading1, content1, heading2, content2, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i]?.trim();
    const content = parts[i + 1]?.split(/^##?\s/m)[0] ?? '';

    // 첫 문단 추출
    const firstPara = content.trim().split(/\n\n/)[0] ?? '';
    const wordCount = countWords(firstPara);

    if (wordCount < 10) {
      errors.push(
        `H2 "${heading}" 직후 답변이 너무 짧음 (${wordCount}단어, 최소 10 권장)`
      );
    }
    // 너무 긴 것도 발췌 어려움
    if (wordCount > 100) {
      errors.push(
        `H2 "${heading}" 직후 답변이 너무 김 (${wordCount}단어, 60단어 이내 권장)`
      );
    }
  }

  return errors;
}

/**
 * 전체 콘텐츠 AEO/GEO 요건 검증
 */
export function validatePublishPayload(data: PublishPayload): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 제목
  if (!data.title?.trim()) errors.push('title 필수');
  if (data.title && data.title.length > 60)
    warnings.push(`title ${data.title.length}자 - 60자 이내 권장 (SEO)`);

  // 메타 디스크립션
  if (!data.meta_description?.trim()) errors.push('meta_description 필수');
  if (data.meta_description && data.meta_description.length < 50)
    warnings.push(`meta_description ${data.meta_description.length}자 - 50자 이상 권장`);
  if (data.meta_description && data.meta_description.length > 160)
    warnings.push(`meta_description ${data.meta_description.length}자 - 160자 이내 권장`);

  // 슬러그
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug))
    errors.push('slug은 소문자·숫자·하이픈만 허용 (예: hybrid-car-review)');

  // 카테고리 / 저자
  if (!data.category_slug) errors.push('category_slug 필수 (cars/dating/life)');
  if (!data.author_slug) errors.push('author_slug 필수');

  // 본문
  if (!data.content_md?.trim()) errors.push('content_md 필수');
  if (data.content_md && data.content_md.length < 500)
    errors.push(`본문이 너무 짧음 (${data.content_md.length}자, 최소 500자 권장)`);

  // H2 구조 검사
  if (data.content_md) {
    const h2Errors = validateH2Structure(data.content_md);
    errors.push(...h2Errors);

    const h2Count = [...data.content_md.matchAll(H2_REGEX)].length;
    if (h2Count < 2) warnings.push(`H2 섹션 수 ${h2Count}개 - 2개 이상 권장`);
  }

  // Quick Answer (AEO 핵심)
  if (!data.quick_answer?.trim())
    errors.push('quick_answer 필수 - 첫 문단 직답');
  if (data.quick_answer && data.quick_answer.length < 20)
    errors.push(`quick_answer ${data.quick_answer.length}자 - 최소 20자`);
  if (data.quick_answer && data.quick_answer.length > 300)
    warnings.push(`quick_answer ${data.quick_answer.length}자 - 300자 이내 권장`);

  // FAQ (AEO)
  const faqs = data.faqs ?? [];
  if (faqs.length < 3)
    errors.push(`FAQ ${faqs.length}개 - 최소 3개 (AEO/GEO 요건)`);

  // 엔티티 (GEO - 4.8배 인용 확률)
  const entities = data.entities ?? [];
  if (entities.length < 5)
    errors.push(`엔티티 ${entities.length}개 - 최소 5개 (15+ 이상적)`);
  if (entities.length < 15 && entities.length >= 5)
    warnings.push(`엔티티 ${entities.length}개 - 15개 이상 권장 (4.8배 인용 확률)`);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * slug 정규화 (한글 → 로마자 불가, 소문자/하이픈만)
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
