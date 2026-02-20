# Vercel 배포 가이드 — 디데이

HTTPS에서 앱과 푸시를 사용하려면 Vercel에 배포하면 됩니다.

---

## 1. 준비

- **Git 저장소**: 프로젝트가 GitHub / GitLab / Bitbucket 에 올라가 있어야 합니다.
- **Vercel 계정**: [vercel.com](https://vercel.com) 에서 가입(또는 GitHub로 로그인).

---

## 2. Vercel에 프로젝트 가져오기

1. [Vercel 대시보드](https://vercel.com/dashboard) → **Add New** → **Project**
2. **Import** 할 저장소 선택 (또는 GitHub 연동 후 저장소 선택)
3. **Root Directory** 설정  
   - 저장소 루트가 `Dday` 이고, Next.js 앱이 **`d-day`** 폴더 안에 있으면  
   - **Root Directory** 를 **`d-day`** 로 지정하고 **Edit** 후 저장
4. **Framework Preset**: Next.js 로 잡혀 있으면 그대로 두기

---

## 3. 환경 변수 설정

**Settings** 탭에서 **Environment Variables** 로 들어가서, 아래 변수들을 **Production** (그리고 필요하면 Preview) 에 추가하세요.  
값은 로컬 `.env.local` 에 있는 것을 그대로 복사해 넣으면 됩니다.

| 이름 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase SDK apiKey |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase projectId |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase authDomain |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase appId |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | 웹 푸시 인증서(VAPID) 키 |
| `GOOGLE_CLOUD_VISION_API_KEY` | (선택) 사진에서 추출(OCR) 사용 시 — GCP Vision API 키 |

**중요:** `NEXT_PUBLIC_*` 변수가 있어야 빌드 시 `firebase-messaging-sw.js` 가 생성되고, 배포 후에도 알림 켜기가 동작합니다. OCR을 쓰려면 `GOOGLE_CLOUD_VISION_API_KEY` 도 설정하세요.

---

## 4. Supabase 리다이렉트 URL 추가

배포된 주소에서 로그인/회원가입이 동작하도록 Supabase에 URL을 등록합니다.

1. [Supabase 대시보드](https://app.supabase.com) → 프로젝트 선택
2. **Authentication** → **URL Configuration**
3. **Redirect URLs** 에 배포 주소 추가  
   - 예: `https://your-project.vercel.app/**`  
   - (실제 도메인은 Vercel에서 확인)

---

## 5. Firebase 인증 도메인 추가 (선택)

FCM/로그인 등 Firebase를 쓰는 경우, 배포 도메인을 허용해 둡니다.

1. [Firebase Console](https://console.firebase.google.com) → 프로젝트 선택
2. **Authentication** → **Settings** → **Authorized domains**
3. **Add domain** → Vercel 도메인 입력 (예: `your-project.vercel.app`)

---

## 6. 배포 실행

1. Vercel 프로젝트 화면에서 **Deploy** (또는 **Redeploy**)
2. 또는 **Git 저장소에 push** 하면 자동 배포되는 경우, 그냥 push

빌드가 끝나면 **배포 URL** 이 나옵니다 (예: `https://d-day-xxx.vercel.app`).

---

## 7. 배포 후 확인

1. 배포 URL 로 접속
2. **회원가입/로그인** 동작 확인
3. **대시보드** → **알림 켜기** → Chrome 에서 푸시 허용 후 토큰 저장되는지 확인
4. (선택) **PWA** → 브라우저 메뉴에서 “앱 설치” 가능한지 확인

---

## 요약 체크리스트

- [ ] Git 저장소에 코드 push
- [ ] Vercel에서 프로젝트 Import, **Root Directory** = `d-day` (필요 시)
- [ ] 환경 변수 8개(필수) + OCR 사용 시 `GOOGLE_CLOUD_VISION_API_KEY` 입력
- [ ] Supabase Redirect URLs 에 배포 URL 추가
- [ ] (선택) Firebase Authorized domains 에 배포 도메인 추가
- [ ] Deploy 후 로그인·알림 켜기 테스트

이후 코드 수정 후 **push** 하면 Vercel이 자동으로 다시 빌드·배포합니다.
