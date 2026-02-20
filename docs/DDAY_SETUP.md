# 디데이(D-Day) 앱 — MVP 설정

## 1. Supabase DB 스키마 적용

1. [Supabase 대시보드](https://app.supabase.com) → 프로젝트 선택
2. **SQL Editor** 메뉴 이동
3. `supabase/migrations/001_dday_schema.sql` 파일 내용 전체 복사 후 붙여넣기
4. **Run** 실행

이렇게 하면 `contracts`, `notifications` 테이블과 RLS 정책이 생성됩니다.

## 2. 로컬 실행

```bash
cd d-day
npm run dev
```

브라우저에서 http://localhost:3000 접속 후 회원가입/로그인 → 대시보드에서 계약 추가·목록·수정·삭제(soft delete)를 사용할 수 있습니다.

## 3. MVP에서 구현된 기능

- **인증**: 이메일 로그인/회원가입 (Supabase Auth)
- **계약 CRUD**: 등록(3단계), 목록(만료일 오름차순), 상세, 수정, 삭제(soft delete)
- **D-day 표시**: D-12, D-day, D+3 형식 + 색상(빨강 ≤7일, 주황 ≤30일)
- **알림 스케줄**: D-30 / D-7 / D-1 선택 시 `notifications` 테이블에 저장 (실제 푸시 발송은 FCM·cron 연동 시 구현)

## 4. 추가 기능 (설정 가이드)

- **PWA**: 적용됨. `public/manifest.json`, `public/sw.js`, 아이콘은 선택 사항. → `docs/PWA_AND_OCR.md`
- **OCR**: 계약 추가 시 "사진에서 추출" 옵션 + 플레이스홀더 적용. 실제 연동은 `docs/PWA_AND_OCR.md` 참고.
- **FCM 푸시 + Cron**: `push_tokens` 테이블, Edge Function `send-daily-notifications`, 대시보드 "알림 켜기" 버튼 적용됨. Firebase·Cron 설정은 **`docs/FCM_SETUP.md`** 단계별 참고.
