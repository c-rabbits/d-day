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
    xpReward: 20,
  },
  {
    id: "first_contract",
    title: "첫 계약 등록",
    description: "계약을 1개 등록하세요.",
    type: "one_time",
    xpReward: 200,
  },
  {
    id: "three_contracts",
    title: "계약 3개 등록",
    description: "계약을 3개 등록하세요.",
    type: "one_time",
    xpReward: 700,
  },
  {
    id: "set_notification",
    title: "알림 설정하기",
    description: "계약에 알림을 설정하세요.",
    type: "one_time",
    xpReward: 1000,
  },
  {
    id: "invite_1",
    title: "첫 친구 초대",
    description: "친구 1명을 초대하세요.",
    type: "one_time",
    xpReward: 200,
  },
  {
    id: "invite_3",
    title: "친구 3명 초대",
    description: "친구 3명을 초대하세요.",
    type: "one_time",
    xpReward: 700,
  },
  {
    id: "invite_5",
    title: "친구 5명 초대",
    description: "친구 5명을 초대하세요.",
    type: "one_time",
    xpReward: 1000,
  },
  {
    id: "invite_10",
    title: "친구 10명 초대",
    description: "친구 10명을 초대하세요.",
    type: "one_time",
    xpReward: 1500,
  },
  {
    id: "invite_20",
    title: "친구 20명 초대",
    description: "친구 20명을 초대하세요.",
    type: "one_time",
    xpReward: 3000,
  },
  {
    id: "invite_30",
    title: "친구 30명 초대",
    description: "친구 30명을 초대하세요.",
    type: "one_time",
    xpReward: 5000,
  },
];
