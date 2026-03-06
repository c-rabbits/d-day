# 구글 로그인 설정 가이드

Supabase Auth와 연동해 구글 로그인을 사용하려면 **Google Cloud Console**과 **Supabase Dashboard** 두 곳을 설정해야 합니다.

---

## 1. Google Cloud Console 설정

### 1-1. 프로젝트 선택/생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속 후 로그인
2. 상단 프로젝트 선택 → 기존 프로젝트 선택 또는 **새 프로젝트** 생성

### 1-2. OAuth 동의 화면 설정

1. 왼쪽 메뉴 **APIs & Services** → **OAuth consent screen**
2. **User Type**: 외부 사용자용이면 **External** 선택 후 **만들기**
3. 앱 정보 입력(앱 이름, 사용자 지원 이메일, 개발자 연락처 등) 후 저장
4. **Scopes**는 기본값으로 두거나, 필요 시 `email`, `profile`, `openid` 추가
5. **테스트 사용자**는 개발 중에만 필요 시 추가

### 1-3. OAuth 2.0 클라이언트 ID 생성

1. **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**
2. **Application type**: **Web application**
3. **Name**: 예) `D-Day Web` (원하는 이름)
4. **Authorized redirect URIs**에 아래 주소 **반드시 추가**:
   ```text
   https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   - `<YOUR_SUPABASE_PROJECT_REF>`는 Supabase 프로젝트 URL에서 확인  
     예: URL이 `https://abcdefgh.supabase.co` 이면 `abcdefgh`
5. **만들기** 클릭 후 **Client ID**와 **Client Secret** 복사 (Supabase에 입력할 때 사용)

---

## 2. Supabase Dashboard 설정

### 2-1. Google Provider 활성화

1. [Supabase Dashboard](https://app.supabase.com/) → 프로젝트 선택
2. 왼쪽 **Authentication** → **Providers** → **Google** 선택
3. **Enable Sign in with Google** 켜기
4. Google에서 복사한 값 입력:
   - **Client ID**: Google OAuth 클라이언트 ID
   - **Client Secret**: Google OAuth 클라이언트 시크릿
5. **Save** 클릭

### 2-2. Redirect URL 등록

1. **Authentication** → **URL Configuration**
2. **Redirect URLs**에 앱에서 사용하는 콜백 주소 추가:
   - 로컬: `http://localhost:3000/auth/callback`
   - 프로덕션: `https://<your-domain>/auth/callback`  
     (예: `https://d-day-one.vercel.app/auth/callback`)
3. **Save** 클릭

---

## 3. 앱 동작 확인

- 로그인 페이지에서 **Google로 로그인** 클릭
- 구글 계정 선택 후 동의
- 정상이면 `/auth/callback` → `/dashboard`로 리다이렉트

---

## 문제 해결

| 증상 | 확인 사항 |
|------|-----------|
| "redirect_uri_mismatch" | Google Cloud Console의 **Authorized redirect URIs**에 `https://<ref>.supabase.co/auth/v1/callback` 정확히 입력했는지 확인 (Supabase 프로젝트 URL과 ref 일치) |
| "OAuth redirect URL mismatch" | Supabase **Redirect URLs**에 `https://<your-domain>/auth/callback` 추가했는지 확인 |
| 로그인 후 에러 페이지로 이동 | Supabase **Redirect URLs**에 사용 중인 도메인(예: Vercel URL)이 포함되어 있는지 확인 |

---

## 참고

- 구글 로그인 플로우: 로그인 버튼 클릭 → Google 로그인 → Supabase `auth/v1/callback` → 앱 `/auth/callback` → 세션 생성 후 `/dashboard` 이동
- 환경 변수: 구글 Client ID/Secret은 **Supabase Dashboard에만** 입력하면 됩니다. 앱의 `.env`에는 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`만 있으면 됩니다.
