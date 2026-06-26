# 상담 신청 → 구글시트 미러 설정

상담 신청(`/api/consult`)이 들어오면 D1 `leads` 테이블에 저장되는 동시에,
**구글시트에도 한 줄씩 자동 기록**되도록 하는 옵션 기능. 직원이 폰에서 시트만 열어
바로 확인할 수 있게 하기 위함이다.

- 코드: [`functions/api/consult.ts`](../functions/api/consult.ts) `mirrorToSheet()`
- 동작: D1 저장 **성공 후** `waitUntil`로 **비차단** POST. 시트 미러가 실패하거나
  `SHEET_WEBHOOK_URL`이 비어 있어도 상담 접수 자체는 정상 처리된다.
- **`SHEET_WEBHOOK_URL` 환경변수를 설정하기 전까지는 아무 일도 일어나지 않는다**(조용히 skip).

---

## 1. 구글시트 + Apps Script 웹앱 만들기

1. 새 구글시트 생성 (예: "태림 상담신청"). 첫 행은 비워둬도 되고, 헤더를 미리 적어둬도 된다.
2. 시트 상단 메뉴 **확장 프로그램 → Apps Script** 클릭.
3. 기본 `Code.gs` 내용을 아래로 **전부 교체**:

```javascript
// 태림 상담신청 → 구글시트 append 웹훅
// 위변조 방지용 공유 시크릿. 아래 값을 길고 랜덤한 문자열로 바꾼 뒤,
// 동일 값을 Cloudflare Pages 환경변수 SHEET_WEBHOOK_TOKEN 에도 넣는다.
const SHARED_TOKEN = 'CHANGE_ME_to_a_long_random_string';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 토큰 검증 (SHEET_WEBHOOK_TOKEN 을 설정한 경우에만 강제)
    if (SHARED_TOKEN && SHARED_TOKEN !== 'CHANGE_ME_to_a_long_random_string') {
      if (data.token !== SHARED_TOKEN) {
        return ContentService.createTextOutput('forbidden');
      }
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // 헤더가 비어 있으면 1회 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['접수시각', '이름', '지역', '연락처', '유입', 'ID']);
    }

    // 접수시각은 한국시간으로 보기 좋게 변환
    const kst = Utilities.formatDate(
      new Date(data.created_at || new Date()),
      'Asia/Seoul',
      'yyyy-MM-dd HH:mm'
    );

    sheet.appendRow([
      kst,
      data.name || '',
      data.area || '',
      "'" + (data.phone || ''), // 앞 0 보존 위해 텍스트로
      data.source || '',
      data.id || '',
    ]);

    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
}
```

4. `SHARED_TOKEN` 값을 길고 랜덤한 문자열로 바꾼다. (예: 비밀번호 생성기로 32자)
5. 우측 상단 **배포 → 새 배포** → 유형 **웹 앱**:
   - 실행 주체: **나(본인 계정)**
   - 액세스 권한: **모든 사용자**
   - **배포** 클릭 → 권한 승인.
6. 발급되는 **웹 앱 URL** (`https://script.google.com/macros/s/..../exec`) 을 복사.

> ⚠️ 코드를 수정할 때마다 **"새 배포"가 아니라 기존 배포의 "버전 관리 → 새 버전"**으로
> 올려야 URL이 유지된다. 새 배포를 만들면 URL이 바뀐다.

---

## 2. Cloudflare Pages 환경변수 설정

Cloudflare 대시보드 → **Workers & Pages → taerim-clinic-web → Settings → Environment variables**
(Production):

| 변수명 | 값 |
|---|---|
| `SHEET_WEBHOOK_URL` | 1번에서 복사한 `.../exec` URL |
| `SHEET_WEBHOOK_TOKEN` | Apps Script의 `SHARED_TOKEN` 과 동일한 값 |

> 토큰을 안 쓰려면 `SHEET_WEBHOOK_TOKEN`을 비우고 Apps Script의 `SHARED_TOKEN`도
> 기본값 그대로 두면 검증을 건너뛴다. (단, 누구나 시트에 쓸 수 있게 되므로 토큰 사용 권장.)

저장 후 **재배포**(git push 또는 대시보드 Retry deployment)하면 적용된다.
Pages 환경변수는 코드 배포와 별개로 프로젝트에 저장되며, 이후 배포에 자동 반영된다.

---

## 3. 동작 확인

공개 사이트 하단 상담바에서 테스트 신청을 한 건 넣고:
- `/admin/leads` (PIN 로그인) 에 보이는지 → D1 정상
- 구글시트에 한 줄 추가됐는지 → 미러 정상

둘 다 보이면 완료. 시트에만 안 보이면 `SHEET_WEBHOOK_URL` / 토큰 일치 여부를 확인한다.
