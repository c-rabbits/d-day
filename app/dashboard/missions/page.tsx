import { MissionList } from "@/components/mission-list";

/**
 * 미션 페이지. 인증은 middleware.ts에서 처리됨.
 */
export default function MissionsPage() {
  return <MissionList />;
}
