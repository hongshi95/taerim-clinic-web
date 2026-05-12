# 덕계 (deokgye.com) — 프로젝트 SPEC

> **이 문서가 단일 진실 공급원(SSOT).** 구현 중 "이거 해야 했는데 빠졌네" 방지용.
> 기능 추가/변경 시 이 문서부터 업데이트, 그 다음 코드.

---

## 1. 프로젝트 개요

### 목적
- **덕계 (deokgye.com)** — AdSense 우산 블로그
- 타보니 블로그 + 향후 서브 주제 블로그들의 통합 허브
- "뭐 하나에 제대로 빠진 사람들이 모이는 세계"

### 비즈니스 맥락
- 가온비즈(gaonbiz.com)와 **다른 명의**로 분리 (안정성)
- younght83210@gmail.com (타보니 오너)
- AdSense 전략: 1도메인 승인 → 전체 카테고리 수익화
- 소유자: Cloudflare Registrar Personal, 2026-04-17 구매 완료

### 브랜드 포지션
- 성별 중립, 연령 광범위
- 엣지 있는 내부자 커뮤니티 ("덕계 큰손" 느낌)
- 기존 자매 브랜드: 가온비즈(사업), 트렌드숲(이슈)

---

## 2. 기술 스택 (확정)

| 레이어 | 기술 | 근거 |
|---|---|---|
| Frontend | **Astro 5** + React Islands | CWV 최강, 블로그 최적 |
| Styling | Tailwind 4 | 빠른 개발, 프로덕션 품질 |
| Language | TypeScript (strict) | 타입 안전 |
| DB | Cloudflare D1 (SQLite) | 무료 넉넉, Workers 통합 |
| Storage | Cloudflare R2 | 무료 egress |
| Hosting | Cloudflare Pages | 무료, 기존 계정 활용 |
| API/Backend | Cloudflare Workers | vivid-blog과 동일 스택 |
| Auth | Session + PIN (관리자) | 단순, 본인만 |
| Image | Sharp + AVIF/WebP | CWV LCP 최적 |

### Astro 선택 근거 (딥서치 검증)
- Next.js 대비 **2-3배 빠름, JS 90% 적음** (CWV 절대 우위)
- **기본 JS = 0KB** → INP/LCP 거의 자동 통과
- 콘텐츠 사이트용 설계 → 블로그 최적
- React 아일랜드 지원 → admin UI는 React
- 2026년 산업 표준 (Starlight, Nextra 등 메이저 문서 사이트 채택)

---

## 3. 검색 최적화 (SEO + AEO + GEO + LLMO + AIO) 통합 요구사항

### 3.1 SEO (전통 검색)

#### Core Web Vitals 목표
- LCP < 2.5s (75%ile)
- CLS < 0.1
- INP < 200ms
- 통과 기준: 75% 방문자 PASS

#### 기술 요구사항
- [ ] 모든 페이지 정적 생성 (또는 ISR)
- [ ] 이미지 AVIF/WebP 자동 변환 + lazy loading
- [ ] Critical CSS 인라인
- [ ] 폰트 preload + fallback
- [ ] Canonical URL 모든 페이지
- [ ] XML Sitemap (`/sitemap.xml`, 자동 생성)
- [ ] RSS Feed (`/rss.xml`)
- [ ] `robots.txt` (AI 크롤러 차단 금지)
- [ ] Breadcrumb 구조
- [ ] 내부링크 자동 매칭 (vivid-blog ollamaLinker 재활용)
- [ ] hreflang (다국어 시)

#### 메타 요구사항
- [ ] `<title>` 60자 이내, 브랜드 포함
- [ ] `<meta description>` 155자 이내
- [ ] Open Graph (og:title, og:description, og:image)
- [ ] Twitter Cards (summary_large_image)
- [ ] `<h1>` 1개, `<h2>` 질문형

### 3.2 AEO (답변 엔진 — Featured Snippet, 음성비서)

- [ ] **H2 직후 첫 60단어 = 독립적 완결 답변** (템플릿 enforce)
- [ ] FAQPage JSON-LD (질문당 간결 답변)
- [ ] 리스트/표/정의 박스 자주 사용 (발췌 대상)
- [ ] "빠른 답" 섹션 (글 하단, 한 줄 요약)
- [ ] 대화형 문장 ("~는 무엇인가요?", "~하는 방법은 ~입니다")
- [ ] Zero-click 역설계: 발췌돼도 브랜드/저자 노출

### 3.3 GEO (생성형 AI — ChatGPT, Perplexity, Gemini)

#### 딥서치 핵심 발견 (2026)
- **인용 페이지의 38%만 top-10 랭크** (전통 SEO만으론 부족)
- **첫 30%의 텍스트에서 44.2% 인용 발생** (서론이 결정)
- **15+ 엔티티 포함 = 4.8배 인용 확률**
- **12개월 이내 업데이트 = 3.2배 더 인용됨**
- **E-E-A-T 시그널 = 96% 인용에 상관**

#### 요구사항
- [ ] 첫 문단 직답 구조 (템플릿 enforce)
- [ ] 본문에 명명 엔티티 15개 이상 (ollamaLinker 자동 체크)
- [ ] Article + FAQPage + HowTo + Organization + Person JSON-LD 완전 세트
- [ ] `dateModified` 자동 업데이트 (D1 trigger)
- [ ] 저자 Person 페이지 (`/about/author/[id]`) + `rel="author"`
- [ ] E-E-A-T 시그널: 경험 서술 / 자격 증명 / 출처 인용
- [ ] Semantic completeness 8.5+/10 목표 (Gemini CLI 체크)

### 3.4 LLMO (LLM 기술적 최적화)

- [ ] Server-side rendering (Astro 기본 SSG 만족)
- [ ] 명확한 Knowledge Graph 엔티티 매핑
- [ ] Schema.org 완전 구현 (위 GEO 항목)
- [ ] `/llms.txt` 파일 (low-cost hedge, 근거 없지만 적용)
- [ ] `/llms-full.txt` (전체 콘텐츠 마크다운)

### 3.5 AIO (Google AI Overviews 특화)

- [ ] 실시간 데이터 + 통계 + 인용 (cite-worthy)
- [ ] 위키피디아식 구조 (정의 → 세부 → 예시 → FAQ)
- [ ] 이미지 alt 상세 기술
- [ ] 카테고리별 토픽 클러스터 (주제 권위)

### 3.6 AdSense 최적화

- [ ] 루트 도메인 랜딩 페이지 (About, Contact, Privacy, Disclosure 필수)
- [ ] 글 최소 10개 발행 후 신청
- [ ] 광고 위치 CLS 유발 방지 (placeholder 예약)
- [ ] lazy loading 광고 (뷰포트 진입 시)

### 3.7 네이버 SEO (한국 시장 56% 점유 — 치명적 중요) 🇰🇷

#### 네이버 알고리즘 스택
- **C-Rank**: 블로그 전반 신뢰도 + 집중도 (주제 전문성)
- **D.I.A. (Deep Intent Analysis)**: 개별 문서의 정보성 + 쿼리 관련성
- **P-Rank**: 웹사이트 품질 (크롤가능성, 모바일, 내부링크, 온페이지)
- **SmartBlock**: 세분화된 수만 개 C-Rank 주제 블록
- **VIEW 탭**: 블로그/카페/리뷰 통합 (소비자 경험 중심)
- **2026 AI 탭** (예고): 네이버 AI 브리핑 답변 — 별도 최적화 필요

#### 요구사항
- [ ] **Naver Search Advisor 등록** (https://searchadvisor.naver.com)
- [ ] Naver 소유권 확인 메타 태그 삽입
- [ ] Naver sitemap 제출
- [ ] **한국어 콘텐츠 품질 최우선** (네이버는 한국어 관련성 가중)
- [ ] **구체적/세분화된 제목** (SmartBlock 노출용)
  - 나쁨: "여행 정보"
  - 좋음: "제주도 3박4일 커플 여행 예산 30만원 코스"
- [ ] **실제 체험기 + 상세 의견** 서술 (D.I.A. 가중)
- [ ] Open Graph 네이버 대응 (`og:image` 비율 1:1 또는 1.91:1)
- [ ] 모바일 최적화 (네이버는 모바일 트래픽 압도적)
- [ ] **네이버 AI 브리핑 대응**: 직답 구조 + 엔티티 명명 (AEO와 동일)

#### 네이버 불리 요소 방어
- 네이버는 **자사 플랫폼(blog.naver.com) 우대** → 외부 사이트 불리
- 대응: **네이버 블로그 크로스 포스팅** (5번 섹션 참조)

### 3.8 Claude 특화

- [ ] **겸손하고 nuanced한 톤** (판매 지향/과장 회피 = Constitutional AI 감점)
- [ ] **사실 정확성 최우선** (오류 1개로 전체 신뢰도 하락)
- [ ] 출처 인용 + 데이터 근거 (통계 포함)
- [ ] **Earned media 획득**: 외부 매체 언급/기고 (Claude 학습 가중치)
- [ ] "확실하다" 대신 "일반적으로", "대부분의 경우" 등 조건부 언어

### 3.9 Bing / Microsoft Copilot 특화

- [ ] **Bing Webmaster Tools 등록** + AI Performance Report 추적
  - 2026-02 런칭: Copilot 인용 추적 대시보드
- [ ] Bing이 파워링: ChatGPT Search + DuckDuckGo + Yahoo + Ecosia → 공통 최적화
- [ ] GSC에서 Bing으로 사이트 import (편의)
- [ ] 2026-04 Bing algorithm: **AI ranking signals + structured data + entity relevance** 강화

---

## 4. 웹마스터 도구 등록 (한국 시장 완전 커버)

### 🇰🇷 한국 검색엔진 점유율 (2026)
- Naver 62% / Google 26% / Bing 3% / Daum ~3% / Zum 0.24% / Nate 0.17%
- **상위 4개 = 94% 커버** (Zum/Nate는 등록만)

### 필수 등록 (상위 4종) ⭐

| # | 도구 | URL | 역할 |
|---|---|---|---|
| 1 | **Google Search Console** | https://search.google.com/search-console | Google + AI Overviews + Gemini |
| 2 | **Naver Search Advisor** | https://searchadvisor.naver.com | 네이버 62% + VIEW + SmartBlock + AI 탭 |
| 3 | **Bing Webmaster Tools** | https://www.bing.com/webmasters | Bing + Copilot + ChatGPT Search + DuckDuckGo + Yahoo |
| 4 | **Daum 웹마스터 도구** | https://webmaster.daum.net | Daum 검색 + Kakao 생태계 |

### 선택 등록 (미미하지만 무료)

| # | 도구 | URL | 점유율 |
|---|---|---|---|
| 5 | Zum 검색등록 | https://help.zum.com/open/search | 0.24% |
| 6 | Nate 사이트 등록 | (운영 불명확, 2025 이후 집계 없음) | 0.17% |
| 7 | Yandex Webmaster | https://webmaster.yandex.com | 러시아/IndexNow 통합 |

### 공통 등록 절차
1. 계정 로그인
2. 사이트 URL 추가 (`https://deokgye.com`)
3. 소유권 확인 (메타 태그 / HTML 파일 / DNS TXT)
4. Sitemap 제출 (`https://deokgye.com/sitemap.xml`)

### 소유권 확인 메타 태그 (모든 엔진 동시 삽입 필요)

BaseLayout.astro에 일괄 삽입:
```html
<meta name="google-site-verification" content="..." />
<meta name="naver-site-verification" content="..." />
<meta name="msvalidate.01" content="..." /> <!-- Bing -->
<!-- Daum은 HTML 파일 업로드 방식 -->
```

### IndexNow 프로토콜
- [ ] **IndexNow API 연동** (Bing + Yandex + Naver 일부 지원)
- 글 publish 시 자동 호출
- 단일 API 키로 여러 엔진 동시 통보

### Sitemap 종류 확장
- [ ] `/sitemap.xml` (기본, 모든 엔진 제출)
- [ ] `/sitemap-images.xml` (이미지 sitemap)
- [ ] `/sitemap-news.xml` (뉴스성 글)
- [ ] `/sitemap-video.xml` (영상 임베드 시)

---

## 5. 외부 분산 / Earned Media 전략 (325% 인용 차이)

**딥서치 결론**: 자사 사이트 단독 발행 vs 다매체 분산 = **3.25배 AI 인용 차이**

### 한국 생태계 전략 (네이버 + 카카오)

| 채널 | 소속 | 포스팅 전략 | 주기 | 효과 |
|---|---|---|---|---|
| **deokgye.com** (원본) | 자사 | 완전판 풀 콘텐츠 | 주 2-3회 | 수익화 허브 |
| **Naver 블로그** | Naver | 요약 + "원문 더보기 →" | 주 1-2회 | ⭐⭐⭐⭐⭐ C-Rank + VIEW 탭 |
| **Naver 카페** | Naver | 핵심 팁 + 링크 | 월 2-3회 | 커뮤니티 유입 |
| **Naver 지식iN** | Naver | 질문 답변 + 원문 링크 | 기회 | 긴꼬리 키워드 커버 |
| **Naver 포스트** | Naver | 시각적 카드뉴스 포맷 | 주 1회 | 모바일 피드 |
| **Tistory** | Kakao | 풀 콘텐츠 복제 (Google 인덱싱 잘 됨) | 주 2-3회 | ⭐⭐⭐⭐ Daum 커버 + Google 보조 |
| **Brunch** | Kakao | 장문 에세이 포맷 | 월 2-4개 | ⭐⭐⭐ 퀄리티 브랜드 |
| **Kakao 채널** | Kakao | 업데이트 알림 + 링크 | 주 1회 | 구독자 리텐션 |
| **Daum 카페** | Kakao | 관련 커뮤니티 참여 | 기회 | Daum 노출 |
| **YouTube Shorts** | Google | 3줄 요약 영상 | 월 4-8개 | ⭐⭐⭐⭐⭐ AI 인용 최다 (18.2%) |
| **Reddit** (r/korea 등) | - | 경험 공유 + 답변 | 기회 | AI Overviews 21% 인용 |
| **Threads / X** | - | 핵심 인사이트 + 링크 | 일 1-2개 | AI 브랜드 시그널 |

### 우선순위 (자원 대비 ROI)

1. 🥇 **Naver 블로그 + Tistory** — 한국 검색 2대 축 (Naver 62% + Daum 3% + Google 보조) 커버
2. 🥈 **YouTube Shorts** — AI 인용 최다, vivid-blog 자동화 확장 가능
3. 🥉 **Brunch + Naver 포스트** — 브랜드 권위 빌드 (E-E-A-T)
4. **Naver 지식iN + 카페** — 롱테일 키워드 + 커뮤니티
5. Reddit, Threads — 국제/실험 단계

### Kakao 생태계 활용 전략

Kakao Corp는 **Tistory + Brunch + KakaoStory**를 "StoryHome" 포털로 통합 운영 중. 이 3개 중 1개에 발행하면 Kakao 생태계 전체에 노출됨.

- **Tistory** 가 우리 케이스에 최적 (자동화 API 지원 + Google 인덱싱 강함 + AdSense 호환)
- Brunch는 승인제 (작가 신청 → 통과 필요)

### 주의
- 완전 동일 본문 복붙 금지 (Duplicate Content 페널티 회피)
- 매체별 포맷 변환: Naver(요약+이미지), Tistory(풀 복제 OK, canonical 설정), Brunch(에세이화), Shorts(3줄 영상), Reddit(토론형)
- 모든 크로스 포스팅 → 원문 `deokgye.com` 링크 (백링크 획득)
- **Tistory 복제 시 `rel="canonical"` 으로 deokgye.com 지정** (Duplicate 회피)

---

## 6. 콘텐츠 템플릿 구조 (강제)

글 작성 시 아래 구조 준수해야 published=true 됨:

```markdown
# [제목] (60자 이내)

[첫 문단: 질문에 대한 직답 100자 이내]

## [질문형 H2]

[H2 직후 60단어 내에 독립적 완결 답변]

### [세부 H3]

[본문 — 명명 엔티티 15+ 포함]

## FAQ (자주 묻는 질문)

**Q. [질문]**
A. [간결 답변]

[3개 이상]

## 빠른 답 (핵심 요약)

- [핵심 포인트 3-5개 불릿]
```

### 자동 검증 규칙
- [ ] H2 직후 60단어 체크 (ESLint 커스텀 룰 or build-time)
- [ ] 엔티티 15개 미만 시 경고
- [ ] FAQ 섹션 누락 시 경고
- [ ] `dateModified` 자동 갱신

---

## 7. 디렉토리 구조

```
deokgye-web/
├── SPEC.md (이 문서)
├── README.md
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── wrangler.toml (Cloudflare)
├── .env.example
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── og/ (기본 OG 이미지)
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro (HTML shell + 기본 SEO)
│   │   ├── PostLayout.astro (글 상세)
│   │   └── CategoryLayout.astro
│   ├── components/
│   │   ├── seo/
│   │   │   ├── ArticleSchema.astro
│   │   │   ├── FAQSchema.astro
│   │   │   ├── HowToSchema.astro
│   │   │   ├── OrganizationSchema.astro
│   │   │   ├── PersonSchema.astro
│   │   │   ├── BreadcrumbSchema.astro
│   │   │   ├── WebSiteSchema.astro (SearchAction 포함)
│   │   │   ├── ReviewSchema.astro
│   │   │   ├── ProductSchema.astro
│   │   │   ├── VideoObjectSchema.astro
│   │   │   ├── ProfilePageSchema.astro
│   │   │   └── OpenGraph.astro
│   │   ├── content/
│   │   │   ├── QuickAnswer.astro (빠른 답 박스)
│   │   │   ├── FAQSection.astro
│   │   │   ├── DefinitionBox.astro
│   │   │   └── AuthorBio.astro
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── Breadcrumb.astro
│   │   └── admin/ (React islands)
│   │       ├── AdminLayout.tsx
│   │       ├── PostEditor.tsx
│   │       └── MediaUploader.tsx
│   ├── pages/
│   │   ├── index.astro (홈)
│   │   ├── [category]/index.astro
│   │   ├── [category]/[slug].astro
│   │   ├── about.astro
│   │   ├── about/author/[id].astro
│   │   ├── contact.astro
│   │   ├── privacy.astro
│   │   ├── disclosure.astro
│   │   ├── admin/ (보호됨)
│   │   │   ├── index.astro
│   │   │   ├── posts.astro
│   │   │   └── post/[id].astro
│   │   ├── api/
│   │   │   ├── posts.ts (CRUD)
│   │   │   ├── auth.ts
│   │   │   └── publish.ts (vivid-blog 연동)
│   │   ├── sitemap.xml.ts
│   │   ├── sitemap-images.xml.ts
│   │   ├── sitemap-news.xml.ts
│   │   ├── sitemap-video.xml.ts
│   │   ├── rss.xml.ts
│   │   ├── llms.txt.ts
│   │   ├── llms-full.txt.ts
│   │   └── naver-verify.html.ts (네이버 소유권 확인)
│   ├── lib/
│   │   ├── db.ts (D1)
│   │   ├── seo.ts (메타 생성)
│   │   ├── entities.ts (명명 엔티티 추출)
│   │   ├── validation.ts (템플릿 구조 체크)
│   │   ├── r2.ts (이미지 업로드)
│   │   ├── indexnow.ts (IndexNow API 트리거)
│   │   └── crosspost.ts (네이버 블로그 크로스 포스팅 API)
│   └── styles/
│       └── global.css
└── migrations/
    └── 0001_initial.sql (D1 스키마)
```

---

## 8. 데이터베이스 스키마 (D1)

```sql
-- 카테고리 (자동차, 연애, 관리 등)
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 저자
CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  social_links TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 글
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  author_id INTEGER REFERENCES authors(id),
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  cover_image TEXT,
  content_md TEXT NOT NULL, -- 마크다운 원본
  content_html TEXT NOT NULL, -- 렌더링된 HTML
  excerpt TEXT,
  entities TEXT, -- JSON array
  faq TEXT, -- JSON array {q, a}
  quick_answer TEXT,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  published_at DATETIME,
  date_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 미디어
CREATE TABLE media (
  id INTEGER PRIMARY KEY,
  r2_key TEXT UNIQUE NOT NULL,
  mime_type TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 내부 링크 (토픽 클러스터)
CREATE TABLE internal_links (
  id INTEGER PRIMARY KEY,
  from_post_id INTEGER REFERENCES posts(id),
  to_post_id INTEGER REFERENCES posts(id),
  anchor_text TEXT
);

-- 인덱스
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(status, published_at);
```

---

## 9. vivid-blog 연동

- 기존 파이프라인 (Gemini Pro 글 생성 + 이미지) 재활용
- Blogger API 대신 **deokgye-web의 `/api/publish` 호출**
- 요청 본문:
  ```json
  {
    "title": "...",
    "category_slug": "...",
    "author_slug": "...",
    "content_md": "...",
    "cover_image_url": "...",
    "meta_title": "...",
    "meta_description": "...",
    "entities": ["...", "..."],
    "faq": [{ "q": "...", "a": "..." }],
    "quick_answer": "..."
  }
  ```
- Worker가 R2 이미지 업로드 + D1 저장 + HTML 렌더링
- 자동 내부링크 매칭 (ollamaLinker)

---

## 10. 구현 단계

### Phase 1 — 기반 (1~2일)
- [ ] package.json 의존성 설정
- [ ] astro.config.mjs (통합, Cloudflare adapter)
- [ ] Tailwind 4 설정
- [ ] TypeScript strict 설정
- [ ] BaseLayout + 공통 SEO 메타
- [ ] robots.txt (모든 AI 크롤러 허용), sitemap.xml, rss.xml
- [ ] Cloudflare Pages 배포 파이프라인
- [ ] 도메인 연결 (deokgye.com)

### Phase 2 — 콘텐츠 표시 (2~3일)
- [ ] PostLayout (강제 구조 템플릿)
- [ ] SEO 스키마 컴포넌트 모음 (Article, FAQPage, HowTo, Organization, Person, WebSite+SearchAction, Breadcrumb, Video, Review, Product, ProfilePage)
- [ ] QuickAnswer, FAQSection, DefinitionBox
- [ ] Header, Footer, Breadcrumb
- [ ] 홈페이지
- [ ] 카테고리 페이지
- [ ] 글 상세 페이지
- [ ] About / Contact / Privacy / Disclosure
- [ ] OG 이미지 동적 생성 (제목 + 브랜드)

### Phase 3 — DB + API (2일)
- [ ] D1 마이그레이션 실행
- [ ] /api/posts CRUD
- [ ] /api/auth (PIN 로그인)
- [ ] /api/publish (vivid-blog 연동)
- [ ] /api/media (R2 업로드)
- [ ] IndexNow API 트리거 (publish 시 자동)

### Phase 4 — 관리자 UI (2~3일)
- [ ] /admin 라우트 보호
- [ ] PostEditor (React island, Markdown 에디터)
- [ ] 구조 검증 (H2 60단어, 엔티티 15+, FAQ)
- [ ] MediaUploader
- [ ] 카테고리/저자 관리

### Phase 5 — 콘텐츠 시드 + AdSense (1일)
- [ ] 저자 페이지 1개 (본인)
- [ ] 카테고리 3개 (자동차, 연애, 자기관리)
- [ ] vivid-blog으로 글 10개 생성 + 발행
- [ ] AdSense 신청

### Phase 6 — 웹마스터 도구 + GEO 강화 (1일)
- [ ] Google Search Console 등록 + 소유권 확인 + sitemap 제출
- [ ] **Naver Search Advisor 등록** + 소유권 확인 + sitemap 제출
- [ ] Bing Webmaster Tools 등록 + sitemap 제출 + AI Performance 연동
- [ ] IndexNow API 키 발급 + `/{key}.txt` 루트 배치
- [ ] llms.txt, llms-full.txt
- [ ] 이미지/비디오/뉴스 sitemap 분리
- [ ] Gemini CLI로 semantic completeness 체크 파이프라인

### Phase 7 — 분산 / Earned Media (지속)
- [ ] **네이버 블로그 크로스 포스팅 템플릿** (요약 + 원문 링크)
- [ ] 네이버 블로그 자동 업로드 (vivid-blog 파이프라인 확장)
- [ ] YouTube Shorts 자동 생성 (글 → 3줄 요약 → TTS + 영상)
- [ ] Reddit / Threads 확장 (기회 기반)
- [ ] 토픽 클러스터 설계 + 카테고리당 30~50개 확장

---

## 11. 완료 기준 (Definition of Done)

### 각 글
- [ ] 제목 60자 이내 (구체적/세분화 키워드 — 네이버 SmartBlock 대응)
- [ ] 첫 문단 직답 포함 (100자 이내)
- [ ] H2 직후 60단어 답변 구조
- [ ] 엔티티 15개 이상
- [ ] FAQ 3개 이상
- [ ] 빠른 답 섹션
- [ ] 커버 이미지 alt 포함 (상세 기술)
- [ ] Article + FAQPage JSON-LD 자동 삽입
- [ ] `dateModified` 현재
- [ ] 실제 체험/상세 의견 포함 (네이버 D.I.A. 대응)
- [ ] 네이버 블로그 크로스 포스팅 완료 (요약판)
- [ ] IndexNow 자동 호출됨

### 프로젝트 전체
- [ ] PageSpeed Insights 90+ (Mobile + Desktop)
- [ ] Rich Results Test 통과 (Article, FAQPage, Organization, Person, WebSite, Breadcrumb)
- [ ] robots.txt 크롤러 차단 안 함 (AI 크롤러 포함)
- [ ] sitemap.xml 모든 글 포함 + 이미지/비디오/뉴스 별도 sitemap
- [ ] llms.txt + llms-full.txt 존재
- [ ] 필수 페이지 4종 (About, Contact, Privacy, Disclosure)
- [ ] 카테고리당 최소 10개 글 (AdSense 신청) → 장기 30-50개 (토픽 클러스터)
- [ ] AdSense 승인
- [ ] **Google Search Console 등록 + sitemap 제출 + 인덱싱 확인**
- [ ] **Naver Search Advisor 등록 + sitemap 제출 + 인덱싱 확인**
- [ ] **Bing Webmaster Tools 등록 + AI Performance 활성화**
- [ ] IndexNow API 키 배치 완료
- [ ] 네이버 블로그 크로스 포스팅 파이프라인 가동

---

## 12. 참조 링크

### Core SEO/GEO
- [Astro vs Next.js 2026](https://eastondev.com/blog/en/posts/dev/20251202-astro-vs-nextjs-comparison/)
- [Core Web Vitals 2026](https://skyseodigital.com/core-web-vitals-optimization-complete-guide-for-2026/)
- [AI Citation Algorithm 2026](https://upgrowth.in/citation-algorithm-chatgpt-perplexity-gemini-ai-overviews-2026/)
- [Gemini Get Cited 2026](https://www.oltre.ai/blog/how-to-get-cited-by-gemini/)
- [AEO vs GEO vs LLMO](https://www.onely.com/blog/geo-aeo-aiseo-llmo/)
- [Google AI Overview Top-10 Drop](https://almcorp.com/blog/google-ai-overview-citations-drop-top-ranking-pages-2026/)
- [llms.txt 2026 Reality](https://searchsignal.online/blog/llms-txt-2026)

### Naver SEO
- [네이버 D.I.A. 알고리즘](https://www.twinword.co.kr/blog/naver-seo-d-i-a/)
- [네이버 스마트블록 최적화](https://seo.tbwakorea.com/blog/naver-smartblock-and-seo/)
- [Naver Search Advisor 가이드](https://www.interad.com/en/insights/naver-search-advisor-a-full-guide)
- [네이버 AI 브리핑 최적화](https://blog.lead-gen.team/naver-ai-briefing-seo-optimal-strategy)

### Bing / Copilot
- [Bing Webmaster AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [Bing 2026 Algorithm Updates](https://seovendor.co/bing-april-2026-algorithm-updates)

### Claude
- [Claude AI Optimization Guide](https://www.stackmatix.com/blog/claude-ai-optimization)
- [Claude Citation Strategy](https://rankeo.io/blog/how-to-get-cited-by-chatgpt-perplexity-claude)

---

## 13. 변경 이력

- 2026-04-17 초판: Astro 스택 + SEO/AEO/GEO/LLMO/AIO 통합 요구사항 확정
- 2026-04-17 v2: **한국 검색엔진 전체 커버 확장**
  - 네이버 SEO 특화 섹션 추가 (C-Rank, D.I.A., SmartBlock, VIEW, AI 탭)
  - Claude 특화 추가 (겸손 톤, 정확성, earned media)
  - Bing/Copilot AI Performance Report 반영
  - 웹마스터 도구 4종 등록 섹션 신설 (GSC + Naver SA + Bing WMT + Daum)
  - Zum/Nate/Yandex 선택 등록 포함
  - IndexNow 프로토콜 추가
  - Sitemap 4종 분리 (기본/이미지/뉴스/비디오)
  - Schema 타입 5종 추가 (WebSite/Review/Product/VideoObject/ProfilePage)
  - 분산 전략 확장 (Tistory, Brunch, Kakao 채널, Naver 포스트/지식iN/카페)
  - Tistory canonical 설정 지침

- 2026-04-17: 초기 작성. Astro 스택 + SEO/AEO/GEO/LLMO/AIO 통합 요구사항 확정.
