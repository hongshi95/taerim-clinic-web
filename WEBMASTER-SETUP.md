# 웹마스터 도구 4종 등록 가이드

> **이 가이드 따라 30분 작업**. 4개 검색엔진 + AI 크롤러가 덕계를 인식하게 됩니다.

---

## 📋 공통 사전 준비

**사이트**: https://deokgye.com
**Sitemap**: https://deokgye.com/sitemap-index.xml

이 두 URL만 알면 4개 웹마스터 도구 전부 등록 가능합니다.

---

## 1️⃣ Google Search Console (필수)

**우선순위**: 🔴🔴🔴🔴🔴 (한국 26% + AI Overviews + Gemini 핵심)

### 등록 절차

1. https://search.google.com/search-console 접속
2. 로그인 (**AdSense 신청 예정 Google 계정**으로 — 중요)
3. **속성 추가** → **URL 접두어** 선택
4. `https://deokgye.com` 입력
5. **확인 방법**: HTML 태그 방식 선택
6. `<meta name="google-site-verification" content="...">` 태그에서 **content 값 복사**

### 인증 태그 주입

**본인 PowerShell에서**:
```powershell
cd D:\dev\deokgye-web

# Cloudflare Pages 환경변수로 등록 (빌드 시 자동 주입)
"PUBLIC_GSC_VERIFICATION=복사한_content_값" | `
  Out-File -Append -Encoding utf8 .env.production

# 또는 Cloudflare Pages 대시보드 → Settings → Environment Variables에서 추가
# Key: PUBLIC_GSC_VERIFICATION
# Value: [복사한 content 값]
# Environment: Production
```

배포 재실행:
```powershell
npm run build
npx wrangler pages deploy dist --project-name deokgye-web --branch main --commit-message="gsc verify"
```

### 확인 + Sitemap 제출

1. GSC 돌아가서 **확인** 클릭 → "소유권 확인됨" 뜨면 성공
2. 좌측 메뉴 **Sitemap** → 새 Sitemap 추가: `sitemap-index.xml` → 제출
3. 며칠 내 **색인 생성됨** 확인

---

## 2️⃣ Naver Search Advisor (가장 중요 — 한국 62%)

**우선순위**: 🔴🔴🔴🔴🔴 (네이버 점유율 압도적)

### 등록 절차

1. https://searchadvisor.naver.com 접속
2. **네이버 아이디로 로그인** (개인 계정 OK)
3. **사이트 등록** → `https://deokgye.com` 입력
4. **소유 확인**: HTML 태그 방식
5. `<meta name="naver-site-verification" content="..." />` content 값 복사

### 주입 + 배포

```powershell
# Cloudflare Pages 대시보드 → Environment Variables
# Key: PUBLIC_NAVER_VERIFICATION
# Value: [복사한 값]
# Production 선택 → Save

# 또는 .env.production에 추가 후 재배포
```

### 확인 + Sitemap + RSS

1. 확인 클릭
2. **요청 → 사이트맵 제출** → `https://deokgye.com/sitemap-index.xml`
3. **요청 → RSS 제출** → `https://deokgye.com/rss.xml`
4. **설정 → 로봇 설정** → 허용으로 설정 확인

### 네이버 특화 팁

- **로그 분석 → 웹페이지 수집** 에서 크롤링 상태 매일 확인 (초기)
- **모바일 최적화** 탭 확인 (네이버는 모바일 가중치 높음)
- **수집 요청**: 새 글 발행 시 개별 URL 제출 (급속 인덱싱)

---

## 3️⃣ Bing Webmaster Tools (+Copilot + ChatGPT Search)

**우선순위**: 🔴🔴🔴🔴 (Bing 3%지만 ChatGPT/DuckDuckGo/Yahoo 모두 파워링)

### 등록 절차

1. https://www.bing.com/webmasters 접속
2. Microsoft 계정 로그인 (없으면 Gmail로 새로 가입)
3. **Add a site** → `https://deokgye.com`
4. **Meta tag 방식**: `<meta name="msvalidate.01" content="..." />` content 값 복사

### 주입 + 배포

```powershell
# Environment Variable
# Key: PUBLIC_BING_VERIFICATION
# Value: [복사한 값]
```

재배포 후 확인.

### Bing 특별 혜택

- **Import from Google Search Console** 기능 있음
- GSC에 등록돼 있으면 **Bing이 자동으로 동기화**해줌
- **AI Performance Report** (2026 신기능) → Copilot 인용 추적 대시보드

---

## 4️⃣ Daum (Kakao) 웹마스터 도구

**우선순위**: 🟡🟡🟡 (Daum 3%, Kakao 생태계 보조)

### 등록 절차

1. https://webmaster.daum.net 접속
2. 카카오/Daum 계정 로그인
3. **사이트 등록** → `https://deokgye.com`
4. **HTML 파일 업로드 방식** 또는 메타 태그 선택

#### 메타 태그로 갈 경우
`<meta name="daum-site-verification" content="..." />` 복사

#### HTML 파일 방식으로 갈 경우
Daum이 준 HTML 파일(예: `daum-xxxx.html`)을 다운로드 후:
```powershell
# public/ 에 복사하면 자동으로 배포됨
copy ~\Downloads\daum-xxxx.html D:\dev\deokgye-web\public\
```

### 주입 + 배포

메타 태그 방식이면:
```powershell
# Environment Variable
# Key: PUBLIC_DAUM_VERIFICATION
# Value: [복사한 값]
```

### Sitemap 제출

1. **검색최적화 → 수집요청** → `https://deokgye.com`
2. **정보분석** 에서 수집 상태 확인

---

## 🚀 5️⃣ IndexNow (즉시 인덱싱 통보)

**이미 설정 완료** ✅

- 키 파일: https://deokgye.com/0e0828f8e02e1a84268bf2cc0bfca3f5.txt (배포됨)
- 자동 통보: 새 글 발행 시 `/api/publish`가 Bing + Yandex + api.indexnow로 자동 ping
- 본인이 할 일 없음

---

## 📊 등록 후 확인 체크리스트

각 도구에서 **"색인 생성 / 크롤링 시작"** 확인까지 보통 며칠 걸립니다.

| 도구 | 소유권 확인 | 크롤링 시작 | 색인 생성 |
|---|---|---|---|
| Google Search Console | 즉시 | 24-48시간 | 3-14일 |
| Naver Search Advisor | 즉시 | 1-3일 | 7-30일 |
| Bing Webmaster Tools | 즉시 | 1-2일 | 3-7일 |
| Daum 웹마스터 | 즉시 | 3-7일 | 7-30일 |

## 🎯 AdSense 신청 전 조건

- [ ] **10+ 글 발행** (현재 10개 ✅)
- [ ] **필수 페이지 4종** (About/Contact/Privacy/Disclosure ✅)
- [ ] **사이트맵 제출** (적어도 GSC에 제출)
- [ ] **Google Search Console 소유권 확인** (이걸로 AdSense가 사이트 인식)
- [ ] **크롤링 오류 없음** 확인 (GSC 좌측 "페이지" 메뉴)

이 조건 충족 후 https://www.google.com/adsense 에서 신청.

## 💡 프로 팁

### 1. Google 계정 통일
AdSense + GSC + Analytics + YouTube + Blogger 모두 **같은 Google 계정**으로 관리.
= younght83210@gmail.com 한 계정에 통합 권장.

### 2. 네이버는 여러 번 제출
네이버는 Google처럼 자동 재크롤링 약함. 새 글 발행 시 **"수집 요청"에 URL 직접 제출**이 가장 빠름.

### 3. 초기 1개월은 매일 체크
- GSC: **커버리지** 에러 여부
- 네이버: **웹페이지 수집 요청 실패** 없는지
- Bing: Import 잘 됐는지

---

## 🆘 문제 해결

### "소유권 확인 실패"
- 환경변수 등록 후 **재배포 완료됐는지** 확인
- 메타 태그가 `<head>` 안에 있는지 확인: `curl https://deokgye.com | grep verification`

### "Sitemap 읽을 수 없음"
- 먼저 직접 접근 테스트: `curl https://deokgye.com/sitemap-index.xml`
- 압축(.gz) 없이 원본 XML이어야 함 (현재 설정 OK)

### "크롤링 차단됨"
- `curl https://deokgye.com/robots.txt` 에서 `Disallow: /` 없는지 확인
- 현재 robots.txt는 `/admin`, `/api` 만 차단 → 정상

---

완료되면 각 도구 대시보드 스크린샷 주세요. 색인 생성 진행 상황 같이 모니터링하겠습니다.
