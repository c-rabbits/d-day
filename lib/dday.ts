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

/** D-day 표시 문자열 (예: D-12, D-day, D+3) */
export function getDdayLabel(endDate: string): string {
  const d = getDday(endDate);
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-day";
  return `D+${Math.abs(d)}`;
}

/** D-day에 따른 텍스트 색상 클래스 (Tailwind) */
export function getDdayColorClass(endDate: string): string {
  const d = getDday(endDate);
  if (d <= 7) return "text-rose-600 dark:text-rose-400 font-semibold";
  if (d <= 30) return "text-amber-600 dark:text-amber-400";
  return "text-foreground";
}
