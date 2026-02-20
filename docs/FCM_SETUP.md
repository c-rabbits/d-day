# FCM 푸시 알림 설정 (단계별)

앱에서 **매일 만료 D-day 알림**을 푸시로 보내려면 아래 순서대로 진행하세요.

---

## 1. Supabase에 push_tokens 테이블 만들기

1. Supabase 대시보드 → **SQL Editor**
2. `supabase/migrations/002_push_tokens.sql` 내용 붙여넣기 후 **Run**

---

## 2. Firebase 프로젝트 만들기

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** (이름 예: dday-app)
3. (선택) Google Analytics 설정
4. 프로젝트 생성 완료 후 **프로젝트 설정**(휴드립션 아이콘) 이동

---

## 3. 웹 앱 등록 및 키 확인

1. Firebase 프로젝트 설정 → **일반** 탭
2. **내 앱**에서 **</> 웹** 앱 추가
3. 앱 닉네임 입력 후 등록 (체크박스는 필요 시만)
4. **Firebase SDK 설정**에서 `firebaseConfig` 객체 확인  
   - `apiKey`, `projectId`, `authDomain`, `messagingSenderId` 등 복사해 둠

5. **Cloud Messaging** 탭 이동  
   - **웹 푸시 인증서**: 키가 없으면 **키 생성** → **키** 값 복사 (VAPID 키로 사용)

---

## 4. .env.local에 Firebase 변수 넣기

`d-day/.env.local`에 다음 추가 (값은 본인 Firebase 값으로 교체):

```env
# Firebase (FCM 푸시용)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNx...웹_푸시_인증서_키
```

---

## 5. Firebase SDK 설치

```bash
cd d-day
npm install firebase
```

---

## 6. Supabase Edge Function 배포 및 FCM 시크릿 설정

**Legacy API는 사용 중지**되어 있어 **서비스 계정 JSON**을 사용합니다.

1. **서비스 계정 키 발급**  
   Firebase Console → 프로젝트 설정 → **서비스 계정** 탭 → **새 비공개 키 생성** → JSON 다운로드

2. **Supabase 시크릿 등록**  
   Supabase 대시보드 → **Project Settings** → **Edge Functions** → **Secrets**  
   - Name: `FCM_SERVICE_ACCOUNT_JSON`  
   - Value: 위 JSON 파일 **전체 내용** 붙여넣기

3. **CLI로 배포** (프로젝트 연결 후):

```bash
cd d-day
npx supabase login
npx supabase link --project-ref 여기에_프로젝트_참조_ID
npx supabase functions deploy send-daily-notifications
```

시크릿은 대시보드에서 넣었으면 CLI에서 다시 설정할 필요 없습니다.

---

## 7. 매일 00:00에 Edge Function 호출 (Cron)

Supabase 대시보드 → **SQL Editor**에서 아래 실행 (한 번만).

- `YOUR_PROJECT_REF`: Supabase URL의 프로젝트 ID (예: dndeetveclyakyhmkcbt)
- `YOUR_ANON_OR_SERVICE_KEY`: anon key 또는 서비스 롤 키 (Vault에 넣고 쓰는 것을 권장)

```sql
-- pg_cron, pg_net 확장 활성화 (이미 있으면 무시)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 매일 00:10 KST (15:10 UTC)에 알림 발송 함수 호출
select cron.schedule(
  'dday-daily-notifications',
  '10 15 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_OR_SERVICE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

한국 시간 00:00에 맞추려면 cron 식을 `0 15 * * *` (UTC 15:00 = KST 00:00) 등으로 조정하면 됩니다.

---

## 8. 앱에서 알림 켜기

1. `npm run dev`로 실행 후 로그인
2. 대시보드 상단 **알림 켜기** 버튼 클릭
3. 브라우저에서 **알림 허용** 선택  
→ FCM 토큰이 `push_tokens` 테이블에 저장됩니다.

이후 매일 Cron이 `send-daily-notifications`를 호출하면, 그날 `scheduled_date`인 알림에 대해 푸시가 발송됩니다.
