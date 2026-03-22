"use client";

/**
 * XP·미션 진행 저장소
 * - DB(Supabase)가 권위 소스, localStorage는 캐시
 * - 읽기: localStorage에서 동기적으로 (UI 즉시 반영)
 * - 쓰기: 서버 API -> 성공 시 localStorage 갱신
 */

const KEY_XP = "dday_xp";
const KEY_DAILY = "dday_daily"; // YYYY-MM-DD -> true
const KEY_ONETIME = "dday_onetime"; // JSON string array of mission ids
const KEY_MIGRATED = "dday_migrated"; // 마이그레이션 완료 플래그

const MAX_XP = 999999;

// ────────────────────────────────────────
// localStorage 읽기/쓰기 (캐시)
// ────────────────────────────────────────

function getStoredXP(): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(KEY_XP);
  const n = v ? parseInt(v, 10) : 0;
  return Number.isNaN(n) ? 0 : Math.min(Math.max(0, n), MAX_XP);
}

function setStoredXP(xp: number): void {
  if (typeof window === "undefined") return;
  const clamped = Math.min(Math.max(0, Math.floor(xp)), MAX_XP);
  localStorage.setItem(KEY_XP, String(clamped));
}

function getStoredDaily(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  const v = localStorage.getItem(KEY_DAILY);
  try {
    return v ? JSON.parse(v) : {};
  } catch {
    return {};
  }
}

function setStoredDaily(daily: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_DAILY, JSON.stringify(daily));
}

function getStoredOnetime(): string[] {
  if (typeof window === "undefined") return [];
  const v = localStorage.getItem(KEY_ONETIME);
  try {
    const arr = v ? JSON.parse(v) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function setStoredOnetime(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_ONETIME, JSON.stringify(ids));
}

// ────────────────────────────────────────
// 공개 읽기 API (동기, localStorage 캐시)
// ────────────────────────────────────────

export function getXP(): number {
  return getStoredXP();
}

export function isDailyDone(dateKey: string): boolean {
  return !!getStoredDaily()[dateKey];
}

export function isOnetimeDone(missionId: string): boolean {
  return getStoredOnetime().includes(missionId);
}

/**
 * 한국시간(Asia/Seoul) 자정 기준 오늘 날짜 키 (YYYY-MM-DD).
 */
export function getTodayKey(): string {
  const d = new Date();
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

// ────────────────────────────────────────
// 서버 동기화
// ────────────────────────────────────────

/**
 * DB에서 XP/미션 상태를 가져와 localStorage 캐시를 갱신한다.
 * 앱 마운트 시 1회 호출.
 */
export async function syncFromServer(): Promise<void> {
  try {
    // 마이그레이션 먼저 시도
    await migrateLocalDataToServer();

    // 대기 중인 추천 코드 처리
    await processPendingReferral();

    const res = await fetch("/api/xp");
    if (!res.ok) return;

    const data = await res.json() as {
      totalXp: number;
      completedOnetime: string[];
      dailyCompletedToday: boolean;
    };

    // localStorage 캐시 갱신
    setStoredXP(data.totalXp);
    setStoredOnetime(data.completedOnetime);

    if (data.dailyCompletedToday) {
      const todayKey = getTodayKey();
      const daily = getStoredDaily();
      daily[todayKey] = true;
      setStoredDaily(daily);
    }

    // UI 갱신 이벤트
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dday_xp_updated"));
    }
  } catch {
    // 오프라인이면 localStorage 캐시 유지
  }
}

/**
 * 미션 완료 (서버 검증 후 캐시 갱신)
 */
export async function completeMission(
  missionId: string,
): Promise<{ success: boolean; totalXp: number; error?: string }> {
  try {
    const res = await fetch("/api/missions/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      return { success: false, totalXp: getStoredXP(), error: err.error };
    }

    const data = await res.json() as {
      success: boolean;
      totalXp: number;
      missionId: string;
      xpAwarded: number;
    };

    // localStorage 캐시 갱신
    setStoredXP(data.totalXp);

    // 미션 완료 상태 캐시
    const mission = missionId;
    if (mission === "daily_check") {
      const daily = getStoredDaily();
      daily[getTodayKey()] = true;
      setStoredDaily(daily);
    } else {
      const arr = getStoredOnetime();
      if (!arr.includes(mission)) {
        arr.push(mission);
        setStoredOnetime(arr);
      }
    }

    // UI 갱신 이벤트
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dday_xp_updated"));
    }

    return { success: true, totalXp: data.totalXp };
  } catch {
    return { success: false, totalXp: getStoredXP(), error: "Network error" };
  }
}

// ────────────────────────────────────────
// localStorage -> DB 일회성 마이그레이션
// ────────────────────────────────────────

async function migrateLocalDataToServer(): Promise<void> {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY_MIGRATED) === "true") return;

  const localXp = getStoredXP();
  const localOnetime = getStoredOnetime();

  // 로컬에 데이터가 없으면 마이그레이션 불필요
  if (localXp === 0 && localOnetime.length === 0) {
    localStorage.setItem(KEY_MIGRATED, "true");
    return;
  }

  try {
    const res = await fetch("/api/xp/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalXp: localXp,
        completedOnetime: localOnetime,
      }),
    });

    if (res.ok) {
      localStorage.setItem(KEY_MIGRATED, "true");
    }
  } catch {
    // 실패 시 다음 로드에서 재시도
  }
}

// ────────────────────────────────────────
// 대기 중인 추천 코드 처리
// ────────────────────────────────────────

async function processPendingReferral(): Promise<void> {
  if (typeof window === "undefined") return;
  const code = localStorage.getItem("dday_pending_referral");
  if (!code) return;

  try {
    const res = await fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    // 성공이든 실패든 pending 제거 (재시도 방지)
    localStorage.removeItem("dday_pending_referral");

    if (res.ok) {
      // XP 갱신은 syncFromServer에서 처리됨
    }
  } catch {
    // 네트워크 오류 시 다음에 재시도
  }
}

// ────────────────────────────────────────
// 레거시 호환 (직접 호출 비권장, 내부 용도)
// ────────────────────────────────────────

/** @deprecated completeMission() 사용 권장 */
export function addXP(delta: number): number {
  const next = Math.min(getStoredXP() + Math.max(0, delta), MAX_XP);
  setStoredXP(next);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("dday_xp_updated"));
  return next;
}

/** @deprecated completeMission() 사용 권장 */
export function setDailyDone(dateKey: string): void {
  const d = getStoredDaily();
  d[dateKey] = true;
  setStoredDaily(d);
}

/** @deprecated completeMission() 사용 권장 */
export function setOnetimeDone(missionId: string): void {
  const arr = getStoredOnetime();
  if (!arr.includes(missionId)) {
    arr.push(missionId);
    setStoredOnetime(arr);
  }
}
