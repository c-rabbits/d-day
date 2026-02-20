# PWA · OCR 요약

## PWA (이미 적용됨)

- **manifest**: `public/manifest.json` — 앱 이름, 테마 색, 아이콘 경로
- **서비스 워커**: `public/sw.js` — 설치·오프라인 시 네비게이션 요청 캐시
- **등록**: `components/pwa-register.tsx`가 레이아웃에서 `/sw.js` 등록

### 당신이 할 일

1. **아이콘 추가 (선택)**  
   - `public/icons/icon-192.png` (192×192)  
   - `public/icons/icon-512.png` (512×512)  
   없어도 동작하며, 없으면 브라우저 기본 아이콘 사용.

2. **HTTPS로 서비스**  
   - 로컬은 `http://localhost`로 설치 가능  
   - 실제 배포 시에는 HTTPS 필수 (Vercel 등은 기본 HTTPS)

3. **설치 경험 확인**  
   - Chrome → 주소창 오른쪽 설치 아이콘 또는 메뉴 → "앱 설치"

---

## OCR (Google Vision API 적용됨)

- 계약 추가 2단계에서 **입력 방식**: "직접 입력" / "사진에서 추출" 선택 가능
- "사진에서 추출" 시: 사진 업로드 → **텍스트 추출** 버튼 → **Google Cloud Vision API**로 텍스트 인식 후 계약명·시작일·만료일·금액을 추출해 폼에 채움 (반드시 확인 후 수정 권장)

### Vision API 설정 방법

1. **GCP 프로젝트 만들기/선택**  
   - [Google Cloud Console](https://console.cloud.google.com/) 접속 후 상단 프로젝트 선택  
   - 프로젝트가 없으면 **새 프로젝트**로 생성 (이름 예: `d-day-ocr`)

2. **Vision API 활성화**  
   - "API 및 서비스" → "라이브러리" → "Cloud Vision API" 검색 후 **사용** 클릭

3. **API 키 생성**  
   - GCP 콘솔 왼쪽 메뉴: **API 및 서비스** → **사용자 인증 정보**  
   - 상단 **+ 사용자 인증 정보 만들기** → **API 키** 선택  
   - 생성된 키가 뜨면 **복사** 버튼으로 복사 (한 번만 표시되므로 저장해 두기)  
   - (선택) 보안을 위해 **키 제한** 설정: 해당 API 키 옆 **편집** → "API 제한" → "키 제한" → "Cloud Vision API"만 선택 후 저장  

4. **환경 변수 설정**  
   - 프로젝트 루트의 **`d-day/.env.local`** 파일을 연다 (없으면 새로 만든다).  
   - 다음 한 줄을 추가한다 (복사한 API 키를 그대로 붙여넣기):
     ```bash
     GOOGLE_CLOUD_VISION_API_KEY=AIzaSy...붙여넣은_키_전체
     ```
   - 저장 후 **개발 서버를 다시 실행**해야 반영된다 (`npm run dev` 중이면 종료 후 다시 실행).  
   - **Vercel 배포** 시: Vercel 프로젝트 → Settings → Environment Variables → `GOOGLE_CLOUD_VISION_API_KEY` 이름으로 같은 값을 추가한다.  

5. **동작 위치 (참고)**  
   - **브라우저**: 계약 추가 2단계에서 "사진에서 추출" 선택 → 사진 선택 → "텍스트 추출" 클릭 시, `contract-new-flow.tsx`의 `extractFromImage(file)`가 이미지를 **`POST /api/ocr`** 로 보낸다.  
   - **서버**: `app/api/ocr/route.ts`가 이미지를 받아 Vision API에 요청하고, 인식된 텍스트에서 계약명·시작일·만료일·금액을 추출해 JSON으로 돌려준다.  
   - **다시 브라우저**: 받은 값으로 폼 칸(계약명, 시작일, 만료일, 금액)이 채워지므로, 사용자가 확인·수정 후 저장하면 된다.

이후에도 "추출된 내용은 반드시 확인 후 수정" 플로우는 그대로 두는 것을 권장합니다.
