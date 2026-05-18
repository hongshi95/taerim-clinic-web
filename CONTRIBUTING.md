# 태림한의원 사이트 기여 가이드

## 글쓰기 규칙 (강제)

### 1. em dash(—) 절대 금지

본문, 제목, 주석, 어디든 em dash(`—`, U+2014) 사용 금지. **쉼표(`,`) 또는 하이픈(`-`)으로 대체**.

위반 시 GitHub Actions가 build를 차단합니다 (`.github/workflows/deploy.yml` lint step).

```bash
# 일괄 정정 스크립트 (전체 src 처리)
node scripts/remove-em-dash.mjs --all
```

| ❌ 금지 | ✅ 권장 |
|--------|-------|
| `09:30 — 19:00` (시간 범위) | `09:30 - 19:00` |
| `— 서조혁 원장` (인용 by-line) | `- 서조혁 원장` |
| `진료 철학 — 듣기, 체질` (제목 부제) | `진료 철학 (듣기, 체질)` |

### 2. AI스러운 콜론 부제 제목 금지

`키워드: 부제` 형태 콜론 제목은 AI 생성 티가 강함. 회피.

| ❌ 금지 | ✅ 권장 |
|--------|-------|
| `추나요법: 보험 적용 비용 정리` | `추나요법 보험 적용 비용, 한눈에 정리` |
| `골타요법: 효과와 한계` | `골타요법, 효과와 한계는?` |

### 3. 의료 콘텐츠 = 한의사 명의

모든 의료 정보 글의 `author`는 자격자(서조혁 한의사 = `seo-johyuk`) 명의로.

본문 1인칭에 "편집팀"은 사용 X. 의료법 제27조/제56조 위반 위험.

| ❌ 금지 | ✅ 권장 |
|--------|-------|
| `편집팀이 정리한 결과` | `원장이 검토한 결과` |
| `저희 편집팀이` | `저(서조혁 원장)는` |
| `편집팀 노트` | `원장 노트` |

---

## CI/CD

main 브랜치 push 시 `.github/workflows/deploy.yml` 자동 실행:
1. **Lint - em dash 검사** (실패 시 build 차단)
2. Build (Astro static)
3. Cloudflare Pages Deploy

deploy fail 시 GitHub Actions 탭에서 원인 확인.

---

## 개발 명령

| Command | Action |
|---------|--------|
| `npm install` | 의존성 설치 |
| `npm run dev` | 로컬 dev server (localhost:4321) |
| `npm run build` | 프로덕션 빌드 (./dist/) |
| `npm run typecheck` | Astro check |
| `npm run cf:deploy` | 수동 Cloudflare Pages deploy |
