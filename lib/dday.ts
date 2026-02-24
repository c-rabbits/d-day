const SUBSCRIPTION_END_DATE = "9999-12-31";

/**
 * end_date(YYYY-MM-DD) 기준 D-day 계산
 * @returns 만료일까지 남은 일수. 오늘=0, 과거=음수
 */
export function getDday(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** 월구독 여부 (만료일이 9999-12-31이면 월구독) */
export function isSubscriptionContract(endDate: string): boolean {
  return endDate === SUBSCRIPTION_END_DATE;
}

/** 해당 월의 최대 일수 */
function getMaxDay(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 다음 월 지출일(해당 일자) 날짜 반환. 이미 지났으면 다음 달 */
export function getNextPaymentDate(paymentDay: number): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const y = today.getFullYear();
  const m = today.getMonth();
  const day = Math.min(paymentDay, getMaxDay(y, m));
  const thisMonth = new Date(y, m, day);
  thisMonth.setHours(0, 0, 0, 0);
  if (thisMonth.getTime() >= today.getTime()) return thisMonth;
  const nextMax = getMaxDay(y, m + 1);
  const nextDay = Math.min(paymentDay, nextMax);
  const nextMonth = new Date(y, m + 1, nextDay);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

/**
 * 월 지출일 기준 D-day (다음 지출일까지 남은 일수).
 * 달력 기준 해당 월/다음 달 결제일을 보고, D-day 지나면 다음 달로 리셋. D+ 없이 D-xx만 표시.
 */
export function getDdayForPaymentDay(paymentDay: number): number {
  const next = getNextPaymentDate(paymentDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = next.getTime() - today.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

/** D-day 표시 문자열 (예: D-12, D-day, D+3) */
export function getDdayLabel(endDate: string): string {
  const d = getDday(endDate);
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-day";
  return `D+${Math.abs(d)}`;
}

/** 월 지출일 기준 D-day 라벨 (항상 D-xx 또는 D-day, 리셋 후 다음 달 기준) */
export function getDdayLabelForPaymentDay(paymentDay: number): string {
  const d = getDdayForPaymentDay(paymentDay);
  if (d > 0) return `D-${d}`;
  return "D-day";
}

/** D-day에 따른 텍스트 색상 클래스 (Tailwind) */
export function getDdayColorClass(endDate: string): string {
  const d = getDday(endDate);
  if (d <= 7) return "text-rose-600 dark:text-rose-400 font-semibold";
  if (d <= 30) return "text-amber-600 dark:text-amber-400";
  return "text-foreground";
}
