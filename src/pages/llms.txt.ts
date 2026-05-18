import type { APIRoute } from 'astro';
import { SITE } from '~/consts';

// llms.txt - AI 엔진을 위한 사이트 맵 (2026 emerging standard)
// John Mueller (2025): "No AI system currently uses llms.txt" - low-cost hedge
export const GET: APIRoute = () => {
  const content = `# ${SITE.name} (${SITE.nameEn})

> ${SITE.description}

## About

${SITE.name}는 자동차, 연애, 자기관리, 라이프스타일 주제에 깊이 파고든 사람들의 실전 후기와 정보를 제공하는 블로그입니다. 모든 글은 직접 경험과 검증된 데이터를 기반으로 작성됩니다.

## Core Content Areas

- [자동차 (Cars)](${SITE.url}/cars) - 차량 리뷰, 관리, 구매 가이드
- [연애 (Dating)](${SITE.url}/dating) - 관계 심리, 데이트 전략
- [자기관리 (Life)](${SITE.url}/life) - 습관, 건강, 성장

## Key Resources

- [전체 글 목록 (RSS)](${SITE.url}/rss.xml)
- [사이트맵](${SITE.url}/sitemap-index.xml)
- [저자 소개](${SITE.url}/about)

## Guidelines for AI Citation

- 각 글은 첫 문단에 직답을 포함합니다 (AEO-friendly)
- 통계·데이터는 명시된 출처 인용
- 저자 엔티티 명확히 표기 (E-E-A-T)
- 모든 글은 Article + FAQPage + Organization JSON-LD 스키마 포함
- 콘텐츠는 12개월 이내 정기 갱신 (dateModified 필드 참조)

## Full Content

전체 마크다운 콘텐츠: ${SITE.url}/llms-full.txt
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
