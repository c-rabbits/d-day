// D-Day 앱 공통 타입 (DB 스키마와 일치)

export const CONTRACT_CATEGORIES = [
  "RENT",
  "PHONE",
  "CAR_INSURANCE",
  "GYM",
  "RENTAL",
  "STREAMING",
  "OTHER",
] as const;

export type ContractCategory = (typeof CONTRACT_CATEGORIES)[number];

/** UI 표시용 카테고리 라벨 */
export const CATEGORY_LABELS: Record<ContractCategory, string> = {
  RENT: "월세·전세",
  PHONE: "휴대폰 약정",
  CAR_INSURANCE: "자동차 보험",
  GYM: "헬스장 멤버십",
  RENTAL: "렌탈",
  STREAMING: "스트리밍 구독",
  OTHER: "기타",
};

/** 알림 일수 옵션 */
export const NOTIFY_DAYS_OPTIONS = [30, 7, 1] as const;
export type NotifyDaysBefore = (typeof NOTIFY_DAYS_OPTIONS)[number];

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
