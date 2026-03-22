/**
 * 뱃지(티어) 정의
 * 레벨 달성 시 자동 해금
 */

export type Badge = {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  bgColor: string;
  textColor: string;
  icon: string; // emoji
};

export const BADGES: Badge[] = [
  {
    id: "bronze",
    name: "브론즈",
    description: "레벨 20 달성",
    requiredLevel: 20,
    bgColor: "#CD7F32",
    textColor: "#fff",
    icon: "🥉",
  },
  {
    id: "silver",
    name: "실버",
    description: "레벨 40 달성",
    requiredLevel: 40,
    bgColor: "#C0C0C0",
    textColor: "#333",
    icon: "🥈",
  },
  {
    id: "gold",
    name: "골드",
    description: "레벨 60 달성",
    requiredLevel: 60,
    bgColor: "#FFC434",
    textColor: "#333",
    icon: "🥇",
  },
  {
    id: "platinum",
    name: "플래티넘",
    description: "레벨 80 달성",
    requiredLevel: 80,
    bgColor: "#E5E4E2",
    textColor: "#333",
    icon: "💎",
  },
  {
    id: "diamond",
    name: "다이아몬드",
    description: "레벨 100 달성",
    requiredLevel: 100,
    bgColor: "#B9F2FF",
    textColor: "#111",
    icon: "👑",
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
