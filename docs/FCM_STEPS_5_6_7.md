# FCM 5·6·7단계 — Edge Function 배포, Cron 등록, 알림 켜기

---

## 5. Supabase CLI로 Edge Function 배포 + FCM_SERVER_KEY 설정

### 5-1. Supabase CLI 설치 (미설치 시)

- **Windows**: `scoop install supabase` 또는 [Releases](https://github.com/supabase/cli/releases)에서 exe 다운로드
- 또는: `npm install -g supabase` (Node 있으면)

### 5-2. 로그인 및 프로젝트 연결

터미널에서:

```bash
cd e:\00_Work\02_LineMiniApp\Dday\d-day
supabase login
```

브라우저에서 로그인 완료 후:

```bash
supabase link --project-ref dndeetveclyakyhmkcbt
```

DB 비밀번호 물으면 Supabase 대시보드 → 프로젝트 설정 → Database → Database password 입력.

### 5-3. FCM 서비스 계정 JSON(Secret) 설정

**Legacy API는 사용 중지됨**이라, **FCM HTTP v1 API**용 **서비스 계정 키(JSON)** 를 씁니다.

1. Firebase Console → 프로젝트 설정 → **서비스 계정** 탭
2. **새 비공개 키 생성** 클릭 → JSON 파일 다운로드
3. Supabase 대시보드 → **Project Settings** → **Edge Functions** → **Secrets**
4. **New secret** 클릭  
   - Name: `FCM_SERVICE_ACCOUNT_JSON`  
   - Value: 다운로드한 JSON 파일 **전체 내용**을 복사해 붙여넣기 (한 줄로 붙여도 됨)

CLI로 넣을 때 (Windows PowerShell):

```powershell
# JSON 파일 경로를 지정한 뒤
$json = Get-Content "C:\경로\서비스계정키.json" -Raw
npx supabase secrets set FCM_SERVICE_ACCOUNT_JSON="$json"
```

또는 Supabase 대시보드에서 Secret 추가하는 것을 권장합니다.

### 5-4. Edge Function 배포

```bash
npx supabase functions deploy send-daily-notifications
```

- **Docker is not running** 경고가 나와도 **원격 배포에는 문제 없음**. (Docker는 로컬 에뮬레이션용이라 무시해도 됨.)
- 끝나면 `https://dndeetveclyakyhmkcbt.supabase.co/functions/v1/send-daily-notifications` 로 호출 가능해짐.

---

## 6. pg_cron으로 매일 호출 등록

1. Supabase 대시보드 → **SQL Editor** 이동.
2. `supabase/migrations/003_cron_daily_notifications.sql` 파일을 연다.
3. `YOUR_ANON_OR_SERVICE_KEY` 를 **한 번만** 실제 키로 바꾼다.  
   - Supabase 대시보드 → **프로젝트 설정** → **API** → **Project API keys** → **anon public** (또는 service_role) 값 복사해서 붙여넣기.
4. **Run** 실행.

등록된 cron 확인: SQL Editor에서 `select * from cron.job;` 실행.

---

## 7. 앱에서 알림 켜기

1. `npm run dev` 로 앱 실행.
2. 브라우저에서 접속 후 **로그인**.
3. **대시보드** 상단에서 **알림 켜기** 버튼 클릭.
4. 브라우저 알림 허용 창에서 **허용** 선택.

→ FCM 토큰이 `push_tokens` 테이블에 저장됨.  
이후 cron이 매일 `send-daily-notifications` 를 호출하면, 그날 `scheduled_date` 인 알림에 대해 푸시가 발송됨.
