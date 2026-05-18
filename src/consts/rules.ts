// 덕계 운영 규칙 - SEO/AEO/GEO/LLMO/AIO + 네이버 + AdSense + 자동 검증
// 이 파일이 single source of truth. admin rules 페이지에서 표시되고,
// validator/writer가 향후 import해서 사용할 수 있음.
//
// 수정 → git push → 자동 배포 (pre-push 훅)

export interface RuleExample {
  bad?: string;
  good?: string;
  note?: string;
}

export interface Rule {
  title: string;
  description?: string; // 요약 한 줄
  details?: string[]; // 세부 포인트 (배경·근거·대응법)
  examples?: RuleExample[]; // 예시 비교
  critical?: boolean; // true면 위반 시 발행 차단
  source?: string; // 근거 (문서/연구)
}

export interface RuleCategory {
  id: string;
  label: string;
  icon: string;
  summary: string;
  background?: string; // 카테고리 배경/맥락
  rules: Rule[];
}

export const RULE_CATEGORIES: RuleCategory[] = [
  {
    id: 'seo',
    label: 'SEO (전통 검색)',
    icon: '🔍',
    summary: 'Core Web Vitals + 기술 요구사항 + 메타태그',
    background:
      'Google/Bing이 2021년부터 Core Web Vitals를 랭킹 신호로 공식 채택. 모바일 우선 색인이 기본값. 2024년 INP가 FID를 대체하면서 상호작용 반응성이 더 중요해짐.',
    rules: [
      {
        title: 'LCP ≤ 2.5초',
        description: 'Largest Contentful Paint - 메인 콘텐츠 로딩 속도',
        critical: true,
        details: [
          '페이지에서 가장 큰 요소(보통 히어로 이미지·제목)가 화면에 나타나기까지의 시간',
          '모바일 3G 환경에서도 2.5초 이내여야 "Good" 등급',
          'Astro SSG + Cloudflare 엣지 캐시로 자연스럽게 달성',
          '실측 도구: PageSpeed Insights, web-vitals JS library, Search Console Core Web Vitals 리포트',
        ],
      },
      {
        title: 'FCP ≤ 0.4초 (AI 인용 최적)',
        description: 'First Contentful Paint - 2026 AI Overview 핵심',
        critical: true,
        source: '2026 데이터: FCP <0.4s = 평균 6.7 인용, >1.13s = 2.1 인용 (3x 차이)',
        details: [
          'Google AI Overviews의 2026년 핵심 랭킹 신호로 부상',
          '0.4초 이내 초기 렌더링 → AI 크롤러 수집 효율 극대화',
          'Cloudflare 엣지 + 인라인 크리티컬 CSS + 폰트 preload',
          '이미지 lazy loading · 3rd-party 스크립트 defer/async',
        ],
      },
      {
        title: 'CLS ≤ 0.1',
        description: 'Cumulative Layout Shift - 레이아웃 흔들림',
        details: [
          '페이지 로드 중 UI가 갑자기 움직이면 사용자 클릭 실수 → UX 저하',
          '이미지·광고·폰트에 반드시 width/height 또는 aspect-ratio 지정',
          'AdSense 광고 슬롯은 고정 높이 placeholder 예약',
          '동적으로 삽입되는 배너/팝업은 기존 콘텐츠 push 금지 (overlay로)',
        ],
      },
      {
        title: 'INP ≤ 200ms',
        description: 'Interaction to Next Paint (2024~ Google 신규 지표)',
        details: [
          '사용자의 클릭/탭/키 입력 후 다음 paint까지의 시간',
          'FID(First Input Delay) 대체 지표 - 모든 상호작용 측정',
          'JS 번들 크기 절감, main thread blocking 최소화',
          'React lazy loading, Astro Islands 패턴 활용',
        ],
      },
      {
        title: 'TBT ≤ 200ms',
        description: 'Total Blocking Time - 메인 스레드 점유',
        details: [
          'FCP와 TTI 사이 50ms 이상 blocking한 작업들의 총합',
          '빌드 시 번들 분리 + tree shaking 필수',
          'third-party 스크립트(GA, AdSense)는 async/defer',
        ],
      },
      {
        title: 'Semantic HTML5',
        description: '의미 있는 태그 구조',
        details: [
          '<article>, <section>, <header>, <nav>, <aside> 적극 사용',
          '스크린리더 접근성 + Google 구조 이해 동시 향상',
          'Schema.org과 결합 시 풍부한 결과(Rich Results) 확률 상승',
        ],
        examples: [
          {
            bad: '<div class="post"><div class="title">...</div></div>',
            good: '<article><header><h1>...</h1></header>...</article>',
          },
        ],
      },
      {
        title: 'heading 위계',
        description: 'H1 → H2 → H3 순차적 사용',
        critical: true,
        details: [
          'H1은 페이지당 1개만 (글 제목)',
          'H2는 주요 섹션, H3는 H2의 세부',
          '건너뛰기 금지: H1 바로 아래 H3는 접근성 경고',
          'screen reader가 outline 생성 시 기준',
        ],
      },
      {
        title: 'canonical 태그',
        description: '정규 URL 지정',
        details: [
          '각 페이지에 <link rel="canonical" href="자신의 URL">',
          '중복 콘텐츠 패널티 방지',
          'Astro 기본 레이아웃이 자동 삽입',
          'UTM 파라미터 있는 URL도 canonical은 기본 URL',
        ],
      },
      {
        title: 'Mobile-first',
        description: '모바일 최우선 설계',
        critical: true,
        details: [
          'Google은 2021년부터 모바일 버전만으로 색인',
          '반응형 디자인 필수 - 뷰포트 메타 태그 포함',
          '터치 타겟 최소 44×44px (손가락 누르기 쉽게)',
          '가로 스크롤 절대 금지',
        ],
      },
      {
        title: 'meta_title 60자 이하',
        description: 'SERP 잘림 방지',
        details: [
          'Google 데스크톱 SERP 표시 한계 약 60자 (픽셀 기준 600px)',
          '60자 초과 시 "..." 로 잘려서 클릭률 저하',
          '브랜드명은 끝에 " | 덕계" 형태로 붙임',
          '한글은 영어보다 픽셀 폭이 커서 더 짧게',
        ],
      },
      {
        title: 'meta_description 50-160자',
        description: 'SERP 설명문 - 클릭률 결정',
        critical: true,
        details: [
          '50자 미만: Google이 자동으로 본문에서 추출 (통제 불가)',
          '160자 초과: 잘림',
          '핵심 키워드 + 행동 유도(CTA) 포함',
          '매 페이지 unique - 템플릿 복붙 금지',
        ],
      },
      {
        title: 'Open Graph 완전 세트',
        description: 'SNS 공유 시 카드 이미지',
        details: [
          'og:title, og:description, og:image, og:url, og:type 필수',
          'og:image 1200×630 (1.91:1) - Facebook/Twitter 표준',
          '네이버는 1:1 정사각형도 지원',
          'Twitter Card (twitter:card) 별도 필요',
        ],
      },
    ],
  },
  {
    id: 'aeo',
    label: 'AEO (답변 엔진)',
    icon: '💬',
    summary: 'Featured Snippet + 음성비서 + FAQ 스키마 (40% 가중)',
    background:
      'Google Featured Snippet은 SERP 맨 위 "0위" 박스. 음성비서(Siri, Alexa, 구글 어시스턴트)가 답변으로 읽음. 단일 쿼리에 직접 답하는 구조일수록 발췌 확률 상승. 2026 실증: FAQ schema + inline citations = ChatGPT 가중치 40% 상승. 네이버 AEO 최적화 시 AI 인용률 37% 상승.',
    rules: [
      {
        title: 'H2 직후 첫 60단어 = 독립 완결 답변',
        critical: true,
        source: '템플릿 enforce (deokgyeValidator)',
        details: [
          'H2는 질문형 ("연차는 언제 발생하나요?")',
          '바로 이어지는 첫 문단 = 그 질문의 완전한 답 (60단어 이내)',
          'Featured Snippet이 여기를 잘라가서 SERP에 그대로 표시',
          '60단어 초과하면 잘림 - 너무 짧아도 안 됨 (10단어 미만은 가치 없음)',
        ],
        examples: [
          {
            bad: '## 연차는 언제 발생하나요?\n\n근로자의 권리에 대해 먼저 이야기해보겠습니다. 근로기준법은...',
            good: '## 연차는 언제 발생하나요?\n\n1년 이상 근무하면 15일, 3년 이상이면 1일 추가로 발생합니다. 근로기준법 제60조에 근거합니다.',
          },
        ],
      },
      {
        title: 'FAQPage JSON-LD',
        description: '질문-답변 구조화 데이터',
        details: [
          '<script type="application/ld+json">에 FAQPage schema',
          'Google은 FAQPage를 SERP에 리치 스니펫으로 확장 표시',
          '질문 3-5개, 각 답변 50-300자',
          'Schema 검증: schema.org/FAQPage, Google Rich Results Test',
        ],
      },
      {
        title: '리스트/표/정의 박스 자주 사용',
        description: '발췌 대상 포맷',
        details: [
          'Google 파싱이 가장 잘 되는 구조',
          '단계(step-by-step) = <ol> 리스트',
          '비교 = <table>',
          '정의 = <dl><dt><dd> 또는 굵은 제목 + 설명',
        ],
      },
      {
        title: '"빠른 답" 섹션 (글 하단)',
        description: '한 줄 핵심 요약',
        details: [
          '긴 글의 TL;DR',
          '30-50자 핵심 한 줄',
          '모바일 사용자가 스크롤 내려서 바로 확인',
          '음성비서 우선 답변 후보',
        ],
      },
      {
        title: '대화형 문장',
        description: '실제 사람이 묻는 말투',
        details: [
          '"~는 무엇인가요?", "~하는 방법은?"',
          'Long-tail 음성 검색 쿼리와 직접 매칭',
          '"how to", "what is"로 시작하는 검색 급증 (2020~2024 2배)',
        ],
      },
      {
        title: 'Zero-click 역설계',
        description: '발췌돼도 브랜드 노출',
        details: [
          '답변 문장에 브랜드명이나 저자명 자연스럽게 포함',
          '"덕계 분석에 따르면...", "김OO 전문가의 조언은..."',
          'Featured Snippet에서도 소스 링크가 표시되므로 가치 있음',
        ],
      },
    ],
  },
  {
    id: 'geo',
    label: 'GEO (생성형 AI)',
    icon: '🤖',
    summary: 'ChatGPT · Perplexity · Gemini · Claude 인용 최적화 - 2026 신지표 반영',
    background:
      '2026년 4월 기준 실증: 제로클릭 검색 69% (2024년 56% → 2025년 69%). Gartner 예측 2026년까지 커머셜 검색 25% 감소. 딥서치: 인용 페이지 38%만 top-10 랭크 / 첫 30% 서론이 인용의 44.2% 결정 / 15+ 엔티티 = 4.8배 인용 / E-E-A-T = 96% 상관. 2026 신규: ChatGPT는 Sentiment + Citation Velocity 도입. Perplexity는 78% 모든 claim에 인용 연결.',
    rules: [
      {
        title: '첫 문단 직답 구조',
        critical: true,
        source: '첫 30%에서 44.2% 인용 발생',
        details: [
          '서론에 결론 요약 포함 - "inverted pyramid" 구조',
          '도입부 장황하게 쓰지 말고 핵심 답변을 1-2문장으로 먼저',
          'LLM은 긴 글에서 앞부분을 가중 평가',
          'RAG 시스템도 앞 청크를 우선 검색',
        ],
      },
      {
        title: '명명 엔티티 15개 이상',
        critical: true,
        source: '15+ 엔티티 = 4.8배 인용 확률',
        details: [
          '고유명사: 기관·법령·인명·제품·장소',
          '엔티티는 LLM이 신뢰할 근거 - Wikipedia 검증 가능한 게 좋음',
          'deokgyeValidator가 엔티티 수 + Wikipedia 매칭률 체크',
          '예: "근로기준법", "고용노동부", "제23조", "통상임금"',
        ],
      },
      {
        title: 'Article + FAQPage + HowTo + Organization + Person JSON-LD',
        description: '완전 Schema 세트',
        details: [
          'Google/Bing은 이 조합에서 Rich Results 확률 최대',
          'LLM은 JSON-LD를 파싱해서 "구조화된 지식" 획득',
          'Astro 컴포넌트로 자동 삽입 권장 (src/components/seo/)',
        ],
      },
      {
        title: 'Freshness 3개월 내 업데이트',
        critical: true,
        source: '2026 실증: 3개월 초과 시 AI 인용 급락 (GenOptima)',
        details: [
          '"AI는 recency bias가 큼" - 3개월 지나면 인용 drop off sharply',
          '기존 12개월 기준은 2024년 수치, 2026은 3개월로 단축',
          'D1 trigger: posts.date_modified 자동 갱신',
          '감사 자동화: 주 1회 스캔 → 90일 경과 글 admin 큐에 추가',
          'Schema.org Article.dateModified + HTML <meta property="article:modified_time">',
        ],
      },
      {
        title: '🔥 이미지 최소 2장 필수 (발행 차단)',
        critical: true,
        source: '2025~2026 최대 변화: text+image+video+schema 조합으로 선정률 156% ↑',
        details: [
          'deokgyeValidator.analyzeMultiModal() 에서 강제 enforce',
          '본문 이미지 < 2장 → 발행 차단 (error)',
          'cover_image_prompt 누락 → 발행 차단',
          '표 + 이미지 조합이 최적 (덕계 sleep-quality 글은 표 3개로 보완)',
          'ImageObject schema + alt 텍스트 상세화 필수',
          'YouTube embed 또는 AI 생성 차트로 다양화 권장',
        ],
      },
      {
        title: 'Listicle 구조 (74.2% AI 인용)',
        critical: true,
        source: '2026 실증: "Top N" listicle이 AI 인용의 74.2% 차지',
        details: [
          '제목: "X가지 방법", "N단계", "Top 5" 형식 강력 선호',
          '본문: 번호 리스트(<ol>) + 각 항목 굵은 제목 + 2-3줄 설명',
          'AI 파싱 최적 - 구조화된 데이터처럼 작동',
          '덕계 deokgyeValidator 확장 대상 (listicle 구조 체크 추가)',
        ],
        examples: [
          {
            bad: '연차휴가에 대해 알아봅시다 (서술식)',
            good: '연차휴가 발생기준 5단계 (1. 1년 근무 → 15일 | 2. 2년 → 16일 | ...)',
          },
        ],
      },
      {
        title: '구체 수치 > 일반 서술',
        critical: true,
        source: '실증: 구체 수치 포함 문장 = 인용 확률 급증',
        details: [
          '일반: "GEO로 가시성 향상" → 인용 X',
          '구체: "45일간 AI 멘션률 4% → 14% (+250%)" → 인용 O',
          '퍼센트 + 기간 + 출처 3세트가 이상적',
          '덕계 글 작성 시 모든 주장에 수치 부여',
        ],
        examples: [
          {
            bad: '많은 직장인이 연차를 사용하지 않습니다.',
            good: '2026년 1분기 통계청 조사: 정규직 43%가 연차 미사용 (평균 잔여 8.2일).',
          },
        ],
      },
      {
        title: 'Citation Velocity (ChatGPT 2026 신규)',
        source: 'ChatGPT 2026 알고리즘 업데이트 - 신규 랭킹 요인',
        details: [
          '짧은 기간 내 여러 플랫폼에서 집중 인용되는 속도 측정',
          '브랜드 멘션 + 리뷰 + 백링크가 시기 집중되면 가중치 상승',
          '대응: 발행 직후 IndexNow + SNS + 커뮤니티 동시 배포',
        ],
      },
      {
        title: 'Sentiment-based Ranking (ChatGPT 2026)',
        source: 'ChatGPT 2026 알고리즘 업데이트',
        details: [
          '리뷰/언급의 감성 점수가 인용 순위에 반영',
          '부정 언급 많은 브랜드는 인용 drop',
          '대응: 리뷰 관리 + positive sentiment 시그널 축적',
        ],
      },
      {
        title: '저자 Person 페이지',
        description: '/about/author/[id] + rel="author"',
        details: [
          'E-E-A-T의 E(Expertise) + A(Authoritativeness) 증명',
          'Person JSON-LD에 knowsAbout, sameAs(Twitter/LinkedIn) 포함',
          '저자명 클릭 시 프로필 페이지',
          'Google Knowledge Graph 등록 가능성 상승',
        ],
      },
      {
        title: 'E-E-A-T 시그널',
        source: '96% 인용에 E-E-A-T 상관',
        details: [
          'Experience: "실제 3개월 써봤는데..." 경험 서술',
          'Expertise: 관련 자격증·학위 언급',
          'Authoritativeness: 공인 출처 인용 (정부·학술지)',
          'Trust: HTTPS + 개인정보 처리방침 + 연락처',
        ],
      },
      {
        title: 'Semantic completeness 8.5+/10',
        description: '의미적 완결성',
        details: [
          'LLM이 "이 글 하나로 해당 주제가 충분히 설명됐는가?" 평가',
          'Gemini CLI로 자동 체크 (factChecker)',
          '부족한 관점 추가, 반대 의견도 포함',
        ],
      },
    ],
  },
  {
    id: 'llmo',
    label: 'LLMO (LLM 기술 최적화)',
    icon: '🧠',
    summary: 'LLM 크롤러가 잘 읽을 수 있는 구조',
    background:
      'ChatGPT·Claude·Perplexity 등의 웹 크롤러는 JavaScript 실행이 제한적. SSR + 명확한 HTML 구조가 절대 유리. llms.txt는 2024년 Anthropic이 제안한 신표준.',
    rules: [
      {
        title: 'Server-side rendering',
        description: 'Astro SSG로 정적 HTML 생성',
        critical: true,
        details: [
          'LLM 크롤러는 JS 실행 비용이 크고 제한적',
          'SPA(React 단독)는 빈 <div id="root"> 상태로 크롤링됨',
          'Astro SSG는 빌드 시 완전한 HTML 생성 → 모든 크롤러 호환',
        ],
      },
      {
        title: 'Knowledge Graph 엔티티 매핑',
        description: 'Schema.org sameAs 활용',
        details: [
          'Person/Organization schema에 sameAs 배열로 외부 엔티티 연결',
          'Wikipedia URL, LinkedIn, Twitter, 공식 홈페이지',
          '구글이 동일 엔티티로 인식 → 권위 점수 상속',
        ],
      },
      {
        title: 'Schema.org 완전 구현',
        details: [
          'Article, FAQPage, HowTo, Review, Organization, Person, BreadcrumbList',
          '각 페이지에 해당하는 schema 조합',
          '검증: Google Rich Results Test, Schema.org Validator',
        ],
      },
      {
        title: '/llms.txt 파일',
        description: 'Anthropic 제안 2024 신표준',
        details: [
          '루트 URL에 llms.txt - 사이트 요약 + 주요 링크',
          '형식: Markdown, 단순한 계층 구조',
          'LLM이 사이트 전체 맥락 빠르게 파악',
          'robots.txt의 LLM 버전',
        ],
      },
      {
        title: '/llms-full.txt',
        description: '전체 콘텐츠 마크다운',
        details: [
          '사이트 모든 글의 전문(full text)을 마크다운으로 통합',
          'LLM이 한 번 fetch로 전체 지식 습득',
          'Cloudflare Function으로 빌드 시 자동 생성',
        ],
      },
    ],
  },
  {
    id: 'aio',
    label: 'AIO (Google AI Overviews)',
    icon: '✨',
    summary: 'Google SERP 상단 AI 요약 박스',
    background:
      'Google이 2024년 정식 런칭한 SERP 최상단 AI 생성 답변 박스. 기존 Featured Snippet보다 3-5배 많은 영역 차지. 인용 소스가 표시되므로 트래픽 유입 여전히 가능.',
    rules: [
      {
        title: '실시간 데이터 + 통계 + 인용',
        description: 'cite-worthy 콘텐츠',
        critical: true,
        details: [
          '최신 통계 수치 포함 (월·분기별 업데이트)',
          '공신력 있는 출처(정부·학술·대기업 공시) 인용',
          '숫자는 정확한 출처와 발표일 명시',
          '예: "2026년 1분기 고용동향(통계청)에 따르면..."',
        ],
      },
      {
        title: '위키피디아식 구조',
        description: '정의 → 세부 → 예시 → FAQ',
        details: [
          '첫 문단 = 백과사전식 정의',
          '이어서 역사·배경·현황',
          '구체 사례 3개 이상',
          '마지막에 FAQ로 엣지 케이스 커버',
        ],
      },
      {
        title: '이미지 alt 상세 기술',
        critical: true,
        details: [
          '단순 "사진" 금지 - 맥락·상황·키워드 포함',
          'Google Image Search + AI Overview 이미지 발췌 대상',
          '접근성(스크린리더) 향상',
          '예: "2026년 4월 서울 광화문 일대 퇴근길 시위 군중"',
        ],
      },
      {
        title: '카테고리별 토픽 클러스터',
        description: '주제 권위 구축',
        details: [
          '한 주제에 대해 연관 글 5-10개 묶음 구조',
          'pillar page(포괄 글) + cluster pages(세부 글) + 상호 내부 링크',
          '구글이 "이 사이트는 X 주제 권위"로 인식',
          '덕계: cars/dating/life 카테고리 내 클러스터 구축',
        ],
      },
    ],
  },
  {
    id: 'naver',
    label: '네이버 SEO (한국 56% 점유)',
    icon: '🇰🇷',
    summary: 'C-Rank + D.I.A. + P-Rank + SmartBlock + VIEW + AI 브리핑 2배 확대 예정',
    background:
      '한국 검색 시장 네이버 56%, 구글 30%, 다음 4%. 네이버 알고리즘은 자체 생태계 우대 (blog.naver.com) - 외부 사이트 불리. 극복 전략 = 크로스 포스팅 + 네이버 기준 최적화. 2026 실증: 네이버 AEO 최적화 시 AI 인용률 37% ↑. 네이버 공식 발표(2026-02): AI 브리핑 적용 범위 2026년 말까지 2배 확대 + 상반기 "AI 탭" 출시 예정 + 쇼핑/로컬 영역으로 확장.',
    rules: [
      {
        title: 'Naver Search Advisor 등록',
        critical: true,
        source: 'https://searchadvisor.naver.com',
        details: [
          '네이버 웹마스터 도구 - 소유권 확인 + sitemap 제출',
          'Google Search Console의 네이버 버전',
          '등록 후 수집 요청 가능 (indexing 가속)',
        ],
      },
      {
        title: 'Naver 소유권 확인 메타',
        details: [
          '<meta name="naver-site-verification" content="...">',
          '등록 후 Search Advisor에서 "사이트 등록" 완료',
          'sitemap.xml 제출 필수',
        ],
      },
      {
        title: 'C-Rank 대응',
        description: '블로그 전반 신뢰도 + 주제 집중도',
        details: [
          'Content-Rank: 블로그 전체를 하나의 "작가"로 평가',
          '한 주제에 집중할수록 점수 상승',
          '덕계 3 카테고리(cars/dating/life)도 작으면 더 세분화',
          '외부 사이트는 자체 블로그 대비 C-Rank 불리 → 크로스 포스팅 필요',
        ],
      },
      {
        title: 'D.I.A. 대응 (Deep Intent Analysis)',
        description: '개별 문서 정보성 + 쿼리 관련성',
        critical: true,
        details: [
          '2019년 도입 - 글 하나의 품질을 정밀 분석',
          '정보성 밀도 = 숫자·통계·시간·출처의 밀도',
          '실제 체험기 + 상세 의견이 높은 가중',
          'deokgyeValidator가 정보성 밀도 30점+ 강제',
        ],
      },
      {
        title: 'SmartBlock 노출 전략',
        critical: true,
        source: '세분화된 수만 개 주제 블록',
        details: [
          'SmartBlock은 네이버 SERP 중단에 주제별 블로그 추천 박스',
          '구체적/세분화된 제목이 유리',
          '글 제목에 숫자 포함 (SmartBlock 알고리즘 선호)',
        ],
        examples: [
          {
            bad: '여행 정보',
            good: '제주도 3박4일 커플 여행 예산 30만원 코스',
          },
          {
            bad: '다이어트 방법',
            good: '30대 여성 1달 -5kg 감량 식단 7일 루틴',
          },
        ],
      },
      {
        title: 'VIEW 탭 최적화',
        description: '블로그·카페·리뷰 통합',
        details: [
          'VIEW는 소비자 경험 중심 검색 결과',
          '실제 후기·체험·사진이 강점',
          '덕계 글도 VIEW에 수집되려면 체험 서술 필수',
        ],
      },
      {
        title: '구체적/세분화된 제목',
        critical: true,
        details: [
          '일반적 키워드("다이어트") 대신 복합 키워드("30대 여성 1달 다이어트")',
          '수치 포함 ("5가지", "3단계", "1주일")',
          'long-tail 매칭으로 경쟁 낮고 전환 높음',
        ],
      },
      {
        title: '한국어 콘텐츠 품질',
        description: '네이버는 한국어 관련성 가중',
        details: [
          '문법 + 맞춤법 정확',
          '자연스러운 한국어 문장 (번역투 금지)',
          '한국 문화 컨텍스트 반영',
          'Gemini/Claude로 번역한 글은 티가 남 - 반드시 한국어로 생성',
        ],
      },
      {
        title: '모바일 최적화',
        critical: true,
        source: '네이버 트래픽 압도적 모바일 (70%+)',
        details: [
          '반응형 디자인',
          '문단 5문장 이하 (긴 문단 가독성 저하)',
          '이미지 모바일 width 자동 조정',
          '폰트 16px 이상',
        ],
      },
      {
        title: '2026 AI 탭 대응 (예고)',
        description: '네이버 AI 브리핑',
        details: [
          '직답 구조 + 엔티티 명명 (AEO/GEO와 동일)',
          '2026년 하반기 정식 런칭 예정',
          '미리 최적화 시작 권장',
        ],
      },
    ],
  },
  {
    id: 'claude-bing',
    label: 'Claude / Bing Copilot 특화',
    icon: '🎯',
    summary: 'Constitutional AI 감점 회피 + Bing 전용 IndexNow',
    background:
      'Claude는 Constitutional AI 원칙으로 판매 지향·과장된 콘텐츠를 감점. Bing은 IndexNow 프로토콜을 공식 지원 - 즉시 인덱싱 가능.',
    rules: [
      {
        title: '겸손하고 nuanced한 톤',
        description: 'Claude/Anthropic 선호',
        details: [
          'Claude Constitutional AI는 과장·선동·판매 지향을 감점',
          '"완벽한", "최고의" 같은 절대적 표현 자제',
          '반대 의견·한계점도 함께 서술 (nuanced)',
          '명확한 근거 없이 단정 금지',
        ],
      },
      {
        title: '사실 정확성 최우선',
        critical: true,
        source: '오류 1개로 전체 신뢰도 하락',
        details: [
          'Claude는 할루시네이션 감지 민감',
          '날짜·수치·법령 조항 정확성 검증 필수',
          '덕계 4-레이어 팩트체크가 이를 체계화',
        ],
      },
      {
        title: 'Bing Webmaster Tools 등록',
        source: 'https://www.bing.com/webmasters',
        details: [
          'Bing + Yahoo + DuckDuckGo(Bing 기반) 통합 등록',
          '소유권 확인: XML 파일 또는 메타 태그',
          'GSC import 기능으로 Google Search Console 설정 복사 가능',
        ],
      },
      {
        title: 'IndexNow 프로토콜',
        description: 'Bing/Yandex 즉시 인덱싱',
        details: [
          '글 발행 시 POST /indexnow로 Bing에 즉시 통보',
          '크롤러 방문을 기다리지 않고 초 단위 반영',
          'Cloudflare Pages Function에 구현 (publish.ts)',
          'Google은 미지원 - Google은 sitemap ping만',
        ],
      },
    ],
  },
  {
    id: 'adsense',
    label: 'AdSense 최적화',
    icon: '💰',
    summary: '승인 조건 + 게재 후 CLS 방어 + 수익 극대화',
    background:
      '덕계 주 수익원. 2020년 이후 승인 심사 강화 - E-E-A-T + 양질 콘텐츠 + 필수 페이지가 없으면 거절. 승인 후에도 광고 배치 실수로 CLS 악화 → 랭킹 하락 악순환.',
    rules: [
      {
        title: '루트 도메인 랜딩 페이지',
        critical: true,
        source: 'About, Contact, Privacy, Disclosure 4종 필수',
        details: [
          'About (소개): 저자/운영자 정보 + 운영 철학',
          'Contact (연락처): 실제 응답 가능한 이메일',
          'Privacy Policy (개인정보처리방침): 쿠키·애널리틱스 포함',
          'Disclosure (공지): 광고·제휴 링크 공개',
          '덕계 이미 구축 완료 (/about, /contact, /privacy, /disclosure)',
        ],
      },
      {
        title: '글 최소 10개 발행 후 신청',
        critical: true,
        details: [
          'AdSense 심사자가 "충분한 콘텐츠" 확인',
          '각 글 1,000자+ 양질',
          '카테고리별 최소 3글 이상 권장',
          '덕계 현재 10글 발행 - 신청 가능 상태',
        ],
      },
      {
        title: '광고 placeholder 예약',
        description: 'CLS 유발 방지',
        critical: true,
        details: [
          '광고 슬롯에 고정 높이 div 미리 렌더링',
          '광고 로드 후 높이 유지 → 기존 콘텐츠 밀림 없음',
          'min-height: 250px 같은 CSS로 공간 확보',
        ],
      },
      {
        title: 'Lazy loading 광고',
        description: '뷰포트 진입 시 로드',
        details: [
          'Intersection Observer로 광고 영역이 화면에 보일 때만 로드',
          '초기 페이지 로드 속도 개선 → LCP 보호',
          'AdSense Auto Ads 기본 지원',
        ],
      },
    ],
  },
  {
    id: 'format',
    label: '콘텐츠 템플릿 포맷 (강제)',
    icon: '📐',
    summary: '글 1편의 구조 - 제목/서론/H2·H3/FAQ/빠른답/이미지',
    background:
      '매 글마다 구조가 달라지면 LLM·검색엔진이 학습 못함. 덕계는 강제 템플릿 적용 - deokgyeWriter가 구조 생성, deokgyeValidator가 강제.',
    rules: [
      {
        title: '제목 60자 이내 + Listicle 숫자',
        critical: true,
        source: '2026: Listicle이 AI 인용의 74.2% 차지',
        details: [
          '60자: 구글 SERP 잘림 방지',
          '숫자 필수: "N가지", "5단계", "Top 3" - AI 인용 폭발',
          'SmartBlock + Featured Snippet + Google AIO 모두 선호',
          '예: "연차휴가 발생기준 2026 총정리 - 근속연수별 일수·계산법 5단계"',
        ],
      },
      {
        title: '서론 = 첫 30% 직답',
        critical: true,
        source: 'GEO 연구 (44.2% 인용 위치)',
        details: [
          '첫 1-2문단 = 글의 핵심 답을 먼저 제시',
          '도입부 사설·인사 금지',
          'LLM + AEO + GEO 모두 이 구조 선호',
        ],
      },
      {
        title: 'H2 질문형 구조',
        details: [
          'H2는 사용자가 검색할 법한 질문으로',
          'long-tail 쿼리 매칭',
          '예: "연차는 언제 발생하나요?"',
        ],
      },
      {
        title: 'H3 세부 항목',
        details: [
          'H2 아래 구체 단계·옵션·케이스',
          '각 H3 아래 3-7문장',
          'H4 이하는 가독성 저하 - 지양',
        ],
      },
      {
        title: 'FAQ 섹션 3-5개',
        critical: true,
        details: [
          '본문에서 다루지 않은 엣지 케이스',
          '각 답변 50-300자',
          'FAQPage JSON-LD와 1:1 대응',
        ],
      },
      {
        title: '빠른 답 (하단 한 줄 요약)',
        details: [
          '긴 글의 TL;DR',
          '30-50자',
          '음성비서 우선 답변 후보',
        ],
      },
      {
        title: '이미지 alt 상세',
        critical: true,
        examples: [
          {
            bad: 'alt="이미지"',
            good: 'alt="2026년 4월 근로기준법 개정안 조문 비교표 - 제23조 부당해고 조항"',
          },
        ],
      },
      {
        title: '문단 5문장 이하',
        description: '모바일 가독성',
        details: [
          '5문장 초과하면 모바일에서 블록처럼 보임',
          '긴 문단은 2-3개로 분할',
          'deokgyeValidator가 5문장+ 문단 수 체크',
        ],
      },
    ],
  },
  {
    id: 'validation',
    label: '자동 검증 규칙 (코드 enforce)',
    icon: '✅',
    summary: 'deokgyeValidator.ts에 코드 레벨로 강제 - 위반 시 재시도 또는 차단',
    background:
      '프롬프트로 품질을 지시하면 Gemini/Claude가 편차를 보임. 코드로 강제하면 결정적. 14개 규칙을 validator가 검사 → 위반 시 최대 2회 재시도 → 그래도 실패하면 발행 차단.',
    rules: [
      { title: 'title ≤ 60자', critical: true, description: 'SERP 잘림 방지' },
      { title: 'meta_description 50-160자', critical: true, description: '설명문 품질 + 자동 생성 회피' },
      { title: 'slug = /^[a-z0-9-]+$/', critical: true, description: 'URL 호환 형식' },
      { title: 'category_slug ∈ {cars, dating, life}', critical: true, description: '덕계 카테고리 정합성' },
      { title: 'quick_answer ≥ 20자', critical: true, description: 'AEO 직답 최소 길이' },
      { title: 'content_md ≥ 1,000자', critical: true, description: '콘텐츠 기본 볼륨' },
      { title: 'FAQ ≥ 3개', critical: true, description: 'FAQPage JSON-LD 요건' },
      { title: 'entities ≥ 10개', critical: true, description: 'GEO 15+ 권장, 최소 10개' },
      { title: 'H2 직후 답변 10-60단어', critical: true, description: 'Featured Snippet 범위' },
      { title: 'Wikipedia 엔티티 매칭 ≥ 30%', critical: true, description: '허구 엔티티 방지' },
      { title: 'Hedge 밀도 ≤ 3/1000자', critical: true, description: '"~일 수도 있다" 류 자제 → 단정적 톤' },
      { title: '정보성 밀도 ≥ 30점', critical: true, description: '숫자·통계·시간·출처 밀도 (네이버 D.I.A.)' },
      { title: '문단 5문장 초과 < 2개 (권장)', description: '모바일 가독성' },
      { title: '제목 숫자 포함 (권장)', description: 'SmartBlock + Featured Snippet' },
    ],
  },
  {
    id: 'factcheck',
    label: '팩트체크 4-레이어',
    icon: '🔐',
    summary: 'L1 코드규칙 → L2 엔티티실증 → L3 크로스모델 → L4 수동 리뷰',
    background:
      '2026-04-17 구축. 단일 Gemini 호출은 편향 리스크 → 다중 방어. E2E 테스트에서 박지정희 "2대 대통령" 오류 합의 검출 확인.',
    rules: [
      {
        title: 'L1: 정규식 즉시 검출',
        source: 'factCheckRules.ts',
        details: [
          '상대 날짜 ("이번 주", "다음 달") → 구체적 날짜로 교체',
          '전화번호 형식 (02-XXX-XXXX, 010-XXXX-XXXX)',
          'URL 프로토콜 누락 감지 + 자동 수정',
          '과거 연도 + 미래형 조사 모순',
          '퍼센트 범위 이탈 (-100 ~ 1000%)',
          '날짜 유효성 (2026-02-30 같은 오류)',
        ],
      },
      {
        title: 'L2: 엔티티 실증 API',
        source: 'entityVerifier.ts',
        details: [
          '법령 → 국가법령정보센터 (law.go.kr)',
          '인명·기관 → Wikipedia → 네이버 백과 → 네이버 뉴스 (폴백 체인)',
          '타입 자동 분류 (law/organization/person/place)',
          '검증률 60% 미만 시 needs-review',
        ],
      },
      {
        title: 'L3: Gemini × Claude 합의',
        source: 'crossModelFactChecker.ts',
        details: [
          '두 CLI 병렬 호출 (각 ~40초)',
          '같은 문장 지적 = consensus (high-confidence 자동 수정)',
          '한쪽만 지적 = warning (admin 수동 리뷰)',
          'LCS 8자 이상 = 같은 문제로 간주',
        ],
      },
      {
        title: 'L4: Admin 수동 리뷰',
        source: '/admin/review/?slug=X',
        details: [
          'needs-review 상태의 글을 관리자가 개별 확인',
          'L1/L2/L3 세부 violation 표시',
          '승인 → "reviewed" 상태 / 거부 → "blocked"',
          'D1 reviewed_at + reviewed_by 기록',
        ],
      },
      {
        title: '상태 판정 로직',
        critical: true,
        details: [
          'auto-approved: L1 0 errors + L2 90%+ + L3 합의 0',
          'blocked: L1 잔여 오류 > 2 또는 L2 < 30%',
          '나머지 = needs-review',
        ],
      },
      {
        title: '신뢰도 (high/medium/low)',
        details: [
          'high: L3 합의율 70%+ OR L1 0 errors + L2 90%+',
          'medium: L1 2개 이하 + L2 60%+',
          'low: 그 외',
        ],
      },
    ],
  },
  {
    id: 'multi-ai',
    label: 'V2 멀티 AI 편집국',
    icon: '🎨',
    summary: 'Claude Opus 편집장 + Gemini Pro 작가 + GPT 5.4 검수자',
    background:
      '단일 모델 의존은 편차 리스크. 3-모델 협업으로 품질·팩트 모두 보장. 모두 구독 내 무료 (API 비용 0원). 2026-03-18 확정 아키텍처.',
    rules: [
      {
        title: 'Claude Opus 4.6 = 편집장',
        description: '구조·검증 + 전체 지휘',
        details: [
          'Claude Code CLI로 호출 (Max 구독 범위)',
          '글의 구조·섹션·스켈레톤 설계',
          '검증/재작성 조율 (`claudeCliClient.ts`)',
          '현재 덕계에서 유일하게 활성',
        ],
      },
      {
        title: 'Gemini 3.1 Pro = 작가',
        description: '본문 생성 (pw 웹 자동화)',
        details: [
          'gemini.google.com 웹 인터페이스 자동 조작',
          'Chrome SUBST 가상 드라이브 + Profile 5 + CDP 9222',
          '유료 Gemini API 사용 절대 금지 (구독 내 무료만)',
          'V2 전환은 단계적 진행',
        ],
      },
      {
        title: 'GPT 5.4 = 검수자',
        description: '팩트체크 (pw 웹 자동화)',
        details: [
          'chatgpt.com 웹 인터페이스 자동 조작',
          '작성된 글의 사실 검증 + 반대 관점 제시',
          '팩트체크 4-레이어의 L3에 통합 가능',
          '현재는 Gemini CLI + Claude CLI 2-모델로 대체',
        ],
      },
      {
        title: 'pw 웹 자동화 패턴',
        source: '네이버 키워드 도구와 동일 방식',
        details: [
          'Chrome SUBST: `subst Z: "%LOCALAPPDATA%\\Google\\Chrome"`',
          '--user-data-dir="Z:\\User Data" --remote-debugging-port=9222',
          'Playwright CDP로 연결 → 로그인 세션 재사용',
          'App Bound Encryption 우회 (DevTools 차단 해제)',
        ],
      },
      {
        title: '보일러플레이트 방지',
        description: '구조/도입부 랜덤화',
        critical: true,
        details: [
          '고정: 페르소나 (저자 톤)',
          '랜덤: 구조 10종 중 선택 (Q&A / 이야기 / 리스트 / 비교 / 단계 / ...)',
          '랜덤: 도입부 8종 중 선택 (일화 / 질문 / 통계 / 경험 / ...)',
          '크로스 모델 검수로 복붙 감지',
        ],
      },
      {
        title: '경험 채굴 (Experience Mining)',
        description: '실제 경험담·커뮤니티 반응 추출',
        details: [
          '커뮤니티 버즈 9개 사이트에서 views/likes/comments 파싱',
          '실시간 데이터 + 운영자 메모 결합',
          '작가 프롬프트에 "이런 고충이 많더라" 식 반영',
          'E-E-A-T의 Experience 시그널 강화',
        ],
      },
    ],
  },
  {
    id: 'image-strategy',
    label: '이미지 전략 (키워드별 분기)',
    icon: '📸',
    summary: 'AI생성 일색 지양 - 키워드 유형별 이미지 소스 달리',
    background:
      '"고용24 신청 방법" 같은 실사용 키워드에 AI 생성 추상 이미지는 의미 없음. 독자가 보고 따라할 수 있는 실제 스크린샷이 필요. 이미지 유형을 키워드 의도에 맞게 분기.',
    rules: [
      {
        title: '실제 화면 필요 → 실 스크린샷',
        critical: true,
        source: 'feedback_blog_images.md',
        details: [
          '"신청 방법", "바로가기", "사이트 사용법" 등 실행형 키워드',
          'pw로 해당 사이트 접속 → 스크린샷 캡처',
          'KV 업로드 + 본문 삽입',
          '민감 정보 마스킹 필수 (이메일/전화번호 블러)',
        ],
      },
      {
        title: '개념 설명 → AI 생성',
        description: 'Gemini Flash Image 체인',
        details: [
          '"비교", "개요", "프로세스" 같은 추상 개념',
          'US Worker 체인: Gemini Flash Image → Imagen 4 → FLUX',
          '프롬프트는 영어로 구체적 묘사',
        ],
      },
      {
        title: '데이터/비교 → SVG 차트',
        details: [
          '가격 비교, 추이 그래프, 수치 비교',
          'SVG/Canvas 서버사이드 렌더링',
          'AI 생성보다 정확·가독성 높음',
        ],
      },
      {
        title: '장소/이벤트 → 지도',
        details: [
          '네이버 Static Map API + 마커',
          '매장 위치, 이벤트 장소',
          '정확한 좌표 기반 → 사용자 실제 도움',
        ],
      },
      {
        title: 'Blogger: PNG 원본',
        details: [
          'Google CDN이 자동 WebP 변환',
          '원본 해상도 유지 권장',
          'alt 태그 상세 작성',
        ],
      },
      {
        title: '네이버: PNG 원본',
        details: [
          '네이버는 PNG 그대로 서빙 (변환 없음)',
          '용량 크게 신경 안 써도 됨',
          '고화질 유지 → 홈판 노출 유리',
        ],
      },
      {
        title: '날짜별·포스팅별 폴더',
        description: 'R2 버킷 정리',
        details: [
          '경로: media/{YYYY-MM-DD}/{slug}/{filename}.png',
          '중복 방지 + 나중에 삭제·재업로드 쉬움',
          'R2 해시 기반 dedup 지원',
        ],
      },
    ],
  },
  {
    id: 'tone-experience',
    label: '톤 & 경험담',
    icon: '🗣️',
    summary: '자연스러운 필자 톤 - 출처·인용 티 나면 신뢰 하락',
    background:
      '블로그 글은 필자가 직접 조사·경험한 느낌이 필요. "커뮤니티 후기" 같은 출처 명시는 복붙 감각 줌 → 신뢰도 하락 → 체류시간 감소.',
    rules: [
      {
        title: '커뮤니티 출처 직접 노출 금지',
        critical: true,
        source: 'feedback_experience_tone.md',
        examples: [
          {
            bad: '<span class="v-card-source">- 커뮤니티 후기 (2026.02)</span>',
            good: '서류 내고 3일 동안 연락 없어서 좀 불안했는데, 알고 보니 담당자가 바뀐 거였어요.',
            note: '직접 경험한 것처럼 자연스럽게',
          },
          {
            bad: '한 커뮤니티 사용자는 "...다" 라고 말했다.',
            good: '커뮤니티를 쭉 훑어보니 이런 고충을 겪는 분들이 꽤 많더라고요.',
            note: '조사한 것처럼 간접화',
          },
        ],
      },
      {
        title: '필자 1인칭 경험 서술',
        details: [
          '"제가 직접 써보니", "3개월 써본 후기"',
          'E-E-A-T의 E(Experience) 시그널',
          '허위 경험 금지 - 팩트체크에 잡힘',
        ],
      },
      {
        title: '겸손·nuanced 톤',
        source: 'Claude Constitutional AI + Google 품질 평가',
        details: [
          '"완벽한", "최고의" 같은 단정 피하기',
          '한계·반대의견 함께 언급',
          '과장 광고 느낌 → 감점',
        ],
      },
      {
        title: '숫자·시기 명시',
        details: [
          '"최근" → "2026년 3월"',
          '"많은 사람" → "월 평균 50만 명"',
          '구체 숫자가 신뢰 시그널',
        ],
      },
    ],
  },
  {
    id: 'keyword-strategy',
    label: '키워드 선정 전략',
    icon: '🎯',
    summary: '에버그린 + 행동 의도 + 플랫폼별 분리',
    background:
      '키워드 선정이 수익의 핵심. 폭발형(트렌드) vs 에버그린(꾸준함) 구분, 행동 의도(신청·바로가기·구매) 가중, 플랫폼별 CPC 해석 차이 반영.',
    rules: [
      {
        title: '에버그린 스코어 60+',
        description: 'stability × volume_factor × health',
        source: 'project_evergreen_system.md',
        details: [
          'stability = max(0, 100 - CV%) - 변동계수 낮을수록 안정',
          'volume_factor = min(1, log10(월검색량) / 5)',
          'health = peakRatio / 100 - 하락세 페널티',
          '60+ = 에버그린 / 50-59 = 준에버그린',
          'DataLab 시계열 2년(730일) 기준',
        ],
      },
      {
        title: '행동 의도 가중',
        critical: true,
        details: [
          '신청 (+25%): "연차 신청", "실업급여 신청"',
          '바로가기 (+20%): "고용24 바로가기"',
          '구매 (+15%): "가성비 노트북 추천"',
          '방법 (+10%): "퇴직금 계산 방법"',
          '단순 정보 < 행동 유도 키워드',
        ],
      },
      {
        title: '플랫폼별 CPC 해석',
        description: 'Blogger vs 네이버 분리',
        details: [
          'Blogger(애드센스): CPC 높을수록 수익 ↑ → 고CPC 선호',
          '네이버(애드포스트): 고CPC = 광고판 인식 → 노출 제재',
          '네이버용은 검색량(모수) + 정보성 의도 중심',
        ],
      },
      {
        title: '네이버 상업 키워드 금지',
        critical: true,
        source: 'MEMORY.md 플랫폼 전략',
        details: [
          '네이버 블로그 경유 시 상업 키워드 진입 금지',
          '홈판(홈피드) 노출이 수익 핵심 - 검색 노출보다 큼',
          '정보성 키워드 위주',
          'Blogger에서만 고CPC 키워드 공략',
        ],
      },
      {
        title: '일반 롱테일 페널티',
        details: [
          '너무 일반적인 롱테일("오늘 날씨") 페널티 적용',
          '경쟁 낮아도 전환 낮음',
          '구체성·의도 있는 롱테일 우선',
        ],
      },
      {
        title: '미충족 키워드 필터',
        details: [
          '검색량 없음 + 경쟁도 정보 없음 → 제외',
          '더미 키워드 발행 방지',
          '파이프라인 Quality Gate',
        ],
      },
    ],
  },
  {
    id: 'platform-strategy',
    label: '플랫폼 발행 전략',
    icon: '🗺️',
    summary: 'Blogger 주력 · 덕계 자사 · 네이버 보조',
    background:
      '덕계 = 자사 도메인 (우산 도메인). Blogger = 애드센스 수익 주력. 네이버 블로그 = 홈판 노출 보조. 티스토리는 사용 안 함.',
    rules: [
      {
        title: '덕계 자사 도메인 (deokgye.com)',
        description: 'Astro + Cloudflare Pages',
        critical: true,
        details: [
          '우산 도메인: cars/dating/life 3개 카테고리',
          '모든 SEO 시그널이 한 도메인에 누적',
          '최고 우선순위 - 먼저 여기 발행',
        ],
      },
      {
        title: 'Blogger (블로그스팟) 주력',
        source: 'publisherService.ts에 Blogger API 구현',
        details: [
          '애드센스 고CPC 수익 최대화',
          '5개 동시 운영 (도메인 1 + 기본주소 4)',
          '하위 도메인 무제한 확장 (승인 1번이면 끝)',
          '하루 10개 발행 루틴 + AI 생성 OK',
        ],
      },
      {
        title: '네이버 블로그 보조',
        description: '정보성 키워드 + 홈판 노출',
        details: [
          'Phase 2 보조 채널',
          '홈판 노출이 수익 핵심 (검색 > 홈판)',
          'metaWeblogApi (XML-RPC) 사용',
          '상업 키워드 진입 절대 금지',
        ],
      },
      {
        title: '티스토리 미사용',
        critical: true,
        details: [
          '덕계/Blogger 주력 확정',
          'publisherService에 티스토리 코드 있어도 비활성',
          '중복 콘텐츠 회피',
        ],
      },
      {
        title: 'Edge 프로필 순차 발행',
        critical: true,
        source: 'feedback_edge_profile_publishing.md',
        details: [
          'Blogger 다중 계정 발행은 반드시 순차',
          'User Data 공유 때문에 병렬 불가',
          '동시 실행 시 로그인 세션 충돌',
          'Promise.all 금지 - 순차 await',
        ],
      },
    ],
  },
  {
    id: 'ops',
    label: '운영 원칙',
    icon: '⚙️',
    summary: '배포/시크릿/외부 소스 방어/비용 관리',
    background:
      '실수 반복 방지용 하드 룰. Gemini 종량제로 청구서 폭탄 경험, 외부 소스 오류로 파이프라인 마비 경험 → 모두 규칙화.',
    rules: [
      {
        title: 'Gemini/Claude 유료 API 사용 금지',
        critical: true,
        source: 'feedback_no_paid_gemini.md',
        details: [
          'Gemini Worker API 종량제 절대 금지',
          'Anthropic API 종량제도 금지',
          'CLI 구독 내 무료만 사용 (gemini/claude)',
          'CLI 실패 시 유료 API 폴백 금지 → throw',
        ],
      },
      {
        title: 'git push = 자동 배포',
        description: 'pre-push 훅',
        details: [
          'main 브랜치 push 시 로컬 build + wrangler deploy 자동',
          'GitHub Actions + Cloudflare API Token 불필요',
          '로컬 wrangler OAuth 재사용',
          '실패 시 push 차단 (exit 1)',
        ],
      },
      {
        title: '외부 소스 방어',
        critical: true,
        source: 'MEMORY.md 외부 소스 방어 원칙',
        details: [
          '모든 fetch에 AbortController 타임아웃 (10초 기본)',
          'JSON 파싱 try/catch 필수 (HTML 에러 페이지 방어)',
          '응답 구조 검증 후 필드 접근 (data.items 존재 체크)',
          '429 Rate Limit 구분 처리 + 로깅',
          '중단된 API 사용 금지 (네이버 실시간 2021 중단 등)',
        ],
      },
      {
        title: '시크릿 관리 로컬 GUI',
        description: 'localhost:7777 폼',
        details: [
          '바탕화면 "Secrets Manager" 바로가기',
          'GitHub Secret + Windows env + .env 자동 동기화',
          '매니페스트 기반 (src/scripts/secrets-manage.mjs)',
          'admin 페이지 통합 X (보안)',
        ],
      },
      {
        title: 'ADMIN_PIN 701700',
        description: 'deokgye.com/admin/',
        source: 'reference_deokgye_admin.md',
        details: [
          'Cloudflare Pages Secret에 저장',
          '변경: `echo -n "새PIN" | wrangler pages secret put ADMIN_PIN`',
          'Secret 변경 후 재배포 필요 (기존 배포는 이전 값)',
          '값이 어디에도 로그로 남지 않음',
        ],
      },
      {
        title: 'vault 없이 "불가능" 선언 금지',
        source: 'CLAUDE.md',
        details: [
          '1) 기존 코드 검색 (Grep/Glob)',
          '2) vault 검색 (search_vault)',
          '3) 실제 시도 (실행해서 확인)',
          '3개 모두 안 했으면 "불가능" 말할 자격 없음',
        ],
      },
      {
        title: 'Obsidian 저장 필수',
        source: 'CLAUDE.md',
        details: [
          '파일 수정/기능 완성 → save_work_log 즉시',
          '설계 결정 (분류/스키마/아키텍처) → save_project_memory 즉시',
          '세션 마무리 → save_session_summary',
          '크로스 프로젝트 패턴 → save_cross_insight',
        ],
      },
    ],
  },
  {
    id: 'automation',
    label: '자동화 트리거 (n8n식 체계)',
    icon: '⚡',
    summary: '이벤트 기반 파이프라인 - 규칙을 문서가 아닌 시스템으로 enforce',
    background:
      '규칙이 프롬프트/문서에만 있으면 무용. 시스템이 자동 트리거 → 검증 → 재시도 → 배포까지 체계적으로 돌아야 함 (n8n 워크플로우 자동화 철학). 현재 덕계 + vivid-blog 파이프라인은 7개 트리거 체인으로 구성. 향후 추가할 3개 트리거로 완결.',
    rules: [
      {
        title: '[T1] git push → 자동 배포',
        description: 'Client hook: .git/hooks/pre-push',
        source: 'scripts/auto-deploy.mjs',
        details: [
          '이벤트: main 브랜치 push',
          '체인: build → wrangler pages deploy → git push',
          '실패 시: exit 1 → push 차단',
          '토큰 불필요 (로컬 wrangler OAuth)',
        ],
      },
      {
        title: '[T2] CF Cron */10분 → 트렌드 수집',
        description: 'vivid-blog Worker Scheduled Handler',
        details: [
          '14개 소스 병렬 수집 → D1 keyword_cache',
          'Google Trends · News RSS · Naver 뉴스/블로그/카페/데이터랩 · 커뮤니티 버즈 9종 등',
          '실패 사이트는 개별 skip (전체 실패 방지)',
          'Worker Rate Limit 고려한 배치 딜레이',
        ],
      },
      {
        title: '[T3] CF Cron 21시 → EPG 수집',
        description: '네이버 EPG → D1 tv_programs',
        details: [
          '15채널 1155개 프로그램 자동 갱신',
          'TV 방송 시간 기반 키워드 발굴',
          'Cron: 0 21 * * * KST',
        ],
      },
      {
        title: '[T4] autoPublisher → Gemini Pro → 발행',
        description: 'vivid-blog 자동 스케줄러',
        source: 'worker/src/api/autoPublisher.ts',
        details: [
          '이벤트: 스케줄 or 수동 트리거',
          '체인: D1 키워드 선택 → 팩트체크 → Gemini Pro 글 생성 → 플랫폼 발행 → Telegram 알림',
          'dry-run 모드 지원 (발행 없이 생성만)',
        ],
      },
      {
        title: '[T5] POST /api/publish → D1 + IndexNow',
        description: 'deokgye-web Pages Function',
        source: 'functions/api/publish.ts',
        details: [
          '이벤트: vivid-blog 또는 외부에서 HTTP POST',
          '체인: 팩트체크 payload 수신 → 이미지 R2 업로드 → D1 저장 → IndexNow 통보',
          'PUBLISH_TOKEN 인증',
          '중복 slug 시 ON CONFLICT DO UPDATE (재발행)',
        ],
      },
      {
        title: '[T6] GitHub Actions 주 1회 → 발행 후 감사',
        description: '24/7 자동 운영',
        source: 'project_audit_automation.md',
        details: [
          'Cron 주 1회 (Gemini CLI OAuth Secret 복원)',
          'Phase 5 발행 후 감사 - 인덱싱 + 성과 + 문제 감지',
          '덕계에도 동일 패턴 적용 가능',
        ],
      },
      {
        title: '[T7] generateDeokgyePost → 팩트체크 파이프라인',
        description: '글 생성 시 4-레이어 자동 호출',
        source: 'src/services/deokgyeWriter.ts + factCheckPipeline.ts',
        details: [
          '이벤트: generateDeokgyePost({ factCheck: true })',
          '체인: Claude CLI 생성 → validator → L1 규칙 → L2 엔티티 → L3 크로스모델',
          '위반 시 자동 재시도 (최대 2회) → 성공 시 return / 실패 시 throw',
          '상태: auto-approved / needs-review / blocked',
        ],
      },
      {
        title: '[T8 신규] Freshness 감시 (3개월 경과)',
        description: '향후 추가 예정',
        critical: true,
        details: [
          '이벤트: CF Cron (매일 03:00 KST)',
          '체인: D1 WHERE date_modified < NOW() - 90 days',
          '→ admin 대시보드에 "갱신 대기" 뱃지',
          '→ 선택적으로 자동 재생성 큐 추가',
          '→ Telegram 알림 (갱신 후보 N개)',
          '구현 위치: functions/scheduled/freshness-audit.ts',
        ],
      },
      {
        title: '[T9 신규] 발행 성공 → Telegram 알림',
        description: '향후 추가 예정',
        details: [
          '이벤트: /api/publish 성공 응답 직후',
          '체인: publish → IndexNow → Telegram Bot → admin 채널',
          '내용: 제목 · 카테고리 · 팩트체크 상태 · URL · 썸네일',
          '실패 시: 에러 메시지 + 자동 재시도 스케줄',
        ],
      },
      {
        title: '[T10 신규] AI 인용 모니터링',
        description: '향후 추가 예정 - 장기',
        details: [
          '이벤트: CF Cron (주 1회)',
          '체인: Perplexity/ChatGPT API로 자기 브랜드 멘션 체크',
          '→ 인용 수 D1 저장 → 대시보드 차트',
          '→ 인용 받은 글의 공통 패턴 분석 (피드백 루프)',
          '구현 시 Perplexity API 필요 (유료)',
        ],
      },
      {
        title: '트리거 설계 원칙',
        critical: true,
        details: [
          '각 트리거는 독립 실행 가능 (의존성 최소)',
          '실패해도 다른 트리거에 영향 없음 (isolation)',
          '로그 + 결과 반드시 D1 또는 KV에 저장 (observability)',
          '재실행 가능 (idempotent)',
          '수동 실행 엔드포인트 제공 (긴급 트리거용)',
        ],
      },
    ],
  },
  {
    id: 'webmaster',
    label: '웹마스터 도구 (한국 완전 커버)',
    icon: '🌐',
    summary: '4종 필수 + IndexNow + Sitemap 확장',
    background:
      '한국 검색 시장 점유율: 네이버 56% + 구글 30% + 다음 4% + Bing 1% = 91%. 4종 모두 등록 = 시장 완전 커버. Zum은 0.5% 미만이라 선택.',
    rules: [
      {
        title: 'Google Search Console',
        critical: true,
        source: 'https://search.google.com/search-console',
        details: [
          '소유권: HTML 메타 태그 또는 DNS TXT 레코드',
          'sitemap.xml 제출',
          '인덱싱 상태 + Core Web Vitals 리포트',
          '검색어 분석 (쿼리별 클릭률·순위)',
        ],
      },
      {
        title: 'Naver Search Advisor',
        critical: true,
        source: 'https://searchadvisor.naver.com',
        details: [
          '네이버 노출의 관문',
          '웹마스터 도구 + 모바일 친화성 검사',
          '수집 요청(사이트맵 제출 후 즉시 크롤링 트리거)',
          '2주 내 등록 권장',
        ],
      },
      {
        title: 'Bing Webmaster Tools',
        critical: true,
        source: 'https://www.bing.com/webmasters',
        details: [
          'Bing + Yahoo + DuckDuckGo 통합',
          'GSC import 기능 - Google Search Console 설정 복사',
          'IndexNow 자동 통합',
        ],
      },
      {
        title: 'Daum 검색등록',
        critical: true,
        source: 'https://register.search.daum.net',
        details: [
          '다음은 자체 웹마스터 도구 없음 - 단순 사이트 등록만',
          '등록 후 크롤링 시작',
          'Daum은 카카오 검색과 동일 인덱스 공유',
        ],
      },
      {
        title: '소유권 확인 메타 태그 4종',
        description: '한 페이지에 동시 삽입',
        details: [
          'google-site-verification',
          'naver-site-verification',
          'msvalidate.01 (Bing)',
          'daum-site-verification',
          'BaseLayout에 모두 포함 (src/layouts/BaseLayout.astro)',
        ],
      },
      {
        title: 'IndexNow 프로토콜',
        details: [
          '덕계 publish.ts가 글 발행 시 자동 호출',
          'Bing + Yandex + Seznam에 즉시 URL 통보',
          '키 파일: /0e0828f8e02e1a84268bf2cc0bfca3f5.txt',
          '초 단위 인덱싱 반영',
        ],
      },
      {
        title: 'Sitemap 확장',
        details: [
          'sitemap-index.xml: 모든 sitemap의 인덱스',
          'sitemap-posts.xml: 글 목록',
          'sitemap-authors.xml: 저자 페이지',
          'sitemap-categories.xml: 카테고리 페이지',
        ],
      },
      {
        title: 'RSS 피드 (/rss.xml)',
        details: [
          'Feedly 등 RSS 리더 + 네이버 피드',
          '최신 글 20개',
          '전문 포함 (description 긴 버전)',
        ],
      },
    ],
  },
];

/**
 * 전체 규칙 개수 (대시보드 요약용)
 */
export function countRules(): number {
  return RULE_CATEGORIES.reduce((sum, c) => sum + c.rules.length, 0);
}

/**
 * critical 규칙만 필터
 */
export function criticalRules(): Array<{ category: RuleCategory; rule: Rule }> {
  const out: Array<{ category: RuleCategory; rule: Rule }> = [];
  for (const category of RULE_CATEGORIES) {
    for (const rule of category.rules) {
      if (rule.critical) out.push({ category, rule });
    }
  }
  return out;
}
