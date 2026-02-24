/**
 * 미션 정의: 데일리(출석체크), 1회성
 * 완료 시 XP 지급
 */

export type MissionType = "daily" | "one_time";

export type Mission = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  xpReward: number;
};

export const MISSIONS: Mission[] = [
  {
    id: "daily_check",
    title: "출석체크",
    description: "오늘 하루 출석을 완료하세요.",
    type: "daily",
    xpReward: 10,
  },
  {
    id: "first_contract",
    title: "첫 계약 등록",
    description: "계약을 1개 등록하세요.",
    type: "one_time",
    xpReward: 50,
  },
  {
    id: "three_contracts",
    title: "계약 3개 등록",
    description: "계약을 3개 등록하세요.",
    type: "one_time",
    xpReward: 100,
  },
  {
    id: "set_notification",
    title: "알림 설정하기",
    description: "계약에 알림을 설정하세요.",
    type: "one_time",
    xpReward: 30,
  },
  {
    id: "visit_settings",
    title: "설정 방문",
    description: "설정 페이지를 열어보세요.",
    type: "one_time",
    xpReward: 20,
  },
];
