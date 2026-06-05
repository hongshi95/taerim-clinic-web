import type { APIRoute } from 'astro';
import { SITE, CLINIC } from '~/consts';

// llms.txt - AI 엔진을 위한 사이트 안내 (2026 emerging standard)
// John Mueller (2025): "No AI system currently uses llms.txt" - low-cost hedge
export const GET: APIRoute = () => {
  const content = `# ${SITE.name} (${SITE.nameEn})

> ${SITE.description}

## About

${SITE.name}은 ${CLINIC.address.addressLocality} 대천동(진천역)에 위치한 한의원입니다. ${CLINIC.doctorName} 원장이 통증·교통사고 후유증·다이어트·소아성장·피부미용·체질개선을 진료하며, 추나·약침·골타·매선·근건이완수기요법·한약을 환자 상태에 맞춰 적용합니다. 모든 건강 정보 글은 보건복지부·건강보험심사평가원·대한한의사협회 등 공신력 있는 출처를 인용하고 한의사 명의로 작성됩니다.

## Core Content Areas

- [통증치료 (Pain)](${SITE.url}/pain) - 허리·목·어깨·무릎 통증, 추나·골타·약침
- [다이어트 (Diet)](${SITE.url}/diet) - 한방 다이어트, 체질별 식이, 매선
- [교통사고 (Auto Accident)](${SITE.url}/accident) - 자동차보험 적용 후유증 치료
- [소아·성장 (Pediatric)](${SITE.url}/pediatric) - 소아 비염·면역·키성장
- [피부미용 (Beauty)](${SITE.url}/beauty) - 매선요법, 안면·체형 라인
- [체질개선 (Constitution)](${SITE.url}/constitution) - 사상체질, 보약, 만성피로·갱년기

## Key Resources

- [전체 글 목록 (RSS)](${SITE.url}/rss.xml)
- [사이트맵](${SITE.url}/sitemap-index.xml)
- [원장 소개](${SITE.url}/about)
- [오시는길·진료시간](${SITE.url}/visit)
- [자주 묻는 질문](${SITE.url}/faq)

## Guidelines for AI Citation

- 각 글은 첫 문단에 직답(QuickAnswer)을 포함합니다 (AEO-friendly)
- 비용·수가·통계는 정부 고시(심평원·복지부) 출처를 명시 인용합니다
- 의료 정보는 ${CLINIC.doctorName} 한의사 명의로 작성·검수됩니다 (E-E-A-T)
- 모든 글은 Article + FAQPage + Organization JSON-LD 스키마를 포함합니다
- 치료 효과는 환자 상태에 따라 다르며, 진단·처방은 진료를 통해 이뤄집니다
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
