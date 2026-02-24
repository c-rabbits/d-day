// D-Day 앱 공통 타입 (DB 스키마와 일치)

export const CONTRACT_CATEGORIES = [
  "RENT",
  "PHONE",
  "CAR_INSURANCE",
  "GYM",
  "RENTAL",
  "STREAMING",
  "FINANCE",
  "EDUCATION",
  "OTHER",
] as const;

export type ContractCategory = (typeof CONTRACT_CATEGORIES)[number];

/** UI 표시용 카테고리 라벨 (9칸) */
export const CATEGORY_LABELS: Record<ContractCategory, string> = {
  RENT: "부동산",
  PHONE: "통신비",
  CAR_INSURANCE: "보험",
  GYM: "멤버십",
  RENTAL: "렌탈",
  STREAMING: "스트리밍",
  FINANCE: "금융/대출",
  EDUCATION: "교육",
  OTHER: "기타",
};

/** 카테고리 서브텍스트 (세부 예시, 한 줄에 하나씩) */
export const CATEGORY_SUBTITLES: Record<ContractCategory, string> = {
  RENT: "월세, 전세\n관리비",
  PHONE: "휴대폰\n인터넷",
  CAR_INSURANCE: "실손보험\n자동차보험\n종신보험",
  GYM: "쿠팡\n네이버\n배달의민족",
  RENTAL: "정수기\n공기청정기\n차량 리스",
  STREAMING: "Netflix\nYouTube\nDisney+",
  FINANCE: "적금 만기\n대출 이자",
  EDUCATION: "학원비\n온라인 강의",
  OTHER: "소프트웨어\n기부 정기후원",
};

/** 만료일 알림 일수 (장기계약) */
export const NOTIFY_DAYS_OPTIONS = [30, 7, 1] as const;
export type NotifyDaysBefore = (typeof NOTIFY_DAYS_OPTIONS)[number];

/** 월구독/월 지출 알림 일수 */
export const MONTHLY_NOTIFY_DAYS_OPTIONS = [7, 1] as const;
export type MonthlyNotifyDaysBefore = (typeof MONTHLY_NOTIFY_DAYS_OPTIONS)[number];

/** 카테고리 카드 배경색 (참고 이미지 팔레트: 틸/퍼플/옐로우오렌지/스카이블루/오렌지/핑크/라이트퍼플/시안 + 그린) */
export const CATEGORY_PASTEL: Record<ContractCategory, string> = {
  RENT: "#34D3BE",
  PHONE: "#44B2FF",
  CAR_INSURANCE: "#9762ED",
  GYM: "#FFC434",
  RENTAL: "#2ECCDB",
  STREAMING: "#A96BFF",
  FINANCE: "#FF7E44",
  EDUCATION: "#FF6295",
  OTHER: "#6BCB77",
};

/** 카테고리별 같은 계열 그림자용 (아래 끝 입체감용, 더 어두운 톤) */
export const CATEGORY_SHADOW: Record<ContractCategory, string> = {
  RENT: "#28a89a",
  PHONE: "#3692d9",
  CAR_INSURANCE: "#7a4fc4",
  GYM: "#d9a62b",
  RENTAL: "#25a8b5",
  STREAMING: "#8d52e6",
  FINANCE: "#e66a33",
  EDUCATION: "#e04d7a",
  OTHER: "#52a85e",
};

export interface Contract {
  id: string;
  user_id: string;
  title: string;
  category: ContractCategory;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  amount: number | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ContractInsert {
  user_id: string;
  title: string;
  category: ContractCategory;
  start_date: string;
  end_date: string;
  amount?: number | null;
  memo?: string | null;
}

export interface ContractUpdate {
  title?: string;
  category?: ContractCategory;
  start_date?: string;
  end_date?: string;
  amount?: number | null;
  memo?: string | null;
  deleted_at?: string | null;
}

export interface Notification {
  id: string;
  contract_id: string;
  notify_days_before: NotifyDaysBefore;
  is_sent: boolean;
  scheduled_date: string;
  created_at: string;
}

export interface NotificationInsert {
  contract_id: string;
  notify_days_before: NotifyDaysBefore;
  scheduled_date: string;
}
