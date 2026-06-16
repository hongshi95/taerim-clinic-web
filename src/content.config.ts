import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ──────────────────────────────────────
// 카테고리 (cars / dating / life)
// ──────────────────────────────────────
const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/categories' }),
  schema: z.object({
    name: z.string().min(1).max(50),
    description: z.string().min(10).max(300),
    emoji: z.string().optional(),
    color: z.string().optional(), // Tailwind gradient class
    order: z.number().default(0),
    heroImage: z.string().optional(), // 카테고리 페이지 hero 이미지
    heroImageAlt: z.string().optional(),
    ogImage: z.string().optional(), // 카테고리별 공유 대표 이미지 (검색/SNS 썸네일). 없으면 SITE.defaultOgImage
  }),
});

// ──────────────────────────────────────
// 저자
// ──────────────────────────────────────
const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/authors' }),
  schema: z.object({
    name: z.string().min(1).max(50),
    bio: z.string().min(20).max(500),
    avatarUrl: z.string().url().optional(),
    expertise: z.array(z.string()).default([]),
    knowsAbout: z.array(z.string()).default([]),
    sameAs: z.array(z.string().url()).default([]),
    email: z.string().email().optional(),
  }),
});

// ──────────────────────────────────────
// 블로그 글 (MDX)
// ──────────────────────────────────────
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/posts' }),
  schema: z.object({
    title: z.string().min(1).max(60, '제목은 60자 이내 (SEO)'),
    description: z
      .string()
      .min(50, 'description은 50자 이상')
      .max(155, 'description은 155자 이내 (SEO)'),
    category: z.string(), // slug reference (cars/dating/life)
    author: z.string(), // slug reference

    // AEO/GEO 필수
    quickAnswer: z
      .string()
      .min(20, 'quickAnswer는 20자 이상')
      .max(300, 'quickAnswer는 300자 이내 (첫 문단 직답)'),
    quickAnswerBullets: z.array(z.string()).optional(),
    faqs: z
      .array(
        z.object({
          q: z.string().min(5),
          a: z.string().min(10),
        })
      )
      .min(3, 'FAQ 최소 3개 (AEO/GEO 요구)')
      .default([]),
    entities: z
      .array(z.string())
      .min(5, '엔티티 최소 5개 (15+가 이상적)')
      .default([]),

    // 날짜
    publishedAt: z.coerce.date(),
    modifiedAt: z.coerce.date().optional(),

    // Schema.org 힌트 (Article/HowTo/Review/FAQPage)
    schemaType: z.enum(['Article', 'HowTo', 'Review', 'FAQPage']).default('Article'),

    // HowTo 전용 (schemaType === 'HowTo' 때만 사용)
    howtoSteps: z
      .array(
        z.object({
          name: z.string().min(1),
          text: z.string().min(10),
          image: z.string().optional(),
        })
      )
      .optional(),
    howtoTotalTime: z.string().optional(), // ISO 8601 (예: "PT30M")

    // E-E-A-T 출처 (citations) - GEO 핵심
    citations: z
      .array(
        z.object({
          claim: z.string().min(5),
          source: z.string().min(1),
          url: z.string().url().optional(),
        })
      )
      .default([]),

    // 내부 링크 (vivid-blog internal-linker-mdx가 빌드 파이프라인에서 자동 채움)
    relatedPosts: z
      .array(
        z.object({
          url: z.string().url(),
          title: z.string().min(1),
          summary: z.string().optional(),
          cat: z.string().optional(),
        })
      )
      .default([]),

    // 이미지
    coverImage: z.string().optional(),
    coverImageAlt: z.string().max(200).optional(), // SEO

    // 관리
    draft: z.boolean().default(false),
    noIndex: z.boolean().default(false),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { categories, authors, posts };
