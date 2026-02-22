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

/** 카테고리 서브텍스트 (세부 예시) */
export const CATEGORY_SUBTITLES: Record<ContractCategory, string> = {
  RENT: "월세·전세, 대출 이자, 아파트 관리비",
  PHONE: "휴대폰 요금, 인터넷+IPTV",
  CAR_INSURANCE: "실손보험, 자동차보험, 종신보험",
  GYM: "쿠팡 / 네이버 등",
  RENTAL: "정수기 렌탈, 공기청정기 렌탈, 차량 리스",
  STREAMING: "Netflix, YouTube Premium, Disney+",
  FINANCE: "신용대출 이자, 주택담보대출 이자",
  EDUCATION: "학원비, 온라인 강의 구독",
  OTHER: "소프트웨어 구독, 기부 정기후원",
};

/** 만료일 알림 일수 (장기계약) */
export const NOTIFY_DAYS_OPTIONS = [30, 7, 1] as const;
export type NotifyDaysBefore = (typeof NOTIFY_DAYS_OPTIONS)[number];

/** 월구독/월 지출 알림 일수 */
export const MONTHLY_NOTIFY_DAYS_OPTIONS = [7, 1] as const;
export type MonthlyNotifyDaysBefore = (typeof MONTHLY_NOTIFY_DAYS_OPTIONS)[number];

/** 카테고리 카드 파스텔 배경색 (스트리밍은 별도 파스텔 톤) */
export const CATEGORY_PASTEL: Record<ContractCategory, string> = {
  RENT: "#F4A261",
  PHONE: "#ACE7FF",
  CAR_INSURANCE: "#E2BEF1",
  GYM: "#B5EAD7",
  RENTAL: "#FFEAA7",
  STREAMING: "#B8D4E3", // 다른 파스텔 톤 (연한 세룰리언)
  FINANCE: "#E8D5B7",
  EDUCATION: "#D4E5D4",
  OTHER: "#C7CEEA",
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
