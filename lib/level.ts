/**
 * 레벨 1~100, XP 최대 999999 (100레벨 달성)
 * 초반 레벨은 빨리 오르고, 후반으로 갈수록 천천히 오르는 곡선 (지수 1.8)
 * 표기: 0 ~ 9999999 가능 (UI 표시용), 실제 XP 상한 999999
 */

const MAX_LEVEL = 100;
const MAX_XP = 999999;
const LEVEL_EXPONENT = 1.8; // 1보다 크면 초반 빠름, 후반 느림

/** 레벨 L에 도달하는 데 필요한 누적 XP (레벨 1 = 0, Lv.100 = 999999) */
const XP_FOR_LEVEL: number[] = (() => {
  const arr: number[] = [0];
  for (let L = 2; L <= MAX_LEVEL; L++) {
    const t = (L - 1) / (MAX_LEVEL - 1); // 0 ~ 1
    arr.push(Math.round(MAX_XP * Math.pow(t, LEVEL_EXPONENT)));
  }
  return arr;
})();

/** 현재 XP로 레벨 계산 (1~100) */
export function getLevelFromXP(xp: number): number {
  const clamped = Math.min(Math.max(0, Math.floor(xp)), MAX_XP);
  for (let L = MAX_LEVEL; L >= 1; L--) {
    if (clamped >= XP_FOR_LEVEL[L - 1]) return L;
  }
  return 1;
}

/** 해당 레벨에 도달하는 데 필요한 누적 XP */
export function getXPForLevel(level: number): number {
  if (level < 1) return 0;
  if (level >= MAX_LEVEL) return MAX_XP;
  return XP_FOR_LEVEL[level - 1];
}

/** 현재 레벨에서 다음 레벨까지 필요한 XP (진행률 계산용) */
export function getXPProgressInLevel(xp: number): { current: number; required: number; level: number } {
  const level = getLevelFromXP(xp);
  const currentInLevel = level >= MAX_LEVEL ? MAX_XP : xp - getXPForLevel(level);
  const requiredInLevel =
    level >= MAX_LEVEL ? 1 : getXPForLevel(level + 1) - getXPForLevel(level);
  return { current: currentInLevel, required: requiredInLevel, level };
}

export { MAX_LEVEL, MAX_XP, XP_FOR_LEVEL };

/**
 * 레벨 테이블 (1~100 전체, 누적 XP)
 * 공식: cumulativeXP(L) = round(999999 * ((L-1)/99)^1.8)
 */
export const LEVEL_TABLE: { level: number; cumulativeXP: number }[] = XP_FOR_LEVEL.map(
  (cumulativeXP, index) => ({ level: index + 1, cumulativeXP }),
);
