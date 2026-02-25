/**
 * 계약 메모에서 월구독/장기계약 메타데이터 파싱 및 표시용 메모 추출
 * 저장 형식: "사용자메모 / 월구독|지출일=15 / 알림=7,1일전" 또는 "사용자메모 / 월지출일=15 / ..."
 */

/** 메모에서 월 지출일(1-31) 추출. 월구독|지출일=N 또는 월지출일=N */
export function parsePaymentDayFromMemo(memo: string | null): number | null {
  if (!memo) return null;
  const subMatch = memo.match(/월구독\|지출일=(\d+)/);
  if (subMatch) {
    const n = parseInt(subMatch[1], 10);
    return n >= 1 && n <= 31 ? n : null;
  }
  const longMatch = memo.match(/월지출일=(\d+)/);
  if (longMatch) {
    const n = parseInt(longMatch[1], 10);
    return n >= 1 && n <= 31 ? n : null;
  }
  return null;
}

const META_PREFIXES = ["월구독|", "월지출일=", "알림=", "월지출알림="];

/** 상세/목록에 보여줄 메모만 반환 (메타데이터 제거) */
export function getDisplayMemo(memo: string | null): string | null {
  if (!memo) return null;
  const parts = memo.split(/\s*\/\s*/).filter((p) => {
    const t = p.trim();
    return t && !META_PREFIXES.some((pre) => t.startsWith(pre));
  });
  const joined = parts.join(" / ").trim();
  return joined || null;
}

/** 메모에서 월구독 알림 일수 추출 (알림=7,1일전 → [7, 1]) */
export function parseMonthlyNotifyFromMemo(memo: string | null): number[] {
  if (!memo) return [];
  const m = memo.match(/알림=([\d,]+)일전/);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && (n === 7 || n === 1));
}
