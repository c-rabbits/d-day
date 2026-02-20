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

## OCR (플레이스홀더 적용됨)

- 계약 추가 2단계에서 **입력 방식**: "직접 입력" / "사진에서 추출" 선택 가능
- "사진에서 추출" 시: 사진 업로드 → **텍스트 추출** 버튼 → 현재는 **mock 결과**로 제목·시작일·만료일·금액 칸을 채움 (실제 인식 아님)

### 당신이 할 일 (실제 OCR 붙이려면)

1. **라이브러리/API 선택**  
   - **Tesseract.js** (클라이언트): `npm install tesseract.js`  
   - **Google Cloud Vision API** (서버): 서비스 계정 키 + Vision API 활성화

2. **플레이스홀더 교체**  
   - `components/contract-new-flow.tsx` 안의 `extractFromImage(file)` 함수를 다음 중 하나로 교체:
     - Tesseract: `Tesseract.recognize(file, 'kor+eng')` 결과에서 날짜·숫자·제목 패턴 파싱
     - Vision API: 이미지 base64로 API 호출 후 텍스트/필드 파싱

3. **표시 필드 매핑**  
   - OCR 결과 문자열에서 계약명·시작일·만료일·금액을 추출해  
     `setTitle`, `setStartDate`, `setEndDate`, `setAmount`에 넣는 로직 구현

이후에도 "추출된 내용은 반드시 확인 후 수정" 플로우는 그대로 두는 것을 권장합니다.
