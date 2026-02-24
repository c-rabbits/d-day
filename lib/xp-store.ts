"use client";

/**
 * XP·미션 진행 클라이언트 저장 (localStorage)
 * 표기: 0~9999999, 실제 XP 상한 999999
 */

const KEY_XP = "dday_xp";
const KEY_DAILY = "dday_daily"; // YYYY-MM-DD -> true
const KEY_ONETIME = "dday_onetime"; // JSON string array of mission ids

const MAX_XP = 999999;

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

export function getXP(): number {
  return getStoredXP();
}

export function addXP(delta: number): number {
  const next = Math.min(getStoredXP() + Math.max(0, delta), MAX_XP);
  setStoredXP(next);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("dday_xp_updated"));
  return next;
}

export function isDailyDone(dateKey: string): boolean {
  return !!getStoredDaily()[dateKey];
}

export function setDailyDone(dateKey: string): void {
  const d = getStoredDaily();
  d[dateKey] = true;
  setStoredDaily(d);
}

export function isOnetimeDone(missionId: string): boolean {
  return getStoredOnetime().includes(missionId);
}

export function setOnetimeDone(missionId: string): void {
  const arr = getStoredOnetime();
  if (!arr.includes(missionId)) {
    arr.push(missionId);
    setStoredOnetime(arr);
  }
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
