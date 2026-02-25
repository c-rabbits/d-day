import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MissionList } from "@/components/mission-list";

/**
 * 미션 페이지. 계약 수·알림 여부는 MissionList가 클라이언트에서 /api/missions/status 로만 조회하므로
 * 서버는 인증만 확인해 부하를 줄임.
 */
export default async function MissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return <MissionList />;
}
